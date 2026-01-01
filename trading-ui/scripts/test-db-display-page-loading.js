/**
 * בדיקת טעינת עמוד בסיס נתונים (Database Display Page)
 * =====================================================
 * 
 * סקריפט בדיקה מקיף לבדיקת תקינות טעינת כל החבילות והגלובלים הנדרשים
 * 
 * שימוש:
 * 1. פתח את db_display.html בדפדפן
 * 2. פתח את הקונסולה (F12)
 * 3. העתק והדבק את התוכן של קובץ זה לקונסולה
 * 4. לחץ Enter
 * 
 * התוצאות יוצגו בקונסולה עם סימון ✅ או ❌ לכל בדיקה
 */


// ===== FUNCTION INDEX =====

// === Event Handlers ===
// - checkFunction() - Checkfunction

// === Utility Functions ===
// - checkGlobal() - Checkglobal
// - checkObjectProperty() - Checkobjectproperty

(function() {
  'use strict';

  window.Logger?.info('\n');
  window.Logger?.info('═══════════════════════════════════════════════════════════════');
  window.Logger?.info('🔍 בדיקת טעינת עמוד בסיס נתונים (Database Display Page)');
  window.Logger?.info('═══════════════════════════════════════════════════════════════');
  window.Logger?.info('\n');

  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    checks: []
  };

  /**
   * בדיקת קיום גלובל
   */
  function checkGlobal(name, optional = false) {
    const exists = typeof window[name] !== 'undefined';
    const status = exists ? '✅' : (optional ? '⚠️' : '❌');
    const message = exists 
      ? `קיים` 
      : (optional ? `חסר (אופציונלי)` : `חסר (נדרש!)`);
    
    results.checks.push({
      category: 'Globals',
      name,
      status,
      message,
      optional
    });

    if (exists) {
      results.passed++;
      window.Logger?.info(`${status} ${name}: ${message}`);
    } else {
      if (optional) {
        results.warnings++;
        window.Logger?.warn(`${status} ${name}: ${message}`);
      } else {
        results.failed++;
        window.Logger?.error(`${status} ${name}: ${message}`);
      }
    }
    
    return exists;
  }

  /**
   * בדיקת קיום פונקציה
   */
  function checkFunction(name, optional = false) {
    const exists = typeof window[name] === 'function';
    const status = exists ? '✅' : (optional ? '⚠️' : '❌');
    const message = exists 
      ? `קיים` 
      : (optional ? `חסר (אופציונלי)` : `חסר (נדרש!)`);
    
    results.checks.push({
      category: 'Functions',
      name,
      status,
      message,
      optional
    });

    if (exists) {
      results.passed++;
      window.Logger?.info(`${status} ${name}(): ${message}`);
    } else {
      if (optional) {
        results.warnings++;
        window.Logger?.warn(`${status} ${name}(): ${message}`);
      } else {
        results.failed++;
        window.Logger?.error(`${status} ${name}(): ${message}`);
      }
    }
    
    return exists;
  }

  /**
   * בדיקת קיום אובייקט עם מפתח ספציפי
   */
  function checkObjectProperty(objectName, propertyName, optional = false) {
    const obj = window[objectName];
    const exists = obj && typeof obj[propertyName] !== 'undefined';
    const status = exists ? '✅' : (optional ? '⚠️' : '❌');
    const fullName = `${objectName}.${propertyName}`;
    const message = exists 
      ? `קיים` 
      : (optional ? `חסר (אופציונלי)` : `חסר (נדרש!)`);
    
    results.checks.push({
      category: 'Object Properties',
      name: fullName,
      status,
      message,
      optional
    });

    if (exists) {
      results.passed++;
      window.Logger?.info(`${status} ${fullName}: ${message}`);
    } else {
      if (optional) {
        results.warnings++;
        window.Logger?.warn(`${status} ${fullName}: ${message}`);
      } else {
        results.failed++;
        window.Logger?.error(`${status} ${fullName}: ${message}`);
      }
    }
    
    return exists;
  }

  // ============================================================================
  // 1. בדיקת PAGE_CONFIGS
  // ============================================================================
  window.Logger?.info('📋 שלב 1: בדיקת הגדרות עמוד (PAGE_CONFIGS)');
  window.Logger?.info('───────────────────────────────────────────────────────────────');
  
  const hasPageConfigs = checkGlobal('PAGE_CONFIGS') || checkGlobal('PAGE_INITIALIZATION_CONFIGS');
  const pageConfig = window.PAGE_CONFIGS?.db_display || window.PAGE_INITIALIZATION_CONFIGS?.db_display;
  
  if (pageConfig) {
    window.Logger?.info(`✅ קונפיגורציית עמוד נטענה: ${pageConfig.name || 'Database Display'}`);
    window.Logger?.info(`   חבילות מוגדרות: ${pageConfig.packages?.length || 0}`);
    if (pageConfig.packages) {
      window.Logger?.info(`   רשימת חבילות: ${pageConfig.packages.join(', ')}`);
    }
    window.Logger?.info(`   גלובלים נדרשים: ${pageConfig.requiredGlobals?.length || 0}`);
  } else {
    window.Logger?.error('❌ קונפיגורציית עמוד לא נמצאה!');
  }
  
  window.Logger?.info('\n');

  // ============================================================================
  // 2. בדיקת חבילת BASE (חובה)
  // ============================================================================
  window.Logger?.info('📦 שלב 2: בדיקת חבילת BASE (חובה)');
  window.Logger?.info('───────────────────────────────────────────────────────────────');
  
  checkGlobal('NotificationSystem');
  checkObjectProperty('window', 'Logger', true);
  checkObjectProperty('window', 'CacheSyncManager', true);
  checkObjectProperty('window', 'IconSystem', true);
  
  window.Logger?.info('\n');

  // ============================================================================
  // 3. בדיקת חבילת SERVICES (קריטי לעמוד זה!)
  // ============================================================================
  window.Logger?.info('🔧 שלב 3: בדיקת חבילת SERVICES (קריטי!)');
  window.Logger?.info('───────────────────────────────────────────────────────────────');
  window.Logger?.info('⚠️  זהו הבדיקה החשובה ביותר - חבילת services נדרשת לטעינת נתונים וטבלאות');
  window.Logger?.info('');
  
  // בדיקת window.loadTableData - הפונקציה המרכזית לטבלאות
  checkFunction('loadTableData', false); // ⭐ הקריטי ביותר
  
  checkObjectProperty('window', 'SelectPopulatorService', true);
  checkGlobal('DataUtils', true);
  
  // בדיקת data-basic.js
  if (typeof window.loadTableData === 'function') {
    window.Logger?.info('   ✅ window.loadTableData() זמין לטעינת טבלאות');
  } else {
    window.Logger?.error('   ❌ window.loadTableData() חסר! - לא ניתן לטעון טבלאות');
    results.failed++;
  }
  
  window.Logger?.info('\n');

  // ============================================================================
  // 4. בדיקת חבילת UI-ADVANCED (קריטי לעמוד זה!)
  // ============================================================================
  window.Logger?.info('🎨 שלב 4: בדיקת חבילת UI-ADVANCED (קריטי!)');
  window.Logger?.info('───────────────────────────────────────────────────────────────');
  window.Logger?.info('⚠️  חבילת ui-advanced נדרשת לרינדור וניהול טבלאות');
  window.Logger?.info('');
  
  // בדיקת מערכת טבלאות
  checkFunction('setupSortableHeaders', false); // ⭐ קריטי למיון טבלאות
  checkObjectProperty('window', 'UnifiedTableSystem', true);
  
  // בדיקת table-mappings
  checkObjectProperty('window', 'TableMappings', true);
  
  // בדיקת pagination
  checkFunction('setupPagination', true);
  
  if (typeof window.setupSortableHeaders === 'function') {
    window.Logger?.info('   ✅ window.setupSortableHeaders() זמין למיון טבלאות');
  } else {
    window.Logger?.error('   ❌ window.setupSortableHeaders() חסר! - לא ניתן למיין טבלאות');
    results.failed++;
  }
  
  window.Logger?.info('\n');

  // ============================================================================
  // 5. בדיקת חבילת CRUD
  // ============================================================================
  window.Logger?.info('📊 שלב 5: בדיקת חבילת CRUD');
  window.Logger?.info('───────────────────────────────────────────────────────────────');
  
  checkFunction('formatDate', true);
  checkGlobal('DataUtils', true);
  
  window.Logger?.info('\n');

  // ============================================================================
  // 6. בדיקת חבילת PREFERENCES
  // ============================================================================
  window.Logger?.info('⚙️  שלב 6: בדיקת חבילת PREFERENCES');
  window.Logger?.info('───────────────────────────────────────────────────────────────');
  
  checkFunction('loadUserPreferences', true);
  
  window.Logger?.info('\n');

  // ============================================================================
  // 7. בדיקת פונקציות ספציפיות לעמוד
  // ============================================================================
  window.Logger?.info('🗄️  שלב 7: בדיקת פונקציות ספציפיות לעמוד');
  window.Logger?.info('───────────────────────────────────────────────────────────────');
  
  checkFunction('loadDatabaseInfo', true);
  checkFunction('initSystemCheck', true);
  
  window.Logger?.info('\n');

  // ============================================================================
  // 8. בדיקת תקינות טבלאות בדף
  // ============================================================================
  window.Logger?.info('📋 שלב 8: בדיקת תקינות טבלאות בדף');
  window.Logger?.info('───────────────────────────────────────────────────────────────');
  
  const tables = document.querySelectorAll('table');
  window.Logger?.info(`   נמצאו ${tables.length} טבלאות בדף`);
  
  if (tables.length > 0) {
    tables.forEach((table, index) => {
      const tableId = table.id || `table-${index}`;
      const hasDataSection = table.closest('[data-section]');
      window.Logger?.info(`   ${hasDataSection ? '✅' : '⚠️'} טבלה: ${tableId} ${hasDataSection ? '(בסקשן)' : '(ללא סקשן)'}`);
    });
  } else {
    window.Logger?.warn('   ⚠️  לא נמצאו טבלאות בדף - ייתכן שהן נטענות דינמית');
  }
  
  window.Logger?.info('\n');

  // ============================================================================
  // סיכום תוצאות
  // ============================================================================
  window.Logger?.info('═══════════════════════════════════════════════════════════════');
  window.Logger?.info('📊 סיכום תוצאות');
  window.Logger?.info('═══════════════════════════════════════════════════════════════');
  window.Logger?.info(`✅ הצלחות: ${results.passed}`);
  window.Logger?.info(`❌ כשלונות: ${results.failed}`);
  window.Logger?.info(`⚠️  אזהרות: ${results.warnings}`);
  window.Logger?.info(`📋 סך הכל בדיקות: ${results.checks.length}`);
  window.Logger?.info('\n');

  // הערכת מצב כללי
  const successRate = ((results.passed / results.checks.length) * 100).toFixed(1);
  window.Logger?.info(`📈 אחוז הצלחה: ${successRate}%`);
  window.Logger?.info('\n');

  if (results.failed === 0) {
    window.Logger?.info('🎉 מצוין! כל הבדיקות עברו בהצלחה!');
    window.Logger?.info('   העמוד מוכן לשימוש מלא.');
  } else {
    window.Logger?.error('⚠️  נמצאו בעיות שצריך לטפל בהן:');
    results.checks
      .filter(check => check.status === '❌')
      .forEach(check => {
        window.Logger?.error(`   ❌ ${check.name}: ${check.message}`);
      });
  }

  // בדיקת services ו-ui-advanced packages ספציפית
  const servicesLoaded = typeof window.loadTableData === 'function' || typeof loadTableData === 'function';
  const uiAdvancedLoaded = typeof window.setupSortableHeaders === 'function' || typeof setupSortableHeaders === 'function';
  
  window.Logger?.info('\n');
  window.Logger?.info('═══════════════════════════════════════════════════════════════');
  if (servicesLoaded && uiAdvancedLoaded) {
    window.Logger?.info('✅ חבילות SERVICES ו-UI-ADVANCED נטענו בהצלחה!');
    window.Logger?.info('   ניתן לטעון ולנהל טבלאות בעמוד.');
  } else {
    window.Logger?.error('❌ בעיות בטעינת חבילות קריטיות:');
    if (!servicesLoaded) {
      window.Logger?.error('   ❌ חבילת SERVICES לא נטענה כראוי!');
      window.Logger?.error('      ⚠️  window.loadTableData חסר - לא ניתן לטעון טבלאות');
    }
    if (!uiAdvancedLoaded) {
      window.Logger?.error('   ❌ חבילת UI-ADVANCED לא נטענה כראוי!');
      window.Logger?.error('      ⚠️  window.setupSortableHeaders חסר - לא ניתן למיין טבלאות');
    }
    window.Logger?.error('   בדוק את db_display.html וודא שכל הסקריפטים של services ו-ui-advanced packages נטענים.');
  }
  window.Logger?.info('═══════════════════════════════════════════════════════════════');
  window.Logger?.info('\n');

  // החזרת תוצאות לשימוש נוסף
  return {
    success: results.failed === 0,
    results,
    servicesLoaded,
    uiAdvancedLoaded,
    summary: {
      passed: results.passed,
      failed: results.failed,
      warnings: results.warnings,
      total: results.checks.length,
      successRate: `${successRate}%`
    }
  };
})();

