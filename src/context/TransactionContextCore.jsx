import { createContext, useContext } from 'react';

export const TransactionContext = createContext();

export const useTransaction = () => useContext(TransactionContext);