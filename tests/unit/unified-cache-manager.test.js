const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

const rawSource = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/unified-cache-manager.js'),
    'utf8'
);

const sanitizedSource = rawSource.replace(/\(async\s*\(\)\s*=>\s*{[\s\S]*?}\)\(\);/, '');

describe('UnifiedCacheManager (unit)', () => {
    let UnifiedCacheManager;
    let cacheManager;
    const createStorage = () => {
        let store = {};
        return {
            getItem: jest.fn((key) => (Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null)),
            setItem: jest.fn((key, value) => {
                store[key] = String(value);
            }),
            removeItem: jest.fn((key) => {
                delete store[key];
            }),
            clear: jest.fn(() => {
                store = {};
            })
        };
    };

    beforeAll(() => {
        global.performance = performance;

        const loggerMock = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn()
        };

        const baseWindow = {
            Logger: loggerMock,
            indexedDB: { open: jest.fn(), deleteDatabase: jest.fn() },
            localStorage: createStorage(),
            sessionStorage: createStorage(),
            fetch: jest.fn()
        };

        global.window = baseWindow;
        global.localStorage = baseWindow.localStorage;
        global.sessionStorage = baseWindow.sessionStorage;
        global.indexedDB = baseWindow.indexedDB;
        global.fetch = baseWindow.fetch;
        global.console = {
            log: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            info: jest.fn(),
            debug: jest.fn()
        };

        eval(sanitizedSource);
        UnifiedCacheManager = window.UnifiedCacheManager.constructor;
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        window.Logger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn()
        };

        cacheManager = new UnifiedCacheManager();

        const createLayerMock = () => ({
            initialize: jest.fn().mockResolvedValue(true),
            save: jest.fn().mockResolvedValue(true),
            get: jest.fn().mockResolvedValue(null),
            remove: jest.fn().mockResolvedValue(true),
            clear: jest.fn().mockResolvedValue(true),
            getStats: jest.fn().mockResolvedValue({ entries: 0, size: 0 })
        });

        cacheManager.layers = {
            memory: createLayerMock(),
            localStorage: createLayerMock(),
            indexedDB: createLayerMock(),
            backend: createLayerMock()
        };

        cacheManager.initialized = true;
        jest.spyOn(cacheManager, 'updatePerformanceStats').mockImplementation(() => {});
    });

    test('save routes small keys to memory layer', async () => {
        jest.spyOn(cacheManager, 'getPolicy').mockReturnValue({ layer: 'memory' });
        jest.spyOn(cacheManager, 'selectLayer').mockReturnValue('memory');
        jest.spyOn(cacheManager, 'prepareData').mockImplementation(async (data) => data);

        const spy = cacheManager.layers.memory.save;
        const result = await cacheManager.save('page-data', { value: 'test' });
        expect(result).toBe(true);
        expect(spy).toHaveBeenCalled();
    });

    test('get returns value from selected layer', async () => {
        cacheManager.layers.memory.get.mockResolvedValue('cached');
        const result = await cacheManager.get('page-data');
        expect(result).toBe('cached');
    });

    test('remove delegates to memory layer', async () => {
        const spy = cacheManager.layers.memory.remove;
        const result = await cacheManager.remove('page-data');
        expect(result).toBe(true);
        expect(spy).toHaveBeenCalledWith('page-data', expect.any(Object));
    });

    test('save warns when manager not initialized', async () => {
        cacheManager.initialized = false;
        const warnSpy = jest.spyOn(window.Logger, 'warn');
        const result = await cacheManager.save('page-data', { value: 'test' });
        expect(result).toBe(false);
        expect(warnSpy).toHaveBeenCalled();
    });
});
