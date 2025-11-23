/**
 * Tickers Data Service
 * ======================================
 * Unified loader for tickers data with cache + TTL guard integration.
 *
 * Responsibilities:
 * - Load tickers list via API (with cache bust for local file protocol)
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
 * - saveTickersCache(data, options) - Save tickers to cache
 * - invalidateTickersCache() - Invalidate tickers cache (uses CacheSyncManager)
 * - clearTickersCache(patternOnly) - Clear tickers cache
 *
 * DATA LOADING:
 * - fetchTickersFromApi({ signal }) - Fetch tickers from API
 * - loadTickersData(options) - Load tickers with cache support
 *
 * CRUD OPERATIONS:
 * - createTicker(payload, options) - Create new ticker
 * - updateTicker(tickerId, payload, options) - Update existing ticker
 * - deleteTicker(tickerId, options) - Delete ticker
 * - fetchTickerDetails(tickerId, options) - Fetch single ticker details
 * - sendTickerMutation({ tickerId, method, payload, signal }) - Generic mutation handler
 *
 * @version 2.0.0
 * @created November 2025
 * @author TikTrack Development Team
 */
(function tickersDataService() {
  const TICKERS_DATA_KEY = 'tickers-data';
  const TICKERS_TTL = 45 * 1000; // 45 seconds per audit plan
  const PAGE_LOG_CONTEXT = { page: 'tickers-data' };

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

  function normalizeTickersPayload(payload) {
    const records = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.records)
          ? payload.records
          : [];

    return records.map((ticker) => ({
      ...ticker,
      updated_at:
        ticker.updated_at ||
        ticker.created_at ||
        null,
    }));
  }

  async function saveTickersCache(data, options = {}) {
    if (!window.UnifiedCacheManager?.save) {
      return;
    }
    const ttl = options.ttl ?? TICKERS_TTL;
    try {
      await window.UnifiedCacheManager.save(TICKERS_DATA_KEY, data, { ttl });
    } catch (error) {
      window.Logger?.warn?.('Failed to save tickers cache', { ...PAGE_LOG_CONTEXT, error: error?.message });
    }
  }

  async function invalidateTickersCache() {
    // Try CacheSyncManager first (preferred method)
    if (window.CacheSyncManager?.invalidateByAction) {
      try {
        await window.CacheSyncManager.invalidateByAction('ticker-updated');
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
      await window.UnifiedCacheManager.invalidate(TICKERS_DATA_KEY).catch((error) => {
        window.Logger?.warn?.('⚠️ Failed to invalidate tickers cache', {
          ...PAGE_LOG_CONTEXT,
          error: error?.message,
        });
      });
      return;
    }
    if (typeof window.UnifiedCacheManager.clearByPattern === 'function') {
      await window.UnifiedCacheManager.clearByPattern(TICKERS_DATA_KEY).catch((error) => {
        window.Logger?.warn?.('⚠️ Failed to clear tickers cache pattern', {
          ...PAGE_LOG_CONTEXT,
          error: error?.message,
        });
      });
    }
  }

  async function clearTickersCache(patternOnly = false) {
    if (patternOnly) {
      if (window.UnifiedCacheManager?.clearByPattern) {
        await window.UnifiedCacheManager.clearByPattern(TICKERS_DATA_KEY).catch(() => {});
      }
      return;
    }
    if (window.UnifiedCacheManager?.invalidate) {
      await window.UnifiedCacheManager.invalidate(TICKERS_DATA_KEY).catch(() => {});
    }
  }

  function notifyLoadError(message, error) {
    window.Logger?.error?.('❌ Tickers load error', {
      ...PAGE_LOG_CONTEXT,
      message,
      error: error?.message || error,
    });
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה בטעינת טיקרים', message);
    }
  }

  async function fetchTickersFromApi({ signal } = {}) {
    const base = resolveBaseUrl();
    const separator = base.endsWith('/') ? '' : '/';
    const url = `${base}${separator}api/tickers/?_ts=${Date.now()}`;
    const response = await fetch(url, { method: 'GET', headers: DEFAULT_HEADERS, signal });
    if (!response.ok) {
      const error = new Error(`Ticker load failed (${response.status})`);
      notifyLoadError(error.message, error);
      throw error;
    }
    const payload = await response.json();
    const normalized = normalizeTickersPayload(payload);
    await saveTickersCache(normalized);
    return normalized;
  }

  async function loadTickersData(options = {}) {
    const { force = false, ttl = TICKERS_TTL, signal } = options;
    const loader = async () => {
      const fresh = await fetchTickersFromApi({ signal });
      return fresh;
    };

    try {
      if (force) {
        await clearTickersCache(true);
        return await loader();
      }

      if (window.CacheTTLGuard?.ensure) {
        const cached = await window.CacheTTLGuard.ensure(TICKERS_DATA_KEY, loader, {
          ttl,
          afterRead: (data) => {
            if (Array.isArray(data)) {
              window.Logger?.debug?.('Tickers served from cache', { ...PAGE_LOG_CONTEXT, count: data.length });
            }
          },
          afterLoad: (data) => {
            window.Logger?.debug?.('Tickers loaded from API', {
              ...PAGE_LOG_CONTEXT,
              count: Array.isArray(data) ? data.length : 0,
            });
          },
        });
        return Array.isArray(cached) ? cached : cached || [];
      }

      if (window.UnifiedCacheManager?.get) {
        const cached = await window.UnifiedCacheManager.get(TICKERS_DATA_KEY, { ttl });
        if (cached) {
          return Array.isArray(cached) ? cached : cached || [];
        }
      }

      return await loader();
    } catch (error) {
      notifyLoadError('שגיאה בטעינת טיקרים', error);
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

  async function sendTickerMutation({ tickerId, method, payload, signal }) {
    const endpoint = tickerId ? `/api/tickers/${tickerId}` : '/api/tickers';
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
          const action = method === 'POST' ? 'ticker-created' :
                        method === 'PUT' ? 'ticker-updated' :
                        method === 'DELETE' ? 'ticker-deleted' : 'ticker-updated';
          try {
            await window.CacheSyncManager.invalidateByAction(action);
          } catch (error) {
            // Fallback to direct invalidation
            await invalidateTickersCache();
          }
        } else {
          await invalidateTickersCache();
        }
      }

      return response;
    } catch (error) {
      window.Logger?.error?.('❌ Ticker mutation failed', {
        ...PAGE_LOG_CONTEXT,
        tickerId,
        method,
        error: error?.message,
      });
      throw error;
    }
  }

  async function createTicker(payload, options = {}) {
    return sendTickerMutation({ method: 'POST', payload, signal: options.signal });
  }

  async function updateTicker(tickerId, payload, options = {}) {
    return sendTickerMutation({
      tickerId,
      method: 'PUT',
      payload,
      signal: options.signal,
    });
  }

  async function deleteTicker(tickerId, options = {}) {
    return sendTickerMutation({
      tickerId,
      method: 'DELETE',
      signal: options.signal,
    });
  }

  async function fetchTickerDetails(tickerId, options = {}) {
    const response = await fetch(buildUrl(`/api/tickers/${tickerId}`), {
      method: 'GET',
      headers: DEFAULT_HEADERS,
      signal: options.signal,
    });

    if (!response.ok) {
      const error = new Error(`טעינת פרטי טיקר ${tickerId} נכשלה (${response.status})`);
      window.Logger?.error?.('❌ Failed to fetch ticker details', {
        ...PAGE_LOG_CONTEXT,
        tickerId,
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
   * Validate ticker data using backend business logic service.
   * Uses UnifiedCacheManager for caching results (60s TTL).
   * @param {Object} tickerData - Ticker data to validate
   * @returns {Promise<Object>} Validation result: {is_valid, errors}
   */
  async function validateTicker(tickerData) {
    const cacheKey = `business:validate-ticker:${JSON.stringify(tickerData)}`;
    
    try {
      // Use CacheTTLGuard for automatic cache management
      if (window.CacheTTLGuard?.ensure) {
        return await window.CacheTTLGuard.ensure(cacheKey, async () => {
          const response = await fetch('/api/business/ticker/validate', {
            method: 'POST',
            headers: DEFAULT_HEADERS,
            body: JSON.stringify(tickerData)
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
      const response = await fetch('/api/business/ticker/validate', {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(tickerData)
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
      window.Logger?.error?.('❌ Error validating ticker', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      return {
        is_valid: false,
        errors: [error?.message || 'Validation failed']
      };
    }
  }

  /**
   * Validate ticker symbol using backend business logic service.
   * Uses UnifiedCacheManager for caching results (60s TTL).
   * @param {string} symbol - Ticker symbol to validate
   * @returns {Promise<Object>} Validation result: {is_valid, errors}
   */
  async function validateTickerSymbol(symbol) {
    const cacheKey = `business:validate-ticker-symbol:${symbol}`;
    
    try {
      // Use CacheTTLGuard for automatic cache management
      if (window.CacheTTLGuard?.ensure) {
        return await window.CacheTTLGuard.ensure(cacheKey, async () => {
          const response = await fetch('/api/business/ticker/validate-symbol', {
            method: 'POST',
            headers: DEFAULT_HEADERS,
            body: JSON.stringify({ symbol })
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
      const response = await fetch('/api/business/ticker/validate-symbol', {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ symbol })
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
      window.Logger?.error?.('❌ Error validating ticker symbol', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      return {
        is_valid: false,
        errors: [error?.message || 'Validation failed']
      };
    }
  }

  window.TickersData = {
    KEY: TICKERS_DATA_KEY,
    TTL: TICKERS_TTL,
    loadTickersData,
    fetchFresh: fetchTickersFromApi,
    saveCache: saveTickersCache,
    invalidateCache: invalidateTickersCache,
    clearPattern: () => clearTickersCache(true),
    createTicker,
    updateTicker,
    deleteTicker,
    fetchTickerDetails,
    validateTicker,
    validateTickerSymbol,
  };

  window.Logger?.info?.('✅ Tickers Data Service initialized', PAGE_LOG_CONTEXT);
})();

