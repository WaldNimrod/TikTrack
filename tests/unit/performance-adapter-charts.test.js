/** @jest-environment node */
/* eslint-env jest */
/* global describe, beforeEach, afterEach, test, expect, jest */

describe('Charts PerformanceAdapter', () => {
  let AdapterInstance;
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
      getChartColor: null,
    };

    require('../../trading-ui/scripts/charts/adapters/performance-adapter.js');
    AdapterInstance = global.window.PerformanceAdapter;
    appWindow = global.window;
  };

  beforeEach(() => {
    bootstrap();
  });

  afterEach(() => {
    delete global.window;
    delete global.fetch;
  });

  test('getData fetches and caches performance payloads', async () => {
    const payload = { data: { dates: ['2024-01-01'], values: [5] } };
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(payload),
    });

    const first = await AdapterInstance.getData({ range: 'week' });
    expect(first).toEqual({ dates: ['2024-01-01'], values: [5] });
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const second = await AdapterInstance.getData({ range: 'week' });
    expect(second).toEqual(first);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  test('getData rejects invalid payloads and notifies user', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ data: null }),
    });

    await expect(AdapterInstance.getData()).rejects.toThrow('Invalid performance payload');
    expect(appWindow.showErrorNotification).toHaveBeenCalledWith(expect.stringContaining('טעינת נתוני ביצועים'));
    expect(appWindow.Logger.error).toHaveBeenCalled();
  });

  test('getData surfaces fetch HTTP errors', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    await expect(AdapterInstance.getData()).rejects.toThrow('Failed to load performance data (500)');
    expect(appWindow.showErrorNotification).toHaveBeenCalled();
  });

  test('formatData applies fallback colors when palette unavailable', () => {
    // Ensure helper colors not provided
    appWindow.getChartColor = null;
    const chartConfig = AdapterInstance.formatData({ dates: ['t1'], values: [1] });
    expect(chartConfig.datasets[0].borderColor).toBe('#26baac');
    expect(chartConfig.labels).toEqual(['t1']);
    expect(chartConfig.datasets[0].data).toEqual([1]);
  });
});

