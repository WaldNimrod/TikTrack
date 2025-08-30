/**
 * Alert Service
 * 
 * This file contains general alert-related functions that can be used across the application.
 * These functions handle alert state management, validation, and utility operations.
 * 
 * @author TikTrack System
 * @version 1.0
 */

// ===== ALERT STATE MANAGEMENT =====

/**
 * Get alert state based on status and triggered flag
 * ALERT SERVICE - Determines the display state of an alert based on database values
 * 
 * @param {string} status - Alert status from database ('open', 'closed', 'cancelled')
 * @param {string} isTriggered - Triggered flag from database ('false', 'new', 'true')
 * @returns {string} Display state: 'new', 'active', 'unread', 'read', 'cancelled'
 */
function getAlertState(status, isTriggered) {
    if (status === 'open' && isTriggered === 'false') {
        return 'new';
    }
    if (status === 'open' && isTriggered !== 'false') {
        return 'active'; // התראה פתוחה עם מצב הפעלה שונה
    }
    if (status === 'closed' && isTriggered === 'new') {
        return 'unread';
    }
    if (status === 'closed' && isTriggered === 'true') {
        return 'read';
    }
    if (status === 'cancelled' && isTriggered === 'false') {
        return 'cancelled';
    }

    // ברירת מחדל
    return 'new';
}

/**
 * Validate alert status combination
 * ALERT SERVICE - Validates that status and triggered combination is valid
 * 
 * @param {string} status - Alert status
 * @param {string} isTriggered - Triggered flag
 * @returns {boolean} true if combination is valid, false otherwise
 */
function validateAlertStatusCombination(status, isTriggered) {
    // כללים לפי הדוקומנטציה:
    // 1. status='open' + is_triggered='false' - תקין
    // 2. status='closed' + is_triggered='new' - תקין  
    // 3. status='closed' + is_triggered='true' - תקין
    // 4. status='cancelled' + is_triggered='false' - תקין

    if (status === 'open' && isTriggered === 'false') {
        return true;
    }
    if (status === 'closed' && (isTriggered === 'new' || isTriggered === 'true')) {
        return true;
    }
    if (status === 'cancelled' && isTriggered === 'false') {
        return true;
    }

    return false;
}

/**
 * Get alert status display text
 * ALERT SERVICE - Returns Hebrew display text for alert status
 * 
 * @param {string} status - Alert status
 * @param {string} isTriggered - Triggered flag
 * @returns {string} Hebrew display text
 */
function getAlertStatusDisplay(status, isTriggered) {
    const state = getAlertState(status, isTriggered);
    
    const statusTexts = {
        'new': 'חדש',
        'active': 'פעיל',
        'unread': 'לא נקרא',
        'read': 'נקרא',
        'cancelled': 'מבוטל'
    };
    
    return statusTexts[state] || state;
}

/**
 * Get alert status CSS class
 * ALERT SERVICE - Returns CSS class for alert status styling
 * 
 * @param {string} status - Alert status
 * @param {string} isTriggered - Triggered flag
 * @returns {string} CSS class name
 */
function getAlertStatusClass(status, isTriggered) {
    const state = getAlertState(status, isTriggered);
    
    const statusClasses = {
        'new': 'bg-primary',
        'active': 'bg-success',
        'unread': 'bg-warning',
        'read': 'bg-secondary',
        'cancelled': 'bg-danger'
    };
    
    return statusClasses[state] || 'bg-secondary';
}

// ===== ALERT UTILITY FUNCTIONS =====

/**
 * Check if alert is active
 * ALERT SERVICE - Determines if an alert is currently active
 * 
 * @param {string} status - Alert status
 * @param {string} isTriggered - Triggered flag
 * @returns {boolean} true if alert is active
 */
function isAlertActive(status, isTriggered) {
    return status === 'open';
}

/**
 * Check if alert is triggered
 * ALERT SERVICE - Determines if an alert has been triggered
 * 
 * @param {string} isTriggered - Triggered flag
 * @returns {boolean} true if alert is triggered
 */
function isAlertTriggered(isTriggered) {
    return isTriggered === 'true' || isTriggered === 'new';
}

/**
 * Check if alert can be cancelled
 * ALERT SERVICE - Determines if an alert can be cancelled
 * 
 * @param {string} status - Alert status
 * @returns {boolean} true if alert can be cancelled
 */
function canAlertBeCancelled(status) {
    return status === 'open';
}

// ===== EXPORT TO GLOBAL SCOPE =====

// Export all functions to global scope
window.getAlertState = getAlertState;
window.validateAlertStatusCombination = validateAlertStatusCombination;
window.getAlertStatusDisplay = getAlertStatusDisplay;
window.getAlertStatusClass = getAlertStatusClass;
window.isAlertActive = isAlertActive;
window.isAlertTriggered = isAlertTriggered;
window.canAlertBeCancelled = canAlertBeCancelled;

// Export the service module
window.alertService = {
    getAlertState,
    validateAlertStatusCombination,
    getAlertStatusDisplay,
    getAlertStatusClass,
    isAlertActive,
    isAlertTriggered,
    canAlertBeCancelled
};

