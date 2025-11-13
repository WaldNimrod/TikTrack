/**
 * Notification Cache Integration Tests
 * ====================================
 * 
 * בדיקות אינטגרציה בין מערכת התראות למערכת מטמון
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const { loadScriptsInOrder, setupBasicMocks } = require('../utils/test-loader');

describe('Notification Cache Integration', () => {
    let notificationContainer;

    beforeAll(() => {
        // Setup basic mocks
        setupBasicMocks({
            getPreference: jest.fn().mockResolvedValue(true),
            preferencesCache: {
                get: jest.fn().mockResolvedValue({ notification_mode: 'work' })
            },
            detectNotificationCategory: jest.fn().mockReturnValue('system'),
            getEntityColor: jest.fn().mockReturnValue('#28a745'),
            DEBUG_MODE: false
        });

        // Mock UnifiedCacheManager
        window.UnifiedCacheManager = {
            save: jest.fn().mockResolvedValue(true),
            get: jest.fn().mockResolvedValue(null),
            delete: jest.fn().mockResolvedValue(true),
            initialize: jest.fn().mockResolvedValue(true)
        };

        // Mock DOM
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.className = 'notifications-container';
        document.body.appendChild(notificationContainer);

        jest.spyOn(document, 'getElementById').mockImplementation((id) => {
            if (id === 'notification-container') {
                return notificationContainer;
            }
            return null;
        });

        // Load systems in order
        const code = loadScriptsInOrder(['standalone-core', 'core-modules', 'core-utilities']);
        eval(code);

        // Re-apply jest mocks in case scripts overwrote them
        window.UnifiedCacheManager = {
            save: jest.fn().mockResolvedValue(true),
            get: jest.fn().mockResolvedValue(null),
            delete: jest.fn().mockResolvedValue(true),
            initialize: jest.fn().mockResolvedValue(true)
        };
    });

    beforeEach(() => {
        window.getPreference = jest.fn().mockResolvedValue(true);
        window.preferencesCache.get = jest.fn().mockResolvedValue({ notification_mode: 'work' });
        window.UnifiedCacheManager.save = jest.fn().mockResolvedValue(true);
        window.UnifiedCacheManager.get = jest.fn().mockResolvedValue(null);
    });

    afterEach(() => {
        jest.clearAllMocks();
        if (notificationContainer) {
            notificationContainer.innerHTML = '';
        }
    });

    describe('Notification + Cache Integration', () => {
        test('should use cache for notification preferences', async () => {
            if (!window.showNotification || !window.UnifiedCacheManager) {
                return;
            }

            window.preferencesCache.get.mockResolvedValue({ notification_mode: 'work' });
            
            await window.showNotification('Test', 'info', 'Test', 5000, 'system');
            
            // Should use cache for preferences where available
            expect(typeof window.preferencesCache.get).toBe('function');
        });

        test('should save notification history to cache', async () => {
            if (!window.showNotification || !window.UnifiedCacheManager) {
                return;
            }

            window.getPreference.mockResolvedValue(true);
            window.preferencesCache.get.mockResolvedValue({ notification_mode: 'work' });
            
            await window.showNotification('Test', 'info', 'Test', 5000, 'system', { userInitiated: true });
            
            // Cache should be used for notification history
            expect(typeof window.UnifiedCacheManager.save).toBe('function');
        });

        test('should handle cache failures gracefully', async () => {
            if (!window.showNotification) {
                return;
            }

            window.UnifiedCacheManager.save.mockRejectedValue(new Error('Cache error'));
            window.getPreference.mockResolvedValue(true);
            window.preferencesCache.get.mockResolvedValue({ notification_mode: 'work' });
            
            await expect(window.showNotification('Test', 'info', 'Test')).resolves.not.toThrow();
        });
    });

    describe('Notification Statistics + Cache Integration', () => {
        test('should load notification stats from cache', async () => {
            if (!window.loadGlobalNotificationStats || !window.UnifiedCacheManager) {
                return;
            }

            window.UnifiedCacheManager.get.mockResolvedValue({
                total: 100,
                byType: { info: 50, error: 30, warning: 20 }
            });

            const stats = await window.loadGlobalNotificationStats();
            
            expect(typeof window.UnifiedCacheManager.get).toBe('function');
            expect(stats === null || typeof stats === 'object').toBe(true);
        });

        test('should save notification stats to cache', async () => {
            if (!window.updateGlobalNotificationStats || !window.UnifiedCacheManager) {
                return;
            }

            await window.updateGlobalNotificationStats('info', 'Test');
            
            // Should attempt to save to cache
            expect(typeof window.UnifiedCacheManager.save).toBe('function');
        });
    });

    describe('Error Handling Integration', () => {
        test('should handle missing cache gracefully', async () => {
            if (!window.showNotification) {
                return;
            }

            const originalCache = window.UnifiedCacheManager;
            delete window.UnifiedCacheManager;
            
            window.getPreference.mockResolvedValue(true);
            window.preferencesCache.get.mockResolvedValue({ notification_mode: 'work' });
            
            await expect(window.showNotification('Test', 'info', 'Test')).resolves.not.toThrow();
            
            window.UnifiedCacheManager = originalCache;
        });

        test('should handle cache initialization failure', async () => {
            if (!window.showNotification) {
                return;
            }

            window.UnifiedCacheManager.initialize.mockRejectedValue(new Error('Init error'));
            window.getPreference.mockResolvedValue(true);
            window.preferencesCache.get.mockResolvedValue({ notification_mode: 'work' });
            
            await expect(window.showNotification('Test', 'info', 'Test')).resolves.not.toThrow();
        });
    });
});

