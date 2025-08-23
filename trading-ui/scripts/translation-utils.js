/**
 * Translation Utilities - TikTrack
 * קובץ מרכזי לכל פונקציות התרגום במערכת
 * 
 * מטרה: ריכוז כל פונקציות התרגום במקום אחד לתחזוקה קלה יותר
 * כל פונקציה נקראת בשם ברור שמציין לאיזה ישות/עמוד היא מתייחסת
 * 
 * Dependencies: None (standalone utility file)
 * Dependents: All page-specific scripts, main.js, header-system.js
 * 
 * File: trading-ui/scripts/translation-utils.js
 * Version: 2.2
 * Last Updated: August 23, 2025
 */

// ===== תרגום סטטוסים =====

/**
 * תרגום סטטוס חשבון לעברית
 * @param {string} status - הסטטוס באנגלית
 * @returns {string} הסטטוס בעברית
 */
function translateAccountStatus(status) {
    const statusMap = {
        'open': 'פתוח',
        'closed': 'סגור',
        'cancelled': 'מבוטל',
        'canceled': 'מבוטל'
    };
    return statusMap[status] || status;
}

/**
 * תרגום סטטוס טיקר לעברית
 * @param {string} status - הסטטוס באנגלית
 * @returns {string} הסטטוס בעברית
 */
function translateTickerStatus(status) {
    const statusMap = {
        'open': 'פתוח',
        'closed': 'סגור',
        'cancelled': 'מבוטל',
        'canceled': 'מבוטל'
    };
    return statusMap[status] || status;
}

/**
 * תרגום סטטוס הערה לעברית
 * @param {string} status - הסטטוס באנגלית
 * @returns {string} הסטטוס בעברית
 */
function translateNoteStatus(status) {
    const statusMap = {
        'active': 'פעיל',
        'archived': 'בארכיון',
        'deleted': 'נמחק'
    };
    return statusMap[status] || status;
}

/**
 * תרגום סטטוס התראה לעברית
 * @param {string} status - הסטטוס באנגלית
 * @returns {string} הסטטוס בעברית
 */
function translateAlertStatus(status) {
    const statusMap = {
        'open': 'פתוח',
        'closed': 'סגור',
        'cancelled': 'מבוטל',
        'canceled': 'מבוטל'
    };
    return statusMap[status] || status;
}

/**
 * תרגום סטטוס תכנון טרייד לעברית
 * @param {string} status - הסטטוס באנגלית
 * @returns {string} הסטטוס בעברית
 */
function translateTradePlanStatus(status) {
    // Safeguarding against invalid values
    if (status === null || status === undefined) {
        return 'לא מוגדר';
    }

    const statusMap = {
        'open': 'פתוח',
        'closed': 'סגור',
        'cancelled': 'מבוטל',
        'canceled': 'מבוטל'
    };

    return statusMap[status.toLowerCase()] || status;
}

/**
 * תרגום האם התראה הופעלה
 * @param {boolean} isTriggered - האם הופעלה
 * @returns {string} כן/לא
 */
function translateIsTriggered(isTriggered) {
    return isTriggered ? 'כן' : 'לא';
}

// ===== תרגום סוגים =====

/**
 * תרגום סוג טרייד לעברית
 * @param {string} type - הסוג באנגלית
 * @returns {string} הסוג בעברית
 */
function translateTradeType(type) {
    const typeMap = {
        'swing': 'סווינג',
        'investment': 'השקעה',
        'passive': 'פאסיבי',
        'buy': 'קנייה',
        'sell': 'מכירה',
        'long': 'לונג',
        'short': 'שורט'
    };
    return typeMap[type] || type;
}

/**
 * תרגום סוג תכנון טרייד לעברית
 * @param {string} type - הסוג באנגלית
 * @returns {string} הסוג בעברית
 */
function translateTradePlanType(type) {
    // Safeguarding against invalid values
    if (type === null || type === undefined) {
        return 'לא מוגדר';
    }

    const typeMap = {
        'swing': 'סווינג',
        'investment': 'השקעה',
        'passive': 'פאסיבי',
        'day_trading': 'דיי טריידינג',
        'scalping': 'סקלפינג'
    };

    return typeMap[type.toLowerCase()] || type;
}

/**
 * תרגום סוג תזרים מזומנים לעברית
 * @param {string} type - הסוג באנגלית
 * @returns {string} הסוג בעברית
 */
function translateCashFlowType(type) {
    const typeNames = {
        'deposit': 'הפקדה',
        'withdrawal': 'משיכה',
        'dividend': 'דיבידנד',
        'fee': 'עמלה',
        'interest': 'ריבית',
        'bonus': 'בונוס',
        'tax': 'מס'
    };
    return typeNames[type] || type;
}

/**
 * תרגום מקור תזרים מזומנים לעברית
 * @param {string} source - המקור באנגלית
 * @returns {string} המקור בעברית
 */
function translateCashFlowSource(source) {
    const sourceNames = {
        'manual': 'ידני',
        'file_import': 'ייבוא מקובץ',
        'direct_import': 'ייבוא ישיר',
        'api': 'API',
        'broker': 'ברוקר'
    };
    return sourceNames[source] || source;
}

// ===== תרגום קטגוריות =====

/**
 * תרגום שם קטגורית בדיקה לעברית
 * @param {string} category - הקטגוריה באנגלית
 * @returns {string} הקטגוריה בעברית
 */
function translateTestCategory(category) {
    const categoryNames = {
        'unit_tests': 'יחידה',
        'integration_tests': 'אינטגרציה',
        'e2e_tests': 'End-to-End',
        'performance_tests': 'ביצועים',
        'security_tests': 'אבטחה',
        'load_tests': 'עומס'
    };
    return categoryNames[category] || category;
}

// ===== ייצוא פונקציות =====

// ייצוא לשימוש גלובלי
if (typeof window !== 'undefined') {
    // תרגום סטטוסים
    window.translateAccountStatus = translateAccountStatus;
    window.translateTickerStatus = translateTickerStatus;
    window.translateNoteStatus = translateNoteStatus;
    window.translateAlertStatus = translateAlertStatus;
    window.translateTradePlanStatus = translateTradePlanStatus;
    window.translateIsTriggered = translateIsTriggered;

    // תרגום סוגים
    window.translateTradeType = translateTradeType;
    window.translateTradePlanType = translateTradePlanType;
    window.translateCashFlowType = translateCashFlowType;
    window.translateCashFlowSource = translateCashFlowSource;

    // תרגום קטגוריות
    window.translateTestCategory = translateTestCategory;

    // תאימות לאחור - שמות ישנים
    window.convertAccountStatusToHebrew = translateAccountStatus;
    window.convertTickerStatusToHebrew = translateTickerStatus;
    window.convertNoteStatusToHebrew = translateNoteStatus;
    window.convertAlertStatusToHebrew = translateAlertStatus;
    window.convertIsTriggeredToHebrew = translateIsTriggered;
    window.getTypeDisplay = translateTradeType; // trades.js
    window.getTypeDisplayName = translateCashFlowType; // cash_flows.js
    window.getCategoryDisplayName = translateTestCategory; // preferences.js

    // פונקציה כללית לצביעת סכומים - ירוק לחיובי, אדום לשלילי
    window.colorAmount = function (amount, displayText = null) {
        const numAmount = parseFloat(amount);
        const color = numAmount >= 0 ? '#28a745' : '#dc3545'; // ירוק לחיובי, אדום לשלילי
        const text = displayText || (numAmount.toLocaleString ? numAmount.toLocaleString() : numAmount.toString());
        return `<span style="color: ${color}; font-weight: bold;">${text}</span>`;
    };

    console.log('✅ Translation utilities loaded successfully');
}

/**
 * תרגום פעולת ביצוע לעברית
 * @param {string} action - הפעולה באנגלית
 * @returns {string} הפעולה בעברית
 */
function translateExecutionAction(action) {
    const actionMap = {
        'buy': 'קנה',
        'sell': 'מכר',
        'hold': 'החזק',
        'close': 'סגר',
        'cancel': 'בטל'
    };
    return actionMap[action] || action;
}

// Execution Action Translations
window.translateExecutionAction = translateExecutionAction;
window.convertExecutionActionToHebrew = translateExecutionAction; // Backward compatibility
