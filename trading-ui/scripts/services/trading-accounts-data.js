/**
 * Trading Accounts Data Service
 * ======================================
 * Unified loader + CRUD helper for trading accounts.
 * Enforces cache usage (UnifiedCacheManager + CacheTTLGuard) and
 * exposes helpers for create/update/delete flows.
 */
(function tradingAccountsDataService() {

// ===== FUNCTION INDEX =====

// === Initialization ===
// - buildUrl() - Buildurl
// - createTradingAccount() - Createtradingaccount

// === Event Handlers ===
// - sendAccountMutation() - Sendaccountmutation

// === UI Functions ===
// - updateTradingAccount() - Updatetradingaccount

// === Data Functions ===
// - normalizeAccountsPayload() - Normalizeaccountspayload
// - saveAccountsCache() - Saveaccountscache
// - getCachedTradingAccounts() - Getcachedtradingaccounts
// - notifyLoadError() - Notifyloaderror
// - fetchTradingAccountsFromApi() - Fetchtradingaccountsfromapi
// - loadTradingAccountsData() - Loadtradingaccountsdata
// - fetchTradingAccount() - Fetchtradingaccount
// - fetchTradingAccountDetails() - Fetchtradingaccountdetails

// === Utility Functions ===
// - invalidateAccountsCache() - Invalidateaccountscache
// - validateTradingAccount() - Validatetradingaccount

// === Other ===
// - resolveBaseUrl() - Resolvebaseurl
// - clearAccountsCachePattern() - Clearaccountscachepattern
// - deleteTradingAccount() - Deletetradingaccount

  const PRIMARY_CACHE_KEY = 'trading-accounts-data';
  const LEGACY_CACHE_KEYS = ['accounts-data'];
  const ALL_CACHE_KEYS = [PRIMARY_CACHE_KEY, ...LEGACY_CACHE_KEYS];
  const DEFAULT_TTL = 60 * 1000; // 60 שניות
  const PAGE_LOG_CONTEXT = { page: 'trading-accounts-data' };

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

  function normalizeAccountsPayload(payload) {
    const records = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.records)
          ? payload.records
          : [];

    return records.map((account) => ({
      ...account,
      updated_at:
        account.updated_at ||
        account.last_activity_at ||
        account.last_activity ||
        account.created_at ||
        null
    }));
  }

  async function saveAccountsCache(data, options = {}) {
    if (!window.UnifiedCacheManager?.save) {
      return;
    }
    const ttl = options.ttl ?? DEFAULT_TTL;
    await Promise.all(
      ALL_CACHE_KEYS.map((key) =>
        window.UnifiedCacheManager.save(key, data, { ttl }).catch((error) => {
          window.Logger?.warn?.('Failed to save trading accounts cache', {
            ...PAGE_LOG_CONTEXT,
            key,
            error: error?.message,
          });
        })
      )
    );
  }

  async function invalidateAccountsCache() {
    // Try CacheSyncManager first (preferred method)
    if (window.CacheSyncManager?.invalidateByAction) {
      try {
        await window.CacheSyncManager.invalidateByAction('account-updated');
        return;
      } catch (error) {
        window.Logger?.warn?.('CacheSyncManager.invalidateByAction failed, falling back', {
          ...PAGE_LOG_CONTEXT,
          error: error?.message,
        });
      }
    }
    
    // Fallback to direct invalidation
    if (!window.UnifiedCacheManager) {
      return;
    }
    await Promise.all(
      ALL_CACHE_KEYS.map((key) =>
        window.UnifiedCacheManager.invalidate?.(key)?.catch?.((error) => {
          window.Logger?.warn?.('Failed to invalidate trading accounts cache', {
            ...PAGE_LOG_CONTEXT,
            key,
            error: error?.message,
          });
        })
      )
    );
  }

  async function clearAccountsCachePattern() {
    if (!window.UnifiedCacheManager?.clearByPattern) {
      return;
    }
    await Promise.all(
      ALL_CACHE_KEYS.map((key) =>
        window.UnifiedCacheManager.clearByPattern(key).catch((error) => {
          window.Logger?.warn?.('Failed to clear trading accounts cache pattern', {
            ...PAGE_LOG_CONTEXT,
            key,
            error: error?.message,
          });
        })
      )
    );
  }

  async function getCachedTradingAccounts(options = {}) {
    const ttl = options.ttl ?? DEFAULT_TTL;
    if (!window.UnifiedCacheManager?.get) {
      return null;
    }
    try {
      return await window.UnifiedCacheManager.get(PRIMARY_CACHE_KEY, { ttl });
    } catch (error) {
      window.Logger?.warn?.('Failed to read trading accounts cache', {
        ...PAGE_LOG_CONTEXT,
        error: error?.message,
      });
      return null;
    }
  }

  function notifyLoadError(message, error) {
    const details = error?.message || message || 'שגיאה בטעינת חשבונות מסחר';
    window.Logger?.error?.('Trading accounts load failed', {
      ...PAGE_LOG_CONTEXT,
      error: details,
    });
    window.showErrorNotification?.('שגיאה', `${details} – הנתונים לא זמינים כרגע`);
  }

  async function fetchTradingAccountsFromApi({ signal } = {}) {
    const url = buildUrl('/api/trading-accounts/');
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
      const error = new Error(`טעינת חשבונות נכשלה (${response.status})`);
      notifyLoadError(error.message, error);
      throw error;
    }

    const payload = await response.json();
    const normalized = normalizeAccountsPayload(payload);
    await saveAccountsCache(normalized);
    return normalized;
  }

  async function loadTradingAccountsData(options = {}) {
    const { force = false, ttl = DEFAULT_TTL, signal } = options;
    const loader = () => fetchTradingAccountsFromApi({ signal });

    try {
      if (force) {
        await clearAccountsCachePattern();
        return await loader();
      }

      if (window.CacheTTLGuard?.ensure) {
        const cached = await window.CacheTTLGuard.ensure(PRIMARY_CACHE_KEY, loader, {
          ttl,
          afterRead: (data) => {
            if (Array.isArray(data)) {
              window.Logger?.debug?.('Trading accounts served from cache', {
                ...PAGE_LOG_CONTEXT,
                count: data.length,
              });
            }
          },
          afterLoad: (data) => {
            window.Logger?.debug?.('Trading accounts loaded from API', {
              ...PAGE_LOG_CONTEXT,
              count: Array.isArray(data) ? data.length : 0,
            });
          },
        });
        return Array.isArray(cached) ? cached : cached || [];
      }

      if (window.UnifiedCacheManager?.get) {
        const cached = await window.UnifiedCacheManager.get(PRIMARY_CACHE_KEY, { ttl });
        if (cached) {
          return Array.isArray(cached) ? cached : cached || [];
        }
      }

      return await loader();
    } catch (error) {
      notifyLoadError('שגיאה בטעינת חשבונות מסחר', error);
      throw error;
    }
  }

  async function sendAccountMutation({ accountId, method, body, signal }) {
    const endpoint = accountId ? `/api/trading-accounts/${accountId}` : '/api/trading-accounts';
    try {
      const url = buildUrl(endpoint);
      const response = await fetch(url, {
        method,
        headers: DEFAULT_HEADERS,
        body: body ? JSON.stringify(body) : undefined,
        signal, // Include cookies for session-based auth
      });
      
      // Handle 401/308 authentication errors
      if (window.checkAndHandleAuthError && window.checkAndHandleAuthError(response, url)) {
        throw new Error('Authentication required');
      }

      // CRITICAL: Do NOT read response.json() here - let CRUDResponseHandler handle it
      // Reading the response body here would consume it, causing CRUDResponseHandler to fail
      // Cache invalidation should be handled by CRUDResponseHandler or after it processes the response
      
      return response;
    } catch (error) {
      window.Logger?.error?.('Trading account mutation failed', {
        ...PAGE_LOG_CONTEXT,
        accountId,
        method,
        error: error?.message,
      });
      throw error;
    }
  }

  async function createTradingAccount(payload, options = {}) {
    return sendAccountMutation({ method: 'POST', body: payload, signal: options.signal });
  }

  async function updateTradingAccount(accountId, payload, options = {}) {
    return sendAccountMutation({ accountId, method: 'PUT', body: payload, signal: options.signal });
  }

  async function deleteTradingAccount(accountId, options = {}) {
    return sendAccountMutation({ accountId, method: 'DELETE', signal: options.signal });
  }

  async function fetchTradingAccount(accountId, options = {}) {
    const url = buildUrl(`/api/trading-accounts/${accountId}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: DEFAULT_HEADERS,
      signal: options.signal, // Include cookies for session-based auth
    });
    
    // Handle 401/308 authentication errors
    if (window.checkAndHandleAuthError && window.checkAndHandleAuthError(response, url)) {
      throw new Error('Authentication required');
    }
    if (!response.ok) {
      const error = new Error(`טעינת פרטי חשבון מסחר ${accountId} נכשלה (${response.status})`);
      window.Logger?.error?.('❌ Failed to fetch trading account details', {
        ...PAGE_LOG_CONTEXT,
        accountId,
        error: error.message,
      });
      throw error;
    }
    return response.json();
  }

  // Alias for consistency with other services
  async function fetchTradingAccountDetails(accountId, options = {}) {
    return fetchTradingAccount(accountId, options);
  }

  // ========================================================================
  // Business Logic API Wrappers
  // ========================================================================

  /**
   * Validate trading account data using backend business logic service.
   * Uses UnifiedCacheManager for caching results (60s TTL).
   * @param {Object} accountData - Trading account data to validate
   * @returns {Promise<Object>} Validation result: {is_valid, errors}
   */
  async function validateTradingAccount(accountData) {
    // Use optimized cache key generation
    const cacheKey = window.CacheKeyHelper?.generateCacheKeyFromObject 
      ? window.CacheKeyHelper.generateCacheKeyFromObject('business:validate-trading-account', accountData)
      : `business:validate-trading-account:${JSON.stringify(accountData)}`;
    
    try {
      // Use CacheTTLGuard for automatic cache management
      if (window.CacheTTLGuard?.ensure) {
        return await window.CacheTTLGuard.ensure(cacheKey, async () => {
          const url = '/api/business/trading-account/validate';
          const response = await fetch(url, {
            method: 'POST',
            headers: DEFAULT_HEADERS,
            body: JSON.stringify(accountData), // Include cookies for session-based auth
          });
          
          // Handle 401/308 authentication errors
          if (window.checkAndHandleAuthError && window.checkAndHandleAuthError(response, url)) {
            throw new Error('Authentication required');
          }

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
      const url = '/api/business/trading-account/validate';
      const response = await fetch(url, {
        method: 'POST',
        headers: DEFAULT_HEADERS,
        body: JSON.stringify(accountData), // Include cookies for session-based auth
      });
      
      // Handle 401/308 authentication errors
      if (window.checkAndHandleAuthError && window.checkAndHandleAuthError(response, url)) {
        throw new Error('Authentication required');
      }

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
      window.Logger?.error?.('❌ Error validating trading account', { ...PAGE_LOG_CONTEXT, error: error?.message || error });
      return {
        is_valid: false,
        errors: [error?.message || 'Validation failed']
      };
    }
  }

  window.TradingAccountsData = {
    KEY: PRIMARY_CACHE_KEY,
    TTL: DEFAULT_TTL,
    loadTradingAccountsData,
    fetchFresh: fetchTradingAccountsFromApi,
    saveCache: saveAccountsCache,
    invalidateCache: invalidateAccountsCache,
    clearPattern: clearAccountsCachePattern,
    getCachedTradingAccounts,
    createTradingAccount,
    updateTradingAccount,
    deleteTradingAccount,
    fetchTradingAccount,
    fetchTradingAccountDetails, // Alias for consistency
    validateTradingAccount,
  };

  window.Logger?.info?.('✅ Trading Accounts Data Service initialized', PAGE_LOG_CONTEXT);
})();


