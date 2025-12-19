import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import ErrorBoundary from './components/ErrorBoundary';
import { SolanaWalletContext } from './web3/SolanaWalletProvider.jsx';
import { BitcoinWalletProvider } from './web3/BitcoinWalletProvider.jsx'; // ✅ add this
import gasEstimationReducer from './reducer/gasEstimation';
import { config } from './web3/wagmi';
import router from './router.jsx';
import './index.css';
import { Buffer } from 'buffer';
window.Buffer = Buffer;

// Redux store
const store = configureStore({
  reducer: {
    gasEstimation: gasEstimationReducer,
  },
});

// React Query client
const queryClient = new QueryClient();

// ✅ Correct nesting order
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={config}>
          <RainbowKitProvider
            theme={darkTheme({
              accentColor: '#00FE77',
              accentColorForeground: 'black',
              borderRadius: 'medium',
            })}
          >
            <SolanaWalletContext>
              <BitcoinWalletProvider> {/* ✅ wrap your app with BTC provider */}
                <Provider store={store}>
                  <RouterProvider router={router} />
                </Provider>
              </BitcoinWalletProvider>
            </SolanaWalletContext>
          </RainbowKitProvider>
        </WagmiProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
