// ===== מיפוי עמודות לכל הטבלאות באתר =====
// Table Column Mappings for All Tables
// 
// This file centralizes all table column mappings for the entire application.
// All sorting and data display functions use these mappings to ensure consistency.
// 
// File: trading-ui/scripts/table-mappings.js
// Dependencies: None (standalone utility file)
// Dependents: main.js, all page-specific scripts

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
        'ticker',          // 0 - טיקר
        'status',          // 1 - סטטוס
        'investment_type', // 2 - סוג
        'side',            // 3 - צד
        'total_pl',        // 4 - רווח/הפסד
        'trade_plan_id',   // 5 - תוכנית
        'created_at',      // 6 - נוצר ב
        'closed_at',       // 7 - נסגר ב
        'notes'            // 8 - הערות
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
        'id',              // 0 - מזהה
        'symbol',          // 1 - סמל
        'name',            // 2 - שם
        'type',            // 3 - סוג
        'currency',        // 4 - מטבע
        'created_at'       // 5 - נוצר ב
    ],

    // טבלת התראות (Alerts)
    'alerts': [
        'id',              // 0 - מזהה
        'ticker',          // 1 - טיקר
        'type',            // 2 - סוג
        'status',          // 3 - סטטוס
        'created_at'       // 4 - נוצר ב
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
        'id',              // 0 - מזהה
        'account_id',      // 1 - מזהה חשבון
        'type',            // 2 - סוג
        'amount',          // 3 - סכום
        'date',            // 4 - תאריך
        'description',     // 5 - תיאור
        'currency',        // 6 - מטבע
        'created_at'       // 7 - נוצר ב
    ],

    // טבלת עיצובים (Designs) - זהה לתכנונים
    'designs': [
        'id',              // 0 - מזהה
        'ticker',          // 1 - טיקר
        'created_at',      // 2 - נוצר ב
        'investment_type', // 3 - סוג השקעה
        'side',            // 4 - צד
        'planned_amount',  // 5 - סכום מתוכנן
        'target_price',    // 6 - מחיר יעד
        'stop_price',      // 7 - מחיר עצירה
        'status'           // 8 - סטטוס
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

    // טיפול מיוחד בשדות מורכבים
    if (tableType === 'planning' && fieldName === 'ticker') {
        return item.ticker ? (item.ticker.symbol || item.ticker.name || '') : '';
    }

    if (tableType === 'trades') {
        if (fieldName === 'account') {
            return item.account ? (item.account.name || '') : '';
        }
        if (fieldName === 'ticker') {
            return item.ticker ? (item.ticker.symbol || item.ticker.name || '') : '';
        }
        if (fieldName === 'trade_plan_id') {
            return item.trade_plan_id || '';
        }
    }

    if (tableType === 'designs') {
        if (fieldName === 'ticker') {
            return item.ticker ? (item.ticker.symbol || item.ticker.name || '') : '';
        }
    }

    if (tableType === 'alerts') {
        if (fieldName === 'ticker') {
            return item.ticker ? (item.ticker.symbol || item.ticker.name || '') : '';
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
