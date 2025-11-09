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

    async function ensure(key, loaderFn, options = {}) {
        if (typeof loaderFn !== 'function') {
            window.Logger?.warn?.('CacheTTLGuard.ensure called without loader function', { key, page: 'cache-ttl-guard' });
            return null;
        }

        if (!window.UnifiedCacheManager || window.UnifiedCacheManager.initialized !== true) {
            return loaderFn();
        }

        const cacheOptions = {
            layer: options.layer || null,
            ttl: options.ttl || null,
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
            }
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

    window.CacheTTLGuard = {
        ensure
    };

    window.Logger?.info?.('✅ CacheTTLGuard initialized', { page: 'cache-ttl-guard' });
})();

