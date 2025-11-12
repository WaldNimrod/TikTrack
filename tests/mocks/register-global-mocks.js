/**
 * TikTrack Global Mocks
 * ---------------------
 * Central place to register shared global stubs for Jest.
 */

const createNoopFn = () => jest.fn();

const createMethodStubs = (methods, implementation = createNoopFn) =>
    methods.reduce((acc, method) => {
        acc[method] = implementation();
        return acc;
    }, {});

const createAsyncFn = () => jest.fn().mockResolvedValue(undefined);

const ensureGlobal = (key, factory) => {
    if (!globalThis[key]) {
        globalThis[key] = factory();
    }
    return globalThis[key];
};

const registerLogger = () => {
    const logger = createMethodStubs([
        'debug',
        'info',
        'warn',
        'error',
        'critical',
        'setLevel',
        'getLevel',
        'flush',
        'clear',
        'getLogs',
        'exportLogs',
        'sendToServer',
        'setServerEndpoint',
        'setConfig',
        'startTimer',
        'endTimer',
        'measurePerformance'
    ]);
    return ensureGlobal('Logger', () => logger);
};

const registerNotifications = () => {
    const notificationFns = {
        showNotification: createAsyncFn(),
        showSuccessNotification: createAsyncFn(),
        showErrorNotification: createAsyncFn(),
        showWarningNotification: createAsyncFn(),
        showInfoNotification: createAsyncFn()
    };

    Object.entries(notificationFns).forEach(([key, fn]) => {
        if (!globalThis[key]) {
            globalThis[key] = fn;
        }
    });

    return notificationFns;
};

const createProxyStub = (name) =>
    new Proxy(
        {},
        {
            get: (_, prop) => {
                if (!Reflect.has(_, prop)) {
                    _[prop] = createNoopFn();
                }
                return _[prop];
            },
            set: (_, prop, value) => {
                _[prop] = typeof value === 'function' ? jest.fn(value) : value;
                return true;
            },
            apply: () => {
                throw new Error(`${name} mock was invoked as a function – supply explicit implementation in the test.`);
            }
        }
    );

const registerSystemStubs = () => {
    ensureGlobal('FieldRendererService', () => createProxyStub('FieldRendererService'));
    ensureGlobal('UnifiedCacheManager', () => createProxyStub('UnifiedCacheManager'));
    ensureGlobal('ButtonSystem', () => createProxyStub('ButtonSystem'));
    ensureGlobal('TableSystem', () => createProxyStub('TableSystem'));
    ensureGlobal('ChartSystem', () => createProxyStub('ChartSystem'));
    ensureGlobal('ModalManagerV2', () => createProxyStub('ModalManagerV2'));
    ensureGlobal('ModalNavigationService', () => createProxyStub('ModalNavigationService'));
    ensureGlobal('showEntityDetailsModal', () => createAsyncFn());
    ensureGlobal('notificationSystem', () =>
        createProxyStub('notificationSystem')
    );
};

const registerPreferences = () => {
    ensureGlobal('getPreference', () => createAsyncFn());
    ensureGlobal('preferencesCache', () => ({
        get: createAsyncFn(),
        set: createAsyncFn(),
        save: createAsyncFn(),
        remove: createAsyncFn(),
        clear: createAsyncFn(),
        has: jest.fn(),
        keys: jest.fn(() => []),
        values: jest.fn(() => [])
    }));
};

const registerMatchMedia = () => {
    const win = globalThis.window;
    if (win && typeof win.matchMedia !== 'function') {
        Object.defineProperty(win, 'matchMedia', {
            writable: true,
            value: jest.fn().mockImplementation((query) => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: jest.fn(), // deprecated
                removeListener: jest.fn(), // deprecated
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn()
            }))
        });
    }
};

const registerEventHandlerManager = () => {
    if (globalThis.EventHandlerManager) {
        return globalThis.EventHandlerManager;
    }

    const stub = {
        listeners: new Map(),
        delegatedListeners: new Map()
    };

    stub.addEventListener = jest.fn((eventName, handler, options = {}) => {
        if (typeof document?.addEventListener === 'function') {
            document.addEventListener(eventName, handler, options);
        }
        const key = `${eventName}:${handler.name || 'anonymous'}`;
        stub.listeners.set(key, handler);
        return handler;
    });

    stub.removeEventListener = jest.fn((eventName, handler) => {
        const key = `${eventName}:${handler?.name || 'anonymous'}`;
        stub.listeners.delete(key);
        if (typeof document?.removeEventListener === 'function') {
            document.removeEventListener(eventName, handler);
        }
    });

    stub.handleDelegatedClick = jest.fn((event = {}) => {
        if (event._ehmHandled) {
            return;
        }

        const target = event.target;
        const getAttribute = target?.getAttribute?.bind(target);
        const handlerAttr = getAttribute ? getAttribute('data-onclick') : undefined;

        if (handlerAttr) {
            const fnName = handlerAttr.replace(/\(.*\)/, '').trim();
            const handlerFn = (typeof window !== 'undefined' && window[fnName]) || globalThis[fnName];
            if (typeof handlerFn === 'function') {
                handlerFn(event);
            }
        }

        event._ehmHandled = true;
    });

    stub.clearAllListeners = jest.fn(() => {
        stub.listeners.clear();
        stub.delegatedListeners.clear();
    });

    return ensureGlobal('EventHandlerManager', () => stub);
};

module.exports = function registerGlobalMocks() {
    registerLogger();
    registerNotifications();
    registerSystemStubs();
    registerPreferences();
    registerMatchMedia();
    registerEventHandlerManager();

    return {
        Logger: globalThis.Logger,
        notifications: {
            showNotification: globalThis.showNotification,
            showSuccessNotification: globalThis.showSuccessNotification,
            showErrorNotification: globalThis.showErrorNotification,
            showWarningNotification: globalThis.showWarningNotification,
            showInfoNotification: globalThis.showInfoNotification
        }
    };
};

