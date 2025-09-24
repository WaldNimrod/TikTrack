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
 * Check if notification should be shown based on category preferences
 * NOTIFICATION SYSTEM - Checks user preferences for notification category
 *
 * @param {string} category - Category of notification (development, system, business, performance, ui)
 * @returns {Promise<boolean>} - Whether notification should be shown
 */
async function shouldShowNotification(category) {
  try {
    const preferenceName = `notifications_${category}_enabled`;
    console.log(`🔍 Checking preference: ${preferenceName}`);
    
    if (typeof window.getPreference !== 'function') {
      console.warn('getPreference function not available, showing notification by default');
      return true;
    }
    
    const isEnabled = await window.getPreference(preferenceName);
    console.log(`🔍 Preference ${preferenceName} value:`, isEnabled, typeof isEnabled);
    
    const result = isEnabled === 'true' || isEnabled === true;
    console.log(`🔍 Should show notification for ${category}:`, result);
    return result;
  } catch (error) {
    console.warn('Failed to check notification preference, showing by default:', error);
    return true; // Default: show notification
  }
}

/**
 * Check if console log should be written based on category preferences
 * NOTIFICATION SYSTEM - Checks user preferences for console log category
 *
 * @param {string} category - Category of log (development, system, business, performance, ui)
 * @returns {Promise<boolean>} - Whether log should be written to console
 */
async function shouldLogToConsole(category) {
  try {
    const preferenceName = `console_logs_${category}_enabled`;
    const isEnabled = await window.getPreference(preferenceName);
    return isEnabled === 'true' || isEnabled === true;
  } catch (error) {
    console.warn('Failed to check console log preference, logging by default:', error);
    return true; // Default: write to console
  }
}

/**
 * Log with category support
 * NOTIFICATION SYSTEM - Logs message to console with category filtering
 *
 * @param {string} level - Log level (log, warn, error, info)
 * @param {string} message - Message to log
 * @param {string} category - Category of log (development, system, business, performance, ui)
 * @param {any} details - Additional details to log
 */
async function logWithCategory(level, message, category = 'system', details = null) {
  if (await shouldLogToConsole(category)) {
    const emoji = getLogEmoji(level);
    const timestamp = new Date().toLocaleTimeString('he-IL');
    console[level](`${emoji} [${category.toUpperCase()}] ${timestamp}: ${message}`, details);
  }
}

/**
 * Get emoji for log level
 * NOTIFICATION SYSTEM - Returns appropriate emoji for log level
 *
 * @param {string} level - Log level
 * @returns {string} Emoji for log level
 */
function getLogEmoji(level) {
  const emojis = {
    log: '📝',
    warn: '⚠️',
    error: '❌',
    info: 'ℹ️'
  };
  return emojis[level] || '📝';
}

/**
 * Show a notification message
 * NOTIFICATION SYSTEM - Displays system notification to user
 *
 * @param {string} message - Message to display
 * @param {string} type - Type of notification (success, error, warning, info)
 * @param {string} title - Optional title for the notification
 * @param {number} duration - Optional duration in milliseconds (default: 5000)
 * @param {string} category - Category of notification (development, system, business, performance, ui)
 */
async function showNotification(message, type = 'info', title = 'מערכת', duration = 5000, category = 'system') {
  // Check if notification should be shown based on category preferences
  // Only check if category is explicitly provided (not default 'system')
  console.log(`🔔 showNotification called: "${message}", type: ${type}, category: ${category}`);
  
  if (category && category !== 'system') {
    try {
      const shouldShow = await shouldShowNotification(category);
      console.log(`🔍 Category ${category} enabled:`, shouldShow);
      if (!shouldShow) {
        console.log(`❌ Notification blocked for category: ${category}`);
        return; // Don't show notification if category is disabled
      }
    } catch (error) {
      console.warn('Failed to check notification category, showing anyway:', error);
      // Continue to show notification if category check fails
    }
  } else {
    console.log(`✅ Showing notification (category: ${category})`);
  }
  
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
    <div class="notification-icon">
      <i class="fas ${getNotificationIcon(type)}"></i>
    </div>
    <div class="notification-content">
      <div class="notification-title">${title}</div>
      <div class="notification-message">${message}</div>
    </div>
    <button class="notification-close" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;

  // Debug: Log notification element details
  console.log('🔍 DEBUG: Notification element created:', {
    element: notification,
    className: notification.className,
    type: type,
    innerHTML: notification.innerHTML.substring(0, 200) + '...'
  });

  // Debug: Check computed styles
  setTimeout(() => {
    const computedStyle = window.getComputedStyle(notification);
    const titleElement = notification.querySelector('.notification-title');
    const messageElement = notification.querySelector('.notification-message');
    const iconElement = notification.querySelector('.notification-icon');
    
    console.log('🔍 DEBUG: Computed styles after creation:', {
      notification: {
        backgroundColor: computedStyle.backgroundColor,
        color: computedStyle.color,
        borderColor: computedStyle.borderColor,
        display: computedStyle.display,
        opacity: computedStyle.opacity
      },
      title: titleElement ? {
        color: window.getComputedStyle(titleElement).color,
        fontSize: window.getComputedStyle(titleElement).fontSize,
        fontWeight: window.getComputedStyle(titleElement).fontWeight
      } : 'No title element',
      message: messageElement ? {
        color: window.getComputedStyle(messageElement).color,
        fontSize: window.getComputedStyle(messageElement).fontSize
      } : 'No message element',
      icon: iconElement ? {
        color: window.getComputedStyle(iconElement).color,
        fontSize: window.getComputedStyle(iconElement).fontSize
      } : 'No icon element'
    });
    
    // Debug: Check if CSS file is loaded
    const stylesheets = Array.from(document.styleSheets);
    const notificationCSS = stylesheets.find(sheet => {
      try {
        return sheet.href && sheet.href.includes('_notifications.css');
      } catch (e) {
        return false;
      }
    });
    console.log('🔍 DEBUG: CSS file check:', {
      totalStylesheets: stylesheets.length,
      notificationCSSLoaded: !!notificationCSS,
      notificationCSSUrl: notificationCSS ? notificationCSS.href : 'Not found'
    });
    
    // Debug: Check CSS rules
    if (notificationCSS) {
      try {
        const rules = Array.from(notificationCSS.cssRules || notificationCSS.rules || []);
        const notificationRules = rules.filter(rule => 
          rule.selectorText && rule.selectorText.includes('.notification')
        );
        console.log('🔍 DEBUG: CSS rules check:', {
          totalRules: rules.length,
          notificationRules: notificationRules.length,
          notificationSelectors: notificationRules.map(rule => rule.selectorText)
        });
        
        // Debug: Check specific rules
        const titleRulesDebug = rules.filter(rule => 
          rule.selectorText && rule.selectorText.includes('.notification-title')
        );
        const messageRulesDebug = rules.filter(rule => 
          rule.selectorText && rule.selectorText.includes('.notification-message')
        );
        console.log('🔍 DEBUG: Specific rules check:', {
          titleRules: titleRulesDebug.length,
          messageRules: messageRulesDebug.length,
          titleSelectors: titleRulesDebug.map(rule => rule.selectorText),
          messageSelectors: messageRulesDebug.map(rule => rule.selectorText)
        });
        
        // Debug: Check if !important rules are loaded
        const importantRules = rules.filter(rule => 
          rule.cssText && rule.cssText.includes('!important')
        );
        console.log('🔍 DEBUG: Important rules check:', {
          importantRulesCount: importantRules.length,
          importantRules: importantRules.map(rule => rule.selectorText + ' -> ' + rule.cssText.substring(0, 100))
        });
        
        // Debug: Check specific color rules
        const colorRules = rules.filter(rule => 
          rule.cssText && (rule.cssText.includes('color:') || rule.cssText.includes('color :'))
        );
        console.log('🔍 DEBUG: Color rules check:', {
          colorRulesCount: colorRules.length,
          colorRules: colorRules.map(rule => rule.selectorText + ' -> ' + rule.cssText.substring(0, 150))
        });
        
        // Debug: Check if our specific rules are loaded
        const ourRules = rules.filter(rule => 
          rule.cssText && (rule.cssText.includes('#1a1a1a') || rule.cssText.includes('#666'))
        );
        console.log('🔍 DEBUG: Our specific rules check:', {
          ourRulesCount: ourRules.length,
          ourRules: ourRules.map(rule => rule.selectorText + ' -> ' + rule.cssText.substring(0, 150))
        });
        
        // Debug: Check the actual computed colors
        console.log('🔍 DEBUG: Actual computed colors:', {
          titleColor: titleElement ? window.getComputedStyle(titleElement).color : 'No title',
          messageColor: messageElement ? window.getComputedStyle(messageElement).color : 'No message',
          iconColor: iconElement ? window.getComputedStyle(iconElement).color : 'No icon'
        });
        
        // Debug: Check specific CSS rules for our selectors
        const titleRulesDetailed = rules.filter(rule => 
          rule.selectorText && rule.selectorText.includes('.notification-title')
        );
        const messageRulesDetailed = rules.filter(rule => 
          rule.selectorText && rule.selectorText.includes('.notification-message')
        );
        console.log('🔍 DEBUG: Detailed CSS rules:', {
          titleRules: titleRulesDetailed.map(rule => rule.selectorText + ' -> ' + rule.cssText),
          messageRules: messageRulesDetailed.map(rule => rule.selectorText + ' -> ' + rule.cssText)
        });
        
        // Debug: Check if Bootstrap is overriding our styles
        const bootstrapRules = rules.filter(rule => 
          rule.selectorText && (rule.selectorText.includes('.text-') || rule.selectorText.includes('.text-') || rule.selectorText.includes('body') || rule.selectorText.includes('*'))
        );
        console.log('🔍 DEBUG: Bootstrap/Global rules that might override:', {
          bootstrapRulesCount: bootstrapRules.length,
          bootstrapRules: bootstrapRules.slice(0, 5).map(rule => rule.selectorText + ' -> ' + rule.cssText.substring(0, 100))
        });
      } catch (e) {
        console.log('🔍 DEBUG: Cannot access CSS rules:', e.message);
      }
    }
  }, 100);

  // Add to page
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'notification-container';
    document.body.appendChild(container);
    console.log('🔍 DEBUG: Created notification container:', container);
  }
  
  container.appendChild(notification);
  console.log('🔍 DEBUG: Notification added to container:', {
    container: container,
    notification: notification,
    containerChildren: container.children.length
  });

  // Trigger animation
  setTimeout(() => {
    notification.classList.add('show');
    console.log('🔍 DEBUG: Animation triggered, notification classes:', notification.className);
  }, 10);

  // Auto remove after duration
  setTimeout(() => {
    if (notification.parentElement) {
      console.log('🔍 DEBUG: Starting notification removal, classes:', notification.className);
      notification.classList.add('hide');
      setTimeout(() => {
        if (notification.parentElement) {
          console.log('🔍 DEBUG: Removing notification from DOM');
          notification.remove();
        }
      }, 300); // Wait for animation
    }
  }, duration);

  // Save to global history
  saveNotificationToGlobalHistory(type, title, message).catch(error => {
    console.warn('Failed to save notification to global history:', error);
  });

  // Console log for debugging
  console.log(`🔔 ${type.toUpperCase()}: ${title} - ${message}`);
}

/**
 * Get notification icon based on type
 */
function getNotificationIcon(type) {
  switch (type) {
    case 'success': return 'fa-check-circle';
    case 'error': return 'fa-exclamation-circle';
    case 'warning': return 'fa-exclamation-triangle';
    case 'info': return 'fa-info-circle';
    default: return 'fa-info-circle';
  }
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
 * @param {string} category - Category of notification (default: 'system')
 */
async function showSuccessNotification(title, message, duration = 4000, category = 'system') {
  // Ensure title and message are provided
  const finalTitle = title || 'הצלחה';
  const finalMessage = message || 'הפעולה הושלמה בהצלחה';

  // showSuccessNotification calling showNotification with category
  await showNotification(finalMessage, 'success', finalTitle, duration, category);
}

/**
 * Show error notification
 * NOTIFICATION SYSTEM - Displays error message to user
 *
 * @param {string} title - Error notification title
 * @param {string} message - Error notification message
 * @param {number} duration - Display duration in milliseconds (default: 6000)
 * @param {string} category - Category of notification (default: 'system')
 */
async function showErrorNotification(title, message, duration = 6000, category = 'system') {
  // showErrorNotification calling showNotification with category
  await showNotification(message, 'error', title, duration, category);
}

/**
 * Show warning notification
 * NOTIFICATION SYSTEM - Displays warning message to user
 *
 * @param {string} title - Warning notification title
 * @param {string} message - Warning notification message
 * @param {number} duration - Display duration in milliseconds (default: 5000)
 * @param {string} category - Category of notification (default: 'system')
 */
async function showWarningNotification(title, message, duration = 5000, category = 'system') {
  // showWarningNotification calling showNotification with category
  await showNotification(message, 'warning', title, duration, category);
}

/**
 * Show info notification
 * NOTIFICATION SYSTEM - Displays info message to user
 *
 * @param {string} title - Info notification title
 * @param {string} message - Info notification message
 * @param {number} duration - Display duration in milliseconds (default: 4000)
 * @param {string} category - Category of notification (default: 'system')
 */
async function showInfoNotification(title, message, duration = 4000, category = 'system') {
  // showInfoNotification calling showNotification with category
  await showNotification(message, 'info', title, duration, category);
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
  // Direct console log to avoid recursion
  console.log(`🔔 ${type.toUpperCase()}: ${message}`);
}

// ===== GLOBAL NOTIFICATION HISTORY SYSTEM =====
/**
 * Save notification to global history for notifications center
 * NOTIFICATION SYSTEM - Saves all notifications to UnifiedIndexedDB for global access
 *
 * @param {string} type - Notification type
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 */
async function saveNotificationToGlobalHistory(type, title, message) {
  try {
    // יצירת אובייקט התראה
    const notification = {
      id: Date.now() + Math.random(),
      type,
      title,
      message,
      time: new Date(),
      timestamp: Date.now(),
      page: window.location.pathname,
      url: window.location.href
    };

    // שמירה ל-UnifiedIndexedDB
    if (window.UnifiedIndexedDB && window.UnifiedIndexedDB.isInitialized) {
      await window.UnifiedIndexedDB.saveNotificationHistory(notification, 'notification-system');
    } else if (window.UnifiedIndexedDB && !window.UnifiedIndexedDB.isInitialized) {
      console.warn('UnifiedIndexedDB לא מאותחל עדיין, מדלג על שמירה');
    }

    // Fallback ל-localStorage במקרה של בעיה
    try {
      let globalHistory = [];
      const savedHistory = localStorage.getItem('tiktrack_global_notifications_history');
      if (savedHistory) {
        globalHistory = JSON.parse(savedHistory);
    }

    globalHistory.unshift(notification);
    if (globalHistory.length > 100) {
      globalHistory = globalHistory.slice(0, 100);
    }

    localStorage.setItem('tiktrack_global_notifications_history', JSON.stringify(globalHistory));
    } catch (e) {
      console.warn('שגיאה בשמירת fallback ל-localStorage:', e);
    }

    // עדכון סטטיסטיקות גלובליות
    await updateGlobalNotificationStats();

    console.log('✅ התראה נשמרה להיסטוריה גלובלית');
  } catch (error) {
    console.warn('שגיאה בשמירת התראה להיסטוריה גלובלית:', error);
  }
}

/**
 * Update global notification statistics
 * NOTIFICATION SYSTEM - Updates global stats for notifications center
 */
async function updateGlobalNotificationStats() {
  try {
    let history = [];
    
    // טעינת היסטוריה מ-UnifiedIndexedDB
    if (window.UnifiedIndexedDB && window.UnifiedIndexedDB.isInitialized) {
      history = await window.UnifiedIndexedDB.getNotificationHistory();
    } else if (window.UnifiedIndexedDB && !window.UnifiedIndexedDB.isInitialized) {
      console.warn('UnifiedIndexedDB לא מאותחל עדיין, מדלג על טעינת היסטוריה');
    }
    
    // Fallback ל-localStorage
    if (history.length === 0) {
      try {
        const savedHistory = localStorage.getItem('tiktrack_global_notifications_history');
        if (savedHistory) {
          history = JSON.parse(savedHistory);
        }
      } catch (e) {
        console.warn('שגיאה בטעינת היסטוריה מ-localStorage:', e);
      }
    }

    const stats = {
      success: history.filter(n => n.type === 'success').length,
      error: history.filter(n => n.type === 'error').length,
      warning: history.filter(n => n.type === 'warning').length,
      info: history.filter(n => n.type === 'info').length,
      total: history.length,
      lastUpdated: Date.now()
    };

    // שמירה ל-UnifiedIndexedDB
    if (window.UnifiedIndexedDB) {
      await window.UnifiedIndexedDB.saveNotificationStats(stats, 'notification-system');
    }

    // Fallback ל-localStorage
    try {
    localStorage.setItem('tiktrack_global_notifications_stats', JSON.stringify(stats));
    } catch (e) {
      console.warn('שגיאה בשמירת סטטיסטיקות ל-localStorage:', e);
    }
  } catch (error) {
    console.warn('שגיאה בעדכון סטטיסטיקות גלובליות:', error);
  }
}

/**
 * Load global notification history
 * NOTIFICATION SYSTEM - Loads global history for notifications center
 *
 * @returns {Promise<Array>} Global notification history
 */
async function loadGlobalNotificationHistory() {
  try {
    // טעינה מ-UnifiedIndexedDB
    if (window.UnifiedIndexedDB && window.UnifiedIndexedDB.isInitialized) {
      const history = await window.UnifiedIndexedDB.getNotificationHistory();
      if (history && history.length > 0) {
        return history;
      }
    } else if (window.UnifiedIndexedDB && !window.UnifiedIndexedDB.isInitialized) {
      console.warn('UnifiedIndexedDB לא מאותחל עדיין, מדלג על טעינת היסטוריה');
    }
    
    // Fallback ל-localStorage
    const savedHistory = localStorage.getItem('tiktrack_global_notifications_history');
    return savedHistory ? JSON.parse(savedHistory) : [];
  } catch (error) {
    console.warn('שגיאה בטעינת היסטוריית התראות גלובלית:', error);
    return [];
  }
}

/**
 * Load global notification statistics
 * NOTIFICATION SYSTEM - Loads global stats for notifications center
 *
 * @returns {Promise<Object>} Global notification statistics
 */
async function loadGlobalNotificationStats() {
  try {
    // טעינה מ-UnifiedIndexedDB
    if (window.UnifiedIndexedDB && window.UnifiedIndexedDB.isInitialized) {
      const stats = await window.UnifiedIndexedDB.getNotificationStats();
      if (stats) {
        return stats;
      }
    } else if (window.UnifiedIndexedDB && !window.UnifiedIndexedDB.isInitialized) {
      console.warn('UnifiedIndexedDB לא מאותחל עדיין, מדלג על טעינת סטטיסטיקות');
    }
    
    // Fallback ל-localStorage
    const savedStats = localStorage.getItem('tiktrack_global_notifications_stats');
    if (savedStats) {
      return JSON.parse(savedStats);
    }
  } catch (error) {
    console.warn('שגיאה בטעינת סטטיסטיקות גלובליות:', error);
  }

  // סטטיסטיקות ברירת מחדל
  return {
    success: 0,
    error: 0,
    warning: 0,
    info: 0,
    total: 0,
    lastUpdated: Date.now()
  };
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

// Export NOTIFICATION CATEGORIES SYSTEM functions to global scope
window.shouldShowNotification = shouldShowNotification;
window.shouldLogToConsole = shouldLogToConsole;
window.logWithCategory = logWithCategory;
window.getLogEmoji = getLogEmoji;

// Export GLOBAL NOTIFICATION HISTORY functions
window.saveNotificationToGlobalHistory = saveNotificationToGlobalHistory;
window.loadGlobalNotificationHistory = loadGlobalNotificationHistory;
window.loadGlobalNotificationStats = loadGlobalNotificationStats;
window.updateGlobalNotificationStats = updateGlobalNotificationStats;

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
  
  // NOTIFICATION CATEGORIES SYSTEM functions
  shouldShowNotification,
  shouldLogToConsole,
  logWithCategory,
  getLogEmoji,
  
  // WARNING SYSTEM functions moved to warning-system.js
  // showValidationWarning, showConfirmationDialog, showDeleteWarning

  // LINKED ITEMS SYSTEM functions
  loadLinkedItemsData,
};

// בדיקת פונקציות בסוף טעינת notification-system.js
// notification-system.js נטען
// WARNING FUNCTIONS moved to warning-system.js
// showDeleteWarning, showConfirmationDialog, showValidationWarning now in warning-system.js

