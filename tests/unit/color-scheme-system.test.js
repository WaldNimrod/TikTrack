const path = require('path');

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));
const resetColorSchemeGlobals = () => {
    delete window.VALID_ENTITY_TYPES;
    delete window.colorSchemeSystem;
    delete window.colorSchemeSystemReady;
};

describe('Color Scheme System', () => {
    const scriptPath = path.join(__dirname, '../../trading-ui/scripts/color-scheme-system.js');
    let setPropertyMock;
    let getPropertyValueMock;
    let originalFetch;
    let readyStateDescriptor;
    let loadColorSchemeModule;

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

        document.body.innerHTML = '';
        document.body.className = '';
        document.head.innerHTML = '';
        window.localStorage.clear();
        window.Logger = window.Logger || {};
        window.Logger.warn = jest.fn();
        window.Logger.error = jest.fn();
        window.Logger.info = jest.fn();
        originalFetch = global.fetch;
        delete global.fetch;
        resetColorSchemeGlobals();

        readyStateDescriptor = Object.getOwnPropertyDescriptor(document, 'readyState');

        loadColorSchemeModule = (state = 'loading') => {
            delete require.cache[scriptPath];
            Object.defineProperty(document, 'readyState', {
                configurable: true,
                get: () => state
            });
            require(scriptPath);

            if (readyStateDescriptor) {
                Object.defineProperty(document, 'readyState', readyStateDescriptor);
            } else {
                Object.defineProperty(document, 'readyState', {
                    configurable: true,
                    get: () => 'complete'
                });
            }
        };

        loadColorSchemeModule();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        resetColorSchemeGlobals();
        delete window.loadUserPreferences;
        delete window.currentPreferences;
        delete global.fetch;
        if (originalFetch) {
            global.fetch = originalFetch;
        }
        if (readyStateDescriptor) {
            Object.defineProperty(document, 'readyState', readyStateDescriptor);
        }
        window.localStorage.clear();
    });

    test('updateCSSVariablesFromPreferences falls back to primary color for info overrides (infoColor missing)', () => {
        setPropertyMock.mockClear();
        window.updateCSSVariablesFromPreferences({ primaryColor: '#555555' });
        expect(setPropertyMock).toHaveBeenCalledWith('--color-info', '#555555');
        expect(setPropertyMock).toHaveBeenCalledWith('--color-info-light', expect.any(String));
        expect(setPropertyMock).toHaveBeenCalledWith('--color-info-dark', expect.any(String));
    });

    test('updateCSSVariablesFromPreferences applies entity, status and numeric overrides', () => {
        setPropertyMock.mockClear();
        window.updateCSSVariablesFromPreferences({
            colorScheme: {
                entities: { trade: '#101010' },
                status: { active: '#202020' },
                numericValues: {
                    positive: { medium: '#303030' },
                    negative: { medium: '#404040' },
                    zero: { medium: '#505050' }
                }
            },
            successColor: '#606060',
            dangerColor: '#707070',
            warningColor: '#808080',
            infoColor: '#909090'
        });

        expect(setPropertyMock).toHaveBeenCalledWith('--entity-trade-color', '#101010');
        expect(setPropertyMock).toHaveBeenCalledWith('--user-status-active-color', '#202020');
        expect(setPropertyMock).toHaveBeenCalledWith('--numeric-positive-medium', '#303030');
        expect(setPropertyMock).toHaveBeenCalledWith('--color-success', '#606060');
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

    test('applyColorScheme applies dark scheme and dispatches event', () => {
        setPropertyMock.mockClear();
        const listener = jest.fn();
        window.addEventListener('colorSchemeChanged', listener);

        window.applyColorScheme('dark');

        window.removeEventListener('colorSchemeChanged', listener);
        expect(document.body.classList.contains('dark-scheme')).toBe(true);
        expect(window.localStorage.getItem('colorScheme')).toBe('dark');
        expect(setPropertyMock).toHaveBeenCalledWith('--primary-color', expect.any(String));
        expect(listener).toHaveBeenCalled();
        expect(listener.mock.calls[0][0].detail.scheme).toBe('dark');
    });

    test('applyColorScheme falls back to light scheme for unknown id', () => {
        window.Logger.warn.mockClear();
        setPropertyMock.mockClear();

        window.applyColorScheme('unknown-scheme');

        expect(window.Logger.warn).toHaveBeenCalledWith(expect.stringContaining('Unknown color scheme'), expect.objectContaining({ page: 'color-scheme' }));
        expect(document.body.classList.contains('unknown-scheme-scheme')).toBe(true);
        expect(setPropertyMock).toHaveBeenCalledWith('--primary-color', '#26baac');
    });

    test('toggleColorScheme flips between light and dark', () => {
        window.applyColorScheme('light');
        setPropertyMock.mockClear();

        window.toggleColorScheme();

        expect(document.body.classList.contains('dark-scheme')).toBe(true);
        expect(window.localStorage.getItem('colorScheme')).toBe('dark');
        expect(setPropertyMock).toHaveBeenCalledWith('--primary-color', '#1a8f83');
    });

    test('loadColorScheme loads stored scheme', () => {
        window.localStorage.setItem('colorScheme', 'dark');
        setPropertyMock.mockClear();

        window.loadColorScheme();

        expect(document.body.classList.contains('dark-scheme')).toBe(true);
        expect(setPropertyMock).toHaveBeenCalledWith('--primary-color', '#1a8f83');
    });

    test('saveColorScheme persists custom colors', () => {
        window.saveColorScheme('custom', { primary: '#123456' });

        expect(window.localStorage.getItem('colorScheme')).toBe('custom');
        expect(window.localStorage.getItem('customColors')).toBe(JSON.stringify({ primary: '#123456' }));
    });

    test('loadEntityColorsFromPreferences applies overrides and stores preferences', () => {
        const preferences = {
            entityExecutionColor: '#123123',
            entityExecutionColorLight: '#223344',
            entityExecutionColorDark: '#112233',
            entityTradeColor: '#333333',
            entityTradeColorLight: '#444444',
            entityTradeColorDark: '#555555',
            entityAlertColor: '#abcdef',
            entityAlertColorLight: '#fedcba',
            entityAlertColorDark: '#123456',
            entityDevelopmentColor: '#aabbcc',
            entityDevelopmentColorLight: '#bbccdd',
            entityDevelopmentColorDark: '#8899aa'
        };

        window.loadEntityColorsFromPreferences(preferences);

        expect(window.currentPreferences).toBe(preferences);
        expect(window.ENTITY_COLORS.trade).toBe('#333333');
        expect(window.ENTITY_BACKGROUND_COLORS.trade).toBe('#444444');
        expect(window.ENTITY_COLORS.alert).toBe('#abcdef');
        expect(window.ENTITY_COLORS.development).toBe('#aabbcc');
    });

    test('loadDynamicColors coordinates scheme loaders', async () => {
        const originalLoad = window.loadColorScheme;
        const originalApply = window.applyColorScheme;
        window.loadColorScheme = jest.fn().mockResolvedValue(undefined);
        window.applyColorScheme = jest.fn();

        const result = await window.loadDynamicColors();

        expect(window.loadColorScheme).toHaveBeenCalled();
        expect(window.applyColorScheme).toHaveBeenCalled();
        expect(result).toBe(true);

        window.loadColorScheme = originalLoad;
        window.applyColorScheme = originalApply;
    });

    test('applyEntityColorsToHeaders assigns classes while skipping warnings', () => {
        document.body.innerHTML = `
            <div class="top-section">
                <div class="section-header" id="mainHeader">כותרת רגילה</div>
                <div class="section-header" id="warningHeader">אזהרה</div>
            </div>
            <div class="content-section">
                <div class="section-header" id="subHeader">כותרת משנית</div>
                <div class="modal" id="warningModal">
                    <div class="section-header" id="modalHeader">תוכן מודל</div>
                </div>
            </div>
        `;

        window.applyEntityColorsToHeaders('trade');

        expect(document.getElementById('mainHeader').classList.contains('entity-trade-main-header')).toBe(true);
        expect(document.getElementById('subHeader').classList.contains('entity-trade-sub-header')).toBe(true);
        expect(document.getElementById('warningHeader').classList.contains('entity-trade-main-header')).toBe(false);
        const modalHeaderClasses = document.getElementById('modalHeader').classList;
        expect(modalHeaderClasses.contains('entity-trade-main-header')).toBe(false);
        expect(modalHeaderClasses.contains('entity-trade-sub-header')).toBe(false);
    });

    test('generateAndApplyEntityCSS creates and reuses style element', () => {
        window.generateAndApplyEntityCSS();
        const firstElement = document.getElementById('dynamic-entity-colors');
        expect(firstElement).toBeTruthy();
        const initialContent = firstElement.textContent;

        window.generateAndApplyEntityCSS();

        const secondElement = document.getElementById('dynamic-entity-colors');
        expect(secondElement).toBe(firstElement);
        expect(secondElement.textContent).toBe(initialContent);
    });

    test('generateAndApplyEntityCSS logs error when DOM append fails', () => {
        const appendSpy = jest.spyOn(document.head, 'appendChild').mockImplementation(() => {
            throw new Error('append fail');
        });
        const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

        window.generateAndApplyEntityCSS();

        expect(consoleError).toHaveBeenCalledWith(expect.stringContaining('שגיאה ביצירת CSS דינמי:'), expect.any(Error));

        appendSpy.mockRestore();
        consoleError.mockRestore();
    });

    test('getTableColorsWithFallbacks returns values even when base incomplete', () => {
        const original = { ...window.NUMERIC_VALUE_COLORS };
        window.NUMERIC_VALUE_COLORS = {
            positive: {},
            negative: {},
            zero: {}
        };

        const colors = window.getTableColorsWithFallbacks();

        expect(colors.positive).toBeTruthy();
        expect(colors.negative).toBeTruthy();
        expect(colors.primary).toBeTruthy();

        window.NUMERIC_VALUE_COLORS = original;
    });

    test('generate CSS helpers produce structured styles', () => {
        const entityCSS = window.generateEntityCSS();
        const statusCSS = window.generateStatusCSS();
        const investmentCSS = window.generateInvestmentTypeCSS();
        const numericCSS = window.generateNumericValueCSS();

        expect(entityCSS).toContain('.entity-trade');
        expect(statusCSS).toContain('.status-active');
        expect(investmentCSS).toContain('.investment-swing');
        expect(numericCSS).toContain('.numeric-positive');
    });

    test('numeric value helpers return css class for sign detection', () => {
        const getClass = window.colorSchemeSystem.getNumericValueCSSClass;
        expect(getClass(10)).toBe('numeric-positive');
        expect(getClass(-5)).toBe('numeric-negative');
        expect(getClass(0)).toBe('numeric-zero');
    });

    test('header opacity helpers respect preferences and fallbacks', () => {
        window.currentPreferences = { headerOpacity: { main: 80, sub: 60 } };
        const mainExpected = Math.round(80 * 255 / 100).toString(16).padStart(2, '0');
        const subExpected = Math.round(60 * 255 / 100).toString(16).padStart(2, '0');
        expect(window.getMainHeaderOpacityHex()).toBe(mainExpected);
        expect(window.getSubHeaderOpacityHex()).toBe(subExpected);
        delete window.currentPreferences;
    });

    test('hexToRgb and darkenColor utilities manipulate colors correctly', () => {
        const rgb = window.colorSchemeSystem.hexToRgb('#26baac');
        expect(rgb).toEqual({ r: 38, g: 186, b: 172 });

        const darkened = window.colorSchemeSystem.darkenColor('#26baac', 10);
        expect(darkened).toMatch(/^rgb\(\d{1,3}, \d{1,3}, \d{1,3}\)$/);
    });

    test('available color schemes expose metadata', () => {
        const schemes = window.getAvailableColorSchemes();
        expect(Array.isArray(schemes)).toBe(true);
        expect(schemes.map((scheme) => scheme.name)).toEqual(['light', 'dark', 'custom']);
    });

    test('entity helper functions validate and label types', () => {
        expect(window.isValidEntityType('trade')).toBe(true);
        expect(window.isValidEntityType('nonexistent')).toBe(false);
        expect(window.getEntityLabel('trade')).toBe('טרייד');
        expect(window.getEntityLabel('custom_entity')).toBe('custom_entity');
    });

    test('investment and numeric variant helpers return expected values', () => {
        expect(window.getInvestmentTypeBackgroundColor('swing')).toBe(window.INVESTMENT_TYPE_COLORS.swing.light);
        expect(window.getInvestmentTypeTextColor('swing')).toBe(window.INVESTMENT_TYPE_COLORS.swing.medium);
        expect(window.getInvestmentTypeBorderColor('swing')).toBe(window.INVESTMENT_TYPE_COLORS.swing.border);
        expect(window.getInvestmentTypeColor('unknown', 'medium')).toBe(window.INVESTMENT_TYPE_COLORS.swing.medium);

        expect(window.getNumericValueColor(5, 'border')).toBe(window.NUMERIC_VALUE_COLORS.positive.border);
        expect(window.getNumericValueBackgroundColor(5)).toBe(window.NUMERIC_VALUE_COLORS.positive.light);
        expect(window.getNumericValueTextColor(-3)).toBe(window.NUMERIC_VALUE_COLORS.negative.medium);
        expect(window.getNumericValueBorderColor(0)).toBe(window.NUMERIC_VALUE_COLORS.zero.border);
        expect(window.colorSchemeSystem.isZeroValue(0)).toBe(true);
        expect(window.colorSchemeSystem.getValueType(-1)).toBe('negative');
    });

    test('applyColorScheme handles custom scheme overrides', () => {
        setPropertyMock.mockClear();

        window.applyColorScheme('custom', { primary: '#123456', accent: '#abcdef' });

        expect(document.body.classList.contains('custom-scheme')).toBe(true);
        expect(setPropertyMock).toHaveBeenCalledWith('--custom-primary', '#123456');
        expect(setPropertyMock).toHaveBeenCalledWith('--custom-accent', '#abcdef');
    });

    test('setCurrentEntityColorForEntity loads preferences and updates CSS variables', async () => {
        const preferences = {
            colorScheme: {
                entities: { trade: '#556677' }
            }
        };
        window.loadUserPreferences = jest.fn().mockResolvedValue(true);
        window.currentPreferences = preferences;
        const headersSpy = jest.spyOn(window, 'applyEntityColorsToHeaders');

        window.ENTITY_COLORS.trade = '#556677';
        await window.setCurrentEntityColorForEntity('trade');

        expect(window.loadUserPreferences).toHaveBeenCalled();
        expect(setPropertyMock).toHaveBeenCalledWith('--current-entity-color', '#556677');
        expect(headersSpy).toHaveBeenCalledWith('trade', true);
        headersSpy.mockRestore();
    });

    test('setCurrentEntityColorForEntity warns on invalid entity type', async () => {
        window.Logger.warn.mockClear();

        await window.setCurrentEntityColorForEntity('invalid-entity');

        expect(window.Logger.warn).toHaveBeenCalledWith(
            expect.stringContaining('invalid entity type'),
            expect.objectContaining({ entityType: 'invalid-entity', page: 'color-scheme' })
        );
    });

    test('setCurrentEntityColorForEntity logs error when applying colors fails', async () => {
        const failure = new Error('set property fail');
        setPropertyMock.mockImplementation(() => {
            throw failure;
        });
        const preferences = {
            colorScheme: {
                entities: { trade: '#556677' }
            }
        };
        window.loadUserPreferences = jest.fn().mockResolvedValue(true);
        window.currentPreferences = preferences;
        window.Logger.error.mockClear();

        await window.setCurrentEntityColorForEntity('trade');

        expect(window.Logger.error).toHaveBeenCalledWith(
            expect.stringContaining('setCurrentEntityColorForEntity failed'),
            expect.objectContaining({ error: failure, entityType: 'trade', page: 'color-scheme' })
        );

        setPropertyMock.mockImplementation(() => undefined);
        delete window.loadUserPreferences;
        delete window.currentPreferences;
    });

    test('setCurrentEntityColorFromPage applies mapping based on body class', async () => {
        window.currentPreferences = {
            entityAlertColor: '#aa0000',
            entityAlertColorLight: '#bb0000',
            entityAlertColorDark: '#cc0000',
            colorScheme: { entities: { alert: '#aa0000' } }
        };
        window.loadUserPreferences = jest.fn().mockResolvedValue(true);
        const headersSpy = jest.spyOn(window, 'applyEntityColorsToHeaders').mockImplementation(() => {});

        document.body.className = 'alerts-page some-other-class';
        await window.setCurrentEntityColorFromPage();

        expect(window.loadUserPreferences).toHaveBeenCalled();
        expect(setPropertyMock).toHaveBeenCalledWith('--current-entity-color', '#aa0000');
        expect(headersSpy).toHaveBeenCalledWith('alert');
        headersSpy.mockRestore();
    });

    test('getEntityColorFromPreferences warns on invalid entity type', async () => {
        await window.getEntityColorFromPreferences('invalid-entity');
        expect(window.Logger.warn).toHaveBeenCalledWith(expect.stringContaining('Invalid entity type'), expect.objectContaining({ page: 'color-scheme' }));
    });

    test('getEntityColorFromPreferences logs error when updating colors fails', async () => {
        const failure = new Error('prefs failed');
        window.loadUserPreferences = jest.fn().mockResolvedValue(true);
        window.currentPreferences = {
            get colorScheme() {
                throw failure;
            }
        };
        window.Logger.error.mockClear();

        await window.getEntityColorFromPreferences('trade');

        expect(window.Logger.error).toHaveBeenCalledWith(
            expect.stringContaining('Error getting entity color from preferences'),
            failure,
            expect.objectContaining({ page: 'color-scheme' })
        );
        delete window.loadUserPreferences;
        delete window.currentPreferences;
    });

    test('updateCSSVariablesFromPreferences logs error when CSS writes fail', () => {
        const error = new Error('css fail');
        setPropertyMock.mockImplementation(() => {
            throw error;
        });
        window.Logger.error.mockClear();

        window.updateCSSVariablesFromPreferences({ successColor: '#ffffff' });

        expect(window.Logger.error).toHaveBeenCalledWith(
            expect.stringContaining('Error updating CSS variables'),
            error,
            expect.objectContaining({ page: 'color-scheme' })
        );
    });

    test('updateCSSVariablesFromPreferences warns when variant computation fails', () => {
        const originalExec = RegExp.prototype.exec;
        const failure = new Error('regex fail');
        RegExp.prototype.exec = function(value) {
            if (value === '#badbad') {
                throw failure;
            }
            return originalExec.call(this, value);
        };

        window.Logger.warn.mockClear();
        try {
            window.updateCSSVariablesFromPreferences({ successColor: '#badbad' });
        } finally {
            RegExp.prototype.exec = originalExec;
        }

        expect(window.Logger.warn).toHaveBeenCalledWith(
            expect.stringContaining('Failed to compute color variant'),
            expect.objectContaining({ base: '#badbad' }),
            expect.objectContaining({ page: 'color-scheme' })
        );
    });

    test('updateCSSVariablesFromPreferences skips theme colors when color invalid', () => {
        setPropertyMock.mockClear();
        window.updateCSSVariablesFromPreferences({ warningColor: 123 });
        expect(setPropertyMock).not.toHaveBeenCalledWith('--color-warning', expect.anything());
    });

    test('applyNumericPalette handles missing medium tokens', () => {
        setPropertyMock.mockClear();
        window.updateCSSVariablesFromPreferences({
            colorScheme: {
                numericValues: {
                    positive: {},
                    negative: {},
                    zero: {}
                }
            },
            valuePositiveColor: null,
            valueNegativeColor: null,
            valueNeutralColor: null
        });

        expect(setPropertyMock).not.toHaveBeenCalledWith('--numeric-positive-medium', expect.anything());
    });

    test('getAllEntityColorVariantsFromPreferences returns stored variants', async () => {
        window.loadUserPreferences = jest.fn().mockResolvedValue(true);
        window.currentPreferences = {
            colorScheme: { entities: { trade: { medium: '#111111', light: '#222222' } } }
        };

        const variants = await window.getAllEntityColorVariantsFromPreferences('trade');

        expect(window.loadUserPreferences).toHaveBeenCalled();
        expect(variants).toEqual({ medium: '#111111', light: '#222222' });
        delete window.loadUserPreferences;
        delete window.currentPreferences;
    });

    test('getAllEntityColorVariantsFromPreferences logs error when preferences access fails', async () => {
        const failure = new Error('variant load');
        window.loadUserPreferences = jest.fn().mockResolvedValue(true);
        window.currentPreferences = {
            get colorScheme() {
                throw failure;
            }
        };
        window.Logger.error.mockClear();

        const variants = await window.getAllEntityColorVariantsFromPreferences('trade');

        expect(window.Logger.error).toHaveBeenCalledWith(
            expect.stringContaining('Error getting all entity color variants'),
            failure,
            expect.objectContaining({ page: 'color-scheme' })
        );
        expect(variants).toEqual({});
        delete window.loadUserPreferences;
        delete window.currentPreferences;
    });



    test('getEntityColor handles missing Logger gracefully', () => {
        const originalLogger = window.Logger;
        delete window.Logger;
        Object.keys(window.ENTITY_COLORS).forEach((key) => delete window.ENTITY_COLORS[key]);
        const styleSpy = jest.spyOn(window, 'getComputedStyle').mockReturnValue({
            getPropertyValue: () => ''
        });

        expect(window.getEntityColor('missing')).toBe('');

        styleSpy.mockRestore();
        window.Logger = originalLogger;
    });

    test('DOMContentLoaded handler loads preferences when triggered', async () => {
        window.loadUserPreferences = jest.fn().mockResolvedValue(true);
        window.currentPreferences = { successColor: '#999999' };

        document.dispatchEvent(new window.Event('DOMContentLoaded'));
        await Promise.resolve();
        await Promise.resolve();
        await Promise.resolve();

        expect(window.loadUserPreferences).toHaveBeenCalled();
        expect(setPropertyMock).toHaveBeenCalledWith('--color-success', '#999999');
        delete window.loadUserPreferences;
        delete window.currentPreferences;
    });

    test('entity helper functions fall back to CSS variables when map empty', () => {
        const propertyMap = {
            '--entity-custom-color': '#444444',
            '--entity-custom-bg': '#444444',
            '--entity-custom-text': '#444444'
        };
        const styleSpy = jest.spyOn(window, 'getComputedStyle').mockReturnValue({
            getPropertyValue: (variable) => propertyMap[variable] || ''
        });

        Object.keys(window.ENTITY_COLORS).forEach((key) => delete window.ENTITY_COLORS[key]);
        expect(window.getEntityColor('custom')).toBe('#444444');

        Object.keys(window.ENTITY_BACKGROUND_COLORS).forEach((key) => delete window.ENTITY_BACKGROUND_COLORS[key]);
        expect(window.getEntityBackgroundColor('custom')).toBe('#444444');

        Object.keys(window.ENTITY_TEXT_COLORS).forEach((key) => delete window.ENTITY_TEXT_COLORS[key]);
        expect(window.getEntityTextColor('custom')).toBe('#444444');

        styleSpy.mockRestore();
    });

    test('status helper functions compute fallbacks', () => {
        window.STATUS_COLORS.active = 'rgb(10, 20, 30)';
        expect(window.getStatusColor('missing')).toBe('rgb(10, 20, 30)');
        expect(window.getStatusBackgroundColor('active')).toContain('rgba');
        expect(window.getStatusTextColor('active')).toBe('rgb(10, 20, 30)');
        expect(window.getStatusBorderColor('active')).toContain('rgba');
        window.STATUS_COLORS.active = '#28a745';
    });

    test('darkenColor returns original string when hex invalid', () => {
        expect(window.colorSchemeSystem.darkenColor('invalid', 10)).toBe('invalid');
        expect(window.colorSchemeSystem.hexToRgb('invalid')).toBeNull();
    });

    test('updateCSSVariablesFromPreferences propagates invalid theme colors when no rgb conversion', () => {
        setPropertyMock.mockClear();
        window.updateCSSVariablesFromPreferences({ successColor: 'invalid' });
        expect(setPropertyMock).toHaveBeenCalledWith('--color-success-light', 'invalid');
    });

    test('loadColorPreferences falls back to API response', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ data: { successColor: '#aaaaaa' } })
        });

        const prefs = await window.loadColorPreferences();

        expect(global.fetch).toHaveBeenCalledWith('/api/preferences/user');
        expect(prefs.successColor).toBe('#aaaaaa');
    });

    test('loadColorPreferences warns when API request fails', async () => {
        window.loadUserPreferences = undefined;
        global.fetch = jest.fn().mockRejectedValue(new Error('network'));
        window.Logger.warn.mockClear();

        const prefs = await window.loadColorPreferences();

        expect(window.Logger.warn).toHaveBeenCalledWith(
            expect.stringContaining('Could not load preferences from API'),
            expect.objectContaining({ page: 'color-scheme' })
        );
        expect(prefs).toEqual({});
    });

    test('loadColorPreferences logs error when loader throws', async () => {
        const failure = new Error('loader fail');
        window.loadUserPreferences = jest.fn().mockRejectedValue(failure);
        window.Logger.error.mockClear();

        const prefs = await window.loadColorPreferences();

        expect(window.Logger.error).toHaveBeenCalledWith(
            expect.stringContaining('Error loading color preferences'),
            failure,
            expect.objectContaining({ page: 'color-scheme' })
        );
        expect(prefs).toEqual({});
    });

    test('getEntityColor logs warning when value missing', () => {
        window.Logger.warn.mockClear();
        const styleSpy = jest.spyOn(window, 'getComputedStyle').mockReturnValue({
            getPropertyValue: () => ''
        });

        expect(window.getEntityColor('undefined-entity')).toBe('');
        expect(window.Logger.warn).toHaveBeenCalledWith(expect.stringContaining('No color found for entity'), expect.objectContaining({ page: 'color-scheme' }));

        styleSpy.mockRestore();
    });

    test('applyEntityColorsToHeaders emits warning when color unavailable', () => {
        const consoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {});
        const previousColor = window.ENTITY_COLORS.trade;
        window.ENTITY_COLORS.trade = undefined;
        document.body.innerHTML = '<div class="top-section"><div class="section-header" id="mainHeader"></div></div>';

        window.applyEntityColorsToHeaders('trade');

        expect(consoleWarn).toHaveBeenCalledWith(expect.stringContaining('לא נמצא צבע לישות'));

        window.ENTITY_COLORS.trade = previousColor;
        consoleWarn.mockRestore();
    });

    test('updateEntityColors merges entity preferences', () => {
        window.updateEntityColors({
            colorScheme: { entities: { alert: '#123123' } },
            entityTradeColor: '#010203',
            entityTradeColorLight: '#020304',
            entityTradeColorDark: '#030405'
        });

        expect(window.ENTITY_COLORS.trade).toBe('#010203');
        expect(window.ENTITY_BACKGROUND_COLORS.trade).toBe('#020304');
        expect(window.ENTITY_TEXT_COLORS.trade).toBe('#030405');
        expect(window.ENTITY_COLORS.alert).toBe('#123123');
    });

    test('loadEntityColorsFromPreferences applies constraint, development and info overrides', () => {
        window.loadEntityColorsFromPreferences({
            entityConstraintColor: '#111111',
            entityConstraintColorLight: '#121212',
            entityConstraintColorDark: '#131313',
            entityDevelopmentColor: '#141414',
            entityDevelopmentColorLight: '#151515',
            entityDevelopmentColorDark: '#161616',
            entityInfoColor: '#171717',
            entityInfoColorLight: '#181818',
            entityInfoColorDark: '#191919'
        });

        expect(window.ENTITY_COLORS.constraint).toBe('#111111');
        expect(window.ENTITY_DARK_COLORS.constraint).toBe('#131313');
        expect(window.ENTITY_LIGHT_COLORS.development).toBe('#151515');
        expect(window.ENTITY_TEXT_COLORS.development).toBe('#161616');
        expect(window.ENTITY_COLORS.info).toBe('#171717');
        expect(window.ENTITY_DARK_COLORS.info).toBe('#191919');
    });

    test('loadEntityColorsFromPreferences applies research and design overrides', () => {
        window.loadEntityColorsFromPreferences({
            entityResearchColor: '#202020',
            entityResearchColorLight: '#212121',
            entityResearchColorDark: '#222222',
            entityDesignColor: '#303030',
            entityDesignColorLight: '#313131',
            entityDesignColorDark: '#323232'
        });

        expect(window.ENTITY_COLORS.research).toBe('#202020');
        expect(window.ENTITY_DARK_COLORS.research).toBe('#222222');
        expect(window.ENTITY_COLORS.design).toBe('#303030');
        expect(window.ENTITY_LIGHT_COLORS.design).toBe('#313131');
    });

    test('loadEntityColorsFromPreferences applies trade plan and preferences overrides', () => {
        window.loadEntityColorsFromPreferences({
            entityTradePlanColor: '#a1a1a1',
            entityTradePlanColorLight: '#b2b2b2',
            entityTradePlanColorDark: '#c3c3c3',
            entityPreferencesColor: '#d4d4d4',
            entityPreferencesColorLight: '#e5e5e5',
            entityPreferencesColorDark: '#f6f6f6'
        });

        expect(window.ENTITY_COLORS.trade_plan).toBe('#a1a1a1');
        expect(window.ENTITY_DARK_COLORS.trade_plan).toBe('#c3c3c3');
        expect(window.ENTITY_COLORS.preference).toBe('#d4d4d4');
        expect(window.ENTITY_LIGHT_COLORS.preference).toBe('#e5e5e5');
    });

    test('loadEntityColorsFromPreferences applies cash flow and note overrides', () => {
        window.loadEntityColorsFromPreferences({
            entityCashFlowColor: '#010101',
            entityCashFlowColorLight: '#020202',
            entityCashFlowColorDark: '#030303',
            entityNoteColor: '#040404',
            entityNoteColorLight: '#050505',
            entityNoteColorDark: '#060606'
        });

        expect(window.ENTITY_COLORS.cash_flow).toBe('#010101');
        expect(window.ENTITY_DARK_COLORS.cash_flow).toBe('#030303');
        expect(window.ENTITY_COLORS.note).toBe('#040404');
        expect(window.ENTITY_LIGHT_COLORS.note).toBe('#050505');
    });

    test('loadEntityColorsFromPreferences applies trading account, alert and ticker overrides', () => {
        window.loadEntityColorsFromPreferences({
            entityTradingAccountColor: '#111aaa',
            entityTradingAccountColorLight: '#222bbb',
            entityTradingAccountColorDark: '#333ccc',
            entityAlertColor: '#444ddd',
            entityAlertColorLight: '#555eee',
            entityAlertColorDark: '#666fff',
            entityTickerColor: '#777111',
            entityTickerColorLight: '#888222',
            entityTickerColorDark: '#999333'
        });

        expect(window.ENTITY_COLORS.trading_account).toBe('#111aaa');
        expect(window.ENTITY_DARK_COLORS.trading_account).toBe('#333ccc');
        expect(window.ENTITY_COLORS.alert).toBe('#444ddd');
        expect(window.ENTITY_LIGHT_COLORS.alert).toBe('#555eee');
        expect(window.ENTITY_COLORS.ticker).toBe('#777111');
        expect(window.ENTITY_TEXT_COLORS.ticker).toBe('#999333');
    });

    test('updateEntityColors logs errors when assignment fails', () => {
        const originalAssign = Object.assign;
        const failure = new Error('assign fail');
        Object.assign = () => { throw failure; };
        window.Logger.error.mockClear();

        try {
            window.updateEntityColors({ colorScheme: { entities: { test: '#000000' } } });
        } finally {
            Object.assign = originalAssign;
        }

        expect(window.Logger.error).toHaveBeenCalledWith(
            expect.stringContaining('Error updating entity colors'),
            failure,
            expect.objectContaining({ page: 'color-scheme' })
        );
    });

    test('second initialization warns and skips reloading', () => {
        const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        window.VALID_ENTITY_TYPES = ['trade'];

        jest.resetModules();
        const localSetProperty = jest.fn();
        Object.defineProperty(document.documentElement, 'style', {
            configurable: true,
            value: {
                setProperty: localSetProperty,
                getPropertyValue: () => ''
            }
        });
        delete require.cache[scriptPath];
        require(scriptPath);

        expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('color-scheme-system.js'));
        expect(localSetProperty).not.toHaveBeenCalled();

        warnSpy.mockRestore();
    });
});

describe('Color Scheme System - DOM ready branch', () => {
    const scriptPath = path.join(__dirname, '../../trading-ui/scripts/color-scheme-system.js');
    let setPropertyMock;
    let readyStateDescriptor;

    beforeEach(() => {
        jest.resetModules();
        resetColorSchemeGlobals();

        setPropertyMock = jest.fn();
        Object.defineProperty(document.documentElement, 'style', {
            configurable: true,
            value: {
                setProperty: setPropertyMock,
                getPropertyValue: jest.fn().mockReturnValue('')
            }
        });

        window.Logger = { warn: jest.fn(), error: jest.fn(), info: jest.fn() };
        window.loadUserPreferences = jest.fn().mockResolvedValue(true);
        window.currentPreferences = { successColor: '#123456' };

        readyStateDescriptor = Object.getOwnPropertyDescriptor(document, 'readyState');
        Object.defineProperty(document, 'readyState', {
            configurable: true,
            get: () => 'complete'
        });

        delete require.cache[scriptPath];
        require(scriptPath);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        resetColorSchemeGlobals();
        if (readyStateDescriptor) {
            Object.defineProperty(document, 'readyState', readyStateDescriptor);
        }
    });

    test('immediate initialization applies preferences when DOM already complete', async () => {
        await flushPromises();

        expect(window.loadUserPreferences).toHaveBeenCalled();
        expect(setPropertyMock).toHaveBeenCalledWith('--color-success', '#123456');
    });
});