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

const fs = require('fs');
const path = require('path');

// Load the actual Event Handler Manager code
const eventHandlerCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/event-handler-manager.js'),
    'utf8'
);

describe('Event Handler Manager', () => {
    let buttonElement;

    beforeAll(() => {
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

        // Mock document methods
        document.addEventListener.mockImplementation((event, callback) => {
            if (event === 'click') {
                // Store callback for testing
                window._clickHandler = callback;
            }
        });

        // Mock window functions
        global.window.testFunction = jest.fn();
        global.window.showErrorNotification = jest.fn();

        // Evaluate the real code
        eval(eventHandlerCode);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Initialization', () => {
        test('should initialize EventHandlerManager', () => {
            expect(window.EventHandlerManager).toBeDefined();
            expect(window.EventHandlerManager.initialized).toBe(true);
        });

        test('should have listeners Map', () => {
            expect(window.EventHandlerManager.listeners).toBeInstanceOf(Map);
        });

        test('should have delegatedListeners Map', () => {
            expect(window.EventHandlerManager.delegatedListeners).toBeInstanceOf(Map);
        });
    });

    describe('Event Delegation', () => {
        test('should handle delegated click events', () => {
            const event = {
                target: buttonElement,
                _ehmHandled: false,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };

            window.EventHandlerManager.handleDelegatedClick(event);

            // Should execute the onclick handler
            expect(window.testFunction).toHaveBeenCalled();
        });

        test('should not handle events twice', () => {
            const event = {
                target: buttonElement,
                _ehmHandled: true,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };

            window.EventHandlerManager.handleDelegatedClick(event);

            // Should not execute if already handled
            expect(window.testFunction).not.toHaveBeenCalled();
        });

        test('should handle disabled buttons', () => {
            buttonElement.disabled = true;
            const event = {
                target: buttonElement,
                _ehmHandled: false,
                preventDefault: jest.fn(),
                stopPropagation: jest.fn()
            };

            window.EventHandlerManager.handleDelegatedClick(event);

            // Should not execute for disabled buttons
            expect(window.testFunction).not.toHaveBeenCalled();

            buttonElement.disabled = false;
        });
    });

    describe('addEventListener', () => {
        test('should add event listener', () => {
            const callback = jest.fn();
            window.EventHandlerManager.addEventListener('test-event', callback);

            expect(window.EventHandlerManager.listeners.has('test-event')).toBe(true);
        });

        test('should prevent duplicate listeners', () => {
            const callback = jest.fn();
            window.EventHandlerManager.addEventListener('test-event-2', callback);
            window.EventHandlerManager.addEventListener('test-event-2', callback);

            // Should only have one listener
            const listeners = window.EventHandlerManager.listeners.get('test-event-2');
            expect(listeners.length).toBe(1);
        });
    });

    describe('removeEventListener', () => {
        test('should remove event listener', () => {
            const callback = jest.fn();
            window.EventHandlerManager.addEventListener('test-remove', callback);
            window.EventHandlerManager.removeEventListener('test-remove', callback);

            const listeners = window.EventHandlerManager.listeners.get('test-remove');
            expect(listeners).toBeUndefined() || expect(listeners.length).toBe(0);
        });
    });
});

