import React, { useState, lazy, Suspense, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { parseUnits } from 'viem';
import {
  useSendTransaction,
  usePrepareTransactionRequest,
  useEstimateFeesPerGas,
} from 'wagmi';
import { motion } from "framer-motion";
import RetroUltimateConverter from "../components/components/widgets/HexDecCalculator.jsx";


import ValidateButton from '../components/buttons/ValidateButton';
import SendToNetworkButton from '../components/buttons/SendToNetworkButton';
import OverrideButton from '../components/buttons/Override';
import { useTransaction } from '../context/TransactionContextCore';
import { CustomNetworkAlert } from '../components/custom/alert';
import RetroSendingPopup from '../components/components/widgets/RetroSendingPopup.jsx';

const TransactionDetailsInput = lazy(() => import('../components/modals/TransactionDetails'));
const GasDetailsOutput = lazy(() => import('../components/modals/GasDetails'));
const ErrorDetails = lazy(() => import('../components/modals/ErrorDetails'));

const Body = () => {
  const {
    validateInputs,
    account,
    client,
    toAddress,
    data,
    valueInWei,
    userGasLimit,
    sendTransactionAsync,
  } = useTransaction();

  const [validationPassed, setValidationPassed] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [txType, setTxType] = useState('legacy');
  const [txRequestData, setTxRequestData] = useState(null);

  // Popup state
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupStatus, setPopupStatus] = useState('sending'); // "sending" | "success" | "error"
  const [txHash, setTxHash] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = () => setSidebarOpen(true);
  const closeSidebar = () => setSidebarOpen(false);

  const { status: gasEstimationStatus } = useSelector((state) => state.gasEstimation);

  const handleValidate = () => {
    const isValid = validateInputs();
    if (!isValid) {
      setErrorDetails({
        errorCode: '501',
        errorMessage: 'Invalid transaction details.',
      });
      setValidationPassed(false);
      return;
    }
    setErrorDetails(null);
    setValidationPassed(true);
  };

  const { data: txData, error: txError } = usePrepareTransactionRequest({
    to: toAddress,
    value: valueInWei ? parseUnits(valueInWei.toString()) : undefined,
    data,
    gas: userGasLimit ? BigInt(userGasLimit) : undefined,
    enabled: validationPassed,
  });

  const { data: networkFeeData } = useEstimateFeesPerGas({
    chainId: client?.chain?.id,
    txType: txType,
  });

  useEffect(() => {
    if (txError) {
      console.error('Transaction preparation failed:', txError);
      setErrorDetails({
        errorCode: '503',
        errorMessage: 'Failed to prepare transaction request.',
      });
      setTxRequestData(null);
    }
    if (txData) {
      setTxRequestData(txData);
    }
  }, [txData, txError]);

  const handleSendTransaction = async () => {
    try {
      if (!txRequestData) {
        setErrorDetails({
          errorCode: '504',
          errorMessage: 'No transaction request data available.',
        });
        return;
      }

      setPopupOpen(true);
      setPopupStatus('sending');
      setTxHash(null);

      const result = await sendTransactionAsync(txRequestData);
      setTxHash(result?.hash || result);
      setPopupStatus('success');
    } catch (error) {
      console.error('Transaction failed:', error);
      setPopupStatus('error');
      setErrorDetails({
        errorCode: '502',
        errorMessage: 'Transaction failed to send.',
      });
    }
  };

  const isAccountConnected = account?.status === 'connected';

  return (
    <div className="min-h-screen w-full px-4 py-12">
      {popupOpen && (
        <RetroSendingPopup
          status={popupStatus}
          txHash={txHash}
          onClose={() => setPopupOpen(false)}
        />
      )}

      <div className="w-full max-w-full space-y-4">
        {/* Alert */}
        <div className="bg-black bg-opacity-25 p-4 rounded-lg shadow-md">
          <CustomNetworkAlert
            chainId={client?.chain?.id}
            address={account?.address}
            txType={txType}
            setTxType={setTxType}
          />
        </div>
        {/* Sidebar Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={closeSidebar} />}

{/* Sidebar Modal */}
<motion.div
  className="fixed top-0 right-0 h-full w-80 bg-black z-50 shadow-xl flex flex-col"
  initial={{ x: "100%" }}
  animate={{ x: sidebarOpen ? 0 : "100%" }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
>
  <div className="flex justify-between items-center mt-20">
<h3 className="font-['Press_Start_2P'] text-xl text-white mb-2">Tools</h3>
<button onClick={closeSidebar} className=" font-bold text-lg">
CLOSE
</button>
</div>
  <div className="p-4 flex-grow overflow-auto">
    
    
    <RetroUltimateConverter />
  </div>
  
</motion.div>

{/* Tools Icon (Right Edge) */}
{!sidebarOpen && (
  <div
    onClick={openSidebar}
    className="
      fixed top-1/2 right-0 -translate-y-1/2
      bg-white border-l-2 border-t-2 border-b-2 border-black
      px-2 py-4 cursor-pointer z-40
      shadow-[4px_4px_0_0_black]
    "
  >
    <div className="flex flex-col items-center space-y-1">
      <span className="block w-4 h-[2px] bg-black" />
      <span className="block w-4 h-[2px] bg-black" />
      <span className="block w-4 h-[2px] bg-black" />
    </div>
  </div>
)}


        {/* Transaction input */}
        <div className="bg-black bg-opacity-25 p-4 rounded-lg shadow-md">
          <Suspense fallback={<div className="text-xs text-white font-mono">Loading transaction details...</div>}>
            <TransactionDetailsInput />
          </Suspense>
          <div className="mt-4 flex flex-col sm:flex-row gap-3 w-full">
            <ValidateButton shouldBeActive={isAccountConnected} onClick={handleValidate} className="flex-1 text-customOlive" />
            <OverrideButton shouldBeActive={isAccountConnected} onClick={handleValidate} className="flex-1 text-customOlive" />
          </div>
        </div>

        {/* Conditional gas or error */}
        {validationPassed ? (
          <div className="bg-black bg-opacity-25 p-4 rounded-lg shadow-md">
            <Suspense fallback={<div className="text-xs text-white font-mono">Loading gas details...</div>}>
              <GasDetailsOutput txType={txType} networkFeeData={networkFeeData} />
            </Suspense>
            <div className="mt-4 flex justify-center">
              <div className="w-full sm:w-auto sm:min-w-[220px]">
                <SendToNetworkButton
                  isValid={gasEstimationStatus === 'succeeded'}
                  onClick={handleSendTransaction}
                />
              </div>
            </div>
          </div>
        ) : errorDetails ? (
          <div className="bg-black bg-opacity-25 p-4 rounded-lg shadow-md">
            <Suspense fallback={<div className="text-xs text-white font-mono">Loading error details...</div>}>
              <ErrorDetails
                errorCode={errorDetails.errorCode}
                errorMessage={errorDetails.errorMessage}
              />
            </Suspense>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Body;
