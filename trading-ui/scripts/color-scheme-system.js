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

// ===== ENTITY TYPE DEFINITIONS =====
// עטיפת כל הקובץ בפונקציה כדי למנוע טעינה כפולה
(function() {
    // בדיקה שהקובץ לא נטען פעמיים
    if (window.VALID_ENTITY_TYPES) {
        console.warn('⚠️ color-scheme-system.js כבר נטען - מדלג על טעינה חוזרת');
        return;
    }

    const VALID_ENTITY_TYPES = [
  'trade', 'trade_plan', 'execution', 'account', 'cash_flow',
  'ticker', 'alert', 'note', 'constraint', 'design', 'research', 'preference',
  'development', 'info'
];

// ===== COLOR DEFINITIONS =====
const ENTITY_COLORS = {
  trade: '#007bff',
  trade_plan: '#28a745',
  execution: '#17a2b8',
  account: '#6f42c1',
  cash_flow: '#fd7e14',
  ticker: '#20c997',
  alert: '#dc3545',
  note: '#6c757d',
  constraint: '#e83e8c',
  design: '#6f42c1',
  research: '#17a2b8',
  preference: '#adb5bd'
};

const ENTITY_BACKGROUND_COLORS = {
  trade: 'rgba(0, 123, 255, 0.1)',
  trade_plan: 'rgba(40, 167, 69, 0.1)',
  execution: 'rgba(23, 162, 184, 0.1)',
  account: 'rgba(111, 66, 193, 0.1)',
  cash_flow: 'rgba(253, 126, 20, 0.1)',
  ticker: 'rgba(32, 201, 151, 0.1)',
  alert: 'rgba(220, 53, 69, 0.1)',
  note: 'rgba(108, 117, 125, 0.1)',
  constraint: 'rgba(232, 62, 140, 0.1)',
  design: 'rgba(111, 66, 193, 0.1)',
  research: 'rgba(23, 162, 184, 0.1)',
  preference: 'rgba(173, 181, 189, 0.1)'
};

const ENTITY_TEXT_COLORS = {
  trade: '#0056b3',
  trade_plan: '#1e7e34',
  execution: '#117a8b',
  account: '#59359a',
  cash_flow: '#e55100',
  ticker: '#1a9d7a',
  alert: '#c82333',
  note: '#495057',
  constraint: '#d91a72',
  design: '#59359a',
  research: '#117a8b',
  preference: '#6c757d'
};

const ENTITY_BORDER_COLORS = {
  trade: 'rgba(0, 123, 255, 0.3)',
  trade_plan: 'rgba(40, 167, 69, 0.3)',
  execution: 'rgba(23, 162, 184, 0.3)',
  account: 'rgba(111, 66, 193, 0.3)',
  cash_flow: 'rgba(253, 126, 20, 0.3)',
  ticker: 'rgba(32, 201, 151, 0.3)',
  alert: 'rgba(220, 53, 69, 0.3)',
  note: 'rgba(108, 117, 125, 0.3)',
  constraint: 'rgba(232, 62, 140, 0.3)',
  design: 'rgba(111, 66, 193, 0.3)',
  research: 'rgba(23, 162, 184, 0.3)',
  preference: 'rgba(173, 181, 189, 0.3)'
};

const ENTITY_LIGHT_COLORS = {
  trade: '#cce5ff',
  trade_plan: '#c3e6cb',
  execution: '#bee5eb',
  account: '#e2d9f3',
  cash_flow: '#ffe5d3',
  ticker: '#c5f4ea',
  alert: '#f5c6cb',
  note: '#e2e3e5',
  constraint: '#f8d7da',
  design: '#e2d9f3',
  research: '#bee5eb',
  preference: 'rgba(173, 181, 189, 0.1)'
};

const ENTITY_DARK_COLORS = {
  trade: '#004085',
  trade_plan: '#155724',
  execution: '#0c5460',
  account: '#383d41',
  cash_flow: '#842029',
  ticker: '#1e7e34',
  alert: '#b02a37',
  note: '#383d41',
  constraint: '#b02a37',
  design: '#383d41',
  research: '#0c5460',
  preference: '#6c757d'
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
    medium: '#007bff',
    light: 'rgba(0, 123, 255, 0.1)',
    border: 'rgba(0, 123, 255, 0.3)'
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
    preference: 'העדפה'
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
    if (window.Logger) {
      window.Logger.info(`🎨 Applying color scheme: ${schemeName}`, { page: 'color-scheme' });
    }
    
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
  document.documentElement.style.setProperty('--primary-color', '#007bff');
  document.documentElement.style.setProperty('--secondary-color', '#6c757d');
  document.documentElement.style.setProperty('--success-color', '#28a745');
  document.documentElement.style.setProperty('--danger-color', '#dc3545');
  document.documentElement.style.setProperty('--warning-color', '#ffc107');
  document.documentElement.style.setProperty('--info-color', '#17a2b8');
}

function applyDarkScheme() {
  // Apply dark theme colors
  document.documentElement.style.setProperty('--primary-color', '#0d6efd');
  document.documentElement.style.setProperty('--secondary-color', '#6c757d');
  document.documentElement.style.setProperty('--success-color', '#198754');
  document.documentElement.style.setProperty('--danger-color', '#dc3545');
  document.documentElement.style.setProperty('--warning-color', '#ffc107');
  document.documentElement.style.setProperty('--info-color', '#0dcaf0');
}

function applyCustomScheme(customColors) {
  try {
    if (window.Logger) { window.Logger.info('🎨 Applying custom color scheme', { page: "color-scheme" }); }
    
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
          
          if (window.Logger) {
            window.Logger.info(`🎨 Set current entity color for ${entityType} (from ${pageClass}):`, { 
              page: 'color-scheme',
              primary: entityColor,
              light: lightColor,
              dark: darkColor
            });
          }
        }
      } else {
        if (window.Logger) { window.Logger.warn(`⚠️ No mapping found for page class: ${pageClass}`, { page: "color-scheme" }); }
      }
    }
  } catch (error) {
    if (window.Logger) { window.Logger.error('❌ Error setting current entity color:', error, { page: "color-scheme" }); }
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
  'trading-accounts-page': 'account', // Trading accounts page
  'accounts-page': 'account', // Alias
  'trades-page': 'trade',
  'tracking-page': 'trade', // Alias
  'alerts-page': 'alert',
  'cash-flows-page': 'cash_flow',
  'notes-page': 'note',
  'executions-page': 'execution',
  'trade-plans-page': 'trade_plan',
  'planning-page': 'trade_plan', // Alias
  'preferences-page': 'preference',
  'research-page': 'research',
  'designs-page': 'design',
  'constraints-page': 'constraint',
  'db-display-page': null, // Uses fixed gray color
  'db-extradata-page': null, // Uses fixed gray color
  'extra-data-page': null, // Alias
  
  // עמודי כלי פיתוח - כולם מקבלים צבע development
  'development-page': 'development',
  'linter-realtime-monitor-page': 'development',
  'init-system-page': 'development',
  'system-management-page': 'development',
  'server-monitor-page': 'development',
  'notifications-center-page': 'development',
  'external-data-dashboard-page': 'development',
  'crud-testing-dashboard-page': 'development',
  'code-quality-dashboard-page': 'development',
  'duplicate-detector-page': 'development',
  'page-scripts-matrix-page': 'development',
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
    
    // עדכון צבעי executions
    if (preferences.entityExecutionColor) {
      ENTITY_COLORS.execution = preferences.entityExecutionColor;
      ENTITY_BACKGROUND_COLORS.execution = preferences.entityExecutionColorLight || `rgba(${hexToRgb(preferences.entityExecutionColor)?.r || 253}, ${hexToRgb(preferences.entityExecutionColor)?.g || 126}, ${hexToRgb(preferences.entityExecutionColor)?.b || 20}, 0.1)`;
      ENTITY_TEXT_COLORS.execution = preferences.entityExecutionColorDark || darkenColor(preferences.entityExecutionColor, 20);
      ENTITY_BORDER_COLORS.execution = `rgba(${hexToRgb(preferences.entityExecutionColor)?.r || 253}, ${hexToRgb(preferences.entityExecutionColor)?.g || 126}, ${hexToRgb(preferences.entityExecutionColor)?.b || 20}, 0.3)`;
      ENTITY_LIGHT_COLORS.execution = preferences.entityExecutionColorLight || lightenColor(preferences.entityExecutionColor, 10);
      ENTITY_DARK_COLORS.execution = preferences.entityExecutionColorDark || darkenColor(preferences.entityExecutionColor, 20);
    }
    
    // עדכון צבעי trades
    if (preferences.entityTradeColor) {
      ENTITY_COLORS.trade = preferences.entityTradeColor;
      ENTITY_BACKGROUND_COLORS.trade = preferences.entityTradeColorLight || `rgba(${hexToRgb(preferences.entityTradeColor)?.r || 40}, ${hexToRgb(preferences.entityTradeColor)?.g || 167}, ${hexToRgb(preferences.entityTradeColor)?.b || 69}, 0.1)`;
      ENTITY_TEXT_COLORS.trade = preferences.entityTradeColorDark || darkenColor(preferences.entityTradeColor, 20);
      ENTITY_BORDER_COLORS.trade = `rgba(${hexToRgb(preferences.entityTradeColor)?.r || 40}, ${hexToRgb(preferences.entityTradeColor)?.g || 167}, ${hexToRgb(preferences.entityTradeColor)?.b || 69}, 0.3)`;
      ENTITY_LIGHT_COLORS.trade = preferences.entityTradeColorLight || lightenColor(preferences.entityTradeColor, 10);
      ENTITY_DARK_COLORS.trade = preferences.entityTradeColorDark || darkenColor(preferences.entityTradeColor, 20);
    }
    
    // עדכון צבעי trading accounts
    if (preferences.entityTradingAccountColor) {
      ENTITY_COLORS.account = preferences.entityTradingAccountColor;
      ENTITY_BACKGROUND_COLORS.account = preferences.entityTradingAccountColorLight || `rgba(${hexToRgb(preferences.entityTradingAccountColor)?.r || 23}, ${hexToRgb(preferences.entityTradingAccountColor)?.g || 162}, ${hexToRgb(preferences.entityTradingAccountColor)?.b || 184}, 0.1)`;
      ENTITY_TEXT_COLORS.account = preferences.entityTradingAccountColorDark || darkenColor(preferences.entityTradingAccountColor, 20);
      ENTITY_BORDER_COLORS.account = `rgba(${hexToRgb(preferences.entityTradingAccountColor)?.r || 23}, ${hexToRgb(preferences.entityTradingAccountColor)?.g || 162}, ${hexToRgb(preferences.entityTradingAccountColor)?.b || 184}, 0.3)`;
      ENTITY_LIGHT_COLORS.account = preferences.entityTradingAccountColorLight || lightenColor(preferences.entityTradingAccountColor, 10);
      ENTITY_DARK_COLORS.account = preferences.entityTradingAccountColorDark || darkenColor(preferences.entityTradingAccountColor, 20);
    }
    
    // עדכון צבעי alerts
    if (preferences.entityAlertColor) {
      ENTITY_COLORS.alert = preferences.entityAlertColor;
      ENTITY_BACKGROUND_COLORS.alert = preferences.entityAlertColorLight || `rgba(${hexToRgb(preferences.entityAlertColor)?.r || 255}, ${hexToRgb(preferences.entityAlertColor)?.g || 193}, ${hexToRgb(preferences.entityAlertColor)?.b || 7}, 0.1)`;
      ENTITY_TEXT_COLORS.alert = preferences.entityAlertColorDark || darkenColor(preferences.entityAlertColor, 20);
      ENTITY_BORDER_COLORS.alert = `rgba(${hexToRgb(preferences.entityAlertColor)?.r || 255}, ${hexToRgb(preferences.entityAlertColor)?.g || 193}, ${hexToRgb(preferences.entityAlertColor)?.b || 7}, 0.3)`;
      ENTITY_LIGHT_COLORS.alert = preferences.entityAlertColorLight || lightenColor(preferences.entityAlertColor, 10);
      ENTITY_DARK_COLORS.alert = preferences.entityAlertColorDark || darkenColor(preferences.entityAlertColor, 20);
    }
    
    // עדכון צבעי tickers
    if (preferences.entityTickerColor) {
      ENTITY_COLORS.ticker = preferences.entityTickerColor;
      ENTITY_BACKGROUND_COLORS.ticker = preferences.entityTickerColorLight || `rgba(${hexToRgb(preferences.entityTickerColor)?.r || 111}, ${hexToRgb(preferences.entityTickerColor)?.g || 66}, ${hexToRgb(preferences.entityTickerColor)?.b || 193}, 0.1)`;
      ENTITY_TEXT_COLORS.ticker = preferences.entityTickerColorDark || darkenColor(preferences.entityTickerColor, 20);
      ENTITY_BORDER_COLORS.ticker = `rgba(${hexToRgb(preferences.entityTickerColor)?.r || 111}, ${hexToRgb(preferences.entityTickerColor)?.g || 66}, ${hexToRgb(preferences.entityTickerColor)?.b || 193}, 0.3)`;
      ENTITY_LIGHT_COLORS.ticker = preferences.entityTickerColorLight || lightenColor(preferences.entityTickerColor, 10);
      ENTITY_DARK_COLORS.ticker = preferences.entityTickerColorDark || darkenColor(preferences.entityTickerColor, 20);
    }
    
    // עדכון צבעי cash flows
    if (preferences.entityCashFlowColor) {
      ENTITY_COLORS['cash_flow'] = preferences.entityCashFlowColor;
      ENTITY_BACKGROUND_COLORS['cash_flow'] = preferences.entityCashFlowColorLight || `rgba(${hexToRgb(preferences.entityCashFlowColor)?.r || 32}, ${hexToRgb(preferences.entityCashFlowColor)?.g || 201}, ${hexToRgb(preferences.entityCashFlowColor)?.b || 151}, 0.1)`;
      ENTITY_TEXT_COLORS['cash_flow'] = preferences.entityCashFlowColorDark || darkenColor(preferences.entityCashFlowColor, 20);
      ENTITY_BORDER_COLORS['cash_flow'] = `rgba(${hexToRgb(preferences.entityCashFlowColor)?.r || 32}, ${hexToRgb(preferences.entityCashFlowColor)?.g || 201}, ${hexToRgb(preferences.entityCashFlowColor)?.b || 151}, 0.3)`;
      ENTITY_LIGHT_COLORS['cash_flow'] = preferences.entityCashFlowColorLight || lightenColor(preferences.entityCashFlowColor, 10);
      ENTITY_DARK_COLORS['cash_flow'] = preferences.entityCashFlowColorDark || darkenColor(preferences.entityCashFlowColor, 20);
    }
    
    // עדכון צבעי notes
    if (preferences.entityNoteColor) {
      ENTITY_COLORS.note = preferences.entityNoteColor;
      ENTITY_BACKGROUND_COLORS.note = preferences.entityNoteColorLight || `rgba(${hexToRgb(preferences.entityNoteColor)?.r || 108}, ${hexToRgb(preferences.entityNoteColor)?.g || 117}, ${hexToRgb(preferences.entityNoteColor)?.b || 125}, 0.1)`;
      ENTITY_TEXT_COLORS.note = preferences.entityNoteColorDark || darkenColor(preferences.entityNoteColor, 20);
      ENTITY_BORDER_COLORS.note = `rgba(${hexToRgb(preferences.entityNoteColor)?.r || 108}, ${hexToRgb(preferences.entityNoteColor)?.g || 117}, ${hexToRgb(preferences.entityNoteColor)?.b || 125}, 0.3)`;
      ENTITY_LIGHT_COLORS.note = preferences.entityNoteColorLight || lightenColor(preferences.entityNoteColor, 10);
      ENTITY_DARK_COLORS.note = preferences.entityNoteColorDark || darkenColor(preferences.entityNoteColor, 20);
    }
    
    // עדכון צבעי trade plans
    if (preferences.entityTradePlanColor) {
      ENTITY_COLORS['trade_plan'] = preferences.entityTradePlanColor;
      ENTITY_BACKGROUND_COLORS['trade_plan'] = preferences.entityTradePlanColorLight || `rgba(${hexToRgb(preferences.entityTradePlanColor)?.r || 0}, ${hexToRgb(preferences.entityTradePlanColor)?.g || 123}, ${hexToRgb(preferences.entityTradePlanColor)?.b || 255}, 0.1)`;
      ENTITY_TEXT_COLORS['trade_plan'] = preferences.entityTradePlanColorDark || darkenColor(preferences.entityTradePlanColor, 20);
      ENTITY_BORDER_COLORS['trade_plan'] = `rgba(${hexToRgb(preferences.entityTradePlanColor)?.r || 0}, ${hexToRgb(preferences.entityTradePlanColor)?.g || 123}, ${hexToRgb(preferences.entityTradePlanColor)?.b || 255}, 0.3)`;
      ENTITY_LIGHT_COLORS['trade_plan'] = preferences.entityTradePlanColorLight || lightenColor(preferences.entityTradePlanColor, 10);
      ENTITY_DARK_COLORS['trade_plan'] = preferences.entityTradePlanColorDark || darkenColor(preferences.entityTradePlanColor, 20);
    }
    
    if (preferences.entityPreferencesColor) {
      ENTITY_COLORS.preference = preferences.entityPreferencesColor;
      const prefRgb = hexToRgb(preferences.entityPreferencesColor) || { r: 173, g: 181, b: 189 };
      ENTITY_BACKGROUND_COLORS.preference = preferences.entityPreferencesColorLight || `rgba(${prefRgb.r}, ${prefRgb.g}, ${prefRgb.b}, 0.1)`;
      ENTITY_TEXT_COLORS.preference = preferences.entityPreferencesColorDark || darkenColor(preferences.entityPreferencesColor, 20);
      ENTITY_BORDER_COLORS.preference = `rgba(${prefRgb.r}, ${prefRgb.g}, ${prefRgb.b}, 0.3)`;
      ENTITY_LIGHT_COLORS.preference = preferences.entityPreferencesColorLight || lightenColor(preferences.entityPreferencesColor, 10);
      ENTITY_DARK_COLORS.preference = preferences.entityPreferencesColorDark || darkenColor(preferences.entityPreferencesColor, 20);
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
    // Load preferences from server - NO hardcoded colors!
    // Use the global preferences loading system
    if (window.loadUserPreferences && typeof window.loadUserPreferences === 'function') {
      const loaded = await window.loadUserPreferences({ force: false });
      if (loaded && window.currentPreferences) {
        return window.currentPreferences;
      }
    }
    
    // Fallback: try direct API call
    try {
      const response = await fetch('/api/preferences/user');
      if (response.ok) {
        const data = await response.json();
        const preferences = data.data || data;
        window.currentPreferences = preferences;
        return preferences;
      }
    } catch (apiError) {
      if (window.Logger) { window.Logger.warn('⚠️ Could not load preferences from API', { page: "color-scheme" }); }
    }
    
    // Last resort: return empty object - NO hardcoded colors!
    if (window.Logger) { window.Logger.warn('⚠️ No preferences loaded - colors will use CSS fallbacks only', { page: "color-scheme" }); }
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
    }
  } catch (error) {
    if (window.Logger) { window.Logger.error('❌ Error updating entity colors:', error, { page: "color-scheme" }); }
  }
}

function updateCSSVariablesFromPreferences(preferences) {
  try {
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

window.generateEntityCSS = generateEntityCSS;
window.generateStatusCSS = generateStatusCSS;
window.generateInvestmentTypeCSS = generateInvestmentTypeCSS;
window.generateNumericValueCSS = generateNumericValueCSS;

window.loadDynamicColors = loadDynamicColors;
window.setCurrentEntityColorFromPage = setCurrentEntityColorFromPage;
window.getEntityColorFromPreferences = getEntityColorFromPreferences;
window.getAllEntityColorVariantsFromPreferences = getAllEntityColorVariantsFromPreferences;

// Export preference integration functions
window.loadEntityColorsFromPreferences = loadEntityColorsFromPreferences;
window.generateAndApplyEntityCSS = generateAndApplyEntityCSS;
window.updateCSSVariablesFromPreferences = updateCSSVariablesFromPreferences;

// Export header styling functions
window.applyEntityColorsToHeaders = applyEntityColorsToHeaders;
window.isWarningModal = isWarningModal;
window.getMainHeaderOpacityHex = getMainHeaderOpacityHex;
window.getSubHeaderOpacityHex = getSubHeaderOpacityHex;

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
    primary: ENTITY_COLORS.trade || '#007bff',
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
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    await setCurrentEntityColorFromPage();
    // Also update CSS variables from preferences
    const preferences = await loadColorPreferences();
    if (preferences) {
      updateCSSVariablesFromPreferences(preferences);
    }
  });
} else {
  setCurrentEntityColorFromPage();
  // Also update CSS variables from preferences
  loadColorPreferences().then(preferences => {
    if (preferences) {
      updateCSSVariablesFromPreferences(preferences);
    }
  });
}

// Color Scheme System loaded successfully
window.colorSchemeSystemReady = true;
// if (window.Logger) { window.Logger.info('✅ Color Scheme System ready', { page: "color-scheme" }); }

})(); // סיום הפונקציה המעטפת
