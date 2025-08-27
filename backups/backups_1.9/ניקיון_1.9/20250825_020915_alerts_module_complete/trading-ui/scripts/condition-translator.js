/**
 * Condition Translator Utility
 * פונקציה גלובלית לתרגום תנאי התראות
 * 
 * File: trading-ui/scripts/condition-translator.js
 * Version: 1.0.0
 * Last Updated: August 24, 2025
 * 
 * Features:
 * - תרגום תנאי התראות לעברית
 * - תמיכה בפורמט החדש (3 שדות נפרדים)
 * - תמיכה בפורמט הישן (מחרוזת אחת)
 * - פונקציה גלובלית לשימוש בכל מקום בממשק
 * 
 * Usage:
 * - window.translateAlertCondition(alertId) - תרגום לפי מזהה התראה
 * - window.translateConditionFields(attribute, operator, number) - תרגום לפי שדות
 * - window.translateLegacyCondition(conditionString) - תרגום פורמט ישן
 */

/**
 * תרגום תנאי התראה לפי מזהה
 * @param {number} alertId - מזהה ההתראה
 * @returns {string} - מחרוזת מתורגמת לעברית
 */
window.translateAlertCondition = function (alertId) {
    // חיפוש ההתראה בדאטהבייס או בזכרון
    const alert = window.findAlertById(alertId);
    if (!alert) {
        return 'תנאי לא ידוע';
    }

    // אם יש שדות חדשים, השתמש בהם
    if (alert.condition_attribute && alert.condition_operator && alert.condition_number !== undefined) {
        return window.translateConditionFields(
            alert.condition_attribute,
            alert.condition_operator,
            alert.condition_number
        );
    }

    // אחרת, השתמש בפורמט הישן
    if (alert.condition) {
        return window.translateLegacyCondition(alert.condition);
    }

    return 'תנאי לא ידוע';
};

/**
 * תרגום תנאי לפי שלושת השדות החדשים
 * @param {string} attribute - condition_attribute
 * @param {string} operator - condition_operator  
 * @param {string|number} number - condition_number
 * @returns {string} - מחרוזת מתורגמת לעברית
 */
window.translateConditionFields = function (attribute, operator, number) {
    // תרגום שדה התכונה
    const attributeTranslations = {
        'price': 'מחיר',
        'change': 'שינוי',
        'ma': 'ממוצע נע',
        'volume': 'נפח מסחר'
    };

    // תרגום האופרטור
    const operatorTranslations = {
        'more_than': 'יותר מ',
        'less_than': 'פחות מ',
        'cross': 'חוצה',
        'cross_up': 'חוצה למעלה',
        'cross_down': 'חוצה למטה',
        'change': 'שינוי',
        'change_up': 'שינוי למעלה',
        'change_down': 'שינוי למטה',
        'equals': 'שווה'
    };

    const translatedAttribute = attributeTranslations[attribute] || attribute;
    const translatedOperator = operatorTranslations[operator] || operator;

    // עיצוב המספר
    let formattedNumber = number;
    if (attribute === 'change' || attribute === 'ma') {
        // הוספת סימן אחוזים לשינוי וממוצע
        formattedNumber = `${number}%`;
    } else if (attribute === 'volume') {
        // עיצוב נפח עם פסיקים
        formattedNumber = parseInt(number).toLocaleString('he-IL');
    }

    return `${translatedAttribute} ${translatedOperator} ${formattedNumber}`;
};

/**
 * תרגום תנאי בפורמט הישן (מחרוזת אחת)
 * @param {string} conditionString - מחרוזת התנאי בפורמט "attribute | operator | number"
 * @returns {string} - מחרוזת מתורגמת לעברית
 */
window.translateLegacyCondition = function (conditionString) {
    if (!conditionString || typeof conditionString !== 'string') {
        return 'תנאי לא ידוע';
    }

    // פיצול המחרוזת לפי " | "
    const parts = conditionString.split(' | ');
    if (parts.length !== 3) {
        return conditionString; // החזר את המחרוזת המקורית אם הפורמט לא נכון
    }

    const [attribute, operator, number] = parts;
    return window.translateConditionFields(attribute, operator, number);
};

/**
 * פונקציה עזר לחיפוש התראה לפי מזהה
 * @param {number} alertId - מזהה ההתראה
 * @returns {object|null} - אובייקט ההתראה או null
 */
window.findAlertById = function (alertId) {
    // חיפוש בקומפוננטת ההתראות הפעילות
    const activeAlertsComponent = document.querySelector('active-alerts');
    if (activeAlertsComponent && activeAlertsComponent.alerts) {
        return activeAlertsComponent.alerts.find(alert => alert.id === alertId);
    }

    // חיפוש גלובלי (אם יש)
    if (window.globalAlerts && window.globalAlerts.length) {
        return window.globalAlerts.find(alert => alert.id === alertId);
    }

    return null;
};

/**
 * פונקציה לקבלת אפשרויות התכונות (לטפסים)
 * @returns {Array} - מערך של אובייקטים עם ערך ותווית
 */
window.getConditionAttributeOptions = function () {
    return [
        { value: 'price', label: 'מחיר' },
        { value: 'change', label: 'שינוי' },
        { value: 'ma', label: 'ממוצע נע' },
        { value: 'volume', label: 'נפח מסחר' }
    ];
};

/**
 * פונקציה לקבלת אפשרויות האופרטורים (לטפסים)
 * @returns {Array} - מערך של אובייקטים עם ערך ותווית
 */
window.getConditionOperatorOptions = function () {
    return [
        { value: 'more_than', label: 'יותר מ' },
        { value: 'less_than', label: 'פחות מ' },
        { value: 'cross', label: 'חוצה' },
        { value: 'cross_up', label: 'חוצה למעלה' },
        { value: 'cross_down', label: 'חוצה למטה' },
        { value: 'change', label: 'שינוי' },
        { value: 'change_up', label: 'שינוי למעלה' },
        { value: 'change_down', label: 'שינוי למטה' },
        { value: 'equals', label: 'שווה' }
    ];
};

// הוספה ל-global scope
console.log('🔧 Condition Translator loaded successfully');
