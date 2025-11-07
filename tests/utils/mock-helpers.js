/**
 * Mock Helpers - TikTrack
 * =======================
 * 
 * Shared mock helper functions for all tests
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

/**
 * Setup window mocks with all required properties
 * @param {Object} overrides - Override specific properties
 * @returns {Object} Mock window object
 */
function setupWindowMocks(overrides = {}) {
    const baseWindow = {
        location: {
            href: 'http://localhost:8080',
            pathname: '/',
            search: '',
            hash: '',
            reload: jest.fn()
        },
        navigator: {
            userAgent: 'Jest Test Environment'
        },
        localStorage: {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn()
        },
        sessionStorage: {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn(),
            clear: jest.fn()
        },
        fetch: jest.fn(),
        setTimeout: jest.fn((cb) => {
            cb();
            return 1;
        }),
        clearTimeout: jest.fn(),
        setInterval: jest.fn((cb) => {
            cb();
            return 1;
        }),
        clearInterval: jest.fn(),
        requestAnimationFrame: jest.fn((cb) => {
            cb();
            return 1;
        }),
        cancelAnimationFrame: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn()
    };

    return { ...baseWindow, ...overrides };
}

/**
 * Setup document mocks with all required methods
 * @param {Object} overrides - Override specific methods
 * @returns {Object} Mock document object
 */
function setupDocumentMocks(overrides = {}) {
    const baseDocument = {
        createElement: jest.fn((tagName) => {
            const element = {
                tagName: tagName.toUpperCase(),
                className: '',
                id: '',
                textContent: '',
                innerHTML: '',
                style: {},
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
                remove: jest.fn(),
                insertAdjacentHTML: jest.fn(),
                closest: jest.fn()
            };
            return element;
        }),
        getElementById: jest.fn(),
        getElementsByClassName: jest.fn(() => []),
        getElementsByTagName: jest.fn(() => []),
        querySelector: jest.fn(),
        querySelectorAll: jest.fn(() => []),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
        body: {
            appendChild: jest.fn(),
            insertAdjacentHTML: jest.fn(),
            querySelector: jest.fn(),
            querySelectorAll: jest.fn(() => [])
        },
        documentElement: {
            setAttribute: jest.fn(),
            getAttribute: jest.fn(),
            style: {
                setProperty: jest.fn(),
                getPropertyValue: jest.fn()
            }
        }
    };

    return { ...baseDocument, ...overrides };
}

/**
 * Setup location mock that can be redefined
 * @param {Object} locationProps - Location properties
 * @returns {Object} Mock location object
 */
function setupLocationMock(locationProps = {}) {
    const defaultLocation = {
        href: 'http://localhost:8080',
        pathname: '/',
        search: '',
        hash: '',
        reload: jest.fn()
    };

    return { ...defaultLocation, ...locationProps };
}

/**
 * Setup Bootstrap Modal mocks
 * @returns {Object} Mock Bootstrap object
 */
function setupBootstrapMocks() {
    return {
        Modal: jest.fn(function(element) {
            return {
                show: jest.fn(),
                hide: jest.fn(),
                dispose: jest.fn(),
                _element: element
            };
        })
    };
}

/**
 * Setup Logger mocks with support for multiple parameters
 * @returns {Object} Mock Logger object
 */
function setupLoggerMocks() {
    return {
        debug: jest.fn((...args) => {
            // Logger methods can receive multiple parameters
            return true;
        }),
        info: jest.fn((...args) => {
            return true;
        }),
        warn: jest.fn((...args) => {
            return true;
        }),
        error: jest.fn((...args) => {
            return true;
        }),
        critical: jest.fn((...args) => {
            return true;
        }),
        setLevel: jest.fn(),
        getLevel: jest.fn(),
        flush: jest.fn(),
        clear: jest.fn(),
        getLogs: jest.fn(() => []),
        exportLogs: jest.fn(),
        sendToServer: jest.fn(),
        setServerEndpoint: jest.fn(),
        setConfig: jest.fn(),
        startTimer: jest.fn(),
        endTimer: jest.fn(),
        measurePerformance: jest.fn()
    };
}

/**
 * Setup Cache mocks
 * @returns {Object} Mock UnifiedCacheManager object
 */
function setupCacheMocks() {
    return {
        get: jest.fn().mockResolvedValue(null),
        save: jest.fn().mockResolvedValue(true),
        delete: jest.fn().mockResolvedValue(true),
        clear: jest.fn().mockResolvedValue(true),
        clearAll: jest.fn().mockResolvedValue(true),
        clearAllCache: jest.fn().mockResolvedValue(true),
        clearAllCacheQuick: jest.fn().mockResolvedValue(true),
        clearAllCacheDetailed: jest.fn().mockResolvedValue(true),
        refreshUserPreferences: jest.fn().mockResolvedValue(true),
        getCacheStats: jest.fn().mockResolvedValue({}),
        exportCache: jest.fn().mockResolvedValue({}),
        importCache: jest.fn().mockResolvedValue(true)
    };
}

/**
 * Setup Notification mocks
 * @returns {Object} Mock notification functions
 */
function setupNotificationMocks() {
    return {
        showNotification: jest.fn().mockResolvedValue(true),
        showSuccessNotification: jest.fn().mockResolvedValue(true),
        showErrorNotification: jest.fn().mockResolvedValue(true),
        showWarningNotification: jest.fn().mockResolvedValue(true),
        showInfoNotification: jest.fn().mockResolvedValue(true)
    };
}

/**
 * Setup Preferences System mocks
 * @returns {Object} Mock PreferencesSystem object
 */
function setupPreferencesMocks() {
    return {
        initialized: true,
        onPreferencesChanged: jest.fn(),
        getPreference: jest.fn().mockResolvedValue(true),
        setPreference: jest.fn().mockResolvedValue(true)
    };
}

module.exports = {
    setupWindowMocks,
    setupDocumentMocks,
    setupLocationMock,
    setupBootstrapMocks,
    setupLoggerMocks,
    setupCacheMocks,
    setupNotificationMocks,
    setupPreferencesMocks
};

