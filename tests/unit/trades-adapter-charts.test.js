/** @jest-environment node */
/* eslint-env jest */
/* global describe, beforeEach, afterEach, test, expect, jest */

describe('Charts TradesAdapter', () => {
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
      getChartColorPalette: jest.fn(() => [
        '#26baac',
        '#28a745',
        '#ffc107',
        '#dc3545',
        '#17a2b8',
        '#6c757d',
      ]),
      getChartColorWithOpacity: jest.fn(() => 'rgba(0,0,0,0.2)'),
    };

    require('../../trading-ui/scripts/charts/adapters/trades-adapter.js');
    AdapterClass = global.window.TradesAdapter;
    appWindow = global.window;
  };

  beforeEach(() => {
    bootstrap();
  });

  afterEach(() => {
    delete global.window;
    delete global.fetch;
  });

  test('getData caches successful responses', async () => {
    const adapter = new AdapterClass();
    const payload = { data: [{ status: 'open' }] };
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    });

    const first = await adapter.getData({ status: 'open' });
    expect(first).toEqual(payload);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const second = await adapter.getData({ status: 'open' });
    expect(second).toEqual(payload);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('getData propagates fetch failures and notifies user', async () => {
    const adapter = new AdapterClass();
    const networkError = new Error('network-down');
    global.fetch.mockRejectedValue(networkError);

    await expect(adapter.getData()).rejects.toThrow('network-down');
    expect(appWindow.showErrorNotification).toHaveBeenCalledWith(expect.stringContaining('טעינת נתוני הטריידים'));
    expect(appWindow.Logger.error).toHaveBeenCalled();
  });

  test('getData rejects invalid payloads', async () => {
    const adapter = new AdapterClass();
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(null),
    });

    await expect(adapter.getData()).rejects.toThrow('Invalid trades payload');
    expect(appWindow.showErrorNotification).toHaveBeenCalled();
  });

  test('formatters aggregate data correctly', () => {
    const adapter = new AdapterClass();
    const rawData = {
      data: [
        { status: 'open', account_name: 'Main', created_at: '2024-01-15', total_pl: 100 },
        { status: 'closed', account_name: 'Main', created_at: '2024-02-20', total_pl: -20 },
        { status: 'open', account_name: null, account_id: 3, created_at: 'invalid', total_pl: 5 },
      ],
    };

    const statusChart = adapter.formatDataForStatusChart(rawData);
    expect(statusChart.labels).toEqual(expect.arrayContaining(['open', 'closed']));
    expect(statusChart.datasets[0].data.reduce((sum, value) => sum + value, 0)).toBe(3);

    const accountChart = adapter.formatDataForAccountChart(rawData);
    expect(accountChart.labels.length).toBe(2);

    const performanceChart = adapter.formatDataForPerformanceChart(rawData);
    expect(performanceChart.labels.length).toBe(2);

    const summary = adapter.getSummaryStats(rawData);
    expect(summary.totalTrades).toBe(3);
    expect(summary.openTrades).toBe(2);
    expect(summary.closedTrades).toBe(1);
  });

  test('uses fallback colors when color helpers unavailable', () => {
    delete appWindow.getChartColorPalette;
    delete appWindow.getChartColorWithOpacity;
    const adapter = new AdapterClass();
    const rawData = {
      data: [
        { status: 'open', created_at: '2024-03-01', total_pl: 20 },
        { status: 'closed', created_at: '2024-04-01', total_pl: -5 },
      ],
    };
    const statusChart = adapter.formatDataForStatusChart(rawData);
    expect(statusChart.datasets[0].backgroundColor[0]).toBe('#28a745');

    const performanceChart = adapter.formatDataForPerformanceChart(rawData);
    expect(performanceChart.datasets[0].backgroundColor).toBe('rgba(38, 186, 172, 0.2)');
  });

  test('formatters handle invalid payloads gracefully', () => {
    const adapter = new AdapterClass();
    expect(adapter.formatDataForStatusChart({ data: null })).toEqual({ labels: [], datasets: [] });
    expect(adapter.formatDataForAccountChart({})).toEqual({ labels: [], datasets: [] });
    expect(adapter.formatDataForPerformanceChart({ data: null })).toEqual({ labels: [], datasets: [] });
  });

  test('formatData routes by chart type and defaults to status', () => {
    const adapter = new AdapterClass();
    const payload = { data: [{ status: 'open', account_name: 'A', created_at: '2024-01-01', total_pl: 1 }] };
    expect(adapter.formatData(payload, 'status').datasets[0].label).toContain('סטטוס');
    expect(adapter.formatData(payload, 'account').datasets[0].label).toContain('חשבון');
    expect(adapter.formatData(payload, 'performance').datasets[0].label).toContain('רווח/הפסד');
    expect(adapter.formatData(payload, 'unknown').datasets[0].label).toContain('סטטוס');
  });

  test('getSummaryStats handles missing collections via helper', () => {
    const adapter = new AdapterClass();
    expect(adapter.getSummaryStats({})).toEqual({
      totalTrades: 0,
      openTrades: 0,
      closedTrades: 0,
      cancelledTrades: 0,
      totalPL: 0,
      averagePL: 0,
    });

    const summary = adapter.getSummaryStats({ trades: [{ status: 'open', total_pl: 5 }] });
    expect(summary.totalTrades).toBe(1);
    expect(summary.totalPL).toBe(5);
  });

  test('getData propagates HTTP errors with notifications', async () => {
    const adapter = new AdapterClass();
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Server Error',
    });

    await expect(adapter.getData()).rejects.toThrow('HTTP error! status: 500');
    expect(appWindow.showErrorNotification).toHaveBeenCalled();
  });
});

