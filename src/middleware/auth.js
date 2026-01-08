// src/middleware/auth.js
const AuthUtils = require('../utils/auth');

const authMiddleware = {
    // Protect routes - require authentication
    protect: (req, res, next) => {
        let token;
        
        // Get token from header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
        
        try {
            // Verify token
            const decoded = AuthUtils.verifyToken(token);
            if (!decoded) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid or expired token'
                });
            }
            
            // Add user to request
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route'
            });
        }
    },
    
    // Restrict to specific roles
    restrictTo: (...roles) => {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Not authorized'
                });
            }
            
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to perform this action'
                });
            }
            
            next();
        };
    },
    
    // Optional authentication (for public routes that might have user context)
    optional: (req, res, next) => {
        let token;
        
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        
        if (token) {
            try {
                const decoded = AuthUtils.verifyToken(token);
                if (decoded) {
                    req.user = decoded;
                }
            } catch (error) {
                // Token is invalid, but that's OK for optional auth
            }
        }
        
        next();
    }
};

module.exports = authMiddleware;