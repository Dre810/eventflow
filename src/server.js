// src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { testConnection } = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Test database connection
app.use(async (req, res, next) => {
    const isConnected = await testConnection();
    if (!isConnected) {
        return res.status(503).json({
            success: false,
            message: 'Database connection failed'
        });
    }
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);

// Basic route
app.get('/', (req, res) => {
    res.json({ 
        message: 'EventFlow API is running!',
        version: '1.0.0',
        status: 'Operational',
        endpoints: {
            auth: {
                register: 'POST /api/auth/register',
                login: 'POST /api/auth/login',
                profile: 'GET /api/auth/profile',
                forgot_password: 'POST /api/auth/forgot-password',
                reset_password: 'POST /api/auth/reset-password'
            },
            events: {
                get_all: 'GET /api/events',
                get_single: 'GET /api/events/:id',
                create: 'POST /api/events (admin only)',
                update: 'PUT /api/events/:id',
                delete: 'DELETE /api/events/:id',
                featured: 'GET /api/events/featured',
                upcoming: 'GET /api/events/upcoming',
                categories: 'GET /api/events/categories'
            }
        }
    });
});


// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        success: false,
        error: 'Route not found' 
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        success: false,
        error: 'Something went wrong!',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 API Base URL: http://localhost:${PORT}`);
    console.log(`🔐 Authentication: http://localhost:${PORT}/api/auth`);
});