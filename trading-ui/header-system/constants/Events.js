/**
 * Events Constants - Header System
 * קבועי אירועים למערכת הכותרת
 * 
 * @version 1.0.0
 * @lastUpdated $(date)
 * @author TikTrack Development Team
 */

const HEADER_EVENTS = {
  // אירועי מערכת
  SYSTEM_INIT: 'header:system:init',
  SYSTEM_READY: 'header:system:ready',
  SYSTEM_DESTROY: 'header:system:destroy',
  SYSTEM_ERROR: 'header:system:error',

  // אירועי תפריט
  MENU_OPEN: 'header:menu:open',
  MENU_CLOSE: 'header:menu:close',
  MENU_TOGGLE: 'header:menu:toggle',
  MENU_ITEM_CLICK: 'header:menu:item:click',
  MENU_ITEM_HOVER: 'header:menu:item:hover',
  MENU_ITEM_LEAVE: 'header:menu:item:leave',

  // אירועי פילטרים
  FILTER_OPEN: 'header:filter:open',
  FILTER_CLOSE: 'header:filter:close',
  FILTER_TOGGLE: 'header:filter:toggle',
  FILTER_CHANGE: 'header:filter:change',
  FILTER_RESET: 'header:filter:reset',
  FILTER_CLEAR: 'header:filter:clear',
  FILTER_APPLY: 'header:filter:apply',

  // אירועי פילטר ספציפיים
  STATUS_FILTER_CHANGE: 'header:filter:status:change',
  TYPE_FILTER_CHANGE: 'header:filter:type:change',
  ACCOUNT_FILTER_CHANGE: 'header:filter:account:change',
  DATE_FILTER_CHANGE: 'header:filter:date:change',
  SEARCH_FILTER_CHANGE: 'header:filter:search:change',

  // אירועי ניווט
  NAVIGATION_CHANGE: 'header:navigation:change',
  NAVIGATION_ITEM_CLICK: 'header:navigation:item:click',
  NAVIGATION_ITEM_ACTIVE: 'header:navigation:item:active',

  // אירועי מצב
  STATE_CHANGE: 'header:state:change',
  STATE_SAVE: 'header:state:save',
  STATE_LOAD: 'header:state:load',
  STATE_RESET: 'header:state:reset',

  // אירועי העדפות
  PREFERENCES_LOAD: 'header:preferences:load',
  PREFERENCES_SAVE: 'header:preferences:save',
  PREFERENCES_CHANGE: 'header:preferences:change',
  PREFERENCES_RESET: 'header:preferences:reset',

  // אירועי תרגום
  TRANSLATION_CHANGE: 'header:translation:change',
  LANGUAGE_CHANGE: 'header:language:change',

  // אירועי UI
  UI_UPDATE: 'header:ui:update',
  UI_SHOW: 'header:ui:show',
  UI_HIDE: 'header:ui:hide',
  UI_TOGGLE: 'header:ui:toggle',
  UI_RESIZE: 'header:ui:resize',

  // אירועי חשבונות
  ACCOUNTS_LOAD: 'header:accounts:load',
  ACCOUNTS_UPDATE: 'header:accounts:update',
  ACCOUNTS_ERROR: 'header:accounts:error',

  // אירועי שגיאות
  ERROR_NETWORK: 'header:error:network',
  ERROR_VALIDATION: 'header:error:validation',
  ERROR_PERMISSION: 'header:error:permission',
  ERROR_UNKNOWN: 'header:error:unknown'
};

// ייצוא למטרות בדיקה
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HEADER_EVENTS;
}

// הוספה לזירה הגלובלית
if (typeof window !== 'undefined') {
  window.HEADER_EVENTS = HEADER_EVENTS;
}

console.log('✅ HEADER_EVENTS נוצר ופועל');
