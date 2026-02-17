/**
 * Auth Guard - מטפל באימות עבור HTML Pages
 * --------------------------------------------------------
 * בודק אם המשתמש מאומת ומפנה ל-login אם לא
 * 
 * Clean Slate Rule: כל ה-JavaScript בקובץ חיצוני
 * 
 * IMPORTANT: This guard checks authentication for HTML pages
 * and redirects to login if user is not authenticated.
 * 
 * Phase 1 Implementation: Debug Mode, Enhanced Logging, Error Handling
 * Phase 2 Implementation: Masked Log for Security
 */

// Import masked log utility
import { maskedLogWithTimestamp } from '../../utils/maskedLog.js';

(function initAuthGuard() {
  'use strict';

  // ============================================
  // Phase 1.2: Enhanced Logging with Timestamps (DEFINE FIRST)
  // Phase 2: Updated to use Masked Log for Security
  // ============================================
  let requestIdCounter = 0;
  
  function generateRequestId() {
    return `req_${Date.now()}_${++requestIdCounter}`;
  }
  
  function logWithTimestamp(message, data = null) {
    const timestamp = new Date().toISOString();
    const requestId = generateRequestId();
    const logEntry = {
      timestamp,
      message,
      data,
      requestId
    };
    
    // Use masked log to prevent token leakage
    if (data) {
      maskedLogWithTimestamp(`Auth Guard: ${message}`, data);
    } else {
      console.log(`[${timestamp}] Auth Guard: ${message}`);
    }
    
    return logEntry;
  }

  // ============================================
  // Phase 1.1: Debug Mode (AFTER logWithTimestamp)
  // ============================================
  const urlParams = new URLSearchParams(window.location.search);
  const debugMode = urlParams.get('debug') === 'true' || localStorage.getItem('auth_guard_debug') === 'true';
  
  if (debugMode) {
    console.log('🔍 Auth Guard: DEBUG MODE ENABLED - No redirects will occur');
    console.log('🔍 Auth Guard: Add ?debug=true to URL or set localStorage.auth_guard_debug=true');
    // Also log with timestamp for consistency
    logWithTimestamp('🔍 DEBUG MODE ENABLED - No redirects will occur');
  }

  // Prevent multiple initializations
  if (window.AuthGuard && window.AuthGuard._initialized) {
    logWithTimestamp('Already initialized, skipping');
    return;
  }

  /**
   * Check if user is authenticated
   * Checks both localStorage and sessionStorage for access_token or authToken
   */
  function isAuthenticated() {
    try {
      // Check localStorage first (primary storage) - try both token names
      let token = localStorage.getItem('access_token');
      
      // If not found, try authToken (alternative name used in some parts of the app)
      if (!token) {
        token = localStorage.getItem('authToken');
      }
      
      // If not found in localStorage, check sessionStorage
      if (!token) {
        token = sessionStorage.getItem('access_token');
      }
      
      // If still not found, try authToken in sessionStorage
      if (!token) {
        token = sessionStorage.getItem('authToken');
      }
      
      const hasToken = !!token && token.trim() !== '';
      
      // Enhanced logging
      const localStorageKeys = Object.keys(localStorage);
      const sessionStorageKeys = Object.keys(sessionStorage);
      
      // Use masked log - don't include token preview to prevent leakage
      logWithTimestamp('Checking authentication', {
        tokenExists: !!token,
        tokenLength: token ? token.length : 0,
        hasToken: hasToken,
        localStorageKeys: localStorageKeys,
        sessionStorageKeys: sessionStorageKeys,
        // tokenPreview removed for security - use maskedLog instead
        checkedKeys: ['access_token', 'authToken']
      });
      
      return hasToken;
    } catch (error) {
      logWithTimestamp('Error checking authentication', {
        error: error.message,
        stack: error.stack
      });
      return false; // Fail closed - require authentication
    }
  }

  // ============================================
  // Routes Configuration - Load from routes.json
  // ============================================
  let routesConfig = null;

  async function loadRoutesConfig() {
    if (routesConfig) return routesConfig;
    
    try {
      const response = await fetch('/routes.json');
      if (!response.ok) throw new Error('Failed to load routes.json');
      routesConfig = await response.json();
      logWithTimestamp('Routes config loaded successfully', {
        version: routesConfig.version,
        publicRoutesCount: routesConfig.public_routes?.length || 0,
        routesCount: Object.keys(routesConfig.routes || {}).length
      });
      return routesConfig;
    } catch (error) {
      logWithTimestamp('Failed to load routes.json, using fallback', {
        error: error.message
      });
      // Fallback to default routes
      routesConfig = {
        public_routes: ['/login', '/register', '/reset-password'],
        routes: {}
      };
      return routesConfig;
    }
  }

  async function isPublicRoute(path) {
    const config = await loadRoutesConfig();
    return config.public_routes?.includes(path) || false;
  }

  /**
   * Check authentication and redirect if needed
   * Phase 1.3: Enhanced Error Handling
   * Updated: Uses routes.json for public routes
   */
  async function checkAuthAndRedirect() {
    try {
      const currentPath = window.location.pathname;
      const fullUrl = window.location.href;
      
      logWithTimestamp('Checking page access', {
        currentPath: currentPath,
        fullUrl: fullUrl,
        debugMode: debugMode
      });
      
      // Check if current page is public using routes.json
      const isPublicPage = await isPublicRoute(currentPath);
      
      if (isPublicPage) {
        logWithTimestamp('Public page detected (from routes.json), allowing access', {
          currentPath: currentPath
        });
        return; // Allow access to public pages
      }

      // Check authentication
      const authenticated = isAuthenticated();
      logWithTimestamp('Authentication check result', {
        authenticated: authenticated,
        currentPath: currentPath,
        debugMode: debugMode
      });
      
      if (!authenticated) {
        logWithTimestamp('User not authenticated', {
          currentPath: currentPath,
          willRedirect: !debugMode,
          debugMode: debugMode
        });
        
        // Skip redirect in debug mode
        if (debugMode) {
          logWithTimestamp('🔍 DEBUG MODE: Skipping redirect to /login');
          return;
        }
        
        // Redirect to login page
        logWithTimestamp('Redirecting to /login', {
          currentPath: currentPath,
          redirectTo: '/login'
        });
        window.location.href = '/login';
        return;
      }

      // User is authenticated - allow access
      logWithTimestamp('✅ User authenticated, allowing access', {
        currentPath: currentPath
      });
    } catch (error) {
      logWithTimestamp('❌ Error in checkAuthAndRedirect', {
        error: error.message,
        stack: error.stack,
        url: window.location.href
      });
      
      // Fail closed - redirect to login if error occurs (unless debug mode)
      if (!debugMode) {
        logWithTimestamp('Redirecting to login due to error');
        window.location.href = '/login';
      } else {
        logWithTimestamp('🔍 DEBUG MODE: Skipping redirect due to error');
      }
    }
  }

  /**
   * Initialize auth guard
   * Phase 1: Enhanced initialization with error handling
   */
  function init() {
    try {
      logWithTimestamp('Initializing Auth Guard', {
        currentUrl: window.location.href,
        documentReadyState: document.readyState,
        debugMode: debugMode
      });
      
      // Wait for DOM to be ready and ensure localStorage is accessible
      const runCheck = async () => {
        try {
          logWithTimestamp('Running authentication check');
          
          // Test localStorage access
          const testKey = '__auth_guard_test__';
          localStorage.setItem(testKey, 'test');
          localStorage.removeItem(testKey);
          
          logWithTimestamp('localStorage is accessible');
          
          // Now run the actual check (async)
          await checkAuthAndRedirect();
        } catch (error) {
          logWithTimestamp('❌ Error in runCheck', {
            error: error.message,
            stack: error.stack
          });
          
          // If localStorage is not available, allow access (fallback) unless debug mode
          if (debugMode) {
            logWithTimestamp('🔍 DEBUG MODE: localStorage error, but continuing');
          } else {
            logWithTimestamp('localStorage not available, allowing access as fallback');
          }
        }
      };
      
      // Determine delay based on debug mode
      const delay = debugMode ? 100 : 500; // Shorter delay in debug mode, normal delay otherwise
      
      if (document.readyState === 'loading') {
        logWithTimestamp('Waiting for DOMContentLoaded');
        document.addEventListener('DOMContentLoaded', function() {
          logWithTimestamp('DOMContentLoaded fired');
          setTimeout(runCheck, delay);
        });
      } else {
        logWithTimestamp('DOM already ready, running check');
        setTimeout(runCheck, delay);
      }
    } catch (error) {
      logWithTimestamp('❌ Critical error in init', {
        error: error.message,
        stack: error.stack
      });
      
      // Fail closed - redirect to login if critical error (unless debug mode)
      if (!debugMode) {
        window.location.href = '/login';
      }
    }
  }

  // Export for manual checks
  window.AuthGuard = {
    check: checkAuthAndRedirect,
    isAuthenticated: isAuthenticated,
    debugMode: debugMode,
    logWithTimestamp: logWithTimestamp,
    loadRoutesConfig: loadRoutesConfig,
    isPublicRoute: isPublicRoute,
    _initialized: true
  };
  
  // Auto-initialize
  init();
})();
