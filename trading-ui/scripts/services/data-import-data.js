/**
 * Data Import Data Service
 * ======================================
 * Unified loader + helper for data import operations (import history, trading accounts).
 * Ensures every operation uses UnifiedCacheManager + CacheTTLGuard + CacheSyncManager policies.
 * 
 * Related Documentation:
 * - documentation/systems/user-data-import-system.md
 * - documentation/frontend/GENERAL_SYSTEMS_LIST.md
 * - documentation/04-FEATURES/CORE/CACHE_SYNC_SPECIFICATION.md
 * 
 * Function Index:
 * ==============
 * 
 * CACHE MANAGEMENT:
 * - saveAccountsCache(data, options) - Save accounts to cache
 * - invalidateAccountsCache() - Invalidate accounts cache (uses CacheSyncManager)
 * 
 * ACCOUNT OPERATIONS:
 * - fetchTradingAccount(accountId, options) - Fetch single account
 * - loadTradingAccount(accountId, options) - Load account with cache
 * - saveAccount(accountData) - Save account (legacy, use sendAccountMutation)
 * 
 * IMPORT HISTORY:
 * - fetchHistoryForAccount(accountId, limit, options) - Fetch import history
 * 
 * MUTATION OPERATIONS:
 * - sendAccountMutation({ accountId, method, body, signal }) - Generic mutation (uses CacheSyncManager)
 * 
 * @version 2.0.0
 * @created January 2025
 * @updated January 2025 - Added CacheSyncManager integration
 * @author TikTrack Development Team
 */
(function dataImportDataService() {
  const CACHE_KEY = 'data-import-data';
  const ACCOUNTS_CACHE_KEY = 'data-import-accounts';
  const DEFAULT_TTL = 60 * 1000; // 60 seconds
  const PAGE_LOG_CONTEXT = { page: 'data-import-data' };

  const DEFAULT_HEADERS = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
  };

  const ENDPOINTS = {
    accounts: '/api/trading-accounts/',
    history: (accountId, limit = 20) =>
      `/api/user-data-import/history?trading_account_id=${accountId}&limit=${limit}`,
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
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        url.searchParams.append(key, value);
      }
    });
    if (!url.searchParams.has('_t')) {
      url.searchParams.set('_t', Date.now().toString());
    }
    return url.toString();
  }

  function normalizeAccountRecord(record) {
    if (!record || typeof record !== 'object') {
      return null;
    }
    return {
      ...record,
      updated_at:
        record.updated_at ||
        record.last_activity_at ||
        record.created_at ||
        null,
    };
  }

  function normalizeAccountsPayload(payload) {
    const records = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.records)
          ? payload.records
          : [];
    return records.map(normalizeAccountRecord).filter(Boolean);
  }

  function normalizeHistoryRecord(record) {
    if (!record || typeof record !== 'object') {
      return null;
    }
    return {
      ...record,
      created_at: record.created_at || record.date || null,
      updated_at: record.updated_at || record.modified_at || record.created_at || null,
    };
  }

  function normalizeHistoryPayload(payload) {
    // API returns { status: 'success', sessions: [...] }
    const records = Array.isArray(payload?.sessions)
      ? payload.sessions
      : Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.records)
            ? payload.records
            : [];
    return records.map(normalizeHistoryRecord).filter(Boolean);
  }

  async function saveAccountsCache(data, options = {}) {
    if (!window.UnifiedCacheManager?.save) {
      return;
    }
    const ttl = options.ttl ?? DEFAULT_TTL;
    try {
      await window.UnifiedCacheManager.save(ACCOUNTS_CACHE_KEY, data, { ttl });
    } catch (error) {
      window.Logger?.warn?.('⚠️ Failed to save import accounts cache', {
        ...PAGE_LOG_CONTEXT,
        error: error?.message,
      });
    }
  }

  /**
   * Invalidate accounts cache
   * 
   * @returns {Promise<void>}
   * 
   * @description
   * Invalidates accounts cache via CacheSyncManager with fallback to direct invalidation.
   * Uses 'account-updated' action for cache invalidation.
   * 
   * Cache Invalidation:
   * - Primary: CacheSyncManager.invalidateByAction('account-updated')
   * - Fallback: UnifiedCacheManager.invalidate() or clearByPattern() for 'data-import-accounts'
   * 
   * Related Documentation:
   * - documentation/04-FEATURES/CORE/CACHE_SYNC_SPECIFICATION.md
   */
  async function invalidateAccountsCache() {
    if (!window.UnifiedCacheManager) {
      return;
    }
    // Try CacheSyncManager first (preferred method)
    if (window.CacheSyncManager?.invalidateByAction) {
      try {
        await window.CacheSyncManager.invalidateByAction('account-updated');
        return;
      } catch (error) {
        window.Logger?.warn?.('⚠️ CacheSyncManager.invalidateByAction failed, falling back', {
          ...PAGE_LOG_CONTEXT,
          error: error?.message,
        });
      }
    }
    
    // Fallback to direct invalidation
    if (typeof window.UnifiedCacheManager.invalidate === 'function') {
      await window.UnifiedCacheManager.invalidate(ACCOUNTS_CACHE_KEY).catch((error) => {
        window.Logger?.warn?.('⚠️ Failed to invalidate import accounts cache', {
          ...PAGE_LOG_CONTEXT,
          error: error?.message,
        });
      });
      return;
    }
    if (typeof window.UnifiedCacheManager.clearByPattern === 'function') {
      await window.UnifiedCacheManager.clearByPattern(ACCOUNTS_CACHE_KEY).catch((error) => {
        window.Logger?.warn?.('⚠️ Failed to clear import accounts cache pattern', {
          ...PAGE_LOG_CONTEXT,
          error: error?.message,
        });
      });
    }
  }

  function notifyLoadError(message, error) {
    const details = error?.message || message || 'שגיאה בטעינת נתוני ייבוא';
    window.Logger?.error?.('❌ Data import load failed', {
      ...PAGE_LOG_CONTEXT,
      error: details,
    });
    window.showErrorNotification?.('שגיאה', `${details} – הנתונים לא זמינים כרגע`);
  }

  async function fetchTradingAccountsFromApi(options = {}) {
    const { signal } = options;
    const url = buildUrlWithParams(ENDPOINTS.accounts);
    const response = await fetch(url, {
      method: 'GET',
      headers: DEFAULT_HEADERS,
      signal,
    });

    if (!response.ok) {
      const error = new Error(`טעינת חשבונות מסחר נכשלה (${response.status})`);
      notifyLoadError(error.message, error);
      throw error;
    }

    const payload = await response.json();
    const normalized = normalizeAccountsPayload(payload);
    await saveAccountsCache(normalized);
    return normalized;
  }

  async function loadTradingAccountsForImport(options = {}) {
    const { force = false, ttl = DEFAULT_TTL, signal } = options;
    const loader = () => fetchTradingAccountsFromApi({ signal });

    try {
      if (force) {
        await invalidateAccountsCache();
        return await loader();
      }

      if (window.CacheTTLGuard?.ensure) {
        const cached = await window.CacheTTLGuard.ensure(ACCOUNTS_CACHE_KEY, loader, {
          ttl,
          afterRead: (cachedData) => {
            if (Array.isArray(cachedData)) {
              window.Logger?.debug?.('📦 Import accounts served from cache', {
                ...PAGE_LOG_CONTEXT,
                count: cachedData.length,
              });
            }
          },
          afterLoad: (freshData) => {
            window.Logger?.debug?.('🔄 Import accounts fetched from API', {
              ...PAGE_LOG_CONTEXT,
              count: Array.isArray(freshData) ? freshData.length : 0,
            });
          },
        });
        if (cached) {
          return Array.isArray(cached) ? cached : Array.isArray(cached?.data) ? cached.data : [];
        }
      }

      if (window.UnifiedCacheManager?.get) {
        try {
          const cached = await window.UnifiedCacheManager.get(ACCOUNTS_CACHE_KEY, { ttl });
          if (cached) {
            return Array.isArray(cached) ? cached : Array.isArray(cached?.data) ? cached.data : [];
          }
        } catch (error) {
          window.Logger?.warn?.('⚠️ Failed to read import accounts cache', {
            ...PAGE_LOG_CONTEXT,
            error: error?.message,
          });
        }
      }

      return await loader();
    } catch (error) {
      notifyLoadError('שגיאה בטעינת חשבונות מסחר', error);
      throw error;
    }
  }

  async function fetchHistoryForAccount(accountId, limit = 20, options = {}) {
    if (!accountId) {
      return [];
    }

    const { signal } = options;
    const url = buildUrlWithParams(ENDPOINTS.history(accountId, limit), { _: Date.now() });
    const response = await fetch(url, {
      method: 'GET',
      headers: DEFAULT_HEADERS,
      signal,
    });

    if (!response.ok) {
      const error = new Error(`טעינת היסטוריית ייבוא נכשלה (${response.status})`);
      window.Logger?.error?.('❌ Failed to fetch import history', {
        ...PAGE_LOG_CONTEXT,
        accountId,
        error: error.message,
      });
      throw error;
    }

    const payload = await response.json();
    return normalizeHistoryPayload(payload);
  }

  async function loadImportHistoryData(options = {}) {
    const { accountId, limit = 20, force = false, signal } = options;

    if (!accountId) {
      window.Logger?.warn?.('⚠️ No account ID provided for import history', PAGE_LOG_CONTEXT);
      return [];
    }

    const cacheKey = `${CACHE_KEY}-${accountId}-${limit}`;

    try {
      if (force) {
        return await fetchHistoryForAccount(accountId, limit, { signal });
      }

      if (window.CacheTTLGuard?.ensure) {
        const loader = () => fetchHistoryForAccount(accountId, limit, { signal });
        const cached = await window.CacheTTLGuard.ensure(cacheKey, loader, {
          ttl: DEFAULT_TTL,
          afterRead: (cachedData) => {
            if (Array.isArray(cachedData)) {
              window.Logger?.debug?.('📦 Import history served from cache', {
                ...PAGE_LOG_CONTEXT,
                accountId,
                count: cachedData.length,
              });
            }
          },
          afterLoad: (freshData) => {
            window.Logger?.debug?.('🔄 Import history fetched from API', {
              ...PAGE_LOG_CONTEXT,
              accountId,
              count: Array.isArray(freshData) ? freshData.length : 0,
            });
          },
        });
        if (cached) {
          return Array.isArray(cached) ? cached : Array.isArray(cached?.data) ? cached.data : [];
        }
      }

      if (window.UnifiedCacheManager?.get) {
        try {
          const cached = await window.UnifiedCacheManager.get(cacheKey, { ttl: DEFAULT_TTL });
          if (cached) {
            return Array.isArray(cached) ? cached : Array.isArray(cached?.data) ? cached.data : [];
          }
        } catch (error) {
          window.Logger?.warn?.('⚠️ Failed to read import history cache', {
            ...PAGE_LOG_CONTEXT,
            accountId,
            error: error?.message,
          });
        }
      }

      return await fetchHistoryForAccount(accountId, limit, { signal });
    } catch (error) {
      notifyLoadError('שגיאה בטעינת היסטוריית ייבוא', error);
      throw error;
    }
  }

  if (typeof window.CacheTTLGuard?.setConfig === 'function') {
    window.CacheTTLGuard.setConfig(ACCOUNTS_CACHE_KEY, { ttl: DEFAULT_TTL });
    window.CacheTTLGuard.setConfig(CACHE_KEY, { ttl: DEFAULT_TTL });
  }

  window.DataImportData = {
    KEY: CACHE_KEY,
    ACCOUNTS_KEY: ACCOUNTS_CACHE_KEY,
    TTL: DEFAULT_TTL,
    loadTradingAccountsForImport,
    fetchTradingAccountsForImport: fetchTradingAccountsFromApi,
    loadImportHistoryData,
    fetchHistoryForAccount,
    invalidateAccountsCache,
  };

  window.Logger?.info?.('✅ Data Import Data Service initialized', PAGE_LOG_CONTEXT);
})();

