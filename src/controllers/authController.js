// src/controllers/authController.js
const User = require('../models/User');
const AuthUtils = require('../utils/auth');
const { pool } = require('../config/database');

class AuthController {
    // Register new user
    static async register(req, res) {
        try {
            const { name, email, password, phone } = req.body;
            
            // Validation
            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide name, email and password'
                });
            }
            
            // Check if user already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User already exists with this email'
                });
            }
            
            // Create user
            const user = await User.create({
                name,
                email,
                password,
                phone
            });
            
            // Generate token
            const token = AuthUtils.generateToken(user);
            
            // Remove password from response
            delete user.password;
            
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user,
                    token
                }
            });
            
        } catch (error) {
            console.error('Register error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
    
    // Login user
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            
            // Validation
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide email and password'
                });
            }
            
            // Check if user exists and verify password
            const user = await User.findByEmail(email);
            if (!user || !(await User.verifyPassword(email, password))) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }
            
            // Check if user is active
            if (!user.is_active) {
                return res.status(401).json({
                    success: false,
                    message: 'Account is deactivated'
                });
            }
            
            // Generate token
            const token = AuthUtils.generateToken(user);
            
            // Remove password from response
            delete user.password;
            
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user,
                    token
                }
            });
            
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
    
    // Get current user profile
    static async getProfile(req, res) {
        try {
            const user = await User.findById(req.user.id);
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }
            
            res.status(200).json({
                success: true,
                data: user
            });
            
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
    
    // Update user profile
    static async updateProfile(req, res) {
        try {
            const { name, phone } = req.body;
            const updates = {};
            
            if (name) updates.name = name;
            if (phone) updates.phone = phone;
            
            const user = await User.update(req.user.id, updates);
            
            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: user
            });
            
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
    
    // Change password
    static async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            
            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide current and new password'
                });
            }
            
            // Verify current password
            const user = await User.findByEmail(req.user.email);
            if (!user || !(await User.verifyPassword(req.user.email, currentPassword))) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }
            
            // Update password
            const hashedPassword = await require('bcryptjs').hash(newPassword, 10);
            await pool.execute(
                'UPDATE users SET password = ? WHERE id = ?',
                [hashedPassword, req.user.id]
            );
            
            res.status(200).json({
                success: true,
                message: 'Password changed successfully'
            });
            
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
    
    // Forgot password
    static async forgotPassword(req, res) {
        try {
            const { email } = req.body;
            
            if (!email) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide email'
                });
            }
            
            const user = await User.findByEmail(email);
            if (!user) {
                // Don't reveal that user doesn't exist for security
                return res.status(200).json({
                    success: true,
                    message: 'If a user exists with this email, a reset link will be sent'
                });
            }
            
            // Generate reset token
            const resetToken = AuthUtils.generateResetToken();
            const hashedToken = AuthUtils.hashToken(resetToken);
            
            // Set expiry (1 hour from now)
            const expiresAt = new Date(Date.now() + 3600000);
            
            // Save to database
            await pool.execute(
                'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)',
                [email, hashedToken, expiresAt]
            );
            
            // In production, you would send an email here
            // For now, we'll just return the token (in production, NEVER do this!)
            
            res.status(200).json({
                success: true,
                message: 'Password reset token generated',
                data: {
                    resetToken, // In development only!
                    expiresAt
                }
            });
            
        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
    
    // Reset password
    static async resetPassword(req, res) {
        try {
            const { token, newPassword } = req.body;
            
            if (!token || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Please provide token and new password'
                });
            }
            
            // Hash the token
            const hashedToken = AuthUtils.hashToken(token);
            
            // Find valid reset token
            const [rows] = await pool.execute(
                'SELECT * FROM password_resets WHERE token = ? AND expires_at > NOW()',
                [hashedToken]
            );
            
            if (rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired token'
                });
            }
            
            const resetRecord = rows[0];
            
            // Update user's password
            const hashedPassword = await require('bcryptjs').hash(newPassword, 10);
            await pool.execute(
                'UPDATE users SET password = ? WHERE email = ?',
                [hashedPassword, resetRecord.email]
            );
            
            // Delete used token
            await pool.execute('DELETE FROM password_resets WHERE token = ?', [hashedToken]);
            
            res.status(200).json({
                success: true,
                message: 'Password reset successfully'
            });
            
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error',
                error: error.message
            });
        }
    }
    
    // Logout (client-side - just returns success)
    static async logout(req, res) {
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    }
}

module.exports = AuthController;