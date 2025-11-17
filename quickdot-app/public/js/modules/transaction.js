/**
 * Transaction Module
 * Handles sending, receiving, and transaction history
 */

const TransactionModule = {
  transactions: [],

  async init() {
    this.setupEventListeners();
  },

  setupEventListeners() {
    // Send form
    document.getElementById('send-form')?.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.sendTransaction();
    });

    // MAX button
    document.getElementById('send-max-btn')?.addEventListener('click', () => {
      this.setMaxAmount();
    });

    // Amount input - update USD value
    document.getElementById('send-amount')?.addEventListener('input', async (e) => {
      await this.updateSendSummary();
    });

    // Receive wallet select
    document.getElementById('receive-wallet-select')?.addEventListener('change', (e) => {
      this.updateReceiveAddress();
    });

    // Copy address
    document.getElementById('copy-address-btn')?.addEventListener('click', async () => {
      const address = document.getElementById('receive-address').textContent;
      const success = await Utils.copyToClipboard(address);
      if (success) UI.showToast('Address copied!', 'success');
    });
  },

  async loadSendPage() {
    await this.populateWalletSelects();
  },

  async loadReceivePage() {
    await this.populateWalletSelects();
  },

  async populateWalletSelects() {
    const sendSelect = document.getElementById('send-from-wallet');
    const receiveSelect = document.getElementById('receive-wallet-select');

    if (!window.WalletModule.wallets.length) {
      const option = '<option value="">No wallets available</option>';
      if (sendSelect) sendSelect.innerHTML = option;
      if (receiveSelect) receiveSelect.innerHTML = option;
      return;
    }

    const options = window.WalletModule.wallets.map(w => 
      `<option value="${w.id}" data-address="${w.address}" data-balance="${w.balance}">${w.name} (${Utils.formatDOT(w.balance)} DOT)</option>`
    ).join('');

    if (sendSelect) {
      sendSelect.innerHTML = '<option value="">Select wallet...</option>' + options;
    }
    if (receiveSelect) {
      receiveSelect.innerHTML = '<option value="">Select wallet...</option>' + options;
    }
  },

  async setMaxAmount() {
    const select = document.getElementById('send-from-wallet');
    const selectedOption = select.options[select.selectedIndex];
    
    if (!selectedOption || !selectedOption.value) {
      UI.showToast('Please select a wallet first', 'warning');
      return;
    }

    const balance = parseFloat(selectedOption.dataset.balance || 0);
    const fee = parseFloat(CONFIG.TX_FEE_ESTIMATE);
    const maxAmount = Math.max(0, balance - fee);

    document.getElementById('send-amount').value = maxAmount.toFixed(4);
    await this.updateSendSummary();
  },

  async updateSendSummary() {
    const amount = parseFloat(document.getElementById('send-amount').value || 0);
    const fee = parseFloat(CONFIG.TX_FEE_ESTIMATE);
    const total = amount + fee;

    try {
      const priceData = await API.getDOTPrice();
      const usdValue = amount * priceData.price.usd;
      document.getElementById('send-amount-usd').textContent = `≈ ${Utils.formatCurrency(usdValue)}`;
    } catch (error) {
      document.getElementById('send-amount-usd').textContent = '≈ $0.00';
    }

    document.getElementById('summary-amount').textContent = `${Utils.formatDOT(amount)} DOT`;
    document.getElementById('summary-fee').textContent = `${Utils.formatDOT(fee)} DOT`;
    document.getElementById('summary-total').textContent = `${Utils.formatDOT(total)} DOT`;
  },

  async sendTransaction() {
    try {
      const walletId = document.getElementById('send-from-wallet').value;
      const toAddress = document.getElementById('send-to-address').value;
      const amount = document.getElementById('send-amount').value;
      const note = document.getElementById('send-note').value;

      if (!walletId) {
        UI.showToast('Please select a wallet', 'warning');
        return;
      }

      if (!toAddress) {
        UI.showToast('Please enter recipient address', 'warning');
        return;
      }

      if (!amount || parseFloat(amount) <= 0) {
        UI.showToast('Please enter a valid amount', 'warning');
        return;
      }

      // Get wallet details
      const wallet = window.WalletModule.wallets.find(w => w.id === walletId);
      if (!wallet) {
        UI.showToast('Wallet not found', 'error');
        return;
      }

      UI.showConfirmation(
        `Send ${amount} DOT to ${Utils.shortenAddress(toAddress)}?`,
        async () => {
          try {
            UI.showLoading('Sending transaction...');

            const response = await API.sendTransaction({
              walletId,
              fromAddress: wallet.address,
              toAddress,
              amount,
              note,
            });

            UI.hideLoading();

            if (response.success) {
              UI.showToast('Transaction sent successfully!', 'success');
              
              // Reset form
              document.getElementById('send-form').reset();
              
              // Refresh wallets
              await window.WalletModule.loadWallets();
              
              // Show page history
              UI.showPage('history');
            }
          } catch (error) {
            UI.hideLoading();
            UI.showToast(error.message || 'Transaction failed', 'error');
          }
        }
      );
    } catch (error) {
      UI.showToast(error.message || 'Error preparing transaction', 'error');
    }
  },

  updateReceiveAddress() {
    const select = document.getElementById('receive-wallet-select');
    const selectedOption = select.options[select.selectedIndex];

    if (!selectedOption || !selectedOption.value) {
      document.getElementById('receive-address').textContent = 'Select a wallet';
      document.getElementById('qr-code').innerHTML = '';
      return;
    }

    const address = selectedOption.dataset.address;
    document.getElementById('receive-address').textContent = address;
    
    // Generate QR code
    Utils.generateQRCode(address, 'qr-code');
  },

  async loadHistory() {
    try {
      const response = await API.getTransactionHistory({ limit: 50 });
      
      if (response.success) {
        this.transactions = response.transactions;
        this.renderTransactions();
        await this.updateTransactionStats();
      }
    } catch (error) {
      console.error('Error loading transaction history:', error);
    }
  },

  renderTransactions() {
    const container = document.getElementById('transaction-list');
    if (!container) return;

    if (this.transactions.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-exchange-alt"></i>
          <p>No transactions yet</p>
        </div>
      `;
      return;
    }

    container.innerHTML = this.transactions.map(tx => `
      <div class="transaction-item ${tx.type}">
        <div class="tx-icon">
          <i class="fas fa-${tx.type === 'sent' ? 'arrow-up' : 'arrow-down'}"></i>
        </div>
        <div class="tx-details">
          <div class="tx-type">${tx.type === 'sent' ? 'Sent' : 'Received'}</div>
          <div class="tx-address">${tx.type === 'sent' ? 'To: ' : 'From: '}${Utils.shortenAddress(tx.type === 'sent' ? tx.to : tx.from)}</div>
          <div class="tx-date">${Utils.getRelativeTime(tx.createdAt)}</div>
        </div>
        <div class="tx-amount ${tx.type}">
          ${tx.type === 'sent' ? '-' : '+'}${Utils.formatDOT(tx.amount)} DOT
        </div>
        <div class="tx-status ${tx.status}">
          <i class="fas fa-${tx.status === 'confirmed' ? 'check-circle' : 'clock'}"></i>
          ${tx.status}
        </div>
      </div>
    `).join('');

    // Update badge
    document.getElementById('history-badge').textContent = this.transactions.length;
  },

  async updateTransactionStats() {
    try {
      const response = await API.getTransactionStats();
      
      if (response.success) {
        const stats = response.stats;
        
        document.getElementById('stat-sent').textContent = `${Utils.formatDOT(stats.totalSent)} DOT`;
        document.getElementById('stat-sent-count').textContent = `${stats.sentCount} transactions`;
        
        document.getElementById('stat-received').textContent = `${Utils.formatDOT(stats.totalReceived)} DOT`;
        document.getElementById('stat-received-count').textContent = `${stats.receivedCount} transactions`;
      }
    } catch (error) {
      console.error('Error updating transaction stats:', error);
    }
  },
};

window.TransactionModule = TransactionModule;
