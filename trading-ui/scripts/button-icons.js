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

// פונקציה ליצירת כפתור סגירה סטנדרטי
function createCloseButton(modalId = '', ariaLabel = 'Close') {
  const dataDismiss = modalId ? `data-bs-dismiss="modal"` : '';
  const ariaLabelAttr = ariaLabel ? `aria-label="${ariaLabel}"` : '';
  
  return `<button type="button" class="btn-close" ${dataDismiss} ${ariaLabelAttr}></button>`;
}

// פונקציה ליצירת כפתור פעולה בתוך מודול (גודל 30px)
function createModalActionButton(type, onClick, additionalClasses = '', additionalAttributes = '') {
  const icon = BUTTON_ICONS[type.toUpperCase()] || '';
  const text = BUTTON_TEXTS[type.toUpperCase()] || '';
  const buttonClass = getButtonClass(type);

  return `<button class="btn btn-modal-action ${buttonClass} ${additionalClasses}" onclick="${onClick}" ` +
         `title="${text}" ${additionalAttributes}>${icon}</button>`;
}

// ===== קטגוריה ב: כפתורי טפסים =====

// כפתור שמירה - צבע primary דינמי
function createSaveButton(onClick, text = 'שמור', entityType = null) {
  const entityClass = entityType ? `btn-entity-${entityType}` : '';
  return `<button class="btn ${entityClass}" onclick="${onClick}" 
          style="background: var(--primary-color); color: white; border: none; min-width: 80px; height: 36px; border-radius: 6px; font-weight: 600; transition: all 0.2s ease;"
          onmouseover="this.style.background='color-mix(in srgb, var(--primary-color) 85%, black)'"
          onmouseout="this.style.background='var(--primary-color)'">
          ${text}
          </button>`;
}

// כפתור ביטול - צבע secondary דינמי
function createFormCancelButton(onClick = '', text = 'ביטול') {
  const dismiss = onClick ? `onclick="${onClick}"` : 'data-bs-dismiss="modal"';
  return `<button class="btn" ${dismiss}
          style="background: transparent; color: var(--secondary-color); 
          border: 1px solid var(--secondary-color); min-width: 80px; height: 36px; border-radius: 6px; font-weight: 600; transition: all 0.2s ease;"
          onmouseover="this.style.background='color-mix(in srgb, var(--secondary-color) 10%, transparent)'"
          onmouseout="this.style.background='transparent'">
          ${text}
          </button>`;
}

// ===== קטגוריה ג: כפתורי ניווט וכלים =====

// כפתור רענון - secondary דינמי
function createRefreshButton(onClick, text = 'רענן') {
  return `<button class="btn btn-sm" onclick="${onClick}"
          style="border: 1px solid var(--secondary-color); color: var(--secondary-color); 
          background: transparent; height: 30px; padding: 0 12px; border-radius: 6px; font-weight: 500; transition: all 0.2s ease;"
          title="${text}"
          onmouseover="this.style.background='color-mix(in srgb, var(--secondary-color) 10%, transparent)'"
          onmouseout="this.style.background='transparent'">
          <i class="fas fa-sync-alt"></i> ${text}
          </button>`;
}

// כפתור העתקה - secondary דינמי
function createCopyButton(onClick, text = 'העתק לוג מפורט') {
  return `<button class="btn btn-sm" onclick="${onClick}"
          style="border: 1px solid var(--secondary-color); color: var(--secondary-color); 
          background: transparent; height: 30px; padding: 0 12px; border-radius: 6px; font-weight: 500; transition: all 0.2s ease;"
          title="${text}"
          onmouseover="this.style.background='color-mix(in srgb, var(--secondary-color) 10%, transparent)'"
          onmouseout="this.style.background='transparent'">
          <i class="fas fa-copy"></i> ${text}
          </button>`;
}

// כפתור הוסף עיקרי - primary דינמי + אייקון ישות
function createAddButton(entityType, onClick, text = 'הוסף') {
  const iconPath = `images/icons/${entityType}.svg`;
  return `<button id="add${entityType.charAt(0).toUpperCase() + entityType.slice(1)}Btn" class="refresh-btn" onclick="${onClick}"
          style="border: 2px solid var(--primary-color); color: var(--primary-color); 
          background: transparent; height: 36px; padding: 0 16px; border-radius: 6px; font-weight: 600; transition: all 0.2s ease;"
          title="${text}"
          onmouseover="this.style.background='color-mix(in srgb, var(--primary-color) 30%, transparent)'"
          onmouseout="this.style.background='transparent'">
          <img src="${iconPath}" alt="${text}" class="action-icon" style="width: 20px; height: 20px;"> ${text}
          </button>`;
}

// ===== קטגוריה ד: כפתורי Toggle Sections =====

// כפתור toggle - secondary דינמי
function createToggleButton(sectionId, isOpen = true, title = 'הצג/הסתר') {
  const icon = isOpen ? '▼' : '▲';
  return `<button class="filter-toggle-btn" onclick="toggleSection('${sectionId}')"
          style="border: 1px solid var(--secondary-color); color: var(--secondary-color); 
          background: transparent; width: 30px; height: 30px; padding: 0; border-radius: 6px; transition: all 0.2s ease;"
          title="${title}"
          onmouseover="this.style.background='color-mix(in srgb, var(--secondary-color) 10%, transparent)'"
          onmouseout="this.style.background='transparent'">
          <span class="section-toggle-icon">${icon}</span>
          </button>`;
}

// ===== קטגוריה ה: כפתורי מיון בכותרות טבלאות =====

// כפתור מיון - primary דינמי
function createSortableHeader(columnName, columnIndex, displayText) {
  return `<button class="btn btn-link sortable-header"
          data-sort-column="${columnIndex}"
          style="color: var(--primary-color); text-decoration: none; font-weight: 600; padding: 0; border: none; background: transparent; transition: all 0.2s ease;"
          onmouseover="this.style.opacity='0.8'"
          onmouseout="this.style.opacity='1'">
          ${displayText} <i class="fas fa-sort" style="color: var(--primary-color); opacity: 0.5; margin-right: 4px;"></i>
          </button>`;
}

// ===== קטגוריה ו: כפתורים מיוחדים =====

// כפתור פילטר ישויות - primary דינמי
function createFilterButton(entityType, onClick, title, isActive = false) {
  const activeClass = isActive ? 'active' : '';
  const iconPath = `images/icons/${entityType}.svg`;
  return `<button class="btn btn-sm filter-icon-btn ${activeClass}" 
          onclick="${onClick}" data-type="${entityType}" title="${title}"
          style="border: 1px solid var(--primary-color); color: var(--primary-color); 
          background: ${isActive ? 'var(--primary-color)' : 'transparent'}; 
          height: 30px; padding: 0 8px; border-radius: 6px; transition: all 0.2s ease;"
          onmouseover="this.style.background='color-mix(in srgb, var(--primary-color) 10%, transparent)'"
          onmouseout="this.style.background='${isActive ? 'var(--primary-color)' : 'transparent'}'">
          <img src="${iconPath}" alt="${title}" class="action-icon" style="width: 16px; height: 16px;">
          </button>`;
}

// כפתור ניווט בין עמודים - entity color דינמי
function createNavigationButton(pageName, entityType, displayText) {
  const iconPath = `images/icons/${entityType}.svg`;
  return `<button class="btn w-100" onclick="window.location.href='${pageName}.html'"
          style="border: 2px solid var(--entity-${entityType}-color); 
          color: var(--entity-${entityType}-color); background: transparent; 
          height: 60px; border-radius: 8px; font-weight: 600; transition: all 0.2s ease;"
          onmouseover="this.style.background='color-mix(in srgb, var(--entity-${entityType}-color) 10%, transparent)'"
          onmouseout="this.style.background='transparent'">
          <img src="${iconPath}" alt="" style="width: 20px; height: 20px; vertical-align: middle; margin-left: 8px;">
          ${displayText}
          </button>`;
}

// ========================================
// פונקציות חדשות - כפתורים נוספים
// ========================================

// כפתור "הכל" בפילטרים - primary דינמי
function createFilterAllButton(onClick, text = 'הכל', isActive = false) {
  const activeClass = isActive ? 'active' : '';
  return `<button class="btn btn-sm btn-outline-primary filter-all-btn ${activeClass}" 
          onclick="${onClick}" data-type="all" title="${text}"
          style="border: 1px solid var(--primary-color); color: var(--primary-color); 
          background: ${isActive ? 'var(--primary-color)' : 'transparent'}; 
          height: 30px; padding: 0 12px; border-radius: 6px; transition: all 0.2s ease;"
          onmouseover="this.style.background='color-mix(in srgb, var(--primary-color) 10%, transparent)'"
          onmouseout="this.style.background='${isActive ? 'var(--primary-color)' : 'transparent'}'">
          ${text}
          </button>`;
}

// כפתור הוסף הערה חשובה - info דינמי
function createNoteButton(onClick, text = 'הוסף הערה חשובה') {
  return `<button class="btn btn-sm btn-outline-info" onclick="${onClick}" 
          title="${text}"
          style="border: 1px solid var(--info-color, #17a2b8); color: var(--info-color, #17a2b8); 
          background: transparent; height: 30px; padding: 0 8px; border-radius: 6px; transition: all 0.2s ease;"
          onmouseover="this.style.background='color-mix(in srgb, var(--info-color, #17a2b8) 10%, transparent)'"
          onmouseout="this.style.background='transparent'">
          <i class="fas fa-sticky-note"></i>
          </button>`;
}

// כפתור הוסף תזכורת - warning דינמי
function createReminderButton(onClick, text = 'הוסף תזכורת') {
  return `<button class="btn btn-sm btn-outline-warning" onclick="${onClick}" 
          title="${text}"
          style="border: 1px solid var(--warning-color, #ffc107); color: var(--warning-color, #ffc107); 
          background: transparent; height: 30px; padding: 0 8px; border-radius: 6px; transition: all 0.2s ease;"
          onmouseover="this.style.background='color-mix(in srgb, var(--warning-color, #ffc107) 10%, transparent)'"
          onmouseout="this.style.background='transparent'">
          <i class="fas fa-bell"></i>
          </button>`;
}

// כפתור פריטים מקושרים - primary דינמי
function createLinkButton(onClick, text = 'פריטים מקושרים') {
  return `<button class="btn btn-sm btn-outline-primary" onclick="${onClick}" 
          title="${text}"
          style="border: 1px solid var(--primary-color); color: var(--primary-color); 
          background: transparent; height: 30px; padding: 0 8px; border-radius: 6px; transition: all 0.2s ease;"
          onmouseover="this.style.background='color-mix(in srgb, var(--primary-color) 10%, transparent)'"
          onmouseout="this.style.background='transparent'">
          <i class="fas fa-link"></i>
          </button>`;
}

// כפתור ניווט פנימי - primary דינמי
function createInternalNavigationButton(pageName, text, icon = null) {
  const iconHtml = icon ? `<i class="fas fa-${icon}"></i> ` : '';
  return `<button class="btn btn-sm btn-outline-primary" onclick="window.location.href='${pageName}.html'" 
          title="${text}"
          style="border: 1px solid var(--primary-color); color: var(--primary-color); 
          background: transparent; height: 30px; padding: 0 12px; border-radius: 6px; transition: all 0.2s ease;"
          onmouseover="this.style.background='color-mix(in srgb, var(--primary-color) 10%, transparent)'"
          onmouseout="this.style.background='transparent'">
          ${iconHtml}${text}
          </button>`;
}

// כפתור סגירה פשוט - secondary דינמי
function createSimpleCloseButton(onClick = '', text = 'סגור') {
  const dismiss = onClick ? `onclick="${onClick}"` : 'data-bs-dismiss="modal"';
  return `<button type="button" class="btn btn-secondary" ${dismiss}
          style="background: transparent; color: var(--secondary-color); 
          border: 1px solid var(--secondary-color); min-width: 80px; height: 36px; 
          border-radius: 6px; transition: all 0.2s ease;"
          onmouseover="this.style.background='color-mix(in srgb, var(--secondary-color) 10%, transparent)'"
          onmouseout="this.style.background='transparent'">
          ${text}
          </button>`;
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
window.createCloseButton = createCloseButton;
window.createModalActionButton = createModalActionButton;
// קטגוריה ב: כפתורי טפסים
window.createSaveButton = createSaveButton;
window.createFormCancelButton = createFormCancelButton;
// קטגוריה ג: כפתורי ניווט וכלים
window.createRefreshButton = createRefreshButton;
window.createCopyButton = createCopyButton;
window.createAddButton = createAddButton;
// קטגוריה ד: כפתורי Toggle Sections
window.createToggleButton = createToggleButton;
// קטגוריה ה: כפתורי מיון בכותרות טבלאות
window.createSortableHeader = createSortableHeader;
// קטגוריה ו: כפתורים מיוחדים
window.createFilterButton = createFilterButton;
window.createNavigationButton = createNavigationButton;
// פונקציות חדשות - כפתורים נוספים
window.createFilterAllButton = createFilterAllButton;
window.createNoteButton = createNoteButton;
window.createReminderButton = createReminderButton;
window.createLinkButton = createLinkButton;
window.createInternalNavigationButton = createInternalNavigationButton;
window.createSimpleCloseButton = createSimpleCloseButton;
