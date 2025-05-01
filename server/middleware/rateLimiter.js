const rateLimit = require('express-rate-limit');

// Basic limiter for most API routes (adjust limits as needed)
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter limiter for sensitive or public actions like submitting reports anonymously
const reportLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 report submissions per hour
    message: 'Too many reports created from this IP, please try again after an hour',
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { apiLimiter, reportLimiter };