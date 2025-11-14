/**
 * Bootstrap Modal Mock
 * --------------------
 * Provides a reusable Bootstrap 5 Modal mock for the Jest environment.
 *
 * @version 1.0.0
 */

const ensureBootstrapModalMock = (scope = globalThis) => {
    const target = scope.window ?? scope;

    if (target.bootstrap && typeof target.bootstrap.Modal === 'function') {
        const modal = target.bootstrap.Modal;
        if (typeof modal.getOrCreateInstance === 'function') {
            return modal;
        }
    }

    const instances = new WeakMap();

    if (!target.bootstrap) {
        target.bootstrap = {};
    }

    const createInstance = (element, config = {}) => {
        const instance = {
            _element: element,
            _config: config,
            show: jest.fn(),
            hide: jest.fn(),
            toggle: jest.fn(),
            dispose: jest.fn(),
            handleUpdate: jest.fn()
        };
        instances.set(element, instance);
        return instance;
    };

    const modalFactory = jest.fn((element, config = {}) => {
        if (!element) {
            throw new Error('Bootstrap Modal mock requires a target element.');
        }
        return createInstance(element, config);
    });

    modalFactory.VERSION = '5.3.0-mock';

    modalFactory.getInstance = (element) => {
        if (!element) {
            return null;
        }
        return instances.get(element) ?? null;
    };

    modalFactory.getOrCreateInstance = jest.fn((element, config = {}) => {
        if (!element) {
            return null;
        }
        const existing = instances.get(element);
        return existing ?? createInstance(element, config);
    });

    target.bootstrap.Modal = modalFactory;

    return target.bootstrap.Modal;
};

module.exports = ensureBootstrapModalMock;

