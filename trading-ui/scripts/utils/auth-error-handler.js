/**
 * Authentication Error Handler
 * =============================
 * Centralized handler for 401/308 authentication errors
 * Used by all data services to handle authentication failures consistently
 */


// ===== FUNCTION INDEX =====

// === Event Handlers ===
// - handleAuthenticationError() - Handleauthenticationerror
// - checkAndHandleAuthError() - Checkandhandleautherror

(function authErrorHandler() {
  'use strict';

  /**
   * Handle authentication error (401/308)
   * Clears local storage, shows notification, and redirects to login
   * @param {string} url - The URL that failed (for logging)
   * @returns {void}
   */
  async function handleAuthenticationError(url) {
    // Clear any stale auth data using UnifiedCacheManager
    if (window.UnifiedCacheManager) {
      try {
        await window.UnifiedCacheManager.remove('currentUser');
        await window.UnifiedCacheManager.remove('authToken');
      } catch (e) {
        console.warn('Error clearing auth cache:', e);
        // Fallback to sessionStorage bootstrap keys (Option 1 - no localStorage)
        sessionStorage.removeItem('currentUser');
        sessionStorage.removeItem('authToken');
      }
    } else {
      // Fallback to sessionStorage bootstrap keys if UnifiedCacheManager not available (Option 1)
      sessionStorage.removeItem('currentUser');
      sessionStorage.removeItem('authToken');
    }
    
    // Show error notification
    if (window.NotificationSystem) {
      window.NotificationSystem.showError(
        'נדרשת התחברות',
        'עליך להתחבר למערכת כדי לצפות בנתונים. אנא התחבר כדי להמשיך.',
        'system'
      );
    }
    
    // Redirect to login page only (login modal removed)
    window.location.href = '/login.html';
  }

  /**
   * Check if response is an authentication error and handle it
   * @param {Response} response - Fetch response object
   * @param {string} url - The URL that was called (for logging)
   * @returns {Promise<boolean>} - true if authentication error was handled
   */
  async function checkAndHandleAuthError(response, url) {
    if (response.status === 401 || response.status === 308) {
      await handleAuthenticationError(url);
      return true;
    }
    return false;
  }

  // Export to window
  window.handleAuthenticationError = handleAuthenticationError;
  window.checkAndHandleAuthError = checkAndHandleAuthError;

  if (window.Logger) {
    window.Logger.debug('✅ Authentication error handler loaded', { page: 'auth-error-handler' });
  }
})();
