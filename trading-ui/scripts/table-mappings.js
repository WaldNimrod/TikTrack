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
        'entry_price',           // 6 - Entry Price
        'target_price',          // 7 - Target Price
        'stop_loss',             // 8 - Stop Loss
        'quantity',              // 9 - Quantity
        'entry_conditions',      // 10 - Entry Conditions
        'notes',                 // 11 - Notes
        'created_at',            // 12 - Created At
        'updated_at'             // 13 - Updated At
    ],

    // טבלת עיצובים (Designs)
    'designs': [
        'ticker',           // 0 - נכס
        'created_at',       // 1 - תאריך
        'investment_type',  // 2 - סוג
        'side',            // 3 - צד
        'planned_amount',  // 4 - סכום
        'target_price',    // 5 - יעד
        'stop_price',      // 6 - סטופ
        'current',         // 7 - נוכחי
        'status'           // 8 - סטטוס
    ],

    // טבלת טריידים (Trades) - Database Display Page Structure
    'trades': [
        'id',                    // 0 - ID
        'account_id',            // 1 - Account ID
        'ticker_id',             // 2 - Ticker ID
        'investment_type',       // 3 - Investment Type
        'side',                  // 4 - Side
        'status',                // 5 - Status
        'entry_price',           // 6 - Entry Price
        'current_price',         // 7 - Current Price
        'exit_price',            // 8 - Exit Price
        'quantity',              // 9 - Quantity
        'entry_date',            // 10 - Entry Date
        'exit_date',             // 11 - Exit Date
        'notes',                 // 12 - Notes
        'created_at',            // 13 - Created At
        'updated_at'             // 14 - Updated At
    ],

    // טבלת חשבונות (Accounts) - Database Display Page Structure
    'accounts': [
        'id',                    // 0 - ID
        'name',                  // 1 - Name
        'currency',              // 2 - Currency
        'balance',               // 3 - Balance
        'status',                // 4 - Status
        'created_at',            // 5 - Created At
        'updated_at'             // 6 - Updated At
    ],

    // טבלת טיקרים (Tickers) - Database Display Page Structure
    'tickers': [
        'id',                    // 0 - ID
        'symbol',                // 1 - Symbol
        'name',                  // 2 - Name
        'type',                  // 3 - Type
        'currency_id',           // 4 - Currency ID
        'remarks',               // 5 - Remarks
        'active_trades',         // 6 - Active Trades
        'created_at',            // 7 - Created At
        'updated_at'             // 8 - Updated At
    ],

    // טבלת התראות (Alerts) - Database Display Page Structure
    'alerts': [
        'id',                    // 0 - ID
        'type',                  // 1 - Type
        'status',                // 2 - Status
        'message',               // 3 - Message
        'triggered_at',          // 4 - Triggered At
        'is_triggered',          // 5 - Is Triggered
        'related_type_id',       // 6 - Related Type ID
        'related_id',            // 7 - Related ID
        'condition_attribute',   // 8 - Condition Attribute
        'condition_operator',    // 9 - Condition Operator
        'condition_number',      // 10 - Condition Number
        'created_at',            // 11 - Created At
        'updated_at'             // 12 - Updated At
    ],

    // טבלת הערות (Notes) - Database Display Page Structure
    'notes': [
        'id',                    // 0 - ID
        'entity_type',           // 1 - Entity Type
        'entity_id',             // 2 - Entity ID
        'title',                 // 3 - Title
        'content',               // 4 - Content
        'created_at',            // 5 - Created At
        'updated_at'             // 6 - Updated At
    ],

    // טבלת עסקעות (Executions) - Database Display Page Structure
    'executions': [
        'id',                    // 0 - ID
        'trade_id',              // 1 - Trade ID
        'action',                // 2 - Action
        'date',                  // 3 - Date
        'quantity',              // 4 - Quantity
        'price',                 // 5 - Price
        'fee',                   // 6 - Fee
        'source',                // 7 - Source
        'created_at'             // 8 - Created At
    ],

    // טבלת תזרימי מזומנים (Cash Flows) - Database Display Page Structure
    'cash_flows': [
        'id',                    // 0 - ID
        'account_id',            // 1 - Account ID
        'type',                  // 2 - Type
        'amount',                // 3 - Amount
        'date',                  // 4 - Date
        'description',           // 5 - Description
        'currency',              // 6 - Currency
        'currency_id',           // 7 - Currency ID
        'usd_rate',              // 8 - USD Rate
        'source',                // 9 - Source
        'external_id',           // 10 - External ID
        'created_at'             // 11 - Created At
    ],

    // טבלת תוצאות בדיקות (Test Results)
    'testResults': [
        'test_name',       // 0 - שם הבדיקה
        'status',          // 1 - סטטוס
        'duration',        // 2 - משך זמן
        'created_at',      // 3 - נוצר ב
        'details'          // 4 - פרטים
    ],

    // טבלת מטבעות (Currencies)
    'currencies': [
        'symbol',          // 0 - סמל
        'name',            // 1 - שם
        'usd_rate',        // 2 - שער דולר
        'id',              // 3 - מזהה
        'created_at'       // 4 - נוצר ב
    ],

    // טבלת סוגי קישור הערות (Note Relation Types)
    'note_relation_types': [
        'note_relation_type', // 0 - סוג קישור
        'id',                 // 1 - מזהה
        'created_at'          // 2 - נוצר ב
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
