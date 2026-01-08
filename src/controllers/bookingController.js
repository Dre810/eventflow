// src/controllers/bookingController.js
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const Payment = require('../models/Payment');
const { pool } = require('../config/database');

class BookingController {
    // Create booking
    static async createBooking(req, res) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            const { event_id, ticket_id, quantity = 1, notes } = req.body;
            const user_id = req.user.id;
            
            // Validation
            if (!event_id || !ticket_id) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Please provide event_id and ticket_id'
                });
            }
            
            // Check if event exists and is published
            const event = await Event.findById(event_id);
            if (!event || (!event.is_published && req.user.role !== 'admin')) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'Event not found or not available'
                });
            }
            
            // Check if ticket exists and belongs to event
            const ticket = await Ticket.findById(ticket_id);
            if (!ticket || ticket.event_id !== parseInt(event_id)) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Invalid ticket for this event'
                });
            }
            
            // Check ticket availability
            const isAvailable = await Ticket.isAvailable(ticket_id, quantity);
            if (!isAvailable) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Ticket not available or sold out'
                });
            }
            
            // Check event capacity
            const hasCapacity = await Event.hasCapacity(event_id, quantity);
            if (!hasCapacity) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Event has reached maximum capacity'
                });
            }
            
            // Calculate total amount
            const total_amount = ticket.price * quantity;
            
            // Create booking
            const booking = await Booking.create({
                user_id,
                event_id,
                ticket_id,
                quantity,
                total_amount,
                notes,
                status: 'pending' // Will be confirmed after payment
            });
            
            // Reserve tickets
            await Ticket.reserve(ticket_id, quantity);
            
            // Update event attendee count
            await Event.updateAttendeeCount(event_id, quantity);
            
            await connection.commit();
            
            res.status(201).json({
                success: true,
                message: 'Booking created successfully. Please complete payment.',
                data: {
                    booking,
                    payment_required: total_amount > 0,
                    amount: total_amount
                }
            });
            
        } catch (error) {
            await connection.rollback();
            console.error('Create booking error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        } finally {
            connection.release();
        }
    }
    
    // Get user's bookings
    static async getMyBookings(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            
            const result = await Booking.getByUser(req.user.id, page, limit);
            
            res.status(200).json({
                success: true,
                data: result.bookings,
                pagination: result.pagination
            });
            
        } catch (error) {
            console.error('Get bookings error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
    
    // Get single booking
    static async getBooking(req, res) {
        try {
            const booking = await Booking.findById(req.params.id);
            
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }
            
            // Check permission
            if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to view this booking'
                });
            }
            
            res.status(200).json({
                success: true,
                data: booking
            });
            
        } catch (error) {
            console.error('Get booking error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
    
    // Cancel booking
    static async cancelBooking(req, res) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            const bookingId = req.params.id;
            const booking = await Booking.findById(bookingId);
            
            if (!booking) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }
            
            // Check permission
            if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
                await connection.rollback();
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to cancel this booking'
                });
            }
            
            // Check if booking can be cancelled
            if (booking.status === 'cancelled') {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Booking is already cancelled'
                });
            }
            
            // Update booking status
            await Booking.updateStatus(bookingId, 'cancelled');
            
            // Release tickets
            await Ticket.release(booking.ticket_id, booking.quantity);
            
            // Update event attendee count
            await Event.updateAttendeeCount(booking.event_id, -booking.quantity);
            
            // If paid, handle refund (simplified - in real app, you'd process Stripe refund)
            if (booking.status === 'confirmed') {
                // Update payment status to refunded
                const [payments] = await connection.execute(
                    'SELECT id FROM payments WHERE booking_id = ?',
                    [bookingId]
                );
                
                if (payments.length > 0) {
                    await connection.execute(
                        'UPDATE payments SET status = "refunded" WHERE booking_id = ?',
                        [bookingId]
                    );
                }
            }
            
            await connection.commit();
            
            res.status(200).json({
                success: true,
                message: 'Booking cancelled successfully'
            });
            
        } catch (error) {
            await connection.rollback();
            console.error('Cancel booking error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        } finally {
            connection.release();
        }
    }
    
    // Create payment intent for booking
    static async createPaymentIntent(req, res) {
        try {
            const bookingId = req.params.id;
            const booking = await Booking.findById(bookingId);
            
            if (!booking) {
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }
            
            // Check permission
            if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to pay for this booking'
                });
            }
            
            // Check if booking is already paid
            if (booking.status === 'confirmed') {
                return res.status(400).json({
                    success: false,
                    message: 'Booking is already confirmed'
                });
            }
            
            // Check if booking is free
            if (booking.total_amount <= 0) {
                // Auto-confirm free bookings
                await Booking.updateStatus(bookingId, 'confirmed');
                
                return res.status(200).json({
                    success: true,
                    message: 'Free booking confirmed successfully',
                    data: { free: true }
                });
            }
            
            // Create Stripe payment intent
            const paymentIntent = await Payment.createStripePaymentIntent(
                booking.total_amount,
                'usd',
                {
                    booking_id: bookingId,
                    booking_reference: booking.booking_reference,
                    user_id: req.user.id,
                    user_email: req.user.email
                }
            );
            
            res.status(200).json({
                success: true,
                data: paymentIntent
            });
            
        } catch (error) {
            console.error('Create payment intent error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
    
    // Confirm payment
    static async confirmPayment(req, res) {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            const { paymentIntentId } = req.body;
            const bookingId = req.params.id;
            
            if (!paymentIntentId) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Please provide paymentIntentId'
                });
            }
            
            // Verify Stripe payment
            const paymentResult = await Payment.verifyStripePayment(paymentIntentId);
            
            if (!paymentResult.success) {
                await connection.rollback();
                return res.status(400).json({
                    success: false,
                    message: 'Payment verification failed',
                    data: paymentResult
                });
            }
            
            // Get booking
            const booking = await Booking.findById(bookingId);
            if (!booking) {
                await connection.rollback();
                return res.status(404).json({
                    success: false,
                    message: 'Booking not found'
                });
            }
            
            // Create payment record
            const payment = await Payment.create({
                booking_id: bookingId,
                user_id: req.user.id,
                amount: paymentResult.amount,
                currency: paymentResult.currency,
                stripe_payment_id: paymentIntentId,
                stripe_customer_id: paymentResult.customer,
                payment_method: 'card',
                status: 'succeeded',
                receipt_url: paymentResult.receipt_url
            });
            
            // Update booking status
            await Booking.updateStatus(bookingId, 'confirmed');
            
            await connection.commit();
            
            res.status(200).json({
                success: true,
                message: 'Payment confirmed and booking completed',
                data: {
                    booking,
                    payment
                }
            });
            
        } catch (error) {
            await connection.rollback();
            console.error('Confirm payment error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        } finally {
            connection.release();
        }
    }
    
    // Get booking statistics
    static async getBookingStats(req, res) {
        try {
            const stats = await Booking.getUserStats(req.user.id);
            
            res.status(200).json({
                success: true,
                data: stats
            });
            
        } catch (error) {
            console.error('Get booking stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
    
    // Admin: Get all bookings for an event
    static async getEventBookings(req, res) {
        try {
            // Check if user is admin or event organizer
            const eventId = req.params.eventId;
            const event = await Event.findById(eventId);
            
            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found'
                });
            }
            
            if (req.user.role !== 'admin' && req.user.id !== event.organizer_id) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to view these bookings'
                });
            }
            
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 20;
            
            const result = await Booking.getByEvent(eventId, page, limit);
            
            res.status(200).json({
                success: true,
                data: result.bookings,
                pagination: result.pagination
            });
            
        } catch (error) {
            console.error('Get event bookings error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
}

module.exports = BookingController;