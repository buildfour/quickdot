/**
 * API Module
 * Handles all HTTP requests to the backend API
 */

const API = {
  /**
   * Get authentication token from localStorage
   */
  getToken() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * Set authentication token
   */
  setToken(token) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN, token);
  },

  /**
   * Remove authentication token
   */
  clearToken() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * Make HTTP request
   */
  async request(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token && !options.skipAuth) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'GET',
    });
  },

  /**
   * POST request
   */
  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * PUT request
   */
  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'DELETE',
    });
  },

  // ===== User Endpoints =====
  
  async authenticateUser(firebaseToken) {
    return this.post('/user/auth', { firebaseToken }, { skipAuth: true });
  },

  async getUserProfile() {
    return this.get('/user/profile');
  },

  async updateUserProfile(data) {
    return this.put('/user/profile', data);
  },

  async updateUserSettings(data) {
    return this.put('/user/settings', data);
  },

  async getUserStats() {
    return this.get('/user/stats');
  },

  // ===== Wallet Endpoints =====
  
  async generateMnemonic() {
    return this.get('/wallet/generate-mnemonic', { skipAuth: true });
  },

  async createWallet(data) {
    return this.post('/wallet/create', data);
  },

  async importWallet(data) {
    return this.post('/wallet/import', data);
  },

  async getWallets() {
    return this.get('/wallet/list');
  },

  async getWallet(walletId) {
    return this.get(`/wallet/${walletId}`);
  },

  async getWalletBalance(walletId) {
    return this.get(`/wallet/${walletId}/balance`);
  },

  async updateWallet(walletId, data) {
    return this.put(`/wallet/${walletId}`, data);
  },

  async deleteWallet(walletId) {
    return this.delete(`/wallet/${walletId}`);
  },

  async validateAddress(address) {
    return this.post('/wallet/validate-address', { address }, { skipAuth: true });
  },

  // ===== Transaction Endpoints =====
  
  async sendTransaction(data) {
    return this.post('/transaction/send', data);
  },

  async getTransactionHistory(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.get(`/transaction/history${query ? '?' + query : ''}`);
  },

  async getTransaction(txHash) {
    return this.get(`/transaction/${txHash}`);
  },

  async getTransactionStats() {
    return this.get('/transaction/stats');
  },

  async estimateFee(data) {
    return this.post('/transaction/estimate-fee', data);
  },

  // ===== Portfolio Endpoints =====
  
  async getPortfolioOverview() {
    return this.get('/portfolio/overview');
  },

  async getDOTPrice() {
    return this.get('/portfolio/price', { skipAuth: true });
  },

  async getPortfolioAllocation() {
    return this.get('/portfolio/allocation');
  },

  async getPortfolioPerformance() {
    return this.get('/portfolio/performance');
  },

  async getNetworkStats() {
    return this.get('/portfolio/network-stats', { skipAuth: true });
  },

  // ===== Contact Endpoints =====
  
  async getContacts() {
    return this.get('/contact/list');
  },

  async createContact(data) {
    return this.post('/contact/create', data);
  },

  async updateContact(contactId, data) {
    return this.put(`/contact/${contactId}`, data);
  },

  async deleteContact(contactId) {
    return this.delete(`/contact/${contactId}`);
  },

  async searchContacts(query) {
    return this.get(`/contact/search?query=${encodeURIComponent(query)}`);
  },
};

// Export for use in other modules
window.API = API;
