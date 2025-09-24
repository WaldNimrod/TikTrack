/**
 * Selectors Constants - Header System
 * קבועי סלקטורים למערכת הכותרת
 * 
 * @version 1.0.0
 * @lastUpdated $(date)
 * @author TikTrack Development Team
 */

const HEADER_SELECTORS = {
  // סלקטורים ראשיים
  HEADER_CONTAINER: '#unified-header',
  HEADER_TOP: '.header-top',
  HEADER_NAV: '.header-nav',
  HEADER_LOGO: '.logo-section',
  HEADER_FILTERS: '.header-filters',
  FILTERS_CONTAINER: '.filters-container',

  // סלקטורי תפריט
  MAIN_NAV: '.main-nav',
  NAV_LIST: '.tiktrack-nav-list',
  NAV_ITEM: '.tiktrack-nav-item',
  NAV_LINK: '.tiktrack-nav-link',
  DROPDOWN_MENU: '.tiktrack-dropdown-menu',
  DROPDOWN_ITEM: '.tiktrack-dropdown-item',
  DROPDOWN_ARROW: '.tiktrack-dropdown-arrow',

  // סלקטורי פילטרים
  FILTER_TOGGLE_BTN: '#filterToggleBtn',
  FILTER_TOGGLE_SECTION: '.filter-toggle-section',
  FILTER_GROUP: '.filter-group',
  FILTER_TOGGLE: '.filter-toggle',
  FILTER_MENU: '.filter-menu',
  FILTER_OPTION: '.filter-option',

  // סלקטורי פילטר ספציפיים
  STATUS_FILTER: '#statusFilter',
  STATUS_FILTER_MENU: '#statusFilterMenu',
  STATUS_FILTER_ITEM: '.status-filter-item',
  
  TYPE_FILTER: '#typeFilter',
  TYPE_FILTER_MENU: '#typeFilterMenu',
  TYPE_FILTER_ITEM: '.type-filter-item',
  
  ACCOUNT_FILTER: '#accountFilter',
  ACCOUNT_FILTER_MENU: '#accountFilterMenu',
  ACCOUNT_FILTER_ITEM: '.account-filter-item',
  
  DATE_FILTER: '#dateFilter',
  DATE_FILTER_MENU: '#dateFilterMenu',
  DATE_FILTER_ITEM: '.date-range-filter-item',
  
  SEARCH_FILTER: '#searchFilter',
  SEARCH_FILTER_INPUT: '.search-filter-input',
  SEARCH_CLEAR_BTN: '.search-clear-btn',

  // סלקטורי כפתורי פעולה
  RESET_BTN: '.reset-btn',
  CLEAR_BTN: '.clear-btn',
  ACTION_BUTTONS: '.action-buttons',

  // סלקטורי לוגו
  LOGO_IMAGE: '.logo-image',
  LOGO_TEXT: '.logo-text',
  LOGO_LINK: '.logo',

  // סלקטורי מצב
  ACTIVE_CLASS: '.active',
  SHOW_CLASS: '.show',
  COLLAPSED_CLASS: '.collapsed',
  SELECTED_CLASS: '.selected',

  // סלקטורי תת-תפריטים
  DROPDOWN_SUBMENU: '.dropdown-submenu',
  SUBMENU: '.submenu',
  LEVEL3_SUBMENU: '.level3-submenu',
  SUBMENU_ARROW: '.submenu-arrow',
  SUBMENU_TOGGLE: '.submenu-toggle',

  // סלקטורי טבלאות
  TABLE_CONTAINER: '[id$="Container"]',
  TRADES_CONTAINER: '#tradesContainer',
  TRADE_PLANS_CONTAINER: '#tradePlansContainer',
  ALERTS_CONTAINER: '#alertsContainer',
  EXECUTIONS_CONTAINER: '#executionsContainer',
  ACCOUNTS_CONTAINER: '#accountsContainer',
  TICKERS_CONTAINER: '#tickersContainer',
  CASH_FLOWS_CONTAINER: '#cashFlowsContainer',
  NOTES_CONTAINER: '#notesContainer',

  // סלקטורי עמודות טבלה
  TABLE_HEADER: 'thead th',
  TABLE_BODY: 'tbody',
  TABLE_ROW: 'tbody tr',
  TABLE_CELL: 'td',

  // סלקטורי הודעות
  NOTIFICATION: '.notification',
  ALERT: '.alert',
  MESSAGE: '.message',

  // סלקטורי טעינה
  LOADING: '.loading',
  SPINNER: '.spinner',
  PROGRESS: '.progress',

  // סלקטורי שגיאות
  ERROR: '.error',
  WARNING: '.warning',
  SUCCESS: '.success',

  // סלקטורי RTL
  RTL_ELEMENT: '[dir="rtl"]',
  LTR_ELEMENT: '[dir="ltr"]',

  // סלקטורי תגובה
  RESPONSIVE: '.responsive',
  MOBILE: '.mobile',
  DESKTOP: '.desktop',

  // סלקטורי נגישות
  ARIA_EXPANDED: '[aria-expanded]',
  ARIA_HIDDEN: '[aria-hidden]',
  ARIA_LABEL: '[aria-label]',
  ARIA_LABELLEDBY: '[aria-labelledby]',
  ARIA_DESCRIBEDBY: '[aria-describedby]',
  ARIA_CONTROLS: '[aria-controls]',
  ARIA_ACTIVEDESCENDANT: '[aria-activedescendant]',

  // סלקטורי מקלדת
  TABBABLE: '[tabindex]:not([tabindex="-1"])',
  FOCUSABLE: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',

  // סלקטורי סגנון
  HIDDEN: '.hidden',
  VISIBLE: '.visible',
  DISABLED: '.disabled',
  ENABLED: '.enabled'
};

// ייצוא למטרות בדיקה
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HEADER_SELECTORS;
}

// הוספה לזירה הגלובלית
if (typeof window !== 'undefined') {
  window.HEADER_SELECTORS = HEADER_SELECTORS;
}

console.log('✅ HEADER_SELECTORS נוצר ופועל');
