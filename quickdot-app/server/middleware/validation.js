const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation Middleware
 * Input validation rules for API endpoints
 */

/**
 * Validate request and return errors if any
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array(),
    });
  }
  
  next();
};

/**
 * Wallet validation rules
 */
const walletValidation = {
  // Create wallet
  create: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Wallet name must be between 1 and 50 characters'),
    body('mnemonic')
      .optional()
      .isLength({ min: 10 })
      .withMessage('Invalid mnemonic phrase'),
    validate,
  ],

  // Import wallet
  import: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Wallet name must be between 1 and 50 characters'),
    body('mnemonic')
      .isLength({ min: 10 })
      .withMessage('Mnemonic phrase is required'),
    validate,
  ],

  // Get wallet by ID
  getById: [
    param('walletId')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Wallet ID is required'),
    validate,
  ],
};

/**
 * Transaction validation rules
 */
const transactionValidation = {
  // Send transaction
  send: [
    body('fromAddress')
      .trim()
      .isLength({ min: 47, max: 48 })
      .withMessage('Invalid sender address'),
    body('toAddress')
      .trim()
      .isLength({ min: 47, max: 48 })
      .withMessage('Invalid recipient address'),
    body('amount')
      .isFloat({ min: 0.000001 })
      .withMessage('Amount must be greater than 0'),
    body('walletId')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Wallet ID is required'),
    validate,
  ],

  // Get transaction history
  history: [
    query('address')
      .optional()
      .trim()
      .isLength({ min: 47, max: 48 })
      .withMessage('Invalid address'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    validate,
  ],
};

/**
 * Contact validation rules
 */
const contactValidation = {
  // Create contact
  create: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Contact name must be between 1 and 50 characters'),
    body('address')
      .trim()
      .isLength({ min: 47, max: 48 })
      .withMessage('Invalid Polkadot address'),
    body('note')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Note must not exceed 200 characters'),
    validate,
  ],

  // Update contact
  update: [
    param('contactId')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Contact ID is required'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Contact name must be between 1 and 50 characters'),
    body('note')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Note must not exceed 200 characters'),
    validate,
  ],

  // Delete contact
  delete: [
    param('contactId')
      .trim()
      .isLength({ min: 1 })
      .withMessage('Contact ID is required'),
    validate,
  ],
};

/**
 * User validation rules
 */
const userValidation = {
  // Update profile
  updateProfile: [
    body('displayName')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Display name must be between 1 and 50 characters'),
    body('currency')
      .optional()
      .isIn(['USD', 'EUR', 'GBP', 'JPY', 'CNY'])
      .withMessage('Invalid currency'),
    validate,
  ],

  // Update settings
  updateSettings: [
    body('theme')
      .optional()
      .isIn(['light', 'dark', 'auto'])
      .withMessage('Invalid theme'),
    body('language')
      .optional()
      .isIn(['en', 'es', 'fr', 'de', 'zh', 'ja'])
      .withMessage('Invalid language'),
    body('notifications')
      .optional()
      .isBoolean()
      .withMessage('Notifications must be boolean'),
    validate,
  ],
};

module.exports = {
  validate,
  walletValidation,
  transactionValidation,
  contactValidation,
  userValidation,
};
