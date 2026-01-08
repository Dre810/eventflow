// src/models/Event.js
const { pool } = require('../config/database');

class Event {
    // Create new event
    static async create(eventData) {
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
            image_url,
            thumbnail_url,
            max_attendees = 100,
            price = 0,
            is_free = false,
            is_featured = false,
            is_published = true,
            organizer_id
        } = eventData;
        
        const [result] = await pool.execute(
            `INSERT INTO events (
                title, description, short_description, category, venue, address,
                city, country, start_date, end_date, image_url, thumbnail_url,
                max_attendees, price, is_free, is_featured, is_published, organizer_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                title, description, short_description, category, venue, address,
                city, country, start_date, end_date, image_url, thumbnail_url,
                max_attendees, price, is_free, is_featured, is_published, organizer_id
            ]
        );
        
        return this.findById(result.insertId);
    }
    
    // Find event by ID
    static async findById(id) {
        const [rows] = await pool.execute(
            `SELECT e.*, u.name as organizer_name, u.email as organizer_email 
             FROM events e 
             LEFT JOIN users u ON e.organizer_id = u.id 
             WHERE e.id = ?`,
            [id]
        );
        return rows[0] || null;
    }
    
    // Get all events with filters
    static async getAll(filters = {}, page = 1, limit = 10) {
        let query = `SELECT e.*, u.name as organizer_name FROM events e LEFT JOIN users u ON e.organizer_id = u.id WHERE 1=1`;
        const values = [];
        
        // Apply filters
        if (filters.category) {
            query += ' AND e.category = ?';
            values.push(filters.category);
        }
        
        if (filters.is_featured !== undefined) {
            query += ' AND e.is_featured = ?';
            values.push(filters.is_featured);
        }
        
        if (filters.is_published !== undefined) {
            query += ' AND e.is_published = ?';
            values.push(filters.is_published);
        }
        
        if (filters.organizer_id) {
            query += ' AND e.organizer_id = ?';
            values.push(filters.organizer_id);
        }
        
        if (filters.start_date_from) {
            query += ' AND e.start_date >= ?';
            values.push(filters.start_date_from);
        }
        
        if (filters.start_date_to) {
            query += ' AND e.start_date <= ?';
            values.push(filters.start_date_to);
        }
        
        // For users, only show published events unless they're the organizer
        if (filters.user_id) {
            query += ' AND (e.is_published = TRUE OR e.organizer_id = ?)';
            values.push(filters.user_id);
        } else if (filters.public === true) {
            query += ' AND e.is_published = TRUE';
        }
        
        // Order by start date (upcoming first)
        query += ' ORDER BY e.start_date ASC';
        
        // Add pagination
        const offset = (page - 1) * limit;
        query += ' LIMIT ? OFFSET ?';
        values.push(limit, offset);
        
        const [rows] = await pool.execute(query, values);
        
        // Get total count
        let countQuery = `SELECT COUNT(*) as total FROM events e WHERE 1=1`;
        const countValues = values.slice(0, -2); // Remove limit and offset
        
        filters.category && countValues.push(filters.category);
        filters.is_featured !== undefined && countValues.push(filters.is_featured);
        filters.is_published !== undefined && countValues.push(filters.is_published);
        filters.organizer_id && countValues.push(filters.organizer_id);
        filters.start_date_from && countValues.push(filters.start_date_from);
        filters.start_date_to && countValues.push(filters.start_date_to);
        
        if (filters.user_id) {
            countQuery += ' AND (e.is_published = TRUE OR e.organizer_id = ?)';
            countValues.push(filters.user_id);
        } else if (filters.public === true) {
            countQuery += ' AND e.is_published = TRUE';
        }
        
        const [countResult] = await pool.execute(countQuery, countValues);
        const total = countResult[0].total;
        
        return {
            events: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
    
    // Update event
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
        const query = `UPDATE events SET ${fields.join(', ')} WHERE id = ?`;
        
        await pool.execute(query, values);
        return this.findById(id);
    }
    
    // Delete event
    static async delete(id) {
        await pool.execute('DELETE FROM events WHERE id = ?', [id]);
        return true;
    }
    
    // Get upcoming events
    static async getUpcoming(limit = 6) {
        const [rows] = await pool.execute(
            `SELECT e.*, u.name as organizer_name 
             FROM events e 
             LEFT JOIN users u ON e.organizer_id = u.id 
             WHERE e.is_published = TRUE AND e.start_date > NOW()
             ORDER BY e.start_date ASC 
             LIMIT ?`,
            [limit]
        );
        return rows;
    }
    
    // Get featured events
    static async getFeatured(limit = 3) {
        const [rows] = await pool.execute(
            `SELECT e.*, u.name as organizer_name 
             FROM events e 
             LEFT JOIN users u ON e.organizer_id = u.id 
             WHERE e.is_published = TRUE AND e.is_featured = TRUE AND e.start_date > NOW()
             ORDER BY e.start_date ASC 
             LIMIT ?`,
            [limit]
        );
        return rows;
    }
    
    // Get events by organizer
    static async getByOrganizer(organizerId, page = 1, limit = 10) {
        return await this.getAll({ organizer_id: organizerId }, page, limit);
    }
    
    // Update attendee count
    static async updateAttendeeCount(eventId, change) {
        await pool.execute(
            'UPDATE events SET current_attendees = current_attendees + ? WHERE id = ?',
            [change, eventId]
        );
        return this.findById(eventId);
    }
    
    // Check if event has capacity
    static async hasCapacity(eventId, quantity = 1) {
        const event = await this.findById(eventId);
        if (!event) return false;
        
        return (event.current_attendees + quantity) <= event.max_attendees;
    }
}

module.exports = Event;