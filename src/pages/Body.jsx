import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { parseEther } from 'viem';
import { useSendTransaction, usePrepareTransactionRequest } from 'wagmi'
import TransactionDetailsInput from '../components/modals/TransactionDetails';
import GasDetailsOutput from '../components/modals/GasDetails';
import ErrorDetails from '../components/modals/ErrorDetails';
import ValidateButton from '../components/buttons/ValidateButton';
import SendToNetworkButton from '../components/buttons/SendToNetworkButton';
import { useTransaction } from '../context/TransactionContextCore';
import { CustomNetworkAlert } from '../components/custom/alert';


const Body = () => {
  const { validateInputs, account, client, toAddress, valueInWei, data } = useTransaction();

  // Prepare the transaction
  const { config } = usePrepareTransactionRequest({
    to: toAddress,
    value: valueInWei ? parseEther(valueInWei) : undefined,
    data,
  })


  const {
    data: transactionData,
    error: transactionError,
    sendTransaction,
    config: transactionConfig,
  } = useSendTransaction(config);

  console.log(`Transaction details: `);
  console.dir(transactionConfig, { depth: 2 });

  const [validationPassed, setValidationPassed] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const { status: gasEstimationStatus } = useSelector((state) => state.gasEstimation);

  const handleValidate = async () => {
    const validationResult = validateInputs();
    console.log(validationResult ? 'Validation passed' : 'Validation failed');

    if (!validationResult) {
      setErrorDetails({
        errorCode: '501',
        errorMessage: 'The transaction details are invalid. Please check your inputs.'
      });
      return;
    }

    setErrorDetails(null);
    setValidationPassed(validationResult);
  };

  const isAccountConnected = () => {
    if (account.status === 'connected') {
      setConnectionStatus(true);
    }
    setConnectionStatus(false);
  }
  const handleSendToNetwork = () => {
    console.log('Sending to network...');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-4 py-12">
      <div className="w-full max-w-lg">
        <div className='my-6'>
          <h1 className="text-white text-2xl font-bold text-center">
            Simplest EVM Transaction Submission
          </h1>
          <p className="text-white text-xs text-center">
            Developer Friendly Ethereum transaction submission through UI.
          </p>
        </div>


        <div className="space-y-4">
          <div className="bg-black bg-opacity-25 p-4 rounded-lg shadow-md">
            <CustomNetworkAlert chainId={client.chain.id} address={account.address} />
          </div>

          <div className="bg-black bg-opacity-25 p-4 rounded-lg shadow-md">
            <TransactionDetailsInput />
            <div className="mt-4">
              <ValidateButton shouldBeActive={isAccountConnected} onClick={handleValidate} />
            </div>
          </div>

          {validationPassed ? (
            <div className="bg-black bg-opacity-25 p-4 rounded-lg shadow-md">
              <GasDetailsOutput />
              <div className="mt-4">
                <SendToNetworkButton isValid={gasEstimationStatus === 'succeeded'} onClick={sendTransaction} />
              </div>
              <div>
                {transactionData && (
                  <div>Transaction: {JSON.stringify(transactionData)}</div>
                )}
                {transactionError && <div>Error sending transaction</div>}
              </div>
            </div>
          ) : errorDetails && (
            <div className="bg-black bg-opacity-25 p-4 rounded-lg shadow-md">
              <ErrorDetails errorCode={errorDetails.errorCode} errorMessage={errorDetails.errorMessage} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Body;
