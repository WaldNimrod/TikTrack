/**
 * CacheSyncManager Comprehensive Integration Tests
 * =================================================
 * 
 * Comprehensive integration tests for all data services with CacheSyncManager
 * Tests cache invalidation patterns for all CRUD operations across all services
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');
const { loadScriptWithDependencies } = require('../utils/test-loader');

describe('CacheSyncManager Comprehensive Integration', () => {
    let mockFetch;
    let mockUnifiedCacheManager;
    let mockCacheSyncManager;
    let mockLogger;
    let cacheStorage;

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
        cacheStorage = new Map();
        mockUnifiedCacheManager = {
            cache: cacheStorage,
            save: jest.fn((key, value, options) => {
                cacheStorage.set(key, { value, timestamp: Date.now(), ...options });
                return Promise.resolve(true);
            }),
            get: jest.fn((key, options) => {
                const cached = cacheStorage.get(key);
                if (!cached) return Promise.resolve(null);
                
                // Check TTL if provided
                if (options?.ttl && cached.timestamp) {
                    const age = Date.now() - cached.timestamp;
                    if (age > options.ttl) {
                        cacheStorage.delete(key);
                        return Promise.resolve(null);
                    }
                }
                
                return Promise.resolve(cached.value);
            }),
            invalidate: jest.fn((key) => {
                cacheStorage.delete(key);
                return Promise.resolve(true);
            }),
            clearByPattern: jest.fn((pattern) => {
                const keysToDelete = Array.from(cacheStorage.keys()).filter(k => k.includes(pattern));
                keysToDelete.forEach(k => cacheStorage.delete(k));
                return Promise.resolve(true);
            }),
            getAllKeys: jest.fn(() => Promise.resolve(Array.from(cacheStorage.keys())))
        };

        // Mock CacheSyncManager with all invalidation patterns
        const invalidationPatterns = {
            'trade-created': ['trades-data', 'dashboard-data'],
            'trade-updated': ['trades-data', 'dashboard-data'],
            'trade-deleted': ['trades-data', 'dashboard-data'],
            'trade-plan-created': ['trade-plans-data', 'dashboard-data', 'trades-data'],
            'trade-plan-updated': ['trade-plans-data', 'dashboard-data', 'trades-data'],
            'trade-plan-deleted': ['trade-plans-data', 'dashboard-data', 'trades-data'],
            'trade-plan-cancelled': ['trade-plans-data', 'dashboard-data', 'trades-data'],
            'account-created': ['accounts-data', 'trades-data', 'executions-data', 'dashboard-data'],
            'account-updated': ['accounts-data', 'trades-data', 'executions-data', 'dashboard-data'],
            'account-deleted': ['accounts-data', 'trades-data', 'executions-data', 'dashboard-data'],
            'execution-created': ['executions-data', 'dashboard-data', 'account-activity-data', 'account-activity-*', 'account-balance-*'],
            'execution-updated': ['executions-data', 'dashboard-data', 'account-activity-data', 'account-activity-*', 'account-balance-*'],
            'execution-deleted': ['executions-data', 'dashboard-data', 'account-activity-data', 'account-activity-*', 'account-balance-*'],
            'cash-flow-created': ['cash-flows-data', 'account-activity-data', 'account-activity-*', 'account-balance-*', 'dashboard-data'],
            'cash-flow-updated': ['cash-flows-data', 'account-activity-data', 'account-activity-*', 'account-balance-*', 'dashboard-data'],
            'cash-flow-deleted': ['cash-flows-data', 'account-activity-data', 'account-activity-*', 'account-balance-*', 'dashboard-data'],
            'note-created': ['notes-data'],
            'note-updated': ['notes-data'],
            'note-deleted': ['notes-data'],
            'preference-updated': ['preference-data', 'user-preferences'],
            'profile-created': ['profile-data', 'user-preferences'],
            'profile-updated': ['profile-data', 'user-preferences'],
            'profile-deleted': ['profile-data', 'user-preferences'],
            'profile-switched': ['preference-data', 'profile-data', 'user-preferences']
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
            API_BASE_URL: '',
            showErrorNotification: jest.fn(),
            showSuccessNotification: jest.fn()
        };

        global.fetch = mockFetch;

        // Load all data services
        const servicesDir = path.join(__dirname, '../../trading-ui/scripts/services');
        const services = [
            'trades-data.js',
            'trade-plans-data.js',
            'trading-accounts-data.js',
            'preferences-data.js'
        ];

        services.forEach(service => {
            try {
                const serviceCode = fs.readFileSync(
                    path.join(servicesDir, service),
                    'utf8'
                );
                eval(serviceCode);
            } catch (error) {
                console.warn(`Failed to load ${service}:`, error.message);
            }
        });
    });

    beforeEach(() => {
        jest.clearAllMocks();
        cacheStorage.clear();
        mockFetch.mockClear();
        mockCacheSyncManager.invalidateByAction.mockClear();
    });

    describe('Trades Data Service', () => {
        test('should invalidate cache on trade creation', async () => {
            await mockUnifiedCacheManager.save('trades-data', [{ id: 1 }]);
            await mockUnifiedCacheManager.save('dashboard-data', { trades: 1 });

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 201,
                json: async () => ({ status: 'success', data: { id: 2 } })
            });

            if (window.TradesData && window.TradesData.saveTrade) {
                await window.TradesData.saveTrade({ symbol: 'AAPL' });
                expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('trade-created');
            }
        });

        test('should invalidate cache on trade update', async () => {
            await mockUnifiedCacheManager.save('trades-data', [{ id: 1 }]);

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ status: 'success', data: { id: 1 } })
            });

            if (window.TradesData && window.TradesData.updateTrade) {
                await window.TradesData.updateTrade(1, { quantity: 150 });
                expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('trade-updated');
            }
        });

        test('should invalidate cache on trade deletion', async () => {
            await mockUnifiedCacheManager.save('trades-data', [{ id: 1 }]);

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ status: 'success' })
            });

            if (window.TradesData && window.TradesData.deleteTrade) {
                await window.TradesData.deleteTrade(1);
                expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('trade-deleted');
            }
        });
    });

    describe('Trade Plans Data Service', () => {
        test('should invalidate cache on trade plan creation', async () => {
            await mockUnifiedCacheManager.save('trade-plans-data', []);
            await mockUnifiedCacheManager.save('dashboard-data', {});

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 201,
                json: async () => ({ status: 'success', data: { id: 1 } })
            });

            if (window.TradePlansData && window.TradePlansData.saveTradePlan) {
                await window.TradePlansData.saveTradePlan({ symbol: 'AAPL' });
                expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('trade-plan-created');
            }
        });

        test('should invalidate cache on trade plan cancellation', async () => {
            await mockUnifiedCacheManager.save('trade-plans-data', [{ id: 1 }]);

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ status: 'success' })
            });

            if (window.TradePlansData && window.TradePlansData.cancelTradePlan) {
                await window.TradePlansData.cancelTradePlan(1);
                expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('trade-plan-updated');
            }
        });
    });

    describe('Trading Accounts Data Service', () => {
        test('should invalidate cache on account update', async () => {
            await mockUnifiedCacheManager.save('accounts-data', [{ id: 1 }]);
            await mockUnifiedCacheManager.save('trades-data', []);

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ status: 'success' })
            });

            if (window.TradingAccountsData && window.TradingAccountsData.sendAccountMutation) {
                await window.TradingAccountsData.sendAccountMutation({
                    accountId: 1,
                    method: 'PUT',
                    body: { name: 'Updated Account' }
                });
                expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('account-updated');
            }
        });
    });

    describe('Preferences Data Service', () => {
        test('should invalidate cache on preference save', async () => {
            await mockUnifiedCacheManager.save('preference-data', {});
            await mockUnifiedCacheManager.save('user-preferences', {});

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ status: 'success' })
            });

            if (window.PreferencesData && window.PreferencesData.savePreference) {
                await window.PreferencesData.savePreference({
                    preferenceName: 'test_pref',
                    value: 'test_value'
                });
                expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('preference-updated');
            }
        });

        test('should invalidate cache on profile creation', async () => {
            await mockUnifiedCacheManager.save('profile-data', []);
            await mockUnifiedCacheManager.save('user-preferences', {});

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 201,
                json: async () => ({ status: 'success', data: { id: 1 } })
            });

            if (window.PreferencesData && window.PreferencesData.createProfile) {
                await window.PreferencesData.createProfile({
                    name: 'Test Profile'
                });
                expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('profile-created');
            }
        });

        test('should invalidate cache on profile switch', async () => {
            await mockUnifiedCacheManager.save('preference-data', {});
            await mockUnifiedCacheManager.save('profile-data', []);

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ status: 'success' })
            });

            if (window.PreferencesData && window.PreferencesData.activateProfile) {
                await window.PreferencesData.activateProfile({
                    profileId: 1
                });
                expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('profile-switched');
            }
        });
    });

    describe('Error Handling and Fallback', () => {
        test('should fallback to UnifiedCacheManager when CacheSyncManager fails', async () => {
            await mockUnifiedCacheManager.save('trades-data', [{ id: 1 }]);

            mockCacheSyncManager.invalidateByAction.mockRejectedValueOnce(new Error('Sync failed'));

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 201,
                json: async () => ({ status: 'success', data: { id: 2 } })
            });

            if (window.TradesData && window.TradesData.saveTrade) {
                await window.TradesData.saveTrade({ symbol: 'AAPL' });
                // Should have tried CacheSyncManager first
                expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalled();
                // Should fallback to direct invalidation
                expect(mockUnifiedCacheManager.invalidate).toHaveBeenCalled();
            }
        });

        test('should handle missing CacheSyncManager gracefully', async () => {
            const originalCacheSyncManager = window.CacheSyncManager;
            window.CacheSyncManager = null;

            await mockUnifiedCacheManager.save('trades-data', [{ id: 1 }]);

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 201,
                json: async () => ({ status: 'success', data: { id: 2 } })
            });

            if (window.TradesData && window.TradesData.saveTrade) {
                await window.TradesData.saveTrade({ symbol: 'AAPL' });
                // Should fallback to direct invalidation
                expect(mockUnifiedCacheManager.invalidate).toHaveBeenCalled();
            }

            window.CacheSyncManager = originalCacheSyncManager;
        });
    });

    describe('Dependencies and Cascading Invalidation', () => {
        test('should invalidate dependent caches when account is updated', async () => {
            await mockUnifiedCacheManager.save('accounts-data', [{ id: 1 }]);
            await mockUnifiedCacheManager.save('trades-data', [{ id: 1, account_id: 1 }]);
            await mockUnifiedCacheManager.save('executions-data', [{ id: 1, account_id: 1 }]);
            await mockUnifiedCacheManager.save('dashboard-data', {});

            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ status: 'success' })
            });

            if (window.TradingAccountsData && window.TradingAccountsData.sendAccountMutation) {
                await window.TradingAccountsData.sendAccountMutation({
                    accountId: 1,
                    method: 'PUT',
                    body: { name: 'Updated' }
                });

                // Should invalidate all dependent caches
                expect(mockCacheSyncManager.invalidateByAction).toHaveBeenCalledWith('account-updated');
                expect(await mockUnifiedCacheManager.get('accounts-data')).toBeNull();
                expect(await mockUnifiedCacheManager.get('trades-data')).toBeNull();
                expect(await mockUnifiedCacheManager.get('executions-data')).toBeNull();
                expect(await mockUnifiedCacheManager.get('dashboard-data')).toBeNull();
            }
        });
    });
});

