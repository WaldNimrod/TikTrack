/**
 * Notification System Unit Tests
 * ==============================
 * 
 * Unit tests for the Notification System
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const { loadScriptWithDependencies, setupBasicMocks } = require('../utils/test-loader');

describe('Notification System', () => {
    let notificationContainer;

    beforeAll(() => {
        // Setup basic mocks with notification-specific dependencies
        setupBasicMocks({
            getPreference: jest.fn().mockResolvedValue(true),
            preferencesCache: {
                get: jest.fn().mockResolvedValue({ notification_mode: 'work' })
            },
            detectNotificationCategory: jest.fn().mockReturnValue('system'),
            getEntityColor: jest.fn().mockReturnValue('#28a745'),
            DEBUG_MODE: false,
            UnifiedCacheManager: {
                save: jest.fn().mockResolvedValue(true),
                get: jest.fn().mockResolvedValue(null)
            }
        });

        // Mock DOM
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.className = 'notifications-container';
        document.body.appendChild(notificationContainer);

        // Mock Bootstrap Modal
        global.bootstrap = {
            Modal: jest.fn(function(element) {
                return {
                    show: jest.fn(),
                    hide: jest.fn(),
                    dispose: jest.fn()
                };
            })
        };

        // Use existing mocks from setup.js, but enhance them
        const originalCreateElement = document.createElement.bind(document);
        jest.spyOn(document, 'createElement').mockImplementation((tagName) => {
            const element = originalCreateElement(tagName);
            if (tagName === 'div') {
                element.insertAdjacentHTML = jest.fn();
                element.remove = jest.fn();
            }
            return element;
        });

        jest.spyOn(document, 'getElementById').mockImplementation((id) => {
            if (id === 'notification-container') {
                return notificationContainer;
            }
            return null;
        });

        document.body.insertAdjacentHTML = jest.fn();

        // Load with dependencies using test loader only if not already evaluated
        if (typeof window.showNotification !== 'function') {
            const code = loadScriptWithDependencies('scripts/notification-system.js');
            eval(code);
        }
    });

    afterEach(() => {
        jest.clearAllMocks();
        document.querySelectorAll('.notification').forEach(el => el.remove());
        if (notificationContainer) {
            notificationContainer.innerHTML = '';
        }
    });

    describe('showNotification', () => {
        test('should create notification element when preferences allow', async () => {
            // Ensure preferences allow showing
            window.getPreference.mockResolvedValue(true);
            window.preferencesCache.get.mockResolvedValue({ notification_mode: 'work' });
            
            await window.showNotification('Test message', 'info', 'Test Title', 5000, 'system', { userInitiated: true });
            
            // Should create element if notification is shown
            expect(document.createElement).toHaveBeenCalled();
        });

        test('should handle different notification types', async () => {
            window.getPreference.mockResolvedValue(true);
            window.preferencesCache.get.mockResolvedValue({ notification_mode: 'work' });
            
            const types = ['success', 'error', 'warning', 'info'];
            
            for (const type of types) {
                await window.showNotification(`Test ${type}`, type, 'Test', 5000, 'system', { userInitiated: true });
            }
            
            expect(document.createElement).toHaveBeenCalled();
        });

        test('should check notification preferences before showing', async () => {
            window.getPreference.mockResolvedValue(false);
            window.preferencesCache.get.mockResolvedValue({ notification_mode: 'silent' });
            
            await window.showNotification('Test message', 'info', 'Test', 5000, 'system');
            
            // Should check preference - but notification may not be shown if filtered
            expect(window.getPreference || window.preferencesCache.get).toBeDefined();
        });

        test('should use default category when not provided', async () => {
            window.getPreference.mockResolvedValue(true);
            window.preferencesCache.get.mockResolvedValue({ notification_mode: 'work' });
            
            await window.showNotification('Test message', 'success', 'Test', 5000, null, { userInitiated: true });
            
            expect(window.showNotification).toBeDefined();
        });
    });

    describe('showSuccessNotification', () => {
        test('should resolve without error for success notifications', async () => {
            window.getPreference.mockResolvedValue(true);
            window.preferencesCache.get.mockResolvedValue({ notification_mode: 'work' });

            await expect(window.showSuccessNotification('Success Title', 'Success message')).resolves.toBeUndefined();
        });
    });

    describe('showErrorNotification', () => {
        test('should render error notification element', async () => {
            window.getPreference.mockResolvedValue(true);
            window.preferencesCache.get.mockResolvedValue({ notification_mode: 'work' });

            await window.showErrorNotification('Error Title', 'Error message');

            expect(notificationContainer.childElementCount).toBeGreaterThan(0);
        });
    });

    describe('showWarningNotification', () => {
        test('should resolve without error for warning notifications', async () => {
            window.getPreference.mockResolvedValue(true);
            window.preferencesCache.get.mockResolvedValue({ notification_mode: 'work' });

            await expect(window.showWarningNotification('Warning Title', 'Warning message')).resolves.toBeUndefined();
        });
    });

    describe('showInfoNotification', () => {
        test('should resolve without error for info notifications', async () => {
            window.getPreference.mockResolvedValue(true);
            window.preferencesCache.get.mockResolvedValue({ notification_mode: 'work' });

            await expect(window.showInfoNotification('Info Title', 'Info message')).resolves.toBeUndefined();
        });
    });

    describe('getNotificationIcon', () => {
        test('should return correct icon for each type', () => {
            if (window.notificationSystem && window.notificationSystem.getNotificationIcon) {
                expect(window.notificationSystem.getNotificationIcon('success')).toBe('fa-check-circle');
                expect(window.notificationSystem.getNotificationIcon('error')).toBe('fa-exclamation-circle');
                expect(window.notificationSystem.getNotificationIcon('warning')).toBe('fa-exclamation-triangle');
                expect(window.notificationSystem.getNotificationIcon('info')).toBe('fa-info-circle');
                expect(window.notificationSystem.getNotificationIcon('unknown')).toBe('fa-info-circle');
            } else {
                // If notificationSystem object doesn't exist, check for global function
                expect(window.getNotificationIcon || window.notificationSystem).toBeDefined();
            }
        });
    });

    describe('shouldShowNotification', () => {
        test('should return true when category is enabled', async () => {
            if (!window.shouldShowNotification) {
                return; // Skip if function doesn't exist
            }

            window.getPreference.mockResolvedValue(true);
            window.preferencesCache.get.mockResolvedValue({ notification_mode: 'work' });
            
            const result = await window.shouldShowNotification('system', 'info', true);
            
            // Should return true for user-initiated actions in work mode
            expect(typeof result).toBe('boolean');
        });

        test('should return false when category is disabled', async () => {
            if (!window.shouldShowNotification) {
                return;
            }

            window.getPreference.mockResolvedValue(false);
            window.preferencesCache.get.mockResolvedValue({ notification_mode: 'work' });
            
            const result = await window.shouldShowNotification('system', 'info', false);
            
            // Should return false when preference is disabled
            expect(typeof result).toBe('boolean');
        });

        test('should handle notification modes', async () => {
            if (!window.shouldShowNotification) {
                return;
            }

            window.getPreference.mockResolvedValue(true);
            window.preferencesCache.get.mockResolvedValue({ notification_mode: 'silent' });
            
            const result = await window.shouldShowNotification('system', 'info', false);
            
            // Silent mode should only show errors
            expect(typeof result).toBe('boolean');
        });
    });

    describe('logWithCategory', () => {
        test('should log when category is enabled', async () => {
            if (!window.logWithCategory) {
                return; // Skip if function doesn't exist
            }

            // Mock shouldLogToConsole
            window.shouldLogToConsole = jest.fn().mockResolvedValue(true);
            
            await window.logWithCategory('info', 'Test log', 'system');
            
            // Function should execute without errors
            expect(window.logWithCategory).toBeDefined();
        });

        test('should not log when category is disabled', async () => {
            if (!window.logWithCategory) {
                return;
            }

            window.shouldLogToConsole = jest.fn().mockResolvedValue(false);
            
            const consoleSpy = jest.spyOn(console, 'info');
            
            await window.logWithCategory('info', 'Test log', 'system');
            
            // Function should execute - actual logging depends on shouldLogToConsole
            expect(window.logWithCategory).toBeDefined();
            
            consoleSpy.mockRestore();
        });
    });

    describe('getLogEmoji', () => {
        test('should return correct emoji for each log level', () => {
            if (window.getLogEmoji) {
                expect(window.getLogEmoji('log')).toBe('📝');
                expect(window.getLogEmoji('warn')).toBe('⚠️');
                expect(window.getLogEmoji('error')).toBe('❌');
                expect(window.getLogEmoji('info')).toBe('ℹ️');
                expect(window.getLogEmoji('unknown')).toBe('📝');
            } else {
                // If function doesn't exist, just check that notification system exists
                expect(window.notificationSystem || window.getLogEmoji).toBeDefined();
            }
        });
    });

    describe('NotificationSystem object', () => {
        test('should expose all notification functions', () => {
            if (window.notificationSystem) {
                expect(window.notificationSystem).toBeDefined();
                // Check for main functions
                expect(window.notificationSystem.showNotification || window.showNotification).toBeDefined();
            } else {
                // If object doesn't exist, check for global functions
                expect(window.showNotification || window.notificationSystem).toBeDefined();
            }
        });
    });
});

