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
    try {
        const response = await fetch(`/api/v1/linked-items/${itemType}/${itemId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();

    } catch (error) {
        console.error('❌ Error loading linked items data:', error);
        throw error;
    }
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
        info: 'ℹ️'
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
    console.log('🔧 showSuccessNotification called with:', { title, message, duration });
    
    // Ensure title and message are provided
    const finalTitle = title || 'הצלחה';
    const finalMessage = message || 'הפעולה הושלמה בהצלחה';
    
    console.log('🔧 showSuccessNotification calling showNotification with:', { finalTitle, finalMessage, type: 'success', duration });
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
    console.log('🔧 showErrorNotification called with:', { title, message, duration });
    console.log('🔧 showErrorNotification calling showNotification with:', { message, type: 'error', title, duration });
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
    
    // Show error notification (red)
    // showValidationWarning calling showErrorNotification
    showErrorNotification('שגיאת וולידציה', message, duration);
    
    // Highlight the problematic field
    const field = document.getElementById(fieldId);
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
function showConfirmationDialog(title, message, onConfirm = null, onCancel = null) {
    // showConfirmationDialog נקראה
    // bootstrap קיים
    
    // יצירת מודל אישור דינמי
    const modalId = 'confirmationModal';
    
    // יצירת HTML למודל
    const modalHTML = `
        <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title" id="${modalId}Label">${title}</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        ${message.replace(/\n/g, '<br>')}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ביטול</button>
                        <button type="button" class="btn btn-danger confirm-btn">אישור</button>
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
        console.error('🔧 שגיאה בהצגת המודל:', error);
        // fallback ל-confirm רגיל
        if (typeof window.showConfirmationDialog === 'function') {
            window.showConfirmationDialog(
                'אישור',
                message,
                onConfirm
            );
        } else {
                    if (typeof window.showConfirmationDialog === 'function') {
            window.showConfirmationDialog(
                'אישור',
                message,
                onConfirm,
                onCancel
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
    console.log('🔧 showDeleteWarning נקראה עם:', { itemType, itemName, itemTypeDisplay });
    console.log('🔧 showConfirmationDialog קיים:', typeof showConfirmationDialog === 'function');
    
    const title = `מחיקת ${itemTypeDisplay}`;
    const message = `האם אתה בטוח שברצונך למחוק את ${itemTypeDisplay} "${itemName}"?\n\nפעולה זו אינה ניתנת לביטול.`;
    
    console.log('🔧 קורא ל-showConfirmationDialog עם:', { title, message });
    showConfirmationDialog(title, message, onConfirm, onCancel);
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
    loadLinkedItemsData
};

// בדיקת פונקציות בסוף טעינת notification-system.js
console.log('🔧 notification-system.js נטען');
console.log('🔧 showDeleteWarning קיים:', typeof showDeleteWarning === 'function');
console.log('🔧 showConfirmationDialog קיים:', typeof showConfirmationDialog === 'function');
console.log('🔧 window.showDeleteWarning קיים:', typeof window.showDeleteWarning === 'function');
console.log('🔧 window.showConfirmationDialog קיים:', typeof window.showConfirmationDialog === 'function');

