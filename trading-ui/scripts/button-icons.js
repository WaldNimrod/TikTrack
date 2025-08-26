/**
 * מערכת איקונים מרכזית לכל הכפתורים באתר
 * Centralized icon system for all buttons in the application
 */

// איקונים לכפתורי פעולה
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
    APPROVE: '✅',
    REJECT: '❌',
    PAUSE: '⏸️',
    PLAY: '▶️',
    STOP: '⏹️'
};

// טקסטים לכפתורים (לנגישות)
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
    APPROVE: 'אשר',
    REJECT: 'דחה',
    PAUSE: 'השהה',
    PLAY: 'הפעל',
    STOP: 'עצור'
};

// פונקציה ליצירת כפתור עם איקון
function createButton(type, onClick, additionalClasses = '', additionalAttributes = '') {
    const icon = BUTTON_ICONS[type.toUpperCase()] || '';
    const text = BUTTON_TEXTS[type.toUpperCase()] || '';

    return `<button class="btn btn-sm ${getButtonClass(type)}" onclick="${onClick}" title="${text}" ${additionalAttributes}>${icon}</button>`;
}

// פונקציה לקבלת מחלקת CSS לכפתור
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
        APPROVE: 'btn-success',
        REJECT: 'btn-danger',
        PAUSE: 'btn-warning',
        PLAY: 'btn-success',
        STOP: 'btn-danger'
    };

    return classMap[type.toUpperCase()] || 'btn-secondary';
}

// פונקציה ליצירת כפתור עריכה
function createEditButton(onClick, additionalClasses = '') {
    return createButton('EDIT', onClick, additionalClasses);
}

// פונקציה ליצירת כפתור מחיקה
function createDeleteButton(onClick, additionalClasses = '') {
    return createButton('DELETE', onClick, additionalClasses);
}

// פונקציה ליצירת כפתור קישור
function createLinkButton(onClick, additionalClasses = '') {
    return createButton('LINK', onClick, additionalClasses);
}

// ייצוא לפונקציות גלובליות
window.BUTTON_ICONS = BUTTON_ICONS;
window.BUTTON_TEXTS = BUTTON_TEXTS;
window.createButton = createButton;
window.createEditButton = createEditButton;
window.createDeleteButton = createDeleteButton;
window.createLinkButton = createLinkButton;
