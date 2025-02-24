import React, { useState, useEffect } from 'react';
import { useTransaction } from '../../context/TransactionContextCore';

const TransactionDetailsInput = () => {
  const { toAddress, setToAddress, data, setData, valueInWei, setEthValue, validateInputs } = useTransaction();

  // useEffect(() => {
  //   // Validation logic
  //   validateInputs();
  // }, [toAddress, data, valueInWei]);

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   if (isValid) {
  //     console.log('Form submitted:', { toAddress, data, valueInWei });
  //     // Add your submission logic here
  //   }
  // };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-xl">
      <form onSubmit={validateInputs} className="space-y-4">
        <div>
          <label htmlFor="toAddress" className="block text-sm font-medium text-gray-700">To:</label>
          <input
            type="text"
            id="toAddress"
            value={toAddress}
            placeholder='0x4838B106FCe9647Bdf1E7877BF73cE8B0BAD5f97'
            onChange={(e) => setToAddress(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="data" className="block text-sm font-medium text-gray-700">Data:</label>
          <input
            type="text"
            id="data"
            value={data}
            placeholder='0x Prefixed Hexadecimal String or just HexString'
            onChange={(e) => setData(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label htmlFor="valueInWei" className="block text-sm font-medium text-gray-700">Value: </label>
          <input
            type="number"
            id="valueInWei"
            value={valueInWei}
            placeholder='value in Wei units'
            onChange={(e) => setEthValue(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
      </form>
    </div>
  );
};

export default TransactionDetailsInput;