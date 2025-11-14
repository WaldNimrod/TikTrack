/** @jest-environment node */
/* eslint-disable no-undef */

const createLoggerMock = () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
});

const deepMerge = (target, source = {}) => {
  const result = { ...target };
  Object.entries(source).forEach(([key, value]) => {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      typeof target[key] === 'object' &&
      target[key] !== null &&
      !Array.isArray(target[key])
    ) {
      result[key] = deepMerge(target[key], value);
    } else {
      result[key] = value;
    }
  });
  return result;
};

const createBaseWindow = (overrides = {}) => {
  const base = {
    Logger: createLoggerMock(),
    LinkedItemsService: {
      getEntityLabel: jest.fn(type => `Label-${type}`),
      formatLinkedItemName: jest.fn(item => item.description || item.name || ''),
    },
    translateConditionFields: jest.fn(() => 'translated-condition'),
    currentPreferences: { timezone: 'Asia/Jerusalem' },
    PreferencesSystem: { manager: { currentPreferences: { timezone: 'Europe/Paris' } } },
    setUserTimezone: jest.fn(),
    formatDate: jest.fn(value => `formatted-${value}`),
    UnifiedCacheManager: {
      initialized: true,
      get: jest.fn(() => Promise.resolve(null)),
      save: jest.fn(() => Promise.resolve(true)),
      remove: jest.fn(() => Promise.resolve(true)),
    },
    PageStateManager: {
      initialized: true,
      saveSort: jest.fn(() => Promise.resolve(true)),
      loadSort: jest.fn(() => Promise.resolve(null)),
    },
    updateSortIcons: jest.fn(),
    getCurrentPageName: jest.fn(() => 'trades'),
    showWarningNotification: jest.fn(),
    showLoadingState: jest.fn(),
    hideLoadingState: jest.fn(),
    UnifiedTableSystem: {
      registry: {
        isRegistered: jest.fn(() => false),
      },
      sorter: {
        sort: jest.fn(() => Promise.resolve([{ id: 1 }])),
        sortByChain: jest.fn(() => Promise.resolve([{ id: 2 }])),
        applyDefaultSort: jest.fn(() => Promise.resolve([{ id: 3 }])),
      },
    },
    TableSortValueAdapter: undefined,
  };
  return deepMerge(base, overrides);
};

const createBaseDocument = (overrides = {}) => {
  const base = {
    querySelector: jest.fn(() => null),
    querySelectorAll: jest.fn(() => []),
    getElementById: jest.fn(() => null),
    body: {
      classList: { remove: jest.fn() },
      style: {},
    },
  };
  return { ...base, ...overrides };
};

const bootstrapTablesSystem = ({ windowOverrides = {}, documentOverrides = {} } = {}) => {
  jest.resetModules();
  let appWindowRef;
  let appDocumentRef;
  jest.isolateModules(() => {
    const win = createBaseWindow(windowOverrides);
    const doc = createBaseDocument(documentOverrides);
    win.document = doc;
    appWindowRef = win;
    appDocumentRef = doc;
    global.window = win;
    global.document = doc;
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve([]),
    }));
    win.fetch = global.fetch;
    require('../../trading-ui/scripts/services/table-sort-value-adapter.js');
    require('../../trading-ui/scripts/table-mappings.js');
    require('../../trading-ui/scripts/tables.js');
  });
  return { appWindow: appWindowRef, appDocument: appDocumentRef };
};

describe('Table mappings general system', () => {
  afterEach(() => {
    delete global.window;
    delete global.document;
    delete global.fetch;
    jest.useRealTimers();
  });

  test('buildDateEnvelope uses timezone preference and formatter', () => {
    const { appWindow } = bootstrapTablesSystem();
    appWindow.formatDate = jest.fn(value => `formatted-${value}`);
    appWindow.setUserTimezone = jest.fn();
    const envelope = appWindow.tableMappings.buildDateEnvelope('2024-05-05');
    expect(envelope).toMatchObject({
      timezone: 'Asia/Jerusalem',
      display: 'formatted-2024-05-05',
    });
    expect(appWindow.setUserTimezone).toHaveBeenCalledWith('Asia/Jerusalem');
    expect(appWindow.formatDate).toHaveBeenCalled();
  });

  test('getColumnValue handles multiple table-specific cases', () => {
    const { appWindow } = bootstrapTablesSystem();
    appWindow.translateConditionFields = jest.fn(() => 'translated-condition');

    const totalIndex = appWindow.getColumnIndexByKey('position_executions', 'total');
    const totalValue = appWindow.getColumnValue({ quantity: '2', price: '10.5', fee: '1' }, totalIndex, 'position_executions');
    expect(totalValue).toBeCloseTo(22);

    const subTypeIndex = appWindow.getColumnIndexByKey('account_activity', 'subtype');
    const subType = appWindow.getColumnValue({ sub_type: 'deposit' }, subTypeIndex, 'account_activity');
    expect(subType).toBe('deposit');

    const tickerIndex = appWindow.getColumnIndexByKey('account_activity', 'ticker');
    const tickerValue = appWindow.getColumnValue({ ticker_symbol: 'AAA' }, tickerIndex, 'account_activity');
    expect(tickerValue).toBe('AAA');

    const changeIndex = appWindow.getColumnIndexByKey('tickers', 'change_percent');
    const changeValue = appWindow.getColumnValue({ change_percent: '12.5%' }, changeIndex, 'tickers');
    expect(changeValue).toBeCloseTo(12.5);

    const alertConditionIndex = appWindow.getColumnIndexByKey('alerts', 'condition');
    const alertCondition = appWindow.getColumnValue({
      condition_attribute: 'price',
      condition_operator: '>',
      condition_number: 5,
    }, alertConditionIndex, 'alerts');
    expect(alertCondition).toBe('translated-condition');
    expect(appWindow.translateConditionFields).toHaveBeenCalled();

    const tradePlanRatioIndex = appWindow.getColumnIndexByKey('trade_plans', 'ratio');
    const ratioValue = appWindow.getColumnValue({
      planned_amount: 1000,
      target_price: 10,
      stop_price: 8,
      current: 9,
    }, tradePlanRatioIndex, 'trade_plans');
    expect(ratioValue).toBeGreaterThan(0);
  });

  test('getColumnValue covers linked items, account activity, positions, trading accounts and designs branches', () => {
    const { appWindow } = bootstrapTablesSystem();

    const linkedCreatedIndex = appWindow.getColumnIndexByKey('linked_items', 'created_at');
    const linkedValue = appWindow.getColumnValue({ created_at: '2024-01-01T00:00:00Z' }, linkedCreatedIndex, 'linked_items');
    expect(typeof linkedValue).toBe('number');

    const positionsIndex = appWindow.getColumnIndexByKey('positions', 'ticker_symbol');
    const positionValue = appWindow.getColumnValue({ ticker_symbol: 'POS1' }, positionsIndex, 'positions');
    expect(positionValue).toBe('POS1');

    const tradingCashIndex = appWindow.getColumnIndexByKey('trading_accounts', 'cash_balance');
    const cashBalance = appWindow.getColumnValue({ balance: 5000 }, tradingCashIndex, 'trading_accounts');
    expect(cashBalance).toBe(5000);

    const designTickerIndex = appWindow.getColumnIndexByKey('designs', 'ticker');
    const designTicker = appWindow.getColumnValue({ ticker: { symbol: 'DSGN' } }, designTickerIndex, 'designs');
    expect(designTicker).toBe('DSGN');
  });

  test('getColumnValue handles executions, cash flows and tickers numeric parsing', () => {
    const { appWindow } = bootstrapTablesSystem();

    const execTickerIndex = appWindow.getColumnIndexByKey('executions', 'ticker_symbol');
    const executionTicker = appWindow.getColumnValue({ ticker: { symbol: 'EXEC' } }, execTickerIndex, 'executions');
    expect(executionTicker).toBe('EXEC');

    const cashFlowAccountIndex = appWindow.getColumnIndexByKey('cash_flows', 'account_name');
    const cashFlowAccount = appWindow.getColumnValue({ account: { name: 'Main Account' } }, cashFlowAccountIndex, 'cash_flows');
    expect(cashFlowAccount).toBe('Main Account');

    const changePercentIndex = appWindow.getColumnIndexByKey('tickers', 'change_percent');
    const parsedChange = appWindow.getColumnValue({ change_percent: '-7.5%' }, changePercentIndex, 'tickers');
    expect(parsedChange).toBeCloseTo(-7.5);
  });

  test('getColumnDefinition and getTableConfig expose enriched metadata', () => {
    const { appWindow } = bootstrapTablesSystem();
    const definition = appWindow.getColumnDefinition('tickers', 'symbol');
    expect(definition).toMatchObject({ name: 'symbol', sortable: true, sortType: 'string' });

    const config = appWindow.getTableConfig('tickers');
    expect(config.display.showDates).toBe(false);
  });

  test('table metadata helpers expose mapping, support state, and column keys', () => {
    const { appWindow } = bootstrapTablesSystem();
    const mapping = appWindow.getTableMapping('trades');
    expect(Array.isArray(mapping)).toBe(true);
    expect(mapping.length).toBeGreaterThan(0);

    expect(appWindow.isTableSupported('trades')).toBe(true);
    expect(appWindow.isTableSupported('non_existing_table')).toBe(false);

    const keyIndex = appWindow.getColumnIndexByKey('trades', 'ticker_symbol');
    expect(appWindow.getColumnKey('trades', keyIndex)).toBe('ticker_symbol');
    expect(appWindow.getColumnKey('trades', 999)).toBeNull();

    expect(appWindow.getColumnDefinition('unknown_table', 'id')).toBeNull();
  });

  test('getColumnSortType resolves from indexes, names, and falls back to null', () => {
    const { appWindow } = bootstrapTablesSystem();
    const symbolIndex = appWindow.getColumnIndexByKey('tickers', 'symbol');
    expect(appWindow.getColumnSortType('tickers', symbolIndex)).toBe('string');
    expect(appWindow.getColumnSortType('tickers', 'change_percent')).toBe('numeric');
    expect(appWindow.getColumnSortType('tickers', 'unknown_column')).toBeNull();
    expect(appWindow.getColumnSortType('unknown_table', 0)).toBeNull();
  });

  test('getDefaultSortChain falls back to first column when canonical keys missing', () => {
    const { appWindow } = bootstrapTablesSystem();
    const chain = appWindow.getDefaultSortChain('tag_usage_leaderboard');
    expect(chain).toHaveLength(1);
    expect(chain[0]).toMatchObject({ priority: 'fallback', columnIndex: 0 });
  });

  test('compareTableRows sorts linked items using LinkedItemsService labels', () => {
    const { appWindow } = bootstrapTablesSystem();
    appWindow.LinkedItemsService = {
      getEntityLabel: jest.fn(type => `Label-${type}`),
      formatLinkedItemName: jest.fn(item => item.description || ''),
    };
    const columnIndex = 0;
    const rows = [
      { type: 'note', description: 'Beta' },
      { type: 'alert', description: 'Alpha' },
    ];
    rows.sort((a, b) => appWindow.compareTableRows(a, b, 'linked_items', columnIndex, 'asc'));
    expect(rows[0].type).toBe('alert');
    expect(appWindow.LinkedItemsService.getEntityLabel).toHaveBeenCalledWith('alert');
  });

  test('compareTableRows uses custom sort order for ticker status', () => {
    const { appWindow } = bootstrapTablesSystem();
    const statusIndex = appWindow.getColumnIndexByKey('tickers', 'status');
    const rows = [
      { status: 'closed' },
      { status: 'open' },
      { status: 'cancelled' },
    ];
    rows.sort((a, b) => appWindow.compareTableRows(a, b, 'tickers', statusIndex, 'asc'));
    expect(rows[0].status).toBe('open');
    expect(rows[rows.length - 1].status).toBe('cancelled');
  });

  test('sortTableData toggles direction, saves state, and re-enables headers', async () => {
    jest.useFakeTimers();
    const tableElement = {
      querySelectorAll: jest.fn(() => [{ style: { pointerEvents: '' } }]),
    };
    const { appWindow, appDocument } = bootstrapTablesSystem({
      documentOverrides: { querySelector: jest.fn(() => tableElement) },
    });
    appWindow.updateSortIcons = jest.fn();
    appWindow.UnifiedCacheManager.get = jest.fn(() => Promise.resolve({ columnIndex: 0, direction: 'asc' }));
    appWindow.UnifiedCacheManager.save = jest.fn(() => Promise.resolve(true));

    const columnIndex = appWindow.getColumnIndexByKey('trades', 'ticker_symbol');
    const data = [
      { ticker_symbol: 'BBB', updated_at: '2024-01-01T00:00:00Z' },
      { ticker_symbol: 'AAA', updated_at: '2024-01-02T00:00:00Z' },
    ];

    const updateFunction = jest.fn(() => Promise.resolve());
    const sorted = await appWindow.sortTableData(columnIndex, data, 'trades', updateFunction);
    expect(sorted[0].ticker_symbol).toBe('BBB');
    expect(appWindow.updateSortIcons).toHaveBeenCalled();
    expect(appWindow.UnifiedCacheManager.save).toHaveBeenCalled();
    expect(appDocument.querySelector).toHaveBeenCalled();

    jest.runOnlyPendingTimers();
  });

  test('saveSortState logs warning when UnifiedCacheManager missing', async () => {
    const { appWindow } = bootstrapTablesSystem();
    appWindow.Logger.warn = jest.fn();
    appWindow.UnifiedCacheManager = null;
    await appWindow.saveSortState('alerts', 1, 'asc');
    expect(appWindow.Logger.warn).toHaveBeenCalledWith(expect.stringContaining('saveSortState'), expect.objectContaining({ page: 'tables' }));
  });

  test('loadSortState falls back to PageStateManager state', async () => {
    const { appWindow } = bootstrapTablesSystem();
    appWindow.UnifiedCacheManager.get = jest.fn(() => Promise.resolve({ columnIndex: -1 }));
    appWindow.PageStateManager.loadSort = jest.fn(() => Promise.resolve({ columnIndex: 2, direction: 'desc' }));
    const state = await appWindow.loadSortState('tickers');
    expect(state).toMatchObject({ columnIndex: 2, direction: 'desc' });
    expect(appWindow.PageStateManager.loadSort).toHaveBeenCalled();
  });

  test('sortTable uses UnifiedTableSystem when registry reports table registered', async () => {
    const { appWindow } = bootstrapTablesSystem();
    appWindow.UnifiedTableSystem.registry.isRegistered = jest.fn(() => true);
    appWindow.UnifiedTableSystem.sorter = {
      sort: jest.fn(() => Promise.resolve([{ id: 42 }])),
      sortByChain: jest.fn(),
      applyDefaultSort: jest.fn(),
    };
    await appWindow.sortTable('trades', 0);
    expect(appWindow.UnifiedTableSystem.sorter.sort).toHaveBeenCalledWith('trades', 0);
  });

  test('sortTable warns and notifies when table not registered', async () => {
    const { appWindow } = bootstrapTablesSystem();
    appWindow.showWarningNotification = jest.fn();
    await appWindow.sortTable('unknown_table', 0);
    expect(appWindow.showWarningNotification).toHaveBeenCalled();
  });

  test('restoreAnyTableSort falls back to sortTableData when UnifiedTableSystem unavailable', async () => {
    const sortState = { columnIndex: 0, direction: 'asc' };
    const { appWindow } = bootstrapTablesSystem();
    appWindow.UnifiedTableSystem.registry.isRegistered = jest.fn(() => false);
    jest.spyOn(appWindow, 'loadSortState').mockResolvedValue(sortState);
    jest.spyOn(appWindow, 'sortTableData').mockResolvedValue([]);
    await appWindow.restoreAnyTableSort('trades', [{ ticker_symbol: 'AAA' }], jest.fn());
    expect(appWindow.sortTableData).toHaveBeenCalledWith(0, expect.any(Array), 'trades', expect.any(Function), expect.objectContaining({ direction: 'asc' }));
  });

  test('applyDefaultSort uses sortTableData when no saved state', async () => {
    const { appWindow } = bootstrapTablesSystem();
    jest.spyOn(appWindow, 'getSortState').mockResolvedValue({ columnIndex: -1 });
    jest.spyOn(appWindow, 'sortTableData').mockResolvedValue([]);
    await appWindow.applyDefaultSort('trades', [{ ticker_symbol: 'AAA' }], jest.fn());
    expect(appWindow.sortTableData).toHaveBeenCalled();
  });

  describe('Tables infrastructure helpers', () => {
    test('loadTableData handles success and error flows', async () => {
      const { appWindow } = bootstrapTablesSystem();
      const updateFn = jest.fn();
      appWindow.showLoadingState = jest.fn();
      appWindow.hideLoadingState = jest.fn();
      appWindow.showErrorNotification = jest.fn();

      global.fetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        statusText: 'OK',
        json: () => Promise.resolve([{ id: 1 }]),
      });
      const result = await appWindow.loadTableData('trades', updateFn);
      expect(result).toEqual([{ id: 1 }]);
      expect(updateFn).toHaveBeenCalledWith([{ id: 1 }]);
      expect(appWindow.showLoadingState).toHaveBeenCalled();
      expect(appWindow.hideLoadingState).toHaveBeenCalled();

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'FAIL',
        json: () => Promise.resolve([]),
      });
      await expect(appWindow.loadTableData('trades')).rejects.toThrow('HTTP 500: FAIL');
      expect(appWindow.showErrorNotification).toHaveBeenCalled();
    });

    test('refreshTable clears cached data and shows success', async () => {
      const { appWindow } = bootstrapTablesSystem();
      appWindow.tableData = { trades: [{ id: 1 }] };
      appWindow.loadTableData = jest.fn(() => Promise.resolve([{ id: 2 }]));
      appWindow.showSuccessNotification = jest.fn();
      await appWindow.refreshTable('trades', jest.fn());
      expect(appWindow.tableData.trades).toBeUndefined();
      expect(appWindow.showSuccessNotification).toHaveBeenCalled();
      expect(appWindow.loadTableData).toHaveBeenCalledWith('trades', expect.any(Function));
    });

    test('cache helpers interact with UnifiedCacheManager', async () => {
      const { appWindow } = bootstrapTablesSystem();
      const getSpy = jest.spyOn(appWindow.UnifiedCacheManager, 'get').mockResolvedValue(['cached']);
      const saveSpy = jest.spyOn(appWindow.UnifiedCacheManager, 'save').mockResolvedValue(true);

      const cached = await appWindow.loadTableDataFromCache('alerts', { status: 'open' }, () => Promise.resolve([]));
      expect(cached).toEqual(['cached']);
      expect(getSpy).toHaveBeenCalled();

      const saved = await appWindow.saveTableDataToCache('alerts', [{ id: 1 }], { status: 'open' });
      expect(saved).toBe(true);
      expect(saveSpy).toHaveBeenCalled();
    });

    test('TableDataRegistry helpers delegate when registry exists', () => {
      const { appWindow } = bootstrapTablesSystem();
      const registry = {
        setFullData: jest.fn(() => ['full']),
        setFilteredData: jest.fn(() => ['filtered']),
        setPageData: jest.fn(() => ['page']),
        getFullData: jest.fn(() => ['full']),
        getFilteredData: jest.fn(() => ['filtered']),
        getPageData: jest.fn(() => ['page']),
        getCounts: jest.fn(() => ({ total: 1, filtered: 1, page: 1 })),
        getSummary: jest.fn(() => ({ total: 1 })),
        resolveTableType: jest.fn(() => 'resolved'),
      };
      appWindow.TableDataRegistry = registry;

      expect(appWindow.setTableData('alerts', [])).toEqual(['full']);
      expect(appWindow.setFilteredTableData('alerts', [])).toEqual(['filtered']);
      expect(appWindow.setPageTableData('alerts', [])).toEqual(['page']);
      expect(appWindow.getFullTableData('alerts')).toEqual(['full']);
      expect(appWindow.getFilteredTableData('alerts')).toEqual(['filtered']);
      expect(appWindow.getPageTableData('alerts')).toEqual(['page']);
      expect(appWindow.getTableDataCounts('alerts')).toEqual({ total: 1, filtered: 1, page: 1 });
      expect(appWindow.getTableDataSummary('alerts')).toEqual({ total: 1 });
    });

    test('ensureTablePagination reuses existing pagination and creates new instance', () => {
      const { appWindow } = bootstrapTablesSystem();
      appWindow.PaginationSystem = { enabled: true };

      const existing = {
        tableType: null,
        pageSize: 25,
        config: {},
        setPageSize: jest.fn(),
      };
      appWindow.getPagination = jest.fn(() => existing);
      appWindow.createPagination = jest.fn(() => ({ created: true }));

      const reused = appWindow.ensureTablePagination('tbl', { tableType: 'alerts', pageSize: 50 });
      expect(reused).toBe(existing);
      expect(existing.tableType).toBe('alerts');
      expect(existing.setPageSize).toHaveBeenCalledWith(50);

      appWindow.getPagination = jest.fn(() => null);
      const created = appWindow.ensureTablePagination('tbl', { tableType: 'alerts' });
      expect(appWindow.createPagination).toHaveBeenCalled();
      expect(created).toEqual({ created: true });
    });

    test('updateTableWithPagination wires render pipeline', async () => {
      const { appWindow } = bootstrapTablesSystem();
      const render = jest.fn();
      appWindow.TableDataRegistry = {
        setFullData: jest.fn(),
        setFilteredData: jest.fn(),
        setPageData: jest.fn(),
        resolveTableType: jest.fn(() => 'alerts'),
      };
      appWindow.ensureTablePagination = jest.fn((tableId, options) => {
        if (typeof options.onAfterRender === 'function') {
          options.onAfterRender({ pageData: [{ id: 1 }], pagination: { currentPage: 1 } });
        }
        if (typeof options.onFilteredDataChange === 'function') {
          options.onFilteredDataChange({ data: [{ id: 1 }] });
        }
        return {
          config: options,
          setPageSize: jest.fn(),
          setData: jest.fn(),
          getCurrentPageData: jest.fn(() => [{ id: 1 }]),
          getCurrentPageInfo: jest.fn(() => ({ page: 1 })),
          pageSize: options.pageSize || 10,
          totalItems: 1,
          filteredData: [{ id: 1 }],
        };
      });

      await appWindow.updateTableWithPagination({
        tableId: 'alerts-table',
        data: [{ id: 1 }, { id: 2 }],
        render,
        pageSize: 1,
      });
      expect(appWindow.TableDataRegistry.setFullData).toHaveBeenCalled();
      expect(appWindow.ensureTablePagination).toHaveBeenCalledWith('alerts-table', expect.objectContaining({ pageSize: 1 }));
      expect(render).toHaveBeenCalledWith([{ id: 1 }], expect.objectContaining({ pageInfo: expect.any(Object) }));
    });
  });
});


