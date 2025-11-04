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
  const query = `
    SELECT * 
    FROM \`bigquery-public-data.crypto_solana_mainnet_us.Block Rewards\` 
    WHERE pubkey IN (${pubkeyList}) 
      AND block_timestamp >= '${startDate}' 
      AND block_timestamp < '${endDate}' 
    ORDER BY block_timestamp DESC
  `;

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

    // Wait for the query to finish and get results
    const [rows] = await job.getQueryResults();
    console.log(`Query completed. Found ${rows.length} rows.`);

    // Convert rows to CSV format
    if (rows.length === 0) {
      console.log('No results found.');
      return '';
    }

    // Get column headers from the first row
    const headers = Object.keys(rows[0]);
    
    // Create CSV content
    let csvContent = headers.join(',') + '\n';
    
    // Add data rows
    rows.forEach(row => {
      const values = headers.map(header => {
        let value = row[header];
        
        // Convert Big objects to strings
        if (value && typeof value === 'object' && value.constructor.name === 'Big') {
          value = value.toString();
        }
        // Convert BigQueryTimestamp to ISO string
        else if (value && typeof value === 'object' && value.value) {
          value = value.value;
        }
        // Handle null/undefined
        else if (value === null || value === undefined) {
          value = '';
        }
        
        // Escape commas and quotes in values
        value = String(value).replace(/"/g, '""');
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value}"`;
        }
        
        return value;
      });
      
      csvContent += values.join(',') + '\n';
    });

    return csvContent;
  } catch (err) {
    console.error('BigQuery ERROR:', err);
    throw new Error(`BigQuery query failed: ${err.message}`);
  }
}
