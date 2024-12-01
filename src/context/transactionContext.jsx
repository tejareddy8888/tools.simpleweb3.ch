import React, { createContext, useState, useContext } from 'react';
import { isAddress } from 'viem'
import { useAccount, useChainId } from 'wagmi'

const TransactionContext = createContext();

export const useTransaction = () => useContext(TransactionContext);

export const TransactionProvider = ({ children }) => {
    const [toAddress, setToAddress] = useState('');
    const [data, setData] = useState('');
    const [valueInWei, setEthValue] = useState('');
    const [isTxInputValid, setIsTxInputValid] = useState(false);
    const chainId = useChainId();
    const account = useAccount();

    const validateInputs = () => {
        const isValidAddress = isAddress(toAddress);
        const isValidData = /^(0x)?([a-fA-F0-9]*)$/.test(data);

        const allValid = account.status === 'connected' && isValidAddress && isValidData;
        setIsTxInputValid(allValid);
        return allValid;
    };

    return (
        <TransactionContext.Provider value={{
            toAddress, setToAddress,
            data, setData,
            valueInWei, setEthValue,
            isTxInputValid, setIsTxInputValid,
            chainId,
            account,
            validateInputs
        }}>
            {children}
        </TransactionContext.Provider>
    );
};