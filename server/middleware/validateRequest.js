const { validationResult } = require('express-validator');

// Middleware to handle validation errors from express-validator
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return 400 Bad Request with the validation errors
    return res.status(400).json({ errors: errors.array() });
  }
  next(); // Proceed if validation passes
};

module.exports = validateRequest;