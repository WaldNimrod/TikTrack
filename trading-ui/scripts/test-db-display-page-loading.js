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

(function() {
  'use strict';

  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('🔍 בדיקת טעינת עמוד בסיס נתונים (Database Display Page)');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n');

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
      console.log(`${status} ${name}: ${message}`);
    } else {
      if (optional) {
        results.warnings++;
        console.warn(`${status} ${name}: ${message}`);
      } else {
        results.failed++;
        console.error(`${status} ${name}: ${message}`);
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
      console.log(`${status} ${name}(): ${message}`);
    } else {
      if (optional) {
        results.warnings++;
        console.warn(`${status} ${name}(): ${message}`);
      } else {
        results.failed++;
        console.error(`${status} ${name}(): ${message}`);
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
      console.log(`${status} ${fullName}: ${message}`);
    } else {
      if (optional) {
        results.warnings++;
        console.warn(`${status} ${fullName}: ${message}`);
      } else {
        results.failed++;
        console.error(`${status} ${fullName}: ${message}`);
      }
    }
    
    return exists;
  }

  // ============================================================================
  // 1. בדיקת PAGE_CONFIGS
  // ============================================================================
  console.log('📋 שלב 1: בדיקת הגדרות עמוד (PAGE_CONFIGS)');
  console.log('───────────────────────────────────────────────────────────────');
  
  const hasPageConfigs = checkGlobal('PAGE_CONFIGS') || checkGlobal('PAGE_INITIALIZATION_CONFIGS');
  const pageConfig = window.PAGE_CONFIGS?.db_display || window.PAGE_INITIALIZATION_CONFIGS?.db_display;
  
  if (pageConfig) {
    console.log(`✅ קונפיגורציית עמוד נטענה: ${pageConfig.name || 'Database Display'}`);
    console.log(`   חבילות מוגדרות: ${pageConfig.packages?.length || 0}`);
    if (pageConfig.packages) {
      console.log(`   רשימת חבילות: ${pageConfig.packages.join(', ')}`);
    }
    console.log(`   גלובלים נדרשים: ${pageConfig.requiredGlobals?.length || 0}`);
  } else {
    console.error('❌ קונפיגורציית עמוד לא נמצאה!');
  }
  
  console.log('\n');

  // ============================================================================
  // 2. בדיקת חבילת BASE (חובה)
  // ============================================================================
  console.log('📦 שלב 2: בדיקת חבילת BASE (חובה)');
  console.log('───────────────────────────────────────────────────────────────');
  
  checkGlobal('NotificationSystem');
  checkObjectProperty('window', 'Logger', true);
  checkObjectProperty('window', 'CacheSyncManager', true);
  checkObjectProperty('window', 'IconSystem', true);
  
  console.log('\n');

  // ============================================================================
  // 3. בדיקת חבילת SERVICES (קריטי לעמוד זה!)
  // ============================================================================
  console.log('🔧 שלב 3: בדיקת חבילת SERVICES (קריטי!)');
  console.log('───────────────────────────────────────────────────────────────');
  console.log('⚠️  זהו הבדיקה החשובה ביותר - חבילת services נדרשת לטעינת נתונים וטבלאות');
  console.log('');
  
  // בדיקת window.loadTableData - הפונקציה המרכזית לטבלאות
  checkFunction('loadTableData', false); // ⭐ הקריטי ביותר
  
  checkObjectProperty('window', 'SelectPopulatorService', true);
  checkGlobal('DataUtils', true);
  
  // בדיקת data-basic.js
  if (typeof window.loadTableData === 'function') {
    console.log('   ✅ window.loadTableData() זמין לטעינת טבלאות');
  } else {
    console.error('   ❌ window.loadTableData() חסר! - לא ניתן לטעון טבלאות');
    results.failed++;
  }
  
  console.log('\n');

  // ============================================================================
  // 4. בדיקת חבילת UI-ADVANCED (קריטי לעמוד זה!)
  // ============================================================================
  console.log('🎨 שלב 4: בדיקת חבילת UI-ADVANCED (קריטי!)');
  console.log('───────────────────────────────────────────────────────────────');
  console.log('⚠️  חבילת ui-advanced נדרשת לרינדור וניהול טבלאות');
  console.log('');
  
  // בדיקת מערכת טבלאות
  checkFunction('setupSortableHeaders', false); // ⭐ קריטי למיון טבלאות
  checkObjectProperty('window', 'UnifiedTableSystem', true);
  
  // בדיקת table-mappings
  checkObjectProperty('window', 'TableMappings', true);
  
  // בדיקת pagination
  checkFunction('setupPagination', true);
  
  if (typeof window.setupSortableHeaders === 'function') {
    console.log('   ✅ window.setupSortableHeaders() זמין למיון טבלאות');
  } else {
    console.error('   ❌ window.setupSortableHeaders() חסר! - לא ניתן למיין טבלאות');
    results.failed++;
  }
  
  console.log('\n');

  // ============================================================================
  // 5. בדיקת חבילת CRUD
  // ============================================================================
  console.log('📊 שלב 5: בדיקת חבילת CRUD');
  console.log('───────────────────────────────────────────────────────────────');
  
  checkFunction('formatDate', true);
  checkGlobal('DataUtils', true);
  
  console.log('\n');

  // ============================================================================
  // 6. בדיקת חבילת PREFERENCES
  // ============================================================================
  console.log('⚙️  שלב 6: בדיקת חבילת PREFERENCES');
  console.log('───────────────────────────────────────────────────────────────');
  
  checkFunction('loadUserPreferences', true);
  
  console.log('\n');

  // ============================================================================
  // 7. בדיקת פונקציות ספציפיות לעמוד
  // ============================================================================
  console.log('🗄️  שלב 7: בדיקת פונקציות ספציפיות לעמוד');
  console.log('───────────────────────────────────────────────────────────────');
  
  checkFunction('loadDatabaseInfo', true);
  checkFunction('initSystemCheck', true);
  
  console.log('\n');

  // ============================================================================
  // 8. בדיקת תקינות טבלאות בדף
  // ============================================================================
  console.log('📋 שלב 8: בדיקת תקינות טבלאות בדף');
  console.log('───────────────────────────────────────────────────────────────');
  
  const tables = document.querySelectorAll('table');
  console.log(`   נמצאו ${tables.length} טבלאות בדף`);
  
  if (tables.length > 0) {
    tables.forEach((table, index) => {
      const tableId = table.id || `table-${index}`;
      const hasDataSection = table.closest('[data-section]');
      console.log(`   ${hasDataSection ? '✅' : '⚠️'} טבלה: ${tableId} ${hasDataSection ? '(בסקשן)' : '(ללא סקשן)'}`);
    });
  } else {
    console.warn('   ⚠️  לא נמצאו טבלאות בדף - ייתכן שהן נטענות דינמית');
  }
  
  console.log('\n');

  // ============================================================================
  // סיכום תוצאות
  // ============================================================================
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('📊 סיכום תוצאות');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`✅ הצלחות: ${results.passed}`);
  console.log(`❌ כשלונות: ${results.failed}`);
  console.log(`⚠️  אזהרות: ${results.warnings}`);
  console.log(`📋 סך הכל בדיקות: ${results.checks.length}`);
  console.log('\n');

  // הערכת מצב כללי
  const successRate = ((results.passed / results.checks.length) * 100).toFixed(1);
  console.log(`📈 אחוז הצלחה: ${successRate}%`);
  console.log('\n');

  if (results.failed === 0) {
    console.log('🎉 מצוין! כל הבדיקות עברו בהצלחה!');
    console.log('   העמוד מוכן לשימוש מלא.');
  } else {
    console.error('⚠️  נמצאו בעיות שצריך לטפל בהן:');
    results.checks
      .filter(check => check.status === '❌')
      .forEach(check => {
        console.error(`   ❌ ${check.name}: ${check.message}`);
      });
  }

  // בדיקת services ו-ui-advanced packages ספציפית
  const servicesLoaded = typeof window.loadTableData === 'function' || typeof loadTableData === 'function';
  const uiAdvancedLoaded = typeof window.setupSortableHeaders === 'function' || typeof setupSortableHeaders === 'function';
  
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');
  if (servicesLoaded && uiAdvancedLoaded) {
    console.log('✅ חבילות SERVICES ו-UI-ADVANCED נטענו בהצלחה!');
    console.log('   ניתן לטעון ולנהל טבלאות בעמוד.');
  } else {
    console.error('❌ בעיות בטעינת חבילות קריטיות:');
    if (!servicesLoaded) {
      console.error('   ❌ חבילת SERVICES לא נטענה כראוי!');
      console.error('      ⚠️  window.loadTableData חסר - לא ניתן לטעון טבלאות');
    }
    if (!uiAdvancedLoaded) {
      console.error('   ❌ חבילת UI-ADVANCED לא נטענה כראוי!');
      console.error('      ⚠️  window.setupSortableHeaders חסר - לא ניתן למיין טבלאות');
    }
    console.error('   בדוק את db_display.html וודא שכל הסקריפטים של services ו-ui-advanced packages נטענים.');
  }
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n');

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

