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

const fs = require('fs');
const path = require('path');

// Load the actual Cache Sync Manager code
const cacheSyncCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/cache-sync-manager.js'),
    'utf8'
);

describe('Cache Sync Manager', () => {
    beforeAll(() => {
        // Mock UnifiedCacheManager
        global.window.UnifiedCacheManager = {
            get: jest.fn().mockResolvedValue(null),
            save: jest.fn().mockResolvedValue(true),
            delete: jest.fn().mockResolvedValue(true)
        };

        // Mock fetch
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({})
        });

        // Mock window.location
        Object.defineProperty(window, 'location', {
            value: {
                reload: jest.fn()
            },
            writable: true
        });

        // Evaluate the real code
        eval(cacheSyncCode);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Initialization', () => {
        test('should initialize CacheSyncManager', () => {
            expect(window.CacheSyncManager).toBeDefined();
        });
    });

    describe('Sync Functions', () => {
        test('should have sync functions available', () => {
            if (window.CacheSyncManager) {
                expect(typeof window.CacheSyncManager.syncToBackend).toBe('function') ||
                expect(typeof window.syncCacheToBackend).toBe('function');
            }
        });
    });
});

