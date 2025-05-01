const express = require('express');
const { body, param } = require('express-validator');
const { protect, authorize } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { PERMISSIONS } = require('../config/roles'); // Import PERMISSIONS
const {
    createDog,
    getMyDogs,
    getDogById,
    updateDog,
    deleteDog,
    getPublicDogInfoByScanId
} = require('../controllers/dogController');

const router = express.Router();

const scanIdValidation = [
    param('uniqueSecureId').isUUID(4).withMessage('Invalid scan ID format'),
];
router.get('/scan/:uniqueSecureId', scanIdValidation, validateRequest, getPublicDogInfoByScanId);

// Validation rules
const dogIdValidation = [
    param('id').isMongoId().withMessage('Invalid dog ID format'),
];

const createDogValidation = [
    body('name').notEmpty().withMessage('Name is required').trim().escape(),
    body('breed').optional().trim().escape(),
    body('age').optional().isInt({ min: 0 }).withMessage('Age must be a non-negative integer'),
    body('color').optional().trim().escape(),
    body('description').optional().isLength({ max: 500 }).trim().escape(),
    body('status').optional().isIn(['Pet', 'Stray', 'Lost', 'Found', 'Adopted']).withMessage('Invalid status'),
    body('profileImageUrl').optional().isURL().withMessage('Invalid image URL format'),
];

const updateDogValidation = [ // Similar to create, but all optional
    param('id').isMongoId().withMessage('Invalid dog ID format'),
    body('name').optional().notEmpty().withMessage('Name cannot be empty').trim().escape(),
    body('breed').optional().trim().escape(),
    body('age').optional({ checkFalsy: false }).isInt({ min: 0 }).withMessage('Age must be a non-negative integer'), // Allow age 0
    body('color').optional().trim().escape(),
    body('description').optional().isLength({ max: 500 }).trim().escape(),
    body('status').optional().isIn(['Pet', 'Stray', 'Lost', 'Found', 'Adopted']).withMessage('Invalid status'),
    body('profileImageUrl').optional({ checkFalsy: true }).isURL().withMessage('Invalid image URL format'), // Allow empty string for removal
];


// --- Routes ---

// Apply 'protect' middleware to all routes in this file
router.use(protect);

// Route to get dogs owned by the logged-in user
// GET /api/dogs/mydogs - Requires ability to view own dogs
router.get('/mydogs', authorize(PERMISSIONS.VIEW_OWN_DOGS), getMyDogs);


// POST /api/dogs - Requires permission to create dogs
router.post(
    '/',
    authorize(PERMISSIONS.CREATE_DOG), // Check permission
    createDogValidation,
    validateRequest,
    createDog
);

// GET /api/dogs/:id - Authorization handled inside controller (checks ownership vs VIEW_ANY_DOG)
router.get('/:id', dogIdValidation, validateRequest, getDogById); // Keep controller logic for fine-grained check

// PUT /api/dogs/:id - Authorization handled inside controller (checks ownership vs UPDATE_ANY_DOG)
router.put(
    '/:id',
    // No authorize middleware here, controller handles owner vs admin/staff check
    updateDogValidation,
    validateRequest,
    updateDog
);

// DELETE /api/dogs/:id - Authorization handled inside controller (checks ownership vs DELETE_ANY_DOG)
router.delete(
    '/:id',
    // No authorize middleware here, controller handles owner vs admin/staff check
    dogIdValidation,
    validateRequest,
    deleteDog
);


module.exports = router;