const PolkadotService = require('../services/polkadotService');
const DatabaseService = require('../services/databaseService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Transaction Controller
 * Handles transaction-related API endpoints
 */

/**
 * Send DOT transaction
 * POST /api/transaction/send
 */
exports.sendTransaction = asyncHandler(async (req, res) => {
  const { fromAddress, toAddress, amount, walletId, note } = req.body;
  const uid = req.user.uid;
  
  // Validate addresses
  if (!PolkadotService.validateAddress(fromAddress)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid sender address',
    });
  }
  
  if (!PolkadotService.validateAddress(toAddress)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid recipient address',
    });
  }
  
  // Get wallet and decrypted mnemonic
  const mnemonic = await DatabaseService.getWalletMnemonic(walletId, uid);
  
  // Check balance before sending
  const balance = await PolkadotService.getBalance(fromAddress);
  if (parseFloat(balance.free) < parseFloat(amount)) {
    return res.status(400).json({
      success: false,
      error: 'Insufficient balance',
    });
  }
  
  // Send transaction
  const result = await PolkadotService.sendTransaction({
    fromAddress,
    toAddress,
    amount,
    mnemonic,
  });
  
  // Save transaction record
  await DatabaseService.saveTransaction(uid, {
    walletId,
    type: 'sent',
    from: fromAddress,
    to: toAddress,
    amount: amount,
    txHash: result.txHash,
    blockHash: result.blockHash,
    status: 'confirmed',
    note: note || '',
  });
  
  res.json({
    success: true,
    transaction: result,
    message: 'Transaction sent successfully',
  });
});

/**
 * Get transaction history
 * GET /api/transaction/history
 */
exports.getTransactionHistory = asyncHandler(async (req, res) => {
  const uid = req.user.uid;
  const limit = parseInt(req.query.limit) || 50;
  
  const transactions = await DatabaseService.getUserTransactions(uid, limit);
  
  res.json({
    success: true,
    transactions,
    count: transactions.length,
  });
});

/**
 * Get transaction by hash
 * GET /api/transaction/:txHash
 */
exports.getTransaction = asyncHandler(async (req, res) => {
  const { txHash } = req.params;
  
  try {
    const transaction = await PolkadotService.getTransaction(txHash);
    
    res.json({
      success: true,
      transaction,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: 'Transaction not found',
    });
  }
});

/**
 * Get transaction statistics
 * GET /api/transaction/stats
 */
exports.getTransactionStats = asyncHandler(async (req, res) => {
  const uid = req.user.uid;
  
  const transactions = await DatabaseService.getUserTransactions(uid, 1000);
  
  // Calculate statistics
  let totalSent = 0;
  let totalReceived = 0;
  let sentCount = 0;
  let receivedCount = 0;
  
  transactions.forEach(tx => {
    const amount = parseFloat(tx.amount);
    
    if (tx.type === 'sent') {
      totalSent += amount;
      sentCount++;
    } else if (tx.type === 'received') {
      totalReceived += amount;
      receivedCount++;
    }
  });
  
  res.json({
    success: true,
    stats: {
      totalTransactions: transactions.length,
      totalSent: totalSent.toFixed(4),
      totalReceived: totalReceived.toFixed(4),
      sentCount,
      receivedCount,
      averageSent: sentCount > 0 ? (totalSent / sentCount).toFixed(4) : '0.0000',
      averageReceived: receivedCount > 0 ? (totalReceived / receivedCount).toFixed(4) : '0.0000',
    },
  });
});

/**
 * Estimate transaction fee
 * POST /api/transaction/estimate-fee
 */
exports.estimateFee = asyncHandler(async (req, res) => {
  const { fromAddress, toAddress, amount } = req.body;
  
  // For Polkadot, transaction fees are relatively fixed
  // Typical fee is around 0.01 DOT
  const estimatedFee = '0.0100';
  
  res.json({
    success: true,
    fee: estimatedFee,
    total: (parseFloat(amount) + parseFloat(estimatedFee)).toFixed(4),
  });
});

module.exports = exports;
