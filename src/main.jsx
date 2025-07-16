import '@rainbow-me/rainbowkit/styles.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  RouterProvider,
} from "react-router-dom";
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import ErrorBoundary from './components/ErrorBoundary';

import gasEstimationReducer from './reducer/gasEstimation';
import { config } from './web3/wagmi';
import router from './router.jsx';
import './index.css';

const store = configureStore({
  reducer: {
    gasEstimation: gasEstimationReducer,
  },
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider theme={darkTheme({
            accentColor: '#025fb6',
            accentColorForeground: 'white',
            borderRadius: 'medium',
          })}>
            
            <Provider store={store}>
              <RouterProvider router={router} />
            </Provider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </ErrorBoundary>
  </React.StrictMode>
);