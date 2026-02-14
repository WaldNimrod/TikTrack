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
      maskedLogWithTimestamp(`Auth Guard: ${message}`);
    }
    
    return logEntry;
  }

  // ============================================
  // Phase 1.1: Debug Mode (AFTER logWithTimestamp)
  // ============================================
  const urlParams = new URLSearchParams(window.location.search);
  const debugMode = urlParams.get('debug') === 'true' || localStorage.getItem('auth_guard_debug') === 'true';
  
  if (debugMode) {
    maskedLog('🔍 Auth Guard: DEBUG MODE ENABLED - No redirects will occur');
    maskedLog('🔍 Auth Guard: Add ?debug=true to URL or set localStorage.auth_guard_debug=true');
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
   * Determine page type (A/B/C/D) based on route
   * Stage 1: Auth Guard distinguishes A/B/C/D per ADR-013
   * 
   * @param {string} path - Current pathname
   * @returns {string} Page type: 'A', 'B', 'C', or 'D'
   */
  function getPageType(path) {
    // Type A (Open): login, register, reset-password - No Header
    const typeARoutes = ['/login', '/register', '/reset-password'];
    if (typeARoutes.includes(path)) {
      return 'A';
    }
    
    // Type B (Shared): Home - Two containers (Guest + Logged-in), no redirect
    if (path === '/' || path === '/index.html' || path === '/index') {
      return 'B';
    }
    
    // Type D (Admin-only): /admin/* + כל עמודי תפריט ניהול — SSOT: routes.json management, unified-header ניהול
    if (path.startsWith('/admin/')) {
      return 'D';
    }
    const managementPaths = [
      '/system_management.html', '/system_management',
      '/tickers.html', '/tickers'
    ];
    if (managementPaths.includes(path)) {
      return 'D';
    }
    
    // Type C (Auth-only): All other pages - Require auth, redirect to Home if not authenticated
    return 'C';
  }

  /**
   * Check if user has admin role from JWT token
   * Stage 1: Admin-only (D) - JWT role check
   * 
   * @returns {boolean} True if user has ADMIN or SUPERADMIN role
   */
  function isAdmin() {
    try {
      const token = localStorage.getItem('access_token') || 
                    localStorage.getItem('authToken') ||
                    sessionStorage.getItem('access_token') ||
                    sessionStorage.getItem('authToken');
      
      if (!token) {
        return false;
      }
      
      // Decode JWT token (simple base64 decode - no verification needed for role check)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const role = payload.role;
        return role === 'ADMIN' || role === 'SUPERADMIN';
      } catch (e) {
        logWithTimestamp('Error decoding JWT token', { error: e.message });
        return false;
      }
    } catch (error) {
      logWithTimestamp('Error checking admin role', { error: error.message });
      return false;
    }
  }

  /**
   * Check authentication and redirect if needed
   * Stage 1: Enhanced to distinguish A/B/C/D page types per ADR-013
   * Updated: Uses routes.json for public routes + page type detection
   */
  async function checkAuthAndRedirect() {
    try {
      const currentPath = window.location.pathname;
      const fullUrl = window.location.href;
      const pageType = getPageType(currentPath);
      
      logWithTimestamp('Checking page access', {
        currentPath: currentPath,
        pageType: pageType,
        fullUrl: fullUrl,
        debugMode: debugMode
      });
      
      // Type A (Open): Always allow access - no auth check needed
      if (pageType === 'A') {
        logWithTimestamp('Type A (Open) page detected, allowing access', {
          currentPath: currentPath
        });
        return; // Allow access - Header will be hidden by headerLoader.js
      }
      
      // Type B (Shared): Home - Allow access to all, render based on auth state
      if (pageType === 'B') {
        logWithTimestamp('Type B (Shared) page detected, allowing access', {
          currentPath: currentPath,
          note: 'No redirect - guest sees Guest Container, authenticated sees Logged-in Container'
        });
        return; // Allow access - HomePage.jsx handles container rendering
      }
      
      // Type D (Admin-only): Check JWT role
      if (pageType === 'D') {
        const authenticated = isAuthenticated();
        const admin = isAdmin();
        
        logWithTimestamp('Type D (Admin-only) page detected', {
          currentPath: currentPath,
          authenticated: authenticated,
          isAdmin: admin
        });
        
        if (!authenticated || !admin) {
          logWithTimestamp('User not authorized for admin page', {
            currentPath: currentPath,
            willRedirect: !debugMode,
            debugMode: debugMode
          });
          
          if (debugMode) {
            logWithTimestamp('🔍 DEBUG MODE: Skipping redirect for admin page');
            return;
          }
          
          // Redirect to Home (not 403 for now - can be changed per requirements)
          logWithTimestamp('Redirecting to Home (Type D: Admin-only)', {
            currentPath: currentPath,
            redirectTo: '/'
          });
          window.location.href = '/';
          return;
        }
        
        // User is authenticated and is admin - allow access
        logWithTimestamp('✅ Admin user authenticated, allowing access', {
          currentPath: currentPath
        });
        return;
      }
      
      // Type C (Auth-only): Require authentication, redirect to Home if not authenticated
      const authenticated = isAuthenticated();
      logWithTimestamp('Type C (Auth-only) page detected', {
        authenticated: authenticated,
        currentPath: currentPath,
        debugMode: debugMode
      });
      
      if (!authenticated) {
        logWithTimestamp('User not authenticated for Type C page', {
          currentPath: currentPath,
          willRedirect: !debugMode,
          debugMode: debugMode
        });
        
        // Skip redirect in debug mode
        if (debugMode) {
          logWithTimestamp('🔍 DEBUG MODE: Skipping redirect to Home');
          return;
        }
        
        // Redirect to Home (Type C: Auth-only → Home, not /login per ADR-013)
        logWithTimestamp('Redirecting to Home (Type C: Auth-only)', {
          currentPath: currentPath,
          redirectTo: '/'
        });
        window.location.href = '/';
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
      
      // Fail closed - redirect to Home if error occurs (unless debug mode)
      // Type C behavior: redirect to Home (not /login per ADR-013)
      if (!debugMode) {
        logWithTimestamp('Redirecting to Home due to error');
        window.location.href = '/';
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
      
      // Gate A Fix: Run auth check immediately (no delay) so redirect happens BEFORE
      // scripts at bottom of page (tableInit, filtersIntegration) make API calls.
      // Previous 500ms delay allowed 401 errors - scripts ran before redirect.
      const delay = debugMode ? 100 : 0;
      
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
      
      // Fail closed - redirect to Home if critical error (unless debug mode)
      // Type C: Auth-only → Home (not /login per ADR-013)
      if (!debugMode) {
        window.location.href = '/';
      }
    }
  }

  // Export for manual checks
  window.AuthGuard = {
    check: checkAuthAndRedirect,
    isAuthenticated: isAuthenticated,
    isAdmin: isAdmin,
    getPageType: getPageType,
    debugMode: debugMode,
    logWithTimestamp: logWithTimestamp,
    loadRoutesConfig: loadRoutesConfig,
    isPublicRoute: isPublicRoute,
    _initialized: true
  };
  
  // Auto-initialize
  init();
})();
