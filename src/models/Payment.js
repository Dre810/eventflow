// src/models/Payment.js
const { pool } = require('../config/database');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class Payment {
    // Create payment record
    static async create(paymentData) {
        const {
            booking_id,
            user_id,
            amount,
            currency = 'USD',
            stripe_payment_id,
            stripe_customer_id,
            payment_method,
            status = 'pending',
            receipt_url
        } = paymentData;
        
        const [result] = await pool.execute(
            `INSERT INTO payments (booking_id, user_id, amount, currency, stripe_payment_id, stripe_customer_id, payment_method, status, receipt_url, paid_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [booking_id, user_id, amount, currency, stripe_payment_id, stripe_customer_id, payment_method, status, receipt_url, status === 'succeeded' ? new Date() : null]
        );
        
        return this.findById(result.insertId);
    }
    
    // Find payment by ID
    static async findById(id) {
        const [rows] = await pool.execute(
            `SELECT p.*, 
                    b.booking_reference,
                    u.name as user_name,
                    e.title as event_title
             FROM payments p
             JOIN bookings b ON p.booking_id = b.id
             JOIN users u ON p.user_id = u.id
             JOIN events e ON b.event_id = e.id
             WHERE p.id = ?`,
            [id]
        );
        return rows[0] || null;
    }
    
    // Find payment by Stripe payment ID
    static async findByStripeId(stripePaymentId) {
        const [rows] = await pool.execute(
            'SELECT * FROM payments WHERE stripe_payment_id = ?',
            [stripePaymentId]
        );
        return rows[0] || null;
    }
    
    // Update payment status
    static async updateStatus(id, status) {
        const updates = { status };
        if (status === 'succeeded') {
            updates.paid_at = new Date();
        }
        
        return await this.update(id, updates);
    }
    
    // Update payment
    static async update(id, updates) {
        const fields = [];
        const values = [];
        
        for (const [key, value] of Object.entries(updates)) {
            if (value !== undefined) {
                fields.push(`${key} = ?`);
                values.push(value);
            }
        }
        
        if (fields.length === 0) return this.findById(id);
        
        values.push(id);
        const query = `UPDATE payments SET ${fields.join(', ')} WHERE id = ?`;
        
        await pool.execute(query, values);
        return this.findById(id);
    }
    
    // Get payments by user
    static async getByUser(userId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        
        const [rows] = await pool.execute(
            `SELECT p.*, 
                    b.booking_reference,
                    e.title as event_title
             FROM payments p
             JOIN bookings b ON p.booking_id = b.id
             JOIN events e ON b.event_id = e.id
             WHERE p.user_id = ?
             ORDER BY p.created_at DESC
             LIMIT ? OFFSET ?`,
            [userId, limit, offset]
        );
        
        const [countResult] = await pool.execute(
            'SELECT COUNT(*) as total FROM payments WHERE user_id = ?',
            [userId]
        );
        
        const total = countResult[0].total;
        
        return {
            payments: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
    
    // Create Stripe payment intent
    static async createStripePaymentIntent(amount, currency = 'usd', metadata = {}) {
        try {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(amount * 100), // Convert to cents
                currency,
                metadata,
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            
            return {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                amount: paymentIntent.amount / 100 // Convert back to dollars
            };
        } catch (error) {
            console.error('Stripe payment intent error:', error);
            throw error;
        }
    }
    
    // Verify Stripe payment
    static async verifyStripePayment(paymentIntentId) {
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            
            return {
                success: paymentIntent.status === 'succeeded',
                status: paymentIntent.status,
                amount: paymentIntent.amount / 100,
                currency: paymentIntent.currency,
                receipt_url: paymentIntent.charges?.data[0]?.receipt_url,
                customer: paymentIntent.customer
            };
        } catch (error) {
            console.error('Stripe verification error:', error);
            throw error;
        }
    }
    
    // Create Stripe checkout session
    static async createCheckoutSession(bookingDetails) {
        try {
            const { booking_reference, amount, event_title, user_email } = bookingDetails;
            
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: [
                    {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: `Booking: ${event_title}`,
                                description: `Booking Reference: ${booking_reference}`,
                            },
                            unit_amount: Math.round(amount * 100),
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${process.env.FRONTEND_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/booking/cancel`,
                customer_email: user_email,
                metadata: {
                    booking_reference,
                    type: 'event_booking'
                },
            });
            
            return {
                sessionId: session.id,
                url: session.url
            };
        } catch (error) {
            console.error('Stripe checkout session error:', error);
            throw error;
        }
    }
}

module.exports = Payment;