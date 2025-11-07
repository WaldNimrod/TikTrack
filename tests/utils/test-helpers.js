/**
 * Test Helpers - TikTrack
 * ========================
 * 
 * Utility functions for testing
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

/**
 * Create a mock DOM element
 * @param {string} tagName - The HTML tag name
 * @param {Object} attributes - Element attributes
 * @returns {Object} Mock DOM element
 */
function createMockElement(tagName, attributes = {}) {
    return {
        tagName: tagName.toUpperCase(),
        className: attributes.className || '',
        id: attributes.id || '',
        textContent: attributes.textContent || '',
        innerHTML: attributes.innerHTML || '',
        style: attributes.style || {},
        dataset: attributes.dataset || {},
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
        appendChild: jest.fn(),
        removeChild: jest.fn(),
        querySelector: jest.fn(),
        querySelectorAll: jest.fn(),
        getAttribute: jest.fn(),
        setAttribute: jest.fn(),
        removeAttribute: jest.fn(),
        hasAttribute: jest.fn(),
        focus: jest.fn(),
        blur: jest.fn(),
        click: jest.fn(),
        ...attributes
    };
}

/**
 * Create a mock event
 * @param {string} type - Event type
 * @param {Object} options - Event options
 * @returns {Object} Mock event
 */
function createMockEvent(type, options = {}) {
    return {
        type: type,
        target: options.target || null,
        currentTarget: options.currentTarget || null,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        stopImmediatePropagation: jest.fn(),
        ...options
    };
}

/**
 * Create mock trade data
 * @param {Object} overrides - Data overrides
 * @returns {Object} Mock trade data
 */
function createMockTrade(overrides = {}) {
    return {
        id: Math.floor(Math.random() * 1000),
        symbol: 'AAPL',
        side: 'buy',
        quantity: 100,
        price: 150.00,
        status: 'active',
        date: new Date().toISOString(),
        type: 'stock',
        ...overrides
    };
}

/**
 * Create mock account data
 * @param {Object} overrides - Data overrides
 * @returns {Object} Mock account data
 */
function createMockAccount(overrides = {}) {
    return {
        id: Math.floor(Math.random() * 100),
        name: 'Test Account',
        balance: 50000.00,
        currency: 'USD',
        status: 'active',
        ...overrides
    };
}

/**
 * Create mock alert data
 * @param {Object} overrides - Data overrides
 * @returns {Object} Mock alert data
 */
function createMockAlert(overrides = {}) {
    return {
        id: Math.floor(Math.random() * 100),
        symbol: 'AAPL',
        condition: 'price_above',
        value: 160.00,
        status: 'active',
        priority: 'high',
        ...overrides
    };
}

/**
 * Create mock cache data
 * @param {string} key - Cache key
 * @param {*} value - Cache value
 * @param {Object} options - Cache options
 * @returns {Object} Mock cache data
 */
function createMockCacheData(key, value, options = {}) {
    return {
        key: key,
        value: value,
        timestamp: Date.now(),
        ttl: options.ttl || 3600000,
        layer: options.layer || 'memory',
        ...options
    };
}

/**
 * Create mock API response
 * @param {number} status - HTTP status code
 * @param {*} data - Response data
 * @param {Object} options - Response options
 * @returns {Object} Mock API response
 */
function createMockApiResponse(status, data, options = {}) {
    return {
        ok: status >= 200 && status < 300,
        status: status,
        statusText: options.statusText || 'OK',
        json: () => Promise.resolve(data),
        text: () => Promise.resolve(JSON.stringify(data)),
        blob: () => Promise.resolve(new Blob([JSON.stringify(data)])),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        ...options
    };
}

/**
 * Wait for a condition to be true
 * @param {Function} condition - Condition function
 * @param {number} timeout - Timeout in milliseconds
 * @param {number} interval - Check interval in milliseconds
 * @returns {Promise} Promise that resolves when condition is true
 */
function waitFor(condition, timeout = 1000, interval = 10) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const check = () => {
            try {
                if (condition()) {
                    resolve();
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error(`Timeout waiting for condition after ${timeout}ms`));
                } else {
                    setTimeout(check, interval);
                }
            } catch (error) {
                reject(error);
            }
        };
        
        check();
    });
}

/**
 * Create a mock fetch function
 * @param {Object} responses - Response mappings
 * @returns {Function} Mock fetch function
 */
function createMockFetch(responses = {}) {
    return jest.fn((url, options = {}) => {
        const response = responses[url] || responses['*'] || {
            ok: true,
            status: 200,
            json: () => Promise.resolve({}),
            text: () => Promise.resolve(''),
            blob: () => Promise.resolve(new Blob()),
            arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
        };
        
        return Promise.resolve(response);
    });
}

/**
 * Create a mock localStorage
 * @returns {Object} Mock localStorage
 */
function createMockLocalStorage() {
    const store = {};
    
    return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value;
        }),
        removeItem: jest.fn((key) => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            Object.keys(store).forEach(key => delete store[key]);
        }),
        length: Object.keys(store).length,
        key: jest.fn((index) => Object.keys(store)[index] || null)
    };
}

/**
 * Create a mock sessionStorage
 * @returns {Object} Mock sessionStorage
 */
function createMockSessionStorage() {
    const store = {};
    
    return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value;
        }),
        removeItem: jest.fn((key) => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            Object.keys(store).forEach(key => delete store[key]);
        }),
        length: Object.keys(store).length,
        key: jest.fn((index) => Object.keys(store)[index] || null)
    };
}

/**
 * Create a mock console
 * @returns {Object} Mock console
 */
function createMockConsole() {
    return {
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        info: jest.fn(),
        debug: jest.fn(),
        trace: jest.fn(),
        group: jest.fn(),
        groupEnd: jest.fn(),
        time: jest.fn(),
        timeEnd: jest.fn()
    };
}

/**
 * Create a mock timer
 * @returns {Object} Mock timer functions
 */
function createMockTimer() {
    const timers = new Map();
    let timerId = 0;
    
    return {
        setTimeout: jest.fn((callback, delay) => {
            const id = ++timerId;
            timers.set(id, { callback, delay, type: 'timeout' });
            return id;
        }),
        clearTimeout: jest.fn((id) => {
            timers.delete(id);
        }),
        setInterval: jest.fn((callback, delay) => {
            const id = ++timerId;
            timers.set(id, { callback, delay, type: 'interval' });
            return id;
        }),
        clearInterval: jest.fn((id) => {
            timers.delete(id);
        }),
        advanceTimersByTime: (ms) => {
            timers.forEach((timer, id) => {
                if (timer.type === 'timeout' && timer.delay <= ms) {
                    timer.callback();
                    timers.delete(id);
                } else if (timer.type === 'interval') {
                    const cycles = Math.floor(ms / timer.delay);
                    for (let i = 0; i < cycles; i++) {
                        timer.callback();
                    }
                }
            });
        }
    };
}

/**
 * Assert that a function throws an error
 * @param {Function} fn - Function to test
 * @param {string|RegExp} expectedError - Expected error message or pattern
 * @returns {Promise} Promise that resolves if error is thrown
 */
async function expectToThrow(fn, expectedError) {
    try {
        await fn();
        throw new Error('Expected function to throw an error');
    } catch (error) {
        if (expectedError) {
            if (typeof expectedError === 'string') {
                expect(error.message).toContain(expectedError);
            } else if (expectedError instanceof RegExp) {
                expect(error.message).toMatch(expectedError);
            }
        }
    }
}

/**
 * Create a mock TikTrack system
 * @param {string} systemName - System name
 * @param {Object} methods - System methods
 * @returns {Object} Mock system
 */
function createMockSystem(systemName, methods = {}) {
    const mockSystem = {};
    
    Object.keys(methods).forEach(methodName => {
        mockSystem[methodName] = jest.fn(methods[methodName]);
    });
    
    return mockSystem;
}

// Import mock helpers
const mockHelpers = require('./mock-helpers');
const testFixtures = require('./test-fixtures');

/**
 * Create mock backend database session
 * @returns {Object} Mock database session
 */
function createMockDbSession() {
    return {
        query: jest.fn(),
        add: jest.fn(),
        commit: jest.fn(),
        rollback: jest.fn(),
        close: jest.fn(),
        refresh: jest.fn(),
        delete: jest.fn(),
        filter: jest.fn().mockReturnThis(),
        first: jest.fn(),
        all: jest.fn().mockReturnValue([]),
        one: jest.fn(),
        scalar: jest.fn()
    };
}

/**
 * Create mock Flask app for backend tests
 * @param {Object} config - App configuration
 * @returns {Object} Mock Flask app
 */
function createMockFlaskApp(config = {}) {
    return {
        test_client: jest.fn(() => ({
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            patch: jest.fn()
        })),
        config: {
            TESTING: true,
            ...config
        },
        register_blueprint: jest.fn()
    };
}

/**
 * Create mock E2E page object
 * @returns {Object} Mock page object
 */
function createMockPage() {
    return {
        goto: jest.fn().mockResolvedValue(null),
        click: jest.fn().mockResolvedValue(null),
        fill: jest.fn().mockResolvedValue(null),
        selectOption: jest.fn().mockResolvedValue(null),
        waitForSelector: jest.fn().mockResolvedValue(null),
        waitForLoadState: jest.fn().mockResolvedValue(null),
        evaluate: jest.fn().mockResolvedValue(null),
        screenshot: jest.fn().mockResolvedValue(Buffer.from('')),
        close: jest.fn().mockResolvedValue(null)
    };
}

/**
 * Create mock Playwright browser context
 * @returns {Object} Mock browser context
 */
function createMockBrowserContext() {
    return {
        newPage: jest.fn().mockResolvedValue(createMockPage()),
        close: jest.fn().mockResolvedValue(null)
    };
}

// Export all helper functions
module.exports = {
    createMockElement,
    createMockEvent,
    createMockTrade,
    createMockAccount,
    createMockAlert,
    createMockCacheData,
    createMockApiResponse,
    waitFor,
    createMockFetch,
    createMockLocalStorage,
    createMockSessionStorage,
    createMockConsole,
    createMockTimer,
    expectToThrow,
    createMockSystem,
    // Backend test helpers
    createMockDbSession,
    createMockFlaskApp,
    // E2E test helpers
    createMockPage,
    createMockBrowserContext,
    // Export mock helpers
    ...mockHelpers,
    // Export test fixtures
    ...testFixtures
};
