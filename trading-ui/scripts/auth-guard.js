/**
 * Authentication Guard - Simple authentication check
 * מערכת הגנת נתיבים - בדיקת אימות פשוטה
 *
 * Simple logic: Check if user is authenticated -> Yes: Continue, No: Redirect to login page
 * לוגיקה פשוטה: בדוק אם משתמש מחובר -> כן: המשך, לא: הפניה לעמוד כניסה
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
// - showLoginModal() - Redirecttologinpage

// === Other ===
// - waitForAuthJS() - Waitforauthjs

// Public pages that don't require authentication
const PUBLIC_PAGES = [
  'login.html',
  'register.html',
  'reset_password.html',
  'forgot_password.html'
];

/**
 * Helper function to send debug log only if not on public page
 * Prevents CORS errors on login.html and other public pages
 */
// Debug logging function removed to avoid CORS errors

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
 * Redirect to login page only (login modal removed)
 */
async function showLoginModal() {
  window.Logger?.info?.('🔐 [Auth Guard] Redirecting to login page', { page: 'auth-guard' });

  // REMOVE MODAL FLOW: Always redirect to login page
  window.location.href = '/login.html';
}

/**
 * Initialize authentication guard
 * Checks authentication on page load
 */
async function initAuthGuard() {

  // region agent log - initAuthGuard called
  fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/auth-guard.js:initAuthGuard:entry',message:'initAuthGuard called',data:{page:window.location.pathname,isPublicPage:isPublicPage(),hasAuthToken:!!window.authToken,hasCurrentUser:!!window.currentUser,sessionToken:sessionStorage.getItem('authToken')},sessionId:'debug-session',runId:'user_profile_loop_fix_v2',hypothesisId:'H4_auth_guard_running',timestamp:Date.now()})}).catch(()=>{});
  // endregion

  // Check if this is a public page - skip authentication check
  const isPublic = isPublicPage();
  if (isPublic) {
    window.Logger?.info?.('✅ [Auth Guard] Public page detected, skipping auth check', {
      page: 'auth-guard',
      path: window.location.pathname
    });
    return; // No need to check authentication for public pages
  }
  
  // Check for recent login to prevent redirect loop
  const recentLogin = sessionStorage.getItem('recent_login_timestamp');
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

  // Special handling for user_management page - add extra delay
  if (window.location.pathname.includes('user_management')) {
    window.Logger?.info?.('⏳ [Auth Guard] User management page detected, adding extra delay', {
      page: 'auth-guard',
      path: window.location.pathname
    });
    await new Promise(resolve => setTimeout(resolve, 3000));
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
  for (let i = 0; i < 10; i++) {
    const hasUC = window.UnifiedCacheManager?.initialized;
    // Try SessionStorageLayer through UnifiedCacheManager first (preferred method)
    const ucToken = hasUC ? await window.UnifiedCacheManager.get('authToken', { 
      layer: 'sessionStorage', 
      includeUserId: false 
    }).catch((e) => {
      return null;
    }) : null;
    // Fallback: direct sessionStorage (bootstrap mode - before UnifiedCacheManager initializes)
    const ssToken = (typeof sessionStorage !== 'undefined') ? sessionStorage.getItem('authToken') : null;

    console.log('[auth-guard] Check', i, '- UC initialized:', hasUC, 'UC token:', !!ucToken, 'SS token:', !!ssToken);

    if (ucToken || ssToken) {
      tokenReady = true;
      console.log('[auth-guard] Token found! UC:', !!ucToken, 'SS:', !!ssToken);
      break;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  let result = { authenticated: false, user: null, error: 'unknown' };
  try {
    const r = await checkAuthentication();
    if (r) result = r;
  } catch (e) {
    window.Logger?.error?.('❌ [Auth Guard] checkAuthentication threw', { error: e?.message });
  }

  if (result.authenticated) {
    // User is authenticated - page can load normally
    return;
  } else {
    // User is not authenticated - redirect to login page

    // Save current URL for redirect after login (only if not already on login page)
    if (!window.location.pathname.includes('login.html')) {
      sessionStorage.setItem('login_redirect_url', window.location.href);
    }

    // REMOVE TEST MODE: Always redirect to login page
    window.Logger?.info?.('🔐 [Auth Guard] Authentication required, redirecting to login page', {
      page: 'auth-guard',
      currentPath: window.location.pathname
    });

    window.location.href = '/login.html';
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

// ===== AUTO-EXECUTION DISABLED =====
// DISABLED: Auto-execution removed to prevent conflict with page-initialization-configs.js
// The auth guard logic is now handled by ensureAuthenticatedForPage() in page-initialization-configs.js
// This file is kept for backward compatibility and manual initialization if needed
//
// if (document.readyState === 'loading') {
//   document.addEventListener('DOMContentLoaded', waitForAuthJS);
// } else {
//   // DOM already ready, start immediately
//   waitForAuthJS();
// }

// Export functions globally (for manual initialization if needed)
window.AuthGuard = {
  init: initAuthGuard,
  checkAuth: checkAuthentication,
  showLoginModal
};
