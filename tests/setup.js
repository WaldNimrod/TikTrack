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

const { TextEncoder, TextDecoder } = require('util');
const { Blob } = require('buffer');
const registerGlobalMocks = require('./mocks/register-global-mocks');

/**
 * Polyfills
 */
if (!global.TextEncoder) {
    global.TextEncoder = TextEncoder;
}

if (!global.TextDecoder) {
    global.TextDecoder = TextDecoder;
}

if (typeof global.Blob === 'undefined') {
    global.Blob = Blob;
}

const ensureFetch = () => {
    if (typeof global.fetch !== 'function') {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            statusText: 'OK',
            json: async () => ({}),
            text: async () => '',
            blob: async () => new Blob(),
            arrayBuffer: async () => new ArrayBuffer(0)
        });
    }

    if (global.window && typeof global.window.fetch !== 'function') {
        global.window.fetch = (...args) => global.fetch(...args);
    }
};

const ensureResponse = () => {
    if (typeof global.Response !== 'function') {
        class SimpleResponse {
            constructor(body = '', init = {}) {
                this._body = body;
                this.status = init.status ?? 200;
                this.statusText = init.statusText ?? 'OK';
                this.headers = init.headers ?? {};
                this.ok = this.status >= 200 && this.status < 300;
                this.url = init.url ?? 'http://localhost';
                this.type = 'default';
            }

            async json() {
                if (typeof this._body === 'string' && this._body.length > 0) {
                    try {
                        return JSON.parse(this._body);
                    } catch (error) {
                        return {};
                    }
                }
                return typeof this._body === 'object' ? this._body : {};
            }

            async text() {
                if (typeof this._body === 'string') {
                    return this._body;
                }
                if (typeof this._body === 'object') {
                    return JSON.stringify(this._body);
                }
                return '';
            }

            async blob() {
                return new Blob([await this.text()]);
            }

            async arrayBuffer() {
                const text = await this.text();
                const encoder = new TextEncoder();
                return encoder.encode(text).buffer;
            }
        }

        global.Response = SimpleResponse;
    }
};

const ensureRequestAndHeaders = () => {
    if (typeof global.Headers !== 'function') {
        global.Headers = class Headers {
            constructor(init = {}) {
                this.map = new Map(Object.entries(init));
            }
            set(key, value) {
                this.map.set(key.toLowerCase(), value);
            }
            get(key) {
                return this.map.get(key.toLowerCase());
            }
            has(key) {
                return this.map.has(key.toLowerCase());
            }
        };
    }

    if (typeof global.Request !== 'function') {
        global.Request = class Request {
            constructor(input, init = {}) {
                this.url = typeof input === 'string' ? input : input?.url ?? '';
                this.method = init.method ?? 'GET';
                this.headers = new Headers(init.headers || {});
                this.body = init.body ?? null;
            }
        };
    }
};

const ensureStorage = () => {
    const createStorage = () => {
        const store = new Map();
        return {
            getItem: jest.fn((key) => (store.has(key) ? store.get(key) : null)),
            setItem: jest.fn((key, value) => {
                store.set(String(key), String(value));
            }),
            removeItem: jest.fn((key) => {
                store.delete(key);
            }),
            clear: jest.fn(() => {
                store.clear();
            }),
            key: jest.fn((index) => Array.from(store.keys())[index] ?? null),
            get length() {
                return store.size;
            }
        };
    };

    const targetWindow = global.window ?? globalThis;

    if (!targetWindow.localStorage) {
        targetWindow.localStorage = createStorage();
    }

    if (!targetWindow.sessionStorage) {
        targetWindow.sessionStorage = createStorage();
    }
};

const ensureConsole = () => {
    global.console = global.console || {};
    ['log', 'warn', 'error', 'info', 'debug'].forEach((method) => {
        if (typeof global.console[method] !== 'function') {
            global.console[method] = jest.fn();
        } else {
            jest.spyOn(global.console, method).mockImplementation(() => {});
        }
    });
};

const ensureTimers = () => {
    if (typeof global.setTimeout !== 'function') {
        global.setTimeout = jest.fn((cb) => {
            cb?.();
            return 1;
        });
    }

    if (typeof global.setInterval !== 'function') {
        global.setInterval = jest.fn((cb) => {
            cb?.();
            return 1;
        });
    }

    if (typeof global.requestAnimationFrame !== 'function') {
        global.requestAnimationFrame = jest.fn((cb) => {
            cb?.(0);
            return 1;
        });
    }
};

ensureFetch();
ensureResponse();
ensureRequestAndHeaders();
ensureStorage();
ensureConsole();
ensureTimers();
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
