/**
 * QuickDot Application
 * Main application entry point
 */

const App = {
  initialized: false,

  /**
   * Initialize application
   */
  async init() {
    if (this.initialized) return;

    console.log('🚀 Initializing QuickDot...');

    try {
      // Initialize Auth module
      Auth.init();

      // Check if user is already authenticated
      if (Auth.isAuthenticated()) {
        await this.startApp();
      } else {
        this.setupLoginHandlers();
      }

      this.initialized = true;
      console.log('✅ QuickDot initialized successfully');
    } catch (error) {
      console.error('❌ Initialization error:', error);
      UI.showToast('Failed to initialize application', 'error');
    }
  },

  /**
   * Setup login event handlers
   */
  setupLoginHandlers() {
    // Google login button
    document.getElementById('google-login-btn')?.addEventListener('click', async () => {
      await Auth.signInWithGoogle();
    });

    // Email login button - show email form
    document.getElementById('email-login-btn')?.addEventListener('click', () => {
      document.querySelector('.login-buttons').classList.add('hidden');
      document.getElementById('email-login-form').classList.remove('hidden');
    });

    // Back button - hide email form
    document.getElementById('back-btn')?.addEventListener('click', () => {
      document.querySelector('.login-buttons').classList.remove('hidden');
      document.getElementById('email-login-form').classList.add('hidden');
    });

    // Email login form submit
    document.getElementById('email-login-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email-input').value;
      const password = document.getElementById('password-input').value;
      await Auth.signInWithEmail(email, password);
    });
  },

  /**
   * Start main application
   */
  async startApp() {
    console.log('🎯 Starting QuickDot app...');

    // Show main app
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');

    // Initialize all modules
    await Promise.all([
      UI.init(),
      WalletModule.init(),
      TransactionModule.init(),
      PortfolioModule.init(),
      ContactModule.init(),
    ]);

    // Update user display
    const user = Auth.getCurrentUser();
    if (user) {
      UI.updateUserDisplay(user);
    }

    // Setup logout button
    document.getElementById('logout-btn')?.addEventListener('click', async () => {
      UI.showConfirmation('Are you sure you want to logout?', async () => {
        await Auth.logout();
      });
    });

    // Load initial data
    await this.loadInitialData();

    // Setup refresh intervals
    this.setupRefreshIntervals();

    console.log('✅ QuickDot app started successfully');
  },

  /**
   * Load initial data
   */
  async loadInitialData() {
    try {
      UI.showLoading('Loading your data...');

      // Load wallets first
      await WalletModule.loadWallets();

      // Load dashboard data
      await WalletModule.loadDashboard();

      // Load transactions
      await TransactionModule.loadHistory();

      UI.hideLoading();
    } catch (error) {
      console.error('Error loading initial data:', error);
      UI.hideLoading();
      UI.showToast('Some data failed to load. Please refresh.', 'warning');
    }
  },

  /**
   * Setup auto-refresh intervals
   */
  setupRefreshIntervals() {
    // Refresh balances every 30 seconds
    setInterval(async () => {
      if (UI.currentPage === 'dashboard' || UI.currentPage === 'wallet') {
        await WalletModule.loadWallets();
      }
    }, CONFIG.REFRESH_INTERVALS.BALANCE);

    // Refresh transactions every 30 seconds
    setInterval(async () => {
      if (UI.currentPage === 'history' || UI.currentPage === 'dashboard') {
        await TransactionModule.loadHistory();
      }
    }, CONFIG.REFRESH_INTERVALS.TRANSACTIONS);
  },
};

/**
 * Initialize app when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
  console.log('🌟 QuickDot - Fast, Simple, Powerful Polkadot Wallet');
  console.log('📱 Version 1.0.0');
  console.log('🔧 Built by MiniMax Agent\n');
  
  App.init();
});

// Export for debugging
window.App = App;
