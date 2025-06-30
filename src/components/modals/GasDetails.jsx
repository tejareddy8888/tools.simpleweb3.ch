import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTransaction } from '../../context/TransactionContextCore';
import { estimateGas } from '../../reducer/gasEstimation';

const GasDetailsOutput = () => {
  const dispatch = useDispatch();
  const { toAddress, data, valueInWei, account, client, isTxInputValid } = useTransaction();
  const { estimatedGas, status, error } = useSelector((state) => state.gasEstimation);

  const [gas, setGas] = useState(estimatedGas);

  useEffect(() => {
    if (isTxInputValid && client) {
      dispatch(
        estimateGas({
          client,
          from: account.address,
          to: toAddress,
          data,
          value: valueInWei,
        })
      );
    }
  }, [dispatch, isTxInputValid, client, account.address, toAddress, data, valueInWei]);

  useEffect(() => {
    if (estimatedGas) {
      setGas(estimatedGas);
    }
  }, [estimatedGas]);

  const network = emitNetwork(account);

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2 animate-fade-in delay-1000">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
        <span className="text-blue-600 font-medium animate-pulse">Recalculating Gas Estimate...</span>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="max-w-md mx-auto my-auto p-4 bg-white rounded-lg shadow-xl">
        <div className="text-red-500 break-all">Error: {error}</div>
      </div>
    );
  }

  return (
    <div
      className="relative px-4 py-3 bg-white text-black border-2 border-black mb-6 w-full max-w-md mx-auto my-auto"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Pixel flicker corners */}
      <div className="absolute top-0 left-0 w-2 h-2 bg-black flicker flicker-delay-2" />
      <div className="absolute top-0 right-0 w-2 h-2 bg-black flicker flicker-delay-2" />
      <div className="absolute bottom-0 left-0 w-2 h-2 bg-black flicker flicker-delay-2" />
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-black flicker flicker-delay-2" />

      <h2 className="text-lg font-semibold mb-4">Network Details</h2>

      <div className="text-md mb-3">
        <span className="font-bold">→ Gas :</span>{' '}
        0x{parseInt(gas || 0).toString(16).toUpperCase()} ({gas} units)
      </div>

      <input
        type="range"
        min="21000"
        max="100000"
        value={gas}
        onChange={(e) => setGas(parseInt(e.target.value))}
        className="w-full h-2 appearance-none bg-black outline-none cursor-pointer mt-2"
        style={{
          backgroundImage: 'linear-gradient(to right, #d1ff03 0%, #d1ff03 100%)',
          backgroundSize: `${((gas - 21000) / (100000 - 21000)) * 100}% 100%`,
          backgroundRepeat: 'no-repeat',
        }}
      />

      <div className="text-md mt-4">
        <span className="font-bold">→ Network :</span> {network}
      </div>
    </div>
  );
};

function emitNetwork(account) {
  return account?.status === 'connected' ? account.chain.name : 'Unknown';
}

export default GasDetailsOutput;
