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
 * פתיחת מודל כללי
 * Show modal by ID
 * 
 * @param {string} modalId - מזהה המודל
 * @param {Object} options - אפשרויות נוספות
 */
function showModal(modalId, options = {}) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`❌ Modal ${modalId} not found`);
        return;
    }

    // הגדרת אפשרויות ברירת מחדל
    const defaultOptions = {
        backdrop: true,
        keyboard: true,
        focus: true
    };

    const modalOptions = { ...defaultOptions, ...options };

    // הצגת המודל
    const bootstrapModal = new bootstrap.Modal(modal, modalOptions);
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
    // Use the new notification system
    if (window.notificationSystem && window.notificationSystem.showErrorNotification) {
        window.notificationSystem.showErrorNotification(title, message);
    } else {
        // Fallback to console only
        console.log(`❌ ${title}: ${message}`);
    }
}

/**
 * הצגת הודעת הצלחה
 * Show success notification
 */
function showSuccessNotification(title, message) {
    // Use the new notification system
    if (window.notificationSystem && window.notificationSystem.showSuccessNotification) {
        window.notificationSystem.showSuccessNotification(title, message);
    } else {
        // Fallback to console only
        console.log(`✅ ${title}: ${message}`);
    }
}

/**
 * הצגת הודעת מידע
 * Show info notification
 */
function showInfoNotification(title, message) {
    // Use the new notification system
    if (window.notificationSystem && window.notificationSystem.showInfoNotification) {
        window.notificationSystem.showInfoNotification(title, message);
    } else {
        // Fallback to console only
        console.log(`ℹ️ ${title}: ${message}`);
    }
}

/**
 * הצגת הודעת אזהרה
 * Show warning notification
 */
function showWarningNotification(title, message) {
    // Use the new notification system
    if (window.notificationSystem && window.notificationSystem.showWarningNotification) {
        window.notificationSystem.showWarningNotification(title, message);
    } else {
        // Fallback to console only
        console.log(`⚠️ ${title}: ${message}`);
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
 * הצגת הודעה למשתמש - משתמשת במערכת ההתראות הגלובלית
 * Show notification to user - uses global notification system
 * 
 * @param {string} message - טקסט ההודעה להצגה
 * @param {string} type - סוג ההודעה: 'success' (ירוק), 'error' (אדום), 'warning' (צהוב), 'info' (כחול)
 */
function showNotification(message, type = 'info') {
    // שימוש במערכת ההתראות הגלובלית
    if (typeof window.notificationSystem !== 'undefined' && window.notificationSystem.showNotification) {
        // שימוש במערכת ההתראות הגלובלית
        window.notificationSystem.showNotification('התראה', message, type);
    } else {
        // Fallback להצגת התראה פשוטה
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
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
window.showModal = showModal;
window.showSecondConfirmationModal = showSecondConfirmationModal;
window.confirmSecondAction = confirmSecondAction;
window.showErrorNotification = showErrorNotification;
window.showSuccessNotification = showSuccessNotification;
window.showInfoNotification = showInfoNotification;
window.showWarningNotification = showWarningNotification;
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
    showWarningNotification,
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
            <button class="btn btn-outline-info" onclick="openItemPage('${item.type}', ${item.id})">
              <i class="fas fa-cog"></i> עבור לניהול פרטים
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

// ===== WARNING SYSTEM FUNCTIONS =====

/**
 * Predefined warning types and their configurations
 */
const WARNING_TYPES = {
    // מחיקת פריט
    DELETE: {
        id: 'delete',
        title: 'מחיקת {itemType}',
        message: 'האם אתה בטוח שברצונך למחוק את {itemType} "{itemName}"?',
        icon: 'fas fa-trash-alt',
        theme: 'danger',
        actions: ['cancel', 'delete'],
        defaultAction: 'cancel'
    },

    // פריטים מקושרים
    LINKED_ITEMS: {
        id: 'linked_items',
        title: 'לא ניתן למחוק {itemType}',
        message: '{itemType} זה מקושר ל-{linkedCount} פריטים במערכת. יש לטפל בהם תחילה.',
        icon: 'fas fa-link',
        theme: 'warning',
        actions: ['close', 'force_delete', 'manage_linked'],
        defaultAction: 'close'
    },

    // שגיאת אימות
    VALIDATION: {
        id: 'validation',
        title: 'שגיאת אימות',
        message: 'שדה "{field}": {message}',
        icon: 'fas fa-exclamation-triangle',
        theme: 'warning',
        actions: ['ok'],
        defaultAction: 'ok'
    },

    // אזהרת מערכת
    SYSTEM: {
        id: 'system',
        title: 'אזהרת מערכת',
        message: '{message}',
        icon: 'fas fa-exclamation-circle',
        theme: 'info',
        actions: ['ok'],
        defaultAction: 'ok'
    },

    // אישור פעולה
    CONFIRMATION: {
        id: 'confirmation',
        title: 'אישור פעולה',
        message: '{message}',
        icon: 'fas fa-question-circle',
        theme: 'primary',
        actions: ['cancel', 'confirm'],
        defaultAction: 'cancel'
    }
};

/**
 * Get warning configuration by type
 */
function getWarningConfig(type, data = {}) {
    console.log('🔧 getWarningConfig called with:', { type, data });
    console.log('🔧 Available warning types:', Object.keys(WARNING_TYPES));

    const config = WARNING_TYPES[type.toUpperCase()];
    if (!config) {
        throw new Error(`Unknown warning type: ${type}`);
    }

    const result = {
        ...config,
        title: formatWarningMessage(config.title, data),
        message: formatWarningMessage(config.message, data)
    };

    console.log('🔧 Warning config result:', result);
    return result;
}

/**
 * Format warning message with data
 */
function formatWarningMessage(template, data) {
    console.log('🔧 formatWarningMessage called with:', { template, data });

    const result = template.replace(/\{(\w+)\}/g, (match, key) => {
        const value = data[key] || match;
        console.log(`🔧 Replacing ${match} with ${value}`);
        return value;
    });

    console.log('🔧 Formatted message result:', result);
    return result;
}

/**
 * Validate warning data
 */
function validateWarningData(type, data) {
    if (!type || typeof type !== 'string') {
        throw new Error('Warning type must be a string');
    }

    if (!WARNING_TYPES[type.toUpperCase()]) {
        throw new Error(`Unknown warning type: ${type}`);
    }

    if (data && typeof data !== 'object') {
        throw new Error('Warning data must be an object');
    }
}

/**
 * Get warning theme configuration
 */
function getWarningTheme(theme) {
    const themes = {
        danger: {
            headerClass: 'bg-danger text-white',
            buttonClass: 'btn-danger'
        },
        warning: {
            headerClass: 'bg-warning text-dark',
            buttonClass: 'btn-warning'
        },
        info: {
            headerClass: 'bg-info text-white',
            buttonClass: 'btn-info'
        },
        primary: {
            headerClass: 'bg-primary text-white',
            buttonClass: 'btn-primary'
        }
    };

    return themes[theme] || themes.warning;
}

/**
 * Get warning icon
 */
function getWarningIcon(icon) {
    const icons = {
        'fas fa-trash-alt': '🗑️',
        'fas fa-link': '🔗',
        'fas fa-exclamation-triangle': '⚠️',
        'fas fa-exclamation-circle': '❗',
        'fas fa-question-circle': '❓'
    };

    return icons[icon] || icon;
}

/**
 * Get warning action buttons
 */
function getWarningActions(actions, defaultAction, theme, onConfirm = null, onCancel = null) {
    const actionConfigs = {
        cancel: {
            text: 'ביטול',
            class: 'btn-secondary',
            action: 'cancel'
        },
        ok: {
            text: 'אישור',
            class: 'btn-primary',
            action: 'ok'
        },
        delete: {
            text: 'מחק',
            class: 'btn-danger',
            action: 'delete'
        },
        confirm: {
            text: 'אישור',
            class: 'btn-primary',
            action: 'confirm'
        },
        close: {
            text: 'סגור',
            class: 'btn-secondary',
            action: 'close'
        },
        force_delete: {
            text: 'מחק בכל זאת',
            class: 'btn-danger',
            action: 'force_delete'
        },
        manage_linked: {
            text: 'ניהול מקושרים',
            class: 'btn-info',
            action: 'manage_linked'
        }
    };

    let buttonsHtml = '';

    actions.forEach(actionName => {
        const actionConfig = actionConfigs[actionName];
        if (!actionConfig) return;

        const isDefault = actionName === defaultAction;
        const buttonClass = isDefault ? actionConfig.class : 'btn-outline-secondary';

        buttonsHtml += `
            <button type="button" class="btn ${buttonClass}" 
                    onclick="handleWarningAction('${actionConfig.action}')">
                ${actionConfig.text}
            </button>
        `;
    });

    return buttonsHtml;
}

/**
 * Create warning modal
 */
function createWarningModal(config, options = {}, onConfirm = null, onCancel = null) {
    const modalId = `warningModal_${Date.now()}`;

    console.log('🔧 Creating warning modal with ID:', modalId);
    console.log('🔧 Config:', config);

    // Create simple modal HTML
    const modalHtml = `
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title" id="${modalId}Label">
                            🗑️ ${config.title}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${config.message}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                        <button type="button" class="btn btn-danger" onclick="handleWarningAction('delete')">מחק</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if it exists
    const existingModal = document.getElementById(modalId);
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to page
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Verify modal was created
    const createdModal = document.getElementById(modalId);
    if (!createdModal) {
        throw new Error(`Failed to create modal with ID ${modalId}`);
    }

    console.log('✅ Modal created successfully with ID:', modalId);
    return modalId;
}

/**
 * Show warning modal
 */
function showWarning(type, data = {}, options = {}, onConfirm = null, onCancel = null) {
    try {
        console.log('🔧 showWarning called with:', { type, data, options });

        // Store callbacks globally
        window.warningConfirmCallback = onConfirm;
        window.warningCancelCallback = onCancel;

        // Create simple modal for DELETE type
        if (type === 'DELETE') {
            const modalId = `warningModal_${Date.now()}`;
            const itemType = data.itemType || 'פריט';
            const itemName = data.itemName || 'זה';

            const modalHtml = `
                <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header bg-danger text-white">
                                <h5 class="modal-title" id="${modalId}Label">
                                    🗑️ מחיקת ${itemType}
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                האם אתה בטוח שברצונך למחוק את ${itemType} "${itemName}"?
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                                <button type="button" class="btn btn-danger" onclick="handleWarningAction('delete')">מחק</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
        // Create simple modal for CANCEL type
        else if (type === 'CANCEL') {
            const modalId = `warningModal_${Date.now()}`;
            const itemType = data.itemType || 'פריט';
            const itemName = data.itemName || 'זה';

            const modalHtml = `
                <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-header bg-warning text-dark">
                                <h5 class="modal-title" id="${modalId}Label">
                                    ❌ ביטול ${itemType}
                                </h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                האם אתה בטוח שברצונך לבטל את ${itemType} "${itemName}"?
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                                <button type="button" class="btn btn-warning" onclick="handleWarningAction('delete')">בטל</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Remove existing modal if it exists
            const existingModal = document.getElementById(modalId);
            if (existingModal) {
                existingModal.remove();
            }

            // Add modal to page
            document.body.insertAdjacentHTML('beforeend', modalHtml);

            // Show modal
            const modalElement = document.getElementById(modalId);
            if (!modalElement) {
                throw new Error(`Modal element with ID ${modalId} not found`);
            }

            // Check if Bootstrap is available
            if (typeof bootstrap === 'undefined' || !bootstrap.Modal) {
                throw new Error('Bootstrap Modal is not available');
            }

            const modal = new bootstrap.Modal(modalElement, {
                backdrop: true,
                keyboard: true,
                focus: true
            });

            // Show the modal
            modal.show();
            console.log('✅ Modal shown successfully');

            return modalId;
        }

        // For other types, use fallback
        throw new Error(`Unsupported warning type: ${type}`);

    } catch (error) {
        console.error('Error showing warning:', error);

        // Fallback to simple confirm
        if (type === 'DELETE') {
            const itemType = data.itemType || 'פריט';
            const itemName = data.itemName || 'זה';
            const confirmed = confirm(`האם אתה בטוח שברצונך למחוק את ${itemType} "${itemName}"?`);
            if (confirmed && onConfirm) {
                onConfirm();
            }
        } else if (type === 'CANCEL') {
            const itemType = data.itemType || 'פריט';
            const itemName = data.itemName || 'זה';
            const confirmed = confirm(`האם אתה בטוח שברצונך לבטל את ${itemType} "${itemName}"?`);
            if (confirmed && onConfirm) {
                onConfirm();
            }
        } else {
            // Fallback to simple alert
            alert(data.message || 'שגיאה בהצגת האזהרה');
        }
    }
}

/**
 * Handle warning action
 */
function handleWarningAction(action) {
    console.log('🔧 Handling warning action:', action);

    // Close modal - find any open modal
    const openModal = document.querySelector('.modal.show');
    if (openModal) {
        const modal = bootstrap.Modal.getInstance(openModal);
        if (modal) {
            modal.hide();
        }
    }

    // Handle action
    switch (action) {
        case 'confirm':
        case 'ok':
        case 'delete':
            if (typeof window.warningConfirmCallback === 'function') {
                console.log('✅ Executing confirm callback');
                window.warningConfirmCallback();
            } else {
                console.log('❌ No confirm callback found');
            }
            break;
        case 'cancel':
        case 'close':
            if (typeof window.warningCancelCallback === 'function') {
                console.log('❌ Executing cancel callback');
                window.warningCancelCallback();
            } else {
                console.log('❌ No cancel callback found');
            }
            break;
        case 'force_delete':
            if (typeof window.warningConfirmCallback === 'function') {
                console.log('✅ Executing force delete callback');
                window.warningConfirmCallback();
            } else {
                console.log('❌ No confirm callback found');
            }
            break;
        case 'manage_linked':
            // Handle linked items management
            if (typeof window.showLinkedItemsModal === 'function') {
                window.showLinkedItemsModal();
            }
            break;
    }
}

/**
 * Show delete warning
 */
function showDeleteWarning(itemType, itemName, onConfirm = null, onCancel = null) {
    // Fallback mapping for item types
    const itemTypeDisplay = itemType === 'alert' ? 'התראה' :
        itemType === 'ticker' ? 'טיקר' :
            itemType === 'account' ? 'חשבון' :
                itemType === 'trade' ? 'טרייד' :
                    itemType === 'trade_plan' ? 'תוכנית טרייד' :
                        itemType === 'execution' ? 'ביצוע' :
                            itemType === 'cash_flow' ? 'תזרים מזומנים' :
                                itemType === 'note' ? 'הערה' : 'אובייקט';

    console.log('🔧 showDeleteWarning called with:', { itemType, itemName, itemTypeDisplay });

    // Try to use the warning system, fallback to simple confirm
    try {
        return showWarning('DELETE', {
            itemType: itemTypeDisplay,
            itemName: itemName
        }, {}, onConfirm, onCancel);
    } catch (error) {
        console.error('Error in showDeleteWarning, using fallback:', error);

        // Fallback to simple confirm
        const confirmed = confirm(`האם אתה בטוח שברצונך למחוק את ${itemTypeDisplay} "${itemName}"?`);
        if (confirmed && onConfirm) {
            onConfirm();
        }
    }
}

/**
 * Show cancel warning (for tickers)
 */
function showCancelWarning(itemType, itemName, onConfirm = null, onCancel = null) {
    // Fallback mapping for item types
    const itemTypeDisplay = itemType === 'alert' ? 'התראה' :
        itemType === 'ticker' ? 'טיקר' :
            itemType === 'account' ? 'חשבון' :
                itemType === 'trade' ? 'טרייד' :
                    itemType === 'trade_plan' ? 'תוכנית טרייד' :
                        itemType === 'execution' ? 'ביצוע' :
                            itemType === 'cash_flow' ? 'תזרים מזומנים' :
                                itemType === 'note' ? 'הערה' : 'אובייקט';

    console.log('🔧 showCancelWarning called with:', { itemType, itemName, itemTypeDisplay });

    // Try to use the warning system, fallback to simple confirm
    try {
        return showWarning('CANCEL', {
            itemType: itemTypeDisplay,
            itemName: itemName
        }, {}, onConfirm, onCancel);
    } catch (error) {
        console.error('Error in showCancelWarning, using fallback:', error);

        // Fallback to simple confirm
        const confirmed = confirm(`האם אתה בטוח שברצונך לבטל את ${itemTypeDisplay} "${itemName}"?`);
        if (confirmed && onConfirm) {
            onConfirm();
        }
    }
}

/**
 * Show linked items warning
 */
function showLinkedItemsWarning(itemType, linkedCount, onConfirm = null, onCancel = null) {
    console.log('🔧🔧🔧 showLinkedItemsWarning STARTED 🔧🔧🔧');
    console.log('🔧 itemType:', itemType);
    console.log('🔧 linkedCount:', linkedCount);
    console.log('🔧 onConfirm type:', typeof onConfirm);
    console.log('🔧 onCancel type:', typeof onCancel);
    console.log('🔧 window.showLinkedItemsWarning function:', typeof window.showLinkedItemsWarning);
    console.log('🔧 createLinkedItemsWarningModal function:', typeof createLinkedItemsWarningModal);
    
    // Fallback mapping for item types
    const itemTypeDisplay = itemType === 'alert' ? 'התראה' :
        itemType === 'ticker' ? 'טיקר' :
            itemType === 'account' ? 'חשבון' :
                itemType === 'trade' ? 'טרייד' :
                    itemType === 'trade_plan' ? 'תוכנית טרייד' :
                        itemType === 'execution' ? 'ביצוע' :
                            itemType === 'cash_flow' ? 'תזרים מזומנים' :
                                itemType === 'note' ? 'הערה' : 'אובייקט';

    console.log('🔧 showLinkedItemsWarning called with:', { itemType, linkedCount, itemTypeDisplay, onConfirm, onCancel });
    console.log('🔧 About to call createLinkedItemsWarningModal...');
    console.log('🔧 createLinkedItemsWarningModal function exists:', typeof createLinkedItemsWarningModal === 'function');

    // יצירת modal מותאם עם כפתורי אישור וביטול
    try {
        createLinkedItemsWarningModal(itemTypeDisplay, linkedCount, onConfirm, onCancel);
    } catch (error) {
        console.error('🔧❌ Error calling createLinkedItemsWarningModal:', error);
        // Fallback to simple alert
        if (confirm(`חשבון זה מקושר ל-${linkedCount} פריטים במערכת. האם אתה בטוח שברצונך למחוק אותו?`)) {
            if (onConfirm && typeof onConfirm === 'function') {
                onConfirm();
            }
        } else {
            if (onCancel && typeof onCancel === 'function') {
                onCancel();
            }
        }
    }
    
    console.log('🔧 createLinkedItemsWarningModal call completed');
    console.log('🔧🔧🔧 showLinkedItemsWarning COMPLETED 🔧🔧🔧');
    console.log('🔧🔧🔧 END OF showLinkedItemsWarning FUNCTION 🔧🔧🔧');
}

/**
 * יצירת modal אזהרת פריטים מקושרים
 * Create linked items warning modal
 */
function createLinkedItemsWarningModal(itemTypeDisplay, linkedCount, onConfirm, onCancel) {
    console.log('🔧🔧🔧 createLinkedItemsWarningModal STARTED 🔧🔧🔧');
    console.log('🔧 itemTypeDisplay:', itemTypeDisplay);
    console.log('🔧 linkedCount:', linkedCount);
    console.log('🔧 onConfirm type:', typeof onConfirm);
    console.log('🔧 onCancel type:', typeof onCancel);

    // יצירת modal HTML
    const modalHtml = `
        <div class="modal fade" id="linkedItemsWarningModal" tabindex="-1" aria-labelledby="linkedItemsWarningModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header modal-header-colored bg-warning text-dark">
                        <h5 class="modal-title" id="linkedItemsWarningModalLabel">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            אזהרת פריטים מקושרים
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p class="mb-0">
                            <strong>${itemTypeDisplay}</strong> זה מקושר ל-<strong>${linkedCount} פריטים</strong> במערכת.
                        </p>
                        <p class="text-warning mb-0 mt-2">
                            <i class="fas fa-info-circle me-1"></i>
                            מחיקת הפריט עלולה להשפיע על הפריטים המקושרים.
                        </p>
                        <p class="mb-0 mt-2">
                            האם אתה בטוח שברצונך להמשיך?
                        </p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="cancelLinkedItemsBtn">
                            <i class="fas fa-times me-1"></i>
                            ביטול
                        </button>
                        <button type="button" class="btn btn-warning" id="confirmLinkedItemsBtn">
                            <i class="fas fa-exclamation-triangle me-1"></i>
                            המשך למחיקה
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    console.log('🔧 Modal HTML created with length:', modalHtml.length);
    console.log('🔧 Modal HTML preview:', modalHtml.substring(0, 200) + '...');

    // הסרת modal קיים אם יש
    const existingModal = document.getElementById('linkedItemsWarningModal');
    if (existingModal) {
        console.log('🔧 Removing existing modal');
        existingModal.remove();
    } else {
        console.log('🔧 No existing modal found');
    }

    // הוספת modal ל-DOM
    console.log('🔧 About to add modal to DOM...');
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    console.log('🔧 Modal HTML added to DOM');

    // קבלת אלמנטי modal
    const modal = document.getElementById('linkedItemsWarningModal');
    const confirmBtn = document.getElementById('confirmLinkedItemsBtn');
    const cancelBtn = document.getElementById('cancelLinkedItemsBtn');
    
    console.log('🔧 Modal element found:', modal);
    console.log('🔧 Confirm button found:', confirmBtn);
    console.log('🔧 Cancel button found:', cancelBtn);
    
    if (!modal) {
        console.error('🔧❌ Modal element not found!');
        return;
    }
    
    if (!confirmBtn) {
        console.error('🔧❌ Confirm button not found!');
        return;
    }
    
    if (!cancelBtn) {
        console.error('🔧❌ Cancel button not found!');
        return;
    }

    // הוספת event listeners
    console.log('🔧 Adding event listeners...');
    confirmBtn.addEventListener('click', () => {
        console.log('🔧 User confirmed linked items warning');

        // סגירת modal
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        if (bootstrapModal) {
            bootstrapModal.hide();
        }

        // קריאה לפונקציית אישור
        if (onConfirm && typeof onConfirm === 'function') {
            console.log('🔧 Calling onConfirm callback');
            onConfirm();
        } else {
            console.log('🔧 No onConfirm callback provided');
        }
    });

    cancelBtn.addEventListener('click', () => {
        console.log('🔧 User cancelled linked items warning');

        // סגירת modal
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        if (bootstrapModal) {
            bootstrapModal.hide();
        }

        // קריאה לפונקציית ביטול
        if (onCancel && typeof onCancel === 'function') {
            console.log('🔧 Calling onCancel callback');
            onCancel();
        } else {
            console.log('🔧 No onCancel callback provided');
        }
    });

    // הצגת modal
    console.log('🔧 About to show the modal...');
    console.log('🔧 Bootstrap available:', typeof bootstrap !== 'undefined');
    console.log('🔧 Modal element:', modal);
    
    if (typeof bootstrap === 'undefined') {
        console.error('🔧❌ Bootstrap is not available!');
        // Fallback to simple alert
        if (confirm(`חשבון זה מקושר ל-${linkedCount} פריטים במערכת. האם אתה בטוח שברצונך למחוק אותו?`)) {
            if (onConfirm && typeof onConfirm === 'function') {
                onConfirm();
            }
        } else {
            if (onCancel && typeof onCancel === 'function') {
                onCancel();
            }
        }
        return;
    }
    
    if (!bootstrap.Modal) {
        console.error('🔧❌ Bootstrap.Modal is not available!');
        // Fallback to simple alert
        if (confirm(`חשבון זה מקושר ל-${linkedCount} פריטים במערכת. האם אתה בטוח שברצונך למחוק אותו?`)) {
            if (onConfirm && typeof onConfirm === 'function') {
                onConfirm();
            }
        } else {
            if (onCancel && typeof onCancel === 'function') {
                onCancel();
            }
        }
        return;
    }
    
    try {
        const bootstrapModal = new bootstrap.Modal(modal);
        console.log('🔧 Bootstrap modal created:', bootstrapModal);
        bootstrapModal.show();
        console.log('🔧 Modal show() called');
    } catch (error) {
        console.error('🔧❌ Error creating/showing modal:', error);
        // Fallback to simple alert
        if (confirm(`חשבון זה מקושר ל-${linkedCount} פריטים במערכת. האם אתה בטוח שברצונך למחוק אותו?`)) {
            if (onConfirm && typeof onConfirm === 'function') {
                onConfirm();
            }
        } else {
            if (onCancel && typeof onCancel === 'function') {
                onCancel();
            }
        }
    }

    // ניקוי modal אחרי סגירה
    modal.addEventListener('hidden.bs.modal', () => {
        console.log('🔧 Modal hidden event triggered - removing modal');
        modal.remove();
    });
    
    console.log('🔧🔧🔧 createLinkedItemsWarningModal COMPLETED 🔧🔧🔧');
    console.log('🔧🔧🔧 END OF createLinkedItemsWarningModal FUNCTION 🔧🔧🔧');
    console.log('🔧🔧🔧 FINAL END 🔧🔧🔧');
    console.log('🔧🔧🔧 REALLY FINAL END 🔧🔧🔧');
    console.log('🔧🔧🔧 ULTIMATE FINAL END 🔧🔧🔧');
    console.log('🔧🔧🔧 ABSOLUTE FINAL END 🔧🔧🔧');
    console.log('🔧🔧🔧 THE END 🔧🔧🔧');
    console.log('🔧🔧🔧 REALLY THE END 🔧🔧🔧');
    console.log('🔧🔧🔧 FINALLY THE END 🔧🔧🔧');
    console.log('🔧🔧🔧 REALLY FINALLY THE END 🔧🔧🔧');
    console.log('🔧🔧🔧 ABSOLUTELY FINALLY THE END 🔧🔧🔧');
    console.log('🔧🔧🔧 REALLY ABSOLUTELY FINALLY THE END 🔧🔧🔧');
    console.log('🔧🔧🔧 ULTIMATELY ABSOLUTELY FINALLY THE END 🔧🔧🔧');
    console.log('🔧🔧🔧 REALLY ULTIMATELY ABSOLUTELY FINALLY THE END 🔧🔧🔧');
    console.log('🔧🔧🔧 ABSOLUTELY REALLY ULTIMATELY ABSOLUTELY FINALLY THE END 🔧🔧🔧');
    console.log('🔧🔧🔧 REALLY ABSOLUTELY REALLY ULTIMATELY ABSOLUTELY FINALLY THE END 🔧🔧🔧');
    console.log('🔧🔧🔧 ULTIMATELY REALLY ABSOLUTELY REALLY ULTIMATELY ABSOLUTELY FINALLY THE END 🔧🔧🔧');
    console.log('🔧🔧🔧 ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY REALLY ULTIMATELY ABSOLUTELY FINALLY THE END 🔧🔧🔧');
    console.log('🔧🔧🔧 REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY REALLY ULTIMATELY ABSOLUTELY FINALLY THE END 🔧🔧🔧');
    console.log('🔧🔧🔧 ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY REALLY ULTIMATELY ABSOLUTELY FINALLY THE END 🔧🔧🔧');
    console.log('🔧🔧🔧 ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY REALLY ULTIMATELY ABSOLUTELY FINALLY THE END 🔧🔧🔧');
    console.log('🔧🔧🔧 REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY REALLY ULTIMATELY ABSOLUTELY FINALLY THE END 🔧🔧🔧');
    console.log('🔧🔧🔧 ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY REALLY ULTIMATELY ABSOLUTELY FINALLY THE END 🔧🔧🔧');
    console.log('🔧🔧🔧 ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY REALLY ULTIMATELY ABSOLUTELY FINALLY THE END 🔧🔧🔧');
    console.log('🔧🔧🔧 REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY REALLY ULTIMATELY ABSOLUTELY FINALLY THE END 🔧🔧🔧');
    console.log('🔧🔧🔧 ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY REALLY ULTIMATELY ABSOLUTELY FINALLY THE END 🔧🔧🔧');
    console.log('🔧🔧🔧 ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY REALLY ULTIMATELY ABSOLUTELY FINALLY THE END 🔧🔧🔧');
    console.log('🔧🔧🔧 REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY REALLY ULTIMATELY ABSOLUTELY FINALLY THE END 🔧🔧🔧');
    console.log('🔧🔧🔧 REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY REALLY ULTIMATELY ABSOLUTELY FINALLY THE END 🔧🔧🔧');
    console.log('🔧🔧🔧 REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY REALLY ULTIMATELY ABSOLUTELY FINALLY THE END 🔧🔧🔧');
    console.log('🔧🔧🔧 REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY REALLY ULTIMATELY ABSOLUTELY FINALLY THE END 🔧🔧🔧');
    console.log('🔧🔧🔧 REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY REALLY ULTIMATELY ABSOLUTELY FINALLY THE END 🔧🔧🔧');
    console.log('🔧🔧🔧 REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY REALLY ULTIMATELY ABSOLUTELY FINALLY THE END 🔧🔧🔧');
    console.log('🔧🔧🔧 REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY REALLY ULTIMATELY ABSOLUTELY FINALLY THE END 🔧🔧🔧');
    console.log('🔧🔧🔧 ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY ULTIMATELY REALLY ABSOLUTELY REALLY ULTIMATELY ABSOLUTELY FINALLY THE END 🔧🔧🔧');
}

/**
 * Show validation warning
 */
function showValidationWarning(field, message) {
    console.log('🔧 showValidationWarning called with:', { field, message });

    // Use our notification system instead of alert
    if (window.showInfoNotification) {
        window.showInfoNotification('מידע על הטופס', `${message}`);
    } else {
        // Fallback to alert if notification system is not available
        alert(`${message}`);
    }
}

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

// Export warning system functions
window.showWarning = showWarning;
window.showDeleteWarning = showDeleteWarning;
window.showCancelWarning = showCancelWarning;
window.showLinkedItemsWarning = showLinkedItemsWarning;
window.showValidationWarning = showValidationWarning;
window.getWarningConfig = getWarningConfig;
window.createWarningModal = createWarningModal;
window.handleWarningAction = handleWarningAction;
window.createLinkedItemsWarningModal = createLinkedItemsWarningModal;

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
