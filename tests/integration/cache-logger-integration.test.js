const { loadScriptWithDependencies, setupBasicMocks } = require('../utils/test-loader');

describe('Cache + Logger Integration', () => {
    let ManagerClass;

    beforeAll(() => {
        setupBasicMocks({
            indexedDB: null,
            caches: {
                keys: jest.fn().mockResolvedValue([]),
                delete: jest.fn().mockResolvedValue(true),
                open: jest.fn().mockResolvedValue({
                    keys: jest.fn().mockResolvedValue([]),
                    delete: jest.fn().mockResolvedValue(true),
                    put: jest.fn().mockResolvedValue(true)
                })
            }
        });

        if (!global.navigator) {
            global.navigator = { userAgent: 'jest' };
        }

        if (!global.performance) {
            global.performance = {};
        }
        if (typeof global.performance.now !== 'function') {
            global.performance.now = () => Date.now();
        }
        if (!global.performance.timing) {
            global.performance.timing = {
                navigationStart: 0,
                loadEventEnd: 0,
                domContentLoadedEventEnd: 0
            };
        }

        const cacheCode = loadScriptWithDependencies('scripts/unified-cache-manager.js');
        eval(cacheCode);

        ManagerClass = window.UnifiedCacheManager.constructor;
    });

    beforeEach(() => {
        window.Logger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn(),
            critical: jest.fn()
        };
        window.UnifiedCacheManager = new ManagerClass();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('logs warning when cache operations executed before initialize', async () => {
        await window.UnifiedCacheManager.save('pre-init-key', { value: 1 });

        expect(window.Logger.warn).toHaveBeenCalledWith(
            expect.stringContaining('Unified Cache Manager not initialized'),
            expect.objectContaining({ page: 'unified-cache-manager' })
        );
    });

    test('logs info when removing cached key after initialize', async () => {
        const manager = window.UnifiedCacheManager;

        await manager.initialize();
        await manager.save('logger-test', { foo: 'bar' });
        window.Logger.info.mockClear();

        await manager.remove('logger-test');

        expect(window.Logger.info).toHaveBeenCalledWith(
            expect.stringContaining('Removed logger-test from cache'),
            expect.objectContaining({ page: 'unified-cache-manager' })
        );
    });

    test('logs dependency invalidation summary', async () => {
        const manager = window.UnifiedCacheManager;

        await manager.initialize();
        window.Logger.info.mockClear();

        await manager.invalidateByDependency('trades-data');

        expect(window.Logger.info).toHaveBeenCalledWith(
            'Cache invalidated by dependency',
            expect.objectContaining({
                changedKey: 'trades-data',
                invalidated: expect.any(Number),
                page: 'unified-cache-manager'
            })
        );
    });

    test('logs error details when removal fails', async () => {
        const manager = window.UnifiedCacheManager;

        await manager.initialize();
        const originalRemove = manager.layers.memory.remove;
        manager.layers.memory.remove = jest.fn().mockRejectedValue(new Error('remove-failure'));

        await manager.remove('failing-key');

        expect(window.Logger.error).toHaveBeenCalledWith(
            expect.stringContaining('Failed to remove failing-key'),
            expect.any(Error),
            expect.objectContaining({ page: 'unified-cache-manager' })
        );

        manager.layers.memory.remove = originalRemove;
    });
});
