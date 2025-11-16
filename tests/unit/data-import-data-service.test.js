/**
 * Data Import Data Service Unit Tests
 * ===================================
 * 
 * Unit tests for the Data Import Data Service
 * Tests loading trading accounts and import history with cache integration
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');
const { loadScriptWithDependencies } = require('../utils/test-loader');

describe('Data Import Data Service', () => {
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

        // Load the actual Data Import Data Service code
        const dataImportCode = fs.readFileSync(
            path.join(__dirname, '../../trading-ui/scripts/services/data-import-data.js'),
            'utf8'
        );
        eval(dataImportCode);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockFetch.mockClear();
        mockUnifiedCacheManager.save.mockClear();
        mockUnifiedCacheManager.get.mockClear();
        mockUnifiedCacheManager.invalidate.mockClear();
        mockCacheTTLGuard.ensure.mockClear();
        mockCacheSyncManager.invalidateByAction.mockClear();
        mockLogger.info.mockClear();
        mockLogger.error.mockClear();
        mockShowErrorNotification.mockClear();
    });

    describe('Service Initialization', () => {
        test('should initialize DataImportData service', () => {
            expect(window.DataImportData).toBeDefined();
            expect(window.DataImportData.loadTradingAccountsForImport).toBeDefined();
            expect(window.DataImportData.loadImportHistoryData).toBeDefined();
            expect(window.DataImportData.invalidateAccountsCache).toBeDefined();
        });

        test('should have correct cache keys and TTL', () => {
            expect(window.DataImportData.ACCOUNTS_KEY).toBe('data-import-accounts');
            expect(window.DataImportData.KEY).toBe('data-import-data');
            expect(window.DataImportData.TTL).toBe(60000); // 60 seconds
        });
    });

    describe('loadTradingAccountsForImport', () => {
        const mockAccounts = [
            { id: 1, name: 'Account 1', status: 'active' },
            { id: 2, name: 'Account 2', status: 'active' }
        ];

        test('should load accounts from API when cache is empty', async () => {
            // Disable CacheTTLGuard to test direct API call
            const originalCacheTTLGuard = window.CacheTTLGuard;
            window.CacheTTLGuard = null;
            mockUnifiedCacheManager.get.mockResolvedValueOnce(null); // Cache is empty

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockAccounts })
            });

            const accounts = await window.DataImportData.loadTradingAccountsForImport();

            expect(mockFetch).toHaveBeenCalled();
            // Accounts are normalized, so they may have updated_at field
            expect(accounts).toHaveLength(2);
            expect(accounts[0]).toMatchObject({ id: 1, name: 'Account 1' });
            expect(mockUnifiedCacheManager.save).toHaveBeenCalled();

            // Restore CacheTTLGuard
            window.CacheTTLGuard = originalCacheTTLGuard;
        });

        test('should use CacheTTLGuard when available', async () => {
            // Ensure CacheTTLGuard is available
            window.CacheTTLGuard = mockCacheTTLGuard;
            mockCacheTTLGuard.ensure.mockResolvedValueOnce(mockAccounts);

            const accounts = await window.DataImportData.loadTradingAccountsForImport();

            expect(mockCacheTTLGuard.ensure).toHaveBeenCalledWith(
                'data-import-accounts',
                expect.any(Function),
                expect.objectContaining({ ttl: 60000 })
            );
            expect(accounts).toHaveLength(2);
        });

        test('should use UnifiedCacheManager when CacheTTLGuard not available', async () => {
            const originalCacheTTLGuard = window.CacheTTLGuard;
            window.CacheTTLGuard = null;
            // Mock cache hit
            mockUnifiedCacheManager.get.mockResolvedValueOnce(mockAccounts);

            const accounts = await window.DataImportData.loadTradingAccountsForImport();

            expect(mockUnifiedCacheManager.get).toHaveBeenCalledWith(
                'data-import-accounts',
                expect.objectContaining({ ttl: 60000 })
            );
            expect(accounts).toHaveLength(2);
            // Should not call fetch when cache is available
            expect(mockFetch).not.toHaveBeenCalled();

            // Restore CacheTTLGuard
            window.CacheTTLGuard = originalCacheTTLGuard;
        });

        test('should force reload when force=true', async () => {
            // Disable CacheTTLGuard to test direct force reload
            const originalCacheTTLGuard = window.CacheTTLGuard;
            window.CacheTTLGuard = null;

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockAccounts })
            });

            const accounts = await window.DataImportData.loadTradingAccountsForImport({ force: true });

            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('trading-account-updated');
            expect(mockFetch).toHaveBeenCalled();
            expect(accounts).toHaveLength(2);

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
                window.DataImportData.loadTradingAccountsForImport()
            ).rejects.toThrow();

            expect(mockLogger.error).toHaveBeenCalled();
            expect(mockShowErrorNotification).toHaveBeenCalled();

            // Restore CacheTTLGuard
            window.CacheTTLGuard = originalCacheTTLGuard;
        });

        test('should normalize account data correctly', async () => {
            // Disable CacheTTLGuard to test direct API call
            const originalCacheTTLGuard = window.CacheTTLGuard;
            window.CacheTTLGuard = null;
            mockUnifiedCacheManager.get.mockResolvedValueOnce(null); // Cache is empty

            const rawAccounts = [
                { id: 1, name: 'Account 1', created_at: '2025-01-01' },
                { id: 2, name: 'Account 2', last_activity_at: '2025-01-02' }
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: rawAccounts })
            });

            const accounts = await window.DataImportData.loadTradingAccountsForImport();

            expect(accounts[0].updated_at).toBe('2025-01-01'); // Should use created_at
            expect(accounts[1].updated_at).toBe('2025-01-02'); // Should use last_activity_at

            // Restore CacheTTLGuard
            window.CacheTTLGuard = originalCacheTTLGuard;
        });
    });

    describe('loadImportHistoryData', () => {
        const mockHistory = [
            { id: 1, account_id: 1, date: '2025-01-01', status: 'completed' },
            { id: 2, account_id: 1, date: '2025-01-02', status: 'completed' }
        ];

        test('should load history from API when cache is empty', async () => {
            // Disable CacheTTLGuard to test direct API call
            const originalCacheTTLGuard = window.CacheTTLGuard;
            window.CacheTTLGuard = null;
            mockUnifiedCacheManager.get.mockResolvedValueOnce(null); // Cache is empty

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ sessions: mockHistory })
            });

            const history = await window.DataImportData.loadImportHistoryData({ accountId: 1 });

            expect(mockFetch).toHaveBeenCalled();
            expect(history).toHaveLength(2);
            expect(history[0]).toMatchObject({ id: 1, account_id: 1 });

            // Restore CacheTTLGuard
            window.CacheTTLGuard = originalCacheTTLGuard;
        });

        test('should return empty array when accountId is missing', async () => {
            const history = await window.DataImportData.loadImportHistoryData({});

            expect(history).toEqual([]);
            expect(mockLogger.warn).toHaveBeenCalled();
        });

        test('should use CacheTTLGuard when available', async () => {
            window.CacheTTLGuard = mockCacheTTLGuard;
            mockCacheTTLGuard.ensure.mockResolvedValueOnce(mockHistory);

            const history = await window.DataImportData.loadImportHistoryData({ accountId: 1 });

            expect(mockCacheTTLGuard.ensure).toHaveBeenCalled();
            expect(history).toHaveLength(2);
            // Should not call fetch when CacheTTLGuard returns cached data
            expect(mockFetch).not.toHaveBeenCalled();
        });

        test('should force reload when force=true', async () => {
            // Disable CacheTTLGuard to test direct force reload
            const originalCacheTTLGuard = window.CacheTTLGuard;
            window.CacheTTLGuard = null;

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ sessions: mockHistory })
            });

            const history = await window.DataImportData.loadImportHistoryData({
                accountId: 1,
                force: true
            });

            expect(mockFetch).toHaveBeenCalled();
            expect(history).toHaveLength(2);

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
                status: 404
            });

            await expect(
                window.DataImportData.loadImportHistoryData({ accountId: 1 })
            ).rejects.toThrow();

            expect(mockLogger.error).toHaveBeenCalled();

            // Restore CacheTTLGuard
            window.CacheTTLGuard = originalCacheTTLGuard;
        });

        test('should normalize history data correctly', async () => {
            // Disable CacheTTLGuard to test direct API call
            const originalCacheTTLGuard = window.CacheTTLGuard;
            window.CacheTTLGuard = null;
            mockUnifiedCacheManager.get.mockResolvedValueOnce(null); // Cache is empty

            const rawHistory = [
                { id: 1, account_id: 1, date: '2025-01-01' },
                { id: 2, account_id: 1, modified_at: '2025-01-02' }
            ];

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ sessions: rawHistory })
            });

            const history = await window.DataImportData.loadImportHistoryData({ accountId: 1 });

            expect(history[0].created_at).toBe('2025-01-01'); // Should use date
            expect(history[1].updated_at).toBe('2025-01-02'); // Should use modified_at

            // Restore CacheTTLGuard
            window.CacheTTLGuard = originalCacheTTLGuard;
        });
    });

    describe('invalidateAccountsCache', () => {
        test('should use CacheSyncManager when available', async () => {
            await window.DataImportData.invalidateAccountsCache();

            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('trading-account-updated');
        });

        test('should fallback to UnifiedCacheManager when CacheSyncManager fails', async () => {
            mockCacheSyncManager.invalidateByAction.mockRejectedValueOnce(new Error('Sync failed'));

            await window.DataImportData.invalidateAccountsCache();

            expect(mockUnifiedCacheManager.invalidate).toHaveBeenCalledWith('data-import-accounts');
        });

        test('should fallback to clearByPattern when invalidate not available', async () => {
            const originalCacheSyncManager = window.CacheSyncManager;
            window.CacheSyncManager = null;
            const originalInvalidate = mockUnifiedCacheManager.invalidate;
            mockUnifiedCacheManager.invalidate = undefined;

            await window.DataImportData.invalidateAccountsCache();

            expect(mockUnifiedCacheManager.clearByPattern).toHaveBeenCalledWith('data-import-accounts');

            // Restore
            window.CacheSyncManager = originalCacheSyncManager;
            mockUnifiedCacheManager.invalidate = originalInvalidate;
        });
    });

    describe('Error Handling', () => {
        test('should handle network errors', async () => {
            mockFetch.mockRejectedValueOnce(new Error('Network error'));

            await expect(
                window.DataImportData.loadTradingAccountsForImport()
            ).rejects.toThrow('Network error');

            expect(mockLogger.error).toHaveBeenCalled();
            expect(mockShowErrorNotification).toHaveBeenCalled();
        });

        test('should handle invalid JSON responses', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => { throw new Error('Invalid JSON'); }
            });

            await expect(
                window.DataImportData.loadTradingAccountsForImport()
            ).rejects.toThrow();
        });
    });

    describe('Cache Integration', () => {
        test('should save to cache after successful API call', async () => {
            // Disable CacheTTLGuard to test direct API call and cache save
            const originalCacheTTLGuard = window.CacheTTLGuard;
            window.CacheTTLGuard = null;
            mockUnifiedCacheManager.get.mockResolvedValueOnce(null); // Cache is empty

            const mockAccounts = [{ id: 1, name: 'Account 1' }];
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: mockAccounts })
            });

            await window.DataImportData.loadTradingAccountsForImport();

            expect(mockUnifiedCacheManager.save).toHaveBeenCalled();
            const saveCall = mockUnifiedCacheManager.save.mock.calls[0];
            expect(saveCall[0]).toBe('data-import-accounts');
            expect(saveCall[2]).toMatchObject({ ttl: 60000 });

            // Restore CacheTTLGuard
            window.CacheTTLGuard = originalCacheTTLGuard;
        });

        test('should use custom TTL when provided', async () => {
            // Disable CacheTTLGuard to test direct API call with custom TTL
            const originalCacheTTLGuard = window.CacheTTLGuard;
            window.CacheTTLGuard = null;
            mockUnifiedCacheManager.get.mockResolvedValueOnce(null); // Cache is empty

            const customTTL = 120000;
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({ data: [] })
            });

            await window.DataImportData.loadTradingAccountsForImport({ ttl: customTTL });

            expect(mockUnifiedCacheManager.save).toHaveBeenCalled();
            const saveCall = mockUnifiedCacheManager.save.mock.calls[0];
            expect(saveCall[2]).toMatchObject({ ttl: customTTL });

            // Restore CacheTTLGuard
            window.CacheTTLGuard = originalCacheTTLGuard;
        });
    });
});

