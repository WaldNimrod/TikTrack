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

const { applyPolyfills } = require('./setup/jest-polyfills');
const ensureBootstrapModalMock = require('./setup/bootstrap-modal-mock');
const registerGlobalMocks = require('./mocks/register-global-mocks');

applyPolyfills(globalThis);
ensureBootstrapModalMock(globalThis);
registerGlobalMocks();

// Utility helpers shared across tests
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
        type,
        target: options.target ?? null,
        currentTarget: options.currentTarget ?? null,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        stopImmediatePropagation: jest.fn(),
        ...options
    }),
    createMockData: (type, data = {}) => ({
        id: Math.random().toString(36).slice(2),
        type,
        ...data
    }),
    waitFor: (callback, timeout = 1000) =>
        new Promise((resolve, reject) => {
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
        })
};

afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.resetAllMocks();
    jest.restoreAllMocks();
});

jest.setTimeout(15000);
