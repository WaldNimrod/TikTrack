const fs = require('fs');
const path = require('path');

const buttonIconsCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/button-icons.js'),
    'utf8'
);

const buttonSystemCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/button-system-init.js'),
    'utf8'
);

class MockMutationObserver {
    constructor() {}
    observe() {}
    disconnect() {}
}

describe('Advanced Button System', () => {
    beforeAll(() => {
        global.performance = { now: jest.fn(() => 0) };
        global.requestAnimationFrame = jest.fn(cb => cb());
        global.MutationObserver = MockMutationObserver;
        global.Node = { ELEMENT_NODE: 1 };

        const body = {
            querySelectorAll: jest.fn(() => []),
            addEventListener: jest.fn()
        };

        global.document = {
            readyState: 'complete',
            addEventListener: jest.fn(),
            querySelectorAll: jest.fn(() => []),
            querySelector: jest.fn(() => null),
            getElementById: jest.fn(() => null),
            body
        };

        global.window = {
            Logger: {
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
                debug: jest.fn()
            },
            MutationObserver: MockMutationObserver,
            requestAnimationFrame: global.requestAnimationFrame
        };

        // Support functions expected by the system
        global.window.getComputedStyle = jest.fn(() => ({ getPropertyValue: jest.fn() }));

        eval(buttonIconsCode);
        eval(buttonSystemCode);
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('exposes ButtonSystem with basic API', () => {
        expect(window.ButtonSystem).toBeDefined();
        expect(typeof window.ButtonSystem.createButtonFromData).toBe('function');
        expect(typeof window.ButtonSystem.addButton).toBe('function');
    });

    test('createButtonFromData builds markup with icon and metadata', () => {
        const markup = window.ButtonSystem.createButtonFromData(
            'EDIT',
            'handleEdit',
            ' custom-class',
            "data-extra='1'",
            '',
            'btn-edit-1',
            'trade',
            'large',
            '',
            'full'
        );

        expect(markup).toContain("data-button-type='EDIT'");
        expect(markup).toContain('data-onclick="handleEdit"');
        expect(markup).toContain("data-entity-type='trade'");
        expect(markup).toContain(window.BUTTON_TEXTS.EDIT);
        expect(markup).toContain(window.BUTTON_ICONS.EDIT);
    });

    test('addButton injects processed button into provided container', () => {
        const container = { insertAdjacentHTML: jest.fn() };

        window.ButtonSystem.addButton(
            container,
            'SAVE',
            'saveItem()',
            ' custom-save',
            "data-track='true'",
            'שמור',
            'btn-save-1'
        );

        expect(container.insertAdjacentHTML).toHaveBeenCalledTimes(1);
        const [, html] = container.insertAdjacentHTML.mock.calls[0];
        expect(html).toContain("data-button-type='SAVE'");
        expect(html).toContain('saveItem()');
        expect(html).toContain('שמור');
    });

    test('getStats reports telemetry after cleanup', () => {
        const statsBefore = window.ButtonSystem.getStats();
        expect(statsBefore).toHaveProperty('performance');
        expect(statsBefore).toHaveProperty('cache');
        expect(statsBefore).toHaveProperty('buttons');

        window.ButtonSystem.cleanup();
        const statsAfter = window.ButtonSystem.getStats();
        expect(statsAfter.buttons).toBe(0);
        expect(statsAfter.observers).toBe(0);
    });
});
