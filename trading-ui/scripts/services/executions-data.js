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
  };

  window.Logger?.info?.('✅ Executions Data Service initialized', PAGE_LOG_CONTEXT);
})();


