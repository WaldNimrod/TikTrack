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
 * Show notification to user
 * NOTIFICATION SYSTEM - Displays system message to user
 *
 * @param {string} message - Notification message
 * @param {string} type - Notification type: 'success', 'error', 'warning', 'info'
 * @param {string} title - Notification title
 * @param {number} duration - Display duration in milliseconds (default: 4000)
 */
function showNotification(message, type = 'info', title = 'התראה', duration = 4000) {
  // showNotification called
  // Parameter types:
  // Parameter types check
  // Raw parameters check

  // Validate and sanitize parameters
  const validTypes = ['success', 'error', 'warning', 'info'];
  const sanitizedType = validTypes.includes(type) ? type : 'info';
  const sanitizedTitle = title || 'הודעה';
  const sanitizedMessage = message || '';

  // Sanitized parameters check

  // Create notification container
  const container = createNotificationContainer();

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${sanitizedType}`;

  // Get icon for notification type
  const icon = getNotificationIcon(sanitizedType);

  // Create notification content
  notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-content">
            <div class="notification-title">${sanitizedTitle}</div>
            <div class="notification-message">${sanitizedMessage}</div>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;

  // Created notification element

  // Add to container
  container.appendChild(notification);

  // Show notification with animation
  setTimeout(() => {
    notification.classList.add('show');
    // Notification shown
  }, 100);

  // Auto-remove after duration
  setTimeout(() => {
    hideNotification(notification);
  }, duration);
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
    field.style.borderColor = '#dc3545';
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
    console.warn(`⚠️ Field not found: ${fieldId}`);
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
window.showValidationWarning = showValidationWarning;
window.showConfirmationDialog = showConfirmationDialog;
window.showDeleteWarning = showDeleteWarning;

// Export LINKED ITEMS SYSTEM functions to global scope
window.loadLinkedItemsData = loadLinkedItemsData;

// ===== WARNING SYSTEM FUNCTIONS =====
// These functions handle warning modals and confirmations

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
    defaultAction: 'cancel',
  },

  // פריטים מקושרים
  LINKED_ITEMS: {
    id: 'linked_items',
    title: 'לא ניתן למחוק {itemType}',
    message: '{itemType} זה מקושר ל-{linkedCount} פריטים במערכת. יש לטפל בהם תחילה.',
    icon: 'fas fa-link',
    theme: 'warning',
    actions: ['close', 'force_delete', 'manage_linked'],
    defaultAction: 'close',
  },

  // שגיאת אימות
  VALIDATION: {
    id: 'validation',
    title: 'שגיאת אימות',
    message: 'שדה "{field}": {message}',
    icon: 'fas fa-exclamation-triangle',
    theme: 'warning',
    actions: ['ok'],
    defaultAction: 'ok',
  },

  // אזהרת מערכת
  SYSTEM: {
    id: 'system',
    title: 'אזהרת מערכת',
    message: '{message}',
    icon: 'fas fa-exclamation-circle',
    theme: 'info',
    actions: ['ok'],
    defaultAction: 'ok',
  },

  // אישור פעולה
  CONFIRMATION: {
    id: 'confirmation',
    title: 'אישור פעולה',
    message: '{message}',
    icon: 'fas fa-question-circle',
    theme: 'primary',
    actions: ['cancel', 'confirm'],
    defaultAction: 'cancel',
  },
};

/**
 * Get warning configuration by type
 * WARNING SYSTEM - Gets warning configuration for specific type
 *
 * @param {string} type - Warning type
 * @param {Object} data - Data to format message with
 * @returns {Object} Warning configuration
 */
function getWarningConfig(type, data = {}) {
  const config = WARNING_TYPES[type.toUpperCase()];
  if (!config) {
    throw new Error(`Unknown warning type: ${type}`);
  }

  const result = {
    ...config,
    title: formatWarningMessage(config.title, data),
    message: formatWarningMessage(config.message, data),
  };

  return result;
}

/**
 * Format warning message with data
 * WARNING SYSTEM - Formats warning message with dynamic data
 *
 * @param {string} template - Message template
 * @param {Object} data - Data to insert
 * @returns {string} Formatted message
 */
function formatWarningMessage(template, data) {
  const result = template.replace(/\{(\w+)\}/g, (match, key) => {
    const value = data[key] || match;
    return value;
  });

  return result;
}

/**
 * Validate warning data
 * WARNING SYSTEM - Validates warning data parameters
 *
 * @param {string} type - Warning type
 * @param {Object} data - Warning data
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
 * WARNING SYSTEM - Gets theme configuration for warning modal
 *
 * @param {string} theme - Theme name
 * @returns {Object} Theme configuration
 */
function getWarningTheme(theme) {
  const themes = {
    danger: {
      headerClass: 'bg-danger text-white',
      buttonClass: 'btn-danger',
    },
    warning: {
      headerClass: 'bg-warning text-dark',
      buttonClass: 'btn-warning',
    },
    info: {
      headerClass: 'bg-info text-white',
      buttonClass: 'btn-info',
    },
    primary: {
      headerClass: 'bg-primary text-white',
      buttonClass: 'btn-primary',
    },
  };

  return themes[theme] || themes.warning;
}

/**
 * Get warning icon
 * WARNING SYSTEM - Gets icon for warning type
 *
 * @param {string} icon - Icon class or name
 * @returns {string} Icon HTML
 */
function getWarningIcon(icon) {
  const icons = {
    'fas fa-trash-alt': '🗑️',
    'fas fa-link': '🔗',
    'fas fa-exclamation-triangle': '⚠️',
    'fas fa-exclamation-circle': '❗',
    'fas fa-question-circle': '❓',
  };

  return icons[icon] || icon;
}

/**
 * Get warning action buttons
 * WARNING SYSTEM - Generates HTML for warning action buttons
 *
 * @param {Array} actions - Action names
 * @param {string} defaultAction - Default action
 * @param {string} theme - Theme name
 * @param {Function} onConfirm - Confirm callback
 * @param {Function} onCancel - Cancel callback
 * @returns {string} HTML for action buttons
 */
function getWarningActions(actions, defaultAction, theme, onConfirm = null, onCancel = null) {
  const actionConfigs = {
    cancel: {
      text: 'ביטול',
      class: 'btn-secondary',
      action: 'cancel',
    },
    ok: {
      text: 'אישור',
      class: 'btn-primary',
      action: 'ok',
    },
    delete: {
      text: 'מחק',
      class: 'btn-danger',
      action: 'delete',
    },
    confirm: {
      text: 'אישור',
      class: 'btn-primary',
      action: 'confirm',
    },
    close: {
      text: 'סגור',
      class: 'btn-secondary',
      action: 'close',
    },
    force_delete: {
      text: 'מחק בכל זאת',
      class: 'btn-danger',
      action: 'force_delete',
    },
    manage_linked: {
      text: 'ניהול מקושרים',
      class: 'btn-info',
      action: 'manage_linked',
    },
  };

  let buttonsHtml = '';

  actions.forEach(actionName => {
    const actionConfig = actionConfigs[actionName];
    if (!actionConfig) {return;}

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
 * WARNING SYSTEM - Creates warning modal with configuration
 *
 * @param {Object} config - Warning configuration
 * @param {Object} options - Modal options
 * @param {Function} onConfirm - Confirm callback
 * @param {Function} onCancel - Cancel callback
 * @returns {string} Modal ID
 */
function createWarningModal(config, options = {}, onConfirm = null, onCancel = null) {
  const modalId = `warningModal_${Date.now()}`;

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

  // Store callbacks globally
  window.warningConfirmCallback = onConfirm;
  window.warningCancelCallback = onCancel;

  return modalId;
}

/**
 * Show warning modal
 * WARNING SYSTEM - Shows warning modal for specific type
 *
 * @param {string} type - Warning type
 * @param {Object} data - Warning data
 * @param {Object} options - Modal options
 * @param {Function} onConfirm - Confirm callback
 * @param {Function} onCancel - Cancel callback
 */
function showWarning(type, data = {}, options = {}, onConfirm = null, onCancel = null) {
  try {
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
        focus: true,
      });

      modal.show();
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
        focus: true,
      });

      modal.show();
    } else {
      console.error('Unknown warning type:', type);
    }
  } catch (error) {
    console.error('Error showing warning:', error);

    // Fallback to simple confirm for CANCEL type
    if (type === 'CANCEL') {
      const itemType = data.itemType || 'פריט';
      const itemName = data.itemName || 'זה';

      if (typeof window.showConfirmationDialog === 'function') {
        const title = `ביטול ${itemType}`;
        const message = `האם אתה בטוח שברצונך לבטל את ${itemType} "${itemName}"?`;
        window.showConfirmationDialog(title, message, onConfirm, onCancel);
      } else {
        const confirmed = confirm(`האם אתה בטוח שברצונך לבטל את ${itemType} "${itemName}"?`);
        if (confirmed && onConfirm) {
          onConfirm();
        }
      }
    } else {
      console.error('Error showing warning:', data.message || 'Unknown error');
    }
  }
}

/**
 * Handle warning action
 * WARNING SYSTEM - Handles warning action button clicks
 *
 * @param {string} action - Action to perform
 */
function handleWarningAction(action) {
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
      window.warningConfirmCallback();
    }
    break;
  case 'cancel':
  case 'close':
    if (typeof window.warningCancelCallback === 'function') {
      window.warningCancelCallback();
    }
    break;
  case 'force_delete':
    if (typeof window.warningConfirmCallback === 'function') {
      window.warningConfirmCallback();
    }
    break;
  case 'manage_linked':
    if (typeof window.showLinkedItemsModal === 'function') {
      window.showLinkedItemsModal();
    }
    break;
  }
}

/**
 * Show cancel warning (for tickers)
 * WARNING SYSTEM - Shows warning for cancel operations
 *
 * @param {string} itemType - Type of item being cancelled
 * @param {string} itemName - Name of item being cancelled
 * @param {Function} onConfirm - Confirm callback
 * @param {Function} onCancel - Cancel callback
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

  // Try to use the warning system, fallback to notification system
  try {
    return showWarning('CANCEL', {
      itemType: itemTypeDisplay,
      itemName,
    }, {}, onConfirm, onCancel);
  } catch (error) {
    console.error('Error in showCancelWarning fallback:', error);

    // Fallback to notification system
    if (typeof window.showConfirmationDialog === 'function') {
      const title = `ביטול ${itemTypeDisplay}`;
      const message = `האם אתה בטוח שברצונך לבטל את ${itemTypeDisplay} "${itemName}"?`;
      window.showConfirmationDialog(title, message, onConfirm, onCancel);
    } else {
      // Fallback to simple confirm
      const confirmed = confirm(`האם אתה בטוח שברצונך לבטל את ${itemTypeDisplay} "${itemName}"?`);
      if (confirmed && onConfirm) {
        onConfirm();
      }
    }
  }
}

/**
 * Show validation warning legacy
 * WARNING SYSTEM - Legacy validation warning function
 *
 * @param {string} field - Field name
 * @param {string} message - Validation message
 */
function showValidationWarningLegacy(field, message) {
  // Use the global validation warning system from notification-system.js if available
  if (typeof window.notificationSystem !== 'undefined' && window.notificationSystem.showValidationWarning) {
    window.notificationSystem.showValidationWarning(field, message);
  } else if (window.showErrorNotification) {
    // Use our notification system instead of alert
    window.showErrorNotification('שגיאת וולידציה', `${message}`);
  } else {
    // Fallback to console error if notification system is not available
    console.error('Validation error:', field, message);
  }
}

// Export WARNING SYSTEM functions to global scope
window.WARNING_TYPES = WARNING_TYPES;
window.getWarningConfig = getWarningConfig;
window.formatWarningMessage = formatWarningMessage;
window.validateWarningData = validateWarningData;
window.getWarningTheme = getWarningTheme;
window.getWarningIcon = getWarningIcon;
window.getWarningActions = getWarningActions;
window.createWarningModal = createWarningModal;
window.showWarning = showWarning;
window.handleWarningAction = handleWarningAction;
window.showCancelWarning = showCancelWarning;
window.showValidationWarningLegacy = showValidationWarningLegacy;

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

  // WARNING SYSTEM functions
  WARNING_TYPES,
  getWarningConfig,
  formatWarningMessage,
  validateWarningData,
  getWarningTheme,
  getWarningIcon,
  getWarningActions,
  createWarningModal,
  showWarning,
  handleWarningAction,
  showCancelWarning,
  showValidationWarningLegacy,
};

// בדיקת פונקציות בסוף טעינת notification-system.js
// notification-system.js נטען
// showDeleteWarning קיים
// showConfirmationDialog קיים
// window.showDeleteWarning קיים
// window.showConfirmationDialog קיים
