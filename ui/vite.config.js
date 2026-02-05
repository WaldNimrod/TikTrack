/**
 * Vite Configuration - TikTrack Phoenix Frontend
 * ----------------------------------------------
 * Build system configuration for React 18 + Vite
 * 
 * @description Configures Vite dev server, React plugin, and API proxy
 * @port 8080 - Frontend development server (V2 port as per Master Blueprint)
 * @proxy /api -> http://localhost:8082 (Backend API)
 * 
 * IMPORTANT: Static HTML pages (e.g., /views/financial/*.html) must be served
 * directly without going through React Router. This middleware ensures that
 * HTML files are served as static files, bypassing the React SPA routing.
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory of the current module (vite.config.js)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load routes.json - SSOT for routes
const routesPath = path.join(__dirname, 'public', 'routes.json');
let routeToHtmlMap = {};

if (fs.existsSync(routesPath)) {
  try {
    const routesConfig = JSON.parse(fs.readFileSync(routesPath, 'utf-8'));
    routeToHtmlMap = routesConfig.routes || {};
    console.log('[Vite Config] ✅ Loaded routes from routes.json:', Object.keys(routeToHtmlMap).length, 'routes');
  } catch (error) {
    console.warn('[Vite Config] ⚠️ Failed to parse routes.json, using fallback:', error.message);
    // Fallback to default routes
    routeToHtmlMap = {
      '/trading_accounts': '/views/financial/tradingAccounts/trading_accounts.html',
      '/brokers_fees': '/views/financial/brokersFees/brokers_fees.html',
      '/cash_flows': '/views/financial/cashFlows/cash_flows.html',
    };
  }
} else {
  console.warn('[Vite Config] ⚠️ routes.json not found at', routesPath, '- using fallback');
  // Fallback to default routes
  routeToHtmlMap = {
    '/trading_accounts': '/views/financial/tradingAccounts/trading_accounts.html',
    '/brokers_fees': '/views/financial/brokersFees/brokers_fees.html',
    '/cash_flows': '/views/financial/cashFlows/cash_flows.html',
  };
}

// Custom Vite plugin to serve HTML files before React Router
const htmlPagesPlugin = () => {
  return {
    name: 'html-pages-plugin',
    configureServer(server) {
      // CRITICAL: Insert middleware at the BEGINNING of the stack
      // This ensures it runs before Vite's historyApiFallback
      const htmlMiddleware = (req, res, next) => {
        const url = req.url?.split('?')[0] || '';
        
        // Skip Vite internal requests and assets
        if (url.startsWith('/@') || 
            url.startsWith('/node_modules/') || 
            url.startsWith('/src/') && !url.endsWith('.html') ||
            url.includes('.js') || 
            url.includes('.css') ||
            url.includes('.svg') ||
            url.includes('.png') ||
            url.includes('.jpg')) {
          return next();
        }
        
        // Log requests for HTML routes only
        if (routeToHtmlMap[url] || url.endsWith('.html')) {
          console.log(`\n[HTML Plugin] ============================================`);
          console.log(`[HTML Plugin] Request: ${req.method} ${url}`);
          console.log(`[HTML Plugin] Full URL: ${req.url}`);
        }
        
        // Check if this is a mapped clean route
        if (routeToHtmlMap[url]) {
          const htmlPath = routeToHtmlMap[url];
          // Remove leading slash from htmlPath for path.join
          const htmlPathNormalized = htmlPath.startsWith('/') ? htmlPath.substring(1) : htmlPath;
          const filePath = path.join(__dirname, 'src', htmlPathNormalized);
          
          console.log(`[HTML Plugin] ✅ Mapped route: ${url} -> ${htmlPath}`);
          console.log(`[HTML Plugin] Normalized path: ${htmlPathNormalized}`);
          console.log(`[HTML Plugin] File path: ${filePath}`);
          console.log(`[HTML Plugin] __dirname: ${__dirname}`);
          console.log(`[HTML Plugin] File exists: ${fs.existsSync(filePath)}`);
          
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const content = fs.readFileSync(filePath, 'utf-8');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache');
            res.end(content);
            console.log(`[HTML Plugin] ✅✅✅ SERVED: ${url} -> ${htmlPath}`);
            return; // Don't call next() - request handled
          } else {
            console.log(`[HTML Plugin] ❌ File not found!`);
            console.log(`[HTML Plugin] Attempted path: ${filePath}`);
            // Try alternative paths
            const altPaths = [
              path.join(process.cwd(), 'ui', 'src', htmlPathNormalized),
              path.join(process.cwd(), 'src', htmlPathNormalized),
            ];
            for (const altPath of altPaths) {
              console.log(`[HTML Plugin] Trying alternative: ${altPath}`);
              if (fs.existsSync(altPath) && fs.statSync(altPath).isFile()) {
                const content = fs.readFileSync(altPath, 'utf-8');
                res.setHeader('Content-Type', 'text/html; charset=utf-8');
                res.setHeader('Cache-Control', 'no-cache');
                res.end(content);
                console.log(`[HTML Plugin] ✅✅✅ SERVED from alternative path: ${altPath}`);
                return;
              }
            }
          }
        }
        
        // Check for direct HTML file requests
        if (url.endsWith('.html') && !url.includes('/node_modules/') && !url.includes('/dist/')) {
          const urlNormalized = url.startsWith('/') ? url.substring(1) : url;
          const filePath = path.join(__dirname, 'src', urlNormalized);
          
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const content = fs.readFileSync(filePath, 'utf-8');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache');
            res.end(content);
            console.log(`[HTML Plugin] ✅✅✅ SERVED DIRECT: ${url}`);
            return; // Don't call next() - request handled
          }
        }
        
        // Continue to next middleware
        next();
      };
      
      // Insert at the beginning of middleware stack
      server.middlewares.stack.unshift({
        route: '',
        handle: htmlMiddleware
      });
      
      console.log('\n[HTML Plugin] ✅ Plugin registered - HTML pages will be served before React Router\n');
    }
  };
};

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    htmlPagesPlugin() // Add our custom plugin BEFORE react plugin
  ],
  server: {
    host: '0.0.0.0',  // Listen on all interfaces (IPv4 and IPv6)
    port: 8080,  // V2 port as per Master Blueprint: "Ports: V2 (8080), Legacy (8081)"
    proxy: {
      '/api': {
        target: 'http://localhost:8082',  // Backend API on different port
        changeOrigin: true,
        secure: false,
      },
    },
    // Middleware to serve static HTML files directly (bypass React Router)
    middlewareMode: false,
    fs: {
      // Allow serving files from one level up to the project root
      allow: ['..'],
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
