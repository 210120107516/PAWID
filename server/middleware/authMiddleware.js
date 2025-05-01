const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const { ROLES, hasPermission } = require('../config/roles'); // Import roles config


// Middleware to protect routes
const protect = asyncHandler(async (req, res, next) => {
    // ... (same code as before to verify JWT and attach user) ...
    let token;
    if ( req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            if (!req.user) {
                res.status(401); throw new Error('Not authorized, user not found');
            }
            next();
        } catch (error) {
            console.error('Token verification failed:', error);
            res.status(401); throw new Error('Not authorized, token failed');
        }
    }
    if (!token) {
        res.status(401); throw new Error('Not authorized, no token provided');
    }
});

// Middleware for role-based access (Example - can be expanded later)
// --- authorize middleware (Updated to check permissions) ---
// Accepts one or more required permissions
const authorize = (...requiredPermissions) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            res.status(403); // Forbidden
            throw new Error('User role not found. Access denied.');
        }

        // Check if the user's role has ALL required permissions for this route
        const allowed = requiredPermissions.every(permission =>
            hasPermission(req.user.role, permission)
        );

        if (!allowed) {
            console.warn(`Authorization failed: User role '${req.user.role}' lacks required permission(s): ${requiredPermissions.join(', ')} for route ${req.originalUrl}`);
            res.status(403); // Forbidden
            throw new Error(`Your role (${req.user.role}) is not authorized to perform this action.`);
        }

        next(); // User has the required permissions
    };
};



module.exports = { protect, authorize };