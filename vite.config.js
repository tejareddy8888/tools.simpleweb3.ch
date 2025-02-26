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
  },
  preview: {
    host: true,
    strictPort: true,
    port: 4173
  },
})
