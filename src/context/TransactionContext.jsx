import React, { useState, } from 'react';
import { isAddress, } from 'viem'
import { useAccount, useChainId, useClient, useSendTransaction } from 'wagmi';

import { TransactionContext } from './TransactionContextCore';

export const TransactionProvider = ({ children }) => {
    const [toAddress, setToAddress] = useState('');
    const [data, setData] = useState('');
    const [valueInWei, setEthValue] = useState(0);
    const [isTxInputValid, setIsTxInputValid] = useState(false);
    const chainId = useChainId();
    const account = useAccount();
    const client = useClient();
    const { sendTransactionAsync } = useSendTransaction();

    const validateInputs = () => {
        const isValidAddress = isAddress(toAddress);
        const isValidData = /^(0x)?([a-fA-F0-9]*)$/.test(data);

        const allValid = isValidAddress && isValidData;
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
            client,
            sendTransactionAsync,
            validateInputs,
        }}>
            {children}
        </TransactionContext.Provider>
    );
};
