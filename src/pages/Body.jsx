import React, { useState, lazy, Suspense, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useSendTransaction, usePrepareTransactionRequest } from 'wagmi';
<<<<<<< HEAD
import { parseEther } from 'viem';
=======
import { isAddress, parseEther } from 'viem';

>>>>>>> upstream/main
import ValidateButton from '../components/buttons/ValidateButton';
import SendToNetworkButton from '../components/buttons/SendToNetworkButton';
import { useTransaction } from '../context/TransactionContextCore';
import { CustomNetworkAlert } from '../components/custom/alert';
import RetroSendingPopup from '../components/components/widgets/RetroSendingPopup.jsx';
const TransactionDetailsInput = lazy(() => import('../components/modals/TransactionDetails'));
const GasDetailsOutput = lazy(() => import('../components/modals/GasDetails'));
const ErrorDetails = lazy(() => import('../components/modals/ErrorDetails'));

const Body = () => {
<<<<<<< HEAD
  const {
    validateInputs, account, client,
    toAddress, valueInWei, data, userGasLimit
  } = useTransaction();
=======
  const { validateInputs, account, client, toAddress, valueInWei, data, } = useTransaction();
>>>>>>> upstream/main

  const [validationPassed, setValidationPassed] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [txType, setTxType] = useState('legacy');
  const [showSendingPopup, setShowSendingPopup] = useState(false);

  const { status: gasEstimationStatus } = useSelector((state) => state.gasEstimation);

  const handleValidate = () => {
    const isValid = validateInputs();
    if (!isValid) {
      setErrorDetails({
        errorCode: '501',
        errorMessage: 'Invalid transaction details.',
      });
      return;
    }
    setErrorDetails(null);
    setValidationPassed(true);
  };

  const { data: txRequestData } = usePrepareTransactionRequest({
    to: toAddress,
<<<<<<< HEAD
    value: valueInWei ? parseEther(valueInWei.toString()) : undefined,
    data,
    gas: userGasLimit ? BigInt(userGasLimit) : undefined
=======
    value: valueInWei ? parseEther(valueInWei) : undefined,
    data,
>>>>>>> upstream/main
  });

  const { sendTransactionAsync } = useSendTransaction();

  const handleSendTransaction = async () => {
    try {
<<<<<<< HEAD
      setShowSendingPopup(true);
      await sendTransactionAsync(txRequestData);
    } catch (error) {
      console.error('Failed to send transaction:', error);
    } finally {
      setShowSendingPopup(false);
    }
  };
=======
      await sendTransactionAsync(txRequestData);
    } catch (error) {
      console.error("Failed to send transaction:", error);
    }
  };

  useEffect(() => {

  }, [toAddress,txRequestData]);

  const isAccountConnected = account.status === 'connected';
>>>>>>> upstream/main

  return (
    <div className="min-h-screen w-full px-4 py-12">
      {showSendingPopup && <RetroSendingPopup />} {/* Popup overlay */}
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
            <ValidateButton shouldBeActive={account.status === 'connected'} onClick={handleValidate} />
          </div>
        </div>

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
<<<<<<< HEAD
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
=======

          {validationPassed ? (
            <div className="bg-black bg-opacity-25 p-4 rounded-lg shadow-md">
              <Suspense fallback={<div>Loading gas details...</div>}>
                <GasDetailsOutput />
              </Suspense>
              <div className="mt-4">
                <SendToNetworkButton isValid={gasEstimationStatus === 'succeeded'} onClick={handleSendTransaction} />
              </div>
              <div>
                {/* {transactionData && (
                  <div>Transaction: {JSON.stringify(transactionData)}</div>
                )}
                {transactionError && <div>Error sending transaction</div>} */}
              </div>
            </div>
          ) : errorDetails && (
            <div className="bg-black bg-opacity-25 p-4 rounded-lg shadow-md">
              <Suspense fallback={<div>Loading error details...</div>}>
                <ErrorDetails errorCode={errorDetails.errorCode} errorMessage={errorDetails.errorMessage} />
              </Suspense>
            </div>
          )}
        </div>
>>>>>>> upstream/main
      </div>
    </div>
  );
};

export default Body;
