/**
 * Alerts Data Service
 * ======================================
 * Unified loader for alerts data with cache + TTL guard integration.
 *
 * Responsibilities:
 * - Load alerts list via API (with cache bust for local file protocol)
 * - Save results inside UnifiedCacheManager with a 45s TTL
 * - Provide forced reload + cache invalidation helpers
 * - Surface consistent errors through the global notification + log systems
 * - CRUD operations (create, update, delete, fetchDetails)
 * - CacheSyncManager integration for automatic cache invalidation
 *
 * Related Documentation:
 * - documentation/frontend/GENERAL_SYSTEMS_LIST.md
 * - documentation/04-FEATURES/CORE/CACHE_SYNC_SPECIFICATION.md
 *
 * Function Index:
 * ==============
 *
 * CACHE MANAGEMENT:
 * - saveAlertsCache(data, options) - Save alerts to cache
 * - invalidateAlertsCache() - Invalidate alerts cache (uses CacheSyncManager)
 * - clearAlertsCache(patternOnly) - Clear alerts cache
 *
 * DATA LOADING:
 * - fetchAlertsFromApi({ signal }) - Fetch alerts from API
 * - loadAlertsData(options) - Load alerts with cache support
 *
 * CRUD OPERATIONS:
 * - createAlert(payload, options) - Create new alert
 * - updateAlert(alertId, payload, options) - Update existing alert
 * - deleteAlert(alertId, options) - Delete alert
 * - fetchAlertDetails(alertId, options) - Fetch single alert details
 * - sendAlertMutation({ alertId, method, payload, signal }) - Generic mutation handler
 *
 * @version 2.0.0
 * @created November 2025
 * @author TikTrack Development Team
 */
(function alertsDataService() {
  const ALERTS_DATA_KEY = 'alerts-data';
  const ALERTS_TTL = 45 * 1000; // 45 seconds per audit plan
  const PAGE_LOG_CONTEXT = { page: 'alerts-data' };

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

  function normalizeAlertsPayload(payload) {
    const records = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.records)
          ? payload.records
          : [];

    return records.map((alert) => ({
      ...alert,
      updated_at:
        alert.updated_at ||
        alert.triggered_at ||
        alert.created_at ||
        alert.last_evaluated_at ||
        null,
    }));
  }

  async function saveAlertsCache(data, options = {}) {
    if (!window.UnifiedCacheManager?.save) {
      return;
    }
    const ttl = options.ttl ?? ALERTS_TTL;
    try {
      await window.UnifiedCacheManager.save(ALERTS_DATA_KEY, data, { ttl });
    } catch (error) {
      window.Logger?.warn?.('Failed to save alerts cache', { ...PAGE_LOG_CONTEXT, error: error?.message });
    }
  }

  async function invalidateAlertsCache() {
    // Try CacheSyncManager first (preferred method)
    if (window.CacheSyncManager?.invalidateByAction) {
      try {
        await window.CacheSyncManager.invalidateByAction('alert-updated');
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
      await window.UnifiedCacheManager.invalidate(ALERTS_DATA_KEY).catch((error) => {
        window.Logger?.warn?.('⚠️ Failed to invalidate alerts cache', {
          ...PAGE_LOG_CONTEXT,
          error: error?.message,
        });
      });
      return;
    }
    if (typeof window.UnifiedCacheManager.clearByPattern === 'function') {
      await window.UnifiedCacheManager.clearByPattern(ALERTS_DATA_KEY).catch((error) => {
        window.Logger?.warn?.('⚠️ Failed to clear alerts cache pattern', {
          ...PAGE_LOG_CONTEXT,
          error: error?.message,
        });
      });
    }
  }

  async function clearAlertsCache(patternOnly = false) {
    if (patternOnly) {
      if (window.UnifiedCacheManager?.clearByPattern) {
        await window.UnifiedCacheManager.clearByPattern(ALERTS_DATA_KEY).catch(() => {});
      }
      return;
    }
    if (window.UnifiedCacheManager?.invalidate) {
      await window.UnifiedCacheManager.invalidate(ALERTS_DATA_KEY).catch(() => {});
    }
  }

  function notifyLoadError(message, error) {
    window.Logger?.error?.('❌ Alerts load error', {
      ...PAGE_LOG_CONTEXT,
      message,
      error: error?.message || error,
    });
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה בטעינת התראות', message);
    }
  }

  async function fetchAlertsFromApi({ signal } = {}) {
    const base = resolveBaseUrl();
    const separator = base.endsWith('/') ? '' : '/';
    const url = `${base}${separator}api/alerts/?_ts=${Date.now()}`;
    const response = await fetch(url, { 
      method: 'GET', 
      headers: DEFAULT_HEADERS, 
      signal, // Include cookies for session-based auth
    });
    
    // Handle 401/308 authentication errors
    if (window.checkAndHandleAuthError && window.checkAndHandleAuthError(response, url)) {
      throw new Error('Authentication required');
    }
    
    if (!response.ok) {
      // Soft-fail for auth/validation errors to avoid page crash
      if (response.status === 400 || response.status === 401 || response.status === 403) {
        const softError = new Error(`Alert load failed (${response.status})`);
        notifyLoadError(softError.message, softError);
        return [];
      }
      const error = new Error(`Alert load failed (${response.status})`);
      notifyLoadError(error.message, error);
      throw error;
    }
    const payload = await response.json();
    const normalized = normalizeAlertsPayload(payload);
    await saveAlertsCache(normalized);
    return normalized;
  }

  async function loadAlertsData(options = {}) {
    const { force = false, ttl = ALERTS_TTL, signal } = options;
    const loader = async () => {
      const fresh = await fetchAlertsFromApi({ signal });
      return fresh;
    };

    try {
      if (force) {
        await clearAlertsCache(true);
        return await loader();
      }

      if (window.CacheTTLGuard?.ensure) {
        const cached = await window.CacheTTLGuard.ensure(ALERTS_DATA_KEY, loader, {
          ttl,
          afterRead: (data) => {
            if (Array.isArray(data)) {
              window.Logger?.debug?.('Alerts served from cache', { ...PAGE_LOG_CONTEXT, count: data.length });
            }
          },
          afterLoad: (data) => {
            window.Logger?.debug?.('Alerts loaded from API', {
              ...PAGE_LOG_CONTEXT,
              count: Array.isArray(data) ? data.length : 0,
            });
          },
        });
        return Array.isArray(cached) ? cached : cached || [];
      }

      if (window.UnifiedCacheManager?.get) {
        const cached = await window.UnifiedCacheManager.get(ALERTS_DATA_KEY, { ttl });
        if (cached) {
          return Array.isArray(cached) ? cached : cached || [];
        }
      }

      return await loader();
    } catch (error) {
      notifyLoadError('שגיאה בטעינת התראות', error);
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

  async function sendAlertMutation({ alertId, method, payload, signal }) {
    const endpoint = alertId ? `/api/alerts/${alertId}` : '/api/alerts';
    
    // Debug logging
    console.group('🔍 [sendAlertMutation] Alert Mutation Debug');
    console.log('📋 Endpoint:', endpoint);
    console.log('📋 Method:', method);
    console.log('📋 Payload:', payload);
    console.log('📋 Payload JSON:', JSON.stringify(payload, null, 2));
    
    try {
      const response = await fetch(buildUrl(endpoint), {
        method,
        headers: DEFAULT_HEADERS,
        body: payload ? JSON.stringify(payload) : undefined,
        signal,
      });

      console.log('📋 Response status:', response.status);
      console.log('📋 Response ok:', response.ok);
      
      if (!response.ok) {
        // Try to get error details
        try {
          const responseText = await response.clone().text();
          console.error('❌ Error response text:', responseText);
          let errorData;
          try {
            errorData = JSON.parse(responseText);
            console.error('❌ Error data:', errorData);
            console.error('❌ Error message:', errorData.message || errorData.error);
          } catch (parseError) {
            console.error('❌ Failed to parse error:', parseError);
          }
        } catch (errorReadError) {
          console.error('❌ Failed to read error response:', errorReadError);
        }
      }

      if (response.ok) {
        // Determine action based on method
        if (window.CacheSyncManager?.invalidateByAction) {
          const action = method === 'POST' ? 'alert-created' :
                        method === 'PUT' ? 'alert-updated' :
                        method === 'DELETE' ? 'alert-deleted' : 'alert-updated';
          try {
            await window.CacheSyncManager.invalidateByAction(action);
          } catch (error) {
            // Fallback to direct invalidation
            await invalidateAlertsCache();
          }
        } else {
          await invalidateAlertsCache();
        }
      }

      console.groupEnd();
      return response;
    } catch (error) {
      console.error('❌ [sendAlertMutation] Error:', error);
      console.groupEnd();
      window.Logger?.error?.('❌ Alert mutation failed', {
        ...PAGE_LOG_CONTEXT,
        alertId,
        method,
        error: error?.message,
      });
      throw error;
    }
  }

  async function createAlert(payload, options = {}) {
    return sendAlertMutation({ method: 'POST', payload, signal: options.signal });
  }

  async function updateAlert(alertId, payload, options = {}) {
    return sendAlertMutation({
      alertId,
      method: 'PUT',
      payload,
      signal: options.signal,
    });
  }

  async function deleteAlert(alertId, options = {}) {
    return sendAlertMutation({
      alertId,
      method: 'DELETE',
      signal: options.signal,
    });
  }

  async function fetchAlertDetails(alertId, options = {}) {
    const response = await fetch(buildUrl(`/api/alerts/${alertId}`), {
      method: 'GET',
      headers: DEFAULT_HEADERS,
      signal: options.signal,
    });

    if (!response.ok) {
      const error = new Error(`טעינת פרטי התראה ${alertId} נכשלה (${response.status})`);
      window.Logger?.error?.('❌ Failed to fetch alert details', {
        ...PAGE_LOG_CONTEXT,
        alertId,
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
   * Validate alert data using backend business logic service.
   * Uses UnifiedCacheManager for caching results (60s TTL).
   * @param {Object} alertData - Alert data to validate
   * @returns {Promise<Object>} Validation result: {is_valid, errors}
   */
  async function validateAlert(alertData) {
    // Use optimized cache key generation
    const cacheKey = window.CacheKeyHelper?.generateCacheKeyFromObject 
      ? window.CacheKeyHelper.generateCacheKeyFromObject('business:validate-alert', alertData)
      : `business:validate-alert:${JSON.stringify(alertData)}`;
    
    try {
      // Use CacheTTLGuard for automatic cache management
      if (window.CacheTTLGuard?.ensure) {
        return await window.CacheTTLGuard.ensure(cacheKey, async () => {
          const response = await fetch('/api/business/alert/validate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alertData)
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
      const response = await fetch('/api/business/alert/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(alertData)
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
      window.Logger?.error?.('❌ Error validating alert', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      return {
        is_valid: false,
        errors: [error.message || 'Validation error']
      };
    }
  }

  /**
   * Validate condition value using backend business logic service.
   * Uses UnifiedCacheManager for caching results (60s TTL).
   * @param {string} conditionAttribute - Condition attribute type ('price', 'change', 'volume')
   * @param {number} conditionNumber - Condition numeric value
   * @returns {Promise<Object>} Validation result: {is_valid, error}
   */
  async function validateConditionValue(conditionAttribute, conditionNumber) {
    const cacheKey = `business:validate-condition-value:${conditionAttribute}:${conditionNumber}`;
    
    try {
      // Use CacheTTLGuard for automatic cache management
      if (window.CacheTTLGuard?.ensure) {
        return await window.CacheTTLGuard.ensure(cacheKey, async () => {
          const response = await fetch('/api/business/alert/validate-condition-value', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              condition_attribute: conditionAttribute,
              condition_number: conditionNumber
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            return {
              is_valid: false,
              error: errorData.error?.message || 'Validation failed'
            };
          }

          const result = await response.json();
          return {
            is_valid: result.status === 'success',
            error: null
          };
        }, { ttl: 60 * 1000 });
      }
      
      // Fallback if CacheTTLGuard not available
      const response = await fetch('/api/business/alert/validate-condition-value', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          condition_attribute: conditionAttribute,
          condition_number: conditionNumber
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          is_valid: false,
          error: errorData.error?.message || 'Validation failed'
        };
      }

      const result = await response.json();
      return {
        is_valid: result.status === 'success',
        error: null
      };
    } catch (error) {
      window.Logger?.error?.('❌ Error validating condition value', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      return {
        is_valid: false,
        error: error.message || 'Validation error'
      };
    }
  }

  window.AlertsData = {
    KEY: ALERTS_DATA_KEY,
    TTL: ALERTS_TTL,
    loadAlertsData,
    fetchFresh: fetchAlertsFromApi,
    saveCache: saveAlertsCache,
    invalidateCache: invalidateAlertsCache,
    clearPattern: () => clearAlertsCache(true),
    createAlert,
    updateAlert,
    deleteAlert,
    fetchAlertDetails,
    // Business logic API wrappers
    validateAlert,
    validateConditionValue,
  };

  window.Logger?.info?.('✅ Alerts Data Service initialized', PAGE_LOG_CONTEXT);
})();

