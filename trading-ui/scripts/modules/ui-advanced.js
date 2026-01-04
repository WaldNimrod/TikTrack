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


// ===== FUNCTION INDEX =====

// === Initialization ===
// - createEntityLegend() - Createentitylegend
// - createInvestmentTypeLegend() - Createinvestmenttypelegend

// === Event Handlers ===
// - getContrastColor() - Getcontrastcolor

// === UI Functions ===
// - updateEntityColor() - Updateentitycolor
// - updateEntityColorFromHex() - Updateentitycolorfromhex
// - updateCSSVariablesFromPreferences() - Updatecssvariablesfrompreferences
// - updateEntityColors() - Updateentitycolors

// === Data Functions ===
// - loadAllColorsFromPreferences() - Loadallcolorsfrompreferences
// - getEntityColor() - Getentitycolor
// - getStatusColor() - Getstatuscolor
// - getStatusBackgroundColor() - Getstatusbackgroundcolor
// - getStatusTextColor() - Getstatustextcolor
// - getStatusBorderColor() - Getstatusbordercolor
// - _getOriginalGetEntityBackgroundColor() -  Getoriginalgetentitybackgroundcolor
// - getEntityBackgroundColor() - Getentitybackgroundcolor
// - getEntityTextColor() - Getentitytextcolor
// - getEntityBorderColor() - Getentitybordercolor
// - getEntityLabel() - Getentitylabel
// - getInvestmentTypeColor() - Getinvestmenttypecolor
// - getInvestmentTypeBackgroundColorWrapper3() - Getinvestmenttypebackgroundcolorwrapper3
// - getInvestmentTypeTextColor() - Getinvestmenttypetextcolor
// - getInvestmentTypeBorderColor() - Getinvestmenttypebordercolor
// - getInvestmentTypeEntityType() - Getinvestmenttypeentitytype
// - getNumericValueColor() - Getnumericvaluecolor
// - getNumericValueBackgroundColor() - Getnumericvaluebackgroundcolor
// - getNumericValueTextColor() - Getnumericvaluetextcolor
// - getNumericValueBorderColor() - Getnumericvaluebordercolor
// - getValueType() - Getvaluetype
// - getNumericValueCSSClass() - Getnumericvaluecssclass
// - getTableColors() - Gettablecolors
// - getTableColorsWithFallbacks() - Gettablecolorswithfallbacks
// - getColorPreferences() - Getcolorpreferences
// - loadColorPreferences() - Loadcolorpreferences
// - loadColorScheme() - Loadcolorscheme
// - saveColorScheme() - Savecolorscheme
// - getCurrentColorScheme() - Getcurrentcolorscheme
// - getAvailableColorSchemes() - Getavailablecolorschemes
// - loadDynamicColors() - Loaddynamiccolors
// - loadPromise() - Loadpromise
// - getEntityColorFromPrefs() - Getentitycolorfromprefs

// === Other ===
// - generateAndApplyStatusCSS() - Generateandapplystatuscss
// - hexToRgb() - Hextorgb
// - isValidEntityType() - Isvalidentitytype
// - generateEntityCSS() - Generateentitycss
// - generateStatusCSS() - Generatestatuscss
// - generateInvestmentTypeCSS() - Generateinvestmenttypecss
// - darkenColor() - Darkencolor
// - isPositiveValue() - Ispositivevalue
// - isNegativeValue() - Isnegativevalue
// - isZeroValue() - Iszerovalue
// - generateNumericValueCSS() - Generatenumericvaluecss
// - resetEntityColors() - Resetentitycolors
// - applyColorScheme() - Applycolorscheme
// - toggleColorScheme() - Togglecolorscheme
// - applyLightScheme() - Applylightscheme
// - applyDarkScheme() - Applydarkscheme
// - applyCustomScheme() - Applycustomscheme
// - toHex() - Tohex
// - ensureVar() - Ensurevar

// ===== ENTITY TYPE DEFINITIONS =====
// הגדרות סוגי ישויות במערכת

// Save original getStatusColor from color-scheme-system.js before defining local function
// This prevents circular reference when local function checks window.getStatusColor
// IMPORTANT: Save these BEFORE color-scheme-system.js loads, or immediately after it loads
let _originalGetStatusColor = null;
let _originalGetStatusBackgroundColor = null;
let _originalGetStatusTextColor = null;
let _originalGetStatusBorderColor = null;

// Flag to skip heavy logic on the demo page to avoid recursion/RangeError
const UI_ADVANCED_SKIP_PAGE = (() => {
  try {
    if (typeof window !== 'undefined' && window.location && window.location.pathname) {
      const path = window.location.pathname || '';
      return path.includes('dynamic-colors-display');
    }
  } catch (_) {}
  return false;
})();

if (UI_ADVANCED_SKIP_PAGE) {
  // Skip heavy logic on the demo page; provide safe stubs to avoid errors
  window.Logger?.debug?.('⏭️ Skipping ui-advanced on dynamic-colors-display page', { page: 'ui-advanced' });
  window.__UI_ADVANCED_INITIALIZED__ = true;
  window.UI_ADVANCED_DISABLED = true;
  window.getStatusColor = () => '';
  window.getStatusBackgroundColor = () => '';
  window.getStatusTextColor = () => '';
  window.getStatusBorderColor = () => '';
  window.getTableColors = () => ({});
  window.getTableColorsWithFallbacks = () => ({});
  window.getColorPreferences = () => ({});
  window.loadColorScheme = async () => {};
  window.applyColorScheme = () => {};
  window.loadDynamicColors = async () => true;
} else {

// Save original functions from color-scheme-system.js if they exist
// This must run immediately when this script loads (color-scheme-system.js loads before this)
// CRITICAL: Save the original functions BEFORE they get overwritten by this script's local functions
(function() {
  // Guard: prevent double initialization recursion
  if (window.__UI_ADVANCED_INITIALIZED__) {
    return;
  }
  window.__UI_ADVANCED_INITIALIZED__ = true;

  // Skip heavy init on dynamic-colors-display and trading-journal pages to avoid recursion issues
  // CRITICAL: Check pathname safely to prevent RangeError
  try {
    if (typeof window !== 'undefined' && window.location && window.location.pathname) {
      const path = window.location.pathname;
      if (path && (path.includes('dynamic-colors-display') || path.includes('trading-journal'))) {
        // Silent skip - no logging to prevent recursion
        return;
      }
    }
  } catch (_) {
    // Silent catch - if we can't check pathname, continue with init
  }

  if (typeof window.getStatusColor === 'function') {
    const fnStr = window.getStatusColor.toString();
    // Only save if it's from color-scheme-system.js
    // The function from color-scheme-system.js is simple: return STATUS_COLORS[status] || STATUS_COLORS.active;
    // It does NOT contain 'window.getStatusColor' check or '_originalGetStatusColor'
    if (fnStr.includes('STATUS_COLORS[status]') && 
        !fnStr.includes('window.getStatusColor') && 
        !fnStr.includes('_originalGetStatusColor') &&
        fnStr.length < 100) { // Simple function, not a wrapper
      _originalGetStatusColor = window.getStatusColor;
    }
  }
  if (typeof window.getStatusBackgroundColor === 'function') {
    const fnStr = window.getStatusBackgroundColor.toString();
    // color-scheme-system.js version is simple and uses getStatusColor
    if (fnStr.includes('getStatusColor') && 
        !fnStr.includes('window.getStatusBackgroundColor') && 
        !fnStr.includes('_originalGetStatusBackgroundColor')) {
      _originalGetStatusBackgroundColor = window.getStatusBackgroundColor;
    }
  }
  if (typeof window.getStatusTextColor === 'function') {
    const fnStr = window.getStatusTextColor.toString();
    if (fnStr.includes('getStatusColor') && 
        !fnStr.includes('window.getStatusTextColor') && 
        !fnStr.includes('_originalGetStatusTextColor')) {
      _originalGetStatusTextColor = window.getStatusTextColor;
    }
  }
  if (typeof window.getStatusBorderColor === 'function') {
    const fnStr = window.getStatusBorderColor.toString();
    if (fnStr.includes('getStatusColor') && 
        !fnStr.includes('window.getStatusBorderColor') && 
        !fnStr.includes('_originalGetStatusBorderColor')) {
      _originalGetStatusBorderColor = window.getStatusBorderColor;
    }
  }
})();

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
  'trading_account', // חשבונות מסחר
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
  // ברירות מחדל - תואמות לפרופיל ברירת המחדל במסד נתונים
  'trade': '#26baac',
  'trade_plan': '#8e44ad',
  'execution': '#2c3e50',
  'trading_account': '#5499c7',
  'cash_flow': '#d4a574',
  'ticker': '#229954',
  'alert': '#e67e22',
  'note': '#a29bfe',
  'constraint': '#6c757d',
  'design': '#495057',
  'research': '#343a40',
  'preference': '#adb5bd',
  'import_session': '#d4a574', // שימוש בצבע של cash_flow (תזרימי מזומן)
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
  'trading_account': 'rgba(27, 11, 117, 0.1)',
  'cash_flow': 'rgba(32, 201, 151, 0.1)',
  'ticker': 'rgba(1, 145, 147, 0.1)',
  'alert': 'rgba(255, 156, 5, 0.1)',
  'note': 'rgba(111, 66, 193, 0.1)',
  'constraint': 'rgba(108, 117, 125, 0.1)',
  'design': 'rgba(73, 80, 87, 0.1)',
  'research': 'rgba(52, 58, 64, 0.1)',
  'preference': 'rgba(173, 181, 189, 0.1)',
  'import_session': 'rgba(32, 201, 151, 0.1)', // שימוש בצבע רקע של cash_flow (תזרימי מזומן)
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
  // ברירות מחדל - תואמות לפרופיל ברירת המחדל במסד נתונים
  'trade': '#1d8b7d',
  'trade_plan': '#6c358f',
  'execution': '#1a2633',
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

/**
 * צבעי Light של ישויות - נטענים מההעדפות
 * Entity Light colors - loaded from preferences
 */
let ENTITY_LIGHT_COLORS = {
  // ברירות מחדל
  'trade': '#bee5eb',
  'trade_plan': '#ba68c8',
  'execution': '#8e44ad',
  'account': '#34ce57',
  'cash_flow': '#bee5eb',
  'ticker': '#20c997',
  'alert': '#ffb74d',
  'note': '#90a4ae',
  'constraint': '#f8f9fa',
  'design': '#e9ecef',
  'research': '#dee2e6',
  'preference': '#ced4da',
};

/**
 * צבעי Dark של ישויות - נטענים מההעדפות
 * Entity Dark colors - loaded from preferences
 */
let ENTITY_DARK_COLORS = {
  // ברירות מחדל
  'trade': '#004085',
  'trade_plan': '#7b1fa2',
  'execution': '#5a2d91',
  'account': '#1e7e34',
  'cash_flow': '#138496',
  'ticker': '#138496',
  'alert': '#f57c00',
  'note': '#455a64',
  'constraint': '#495057',
  'design': '#343a40',
  'research': '#212529',
  'preference': '#6c757d',
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
    light: 'rgba(142, 68, 173, 0.1)',
    medium: '#8e44ad',
    border: 'rgba(142, 68, 173, 0.3)'
  },
  'investment': {
    light: 'rgba(40, 116, 166, 0.1)',
    medium: '#2874a6',
    border: 'rgba(40, 116, 166, 0.3)'
  },
  'passive': {
    light: 'rgba(22, 160, 133, 0.1)',
    medium: '#16a085',
    border: 'rgba(22, 160, 133, 0.3)'
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
  }  // scalping נשאר כברירת מחדל - אין בפרופיל
};

// ===== DYNAMIC COLOR LOADING =====
// טעינת צבעים דינמית

// ⚠️ NOTICE: Color-related functions have been consolidated into color-scheme-system.js
// These functions (loadEntityColorsFromPreferences, generateAndApplyEntityCSS, etc.) 
// are now in color-scheme-system.js to avoid duplication.
// This follows Rule #1: Use Existing General Systems
// Please use the exported functions from color-scheme-system.js:
// - window.loadEntityColorsFromPreferences
// - window.generateAndApplyEntityCSS
// - window.applyEntityColorsToHeaders
// - window.isWarningModal
// - window.getMainHeaderOpacityHex
// - window.getSubHeaderOpacityHex

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
 * ⚠️ DEPRECATED: This function is kept for backward compatibility only
 * Real implementation is in color-scheme-system.js
 * 
 * @param {Object} preferences - העדפות המשתמש
 */
// REMOVED: loadStatusColorsFromPreferences - DEPRECATED, empty function, use color-scheme-system.js instead
// function _REMOVED_loadStatusColorsFromPreferences(preferences) {
//   // הסרנו את preferences.statusColors כי הוא לא קיים במערכת ההעדפות
//   // במקום זה משתמשים במשתנים ספציפיים
// }

// REMOVED: loadInvestmentTypeColorsFromPreferences - DEPRECATED, empty function, use color-scheme-system.js instead
// function _REMOVED_loadInvestmentTypeColorsFromPreferences(preferences) {
//   // הסרנו את preferences.investmentTypeColors כי הוא לא קיים במערכת ההעדפות
//   // במקום זה משתמשים במשתנים ספציפיים
// }

/**
 * טעינת כל הצבעים מההעדפות
 * Load all colors from preferences
 * 
 * ⚠️ DEPRECATED: This function is kept for backward compatibility only
 * Real implementation is in color-scheme-system.js
 * 
 * @param {Object} preferences - העדפות המשתמש
 */
function loadAllColorsFromPreferences(preferences) {
  // Use implementation from color-scheme-system.js if available
  if (typeof window.loadEntityColorsFromPreferences === 'function') {
    window.loadEntityColorsFromPreferences(preferences);
  }
  // Status and investment type color loading is handled by updateCSSVariablesFromPreferences
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
    // רק מהעדפות - בלי fallbacks קבועים!
    return '';
  }

  const normalizedType = entityType.toLowerCase().trim();
  // רק מהעדפות - בלי fallbacks קבועים!
  return ENTITY_COLORS[normalizedType] || '';
}

/**
 * קבלת צבע סטטוס
 * Get status color
 * 
 * @param {string} status - סטטוס
 * @param {string} intensity - עוצמה (light, medium, dark, border)
 * @returns {string} - קוד צבע
 * 
 * NOTE: This function is DEPRECATED - use window.getStatusColor from color-scheme-system.js directly
 * This wrapper uses the saved original function to avoid circular reference
 */
function getStatusColor(status, intensity = 'medium') {
  // Use saved original function from color-scheme-system.js (saved before this script loads)
  if (_originalGetStatusColor && typeof _originalGetStatusColor === 'function') {
    return _originalGetStatusColor(status, intensity);
  }
  // Fallback: use window.getStatusColor if it exists and is NOT this function
  if (typeof window.getStatusColor === 'function') {
    // Check if window.getStatusColor is the original from color-scheme-system.js
    // (it should contain STATUS_COLORS[status] but NOT window.getStatusColor check)
    const fnStr = window.getStatusColor.toString();
    if (fnStr.includes('STATUS_COLORS[status]') && !fnStr.includes('_originalGetStatusColor')) {
      return window.getStatusColor(status, intensity);
    }
  }
  // Final fallback to local implementation (should not happen in production)
  if (!status) {
    return STATUS_COLORS['closed']?.[intensity] || '';
  }
  const normalizedStatus = status.toLowerCase().trim();
  return STATUS_COLORS[normalizedStatus]?.[intensity] || STATUS_COLORS['closed']?.[intensity] || '';
}

/**
 * קבלת צבע רקע סטטוס
 * Get status background color
 * 
 * @param {string} status - סטטוס
 * @returns {string} - קוד צבע רקע
 */
function getStatusBackgroundColor(status) {
  // Use centralized Color Scheme System if available
  // IMPORTANT: Use saved original function to avoid circular reference
  if (_originalGetStatusBackgroundColor) {
    return _originalGetStatusBackgroundColor(status);
  }
  // Fallback to local implementation (should not happen in production)
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
  // Use centralized Color Scheme System if available
  // IMPORTANT: Use saved original function to avoid circular reference
  if (_originalGetStatusTextColor) {
    return _originalGetStatusTextColor(status);
  }
  // Fallback to local implementation (should not happen in production)
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
  // Use centralized Color Scheme System if available
  // IMPORTANT: Use saved original function to avoid circular reference
  if (_originalGetStatusBorderColor) {
    return _originalGetStatusBorderColor(status);
  }
  // Fallback to local implementation (should not happen in production)
  return getStatusColor(status, 'border');
}

/**
 * קבלת צבע רקע לישות
 * Get background color for entity
 *
 * @param {string} entityType - סוג הישות
 * @returns {string} קוד הצבע
 */
// Save reference to centralized function before defining local function
// IMPORTANT: Save the reference immediately to avoid circular dependency
// If window.getEntityBackgroundColor is not yet defined, we'll check it at call time
let _originalGetEntityBackgroundColor = null;

// Initialize the reference - use a getter function to check at call time, not definition time
function _getOriginalGetEntityBackgroundColor() {
  if (!_originalGetEntityBackgroundColor && typeof window.getEntityBackgroundColor === 'function') {
    // Store the reference only once to avoid recursion
    const original = window.getEntityBackgroundColor;
    // Verify it's not pointing to this function to prevent infinite recursion
    if (original !== getEntityBackgroundColor) {
      _originalGetEntityBackgroundColor = original;
    }
  }
  return _originalGetEntityBackgroundColor;
}

function getEntityBackgroundColor(entityType) {
  // Use centralized Color Scheme System if available (use saved reference to avoid recursion)
  const originalFn = _getOriginalGetEntityBackgroundColor();
  if (originalFn) {
    return originalFn(entityType);
  }
  // Fallback to local implementation (should not happen in production)
  if (!entityType) {
    return '';
  }
  const normalizedType = entityType.toLowerCase().trim();
  return ENTITY_BACKGROUND_COLORS[normalizedType] || '';
}

/**
 * קבלת צבע טקסט לישות
 * Get text color for entity
 *
 * @param {string} entityType - סוג הישות
 * @returns {string} קוד הצבע
 */
// Save reference to centralized function before defining local function
const _originalGetEntityTextColor = typeof window.getEntityTextColor === 'function' 
  ? window.getEntityTextColor 
  : null;

function getEntityTextColor(entityType) {
  // Use centralized Color Scheme System if available (use saved reference to avoid recursion)
  if (_originalGetEntityTextColor) {
    return _originalGetEntityTextColor(entityType);
  }
  // Fallback to local implementation (should not happen in production)
  if (!entityType) {
    return '';
  }
  const normalizedType = entityType.toLowerCase().trim();
  return ENTITY_TEXT_COLORS[normalizedType] || '';
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
    // רק מהעדפות - בלי fallbacks קבועים!
    return '';
  }

  const normalizedType = entityType.toLowerCase().trim();
  // רק מהעדפות - בלי fallbacks קבועים!
  return ENTITY_BORDER_COLORS[normalizedType] || '';
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
    'trading_account': 'חשבון מסחר',
    'account': 'חשבון מסחר', // alias for backward compatibility
    'cash_flow': 'תזרים מזומנים',
    'ticker': 'טיקר',
    'alert': 'התראה',
    'note': 'הערה',
    'constraint': 'אילוץ',
    'design': 'עיצוב',
    'research': 'מחקר',
    'preference': 'העדפה',
    'position': 'פוזיציה'
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
    // רק מהעדפות - בלי fallbacks קבועים!
    return INVESTMENT_TYPE_COLORS['swing']?.[intensity] || '';
  }

  const normalizedType = investmentType.toLowerCase().trim();
  // רק מהעדפות - בלי fallbacks קבועים!
  return INVESTMENT_TYPE_COLORS[normalizedType]?.[intensity] || INVESTMENT_TYPE_COLORS['swing']?.[intensity] || '';
}

/**
 * קבלת צבע רקע לסוג השקעה
 * Get background color for investment type
 *
 * @param {string} investmentType - סוג ההשקעה
 * @returns {string} קוד הצבע
 */
function getInvestmentTypeBackgroundColorWrapper3(investmentType) {
  return getInvestmentTypeColor(investmentType, 'light');
}

/**
 * קבלת צבע רקע לסוג השקעה (תאימות לאחור) - removed duplicate
 * Get background color for investment type (backward compatibility)
 */

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
    'investment': 'trading_account',
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

  // Use centralized Color Scheme System instead of local constants
  const getEntityColorFn = (typeof window.getEntityColor === 'function') ? window.getEntityColor : null;
  const getEntityBackgroundColorFn = (typeof window.getEntityBackgroundColor === 'function') ? window.getEntityBackgroundColor : null;
  const getEntityBorderColorFn = (typeof window.getEntityBorderColor === 'function') ? window.getEntityBorderColor : null;
  const getEntityTextColorFn = (typeof window.getEntityTextColor === 'function') ? window.getEntityTextColor : null;
  const getMainHeaderOpacityHexFn = (typeof window.getMainHeaderOpacityHex === 'function') ? window.getMainHeaderOpacityHex : () => 'FF';
  const getSubHeaderOpacityHexFn = (typeof window.getSubHeaderOpacityHex === 'function') ? window.getSubHeaderOpacityHex : () => '4D';
  const validEntityTypes = (typeof window.VALID_ENTITY_TYPES !== 'undefined') ? window.VALID_ENTITY_TYPES : [];

  if (!getEntityColorFn || validEntityTypes.length === 0) {
    // System not available - return empty CSS
    return '';
  }

  validEntityTypes.forEach(type => {
    const color = getEntityColorFn(type) || '';
    const bgColor = getEntityBackgroundColorFn ? getEntityBackgroundColorFn(type) : '';
    const borderColor = getEntityBorderColorFn ? getEntityBorderColorFn(type) : '';
    const textColor = getEntityTextColorFn ? getEntityTextColorFn(type) : '';

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
  background-color: ${color}${getMainHeaderOpacityHexFn()};
  border-left: 4px solid ${color};
}

.entity-${type}-sub-header {
  background-color: ${color}${getSubHeaderOpacityHexFn()};
  border-left: 3px solid ${color};
}
`;
  });

  // מחלקות לסוגי השקעה (תאימות לאחור)
  const validInvestmentTypes = (typeof window.VALID_INVESTMENT_TYPES !== 'undefined') ? window.VALID_INVESTMENT_TYPES : [];
  validInvestmentTypes.forEach(type => {
    const entityType = getInvestmentTypeEntityType(type);
    const color = getEntityColorFn ? getEntityColorFn(entityType) : '';
    const bgColor = getEntityBackgroundColorFn ? getEntityBackgroundColorFn(entityType) : '';
    const borderColor = getEntityBorderColorFn ? getEntityBorderColorFn(entityType) : '';
    const textColor = getEntityTextColorFn ? getEntityTextColorFn(entityType) : '';

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

  // Use centralized Color Scheme System instead of local STATUS_COLORS
  const getStatusColorFn = (typeof window.getStatusColor === 'function') ? window.getStatusColor : null;
  const validStatuses = ['open', 'closed', 'cancelled']; // Common statuses
  
  if (!getStatusColorFn) {
    // System not available - return empty CSS
    return '';
  }

  validStatuses.forEach(status => {
    const light = getStatusColorFn(status, 'light') || '';
    const medium = getStatusColorFn(status, 'medium') || '';
    const border = getStatusColorFn(status, 'border') || '';
    
    if (!light || !medium || !border) return; // Skip if no color available
    
    const colors = { light, medium, border };

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
  background: linear-gradient(135deg, color-mix(in srgb, ${colors.medium} 15%, transparent) 0%, color-mix(in srgb, ${colors.medium} 10%, transparent) 100%);
  color: ${colors.medium};
  border: 1px solid color-mix(in srgb, ${colors.medium} 30%, transparent);
  box-shadow: 0 2px 8px color-mix(in srgb, ${colors.medium} 15%, transparent);
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
  background: linear-gradient(135deg, color-mix(in srgb, #ff6600 15%, transparent) 0%, color-mix(in srgb, #ff6600 10%, transparent) 100%);
  color: #ff6600;
  border: 1px solid color-mix(in srgb, #ff6600 30%, transparent);
  box-shadow: 0 2px 8px color-mix(in srgb, #ff6600 15%, transparent);
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
    // Use centralized Color Scheme System instead of local ENTITY_COLORS
    const color = (typeof window.getEntityColor === 'function') 
      ? window.getEntityColor(type) 
      : '';
    const label = (typeof window.getEntityLabel === 'function')
      ? window.getEntityLabel(type)
      : type;

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
  // Use centralized Color Scheme System instead of local NUMERIC_VALUE_COLORS
  const getNumericValueColorFn = (typeof window.getNumericValueColor === 'function') ? window.getNumericValueColor : null;
  const getNumericValueBackgroundColorFn = (typeof window.getNumericValueBackgroundColor === 'function') ? window.getNumericValueBackgroundColor : null;
  const getNumericValueBorderColorFn = (typeof window.getNumericValueBorderColor === 'function') ? window.getNumericValueBorderColor : null;
  
  if (!getNumericValueColorFn) {
    // System not available - return empty CSS
    return '';
  }

  const positiveMedium = getNumericValueColorFn(1, 'medium') || '';
  const positiveLight = getNumericValueBackgroundColorFn ? getNumericValueBackgroundColorFn(1) : '';
  const positiveBorder = getNumericValueBorderColorFn ? getNumericValueBorderColorFn(1) : '';
  
  const negativeMedium = getNumericValueColorFn(-1, 'medium') || '';
  const negativeLight = getNumericValueBackgroundColorFn ? getNumericValueBackgroundColorFn(-1) : '';
  const negativeBorder = getNumericValueBorderColorFn ? getNumericValueBorderColorFn(-1) : '';
  
  const zeroMedium = getNumericValueColorFn(0, 'medium') || '';
  const zeroLight = getNumericValueBackgroundColorFn ? getNumericValueBackgroundColorFn(0) : '';
  const zeroBorder = getNumericValueBorderColorFn ? getNumericValueBorderColorFn(0) : '';

  const css = `
        /* ערכים חיוביים */
        .numeric-value-positive {
            color: ${positiveMedium};
            background-color: ${positiveLight};
            border-color: ${positiveBorder};
        }
        
        .numeric-value-positive.text-only {
            color: ${positiveMedium};
        }
        
        .numeric-value-positive.background-only {
            background-color: ${positiveLight};
        }
        
        .numeric-value-positive.border-only {
            border-color: ${positiveBorder};
        }
        
        /* ערכים שליליים */
        .numeric-value-negative {
            color: ${negativeMedium};
            background-color: ${negativeLight};
            border-color: ${negativeBorder};
        }
        
        .numeric-value-negative.text-only {
            color: ${negativeMedium};
        }
        
        .numeric-value-negative.background-only {
            background-color: ${negativeLight};
        }
        
        .numeric-value-negative.border-only {
            border-color: ${negativeBorder};
        }
        
        /* ערך אפס */
        .numeric-value-zero {
            color: ${zeroMedium};
            background-color: ${zeroLight};
            border-color: ${zeroBorder};
        }
        
        .numeric-value-zero.text-only {
            color: ${zeroMedium};
        }
        
        .numeric-value-zero.background-only {
            background-color: ${zeroLight};
        }
        
        .numeric-value-zero.border-only {
            border-color: ${zeroBorder};
        }
    `;

  return css;
}

// REMOVED: updateNumericValueColors - not used, not exported to window
// function _REMOVED_updateNumericValueColors(newColors) {
//   // עדכון הצבעים הגלובליים
//   Object.assign(NUMERIC_VALUE_COLORS, newColors);
//
//   // יצירת CSS חדש
//   const newCSS = generateNumericValueCSS();
//
//   // עדכון או יצירת style element
//   let styleElement = document.getElementById('numeric-value-colors');
//   if (!styleElement) {
//     styleElement = document.createElement('style');
//     styleElement.id = 'numeric-value-colors';
//     document.head.appendChild(styleElement);
//   }
//
//   styleElement.textContent = newCSS;
// }

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
    // איפוס הצבעים לברירת המחדל - תואמות לפרופיל ברירת המחדל במסד נתונים
    Object.assign(ENTITY_COLORS, {
      'trade': '#26baac',
      'trade_plan': '#8e44ad',
      'execution': '#2c3e50',
      'account': '#5499c7',
      'cash_flow': '#d4a574',
      'ticker': '#229954',
      'alert': '#e67e22',
      'note': '#a29bfe',
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

    // איפוס צבעי טקסט - תואמות לפרופיל ברירת המחדל במסד נתונים
    Object.assign(ENTITY_TEXT_COLORS, {
      'trade': '#1d8b7d',
      'trade_plan': '#6c358f',
      'execution': '#1a2633',
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

    // איפוס צבעי גבול - תואמות לפרופיל ברירת המחדל במסד נתונים
    Object.assign(ENTITY_BORDER_COLORS, {
      'trade': '#26baac',
      'trade_plan': '#8e44ad',
      'execution': '#2c3e50',
      'account': '#5499c7',
      'cash_flow': '#d4a574',
      'ticker': '#229954',
      'alert': '#e67e22',
      'note': '#a29bfe',
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
  // Use centralized Color Scheme System instead of local functions
  const getNumericColor = (typeof window.getNumericValueColor === 'function') 
    ? window.getNumericValueColor 
    : null;
  const getEntityColorFn = (typeof window.getEntityColor === 'function') 
    ? window.getEntityColor 
    : null;
  
  return {
    positive: getNumericColor ? getNumericColor(1, 'medium') : '',
    negative: getNumericColor ? getNumericColor(-1, 'medium') : '',
    secondary: getEntityColorFn ? getEntityColorFn('preference') : '',
    success: getEntityColorFn ? getEntityColorFn('account') : '',
    warning: getEntityColorFn ? getEntityColorFn('alert') : '',
    info: getEntityColorFn ? getEntityColorFn('execution') : '',
    primary: getEntityColorFn ? getEntityColorFn('trade') : '',
  };
}

/**
 * קבלת צבעים מוכנים לשימוש בטבלאות עם ברירות מחדל
 * Get ready-to-use colors for tables with fallbacks
 * @returns {Object} אובייקט עם צבעים מוכנים לשימוש
 */
function getTableColorsWithFallbacks() {
  const colors = getTableColors();

  // NO hardcoded fallbacks - return empty strings if system unavailable
  // The centralized Color Scheme System will handle colors from preferences
  return {
    positive: colors.positive || '',
    negative: colors.negative || '',
    secondary: colors.secondary || '',
    success: colors.success || '',
    warning: colors.warning || '',
    info: colors.info || '',
    primary: colors.primary || '',
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
    primaryColor: '#26baac',        // כחול ראשי - כותרות וכפתורים
    chartPrimaryColor: '#1a8f83',   // גוון כהה של הצבע הראשי לגרפים
    successColor: '#28a745',        // ירוק - הצלחה, רווחים
    warningColor: '#ffc107',        // צהוב - אזהרות, ביצועים בינוניים
    dangerColor: '#dc3545',         // אדום - שגיאות, הפסדים
    infoColor: '#26baac',           // צבע מידע - מותאם לזהות המותג
    secondaryColor: '#fc5a06',      // כתום - נתונים משניים
    
    // צבעי ישויות לגרפים (תואמים לפרופיל ברירת המחדל במסד נתונים)
    entityTradeColor: '#26baac',    // טורקיז - טריידים
    entityTradingAccountColor: '#5499c7',  // כחול בהיר - חשבונות
    entityExecutionColor: '#2c3e50', // כחול כהה - ביצועים
    entityAlertColor: '#e67e22',    // כתום - התראות
    entityTickerColor: '#229954',   // ירוק - טיקרים
    entityNoteColor: '#a29bfe',     // סגול בהיר - הערות
    
    // צבעי גרפים מיוחדים
    chartBackgroundColor: '#ffffff', // לבן - רקע גרפים
    chartTextColor: '#212529',       // כהה - טקסט גרפים
    chartGridColor: '#e9ecef',       // אפור בהיר - רשת גרפים
    chartBorderColor: '#dee2e6',     // אפור - גבול גרפים
    chartPointColor: '#26baac',      // טורקיז - נקודות גרפים
    chartSecondaryColor: '#fc5a06',  // כתום-אדום - צבע משני לגרפים
    
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
        // עדכון רק trading_account - אין עוד entity-account-color!
        document.documentElement.style.setProperty('--entity-trading-account-color', preferences.entityTradingAccountColor);
        document.documentElement.style.setProperty('--entity-trading-account-bg', preferences.entityTradingAccountColorLight || '#e6f7f7');
        document.documentElement.style.setProperty('--entity-trading-account-text', preferences.entityTradingAccountColorDark || '#1e7e80');
        document.documentElement.style.setProperty('--entity-trading-account-border', preferences.entityTradingAccountColorDark || '#1e7e80');
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
      
      if (preferences.entityPreferencesColor) {
        document.documentElement.style.setProperty('--entity-preference-color', preferences.entityPreferencesColor);
        document.documentElement.style.setProperty('--entity-preference-bg', preferences.entityPreferencesColorLight || 'rgba(173, 181, 189, 0.1)');
        document.documentElement.style.setProperty('--entity-preference-text', preferences.entityPreferencesColorDark || '#6c757d');
        document.documentElement.style.setProperty('--entity-preference-border', preferences.entityPreferencesColorDark || '#6c757d');
      }

      // עדכון צבעי גרפים
      if (preferences.chartPrimaryColor) {
        document.documentElement.style.setProperty('--chart-primary-color', preferences.chartPrimaryColor);
      }
      if (preferences.chartSecondaryColor) {
        document.documentElement.style.setProperty('--chart-secondary-color', preferences.chartSecondaryColor);
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
    if (preferences.backgroundColor) {
      document.documentElement.style.setProperty('--background-color', preferences.backgroundColor);
    }
    if (preferences.linkColor) {
      document.documentElement.style.setProperty('--link-color', preferences.linkColor);
      const linkHoverColor = darkenColor(preferences.linkColor, 12);
      document.documentElement.style.setProperty('--link-hover-color', linkHoverColor);
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
    // כל הצבעים רק מהעדפות - בלי fallbacks קבועים!
    if (preferences.entityPreferencesColor) {
      const prefRgb = hexToRgb(preferences.entityPreferencesColor);
      document.documentElement.style.setProperty('--entity-preference-color', preferences.entityPreferencesColor);
      document.documentElement.style.setProperty('--entity-preference-bg', preferences.entityPreferencesColorLight || (prefRgb ? `rgba(${prefRgb.r}, ${prefRgb.g}, ${prefRgb.b}, 0.1)` : ''));
      document.documentElement.style.setProperty('--entity-preference-text', preferences.entityPreferencesColorDark || (prefRgb ? darkenColor(preferences.entityPreferencesColor, 20) : ''));
      document.documentElement.style.setProperty('--entity-preference-border', prefRgb ? `rgba(${prefRgb.r}, ${prefRgb.g}, ${prefRgb.b}, 0.3)` : '');
    }
    if (preferences.entityResearchColor) {
      const rgb = hexToRgb(preferences.entityResearchColor);
      document.documentElement.style.setProperty('--entity-research-color', preferences.entityResearchColor);
      document.documentElement.style.setProperty('--entity-research-bg', preferences.entityResearchColorLight || (rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` : ''));
      document.documentElement.style.setProperty('--entity-research-text', preferences.entityResearchColorDark || (rgb ? darkenColor(preferences.entityResearchColor, 20) : ''));
      document.documentElement.style.setProperty('--entity-research-border', rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` : '');
    }
    if (preferences.entityDesignColor) {
      const rgb = hexToRgb(preferences.entityDesignColor);
      document.documentElement.style.setProperty('--entity-design-color', preferences.entityDesignColor);
      document.documentElement.style.setProperty('--entity-design-bg', preferences.entityDesignColorLight || (rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` : ''));
      document.documentElement.style.setProperty('--entity-design-text', preferences.entityDesignColorDark || (rgb ? darkenColor(preferences.entityDesignColor, 20) : ''));
      document.documentElement.style.setProperty('--entity-design-border', rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` : '');
    }
    if (preferences.entityConstraintColor) {
      const rgb = hexToRgb(preferences.entityConstraintColor);
      document.documentElement.style.setProperty('--entity-constraint-color', preferences.entityConstraintColor);
      document.documentElement.style.setProperty('--entity-constraint-bg', preferences.entityConstraintColorLight || (rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` : ''));
      document.documentElement.style.setProperty('--entity-constraint-text', preferences.entityConstraintColorDark || (rgb ? darkenColor(preferences.entityConstraintColor, 20) : ''));
      document.documentElement.style.setProperty('--entity-constraint-border', rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` : '');
    }
    if (preferences.entityDevelopmentColor) {
      const rgb = hexToRgb(preferences.entityDevelopmentColor);
      document.documentElement.style.setProperty('--entity-development-color', preferences.entityDevelopmentColor);
      document.documentElement.style.setProperty('--entity-development-bg', preferences.entityDevelopmentColorLight || (rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` : ''));
      document.documentElement.style.setProperty('--entity-development-text', preferences.entityDevelopmentColorDark || (rgb ? darkenColor(preferences.entityDevelopmentColor, 20) : ''));
      document.documentElement.style.setProperty('--entity-development-border', rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` : '');
    }
    if (preferences.entityInfoColor) {
      const rgb = hexToRgb(preferences.entityInfoColor);
      document.documentElement.style.setProperty('--entity-info-color', preferences.entityInfoColor);
      document.documentElement.style.setProperty('--entity-info-bg', preferences.entityInfoColorLight || (rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` : ''));
      document.documentElement.style.setProperty('--entity-info-text', preferences.entityInfoColorDark || (rgb ? darkenColor(preferences.entityInfoColor, 20) : ''));
      document.documentElement.style.setProperty('--entity-info-border', rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.3)` : '');
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
    // CRITICAL: Prevent infinite recursion - if preferences are already being loaded, use currentPreferences
    if (window.__loadUserPreferencesInflight && window.__loadUserPreferencesInflight.size > 0) {
      // Preferences are being loaded - use currentPreferences if available
      if (window.currentPreferences && Object.keys(window.currentPreferences).length > 0) {
        updateCSSVariablesFromPreferences(window.currentPreferences);
        return window.currentPreferences;
      }
      return {};
    }
    
    // CRITICAL: Prevent infinite recursion - if getPreference is in progress, use currentPreferences
    if (window.__GET_PREFERENCE_IN_PROGRESS__) {
      if (window.currentPreferences && Object.keys(window.currentPreferences).length > 0) {
        updateCSSVariablesFromPreferences(window.currentPreferences);
        return window.currentPreferences;
      }
      return {};
    }

    // Use currentPreferences if available to avoid unnecessary API calls
    if (window.currentPreferences && Object.keys(window.currentPreferences).length > 0) {
      updateCSSVariablesFromPreferences(window.currentPreferences);
      return window.currentPreferences;
    }

    // Load from API only if not already loaded
    if (window.PreferencesData && typeof window.PreferencesData.loadAllPreferencesRaw === 'function') {
      const prefPayload = await window.PreferencesData.loadAllPreferencesRaw({ force: false });
      if (prefPayload && prefPayload.preferences) {
        const prefs = prefPayload.preferences;

        // DEBUG: Log what colors were loaded
        if (window.DEBUG_MODE) {
          console.log('🎨 Color preferences loaded:', {
            primary: prefs.primary_color,
            secondary: prefs.secondary_color,
            chartSecondary: prefs.chartSecondaryColor,
            allPrefs: Object.keys(prefs).filter(k => k.includes('color'))
          });
        }
        
        // עדכון CSS Variables (only if prefs not empty)
        if (Object.keys(prefs).length > 0) {
          updateCSSVariablesFromPreferences(prefs);
        }
        
        // עדכון כותרות עם הצבעים החדשים
        const bodyClass = document.body.className;
        if (bodyClass) {
          const entityType = bodyClass.split(' ').find(cls => 
            ['tickers-page', 'trades-page', 'accounts-page', 'trading-accounts-page', 'alerts-page', 'cash-flows-page', 'notes-page', 'executions-page', 'trade-plans-page', 'preferences-page'].includes(cls)
          );
          
          if (entityType) {
            let entity = entityType.replace('-page', '').replace('tickers', 'ticker');
            // תיקון שמות ישויות לפורמט יחיד
            if (entity === 'preferences') entity = 'preference';
            else if (entity === 'cash-flows') entity = 'cash_flow';
            else if (entity === 'trade-plans') entity = 'trade_plan';
            else if (entity === 'trading-accounts' || entity === 'accounts') entity = 'trading_account';
            if (ENTITY_COLORS[entity] && typeof window.applyEntityColorsToHeaders === 'function') {
              window.applyEntityColorsToHeaders(entity);
            }
          }
        }
        
        window.colorPreferencesLoaded = true;
        return prefs;
      }
    }
    
    // Return empty object if no preferences loaded
    return {};
  } catch (error) {
    // CRITICAL: Do NOT use Logger here to prevent infinite recursion
    if (window.DEBUG_MODE) {
      console.error('❌ שגיאה בטעינת הגדרות צבע:', error);
    }
    return {};
  }
}

/**
 * Load ALL user preferences and apply to UI (colors + non-CSS)
 * Supports force reload bypassing caches
 */
// Deduplication registry for loadUserPreferences
if (!window.__loadUserPreferencesInflight) {
  window.__loadUserPreferencesInflight = new Map();
}

window.loadUserPreferences = async function loadUserPreferences(options = {}) {
  const { force = false, source = 'manual' } = options || {};
  
  // High-level deduplication: prevent duplicate calls with same params
  const dedupeKey = `loadUserPreferences:force${force}`;
  if (window.__loadUserPreferencesInflight.has(dedupeKey)) {
    console.debug('⏭️ loadUserPreferences deduplicated - returning existing promise', { source, dedupeKey });
    return await window.__loadUserPreferencesInflight.get(dedupeKey);
  }
  
  const loadPromise = (async () => {
    try {
      // Use centralized data service
      const prefPayload = await (window.PreferencesData?.loadAllPreferencesRaw?.({ force }) || Promise.resolve(null));
      if (!prefPayload) {
        console.warn('⚠️ PreferencesData.loadAllPreferencesRaw returned empty payload');
        return false;
      }
      
      // Update PreferencesCore with the profile ID from server
      if (window.PreferencesCore && prefPayload?.resolvedProfileId !== undefined) {
        window.PreferencesCore.currentProfileId = prefPayload.resolvedProfileId;
        window.Logger?.debug?.('✅ Updated PreferencesCore.currentProfileId', { resolvedProfileId: prefPayload.resolvedProfileId, page: 'ui-advanced' });
      }
      
      const prefsRaw = prefPayload?.preferences || {};
      let prefs = { ...prefsRaw };

      // Merge colors from alternative shapes/groups if missing
      const inlineColors = prefsRaw?.colors || {};
      if (!prefs.primaryColor && (inlineColors.primaryColor || inlineColors.primary)) {
        prefs.primaryColor = inlineColors.primaryColor || inlineColors.primary;
      }
      if (!prefs.secondaryColor && (inlineColors.secondaryColor || inlineColors.secondary)) {
        prefs.secondaryColor = inlineColors.secondaryColor || inlineColors.secondary;
      }
      if (!prefs.primaryColor || !prefs.secondaryColor) {
        try {
          if (window.PreferencesData && typeof window.PreferencesData.loadPreferenceGroup === 'function') {
            const group = await window.PreferencesData.loadPreferenceGroup({ groupName: 'colors' });
            const g = group?.preferences || {};
            if (!prefs.primaryColor && (g.primaryColor || g.primary)) {
              prefs.primaryColor = g.primaryColor || g.primary;
            }
            if (!prefs.secondaryColor && (g.secondaryColor || g.secondary)) {
              prefs.secondaryColor = g.secondaryColor || g.secondary;
            }
          }
        } catch {}
      }

      // store latest prefs globally for listeners
      window.__latestPrefs = prefs;
      window.currentPreferences = prefs;

      // Load entity colors from preferences - CRITICAL for dynamic colors
      if (typeof window.loadEntityColorsFromPreferences === 'function') {
        window.loadEntityColorsFromPreferences(prefs);
      }
      
      // Generate and apply entity CSS after loading colors
      if (typeof window.generateAndApplyEntityCSS === 'function') {
        window.generateAndApplyEntityCSS();
      }

      // ensure primary/secondary also mapped from common keys if present
      try {
        if (prefs.primaryColor) {
          document.documentElement.style.setProperty('--primary-color', prefs.primaryColor);
          document.documentElement.style.setProperty('--color-primary', prefs.primaryColor);
        }
        if (prefs.secondaryColor) {
          document.documentElement.style.setProperty('--secondary-color', prefs.secondaryColor);
          document.documentElement.style.setProperty('--color-secondary', prefs.secondaryColor);
        }
      } catch {}

      // apply CSS variables immediately without layout flash
      requestAnimationFrame(() => {
        try { updateCSSVariablesFromPreferences(prefs); } catch {}
        try {
          // Ensure dynamic variables required by components are always defined
          const docStyle = document.documentElement.style;

          // 1) Status variables (used in badges/status CSS)
          const statusOpen = prefs.statusOpenColor || getComputedStyle(document.documentElement).getPropertyValue('--user-status-open-color') || '#28a745';
          const statusClosed = prefs.statusClosedColor || getComputedStyle(document.documentElement).getPropertyValue('--user-status-closed-color') || '#6c757d';
          const statusCancelled = prefs.statusCancelledColor || getComputedStyle(document.documentElement).getPropertyValue('--user-status-cancelled-color') || '#dc3545';
          const statusPending = prefs.warningColor || getComputedStyle(document.documentElement).getPropertyValue('--warning-color') || '#ffc107';
          docStyle.setProperty('--status-open-color', String(statusOpen).trim());
          docStyle.setProperty('--status-closed-color', String(statusClosed).trim());
          docStyle.setProperty('--status-cancelled-color', String(statusCancelled).trim());
          docStyle.setProperty('--status-pending-color', String(statusPending).trim());

          // 2) Numeric variables (positive/negative/zero) used by _badges-status.css
          const numPos = (prefs.valuePositiveColor || '#28a745').trim();
          const numNeg = (prefs.valueNegativeColor || '#dc3545').trim();
          const numZero = (prefs.valueNeutralColor || '#6c757d').trim();

          const pRgb = hexToRgb(numPos) || { r: 40, g: 167, b: 69 };
          const nRgb = hexToRgb(numNeg) || { r: 220, g: 53, b: 69 };
          const zRgb = hexToRgb(numZero) || { r: 108, g: 117, b: 125 };

          docStyle.setProperty('--numeric-positive-medium', numPos);
          docStyle.setProperty('--numeric-positive-light', `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.1)`);
          docStyle.setProperty('--numeric-positive-border', `rgba(${pRgb.r}, ${pRgb.g}, ${pRgb.b}, 0.3)`);

          docStyle.setProperty('--numeric-negative-medium', numNeg);
          docStyle.setProperty('--numeric-negative-light', `rgba(${nRgb.r}, ${nRgb.g}, ${nRgb.b}, 0.1)`);
          docStyle.setProperty('--numeric-negative-border', `rgba(${nRgb.r}, ${nRgb.g}, ${nRgb.b}, 0.3)`);

          docStyle.setProperty('--numeric-zero-color', numZero);
          docStyle.setProperty('--numeric-zero-light', `rgba(${zRgb.r}, ${zRgb.g}, ${zRgb.b}, 0.1)`);
          docStyle.setProperty('--numeric-zero-border', `rgba(${zRgb.r}, ${zRgb.g}, ${zRgb.b}, 0.3)`);

          // 3) Entity aliases expected by some CSS (e.g. --entity-trade)
          // NO hardcoded fallbacks - all colors must come from preferences!
          const getEntityColorFromPrefs = (prefKey, cssVarName) => {
            if (prefs[prefKey]) return prefs[prefKey];
            const cssValue = getComputedStyle(document.documentElement).getPropertyValue(cssVarName).trim();
            return cssValue || '';
          };
          
          const entityMap = {
            trade: getEntityColorFromPrefs('entityTradeColor', '--entity-trade-color'),
            trade_plan: getEntityColorFromPrefs('entityTradePlanColor', '--entity-trade-plan-color'),
            execution: getEntityColorFromPrefs('entityExecutionColor', '--entity-execution-color'),
            account: getEntityColorFromPrefs('entityTradingAccountColor', '--entity-trading-account-color'),
            trading_account: getEntityColorFromPrefs('entityTradingAccountColor', '--entity-trading-account-color'),
            cash_flow: getEntityColorFromPrefs('entityCashFlowColor', '--entity-cash-flow-color'),
            ticker: getEntityColorFromPrefs('entityTickerColor', '--entity-ticker-color'),
            alert: getEntityColorFromPrefs('entityAlertColor', '--entity-alert-color'),
            note: getEntityColorFromPrefs('entityNoteColor', '--entity-note-color'),
            preference: getEntityColorFromPrefs('entityPreferencesColor', '--entity-preference-color'),
            research: getEntityColorFromPrefs('entityResearchColor', '--entity-research-color'),
            design: getEntityColorFromPrefs('entityDesignColor', '--entity-design-color'),
            constraint: getEntityColorFromPrefs('entityConstraintColor', '--entity-constraint-color'),
            development: getEntityColorFromPrefs('entityDevelopmentColor', '--entity-development-color'),
            info: getEntityColorFromPrefs('entityInfoColor', '--entity-info-color')
          };
          Object.entries(entityMap).forEach(([k, v]) => {
            const val = String(v).trim();
            // legacy underscore variable
            docStyle.setProperty(`--entity-${k}`, val);
            // dashed alias without suffix
            docStyle.setProperty(`--entity-${k.replace('_','-')}`, val);
            // ensure explicit -color alias too
            if (k === 'cash_flow') docStyle.setProperty('--entity-cash-flow-color', val);
            if (k === 'trade_plan') docStyle.setProperty('--entity-trade-plan-color', val);
          });

          // 4) Synonyms used by some pages (cash_flows expects these)
          const getVar = (name) => (getComputedStyle(document.documentElement).getPropertyValue(name) || '').trim();
          const ensureVar = (target, value) => {
            if (!getVar(target) && value) {
              docStyle.setProperty(target, String(value).trim());
            }
          };
          // Map entity colors to page synonyms if missing
          ensureVar('--cash-flow-color', getVar('--entity-cash-flow-color') || getVar('--entity-cash-flow'));
          ensureVar('--trading-account-color', getVar('--entity-trading-account-color') || getVar('--entity-trading-account'));
          // Income/Expense derive from numeric positive/negative mediums
          ensureVar('--income-color', getVar('--numeric-positive-medium'));
          ensureVar('--expense-color', getVar('--numeric-negative-medium'));
          // Optional bg alias if used by CSS
          ensureVar('--cash-flow-bg-color', getVar('--entity-cash-flow-bg') || getVar('--numeric-zero-light'));
        } catch (e) {
          // silent
        }
      });

      // backward-compat hook
      try { if (typeof window.onPreferencesReload === 'function') window.onPreferencesReload(prefs); } catch {}

      // event for components to re-apply non-CSS prefs (toggles/flags)
      // CRITICAL: Only dispatch event if not already in progress to prevent infinite loops
      // This prevents: loadUserPreferences() → preferences:updated → loadColorPreferences() → loadUserPreferences() → ...
      if (!window.__loadUserPreferencesInflight || window.__loadUserPreferencesInflight.size === 0) {
        try {
          window.dispatchEvent(new CustomEvent('preferences:updated', {
            detail: { source, prefs }
          }));
        } catch {}
      }

      // Debug: log applied primary/secondary
      window.Logger?.debug?.('✅ loadUserPreferences complete', {
        source,
        primary: getComputedStyle(document.documentElement).getPropertyValue('--primary-color').trim(),
        secondary: getComputedStyle(document.documentElement).getPropertyValue('--secondary-color').trim()
      });

      return true;
    } catch (e) {
      console.error('❌ loadUserPreferences failed:', e);
      return false;
    } finally {
      window.__loadUserPreferencesInflight.delete(dedupeKey);
    }
  })();
  
  window.__loadUserPreferencesInflight.set(dedupeKey, loadPromise);
  return await loadPromise;
}



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
// ⚠️ NOTICE: All header styling functions have been moved to color-scheme-system.js
// Please use the exported functions from color-scheme-system.js instead

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
async function applyColorScheme(schemeName = 'disabled', customColors = null) {
  try {
    // Color scheme system disabled: rely solely on user preferences
    // No classes, no cache writes, no defaults
    // updateCSSVariablesFromPreferences called from loadUserPreferences instead (disabled mode)
    window.dispatchEvent(new CustomEvent('colorSchemeChanged', {
      detail: { scheme: 'disabled' }
    }));
  } catch (error) {
    console.error('❌ Error applying color scheme (disabled mode):', error);
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
    // Color scheme system disabled: simply ensure preferences are applied
    await applyColorScheme('disabled');
    return 'disabled';
  } catch (error) {
    console.error('❌ Error loading color scheme (disabled mode):', error);
    return 'disabled';
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
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
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
      // UnifiedCacheManager לא זמין - כלל 44 violation prevented
      console.error('UnifiedCacheManager לא זמין - לא ניתן לשמור סכמת צבעים (כלל 44 violation prevented)');
      return;
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
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
      const cachedScheme = await window.UnifiedCacheManager.get('colorScheme');
      return cachedScheme || 'light';
    } else {
      // UnifiedCacheManager לא זמין - כלל 44 violation prevented
      console.warn('UnifiedCacheManager לא זמין - מחזיר ערך ברירת מחדל (כלל 44 violation prevented)');
      return 'light';
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
function applyLightScheme() { /* disabled */ }

/**
 * Apply dark color scheme
 * יישום סכמת צבעים כהה
 */
function applyDarkScheme() { /* disabled */ }

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

// ⚠️ REMOVED: These color scheme management functions are exported by color-scheme-system.js
// Do NOT export them here to avoid conflicts with the centralized system
// - applyColorScheme, toggleColorScheme, loadColorScheme, saveColorScheme
// - getCurrentColorScheme, getAvailableColorSchemes
// Use the exports from color-scheme-system.js instead

// Export to global scope for backward compatibility
window.getInvestmentTypeColor = getInvestmentTypeColor;
// NOTE: getInvestmentTypeBackgroundColor is exported by color-scheme-system.js to avoid conflicts
// window.getInvestmentTypeBackgroundColor = getInvestmentTypeBackgroundColor;
window.getInvestmentTypeTextColor = getInvestmentTypeTextColor;
window.getInvestmentTypeBorderColor = getInvestmentTypeBorderColor;
window.createInvestmentTypeLegend = createInvestmentTypeLegend;

// Add missing getInventoryData function (placeholder - needs proper implementation)
window.getInventoryData = function() {
    console.warn('getInventoryData called but not implemented yet');
    return [];
};

// ⚠️ REMOVED: These functions are exported by color-scheme-system.js
// Do NOT export them here to avoid conflicts with the centralized system
// Use window.getEntityColor, window.getStatusColor, etc. from color-scheme-system.js instead

// Export only unique functions that don't exist in color-scheme-system.js
window.createEntityLegend = createEntityLegend;
window.generateEntityCSS = generateEntityCSS;
window.generateStatusCSS = generateStatusCSS;
window.generateInvestmentTypeCSS = generateInvestmentTypeCSS;
window.generateAndApplyStatusCSS = generateAndApplyStatusCSS;

// ⚠️ REMOVED: These functions are exported by color-scheme-system.js
// Do NOT export them here to avoid conflicts with the centralized system
// - updateEntityColor, updateEntityColorFromHex, resetEntityColors
// - updateCSSVariablesFromPreferences, loadColorPreferences, updateEntityColors
// Use the exports from color-scheme-system.js instead

// Export new utility functions
window.getTableColors = getTableColors;
window.getTableColorsWithFallbacks = getTableColorsWithFallbacks;
window.getColorPreferences = getColorPreferences;

// Export header styling functions
// ⚠️ NOTICE: These functions have been moved to color-scheme-system.js
// Use the exports from color-scheme-system.js instead

// ⚠️ REMOVED: These constants are exported by color-scheme-system.js
// Do NOT export them here to avoid conflicts with the centralized system
// Use window.VALID_ENTITY_TYPES, window.ENTITY_COLORS, etc. from color-scheme-system.js instead

// Export only constants that are unique to ui-advanced.js
window.VALID_INVESTMENT_TYPES = VALID_INVESTMENT_TYPES;
window.INVESTMENT_TYPE_LABELS = INVESTMENT_TYPE_LABELS;
window.INVESTMENT_TYPE_DESCRIPTIONS = INVESTMENT_TYPE_DESCRIPTIONS;

// ⚠️ REMOVED: window.colorSchemeSystem is exported by color-scheme-system.js
// Do NOT export it here to avoid conflicts with the centralized system
// Use window.colorSchemeSystem from color-scheme-system.js instead

// ===== DYNAMIC COLORS LOADER =====
/**
 * Load dynamic colors from preferences
 * טען צבעים דינמיים מהעדפות
 */
async function loadDynamicColors() {
  if (UI_ADVANCED_SKIP_PAGE) {
    // On the demo page we avoid applying schemes to prevent recursion/RangeError
    window.Logger?.debug?.('⏭️ Skipping loadDynamicColors on dynamic-colors-display page', { page: 'ui-advanced' });
    return true;
  }
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

} // end !UI_ADVANCED_SKIP_PAGE
