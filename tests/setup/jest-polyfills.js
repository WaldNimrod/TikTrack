/**
 * Jest Polyfills Toolkit
 * ----------------------
 * Centralized polyfills and global stubs required by the TikTrack test suite.
 *
 * @version 1.0.0
 */

const { TextEncoder, TextDecoder } = require('util');
const { Blob } = require('buffer');

const ensureTextEncoding = (scope) => {
    if (typeof scope.TextEncoder !== 'function') {
        scope.TextEncoder = TextEncoder;
    }

    if (typeof scope.TextDecoder !== 'function') {
        scope.TextDecoder = TextDecoder;
    }
};

const ensureBlob = (scope) => {
    if (typeof scope.Blob === 'undefined') {
        scope.Blob = Blob;
    }
};

const ensureStructuredClone = (scope) => {
    if (typeof scope.structuredClone === 'function') {
        return;
    }

    const cloneValue = (value, refs = new WeakMap()) => {
        if (value === null || typeof value !== 'object') {
            return value;
        }

        if (refs.has(value)) {
            return refs.get(value);
        }

        if (value instanceof Date) {
            return new Date(value.getTime());
        }

        if (value instanceof RegExp) {
            return new RegExp(value.source, value.flags);
        }

        if (value instanceof Map) {
            const clonedMap = new Map();
            refs.set(value, clonedMap);
            value.forEach((mapValue, key) => {
                clonedMap.set(cloneValue(key, refs), cloneValue(mapValue, refs));
            });
            return clonedMap;
        }

        if (value instanceof Set) {
            const clonedSet = new Set();
            refs.set(value, clonedSet);
            value.forEach((setValue) => {
                clonedSet.add(cloneValue(setValue, refs));
            });
            return clonedSet;
        }

        if (Array.isArray(value)) {
            const clonedArray = value.map((item) => cloneValue(item, refs));
            refs.set(value, clonedArray);
            return clonedArray;
        }

        if (ArrayBuffer.isView(value)) {
            return new value.constructor(value);
        }

        if (value instanceof ArrayBuffer) {
            return value.slice(0);
        }

        const clonedObject = {};
        refs.set(value, clonedObject);
        Object.keys(value).forEach((key) => {
            clonedObject[key] = cloneValue(value[key], refs);
        });
        return clonedObject;
    };

    scope.structuredClone = (input) => cloneValue(input);
};

const ensureFetch = (scope, windowScope) => {
    if (typeof scope.fetch !== 'function') {
        scope.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            statusText: 'OK',
            json: async () => ({}),
            text: async () => '',
            blob: async () => new Blob(),
            arrayBuffer: async () => new ArrayBuffer(0)
        });
    }

    if (windowScope && typeof windowScope.fetch !== 'function') {
        windowScope.fetch = (...args) => scope.fetch(...args);
    }
};

const ensureResponse = (scope) => {
    if (typeof scope.Response === 'function') {
        return;
    }

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

    scope.Response = SimpleResponse;
};

const ensureHeaders = (scope) => {
    if (typeof scope.Headers === 'function') {
        return;
    }

    scope.Headers = class Headers {
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
        delete(key) {
            this.map.delete(key.toLowerCase());
        }
        forEach(callback, thisArg) {
            this.map.forEach((value, key) => {
                callback.call(thisArg, value, key, this);
            });
        }
        entries() {
            return this.map.entries();
        }
        keys() {
            return this.map.keys();
        }
        values() {
            return this.map.values();
        }
        [Symbol.iterator]() {
            return this.entries();
        }
    };
};

const ensureRequest = (scope) => {
    if (typeof scope.Request === 'function') {
        return;
    }

    scope.Request = class Request {
        constructor(input, init = {}) {
            this.url = typeof input === 'string' ? input : input?.url ?? '';
            this.method = init.method ?? 'GET';
            this.headers = new scope.Headers(init.headers || {});
            this.body = init.body ?? null;
            this.credentials = init.credentials ?? 'same-origin';
            this.cache = init.cache ?? 'default';
        }
    };
};

const ensureFormData = (scope) => {
    if (typeof scope.FormData === 'function') {
        return;
    }

    class SimpleFormData {
        constructor(form) {
            this._entries = [];

            if (form && typeof form === 'object' && typeof form.elements === 'object') {
                Array.from(form.elements)
                    .filter((element) => element?.name)
                    .forEach((element) => {
                        const { name, value, type, checked, files } = element;
                        if (type === 'checkbox' || type === 'radio') {
                            if (checked) {
                                this.append(name, value ?? 'on');
                            }
                            return;
                        }

                        if (type === 'file' && files) {
                            Array.from(files).forEach((file) => {
                                this.append(name, file);
                            });
                            return;
                        }

                        this.append(name, value ?? '');
                    });
            }
        }

        append(name, value) {
            this._entries.push([String(name), value]);
        }

        set(name, value) {
            this.delete(name);
            this.append(name, value);
        }

        get(name) {
            const entry = this._entries.find(([key]) => key === name);
            return entry ? entry[1] : null;
        }

        getAll(name) {
            return this._entries.filter(([key]) => key === name).map(([, value]) => value);
        }

        has(name) {
            return this._entries.some(([key]) => key === name);
        }

        delete(name) {
            this._entries = this._entries.filter(([key]) => key !== name);
        }

        forEach(callback, thisArg) {
            this._entries.forEach(([key, value]) => callback.call(thisArg, value, key, this));
        }

        entries() {
            return this._entries[Symbol.iterator]();
        }

        keys() {
            return this._entries.map(([key]) => key)[Symbol.iterator]();
        }

        values() {
            return this._entries.map(([, value]) => value)[Symbol.iterator]();
        }

        [Symbol.iterator]() {
            return this.entries();
        }
    }

    scope.FormData = SimpleFormData;
};

const ensureResizeObserver = (scope, windowScope) => {
    const target = windowScope ?? scope;
    if (typeof target.ResizeObserver === 'function') {
        return;
    }

    target.ResizeObserver = class ResizeObserver {
        constructor(callback = () => {}) {
            this.callback = callback;
            this.observe = jest.fn();
            this.unobserve = jest.fn();
            this.disconnect = jest.fn();
        }
    };
};

const ensureStorage = (scope, windowScope) => {
    const createStorage = () => {
        const store = new Map();
        return {
            getItem: jest.fn((key) => (store.has(key) ? store.get(key) : null)),
            setItem: jest.fn((key, value) => {
                store.set(String(key), String(value));
            }),
            removeItem: jest.fn((key) => {
                store.delete(String(key));
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

    const targetWindow = windowScope ?? scope;

    if (!targetWindow.localStorage) {
        targetWindow.localStorage = createStorage();
    }

    if (!targetWindow.sessionStorage) {
        targetWindow.sessionStorage = createStorage();
    }
};

const ensureConsole = (scope) => {
    scope.console = scope.console || {};
    ['log', 'warn', 'error', 'info', 'debug'].forEach((method) => {
        if (typeof scope.console[method] !== 'function') {
            scope.console[method] = jest.fn();
        } else if (!scope.console[method]._isMockFunction) {
            jest.spyOn(scope.console, method).mockImplementation(() => {});
        }
    });
};

const ensureTimers = (scope) => {
    if (typeof scope.setTimeout !== 'function') {
        scope.setTimeout = jest.fn((callback) => {
            callback?.();
            return 1;
        });
    }

    if (typeof scope.setInterval !== 'function') {
        scope.setInterval = jest.fn((callback) => {
            callback?.();
            return 1;
        });
    }

    if (typeof scope.requestAnimationFrame !== 'function') {
        scope.requestAnimationFrame = jest.fn((callback) => {
            callback?.(0);
            return 1;
        });
    }
};

const applyPolyfills = (scope = globalThis) => {
    const windowScope = scope.window ?? scope;

    ensureTextEncoding(scope);
    ensureBlob(scope);
    ensureStructuredClone(scope);
    ensureFetch(scope, windowScope);
    ensureResponse(scope);
    ensureHeaders(scope);
    ensureRequest(scope);
    ensureFormData(scope);
    ensureResizeObserver(scope, windowScope);
    ensureStorage(scope, windowScope);
    ensureConsole(scope);
    ensureTimers(scope);
};

module.exports = {
    applyPolyfills
};

