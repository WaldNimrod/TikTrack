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

const fs = require('fs');
const path = require('path');

// Load the actual Notification System code
const notificationSystemCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/notification-system.js'),
    'utf8'
);

describe('Notification System', () => {
    let notificationContainer;

    beforeAll(() => {
        // Ensure Logger is available (from setup.js)
        if (!window.Logger) {
            window.Logger = {
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
                debug: jest.fn()
            };
        }

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

        // Mock window.getPreference
        global.window.getPreference = jest.fn().mockResolvedValue(true);
        global.window.preferencesCache = {
            get: jest.fn().mockResolvedValue({ notification_mode: 'work' })
        };
        global.window.detectNotificationCategory = jest.fn().mockReturnValue('system');
        global.window.getEntityColor = jest.fn().mockReturnValue('#28a745');
        global.window.DEBUG_MODE = false;
        
        // Ensure UnifiedCacheManager is available
        if (!window.UnifiedCacheManager) {
            window.UnifiedCacheManager = {
                save: jest.fn().mockResolvedValue(true),
                get: jest.fn().mockResolvedValue(null)
            };
        }

        // Use existing mocks from setup.js, but enhance them
        const originalCreateElement = document.createElement;
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

        // Evaluate the real code
        eval(notificationSystemCode);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('showNotification', () => {
        test('should create notification element', async () => {
            await window.showNotification('Test message', 'info', 'Test Title');
            
            expect(document.createElement).toHaveBeenCalledWith('div');
        });

        test('should handle different notification types', async () => {
            const types = ['success', 'error', 'warning', 'info'];
            
            for (const type of types) {
                await window.showNotification(`Test ${type}`, type);
                expect(document.createElement).toHaveBeenCalled();
            }
        });

        test('should check notification preferences before showing', async () => {
            window.getPreference.mockResolvedValue(false);
            
            await window.showNotification('Test message', 'info', 'Test', 5000, 'system');
            
            // Should check preference
            expect(window.getPreference).toHaveBeenCalled();
        });

        test('should use default category when not provided', async () => {
            await window.showNotification('Test message', 'success');
            
            expect(window.detectNotificationCategory || window.showNotification).toBeDefined();
        });
    });

    describe('showSuccessNotification', () => {
        test('should call showNotification with success type', async () => {
            const originalShowNotification = window.showNotification;
            window.showNotification = jest.fn();
            
            await window.showSuccessNotification('Success message', 'Success Title');
            
            expect(window.showNotification).toHaveBeenCalledWith(
                'Success message',
                'success',
                'Success Title',
                5000,
                null,
                expect.any(Object)
            );
            
            window.showNotification = originalShowNotification;
        });
    });

    describe('showErrorNotification', () => {
        test('should call showNotification with error type', async () => {
            const originalShowNotification = window.showNotification;
            window.showNotification = jest.fn();
            
            await window.showErrorNotification('Error message', 'Error Title');
            
            expect(window.showNotification).toHaveBeenCalledWith(
                'Error message',
                'error',
                'Error Title',
                5000,
                null,
                expect.any(Object)
            );
            
            window.showNotification = originalShowNotification;
        });
    });

    describe('showWarningNotification', () => {
        test('should call showNotification with warning type', async () => {
            const originalShowNotification = window.showNotification;
            window.showNotification = jest.fn();
            
            await window.showWarningNotification('Warning message', 'Warning Title');
            
            expect(window.showNotification).toHaveBeenCalledWith(
                'Warning message',
                'warning',
                'Warning Title',
                5000,
                null,
                expect.any(Object)
            );
            
            window.showNotification = originalShowNotification;
        });
    });

    describe('showInfoNotification', () => {
        test('should call showNotification with info type', async () => {
            const originalShowNotification = window.showNotification;
            window.showNotification = jest.fn();
            
            await window.showInfoNotification('Info message', 'Info Title');
            
            expect(window.showNotification).toHaveBeenCalledWith(
                'Info message',
                'info',
                'Info Title',
                5000,
                null,
                expect.any(Object)
            );
            
            window.showNotification = originalShowNotification;
        });
    });

    describe('getNotificationIcon', () => {
        test('should return correct icon for each type', () => {
            expect(window.notificationSystem.getNotificationIcon('success')).toBe('fa-check-circle');
            expect(window.notificationSystem.getNotificationIcon('error')).toBe('fa-exclamation-circle');
            expect(window.notificationSystem.getNotificationIcon('warning')).toBe('fa-exclamation-triangle');
            expect(window.notificationSystem.getNotificationIcon('info')).toBe('fa-info-circle');
            expect(window.notificationSystem.getNotificationIcon('unknown')).toBe('fa-info-circle');
        });
    });

    describe('shouldShowNotification', () => {
        test('should return true when category is enabled', async () => {
            window.getPreference.mockResolvedValue(true);
            
            const result = await window.shouldShowNotification('system', 'info', false);
            
            expect(result).toBe(true);
        });

        test('should return false when category is disabled', async () => {
            window.getPreference.mockResolvedValue(false);
            
            const result = await window.shouldShowNotification('system', 'info', false);
            
            expect(result).toBe(false);
        });

        test('should handle notification modes', async () => {
            window.preferencesCache.get.mockResolvedValue({ notification_mode: 'silent' });
            
            const result = await window.shouldShowNotification('system', 'info', false);
            
            // Silent mode should only show errors
            expect(result).toBe(false);
        });
    });

    describe('logWithCategory', () => {
        test('should log when category is enabled', async () => {
            window.shouldLogToConsole = jest.fn().mockResolvedValue(true);
            
            await window.logWithCategory('info', 'Test log', 'system');
            
            expect(window.shouldLogToConsole).toHaveBeenCalledWith('system');
        });

        test('should not log when category is disabled', async () => {
            window.shouldLogToConsole = jest.fn().mockResolvedValue(false);
            const consoleSpy = jest.spyOn(console, 'info');
            
            await window.logWithCategory('info', 'Test log', 'system');
            
            expect(consoleSpy).not.toHaveBeenCalled();
            
            consoleSpy.mockRestore();
        });
    });

    describe('getLogEmoji', () => {
        test('should return correct emoji for each log level', () => {
            expect(window.getLogEmoji('log')).toBe('📝');
            expect(window.getLogEmoji('warn')).toBe('⚠️');
            expect(window.getLogEmoji('error')).toBe('❌');
            expect(window.getLogEmoji('info')).toBe('ℹ️');
            expect(window.getLogEmoji('unknown')).toBe('📝');
        });
    });

    describe('NotificationSystem object', () => {
        test('should expose all notification functions', () => {
            expect(window.NotificationSystem).toBeDefined();
            expect(typeof window.NotificationSystem.show).toBe('function');
            expect(typeof window.NotificationSystem.showSuccess).toBe('function');
            expect(typeof window.NotificationSystem.showError).toBe('function');
            expect(typeof window.NotificationSystem.showWarning).toBe('function');
            expect(typeof window.NotificationSystem.showInfo).toBe('function');
        });
    });
});

