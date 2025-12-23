/**
 * Authentication Guard - Simple authentication check
 * מערכת הגנת נתיבים - בדיקת אימות פשוטה
 *
 * Simple logic: Check if user is authenticated -> Yes: Continue, No: Show login modal
 * לוגיקה פשוטה: בדוק אם משתמש מחובר -> כן: המשך, לא: הצג מודול כניסה
 *
 * File: trading-ui/scripts/auth-guard.js
 * Version: 2.0 - Simplified
 * Last Updated: December 2025
 */



// ===== FUNCTION INDEX =====

// === Initialization ===
// - initAuthGuard() - Initauthguard

// === Event Handlers ===
// - checkAuthentication() - Checkauthentication

// === UI Functions ===
// - showLoginModal() - Showloginmodal

// === Other ===
// - waitForAuthJS() - Waitforauthjs

// Public pages that don't require authentication
const PUBLIC_PAGES = [
  'login.html',
  'register.html',
  'reset-password.html',
  'forgot-password.html'
];

/**
 * Helper function to send debug log only if not on public page
 * Prevents CORS errors on login.html and other public pages
 */
function sendDebugLog(location, message, data, hypothesisId) {
  if (isPublicPage()) {
    return; // Don't send logs on public pages to avoid CORS errors
  }
  fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      location,
      message,
      data,
      timestamp:Date.now(),
      sessionId:'debug-session',
      runId:'run2',
      hypothesisId
    })
  }).catch(()=>{});
}

/**
 * Check if current page is a public page (doesn't require authentication)
 * @returns {boolean}
 */
function isPublicPage() {
  const path = window.location.pathname;
  return PUBLIC_PAGES.some(page => path.includes(page));
}

/**
 * Check authentication status with server
 * @returns {Promise<{authenticated: boolean, user: object|null, error: string|null}>}
 */
async function checkAuthentication() {
  window.Logger?.info?.('🔐 [Auth Guard] Starting authentication check', { page: 'auth-guard' });

  // DO NOT set window._checkingAuth here - it's managed by auth.js to prevent concurrent calls
  // Setting it here would interfere with the race condition prevention mechanism in auth.js

  if (!window.TikTrackAuth || typeof window.TikTrackAuth.checkAuthentication !== 'function') {
    window.Logger?.error?.('❌ [Auth Guard] TikTrackAuth not available', { page: 'auth-guard' });
    return { authenticated: false, user: null, error: 'Auth system not ready' };
  }

  try {
    const result = await window.TikTrackAuth.checkAuthentication();
    if (result?.authenticated) {
      window.Logger?.info?.('✅ [Auth Guard] User authenticated', { 
        page: 'auth-guard', 
        userId: result.user?.id, 
        username: result.user?.username 
      });
    } else {
      window.Logger?.info?.('❌ [Auth Guard] User not authenticated', { 
        page: 'auth-guard', 
        error: result?.error 
      });
    }
    return result;
  } catch (error) {
    window.Logger?.error?.('❌ [Auth Guard] Authentication check failed', {
      page: 'auth-guard',
      error: error.message
    });
    return { authenticated: false, user: null, error: error.message };
  }
}

/**
 * Show login modal
 */
async function showLoginModal() {
  window.Logger?.info?.('🔐 [Auth Guard] Showing login modal', { page: 'auth-guard' });
  
  // ✅ לוג אימות - בדיקת זמינות
  window.Logger?.info?.('🔍 [Auth Guard] showLoginModal - checking availability', {
    page: 'auth-guard',
    tikTrackAuthExists: typeof window.TikTrackAuth !== 'undefined',
    showLoginModalExists: typeof window.TikTrackAuth?.showLoginModal === 'function',
    timestamp: new Date().toISOString()
  });
  
  // Wait for auth.js to load if not available yet
  if (typeof window.TikTrackAuth?.showLoginModal !== 'function') {
    window.Logger?.info?.('⏳ [Auth Guard] Waiting for auth.js to load...', { page: 'auth-guard' });
    
    // Wait up to 5 seconds for auth.js to load
    for (let i = 0; i < 50; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (typeof window.TikTrackAuth?.showLoginModal === 'function') {
        window.Logger?.info?.('✅ [Auth Guard] auth.js loaded', { 
          page: 'auth-guard',
          attempts: i + 1
        });
        break;
      }
    }
  }
  
  if (typeof window.TikTrackAuth?.showLoginModal === 'function') {
    window.Logger?.info?.('✅ [Auth Guard] Calling window.TikTrackAuth.showLoginModal', { page: 'auth-guard' });
    try {
      await window.TikTrackAuth.showLoginModal(() => {
        window.Logger?.info?.('✅ [Auth Guard] Login successful, reloading page', { page: 'auth-guard' });
        window.location.reload();
      });
      window.Logger?.info?.('✅ [Auth Guard] showLoginModal completed successfully', { page: 'auth-guard' });
    } catch (error) {
      window.Logger?.error?.('❌ [Auth Guard] Error calling showLoginModal', {
        page: 'auth-guard',
        error: error.message,
        stack: error.stack
      });
    }
  } else {
    window.Logger?.error?.('❌ [Auth Guard] Login modal function not available after waiting', {
      page: 'auth-guard',
      tikTrackAuthExists: typeof window.TikTrackAuth !== 'undefined',
      tikTrackAuthType: typeof window.TikTrackAuth,
      showLoginModalExists: typeof window.TikTrackAuth?.showLoginModal === 'function'
    });
  }
}

/**
 * Initialize authentication guard
 * Checks authentication on page load
 */
async function initAuthGuard() {
  // #region agent log
  sendDebugLog('auth-guard.js:148', 'initAuthGuard ENTRY', {
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    readyState: document.readyState
  }, 'C');
  // #endregion
  window.Logger?.info?.('🚀 [Auth Guard] Initializing', { page: 'auth-guard' });
  
  // Check if this is a public page - skip authentication check
  const isPublic = isPublicPage();
  // #region agent log
  sendDebugLog('auth-guard.js:155', 'isPublicPage check', {
    pathname: window.location.pathname,
    isPublic,
    publicPages: PUBLIC_PAGES
  }, 'C');
  // #endregion
  if (isPublic) {
    window.Logger?.info?.('✅ [Auth Guard] Public page detected, skipping auth check', { 
      page: 'auth-guard',
      path: window.location.pathname 
    });
    // #region agent log
    sendDebugLog('auth-guard.js:163', 'Returning early - public page', {
      pathname: window.location.pathname
    }, 'C');
    // #endregion
    return; // No need to check authentication for public pages
  }
  
  // Check for recent login to prevent redirect loop
  const recentLogin = sessionStorage.getItem('recent_login_timestamp');
  // #region agent log
  sendDebugLog('auth-guard.js:162', 'recent_login_timestamp check', {
    recentLogin,
    timeSinceLogin: recentLogin ? Date.now() - parseInt(recentLogin) : null,
    hasRecentLogin: !!recentLogin
  }, 'D');
  // #endregion
  if (recentLogin) {
    const timeSinceLogin = Date.now() - parseInt(recentLogin);
    if (timeSinceLogin < 5000) {
      window.Logger?.info?.('⏳ [Auth Guard] Recent login detected, waiting before check', {
        page: 'auth-guard',
        timeSinceLogin
      });
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Clear timestamp after waiting to prevent future loops
      sessionStorage.removeItem('recent_login_timestamp');
    }
  }
  
  // Increased delay to allow session cookie to be set after page reload
  // This prevents race condition where we check auth before session is ready
  // Increased delay to 1000ms to give session more time to stabilize
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Wait for UnifiedCacheManager to be initialized first
  if (window.UnifiedCacheManager && !window.UnifiedCacheManager.initialized) {
    window.Logger?.info?.('⏳ [Auth Guard] Waiting for UnifiedCacheManager initialization', { page: 'auth-guard' });
    let attempts = 0;
    while (!window.UnifiedCacheManager.initialized && attempts < 50) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    if (window.UnifiedCacheManager.initialized) {
      window.Logger?.info?.('✅ [Auth Guard] UnifiedCacheManager initialized', { page: 'auth-guard' });
    } else {
      window.Logger?.warn?.('⚠️ [Auth Guard] UnifiedCacheManager not initialized after waiting', { page: 'auth-guard' });
    }
  }

  // Wait briefly for token to be available (SessionStorageLayer or bootstrap fallback) before first check
  let tokenReady = false;
  // #region agent log
  sendDebugLog('auth-guard.js:201', 'Starting token availability check loop', {
    hasUnifiedCache: !!window.UnifiedCacheManager,
    ucInitialized: window.UnifiedCacheManager?.initialized
  }, 'B');
  // #endregion
  for (let i = 0; i < 10; i++) {
    const hasUC = window.UnifiedCacheManager?.initialized;
    // Try SessionStorageLayer through UnifiedCacheManager first (preferred method)
    const ucToken = hasUC ? await window.UnifiedCacheManager.get('authToken', { 
      layer: 'sessionStorage', 
      includeUserId: false 
    }).catch((e) => {
      // #region agent log
      sendDebugLog('auth-guard.js:207', 'UnifiedCacheManager.get authToken ERROR', {
        error: e?.message,
        attempt: i
      }, 'B');
      // #endregion
      return null;
    }) : null;
    // Fallback: direct sessionStorage (bootstrap mode - before UnifiedCacheManager initializes)
    const ssToken = (typeof sessionStorage !== 'undefined') ? sessionStorage.getItem('dev_authToken') : null;

    console.log('[auth-guard] Check', i, '- UC initialized:', hasUC, 'UC token:', !!ucToken, 'SS token:', !!ssToken);
    // #region agent log
    sendDebugLog('auth-guard.js:213', 'Token check iteration', {
      attempt: i,
      hasUC,
      hasUCToken: !!ucToken,
      hasSSToken: !!ssToken
    }, 'B');
    // #endregion

    if (ucToken || ssToken) {
      tokenReady = true;
      console.log('[auth-guard] Token found! UC:', !!ucToken, 'SS:', !!ssToken);
      // #region agent log
      sendDebugLog('auth-guard.js:218', 'Token found in auth-guard', {
        hasUCToken: !!ucToken,
        hasSSToken: !!ssToken,
        attempt: i,
        hasUC: hasUC
      }, 'B');
      // #endregion
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  // #region agent log
  sendDebugLog('auth-guard.js:223', 'Token availability check loop finished', {
    tokenReady
  }, 'B');
  // #endregion
  
  let result = { authenticated: false, user: null, error: 'unknown' };
  // #region agent log
  sendDebugLog('auth-guard.js:247', 'BEFORE checkAuthentication call', {
    hasTikTrackAuth: typeof window.TikTrackAuth !== 'undefined',
    hasCheckAuth: typeof window.TikTrackAuth?.checkAuthentication === 'function',
    hasSessionStorage: typeof sessionStorage !== 'undefined',
    sessionToken: typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('dev_authToken') : null,
    pathname: window.location.pathname
  }, 'A');
  // #endregion
  try {
    window.Logger?.info?.('🔍 [Auth Guard] Calling checkAuthentication', { page: 'auth-guard' });
    const r = await checkAuthentication();
    // #region agent log
    sendDebugLog('auth-guard.js:253', 'AFTER checkAuthentication call', {
      authenticated: r?.authenticated,
      hasUser: !!r?.user,
      error: r?.error,
      userId: r?.user?.id,
      pathname: window.location.pathname
    }, 'A');
    // #endregion
    window.Logger?.info?.('🔍 [Auth Guard] checkAuthentication result', {
      authenticated: r?.authenticated,
      hasUser: !!r?.user,
      error: r?.error,
      page: 'auth-guard'
    });
    if (r) result = r;
  } catch (e) {
    window.Logger?.error?.('❌ [Auth Guard] checkAuthentication threw', { error: e?.message });
  }
  
  if (result.authenticated) {
    window.Logger?.info?.('✅ [Auth Guard] User authenticated, page access granted', { 
      page: 'auth-guard',
      userId: result.user?.id 
    });
    // User is authenticated - page can load normally
    return;
  } else {
    window.Logger?.warn?.('❌ [Auth Guard] User not authenticated, showing login modal', { 
      page: 'auth-guard',
      error: result.error 
    });
      // #region agent log
      sendDebugLog('auth-guard.js:252', 'User NOT authenticated - preparing redirect', {
        authenticated: result.authenticated,
        error: result.error,
        pathname: window.location.pathname,
        isLoginPage: window.location.pathname.includes('login.html')
      }, 'A');
      // #endregion
      // User is not authenticated - redirect to login page
      window.Logger?.info?.('🔄 [Auth Guard] Redirecting to login page', {
        page: 'auth-guard',
        currentUrl: window.location.href
      });

      // Save current URL for redirect after login (only if not already on login page)
      if (!window.location.pathname.includes('login.html')) {
        sessionStorage.setItem('login_redirect_url', window.location.href);
      }

      // Redirect to login page (only if not already on login page)
      if (!window.location.pathname.includes('login.html')) {
        // #region agent log
        sendDebugLog('auth-guard.js:294', 'BEFORE window.location.href redirect to login.html', {
          targetUrl: '/login.html',
          currentPath: window.location.pathname,
          page: 'auth-guard',
          authenticated: result.authenticated,
          error: result.error
        }, 'E');
        // #endregion
        // Redirect to login page immediately (no confirm dialog)
        window.location.href = '/login.html';
    } else {
      window.Logger?.warn?.('⚠️ [Auth Guard] Already on login page, preventing redirect loop', {
        page: 'auth-guard'
      });
    }
  }
}

// Initialize when DOM is ready and auth.js is loaded
// We wait for auth.js to be available before running auth-guard
async function waitForAuthJS() {
  // ✅ לוג אימות - תחילת waitForAuthJS
  window.Logger?.info?.('⏳ [Auth Guard] waitForAuthJS started', {
    page: 'auth-guard',
    tikTrackAuthExists: typeof window.TikTrackAuth !== 'undefined',
    showLoginModalExists: typeof window.TikTrackAuth?.showLoginModal === 'function',
    documentReadyState: document.readyState,
    timestamp: new Date().toISOString()
  });
  
  // Wait for auth.js to load (check if window.TikTrackAuth exists)
  if (typeof window.TikTrackAuth === 'undefined') {
    window.Logger?.info?.('⏳ [Auth Guard] Waiting for auth.js to load...', { page: 'auth-guard' });
    
    // Wait up to 3 seconds for auth.js to load
    for (let i = 0; i < 30; i++) {
      await new Promise(resolve => setTimeout(resolve, 100));
      if (typeof window.TikTrackAuth !== 'undefined') {
        window.Logger?.info?.('✅ [Auth Guard] auth.js loaded', { 
          page: 'auth-guard',
          attempts: i + 1,
          hasShowLoginModal: typeof window.TikTrackAuth?.showLoginModal === 'function'
        });
        break;
      }
    }
  } else {
    window.Logger?.info?.('✅ [Auth Guard] auth.js already loaded', {
      page: 'auth-guard',
      hasShowLoginModal: typeof window.TikTrackAuth?.showLoginModal === 'function'
    });
  }
  
  // Now initialize auth guard
  await initAuthGuard();
}

// Start when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', waitForAuthJS);
} else {
  // DOM already ready, start immediately
  waitForAuthJS();
}

// Export functions globally
window.AuthGuard = {
  init: initAuthGuard,
  checkAuth: checkAuthentication,
  showLoginModal
};
