/** @jest-environment node */
/* eslint-env jest */
/* global describe, beforeEach, afterEach, test, expect, jest */

describe('Core TradesAdapter', () => {
  let AdapterClass;
  let appWindow;

  const bootstrap = () => {
    jest.resetModules();
    global.fetch = jest.fn();
    global.window = {
      Logger: {
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      },
      showErrorNotification: jest.fn(),
    };
    global.document = { readyState: 'complete', addEventListener: jest.fn() };
    require('../../trading-ui/scripts/trades-adapter.js');
    AdapterClass = global.window.TradesAdapter;
    appWindow = global.window;
  };

  beforeEach(() => {
    bootstrap();
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
    delete global.fetch;
  });

  test('getData fetches once and caches responses', async () => {
    const adapter = new AdapterClass();
    const payload = { trades: [{ status: 'open' }] };
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    });

    const first = await adapter.getData({ status: 'open' });
    expect(first).toEqual(payload);
    expect(global.fetch).toHaveBeenCalledWith('/api/trades', expect.any(Object));

    const second = await adapter.getData({ status: 'open' });
    expect(second).toEqual(payload);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('getData surfaces HTTP errors and notifies user', async () => {
    const adapter = new AdapterClass();
    global.fetch.mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    });

    await expect(adapter.getData()).rejects.toThrow('HTTP 503: Service Unavailable');
    expect(appWindow.showErrorNotification).toHaveBeenCalledWith('❌ Failed to get trades data');
  });

  test('formatters and helpers reuse palette fallbacks', () => {
    const adapter = new AdapterClass();
    delete appWindow.getChartColorPalette;
    delete appWindow.getChartColorWithOpacity;

    const statusChart = adapter.formatStatusData([{ status: 'open' }]);
    expect(statusChart.datasets[0].data).toEqual([1]);

    const accountChart = adapter.formatAccountData({ totalTrades: 1 });
    expect(accountChart.datasets[0].data[0]).toBe(1);

    const performanceChart = adapter.formatPerformanceData({
      daily: [1, 2],
      weekly: [3],
      monthly: [],
    });
    expect(performanceChart.datasets[0].backgroundColor).toBe('rgba(38, 186, 172, 0.1)');

    const mixedChart = adapter.formatMixedData([{ profit: 5 }], { daily: [1] });
    expect(mixedChart.datasets[1].data[0]).toBe(5);
    expect(adapter.lastNormalizedTradesCount).toBe(1);
  });

  test('formatData bundles all chart payloads together', () => {
    const adapter = new AdapterClass();
    const payload = {
      trades: [{ status: 'open', account_name: 'Main', created_at: '2024-01-01', total_pl: 1 }],
      summary: { totalTrades: 1, openTrades: 1, closedTrades: 0 },
      performance: { daily: [1], weekly: [1], monthly: [1] },
    };
    const result = adapter.formatData(payload);
    expect(result.status.datasets[0].label).toBe('Trades by Status');
    expect(result.account.datasets[0].label).toBe('Account Overview');
    expect(result.performance.datasets[0].label).toBe('Daily Performance');
    expect(result.mixed.datasets[1].label).toBe('Trade Profits');
  });

  test('cache utilities expose state and clearing logic', () => {
    const adapter = new AdapterClass();
    adapter.cache.set('foo', { data: [], timestamp: Date.now() });
    expect(adapter.getStatus()).toMatchObject({ cacheSize: 1, cacheTimeout: adapter.cacheTimeout });
    adapter.clearCache();
    expect(adapter.cache.size).toBe(0);
    expect(appWindow.Logger.info).toHaveBeenCalledWith('🗑️ Trades Adapter cache cleared', expect.any(Object));
  });
});

