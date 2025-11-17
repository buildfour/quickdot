const jwt = require('jsonwebtoken');
const DatabaseService = require('../services/databaseService');
const { asyncHandler } = require('../middleware/errorHandler');
const { verifyIdToken } = require('../config/firebase');

/**
 * User Controller
 * Handles user authentication and profile management
 */

/**
 * Register or login user with Firebase token
 * POST /api/user/auth
 */
exports.authenticate = asyncHandler(async (req, res) => {
  const { firebaseToken } = req.body;
  
  if (!firebaseToken) {
    return res.status(400).json({
      success: false,
      error: 'Firebase token is required',
    });
  }
  
  // Verify Firebase token
  const decodedToken = await verifyIdToken(firebaseToken);
  
  const uid = decodedToken.uid;
  const email = decodedToken.email;
  
  // Check if user exists
  let user = await DatabaseService.getUser(uid);
  
  // Create user if doesn't exist
  if (!user) {
    await DatabaseService.createUser(uid, {
      email,
      displayName: decodedToken.name || email.split('@')[0],
      photoURL: decodedToken.picture || '',
      emailVerified: decodedToken.email_verified || false,
      currency: 'USD',
      theme: 'light',
      language: 'en',
      notifications: true,
    });
    
    user = await DatabaseService.getUser(uid);
  }
  
  // Generate JWT token
  const jwtToken = jwt.sign(
    { uid, email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRY || '24h' }
  );
  
  res.json({
    success: true,
    token: jwtToken,
    user: {
      uid: user.id,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      currency: user.currency,
      theme: user.theme,
      language: user.language,
    },
  });
});

/**
 * Get user profile
 * GET /api/user/profile
 */
exports.getProfile = asyncHandler(async (req, res) => {
  const uid = req.user.uid;
  
  const user = await DatabaseService.getUser(uid);
  
  if (!user) {
    return res.status(404).json({
      success: false,
      error: 'User not found',
    });
  }
  
  res.json({
    success: true,
    user: {
      uid: user.id,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      currency: user.currency,
      theme: user.theme,
      language: user.language,
      notifications: user.notifications,
      createdAt: user.createdAt,
    },
  });
});

/**
 * Update user profile
 * PUT /api/user/profile
 */
exports.updateProfile = asyncHandler(async (req, res) => {
  const uid = req.user.uid;
  const { displayName, photoURL, currency } = req.body;
  
  const updates = {};
  if (displayName) updates.displayName = displayName;
  if (photoURL) updates.photoURL = photoURL;
  if (currency) updates.currency = currency;
  
  await DatabaseService.updateUser(uid, updates);
  
  res.json({
    success: true,
    message: 'Profile updated successfully',
  });
});

/**
 * Update user settings
 * PUT /api/user/settings
 */
exports.updateSettings = asyncHandler(async (req, res) => {
  const uid = req.user.uid;
  const { theme, language, notifications } = req.body;
  
  const updates = {};
  if (theme) updates.theme = theme;
  if (language) updates.language = language;
  if (notifications !== undefined) updates.notifications = notifications;
  
  await DatabaseService.updateUser(uid, updates);
  
  res.json({
    success: true,
    message: 'Settings updated successfully',
  });
});

/**
 * Get user statistics
 * GET /api/user/stats
 */
exports.getUserStats = asyncHandler(async (req, res) => {
  const uid = req.user.uid;
  
  const [wallets, transactions, contacts] = await Promise.all([
    DatabaseService.getUserWallets(uid),
    DatabaseService.getUserTransactions(uid, 1000),
    DatabaseService.getUserContacts(uid),
  ]);
  
  res.json({
    success: true,
    stats: {
      walletCount: wallets.length,
      transactionCount: transactions.length,
      contactCount: contacts.length,
    },
  });
});

module.exports = exports;
