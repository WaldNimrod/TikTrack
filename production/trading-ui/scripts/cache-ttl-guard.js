/**
 * Cache TTL Guard (Stage B-Lite)
 * Documentation: documentation/03-DEVELOPMENT/CACHE_STAGE_B_LITE.md
 * Function Index:
 * 1. Configuration & Helpers
 * 2. Public API (ensure, invalidate, getMetadata, configure)
 */

(() => {
    'use strict';

    const MODULE_NAME = 'CacheTTLGuard';
    const VERSION = '1.1.0';
    const META_PREFIX = 'cache_ttl_guard_meta__';
    const DEFAULT_OPTIONS = {
        ttl: 5 * 60 * 1000, // 5 דקות ברירת מחדל
        layer: 'memory',
        metadataLayer: 'localStorage',
        namespace: '',
        cacheOnResolve: true,
        force: false,
        autoLog: true,
        source: 'CacheTTLGuard'
    };

    const inFlightRequests = new Map();

    const logger = (() => {
        const base = window.Logger || console;
        return {
            info: (msg, payload) => base?.info?.(msg, payload, { page: MODULE_NAME }) ?? console.info(msg, payload),
            warn: (msg, payload) => base?.warn?.(msg, payload, { page: MODULE_NAME }) ?? console.warn(msg, payload),
            error: (msg, payload) => base?.error?.(msg, payload, { page: MODULE_NAME }) ?? console.error(msg, payload),
            debug: (msg, payload) => base?.debug?.(msg, payload, { page: MODULE_NAME }) ?? console.debug(msg, payload)
        };
    })();

    function getCacheManager() {
        return window.UnifiedCacheManager || null;
    }

    function buildNamespacedKey(key, namespace = '') {
        if (!namespace) {
            return key;
        }
        return `${namespace}::${key}`;
    }

    function buildMetaKey(key, namespace = '') {
        return `${META_PREFIX}${buildNamespacedKey(key, namespace)}`;
    }

    function isPositiveNumber(value) {
        return typeof value === 'number' && Number.isFinite(value) && value > 0;
    }

    async function getFromCache(key, layer) {
        const manager = getCacheManager();
        if (manager?.get) {
            try {
                return await manager.get(key, { layer });
            } catch (error) {
                logger.warn('⚠️ UnifiedCacheManager.get failed, falling back', { key, layer, error: error?.message });
            }
        }

        if (layer === 'localStorage') {
            try {
                const raw = localStorage.getItem(`tiktrack_${key}`);
                return raw ? JSON.parse(raw) : null;
            } catch (error) {
                logger.warn('⚠️ LocalStorage fallback failed', { key, error: error?.message });
            }
        }

        return null;
    }

    async function saveToCache(key, value, layer, ttl) {
        const manager = getCacheManager();
        if (manager?.save) {
            const policy = { layer, ttl };
            await manager.save(key, value, policy);
            return;
        }

        if (layer === 'localStorage') {
            try {
                localStorage.setItem(`tiktrack_${key}`, JSON.stringify(value));
            } catch (error) {
                logger.warn('⚠️ LocalStorage fallback save failed', { key, error: error?.message });
            }
        }
    }

    async function removeFromCache(key, layer) {
        const manager = getCacheManager();
        if (manager?.remove) {
            await manager.remove(key, { layer });
            return;
        }

        if (layer === 'localStorage') {
            try {
                localStorage.removeItem(`tiktrack_${key}`);
            } catch (error) {
                logger.warn('⚠️ LocalStorage fallback remove failed', { key, error: error?.message });
            }
        }
    }

    function extractMetadata({ storedMeta, cachedValue, ttl }) {
        const meta = storedMeta ? { ...storedMeta } : {};

        if (cachedValue && typeof cachedValue === 'object' && cachedValue._cacheMeta) {
            const { timestamp, ttl: cachedTtl } = cachedValue._cacheMeta;
            if (timestamp && !meta.timestamp) {
                meta.timestamp = timestamp;
            }
            if (cachedTtl && !meta.ttl) {
                meta.ttl = cachedTtl;
            }
        }

        if (!meta.ttl && isPositiveNumber(ttl)) {
            meta.ttl = ttl;
        }

        if (!meta.timestamp && meta.lastUpdated) {
            meta.timestamp = meta.lastUpdated;
        }

        if (!meta.expiresAt && meta.timestamp && meta.ttl) {
            meta.expiresAt = meta.timestamp + meta.ttl;
        }

        return meta;
    }

    function isExpired(meta, ttl, now) {
        if (!meta) {
            return true;
        }

        const effectiveTtl = isPositiveNumber(meta.ttl) ? meta.ttl : ttl;

        if (!isPositiveNumber(effectiveTtl)) {
            return true;
        }

        const referenceTimestamp = meta.timestamp ?? meta.lastUpdated ?? (meta.expiresAt ? meta.expiresAt - effectiveTtl : null);
        if (!referenceTimestamp) {
            return true;
        }

        const expiresAt = meta.expiresAt ?? (referenceTimestamp + effectiveTtl);
        return !isPositiveNumber(expiresAt - now);
    }

    async function logCacheEvent(eventPayload) {
        if (!eventPayload?.autoLog) {
            return;
        }

        logger.info('🧮 CacheTTLGuard event', eventPayload);
    }

    const guard = {
        version: VERSION,
        initialized: false,
        defaults: { ...DEFAULT_OPTIONS },

        initialize(options = {}) {
            this.defaults = { ...this.defaults, ...options };
            if (!this.initialized) {
                this.initialized = true;
                logger.info('✅ CacheTTLGuard initialized', { version: VERSION, defaults: this.defaults });
            }
            return this;
        },

        configure(options = {}) {
            this.defaults = { ...this.defaults, ...options };
            return this;
        },

        async ensure(key, fetcher, options = {}) {
            if (typeof key !== 'string' || !key.trim()) {
                throw new Error(`${MODULE_NAME}.ensure expects a non-empty key`);
            }
            if (typeof fetcher !== 'function') {
                throw new Error(`${MODULE_NAME}.ensure expects fetcher to be a function`);
            }

            const config = { ...this.defaults, ...options };
            const ttl = config.ttl;

            if (!isPositiveNumber(ttl) || config.force === true) {
                logger.debug('⚠️ TTL guard bypassed (no TTL or force)', { key, ttl, force: config.force });
                const fresh = await fetcher();
                if (config.cacheOnResolve !== false) {
                    await saveToCache(buildNamespacedKey(key, config.namespace), fresh, config.layer, ttl);
                }
                return fresh;
            }

            const namespacedKey = buildNamespacedKey(key, config.namespace);
            if (inFlightRequests.has(namespacedKey)) {
                return inFlightRequests.get(namespacedKey);
            }

            const requestPromise = (async () => {
                const now = Date.now();
                const metaKey = buildMetaKey(key, config.namespace);

                const [cachedValue, storedMeta] = await Promise.all([
                    getFromCache(namespacedKey, config.layer),
                    getFromCache(metaKey, config.metadataLayer)
                ]);

                const meta = extractMetadata({ storedMeta, cachedValue, ttl });
                const expired = isExpired(meta, ttl, now);

                if (cachedValue !== null && !expired) {
                    logger.debug('✅ Cache hit', { key: namespacedKey, ttl, expiresAt: meta.expiresAt });
                    if (typeof config.onHit === 'function') {
                        try {
                            await config.onHit(cachedValue, meta);
                        } catch (callbackError) {
                            logger.warn('⚠️ onHit callback failed', { key: namespacedKey, error: callbackError?.message });
                        }
                    }
                    if (typeof config.afterRead === 'function') {
                        try {
                            await config.afterRead(cachedValue, meta);
                        } catch (callbackError) {
                            logger.warn('⚠️ afterRead callback failed', { key: namespacedKey, error: callbackError?.message });
                        }
                    }
                    return cachedValue;
                }

                if (typeof config.onMiss === 'function') {
                    try {
                        await config.onMiss({ key: namespacedKey, expired, meta });
                    } catch (callbackError) {
                        logger.warn('⚠️ onMiss callback failed', { key: namespacedKey, error: callbackError?.message });
                    }
                }

                try {
                    const result = await fetcher();

                    if (config.cacheOnResolve !== false) {
                        await saveToCache(namespacedKey, result, config.layer, ttl);
                        const metadataPayload = {
                            timestamp: now,
                            lastUpdated: now,
                            ttl,
                            expiresAt: now + ttl,
                            source: config.source || MODULE_NAME
                        };
                        await saveToCache(metaKey, metadataPayload, config.metadataLayer, ttl);
                    }

                    if (typeof config.afterWrite === 'function') {
                        try {
                            await config.afterWrite(result);
                        } catch (callbackError) {
                            logger.warn('⚠️ afterWrite callback failed', { key: namespacedKey, error: callbackError?.message });
                        }
                    }

                    await logCacheEvent({
                        autoLog: config.autoLog,
                        event: 'cache-miss',
                        key: namespacedKey,
                        ttl,
                        layer: config.layer,
                        namespace: config.namespace,
                        timestamp: new Date(now).toISOString()
                    });

                    return result;
                } catch (error) {
                    if (typeof config.onError === 'function') {
                        try {
                            await config.onError(error, { key: namespacedKey });
                        } catch (callbackError) {
                            logger.warn('⚠️ onError callback failed', { key: namespacedKey, error: callbackError?.message });
                        }
                    }
                    logger.error('❌ CacheTTLGuard.ensure failed', { key: namespacedKey, error: error?.message });
                    throw error;
                }
            })();

            inFlightRequests.set(namespacedKey, requestPromise);
            try {
                return await requestPromise;
            } finally {
                inFlightRequests.delete(namespacedKey);
            }
        },

        async invalidate(key, options = {}) {
            const config = { ...this.defaults, ...options };
            const namespacedKey = buildNamespacedKey(key, config.namespace);
            const metaKey = buildMetaKey(key, config.namespace);

            await Promise.all([
                removeFromCache(namespacedKey, config.layer),
                removeFromCache(metaKey, config.metadataLayer)
            ]);

            await logCacheEvent({
                autoLog: config.autoLog,
                event: 'invalidate',
                key: namespacedKey,
                layer: config.layer,
                namespace: config.namespace,
                timestamp: new Date().toISOString()
            });
        },

        async markStale(key, options = {}) {
            const config = { ...this.defaults, ...options };
            const metaKey = buildMetaKey(key, config.namespace);
            const staleMeta = {
                timestamp: Date.now(),
                ttl: 0,
                expiresAt: Date.now(),
                source: `${MODULE_NAME}:markStale`
            };
            await saveToCache(metaKey, staleMeta, config.metadataLayer, 1);
        },

        async getMetadata(key, options = {}) {
            const config = { ...this.defaults, ...options };
            const metaKey = buildMetaKey(key, config.namespace);
            return getFromCache(metaKey, config.metadataLayer);
        }
    };

    guard.initialize();
    window.CacheTTLGuard = guard;

    if (window.UnifiedInitializationSystem?.addUtility) {
        window.UnifiedInitializationSystem.addUtility(MODULE_NAME, () => {
            window.CacheTTLGuard.initialize();
        });
    }
})();

