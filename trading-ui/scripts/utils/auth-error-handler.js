/**
 * Authentication Error Handler - Centralized 401/308 error handling
 * טיפול מרכזי בשגיאות authentication
 * 
 * This utility provides a centralized way to handle authentication errors
 * across all services and API calls.
 * 
 * File: trading-ui/scripts/utils/auth-error-handler.js
 * Version: 1.0.0
 * Last Updated: December 2025
 */

/**
 * Handle 401/308 authentication errors - show login interface
 * @function handleAuthenticationError
 * @param {string} [url] - API endpoint that failed (optional, for logging)
 * @returns {void}
 */
function handleAuthenticationError(url) {
  // Clear any stale auth data
  localStorage.removeItem('currentUser');
  localStorage.removeItem('authToken');
  
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
 * Check if response is an authentication error (401 or 308 redirect to login)
 * @function isAuthenticationError
 * @param {Response} response - Fetch response object
 * @returns {boolean} True if authentication error
 */
async function isAuthenticationError(response) {
  if (response.status === 401) {
    return true;
  }
  
  if (response.status === 308) {
    const location = response.headers.get('Location');
    if (location && (location.includes('login') || location.includes('auth'))) {
      return true;
    }
  }
  
  return false;
}

/**
 * Wrapper for fetch that handles authentication errors automatically
 * @function fetchWithAuth
 * @param {string} url - API endpoint
 * @param {Object} [options] - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
async function fetchWithAuth(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Always include cookies for session-based auth
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    }
  });
  
  // Check for authentication errors
  if (await isAuthenticationError(response)) {
    handleAuthenticationError(url);
    throw new Error('Authentication required');
  }
  
  return response;
}

// Export functions globally
window.AuthErrorHandler = {
  handle: handleAuthenticationError,
  isError: isAuthenticationError,
  fetch: fetchWithAuth
};

// Also export as individual functions for convenience
window.handleAuthenticationError = handleAuthenticationError;
window.isAuthenticationError = isAuthenticationError;
window.fetchWithAuth = fetchWithAuth;

