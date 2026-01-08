// src/models/User.js
const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    // Create new user
    static async create(userData) {
        const { name, email, password, role = 'user', phone } = userData;
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await pool.execute(
            `INSERT INTO users (name, email, password, role, phone) 
             VALUES (?, ?, ?, ?, ?)`,
            [name, email, hashedPassword, role, phone]
        );
        
        return this.findById(result.insertId);
    }
    
    // Find user by ID
    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT id, name, email, role, phone, avatar, is_active, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0] || null;
    }
    
    // Find user by email
    static async findByEmail(email) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0] || null;
    }
    
    // Update user
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
        const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        
        await pool.execute(query, values);
        return this.findById(id);
    }
    
    // Verify password
    static async verifyPassword(email, password) {
        const user = await this.findByEmail(email);
        if (!user) return false;
        
        return await bcrypt.compare(password, user.password);
    }
    
    // Get all users (for admin)
    static async getAll(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const [rows] = await pool.execute(
            'SELECT id, name, email, role, phone, avatar, is_active, created_at FROM users LIMIT ? OFFSET ?',
            [limit, offset]
        );
        
        const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM users');
        const total = countResult[0].total;
        
        return {
            users: rows,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        };
    }
    
    // Delete user (soft delete)
    static async delete(id) {
        return await this.update(id, { is_active: false });
    }
}

module.exports = User;