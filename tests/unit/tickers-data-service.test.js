/**
 * Tickers Data Service Unit Tests
 * ==================================
 * 
 * Unit tests for the Tickers Data Service
 * Tests CRUD operations, cache integration, and error handling
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');
const { loadScriptWithDependencies } = require('../utils/test-loader');

describe('Tickers Data Service', () => {
    let mockFetch;
    let mockUnifiedCacheManager;
    let mockCacheTTLGuard;
    let mockCacheSyncManager;
    let mockLogger;
    let mockShowErrorNotification;

    beforeAll(() => {
        // Setup mocks
        mockFetch = jest.fn();
        mockLogger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn()
        };
        mockShowErrorNotification = jest.fn();

        // Mock UnifiedCacheManager
        mockUnifiedCacheManager = {
            save: jest.fn().mockResolvedValue(true),
            get: jest.fn().mockResolvedValue(null),
            invalidate: jest.fn().mockResolvedValue(true),
            clearByPattern: jest.fn().mockResolvedValue(true)
        };

        // Mock CacheTTLGuard
        mockCacheTTLGuard = {
            ensure: jest.fn(),
            setConfig: jest.fn()
        };

        // Mock CacheSyncManager
        mockCacheSyncManager = {
            invalidateByAction: jest.fn().mockResolvedValue(true)
        };

        // Setup global mocks
        global.window = {
            Logger: mockLogger,
            showErrorNotification: mockShowErrorNotification,
            UnifiedCacheManager: mockUnifiedCacheManager,
            CacheTTLGuard: mockCacheTTLGuard,
            CacheSyncManager: mockCacheSyncManager,
            location: {
                origin: 'http://localhost:8080',
                protocol: 'http:'
            },
            API_BASE_URL: ''
        };

        global.fetch = mockFetch;

        // Load dependencies
        const cacheCode = loadScriptWithDependencies('scripts/unified-cache-manager.js');
        const cacheTTLCode = loadScriptWithDependencies('scripts/cache-ttl-guard.js');
        const cacheSyncCode = loadScriptWithDependencies('scripts/cache-sync-manager.js');
        
        eval(cacheCode);
        eval(cacheTTLCode);
        eval(cacheSyncCode);

        // Load the actual Tickers Data Service code
        const tickersCode = fs.readFileSync(
            path.join(__dirname, '../../trading-ui/scripts/services/tickers-data.js'),
            'utf8'
        );
        eval(tickersCode);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockFetch.mockClear();
        mockUnifiedCacheManager.save.mockClear();
        mockUnifiedCacheManager.get.mockClear();
        if (mockUnifiedCacheManager.invalidate) {
            mockUnifiedCacheManager.invalidate.mockClear();
        }
        mockCacheTTLGuard.ensure.mockClear();
        mockCacheSyncManager.invalidateByAction.mockClear();
        mockLogger.info.mockClear();
        mockLogger.error.mockClear();
        mockShowErrorNotification.mockClear();
    });

    describe('Service Initialization', () => {
        test('should initialize TickersData service', () => {
            expect(window.TickersData).toBeDefined();
            expect(window.TickersData.loadTickersData).toBeDefined();
            expect(window.TickersData.createTicker).toBeDefined();
            expect(window.TickersData.updateTicker).toBeDefined();
            expect(window.TickersData.deleteTicker).toBeDefined();
            expect(window.TickersData.fetchTickerDetails).toBeDefined();
        });

        test('should have correct cache key and TTL', () => {
            expect(window.TickersData.KEY).toBe('tickers-data');
            expect(window.TickersData.TTL).toBe(45000); // 45 seconds
        });
    });

    describe('loadTickersData', () => {
        const mockTickers = [
            { id: 1, symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' },
            { id: 2, symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock' }
        ];

        test('should load tickers from API when cache is empty', async () => {
            // Disable CacheTTLGuard to test direct API call
            const originalCacheTTLGuard = window.CacheTTLGuard;
            window.CacheTTLGuard = null;
            mockUnifiedCacheManager.get.mockResolvedValueOnce(null); // Cache is empty

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockTickers })
            });

            const tickers = await window.TickersData.loadTickersData();

            expect(mockFetch).toHaveBeenCalled();
            expect(tickers).toHaveLength(2);
            expect(tickers[0]).toMatchObject({ id: 1, symbol: 'AAPL' });
            expect(mockUnifiedCacheManager.save).toHaveBeenCalled();

            // Restore CacheTTLGuard
            window.CacheTTLGuard = originalCacheTTLGuard;
        });

        test('should use CacheTTLGuard when available', async () => {
            window.CacheTTLGuard = mockCacheTTLGuard;
            mockCacheTTLGuard.ensure.mockResolvedValueOnce(mockTickers);

            const tickers = await window.TickersData.loadTickersData();

            expect(mockCacheTTLGuard.ensure).toHaveBeenCalledWith(
                'tickers-data',
                expect.any(Function),
                expect.objectContaining({ ttl: 45000 })
            );
            expect(tickers).toHaveLength(2);
            // Should not call fetch when CacheTTLGuard returns cached data
            expect(mockFetch).not.toHaveBeenCalled();
        });

        test('should force reload when force=true', async () => {
            // Disable CacheTTLGuard to test direct force reload
            const originalCacheTTLGuard = window.CacheTTLGuard;
            window.CacheTTLGuard = null;

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockTickers })
            });

            const tickers = await window.TickersData.loadTickersData({ force: true });

            expect(mockUnifiedCacheManager.clearByPattern).toHaveBeenCalledWith('tickers-data');
            expect(mockFetch).toHaveBeenCalled();
            expect(tickers).toHaveLength(2);

            // Restore CacheTTLGuard
            window.CacheTTLGuard = originalCacheTTLGuard;
        });

        test('should handle API errors gracefully', async () => {
            // Disable CacheTTLGuard to test direct API error
            const originalCacheTTLGuard = window.CacheTTLGuard;
            window.CacheTTLGuard = null;
            mockUnifiedCacheManager.get.mockResolvedValueOnce(null); // Cache is empty

            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500
            });

            await expect(
                window.TickersData.loadTickersData()
            ).rejects.toThrow();

            expect(mockLogger.error).toHaveBeenCalled();
            expect(mockShowErrorNotification).toHaveBeenCalled();

            // Restore CacheTTLGuard
            window.CacheTTLGuard = originalCacheTTLGuard;
        });

        test('should normalize tickers payload correctly', async () => {
            // Disable CacheTTLGuard to test direct API call
            const originalCacheTTLGuard = window.CacheTTLGuard;
            window.CacheTTLGuard = null;
            mockUnifiedCacheManager.get.mockResolvedValueOnce(null);

            const mockPayload = {
                data: [
                    { id: 1, symbol: 'AAPL', created_at: '2025-01-01' },
                    { id: 2, symbol: 'GOOGL', updated_at: '2025-01-02' }
                ]
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockPayload
            });

            const tickers = await window.TickersData.loadTickersData();

            expect(tickers).toHaveLength(2);
            expect(tickers[0]).toHaveProperty('updated_at');
            expect(tickers[1].updated_at).toBe('2025-01-02'); // Should prefer updated_at

            // Restore CacheTTLGuard
            window.CacheTTLGuard = originalCacheTTLGuard;
        });
    });

    describe('createTicker', () => {
        const mockTickerPayload = {
            symbol: 'TSLA',
            name: 'Tesla Inc.',
            type: 'stock'
        };

        test('should create ticker and invalidate cache', async () => {
            const mockResponse = {
                ok: true,
                status: 201,
                json: async () => ({ id: 1, ...mockTickerPayload })
            };
            mockFetch.mockResolvedValueOnce(mockResponse);

            const response = await window.TickersData.createTicker(mockTickerPayload);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/tickers'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(mockTickerPayload)
                })
            );
            // Wait a bit for async invalidation
            await new Promise(resolve => setTimeout(resolve, 10));
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('ticker-created');
            expect(response).toEqual(mockResponse);
        });

        test('should handle creation errors', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400
            });

            const response = await window.TickersData.createTicker(mockTickerPayload);

            expect(response.ok).toBe(false);
            expect(mockCacheSyncManager.invalidateByAction).not.toHaveBeenCalled();
        });

        test('should fallback to direct invalidation when CacheSyncManager fails', async () => {
            mockCacheSyncManager.invalidateByAction.mockRejectedValueOnce(new Error('Sync failed'));
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 201
            });

            await window.TickersData.createTicker(mockTickerPayload);

            // Wait a bit for async invalidation
            await new Promise(resolve => setTimeout(resolve, 10));
            expect(mockUnifiedCacheManager.invalidate).toHaveBeenCalledWith('tickers-data');
        });
    });

    describe('updateTicker', () => {
        const tickerId = 1;
        const mockUpdatePayload = {
            name: 'Apple Inc. Updated',
            type: 'etf'
        };

        test('should update ticker and invalidate cache', async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                json: async () => ({ id: tickerId, ...mockUpdatePayload })
            };
            mockFetch.mockResolvedValueOnce(mockResponse);

            const response = await window.TickersData.updateTicker(tickerId, mockUpdatePayload);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining(`/api/tickers/${tickerId}`),
                expect.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify(mockUpdatePayload)
                })
            );
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('ticker-updated');
            expect(response).toEqual(mockResponse);
        });

        test('should handle update errors', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404
            });

            const response = await window.TickersData.updateTicker(tickerId, mockUpdatePayload);

            expect(response.ok).toBe(false);
            expect(mockCacheSyncManager.invalidateByAction).not.toHaveBeenCalled();
        });
    });

    describe('deleteTicker', () => {
        const tickerId = 1;

        test('should delete ticker and invalidate cache', async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                json: async () => ({ success: true })
            };
            mockFetch.mockResolvedValueOnce(mockResponse);

            const response = await window.TickersData.deleteTicker(tickerId);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining(`/api/tickers/${tickerId}`),
                expect.objectContaining({
                    method: 'DELETE'
                })
            );
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('ticker-deleted');
            expect(response).toEqual(mockResponse);
        });

        test('should handle deletion errors', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404
            });

            const response = await window.TickersData.deleteTicker(tickerId);

            expect(response.ok).toBe(false);
            expect(mockCacheSyncManager.invalidateByAction).not.toHaveBeenCalled();
        });
    });

    describe('fetchTickerDetails', () => {
        const tickerId = 1;
        const mockTickerDetails = {
            id: tickerId,
            symbol: 'AAPL',
            name: 'Apple Inc.',
            type: 'stock',
            created_at: '2025-01-01'
        };

        test('should fetch ticker details successfully', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockTickerDetails
            });

            const details = await window.TickersData.fetchTickerDetails(tickerId);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining(`/api/tickers/${tickerId}`),
                expect.objectContaining({
                    method: 'GET'
                })
            );
            expect(details).toEqual(mockTickerDetails);
        });

        test('should handle fetch errors', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404
            });

            await expect(
                window.TickersData.fetchTickerDetails(tickerId)
            ).rejects.toThrow();

            expect(mockLogger.error).toHaveBeenCalled();
        });
    });

    describe('Cache Invalidation', () => {
        test('should use CacheSyncManager when available', async () => {
            await window.TickersData.invalidateCache();

            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('ticker-updated');
        });

        test('should fallback to UnifiedCacheManager when CacheSyncManager fails', async () => {
            mockCacheSyncManager.invalidateByAction.mockRejectedValueOnce(new Error('Sync failed'));

            await window.TickersData.invalidateCache();

            expect(mockUnifiedCacheManager.invalidate).toHaveBeenCalledWith('tickers-data');
        });

        test('should fallback to clearByPattern when invalidate not available', async () => {
            window.CacheSyncManager = null;
            mockUnifiedCacheManager.invalidate = undefined;

            await window.TickersData.invalidateCache();

            expect(mockUnifiedCacheManager.clearByPattern).toHaveBeenCalledWith('tickers-data');

            // Restore CacheSyncManager
            window.CacheSyncManager = mockCacheSyncManager;
        });
    });

    describe('Error Handling', () => {
        test('should handle network errors in CRUD operations', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(
                window.TickersData.createTicker({})
            ).rejects.toThrow('Network error');

            expect(mockLogger.error).toHaveBeenCalled();
        });

        test('should handle AbortSignal cancellation', async () => {
            const abortController = new AbortController();
            abortController.abort();

            mockFetch.mockRejectedValueOnce(new Error('Aborted'));

            await expect(
                window.TickersData.createTicker({}, { signal: abortController.signal })
            ).rejects.toThrow();
        });
    });

    describe('Cache Integration', () => {
        test('should save to cache after successful load', async () => {
            // Disable CacheTTLGuard to test direct API call and cache save
            const originalCacheTTLGuard = window.CacheTTLGuard;
            window.CacheTTLGuard = null;
            mockUnifiedCacheManager.get.mockResolvedValueOnce(null); // Cache is empty

            const mockTickers = [{ id: 1, symbol: 'AAPL' }];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockTickers })
            });

            await window.TickersData.loadTickersData();

            expect(mockUnifiedCacheManager.save).toHaveBeenCalled();
            const saveCall = mockUnifiedCacheManager.save.mock.calls[0];
            expect(saveCall[0]).toBe('tickers-data');
            expect(saveCall[2]).toMatchObject({ ttl: 45000 });

            // Restore CacheTTLGuard
            window.CacheTTLGuard = originalCacheTTLGuard;
        });

        test('should use custom TTL when provided', async () => {
            // Disable CacheTTLGuard to test direct API call with custom TTL
            const originalCacheTTLGuard = window.CacheTTLGuard;
            window.CacheTTLGuard = null;
            mockUnifiedCacheManager.get.mockResolvedValueOnce(null); // Cache is empty

            const customTTL = 90000;
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: [] })
            });

            await window.TickersData.loadTickersData({ ttl: customTTL });

            expect(mockUnifiedCacheManager.save).toHaveBeenCalled();
            const saveCall = mockUnifiedCacheManager.save.mock.calls[0];
            expect(saveCall[2]).toMatchObject({ ttl: customTTL });

            // Restore CacheTTLGuard
            window.CacheTTLGuard = originalCacheTTLGuard;
        });
    });
});

