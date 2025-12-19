// src/utils/bitcoinTransaction.js
// Bitcoin transaction helper: UTXO fetching, TX building, and broadcasting via wallet provider

const MEMPOOL_API_TESTNET = 'https://testnet.mempool.space/api';
const MEMPOOL_API_MAINNET = 'https://mempool.space/api';
// Blockstream APIs available as fallback alternatives
// const BLOCKSTREAM_TESTNET = 'https://blockstream.info/testnet/api';
// const BLOCKSTREAM_MAINNET = 'https://blockstream.info/api';

/**
 * Detect Bitcoin network from address
 * @param {string} address - Bitcoin address
 * @returns {'testnet' | 'mainnet'} - Detected network
 */
export function detectBitcoinNetwork(address) {
  if (!address) return 'mainnet';
  
  // Testnet indicators
  if (address.startsWith('tb1') || address.startsWith('m') || address.startsWith('n')) {
    return 'testnet';
  }
  
  // Mainnet indicators
  if (address.startsWith('bc1') || address.startsWith('1') || address.startsWith('3')) {
    return 'mainnet';
  }
  
  return 'mainnet'; // default
}

/**
 * Validate Bitcoin address format
 * @param {string} address - Bitcoin address to validate
 * @returns {boolean} - True if valid
 */
export function validateBitcoinAddress(address) {
  if (!address || typeof address !== 'string') return false;
  
  // P2WPKH (bech32) - starts with bc1 (mainnet) or tb1 (testnet)
  if (/^(bc1|tb1)[a-z0-9]{39,59}$/i.test(address)) return true;
  
  // P2PKH - starts with 1 (mainnet) or m/n (testnet)
  if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) return true;
  
  // P2SH - starts with 3 (mainnet) or 2 (testnet)
  if (/^[32][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) return true;
  
  return false;
}

/**
 * Fetch UTXOs for a Bitcoin address from mempool.space
 * @param {string} address - Bitcoin address
 * @param {string} network - 'mainnet' or 'testnet'
 * @returns {Promise<Array>} - Array of UTXOs
 */
export async function fetchBitcoinUTXOs(address, network = 'mainnet') {
  const apiUrl = network === 'testnet' ? MEMPOOL_API_TESTNET : MEMPOOL_API_MAINNET;
  
  try {
    const response = await fetch(`${apiUrl}/address/${address}/utxo`);
    if (!response.ok) {
      throw new Error(`Failed to fetch UTXOs: ${response.statusText}`);
    }
    
    const utxos = await response.json();
    return Array.isArray(utxos) ? utxos : [];
  } catch (error) {
    console.error('UTXO fetch error:', error);
    throw new Error(`Unable to fetch UTXOs: ${error.message}`);
  }
}

/**
 * Estimate Bitcoin transaction fee
 * @param {string} network - 'mainnet' or 'testnet'
 * @param {string} feeRate - 'slow', 'normal', 'fast'
 * @returns {Promise<number>} - Fee rate in sat/vB
 */
export async function estimateBitcoinFee(network = 'mainnet', feeRate = 'normal') {
  const apiUrl = network === 'testnet' ? MEMPOOL_API_TESTNET : MEMPOOL_API_MAINNET;
  
  try {
    const response = await fetch(`${apiUrl}/v1/fees/recommended`);
    if (!response.ok) {
      throw new Error(`Failed to fetch fees: ${response.statusText}`);
    }
    
    const fees = await response.json();
    
    // Return appropriate fee based on rate
    switch (feeRate) {
      case 'slow':
        return Math.ceil(fees.slowFee || 10);
      case 'fast':
        return Math.ceil(fees.fastFee || 30);
      case 'normal':
      default:
        return Math.ceil(fees.halfHourFee || 15);
    }
  } catch (error) {
    console.error('Fee estimation error:', error);
    // Return reasonable default if API fails
    return feeRate === 'fast' ? 30 : feeRate === 'slow' ? 10 : 15;
  }
}

/**
 * Build a simple Bitcoin transaction (PSBT format)
 * Note: This is a simplified transaction builder. Production should use bitcoinjs-lib.
 * For now, we'll prepare the TX data and let the wallet handle the actual PSBT building.
 * 
 * @param {Object} params - Transaction parameters
 * @param {string} params.fromAddress - Sender address
 * @param {string} params.toAddress - Recipient address
 * @param {number} params.amountBTC - Amount in BTC
 * @param {number} params.feeRate - Fee rate in sat/vB
 * @param {string} params.network - 'mainnet' or 'testnet'
 * @returns {Object} - Transaction data for wallet signing
 */
export function buildBitcoinTransaction(params) {
  const { fromAddress, toAddress, amountBTC, feeRate = 15, network = 'mainnet' } = params;
  
  // Validate inputs
  if (!validateBitcoinAddress(fromAddress)) {
    throw new Error('Invalid sender address');
  }
  if (!validateBitcoinAddress(toAddress)) {
    throw new Error('Invalid recipient address');
  }
  if (amountBTC <= 0) {
    throw new Error('Amount must be greater than 0');
  }
  if (amountBTC > 21000000) {
    throw new Error('Amount exceeds maximum Bitcoin supply');
  }
  
  // Convert BTC to satoshis
  const satoshis = Math.round(amountBTC * 100000000);
  
  return {
    from: fromAddress,
    to: toAddress,
    amount: satoshis, // in satoshis
    feeRate: Math.max(1, feeRate), // min 1 sat/vB
    network,
    // Additional metadata for wallet
    metadata: {
      description: `Send ${amountBTC} BTC to ${toAddress}`,
      timestamp: Date.now(),
    },
  };
}

/**
 * Send Bitcoin transaction via wallet provider
 * This function prepares the TX and requests the wallet to sign and broadcast it.
 * 
 * @param {Object} params - Parameters for sending
 * @param {Object} params.btcProvider - Bitcoin wallet provider (Unisat, Xverse, etc.)
 * @param {string} params.fromAddress - Sender address
 * @param {string} params.toAddress - Recipient address
 * @param {number} params.amountBTC - Amount in BTC
 * @param {string} params.network - 'mainnet' or 'testnet'
 * @returns {Promise<string>} - Transaction hash/ID
 */
export async function sendBitcoinTransaction(params) {
  const {
    btcProvider,
    fromAddress,
    toAddress,
    amountBTC,
    network = 'mainnet',
  } = params;
  
  if (!btcProvider) {
    throw new Error('Bitcoin wallet provider not available');
  }
  
  // Basic validation of sender address
  if (!validateBitcoinAddress(fromAddress)) {
    throw new Error('Invalid sender address');
  }
  
  // Estimate fee
  const feeRate = await estimateBitcoinFee(network, 'normal');
  
  // Note: we validate inputs and prepare metadata via buildBitcoinTransaction if needed.
  // For now we rely on the wallet provider's send API to construct and broadcast the raw TX.
  
  // Request wallet to sign and broadcast
  try {
    // Most Bitcoin wallets implement sendBitcoin or sendTransaction
    let txId;
    
    // Try modern method first (Unisat, Xverse, Leather)
    if (typeof btcProvider.sendBitcoin === 'function') {
      txId = await btcProvider.sendBitcoin(
        toAddress,
        Math.round(amountBTC * 100000000), // satoshis
        { feeRate }
      );
    }
    // Fallback to generic send
    else if (typeof btcProvider.send === 'function') {
      txId = await btcProvider.send(toAddress, amountBTC.toString(), { feeRate });
    }
    // Fallback to PSBT signing
    else if (typeof btcProvider.signPsbt === 'function') {
      // This is a simplified approach; production would need full PSBT handling
      console.warn('Wallet requires PSBT signing (advanced flow) - using fallback');
      throw new Error(
        'Wallet requires PSBT signing. Please upgrade to a wallet that supports sendBitcoin.'
      );
    }
    // Generic request method
    else if (typeof btcProvider.request === 'function') {
      txId = await btcProvider.request({
        method: 'sendBitcoin',
        params: {
          to: toAddress,
          amount: Math.round(amountBTC * 100000000),
          feeRate,
        },
      });
    }
    else {
      throw new Error('Wallet does not support sending transactions');
    }
    
    if (!txId) {
      throw new Error('No transaction ID returned from wallet');
    }
    
    console.log('Bitcoin tx sent:', txId);
    return txId;
  } catch (error) {
    console.error('Bitcoin send error:', error);
    throw new Error(`Failed to send Bitcoin: ${error.message}`);
  }
}

/**
 * Get Bitcoin transaction explorer URL
 * @param {string} txId - Transaction ID
 * @param {string} network - 'mainnet' or 'testnet'
 * @returns {string} - Explorer URL
 */
export function getBitcoinExplorerUrl(txId, network = 'mainnet') {
  if (!txId) return '';
  
  if (network === 'testnet') {
    return `https://mempool.space/testnet/tx/${txId}`;
  }
  
  return `https://mempool.space/tx/${txId}`;
}

/**
 * Get Bitcoin address balance
 * @param {string} address - Bitcoin address
 * @param {string} network - 'mainnet' or 'testnet'
 * @returns {Promise<number>} - Balance in BTC
 */
export async function getBitcoinBalance(address, network = 'mainnet') {
  const apiUrl = network === 'testnet' ? MEMPOOL_API_TESTNET : MEMPOOL_API_MAINNET;
  
  try {
    const response = await fetch(`${apiUrl}/address/${address}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch balance: ${response.statusText}`);
    }
    
    const data = await response.json();
    const satoshis = data.chain_stats?.funded_txo_sum - data.chain_stats?.spent_txo_sum || 0;
    return satoshis / 100000000; // Convert to BTC
  } catch (error) {
    console.error('Balance fetch error:', error);
    return 0;
  }
}
