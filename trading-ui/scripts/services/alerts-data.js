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
    const response = await fetch(url, { method: 'GET', headers: DEFAULT_HEADERS, signal });
    if (!response.ok) {
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

      return response;
    } catch (error) {
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
  };

  window.Logger?.info?.('✅ Alerts Data Service initialized', PAGE_LOG_CONTEXT);
})();

