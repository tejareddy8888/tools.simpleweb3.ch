import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    strictPort: true,
    port: 4173
  },
  envPrefix: 'TOOLS_',
  build: {
    chunkSizeWarningLimit: 1000, // Increase the limit to 1000 kB
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@emotion/react', '@emotion/styled', '@mui/material', '@headlessui/react'],
          web3: ['@rainbow-me/rainbowkit', 'viem', 'wagmi'],
          state: ['@reduxjs/toolkit', 'react-redux'],
        },
      },
    },
  }
})
