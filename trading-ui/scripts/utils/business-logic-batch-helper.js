/**
 * Business Logic Batch Helper
 * ============================
 * 
 * Helper functions for batch operations with Business Logic API.
 * 
 * Usage:
 *   import { executeBatchOperations } from './business-logic-batch-helper.js';
 *   const results = await executeBatchOperations([
 *     { operation: 'calculate-stop-price', service: 'trade', data: {...} },
 *     { operation: 'validate-trade', service: 'trade', data: {...} }
 *   ]);
 */


// ===== FUNCTION INDEX =====

// === Event Handlers ===
// - executeBatchOperations() - Executebatchoperations
// - executeBatchOperationsChunked() - Executebatchoperationschunked
// - executeBatchOperationsWithCache() - Executebatchoperationswithcache

(function() {
  'use strict';

  const BATCH_ENDPOINT = '/api/business/batch';
  const MAX_BATCH_SIZE = 50;

  /**
   * Execute multiple business logic operations in a single request.
   * @param {Array} operations - Array of operation objects
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Batch results
   */
  async function executeBatchOperations(operations, options = {}) {
    if (!Array.isArray(operations) || operations.length === 0) {
      throw new Error('Operations must be a non-empty array');
    }

    if (operations.length > MAX_BATCH_SIZE) {
      throw new Error(`Maximum ${MAX_BATCH_SIZE} operations per batch request`);
    }

    try {
      const response = await fetch(BATCH_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ operations })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      window.Logger?.error?.('❌ Error executing batch operations', {
        page: 'business-logic-batch-helper',
        error: error?.message || error,
        operationsCount: operations.length
      });
      throw error;
    }
  }

  /**
   * Split large batch into smaller chunks and execute them.
   * @param {Array} operations - Array of operation objects
   * @param {number} chunkSize - Size of each chunk (default: MAX_BATCH_SIZE)
   * @returns {Promise<Array>} Array of batch results
   */
  async function executeBatchOperationsChunked(operations, chunkSize = MAX_BATCH_SIZE) {
    if (!Array.isArray(operations) || operations.length === 0) {
      return [];
    }

    const chunks = [];
    for (let i = 0; i < operations.length; i += chunkSize) {
      chunks.push(operations.slice(i, i + chunkSize));
    }

    const results = [];
    for (const chunk of chunks) {
      try {
        const result = await executeBatchOperations(chunk);
        results.push(result);
      } catch (error) {
        // Continue with other chunks even if one fails
        window.Logger?.warn?.('⚠️ Batch chunk failed, continuing with other chunks', {
          page: 'business-logic-batch-helper',
          error: error?.message || error,
          chunkSize: chunk.length
        });
        results.push({
          status: 'error',
          error: { message: error?.message || 'Chunk execution failed' },
          results: []
        });
      }
    }

    // Merge all results
    const mergedResults = {
      status: 'success',
      results: [],
      total: 0,
      successful: 0,
      failed: 0
    };

    for (const result of results) {
      if (result.status === 'success' && Array.isArray(result.results)) {
        mergedResults.results.push(...result.results);
        mergedResults.total += result.total || 0;
        mergedResults.successful += result.successful || 0;
        mergedResults.failed += result.failed || 0;
      }
    }

    return mergedResults;
  }

  /**
   * Execute batch operations with caching support.
   * @param {Array} operations - Array of operation objects
   * @param {Object} options - Additional options (cache, ttl, etc.)
   * @returns {Promise<Object>} Batch results
   */
  async function executeBatchOperationsWithCache(operations, options = {}) {
    const { useCache = true, ttl = 60 * 1000 } = options;

    if (!useCache || !window.CacheTTLGuard?.ensure) {
      return await executeBatchOperations(operations, options);
    }

    // Create cache key from operations
    const cacheKey = window.CacheKeyHelper?.generateCacheKeyFromObject
      ? window.CacheKeyHelper.generateCacheKeyFromObject('business:batch', operations)
      : `business:batch:${JSON.stringify(operations)}`;

    return await window.CacheTTLGuard.ensure(cacheKey, async () => {
      return await executeBatchOperations(operations, options);
    }, { ttl });
  }

  // Export functions
  if (typeof window !== 'undefined') {
    window.BusinessLogicBatchHelper = {
      executeBatchOperations,
      executeBatchOperationsChunked,
      executeBatchOperationsWithCache,
      MAX_BATCH_SIZE
    };
    
    window.Logger?.info?.('✅ BusinessLogicBatchHelper initialized', { page: 'business-logic-batch-helper' });
  }
})();

