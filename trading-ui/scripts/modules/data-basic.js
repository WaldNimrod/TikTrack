// ===== LOADING TRACKING =====
console.log('🟡 [data-basic.js] FILE LOADING STARTED');
console.log('🟡 [data-basic.js] window.TABLE_COLUMN_MAPPINGS exists:', !!window.TABLE_COLUMN_MAPPINGS);
console.log('🟡 [data-basic.js] window.getColumnValue exists:', typeof window.getColumnValue === 'function');
console.log('🟡 [data-basic.js] window.tableMappings exists:', !!window.tableMappings);

// ===== מיפוי עמודות לכל הטבלאות באתר =====
// Table Column Mappings for All Tables
//
// This file centralizes all table column mappings for the entire application.
// All sorting and data display functions use these mappings to ensure consistency.
//
// File: trading-ui/scripts/table-mappings.js
// Dependencies: None (standalone utility file)
// Dependents: main.js, all page-specific scripts
//
// TABLE STRUCTURE FIXES (August 24, 2025):
// =======================================
//
// ISSUE: Table headers and data columns were inconsistent across pages
// - Trades table had 10 columns in HTML but 11 columns in data
// - Column order mismatch between HTML headers and JavaScript data rendering
// - Sorting failed due to incorrect column mappings
//
// FIXES APPLIED:
// - Updated trades table mapping to include 11 columns (added account_name)
// - Fixed column order to match HTML headers exactly
// - Updated getColumnValue function to handle new field names
// - Corrected colspan attributes in HTML tables
//
// TRADES TABLE STRUCTURE (11 columns):
// - account_name (0) - חשבון
// - ticker_symbol (1) - טיקר
// - trade_plan_id (2) - תוכנית
// - status (3) - סטטוס
// - investment_type (4) - סוג
// - side (5) - צד
// - created_at (6) - נוצר ב
// - closed_at (7) - נסגר ב
// - total_pl (8) - רווח/הפסד
// - notes (9) - הערות
// - actions (10) - פעולות
//
// @version 1.1
// @lastUpdated August 24, 2025
// @tableStructureFixes August 24, 2025 - Fixed column mappings and table structure

/**
 * מיפוי עמודות לכל הטבלאות באתר
 * כל טבלה מוגדרת עם מערך של שמות השדות לפי סדר העמודות
 *
 * Column mappings for all tables in the application.
 * Each table is defined with an array of field names in column order.
 */
const LEGACY_TABLE_COLUMN_MAPPINGS = {
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

  // טבלת חשבונות מסחר (Trading Accounts) - REMOVED
  // Note: This mapping has been moved to table-mappings.js as the authoritative source
  // The correct mapping for UI tables is: name, currency_id, cash_balance, positions_count, total_pl, status
  // This file should NOT contain trading_accounts mapping - it's handled by table-mappings.js

  // טבלת טיקרים (Tickers) - Original structure
  'tickers': [
    'name',                  // 0 - שם הטיקר (maps to name)
    'price',                 // 1 - מחיר נוכחי (maps to current_price)
    'change',                // 2 - שינוי יומי (maps to change_percent)
    'updated',               // 3 - עדכון אחרון (maps to yahoo_updated_at)
    'status',                // 4 - סטטוס (maps to status)
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

  // טבלת תזרימי מזומנים (Cash Flows) - Cash Flows Page Structure
  'cash_flows': [
    'trading_account_id',    // 0 - Account (חשבון)
    'type',                  // 1 - Type (סוג)
    'amount',                // 2 - Amount (סכום)
    'date',                  // 3 - Date (תאריך)
    'description',           // 4 - Description (תיאור)
    'source',                // 5 - Source (מקור)
    'currency_id',           // 6 - Currency ID
    'usd_rate',              // 7 - USD Rate
    'external_id',           // 8 - External ID
    'created_at',            // 9 - Created At
    'id',                    // 10 - ID
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

  // טבלת הערות (Notes) - Notes Page Structure
  'notes': [
    'symbol',                // 0 - Symbol (סימבול) - עמודה ראשונה בטבלה
    'related_object',        // 1 - Related Object (אובייקט מקושר) - עמודה שנייה
    'content',               // 2 - Content (תוכן) - עמודה שלישית
    'attachment',            // 3 - Attachment (קובץ מצורף) - עמודה רביעית
    'created_at',            // 4 - Created At (נוצר ב) - עמודה חמישית
    'id',                    // 5 - ID (לא מוצג בטבלה)
    'related_type_id',       // 6 - Related Type ID (לא מוצג בטבלה)
    'related_id',            // 7 - Related ID (לא מוצג בטבלה)
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
    'account_name',     // 8 - שם חשבון
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
    'account_name',    // 8 - שם חשבון
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

  'entity_relation_types': [
    'id',              // 0 - מזהה
    'relation_type',   // 1 - סוג קשר
    'created_at',      // 2 - נוצר ב
  ],

  // Test Page Tables - דף הבדיקה
  'test_trades': [
    'ticker',          // 0 - טיקר
    'status',          // 1 - סטטוס
    'investment_type', // 2 - סוג השקעה
    'account',         // 3 - חשבון
    'date',            // 4 - תאריך
    'quantity',        // 5 - כמות
    'price',           // 6 - מחיר
    'value',            // 7 - ערך
  ],

  'test_general': [
    'name',            // 0 - שם
    'status',          // 1 - סטטוס
    'investment_type', // 2 - סוג השקעה
    'account',         // 3 - חשבון
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

  // טבלת נתונים נוספים של מסד נתונים (Database Extra Data) - DB Extra Data Page Structure
  'db_extradata': [
    'name',            // 0 - שם טבלה
    'data_type',       // 1 - סוג נתונים
    'records',         // 2 - מספר רשומות
    'description',     // 3 - תיאור
    'actions',         // 4 - פעולות
  ],

  // טבלת תצוגת מסד נתונים (Database Display) - DB Display Page Structure
  'db_display': [
    'name',            // 0 - שם טבלה
    'records',         // 1 - מספר רשומות
    'size',            // 2 - גודל
    'updated',         // 3 - עדכון אחרון
    'actions',         // 4 - פעולות
  ],

  // טבלת אילוצי מסד נתונים (Database Constraints) - Constraints Page Structure
  'constraints': [
    'table_name',      // 0 - שם טבלה
    'constraint_name', // 1 - שם אילוץ
    'constraint_type', // 2 - סוג אילוץ
    'column_name',     // 3 - שם עמודה
    'constraint_def',  // 4 - הגדרת אילוץ
    'actions',         // 5 - פעולות
  ],

  // טבלת העדפות משתמש (User Preferences) - Preferences Page Structure
  'preferences': [
    'category',        // 0 - קטגוריה
    'preference_name', // 1 - שם העדפה
    'current_value',   // 2 - ערך נוכחי
    'default_value',   // 3 - ערך ברירת מחדל
    'description',     // 4 - תיאור
    'actions',         // 5 - פעולות
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
  // console.log(`🔍 [table-mappings.js] getColumnValue called: tableType=${tableType}, columnIndex=${columnIndex}`);
  // CRITICAL: Use window.TABLE_COLUMN_MAPPINGS (from table-mappings.js) if available, otherwise fallback to local
  // This ensures table-mappings.js is the authoritative source for all mappings
  const mappingsSource = window.TABLE_COLUMN_MAPPINGS || LEGACY_TABLE_COLUMN_MAPPINGS;
  const columns = mappingsSource[tableType] || [];
  const fieldName = columns[columnIndex];
  // console.log(`🔍 [table-mappings.js] columns:`, columns);
  // console.log(`🔍 [table-mappings.js] fieldName:`, fieldName);

  if (!fieldName) {
    // No column mapping found for table type and column index
    console.log(`⚠️ [table-mappings.js] No field name found for ${tableType}:${columnIndex}`);
    return '';
  }

  // Database Display Page - Direct field mapping
  // Note: 'accounts' removed - only 'trading_accounts' exists in the system
  // Note: 'trading_accounts' is now handled by table-mappings.js exclusively
  if (tableType === 'trade_plans' || tableType === 'trades' ||
        tableType === 'tickers' || tableType === 'notes' ||
        tableType === 'executions' || tableType === 'cash_flows' || tableType === 'alerts' ||
        tableType === 'db_extradata' || tableType === 'db_display' || tableType === 'constraints' || tableType === 'preferences') {

    // Special handling for tickers table - original structure
    if (tableType === 'tickers') {
      // Map display field names to actual data field names
      const fieldMapping = {
        'name': 'name',               // Maps to actual field
        'price': 'current_price',     // Maps to actual field
        'change': 'change_percent',   // Maps to actual field
        'updated': 'yahoo_updated_at', // Maps to actual field
        'status': 'status'            // Maps to actual field
      };
      
      const actualFieldName = fieldMapping[fieldName] || fieldName;
      let result = item[actualFieldName];
      
      // Handle null/undefined values for sorting - always show as smallest value
      if (result === null || result === undefined) {
        if (fieldName === 'price' || fieldName === 'change' || fieldName === 'volume') {
          result = -Infinity; // Use -Infinity for numeric fields (smallest possible value)
        } else {
          result = ''; // Use empty string for text fields (smallest possible value)
        }
      }
      
      return result;
    }

    // Special handling for cash_flows table
    if (tableType === 'cash_flows') {
      let result = item[fieldName];
      
      // Handle null/undefined values for sorting
      if (result === null || result === undefined) {
        if (fieldName === 'amount' || fieldName === 'usd_rate') {
          result = -Infinity; // Use -Infinity for numeric fields
        } else {
          result = ''; // Use empty string for text fields
        }
      }
      
      return result;
    }

    // Special handling for notes table
    if (tableType === 'notes') {
      let result = item[fieldName];
      
      // Handle special cases for notes table display
      if (fieldName === 'symbol') {
        // For symbol column, we need to extract the actual symbol from the complex display
        if (item.related_type_id === 4) { // ticker
          result = item.related_id ? `טיקר ${item.related_id}` : '';
        } else if (item.related_type_id === 2 || item.related_type_id === 3) { // trade or plan
          // For trades/plans, we need to get the ticker symbol
          result = ''; // Will be populated by the display logic
        } else {
          result = ''; // For accounts and general notes
        }
      } else if (fieldName === 'related_object') {
        // For related object, use the unified system
        if (window.getRelatedObjectDisplay) {
          const relatedInfo = window.getRelatedObjectDisplay(item, {}, { showLink: false, format: 'minimal' });
          result = relatedInfo.display;
        } else {
          // Fallback to simple display
          if (item.related_type_id && item.related_id) {
            switch (item.related_type_id) {
              case 1: result = `חשבון ${item.related_id}`; break;
              case 2: result = `טרייד ${item.related_id}`; break;
              case 3: result = `תוכנית ${item.related_id}`; break;
              case 4: result = `טיקר ${item.related_id}`; break;
              default: result = `אובייקט ${item.related_id}`;
            }
          } else {
            result = 'כללי';
          }
        }
      }
      
      // Handle null/undefined values for sorting
      if (result === null || result === undefined) {
        if (fieldName === 'created_at') {
          result = -Infinity; // Use -Infinity for date fields
        } else {
          result = ''; // Use empty string for text fields
        }
      }
      
      return result;
    }

    // Return the field value directly from the item for other tables
    const result = item[fieldName] || '';
    // console.log(`🔍 [table-mappings.js] direct mapping: ${fieldName} = ${result}`);
    return result;
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
  const mappingsSource = window.TABLE_COLUMN_MAPPINGS || LEGACY_TABLE_COLUMN_MAPPINGS;
  return mappingsSource[tableType] || [];
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
  const mappingsSource = window.TABLE_COLUMN_MAPPINGS || LEGACY_TABLE_COLUMN_MAPPINGS;
  return tableType in mappingsSource;
}

/**
 * Get table configuration object according to specification
 * Returns complete configuration for a table including columns, headers, and settings
 *
 * @param {string} tableName - Table identifier
 * @returns {Object} Table configuration object
 */
function getTableConfig(tableName) {
  try {
    if (!tableName) {
      console.warn('⚠️ Table name required for getTableConfig');
      return null;
    }
    
    const tableConfigs = {
      'trades': {
        id: 'trades-table',
        title: 'Trades Table',
        columns: ['id', 'ticker', 'side', 'status', 'pl', 'opened_at'],
        sortable: true,
        filterable: true,
        pageable: true,
        pageSize: 25,
        defaultSort: { column: 'opened_at', direction: 'desc' },
        css: {
          container: 'table-container',
          header: 'table-header',
          body: 'table-body',
          row: 'table-row',
          cell: 'table-cell'
        }
      },
      'tickers': {
        id: 'tickers-table',
        title: 'Tickers Table',
        columns: ['name', 'price', 'change', 'updated', 'status'],
        sortable: true,
        filterable: true,
        pageable: true,
        pageSize: 30,
        defaultSort: { column: 'name', direction: 'asc' },
        css: {
          container: 'table-container',
          header: 'table-header',
          body: 'table-body',
          row: 'table-row',
          cell: 'table-cell'
        }
      },
      'db_extradata': {
        id: 'db-extradata-table',
        title: 'Database Extra Data Table',
        columns: ['name', 'data_type', 'records', 'description'],
        sortable: true,
        filterable: true,
        pageable: true,
        pageSize: 20,
        defaultSort: { column: 'name', direction: 'asc' },
        css: {
          container: 'table-container',
          header: 'table-header',
          body: 'table-body',
          row: 'table-row',
          cell: 'table-cell'
        }
      },
      'db_display': {
        id: 'db-display-table',
        title: 'Database Display Table',
        columns: ['name', 'records', 'size', 'updated'],
        sortable: true,
        filterable: true,
        pageable: true,
        pageSize: 20,
        defaultSort: { column: 'name', direction: 'asc' },
        css: {
          container: 'table-container',
          header: 'table-header',
          body: 'table-body',
          row: 'table-row',
          cell: 'table-cell'
        }
      },
      'constraints': {
        id: 'constraints-table',
        title: 'Database Constraints Table',
        columns: ['table_name', 'constraint_name', 'constraint_type', 'column_name', 'constraint_def'],
        sortable: true,
        filterable: true,
        pageable: true,
        pageSize: 20,
        defaultSort: { column: 'table_name', direction: 'asc' },
        css: {
          container: 'table-container',
          header: 'table-header',
          body: 'table-body',
          row: 'table-row',
          cell: 'table-cell'
        }
      },
      'preferences': {
        id: 'preferences-table',
        title: 'User Preferences Table',
        columns: ['category', 'preference_name', 'current_value', 'default_value', 'description'],
        sortable: true,
        filterable: true,
        pageable: true,
        pageSize: 20,
        defaultSort: { column: 'category', direction: 'asc' },
        css: {
          container: 'table-container',
          header: 'table-header',
          body: 'table-body',
          row: 'table-row',
          cell: 'table-cell'
        }
      }
    };
    
    const config = tableConfigs[tableName];
    if (config) {
      return config;
    } else {
      console.log(`ℹ️ No config found for table: ${tableName}`);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error getting table config:', error);
    return null;
  }
}

/**
 * Get column definition for a specific table and column according to specification
 * Returns detailed information about a specific column
 *
 * @param {string} tableName - Table identifier
 * @param {string} columnName - Column name or index
 * @returns {Object} Column definition object
 */
function getColumnDefinition(tableName, columnName) {
  try {
    if (!tableName || !columnName) {
      console.warn('⚠️ Table name and column name required for getColumnDefinition');
      return null;
    }
    
    const columnDefinitions = {
      'trades': {
        'id': {
          title: 'ID',
          type: 'number',
          sortable: true,
          filterable: true,
          width: '80px',
          align: 'center',
          format: 'number'
        },
        'ticker': {
          title: 'Ticker',
          type: 'string',
          sortable: true,
          filterable: true,
          width: '120px',
          align: 'left',
          format: 'text'
        },
        'side': {
          title: 'Side',
          type: 'string',
          sortable: true,
          filterable: true,
          width: '80px',
          align: 'center',
          format: 'badge',
          options: ['Long', 'Short']
        },
        'status': {
          title: 'Status',
          type: 'string',
          sortable: true,
          filterable: true,
          width: '100px',
          align: 'center',
          format: 'status',
          options: ['Open', 'Closed', 'Cancelled']
        },
        'pl': {
          title: 'P&L',
          type: 'number',
          sortable: true,
          filterable: false,
          width: '100px',
          align: 'right',
          format: 'currency'
        },
        'opened_at': {
          title: 'Opened At',
          type: 'datetime',
          sortable: true,
          filterable: true,
          width: '150px',
          align: 'center',
          format: 'datetime'
        }
      },
      'tickers': {
        'name': {
          title: 'שם הטיקר',
          type: 'string',
          sortable: true,
          filterable: true,
          width: '200px',
          align: 'left',
          format: 'text'
        },
        'price': {
          title: 'מחיר נוכחי',
          type: 'number',
          sortable: true,
          filterable: false,
          width: '120px',
          align: 'right',
          format: 'currency'
        },
        'change': {
          title: 'שינוי יומי',
          type: 'number',
          sortable: true,
          filterable: false,
          width: '100px',
          align: 'right',
          format: 'percentage'
        },
        'updated': {
          title: 'עדכון אחרון',
          type: 'datetime',
          sortable: true,
          filterable: false,
          width: '120px',
          align: 'center',
          format: 'datetime'
        },
        'status': {
          title: 'סטטוס',
          type: 'string',
          sortable: true,
          filterable: true,
          width: '100px',
          align: 'center',
          format: 'status',
          options: ['active', 'inactive', 'cancelled']
        }
      },
      'db_extradata': {
        'name': {
          title: 'שם טבלה',
          type: 'string',
          sortable: true,
          filterable: true,
          width: '200px',
          align: 'left',
          format: 'text'
        },
        'data_type': {
          title: 'סוג נתונים',
          type: 'string',
          sortable: true,
          filterable: true,
          width: '150px',
          align: 'center',
          format: 'text'
        },
        'records': {
          title: 'מספר רשומות',
          type: 'number',
          sortable: true,
          filterable: false,
          width: '120px',
          align: 'right',
          format: 'number'
        },
        'description': {
          title: 'תיאור',
          type: 'string',
          sortable: true,
          filterable: true,
          width: '300px',
          align: 'left',
          format: 'text'
        }
      },
      'db_display': {
        'name': {
          title: 'שם טבלה',
          type: 'string',
          sortable: true,
          filterable: true,
          width: '200px',
          align: 'left',
          format: 'text'
        },
        'records': {
          title: 'מספר רשומות',
          type: 'number',
          sortable: true,
          filterable: false,
          width: '120px',
          align: 'right',
          format: 'number'
        },
        'size': {
          title: 'גודל',
          type: 'string',
          sortable: true,
          filterable: false,
          width: '100px',
          align: 'right',
          format: 'text'
        },
        'updated': {
          title: 'עדכון אחרון',
          type: 'datetime',
          sortable: true,
          filterable: false,
          width: '150px',
          align: 'center',
          format: 'datetime'
        }
      },
      'constraints': {
        'table_name': {
          title: 'שם טבלה',
          type: 'string',
          sortable: true,
          filterable: true,
          width: '150px',
          align: 'left',
          format: 'text'
        },
        'constraint_name': {
          title: 'שם אילוץ',
          type: 'string',
          sortable: true,
          filterable: true,
          width: '150px',
          align: 'left',
          format: 'text'
        },
        'constraint_type': {
          title: 'סוג אילוץ',
          type: 'string',
          sortable: true,
          filterable: true,
          width: '120px',
          align: 'center',
          format: 'text'
        },
        'column_name': {
          title: 'שם עמודה',
          type: 'string',
          sortable: true,
          filterable: true,
          width: '120px',
          align: 'left',
          format: 'text'
        },
        'constraint_def': {
          title: 'הגדרת אילוץ',
          type: 'string',
          sortable: true,
          filterable: true,
          width: '300px',
          align: 'left',
          format: 'text'
        }
      },
      'preferences': {
        'category': {
          title: 'קטגוריה',
          type: 'string',
          sortable: true,
          filterable: true,
          width: '150px',
          align: 'left',
          format: 'text'
        },
        'preference_name': {
          title: 'שם העדפה',
          type: 'string',
          sortable: true,
          filterable: true,
          width: '200px',
          align: 'left',
          format: 'text'
        },
        'current_value': {
          title: 'ערך נוכחי',
          type: 'string',
          sortable: true,
          filterable: false,
          width: '150px',
          align: 'left',
          format: 'text'
        },
        'default_value': {
          title: 'ערך ברירת מחדל',
          type: 'string',
          sortable: true,
          filterable: false,
          width: '150px',
          align: 'left',
          format: 'text'
        },
        'description': {
          title: 'תיאור',
          type: 'string',
          sortable: true,
          filterable: true,
          width: '300px',
          align: 'left',
          format: 'text'
        }
      }
    };
    
    const tableColumns = columnDefinitions[tableName];
    if (tableColumns && tableColumns[columnName]) {
      const definition = tableColumns[columnName];
      return definition;
    } else {
      console.log(`ℹ️ No definition found for column: ${tableName}.${columnName}`);
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error getting column definition:', error);
    return null;
  }
}

/**
 * Set table configuration according to specification
 * @param {string} tableName - Table identifier
 * @param {Object} config - Table configuration object
 * @returns {boolean} Success status
 */
function setTableConfig(tableName, config) {
  try {
    if (!tableName || !config) {
      console.warn('⚠️ Table name and config required for setTableConfig');
      return false;
    }
    
    // Store in global table configs
    if (!window._tableConfigs) {
      window._tableConfigs = {};
    }
    window._tableConfigs[tableName] = config;
    
    return true;
    
  } catch (error) {
    console.error('❌ Error setting table config:', error);
    return false;
  }
}

/**
 * Set column definition according to specification
 * @param {string} tableName - Table identifier
 * @param {string} columnName - Column name
 * @param {Object} definition - Column definition object
 * @returns {boolean} Success status
 */
function setColumnDefinition(tableName, columnName, definition) {
  try {
    if (!tableName || !columnName || !definition) {
      console.warn('⚠️ Table name, column name and definition required for setColumnDefinition');
      return false;
    }
    
    // Store in global column definitions
    if (!window._columnDefinitions) {
      window._columnDefinitions = {};
    }
    if (!window._columnDefinitions[tableName]) {
      window._columnDefinitions[tableName] = {};
    }
    window._columnDefinitions[tableName][columnName] = definition;
    
    return true;
    
  } catch (error) {
    console.error('❌ Error setting column definition:', error);
    return false;
  }
}

// ===== ייצוא הפונקציות והמיפויים =====
// Export functions and mappings to global scope
//
// ⚠️ CRITICAL: This file contains OLD/LEGACY mappings for database display pages only.
// For UI table sorting, use table-mappings.js which has the correct mappings.
//
// These functions are made available globally for use by other scripts.
// All table-related scripts depend on these functions being available.
//
// IMPORTANT: Do NOT override table-mappings.js if it's already loaded!
// table-mappings.js is the authoritative source for UI table mappings.

// Only export if table-mappings.js hasn't already set these (table-mappings.js should load first)
if (!window.TABLE_COLUMN_MAPPINGS || Object.keys(window.TABLE_COLUMN_MAPPINGS).length === 0) {
  window.TABLE_COLUMN_MAPPINGS = LEGACY_TABLE_COLUMN_MAPPINGS;
  console.warn('⚠️ [data-basic.js] Using legacy TABLE_COLUMN_MAPPINGS - table-mappings.js should be loaded first!');
} else {
  // table-mappings.js already loaded - don't override, but merge any missing mappings
  // This is for database display pages that might need the legacy mappings
  console.log('✅ [data-basic.js] table-mappings.js already loaded - preserving existing mappings');
}

// CRITICAL: Only export getColumnValue if table-mappings.js hasn't already set it
// table-mappings.js exports window.getColumnValue directly (not window.tableMappings.getColumnValue)
// So we check window.getColumnValue directly to prevent overriding the correct implementation
if (typeof window.getColumnValue !== 'function') {
  window.getColumnValue = getColumnValue;
  window.getTableMapping = getTableMapping;
  window.isTableSupported = isTableSupported;
  window.getTableConfig = getTableConfig;
  window.getColumnDefinition = getColumnDefinition;
  window.setTableConfig = setTableConfig;
  window.setColumnDefinition = setColumnDefinition;

  // ייצוא המודול עצמו (only if table-mappings.js hasn't set these)
  if (!window.tableMappings) {
    window.tableMappings = {
      TABLE_COLUMN_MAPPINGS: window.TABLE_COLUMN_MAPPINGS || LEGACY_TABLE_COLUMN_MAPPINGS,
      getColumnValue,
      getTableMapping,
      isTableSupported,
      getTableConfig,
      getColumnDefinition,
      setTableConfig,
      setColumnDefinition,
    };
  }
} else {
  // table-mappings.js already loaded - preserve its mappings
  console.log('✅ [data-basic.js] table-mappings.js already loaded - preserving existing window.getColumnValue');
}

// Table Mappings loaded successfully

// ===== TABLE SORTING SYSTEM ======
/**
 * Tables.js - TikTrack Table Management System
 * ============================================
 *
 * REFACTORING HISTORY:
 * ===================
 *
 * This file was created during the main.js modular split (Phase 6 - August 24, 2025)
 * by combining table-sorting.js and table-grid.js into a single comprehensive module.
 *
 * UNIFIED CACHE INTEGRATION (January 26, 2025):
 * =============================================
 * - Integrated with UnifiedCacheManager for table data caching
 * - Added table state management with unified cache
 * - Improved performance with smart caching strategies
 *
 * ORIGINAL STATE:
 * - Table functions scattered across main.js (2153 lines)
 * - Duplicate sorting logic in multiple files
 * - Inconsistent table management across pages
 * - Difficult to maintain table-specific functionality
 *
 * REFACTORING BENEFITS:
 * - Centralized table management system
 * - Consistent sorting behavior across all tables
 * - Improved maintainability and debugging
 * - Clear separation of concerns
 *
 * SORTING FIXES (August 24, 2025):
 * ================================
 *
 * ISSUE: Multiple table files had incorrect function calls causing:
 * - RangeError: Maximum call stack size exceeded (infinite recursion)
 * - Sorting not working on various pages
 * - Inconsistent sorting behavior across tables
 *
 * FIXES APPLIED:
 * - Fixed trade_plans.js: Changed window.sortTable to window.sortTableData
 * - Fixed notes.js: Changed window.sortTable to window.sortTableData
 * - Fixed alerts.js: Changed window.sortTable to window.sortTableData
 * - Fixed tickers.js: Changed window.sortTable to window.sortTableData
 * - Fixed cash_flows.js: Changed window.sortTable to window.sortTableData
 * - Fixed executions.js: Changed window.sortTable to window.sortTableData
 * - Fixed accounts.js: Corrected window.sortTableData parameters
 *
 * CORRECT FUNCTION SIGNATURE:
 * window.sortTableData(columnIndex, data, tableType, updateFunction)
 *
 * CONTENTS:
 * =========
 *
 * 1. GLOBAL SORTING SYSTEM:
 *    - sortTableData() - Main sorting function for all tables
 *    - sortAnyTable() - Universal table sorter
 *    - sortTable() - Legacy compatibility wrapper
 *    - isDateValue() - Date validation helper
 *
 * 2. UNIFIED CACHE INTEGRATION:
 *    - loadTableDataFromCache() - Load table data from unified cache
 *    - saveTableDataToCache() - Save table data to unified cache
 *    - saveTableState() - Save table UI state to cache
 *    - loadTableState() - Load table UI state from cache
 *
 * 2. SORT STATE MANAGEMENT:
 *    - saveSortState() - Save current sort configuration
 *    - getSortState() - Retrieve saved sort state
 *    - restoreAnyTableSort() - Restore previous sort state
 *    - updateSortIcons() - Update UI sort indicators
 *
 * 3. GRID CORE FUNCTIONS:
 *    - getDefaultColumnDefs() - Default column definitions
 *    - External filter management
 *    - Grid initialization helpers
 *
 * 4. TABLE UTILITIES:
 *    - closeModal() - Modal management (table-related)
 *    - Column value extraction
 *    - Table type validation
 *
 * DEPENDENCIES:
 * ============
 * - table-mappings.js: Column mappings and value extraction
 * - translation-utils.js: Text translations
 * - ui-utils.js: UI interaction helpers
 *
 * USAGE:
 * ======
 *
 * Basic table sorting:
 * ```javascript
 * sortTableData(0, tableData, 'trades', updateTradesTable);
 * ```
 *
 * Restore previous sort:
 * ```javascript
 * restoreAnyTableSort('trading_accounts', trading_accountsData, updateTradingAccountsTable);
 * ```
 *
 * Get default columns:
 * ```javascript
 * const columns = getDefaultColumnDefs();
 * ```
 *
 * @version 1.1
 * @lastUpdated August 24, 2025
 * @refactoringPhase 6 - Modular Architecture
 * @sortingFixes August 24, 2025 - Fixed infinite recursion in all table files
 */

// ===== GLOBAL SORTING SYSTEM =====

/**
 * פונקציה גלובלית למיון טבלאות
 * Global function for sorting tables
 *
 * @param {number} columnIndex - אינדקס העמודה למיון
 * @param {Array} data - נתוני הטבלה
 * @param {string} tableType - סוג הטבלה
 * @param {Function} updateFunction - פונקציה לעדכון הטבלה
 */
// REMOVED: sortTable - use window.sortTableData from tables.js directly

/**
 * Global function for sorting tables
 *
 * This is the main sorting function used across all tables in the application.
 * It handles different data types (numbers, dates, strings) automatically
 * and maintains sort state for each table type.
 *
 * @param {number} columnIndex - Index of column to sort by
 * @param {Array} data - Data array to sort
 * @param {string} tableType - Type of table (trades, trading_accounts, alerts, etc.)
 * @param {Function} updateFunction - Function to call with sorted data
 * @returns {Array} Sorted data array
 */
// Function removed - using the main getColumnValue function above (line 382)

/**
 * Get custom sort value for specific table types and columns
 * Returns null if no custom logic applies
 *
 * @param {Object} a - First item
 * @param {Object} b - Second item
 * @param {number} columnIndex - Column index
 * @param {string} tableType - Table type
 * @param {*} aValue - First item value
 * @param {*} bValue - Second item value
 * @returns {number|null} Custom sort result or null
 */
function getCustomSortValue(a, b, columnIndex, tableType, aValue, bValue) {
  // Custom sorting for tickers table
  if (tableType === 'tickers') {
    // Change column (index 2) - שינוי יומי - special handling for positive/negative values
    if (columnIndex === 2) {
      const aNum = parseFloat(aValue) || -Infinity;
      const bNum = parseFloat(bValue) || -Infinity;
      
      // If both are -Infinity (missing data), they're equal
      if (aNum === -Infinity && bNum === -Infinity) {
        return 0;
      }
      
      // Missing data (-Infinity) is always smallest
      if (aNum === -Infinity) return -1;
      if (bNum === -Infinity) return 1;
      
      // For change percentage: positive values first, then negative values
      // Within each group, sort by absolute value
      if (aNum > 0 && bNum < 0) return -1; // Positive before negative
      if (aNum < 0 && bNum > 0) return 1;  // Positive before negative
      
      // Both same sign - sort by absolute value (descending)
      return Math.abs(bNum) - Math.abs(aNum);
    }
  }

  // Custom sorting for alerts table
  if (tableType === 'alerts') {
    // Condition column (index 1) - Hebrew alphabetical sorting
    if (columnIndex === 1) {
      // Use Hebrew locale for proper alphabetical sorting
      return aValue.localeCompare(bValue, 'he-IL');
    }
  }

  // Custom sorting for cash_flows table
  if (tableType === 'cash_flows') {
    // Type column (index 1) - Hebrew alphabetical sorting for cash flow types
    if (columnIndex === 1) {
      // Use Hebrew locale for proper alphabetical sorting
      return aValue.localeCompare(bValue, 'he-IL');
    }
    
    // Amount column (index 2) - numeric sorting with proper handling of negative values
    if (columnIndex === 2) {
      const aNum = parseFloat(aValue) || -Infinity;
      const bNum = parseFloat(bValue) || -Infinity;
      
      // If both are -Infinity (missing data), they're equal
      if (aNum === -Infinity && bNum === -Infinity) {
        return 0;
      }
      
      // Missing data (-Infinity) is always smallest
      if (aNum === -Infinity) return -1;
      if (bNum === -Infinity) return 1;
      
      // Standard numeric comparison
      return aNum - bNum;
    }
  }

  // Custom sorting for notes table
  if (tableType === 'notes') {
    // Related object column (index 1) - Hebrew alphabetical sorting
    if (columnIndex === 1) {
      // Use Hebrew locale for proper alphabetical sorting
      return aValue.localeCompare(bValue, 'he-IL');
    }
    
    // Content column (index 2) - Hebrew alphabetical sorting
    if (columnIndex === 2) {
      // Use Hebrew locale for proper alphabetical sorting
      return aValue.localeCompare(bValue, 'he-IL');
    }
    
    // Created date column (index 4) - date sorting
    if (columnIndex === 4) {
      const aDate = new Date(aValue);
      const bDate = new Date(bValue);
      
      // Handle invalid dates
      if (isNaN(aDate.getTime()) && isNaN(bDate.getTime())) {
        return 0;
      }
      if (isNaN(aDate.getTime())) return -1;
      if (isNaN(bDate.getTime())) return 1;
      
      // Standard date comparison
      return aDate - bDate;
    }
  }

  // Custom sorting for other table types can be added here
  // if (tableType === 'trades') { ... }
  // if (tableType === 'accounts') { ... }

  return null; // No custom logic applies - use standard sorting
}

// REMOVED: window.sortTableData - This function is now defined in tables.js as the authoritative source
// The tables.js version includes critical recursion protection (window._sortTableDataInProgress)
// and proper event handler disabling during table updates to prevent infinite recursion.
// This duplicate async version was causing Maximum call stack size exceeded errors because:
// 1. It lacked recursion protection
// 2. It was overriding the correct implementation from tables.js
// 3. It was being called by UnifiedTableSystem which expected the sync version with recursion guards
//
// If you need to use sortTableData, always use window.sortTableData from tables.js:
// window.sortTableData(columnIndex, data, tableType, updateFunction)
//
// Note: window.getSortState is synchronous (reads from localStorage), so async/await is not needed

/**
 * Update sort icons in table headers
 *
 * @param {string} tableType - Type of table
 * @param {number} columnIndex - Column index
 * @param {string} direction - Sort direction (asc/desc)
 */
function updateSortIcons(tableType, columnIndex, direction) {
  try {
    // Find the table by data-table-type attribute
    const table = document.querySelector(`table[data-table-type="${tableType}"]`);
    if (!table) {
      console.warn(`⚠️ Table with type "${tableType}" not found for sort icons update`);
      return;
    }

    // Clear all sort icons first
    const headers = table.querySelectorAll('th .sort-icon');
    headers.forEach(header => {
      header.textContent = '↕';
      header.className = 'sort-icon';
    });

    // Update the specific column's sort icon
    const targetHeader = table.querySelector(`th:nth-child(${columnIndex + 1}) .sort-icon`);
    if (targetHeader) {
      if (direction === 'asc') {
        targetHeader.textContent = '↑';
        targetHeader.className = 'sort-icon sort-asc';
      } else if (direction === 'desc') {
        targetHeader.textContent = '↓';
        targetHeader.className = 'sort-icon sort-desc';
      } else {
        targetHeader.textContent = '↕';
        targetHeader.className = 'sort-icon';
      }
    }

  } catch (error) {
    console.error('❌ Error updating sort icons:', error);
  }
}

/**
 * Check if value is a valid date
 *
 * @param {*} value - Value to check
 * @returns {boolean} True if value is a valid date
 */
function isDateValue(value) {
  if (!value) {return false;}
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Save sort state for a specific table type
 *
 * @param {string} tableType - Type of table
 * @param {number} columnIndex - Column index
 * @param {string} direction - Sort direction (asc/desc)
 */
window.saveSortState = async function (tableType, columnIndex, direction) {
  const sortState = {
    columnIndex,
    direction,
    timestamp: Date.now(),
  };
  if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
    await window.UnifiedCacheManager.save(`sortState_${tableType}`, sortState, {
      layer: 'localStorage',
      ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
      syncToBackend: false
    });
  } else {
    // UnifiedCacheManager לא זמין - כלל 44 violation prevented
    console.error(`UnifiedCacheManager לא זמין - לא ניתן לשמור מצב מיון (כלל 44 violation prevented): ${tableType}`);
  }
  // Sort state saved for table
};

/**
 * Get saved sort state for a table type
 *
 * @param {string} tableType - Type of table
 * @returns {Object} Sort state object with columnIndex, direction, timestamp
 */
window.getSortState = async function (tableType) {
  let savedState = null;
  if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
    savedState = await window.UnifiedCacheManager.get(`sortState_${tableType}`);
  } else {
    // UnifiedCacheManager לא זמין - כלל 44 violation prevented
    console.warn(`UnifiedCacheManager לא זמין - לא ניתן לטעון מצב מיון (כלל 44 violation prevented): ${tableType}`);
    savedState = null;
  }
  if (savedState) {
    try {
      return typeof savedState === 'string' ? JSON.parse(savedState) : savedState;
    } catch {
      // Invalid sort state for ${tableType}
    }
  }

  // Return default state
  return {
    columnIndex: -1,
    direction: 'asc',
    timestamp: Date.now(),
  };
};

/**
 * Set sort state for a specific table type
 *
 * @param {string} tableType - Type of table
 * @param {number} columnIndex - Column index
 * @param {string} direction - Sort direction (asc/desc)
 */
window.setSortState = function (tableType, columnIndex, direction) {
  window.saveSortState(tableType, columnIndex, direction);
};

window.updateSortIcons = updateSortIcons;


/**
 * Universal table sorter - can sort any table with any data
 *
 * @param {string} tableType - Type of table
 * @param {number} columnIndex - Column index
 * @param {Array} data - Data to sort
 * @param {Function} updateFunction - Function to update table
 * @returns {Array} Sorted data
 */
window.sortAnyTable = async function (tableType, columnIndex, data, updateFunction) {
  return await window.sortTableData(columnIndex, data, tableType, updateFunction);
};

/**
 * ===== OLD CODE - REPLACED BY tables.js =====
 * 
 * This function has been REPLACED by the newer version in tables.js which includes:
 * - UnifiedTableSystem integration
 * - Better error handling
 * - Support for positions/portfolio tables
 * 
 * DO NOT USE - This code is kept for reference only and will be removed in the future.
 * The new window.sortTable is defined in tables.js and loads after this file, so it overrides this one.
 * 
 * Legacy compatibility wrapper for table sorting
 *
 * @param {string|number} tableTypeOrColumnIndex - Type of table OR column index
 * @param {number} columnIndex - Column index (if first param is tableType)
 * @param {Array} dataArray - Data array (optional)
 * @param {Function} updateFunction - Update function (optional)
 * @returns {Array} Sorted data
 */
// ===== COMMENTED OUT - REPLACED BY tables.js =====
/*
window.sortTable = async function (tableTypeOrColumnIndex, columnIndex, dataArray, updateFunction) {
  // Handle legacy call with only column index
  if (typeof tableTypeOrColumnIndex === 'number' && arguments.length === 1) {
    // Find the current table element
    const currentTable = document.querySelector('table[data-table-type]');
    if (!currentTable) {
      console.warn('No table with data-table-type found');
      return;
    }
    
    const tableType = currentTable.getAttribute('data-table-type');
    const tableId = currentTable.id;
    
    // Get the table data from the current page
    let tableData = [];
    let updateFn = null;
    
    // Try to get data from page-specific functions
    if (tableType === 'executions' && window.executionsData) {
      tableData = window.executionsData;
      updateFn = (sortedData) => window.updateExecutionsTableMain(sortedData);
    } else if (tableType === 'tickers' && window.tickersData) {
      tableData = window.tickersData;
      updateFn = (sortedData) => {
        if (typeof window.updateTickersTable === 'function') {
          window.updateTickersTable(sortedData);
          // עדכון סטטיסטיקות סיכום אחרי עדכון הטבלה
          if (typeof window.updateTickersSummaryStats === 'function') {
            window.updateTickersSummaryStats(sortedData);
          }
        } else {
          console.warn('⚠️ updateTickersTable function not available');
        }
      };
    } else if (tableType === 'trading_accounts' && window.trading_accountsData) {
      tableData = window.trading_accountsData;
      updateFn = (sortedData) => {
        if (typeof window.updateTradingAccountsTable === 'function') {
          window.updateTradingAccountsTable(sortedData);
        }
      };
    } else if (tableType === 'cash_flows' && window.cashFlowsData) {
      tableData = window.cashFlowsData;
      updateFn = (sortedData) => window.updateCashFlowsTable(sortedData);
    } else if (tableType === 'alerts' && window.alertsData) {
      tableData = window.alertsData;
      updateFn = (sortedData) => window.updateAlertsTable(sortedData);
    } else if (tableType === 'notes' && window.notesData) {
      tableData = window.notesData;
      updateFn = (sortedData) => window.updateNotesTable(sortedData);
    } else if (tableType === 'trades' && window.tradesData) {
      tableData = window.tradesData;
      updateFn = (sortedData) => window.updateTradesTable(sortedData);
    } else if (tableType === 'trade_plans' && window.tradePlansData) {
      tableData = window.tradePlansData;
      updateFn = (sortedData) => window.updateTradePlansTable(sortedData);
    } else if (tableType === 'db_extradata' && window.extraDataData) {
      tableData = window.extraDataData;
      updateFn = (sortedData) => window.updateExtraDataTable(sortedData);
    } else if (tableType === 'db_display' && window.dbData) {
      tableData = window.dbData;
      updateFn = (sortedData) => window.updateDbTable(sortedData);
    } else if (tableType === 'constraints' && window.constraintsData) {
      tableData = window.constraintsData;
      updateFn = (sortedData) => window.updateConstraintsTable(sortedData);
    } else if (tableType === 'preferences' && window.preferencesData) {
      tableData = window.preferencesData;
      updateFn = (sortedData) => window.updatePreferencesTable(sortedData);
    } else {
      console.warn(`❌ [SORT] No data found for table type: ${tableType}`);
      console.warn(`❌ [SORT] Available data:`, {
        executionsData: !!window.executionsData,
        tickersData: !!window.tickersData,
        trading_accountsData: !!window.trading_accountsData,
        cashFlowsData: !!window.cashFlowsData,
        alertsData: !!window.alertsData,
        notesData: !!window.notesData,
        tradesData: !!window.tradesData,
        tradePlansData: !!window.tradePlansData,
        extraDataData: !!window.extraDataData,
        dbData: !!window.dbData,
        constraintsData: !!window.constraintsData,
        preferencesData: !!window.preferencesData
      });
      return;
    }
    
    // Validate data before sorting
    if (!Array.isArray(tableData)) {
      console.warn(`❌ [SORT] Data is not an array for table type: ${tableType}`, typeof tableData);
      return;
    }
    
    if (tableData.length === 0) {
      console.warn(`⚠️ [SORT] No data to sort for table type: ${tableType}`);
      return;
    }
    
    return await window.sortTableData(tableTypeOrColumnIndex, tableData, tableType, updateFn);
  }
  
  // Handle new call with all parameters
  return await window.sortTableData(columnIndex, dataArray, tableTypeOrColumnIndex, updateFunction);
};
*/
// ===== END OLD CODE =====

/**
 * Restore previous sort state for any table
 *
 * @param {string} tableType - Type of table
 * @param {Array} data - Data to sort
 * @param {Function} updateFunction - Function to update table
 */
window.restoreAnyTableSort = async function (tableType, data, updateFunction) {
  const sortState = await window.getSortState(tableType);
  if (sortState.columnIndex >= 0) {
    // Restoring sort state for table
    await window.sortTableData(sortState.columnIndex, data, tableType, updateFunction);
  }
};

/**
 * Apply default sorting to table (first column, ascending)
 * Only applies if no sort state exists
 *
 * @param {string} tableType - Type of table
 * @param {Array} data - Data to sort
 * @param {Function} updateFunction - Function to update table
 */
window.applyDefaultSort = async function (tableType, data, updateFunction) {
  const sortState = await window.getSortState(tableType);
  if (sortState && sortState.columnIndex >= 0) {
    return; // יש מצב שמור – לא לדרוס
  }

  // ברירות מחדל לפי סוג טבלה
  // cash_flows: תאריך בעמודה 3 → יורד (החדש ראשון)
  // executions: תאריך ביצוע בעמודה 6 → יורד
  // trades: תאריך יצירה/סגירה לפי העמודה אם קיימת; ברירת מחדל ללא שינוי
  let defaultColumn = 0;
  let defaultDirection = 'asc';

  switch (tableType) {
    case 'cash_flows':
      defaultColumn = 3;
      defaultDirection = 'desc';
      break;
    case 'executions':
      defaultColumn = 6;
      defaultDirection = 'desc';
      break;
    case 'trades':
      // אם יש עמודת תאריך (לרוב 3 או 4 בעמוד), נשאיר 3 כי היא נפוצה
      defaultColumn = 3;
      defaultDirection = 'desc';
      break;
    case 'trade_plans':
      defaultColumn = 2; // תאריך תכנון
      defaultDirection = 'desc';
      break;
    default:
      defaultColumn = 0;
      defaultDirection = 'asc';
  }

  // החלת סידור ברירת מחדל
  // אם ברירת המחדל היא יורדת, ניצור מצב קודם 'asc' לאותה עמודה כדי שהקריאה תתהפך ל-'desc'
  if (defaultDirection === 'desc') {
    await window.saveSortState(tableType, defaultColumn, 'asc');
  }
  await window.sortTableData(defaultColumn, data, tableType, updateFunction);
  // עדכון שמירת מצב לאחר הסידור
  await window.saveSortState(tableType, defaultColumn, defaultDirection);
};

/**
 * Close modal - moved here as it's often table-related
 *
 * @param {string} modalId - ID of modal to close
 */
window.closeModal = function (modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    const bootstrapModal = bootstrap.Modal.getInstance(modal);
    if (bootstrapModal) {
      bootstrapModal.hide();
    } else {
      // Fallback: hide modal manually
      modal.classList.remove('show');
      modal.style.display = 'none';
    }

    // Remove backdrop
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.remove();
    }

    // Remove modal-open class from body
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
};

// ===== GRID CORE FUNCTIONS =====
/**
 * External filter presence flag
 * Used to track if external filters are active
 */
// const externalFilterPresent = false; // לא בשימוש כרגע

/**
 * Get default column definitions for tables
 *
 * @returns {Array} Array of default column definitions
 */
if (typeof window.getDefaultColumnDefs === 'undefined') {
  const getDefaultColumnDefs = () => [
    { field: 'id', headerName: 'ID', width: 80, sortable: true },
    { field: 'name', headerName: 'Name', width: 200, sortable: true },
    { field: 'status', headerName: 'Status', width: 120, sortable: true },
    { field: 'created_at', headerName: 'Created', width: 150, sortable: true },
    { field: 'updated_at', headerName: 'Updated', width: 150, sortable: true },
  ];

  /**
   * Export default column definitions to global scope
   */
  window.getDefaultColumnDefs = getDefaultColumnDefs;
}

// ייצוא המודול עצמו
window.tables = {
  sortTableData: window.sortTableData,
  getSortState: window.getSortState,
  setSortState: window.setSortState,
  updateSortIcons: window.updateSortIcons,
  sortAnyTable: window.sortAnyTable,
  // NOTE: window.sortTable is now defined in tables.js (loads after this file)
  // It will be undefined here until tables.js loads, which is fine
  sortTable: window.sortTable,
  restoreAnyTableSort: window.restoreAnyTableSort,
  applyDefaultSort: window.applyDefaultSort,
  getCustomSortValue: getCustomSortValue,
  closeModal: window.closeModal,
  getDefaultColumnDefs: window.getDefaultColumnDefs,
};

// NOTE: window.sortTable is defined in tables.js (loads after this file)
// DO NOT redefine it here - it will cause conflicts
// The tables.js file properly exports window.sortTable

// ייצוא closeModalGlobal ככינוי ל-closeModal
window.closeModalGlobal = window.closeModal;

/**
 * Global function for loading table data
 * Generic implementation that can be used across all pages
 * v2.0.0 - Now uses CRUDResponseHandler for unified error handling
 *
 * @param {string} tableType - Type of table to load
 * @param {Function} updateFunction - Function to call with loaded data
 * @param {Object} [options] - Configuration options (v2.0.0)
 * @param {string} [options.tableId] - Table DOM ID (defaults to `${tableType}Table`)
 * @param {string} [options.entityName] - Entity name in Hebrew (defaults to tableType)
 * @param {number} [options.columns] - Number of columns (auto-detect if omitted)
 * @param {Function} [options.onRetry] - Retry function for error UI
 * @returns {Promise<Array>} Loaded data or empty array on error (NEVER THROWS)
 * 
 * @example
 * const data = await loadTableData('alerts', updateAlertsTable, {
 *   tableId: 'alertsTable',
 *   entityName: 'התראות',
 *   columns: 8,
 *   onRetry: loadAlertsData
 * });
 */
window.loadTableData = async function(tableType, updateFunction, options = {}) {
  try {
    // Show loading state if function exists
    if (typeof window.showLoadingState === 'function') {
      window.showLoadingState();
    }
    
    // Define API endpoints for different table types
    const apiEndpoints = {
      'tickers': '/api/tickers/',
      'executions': '/api/executions/',
      'trading_accounts': '/api/trading-accounts/',
      'alerts': '/api/alerts/',
      'notes': '/api/notes/',
      'trades': '/api/trades/',
      'trade_plans': '/api/trade-plans/',
      'cash_flows': '/api/cash-flows/',
      'db_extradata': '/api/db-extradata/',
      'db_display': '/api/db-display/',
      'constraints': '/api/constraints/',
      'preferences': '/api/preferences/'
    };
    
    // Get the correct API endpoint for the table type
    const apiEndpoint = apiEndpoints[tableType] || `/api/data/${tableType}`;
    
    // Fetch data from server
    const response = await fetch(`${apiEndpoint}?_t=${Date.now()}`);
    
    // Server error - use CRUDResponseHandler (v2.0.0)
    if (!response.ok) {
      // Hide loading state
      if (typeof window.hideLoadingState === 'function') {
        window.hideLoadingState();
      }
      
      // Handle with ResponseHandler - returns [] (never throws)
      return window.CRUDResponseHandler.handleLoadResponse(response, {
        tableId: options.tableId || `${tableType}Table`,
        entityName: options.entityName || tableType,
        columns: options.columns,
        onRetry: options.onRetry
      });
    }
    
    const responseData = await response.json();
    
    // Handle different response formats
    let data;
    if (responseData.data && Array.isArray(responseData.data)) {
      data = responseData.data;
    } else if (Array.isArray(responseData)) {
      data = responseData;
    } else {
      data = [];
    }
    
    console.log(`📊 Loaded ${data.length} records for ${tableType}`);
    
    // Handle empty data (0 records) - show user-friendly message in table
    if (data.length === 0) {
      const tableId = options.tableId || `${tableType}Table`;
      const tbody = document.querySelector(`#${tableId} tbody`);
      const entityName = options.entityName || tableType;
      const columns = options.columns || 5;
      
      if (tbody) {
        tbody.innerHTML = `
          <tr class="empty-state-row">
            <td colspan="${columns}" class="text-center py-5">
              <div class="empty-state-content">
                <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">אין ${entityName} להצגה</h5>
                <p class="text-muted small mb-0">לא נמצאו רשומות במערכת</p>
              </div>
            </td>
          </tr>
        `;
        console.log(`ℹ️ Displayed empty state message for ${entityName} (0 records)`);
      }
    }
    
    // Call update function if provided (even for empty data - let page handle if needed)
    if (typeof updateFunction === 'function') {
      updateFunction(data);
    }
    
    // Hide loading state if function exists
    if (typeof window.hideLoadingState === 'function') {
      window.hideLoadingState();
    }
    
    return data;
    
  } catch (error) {
    // Network error - use CRUDResponseHandler (v2.0.0)
    // Hide loading state
    if (typeof window.hideLoadingState === 'function') {
      window.hideLoadingState();
    }
    
    // Handle with ResponseHandler - returns [] (never throws)
    return window.CRUDResponseHandler.handleNetworkError(error, {
      tableId: options.tableId || `${tableType}Table`,
      entityName: options.entityName || tableType,
      columns: options.columns,
      onRetry: options.onRetry
    });
  }
};

/**
 * Global function for refreshing table data
 * Generic implementation that reloads current table data
 *
 * @param {string} tableType - Type of table to refresh
 * @param {Function} updateFunction - Function to call with refreshed data
 * @returns {Promise<Array>} Refreshed data
 */
window.refreshTable = async function(tableType, updateFunction) {
  try {
    
    // Clear any cached data for this table type
    if (window.tableData && window.tableData[tableType]) {
      delete window.tableData[tableType];
    }
    
    // Reload data
    const data = await window.loadTableData(tableType, updateFunction);
    
    // Show success notification if function exists
    if (typeof window.showSuccessNotification === 'function') {
      window.showSuccessNotification('הצלחה', `טבלת ${tableType} רועננה בהצלחה`);
    }
    
    return data;
  } catch (error) {
    console.error(`❌ Error refreshing table ${tableType}:`, error);
    
    // Show error notification if function exists
    if (typeof window.showErrorNotification === 'function') {
      window.showErrorNotification('שגיאה', `שגיאה ברענון טבלת ${tableType}: ${error.message}`);
    }
    
    throw error;
  }
};

// ===== UNIFIED CACHE INTEGRATION =====

/**
 * Load table data from unified cache
 * Loads table data from the unified cache system with fallback to server
 *
 * @param {string} tableId - Table identifier
 * @param {Object} filters - Table filters
 * @param {Function} serverLoader - Server data loader function
 * @returns {Promise<Array>} Table data
 */
window.loadTableDataFromCache = async function(tableId, filters = {}, serverLoader = null) {
  try {
    if (!window.UnifiedCacheManager) {
      console.warn('⚠️ UnifiedCacheManager not available, using direct server load');
      return serverLoader ? await serverLoader() : [];
    }

    // יצירת מפתח cache ייחודי
    const cacheKey = `table-${tableId}-${JSON.stringify(filters)}`;
    
    // טעינה ממטמון מאוחד
    const data = await window.UnifiedCacheManager.get(cacheKey, {
      fallback: serverLoader,
      ttl: 300000 // 5 דקות
    });
    
    return data || [];
    
  } catch (error) {
    console.error(`❌ Failed to load table ${tableId} from cache:`, error);
    return serverLoader ? await serverLoader() : [];
  }
};

/**
 * Save table data to unified cache
 * Saves table data to the unified cache system
 *
 * @param {string} tableId - Table identifier
 * @param {Array} data - Table data
 * @param {Object} filters - Table filters
 * @returns {Promise<boolean>} Success status
 */
window.saveTableDataToCache = async function(tableId, data, filters = {}) {
  try {
    if (!window.UnifiedCacheManager) {
      console.warn('⚠️ UnifiedCacheManager not available, skipping cache save');
      return false;
    }

    // יצירת מפתח cache ייחודי
    const cacheKey = `table-${tableId}-${JSON.stringify(filters)}`;
    
    // שמירה במטמון מאוחד
    const result = await window.UnifiedCacheManager.save(cacheKey, data, {
      ttl: 300000, // 5 דקות
      syncToBackend: false
    });
    
    if (result) {
    }
    
    return result;
    
  } catch (error) {
    console.error(`❌ Failed to save table ${tableId} to cache:`, error);
    return false;
  }
};

/**
 * Save table UI state to cache
 * Saves table UI state (sorting, filtering, pagination) to cache
 *
 * @param {string} tableId - Table identifier
 * @param {Object} state - Table UI state
 * @returns {Promise<boolean>} Success status
 */
window.saveTableState = async function(tableId, state) {
  try {
    if (!window.UnifiedCacheManager) {
      console.warn('⚠️ UnifiedCacheManager not available, skipping state save');
      return false;
    }

    // שמירת מצב UI ב-localStorage
    const result = await window.UnifiedCacheManager.save(`table-${tableId}-state`, state, {
      layer: 'localStorage',
      ttl: 3600000 // שעה
    });
    
    if (result) {
    }
    
    return result;
    
  } catch (error) {
    console.error(`❌ Failed to save table ${tableId} state to cache:`, error);
    return false;
  }
};

/**
 * Load table UI state from cache
 * Loads table UI state (sorting, filtering, pagination) from cache
 *
 * @param {string} tableId - Table identifier
 * @returns {Promise<Object|null>} Table UI state or null
 */
window.loadTableState = async function(tableId) {
  try {
    if (!window.UnifiedCacheManager) {
      console.warn('⚠️ UnifiedCacheManager not available, returning null state');
      return null;
    }

    // טעינת מצב UI מ-localStorage
    const state = await window.UnifiedCacheManager.get(`table-${tableId}-state`);
    
    if (state) {
    }
    
    return state;
    
  } catch (error) {
    console.error(`❌ Failed to load table ${tableId} state from cache:`, error);
    return null;
  }
};

// Tables.js loaded successfully

