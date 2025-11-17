const PolkadotService = require('../services/polkadotService');
const DatabaseService = require('../services/databaseService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Portfolio Controller
 * Handles portfolio and price tracking endpoints
 */

/**
 * Get portfolio overview
 * GET /api/portfolio/overview
 */
exports.getPortfolioOverview = asyncHandler(async (req, res) => {
  const uid = req.user.uid;
  
  // Get all user wallets
  const wallets = await DatabaseService.getUserWallets(uid);
  
  // Get current DOT price
  const priceData = await PolkadotService.getDOTPrice();
  
  // Calculate total balance across all wallets
  let totalDOT = 0;
  const walletBalances = [];
  
  for (const wallet of wallets) {
    try {
      const balance = await PolkadotService.getBalance(wallet.address);
      const balanceNum = parseFloat(balance.total);
      totalDOT += balanceNum;
      
      walletBalances.push({
        walletId: wallet.id,
        name: wallet.name,
        address: wallet.address,
        balance: balance.total,
        valueUSD: (balanceNum * priceData.usd).toFixed(2),
      });
    } catch (error) {
      console.error(`Error fetching balance for ${wallet.address}:`, error.message);
    }
  }
  
  // Calculate USD value
  const totalValueUSD = (totalDOT * priceData.usd).toFixed(2);
  const totalValueEUR = (totalDOT * priceData.eur).toFixed(2);
  const totalValueGBP = (totalDOT * priceData.gbp).toFixed(2);
  
  res.json({
    success: true,
    portfolio: {
      totalDOT: totalDOT.toFixed(4),
      totalValueUSD,
      totalValueEUR,
      totalValueGBP,
      walletCount: wallets.length,
      wallets: walletBalances,
      priceData: {
        dotPriceUSD: priceData.usd,
        dotPriceEUR: priceData.eur,
        dotPriceGBP: priceData.gbp,
        change24h: priceData.change24h,
      },
    },
  });
});

/**
 * Get DOT price data
 * GET /api/portfolio/price
 */
exports.getDOTPrice = asyncHandler(async (req, res) => {
  const priceData = await PolkadotService.getDOTPrice();
  
  res.json({
    success: true,
    price: priceData,
  });
});

/**
 * Get portfolio allocation
 * GET /api/portfolio/allocation
 */
exports.getPortfolioAllocation = asyncHandler(async (req, res) => {
  const uid = req.user.uid;
  
  const wallets = await DatabaseService.getUserWallets(uid);
  
  let totalDOT = 0;
  const allocations = [];
  
  for (const wallet of wallets) {
    try {
      const balance = await PolkadotService.getBalance(wallet.address);
      const balanceNum = parseFloat(balance.total);
      totalDOT += balanceNum;
      
      allocations.push({
        walletId: wallet.id,
        name: wallet.name,
        balance: balance.total,
        balanceNum,
      });
    } catch (error) {
      console.error(`Error fetching balance for ${wallet.address}:`, error.message);
    }
  }
  
  // Calculate percentages
  const allocationWithPercentages = allocations.map(item => ({
    walletId: item.walletId,
    name: item.name,
    balance: item.balance,
    percentage: totalDOT > 0 ? ((item.balanceNum / totalDOT) * 100).toFixed(2) : '0.00',
  }));
  
  res.json({
    success: true,
    allocation: allocationWithPercentages,
    totalDOT: totalDOT.toFixed(4),
  });
});

/**
 * Get portfolio performance
 * GET /api/portfolio/performance
 */
exports.getPortfolioPerformance = asyncHandler(async (req, res) => {
  const uid = req.user.uid;
  
  // Get transaction history
  const transactions = await DatabaseService.getUserTransactions(uid, 1000);
  
  // Calculate total sent and received
  let totalSent = 0;
  let totalReceived = 0;
  
  transactions.forEach(tx => {
    const amount = parseFloat(tx.amount);
    if (tx.type === 'sent') {
      totalSent += amount;
    } else if (tx.type === 'received') {
      totalReceived += amount;
    }
  });
  
  // Get current portfolio value
  const wallets = await DatabaseService.getUserWallets(uid);
  const priceData = await PolkadotService.getDOTPrice();
  
  let currentDOT = 0;
  for (const wallet of wallets) {
    try {
      const balance = await PolkadotService.getBalance(wallet.address);
      currentDOT += parseFloat(balance.total);
    } catch (error) {
      // Skip if error
    }
  }
  
  const currentValueUSD = currentDOT * priceData.usd;
  const netFlow = totalReceived - totalSent;
  
  res.json({
    success: true,
    performance: {
      currentDOT: currentDOT.toFixed(4),
      currentValueUSD: currentValueUSD.toFixed(2),
      totalReceived: totalReceived.toFixed(4),
      totalSent: totalSent.toFixed(4),
      netFlow: netFlow.toFixed(4),
      transactionCount: transactions.length,
      averageTransactionSize: transactions.length > 0 
        ? ((totalSent + totalReceived) / transactions.length).toFixed(4)
        : '0.0000',
    },
  });
});

/**
 * Get network statistics
 * GET /api/portfolio/network-stats
 */
exports.getNetworkStats = asyncHandler(async (req, res) => {
  const stats = await PolkadotService.getNetworkStats();
  
  res.json({
    success: true,
    stats,
  });
});

module.exports = exports;
