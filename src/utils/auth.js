// src/utils/auth.js
const jwt = require('jsonwebtoken');
require('dotenv').config();

class AuthUtils {
    // Generate JWT token
    static generateToken(user) {
        return jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );
    }
    
    // Verify JWT token
    static verifyToken(token) {
        try {
            return jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            return null;
        }
    }
    
    // Generate password reset token
    static generateResetToken() {
        return require('crypto').randomBytes(32).toString('hex');
    }
    
    // Hash token for password reset
    static hashToken(token) {
        return require('crypto')
            .createHash('sha256')
            .update(token)
            .digest('hex');
    }
}

module.exports = AuthUtils;