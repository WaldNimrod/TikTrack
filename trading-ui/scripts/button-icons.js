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

// Button Icons - Using Tabler Icons via IconSystem
// Fallback to Emojis if IconSystem not available
const BUTTON_ICONS = {
  EDIT: '/trading-ui/images/icons/tabler/pencil.svg',
  DELETE: '/trading-ui/images/icons/tabler/trash.svg',
  CANCEL: '/trading-ui/images/icons/tabler/x.svg',
  LINK: '/trading-ui/images/icons/tabler/link.svg',
  ADD: '/trading-ui/images/icons/tabler/plus.svg',
  SAVE: '/trading-ui/images/icons/tabler/device-floppy.svg',
  CLOSE: '/trading-ui/images/icons/tabler/x.svg',
  REFRESH: '/trading-ui/images/icons/tabler/refresh.svg',
  EXPORT: '/trading-ui/images/icons/tabler/download.svg',
  IMPORT: '/trading-ui/images/icons/tabler/upload.svg',
  WARNING: '/trading-ui/images/icons/tabler/alert-triangle.svg',
  SEARCH: '/trading-ui/images/icons/tabler/search.svg',
  FILTER: '/trading-ui/images/icons/tabler/filter.svg',
  VIEW: '/trading-ui/images/icons/tabler/eye.svg',
  DUPLICATE: '/trading-ui/images/icons/tabler/copy.svg',
  ARCHIVE: '/trading-ui/images/icons/tabler/archive.svg',
  RESTORE: '/trading-ui/images/icons/tabler/restore.svg',
  REACTIVATE: '/trading-ui/images/icons/tabler/check.svg',
  APPROVE: '/trading-ui/images/icons/tabler/check.svg',
  REJECT: '/trading-ui/images/icons/tabler/x.svg',
  PAUSE: '/trading-ui/images/icons/tabler/player-pause.svg',
  PLAY: '/trading-ui/images/icons/tabler/player-play.svg',
  STOP: '/trading-ui/images/icons/tabler/player-stop.svg',
  READ: '/trading-ui/images/icons/tabler/check.svg',
  CHECK: '/trading-ui/images/icons/tabler/check.svg',
  TOGGLE: '/trading-ui/images/icons/tabler/chevron-down.svg',
  SORT: '/trading-ui/images/icons/tabler/arrows-sort.svg',
  COPY: '/trading-ui/images/icons/tabler/copy.svg',
  MENU: '/trading-ui/images/icons/tabler/settings.svg',
  BACK: '/trading-ui/images/icons/tabler/arrow-right.svg' // RTL - חץ ימינה
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
  WARNING: 'אזהרה',
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
window.ENTITY_VARIANT_BUTTONS = ['CLOSE', 'ADD', 'LINK', 'SAVE', 'MENU', 'PRIMARY', 'WARNING'];

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