import '@rainbow-me/rainbowkit/styles.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  RouterProvider,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';

import { config } from './web3/wagmi';
import router from './router.jsx';
import './index.css';
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme({
          accentColor: '#009933',
          accentColorForeground: 'white',
          borderRadius: 'medium',
        })}>
          <RouterProvider router={router} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);