import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTransaction } from '../../context/TransactionContextCore';
import { estimateGas } from '../../reducer/gasEstimation';

const GasDetailsOutput = ({ txType }) => {
  const dispatch = useDispatch();
  const {
    toAddress,
    data,
    valueInWei,
    account,
    client,
    isTxInputValid,
  } = useTransaction();
  const { estimatedGas, status, error } = useSelector(
    (state) => state.gasEstimation
  );

  const [gas, setGas] = useState(estimatedGas);
  const [feeData, setFeeData] = useState({
    baseFeePerGas: '', // from client
    maxPriorityFeePerGas: '2', // slider controlled
    maxFeePerGas: '', // calculated
  });

  // Estimate gas when valid input changes
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

  // Set estimated gas (base gas)
  useEffect(() => {
    if (estimatedGas) {
      setGas(estimatedGas);
    }
  }, [estimatedGas]);

  // Fetch base fee from network
  useEffect(() => {
    const fetchGasFees = async () => {
      if (!client || !isTxInputValid || txType !== 'id') return;

      try {
        const fees = await client.estimateFeesPerGas();
        setFeeData((prev) => ({
          ...prev,
          baseFeePerGas: fees.baseFeePerGas?.toString() || '',
        }));
      } catch (err) {
        console.error("❌ Error fetching fee data:", err);
      }
    };

    fetchGasFees();
  }, [client, isTxInputValid, txType]);

  const network = emitNetwork(account);

  // Calculate max fee = gas (slider) + maxPriorityFee
  const calculatedMaxFee =
    parseFloat(gas || '0') + parseFloat(feeData.maxPriorityFeePerGas || '0');

  return (
    <div
      className="relative px-4 py-3 bg-white text-black border-2 border-black mb-6 w-full max-w-md mx-auto my-auto"
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Pixel flicker corners */}
      <div className="absolute top-0 left-0 w-2 h-2 bg-black flicker" />
      <div className="absolute top-0 right-0 w-2 h-2 bg-black flicker" />
      <div className="absolute bottom-0 left-0 w-2 h-2 bg-black flicker" />
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-black flicker" />

      <h2 className="text-lg font-semibold mb-4">Network Details</h2>

      {/* 🔹 Gas */}
      <div className="text-md mb-3">
        <span className="font-bold">
          {txType === 'id' ? '→ Base Gas :' : '→ Gas :'}
        </span>{' '}
        0x{parseInt(gas || 0).toString(16).toUpperCase()} ({gas} units)
      </div>

      {/* 🔹 Always show main gas slider */}
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

      {/* 🔹 Extra Fee Fields for Type 2 */}
      {txType === 'id' && (
        <div className="mt-4 text-xs font-mono space-y-2">
          <div>
            <span className="font-bold">→ Base Fee:</span>{' '}
            {feeData.baseFeePerGas || '...'} GWEI
          </div>

          <div className="flex flex-col mt-2">
            <span className="font-bold">→ Max Priority Fee:</span>
            <input
              type="range"
              min="1"
              max="50"
              value={feeData.maxPriorityFeePerGas}
              onChange={(e) =>
                setFeeData((prev) => ({
                  ...prev,
                  maxPriorityFeePerGas: e.target.value,
                }))
              }
              className="w-full h-2 appearance-none bg-black outline-none cursor-pointer mt-1"
              style={{
                backgroundImage: 'linear-gradient(to right, #ff03e2 0%, #ff03e2 100%)',
                backgroundSize: `${(parseInt(feeData.maxPriorityFeePerGas) / 50) * 100}% 100%`,
                backgroundRepeat: 'no-repeat',
              }}
            />
            <div className="mt-1 text-[10px]">
              {feeData.maxPriorityFeePerGas} GWEI
            </div>
          </div>

          <div>
            <span className="font-bold">→ Max Fee:</span>{' '}
            {calculatedMaxFee.toFixed(2)} GWEI
          </div>
        </div>
      )}

      {/* 🔹 Network */}
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
