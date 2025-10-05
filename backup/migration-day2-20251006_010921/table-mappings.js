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
    'cash_balance',          // 4 - Cash Balance
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
    'cash_balance',          // 4 - Cash Balance
    'total_value',           // 5 - Total Value
    'total_pl',              // 6 - Total P&L
    'notes',                 // 7 - Notes
    'created_at',            // 8 - Created At
    'status_default',        // 9 - Status Default
  ],

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
    'cash_balance',    // 3 - יתרה במזומן
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
  const columns = TABLE_COLUMN_MAPPINGS[tableType] || [];
  const fieldName = columns[columnIndex];
  // console.log(`🔍 [table-mappings.js] columns:`, columns);
  // console.log(`🔍 [table-mappings.js] fieldName:`, fieldName);

  if (!fieldName) {
    // No column mapping found for table type and column index
    console.log(`⚠️ [table-mappings.js] No field name found for ${tableType}:${columnIndex}`);
    return '';
  }

  // Database Display Page - Direct field mapping
  if (tableType === 'trade_plans' || tableType === 'trades' || tableType === 'accounts' || tableType === 'trading_accounts' ||
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
      
      console.log(`🔍 [table-mappings.js] tickers mapping: ${fieldName} → ${actualFieldName} = ${result}`);
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
      
      console.log(`🔍 [table-mappings.js] cash_flows mapping: ${fieldName} = ${result}`);
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
        // For related object, we need to construct the display text
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
      
      // Handle null/undefined values for sorting
      if (result === null || result === undefined) {
        if (fieldName === 'created_at') {
          result = -Infinity; // Use -Infinity for date fields
        } else {
          result = ''; // Use empty string for text fields
        }
      }
      
      console.log(`🔍 [table-mappings.js] notes mapping: ${fieldName} = ${result}`);
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
      'accounts': {
        id: 'accounts-table',
        title: 'Accounts Table',
        columns: ['id', 'name', 'currency', 'balance', 'status'],
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
      console.log(`✅ Table config loaded for: ${tableName}`);
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
      'accounts': {
        'id': {
          title: 'ID',
          type: 'number',
          sortable: true,
          filterable: true,
          width: '80px',
          align: 'center',
          format: 'number'
        },
        'name': {
          title: 'Name',
          type: 'string',
          sortable: true,
          filterable: true,
          width: '200px',
          align: 'left',
          format: 'text'
        },
        'currency': {
          title: 'Currency',
          type: 'string',
          sortable: true,
          filterable: true,
          width: '100px',
          align: 'center',
          format: 'text'
        },
        'balance': {
          title: 'Balance',
          type: 'number',
          sortable: true,
          filterable: false,
          width: '120px',
          align: 'right',
          format: 'currency'
        },
        'status': {
          title: 'Status',
          type: 'string',
          sortable: true,
          filterable: true,
          width: '100px',
          align: 'center',
          format: 'status',
          options: ['Active', 'Inactive', 'Suspended']
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
      console.log(`✅ Column definition loaded for: ${tableName}.${columnName}`);
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
    
    console.log(`✅ Table config set for: ${tableName}`);
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
    
    console.log(`✅ Column definition set for: ${tableName}.${columnName}`);
    return true;
    
  } catch (error) {
    console.error('❌ Error setting column definition:', error);
    return false;
  }
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
window.setTableConfig = setTableConfig;
window.setColumnDefinition = setColumnDefinition;

// ייצוא המודול עצמו
window.tableMappings = {
  TABLE_COLUMN_MAPPINGS,
  getColumnValue,
  getTableMapping,
  isTableSupported,
  getTableConfig,
  getColumnDefinition,
  setTableConfig,
  setColumnDefinition,
};

// Table Mappings loaded successfully
console.log('✅ [table-mappings.js] Loaded successfully!');
console.log('✅ [table-mappings.js] window.tableMappings available:', !!window.tableMappings);
console.log('✅ [table-mappings.js] window.getColumnValue available:', !!window.getColumnValue);
