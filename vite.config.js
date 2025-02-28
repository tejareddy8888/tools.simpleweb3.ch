import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    envPrefix: 'TOOLS_',
    base: './',
    build: {
        outDir: 'dist',
        sourcemap: true, // Enable source maps for better debugging
        rollupOptions: {
            output: {
                // Simple chunking strategy to avoid potential issues
                manualChunks: (id) => {
                    if (id.includes('node_modules')) {
                        return 'vendor';
                    }
                }
            }
        }
    },

})
