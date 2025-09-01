/**
 * Notification System - TikTrack
 * =============================
 *
 * מערכת התראות מרכזית לפרויקט TikTrack
 *
 * קובץ זה מכיל שלושה מערכות עיקריות:
 * 1. ALERTS SYSTEM - התראות עסקיות לתנאי שוק
 * 2. NOTIFICATION SYSTEM - הודעות מערכת למשוב משתמש
 * 3. LINKED ITEMS SYSTEM - הצגה וניהול פריטים מקושרים
 *
 * קובץ: trading-ui/scripts/notification-system.js
 * גרסה: 3.1
 * עדכון אחרון: 31 באוגוסט 2025
 *
 * תיקונים אחרונים (31 באוגוסט 2025):
 * - שיפור תמיכה בעמוד תכנונים
 * - תיקון הודעות הצלחה ושגיאה
 * - שיפור מערכת אישור מחיקה
 * - תמיכה במערכת ביטול תכנונים
 *
 * תלויות:
 * - linked-items.js (לפונקציות הצגת מודלים)
 * - Bootstrap 5.3.0 (לפונקציונליות מודלים)
 *
 * דוקומנטציה מפורטת: documentation/frontend/NOTIFICATION_SYSTEM.md
 */

// ===== ALERTS SYSTEM FUNCTIONS =====
// These functions handle business alerts for market conditions

/**
 * Create a new alert
 * ALERTS SYSTEM - Creates business alert for market conditions
 *
 * @param {Object} alertData - Alert data object
 * @returns {Promise} Promise that resolves when alert is created
 */
function createAlert(alertData) {
  // Implementation for creating business alerts
  // TODO: Implement alert creation logic
}


/**
 * Update an alert
 * ALERTS SYSTEM - Updates existing business alert
 *
 * @param {number} alertId - ID of alert to update
 * @param {Object} alertData - Updated alert data
 * @returns {Promise} Promise that resolves when alert is updated
 */
function updateAlert(alertId, alertData) {
  // Implementation for updating business alerts
  // TODO: Implement alert update logic
}

/**
 * Mark alert as triggered
 * ALERTS SYSTEM - Marks business alert as triggered when conditions are met
 *
 * @param {number} alertId - ID of alert to mark as triggered
 * @returns {Promise} Promise that resolves when alert is marked
 */
function markAlertAsTriggered(alertId) {
  // Implementation for marking alerts as triggered
  // TODO: Implement alert trigger logic
}

/**
 * Mark alert as read
 * ALERTS SYSTEM - Marks business alert as read by user
 *
 * @param {number} alertId - ID of alert to mark as read
 * @returns {Promise} Promise that resolves when alert is marked
 */
function markAlertAsRead(alertId) {
  // Implementation for marking alerts as read
  // TODO: Implement alert read logic
}


// ===== NOTIFICATION SYSTEM FUNCTIONS =====
// These functions handle system messages for user feedback

/**
 * Create notification container
 * NOTIFICATION SYSTEM - Creates the main notification container
 *
 * @returns {HTMLElement} The created notification container
 */
function createNotificationContainer() {
  // Create notification container if it doesn't exist
  let container = document.getElementById('notificationContainer');
  
  if (!container) {
    container = document.createElement('div');
    container.id = 'notificationContainer';
    container.className = 'notification-container position-fixed top-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
  }
  
  return container;
}

/**
 * Show notification message
 * NOTIFICATION SYSTEM - Displays notification message to user
 *
 * @param {string} message - Notification message
 * @param {string} type - Notification type: 'success', 'error', 'warning', 'info'
 * @param {string} title - Notification title
 * @param {number} duration - Display duration in milliseconds
 */
function showNotification(message, type = 'info', title = 'התראה', duration = 4000) {
  // showNotification called
  // showNotification calling createNotificationContainer
  
  const container = createNotificationContainer();
  
  // Validate notification type
  const validTypes = ['success', 'error', 'warning', 'info'];
  if (!validTypes.includes(type)) {
    type = 'info';
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `alert alert-${type} alert-dismissible fade show`;
  notification.role = 'alert';
  
  // Set notification content
  notification.innerHTML = `
    <strong>${title}:</strong> ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  
  // Add to container
  container.appendChild(notification);
  
  // Auto-hide after duration
  if (duration > 0) {
    setTimeout(() => {
      hideNotification(notification);
    }, duration);
  }
  
  // showNotification calling hideNotification
}

/**
 * Hide notification
 * NOTIFICATION SYSTEM - Hides and removes notification element
 *
 * @param {HTMLElement} notification - Notification element to hide
 */
function hideNotification(notification) {
  // hideNotification called
  
  if (notification && notification.parentNode) {
    notification.classList.remove('show');
    notification.classList.add('fade');
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 150);
  }
}

/**
 * Get notification icon by type
 * NOTIFICATION SYSTEM - Returns appropriate icon for notification type
 *
 * @param {string} type - Notification type
 * @returns {string} Icon HTML
 */
function getNotificationIcon(type) {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };
  
  return icons[type] || icons.info;
}

// These are convenience functions for different notification types

/**
 * Show success notification
 * NOTIFICATION SYSTEM - Displays success message to user
 *
 * @param {string} title - Success notification title
 * @param {string} message - Success notification message
 * @param {number} duration - Display duration in milliseconds
 */
function showSuccessNotification(title, message, duration = 4000) {
  // showSuccessNotification called
  // showSuccessNotification calling showNotification
  showNotification(message, 'success', title, duration);
}

/**
 * Show error notification
 * NOTIFICATION SYSTEM - Displays error message to user
 *
 * @param {string} title - Error notification title
 * @param {string} message - Error notification message
 * @param {number} duration - Display duration in milliseconds
 */
function showErrorNotification(title, message, duration = 6000) {
  // showErrorNotification called
  // showErrorNotification calling showNotification
  showNotification(message, 'error', title, duration);
}

/**
 * Show warning notification
 * NOTIFICATION SYSTEM - Displays warning message to user
 *
 * @param {string} title - Warning notification title
 * @param {string} message - Warning notification message
 * @param {number} duration - Display duration in milliseconds
 */
function showWarningNotification(title, message, duration = 5000) {
  // showWarningNotification called
  // showWarningNotification calling showNotification
  showNotification(message, 'warning', title, duration);
}

/**
 * Show info notification
 * NOTIFICATION SYSTEM - Displays info message to user
 *
 * @param {string} title - Info notification title
 * @param {string} message - Info notification message
 * @param {number} duration - Display duration in milliseconds
 */
function showInfoNotification(title, message, duration = 4000) {
  // showInfoNotification called
  // showInfoNotification calling showNotification
  showNotification(message, 'info', title, duration);
}

/**
 * Show notification in modal
 * NOTIFICATION SYSTEM - Shows notification in modal format
 *
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} modalId - Modal ID to use
 */
function showModalNotification(type, title, message, modalId = 'notificationModal') {
  // Showing notification in modal
  
  const modal = document.getElementById(modalId);
  if (!modal) {
    console.warn(`Modal ${modalId} not found`);
    return;
  }
  
  // Update modal content
  const titleElement = modal.querySelector('.modal-title');
  const messageElement = modal.querySelector('.modal-body');
  const iconElement = modal.querySelector('.notification-icon');
  
  if (titleElement) titleElement.textContent = title;
  if (messageElement) messageElement.textContent = message;
  
  // Update icon by type
  if (iconElement) {
    iconElement.className = `notification-icon ${type}`;
    iconElement.innerHTML = getNotificationIcon(type);
  }
  
  // Show modal
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();
}

/**
 * Create toast container
 * NOTIFICATION SYSTEM - Creates toast container for notifications
 *
 * @returns {HTMLElement} The created toast container
 */
function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toastContainer';
  container.className = 'toast-container position-fixed top-0 end-0 p-3';
  container.style.zIndex = '9999';
  document.body.appendChild(container);
  return container;
}

/**
 * Color amount function
 * NOTIFICATION SYSTEM - Colors amounts (positive/negative)
 *
 * @param {number} amount - Amount to color
 * @param {string} displayText - Optional display text
 * @returns {string} HTML with colored amount
 */
function colorAmount(amount, displayText = null) {
  const text = displayText || (amount >= 0 ? `+$${amount.toFixed(2)}` : `-$${Math.abs(amount).toFixed(2)}`);
  const className = amount >= 0 ? 'profit-positive' : 'profit-negative';
  return `<span class="${className}">${text}</span>`;
}

// ===== LINKED ITEMS SYSTEM FUNCTIONS =====
// These functions handle linked items display and management


/**
 * Load linked items data from server
 * LINKED ITEMS SYSTEM - Fetches linked items data for any entity type
 *
 * @param {string} itemType - Type of the item
 * @param {number|string} itemId - ID of the item
 * @returns {Object} Linked items data
 */
async function loadLinkedItemsData(itemType, itemId) {
  try {
    const response = await fetch(`/api/v1/linked-items/${itemType}/${itemId}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();

  } catch (error) {
    throw error;
  }
}

/**
 * Show confirmation dialog
 * NOTIFICATION SYSTEM - Shows confirmation dialog for important actions
 *
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {Function} onConfirm - Callback for confirm action
 * @param {Function} onCancel - Callback for cancel action
 */
function showConfirmationDialog(title, message, onConfirm = null, onCancel = null, color = 'danger') {
  // showConfirmationDialog נקראה
  // bootstrap קיים

  // יצירת מודל אישור דינמי
  const modalId = 'confirmationModal';

  // יצירת HTML למודל
  const modalHTML = `
        <div class="modal fade warning-modal" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-${color} text-white">
                        <h5 class="modal-title" id="${modalId}Label">${title}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${message.replace(/\n/g, '<br>')}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                        <button type="button" class="btn btn-${color} confirm-btn">אישור</button>
                    </div>
                </div>
            </div>
        </div>
    `;

  // הסרת מודל קיים אם יש
  const existingModal = document.getElementById(modalId);
  if (existingModal) {
    existingModal.remove();
  }

  // הוספת המודל לדף
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // קבלת המודל החדש
  const modal = document.getElementById(modalId);

  // הגדרת אירועי כפתורים
  const confirmBtn = modal.querySelector('.confirm-btn');
  const cancelBtn = modal.querySelector('.btn-secondary');

  // פונקציה לסגירת המודל
  const closeModal = () => {
    const bootstrapModal = bootstrap.Modal.getInstance(modal);
    if (bootstrapModal) {
      bootstrapModal.hide();
    }
    // הסרת המודל מהדף אחרי סגירה
    setTimeout(() => {
      if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 300);
  };

  // אירוע אישור
  if (confirmBtn) {
    confirmBtn.onclick = () => {
      closeModal();
      if (typeof onConfirm === 'function') {
        onConfirm();
      }
    };
  }

  // אירוע ביטול
  if (cancelBtn) {
    cancelBtn.onclick = () => {
      closeModal();
      if (typeof onCancel === 'function') {
        onCancel();
      }
    };
  }

  // אירוע סגירה על ידי לחיצה מחוץ למודל או ESC
  modal.addEventListener('hidden.bs.modal', () => {
    if (typeof onCancel === 'function') {
      onCancel();
    }
    // הסרת המודל מהדף
    setTimeout(() => {
      if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
    }, 300);
  });

  // הצגת המודל
  // מציג את המודל עם bootstrap
  try {
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    // המודל הוצג בהצלחה
  } catch (error) {
    // fallback ל-confirm רגיל
    if (typeof window.showConfirmationDialog === 'function') {
      window.showConfirmationDialog(
        'אישור',
        message,
        onConfirm,
      );
    } else {
      if (typeof window.showConfirmationDialog === 'function') {
        window.showConfirmationDialog(
          'אישור',
          message,
          onConfirm,
          onCancel,
        );
      } else {
        const confirmed = confirm(message);
        if (confirmed && onConfirm) {
          onConfirm();
        } else if (!confirmed && onCancel) {
          onCancel();
        }
      }
    }
  }
}

/**
 * Show delete warning
 * NOTIFICATION SYSTEM - Shows warning for delete operations
 *
 * @param {string} itemType - Type of item being deleted
 * @param {string} itemName - Name/ID of item being deleted
 * @param {string} itemTypeDisplay - Display name for item type
 * @param {Function} onConfirm - Callback for confirm action
 * @param {Function} onCancel - Callback for cancel action
 */
function showDeleteWarning(itemType, itemName, itemTypeDisplay, onConfirm = null, onCancel = null) {
  // showDeleteWarning נקראה עם
  // showConfirmationDialog קיים

  const title = `מחיקת ${itemTypeDisplay}`;
  const message = `האם אתה בטוח שברצונך למחוק את ${itemTypeDisplay} "${itemName}"?\n\nפעולה זו אינה ניתנת לביטול.`;

  // קורא ל-showConfirmationDialog עם צבע אדום למחיקה
  showConfirmationDialog(title, message, onConfirm, onCancel, 'danger');
}

// ===== LEGACY SUPPORT =====
// These functions provide backward compatibility

/**
 * Legacy support function for old notification calls
 * NOTIFICATION SYSTEM - Handles old notification format for backward compatibility
 *
 * @param {string} message - Message (can be title + message)
 * @param {string} type - Notification type
 * @param {number} duration - Display duration
 */
function showNotificationLegacy(message, type = 'info', duration = 4000) {
  // If message contains ":" then it's title + message
  if (message.includes(':')) {
    const parts = message.split(':');
    const title = parts[0].trim();
    const msg = parts.slice(1).join(':').trim();
    showNotification(msg, type, title, duration);
  } else {
    // Otherwise it's just message
    showNotification(message, type, 'Message', duration);
  }
}

// ===== EXPORT TO GLOBAL SCOPE =====

// Export ALERTS SYSTEM functions to global scope
window.createAlert = createAlert;
window.updateAlert = updateAlert;
window.markAlertAsTriggered = markAlertAsTriggered;
window.markAlertAsRead = markAlertAsRead;


// Export NOTIFICATION SYSTEM functions to global scope
window.showNotification = showNotification;
window.showSuccessNotification = showSuccessNotification;
window.showErrorNotification = showErrorNotification;
window.showWarningNotification = showWarningNotification;
window.showInfoNotification = showInfoNotification;
window.showModalNotification = showModalNotification;
window.createToastContainer = createToastContainer;
window.colorAmount = colorAmount;
window.showValidationWarning = showValidationWarning;
window.showConfirmationDialog = showConfirmationDialog;
window.showDeleteWarning = showDeleteWarning;

// Export LINKED ITEMS SYSTEM functions to global scope
window.loadLinkedItemsData = loadLinkedItemsData;

// Export the module itself
window.notificationSystem = {
  // ALERTS SYSTEM functions
  createAlert,
  updateAlert,
  markAlertAsTriggered,
  markAlertAsRead,


  // NOTIFICATION SYSTEM functions
  showNotification,
  showSuccessNotification,
  showErrorNotification,
  showWarningNotification,
  showInfoNotification,
  createNotificationContainer,
  hideNotification,
  getNotificationIcon,
  showValidationWarning,
  showConfirmationDialog,
  showDeleteWarning,
  showModalNotification,
  createToastContainer,
  colorAmount,

  // LINKED ITEMS SYSTEM functions
  loadLinkedItemsData,
};

// בדיקת פונקציות בסוף טעינת notification-system.js
// notification-system.js נטען
// showDeleteWarning קיים
// showConfirmationDialog קיים
// window.showDeleteWarning קיים
// window.showConfirmationDialog קיים

