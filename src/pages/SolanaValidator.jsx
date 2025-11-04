import axios from 'axios';
import React, { useState } from 'react';

const SolanaValidator = () => {
  const [formData, setFormData] = useState({
    pubkey1: 'CkCMabrc3HgBgDkeKPXkbWuQpUuSqW7zs1Mg3HFArx61',
    pubkey2: 'BN6EvLCeuYdrTjGaHCyugF7sSH5uckoVoy3Kg2TkyuDW',
    startDate: '2025-10-01',
    endDate: '2025-10-03',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Get API URL from environment or default to localhost
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Sending request to:', `${API_URL}/api/solana-validator`);
      console.log('Request data:', formData);

      // Call the BigQuery API endpoint
      const response = await axios.post(`${API_URL}/api/solana-validator`, {
        pubkey1: formData.pubkey1,
        pubkey2: formData.pubkey2,
        startDate: formData.startDate,
        endDate: formData.endDate,
      }, {
        responseType: 'blob', // Important for file download
        timeout: 310000, // 5 minutes + buffer
      });

      console.log('Response received:', response.status);

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'text/csv' });

      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `solana_validator_data_${formData.startDate}_to_${formData.endDate}.csv`;
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess('CSV file downloaded successfully!');

    } catch (err) {
      console.error('Error downloading CSV:', err);
      
      let errorMessage = 'Failed to generate CSV file';
      
      if (err.response) {
        // Server responded with error
        if (err.response.data instanceof Blob) {
          // Try to read error from blob
          const text = await err.response.data.text();
          try {
            const errorData = JSON.parse(text);
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch {
            errorMessage = text || errorMessage;
          }
        } else {
          errorMessage = err.response.data?.error || err.response.data?.message || errorMessage;
        }
      } else if (err.request) {
        // Request made but no response
        errorMessage = 'No response from server. Please ensure the server is running on port 3001.';
      } else {
        // Error in request setup
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Solana Validator Data</h1>

        <div className="bg-gray-800 rounded-lg p-6">
          <p className="text-gray-300 mb-6">
            Query Solana validator block rewards data from BigQuery. Enter the validator pubkeys and date range to generate a CSV report.
          </p>

          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-100 px-4 py-3 rounded mb-6">
              <strong>Error:</strong> {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-100 px-4 py-3 rounded mb-6">
              <strong>Success:</strong> {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Pubkey 1 Input */}
            <div>
              <label htmlFor="pubkey1" className="block text-sm font-medium text-gray-300 mb-2">
                Validator Pubkey 1
              </label>
              <input
                type="text"
                id="pubkey1"
                name="pubkey1"
                value={formData.pubkey1}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter first validator pubkey"
                required
              />
            </div>

            {/* Pubkey 2 Input */}
            <div>
              <label htmlFor="pubkey2" className="block text-sm font-medium text-gray-300 mb-2">
                Validator Pubkey 2
              </label>
              <input
                type="text"
                id="pubkey2"
                name="pubkey2"
                value={formData.pubkey2}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter second validator pubkey"
                required
              />
            </div>

            {/* Date Range Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-md transition duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating CSV...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download CSV Report
                </>
              )}
            </button>
          </form>

          {/* Information Section */}
          <div className="mt-8 p-4 bg-gray-700 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-2">About This Tool</h3>
            <ul className="text-gray-300 text-sm space-y-1">
              <li>• Queries Solana mainnet block rewards data from BigQuery</li>
              <li>• Filters by validator pubkeys and date range</li>
              <li>• Generates CSV file with all matching records</li>
              <li>• Includes proper data type handling for BigQuery results</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolanaValidator;