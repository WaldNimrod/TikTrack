const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

const rawSource = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/unified-cache-manager.js'),
    'utf8'
);

const sanitizedSource = rawSource.replace(/\(async\s*\(\)\s*=>\s*{[\s\S]*?}\)\(\);/, '');

describe('UnifiedCacheManager (integration)', () => {
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

        class BaseLayer {
            constructor(name) {
                this.name = name;
            }
            async initialize() { return true; }
            async save(key, data) { return true; }
            async get(key) { return null; }
            async remove(key) { return true; }
            async clear() { return true; }
            async getStats() { return { entries: 0, size: 0 }; }
        }

        global.MemoryLayer = class extends BaseLayer { constructor() { super('memory'); } };
        global.LocalStorageLayer = class extends BaseLayer { constructor() { super('localStorage'); } };
        global.IndexedDBLayer = class extends BaseLayer { constructor() { super('indexedDB'); } };
        global.BackendCacheLayer = class extends BaseLayer { constructor() { super('backend'); } };

        const loggerMock = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn()
        };

        global.window = {
            Logger: loggerMock,
            indexedDB: { open: jest.fn(), deleteDatabase: jest.fn() },
            localStorage: createStorage(),
            sessionStorage: createStorage(),
            fetch: jest.fn()
        };

        global.localStorage = window.localStorage;
        global.sessionStorage = window.sessionStorage;
        global.indexedDB = window.indexedDB;
        global.fetch = window.fetch;
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

    beforeEach(() => {
        jest.clearAllMocks();
        cacheManager = new UnifiedCacheManager();
    });

    test('default policies contain expected keys', () => {
        expect(cacheManager.defaultPolicies['user-preferences']).toEqual(expect.objectContaining({ layer: 'localStorage' }));
        expect(cacheManager.defaultPolicies['market-data']).toEqual(expect.objectContaining({ layer: 'backend' }));
    });

    test('stats structure initialized with zero values', () => {
        expect(cacheManager.stats.operations).toEqual({ save: 0, get: 0, remove: 0, clear: 0 });
        expect(cacheManager.stats.layers.memory).toEqual(expect.objectContaining({ entries: 0, size: 0 }));
    });
});
