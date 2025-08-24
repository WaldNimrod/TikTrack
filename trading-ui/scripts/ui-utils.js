/**
 * UI Utilities JavaScript
 * 
 * פונקציות UI משותפות באמת - רק מה שמשמש הרבה עמודים
 * 
 * File: trading-ui/scripts/ui-utils.js
 * Version: 1.0
 * Last Updated: August 23, 2025
 */

// ===== Notification Functions =====

/**
 * מקבל איקון לפי סוג הודעה
 * Get notification icon by type
 * 
 * @param {string} type - סוג ההודעה
 * @returns {string} HTML של האיקון
 */
function getNotificationIcon(type) {
    switch (type) {
        case 'success':
            return '✅';
        case 'error':
            return '❌';
        case 'warning':
            return '⚠️';
        case 'info':
        default:
            return 'ℹ️';
    }
}

/**
 * הצגת הודעה במודל
 * Show notification in modal
 */
function showModalNotification(type, title, message, modalId = 'notificationModal') {
    // Showing notification in modal

    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`❌ Modal ${modalId} not found`);
        return;
    }

    // עדכון תוכן המודל
    const titleElement = modal.querySelector('.modal-title');
    const messageElement = modal.querySelector('.modal-body');
    const iconElement = modal.querySelector('.notification-icon');

    if (titleElement) titleElement.textContent = title;
    if (messageElement) messageElement.textContent = message;

    // עדכון איקון לפי סוג
    if (iconElement) {
        iconElement.className = `notification-icon ${type}`;
        iconElement.innerHTML = getNotificationIcon(type);
    }

    // הצגת המודל
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

/**
 * הצגת הודעת אישור שנייה
 * Show second confirmation modal
 */
function showSecondConfirmation(title, message, onConfirm) {
    // Showing second confirmation modal

    const modal = document.getElementById('secondConfirmationModal');
    if (!modal) {
        console.error('❌ Second confirmation modal not found');
        return;
    }

    // עדכון תוכן המודל
    const titleElement = modal.querySelector('.modal-title');
    const messageElement = modal.querySelector('.modal-body');

    if (titleElement) titleElement.textContent = title;
    if (messageElement) messageElement.textContent = message;

    // הגדרת פונקציית האישור
    const confirmBtn = modal.querySelector('.btn-confirm');
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) {
                bootstrapModal.hide();
            }
            if (onConfirm) onConfirm();
        };
    }

    // הצגת המודל
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

/**
 * אישור פעולה שנייה
 * Confirm second action
 */
function confirmSecondAction() {
    if (typeof window.secondConfirmationCallback === 'function') {
        window.secondConfirmationCallback();
    }
    const modal = bootstrap.Modal.getInstance(document.getElementById('secondConfirmationModal'));
    if (modal) {
        modal.hide();
    }
}

/**
 * הצגת מודל אישור שני
 * Show second confirmation modal
 */
function showSecondConfirmationModal(title, message, onConfirm) {
    console.log('🔄 Showing second confirmation modal');

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'secondConfirmationModal';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">${title}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                    <button type="button" class="btn btn-danger btn-confirm">אישור</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // הגדרת פונקציית האישור
    const confirmBtn = modal.querySelector('.btn-confirm');
    if (confirmBtn) {
        confirmBtn.onclick = () => {
            const bootstrapModal = bootstrap.Modal.getInstance(modal);
            if (bootstrapModal) {
                bootstrapModal.hide();
            }
            if (onConfirm) onConfirm();
        };
    }

    // הצגת המודל
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();

    // הסרת המודל מהדף אחרי שהוא נסגר
    modal.addEventListener('hidden.bs.modal', () => {
        if (document.body.contains(modal)) {
            document.body.removeChild(modal);
        }
    });
}

// ===== Notification Functions =====

/**
 * הצגת הודעת שגיאה
 * Show error notification
 */
function showErrorNotification(title, message) {
    // Error notification

    if (typeof window.showNotification === 'function') {
        window.showNotification(`${title}: ${message}`, 'error');
    } else {
        showModalNotification('error', title, message);
    }
}

/**
 * הצגת הודעת הצלחה
 * Show success notification
 */
function showSuccessNotification(title, message) {
    // Success notification

    if (typeof window.showNotification === 'function') {
        window.showNotification(`${title}: ${message}`, 'success');
    } else {
        showModalNotification('success', title, message);
    }
}

/**
 * הצגת הודעת מידע
 * Show info notification
 */
function showInfoNotification(title, message) {
    // Info notification

    if (typeof window.showNotification === 'function') {
        window.showNotification(`${title}: ${message}`, 'info');
    } else {
        showModalNotification('info', title, message);
    }
}

/**
 * יצירת מיכל התראות אם לא קיים
 * Create toast container if not exists
 */
function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}

// ===== Color Functions =====

/**
 * פונקציה לצביעת סכומים (חיובי/שלילי)
 * Function for coloring amounts (positive/negative)
 */
function colorAmount(amount, displayText = null) {
    const text = displayText || (amount >= 0 ? `+$${amount.toFixed(2)}` : `-$${Math.abs(amount).toFixed(2)}`);
    const className = amount >= 0 ? 'profit-positive' : 'profit-negative';
    return `<span class="${className}">${text}</span>`;
}

// ===== Notification Functions =====

/**
 * הצגת הודעה למשתמש
 * Show notification to user
 * 
 * @param {string} message - טקסט ההודעה להצגה
 * @param {string} type - סוג ההודעה: 'success' (ירוק), 'error' (אדום), 'warning' (צהוב), 'info' (כחול)
 */
function showNotification(message, type = 'info') {
    // יצירת מיכל התראות אם לא קיים
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = createToastContainer();
    }

    // יצירת הודעה חדשה
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${getBootstrapColor(type)} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');

    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;

    container.appendChild(toast);

    // הצגת ההודעה
    const bsToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: type === 'error' ? 5000 : 3000
    });
    bsToast.show();

    // הסרת ההודעה מהדף אחרי שהיא נעלמת
    toast.addEventListener('hidden.bs.toast', () => {
        if (container.contains(toast)) {
            container.removeChild(toast);
        }
    });
}

/**
 * המרת סוג הודעה לצבע Bootstrap
 * Convert notification type to Bootstrap color
 * 
 * @param {string} type - סוג ההודעה
 * @returns {string} צבע Bootstrap
 */
function getBootstrapColor(type) {
    switch (type) {
        case 'success':
            return 'success';
        case 'error':
            return 'danger';
        case 'warning':
            return 'warning';
        case 'info':
        default:
            return 'info';
    }
}

// ===== Export Functions =====
window.showModalNotification = showModalNotification;
window.showSecondConfirmationModal = showSecondConfirmationModal;
window.confirmSecondAction = confirmSecondAction;
window.showErrorNotification = showErrorNotification;
window.showSuccessNotification = showSuccessNotification;
window.showInfoNotification = showInfoNotification;
window.createToastContainer = createToastContainer;
window.colorAmount = colorAmount;
window.showNotification = showNotification;

// ייצוא המודול עצמו
window.uiUtils = {
    showModalNotification,
    showSecondConfirmationModal,
    confirmSecondAction,
    showErrorNotification,
    showSuccessNotification,
    showInfoNotification,
    createToastContainer,
    colorAmount,
    showNotification
};

/**
 * Show warning modal for deletion with linked items
 * 
 * Creates a warning modal that displays linked items that prevent deletion,
 * similar to the linked items modal but with warning styling and deletion-specific content.
 * 
 * @param {Object} data - Linked items data
 * @param {string} itemType - Type of the item
 * @param {string|number} itemId - ID of the item
 * @param {Function} onConfirm - Callback function when user confirms deletion
 */
function showLinkedItemsWarningModal(data, itemType, itemId, onConfirm) {

    // Create modal content
    const modalContent = createLinkedItemsWarningContent(data, itemType, itemId, onConfirm);

    // Create and show modal
    const modalId = 'linkedItemsWarningModal';
    const modalTitle = `⚠️ אזהרה: לא ניתן למחוק ${getItemTypeDisplayName(itemType)} #${itemId}`;

    // Remove existing modal if it exists
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
        existingModal.remove();
    }

    // Create new modal with linked-items-modal class
    const modalHtml = `
    <div class="modal fade linked-items-modal" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="${modalId}Label">${modalTitle}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            ${modalContent}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">סגור</button>
            <button type="button" class="btn btn-danger" onclick="forceDeleteWithLinkedItems('${itemType}', ${itemId}, ${onConfirm})">
              מחק בכל זאת
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
}

/**
 * Create linked items warning modal content
 * 
 * Generates the HTML content for the linked items warning modal, including
 * warning message and detailed information about linked items that prevent deletion.
 * 
 * @param {Object} data - Linked items data
 * @param {string} itemType - Type of the item
 * @param {string|number} itemId - ID of the item
 * @param {Function} onConfirm - Callback function when user confirms deletion
 * @returns {string} HTML content for the modal
 */
function createLinkedItemsWarningContent(data, itemType, itemId, onConfirm) {

    // יצירת כותרת מותאמת לפי סוג האלמנט
    let headerTitle = '';
    let itemName = '';

    switch (itemType) {
        case 'account':
            headerTitle = 'לא ניתן למחוק חשבון:';
            itemName = data.accountName || `חשבון ${itemId}`;
            break;
        case 'trade':
            headerTitle = 'לא ניתן למחוק טרייד:';
            itemName = data.tradeSymbol || `טרייד ${itemId}`;
            break;
        case 'ticker':
            headerTitle = 'לא ניתן למחוק טיקר:';
            itemName = data.tickerSymbol || `טיקר ${itemId}`;
            break;
        case 'alert':
            headerTitle = 'לא ניתן למחוק התראה:';
            itemName = data.alertName || `התראה ${itemId}`;
            break;
        case 'cash_flow':
            headerTitle = 'לא ניתן למחוק תזרים מזומנים:';
            itemName = data.cashFlowName || `תזרים ${itemId}`;
            break;
        case 'note':
            headerTitle = 'לא ניתן למחוק הערה:';
            itemName = data.noteTitle || `הערה ${itemId}`;
            break;
        case 'trade_plan':
            headerTitle = 'לא ניתן למחוק תוכנית טרייד:';
            itemName = data.planName || `תוכנית ${itemId}`;
            break;
        case 'execution':
            headerTitle = 'לא ניתן למחוק ביצוע:';
            itemName = data.executionName || `ביצוע ${itemId}`;
            break;
        default:
            headerTitle = 'לא ניתן למחוק רשומה:';
            itemName = `רשומה ${itemId}`;
    }

    let content = `
    <div class="linked-items-container">
      <div class="alert alert-warning">
        <strong>⚠️ ${headerTitle} <span class="text-danger">${itemName}</span></strong>
        <br>
        ${getItemTypeDisplayName(itemType)} זה מקושר לפריטים הבאים במערכת. יש לטפל בהם תחילה:
      </div>

      <div class="linked-items-section">
        <h6>📋 פריטים מקושרים (${data && data.linkedItems ? data.linkedItems.length : 0})</h6>
        <div class="linked-items-list">
  `;

    // Add linked items list
    if (data && data.linkedItems && data.linkedItems.length > 0) {
        content += createLinkedItemsWarningList(data.linkedItems);
    } else {
        content += `
          <div class="no-linked-items">
            <strong>ℹ️ לא נמצאו אובייקטים מקושרים</strong><br>
            למרות זאת, לא ניתן למחוק ${getItemTypeDisplayName(itemType)} זה.
          </div>
        `;
    }

    content += `
        </div>
      </div>

      <div class="alert alert-info">
        <strong>💡 מה ניתן לעשות:</strong>
        <ul class="mb-0">
          <li>בטל את הקישור לפריטים המקושרים</li>
          <li>מחק את הפריטים המקושרים תחילה</li>
          <li>או בחר "מחק בכל זאת" (זהירות!)</li>
        </ul>
      </div>
    </div>
  `;

    return content;
}

/**
 * Create linked items warning list
 * 
 * Creates a 3-column grid layout for displaying linked items in warning modal.
 * 
 * @param {Array} linkedItems - Array of linked items
 * @returns {string} HTML content for the linked items list
 */
function createLinkedItemsWarningList(linkedItems) {
    if (!linkedItems || linkedItems.length === 0) {
        return '<div class="alert alert-info">אין אובייקטים מקושרים</div>';
    }

    let content = '';
    linkedItems.forEach(item => {
        content += `
        <div class="linked-item-card">
          <div class="linked-item-header">
            <span class="linked-item-type">${getItemTypeIcon(item.type)} ${getItemTypeDisplayName(item.type)}</span>
            <span class="linked-item-id">#${item.id}</span>
          </div>
          <div class="linked-item-content">
            <div class="linked-item-title">${item.title || item.name || `#${item.id}`}</div>
            <div class="linked-item-details">
              ${createBasicItemInfo(item)}
            </div>
          </div>
          <div class="linked-item-actions">
            <button class="btn btn-outline-primary" onclick="viewItemDetails('${item.type}', ${item.id})">
              <i class="fas fa-eye"></i> צפייה
            </button>
            <button class="btn btn-outline-warning" onclick="unlinkItem('${item.type}', ${item.id})">
              <i class="fas fa-unlink"></i> נתק
            </button>
          </div>
        </div>
      `;
    });
    return content;
}

/**
 * Force delete with linked items
 * 
 * Handles the force deletion when user clicks "מחק בכל זאת"
 * 
 * @param {string} itemType - Type of the item
 * @param {string|number} itemId - ID of the item
 * @param {Function} onConfirm - Callback function when user confirms deletion
 */
function forceDeleteWithLinkedItems(itemType, itemId, onConfirm) {
    // Close the warning modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('linkedItemsWarningModal'));
    if (modal) {
        modal.hide();
    }

    // Show final confirmation
    if (confirm(`האם אתה בטוח שברצונך למחוק ${getItemTypeDisplayName(itemType)} #${itemId} יחד עם כל האובייקטים המקושרים אליו?`)) {
        if (onConfirm && typeof onConfirm === 'function') {
            onConfirm();
        }
    }
}

/**
 * Get item type icon
 * 
 * @param {string} itemType - Type of the item
 * @returns {string} Icon HTML
 */
function getItemTypeIcon(itemType) {
    const icons = {
        'account': '🏦',
        'trade': '📈',
        'ticker': '📊',
        'alert': '🔔',
        'cash_flow': '💰',
        'note': '📝',
        'trade_plan': '📋',
        'execution': '⚡'
    };
    return icons[itemType] || '📄';
}

/**
 * Get item type display name
 * 
 * @param {string} itemType - Type of the item
 * @returns {string} Display name
 */
function getItemTypeDisplayName(itemType) {
    const names = {
        'account': 'חשבון',
        'trade': 'טרייד',
        'ticker': 'טיקר',
        'alert': 'התראה',
        'cash_flow': 'תזרים מזומנים',
        'note': 'הערה',
        'trade_plan': 'תוכנית טרייד',
        'execution': 'ביצוע'
    };
    return names[itemType] || 'אובייקט';
}

/**
 * Create basic item info
 * 
 * @param {Object} item - Item data
 * @returns {string} HTML content
 */
function createBasicItemInfo(item) {
    let info = '';

    if (item.status) {
        const statusClass = item.status === 'open' ? 'text-success' :
            item.status === 'closed' ? 'text-warning' : 'text-danger';
        info += `<div class="item-status ${statusClass}">סטטוס: ${item.status}</div>`;
    }

    if (item.created_at) {
        info += `<div class="item-date">נוצר: ${item.created_at}</div>`;
    }

    if (item.notes) {
        info += `<div class="item-notes">הערות: ${item.notes.substring(0, 50)}${item.notes.length > 50 ? '...' : ''}</div>`;
    }

    return info || '<div class="item-no-info">אין מידע נוסף</div>';
}

// אתחול UI Utils
function initializeUIUtils() {
    // UI Utils loaded successfully
}

// Export functions to global scope
window.uiUtils = {
    showErrorNotification,
    showSuccessNotification,
    showInfoNotification,
    createToastContainer,
    showSecondConfirmationModal,
    showNotification,
    showLinkedItemsWarningModal,
    createLinkedItemsWarningContent,
    createLinkedItemsWarningList,
    forceDeleteWithLinkedItems,
    showLinkedItemsBlockingModal,
    createLinkedItemsBlockingContent,
    createLinkedItemsDetailedList,
    createDetailedItemInfo,
    getItemTypeIcon,
    getItemTypeDisplayName,
    createBasicItemInfo
};

// Export individual functions to global scope
window.showLinkedItemsWarningModal = showLinkedItemsWarningModal;
window.createLinkedItemsWarningContent = createLinkedItemsWarningContent;
window.createLinkedItemsWarningList = createLinkedItemsWarningList;
window.forceDeleteWithLinkedItems = forceDeleteWithLinkedItems;
window.showLinkedItemsBlockingModal = showLinkedItemsBlockingModal;
window.createLinkedItemsBlockingContent = createLinkedItemsBlockingContent;
window.createLinkedItemsDetailedList = createLinkedItemsDetailedList;
window.createDetailedItemInfo = createDetailedItemInfo;
window.getItemTypeIcon = getItemTypeIcon;
window.getItemTypeDisplayName = getItemTypeDisplayName;
window.createBasicItemInfo = createBasicItemInfo;

/**
 * Show linked items blocking modal
 * 
 * Shows a modal that blocks deletion/cancellation when there are linked items.
 * This modal does NOT allow the action to proceed - it only shows information.
 * 
 * @param {Object} data - Linked items data
 * @param {string} itemType - Type of the item
 * @param {string|number} itemId - ID of the item
 * @param {string} actionType - Type of action being blocked ('delete' or 'cancel')
 */
function showLinkedItemsBlockingModal(data, itemType, itemId, actionType = 'delete') {

    // Create modal content
    const modalContent = createLinkedItemsBlockingContent(data, itemType, itemId, actionType);

    // Create and show modal
    const modalId = 'linkedItemsBlockingModal';
    const actionText = actionType === 'cancel' ? 'ביטול' : 'מחיקה';
    const modalTitle = `⚠️ לא ניתן לבצע ${actionText}: ${getItemTypeDisplayName(itemType)} #${itemId}`;

    // Remove existing modal if it exists
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
        existingModal.remove();
    }

    // Create new modal with linked-items-modal class
    const modalHtml = `
    <div class="modal fade linked-items-modal" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="${modalId}Label">${modalTitle}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            ${modalContent}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">סגור</button>
          </div>
        </div>
      </div>
    </div>
  `;

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
}

/**
 * Create linked items blocking modal content
 * 
 * Generates the HTML content for the linked items blocking modal, including
 * detailed information about linked items that prevent the action.
 * 
 * @param {Object} data - Linked items data
 * @param {string} itemType - Type of the item
 * @param {string|number} itemId - ID of the item
 * @param {string} actionType - Type of action being blocked
 * @returns {string} HTML content for the modal
 */
function createLinkedItemsBlockingContent(data, itemType, itemId, actionType) {

    // יצירת כותרת מותאמת לפי סוג האלמנט והפעולה
    let headerTitle = '';
    let itemName = '';
    let actionText = actionType === 'cancel' ? 'ביטול' : 'מחיקה';

    switch (itemType) {
        case 'account':
            headerTitle = `לא ניתן לבצע ${actionText} חשבון:`;
            itemName = data.accountName || `חשבון ${itemId}`;
            break;
        case 'trade':
            headerTitle = `לא ניתן לבצע ${actionText} טרייד:`;
            itemName = data.tradeSymbol || `טרייד ${itemId}`;
            break;
        case 'ticker':
            headerTitle = `לא ניתן לבצע ${actionText} טיקר:`;
            itemName = data.tickerSymbol || `טיקר ${itemId}`;
            break;
        case 'alert':
            headerTitle = `לא ניתן לבצע ${actionText} התראה:`;
            itemName = data.alertName || `התראה ${itemId}`;
            break;
        case 'cash_flow':
            headerTitle = `לא ניתן לבצע ${actionText} תזרים מזומנים:`;
            itemName = data.cashFlowName || `תזרים ${itemId}`;
            break;
        case 'note':
            headerTitle = `לא ניתן לבצע ${actionText} הערה:`;
            itemName = data.noteTitle || `הערה ${itemId}`;
            break;
        case 'trade_plan':
            headerTitle = `לא ניתן לבצע ${actionText} תוכנית טרייד:`;
            itemName = data.planName || `תוכנית ${itemId}`;
            break;
        case 'execution':
            headerTitle = `לא ניתן לבצע ${actionText} ביצוע:`;
            itemName = data.executionName || `ביצוע ${itemId}`;
            break;
        default:
            headerTitle = `לא ניתן לבצע ${actionText} רשומה:`;
            itemName = `רשומה ${itemId}`;
    }

    let content = `
    <div class="linked-items-container">
      <div class="alert alert-danger">
        <strong>🚫 ${headerTitle} <span class="text-danger">${itemName}</span></strong>
        <br>
        ${getItemTypeDisplayName(itemType)} זה מקושר לפריטים הבאים במערכת. יש לטפל בהם תחילה לפני ${actionText}:
      </div>

      <div class="linked-items-section">
        <h6>📋 פריטים מקושרים (${data && data.linkedItems ? data.linkedItems.length : 0})</h6>
        <div class="linked-items-list">
  `;

    // Add linked items list with detailed information
    if (data && data.linkedItems && data.linkedItems.length > 0) {
        content += createLinkedItemsDetailedList(data.linkedItems);
    } else {
        content += `
          <div class="no-linked-items">
            <strong>ℹ️ לא נמצאו אובייקטים מקושרים</strong><br>
            למרות זאת, לא ניתן לבצע ${actionText} ${getItemTypeDisplayName(itemType)} זה.
          </div>
        `;
    }

    content += `
        </div>
      </div>

      <div class="alert alert-info">
        <strong>💡 מה ניתן לעשות:</strong>
        <ul class="mb-0">
          <li>בטל את הקישור לפריטים המקושרים</li>
          <li>מחק את הפריטים המקושרים תחילה</li>
          <li>או פנה למנהל המערכת</li>
        </ul>
      </div>
    </div>
  `;

    return content;
}

/**
 * Create detailed linked items list
 * 
 * Creates a detailed list of linked items with specific fields for each type.
 * 
 * @param {Array} linkedItems - Array of linked items
 * @returns {string} HTML content for the detailed linked items list
 */
function createLinkedItemsDetailedList(linkedItems) {
    if (!linkedItems || linkedItems.length === 0) {
        return '<div class="alert alert-info">אין אובייקטים מקושרים</div>';
    }

    let content = '';

    linkedItems.forEach(item => {
        content += `
        <div class="linked-item-card">
          <div class="linked-item-header">
            <span class="linked-item-type">${getItemTypeIcon(item.type)} ${getItemTypeDisplayName(item.type)}</span>
            <span class="linked-item-id">#${item.id}</span>
          </div>
          <div class="linked-item-content">
            <div class="linked-item-title">${item.title || item.name || `#${item.id}`}</div>
            <div class="linked-item-details">
              ${createDetailedItemInfo(item)}
            </div>
          </div>
          <div class="linked-item-actions">
            <button class="btn btn-outline-primary" onclick="viewItemDetails('${item.type}', ${item.id})">
              <i class="fas fa-eye"></i> צפייה
            </button>
            <button class="btn btn-outline-warning" onclick="unlinkItem('${item.type}', ${item.id})">
              <i class="fas fa-unlink"></i> נתק
            </button>
          </div>
        </div>
      `;
    });

    return content;
}

/**
 * Create detailed item information
 * 
 * @param {Object} item - Item data
 * @returns {string} HTML content for detailed item info
 */
function createDetailedItemInfo(item) {
    let info = '';

    // Common fields
    if (item.status) {
        const statusClass = item.status === 'open' ? 'text-success' :
            item.status === 'closed' ? 'text-warning' : 'text-danger';
        info += `<div class="item-status ${statusClass}">סטטוס: ${item.status}</div>`;
    }

    if (item.created_at) {
        info += `<div class="item-date">נוצר: ${item.created_at}</div>`;
    }

    // Type-specific fields
    if (item.type === 'execution') {
        if (item.action) info += `<div class="item-action">פעולה: ${item.action}</div>`;
        if (item.quantity) info += `<div class="item-quantity">כמות: ${item.quantity}</div>`;
        if (item.price) info += `<div class="item-price">מחיר: $${item.price}</div>`;
    }

    if (item.type === 'note') {
        if (item.content) {
            const shortContent = item.content.length > 100 ?
                item.content.substring(0, 100) + '...' : item.content;
            info += `<div class="item-content">תוכן: ${shortContent}</div>`;
        }
    }

    if (item.notes) {
        const shortNotes = item.notes.length > 50 ?
            item.notes.substring(0, 50) + '...' : item.notes;
        info += `<div class="item-notes">הערות: ${shortNotes}</div>`;
    }

    return info || '<div class="item-no-info">אין מידע נוסף</div>';
}
