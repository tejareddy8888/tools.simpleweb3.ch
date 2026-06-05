import 'dotenv/config';
import { BigQuery } from '@google-cloud/bigquery';

// Check for required environment variables
if (!process.env.GOOGLE_CREDENTIALS_FILE || !process.env.GOOGLE_PROJECT_ID) {
  console.error('Error: Environment variables GOOGLE_CREDENTIALS_FILE and GOOGLE_PROJECT_ID must be set.');
  process.exit(1);
}

// Decode base64 credentials and parse JSON
let credentials;
try {
  credentials = JSON.parse(Buffer.from(process.env.GOOGLE_CREDENTIALS_FILE, 'base64').toString('utf8'));
  console.log('Google credentials loaded successfully');
} catch (error) {
  console.error('Error parsing Google credentials:', error.message);
  process.exit(1);
}

// Creates a client using credentials from environment variables
const bigquery = new BigQuery({
  projectId: process.env.GOOGLE_PROJECT_ID,
  credentials: credentials,
});

export async function querySolanaValidatorData(pubkeys, startDate, endDate) {
  console.log('Starting BigQuery query with params:', { pubkeys, startDate, endDate });

  // Define your SQL query with dynamic parameters
  const pubkeyList = pubkeys.map(pk => `'${pk}'`).join(', ');
  const query = `SELECT block_timestamp, block_slot,  block_hash, commission, lamports, reward_type,  pubkey FROM \`bigquery-public-data.crypto_solana_mainnet_us.Block Rewards\`
WHERE pubkey IN (${pubkeyList}) AND block_timestamp >= '${startDate}' AND block_timestamp < '${endDate}'
QUALIFY ROW_NUMBER() OVER (
    PARTITION BY block_slot, pubkey, reward_type 
    ORDER BY block_timestamp DESC
) = 1
ORDER BY block_timestamp DESC`;

  console.log('Executing query:', query);

  // Query options including dataset location
  const options = {
    query: query,
    timeoutMs: 300000, // 5 minutes timeout
  };

  try {
    // Create a query job
    const [job] = await bigquery.createQueryJob(options);
    console.log(`Job ${job.id} started.`);

    // Start Jito fetch in parallel with BigQuery job
    const mevPromise = fetchMevRewards().catch(err => {
      console.warn('Jito MEV fetch failed, MEV columns will be empty:', err.message);
      return {};
    });

    // Wait for the query to finish and get results
    const [rows] = await job.getQueryResults();
    console.log(`Query completed. Found ${rows.length} rows.`);

    const mevByEpoch = await mevPromise;
    console.log(`Fetched MEV data for ${Object.keys(mevByEpoch).length} epochs`);

    if (rows.length === 0) {
      console.log('No results found.');
      return '';
    }

    const headers = Object.keys(rows[0]);
    let csvContent = headers.join(',') + '\n';

    const escapeCsv = (val) => {
      let v = String(val ?? '');
      v = v.replace(/"/g, '""');
      if (v.includes(',') || v.includes('"') || v.includes('\n')) v = `"${v}"`;
      return v;
    };

    const seenEpochs = new Set();

    rows.forEach(row => {
      // Derive Solana epoch from block_slot (432,000 slots per epoch on mainnet)
      const blockSlot = Number(row['block_slot']);
      const epoch = Math.floor(blockSlot / 432000);

      const baseValues = headers.map(header => {
        let value = row[header];
        if (value && typeof value === 'object' && value.constructor.name === 'Big') value = value.toString();
        else if (value && typeof value === 'object' && value.value) value = value.value;
        else if (value === null || value === undefined) value = '';
        value = String(value).replace(/"/g, '""');
        if (value.includes(',') || value.includes('"') || value.includes('\n')) value = `"${value}"`;
        return value;
      });
      csvContent += baseValues.join(',') + '\n';

      // Append one MEV row per epoch (first time we see this epoch)
      if (!seenEpochs.has(epoch) && mevByEpoch[epoch]) {
        seenEpochs.add(epoch);
        const mev = mevByEpoch[epoch];
        const mevRow = headers.map(header => {
          switch (header) {
            case 'reward_type': return 'MEV';
            case 'lamports':    return escapeCsv(mev.mev_rewards);
            case 'commission':  return escapeCsv(mev.mev_commission_bps);
            case 'pubkey':      return escapeCsv(row['pubkey']);
            case 'block_slot':  return escapeCsv(epoch * 432000);
            default:            return '';
          }
        });
        csvContent += mevRow.join(',') + '\n';
      }
    });

    return csvContent;
  } catch (err) {
    console.error('BigQuery ERROR:', err);
    throw new Error(`BigQuery query failed: ${err.message}`);
  }
}

export async function fetchMevRewards() {
  const JITO_PUBKEY = 'BN6EvLCeuYdrTjGaHCyugF7sSH5uckoVoy3Kg2TkyuDW';
  const url = `https://kobe.mainnet.jito.network/api/v1/validators/${JITO_PUBKEY}`;

  const response = await fetch(url, {
    signal: AbortSignal.timeout(10_000), // 10 seconds
  });
  if (!response.ok) {
    throw new Error(`Jito API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error(`Jito API returned unexpected shape: ${JSON.stringify(data).slice(0, 200)}`);
  }

  // Build epoch → MEV data map for O(1) lookup
  const mevByEpoch = {};
  for (const entry of data) {
    if (entry.epoch == null) continue;
    mevByEpoch[entry.epoch] = {
      mev_commission_bps: entry.mev_commission_bps ?? '',
      mev_rewards: entry.mev_rewards ?? '',
      priority_fee_commission_bps: entry.priority_fee_commission_bps ?? '',
      priority_fee_rewards: entry.priority_fee_rewards ?? '',
    };
  }

  return mevByEpoch;
}
