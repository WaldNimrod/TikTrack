/**
 * בדיקת טעינת עמוד ביצועים (Executions Page)
 * ============================================
 * 
 * סקריפט בדיקה מקיף לבדיקת תקינות טעינת כל החבילות והגלובלים הנדרשים
 * 
 * שימוש:
 * 1. פתח את executions.html בדפדפן
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
  console.log('🔍 בדיקת טעינת עמוד ביצועים (Executions Page)');
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
  const pageConfig = window.PAGE_CONFIGS?.executions || window.PAGE_INITIALIZATION_CONFIGS?.executions;
  
  if (pageConfig) {
    console.log(`✅ קונפיגורציית עמוד נטענה: ${pageConfig.name || 'Executions'}`);
    console.log(`   חבילות מוגדרות: ${pageConfig.packages?.length || 0}`);
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
  // 3. בדיקת חבילת CONDITIONS (קריטי לעמוד זה!)
  // ============================================================================
  console.log('🎯 שלב 3: בדיקת חבילת CONDITIONS (קריטי!)');
  console.log('───────────────────────────────────────────────────────────────');
  console.log('⚠️  זהו הבדיקה החשובה ביותר - חבילת conditions נדרשת ליצירת trades עם תנאים');
  console.log('');
  
  checkObjectProperty('window', 'conditionsTranslations', false);
  checkObjectProperty('window', 'conditionsValidator', false);
  checkObjectProperty('window', 'conditionsFormGenerator', false);
  checkObjectProperty('window', 'conditionsCRUDManager', false);
  checkObjectProperty('window', 'conditionsInitializer', false); // ⭐ הקריטי ביותר
  checkObjectProperty('window', 'conditionsModalConfig', false);
  checkObjectProperty('window', 'ConditionsUIManager', false);
  checkObjectProperty('window', 'ConditionsModalController', false);
  
  // בדיקת אתחול
  if (window.conditionsInitializer) {
    console.log('   ℹ️  window.conditionsInitializer זמין');
    if (typeof window.conditionsInitializer.initialize === 'function') {
      console.log('   ✅ window.conditionsInitializer.initialize() זמין');
    } else {
      console.error('   ❌ window.conditionsInitializer.initialize() חסר!');
      results.failed++;
    }
  }
  
  console.log('\n');

  // ============================================================================
  // 4. בדיקת חבילת SERVICES
  // ============================================================================
  console.log('🔧 שלב 4: בדיקת חבילת SERVICES');
  console.log('───────────────────────────────────────────────────────────────');
  
  checkObjectProperty('window', 'SelectPopulatorService', true);
  checkObjectProperty('window', 'RichTextEditorService', true);
  checkObjectProperty('window', 'Quill', true);
  checkObjectProperty('window', 'DOMPurify', true);
  checkFunction('loadExecutionsData', true);
  
  console.log('\n');

  // ============================================================================
  // 5. בדיקת חבילת UI-ADVANCED
  // ============================================================================
  console.log('🎨 שלב 5: בדיקת חבילת UI-ADVANCED');
  console.log('───────────────────────────────────────────────────────────────');
  
  checkFunction('setupSortableHeaders', true);
  checkGlobal('DataUtils', true);
  
  console.log('\n');

  // ============================================================================
  // 6. בדיקת חבילת MODULES
  // ============================================================================
  console.log('📚 שלב 6: בדיקת חבילת MODULES');
  console.log('───────────────────────────────────────────────────────────────');
  
  checkFunction('loadUserPreferences', true);
  
  console.log('\n');

  // ============================================================================
  // 7. בדיקת חבילת ENTITY-SERVICES
  // ============================================================================
  console.log('🏢 שלב 7: בדיקת חבילת ENTITY-SERVICES');
  console.log('───────────────────────────────────────────────────────────────');
  
  checkObjectProperty('window', 'tickerService', true);
  
  console.log('\n');

  // ============================================================================
  // 8. בדיקת PENDING EXECUTION TRADE CREATION
  // ============================================================================
  console.log('💰 שלב 8: בדיקת Pending Execution Trade Creation');
  console.log('───────────────────────────────────────────────────────────────');
  
  checkObjectProperty('window', 'PendingExecutionTradeCreation', true);
  checkObjectProperty('window', 'executionsModalConfig', true);
  
  console.log('\n');

  // ============================================================================
  // 9. בדיקת חבילת VALIDATION
  // ============================================================================
  console.log('✓ שלב 9: בדיקת חבילת VALIDATION');
  console.log('───────────────────────────────────────────────────────────────');
  
  checkFunction('validateSelectField', true);
  
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

  // בדיקת conditions package ספציפית
  const conditionsLoaded = window.conditionsInitializer !== undefined;
  console.log('\n');
  console.log('═══════════════════════════════════════════════════════════════');
  if (conditionsLoaded) {
    console.log('✅ חבילת CONDITIONS נטענה בהצלחה!');
    console.log('   ניתן ליצור trades עם תנאים מעמוד ביצועים.');
  } else {
    console.error('❌ חבילת CONDITIONS לא נטענה!');
    console.error('   ⚠️  זהו באג קריטי - לא ניתן ליצור trades עם תנאים.');
    console.error('   בדוק את executions.html וודא שכל הסקריפטים של conditions package נטענים.');
  }
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\n');

  // החזרת תוצאות לשימוש נוסף
  return {
    success: results.failed === 0,
    results,
    conditionsLoaded,
    summary: {
      passed: results.passed,
      failed: results.failed,
      warnings: results.warnings,
      total: results.checks.length,
      successRate: `${successRate}%`
    }
  };
})();

