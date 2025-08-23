import React, { useEffect, useState, lazy, Suspense, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { usePrepareTransactionRequest, useEstimateFeesPerGas } from 'wagmi';
import { parseUnits, isAddress } from 'viem';
import SharedHeader from '../components/crucial/SharedHeader';
import Footer from '../components/crucial/SiteFooter';
import { TransactionProvider } from '../context/TransactionContext';
import { useTransaction } from '../context/TransactionContextCore';
import RetroUltimateConverter from "../components/components/widgets/HexDecCalculator.jsx";
import RetroSendingPopup from '../components/components/widgets/RetroSendingPopup.jsx';
import { CustomNetworkAlert } from '../components/custom/alert';
import ValidateButton from '../components/buttons/ValidateButton';
import OverrideButton from '../components/buttons/Override';
import SendToNetworkButton from '../components/buttons/SendToNetworkButton';

// Lazy load components with error boundaries
const TransactionDetailsInput = lazy(() => import('../components/modals/TransactionDetails'));
const GasDetailsOutput = lazy(() => import('../components/modals/GasDetails'));
const ErrorDetails = lazy(() => import('../components/modals/ErrorDetails'));

// Loading fallback component
const LoadingFallback = ({ message }) => (
  <div className="text-xs text-white font-mono p-4 bg-gray-800 rounded">
    {message}
  </div>
);

// Main transaction logic component
const SendTransactionContent = () => {
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

  // State management
  const [validationPassed, setValidationPassed] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [txType, setTxType] = useState('legacy');
  const [txRequestData, setTxRequestData] = useState(null);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupStatus, setPopupStatus] = useState('sending');
  const [txHash, setTxHash] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  // Memoized sidebar handlers
  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  // Get gas estimation status safely
  const gasEstimationStatus = useSelector((state) => {
    try {
      return state?.gasEstimation?.status || 'idle';
    } catch (error) {
      console.warn('Gas estimation state not available:', error);
      return 'idle';
    }
  });

  // Memoized validation check
  const isAccountConnected = useMemo(() => {
    return account?.status === 'connected' && account?.address;
  }, [account?.status, account?.address]);

  // Enhanced validation handler
  const handleValidate = useCallback(async () => {
    if (isValidating) return;

    setIsValidating(true);
    setErrorDetails(null);

    try {
      // Check wallet connection first
      if (!isAccountConnected) {
        setErrorDetails({
          errorCode: '400',
          errorMessage: 'Please connect your wallet first.',
        });
        setValidationPassed(false);
        return;
      }

      // Validate inputs
      const isValid = validateInputs();
      if (!isValid) {
        setErrorDetails({
          errorCode: '501',
          errorMessage: 'Invalid transaction details. Please check the recipient address and data format.',
        });
        setValidationPassed(false);
        return;
      }

      // Additional validation checks
      if (toAddress && !isAddress(toAddress)) {
        setErrorDetails({
          errorCode: '502',
          errorMessage: 'Invalid recipient address format.',
        });
        setValidationPassed(false);
        return;
      }

      if (data && data !== '0x' && !/^0x[a-fA-F0-9]*$/.test(data)) {
        setErrorDetails({
          errorCode: '503',
          errorMessage: 'Invalid data format. Must be valid hexadecimal.',
        });
        setValidationPassed(false);
        return;
      }

      setValidationPassed(true);
    } catch (error) {
      console.error('Validation error:', error);
      setErrorDetails({
        errorCode: '500',
        errorMessage: 'Validation failed. Please try again.',
      });
      setValidationPassed(false);
    } finally {
      setIsValidating(false);
    }
  }, [isValidating, isAccountConnected, validateInputs, toAddress, data]);

  // Prepare transaction with proper error handling
  const { data: txData, error: txError, isLoading: isPreparing } = usePrepareTransactionRequest({
    to: toAddress,
    value: valueInWei ? parseUnits(valueInWei.toString(), 'wei') : undefined,
    data: data || '0x',
    gas: userGasLimit ? BigInt(userGasLimit) : undefined,
    enabled: validationPassed && isAccountConnected && !!toAddress,
    retry: 3,
    retryDelay: 1000,
  });

  // Get network fee data with error handling
  const { data: networkFeeData, error: feeError } = useEstimateFeesPerGas({
    chainId: client?.chain?.id,
    type: txType,
    enabled: validationPassed && !!client?.chain?.id,
  });

  // Handle transaction preparation results
  useEffect(() => {
    if (txError) {
      console.error('Transaction preparation failed:', txError);
      setErrorDetails({
        errorCode: '503',
        errorMessage: `Failed to prepare transaction: ${txError.message || 'Unknown error'}`,
      });
      setTxRequestData(null);
      setValidationPassed(false);
    } else if (txData) {
      setTxRequestData(txData);
      setErrorDetails(null);
    }
  }, [txData, txError]);

  // Handle fee estimation errors
  useEffect(() => {
    if (feeError) {
      console.warn('Fee estimation failed:', feeError);
      // Don't block transaction for fee estimation failures
    }
  }, [feeError]);

  // Enhanced transaction sender
  const handleSendTransaction = useCallback(async () => {
    if (isSending) return;

    try {
      // Pre-flight checks
      if (!isAccountConnected) {
        setErrorDetails({
          errorCode: '400',
          errorMessage: 'Wallet not connected. Please connect your wallet.',
        });
        return;
      }

      if (!txRequestData) {
        setErrorDetails({
          errorCode: '504',
          errorMessage: 'No transaction request data available. Please validate first.',
        });
        return;
      }

      if (!sendTransactionAsync) {
        setErrorDetails({
          errorCode: '505',
          errorMessage: 'Transaction function not available. Please refresh and try again.',
        });
        return;
      }

      setIsSending(true);
      setPopupOpen(true);
      setPopupStatus('sending');
      setTxHash(null);
      setErrorDetails(null);

      // Send transaction with timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Transaction timeout')), 60000)
      );

      const result = await Promise.race([
        sendTransactionAsync(txRequestData),
        timeoutPromise
      ]);

      const hash = result?.hash || result;
      if (hash) {
        setTxHash(hash);
        setPopupStatus('success');
      } else {
        throw new Error('No transaction hash received');
      }

    } catch (error) {
      console.error('Transaction failed:', error);
      setPopupStatus('error');

      let errorMessage = 'Transaction failed to send.';
      if (error.message?.includes('User rejected')) {
        errorMessage = 'Transaction was rejected by user.';
      } else if (error.message?.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction.';
      } else if (error.message?.includes('timeout')) {
        errorMessage = 'Transaction timed out. Please try again.';
      } else if (error.message) {
        errorMessage = `Transaction failed: ${error.message}`;
      }

      setErrorDetails({
        errorCode: '502',
        errorMessage,
      });
    } finally {
      setIsSending(false);
    }
  }, [isSending, isAccountConnected, txRequestData, sendTransactionAsync]);

  // Close popup handler
  const handleClosePopup = useCallback(() => {
    setPopupOpen(false);
    setPopupStatus('sending');
    setTxHash(null);
  }, []);

  return (
    <div className="min-h-screen w-full px-4 py-12">
      {/* Transaction Status Popup */}
      {popupOpen && (
        <RetroSendingPopup
          status={popupStatus}
          txHash={txHash}
          onClose={handleClosePopup}
        />
      )}

      <div className="w-full max-w-full space-y-4">
        {/* Network Alert */}
        <div className="bg-black bg-opacity-25 p-4 rounded-lg shadow-md">
          <CustomNetworkAlert
            chainId={client?.chain?.id}
            address={account?.address}
            txType={txType}
            setTxType={setTxType}
          />
        </div>

        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={closeSidebar}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Escape' && closeSidebar()}
          />
        )}

        {/* Sidebar Modal */}
        <motion.div
          className="fixed top-0 right-0 h-full w-80 bg-black z-50 shadow-xl flex flex-col border-l-2 border-white"
          initial={{ x: "100%" }}
          animate={{ x: sidebarOpen ? 0 : "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex justify-between items-center mt-20 p-4 border-b-2 border-white">
            <h3 className="font-['Press_Start_2P'] text-xl text-white">Tools</h3>
            <button
              onClick={closeSidebar}
              className="text-white hover:text-[#00FE77] font-['Press_Start_2P'] text-xs"
              aria-label="Close sidebar"
            >
              ✕ CLOSE
            </button>
          </div>
          <div className="p-4 flex-grow overflow-auto">
            <RetroUltimateConverter />
          </div>
        </motion.div>
        {/* Tools Icon (Right Edge) */}
        {!sidebarOpen && (
          <button
            onClick={openSidebar}
            className="
              fixed top-1/2 right-0 -translate-y-1/2
              bg-white border-l-2 border-t-2 border-b-2 border-black
              px-2 py-4 cursor-pointer z-40
              shadow-[4px_4px_0_0_black] hover:bg-gray-100
              transition-colors duration-200
            "
            aria-label="Open tools sidebar"
          >
            <div className="flex flex-col items-center space-y-1">
              <span className="block w-4 h-[2px] bg-black" />
              <span className="block w-4 h-[2px] bg-black" />
              <span className="block w-4 h-[2px] bg-black" />
            </div>
          </button>
        )}

        {/* Transaction Input Section */}
        <div className="bg-black bg-opacity-25 p-4 rounded-lg shadow-md border border-white/20">
          <Suspense fallback={<LoadingFallback message="Loading transaction details..." />}>
            <TransactionDetailsInput />
          </Suspense>

          <div className="mt-4 flex flex-col sm:flex-row gap-3 w-full">
            <ValidateButton
              shouldBeActive={isAccountConnected && !isValidating}
              onClick={handleValidate}
              className="flex-1 text-customOlive"
              disabled={isValidating || !isAccountConnected}
            >
              {isValidating ? 'Validating...' : 'Validate Transaction'}
            </ValidateButton>

            <OverrideButton
              shouldBeActive={isAccountConnected && !isValidating}
              onClick={handleValidate}
              className="flex-1 text-customOlive"
              disabled={isValidating || !isAccountConnected}
            />
          </div>

          {/* Validation Status */}
          {isValidating && (
            <div className="mt-2 text-center">
              <span className="text-yellow-400 font-['Press_Start_2P'] text-xs">
                Validating transaction...
              </span>
            </div>
          )}

          {/* Transaction Preparation Status */}
          {isPreparing && validationPassed && (
            <div className="mt-2 text-center">
              <span className="text-blue-400 font-['Press_Start_2P'] text-xs">
                Preparing transaction...
              </span>
            </div>
          )}
        </div>

        {/* Conditional Gas Details or Error Display */}
        {validationPassed && !errorDetails ? (
          <div className="bg-black bg-opacity-25 p-4 rounded-lg shadow-md border border-white/20">
            <Suspense fallback={<LoadingFallback message="Loading gas details..." />}>
              <GasDetailsOutput
                txType={txType}
                networkFeeData={networkFeeData}
                isLoading={isPreparing}
              />
            </Suspense>

            <div className="mt-4 flex justify-center">
              <div className="w-full sm:w-auto sm:min-w-[220px]">
                <SendToNetworkButton
                  isValid={
                    gasEstimationStatus === 'succeeded' &&
                    !!txRequestData &&
                    !isPreparing &&
                    !isSending &&
                    isAccountConnected
                  }
                  onClick={handleSendTransaction}
                  disabled={
                    !txRequestData ||
                    isPreparing ||
                    isSending ||
                    !isAccountConnected ||
                    gasEstimationStatus === 'error'
                  }
                  loading={isSending}
                >
                  {isSending ? 'Sending...' : 'Send Transaction'}
                </SendToNetworkButton>
              </div>
            </div>

            {/* Additional Status Messages */}
            {!isAccountConnected && (
              <div className="mt-2 text-center">
                <span className="text-red-400 font-['Press_Start_2P'] text-xs">
                  Please connect your wallet to continue
                </span>
              </div>
            )}

            {gasEstimationStatus === 'error' && (
              <div className="mt-2 text-center">
                <span className="text-orange-400 font-['Press_Start_2P'] text-xs">
                  Gas estimation failed - transaction may still work
                </span>
              </div>
            )}
          </div>
        ) : errorDetails ? (
          <div className="bg-black bg-opacity-25 p-4 rounded-lg shadow-md border border-red-500/20">
            <Suspense fallback={<LoadingFallback message="Loading error details..." />}>
              <ErrorDetails
                errorCode={errorDetails.errorCode}
                errorMessage={errorDetails.errorMessage}
              />
            </Suspense>

            {/* Retry Button for certain errors */}
            {['500', '503', '505'].includes(errorDetails.errorCode) && (
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => {
                    setErrorDetails(null);
                    setValidationPassed(false);
                  }}
                  className="
                    px-4 py-2 bg-blue-600 hover:bg-blue-700 
                    text-white font-['Press_Start_2P'] text-xs
                    border-2 border-white rounded
                    transition-colors duration-200
                  "
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        ) : null}

        {/* Connection Status Indicator */}
        <div className="fixed bottom-4 left-4 z-30">
          <div className={`
            px-3 py-2 rounded-lg font-['Press_Start_2P'] text-xs
            ${isAccountConnected
              ? 'bg-green-600 text-white'
              : 'bg-red-600 text-white'
            }
          `}>
            {isAccountConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component that combines everything
const SendTransaction = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Apply retro pixelated cursor and styling
    const applyRetroStyling = () => {
      try {
        document.body.style.cursor = 'url("/cursor/pixel-sword.cur"), auto';
        document.body.style.imageRendering = 'pixelated';
        setIsLoading(false);
      } catch (error) {
        console.warn('Failed to apply retro styling:', error);
        setIsLoading(false);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(applyRetroStyling, 100);

    return () => {
      clearTimeout(timer);
      // Cleanup when component unmounts
      try {
        document.body.style.cursor = 'auto';
        document.body.style.imageRendering = 'auto';
      } catch (error) {
        console.warn('Failed to cleanup styling:', error);
      }
    };
  }, []);

  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white font-['Press_Start_2P'] text-lg">
          Loading SimpleWeb3...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Shared Header */}
      <SharedHeader showConnectButton={true} showMenu={true} />

      {/* Main Content Area */}
      <div className="min-h-screen bg-black bg-cover bg-center pt-20">
        <main className="flex-grow flex items-start justify-center mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 w-full py-8">
          <TransactionProvider>
            <div className="w-full max-w-4xl">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-[400px]">
                    <LoadingFallback message="Loading transaction interface..." />
                  </div>
                }
              >
                <SendTransactionContent />
              </Suspense>
            </div>
          </TransactionProvider>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SendTransaction;