/**
 * Table Mappings - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains centralized table column mappings for all tables in TikTrack.
 * All sorting and data display functions use these mappings to ensure consistency.
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/TABLE_MAPPING_SYSTEM.md
 * 
 * Author: TikTrack Development Team
 * Version: 1.1
 * Last Updated: 2025-01-27
 */

// ===== LOADING TRACKING =====
console.log('🔵 [table-mappings.js] FILE LOADING STARTED');
console.log('🔵 [table-mappings.js] Current window.TABLE_COLUMN_MAPPINGS:', window.TABLE_COLUMN_MAPPINGS ? `exists (${Object.keys(window.TABLE_COLUMN_MAPPINGS).length} keys)` : 'NOT FOUND');

// ===== TABLE COLUMN MAPPINGS =====
const TABLE_COLUMN_MAPPINGS = {
  // טבלת תכנונים (Trade Plans) - Trade Plans Page Structure (מוצג בפועל)
  'trade_plans': [
    'ticker_symbol',         // 0 - טיקר (מחושב)
    'created_at',            // 1 - תאריך
    'status',                // 2 - סטטוס
    'investment_type',       // 3 - סוג
    'side',                  // 4 - צד
    'quantity',              // 5 - כמות (מחושב)
    'target_price',          // 6 - מחיר
    'planned_amount',        // 7 - השקעה
    'reward',                // 8 - סיכוי (מחושב)
    'risk',                  // 9 - סיכון (מחושב)
    'ratio',                 // 10 - יחס (מחושב)
    'updated_at',            // 11 - עודכן
  ],

  // טבלת טריידים (Trades) - Trades Page Structure (מוצג בפועל)
  'trades': [
    'ticker_symbol',         // 0 - טיקר
    'current_price',         // 1 - מחיר (מחושב)
    'daily_change',          // 2 - שינוי (מחושב)
    'position_quantity',     // 3 - פוזיציה (מחושב)
    'position_pl_percent',   // 4 - P/L% (מחושב)
    'position_pl_value',     // 5 - P/L (מחושב)
    'status',                // 6 - סטטוס
    'investment_type',       // 7 - סוג
    'side',                  // 8 - צד
    'account_name',          // 9 - חשבון מסחר
    'created_at',            // 10 - נוצר ב
    'closed_at',             // 11 - נסגר ב
    'updated_at',            // 12 - עודכן
  ],

  // טבלת חשבונות מסחר (Trading Accounts) - Trading Accounts Page Structure (מוצג בפועל)
  'trading_accounts': [
    'name',                  // 0 - שם החשבון מסחר
    'currency_id',           // 1 - מטבע
    'cash_balance',          // 2 - יתרה (מחושב)
    'positions_count',       // 3 - פוזיציות (מחושב)
    'total_pl',              // 4 - רווח/הפסד
    'status',                // 5 - סטטוס
    'updated_at',            // 6 - עודכן
  ],

  // טבלת טיקרים (Tickers) - Tickers Page Structure (מוצג בפועל)
  'tickers': [
    'symbol',                // 0 - שם הטיקר (symbol)
    'current_price',         // 1 - מחיר נוכחי
    'change_percent',        // 2 - שינוי יומי
    'volume',                // 3 - נפח
    'status',                // 4 - סטטוס
    'type',                  // 5 - סוג
    'name',                  // 6 - שם החברה
    'currency_id',           // 7 - מטבע
    'updated_at',            // 8 - עודכן ב
  ],

  // טבלת פריטים מקושרים (Linked Items) - Entity Details Modal
  'linked_items': [
    'linked_to',        // 0 - מקושר ל (משולב: type + name)
    'status',           // 1 - סטטוס (Status)
    'side',             // 2 - צד (Long/Short)
    'investment_type',  // 3 - סוג השקעה (Investment Type)
    'created_at',       // 4 - תאריך יצירה
  ],

  // טבלת ביצועים (Executions) - Executions Page Structure (מוצג בפועל)
  'executions': [
    'trade_id',              // 0 - טרייד משויך
    'ticker_symbol',         // 1 - טיקר
    'action',                // 2 - פעולה (קניה/מכירה)
    'account_name',          // 3 - חשבון מסחר
    'quantity',              // 4 - כמות
    'price',                 // 5 - מחיר
    'realized_pl',           // 6 - Realized P/L
    'mtm_pl',                // 7 - MTM P/L
    'date',                  // 8 - תאריך
    'source',                // 9 - מקור
    'updated_at',            // 10 - עודכן
  ],

  // טבלת תזרימי מזומנים (Cash Flows) - Cash Flows Page Structure (מוצג בפועל)
  'cash_flows': [
    'account_name',          // 0 - חשבון מסחר
    'type',                  // 1 - סוג
    'amount',                // 2 - סכום
    'date',                  // 3 - תאריך
    'description',           // 4 - תיאור
    'source',                // 5 - מקור
    'updated_at',            // 6 - עודכן
  ],

  // טבלת היסטוריית ייבוא נתונים (Data Import History)
  'import_history': [
    { key: 'id', sortType: 'numeric' },                    // 0 - מספר סשן
    { key: 'trading_account_name', sortType: 'string' },   // 1 - חשבון מסחר
    { key: 'provider_name', sortType: 'string' },          // 2 - ספק נתונים
    { key: 'file_name', sortType: 'string' },              // 3 - שם קובץ
    { key: 'status_label', sortType: 'string' },           // 4 - סטטוס
    { key: 'total_records', sortType: 'numeric' },         // 5 - סה"כ רשומות
    { key: 'imported_records', sortType: 'numeric' },      // 6 - רשומות שיובאו
    { key: 'skipped_records', sortType: 'numeric' },       // 7 - רשומות שהושמטו
    { key: 'created_at', sortType: 'dateEnvelope' },       // 8 - נוצר בתאריך
    { key: 'completed_at', sortType: 'dateEnvelope' }      // 9 - עודכן לאחרונה
  ],

  // טבלת התראות (Alerts) - Alerts Page Structure (מוצג בפועל)
  'alerts': [
    'related_object',        // 0 - קשור ל (מחושב)
    'ticker_symbol',         // 1 - טיקר (מחושב)
    'condition',             // 2 - תנאי (מחושב)
    'status',                // 3 - סטטוס
    'is_triggered',          // 4 - הופעל
    'condition_source',      // 5 - תנאי (מקור)
    'created_at',            // 6 - נוצר ב
    'triggered_at',          // 7 - הופעל ב
    'expiry_date',           // 8 - תאריך תפוגה
    'updated_at',            // 9 - עודכן
  ],

  // טבלת הערות (Notes) - Notes Page Structure (מוצג בפועל)
  // מציג: אובייקט מקושר, תוכן, תאריך, קובץ מצורף, פעולות
  'notes': [
    'related_object',        // 0 - אובייקט מקושר (מחושב מהאובייקט המקושר)
    'content',               // 1 - תוכן ההערה
    'created_at',            // 2 - תאריך (תאריך ההערה)
    'attachment',            // 3 - קובץ מצורף
    'updated_at',            // 4 - עודכן
    // Note: actions column is not part of the mapping (handled separately)
  ],

  // טבלת תנועות חשבון (Account Activity) - Trading Accounts Page Structure
  'account_activity': [
    'date',                  // 0 - תאריך
    'type',                  // 1 - סוג
    'subtype',               // 2 - תת-סוג
    'ticker',                // 3 - טיקר
    'amount',                // 4 - סכום
    'currency',              // 5 - מטבע
    'balance',               // 6 - יתרה שוטפת
  ],

  'designs': [
    'id',              // 0 - מזהה
    'name',            // 1 - שם
    'description',     // 2 - תיאור
    'ticker',          // 3 - טיקר
    'status',          // 4 - סטטוס
    'created_at',       // 5 - נוצר ב
  ],

  'currencies': [
    'id',              // 0 - מזהה
    'symbol',          // 1 - סמל
    'name',            // 2 - שם
    'usd_rate',        // 3 - שער דולר
    'usd_rate_default', // 4 - שער דולר ברירת מחדל
    'created_at',       // 5 - נוצר ב
  ],

  'note_relation_types': [
    'id',              // 0 - מזהה
    'note_relation_type', // 1 - סוג קשר
    'created_at',       // 2 - נוצר ב
  ],

  // מערכת תגיות - קטגוריות
  'tag_categories': [
    'name',           // 0 - שם קטגוריה
    'description',    // 1 - תיאור
    'tags_count',     // 2 - כמות תגיות פעילות
    'updated_at'      // 3 - עודכן
  ],

  // מערכת תגיות - תגיות
  'tags': [
    'name',           // 0 - שם תגית
    'category_name',  // 1 - קטגוריה
    'description',    // 2 - תיאור
    'usage_count',    // 3 - שימושים
    'last_used_at'    // 4 - שימוש אחרון
  ],

  // מערכת תגיות - טבלת שימוש מובילה
  'tag_usage_leaderboard': [
    'tag_name',       // 0 - שם תגית
    'category_name',  // 1 - קטגוריה
    'usage_count',    // 2 - מספר שימושים
    'top_entities'    // 3 - ישויות מובילות (מטופל ייעודית ברינדור)
  ],

  // טבלת פוזיציות (Positions) - Positions by Account Table
  'positions': [
    'ticker_symbol',           // 0 - סימבול
    'ticker_name',             // 1 - נוכחי (שם הטיקר)
    'quantity',                // 2 - כמות
    'side',                     // 3 - צד
    'average_price_net',        // 4 - מחיר ממוצע
    'market_value',            // 5 - שווי שוק
    'unrealized_pl',           // 6 - רווח/הפסד לא מוכר
    'percent_of_account',      // 7 - אחוז מהחשבון
  ],

  // טבלת פורטפוליו (Portfolio) - Full Portfolio Table
  'portfolio': [
    'side',                    // 0 - צד
    'ticker_symbol',           // 1 - סימבול
    'ticker_name',             // 2 - נוכחי (שם הטיקר)
    'quantity',                // 3 - כמות
    'average_price_net',       // 4 - מחיר ממוצע
    'market_value',            // 5 - שווי שוק
    'unrealized_pl',           // 6 - רווח/הפסד לא מוכר
    'account_name',            // 7 - חשבון
    'percent_of_portfolio',    // 8 - אחוז מהפורטפוליו
  ],

  // טבלת ביצועים בפוזיציה (Position Executions) - Position Details Modal
  'position_executions': [
    'date',                    // 0 - תאריך
    'action',                  // 1 - פעולה
    'quantity',                // 2 - כמות
    'price',                   // 3 - מחיר
    'fee',                     // 4 - עמלה
    'total',                   // 5 - סה"כ
  ],

  // טבלת המלצות שיוך לטריידים (Trade Suggestions) - Executions Page
  'trade_suggestions': [
    { key: 'checkbox', sortable: false },               // 0 - בחירה (לא ניתן למיין)
    { key: 'score', sortType: 'numeric' },              // 1 - ציון התאמה
    { key: 'execution_id', sortType: 'numeric' },       // 2 - מזהה ביצוע (להצגת כרטיס ביצוע)
    { key: 'trade_id', sortType: 'numeric' },           // 3 - מזהה טרייד (להצגת כרטיס טרייד)
    { key: 'account_name', sortType: 'string' },        // 4 - חשבון מסחר
    { key: 'trade_created_at', sortType: 'dateEnvelope' }, // 5 - תאריך טרייד (Envelope)
    { key: 'status', sortType: 'string' },              // 6 - סטטוס טרייד
    { key: 'side', sortType: 'string' },                // 7 - צד (Long/Short)
    { key: 'investment_type', sortType: 'string' },     // 8 - סוג השקעה
    { key: 'match_reasons_text', sortType: 'string' },  // 9 - סיבות התאמה (טקסט חופשי)
    { key: 'actions', sortable: false },                // 10 - פעולות (לא ניתן למיין)
  ],

  // טבלת ניטור לינטר - Lint Monitor Issues
  'lint_monitor_issues': [
    { key: 'tool', sortType: 'string' },        // 0 - כלי הלינטר (ESLint / Stylelint וכו')
    { key: 'severity', sortType: 'string' },    // 1 - חומרה (error/warning/info)
    { key: 'file', sortType: 'string' },        // 2 - קובץ
    { key: 'rule', sortType: 'string' },        // 3 - כלל שהופעל
    { key: 'message', sortType: 'string' },     // 4 - הודעה
    { key: 'line', sortType: 'numeric' },       // 5 - מיקום שורה
  ],
};

const TABLE_COLUMN_SORT_TYPES = {
  alerts: {
    created_at: 'dateEnvelope',
    triggered_at: 'dateEnvelope',
    expiry_date: 'dateEnvelope',
    updated_at: 'dateEnvelope',
    status: 'string',
    is_triggered: 'string'
  },
  trade_suggestions: {
    score: 'numeric',
    execution_id: 'numeric',
    trade_id: 'numeric',
    account_name: 'string',
    trade_created_at: 'dateEnvelope',
    status: 'string',
    side: 'string',
    investment_type: 'string',
    match_reasons_text: 'string'
  },
  executions: {
    date: 'date',
    updated_at: 'date'
  },
  trades: {
    created_at: 'date',
    closed_at: 'date',
    updated_at: 'date'
  },
  trade_plans: {
    created_at: 'date',
    updated_at: 'date'
  },
  cash_flows: {
    date: 'date',
    updated_at: 'date'
  },
  import_history: {
    id: 'numeric',
    trading_account_name: 'string',
    provider_name: 'string',
    file_name: 'string',
    status_label: 'string',
    total_records: 'numeric',
    imported_records: 'numeric',
    skipped_records: 'numeric',
    created_at: 'dateEnvelope',
    completed_at: 'dateEnvelope'
  },
  tickers: {
    symbol: 'string',
    current_price: 'numeric',
    change_percent: 'numeric',
    volume: 'numeric',
    status: 'string',
    type: 'string',
    name: 'string',
    currency_id: 'string',
    updated_at: 'dateEnvelope'
  },
  notes: {
    created_at: 'date',
    updated_at: 'date'
  },
  linked_items: {
    created_at: 'date'
  },
  trading_accounts: {
    updated_at: 'dateEnvelope'
  },
  lint_monitor_issues: {
    tool: 'string',
    severity: 'string',
    file: 'string',
    rule: 'string',
    message: 'string',
    line: 'numeric'
  }
};

const DEFAULT_DATE_KEYS = [
  'date',
  'created_at',
  'opened_at',
  'trade_created_at',
  'closed_at',
  'triggered_at',
  'completed_at',
  'expiry_date',
  'updated_at',
  'yahoo_updated_at'
];

const DEFAULT_STATUS_KEYS = [
  'status',
  'state',
  'execution_status',
  'order_status',
  'is_triggered',
  'severity'
];

const DEFAULT_TICKER_KEYS = [
  'ticker_symbol',
  'symbol',
  'linked_to',
  'account_name',
  'name',
  'related_object'
];

function normalizeColumnEntry(entry) {
  if (!entry) {
    return { key: null };
  }
  if (typeof entry === 'string') {
    return { key: entry };
  }
  if (typeof entry === 'object') {
    if (entry.key) {
      return { ...entry };
    }
    if (entry.name) {
      return { ...entry, key: entry.name };
    }
  }
  return { key: null };
}

const TABLE_COLUMN_KEYS = Object.fromEntries(
  Object.entries(TABLE_COLUMN_MAPPINGS).map(([tableType, columns]) => {
    const keys = columns.map(entry => normalizeColumnEntry(entry).key).filter(key => key !== null);
    return [tableType, keys];
  })
);

function getColumnIndexByKey(tableType, columnKey) {
  if (!columnKey) {
    return -1;
  }
  const keys = TABLE_COLUMN_KEYS[tableType];
  if (!keys) {
    return -1;
  }
  return keys.indexOf(columnKey);
}

function findFirstMatchingColumn(tableType, candidates = []) {
  if (!Array.isArray(candidates) || candidates.length === 0) {
    return null;
  }

  for (const candidate of candidates) {
    const columnIndex = getColumnIndexByKey(tableType, candidate);
    if (columnIndex !== -1) {
      return {
        columnIndex,
        key: candidate
      };
    }
  }

  return null;
}

function buildCanonDefaultSortChain(tableType) {
  const seenIndices = new Set();
  const chain = [];

  const dateMatch = findFirstMatchingColumn(tableType, DEFAULT_DATE_KEYS);
  if (dateMatch && !seenIndices.has(dateMatch.columnIndex)) {
    seenIndices.add(dateMatch.columnIndex);
    chain.push({
      columnIndex: dateMatch.columnIndex,
      direction: 'desc',
      key: dateMatch.key,
      priority: 'date'
    });
  }

  const statusMatch = findFirstMatchingColumn(tableType, DEFAULT_STATUS_KEYS);
  if (statusMatch && !seenIndices.has(statusMatch.columnIndex)) {
    seenIndices.add(statusMatch.columnIndex);
    chain.push({
      columnIndex: statusMatch.columnIndex,
      direction: 'asc',
      key: statusMatch.key,
      priority: 'status'
    });
  }

  const tickerMatch = findFirstMatchingColumn(tableType, DEFAULT_TICKER_KEYS);
  if (tickerMatch && !seenIndices.has(tickerMatch.columnIndex)) {
    seenIndices.add(tickerMatch.columnIndex);
    chain.push({
      columnIndex: tickerMatch.columnIndex,
      direction: 'asc',
      key: tickerMatch.key,
      priority: 'ticker'
    });
  }

  if (chain.length === 0) {
    const keys = TABLE_COLUMN_KEYS[tableType] || [];
    if (keys.length > 0) {
      chain.push({
        columnIndex: 0,
        direction: 'asc',
        key: keys[0],
        priority: 'fallback'
      });
    }
  }

  return chain;
}

function resolveUserTimezone() {
  if (window.currentPreferences && window.currentPreferences.timezone) {
    if (typeof window.setUserTimezone === 'function') {
      window.setUserTimezone(window.currentPreferences.timezone);
    }
    return window.currentPreferences.timezone;
  }
  if (window.PreferencesSystem?.manager?.currentPreferences?.timezone) {
    if (typeof window.setUserTimezone === 'function') {
      window.setUserTimezone(window.PreferencesSystem.manager.currentPreferences.timezone);
    }
    return window.PreferencesSystem.manager.currentPreferences.timezone;
  }
  try {
    const fallbackTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    if (typeof window.setUserTimezone === 'function') {
      window.setUserTimezone(fallbackTimezone);
    }
    return fallbackTimezone;
  } catch (error) {
    console.warn('⚠️ Unable to resolve user timezone, falling back to UTC', error);
    return 'UTC';
  }
}

function buildDateEnvelope(rawValue, options = {}) {
  if (!rawValue && rawValue !== 0) {
    return null;
  }

  if (typeof rawValue === 'object' && (rawValue.epochMs !== undefined || rawValue.utc || rawValue.local)) {
    return rawValue;
  }

  let epochMs = null;
  let sourceString = null;

  if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
    epochMs = rawValue;
  } else if (rawValue instanceof Date) {
    epochMs = rawValue.getTime();
    sourceString = rawValue.toISOString();
  } else if (typeof rawValue === 'string') {
    const trimmed = rawValue.trim();
    if (trimmed) {
      const parsed = Date.parse(trimmed);
      if (!Number.isNaN(parsed)) {
        epochMs = parsed;
        sourceString = trimmed;
      }
    }
  }

  if (epochMs === null) {
    return null;
  }

  const utc = new Date(epochMs).toISOString();
  const timezone = options.timezone || resolveUserTimezone();
  const local = sourceString || utc;
  let display = '-';

  try {
    if (typeof window.formatDate === 'function') {
      display = window.formatDate(local);
    } else {
      display = new Date(epochMs).toLocaleDateString('he-IL');
    }
  } catch {
    display = new Date(epochMs).toISOString().split('T')[0];
  }

  return {
    utc,
    epochMs,
    local,
    timezone,
    display
  };
}

/**
 * פונקציה לקבלת ערך עמודה מפריט נתונים
 * Function to get column value from data item
 *
 * This is the main function used by the sorting system to extract values
 * from data items for comparison during sorting operations.
 *
 * @param {Object} item - פריט הנתונים / Data item object
 * @param {number} columnIndex - אינדקס העמודה / Column index (0-based)
 * @param {string} tableType - סוג הטבלה / Table type identifier
 * @returns {string} ערך העמודה / Column value as string
 */
function getColumnValue(item, columnIndex, tableType) {
  const columns = TABLE_COLUMN_MAPPINGS[tableType] || [];
  const columnMeta = normalizeColumnEntry(columns[columnIndex]);
  const fieldName = columnMeta.key;

  const parseSortDateValue = (rawValue) => {
    if (!rawValue && rawValue !== 0) {
      return 0;
    }
    if (rawValue instanceof Date) {
      return rawValue.getTime();
    }
    if (typeof rawValue === 'number' && Number.isFinite(rawValue)) {
      return rawValue;
    }
    if (typeof rawValue === 'string') {
      const trimmed = rawValue.trim();
      if (!trimmed) {
        return 0;
      }

      const dateMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
      if (dateMatch) {
        const datePart = dateMatch[1];
        const timestamp = Date.parse(`${datePart}T00:00:00Z`);
        if (!Number.isNaN(timestamp)) {
          return timestamp;
        }
      }

      const parsed = Date.parse(trimmed);
      if (!Number.isNaN(parsed)) {
        const normalized = new Date(parsed);
        normalized.setHours(0, 0, 0, 0);
        return normalized.getTime();
      }
    }
    return 0;
  };

  if (!fieldName) {
    // No column mapping found for table type and column index
    return '';
  }

  if (tableType === 'linked_items') {
    if (fieldName === 'linked_to') {
      return (item.linked_to || '').toString();
    }
    if (fieldName === 'status') {
      return (item.status || '').toString();
    }
    if (fieldName === 'side') {
      return (item.side || '').toString();
    }
    if (fieldName === 'investment_type') {
      return (item.investment_type || '').toString();
    }
    if (fieldName === 'created_at') {
      const dateValue = item.created_at || item.updated_at || '';
      return dateValue ? new Date(dateValue).getTime() : 0;
    }
    return item[fieldName] || '';
  }
  
  // Database Display Page - Direct field mapping
  // Note: Some tables have calculated fields that need special handling
  if (tableType === 'positions' || tableType === 'portfolio') {
    // Return the field value directly from the item
    return item[fieldName] || '';
  }
  
  // Account Activity table - special handling for field name mapping
  if (tableType === 'account_activity') {
    // Map field names to actual data structure
    if (fieldName === 'ticker') {
      return item.ticker_symbol || '';
    }
    if (fieldName === 'currency') {
      return item.currency_symbol || '';
    }
    if (fieldName === 'subtype') {
      return item.sub_type || item.subtype || item.action || '';
    }
    // For other fields, return directly
    return item[fieldName] || '';
  }
  
  // Position Executions table - special handling for calculated 'total' field
  if (tableType === 'position_executions') {
    if (fieldName === 'total') {
      // Calculate total if not present: (quantity * price) + fee
      if (item.total !== undefined && item.total !== null) {
        return item.total;
      }
      const quantity = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.price) || 0;
      const fee = parseFloat(item.fee) || 0;
      return (quantity * price) + fee;
    }
    // For other fields, return directly
    return item[fieldName] || '';
  }
  
  // Trading Accounts table - special handling for calculated fields
  if (tableType === 'trading_accounts') {
    if (fieldName === 'cash_balance') {
      // This is calculated in real-time via AccountActivityService
      return item.cash_balance || item.balance || 0;
    }
    if (fieldName === 'positions_count') {
      // This is calculated
      return item.positions_count || item.positions || 0;
    }
    // For other fields, return directly
    return item[fieldName] || '';
  }
  
  // Executions table - special handling for calculated fields
  if (tableType === 'executions') {
    if (fieldName === 'ticker_symbol') {
      // Get ticker symbol from various sources
      if (item.ticker && item.ticker.symbol) {
        return item.ticker.symbol;
      }
      if (item.ticker_symbol) {
        return item.ticker_symbol;
      }
      return item.ticker_id || '';
    }
    if (fieldName === 'account_name') {
      // Get account name
      if (item.account && item.account.name) {
        return item.account.name;
      }
      return item.account_name || item.account_id || '';
    }
    // For other fields, return directly
    return item[fieldName] || '';
  }
  
  // Cash flows table - special handling for calculated fields
  if (tableType === 'cash_flows') {
    if (fieldName === 'account_name') {
      // Get account name
      if (item.account && item.account.name) {
        return item.account.name;
      }
      return item.account_name || item.account_id || '';
    }
    // For other fields, return directly
    return item[fieldName] || '';
  }
  
  // Tickers table - special handling for calculated/display fields
  if (tableType === 'tickers') {
    if (fieldName === 'symbol') {
      return (item.symbol || '').toString();
    }
    if (fieldName === 'current_price') {
      const rawValue = item.current_price ?? item.price ?? item.latest_price ?? null;
      if (typeof rawValue === 'number') {
        return Number.isFinite(rawValue) ? rawValue : 0;
      }
      if (typeof rawValue === 'string') {
        const cleaned = rawValue.replace(/[^0-9.\-]/g, '');
        const parsed = parseFloat(cleaned);
        if (!Number.isNaN(parsed)) {
          return parsed;
        }
      }
      return 0;
    }
    if (fieldName === 'change_percent') {
      const rawValue = item.change_percent
        ?? item.change_pct_day
        ?? item.daily_change_percent
        ?? item.daily_change
        ?? null;
      if (typeof rawValue === 'number') {
        return Number.isFinite(rawValue) ? rawValue : 0;
      }
      if (typeof rawValue === 'string') {
        const cleaned = rawValue.replace(/[^0-9.\-]/g, '');
        const parsed = parseFloat(cleaned);
        if (!Number.isNaN(parsed)) {
          return parsed;
        }
      }
      return 0;
    }
    if (fieldName === 'volume') {
      const rawValue = item.volume ?? item.daily_volume ?? item.latest_volume ?? null;
      if (typeof rawValue === 'number') {
        return Number.isFinite(rawValue) ? rawValue : 0;
      }
      if (typeof rawValue === 'string') {
        const cleaned = rawValue.replace(/[^0-9.\-]/g, '');
        const parsed = parseInt(cleaned, 10);
        if (!Number.isNaN(parsed)) {
          return parsed;
        }
      }
      return 0;
    }
    if (fieldName === 'currency_id') {
      if (item.currency && (item.currency.symbol || item.currency.code)) {
        return item.currency.symbol || item.currency.code;
      }
      if (item.currency_symbol) {
        return item.currency_symbol;
      }
      if (item.currency_code) {
        return item.currency_code;
      }
      const currencyId = item.currency_id;
      if (currencyId === 0) {
        return '0';
      }
      return currencyId !== undefined && currencyId !== null ? currencyId.toString() : '';
    }
    if (fieldName === 'status') {
      return (item.status || '').toString();
    }
    if (fieldName === 'type') {
      return (item.type || '').toString();
    }
    if (fieldName === 'name') {
      return item.name || '';
    }
    if (fieldName === 'yahoo_updated_at') {
      const dateValue = item.yahoo_updated_at || item.updated_at || item.last_price_update || null;
      return buildDateEnvelope(dateValue);
    }
    // For other fields, return directly
    return item[fieldName] || '';
  }
  
  // Notes table - special handling for calculated fields
  if (tableType === 'notes') {
    if (fieldName === 'related_object') {
      // This is a calculated field - we need to get it from the display
      // For sorting, we'll use related_type_id and related_id
      const typeId = item.related_type_id || '';
      const relatedId = item.related_id || '';
      return `${typeId}_${relatedId}`; // Combined for sorting
    }
    if (fieldName === 'content') {
      // Return content for sorting (will be sorted by text)
      return item.content || '';
    }
    if (fieldName === 'attachment') {
      // Return attachment filename for sorting
      return item.attachment || '';
    }
    // For other fields (created_at, etc.), return directly
    return item[fieldName] || '';
  }
  
  // Alerts table - special handling for calculated fields
  if (tableType === 'alerts') {
    if (fieldName === 'related_object') {
      // This is a calculated field - we'll use related_type_id and related_id for sorting
      const typeId = item.related_type_id || '';
      const relatedId = item.related_id || '';
      return `${typeId}_${relatedId}`; // Combined for sorting
    }
    if (fieldName === 'ticker_symbol') {
      // Try to get ticker symbol from various sources
      if (item.ticker && item.ticker.symbol) {
        return item.ticker.symbol;
      }
      if (item.ticker_symbol) {
        return item.ticker_symbol;
      }
      // Fallback to ticker_id if available
      return item.ticker_id || '';
    }
    if (fieldName === 'condition' || fieldName === 'condition_source') {
      // Same as condition - it's a calculated field
      if (item.condition_attribute &&
          item.condition_operator &&
          item.condition_number &&
          window.translateConditionFields) {
        return window.translateConditionFields(
          item.condition_attribute,
          item.condition_operator,
          item.condition_number,
        );
      }
      return item.condition || '-';
    }
    if (fieldName === 'status') {
      switch (item.status) {
      case 'open': return 'פתוח';
      case 'closed': return 'סגור';
      case 'cancelled': return 'מבוטל';
      default: return item.status || '';
      }
    }
    if (fieldName === 'is_triggered') {
      if (item.is_triggered === 'true' || item.is_triggered === true) {
        return 'כן';
      } else if (item.is_triggered === 'false' || item.is_triggered === false) {
        return 'לא';
      } else if (item.is_triggered === 'new') {
        return 'חדש';
      }
      return 'לא מוגדר';
    }
    if (fieldName === 'expiry_date') {
      return item.expiry_date || '';
    }
    // For other fields, return directly
    return item[fieldName] || '';
  }
  
  // Trade Plans table - special handling for calculated fields
  if (tableType === 'trade_plans') {
    if (fieldName === 'ticker_symbol') {
      // Get ticker symbol from ticker object
      if (item.ticker && item.ticker.symbol) {
        return item.ticker.symbol;
      }
      if (item.ticker_symbol) {
        return item.ticker_symbol;
      }
      return item.ticker_id || '';
    }
    if (fieldName === 'quantity') {
      // Calculate quantity from planned_amount and target_price
      const plannedAmount = item.planned_amount || 0;
      const targetPrice = item.target_price || 0;
      if (targetPrice > 0) {
        return (plannedAmount / targetPrice);
      }
      return 0;
    }
    if (fieldName === 'reward') {
      // Calculate reward (potential profit)
      const plannedAmount = item.planned_amount || 0;
      const targetPrice = item.target_price || 0;
      const currentPrice = item.current || 0;
      if (plannedAmount > 0 && targetPrice > 0) {
        const quantity = plannedAmount / targetPrice;
        return quantity * (targetPrice - currentPrice);
      }
      return 0;
    }
    if (fieldName === 'risk') {
      // Calculate risk (potential loss)
      const plannedAmount = item.planned_amount || 0;
      const targetPrice = item.target_price || 0;
      const stopPrice = item.stop_price || 0;
      const currentPrice = item.current || 0;
      if (plannedAmount > 0 && targetPrice > 0 && stopPrice > 0) {
        const quantity = plannedAmount / targetPrice;
        return Math.abs(quantity * (currentPrice - stopPrice));
      }
      return 0;
    }
    if (fieldName === 'ratio') {
      // Calculate reward/risk ratio
      const plannedAmount = item.planned_amount || 0;
      const targetPrice = item.target_price || 0;
      const stopPrice = item.stop_price || 0;
      const currentPrice = item.current || 0;
      if (plannedAmount > 0 && targetPrice > 0 && stopPrice > 0) {
        const quantity = plannedAmount / targetPrice;
        const potentialProfit = quantity * (targetPrice - currentPrice);
        const potentialLoss = Math.abs(quantity * (currentPrice - stopPrice));
        if (potentialLoss > 0) {
          return potentialProfit / potentialLoss;
        }
      }
      return 0;
    }
    // For other fields, return directly
    return item[fieldName] || '';
  }
  
  // Trades table - special handling for calculated fields
  if (tableType === 'trades') {
    if (fieldName === 'ticker_symbol') {
      // Get ticker symbol from various sources
      if (item.ticker && item.ticker.symbol) {
        return item.ticker.symbol;
      }
      if (item.ticker_symbol) {
        return item.ticker_symbol;
      }
      return item.ticker_id || '';
    }
    if (fieldName === 'current_price') {
      // Get current price from ticker data or item
      if (item.ticker && item.ticker.current_price) {
        return item.ticker.current_price;
      }
      return item.current_price || 0;
    }
    if (fieldName === 'daily_change') {
      // Get daily change from ticker data or item
      if (item.ticker && item.ticker.change_percent) {
        return item.ticker.change_percent;
      }
      return item.daily_change || item.change_percent || 0;
    }
    if (fieldName === 'position_quantity') {
      // Get position quantity
      if (item.position && item.position.quantity) {
        return Math.abs(item.position.quantity);
      }
      return 0;
    }
    if (fieldName === 'position_pl_percent') {
      // Calculate P/L percentage
      if (item.position && item.position.average_price) {
        const ticker = item.ticker || {};
        const currentPrice = ticker.current_price || item.current_price || 0;
        const avgPrice = item.position.average_price;
        if (currentPrice > 0 && avgPrice > 0) {
          return ((currentPrice - avgPrice) / avgPrice) * 100;
        }
      }
      return 0;
    }
    if (fieldName === 'position_pl_value') {
      // Calculate P/L value
      if (item.position && item.position.quantity && item.position.average_price) {
        const ticker = item.ticker || {};
        const currentPrice = ticker.current_price || item.current_price || 0;
        const avgPrice = item.position.average_price;
        const qty = item.position.quantity;
        if (currentPrice > 0 && avgPrice > 0) {
          return (currentPrice - avgPrice) * qty;
        }
      }
      return 0;
    }
    if (fieldName === 'account_name') {
      // Get account name
      if (item.account && item.account.name) {
        return item.account.name;
      }
      return item.account_name || item.account_id || '';
    }
    if (fieldName === 'closed_at') {
      // Get closed_at or cancelled_at
      return item.closed_at || item.cancelled_at || '';
    }
    // For other fields, return directly
    return item[fieldName] || '';
  }

  // Trade Suggestions table - special handling for flat data structure
  if (tableType === 'trade_suggestions') {
    if (fieldName === 'score') {
      // Score is a number - return as number for proper sorting
      return item.score || 0;
    }
    if (fieldName === 'execution_date') {
      const envelopeCandidate = item.execution_date;
      if (envelopeCandidate && typeof envelopeCandidate === 'object') {
        return envelopeCandidate;
      }
      const directValue = item.execution_date || (item.execution && item.execution.date);
      return buildDateEnvelope(directValue);
    }
    if (fieldName === 'trade_id') {
      return item.trade_id || 0;
    }
    if (fieldName === 'account_name') {
      return item.account_name || '';
    }
    if (fieldName === 'trade_created_at') {
      const envelopeCandidate = item.trade_created_at;
      if (envelopeCandidate && typeof envelopeCandidate === 'object') {
        return envelopeCandidate;
      }
      const dateValue = item.trade_created_at
        || (item.suggestion && (item.suggestion.created_at || item.suggestion.opened_at || item.suggestion.open_date || item.suggestion.start_date))
        || null;
      return buildDateEnvelope(dateValue);
    }
    if (fieldName === 'status') {
      return item.status || '';
    }
    if (fieldName === 'side') {
      return item.side || '';
    }
    if (fieldName === 'investment_type') {
      return item.investment_type || '';
    }
    if (fieldName === 'match_reasons_text') {
      return item.match_reasons_text || '';
    }
    // For non-sortable columns, return empty string
    if (['checkbox', 'actions'].includes(fieldName)) {
      return '';
    }
    return item[fieldName] || '';
  }

  // Legacy support for other table types
  if (tableType === 'designs') {
    if (fieldName === 'ticker') {
      return item.ticker ? item.ticker.symbol || item.ticker.name || '' : '';
    }
  }


  return item[fieldName] || '';
}

/**
 * פונקציה לקבלת מיפוי עמודות לטבלה
 * Function to get column mapping for a table
 *
 * Returns the complete column mapping array for a specific table type.
 *
 * @param {string} tableType - סוג הטבלה / Table type identifier
 * @returns {Array} מערך שמות השדות / Array of field names
 */
function getTableMapping(tableType) {
  return TABLE_COLUMN_KEYS[tableType] || [];
}

/**
 * פונקציה לבדיקה אם טבלה נתמכת
 * Function to check if a table is supported
 *
 * Validates whether a table type has a defined column mapping.
 *
 * @param {string} tableType - סוג הטבלה / Table type identifier
 * @returns {boolean} האם הטבלה נתמכת / Whether the table is supported
 */
function isTableSupported(tableType) {
  return tableType in TABLE_COLUMN_MAPPINGS;
}

/**
 * Get table configuration object
 * Returns complete configuration for a table including columns, headers, and settings
 *
 * @param {string} tableName - Table identifier
 * @returns {Object} Table configuration object
 */
function getTableConfig(tableName) {
  const columns = TABLE_COLUMN_MAPPINGS[tableName] || [];
  
  // Default configuration
  const defaultConfig = {
    name: tableName,
    columns: columns,
    sortable: true,
    filterable: true,
    searchable: true,
    pagination: {
      enabled: true,
      pageSize: 50,
      pageSizeOptions: [10, 25, 50, 100]
    },
    display: {
      showActions: true,
      showStatus: true,
      showDates: true
    }
  };

  // Table-specific configurations
  const tableConfigs = {
    'trades': {
      ...defaultConfig,
      sortable: true,
      filterable: true,
      display: {
        ...defaultConfig.display,
        showActions: true,
        showStatus: true,
        showDates: true
      }
    },
    'executions': {
      ...defaultConfig,
      sortable: true,
      filterable: false,
      display: {
        ...defaultConfig.display,
        showActions: false,
        showStatus: false,
        showDates: true
      }
    },
    'alerts': {
      ...defaultConfig,
      sortable: true,
      filterable: true,
      display: {
        ...defaultConfig.display,
        showActions: true,
        showStatus: true,
        showDates: true
      }
    },
    'tickers': {
      ...defaultConfig,
      sortable: true,
      filterable: true,
      display: {
        ...defaultConfig.display,
        showActions: true,
        showStatus: true,
        showDates: false
      }
    }
  };

  return tableConfigs[tableName] || defaultConfig;
}

/**
 * Get column definition for a specific table and column
 * Returns detailed information about a specific column
 *
 * @param {string} tableName - Table identifier
 * @param {string} columnName - Column name or index
 * @returns {Object} Column definition object
 */
function getColumnDefinition(tableName, columnName) {
  const tableMapping = TABLE_COLUMN_MAPPINGS[tableName];
  if (!tableMapping) {
    return null;
  }

  let columnIndex = -1;
  let fieldName = '';

  if (typeof columnName === 'string') {
    columnIndex = tableMapping.findIndex(entry => normalizeColumnEntry(entry).key === columnName);
    fieldName = columnName;
  } else if (typeof columnName === 'number') {
    columnIndex = columnName;
    fieldName = normalizeColumnEntry(tableMapping[columnName]).key;
  }

  if (columnIndex === -1 || !fieldName) {
    return null;
  }

  const resolvedSortType = getColumnSortType(tableName, columnIndex) || 'string';

  // Default column definition
  const defaultDefinition = {
    index: columnIndex,
    name: fieldName,
    sortable: true,
    filterable: true,
    searchable: true,
    type: 'string',
    display: 'text',
    width: 'auto',
    sortType: resolvedSortType
  };

  // Column-specific definitions
  const columnDefinitions = {
    // Date columns
    'created_at': { ...defaultDefinition, type: 'date', sortable: true, display: 'date', sortType: resolvedSortType || 'date' },
    'updated_at': { ...defaultDefinition, type: 'date', sortable: true, display: 'date', sortType: resolvedSortType || 'date' },
    'opened_at': { ...defaultDefinition, type: 'date', sortable: true, display: 'date', sortType: resolvedSortType || 'date' },
    'closed_at': { ...defaultDefinition, type: 'date', sortable: true, display: 'date', sortType: resolvedSortType || 'date' },
    'cancelled_at': { ...defaultDefinition, type: 'date', sortable: true, display: 'date', sortType: resolvedSortType || 'date' },
    'date': { ...defaultDefinition, type: 'date', sortable: true, display: 'date', sortType: resolvedSortType || 'date' },
    'triggered_at': { ...defaultDefinition, type: 'date', sortable: true, display: 'date', sortType: resolvedSortType || 'date' },
    'trade_created_at': { ...defaultDefinition, type: 'date', sortable: true, display: 'date', sortType: resolvedSortType || 'dateEnvelope' },

    // Numeric columns
    'id': { ...defaultDefinition, type: 'number', sortable: true, display: 'number', width: '80px', sortType: resolvedSortType || 'numeric' },
    'quantity': { ...defaultDefinition, type: 'number', sortable: true, display: 'number', sortType: resolvedSortType || 'numeric' },
    'price': { ...defaultDefinition, type: 'number', sortable: true, display: 'currency', sortType: resolvedSortType || 'numeric' },
    'amount': { ...defaultDefinition, type: 'number', sortable: true, display: 'currency', sortType: resolvedSortType || 'numeric' },
    'fee': { ...defaultDefinition, type: 'number', sortable: true, display: 'currency', sortType: resolvedSortType || 'numeric' },
    'total_pl': { ...defaultDefinition, type: 'number', sortable: true, display: 'currency', sortType: resolvedSortType || 'numeric' },
    // 'cash_balance' removed - calculated in real-time via AccountActivityService
    'total_value': { ...defaultDefinition, type: 'number', sortable: true, display: 'currency', sortType: resolvedSortType || 'numeric' },
    'planned_amount': { ...defaultDefinition, type: 'number', sortable: true, display: 'currency', sortType: resolvedSortType || 'numeric' },
    'stop_price': { ...defaultDefinition, type: 'number', sortable: true, display: 'currency', sortType: resolvedSortType || 'numeric' },
    'target_price': { ...defaultDefinition, type: 'number', sortable: true, display: 'currency', sortType: resolvedSortType || 'numeric' },
    'line': { ...defaultDefinition, type: 'number', sortable: true, display: 'number', sortType: resolvedSortType || 'numeric' },

    // Status columns
    'status': { ...defaultDefinition, type: 'status', sortable: true, display: 'status', filterable: true, sortType: resolvedSortType || 'string' },
    'investment_type': { ...defaultDefinition, type: 'enum', sortable: true, display: 'badge', filterable: true, sortType: resolvedSortType || 'string' },
    'side': { ...defaultDefinition, type: 'enum', sortable: true, display: 'badge', filterable: true, sortType: resolvedSortType || 'string' },
    'type': { ...defaultDefinition, type: 'enum', sortable: true, display: 'badge', filterable: true, sortType: resolvedSortType || 'string' },
    'action': { ...defaultDefinition, type: 'enum', sortable: true, display: 'badge', filterable: true, sortType: resolvedSortType || 'string' },

    // Boolean columns
    'is_triggered': { ...defaultDefinition, type: 'boolean', sortable: true, display: 'boolean', filterable: true, sortType: resolvedSortType || 'boolean' },
    'active_trades': { ...defaultDefinition, type: 'boolean', sortable: true, display: 'boolean', filterable: true, sortType: resolvedSortType || 'boolean' },

    // Text columns (non-sortable)
    'notes': { ...defaultDefinition, sortable: false, filterable: true, searchable: true, display: 'text', sortType: resolvedSortType || 'string' },
    'message': { ...defaultDefinition, sortable: false, filterable: true, searchable: true, display: 'text', sortType: resolvedSortType || 'string' },
    'description': { ...defaultDefinition, sortable: false, filterable: true, searchable: true, display: 'text', sortType: resolvedSortType || 'string' },
    'content': { ...defaultDefinition, sortable: false, filterable: true, searchable: true, display: 'text', sortType: resolvedSortType || 'string' },
    'reasons': { ...defaultDefinition, sortable: false, filterable: true, searchable: true, display: 'text', sortType: resolvedSortType || 'string' },
    'entry_conditions': { ...defaultDefinition, sortable: false, filterable: true, searchable: true, display: 'text', sortType: resolvedSortType || 'string' },

    // Action columns (non-sortable, non-filterable)
    'actions': { ...defaultDefinition, sortable: false, filterable: false, searchable: false, display: 'actions', width: '120px', sortType: null }
  };

  return columnDefinitions[fieldName] || defaultDefinition;
}

function getColumnSortType(tableType, column) {
  const mappings = TABLE_COLUMN_MAPPINGS[tableType] || [];
  if (typeof column === 'number') {
    const entry = normalizeColumnEntry(mappings[column]);
    return entry.sortType || (TABLE_COLUMN_SORT_TYPES[tableType] ? TABLE_COLUMN_SORT_TYPES[tableType][entry.key] : null) || null;
  }
  if (typeof column === 'string') {
    const entry = mappings.find(item => normalizeColumnEntry(item).key === column);
    if (!entry) {
      return TABLE_COLUMN_SORT_TYPES[tableType] ? TABLE_COLUMN_SORT_TYPES[tableType][column] : null;
    }
    const normalized = normalizeColumnEntry(entry);
    return normalized.sortType || (TABLE_COLUMN_SORT_TYPES[tableType] ? TABLE_COLUMN_SORT_TYPES[tableType][normalized.key] : null) || null;
  }
  return null;
}

function getColumnKey(tableType, columnIndex) {
  const mappings = TABLE_COLUMN_MAPPINGS[tableType] || [];
  const entry = mappings[columnIndex];
  if (!entry) {
    return null;
  }
  const normalized = normalizeColumnEntry(entry);
  return normalized.key || null;
}

// ===== ייצוא הפונקציות והמיפויים =====
// Export functions and mappings to global scope
//
// These functions are made available globally for use by other scripts.
// All table-related scripts depend on these functions being available.

console.log('🔵 [table-mappings.js] About to export TABLE_COLUMN_MAPPINGS');
console.log('🔵 [table-mappings.js] TABLE_COLUMN_MAPPINGS keys:', Object.keys(TABLE_COLUMN_KEYS));

window.TABLE_COLUMN_MAPPINGS = TABLE_COLUMN_KEYS;
window.getColumnValue = getColumnValue;
window.getTableMapping = getTableMapping;
window.isTableSupported = isTableSupported;
window.getTableConfig = getTableConfig;
window.getColumnDefinition = getColumnDefinition;
window.getColumnSortType = getColumnSortType;
window.getColumnKey = getColumnKey;
window.getColumnIndexByKey = getColumnIndexByKey;
window.getDefaultSortChain = buildCanonDefaultSortChain;

// ייצוא המודול עצמו
window.tableMappings = {
  TABLE_COLUMN_MAPPINGS,
  TABLE_COLUMN_KEYS,
  getColumnValue,
  getTableMapping,
  isTableSupported,
  getColumnDefinition,
  getColumnSortType,
  buildDateEnvelope,
  getColumnKey,
  getColumnIndexByKey,
  getDefaultSortChain: buildCanonDefaultSortChain,
};

console.log('🔵 [table-mappings.js] Exported to window.TABLE_COLUMN_MAPPINGS');
console.log('🔵 [table-mappings.js] window.TABLE_COLUMN_MAPPINGS keys:', Object.keys(window.TABLE_COLUMN_MAPPINGS || {}));
console.log('🔵 [table-mappings.js] window.getColumnValue type:', typeof window.getColumnValue);

// Table Mappings loaded successfully
