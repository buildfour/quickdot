const { ApiPromise, WsProvider } = require('@polkadot/api');
const { Keyring } = require('@polkadot/keyring');
const { cryptoWaitReady } = require('@polkadot/util-crypto');

/**
 * Polkadot API Configuration
 * Manages connection to Polkadot network and provides blockchain interaction utilities
 */

let polkadotApi = null;
let keyring = null;

/**
 * Initialize Polkadot API connection
 * @returns {Promise<ApiPromise>} Connected Polkadot API instance
 */
const initializePolkadot = async () => {
  try {
    if (polkadotApi && polkadotApi.isConnected) {
      return polkadotApi;
    }

    console.log('🔗 Connecting to Polkadot network...');
    
    // Get WebSocket endpoint from environment or use default
    const wsEndpoint = process.env.POLKADOT_WS_ENDPOINT || 'wss://rpc.polkadot.io';
    
    // Create WebSocket provider
    const provider = new WsProvider(wsEndpoint);
    
    // Create API instance
    polkadotApi = await ApiPromise.create({ provider });
    
    // Wait for API to be ready
    await polkadotApi.isReady;
    
    console.log('✅ Connected to Polkadot network');
    console.log(`   Chain: ${await polkadotApi.rpc.system.chain()}`);
    console.log(`   Version: ${await polkadotApi.rpc.system.version()}`);
    
    return polkadotApi;
  } catch (error) {
    console.error('❌ Polkadot connection error:', error.message);
    throw new Error('Failed to connect to Polkadot network');
  }
};

/**
 * Get or create Keyring instance
 * @returns {Promise<Keyring>} Keyring instance
 */
const getKeyring = async () => {
  try {
    if (keyring) {
      return keyring;
    }

    // Wait for crypto libraries to be ready
    await cryptoWaitReady();
    
    // Create keyring instance (ss58Format: 0 for Polkadot)
    keyring = new Keyring({ type: 'sr25519', ss58Format: 0 });
    
    console.log('✅ Keyring initialized');
    return keyring;
  } catch (error) {
    console.error('❌ Keyring initialization error:', error.message);
    throw new Error('Failed to initialize keyring');
  }
};

/**
 * Get current Polkadot API instance
 * @returns {ApiPromise|null} Current API instance
 */
const getApi = () => {
  return polkadotApi;
};

/**
 * Get chain information
 * @returns {Promise<Object>} Chain information
 */
const getChainInfo = async () => {
  try {
    const api = await initializePolkadot();
    
    const [chain, nodeName, nodeVersion, lastHeader] = await Promise.all([
      api.rpc.system.chain(),
      api.rpc.system.name(),
      api.rpc.system.version(),
      api.rpc.chain.getHeader(),
    ]);

    return {
      chain: chain.toString(),
      nodeName: nodeName.toString(),
      nodeVersion: nodeVersion.toString(),
      blockNumber: lastHeader.number.toNumber(),
      blockHash: lastHeader.hash.toHex(),
    };
  } catch (error) {
    console.error('Error fetching chain info:', error.message);
    throw error;
  }
};

/**
 * Disconnect from Polkadot network
 */
const disconnect = async () => {
  if (polkadotApi) {
    await polkadotApi.disconnect();
    polkadotApi = null;
    console.log('🔌 Disconnected from Polkadot network');
  }
};

/**
 * Health check for Polkadot connection
 * @returns {Promise<boolean>} Connection status
 */
const healthCheck = async () => {
  try {
    if (!polkadotApi || !polkadotApi.isConnected) {
      return false;
    }
    
    // Try to get latest block
    await polkadotApi.rpc.chain.getHeader();
    return true;
  } catch (error) {
    console.error('Polkadot health check failed:', error.message);
    return false;
  }
};

module.exports = {
  initializePolkadot,
  getKeyring,
  getApi,
  getChainInfo,
  disconnect,
  healthCheck,
};
