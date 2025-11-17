/**
 * Utility Functions
 * Common helper functions used throughout the application
 */

/**
 * Format DOT amount with proper decimals
 * @param {string|number} amount - Amount in DOT
 * @returns {string} Formatted amount
 */
const formatDOT = (amount) => {
  return parseFloat(amount).toFixed(4);
};

/**
 * Format currency amount
 * @param {string|number} amount - Amount
 * @param {string} currency - Currency code (USD, EUR, GBP)
 * @returns {string} Formatted currency
 */
const formatCurrency = (amount, currency = 'USD') => {
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
  };
  
  const symbol = symbols[currency] || '$';
  return `${symbol}${parseFloat(amount).toFixed(2)}`;
};

/**
 * Shorten address for display
 * @param {string} address - Full Polkadot address
 * @param {number} length - Number of characters to show on each end
 * @returns {string} Shortened address
 */
const shortenAddress = (address, length = 6) => {
  if (!address || address.length < length * 2) return address;
  return `${address.substring(0, length)}...${address.substring(address.length - length)}`;
};

/**
 * Format timestamp to readable date
 * @param {string|Date} timestamp - Timestamp
 * @returns {string} Formatted date
 */
const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Get relative time (e.g., "2 hours ago")
 * @param {string|Date} timestamp - Timestamp
 * @returns {string} Relative time
 */
const getRelativeTime = (timestamp) => {
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
};

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} Validation result
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Generate random color for avatar
 * @param {string} seed - Seed string (e.g., email)
 * @returns {string} Hex color
 */
const generateColor = (seed) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return '#' + '00000'.substring(0, 6 - c.length) + c;
};

/**
 * Sleep utility for delays
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise} Promise that resolves after delay
 */
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Safe JSON parse
 * @param {string} json - JSON string
 * @param {*} defaultValue - Default value if parse fails
 * @returns {*} Parsed value or default
 */
const safeJSONParse = (json, defaultValue = null) => {
  try {
    return JSON.parse(json);
  } catch {
    return defaultValue;
  }
};

/**
 * Check if string is valid JSON
 * @param {string} str - String to check
 * @returns {boolean} Validation result
 */
const isValidJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

module.exports = {
  formatDOT,
  formatCurrency,
  shortenAddress,
  formatDate,
  getRelativeTime,
  isValidEmail,
  generateColor,
  sleep,
  safeJSONParse,
  isValidJSON,
};
