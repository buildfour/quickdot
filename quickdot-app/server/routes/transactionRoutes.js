const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { verifyJWT } = require('../middleware/auth');
const { transactionValidation } = require('../middleware/validation');
const { strictRateLimit } = require('../middleware/rateLimit');

/**
 * Transaction Routes
 * Base path: /api/transaction
 */

// All transaction routes require authentication
router.use(verifyJWT);

// Send transaction (strict rate limit for security)
router.post('/send', strictRateLimit, transactionValidation.send, transactionController.sendTransaction);

// Estimate transaction fee
router.post('/estimate-fee', transactionController.estimateFee);

// Get transaction history
router.get('/history', transactionValidation.history, transactionController.getTransactionHistory);

// Get transaction statistics
router.get('/stats', transactionController.getTransactionStats);

// Get transaction by hash
router.get('/:txHash', transactionController.getTransaction);

module.exports = router;
