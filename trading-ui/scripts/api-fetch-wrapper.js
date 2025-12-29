(function () {
  'use strict';

  /**
   * API Fetch Wrapper
   * Global wrapper for window.fetch:
   * - Injects Authorization: Bearer <token> from UnifiedCacheManager (includeUserId: false)
   * - Skips auth for static assets and public endpoints
   * - Handles 401 by forcing logout and redirecting to homepage + login modal
   * - Strips credentials usage (no cookies)
   */

  const originalFetch = window.fetch;

  const PUBLIC_ENDPOINTS = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/health',
    '/api/public'
  ];

  const STATIC_FILE_EXTENSIONS = [
    '.html', '.css', '.js', '.png', '.jpg', '.svg',
    '.woff', '.woff2', '.ttf', '.eot', '.ico', '.json'
  ];

  function isPublicEndpoint(url) {
    try {
      const pathname = new URL(url, window.location.origin).pathname;
      return PUBLIC_ENDPOINTS.some((endpoint) => pathname.startsWith(endpoint));
    } catch (e) {
      return PUBLIC_ENDPOINTS.some((endpoint) => (url || '').includes(endpoint));
    }
  }

  function isStaticFile(url) {
    try {
      const pathname = new URL(url, window.location.origin).pathname;
      return STATIC_FILE_EXTENSIONS.some((ext) => pathname.endsWith(ext));
    } catch (e) {
      return STATIC_FILE_EXTENSIONS.some((ext) => (url || '').endsWith(ext));
    }
  }

  function isInstrumentationEndpoint(url) {
    // Check if URL is for instrumentation/debug logging (port 7243)
    return (url || '').includes('127.0.0.1:7243') || (url || '').includes(':7243/ingest');
  }

  async function getAuthToken() {
    try {
      console.log('[API Fetch Wrapper] getAuthToken called');
      console.log('[API Fetch Wrapper] UnifiedCacheManager exists:', !!window.UnifiedCacheManager);
      console.log('[API Fetch Wrapper] UnifiedCacheManager initialized:', window.UnifiedCacheManager?.initialized);

      // Try SessionStorageLayer through UnifiedCacheManager first (preferred method)
      if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
        console.log('[API Fetch Wrapper] Trying UnifiedCacheManager...');
        const token = await window.UnifiedCacheManager.get('authToken', {
          layer: 'sessionStorage',
          includeUserId: false
        });
        console.log('[API Fetch Wrapper] Token from UnifiedCacheManager:', !!token);
        if (token) return token;
      }

      // Fallback: direct sessionStorage (bootstrap mode - before UnifiedCacheManager initializes)
      if (typeof sessionStorage !== 'undefined') {
        const fallback = sessionStorage.getItem('dev_authToken');
        if (fallback) return fallback;
      }
      
      // Additional fallbacks for compatibility
      if (window.authToken) {
        return window.authToken;
      }
      if (typeof localStorage !== 'undefined') {
        const lsToken = localStorage.getItem('authToken');
        if (lsToken) return lsToken;
      }
      
      return null;
    } catch (error) {
      window.Logger?.warn?.('⚠️ [API Fetch Wrapper] Failed to get auth token', { error: error.message });
      return null;
    }
  }

  async function handle401Error(url) {
    window.Logger?.info?.('🔒 [API Fetch Wrapper] 401 Unauthorized detected', { url, checkingAuth: window._checkingAuth });

    // Don't redirect if we're currently checking authentication
    // This prevents race conditions during page load
    if (window._checkingAuth) {
      window.Logger?.info?.('⏳ [API Fetch Wrapper] Skipping redirect - authentication check in progress', { url });
      return;
    }

    if (window.TikTrackAuth?.forceLogoutAndPrompt) {
      await window.TikTrackAuth.forceLogoutAndPrompt('api_fetch_401');
    } else if (window.UnifiedCacheManager) {
      await window.UnifiedCacheManager.remove('currentUser', { includeUserId: false });
      await window.UnifiedCacheManager.remove('authToken', { includeUserId: false });
    }

    // Save current URL for redirect after login
    sessionStorage.setItem('login_redirect_url', window.location.href);

    // Redirect to login page
    window.location.href = '/login.html';
  }

  window.fetch = async function (url, options = {}) {

    // Skip auth injection for static files, public endpoints, and instrumentation endpoints
    if (isStaticFile(url) || isPublicEndpoint(url) || isInstrumentationEndpoint(url)) {
      return originalFetch(url, options);
    }

    const headers = { ...(options.headers || {}) };

    if (!headers.Authorization && !headers.authorization) {
      const token = await getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const fetchOptions = {
      ...options,
      headers,
      credentials: undefined
    };

    try {
      const response = await originalFetch(url, fetchOptions);

      if (response.status === 401) {
        await handle401Error(url);
      }

      return response;
    } catch (error) {
      window.Logger?.error?.('❌ [API Fetch Wrapper] Fetch error', { url, error: error.message });
      throw error;
    }
  };

  window.APIFetchWrapper = {
    version: '1.0.0',
    isPublicEndpoint,
    isStaticFile,
    getAuthToken,
    handle401Error
  };

  window.Logger?.info?.('✅ [API Fetch Wrapper] Loaded successfully');
})();

