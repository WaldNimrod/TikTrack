/**
 * Vite Configuration - TikTrack Phoenix Frontend
 * ----------------------------------------------
 * Build system configuration for React 18 + Vite
 * 
 * @description Configures Vite dev server, React plugin, and API proxy
 * @port 3000 - Frontend development server
 * @proxy /api -> http://localhost:8080 (Backend API)
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'axios-vendor': ['axios'],
        },
      },
    },
  },
});
