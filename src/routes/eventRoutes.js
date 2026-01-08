// src/routes/eventRoutes.js
const express = require('express');
const router = express.Router();
const EventController = require('../controllers/eventController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.get('/', EventController.getEvents);
router.get('/featured', EventController.getFeaturedEvents);
router.get('/upcoming', EventController.getUpcomingEvents);
router.get('/categories', EventController.getCategories);
router.get('/organizer/:organizerId', EventController.getEventsByOrganizer);
router.get('/:id', EventController.getEvent);

// Protected routes (require authentication)
router.post('/', authMiddleware.protect, authMiddleware.restrictTo('admin'), EventController.createEvent);
router.put('/:id', authMiddleware.protect, EventController.updateEvent);
router.delete('/:id', authMiddleware.protect, EventController.deleteEvent);

module.exports = router;