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

  async function clearExecutionsCache(patternOnly = false) {
    if (!window.UnifiedCacheManager) {
      return;
    }
    if (patternOnly && typeof window.UnifiedCacheManager.clearByPattern === 'function') {
      await window.UnifiedCacheManager.clearByPattern(EXECUTIONS_DATA_KEY);
      return;
    }
    if (typeof window.UnifiedCacheManager.invalidate === 'function') {
      await window.UnifiedCacheManager.invalidate(EXECUTIONS_DATA_KEY);
    }
  }

  function notifyLoadError(message, error) {
    const details = error?.message || message || 'שגיאה בטעינת עסקאות';
    window.Logger?.error?.('Executions data load failed', { ...PAGE_LOG_CONTEXT, error: details });
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', `${details} – הנתונים לא זמינים כרגע`);
    }
  }

  async function fetchExecutionsFromApi({ signal } = {}) {
    const base = resolveBaseUrl();
    const separator = base.endsWith('/') ? '' : '/';
    const url = `${base}${separator}api/executions/?_ts=${Date.now()}`;
    const response = await fetch(url, { method: 'GET', headers: DEFAULT_HEADERS, signal });
    if (!response.ok) {
      const error = new Error(`Execution load failed (${response.status})`);
      notifyLoadError(error.message, error);
      throw error;
    }
    const payload = await response.json();
    const normalized = normalizeExecutionsPayload(payload);
    await saveExecutionsCache(normalized);
    return normalized;
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
      notifyLoadError('שגיאה בטעינת עסקאות', error);
      throw error;
    }
  }

  window.ExecutionsData = {
    KEY: EXECUTIONS_DATA_KEY,
    TTL: EXECUTIONS_TTL,
    loadExecutionsData,
    fetchFresh: fetchExecutionsFromApi,
    saveCache: saveExecutionsCache,
    invalidateCache: () => clearExecutionsCache(false),
    clearPattern: () => clearExecutionsCache(true),
  };

  window.Logger?.info?.('✅ Executions Data Service initialized', PAGE_LOG_CONTEXT);
})();


