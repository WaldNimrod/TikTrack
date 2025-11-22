const path = require('path');

describe('Button System Demo Core', () => {
    const scriptPath = path.join(__dirname, '../../trading-ui/scripts/button-system-demo-core.js');

    beforeEach(() => {
        jest.resetModules();
        document.body.innerHTML = `
            <div>
                <table>
                    <tbody id="buttonTableBody"></tbody>
                </table>
            </div>
        `;

        window.BUTTON_TEXTS = {
            EDIT: 'עריכה',
            ADD: 'הוספה',
            SAVE: 'שמור'
        };

        window.BUTTON_ICONS = {
            EDIT: 'fas fa-edit',
            ADD: 'fas fa-plus',
            SAVE: 'fas fa-save'
        };

        window.ENTITY_COLORS = {
            trade: '#26baac'
        };

        window.ENTITY_BACKGROUND_COLORS = {
            trade: '#e6f7f4'
        };

        window.ENTITY_TEXT_COLORS = {
            trade: '#1a8f83'
        };

        window.ENTITY_BORDER_COLORS = {
            trade: '#1a8f83'
        };

        window.STATUS_COLORS = {
            active: '#26baac',
            error: '#fc5a06'
        };

        window.INVESTMENT_TYPE_COLORS = {
            swing: {
                medium: '#26baac',
                light: '#e6f7f4',
                border: '#1a8f83'
            }
        };

        window.NUMERIC_VALUE_COLORS = {
            positive: {
                medium: '#26baac',
                light: '#e6f7f4',
                border: '#1a8f83'
            },
            negative: {
                medium: '#fc5a06',
                light: '#fee0d0',
                border: '#c44700'
            },
            zero: {
                medium: '#6c757d',
                light: '#e2e3e5',
                border: '#6c757d'
            }
        };

        window.getEntityLabel = jest.fn((entity) => entity.toUpperCase());
        window.copyToClipboard = jest.fn();
        window.showInfoNotification = jest.fn();
        window.Logger.info = jest.fn();

        window.advancedButtonSystem = {
            constructor: { ENTITY_VARIANT_BUTTONS: ['CLOSE', 'ADD', 'LINK', 'SAVE'] },
            processButtons: jest.fn()
        };

        const cssVariableMap = {
            '--color-action-edit': '#26baac',
            '--color-action-save': '#26baac',
            '--color-action-add': '#fc5a06',
            '--primary-color': '#26baac',
            '--primary-color-light': '#6ed8ca',
            '--primary-color-dark': '#1a8f83',
            '--primary-color-border': '#1a8f83',
            '--color-success': '#26baac',
            '--color-success-light': '#6ed8ca',
            '--color-success-dark': '#1a8f83',
            '--color-success-border': '#1a8f83'
        };

        jest.spyOn(window, 'getComputedStyle').mockImplementation(() => ({
            getPropertyValue: (variable) => cssVariableMap[variable] || ''
        }));

        delete require.cache[scriptPath];
        require(scriptPath);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete window.ButtonSystemDemo;
        delete window.DesignGallery;
    });

    test('registers ButtonSystemDemo with button catalog', () => {
        expect(window.ButtonSystemDemo).toBeDefined();
        const editButton = window.ButtonSystemDemo.getButton('EDIT');
        expect(editButton).toBeDefined();
        expect(editButton.type).toBe('EDIT');
        expect(editButton.modernHtml).toContain('data-button-type="EDIT"');
    });

    test('handleButtonClick uses notification channel', () => {
        window.ButtonSystemDemo.handleButtonClick('ADD');
        expect(window.showInfoNotification).toHaveBeenCalled();
        expect(window.Logger.info).not.toHaveBeenCalled(); // notification path preferred
    });

    test('actions color tokens expose CSS variable mapping', () => {
        const tokens = window.DesignGallery.getColorTokens('actions');
        const editToken = tokens.find((token) => token.identifier === '--color-action-edit');
        expect(editToken).toBeDefined();
        expect(editToken.value).toBe('#26baac');
        expect(editToken.groupLabel).toBe('כפתורים');
    });

    test('brand color tokens reflect computed CSS values', () => {
        const tokens = window.DesignGallery.getColorTokens('brand');
        expect(tokens.length).toBeGreaterThan(0);
        const primaryToken = tokens.find((token) => token.identifier === '--primary-color');
        expect(primaryToken).toBeDefined();
        expect(primaryToken.value).toBe('#26baac');
    });

    test('entity color tokens mirror entity palette', () => {
        const tokens = window.DesignGallery.getColorTokens('entities');
        const tradeToken = tokens.find((token) => token.name === 'TRADE');
        expect(tradeToken).toBeDefined();
        expect(tradeToken.details.length).toBeGreaterThan(0);
    });

    test('copyColorValue delegates to clipboard utility', () => {
        window.DesignGallery.copyColorValue('--color-success', '#26baac', 'value');
        expect(window.copyToClipboard).toHaveBeenCalledWith('#26baac');
    });

    test('DesignGallery exposes persisted filters', () => {
        const filters = window.DesignGallery.getFilters();
        expect(filters).toEqual({
            buttonCategory: 'all',
            colorGroup: 'brand'
        });
    });
});
