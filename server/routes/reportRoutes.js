const express = require('express');
const { body, param } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { PERMISSIONS } = require('../config/roles'); // Import PERMISSIONS
const {
    createReport,
    getReportsForDog,
    updateReportStatus,
    getAllReports
} = require('../controllers/reportController');
const { reportLimiter } = require('../middleware/rateLimiter');

const router = express.Router();


// --- Validation Rules ---
const reportValidation = [
    body('dogId').isMongoId().withMessage('Invalid dog ID format'),
    body('reportType').isIn(['Lost', 'Found', 'Injured', 'Sighting', 'Other']).withMessage('Invalid report type'),
    body('description').notEmpty().withMessage('Description is required').trim().isLength({ max: 1000 }).escape(),
    // Location validation (optional fields)
    body('location.address').optional().trim().escape(),
    body('location.coordinates').optional().isArray({ min: 2, max: 2 }).withMessage('Coordinates must be an array of [longitude, latitude]'),
    body('location.coordinates.*').optional().isFloat().withMessage('Coordinates must contain numbers'),
    // Anonymous reporter validation (optional fields)
    body('reporterContact.name').optional().trim().escape(),
    body('reporterContact.contactInfo').optional().trim().escape(), // Basic escape, consider more specific validation (email/phone) if needed
];

const dogIdParamValidation = [
    param('dogId').isMongoId().withMessage('Invalid dog ID format'),
];

const reportIdParamValidation = [
    param('reportId').isMongoId().withMessage('Invalid report ID format'),
];
const statusUpdateValidation = [
    body('reportStatus').isIn(['Open', 'Investigating', 'Resolved', 'Closed']).withMessage('Invalid report status'),
    body('resolutionDetails').optional().trim().escape(),
];

// --- Routes ---

// POST /api/reports - Create Report
// Auth check is complex (depends on reportType) and handled inside controller.
// Public permissions (Found, Sighting) don't need 'authorize'.
// Owner permissions (Lost, Injured) checked against dog ownership inside controller.
router.post('/', reportLimiter, reportValidation, validateRequest, createReport);

// GET /api/reports - Get all reports (Requires permission)
router.get('/', protect, authorize(PERMISSIONS.VIEW_ALL_REPORTS), getAllReports);

// GET /api/reports/dog/:dogId - Get reports for a specific dog
// Authorization handled inside controller (checks ownership vs VIEW_ALL_REPORTS)
router.get('/dog/:dogId', protect, dogIdParamValidation, validateRequest, getReportsForDog);

// PUT /api/reports/:reportId/status - Update report status (Requires permission)
router.put(
    '/:reportId/status',
    protect,
    authorize(PERMISSIONS.UPDATE_REPORT_STATUS), // Check permission
    reportIdParamValidation,
    statusUpdateValidation,
    validateRequest,
    updateReportStatus
);

module.exports = router;