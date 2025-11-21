/**
 * Executions Data Service Unit Tests
 * ==================================
 * 
 * Unit tests for the Executions Data Service
 * Tests CRUD operations, cache integration, and error handling
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');
const { loadScriptWithDependencies } = require('../utils/test-loader');

describe('Executions Data Service', () => {
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

        // Load the actual Executions Data Service code
        const executionsCode = fs.readFileSync(
            path.join(__dirname, '../../trading-ui/scripts/services/executions-data.js'),
            'utf8'
        );
        eval(executionsCode);
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
        test('should initialize ExecutionsData service', () => {
            expect(window.ExecutionsData).toBeDefined();
            expect(window.ExecutionsData.loadExecutionsData).toBeDefined();
            expect(window.ExecutionsData.createExecution).toBeDefined();
            expect(window.ExecutionsData.updateExecution).toBeDefined();
            expect(window.ExecutionsData.deleteExecution).toBeDefined();
            expect(window.ExecutionsData.fetchExecutionDetails).toBeDefined();
        });

        test('should have correct cache key and TTL', () => {
            expect(window.ExecutionsData.KEY).toBe('executions-data');
            expect(window.ExecutionsData.TTL).toBe(45000); // 45 seconds
        });
    });

    describe('loadExecutionsData', () => {
        const mockExecutions = [
            { id: 1, symbol: 'AAPL', quantity: 100, price: 150.00 },
            { id: 2, symbol: 'GOOGL', quantity: 50, price: 2800.00 }
        ];

        test('should load executions from API when cache is empty', async () => {
            // Disable CacheTTLGuard to test direct API call
            const originalCacheTTLGuard = window.CacheTTLGuard;
            window.CacheTTLGuard = null;
            mockUnifiedCacheManager.get.mockResolvedValueOnce(null); // Cache is empty

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockExecutions })
            });

            const executions = await window.ExecutionsData.loadExecutionsData();

            expect(mockFetch).toHaveBeenCalled();
            expect(executions).toHaveLength(2);
            expect(executions[0]).toMatchObject({ id: 1, symbol: 'AAPL' });
            expect(mockUnifiedCacheManager.save).toHaveBeenCalled();

            // Restore CacheTTLGuard
            window.CacheTTLGuard = originalCacheTTLGuard;
        });

        test('should use CacheTTLGuard when available', async () => {
            window.CacheTTLGuard = mockCacheTTLGuard;
            mockCacheTTLGuard.ensure.mockResolvedValueOnce(mockExecutions);

            const executions = await window.ExecutionsData.loadExecutionsData();

            expect(mockCacheTTLGuard.ensure).toHaveBeenCalledWith(
                'executions-data',
                expect.any(Function),
                expect.objectContaining({ ttl: 45000 })
            );
            expect(executions).toHaveLength(2);
            // Should not call fetch when CacheTTLGuard returns cached data
            expect(mockFetch).not.toHaveBeenCalled();
        });

        test('should force reload when force=true', async () => {
            // Disable CacheTTLGuard to test direct force reload
            const originalCacheTTLGuard = window.CacheTTLGuard;
            window.CacheTTLGuard = null;

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockExecutions })
            });

            const executions = await window.ExecutionsData.loadExecutionsData({ force: true });

            expect(mockUnifiedCacheManager.clearByPattern).toHaveBeenCalledWith('executions-data');
            expect(mockFetch).toHaveBeenCalled();
            expect(executions).toHaveLength(2);

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
                window.ExecutionsData.loadExecutionsData()
            ).rejects.toThrow();

            expect(mockLogger.error).toHaveBeenCalled();
            expect(mockShowErrorNotification).toHaveBeenCalled();

            // Restore CacheTTLGuard
            window.CacheTTLGuard = originalCacheTTLGuard;
        });
    });

    describe('createExecution', () => {
        const mockExecutionPayload = {
            symbol: 'TSLA',
            quantity: 200,
            price: 250.00,
            side: 'buy'
        };

        test('should create execution and invalidate cache', async () => {
            const mockResponse = {
                ok: true,
                status: 201,
                json: async () => ({ id: 1, ...mockExecutionPayload })
            };
            mockFetch.mockResolvedValueOnce(mockResponse);

            const response = await window.ExecutionsData.createExecution(mockExecutionPayload);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/executions'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(mockExecutionPayload)
                })
            );
            // Wait a bit for async invalidation
            await new Promise(resolve => setTimeout(resolve, 10));
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('execution-created');
            expect(response).toEqual(mockResponse);
        });

        test('should handle creation errors', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400
            });

            const response = await window.ExecutionsData.createExecution(mockExecutionPayload);

            expect(response.ok).toBe(false);
            expect(mockCacheSyncManager.invalidateByAction).not.toHaveBeenCalled();
        });

        test('should fallback to direct invalidation when CacheSyncManager fails', async () => {
            mockCacheSyncManager.invalidateByAction.mockRejectedValueOnce(new Error('Sync failed'));
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 201
            });

            await window.ExecutionsData.createExecution(mockExecutionPayload);

            // Wait a bit for async invalidation
            await new Promise(resolve => setTimeout(resolve, 10));
            expect(mockUnifiedCacheManager.invalidate).toHaveBeenCalledWith('executions-data');
        });
    });

    describe('updateExecution', () => {
        const executionId = 1;
        const mockUpdatePayload = {
            quantity: 150,
            price: 160.00
        };

        test('should update execution and invalidate cache', async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                json: async () => ({ id: executionId, ...mockUpdatePayload })
            };
            mockFetch.mockResolvedValueOnce(mockResponse);

            const response = await window.ExecutionsData.updateExecution(executionId, mockUpdatePayload);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining(`/api/executions/${executionId}`),
                expect.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify(mockUpdatePayload)
                })
            );
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('execution-updated');
            expect(response).toEqual(mockResponse);
        });

        test('should handle update errors', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404
            });

            const response = await window.ExecutionsData.updateExecution(executionId, mockUpdatePayload);

            expect(response.ok).toBe(false);
            expect(mockCacheSyncManager.invalidateByAction).not.toHaveBeenCalled();
        });
    });

    describe('deleteExecution', () => {
        const executionId = 1;

        test('should delete execution and invalidate cache', async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                json: async () => ({ success: true })
            };
            mockFetch.mockResolvedValueOnce(mockResponse);

            const response = await window.ExecutionsData.deleteExecution(executionId);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining(`/api/executions/${executionId}`),
                expect.objectContaining({
                    method: 'DELETE'
                })
            );
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('execution-deleted');
            expect(response).toEqual(mockResponse);
        });

        test('should handle deletion errors', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404
            });

            const response = await window.ExecutionsData.deleteExecution(executionId);

            expect(response.ok).toBe(false);
            expect(mockCacheSyncManager.invalidateByAction).not.toHaveBeenCalled();
        });
    });

    describe('fetchExecutionDetails', () => {
        const executionId = 1;
        const mockExecutionDetails = {
            id: executionId,
            symbol: 'AAPL',
            quantity: 100,
            price: 150.00,
            side: 'buy',
            execution_date: '2025-01-28'
        };

        test('should fetch execution details successfully', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockExecutionDetails
            });

            const details = await window.ExecutionsData.fetchExecutionDetails(executionId);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining(`/api/executions/${executionId}`),
                expect.objectContaining({
                    method: 'GET'
                })
            );
            expect(details).toEqual(mockExecutionDetails);
        });

        test('should handle fetch errors', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404
            });

            await expect(
                window.ExecutionsData.fetchExecutionDetails(executionId)
            ).rejects.toThrow();

            expect(mockLogger.error).toHaveBeenCalled();
        });
    });

    describe('Cache Invalidation', () => {
        test('should use CacheSyncManager when available', async () => {
            await window.ExecutionsData.invalidateCache();

            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('execution-updated');
        });

        test('should fallback to UnifiedCacheManager when CacheSyncManager fails', async () => {
            mockCacheSyncManager.invalidateByAction.mockRejectedValueOnce(new Error('Sync failed'));

            await window.ExecutionsData.invalidateCache();

            expect(mockUnifiedCacheManager.invalidate).toHaveBeenCalledWith('executions-data');
        });

        test('should fallback to clearByPattern when invalidate not available', async () => {
            window.CacheSyncManager = null;
            mockUnifiedCacheManager.invalidate = undefined;

            await window.ExecutionsData.invalidateCache();

            expect(mockUnifiedCacheManager.clearByPattern).toHaveBeenCalledWith('executions-data');

            // Restore CacheSyncManager
            window.CacheSyncManager = mockCacheSyncManager;
        });
    });

    describe('Error Handling', () => {
        test('should handle network errors in CRUD operations', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(
                window.ExecutionsData.createExecution({})
            ).rejects.toThrow('Network error');

            expect(mockLogger.error).toHaveBeenCalled();
        });

        test('should handle AbortSignal cancellation', async () => {
            const abortController = new AbortController();
            abortController.abort();

            mockFetch.mockRejectedValueOnce(new Error('Aborted'));

            await expect(
                window.ExecutionsData.createExecution({}, { signal: abortController.signal })
            ).rejects.toThrow();
        });
    });

    describe('Cache Integration', () => {
        test('should save to cache after successful load', async () => {
            // Disable CacheTTLGuard to test direct API call and cache save
            const originalCacheTTLGuard = window.CacheTTLGuard;
            window.CacheTTLGuard = null;
            mockUnifiedCacheManager.get.mockResolvedValueOnce(null); // Cache is empty

            const mockExecutions = [{ id: 1, symbol: 'AAPL' }];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockExecutions })
            });

            await window.ExecutionsData.loadExecutionsData();

            expect(mockUnifiedCacheManager.save).toHaveBeenCalled();
            const saveCall = mockUnifiedCacheManager.save.mock.calls[0];
            expect(saveCall[0]).toBe('executions-data');
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

            await window.ExecutionsData.loadExecutionsData({ ttl: customTTL });

            expect(mockUnifiedCacheManager.save).toHaveBeenCalled();
            const saveCall = mockUnifiedCacheManager.save.mock.calls[0];
            expect(saveCall[2]).toMatchObject({ ttl: customTTL });

            // Restore CacheTTLGuard
            window.CacheTTLGuard = originalCacheTTLGuard;
        });
    });
});

