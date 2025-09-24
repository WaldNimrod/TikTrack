/**
 * Notification Category Auto-Detector
 * ===================================
 * 
 * מערכת זיהוי אוטומטי של קטגוריות התראות
 * 
 * @version 1.0.0
 * @author TikTrack Development Team
 * @since September 2025
 */

// ===== CATEGORY DETECTION RULES =====

/**
 * Auto-detect notification category based on context
 * זיהוי אוטומטי של קטגוריית התראה על בסיס הקשר
 * 
 * @param {string} message - ההודעה
 * @param {string} type - סוג ההודעה (success, error, warning, info)
 * @param {string} title - כותרת ההודעה
 * @param {Object} context - הקשר (קובץ, פונקציה, etc.)
 * @returns {string} - הקטגוריה המתאימה
 */
window.detectNotificationCategory = function(message, type, title, context = {}) {
  // Context-based detection
  const fileName = context.fileName || '';
  const functionName = context.functionName || '';
  const stackTrace = context.stackTrace || '';
  
  // Development indicators
  if (isDevelopmentContext(fileName, functionName, message)) {
    return 'development';
  }
  
  // System indicators
  if (isSystemContext(fileName, functionName, message, type)) {
    return 'system';
  }
  
  // Business indicators
  if (isBusinessContext(fileName, functionName, message, type)) {
    return 'business';
  }
  
  // Performance indicators
  if (isPerformanceContext(fileName, functionName, message, type)) {
    return 'performance';
  }
  
  // UI indicators
  if (isUIContext(fileName, functionName, message, type)) {
    return 'ui';
  }
  
  // Default based on message type
  return getDefaultCategoryByType(type);
};

/**
 * Check if context indicates development category
 */
function isDevelopmentContext(fileName, functionName, message) {
  const devKeywords = [
    'cache-test', 'linter', 'debug', 'development', 'dev',
    'console', 'log', 'debugging', 'testing', 'mock', 'stub'
  ];
  
  const devMessages = [
    'לוג', 'debug', 'development', 'cache', 'מטמון',
    'פיתוח', 'בדיקה', 'דיבוג', 'ניקוי', 'loading', 'file'
  ];
  
  // Check if it's actually a test file (not just containing "test")
  if (fileName && fileName.includes('test') && !fileName.includes('tester')) {
    return false; // Don't classify test files as development
  }
  
  return checkKeywords(fileName, functionName, message, devKeywords, devMessages);
}

/**
 * Check if context indicates system category
 */
function isSystemContext(fileName, functionName, message, type) {
  const systemKeywords = [
    'system', 'server', 'api', 'database', 'error', 'exception',
    'connection', 'timeout', 'network', 'http', 'fetch'
  ];
  
  const systemMessages = [
    'מערכת', 'שרת', 'מסד נתונים', 'שגיאה', 'חיבור', 'רשת',
    'timeout', 'connection', 'api', 'server', 'cache', 'נוקה', 'מטמון'
  ];
  
  // Errors are usually system-related
  if (type === 'error') {
    return true;
  }
  
  return checkKeywords(fileName, functionName, message, systemKeywords, systemMessages);
}

/**
 * Check if context indicates business category
 */
function isBusinessContext(fileName, functionName, message, type) {
  const businessKeywords = [
    'trade', 'account', 'alert', 'execution', 'portfolio', 'position',
    'order', 'transaction', 'balance', 'profit', 'loss'
  ];
  
  const businessMessages = [
    'עסקה', 'חשבון', 'התראה', 'ביצוע', 'תיק', 'עמדה',
    'הזמנה', 'עסקאות', 'יתרה', 'רווח', 'הפסד', 'מסחר',
    'טרייד', 'נשמר', 'הצלחה'
  ];
  
  return checkKeywords(fileName, functionName, message, businessKeywords, businessMessages);
}

/**
 * Check if context indicates performance category
 */
function isPerformanceContext(fileName, functionName, message, type) {
  const performanceKeywords = [
    'performance', 'speed', 'time', 'memory', 'cache', 'optimization',
    'load', 'render', 'timing', 'metrics'
  ];
  
  const performanceMessages = [
    'ביצועים', 'מהירות', 'זמן', 'זיכרון', 'מטמון', 'אופטימיזציה',
    'טעינה', 'רנדור', 'timing', 'metrics'
  ];
  
  return checkKeywords(fileName, functionName, message, performanceKeywords, performanceMessages);
}

/**
 * Check if context indicates UI category
 */
function isUIContext(fileName, functionName, message, type) {
  const uiKeywords = [
    'ui', 'form', 'modal', 'dialog', 'button', 'input', 'validation',
    'user', 'interface', 'display', 'render', 'component'
  ];
  
  const uiMessages = [
    'ממשק', 'טופס', 'חלון', 'כפתור', 'שדה', 'אימות',
    'משתמש', 'ממשק משתמש', 'הצגה', 'רכיב'
  ];
  
  return checkKeywords(fileName, functionName, message, uiKeywords, uiMessages);
}

/**
 * Check if any keywords match
 */
function checkKeywords(fileName, functionName, message, keywords, messages) {
  const text = `${fileName} ${functionName} ${message}`.toLowerCase();
  
  return keywords.some(keyword => text.includes(keyword)) ||
         messages.some(msg => text.includes(msg));
}

/**
 * Get default category based on message type
 */
function getDefaultCategoryByType(type) {
  switch (type) {
    case 'success':
      return 'business'; // Success messages are usually business-related
    case 'error':
      return 'system';   // Errors are usually system-related
    case 'warning':
      return 'system';   // Warnings are usually system-related
    case 'info':
      return 'ui';       // Info messages are usually UI-related
    default:
      return 'system';
  }
}

// ===== ENHANCED NOTIFICATION FUNCTIONS =====

/**
 * Enhanced showNotification with auto-category detection
 */
window.showNotificationSmart = async function(message, type = 'info', title = 'מערכת', duration = 5000, category = null) {
  // Auto-detect category if not provided
  if (!category) {
    // Get current stack trace for context
    const stack = new Error().stack;
    const context = {
      fileName: getCurrentFileName(stack),
      functionName: getCurrentFunctionName(stack),
      stackTrace: stack
    };
    
    category = window.detectNotificationCategory(message, type, title, context);
  }
  
  // Use the original showNotification function directly (avoid recursion)
  if (typeof window.showNotification === 'function' && window.showNotification !== window.showNotificationSmart) {
    return window.showNotification(message, type, title, duration, category);
  } else {
    console.log(`🔔 ${type.toUpperCase()}: ${title} - ${message}`);
  }
};

/**
 * Enhanced showSuccessNotification with auto-category detection
 */
window.showSuccessNotificationSmart = async function(title, message, duration = 4000, category = null) {
  if (!category) {
    const stack = new Error().stack;
    const context = {
      fileName: getCurrentFileName(stack),
      functionName: getCurrentFunctionName(stack),
      stackTrace: stack
    };
    
    category = window.detectNotificationCategory(message, 'success', title, context);
  }
  
  if (typeof window.showSuccessNotification === 'function' && window.showSuccessNotification !== window.showSuccessNotificationSmart) {
    return await window.showSuccessNotification(title, message, duration, category);
  } else {
    console.log(`✅ SUCCESS: ${title} - ${message}`);
  }
};

/**
 * Enhanced showErrorNotification with auto-category detection
 */
window.showErrorNotificationSmart = async function(title, message, duration = 6000, category = null) {
  if (!category) {
    const stack = new Error().stack;
    const context = {
      fileName: getCurrentFileName(stack),
      functionName: getCurrentFunctionName(stack),
      stackTrace: stack
    };
    
    category = window.detectNotificationCategory(message, 'error', title, context);
  }
  
  if (typeof window.showErrorNotification === 'function' && window.showErrorNotification !== window.showErrorNotificationSmart) {
    return await window.showErrorNotification(title, message, duration, category);
  } else {
    console.error(`❌ ERROR: ${title} - ${message}`);
  }
};

/**
 * Enhanced showWarningNotification with auto-category detection
 */
window.showWarningNotificationSmart = async function(title, message, duration = 5000, category = null) {
  if (!category) {
    const stack = new Error().stack;
    const context = {
      fileName: getCurrentFileName(stack),
      functionName: getCurrentFunctionName(stack),
      stackTrace: stack
    };
    
    category = window.detectNotificationCategory(message, 'warning', title, context);
  }
  
  if (typeof window.showWarningNotification === 'function' && window.showWarningNotification !== window.showWarningNotificationSmart) {
    return await window.showWarningNotification(title, message, duration, category);
  } else {
    console.warn(`⚠️ WARNING: ${title} - ${message}`);
  }
};

/**
 * Enhanced showInfoNotification with auto-category detection
 */
window.showInfoNotificationSmart = async function(title, message, duration = 4000, category = null) {
  if (!category) {
    const stack = new Error().stack;
    const context = {
      fileName: getCurrentFileName(stack),
      functionName: getCurrentFunctionName(stack),
      stackTrace: stack
    };
    
    category = window.detectNotificationCategory(message, 'info', title, context);
  }
  
  if (typeof window.showInfoNotification === 'function' && window.showInfoNotification !== window.showInfoNotificationSmart) {
    return await window.showInfoNotification(title, message, duration, category);
  } else {
    console.log(`ℹ️ INFO: ${title} - ${message}`);
  }
};

// ===== UTILITY FUNCTIONS =====

/**
 * Extract current file name from stack trace
 */
function getCurrentFileName(stack) {
  if (!stack) return '';
  
  const lines = stack.split('\n');
  // Look for the first line that contains a file path
  for (let line of lines) {
    if (line.includes('/') && line.includes('.js')) {
      const match = line.match(/([^/]+\.js)/);
      if (match) {
        return match[1];
      }
    }
  }
  
  return '';
}

/**
 * Extract current function name from stack trace
 */
function getCurrentFunctionName(stack) {
  if (!stack) return '';
  
  const lines = stack.split('\n');
  // Look for the first line that contains a function name
  for (let line of lines) {
    if (line.includes('at ') && line.includes('(')) {
      const match = line.match(/at\s+([^(]+)/);
      if (match) {
        return match[1].trim();
      }
    }
  }
  
  return '';
}

// ===== EXPORT TO GLOBAL SCOPE =====

window.notificationCategoryDetector = {
  detectNotificationCategory,
  showNotificationSmart,
  showSuccessNotificationSmart,
  showErrorNotificationSmart,
  showWarningNotificationSmart,
  showInfoNotificationSmart
};

console.log('🧠 Notification Category Auto-Detector loaded successfully');
console.log('🔍 Available smart functions:', {
  showNotificationSmart: typeof window.showNotificationSmart === 'function',
  showSuccessNotificationSmart: typeof window.showSuccessNotificationSmart === 'function',
  showErrorNotificationSmart: typeof window.showErrorNotificationSmart === 'function',
  showWarningNotificationSmart: typeof window.showWarningNotificationSmart === 'function',
  showInfoNotificationSmart: typeof window.showInfoNotificationSmart === 'function'
});
