import React, { useState } from 'react';
import TransactionDetailsInput from './TransactionDetails';
import GasDetailsOutput from './GasDetails';
import ValidateButton from './ValidateButton';
import SendToNetworkButton from './SendToNetworkButton';
import { useTransaction } from '../context/TransactionContext';

const Body = () => {
  const { isValid, validateInputs, chain } = useTransaction();

  const handleValidate = () => {
    const validationResult = validateInputs();
    console.log(validationResult ? 'Validation passed' : 'Validation failed');
  };

  const handleSendToNetwork = () => {
    console.log('Sending to network...');
  };

  return (
    <div className="w-full max-w-md my-8">
      <div className='my-4'>
        <h2 className="text-white text-xl font-bold text-center">
          Ethereum Transaction Submission
        </h2>
        <p className="text-white text-xs font-bold text-center">
          A simple way to submit any kind of Ethereum transaction.
        </p>
      </div>
      <div className="bg-green-900 p-4 sm:p-6 rounded-lg shadow-md bg-opacity-25">
        <TransactionDetailsInput />
        <div className="mt-4 space-y-2">
          <ValidateButton isValid={true} onClick={handleValidate} />
        </div>
        <GasDetailsOutput />
        <div className="mt-4 space-y-2">
          <SendToNetworkButton isValid={isValid} onClick={handleSendToNetwork} />
        </div>
      </div>
    </div>
  );
};

export default Body;
