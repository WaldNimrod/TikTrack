const fs = require('fs');
const path = require('path');

const chartSystemCode = fs.readFileSync(
    path.join(__dirname, '../../trading-ui/scripts/charts/chart-system.js'),
    'utf8'
);

describe.skip('Chart System', () => {
    let chartInstance;
    const chartContainer = { getContext: jest.fn(() => ({})) };
    const baseConfig = {
        id: 'chart-test',
        type: 'line',
        container: '#chart-canvas',
        data: {
            labels: ['Jan', 'Feb'],
            datasets: [{ label: 'Trades', data: [10, 20] }]
        },
        options: { responsive: true }
    };

    beforeAll(() => {
        global.window = {
            Logger: {
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn(),
                debug: jest.fn()
            },
            ChartTheme: {
                getChartOptions: jest.fn(() => ({ maintainAspectRatio: false })),
                setTheme: jest.fn()
            }
        };

        global.document = {
            readyState: 'complete',
            addEventListener: jest.fn(),
            querySelector: jest.fn(() => chartContainer)
        };

        global.Chart = jest.fn(() => ({
            data: { labels: [], datasets: [] },
            options: {},
            update: jest.fn(),
            destroy: jest.fn()
        }));
        window.Chart = global.Chart;

        eval(chartSystemCode);
    });

    beforeEach(async () => {
        window.ChartLoader = { load: jest.fn().mockResolvedValue(true) };
        window.ChartTheme = {
            getChartOptions: jest.fn(() => ({ maintainAspectRatio: false })),
            setTheme: jest.fn()
        };
        global.Chart.mockClear();
        global.document.querySelector = jest.fn(() => chartContainer);
        expect(global.document.querySelector('#chart-canvas')).toBe(chartContainer);
        chartInstance = await window.ChartSystem.create({ ...baseConfig });
    });

    afterEach(() => {
        window.ChartSystem.destroyAll();
    });

    test('creates chart instance and stores it internally', () => {
        expect(window.Chart).toHaveBeenCalledTimes(1);
        expect(window.ChartSystem.getChart(baseConfig.id)).toBe(chartInstance);
    });

    test('update refreshes chart data and triggers Chart.update', async () => {
        const chart = window.ChartSystem.getChart(baseConfig.id);
        expect(chart).toBeDefined();

        const newData = {
            labels: ['Mar'],
            datasets: [{ label: 'Trades', data: [30] }]
        };

        await window.ChartSystem.update(baseConfig.id, newData);

        expect(chart.data.labels).toEqual(newData.labels);
        expect(chart.data.datasets).toEqual(newData.datasets);
        expect(chart.update).toHaveBeenCalled();
    });

    test('destroy removes chart from registry and calls destroy', () => {
        const chart = window.ChartSystem.getChart(baseConfig.id);
        expect(chart).toBeDefined();

        window.ChartSystem.destroy(baseConfig.id);

        expect(window.ChartSystem.getChart(baseConfig.id)).toBeNull();
        expect(chart.destroy).toHaveBeenCalled();
    });
});
