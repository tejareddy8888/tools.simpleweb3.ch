import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [react()],
    envPrefix: 'TOOLS_',
    build: {
        outDir: 'dist',
        sourcemap: false, // Change this to false for production
        minify: true, // Enable minification for production
        rollupOptions: {
            output: {
                manualChunks: undefined // Ensure proper code splitting
            }
        }
    },
    server: {
        host: true, // Needed for proper network access
        strictPort: true,
        port: 4173 // Match this with your Docker EXPOSE port
    },
    logLevel: 'info', // Set to 'info' for more verbose logging
    customLogger: {
        info: (msg) => writeLog(`INFO: ${msg}`),
        warn: (msg) => writeLog(`WARN: ${msg}`),
        error: (msg) => writeLog(`ERROR: ${msg}`),
    }
})