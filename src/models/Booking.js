// src/models/Booking.js
const { pool } = require('../config/database');
const crypto = require('crypto');

class Booking {
    // Generate unique booking reference
    static generateBookingReference() {
        return 'BK-' + crypto.randomBytes(4).toString('hex').toUpperCase() + '-' + Date.now().toString().slice(-6);
    }
    
    // Create new booking
    static async create(bookingData) {
        const {
            user_id,
            event_id,
            ticket_id,
            quantity = 1,
            total_amount,
            status = 'pending',
            notes
        } = bookingData;
        
        const booking_reference = this.generateBookingReference();
        
        const [result] = await pool.execute(
            `INSERT INTO bookings (user_id, event_id, ticket_id, quantity, total_amount, booking_reference, status, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [user_id, event_id, ticket_id, quantity, total_amount, booking_reference, status, notes]
        );
        
        return this.findById(result.insertId);
    }
    
    // Find booking by ID
    static async findById(id) {
        const [rows] = await pool.execute(
            `SELECT b.*, 
                    u.name as user_name, u.email as user_email,
                    e.title as event_title, e.start_date as event_start,
                    t.name as ticket_name, t.price as ticket_price
             FROM bookings b
             JOIN users u ON b.user_id = u.id
             JOIN events e ON b.event_id = e.id
             JOIN tickets t ON b.ticket_id = t.id
             WHERE b.id = ?`,
            [id]
        );
        return rows[0] || null;
    }
    
    // Find booking by reference
    static async findByReference(reference) {
        const [rows] = await pool.execute(
            `SELECT b.*, 
                    u.name as user_name, u.email as user_email,
                    e.title as event_title, e.start_date as event_start,
                    t.name as ticket_name, t.price as ticket_price
             FROM bookings b
             JOIN users u ON b.user_id = u.id
             JOIN events e ON b.event_id = e.id
             JOIN tickets t ON b.ticket_id = t.id
             WHERE b.booking_reference = ?`,
            [reference]
        );
        return rows[0] || null;
    }
    
    // Get all bookings for a user
    static async getByUser(userId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        
        const [rows] = await pool.execute(
            `SELECT b.*, 
                    e.title as event_title, e.start_date as event_start, e.image_url as event_image,
                    t.name as ticket_name
             FROM bookings b
             JOIN events e ON b.event_id = e.id
             JOIN tickets t ON b.ticket_id = t.id
             WHERE b.user_id = ?
             ORDER BY b.created_at DESC
             LIMIT ? OFFSET ?`,
            [userId, limit, offset]
        );
        
        const [countResult] = await pool.execute(
            'SELECT COUNT(*) as total FROM bookings WHERE user_id = ?',
            [userId]
        );
        
        const total = countResult[0].total;
        
        return {
            bookings: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
    
    // Get all bookings for an event (admin/organizer)
    static async getByEvent(eventId, page = 1, limit = 20) {
        const offset = (page - 1) * limit;
        
        const [rows] = await pool.execute(
            `SELECT b.*, 
                    u.name as user_name, u.email as user_email,
                    t.name as ticket_name
             FROM bookings b
             JOIN users u ON b.user_id = u.id
             JOIN tickets t ON b.ticket_id = t.id
             WHERE b.event_id = ?
             ORDER BY b.created_at DESC
             LIMIT ? OFFSET ?`,
            [eventId, limit, offset]
        );
        
        const [countResult] = await pool.execute(
            'SELECT COUNT(*) as total FROM bookings WHERE event_id = ?',
            [eventId]
        );
        
        const total = countResult[0].total;
        
        return {
            bookings: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
    
    // Update booking status
    static async updateStatus(id, status) {
        await pool.execute(
            'UPDATE bookings SET status = ? WHERE id = ?',
            [status, id]
        );
        
        // If cancelled, release tickets
        if (status === 'cancelled') {
            const booking = await this.findById(id);
            if (booking) {
                // We'll handle ticket release in controller
            }
        }
        
        return this.findById(id);
    }
    
    // Update booking
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
        const query = `UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`;
        
        await pool.execute(query, values);
        return this.findById(id);
    }
    
    // Mark booking as attended
    static async markAttended(id) {
        await pool.execute(
            'UPDATE bookings SET attended = TRUE, checkin_time = NOW() WHERE id = ?',
            [id]
        );
        return this.findById(id);
    }
    
    // Get booking statistics for user
    static async getUserStats(userId) {
        const [result] = await pool.execute(
            `SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
                SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
                SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
                SUM(CASE WHEN attended = TRUE THEN 1 ELSE 0 END) as attended
             FROM bookings WHERE user_id = ?`,
            [userId]
        );
        
        return result[0];
    }
}

module.exports = Booking;