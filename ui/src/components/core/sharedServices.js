/**
 * Shared Services - PDSC Client
 * --------------------------------------------------------
 * Unified API client for Phoenix Data Service Core (PDSC)
 * 
 * @description PDSC Client providing unified fetching, transformers, and error handling
 * @version v1.0.0
 * 
 * Responsibilities:
 * - Fetching (API Calls) with routes.json SSOT
 * - Transformers (camelCase ↔ snake_case) via transformers.js v1.2
 * - Error Handling according to PDSC Error Schema
 * - Authorization headers management (JWT tokens)
 */

import { reactToApi, apiToReact } from '../../cubes/shared/utils/transformers.js';

// Import masked log utility for security compliance
import { maskedLog } from '../../utils/maskedLog.js';

/**
 * Shared Services - PDSC Client
 */
class SharedServices {
  constructor() {
    this._routesConfig = null; // Internal storage
    this.apiBaseUrl = null;
    this.backendPort = null;
    this.token = null;
  }
  
  /**
   * Get routes config (SSOT)
   * Gate B Fix: Expose routesConfig for E2E tests
   * @returns {Object|null} routes.json config
   */
  get routesConfig() {
    return this._routesConfig;
  }
  
  /**
   * Set routes config and expose globally
   * Gate B Fix: Expose routesConfig on window for E2E tests
   */
  set routesConfig(value) {
    this._routesConfig = value;
    // Also expose on window for E2E tests
    if (typeof window !== 'undefined') {
      window.routesConfig = value;
    }
  }
  
  /**
   * Initialize Shared Services
   * Loads routes.json (SSOT) and prepares API base URL
   * @returns {Promise<void>}
   */
  async init() {
    try {
      // Load routes.json (SSOT)
      const response = await fetch('/routes.json');
      if (!response.ok) {
        throw new Error('Failed to load routes.json (SSOT)');
      }
      
      this.routesConfig = await response.json(); // Uses setter which exposes to window
      
      // ADR-016: No hardcoded version — version read from routes.json (SSOT) only
      // Verify routes.json has version field (sanity check; no expected value)
      if (this.routesConfig.version == null || this.routesConfig.version === '') {
        maskedLog('[Shared Services] routes.json missing version field', {});
      }
      
      // Extract API base URL from routes.json (SSOT)
      if (this.routesConfig.api && this.routesConfig.api.base_url) {
        this.apiBaseUrl = this.routesConfig.api.base_url;
      } else if (this.routesConfig.api && this.routesConfig.api.version) {
        this.apiBaseUrl = `/api/${this.routesConfig.api.version}`;
      } else {
        // Fallback
        this.apiBaseUrl = '/api/v1';
        maskedLog('[Shared Services] Using fallback API base URL. Consider adding api.base_url to routes.json', {});
      }
      
      // Extract backend port
      this.backendPort = this.routesConfig.backend || 8082;
      
      // Gate A Fix: Check access_token first (primary token name), then auth_token
      this.token = localStorage.getItem('access_token') || 
                    localStorage.getItem('auth_token') ||
                    sessionStorage.getItem('access_token') ||
                    sessionStorage.getItem('auth_token');
      
      // Use masked log for security compliance (prevents token leakage)
      maskedLog('[Shared Services] Initialized:', {
        apiBaseUrl: this.apiBaseUrl,
        backendPort: this.backendPort,
        version: this.routesConfig.version
      });
    } catch (error) {
      // Gate B Fix: Handle errors gracefully - don't log full error object
      // Use masked log for security compliance (prevents token leakage)
      maskedLog('[Shared Services] Initialization failed:', { 
        errorMessage: error.message
      });
      throw error;
    }
  }
  
  /**
   * Get routes config (SSOT)
   * Gate B Fix: Expose routesConfig for E2E tests
   * @returns {Object|null} routes.json config
   */
  getRoutesConfig() {
    return this.routesConfig;
  }
  
  /**
   * Get API base URL
   * @returns {string} API base URL
   */
  getApiBaseUrl() {
    if (!this.apiBaseUrl) {
      throw new Error('Shared Services not initialized. Call init() first.');
    }
    return this.apiBaseUrl;
  }
  
  /**
   * Set authorization token
   * @param {string} token - JWT token
   */
  setToken(token) {
    this.token = token;
  }
  
  /**
   * Get authorization token
   * Gate A Fix: Check access_token first (primary token name)
   * @returns {string|null} JWT token
   */
  getToken() {
    // Gate A Fix: Update token from storage (check access_token first)
    this.token = localStorage.getItem('access_token') || 
                  localStorage.getItem('auth_token') ||
                  sessionStorage.getItem('access_token') ||
                  sessionStorage.getItem('auth_token');
    return this.token;
  }
  
  /**
   * Build full API URL
   * Gate B Fix: Handle dateRange object - split into date_from and date_to
   * @param {string} endpoint - API endpoint (e.g., '/trading_accounts')
   * @param {Object} queryParams - Query parameters (camelCase)
   * @returns {string} Full API URL
   */
  buildUrl(endpoint, queryParams = {}) {
    const baseUrl = this.getApiBaseUrl();
    let url = `${baseUrl}${endpoint}`;
    
    // Gate B Fix: Normalize dateRange object before transformation
    // dateRange should be split into dateFrom and dateTo, not sent as object
    const normalizedParams = { ...queryParams };
    if (normalizedParams.dateRange && typeof normalizedParams.dateRange === 'object' && !Array.isArray(normalizedParams.dateRange)) {
      // Extract dateFrom and dateTo from dateRange object
      if (normalizedParams.dateRange.from) {
        normalizedParams.dateFrom = normalizedParams.dateRange.from;
      }
      if (normalizedParams.dateRange.to) {
        normalizedParams.dateTo = normalizedParams.dateRange.to;
      }
      // Remove dateRange object - don't send it as query param
      delete normalizedParams.dateRange;
    }
    
    // Transform query params to snake_case
    const apiQueryParams = reactToApi(normalizedParams);
    
    // Build query string - filter out objects, arrays, and empty strings
    const queryString = new URLSearchParams(
      Object.entries(apiQueryParams)
        .filter(([_, value]) => {
          // Gate B Fix: Filter out null, undefined, and empty strings
          if (value === null || value === undefined) {
            return false;
          }
          // Gate B Fix: Filter out empty strings - they cause 400 errors
          if (value === '' || String(value).trim() === '') {
            return false;
          }
          // Gate B Fix: Filter out objects and arrays - they should be normalized before this point
          if (typeof value === 'object' && !Array.isArray(value)) {
            // This shouldn't happen if normalization worked, but log warning
            maskedLog('[Shared Services] Warning: Object value in query params (should be normalized):', { key: _ });
            return false;
          }
          return true;
        })
        .reduce((acc, [key, value]) => {
          // Convert to string, but skip objects/arrays
          if (typeof value === 'object' && !Array.isArray(value)) {
            return acc; // Skip objects
          }
          const stringValue = String(value).trim();
          // Gate B Fix: Don't add empty strings to query params
          if (stringValue === '') {
            return acc;
          }
          acc[key] = stringValue;
          return acc;
        }, {})
    ).toString();
    
    if (queryString) {
      url += `?${queryString}`;
    }
    
    return url;
  }
  
  /**
   * Build request headers
   * Gate A Fix: Update token before building headers
   * @param {Object} additionalHeaders - Additional headers
   * @returns {Object} Request headers
   */
  buildHeaders(additionalHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...additionalHeaders
    };
    
    // Gate A Fix: Update token from storage before building headers
    const token = this.getToken();
    
    // Add authorization header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }
  
  /**
   * Handle API response
   * @param {Response} response - Fetch response
   * @returns {Promise<Object>} Parsed response data
   */
  async handleResponse(response) {
    const data = await response.json();
    
    // Check if response is an error according to PDSC Error Schema
    if (data.success === false) {
      const error = data.error || {};
      
      // Handle specific error codes
      if (error.code === 'AUTH_TOKEN_EXPIRED') {
        // Token expired - clear token and redirect to login
        this.setToken(null);
        localStorage.removeItem('auth_token');
        sessionStorage.removeItem('auth_token');
        
        // Emit event for auth guard to handle
        window.dispatchEvent(new CustomEvent('auth:token-expired', {
          detail: { error }
        }));
      }
      
      // Throw error with PDSC Error Schema structure
      const errorObj = new Error(error.message || 'API request failed');
      errorObj.code = error.code;
      errorObj.message_i18n = error.message_i18n || error.message;
      errorObj.details = error.details || {};
      errorObj.response = data;
      
      throw errorObj;
    }
    
    // Transform response data (snake_case → camelCase)
    if (data.data) {
      data.data = apiToReact(data.data);
    }
    
    return data;
  }
  
  /**
   * GET request
   * @param {string} endpoint - API endpoint
   * @param {Object} queryParams - Query parameters (camelCase)
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Object>} Response data
   */
  /**
   * Check if endpoint requires authentication (Gate A: prevent 401 for guests)
   * Auth endpoints are NEVER protected - login, register, me, refresh must work without token
   * @param {string} endpoint - API endpoint (e.g., '/trading_accounts')
   * @returns {boolean} True if endpoint is protected (requires token)
   */
  _isProtectedEndpoint(endpoint) {
    if (!endpoint || typeof endpoint !== 'string') return false;
    const normalized = endpoint.replace(/^\//, '');

    // Gate A: NEVER block auth endpoints - required for login, register, token refresh
    const authPrefixes = ['auth', 'users/me', 'users/profile'];
    if (authPrefixes.some(p => normalized === p || normalized.startsWith(p + '/'))) {
      return false;
    }

    const protectedPrefixes = ['trading_accounts', 'cash_flows', 'positions', 'brokers_fees', 'reference'];
    return protectedPrefixes.some(p => normalized === p || normalized.startsWith(p + '/'));
  }

  async get(endpoint, queryParams = {}, options = {}) {
    try {
      // Gate A Fix: Skip protected API calls when guest - prevents 10 SEVERE 401 errors on Home
      if (this._isProtectedEndpoint(endpoint)) {
        const token = this.getToken();
        if (!token || String(token).trim() === '') {
          const err = new Error('Authentication required for protected endpoint');
          err.code = 'HTTP_401';
          err.status = 401;
          throw err;
        }
      }

      const url = this.buildUrl(endpoint, queryParams);
      const headers = this.buildHeaders(options.headers);
      
      // Gate B Fix: Wrap fetch in try-catch to prevent SEVERE console errors
      let response;
      try {
        response = await fetch(url, {
          method: 'GET',
          headers,
          ...options
        });
      } catch (fetchError) {
        // Network error or fetch failed - don't throw SEVERE
        maskedLog('[Shared Services] Fetch failed (network error):', { 
          endpoint,
          errorMessage: fetchError.message
        });
        const networkError = new Error(`Network error: ${fetchError.message}`);
        networkError.code = 'NETWORK_ERROR';
        networkError.status = 0;
        throw networkError;
      }
      
      if (!response.ok) {
        // Gate B Fix: Handle 400/404/500 gracefully without throwing SEVERE errors
        // Return error object instead of throwing to prevent SEVERE console errors
        const errorData = {
          code: `HTTP_${response.status}`,
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          statusText: response.statusText
        };
        
        // Try to parse error response body if available
        try {
          const errorBody = await response.json();
          if (errorBody.error) {
            errorData.code = errorBody.error.code || errorData.code;
            errorData.message = errorBody.error.message_i18n || errorBody.error.message || errorData.message;
            errorData.details = errorBody.error.details || {};
          } else if (errorBody.detail) {
            errorData.message = errorBody.detail;
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
        
        // Use masked log for security compliance (prevents token leakage)
        maskedLog('[Shared Services] GET request failed:', { 
          endpoint,
          status: response.status,
          code: errorData.code
        });
        
        // Return error object instead of throwing to prevent SEVERE console errors
        const errorObj = new Error(errorData.message);
        errorObj.code = errorData.code;
        errorObj.status = errorData.status;
        errorObj.details = errorData.details || {};
        throw errorObj;
      }
      
      return await this.handleResponse(response);
    } catch (error) {
      // Use masked log for security compliance (prevents token leakage)
      // Gate B Fix: Don't log full error object to prevent SEVERE console errors
      maskedLog('[Shared Services] GET request failed:', { 
        endpoint,
        errorCode: error.code || 'UNKNOWN',
        errorMessage: error.message
      });
      throw error;
    }
  }
  
  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body (camelCase); or query params when options.useQueryParams=true (e.g. POST /me/tickers)
   * @param {Object} options - Additional fetch options; useQueryParams: send body keys as URL query params (for endpoints that use Query())
   * @returns {Promise<Object>} Response data
   */
  async post(endpoint, body = {}, options = {}) {
    try {
      // Gate A Fix: Skip protected API calls when guest
      if (this._isProtectedEndpoint(endpoint)) {
        const token = this.getToken();
        if (!token || String(token).trim() === '') {
          const err = new Error('Authentication required for protected endpoint');
          err.code = 'HTTP_401';
          err.status = 401;
          throw err;
        }
      }

      const useQueryParams = options.useQueryParams === true;
      const url = useQueryParams ? this.buildUrl(endpoint, body) : this.buildUrl(endpoint);
      const headers = this.buildHeaders(options.headers);

      // Transform body (camelCase → snake_case); when useQueryParams, body is already in URL
      const apiBody = reactToApi(body);
      
      // Gate B Fix: Wrap fetch in try-catch to prevent SEVERE console errors
      let response;
      try {
        response = await fetch(url, {
          method: 'POST',
          headers,
          body: useQueryParams ? undefined : JSON.stringify(apiBody),
          ...options
        });
      } catch (fetchError) {
        // Network error or fetch failed - don't throw SEVERE
        maskedLog('[Shared Services] Fetch failed (network error):', { 
          endpoint,
          errorMessage: fetchError.message
        });
        const networkError = new Error(`Network error: ${fetchError.message}`);
        networkError.code = 'NETWORK_ERROR';
        networkError.status = 0;
        throw networkError;
      }
      
      if (!response.ok) {
        // Gate B Fix: Handle errors gracefully without throwing SEVERE errors
        const errorData = {
          code: `HTTP_${response.status}`,
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          statusText: response.statusText
        };
        
        try {
          const errorBody = await response.json();
          if (errorBody.error) {
            errorData.code = errorBody.error.code || errorData.code;
            errorData.message = errorBody.error.message_i18n || errorBody.error.message || errorData.message;
            errorData.details = errorBody.error.details || {};
          } else if (errorBody.detail) {
            errorData.message = errorBody.detail;
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
        
        maskedLog('[Shared Services] POST request failed:', { 
          endpoint,
          status: response.status,
          code: errorData.code
        });
        
        const errorObj = new Error(errorData.message);
        errorObj.code = errorData.code;
        errorObj.status = errorData.status;
        errorObj.details = errorData.details || {};
        throw errorObj;
      }
      
      return await this.handleResponse(response);
    } catch (error) {
      // Use masked log for security compliance (prevents token leakage)
      maskedLog('[Shared Services] POST request failed:', { 
        endpoint,
        errorCode: error.code || 'UNKNOWN',
        errorMessage: error.message
      });
      throw error;
    }
  }
  
  /**
   * PUT request
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body (camelCase)
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Object>} Response data
   */
  async put(endpoint, body = {}, options = {}) {
    try {
      // Gate A Fix: Skip protected API calls when guest
      if (this._isProtectedEndpoint(endpoint)) {
        const token = this.getToken();
        if (!token || String(token).trim() === '') {
          const err = new Error('Authentication required for protected endpoint');
          err.code = 'HTTP_401';
          err.status = 401;
          throw err;
        }
      }

      const url = this.buildUrl(endpoint);
      const headers = this.buildHeaders(options.headers);
      
      // Transform request body (camelCase → snake_case)
      const apiBody = reactToApi(body);
      
      // Gate B Fix: Wrap fetch in try-catch to prevent SEVERE console errors
      let response;
      try {
        response = await fetch(url, {
          method: 'PUT',
          headers,
          body: JSON.stringify(apiBody),
          ...options
        });
      } catch (fetchError) {
        // Network error or fetch failed - don't throw SEVERE
        maskedLog('[Shared Services] Fetch failed (network error):', { 
          endpoint,
          errorMessage: fetchError.message
        });
        const networkError = new Error(`Network error: ${fetchError.message}`);
        networkError.code = 'NETWORK_ERROR';
        networkError.status = 0;
        throw networkError;
      }
      
      if (!response.ok) {
        // Gate B Fix: Handle errors gracefully without throwing SEVERE errors
        const errorData = {
          code: `HTTP_${response.status}`,
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          statusText: response.statusText
        };
        
        try {
          const errorBody = await response.json();
          if (errorBody.error) {
            errorData.code = errorBody.error.code || errorData.code;
            errorData.message = errorBody.error.message_i18n || errorBody.error.message || errorData.message;
            errorData.details = errorBody.error.details || {};
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
        
        maskedLog('[Shared Services] PUT request failed:', { 
          endpoint,
          status: response.status,
          code: errorData.code
        });
        
        const errorObj = new Error(errorData.message);
        errorObj.code = errorData.code;
        errorObj.status = errorData.status;
        errorObj.details = errorData.details || {};
        throw errorObj;
      }
      
      return await this.handleResponse(response);
    } catch (error) {
      // Use masked log for security compliance (prevents token leakage)
      maskedLog('[Shared Services] PUT request failed:', { 
        endpoint,
        errorCode: error.code || 'UNKNOWN',
        errorMessage: error.message
      });
      throw error;
    }
  }
  
  /**
   * DELETE request
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Object>} Response data
   */
  async delete(endpoint, options = {}) {
    try {
      // Gate A Fix: Skip protected API calls when guest
      if (this._isProtectedEndpoint(endpoint)) {
        const token = this.getToken();
        if (!token || String(token).trim() === '') {
          const err = new Error('Authentication required for protected endpoint');
          err.code = 'HTTP_401';
          err.status = 401;
          throw err;
        }
      }

      const url = this.buildUrl(endpoint);
      const headers = this.buildHeaders(options.headers);
      
      // Gate B Fix: Wrap fetch in try-catch to prevent SEVERE console errors
      let response;
      try {
        response = await fetch(url, {
          method: 'DELETE',
          headers,
          ...options
        });
      } catch (fetchError) {
        // Network error or fetch failed - don't throw SEVERE
        maskedLog('[Shared Services] Fetch failed (network error):', { 
          endpoint,
          errorMessage: fetchError.message
        });
        const networkError = new Error(`Network error: ${fetchError.message}`);
        networkError.code = 'NETWORK_ERROR';
        networkError.status = 0;
        throw networkError;
      }
      
      if (!response.ok) {
        // Gate B Fix: Handle errors gracefully without throwing SEVERE errors
        const errorData = {
          code: `HTTP_${response.status}`,
          message: `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          statusText: response.statusText
        };
        
        try {
          const errorBody = await response.json();
          if (errorBody.error) {
            errorData.code = errorBody.error.code || errorData.code;
            errorData.message = errorBody.error.message_i18n || errorBody.error.message || errorData.message;
            errorData.details = errorBody.error.details || {};
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
        
        maskedLog('[Shared Services] DELETE request failed:', { 
          endpoint,
          status: response.status,
          code: errorData.code
        });
        
        const errorObj = new Error(errorData.message);
        errorObj.code = errorData.code;
        errorObj.status = errorData.status;
        errorObj.details = errorData.details || {};
        throw errorObj;
      }
      
      return await this.handleResponse(response);
    } catch (error) {
      // Use masked log for security compliance (prevents token leakage)
      maskedLog('[Shared Services] DELETE request failed:', { 
        endpoint,
        errorCode: error.code || 'UNKNOWN',
        errorMessage: error.message
      });
      throw error;
    }
  }
}

// Create singleton instance
const sharedServices = new SharedServices();

// Gate B Fix: Expose sharedServices instance on window for E2E tests
if (typeof window !== 'undefined') {
  window.sharedServices = sharedServices;
}

// Auto-initialize when module loads
sharedServices.init().catch(error => {
  // Gate B Fix: Handle errors gracefully - don't log full error object
  // Use masked log for security compliance (prevents token leakage)
  maskedLog('[Shared Services] Auto-initialization failed:', { 
    errorMessage: error.message
  });
});

// Export singleton instance
export default sharedServices;

// Export class for testing
export { SharedServices };
