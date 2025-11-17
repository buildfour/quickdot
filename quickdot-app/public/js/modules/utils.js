/**
 * Utilities Module
 * Common utility functions used throughout the application
 */

const Utils = {
  /**
   * Format DOT amount with proper decimals
   */
  formatDOT(amount) {
    return parseFloat(amount || 0).toFixed(4);
  },

  /**
   * Format currency amount
   */
  formatCurrency(amount, currency = 'USD') {
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥',
      CNY: '¥',
    };
    
    const symbol = symbols[currency] || '$';
    const value = parseFloat(amount || 0).toFixed(2);
    return `${symbol}${value}`;
  },

  /**
   * Shorten address for display
   */
  shortenAddress(address, length = 6) {
    if (!address || address.length < length * 2) return address;
    return `${address.substring(0, length)}...${address.substring(address.length - length)}`;
  },

  /**
   * Format timestamp to readable date
   */
  formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  /**
   * Get relative time (e.g., "2 hours ago")
   */
  getRelativeTime(timestamp) {
    const now = new Date();
    const date = new Date(timestamp);
    const seconds = Math.floor((now - date) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
      }
    }
    
    return 'just now';
  },

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (err) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  },

  /**
   * Generate QR code for address
   */
  generateQRCode(text, elementId, size = 256) {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    // Clear existing content
    element.innerHTML = '';
    
    // Using a simple QR code generation method
    // In production, use a library like qrcode.js
    const qrText = document.createElement('div');
    qrText.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      background: white;
      border: 2px solid #001F3F;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      word-break: break-all;
      padding: 20px;
      text-align: center;
    `;
    qrText.textContent = text;
    element.appendChild(qrText);
    
    // Note: For production, integrate a proper QR code library
    // Example: https://github.com/davidshimjs/qrcodejs
  },

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate Polkadot address format
   */
  isValidPolkadotAddress(address) {
    // Basic validation: Polkadot addresses start with '1' or '5' and are 47-48 characters
    return /^[15][a-zA-Z0-9]{46,47}$/.test(address);
  },

  /**
   * Debounce function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Format number with commas
   */
  formatNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  /**
   * Calculate percentage change
   */
  calculatePercentageChange(oldValue, newValue) {
    if (oldValue === 0) return 0;
    return ((newValue - oldValue) / oldValue) * 100;
  },

  /**
   * Get theme from localStorage
   */
  getTheme() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.THEME) || CONFIG.DEFAULTS.THEME;
  },

  /**
   * Set theme
   */
  setTheme(theme) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
  },

  /**
   * Toggle theme
   */
  toggleTheme() {
    const currentTheme = this.getTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
    return newTheme;
  },

  /**
   * Get currency from localStorage
   */
  getCurrency() {
    return localStorage.getItem(CONFIG.STORAGE_KEYS.CURRENCY) || CONFIG.DEFAULTS.CURRENCY;
  },

  /**
   * Set currency
   */
  setCurrency(currency) {
    localStorage.setItem(CONFIG.STORAGE_KEYS.CURRENCY, currency);
  },

  /**
   * Safe JSON parse
   */
  safeJSONParse(json, defaultValue = null) {
    try {
      return JSON.parse(json);
    } catch {
      return defaultValue;
    }
  },

  /**
   * Sleep utility
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Generate random ID
   */
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  },
};

// Export for use in other modules
window.Utils = Utils;
