/**
 * Request Deduplication Helper
 * ============================
 * 
 * Utility for preventing duplicate API requests by tracking in-flight requests.
 * 
 * Usage:
 *   import { deduplicateRequest } from './request-deduplication-helper.js';
 *   const result = await deduplicateRequest('unique-key', async () => {
 *     return await fetch('/api/endpoint');
 *   });
 */


// ===== FUNCTION INDEX =====

// === Initialization ===
// - buildDedupeKey() - Builddedupekey

// === Data Functions ===
// - deduplicateRequest() - Deduplicaterequest
// - clearAllInflightRequests() - Clearallinflightrequests
// - getInflightRequestCount() - Getinflightrequestcount
// - isRequestInflight() - Isrequestinflight
// - requestPromise() - Requestpromise

(function() {
  'use strict';

  // Global in-flight request registry
  const inflightRequests = new Map();

  /**
   * Execute a request with deduplication support.
   * If the same request is already in-flight, returns the existing promise.
   * 
   * @param {string} key - Unique key for the request (should include all parameters)
   * @param {Function} requestFn - Function that returns a Promise for the request
   * @param {Object} options - Additional options
   * @param {boolean} options.enabled - Enable/disable deduplication (default: true)
   * @param {number} options.timeout - Timeout in ms to clear the key if request fails (default: 60000)
   * @returns {Promise} Request result
   */
  async function deduplicateRequest(key, requestFn, options = {}) {
    const { enabled = true, timeout = 60000 } = options;

    if (!enabled) {
      return await requestFn();
    }

    // Check if request is already in-flight
    if (inflightRequests.has(key)) {
      const existingPromise = inflightRequests.get(key);
      try {
        return await existingPromise;
      } catch (error) {
        // If existing request failed, clear it and continue
        inflightRequests.delete(key);
        throw error;
      }
    }

    // Create new request promise
    const requestPromise = (async () => {
      try {
        const result = await requestFn();
        return result;
      } finally {
        // Clear from registry after completion (success or failure)
        setTimeout(() => {
          inflightRequests.delete(key);
        }, 100); // Small delay to allow concurrent requests to catch the result
      }
    })();

    // Store in registry
    inflightRequests.set(key, requestPromise);

    // Auto-cleanup after timeout (safety measure)
    setTimeout(() => {
      if (inflightRequests.has(key)) {
        inflightRequests.delete(key);
      }
    }, timeout);

    return requestPromise;
  }

  /**
   * Build a deduplication key from request parameters.
   * 
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {Object} params - Request parameters/body
   * @returns {string} Deduplication key
   */
  function buildDedupeKey(endpoint, method = 'GET', params = null) {
    const methodUpper = method.toUpperCase();
    const paramsStr = params ? JSON.stringify(params) : '';
    return `${methodUpper}:${endpoint}:${paramsStr}`;
  }

  /**
   * Clear all in-flight requests (useful for testing or cleanup).
   */
  function clearAllInflightRequests() {
    inflightRequests.clear();
  }

  /**
   * Get count of in-flight requests.
   * 
   * @returns {number} Number of in-flight requests
   */
  function getInflightRequestCount() {
    return inflightRequests.size;
  }

  /**
   * Check if a specific request is in-flight.
   * 
   * @param {string} key - Request key
   * @returns {boolean} True if request is in-flight
   */
  function isRequestInflight(key) {
    return inflightRequests.has(key);
  }

  // Export functions
  if (typeof window !== 'undefined') {
    window.RequestDeduplicationHelper = {
      deduplicateRequest,
      buildDedupeKey,
      clearAllInflightRequests,
      getInflightRequestCount,
      isRequestInflight
    };
    
    window.Logger?.info?.('✅ RequestDeduplicationHelper initialized', { page: 'request-deduplication-helper' });
  }
})();

