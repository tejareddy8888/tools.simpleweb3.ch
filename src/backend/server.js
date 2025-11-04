import express from 'express';
import cors from 'cors';
import { querySolanaValidatorData } from './src/utils/bigQuery.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API endpoint for Solana validator data
app.post('/api/solana-validator', async (req, res) => {
  try {
    const { pubkey1, pubkey2, startDate, endDate } = req.body;

    // Validate required parameters
    if (!pubkey1 || !pubkey2 || !startDate || !endDate) {
      return res.status(400).json({
        error: 'Missing required parameters: pubkey1, pubkey2, startDate, endDate'
      });
    }

    // Query BigQuery using the utility function
    const csvContent = await querySolanaValidatorData([pubkey1, pubkey2], startDate, endDate);

    if (!csvContent) {
      return res.status(404).json({ error: 'No data found for the specified parameters' });
    }

    // Set response headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="solana_validator_data_${startDate}_to_${endDate}.csv"`);

    // Send the CSV content
    res.send(csvContent);

  } catch (error) {
    console.error('Error processing Solana validator request:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Solana Validator API server running on port ${PORT}`);
});

module.exports = app;