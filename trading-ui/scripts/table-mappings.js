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
        'created_at'             // 13 - Created At
    ],

    // טבלת טריידים (Trades) - Database Display Page Structure
    'trades': [
        'id',                    // 0 - ID
        'account_id',            // 1 - Account ID
        'ticker_id',             // 2 - Ticker ID
        'trade_plan_id',         // 3 - Trade Plan ID
        'status',                // 4 - Status
        'investment_type',       // 5 - Investment Type
        'side',                  // 6 - Side
        'closed_at',             // 7 - Closed At
        'cancelled_at',          // 8 - Cancelled At
        'cancel_reason',         // 9 - Cancel Reason
        'total_pl',              // 10 - Total P&L
        'notes',                 // 11 - Notes
        'created_at'             // 12 - Created At
    ],

    // טבלת חשבונות (Accounts) - Database Display Page Structure
    'accounts': [
        'id',                    // 0 - ID
        'name',                  // 1 - Name
        'currency',              // 2 - Currency
        'status',                // 3 - Status
        'cash_balance',          // 4 - Cash Balance
        'total_value',           // 5 - Total Value
        'total_pl',              // 6 - Total P&L
        'notes',                 // 7 - Notes
        'created_at'             // 8 - Created At
    ],

    // טבלת טיקרים (Tickers) - Database Display Page Structure
    'tickers': [
        'id',                    // 0 - ID
        'symbol',                // 1 - Symbol
        'name',                  // 2 - Name
        'type',                  // 3 - Type
        'remarks',               // 4 - Remarks
        'currency_id',           // 5 - Currency ID
        'active_trades',         // 6 - Active Trades
        'created_at',            // 7 - Created At
        'updated_at'             // 8 - Updated At
    ],

    // טבלת ביצועים (Executions) - Database Display Page Structure
    'executions': [
        'id',                    // 0 - ID
        'trade_id',              // 1 - Trade ID
        'action',                // 2 - Action
        'date',                  // 3 - Date
        'quantity',              // 4 - Quantity
        'price',                 // 5 - Price
        'fee',                   // 6 - Fee
        'source',                // 7 - Source
        'notes',                 // 8 - Notes
        'created_at'             // 9 - Created At
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
        'created_at'             // 10 - Created At
    ],

    // טבלת התראות (Alerts) - Database Display Page Structure
    'alerts': [
        'id',                    // 0 - ID
        'account_id',            // 1 - Account ID
        'ticker_id',             // 2 - Ticker ID
        'message',               // 3 - Message
        'triggered_at',          // 4 - Triggered At
        'status',                // 5 - Status
        'is_triggered',          // 6 - Is Triggered
        'related_type_id',       // 7 - Related Type ID
        'related_id',            // 8 - Related ID
        'condition_attribute',   // 9 - Condition Attribute
        'condition_operator',    // 10 - Condition Operator
        'condition_number',      // 11 - Condition Number
        'created_at'             // 12 - Created At
    ],

    // טבלת הערות (Notes) - Database Display Page Structure
    'notes': [
        'id',                    // 0 - ID
        'content',               // 1 - Content
        'attachment',            // 2 - Attachment
        'related_type_id',       // 3 - Related Type ID
        'related_id',            // 4 - Related ID
        'created_at'             // 5 - Created At
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
        'account_name'     // 8 - שם חשבון
    ],

    'executions_legacy': [
        'action',          // 0 - פעולה
        'date',            // 1 - תאריך
        'quantity',        // 2 - כמות
        'price',           // 3 - מחיר
        'fee',             // 4 - עמלה
        'source',          // 5 - מקור
        'notes'            // 6 - הערות
    ],

    'alerts_legacy': [
        'condition',       // 0 - תנאי
        'message',         // 1 - הודעה
        'is_triggered',    // 2 - הופעל
        'triggered_at',    // 3 - הופעל ב
        'status',          // 4 - סטטוס
        'related_type',    // 5 - סוג קשור
        'related_id'       // 6 - מזהה קשור
    ],

    'cash_flows_legacy': [
        'type',            // 0 - סוג
        'amount',          // 1 - סכום
        'date',            // 2 - תאריך
        'description',     // 3 - תיאור
        'currency',        // 4 - מטבע
        'source',          // 5 - מקור
        'external_id'      // 6 - מזהה חיצוני
    ],

    'tickers_legacy': [
        'symbol',          // 0 - סמל
        'name',            // 1 - שם
        'type',            // 2 - סוג
        'remarks',         // 3 - הערות
        'currency',        // 4 - מטבע
        'active_trades'    // 5 - טריידים פעילים
    ],

    'accounts_legacy': [
        'name',            // 0 - שם
        'currency',        // 1 - מטבע
        'status',          // 2 - סטטוס
        'cash_balance',    // 3 - יתרה במזומן
        'total_value',     // 4 - ערך כולל
        'total_pl',        // 5 - רווח/הפסד כולל
        'notes'            // 6 - הערות
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
        'ticker_symbol'    // 9 - סמל טיקר
    ],

    'notes_legacy': [
        'content',         // 0 - תוכן
        'attachment',      // 1 - קובץ מצורף
        'related_type',    // 2 - סוג קשור
        'related_id'       // 3 - מזהה קשור
    ],

    'designs': [
        'id',              // 0 - מזהה
        'name',            // 1 - שם
        'description',     // 2 - תיאור
        'ticker',          // 3 - טיקר
        'status',          // 4 - סטטוס
        'created_at'       // 5 - נוצר ב
    ],

    'currencies': [
        'id',              // 0 - מזהה
        'symbol',          // 1 - סמל
        'name',            // 2 - שם
        'usd_rate',        // 3 - שער דולר
        'usd_rate_default', // 4 - שער דולר ברירת מחדל
        'created_at'       // 5 - נוצר ב
    ],

    'note_relation_types': [
        'id',              // 0 - מזהה
        'note_relation_type', // 1 - סוג קשר
        'created_at'       // 2 - נוצר ב
    ],

    // Test Page Tables - דף הבדיקה
    'test_trades': [
        'ticker',          // 0 - טיקר
        'status',          // 1 - סטטוס
        'type',            // 2 - טיפוס
        'account',         // 3 - חשבון
        'date',            // 4 - תאריך
        'quantity',        // 5 - כמות
        'price',           // 6 - מחיר
        'value'            // 7 - ערך
    ],

    'test_general': [
        'name',            // 0 - שם
        'status',          // 1 - סטטוס
        'type',            // 2 - טיפוס
        'account',         // 3 - חשבון
        'date',            // 4 - תאריך
        'amount'           // 5 - סכום
    ],

    'test_notifications': [
        'date',            // 0 - תאריך
        'type',            // 1 - טיפוס
        'title',           // 2 - כותרת
        'description',     // 3 - תיאור
        'account',         // 4 - חשבון
        'status'           // 5 - סטטוס
    ]
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
        console.warn(`⚠️ No column mapping found for ${tableType} column ${columnIndex}`);
        return '';
    }

    console.log(`🔍 getColumnValue: tableType=${tableType}, columnIndex=${columnIndex}, fieldName=${fieldName}, item:`, item);

    // Database Display Page - Direct field mapping
    if (tableType === 'trade_plans' || tableType === 'trades' || tableType === 'accounts' ||
        tableType === 'tickers' || tableType === 'notes' ||
        tableType === 'executions' || tableType === 'cash_flows') {

        // Return the field value directly from the item
        return item[fieldName] || '';
    }

    // Test Page Tables - Direct field mapping from HTML cells
    if (tableType === 'test_trades' || tableType === 'test_general' || tableType === 'test_notifications') {
        // For test tables, the data comes from HTML cells, so we return the field name
        // The actual value extraction is handled in the filter functions
        return item[fieldName] || '';
    }

    // Alerts table - special handling for condition translation
    if (tableType === 'alerts') {
        if (fieldName === 'condition') {
            if (item.condition_attribute && item.condition_operator && item.condition_number && window.translateConditionFields) {
                return window.translateConditionFields(item.condition_attribute, item.condition_operator, item.condition_number);
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
        // For other fields, return directly
        return item[fieldName] || '';
    }

    // Legacy support for other table types
    if (tableType === 'designs') {
        if (fieldName === 'ticker') {
            return item.ticker ? (item.ticker.symbol || item.ticker.name || '') : '';
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
                console.log(`🔍 investment_type returning: ${result} (translated)`);
                return result;
            }
            const typeDisplay = item.investment_type === 'long' ? 'לונג' :
                item.investment_type === 'short' ? 'שורט' :
                    item.investment_type === 'swing' ? 'סווינג' :
                        item.investment_type === 'day' ? 'יומי' :
                            item.investment_type === 'scalp' ? 'סקלפינג' :
                                item.investment_type || '';
            console.log(`🔍 investment_type returning: ${typeDisplay} (fallback)`);
            return typeDisplay;
        }
        if (fieldName === 'actions') {
            return ''; // לא ממיינים לפי עמודת פעולות
        }
    }

    // Legacy executions table (for specific pages)
    if (tableType === 'executions_legacy') {
        console.log('🔍 getColumnValue - executions table:', { fieldName, item });

        if (fieldName === 'symbol') {
            return item.symbol || item.ticker_symbol || '';
        }
        if (fieldName === 'trade_info') {
            return item.trade_info || '';
        }
        if (fieldName === 'action') {
            const actionDisplay = (item.action || item.type) === 'buy' ? 'קניה' :
                (item.action || item.type) === 'sell' ? 'מכירה' : (item.action || item.type);
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
            if (item.condition_attribute && item.condition_operator && item.condition_number && window.translateConditionFields) {
                return window.translateConditionFields(item.condition_attribute, item.condition_operator, item.condition_number);
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

// ===== ייצוא הפונקציות והמיפויים =====
// Export functions and mappings to global scope
// 
// These functions are made available globally for use by other scripts.
// All table-related scripts depend on these functions being available.

window.TABLE_COLUMN_MAPPINGS = TABLE_COLUMN_MAPPINGS;
window.getColumnValue = getColumnValue;
window.getTableMapping = getTableMapping;
window.isTableSupported = isTableSupported;

// ייצוא המודול עצמו
window.tableMappings = {
    TABLE_COLUMN_MAPPINGS,
    getColumnValue,
    getTableMapping,
    isTableSupported
};

// אתחול Table Mappings
function initializeTableMappings() {
    // Table Mappings loaded successfully
}
