const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController');
const { verifyJWT } = require('../middleware/auth');
const { walletValidation } = require('../middleware/validation');

/**
 * Wallet Routes
 * Base path: /api/wallet
 */

// Generate new mnemonic (no auth required for demo)
router.get('/generate-mnemonic', walletController.generateMnemonic);

// Validate address (no auth required)
router.post('/validate-address', walletController.validateAddress);

// Protected routes (require authentication)
router.use(verifyJWT);

// Create new wallet
router.post('/create', walletValidation.create, walletController.createWallet);

// Import existing wallet
router.post('/import', walletValidation.import, walletController.importWallet);

// Get all wallets
router.get('/list', walletController.getWallets);

// Get wallet by ID
router.get('/:walletId', walletValidation.getById, walletController.getWallet);

// Get wallet balance
router.get('/:walletId/balance', walletValidation.getById, walletController.getBalance);

// Update wallet
router.put('/:walletId', walletValidation.getById, walletController.updateWallet);

// Delete wallet
router.delete('/:walletId', walletValidation.getById, walletController.deleteWallet);

module.exports = router;
