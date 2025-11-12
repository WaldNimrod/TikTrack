/**
 * Data Systems Integration Tests
 * ==============================
 * 
 * התאמת בדיקות האינטגרציה למערכות המטמון, הטבלאות והגרפים בעיצוב החדש.
 */

const { loadScriptWithDependencies } = require('../utils/test-loader');

describe('Data Systems Integration', () => {
    beforeAll(() => {
        window.Logger = {
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
                debug: jest.fn()
        };

        // אין לנו IndexedDB בסביבת הטסט – נכריח שימוש בלוקאל סטורג׳/זיכרון
        window.indexedDB = null;
        window.fetch = jest.fn();

        // Stub קל ל‑Chart.js (המערכת דורשת קיום גלובלי)
        window.Chart = jest.fn(() => ({
            data: { labels: [], datasets: [] },
            update: jest.fn(),
            destroy: jest.fn()
        }));

        eval(loadScriptWithDependencies('scripts/unified-cache-manager.js'));
        eval(loadScriptWithDependencies('scripts/unified-table-system.js'));
        eval(loadScriptWithDependencies('scripts/charts/chart-system.js'));
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        window.Chart.mockImplementation(() => ({
            data: { labels: [], datasets: [] },
            update: jest.fn(),
            destroy: jest.fn()
        }));
        document.body.innerHTML = `
            <table id="integration-table">
                <thead>
                    <tr>
                        <th>Symbol</th>
                        <th>Status</th>
                        <th>Price</th>
                    </tr>
                </thead>
                <tbody></tbody>
            </table>
            <div id="chart-container"></div>
        `;

        if (window.UnifiedTableSystem?.registry?.clear) {
            window.UnifiedTableSystem.registry.clear();
        }

        if (window.UnifiedCacheManager) {
            window.UnifiedCacheManager.cache = new Map();
            window.UnifiedCacheManager.stats = {
                operations: { save: 0, get: 0, remove: 0, clear: 0 },
                layers: {
                    memory: { entries: 0, size: 0 },
                    localStorage: { entries: 0, size: 0 },
                    indexedDB: { entries: 0, size: 0 },
                    backend: { entries: 0, size: 0 }
                },
                performance: { avgResponseTime: 0, totalRequests: 0, successfulRequests: 0 }
            };
            await window.UnifiedCacheManager.initialize();
        }

        if (window.ChartSystem) {
            const ChartSystemCtor = window.ChartSystem.constructor;
            window.ChartSystem = new ChartSystemCtor();
            window.createChart = (config) => window.ChartSystem.create(config);
            window.updateChart = (chartId, data) => window.ChartSystem.update(chartId, data);
            window.destroyChart = (chartId) => window.ChartSystem.destroy(chartId);
            window.destroyAllCharts = () => window.ChartSystem.destroyAll();
            window.getChart = (chartId) => window.ChartSystem.getChart(chartId);
            window.getAllCharts = () => window.ChartSystem.getAllCharts();
            window.exportChart = (chartId, format) => window.ChartSystem.export(chartId, format);
        }
    });

    describe('UnifiedCacheManager ↔ UnifiedTableSystem', () => {
        test('renders table from cached dataset', async () => {
            const dataset = [
                { id: 1, symbol: 'AAPL', status: 'open', price: 150 },
                { id: 2, symbol: 'GOOGL', status: 'pending', price: 2800 }
            ];

            await window.UnifiedCacheManager.save('table:designs', dataset, { layer: 'memory' });

            const updateFn = jest.fn();
            window.UnifiedTableSystem.registry.register('designs-table', {
                dataGetter: () => dataset,
                updateFunction: updateFn,
                tableSelector: '#integration-table',
                columns: [
                    { key: 'symbol', label: 'Symbol' },
                    { key: 'status', label: 'Status' },
                    { key: 'price', label: 'Price' }
                ]
            });

            const cached = await window.UnifiedCacheManager.get('table:designs');
            expect(cached).toEqual(dataset);

            window.UnifiedTableSystem.renderer.render('designs-table', cached);
            expect(updateFn).toHaveBeenCalledWith(dataset, expect.any(Object));
        });

        test('fallback fetch saves results back to cache', async () => {
            const freshData = [
                { id: 1, symbol: 'MSFT', status: 'open', price: 330 }
            ];

            const memorySaveSpy = jest.spyOn(window.UnifiedCacheManager.layers.memory, 'save');

            const result = await window.UnifiedCacheManager.get('table:missing', {
                fallback: async () => freshData,
                layer: 'memory'
            });

            expect(result).toMatchObject(freshData);
            expect(memorySaveSpy).toHaveBeenCalledWith('table:missing', expect.anything(), expect.any(Object));
            memorySaveSpy.mockRestore();
        });
    });
    
    describe('UnifiedCacheManager ↔ ChartSystem', () => {
        test('creates chart using adapter that pulls from cache', async () => {
            const chartData = {
                labels: ['Jan', 'Feb'],
                datasets: [{ label: 'Trades', data: [10, 20] }]
            };

            await window.UnifiedCacheManager.save('chart:performance', chartData, { layer: 'memory' });

            window.ChartSystem.registerAdapter('performance-cache', {
                getData: async () => {
                    return await window.UnifiedCacheManager.get('chart:performance', {
                        fallback: async () => chartData
                    });
                },
                formatData: (raw) => raw
            });

            const container = document.querySelector('#chart-container');

            await window.ChartSystem.create({
                id: 'performance-chart',
                type: 'line',
                container: '#chart-container',
                adapter: 'performance-cache'
            });

            expect(window.Chart).toHaveBeenCalledWith(container, expect.objectContaining({
                type: 'line'
            }));

            const chartInstance = window.ChartSystem.getChart('performance-chart');
            expect(chartInstance).not.toBeNull();
        });

        test('updates chart with cached dataset changes', async () => {
            const container = document.querySelector('#chart-container');

            const chartHandle = await window.ChartSystem.create({
                id: 'updates-chart',
                type: 'bar',
                container: '#chart-container',
                data: { labels: ['Old'], datasets: [{ data: [1] }] }
            });
            chartHandle.data = chartHandle.data || { labels: [], datasets: [] };

            await window.UnifiedCacheManager.save('chart:updates', {
                labels: ['Old', 'New'],
                datasets: [{ data: [1, 2] }]
            }, { layer: 'memory' });

            expect(chartHandle).toBeDefined();
            const chartUpdateSpy = chartHandle.update;
            const cachedData = await window.UnifiedCacheManager.get('chart:updates');
            await window.ChartSystem.update('updates-chart', cachedData);

            expect(chartHandle.data.labels).toEqual(cachedData.labels);
            expect(chartHandle.data.datasets).toEqual(cachedData.datasets);
            expect(chartUpdateSpy).toHaveBeenCalled();
        });
    });
    
    describe('Cache synchronization flows', () => {
        test('propagates sync saves across layers', async () => {
            const payload = { id: 10, symbol: 'TSLA', status: 'open' };

            const memorySpy = jest.spyOn(window.UnifiedCacheManager.layers.memory, 'save');
            const localSpy = jest.spyOn(window.UnifiedCacheManager.layers.localStorage, 'save');

            await window.UnifiedCacheManager.save('sync:trade', payload, { layer: 'memory', syncToBackend: false });

            expect(memorySpy).toHaveBeenCalledTimes(1);
            expect(localSpy).not.toHaveBeenCalled(); // לפי המדיניות – רק memory

            memorySpy.mockRestore();
            localSpy.mockRestore();
        });

        test('clears cached data and re-renders table', async () => {
            const dataset = [{ id: 1, symbol: 'NFLX', status: 'closed', price: 400 }];
            await window.UnifiedCacheManager.save('table:designs', dataset, { layer: 'memory' });

            const updateFn = jest.fn();
            window.UnifiedTableSystem.registry.register('designs-table', {
                dataGetter: () => [],
                updateFunction: updateFn,
                tableSelector: '#integration-table'
            });

            await window.UnifiedCacheManager.clearAllCacheQuick({ skipReload: true });
            const cached = await window.UnifiedCacheManager.get('table:designs');

            expect(cached).toBeNull();
            window.UnifiedTableSystem.renderer.render('designs-table', []);
            expect(updateFn).toHaveBeenCalledWith([], expect.any(Object));
        });
    });
    
    describe('Error handling bridges', () => {
        test('logs and recovers when cache layer fails', async () => {
            const originalSave = window.UnifiedCacheManager.layers.memory.save;
            window.UnifiedCacheManager.layers.memory.save = jest.fn().mockRejectedValue(new Error('memory down'));

            const fallbackSpy = jest.spyOn(window.Logger, 'warn');
            const data = await window.UnifiedCacheManager.get('broken-key', {
                fallback: async () => ({ ok: true })
            });

            expect(data).toMatchObject({ ok: true });
            expect(fallbackSpy).toHaveBeenCalled();

            window.UnifiedCacheManager.layers.memory.save = originalSave;
            fallbackSpy.mockRestore();
        });
    });
});
