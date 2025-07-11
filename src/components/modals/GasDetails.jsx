import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { estimateGas } from '../../reducer/gasEstimation';
import { useTransaction } from '../../context/TransactionContextCore';

const MAX_GAS = 100000;
const MIN_GAS = 21000;
const MAX_PRIORITY = 50;
const MIN_PRIORITY = 1;

const GasDetailsOutput = ({ txType }) => {
  const dispatch = useDispatch();
  const {
    toAddress, data, valueInWei,
    account, client, isTxInputValid,
    userGasLimit, setUserGasLimit,
  } = useTransaction();

  const { estimatedGas, status, error } = useSelector((state) => state.gasEstimation);

  const [gas, setGas] = useState(MIN_GAS);
  const [feeData, setFeeData] = useState({
    baseFeePerGas: '30',
    maxPriorityFeePerGas: '2',
    maxFeePerGas: '',
  });

  const [loadingBarStep, setLoadingBarStep] = useState(0);
  const recalcTimer = useRef(null);

  const loadingFrames = [
    '░░░░░░░░', '▓░░░░░░░', '▓▓░░░░░░', '▓▓▓░░░░░',
    '▓▓▓▓░░░░', '▓▓▓▓▓░░░', '▓▓▓▓▓▓░░', '▓▓▓▓▓▓▓░', '▓▓▓▓▓▓▓▓'
  ];

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
    return <CircularProgress />
  }

  if (status === 'failed') {
    return (
      <div className="p-4 bg-white border-2 border-red-600 text-red-500 font-mono">
        Error: {error}
      </div>
    );
  }

  if (status === 'loading') {
    return (
      <div className="p-4 bg-black border-2 border-yellow-400 font-mono text-lime-300 text-xs w-full max-w-md mx-auto">
        <pre> Recalculating Gas Module [{loadingFrames[loadingBarStep]}]</pre>
      </div>
    );
  }

  return (
    <div className="relative px-4 py-5 bg-white text-black border-4 border-black mb-6 w-full max-w-md mx-auto my-auto font-mono" style={{ imageRendering: 'pixelated' }}>
      <h2 className="text-lg font-['Press_Start_2P'] mb-4">Network Details</h2>

      <div className="text-sm mb-4">
        <div className="mb-2">
          <span className="font-bold">→ Gas:</span>{' '}
          <span className="text-[#6200ea]">
            0x{parseInt(gas || MIN_GAS).toString(16).toUpperCase()}
          </span>{' '}
          <span className="ml-1 text-gray-700">({gas || MIN_GAS} units)</span>
        </div>

        <div className="flex items-center space-x-2">
          <button {...gasDec} className="px-2 py-1 bg-[#d1ff03] border-2 border-black shadow-md text-xs">-</button>
          <div className="flex-grow h-4 bg-black relative overflow-hidden border-2 border-black shadow-inner">
            <div
              className="h-full bg-[#d1ff03] transition-all duration-300 ease-out"
              style={{ width: `${((gas - MIN_GAS) / (MAX_GAS - MIN_GAS)) * 100}%` }}
            />
          </div>
          <button {...gasInc} className="px-2 py-1 bg-[#d1ff03] border-2 border-black shadow-md text-xs">+</button>
        </div>
      </div>

      {txType === 'id' && (
        <div className="mt-4 border-t border-black pt-4 text-sm space-y-4">
          <div>
            <div className="font-bold mb-1">→ Max Priority Fee</div>
            <div className="bg-black text-[#d1ff03] px-3 py-2 text-sm border-2 border-black inline-block font-mono tracking-widest">
              {renderAsciiBar(parseInt(feeData.maxPriorityFeePerGas), MAX_PRIORITY)}
            </div>
            <div className="flex items-center space-x-3 mt-2">
              <button {...decPriority} className="px-2 py-1 bg-[#ff03e2] border-2 border-black shadow-md text-white text-xs">-</button>
              <span className="text-xs text-gray-600">{feeData.maxPriorityFeePerGas} GWEI</span>
              <button {...incPriority} className="px-2 py-1 bg-[#ff03e2] border-2 border-black shadow-md text-white text-xs">+</button>
            </div>
          </div>

          <div>
            <div className="font-bold">→ Max Fee:</div>
            <div>{calculatedMaxFee.toFixed(2)} GWEI</div>
          </div>
        </div>
      )}

      <div className="text-sm mt-4">
        <span className="font-bold">→ Network :</span>{' '}
        <span className="text-[#007bff]">{network}</span>
      </div>
    </div>
  );
};

function renderAsciiBar(value, max, length = 10) {
  const percentage = value / max;
  const filled = Math.round(percentage * length);
  const empty = length - filled;
  const bar = '█'.repeat(filled) + ' '.repeat(empty);
  const label = percentage < 0.33 ? 'SLOW' : percentage < 0.66 ? 'NORMAL' : 'FAST';
  return `[${bar}] ${label}`;
}

export default GasDetailsOutput;
