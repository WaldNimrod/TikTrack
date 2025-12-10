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

/**
 * Check authentication status with server
 * @returns {Promise<{authenticated: boolean, user: object|null, error: string|null}>}
 */
async function checkAuthentication() {
  window.Logger?.info?.('🔐 [Auth Guard] Starting authentication check', { page: 'auth-guard' });
  
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET', });
    
    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success' && data.data?.user) {
        const user = data.data.user;
        // Keep in-memory user for quick checks (isAuthenticated)
        try {
          // Prefer the shared variable from auth.js if present
          if (typeof currentUser !== 'undefined') {
            currentUser = user;
          }
          window.currentUser = user;
        } catch (e) {
          window.Logger?.warn?.('⚠️ [Auth Guard] Failed setting currentUser', { page: 'auth-guard', error: e?.message });
        }
        window.Logger?.info?.('✅ [Auth Guard] User authenticated', { 
          page: 'auth-guard', 
          userId: user.id, 
          username: user.username 
        });
        
        // Save to cache - ONLY UnifiedCacheManager, no fallbacks
        // Use helper function to ensure consistent key handling
        if (window.TikTrackAuth?.saveAuthToCache) {
          await window.TikTrackAuth.saveAuthToCache(user, 'session_based');
        } else if (window.UnifiedCacheManager) {
          await window.UnifiedCacheManager.save('currentUser', user, { includeUserId: false });
          await window.UnifiedCacheManager.save('authToken', 'session_based', { includeUserId: false });
        } else {
          window.Logger?.error?.('❌ [Auth Guard] UnifiedCacheManager not available', { page: 'auth-guard' });
        }
        
        return { authenticated: true, user, error: null };
      } else {
        window.Logger?.warn?.('⚠️ [Auth Guard] Invalid response format', { page: 'auth-guard', data });
        return { authenticated: false, user: null, error: 'Invalid response format' };
      }
    } else if (response.status === 401) {
      window.Logger?.info?.('❌ [Auth Guard] User not authenticated (401)', { page: 'auth-guard' });
      
      // Clear all auth data and prompt login
      if (window.TikTrackAuth?.forceLogoutAndPrompt) {
        await window.TikTrackAuth.forceLogoutAndPrompt('auth_guard_401');
      } else if (window.TikTrackAuth?.removeAuthFromCache) {
        await window.TikTrackAuth.removeAuthFromCache();
      } else if (window.UnifiedCacheManager) {
        await window.UnifiedCacheManager.remove('currentUser', { includeUserId: false });
        await window.UnifiedCacheManager.remove('authToken', { includeUserId: false });
      } else {
        window.Logger?.error?.('❌ [Auth Guard] UnifiedCacheManager not available', { page: 'auth-guard' });
      }
      
      return { authenticated: false, user: null, error: 'Not authenticated' };
    } else {
      window.Logger?.error?.('❌ [Auth Guard] Server error', { 
        page: 'auth-guard', 
        status: response.status 
      });
      return { authenticated: false, user: null, error: `Server error: ${response.status}` };
    }
  } catch (error) {
    window.Logger?.error?.('❌ [Auth Guard] Network error', { 
      page: 'auth-guard', 
      error: error.message 
    });
    return { authenticated: false, user: null, error: `Network error: ${error.message}` };
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
  window.Logger?.info?.('🚀 [Auth Guard] Initializing', { page: 'auth-guard' });
  
  // Small delay to allow session cookie to be set after page reload
  // This prevents race condition where we check auth before session is ready
  // Increased delay to 500ms to give session more time to stabilize
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const result = await checkAuthentication();
  
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
    // User is not authenticated - show login modal
    await showLoginModal();
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
