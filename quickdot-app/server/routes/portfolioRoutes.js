const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { verifyJWT, optionalAuth } = require('../middleware/auth');

/**
 * Portfolio Routes
 * Base path: /api/portfolio
 */

// Public routes (no auth required)
// Get DOT price
router.get('/price', portfolioController.getDOTPrice);

// Get network statistics
router.get('/network-stats', portfolioController.getNetworkStats);

// Protected routes (require authentication)
router.use(verifyJWT);

// Get portfolio overview
router.get('/overview', portfolioController.getPortfolioOverview);

// Get portfolio allocation
router.get('/allocation', portfolioController.getPortfolioAllocation);

// Get portfolio performance
router.get('/performance', portfolioController.getPortfolioPerformance);

module.exports = router;
