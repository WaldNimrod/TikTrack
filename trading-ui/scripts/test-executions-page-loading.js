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
  window.Logger?.info('🔍 בדיקת טעינת עמוד ביצועים (Executions Page)');
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
  const pageConfig = window.PAGE_CONFIGS?.executions || window.PAGE_INITIALIZATION_CONFIGS?.executions;
  
  if (pageConfig) {
    window.Logger?.info(`✅ קונפיגורציית עמוד נטענה: ${pageConfig.name || 'Executions'}`);
    window.Logger?.info(`   חבילות מוגדרות: ${pageConfig.packages?.length || 0}`);
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
  // 3. בדיקת חבילת CONDITIONS (קריטי לעמוד זה!)
  // ============================================================================
  window.Logger?.info('🎯 שלב 3: בדיקת חבילת CONDITIONS (קריטי!)');
  window.Logger?.info('───────────────────────────────────────────────────────────────');
  window.Logger?.info('⚠️  זהו הבדיקה החשובה ביותר - חבילת conditions נדרשת ליצירת trades עם תנאים');
  window.Logger?.info('');
  
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
    window.Logger?.info('   ℹ️  window.conditionsInitializer זמין');
    if (typeof window.conditionsInitializer.initialize === 'function') {
      window.Logger?.info('   ✅ window.conditionsInitializer.initialize() זמין');
    } else {
      window.Logger?.error('   ❌ window.conditionsInitializer.initialize() חסר!');
      results.failed++;
    }
  }
  
  window.Logger?.info('\n');

  // ============================================================================
  // 4. בדיקת חבילת SERVICES
  // ============================================================================
  window.Logger?.info('🔧 שלב 4: בדיקת חבילת SERVICES');
  window.Logger?.info('───────────────────────────────────────────────────────────────');
  
  checkObjectProperty('window', 'SelectPopulatorService', true);
  checkObjectProperty('window', 'RichTextEditorService', true);
  checkObjectProperty('window', 'Quill', true);
  checkObjectProperty('window', 'DOMPurify', true);
  checkFunction('loadExecutionsData', true);
  
  window.Logger?.info('\n');

  // ============================================================================
  // 5. בדיקת חבילת UI-ADVANCED
  // ============================================================================
  window.Logger?.info('🎨 שלב 5: בדיקת חבילת UI-ADVANCED');
  window.Logger?.info('───────────────────────────────────────────────────────────────');
  
  checkFunction('setupSortableHeaders', true);
  checkGlobal('DataUtils', true);
  
  window.Logger?.info('\n');

  // ============================================================================
  // 6. בדיקת חבילת MODULES
  // ============================================================================
  window.Logger?.info('📚 שלב 6: בדיקת חבילת MODULES');
  window.Logger?.info('───────────────────────────────────────────────────────────────');
  
  checkFunction('loadUserPreferences', true);
  
  window.Logger?.info('\n');

  // ============================================================================
  // 7. בדיקת חבילת ENTITY-SERVICES
  // ============================================================================
  window.Logger?.info('🏢 שלב 7: בדיקת חבילת ENTITY-SERVICES');
  window.Logger?.info('───────────────────────────────────────────────────────────────');
  
  checkObjectProperty('window', 'tickerService', true);
  
  window.Logger?.info('\n');

  // ============================================================================
  // 8. בדיקת PENDING EXECUTION TRADE CREATION
  // ============================================================================
  window.Logger?.info('💰 שלב 8: בדיקת Pending Execution Trade Creation');
  window.Logger?.info('───────────────────────────────────────────────────────────────');
  
  checkObjectProperty('window', 'PendingExecutionTradeCreation', true);
  checkObjectProperty('window', 'executionsModalConfig', true);
  
  window.Logger?.info('\n');

  // ============================================================================
  // 9. בדיקת חבילת VALIDATION
  // ============================================================================
  window.Logger?.info('✓ שלב 9: בדיקת חבילת VALIDATION');
  window.Logger?.info('───────────────────────────────────────────────────────────────');
  
  checkFunction('validateSelectField', true);
  
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

  // בדיקת conditions package ספציפית
  const conditionsLoaded = window.conditionsInitializer !== undefined;
  window.Logger?.info('\n');
  window.Logger?.info('═══════════════════════════════════════════════════════════════');
  if (conditionsLoaded) {
    window.Logger?.info('✅ חבילת CONDITIONS נטענה בהצלחה!');
    window.Logger?.info('   ניתן ליצור trades עם תנאים מעמוד ביצועים.');
  } else {
    window.Logger?.error('❌ חבילת CONDITIONS לא נטענה!');
    window.Logger?.error('   ⚠️  זהו באג קריטי - לא ניתן ליצור trades עם תנאים.');
    window.Logger?.error('   בדוק את executions.html וודא שכל הסקריפטים של conditions package נטענים.');
  }
  window.Logger?.info('═══════════════════════════════════════════════════════════════');
  window.Logger?.info('\n');

  // ============================================================================
  // 10. בדיקת סקשנים 3+4 - ניטור מפורט
  // ============================================================================
  window.Logger?.info('🔍 שלב 10: ניטור מפורט של סקשנים 3+4');
  window.Logger?.info('───────────────────────────────────────────────────────────────');
  
  // בדיקת סקשן 3 (trade-creation)
  const tradeCreationSection = document.querySelector('[data-section="trade-creation"]') || document.getElementById('tradeCreationClustersSection');
  const tradeCreationHeader = tradeCreationSection?.querySelector('.section-header');
  const tradeCreationBody = tradeCreationSection?.querySelector('.section-body');
  const tradeCreationTable = document.getElementById('executionTradeCreationClustersTable');
  
  window.Logger?.info('\n📊 סקשן 3 (Trade Creation):');
  if (tradeCreationSection) {
    window.Logger?.info('   ✅ סקשן נמצא ב-DOM');
    const isVisible = tradeCreationSection.offsetParent !== null;
    const bodyDisplay = tradeCreationBody ? window.getComputedStyle(tradeCreationBody).display : 'unknown';
    const isCollapsed = bodyDisplay === 'none';
    window.Logger?.info(`   ${isVisible ? '✅' : '❌'} סקשן ${isVisible ? 'גלוי' : 'מוסתר'}`);
    window.Logger?.info(`   ${isCollapsed ? '📦' : '📂'} מצב: ${isCollapsed ? 'סגור' : 'פתוח'}`);
    
    if (tradeCreationHeader) {
      const headerVisible = tradeCreationHeader.offsetParent !== null;
      window.Logger?.info(`   ${headerVisible ? '✅' : '❌'} כותרת ${headerVisible ? 'גלויה' : 'מוסתרת'}`);
    } else {
      window.Logger?.error('   ❌ כותרת לא נמצאה!');
    }
    
    if (tradeCreationTable) {
      const tableRows = tradeCreationTable.querySelectorAll('tbody tr').length;
      window.Logger?.info(`   ${tableRows > 0 ? '✅' : '⚠️'} טבלה: ${tableRows} שורות`);
    } else {
      window.Logger?.warn('   ⚠️  טבלה לא נמצאה (ייתכן שעדיין לא נטענה)');
    }
  } else {
    window.Logger?.error('   ❌ סקשן לא נמצא ב-DOM!');
  }
  
  // בדיקת סקשן 4 (suggestions)
  const suggestionsSection = document.querySelector('[data-section="suggestions"]') || document.getElementById('suggestions');
  const suggestionsHeader = suggestionsSection?.querySelector('.section-header');
  const suggestionsBody = suggestionsSection?.querySelector('.section-body');
  const suggestionsTable = document.getElementById('tradeSuggestionsTable');
  
  window.Logger?.info('\n📊 סקשן 4 (Suggestions):');
  if (suggestionsSection) {
    window.Logger?.info('   ✅ סקשן נמצא ב-DOM');
    const isVisible = suggestionsSection.offsetParent !== null;
    const bodyDisplay = suggestionsBody ? window.getComputedStyle(suggestionsBody).display : 'unknown';
    const isCollapsed = bodyDisplay === 'none';
    window.Logger?.info(`   ${isVisible ? '✅' : '❌'} סקשן ${isVisible ? 'גלוי' : 'מוסתר'}`);
    window.Logger?.info(`   ${isCollapsed ? '📦' : '📂'} מצב: ${isCollapsed ? 'סגור' : 'פתוח'}`);
    
    if (suggestionsHeader) {
      const headerVisible = suggestionsHeader.offsetParent !== null;
      window.Logger?.info(`   ${headerVisible ? '✅' : '❌'} כותרת ${headerVisible ? 'גלויה' : 'מוסתרת'}`);
    } else {
      window.Logger?.error('   ❌ כותרת לא נמצאה!');
    }
    
    if (suggestionsTable) {
      const tableRows = suggestionsTable.querySelectorAll('tbody tr').length;
      window.Logger?.info(`   ${tableRows > 0 ? '✅' : '⚠️'} טבלה: ${tableRows} שורות`);
    } else {
      window.Logger?.warn('   ⚠️  טבלה לא נמצאה (ייתכן שעדיין לא נטענה)');
    }
  } else {
    window.Logger?.error('   ❌ סקשן לא נמצא ב-DOM!');
  }
  
  // בדיקת הטבלה השנייה (main)
  const mainSection = document.querySelector('[data-section="main"]') || document.getElementById('main');
  const mainTable = document.getElementById('executionsTable');
  const mainTableRows = mainTable?.querySelectorAll('tbody tr').length || 0;
  
  window.Logger?.info('\n📊 סקשן 2 (Main Table):');
  if (mainSection) {
    const mainBody = mainSection.querySelector('.section-body');
    const mainBodyDisplay = mainBody ? window.getComputedStyle(mainBody).display : 'unknown';
    const mainIsVisible = mainBodyDisplay !== 'none';
    window.Logger?.info(`   ${mainIsVisible ? '✅' : '❌'} סקשן ${mainIsVisible ? 'פתוח' : 'סגור'}`);
    window.Logger?.info(`   ${mainTableRows > 0 ? '✅' : '⚠️'} טבלה: ${mainTableRows} שורות`);
    
    if (mainTableRows > 0) {
      window.Logger?.info('   ✅ הטבלה השנייה מוצגת - ניתן להתחיל טעינת סקשנים 3+4');
    } else {
      window.Logger?.warn('   ⚠️  הטבלה השנייה עדיין לא מוצגת');
    }
  }
  
  // בדיקת זמינות נתונים
  window.Logger?.info('\n📊 זמינות נתונים:');
  const hasExecutionClusteringService = typeof window.ExecutionClusteringService !== 'undefined';
  const hasExecutionAssignmentService = typeof window.ExecutionAssignmentService !== 'undefined';
  window.Logger?.info(`   ${hasExecutionClusteringService ? '✅' : '❌'} ExecutionClusteringService: ${hasExecutionClusteringService ? 'זמין' : 'חסר'}`);
  window.Logger?.info(`   ${hasExecutionAssignmentService ? '✅' : '❌'} ExecutionAssignmentService: ${hasExecutionAssignmentService ? 'זמין' : 'חסר'}`);
  
  // בדיקת API calls
  window.Logger?.info('\n📊 ניטור API Calls:');
  if (window.performance && window.performance.getEntriesByType) {
    const apiCalls = window.performance.getEntriesByType('resource')
      .filter(entry => entry.name.includes('/api/executions'))
      .map(entry => ({
        url: entry.name,
        duration: entry.duration.toFixed(2),
        type: entry.initiatorType
      }));
    
    if (apiCalls.length > 0) {
      window.Logger?.info(`   ✅ נמצאו ${apiCalls.length} קריאות API:`);
      apiCalls.forEach(call => {
        window.Logger?.info(`      - ${call.url.substring(call.url.lastIndexOf('/'))} (${call.duration}ms)`);
      });
    } else {
      window.Logger?.warn('   ⚠️  לא נמצאו קריאות API (ייתכן שעדיין לא בוצעו)');
    }
  }
  
  window.Logger?.info('\n');

  // החזרת תוצאות לשימוש נוסף
  return {
    success: results.failed === 0,
    results,
    conditionsLoaded,
    sections: {
      tradeCreation: {
        exists: !!tradeCreationSection,
        visible: tradeCreationSection?.offsetParent !== null,
        collapsed: tradeCreationBody ? window.getComputedStyle(tradeCreationBody).display === 'none' : null,
        headerVisible: tradeCreationHeader?.offsetParent !== null,
        tableRows: tradeCreationTable?.querySelectorAll('tbody tr').length || 0
      },
      suggestions: {
        exists: !!suggestionsSection,
        visible: suggestionsSection?.offsetParent !== null,
        collapsed: suggestionsBody ? window.getComputedStyle(suggestionsBody).display === 'none' : null,
        headerVisible: suggestionsHeader?.offsetParent !== null,
        tableRows: suggestionsTable?.querySelectorAll('tbody tr').length || 0
      },
      main: {
        exists: !!mainSection,
        tableRows: mainTableRows,
        ready: mainTableRows > 0
      }
    },
    summary: {
      passed: results.passed,
      failed: results.failed,
      warnings: results.warnings,
      total: results.checks.length,
      successRate: `${successRate}%`
    }
  };
})();

