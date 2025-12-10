/**
 * Executions Data Service
 * ======================================
 * Unified loader for executions data with cache + TTL guard integration.
 *
 * Responsibilities:
 * - Load executions list via API (with cache bust for local file protocol)
 * - Save results inside UnifiedCacheManager with a 45s TTL
 * - Provide forced reload + cache invalidation helpers
 * - Surface consistent errors through the global notification + log systems
 * - CRUD operations (create, update, delete, fetchDetails)
 * - CacheSyncManager integration for automatic cache invalidation
 *
 * Related Documentation:
 * - documentation/frontend/GENERAL_SYSTEMS_LIST.md
 * - documentation/04-FEATURES/CORE/CACHE_SYNC_SPECIFICATION.md
 * - documentation/03-DEVELOPMENT/GUIDES/DATA_SERVICES_DEVELOPER_GUIDE.md
 *
 * Function Index:
 * ==============
 *
 * CACHE MANAGEMENT:
 * - saveExecutionsCache(data, options) - Save executions to cache
 * - invalidateExecutionsCache() - Invalidate executions cache (uses CacheSyncManager)
 * - clearExecutionsCache(patternOnly) - Clear executions cache
 *
 * DATA LOADING:
 * - fetchExecutionsFromApi({ signal }) - Fetch executions from API
 * - loadExecutionsData(options) - Load executions with cache support
 *
 * CRUD OPERATIONS:
 * - createExecution(payload, options) - Create new execution
 * - updateExecution(executionId, payload, options) - Update existing execution
 * - deleteExecution(executionId, options) - Delete execution
 * - fetchExecutionDetails(executionId, options) - Fetch single execution details
 * - sendExecutionMutation({ executionId, method, payload, signal }) - Generic mutation handler
 *
 * @version 2.0.0
 * @created November 2025
 * @updated January 2025 - Added CRUD operations and CacheSyncManager integration
 * @author TikTrack Development Team
 */
(function executionsDataService() {
  const EXECUTIONS_DATA_KEY = 'executions-data';
  const EXECUTIONS_TTL = 45 * 1000; // 45 seconds per audit plan
  const PAGE_LOG_CONTEXT = { page: 'executions-data' };

  const DEFAULT_HEADERS = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  };

  function resolveBaseUrl() {
    if (typeof window.API_BASE_URL === 'string') {
      return window.API_BASE_URL;
    }
    return window.location?.protocol === 'file:' ? 'http://127.0.0.1:8080' : '';
  }

  function normalizeExecutionsPayload(payload) {
    const records = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.records)
          ? payload.records
          : [];

    return records.map((execution) => ({
      ...execution,
      updated_at:
        execution.updated_at ||
        execution.execution_date ||
        execution.date ||
        execution.created_at ||
        null,
    }));
  }

  async function saveExecutionsCache(data, options = {}) {
    if (!window.UnifiedCacheManager?.save) {
      return;
    }
    const ttl = options.ttl ?? EXECUTIONS_TTL;
    try {
      await window.UnifiedCacheManager.save(EXECUTIONS_DATA_KEY, data, { ttl });
    } catch (error) {
      window.Logger?.warn?.('Failed to save executions cache', { ...PAGE_LOG_CONTEXT, error: error?.message });
    }
  }

  async function invalidateExecutionsCache() {
    // Try CacheSyncManager first (preferred method)
    if (window.CacheSyncManager?.invalidateByAction) {
      try {
        await window.CacheSyncManager.invalidateByAction('execution-updated');
        return;
      } catch (error) {
        window.Logger?.warn?.('⚠️ CacheSyncManager.invalidateByAction failed, falling back', {
          ...PAGE_LOG_CONTEXT,
          error: error?.message,
        });
      }
    }
    
    // Fallback to direct invalidation
    if (!window.UnifiedCacheManager) {
      return;
    }
    if (typeof window.UnifiedCacheManager.invalidate === 'function') {
      await window.UnifiedCacheManager.invalidate(EXECUTIONS_DATA_KEY).catch((error) => {
        window.Logger?.warn?.('⚠️ Failed to invalidate executions cache', {
          ...PAGE_LOG_CONTEXT,
          error: error?.message,
        });
      });
      return;
    }
    if (typeof window.UnifiedCacheManager.clearByPattern === 'function') {
      await window.UnifiedCacheManager.clearByPattern(EXECUTIONS_DATA_KEY).catch((error) => {
        window.Logger?.warn?.('⚠️ Failed to clear executions cache pattern', {
          ...PAGE_LOG_CONTEXT,
          error: error?.message,
        });
      });
    }
  }

  async function clearExecutionsCache(patternOnly = false) {
    if (patternOnly) {
      if (typeof window.UnifiedCacheManager?.clearByPattern === 'function') {
        await window.UnifiedCacheManager.clearByPattern(EXECUTIONS_DATA_KEY);
      }
      return;
    }
    await invalidateExecutionsCache();
  }

  function notifyLoadError(message, error) {
    const details = error?.message || message || 'שגיאה בטעינת ביצועים';
    window.Logger?.error?.('Executions data load failed', { ...PAGE_LOG_CONTEXT, error: details });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', `${details} – הנתונים לא זמינים כרגע`);
    }
  }

  async function fetchExecutionsFromApi({ signal } = {}) {
    const base = resolveBaseUrl();
    const separator = base.endsWith('/') ? '' : '/';
    const url = `${base}${separator}api/executions/?_ts=${Date.now()}`;
    
    window.Logger?.debug?.('🔄 Fetching executions from API', {
      ...PAGE_LOG_CONTEXT,
      url,
      base,
      signalAborted: signal?.aborted
    });
    
    try {
      const response = await fetch(url, { 
        method: 'GET', 
        headers: DEFAULT_HEADERS, 
        signal, // Include cookies for session-based auth
      });
      
      // Handle 401/308 authentication errors
      if (window.checkAndHandleAuthError && window.checkAndHandleAuthError(response, url)) {
        throw new Error('Authentication required');
      }
      
      window.Logger?.debug?.('📡 API response received', {
        ...PAGE_LOG_CONTEXT,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unable to read error response');
        const error = new Error(`Execution load failed (${response.status}): ${errorText.substring(0, 200)}`);
        window.Logger?.error?.('❌ API response not OK', {
          ...PAGE_LOG_CONTEXT,
          status: response.status,
          statusText: response.statusText,
          errorText: errorText.substring(0, 500),
          url
        });
        notifyLoadError(error.message, error);
        throw error;
      }
      
      const payload = await response.json();
      window.Logger?.debug?.('📦 Payload received', {
        ...PAGE_LOG_CONTEXT,
        status: payload?.status,
        dataType: Array.isArray(payload?.data) ? 'array' : typeof payload?.data,
        dataLength: Array.isArray(payload?.data) ? payload.data.length : 'N/A'
      });
      
      const normalized = normalizeExecutionsPayload(payload);
      window.Logger?.debug?.('✅ Payload normalized', {
        ...PAGE_LOG_CONTEXT,
        normalizedCount: normalized.length
      });
      
      await saveExecutionsCache(normalized);
      return normalized;
    } catch (error) {
      if (error.name === 'AbortError') {
        window.Logger?.warn?.('⚠️ Request aborted', { ...PAGE_LOG_CONTEXT, url });
        throw error;
      }
      window.Logger?.error?.('❌ Fetch error in fetchExecutionsFromApi', {
        ...PAGE_LOG_CONTEXT,
        error: error?.message || String(error),
        errorName: error?.name,
        url
      });
      throw error;
    }
  }

  async function loadExecutionsData(options = {}) {
    const { force = false, ttl = EXECUTIONS_TTL, signal } = options;
    const loader = async () => {
      const fresh = await fetchExecutionsFromApi({ signal });
      return fresh;
    };

    try {
      if (force) {
        await clearExecutionsCache(true);
        return await loader();
      }

      if (window.CacheTTLGuard?.ensure) {
        const cached = await window.CacheTTLGuard.ensure(EXECUTIONS_DATA_KEY, loader, {
          ttl,
          afterRead: (data) => {
            if (Array.isArray(data)) {
              window.Logger?.debug?.('Executions served from cache', { ...PAGE_LOG_CONTEXT, count: data.length });
            }
          },
          afterLoad: (data) => {
            window.Logger?.debug?.('Executions loaded from API', {
              ...PAGE_LOG_CONTEXT,
              count: Array.isArray(data) ? data.length : 0,
            });
          },
        });
        return Array.isArray(cached) ? cached : cached || [];
      }

      if (window.UnifiedCacheManager?.get) {
        const cached = await window.UnifiedCacheManager.get(EXECUTIONS_DATA_KEY, { ttl });
        if (cached) {
          return Array.isArray(cached) ? cached : cached || [];
        }
      }

      return await loader();
    } catch (error) {
      window.Logger?.error?.('❌ Error in loadExecutionsData (executions-data.js)', {
        ...PAGE_LOG_CONTEXT,
        error: error?.message || String(error),
        errorName: error?.name,
        errorStack: error?.stack?.split('\n').slice(0, 5).join('\n'),
        errorType: typeof error,
        force,
        ttl,
        CacheTTLGuardAvailable: !!window.CacheTTLGuard,
        UnifiedCacheManagerAvailable: !!window.UnifiedCacheManager,
        timestamp: new Date().toISOString(),
        url: window.location?.href
      });
      notifyLoadError('שגיאה בטעינת ביצועים', error);
      throw error;
    }
  }

  function buildUrl(path) {
    const base = resolveBaseUrl();
    if (!base) {
      return path;
    }
    if (path.startsWith('http')) {
      return path;
    }
    const separator = base.endsWith('/') || path.startsWith('/') ? '' : '/';
    return `${base}${separator}${path.replace(/^\//, '')}`;
  }

  async function sendExecutionMutation({ executionId, method, payload, signal }) {
    const endpoint = executionId ? `/api/executions/${executionId}` : '/api/executions';
    try {
      const response = await fetch(buildUrl(endpoint), {
        method,
        headers: DEFAULT_HEADERS,
        body: payload ? JSON.stringify(payload) : undefined,
        signal,
      });

      if (response.ok) {
        // Determine action based on method
        if (window.CacheSyncManager?.invalidateByAction) {
          const action = method === 'POST' ? 'execution-created' :
                        method === 'PUT' ? 'execution-updated' :
                        method === 'DELETE' ? 'execution-deleted' : 'execution-updated';
          try {
            await window.CacheSyncManager.invalidateByAction(action);
          } catch (error) {
            // Fallback to direct invalidation
            await invalidateExecutionsCache();
          }
        } else {
          await invalidateExecutionsCache();
        }
      }

      return response;
    } catch (error) {
      window.Logger?.error?.('❌ Execution mutation failed', {
        ...PAGE_LOG_CONTEXT,
        executionId,
        method,
        error: error?.message,
      });
      throw error;
    }
  }

  async function createExecution(payload, options = {}) {
    return sendExecutionMutation({ method: 'POST', payload, signal: options.signal });
  }

  async function updateExecution(executionId, payload, options = {}) {
    return sendExecutionMutation({
      executionId,
      method: 'PUT',
      payload,
      signal: options.signal,
    });
  }

  async function deleteExecution(executionId, options = {}) {
    return sendExecutionMutation({
      executionId,
      method: 'DELETE',
      signal: options.signal,
    });
  }

  async function fetchExecutionDetails(executionId, options = {}) {
    const response = await fetch(buildUrl(`/api/executions/${executionId}`), {
      method: 'GET',
      headers: DEFAULT_HEADERS,
      signal: options.signal,
    });

    if (!response.ok) {
      const error = new Error(`טעינת פרטי ביצוע ${executionId} נכשלה (${response.status})`);
      window.Logger?.error?.('❌ Failed to fetch execution details', {
        ...PAGE_LOG_CONTEXT,
        executionId,
        error: error.message,
      });
      throw error;
    }

    return response.json();
  }

  // ========================================================================
  // Business Logic API Wrappers
  // ========================================================================

  /**
   * Calculate execution values using backend business logic service.
   * Uses UnifiedCacheManager for caching results (30s TTL).
   * @param {Object} params - Parameters: {quantity, price, commission, action, is_edit}
   * @returns {Promise<Object>} Calculated values: {total, label}
   */
  async function calculateExecutionValues(params = {}) {
    // Use optimized cache key generation
    const cacheKey = window.CacheKeyHelper?.generateCacheKeyFromObject 
      ? window.CacheKeyHelper.generateCacheKeyFromObject('business:calculate-execution-values', params)
      : `business:calculate-execution-values:${JSON.stringify(params)}`;
    
    try {
      // Use CacheTTLGuard for automatic cache management
      if (window.CacheTTLGuard?.ensure) {
        return await window.CacheTTLGuard.ensure(cacheKey, async () => {
          const response = await fetch('/api/business/execution/calculate-values', {
            method: 'POST',
            headers: DEFAULT_HEADERS,
            body: JSON.stringify(params)
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          if (result.status === 'success' && result.data) {
            return result.data;
          } else {
            throw new Error(result.error?.message || 'Invalid calculation result');
          }
        }, { ttl: 30 * 1000 });
      }
      
      // Fallback if CacheTTLGuard not available
      const response = await fetch('/api/business/execution/calculate-values', {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(params)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success' && result.data) {
        return result.data;
      } else {
        throw new Error(result.error?.message || 'Invalid calculation result');
      }
    } catch (error) {
      window.Logger?.error?.('❌ Error calculating execution values', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      throw error;
    }
  }

  /**
   * Calculate average price from multiple executions using backend business logic service.
   * Uses UnifiedCacheManager for caching results (30s TTL).
   * @param {Array} executions - Array of execution objects with quantity and price
   * @returns {Promise<Object>} Calculated values: {average_price, total_quantity, total_amount}
   */
  async function calculateAveragePrice(executions = []) {
    // Create cache key from executions array (sorted for consistency)
    // Use spread operator to avoid mutating the input array
    const executionsKey = JSON.stringify([...executions].sort((a, b) => (a.id || 0) - (b.id || 0)));
    const cacheKey = `business:calculate-average-price:${executionsKey}`;
    
    try {
      // Use CacheTTLGuard for automatic cache management
      if (window.CacheTTLGuard?.ensure) {
        return await window.CacheTTLGuard.ensure(cacheKey, async () => {
          const response = await fetch('/api/business/execution/calculate-average-price', {
            method: 'POST',
            headers: DEFAULT_HEADERS,
            body: JSON.stringify({ executions })
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();
          if (result.status === 'success' && result.data) {
            return result.data;
          } else {
            throw new Error(result.error?.message || 'Invalid calculation result');
          }
        }, { ttl: 30 * 1000 });
      }
      
      // Fallback if CacheTTLGuard not available
      const response = await fetch('/api/business/execution/calculate-average-price', {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ executions })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      if (result.status === 'success' && result.data) {
        return result.data;
      } else {
        throw new Error(result.error?.message || 'Invalid calculation result');
      }
    } catch (error) {
      window.Logger?.error?.('❌ Error calculating average price', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      throw error;
    }
  }

  /**
   * Validate execution data using backend business logic service.
   * Uses UnifiedCacheManager for caching results (60s TTL).
   * @param {Object} executionData - Execution data to validate
   * @returns {Promise<Object>} Validation result: {is_valid, errors}
   */
  async function validateExecution(executionData) {
    // Use optimized cache key generation
    const cacheKey = window.CacheKeyHelper?.generateCacheKeyFromObject 
      ? window.CacheKeyHelper.generateCacheKeyFromObject('business:validate-execution', executionData)
      : `business:validate-execution:${JSON.stringify(executionData)}`;
    
    try {
      // Use CacheTTLGuard for automatic cache management
      if (window.CacheTTLGuard?.ensure) {
        return await window.CacheTTLGuard.ensure(cacheKey, async () => {
          const response = await fetch('/api/business/execution/validate', {
            method: 'POST',
            headers: DEFAULT_HEADERS,
            body: JSON.stringify(executionData)
          });

          if (!response.ok) {
            const errorData = await response.json();
            return {
              is_valid: false,
              errors: errorData.error?.errors || [errorData.error?.message || 'Validation failed']
            };
          }

          const result = await response.json();
          return {
            is_valid: result.status === 'success',
            errors: []
          };
        }, { ttl: 60 * 1000 });
      }
      
      // Fallback if CacheTTLGuard not available
      const response = await fetch('/api/business/execution/validate', {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(executionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          is_valid: false,
          errors: errorData.error?.errors || [errorData.error?.message || 'Validation failed']
        };
      }

      const result = await response.json();
      return {
        is_valid: result.status === 'success',
        errors: []
      };
    } catch (error) {
      window.Logger?.error?.('❌ Error validating execution', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      return {
        is_valid: false,
        errors: [error.message || 'Validation error']
      };
    }
  }

  window.ExecutionsData = {
    KEY: EXECUTIONS_DATA_KEY,
    TTL: EXECUTIONS_TTL,
    loadExecutionsData,
    fetchFresh: fetchExecutionsFromApi,
    saveCache: saveExecutionsCache,
    invalidateCache: invalidateExecutionsCache,
    clearPattern: () => clearExecutionsCache(true),
    createExecution,
    updateExecution,
    deleteExecution,
    fetchExecutionDetails,
    // Business logic API wrappers
    calculateExecutionValues,
    calculateAveragePrice,
    validateExecution,
  };

  window.Logger?.info?.('✅ Executions Data Service initialized', PAGE_LOG_CONTEXT);
})();


