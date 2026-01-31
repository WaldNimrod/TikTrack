/**
 * Vite Configuration - TikTrack Phoenix Frontend
 * ----------------------------------------------
 * Build system configuration for React 18 + Vite
 * 
 * @description Configures Vite dev server, React plugin, and API proxy
 * @port 8080 - Frontend development server (V2 port as per Master Blueprint)
 * @proxy /api -> http://localhost:8082 (Backend API)
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,  // V2 port as per Master Blueprint: "Ports: V2 (8080), Legacy (8081)"
    proxy: {
      '/api': {
        target: 'http://localhost:8082',  // Backend API on different port
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
