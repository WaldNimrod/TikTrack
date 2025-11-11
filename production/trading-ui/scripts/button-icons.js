/**
 * מערכת הכפתורים המרכזית - מידע בסיסי
 * Button System Core - Basic Information
 * 
 * קובץ זה מכיל רק את המידע הבסיסי הנדרש למערכת החדשה:
 * - מפת איקונים (BUTTON_ICONS)
 * - מפת טקסטים (BUTTON_TEXTS) 
 * - פונקציה לקבלת CSS class (getButtonClass)
 * 
 * כל הפונקציות הישנות (createButton, createEditButton וכו') הוסרו
 * והמערכת החדשה משתמשת ב-data-attributes
 */

const BUTTON_ICONS = {
  EDIT: '✏️',
  DELETE: '🗑️',
  CANCEL: '❌',
  LINK: '🔗',
  ADD: '➕',
  SAVE: '💾',
  CLOSE: '✖️',
  REFRESH: '🔄',
  EXPORT: '📤',
  IMPORT: '📥',
  SEARCH: '🔍',
  FILTER: '🔧',
  VIEW: '👁️',
  DUPLICATE: '📋',
  ARCHIVE: '📦',
  RESTORE: '📤',
  REACTIVATE: '✓',
  APPROVE: '✅',
  REJECT: '❌',
  PAUSE: '⏸️',
  PLAY: '▶️',
  STOP: '⏹️',
  READ: '✓',
  CHECK: '✓',
  TOGGLE: '▼',
  SORT: '↕️',
  COPY: '📋',
  MENU: '⚙️',
  BACK: '→' // חץ ימינה ל-RTL - מינימליסטי
};

const BUTTON_TEXTS = {
  EDIT: 'ערוך',
  DELETE: 'מחק',
  CANCEL: 'ביטול',
  LINK: 'קישור',
  ADD: 'הוסף',
  SAVE: 'שמור',
  CLOSE: 'סגור',
  REFRESH: 'רענן',
  EXPORT: 'ייצא',
  IMPORT: 'ייבא',
  SEARCH: 'חיפוש',
  FILTER: 'פילטר',
  VIEW: 'צפה',
  DUPLICATE: 'שכפל',
  ARCHIVE: 'ארכב',
  RESTORE: 'שחזר',
  REACTIVATE: 'הפעל מחדש',
  APPROVE: 'אשר',
  REJECT: 'דחה',
  PAUSE: 'השהה',
  PLAY: 'הפעל',
  STOP: 'עצור',
  READ: 'קראתי',
  CHECK: 'סמן',
  TOGGLE: 'הצג/הסתר',
  SORT: 'מיון',
  COPY: 'העתק',
  MENU: 'תפריט',
  BACK: 'חזור'
};

/**
 * פונקציה לקבלת CSS class לפי סוג כפתור
 * @param {string} type - סוג הכפתור
 * @returns {string} CSS class
 */
function getButtonClass(type) {
  const classMap = {
    EDIT: 'btn',
    DELETE: 'btn',
    CANCEL: 'btn',
    LINK: 'btn',
    ADD: 'btn',
    SAVE: 'btn',
    CLOSE: 'btn',
    REFRESH: 'btn',
    EXPORT: 'btn',
    IMPORT: 'btn',
    SEARCH: 'btn',
    FILTER: 'btn',
    VIEW: 'btn',
    DUPLICATE: 'btn',
    ARCHIVE: 'btn',
    RESTORE: 'btn',
    REACTIVATE: 'btn',
    APPROVE: 'btn',
    REJECT: 'btn',
    PAUSE: 'btn',
    PLAY: 'btn',
    STOP: 'btn',
    TOGGLE: 'btn',
    SORT: 'btn',
    COPY: 'btn',
    MENU: 'btn'
  };
  return classMap[type.toUpperCase()] || 'btn';
}

// Buttons that support entity color variants
window.ENTITY_VARIANT_BUTTONS = ['CLOSE', 'ADD', 'LINK', 'SAVE', 'MENU'];

window.supportsEntityVariant = function(buttonType) {
    return window.ENTITY_VARIANT_BUTTONS.includes(buttonType.toUpperCase());
};

// Size variants
window.BUTTON_SIZES = {
    SMALL: 'small',
    NORMAL: 'normal',
    LARGE: 'large',
    XLARGE: 'xlarge'
};

// Style variants
window.BUTTON_STYLES = {
    DEFAULT: 'default',
    NEGATIVE: 'negative'
};

// ייצוא לגלובל עבור המערכת החדשה
window.BUTTON_ICONS = BUTTON_ICONS;
window.BUTTON_TEXTS = BUTTON_TEXTS;
window.getButtonClass = getButtonClass;

console.log('🔘 Button Icons Core loaded successfully');