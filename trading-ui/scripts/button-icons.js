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
  REACTIVATE: '🔄',
  APPROVE: '✅',
  REJECT: '❌',
  PAUSE: '⏸️',
  PLAY: '▶️',
  STOP: '⏹️',
  READ: '✓',
  CHECK: '✓',
  TOGGLE: '▼',
  SORT: '↕️'
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
  SORT: 'מיון'
};

/**
 * פונקציה לקבלת CSS class לפי סוג כפתור
 * @param {string} type - סוג הכפתור
 * @returns {string} CSS class
 */
function getButtonClass(type) {
  const classMap = {
    EDIT: 'btn-secondary',
    DELETE: 'btn-danger',
    CANCEL: 'btn-secondary',
    LINK: 'btn-info',
    ADD: 'btn-success',
    SAVE: 'btn-primary',
    CLOSE: 'btn-secondary',
    REFRESH: 'btn-outline-secondary',
    EXPORT: 'btn-outline-primary',
    IMPORT: 'btn-outline-success',
    SEARCH: 'btn-outline-info',
    FILTER: 'btn-outline-warning',
    VIEW: 'btn-outline-info',
    DUPLICATE: 'btn-outline-secondary',
    ARCHIVE: 'btn-outline-warning',
    RESTORE: 'btn-outline-success',
    REACTIVATE: 'btn-success',
    APPROVE: 'btn-success',
    REJECT: 'btn-danger',
    PAUSE: 'btn-warning',
    PLAY: 'btn-success',
    STOP: 'btn-danger',
    TOGGLE: 'btn-outline-warning',
    SORT: 'btn-link'
  };
  return classMap[type.toUpperCase()] || 'btn-secondary';
}

// ייצוא לגלובל עבור המערכת החדשה
window.BUTTON_ICONS = BUTTON_ICONS;
window.BUTTON_TEXTS = BUTTON_TEXTS;
window.getButtonClass = getButtonClass;

console.log('🔘 Button Icons Core loaded successfully');