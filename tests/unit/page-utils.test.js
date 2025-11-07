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

const { loadScriptWithDependencies, setupBasicMocks } = require('../utils/test-loader');
const { createMockLocalStorage } = require('../utils/test-helpers');

describe('Page Utils', () => {
    let storage;
    let localStorageMock;

    beforeAll(() => {
        // Setup basic mocks
        setupBasicMocks();
        
        // Override localStorage with working implementation using shared helper
        localStorageMock = createMockLocalStorage();
        storage = {};
        // Extend mock to expose underlying storage for assertions
        localStorageMock.setItem.mockImplementation((key, value) => {
            storage[key] = value;
        });
        localStorageMock.getItem.mockImplementation((key) => storage[key] || null);
        localStorageMock.removeItem.mockImplementation((key) => {
            delete storage[key];
        });
        localStorageMock.clear.mockImplementation(() => {
            Object.keys(storage).forEach((key) => delete storage[key]);
        });

        Object.defineProperty(global, 'localStorage', {
            value: localStorageMock,
            configurable: true,
            writable: true
        });
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            configurable: true,
            writable: true
        });

        // Load with dependencies using test loader
        const code = loadScriptWithDependencies('scripts/page-utils.js');
        eval(code);
    });

    afterEach(() => {
        localStorage.setItem.mockClear();
        localStorage.getItem.mockClear();
        localStorage.removeItem.mockClear();
        localStorage.clear.mockClear();
        storage = {};
    });

    describe('Page State Management', () => {
        test('should save page state', () => {
            expect(window.savePageState).toBeDefined();
            if (window.savePageState) {
                window.savePageState('test-key', { test: 'value' });
                expect(localStorage.setItem).toHaveBeenCalledWith(
                    'pageState_test-key',
                    expect.stringContaining('"test":"value"')
                );
                expect(storage['pageState_test-key']).toBeDefined();
            }
        });

        test('should load page state', () => {
            expect(window.loadPageState).toBeDefined();
            if (window.loadPageState) {
                const mockState = JSON.stringify({ test: 'value', timestamp: Date.now(), pageName: 'test-key' });
                storage['pageState_test-key'] = mockState;
                
                const state = window.loadPageState('test-key');
                expect(state).toBeDefined();
                expect(state?.test).toBe('value');
            }
        });

        test('should clear page state', () => {
            expect(window.clearPageState).toBeDefined();
            if (window.clearPageState) {
                storage['pageState_test-key'] = JSON.stringify({ test: 'value' });
                window.clearPageState('test-key');
                expect(localStorage.removeItem).toHaveBeenCalledWith('pageState_test-key');
                expect(storage['pageState_test-key']).toBeUndefined();
            }
        });
    });
});

