const { setupTestEnvironment, setupBasicMocks, loadScriptWithDependencies } = require('../utils/test-loader');

describe('Fallback Handling Integrity', () => {
  describe('TradesAdapter', () => {
    let originalFetch;

    beforeEach(() => {
      jest.resetModules();
      jest.clearAllMocks();
      originalFetch = global.fetch;
      setupTestEnvironment({
        scriptPath: 'scripts/trades-adapter.js',
        mocks: {
          document: {
            readyState: 'complete',
            addEventListener: jest.fn(),
          },
        },
      });
    });

    afterEach(() => {
      global.fetch = originalFetch;
      delete global.window.TradesAdapter;
    });

    it('throws and avoids caching when API request fails', async () => {
      const adapter = new global.window.TradesAdapter();
      const networkError = new Error('Network down');
      global.fetch = jest.fn().mockRejectedValue(networkError);

      await expect(adapter.getData()).rejects.toThrow('Network down');
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(adapter.cache.size).toBe(0);
    });

    it('propagates HTTP errors from fetchTradesData', async () => {
      const adapter = new global.window.TradesAdapter();
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503, statusText: 'Service Unavailable' });

      await expect(adapter.fetchTradesData({})).rejects.toThrow('HTTP 503');
      expect(adapter.cache.size).toBe(0);
    });
  });

  describe('ConstraintsMonitor', () => {
    let originalFetch;

    beforeEach(() => {
      jest.resetModules();
      jest.clearAllMocks();
      setupBasicMocks();
      originalFetch = global.fetch;
      global.window.showNotification = jest.fn();
      const code = loadScriptWithDependencies('scripts/constraints.js');
      eval(code);
      global.window.showNotification = jest.fn();
    });

    afterEach(() => {
      global.fetch = originalFetch;
      delete global.ConstraintsMonitor;
      delete global.window.initializeConstraints;
      jest.restoreAllMocks();
    });

    const flushAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

    it('notifies user when constraints endpoint fails', async () => {
      global.fetch = jest.fn().mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Server Error' });

      global.window.initializeConstraints();
      await flushAsync();

      expect(global.window.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('שגיאה בטעינת נתוני האילוצים'),
        'error'
      );
    });

    it('notifies user when tables endpoint fails after constraints success', async () => {
      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ status: 'success', data: [] }),
        })
        .mockResolvedValueOnce({ ok: false, status: 502, statusText: 'Bad Gateway' });

      global.window.initializeConstraints();
      await flushAsync();
      await flushAsync();

      expect(global.window.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('שגיאה בטעינת נתוני האילוצים'),
        'error'
      );
    });
  });

  describe('Ticker currency options', () => {
    beforeEach(() => {
      jest.resetModules();
      jest.clearAllMocks();
      setupBasicMocks();
      global.window.showErrorNotification = jest.fn();
      global.window.Logger = Object.assign(global.window.Logger || {}, {
        warn: jest.fn(),
        info: jest.fn(),
        error: jest.fn(),
        debug: jest.fn(),
      });
      const code = loadScriptWithDependencies('scripts/tickers.js');
      eval(code);
      jest.spyOn(global.window, 'showErrorNotification').mockImplementation(() => {});
      jest.spyOn(global.window.Logger, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      delete global.window.generateTickerCurrencyOptions;
      delete global.window.showErrorNotification;
      jest.restoreAllMocks();
    });

    it('displays warning when currencies data is unavailable', () => {
      delete global.window.currenciesData;

      const initialCount = global.window.showErrorNotification.mock.calls.length;

      const firstCall = global.window.generateTickerCurrencyOptions();
      expect(firstCall).toContain('נתוני מטבעות לא זמינים');
      const afterFirst = global.window.showErrorNotification.mock.calls.length;
      expect(afterFirst - initialCount).toBe(1);

      const secondCall = global.window.generateTickerCurrencyOptions();
      expect(secondCall).toContain('נתוני מטבעות לא זמינים');
      const afterSecond = global.window.showErrorNotification.mock.calls.length;
      expect(afterSecond - afterFirst).toBe(0);
      expect(global.window.Logger.warn).toHaveBeenCalledWith(
        '⚠️ currencies data not available - currency selects disabled',
        expect.objectContaining({ page: 'tickers' })
      );
    });
  });

  describe('TickerService error handling', () => {
    let originalFetch;

    beforeEach(() => {
      jest.resetModules();
      jest.clearAllMocks();
      setupBasicMocks();
      originalFetch = global.fetch;
      global.window.tickersData = [{ id: 1, active_trades: 0, status: 'closed' }];
      global.window.updateTickersTable = jest.fn();
      global.window.DataCollectionService = { collectFormData: jest.fn(() => ({})) };
      global.window.validateForm = jest.fn(() => true);
      global.window.currentTickerId = 1;
      const code = loadScriptWithDependencies('scripts/ticker-service.js');
      eval(code);
      global.window.showErrorNotification = jest.fn();
    });

    afterEach(() => {
      global.fetch = originalFetch;
      delete global.window.tickerService;
      delete global.window.tickersData;
      delete global.window.updateTickersTable;
      delete global.window.DataCollectionService;
      delete global.window.validateForm;
      jest.restoreAllMocks();
    });

    it('updateTickerActiveTradesStatus logs and notifies on fetch failure', async () => {
      const failure = new Error('offline');
      global.fetch = jest.fn().mockRejectedValue(failure);

      const result = await window.tickerService.updateTickerActiveTradesStatus(7);

      expect(result).toBe(false);
      expect(window.Logger.error).toHaveBeenCalledWith('Error updating ticker active trades status:', failure);
      expect(window.showErrorNotification).toHaveBeenCalledWith('שגיאה בעדכון סטטוס טיקר', failure.message);
    });

    it('updateAllActiveTradesStatuses reports HTTP errors without caching partial data', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });

      const updated = await window.tickerService.updateAllActiveTradesStatuses();

      expect(updated).toBe(0);
      expect(window.Logger.error).toHaveBeenCalledWith(
        'Error updating all tickers active trades status:',
        expect.any(Error)
      );
      expect(window.showErrorNotification).toHaveBeenCalledWith(
        'שגיאה בעדכון סטטוסי טיקרים',
        expect.stringContaining('HTTP error')
      );
    });

    it('updateAllTickerStatuses notifies user when server returns error', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: 'error', error: 'not allowed' })
      });

      const updated = await window.tickerService.updateAllTickerStatuses();

      expect(updated).toBe(0);
      expect(window.Logger.error).toHaveBeenCalledWith(
        'Error updating all ticker statuses:',
        expect.any(Error)
      );
      expect(window.showErrorNotification).toHaveBeenCalledWith(
        'שגיאה בעדכון סטטוסי טיקרים',
        expect.stringContaining('not allowed')
      );
    });
  });

  describe('PerformanceAdapter', () => {
    let originalFetch;

    beforeEach(() => {
      jest.resetModules();
      jest.clearAllMocks();
      originalFetch = global.fetch;
      setupTestEnvironment({ scriptPath: 'scripts/charts/adapters/performance-adapter.js' });
    });

    afterEach(() => {
      global.fetch = originalFetch;
      delete global.window.PerformanceAdapter;
    });

    it('throws when payload structure is invalid', async () => {
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { dates: null, values: null } }),
      });

      const adapter = new global.window.PerformanceAdapter.constructor();

      await expect(adapter.getData()).rejects.toThrow('Invalid performance payload');
      expect(adapter.cache.size).toBe(0);
    });

    it('throws descriptive error when server responds with non-200 status', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 504 });
      const adapter = new global.window.PerformanceAdapter.constructor();

      await expect(adapter.getData()).rejects.toThrow('Failed to load performance data (504)');
      expect(adapter.cache.size).toBe(0);
    });
  });

  describe('SystemManagement fallback banner', () => {
    let originalFetch;
    let mainContent;
    const flushAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

    beforeEach(() => {
      jest.resetModules();
      jest.clearAllMocks();
      setupBasicMocks();
      originalFetch = global.fetch;
      mainContent = {
        firstChild: null,
        insertBefore: jest.fn((node) => {
          mainContent.inserted = node;
        }),
      };
      global.document.createElement = jest.fn(() => ({
        id: '',
        className: '',
        innerHTML: '',
      }));
      global.document.querySelector = jest.fn((selector) => (selector === '.main-content' ? mainContent : null));
      const domElements = {
        primaryDataProvider: { value: '' },
      };
      global.document.getElementById = jest.fn((id) => domElements[id] || null);
      global.showNotification = jest.fn();
    });

    afterEach(() => {
      global.fetch = originalFetch;
      delete global.window.systemManagement;
      jest.restoreAllMocks();
    });

    it('renders critical error banner when system overview fails', async () => {
      const code = loadScriptWithDependencies('scripts/system-management.js');
      eval(`${code}; globalThis.__SystemManagementClass = typeof SystemManagement !== 'undefined' ? SystemManagement : null;`);
      const SystemManagementClass = global.__SystemManagementClass;
      delete global.__SystemManagementClass;
      if (!SystemManagementClass) {
        throw new Error('SystemManagement class not initialized');
      }
      jest.spyOn(SystemManagementClass, 'showNotification').mockImplementation(() => {});
      const manager = new SystemManagementClass();
      global.window.systemManagement = manager;

      global.fetch = jest
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true, data: { value: 'primary' } }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
          json: () => Promise.resolve({ status: 'error', message: 'Service Unavailable' })
        });

      await manager.loadSystemData();
      await flushAsync();

      expect(SystemManagementClass.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('שגיאה בטעינת נתוני המערכת'),
        'error'
      );

      const banner = mainContent.inserted || (mainContent.insertBefore.mock.calls[0] && mainContent.insertBefore.mock.calls[0][0]);
      expect(mainContent.insertBefore).toHaveBeenCalled();
      expect(banner.className).toContain('alert-danger');
      expect(banner.innerHTML).toContain('נתוני מערכת לא זמינים');
    });

    it('shows error state when primary data provider load fails before overview fetch', async () => {
      const code = loadScriptWithDependencies('scripts/system-management.js');
      eval(`${code}; globalThis.__SystemManagementClass = typeof SystemManagement !== 'undefined' ? SystemManagement : null;`);
      const SystemManagementClass = global.__SystemManagementClass;
      delete global.__SystemManagementClass;
      if (!SystemManagementClass) {
        throw new Error('SystemManagement class not initialized');
      }

      jest.spyOn(SystemManagementClass, 'loadPrimaryDataProvider').mockRejectedValue(new Error('provider fail'));
      jest.spyOn(SystemManagementClass, 'showNotification').mockImplementation(() => {});
      const manager = new SystemManagementClass();
      manager.showErrorState = jest.fn();
      manager.showLoadingState = jest.fn();
      manager.hideLoadingState = jest.fn();
      global.window.systemManagement = manager;
      global.fetch = jest.fn();

      await manager.loadSystemData();
      await flushAsync();

      expect(SystemManagementClass.loadPrimaryDataProvider).toHaveBeenCalled();
      expect(SystemManagementClass.showNotification).toHaveBeenCalledWith(
        expect.stringContaining('שגיאה בטעינת נתוני המערכת'),
        'error'
      );
      expect(manager.showErrorState).toHaveBeenCalledWith(expect.any(Error));
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });
});
