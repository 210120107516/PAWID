const express = require('express');
const { body } = require('express-validator'); // For input validation
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest'); // We'll create this helper

const router = express.Router();

// Validation rules
const registerValidationRules = [
    body('name').notEmpty().withMessage('Name is required').trim().escape(),
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    // Optional: Validate role if you allow selection during registration
    // body('role').optional().isIn(['Owner', 'ShelterStaff', 'Vet', 'Admin']).withMessage('Invalid role specified'),
];

const loginValidationRules = [
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
];

// Routes
router.post('/register', registerValidationRules, validateRequest, registerUser);
router.post('/login', loginValidationRules, validateRequest, loginUser);
router.get('/me', protect, getMe); // Protect the 'me' route

module.exports = router;