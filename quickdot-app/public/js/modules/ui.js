/**
 * UI Module
 * Handles user interface interactions and updates
 */

const UI = {
  currentPage: 'dashboard',
  
  /**
   * Initialize UI event listeners
   */
  init() {
    this.setupNavigation();
    this.setupThemeToggle();
    this.setupModals();
    this.setupQuickActions();
  },

  /**
   * Setup navigation
   */
  setupNavigation() {
    // Sidebar navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const page = item.getAttribute('data-page');
        if (page) {
          this.showPage(page);
        }
      });
    });

    // Logo click
    document.getElementById('logo-btn')?.addEventListener('click', () => {
      this.showPage('dashboard');
    });
  },

  /**
   * Show page
   */
  showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });

    // Show selected page
    const page = document.getElementById(pageName);
    if (page) {
      page.classList.add('active');
    }

    // Update navigation active state
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('data-page') === pageName) {
        item.classList.add('active');
      }
    });

    this.currentPage = pageName;

    // Load page data
    this.loadPageData(pageName);
  },

  /**
   * Load page data
   */
  async loadPageData(pageName) {
    switch (pageName) {
      case 'dashboard':
        await window.WalletModule?.loadDashboard();
        break;
      case 'wallet':
        await window.WalletModule?.loadWallets();
        break;
      case 'portfolio':
        await window.PortfolioModule?.loadPortfolio();
        break;
      case 'send':
        await window.TransactionModule?.loadSendPage();
        break;
      case 'receive':
        await window.TransactionModule?.loadReceivePage();
        break;
      case 'history':
        await window.TransactionModule?.loadHistory();
        break;
      case 'contacts':
        await window.ContactModule?.loadContacts();
        break;
      case 'settings':
        this.loadSettings();
        break;
    }
  },

  /**
   * Setup theme toggle
   */
  setupThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener('click', () => {
        const newTheme = Utils.toggleTheme();
        const icon = themeToggleBtn.querySelector('i');
        icon.className = newTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
      });
    }

    // Apply saved theme
    const savedTheme = Utils.getTheme();
    Utils.setTheme(savedTheme);
    const icon = themeToggleBtn?.querySelector('i');
    if (icon) {
      icon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  },

  /**
   * Setup quick actions
   */
  setupQuickActions() {
    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.getAttribute('data-action');
        this.handleAction(action);
      });
    });
  },

  /**
   * Handle action
   */
  handleAction(action) {
    switch (action) {
      case 'send':
        this.showPage('send');
        break;
      case 'receive':
        this.showPage('receive');
        break;
      case 'wallet':
        this.showPage('wallet');
        break;
      case 'history':
        this.showPage('history');
        break;
      case 'create-wallet':
        window.WalletModule?.showCreateWalletModal();
        break;
    }
  },

  /**
   * Show loading overlay
   */
  showLoading(message = 'Processing...') {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.querySelector('.loading-text').textContent = message;
      overlay.classList.remove('hidden');
    }
  },

  /**
   * Hide loading overlay
   */
  hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  },

  /**
   * Show toast notification
   */
  showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icon = this.getToastIcon(type);
    toast.innerHTML = `
      <i class="${icon}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Remove after duration
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  /**
   * Get toast icon based on type
   */
  getToastIcon(type) {
    const icons = {
      success: 'fas fa-check-circle',
      error: 'fas fa-exclamation-circle',
      warning: 'fas fa-exclamation-triangle',
      info: 'fas fa-info-circle',
    };
    return icons[type] || icons.info;
  },

  /**
   * Setup modals
   */
  setupModals() {
    // Modal container
    const modalContainer = document.getElementById('modal-container');
    if (modalContainer) {
      modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) {
          this.closeAllModals();
        }
      });
    }
  },

  /**
   * Show modal
   */
  showModal(content, title = '') {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        ${title ? `<div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close" onclick="UI.closeAllModals()">
            <i class="fas fa-times"></i>
          </button>
        </div>` : ''}
        <div class="modal-body">
          ${content}
        </div>
      </div>
    `;

    modalContainer.appendChild(modal);
    modalContainer.classList.add('active');
    
    setTimeout(() => modal.classList.add('show'), 10);
  },

  /**
   * Close all modals
   */
  closeAllModals() {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    const modals = modalContainer.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    });

    modalContainer.classList.remove('active');
  },

  /**
   * Show confirmation modal
   */
  showConfirmation(message, onConfirm) {
    const content = `
      <div class="confirmation-modal">
        <p>${message}</p>
        <div class="modal-actions">
          <button class="secondary-btn" onclick="UI.closeAllModals()">Cancel</button>
          <button class="primary-btn" id="confirm-btn">Confirm</button>
        </div>
      </div>
    `;

    this.showModal(content, 'Confirm Action');

    // Setup confirm button
    setTimeout(() => {
      document.getElementById('confirm-btn')?.addEventListener('click', () => {
        this.closeAllModals();
        onConfirm();
      });
    }, 100);
  },

  /**
   * Load settings page
   */
  loadSettings() {
    const user = Auth.getCurrentUser();
    if (!user) return;

    // Set theme select
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) {
      themeSelect.value = Utils.getTheme();
      themeSelect.addEventListener('change', (e) => {
        Utils.setTheme(e.target.value);
        const themeToggleBtn = document.getElementById('theme-toggle-btn');
        const icon = themeToggleBtn?.querySelector('i');
        if (icon) {
          icon.className = e.target.value === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
      });
    }

    // Set currency select
    const currencySelect = document.getElementById('currency-select');
    if (currencySelect) {
      currencySelect.value = Utils.getCurrency();
      currencySelect.addEventListener('change', (e) => {
        Utils.setCurrency(e.target.value);
        this.showToast('Currency updated successfully', 'success');
      });
    }
  },

  /**
   * Update user display
   */
  updateUserDisplay(user) {
    document.getElementById('user-name').textContent = user.displayName || user.email;
    document.getElementById('user-avatar').textContent = user.displayName?.[0]?.toUpperCase() || 'U';
  },
};

// Export for use in other modules
window.UI = UI;
