const PolkadotService = require('../services/polkadotService');
const DatabaseService = require('../services/databaseService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Wallet Controller
 * Handles wallet-related API endpoints
 */

/**
 * Generate new mnemonic phrase
 * GET /api/wallet/generate-mnemonic
 */
exports.generateMnemonic = asyncHandler(async (req, res) => {
  const mnemonic = PolkadotService.generateMnemonic();
  
  res.json({
    success: true,
    mnemonic,
  });
});

/**
 * Create new wallet
 * POST /api/wallet/create
 */
exports.createWallet = asyncHandler(async (req, res) => {
  const { name, mnemonic } = req.body;
  const uid = req.user.uid;
  
  // Use provided mnemonic or generate new one
  const mnemonicPhrase = mnemonic || PolkadotService.generateMnemonic();
  
  // Create account on Polkadot
  const account = await PolkadotService.createAccount(mnemonicPhrase, name);
  
  // Get initial balance
  const balance = await PolkadotService.getBalance(account.address);
  
  // Save wallet to database
  const walletId = await DatabaseService.createWallet(uid, {
    name: account.name,
    address: account.address,
    publicKey: account.publicKey,
    mnemonic: account.mnemonic,
    balance: balance.total,
  });
  
  res.status(201).json({
    success: true,
    wallet: {
      id: walletId,
      name: account.name,
      address: account.address,
      balance: balance.total,
    },
    mnemonic: mnemonicPhrase, // Return once for user to backup
  });
});

/**
 * Import existing wallet
 * POST /api/wallet/import
 */
exports.importWallet = asyncHandler(async (req, res) => {
  const { name, mnemonic } = req.body;
  const uid = req.user.uid;
  
  // Import account
  const account = await PolkadotService.importAccount(mnemonic, name);
  
  // Get balance
  const balance = await PolkadotService.getBalance(account.address);
  
  // Save to database
  const walletId = await DatabaseService.createWallet(uid, {
    name: account.name,
    address: account.address,
    publicKey: account.publicKey,
    mnemonic: account.mnemonic,
    balance: balance.total,
    imported: true,
  });
  
  res.status(201).json({
    success: true,
    wallet: {
      id: walletId,
      name: account.name,
      address: account.address,
      balance: balance.total,
    },
  });
});

/**
 * Get all user wallets
 * GET /api/wallet/list
 */
exports.getWallets = asyncHandler(async (req, res) => {
  const uid = req.user.uid;
  
  const wallets = await DatabaseService.getUserWallets(uid);
  
  // Update balances
  const walletsWithBalances = await Promise.all(
    wallets.map(async (wallet) => {
      try {
        const balance = await PolkadotService.getBalance(wallet.address);
        
        // Update balance in database
        await DatabaseService.updateWallet(wallet.id, uid, {
          balance: balance.total,
        });
        
        return {
          ...wallet,
          balance: balance.total,
          balanceDetails: balance,
        };
      } catch (error) {
        return {
          ...wallet,
          balance: wallet.balance || '0.0000',
        };
      }
    })
  );
  
  res.json({
    success: true,
    wallets: walletsWithBalances,
  });
});

/**
 * Get wallet by ID
 * GET /api/wallet/:walletId
 */
exports.getWallet = asyncHandler(async (req, res) => {
  const { walletId } = req.params;
  const uid = req.user.uid;
  
  const wallet = await DatabaseService.getWallet(walletId, uid);
  const balance = await PolkadotService.getBalance(wallet.address);
  
  res.json({
    success: true,
    wallet: {
      ...wallet,
      balance: balance.total,
      balanceDetails: balance,
      mnemonic: undefined, // Never return mnemonic in regular requests
    },
  });
});

/**
 * Get wallet balance
 * GET /api/wallet/:walletId/balance
 */
exports.getBalance = asyncHandler(async (req, res) => {
  const { walletId } = req.params;
  const uid = req.user.uid;
  
  const wallet = await DatabaseService.getWallet(walletId, uid);
  const balance = await PolkadotService.getBalance(wallet.address);
  
  res.json({
    success: true,
    balance,
  });
});

/**
 * Update wallet name
 * PUT /api/wallet/:walletId
 */
exports.updateWallet = asyncHandler(async (req, res) => {
  const { walletId } = req.params;
  const { name } = req.body;
  const uid = req.user.uid;
  
  await DatabaseService.updateWallet(walletId, uid, { name });
  
  res.json({
    success: true,
    message: 'Wallet updated successfully',
  });
});

/**
 * Delete wallet
 * DELETE /api/wallet/:walletId
 */
exports.deleteWallet = asyncHandler(async (req, res) => {
  const { walletId } = req.params;
  const uid = req.user.uid;
  
  await DatabaseService.deleteWallet(walletId, uid);
  
  res.json({
    success: true,
    message: 'Wallet deleted successfully',
  });
});

/**
 * Validate address
 * POST /api/wallet/validate-address
 */
exports.validateAddress = asyncHandler(async (req, res) => {
  const { address } = req.body;
  
  const isValid = PolkadotService.validateAddress(address);
  
  res.json({
    success: true,
    valid: isValid,
  });
});
