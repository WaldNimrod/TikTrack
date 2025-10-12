/**
 * Unified Color Scheme System
 * מערכת מפתח צבעים מאוחדת
 *
 * קובץ זה מגדיר את כל מפתחות הצבעים במערכת בצורה מאוחדת
 * ומאפשר שימוש עקבי בכל העמודים והמודולים
 *
 * ⚠️ NOTE FOR FUTURE DEVELOPER:
 * Dark mode support was removed in January 2025 - only light mode is currently supported.
 * Dark mode will be implemented in a future version.
 * All dark-related functions and variables have been removed.
 *
 * @author TikTrack System
 * @version 2.1.0
 * @lastUpdated January 21, 2025
 * @since 2025-01-09
 */

// ===== ENTITY TYPE DEFINITIONS =====
// הגדרות סוגי ישויות במערכת

/**
 * סוגי ישויות תקפים במערכת
 * Valid entity types in the system
 */
const VALID_ENTITY_TYPES = [
  // Trading & Investment
  'trade',           // טריידים
  'trade_plan',      // תכנוני השקעה
  'execution',       // עסקאות

  // Financial
  'account',         // חשבונות
  'cash_flow',       // תזרים מזומנים

  // Market Data
  'ticker',          // טיקרים
  'alert',           // התראות

  // Documentation
  'note',            // הערות

  // System
  'constraint',      // אילוצים
  'design',          // עיצובים
  'research',        // מחקר
  'preference',       // העדפות
];

// ===== DYNAMIC COLOR SCHEME =====
// מערכת צבעים דינמית

/**
 * צבעי ישויות דינמיים - נטענים מההעדפות
 * Dynamic entity colors - loaded from preferences
 */
let ENTITY_COLORS = {
  // ברירות מחדל
  'trade': '#007bff',
  'trade_plan': '#0056b3',
  'execution': '#17a2b8',
  'account': '#1b0b75',
  'cash_flow': '#20c997',
  'ticker': '#019193',
  'alert': '#ff9c05',
  'note': '#6f42c1',
  'constraint': '#6c757d',
  'design': '#495057',
  'research': '#343a40',
  'preference': '#adb5bd',
};

/**
 * צבעי רקע שקופים דינמיים - מחושבים מהצבעים העיקריים
 * Dynamic transparent background colors - calculated from main colors
 */
let ENTITY_BACKGROUND_COLORS = {
  // ברירות מחדל
  'trade': 'rgba(0, 123, 255, 0.1)',
  'trade_plan': 'rgba(0, 86, 179, 0.1)',
  'execution': 'rgba(23, 162, 184, 0.1)',
  'account': 'rgba(27, 11, 117, 0.1)',
  'cash_flow': 'rgba(32, 201, 151, 0.1)',
  'ticker': 'rgba(1, 145, 147, 0.1)',
  'alert': 'rgba(255, 156, 5, 0.1)',
  'note': 'rgba(111, 66, 193, 0.1)',
  'constraint': 'rgba(108, 117, 125, 0.1)',
  'design': 'rgba(73, 80, 87, 0.1)',
  'research': 'rgba(52, 58, 64, 0.1)',
  'preference': 'rgba(173, 181, 189, 0.1)',
};

/**
 * צבעי סטטוסים דינמיים - נטענים מההעדפות
 * Dynamic status colors - loaded from preferences
 */
let STATUS_COLORS = {
  'open': {
    light: '#cce7ff',
    medium: '#0066cc',
    border: '#b3d9ff'
  },
  'closed': {
    light: '#e6ccff',
    medium: '#8c00cc',
    border: '#d9b3ff'
  },
  'cancelled': {
    light: '#ffe6cc',
    medium: '#ff6600',
    border: '#ffd9b3'
  }
};

/**
 * צבעי טקסט דינמיים - מחושבים מהצבעים העיקריים
 * Dynamic text colors - calculated from main colors
 */
let ENTITY_TEXT_COLORS = {
  // ברירות מחדל
  'trade': '#0056b3',
  'trade_plan': '#004085',
  'execution': '#138496',
  'account': '#0f0642',
  'cash_flow': '#1a9f7a',
  'ticker': '#017a7c',
  'alert': '#e55a00',
  'note': '#5a32a3',
  'constraint': '#545b62',
  'design': '#343a40',
  'research': '#212529',
  'preference': '#6c757d',
};

/**
 * צבעי גבולות דינמיים - מחושבים מהצבעים העיקריים
 * Dynamic border colors - calculated from main colors
 */
let ENTITY_BORDER_COLORS = {
  // ברירות מחדל
  'trade': 'rgba(0, 123, 255, 0.3)',
  'trade_plan': 'rgba(0, 86, 179, 0.3)',
  'execution': 'rgba(23, 162, 184, 0.3)',
  'account': 'rgba(27, 11, 117, 0.3)',
  'cash_flow': 'rgba(32, 201, 151, 0.3)',
  'ticker': 'rgba(1, 145, 147, 0.3)',
  'alert': 'rgba(255, 156, 5, 0.3)',
  'note': 'rgba(111, 66, 193, 0.3)',
  'constraint': 'rgba(108, 117, 125, 0.3)',
  'design': 'rgba(73, 80, 87, 0.3)',
  'research': 'rgba(52, 58, 64, 0.3)',
  'preference': 'rgba(173, 181, 189, 0.3)',
};

// ===== INVESTMENT TYPE SPECIFIC COLORS =====
// צבעים ספציפיים לסוגי השקעה

/**
 * סוגי השקעה תקפים במערכת
 * Valid investment types in the system
 */
const VALID_INVESTMENT_TYPES = [
  'swing',      // השקעות סווינג - Swing Trading
  'investment', // השקעות ארוכות טווח - Long-term Investment
  'passive',     // השקעות פאסיביות - Passive Investment
  'day_trading', // מסחר יומי - Day Trading
  'scalping',   // סקלפינג - Scalping
];

/**
 * תרגום סוגי השקעה לעברית
 * Investment type translations to Hebrew
 */
const INVESTMENT_TYPE_LABELS = {
  'swing': 'סווינג',
  'investment': 'השקעה',
  'passive': 'פאסיבי',
};

/**
 * תיאור סוגי השקעה
 * Investment type descriptions
 */
const INVESTMENT_TYPE_DESCRIPTIONS = {
  'swing': 'מסחר לטווח קצר עד בינוני',
  'investment': 'השקעה ארוכת טווח',
  'passive': 'השקעה פאסיבית ללא פעילות מסחרית',
};

/**
 * צבעי סוגי השקעה דינמיים - נטענים מההעדפות
 * Dynamic investment type colors - loaded from preferences
 */
let INVESTMENT_TYPE_COLORS = {
  'swing': {
    light: 'rgba(0, 123, 255, 0.1)',
    medium: '#007bff',
    border: 'rgba(0, 123, 255, 0.3)'
  },
  'investment': {
    light: 'rgba(40, 167, 69, 0.1)',
    medium: '#28a745',
    border: 'rgba(40, 167, 69, 0.3)'
  },
  'passive': {
    light: 'rgba(111, 66, 193, 0.1)',
    medium: '#6f42c1',
    border: 'rgba(111, 66, 193, 0.3)'
  },
  'day_trading': {
    light: 'rgba(255, 193, 7, 0.1)',
    medium: '#ffc107',
    border: 'rgba(255, 193, 7, 0.3)'
  },
  'scalping': {
    light: 'rgba(220, 53, 69, 0.1)',
    medium: '#dc3545',
    border: 'rgba(220, 53, 69, 0.3)'
  }
};

// ===== DYNAMIC COLOR LOADING =====
// טעינת צבעים דינמית

/**
 * טעינת צבעי ישויות מההעדפות
 * Load entity colors from preferences
 * 
 * @param {Object} preferences - העדפות המשתמש
 */
function loadEntityColorsFromPreferences(preferences) {
  // עדכון צבעי ישויות מההעדפות
  if (preferences) {
    // Set global preferences for easy access
    window.currentPreferences = preferences;
    // עדכון צבעי executions
    if (preferences.entityExecutionColor) {
      ENTITY_COLORS.execution = preferences.entityExecutionColor;
      ENTITY_BACKGROUND_COLORS.execution = preferences.entityExecutionColorLight || `rgba(${hexToRgb(preferences.entityExecutionColor)?.r || 253}, ${hexToRgb(preferences.entityExecutionColor)?.g || 126}, ${hexToRgb(preferences.entityExecutionColor)?.b || 20}, 0.1)`;
      ENTITY_TEXT_COLORS.execution = preferences.entityExecutionColorDark || darkenColor(preferences.entityExecutionColor, 20);
      ENTITY_BORDER_COLORS.execution = `rgba(${hexToRgb(preferences.entityExecutionColor)?.r || 253}, ${hexToRgb(preferences.entityExecutionColor)?.g || 126}, ${hexToRgb(preferences.entityExecutionColor)?.b || 20}, 0.3)`;
    }
    
    // עדכון צבעי trades
    if (preferences.entityTradeColor) {
      ENTITY_COLORS.trade = preferences.entityTradeColor;
      ENTITY_BACKGROUND_COLORS.trade = preferences.entityTradeColorLight || `rgba(${hexToRgb(preferences.entityTradeColor)?.r || 40}, ${hexToRgb(preferences.entityTradeColor)?.g || 167}, ${hexToRgb(preferences.entityTradeColor)?.b || 69}, 0.1)`;
      ENTITY_TEXT_COLORS.trade = preferences.entityTradeColorDark || darkenColor(preferences.entityTradeColor, 20);
      ENTITY_BORDER_COLORS.trade = `rgba(${hexToRgb(preferences.entityTradeColor)?.r || 40}, ${hexToRgb(preferences.entityTradeColor)?.g || 167}, ${hexToRgb(preferences.entityTradeColor)?.b || 69}, 0.3)`;
    }
    
    // עדכון צבעי trading accounts
    if (preferences.entityTradingAccountColor) {
      ENTITY_COLORS.account = preferences.entityTradingAccountColor;
      ENTITY_BACKGROUND_COLORS.account = preferences.entityTradingAccountColorLight || `rgba(${hexToRgb(preferences.entityTradingAccountColor)?.r || 23}, ${hexToRgb(preferences.entityTradingAccountColor)?.g || 162}, ${hexToRgb(preferences.entityTradingAccountColor)?.b || 184}, 0.1)`;
      ENTITY_TEXT_COLORS.account = preferences.entityTradingAccountColorDark || darkenColor(preferences.entityTradingAccountColor, 20);
      ENTITY_BORDER_COLORS.account = `rgba(${hexToRgb(preferences.entityTradingAccountColor)?.r || 23}, ${hexToRgb(preferences.entityTradingAccountColor)?.g || 162}, ${hexToRgb(preferences.entityTradingAccountColor)?.b || 184}, 0.3)`;
    }
    
    // עדכון צבעי alerts
    if (preferences.entityAlertColor) {
      ENTITY_COLORS.alert = preferences.entityAlertColor;
      ENTITY_BACKGROUND_COLORS.alert = preferences.entityAlertColorLight || `rgba(${hexToRgb(preferences.entityAlertColor)?.r || 255}, ${hexToRgb(preferences.entityAlertColor)?.g || 193}, ${hexToRgb(preferences.entityAlertColor)?.b || 7}, 0.1)`;
      ENTITY_TEXT_COLORS.alert = preferences.entityAlertColorDark || darkenColor(preferences.entityAlertColor, 20);
      ENTITY_BORDER_COLORS.alert = `rgba(${hexToRgb(preferences.entityAlertColor)?.r || 255}, ${hexToRgb(preferences.entityAlertColor)?.g || 193}, ${hexToRgb(preferences.entityAlertColor)?.b || 7}, 0.3)`;
    }
    
    // עדכון צבעי tickers
    if (preferences.entityTickerColor) {
      ENTITY_COLORS.ticker = preferences.entityTickerColor;
      ENTITY_BACKGROUND_COLORS.ticker = preferences.entityTickerColorLight || `rgba(${hexToRgb(preferences.entityTickerColor)?.r || 111}, ${hexToRgb(preferences.entityTickerColor)?.g || 66}, ${hexToRgb(preferences.entityTickerColor)?.b || 193}, 0.1)`;
      ENTITY_TEXT_COLORS.ticker = preferences.entityTickerColorDark || darkenColor(preferences.entityTickerColor, 20);
      ENTITY_BORDER_COLORS.ticker = `rgba(${hexToRgb(preferences.entityTickerColor)?.r || 111}, ${hexToRgb(preferences.entityTickerColor)?.g || 66}, ${hexToRgb(preferences.entityTickerColor)?.b || 193}, 0.3)`;
    }
    
    // עדכון צבעי cash flows
    if (preferences.entityCashFlowColor) {
      ENTITY_COLORS['cash_flow'] = preferences.entityCashFlowColor;
      ENTITY_BACKGROUND_COLORS['cash_flow'] = preferences.entityCashFlowColorLight || `rgba(${hexToRgb(preferences.entityCashFlowColor)?.r || 32}, ${hexToRgb(preferences.entityCashFlowColor)?.g || 201}, ${hexToRgb(preferences.entityCashFlowColor)?.b || 151}, 0.1)`;
      ENTITY_TEXT_COLORS['cash_flow'] = preferences.entityCashFlowColorDark || darkenColor(preferences.entityCashFlowColor, 20);
      ENTITY_BORDER_COLORS['cash_flow'] = `rgba(${hexToRgb(preferences.entityCashFlowColor)?.r || 32}, ${hexToRgb(preferences.entityCashFlowColor)?.g || 201}, ${hexToRgb(preferences.entityCashFlowColor)?.b || 151}, 0.3)`;
    }
    
    // עדכון צבעי notes
    if (preferences.entityNoteColor) {
      ENTITY_COLORS.note = preferences.entityNoteColor;
      ENTITY_BACKGROUND_COLORS.note = preferences.entityNoteColorLight || `rgba(${hexToRgb(preferences.entityNoteColor)?.r || 108}, ${hexToRgb(preferences.entityNoteColor)?.g || 117}, ${hexToRgb(preferences.entityNoteColor)?.b || 125}, 0.1)`;
      ENTITY_TEXT_COLORS.note = preferences.entityNoteColorDark || darkenColor(preferences.entityNoteColor, 20);
      ENTITY_BORDER_COLORS.note = `rgba(${hexToRgb(preferences.entityNoteColor)?.r || 108}, ${hexToRgb(preferences.entityNoteColor)?.g || 117}, ${hexToRgb(preferences.entityNoteColor)?.b || 125}, 0.3)`;
    }
    
    // עדכון צבעי trade plans
    if (preferences.entityTradePlanColor) {
      ENTITY_COLORS['trade_plan'] = preferences.entityTradePlanColor;
      ENTITY_BACKGROUND_COLORS['trade_plan'] = preferences.entityTradePlanColorLight || `rgba(${hexToRgb(preferences.entityTradePlanColor)?.r || 0}, ${hexToRgb(preferences.entityTradePlanColor)?.g || 123}, ${hexToRgb(preferences.entityTradePlanColor)?.b || 255}, 0.1)`;
      ENTITY_TEXT_COLORS['trade_plan'] = preferences.entityTradePlanColorDark || darkenColor(preferences.entityTradePlanColor, 20);
      ENTITY_BORDER_COLORS['trade_plan'] = `rgba(${hexToRgb(preferences.entityTradePlanColor)?.r || 0}, ${hexToRgb(preferences.entityTradePlanColor)?.g || 123}, ${hexToRgb(preferences.entityTradePlanColor)?.b || 255}, 0.3)`;
    }
    
  }
  
  // יצירת CSS דינמי
  generateAndApplyEntityCSS();
}

/**
 * יצירת CSS דינמי ויישום על הדף
 * Generate dynamic CSS and apply to page
 */
function generateAndApplyEntityCSS() {
  try {
    // יצירת CSS חדש
    const newCSS = generateEntityCSS();
    
    // עדכון אלמנט ה-CSS
    let styleElement = document.getElementById('dynamic-entity-colors');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'dynamic-entity-colors';
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = newCSS;
    
  } catch (error) {
    console.error('❌ שגיאה ביצירת CSS דינמי:', error);
  }
}

/**
 * יצירת CSS דינמי לסטטוסים ויישום על הדף
 * Generate dynamic CSS for statuses and apply to page
 */
function generateAndApplyStatusCSS() {
  try {
    // יצירת CSS חדש לסטטוסים
    const newCSS = generateStatusCSS();
    
    // עדכון אלמנט ה-CSS
    let styleElement = document.getElementById('dynamic-status-colors');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'dynamic-status-colors';
      document.head.appendChild(styleElement);
    }
    
    styleElement.textContent = newCSS;
    
  } catch (error) {
    console.error('❌ שגיאה ביצירת CSS דינמי לסטטוסים:', error);
  }
}

/**
 * טעינת צבעי סטטוסים מההעדפות
 * Load status colors from preferences
 * 
 * @param {Object} preferences - העדפות המשתמש
 */
function loadStatusColorsFromPreferences(preferences) {
  // הסרנו את preferences.statusColors כי הוא לא קיים במערכת ההעדפות
  // במקום זה משתמשים במשתנים ספציפיים
}

/**
 * טעינת צבעי סוגי השקעה מההעדפות
 * Load investment type colors from preferences
 * 
 * @param {Object} preferences - העדפות המשתמש
 */
function loadInvestmentTypeColorsFromPreferences(preferences) {
  // הסרנו את preferences.investmentTypeColors כי הוא לא קיים במערכת ההעדפות
  // במקום זה משתמשים במשתנים ספציפיים
}

/**
 * טעינת כל הצבעים מההעדפות
 * Load all colors from preferences
 * 
 * @param {Object} preferences - העדפות המשתמש
 */
function loadAllColorsFromPreferences(preferences) {
  loadEntityColorsFromPreferences(preferences);
  loadStatusColorsFromPreferences(preferences);
  loadInvestmentTypeColorsFromPreferences(preferences);
}

/**
 * המרת hex ל-RGB
 * Convert hex to RGB
 * 
 * @param {string} hex - קוד צבע hex
 * @returns {Object|null} - אובייקט RGB או null
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/* ===== Light Mode Only - No Dark Mode ===== */
/* Dark color functions removed - only light mode supported */

// ===== UTILITY FUNCTIONS =====
// פונקציות עזר

/**
 * קבלת צבע לישות
 * Get color for entity
 *
 * @param {string} entityType - סוג הישות
 * @returns {string} קוד הצבע
 */
function getEntityColor(entityType) {
  if (!entityType) {
    return '#6c757d'; // אפור לנתונים חסרים
  }

  const normalizedType = entityType.toLowerCase().trim();
  return ENTITY_COLORS[normalizedType] || '#6c757d';
}

/**
 * קבלת צבע סטטוס
 * Get status color
 * 
 * @param {string} status - סטטוס
 * @param {string} intensity - עוצמה (light, medium, dark, border)
 * @returns {string} - קוד צבע
 */
function getStatusColor(status, intensity = 'medium') {
  if (!status) {
    return STATUS_COLORS['closed']?.[intensity] || '#6c757d';
  }

  const normalizedStatus = status.toLowerCase().trim();
  return STATUS_COLORS[normalizedStatus]?.[intensity] || STATUS_COLORS['closed']?.[intensity] || '#6c757d';
}

/**
 * קבלת צבע רקע סטטוס
 * Get status background color
 * 
 * @param {string} status - סטטוס
 * @returns {string} - קוד צבע רקע
 */
function getStatusBackgroundColor(status) {
  return getStatusColor(status, 'light');
}

/**
 * קבלת צבע טקסט סטטוס
 * Get status text color
 * 
 * @param {string} status - סטטוס
 * @returns {string} - קוד צבע טקסט
 */
function getStatusTextColor(status) {
  return getStatusColor(status, 'medium');
}

/**
 * קבלת צבע גבול סטטוס
 * Get status border color
 * 
 * @param {string} status - סטטוס
 * @returns {string} - קוד צבע גבול
 */
function getStatusBorderColor(status) {
  return getStatusColor(status, 'border');
}

/**
 * קבלת צבע רקע לישות
 * Get background color for entity
 *
 * @param {string} entityType - סוג הישות
 * @returns {string} קוד הצבע
 */
function getEntityBackgroundColor(entityType) {
  if (!entityType) {
    return 'rgba(108, 117, 125, 0.1)'; // אפור שקוף לנתונים חסרים
  }

  const normalizedType = entityType.toLowerCase().trim();
  return ENTITY_BACKGROUND_COLORS[normalizedType] || 'rgba(108, 117, 125, 0.1)';
}

/**
 * קבלת צבע טקסט לישות
 * Get text color for entity
 *
 * @param {string} entityType - סוג הישות
 * @returns {string} קוד הצבע
 */
function getEntityTextColor(entityType) {
  if (!entityType) {
    return '#495057'; // אפור כהה לנתונים חסרים
  }

  const normalizedType = entityType.toLowerCase().trim();
  return ENTITY_TEXT_COLORS[normalizedType] || '#495057';
}

/**
 * קבלת צבע גבול לישות
 * Get border color for entity
 *
 * @param {string} entityType - סוג הישות
 * @returns {string} קוד הצבע
 */
function getEntityBorderColor(entityType) {
  if (!entityType) {
    return 'rgba(108, 117, 125, 0.3)'; // אפור שקוף לנתונים חסרים
  }

  const normalizedType = entityType.toLowerCase().trim();
  return ENTITY_BORDER_COLORS[normalizedType] || 'rgba(108, 117, 125, 0.3)';
}

/**
 * בדיקה אם סוג ישות תקף
 * Check if entity type is valid
 *
 * @param {string} entityType - סוג הישות
 * @returns {boolean} האם תקף
 */
function isValidEntityType(entityType) {
  if (!entityType) {
    return false;
  }

  const normalizedType = entityType.toLowerCase().trim();
  return VALID_ENTITY_TYPES.includes(normalizedType);
}

/**
 * קבלת תרגום עברי לישות
 * Get Hebrew translation for entity
 *
 * @param {string} entityType - סוג הישות
 * @returns {string} התרגום העברי
 */
function getEntityLabel(entityType) {
  if (!entityType) {
    return 'לא מוגדר';
  }

  const normalizedType = entityType.toLowerCase().trim();

  // תרגומים ספציפיים
  const labels = {
    'trade': 'טרייד',
    'trade_plan': 'תכנון השקעה',
    'execution': 'עסקה',
    'account': 'חשבון',
    'cash_flow': 'תזרים מזומנים',
    'ticker': 'טיקר',
    'alert': 'התראה',
    'note': 'הערה',
    'constraint': 'אילוץ',
    'design': 'עיצוב',
    'research': 'מחקר',
    'preference': 'העדפה',
  };

  return labels[normalizedType] || entityType;
}

// ===== BACKWARD COMPATIBILITY FUNCTIONS =====
// פונקציות תאימות לאחור

/**
 * קבלת צבע לסוג השקעה
 * Get color for investment type
 *
 * @param {string} investmentType - סוג ההשקעה
 * @param {string} intensity - עוצמה (light, medium, dark, border)
 * @returns {string} קוד הצבע
 */
function getInvestmentTypeColor(investmentType, intensity = 'medium') {
  if (!investmentType) {
    return INVESTMENT_TYPE_COLORS['swing'][intensity] || '#007bff';
  }

  const normalizedType = investmentType.toLowerCase().trim();
  return INVESTMENT_TYPE_COLORS[normalizedType]?.[intensity] || INVESTMENT_TYPE_COLORS['swing'][intensity] || '#007bff';
}

/**
 * קבלת צבע רקע לסוג השקעה
 * Get background color for investment type
 *
 * @param {string} investmentType - סוג ההשקעה
 * @returns {string} קוד הצבע
 */
function getInvestmentTypeBackgroundColor(investmentType) {
  return getInvestmentTypeColor(investmentType, 'light');
}

/**
 * קבלת צבע טקסט לסוג השקעה
 * Get text color for investment type
 *
 * @param {string} investmentType - סוג ההשקעה
 * @returns {string} קוד הצבע
 */
function getInvestmentTypeTextColor(investmentType) {
  return getInvestmentTypeColor(investmentType, 'medium');
}

/**
 * קבלת צבע גבול לסוג השקעה
 * Get border color for investment type
 *
 * @param {string} investmentType - סוג ההשקעה
 * @returns {string} קוד הצבע
 */
function getInvestmentTypeBorderColor(investmentType) {
  return getInvestmentTypeColor(investmentType, 'border');
}

/**
 * קבלת צבע רקע לסוג השקעה (תאימות לאחור)
 * Get background color for investment type (backward compatibility)
 *
 * @param {string} investmentType - סוג ההשקעה
 * @returns {string} קוד הצבע
 */
function getInvestmentTypeBackgroundColor(investmentType) {
  if (!investmentType) {
    return 'rgba(108, 117, 125, 0.1)'; // אפור שקוף לנתונים חסרים
  }

  const entityType = getInvestmentTypeEntityType(investmentType);
  return getEntityBackgroundColor(entityType);
}

/**
 * קבלת צבע טקסט לסוג השקעה (תאימות לאחור)
 * Get text color for investment type (backward compatibility)
 *
 * @param {string} investmentType - סוג ההשקעה
 * @returns {string} קוד הצבע
 */
function getInvestmentTypeTextColor(investmentType) {
  if (!investmentType) {
    return '#495057'; // אפור כהה לנתונים חסרים
  }

  const entityType = getInvestmentTypeEntityType(investmentType);
  return getEntityTextColor(entityType);
}

/**
 * קבלת צבע גבול לסוג השקעה (תאימות לאחור)
 * Get border color for investment type (backward compatibility)
 *
 * @param {string} investmentType - סוג ההשקעה
 * @returns {string} קוד הצבע
 */
function getInvestmentTypeBorderColor(investmentType) {
  if (!investmentType) {
    return 'rgba(108, 117, 125, 0.3)'; // אפור שקוף לנתונים חסרים
  }

  const entityType = getInvestmentTypeEntityType(investmentType);
  return getEntityBorderColor(entityType);
}

/**
 * מיפוי סוג השקעה לישות
 * Map investment type to entity type
 *
 * @param {string} investmentType - סוג ההשקעה
 * @returns {string} סוג הישות
 */
function getInvestmentTypeEntityType(investmentType) {
  const mapping = {
    'swing': 'trade',
    'investment': 'account',
    'passive': 'note',
  };

  return mapping[investmentType] || 'trade';
}

// ===== CSS CLASS GENERATION =====
// יצירת מחלקות CSS

/**
 * יצירת מחלקות CSS לכל סוגי הישויות
 * Generate CSS classes for all entity types
 *
 * @returns {string} CSS classes
 */
function generateEntityCSS() {
  let css = '';

  VALID_ENTITY_TYPES.forEach(type => {
    const color = ENTITY_COLORS[type];
    const bgColor = ENTITY_BACKGROUND_COLORS[type];
    const borderColor = ENTITY_BORDER_COLORS[type];
    const textColor = ENTITY_TEXT_COLORS[type];

    css += `
.entity-${type} {
  background-color: ${bgColor};
  border-color: ${borderColor};
  color: ${textColor};
}

.entity-${type}-badge {
  background-color: ${color};
  color: white;
  border: 1px solid ${color};
}

.entity-${type}-border {
  border-left: 4px solid ${color};
}

.entity-${type}-text {
  color: ${color};
}

.entity-${type}-header {
  background: ${color};
  color: white;
  border-bottom: 2px solid ${color};
}

.entity-${type}-main-header {
  background-color: ${color}${getMainHeaderOpacityHex()};
  border-left: 4px solid ${color};
}

.entity-${type}-sub-header {
  background-color: ${color}${getSubHeaderOpacityHex()};
  border-left: 3px solid ${color};
}
`;
  });

  // מחלקות לסוגי השקעה (תאימות לאחור)
  VALID_INVESTMENT_TYPES.forEach(type => {
    const entityType = getInvestmentTypeEntityType(type);
    const color = ENTITY_COLORS[entityType];
    const bgColor = ENTITY_BACKGROUND_COLORS[entityType];
    const borderColor = ENTITY_BORDER_COLORS[entityType];
    const textColor = ENTITY_TEXT_COLORS[entityType];

    css += `
.investment-type-${type} {
  background-color: ${bgColor};
  border-color: ${borderColor};
  color: ${textColor};
}

.investment-type-${type}-badge {
  background-color: ${color};
  color: white;
  border: 1px solid ${color};
}

.investment-type-${type}-border {
  border-left: 4px solid ${color};
}

.investment-type-${type}-text {
  color: ${color};
}
`;
  });

  return css;
}

/**
 * יצירת CSS דינמי לסטטוסים
 * Generate dynamic CSS for statuses
 * 
 * @returns {string} CSS code
 */
function generateStatusCSS() {
  let css = '';

  Object.keys(STATUS_COLORS).forEach(status => {
    const colors = STATUS_COLORS[status];

    css += `
.status-${status} {
  background-color: ${colors.light};
  border-color: ${colors.border};
  color: ${colors.medium};
}

.status-${status}-badge {
  background-color: ${colors.medium};
  color: white;
  border: 1px solid ${colors.medium};
}

/* תמיכה בשילוב status-badge + status-${status} */
.status-badge.status-${status} {
  background: linear-gradient(135deg, color-mix(in srgb, ${colors.medium} 15%, transparent) 0%, color-mix(in srgb, ${colors.medium} 10%, transparent) 100%) !important;
  color: ${colors.medium} !important;
  border: 1px solid color-mix(in srgb, ${colors.medium} 30%, transparent) !important;
  box-shadow: 0 2px 8px color-mix(in srgb, ${colors.medium} 15%, transparent) !important;
}

.status-${status}-text {
  color: ${colors.medium};
}

.status-${status}-bg {
  background-color: ${colors.light};
}

.status-${status}-border {
  border-color: ${colors.border};
}

    `;
  });

  // תמיכה בסטטוס "מבוטל" (נוסף לטבלה)
  css += `
.status-badge.status-cancelled {
  background: linear-gradient(135deg, color-mix(in srgb, #ff6600 15%, transparent) 0%, color-mix(in srgb, #ff6600 10%, transparent) 100%) !important;
  color: #ff6600 !important;
  border: 1px solid color-mix(in srgb, #ff6600 30%, transparent) !important;
  box-shadow: 0 2px 8px color-mix(in srgb, #ff6600 15%, transparent) !important;
}
  `;

  // מחלקה לסטטוס לא מוגדר
  css += `
.status-other {
  background-color: rgba(108, 117, 125, 0.1);
  border-color: rgba(108, 117, 125, 0.3);
  color: #6c757d;
}

.status-other-badge {
  background-color: #6c757d;
  color: white;
  border: 1px solid #6c757d;
}

.status-other-text {
  color: #6c757d;
}

.status-other-bg {
  background-color: rgba(108, 117, 125, 0.1);
}

.status-other-border {
  border-color: rgba(108, 117, 125, 0.3);
}

  `;

  return css;
}

/**
 * יצירת CSS דינמי לסוגי השקעה
 * Generate dynamic CSS for investment types
 * 
 * @returns {string} CSS code
 */
function generateInvestmentTypeCSS() {
  let css = '';

  Object.keys(INVESTMENT_TYPE_COLORS).forEach(type => {
    const colors = INVESTMENT_TYPE_COLORS[type];

    css += `
.investment-type-${type} {
  background-color: ${colors.light};
  border-color: ${colors.border};
  color: ${colors.medium};
}

.investment-type-${type}-badge {
  background-color: ${colors.medium};
  color: white;
  border: 1px solid ${colors.medium};
}

.investment-type-${type}-text {
  color: ${colors.medium};
}

.investment-type-${type}-bg {
  background-color: ${colors.light};
}

.investment-type-${type}-border {
  border-color: ${colors.border};
}


/* מחלקות קצרות לסוגי השקעה */
.type-${type} {
  background-color: ${colors.light};
  border-color: ${colors.border};
  color: ${colors.medium};
}

.type-${type}-badge {
  background-color: ${colors.medium};
  color: white;
  border: 1px solid ${colors.medium};
}

.type-${type}-text {
  color: ${colors.medium};
}

.type-${type}-bg {
  background-color: ${colors.light};
}

.type-${type}-border {
  border-color: ${colors.border};
}

    `;
  });

  // מחלקה לסוג לא מוגדר
  css += `
.type-other {
  background-color: rgba(108, 117, 125, 0.1);
  border-color: rgba(108, 117, 125, 0.3);
  color: #6c757d;
}

.type-other-badge {
  background-color: #6c757d;
  color: white;
  border: 1px solid #6c757d;
}

.type-other-text {
  color: #6c757d;
}

.type-other-bg {
  background-color: rgba(108, 117, 125, 0.1);
}

.type-other-border {
  border-color: rgba(108, 117, 125, 0.3);
}

  `;

  return css;
}

/* ===== Light Mode Only - No Dark Mode ===== */
/* Second darkenColor function removed - only light mode supported */

/**
 * Darken a color by a given percentage
 * הכהה צבע באחוז נתון
 * @param {string} hex - Hex color code
 * @param {number} percent - Percentage to darken (0-100)
 * @returns {string} Darkened hex color
 */
function darkenColor(hex, percent) {
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Parse RGB values
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Darken by reducing each RGB value
    const factor = (100 - percent) / 100;
    const newR = Math.round(r * factor);
    const newG = Math.round(g * factor);
    const newB = Math.round(b * factor);
    
    // Convert back to hex
    const toHex = (n) => {
        const hex = n.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    
    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

// ===== LEGEND GENERATION =====
// יצירת סולמות צבעים

/**
 * יצירת אלמנט סולם צבעים לכל הישויות
 * Create color legend element for all entities
 *
 * @param {Object} options - אפשרויות עיצוב
 * @returns {HTMLElement} אלמנט הסולם
 */
function createEntityLegend(options = {}) {
  const {
    title = '🎨 מפתח צבעים - סוגי ישויות:',
    containerClass = 'entity-color-legend',
    compact = false,
    entityTypes = VALID_ENTITY_TYPES,
  } = options;

  const legendContainer = document.createElement('div');
  legendContainer.className = containerClass;
  legendContainer.style.cssText = `
    margin: 10px 0;
    padding: ${compact ? '6px 10px' : '8px 12px'};
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: ${compact ? '0.8em' : '0.85em'};
  `;

  const legendTitle = document.createElement('div');
  legendTitle.textContent = title;
  legendTitle.style.cssText = `
    font-weight: bold;
    margin-bottom: ${compact ? '6px' : '8px'};
    color: #495057;
  `;

  const legendItems = document.createElement('div');
  legendItems.style.cssText = `
    display: flex;
    flex-wrap: wrap;
    gap: ${compact ? '6px' : '8px'};
    align-items: center;
  `;

  entityTypes.forEach(type => {
    const color = ENTITY_COLORS[type];
    const label = getEntityLabel(type);

    const legendItem = document.createElement('span');
    legendItem.style.cssText = `
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: ${compact ? '1px 4px' : '2px 6px'};
      border-radius: 4px;
      background: white;
      border: 1px solid #dee2e6;
      font-size: ${compact ? '0.75em' : '0.8em'};
      cursor: help;
            title: ${type}`;

    const colorDot = document.createElement('span');
    colorDot.style.cssText = `
      width: ${compact ? '10px' : '12px'};
      height: ${compact ? '10px' : '12px'};
      border-radius: 50%;
      background-color: ${color};
      border: 1px solid #dee2e6;
    `;

    const labelText = document.createElement('span');
    labelText.textContent = label;

    legendItem.appendChild(colorDot);
    legendItem.appendChild(labelText);
    legendItems.appendChild(legendItem);
  });

  legendContainer.appendChild(legendTitle);
  legendContainer.appendChild(legendItems);

  return legendContainer;
}

/**
 * יצירת אלמנט סולם צבעים לסוגי השקעה (תאימות לאחור)
 * Create color legend element for investment types (backward compatibility)
 *
 * @param {Object} options - אפשרויות עיצוב
 * @returns {HTMLElement} אלמנט הסולם
 */
function createInvestmentTypeLegend(options = {}) {
  return createEntityLegend({
    title: '🎨 סולם צבעים - סוגי השקעה:',
    containerClass: 'investment-type-legend',
    entityTypes: VALID_INVESTMENT_TYPES,
    ...options,
  });
}

// ========================================
// 🎨 מערכת צבעים מאוחדת לערכים מספריים
// ========================================

/**
 * צבעים ברירת מחדל לערכים מספריים
 */
const NUMERIC_VALUE_COLORS = {
  positive: {
    light: '#d4edda',      // רקע בהיר לערכים חיוביים
    medium: '#28a745',     // טקסט לערכים חיוביים
    border: '#c3e6cb',      // גבול לערכים חיוביים
  },
  negative: {
    light: '#f8d7da',      // רקע בהיר לערכים שליליים
    medium: '#dc3545',     // טקסט לערכים שליליים
    border: '#f5c6cb',      // גבול לערכים שליליים
  },
  zero: {
    light: '#e2e3e5',      // רקע לערך אפס
    medium: '#6c757d',     // טקסט לערך אפס
    border: '#d6d8db',      // גבול לערך אפס
  },
};

/**
 * קבלת צבע לערך מספרי
 * @param {number} value - הערך המספרי
 * @param {string} colorType - סוג הצבע (light, medium, dark, border)
 * @returns {string} קוד הצבע
 */
function getNumericValueColor(value, colorType = 'medium') {
  if (value > 0) {
    return NUMERIC_VALUE_COLORS.positive[colorType] || NUMERIC_VALUE_COLORS.positive.medium;
  } else if (value < 0) {
    return NUMERIC_VALUE_COLORS.negative[colorType] || NUMERIC_VALUE_COLORS.negative.medium;
  } else {
    return NUMERIC_VALUE_COLORS.zero[colorType] || NUMERIC_VALUE_COLORS.zero.medium;
  }
}

/**
 * קבלת צבע רקע לערך מספרי
 * @param {number} value - הערך המספרי
 * @returns {string} קוד הצבע
 */
function getNumericValueBackgroundColor(value) {
  return getNumericValueColor(value, 'light');
}

/**
 * קבלת צבע טקסט לערך מספרי
 * @param {number} value - הערך המספרי
 * @returns {string} קוד הצבע
 */
function getNumericValueTextColor(value) {
  return getNumericValueColor(value, 'medium');
}

/**
 * קבלת צבע גבול לערך מספרי
 * @param {number} value - הערך המספרי
 * @returns {string} קוד הצבע
 */
function getNumericValueBorderColor(value) {
  return getNumericValueColor(value, 'border');
}

/* ===== Light Mode Only - No Dark Mode ===== */
/* getNumericValueDarkColor function removed - only light mode supported */

/**
 * בדיקה אם ערך הוא חיובי
 * @param {number} value - הערך לבדיקה
 * @returns {boolean} true אם חיובי
 */
function isPositiveValue(value) {
  return value > 0;
}

/**
 * בדיקה אם ערך הוא שלילי
 * @param {number} value - הערך לבדיקה
 * @returns {boolean} true אם שלילי
 */
function isNegativeValue(value) {
  return value < 0;
}

/**
 * בדיקה אם ערך הוא אפס
 * @param {number} value - הערך לבדיקה
 * @returns {boolean} true אם אפס
 */
function isZeroValue(value) {
  return value === 0;
}

/**
 * קבלת סוג הערך (positive, negative, zero)
 * @param {number} value - הערך המספרי
 * @returns {string} סוג הערך
 */
function getValueType(value) {
  if (value > 0) {return 'positive';}
  if (value < 0) {return 'negative';}
  return 'zero';
}

/**
 * קבלת CSS class לערך מספרי
 * @param {number} value - הערך המספרי
 * @returns {string} שם ה-CSS class
 */
function getNumericValueCSSClass(value) {
  const type = getValueType(value);
  return `numeric-value-${type}`;
}

/**
 * יצירת CSS דינמי לערכים מספריים
 * @returns {string} CSS דינמי
 */
function generateNumericValueCSS() {
  const css = `
        /* ערכים חיוביים */
        .numeric-value-positive {
            color: ${NUMERIC_VALUE_COLORS.positive.medium};
            background-color: ${NUMERIC_VALUE_COLORS.positive.light};
            border-color: ${NUMERIC_VALUE_COLORS.positive.border};
        }
        
        .numeric-value-positive.text-only {
            color: ${NUMERIC_VALUE_COLORS.positive.medium};
        }
        
        .numeric-value-positive.background-only {
            background-color: ${NUMERIC_VALUE_COLORS.positive.light};
        }
        
        .numeric-value-positive.border-only {
            border-color: ${NUMERIC_VALUE_COLORS.positive.border};
        }
        
        /* ערכים שליליים */
        .numeric-value-negative {
            color: ${NUMERIC_VALUE_COLORS.negative.medium};
            background-color: ${NUMERIC_VALUE_COLORS.negative.light};
            border-color: ${NUMERIC_VALUE_COLORS.negative.border};
        }
        
        .numeric-value-negative.text-only {
            color: ${NUMERIC_VALUE_COLORS.negative.medium};
        }
        
        .numeric-value-negative.background-only {
            background-color: ${NUMERIC_VALUE_COLORS.negative.light};
        }
        
        .numeric-value-negative.border-only {
            border-color: ${NUMERIC_VALUE_COLORS.negative.border};
        }
        
        /* ערך אפס */
        .numeric-value-zero {
            color: ${NUMERIC_VALUE_COLORS.zero.medium};
            background-color: ${NUMERIC_VALUE_COLORS.zero.light};
            border-color: ${NUMERIC_VALUE_COLORS.zero.border};
        }
        
        .numeric-value-zero.text-only {
            color: ${NUMERIC_VALUE_COLORS.zero.medium};
        }
        
        .numeric-value-zero.background-only {
            background-color: ${NUMERIC_VALUE_COLORS.zero.light};
        }
        
        .numeric-value-zero.border-only {
            border-color: ${NUMERIC_VALUE_COLORS.zero.border};
        }
    `;

  return css;
}

/**
 * עדכון צבעים לערכים מספריים
 * @param {Object} newColors - צבעים חדשים
 */
function updateNumericValueColors(newColors) {
  // עדכון הצבעים הגלובליים
  Object.assign(NUMERIC_VALUE_COLORS, newColors);

  // יצירת CSS חדש
  const newCSS = generateNumericValueCSS();

  // עדכון או יצירת style element
  let styleElement = document.getElementById('numeric-value-colors');
  if (!styleElement) {
    styleElement = document.createElement('style');
    styleElement.id = 'numeric-value-colors';
    document.head.appendChild(styleElement);
  }

  styleElement.textContent = newCSS;
}

// ========================================
// 📤 ייצוא פונקציות לערכים מספריים
// ========================================

// ===== ENTITY COLOR MANAGEMENT FUNCTIONS =====
// פונקציות ניהול צבעי ישויות

/**
 * עדכון צבע ישות
 * @param {string} entityType - סוג הישות
 * @param {string} colorValue - ערך הצבע
 */
function updateEntityColor(entityType, colorValue) {
  try {
    // עדכון הצבע במערכת הצבעים הגלובלית
    if (Object.prototype.hasOwnProperty.call(ENTITY_COLORS, entityType)) {
      ENTITY_COLORS[entityType] = colorValue;

      // עדכון צבעי רקע שקופים
      if (Object.prototype.hasOwnProperty.call(ENTITY_BACKGROUND_COLORS, entityType)) {
        const rgb = hexToRgb(colorValue);
        if (rgb) {
          ENTITY_BACKGROUND_COLORS[entityType] = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
        }
      }

      // עדכון צבעי טקסט
      if (Object.prototype.hasOwnProperty.call(ENTITY_TEXT_COLORS, entityType)) {
        ENTITY_TEXT_COLORS[entityType] = getContrastColor(colorValue);
      }

      // עדכון צבעי גבול
      if (Object.prototype.hasOwnProperty.call(ENTITY_BORDER_COLORS, entityType)) {
        ENTITY_BORDER_COLORS[entityType] = colorValue;
      }
    }
  } catch {
    // שגיאה בעדכון צבע ישות
  }
}

/**
 * עדכון צבע ישות מ-hex
 * @param {string} entityType - סוג הישות
 * @param {string} hexValue - ערך hex
 */
function updateEntityColorFromHex(entityType, hexValue) {
  try {
    // בדיקת תקינות ה-hex
    if (!/^#[0-9A-F]{6}$/i.test(hexValue)) {
      // ערך hex לא תקין
      return;
    }

    // עדכון הצבע
    updateEntityColor(entityType, hexValue);
  } catch {
    // שגיאה בעדכון צבע ישות מ-hex
  }
}

/**
 * איפוס צבעי ישויות לברירת המחדל
 */
function resetEntityColors() {
  try {
    // איפוס הצבעים לברירת המחדל
    Object.assign(ENTITY_COLORS, {
      'trade': '#007bff',
      'trade_plan': '#0056b3',
      'execution': '#17a2b8',
      'account': '#28a745',
      'cash_flow': '#20c997',
      'ticker': '#dc3545',
      'alert': '#ff9c05',
      'note': '#6f42c1',
      'constraint': '#6c757d',
      'design': '#495057',
      'research': '#343a40',
      'preference': '#adb5bd',
    });

    // איפוס צבעי רקע שקופים
    Object.assign(ENTITY_BACKGROUND_COLORS, {
      'trade': 'rgba(0, 123, 255, 0.1)',
      'trade_plan': 'rgba(0, 86, 179, 0.1)',
      'execution': 'rgba(23, 162, 184, 0.1)',
      'account': 'rgba(40, 167, 69, 0.1)',
      'cash_flow': 'rgba(32, 201, 151, 0.1)',
      'ticker': 'rgba(220, 53, 69, 0.1)',
      'alert': 'rgba(255, 156, 5, 0.1)',
      'note': 'rgba(111, 66, 193, 0.1)',
      'constraint': 'rgba(108, 117, 125, 0.1)',
      'design': 'rgba(73, 80, 87, 0.1)',
      'research': 'rgba(52, 58, 64, 0.1)',
      'preference': 'rgba(173, 181, 189, 0.1)',
    });

    // איפוס צבעי טקסט
    Object.assign(ENTITY_TEXT_COLORS, {
      'trade': '#0056b3',
      'trade_plan': '#004085',
      'execution': '#138496',
      'account': '#1e7e34',
      'cash_flow': '#1a9f7a',
      'ticker': '#c82333',
      'alert': '#e68900',
      'note': '#5a2d91',
      'constraint': '#545b62',
      'design': '#343a40',
      'research': '#212529',
      'preference': '#6c757d',
    });

    // איפוס צבעי גבול
    Object.assign(ENTITY_BORDER_COLORS, {
      'trade': '#007bff',
      'trade_plan': '#0056b3',
      'execution': '#17a2b8',
      'account': '#28a745',
      'cash_flow': '#20c997',
      'ticker': '#dc3545',
      'alert': '#ff9c05',
      'note': '#6f42c1',
      'constraint': '#6c757d',
      'design': '#495057',
      'research': '#343a40',
      'preference': '#adb5bd',
    });
  } catch {
    // שגיאה באיפוס צבעי ישויות
  }
}

/**
 * המרת hex ל-RGB
 * @param {string} hex - ערך hex
 * @returns {Object|null} אובייקט RGB או null אם לא תקין
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

/**
 * קבלת צבע ניגוד לצבע נתון
 * @param {string} hexColor - צבע hex
 * @returns {string} צבע ניגוד (שחור או לבן)
 */
function getContrastColor(hexColor) {
  const rgb = hexToRgb(hexColor);
  if (!rgb) {return '#000000';}

  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
}

/**
 * קבלת צבעים מוכנים לשימוש בטבלאות
 * Get ready-to-use colors for tables
 * @returns {Object} אובייקט עם צבעים מוכנים לשימוש
 */
function getTableColors() {
  return {
    positive: getNumericValueColor(1, 'medium'),
    negative: getNumericValueColor(-1, 'medium'),
    secondary: getEntityColor('preference'),
    success: getEntityColor('account'),
    warning: getEntityColor('alert'),
    info: getEntityColor('execution'),
    primary: getEntityColor('trade'),
  };
}

/**
 * קבלת צבעים מוכנים לשימוש בטבלאות עם ברירות מחדל
 * Get ready-to-use colors for tables with fallbacks
 * @returns {Object} אובייקט עם צבעים מוכנים לשימוש
 */
function getTableColorsWithFallbacks() {
  const colors = getTableColors();

  // הוספת ברירות מחדל במקרה שהפונקציות לא עובדות
  return {
    positive: colors.positive || '#28a745',
    negative: colors.negative || '#dc3545',
    secondary: colors.secondary || '#6c757d',
    success: colors.success || '#28a745',
    warning: colors.warning || '#ffc107',
    info: colors.info || '#17a2b8',
    primary: colors.primary || '#007bff',
  };
}

/**
 * קבלת הגדרות צבע מהעדפות (פונקציה גלובלית)
 * Get color preferences (global function)
 * @returns {Object} הגדרות הצבע
 */
function getColorPreferences() {
  // ניסיון לקבל הגדרות מהמערכת
  if (window.currentPreferences) {
    return window.currentPreferences;
  }

  // ברירת מחדל - צבעי מערכת בסיסיים
  return {
    // צבעים ראשיים למערכת הגרפים (6-8 צבעים מרכזיים)
    primaryColor: '#007bff',        // כחול ראשי - כותרות וכפתורים
    chartPrimaryColor: '#1e40af',   // כחול כהה - צבע בסיס לגרפים עצמם
    successColor: '#28a745',        // ירוק - הצלחה, רווחים
    warningColor: '#ffc107',        // צהוב - אזהרות, ביצועים בינוניים
    dangerColor: '#dc3545',         // אדום - שגיאות, הפסדים
    infoColor: '#17a2b8',           // כחול מידע - מידע נוסף
    secondaryColor: '#6c757d',      // אפור - נתונים משניים
    
    // צבעי ישויות לגרפים (מהמערכת הקיימת)
    entityTradeColor: '#007bff',    // כחול - טריידים
    entityTradingAccountColor: '#28a745',  // ירוק - חשבונות
    entityExecutionColor: '#17a2b8', // כחול מידע - ביצועים
    entityAlertColor: '#ffc107',    // צהוב - התראות
    entityTickerColor: '#dc3545',   // אדום - טיקרים
    entityNoteColor: '#6f42c1',     // סגול - הערות
    
    // צבעי גרפים מיוחדים
    chartBackgroundColor: '#ffffff', // לבן - רקע גרפים
    chartTextColor: '#212529',       // כהה - טקסט גרפים
    chartGridColor: '#e9ecef',       // אפור בהיר - רשת גרפים
    chartBorderColor: '#dee2e6',     // אפור - גבול גרפים
    chartPointColor: '#007bff',      // כחול - נקודות גרפים
    
    // צבעי רקע וטקסט
    cardBackground: '#ffffff',
    inputBackground: '#ffffff',
    textColor: '#212529',
    textMuted: '#6c757d',
    borderColor: '#dee2e6',
    
    // הגדרות גרפים
    chartAutoRefresh: true,
    chartRefreshInterval: 60,
    chartQuality: 'medium',
    chartAnimations: true,
    chartInteractive: true,
    chartShowTooltips: true,
    chartExportFormat: 'png',
    chartExportQuality: 'medium',
    chartExportResolution: '1x',
    chartExportBackground: true,
    
    // צבעי hover
    primaryHover: '#0056b3',
    secondaryHover: '#545b62',
    successHover: '#1e7e34',
    warningHover: '#e0a800',
    dangerHover: '#c82333',
    infoHover: '#138496',
    
    // צבעי רקע עם שקיפות
    successBackground: 'rgba(40, 167, 69, 0.1)',
    warningBackground: 'rgba(255, 193, 7, 0.1)',
    dangerBackground: 'rgba(220, 53, 69, 0.1)',
    infoBackground: 'rgba(23, 162, 184, 0.1)'
  };
}

// ===== PREFERENCES INTEGRATION =====
// אינטגרציה עם מערכת ההעדפות

/**
 * עדכון CSS Variables מהעדפות
 * Update CSS variables from preferences
 */
function updateCSSVariablesFromPreferences(preferences) {
  try {

      // עדכון צבעי סטטוסים - מהעדפות למשתני CSS (צבע אחד לכל סטטוס)
      if (preferences.statusOpenColor) {
        document.documentElement.style.setProperty('--user-status-open-color', preferences.statusOpenColor);
      }
      if (preferences.statusClosedColor) {
        document.documentElement.style.setProperty('--user-status-closed-color', preferences.statusClosedColor);
      }
      if (preferences.statusCancelledColor) {
        document.documentElement.style.setProperty('--user-status-cancelled-color', preferences.statusCancelledColor);
      }
      
      // עדכון צבעי ערכים מספריים - צבע אחד לכל סוג (רקע באמצעות שקיפות)
      if (preferences.valuePositiveColor) {
        document.documentElement.style.setProperty('--user-value-positive-color', preferences.valuePositiveColor);
      }
      if (preferences.valueNegativeColor) {
        document.documentElement.style.setProperty('--user-value-negative-color', preferences.valueNegativeColor);
      }
      if (preferences.valueNeutralColor) {
        document.documentElement.style.setProperty('--user-value-neutral-color', preferences.valueNeutralColor);
      }
      
      // עדכון צבעי סוגי השקעה - צבע אחד לכל סוג
      if (preferences.typeSwingColor) {
        document.documentElement.style.setProperty('--user-type-swing-color', preferences.typeSwingColor);
      }
      if (preferences.typeInvestmentColor) {
        document.documentElement.style.setProperty('--user-type-investment-color', preferences.typeInvestmentColor);
      }
      if (preferences.typePassiveColor) {
        document.documentElement.style.setProperty('--user-type-passive-color', preferences.typePassiveColor);
      }
      
      // עדכון צבעי עדיפויות - צבע אחד לכל עדיפות
      if (preferences.priorityHighColor) {
        document.documentElement.style.setProperty('--user-priority-high-color', preferences.priorityHighColor);
      }
      if (preferences.priorityMediumColor) {
        document.documentElement.style.setProperty('--user-priority-medium-color', preferences.priorityMediumColor);
      }
      if (preferences.priorityLowColor) {
        document.documentElement.style.setProperty('--user-priority-low-color', preferences.priorityLowColor);
      }
      
      /* ===== Light Mode Only - No Dark Mode ===== */
      /* Dark/Light variants removed - only light mode supported */
      
      // עדכון צבעי ישויות
      if (preferences.entityExecutionColor) {
        document.documentElement.style.setProperty('--entity-execution-color', preferences.entityExecutionColor);
        // המרת הוריאנט הבהיר לשקיפות 0.8
        const lightColor = preferences.entityExecutionColorLight || '#fff4e6';
        const rgb = lightColor.startsWith('#') ? 
          `${parseInt(lightColor.slice(1, 3), 16)}, ${parseInt(lightColor.slice(3, 5), 16)}, ${parseInt(lightColor.slice(5, 7), 16)}` :
          '255, 244, 230';
        document.documentElement.style.setProperty('--entity-execution-bg', `rgba(${rgb}, 0.8)`);
        document.documentElement.style.setProperty('--entity-execution-text', preferences.entityExecutionColorDark || '#e55a00');
        document.documentElement.style.setProperty('--entity-execution-border', preferences.entityExecutionColorDark || '#e55a00');
      }
      
      if (preferences.entityTradeColor) {
        document.documentElement.style.setProperty('--entity-trade-color', preferences.entityTradeColor);
        document.documentElement.style.setProperty('--entity-trade-bg', preferences.entityTradeColorLight || '#e8f5e8');
        document.documentElement.style.setProperty('--entity-trade-text', preferences.entityTradeColorDark || '#1e7e34');
        document.documentElement.style.setProperty('--entity-trade-border', preferences.entityTradeColorDark || '#1e7e34');
      }
      
      if (preferences.entityTradingAccountColor) {
        document.documentElement.style.setProperty('--entity-account-color', preferences.entityTradingAccountColor);
        document.documentElement.style.setProperty('--entity-account-bg', preferences.entityTradingAccountColorLight || '#e6f7f7');
        document.documentElement.style.setProperty('--entity-account-text', preferences.entityTradingAccountColorDark || '#1e7e80');
        document.documentElement.style.setProperty('--entity-account-border', preferences.entityTradingAccountColorDark || '#1e7e80');
      }
      
      if (preferences.entityTickerColor) {
        document.documentElement.style.setProperty('--entity-ticker-color', preferences.entityTickerColor);
        document.documentElement.style.setProperty('--entity-ticker-bg', preferences.entityTickerColorLight || '#fff3cd');
        document.documentElement.style.setProperty('--entity-ticker-text', preferences.entityTickerColorDark || '#856404');
        document.documentElement.style.setProperty('--entity-ticker-border', preferences.entityTickerColorDark || '#856404');
      }
      
      if (preferences.entityAlertColor) {
        document.documentElement.style.setProperty('--entity-alert-color', preferences.entityAlertColor);
        document.documentElement.style.setProperty('--entity-alert-bg', preferences.entityAlertColorLight || '#f8d7da');
        document.documentElement.style.setProperty('--entity-alert-text', preferences.entityAlertColorDark || '#721c24');
        document.documentElement.style.setProperty('--entity-alert-border', preferences.entityAlertColorDark || '#721c24');
      }
      
      if (preferences.entityCashFlowColor) {
        document.documentElement.style.setProperty('--entity-cash-flow-color', preferences.entityCashFlowColor);
        document.documentElement.style.setProperty('--entity-cash-flow-bg', preferences.entityCashFlowColorLight || '#d1ecf1');
        document.documentElement.style.setProperty('--entity-cash-flow-text', preferences.entityCashFlowColorDark || '#0c5460');
        document.documentElement.style.setProperty('--entity-cash-flow-border', preferences.entityCashFlowColorDark || '#0c5460');
      }
      
      if (preferences.entityNoteColor) {
        document.documentElement.style.setProperty('--entity-note-color', preferences.entityNoteColor);
        document.documentElement.style.setProperty('--entity-note-bg', preferences.entityNoteColorLight || '#e2e3e5');
        document.documentElement.style.setProperty('--entity-note-text', preferences.entityNoteColorDark || '#383d41');
        document.documentElement.style.setProperty('--entity-note-border', preferences.entityNoteColorDark || '#383d41');
      }
      
      if (preferences.entityTradePlanColor) {
        document.documentElement.style.setProperty('--entity-trade-plan-color', preferences.entityTradePlanColor);
        document.documentElement.style.setProperty('--entity-trade-plan-bg', preferences.entityTradePlanColorLight || '#d4edda');
        document.documentElement.style.setProperty('--entity-trade-plan-text', preferences.entityTradePlanColorDark || '#155724');
        document.documentElement.style.setProperty('--entity-trade-plan-border', preferences.entityTradePlanColorDark || '#155724');
      }

      // עדכון צבעי גרפים
      if (preferences.chartPrimaryColor) {
        document.documentElement.style.setProperty('--chart-primary-color', preferences.chartPrimaryColor);
      }
      if (preferences.chartBackgroundColor) {
        document.documentElement.style.setProperty('--chart-background-color', preferences.chartBackgroundColor);
      }
      if (preferences.chartTextColor) {
        document.documentElement.style.setProperty('--chart-text-color', preferences.chartTextColor);
      }
      if (preferences.chartGridColor) {
        document.documentElement.style.setProperty('--chart-grid-color', preferences.chartGridColor);
      }
      if (preferences.chartBorderColor) {
        document.documentElement.style.setProperty('--chart-border-color', preferences.chartBorderColor);
      }
      if (preferences.chartPointColor) {
        document.documentElement.style.setProperty('--chart-point-color', preferences.chartPointColor);
      }
      
      // עדכון הגדרות גרפים
      if (preferences.chartAutoRefresh !== undefined) {
        document.documentElement.style.setProperty('--chart-auto-refresh', preferences.chartAutoRefresh);
      }
      if (preferences.chartRefreshInterval) {
        document.documentElement.style.setProperty('--chart-refresh-interval', preferences.chartRefreshInterval + 's');
      }
      if (preferences.chartQuality) {
        document.documentElement.style.setProperty('--chart-quality', preferences.chartQuality);
      }
      if (preferences.chartAnimations !== undefined) {
        document.documentElement.style.setProperty('--chart-animations', preferences.chartAnimations);
      }
      if (preferences.chartInteractive !== undefined) {
        document.documentElement.style.setProperty('--chart-interactive', preferences.chartInteractive);
      }
      if (preferences.chartShowTooltips !== undefined) {
        document.documentElement.style.setProperty('--chart-show-tooltips', preferences.chartShowTooltips);
      }
      if (preferences.chartExportFormat) {
        document.documentElement.style.setProperty('--chart-export-format', preferences.chartExportFormat);
      }
      if (preferences.chartExportQuality) {
        document.documentElement.style.setProperty('--chart-export-quality', preferences.chartExportQuality);
      }
      if (preferences.chartExportResolution) {
        document.documentElement.style.setProperty('--chart-export-resolution', preferences.chartExportResolution);
      }
      if (preferences.chartExportBackground !== undefined) {
        document.documentElement.style.setProperty('--chart-export-background', preferences.chartExportBackground);
      }
      if (preferences.valueNegativeColorDark) {
        document.documentElement.style.setProperty('--numeric-negative-dark', preferences.valueNegativeColorDark);
      }
      if (preferences.valueNegativeColorLight) {
        document.documentElement.style.setProperty('--numeric-negative-light', preferences.valueNegativeColorLight);
      }
      if (preferences.valueNeutralColorDark) {
        document.documentElement.style.setProperty('--numeric-zero-dark', preferences.valueNeutralColorDark);
      }
      if (preferences.valueNeutralColorLight) {
        document.documentElement.style.setProperty('--numeric-zero-light', preferences.valueNeutralColorLight);
      }
      
      // עדכון צבעי גרפים מיוחדים
      if (preferences.chartPrimaryColor) {
        document.documentElement.style.setProperty('--chart-primary-color', preferences.chartPrimaryColor);
      }
      if (preferences.chartBackgroundColor) {
        document.documentElement.style.setProperty('--chart-background-color', preferences.chartBackgroundColor);
      }
      if (preferences.chartTextColor) {
        document.documentElement.style.setProperty('--chart-text-color', preferences.chartTextColor);
      }
      if (preferences.chartGridColor) {
        document.documentElement.style.setProperty('--chart-grid-color', preferences.chartGridColor);
      }
      if (preferences.chartBorderColor) {
        document.documentElement.style.setProperty('--chart-border-color', preferences.chartBorderColor);
      }
      if (preferences.chartPointColor) {
        document.documentElement.style.setProperty('--chart-point-color', preferences.chartPointColor);
      }

    // עדכון צבעים בסיסיים
    if (preferences.primaryColor) {
      document.documentElement.style.setProperty('--primary-color', preferences.primaryColor);
    } else {
      console.log('⚠️ primaryColor לא נמצא בהעדפות');
    }
    if (preferences.chartPrimaryColor) {
      document.documentElement.style.setProperty('--chart-primary-color', preferences.chartPrimaryColor);
    }
    if (preferences.chartBackgroundColor) {
      document.documentElement.style.setProperty('--chart-background-color', preferences.chartBackgroundColor);
    }
    if (preferences.chartTextColor) {
      document.documentElement.style.setProperty('--chart-text-color', preferences.chartTextColor);
    }
    if (preferences.chartGridColor) {
      document.documentElement.style.setProperty('--chart-grid-color', preferences.chartGridColor);
    }
    if (preferences.chartBorderColor) {
      document.documentElement.style.setProperty('--chart-border-color', preferences.chartBorderColor);
    }
    if (preferences.chartPointColor) {
      document.documentElement.style.setProperty('--chart-point-color', preferences.chartPointColor);
    }
    
    // עדכון הגדרות גרפים
    if (preferences.chartAutoRefresh !== undefined) {
      document.documentElement.style.setProperty('--chart-auto-refresh', preferences.chartAutoRefresh ? 'true' : 'false');
    }
    if (preferences.chartRefreshInterval) {
      document.documentElement.style.setProperty('--chart-refresh-interval', preferences.chartRefreshInterval + 's');
    }
    if (preferences.chartQuality) {
      document.documentElement.style.setProperty('--chart-quality', preferences.chartQuality);
    }
    if (preferences.chartAnimations !== undefined) {
      document.documentElement.style.setProperty('--chart-animations', preferences.chartAnimations ? 'true' : 'false');
    }
    if (preferences.chartInteractive !== undefined) {
      document.documentElement.style.setProperty('--chart-interactive', preferences.chartInteractive ? 'true' : 'false');
    }
    if (preferences.chartShowTooltips !== undefined) {
      document.documentElement.style.setProperty('--chart-show-tooltips', preferences.chartShowTooltips ? 'true' : 'false');
    }
    if (preferences.chartExportFormat) {
      document.documentElement.style.setProperty('--chart-export-format', preferences.chartExportFormat);
    }
    if (preferences.chartExportQuality) {
      document.documentElement.style.setProperty('--chart-export-quality', preferences.chartExportQuality);
    }
    if (preferences.chartExportResolution) {
      document.documentElement.style.setProperty('--chart-export-resolution', preferences.chartExportResolution);
    }
    if (preferences.chartExportBackground !== undefined) {
      document.documentElement.style.setProperty('--chart-export-background', preferences.chartExportBackground ? 'true' : 'false');
    }
    if (preferences.secondaryColor) {
      document.documentElement.style.setProperty('--secondary-color', preferences.secondaryColor);
    }
    if (preferences.successColor) {
      document.documentElement.style.setProperty('--success-color', preferences.successColor);
    }
    if (preferences.infoColor) {
      document.documentElement.style.setProperty('--info-color', preferences.infoColor);
    }
    if (preferences.warningColor) {
      document.documentElement.style.setProperty('--warning-color', preferences.warningColor);
    }
    if (preferences.dangerColor) {
      document.documentElement.style.setProperty('--danger-color', preferences.dangerColor);
    }
    
    // עדכון צבעי רקע וטקסט
    if (preferences.cardBackground) {
      document.documentElement.style.setProperty('--card-background', preferences.cardBackground);
    }
    if (preferences.inputBackground) {
      document.documentElement.style.setProperty('--input-background', preferences.inputBackground);
    }
    if (preferences.textColor) {
      document.documentElement.style.setProperty('--text-color', preferences.textColor);
    }
    if (preferences.textMuted) {
      document.documentElement.style.setProperty('--text-muted', preferences.textMuted);
    }
    if (preferences.borderColor) {
      document.documentElement.style.setProperty('--border-color', preferences.borderColor);
    }
    
    // עדכון צבעי hover
    if (preferences.primaryHover) {
      document.documentElement.style.setProperty('--primary-hover', preferences.primaryHover);
    }
    if (preferences.secondaryHover) {
      document.documentElement.style.setProperty('--secondary-hover', preferences.secondaryHover);
    }
    if (preferences.successHover) {
      document.documentElement.style.setProperty('--success-hover', preferences.successHover);
    }
    if (preferences.warningHover) {
      document.documentElement.style.setProperty('--warning-hover', preferences.warningHover);
    }
    if (preferences.dangerHover) {
      document.documentElement.style.setProperty('--danger-hover', preferences.dangerHover);
    }
    if (preferences.infoHover) {
      document.documentElement.style.setProperty('--info-hover', preferences.infoHover);
    }
    
    // עדכון צבעי רקע עם שקיפות
    if (preferences.successBackground) {
      document.documentElement.style.setProperty('--success-background', preferences.successBackground);
    }
    if (preferences.warningBackground) {
      document.documentElement.style.setProperty('--warning-background', preferences.warningBackground);
    }
    if (preferences.dangerBackground) {
      document.documentElement.style.setProperty('--danger-background', preferences.dangerBackground);
    }
    if (preferences.infoBackground) {
      document.documentElement.style.setProperty('--info-background', preferences.infoBackground);
    }

      // עדכון צבעי ישויות - לפי השמות במערכת ההעדפות
      if (preferences.entityTradeColor) {
        document.documentElement.style.setProperty('--entity-trade-color', preferences.entityTradeColor);
        document.documentElement.style.setProperty('--entity-trade-bg', preferences.entityTradeColorLight || 'rgba(251, 90, 5, 0.1)');
        document.documentElement.style.setProperty('--entity-trade-text', '#752a0b');
        document.documentElement.style.setProperty('--entity-trade-border', `rgba(${hexToRgb(preferences.entityTradeColor)?.r || 251}, ${hexToRgb(preferences.entityTradeColor)?.g || 90}, ${hexToRgb(preferences.entityTradeColor)?.b || 5}, 0.3)`);
      }
      
      /* ===== Light Mode Only - No Dark Mode ===== */
      /* Entity Dark/Light variants removed - only light mode supported */
    if (preferences.entityTradePlanColor) {
      document.documentElement.style.setProperty('--entity-trade-plan-color', preferences.entityTradePlanColor);
      document.documentElement.style.setProperty('--entity-trade-plan-bg', preferences.entityTradePlanColorLight || 'rgba(255, 169, 0, 0.1)');
        document.documentElement.style.setProperty('--entity-trade-plan-text', '#b35d00');
      document.documentElement.style.setProperty('--entity-trade-plan-border', `rgba(${hexToRgb(preferences.entityTradePlanColor)?.r || 255}, ${hexToRgb(preferences.entityTradePlanColor)?.g || 169}, ${hexToRgb(preferences.entityTradePlanColor)?.b || 0}, 0.3)`);
    }
    if (preferences.entityExecutionColor) {
      document.documentElement.style.setProperty('--entity-execution-color', preferences.entityExecutionColor);
      document.documentElement.style.setProperty('--entity-execution-bg', preferences.entityExecutionColorLight || 'rgba(169, 206, 26, 0.1)');
      document.documentElement.style.setProperty('--entity-execution-text', preferences.entityExecutionColorDark || '#688016');
      document.documentElement.style.setProperty('--entity-execution-border', `rgba(${hexToRgb(preferences.entityExecutionColor)?.r || 169}, ${hexToRgb(preferences.entityExecutionColor)?.g || 206}, ${hexToRgb(preferences.entityExecutionColor)?.b || 26}, 0.3)`);
    }
    if (preferences.entityTradingAccountColor) {
      document.documentElement.style.setProperty('--entity-trading-account-color', preferences.entityTradingAccountColor);
      document.documentElement.style.setProperty('--entity-trading-account-bg', preferences.entityTradingAccountColorLight || 'rgba(0, 66, 170, 0.1)');
      document.documentElement.style.setProperty('--entity-trading-account-text', '#032e78');
      document.documentElement.style.setProperty('--entity-trading-account-border', `rgba(${hexToRgb(preferences.entityTradingAccountColor)?.r || 0}, ${hexToRgb(preferences.entityTradingAccountColor)?.g || 66}, ${hexToRgb(preferences.entityTradingAccountColor)?.b || 170}, 0.3)`);
    }
    if (preferences.entityCashFlowColor) {
      document.documentElement.style.setProperty('--entity-cash-flow-color', preferences.entityCashFlowColor);
      document.documentElement.style.setProperty('--entity-cash-flow-bg', preferences.entityCashFlowColorLight || 'rgba(148, 90, 0, 0.1)');
      document.documentElement.style.setProperty('--entity-cash-flow-text', preferences.entityCashFlowColorDark || '#5a3704');
      document.documentElement.style.setProperty('--entity-cash-flow-border', `rgba(${hexToRgb(preferences.entityCashFlowColor)?.r || 148}, ${hexToRgb(preferences.entityCashFlowColor)?.g || 90}, ${hexToRgb(preferences.entityCashFlowColor)?.b || 0}, 0.3)`);
    }
    if (preferences.entityTickerColor) {
      document.documentElement.style.setProperty('--entity-ticker-color', preferences.entityTickerColor);
      document.documentElement.style.setProperty('--entity-ticker-bg', preferences.entityTickerColorLight || 'rgba(153, 41, 189, 0.1)');
      document.documentElement.style.setProperty('--entity-ticker-text', preferences.entityTickerColorDark || '#770087');
      document.documentElement.style.setProperty('--entity-ticker-border', `rgba(${hexToRgb(preferences.entityTickerColor)?.r || 153}, ${hexToRgb(preferences.entityTickerColor)?.g || 41}, ${hexToRgb(preferences.entityTickerColor)?.b || 189}, 0.3)`);
    }
    if (preferences.entityAlertColor) {
      document.documentElement.style.setProperty('--entity-alert-color', preferences.entityAlertColor);
      document.documentElement.style.setProperty('--entity-alert-bg', preferences.entityAlertColorLight || 'rgba(200, 23, 0, 0.1)');
      document.documentElement.style.setProperty('--entity-alert-text', preferences.entityAlertColorDark || '#9e0000');
      document.documentElement.style.setProperty('--entity-alert-border', `rgba(${hexToRgb(preferences.entityAlertColor)?.r || 200}, ${hexToRgb(preferences.entityAlertColor)?.g || 23}, ${hexToRgb(preferences.entityAlertColor)?.b || 0}, 0.3)`);
    }
    if (preferences.entityNoteColor) {
      document.documentElement.style.setProperty('--entity-note-color', preferences.entityNoteColor);
      document.documentElement.style.setProperty('--entity-note-bg', preferences.entityNoteColorLight || 'rgba(196, 188, 0, 0.1)');
      document.documentElement.style.setProperty('--entity-note-text', preferences.entityNoteColorDark || '#89840a');
      document.documentElement.style.setProperty('--entity-note-border', `rgba(${hexToRgb(preferences.entityNoteColor)?.r || 196}, ${hexToRgb(preferences.entityNoteColor)?.g || 188}, ${hexToRgb(preferences.entityNoteColor)?.b || 0}, 0.3)`);
    }

    // console.log('🎨 צבעים מעודכנים:', {
    //   primary: preferences.primaryColor,
    //   secondary: preferences.secondaryColor,
    //   trade: preferences.entityTradeColor,
    //   trading_account: preferences.entityTradingAccountColor,
    //   positive: preferences.valuePositiveColor,
    //   negative: preferences.valueNegativeColor
    // });

    // Dispatch event to notify chart theme system
    if (window.dispatchEvent) {
      window.dispatchEvent(new CustomEvent('colorPreferencesUpdated'));
    }
    
  } catch (error) {
    console.error('❌ שגיאה בעדכון CSS Variables:', error);
  }
}

/**
 * טעינת הגדרות צבע מהעדפות
 * ✨ עודכן לתמיכה במערכת העדפות!
 * Load color settings from preferences
 */
async function loadColorPreferences() {
  try {
    // מניעת כפילויות
    if (window.colorPreferencesLoaded) {
      return;
    }
    

    // נסה ראשית מערכת העדפות
    try {
      const newResponse = await fetch('/api/preferences/user');
      if (newResponse.ok) {
        const newData = await newResponse.json();
        if (newData.success && newData.data.preferences) {
          const prefs = newData.data.preferences;
          
          // עדכון מערכת הצבעים מהעדפות
          if (prefs.colorScheme) {
            if (prefs.colorScheme.numericValues) {
              Object.assign(NUMERIC_VALUE_COLORS, prefs.colorScheme.numericValues);
            }
            if (prefs.colorScheme.entities) {
              Object.assign(ENTITY_COLORS, prefs.colorScheme.entities);
            }
            if (prefs.colorScheme.status) {
              Object.assign(STATUS_COLORS, prefs.colorScheme.status);
            }
          }
          
    // עדכון CSS Variables
    updateCSSVariablesFromPreferences(prefs);
          
          // עדכון כותרות עם הצבעים החדשים
          const bodyClass = document.body.className;
          if (bodyClass) {
            const entityType = bodyClass.split(' ').find(cls => 
              ['tickers-page', 'trades-page', 'accounts-page', 'alerts-page', 'cash-flows-page'].includes(cls)
            );
            
            if (entityType) {
              const entity = entityType.replace('-page', '').replace('tickers', 'ticker');
              if (ENTITY_COLORS[entity]) {
                applyEntityColorsToHeaders(entity);
              }
            }
          }
          
          window.colorPreferencesLoaded = true;
          return true;
        }
      }
    } catch (newError) {
      // preferences not available (likely database tables not created yet)
    }

    // Fallback ל-legacy
    const response = await fetch('/api/preferences/user');
    if (response.ok) {
      const data = await response.json();
      const preferences = data.data || data;

      // עדכון מערכת הצבעים
      // הסרנו את preferences.numericValueColors כי הוא לא קיים במערכת ההעדפות
      // במקום זה משתמשים במשתנים ספציפיים: valuePositiveColor, valueNegativeColor וכו'

      // הסרנו את preferences.entityColors כי הוא לא קיים במערכת ההעדפות
      // במקום זה משתמשים במשתנים ספציפיים: entityTradeColor, entityTradingAccountColor וכו'

      // עדכון CSS Variables
      updateCSSVariablesFromPreferences(preferences);

      // עדכון כותרות עם הצבעים החדשים
      const bodyClass = document.body.className;
      if (bodyClass) {
        const entityType = bodyClass.split(' ').find(cls => 
          ['tickers-page', 'trades-page', 'accounts-page', 'alerts-page', 'cash-flows-page'].includes(cls)
        );
        
        if (entityType) {
          let type = entityType.replace('-page', '');
          // תיקון שמות ישויות לפורמט יחיד
          if (type === 'tickers') type = 'ticker';
          else if (type === 'trades') type = 'trade';
          else if (type === 'accounts') type = 'account';
          else if (type === 'alerts') type = 'alert';
          else if (type === 'cash-flows') type = 'cash-flow';
          else if (type === 'notes') type = 'note';
          else if (type === 'trade-plans') type = 'trade-plan';
          else if (type === 'executions') type = 'execution';
          
          if (window.applyEntityColorsToHeaders) {
            setTimeout(() => {
              window.applyEntityColorsToHeaders(type);
            }, 100);
          }
        }
      }

      window.colorPreferencesLoaded = true;
    } else {
      console.log('❌ Response not ok:', response.status);
    }
  } catch (error) {
    console.error('❌ שגיאה בטעינת הגדרות צבע:', error);
  }
}

// Test function to manually update primary color
window.testUpdatePrimaryColor = function() {
  console.log('🧪 Testing manual primary color update...');
  document.documentElement.style.setProperty('--primary-color', '#26baac');
};

// Test function to manually load preferences
window.testLoadPreferences = function() {
  console.log('🧪 Testing manual preferences load...');
  loadColorPreferences().then(() => {
  }).catch(error => {
    console.error('❌ Error loading preferences manually:', error);
  });
};

// Test function to check current CSS variables
window.testCheckCSSVariables = function() {
  console.log('🧪 Checking current CSS variables...');
  const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
  console.log('Current --primary-color:', primaryColor);
  return primaryColor;
};

// Test function to force update primary color
window.testForceUpdatePrimaryColor = function() {
  console.log('🧪 Force updating primary color...');
  document.documentElement.style.setProperty('--primary-color', '#26baac');
  
  // Check if it worked
  const newColor = getComputedStyle(document.documentElement).getPropertyValue('--primary-color');
  console.log('New --primary-color:', newColor);
  
  return newColor;
};

// Test function to check if color scheme system is loaded
window.testColorSchemeSystem = function() {
  console.log('🧪 Testing color scheme system...');
  console.log('loadColorPreferences function:', typeof loadColorPreferences);
  console.log('updateCSSVariablesFromPreferences function:', typeof updateCSSVariablesFromPreferences);
  console.log('window.currentPreferences:', window.currentPreferences);
  
  // Try to load preferences manually
  if (typeof loadColorPreferences === 'function') {
    loadColorPreferences().then(() => {
    }).catch(error => {
      console.error('❌ Manual preferences load failed:', error);
    });
  } else {
    console.log('❌ loadColorPreferences is not available');
  }
};


/**
 * עדכון צבעי ישויות מהעדפות
 * Update entity colors from preferences
 */
function updateEntityColors(preferences) {
  try {
    // הסרנו את preferences.entityColors כי הוא לא קיים במערכת ההעדפות
    // במקום זה משתמשים במשתנים ספציפיים
      updateCSSVariablesFromPreferences(preferences);
  } catch (error) {
    console.error('❌ שגיאה בעדכון צבעי ישויות:', error);
  }
}

// ===== HEADER STYLING FUNCTIONS =====
// פונקציות לעיצוב כותרות

/**
 * יישום צבעי ישות על כותרות עמוד
 * Apply entity colors to page headers
 *
 * @param {string} entityType - סוג הישות
 * @param {boolean} excludeWarningModals - האם להחריג מודולי אזהרה
 */
function applyEntityColorsToHeaders(entityType, excludeWarningModals = true) {
  try {
    const color = getEntityColor(entityType);
    if (!color) {
      console.warn(`⚠️ לא נמצא צבע לישות: ${entityType}`);
      return;
    }

    // כותרת ראשית - תחת top-section
    const mainHeaders = document.querySelectorAll('.top-section .section-header');
    mainHeaders.forEach(header => {
      if (excludeWarningModals && isWarningModal(header)) {
        return; // דלג על מודולי אזהרה
      }
      
      // דלג על כותרות מודלים - הן מנוהלות על ידי ההגדרות הכלליות
      if (header.closest('.modal')) {
        return;
      }
      
      // הסרת כל המחלקות הישנות של ישויות
      VALID_ENTITY_TYPES.forEach(type => {
        header.classList.remove(`entity-${type}-main-header`);
        header.classList.remove(`entity-${type}-sub-header`);
      });
      
      header.classList.add(`entity-${entityType}-main-header`);
    });

    // כותרות משניות - תחת content-section
    const subHeaders = document.querySelectorAll('.content-section .section-header');
    subHeaders.forEach(header => {
      if (excludeWarningModals && isWarningModal(header)) {
        return; // דלג על מודולי אזהרה
      }
      
      // דלג על כותרות מודלים - הן מנוהלות על ידי ההגדרות הכלליות
      if (header.closest('.modal')) {
        return;
      }
      
      // הסרת כל המחלקות הישנות של ישויות
      VALID_ENTITY_TYPES.forEach(type => {
        header.classList.remove(`entity-${type}-main-header`);
        header.classList.remove(`entity-${type}-sub-header`);
      });
      
      header.classList.add(`entity-${entityType}-sub-header`);
    });

    // כותרות מודלים מנוהלות על ידי ההגדרות הכלליות ב-styles.css
    
  } catch (error) {
    console.error(`❌ שגיאה ביישום צבעי ישות ${entityType}:`, error);
  }
}

/**
 * בדיקה אם אלמנט הוא מודל אזהרה
 * Check if element is a warning modal
 *
 * @param {Element} element - האלמנט לבדיקה
 * @returns {boolean} האם מודל אזהרה
 */
function isWarningModal(element) {
  if (!element) return false;
  
  // בדיקת ID של מודלים
  const warningModalIds = [
    'deleteExecutionModal',
    'deleteTradeModal', 
    'deleteAccountModal',
    'deleteTickerModal',
    'deleteAlertModal',
    'confirmDeleteModal',
    'warningModal'
  ];
  
  // בדיקת ID ישיר
  if (element.id && warningModalIds.includes(element.id)) {
    return true;
  }
  
  // בדיקת מודל הורה
  const modal = element.closest('.modal');
  if (modal && modal.id && warningModalIds.includes(modal.id)) {
    return true;
  }
  
  // בדיקת טקסט אזהרה
  const text = element.textContent?.toLowerCase() || '';
  const warningKeywords = ['מחיקה', 'ביטול', 'אזהרה', 'delete', 'cancel', 'warning'];
  
  return warningKeywords.some(keyword => text.includes(keyword));
}


/**
 * קבלת שקיפות כותרת ראשית כ-hex
 * Get main header opacity as hex
 */
function getMainHeaderOpacityHex() {
  try {
    // ניסיון לקבל מהעדפות
    if (window.currentPreferences && window.currentPreferences.headerOpacity && window.currentPreferences.headerOpacity.main) {
      const opacity = window.currentPreferences.headerOpacity.main;
      return Math.round(opacity * 255 / 100).toString(16).padStart(2, '0');
    }
    
    // ברירת מחדל: 100%
    return 'FF'; // 100% of 255 = 255 = FF in hex
    
  } catch (error) {
    console.error('❌ שגיאה בקבלת שקיפות כותרת ראשית:', error);
    return 'FF'; // ברירת מחדל 100%
  }
}

/**
 * קבלת שקיפות כותרת משנית כ-hex
 * Get sub header opacity as hex
 */
function getSubHeaderOpacityHex() {
  try {
    // ניסיון לקבל מהעדפות
    if (window.currentPreferences && window.currentPreferences.headerOpacity && window.currentPreferences.headerOpacity.sub) {
      const opacity = window.currentPreferences.headerOpacity.sub;
      return Math.round(opacity * 255 / 100).toString(16).padStart(2, '0');
    }
    
    // ברירת מחדל: 30%
    return '4D'; // 30% of 255 = 77 = 4D in hex
    
  } catch (error) {
    console.error('❌ שגיאה בקבלת שקיפות כותרת משנית:', error);
    return '4D'; // ברירת מחדל
  }
}

// ===== INITIALIZATION =====
// אתחול המערכת

// טעינת הגדרות צבע בטעינת הדף - הוסר כדי למנוע כפילות עם core-systems.js
// האתחול מתבצע דרך מערכת האתחול המאוחדת

// ===== COLOR SCHEME MANAGEMENT FUNCTIONS =====
// פונקציות ניהול סכמות צבעים

/**
 * Apply color scheme to the application
 * יישום סכמת צבעים על האפליקציה
 * 
 * @param {string} schemeName - שם הסכמה (light, dark, custom)
 * @param {Object} customColors - צבעים מותאמים אישית (אופציונלי)
 */
async function applyColorScheme(schemeName = 'light', customColors = null) {
  try {
    
    // Remove existing scheme classes
    document.body.classList.remove('light-scheme', 'dark-scheme', 'custom-scheme');
    
    // Apply new scheme
    document.body.classList.add(`${schemeName}-scheme`);
    
    // Store current scheme using Unified Cache Manager
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
      await window.UnifiedCacheManager.save('colorScheme', schemeName, {
        layer: 'localStorage',
        ttl: null, // persistent
        syncToBackend: false
      });
      console.log(`💾 Color scheme saved to Unified Cache: ${schemeName}`);
    } else {
      // Fallback to localStorage if Unified Cache is not available
      localStorage.setItem('colorScheme', schemeName);
      console.log(`💾 Color scheme saved to localStorage (fallback): ${schemeName}`);
    }
    
    // Apply scheme-specific colors
    switch (schemeName) {
      case 'light':
        applyLightScheme();
        break;
      case 'dark':
        applyDarkScheme();
        break;
      case 'custom':
        if (customColors) {
          applyCustomScheme(customColors);
        }
        break;
      default:
        console.warn(`⚠️ Unknown color scheme: ${schemeName}`);
        applyLightScheme();
    }
    
    // Update CSS variables
    updateCSSVariablesFromPreferences(window.currentPreferences || {});
    
    // Dispatch event for other systems
    window.dispatchEvent(new CustomEvent('colorSchemeChanged', {
      detail: { scheme: schemeName, customColors }
    }));
    
    
  } catch (error) {
    console.error('❌ Error applying color scheme:', error);
  }
}

/**
 * Toggle between light and dark color schemes
 * החלפה בין סכמות צבעים בהירות וכהה
 */
async function toggleColorScheme() {
  try {
    const currentScheme = await getCurrentColorScheme();
    const newScheme = currentScheme === 'light' ? 'dark' : 'light';
    
    await applyColorScheme(newScheme);
    
  } catch (error) {
    console.error('❌ Error toggling color scheme:', error);
  }
}

/**
 * Load color scheme from localStorage
 * טעינת סכמת צבעים מ-localStorage
 * 
 * @returns {string} שם הסכמה הנוכחית
 */
async function loadColorScheme() {
  try {
    let savedScheme = 'light';
    
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
      const cachedScheme = await window.UnifiedCacheManager.get('colorScheme');
      savedScheme = cachedScheme || 'light';
      console.log(`📥 Loading color scheme from Unified Cache: ${savedScheme}`);
    } else {
      // Fallback to localStorage if Unified Cache is not available
      savedScheme = localStorage.getItem('colorScheme') || 'light';
      console.log(`📥 Loading color scheme from localStorage (fallback): ${savedScheme}`);
    }
    
    // Apply the saved scheme
    await applyColorScheme(savedScheme);
    
    return savedScheme;
    
  } catch (error) {
    console.error('❌ Error loading color scheme:', error);
    return 'light';
  }
}

/**
 * Save color scheme to localStorage
 * שמירת סכמת צבעים ב-localStorage
 * 
 * @param {string} schemeName - שם הסכמה לשמירה
 * @param {Object} customColors - צבעים מותאמים אישית (אופציונלי)
 */
async function saveColorScheme(schemeName, customColors = null) {
  try {
    console.log(`💾 Saving color scheme: ${schemeName}`);
    
    // Save scheme name using Unified Cache Manager
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
      await window.UnifiedCacheManager.save('colorScheme', schemeName, {
        layer: 'localStorage',
        ttl: null, // persistent
        syncToBackend: false
      });
      console.log(`💾 Color scheme saved to Unified Cache: ${schemeName}`);
      
      // Save custom colors if provided
      if (customColors && schemeName === 'custom') {
        await window.UnifiedCacheManager.save('customColorScheme', customColors, {
          layer: 'localStorage',
          ttl: null, // persistent
          compress: true,
          syncToBackend: false
        });
        console.log(`💾 Custom color scheme saved to Unified Cache`);
      }
    } else {
      // Fallback to localStorage if Unified Cache is not available
      localStorage.setItem('colorScheme', schemeName);
      console.log(`💾 Color scheme saved to localStorage (fallback): ${schemeName}`);
      
      // Save custom colors if provided
      if (customColors && schemeName === 'custom') {
        localStorage.setItem('customColorScheme', JSON.stringify(customColors));
        console.log(`💾 Custom color scheme saved to localStorage (fallback)`);
      }
    }
    
    // Update current preferences
    if (window.currentPreferences) {
      window.currentPreferences.colorScheme = schemeName;
      if (customColors) {
        window.currentPreferences.customColors = customColors;
      }
    }
    
    
  } catch (error) {
    console.error('❌ Error saving color scheme:', error);
  }
}

/**
 * Get current color scheme
 * קבלת סכמת הצבעים הנוכחית
 * 
 * @returns {string} שם הסכמה הנוכחית
 */
async function getCurrentColorScheme() {
  try {
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.isInitialized()) {
      const cachedScheme = await window.UnifiedCacheManager.get('colorScheme');
      return cachedScheme || 'light';
    } else {
      // Fallback to localStorage if Unified Cache is not available
      return localStorage.getItem('colorScheme') || 'light';
    }
  } catch (error) {
    console.error('❌ Error getting current color scheme:', error);
    return 'light';
  }
}

/**
 * Apply light color scheme
 * יישום סכמת צבעים בהירה
 */
function applyLightScheme() {
  try {
    // Light scheme is the default - no special changes needed
    console.log('☀️ Applying light color scheme');
    
    // Ensure light theme variables are set
    document.documentElement.style.setProperty('--scheme-background', '#ffffff');
    document.documentElement.style.setProperty('--scheme-text', '#212529');
    document.documentElement.style.setProperty('--scheme-border', '#dee2e6');
    document.documentElement.style.setProperty('--scheme-card', '#ffffff');
    
  } catch (error) {
    console.error('❌ Error applying light scheme:', error);
  }
}

/**
 * Apply dark color scheme
 * יישום סכמת צבעים כהה
 */
function applyDarkScheme() {
  try {
    console.log('🌙 Applying dark color scheme');
    
    // Set dark theme variables
    document.documentElement.style.setProperty('--scheme-background', '#1a1a1a');
    document.documentElement.style.setProperty('--scheme-text', '#ffffff');
    document.documentElement.style.setProperty('--scheme-border', '#404040');
    document.documentElement.style.setProperty('--scheme-card', '#2d2d2d');
    
    // Note: Dark mode support was removed in January 2025
    // This function is kept for future implementation
    
  } catch (error) {
    console.error('❌ Error applying dark scheme:', error);
  }
}

/**
 * Apply custom color scheme
 * יישום סכמת צבעים מותאמת אישית
 * 
 * @param {Object} customColors - צבעים מותאמים אישית
 */
function applyCustomScheme(customColors) {
  try {
    
    // Apply custom colors to CSS variables
    Object.entries(customColors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--custom-${key}`, value);
    });
    
  } catch (error) {
    console.error('❌ Error applying custom scheme:', error);
  }
}

/**
 * Get available color schemes
 * קבלת סכמות צבעים זמינות
 * 
 * @returns {Array} רשימת סכמות צבעים זמינות
 */
function getAvailableColorSchemes() {
  return [
    { name: 'light', label: 'בהיר', description: 'סכמת צבעים בהירה' },
    { name: 'dark', label: 'כהה', description: 'סכמת צבעים כהה (לא נתמכת כרגע)' },
    { name: 'custom', label: 'מותאם אישית', description: 'סכמת צבעים מותאמת אישית' }
  ];
}

// ===== EXPORTS =====
// ייצוא הפונקציות

// Export color scheme management functions
window.applyColorScheme = applyColorScheme;
window.toggleColorScheme = toggleColorScheme;
window.loadColorScheme = loadColorScheme;
window.saveColorScheme = saveColorScheme;
window.getCurrentColorScheme = getCurrentColorScheme;
window.getAvailableColorSchemes = getAvailableColorSchemes;

// Export to global scope for backward compatibility
window.getInvestmentTypeColor = getInvestmentTypeColor;
window.getInvestmentTypeBackgroundColor = getInvestmentTypeBackgroundColor;
window.getInvestmentTypeTextColor = getInvestmentTypeTextColor;
window.getInvestmentTypeBorderColor = getInvestmentTypeBorderColor;
window.createInvestmentTypeLegend = createInvestmentTypeLegend;

// Export new unified functions
window.getEntityColor = getEntityColor;
window.getEntityBackgroundColor = getEntityBackgroundColor;
window.getEntityTextColor = getEntityTextColor;
window.getEntityBorderColor = getEntityBorderColor;
window.isValidEntityType = isValidEntityType;
window.getEntityLabel = getEntityLabel;
window.createEntityLegend = createEntityLegend;
window.generateEntityCSS = generateEntityCSS;
window.generateStatusCSS = generateStatusCSS;
window.generateInvestmentTypeCSS = generateInvestmentTypeCSS;
window.generateAndApplyStatusCSS = generateAndApplyStatusCSS;

// Export status color functions
window.getStatusColor = getStatusColor;
window.getStatusBackgroundColor = getStatusBackgroundColor;
window.getStatusTextColor = getStatusTextColor;
window.getStatusBorderColor = getStatusBorderColor;

// Export entity color management functions
window.updateEntityColor = updateEntityColor;
window.updateEntityColorFromHex = updateEntityColorFromHex;
window.resetEntityColors = resetEntityColors;

// Export preference integration functions
window.updateCSSVariablesFromPreferences = updateCSSVariablesFromPreferences;
window.loadColorPreferences = loadColorPreferences;
window.updateEntityColors = updateEntityColors;

// Export new utility functions
window.getTableColors = getTableColors;
window.getTableColorsWithFallbacks = getTableColorsWithFallbacks;
window.getColorPreferences = getColorPreferences;

// Export header styling functions
window.applyEntityColorsToHeaders = applyEntityColorsToHeaders;
window.loadEntityColorsFromPreferences = loadEntityColorsFromPreferences;
window.getEntityColor = getEntityColor;
window.isWarningModal = isWarningModal;
window.getMainHeaderOpacityHex = getMainHeaderOpacityHex;
window.getSubHeaderOpacityHex = getSubHeaderOpacityHex;

// Export constants
window.VALID_INVESTMENT_TYPES = VALID_INVESTMENT_TYPES;
window.INVESTMENT_TYPE_LABELS = INVESTMENT_TYPE_LABELS;
window.INVESTMENT_TYPE_DESCRIPTIONS = INVESTMENT_TYPE_DESCRIPTIONS;
window.INVESTMENT_TYPE_COLORS = INVESTMENT_TYPE_COLORS;

window.VALID_ENTITY_TYPES = VALID_ENTITY_TYPES;
window.ENTITY_COLORS = ENTITY_COLORS;
window.ENTITY_BACKGROUND_COLORS = ENTITY_BACKGROUND_COLORS;
window.ENTITY_TEXT_COLORS = ENTITY_TEXT_COLORS;
window.ENTITY_BORDER_COLORS = ENTITY_BORDER_COLORS;
window.STATUS_COLORS = STATUS_COLORS;
window.INVESTMENT_TYPE_COLORS = INVESTMENT_TYPE_COLORS;

// Export as module object
window.colorSchemeSystem = {
  // Entity functions
  getColor: getEntityColor,
  getBackgroundColor: getEntityBackgroundColor,
  getTextColor: getEntityTextColor,
  getBorderColor: getEntityBorderColor,
  isValid: isValidEntityType,
  getLabel: getEntityLabel,
  createLegend: createEntityLegend,
  generateCSS: generateEntityCSS,

  // Investment type functions (backward compatibility)
  getInvestmentTypeColor,
  getInvestmentTypeBackgroundColor,
  getInvestmentTypeTextColor,
  getInvestmentTypeBorderColor,
  createInvestmentTypeLegend,

  // Numeric value functions
  getNumericValueColor,
  getNumericValueBackgroundColor,
  getNumericValueTextColor,
  getNumericValueBorderColor,
  isPositiveValue,
  isNegativeValue,
  isZeroValue,
  getValueType,
  getNumericValueCSSClass,
  generateNumericValueCSS,

  // Status color functions
  getStatusColor,
  getStatusBackgroundColor,
  getStatusTextColor,
  getStatusBorderColor,
  generateStatusCSS,

  // Investment type color functions
  getInvestmentTypeColor,
  getInvestmentTypeBackgroundColor,
  getInvestmentTypeTextColor,
  getInvestmentTypeBorderColor,
  generateInvestmentTypeCSS,

  // Header styling functions
  applyEntityColorsToHeaders,
  isWarningModal,
  getMainHeaderOpacityHex,
  getSubHeaderOpacityHex,
  updateNumericValueColors,

  // Dynamic color loading functions
  loadEntityColorsFromPreferences,
  loadStatusColorsFromPreferences,
  loadInvestmentTypeColorsFromPreferences,
  loadAllColorsFromPreferences,
  generateAndApplyEntityCSS,
  updateCSSVariablesFromPreferences,
  hexToRgb,
  darkenColor,

  // Constants
  VALID_ENTITY_TYPES,
  ENTITY_COLORS,
  ENTITY_BACKGROUND_COLORS,
  ENTITY_TEXT_COLORS,
  ENTITY_BORDER_COLORS,
  STATUS_COLORS,
  INVESTMENT_TYPE_COLORS,

  VALID_INVESTMENT_TYPES,
  INVESTMENT_TYPE_LABELS,
  INVESTMENT_TYPE_DESCRIPTIONS,
  INVESTMENT_TYPE_COLORS,

  NUMERIC_VALUE_COLORS,
};

// ===== DYNAMIC COLORS LOADER =====
/**
 * Load dynamic colors from preferences
 * טען צבעים דינמיים מהעדפות
 */
async function loadDynamicColors() {
  try {
    // Load color scheme from preferences
    if (typeof window.loadColorScheme === 'function') {
      await window.loadColorScheme();
    }
    
    // Apply current color scheme
    if (typeof window.applyColorScheme === 'function') {
      window.applyColorScheme();
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error loading dynamic colors:', error);
    return false;
  }
}

// Export functions
window.loadDynamicColors = loadDynamicColors;

// Auto-load on DOM ready
// הוסר DOMContentLoaded listener כדי למנוע כפילות עם core-systems.js
// loadDynamicColors נקרא דרך מערכת האתחול המאוחדת

// Color Scheme System loaded successfully

