const { getApi, getKeyring, initializePolkadot } = require('../config/polkadot');
const { mnemonicGenerate, mnemonicValidate } = require('@polkadot/util-crypto');
const { encodeAddress, decodeAddress } = require('@polkadot/util-crypto');

/**
 * Polkadot Service
 * Handles all Polkadot blockchain interactions
 */

class PolkadotService {
  /**
   * Generate a new mnemonic phrase
   * @returns {string} 12-word mnemonic phrase
   */
  static generateMnemonic() {
    return mnemonicGenerate(12);
  }

  /**
   * Validate mnemonic phrase
   * @param {string} mnemonic - Mnemonic phrase to validate
   * @returns {boolean} Validation result
   */
  static validateMnemonic(mnemonic) {
    return mnemonicValidate(mnemonic);
  }

  /**
   * Create account from mnemonic
   * @param {string} mnemonic - Mnemonic phrase
   * @param {string} name - Account name
   * @returns {Promise<Object>} Account details
   */
  static async createAccount(mnemonic, name = 'My Account') {
    try {
      await initializePolkadot();
      const keyring = await getKeyring();
      
      // Create account from mnemonic
      const account = keyring.addFromMnemonic(mnemonic);
      
      return {
        address: account.address,
        publicKey: Buffer.from(account.publicKey).toString('hex'),
        name: name,
        mnemonic: mnemonic, // WARNING: Store encrypted in production
      };
    } catch (error) {
      throw new Error(`Failed to create account: ${error.message}`);
    }
  }

  /**
   * Import existing account from mnemonic
   * @param {string} mnemonic - Mnemonic phrase
   * @param {string} name - Account name
   * @returns {Promise<Object>} Account details
   */
  static async importAccount(mnemonic, name = 'Imported Account') {
    try {
      if (!this.validateMnemonic(mnemonic)) {
        throw new Error('Invalid mnemonic phrase');
      }

      return await this.createAccount(mnemonic, name);
    } catch (error) {
      throw new Error(`Failed to import account: ${error.message}`);
    }
  }

  /**
   * Get account balance
   * @param {string} address - Polkadot address
   * @returns {Promise<Object>} Balance information
   */
  static async getBalance(address) {
    try {
      const api = await initializePolkadot();
      
      // Get account info
      const { data: balances } = await api.query.system.account(address);
      
      // Convert from Planck to DOT (1 DOT = 10^10 Planck)
      const free = balances.free.toBn();
      const reserved = balances.reserved.toBn();
      const frozen = balances.frozen.toBn();
      
      const divisor = 10_000_000_000; // 10^10
      
      return {
        address,
        free: (free.toNumber() / divisor).toFixed(4),
        reserved: (reserved.toNumber() / divisor).toFixed(4),
        frozen: (frozen.toNumber() / divisor).toFixed(4),
        total: ((free.toNumber() + reserved.toNumber()) / divisor).toFixed(4),
      };
    } catch (error) {
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  /**
   * Send transaction
   * @param {Object} params - Transaction parameters
   * @returns {Promise<Object>} Transaction result
   */
  static async sendTransaction({ fromAddress, toAddress, amount, mnemonic }) {
    try {
      const api = await initializePolkadot();
      const keyring = await getKeyring();
      
      // Get sender account
      const sender = keyring.addFromMnemonic(mnemonic);
      
      // Verify sender address matches
      if (sender.address !== fromAddress) {
        throw new Error('Mnemonic does not match sender address');
      }
      
      // Convert amount to Planck
      const amountInPlanck = Math.floor(parseFloat(amount) * 10_000_000_000);
      
      // Create transfer transaction
      const transfer = api.tx.balances.transferKeepAlive(toAddress, amountInPlanck);
      
      // Sign and send transaction
      return new Promise((resolve, reject) => {
        transfer
          .signAndSend(sender, ({ status, txHash, events }) => {
            if (status.isInBlock) {
              console.log(`Transaction included in block ${status.asInBlock}`);
              
              // Check for errors in events
              let hasError = false;
              events.forEach(({ event }) => {
                if (api.events.system.ExtrinsicFailed.is(event)) {
                  hasError = true;
                }
              });
              
              if (hasError) {
                reject(new Error('Transaction failed'));
              } else {
                resolve({
                  success: true,
                  txHash: txHash.toHex(),
                  blockHash: status.asInBlock.toHex(),
                  from: fromAddress,
                  to: toAddress,
                  amount: amount,
                });
              }
            }
          })
          .catch(reject);
      });
    } catch (error) {
      throw new Error(`Failed to send transaction: ${error.message}`);
    }
  }

  /**
   * Get transaction details
   * @param {string} txHash - Transaction hash
   * @returns {Promise<Object>} Transaction details
   */
  static async getTransaction(txHash) {
    try {
      const api = await initializePolkadot();
      
      // Get block containing transaction
      const signedBlock = await api.rpc.chain.getBlock(txHash);
      
      return {
        blockHash: signedBlock.block.header.hash.toHex(),
        blockNumber: signedBlock.block.header.number.toNumber(),
        extrinsics: signedBlock.block.extrinsics.map(ext => ({
          hash: ext.hash.toHex(),
          method: ext.method.section + '.' + ext.method.method,
        })),
      };
    } catch (error) {
      throw new Error(`Failed to get transaction: ${error.message}`);
    }
  }

  /**
   * Validate Polkadot address
   * @param {string} address - Address to validate
   * @returns {boolean} Validation result
   */
  static validateAddress(address) {
    try {
      decodeAddress(address);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get current DOT price from CoinGecko
   * @returns {Promise<Object>} Price data
   */
  static async getDOTPrice() {
    try {
      const axios = require('axios');
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=polkadot&vs_currencies=usd,eur,gbp&include_24hr_change=true'
      );
      
      return {
        usd: response.data.polkadot.usd,
        eur: response.data.polkadot.eur,
        gbp: response.data.polkadot.gbp,
        change24h: response.data.polkadot.usd_24h_change,
      };
    } catch (error) {
      // Return mock data if API fails
      return {
        usd: 7.50,
        eur: 6.90,
        gbp: 5.95,
        change24h: 2.5,
      };
    }
  }

  /**
   * Get network statistics
   * @returns {Promise<Object>} Network stats
   */
  static async getNetworkStats() {
    try {
      const api = await initializePolkadot();
      
      const [header, totalIssuance, sessionProgress] = await Promise.all([
        api.rpc.chain.getHeader(),
        api.query.balances.totalIssuance(),
        api.derive.session.progress(),
      ]);
      
      return {
        blockNumber: header.number.toNumber(),
        blockHash: header.hash.toHex(),
        totalIssuance: (totalIssuance.toBn().toNumber() / 10_000_000_000).toFixed(2),
        sessionProgress: sessionProgress.sessionProgress.toNumber(),
      };
    } catch (error) {
      throw new Error(`Failed to get network stats: ${error.message}`);
    }
  }
}

module.exports = PolkadotService;
