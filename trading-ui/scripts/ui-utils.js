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
 * הצגת התראה במודל
 * Show notification in modal
 */
function showModalNotification(modalId, title, message, type = 'info', duration = 3000) {
    console.log(`🔄 Showing ${type} notification in modal ${modalId}: ${title}`);

    const modal = document.getElementById(modalId);
    if (!modal) {
        console.error(`❌ Modal ${modalId} not found`);
        return;
    }

    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show`;
    notification.innerHTML = `
        <strong>${title}</strong> ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    const modalBody = modal.querySelector('.modal-body');
    if (modalBody) {
        modalBody.insertBefore(notification, modalBody.firstChild);
    }

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, duration);
}

/**
 * הצגת מודל אישור שני
 * Show second confirmation modal
 */
function showSecondConfirmationModal(message, onConfirm) {
    console.log('🔄 Showing second confirmation modal');

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'secondConfirmationModal';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">אישור נוסף</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                    <button type="button" class="btn btn-danger" onclick="confirmSecondAction()">אישור</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    window.secondConfirmationCallback = onConfirm;

    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();

    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
        delete window.secondConfirmationCallback;
    });
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

// ===== Export Functions =====
window.showModalNotification = showModalNotification;
window.showSecondConfirmationModal = showSecondConfirmationModal;
window.confirmSecondAction = confirmSecondAction;
window.colorAmount = colorAmount;

console.log('✅ UI Utils loaded successfully');
