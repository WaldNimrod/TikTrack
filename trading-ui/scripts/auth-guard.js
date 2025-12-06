/**
 * Authentication Guard - Route protection for pages
 * מערכת הגנת נתיבים - בדיקת אימות לפני טעינת עמודים
 *
 * This script checks authentication before allowing access to protected pages.
 * If user is not authenticated, redirects to login page.
 *
 * Dependencies:
 * - auth.js (authentication functions)
 *
 * File: trading-ui/scripts/auth-guard.js
 * Version: 1.0
 * Last Updated: December 2025
 */

// Pages that don't require authentication
const PUBLIC_PAGES = [
  'login.html',
  'register.html',
  'reset-password.html',
  'forgot-password.html'
];

/**
 * Check if current page is public (doesn't require authentication)
 * @returns {boolean} True if page is public
 */
function isPublicPage() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  return PUBLIC_PAGES.some(page => currentPage.includes(page));
}

/**
 * Initialize authentication guard
 * Checks authentication and redirects to login if needed
 */
async function initAuthGuard() {
  // For public pages (login, register, etc.), check if user is already authenticated
  // If authenticated, redirect to dashboard
  if (isPublicPage()) {
    // Check if user is already authenticated (both local and server)
    const isAuth = typeof isAuthenticated === 'function' ? isAuthenticated() : false;
    
    if (isAuth) {
      // Double-check with server to ensure authentication is valid
      try {
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.status === 'success' && data.data?.user) {
            // User is authenticated - redirect to dashboard
            const redirectPath = getRedirectAfterLogin();
            if (redirectPath) {
              window.location.href = redirectPath;
            } else {
              window.location.href = 'index.html';
            }
            return;
          }
        }
      } catch (error) {
        // If server check fails, stay on login page
        console.debug('Auth guard: Server check failed, staying on login page', error);
      }
    }
    
    // Not authenticated - stay on public page
    return;
  }
  
  // Check if auth functions are available
  if (typeof checkAuthentication !== 'function') {
    console.warn('Auth guard: checkAuthentication function not found. Loading auth.js...');
    // Try to load auth.js if not already loaded
    const script = document.createElement('script');
    script.src = 'scripts/auth.js';
    script.onload = () => {
      checkAuthAndRedirect();
    };
    script.onerror = () => {
      console.error('Auth guard: Failed to load auth.js');
    };
    document.head.appendChild(script);
    return;
  }
  
  // Check authentication
  await checkAuthAndRedirect();
}

/**
 * Check authentication and redirect if needed
 */
async function checkAuthAndRedirect() {
  try {
    // Check if user is authenticated
    const isAuth = typeof isAuthenticated === 'function' ? isAuthenticated() : false;
    
    if (!isAuth) {
      // Try to verify with server
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (!response.ok) {
        // Not authenticated - redirect to login
        redirectToLogin();
        return;
      }
      
      const data = await response.json();
      if (data.status !== 'success' || !data.data?.user) {
        // Not authenticated - redirect to login
        redirectToLogin();
        return;
      }
      
      // User is authenticated - update local storage
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('currentUser', JSON.stringify(data.data.user));
        window.localStorage.setItem('authToken', 'session_based');
      }
    }
    
    // User is authenticated - continue
    return true;
  } catch (error) {
    console.warn('Auth guard: Error checking authentication:', error);
    // On error, redirect to login to be safe
    redirectToLogin();
    return false;
  }
}

/**
 * Show login modal instead of redirecting to login page
 * הצגת modal כניסה במקום redirect לעמוד כניסה
 */
async function redirectToLogin() {
  const currentPath = window.location.pathname;
  
  // Store intended destination for redirect after login
  if (currentPath && !currentPath.includes('login.html') && !currentPath.includes('register.html')) {
    sessionStorage.setItem('redirectAfterLogin', currentPath);
  }
  
  // Show login modal instead of redirecting
  if (typeof window.TikTrackAuth?.showLoginModal === 'function') {
    await window.TikTrackAuth.showLoginModal(() => {
      // On successful login, redirect to intended destination or dashboard
      const redirectPath = getRedirectAfterLogin();
      if (redirectPath) {
        window.location.href = redirectPath;
      } else {
        window.location.href = 'index.html';
      }
    });
  } else {
    // Fallback: redirect to login page if modal not available
    const loginPath = currentPath.includes('trading-ui') 
      ? 'trading-ui/login.html' 
      : 'login.html';
    window.location.href = loginPath;
  }
}

/**
 * Get redirect destination after login
 * @returns {string|null} Path to redirect to, or null
 */
function getRedirectAfterLogin() {
  const redirect = sessionStorage.getItem('redirectAfterLogin');
  if (redirect) {
    sessionStorage.removeItem('redirectAfterLogin');
    return redirect;
  }
  return null;
}

// Initialize auth guard when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAuthGuard);
} else {
  // DOM is already ready
  initAuthGuard();
}

// Export functions globally
window.AuthGuard = {
  init: initAuthGuard,
  checkAuth: checkAuthAndRedirect,
  redirectToLogin,
  getRedirectAfterLogin,
  isPublicPage
};

