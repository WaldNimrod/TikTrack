/**
 * Alert Service - Comprehensive Function Index
 * ==========================================
 * 
 * This file contains the alert service for TikTrack.
 * Provides alert state management, validation, and utility operations.
 * 
 * Related Documentation:
 * - documentation/02-ARCHITECTURE/FRONTEND/ALERT_SERVICE_SYSTEM.md
 * 
 * Author: TikTrack Development Team
 * Version: 1.0
 * Last Updated: 2025-01-27
 */

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
/**
 * Get alert state based on status and triggered flag
 * @function getAlertState
 * @param {string} status - Alert status from database
 * @param {string} isTriggered - Triggered flag from database
 * @returns {string} Display state
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
/**
 * Validate alert status combination
 * @function validateAlertStatusCombination
 * @param {string} status - Alert status
 * @param {string} isTriggered - Triggered flag
 * @returns {boolean} Whether combination is valid
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
/**
 * Get alert status display text
 * @function getAlertStatusDisplay
 * @param {string} status - Alert status
 * @param {string} isTriggered - Triggered flag
 * @returns {string} Display text
 */
function getAlertStatusDisplay(status, isTriggered) {
  const state = getAlertState(status, isTriggered);

  const statusTexts = {
    'new': 'חדש',
    'active': 'פעיל',
    'unread': 'לא נקרא',
    'read': 'נקרא',
    'cancelled': 'מבוטל',
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
/**
 * Get alert status CSS class
 * @function getAlertStatusClass
 * @param {string} status - Alert status
 * @param {string} isTriggered - Triggered flag
 * @returns {string} CSS class
 */
function getAlertStatusClass(status, isTriggered) {
  const state = getAlertState(status, isTriggered);

  const statusClasses = {
    'new': 'bg-primary',
    'active': 'bg-success',
    'unread': 'bg-warning',
    'read': 'bg-secondary',
    'cancelled': 'bg-danger',
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
/**
 * Check if alert is active
 * @function isAlertActive
 * @param {string} status - Alert status
 * @param {string} isTriggered - Triggered flag
 * @returns {boolean} Whether alert is active
 */
function isAlertActive(status, _isTriggered) {
  return status === 'open';
}

/**
 * Check if alert is triggered
 * ALERT SERVICE - Determines if an alert has been triggered
 *
 * @param {string} isTriggered - Triggered flag
 * @returns {boolean} true if alert is triggered
 */
/**
 * Check if alert is triggered
 * @function isAlertTriggered
 * @param {string} isTriggered - Triggered flag
 * @returns {boolean} Whether alert is triggered
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
/**
 * Check if alert can be cancelled
 * @function canAlertBeCancelled
 * @param {string} status - Alert status
 * @returns {boolean} Whether alert can be cancelled
 */
function canAlertBeCancelled(status) {
  return status === 'open';
}

// ===== GLOBAL EXPORTS =====
window.getAlertState = getAlertState;
window.validateAlertStatusCombination = validateAlertStatusCombination;
window.getAlertStatusDisplay = getAlertStatusDisplay;
window.getAlertStatusClass = getAlertStatusClass;
window.isAlertActive = isAlertActive;
window.isAlertTriggered = isAlertTriggered;
window.canAlertBeCancelled = canAlertBeCancelled;
window.formatAlertCondition = formatAlertCondition;
window.parseAlertCondition = parseAlertCondition;
window.cancelAlert = cancelAlert;
window.deleteAlert = deleteAlert;
window.updateAlertStatus = updateAlertStatus;
window.updateMultipleAlertsStatus = updateMultipleAlertsStatus;
window.updateAlertsSummary = updateAlertsSummary;

// Export all functions to global scope
window.getAlertState = getAlertState;
window.validateAlertStatusCombination = validateAlertStatusCombination;
window.getAlertStatusDisplay = getAlertStatusDisplay;
window.getAlertStatusClass = getAlertStatusClass;
window.isAlertActive = isAlertActive;
window.isAlertTriggered = isAlertTriggered;
window.canAlertBeCancelled = canAlertBeCancelled;
window.formatAlertCondition = formatAlertCondition;
window.parseAlertCondition = parseAlertCondition;
window.cancelAlert = cancelAlert;
window.deleteAlert = deleteAlert;

// ===== ALERT CONDITION FUNCTIONS =====

/**
 * פונקציה לתרגום תנאי התראה לעברית
 * @param {string} condition - תנאי ההתראה בפורמט: variable|operator|value
 * @returns {string} - התנאי מתורגם לעברית
 */
/**
 * Format alert condition for display
 * @function formatAlertCondition
 * @param {string} condition - Alert condition
 * @returns {string} Formatted condition
 */
function formatAlertCondition(condition) {
  if (!condition) {return '-';}

  // Use the new global translation function
  if (window.translateLegacyCondition) {
    return window.translateLegacyCondition(condition);
  }

  // Fallback to old format if new function not available
  const parts = condition.split(' | ');
  if (parts.length >= 3) {
    const variable = parts[0] || '';
    const operator = parts[1] || '';
    const value = parts[2] || '';

    // המרת משתנה לעברית
    const variableLabels = {
      'price': 'מחיר',
      'change': 'שינוי',
      'ma': 'ממוצע נע',
      'volume': 'נפח מסחר',
    };

    // המרת אופרטור לעברית עם סימנים חשבונאיים
    const operatorLabels = {
      'lessThen': '<',
      'moreThen': '>',
      'cross': '=',
      'crossUp': '↗',
      'crossDown': '↘',
      'upBy': '+',
      'downBy': '-',
      'changeBy': '±',
      'upByPre': '+%',
      'downByPre': '-%',
      'changeByPre': '±%',
    };

    const variableDisplay = variableLabels[variable] || variable;
    const operatorDisplay = operatorLabels[operator] || operator;

    if (operator && value) {
      // פורמט מיוחד לאופרטורים חשבונאיים
      if (['upBy', 'downBy', 'changeBy', 'upByPre', 'downByPre', 'changeByPre'].includes(operator)) {
        return `${variableDisplay} ${operatorDisplay}${value}`;
      } else {
        return `${variableDisplay} ${operatorDisplay} ${value}`;
      }
    } else if (variable) {
      return variable;
    } else {
      return condition;
    }
  }

  return condition;
}

/**
 * פונקציה לפרסור תנאי התראה
 * @param {string} condition - תנאי ההתראה בפורמט: variable|operator|value
 * @returns {object} - אובייקט עם המשתנה, האופרטור והערך
 */
/**
 * Parse alert condition
 * @function parseAlertCondition
 * @param {string} condition - Alert condition
 * @returns {Object} Parsed condition object
 */
function parseAlertCondition(condition) {
  if (!condition) {return { variable: '', operator: '', value: '' };}

  const parts = condition.split(' | ');
  if (parts.length >= 3) {
    return {
      variable: parts[0] || '',
      operator: parts[1] || '',
      value: parts[2] || '',
    };
  } else if (parts.length === 2) {
    return {
      variable: parts[0] || '',
      operator: parts[1] || '',
      value: '',
    };
  } else if (parts.length === 1) {
    return {
      variable: parts[0] || '',
      operator: '',
      value: '',
    };
  }

  return { variable: '', operator: '', value: '' };
}

/**
 * ביטול התראה - שינוי סטטוס למבוטל
 * @param {number} alertId - מזהה ההתראה
 */
/**
 * Cancel alert
 * @function cancelAlert
 * @async
 * @param {number} alertId - Alert ID
 * @returns {Promise<boolean>} Success status
 */
async function cancelAlert(alertId) {
  try {
    // ניקוי מטמון לפני פעולת CRUD - ביטול
    if (window.clearCacheBeforeCRUD) {
      window.clearCacheBeforeCRUD('alerts', 'cancel');
    }
    
    const response = await fetch(`/api/alerts/${alertId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'cancelled',
        is_triggered: 'false'
      }),
    });

    const result = await response.json();

    if (response.ok) {
      // התראה בוטלה בהצלחה
        if (window.showSuccessNotification) {
          window.showSuccessNotification('הצלחה', 'התראה בוטלה בהצלחה!');
        }
        
        // רענון הטבלה
        if (window.loadAlertsData) {
          await window.loadAlertsData();
        }
      }
      
      return true;
    } else {
      // שגיאה בביטול התראה
      if (window.showErrorNotification) {
        window.showErrorNotification('שגיאה בביטול', 'שגיאה בביטול התראה - בדוק את הנתונים');
      }
      return false;
    }
  } catch (error) {
    // שגיאה בביטול התראה
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'שגיאה בביטול התראה - בדוק את חיבור השרת');
    }
    return false;
  }
}

/**
 * מחיקת התראה - גרסה פשוטה לשימוש כללי
 * @param {number} alertId - מזהה ההתראה
 */
/**
 * Delete alert
 * @function deleteAlert
 * @async
 * @param {number} alertId - Alert ID
 * @returns {Promise<boolean>} Success status
 */
async function deleteAlert(alertId) {
  try {
    // ניקוי מטמון לפני פעולת CRUD - מחיקה
    if (window.clearCacheBeforeCRUD) {
      window.clearCacheBeforeCRUD('alerts', 'delete');
    }
    
    const response = await fetch(`/api/alerts/${alertId}`, {
      method: 'DELETE',
    });

    const result = await response.json();

    if (response.ok && result.status === 'success') {
      // התראה נמחקה בהצלחה
        if (window.showSuccessNotification) {
          window.showSuccessNotification('הצלחה', 'התראה נמחקה בהצלחה!');
        }
        
        // רענון הטבלה
        if (window.loadAlertsData) {
          await window.loadAlertsData();
        }
      }
      
      return true;
    } else {
      // שגיאה במחיקת התראה

      // טיפול בשגיאות מהשרת
      if (result.error && result.error.message) {
        const serverMessage = result.error.message;

        if (serverMessage.includes('has linked items')) {
          if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה במחיקה', 'לא ניתן למחוק התראה זו - יש פריטים מקושרים אליה');
          }
        } else {
          if (window.showErrorNotification) {
            window.showErrorNotification('שגיאה במחיקה', serverMessage);
          }
        }
      } else {
        if (window.showErrorNotification) {
          window.showErrorNotification('שגיאה במחיקה', 'שגיאה במחיקת התראה - בדוק את הנתונים');
        }
      }
      return false;
    }
  } catch {
    // שגיאה במחיקת התראה
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה', 'שגיאה במחיקת התראה - בדוק את חיבור השרת');
    }
    return false;
  }
}

// ===== ALERT STATUS UPDATE FUNCTIONS =====

/**
 * Update alert status via API
 * ALERT SERVICE - Centralized function for updating alert status
 *
 * @param {number} alertId - Alert ID
 * @param {string} status - New status ('open', 'closed', 'cancelled')
 * @param {string} isTriggered - Triggered flag ('false', 'new', 'true')
 * @returns {Promise<boolean>} true if successful, false otherwise
 */
/**
 * Update alert status
 * @function updateAlertStatus
 * @async
 * @param {number} alertId - Alert ID
 * @param {string} status - New status
 * @param {string} isTriggered - Triggered flag
 * @returns {Promise<boolean>} Success status
 */
async function updateAlertStatus(alertId, status, isTriggered = null) {
  try {
    const updateData = { status };
    if (isTriggered !== null) {
      updateData.is_triggered = isTriggered;
    }

    const response = await fetch(`/api/alerts/${alertId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.status === 'success') {
      // עדכון הנתונים המקומיים אם קיימים
      if (window.alertsData && Array.isArray(window.alertsData)) {
        const alertIndex = window.alertsData.findIndex(alert => alert.id === alertId);
        if (alertIndex !== -1) {
          window.alertsData[alertIndex].status = status;
          if (isTriggered !== null) {
            window.alertsData[alertIndex].is_triggered = isTriggered;
          }
        }
      }

      // רענון הטבלה אם הפונקציה זמינה
      if (typeof window.updateAlertsTable === 'function') {
        window.updateAlertsTable(window.alertsData);
      }

      // עדכון סטטיסטיקות אם הפונקציה זמינה
      if (typeof window.updateAlertsSummary === 'function') {
        window.updateAlertsSummary(window.alertsData);
      }

      return true;
    } else {
      throw new Error(result.error || 'Unknown error');
    }
  } catch (error) {
    if (window.Logger) {
      window.Logger.error('Error updating alert status:', error);
    }
    
    if (window.showErrorNotification) {
      window.showErrorNotification('שגיאה בעדכון סטטוס התראה', error.message);
    }
    
    return false;
  }
}

/**
 * Update multiple alerts status
 * ALERT SERVICE - Centralized function for updating multiple alerts status
 *
 * @param {Array<number>} alertIds - Array of alert IDs
 * @param {string} status - New status ('open', 'closed', 'cancelled')
 * @param {string} isTriggered - Triggered flag ('false', 'new', 'true')
 * @returns {Promise<number>} Number of successfully updated alerts
 */
/**
 * Update multiple alerts status
 * @function updateMultipleAlertsStatus
 * @async
 * @param {Array} alertIds - Array of alert IDs
 * @param {string} status - New status
 * @param {string} isTriggered - Triggered flag
 * @returns {Promise<boolean>} Success status
 */
async function updateMultipleAlertsStatus(alertIds, status, isTriggered = null) {
  let successCount = 0;
  
  for (const alertId of alertIds) {
    const success = await updateAlertStatus(alertId, status, isTriggered);
    if (success) {
      successCount++;
    }
  }
  
  return successCount;
}

/**
 * Update alerts summary statistics
 * ALERT SERVICE - Centralized function for updating alerts summary
 *
 * @param {Array} alertsData - Array of alerts data
 * @returns {Object} Summary statistics
 */
/**
 * Update alerts summary
 * @function updateAlertsSummary
 * @param {Array} alertsData - Alerts data
 * @returns {void}
 */
function updateAlertsSummary(alertsData) {
  if (!alertsData || !Array.isArray(alertsData)) {
    return {
      total: 0,
      active: 0,
      new: 0,
      unread: 0,
      read: 0,
      cancelled: 0
    };
  }

  const summary = {
    total: alertsData.length,
    active: 0,
    new: 0,
    unread: 0,
    read: 0,
    cancelled: 0
  };

  alertsData.forEach(alert => {
    const state = getAlertState(alert.status, alert.is_triggered);
    summary[state] = (summary[state] || 0) + 1;
  });

  return summary;
}

// Export the service module
window.alertService = {
  getAlertState,
  validateAlertStatusCombination,
  getAlertStatusDisplay,
  getAlertStatusClass,
  isAlertActive,
  isAlertTriggered,
  canAlertBeCancelled,
  formatAlertCondition,
  parseAlertCondition,
  cancelAlert,
  deleteAlert,
  updateAlertStatus,
  updateMultipleAlertsStatus,
  updateAlertsSummary,
  validateAlertStatusCombination,
};

