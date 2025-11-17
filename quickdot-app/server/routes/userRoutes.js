const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyJWT } = require('../middleware/auth');
const { userValidation } = require('../middleware/validation');

/**
 * User Routes
 * Base path: /api/user
 */

// Authentication endpoint (no auth required)
router.post('/auth', userController.authenticate);

// Protected routes (require authentication)
router.use(verifyJWT);

// Get user profile
router.get('/profile', userController.getProfile);

// Update user profile
router.put('/profile', userValidation.updateProfile, userController.updateProfile);

// Update user settings
router.put('/settings', userValidation.updateSettings, userController.updateSettings);

// Get user statistics
router.get('/stats', userController.getUserStats);

module.exports = router;
