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

const addTemporaryColumn = (appWindow, tableType, columnKey, { sortType, definition } = {}) => {
  const mapping = appWindow.tableMappings.TABLE_COLUMN_MAPPINGS[tableType];
  const keys = appWindow.tableMappings.TABLE_COLUMN_KEYS[tableType];
  const sortTypes = appWindow.tableMappings.TABLE_COLUMN_SORT_TYPES?.[tableType];
  const columnDefinition = definition ?? columnKey;
  mapping.push(columnDefinition);
  keys.push(columnKey);
  if (sortTypes && sortType) {
    sortTypes[columnKey] = sortType;
  }
  return () => {
    mapping.pop();
    keys.pop();
    if (sortTypes && sortType) {
      delete sortTypes[columnKey];
    }
  };
};

describe('Table mappings general system', () => {
  afterEach(() => {
    delete global.window;
    delete global.document;
    delete global.fetch;
    delete global.bootstrap;
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

  test('buildDateEnvelope uses currentPreferences timezone even without setter', () => {
    const { appWindow } = bootstrapTablesSystem();
    const originalSetter = appWindow.setUserTimezone;
    delete appWindow.setUserTimezone;
    appWindow.currentPreferences = { timezone: 'Asia/Tokyo' };

    const envelope = appWindow.tableMappings.buildDateEnvelope('2024-05-06');
    expect(envelope.timezone).toBe('Asia/Tokyo');

    appWindow.setUserTimezone = originalSetter;
  });

  test('buildDateEnvelope uses PreferencesSystem fallback and setter when available', () => {
    const { appWindow } = bootstrapTablesSystem();
    delete appWindow.currentPreferences;
    appWindow.PreferencesSystem = {
      manager: { currentPreferences: { timezone: 'Europe/London' } }
    };
    appWindow.setUserTimezone = jest.fn();

    const envelope = appWindow.tableMappings.buildDateEnvelope('2024-05-07');
    expect(envelope.timezone).toBe('Europe/London');
    expect(appWindow.setUserTimezone).toHaveBeenCalledWith('Europe/London');
  });

  test('buildDateEnvelope falls back to Intl timezone when preferences missing', () => {
    const { appWindow } = bootstrapTablesSystem();
    delete appWindow.currentPreferences;
    delete appWindow.PreferencesSystem;
    const originalIntl = global.Intl.DateTimeFormat;
    global.Intl.DateTimeFormat = () => ({
      resolvedOptions: () => ({ timeZone: undefined })
    });
    appWindow.setUserTimezone = jest.fn();

    const envelope = appWindow.tableMappings.buildDateEnvelope(1700000000000);
    expect(envelope.timezone).toBe('UTC');
    expect(appWindow.setUserTimezone).toHaveBeenCalledWith('UTC');

    global.Intl.DateTimeFormat = originalIntl;
  });

  test('buildDateEnvelope returns UTC when timezone resolution throws', () => {
    const { appWindow } = bootstrapTablesSystem();
    delete appWindow.currentPreferences;
    delete appWindow.PreferencesSystem;
    const originalIntl = global.Intl.DateTimeFormat;
    global.Intl.DateTimeFormat = () => { throw new Error('tz failure'); };
    appWindow.setUserTimezone = jest.fn();

    const envelope = appWindow.tableMappings.buildDateEnvelope(1700000000000);
    expect(envelope.timezone).toBe('UTC');
    expect(appWindow.setUserTimezone).not.toHaveBeenCalled();

    global.Intl.DateTimeFormat = originalIntl;
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

  test('getColumnValue covers extended ticker fields and date envelopes', () => {
    const { appWindow } = bootstrapTablesSystem();
    const tickerData = {
      symbol: 'TICK',
      current_price: '123.45₪',
      volume: '1,200',
      currency: { symbol: '₪' },
      status: 'halted',
      type: 'ETF',
      name: 'TikTrack ETF',
      yahoo_updated_at: '2024-05-05T12:00:00Z',
    };
    expect(appWindow.getColumnValue(tickerData, appWindow.getColumnIndexByKey('tickers', 'symbol'), 'tickers')).toBe('TICK');
    expect(appWindow.getColumnValue(tickerData, appWindow.getColumnIndexByKey('tickers', 'current_price'), 'tickers')).toBeCloseTo(123.45);
    expect(appWindow.getColumnValue(tickerData, appWindow.getColumnIndexByKey('tickers', 'volume'), 'tickers')).toBe(1200);
    expect(appWindow.getColumnValue(tickerData, appWindow.getColumnIndexByKey('tickers', 'currency_id'), 'tickers')).toBe('₪');
    expect(appWindow.getColumnValue(tickerData, appWindow.getColumnIndexByKey('tickers', 'status'), 'tickers')).toBe('halted');
    expect(appWindow.getColumnValue(tickerData, appWindow.getColumnIndexByKey('tickers', 'type'), 'tickers')).toBe('ETF');
    expect(appWindow.getColumnValue(tickerData, appWindow.getColumnIndexByKey('tickers', 'name'), 'tickers')).toBe('TikTrack ETF');
    const tickersColumns = appWindow.tableMappings.TABLE_COLUMN_MAPPINGS.tickers;
    const tickersKeys = appWindow.tableMappings.TABLE_COLUMN_KEYS.tickers;
    tickersColumns.push('yahoo_updated_at');
    tickersKeys.push('yahoo_updated_at');
    const yahooIndex = tickersColumns.length - 1;
    const updatedEnvelope = appWindow.getColumnValue(tickerData, yahooIndex, 'tickers');
    tickersColumns.pop();
    tickersKeys.pop();
    expect(updatedEnvelope).toMatchObject({ utc: '2024-05-05T12:00:00.000Z' });
  });

  test('getColumnValue formats notes, alerts and trade plan metrics', () => {
    const { appWindow } = bootstrapTablesSystem();

    const noteIndex = appWindow.getColumnIndexByKey('notes', 'related_object');
    const noteValue = appWindow.getColumnValue({ related_type_id: 12, related_id: 34 }, noteIndex, 'notes');
    expect(noteValue).toBe('12_34');

    const alertStatusIndex = appWindow.getColumnIndexByKey('alerts', 'status');
    const alertStatus = appWindow.getColumnValue({ status: 'closed' }, alertStatusIndex, 'alerts');
    expect(alertStatus).toBe('סגור');

    const alertTriggeredIndex = appWindow.getColumnIndexByKey('alerts', 'is_triggered');
    expect(appWindow.getColumnValue({ is_triggered: 'true' }, alertTriggeredIndex, 'alerts')).toBe('כן');
    expect(appWindow.getColumnValue({ is_triggered: 'new' }, alertTriggeredIndex, 'alerts')).toBe('חדש');

    const alertTickerIndex = appWindow.getColumnIndexByKey('alerts', 'ticker_symbol');
    expect(appWindow.getColumnValue({ ticker: { symbol: 'ALT' } }, alertTickerIndex, 'alerts')).toBe('ALT');

    const tradePlanQuantityIndex = appWindow.getColumnIndexByKey('trade_plans', 'quantity');
    const tradePlanRewardIndex = appWindow.getColumnIndexByKey('trade_plans', 'reward');
    const tradePlanRiskIndex = appWindow.getColumnIndexByKey('trade_plans', 'risk');
    const tradePlanData = { planned_amount: 1000, target_price: 10, stop_price: 8, current: 9 };
    expect(appWindow.getColumnValue(tradePlanData, tradePlanQuantityIndex, 'trade_plans')).toBeCloseTo(100);
    expect(appWindow.getColumnValue(tradePlanData, tradePlanRewardIndex, 'trade_plans')).toBeGreaterThan(0);
    expect(appWindow.getColumnValue(tradePlanData, tradePlanRiskIndex, 'trade_plans')).toBeGreaterThan(0);
  });

  test('getColumnValue handles trades position metrics and trade suggestions envelope fields', () => {
    const { appWindow } = bootstrapTablesSystem();
    const tradeData = {
      ticker: { symbol: 'TRD', current_price: 12, change_percent: 1.5 },
      current_price: 11,
      daily_change: -2,
      position: { quantity: 5, average_price: 10 },
      account: { name: 'Main' },
      closed_at: null,
      cancelled_at: '2024-02-01',
    };
    const qtyIndex = appWindow.getColumnIndexByKey('trades', 'position_quantity');
    expect(appWindow.getColumnValue(tradeData, qtyIndex, 'trades')).toBe(5);
    const plPercentIndex = appWindow.getColumnIndexByKey('trades', 'position_pl_percent');
    expect(appWindow.getColumnValue(tradeData, plPercentIndex, 'trades')).toBeCloseTo((12 - 10) / 10 * 100);
    const plValueIndex = appWindow.getColumnIndexByKey('trades', 'position_pl_value');
    expect(appWindow.getColumnValue(tradeData, plValueIndex, 'trades')).toBeCloseTo((12 - 10) * 5);
    const closedAtIndex = appWindow.getColumnIndexByKey('trades', 'closed_at');
    expect(appWindow.getColumnValue(tradeData, closedAtIndex, 'trades')).toBe('2024-02-01');

    const suggestionData = {
      score: 91,
      execution_date: '2024-04-04T00:00:00Z',
      trade_created_at: '2024-04-03',
      status: 'pending',
      side: 'long',
      investment_type: 'swing',
      match_reasons_text: 'ratio>2',
    };
    const suggestionScoreIndex = appWindow.getColumnIndexByKey('trade_suggestions', 'score');
    expect(appWindow.getColumnValue(suggestionData, suggestionScoreIndex, 'trade_suggestions')).toBe(91);
    const suggestionColumns = appWindow.tableMappings.TABLE_COLUMN_MAPPINGS.trade_suggestions;
    const suggestionKeys = appWindow.tableMappings.TABLE_COLUMN_KEYS.trade_suggestions;
    suggestionColumns.splice(1, 0, 'execution_date');
    suggestionKeys.splice(1, 0, 'execution_date');
    const suggestionExecIndex = suggestionColumns.indexOf('execution_date');
    const execEnvelope = appWindow.getColumnValue(suggestionData, suggestionExecIndex, 'trade_suggestions');
    expect(execEnvelope).toMatchObject({ utc: '2024-04-04T00:00:00.000Z' });
    const suggestionTradeCreatedIndex = appWindow.getColumnIndexByKey('trade_suggestions', 'trade_created_at');
    const createdEnvelope = appWindow.getColumnValue(suggestionData, suggestionTradeCreatedIndex, 'trade_suggestions');
    expect(createdEnvelope).toMatchObject({ utc: expect.any(String) });
    suggestionColumns.splice(suggestionExecIndex, 1);
    suggestionKeys.splice(suggestionExecIndex, 1);
    const suggestionReasonsIndex = appWindow.getColumnIndexByKey('trade_suggestions', 'match_reasons_text');
    expect(appWindow.getColumnValue(suggestionData, suggestionReasonsIndex, 'trade_suggestions')).toBe('ratio>2');
  });


  test('getColumnValue covers simple fallback branches for linked, activity, execution and cash flow tables', () => {
    const { appWindow } = bootstrapTablesSystem();
    const linkedData = {
      linked_to: 42,
      status: 'done',
      side: 'long',
      investment_type: 'swing',
    };
    expect(appWindow.getColumnValue(linkedData, appWindow.getColumnIndexByKey('linked_items', 'linked_to'), 'linked_items')).toBe('42');
    expect(appWindow.getColumnValue(linkedData, appWindow.getColumnIndexByKey('linked_items', 'status'), 'linked_items')).toBe('done');
    expect(appWindow.getColumnValue(linkedData, appWindow.getColumnIndexByKey('linked_items', 'side'), 'linked_items')).toBe('long');
    expect(appWindow.getColumnValue(linkedData, appWindow.getColumnIndexByKey('linked_items', 'investment_type'), 'linked_items')).toBe('swing');

    const activityData = { currency_symbol: '₪' };
    expect(appWindow.getColumnValue(activityData, appWindow.getColumnIndexByKey('account_activity', 'currency'), 'account_activity')).toBe('₪');

    const tradingAccountData = { positions_count: 5 };
    expect(appWindow.getColumnValue(tradingAccountData, appWindow.getColumnIndexByKey('trading_accounts', 'positions_count'), 'trading_accounts')).toBe(5);

    const executionData = { ticker_symbol: 'EXEC123', account_name: 'ACC-1' };
    expect(appWindow.getColumnValue(executionData, appWindow.getColumnIndexByKey('executions', 'ticker_symbol'), 'executions')).toBe('EXEC123');
    expect(appWindow.getColumnValue(executionData, appWindow.getColumnIndexByKey('executions', 'account_name'), 'executions')).toBe('ACC-1');
    expect(appWindow.getColumnValue({ account: { name: 'ACC-NEST' } }, appWindow.getColumnIndexByKey('executions', 'account_name'), 'executions')).toBe('ACC-NEST');

    const cashFlowData = { account_name: 'CashFlowAccount' };
    expect(appWindow.getColumnValue(cashFlowData, appWindow.getColumnIndexByKey('cash_flows', 'account_name'), 'cash_flows')).toBe('CashFlowAccount');

    const positionTotalIndex = appWindow.getColumnIndexByKey('position_executions', 'total');
    expect(appWindow.getColumnValue({ total: 55 }, positionTotalIndex, 'position_executions')).toBe(55);
  });

  test('getColumnValue handles notes, alerts, and ticker currency fallbacks', () => {
    const { appWindow } = bootstrapTablesSystem();
    const noteData = { content: 'Note text', attachment: 'file.pdf', related_type_id: 1, related_id: 2 };
    expect(appWindow.getColumnValue(noteData, appWindow.getColumnIndexByKey('notes', 'content'), 'notes')).toBe('Note text');
    expect(appWindow.getColumnValue(noteData, appWindow.getColumnIndexByKey('notes', 'attachment'), 'notes')).toBe('file.pdf');
    expect(appWindow.getColumnValue(noteData, appWindow.getColumnIndexByKey('notes', 'related_object'), 'notes')).toBe('1_2');

    const alertData = {
      related_type_id: 3,
      related_id: 4,
      status: 'open',
      is_triggered: 'false',
      ticker_symbol: 'ALERT',
      expiry_date: '2025-01-01',
    };
    expect(appWindow.getColumnValue(alertData, appWindow.getColumnIndexByKey('alerts', 'related_object'), 'alerts')).toBe('3_4');
    expect(appWindow.getColumnValue(alertData, appWindow.getColumnIndexByKey('alerts', 'status'), 'alerts')).toBe('פתוח');
    expect(appWindow.getColumnValue(alertData, appWindow.getColumnIndexByKey('alerts', 'is_triggered'), 'alerts')).toBe('לא');
    expect(appWindow.getColumnValue(alertData, appWindow.getColumnIndexByKey('alerts', 'expiry_date'), 'alerts')).toBe('2025-01-01');
    const alertConditionFallback = { condition: 'manual-condition' };
    expect(appWindow.getColumnValue(alertConditionFallback, appWindow.getColumnIndexByKey('alerts', 'condition'), 'alerts')).toBe('manual-condition');
    const cancelledAlert = { status: 'cancelled' };
    expect(appWindow.getColumnValue(cancelledAlert, appWindow.getColumnIndexByKey('alerts', 'status'), 'alerts')).toBe('מבוטל');
    const unknownAlert = { status: 'unknown' };
    expect(appWindow.getColumnValue(unknownAlert, appWindow.getColumnIndexByKey('alerts', 'status'), 'alerts')).toBe('unknown');
    const undefinedTrigger = {};
    expect(appWindow.getColumnValue(undefinedTrigger, appWindow.getColumnIndexByKey('alerts', 'is_triggered'), 'alerts')).toBe('לא מוגדר');

    const tickerCurrencySymbol = { currency: { symbol: '₪' } };
    const tickerCurrencySymbolIndex = appWindow.getColumnIndexByKey('tickers', 'currency_id');
    expect(appWindow.getColumnValue(tickerCurrencySymbol, tickerCurrencySymbolIndex, 'tickers')).toBe('₪');

    const tickerCurrencyCode = { currency_symbol: '', currency_code: 'USD' };
    expect(appWindow.getColumnValue(tickerCurrencyCode, tickerCurrencySymbolIndex, 'tickers')).toBe('USD');

    const tickerCurrencySymbolValue = { currency_symbol: '€' };
    expect(appWindow.getColumnValue(tickerCurrencySymbolValue, tickerCurrencySymbolIndex, 'tickers')).toBe('€');

    const tickerCurrencyIdZero = { currency_id: 0 };
    expect(appWindow.getColumnValue(tickerCurrencyIdZero, tickerCurrencySymbolIndex, 'tickers')).toBe('0');

    const tickerCurrencyIdValue = { currency_id: 12 };
    expect(appWindow.getColumnValue(tickerCurrencyIdValue, tickerCurrencySymbolIndex, 'tickers')).toBe('12');

    const tickerPriceNumber = { current_price: 15.5 };
    expect(appWindow.getColumnValue(tickerPriceNumber, appWindow.getColumnIndexByKey('tickers', 'current_price'), 'tickers')).toBe(15.5);

    const tickerInvalidPrice = { current_price: 'N/A' };
    expect(appWindow.getColumnValue(tickerInvalidPrice, appWindow.getColumnIndexByKey('tickers', 'current_price'), 'tickers')).toBe(0);
    const tickerInvalidVolume = { volume: 'invalid' };
    expect(appWindow.getColumnValue(tickerInvalidVolume, appWindow.getColumnIndexByKey('tickers', 'volume'), 'tickers')).toBe(0);
    const tickerVolumeNumber = { volume: 2500 };
    expect(appWindow.getColumnValue(tickerVolumeNumber, appWindow.getColumnIndexByKey('tickers', 'volume'), 'tickers')).toBe(2500);
  });

  test('getColumnValue default fallback returns direct field values for custom columns', () => {
    const { appWindow } = bootstrapTablesSystem();
    const addTempColumnAndEval = (tableType, fieldKey, data) => {
      const mapping = appWindow.tableMappings.TABLE_COLUMN_MAPPINGS[tableType];
      const keys = appWindow.tableMappings.TABLE_COLUMN_KEYS[tableType];
      mapping.push(fieldKey);
      keys.push(fieldKey);
      const result = appWindow.getColumnValue(data, mapping.length - 1, tableType);
      mapping.pop();
      keys.pop();
      return result;
    };

    expect(addTempColumnAndEval('linked_items', 'custom_linked', { custom_linked: 'LNK' })).toBe('LNK');
    expect(addTempColumnAndEval('account_activity', 'custom_activity', { custom_activity: 'ACT' })).toBe('ACT');
    expect(addTempColumnAndEval('trading_accounts', 'custom_account', { custom_account: 'ACC' })).toBe('ACC');
    expect(addTempColumnAndEval('executions', 'custom_execution', { custom_execution: 'EXEC' })).toBe('EXEC');
    expect(addTempColumnAndEval('cash_flows', 'custom_cash', { custom_cash: 'CASH' })).toBe('CASH');
    expect(addTempColumnAndEval('tickers', 'custom_ticker', { custom_ticker: 'TICK' })).toBe('TICK');
    expect(addTempColumnAndEval('notes', 'custom_note', { custom_note: 'NOTE' })).toBe('NOTE');
    expect(addTempColumnAndEval('alerts', 'custom_alert', { custom_alert: 'ALERT' })).toBe('ALERT');
    expect(addTempColumnAndEval('trades', 'custom_trade', { custom_trade: 'TRADE' })).toBe('TRADE');
    expect(addTempColumnAndEval('trade_plans', 'custom_plan', { custom_plan: 'PLAN' })).toBe('PLAN');
    expect(addTempColumnAndEval('trade_suggestions', 'custom_suggestion', { custom_suggestion: 'SUG' })).toBe('SUG');
    expect(addTempColumnAndEval('position_executions', 'custom_execution_note', { custom_execution_note: 'EXEC_NOTE' })).toBe('EXEC_NOTE');
    expect(appWindow.getColumnValue({ name: 'Design1' }, appWindow.getColumnIndexByKey('designs', 'name'), 'designs')).toBe('Design1');
  });

  test('getColumnValue covers ticker, trade, and alert fallback permutations', () => {
    const { appWindow } = bootstrapTablesSystem();
    const alertTickerIdx = appWindow.getColumnIndexByKey('alerts', 'ticker_symbol');
    expect(appWindow.getColumnValue({ ticker: { symbol: 'ALT-OBJ' } }, alertTickerIdx, 'alerts')).toBe('ALT-OBJ');
    expect(appWindow.getColumnValue({ ticker_symbol: 'ALT-SYM' }, alertTickerIdx, 'alerts')).toBe('ALT-SYM');
    expect(appWindow.getColumnValue({ ticker_id: 'ALT-ID' }, alertTickerIdx, 'alerts')).toBe('ALT-ID');

    const tradeTickerIdx = appWindow.getColumnIndexByKey('trades', 'ticker_symbol');
    expect(appWindow.getColumnValue({ ticker: { symbol: 'TRD-OBJ' } }, tradeTickerIdx, 'trades')).toBe('TRD-OBJ');
    expect(appWindow.getColumnValue({ ticker_symbol: 'TRD-SYM' }, tradeTickerIdx, 'trades')).toBe('TRD-SYM');
    expect(appWindow.getColumnValue({ ticker_id: 'TRD-ID' }, tradeTickerIdx, 'trades')).toBe('TRD-ID');

    const tradeCurrentPriceIdx = appWindow.getColumnIndexByKey('trades', 'current_price');
    expect(appWindow.getColumnValue({ ticker: { current_price: 42 } }, tradeCurrentPriceIdx, 'trades')).toBe(42);
    expect(appWindow.getColumnValue({ current_price: 21 }, tradeCurrentPriceIdx, 'trades')).toBe(21);
    expect(appWindow.getColumnValue({ current_price: null }, tradeCurrentPriceIdx, 'trades')).toBe(0);

    const tradeDailyChangeIdx = appWindow.getColumnIndexByKey('trades', 'daily_change');
    expect(appWindow.getColumnValue({ ticker: { change_percent: 5 } }, tradeDailyChangeIdx, 'trades')).toBe(5);
    expect(appWindow.getColumnValue({ daily_change: -2 }, tradeDailyChangeIdx, 'trades')).toBe(-2);
    expect(appWindow.getColumnValue({}, tradeDailyChangeIdx, 'trades')).toBe(0);

    const positionQtyIdx = appWindow.getColumnIndexByKey('trades', 'position_quantity');
    expect(appWindow.getColumnValue({ position: { quantity: -3 } }, positionQtyIdx, 'trades')).toBe(3);
    expect(appWindow.getColumnValue({}, positionQtyIdx, 'trades')).toBe(0);

    const positionPercentIdx = appWindow.getColumnIndexByKey('trades', 'position_pl_percent');
    expect(appWindow.getColumnValue({
      position: { average_price: 10 },
      ticker: { current_price: 15 },
    }, positionPercentIdx, 'trades')).toBeCloseTo(50);
    expect(appWindow.getColumnValue({ position: { average_price: 0 } }, positionPercentIdx, 'trades')).toBe(0);

    const positionValueIdx = appWindow.getColumnIndexByKey('trades', 'position_pl_value');
    expect(appWindow.getColumnValue({
      position: { quantity: 2, average_price: 5 },
      ticker: { current_price: 7 },
    }, positionValueIdx, 'trades')).toBe(4);
    expect(appWindow.getColumnValue({ position: { quantity: 0 } }, positionValueIdx, 'trades')).toBe(0);

    const alertCheckboxIdx = appWindow.getColumnIndexByKey('trade_suggestions', 'checkbox');
    expect(appWindow.getColumnValue({ checkbox: true }, alertCheckboxIdx, 'trade_suggestions')).toBe('');
    const alertActionsIdx = appWindow.getColumnIndexByKey('trade_suggestions', 'actions');
    expect(appWindow.getColumnValue({ actions: 'ignore' }, alertActionsIdx, 'trade_suggestions')).toBe('');
  });

  test('getColumnValue covers trade suggestions envelope branches', () => {
    const { appWindow } = bootstrapTablesSystem();
    const mapping = appWindow.tableMappings.TABLE_COLUMN_MAPPINGS.trade_suggestions;
    const keys = appWindow.tableMappings.TABLE_COLUMN_KEYS.trade_suggestions;
    mapping.push('execution_date');
    keys.push('execution_date');
    const executionIndex = mapping.length - 1;
    const envelope = { epochMs: 123, utc: '2024-01-01T00:00:00Z' };
    expect(appWindow.getColumnValue({ execution_date: envelope }, executionIndex, 'trade_suggestions')).toBe(envelope);

    const tradeCreatedIndex = appWindow.getColumnIndexByKey('trade_suggestions', 'trade_created_at');
    expect(appWindow.getColumnValue({ trade_created_at: envelope }, tradeCreatedIndex, 'trade_suggestions')).toBe(envelope);

    const tradeIdIndex = appWindow.getColumnIndexByKey('trade_suggestions', 'trade_id');
    expect(appWindow.getColumnValue({ trade_id: 77 }, tradeIdIndex, 'trade_suggestions')).toBe(77);

    const accountNameIndex = appWindow.getColumnIndexByKey('trade_suggestions', 'account_name');
    expect(appWindow.getColumnValue({ account_name: 'ACC' }, accountNameIndex, 'trade_suggestions')).toBe('ACC');
    mapping.pop();
    keys.pop();
  });

  test('buildDateEnvelope respects preference fallbacks and raw values', () => {
    const { appWindow } = bootstrapTablesSystem({
      windowOverrides: {
        currentPreferences: null,
        formatDate: null,
        PreferencesSystem: { manager: { currentPreferences: { timezone: 'Europe/London' } } },
      },
    });
    appWindow.setUserTimezone = jest.fn();
    const rawEnvelope = { epochMs: 123, utc: '2024-05-05T00:00:00Z' };
    expect(appWindow.tableMappings.buildDateEnvelope(rawEnvelope)).toBe(rawEnvelope);

    const numericEnvelope = appWindow.tableMappings.buildDateEnvelope(1700000000000);
    expect(numericEnvelope).toMatchObject({ epochMs: 1700000000000, timezone: 'Europe/London' });
    expect(appWindow.setUserTimezone).toHaveBeenCalledWith('Europe/London');

    const dateEnvelope = appWindow.tableMappings.buildDateEnvelope(new Date('2024-01-02T00:00:00Z'));
    expect(dateEnvelope).toMatchObject({ utc: '2024-01-02T00:00:00.000Z' });

    const stringEnvelope = appWindow.tableMappings.buildDateEnvelope('2024-03-03');
    expect(stringEnvelope).toMatchObject({ utc: '2024-03-03T00:00:00.000Z' });

    expect(appWindow.tableMappings.buildDateEnvelope('', {})).toBeNull();
    expect(appWindow.tableMappings.buildDateEnvelope('not-a-date')).toBeNull();
  });

  test('buildDateEnvelope falls back to Intl timezone and catch branch on formatter failure', () => {
    const originalIntl = global.Intl;
    const { appWindow } = bootstrapTablesSystem({
      windowOverrides: {
        currentPreferences: null,
        PreferencesSystem: null,
        formatDate: jest.fn(() => { throw new Error('format error'); }),
      },
    });
    appWindow.setUserTimezone = jest.fn();
    global.Intl = {
      DateTimeFormat: () => ({
        resolvedOptions: () => ({ timeZone: 'America/New_York' }),
      }),
    };
    const envelope = appWindow.tableMappings.buildDateEnvelope('2024-08-08T00:00:00Z');
    expect(appWindow.setUserTimezone).toHaveBeenCalledWith('America/New_York');
    expect(envelope.display).toBe('2024-08-08');

    global.Intl = {
      DateTimeFormat: () => {
        throw new Error('unsupported');
      },
    };
    const fallbackEnvelope = appWindow.tableMappings.buildDateEnvelope('2024-09-09T00:00:00Z');
    expect(fallbackEnvelope.timezone).toBe('UTC');
    global.Intl = originalIntl;
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

  test('getColumnIndexByKey handles invalid inputs', () => {
    const { appWindow } = bootstrapTablesSystem();
    expect(appWindow.getColumnIndexByKey('trades', null)).toBe(-1);
    expect(appWindow.getColumnIndexByKey('non_existing_table', 'id')).toBe(-1);
  });

  test('getColumnDefinition resolves legacy entries with name only', () => {
    const { appWindow } = bootstrapTablesSystem();
    const mapping = appWindow.tableMappings.TABLE_COLUMN_MAPPINGS.trades;
    const keys = appWindow.tableMappings.TABLE_COLUMN_KEYS.trades;
    mapping.push({ name: 'legacy_field', sortable: true });
    keys.push('legacy_field');
    const definition = appWindow.getColumnDefinition('trades', mapping.length - 1);
    expect(definition).toMatchObject({ name: 'legacy_field', sortable: true });
    mapping.pop();
    keys.pop();
  });

  test('getColumnValue returns empty string when mapping key missing', () => {
    const { appWindow } = bootstrapTablesSystem();
    const mapping = appWindow.tableMappings.TABLE_COLUMN_MAPPINGS.trades;
    const keys = appWindow.tableMappings.TABLE_COLUMN_KEYS.trades;
    mapping.push(null);
    keys.push(null);
    const value = appWindow.getColumnValue({ any: 'value' }, mapping.length - 1, 'trades');
    expect(value).toBe('');
    mapping.pop();
    keys.pop();
  });

  test('normalizeColumnEntry handles objects without key or name', () => {
    const { appWindow } = bootstrapTablesSystem();
    const mapping = appWindow.tableMappings.TABLE_COLUMN_MAPPINGS.trades;
    const invalidEntry = { label: 'legacy-no-key' };
    mapping.push(invalidEntry);
    const definition = appWindow.getColumnDefinition('trades', mapping.length - 1);
    expect(definition).toBeNull();
    mapping.pop();
  });

  test('getColumnSortType resolves from indexes, names, and falls back to null', () => {
    const { appWindow } = bootstrapTablesSystem();
    const symbolIndex = appWindow.getColumnIndexByKey('tickers', 'symbol');
    expect(appWindow.getColumnSortType('tickers', symbolIndex)).toBe('string');
    expect(appWindow.getColumnSortType('tickers', 'change_percent')).toBe('numeric');
    expect(appWindow.getColumnSortType('tickers', 'unknown_column')).toBeUndefined();
    expect(appWindow.getColumnSortType('unknown_table', 0)).toBeNull();
  });

  test('getDefaultSortChain falls back to first column when canonical keys missing', () => {
    const { appWindow } = bootstrapTablesSystem();
    const chain = appWindow.getDefaultSortChain('tag_usage_leaderboard');
    expect(chain).toHaveLength(1);
    expect(chain[0]).toMatchObject({ priority: 'fallback', columnIndex: 0 });
  });

  test('getDefaultSortChain builds canonical priorities for trades table', () => {
    const { appWindow } = bootstrapTablesSystem();
    const chain = appWindow.getDefaultSortChain('trades');
    expect(chain.find(step => step.priority === 'date')).toMatchObject({ direction: 'desc' });
    expect(chain.find(step => step.priority === 'status')).toBeTruthy();
    expect(chain.find(step => step.priority === 'ticker')).toBeTruthy();
  });

  test('getDefaultSortChain returns empty array for unsupported tables', () => {
    const { appWindow } = bootstrapTablesSystem();
    const chain = appWindow.getDefaultSortChain('non_existing_sort_table');
    expect(Array.isArray(chain)).toBe(true);
    expect(chain).toHaveLength(0);
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

  test('resolveColumnValue covers linked_items fallbacks via compareTableRows', () => {
    const { appWindow } = bootstrapTablesSystem();
    const statusIndex = 1;
    const statusRows = [
      { status: 'zeta' },
      { status: 'alpha' },
    ];
    statusRows.sort((a, b) => appWindow.compareTableRows(a, b, 'linked_items', statusIndex, 'asc'));
    expect(statusRows[0].status).toBe('alpha');

    const createdIndex = 2;
    const dateRows = [
      { created_at: '2024-01-02' },
      { updated_at: '2024-01-01' },
    ];
    dateRows.sort((a, b) => appWindow.compareTableRows(a, b, 'linked_items', createdIndex, 'asc'));
    expect(dateRows[0].created_at || dateRows[0].updated_at).toBe('2024-01-01');
  });

  test('resolveColumnValue falls back through legacy layers when mappings missing', () => {
    const { appWindow } = bootstrapTablesSystem();
    appWindow.tableMappings = null;
    appWindow.TABLE_COLUMN_MAPPINGS = { trades: ['id', 'account.name'] };
    const legacy = jest.fn(() => 'legacy-value');
    appWindow.getColumnValue = legacy;
    appWindow.compareTableRows({ id: 7 }, { id: 3 }, 'trades', 0, 'asc');
    expect(legacy).toHaveBeenCalledWith({ id: 7 }, 0, 'trades');

    appWindow.getColumnValue = undefined;
    const nestedResult = appWindow.compareTableRows(
      { account: { name: 'Nested-B' } },
      { account: { name: 'Nested-A' } },
      'trades',
      1,
      'asc',
    );
    expect(nestedResult).toBeGreaterThan(0);

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    appWindow.TABLE_COLUMN_MAPPINGS = null;
    const tickerResult = appWindow.compareTableRows(
      { symbol: 'BBB' },
      { symbol: 'AAA' },
      'tickers',
      0,
      'asc',
    );
    expect(tickerResult).toBeGreaterThan(0);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('table-mappings.js getColumnValue not available'));
    warnSpy.mockRestore();
  });

  test('getCustomSortValue covers active trades, change percent and alert condition logic', () => {
    const { appWindow } = bootstrapTablesSystem();
    const columnSequence = ['active_trades', 'active_trades', 'change_percent', 'change_percent', 'condition'];
    let callIndex = 0;
    jest.spyOn(appWindow.tableMappings, 'getColumnKey').mockImplementation(() => columnSequence[callIndex++]);

    expect(appWindow.tables.getCustomSortValue({}, {}, 0, 'tickers', true, false)).toBe(-1);
    expect(appWindow.tables.getCustomSortValue({}, {}, 0, 'tickers', false, true)).toBe(1);
    expect(appWindow.tables.getCustomSortValue({}, {}, 0, 'tickers', '1.25', '-0.2')).toBeLessThan(0);
    expect(appWindow.tables.getCustomSortValue({}, {}, 0, 'tickers', '-1.25', '0.5')).toBeGreaterThan(0);
    expect(appWindow.tables.getCustomSortValue({}, {}, 0, 'alerts', 'bbb', 'aaa')).toBeGreaterThan(0);
  });

  test('sortTableData handles recursion guard and non-array inputs', async () => {
    const { appWindow } = bootstrapTablesSystem();
    appWindow._sortTableDataInProgress = true;
    const data = [{ id: 1 }];
    const recursionResult = await appWindow.sortTableData(0, data, 'trades');
    expect(recursionResult).toBe(data);
    appWindow._sortTableDataInProgress = false;
    const nullResult = await appWindow.sortTableData(0, null, 'trades');
    expect(nullResult).toBeNull();
  });

  test('sortTableData prevents nested reentry from update function callbacks', async () => {
    const { appWindow } = bootstrapTablesSystem();
    const columnIndex = appWindow.getColumnIndexByKey('trades', 'ticker_symbol');
    const dataset = [
      { ticker_symbol: 'B' },
      { ticker_symbol: 'A' },
    ];

    let nestedCallPromise = Promise.resolve();
    const updateFunction = jest.fn(sortedRows => {
      // Attempt to trigger a nested sort inside updateFunction (should be rejected by guard)
      nestedCallPromise = appWindow.sortTableData(columnIndex, dataset, 'trades');
      return sortedRows;
    });

    const sorted = await appWindow.sortTableData(columnIndex, dataset, 'trades', updateFunction);
    expect(updateFunction).toHaveBeenCalledTimes(1);
    expect(sorted[0].ticker_symbol).toBe('A');

    const nestedResult = await nestedCallPromise;
    expect(nestedResult).toBe(dataset);
    expect(appWindow._sortTableDataInProgress).toBe(false);
  });


  test('sortTableData logs warning when cache retrieval fails', async () => {
    const { appWindow } = bootstrapTablesSystem();
    appWindow.UnifiedCacheManager.get = jest.fn(() => Promise.reject(new Error('cache-fail')));
    appWindow.Logger.warn = jest.fn();
    const columnIndex = appWindow.getColumnIndexByKey('trades', 'ticker_symbol');
    await appWindow.sortTableData(columnIndex, [{ ticker_symbol: 'B' }, { ticker_symbol: 'A' }], 'trades', jest.fn());
    expect(appWindow.Logger.warn).toHaveBeenCalledWith(expect.stringContaining('sortTableData: Failed to get table state'), expect.any(Error), expect.objectContaining({ page: 'tables' }));
  });

  test('sortTableData returns sorted data when update function missing', async () => {
    const { appWindow } = bootstrapTablesSystem();
    const columnIndex = appWindow.getColumnIndexByKey('trades', 'ticker_symbol');
    const sorted = await appWindow.sortTableData(columnIndex, [
      { ticker_symbol: 'B' },
      { ticker_symbol: 'A' },
    ], 'trades');
    expect(sorted[0].ticker_symbol).toBe('A');
  });

  test('sortTableData re-enables headers when update function throws', async () => {
    const tableElement = {
      querySelectorAll: jest.fn(() => [{ style: { pointerEvents: '' } }]),
    };
    const { appWindow } = bootstrapTablesSystem({
      documentOverrides: { querySelector: jest.fn(() => tableElement) },
    });
    const columnIndex = appWindow.getColumnIndexByKey('trades', 'ticker_symbol');
    const data = [{ ticker_symbol: 'A' }, { ticker_symbol: 'B' }];
    await expect(appWindow.sortTableData(columnIndex, data, 'trades', () => { throw new Error('boom'); })).rejects.toThrow('boom');
    expect(tableElement.querySelectorAll).toHaveBeenCalled();
    expect(appWindow._sortTableDataInProgress).toBe(false);
  });

  test('sortTableData handles async update function rejection', async () => {
    const { appWindow } = bootstrapTablesSystem();
    const columnIndex = appWindow.getColumnIndexByKey('trades', 'ticker_symbol');
    const data = [{ ticker_symbol: 'A' }, { ticker_symbol: 'B' }];
    await expect(appWindow.sortTableData(columnIndex, data, 'trades', () => Promise.reject(new Error('async-boom')))).rejects.toThrow('async-boom');
    expect(appWindow._sortTableDataInProgress).toBe(false);
  });

  test('compareTableRows converts envelopes with epoch helpers and adapters', () => {
    const { appWindow } = bootstrapTablesSystem();
    appWindow.getEpochMilliseconds = jest.fn(value => value === 'A' ? 111 : NaN);
    appWindow.dateUtils = { getEpochMilliseconds: jest.fn(() => 222) };
    appWindow.TableSortValueAdapter = {
      getSortValue: jest.fn(({ value }) => typeof value === 'string' ? Number(value.replace('val-', '')) : value),
    };
    jest.spyOn(appWindow, 'getColumnSortType').mockImplementation(() => 'numeric-string');
    const cleanupColumn = addTemporaryColumn(appWindow, 'trades', 'custom_metric', { sortType: 'numeric-string' });
    const columnIndex = appWindow.getColumnIndexByKey('trades', 'custom_metric');

    const result = appWindow.compareTableRows(
      { custom_metric: 'val-5', custom_metric_envelope: 'A' },
      { custom_metric: 'val-10', custom_metric_envelope: 'B' },
      'trades',
      columnIndex,
      'asc',
    );

    expect(appWindow.getEpochMilliseconds).toHaveBeenCalled();
    expect(appWindow.dateUtils.getEpochMilliseconds).toHaveBeenCalled();
    expect(appWindow.TableSortValueAdapter.getSortValue).toHaveBeenCalled();
    expect(result).toBeLessThan(0);
    cleanupColumn();
  });

  test('compareTableRows handles dateEnvelope fallback and plain date parsing', () => {
    const { appWindow } = bootstrapTablesSystem();
    const cleanupEnvelopeColumn = addTemporaryColumn(appWindow, 'trades', 'custom_date', { sortType: 'dateEnvelope' });
    const envelopeIndex = appWindow.getColumnIndexByKey('trades', 'custom_date');
    jest.spyOn(appWindow, 'getColumnSortType')
      .mockImplementationOnce(() => 'dateEnvelope')
      .mockImplementationOnce(() => null)
      .mockImplementationOnce(() => null);
    appWindow.TableSortValueAdapter = undefined;

    const envelopeResult = appWindow.compareTableRows(
      { custom_date: { epochMs: 1000 } },
      { custom_date: { utc: '2024-01-01T00:00:00Z' } },
      'trades',
      envelopeIndex,
      'asc',
    );
    expect(envelopeResult).toBeLessThan(0);
    cleanupEnvelopeColumn();

    const cleanupNumericColumn = addTemporaryColumn(appWindow, 'trades', 'custom_number');
    const numericIndex = appWindow.getColumnIndexByKey('trades', 'custom_number');
    const numericResult = appWindow.compareTableRows(
      { custom_number: '5' },
      { custom_number: '10' },
      'trades',
      numericIndex,
      'asc',
    );
    expect(numericResult).toBeLessThan(0);
    cleanupNumericColumn();

    const cleanupDateStringColumn = addTemporaryColumn(appWindow, 'trades', 'custom_date_string');
    const dateIndex = appWindow.getColumnIndexByKey('trades', 'custom_date_string');
    const dateResult = appWindow.compareTableRows(
      { custom_date_string: '2024-01-01' },
      { custom_date_string: '2024-02-01' },
      'trades',
      dateIndex,
      'asc',
    );
    expect(dateResult).toBeLessThan(0);
    cleanupDateStringColumn();
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

  test('saveSortState logs warning when PageStateManager fails', async () => {
    const { appWindow } = bootstrapTablesSystem();
    appWindow.PageStateManager.saveSort = jest.fn(() => Promise.reject(new Error('psm-fail')));
    appWindow.UnifiedCacheManager.save = jest.fn(() => Promise.resolve(true));
    appWindow.Logger.warn = jest.fn();
    await appWindow.saveSortState('alerts', 1, 'asc', { pageName: 'alerts-page' });
    expect(appWindow.Logger.warn).toHaveBeenCalledWith(expect.stringContaining('PageStateManager'), expect.any(Error), expect.objectContaining({ page: 'tables' }));
  });

  test('saveSortState logs error when cache save fails', async () => {
    const { appWindow } = bootstrapTablesSystem();
    appWindow.PageStateManager.saveSort = jest.fn(() => Promise.resolve());
    appWindow.UnifiedCacheManager.save = jest.fn()
      .mockResolvedValueOnce(true)
      .mockRejectedValueOnce(new Error('cache-save'));
    appWindow.Logger.error = jest.fn();
    await appWindow.saveSortState('alerts', 1, 'asc');
    expect(appWindow.Logger.error).toHaveBeenCalledWith(expect.stringContaining('Failed to save sort state'), expect.any(Error), expect.objectContaining({ page: 'tables' }));
  });

  test('getSortState handles missing cache manager and cache errors', async () => {
    const { appWindow } = bootstrapTablesSystem();
    appWindow.Logger.warn = jest.fn();
    appWindow.Logger.error = jest.fn();
    appWindow.UnifiedCacheManager = null;
    const defaultState = await appWindow.getSortState('alerts');
    expect(defaultState.columnIndex).toBe(-1);
    expect(appWindow.Logger.warn).toHaveBeenCalledWith(expect.stringContaining('getSortState'), expect.objectContaining({ page: 'tables' }));

    const { appWindow: secondWindow } = bootstrapTablesSystem();
    secondWindow.Logger.error = jest.fn();
    secondWindow.UnifiedCacheManager.get = jest.fn(() => { throw new Error('cache-get'); });
    await secondWindow.getSortState('alerts');
    expect(secondWindow.Logger.error).toHaveBeenCalledWith(expect.stringContaining('getSortState'), expect.any(Error), expect.objectContaining({ page: 'tables' }));
  });

  test('setSortState delegates to saveSortState and sortAnyTable forwards to sortTableData', async () => {
    const { appWindow } = bootstrapTablesSystem();
    const saveSpy = jest.spyOn(appWindow, 'saveSortState').mockResolvedValue();
    appWindow.setSortState('alerts', 2, 'desc');
    expect(saveSpy).toHaveBeenCalledWith('alerts', 2, 'desc');

    const sortSpy = jest.spyOn(appWindow, 'sortTableData').mockResolvedValue([]);
    await appWindow.sortAnyTable('alerts', 2, [{ id: 1 }], jest.fn());
    expect(sortSpy).toHaveBeenCalledWith(2, expect.any(Array), 'alerts', expect.any(Function));
  });

  test('restoreAnyTableSort uses UnifiedTableSystem when registered', async () => {
    const { appWindow } = bootstrapTablesSystem();
    appWindow.UnifiedTableSystem.registry.isRegistered = jest.fn(() => true);
    appWindow.loadSortState = jest.fn(() => Promise.resolve({
      columnIndex: 1,
      direction: 'desc',
      chain: [{ columnIndex: 1, direction: 'desc' }],
    }));
    appWindow.UnifiedTableSystem.sorter.sortByChain = jest.fn(() => Promise.resolve([{ id: 1 }]));
    await appWindow.restoreAnyTableSort('alerts');
    expect(appWindow.UnifiedTableSystem.sorter.sortByChain).toHaveBeenCalledWith('alerts', expect.any(Array), expect.objectContaining({ saveState: true }));
  });

  test('applyDefaultSort uses UnifiedTableSystem when available', async () => {
    const { appWindow } = bootstrapTablesSystem();
    appWindow.UnifiedTableSystem.registry.isRegistered = jest.fn(() => true);
    appWindow.UnifiedTableSystem.sorter.applyDefaultSort = jest.fn(() => Promise.resolve([{ id: 1 }]));
    await appWindow.applyDefaultSort('alerts');
    expect(appWindow.UnifiedTableSystem.sorter.applyDefaultSort).toHaveBeenCalledWith('alerts');
  });

  test('closeModal hides via bootstrap and manual fallback', () => {
    const backdrop = { remove: jest.fn() };
    const modalElement = {
      classList: { remove: jest.fn() },
      style: {},
    };
    const body = { classList: { remove: jest.fn() }, style: {} };
    const { appWindow } = bootstrapTablesSystem({
      documentOverrides: {
        getElementById: jest.fn(() => modalElement),
        querySelector: jest.fn(selector => selector === '.modal-backdrop' ? backdrop : null),
        body,
      },
    });
    global.bootstrap = { Modal: { getInstance: jest.fn(() => ({ hide: jest.fn() })) } };
    appWindow.closeModal('modal-id');
    expect(global.bootstrap.Modal.getInstance).toHaveBeenCalledWith(modalElement);
    appWindow.document.getElementById.mockReturnValue({ ...modalElement, classList: { remove: jest.fn() }, style: {} });
    global.bootstrap.Modal.getInstance.mockReturnValue(null);
    appWindow.closeModal('secondary');
    expect(body.classList.remove).toHaveBeenCalledWith('modal-open');
  });

  test('table state cache helpers interact with UnifiedCacheManager', async () => {
    const { appWindow } = bootstrapTablesSystem();
    appWindow.UnifiedCacheManager.save = jest.fn(() => Promise.resolve(true));
    appWindow.UnifiedCacheManager.get = jest.fn(() => Promise.resolve({ state: 'ok' }));
    expect(await appWindow.saveTableState('alerts', { column: 1 })).toBe(true);
    expect(await appWindow.loadTableState('alerts')).toEqual({ state: 'ok' });
  });

  test('legacy sortTable signatures and console fallback branches', async () => {
    const header = {
      classList: { contains: jest.fn(() => true) },
      closest: jest.fn(() => ({ getAttribute: jest.fn(() => 'alerts') })),
    };
    const { appWindow } = bootstrapTablesSystem({
      documentOverrides: {
        activeElement: header,
        querySelectorAll: jest.fn(() => [header]),
      },
    });
    appWindow.UnifiedTableSystem.registry.isRegistered = jest.fn(() => false);
    await appWindow.sortTable(0);

    appWindow.Logger = null;
    await appWindow.sortTable('unregistered-table', 0);
  });

  test('sortTable uses window.event targets when available', async () => {
    const header = {
      classList: { contains: jest.fn(() => true) },
      closest: jest.fn(() => ({ getAttribute: jest.fn(() => 'alerts') })),
    };
    global.event = { target: header };
    const { appWindow } = bootstrapTablesSystem({
      documentOverrides: {
        querySelectorAll: jest.fn(() => [header]),
      },
    });
    appWindow.UnifiedTableSystem.registry.isRegistered = jest.fn(() => false);
    await appWindow.sortTable(0);
    delete global.event;
  });

  test('sortTable handles direct data array invocation', async () => {
    const { appWindow } = bootstrapTablesSystem();
    const sortSpy = jest.spyOn(appWindow, 'sortTableData').mockResolvedValue([]);
    await appWindow.sortTable('alerts', 0, [{ id: 1 }], jest.fn());
    expect(sortSpy).toHaveBeenCalledWith(0, expect.any(Array), 'alerts', expect.any(Function));
  });

  test('sortTable returns empty array for invalid parameters', () => {
    const { appWindow } = bootstrapTablesSystem();
    expect(appWindow.sortTable(null, null)).toEqual([]);
  });

  test('isDateValue helper executes through compareTableRows fallbacks', () => {
    const { appWindow } = bootstrapTablesSystem();
    jest.spyOn(appWindow, 'getColumnSortType').mockReturnValue(null);
    const cleanup = addTemporaryColumn(appWindow, 'trades', 'custom_date_string');
    const columnIndex = appWindow.getColumnIndexByKey('trades', 'custom_date_string');
    const result = appWindow.compareTableRows(
      { custom_date_string: '' },
      { custom_date_string: '2024-01-01' },
      'trades',
      columnIndex,
      'asc',
    );
    expect(result).toBeLessThan(0);
    cleanup();
  });

  test('restoreAnyTableSort and applyDefaultSort trigger UnifiedTableSystem sort flows', async () => {
    const { appWindow } = bootstrapTablesSystem();
    appWindow.UnifiedTableSystem.registry.isRegistered = jest.fn(() => true);
    appWindow.UnifiedTableSystem.sorter.sort = jest.fn(() => Promise.resolve([{ id: 1 }]));
    appWindow.UnifiedTableSystem.sorter.applyDefaultSort = jest.fn(() => Promise.resolve([{ id: 2 }]));
    appWindow.loadSortState = jest.fn(() => Promise.resolve({ columnIndex: 1, direction: 'desc' }));
    await appWindow.restoreAnyTableSort('alerts');
    expect(appWindow.UnifiedTableSystem.sorter.sort).toHaveBeenCalledWith('alerts', 1, expect.objectContaining({ direction: 'desc' }));

    appWindow.loadSortState = jest.fn(() => Promise.resolve({ columnIndex: -1 }));
    await appWindow.restoreAnyTableSort('alerts');
    expect(appWindow.UnifiedTableSystem.sorter.applyDefaultSort).toHaveBeenCalledWith('alerts');
  });

  test('getDefaultColumnDefs exports base metadata', () => {
    const { appWindow } = bootstrapTablesSystem();
    const defs = appWindow.getDefaultColumnDefs();
    expect(Array.isArray(defs)).toBe(true);
    expect(defs[0]).toMatchObject({ field: 'id' });
  });

  test('refreshTable surfaces errors via notifications', async () => {
    const { appWindow } = bootstrapTablesSystem();
    appWindow.loadTableData = jest.fn(() => Promise.reject(new Error('refresh-fail')));
    appWindow.showErrorNotification = jest.fn();
    await expect(appWindow.refreshTable('alerts', jest.fn())).rejects.toThrow('refresh-fail');
    expect(appWindow.showErrorNotification).toHaveBeenCalled();
  });

  test('cache helpers handle missing manager and error branches', async () => {
    const { appWindow } = bootstrapTablesSystem();
    appWindow.UnifiedCacheManager = null;
    const loader = jest.fn(() => Promise.resolve(['server']));
    const cached = await appWindow.loadTableDataFromCache('alerts', {}, loader);
    expect(cached).toEqual(['server']);
    const saved = await appWindow.saveTableDataToCache('alerts', [], {});
    expect(saved).toBe(false);

    const second = bootstrapTablesSystem();
    second.appWindow.UnifiedCacheManager = {
      get: jest.fn(() => { throw new Error('get-fail'); }),
      save: jest.fn(() => { throw new Error('save-fail'); }),
    };
    await second.appWindow.loadTableDataFromCache('alerts', {}, loader);
    const saveResult = await second.appWindow.saveTableDataToCache('alerts', [], {});
    expect(saveResult).toBe(false);
  });

  test('TableDataRegistry helpers fall back to clones when registry missing', () => {
    const { appWindow } = bootstrapTablesSystem();
    appWindow.TableDataRegistry = null;
    const data = [{ id: 1 }];
    expect(appWindow.setTableData('alerts', data)).not.toBe(data);
    expect(appWindow.setFilteredTableData('alerts', data)).not.toBe(data);
    expect(appWindow.setPageTableData('alerts', data)).not.toBe(data);
    expect(appWindow.getFullTableData('alerts')).toEqual([]);
    expect(appWindow.getFilteredTableData('alerts')).toEqual([]);
    expect(appWindow.getPageTableData('alerts')).toEqual([]);
    expect(appWindow.getTableDataCounts('alerts')).toEqual({ total: 0, filtered: 0, page: 0 });
    expect(appWindow.getTableDataSummary('alerts')).toBeNull();
  });

  test('resolveColumnValue fallback handles nested mappings and hardcoded configuration', () => {
    const { appWindow } = bootstrapTablesSystem();
    appWindow.tableMappings = null;
    appWindow.getColumnValue = undefined;
    appWindow.TABLE_COLUMN_MAPPINGS = { trades: ['id', 'account.name'] };
    const nestedCompare = appWindow.compareTableRows(
      { account: { name: 'Bob' } },
      { account: { name: 'Alice' } },
      'trades',
      1,
      'asc',
    );
    expect(nestedCompare).toBeGreaterThan(0);
    const missingCompare = appWindow.compareTableRows({}, {}, 'trades', 1, 'asc');
    expect(missingCompare).toBe(0);

    appWindow.TABLE_COLUMN_MAPPINGS = null;
    const fallbackCompare = appWindow.compareTableRows(
      { symbol: 'AAA' },
      { symbol: 'BBB' },
      'tickers',
      0,
      'asc',
    );
    expect(fallbackCompare).toBeLessThan(0);
  });

  test('linked_items resolveColumnValue default branch returns empty string', () => {
    const { appWindow } = bootstrapTablesSystem();
    const columnIndex = 5;
    const result = appWindow.compareTableRows({ any: 'value' }, { any: 'value' }, 'linked_items', columnIndex, 'asc');
    expect(result).toBe(0);
  });

  test('custom sort value covers equals and numeric difference branches', () => {
    const { appWindow } = bootstrapTablesSystem();
    const spy = jest.spyOn(appWindow.tableMappings, 'getColumnKey').mockReturnValue('active_trades');
    expect(appWindow.tables.getCustomSortValue({}, {}, 0, 'tickers', false, false)).toBe(0);
    spy.mockReturnValue('change_percent');
    expect(appWindow.tables.getCustomSortValue({}, {}, 0, 'tickers', '0.5', '0.25')).toBeGreaterThan(0);
    spy.mockRestore();
  });

  test('getEpoch helper returns null when inputs missing', () => {
    const { appWindow } = bootstrapTablesSystem();
    appWindow.getEpochMilliseconds = jest.fn(() => NaN);
    appWindow.dateUtils = { getEpochMilliseconds: jest.fn(() => NaN) };
    const cleanup = addTemporaryColumn(appWindow, 'trades', 'custom_date', { sortType: 'dateEnvelope' });
    const columnIndex = appWindow.getColumnIndexByKey('trades', 'custom_date');
    const result = appWindow.compareTableRows(
      { custom_date: null },
      { custom_date: null },
      'trades',
      columnIndex,
      'asc',
    );
    expect(result).toBe(0);
    cleanup();
  });

  test('saveSortState and getSortState fallback to console errors when Logger missing', async () => {
    const { appWindow } = bootstrapTablesSystem();
    appWindow.Logger = null;
    appWindow.UnifiedCacheManager.save = jest.fn(() => Promise.reject(new Error('fail-save')));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await appWindow.saveSortState('alerts', 0, 'asc');

    appWindow.UnifiedCacheManager.get = jest.fn(() => { throw new Error('fail-get'); });
    await appWindow.getSortState('alerts');
    expect(consoleErrorSpy).toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  test('loadSortState returns cached value directly and falls back to defaults', async () => {
    const { appWindow } = bootstrapTablesSystem();
    jest.spyOn(appWindow, 'getSortState').mockResolvedValue({ columnIndex: 1, direction: 'desc' });
    const cached = await appWindow.loadSortState('alerts');
    expect(cached.columnIndex).toBe(1);

    appWindow.getSortState.mockResolvedValue({ columnIndex: -1, direction: 'asc', timestamp: Date.now() });
    appWindow.PageStateManager.loadSort = jest.fn(() => Promise.resolve(null));
    const fallback = await appWindow.loadSortState('alerts', { pageName: 'alerts' });
    expect(fallback.columnIndex).toBe(-1);
  });

  test('ensureTablePagination warns when pagination system missing', () => {
    const { appWindow } = bootstrapTablesSystem();
    appWindow.PaginationSystem = null;
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    expect(appWindow.ensureTablePagination('alerts')).toBeNull();
    warnSpy.mockRestore();
  });

  test('ensureTablePagination updates existing pagination configuration', () => {
    const { appWindow } = bootstrapTablesSystem();
    appWindow.PaginationSystem = {};
    const existing = {
      config: {},
      tableType: null,
      setPageSize: jest.fn(),
      pageSize: 25,
    };
    appWindow.getPagination = jest.fn(() => existing);
    const afterRender = jest.fn();
    const filteredChange = jest.fn();
    appWindow.ensureTablePagination('alerts', {
      tableType: 'alerts',
      onAfterRender: afterRender,
      onFilteredDataChange: filteredChange,
      pageSize: 50,
    });
    expect(existing.config.onAfterRender).toBe(afterRender);
    expect(existing.config.onFilteredDataChange).toBe(filteredChange);
    expect(existing.tableType).toBe('alerts');
    expect(existing.setPageSize).toHaveBeenCalledWith(50);
  });

  test('updateTableWithPagination validates required parameters and logs callback warnings', async () => {
    const { appWindow } = bootstrapTablesSystem();
    await expect(appWindow.updateTableWithPagination({ render: jest.fn() })).rejects.toThrow('tableId');
    await expect(appWindow.updateTableWithPagination({ tableId: 'alerts' })).rejects.toThrow('render callback');

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    let directRender = true;
    const render = jest.fn(() => {
      if (directRender) {
        directRender = false;
        return;
      }
      throw new Error('render-fail');
    });
    let capturedOptions = null;
    appWindow.ensureTablePagination = jest.fn((tableId, options) => {
      capturedOptions = options;
      return {
        config: options,
        setPageSize: jest.fn(),
        setData: jest.fn(),
        getCurrentPageData: jest.fn(() => []),
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalItems: 0,
        filteredData: [],
      };
    });
    await appWindow.updateTableWithPagination({ tableId: 'alerts', data: [], render });
    await capturedOptions.onAfterRender({ pageData: [], pagination: {} });
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('render callback failed'), expect.any(Error));

    const filteredWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    appWindow.ensureTablePagination = jest.fn((tableId, options) => {
      capturedOptions = options;
      return {
        config: options,
        setPageSize: jest.fn(),
        setData: jest.fn(),
        getCurrentPageData: jest.fn(() => []),
        currentPage: 1,
        totalPages: 1,
        pageSize: 10,
        totalItems: 0,
        filteredData: [],
      };
    });
    await appWindow.updateTableWithPagination({
      tableId: 'alerts',
      data: [],
      render: jest.fn(),
      onFilteredDataChange: () => { throw new Error('filter-fail'); },
    });
    capturedOptions.onFilteredDataChange({ filteredData: [] });
    expect(filteredWarnSpy).toHaveBeenCalledWith(expect.stringContaining('onFilteredDataChange callback failed'), expect.any(Error));
    filteredWarnSpy.mockRestore();
    warnSpy.mockRestore();
  });

  test('table state helpers warn or error when cache unavailable', async () => {
    const { appWindow } = bootstrapTablesSystem();
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    appWindow.UnifiedCacheManager = null;
    await appWindow.saveTableState('alerts', {});
    await appWindow.loadTableState('alerts');
    warnSpy.mockRestore();

    const { appWindow: second } = bootstrapTablesSystem();
    second.UnifiedCacheManager.save = jest.fn(() => { throw new Error('state-save'); });
    second.UnifiedCacheManager.get = jest.fn(() => { throw new Error('state-load'); });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    await second.saveTableState('alerts', {});
    await second.loadTableState('alerts');
    errorSpy.mockRestore();
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
