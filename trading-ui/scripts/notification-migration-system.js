/**
 * Notification Migration System
 * =============================
 * 
 * מערכת מיגרציה אוטומטית של התראות לקטגוריות
 * 
 * @version 1.0.0
 * @author TikTrack Development Team
 * @since September 2025
 */

// ===== MIGRATION SYSTEM =====

/**
 * Auto-migrate existing notification calls to use smart detection
 * מיגרציה אוטומטית של קריאות התראות קיימות
 */
window.migrateNotificationCalls = function() {
  console.log('🔄 Starting notification migration...');
  
  // Override existing notification functions with smart versions
  const originalFunctions = {
    showNotification: window.showNotification,
    showSuccessNotification: window.showSuccessNotification,
    showErrorNotification: window.showErrorNotification,
    showWarningNotification: window.showWarningNotification,
    showInfoNotification: window.showInfoNotification
  };
  
  // Store originals for fallback
  window._originalNotificationFunctions = originalFunctions;
  
  // Replace with smart versions (only if smart versions exist and originals exist)
  console.log('🔄 Replacing notification functions with smart versions...');
  console.log('showNotificationSmart available:', typeof window.showNotificationSmart === 'function');
  console.log('showSuccessNotificationSmart available:', typeof window.showSuccessNotificationSmart === 'function');
  
  if (window.showNotificationSmart && window._originalNotificationFunctions.showNotification) {
    console.log('✅ Replacing showNotification with smart version');
    window.showNotification = window.showNotificationSmart;
  }
  if (window.showSuccessNotificationSmart && window._originalNotificationFunctions.showSuccessNotification) {
    console.log('✅ Replacing showSuccessNotification with smart version');
    window.showSuccessNotification = window.showSuccessNotificationSmart;
  }
  if (window.showErrorNotificationSmart && window._originalNotificationFunctions.showErrorNotification) {
    console.log('✅ Replacing showErrorNotification with smart version');
    window.showErrorNotification = window.showErrorNotificationSmart;
  }
  if (window.showWarningNotificationSmart && window._originalNotificationFunctions.showWarningNotification) {
    console.log('✅ Replacing showWarningNotification with smart version');
    window.showWarningNotification = window.showWarningNotificationSmart;
  }
  if (window.showInfoNotificationSmart && window._originalNotificationFunctions.showInfoNotification) {
    console.log('✅ Replacing showInfoNotification with smart version');
    window.showInfoNotification = window.showInfoNotificationSmart;
  }
  
  console.log('✅ Notification migration completed');
};

/**
 * Rollback to original notification functions
 * חזרה לפונקציות המקוריות
 */
window.rollbackNotificationCalls = function() {
  console.log('🔄 Rolling back notification functions...');
  
  if (window._originalNotificationFunctions) {
    window.showNotification = window._originalNotificationFunctions.showNotification;
    window.showSuccessNotification = window._originalNotificationFunctions.showSuccessNotification;
    window.showErrorNotification = window._originalNotificationFunctions.showErrorNotification;
    window.showWarningNotification = window._originalNotificationFunctions.showWarningNotification;
    window.showInfoNotification = window._originalNotificationFunctions.showInfoNotification;
    
    console.log('✅ Notification rollback completed');
  } else {
    console.warn('⚠️ No original functions found to rollback to');
  }
};

/**
 * Test the migration system
 * בדיקת מערכת המיגרציה
 */
window.testNotificationMigration = function() {
  console.log('🧪 Testing notification migration...');
  
  // Test different types of notifications
  const testCases = [
    { func: 'showSuccessNotification', title: 'הצלחה', message: 'עסקה בוצעה בהצלחה' },
    { func: 'showErrorNotification', title: 'שגיאה', message: 'שגיאת חיבור לשרת' },
    { func: 'showWarningNotification', title: 'אזהרה', message: 'זיכרון נמוך' },
    { func: 'showInfoNotification', title: 'מידע', message: 'טופס נשמר' }
  ];
  
  testCases.forEach((testCase, index) => {
    setTimeout(() => {
      console.log(`🧪 Testing ${testCase.func}...`);
      if (window[testCase.func]) {
        window[testCase.func](testCase.title, testCase.message);
      }
    }, index * 1000);
  });
  
  console.log('✅ Notification migration test completed');
};

// ===== CATEGORY STATISTICS =====

/**
 * Collect statistics about notification categories
 * איסוף סטטיסטיקות על קטגוריות התראות
 */
window.collectNotificationStats = function() {
  const stats = {
    development: 0,
    system: 0,
    business: 0,
    performance: 0,
    ui: 0,
    total: 0
  };
  
  // This would be populated by actual usage tracking
  // For now, return empty stats
  return stats;
};

/**
 * Generate migration report
 * יצירת דוח מיגרציה
 */
window.generateMigrationReport = function() {
  const stats = window.collectNotificationStats();
  
  console.log('📊 Notification Migration Report:');
  console.log('================================');
  console.log(`Development: ${stats.development}`);
  console.log(`System: ${stats.system}`);
  console.log(`Business: ${stats.business}`);
  console.log(`Performance: ${stats.performance}`);
  console.log(`UI: ${stats.ui}`);
  console.log(`Total: ${stats.total}`);
  
  return stats;
};

// ===== AUTO-MIGRATION ON LOAD =====

/**
 * Auto-migrate when the system loads
 * מיגרציה אוטומטית בטעינת המערכת
 */
document.addEventListener('DOMContentLoaded', function() {
  // Wait a bit for all scripts to load
  setTimeout(() => {
    if (window.detectNotificationCategory && window.showNotificationSmart) {
      console.log('🚀 Auto-migrating notification calls...');
      window.migrateNotificationCalls();
    } else {
      console.warn('⚠️ Smart notification functions not available, skipping migration');
    }
  }, 1000);
});

// ===== MIGRATION FUNCTIONS =====

/**
 * Migrate notifications from old format to new format
 * מיגרציה של התראות מפורמט ישן לחדש
 * 
 * @param {Array} oldNotifications - Array of old format notifications
 * @returns {Array} Array of migrated notifications
 */
function migrateNotifications(oldNotifications) {
  try {
    console.log('🔄 Migrating notifications from old format to new format...');
    
    if (!Array.isArray(oldNotifications)) {
      console.warn('⚠️ Invalid notifications array provided');
      return [];
    }
    
    const migratedNotifications = oldNotifications.map((notification, index) => {
      try {
        // Handle different old formats
        let migratedNotification;
        
        if (typeof notification === 'string') {
          // Simple string notification
          migratedNotification = {
            id: Date.now() + index,
            type: 'info',
            title: 'הודעה',
            message: notification,
            timestamp: Date.now(),
            time: new Date(),
            page: window.location.pathname.replace('.html', '').replace('/', '') || 'home',
            url: window.location.href,
            migrated: true,
            originalFormat: 'string'
          };
        } else if (notification.message && notification.type) {
          // Already in new format or close to it
          migratedNotification = {
            id: notification.id || Date.now() + index,
            type: notification.type || 'info',
            title: notification.title || 'הודעה',
            message: notification.message,
            timestamp: notification.timestamp || Date.now(),
            time: notification.time || new Date(),
            page: notification.page || window.location.pathname.replace('.html', '').replace('/', '') || 'home',
            url: notification.url || window.location.href,
            migrated: true,
            originalFormat: 'object'
          };
        } else if (notification.text) {
          // Old format with 'text' property
          migratedNotification = {
            id: Date.now() + index,
            type: notification.level || notification.severity || 'info',
            title: notification.title || 'הודעה',
            message: notification.text,
            timestamp: notification.timestamp || Date.now(),
            time: notification.time || new Date(),
            page: notification.page || window.location.pathname.replace('.html', '').replace('/', '') || 'home',
            url: notification.url || window.location.href,
            migrated: true,
            originalFormat: 'text_property'
          };
        } else {
          // Unknown format, create basic notification
          migratedNotification = {
            id: Date.now() + index,
            type: 'info',
            title: 'הודעה',
            message: JSON.stringify(notification),
            timestamp: Date.now(),
            time: new Date(),
            page: window.location.pathname.replace('.html', '').replace('/', '') || 'home',
            url: window.location.href,
            migrated: true,
            originalFormat: 'unknown'
          };
        }
        
        return migratedNotification;
        
      } catch (error) {
        console.error(`❌ Error migrating notification at index ${index}:`, error);
        return {
          id: Date.now() + index,
          type: 'error',
          title: 'שגיאת מיגרציה',
          message: `Failed to migrate notification: ${error.message}`,
          timestamp: Date.now(),
          time: new Date(),
          page: 'migration',
          url: window.location.href,
          migrated: true,
          originalFormat: 'error'
        };
      }
    });
    
    console.log(`✅ Successfully migrated ${migratedNotifications.length} notifications`);
    return migratedNotifications;
    
  } catch (error) {
    console.error('❌ Error in migrateNotifications:', error);
    return [];
  }
}

/**
 * Check if migration is needed
 * בדיקה אם נדרשת מיגרציה
 * 
 * @param {Object} options - Migration check options
 * @returns {Object} Migration status and recommendations
 */
function isMigrationNeeded(options = {}) {
  try {
    console.log('🔍 Checking if notification migration is needed...');
    
    const migrationStatus = {
      needed: false,
      reasons: [],
      recommendations: [],
      oldFormatCount: 0,
      newFormatCount: 0,
      totalCount: 0
    };
    
    // Check localStorage for old format notifications
    const oldFormatKeys = [
      'tiktrack_notifications',
      'notifications_history',
      'alert_history',
      'notification_log',
      'system_notifications'
    ];
    
    let oldNotifications = [];
    let newNotifications = [];
    
    // Check for old format notifications
    oldFormatKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed)) {
            oldNotifications = oldNotifications.concat(parsed);
            migrationStatus.reasons.push(`Found old format notifications in ${key}`);
          }
        }
      } catch (error) {
        // Ignore parsing errors
      }
    });
    
    // Check for new format notifications
    try {
      const newData = localStorage.getItem('tiktrack_global_notifications_history');
      if (newData) {
        newNotifications = JSON.parse(newData);
      }
    } catch (error) {
      // Ignore parsing errors
    }
    
    migrationStatus.oldFormatCount = oldNotifications.length;
    migrationStatus.newFormatCount = newNotifications.length;
    migrationStatus.totalCount = oldNotifications.length + newNotifications.length;
    
    // Determine if migration is needed
    if (oldNotifications.length > 0) {
      migrationStatus.needed = true;
      migrationStatus.reasons.push(`${oldNotifications.length} notifications in old format found`);
    }
    
    // Check for mixed formats
    if (oldNotifications.length > 0 && newNotifications.length > 0) {
      migrationStatus.reasons.push('Mixed old and new format notifications detected');
    }
    
    // Generate recommendations
    if (migrationStatus.needed) {
      migrationStatus.recommendations.push('Run migrateNotifications() to convert old format notifications');
      migrationStatus.recommendations.push('Consider clearing old format data after successful migration');
    }
    
    if (migrationStatus.totalCount > 1000) {
      migrationStatus.recommendations.push('Consider implementing notification cleanup to prevent storage bloat');
    }
    
    if (migrationStatus.newFormatCount === 0 && migrationStatus.oldFormatCount > 0) {
      migrationStatus.recommendations.push('No new format notifications found - migration highly recommended');
    }
    
    console.log(`✅ Migration check completed: ${migrationStatus.needed ? 'NEEDED' : 'NOT NEEDED'}`);
    console.log(`📊 Old format: ${migrationStatus.oldFormatCount}, New format: ${migrationStatus.newFormatCount}`);
    
    return migrationStatus;
    
  } catch (error) {
    console.error('❌ Error checking migration status:', error);
    return {
      needed: false,
      reasons: [`Error checking migration: ${error.message}`],
      recommendations: ['Check console for detailed error information'],
      oldFormatCount: 0,
      newFormatCount: 0,
      totalCount: 0
    };
  }
}

// ===== EXPORT TO GLOBAL SCOPE =====

window.notificationMigrationSystem = {
  migrateNotificationCalls,
  rollbackNotificationCalls,
  testNotificationMigration,
  collectNotificationStats,
  generateMigrationReport,
  migrateNotifications,
  isMigrationNeeded
};

// Export individual functions
window.migrateNotifications = migrateNotifications;
window.isMigrationNeeded = isMigrationNeeded;

console.log('🔄 Notification Migration System loaded successfully');
