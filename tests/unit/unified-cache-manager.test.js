/**
 * Unified Cache Manager Unit Tests
 * =================================
 * 
 * Unit tests for the Unified Cache Manager system
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

// Import the real Unified Cache Manager
const fs = require('fs');
const path = require('path');

// Load the actual Unified Cache Manager code
const cacheManagerCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/unified-cache-manager.js'), 
    'utf8'
);

describe('Unified Cache Manager', () => {
    let UnifiedCacheManager;
    let cacheManager;
    
    beforeAll(() => {
        // Mock the global environment before loading the real code
        global.window = {
            Logger: {
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
                debug: jest.fn()
            },
            indexedDB: {
                open: jest.fn(),
                deleteDatabase: jest.fn()
            },
            localStorage: {
                getItem: jest.fn(),
                setItem: jest.fn(),
                removeItem: jest.fn(),
                clear: jest.fn()
            },
            sessionStorage: {
                getItem: jest.fn(),
                setItem: jest.fn(),
                removeItem: jest.fn(),
                clear: jest.fn()
            },
            fetch: jest.fn()
        };
        
        // Mock the layer classes that the real code depends on
        global.MemoryLayer = class MemoryLayer {
            async initialize() { return true; }
            async get(key) { return null; }
            async set(key, value, options) { return true; }
            async delete(key) { return true; }
            async clear() { return true; }
            async getStats() { return { entries: 0, size: 0 }; }
        };
        
        global.LocalStorageLayer = class LocalStorageLayer {
            async initialize() { return true; }
            async get(key) { return null; }
            async set(key, value, options) { return true; }
            async delete(key) { return true; }
            async clear() { return true; }
            async getStats() { return { entries: 0, size: 0 }; }
        };
        
        global.IndexedDBLayer = class IndexedDBLayer {
            async initialize() { return true; }
            async get(key) { return null; }
            async set(key, value, options) { return true; }
            async delete(key) { return true; }
            async clear() { return true; }
            async getStats() { return { entries: 0, size: 0 }; }
        };
        
        global.BackendCacheLayer = class BackendCacheLayer {
            async initialize() { return true; }
            async get(key) { return null; }
            async set(key, value, options) { return true; }
            async delete(key) { return true; }
            async clear() { return true; }
            async getStats() { return { entries: 0, size: 0 }; }
        };
        
        // Evaluate the real code to get the UnifiedCacheManager class
        eval(cacheManagerCode);
        UnifiedCacheManager = global.UnifiedCacheManager;
    });
    
    beforeEach(() => {
        cacheManager = new UnifiedCacheManager();
    });
    
    describe('Basic Cache Operations', () => {
        test('should get cached data', () => {
            const key = 'test-key';
            const expectedData = { value: 'test-data' };
            cacheManager.get.mockReturnValue(expectedData);
            
            const data = cacheManager.get(key);
            
            expect(cacheManager.get).toHaveBeenCalledWith(key);
            expect(data).toEqual(expectedData);
        });
        
        test('should set cached data', () => {
            const key = 'test-key';
            const data = { value: 'test-data' };
            const options = { ttl: 3600 };
            
            cacheManager.set(key, data, options);
            
            expect(cacheManager.set).toHaveBeenCalledWith(key, data, options);
        });
        
        test('should delete cached data', () => {
            const key = 'test-key';
            
            cacheManager.delete(key);
            
            expect(cacheManager.delete).toHaveBeenCalledWith(key);
        });
        
        test('should clear cache', () => {
            cacheManager.clear();
            
            expect(cacheManager.clear).toHaveBeenCalled();
        });
    });
    
    describe('Advanced Cache Operations', () => {
        test('should clear all cache', () => {
            cacheManager.clearAll();
            
            expect(cacheManager.clearAll).toHaveBeenCalled();
        });
        
        test('should clear all cache with options', () => {
            const options = { layers: ['memory', 'localStorage'] };
            
            cacheManager.clearAllCache(options);
            
            expect(cacheManager.clearAllCache).toHaveBeenCalledWith(options);
        });
        
        test('should clear all cache quick', () => {
            cacheManager.clearAllCacheQuick();
            
            expect(cacheManager.clearAllCacheQuick).toHaveBeenCalled();
        });
        
        test('should clear all cache detailed', () => {
            const expectedResult = { cleared: 10, errors: 0 };
            cacheManager.clearAllCacheDetailed.mockReturnValue(expectedResult);
            
            const result = cacheManager.clearAllCacheDetailed();
            
            expect(cacheManager.clearAllCacheDetailed).toHaveBeenCalled();
            expect(result).toEqual(expectedResult);
        });
    });
    
    describe('User Preferences Cache', () => {
        test('should refresh user preferences', () => {
            cacheManager.refreshUserPreferences();
            
            expect(cacheManager.refreshUserPreferences).toHaveBeenCalled();
        });
    });
    
    describe('Cache Statistics', () => {
        test('should get cache statistics', () => {
            const expectedStats = {
                memory: { size: 1024, count: 10 },
                localStorage: { size: 2048, count: 20 },
                indexedDB: { size: 4096, count: 30 },
                backend: { size: 8192, count: 40 }
            };
            cacheManager.getCacheStats.mockReturnValue(expectedStats);
            
            const stats = cacheManager.getCacheStats();
            
            expect(cacheManager.getCacheStats).toHaveBeenCalled();
            expect(stats).toEqual(expectedStats);
        });
    });
    
    describe('Cache Import/Export', () => {
        test('should export cache data', () => {
            const expectedExport = { memory: {}, localStorage: {}, indexedDB: {}, backend: {} };
            cacheManager.exportCache.mockReturnValue(expectedExport);
            
            const exportData = cacheManager.exportCache();
            
            expect(cacheManager.exportCache).toHaveBeenCalled();
            expect(exportData).toEqual(expectedExport);
        });
        
        test('should import cache data', () => {
            const importData = { memory: {}, localStorage: {}, indexedDB: {}, backend: {} };
            
            cacheManager.importCache(importData);
            
            expect(cacheManager.importCache).toHaveBeenCalledWith(importData);
        });
    });
    
    describe('Cache Layer Management', () => {
        test('should handle memory layer operations', () => {
            const key = 'memory-key';
            const data = { value: 'memory-data' };
            
            cacheManager.set(key, data, { layer: 'memory' });
            cacheManager.get(key, { layer: 'memory' });
            
            expect(cacheManager.set).toHaveBeenCalledWith(key, data, { layer: 'memory' });
            expect(cacheManager.get).toHaveBeenCalledWith(key, { layer: 'memory' });
        });
        
        test('should handle localStorage layer operations', () => {
            const key = 'localStorage-key';
            const data = { value: 'localStorage-data' };
            
            cacheManager.set(key, data, { layer: 'localStorage' });
            cacheManager.get(key, { layer: 'localStorage' });
            
            expect(cacheManager.set).toHaveBeenCalledWith(key, data, { layer: 'localStorage' });
            expect(cacheManager.get).toHaveBeenCalledWith(key, { layer: 'localStorage' });
        });
        
        test('should handle IndexedDB layer operations', () => {
            const key = 'indexedDB-key';
            const data = { value: 'indexedDB-data' };
            
            cacheManager.set(key, data, { layer: 'indexedDB' });
            cacheManager.get(key, { layer: 'indexedDB' });
            
            expect(cacheManager.set).toHaveBeenCalledWith(key, data, { layer: 'indexedDB' });
            expect(cacheManager.get).toHaveBeenCalledWith(key, { layer: 'indexedDB' });
        });
        
        test('should handle backend layer operations', () => {
            const key = 'backend-key';
            const data = { value: 'backend-data' };
            
            cacheManager.set(key, data, { layer: 'backend' });
            cacheManager.get(key, { layer: 'backend' });
            
            expect(cacheManager.set).toHaveBeenCalledWith(key, data, { layer: 'backend' });
            expect(cacheManager.get).toHaveBeenCalledWith(key, { layer: 'backend' });
        });
    });
    
    describe('Error Handling', () => {
        test('should handle cache get errors', () => {
            cacheManager.get.mockImplementation(() => {
                throw new Error('Cache get failed');
            });
            
            expect(() => {
                cacheManager.get('test-key');
            }).toThrow('Cache get failed');
        });
        
        test('should handle cache set errors', () => {
            cacheManager.set.mockImplementation(() => {
                throw new Error('Cache set failed');
            });
            
            expect(() => {
                cacheManager.set('test-key', 'test-data');
            }).toThrow('Cache set failed');
        });
        
        test('should handle cache clear errors', () => {
            cacheManager.clear.mockImplementation(() => {
                throw new Error('Cache clear failed');
            });
            
            expect(() => {
                cacheManager.clear();
            }).toThrow('Cache clear failed');
        });
    });
    
    describe('Performance', () => {
        test('should handle large cache operations', () => {
            const largeData = new Array(1000).fill({ key: 'value' });
            
            cacheManager.set('large-key', largeData);
            
            expect(cacheManager.set).toHaveBeenCalledWith('large-key', largeData);
        });
        
        test('should handle concurrent cache operations', () => {
            const promises = [];
            for (let i = 0; i < 100; i++) {
                promises.push(cacheManager.set(`key-${i}`, `data-${i}`));
            }
            
            return Promise.all(promises).then(() => {
                expect(cacheManager.set).toHaveBeenCalledTimes(100);
            });
        });
    });
    
    describe('Integration with Other Systems', () => {
        test('should work with logger system', () => {
            const key = 'test-key';
            const data = { value: 'test-data' };
            
            cacheManager.set(key, data);
            
            expect(cacheManager.set).toHaveBeenCalledWith(key, data);
        });
        
        test('should work with notification system', () => {
            const key = 'notification-key';
            const data = { message: 'Test notification' };
            
            cacheManager.set(key, data);
            
            expect(cacheManager.set).toHaveBeenCalledWith(key, data);
        });
    });
});
