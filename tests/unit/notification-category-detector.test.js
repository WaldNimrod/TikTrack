/**
 * Notification Category Detector Unit Tests
 * ==========================================
 * 
 * Unit tests for the Notification Category Detector
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');

// Load the actual Notification Category Detector code
const categoryDetectorCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/notification-category-detector.js'),
    'utf8'
);

describe('Notification Category Detector', () => {
    beforeAll(() => {
        // Evaluate the real code
        eval(categoryDetectorCode);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Initialization', () => {
        test('should initialize detectNotificationCategory function', () => {
            expect(window.detectNotificationCategory).toBeDefined();
            expect(typeof window.detectNotificationCategory).toBe('function');
        });
    });

    describe('Category Detection', () => {
        test('should detect category from message', () => {
            const result = window.detectNotificationCategory('Error occurred', 'error', 'System Error');
            expect(result).toBeDefined();
        });
    });
});

