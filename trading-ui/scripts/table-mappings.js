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

// ===== TABLE COLUMN MAPPINGS =====
const TABLE_COLUMN_MAPPINGS = {
  // טבלת תכנונים (Trade Plans) - Database Display Page Structure
  'trade_plans': [
    'id',                    // 0 - ID
    'account_id',            // 1 - Account ID
    'ticker_id',             // 2 - Ticker ID
    'investment_type',       // 3 - Investment Type
    'side',                  // 4 - Side
    'status',                // 5 - Status
    'planned_amount',        // 6 - Planned Amount
    'entry_conditions',      // 7 - Entry Conditions
    'stop_price',            // 8 - Stop Price
    'target_price',          // 9 - Target Price
    'reasons',               // 10 - Reasons
    'cancelled_at',          // 11 - Cancelled At
    'cancel_reason',         // 12 - Cancel Reason
    'created_at',            // 13 - Created At
    'stop_percentage',       // 14 - Stop Percentage
    'target_percentage',     // 15 - Target Percentage
    'current_price',         // 16 - Current Price
  ],

  // טבלת טריידים (Trades) - Trades Page Structure (13 columns)
  'trades': [
    'id',                    // 0 - ID
    'account_id',            // 1 - Account ID
    'ticker_id',             // 2 - Ticker ID
    'trade_plan_id',         // 3 - Trade Plan ID
    'status',                // 4 - Status
    'investment_type',       // 5 - Investment Type
    'side',                  // 6 - Side
    'opened_at',             // 7 - Opened At
    'closed_at',             // 8 - Closed At
    'cancelled_at',          // 9 - Cancelled At
    'cancel_reason',         // 10 - Cancel Reason
    'total_pl',              // 11 - Total P&L
    'notes',                 // 12 - Notes
    'created_at',            // 13 - Created At
  ],

  // טבלת חשבונות (Accounts) - Database Display Page Structure
  'accounts': [
    'id',                    // 0 - ID
    'name',                  // 1 - Name
    'currency_id',           // 2 - Currency ID
    'status',                // 3 - Status
    // 'cash_balance' removed - calculated in real-time via AccountActivityService
    'total_value',           // 5 - Total Value
    'total_pl',              // 6 - Total P&L
    'notes',                 // 7 - Notes
    'created_at',            // 8 - Created At
    'status_default',        // 9 - Status Default
  ],

  // טבלת חשבונות מסחר (Trading Accounts) - Trading Accounts Page Structure
  'trading_accounts': [
    'id',                    // 0 - ID
    'name',                  // 1 - Name
    'currency_id',           // 2 - Currency ID
    'status',                // 3 - Status
    // 'cash_balance' removed - calculated in real-time via AccountActivityService
    'total_value',           // 5 - Total Value
    'total_pl',              // 6 - Total P&L
    'notes',                 // 7 - Notes
    'created_at',            // 8 - Created At
    'status_default',        // 9 - Status Default
  ],

  // טבלת טיקרים (Tickers) - Enhanced with Yahoo Finance Data
  'tickers': [
    'id',                    // 0 - ID
    'symbol',                // 1 - סמל
    'name',                  // 2 - שם
    'type',                  // 3 - סוג
    'remarks',               // 4 - הערות
    'currency',              // 5 - מטבע
    'active_trades',         // 6 - יש טריידים
    'status',                // 7 - סטטוס
    'created_at',            // 8 - נוצר ב
    'updated_at',            // 9 - עודכן ב
    'currency_id',           // 10 - מזהה מטבע
  ],

  // טבלת פריטים מקושרים (Linked Items) - Entity Details Modal
  'linked_items': [
    'linked_to',     // 0 - מקושר ל (משולב: type + name)
    'status',         // 1 - סטטוס (Status)
    'created_at',     // 2 - תאריך (Date)
  ],

  // טבלת טיקרים חלקית (Tickers Summary) - Executions Page Structure
  'tickers_summary': [
    'symbol',                // 0 - סימבול
    'name',                  // 1 - שם
    'status',                // 2 - סטטוס טריידים
    'totalTrades',           // 3 - כמות טריידים
    'created_at',            // 4 - נוצר ב
    'actions',                // 5 - פעולות
  ],

  // טבלת ביצועים (Executions) - Executions Page Structure (12 columns + actions)
  'executions': [
    'id',                    // 0 - ID
    'trade_id',              // 1 - Trade ID
    'action',                // 2 - Action
    'date',                  // 3 - Date
    'quantity',              // 4 - Quantity
    'price',                 // 5 - Price
    'fee',                   // 6 - Fee
    'source',                // 7 - Source
    'created_at',            // 8 - Created At
    'external_id',           // 9 - External ID
    'notes',                 // 10 - Notes
  ],

  // טבלת תזרימי מזומנים (Cash Flows) - Database Display Page Structure
  'cash_flows': [
    'id',                    // 0 - ID
    'account_id',            // 1 - Account ID
    'type',                  // 2 - Type
    'amount',                // 3 - Amount
    'date',                  // 4 - Date
    'description',           // 5 - Description
    'currency_id',           // 6 - Currency ID
    'usd_rate',              // 7 - USD Rate
    'source',                // 8 - Source
    'external_id',           // 9 - External ID
    'created_at',             // 10 - Created At
  ],

  // טבלת התראות (Alerts) - Database Display Page Structure
  'alerts': [
    'id',                    // 0 - ID
    'account_id',            // 1 - Account ID
    'ticker_id',             // 2 - Ticker ID
    'message',               // 3 - Message
    'triggered_at',          // 4 - Triggered At
    'created_at',            // 5 - Created At
    'status',                // 6 - Status
    'is_triggered',          // 7 - Is Triggered
    'related_type_id',       // 8 - Related Type ID
    'related_id',            // 9 - Related ID
    'condition_attribute',   // 10 - Condition Attribute
    'condition_operator',    // 11 - Condition Operator
    'condition_number',      // 12 - Condition Number
  ],

  // טבלת הערות (Notes) - Database Display Page Structure
  'notes': [
    'id',                    // 0 - ID
    'content',               // 1 - Content
    'attachment',            // 2 - Attachment
    'related_type_id',       // 3 - Related Type ID
    'related_id',            // 4 - Related ID
    'created_at',             // 5 - Created At
  ],

  // Legacy mappings for backward compatibility
  'trades_legacy': [
    'ticker_symbol',   // 0 - טיקר
    'status',          // 1 - סטטוס
    'investment_type', // 2 - סוג השקעה
    'side',            // 3 - צד
    'opened_at',       // 4 - נפתח ב
    'closed_at',       // 5 - נסגר ב
    'total_pl',        // 6 - רווח/הפסד כולל
    'notes',           // 7 - הערות
    'account_name',     // 8 - שם חשבון מסחר
  ],

  'executions_legacy': [
    'action',          // 0 - פעולה
    'date',            // 1 - תאריך
    'quantity',        // 2 - כמות
    'price',           // 3 - מחיר
    'fee',             // 4 - עמלה
    'source',          // 5 - מקור
    'notes',            // 6 - הערות
  ],

  'alerts_legacy': [
    'condition',       // 0 - תנאי
    'message',         // 1 - הודעה
    'is_triggered',    // 2 - הופעל
    'triggered_at',    // 3 - הופעל ב
    'status',          // 4 - סטטוס
    'related_type',    // 5 - סוג קשור
    'related_id',       // 6 - מזהה קשור
  ],

  'cash_flows_legacy': [
    'type',            // 0 - סוג
    'amount',          // 1 - סכום
    'date',            // 2 - תאריך
    'description',     // 3 - תיאור
    'currency',        // 4 - מטבע
    'source',          // 5 - מקור
    'external_id',      // 6 - מזהה חיצוני
  ],

  'tickers_legacy': [
    'symbol',          // 0 - סמל
    'name',            // 1 - שם
    'type',            // 2 - סוג
    'remarks',         // 3 - הערות
    'currency',        // 4 - מטבע
    'active_trades',    // 5 - טריידים פעילים
  ],

  'accounts_legacy': [
    'name',            // 0 - שם
    'currency',        // 1 - מטבע
    'status',          // 2 - סטטוס
    // 'cash_balance' removed - calculated in real-time via AccountActivityService
    'total_value',     // 4 - ערך כולל
    'total_pl',        // 5 - רווח/הפסד כולל
    'notes',            // 6 - הערות
  ],

  'trade_plans_legacy': [
    'investment_type', // 0 - סוג השקעה
    'side',            // 1 - צד
    'status',          // 2 - סטטוס
    'planned_amount',  // 3 - סכום מתוכנן
    'entry_conditions', // 4 - תנאי כניסה
    'stop_price',      // 5 - מחיר עצירה
    'target_price',    // 6 - מחיר יעד
    'reasons',         // 7 - סיבות
    'account_name',    // 8 - שם חשבון מסחר
    'ticker_symbol',    // 9 - סמל טיקר
  ],

  'notes_legacy': [
    'content',         // 0 - תוכן
    'attachment',      // 1 - קובץ מצורף
    'related_type',    // 2 - סוג קשור
    'related_id',       // 3 - מזהה קשור
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

  // Test Page Tables - דף הבדיקה
  'test_trades': [
    'ticker',          // 0 - טיקר
    'status',          // 1 - סטטוס
    'investment_type', // 2 - סוג השקעה
    'account',         // 3 - חשבון מסחר
    'date',            // 4 - תאריך
    'quantity',        // 5 - כמות
    'price',           // 6 - מחיר
    'value',            // 7 - ערך
  ],

  'test_general': [
    'name',            // 0 - שם
    'status',          // 1 - סטטוס
    'investment_type', // 2 - סוג השקעה
    'account',         // 3 - חשבון מסחר
    'date',            // 4 - תאריך
    'amount',           // 5 - סכום
  ],

  'test_notifications': [
    'symbol',          // 0 - סימבול
    'related_to',      // 1 - קשור ל
    'content',         // 2 - תוכן
    'attachment',      // 3 - קובץ מצורף
    'created_at',      // 4 - נוצר ב
    'actions',          // 5 - פעולות
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
    'account_name',            // 0 - חשבון
    'ticker_symbol',           // 1 - סימבול
    'ticker_name',             // 2 - נוכחי (שם הטיקר)
    'quantity',                // 3 - כמות
    'side',                     // 4 - צד
    'average_price_net',        // 5 - מחיר ממוצע
    'market_value',            // 6 - שווי שוק
    'unrealized_pl',           // 7 - רווח/הפסד לא מוכר
    'percent_of_portfolio',    // 8 - אחוז מהפורטפוליו
  ],
};

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
  const fieldName = columns[columnIndex];

  if (!fieldName) {
    // No column mapping found for table type and column index
    return '';
  }

  // Database Display Page - Direct field mapping
  if (tableType === 'trade_plans' || tableType === 'trades' || tableType === 'accounts' || tableType === 'trading_accounts' ||
        tableType === 'tickers' || tableType === 'notes' ||
        tableType === 'executions' || tableType === 'cash_flows' ||
        tableType === 'positions' || tableType === 'portfolio') {

    // Return the field value directly from the item
    return item[fieldName] || '';
  }

  // Tickers Summary table - special handling for status and trade counts
  if (tableType === 'tickers_summary') {
    if (fieldName === 'status') {
      return item.status || '';
    }
    if (fieldName === 'totalTrades') {
      return item.totalTrades || 0;
    }
    if (fieldName === 'actions') {
      return ''; // לא ממיינים לפי עמודת פעולות
    }
    // For other fields, return directly
    return item[fieldName] || '';
  }

  // Test Page Tables - Direct field mapping from HTML cells
  if (tableType === 'test_trades' || tableType === 'test_general' || tableType === 'test_notifications') {
    // For test tables, the data comes from HTML cells, so we return the field name
    // The actual value extraction is handled in the filter functions
    if (fieldName === 'investment_type') {
      // Return the translated investment type value
      const typeDisplay = item[fieldName] === 'swing' ? 'סווינג' :
        item[fieldName] === 'investment' ? 'השקעה' :
          item[fieldName] === 'passive' ? 'פסיבי' :
            item[fieldName] === 'day' ? 'יומי' :
              item[fieldName] === 'scalp' ? 'סקלפינג' :
                item[fieldName] || '';
      return typeDisplay;
    }
    return item[fieldName] || '';
  }

  // Alerts table - special handling for condition translation
  if (tableType === 'alerts') {
    if (fieldName === 'condition') {
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
    if (fieldName === 'triggered_at') {
      if (item.triggered_at) {
        return new Date(item.triggered_at).toLocaleDateString('he-IL', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      return '-';
    }
    // For other fields, return directly
    return item[fieldName] || '';
  }

  // Legacy support for other table types
  if (tableType === 'designs') {
    if (fieldName === 'ticker') {
      return item.ticker ? item.ticker.symbol || item.ticker.name || '' : '';
    }
  }

  // Legacy trades table (for specific pages)
  if (tableType === 'trades_legacy') {
    if (fieldName === 'account_name') {
      return item.account_name || item.account_id || '';
    }
    if (fieldName === 'ticker_symbol') {
      return item.ticker_symbol || item.ticker_id || '';
    }
    if (fieldName === 'investment_type') {
      if (typeof window.translateTradeType === 'function') {
        const result = window.translateTradeType(item.investment_type) || item.investment_type || '';

        return result;
      }
      const typeDisplay = item.investment_type === 'long' ? 'לונג' :
        item.investment_type === 'short' ? 'שורט' :
          item.investment_type === 'swing' ? 'סווינג' :
            item.investment_type === 'day' ? 'יומי' :
              item.investment_type === 'scalp' ? 'סקלפינג' :
                item.investment_type || '';

      return typeDisplay;
    }
    if (fieldName === 'actions') {
      return ''; // לא ממיינים לפי עמודת פעולות
    }
  }

  // Legacy executions table (for specific pages)
  if (tableType === 'executions_legacy') {

    if (fieldName === 'symbol') {
      return item.symbol || item.ticker_symbol || '';
    }
    if (fieldName === 'trade_info') {
      return item.trade_info || '';
    }
    if (fieldName === 'action') {
      const actionDisplay = (item.action || item.type) === 'buy' ? 'קניה' :
        (item.action || item.type) === 'sell' ? 'מכירה' : item.action || item.type;
      return actionDisplay;
    }
    if (fieldName === 'pl') {
      return '0'; // לא ממיינים לפי רווח/הפסד
    }
    if (fieldName === 'notes') {
      return item.notes || '';
    }
    if (fieldName === 'date') {
      return item.date || item.execution_date || item.created_at || '';
    }
    if (fieldName === 'actions') {
      return ''; // לא ממיינים לפי עמודת פעולות
    }
  }

  // Legacy alerts table (for specific pages)
  if (tableType === 'alerts_legacy') {
    if (fieldName === 'ticker_symbol') {
      return item.ticker_symbol || item.ticker_id || '';
    }
    if (fieldName === 'condition') {
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
    if (fieldName === 'triggered_at') {
      if (item.triggered_at) {
        return new Date(item.triggered_at).toLocaleDateString('he-IL', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
      return '-';
    }
    if (fieldName === 'related_object') {
      return item.related_object || '-';
    }
    if (fieldName === 'message') {
      return item.message || '-';
    }
    if (fieldName === 'type') {
      switch (item.type) {
      case 'price_alert': return 'התראה על מחיר';
      case 'stop_loss': return 'סטופ לוס';
      case 'volume_alert': return 'התראה על נפח';
      case 'custom_alert': return 'התראה מותאמת';
      case 'price': return 'התראה על מחיר';
      case 'volume': return 'התראה על נפח';
      case 'change': return 'התראה על שינוי';
      case 'ma': return 'התראה על ממוצע נע';
      default: return item.type || '';
      }
    }
  }

  // Legacy cash flows table (for specific pages)
  if (tableType === 'cash_flows_legacy') {
    if (fieldName === 'account_id') {
      return item.account_name || item.account_id || '';
    }
    if (fieldName === 'type') {
      const typeDisplay = item.type === 'deposit' ? 'הפקדה' :
        item.type === 'withdrawal' ? 'משיכה' :
          item.type === 'dividend' ? 'דיבידנד' :
            item.type === 'fee' ? 'עמלה' :
              item.type === 'interest' ? 'ריבית' : item.type;
      return typeDisplay;
    }
  }

  // Legacy tickers table (for specific pages)
  if (tableType === 'tickers_legacy') {
    if (fieldName === 'type') {
      const typeDisplay = item.type === 'stock' ? 'מניה' :
        item.type === 'etf' ? 'ETF' :
          item.type === 'bond' ? 'אג"ח' :
            item.type === 'crypto' ? 'קריפטו' : item.type;
      return typeDisplay;
    }
    if (fieldName === 'active_trades') {
      return item.active_trades ? 'פעיל' : 'לא פעיל';
    }
    if (fieldName === 'currency') {
      if (item.currency && item.currency.symbol) {
        return item.currency.symbol;
      } else if (item.currency_id && window.currenciesData && window.currenciesData.length > 0) {
        const currency = window.currenciesData.find(c => c.id === item.currency_id);
        return currency ? currency.symbol : item.currency || '';
      }
      return item.currency || '';
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
  return TABLE_COLUMN_MAPPINGS[tableType] || [];
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

  // Handle both string column names and numeric indices
  if (typeof columnName === 'string') {
    columnIndex = tableMapping.indexOf(columnName);
    fieldName = columnName;
  } else if (typeof columnName === 'number') {
    columnIndex = columnName;
    fieldName = tableMapping[columnName];
  }

  if (columnIndex === -1 || !fieldName) {
    return null;
  }

  // Default column definition
  const defaultDefinition = {
    index: columnIndex,
    name: fieldName,
    sortable: true,
    filterable: true,
    searchable: true,
    type: 'string',
    display: 'text',
    width: 'auto'
  };

  // Column-specific definitions
  const columnDefinitions = {
    // Date columns
    'created_at': { ...defaultDefinition, type: 'date', sortable: true, display: 'date' },
    'updated_at': { ...defaultDefinition, type: 'date', sortable: true, display: 'date' },
    'opened_at': { ...defaultDefinition, type: 'date', sortable: true, display: 'date' },
    'closed_at': { ...defaultDefinition, type: 'date', sortable: true, display: 'date' },
    'cancelled_at': { ...defaultDefinition, type: 'date', sortable: true, display: 'date' },
    'date': { ...defaultDefinition, type: 'date', sortable: true, display: 'date' },
    'triggered_at': { ...defaultDefinition, type: 'date', sortable: true, display: 'date' },

    // Numeric columns
    'id': { ...defaultDefinition, type: 'number', sortable: true, display: 'number', width: '80px' },
    'quantity': { ...defaultDefinition, type: 'number', sortable: true, display: 'number' },
    'price': { ...defaultDefinition, type: 'number', sortable: true, display: 'currency' },
    'amount': { ...defaultDefinition, type: 'number', sortable: true, display: 'currency' },
    'fee': { ...defaultDefinition, type: 'number', sortable: true, display: 'currency' },
    'total_pl': { ...defaultDefinition, type: 'number', sortable: true, display: 'currency' },
    // 'cash_balance' removed - calculated in real-time via AccountActivityService
    'total_value': { ...defaultDefinition, type: 'number', sortable: true, display: 'currency' },
    'planned_amount': { ...defaultDefinition, type: 'number', sortable: true, display: 'currency' },
    'stop_price': { ...defaultDefinition, type: 'number', sortable: true, display: 'currency' },
    'target_price': { ...defaultDefinition, type: 'number', sortable: true, display: 'currency' },

    // Status columns
    'status': { ...defaultDefinition, type: 'status', sortable: true, display: 'status', filterable: true },
    'investment_type': { ...defaultDefinition, type: 'enum', sortable: true, display: 'badge', filterable: true },
    'side': { ...defaultDefinition, type: 'enum', sortable: true, display: 'badge', filterable: true },
    'type': { ...defaultDefinition, type: 'enum', sortable: true, display: 'badge', filterable: true },
    'action': { ...defaultDefinition, type: 'enum', sortable: true, display: 'badge', filterable: true },

    // Boolean columns
    'is_triggered': { ...defaultDefinition, type: 'boolean', sortable: true, display: 'boolean', filterable: true },
    'active_trades': { ...defaultDefinition, type: 'boolean', sortable: true, display: 'boolean', filterable: true },

    // Text columns (non-sortable)
    'notes': { ...defaultDefinition, sortable: false, filterable: true, searchable: true, display: 'text' },
    'message': { ...defaultDefinition, sortable: false, filterable: true, searchable: true, display: 'text' },
    'description': { ...defaultDefinition, sortable: false, filterable: true, searchable: true, display: 'text' },
    'content': { ...defaultDefinition, sortable: false, filterable: true, searchable: true, display: 'text' },
    'reasons': { ...defaultDefinition, sortable: false, filterable: true, searchable: true, display: 'text' },
    'entry_conditions': { ...defaultDefinition, sortable: false, filterable: true, searchable: true, display: 'text' },

    // Action columns (non-sortable, non-filterable)
    'actions': { ...defaultDefinition, sortable: false, filterable: false, searchable: false, display: 'actions', width: '120px' }
  };

  return columnDefinitions[fieldName] || defaultDefinition;
}

// ===== ייצוא הפונקציות והמיפויים =====
// Export functions and mappings to global scope
//
// These functions are made available globally for use by other scripts.
// All table-related scripts depend on these functions being available.

window.TABLE_COLUMN_MAPPINGS = TABLE_COLUMN_MAPPINGS;
window.getColumnValue = getColumnValue;
window.getTableMapping = getTableMapping;
window.isTableSupported = isTableSupported;
window.getTableConfig = getTableConfig;
window.getColumnDefinition = getColumnDefinition;

// ייצוא המודול עצמו
window.tableMappings = {
  TABLE_COLUMN_MAPPINGS,
  getColumnValue,
  getTableMapping,
  isTableSupported,
};

// Table Mappings loaded successfully
