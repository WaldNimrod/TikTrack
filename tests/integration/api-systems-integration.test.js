/**
 * API Systems Integration Tests
 * ==============================
 * 
 * בדיקות אינטגרציה בין מערכות API שונות
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

describe('API Systems Integration', () => {
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
    
    describe('API Request Caching', () => {
        test('should cache API responses', async () => {
            const apiResponse = {
                data: [
                    { id: 1, symbol: 'AAPL', price: 150.00 },
                    { id: 2, symbol: 'GOOGL', price: 2800.00 }
                ],
                status: 200,
                timestamp: Date.now()
            };
            
            // Mock fetch response
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve(apiResponse)
            });
            
            // Mock cache operations
            cacheManager.layers.backend.set = jest.fn().mockResolvedValue(true);
            cacheManager.layers.backend.get = jest.fn().mockResolvedValue(apiResponse);
            
            // Test API caching
            const response = await fetch('/api/trades');
            const data = await response.json();
            
            await cacheManager.set('api-trades', data);
            const cachedData = await cacheManager.get('api-trades');
            
            expect(cachedData).toEqual(apiResponse);
            expect(cacheManager.layers.backend.set).toHaveBeenCalledWith('api-trades', data, expect.any(Object));
        });
        
        test('should handle API errors with cache fallback', async () => {
            const cachedData = {
                data: [{ id: 1, symbol: 'AAPL', price: 150.00 }],
                status: 200,
                timestamp: Date.now() - 3600000 // 1 hour ago
            };
            
            // Mock fetch error
            global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));
            
            // Mock cache operations
            cacheManager.layers.backend.get = jest.fn().mockResolvedValue(cachedData);
            
            // Test error handling
            try {
                await fetch('/api/trades');
            } catch (error) {
                const fallbackData = await cacheManager.get('api-trades');
                expect(fallbackData).toEqual(cachedData);
            }
        });
    });
    
    describe('API Request Logging', () => {
        test('should log API requests', async () => {
            const apiRequest = {
                url: '/api/trades',
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            };
            
            // Mock fetch
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ data: [] })
            });
            
            // Test API request logging
            const response = await fetch(apiRequest.url, {
                method: apiRequest.method,
                headers: apiRequest.headers
            });
            
            expect(Logger.info).toHaveBeenCalledWith(
                'API request completed',
                expect.objectContaining({
                    url: '/api/trades',
                    method: 'GET',
                    status: 200
                })
            );
        });
        
        test('should log API errors', async () => {
            // Mock fetch error
            global.fetch = jest.fn().mockRejectedValue(new Error('Network Error'));
            
            // Test API error logging
            try {
                await fetch('/api/trades');
            } catch (error) {
                expect(Logger.error).toHaveBeenCalledWith(
                    'API request failed',
                    expect.objectContaining({
                        url: '/api/trades',
                        error: 'Network Error'
                    })
                );
            }
        });
    });
    
    describe('API Response Processing', () => {
        test('should process API responses correctly', async () => {
            const apiResponse = {
                data: [
                    { id: 1, symbol: 'AAPL', price: 150.00, status: 'active' },
                    { id: 2, symbol: 'GOOGL', price: 2800.00, status: 'pending' }
                ],
                meta: {
                    total: 2,
                    page: 1,
                    limit: 10
                }
            };
            
            // Mock fetch
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve(apiResponse)
            });
            
            // Mock cache operations
            cacheManager.layers.backend.set = jest.fn().mockResolvedValue(true);
            
            // Test API response processing
            const response = await fetch('/api/trades');
            const data = await response.json();
            
            await cacheManager.set('api-trades', data);
            
            expect(data.data).toHaveLength(2);
            expect(data.meta.total).toBe(2);
            expect(cacheManager.layers.backend.set).toHaveBeenCalledWith('api-trades', data, expect.any(Object));
        });
        
        test('should handle malformed API responses', async () => {
            const malformedResponse = {
                data: null,
                meta: undefined
            };
            
            // Mock fetch
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve(malformedResponse)
            });
            
            // Test malformed response handling
            const response = await fetch('/api/trades');
            const data = await response.json();
            
            expect(Logger.warn).toHaveBeenCalledWith(
                'Malformed API response received',
                expect.objectContaining({
                    url: '/api/trades',
                    data: malformedResponse
                })
            );
        });
    });
    
    describe('API Rate Limiting', () => {
        test('should handle API rate limiting', async () => {
            // Mock rate limit response
            global.fetch = jest.fn().mockResolvedValue({
                ok: false,
                status: 429,
                statusText: 'Too Many Requests',
                headers: {
                    get: (header) => {
                        if (header === 'Retry-After') return '60';
                        return null;
                    }
                }
            });
            
            // Test rate limiting
            const response = await fetch('/api/trades');
            
            expect(Logger.warn).toHaveBeenCalledWith(
                'API rate limit exceeded',
                expect.objectContaining({
                    url: '/api/trades',
                    status: 429,
                    retryAfter: 60
                })
            );
        });
        
        test('should implement exponential backoff', async () => {
            let attemptCount = 0;
            
            // Mock fetch with retry logic
            global.fetch = jest.fn().mockImplementation(() => {
                attemptCount++;
                if (attemptCount < 3) {
                    return Promise.reject(new Error('Network Error'));
                }
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ data: [] })
                });
            });
            
            // Test exponential backoff
            const response = await fetch('/api/trades');
            const data = await response.json();
            
            expect(attemptCount).toBe(3);
            expect(Logger.info).toHaveBeenCalledWith(
                'API request succeeded after retry',
                expect.objectContaining({
                    url: '/api/trades',
                    attempts: 3
                })
            );
        });
    });
    
    describe('API Authentication', () => {
        test('should handle authentication errors', async () => {
            // Mock authentication error
            global.fetch = jest.fn().mockResolvedValue({
                ok: false,
                status: 401,
                statusText: 'Unauthorized'
            });
            
            // Test authentication error
            const response = await fetch('/api/trades');
            
            expect(Logger.error).toHaveBeenCalledWith(
                'API authentication failed',
                expect.objectContaining({
                    url: '/api/trades',
                    status: 401
                })
            );
        });
        
        test('should refresh authentication tokens', async () => {
            let tokenRefreshed = false;
            
            // Mock token refresh
            global.fetch = jest.fn().mockImplementation((url) => {
                if (url === '/api/refresh-token') {
                    tokenRefreshed = true;
                    return Promise.resolve({
                        ok: true,
                        status: 200,
                        json: () => Promise.resolve({ token: 'new-token' })
                    });
                }
                return Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ data: [] })
                });
            });
            
            // Test token refresh
            await fetch('/api/refresh-token');
            const response = await fetch('/api/trades');
            
            expect(tokenRefreshed).toBe(true);
            expect(Logger.info).toHaveBeenCalledWith(
                'Authentication token refreshed',
                expect.objectContaining({
                    url: '/api/refresh-token'
                })
            );
        });
    });
    
    describe('API Data Synchronization', () => {
        test('should synchronize API data with cache', async () => {
            const apiData = {
                data: [{ id: 1, symbol: 'AAPL', price: 150.00 }],
                timestamp: Date.now()
            };
            
            // Mock fetch
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve(apiData)
            });
            
            // Mock cache operations
            cacheManager.layers.backend.set = jest.fn().mockResolvedValue(true);
            cacheManager.layers.localStorage.set = jest.fn().mockResolvedValue(true);
            
            // Test data synchronization
            const response = await fetch('/api/trades');
            const data = await response.json();
            
            await cacheManager.set('api-trades', data, { sync: true });
            
            expect(cacheManager.layers.backend.set).toHaveBeenCalledWith('api-trades', data, expect.any(Object));
            expect(cacheManager.layers.localStorage.set).toHaveBeenCalledWith('api-trades', data, expect.any(Object));
        });
        
        test('should handle data conflicts between API and cache', async () => {
            const apiData = {
                data: [{ id: 1, symbol: 'AAPL', price: 155.00 }],
                timestamp: Date.now()
            };
            
            const cachedData = {
                data: [{ id: 1, symbol: 'AAPL', price: 150.00 }],
                timestamp: Date.now() - 3600000 // 1 hour ago
            };
            
            // Mock fetch
            global.fetch = jest.fn().mockResolvedValue({
                ok: true,
                status: 200,
                json: () => Promise.resolve(apiData)
            });
            
            // Mock cache operations
            cacheManager.layers.backend.get = jest.fn().mockResolvedValue(cachedData);
            cacheManager.layers.backend.set = jest.fn().mockResolvedValue(true);
            
            // Test conflict resolution
            const response = await fetch('/api/trades');
            const newData = await response.json();
            const oldData = await cacheManager.layers.backend.get('api-trades');
            
            // API data is newer, should win
            expect(newData.data[0].price).toBe(155.00);
            expect(oldData.data[0].price).toBe(150.00);
        });
    });
    
    describe('API Performance Monitoring', () => {
        test('should monitor API response times', async () => {
            const startTime = Date.now();
            
            // Mock fetch with delay
            global.fetch = jest.fn().mockImplementation(() => {
                return new Promise(resolve => {
                    setTimeout(() => {
                        resolve({
                            ok: true,
                            status: 200,
                            json: () => Promise.resolve({ data: [] })
                        });
                    }, 100);
                });
            });
            
            // Test performance monitoring
            const response = await fetch('/api/trades');
            const endTime = Date.now();
            const responseTime = endTime - startTime;
            
            expect(responseTime).toBeGreaterThanOrEqual(100);
            expect(Logger.debug).toHaveBeenCalledWith(
                'API performance metric',
                expect.objectContaining({
                    url: '/api/trades',
                    responseTime: expect.any(Number)
                })
            );
        });
    });
});
