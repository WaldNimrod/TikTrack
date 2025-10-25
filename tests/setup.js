/**
 * Jest Setup - TikTrack
 * =====================
 * 
 * Global setup for all tests
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

// Mock TextEncoder/TextDecoder for Node.js compatibility
require('text-encoding');
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock global objects
global.window = {
    location: {
        href: 'http://localhost:8080',
        pathname: '/',
        search: '',
        hash: ''
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
    setTimeout: jest.fn(),
    clearTimeout: jest.fn(),
    setInterval: jest.fn(),
    clearInterval: jest.fn(),
    requestAnimationFrame: jest.fn(),
    cancelAnimationFrame: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
};

global.document = {
    createElement: jest.fn(),
    getElementById: jest.fn(),
    getElementsByClassName: jest.fn(),
    getElementsByTagName: jest.fn(),
    querySelector: jest.fn(),
    querySelectorAll: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn()
};

global.console = {
    log: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
};

// Mock TikTrack systems
global.Logger = {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    critical: jest.fn(),
    setLevel: jest.fn(),
    getLevel: jest.fn(),
    flush: jest.fn(),
    clear: jest.fn(),
    getLogs: jest.fn(),
    exportLogs: jest.fn(),
    sendToServer: jest.fn(),
    setServerEndpoint: jest.fn(),
    setConfig: jest.fn(),
    startTimer: jest.fn(),
    endTimer: jest.fn(),
    measurePerformance: jest.fn()
};

global.UnifiedCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
    clearAll: jest.fn(),
    clearAllCache: jest.fn(),
    clearAllCacheQuick: jest.fn(),
    clearAllCacheDetailed: jest.fn(),
    refreshUserPreferences: jest.fn(),
    getCacheStats: jest.fn(),
    exportCache: jest.fn(),
    importCache: jest.fn()
};

global.showNotification = jest.fn();
global.showSuccessNotification = jest.fn();
global.showErrorNotification = jest.fn();
global.showWarningNotification = jest.fn();
global.showInfoNotification = jest.fn();

global.FieldRendererService = {
    renderStatus: jest.fn(),
    renderSide: jest.fn(),
    renderNumericBadge: jest.fn(),
    renderCurrency: jest.fn(),
    renderType: jest.fn(),
    renderAction: jest.fn(),
    renderPriority: jest.fn(),
    renderShares: jest.fn(),
    renderBoolean: jest.fn(),
    renderTickerInfo: jest.fn(),
    renderLinkedEntity: jest.fn()
};

global.ButtonSystem = {
    createEditButton: jest.fn(),
    createDeleteButton: jest.fn(),
    createCancelButton: jest.fn(),
    createLinkButton: jest.fn(),
    createAddButton: jest.fn(),
    createSaveButton: jest.fn(),
    generateActionButtons: jest.fn(),
    loadTableActionButtons: jest.fn()
};

global.TableSystem = {
    sortTableData: jest.fn(),
    sortTable: jest.fn(),
    loadTableData: jest.fn(),
    updateTable: jest.fn(),
    filterTable: jest.fn(),
    applyTableFilter: jest.fn(),
    setTablePage: jest.fn(),
    getTablePageInfo: jest.fn(),
    generateTableActions: jest.fn(),
    loadTableActionButtons: jest.fn(),
    optimizeTablePerformance: jest.fn(),
    getTablePerformanceMetrics: jest.fn(),
    cacheTableData: jest.fn(),
    getCachedTableData: jest.fn(),
    clearTableCache: jest.fn()
};

global.ChartSystem = {
    createChart: jest.fn(),
    updateChart: jest.fn(),
    destroyChart: jest.fn(),
    getChartData: jest.fn(),
    setChartData: jest.fn(),
    exportChart: jest.fn(),
    importChart: jest.fn()
};

// Mock DOM methods
global.document.createElement.mockImplementation((tagName) => ({
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
    click: jest.fn()
}));

global.document.getElementById.mockImplementation((id) => ({
    id: id,
    className: '',
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
    click: jest.fn()
}));

global.document.querySelector.mockImplementation((selector) => ({
    selector: selector,
    className: '',
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
    click: jest.fn()
}));

global.document.querySelectorAll.mockImplementation((selector) => []);

// Mock fetch
global.fetch.mockImplementation((url, options = {}) => {
    return Promise.resolve({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
        blob: () => Promise.resolve(new Blob()),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
    });
});

// Mock localStorage
global.localStorage.getItem.mockImplementation((key) => null);
global.localStorage.setItem.mockImplementation((key, value) => {});
global.localStorage.removeItem.mockImplementation((key) => {});
global.localStorage.clear.mockImplementation(() => {});

// Mock sessionStorage
global.sessionStorage.getItem.mockImplementation((key) => null);
global.sessionStorage.setItem.mockImplementation((key, value) => {});
global.sessionStorage.removeItem.mockImplementation((key) => {});
global.sessionStorage.clear.mockImplementation(() => {});

// Mock setTimeout
global.setTimeout.mockImplementation((callback, delay) => {
    callback();
    return 1;
});

// Mock setInterval
global.setInterval.mockImplementation((callback, delay) => {
    callback();
    return 1;
});

// Mock requestAnimationFrame
global.requestAnimationFrame.mockImplementation((callback) => {
    callback();
    return 1;
});

// Mock addEventListener
global.addEventListener.mockImplementation((event, callback) => {});
global.removeEventListener.mockImplementation((event, callback) => {});

// Mock dispatchEvent
global.dispatchEvent.mockImplementation((event) => true);

// Mock console methods
global.console.log.mockImplementation(() => {});
global.console.warn.mockImplementation(() => {});
global.console.error.mockImplementation(() => {});
global.console.info.mockImplementation(() => {});
global.console.debug.mockImplementation(() => {});

// Test utilities
global.testUtils = {
    createMockElement: (tagName, attributes = {}) => ({
        tagName: tagName.toUpperCase(),
        ...attributes,
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
        click: jest.fn()
    }),
    
    createMockEvent: (type, options = {}) => ({
        type: type,
        target: options.target || null,
        currentTarget: options.currentTarget || null,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        stopImmediatePropagation: jest.fn(),
        ...options
    }),
    
    createMockData: (type, data = {}) => ({
        id: Math.random().toString(36).substr(2, 9),
        type: type,
        ...data
    }),
    
    waitFor: (callback, timeout = 1000) => {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const check = () => {
                try {
                    if (callback()) {
                        resolve();
                    } else if (Date.now() - startTime > timeout) {
                        reject(new Error('Timeout waiting for condition'));
                    } else {
                        setTimeout(check, 10);
                    }
                } catch (error) {
                    reject(error);
                }
            };
            check();
        });
    }
};

// Clean up after each test
afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.resetAllMocks();
    jest.restoreAllMocks();
});

// Global test timeout
jest.setTimeout(10000);
