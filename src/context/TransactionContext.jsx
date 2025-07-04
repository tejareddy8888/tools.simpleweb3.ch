import { useAccount, useChainId, useClient, useSendTransaction, usePrepareTransactionRequest } from 'wagmi';
import { TransactionContext } from './TransactionContextCore';
import React, { useState, useEffect } from 'react';
import { isAddress, parseEther } from 'viem';

export const TransactionProvider = ({ children }) => {
    const [toAddress, setToAddress] = useState('');
    const [data, setData] = useState('');
    const [valueInWei, setEthValue] = useState(0);
    const [isTxInputValid, setIsTxInputValid] = useState(false);
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
  console.log("🧩 Debug Values:");
  console.log("toAddress:", toAddress);
  console.log("data:", data);
  console.log("valueInWei:", valueInWei);
  console.log("isTxInputValid:", isTxInputValid);
  console.log("chainId:", chainId);
  console.log("account:", account);
  console.log("client:", client);
  
}, [toAddress, data, valueInWei, isTxInputValid, chainId, account, client]);

    return (
        <TransactionContext.Provider value={{
            toAddress, setToAddress,
            data, setData,
            valueInWei, setEthValue,
            isTxInputValid, setIsTxInputValid,
            chainId,
            account,
            client,
            validateInputs
        }}>
            {children}
        </TransactionContext.Provider>
    );
};