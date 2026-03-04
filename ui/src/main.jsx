/**
 * Main Entry Point - TikTrack Phoenix Frontend
 * ---------------------------------------------
 * Application bootstrap and CSS loading order
 * 
 * @description Entry point for React application with CRITICAL CSS loading order
 * @infrastructure Team 60 - CSS loading order MUST follow CSS Standards Protocol
 * 
 * CSS Loading Order (CRITICAL - DO NOT CHANGE):
 * 1. Pico CSS (CDN - loaded in index.html)
 * 2. phoenix-base.css - Global defaults & DNA variables
 * 3. phoenix-components.css - LEGO components
 * 4. phoenix-header.css - Header component (if used)
 * 5. Page-specific CSS - Loaded per route (D15_IDENTITY_STYLES.css, etc.)
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './router/AppRouter.jsx';
import { PhoenixFilterProvider } from './cubes/shared/contexts/PhoenixFilterContext.jsx';

// CSS Loading Order (CRITICAL - Follow CSS Standards Protocol)
// 1. Pico CSS - Already loaded in index.html via CDN

// 2. Phoenix Base Styles (Global defaults & DNA variables)
import './styles/phoenix-base.css';

// 3. LEGO Components (Reusable components)
import './styles/phoenix-components.css';

// 4. Header Component (If header is used)
import './styles/phoenix-header.css';

// 5. Page-specific CSS - Auth pages (D15)
import './styles/D15_IDENTITY_STYLES.css';

/**
 * G7R §3E: Auth boot — token expiry check + 401 handler
 */
(async () => {
  try {
    const [{ default: sharedServices }, { default: authService }] = await Promise.all([
      import('./components/core/sharedServices.js'),
      import('./cubes/identity/services/auth.js')
    ]);
    await sharedServices.init();
    sharedServices.on401 = () => authService.handle401Logout();
    authService.checkTokenExpiryOnBoot();
  } catch (_) {}
})();

/**
 * Application Bootstrap
 * 
 * @description Initializes React root and renders AppRouter
 * ADR-013 SSOT: React mount marker for E2E load-order assert (Header Loader must run first)
 */
try { window.__reactMountStart = window.__reactMountStart || Date.now(); } catch (_) {}
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <PhoenixFilterProvider>
      <AppRouter />
    </PhoenixFilterProvider>
  </React.StrictMode>
);
