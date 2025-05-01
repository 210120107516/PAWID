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

// Ensure sensitive data like tokens are passed via headers, not in URLs
router.post('/secure-endpoint', (req, res) => {
    // Extract the token from the request headers
    const token = req.headers['x-auth-token'];
    
    // Check if the token is present
    if (!token) {
      return res.status(401).json({ message: 'Token required' });
    }
    
    // Process the token securely here
    try {
      // Example: Verify the token using a library like jsonwebtoken (JWT)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attach the decoded information to the request object for further processing
      req.user = decoded;
      
      // Proceed to the next step in the process
      res.status(200).json({ message: 'Token verified successfully' });
    } catch (error) {
      // Handle token verification errors
      res.status(403).json({ message: 'Invalid or expired token' });
    }
  });

module.exports = router;