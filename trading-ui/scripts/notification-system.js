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
 * 
 * עדכון: ינואר 2025 - הוספת מצבי עבודה למערכת התראות
 * - 4 מצבי עבודה: DEBUG, DEVELOPMENT, WORK, SILENT
 * - זיהוי אוטומטי של רמות חשיבות
 * - תמיכה בפעולות משתמש
 */

// ===== NOTIFICATION MODES SYSTEM =====
// מערכת מצבי עבודה להתראות

/**
 * מצבי עבודה למערכת התראות
 * NOTIFICATION MODES - 4 מצבים שונים לשליטה על הצגת התראות
 */
const NOTIFICATION_MODES = {
  DEBUG: {
    name: 'debug',
    title: 'מצב דיבג',
    description: 'הצגת כל ההתראות המפורטות כולל הודעות משניות',
    icon: 'fas fa-bug',
    color: '#6c757d'
  },
  DEVELOPMENT: {
    name: 'development', 
    title: 'מצב פיתוח',
    description: 'הצגת הודעות מרכזיות בלבד',
    icon: 'fas fa-code',
    color: '#6f42c1'
  },
  WORK: {
    name: 'work',
    title: 'מצב עבודה', 
    description: 'הצגת הודעות שגיאה והודעות שהם תוצאה של פעולות ותהליכים שהמשתמש הריץ',
    icon: 'fas fa-briefcase',
    color: '#28a745'
  },
  SILENT: {
    name: 'silent',
    title: 'מצב מושתק',
    description: 'הצגת הודעות שגיאה בלבד',
    icon: 'fas fa-volume-mute',
    color: '#dc3545'
  }
};

/**
 * רמות חשיבות לכל קטגוריית התראות
 * CATEGORY SEVERITY - מגדיר איזה סוגי הודעות נחשבים מרכזיים בכל קטגוריה
 */
const CATEGORY_SEVERITY = {
  system: { 
    primary: ['error'], 
    secondary: ['warning', 'info'] 
  },
  business: { 
    primary: ['success', 'error'], 
    secondary: ['info'] 
  },
  development: { 
    primary: [], 
    secondary: ['all'] 
  },
  performance: { 
    primary: ['error', 'warning'], 
    secondary: ['info'] 
  },
  ui: { 
    primary: [], 
    secondary: ['all'] 
  },
  security: {
    primary: ['error', 'warning'],
    secondary: ['info']
  },
  network: {
    primary: ['error', 'warning'],
    secondary: ['info']
  },
  database: {
    primary: ['error', 'warning'],
    secondary: ['info']
  },
  general: {
    primary: ['error'],
    secondary: ['warning', 'info', 'success']
  }
};

/**
 * בדוק אם הודעה נחשבת לרמת חשיבות מרכזית
 * NOTIFICATION MODES - בודק אם הודעה צריכה להיות מוצגת במצב DEVELOPMENT
 * 
 * @param {string} category - קטגוריית ההודעה
 * @param {string} type - סוג ההודעה (success, error, warning, info)
 * @returns {boolean} - האם ההודעה נחשבת מרכזית
 */
function isPrimarySeverity(category, type) {
  try {
    const severity = CATEGORY_SEVERITY[category];
    if (!severity) {
      // אם הקטגוריה לא מוגדרת, נשתמש בברירת מחדל
      return type === 'error';
    }
    
    // בדוק אם הסוג נמצא ברשימת הודעות מרכזיות
    return severity.primary.includes(type);
  } catch (error) {
    console.warn('Error checking primary severity:', error);
    return type === 'error'; // ברירת מחדל: רק שגיאות
  }
}

/**
 * בדוק אם הודעה נחשבת לפעולה שהמשתמש הפעיל
 * NOTIFICATION MODES - בודק אם הודעה צריכה להיות מוצגת במצב WORK
 * 
 * @param {string} message - תוכן ההודעה
 * @param {string} title - כותרת ההודעה
 * @param {string} functionName - שם הפונקציה שהפעילה את ההודעה
 * @returns {boolean} - האם ההודעה נחשבת לפעולת משתמש
 */
function isUserInitiatedAction(message, title, functionName) {
  try {
    const text = `${message} ${title} ${functionName}`.toLowerCase();
    
    // מילות מפתח המציינות פעולות משתמש
    const userActionKeywords = [
      'נשמר', 'נוסף', 'נמחק', 'עודכן', 'נוצר', 'הצלחה',
      'saved', 'added', 'deleted', 'updated', 'created', 'success',
      'הושלם', 'הופעל', 'בוטל', 'אושר', 'נדחה'
    ];
    
    // פונקציות שמציינות פעולות משתמש
    const userActionFunctions = [
      'save', 'add', 'delete', 'update', 'create', 'submit',
      'confirm', 'approve', 'reject', 'activate', 'deactivate'
    ];
    
    // בדוק מילות מפתח בהודעה
    const hasUserKeywords = userActionKeywords.some(keyword => 
      text.includes(keyword)
    );
    
    // בדוק שם פונקציה
    const hasUserFunction = userActionFunctions.some(func => 
      functionName && functionName.toLowerCase().includes(func)
    );
    
    return hasUserKeywords || hasUserFunction;
  } catch (error) {
    console.warn('Error checking user initiated action:', error);
    return false;
  }
}

/**
 * בדוק אם הודעה צריכה להיות מוצגת במצב עבודה נתון
 * NOTIFICATION MODES - הלוגיקה המרכזית לקביעת הצגת הודעות
 * 
 * @param {string} mode - מצב העבודה (debug, development, work, silent)
 * @param {string} category - קטגוריית ההודעה
 * @param {string} type - סוג ההודעה
 * @param {boolean} userInitiated - האם ההודעה נחשבת לפעולת משתמש
 * @returns {boolean} - האם ההודעה צריכה להיות מוצגת
 */
function shouldShowInMode(mode, category, type, userInitiated = false) {
  try {
    switch (mode) {
      case 'debug':
        // מצב דיבג: הצגת כל ההתראות
        return true;
        
      case 'development':
        // מצב פיתוח: הודעות מרכזיות בלבד
        return isPrimarySeverity(category, type);
        
      case 'work':
        // מצב עבודה: הודעות תוצאות פעולות משתמש + שגיאות + אזהרות חשובות
        return userInitiated || 
               type === 'error' || 
               (type === 'warning' && isPrimarySeverity(category, type));
        
      case 'silent':
        // מצב מושתק: שגיאות בלבד
        return type === 'error';
        
      default:
        // ברירת מחדל: מצב עבודה
        return userInitiated || type === 'error';
    }
  } catch (error) {
    console.warn('Error in shouldShowInMode:', error);
    // במקרה של שגיאה, הצג רק שגיאות
    return type === 'error';
  }
}

// ===== ALERTS SYSTEM FUNCTIONS =====
// These functions handle business alerts for market conditions

/**
 * Create a new alert
 * ALERTS SYSTEM - Creates business alert for market conditions
 *
 * @param {Object} alertData - Alert data object
 * @returns {Promise} Promise that resolves when alert is created
 */
async function createAlert(alertData) {
  try {
    // שמירה במטמון מאוחד
    if (window.UnifiedCacheManager) {
      await window.UnifiedCacheManager.save('alerts-data', alertData, {
        syncToBackend: true,
        dependencies: ['accounts-data']
      });
    }
    
    // עדכון היסטוריית התראות
    await updateNotificationHistory('alert-created', alertData);
    
    console.log('✅ Alert created successfully');
  } catch (error) {
    console.error('❌ Failed to create alert:', error);
    throw error;
  }
}

/**
 * Update notification history
 * Updates notification history in unified cache
 *
 * @param {string} action - Action performed
 * @param {Object} data - Related data
 * @returns {Promise} Promise that resolves when history is updated
 */
async function updateNotificationHistory(action, data) {
  try {
    if (window.UnifiedCacheManager) {
      // קבלת היסטוריה קיימת
      let history = await window.UnifiedCacheManager.get('notifications-history', {
        fallback: () => []
      });
      
      if (!Array.isArray(history)) {
        history = [];
      }
      
      // הוספת רשומה חדשה
      const entry = {
        action,
        data,
        timestamp: Date.now(),
        id: Date.now() + Math.random()
      };
      
      history.unshift(entry); // הוספה לתחילת הרשימה
      
      // הגבלת גודל היסטוריה
      if (history.length > 1000) {
        history = history.slice(0, 1000);
      }
      
      // שמירה במטמון מאוחד
      await window.UnifiedCacheManager.save('notifications-history', history, {
        layer: 'indexedDB',
        compress: true,
        ttl: 86400000 // 24 שעות
      });
    }
  } catch (error) {
    console.error('❌ Failed to update notification history:', error);
  }
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
async function shouldShowNotification(category, type = 'info', userInitiated = false, message = '', title = '', functionName = '') {
  try {
    // בדוק קודם את מצב העבודה החדש - עם שימוש במטמון הקיים
    if (typeof window.preferencesCache !== 'undefined' && typeof window.getPreference === 'function') {
      // נסה לקבל מהמטמון תחילה
      let notificationMode = null;
      const cached = await window.preferencesCache.get();
      if (cached && cached.notification_mode !== undefined) {
        notificationMode = cached.notification_mode;
      } else {
        // אם לא במטמון, קרא מהשרת ועדכן מטמון
        notificationMode = await window.getPreference('notification_mode', 1, null);
      }
      
      const mode = notificationMode || 'work'; // ברירת מחדל: מצב עבודה
      
      if (window.DEBUG_MODE) {
        console.log(`🔍 Notification mode: ${mode}, category: ${category}, type: ${type}, userInitiated: ${userInitiated}`);
      }
      
      // בדוק אם ההודעה צריכה להיות מוצגת במצב הנוכחי
      const shouldShow = shouldShowInMode(mode, category, type, userInitiated);
      
      if (!shouldShow) {
        if (window.DEBUG_MODE) {
          console.log(`🔍 Notification filtered out by mode ${mode}: category=${category}, type=${type}, userInitiated=${userInitiated}`);
        }
        return false;
      }
    }
    
    // בדוק את ההגדרות הישנות (תאימות לאחור)
    const preferenceName = `notifications_${category}_enabled`;
    console.log(`🔍 Checking preference: ${preferenceName}`);
    
    if (typeof window.getPreference !== 'function') {
      console.warn('getPreference function not available, showing notification by default');
      return true;
    }
    
    const isEnabled = await window.getPreference(preferenceName);
    if (window.DEBUG_MODE) {
      console.log(`🔍 Preference ${preferenceName} value:`, isEnabled, typeof isEnabled);
    }
    
    // If preference is not found (null), don't show notification
    if (isEnabled === null) {
      console.log(`⚠️ Preference ${preferenceName} not found - notification disabled`);
      return false;
    }
    
    const result = isEnabled === 'true' || isEnabled === true;
    if (window.DEBUG_MODE) {
      console.log(`🔍 Should show notification for ${category}:`, result);
    }
    return result;
  } catch (error) {
    if (window.DEBUG_MODE) {
      console.warn('Failed to check notification preference, showing by default:', error);
    }
    // For general category, map to system category; for others, show by default
    if (category === 'general') {
      // Map general to system category since general doesn't exist
      return await shouldShowNotification('system', type, userInitiated, message, title, functionName);
    }
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
async function showNotification(message, type = 'info', title = 'מערכת', duration = 5000, category = null, options = {}) {
  // Auto-detect category if not provided
  if (!category && typeof window.detectNotificationCategory === 'function') {
    try {
      const context = {
        fileName: window.location.pathname,
        functionName: options.functionName || 'showNotification',
        stackTrace: ''
      };
      const detectionResult = window.detectNotificationCategory(message, type, title, context);
      
      // Handle both old and new detection formats
      if (typeof detectionResult === 'string') {
        category = detectionResult;
      } else if (detectionResult && detectionResult.category) {
        category = detectionResult.category;
        // Update userInitiated from detection if not explicitly set
        if (options.userInitiated === undefined && detectionResult.userInitiated !== undefined) {
          options.userInitiated = detectionResult.userInitiated;
        }
      }
      
      // console.log(`🔍 Auto-detected category: ${category} for type: ${type}`);
    } catch (error) {
      console.warn('Failed to detect category, using default:', error);
      category = 'general';
    }
  } else if (!category) {
    // Fallback to type-based category
    switch (type) {
      case 'success': category = 'business'; break;
      case 'error': category = 'system'; break;
      case 'warning': category = 'system'; break;
      case 'info': category = 'ui'; break;
      default: category = 'general';
    }
  }
  
  // Check if notification should be shown based on category preferences and notification mode
  console.log(`🔔 showNotification called: "${message}", type: ${type}, category: ${category}, options:`, options);
  
  if (category) {
    try {
      const shouldShow = await shouldShowNotification(
        category, 
        type, 
        options.userInitiated || false, 
        message, 
        title, 
        options.functionName || 'showNotification'
      );
      if (window.DEBUG_MODE) {
        console.log(`🔍 Category ${category} enabled:`, shouldShow);
      }
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
  
  // Get dynamic colors from color scheme system
  const getNotificationColor = (type) => {
    if (typeof window.getEntityColor === 'function') {
      switch (type) {
        case 'success': return window.getEntityColor('account') || '#28a745';
        case 'error': return window.getEntityColor('ticker') || '#dc3545';
        case 'warning': return window.getEntityColor('alert') || '#ffc107';
        case 'info': return window.getEntityColor('execution') || '#17a2b8';
        default: return '#6c757d';
      }
    }
    // Fallback to default colors
    switch (type) {
      case 'success': return '#28a745';
      case 'error': return '#dc3545';
      case 'warning': return '#ffc107';
      case 'info': return '#17a2b8';
      default: return '#6c757d';
    }
  };

  const notificationColor = getNotificationColor(type);
  
  // Debug: Log dynamic color
  // console.log(`🎨 Dynamic notification color for ${type}:`, notificationColor);
  // console.log(`🎨 getEntityColor function available:`, typeof window.getEntityColor);

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.style.borderLeft = `4px solid ${notificationColor}`;
  notification.innerHTML = `
    <div class="notification-icon" style="color: ${notificationColor}">
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
  // console.log('🔍 DEBUG: Notification element created:', {
  //   element: notification,
  //   className: notification.className,
  //   type: type,
  //   innerHTML: notification.innerHTML.substring(0, 200) + '...'
  // });

  // Debug: Check computed styles
  setTimeout(() => {
    const computedStyle = window.getComputedStyle(notification);
    const titleElement = notification.querySelector('.notification-title');
    const messageElement = notification.querySelector('.notification-message');
    const iconElement = notification.querySelector('.notification-icon');
    
    // console.log('🔍 DEBUG: Computed styles after creation:', {
    //   notification: {
    //     backgroundColor: computedStyle.backgroundColor,
    //     color: computedStyle.color,
    //     borderColor: computedStyle.borderColor,
    //     display: computedStyle.display,
    //     opacity: computedStyle.opacity
    //   },
    //   title: titleElement ? {
    //     color: window.getComputedStyle(titleElement).color,
    //     fontSize: window.getComputedStyle(titleElement).fontSize,
    //     fontWeight: window.getComputedStyle(titleElement).fontWeight
    //   } : 'No title element',
    //   message: messageElement ? {
    //     color: window.getComputedStyle(messageElement).color,
    //     fontSize: window.getComputedStyle(messageElement).fontSize
    //   } : 'No message element',
    //   icon: iconElement ? {
    //     color: window.getComputedStyle(iconElement).color,
    //     fontSize: window.getComputedStyle(iconElement).fontSize
    //   } : 'No icon element'
    // });
    
    // Debug: Check if CSS file is loaded - DISABLED FOR PERFORMANCE
    // const stylesheets = Array.from(document.styleSheets);
    // const notificationCSS = stylesheets.find(sheet => {
    //   try {
    //     return sheet.href && sheet.href.includes('_notifications.css');
    //   } catch (e) {
    //     return false;
    //   }
    // });
    // console.log('🔍 DEBUG: CSS file check:', {
    //   totalStylesheets: stylesheets.length,
    //   notificationCSSLoaded: !!notificationCSS,
    //   notificationCSSUrl: notificationCSS ? notificationCSS.href : 'Not found'
    // });
    
    // Debug: Check CSS rules - DISABLED FOR PERFORMANCE
    // if (notificationCSS) {
    //   try {
    //     const rules = Array.from(notificationCSS.cssRules || notificationCSS.rules || []);
    //     const notificationRules = rules.filter(rule => 
    //       rule.selectorText && rule.selectorText.includes('.notification')
    //     );
    //     console.log('🔍 DEBUG: CSS rules check:', {
    //       totalRules: rules.length,
    //       notificationRules: notificationRules.length,
    //       notificationSelectors: notificationRules.map(rule => rule.selectorText)
    //     });
        
        // Debug: Check specific rules - DISABLED FOR PERFORMANCE
        // const titleRulesDebug = rules.filter(rule => 
        //   rule.selectorText && rule.selectorText.includes('.notification-title')
        // );
        // const messageRulesDebug = rules.filter(rule => 
        //   rule.selectorText && rule.selectorText.includes('.notification-message')
        // );
        // console.log('🔍 DEBUG: Specific rules check:', {
        //   titleRules: titleRulesDebug.length,
        //   messageRules: messageRulesDebug.length,
        //   titleSelectors: titleRulesDebug.map(rule => rule.selectorText),
        //   messageSelectors: messageRulesDebug.map(rule => rule.selectorText)
        // });
        
        // Debug: Check if !important rules are loaded - DISABLED FOR PERFORMANCE
        // const importantRules = rules.filter(rule => 
        //   rule.cssText && rule.cssText.includes('!important')
        // );
        // console.log('🔍 DEBUG: Important rules check:', {
        //   importantRulesCount: importantRules.length,
        //   importantRules: importantRules.map(rule => rule.selectorText + ' -> ' + rule.cssText.substring(0, 100))
        // });
        
        // Debug: Check specific color rules - DISABLED FOR PERFORMANCE
        // const colorRules = rules.filter(rule => 
        //   rule.cssText && (rule.cssText.includes('color:') || rule.cssText.includes('color :'))
        // );
        // console.log('🔍 DEBUG: Color rules check:', {
        //   colorRulesCount: colorRules.length,
        //   colorRules: colorRules.map(rule => rule.selectorText + ' -> ' + rule.cssText.substring(0, 150))
        // });
        
        // Debug: Check if our specific rules are loaded - DISABLED FOR PERFORMANCE
        // const ourRules = rules.filter(rule => 
        //   rule.cssText && (rule.cssText.includes('#1a1a1a') || rule.cssText.includes('#666'))
        // );
        // console.log('🔍 DEBUG: Our specific rules check:', {
        //   ourRulesCount: ourRules.length,
        //   ourRules: ourRules.map(rule => rule.selectorText + ' -> ' + rule.cssText.substring(0, 150))
        // });
        
        // Debug: Check the actual computed colors - DISABLED FOR PERFORMANCE
        // console.log('🔍 DEBUG: Actual computed colors:', {
        //   titleColor: titleElement ? window.getComputedStyle(titleElement).color : 'No title',
        //   messageColor: messageElement ? window.getComputedStyle(messageElement).color : 'No message',
        //   iconColor: iconElement ? window.getComputedStyle(iconElement).color : 'No icon'
        // });
        
        // Debug: Check specific CSS rules for our selectors - DISABLED FOR PERFORMANCE
        // const titleRulesDetailed = rules.filter(rule => 
        //   rule.selectorText && rule.selectorText.includes('.notification-title')
        // );
        // const messageRulesDetailed = rules.filter(rule => 
        //   rule.selectorText && rule.selectorText.includes('.notification-message')
        // );
        // console.log('🔍 DEBUG: Detailed CSS rules:', {
        //   titleRules: titleRulesDetailed.map(rule => rule.selectorText + ' -> ' + rule.cssText),
        //   messageRules: messageRulesDetailed.map(rule => rule.selectorText + ' -> ' + rule.cssText)
        // });
        
        // Debug: Check if Bootstrap is overriding our styles - DISABLED FOR PERFORMANCE
        // const bootstrapRules = rules.filter(rule => 
        //   rule.selectorText && (rule.selectorText.includes('.text-') || rule.selectorText.includes('.text-') || rule.selectorText.includes('body') || rule.selectorText.includes('*'))
        // );
        // console.log('🔍 DEBUG: Bootstrap/Global rules that might override:', {
        //   bootstrapRulesCount: bootstrapRules.length,
        //   bootstrapRules: bootstrapRules.slice(0, 5).map(rule => rule.selectorText + ' -> ' + rule.cssText.substring(0, 100))
        // });
      // } catch (e) {
      //   console.log('🔍 DEBUG: Cannot access CSS rules:', e.message);
      // }
    // }
  }, 100);

  // Add to page
  let container = document.getElementById('notification-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notification-container';
    container.className = 'notification-container';
    document.body.appendChild(container);
    // console.log('🔍 DEBUG: Created notification container:', container);
  }
  
  container.appendChild(notification);
  // console.log('🔍 DEBUG: Notification added to container:', {
  //   container: container,
  //   notification: notification,
  //   containerChildren: container.children.length
  // });

  // Trigger animation
  setTimeout(() => {
    notification.classList.add('show');
    // console.log('🔍 DEBUG: Animation triggered, notification classes:', notification.className);
  }, 10);

  // Auto remove after duration
  setTimeout(() => {
    if (notification.parentElement) {
      // console.log('🔍 DEBUG: Starting notification removal, classes:', notification.className);
      notification.classList.add('hide');
      setTimeout(() => {
        if (notification.parentElement) {
          // console.log('🔍 DEBUG: Removing notification from DOM');
          notification.remove();
        }
      }, 300); // Wait for animation
    }
  }, duration);

  // Save to global history
  saveNotificationToGlobalHistory(type, title, message, category).catch(error => {
    console.warn('Failed to save notification to global history:', error);
  });

  // Console log for debugging
  console.log(`🔔 ${type.toUpperCase()}: ${title} - ${message}`);
}

/**
 * Get notification icon based on type
 */
// Function already defined above

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
  const response = await fetch(`/api/linked-items/${itemType}/${itemId}`);

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
async function showSuccessNotification(title, message, duration = 4000, category = null, options = {}) {
  // Ensure title and message are provided
  const finalTitle = title || 'הצלחה';
  const finalMessage = message || 'הפעולה הושלמה בהצלחה';

  // showSuccessNotification calling showNotification with category and options
  await showNotification(finalMessage, 'success', finalTitle, duration, category, options);
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
async function showErrorNotification(title, message, duration = 6000, category = null, options = {}) {
  // showErrorNotification calling showNotification with category and options
  await showNotification(message, 'error', title, duration, category, options);
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
async function showWarningNotification(title, message, duration = 5000, category = null, options = {}) {
  // showWarningNotification calling showNotification with category and options
  await showNotification(message, 'warning', title, duration, category, options);
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
async function showInfoNotification(title, message, duration = 4000, category = null, options = {}) {
  // showInfoNotification calling showNotification with category and options
  await showNotification(message, 'info', title, duration, category, options);
}

/**
 * Show details modal
 * NOTIFICATION SYSTEM - Displays details in a modal dialog
 *
 * @param {string} title - Modal title
 * @param {string} content - Modal content (HTML or text)
 * @param {Object} options - Additional options
 */
async function showDetailsModal(title, content, options = {}) {
  console.log('🔍 showDetailsModal called:', { title, content, options });
  
  // סגירת כל החלונות הקודמים
  closeAllDetailsModals();
  
  // Create unique modal ID
  const modalId = `details-modal-${Date.now()}`;
  
  // Extract text content for copying
  const textContent = extractTextFromHTML(content);
  
  // Create modal HTML
  const modalHTML = `
    <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}-label" aria-hidden="true" data-bs-backdrop="true" data-bs-keyboard="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header text-white d-flex justify-content-between align-items-center" style="direction: rtl; background-color: ${window.getEntityColor ? window.getEntityColor('trade') || '#007bff' : '#007bff'};">
            <div class="d-flex gap-2">
              <button data-button-type="COPY" id="${modalId}-copy-btn" data-text="העתק" title="העתק ללוח">
              </button>
              <button data-button-type="CLOSE" id="${modalId}-close-btn" data-text="סגור" title="סגור">
              </button>
            </div>
            <h4 class="modal-title" id="${modalId}-label">${title}</h4>
          </div>
          <div class="modal-body">
            <div class="details-content">
              ${content}
            </div>
          </div>
          <div class="modal-footer" style="justify-content: flex-end; direction: rtl;">
            <button data-button-type="CANCEL" id="${modalId}-footer-close" data-text="סגור" title="סגור"></button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to page
  document.body.insertAdjacentHTML('beforeend', modalHTML);
  
  // Get modal element
  const modal = document.getElementById(modalId);
  
  // Ensure content is properly rendered as HTML
  const detailsContent = modal.querySelector('.details-content');
  if (detailsContent) {
    detailsContent.innerHTML = content;
  }
  
  // Show modal using simple system (no Bootstrap dependency)
  modal.style.display = 'block';
  modal.classList.add('show');
  document.body.classList.add('modal-open');
  
  // Create backdrop
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop fade show';
  backdrop.id = `${modalId}-backdrop`;
  document.body.appendChild(backdrop);
  
  // סגירה בלחיצה על הרקע
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      hideModal(modalId);
    }
  });
  
  // כפתור העתקה
  const copyButton = modal.querySelector(`#${modalId}-copy-btn`);
  if (copyButton) {
    copyButton.addEventListener('click', () => {
      copyToClipboard(textContent, title);
    });
  }
  
  // כפתור סגירה בכותרת
  const headerCloseButton = modal.querySelector(`#${modalId}-close-btn`);
  if (headerCloseButton) {
    headerCloseButton.addEventListener('click', () => {
      hideModal(modalId);
    });
  }
  
  // כפתור סגירה ב-footer
  const footerCloseBtn = modal.querySelector(`#${modalId}-footer-close`);
  if (footerCloseBtn) {
    footerCloseBtn.addEventListener('click', () => {
      hideModal(modalId);
    });
  }
  
  console.log('✅ Details modal shown:', modalId);
}

// Helper function to hide modal
function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  const backdrop = document.getElementById(`${modalId}-backdrop`);
  
  if (modal) {
    modal.style.display = 'none';
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
    modal.remove();
  }
  
  if (backdrop) {
    backdrop.remove();
  }
}

// Helper function to close all details modals
function closeAllDetailsModals() {
  // Find all existing details modals
  const existingModals = document.querySelectorAll('[id^="details-modal-"]');
  existingModals.forEach(modal => {
    const modalId = modal.id;
    hideModal(modalId);
  });
  
  // Remove any remaining backdrops
  const existingBackdrops = document.querySelectorAll('[id^="details-modal-"][id$="-backdrop"]');
  existingBackdrops.forEach(backdrop => {
    backdrop.remove();
  });
}

// Helper function to extract text content from HTML
function extractTextFromHTML(htmlContent) {
  // Create temporary div to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  
  // Extract text content
  let textContent = tempDiv.textContent || tempDiv.innerText || '';
  
  // Clean up the text
  textContent = textContent
    .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
    .replace(/\n\s+/g, '\n')  // Clean up line breaks
    .trim();
  
  return textContent;
}

// Helper function to copy text to clipboard
function copyToClipboard(textContent, title) {
  // Format the content with title
  const formattedContent = `${title}\n${'='.repeat(title.length)}\n\n${textContent}`;
  
  try {
    // Try modern clipboard API first
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(formattedContent).then(() => {
        showSuccessNotification('התוכן הועתק ללוח בהצלחה', 'העתקה');
        console.log('✅ Content copied to clipboard via Clipboard API');
      }).catch(err => {
        console.warn('Clipboard API failed, trying fallback:', err);
        fallbackCopyToClipboard(formattedContent);
      });
    } else {
      // Fallback for older browsers or non-secure contexts
      fallbackCopyToClipboard(formattedContent);
    }
  } catch (error) {
    console.error('❌ Error copying to clipboard:', error);
    fallbackCopyToClipboard(formattedContent);
  }
}

// Fallback copy function
function fallbackCopyToClipboard(text) {
  try {
    // Create temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, 99999); // For mobile devices
    
    // Copy the text
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    
    if (successful) {
      showSuccessNotification('התוכן הועתק ללוח בהצלחה', 'העתקה');
      console.log('✅ Content copied to clipboard via fallback method');
    } else {
      throw new Error('execCommand failed');
    }
  } catch (error) {
    console.error('❌ Fallback copy failed:', error);
    showErrorNotification('שגיאה בהעתקה ללוח', 'שגיאה');
  }
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
async function saveNotificationToGlobalHistory(type, title, message, category = 'general') {
  try {
    // יצירת אובייקט התראה
    const notification = {
      id: Date.now() + Math.random(),
      type,
      title,
      message,
      category,
      time: new Date(),
      timestamp: Date.now(),
      page: window.location.pathname,
      url: window.location.href
    };

    // שמירה למערכת המטמון המאוחדת החדשה רק אם מאותחלת
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
      try {
        await window.UnifiedCacheManager.save('notification_history', notification, {
          layer: 'indexedDB',
          ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
          category: 'notification'
        });
      } catch (error) {
        console.warn('שגיאה בשמירה במערכת המטמון החדשה, עובר ל-localStorage:', error.message);
      }
    } else {
      // מערכת מטמון לא מאותחלת - מדלג על שמירה
      console.log('⚠️ Cache system not initialized - skipping notification history save');
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

    // console.log('✅ התראה נשמרה להיסטוריה גלובלית');
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
    
    // טעינת היסטוריה מ-UnifiedCacheManager
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
      try {
        history = await window.UnifiedCacheManager.get('notification_history', {
          fallback: () => []
        });
      } catch (error) {
        console.warn('שגיאה בטעינה מ-UnifiedCacheManager, עובר ל-localStorage:', error.message);
        history = [];
      }
    } else {
      // מערכת מטמון לא מאותחלת - מדלג על טעינה
      console.log('⚠️ Cache system not initialized - skipping notification history load');
      history = [];
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

    // וידוא ש-history הוא מערך
    if (!Array.isArray(history)) {
      history = [];
    }

    const stats = {
      success: history.filter(n => n.type === 'success').length,
      error: history.filter(n => n.type === 'error').length,
      warning: history.filter(n => n.type === 'warning').length,
      info: history.filter(n => n.type === 'info').length,
      total: history.length,
      lastUpdated: Date.now()
    };

    // שמירה למערכת המטמון המאוחדת
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
      try {
        await window.UnifiedCacheManager.save('notification_stats', stats, {
          layer: 'indexedDB',
          ttl: 24 * 60 * 60 * 1000, // 24 hours
          category: 'notification'
        });
      } catch (error) {
        console.warn('שגיאה בשמירת סטטיסטיקות ב-IndexedDB:', error.message);
      }
    } else {
      // מערכת מטמון לא מאותחלת - מדלג על שמירת סטטיסטיקות
      console.log('⚠️ Cache system not initialized - skipping notification stats save');
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
    // טעינה מ-UnifiedCacheManager
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
      const history = await window.UnifiedCacheManager.get('notification_history', {
        fallback: () => []
      });
      if (history && history.length > 0) {
        return history;
      }
    } else {
      // IndexedDB לא זמין או לא מאותחל - מדלג על טעינה מ-IndexedDB
      // console.log('UnifiedIndexedDB לא מאותחל עדיין, מדלג על טעינת היסטוריה');
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
    // טעינה מ-UnifiedCacheManager
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
      const stats = await window.UnifiedCacheManager.get('notification_stats', {
        fallback: () => null
      });
      if (stats) {
        return stats;
      }
    } else {
      // IndexedDB לא זמין או לא מאותחל - מדלג על טעינה מ-IndexedDB
      console.log('UnifiedIndexedDB לא מאותחל עדיין, מדלג על טעינת סטטיסטיקות');
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
window.showDetailsModal = showDetailsModal;

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

// Global NotificationSystem object for compatibility
window.NotificationSystem = {
    show: window.showNotification,
    showSuccess: window.showSuccessNotification,
    showError: window.showErrorNotification,
    showWarning: window.showWarningNotification,
    showInfo: window.showInfoNotification,
    showDetails: window.showDetailsModal,
    shouldShow: window.shouldShowNotification,
    logWithCategory: window.logWithCategory,
    getCategoryIcon: window.getCategoryIcon,
    addGlobal: window.addGlobalNotification,
    getGlobal: window.getGlobalNotifications,
    clearGlobal: window.clearGlobalNotifications,
    migrate: window.migrateNotifications,
    isMigrationNeeded: window.isMigrationNeeded,
    initialize: function() {
        // console.log('🚀 NotificationSystem.initialize called');
        // Initialize notification system if needed
        // if (window.notificationSystemTester) {
        //     window.notificationSystemTester.runAllTests();
        // }
        return true;
    }
};

// פונקציה להצגת הודעה מפורטת בחלון
window.showDetailedNotification = async function(title, message, type = 'info', duration = 8000, category = null) {
  try {
    // יצירת modal עם התוכן המפורט
    const modalId = `detailed-notification-${Date.now()}`;
    const modalHtml = `
      <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header bg-${type === 'error' ? 'danger' : type === 'warning' ? 'warning' : type === 'success' ? 'success' : 'info'} text-white">
              <h5 class="modal-title" id="${modalId}Label">${title}</h5>
              <button data-button-type="CLOSE" data-size="large" data-variant="small" data-onclick="data-bs-dismiss='modal'" data-text="" title="סגור מודל" aria-label="סגור"></button>
            </div>
            <div class="modal-body">
              <div style="white-space: pre-line; font-family: monospace; font-size: 0.9em;">${message}</div>
            </div>
            <div class="modal-footer">
              <button data-button-type="CANCEL" data-onclick="data-bs-dismiss='modal'" data-text="ביטול" title="ביטול"></button>
              <button data-button-type="COPY" data-onclick="copyToClipboard('${message.replace(/'/g, "\\'")}')" data-text="העתק" title="העתק ללוח"></button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // הוספת ה-modal ל-DOM
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // הצגת ה-modal
    const modalElement = document.getElementById(modalId);
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
    
    // הסרת ה-modal אחרי סגירה
    modalElement.addEventListener('hidden.bs.modal', () => {
      modalElement.remove();
    });
    
    // סגירה אוטומטית אחרי הזמן שצוין
    if (duration > 0) {
      setTimeout(() => {
        if (modalElement && document.contains(modalElement)) {
          modal.hide();
        }
      }, duration);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error showing detailed notification:', error);
    // fallback להודעה רגילה
    return await window.showNotification(message, type, title, duration, category);
  }
};

// Export new helper functions to global scope
window.closeAllDetailsModals = closeAllDetailsModals;
window.extractTextFromHTML = extractTextFromHTML;
window.copyToClipboard = copyToClipboard;

// בדיקת פונקציות בסוף טעינת notification-system.js
// notification-system.js נטען
// WARNING FUNCTIONS moved to warning-system.js
// showDeleteWarning, showConfirmationDialog, showValidationWarning now in warning-system.js

