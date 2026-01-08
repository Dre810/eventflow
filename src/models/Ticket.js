// src/models/Ticket.js
const { pool } = require('../config/database');

class Ticket {
    // Create new ticket for an event
    static async create(ticketData) {
        const {
            event_id,
            name,
            description,
            price,
            quantity,
            sale_start,
            sale_end,
            is_active = true
        } = ticketData;
        
        const [result] = await pool.execute(
            `INSERT INTO tickets (event_id, name, description, price, quantity, available_quantity, sale_start, sale_end, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [event_id, name, description, price, quantity, quantity, sale_start, sale_end, is_active]
        );
        
        return this.findById(result.insertId);
    }
    
    // Find ticket by ID
    static async findById(id) {
        const [rows] = await pool.execute(
            `SELECT t.*, e.title as event_title 
             FROM tickets t 
             JOIN events e ON t.event_id = e.id 
             WHERE t.id = ?`,
            [id]
        );
        return rows[0] || null;
    }
    
    // Get all tickets for an event
    static async getByEvent(eventId, includeInactive = false) {
        let query = `SELECT * FROM tickets WHERE event_id = ?`;
        const values = [eventId];
        
        if (!includeInactive) {
            query += ' AND is_active = TRUE';
        }
        
        query += ' ORDER BY price ASC';
        
        const [rows] = await pool.execute(query, values);
        return rows;
    }
    
    // Update ticket
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
        const query = `UPDATE tickets SET ${fields.join(', ')} WHERE id = ?`;
        
        await pool.execute(query, values);
        return this.findById(id);
    }
    
    // Delete ticket
    static async delete(id) {
        await pool.execute('DELETE FROM tickets WHERE id = ?', [id]);
        return true;
    }
    
    // Check if ticket is available for purchase
    static async isAvailable(ticketId, quantity = 1) {
        const ticket = await this.findById(ticketId);
        if (!ticket || !ticket.is_active) return false;
        
        // Check sale period
        const now = new Date();
        if (ticket.sale_start && new Date(ticket.sale_start) > now) return false;
        if (ticket.sale_end && new Date(ticket.sale_end) < now) return false;
        
        // Check quantity
        return ticket.available_quantity >= quantity;
    }
    
    // Reserve tickets (reduce available quantity)
    static async reserve(ticketId, quantity) {
        const ticket = await this.findById(ticketId);
        if (!ticket) throw new Error('Ticket not found');
        
        if (ticket.available_quantity < quantity) {
            throw new Error('Not enough tickets available');
        }
        
        await pool.execute(
            'UPDATE tickets SET available_quantity = available_quantity - ? WHERE id = ?',
            [quantity, ticketId]
        );
        
        return this.findById(ticketId);
    }
    
    // Release tickets (increase available quantity - for cancellations)
    static async release(ticketId, quantity) {
        await pool.execute(
            'UPDATE tickets SET available_quantity = available_quantity + ? WHERE id = ?',
            [quantity, ticketId]
        );
        
        return this.findById(ticketId);
    }
    
    // Get ticket price
    static async getPrice(ticketId) {
        const ticket = await this.findById(ticketId);
        return ticket ? ticket.price : 0;
    }
}

module.exports = Ticket;