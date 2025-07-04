import React, { useState, lazy, Suspense, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSendTransaction, usePrepareTransactionRequest } from 'wagmi';
import { parseEther } from 'viem';

import ValidateButton from '../components/buttons/ValidateButton';
import SendToNetworkButton from '../components/buttons/SendToNetworkButton';
import { useTransaction } from '../context/TransactionContextCore';
import { CustomNetworkAlert } from '../components/custom/alert';

// Lazy load components
const TransactionDetailsInput = lazy(() => import('../components/modals/TransactionDetails'));
const GasDetailsOutput = lazy(() => import('../components/modals/GasDetails'));
const ErrorDetails = lazy(() => import('../components/modals/ErrorDetails'));

const Body = () => {
  const { validateInputs, account, client, toAddress, valueInWei, data } = useTransaction();
  const [validationPassed, setValidationPassed] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [txType, setTxType] = useState('legacy');

  const { status: gasEstimationStatus } = useSelector((state) => state.gasEstimation);

  const handleValidate = () => {
    const validationResult = validateInputs();
    if (!validationResult) {
      setErrorDetails({
        errorCode: '501',
        errorMessage: 'The transaction details are invalid. Please check your inputs.',
      });
      return;
    }
    setErrorDetails(null);
    setValidationPassed(validationResult);
  };

  const { data: txRequestData } = usePrepareTransactionRequest({
    to: toAddress,
    value: valueInWei ? parseEther(valueInWei) : undefined,
    data,
  });

  const { sendTransactionAsync } = useSendTransaction();

  const handleSendTransaction = async () => {
    try {
      await sendTransactionAsync(txRequestData);
    } catch (error) {
      console.error('Failed to send transaction:', error);
    }
  };

  const isAccountConnected = account.status === 'connected';

  return (
    <div className="min-h-screen w-full px-4 py-12">
      <div className="w-full max-w-full">
        <div className="space-y-4">
          {/* Network Info & Transaction Type */}
          <div className="bg-black bg-opacity-25 p-4 rounded-lg shadow-md">
            <CustomNetworkAlert
              chainId={client?.chain?.id}
              address={account?.address}
              txType={txType}
              setTxType={setTxType}
            />
          </div>

          {/* Transaction Form */}
          <div className="bg-black bg-opacity-25 p-4 rounded-lg shadow-md">
            <Suspense fallback={<div>Loading transaction details...</div>}>
              <TransactionDetailsInput />
            </Suspense>
            <div className="mt-4">
              <ValidateButton shouldBeActive={isAccountConnected} onClick={handleValidate} />
            </div>
          </div>

          {/* Gas & Send to Network */}
          {validationPassed ? (
            <div className="bg-black bg-opacity-25 p-4 rounded-lg shadow-md">
              <Suspense fallback={<div>Loading gas details...</div>}>
                <GasDetailsOutput txType={txType} />
              </Suspense>
              <div className="mt-4">
                <SendToNetworkButton
                  isValid={gasEstimationStatus === 'succeeded'}
                  onClick={handleSendTransaction}
                />
              </div>
            </div>
          ) : errorDetails ? (
            <div className="bg-black bg-opacity-25 p-4 rounded-lg shadow-md">
              <Suspense fallback={<div>Loading error details...</div>}>
                <ErrorDetails
                  errorCode={errorDetails.errorCode}
                  errorMessage={errorDetails.errorMessage}
                />
              </Suspense>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Body;
