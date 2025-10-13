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
  REACTIVATE: '🔄',
  APPROVE: '✅',
  REJECT: '<span class="cancel-icon">X</span>',
  PAUSE: '⏸️',
  PLAY: '▶️',
  STOP: '⏹️',
  READ: '✓',
  CHECK: '✓',
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
  REACTIVATE: 'הפעל מחדש',
  APPROVE: 'אשר',
  REJECT: 'דחה',
  PAUSE: 'השהה',
  PLAY: 'הפעל',
  STOP: 'עצור',
  READ: 'קראתי',
  CHECK: 'סמן',
};

// פונקציה ליצירת כפתור עם איקון
function createButton(type, onClick, _additionalClasses = '', additionalAttributes = '') {
  const icon = BUTTON_ICONS[type.toUpperCase()] || '';
  const text = BUTTON_TEXTS[type.toUpperCase()] || '';

  return `<button class="btn btn-sm ${getButtonClass(type)}" onclick="${onClick}" ` +
         `title="${text}" ${additionalAttributes}>${icon}</button>`;
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
    REACTIVATE: 'btn-success',
    APPROVE: 'btn-success',
    REJECT: 'btn-danger',
    PAUSE: 'btn-warning',
    PLAY: 'btn-success',
    STOP: 'btn-danger',
  };

  return classMap[type.toUpperCase()] || 'btn-secondary';
}

// פונקציה ליצירת כפתור עריכה
function createEditButton(onClick, _additionalClasses = '') {
  return createButton('EDIT', onClick, _additionalClasses);
}

// פונקציה ליצירת כפתור מחיקה
function createDeleteButton(onClick, _additionalClasses = '') {
  return createButton('DELETE', onClick, _additionalClasses);
}

// פונקציה ליצירת כפתור קישור
function createLinkButton(onClick, _additionalClasses = '') {
  const btn = createButton('LINK', onClick, _additionalClasses);
  // הוספת data-attr לניטור מיוחד של כפתור אלמנטים מקושרים
  if (/viewLinkedItemsFor|openLinkedItemsModal\(/.test(onClick)) {
    return btn.replace('<button ', '<button data-linked-items="1" ');
  }
  return btn;
}

// פונקציה ליצירת כפתור ביטול/הפעלה מחדש
function createCancelButton(itemType, itemId, status = 'open', size = 'sm', additionalClasses = '') {
  const isCancelled = status === 'cancelled' || status === 'canceled';
  const buttonClass = isCancelled ? 'btn-success' : 'btn-danger';
  const buttonSize = isCancelled ? '' : size; // כפתור שיחזור גדול יותר
  const title = isCancelled ? 'הפעל מחדש' : 'בטל';
  const icon = isCancelled ? '✓' : 'X';

  // יצירת onclick בהתאם לסטטוס וסוג האובייקט
  let onclick = '';
  if (itemId) {
    if (isCancelled) {
      // הפעלה מחדש - פונקציות שונות לכל סוג
      switch (itemType) {
      case 'trade_plan':
        onclick = `onclick="window.reactivateTradePlan && window.reactivateTradePlan(${itemId})"`;
        break;
      case 'trade':
        onclick = `onclick="window.reactivateTrade && window.reactivateTrade(${itemId})"`;
        break;
      case 'ticker':
        onclick = `onclick="window.reactivateTicker && window.reactivateTicker(${itemId})"`;
        break;
      case 'alert':
        onclick = `onclick="window.reactivateAlert && window.reactivateAlert(${itemId})"`;
        break;
      case 'account':
        onclick = `onclick="window.reactivateAccount && window.reactivateAccount(${itemId})"`;
        break;
      case 'cash_flow':
        onclick = `onclick="window.reactivateCashFlow && window.reactivateCashFlow(${itemId})"`;
        break;
      case 'execution':
        onclick = `onclick="window.reactivateExecution && window.reactivateExecution(${itemId})"`;
        break;
      default: {
        const reactivateFunc = `window.reactivate${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`;
        onclick = `onclick="${reactivateFunc} && ${reactivateFunc}(${itemId})"`;
        break;
      }
      }
    } else {
      // ביטול - פונקציות שונות לכל סוג
      switch (itemType) {
      case 'trade_plan':
        onclick = `onclick="window.openCancelTradePlanModal && window.openCancelTradePlanModal(${itemId})"`;
        break;
      case 'trade':
        onclick = `onclick="window.cancelTradeRecord && window.cancelTradeRecord(${itemId})"`;
        break;
      case 'ticker':
        onclick = `onclick="window.cancelTicker && window.cancelTicker(${itemId})"`;
        break;
      case 'alert':
        onclick = `onclick="window.cancelAlert && window.cancelAlert(${itemId})"`;
        break;
      case 'account':
        onclick = `onclick="window.cancelAccount && window.cancelAccount(${itemId})"`;
        break;
      case 'cash_flow':
        onclick = `onclick="window.cancelCashFlow && window.cancelCashFlow(${itemId})"`;
        break;
      case 'execution':
        onclick = `onclick="window.cancelExecution && window.cancelExecution(${itemId})"`;
        break;
      default: {
        const cancelFunc = `window.cancel${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`;
        onclick = `onclick="${cancelFunc} && ${cancelFunc}(${itemId})"`;
        break;
      }
      }
    }
  }

  return `<button class="btn ${buttonSize ? 'btn-' + buttonSize : ''} ${buttonClass} ${additionalClasses}" ${onclick} title="${title}">` +
         `<span class="cancel-icon">${icon}</span></button>`;
}

// פונקציה ליצירת כפתור מחיקה עם itemType (גיבוי לפונקציה המקורית)
function createDeleteButtonByType(itemType, itemId, size = 'sm', additionalClasses = '') {
  const buttonClass = 'btn-danger';
  const title = 'מחק';
  const icon = '🗑️';

  // יצירת onclick בהתאם לסוג האובייקט
  let onclick = '';
  if (itemId) {
    switch (itemType) {
    case 'trade_plan':
      onclick = `onclick="window.deleteTradePlan && window.deleteTradePlan(${itemId})"`;
      break;
    case 'trade':
      onclick = `onclick="window.deleteTrade && window.deleteTrade(${itemId})"`;
      break;
    case 'ticker':
      onclick = `onclick="window.deleteTicker && window.deleteTicker(${itemId})"`;
      break;
    case 'alert':
      onclick = `onclick="window.deleteAlert && window.deleteAlert(${itemId})"`;
      break;
    case 'account':
      onclick = `onclick="window.deleteAccount && window.deleteAccount(${itemId})"`;
      break;
    case 'cash_flow':
      onclick = `onclick="window.deleteCashFlow && window.deleteCashFlow(${itemId})"`;
      break;
    case 'execution':
      onclick = `onclick="window.deleteExecution && window.deleteExecution(${itemId})"`;
      break;
    default: {
      const deleteFunc = `window.delete${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`;
      onclick = `onclick="${deleteFunc} && ${deleteFunc}(${itemId})"`;
      break;
    }
    }
  }

  return `<button class="btn btn-${size} ${buttonClass} ${additionalClasses}" ${onclick} title="${title}">` +
         `<span class="delete-icon">${icon}</span></button>`;
}

/**
 * יצירת תפריט פעולות עם popup על hover
 * @param {Array} buttons - מערך של HTML של כפתורים (תומך ב-2-5 כפתורים)
 * @param {string} entityId - ID של הישות (לייחודיות)
 * @returns {string} HTML של trigger + popup
 * 
 * דוגמאות שימוש:
 * - 2 כפתורים: createActionsMenu([editBtn, deleteBtn], id)
 * - 5 כפתורים: createActionsMenu([linkBtn, editBtn, viewBtn, cancelBtn, deleteBtn], id)
 */
function createActionsMenu(buttons, entityId) {
  // סינון כפתורים ריקים
  const validButtons = buttons.filter(btn => btn && btn.trim() !== '');
  
  if (validButtons.length === 0) {
    return '<span class="text-muted">-</span>';
  }
  
  const menuId = `actions-menu-${entityId}`;
  
  // הפופאפ יתאים אוטומטית לכמות הכפתורים (CSS flex + min-width: max-content)
  return `
    <div class="actions-menu-wrapper">
      <button class="actions-menu-trigger" 
              data-menu-id="${menuId}"
              title="פעולות"
              aria-label="תפריט פעולות">
        <span class="actions-menu-icon">⋮</span>
      </button>
      <div class="actions-menu-popup" 
           id="${menuId}"
           role="menu">
        <div class="actions-menu-content">
          ${validButtons.join('')}
        </div>
      </div>
    </div>
  `;
}

// ייצוא לפונקציות גלובליות
window.BUTTON_ICONS = BUTTON_ICONS;
window.BUTTON_TEXTS = BUTTON_TEXTS;
window.createButton = createButton;
window.createEditButton = createEditButton;
window.createDeleteButton = createDeleteButton;
window.createLinkButton = createLinkButton;
window.createCancelButton = createCancelButton;
window.createDeleteButtonByType = createDeleteButtonByType;
window.getButtonClass = getButtonClass;
window.createActionsMenu = createActionsMenu;
