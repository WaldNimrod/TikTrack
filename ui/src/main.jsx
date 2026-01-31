import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './router/AppRouter.jsx';

// CSS Loading Order (CRITICAL - כפי שמוגדר ב-CSS Standards Protocol)
// 2. Phoenix Base Styles
import './styles/phoenix-base.css';
// 3. LEGO Components
import './styles/phoenix-components.css';
// 4. Header Component (if used)
import './styles/phoenix-header.css';
// 5. Page-Specific Styles
import './styles/D15_IDENTITY_STYLES.css';

/**
 * Main Entry Point
 * 
 * @description נקודת הכניסה הראשית של האפליקציה
 * @legacyReference Legacy.app.entry
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>
);
