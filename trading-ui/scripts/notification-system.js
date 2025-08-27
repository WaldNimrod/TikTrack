/**
 * Notification System - TikTrack
 * =============================
 * 
 * This file contains three main systems:
 * 1. ALERTS SYSTEM - Business alerts for market conditions
 * 2. NOTIFICATION SYSTEM - System messages for user feedback
 * 3. LINKED ITEMS SYSTEM - Linked items display and management
 * 
 * Each function is clearly marked with comments indicating which system it belongs to.
 * 
 * File: trading-ui/scripts/notification-system.js
 * Version: 3.0
 * Last Updated: August 26, 2025
 * 
 * Dependencies:
 * - linked-items.js (for modal display functions)
 * - Bootstrap 5.3.0 (for modal functionality)
 * 
 * Global Exports:
 * - window.showNotification() - System notifications
 * - window.showLinkedItemsWarning() - Linked items warnings
 * - window.loadLinkedItemsData() - Load linked items data
 * - window.notificationSystem - Module object
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
 * Delete an alert
 * ALERTS SYSTEM - Deletes business alert
 * 
 * @param {number} alertId - ID of alert to delete
 * @returns {Promise} Promise that resolves when alert is deleted
 */
function deleteAlert(alertId) {
    // Implementation for deleting business alerts
    // TODO: Implement alert deletion logic
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
 * Show linked items warning modal
 * LINKED ITEMS SYSTEM - Shows warning when trying to delete item with linked entities
 * 
 * @param {string} itemType - Type of the item (ticker, account, trade, etc.)
 * @param {number} itemId - ID of the item
 */
async function showLinkedItemsWarning(itemType, itemId) {
    try {
        // Load data from server
        const response = await fetch(`/api/v1/linked-items/${itemType}/${itemId}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Show the advanced modal
        if (typeof window.showLinkedItemsModal === 'function') {
            window.showLinkedItemsModal(data, itemType, itemId);
        } else {
            // Simple fallback
            alert(`Cannot delete ${itemType} ${itemId} - it has linked items`);
        }

    } catch (error) {
        console.error('❌ Error showing linked items warning:', error);
        alert(`Cannot delete ${itemType} ${itemId} - it has linked items`);
    }
}

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
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type: 'success', 'error', 'warning', 'info'
 * @param {number} duration - Display duration in milliseconds (default: 4000)
 */
function showNotification(title, message, type = 'info', duration = 4000) {

    // Create notification container
    const container = createNotificationContainer();

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    // Get icon for notification type
    const icon = getNotificationIcon(type);

    // Create notification content
    notification.innerHTML = `
        <div class="notification-icon">${icon}</div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;

    // Add to container
    container.appendChild(notification);

    // Show notification with animation
    setTimeout(() => {
        notification.classList.add('show');
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
    showNotification(title, message, 'success', duration);
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
    showNotification(title, message, 'error', duration);
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
    showNotification(title, message, 'warning', duration);
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
    showNotification(title, message, 'info', duration);
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
        showNotification(title, msg, type, duration);
    } else {
        // Otherwise it's just message
        showNotification('Message', message, type, duration);
    }
}

// ===== EXPORT TO GLOBAL SCOPE =====

// Export ALERTS SYSTEM functions to global scope
window.createAlert = createAlert;
window.deleteAlert = deleteAlert;
window.updateAlert = updateAlert;
window.markAlertAsTriggered = markAlertAsTriggered;
window.markAlertAsRead = markAlertAsRead;

// Export NOTIFICATION SYSTEM functions to global scope
window.showNotification = showNotification;
window.showSuccessNotification = showSuccessNotification;
window.showErrorNotification = showErrorNotification;
window.showWarningNotification = showWarningNotification;
window.showInfoNotification = showInfoNotification;

// Export LINKED ITEMS SYSTEM functions to global scope
window.showLinkedItemsWarning = showLinkedItemsWarning;
window.loadLinkedItemsData = loadLinkedItemsData;

// Export the module itself
window.notificationSystem = {
    // ALERTS SYSTEM functions
    createAlert,
    deleteAlert,
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

    // LINKED ITEMS SYSTEM functions
    showLinkedItemsWarning,
    loadLinkedItemsData
};


