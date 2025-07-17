import React, { useState, lazy, Suspense, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { usePrepareTransactionRequest, useEstimateFeesPerGas } from 'wagmi';
import { parseUnits } from 'viem';

import ValidateButton from '../components/buttons/ValidateButton';
import SendToNetworkButton from '../components/buttons/SendToNetworkButton';
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
    sendTransactionAsync
  } = useTransaction();

  const [validationPassed, setValidationPassed] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [txType, setTxType] = useState('legacy');
  const [showSendingPopup, setShowSendingPopup] = useState(false);
  const [txRequestData, setTxRequestData] = useState(null);
  const { status: gasEstimationStatus } = useSelector((state) => state.gasEstimation);

  const handleValidate = () => {
    const isValid = validateInputs();
    if (!isValid) {
      setErrorDetails({
        errorCode: '501',
        errorMessage: 'Invalid transaction details.',
      });
      setValidationPassed(false); // Ensure validationPassed is false on invalid input
      return;
    }
    setErrorDetails(null);
    setValidationPassed(true);
  };

  const { data: txData, error } = usePrepareTransactionRequest({
    to: toAddress,
    value: valueInWei ? parseUnits(valueInWei.toString()) : undefined,
    data,
    enabled: validationPassed && toAddress && valueInWei && data, // Enable only when validation passed and all params are available
  });

  const {data: networkFeeData } = useEstimateFeesPerGas({ chainId: client?.chain?.id, txType: txType });

  useEffect(() => {
    if (error) {
      console.error('error while transaction preparation', error);
      setErrorDetails({
        errorCode: '503',
        errorMessage: 'Failed to prepare transaction request.',
      });
      setTxRequestData(null);
    }
    if (txData) {
      setTxRequestData(txData);
    }
  }, [txData, error]);


  const handleSendTransaction = async () => {
    try {
      console.dir(txRequestData);
      if (!txRequestData) {
        setErrorDetails({
          errorCode: '504',
          errorMessage: 'No transaction request data available.',
        });
        return;
      }
      setShowSendingPopup(true);
      await sendTransactionAsync(txRequestData);
    } catch (error) {
      console.error('Failed to send transaction:', error);
      setErrorDetails({
        errorCode: '502',
        errorMessage: 'Transaction failed to send.',
      });
    } finally {
      setShowSendingPopup(false);
    }
  };

  const isAccountConnected = account.status === 'connected';

  return (
    <div className="min-h-screen w-full px-4 py-12">
      {showSendingPopup && <RetroSendingPopup />}
      <div className="w-full max-w-full space-y-4">
        <div className="bg-black bg-opacity-25 p-4 rounded-lg shadow-md">
          <CustomNetworkAlert
            chainId={client?.chain?.id}
            address={account?.address}
            txType={txType}
            setTxType={setTxType}
          />
        </div>

        <div className="bg-black bg-opacity-25 p-4 rounded-lg shadow-md">
          <Suspense fallback={<div>Loading transaction details...</div>}>
            <TransactionDetailsInput />
          </Suspense>
          <div className="mt-4">
            <ValidateButton shouldBeActive={isAccountConnected} onClick={handleValidate} />
          </div>
        </div>

        {validationPassed ? (
          <div className="bg-black bg-opacity-25 p-4 rounded-lg shadow-md">
            <Suspense fallback={<div>Loading gas details...</div>}>
              <GasDetailsOutput txType={txType} networkFeeData={networkFeeData} />
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
  );
};

export default Body;