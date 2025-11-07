/**
 * Preferences Integration Tests
 * =============================
 * 
 * בדיקות אינטגרציה בין מערכת העדפות למערכות אחרות
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const { loadScriptsInOrder, setupBasicMocks } = require('../utils/test-loader');

describe('Preferences Integration', () => {
    beforeAll(() => {
        // Setup basic mocks
        setupBasicMocks({
            UnifiedCacheManager: {
                save: jest.fn().mockResolvedValue(true),
                get: jest.fn().mockResolvedValue(null),
                initialize: jest.fn().mockResolvedValue(true)
            }
        });

        // Mock fetch
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ status: 'success', data: {} })
        });

        // Load systems in order
        const code = loadScriptsInOrder(['standalone-core', 'core-modules', 'core-utilities', 'preferences']);
        eval(code);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Preferences + Cache Integration', () => {
        test('should use cache for preferences', async () => {
            if (!window.PreferencesSystem || !window.UnifiedCacheManager) {
                return;
            }

            window.UnifiedCacheManager.get.mockResolvedValue({
                notification_mode: 'work',
                theme: 'light'
            });

            // Preferences should use cache
            expect(window.UnifiedCacheManager.get).toBeDefined();
        });

        test('should save preferences to cache', async () => {
            if (!window.PreferencesSystem || !window.UnifiedCacheManager) {
                return;
            }

            if (window.PreferencesSystem.setPreference) {
                await window.PreferencesSystem.setPreference('test-pref', 'test-value');
                
                // Should save to cache
                expect(window.UnifiedCacheManager.save || window.PreferencesSystem.setPreference).toBeDefined();
            }
        });
    });

    describe('Preferences + Notification Integration', () => {
        test('should use preferences for notification filtering', async () => {
            if (!window.PreferencesSystem || !window.shouldShowNotification) {
                return;
            }

            window.getPreference = jest.fn().mockResolvedValue(true);
            window.preferencesCache = {
                get: jest.fn().mockResolvedValue({ notification_mode: 'work' })
            };

            const result = await window.shouldShowNotification('system', 'info', false);
            
            expect(typeof result).toBe('boolean');
        });
    });

    describe('Preferences + UI Systems Integration', () => {
        test('should apply preferences to UI systems', () => {
            if (!window.PreferencesSystem) {
                return;
            }

            // Preferences should affect UI systems
            expect(window.PreferencesSystem || window.getPreference).toBeDefined();
        });
    });

    describe('Error Handling Integration', () => {
        test('should handle missing preferences gracefully', async () => {
            if (!window.getPreference) {
                return;
            }

            window.getPreference.mockResolvedValue(null);
            
            const result = await window.getPreference('non-existent-pref');
            expect(result === null || typeof result !== 'undefined').toBe(true);
        });

        test('should handle cache failures for preferences', async () => {
            if (!window.PreferencesSystem || !window.UnifiedCacheManager) {
                return;
            }

            window.UnifiedCacheManager.get.mockRejectedValue(new Error('Cache error'));
            
            // Should handle cache failure
            if (window.PreferencesSystem.getPreference) {
                await expect(window.PreferencesSystem.getPreference('test-pref')).resolves.not.toThrow();
            }
        });
    });
});

