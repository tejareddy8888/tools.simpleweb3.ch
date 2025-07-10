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
    if (!isTxInputValid || !client || !account?.address || !toAddress) return;

    const anim = setInterval(() => {
      setLoadingBarStep((prev) => (prev + 1) % loadingFrames.length);
    }, 100);

    if (recalcTimer.current) clearTimeout(recalcTimer.current);
    recalcTimer.current = setTimeout(() => {
      const safeValue = valueInWei || 0;
      const valueHex = typeof safeValue === 'string' && safeValue.startsWith('0x')
        ? safeValue
        : `0x${parseInt(safeValue).toString(16)}`;

      dispatch(
        estimateGas({
          client,
          from: account.address,
          to: toAddress,
          data: data || '0x',
          value: valueHex,
        })
      );

      setTimeout(() => clearInterval(anim), 800);
    }, 400);
  }, [toAddress, data, valueInWei, client, account.address, isTxInputValid, dispatch]);

  useEffect(() => {
    if (typeof estimatedGas === 'number' && estimatedGas > 0) {
      setGas(estimatedGas);
      setUserGasLimit(estimatedGas);
    } else {
      setGas(MIN_GAS);
      setUserGasLimit(MIN_GAS);
    }
  }, [estimatedGas]);

  const calculatedMaxFee =
    parseFloat(gas || MIN_GAS) + parseFloat(feeData.maxPriorityFeePerGas || '0');

  const useHoldButton = (callback) => {
    const intervalRef = useRef(null);
    const start = () => {
      callback();
      intervalRef.current = setInterval(callback, 80);
    };
    const stop = () => clearInterval(intervalRef.current);
    return {
      onMouseDown: start,
      onMouseUp: stop,
      onMouseLeave: stop,
      onTouchStart: start,
      onTouchEnd: stop,
    };
  };

  const gasInc = useHoldButton(() => {
    setGas((prev) => {
      const newGas = Math.min(MAX_GAS, Math.max(MIN_GAS, prev + 1000));
      setUserGasLimit(newGas);
      return newGas;
    });
  });

  const gasDec = useHoldButton(() => {
    setGas((prev) => {
      const newGas = Math.max(MIN_GAS, prev - 1000);
      setUserGasLimit(newGas);
      return newGas;
    });
  });

  const incPriority = useHoldButton(() =>
    setFeeData((prev) => ({
      ...prev,
      maxPriorityFeePerGas: Math.min(MAX_PRIORITY, parseInt(prev.maxPriorityFeePerGas || '1') + 1).toString(),
    }))
  );

  const decPriority = useHoldButton(() =>
    setFeeData((prev) => ({
      ...prev,
      maxPriorityFeePerGas: Math.max(MIN_PRIORITY, parseInt(prev.maxPriorityFeePerGas || '1') - 1).toString(),
    }))
  );

  const network = account?.status === 'connected' ? account.chain.name : 'Unknown';

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
