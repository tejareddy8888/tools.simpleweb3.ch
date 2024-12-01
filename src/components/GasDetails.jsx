import React from 'react';
import { useTransaction } from '../context/TransactionContext';

const GasDetailsOutput = () => {
  const { toAddress, data, valueInWei, account, isTxInputValid } = useTransaction();

  // Compute gas estimates based on input data
  const estimatedGas = calculateEstimatedGas(toAddress, data, valueInWei);
  const network = emitNetwork(account);

  return (
    <div className="max-w-md mx-auto mt-6 p-4 bg-white rounded-lg shadow-xl">
      <h2 className="text-lg font-semibold mb-4">Network Details</h2>
      <div className="space-y-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Computed Gas:</label>
          <output className="mt-1 block w-full px-3 py-2 bg-gray-100 rounded-md">
            {estimatedGas} units
          </output>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Network:</label>
          <output className="mt-1 block w-full px-3 py-2 bg-gray-100 rounded-md">
            {network}
          </output>
        </div>
      </div>
    </div>
  );
};

// Placeholder functions for gas calculations
// Replace these with actual calculations based on your requirements
function calculateEstimatedGas(isTxInputValid, data) {
  if (isTxInputValid) {
    // This is a placeholder calculation
    return Math.floor(21000 + (data.length / 2 - 1) * 16);
  }
  return 0;
}

function emitNetwork(account) {
  // This is a placeholder calculation
  if (account.status === 'connected') {
    return account.chain.name;
  }

  return 'Unknown';
}

export default GasDetailsOutput;