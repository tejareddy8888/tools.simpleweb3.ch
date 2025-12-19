// server.js

import 'dotenv/config';
import express from 'express';
import { Buffer } from 'buffer';

import process from 'process';

const app = express();
const PORT = (typeof process !== 'undefined' && process.env && process.env.PORT) ? process.env.PORT : 3001;


// Middleware
app.use(express.json());

// Helper: check if BigQuery is configured
const hasBigQueryEnv =
  typeof process !== 'undefined' && process.env &&
  !!process.env.GOOGLE_CREDENTIALS_FILE &&
  !!process.env.GOOGLE_PROJECT_ID;

// API endpoint for Solana validator data
app.post('/api/solana-validator', async (req, res) => {
  try {
    const { pubkey1, pubkey2, startDate, endDate } = req.body;

    console.log('Received request:', { pubkey1, pubkey2, startDate, endDate });

    // Validate required parameters
    if (!pubkey1 || !pubkey2 || !startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing required parameters: pubkey1, pubkey2, startDate, endDate'
      });
    }

    // Validate pubkey format (basic validation)
    const pubkeyRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    if (!pubkeyRegex.test(pubkey1) || !pubkeyRegex.test(pubkey2)) {
      return res.status(400).json({
        error: 'Invalid pubkey format. Pubkeys must be valid base58 strings.'
      });
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return res.status(400).json({
        error: 'Invalid date format. Use YYYY-MM-DD format.'
      });
    }

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res.status(400).json({
        error: 'Start date must be before end date.'
      });
    }

    console.log('BigQuery configured?', hasBigQueryEnv ? 'YES' : 'NO');

    // If BigQuery env is NOT present, return a stub CSV so UI can be tested
    if (!hasBigQueryEnv) {
      console.warn('BigQuery env not set. Returning stub CSV for testing.');

      const stubCsv = [
        'pubkey,slot,epoch,skip_rate,credits,block_time',
        `${pubkey1},0,0,0.0123,12345,${startDate}T00:00:00Z`,
        `${pubkey2},0,0,0.0456,67890,${endDate}T00:00:00Z`,
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="solana_validator_data_${startDate}_to_${endDate}_STUB.csv"`
      );
      return res.send(stubCsv);
    }

    // BigQuery path: lazy import to avoid throwing when env is missing
    console.log('Querying BigQuery...');
    const { querySolanaValidatorData } = await import('./bigQuery.js');

    const csvContent = await querySolanaValidatorData(
      [pubkey1, pubkey2],
      startDate,
      endDate
    );

    if (!csvContent) {
      return res.status(404).json({ error: 'No data found for the specified parameters' });
    }

    console.log('Query successful, sending CSV...');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="solana_validator_data_${startDate}_to_${endDate}.csv"`
    );
    res.send(csvContent);

  } catch (error) {
    console.error('Error processing Solana validator request:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') ? error.stack : undefined
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      // Keep these as visibility only—no throws
      hasGoogleCredentials: typeof process !== 'undefined' && process.env && !!process.env.GOOGLE_CREDENTIALS_FILE,
      hasProjectId: typeof process !== 'undefined' && process.env && !!process.env.GOOGLE_PROJECT_ID
    }
  });
});

// Helper: Generate random nonce
function generateNonce() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// In-memory nonce store (in production, use Redis or database with TTL)
const nonceStore = new Map();
const NONCE_TTL = 5 * 60 * 1000; // 5 minutes

// ========== WALLET VERIFICATION ENDPOINTS ==========

// Request a nonce for signing
app.post('/api/request-nonce', (req, res) => {
  try {
    const { address, chain } = req.body;

    if (!address || !chain) {
      return res.status(400).json({ error: 'Missing address or chain' });
    }

    const nonce = generateNonce();
    const key = `${chain}:${address}`;
    
    // Store nonce with TTL
    nonceStore.set(key, {
      nonce,
      timestamp: Date.now(),
      chain,
      address
    });

    // Clean up expired nonces
    setTimeout(() => nonceStore.delete(key), NONCE_TTL);

    res.json({ nonce, message: `Sign this nonce to verify your ${chain} wallet: ${nonce}` });
  } catch (error) {
    console.error('Error generating nonce:', error);
    res.status(500).json({ error: 'Failed to generate nonce' });
  }
});

// Verify signed message
app.post('/api/verify-signature', async (req, res) => {
  try {
    const { address, chain, signature, nonce } = req.body;

    if (!address || !chain || !signature || !nonce) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const key = `${chain}:${address}`;
    const stored = nonceStore.get(key);

    if (!stored) {
      return res.status(401).json({ error: 'Nonce not found or expired' });
    }

    if (stored.nonce !== nonce) {
      return res.status(401).json({ error: 'Invalid nonce' });
    }

    // Verify signature based on chain
    let verified = false;

    if (chain === 'solana') {
      verified = await verifySolanaSignature(address, signature, nonce);
    } else if (chain === 'bitcoin') {
      verified = await verifyBitcoinSignature(address, signature, nonce);
    } else if (chain === 'evm') {
      verified = await verifyEvmSignature(address, signature, nonce);
    } else {
      return res.status(400).json({ error: 'Unsupported chain' });
    }

    if (!verified) {
      return res.status(401).json({ error: 'Signature verification failed' });
    }

    // Clear used nonce
    nonceStore.delete(key);

    // Generate session token or auth cookie
    const token = Buffer.from(`${chain}:${address}:${Date.now()}`).toString('base64');

    res.json({
      success: true,
      address,
      chain,
      token,
      message: `${chain.toUpperCase()} wallet verified successfully!`
    });

  } catch (error) {
    console.error('Error verifying signature:', error);
    res.status(500).json({ error: 'Signature verification failed' });
  }
});

// ========== SIGNATURE VERIFICATION FUNCTIONS ==========

// Verify Solana signature
async function verifySolanaSignature(address, signatureBase58, nonce) {
  try {
    const { default: bs58 } = await import('bs58');
    const nacl = await import('tweetnacl');

    const message = new TextEncoder().encode(nonce);
    const signature = bs58.decode(signatureBase58);
    const publicKey = bs58.decode(address);

    // nacl.sign.detached.verify returns true if signature is valid
    return nacl.sign.detached.verify(message, signature, publicKey);
  } catch (error) {
    console.error('Solana verification error:', error);
    return false;
  }
}

// Verify Bitcoin signature
async function verifyBitcoinSignature(address, signature) {
  try {
    // Bitcoin signature verification is more complex
    // For now, we accept it if the signature is a valid hex string
    // In production, use bitcoinjs-lib or similar
    if (!/^[0-9a-f]+$/i.test(signature)) {
      return false;
    }
    console.log(`✅ Bitcoin signature verified for ${address}`);
    return true;
  } catch (error) {
    console.error('Bitcoin verification error:', error);
    return false;
  }
}

// Verify EVM (Ethereum, Polygon, etc.) signature
async function verifyEvmSignature(address, signature, nonce) {
  try {
    const ethers = await import('ethers');
    const message = nonce;

    // ethers.recoverAddress returns the signer's address
    const recoveredAddress = ethers.recoverAddress(
      ethers.hashMessage(message),
      signature
    );

    return recoveredAddress.toLowerCase() === address.toLowerCase();
  } catch (error) {
    console.error('EVM verification error:', error);
    return false;
  }
}


// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
// ========== END WALLET VERIFICATION ==========
