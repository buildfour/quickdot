/**
 * Wallet Module
 * Handles wallet creation, import, and management
 */

const WalletModule = {
  wallets: [],
  
  async init() {
    this.setupEventListeners();
    await this.loadWallets();
  },

  setupEventListeners() {
    // Create wallet button
    document.getElementById('create-wallet-btn')?.addEventListener('click', () => {
      this.showCreateWalletModal();
    });

    // Import wallet button
    document.getElementById('import-wallet-btn')?.addEventListener('click', () => {
      this.showImportWalletModal();
    });
  },

  async loadWallets() {
    try {
      const response = await API.getWallets();
      if (response.success) {
        this.wallets = response.wallets;
        this.renderWallets();
        this.updateDashboardWallets();
      }
    } catch (error) {
      console.error('Error loading wallets:', error);
    }
  },

  renderWallets() {
    const container = document.getElementById('wallet-list');
    if (!container) return;

    if (this.wallets.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-wallet"></i>
          <p>No wallets yet</p>
          <button class="primary-btn" onclick="WalletModule.showCreateWalletModal()">Create Your First Wallet</button>
        </div>
      `;
      return;
    }

    container.innerHTML = this.wallets.map(wallet => `
      <div class="wallet-card">
        <div class="wallet-header">
          <div class="wallet-icon"><i class="fas fa-wallet"></i></div>
          <div class="wallet-info">
            <div class="wallet-name">${wallet.name}</div>
            <div class="wallet-address">${Utils.shortenAddress(wallet.address)}</div>
          </div>
        </div>
        <div class="wallet-balance">
          <div class="balance-label">Balance</div>
          <div class="balance-value">${wallet.balance || '0.0000'} DOT</div>
          <div class="balance-usd">≈ $${(parseFloat(wallet.balance || 0) * 7.5).toFixed(2)}</div>
        </div>
        <div class="wallet-actions">
          <button class="icon-btn" onclick="WalletModule.copyAddress('${wallet.address}')" title="Copy address">
            <i class="fas fa-copy"></i>
          </button>
          <button class="icon-btn" onclick="WalletModule.showWalletDetails('${wallet.id}')" title="Details">
            <i class="fas fa-eye"></i>
          </button>
        </div>
      </div>
    `).join('');
  },

  async showCreateWalletModal() {
    const content = `
      <form id="create-wallet-form">
        <div class="form-group">
          <label>Wallet Name</label>
          <input type="text" id="new-wallet-name" placeholder="My Wallet" required>
        </div>
        <div class="info-box">
          <i class="fas fa-info-circle"></i>
          <p>A new recovery phrase will be generated for this wallet. Make sure to back it up securely.</p>
        </div>
        <button type="submit" class="primary-btn full-width">
          <i class="fas fa-plus"></i>
          Create Wallet
        </button>
      </form>
    `;

    UI.showModal(content, 'Create New Wallet');

    setTimeout(() => {
      document.getElementById('create-wallet-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.createWallet();
      });
    }, 100);
  },

  async createWallet() {
    try {
      const name = document.getElementById('new-wallet-name').value;
      
      UI.showLoading('Creating wallet...');
      
      const response = await API.createWallet({ name });
      
      if (response.success) {
        UI.hideLoading();
        UI.closeAllModals();
        
        // Show mnemonic backup modal
        this.showMnemonicBackup(response.wallet, response.mnemonic);
        
        await this.loadWallets();
        UI.showToast('Wallet created successfully!', 'success');
      }
    } catch (error) {
      UI.hideLoading();
      UI.showToast(error.message || 'Failed to create wallet', 'error');
    }
  },

  showMnemonicBackup(wallet, mnemonic) {
    const words = mnemonic.split(' ');
    const content = `
      <div class="mnemonic-backup">
        <div class="warning-box">
          <i class="fas fa-exclamation-triangle"></i>
          <p><strong>Important:</strong> Write down these 12 words in order and store them safely. This is the ONLY way to recover your wallet.</p>
        </div>
        <div class="mnemonic-grid">
          ${words.map((word, i) => `
            <div class="mnemonic-word">
              <span class="word-number">${i + 1}</span>
              <span class="word-text">${word}</span>
            </div>
          `).join('')}
        </div>
        <button class="primary-btn full-width" onclick="Utils.copyToClipboard('${mnemonic}'); UI.showToast('Recovery phrase copied!', 'success')">
          <i class="fas fa-copy"></i>
          Copy Recovery Phrase
        </button>
        <button class="secondary-btn full-width" onclick="UI.closeAllModals()">
          I've Saved It Securely
        </button>
      </div>
    `;

    UI.showModal(content, `Backup Recovery Phrase - ${wallet.name}`);
  },

  async showImportWalletModal() {
    const content = `
      <form id="import-wallet-form">
        <div class="form-group">
          <label>Wallet Name</label>
          <input type="text" id="import-wallet-name" placeholder="Imported Wallet" required>
        </div>
        <div class="form-group">
          <label>Recovery Phrase (12 words)</label>
          <textarea id="import-mnemonic" rows="3" placeholder="word1 word2 word3..." required></textarea>
        </div>
        <button type="submit" class="primary-btn full-width">
          <i class="fas fa-file-import"></i>
          Import Wallet
        </button>
      </form>
    `;

    UI.showModal(content, 'Import Existing Wallet');

    setTimeout(() => {
      document.getElementById('import-wallet-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.importWallet();
      });
    }, 100);
  },

  async importWallet() {
    try {
      const name = document.getElementById('import-wallet-name').value;
      const mnemonic = document.getElementById('import-mnemonic').value.trim();
      
      UI.showLoading('Importing wallet...');
      
      const response = await API.importWallet({ name, mnemonic });
      
      if (response.success) {
        UI.hideLoading();
        UI.closeAllModals();
        await this.loadWallets();
        UI.showToast('Wallet imported successfully!', 'success');
      }
    } catch (error) {
      UI.hideLoading();
      UI.showToast(error.message || 'Failed to import wallet', 'error');
    }
  },

  async copyAddress(address) {
    const success = await Utils.copyToClipboard(address);
    if (success) {
      UI.showToast('Address copied to clipboard!', 'success');
    }
  },

  async loadDashboard() {
    await this.loadWallets();
    await this.updateDashboardStats();
  },

  updateDashboardWallets() {
    const container = document.getElementById('wallet-list-dashboard');
    if (!container) return;

    if (this.wallets.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-wallet"></i>
          <p>No wallets created yet</p>
          <button class="primary-btn" onclick="WalletModule.showCreateWalletModal()">Create Wallet</button>
        </div>
      `;
      return;
    }

    container.innerHTML = this.wallets.slice(0, 3).map(wallet => `
      <div class="wallet-item">
        <div class="wallet-icon"><i class="fas fa-wallet"></i></div>
        <div class="wallet-details">
          <div class="wallet-name">${wallet.name}</div>
          <div class="wallet-address">${Utils.shortenAddress(wallet.address)}</div>
        </div>
        <div class="wallet-balance">${wallet.balance || '0.0000'} DOT</div>
      </div>
    `).join('');
  },

  async updateDashboardStats() {
    try {
      // Get total balance
      let totalDOT = 0;
      this.wallets.forEach(w => totalDOT += parseFloat(w.balance || 0));

      // Get DOT price
      const priceData = await API.getDOTPrice();
      const dotPrice = priceData.price.usd;
      const totalUSD = totalDOT * dotPrice;

      // Update UI
      document.getElementById('total-balance').textContent = `${Utils.formatDOT(totalDOT)} DOT`;
      document.getElementById('total-balance-usd').textContent = `≈ ${Utils.formatCurrency(totalUSD)}`;
      document.getElementById('dot-price').textContent = `1 DOT = ${Utils.formatCurrency(dotPrice)}`;
      
      const change = priceData.price.change24h || 0;
      const changeEl = document.getElementById('price-change');
      changeEl.innerHTML = `<i class="fas fa-arrow-${change >= 0 ? 'up' : 'down'}"></i> ${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
      changeEl.className = `price-change ${change >= 0 ? 'up' : 'down'}`;

      // Update stat cards
      document.getElementById('stat-available').textContent = `${Utils.formatDOT(totalDOT)} DOT`;
      document.getElementById('stat-available-usd').textContent = `≈ ${Utils.formatCurrency(totalUSD)}`;
    } catch (error) {
      console.error('Error updating dashboard stats:', error);
    }
  },
};

window.WalletModule = WalletModule;
