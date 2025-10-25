/**
 * Cache + Logger Integration Tests
 * ================================
 * 
 * בדיקות אינטגרציה בין מערכת המטמון למערכת הלוגים
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

// Import the real systems
const fs = require('fs');
const path = require('path');

// Load the actual system codes
const cacheManagerCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/unified-cache-manager.js'), 
    'utf8'
);

const loggerCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/logger-service.js'), 
    'utf8'
);

describe('Cache + Logger Integration', () => {
    let UnifiedCacheManager;
    let Logger;
    let cacheManager;
    
    beforeAll(() => {
        // Mock the global environment
        global.window = {
            Logger: null,
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
        
        // Mock layer classes
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
        
        // Load the real systems
        eval(cacheManagerCode);
        eval(loggerCode);
        
        UnifiedCacheManager = global.UnifiedCacheManager;
        Logger = global.window.Logger;
    });
    
    beforeEach(() => {
        cacheManager = new UnifiedCacheManager();
        jest.clearAllMocks();
    });
    
    describe('Cache Operations with Logging', () => {
        test('should log cache get operations', async () => {
            // Mock cache hit
            cacheManager.layers.memory.get = jest.fn().mockResolvedValue('cached-value');
            
            const result = await cacheManager.get('test-key');
            
            expect(Logger.info).toHaveBeenCalledWith(
                'Cache operation completed',
                expect.objectContaining({ 
                    operation: 'get', 
                    key: 'test-key',
                    result: 'hit'
                })
            );
        });
        
        test('should log cache set operations', async () => {
            const testData = { id: 1, value: 'test' };
            
            await cacheManager.set('test-key', testData);
            
            expect(Logger.info).toHaveBeenCalledWith(
                'Cache operation completed',
                expect.objectContaining({ 
                    operation: 'set', 
                    key: 'test-key',
                    dataSize: expect.any(Number)
                })
            );
        });
        
        test('should log cache clear operations', async () => {
            await cacheManager.clearAllCache();
            
            expect(Logger.info).toHaveBeenCalledWith(
                'Cache clear operation completed',
                expect.objectContaining({ 
                    operation: 'clearAll',
                    layersCleared: expect.any(Array)
                })
            );
        });
    });
    
    describe('Error Handling Integration', () => {
        test('should log cache errors', async () => {
            // Mock cache error
            cacheManager.layers.memory.get = jest.fn().mockRejectedValue(new Error('Cache error'));
            cacheManager.layers.localStorage.get = jest.fn().mockResolvedValue(null);
            cacheManager.layers.indexedDB = {
                get: jest.fn().mockResolvedValue(null)
            };
            cacheManager.layers.backend.get = jest.fn().mockResolvedValue(null);
            
            const result = await cacheManager.get('test-key');
            
            expect(Logger.error).toHaveBeenCalledWith(
                'Cache operation failed',
                expect.objectContaining({ 
                    operation: 'get',
                    key: 'test-key',
                    error: 'Cache error'
                })
            );
        });
        
        test('should log cache performance issues', async () => {
            // Mock slow cache operation
            cacheManager.layers.memory.get = jest.fn().mockImplementation(async () => {
                await new Promise(resolve => setTimeout(resolve, 100));
                return 'slow-value';
            });
            
            const result = await cacheManager.get('slow-key');
            
            expect(Logger.warn).toHaveBeenCalledWith(
                'Cache performance issue detected',
                expect.objectContaining({ 
                    operation: 'get',
                    key: 'slow-key',
                    duration: expect.any(Number)
                })
            );
        });
    });
    
    describe('Cache Statistics Logging', () => {
        test('should log cache statistics', async () => {
            // Mock cache operations
            cacheManager.layers.memory.get = jest.fn().mockResolvedValue('value1');
            cacheManager.layers.memory.get = jest.fn().mockResolvedValue(null);
            cacheManager.layers.localStorage.get = jest.fn().mockResolvedValue('value2');
            
            await cacheManager.get('hit-key');
            await cacheManager.get('miss-key');
            
            // Trigger stats logging
            await cacheManager.updateStats();
            
            expect(Logger.info).toHaveBeenCalledWith(
                'Cache statistics updated',
                expect.objectContaining({ 
                    hitRate: expect.any(Number),
                    missRate: expect.any(Number),
                    totalOperations: expect.any(Number)
                })
            );
        });
    });
    
    describe('Cache Layer Selection Logging', () => {
        test('should log layer selection decisions', async () => {
            const testData = { large: new Array(1000).fill('data') };
            
            await cacheManager.set('large-data', testData);
            
            expect(Logger.debug).toHaveBeenCalledWith(
                'Cache layer selected',
                expect.objectContaining({ 
                    key: 'large-data',
                    selectedLayer: expect.any(String),
                    reason: expect.any(String)
                })
            );
        });
    });
    
    describe('Cache Synchronization Logging', () => {
        test('should log cache synchronization events', async () => {
            // Mock sync operation
            cacheManager.layers.memory.set = jest.fn().mockResolvedValue(true);
            cacheManager.layers.localStorage.set = jest.fn().mockResolvedValue(true);
            cacheManager.layers.indexedDB = {
                set: jest.fn().mockResolvedValue(true)
            };
            cacheManager.layers.backend.set = jest.fn().mockResolvedValue(true);
            
            await cacheManager.set('sync-key', 'sync-value', { sync: true });
            
            expect(Logger.info).toHaveBeenCalledWith(
                'Cache synchronization completed',
                expect.objectContaining({ 
                    key: 'sync-key',
                    layersSynced: expect.any(Array),
                    syncTime: expect.any(Number)
                })
            );
        });
    });
    
    describe('Cache Performance Monitoring', () => {
        test('should log performance metrics', async () => {
            const startTime = Date.now();
            
            // Mock cache operations
            cacheManager.layers.memory.get = jest.fn().mockResolvedValue('value');
            
            await cacheManager.get('perf-key');
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            expect(Logger.debug).toHaveBeenCalledWith(
                'Cache performance metric',
                expect.objectContaining({ 
                    operation: 'get',
                    duration: expect.any(Number),
                    layer: 'memory'
                })
            );
        });
    });
    
    describe('Cache Memory Management', () => {
        test('should log memory cleanup events', async () => {
            // Mock memory cleanup
            cacheManager.layers.memory.clear = jest.fn().mockResolvedValue(true);
            
            await cacheManager.clearCacheLayer('memory');
            
            expect(Logger.info).toHaveBeenCalledWith(
                'Cache memory cleanup completed',
                expect.objectContaining({ 
                    layer: 'memory',
                    entriesCleared: expect.any(Number),
                    memoryFreed: expect.any(Number)
                })
            );
        });
    });
    
    describe('Cache Health Monitoring', () => {
        test('should log cache health status', async () => {
            // Mock health check
            cacheManager.layers.memory.get = jest.fn().mockResolvedValue('healthy');
            cacheManager.layers.localStorage.get = jest.fn().mockResolvedValue('healthy');
            cacheManager.layers.indexedDB = {
                get: jest.fn().mockResolvedValue('healthy')
            };
            cacheManager.layers.backend.get = jest.fn().mockResolvedValue('healthy');
            
            await cacheManager.healthCheck();
            
            expect(Logger.info).toHaveBeenCalledWith(
                'Cache health check completed',
                expect.objectContaining({ 
                    status: 'healthy',
                    layers: expect.any(Array),
                    overallHealth: expect.any(String)
                })
            );
        });
    });
});
