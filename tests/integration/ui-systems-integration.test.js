/**
 * UI Systems Integration Tests
 * ============================
 * 
 * בדיקות אינטגרציה למערכות הליבה של ה־UI (FieldRenderer, ButtonSystem, UnifiedTableSystem)
 * בהתאם למימושים המעודכנים במערכת הכללית.
 */

const { loadScriptWithDependencies } = require('../utils/test-loader');

describe('UI Systems Integration', () => {
    beforeAll(() => {
        // סביבת DOM מלאה זמינה כבר דרך JSDOM של Jest; נדרש רק להשלים גלובלים ייעודיים
        window.Logger = {
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
                debug: jest.fn()
        };

        window.bootstrap = {
            Tooltip: jest.fn(() => ({ _isEnabled: true, _config: {} }))
        };

        // טעינת המערכות הכלליות מתוך תיקיית הסקריפטים
        eval(loadScriptWithDependencies('scripts/services/field-renderer-service.js'));
        eval(loadScriptWithDependencies('scripts/button-system-init.js'));
        eval(loadScriptWithDependencies('scripts/unified-table-system.js'));
    });
    
    beforeEach(() => {
        jest.clearAllMocks();
        document.body.innerHTML = `
            <div id="button-demo-container"></div>
            <div id="second-container"></div>
            <table id="integration-table">
                <thead>
                    <tr>
                        <th data-sort-index="0" class="sortable-header">Symbol</th>
                        <th data-sort-index="1" class="sortable-header">Status</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
        `;

        if (window.UnifiedTableSystem?.registry?.clear) {
            window.UnifiedTableSystem.registry.clear();
        }
    });

    describe('FieldRendererService + ButtonSystem', () => {
        test('creates consistent action buttons with status badges', () => {
            const badgeHtml = window.FieldRendererService.renderStatus('open', 'trade');
            expect(badgeHtml).toContain('status-badge');
            expect(badgeHtml).toContain('data-status-category="open"');

            const container = document.getElementById('button-demo-container');
            window.ButtonSystem.addButton(
                container,
                'SAVE',
                'window.handleSave()',
                '',
                '',
                'שמור',
                'btn-save-1',
                'normal',
                'save'
            );

            const buttonElement = container.querySelector('button');
            expect(buttonElement).not.toBeNull();
            expect(buttonElement.dataset.buttonType).toBe('SAVE');
            expect(buttonElement.dataset.onclick).toBe('window.handleSave()');
            expect(buttonElement.dataset.buttonProcessed).toBe('true');
            expect(buttonElement.textContent.trim()).toBe('שמור');
        });

        test('processButtons upgrades legacy markup in place', async () => {
            const container = document.getElementById('second-container');
            container.innerHTML = `
                <button data-button-type="EXPORT" data-text="ייצוא" data-variant="small"></button>
            `;

            await window.advancedButtonSystem.processButtons(container);

            const processedButton = container.querySelector('button');
            expect(processedButton).not.toBeNull();
            expect(container.innerHTML).toContain('data-button-processed');
            const expectedIcon = window.BUTTON_ICONS?.EXPORT || '📤';
            expect(processedButton.textContent.trim()).toBe(expectedIcon);
        });
    });
    
    describe('UnifiedTableSystem integration', () => {
        test('renderer delegates to configured updateFunction with FieldRenderer output', () => {
            const dataset = [
                { id: 1, symbol: 'AAPL', status: 'open', price: 150.0 },
                { id: 2, symbol: 'GOOGL', status: 'pending', price: 2800.0 }
            ];

            const updateFn = jest.fn((rows) =>
                rows.map((row) => window.FieldRendererService.renderStatus(row.status, 'trade')).join('')
            );

            window.UnifiedTableSystem.registry.register('integration-table', {
                dataGetter: () => dataset,
                updateFunction: updateFn,
                tableSelector: '#integration-table',
                columns: [
                    { key: 'symbol', label: 'Symbol' },
                    { key: 'status', label: 'Status' }
                ],
                sortable: true
            });

            window.UnifiedTableSystem.renderer.render('integration-table', dataset, { tableType: 'integration-table' });

            expect(updateFn).toHaveBeenCalledTimes(1);
            expect(updateFn.mock.calls[0][0]).toEqual(dataset);
            expect(updateFn.mock.calls[0][1]).toMatchObject({ tableType: 'integration-table' });
        });

        test('sort handler triggers sorter on registered header clicks', () => {
            const dataset = [
                { id: 1, symbol: 'GOOGL', status: 'pending', price: 2800.0 },
                { id: 2, symbol: 'AAPL', status: 'open', price: 150.0 }
            ];

            window.UnifiedTableSystem.registry.register('integration-table', {
                dataGetter: () => dataset,
                updateFunction: jest.fn(),
                tableSelector: '#integration-table',
                columns: [
                    { key: 'symbol', label: 'Symbol', sortable: true },
                    { key: 'status', label: 'Status', sortable: true }
                ],
                sortable: true
            });

            const sortSpy = jest.spyOn(window.UnifiedTableSystem.sorter, 'sort').mockReturnValue(dataset);

            window.UnifiedTableSystem.events.setupSortHandlers('integration-table');

            const header = document.querySelector('th[data-sort-index="0"]');
            header.dispatchEvent(new MouseEvent('click', { bubbles: true }));

            expect(sortSpy).toHaveBeenCalledWith('integration-table', 0);
            sortSpy.mockRestore();
        });

        test('renderTable helper uses unified renderer', () => {
            const data = [
                { id: 1, symbol: 'AAPL', status: 'open', price: 150.0 }
            ];

            const updateFn = jest.fn();
            window.UnifiedTableSystem.registry.register('render-helper-table', {
                dataGetter: () => data,
                updateFunction: updateFn,
                tableSelector: '#integration-table'
            });

            window.renderTable('render-helper-table', data);

            expect(updateFn).toHaveBeenCalledWith(data, expect.any(Object));
        });
    });
});
