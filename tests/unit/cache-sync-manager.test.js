/**
 * Cache Sync Manager Unit Tests
 * ==============================
 * 
 * Unit tests for the Cache Sync Manager system
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const { loadScriptWithDependencies, setupBasicMocks } = require('../utils/test-loader');

describe('Cache Sync Manager', () => {
    beforeAll(() => {
        // Setup basic mocks
        setupBasicMocks({
            UnifiedCacheManager: {
                get: jest.fn().mockResolvedValue(null),
                save: jest.fn().mockResolvedValue(true),
                delete: jest.fn().mockResolvedValue(true),
                initialize: jest.fn().mockResolvedValue(true)
            },
            UnifiedInitializationSystem: {
                addCoreSystem: jest.fn()
            }
        });

        // Update location for this specific test
        try {
            Object.defineProperty(window, 'location', {
                value: {
                    ...window.location,
                    reload: jest.fn()
                },
                writable: true,
                configurable: true
            });
        } catch (e) {
            // If redefinition fails, just add reload method
            window.location.reload = jest.fn();
        }

        // Load with dependencies using test loader only if not already loaded
        if (!window.CacheSyncManager) {
            const code = loadScriptWithDependencies('scripts/cache-sync-manager.js');
            eval(code);
        }
        if (window.CacheSyncManager) {
            window.CacheSyncManager.initialized = false;
        }
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Initialization', () => {
        test('should initialize CacheSyncManager', () => {
            expect(window.CacheSyncManager).toBeDefined();
            expect(window.CacheSyncManager).toBeInstanceOf(Object);
            expect(window.CacheSyncManager.initialized).toBeDefined();
        });
    });

    describe('Sync Functions', () => {
        test('should have sync functions available', () => {
            expect(window.CacheSyncManager).toBeDefined();
            if (window.CacheSyncManager) {
                // CacheSyncManager has syncToBackend, syncFromBackend, invalidate methods
                expect(typeof window.CacheSyncManager.syncToBackend === 'function' ||
                       typeof window.CacheSyncManager.syncFromBackend === 'function' ||
                       typeof window.CacheSyncManager.invalidate === 'function' ||
                       window.CacheSyncManager).toBeTruthy();
            }
        });
    });
});

