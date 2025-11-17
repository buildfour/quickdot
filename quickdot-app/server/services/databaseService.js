const { getFirestore } = require('../config/firebase');
const crypto = require('crypto');

/**
 * Database Service
 * Handles all Firestore database operations
 */

class DatabaseService {
  /**
   * Encrypt sensitive data (e.g., mnemonic)
   * WARNING: In production, use proper encryption key management (e.g., Google Cloud KMS)
   * @param {string} text - Text to encrypt
   * @returns {string} Encrypted text
   */
  static encrypt(text) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.JWT_SECRET, 'salt', 32);
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv(algorithm, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return iv.toString('hex') + ':' + encrypted;
  }

  /**
   * Decrypt sensitive data
   * @param {string} text - Encrypted text
   * @returns {string} Decrypted text
   */
  static decrypt(text) {
    const algorithm = 'aes-256-cbc';
    const key = crypto.scryptSync(process.env.JWT_SECRET, 'salt', 32);
    
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Create user profile
   * @param {string} uid - User ID
   * @param {Object} userData - User data
   */
  static async createUser(uid, userData) {
    const db = getFirestore();
    
    await db.collection('users').doc(uid).set({
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Get user profile
   * @param {string} uid - User ID
   * @returns {Promise<Object>} User data
   */
  static async getUser(uid) {
    const db = getFirestore();
    const doc = await db.collection('users').doc(uid).get();
    
    if (!doc.exists) {
      return null;
    }
    
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Update user profile
   * @param {string} uid - User ID
   * @param {Object} updates - Data to update
   */
  static async updateUser(uid, updates) {
    const db = getFirestore();
    
    await db.collection('users').doc(uid).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Create wallet
   * @param {string} uid - User ID
   * @param {Object} walletData - Wallet data
   * @returns {Promise<string>} Wallet ID
   */
  static async createWallet(uid, walletData) {
    const db = getFirestore();
    
    // Encrypt mnemonic before storing
    if (walletData.mnemonic) {
      walletData.mnemonic = this.encrypt(walletData.mnemonic);
    }
    
    const walletRef = await db.collection('wallets').add({
      userId: uid,
      ...walletData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    return walletRef.id;
  }

  /**
   * Get user's wallets
   * @param {string} uid - User ID
   * @returns {Promise<Array>} Array of wallets
   */
  static async getUserWallets(uid) {
    const db = getFirestore();
    const snapshot = await db.collection('wallets')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      mnemonic: undefined, // Don't return mnemonic in list
    }));
  }

  /**
   * Get wallet by ID
   * @param {string} walletId - Wallet ID
   * @param {string} uid - User ID (for authorization)
   * @returns {Promise<Object>} Wallet data
   */
  static async getWallet(walletId, uid) {
    const db = getFirestore();
    const doc = await db.collection('wallets').doc(walletId).get();
    
    if (!doc.exists) {
      throw new Error('Wallet not found');
    }
    
    const wallet = doc.data();
    
    // Verify ownership
    if (wallet.userId !== uid) {
      throw new Error('Unauthorized access to wallet');
    }
    
    return { id: doc.id, ...wallet };
  }

  /**
   * Get decrypted mnemonic for transaction signing
   * @param {string} walletId - Wallet ID
   * @param {string} uid - User ID
   * @returns {Promise<string>} Decrypted mnemonic
   */
  static async getWalletMnemonic(walletId, uid) {
    const wallet = await this.getWallet(walletId, uid);
    
    if (!wallet.mnemonic) {
      throw new Error('Wallet mnemonic not found');
    }
    
    return this.decrypt(wallet.mnemonic);
  }

  /**
   * Update wallet
   * @param {string} walletId - Wallet ID
   * @param {string} uid - User ID
   * @param {Object} updates - Data to update
   */
  static async updateWallet(walletId, uid, updates) {
    const db = getFirestore();
    
    // Verify ownership first
    await this.getWallet(walletId, uid);
    
    await db.collection('wallets').doc(walletId).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Delete wallet
   * @param {string} walletId - Wallet ID
   * @param {string} uid - User ID
   */
  static async deleteWallet(walletId, uid) {
    const db = getFirestore();
    
    // Verify ownership first
    await this.getWallet(walletId, uid);
    
    await db.collection('wallets').doc(walletId).delete();
  }

  /**
   * Save transaction record
   * @param {string} uid - User ID
   * @param {Object} txData - Transaction data
   * @returns {Promise<string>} Transaction record ID
   */
  static async saveTransaction(uid, txData) {
    const db = getFirestore();
    
    const txRef = await db.collection('transactions').add({
      userId: uid,
      ...txData,
      createdAt: new Date().toISOString(),
    });
    
    return txRef.id;
  }

  /**
   * Get user's transactions
   * @param {string} uid - User ID
   * @param {number} limit - Number of transactions to fetch
   * @returns {Promise<Array>} Array of transactions
   */
  static async getUserTransactions(uid, limit = 50) {
    const db = getFirestore();
    const snapshot = await db.collection('transactions')
      .where('userId', '==', uid)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  /**
   * Create contact
   * @param {string} uid - User ID
   * @param {Object} contactData - Contact data
   * @returns {Promise<string>} Contact ID
   */
  static async createContact(uid, contactData) {
    const db = getFirestore();
    
    const contactRef = await db.collection('contacts').add({
      userId: uid,
      ...contactData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    
    return contactRef.id;
  }

  /**
   * Get user's contacts
   * @param {string} uid - User ID
   * @returns {Promise<Array>} Array of contacts
   */
  static async getUserContacts(uid) {
    const db = getFirestore();
    const snapshot = await db.collection('contacts')
      .where('userId', '==', uid)
      .orderBy('name', 'asc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
  }

  /**
   * Update contact
   * @param {string} contactId - Contact ID
   * @param {string} uid - User ID
   * @param {Object} updates - Data to update
   */
  static async updateContact(contactId, uid, updates) {
    const db = getFirestore();
    const doc = await db.collection('contacts').doc(contactId).get();
    
    if (!doc.exists) {
      throw new Error('Contact not found');
    }
    
    const contact = doc.data();
    if (contact.userId !== uid) {
      throw new Error('Unauthorized');
    }
    
    await db.collection('contacts').doc(contactId).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  /**
   * Delete contact
   * @param {string} contactId - Contact ID
   * @param {string} uid - User ID
   */
  static async deleteContact(contactId, uid) {
    const db = getFirestore();
    const doc = await db.collection('contacts').doc(contactId).get();
    
    if (!doc.exists) {
      throw new Error('Contact not found');
    }
    
    const contact = doc.data();
    if (contact.userId !== uid) {
      throw new Error('Unauthorized');
    }
    
    await db.collection('contacts').doc(contactId).delete();
  }
}

module.exports = DatabaseService;
