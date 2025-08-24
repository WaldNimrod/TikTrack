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

// אתחול UI Utils
function initializeUIUtils() {
    // UI Utils loaded successfully
}
