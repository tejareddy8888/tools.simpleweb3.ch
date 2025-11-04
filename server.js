import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { querySolanaValidatorData } from './bigQuery.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
// app.use(cors({
//   origin: ['http://localhost:5173', 'http://localhost:3000'], // Add your dev server ports
//   credentials: true
// }));
app.use(express.json());

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

    console.log('Querying BigQuery...');

    // Query BigQuery using the utility function
    const csvContent = await querySolanaValidatorData([pubkey1, pubkey2], startDate, endDate);

    if (!csvContent) {
      return res.status(404).json({ error: 'No data found for the specified parameters' });
    }

    console.log('Query successful, sending CSV...');

    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="solana_validator_data_${startDate}_to_${endDate}.csv"`);

    // Send the CSV content
    res.send(csvContent);

  } catch (error) {
    console.error('Error processing Solana validator request:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: {
      hasGoogleCredentials: !!process.env.GOOGLE_CREDENTIALS_FILE,
      hasProjectId: !!process.env.GOOGLE_PROJECT_ID
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Environment check:`, {
    hasGoogleCredentials: !!process.env.GOOGLE_CREDENTIALS_FILE,
    hasProjectId: !!process.env.GOOGLE_PROJECT_ID
  });
});

export default app;