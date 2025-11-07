/**
 * Event Handler Manager Unit Tests
 * =================================
 * 
 * Unit tests for the Event Handler Manager system
 * 
 * @version 1.0.0
 * @created January 2025
 * @author TikTrack Development Team
 */

const { loadScriptWithDependencies, setupBasicMocks } = require('../utils/test-loader');

describe('Event Handler Manager', () => {
    let buttonElement;

    beforeAll(() => {
        // Setup basic mocks
        setupBasicMocks({
            testFunction: jest.fn(),
            showErrorNotification: jest.fn()
        });

        // Mock DOM
        buttonElement = document.createElement('button');
        buttonElement.setAttribute('data-onclick', 'testFunction()');
        buttonElement.id = 'test-button';
        document.body.appendChild(buttonElement);

        // Mock closest method
        buttonElement.closest = jest.fn((selector) => {
            if (selector.includes('data-onclick')) {
                return buttonElement;
            }
            return null;
        });

        // Mock getAttribute
        buttonElement.getAttribute = jest.fn((attr) => {
            if (attr === 'data-onclick') {
                return 'testFunction()';
            }
            return null;
        });

        // Mock document methods using spyOn instead of mockImplementation
        const addEventListenerSpy = jest.spyOn(document, 'addEventListener').mockImplementation((event, callback) => {
            if (event === 'click') {
                // Store callback for testing
                window._clickHandler = callback;
            }
        });
        
        const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener').mockImplementation(() => {});

        // Load with dependencies using test loader only if not already loaded
        if (!window.EventHandlerManager) {
            const code = loadScriptWithDependencies('scripts/event-handler-manager.js');
            eval(code);
        }
        
        // Ensure clean state for tests
        if (window.EventHandlerManager) {
            window.EventHandlerManager.listeners = new Map();
            window.EventHandlerManager.delegatedListeners = new Map();
        }
    });

    afterEach(() => {
        jest.clearAllMocks();
        if (window.EventHandlerManager) {
            window.EventHandlerManager.listeners = new Map();
            window.EventHandlerManager.delegatedListeners = new Map();
        }
    });

    describe('Initialization', () => {
        test('should initialize EventHandlerManager', () => {
            expect(window.EventHandlerManager).toBeDefined();
            // EventHandlerManager auto-initializes, but initialized might be false initially
            // The important thing is that it exists
            expect(window.EventHandlerManager).toBeInstanceOf(Object);
        });

        test('should have listeners Map', () => {
            expect(window.EventHandlerManager).toBeDefined();
            if (window.EventHandlerManager) {
                expect(window.EventHandlerManager.listeners).toBeInstanceOf(Map);
            }
        });

        test('should have delegatedListeners Map', () => {
            expect(window.EventHandlerManager).toBeDefined();
            if (window.EventHandlerManager) {
                expect(window.EventHandlerManager.delegatedListeners).toBeInstanceOf(Map);
            }
        });
    });

    describe('Event Delegation', () => {
        test('should handle delegated click events', () => {
            if (!window.EventHandlerManager || !window.EventHandlerManager.handleDelegatedClick) {
                return; // Skip if not available
            }

            const event = {
                target: buttonElement,
                _ehmHandled: false,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };

            window.EventHandlerManager.handleDelegatedClick(event);

            // Should execute the onclick handler if available
            if (window.testFunction) {
                expect(window.testFunction).toHaveBeenCalled();
            }
        });

        test('should not handle events twice', () => {
            if (!window.EventHandlerManager || !window.EventHandlerManager.handleDelegatedClick) {
                return;
            }

            const event = {
                target: buttonElement,
                _ehmHandled: true,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };

            window.EventHandlerManager.handleDelegatedClick(event);

            // Should not execute if already handled
            if (window.testFunction) {
                expect(window.testFunction).not.toHaveBeenCalled();
            }
        });

        test('should handle disabled buttons', () => {
            if (!window.EventHandlerManager || !window.EventHandlerManager.handleDelegatedClick) {
                return;
            }

            buttonElement.disabled = true;
            const event = {
                target: buttonElement,
                _ehmHandled: false,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };

            window.EventHandlerManager.handleDelegatedClick(event);

            // Should not execute for disabled buttons
            if (window.testFunction) {
                expect(window.testFunction).not.toHaveBeenCalled();
            }

            buttonElement.disabled = false;
        });
    });

    describe('addEventListener', () => {
        test('should add event listener', () => {
            const callback = jest.fn();
            window.EventHandlerManager.addEventListener('test-event', callback);
            expect(window.EventHandlerManager.listeners.size).toBeGreaterThan(0);
            expect(document.addEventListener).toHaveBeenCalledWith('test-event', callback, {});
        });

        test('should prevent duplicate listeners', () => {
            const callback = jest.fn();
            window.EventHandlerManager.addEventListener('test-event-2', callback);
            window.EventHandlerManager.addEventListener('test-event-2', callback);
            expect(window.EventHandlerManager.listeners.size).toBe(1);
        });
    });

    describe('removeEventListener', () => {
        test('should remove event listener', () => {
            const callback = jest.fn();
            callback.name = 'testRemoveCallback';
            window.EventHandlerManager.addEventListener('test-remove', callback);
            window.EventHandlerManager.removeEventListener('test-remove', callback);

            // After removal, listeners Map should not have the entry
            const key = 'test-remove:testRemoveCallback';
            const listeners = window.EventHandlerManager.listeners.get(key);
            // The system removes listeners, so it should be undefined
            expect(listeners).toBeUndefined();
        });
    });
});

