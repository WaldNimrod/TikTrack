/**
 * Button Tooltips Configuration - Centralized Tooltip Text Management
 * =====================================================================
 * 
 * This file contains all tooltip texts for buttons across all pages.
 * Format: { page: { buttonIdentifier: tooltipText } }
 * 
 * Button identifiers can be:
 * - CSS selector (e.g., 'button[data-button-type="ADD"][data-entity-type="note"]')
 * - Button type + context (e.g., 'ADD.note' for Add button in notes context)
 * - Specific ID or data attribute combination
 * 
 * Usage:
 * 1. Update this file with correct tooltip texts
 * 2. Run the tooltip update script to apply changes
 * 
 * Author: TikTrack Development Team
 * Version: 1.0
 * Last Updated: 2025-01-30
 */

const BUTTON_TOOLTIPS_CONFIG = {
  /**
   * Global Default Tooltips - Used when page-specific tooltip not found
   * These are fallback defaults for common button types
   */
  _defaults: {
    'ADD': 'הוסף',
    'EDIT': 'ערוך',
    'DELETE': 'מחק',
    'VIEW': 'צפה',
    'SAVE': 'שמור',
    'CANCEL': 'ביטול',
    'CLOSE': 'סגור',
    'LINK': 'קישור',
    'REFRESH': 'רענן',
    'EXPORT': 'ייצא',
    'IMPORT': 'ייבא',
    'SEARCH': 'חיפוש',
    'FILTER': 'פילטר',
    'SORT': 'מיון',
    'TOGGLE': 'הצג/הסתר',
    'MENU': 'תפריט',
    'BACK': 'חזור',
    'DUPLICATE': 'שכפל',
    'ARCHIVE': 'ארכב',
    'RESTORE': 'שחזר',
    'APPROVE': 'אשר',
    'REJECT': 'דחה'
  },
  
  /**
   * Notes Page Tooltips
   */
  notes: {
    // Toggle buttons
    'TOGGLE.top-section': 'הצג או הסתר את אזור הסיכום',
    'TOGGLE.main-section': 'הצג או הסתר את טבלת ההערות',
    
    // Add button
    'ADD.note': 'הוסף הערה חדשה',
    'ADD.note-empty-state': 'הוסף הערה ראשונה למערכת',
    
    // Filter buttons
    'FILTER.all': 'הצג כל ההערות - כל סוגי הישויות',
    'FILTER.account': 'סינון לפי: חשבונות מסחר',
    'FILTER.trade': 'סינון לפי: טריידים',
    'FILTER.trade_plan': 'סינון לפי: תוכניות השקעה',
    'FILTER.ticker': 'סינון לפי: טיקרים',
    
    // Sort buttons
    'SORT.linked-object': 'מיין לפי אובייקט מקושר',
    'SORT.content': 'מיין לפי תוכן ההערה',
    'SORT.created': 'מיין לפי תאריך יצירה',
    'SORT.updated': 'מיין לפי תאריך עדכון',
    
    // Actions menu
    'MENU.actions': 'פעולות',
    'VIEW.note': 'צפה בפרטי הערה',
    'EDIT.note': 'ערוך הערה',
    'DELETE.note': 'מחק הערה'
  },
  
  /**
   * Add more pages here as needed
   */
  // trades: { ... },
  // tickers: { ... },
  // etc.
};

/**
 * Get tooltip text for a button
 * @param {string} page - Page name (e.g., 'notes', 'trades')
 * @param {string} buttonType - Button type (e.g., 'ADD', 'EDIT', 'FILTER')
 * @param {string} context - Context identifier (e.g., 'note', 'account', 'linked-object')
 * @returns {string|null} Tooltip text or null if not found
 */
function getButtonTooltip(page, buttonType, context = '') {
  // First, try page-specific config
  const pageConfig = BUTTON_TOOLTIPS_CONFIG[page];
  if (pageConfig) {
    const key = context ? `${buttonType}.${context}` : buttonType;
    const pageTooltip = pageConfig[key];
    if (pageTooltip) {
      return pageTooltip;
    }
  }
  
  // Fallback to global defaults
  if (BUTTON_TOOLTIPS_CONFIG._defaults && BUTTON_TOOLTIPS_CONFIG._defaults[buttonType]) {
    return BUTTON_TOOLTIPS_CONFIG._defaults[buttonType];
  }
  
  return null;
}

/**
 * Get all tooltips for a page
 * @param {string} page - Page name
 * @returns {Object} Object with button identifiers as keys and tooltip texts as values
 */
function getPageTooltips(page) {
  return BUTTON_TOOLTIPS_CONFIG[page] || {};
}

// Export to window for global access
if (typeof window !== 'undefined') {
  window.BUTTON_TOOLTIPS_CONFIG = BUTTON_TOOLTIPS_CONFIG;
  window.getButtonTooltip = getButtonTooltip;
  window.getPageTooltips = getPageTooltips;
}

