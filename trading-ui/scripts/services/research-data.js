/**
 * Research Data Service
 * =====================
 * Placeholder data layer for the research dashboard.
 * Provides unified cache hooks so future API connectors can be dropped in
 * without touching page logic.
 */
(function researchDataService() {
  const CACHE_KEY = 'research-data';
  const DEFAULT_TTL = 2 * 60 * 1000; // 2 minutes – dashboard style
  const PAGE_LOG_CONTEXT = { page: 'research-data' };

  const DEFAULT_MESSAGE =
    'שירותי המחקר טרם חוברו למקורות נתונים. יש להשלים אינטגרציה לפני הפעלת הדשבורד.';

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

  async function fetchResearchDataFromApi(options = {}) {
    const endpoint = buildUrl('/api/research/summary');
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Cache-Control': 'no-cache',
        },
        signal: options.signal,
        credentials: 'include' // Include cookies for session-based auth
      });
      
      // Handle 401/308 authentication errors
      if (window.checkAndHandleAuthError && window.checkAndHandleAuthError(response, endpoint)) {
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        throw new Error(`Research API unavailable (${response.status})`);
      }

      const payload = await response.json();
      return Array.isArray(payload?.data) ? payload.data : payload ?? null;
    } catch (error) {
      throw new Error(
        error?.message ||
          'Research connectors are not available yet. Please connect a data source before retrying.'
      );
    }
  }

  async function loadResearchData(options = {}) {
    const { force = false, ttl = DEFAULT_TTL, signal } = options;

    const loader = () => fetchResearchDataFromApi({ signal });

    if (force) {
      await window.UnifiedCacheManager?.clearByPattern?.(CACHE_KEY);
      return loader();
    }

    if (window.CacheTTLGuard?.ensure) {
      const cached = await window.CacheTTLGuard.ensure(CACHE_KEY, loader, {
        ttl,
        afterRead: (data) => {
          if (data) {
            window.Logger?.debug?.('Research data served from cache', {
              ...PAGE_LOG_CONTEXT,
            });
          }
        },
      });
      if (cached) {
        return cached;
      }
    }

    return loader();
  }

  async function invalidateCache() {
    if (typeof window.UnifiedCacheManager?.invalidate === 'function') {
      await window.UnifiedCacheManager.invalidate(CACHE_KEY);
    } else if (typeof window.UnifiedCacheManager?.clearByPattern === 'function') {
      await window.UnifiedCacheManager.clearByPattern(CACHE_KEY);
    }
  }

  if (typeof window.CacheTTLGuard?.setConfig === 'function') {
    window.CacheTTLGuard.setConfig(CACHE_KEY, { ttl: DEFAULT_TTL });
  }

  window.ResearchData = {
    KEY: CACHE_KEY,
    TTL: DEFAULT_TTL,
    loadResearchData: async (options = {}) => {
      try {
        return await loadResearchData(options);
      } catch (error) {
        window.Logger?.warn?.('Research data unavailable', { ...PAGE_LOG_CONTEXT, error });
        throw new Error(DEFAULT_MESSAGE);
      }
    },
    invalidateCache,
  };

  window.Logger?.info?.('✅ Research Data Service initialized', PAGE_LOG_CONTEXT);
})();



