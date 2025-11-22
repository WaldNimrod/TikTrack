const path = require('path');

describe('Color Scheme System', () => {
    const scriptPath = path.join(__dirname, '../../trading-ui/scripts/color-scheme-system.js');
    let setPropertyMock;
    let getPropertyValueMock;

    beforeEach(() => {
        jest.resetModules();

        setPropertyMock = jest.fn();
        getPropertyValueMock = jest.fn().mockReturnValue('');

        Object.defineProperty(document.documentElement, 'style', {
            configurable: true,
            value: {
                setProperty: setPropertyMock,
                getPropertyValue: getPropertyValueMock
            }
        });

        window.Logger.warn = jest.fn();
        delete require.cache[scriptPath];
        require(scriptPath);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete window.colorSchemeSystem;
    });

    test('exposes color scheme API surface', () => {
        expect(window.colorSchemeSystem).toBeDefined();
        expect(typeof window.getEntityColor).toBe('function');
        expect(typeof window.getNumericValueColor).toBe('function');
    });

    test('returns entity colors from registry', () => {
        window.ENTITY_COLORS.trade = '#26baac';
        expect(window.getEntityColor('trade')).toBe('#26baac');
    });

    test('updateCSSVariablesFromPreferences writes overrides', () => {
        window.updateCSSVariablesFromPreferences({
            successColor: '#22ccaa',
            valuePositiveColorLight: '#b6f5e9',
            valuePositiveColorDark: '#1a8f83'
        });

        expect(setPropertyMock).toHaveBeenCalledWith('--color-success', '#22ccaa');
        expect(setPropertyMock).toHaveBeenCalledWith('--color-success-light', '#b6f5e9');
        expect(setPropertyMock).toHaveBeenCalledWith('--color-success-dark', '#1a8f83');
    });

    test('numeric palette helpers respect value sign', () => {
        expect(window.getNumericValueColor(10)).toBe(window.NUMERIC_VALUE_COLORS.positive.medium);
        expect(window.getNumericValueColor(-5)).toBe(window.NUMERIC_VALUE_COLORS.negative.medium);
        expect(window.getNumericValueColor(0)).toBe(window.NUMERIC_VALUE_COLORS.zero.medium);
    });

    test('investment palette returns structured colors', () => {
        const swing = window.getInvestmentTypeColor('swing', 'medium');
        expect(swing).toBe(window.INVESTMENT_TYPE_COLORS.swing.medium);
    });
});