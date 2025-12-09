/**
 * Cash Flows Data Service
 * =======================
 * Unified loader + CRUD helper for cash flow entities (including currency exchanges).
 * Ensures every operation uses UnifiedCacheManager + CacheTTLGuard policies.
 */
(function cashFlowsDataService() {
  const CACHE_KEY = 'cash-flows-data';
  const DEFAULT_TTL = 60 * 1000; // 60 seconds
  const PAGE_LOG_CONTEXT = { page: 'cash-flows-data' };

  const DEFAULT_HEADERS = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  };

  const ENDPOINTS = {
    list: '/api/cash-flows/',
    detail: (id) => `/api/cash-flows/${id}`,
    exchange: '/api/cash-flows/exchange',
    exchangeDetail: (exchangeId) => `/api/cash-flows/exchange/${exchangeId}`,
  };

  function resolveBaseUrl() {
    if (typeof window.API_BASE_URL === 'string' && window.API_BASE_URL.length > 0) {
      return window.API_BASE_URL.endsWith('/') ? window.API_BASE_URL : `${window.API_BASE_URL}/`;
    }
    if (window.location?.origin && window.location.origin !== 'null') {
      return window.location.origin.endsWith('/')
        ? window.location.origin
        : `${window.location.origin}/`;
    }
    return '';
  }

  function buildUrl(path) {
    const base = resolveBaseUrl();
    if (!base || path.startsWith('http')) {
      return path;
    }
    return `${base}${path.replace(/^\//, '')}`;
  }

  function buildUrlWithParams(path, params = {}) {
    const url = new URL(buildUrl(path), window.location?.origin || 'http://127.0.0.1:8080');
    const searchParams = new URLSearchParams(params);
    if (!searchParams.has('_t')) {
      searchParams.set('_t', Date.now().toString());
    }
    url.search = searchParams.toString();
    return url.toString();
  }

  function normalizeCashFlowRecord(record) {
    if (!record || typeof record !== 'object') {
      return null;
    }
    const updatedAt =
      record.updated_at ||
      record.last_activity_at ||
      record.date ||
      record.created_at ||
      null;
    const amount =
      typeof record.amount === 'string' ? Number(record.amount) : record.amount ?? 0;
    return {
      ...record,
      amount,
      updated_at: updatedAt,
    };
  }

  function normalizeCashFlowsPayload(payload) {
    const rows = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.records)
          ? payload.records
          : [];
    return rows
      .map(normalizeCashFlowRecord)
      .filter(Boolean);
  }

  async function saveCache(data, options = {}) {
    if (!window.UnifiedCacheManager?.save) {
      return;
    }
    const ttl = options.ttl ?? DEFAULT_TTL;
    try {
      await window.UnifiedCacheManager.save(CACHE_KEY, data, { ttl });
    } catch (error) {
      window.Logger?.warn?.('⚠️ Failed to save cash flows cache', {
        ...PAGE_LOG_CONTEXT,
        error: error?.message,
      });
    }
  }

  async function invalidateCache() {
    // Try CacheSyncManager first (preferred method)
    if (window.CacheSyncManager?.invalidateByAction) {
      try {
        await window.CacheSyncManager.invalidateByAction('cash-flow-updated');
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
      await window.UnifiedCacheManager.invalidate(CACHE_KEY).catch((error) => {
        window.Logger?.warn?.('⚠️ Failed to invalidate cash flows cache', {
          ...PAGE_LOG_CONTEXT,
          error: error?.message,
        });
      });
      return;
    }
    if (typeof window.UnifiedCacheManager.clearByPattern === 'function') {
      await window.UnifiedCacheManager.clearByPattern(CACHE_KEY).catch((error) => {
        window.Logger?.warn?.('⚠️ Failed to clear cash flows cache pattern', {
          ...PAGE_LOG_CONTEXT,
          error: error?.message,
        });
      });
    }
  }

  async function clearCachePattern() {
    if (typeof window.UnifiedCacheManager?.clearByPattern === 'function') {
      await window.UnifiedCacheManager.clearByPattern(CACHE_KEY).catch((error) => {
        window.Logger?.warn?.('⚠️ Failed to clear cash flows cache pattern', {
          ...PAGE_LOG_CONTEXT,
          error: error?.message,
        });
      });
    }
  }

  function notifyLoadError(message, error) {
    const description = error?.message || message || 'שגיאה בטעינת תזרימי מזומנים';
    window.Logger?.error?.('❌ Cash flows load failed', {
      ...PAGE_LOG_CONTEXT,
      error: description,
    });
    window.showErrorNotification?.('שגיאה', `${description} – הנתונים לא זמינים כרגע`);
  }

  async function fetchCashFlowsFromApi(options = {}) {
    const { signal, ttl = DEFAULT_TTL, queryParams } = options;
    const url = buildUrlWithParams(ENDPOINTS.list, queryParams);
    const response = await fetch(url, {
      method: 'GET',
      headers: DEFAULT_HEADERS,
      signal,
      credentials: 'include' // Include cookies for session-based auth
    });

    // Handle 401/308 authentication errors
    if (response.status === 401 || response.status === 308) {
      // Clear any stale auth data using UnifiedCacheManager
      if (window.UnifiedCacheManager) {
        try {
          await window.UnifiedCacheManager.remove('currentUser');
          await window.UnifiedCacheManager.remove('authToken');
        } catch (e) {
          console.warn('Error clearing auth cache:', e);
          // Fallback to localStorage
          localStorage.removeItem('currentUser');
          localStorage.removeItem('authToken');
        }
      } else {
        // Fallback to localStorage if UnifiedCacheManager not available
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
      }
      
      // Show error notification
      if (window.NotificationSystem) {
        window.NotificationSystem.showError(
          'נדרשת התחברות',
          'עליך להתחבר למערכת כדי לצפות בנתונים. אנא התחבר כדי להמשיך.',
          'system'
        );
      }
      
      // Try to show login modal
      if (typeof window.TikTrackAuth?.showLoginModal === 'function') {
        window.TikTrackAuth.showLoginModal(() => {
          window.location.reload();
        });
      } else if (typeof window.AuthGuard?.redirectToLogin === 'function') {
        window.AuthGuard.redirectToLogin();
      } else {
        const currentPath = window.location.pathname;
        const loginPath = currentPath.includes('trading-ui') 
          ? 'trading-ui/login.html' 
          : 'login.html';
        window.location.href = loginPath;
      }
      
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const error = new Error(`טעינת תזרימים נכשלה (${response.status})`);
      notifyLoadError(error.message, error);
      throw error;
    }

    const payload = await response.json();
    const normalized = normalizeCashFlowsPayload(payload);
    await saveCache(normalized, { ttl });
    return normalized;
  }

  async function loadCashFlowsData(options = {}) {
    const { force = false, ttl = DEFAULT_TTL, signal, queryParams } = options;
    const loader = () =>
      fetchCashFlowsFromApi({
        signal,
        ttl,
        queryParams,
      });

    try {
      if (force) {
        await clearCachePattern();
        return await loader();
      }

      if (window.CacheTTLGuard?.ensure) {
        const cached = await window.CacheTTLGuard.ensure(CACHE_KEY, loader, {
          ttl,
          afterRead: (cachedData) => {
            if (Array.isArray(cachedData)) {
              window.Logger?.debug?.('📦 Cash flows served from cache', {
                ...PAGE_LOG_CONTEXT,
                count: cachedData.length,
              });
            }
          },
          afterLoad: (freshData) => {
            window.Logger?.debug?.('🔄 Cash flows fetched from API', {
              ...PAGE_LOG_CONTEXT,
              count: Array.isArray(freshData) ? freshData.length : 0,
            });
          },
        });
        if (cached) {
          if (Array.isArray(cached)) {
            return cached;
          }
          if (Array.isArray(cached?.data)) {
            return cached.data;
          }
        }
      }

      if (window.UnifiedCacheManager?.get) {
        try {
          const cached = await window.UnifiedCacheManager.get(CACHE_KEY, { ttl });
          if (cached) {
            return Array.isArray(cached) ? cached : Array.isArray(cached?.data) ? cached.data : [];
          }
        } catch (error) {
          window.Logger?.warn?.('⚠️ Failed to read cash flows cache', {
            ...PAGE_LOG_CONTEXT,
            error: error?.message,
          });
        }
      }

      return await loader();
    } catch (error) {
      notifyLoadError('שגיאה בטעינת תזרימי מזומנים', error);
      throw error;
    }
  }

  async function sendCashFlowMutation({ cashFlowId, method, payload, signal }) {
    const endpoint = cashFlowId ? ENDPOINTS.detail(cashFlowId) : ENDPOINTS.list;
    try {
      const response = await fetch(buildUrl(endpoint), {
        method,
        headers: DEFAULT_HEADERS,
        body: payload ? JSON.stringify(payload) : undefined,
        signal,
      });

      if (response.ok) {
        const result = await response.json().catch(() => ({}));
        // Determine action based on method
        if (window.CacheSyncManager?.invalidateByAction) {
          const action = method === 'POST' ? 'cash-flow-created' :
                        method === 'PUT' ? 'cash-flow-updated' :
                        method === 'DELETE' ? 'cash-flow-deleted' : 'cash-flow-updated';
          try {
            await window.CacheSyncManager.invalidateByAction(action);
          } catch (error) {
            // Fallback to direct invalidation
            await invalidateCache();
          }
        } else {
          await invalidateCache();
        }
      }

      return response;
    } catch (error) {
      window.Logger?.error?.('❌ Cash flow mutation failed', {
        ...PAGE_LOG_CONTEXT,
        cashFlowId,
        method,
        error: error?.message,
      });
      throw error;
    }
  }

  async function createCashFlow(payload, options = {}) {
    return sendCashFlowMutation({ method: 'POST', payload, signal: options.signal });
  }

  async function updateCashFlow(cashFlowId, payload, options = {}) {
    return sendCashFlowMutation({
      cashFlowId,
      method: 'PUT',
      payload,
      signal: options.signal,
    });
  }

  async function deleteCashFlow(cashFlowId, options = {}) {
    return sendCashFlowMutation({
      cashFlowId,
      method: 'DELETE',
      signal: options.signal,
    });
  }

  async function fetchCashFlowDetails(cashFlowId, options = {}) {
    const response = await fetch(buildUrl(ENDPOINTS.detail(cashFlowId)), {
      method: 'GET',
      headers: DEFAULT_HEADERS,
      signal: options.signal,
    });

    if (!response.ok) {
      const error = new Error(`טעינת פרטי תזרים מזומנים ${cashFlowId} נכשלה (${response.status})`);
      window.Logger?.error?.('❌ Failed to fetch cash flow details', {
        ...PAGE_LOG_CONTEXT,
        cashFlowId,
        error: error.message,
      });
      throw error;
    }

    return response.json();
  }

  async function sendExchangeMutation({ exchangeId, method, payload, signal }) {
    const endpoint = exchangeId ? ENDPOINTS.exchangeDetail(exchangeId) : ENDPOINTS.exchange;
    try {
      const response = await fetch(buildUrl(endpoint), {
        method,
        headers: DEFAULT_HEADERS,
        body: payload ? JSON.stringify(payload) : undefined,
        signal,
      });

      if (response.ok) {
        // Currency exchange also affects cash flows cache
        if (window.CacheSyncManager?.invalidateByAction) {
          try {
            await window.CacheSyncManager.invalidateByAction('cash-flow-updated');
          } catch (error) {
            await invalidateCache();
          }
        } else {
          await invalidateCache();
        }
      }

      return response;
    } catch (error) {
      window.Logger?.error?.('❌ Currency exchange mutation failed', {
        ...PAGE_LOG_CONTEXT,
        exchangeId,
        method,
        error: error?.message,
      });
      throw error;
    }
  }

  async function createCurrencyExchange(payload, options = {}) {
    return sendExchangeMutation({ method: 'POST', payload, signal: options.signal });
  }

  async function updateCurrencyExchange(exchangeId, payload, options = {}) {
    return sendExchangeMutation({ exchangeId, method: 'PUT', payload, signal: options.signal });
  }

  async function deleteCurrencyExchange(exchangeId, options = {}) {
    return sendExchangeMutation({ exchangeId, method: 'DELETE', signal: options.signal });
  }

  async function fetchCurrencyExchange(exchangeId, options = {}) {
    const response = await fetch(buildUrl(ENDPOINTS.exchangeDetail(exchangeId)), {
      method: 'GET',
      headers: DEFAULT_HEADERS,
      signal: options.signal,
    });

    if (!response.ok) {
      const error = new Error(`טעינת המרת מטבע ${exchangeId} נכשלה (${response.status})`);
      window.Logger?.error?.('❌ Failed to fetch currency exchange', {
        ...PAGE_LOG_CONTEXT,
        exchangeId,
        error: error.message,
      });
      throw error;
    }

    return response.json();
  }

  if (typeof window.CacheTTLGuard?.setConfig === 'function') {
    window.CacheTTLGuard.setConfig(CACHE_KEY, { ttl: DEFAULT_TTL });
  }

  // ========================================================================
  // Business Logic API Wrappers
  // ========================================================================

  /**
   * Validate cash flow data using backend business logic service.
   * Uses UnifiedCacheManager for caching results (60s TTL).
   * @param {Object} cashFlowData - Cash flow data to validate
   * @returns {Promise<Object>} Validation result: {is_valid, errors}
   */
  async function validateCashFlow(cashFlowData) {
    // Use optimized cache key generation
    const cacheKey = window.CacheKeyHelper?.generateCacheKeyFromObject 
      ? window.CacheKeyHelper.generateCacheKeyFromObject('business:validate-cash-flow', cashFlowData)
      : `business:validate-cash-flow:${JSON.stringify(cashFlowData)}`;
    
    try {
      // Use CacheTTLGuard for automatic cache management
      if (window.CacheTTLGuard?.ensure) {
        return await window.CacheTTLGuard.ensure(cacheKey, async () => {
          const response = await fetch('/api/business/cash-flow/validate', {
            method: 'POST',
            headers: DEFAULT_HEADERS,
            body: JSON.stringify(cashFlowData)
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
      const response = await fetch('/api/business/cash-flow/validate', {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(cashFlowData)
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
      window.Logger?.error?.('❌ Error validating cash flow', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      return {
        is_valid: false,
        errors: [error?.message || 'Validation failed']
      };
    }
  }

  /**
   * Calculate cash flow balance using backend business logic service.
   * Uses UnifiedCacheManager for caching results (30s TTL).
   * @param {number} accountId - Account ID
   * @param {Object} params - Additional parameters
   * @returns {Promise<Object>} Calculated balance
   */
  async function calculateCashFlowBalance(accountId, params = {}) {
    // Use optimized cache key generation
    const cacheKey = window.CacheKeyHelper?.generateCacheKey 
      ? window.CacheKeyHelper.generateCacheKey('business:calculate-cash-flow-balance', accountId, params)
      : `business:calculate-cash-flow-balance:${accountId}:${JSON.stringify(params)}`;
    
    try {
      // Use CacheTTLGuard for automatic cache management
      if (window.CacheTTLGuard?.ensure) {
        return await window.CacheTTLGuard.ensure(cacheKey, async () => {
          const response = await fetch('/api/business/cash-flow/calculate-balance', {
            method: 'POST',
            headers: DEFAULT_HEADERS,
            body: JSON.stringify({ account_id: accountId, ...params })
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
      const response = await fetch('/api/business/cash-flow/calculate-balance', {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({ account_id: accountId, ...params })
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
      window.Logger?.error?.('❌ Error calculating cash flow balance', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      throw error;
    }
  }

  /**
   * Calculate currency conversion using backend business logic service.
   * Uses UnifiedCacheManager for caching results (30s TTL).
   * @param {number} amount - Amount to convert
   * @param {string} fromCurrency - Source currency code
   * @param {string} toCurrency - Target currency code
   * @returns {Promise<Object>} Conversion result
   */
  async function calculateCurrencyConversion(amount, fromCurrency, toCurrency) {
    const cacheKey = `business:calculate-currency-conversion:${amount}:${fromCurrency}:${toCurrency}`;
    
    try {
      // Use CacheTTLGuard for automatic cache management
      if (window.CacheTTLGuard?.ensure) {
        return await window.CacheTTLGuard.ensure(cacheKey, async () => {
          const response = await fetch('/api/business/cash-flow/calculate-currency-conversion', {
            method: 'POST',
            headers: DEFAULT_HEADERS,
            body: JSON.stringify({
              amount,
              from_currency: fromCurrency,
              to_currency: toCurrency
            })
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
      const response = await fetch('/api/business/cash-flow/calculate-currency-conversion', {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify({
          amount,
          from_currency: fromCurrency,
          to_currency: toCurrency
        })
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
      window.Logger?.error?.('❌ Error calculating currency conversion', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      throw error;
    }
  }

  window.CashFlowsData = {
    KEY: CACHE_KEY,
    TTL: DEFAULT_TTL,
    loadCashFlowsData,
    fetchFresh: fetchCashFlowsFromApi,
    saveCache,
    invalidateCache,
    clearPattern: clearCachePattern,
    createCashFlow,
    updateCashFlow,
    deleteCashFlow,
    fetchCashFlowDetails,
    createCurrencyExchange,
    updateCurrencyExchange,
    deleteCurrencyExchange,
    fetchCurrencyExchange,
    validateCashFlow,
    calculateCashFlowBalance,
    calculateCurrencyConversion,
  };

  window.Logger?.info?.('✅ Cash Flows Data Service initialized', PAGE_LOG_CONTEXT);
})();


