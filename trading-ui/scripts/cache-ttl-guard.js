/**
 * Cache TTL Guard - Stage B-Lite
 * ==============================
 * Lightweight helper that consults UnifiedCacheManager before triggering expensive
 * loader functions. Falls back to executing the loader when cache is cold or expired.
 *
 * Usage:
 *   await CacheTTLGuard.ensure('trades-data', window.loadTradesData);
 */
(function() {
  'use strict';

  const CACHE_TTL_CONFIG = {
    'trades-data': { ttl: 30 * 1000 },
    'trade-plans-data': { ttl: 30 * 1000 },
    'executions-data': { ttl: 45 * 1000 },
    'trading-accounts-data': { ttl: 60 * 1000 },
    'accounts-data': { ttl: 60 * 1000 },
    'dashboard-data': { ttl: 60 * 1000 }
  };

  async function ensure(key, loaderFn, options = {}) {
    if (typeof loaderFn !== 'function') {
      window.Logger?.warn?.('CacheTTLGuard.ensure called without loader function', { key, page: 'cache-ttl-guard' });
      return null;
    }

    if (!window.UnifiedCacheManager || window.UnifiedCacheManager.initialized !== true) {
      return loaderFn();
    }

    const configEntry = CACHE_TTL_CONFIG[key] || {};

    const cacheOptions = {
      layer: options.layer ?? configEntry.layer ?? null,
      ttl: options.ttl ?? configEntry.ttl ?? null,
      fallback: async () => {
        const result = await loaderFn();
        if (typeof options.afterLoad === 'function') {
          try {
            options.afterLoad(result);
          } catch (error) {
            window.Logger?.warn?.('CacheTTLGuard afterLoad callback failed', error, { key, page: 'cache-ttl-guard' });
          }
        }
        return result;
      },
    };

    const cached = await window.UnifiedCacheManager.get(key, cacheOptions);
    if (cached !== null && typeof options.afterRead === 'function') {
      try {
        options.afterRead(cached);
      } catch (error) {
        window.Logger?.warn?.('CacheTTLGuard afterRead callback failed', error, { key, page: 'cache-ttl-guard' });
      }
    }
    return cached;
  }

  function setConfig(key, value) {
    if (!key || typeof key !== 'string') {
      return;
    }
    if (value === null) {
      delete CACHE_TTL_CONFIG[key];
      return;
    }
    CACHE_TTL_CONFIG[key] = {
      ...(CACHE_TTL_CONFIG[key] || {}),
      ...value,
    };
  }

  window.CacheTTLGuard = {
    ensure,
    CONFIG: CACHE_TTL_CONFIG,
    setConfig,
  };

  window.Logger?.info?.('✅ CacheTTLGuard initialized', { page: 'cache-ttl-guard' });
})();

