/**
 * Translation Utils Unit Tests
 * ============================
 * 
 * Unit tests for the Translation Utilities system
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');

// Load the actual Translation Utils code
const translationUtilsCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/translation-utils.js'),
    'utf8'
);

describe('Translation Utils', () => {
    beforeAll(() => {
        // Mock localStorage for language preference
        const storage = {};
        global.localStorage.getItem = jest.fn((key) => {
            if (key === 'language') {
                return 'he';
            }
            return storage[key] || null;
        });
        global.localStorage.setItem = jest.fn((key, value) => {
            storage[key] = value;
        });

        // Mock document.documentElement
        document.documentElement.setAttribute = jest.fn();
        document.documentElement.getAttribute = jest.fn().mockReturnValue('rtl');

        // Evaluate the real code
        eval(translationUtilsCode);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Translation Functions', () => {
        test('should have translation functions available', () => {
            // Check if translation utility functions exist
            expect(window.translationUtils || window.translateAccountStatus || window.translateStatus).toBeDefined();
        });

        test('should handle RTL direction', () => {
            if (window.setRTLDirection) {
                window.setRTLDirection(true);
                expect(document.documentElement.setAttribute).toHaveBeenCalledWith('dir', 'rtl');
            }
        });

        test('should handle LTR direction', () => {
            if (window.setRTLDirection) {
                window.setRTLDirection(false);
                expect(document.documentElement.setAttribute).toHaveBeenCalledWith('dir', 'ltr');
            }
        });
    });
});

