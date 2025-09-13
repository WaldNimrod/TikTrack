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
 * Get notification icon based on type
 * NOTIFICATION SYSTEM - Returns appropriate FontAwesome icon for notification type
 *
 * @param {string} type - Type of notification (success, error, warning, info)
 * @returns {string} FontAwesome icon class
 */
function getNotificationIcon(type) {
  const icons = {
    success: 'fa-check-circle',
    error: 'fa-exclamation-circle',
    warning: 'fa-exclamation-triangle',
    info: 'fa-info-circle'
  };
  return icons[type] || icons.info;
}

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
  console.log('🔔 showNotification נקרא:', { message, type, title, duration });
  
  // אם מרכז ההתראות זמין, הוסף את ההתראה אליו
  if (window.notificationsCenter && typeof window.notificationsCenter.addNotification === 'function') {
    console.log('✅ מוסיף התראה למרכז התראות');
    window.notificationsCenter.addNotification(type, title, message);
  }

  // הצגת התראה מיידית בממשק (תמיד)
  console.log('🔧 יוצר קונטיינר התראות...');
  const container = createNotificationContainer();
  console.log('✅ קונטיינר נוצר:', container);
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  
  notification.innerHTML = `
    <div class="notification-icon">
      <i class="fas ${getNotificationIcon(type)}"></i>
    </div>
    <div class="notification-content">
      <div class="notification-title">${title}</div>
      <div class="notification-message">${message}</div>
    </div>
    <button type="button" class="notification-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;

  console.log('🔧 מוסיף התראה לקונטיינר...');
  container.appendChild(notification);
  console.log('✅ התראה נוספה לקונטיינר');

  // הוספת קלאס show אחרי שהאלמנט נוסף ל-DOM
  setTimeout(() => {
    console.log('🔧 מוסיף קלאס show...');
    notification.classList.add('show');
    console.log('✅ קלאס show נוסף');
    
    // בדיקת סגנונות מחושבים להתראה
    const computedStyle = window.getComputedStyle(notification);
    console.log('🔍 סגנונות מחושבים להתראה:');
    console.log('  background:', computedStyle.background);
    console.log('  border:', computedStyle.border);
    console.log('  border-radius:', computedStyle.borderRadius);
    console.log('  transform:', computedStyle.transform);
    console.log('  opacity:', computedStyle.opacity);
    console.log('  display:', computedStyle.display);
    console.log('  position:', computedStyle.position);
    
    // בדיקת סגנונות notification
    const styleSheets = Array.from(document.styleSheets);
    const notificationStyles = Array.from(styleSheets).map(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules || []);
        return rules.filter(rule => 
          rule.selectorText && rule.selectorText.includes('notification')
        );
      } catch (e) {
        return [];
      }
    }).flat();
    console.log('🔍 סגנונות notification נמצאו:', notificationStyles.length);
    notificationStyles.forEach(rule => {
      console.log('    כלל:', rule.selectorText);
    });
  }, 10);

  // הסרה אוטומטית
  setTimeout(() => {
    console.log('🔧 מסיר התראה אוטומטית...');
    hideNotification(notification);
  }, duration);
}

// ייצוא הפונקציה הגלובלית - יועבר למטה

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
  console.log('🔧 createNotificationContainer נקרא');
  let container = document.getElementById('notification-container');
  console.log('🔍 קונטיינר קיים?', !!container);

  if (!container) {
    console.log('🔧 יוצר קונטיינר חדש...');
    container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'notification-container';
    document.body.appendChild(container);
    console.log('✅ קונטיינר נוצר ונוסף ל-DOM');
    
    // בדיקת סגנונות מחושבים
    const computedStyle = window.getComputedStyle(container);
    console.log('🔍 סגנונות מחושבים לקונטיינר:');
    console.log('  position:', computedStyle.position);
    console.log('  top:', computedStyle.top);
    console.log('  right:', computedStyle.right);
    console.log('  z-index:', computedStyle.zIndex);
    console.log('  max-width:', computedStyle.maxWidth);
    
    // בדיקת טעינת CSS
    console.log('🔍 בדיקת טעינת CSS:');
    const styleSheets = Array.from(document.styleSheets);
    const headerCss = styleSheets.find(sheet => 
      sheet.href && sheet.href.includes('header-styles.css')
    );
    console.log('  header-styles.css נטען?', !!headerCss);
    if (headerCss) {
      console.log('  header-styles.css URL:', headerCss.href);
    }
    
    // בדיקת סגנונות notification-container
    const notificationStyles = Array.from(styleSheets).map(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules || []);
        return rules.filter(rule => 
          rule.selectorText && rule.selectorText.includes('notification-container')
        );
      } catch (e) {
        return [];
      }
    }).flat();
    console.log('  סגנונות notification-container נמצאו:', notificationStyles.length);
    notificationStyles.forEach(rule => {
      console.log('    כלל:', rule.selectorText);
    });
  } else {
    console.log('✅ קונטיינר קיים');
  }

  console.log('🔍 קונטיינר סופי:', container);
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

// This function is already defined above - removing duplicate

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

// WARNING FUNCTIONS MOVED TO warning-system.js
// showValidationWarning, showConfirmationDialog, and showDeleteWarning
// are now located in scripts/warning-system.js



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
// WARNING SYSTEM functions now exported from warning-system.js
// window.showValidationWarning, window.showConfirmationDialog, window.showDeleteWarning

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
  // WARNING SYSTEM functions moved to warning-system.js
  // showValidationWarning, showConfirmationDialog, showDeleteWarning

  // LINKED ITEMS SYSTEM functions
  loadLinkedItemsData,
};

// בדיקת פונקציות בסוף טעינת notification-system.js
// notification-system.js נטען
// WARNING FUNCTIONS moved to warning-system.js
// showDeleteWarning, showConfirmationDialog, showValidationWarning now in warning-system.js

