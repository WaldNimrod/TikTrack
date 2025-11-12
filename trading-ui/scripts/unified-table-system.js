/**
 * Unified Table Management System - TikTrack
 * ==========================================
 * 
 * מערכת טבלאות מרכזית מאוחדת שתאחד את כל המנגנונים הקשורים לטבלאות:
 * - סידור (Sorting)
 * - מיפוי (Column Mapping)
 * - סינון (Filtering)
 * - רינדור (Rendering)
 * - רוחב עמודות (Column Widths)
 * - סגנונות (Styling)
 * - Event Handlers
 * - ניהול מצב (State Management)
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/TABLE_SYSTEM_ANALYSIS.md
 * - documentation/02-ARCHITECTURE/FRONTEND/UNIFIED_TABLE_SYSTEM.md
 * 
 * Author: TikTrack Development Team
 * Version: 1.0.0
 * Last Updated: 2025-01-27
 */

// ===== TABLE REGISTRY =====

/**
 * TableRegistry - רישום מרכזי של כל הטבלאות
 * 
 * כל טבלה נרשמת פעם אחת עם קונפיגורציה מלאה:
 * - dataGetter - פונקציה לקבלת נתונים
 * - updateFunction - פונקציה לעדכון טבלה
 * - tableSelector - selector של הטבלה
 * - columns - הגדרות עמודות
 * - styles - הגדרות סגנונות
 * - filters - הגדרות סינונים
 */
class TableRegistry {
  constructor() {
    this._tables = new Map();
  }

  /**
   * רישום טבלה במערכת
   * @param {string} tableType - סוג הטבלה (data-table-type)
   * @param {Object} config - קונפיגורציה
   * @param {Function} config.dataGetter - פונקציה לקבלת נתונים () => Array
   * @param {Function} config.updateFunction - פונקציה לעדכון טבלה (data) => void
   * @param {string} config.tableSelector - selector של הטבלה (#tableId)
   * @param {Array} config.columns - הגדרות עמודות (מ-table-mappings.js)
   * @param {Object} config.styles - הגדרות סגנונות (אם רלוונטי)
   * @param {Object} config.filters - הגדרות סינונים (אם רלוונטי)
   * @param {boolean} config.sortable - האם ניתן לסדר (default: true)
   * @param {boolean} config.filterable - האם ניתן לסנן (default: true)
   */
  register(tableType, config) {
    if (!tableType || typeof tableType !== 'string') {
      throw new Error('TableRegistry.register: tableType must be a non-empty string');
    }

    if (!config || typeof config !== 'object') {
      throw new Error('TableRegistry.register: config must be an object');
    }

    if (typeof config.dataGetter !== 'function') {
      throw new Error('TableRegistry.register: config.dataGetter must be a function');
    }

    if (typeof config.updateFunction !== 'function') {
      throw new Error('TableRegistry.register: config.updateFunction must be a function');
    }

    if (!config.tableSelector || typeof config.tableSelector !== 'string') {
      throw new Error('TableRegistry.register: config.tableSelector must be a non-empty string');
    }

    this._tables.set(tableType, {
      dataGetter: config.dataGetter,
      updateFunction: config.updateFunction,
      tableSelector: config.tableSelector,
      columns: config.columns || [],
      styles: config.styles || {},
      filters: config.filters || {},
      sortable: config.sortable !== false,
      filterable: config.filterable !== false,
      ...config
    });

    if (window.TableDataRegistry) {
      let tableId = null;
      if (config.tableSelector.startsWith('#')) {
        tableId = config.tableSelector.substring(1);
      }

      window.TableDataRegistry.registerTable({
        tableType,
        tableId,
        source: 'unified-table-system',
      });
    }
  }

  /**
   * קבלת קונפיגורציה של טבלה
   * @param {string} tableType - סוג הטבלה
   * @returns {Object|null} קונפיגורציה או null אם לא נמצאה
   */
  getConfig(tableType) {
    if (!tableType || typeof tableType !== 'string') {
      return null;
    }
    return this._tables.get(tableType) || null;
  }

  /**
   * בדיקה אם טבלה רשומה
   * @param {string} tableType - סוג הטבלה
   * @returns {boolean}
   */
  isRegistered(tableType) {
    return this._tables.has(tableType);
  }

  /**
   * קבלת רשימת כל הטבלאות הרשומות
   * @returns {Array<string>} רשימת סוגי טבלאות
   */
  getAllTables() {
    return Array.from(this._tables.keys());
  }

  /**
   * ביטול רישום טבלה
   * @param {string} tableType - סוג הטבלה
   */
  unregister(tableType) {
    this._tables.delete(tableType);
  }

  /**
   * ניקוי כל הרישומים
   */
  clear() {
    this._tables.clear();
  }
}

// ===== TABLE SORTER =====

/**
 * TableSorter - סידור מרכזי של טבלאות
 * 
 * משתמש ב-TableRegistry לקבלת קונפיגורציה ומנתוני טבלאות
 * מחליף את window.sortTable הישן
 */
class TableSorter {
  constructor(registry) {
    this.registry = registry;
    // Global recursion guard - prevents ANY sort while a sort is in progress
    this._globalSortingFlag = false;
  }

  /**
   * סידור טבלה לפי עמודה
   * @param {string} tableType - סוג הטבלה
   * @param {number} columnIndex - אינדקס העמודה
   * @returns {Array|null} נתונים מסודרים או null אם שגיאה
   */
  sort(tableType, columnIndex) {
    // CRITICAL: Prevent infinite recursion - check BOTH instance flag AND global flag
    // This prevents ANY sort from happening while a sort is in progress
    if (this._globalSortingFlag || window._sortTableDataInProgress) {
      console.warn(`[TableSorter.sort] Recursion guard: Sort already in progress, rejecting call for ${tableType} column ${columnIndex}`);
      console.trace('[TableSorter.sort] Stack trace for rejected call');
      return null;
    }
    
    console.log(`[TableSorter.sort] Starting sort: tableType=${tableType}, columnIndex=${columnIndex}, flag=${this._globalSortingFlag}, globalFlag=${window._sortTableDataInProgress}`);
    
    // Set instance flag to prevent recursion from this source
    this._globalSortingFlag = true;

    const release = () => {
      console.log(`[TableSorter.sort] Completed sort: tableType=${tableType}, columnIndex=${columnIndex}`);
      this._globalSortingFlag = false;
    };

    try {
      // CRITICAL: Always log to console to trace calls
      console.log('🔍 [TableSorter.sort] FUNCTION CALLED', { 
        tableType, 
        columnIndex,
        isRegistered: this.registry.isRegistered(tableType),
        stackTrace: new Error().stack.split('\n').slice(0, 3).join('\n')
      });
      const config = this.registry.getConfig(tableType);
      if (!config) {
        console.warn(`[TableSorter.sort] Table type "${tableType}" not registered`);
        // Log only if Logger is available, otherwise silent
        if (window.Logger) {
          window.Logger.warn(`TableSorter.sort: Table type "${tableType}" not registered`, { page: "unified-table-system" });
        }
        release();
        return null;
      }

      // קבלת נתונים
      let data = config.dataGetter();
      if ((!Array.isArray(data) || data.length === 0) && window.TableDataRegistry) {
        const registryData = window.TableDataRegistry.getFilteredData(tableType, { asReference: true });
        if (Array.isArray(registryData) && registryData.length > 0) {
          data = registryData;
        }
      }
      if (!Array.isArray(data)) {
        data = [];
      }
      if (!Array.isArray(data)) {
        if (window.Logger) {
          window.Logger.warn(`TableSorter.sort: dataGetter for "${tableType}" did not return an array`, { page: "unified-table-system" });
        }
        release();
        return null;
      }

      if (data.length === 0) {
        release();
        return [];
      }

      // שימוש ב-sortTableData הקיים
      // CRITICAL: Temporarily disable event handlers during sort to prevent recursion
      const originalUpdateFunction = config.updateFunction;
      const safeUpdateFunction = (sortedData) => {
        if (window._updateFunctionInProgress) {
          console.warn(`[TableSorter.sort] updateFunction already in progress for ${tableType}, skipping`);
          console.trace('[TableSorter.sort] Stack trace for updateFunction recursion');
          return;
        }

        window._updateFunctionInProgress = true;

        const table = document.querySelector(config.tableSelector);
        const sortableHeaders = table ? Array.from(table.querySelectorAll('.sortable-header')) : [];
        sortableHeaders.forEach(header => {
          header.style.pointerEvents = 'none';
        });

        const release = () => {
          setTimeout(() => {
            sortableHeaders.forEach(header => {
              header.style.pointerEvents = '';
            });
            window._updateFunctionInProgress = false;
          }, 150);
        };

        try {
          console.log(`[TableSorter.sort] Calling updateFunction for ${tableType} with ${sortedData?.length || 0} items`);
          const result = originalUpdateFunction(sortedData);

          if (result && typeof result.then === 'function') {
            return result.finally(release);
          }

          release();
          return result;
        } catch (error) {
          console.error(`[TableSorter.sort] Error in updateFunction for ${tableType}:`, error);
          release();
          throw error;
        }
      };
      
      if (typeof window.sortTableData === 'function') {
        const sortResult = window.sortTableData(columnIndex, data, tableType, safeUpdateFunction);
        if (sortResult && typeof sortResult.then === 'function') {
          return sortResult.then(result => {
            release();
            return result;
          }).catch(error => {
            release();
            throw error;
          });
        }
        release();
        return sortResult;
      } else {
        if (window.Logger) {
          window.Logger.error('TableSorter.sort: window.sortTableData not available', { page: "unified-table-system" });
        }
        window._updateFunctionInProgress = false;
        release();
        return null;
      }
    } catch (error) {
      release();
      throw error;
    }
  }

  /**
   * קבלת מצב סידור של טבלה
   * @param {string} tableType - סוג הטבלה
   * @returns {Object} מצב סידור
   */
  getSortState(tableType) {
    if (typeof window.getSortState === 'function') {
      return window.getSortState(tableType);
    }
    return { columnIndex: -1, direction: 'asc', timestamp: Date.now() };
  }

  /**
   * שמירת מצב סידור
   * @param {string} tableType - סוג הטבלה
   * @param {number} columnIndex - אינדקס העמודה
   * @param {string} direction - כיוון סידור ('asc' | 'desc')
   */
  saveSortState(tableType, columnIndex, direction) {
    if (typeof window.saveSortState === 'function') {
      window.saveSortState(tableType, columnIndex, direction);
    }
  }

  /**
   * Apply default sort for a table if no saved state exists
   * @param {string} tableType - סוג הטבלה
   * @returns {Promise<Array|null>} Sorted data or null if not applicable
   */
  async applyDefaultSort(tableType) {
    if (!tableType || typeof tableType !== 'string') {
      return null;
    }

    const config = this.registry.getConfig(tableType);
    if (!config) {
      return null;
    }

    // Check if table has defaultSort configuration
    if (!config.defaultSort || typeof config.defaultSort !== 'object') {
      return null;
    }

    // Check if there's a saved sort state
    if (window.getSortState && typeof window.getSortState === 'function') {
      try {
        const savedState = await window.getSortState(tableType);
        // If there's a saved state with valid column index, don't apply default
        if (savedState && savedState.columnIndex >= 0) {
          return null;
        }
      } catch (err) {
        if (window.Logger) {
          window.Logger.warn(`TableSorter.applyDefaultSort: Failed to check saved state for "${tableType}"`, err, { page: "unified-table-system" });
        }
      }
    }

    // Apply default sort
    const { columnIndex, direction } = config.defaultSort;
    if (typeof columnIndex !== 'number' || columnIndex < 0) {
      return null;
    }

    // Use the sort method with the default column and direction
    // First, save the default sort state
    if (window.saveSortState && typeof window.saveSortState === 'function') {
      await window.saveSortState(tableType, columnIndex, direction);
    }

    // Then apply the sort
    return this.sort(tableType, columnIndex);
  }
}

// ===== TABLE RENDERER =====

/**
 * TableRenderer - רינדור אחיד של טבלאות
 * 
 * אחראי על רינדור טבלאות בצורה אחידה
 * אינטגרציה עם FieldRendererService
 */
class TableRenderer {
  constructor(registry) {
    this.registry = registry;
  }

  /**
   * רינדור טבלה
   * @param {string} tableType - סוג הטבלה
   * @param {Array} data - נתונים לרינדור
   * @param {Object} options - אפשרויות נוספות
   */
  render(tableType, data, options = {}) {
    const config = this.registry.getConfig(tableType);
    if (!config) {
      console.warn(`TableRenderer.render: Table type "${tableType}" not registered`);
      return;
    }

    // שימוש ב-updateFunction מהקונפיגורציה
    if (typeof config.updateFunction === 'function') {
      config.updateFunction(data, options);
    } else {
      console.error(`TableRenderer.render: updateFunction not available for "${tableType}"`);
    }
  }

  /**
   * עדכון טבלה
   * @param {string} tableType - סוג הטבלה
   * @param {Array} data - נתונים לעדכון
   */
  update(tableType, data) {
    this.render(tableType, data);
  }
}

// ===== TABLE FILTER =====

/**
 * TableFilter - סינון מרכזי של טבלאות
 *
 * מבצע סינון על מערכי הנתונים הקנוניים ב-TableDataRegistry ומחזיר מערך מסונן.
 * תומך בהקשר פילטרים מלא (status/type/account/date/search/custom) ומעדכן את ה-Registry.
 */
const FILTER_ALIAS_MAP = Object.freeze({
  statuses: 'status',
  types: 'type',
  accounts: 'account',
  text: 'search',
  query: 'search',
  term: 'search',
  filter: 'search',
  date: 'dateRange',
  date_range: 'dateRange',
});

const STATUS_GENERAL_VALUES = Object.freeze([
  'open',
  'closed',
  'cancelled',
  'canceled',
  'active',
  'inactive',
  'pending',
  'resolved',
  'triggered',
  'archived',
  'deleted',
  'suspended',
]);

const TYPE_GENERAL_VALUES = Object.freeze([
  'swing',
  'investment',
  'passive',
  'crypto',
  'day_trading',
  'scalping',
  'other',
  'long',
  'short',
  'buy',
  'sell',
  'deposit',
  'withdrawal',
  'transfer_in',
  'transfer_out',
  'dividend',
  'fee',
  'interest',
  'bonus',
  'tax',
  'other_positive',
  'other_negative',
  'income',
  'expense',
]);

const ALL_KEYWORDS = new Set(['all', 'הכול', 'הכל', 'כל', 'כל החשבונות', 'כל הסוגים', 'כל הסטטוסים', '*']);

const DEFAULT_FILTER_CONFIG = Object.freeze({
  statusFields: ['status'],
  typeFields: ['type', 'investment_type'],
  accountFields: ['account_name', 'account', 'trading_account_name', 'trading_account_id'],
  dateFields: ['date', 'created_at', 'updated_at', 'opened_at', 'closed_at'],
});

const TABLE_FILTER_OVERRIDES = Object.freeze({
  trades: {
    statusFields: ['status'],
    typeFields: ['investment_type'],
    accountFields: ['account_name', 'trading_account_name', 'trading_account_id'],
    dateFields: ['created_at', 'closed_at', 'updated_at'],
    searchFields: ['ticker_symbol', 'account_name', 'notes', 'side', 'investment_type'],
  },
  trade_plans: {
    statusFields: ['status'],
    typeFields: ['investment_type'],
    accountFields: ['account_name'],
    dateFields: ['created_at', 'updated_at', 'cancelled_at', 'closed_at'],
    searchFields: ['ticker_symbol', 'name', 'notes', 'side', 'investment_type'],
  },
  cash_flows: {
    statusFields: [],
    typeFields: ['type'],
    accountFields: ['account_name'],
    dateFields: ['date', 'updated_at'],
    searchFields: ['description', 'source', 'account_name', 'type'],
  },
  alerts: {
    statusFields: ['status'],
    typeFields: ['condition_source', 'condition_type'],
    accountFields: ['account_name'],
    dateFields: ['created_at', 'triggered_at', 'expiry_date', 'updated_at'],
    searchFields: ['title', 'message', 'condition', 'ticker_symbol', 'related_object', 'account_name'],
  },
  trading_accounts: {
    statusFields: ['status'],
    typeFields: ['type', 'account_type'],
    accountFields: ['name'],
    dateFields: ['created_at', 'updated_at', 'last_activity_at'],
    searchFields: ['name', 'broker_name', 'account_number'],
  },
  executions: {
    statusFields: ['status'],
    typeFields: ['action'],
    accountFields: ['account_name'],
    dateFields: ['date', 'created_at', 'updated_at'],
    searchFields: ['ticker_symbol', 'action', 'account_name', 'source'],
  },
  notes: {
    statusFields: ['status'],
    typeFields: ['type'],
    accountFields: ['related_object', 'related_type'],
    dateFields: ['created_at', 'updated_at'],
    searchFields: ['title', 'content', 'related_object', 'related_type'],
  },
  linked_items: {
    statusFields: ['status'],
    typeFields: ['type', 'related_type'],
    accountFields: [],
    dateFields: ['created_at', 'updated_at'],
    searchFields: ['title', 'description', 'name', 'symbol', 'type', 'related_type'],
  },
  tickers: {
    statusFields: ['status'],
    typeFields: ['type'],
    accountFields: [],
    dateFields: ['updated_at'],
    searchFields: ['symbol', 'name', 'sector', 'industry'],
  },
});

const RELATED_TYPE_ID_TO_KEY = Object.freeze({
  1: 'trading_account',
  2: 'trade',
  3: 'trade_plan',
  4: 'ticker',
});

const RELATED_TYPE_NORMALIZATION_MAP = Object.freeze({
  '1': 'trading_account',
  account: 'trading_account',
  accounts: 'trading_account',
  'trading account': 'trading_account',
  trading_account: 'trading_account',
  'trading-account': 'trading_account',
  tradingaccount: 'trading_account',
  trade: 'trade',
  trades: 'trade',
  '2': 'trade',
  plan: 'trade_plan',
  trade_plan: 'trade_plan',
  'trade-plan': 'trade_plan',
  tradeplan: 'trade_plan',
  '3': 'trade_plan',
  ticker: 'ticker',
  tickers: 'ticker',
  symbol: 'ticker',
  '4': 'ticker',
  alert: 'alert',
  alerts: 'alert',
  execution: 'execution',
  executions: 'execution',
  cash_flow: 'cash_flow',
  cashflows: 'cash_flow',
  'cash-flow': 'cash_flow',
  cash_flows: 'cash_flow',
  note: 'note',
  notes: 'note',
  position: 'position',
  positions: 'position',
});

function getTableOverride(tableType) {
  if (!tableType) {
    return null;
  }
  if (TABLE_FILTER_OVERRIDES[tableType]) {
    return TABLE_FILTER_OVERRIDES[tableType];
  }
  if (typeof tableType === 'string' && tableType.startsWith('linked_items__')) {
    return TABLE_FILTER_OVERRIDES.linked_items || null;
  }
  return null;
}

const FALLBACK_SEARCH_FIELDS = Object.freeze([
  'name',
  'title',
  'description',
  'content',
  'notes',
  'ticker_symbol',
  'symbol',
  'account_name',
  'message',
  'related_object',
]);

const STATUS_TRANSLATORS = [
  () => window.translateTradeStatus,
  () => window.translateTradePlanStatus,
  () => window.translateAccountStatus,
  () => window.translateTickerStatus,
  () => window.translateAlertStatus,
  () => window.translateNoteStatus,
];

const TYPE_TRANSLATORS = [
  () => window.translateTradeType,
  () => window.translateTradePlanType,
  () => window.translateCashFlowType,
];

const SAFE_DATE_RANGE_HELPER = () => window.translateDateRangeToDates;

function toArray(value) {
  if (Array.isArray(value)) {
    return value.filter((item) => item !== undefined && item !== null);
  }
  if (value === undefined || value === null) {
    return [];
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) {
      return [];
    }
    return trimmed.split(',').map((part) => part.trim()).filter(Boolean);
  }
  return [value];
}

function normalizeText(value) {
  if (value === undefined || value === null) {
    return '';
  }
  if (value instanceof Date) {
    return value.toISOString().toLowerCase();
  }
  return String(value)
    .trim()
    .toLowerCase()
    .normalize('NFKC');
}

function safeCall(fn, ...args) {
  if (typeof fn !== 'function') {
    return undefined;
  }
  try {
    return fn(...args);
  } catch (error) {
    if (window.Logger?.warn) {
      window.Logger.warn('TableFilter translator failed', { error: error.message });
    }
    return undefined;
  }
}

function getTableIdFromSelector(selector) {
  if (!selector || typeof selector !== 'string') {
    return null;
  }
  return selector.startsWith('#') ? selector.slice(1) : selector;
}

function getValueByPath(item, path) {
  if (!item || !path) {
    return undefined;
  }
  if (path === '*') {
    return item;
  }
  const segments = path.split('.');
  let current = item;
  for (const segment of segments) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[segment];
  }
  return current;
}

function flattenValue(value) {
  if (value === undefined || value === null) {
    return '';
  }
  if (Array.isArray(value)) {
    return value.map((item) => flattenValue(item)).join(' ');
  }
  if (typeof value === 'object') {
    if (value.value) {
      return flattenValue(value.value);
    }
    if ('display' in value) {
      return flattenValue(value.display);
    }
    return Object.values(value)
      .map((v) => flattenValue(v))
      .join(' ');
  }
  return String(value);
}

function toDate(value) {
  if (!value && value !== 0) {
    return null;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  if (typeof value === 'object') {
    if (typeof value.epochMs === 'number') {
      const date = new Date(value.epochMs);
      return Number.isNaN(date.getTime()) ? null : date;
    }
    if (value.utc) {
      const date = new Date(value.utc);
      return Number.isNaN(date.getTime()) ? null : date;
    }
    if (value.date) {
      return toDate(value.date);
    }
    if (value.start) {
      return toDate(value.start);
    }
    if (value.value) {
      return toDate(value.value);
    }
  }
  return null;
}

function cloneFiltersForStorage(filterContext) {
  return {
    status: Array.isArray(filterContext?.status) ? [...filterContext.status] : [],
    type: Array.isArray(filterContext?.type) ? [...filterContext.type] : [],
    account: Array.isArray(filterContext?.account) ? [...filterContext.account] : [],
    search: typeof filterContext?.search === 'string' ? filterContext.search : '',
    dateRange: filterContext?.dateRange ? { ...filterContext.dateRange } : null,
    custom: filterContext?.custom && typeof filterContext.custom === 'object' ? { ...filterContext.custom } : {},
  };
}

class TableFilter {
  constructor(registry) {
    this.registry = registry;
  }

  apply(tableType, filterInput, value, options = {}) {
    const config = this.registry.getConfig(tableType);
    if (!config) {
      if (window.Logger) {
        window.Logger.warn(`TableFilter.apply: Table type "${tableType}" not registered`, { page: 'unified-table-system' });
      } else {
        console.warn(`TableFilter.apply: Table type "${tableType}" not registered`);
      }
    }

    const baseFilters =
      options.mergeWith ||
      (options.mergeWithActiveFilters === true && window.TableDataRegistry?.getActiveFilters
        ? window.TableDataRegistry.getActiveFilters(options.tableIdOverride || tableType)
        : null);

    const context = this._buildFilterContext(tableType, filterInput, value, baseFilters);
    const dataset = this._resolveFullData(tableType, config);
    const filteredData = this._filterData(tableType, dataset, context, config);

    if (window.TableDataRegistry) {
      const identifier = options.tableIdOverride || tableType;
      window.TableDataRegistry.setFilteredData(identifier, filteredData, {
        tableId: options.tableIdOverride || getTableIdFromSelector(config?.tableSelector),
        skipPageReset: options.skipPageReset === true,
        filterContext: context.storage,
      });
    }

    return filteredData;
  }

  clear(tableType, options = {}) {
    const config = this.registry.getConfig(tableType);
    if (!config) {
      console.warn(`TableFilter.clear: Table type "${tableType}" not registered`);
      return [];
    }

    const dataset = this._resolveFullData(tableType, config);
    if (window.TableDataRegistry) {
      window.TableDataRegistry.setFilteredData(tableType, dataset, {
        tableId: getTableIdFromSelector(config.tableSelector),
        skipPageReset: options.skipPageReset === true,
        filterContext: {
          status: [],
          type: [],
          account: [],
          search: '',
          dateRange: null,
          custom: {},
        },
        clearFilters: true,
      });
    }

    return Array.isArray(dataset) ? [...dataset] : [];
  }

  _resolveFullData(tableType, config) {
    let data = [];
    if (window.TableDataRegistry) {
      data = window.TableDataRegistry.getFullData(tableType, { asReference: true });
    }
    if ((!Array.isArray(data) || data.length === 0) && config && typeof config.dataGetter === 'function') {
      try {
        const fetched = config.dataGetter();
        if (Array.isArray(fetched)) {
          data = fetched;
          if (window.TableDataRegistry) {
            window.TableDataRegistry.setFullData(tableType, fetched, {
              tableId: getTableIdFromSelector(config.tableSelector),
              resetFiltered: false,
            });
          }
        } else {
          data = [];
        }
      } catch (error) {
        console.error(`TableFilter: dataGetter failed for "${tableType}"`, error);
        data = [];
      }
    }
    return Array.isArray(data) ? data : [];
  }

  _buildFilterContext(tableType, filterInput, value, baseContext = null) {
    const contextInput = this._coerceContext(filterInput, value);
    const base = baseContext && typeof baseContext === 'object' ? baseContext : {};
    const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

    const resolveValue = (keys) => {
      for (const key of keys) {
        if (hasOwn(contextInput, key)) {
          return contextInput[key];
        }
      }
      for (const key of keys) {
        if (hasOwn(base, key)) {
          return base[key];
        }
      }
      return undefined;
    };

    const statusRaw = toArray(resolveValue(['status', 'statuses'])).filter((item) => item !== undefined && item !== null);
    const typeRaw = toArray(resolveValue(['type', 'types'])).filter((item) => item !== undefined && item !== null);
    const accountRaw = toArray(resolveValue(['account', 'accounts'])).filter((item) => item !== undefined && item !== null);

    const searchValue = resolveValue(['search']);
    const searchRaw = typeof searchValue === 'string' ? searchValue.trim() : '';

    const dateValue = resolveValue(['dateRange', 'date']);
    const dateRangeRaw = dateValue !== undefined ? dateValue : null;

    const mergedCustom = (() => {
      const baseCustom = base && typeof base.custom === 'object' && base.custom !== null ? { ...base.custom } : {};
      const inputCustom = contextInput.custom && typeof contextInput.custom === 'object' ? contextInput.custom : {};
      const merged = { ...baseCustom, ...inputCustom };

      Object.keys(merged).forEach((key) => {
        const raw = merged[key];
        if (raw === undefined || raw === null) {
          delete merged[key];
          return;
        }

        if (Array.isArray(raw)) {
          const sanitized = raw
            .filter((entry) => entry !== undefined && entry !== null && !ALL_KEYWORDS.has(normalizeText(entry)));
          if (sanitized.length === 0) {
            delete merged[key];
          } else {
            merged[key] = sanitized;
          }
          return;
        }

        if (typeof raw === 'string') {
          const normalized = normalizeText(raw);
          if (!normalized || ALL_KEYWORDS.has(normalized)) {
            delete merged[key];
          } else {
            merged[key] = raw.trim();
          }
          return;
        }

        if (typeof raw === 'object' && Object.keys(raw).length === 0) {
          delete merged[key];
        }
      });

      return merged;
    })();

    const storageContext = cloneFiltersForStorage({
      status: statusRaw,
      type: typeRaw,
      account: accountRaw,
      search: searchRaw,
      dateRange: dateRangeRaw,
      custom: mergedCustom,
    });

    const normalized = {
      status: this._normalizeEnumValues(tableType, statusRaw, STATUS_GENERAL_VALUES, STATUS_TRANSLATORS),
      type: this._normalizeEnumValues(tableType, typeRaw, TYPE_GENERAL_VALUES, TYPE_TRANSLATORS),
      account: this._normalizeAccounts(accountRaw),
      search: this._normalizeSearch(searchRaw),
      dateRange: this._normalizeDateRange(dateRangeRaw),
      custom: mergedCustom,
    };

    const hasActiveFilters =
      normalized.status.values.length > 0 ||
      normalized.type.values.length > 0 ||
      normalized.account.values.length > 0 ||
      Boolean(normalized.search.term) ||
      (normalized.dateRange.start !== null || normalized.dateRange.end !== null) ||
      Object.keys(mergedCustom).length > 0;

    return {
      normalized,
      storage: storageContext,
      hasActiveFilters,
    };
  }

  _coerceContext(filterInput, value) {
    if (filterInput && typeof filterInput === 'object' && !Array.isArray(filterInput)) {
      const coerced = {};
      Object.entries(filterInput).forEach(([key, val]) => {
        const alias = FILTER_ALIAS_MAP[key] || key;
        coerced[alias] = val;
      });
      return coerced;
    }

    if (typeof filterInput === 'string') {
      const alias = FILTER_ALIAS_MAP[filterInput] || filterInput;
      return { [alias]: value };
    }

    return {};
  }

  _normalizeEnumValues(tableType, values, generalUniverse, translatorFactories) {
    const set = new Set();
    const englishValues = [];
    const universe = new Set(generalUniverse);

    values.forEach((val) => {
      const normalized = this._reverseLookupValue(val, universe, translatorFactories);
      const normalizedKey = normalizeText(normalized);
      if (!ALL_KEYWORDS.has(normalizedKey) && normalizedKey) {
        englishValues.push(normalized);
        set.add(normalizedKey);
        universe.add(normalized);
      }
    });

    const override = getTableOverride(tableType);
    if (override?.enumValues && Array.isArray(override.enumValues)) {
      override.enumValues.forEach((val) => universe.add(val));
    }

    return {
      values: englishValues,
      set,
      universe,
    };
  }

  _normalizeAccounts(values) {
    const normalizedValues = [];
    const normalizedSet = new Set();

    values.forEach((val) => {
      const str = String(val).trim();
      if (!str) {
        return;
      }
      const key = normalizeText(str);
      if (!ALL_KEYWORDS.has(key) && key) {
        normalizedValues.push(str);
        normalizedSet.add(key);
      }
    });

    return {
      values: normalizedValues,
      set: normalizedSet,
    };
  }

  _normalizeSearch(search) {
    if (!search) {
      return { term: '', original: '' };
    }
    return {
      term: normalizeText(search),
      original: search,
    };
  }

  _normalizeDateRange(range) {
    if (!range) {
      return { start: null, end: null, preset: null };
    }

    if (typeof range === 'string') {
      const normalized = range.trim();
      if (!normalized || ALL_KEYWORDS.has(normalizeText(normalized))) {
        return { start: null, end: null, preset: normalized || null };
      }
      const translator = SAFE_DATE_RANGE_HELPER();
      if (typeof translator === 'function') {
        try {
          const resolved = translator(normalized);
          if (resolved && (resolved.startDate || resolved.endDate)) {
            return {
              start: resolved.startDate ? toDate(resolved.startDate) : null,
              end: resolved.endDate ? toDate(resolved.endDate) : null,
              preset: resolved.preset || normalized,
            };
          }
        } catch (error) {
          if (window.Logger?.warn) {
            window.Logger.warn('TableFilter date range translation failed', { error: error.message });
          }
        }
      }
      return { start: null, end: null, preset: normalized };
    }

    if (typeof range === 'object') {
      const startValue = range.start ?? range.startDate ?? range.from ?? null;
      const endValue = range.end ?? range.endDate ?? range.to ?? null;
      return {
        start: toDate(startValue),
        end: toDate(endValue),
        preset: range.preset || null,
      };
    }

    return { start: null, end: null, preset: null };
  }

  _reverseLookupValue(value, universe, translatorFactories) {
    const normalizedValue = normalizeText(value);
    if (!normalizedValue) {
      return '';
    }

    for (const option of universe) {
      if (normalizeText(option) === normalizedValue) {
        return option;
      }
    }

    for (const option of universe) {
      for (const factory of translatorFactories) {
        const translator = safeCall(factory);
        if (!translator) {
          continue;
        }
        const translated = safeCall(translator, option);
        if (translated && normalizeText(translated) === normalizedValue) {
          return option;
        }
      }
    }

    return value;
  }

  _resolveFilterConfig(tableType, config) {
    const override = getTableOverride(tableType) || {};
    const resolvedSearchFields = (() => {
      if (Array.isArray(override.searchFields)) {
        return override.searchFields;
      }
      if (Array.isArray(config.columns) && config.columns.length > 0) {
        const derived = config.columns
          .map((column) => {
            if (typeof column === 'string') {
              return column;
            }
            if (column && typeof column === 'object') {
              if (column.key) {
                return column.key;
              }
              if (column.field) {
                return column.field;
              }
            }
            return null;
          })
          .filter(Boolean);
        if (derived.length > 0) {
          return derived;
        }
      }
      return FALLBACK_SEARCH_FIELDS;
    })();

    return {
      statusFields: override.statusFields || DEFAULT_FILTER_CONFIG.statusFields,
      typeFields: override.typeFields || DEFAULT_FILTER_CONFIG.typeFields,
      accountFields: override.accountFields || DEFAULT_FILTER_CONFIG.accountFields,
      dateFields: override.dateFields || DEFAULT_FILTER_CONFIG.dateFields,
      searchFields: resolvedSearchFields,
    };
  }

  _filterData(tableType, dataset, context, config) {
    const dataArray = Array.isArray(dataset) ? dataset : [];
    if (!context.hasActiveFilters) {
      return [...dataArray];
    }

    const filterConfig = this._resolveFilterConfig(tableType, config);

    return dataArray.filter((item) => {
      return (
        this._matchesStatus(tableType, item, context.normalized, filterConfig) &&
        this._matchesType(tableType, item, context.normalized, filterConfig) &&
        this._matchesAccount(item, context.normalized, filterConfig) &&
        this._matchesDateRange(item, context.normalized, filterConfig) &&
        this._matchesSearch(item, context.normalized, filterConfig) &&
        this._matchesCustom(tableType, item, context, config)
      );
    });
  }

  _matchesStatus(tableType, item, normalized, filterConfig) {
    if (normalized.status.set.size === 0) {
      return true;
    }
    const fields = filterConfig.statusFields && filterConfig.statusFields.length > 0 ? filterConfig.statusFields : ['status'];
    const candidates = this._extractFieldValues(item, fields);
    if (candidates.length === 0) {
      return false;
    }

    const universe = new Set([...normalized.status.universe, ...candidates.map((value) => String(value))]);

    return candidates.some((candidate) => {
      const englishValue = this._reverseLookupValue(candidate, universe, STATUS_TRANSLATORS);
      const key = normalizeText(englishValue);
      return key && normalized.status.set.has(key);
    });
  }

  _matchesType(tableType, item, normalized, filterConfig) {
    if (normalized.type.set.size === 0) {
      return true;
    }
    const fields = filterConfig.typeFields && filterConfig.typeFields.length > 0 ? filterConfig.typeFields : ['type'];
    const candidates = this._extractFieldValues(item, fields);
    if (candidates.length === 0) {
      return false;
    }

    const universe = new Set([...normalized.type.universe, ...candidates.map((value) => String(value))]);

    return candidates.some((candidate) => {
      const englishValue = this._reverseLookupValue(candidate, universe, TYPE_TRANSLATORS);
      const key = normalizeText(englishValue);
      return key && normalized.type.set.has(key);
    });
  }

  _matchesAccount(item, normalized, filterConfig) {
    if (normalized.account.set.size === 0) {
      return true;
    }
    const fields = filterConfig.accountFields && filterConfig.accountFields.length > 0 ? filterConfig.accountFields : ['account_name', 'account'];
    const candidates = this._extractFieldValues(item, fields);
    if (candidates.length === 0) {
      return false;
    }
    return candidates.some((candidate) => normalized.account.set.has(normalizeText(candidate)));
  }

  _matchesDateRange(item, normalized, filterConfig) {
    const { start, end } = normalized.dateRange;
    if (start === null && end === null) {
      return true;
    }
    const fields = filterConfig.dateFields && filterConfig.dateFields.length > 0 ? filterConfig.dateFields : ['date', 'created_at'];
    const candidates = this._extractFieldValues(item, fields);
    if (candidates.length === 0) {
      return false;
    }
    return candidates.some((candidate) => {
      const date = toDate(candidate);
      if (!date) {
        return false;
      }
      if (start && date < start) {
        return false;
      }
      if (end && date > end) {
        return false;
      }
      return true;
    });
  }

  _matchesSearch(item, normalized, filterConfig) {
    if (!normalized.search.term) {
      return true;
    }
    const fields = filterConfig.searchFields && filterConfig.searchFields.length > 0 ? filterConfig.searchFields : FALLBACK_SEARCH_FIELDS;
    return fields.some((field) => {
      const value = getValueByPath(item, field);
      if (value === undefined || value === null) {
        return false;
      }
      const text = flattenValue(value);
      return normalizeText(text).includes(normalized.search.term);
    });
  }

  _matchesCustom(tableType, item, context, config) {
    const customFilters = context?.normalized?.custom;
    if (!customFilters || typeof customFilters !== 'object') {
      return true;
    }

    const overrideHandlers = getTableOverride(tableType)?.customHandlers || {};
    const configHandlers = config && typeof config === 'object' && config.customHandlers ? config.customHandlers : {};
    const handlerMap = {
      ...overrideHandlers,
      ...configHandlers,
    };

    return Object.entries(customFilters).every(([key, rawValue]) => {
      if (rawValue === undefined || rawValue === null) {
        return true;
      }
      if (Array.isArray(rawValue) && rawValue.length === 0) {
        return true;
      }
      if (typeof rawValue === 'string' && ALL_KEYWORDS.has(normalizeText(rawValue))) {
        return true;
      }

      const handler = handlerMap[key] || handlerMap.default;
      if (typeof handler === 'function') {
        try {
          return handler(item, rawValue, context);
        } catch (error) {
          if (window.Logger) {
            window.Logger.warn('TableFilter custom handler failed', {
              tableType,
              key,
              error: error?.message || error,
            }, { page: 'unified-table-system' });
          } else {
            console.warn('TableFilter custom handler failed', tableType, key, error);
          }
          return false;
        }
      }

      if (key === 'relatedType' || key === 'related_type') {
        return this._matchesRelatedType(item, rawValue);
      }

      return this._matchesGenericCustom(item, key, rawValue);
    });
  }

  _matchesGenericCustom(item, path, expected) {
    const candidate = getValueByPath(item, path);
    if (expected === undefined || expected === null) {
      return true;
    }

    if (Array.isArray(expected)) {
      if (expected.length === 0) {
        return true;
      }
      const normalizedTargets = expected
        .filter((entry) => entry !== undefined && entry !== null)
        .map((entry) => normalizeText(entry))
        .filter(Boolean);
      if (normalizedTargets.length === 0) {
        return true;
      }
      const candidateArray = Array.isArray(candidate) ? candidate : [candidate];
      return candidateArray.some((entry) => normalizedTargets.includes(normalizeText(entry)));
    }

    if (typeof expected === 'object') {
      return JSON.stringify(candidate) === JSON.stringify(expected);
    }

    return normalizeText(candidate) === normalizeText(expected);
  }

  _matchesRelatedType(item, rawValue) {
    const requiredTypes = this._normalizeRelatedTypeValues(rawValue);
    if (requiredTypes.length === 0) {
      return true;
    }

    const candidateSet = new Set();
    const register = (value) => {
      const normalized = this._normalizeRelatedTypeKey(value);
      if (normalized && normalized !== 'all') {
        candidateSet.add(normalized);
      }
    };

    register(item.related_type_id);
    register(item.related_type);
    register(item.relatedType);
    register(item.related_object_type);
    register(item.relatedObjectType);
    register(item.type);
    register(item.entity_type);
    register(item.entityType);
    register(item.linked_type);
    register(item.linkedType);
    register(item.linked_entity_type);
    register(item.category);
    if (item.meta && typeof item.meta === 'object') {
      register(item.meta.related_type);
      register(item.meta.relatedType);
    }
    if (item.details && typeof item.details === 'object') {
      register(item.details.related_type);
      register(item.details.relatedType);
    }

    return requiredTypes.some((required) => candidateSet.has(required));
  }

  _normalizeRelatedTypeValues(rawValue) {
    const values = Array.isArray(rawValue) ? rawValue : [rawValue];
    const normalized = [];
    values.forEach((value) => {
      const canonical = this._normalizeRelatedTypeKey(value);
      if (!canonical || canonical === 'all') {
        return;
      }
      normalized.push(canonical);
    });
    return normalized;
  }

  _normalizeRelatedTypeKey(value) {
    if (value === undefined || value === null) {
      return null;
    }

    if (typeof value === 'number') {
      return RELATED_TYPE_ID_TO_KEY[value] || null;
    }

    if (typeof value !== 'string') {
      return this._normalizeRelatedTypeKey(String(value));
    }

    const normalized = normalizeText(value);
    if (!normalized) {
      return null;
    }
    if (ALL_KEYWORDS.has(normalized)) {
      return 'all';
    }
    if (RELATED_TYPE_NORMALIZATION_MAP[normalized]) {
      return RELATED_TYPE_NORMALIZATION_MAP[normalized];
    }
    if (RELATED_TYPE_ID_TO_KEY[Number(normalized)]) {
      return RELATED_TYPE_ID_TO_KEY[Number(normalized)];
    }
    return normalized;
  }

  _extractFieldValues(item, fields) {
    const values = [];
    fields.forEach((field) => {
      const value = getValueByPath(item, field);
      if (Array.isArray(value)) {
        value.forEach((entry) => {
          if (entry !== undefined && entry !== null) {
            values.push(entry);
          }
        });
      } else if (value !== undefined && value !== null) {
        values.push(value);
      }
    });
    return values;
  }
}

// ===== TABLE STATE MANAGER =====

/**
 * TableStateManager - ניהול מצב מרכזי של טבלאות
 * 
 * אינטגרציה עם UnifiedCacheManager
 */
class TableStateManager {
  constructor(registry) {
    this.registry = registry;
  }

  /**
   * שמירת מצב טבלה
   * @param {string} tableType - סוג הטבלה
   * @param {Object} state - מצב לשמירה
   */
  async save(tableType, state) {
    if (!tableType || typeof tableType !== 'string') {
      return;
    }

    // שמירה רק דרך UnifiedCacheManager
    if (!window.UnifiedCacheManager) {
      if (window.Logger) {
        window.Logger.warn(`TableStateManager.save: UnifiedCacheManager not available for "${tableType}"`, { page: "unified-table-system" });
      }
      return;
    }

    try {
      const cacheKey = `tableState_${tableType}`;
      await window.UnifiedCacheManager.save(cacheKey, state, {
        layer: 'localStorage',
        ttl: null, // persistent
        syncToBackend: false
      });
    } catch (err) {
      if (window.Logger) {
        window.Logger.error(`TableStateManager.save: Cache save failed for "${tableType}"`, err, { page: "unified-table-system" });
      } else {
        console.error(`TableStateManager.save: Cache save failed for "${tableType}"`, err);
      }
    }
  }

  /**
   * טעינת מצב טבלה
   * @param {string} tableType - סוג הטבלה
   * @returns {Promise<Object|null>} מצב או null אם לא נמצא
   */
  async load(tableType) {
    if (!tableType || typeof tableType !== 'string') {
      return null;
    }

    // טעינה רק דרך UnifiedCacheManager
    if (!window.UnifiedCacheManager) {
      if (window.Logger) {
        window.Logger.warn(`TableStateManager.load: UnifiedCacheManager not available for "${tableType}"`, { page: "unified-table-system" });
      }
      return null;
    }

    try {
      const cacheKey = `tableState_${tableType}`;
      const state = await window.UnifiedCacheManager.get(cacheKey, {
        layer: 'localStorage'
      });
      return state || null;
    } catch (err) {
      if (window.Logger) {
        window.Logger.error(`TableStateManager.load: Cache load failed for "${tableType}"`, err, { page: "unified-table-system" });
      } else {
        console.error(`TableStateManager.load: Cache load failed for "${tableType}"`, err);
      }
      return null;
    }
  }
}

// ===== TABLE STYLE MANAGER =====

/**
 * TableStyleManager - ניהול סגנונות מרכזי של טבלאות
 * 
 * ניהול רוחב עמודות דינמי
 * אינטגרציה עם CSS variables
 */
class TableStyleManager {
  constructor(registry) {
    this.registry = registry;
  }

  /**
   * קבלת רוחב עמודות של טבלה
   * @param {string} tableType - סוג הטבלה
   * @returns {Object} מיפוי עמודה -> רוחב
   */
  getColumnWidths(tableType) {
    const config = this.registry.getConfig(tableType);
    if (!config || !config.styles || !config.styles.columnWidths) {
      return {};
    }
    return config.styles.columnWidths;
  }

  /**
   * החלת סגנונות על טבלה
   * @param {string} tableType - סוג הטבלה
   */
  applyStyles(tableType) {
    const config = this.registry.getConfig(tableType);
    if (!config) {
      return;
    }

    const table = document.querySelector(config.tableSelector);
    if (!table) {
      return;
    }

    // החלת CSS variables אם מוגדרים
    if (config.styles && config.styles.cssVariables) {
      Object.entries(config.styles.cssVariables).forEach(([key, value]) => {
        table.style.setProperty(key, value);
      });
    }
  }
}

// ===== TABLE EVENT HANDLER =====

/**
 * TableEventHandler - טיפול באירועים מרכזי של טבלאות
 * 
 * מחליף את event-handler-manager לטבלאות
 */
class TableEventHandler {
  constructor(registry, sorter) {
    this.registry = registry;
    this.sorter = sorter;
  }

  /**
   * הגדרת event handlers לסידור
   * @param {string} tableType - סוג הטבלה
   */
  setupSortHandlers(tableType) {
    const config = this.registry.getConfig(tableType);
    if (!config) {
      return;
    }

    const table = document.querySelector(config.tableSelector);
    if (!table) {
      return;
    }

    // חיפוש כל ה-sortable headers
    const sortableHeaders = table.querySelectorAll('.sortable-header');
    sortableHeaders.forEach((header, index) => {
      // הסרת onclick handlers קיימים
      header.removeAttribute('onclick');
      
      // הוספת event listener חדש
      header.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // סידור לפי עמודה
        if (this.sorter) {
          this.sorter.sort(tableType, index);
        }
      });
    });
  }

  /**
   * הגדרת event handlers לסינון
   * @param {string} tableType - סוג הטבלה
   */
  setupFilterHandlers(tableType) {
    // TODO: מימוש בהמשך
  }
}

// ===== UNIFIED TABLE SYSTEM =====

/**
 * UnifiedTableSystem - מערכת טבלאות מרכזית מאוחדת
 * 
 * מאחדת את כל המנגנונים:
 * - TableRegistry - רישום טבלאות
 * - TableRenderer - רינדור
 * - TableSorter - סידור
 * - TableFilter - סינון
 * - TableStateManager - ניהול מצב
 * - TableStyleManager - ניהול סגנונות
 * - TableEventHandler - טיפול באירועים
 */
window.UnifiedTableSystem = (function() {
  const registry = new TableRegistry();
  const renderer = new TableRenderer(registry);
  const sorter = new TableSorter(registry);
  const filter = new TableFilter(registry);
  const stateManager = new TableStateManager(registry);
  const styleManager = new TableStyleManager(registry);
  const eventHandler = new TableEventHandler(registry, sorter);

  return {
    registry,
    renderer,
    sorter,
    filter,
    state: stateManager,
    styles: styleManager,
    events: eventHandler
  };
})();

// ===== EXPORT FOR GLOBAL USE =====

// Note: window.sortTable is defined in tables.js
// The actual implementation in tables.js checks the registry first

// Export render
window.renderTable = function(tableType, data, options) {
  if (!window.UnifiedTableSystem) {
    console.warn('renderTable: UnifiedTableSystem not available');
    return;
  }
  return window.UnifiedTableSystem.renderer.render(tableType, data, options);
};

// Export update
window.updateTable = function(tableType, data) {
  if (!window.UnifiedTableSystem) {
    console.warn('updateTable: UnifiedTableSystem not available');
    return;
  }
  return window.UnifiedTableSystem.renderer.update(tableType, data);
};

// Export filter
window.filterTable = function(tableType, filterType, value) {
  if (!window.UnifiedTableSystem) {
    console.warn('filterTable: UnifiedTableSystem not available');
    return;
  }
  return window.UnifiedTableSystem.filter.apply(tableType, filterType, value);
};

// System ready
if (window.Logger) {
  window.Logger.info('✅ UnifiedTableSystem loaded', { page: "unified-table-system" });
} else {
  console.log('✅ UnifiedTableSystem loaded');
}

