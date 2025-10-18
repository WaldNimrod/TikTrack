/**
 * פונקציות עזר למערכת הכפתורים החדשה
 * Button Helpers for New Button System
 * 
 * קובץ זה מכיל פונקציות עזר שמשתמשות במערכת החדשה (data-attributes)
 * ומשמרות את הלוגיקה המורכבת של הפונקציות הישנות
 */

/**
 * יצירת כפתור ביטול/הפעלה מחדש עם לוגיקה מורכבת
 * @param {HTMLElement} container - אלמנט ה-container
 * @param {string} itemType - סוג הפריט (trade_plan, trade, ticker, וכו')
 * @param {number|string} itemId - מזהה הפריט
 * @param {string} status - סטטוס הפריט ('open', 'cancelled', וכו')
 * @param {string} size - גודל הכפתור ('sm', 'lg', וכו')
 * @param {string} additionalClasses - classes נוספים
 */
function createCancelButtonHelper(container, itemType, itemId, status = 'open', size = 'sm', additionalClasses = '') {
    const isCancelled = status === 'cancelled' || status === 'canceled';
    const type = isCancelled ? 'REACTIVATE' : 'CANCEL';
    const buttonClass = isCancelled ? 'btn-success' : 'btn-danger';
    const buttonSize = isCancelled ? '' : size;
    const title = isCancelled ? 'הפעל מחדש' : 'בטל';
    
    // יצירת onclick function
    let onclick = '';
    if (itemId) {
        if (isCancelled) {
            switch (itemType) {
                case 'trade_plan':
                    onclick = `window.reactivateTradePlan && window.reactivateTradePlan(${itemId})`;
                    break;
                case 'trade':
                    onclick = `window.reactivateTrade && window.reactivateTrade(${itemId})`;
                    break;
                case 'ticker':
                    onclick = `window.reactivateTicker && window.reactivateTicker(${itemId})`;
                    break;
                case 'alert':
                    onclick = `window.reactivateAlert && window.reactivateAlert(${itemId})`;
                    break;
                case 'account':
                    onclick = `window.reactivateAccount && window.reactivateAccount(${itemId})`;
                    break;
                case 'cash_flow':
                    onclick = `window.reactivateCashFlow && window.reactivateCashFlow(${itemId})`;
                    break;
                case 'execution':
                    onclick = `window.reactivateExecution && window.reactivateExecution(${itemId})`;
                    break;
                default:
                    const reactivateFunc = `window.reactivate${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`;
                    onclick = `${reactivateFunc} && ${reactivateFunc}(${itemId})`;
                    break;
            }
        } else {
            switch (itemType) {
                case 'trade_plan':
                    onclick = `window.openCancelTradePlanModal && window.openCancelTradePlanModal(${itemId})`;
                    break;
                case 'trade':
                    onclick = `window.cancelTradeRecord && window.cancelTradeRecord(${itemId})`;
                    break;
                case 'ticker':
                    onclick = `window.cancelTicker && window.cancelTicker(${itemId})`;
                    break;
                case 'alert':
                    onclick = `window.cancelAlert && window.cancelAlert(${itemId})`;
                    break;
                case 'account':
                    onclick = `window.cancelAccount && window.cancelAccount(${itemId})`;
                    break;
                case 'cash_flow':
                    onclick = `window.cancelCashFlow && window.cancelCashFlow(${itemId})`;
                    break;
                case 'execution':
                    onclick = `window.cancelExecution && window.cancelExecution(${itemId})`;
                    break;
                default:
                    const cancelFunc = `window.cancel${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`;
                    onclick = `${cancelFunc} && ${cancelFunc}(${itemId})`;
                    break;
            }
        }
    }
    
    // יצירת classes
    let classes = buttonClass;
    if (buttonSize) {
        classes += ` btn-${buttonSize}`;
    }
    if (additionalClasses) {
        classes += ` ${additionalClasses}`;
    }
    
    // יצירת attributes
    const attributes = `data-item-type="${itemType}" data-item-id="${itemId}" title="${title}"`;
    
    // יצירת כפתור עם המערכת החדשה
    if (window.addDynamicButton) {
        window.addDynamicButton(container, type, onclick, classes, attributes, '', `cancel-btn-${itemType}-${itemId}`);
    } else {
        // fallback - יצירת כפתור ישירות
        const buttonHtml = `<button class="btn ${classes}" onclick="${onclick}" ${attributes}>
            <span class="cancel-icon">${isCancelled ? '✓' : 'X'}</span>
        </button>`;
        container.insertAdjacentHTML('beforeend', buttonHtml);
    }
}

/**
 * יצירת כפתור מחיקה עם לוגיקה מורכבת לפי סוג פריט
 * @param {HTMLElement} container - אלמנט ה-container
 * @param {string} itemType - סוג הפריט
 * @param {number|string} itemId - מזהה הפריט
 * @param {string} size - גודל הכפתור
 * @param {string} additionalClasses - classes נוספים
 */
function createDeleteButtonByTypeHelper(container, itemType, itemId, size = 'sm', additionalClasses = '') {
    const buttonClass = 'btn-danger';
    const title = 'מחק';
    
    // יצירת onclick function
    let onclick = '';
    if (itemId) {
        switch (itemType) {
            case 'trade_plan':
                onclick = `window.deleteTradePlan && window.deleteTradePlan(${itemId})`;
                break;
            case 'trade':
                onclick = `window.deleteTrade && window.deleteTrade(${itemId})`;
                break;
            case 'ticker':
                onclick = `window.deleteTicker && window.deleteTicker(${itemId})`;
                break;
            case 'alert':
                onclick = `window.deleteAlert && window.deleteAlert(${itemId})`;
                break;
            case 'account':
                onclick = `window.deleteAccount && window.deleteAccount(${itemId})`;
                break;
            case 'cash_flow':
                onclick = `window.deleteCashFlow && window.deleteCashFlow(${itemId})`;
                break;
            case 'execution':
                onclick = `window.deleteExecution && window.deleteExecution(${itemId})`;
                break;
            default:
                const deleteFunc = `window.delete${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`;
                onclick = `${deleteFunc} && ${deleteFunc}(${itemId})`;
                break;
        }
    }
    
    // יצירת classes
    let classes = `${buttonClass} btn-${size}`;
    if (additionalClasses) {
        classes += ` ${additionalClasses}`;
    }
    
    // יצירת attributes
    const attributes = `data-item-type="${itemType}" data-item-id="${itemId}" title="${title}"`;
    
    // יצירת כפתור עם המערכת החדשה
    if (window.addDynamicButton) {
        window.addDynamicButton(container, 'DELETE', onclick, classes, attributes, '', `delete-btn-${itemType}-${itemId}`);
    } else {
        // fallback - יצירת כפתור ישירות
        const buttonHtml = `<button class="btn ${classes}" onclick="${onclick}" ${attributes}>
            <span class="delete-icon">🗑️</span>
        </button>`;
        container.insertAdjacentHTML('beforeend', buttonHtml);
    }
}

/**
 * יצירת כפתור עריכה פשוט
 * @param {HTMLElement} container - אלמנט ה-container
 * @param {string} onClick - פונקציה להרצה
 * @param {string} additionalClasses - classes נוספים
 */
function createEditButtonHelper(container, onClick, additionalClasses = '') {
    const classes = `btn-secondary btn-sm ${additionalClasses}`.trim();
    
    if (window.addDynamicButton) {
        window.addDynamicButton(container, 'EDIT', onClick, classes, '', '', `edit-btn-${Date.now()}`);
    } else {
        // fallback
        const buttonHtml = `<button class="btn ${classes}" onclick="${onClick}" title="ערוך">
            <span class="edit-icon">✏️</span>
        </button>`;
        container.insertAdjacentHTML('beforeend', buttonHtml);
    }
}

/**
 * יצירת כפתור מחיקה פשוט
 * @param {HTMLElement} container - אלמנט ה-container
 * @param {string} onClick - פונקציה להרצה
 * @param {string} additionalClasses - classes נוספים
 */
function createDeleteButtonHelper(container, onClick, additionalClasses = '') {
    const classes = `btn-danger btn-sm ${additionalClasses}`.trim();
    
    if (window.addDynamicButton) {
        window.addDynamicButton(container, 'DELETE', onClick, classes, '', '', `delete-btn-${Date.now()}`);
    } else {
        // fallback
        const buttonHtml = `<button class="btn ${classes}" onclick="${onClick}" title="מחק">
            <span class="delete-icon">🗑️</span>
        </button>`;
        container.insertAdjacentHTML('beforeend', buttonHtml);
    }
}

/**
 * יצירת כפתור קישור פשוט
 * @param {HTMLElement} container - אלמנט ה-container
 * @param {string} onClick - פונקציה להרצה
 * @param {string} additionalClasses - classes נוספים
 */
function createLinkButtonHelper(container, onClick, additionalClasses = '') {
    const classes = `btn-info btn-sm ${additionalClasses}`.trim();
    
    if (window.addDynamicButton) {
        window.addDynamicButton(container, 'LINK', onClick, classes, '', '', `link-btn-${Date.now()}`);
    } else {
        // fallback
        const buttonHtml = `<button class="btn ${classes}" onclick="${onClick}" title="קישור">
            <span class="link-icon">🔗</span>
        </button>`;
        container.insertAdjacentHTML('beforeend', buttonHtml);
    }
}

/**
 * יצירת כפתור סגירה למודלים
 * @param {HTMLElement} container - אלמנט ה-container
 * @param {string} additionalClasses - classes נוספים
 */
function createCloseButtonHelper(container, additionalClasses = '') {
    const classes = `btn-secondary ${additionalClasses}`.trim();
    const attributes = 'data-bs-dismiss="modal" type="button"';
    
    if (window.addDynamicButton) {
        window.addDynamicButton(container, 'CLOSE', '', classes, attributes, '', `close-btn-${Date.now()}`);
    } else {
        // fallback
        const buttonHtml = `<button class="btn ${classes}" ${attributes} title="סגור">
            <span class="close-icon">✖️</span>
        </button>`;
        container.insertAdjacentHTML('beforeend', buttonHtml);
    }
}

/**
 * יצירת כפתור מיון
 * @param {HTMLElement} container - אלמנט ה-container
 * @param {string} onClick - פונקציה להרצה
 * @param {string} additionalClasses - classes נוספים
 * @param {string} additionalAttributes - attributes נוספים
 * @param {string} text - טקסט הכפתור
 */
function createSortButtonHelper(container, onClick, additionalClasses = 'sortable-header', additionalAttributes = '', text = '') {
    const classes = `btn-link ${additionalClasses}`.trim();
    const attributes = additionalAttributes;
    
    if (window.addDynamicButton) {
        window.addDynamicButton(container, 'SORT', onClick, classes, attributes, text, `sort-btn-${Date.now()}`);
    } else {
        // fallback
        const buttonHtml = `<button class="btn ${classes}" onclick="${onClick}" ${attributes} title="מיון">
            ${text}↕️
        </button>`;
        container.insertAdjacentHTML('beforeend', buttonHtml);
    }
}

/**
 * יצירת כפתור הצג/הסתר
 * @param {HTMLElement} container - אלמנט ה-container
 * @param {string} onClick - פונקציה להרצה
 * @param {string} title - כותרת הכפתור
 * @param {string} additionalClasses - classes נוספים
 */
function createToggleButtonHelper(container, onClick, title = 'הצג/הסתר', additionalClasses = '') {
    const classes = `btn-outline-warning ${additionalClasses}`.trim();
    
    if (window.addDynamicButton) {
        window.addDynamicButton(container, 'TOGGLE', onClick, classes, `title="${title}"`, '', `toggle-btn-${Date.now()}`);
    } else {
        // fallback
        const buttonHtml = `<button class="btn ${classes}" onclick="${onClick}" title="${title}">
            <span class="toggle-icon">▼</span>
        </button>`;
        container.insertAdjacentHTML('beforeend', buttonHtml);
    }
}

/**
 * יצירת כפתור כללי
 * @param {HTMLElement} container - אלמנט ה-container
 * @param {string} type - סוג הכפתור
 * @param {string} onClick - פונקציה להרצה
 * @param {string} additionalClasses - classes נוספים
 * @param {string} additionalAttributes - attributes נוספים
 */
function createButtonHelper(container, type, onClick, additionalClasses = '', additionalAttributes = '') {
    const classes = `btn-sm ${additionalClasses}`.trim();
    
    if (window.addDynamicButton) {
        window.addDynamicButton(container, type, onClick, classes, additionalAttributes, '', `btn-${type}-${Date.now()}`);
    } else {
        // fallback
        const buttonHtml = `<button class="btn ${classes}" onclick="${onClick}" ${additionalAttributes} title="${type}">
            <span class="btn-icon">${type}</span>
        </button>`;
        container.insertAdjacentHTML('beforeend', buttonHtml);
    }
}

// ייצוא הפונקציות לגלובל
window.createCancelButtonHelper = createCancelButtonHelper;
window.createDeleteButtonByTypeHelper = createDeleteButtonByTypeHelper;
window.createEditButtonHelper = createEditButtonHelper;
window.createDeleteButtonHelper = createDeleteButtonHelper;
window.createLinkButtonHelper = createLinkButtonHelper;
window.createCloseButtonHelper = createCloseButtonHelper;
window.createSortButtonHelper = createSortButtonHelper;
window.createToggleButtonHelper = createToggleButtonHelper;
window.createButtonHelper = createButtonHelper;

console.log('🔧 Button Helpers loaded successfully');
