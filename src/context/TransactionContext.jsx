// context/TransactionProvider.jsx
import React, { useState, useEffect } from 'react';
import { isAddress } from 'viem';
import { useAccount, useChainId, useClient } from 'wagmi';
import { TransactionContext } from './TransactionContextCore';

export const TransactionProvider = ({ children }) => {
  const [toAddress, setToAddress] = useState('');
  const [data, setData] = useState('');
  const [valueInWei, setEthValue] = useState(0);
  const [isTxInputValid, setIsTxInputValid] = useState(false);
  const [userGasLimit, setUserGasLimit] = useState(null); // ✅ New

  const chainId = useChainId();
  const account = useAccount();
  const client = useClient();

  const validateInputs = () => {
    const isValidAddress = isAddress(toAddress);
    const isValidData = /^(0x)?([a-fA-F0-9]*)$/.test(data);
    const allValid = isValidAddress && isValidData;
    setIsTxInputValid(allValid);
    return allValid;
  };

  useEffect(() => {
    console.log("Transaction Debug:", {
      toAddress, data, valueInWei, isTxInputValid, chainId,
      userGasLimit, account, client,
    });
  }, [toAddress, data, valueInWei, isTxInputValid, chainId, userGasLimit]);

  return (
    <TransactionContext.Provider value={{
      toAddress, setToAddress,
      data, setData,
      valueInWei, setEthValue,
      isTxInputValid, setIsTxInputValid,
      userGasLimit, setUserGasLimit,
      chainId, account, client, validateInputs
    }}>
      {children}
    </TransactionContext.Provider>
  );
};
