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

  // #region agent log - API wrapper loading
  fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      location: 'api-fetch-wrapper.js:loading',
      message: 'API fetch wrapper loading',
      data: {
        timestamp: Date.now(),
        page: window.location.pathname,
        hasUnifiedCacheManager: typeof window.UnifiedCacheManager !== 'undefined'
      },
      sessionId: 'batch_d_auth_debug',
      hypothesisId: 'H3_auth_headers'
    })
  }).catch(() => {});
  // #endregion

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

  async function handle401Error(url, response) {
    // #region agent log - H4: 401 error detected - this causes redirect to login
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/api-fetch-wrapper.js:handle401Error',message:'401 error detected - will redirect to login',data:{url:url,tokensPresent:{sessionStorage:!!sessionStorage.getItem('authToken'),unifiedCache:!!window.UnifiedCacheManager},page:window.location.pathname,timestamp:Date.now()},sessionId:'debug-session',runId:'homepage_auth_persistence',hypothesisId:'H4_401_redirect'})}).catch(()=>{});
    // #endregion
    // #region agent log - 401 error handling for console noise reduction
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'api-fetch-wrapper.js:handle401Error:console_reduction',
        message: '401 error handled - reducing console noise for expected auth errors',
        data: {
          timestamp: Date.now(),
          page: window.location.pathname,
          url: url,
          isBatchDPage: window.location.pathname.includes('cash_flows') ||
                       window.location.pathname.includes('system_management') ||
                       window.location.pathname.includes('dynamic_colors') ||
                       window.location.pathname.includes('button_color_mapping') ||
                       window.location.pathname.includes('user_management')
        },
        sessionId: 'batch_d_auth_debug',
        hypothesisId: 'H1_expected_errors'
      })
    }).catch(() => {});
    // #endregion

    // Use warning level instead of info for expected auth errors during testing
    window.Logger?.warn?.('🔒 [API Fetch Wrapper] 401 Unauthorized detected', { url, checkingAuth: window._checkingAuth });

    // Don't redirect if we're currently checking authentication
    // This prevents race conditions during page load
    if (window._checkingAuth) {
      window.Logger?.info?.('⏳ [API Fetch Wrapper] Skipping redirect - authentication check in progress', { url });
      return;
    }
    
    // P0 FIX: Don't redirect if we have a token - might be a temporary server issue
    // Only redirect if we truly don't have authentication
    const hasToken = sessionStorage.getItem('authToken') || 
                     window.authToken ||
                     (window.UnifiedCacheManager?.initialized && await window.UnifiedCacheManager.get('authToken', { layer: 'sessionStorage', includeUserId: false }).catch(() => null));
    
    if (hasToken) {
      window.Logger?.warn?.('⚠️ [API Fetch Wrapper] 401 received but token exists - skipping redirect to prevent loop', { url });
      // #region agent log - P0 fix prevent redirect loop
      fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'api-fetch-wrapper.js:p0_prevent_redirect_loop',
          message: 'P0 fix - Preventing redirect loop when token exists',
          data: {
            url: url,
            hasSessionToken: !!sessionStorage.getItem('authToken'),
            hasWindowToken: !!window.authToken,
            timestamp: Date.now()
          },
          sessionId: 'debug-session',
          runId: 'p0_auth_regression',
          hypothesisId: 'H14_prevent_loop'
        })
      }).catch(() => {});
      // #endregion
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
      fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'trading-ui/scripts/api-fetch-wrapper.js:401_redirect',message:'API fetch wrapper redirecting to login on 401',data:{page:window.location.pathname,url:url,status:response?.status,hasAuthToken:!!window.authToken,hasCurrentUser:!!window.currentUser,sessionToken:sessionStorage.getItem('authToken')},sessionId:'debug-session',runId:'user_profile_loop_fix_v2',hypothesisId:'H5_api_401_redirect',timestamp:Date.now()})}).catch(()=>{});
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
      // #region agent log - P0 regression token check
      fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'api-fetch-wrapper.js:p0_token_check',
          message: 'P0 regression - token retrieval check',
          data: {
            url: url,
            hasToken: !!token,
            tokenLength: token?.length,
            hasUCM: !!window.UnifiedCacheManager,
            ucmInitialized: window.UnifiedCacheManager?.initialized,
            hasSessionToken: !!sessionStorage.getItem('authToken'),
            hasWindowToken: !!window.authToken,
            timestamp: Date.now()
          },
          sessionId: 'debug-session',
          runId: 'p0_auth_regression',
          hypothesisId: 'H12_token_retrieval'
        })
      }).catch(() => {});
      // #endregion
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        // #region agent log - auth header added
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'api-fetch-wrapper.js:auth_header_added',
            message: 'Authorization header added to request',
            data: {
              timestamp: Date.now(),
              page: window.location.pathname,
              url: url,
              hasToken: !!token,
              tokenLength: token ? token.length : 0,
              isPublicEndpoint: isPublicEndpoint(url),
              headers: Object.keys(headers)
            },
            sessionId: 'batch_d_auth_debug',
            hypothesisId: 'H3_auth_headers'
          })
        }).catch(() => {});
        // #endregion
      } else {
        // #region agent log - no auth token available
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'api-fetch-wrapper.js:p0_no_token',
            message: 'P0 regression - No auth token available for request',
            data: {
              timestamp: Date.now(),
              page: window.location.pathname,
              url: url,
              isPublicEndpoint: isPublicEndpoint(url),
              headers: Object.keys(headers),
              hasUCM: !!window.UnifiedCacheManager,
              ucmInitialized: window.UnifiedCacheManager?.initialized,
              hasSessionToken: !!sessionStorage.getItem('authToken'),
              hasWindowToken: !!window.authToken
            },
            sessionId: 'debug-session',
            runId: 'p0_auth_regression',
            hypothesisId: 'H12_no_token'
          })
        }).catch(() => {});
        // #endregion
      }
    }

    const fetchOptions = {
      ...options,
      headers,
      credentials: undefined
    };

    try {
      // #region agent log - API request initiated
      fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'api-fetch-wrapper.js:api_request',
          message: 'API request initiated with auth headers',
          data: {
            timestamp: Date.now(),
            page: window.location.pathname,
            url: url,
            method: options.method || 'GET',
            hasAuthHeader: !!headers.Authorization,
            isBatchDEndpoint: url.includes('/api/cash_flows') || url.includes('/api/executions') || url.includes('/api/tickers'),
            headersCount: Object.keys(headers).length
          },
          sessionId: 'batch_d_auth_debug',
          hypothesisId: 'H4_api_integration'
        })
      }).catch(() => {});
      // #endregion

      const response = await originalFetch(url, fetchOptions);

      // #region agent log - API response received
      fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location: 'api-fetch-wrapper.js:api_response',
          message: 'API response received',
          data: {
            timestamp: Date.now(),
            page: window.location.pathname,
            url: url,
            method: options.method || 'GET',
            status: response.status,
            statusText: response.statusText,
            isError: response.status >= 400,
            is401: response.status === 401,
            is400: response.status === 400,
            isBatchDEndpoint: url.includes('/api/cash_flows') || url.includes('/api/executions') || url.includes('/api/tickers')
          },
          sessionId: 'batch_d_auth_debug',
          hypothesisId: 'H4_api_integration'
        })
      }).catch(() => {});
      // #endregion

      if (response.status === 401) {
        // #region agent log - P0 regression 401 detected
        fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: 'api-fetch-wrapper.js:p0_401_detected',
            message: 'P0 regression - 401 detected',
            data: {
              url: url,
              checkingAuth: window._checkingAuth,
              isAuthVerified: window.isAuthVerified,
              hasToken: !!await getAuthToken(),
              hasSessionToken: !!sessionStorage.getItem('authToken'),
              hasWindowToken: !!window.authToken,
              timestamp: Date.now()
            },
            sessionId: 'debug-session',
            runId: 'p0_auth_regression',
            hypothesisId: 'H13_401_detection'
          })
        }).catch(() => {});
        // #endregion
        
        const authInProgress = window._checkingAuth || window.isAuthVerified === false;
        if (authInProgress) {
          // Allow auth verification to complete before forcing logout/redirect
          await new Promise(resolve => setTimeout(resolve, 500));
          const retryResponse = await originalFetch(url, fetchOptions);
          if (retryResponse.status !== 401) {
            return retryResponse;
          }
        }
        
        // Only redirect if we're not on login page and auth is not in progress
        if (!window.location.pathname.includes('login') && !authInProgress) {
          await handle401Error(url, response);
        }
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

  // Also export as apiFetchWrapper for compatibility
  window.apiFetchWrapper = window.APIFetchWrapper;

  // Runtime Fix: Enhanced API Error Handling for Console Error Reduction
  window.APIErrorHandler = {
    handle401: function(url) {
      // Enhanced 401 handling - reduce console noise while maintaining functionality
      console.warn('🔧 [Runtime Fix] API 401 detected, handling gracefully:', url);
      // Don't show user notification for every 401 to reduce console noise
      // Let the auth system handle redirects if needed
    },

    handleFetchError: function(url, error) {
      // Enhanced fetch error handling - categorize and reduce noise
      if (error?.name === 'TypeError' && error?.message?.includes('Failed to fetch')) {
        console.warn('🔧 [Runtime Fix] Network error handled gracefully:', url);
        // Network errors are expected in some scenarios, reduce console noise
      } else {
        // Log other errors normally
        window.Logger?.error?.('API Fetch error', { url, error });
      }
    }
  };

  window.Logger?.info?.('✅ [API Fetch Wrapper] Loaded successfully with runtime fixes');
})();
