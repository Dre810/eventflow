// src/controllers/eventController.js
const { pool } = require('../config/database');
const Event = require('../models/Event');

class EventController {
    // Create event (Admin only)
    static async createEvent(req, res) {
        try {
            const {
                title,
                description,
                short_description,
                category,
                venue,
                address,
                city,
                country,
                start_date,
                end_date,
                max_attendees,
                price,
                is_free,
                is_featured,
                is_published
            } = req.body;
            
            // Validation
            if (!title || !description || !venue || !start_date || !end_date) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide title, description, venue, start date and end date'
                });
            }
            
            // Create event
            const event = await Event.create({
                title,
                description,
                short_description: short_description || description.substring(0, 200),
                category: category || 'General',
                venue,
                address,
                city,
                country,
                start_date,
                end_date,
                max_attendees: max_attendees || 100,
                price: price || 0,
                is_free: is_free || (price === 0),
                is_featured: is_featured || false,
                is_published: is_published !== undefined ? is_published : true,
                organizer_id: req.user.id
            });
            
            res.status(201).json({
                success: true,
                message: 'Event created successfully',
                data: event
            });
            
        } catch (error) {
            console.error('Create event error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
    
    // Get all events (public)
    static async getEvents(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const filters = {};
            
            // Apply filters from query
            if (req.query.category) filters.category = req.query.category;
            if (req.query.is_featured) filters.is_featured = req.query.is_featured === 'true';
            if (req.query.organizer_id) filters.organizer_id = parseInt(req.query.organizer_id);
            if (req.query.start_date_from) filters.start_date_from = req.query.start_date_from;
            if (req.query.start_date_to) filters.start_date_to = req.query.start_date_to;
            
            // For non-admin users, only show published events
            if (req.user && req.user.role === 'user') {
                filters.user_id = req.user.id;
            } else if (!req.user || req.user.role === 'user') {
                filters.public = true;
            }
            
            const result = await Event.getAll(filters, page, limit);
            
            res.status(200).json({
                success: true,
                data: result.events,
                pagination: result.pagination
            });
            
        } catch (error) {
            console.error('Get events error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
    
    // Get single event
    static async getEvent(req, res) {
        try {
            const event = await Event.findById(req.params.id);
            
            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found'
                });
            }
            
            // Check if user can view unpublished event
            if (!event.is_published && 
                (!req.user || (req.user.role === 'user' && req.user.id !== event.organizer_id))) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to view this event'
                });
            }
            
            res.status(200).json({
                success: true,
                data: event
            });
            
        } catch (error) {
            console.error('Get event error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
    
    // Update event (Admin/Organizer only)
    static async updateEvent(req, res) {
        try {
            const eventId = req.params.id;
            const event = await Event.findById(eventId);
            
            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found'
                });
            }
            
            // Check permission
            if (req.user.role !== 'admin' && req.user.id !== event.organizer_id) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to update this event'
                });
            }
            
            const updates = req.body;
            const updatedEvent = await Event.update(eventId, updates);
            
            res.status(200).json({
                success: true,
                message: 'Event updated successfully',
                data: updatedEvent
            });
            
        } catch (error) {
            console.error('Update event error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
    
    // Delete event (Admin/Organizer only)
    static async deleteEvent(req, res) {
        try {
            const eventId = req.params.id;
            const event = await Event.findById(eventId);
            
            if (!event) {
                return res.status(404).json({
                    success: false,
                    message: 'Event not found'
                });
            }
            
            // Check permission
            if (req.user.role !== 'admin' && req.user.id !== event.organizer_id) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to delete this event'
                });
            }
            
            await Event.delete(eventId);
            
            res.status(200).json({
                success: true,
                message: 'Event deleted successfully'
            });
            
        } catch (error) {
            console.error('Delete event error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
    
    // Get featured events (public)
    static async getFeaturedEvents(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 3;
            const events = await Event.getFeatured(limit);
            
            res.status(200).json({
                success: true,
                data: events
            });
            
        } catch (error) {
            console.error('Get featured events error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
    
    // Get upcoming events (public)
    static async getUpcomingEvents(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 6;
            const events = await Event.getUpcoming(limit);
            
            res.status(200).json({
                success: true,
                data: events
            });
            
        } catch (error) {
            console.error('Get upcoming events error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
    
    // Get events by organizer (public)
    static async getEventsByOrganizer(req, res) {
        try {
            const organizerId = req.params.organizerId;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            
            // For non-admin users, only show published events
            const filters = { organizer_id: organizerId };
            if (req.user && req.user.role === 'user') {
                filters.user_id = req.user.id;
            } else if (!req.user || req.user.role === 'user') {
                filters.public = true;
            }
            
            const result = await Event.getAll(filters, page, limit);
            
            res.status(200).json({
                success: true,
                data: result.events,
                pagination: result.pagination
            });
            
        } catch (error) {
            console.error('Get events by organizer error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
    
    // Get event categories (public)
    static async getCategories(req, res) {
        try {
            const [rows] = await pool.execute(
                'SELECT DISTINCT category FROM events WHERE is_published = TRUE ORDER BY category'
            );
            
            const categories = rows.map(row => row.category).filter(Boolean);
            
            res.status(200).json({
                success: true,
                data: categories
            });
            
        } catch (error) {
            console.error('Get categories error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
}

module.exports = EventController;