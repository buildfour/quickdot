/**
 * Configuration Module
 * Centralized configuration for the application
 */

const CONFIG = {
  // API Configuration
  API_BASE_URL: window.location.origin + '/api',
  
  // Firebase Configuration
  // IMPORTANT: Replace with your actual Firebase config
  FIREBASE_CONFIG: {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  },
  
  // Application Settings
  APP_NAME: 'QuickDot',
  APP_VERSION: '1.0.0',
  
  // Local Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'quickdot_auth_token',
    USER_DATA: 'quickdot_user_data',
    THEME: 'quickdot_theme',
    CURRENCY: 'quickdot_currency',
  },
  
  // Default Settings
  DEFAULTS: {
    THEME: 'light',
    CURRENCY: 'USD',
    LANGUAGE: 'en',
  },
  
  // Polkadot Configuration
  POLKADOT: {
    DECIMALS: 10,
    SYMBOL: 'DOT',
    SS58_FORMAT: 0,
  },
  
  // Transaction Fee
  TX_FEE_ESTIMATE: '0.0100', // DOT
  
  // Refresh Intervals (milliseconds)
  REFRESH_INTERVALS: {
    BALANCE: 30000,  // 30 seconds
    PRICE: 60000,    // 1 minute
    TRANSACTIONS: 30000, // 30 seconds
  },
};

// Export for use in other modules
window.CONFIG = CONFIG;
