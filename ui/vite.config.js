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
    // Gate B Fix: Extract routes from nested structure (routes.financial, routes.planning, etc.)
    routeToHtmlMap = {};
    
    // Flatten nested routes structure
    if (routesConfig.routes) {
      Object.keys(routesConfig.routes).forEach(category => {
        const categoryRoutes = routesConfig.routes[category];
        if (typeof categoryRoutes === 'object') {
          Object.keys(categoryRoutes).forEach(routeKey => {
            const routePath = categoryRoutes[routeKey];
            // Map both with and without .html extension
            routeToHtmlMap[routePath] = routePath; // Direct mapping
            // Also map clean route (without .html) to HTML file
            if (routePath.endsWith('.html')) {
              const cleanRoute = routePath.replace('.html', '');
              routeToHtmlMap[cleanRoute] = routePath;
            }
          });
        }
      });
    }
    
    console.log('[Vite Config] ✅ Loaded routes from routes.json:', Object.keys(routeToHtmlMap).length, 'routes');
    console.log('[Vite Config] Route mappings:', routeToHtmlMap);
  } catch (error) {
    console.warn('[Vite Config] ⚠️ Failed to parse routes.json, using fallback:', error.message);
    // Fallback to default routes
    routeToHtmlMap = {
      '/trading_accounts': '/trading_accounts.html',
      '/trading_accounts.html': '/trading_accounts.html',
      '/brokers_fees': '/brokers_fees.html',
      '/brokers_fees.html': '/brokers_fees.html',
      '/cash_flows': '/cash_flows.html',
      '/cash_flows.html': '/cash_flows.html',
    };
  }
} else {
  console.warn('[Vite Config] ⚠️ routes.json not found at', routesPath, '- using fallback');
  // Fallback to default routes
  routeToHtmlMap = {
    '/trading_accounts': '/trading_accounts.html',
    '/trading_accounts.html': '/trading_accounts.html',
    '/brokers_fees': '/brokers_fees.html',
    '/brokers_fees.html': '/brokers_fees.html',
    '/cash_flows': '/cash_flows.html',
    '/cash_flows.html': '/cash_flows.html',
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
        
        // Gate B Fix: Check if this is a mapped clean route (from routeToHtmlMap)
        if (routeToHtmlMap[url]) {
          const htmlPath = routeToHtmlMap[url];
          // Gate B Fix: Map routes.json paths (e.g., /trading_accounts.html) to actual file paths
          // routes.json has paths like /trading_accounts.html, but files are in /views/financial/...
          let actualFilePath = htmlPath;
          
          // If htmlPath is just a filename (e.g., /trading_accounts.html), find the actual file location
          if (htmlPath.startsWith('/') && htmlPath.includes('.html') && !htmlPath.includes('/views/')) {
            // Map common routes to their actual file locations
            const routeToFileMap = {
              '/trading_accounts.html': '/views/financial/tradingAccounts/trading_accounts.html',
              '/brokers_fees.html': '/views/financial/brokersFees/brokers_fees.html',
              '/cash_flows.html': '/views/financial/cashFlows/cash_flows.html',
              '/tickers.html': '/views/management/tickers/tickers.html',
              '/user_tickers.html': '/views/management/userTicker/user_tickers.html',
              '/data_dashboard.html': '/views/data/dataDashboard/data_dashboard.html',
              '/system_management.html': '/views/management/systemManagement/system_management.html',
              '/trade_plans.html': '/views/planning/tradePlans/trade_plans.html',
              '/ai_analysis.html': '/views/planning/aiAnalysis/ai_analysis.html',
              '/watch_lists.html': '/views/tracking/watchLists/watch_lists.html',
              '/ticker_dashboard.html': '/views/tracking/tickerDashboard/ticker_dashboard.html',
              '/trading_journal.html': '/views/tracking/tradingJournal/trading_journal.html',
              '/trades.html': '/views/tracking/trades/trades.html',
              '/strategy-analysis.html': '/views/research/strategyAnalysis/strategy_analysis.html',
              '/trades_history.html': '/views/research/tradesHistory/trades_history.html',
              '/portfolio-state.html': '/views/research/portfolioState/portfolio_state.html',
              '/alerts.html': '/views/data/alerts/alerts.html',
              '/notes.html': '/views/data/notes/notes.html',
              '/executions.html': '/views/data/executions/executions.html',
              '/data_import.html': '/views/settings/dataImport/data_import.html',
              '/tag_management.html': '/views/settings/tagManagement/tag_management.html',
              '/preferences.html': '/views/settings/preferences/preferences.html',
            };
            actualFilePath = routeToFileMap[htmlPath] || htmlPath;
          }
          
          // Remove leading slash from actualFilePath for path.join
          const htmlPathNormalized = actualFilePath.startsWith('/') ? actualFilePath.substring(1) : actualFilePath;
          const filePath = path.join(__dirname, 'src', htmlPathNormalized);
          
          console.log(`[HTML Plugin] ✅ Mapped route: ${url} -> ${htmlPath} -> ${actualFilePath}`);
          console.log(`[HTML Plugin] File path: ${filePath}`);
          console.log(`[HTML Plugin] File exists: ${fs.existsSync(filePath)}`);
          
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const content = fs.readFileSync(filePath, 'utf-8');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache');
            res.end(content);
            console.log(`[HTML Plugin] ✅✅✅ SERVED: ${url} -> ${actualFilePath}`);
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
        
        // Gate B Fix: Check for direct HTML file requests (e.g., /trading_accounts.html)
        if (url.endsWith('.html') && !url.includes('/node_modules/') && !url.includes('/dist/')) {
          // Try to find the file in src/views/financial/...
          const htmlFileName = url.split('/').pop(); // e.g., trading_accounts.html
          const urlToFileName = {
            'strategy-analysis.html': 'strategy_analysis.html',
            'portfolio-state.html': 'portfolio_state.html',
          };
          const resolvedHtmlFileName = urlToFileName[htmlFileName] || htmlFileName;
          const possiblePaths = [
            path.join(__dirname, 'src', 'views', 'planning', 'tradePlans', resolvedHtmlFileName),
            path.join(__dirname, 'src', 'views', 'planning', 'aiAnalysis', resolvedHtmlFileName),
            path.join(__dirname, 'src', 'views', 'tracking', 'watchLists', resolvedHtmlFileName),
            path.join(__dirname, 'src', 'views', 'tracking', 'tickerDashboard', resolvedHtmlFileName),
            path.join(__dirname, 'src', 'views', 'tracking', 'tradingJournal', resolvedHtmlFileName),
            path.join(__dirname, 'src', 'views', 'tracking', 'trades', resolvedHtmlFileName),
            path.join(__dirname, 'src', 'views', 'research', 'strategyAnalysis', resolvedHtmlFileName),
            path.join(__dirname, 'src', 'views', 'research', 'tradesHistory', resolvedHtmlFileName),
            path.join(__dirname, 'src', 'views', 'research', 'portfolioState', resolvedHtmlFileName),
            path.join(__dirname, 'src', 'views', 'data', 'alerts', resolvedHtmlFileName),
            path.join(__dirname, 'src', 'views', 'data', 'notes', resolvedHtmlFileName),
            path.join(__dirname, 'src', 'views', 'data', 'executions', resolvedHtmlFileName),
            path.join(__dirname, 'src', 'views', 'settings', 'dataImport', resolvedHtmlFileName),
            path.join(__dirname, 'src', 'views', 'settings', 'tagManagement', resolvedHtmlFileName),
            path.join(__dirname, 'src', 'views', 'settings', 'preferences', resolvedHtmlFileName),
            path.join(__dirname, 'src', 'views', 'financial', 'tradingAccounts', htmlFileName),
            path.join(__dirname, 'src', 'views', 'financial', 'brokersFees', htmlFileName),
            path.join(__dirname, 'src', 'views', 'financial', 'cashFlows', htmlFileName),
            path.join(__dirname, 'src', 'views', 'management', 'tickers', htmlFileName),
            path.join(__dirname, 'src', 'views', 'management', 'userTicker', htmlFileName),
            path.join(__dirname, 'src', 'views', 'data', 'dataDashboard', htmlFileName),
            path.join(__dirname, 'src', 'views', 'management', 'systemManagement', htmlFileName),
            path.join(__dirname, 'src', url.substring(1)),
          ];
          
          for (const filePath of possiblePaths) {
            if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
              const content = fs.readFileSync(filePath, 'utf-8');
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.setHeader('Cache-Control', 'no-cache');
              res.end(content);
              console.log(`[HTML Plugin] ✅✅✅ SERVED DIRECT: ${url} -> ${filePath}`);
              return; // Don't call next() - request handled
            }
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
