(function () {
  'use strict';

  /**
   * API Fetch Wrapper
   * Global wrapper for window.fetch:
   * - Injects Authorization: Bearer <token> from UnifiedCacheManager (includeUserId: false)
   * - Skips auth for static assets and public endpoints
   * - Handles 401 by forcing logout and redirecting to login page
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
    // region agent log - Option 1 verification
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        location: 'trading-ui/scripts/api-fetch-wrapper.js:getAuthToken',
        message: 'Option 1: Getting auth token from SessionStorageLayer only',
        data: {
          hasUnifiedCacheManager: !!window.UnifiedCacheManager,
          isInitialized: window.UnifiedCacheManager?.initialized,
          timestamp: Date.now()
        },
        sessionId: 'option1_verification',
        runId: 'option1_implementation_test',
        hypothesisId: 'option1_sessionstorage_only'
      })
    }).catch(() => {});
    // endregion

    try {
      // Try SessionStorageLayer through UnifiedCacheManager first (preferred method)
      if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
        const token = await window.UnifiedCacheManager.get('authToken', {
          layer: 'sessionStorage',
          includeUserId: false
        });
        if (token) return token;
      }

      // Fallback: Try direct sessionStorage access
      if (typeof sessionStorage !== 'undefined') {
        const token = sessionStorage.getItem('authToken');
        if (token) return token;
      }

      // Option 1: No localStorage fallback for auth tokens

      // Fallback: direct sessionStorage (bootstrap mode - before UnifiedCacheManager initializes)
      if (typeof sessionStorage !== 'undefined') {
        const fallback = sessionStorage.getItem('authToken');
        if (fallback) return fallback;
      }
      
      // Additional fallbacks for compatibility
      if (window.authToken) {
        return window.authToken;
      }
      // Option 1: No localStorage fallback
      
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

    const path = window.location?.pathname || '';
    const isLoginPage = path === '/login' || path === '/login.html';

    // region agent log - 401 redirect verification
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        location: 'trading-ui/scripts/api-fetch-wrapper.js:handle401Error',
        message: '401 error handling - checking redirect behavior',
        data: {
          url: url,
          port: window.location.port,
          hostname: window.location.hostname,
          pathname: path,
          isLoginPage: isLoginPage,
          willRedirect: !isLoginPage,
          timestamp: Date.now()
        },
        sessionId: 'auth_flow_verification_8080',
        runId: 'auth_redirect_verification',
        hypothesisId: 'api_401_redirect_proper'
      })
    }).catch(() => {});
    // endregion

    if (!isLoginPage) {
      // region agent log - api-fetch-wrapper 401 redirect
      fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/api-fetch-wrapper.js:401_redirect',message:'API fetch wrapper redirecting to login on 401',data:{page:window.location.pathname,url:url,status:response.status,hasAuthToken:!!window.authToken,hasCurrentUser:!!window.currentUser,sessionToken:sessionStorage.getItem('authToken')},sessionId:'debug-session',runId:'user_profile_loop_fix_v2',hypothesisId:'H5_api_401_redirect',timestamp:Date.now()})}).catch(()=>{});
      // endregion

      console.log('[API Fetch Wrapper] Redirecting to login on 401');
      window.location.href = '/login.html';
    }
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
