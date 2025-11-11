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

// ===== PRESERVE ORIGINAL FUNCTIONS =====
// שמירת הפניות המקוריות למניעת לולאות אין סופיות
// נשמור את הפונקציות אחרי שהן מוגדרות

// ===== CATEGORY DETECTION SYSTEM =====

// ===== CATEGORY DETECTION RULES =====

/**
 * Auto-detect notification category based on context
 * זיהוי אוטומטי של קטגוריית התראה על בסיס הקשר
 * 
 * @param {string} message - ההודעה
 * @param {string} type - סוג ההודעה (success, error, warning, info)
 * @param {string} title - כותרת ההודעה
 * @param {Object} context - הקשר (קובץ, פונקציה, etc.)
 * @returns {string|Object} - הקטגוריה המתאימה או אובייקט עם קטגוריה ומידע על פעולת משתמש
 */
window.detectNotificationCategory = function(message, type, title, context = {}) {
  // Context-based detection
  const fileName = context.fileName || '';
  const functionName = context.functionName || '';
  const stackTrace = context.stackTrace || '';
  
  // בדוק אם זו פעולת משתמש
  const userInitiated = isUserInitiatedAction(message, title, functionName);
  
  // Business indicators (check first for success messages)
  if (isBusinessContext(fileName, functionName, message, type)) {
    return {
      category: 'business',
      userInitiated: userInitiated
    };
  }
  
  // Development indicators
  if (isDevelopmentContext(fileName, functionName, message)) {
    return {
      category: 'development',
      userInitiated: userInitiated
    };
  }
  
  // System indicators
  if (isSystemContext(fileName, functionName, message, type)) {
    return {
      category: 'system',
      userInitiated: userInitiated
    };
  }
  
  // Performance indicators
  if (isPerformanceContext(fileName, functionName, message, type)) {
    return {
      category: 'performance',
      userInitiated: userInitiated
    };
  }
  
  // UI indicators
  if (isUIContext(fileName, functionName, message, type)) {
    return {
      category: 'ui',
      userInitiated: userInitiated
    };
  }
  
  // Default based on message type
  const defaultResult = getDefaultCategoryByType(type);
  return {
    category: defaultResult,
    userInitiated: userInitiated
  };
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
    'פיתוח', 'דיבוג', 'ניקוי', 'loading', 'file'
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
    'system', 'server', 'api', 'database', 'exception',
    'connection', 'timeout', 'network', 'http', 'fetch'
  ];
  
  const systemMessages = [
    'מערכת', 'שרת', 'מסד נתונים', 'חיבור', 'רשת',
    'timeout', 'connection', 'api', 'server', 'cache', 'נוקה', 'מטמון'
  ];
  
  // Don't automatically classify errors as system - let content analysis decide
  // if (type === 'error') {
  //   return true;
  // }
  
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
  // Type and category are separate concepts
  // Type determines color, category determines icon and context
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
      return 'general';  // Default to general
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
      'הושלם', 'הופעל', 'בוטל', 'אושר', 'נדחה', 'נטען',
      'נפתח', 'נסגר', 'נשמרה', 'נוספה', 'נמחקה', 'עודכנה'
    ];
    
    // פונקציות שמציינות פעולות משתמש
    const userActionFunctions = [
      'save', 'add', 'delete', 'update', 'create', 'submit',
      'confirm', 'approve', 'reject', 'activate', 'deactivate',
      'load', 'open', 'close', 'import', 'export', 'upload', 'download'
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

// ===== ENHANCED NOTIFICATION FUNCTIONS =====

// Smart functions removed - use standard functions directly

// Smart functions removed - use standard functions directly

// Smart functions removed - use standard functions directly

// Smart functions removed - use standard functions directly

// Smart functions removed - use standard functions directly

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

// ===== CATEGORY ICON FUNCTIONS =====

/**
 * Get icon for notification category
 * קבלת אייקון לקטגוריית התראה
 * 
 * @param {string} category - Category name
 * @param {Object} options - Icon options
 * @returns {string} Icon HTML or emoji
 */
function getCategoryIcon(category, options = {}) {
  try {
    console.log(`🎨 Getting icon for category: ${category}`);
    
    const iconMap = {
      'development': {
        emoji: '🛠️',
        icon: 'fas fa-tools',
        color: '#6c757d',
        title: 'פיתוח'
      },
      'system': {
        emoji: '⚙️',
        icon: 'fas fa-cog',
        color: '#dc3545',
        title: 'מערכת'
      },
      'business': {
        emoji: '💼',
        icon: 'fas fa-briefcase',
        color: '#28a745',
        title: 'עסקי'
      },
      'performance': {
        emoji: '⚡',
        icon: 'fas fa-tachometer-alt',
        color: '#ffc107',
        title: 'ביצועים'
      },
      'ui': {
        emoji: '🎨',
        icon: 'fas fa-palette',
        color: '#17a2b8',
        title: 'ממשק משתמש'
      },
      'security': {
        emoji: '🔒',
        icon: 'fas fa-shield-alt',
        color: '#6f42c1',
        title: 'אבטחה'
      },
      'network': {
        emoji: '🌐',
        icon: 'fas fa-network-wired',
        color: '#20c997',
        title: 'רשת'
      },
      'database': {
        emoji: '🗄️',
        icon: 'fas fa-database',
        color: '#fd7e14',
        title: 'מסד נתונים'
      },
      'api': {
        emoji: '🔌',
        icon: 'fas fa-plug',
        color: '#e83e8c',
        title: 'API'
      },
      'cache': {
        emoji: '💾',
        icon: 'fas fa-memory',
        color: '#6c757d',
        title: 'מטמון'
      },
      'general': {
        emoji: '📢',
        icon: 'fas fa-bullhorn',
        color: '#6c757d',
        title: 'כללי'
      }
    };
    
    const categoryInfo = iconMap[category] || {
      emoji: '📋',
      icon: 'fas fa-info-circle',
      color: '#6c757d',
      title: 'כללי'
    };
    
    // Return format based on options
    if (options.format === 'html') {
      return `<i class="${categoryInfo.icon}" style="color: ${categoryInfo.color};" title="${categoryInfo.title}"></i>`;
    } else if (options.format === 'emoji') {
      return categoryInfo.emoji;
    } else if (options.format === 'object') {
      return categoryInfo;
    } else {
      // Default: return emoji
      return categoryInfo.emoji;
    }
    
  } catch (error) {
    console.error('❌ Error getting category icon:', error);
    return '📋'; // Default fallback
  }
}

/**
 * Get all available category icons
 * קבלת כל האייקונים הזמינים
 * 
 * @param {Object} options - Display options
 * @returns {Object|Array} Category icons information
 */
function getAllCategoryIcons(options = {}) {
  try {
    console.log('🎨 Getting all category icons...');
    
    const categories = ['development', 'system', 'business', 'performance', 'ui', 'security', 'network', 'database', 'api', 'cache'];
    
    if (options.format === 'array') {
      return categories.map(category => ({
        category,
        icon: getCategoryIcon(category, { format: 'object' })
      }));
    } else {
      const icons = {};
      categories.forEach(category => {
        icons[category] = getCategoryIcon(category, { format: 'object' });
      });
      return icons;
    }
    
  } catch (error) {
    console.error('❌ Error getting all category icons:', error);
    return {};
  }
}

/**
 * Get category color
 * קבלת צבע הקטגוריה
 * 
 * @param {string} category - Category name
 * @returns {string} Color code
 */
function getCategoryColor(category) {
  try {
    const categoryInfo = getCategoryIcon(category, { format: 'object' });
    return categoryInfo.color || '#6c757d';
  } catch (error) {
    console.error('❌ Error getting category color:', error);
    return '#6c757d';
  }
}

/**
 * Get category title in Hebrew
 * קבלת כותרת הקטגוריה בעברית
 * 
 * @param {string} category - Category name
 * @returns {string} Hebrew title
 */
function getCategoryTitle(category) {
  try {
    const categoryInfo = getCategoryIcon(category, { format: 'object' });
    return categoryInfo.title || 'כללי';
  } catch (error) {
    console.error('❌ Error getting category title:', error);
    return 'כללי';
  }
}

// ===== EXPORT TO GLOBAL SCOPE =====

window.notificationCategoryDetector = {
  detectNotificationCategory,
  getCategoryIcon,
  getAllCategoryIcons,
  getCategoryColor,
  getCategoryTitle
};

// Export individual functions
window.getCategoryIcon = getCategoryIcon;
window.getAllCategoryIcons = getAllCategoryIcons;
window.getCategoryColor = getCategoryColor;
window.getCategoryTitle = getCategoryTitle;

console.log('🧠 Notification Category Auto-Detector loaded successfully');
console.log('🔍 Available smart functions:', {
  showNotificationSmart: typeof window.showNotificationSmart === 'function',
  showSuccessNotificationSmart: typeof window.showSuccessNotificationSmart === 'function',
  showErrorNotificationSmart: typeof window.showErrorNotificationSmart === 'function',
  showWarningNotificationSmart: typeof window.showWarningNotificationSmart === 'function',
  showInfoNotificationSmart: typeof window.showInfoNotificationSmart === 'function'
});
