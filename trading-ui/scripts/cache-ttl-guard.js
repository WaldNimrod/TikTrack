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
    // Data Services - Optimized TTL based on usage patterns
    'trades-data': { ttl: 45 * 1000 }, // Increased from 30s - frequently accessed
    'trade-plans-data': { ttl: 60 * 1000 }, // Increased from 30s - less frequently changed
    'cash-flows-data': { ttl: 90 * 1000 }, // Increased from 60s - stable data
    'notes-data': { ttl: 120 * 1000 }, // Increased from 90s - rarely changed
    'research-data': { ttl: 120 * 1000 },
    'executions-data': { ttl: 60 * 1000 }, // Increased from 45s - frequently accessed
    'trading-accounts-data': { ttl: 120 * 1000 }, // Increased from 60s - stable data
    'accounts-data': { ttl: 120 * 1000 }, // Increased from 60s - stable data
    'dashboard-data': { ttl: 60 * 1000 },
    'preference-data': { ttl: 300 * 1000, layer: 'localStorage' }, // Increased from 120s - very stable
    'profile-data': { ttl: 300 * 1000 }, // Increased from 120s - very stable
    'preference-groups': { ttl: 600 * 1000 }, // Increased from 300s - rarely changed
    'preference-types': { ttl: 900 * 1000 },
    // Business Logic API cache configs - Optimized for calculation reuse
    'business:calculate-stop-price': { ttl: 60 * 1000 }, // Increased from 30s - calculations are expensive
    'business:calculate-target-price': { ttl: 60 * 1000 }, // Increased from 30s - calculations are expensive
    'business:calculate-percentage-from-price': { ttl: 60 * 1000 }, // Increased from 30s
    'business:calculate-execution-values': { ttl: 60 * 1000 }, // Increased from 30s - complex calculation
    'business:calculate-average-price': { ttl: 60 * 1000 }, // Increased from 30s
    'business:validate-execution': { ttl: 120 * 1000 }, // Increased from 60s - validation results are stable
    'business:validate-condition-value': { ttl: 120 * 1000 }, // Increased from 60s
    'business:validate-alert': { ttl: 120 * 1000 }, // Increased from 60s
    // New Business Logic API cache configs
    'business:validate-note': { ttl: 120 * 1000 }, // Increased from 60s
    'business:validate-note-relation': { ttl: 120 * 1000 }, // Increased from 60s
    'business:validate-trading-account': { ttl: 120 * 1000 }, // Increased from 60s
    'business:validate-trade-plan': { ttl: 120 * 1000 }, // Increased from 60s
    'business:validate-ticker': { ttl: 120 * 1000 }, // Increased from 60s
    'business:validate-ticker-symbol': { ttl: 120 * 1000 }, // Increased from 60s
    'business:validate-currency-rate': { ttl: 120 * 1000 }, // Increased from 60s
    'business:validate-tag': { ttl: 120 * 1000 }, // Increased from 60s
    'business:validate-tag-category': { ttl: 120 * 1000 }, // Increased from 60s
    'business:validate-cash-flow': { ttl: 120 * 1000 }, // Increased from 60s
    'business:calculate-cash-flow-balance': { ttl: 60 * 1000 }, // Increased from 30s
    'business:calculate-currency-conversion': { ttl: 60 * 1000 }, // Increased from 30s
    // AI Analysis cache configs
    'ai-analysis-templates': { ttl: 60 * 60 * 1000 }, // 1 hour - stable data
    'ai-analysis-history': { ttl: 5 * 60 * 1000 },   // 5 minutes - frequently updated
    'ai-analysis-providers': { ttl: 5 * 60 * 1000 } // 5 minutes - user settings
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

