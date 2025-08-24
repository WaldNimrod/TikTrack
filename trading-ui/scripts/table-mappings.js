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
    // טבלת תכנונים (Planning)
    'planning': [
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

    // טבלת טריידים (Trades)
    'trades': [
        'account_name',    // 0 - חשבון
        'ticker_symbol',   // 1 - טיקר
        'trade_plan_id',   // 2 - תוכנית
        'status',          // 3 - סטטוס
        'investment_type', // 4 - סוג
        'side',            // 5 - צד
        'created_at',      // 6 - נוצר ב
        'closed_at',       // 7 - נסגר ב
        'total_pl',        // 8 - רווח/הפסד
        'notes',           // 9 - הערות
        'actions'          // 10 - פעולות
    ],

    // טבלת חשבונות (Accounts)
    'accounts': [
        'id',              // 0 - מזהה
        'name',            // 1 - שם
        'status',          // 2 - סטטוס
        'currency',        // 3 - מטבע
        'cash_balance',    // 4 - יתרה במזומן
        'created_at'       // 5 - נוצר ב
    ],

    // טבלת טיקרים (Tickers)
    'tickers': [
        'symbol',          // 0 - סמל
        'name',            // 1 - שם
        'type',            // 2 - סוג
        'remarks',         // 3 - הערות
        'currency',        // 4 - מטבע
        'active_trades',   // 5 - טריידים פעילים
        'created_at',      // 6 - נוצר ב
        'updated_at'       // 7 - עודכן ב
    ],

    // טבלת התראות (Alerts)
    'alerts': [
        'id',              // 0 - מזהה
        'ticker',          // 1 - טיקר
        'type',            // 2 - סוג
        'condition',       // 3 - תנאי
        'status',          // 4 - סטטוס
        'created_at'       // 5 - נוצר ב
    ],

    // טבלת הערות (Notes)
    'notes': [
        'id',              // 0 - מזהה
        'title',           // 1 - כותרת
        'type',            // 2 - סוג
        'created_at',      // 3 - נוצר ב
        'updated_at'       // 4 - עודכן ב
    ],

    // טבלת עסקעות (Executions)
    'executions': [
        'id',              // 0 - מזהה
        'trade_id',        // 1 - מזהה טרייד
        'action',          // 2 - פעולה
        'date',            // 3 - תאריך
        'quantity',        // 4 - כמות
        'price',           // 5 - מחיר
        'fee',             // 6 - עמלה
        'source',          // 7 - מקור
        'created_at'       // 8 - נוצר ב
    ],

    // טבלת תזרימי מזומנים (Cash Flows)
    'cash_flows': [
        'account_id',      // 0 - חשבון
        'type',            // 1 - סוג
        'amount',          // 2 - סכום
        'currency',        // 3 - מטבע
        'exchange_rate',   // 4 - שער דולר
        'date',            // 5 - תאריך
        'description',     // 6 - תיאור
        'source',          // 7 - מקור
        'external_id',     // 8 - מזהה חיצוני
        'created_at'       // 9 - נוצר ב
    ],

    // הערה: 'designs' הוסר - משתמשים ב-'trade_plans' במקום
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

    // טיפול מיוחד בשדות מורכבים
    if (tableType === 'planning' && fieldName === 'ticker') {
        return item.ticker ? (item.ticker.symbol || item.ticker.name || '') : '';
    }

    if (tableType === 'trades') {
        if (fieldName === 'account_name') {
            return item.account_name || item.account_id || '';
        }
        if (fieldName === 'ticker_symbol') {
            return item.ticker_symbol || item.ticker_id || '';
        }
        if (fieldName === 'trade_plan_id') {
            return item.trade_plan_id || '';
        }
        if (fieldName === 'actions') {
            return ''; // לא ממיינים לפי עמודת פעולות
        }
    }

    // הערה: הלוגיקה עבור 'designs' הוסרה - משתמשים ב-'trade_plans' במקום

    if (tableType === 'alerts') {
        if (fieldName === 'ticker') {
            return item.ticker ? (item.ticker.symbol || item.ticker.name || '') : '';
        }
    }

    if (tableType === 'cash_flows') {
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

    if (tableType === 'tickers') {
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

console.log('✅ Table Mappings loaded successfully');
