// src/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/auth');

// Protected routes (require authentication)
router.post('/', authMiddleware.protect, BookingController.createBooking);
router.get('/my-bookings', authMiddleware.protect, BookingController.getMyBookings);
router.get('/stats', authMiddleware.protect, BookingController.getBookingStats);
router.get('/:id', authMiddleware.protect, BookingController.getBooking);
router.post('/:id/cancel', authMiddleware.protect, BookingController.cancelBooking);
router.post('/:id/payment-intent', authMiddleware.protect, BookingController.createPaymentIntent);
router.post('/:id/confirm-payment', authMiddleware.protect, BookingController.confirmPayment);

// Admin routes
router.get('/event/:eventId', authMiddleware.protect, authMiddleware.restrictTo('admin'), BookingController.getEventBookings);

module.exports = router;