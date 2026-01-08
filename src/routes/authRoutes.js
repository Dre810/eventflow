// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/forgot-password', AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

// Protected routes
router.get('/profile', authMiddleware.protect, AuthController.getProfile);
router.put('/profile', authMiddleware.protect, AuthController.updateProfile);
router.put('/change-password', authMiddleware.protect, AuthController.changePassword);
router.post('/logout', authMiddleware.protect, AuthController.logout);

module.exports = router;