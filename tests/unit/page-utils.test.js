/**
 * Page Utils Unit Tests
 * =====================
 * 
 * Unit tests for the Page State Management system
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');

// Load the actual Page Utils code
const pageUtilsCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/page-utils.js'),
    'utf8'
);

describe('Page Utils', () => {
    beforeAll(() => {
        // Mock localStorage
        const storage = {};
        global.localStorage.getItem = jest.fn((key) => storage[key] || null);
        global.localStorage.setItem = jest.fn((key, value) => {
            storage[key] = value;
        });
        global.localStorage.removeItem = jest.fn((key) => {
            delete storage[key];
        });

        // Mock window.location
        Object.defineProperty(window, 'location', {
            value: {
                pathname: '/test-page',
                search: '',
                hash: ''
            },
            writable: true
        });

        // Evaluate the real code
        eval(pageUtilsCode);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Page State Management', () => {
        test('should save page state', () => {
            if (window.savePageState) {
                window.savePageState('test-key', { test: 'value' });
                expect(localStorage.setItem).toHaveBeenCalled();
            }
        });

        test('should load page state', () => {
            localStorage.getItem.mockReturnValue(JSON.stringify({ test: 'value' }));
            
            if (window.loadPageState) {
                const state = window.loadPageState('test-key');
                expect(state).toBeDefined();
            }
        });

        test('should clear page state', () => {
            if (window.clearPageState) {
                window.clearPageState('test-key');
                expect(localStorage.removeItem).toHaveBeenCalled();
            }
        });
    });
});

