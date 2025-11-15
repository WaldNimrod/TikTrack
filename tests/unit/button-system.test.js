const path = require('path');

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('Button System Demo Core', () => {
    const scriptPath = path.join(__dirname, '../../trading-ui/scripts/button-system-demo-core.js');

    let originalClipboard;

    beforeEach(() => {
        jest.resetModules();
        document.body.innerHTML = `
            <div>
                <div id="buttonCategoryFilters"></div>
                <input id="buttonFilter" value="">
                <table>
                    <tbody id="buttonTableBody"></tbody>
                </table>
                <div id="buttonTableCount"></div>
                <div id="totalButtons"></div>
                <div id="activeButtons"></div>
                <div id="categoriesCount"></div>
                <div id="lastUpdate"></div>
                <div id="colorGroupFilters"></div>
                <table>
                    <tbody id="colorTokensBody"></tbody>
                </table>
                <div id="colorTokensCount"></div>
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
        window.showWarningNotification = jest.fn();
        window.Logger = window.Logger || {};
        window.Logger.info = jest.fn();
        window.Logger.warn = jest.fn();
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

        window.PageStateManager = { initialized: false };
        originalClipboard = navigator.clipboard;
        delete navigator.clipboard;
        delete require.cache[scriptPath];
        require(scriptPath);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        delete window.ButtonSystemDemo;
        delete window.DesignGallery;
        delete window.PageStateManager;
        delete window.loadDiagnosticsState;
        window.localStorage.clear();
        if (originalClipboard) {
            navigator.clipboard = originalClipboard;
        } else {
            delete navigator.clipboard;
        }
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

    test('loadDesigns renders variants and updates stats via localStorage fallback', async () => {
        window.PageStateManager = undefined;
        window.localStorage.setItem('designs:filters', JSON.stringify({
            filters: { buttonCategory: 'all', colorGroup: 'brand' }
        }));

        await window.loadDesigns();
        await flushPromises();
        await flushPromises();

        const rows = document.querySelectorAll('#buttonTableBody tr');
        expect(rows.length).toBeGreaterThan(0);

        const firstRow = rows[0];
        const variantButtons = firstRow.querySelectorAll('.variant-grid-item button');
        expect(variantButtons.length).toBeGreaterThanOrEqual(3);
        const entityRow = Array.from(rows).find((row) => row.getAttribute('data-type') === 'ADD');
        expect(entityRow?.querySelector('.entity-variant-row button[data-entity-type="trade"]')).toBeTruthy();

        expect(document.getElementById('buttonTableCount').textContent).toContain('מתוך');
        expect(document.getElementById('totalButtons').textContent).not.toEqual('');
        expect(window.DesignGallery.getFilters()).toEqual({ buttonCategory: 'all', colorGroup: 'brand' });
    });

    test('renderColorTables cycles through groups and renders detail lists', async () => {
        await window.loadDesigns();
        await flushPromises();

        ['entities', 'statuses', 'investments', 'numeric'].forEach((groupId) => {
            window.DesignGallery.setColorGroup(groupId);
            const rows = document.querySelectorAll('#colorTokensBody tr');
            expect(rows.length).toBeGreaterThan(0);
        });

        const activeButton = document.querySelector('#colorGroupFilters button[data-filter-id="numeric"]');
        expect(activeButton.classList.contains('active')).toBe(true);
        const hasDetails = Array.from(document.querySelectorAll('#colorTokensBody tr')).some((row) => row.querySelector('ul.color-details-list'));
        expect(hasDetails).toBe(true);
    });

    test('loadDesigns initializes filters via PageStateManager and updates DOM', async () => {
        const loadState = jest.fn().mockResolvedValue({ filters: { buttonCategory: 'navigation', colorGroup: 'actions' } });
        const saveState = jest.fn().mockResolvedValue(undefined);
        window.PageStateManager = {
            initialized: true,
            loadPageState: loadState,
            savePageState: saveState
        };
        window.loadDiagnosticsState = jest.fn();

        await window.loadDesigns();
        await Promise.resolve();
        await Promise.resolve();

        expect(loadState).toHaveBeenCalledWith('designs');
        expect(window.DesignGallery.getFilters()).toEqual({ buttonCategory: 'navigation', colorGroup: 'actions' });
        expect(document.getElementById('buttonTableBody').childElementCount).toBeGreaterThan(0);
        expect(document.getElementById('colorTokensBody').childElementCount).toBeGreaterThan(0);
        expect(document.getElementById('colorTokensCount').textContent).not.toEqual('');
        expect(window.advancedButtonSystem.processButtons).toHaveBeenCalled();
    });

    test('DesignGallery.setButtonCategory persists via PageStateManager and updates stats', async () => {
        const loadState = jest.fn().mockResolvedValue({ filters: { buttonCategory: 'all', colorGroup: 'brand' } });
        const saveState = jest.fn().mockResolvedValue(undefined);
        window.PageStateManager = {
            initialized: true,
            loadPageState: loadState,
            savePageState: saveState
        };

        await window.loadDesigns();
        await Promise.resolve();
        await Promise.resolve();
        saveState.mockClear();
        window.advancedButtonSystem.processButtons.mockClear();

        window.DesignGallery.setButtonCategory('actions');
        await Promise.resolve();
        await Promise.resolve();

        expect(saveState).toHaveBeenCalledWith('designs', expect.objectContaining({
            filters: expect.objectContaining({ buttonCategory: 'actions' })
        }));
        const tbody = document.getElementById('buttonTableBody');
        expect(tbody.childElementCount).toBeGreaterThan(0);
        expect(document.getElementById('activeButtons').textContent).not.toEqual('');
        expect(document.getElementById('buttonTableCount').textContent).toContain('מתוך');
        expect(window.advancedButtonSystem.processButtons).toHaveBeenCalledWith(tbody);
        const activeFilter = document.querySelector('#buttonCategoryFilters button[data-filter-id="actions"]');
        const inactiveFilter = document.querySelector('#buttonCategoryFilters button[data-filter-id="all"]');
        expect(activeFilter.classList.contains('active')).toBe(true);
        expect(inactiveFilter.getAttribute('aria-pressed')).toBe('false');
    });

    test('DesignGallery.setColorGroup stores filters in localStorage when PageStateManager unavailable', () => {
        window.PageStateManager = undefined;
        const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');

        window.DesignGallery.setColorGroup('statuses');

        expect(setItemSpy).toHaveBeenCalledWith('designs:filters', expect.stringContaining('"colorGroup":"statuses"'));
        expect(document.getElementById('colorTokensBody').childElementCount).toBeGreaterThan(0);
    });

    test('persistFiltersState logs warning when localStorage write fails', () => {
        window.PageStateManager = undefined;
        jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            throw new Error('quota exceeded');
        });

        window.DesignGallery.setButtonCategory('navigation');

        expect(window.Logger.warn).toHaveBeenCalledWith('Designs filters: failed to persist in localStorage', expect.objectContaining({ storageError: expect.any(Error) }));
    });

    test('DesignGallery.setColorGroup does not rerender when id unchanged', () => {
        window.advancedButtonSystem.processButtons.mockClear();

        window.DesignGallery.setColorGroup('brand');

        expect(window.advancedButtonSystem.processButtons).not.toHaveBeenCalled();
    });

    test('DesignGallery.copySnippet uses clipboard fallback', () => {
        delete window.copyToClipboard;
        navigator.clipboard = { writeText: jest.fn().mockResolvedValue() };

        window.DesignGallery.copySnippet('EDIT', 'modernHtml');

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('data-button-type="EDIT"'));
    });

    test('DesignGallery.copySnippet warns when snippet missing', () => {
        window.showWarningNotification.mockClear();
        window.DesignGallery.copySnippet('EDIT', 'nonexistent');

        expect(window.showWarningNotification).toHaveBeenCalledWith('אין תוכן להעתיק', 'בחר כפתור אחר');
        expect(window.copyToClipboard).not.toHaveBeenCalled();
    });

    test('DesignGallery.copyColorValue warns on empty payload', () => {
        window.showWarningNotification.mockClear();
        window.DesignGallery.copyColorValue('--token', '', 'value');

        expect(window.showWarningNotification).toHaveBeenCalledWith('אין ערך להעתקה', 'בחר צבע אחר');
    });

    test('DesignGallery.copyColorValue uses clipboard fallback', () => {
        delete window.copyToClipboard;
        navigator.clipboard = { writeText: jest.fn().mockResolvedValue() };

        window.DesignGallery.copyColorValue('--color-success', '#26baac', 'identifier');

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('--color-success');
    });

    test('DesignGallery.copySnippet handles legacy and JS snippets', () => {
        window.copyToClipboard.mockClear();

        window.DesignGallery.copySnippet('EDIT', 'legacyHtml');
        window.DesignGallery.copySnippet('EDIT', 'jsCode');

        expect(window.copyToClipboard).toHaveBeenCalledWith(expect.stringContaining('<button'));
        expect(window.copyToClipboard).toHaveBeenCalledWith(expect.stringContaining(`handleButtonClick('EDIT')`));
    });

    test('DesignGallery.copySnippet ignores unknown button and logs clipboard errors', async () => {
        window.copyToClipboard.mockClear();
        window.Logger.warn.mockClear();

        window.DesignGallery.copySnippet('UNKNOWN', 'modernHtml');
        expect(window.copyToClipboard).not.toHaveBeenCalled();
        expect(window.Logger.warn).not.toHaveBeenCalled();

        delete window.copyToClipboard;
        navigator.clipboard = { writeText: jest.fn().mockRejectedValue(new Error('denied')) };

        window.DesignGallery.copySnippet('EDIT', 'modernHtml');
        await flushPromises();

        expect(navigator.clipboard.writeText).toHaveBeenCalled();
        expect(window.Logger.warn).toHaveBeenCalledWith('Designs copy: clipboard write failed', expect.objectContaining({ error: expect.any(Error) }));
    });

    test('DesignGallery.copyColorValue logs clipboard error path', async () => {
        window.Logger.warn.mockClear();
        delete window.copyToClipboard;
        navigator.clipboard = { writeText: jest.fn().mockRejectedValue(new Error('blocked')) };

        window.DesignGallery.copyColorValue('--color-success', '#26baac', 'value');
        await flushPromises();

        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('#26baac');
        expect(window.Logger.warn).toHaveBeenCalledWith('Designs copy color: clipboard write failed', expect.objectContaining({ error: expect.any(Error) }));
    });

    test('renderButtonTable filters rows by search term', async () => {
        await window.loadDesigns();
        await flushPromises();

        const tbody = document.getElementById('buttonTableBody');
        const initialRows = tbody.childElementCount;
        expect(initialRows).toBeGreaterThan(1);

        document.getElementById('buttonFilter').value = 'שכפול';
        window.loadButtonTable();

        expect(tbody.childElementCount).toBe(1);
        const rowText = tbody.textContent;
        expect(rowText).toContain('כפתור לשכפול רשומות');
    });

    test('ButtonSystemDemo.handleButtonClick uses Logger when notifications unavailable', () => {
        const originalNotifier = window.showInfoNotification;
        window.showInfoNotification = undefined;
        window.Logger.info.mockClear();

        window.ButtonSystemDemo.handleButtonClick('ADD');

        expect(window.Logger.info).toHaveBeenCalledWith('ButtonSystemDemo: demo click', expect.objectContaining({ buttonType: 'ADD' }));
        window.showInfoNotification = originalNotifier || jest.fn();
    });

    test('DesignGallery metadata helpers and color scheme events refresh tables', async () => {
        const metadata = window.DesignGallery.getButtonMetadata('EDIT');
        expect(metadata).toBeTruthy();
        expect(metadata.type).toBe('EDIT');

        const defaultTokens = window.DesignGallery.getColorTokens();
        expect(Array.isArray(defaultTokens)).toBe(true);
        expect(defaultTokens.length).toBeGreaterThan(0);

        window.PageStateManager = { initialized: false };
        document.getElementById('buttonTableBody').innerHTML = '';
        document.getElementById('colorTokensBody').innerHTML = '';

        document.dispatchEvent(new window.Event('DOMContentLoaded'));
        await flushPromises();

        window.dispatchEvent(new window.CustomEvent('colorSchemeChanged'));
        await flushPromises();

        expect(document.getElementById('buttonTableBody').childElementCount).toBeGreaterThan(0);
        expect(document.getElementById('colorTokensBody').childElementCount).toBeGreaterThan(0);
    });
});
