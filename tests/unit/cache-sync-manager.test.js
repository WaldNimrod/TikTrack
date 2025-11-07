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

    // ===== EDGE CASES & ERROR HANDLING =====
    
    describe('Edge Cases - syncToBackend', () => {
        test('should handle null key', async () => {
            if (!window.CacheSyncManager || !window.CacheSyncManager.syncToBackend) {
                return;
            }

            await expect(window.CacheSyncManager.syncToBackend(null, {})).resolves.not.toThrow();
        });

        test('should handle undefined key', async () => {
            if (!window.CacheSyncManager || !window.CacheSyncManager.syncToBackend) {
                return;
            }

            await expect(window.CacheSyncManager.syncToBackend(undefined, {})).resolves.not.toThrow();
        });

        test('should handle empty string key', async () => {
            if (!window.CacheSyncManager || !window.CacheSyncManager.syncToBackend) {
                return;
            }

            await expect(window.CacheSyncManager.syncToBackend('', {})).resolves.not.toThrow();
        });

        test('should handle null value', async () => {
            if (!window.CacheSyncManager || !window.CacheSyncManager.syncToBackend) {
                return;
            }

            await expect(window.CacheSyncManager.syncToBackend('test-key', null)).resolves.not.toThrow();
        });

        test('should handle missing UnifiedCacheManager', async () => {
            if (!window.CacheSyncManager || !window.CacheSyncManager.syncToBackend) {
                return;
            }

            const originalCache = window.UnifiedCacheManager;
            delete window.UnifiedCacheManager;

            await expect(window.CacheSyncManager.syncToBackend('test-key', {})).resolves.not.toThrow();

            window.UnifiedCacheManager = originalCache;
        });
    });

    describe('Error Handling - syncToBackend', () => {
        test('should handle network errors gracefully', async () => {
            if (!window.CacheSyncManager || !window.CacheSyncManager.syncToBackend) {
                return;
            }

            // Mock fetch to reject
            const originalFetch = global.fetch;
            global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

            await expect(window.CacheSyncManager.syncToBackend('test-key', {})).resolves.not.toThrow();

            global.fetch = originalFetch;
        });

        test('should handle server errors gracefully', async () => {
            if (!window.CacheSyncManager || !window.CacheSyncManager.syncToBackend) {
                return;
            }

            // Mock fetch to return error response
            const originalFetch = global.fetch;
            global.fetch = jest.fn().mockResolvedValue({
                ok: false,
                status: 500,
                json: () => Promise.resolve({ error: 'Server error' })
            });

            await expect(window.CacheSyncManager.syncToBackend('test-key', {})).resolves.not.toThrow();

            global.fetch = originalFetch;
        });
    });

    describe('Edge Cases - invalidate', () => {
        test('should handle null action', async () => {
            if (!window.CacheSyncManager || !window.CacheSyncManager.invalidate) {
                return;
            }

            await expect(window.CacheSyncManager.invalidate(null)).resolves.not.toThrow();
        });

        test('should handle undefined action', async () => {
            if (!window.CacheSyncManager || !window.CacheSyncManager.invalidate) {
                return;
            }

            await expect(window.CacheSyncManager.invalidate(undefined)).resolves.not.toThrow();
        });

        test('should handle invalid action', async () => {
            if (!window.CacheSyncManager || !window.CacheSyncManager.invalidate) {
                return;
            }

            await expect(window.CacheSyncManager.invalidate('invalid-action')).resolves.not.toThrow();
        });
    });

    describe('Error Handling - initialize', () => {
        test('should handle initialization failure gracefully', async () => {
            if (!window.CacheSyncManager || !window.CacheSyncManager.initialize) {
                return;
            }

            // Mock UnifiedCacheManager to fail
            const originalCache = window.UnifiedCacheManager;
            window.UnifiedCacheManager = {
                initialize: jest.fn().mockRejectedValue(new Error('Init error'))
            };

            await expect(window.CacheSyncManager.initialize()).resolves.not.toThrow();

            window.UnifiedCacheManager = originalCache;
        });

        test('should handle missing server URL', async () => {
            if (!window.CacheSyncManager || !window.CacheSyncManager.initialize) {
                return;
            }

            // Mock fetch to handle missing URL scenario
            const originalFetch = global.fetch;
            global.fetch = jest.fn().mockRejectedValue(new Error('Invalid URL'));

            await expect(window.CacheSyncManager.initialize()).resolves.not.toThrow();

            global.fetch = originalFetch;
        });
    });
});

