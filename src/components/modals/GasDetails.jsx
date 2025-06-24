import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CircularProgress } from '@mui/material';

import { useTransaction } from '../../context/TransactionContextCore';
import { estimateGas } from '../../reducer/gasEstimation';

const GasDetailsOutput = () => {
  const dispatch = useDispatch();
  const { toAddress, data, valueInWei, account, client, isTxInputValid } = useTransaction();
  const { estimatedGas, status, error } = useSelector((state) => state.gasEstimation);

  useEffect(() => {
    if (isTxInputValid && client) {
      dispatch(estimateGas({
        client,
        from: account.address,
        to: toAddress,
        data,
        value: valueInWei,
      }));
    }
  }, [dispatch, isTxInputValid, client, account.address, toAddress, data, valueInWei]);

  // Compute gas estimates based on input data
  // const estimatedGas = await calculateEstimatedGas(isTxInputValid, client, { from: account.address, toAddress, data, valueInWei });
  const network = emitNetwork(account);

    if (status === 'loading') {
    return <div className="flex items-center gap-2 animate-fade-in delay-1000">
    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
    <span className="text-blue-600 font-medium animate-pulse">
      Recalculating Gas Estimate...
    </span>
  </div>
  
  }

  if (status === 'failed') {
    return (<div className="max-w-md mx-auto my-auto p-4 bg-white rounded-lg shadow-xl">
      <div className="text-red-500 break-all">Error: {error}</div>
    </div>);
  }


  return (
    <div className="max-w-md mx-auto my-auto p-4 bg-white rounded-lg shadow-xl">
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

function emitNetwork(account) {
  // This is a placeholder calculation
  if (account.status === 'connected') {
    return account.chain.name;
  }

  return 'Unknown';
}

export default GasDetailsOutput;
