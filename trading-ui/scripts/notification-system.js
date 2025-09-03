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
function createAlert(_alertData) {
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
function updateAlert(_alertId, _alertData) {
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
function markAlertAsTriggered(_alertId) {
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
function markAlertAsRead(_alertId) {
  // Implementation for marking alerts as triggered
  // TODO: Implement alert read logic
}


// ===== NOTIFICATION SYSTEM FUNCTIONS =====
// These functions handle system messages for user feedback

/**
 * Show a notification message
 * NOTIFICATION SYSTEM - Displays system notification to user
 *
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (success, error, warning, info)
 * @param {string} title - Optional title for the notification
 * @param {number} duration - Optional duration in milliseconds (default: 5000)
 */
function showNotification(message, type = 'info', title = 'מערכת', duration = 5000) {
  // אם מרכז ההתראות זמין, הוסף את ההתראה אליו
  if (window.notificationsCenter && typeof window.notificationsCenter.addNotification === 'function') {
    window.notificationsCenter.addNotification(type, title, message);
  }

  // הצגת התראה מיידית בממשק (אם לא במרכז ההתראות)
  if (!window.location.pathname.includes('notifications-center')) {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : type === 'warning' ? 'warning' : 'info'} alert-dismissible fade show`;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      min-width: 300px;
      max-width: 400px;
      animation: slideInRight 0.3s ease-out;
    `;

    notification.innerHTML = `
      <strong>${title}</strong><br>
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    document.body.appendChild(notification);

    // הסרה אוטומטית
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, duration);
  }
}

// ייצוא הפונקציה הגלובלית
window.showNotification = showNotification;
window.showSuccessNotification = (message, title = 'הצלחה') => showNotification(message, 'success', title);
window.showErrorNotification = (message, title = 'שגיאה') => showNotification(message, 'error', title);
window.showWarningNotification = (message, title = 'אזהרה') => showNotification(message, 'warning', title);
window.showInfoNotification = (message, title = 'מידע') => showNotification(message, 'info', title);

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
  const response = await fetch(`/api/v1/linked-items/${itemType}/${itemId}`);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}

/**
 * Create notification container if not exists
 * NOTIFICATION SYSTEM - Creates container for system notifications
 *
 * @returns {HTMLElement} Notification container element
 */
function createNotificationContainer() {
  let container = document.getElementById('notification-container');

  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'notification-container';
    document.body.appendChild(container);
  }

  return container;
}


/**
 * Hide notification with animation
 * NOTIFICATION SYSTEM - Hides system notification with smooth animation
 *
 * @param {HTMLElement} notification - Notification element to hide
 */
function hideNotification(notification) {
  if (notification && notification.parentElement) {
    notification.classList.add('hide');

    // Remove from DOM after animation
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 300);
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

// ===== SPECIFIC NOTIFICATION FUNCTIONS =====
// These are convenience functions for different notification types

/**
 * Show success notification
 * NOTIFICATION SYSTEM - Displays success message to user
 *
 * @param {string} title - Success notification title
 * @param {string} message - Success notification message
 * @param {number} duration - Display duration in milliseconds (default: 4000)
 */
function showSuccessNotification(title, message, duration = 4000) {
  // showSuccessNotification called with

  // Ensure title and message are provided
  const finalTitle = title || 'הצלחה';
  const finalMessage = message || 'הפעולה הושלמה בהצלחה';

  // showSuccessNotification calling showNotification with
  showNotification(finalMessage, 'success', finalTitle, duration);
}

/**
 * Show error notification
 * NOTIFICATION SYSTEM - Displays error message to user
 *
 * @param {string} title - Error notification title
 * @param {string} message - Error notification message
 * @param {number} duration - Display duration in milliseconds (default: 6000)
 */
function showErrorNotification(title, message, duration = 6000) {
  // showErrorNotification called with
  // showErrorNotification calling showNotification with
  showNotification(message, 'error', title, duration);
}

/**
 * Show warning notification
 * NOTIFICATION SYSTEM - Displays warning message to user
 *
 * @param {string} title - Warning notification title
 * @param {string} message - Warning notification message
 * @param {number} duration - Display duration in milliseconds (default: 5000)
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
 * @param {number} duration - Display duration in milliseconds (default: 4000)
 */
function showInfoNotification(title, message, duration = 4000) {
  // showInfoNotification called
  // showInfoNotification calling showNotification
  showNotification(message, 'info', title, duration);
}

/**
 * Show validation warning with field highlighting
 * NOTIFICATION SYSTEM - Displays validation error with field highlighting
 *
 * @param {string} fieldId - ID of the problematic field
 * @param {string} message - Validation error message
 * @param {number} duration - Display duration in milliseconds (default: 6000)
 */
function showValidationWarning(fieldId, message, duration = 6000) {
  // showValidationWarning called

  // Get field name for better error message
  const field = document.getElementById(fieldId);
  let fieldName = fieldId;

  if (field) {
    // Try to get a human-readable field name
    const label = document.querySelector(`label[for="${fieldId}"]`);
    if (label) {
      fieldName = label.textContent.trim();
    } else if (field.placeholder) {
      fieldName = field.placeholder;
    } else if (field.name) {
      fieldName = field.name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    }
  }

  // Create detailed error message
  const detailedMessage = `${fieldName}: ${message}`;

  // Show error notification (red)
  // showValidationWarning calling showErrorNotification
  showErrorNotification('שגיאת וולידציה', detailedMessage, duration);

  // Highlight the problematic field
  // Field element found

  if (field) {
    // Add error styling
    field.classList.add('is-invalid');
    field.classList.remove('is-valid');

    // Add red border
    const colors = window.getTableColors ? window.getTableColors() : { negative: '#dc3545' };
    field.style.borderColor = colors.negative;
    field.style.boxShadow = '0 0 0 0.2rem rgba(220, 53, 69, 0.25)';

    // Scroll to field
    field.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Focus on field
    field.focus();

    // Field styling applied

    // Remove styling after 3 seconds
    setTimeout(() => {
      field.classList.remove('is-invalid');
      field.style.borderColor = '';
      field.style.boxShadow = '';
      // Field styling removed
    }, 3000);
  } else {
    // Field not found
    // Console statement removed for no-console compliance
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
        const confirmed = window.confirm(message);
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

  // LINKED ITEMS SYSTEM functions
  loadLinkedItemsData,
};

// בדיקת פונקציות בסוף טעינת notification-system.js
// notification-system.js נטען
// showDeleteWarning קיים
// showConfirmationDialog קיים
// window.showDeleteWarning קיים
// window.showConfirmationDialog קיים

