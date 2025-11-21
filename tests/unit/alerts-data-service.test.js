/**
 * Alerts Data Service Unit Tests
 * ==================================
 * 
 * Unit tests for the Alerts Data Service
 * Tests CRUD operations, cache integration, and error handling
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');
const { loadScriptWithDependencies } = require('../utils/test-loader');

describe('Alerts Data Service', () => {
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

        // Load the actual Alerts Data Service code
        const alertsCode = fs.readFileSync(
            path.join(__dirname, '../../trading-ui/scripts/services/alerts-data.js'),
            'utf8'
        );
        eval(alertsCode);
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
        test('should initialize AlertsData service', () => {
            expect(window.AlertsData).toBeDefined();
            expect(window.AlertsData.loadAlertsData).toBeDefined();
            expect(window.AlertsData.createAlert).toBeDefined();
            expect(window.AlertsData.updateAlert).toBeDefined();
            expect(window.AlertsData.deleteAlert).toBeDefined();
            expect(window.AlertsData.fetchAlertDetails).toBeDefined();
        });

        test('should have correct cache key and TTL', () => {
            expect(window.AlertsData.KEY).toBe('alerts-data');
            expect(window.AlertsData.TTL).toBe(45000); // 45 seconds
        });
    });

    describe('loadAlertsData', () => {
        const mockAlerts = [
            { id: 1, ticker_id: 1, condition: 'price > 100', active: true },
            { id: 2, ticker_id: 2, condition: 'volume > 1000', active: false }
        ];

        test('should load alerts from API when cache is empty', async () => {
            // Disable CacheTTLGuard to test direct API call
            const originalCacheTTLGuard = window.CacheTTLGuard;
            window.CacheTTLGuard = null;
            mockUnifiedCacheManager.get.mockResolvedValueOnce(null); // Cache is empty

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockAlerts })
            });

            const alerts = await window.AlertsData.loadAlertsData();

            expect(mockFetch).toHaveBeenCalled();
            expect(alerts).toHaveLength(2);
            expect(alerts[0]).toMatchObject({ id: 1, ticker_id: 1 });
            expect(mockUnifiedCacheManager.save).toHaveBeenCalled();

            // Restore CacheTTLGuard
            window.CacheTTLGuard = originalCacheTTLGuard;
        });

        test('should use CacheTTLGuard when available', async () => {
            window.CacheTTLGuard = mockCacheTTLGuard;
            mockCacheTTLGuard.ensure.mockResolvedValueOnce(mockAlerts);

            const alerts = await window.AlertsData.loadAlertsData();

            expect(mockCacheTTLGuard.ensure).toHaveBeenCalledWith(
                'alerts-data',
                expect.any(Function),
                expect.objectContaining({ ttl: 45000 })
            );
            expect(alerts).toHaveLength(2);
            // Should not call fetch when CacheTTLGuard returns cached data
            expect(mockFetch).not.toHaveBeenCalled();
        });

        test('should force reload when force=true', async () => {
            // Disable CacheTTLGuard to test direct force reload
            const originalCacheTTLGuard = window.CacheTTLGuard;
            window.CacheTTLGuard = null;

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockAlerts })
            });

            const alerts = await window.AlertsData.loadAlertsData({ force: true });

            expect(mockUnifiedCacheManager.clearByPattern).toHaveBeenCalledWith('alerts-data');
            expect(mockFetch).toHaveBeenCalled();
            expect(alerts).toHaveLength(2);

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
                window.AlertsData.loadAlertsData()
            ).rejects.toThrow();

            expect(mockLogger.error).toHaveBeenCalled();
            expect(mockShowErrorNotification).toHaveBeenCalled();

            // Restore CacheTTLGuard
            window.CacheTTLGuard = originalCacheTTLGuard;
        });

        test('should normalize alerts payload correctly', async () => {
            // Disable CacheTTLGuard to test direct API call
            const originalCacheTTLGuard = window.CacheTTLGuard;
            window.CacheTTLGuard = null;
            mockUnifiedCacheManager.get.mockResolvedValueOnce(null);

            const mockPayload = {
                data: [
                    { id: 1, ticker_id: 1, created_at: '2025-01-01' },
                    { id: 2, ticker_id: 2, updated_at: '2025-01-02', triggered_at: '2025-01-03' }
                ]
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockPayload
            });

            const alerts = await window.AlertsData.loadAlertsData();

            expect(alerts).toHaveLength(2);
            expect(alerts[0]).toHaveProperty('updated_at');
            expect(alerts[1].updated_at).toBe('2025-01-02'); // Should prefer updated_at

            // Restore CacheTTLGuard
            window.CacheTTLGuard = originalCacheTTLGuard;
        });
    });

    describe('createAlert', () => {
        const mockAlertPayload = {
            ticker_id: 1,
            condition: 'price > 100',
            active: true
        };

        test('should create alert and invalidate cache', async () => {
            const mockResponse = {
                ok: true,
                status: 201,
                json: async () => ({ id: 1, ...mockAlertPayload })
            };
            mockFetch.mockResolvedValueOnce(mockResponse);

            const response = await window.AlertsData.createAlert(mockAlertPayload);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/alerts'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(mockAlertPayload)
                })
            );
            // Wait a bit for async invalidation
            await new Promise(resolve => setTimeout(resolve, 10));
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('alert-created');
            expect(response).toEqual(mockResponse);
        });

        test('should handle creation errors', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 400
            });

            const response = await window.AlertsData.createAlert(mockAlertPayload);

            expect(response.ok).toBe(false);
            expect(mockCacheSyncManager.invalidateByAction).not.toHaveBeenCalled();
        });

        test('should fallback to direct invalidation when CacheSyncManager fails', async () => {
            mockCacheSyncManager.invalidateByAction.mockRejectedValueOnce(new Error('Sync failed'));
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 201
            });

            await window.AlertsData.createAlert(mockAlertPayload);

            // Wait a bit for async invalidation
            await new Promise(resolve => setTimeout(resolve, 10));
            expect(mockUnifiedCacheManager.invalidate).toHaveBeenCalledWith('alerts-data');
        });
    });

    describe('updateAlert', () => {
        const alertId = 1;
        const mockUpdatePayload = {
            condition: 'price > 200',
            active: false
        };

        test('should update alert and invalidate cache', async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                json: async () => ({ id: alertId, ...mockUpdatePayload })
            };
            mockFetch.mockResolvedValueOnce(mockResponse);

            const response = await window.AlertsData.updateAlert(alertId, mockUpdatePayload);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining(`/api/alerts/${alertId}`),
                expect.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify(mockUpdatePayload)
                })
            );
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('alert-updated');
            expect(response).toEqual(mockResponse);
        });

        test('should handle update errors', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404
            });

            const response = await window.AlertsData.updateAlert(alertId, mockUpdatePayload);

            expect(response.ok).toBe(false);
            expect(mockCacheSyncManager.invalidateByAction).not.toHaveBeenCalled();
        });
    });

    describe('deleteAlert', () => {
        const alertId = 1;

        test('should delete alert and invalidate cache', async () => {
            const mockResponse = {
                ok: true,
                status: 200,
                json: async () => ({ success: true })
            };
            mockFetch.mockResolvedValueOnce(mockResponse);

            const response = await window.AlertsData.deleteAlert(alertId);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining(`/api/alerts/${alertId}`),
                expect.objectContaining({
                    method: 'DELETE'
                })
            );
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('alert-deleted');
            expect(response).toEqual(mockResponse);
        });

        test('should handle deletion errors', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404
            });

            const response = await window.AlertsData.deleteAlert(alertId);

            expect(response.ok).toBe(false);
            expect(mockCacheSyncManager.invalidateByAction).not.toHaveBeenCalled();
        });
    });

    describe('fetchAlertDetails', () => {
        const alertId = 1;
        const mockAlertDetails = {
            id: alertId,
            ticker_id: 1,
            condition: 'price > 100',
            active: true,
            created_at: '2025-01-01'
        };

        test('should fetch alert details successfully', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => mockAlertDetails
            });

            const details = await window.AlertsData.fetchAlertDetails(alertId);

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining(`/api/alerts/${alertId}`),
                expect.objectContaining({
                    method: 'GET'
                })
            );
            expect(details).toEqual(mockAlertDetails);
        });

        test('should handle fetch errors', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404
            });

            await expect(
                window.AlertsData.fetchAlertDetails(alertId)
            ).rejects.toThrow();

            expect(mockLogger.error).toHaveBeenCalled();
        });
    });

    describe('Cache Invalidation', () => {
        test('should use CacheSyncManager when available', async () => {
            await window.AlertsData.invalidateCache();

            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('alert-updated');
        });

        test('should fallback to UnifiedCacheManager when CacheSyncManager fails', async () => {
            mockCacheSyncManager.invalidateByAction.mockRejectedValueOnce(new Error('Sync failed'));

            await window.AlertsData.invalidateCache();

            expect(mockUnifiedCacheManager.invalidate).toHaveBeenCalledWith('alerts-data');
        });

        test('should fallback to clearByPattern when invalidate not available', async () => {
            window.CacheSyncManager = null;
            mockUnifiedCacheManager.invalidate = undefined;

            await window.AlertsData.invalidateCache();

            expect(mockUnifiedCacheManager.clearByPattern).toHaveBeenCalledWith('alerts-data');

            // Restore CacheSyncManager
            window.CacheSyncManager = mockCacheSyncManager;
        });
    });

    describe('Error Handling', () => {
        test('should handle network errors in CRUD operations', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(
                window.AlertsData.createAlert({})
            ).rejects.toThrow('Network error');

            expect(mockLogger.error).toHaveBeenCalled();
        });

        test('should handle AbortSignal cancellation', async () => {
            const abortController = new AbortController();
            abortController.abort();

            mockFetch.mockRejectedValueOnce(new Error('Aborted'));

            await expect(
                window.AlertsData.createAlert({}, { signal: abortController.signal })
            ).rejects.toThrow();
        });
    });

    describe('Cache Integration', () => {
        test('should save to cache after successful load', async () => {
            // Disable CacheTTLGuard to test direct API call and cache save
            const originalCacheTTLGuard = window.CacheTTLGuard;
            window.CacheTTLGuard = null;
            mockUnifiedCacheManager.get.mockResolvedValueOnce(null); // Cache is empty

            const mockAlerts = [{ id: 1, ticker_id: 1 }];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockAlerts })
            });

            await window.AlertsData.loadAlertsData();

            expect(mockUnifiedCacheManager.save).toHaveBeenCalled();
            const saveCall = mockUnifiedCacheManager.save.mock.calls[0];
            expect(saveCall[0]).toBe('alerts-data');
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

            await window.AlertsData.loadAlertsData({ ttl: customTTL });

            expect(mockUnifiedCacheManager.save).toHaveBeenCalled();
            const saveCall = mockUnifiedCacheManager.save.mock.calls[0];
            expect(saveCall[2]).toMatchObject({ ttl: customTTL });

            // Restore CacheTTLGuard
            window.CacheTTLGuard = originalCacheTTLGuard;
        });
    });
});

