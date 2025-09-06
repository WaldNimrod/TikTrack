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
 * Version: 1.9.9
 * Last Updated: August 26, 2025
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
    'canceled': 'מבוטל',
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
    'canceled': 'מבוטל',
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
    'deleted': 'נמחק',
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
    'canceled': 'מבוטל',
  };
  return statusMap[status] || status;
}

/**
 * תרגום סוג התראה לעברית
 * @param {string} type - סוג ההתראה באנגלית
 * @returns {string} סוג ההתראה בעברית
 */
function translateAlertType(type) {
  const typeMap = {
    'price': 'מחיר',
    'volume': 'נפח',
    'technical': 'טכני',
    'news': 'חדשות',
    'time': 'זמן',
    'custom': 'מותאם אישית',
  };
  return typeMap[type] || type;
}

/**
 * תרגום תנאי התראה לעברית
 * @param {string} condition - התנאי באנגלית
 * @returns {string} התנאי בעברית
 */
function translateAlertCondition(condition) {
  const conditionMap = {
    'above': 'מעל',
    'below': 'מתחת',
    'equals': 'שווה ל',
    'not_equals': 'לא שווה ל',
    'contains': 'מכיל',
    'not_contains': 'לא מכיל',
    'starts_with': 'מתחיל ב',
    'ends_with': 'מסתיים ב',
    'greater_than': 'גדול מ',
    'less_than': 'קטן מ',
    'greater_than_or_equal': 'גדול או שווה ל',
    'less_than_or_equal': 'קטן או שווה ל',
  };
  return conditionMap[condition] || condition;
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
    'canceled': 'מבוטל',
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
 * @param {string} type - סוג הטרייד באנגלית
 * @returns {string} סוג הטרייד בעברית
 */
function translateTradeType(type) {
  const typeMap = {
    'swing': 'ספין',
    'investment': 'השקעה',
    'passive': 'פסיבי',
    'crypto': 'קריפטו',
    'other': 'אחר',
  };
  return typeMap[type] || type;
}

/**
 * תרגום סטטוס טרייד לעברית
 * @param {string} status - הסטטוס באנגלית
 * @returns {string} הסטטוס בעברית
 */
function translateTradeStatus(status) {
  const statusMap = {
    'open': 'פתוח',
    'closed': 'סגור',
    'cancelled': 'מבוטל',
    'canceled': 'מבוטל',
    'pending': 'ממתין',
    'active': 'פעיל',
    'inactive': 'לא פעיל',
  };
  return statusMap[status] || status;
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
    'scalping': 'סקלפינג',
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
    'tax': 'מס',
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
    'IBKR-tradelog-csv': 'ייבוא מקובץ IBKR',
    'IBKR-api': 'ייבוא ישיר IBKR',
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
    'load_tests': 'עומס',
  };
  return categoryNames[category] || category;
}

// ===== ייצוא פונקציות =====

// Export functions to global scope
window.translateAccountStatus = translateAccountStatus;
window.translateTickerStatus = translateTickerStatus;
window.translateNoteStatus = translateNoteStatus;
window.translateAlertStatus = translateAlertStatus;
window.translateTradePlanStatus = translateTradePlanStatus;
window.translateIsTriggered = translateIsTriggered;
window.translateAlertType = translateAlertType;
window.translateAlertCondition = translateAlertCondition;
window.translateTradeType = translateTradeType;
window.translateTradeStatus = translateTradeStatus;
window.translateCashFlowType = translateCashFlowType;
window.translateCashFlowSource = translateCashFlowSource;
window.convertExecutionActionToHebrew = translateExecutionAction; // Backward compatibility

// פונקציות מטבעות
window.getCurrencyIcon = getCurrencyIcon;
window.getTickerCurrencyDisplay = getTickerCurrencyDisplay;
window.getTickerCurrencySymbol = getTickerCurrencySymbol;
window.getCashFlowCurrencyDisplay = getCashFlowCurrencyDisplay;

// תאימות לאחור - שמות ישנים
window.convertAccountStatusToHebrew = translateAccountStatus;
window.convertTickerStatusToHebrew = translateTickerStatus;
window.convertNoteStatusToHebrew = translateNoteStatus;
window.convertAlertStatusToHebrew = translateAlertStatus;
window.convertIsTriggeredToHebrew = translateIsTriggered;
window.getTypeDisplay = translateTradeType; // trades.js
window.getTypeDisplayName = translateCashFlowType; // cash_flows.js
window.getCategoryDisplayName = translateTestCategory; // preferences-v2.js

// ===== פונקציות פורמט מספרים =====

/**
 * פורמט מספר עם פסיקים כל שלוש ספרות
 * @param {number|string} number - המספר לפורמט
 * @param {Object} options - אפשרויות פורמט
 * @returns {string} המספר בפורמט עם פסיקים
 */
function formatNumberWithCommas(number, options = {}) {
  const num = parseFloat(number) || 0;

  // הגדרת עיגול לפי גודל המספר
  let defaultOptions;
  if (Math.abs(num) >= 1000) {
    // מספרים מעל 1000 - ללא ספרות אחרי הנקודה
    defaultOptions = {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: true,
    };
  } else {
    // מספרים מתחת ל-1000 - 2 ספרות אחרי הנקודה
    defaultOptions = {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true,
    };
  }

  const finalOptions = { ...defaultOptions, ...options };

  return num.toLocaleString('he-IL', finalOptions);
}

/**
 * פורמט סכום כסף עם פסיקים וסמל מטבע
 * @param {number|string} amount - הסכום לפורמט
 * @param {string} currency - סמל המטבע (ברירת מחדל: USD)
 * @param {Object} options - אפשרויות פורמט
 * @returns {string} הסכום בפורמט מטבע עם פסיקים
 */
function formatCurrencyWithCommas(amount, currency = 'USD', options = {}) {
  const num = parseFloat(amount) || 0;

  // הגדרת עיגול לפי גודל המספר
  let defaultOptions;
  if (Math.abs(num) >= 1000) {
    // מספרים מעל 1000 - ללא ספרות אחרי הנקודה
    defaultOptions = {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
      useGrouping: true,
    };
  } else {
    // מספרים מתחת ל-1000 - 2 ספרות אחרי הנקודה
    defaultOptions = {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      useGrouping: true,
    };
  }

  const finalOptions = { ...defaultOptions, ...options };

  return num.toLocaleString('he-IL', finalOptions);
}

/**
 * צביעת סכום לפי ערך - ירוק לחיובי, אדום לשלילי
 * @param {number|string} amount - הסכום לצביעה
 * @param {string} displayText - טקסט להצגה (אופציונלי)
 * @param {HTMLElement} element - אלמנט DOM לעדכון ישיר (אופציונלי)
 * @returns {string|void} HTML עם צביעה או עדכון ישיר של האלמנט
 */
function colorAmountByValue(amount, displayText = null, element = null) {
  const numAmount = parseFloat(amount);

  // השתמש במערכת הצבעים הגלובלית
  const colors = window.getTableColors ? window.getTableColors() : { positive: '#28a745', negative: '#dc3545' };
  const color = numAmount >= 0 ? colors.positive : colors.negative;

  // אם יש אלמנט, נעדכן אותו ישירות
  if (element) {
    element.textContent = displayText || formatNumberWithCommas(numAmount);
    element.style.color = color;
    element.style.fontWeight = 'bold';
    return;
  }

  // אחרת, נחזיר HTML
  const text = displayText || formatNumberWithCommas(numAmount);
  return `<span style="color: ${color}; font-weight: bold;">${text}</span>`;
}

// ייצוא פונקציות פורמט מספרים
window.formatNumberWithCommas = formatNumberWithCommas;
window.formatCurrencyWithCommas = formatCurrencyWithCommas;
window.colorAmountByValue = colorAmountByValue;

// תאימות לאחור - שמות ישנים
window.formatNumber = formatNumberWithCommas;
window.formatCurrency = formatCurrencyWithCommas;
window.colorAmount = colorAmountByValue;

// ייצוא המודול עצמו
window.translationUtils = {
  translateAccountStatus,
  translateTickerStatus,
  translateNoteStatus,
  translateAlertStatus,
  translateAlertType,
  translateTradePlanStatus,
  translateIsTriggered,
  translateTradeType,
  translateTradePlanType,
  translateCashFlowType,
  translateCashFlowSource,
  translateTestCategory,
  translateExecutionAction,
  formatNumberWithCommas,
  formatCurrencyWithCommas,
  colorAmountByValue,
  // תאימות לאחור
  formatNumber: formatNumberWithCommas,
  formatCurrency: formatCurrencyWithCommas,
  colorAmount: colorAmountByValue,
};

// Alert Condition Translation Functions
window.translateAlertCondition = translateAlertConditionById;
window.translateConditionFields = translateConditionFields;
window.translateLegacyCondition = translateLegacyCondition;
window.findAlertById = findAlertById;
window.getConditionAttributeOptions = getConditionAttributeOptions;
window.getConditionOperatorOptions = getConditionOperatorOptions;

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
    'cancel': 'בטל',
  };
  return actionMap[action] || action;
}

// Execution Action Translations
window.translateExecutionAction = translateExecutionAction;
window.convertExecutionActionToHebrew = translateExecutionAction; // Backward compatibility

// ===== פונקציות מטבעות =====

/**
 * קבלת אייקון מטבע לפי סמל
 * @param {string} currencySymbol - סמל המטבע (USD, EUR, וכו')
 * @returns {string} אייקון המטבע
 */
function getCurrencyIcon(currencySymbol) {
  if (!currencySymbol) {return '💱';}

  const currencyIcons = {
    'USD': '💵',
    'EUR': '💶',
    'GBP': '💷',
    'JPY': '💴',
    'ILS': '₪',
    'BTC': '₿',
    'ETH': 'Ξ',
  };

  return currencyIcons[currencySymbol.toUpperCase()] || '💱';
}

/**
 * הצגת מטבע טיקר עם אייקון
 * @param {Object} ticker - אובייקט טיקר
 * @returns {string} HTML עם אייקון וסמל מטבע
 */
function getTickerCurrencyDisplay(ticker) {
  let currencySymbol = '';

  if (ticker.currency_id && window.currenciesData && window.currenciesData.length > 0) {
    // אם יש currency_id, נחפש את המטבע
    const currency = window.currenciesData.find(c => c.id === ticker.currency_id);
    if (currency) {
      currencySymbol = currency.symbol;
    }
  }

  if (currencySymbol) {
    const icon = getCurrencyIcon(currencySymbol);
    return `<span class="currency-icon">${icon}</span> ${currencySymbol}`;
  }
  return '<span class="text-muted">לא מוגדר</span>';
}

/**
 * הצגת סמל מטבע טיקר בלבד
 * @param {Object} ticker - אובייקט טיקר
 * @returns {string} סמל המטבע
 */
function getTickerCurrencySymbol(ticker) {
  let currencySymbol = '';

  if (ticker.currency_id && window.currenciesData && window.currenciesData.length > 0) {
    // אם יש currency_id, נחפש את המטבע
    const currency = window.currenciesData.find(c => c.id === ticker.currency_id);
    if (currency) {
      currencySymbol = currency.symbol;
    }
  }

  return currencySymbol || 'לא מוגדר';
}

/**
 * הצגת מטבע תזרים מזומנים עם אייקון
 * @param {Object} cashFlow - אובייקט תזרים מזומנים
 * @returns {string} HTML עם אייקון וסמל מטבע
 */
function getCashFlowCurrencyDisplay(cashFlow) {
  let currencySymbol = '';

  if (cashFlow.currency_id && window.currenciesData && window.currenciesData.length > 0) {
    // אם יש currency_id, נחפש את המטבע
    const currency = window.currenciesData.find(c => c.id === cashFlow.currency_id);
    if (currency) {
      currencySymbol = currency.symbol;
    }
  }

  if (currencySymbol) {
    const icon = getCurrencyIcon(currencySymbol);
    return `<span class="currency-icon">${icon}</span> ${currencySymbol}`;
  }
  return '<span class="text-muted">לא מוגדר</span>';
}

// ===== פונקציות תרגום תנאי התראות =====

/**
 * תרגום תנאי התראה לפי מזהה
 * @param {number} alertId - מזהה ההתראה
 * @returns {string} - מחרוזת מתורגמת לעברית
 */
function translateAlertConditionById(alertId) {
  // חיפוש ההתראה בדאטהבייס או בזכרון
  const alert = findAlertById(alertId);
  if (!alert) {
    return 'תנאי לא ידוע';
  }

  // אם יש שדות חדשים, השתמש בהם
  if (alert.condition_attribute && alert.condition_operator && alert.condition_number !== undefined) {
    return translateConditionFields(
      alert.condition_attribute,
      alert.condition_operator,
      alert.condition_number,
    );
  }

  // אחרת, השתמש בפורמט הישן
  if (alert.condition) {
    return translateLegacyCondition(alert.condition);
  }

  return 'תנאי לא ידוע';
}

/**
 * תרגום תנאי לפי שלושת השדות החדשים
 * @param {string} attribute - condition_attribute
 * @param {string} operator - condition_operator
 * @param {string|number} number - condition_number
 * @returns {string} - מחרוזת מתורגמת לעברית
 */
function translateConditionFields(attribute, operator, number) {
  // תרגום שדה התכונה
  const attributeTranslations = {
    'price': 'מחיר',
    'change': 'שינוי',
    'ma': 'ממוצע נע',
    'volume': 'נפח מסחר',
  };

  // תרגום האופרטור לסימנים חשבונאיים
  const operatorSymbols = {
    'more_than': '>',
    'less_than': '<',
    'cross': '↔',
    'cross_up': '↗',
    'cross_down': '↘',
    'change': 'Δ',
    'change_up': '↗',
    'change_down': '↘',
    'equals': '=',
  };

  const translatedAttribute = attributeTranslations[attribute] || attribute;
  const operatorSymbol = operatorSymbols[operator] || operator;

  // עיצוב המספר
  let formattedNumber = number;
  if (attribute === 'change' || attribute === 'ma') {
    // הוספת סימן אחוזים לשינוי וממוצע
    formattedNumber = `${number}%`;
  } else if (attribute === 'volume') {
    // עיצוב נפח עם פסיקים
    formattedNumber = parseInt(number).toLocaleString('he-IL');
  }

  return `${translatedAttribute} ${operatorSymbol} ${formattedNumber}`;
}

/**
 * תרגום תנאי בפורמט הישן (מחרוזת אחת)
 * @param {string} conditionString - מחרוזת התנאי בפורמט "attribute | operator | number"
 * @returns {string} - מחרוזת מתורגמת לעברית
 */
function translateLegacyCondition(conditionString) {
  if (!conditionString || typeof conditionString !== 'string') {
    return 'תנאי לא ידוע';
  }

  // פיצול המחרוזת לפי " | "
  const parts = conditionString.split(' | ');
  if (parts.length !== 3) {
    return conditionString; // החזר את המחרוזת המקורית אם הפורמט לא נכון
  }

  const [attribute, operator, number] = parts;
  return translateConditionFields(attribute, operator, number);
}

/**
 * פונקציה עזר לחיפוש התראה לפי מזהה
 * @param {number} alertId - מזהה ההתראה
 * @returns {object|null} - אובייקט ההתראה או null
 */
function findAlertById(alertId) {
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
}

/**
 * פונקציה לקבלת אפשרויות התכונות (לטפסים)
 * @returns {Array} - מערך של אובייקטים עם ערך ותווית
 */
function getConditionAttributeOptions() {
  return [
    { value: 'price', label: 'מחיר' },
    { value: 'change', label: 'שינוי' },
    { value: 'ma', label: 'ממוצע נע' },
    { value: 'volume', label: 'נפח מסחר' },
  ];
}

/**
 * פונקציה לקבלת אפשרויות האופרטורים (לטפסים)
 * @returns {Array} - מערך של אובייקטים עם ערך ותווית
 */
function getConditionOperatorOptions() {
  return [
    { value: 'more_than', label: 'יותר מ' },
    { value: 'less_than', label: 'פחות מ' },
    { value: 'cross', label: 'חוצה' },
    { value: 'cross_up', label: 'חוצה למעלה' },
    { value: 'cross_down', label: 'חוצה למטה' },
    { value: 'change', label: 'שינוי' },
    { value: 'change_up', label: 'שינוי למעלה' },
    { value: 'change_down', label: 'שינוי למטה' },
    { value: 'equals', label: 'שווה' },
  ];
}
