/**
 * Unified Color Scheme System - Clean Version
 * מערכת מפתח צבעים מאוחדת - גרסה נקייה
 *
 * קובץ זה מגדיר את כל מפתחות הצבעים במערכת בצורה מאוחדת
 * ומאפשר שימוש עקבי בכל העמודים והמודולים
 *
 * @author TikTrack System
 * @version 2.1.0
 * @lastUpdated January 21, 2025
 * @since 2025-01-09
 */


// ===== FUNCTION INDEX =====

// === Event Handlers ===
// - eventHandler() - Eventhandler

// === UI Functions ===
// - updateEntityColors() - Updateentitycolors
// - updateCSSVariablesFromPreferences() - Updatecssvariablesfrompreferences

// === Data Functions ===
// - getEntityColor() - Getentitycolor
// - getEntityBackgroundColor() - Getentitybackgroundcolor
// - getEntityTextColor() - Getentitytextcolor
// - getEntityBorderColor() - Getentitybordercolor
// - getEntityLabel() - Getentitylabel
// - getStatusColor() - Getstatuscolor
// - getStatusBackgroundColor() - Getstatusbackgroundcolor
// - getStatusTextColor() - Getstatustextcolor
// - getStatusBorderColor() - Getstatusbordercolor
// - getInvestmentTypeColor() - Getinvestmenttypecolor
// - getInvestmentTypeBackgroundColor() - Getinvestmenttypebackgroundcolor
// - getInvestmentTypeTextColor() - Getinvestmenttypetextcolor
// - getInvestmentTypeBorderColor() - Getinvestmenttypebordercolor
// - getNumericValueColor() - Getnumericvaluecolor
// - getNumericValueBackgroundColor() - Getnumericvaluebackgroundcolor
// - getNumericValueTextColor() - Getnumericvaluetextcolor
// - getNumericValueBorderColor() - Getnumericvaluebordercolor
// - getValueType() - Getvaluetype
// - getNumericValueCSSClass() - Getnumericvaluecssclass
// - getMainHeaderOpacityHex() - Getmainheaderopacityhex
// - getSubHeaderOpacityHex() - Getsubheaderopacityhex
// - loadColorScheme() - Loadcolorscheme
// - saveColorScheme() - Savecolorscheme
// - getCurrentColorScheme() - Getcurrentcolorscheme
// - getAvailableColorSchemes() - Getavailablecolorschemes
// - loadDynamicColors() - Loaddynamiccolors
// - getEntityColorFromPreferences() - Getentitycolorfrompreferences
// - getAllEntityColorVariantsFromPreferences() - Getallentitycolorvariantsfrompreferences
// - loadEntityColorsFromPreferences() - Loadentitycolorsfrompreferences
// - loadColorPreferences() - Loadcolorpreferences
// - getTableColors() - Gettablecolors
// - getTableColorsWithFallbacks() - Gettablecolorswithfallbacks
// - getEntityColorPref() - Getentitycolorpref

// === Other ===
// - hexToRgb() - Hextorgb
// - darkenColor() - Darkencolor
// - lightenColor() - Lightencolor
// - isValidEntityType() - Isvalidentitytype
// - isPositiveValue() - Ispositivevalue
// - isNegativeValue() - Isnegativevalue
// - isZeroValue() - Iszerovalue
// - generateEntityCSS() - Generateentitycss
// - applyEntityColorsToHeaders() - Applyentitycolorstoheaders
// - isWarningModal() - Iswarningmodal
// - generateStatusCSS() - Generatestatuscss
// - generateInvestmentTypeCSS() - Generateinvestmenttypecss
// - generateNumericValueCSS() - Generatenumericvaluecss
// - applyColorScheme() - Applycolorscheme
// - applyLightScheme() - Applylightscheme
// - applyDarkScheme() - Applydarkscheme
// - applyCustomScheme() - Applycustomscheme
// - toggleColorScheme() - Togglecolorscheme
// - setCurrentEntityColorFromPage() - Setcurrententitycolorfrompage
// - setCurrentEntityColorForEntity() - Setcurrententitycolorforentity
// - findPageClass() - Findpageclass
// - generateAndApplyEntityCSS() - Generateandapplyentitycss
// - setVar() - Setvar
// - computeVariant() - Computevariant
// - applyNumericPalette() - Applynumericpalette
// - applyThemeColor() - Applythemecolor

// ===== ENTITY TYPE DEFINITIONS =====
// עטיפת כל הקובץ בפונקציה כדי למנוע טעינה כפולה
// Color Scheme System - IIFE removed for bundle compatibility
(function() {
    // בדיקה שהקובץ לא נטען פעמיים
    if (window.VALID_ENTITY_TYPES) {
        console.warn('⚠️ color-scheme-system.js כבר נטען - מדלג על טעינה חוזרת');
        return;
    }

    const VALID_ENTITY_TYPES = [
  'trade', 'trade_plan', 'execution', 'account', 'trading_account', 'cash_flow',
  'ticker', 'alert', 'note', 'constraint', 'design', 'research', 'preference',
  'development', 'info', 'position'
];

// ===== COLOR DEFINITIONS =====
const BRAND_PRIMARY = '#26baac';
const BRAND_PRIMARY_TEXT = '#1a8f83';
const BRAND_PRIMARY_LIGHT = '#6ed8ca';
const BRAND_PRIMARY_BG = 'rgba(38, 186, 172, 0.1)';
const BRAND_PRIMARY_BORDER = 'rgba(38, 186, 172, 0.3)';
const BRAND_SECONDARY = '#fc5a06';
const BRAND_SECONDARY_TEXT = '#d24d05';
const BRAND_SECONDARY_LIGHT = '#ffb17a';
const BRAND_SECONDARY_BG = 'rgba(252, 90, 6, 0.12)';
const BRAND_SECONDARY_BORDER = 'rgba(252, 90, 6, 0.3)';

const ENTITY_COLORS = {
  trade: BRAND_PRIMARY,
  trade_plan: '#28a745',
  execution: '#17a2b8',
  account: '#6f42c1',
  trading_account: '#28a745', // חשבון מסחר - מותאם לפי entityTradingAccountColor
  cash_flow: '#fd7e14',
  ticker: '#20c997',
  alert: '#dc3545',
  note: '#6c757d',
  constraint: '#e83e8c',
  design: '#6f42c1',
  research: '#17a2b8',
  preference: '#adb5bd',
  development: BRAND_SECONDARY,
  position: '#0d6efd',
  import_session: '#fd7e14' // שימוש בצבע של cash_flow (תזרימי מזומן)
};

const ENTITY_BACKGROUND_COLORS = {
  trade: BRAND_PRIMARY_BG,
  trade_plan: 'rgba(40, 167, 69, 0.1)',
  execution: 'rgba(23, 162, 184, 0.1)',
  account: 'rgba(111, 66, 193, 0.1)',
  trading_account: 'rgba(40, 167, 69, 0.1)', // חשבון מסחר
  cash_flow: 'rgba(253, 126, 20, 0.1)',
  ticker: 'rgba(32, 201, 151, 0.1)',
  alert: 'rgba(220, 53, 69, 0.1)',
  note: 'rgba(108, 117, 125, 0.1)',
  constraint: 'rgba(232, 62, 140, 0.1)',
  design: 'rgba(111, 66, 193, 0.1)',
  research: 'rgba(23, 162, 184, 0.1)',
  preference: 'rgba(173, 181, 189, 0.1)',
  development: BRAND_SECONDARY_BG,
  position: 'rgba(13, 110, 253, 0.12)',
  import_session: 'rgba(253, 126, 20, 0.1)' // שימוש בצבע רקע של cash_flow (תזרימי מזומן)
};

const ENTITY_TEXT_COLORS = {
  trade: BRAND_PRIMARY_TEXT,
  trade_plan: '#1e7e34',
  execution: '#117a8b',
  account: '#59359a',
  trading_account: '#1e7e34', // חשבון מסחר
  cash_flow: '#e55100',
  ticker: '#1a9d7a',
  alert: '#c82333',
  note: '#495057',
  constraint: '#d91a72',
  design: '#59359a',
  research: '#117a8b',
  preference: '#6c757d',
  development: BRAND_SECONDARY_TEXT,
  position: '#0b5ed7'
};

const ENTITY_BORDER_COLORS = {
  trade: BRAND_PRIMARY_BORDER,
  trade_plan: 'rgba(40, 167, 69, 0.3)',
  execution: 'rgba(23, 162, 184, 0.3)',
  account: 'rgba(111, 66, 193, 0.3)',
  trading_account: 'rgba(40, 167, 69, 0.3)', // חשבון מסחר
  cash_flow: 'rgba(253, 126, 20, 0.3)',
  ticker: 'rgba(32, 201, 151, 0.3)',
  alert: 'rgba(220, 53, 69, 0.3)',
  note: 'rgba(108, 117, 125, 0.3)',
  constraint: 'rgba(232, 62, 140, 0.3)',
  design: 'rgba(111, 66, 193, 0.3)',
  research: 'rgba(23, 162, 184, 0.3)',
  preference: 'rgba(173, 181, 189, 0.3)',
  development: BRAND_SECONDARY_BORDER,
  position: 'rgba(13, 110, 253, 0.3)'
};

const ENTITY_LIGHT_COLORS = {
  trade: BRAND_PRIMARY_LIGHT,
  trade_plan: '#c3e6cb',
  execution: '#bee5eb',
  account: '#e2d9f3',
  trading_account: '#c3e6cb', // חשבון מסחר
  cash_flow: '#ffe5d3',
  ticker: '#c5f4ea',
  alert: '#f5c6cb',
  note: '#e2e3e5',
  constraint: '#f8d7da',
  design: '#e2d9f3',
  research: '#bee5eb',
  preference: 'rgba(173, 181, 189, 0.1)',
  development: BRAND_SECONDARY_LIGHT,
  position: '#d7e3ff'
};

const ENTITY_DARK_COLORS = {
  trade: BRAND_PRIMARY_TEXT,
  trade_plan: '#155724',
  execution: '#0c5460',
  account: '#383d41',
  trading_account: '#155724', // חשבון מסחר
  cash_flow: '#842029',
  ticker: '#1e7e34',
  alert: '#b02a37',
  note: '#383d41',
  constraint: '#b02a37',
  design: '#383d41',
  research: '#0c5460',
  preference: '#6c757d',
  development: BRAND_SECONDARY_TEXT,
  position: '#0a58ca'
};

const STATUS_COLORS = {
  active: '#28a745',
  inactive: '#6c757d',
  pending: '#ffc107',
  completed: '#17a2b8',
  cancelled: '#dc3545',
  error: '#dc3545',
  warning: '#ffc107',
  info: '#17a2b8',
  success: '#28a745'
};

const INVESTMENT_TYPE_COLORS = {
  swing: {
    medium: BRAND_PRIMARY,
    light: BRAND_PRIMARY_BG,
    border: BRAND_PRIMARY_BORDER
  },
  day: {
    medium: '#28a745',
    light: 'rgba(40, 167, 69, 0.1)',
    border: 'rgba(40, 167, 69, 0.3)'
  },
  scalping: {
    medium: '#dc3545',
    light: 'rgba(220, 53, 69, 0.1)',
    border: 'rgba(220, 53, 69, 0.3)'
  }
};

const NUMERIC_VALUE_COLORS = {
  positive: {
    medium: '#28a745',
    light: 'rgba(40, 167, 69, 0.1)',
    border: 'rgba(40, 167, 69, 0.3)'
  },
  negative: {
    medium: '#dc3545',
    light: 'rgba(220, 53, 69, 0.1)',
    border: 'rgba(220, 53, 69, 0.3)'
  },
  zero: {
    medium: '#6c757d',
    light: 'rgba(108, 117, 125, 0.1)',
    border: 'rgba(108, 117, 125, 0.3)'
  }
};

// ===== UTILITY FUNCTIONS =====
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  } : null;
}

function darkenColor(hex, percent) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const factor = (100 - percent) / 100;
  return `rgb(${Math.round(rgb.r * factor)}, ${Math.round(rgb.g * factor)}, ${Math.round(rgb.b * factor)})`;
}

function lightenColor(hex, percent) {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  
  const factor = (100 + percent) / 100;
  return `rgb(${Math.min(255, Math.round(rgb.r * factor))}, ${Math.min(255, Math.round(rgb.g * factor))}, ${Math.min(255, Math.round(rgb.b * factor))})`;
}

// ===== ENTITY COLOR FUNCTIONS =====
function getEntityColor(entityType) {
  // NO hardcoded fallback! Get from preferences or CSS variables only
  if (ENTITY_COLORS[entityType]) {
    return ENTITY_COLORS[entityType];
  }
  // Try CSS variable (should be set from preferences)
  const cssVar = getComputedStyle(document.documentElement).getPropertyValue(`--entity-${entityType.replace('_', '-')}-color`).trim();
  if (cssVar) {
    return cssVar;
  }
  // Last resort: empty string - force system to load from preferences
  if (window.Logger) { window.Logger.warn(`⚠️ No color found for entity ${entityType} - should load from preferences`, { page: "color-scheme" }); }
  return '';
}

function getEntityBackgroundColor(entityType) {
  // NO hardcoded fallback! Get from preferences or CSS variables only
  if (ENTITY_BACKGROUND_COLORS[entityType]) {
    return ENTITY_BACKGROUND_COLORS[entityType];
  }
  // Try CSS variable (should be set from preferences)
  const cssVar = getComputedStyle(document.documentElement).getPropertyValue(`--entity-${entityType.replace('_', '-')}-bg`).trim();
  if (cssVar) {
    return cssVar;
  }
  // Last resort: empty string - force system to load from preferences
  return '';
}

function getEntityTextColor(entityType) {
  // NO hardcoded fallback! Get from preferences or CSS variables only
  if (ENTITY_TEXT_COLORS[entityType]) {
    return ENTITY_TEXT_COLORS[entityType];
  }
  // Try CSS variable (should be set from preferences)
  const cssVar = getComputedStyle(document.documentElement).getPropertyValue(`--entity-${entityType.replace('_', '-')}-text`).trim();
  if (cssVar) {
    return cssVar;
  }
  // Last resort: empty string - force system to load from preferences
  return '';
}

function getEntityBorderColor(entityType) {
  return ENTITY_BORDER_COLORS[entityType] || ENTITY_BORDER_COLORS.trade;
}

function isValidEntityType(entityType) {
  return VALID_ENTITY_TYPES.includes(entityType);
}

function getEntityLabel(entityType) {
  const labels = {
    trade: 'טרייד',
    trade_plan: 'תכנית השקעה',
    execution: 'עסקה',
    account: 'חשבון',
    cash_flow: 'תזרים מזומנים',
    ticker: 'טיקר',
    alert: 'התראה',
    note: 'הערה',
    constraint: 'אילוץ',
    design: 'עיצוב',
    research: 'מחקר',
  preference: 'העדפה',
  position: 'פוזיציה'
  };
  return labels[entityType] || entityType;
}

// ===== STATUS COLOR FUNCTIONS =====
function getStatusColor(status, intensity = 'medium') {
  return STATUS_COLORS[status] || STATUS_COLORS.active;
}

function getStatusBackgroundColor(status) {
  const color = getStatusColor(status);
  return color.replace('rgb', 'rgba').replace(')', ', 0.1)');
}

function getStatusTextColor(status) {
  return getStatusColor(status);
}

function getStatusBorderColor(status) {
  const color = getStatusColor(status);
  return color.replace('rgb', 'rgba').replace(')', ', 0.3)');
}

// ===== INVESTMENT TYPE FUNCTIONS =====
function getInvestmentTypeColor(investmentType, intensity = 'medium') {
  const normalizedType = investmentType?.toLowerCase() || 'swing';
  return INVESTMENT_TYPE_COLORS[normalizedType]?.[intensity] || INVESTMENT_TYPE_COLORS.swing[intensity];
}

function getInvestmentTypeBackgroundColor(investmentType) {
  return getInvestmentTypeColor(investmentType, 'light');
}

function getInvestmentTypeTextColor(investmentType) {
  return getInvestmentTypeColor(investmentType, 'medium');
}

function getInvestmentTypeBorderColor(investmentType) {
  return getInvestmentTypeColor(investmentType, 'border');
}

// ===== NUMERIC VALUE FUNCTIONS =====
function getNumericValueColor(value, colorType = 'medium') {
  if (value > 0) {
    return NUMERIC_VALUE_COLORS.positive[colorType] || NUMERIC_VALUE_COLORS.positive.medium;
  } else if (value < 0) {
    return NUMERIC_VALUE_COLORS.negative[colorType] || NUMERIC_VALUE_COLORS.negative.medium;
  } else {
    return NUMERIC_VALUE_COLORS.zero[colorType] || NUMERIC_VALUE_COLORS.zero.medium;
  }
}

function getNumericValueBackgroundColor(value) {
  return getNumericValueColor(value, 'light');
}

function getNumericValueTextColor(value) {
  return getNumericValueColor(value, 'medium');
}

function getNumericValueBorderColor(value) {
  return getNumericValueColor(value, 'border');
}

function isPositiveValue(value) {
  return value > 0;
}

function isNegativeValue(value) {
  return value < 0;
}

function isZeroValue(value) {
  return value === 0;
}

function getValueType(value) {
  if (isPositiveValue(value)) return 'positive';
  if (isNegativeValue(value)) return 'negative';
  return 'zero';
}

function getNumericValueCSSClass(value) {
  return `numeric-${getValueType(value)}`;
}

// ===== CSS GENERATION FUNCTIONS =====
function generateEntityCSS() {
  let css = '';
  Object.keys(ENTITY_COLORS).forEach(entityType => {
    css += `
      .entity-${entityType} {
        color: ${getEntityTextColor(entityType)};
        background-color: ${getEntityBackgroundColor(entityType)};
        border-color: ${getEntityBorderColor(entityType)};
      }
    `;
  });
  return css;
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

function generateStatusCSS() {
  let css = '';
  Object.keys(STATUS_COLORS).forEach(status => {
    css += `
      .status-${status} {
        color: ${getStatusTextColor(status)};
        background-color: ${getStatusBackgroundColor(status)};
        border-color: ${getStatusBorderColor(status)};
      }
    `;
  });
  return css;
}

function generateInvestmentTypeCSS() {
  let css = '';
  Object.keys(INVESTMENT_TYPE_COLORS).forEach(type => {
    const colors = INVESTMENT_TYPE_COLORS[type];
    css += `
      .investment-${type} {
        color: ${colors.medium};
        background-color: ${colors.light};
        border-color: ${colors.border};
      }
    `;
  });
  return css;
}

function generateNumericValueCSS() {
  return `
    .numeric-positive {
      color: ${NUMERIC_VALUE_COLORS.positive.medium};
      background-color: ${NUMERIC_VALUE_COLORS.positive.light};
      border-color: ${NUMERIC_VALUE_COLORS.positive.border};
    }
    .numeric-negative {
      color: ${NUMERIC_VALUE_COLORS.negative.medium};
      background-color: ${NUMERIC_VALUE_COLORS.negative.light};
      border-color: ${NUMERIC_VALUE_COLORS.negative.border};
    }
    .numeric-zero {
      color: ${NUMERIC_VALUE_COLORS.zero.medium};
      background-color: ${NUMERIC_VALUE_COLORS.zero.light};
      border-color: ${NUMERIC_VALUE_COLORS.zero.border};
    }
  `;
}

// ===== COLOR SCHEME FUNCTIONS =====
function applyColorScheme(schemeName = 'light', customColors = null) {
  try {
    
    // Remove existing scheme classes
    document.body.classList.remove('light-scheme', 'dark-scheme', 'custom-scheme');
    
    // Apply new scheme
    document.body.classList.add(`${schemeName}-scheme`);
    
    // Store current scheme
    localStorage.setItem('colorScheme', schemeName);
    
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
        if (window.Logger) { window.Logger.warn(`⚠️ Unknown color scheme: ${schemeName}`, { page: "color-scheme" }); }
        applyLightScheme();
    }
    
    // Update CSS variables
    updateCSSVariablesFromPreferences(window.currentPreferences || {});
    
    // Dispatch event for other systems
    window.dispatchEvent(new CustomEvent('colorSchemeChanged', {
      detail: { scheme: schemeName, customColors }
    }));
    
  } catch (error) {
    if (window.Logger) { window.Logger.error('❌ Error applying color scheme:', error, { page: "color-scheme" }); }
  }
}

function applyLightScheme() {
  // Apply light theme colors
  document.documentElement.style.setProperty('--primary-color', BRAND_PRIMARY);
  document.documentElement.style.setProperty('--secondary-color', BRAND_SECONDARY);
  document.documentElement.style.setProperty('--success-color', '#28a745');
  document.documentElement.style.setProperty('--danger-color', '#dc3545');
  document.documentElement.style.setProperty('--warning-color', '#ffc107');
  document.documentElement.style.setProperty('--info-color', '#17a2b8');
}

function applyDarkScheme() {
  // Apply dark theme colors
  document.documentElement.style.setProperty('--primary-color', BRAND_PRIMARY_TEXT);
  document.documentElement.style.setProperty('--secondary-color', BRAND_SECONDARY_TEXT);
  document.documentElement.style.setProperty('--success-color', '#198754');
  document.documentElement.style.setProperty('--danger-color', '#dc3545');
  document.documentElement.style.setProperty('--warning-color', '#ffc107');
  document.documentElement.style.setProperty('--info-color', '#0dcaf0');
}

function applyCustomScheme(customColors) {
  try {
    // Apply custom colors to CSS variables
    Object.entries(customColors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--custom-${key}`, value);
    });
    
  } catch (error) {
    if (window.Logger) { window.Logger.error('❌ Error applying custom scheme:', error, { page: "color-scheme" }); }
  }
}

function toggleColorScheme() {
  const currentScheme = getCurrentColorScheme();
  const newScheme = currentScheme === 'light' ? 'dark' : 'light';
  applyColorScheme(newScheme);
}

function loadColorScheme() {
  const savedScheme = localStorage.getItem('colorScheme') || 'light';
  applyColorScheme(savedScheme);
}

function saveColorScheme(schemeName, customColors = null) {
  localStorage.setItem('colorScheme', schemeName);
  if (customColors) {
    localStorage.setItem('customColors', JSON.stringify(customColors));
  }
}

function getCurrentColorScheme() {
  return localStorage.getItem('colorScheme') || 'light';
}

function getAvailableColorSchemes() {
  return [
    { name: 'light', label: 'בהיר', description: 'סכמת צבעים בהירה' },
    { name: 'dark', label: 'כהה', description: 'סכמת צבעים כהה' },
    { name: 'custom', label: 'מותאם אישית', description: 'סכמת צבעים מותאמת אישית' }
  ];
}

// ===== DYNAMIC COLORS LOADER =====
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
    if (window.Logger) { window.Logger.error('❌ Error loading dynamic colors:', error, { page: "color-scheme" }); }
    return false;
  }
}

// ===== PAGE ENTITY COLOR FUNCTIONS =====
async function setCurrentEntityColorFromPage() {
  try {
    const body = document.body;
    if (!body) return;
    
    const pageClass = findPageClass(body);
    if (pageClass) {
      // Use mapping to get correct entity type
      const entityType = PAGE_TO_ENTITY_MAPPING[pageClass];
      if (entityType && isValidEntityType(entityType)) {
        // Load preferences first - ALL colors must come from preferences
        await getEntityColorFromPreferences(entityType);
        
        // Get colors from preferences - use CSS variables as fallback only
        const getEntityColorPref = (entity, variant) => {
          // Try preferences first
          const prefKey = `entity${entity.charAt(0).toUpperCase() + entity.slice(1).replace('_', '')}Color${variant === 'light' ? 'Light' : variant === 'dark' ? 'Dark' : ''}`;
          if (window.currentPreferences && window.currentPreferences[prefKey]) {
            return window.currentPreferences[prefKey];
          }
          // Fallback to CSS variable (which should already be set from preferences)
          const cssVar = variant === 'light' ? '--entity-' + entity.replace('_', '-') + '-bg' :
                        variant === 'dark' ? '--entity-' + entity.replace('_', '-') + '-text' :
                        '--entity-' + entity.replace('_', '-') + '-color';
          return getComputedStyle(document.documentElement).getPropertyValue(cssVar).trim();
        };
        
        const entityColor = getEntityColorPref(entityType, 'primary') || 
                           getComputedStyle(document.documentElement).getPropertyValue(`--entity-${entityType.replace('_', '-')}-color`).trim();
        const lightColor = getEntityColorPref(entityType, 'light') || 
                          getComputedStyle(document.documentElement).getPropertyValue(`--entity-${entityType.replace('_', '-')}-bg`).trim() ||
                          (entityColor ? lightenColor(entityColor, 10) : 'rgba(173, 181, 189, 0.1)');
        const darkColor = getEntityColorPref(entityType, 'dark') || 
                         getComputedStyle(document.documentElement).getPropertyValue(`--entity-${entityType.replace('_', '-')}-text`).trim() ||
                         (entityColor ? darkenColor(entityColor, 20) : '#6c757d');
        
        if (entityColor) {
          document.documentElement.style.setProperty('--current-entity-color', entityColor);
          document.documentElement.style.setProperty('--current-entity-color', entityColor);
          document.documentElement.style.setProperty('--current-entity-color-light', lightColor);
          document.documentElement.style.setProperty('--current-entity-color-dark', darkColor);
          
          // Apply colors to headers after setting CSS variables
          if (typeof window.applyEntityColorsToHeaders === 'function') {
            window.applyEntityColorsToHeaders(entityType);
          }
        }
      } else {
        // Don't warn for test pages or auth pages - they don't need color scheme mapping
        if (!pageClass.includes('test') && !pageClass.includes('Test') &&
            !pageClass.includes('login') && !pageClass.includes('register') &&
            !pageClass.includes('forgot') && !pageClass.includes('reset') && window.Logger) {
          window.Logger.warn(`⚠️ No mapping found for page class: ${pageClass}`, { page: "color-scheme" });
        }
      }
    }
  } catch (error) {
    if (window.Logger) { window.Logger.error('❌ Error setting current entity color:', error, { page: "color-scheme" }); }
  }
}

async function setCurrentEntityColorForEntity(entityType, options = {}) {
  try {
    if (!entityType || !isValidEntityType(entityType)) {
      window.Logger?.warn('⚠️ setCurrentEntityColorForEntity: invalid entity type', {
        entityType,
        page: 'color-scheme'
      });
      return;
    }

    await getEntityColorFromPreferences(entityType);

    const primary = getEntityColor(entityType);
    const light =
      ENTITY_LIGHT_COLORS[entityType] ||
      (primary ? lightenColor(primary, 10) : '');
    const dark =
      ENTITY_DARK_COLORS[entityType] ||
      (primary ? darkenColor(primary, 20) : '');

    if (primary) {
      document.documentElement.style.setProperty('--current-entity-color', primary);
    }
    if (light) {
      document.documentElement.style.setProperty('--current-entity-color-light', light);
    }
    if (dark) {
      document.documentElement.style.setProperty('--current-entity-color-dark', dark);
    }

    if (options.updateHeaders !== false && typeof window.applyEntityColorsToHeaders === 'function') {
      window.applyEntityColorsToHeaders(entityType, options.excludeWarningModals !== false);
    }
  } catch (error) {
    window.Logger?.error('❌ setCurrentEntityColorForEntity failed', {
      error,
      entityType,
      page: 'color-scheme'
    });
  }
}

function findPageClass(body) {
  const classList = Array.from(body.classList);
  return classList.find(cls => cls.endsWith('-page'));
}

// Page class to entity type mapping
const PAGE_TO_ENTITY_MAPPING = {
  // עמודי משתמש
  'index-page': 'trade', // Dashboard shows trades overview
  'tickers-page': 'ticker',
  'ticker-dashboard-page': 'ticker', // Extended ticker dashboard page
  'trading-accounts-page': 'trading_account', // Trading accounts page - חשבונות מסחר
  'accounts-page': 'trading_account', // Alias - חשבונות מסחר
  'trades-page': 'trade',
  'tracking-page': 'trade', // Alias
  'alerts-page': 'alert',
  'cash-flows-page': 'cash_flow',
  'notes-page': 'note',
  'executions-page': 'execution',
  'trade-plans-page': 'trade_plan',
  'planning-page': 'trade_plan', // Alias
  'trading-journal-page': 'note', // Trading journal page - יומן מסחר
  'preferences-page': 'preference',
  'research-page': 'research',
  'designs-page': 'design',
  'constraints-page': 'constraint',
  'tag-management-page': 'preference', // Tag management page - uses preference colors
  'ai-analysis-page': 'trade_plan', // AI Analysis page - uses trade plan colors
  'watch-list-page': 'ticker', // Watch List page - uses ticker colors (similar entity type)
  'watch-lists-page': 'ticker', // Watch Lists page - uses ticker colors (alias for consistency)
  'trade-history-page': 'trade', // Trade History page - uses trade colors
  'db-display-page': null, // Uses fixed gray color
  'db-extradata-page': null, // Uses fixed gray color
  'extra-data-page': null, // Alias
  'data-import-page': 'cash_flow',
  
  // עמודי כלי פיתוח - כולם מקבלים צבע development
  'development-page': 'development',
  'lint-monitor-page': 'development',
  'init-system-page': 'development',
  'system-management-page': 'development',
  'server-monitor-page': 'development',
  'notifications-center-page': 'development',
  'external-data-dashboard-page': 'development',
  'crud-testing-dashboard-page': 'development',
  'code-quality-dashboard-page': 'development',
  'css-management-page': 'development',
  'chart-management-page': 'development',
  'cache-management-page': 'development',
  'background-tasks-page': 'development'
};

async function getEntityColorFromPreferences(entityType, variant = 'primary') {
  try {
    if (!isValidEntityType(entityType)) {
      if (window.Logger) { window.Logger.warn(`⚠️ Invalid entity type: ${entityType}`, { page: "color-scheme" }); }
      return;
    }
    
    // Load preferences and apply colors
    const preferences = await loadColorPreferences();
    if (preferences && preferences.colorScheme) {
      updateEntityColors(preferences);
    }
  } catch (error) {
    if (window.Logger) { window.Logger.error('❌ Error getting entity color from preferences:', error, { page: "color-scheme" }); }
  }
}

async function getAllEntityColorVariantsFromPreferences(entityType) {
  try {
    const preferences = await loadColorPreferences();
    if (preferences && preferences.colorScheme && preferences.colorScheme.entities) {
      return preferences.colorScheme.entities[entityType] || {};
    }
    return {};
  } catch (error) {
    if (window.Logger) { window.Logger.error('❌ Error getting all entity color variants:', error, { page: "color-scheme" }); }
    return {};
  }
}

// ===== PREFERENCES FUNCTIONS =====
/**
 * טעינת צבעי ישויות מהעדפות
 * Load entity colors from preferences
 * @param {Object} preferences - העדפות המשתמש
 */
function loadEntityColorsFromPreferences(preferences) {
  // עדכון צבעי ישויות מההעדפות
  if (preferences) {
    // Set global preferences for easy access
    window.currentPreferences = preferences;
    
    // עדכון צבעי executions - רק מהעדפות!
    if (preferences.entityExecutionColor) {
      ENTITY_COLORS.execution = preferences.entityExecutionColor;
      const execRgb = hexToRgb(preferences.entityExecutionColor);
      ENTITY_BACKGROUND_COLORS.execution = preferences.entityExecutionColorLight || (execRgb ? `rgba(${execRgb.r}, ${execRgb.g}, ${execRgb.b}, 0.1)` : '');
      ENTITY_TEXT_COLORS.execution = preferences.entityExecutionColorDark || (execRgb ? darkenColor(preferences.entityExecutionColor, 20) : '');
      ENTITY_BORDER_COLORS.execution = execRgb ? `rgba(${execRgb.r}, ${execRgb.g}, ${execRgb.b}, 0.3)` : '';
      ENTITY_LIGHT_COLORS.execution = preferences.entityExecutionColorLight || (execRgb ? lightenColor(preferences.entityExecutionColor, 10) : '');
      ENTITY_DARK_COLORS.execution = preferences.entityExecutionColorDark || (execRgb ? darkenColor(preferences.entityExecutionColor, 20) : '');
    }
    
    // עדכון צבעי trades - רק מהעדפות!
    if (preferences.entityTradeColor) {
      ENTITY_COLORS.trade = preferences.entityTradeColor;
      const tradeRgb = hexToRgb(preferences.entityTradeColor);
      ENTITY_BACKGROUND_COLORS.trade = preferences.entityTradeColorLight || (tradeRgb ? `rgba(${tradeRgb.r}, ${tradeRgb.g}, ${tradeRgb.b}, 0.1)` : '');
      ENTITY_TEXT_COLORS.trade = preferences.entityTradeColorDark || (tradeRgb ? darkenColor(preferences.entityTradeColor, 20) : '');
      ENTITY_BORDER_COLORS.trade = tradeRgb ? `rgba(${tradeRgb.r}, ${tradeRgb.g}, ${tradeRgb.b}, 0.3)` : '';
      ENTITY_LIGHT_COLORS.trade = preferences.entityTradeColorLight || (tradeRgb ? lightenColor(preferences.entityTradeColor, 10) : '');
      ENTITY_DARK_COLORS.trade = preferences.entityTradeColorDark || (tradeRgb ? darkenColor(preferences.entityTradeColor, 20) : '');
    }
    
    // עדכון צבעי trading accounts - רק מהעדפות!
    if (preferences.entityTradingAccountColor) {
      ENTITY_COLORS.trading_account = preferences.entityTradingAccountColor;
      const accountRgb = hexToRgb(preferences.entityTradingAccountColor);
      ENTITY_BACKGROUND_COLORS.trading_account = preferences.entityTradingAccountColorLight || (accountRgb ? `rgba(${accountRgb.r}, ${accountRgb.g}, ${accountRgb.b}, 0.1)` : '');
      ENTITY_TEXT_COLORS.trading_account = preferences.entityTradingAccountColorDark || (accountRgb ? darkenColor(preferences.entityTradingAccountColor, 20) : '');
      ENTITY_BORDER_COLORS.trading_account = accountRgb ? `rgba(${accountRgb.r}, ${accountRgb.g}, ${accountRgb.b}, 0.3)` : '';
      ENTITY_LIGHT_COLORS.trading_account = preferences.entityTradingAccountColorLight || (accountRgb ? lightenColor(preferences.entityTradingAccountColor, 10) : '');
      ENTITY_DARK_COLORS.trading_account = preferences.entityTradingAccountColorDark || (accountRgb ? darkenColor(preferences.entityTradingAccountColor, 20) : '');
    }
    
    // עדכון צבעי alerts - רק מהעדפות!
    if (preferences.entityAlertColor) {
      ENTITY_COLORS.alert = preferences.entityAlertColor;
      const alertRgb = hexToRgb(preferences.entityAlertColor);
      ENTITY_BACKGROUND_COLORS.alert = preferences.entityAlertColorLight || (alertRgb ? `rgba(${alertRgb.r}, ${alertRgb.g}, ${alertRgb.b}, 0.1)` : '');
      ENTITY_TEXT_COLORS.alert = preferences.entityAlertColorDark || (alertRgb ? darkenColor(preferences.entityAlertColor, 20) : '');
      ENTITY_BORDER_COLORS.alert = alertRgb ? `rgba(${alertRgb.r}, ${alertRgb.g}, ${alertRgb.b}, 0.3)` : '';
      ENTITY_LIGHT_COLORS.alert = preferences.entityAlertColorLight || (alertRgb ? lightenColor(preferences.entityAlertColor, 10) : '');
      ENTITY_DARK_COLORS.alert = preferences.entityAlertColorDark || (alertRgb ? darkenColor(preferences.entityAlertColor, 20) : '');
    }
    
    // עדכון צבעי tickers - רק מהעדפות!
    if (preferences.entityTickerColor) {
      ENTITY_COLORS.ticker = preferences.entityTickerColor;
      const tickerRgb = hexToRgb(preferences.entityTickerColor);
      ENTITY_BACKGROUND_COLORS.ticker = preferences.entityTickerColorLight || (tickerRgb ? `rgba(${tickerRgb.r}, ${tickerRgb.g}, ${tickerRgb.b}, 0.1)` : '');
      ENTITY_TEXT_COLORS.ticker = preferences.entityTickerColorDark || (tickerRgb ? darkenColor(preferences.entityTickerColor, 20) : '');
      ENTITY_BORDER_COLORS.ticker = tickerRgb ? `rgba(${tickerRgb.r}, ${tickerRgb.g}, ${tickerRgb.b}, 0.3)` : '';
      ENTITY_LIGHT_COLORS.ticker = preferences.entityTickerColorLight || (tickerRgb ? lightenColor(preferences.entityTickerColor, 10) : '');
      ENTITY_DARK_COLORS.ticker = preferences.entityTickerColorDark || (tickerRgb ? darkenColor(preferences.entityTickerColor, 20) : '');
    }
    
    // עדכון צבעי cash flows - רק מהעדפות!
    if (preferences.entityCashFlowColor) {
      ENTITY_COLORS['cash_flow'] = preferences.entityCashFlowColor;
      const cashFlowRgb = hexToRgb(preferences.entityCashFlowColor);
      ENTITY_BACKGROUND_COLORS['cash_flow'] = preferences.entityCashFlowColorLight || (cashFlowRgb ? `rgba(${cashFlowRgb.r}, ${cashFlowRgb.g}, ${cashFlowRgb.b}, 0.1)` : '');
      ENTITY_TEXT_COLORS['cash_flow'] = preferences.entityCashFlowColorDark || (cashFlowRgb ? darkenColor(preferences.entityCashFlowColor, 20) : '');
      ENTITY_BORDER_COLORS['cash_flow'] = cashFlowRgb ? `rgba(${cashFlowRgb.r}, ${cashFlowRgb.g}, ${cashFlowRgb.b}, 0.3)` : '';
      ENTITY_LIGHT_COLORS['cash_flow'] = preferences.entityCashFlowColorLight || (cashFlowRgb ? lightenColor(preferences.entityCashFlowColor, 10) : '');
      ENTITY_DARK_COLORS['cash_flow'] = preferences.entityCashFlowColorDark || (cashFlowRgb ? darkenColor(preferences.entityCashFlowColor, 20) : '');
    }
    
    // עדכון צבעי notes - רק מהעדפות!
    if (preferences.entityNoteColor) {
      ENTITY_COLORS.note = preferences.entityNoteColor;
      const noteRgb = hexToRgb(preferences.entityNoteColor);
      ENTITY_BACKGROUND_COLORS.note = preferences.entityNoteColorLight || (noteRgb ? `rgba(${noteRgb.r}, ${noteRgb.g}, ${noteRgb.b}, 0.1)` : '');
      ENTITY_TEXT_COLORS.note = preferences.entityNoteColorDark || (noteRgb ? darkenColor(preferences.entityNoteColor, 20) : '');
      ENTITY_BORDER_COLORS.note = noteRgb ? `rgba(${noteRgb.r}, ${noteRgb.g}, ${noteRgb.b}, 0.3)` : '';
      ENTITY_LIGHT_COLORS.note = preferences.entityNoteColorLight || (noteRgb ? lightenColor(preferences.entityNoteColor, 10) : '');
      ENTITY_DARK_COLORS.note = preferences.entityNoteColorDark || (noteRgb ? darkenColor(preferences.entityNoteColor, 20) : '');
    }
    
    // עדכון צבעי trade plans - רק מהעדפות!
    if (preferences.entityTradePlanColor) {
      ENTITY_COLORS['trade_plan'] = preferences.entityTradePlanColor;
      const tradePlanRgb = hexToRgb(preferences.entityTradePlanColor);
      ENTITY_BACKGROUND_COLORS['trade_plan'] = preferences.entityTradePlanColorLight || (tradePlanRgb ? `rgba(${tradePlanRgb.r}, ${tradePlanRgb.g}, ${tradePlanRgb.b}, 0.1)` : '');
      ENTITY_TEXT_COLORS['trade_plan'] = preferences.entityTradePlanColorDark || (tradePlanRgb ? darkenColor(preferences.entityTradePlanColor, 20) : '');
      ENTITY_BORDER_COLORS['trade_plan'] = tradePlanRgb ? `rgba(${tradePlanRgb.r}, ${tradePlanRgb.g}, ${tradePlanRgb.b}, 0.3)` : '';
      ENTITY_LIGHT_COLORS['trade_plan'] = preferences.entityTradePlanColorLight || (tradePlanRgb ? lightenColor(preferences.entityTradePlanColor, 10) : '');
      ENTITY_DARK_COLORS['trade_plan'] = preferences.entityTradePlanColorDark || (tradePlanRgb ? darkenColor(preferences.entityTradePlanColor, 20) : '');
    }
    
    // עדכון צבעי preferences - רק מהעדפות!
    if (preferences.entityPreferencesColor) {
      ENTITY_COLORS.preference = preferences.entityPreferencesColor;
      const prefRgb = hexToRgb(preferences.entityPreferencesColor);
      ENTITY_BACKGROUND_COLORS.preference = preferences.entityPreferencesColorLight || (prefRgb ? `rgba(${prefRgb.r}, ${prefRgb.g}, ${prefRgb.b}, 0.1)` : '');
      ENTITY_TEXT_COLORS.preference = preferences.entityPreferencesColorDark || (prefRgb ? darkenColor(preferences.entityPreferencesColor, 20) : '');
      ENTITY_BORDER_COLORS.preference = prefRgb ? `rgba(${prefRgb.r}, ${prefRgb.g}, ${prefRgb.b}, 0.3)` : '';
      ENTITY_LIGHT_COLORS.preference = preferences.entityPreferencesColorLight || (prefRgb ? lightenColor(preferences.entityPreferencesColor, 10) : '');
      ENTITY_DARK_COLORS.preference = preferences.entityPreferencesColorDark || (prefRgb ? darkenColor(preferences.entityPreferencesColor, 20) : '');
    }
    
    // עדכון צבעי research - רק מהעדפות!
    if (preferences.entityResearchColor) {
      ENTITY_COLORS.research = preferences.entityResearchColor;
      const rgb = hexToRgb(preferences.entityResearchColor);
      ENTITY_BACKGROUND_COLORS.research = preferences.entityResearchColorLight || (rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` : '');
      ENTITY_TEXT_COLORS.research = preferences.entityResearchColorDark || (rgb ? darkenColor(preferences.entityResearchColor, 20) : '');
      ENTITY_BORDER_COLORS.research = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` : '';
      ENTITY_LIGHT_COLORS.research = preferences.entityResearchColorLight || (rgb ? lightenColor(preferences.entityResearchColor, 10) : '');
      ENTITY_DARK_COLORS.research = preferences.entityResearchColorDark || (rgb ? darkenColor(preferences.entityResearchColor, 20) : '');
    }
    
    // עדכון צבעי design - רק מהעדפות!
    if (preferences.entityDesignColor) {
      ENTITY_COLORS.design = preferences.entityDesignColor;
      const rgb = hexToRgb(preferences.entityDesignColor);
      ENTITY_BACKGROUND_COLORS.design = preferences.entityDesignColorLight || (rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` : '');
      ENTITY_TEXT_COLORS.design = preferences.entityDesignColorDark || (rgb ? darkenColor(preferences.entityDesignColor, 20) : '');
      ENTITY_BORDER_COLORS.design = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` : '';
      ENTITY_LIGHT_COLORS.design = preferences.entityDesignColorLight || (rgb ? lightenColor(preferences.entityDesignColor, 10) : '');
      ENTITY_DARK_COLORS.design = preferences.entityDesignColorDark || (rgb ? darkenColor(preferences.entityDesignColor, 20) : '');
    }
    
    // עדכון צבעי constraint - רק מהעדפות!
    if (preferences.entityConstraintColor) {
      ENTITY_COLORS.constraint = preferences.entityConstraintColor;
      const rgb = hexToRgb(preferences.entityConstraintColor);
      ENTITY_BACKGROUND_COLORS.constraint = preferences.entityConstraintColorLight || (rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` : '');
      ENTITY_TEXT_COLORS.constraint = preferences.entityConstraintColorDark || (rgb ? darkenColor(preferences.entityConstraintColor, 20) : '');
      ENTITY_BORDER_COLORS.constraint = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` : '';
      ENTITY_LIGHT_COLORS.constraint = preferences.entityConstraintColorLight || (rgb ? lightenColor(preferences.entityConstraintColor, 10) : '');
      ENTITY_DARK_COLORS.constraint = preferences.entityConstraintColorDark || (rgb ? darkenColor(preferences.entityConstraintColor, 20) : '');
    }
    
    // עדכון צבעי development - רק מהעדפות!
    if (preferences.entityDevelopmentColor) {
      ENTITY_COLORS.development = preferences.entityDevelopmentColor;
      const rgb = hexToRgb(preferences.entityDevelopmentColor);
      ENTITY_BACKGROUND_COLORS.development = preferences.entityDevelopmentColorLight || (rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` : '');
      ENTITY_TEXT_COLORS.development = preferences.entityDevelopmentColorDark || (rgb ? darkenColor(preferences.entityDevelopmentColor, 20) : '');
      ENTITY_BORDER_COLORS.development = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` : '';
      ENTITY_LIGHT_COLORS.development = preferences.entityDevelopmentColorLight || (rgb ? lightenColor(preferences.entityDevelopmentColor, 10) : '');
      ENTITY_DARK_COLORS.development = preferences.entityDevelopmentColorDark || (rgb ? darkenColor(preferences.entityDevelopmentColor, 20) : '');
    }
    
    // עדכון צבעי info - רק מהעדפות!
    if (preferences.entityInfoColor) {
      ENTITY_COLORS.info = preferences.entityInfoColor;
      const rgb = hexToRgb(preferences.entityInfoColor);
      ENTITY_BACKGROUND_COLORS.info = preferences.entityInfoColorLight || (rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` : '');
      ENTITY_TEXT_COLORS.info = preferences.entityInfoColorDark || (rgb ? darkenColor(preferences.entityInfoColor, 20) : '');
      ENTITY_BORDER_COLORS.info = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` : '';
      ENTITY_LIGHT_COLORS.info = preferences.entityInfoColorLight || (rgb ? lightenColor(preferences.entityInfoColor, 10) : '');
      ENTITY_DARK_COLORS.info = preferences.entityInfoColorDark || (rgb ? darkenColor(preferences.entityInfoColor, 20) : '');
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
    
    // חיפוש או יצירת אלמנט style
    let styleElement = document.getElementById('dynamic-entity-colors');
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = 'dynamic-entity-colors';
      document.head.appendChild(styleElement);
    }
    
    // עדכון התוכן
    styleElement.textContent = newCSS;
  } catch (error) {
    console.error('❌ שגיאה ביצירת CSS דינמי:', error);
  }
}

async function loadColorPreferences() {
  try {
    // Wait for critical preferences to be loaded before using them
    const environment = window.API_ENV || 'development';
    const timeoutMs = environment === 'production' ? 5000 : 3000;
    const waitStartTime = performance.now();
    
    // Wait for preferences:critical-loaded event with timeout fallback
    await new Promise((resolve) => {
      // Check if preferences are already loaded (check both currentPreferences and global flag)
      if (window.currentPreferences && Object.keys(window.currentPreferences).length > 0) {
        const waitTime = performance.now() - waitStartTime;
        if (window.Logger) {
          window.Logger.debug('✅ Preferences already available for color scheme', {
            page: 'color-scheme',
            waitTime: `${waitTime.toFixed(2)}ms`,
          });
        }
        resolve();
        return;
      }
      
      // Check if event already fired (race condition fix)
      if (window.__preferencesCriticalLoaded) {
        const waitTime = performance.now() - waitStartTime;
        if (window.Logger) {
          window.Logger.debug('✅ Preferences already loaded (flag check) for color scheme', {
            page: 'color-scheme',
            waitTime: `${waitTime.toFixed(2)}ms`,
          });
        }
        resolve();
        return;
      }
      
      // Wait for preferences:critical-loaded event
      const eventHandler = () => {
        const waitTime = performance.now() - waitStartTime;
        if (window.Logger) {
          window.Logger.debug('✅ Preferences loaded via event for color scheme', {
            page: 'color-scheme',
            waitTime: `${waitTime.toFixed(2)}ms`,
          });
        }
        resolve();
      };
      
      window.addEventListener('preferences:critical-loaded', eventHandler, { once: true });
      
      // Fallback timeout - continue even if event doesn't fire (backward compatibility)
      setTimeout(() => {
        window.removeEventListener('preferences:critical-loaded', eventHandler);
        const waitTime = performance.now() - waitStartTime;
        // Check flag one more time before timeout
        if (window.__preferencesCriticalLoaded) {
          if (window.Logger) {
            window.Logger.debug('✅ Preferences loaded during timeout check for color scheme', {
              page: 'color-scheme',
              waitTime: `${waitTime.toFixed(2)}ms`,
            });
          }
        } else {
          if (window.Logger) {
            // Preferences event timeout is expected in some cases - use debug instead of warn
            if (window.Logger?.debug) {
              window.Logger.debug('Preferences event timeout for color scheme - continuing without waiting', {
                page: 'color-scheme',
                timeout: `${timeoutMs}ms`,
                waitTime: `${waitTime.toFixed(2)}ms`,
              });
            }
          }
        }
        resolve();
      }, timeoutMs);
    });
    
    // Load preferences from server - NO hardcoded colors!
    // Use the global preferences loading system
    if (window.loadUserPreferences && typeof window.loadUserPreferences === 'function') {
      const loaded = await window.loadUserPreferences({ force: false });
      if (loaded && window.currentPreferences) {
        return window.currentPreferences;
      }
    }
    
    // Centralized path: use PreferencesData to avoid duplicate/raw fetches
    if (window.PreferencesData && typeof window.PreferencesData.loadAllPreferencesRaw === 'function') {
      try {
        const { preferences } = await window.PreferencesData.loadAllPreferencesRaw({ force: false });
        if (preferences && typeof preferences === 'object') {
          window.currentPreferences = preferences;
          return preferences;
        }
      } catch (svcError) {
        if (window.Logger) { window.Logger.warn('⚠️ Could not load preferences via PreferencesData', { page: "color-scheme" }); }
      }
    }
    
    // Last resort: return empty object - NO hardcoded colors!
    // No preferences loaded is expected in some cases - use debug instead of warn
    if (window.Logger?.debug) {
      window.Logger.debug('No preferences loaded - colors will use CSS fallbacks only', { page: "color-scheme" });
    }
    return {};
  } catch (error) {
    if (window.Logger) { window.Logger.error('❌ Error loading color preferences:', error, { page: "color-scheme" }); }
    return {};
  }
}

function updateEntityColors(preferences) {
  try {
    // Clear existing colors first - ALL colors must come from preferences
    if (preferences) {
      // Update from colorScheme.entities if exists (new format)
      if (preferences.colorScheme && preferences.colorScheme.entities) {
        Object.assign(ENTITY_COLORS, preferences.colorScheme.entities);
      }
      
      // Update from individual entity color preferences (preference format)
      if (preferences.entityTradeColor) ENTITY_COLORS.trade = preferences.entityTradeColor;
      if (preferences.entityTradingAccountColor) ENTITY_COLORS.account = preferences.entityTradingAccountColor;
      if (preferences.entityTickerColor) ENTITY_COLORS.ticker = preferences.entityTickerColor;
      if (preferences.entityAlertColor) ENTITY_COLORS.alert = preferences.entityAlertColor;
      if (preferences.entityNoteColor) ENTITY_COLORS.note = preferences.entityNoteColor;
      if (preferences.entityExecutionColor) ENTITY_COLORS.execution = preferences.entityExecutionColor;
      if (preferences.entityCashFlowColor) ENTITY_COLORS.cash_flow = preferences.entityCashFlowColor;
      if (preferences.entityTradePlanColor) ENTITY_COLORS.trade_plan = preferences.entityTradePlanColor;
      if (preferences.entityPreferencesColor) ENTITY_COLORS.preference = preferences.entityPreferencesColor;
      if (preferences.entityResearchColor) ENTITY_COLORS.research = preferences.entityResearchColor;
      if (preferences.entityDesignColor) ENTITY_COLORS.design = preferences.entityDesignColor;
      if (preferences.entityConstraintColor) ENTITY_COLORS.constraint = preferences.entityConstraintColor;
      if (preferences.entityDevelopmentColor) ENTITY_COLORS.development = preferences.entityDevelopmentColor;
      if (preferences.entityInfoColor) ENTITY_COLORS.info = preferences.entityInfoColor;
      
      // Update background colors
      if (preferences.entityTradeColorLight) ENTITY_BACKGROUND_COLORS.trade = preferences.entityTradeColorLight;
      if (preferences.entityTradingAccountColorLight) ENTITY_BACKGROUND_COLORS.account = preferences.entityTradingAccountColorLight;
      if (preferences.entityTickerColorLight) ENTITY_BACKGROUND_COLORS.ticker = preferences.entityTickerColorLight;
      if (preferences.entityAlertColorLight) ENTITY_BACKGROUND_COLORS.alert = preferences.entityAlertColorLight;
      if (preferences.entityNoteColorLight) ENTITY_BACKGROUND_COLORS.note = preferences.entityNoteColorLight;
      if (preferences.entityExecutionColorLight) ENTITY_BACKGROUND_COLORS.execution = preferences.entityExecutionColorLight;
      if (preferences.entityCashFlowColorLight) ENTITY_BACKGROUND_COLORS.cash_flow = preferences.entityCashFlowColorLight;
      if (preferences.entityTradePlanColorLight) ENTITY_BACKGROUND_COLORS.trade_plan = preferences.entityTradePlanColorLight;
      if (preferences.entityPreferencesColorLight) ENTITY_BACKGROUND_COLORS.preference = preferences.entityPreferencesColorLight;
      if (preferences.entityResearchColorLight) ENTITY_BACKGROUND_COLORS.research = preferences.entityResearchColorLight;
      if (preferences.entityDesignColorLight) ENTITY_BACKGROUND_COLORS.design = preferences.entityDesignColorLight;
      if (preferences.entityConstraintColorLight) ENTITY_BACKGROUND_COLORS.constraint = preferences.entityConstraintColorLight;
      if (preferences.entityDevelopmentColorLight) ENTITY_BACKGROUND_COLORS.development = preferences.entityDevelopmentColorLight;
      if (preferences.entityInfoColorLight) ENTITY_BACKGROUND_COLORS.info = preferences.entityInfoColorLight;
      
      // Update text colors
      if (preferences.entityTradeColorDark) ENTITY_TEXT_COLORS.trade = preferences.entityTradeColorDark;
      if (preferences.entityTradingAccountColorDark) ENTITY_TEXT_COLORS.account = preferences.entityTradingAccountColorDark;
      if (preferences.entityTickerColorDark) ENTITY_TEXT_COLORS.ticker = preferences.entityTickerColorDark;
      if (preferences.entityAlertColorDark) ENTITY_TEXT_COLORS.alert = preferences.entityAlertColorDark;
      if (preferences.entityNoteColorDark) ENTITY_TEXT_COLORS.note = preferences.entityNoteColorDark;
      if (preferences.entityExecutionColorDark) ENTITY_TEXT_COLORS.execution = preferences.entityExecutionColorDark;
      if (preferences.entityCashFlowColorDark) ENTITY_TEXT_COLORS.cash_flow = preferences.entityCashFlowColorDark;
      if (preferences.entityTradePlanColorDark) ENTITY_TEXT_COLORS.trade_plan = preferences.entityTradePlanColorDark;
      if (preferences.entityPreferencesColorDark) ENTITY_TEXT_COLORS.preference = preferences.entityPreferencesColorDark;
      if (preferences.entityResearchColorDark) ENTITY_TEXT_COLORS.research = preferences.entityResearchColorDark;
      if (preferences.entityDesignColorDark) ENTITY_TEXT_COLORS.design = preferences.entityDesignColorDark;
      if (preferences.entityConstraintColorDark) ENTITY_TEXT_COLORS.constraint = preferences.entityConstraintColorDark;
      if (preferences.entityDevelopmentColorDark) ENTITY_TEXT_COLORS.development = preferences.entityDevelopmentColorDark;
      if (preferences.entityInfoColorDark) ENTITY_TEXT_COLORS.info = preferences.entityInfoColorDark;
    }
  } catch (error) {
    if (window.Logger) { window.Logger.error('❌ Error updating entity colors:', error, { page: "color-scheme" }); }
  }
}

function updateCSSVariablesFromPreferences(preferences) {
  try {
    const setVar = (name, value) => {
      if (typeof value === 'string' && value.trim() !== '') {
        document.documentElement.style.setProperty(name, value);
      }
    };

    const computeVariant = (base, fallback, variant) => {
      if (fallback) {
        return fallback;
      }
      if (!base || typeof base !== 'string') {
        return null;
      }
      try {
        if (variant === 'light') {
          return lightenColor(base, 25);
        }
        if (variant === 'dark') {
          return darkenColor(base, 20);
        }
        if (variant === 'border') {
          return lightenColor(base, 35);
        }
      } catch (variantError) {
        if (window.Logger) {
          window.Logger.warn('⚠️ Failed to compute color variant', { base, variant, error: variantError }, { page: "color-scheme" });
        }
      }
      return null;
    };

    const applyNumericPalette = (key, tokens = {}, semanticBase = null) => {
      const medium = tokens.medium;
      const light = computeVariant(medium, tokens.light, 'light');
      const dark = computeVariant(medium, tokens.dark, 'dark');
      const border = computeVariant(medium, tokens.border, 'border') || medium;

      setVar(`--numeric-${key}-medium`, medium);
      setVar(`--numeric-${key}-light`, light);
      setVar(`--numeric-${key}-dark`, dark);
      setVar(`--numeric-${key}-border`, border);

      if (semanticBase) {
        setVar(`--color-${semanticBase}`, medium);
        setVar(`--color-${semanticBase}-light`, light);
        setVar(`--color-${semanticBase}-dark`, dark);
        setVar(`--color-${semanticBase}-border`, border);
        setVar(`--color-${semanticBase}-bg`, light || medium);
      }
    };

    const applyThemeColor = (baseName, color, variants = {}) => {
      if (!color || typeof color !== 'string') {
        return;
      }
      const medium = color;
      const light = computeVariant(medium, variants.light, 'light');
      const dark = computeVariant(medium, variants.dark, 'dark');
      const border = computeVariant(medium, variants.border, 'border') || medium;

      setVar(`--color-${baseName}`, medium);
      setVar(`--color-${baseName}-light`, light);
      setVar(`--color-${baseName}-dark`, dark);
      setVar(`--color-${baseName}-border`, border);
      setVar(`--color-${baseName}-bg`, light || medium);
    };

    if (preferences && preferences.colorScheme) {
      // Update CSS variables based on preferences
      if (preferences.colorScheme.entities) {
        Object.entries(preferences.colorScheme.entities).forEach(([entityType, color]) => {
          document.documentElement.style.setProperty(`--entity-${entityType}-color`, color);
          
          // Add light and dark variants
          const lightColor = lightenColor(color, 10);
          const darkColor = darkenColor(color, 20);
          
          document.documentElement.style.setProperty(`--entity-${entityType}-color-light`, lightColor);
          document.documentElement.style.setProperty(`--entity-${entityType}-color-dark`, darkColor);
        });
      }

      // Update status colors from preferences
      if (preferences.colorScheme.status) {
        Object.entries(preferences.colorScheme.status).forEach(([statusType, color]) => {
          document.documentElement.style.setProperty(`--user-status-${statusType}-color`, color);
          
          // Add background and border variants
          const bgColor = lightenColor(color, 10);
          const borderColor = color;
          
          document.documentElement.style.setProperty(`--user-status-${statusType}-bg`, bgColor);
          document.documentElement.style.setProperty(`--user-status-${statusType}-border`, borderColor);
        });
      }

      if (preferences.colorScheme.numericValues) {
        const numericValues = preferences.colorScheme.numericValues;

        const positiveTokens = {
          medium: preferences.valuePositiveColor || numericValues.positive?.medium,
          light: preferences.valuePositiveColorLight || numericValues.positive?.light,
          dark: preferences.valuePositiveColorDark || numericValues.positive?.dark,
          border: numericValues.positive?.border
        };
        applyNumericPalette('positive', positiveTokens, 'success');

        const negativeTokens = {
          medium: preferences.valueNegativeColor || numericValues.negative?.medium,
          light: preferences.valueNegativeColorLight || numericValues.negative?.light,
          dark: preferences.valueNegativeColorDark || numericValues.negative?.dark,
          border: numericValues.negative?.border
        };
        applyNumericPalette('negative', negativeTokens, 'danger');

        const zeroTokens = {
          medium: preferences.valueNeutralColor || numericValues.zero?.medium,
          light: preferences.valueNeutralColorLight || numericValues.zero?.light,
          dark: preferences.valueNeutralColorDark || numericValues.zero?.dark,
          border: numericValues.zero?.border
        };
        applyNumericPalette('zero', zeroTokens, 'neutral');
      }
    }

    // Theme-level semantic colors (warning/info/success/danger overrides)
    const successOverride = preferences.successColor || preferences.valuePositiveColor;
    const dangerOverride = preferences.dangerColor || preferences.valueNegativeColor;
    const warningOverride = preferences.warningColor;
    const infoOverride = preferences.infoColor || preferences.primaryColor || (preferences.colorScheme && preferences.colorScheme.entities && preferences.colorScheme.entities.info);

    if (successOverride) {
      applyThemeColor('success', successOverride, {
        light: preferences.valuePositiveColorLight,
        dark: preferences.valuePositiveColorDark
      });
    }

    if (dangerOverride) {
      applyThemeColor('danger', dangerOverride, {
        light: preferences.valueNegativeColorLight,
        dark: preferences.valueNegativeColorDark
      });
    }

    if (warningOverride) {
      applyThemeColor('warning', warningOverride);
    }

    if (infoOverride) {
      applyThemeColor('info', infoOverride);
    }
  } catch (error) {
    if (window.Logger) { window.Logger.error('❌ Error updating CSS variables from preferences:', error, { page: "color-scheme" }); }
  }
}

// ===== GLOBAL EXPORTS =====
window.colorSchemeSystem = {
  // Entity functions
  getColor: getEntityColor,
  getBackgroundColor: getEntityBackgroundColor,
  getTextColor: getEntityTextColor,
  getBorderColor: getEntityBorderColor,
  isValid: isValidEntityType,
  getLabel: getEntityLabel,
  
  // Status functions
  getStatusColor,
  getStatusBackgroundColor,
  getStatusTextColor,
  getStatusBorderColor,
  
  // Investment type functions
  getInvestmentTypeColor,
  getInvestmentTypeBackgroundColor,
  getInvestmentTypeTextColor,
  getInvestmentTypeBorderColor,
  
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
  
  // CSS generation functions
  generateEntityCSS,
  generateStatusCSS,
  generateInvestmentTypeCSS,
  generateNumericValueCSS,
  
  // Color scheme functions
  applyColorScheme,
  toggleColorScheme,
  loadColorScheme,
  saveColorScheme,
  getCurrentColorScheme,
  getAvailableColorSchemes,
  
  // Utility functions
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
  NUMERIC_VALUE_COLORS
};

// Export individual functions
window.applyColorScheme = applyColorScheme;
window.toggleColorScheme = toggleColorScheme;
window.loadColorScheme = loadColorScheme;
window.saveColorScheme = saveColorScheme;
window.getCurrentColorScheme = getCurrentColorScheme;
window.getAvailableColorSchemes = getAvailableColorSchemes;

window.getEntityColor = getEntityColor;
window.getEntityBackgroundColor = getEntityBackgroundColor;
window.getEntityTextColor = getEntityTextColor;
window.getEntityBorderColor = getEntityBorderColor;
window.isValidEntityType = isValidEntityType;
window.getEntityLabel = getEntityLabel;

window.getStatusColor = getStatusColor;
window.getStatusBackgroundColor = getStatusBackgroundColor;
window.getStatusTextColor = getStatusTextColor;
window.getStatusBorderColor = getStatusBorderColor;

window.getInvestmentTypeColor = getInvestmentTypeColor;
window.getInvestmentTypeBackgroundColor = getInvestmentTypeBackgroundColor;
window.getInvestmentTypeTextColor = getInvestmentTypeTextColor;
window.getInvestmentTypeBorderColor = getInvestmentTypeBorderColor;

window.getNumericValueColor = getNumericValueColor;
window.getNumericValueBackgroundColor = getNumericValueBackgroundColor;
window.getNumericValueTextColor = getNumericValueTextColor;
window.getNumericValueBorderColor = getNumericValueBorderColor;
window.isPositiveValue = isPositiveValue;
window.isNegativeValue = isNegativeValue;
window.isZeroValue = isZeroValue;
window.getValueType = getValueType;
window.getNumericValueCSSClass = getNumericValueCSSClass;

window.generateEntityCSS = generateEntityCSS;
window.generateStatusCSS = generateStatusCSS;
window.generateInvestmentTypeCSS = generateInvestmentTypeCSS;
window.generateNumericValueCSS = generateNumericValueCSS;

window.loadDynamicColors = loadDynamicColors;
window.setCurrentEntityColorFromPage = setCurrentEntityColorFromPage;
window.setCurrentEntityColorForEntity = setCurrentEntityColorForEntity;
window.getEntityColorFromPreferences = getEntityColorFromPreferences;
window.getAllEntityColorVariantsFromPreferences = getAllEntityColorVariantsFromPreferences;

// Load entity colors with defaults fallback for testing (no auth required)
const colorSchemeInitTime = performance.now();
console.log(`🎨 [TIMING] Color scheme DOMContentLoaded handler started at ${colorSchemeInitTime.toFixed(2)}ms`);
console.log(`📊 [COLOR-SCHEME BEFORE] document.readyState: ${document.readyState}, headerSystemReady: ${window.headerSystemReady}, headerSystemExists: ${typeof window.headerSystem}`);

// #region agent log - color scheme DOMContentLoaded start
fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{
  method:'POST',
  headers:{'Content-Type':'application/json'},
  body:JSON.stringify({
    location:'color-scheme-system.js:DOMContentLoaded',
    message:'Color scheme DOMContentLoaded handler started',
    data:{
      timestamp: Date.now(),
      initTime: colorSchemeInitTime,
      documentReadyState: document.readyState,
      hasUnifiedHeader: !!document.getElementById('unified-header'),
      bodyChildrenCount: document.body?.children?.length || 0,
      headerSystemReady: window.headerSystemReady,
      headerSystemExists: typeof window.headerSystem,
      runId:'init_loading_critical',
      hypothesisId:'color_scheme_domcontentloaded_race'
    },
    timestamp:Date.now(),
    sessionId:'init_loading_critical'
  })
}).catch(()=>{});
// #endregion

  try {
    // First try to get user preferences (if authenticated)
    if (window.loadColorPreferences && typeof window.loadColorPreferences === 'function') {
      try {
        const userPrefs = await window.loadColorPreferences();
        if (userPrefs && userPrefs.colorScheme && userPrefs.colorScheme.entities) {
          return userPrefs.colorScheme.entities;
        }
      } catch (error) {
        // User preferences not available, continue to defaults
        if (window.Logger) {
          window.Logger.debug('User preferences not available, using defaults', { page: 'color-scheme' });
        }
      }
    }

    // Fallback to API defaults (no authentication required)
    const response = await fetch('/api/preferences/defaults/colors');
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.data && data.data.entity_colors) {
        return data.data.entity_colors;
      }
    }

    // Last resort: hardcoded defaults
    return {
      'trade': '#26baac',
      'trade_plan': '#0056b3',
      'alert': '#dc3545',
      'ticker': '#dc3545',
      'trading_account': '#28a745',
      'execution': '#17a2b8',
      'cash_flow': '#ffc107',
      'note': '#6f42c1',
      'preference': '#6c757d',
      'research': '#20c997',
      'tag': '#e83e8c'
    };

  } catch (error) {
    if (window.Logger) {
      window.Logger.error('Error loading entity colors:', error, { page: 'color-scheme' });
    }
    // Return hardcoded defaults on error
    return {
      'trade': '#26baac',
      'trade_plan': '#0056b3',
      'alert': '#dc3545',
      'ticker': '#dc3545',
      'trading_account': '#28a745',
      'execution': '#17a2b8',
      'cash_flow': '#ffc107',
      'note': '#6f42c1',
      'preference': '#6c757d',
      'research': '#20c997',
      'tag': '#e83e8c'
    };
  }
}

// Export preference integration functions
window.loadEntityColorsFromPreferences = loadEntityColorsFromPreferences;
window.loadEntityColors = loadEntityColors;
window.generateAndApplyEntityCSS = generateAndApplyEntityCSS;
window.updateCSSVariablesFromPreferences = updateCSSVariablesFromPreferences;
window.loadColorPreferences = loadColorPreferences;
window.updateEntityColors = updateEntityColors;

// Export header styling functions
window.applyEntityColorsToHeaders = applyEntityColorsToHeaders;
window.isWarningModal = isWarningModal;
window.getMainHeaderOpacityHex = getMainHeaderOpacityHex;
window.getSubHeaderOpacityHex = getSubHeaderOpacityHex;

// Export page-to-entity mapping
window.PAGE_TO_ENTITY_MAPPING = PAGE_TO_ENTITY_MAPPING;

window.ColorSchemeSystem = {
  isReady: () => window.colorSchemeSystemReady === true,
  loadPreferences: loadColorPreferences,
  applyPreferences: updateCSSVariablesFromPreferences,
  updateColor: async (colorName, colorValue) => {
    if (!colorName) {
      return;
    }

    const payload = {
      colorScheme: {
        entities: {
          [colorName]: colorValue,
        },
      },
    };

    updateEntityColors(payload);
    generateEntityCSS();
    generateNumericValueCSS();
  },
  generateEntityCSS,
  generateNumericValueCSS,
  refreshFromPage: setCurrentEntityColorFromPage,
  getEntityColor,
  getNumericValueColor,
};

// ===== DEBUG: DOM COMPARISON =====
(function() {
  // Capture served HTML before any modifications
  const servedHTML = document.documentElement.outerHTML;
  window.servedHTML = servedHTML;

  // Add instrumentation to compare DOM state
  window.compareDOMState = function(label) {
    const currentHTML = document.documentElement.outerHTML;
    const servedLength = servedHTML.length;
    const currentLength = currentHTML.length;
    const diff = currentLength - servedLength;

    // #region agent log - DOM state comparison
    fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        location:'color-scheme-system.js:dom-comparison',
        message:`DOM state comparison: ${label}`,
        data:{
          label: label,
          servedHTMLLength: servedLength,
          currentHTMLLength: currentLength,
          difference: diff,
          hasUnifiedHeader: !!document.getElementById('unified-header'),
          bodyChildCount: document.body?.children?.length || 0,
          headerScripts: Array.from(document.querySelectorAll('script')).filter(s => s.src && s.src.includes('header')).length,
          runId:'init_loading_support',
          hypothesisId:'dom_modification_tracking'
        },
        timestamp:Date.now(),
        sessionId:'init-loading-debug'
      })
    }).catch(()=>{});
    // #endregion

    return {
      label,
      servedLength,
      currentLength,
      diff,
      hasUnifiedHeader: !!document.getElementById('unified-header')
    };
  };

  // Initial capture
  setTimeout(() => window.compareDOMState('initial-load'), 100);
})();

// ===== TABLE COLORS FUNCTIONS =====

/**
 * קבלת צבעים מוכנים לשימוש בטבלאות
 * Get ready-to-use colors for tables
 * @returns {Object} אובייקט עם צבעים מוכנים לשימוש
 */
function getTableColors() {
  return {
    positive: NUMERIC_VALUE_COLORS.positive || '#28a745',
    negative: NUMERIC_VALUE_COLORS.negative || '#dc3545',
    secondary: ENTITY_COLORS.preference || '#6c757d',
    success: ENTITY_COLORS.account || '#28a745',
    warning: ENTITY_COLORS.alert || '#ffc107',
    info: ENTITY_COLORS.execution || '#17a2b8',
    primary: ENTITY_COLORS.trade || BRAND_PRIMARY,
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
    primary: colors.primary || BRAND_PRIMARY,
  };
}

// Export functions
window.getTableColors = getTableColors;
window.getTableColorsWithFallbacks = getTableColorsWithFallbacks;

// Export constants
window.VALID_ENTITY_TYPES = VALID_ENTITY_TYPES;
window.ENTITY_COLORS = ENTITY_COLORS;
window.ENTITY_BACKGROUND_COLORS = ENTITY_BACKGROUND_COLORS;
window.ENTITY_TEXT_COLORS = ENTITY_TEXT_COLORS;
window.ENTITY_BORDER_COLORS = ENTITY_BORDER_COLORS;
window.ENTITY_LIGHT_COLORS = ENTITY_LIGHT_COLORS;
window.ENTITY_DARK_COLORS = ENTITY_DARK_COLORS;
window.STATUS_COLORS = STATUS_COLORS;
window.INVESTMENT_TYPE_COLORS = INVESTMENT_TYPE_COLORS;
window.NUMERIC_VALUE_COLORS = NUMERIC_VALUE_COLORS;

// Set current entity color when DOM is ready
// Auto-initialization removed - preferences loading is now handled centrally by unified-app-initializer.js
// Color preferences will be loaded as part of the unified preferences initialization
// This prevents duplicate API calls and ensures single point of entry
// 
// Listen for preferences:updated event to update colors when preferences change
// Only register listener after functions are available
// CRITICAL: Prevent infinite loop - if preferences are already loaded, just update CSS variables
if (typeof loadColorPreferences === 'function' && typeof updateCSSVariablesFromPreferences === 'function') {
  window.addEventListener('preferences:updated', async (e) => {
    try {
      // CRITICAL: Prevent infinite loop - if loadUserPreferences is in progress, don't reload
      // This prevents: loadUserPreferences() → preferences:updated → loadColorPreferences() → loadUserPreferences() → ...
      if (window.__loadUserPreferencesInflight && window.__loadUserPreferencesInflight.size > 0) {
        // Preferences are being loaded - just update CSS from currentPreferences
        if (window.currentPreferences && Object.keys(window.currentPreferences).length > 0) {
          updateCSSVariablesFromPreferences(window.currentPreferences);
        }
        return;
      }
      
      // CRITICAL: Prevent infinite loop - if getPreference is in progress, don't reload
      if (window.__GET_PREFERENCE_IN_PROGRESS__) {
        // Preferences are being loaded - just update CSS from currentPreferences
        if (window.currentPreferences && Object.keys(window.currentPreferences).length > 0) {
          updateCSSVariablesFromPreferences(window.currentPreferences);
        }
        return;
      }
      
      // Only reload if preferences are not already loaded
      // Use currentPreferences if available to avoid unnecessary API calls
      if (window.currentPreferences && Object.keys(window.currentPreferences).length > 0) {
        // Preferences already loaded - just update CSS variables
        updateCSSVariablesFromPreferences(window.currentPreferences);
      } else {
        // Preferences not loaded - reload them
        const preferences = await loadColorPreferences();
        if (preferences && Object.keys(preferences).length > 0) {
          updateCSSVariablesFromPreferences(preferences);
        }
      }
    } catch (error) {
      // CRITICAL: Do NOT use Logger here to prevent infinite recursion
      if (window.DEBUG_MODE) {
        console.error('❌ Error updating color scheme from preferences:', error);
      }
    }
  });
}

// Only set current entity color from page (doesn't require preferences)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    await setCurrentEntityColorFromPage();
  });
} else {
  setCurrentEntityColorFromPage();
}

// #region agent log - color scheme DOMContentLoaded complete
  const colorSchemeCompletionTime = performance.now();
  console.log(`🎨 [TIMING] Color scheme DOMContentLoaded handler completed at ${colorSchemeCompletionTime.toFixed(2)}ms (duration: ${(colorSchemeCompletionTime - colorSchemeInitTime).toFixed(2)}ms)`);
  console.log(`📊 [COLOR-SCHEME AFTER] document.readyState: ${document.readyState}, headerSystemReady: ${window.headerSystemReady}, headerSystemExists: ${typeof window.headerSystem}`);

  fetch('http://127.0.0.1:7243/ingest/6e906bd0-148a-41fc-aa3b-e13c2ed1de41',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      location:'color-scheme-system.js:DOMContentLoaded',
      message:'Color scheme DOMContentLoaded handler completed',
      data:{
        timestamp: Date.now(),
        completionTime: colorSchemeCompletionTime,
        duration: colorSchemeCompletionTime - colorSchemeInitTime,
        documentReadyState: document.readyState,
        hasUnifiedHeader: !!document.getElementById('unified-header'),
        bodyChildrenCount: document.body?.children?.length || 0,
        cssVarsSet: Array.from(document.documentElement.style).filter(prop => prop.startsWith('--entity-')),
        headerSystemReady: window.headerSystemReady,
        headerSystemExists: typeof window.headerSystem,
        runId:'init_loading_critical',
        hypothesisId:'color_scheme_domcontentloaded_race'
      },
      timestamp:Date.now(),
      sessionId:'init_loading_critical'
    })
  }).catch(()=>{});
  // #endregion

// Color Scheme System loaded successfully
window.colorSchemeSystemReady = true;
// if (window.Logger) { window.Logger.info('✅ Color Scheme System ready', { page: "color-scheme" }); }

})();

// IIFE wrapper added for proper JavaScript execution
