/**
 * API Systems Integration – TikTrack
 *
 * Covers integration between the unified cache systems, TTL guard and cache sync manager.
 */

const { setupBasicMocks, loadScriptWithDependencies } = require('../utils/test-loader');

describe('API Systems Integration', () => {
    let CacheManagerClass;
    let CacheSyncManagerClass;
    let infoSpy;
    let warnSpy;
    let errorSpy;

    beforeAll(() => {
        setupBasicMocks({
            notificationSystem: {
                showNotification: jest.fn()
            },
            showNotification: jest.fn(),
            showConfirmationDialog: jest.fn()
        });

        eval(loadScriptWithDependencies('scripts/logger-service.js'));
        eval(loadScriptWithDependencies('scripts/unified-cache-manager.js'));
        eval(loadScriptWithDependencies('scripts/cache-ttl-guard.js'));
        eval(loadScriptWithDependencies('scripts/cache-sync-manager.js'));
        eval(loadScriptWithDependencies('scripts/api-config.js'));

        CacheManagerClass = window.UnifiedCacheManager.constructor;
        CacheSyncManagerClass = window.CacheSyncManager.constructor;
    });

    beforeEach(async () => {
        jest.clearAllMocks();

        if (!global.fetch) {
            global.fetch = jest.fn();
        }
        global.fetch.mockReset();
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ success: true }),
            text: async () => 'OK'
        });

        infoSpy = jest.spyOn(window.Logger, 'info').mockImplementation(() => {});
        warnSpy = jest.spyOn(window.Logger, 'warn').mockImplementation(() => {});
        errorSpy = jest.spyOn(window.Logger, 'error').mockImplementation(() => {});
        jest.spyOn(window.Logger, 'debug').mockImplementation(() => {});

        window.UnifiedCacheManager = new CacheManagerClass();
        await window.UnifiedCacheManager.initialize();

        window.preferencesCache = {
            clear: jest.fn().mockResolvedValue()
        };
        window.notificationCache = {
            clear: jest.fn()
        };
        window.showNotification = jest.fn();

        window.CacheSyncManager = new CacheSyncManagerClass();
        window.CacheSyncManager.delay = jest.fn(() => Promise.resolve());
        await window.CacheSyncManager.initialize();

        window.notificationSystem = {
            showNotification: jest.fn()
        };
    });

    afterEach(() => {
        infoSpy.mockRestore();
        warnSpy.mockRestore();
        errorSpy.mockRestore();
    });

    describe('CacheTTLGuard + UnifiedCacheManager', () => {
        test('returns cached payload without invoking loader', async () => {
            const dataset = [
                { id: 1, symbol: 'AAPL' },
                { id: 2, symbol: 'GOOGL' }
            ];

            await window.UnifiedCacheManager.save('api::trades', dataset, { layer: 'memory', ttl: 120000 });

            const loader = jest.fn();
            const afterRead = jest.fn();

            const result = await window.CacheTTLGuard.ensure('api::trades', loader, { afterRead });

            expect(loader).not.toHaveBeenCalled();
            expect(Array.isArray(result)).toBe(true);
            expect(result._cacheMeta).toBeDefined();
            expect(afterRead).toHaveBeenCalledWith(result);
        });

        test('fallback loader persists result into cache layer', async () => {
            const loaderPayload = {
                status: 'ok',
                data: [{ id: 3, symbol: 'MSFT' }]
            };

            const loader = jest.fn().mockResolvedValue(loaderPayload);
            const afterLoad = jest.fn();
            const memorySaveSpy = jest.spyOn(window.UnifiedCacheManager.layers.memory, 'save');

            const result = await window.CacheTTLGuard.ensure('api::alerts', loader, {
                layer: 'memory',
                ttl: 60000,
                afterLoad
            });

            expect(loader).toHaveBeenCalledTimes(1);
            expect(memorySaveSpy).toHaveBeenCalledWith(
                'api::alerts',
                expect.objectContaining({ status: 'ok' }),
                expect.any(Object)
            );
            expect(result._cacheMeta).toBeDefined();
            expect(afterLoad).toHaveBeenCalledWith(result);
            expect(result.data).toEqual([{ id: 3, symbol: 'MSFT' }]);
        });
    });

    describe('CacheSyncManager queue flows', () => {
        test('queues failed backend sync and replays successfully', async () => {
            const syncManager = window.CacheSyncManager;

            global.fetch
                .mockResolvedValueOnce({
                    ok: false,
                    status: 503,
                    statusText: 'Service Unavailable',
                    json: async () => ({ success: false })
                })
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => ({ success: true })
                });

            const success = await syncManager.syncToBackend('accounts-data', { id: 99 });
            expect(success).toBe(false);
            expect(syncManager.syncQueue).toHaveLength(1);
            expect(errorSpy).toHaveBeenCalled();

            syncManager.isProcessing = true;
            await syncManager.processQueue();

            expect(syncManager.syncQueue).toHaveLength(0);
            expect(global.fetch).toHaveBeenCalledTimes(2);
        });

        test('invalidateBackend queues on failure and flushes on retry', async () => {
            const syncManager = window.CacheSyncManager;

            global.fetch
                .mockResolvedValueOnce({
                    ok: false,
                    status: 500,
                    statusText: 'Server Error',
                    json: async () => ({ success: false })
                })
                .mockResolvedValueOnce({
                    ok: true,
                    status: 200,
                    json: async () => ({ success: true })
                });

            const result = await syncManager.invalidateBackend(['trades-data']);
            expect(result).toBe(false);
            expect(syncManager.syncQueue).toHaveLength(1);
            expect(warnSpy).toHaveBeenCalled();

            syncManager.isProcessing = true;
            await syncManager.processQueue();

            expect(syncManager.syncQueue).toHaveLength(0);
            expect(global.fetch).toHaveBeenCalledTimes(2);
        });
    });
});


