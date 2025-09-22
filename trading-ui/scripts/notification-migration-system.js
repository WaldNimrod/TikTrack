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

// ===== EXPORT TO GLOBAL SCOPE =====

window.notificationMigrationSystem = {
  migrateNotificationCalls,
  rollbackNotificationCalls,
  testNotificationMigration,
  collectNotificationStats,
  generateMigrationReport
};

console.log('🔄 Notification Migration System loaded successfully');
