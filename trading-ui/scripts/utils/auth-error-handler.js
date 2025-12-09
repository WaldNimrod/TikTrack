/**
 * Authentication Error Handler
 * =============================
 * Centralized handler for 401/308 authentication errors
 * Used by all data services to handle authentication failures consistently
 */

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
        // Fallback to localStorage
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
      }
    } else {
      // Fallback to localStorage if UnifiedCacheManager not available
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    }
    
    // Show error notification
    if (window.NotificationSystem) {
      window.NotificationSystem.showError(
        'נדרשת התחברות',
        'עליך להתחבר למערכת כדי לצפות בנתונים. אנא התחבר כדי להמשיך.',
        'system'
      );
    }
    
    // Try to show login modal
    if (typeof window.TikTrackAuth?.showLoginModal === 'function') {
      window.TikTrackAuth.showLoginModal(() => {
        // On successful login, reload the page
        window.location.reload();
      });
    } else if (typeof window.AuthGuard?.redirectToLogin === 'function') {
      window.AuthGuard.redirectToLogin();
    } else {
      // Fallback: redirect to login page
      const currentPath = window.location.pathname;
      const loginPath = currentPath.includes('trading-ui') 
        ? 'trading-ui/login.html' 
        : 'login.html';
      window.location.href = loginPath;
    }
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
