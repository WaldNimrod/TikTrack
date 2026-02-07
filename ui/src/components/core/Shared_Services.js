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

/**
 * Shared Services - PDSC Client
 */
class SharedServices {
  constructor() {
    this.routesConfig = null;
    this.apiBaseUrl = null;
    this.backendPort = null;
    this.token = null;
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
      
      this.routesConfig = await response.json();
      
      // Verify routes.json version
      if (this.routesConfig.version !== '1.1.2') {
        const isProduction = window.location.hostname !== 'localhost';
        if (isProduction) {
          throw new Error(`routes.json version mismatch in Production. Expected v1.1.2, got: ${this.routesConfig.version}`);
        } else {
          console.warn(`[Shared Services] routes.json version mismatch in Development. Expected v1.1.2, got: ${this.routesConfig.version}`);
        }
      }
      
      // Extract API base URL from routes.json (SSOT)
      if (this.routesConfig.api && this.routesConfig.api.base_url) {
        this.apiBaseUrl = this.routesConfig.api.base_url;
      } else if (this.routesConfig.api && this.routesConfig.api.version) {
        this.apiBaseUrl = `/api/${this.routesConfig.api.version}`;
      } else {
        // Fallback
        this.apiBaseUrl = '/api/v1';
        console.warn('[Shared Services] Using fallback API base URL. Consider adding api.base_url to routes.json');
      }
      
      // Extract backend port
      this.backendPort = this.routesConfig.backend || 8082;
      
      // Get token from localStorage or sessionStorage
      this.token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
      
      console.log('[Shared Services] Initialized:', {
        apiBaseUrl: this.apiBaseUrl,
        backendPort: this.backendPort,
        version: this.routesConfig.version
      });
    } catch (error) {
      console.error('[Shared Services] Initialization failed:', error);
      throw error;
    }
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
   * @returns {string|null} JWT token
   */
  getToken() {
    return this.token;
  }
  
  /**
   * Build full API URL
   * @param {string} endpoint - API endpoint (e.g., '/trading_accounts')
   * @param {Object} queryParams - Query parameters (camelCase)
   * @returns {string} Full API URL
   */
  buildUrl(endpoint, queryParams = {}) {
    const baseUrl = this.getApiBaseUrl();
    let url = `${baseUrl}${endpoint}`;
    
    // Transform query params to snake_case
    const apiQueryParams = reactToApi(queryParams);
    
    // Build query string
    const queryString = new URLSearchParams(
      Object.entries(apiQueryParams)
        .filter(([_, value]) => value !== null && value !== undefined)
        .reduce((acc, [key, value]) => {
          acc[key] = String(value);
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
   * @param {Object} additionalHeaders - Additional headers
   * @returns {Object} Request headers
   */
  buildHeaders(additionalHeaders = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...additionalHeaders
    };
    
    // Add authorization header if token exists
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
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
  async get(endpoint, queryParams = {}, options = {}) {
    try {
      const url = this.buildUrl(endpoint, queryParams);
      const headers = this.buildHeaders(options.headers);
      
      const response = await fetch(url, {
        method: 'GET',
        headers,
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('[Shared Services] GET request failed:', error);
      throw error;
    }
  }
  
  /**
   * POST request
   * @param {string} endpoint - API endpoint
   * @param {Object} body - Request body (camelCase)
   * @param {Object} options - Additional fetch options
   * @returns {Promise<Object>} Response data
   */
  async post(endpoint, body = {}, options = {}) {
    try {
      const url = this.buildUrl(endpoint);
      const headers = this.buildHeaders(options.headers);
      
      // Transform request body (camelCase → snake_case)
      const apiBody = reactToApi(body);
      
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(apiBody),
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('[Shared Services] POST request failed:', error);
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
      const url = this.buildUrl(endpoint);
      const headers = this.buildHeaders(options.headers);
      
      // Transform request body (camelCase → snake_case)
      const apiBody = reactToApi(body);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(apiBody),
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('[Shared Services] PUT request failed:', error);
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
      const url = this.buildUrl(endpoint);
      const headers = this.buildHeaders(options.headers);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers,
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await this.handleResponse(response);
    } catch (error) {
      console.error('[Shared Services] DELETE request failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const sharedServices = new SharedServices();

// Auto-initialize when module loads
sharedServices.init().catch(error => {
  console.error('[Shared Services] Auto-initialization failed:', error);
});

// Export singleton instance
export default sharedServices;

// Export class for testing
export { SharedServices };
