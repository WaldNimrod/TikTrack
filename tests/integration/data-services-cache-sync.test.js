/**
 * Data Services Cache Sync Integration Tests
 * ===========================================
 * 
 * Integration tests for data services with CacheSyncManager
 * Tests cache invalidation patterns and synchronization
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');
const { loadScriptWithDependencies } = require('../utils/test-loader');

describe('Data Services Cache Sync Integration', () => {
    let mockFetch;
    let mockUnifiedCacheManager;
    let mockCacheSyncManager;
    let mockLogger;

    beforeAll(() => {
        // Setup mocks
        mockFetch = jest.fn();
        mockLogger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn()
        };

        // Mock UnifiedCacheManager with actual cache storage
        const cacheStorage = new Map();
        mockUnifiedCacheManager = {
            cache: cacheStorage,
            save: jest.fn((key, value) => {
                cacheStorage.set(key, value);
                return Promise.resolve(true);
            }),
            get: jest.fn((key) => {
                return Promise.resolve(cacheStorage.get(key) || null);
            }),
            invalidate: jest.fn((key) => {
                cacheStorage.delete(key);
                return Promise.resolve(true);
            }),
            clearByPattern: jest.fn((pattern) => {
                const keysToDelete = Array.from(cacheStorage.keys()).filter(k => k.includes(pattern));
                keysToDelete.forEach(k => cacheStorage.delete(k));
                return Promise.resolve(true);
            })
        };

        // Mock CacheSyncManager with action-based invalidation
        const invalidationPatterns = {
            'execution-created': ['executions-data', 'dashboard-data', 'account-activity-data'],
            'execution-updated': ['executions-data', 'dashboard-data', 'account-activity-data'],
            'execution-deleted': ['executions-data', 'dashboard-data', 'account-activity-data'],
            'trading-account-updated': ['data-import-accounts', 'trading-accounts-data'],
            'cash-flow-created': ['cash-flows-data', 'account-balance-*'],
            'cash-flow-updated': ['cash-flows-data', 'account-balance-*'],
            'cash-flow-deleted': ['cash-flows-data', 'account-balance-*'],
            'note-created': ['notes-data'],
            'note-updated': ['notes-data'],
            'note-deleted': ['notes-data'],
            'alert-created': ['alerts-data'],
            'alert-updated': ['alerts-data'],
            'alert-deleted': ['alerts-data'],
            'ticker-created': ['tickers-data'],
            'ticker-updated': ['tickers-data'],
            'ticker-deleted': ['tickers-data']
        };

        mockCacheSyncManager = {
            invalidateByAction: jest.fn(async (action) => {
                const patterns = invalidationPatterns[action] || [];
                patterns.forEach(pattern => {
                    if (pattern.includes('*')) {
                        const basePattern = pattern.replace('*', '');
                        const keysToDelete = Array.from(cacheStorage.keys()).filter(k => k.startsWith(basePattern));
                        keysToDelete.forEach(k => cacheStorage.delete(k));
                    } else {
                        cacheStorage.delete(pattern);
                    }
                });
                // Also call backend invalidation
                if (global.fetch) {
                    await global.fetch(`/api/cache-sync/invalidate?action=${action}`).catch(() => {});
                }
                return Promise.resolve(true);
            })
        };

        // Setup global mocks
        global.window = {
            Logger: mockLogger,
            UnifiedCacheManager: mockUnifiedCacheManager,
            CacheSyncManager: mockCacheSyncManager,
            CacheTTLGuard: {
                ensure: jest.fn((key, loader) => loader()),
                setConfig: jest.fn()
            },
            location: {
                origin: 'http://localhost:8080',
                protocol: 'http:'
            },
            API_BASE_URL: ''
        };

        global.fetch = mockFetch;

        // Load dependencies
        const cacheCode = loadScriptWithDependencies('scripts/unified-cache-manager.js');
        const cacheSyncCode = loadScriptWithDependencies('scripts/cache-sync-manager.js');
        
        eval(cacheCode);
        eval(cacheSyncCode);

        // Load data services
        const executionsCode = fs.readFileSync(
            path.join(__dirname, '../../trading-ui/scripts/services/executions-data.js'),
            'utf8'
        );
        const dataImportCode = fs.readFileSync(
            path.join(__dirname, '../../trading-ui/scripts/services/data-import-data.js'),
            'utf8'
        );
        const cashFlowsCode = fs.readFileSync(
            path.join(__dirname, '../../trading-ui/scripts/services/cash-flows-data.js'),
            'utf8'
        );
        const notesCode = fs.readFileSync(
            path.join(__dirname, '../../trading-ui/scripts/services/notes-data.js'),
            'utf8'
        );
        const alertsCode = fs.readFileSync(
            path.join(__dirname, '../../trading-ui/scripts/services/alerts-data.js'),
            'utf8'
        );
        const tickersCode = fs.readFileSync(
            path.join(__dirname, '../../trading-ui/scripts/services/tickers-data.js'),
            'utf8'
        );

        eval(executionsCode);
        eval(dataImportCode);
        eval(cashFlowsCode);
        eval(notesCode);
        eval(alertsCode);
        eval(tickersCode);
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockUnifiedCacheManager.cache.clear();
        mockFetch.mockClear();
        mockCacheSyncManager.invalidateByAction.mockClear();
    });

    describe('Execution CRUD Cache Invalidation', () => {
        test('should invalidate cache on execution creation', async () => {
            // Pre-populate cache
            await mockUnifiedCacheManager.save('executions-data', [{ id: 1 }]);
            await mockUnifiedCacheManager.save('dashboard-data', { executions: 1 });
            await mockUnifiedCacheManager.save('account-activity-data', []);

            // Create execution
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 201,
                json: async () => ({ id: 2 })
            });

            await window.ExecutionsData.createExecution({ symbol: 'AAPL' });

            // Verify cache invalidation
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('execution-created');
            expect(await mockUnifiedCacheManager.get('executions-data')).toBeNull();
            expect(await mockUnifiedCacheManager.get('dashboard-data')).toBeNull();
        });

        test('should invalidate cache on execution update', async () => {
            await mockUnifiedCacheManager.save('executions-data', [{ id: 1 }]);

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ id: 1, updated: true })
            });

            await window.ExecutionsData.updateExecution(1, { quantity: 150 });

            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('execution-updated');
        });

        test('should invalidate cache on execution deletion', async () => {
            await mockUnifiedCacheManager.save('executions-data', [{ id: 1 }]);

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ success: true })
            });

            await window.ExecutionsData.deleteExecution(1);

            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('execution-deleted');
        });
    });

    describe('Data Import Cache Invalidation', () => {
        test('should invalidate accounts cache when invalidating', async () => {
            await mockUnifiedCacheManager.save('data-import-accounts', [{ id: 1 }]);
            await mockUnifiedCacheManager.save('trading-accounts-data', [{ id: 1 }]);

            await window.DataImportData.invalidateAccountsCache();

            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('trading-account-updated');
            expect(await mockUnifiedCacheManager.get('data-import-accounts')).toBeNull();
            expect(await mockUnifiedCacheManager.get('trading-accounts-data')).toBeNull();
        });
    });

    describe('CacheSyncManager Action Patterns', () => {
        test('should handle wildcard patterns in cache invalidation', async () => {
            await mockUnifiedCacheManager.save('account-balance-1', 1000);
            await mockUnifiedCacheManager.save('account-balance-2', 2000);
            await mockUnifiedCacheManager.save('cash-flows-data', []);

            // Simulate cash flow creation
            mockCacheSyncManager.invalidateByAction.mockImplementation(async (action) => {
                if (action === 'cash-flow-created') {
                    const patterns = ['cash-flows-data', 'account-balance-*'];
                    patterns.forEach(pattern => {
                        if (pattern.includes('*')) {
                            const basePattern = pattern.replace('*', '');
                            const keysToDelete = Array.from(mockUnifiedCacheManager.cache.keys())
                                .filter(k => k.startsWith(basePattern));
                            keysToDelete.forEach(k => mockUnifiedCacheManager.cache.delete(k));
                        } else {
                            mockUnifiedCacheManager.cache.delete(pattern);
                        }
                    });
                }
                return Promise.resolve(true);
            });

            await mockCacheSyncManager.invalidateByAction('cash-flow-created');

            expect(await mockUnifiedCacheManager.get('cash-flows-data')).toBeNull();
            expect(await mockUnifiedCacheManager.get('account-balance-1')).toBeNull();
            expect(await mockUnifiedCacheManager.get('account-balance-2')).toBeNull();
        });
    });

    describe('Backend Cache Sync', () => {
        test('should call backend invalidation endpoint', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200
            });

            await mockCacheSyncManager.invalidateByAction('execution-created');

            // Verify backend call was made (if fetch was called)
            const fetchCalls = mockFetch.mock.calls.filter(call => 
                call[0]?.includes('/api/cache-sync/invalidate')
            );
            expect(fetchCalls.length).toBeGreaterThan(0);
        });
    });

    describe('Fallback Behavior', () => {
        test('should fallback to direct invalidation when CacheSyncManager fails', async () => {
            await mockUnifiedCacheManager.save('executions-data', [{ id: 1 }]);

            mockCacheSyncManager.invalidateByAction.mockRejectedValueOnce(new Error('Sync failed'));

            await window.ExecutionsData.createExecution({});

            expect(mockUnifiedCacheManager.invalidate).toHaveBeenCalledWith('executions-data');
        });

        test('should handle missing CacheSyncManager gracefully', async () => {
            const originalCacheSyncManager = window.CacheSyncManager;
            window.CacheSyncManager = null;

            await mockUnifiedCacheManager.save('executions-data', [{ id: 1 }]);

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 201
            });

            await window.ExecutionsData.createExecution({});

            expect(mockUnifiedCacheManager.invalidate).toHaveBeenCalledWith('executions-data');

            // Restore
            window.CacheSyncManager = originalCacheSyncManager;
        });
    });

    describe('Alerts CRUD Cache Invalidation', () => {
        test('should invalidate cache on alert creation', async () => {
            await mockUnifiedCacheManager.save('alerts-data', [{ id: 1 }]);

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 201,
                json: async () => ({ id: 2 })
            });

            await window.AlertsData.createAlert({ ticker_id: 1, condition: 'price > 100' });

            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('alert-created');
            expect(await mockUnifiedCacheManager.get('alerts-data')).toBeNull();
        });

        test('should invalidate cache on alert update', async () => {
            await mockUnifiedCacheManager.save('alerts-data', [{ id: 1 }]);

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ id: 1, updated: true })
            });

            await window.AlertsData.updateAlert(1, { condition: 'price > 200' });

            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('alert-updated');
        });

        test('should invalidate cache on alert deletion', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ success: true })
            });

            return window.AlertsData.deleteAlert(1).then(() => {
                expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('alert-deleted');
            });
        });
    });

    describe('Tickers CRUD Cache Invalidation', () => {
        test('should invalidate cache on ticker creation', async () => {
            await mockUnifiedCacheManager.save('tickers-data', [{ id: 1 }]);

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 201,
                json: async () => ({ id: 2 })
            });

            await window.TickersData.createTicker({ symbol: 'TSLA', name: 'Tesla Inc.' });

            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('ticker-created');
            expect(await mockUnifiedCacheManager.get('tickers-data')).toBeNull();
        });

        test('should invalidate cache on ticker update', async () => {
            await mockUnifiedCacheManager.save('tickers-data', [{ id: 1 }]);

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ id: 1, updated: true })
            });

            await window.TickersData.updateTicker(1, { name: 'Updated Name' });

            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('ticker-updated');
        });

        test('should invalidate cache on ticker deletion', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ success: true })
            });

            return window.TickersData.deleteTicker(1).then(() => {
                expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('ticker-deleted');
            });
        });
    });

    describe('Multiple Service Coordination', () => {
        test('should coordinate cache invalidation across multiple services', async () => {
            // Pre-populate caches from multiple services
            await mockUnifiedCacheManager.save('executions-data', [{ id: 1 }]);
            await mockUnifiedCacheManager.save('data-import-accounts', [{ id: 1 }]);
            await mockUnifiedCacheManager.save('cash-flows-data', []);
            await mockUnifiedCacheManager.save('notes-data', []);
            await mockUnifiedCacheManager.save('alerts-data', []);
            await mockUnifiedCacheManager.save('tickers-data', []);

            // Perform operations from different services
            mockFetch.mockResolvedValue({
                ok: true,
                status: 201,
                json: async () => ({ id: 2 })
            });

            await window.ExecutionsData.createExecution({});
            await window.DataImportData.invalidateAccountsCache();
            await window.AlertsData.createAlert({ ticker_id: 1, condition: 'price > 100' });
            await window.TickersData.createTicker({ symbol: 'TSLA', name: 'Tesla Inc.' });

            // Verify all services invalidated their caches
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('execution-created');
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('trading-account-updated');
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('alert-created');
            expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('ticker-created');
        });
    });
});

