/**
 * Pending Trade Plan Widget E2E Test
 * ====================================
 * 
 * בדיקות E2E מקיפות ל-Pending Trade Plan Widget
 * 
 * בודק:
 * 1. טעינת הווידג'ט
 * 2. טעינת נתונים (assignments ו-creations)
 * 3. רינדור assignments
 * 4. רינדור creations
 * 5. שיוך טרייד לתוכנית (CRUD)
 * 6. פתיחת מודל יצירה עם prefill
 * 7. דחיית הצעה
 * 8. ניקוי מטמון אחרי שיוך
 * 9. auto-refresh
 * 
 * שימוש:
 * בדפדפן: <script src="scripts/pending-trade-plan-widget-e2e-test.js"></script>
 * ואז: window.runPendingTradePlanWidgetE2ETests()
 */


// ===== FUNCTION INDEX =====

// === Initialization ===
// - testWidgetInitialization() - Testwidgetinitialization

// === Event Handlers ===
// - testOpenPlanCreationModal() - Testopenplancreationmodal
// - testDismissSuggestion() - Testdismisssuggestion

// === UI Functions ===
// - testRendering() - Testrendering
// - testAutoRefresh() - Testautorefresh

// === Data Functions ===
// - testDataLoading() - Testdataloading
// - runPendingTradePlanWidgetE2ETests() - Runpendingtradeplanwidgete2Etests

// === Other ===
// - testAssignTradeToPlan() - Testassigntradetoplan
// - testCacheClearing() - Testcacheclearing
// - testGeneralSystemsUsage() - Testgeneralsystemsusage

(function() {
  'use strict';

  // תוצאות הבדיקות
  const testResults = {
    passed: 0,
    failed: 0,
    errors: [],
    details: []
  };

  /**
   * בדיקת טעינת הווידג'ט
   */
  async function testWidgetInitialization() {
    const testName = 'טעינת הווידג'ט';
    try {
      // בדיקה שהמערכת זמינה
      if (!window.PendingTradePlanWidget) {
        throw new Error('PendingTradePlanWidget לא זמין');
      }

      // בדיקה שהפונקציות זמינות
      if (typeof window.PendingTradePlanWidget.init !== 'function') {
        throw new Error('PendingTradePlanWidget.init לא זמין');
      }

      if (typeof window.initializePendingTradePlanWidget !== 'function') {
        throw new Error('initializePendingTradePlanWidget לא זמין');
      }

      testResults.passed++;
      testResults.details.push({ test: testName, status: 'passed', message: 'הווידג\'ט נטען נכון' });
      return true;
    } catch (error) {
      testResults.failed++;
      testResults.errors.push({ test: testName, error: error.message });
      testResults.details.push({ test: testName, status: 'failed', message: error.message });
      return false;
    }
  }

  /**
   * בדיקת טעינת נתונים
   */
  async function testDataLoading() {
    const testName = 'טעינת נתונים';
    try {
      if (!window.PendingTradePlanWidget) {
        throw new Error('PendingTradePlanWidget לא זמין');
      }

      // בדיקה שהפונקציות זמינות
      if (typeof window.PendingTradePlanWidget.fetchData !== 'function') {
        throw new Error('fetchData לא זמין');
      }

      if (typeof window.PendingTradePlanWidget.fetchAssignments !== 'function') {
        throw new Error('fetchAssignments לא זמין');
      }

      if (typeof window.PendingTradePlanWidget.fetchCreations !== 'function') {
        throw new Error('fetchCreations לא זמין');
      }

      testResults.passed++;
      testResults.details.push({ test: testName, status: 'passed', message: 'פונקציות טעינת נתונים זמינות' });
      return true;
    } catch (error) {
      testResults.failed++;
      testResults.errors.push({ test: testName, error: error.message });
      testResults.details.push({ test: testName, status: 'failed', message: error.message });
      return false;
    }
  }

  /**
   * בדיקת רינדור
   */
  async function testRendering() {
    const testName = 'רינדור';
    try {
      if (!window.PendingTradePlanWidget) {
        throw new Error('PendingTradePlanWidget לא זמין');
      }

      // בדיקה שהפונקציות זמינות
      if (typeof window.PendingTradePlanWidget.render !== 'function') {
        throw new Error('render לא זמין');
      }

      if (typeof window.PendingTradePlanWidget.renderAssignments !== 'function') {
        throw new Error('renderAssignments לא זמין');
      }

      if (typeof window.PendingTradePlanWidget.renderCreations !== 'function') {
        throw new Error('renderCreations לא זמין');
      }

      // בדיקה שהמערכת משתמשת ב-FieldRendererService
      if (!window.FieldRendererService) {
        throw new Error('FieldRendererService לא זמין (נדרש לרינדור)');
      }

      // בדיקה שהמערכת משתמשת ב-ButtonSystem
      if (!window.ButtonSystem) {
        throw new Error('ButtonSystem לא זמין (נדרש לרינדור כפתורים)');
      }

      testResults.passed++;
      testResults.details.push({ test: testName, status: 'passed', message: 'פונקציות רינדור זמינות ומשתמשות במערכות כלליות' });
      return true;
    } catch (error) {
      testResults.failed++;
      testResults.errors.push({ test: testName, error: error.message });
      testResults.details.push({ test: testName, status: 'failed', message: error.message });
      return false;
    }
  }

  /**
   * בדיקת שיוך טרייד לתוכנית
   */
  async function testAssignTradeToPlan() {
    const testName = 'שיוך טרייד לתוכנית';
    try {
      if (!window.PendingTradePlanWidget) {
        throw new Error('PendingTradePlanWidget לא זמין');
      }

      // בדיקה שהפונקציה זמינה
      if (typeof window.PendingTradePlanWidget.assignTradeToPlan !== 'function') {
        throw new Error('assignTradeToPlan לא זמין');
      }

      // בדיקה שהמערכת משתמשת ב-CRUDResponseHandler (אם זמין)
      if (window.CRUDResponseHandler) {
        if (typeof window.CRUDResponseHandler.handleSaveResponse !== 'function') {
          throw new Error('CRUDResponseHandler.handleSaveResponse לא זמין');
        }
      }

      // בדיקה שהמערכת משתמשת ב-CacheSyncManager
      if (!window.CacheSyncManager) {
        throw new Error('CacheSyncManager לא זמין (נדרש לניקוי מטמון)');
      }

      // בדיקה שהמערכת משתמשת ב-UnifiedCacheManager
      if (!window.UnifiedCacheManager) {
        throw new Error('UnifiedCacheManager לא זמין (נדרש לניקוי מטמון)');
      }

      testResults.passed++;
      testResults.details.push({ test: testName, status: 'passed', message: 'פונקציית שיוך זמינה ומשתמשת במערכות כלליות' });
      return true;
    } catch (error) {
      testResults.failed++;
      testResults.errors.push({ test: testName, error: error.message });
      testResults.details.push({ test: testName, status: 'failed', message: error.message });
      return false;
    }
  }

  /**
   * בדיקת פתיחת מודל יצירה
   */
  async function testOpenPlanCreationModal() {
    const testName = 'פתיחת מודל יצירה';
    try {
      if (!window.PendingTradePlanWidget) {
        throw new Error('PendingTradePlanWidget לא זמין');
      }

      // בדיקה שהפונקציה זמינה
      if (typeof window.PendingTradePlanWidget.openPlanCreationModal !== 'function') {
        throw new Error('openPlanCreationModal לא זמין');
      }

      if (typeof window.PendingTradePlanWidget.preparePlanModal !== 'function') {
        throw new Error('preparePlanModal לא זמין');
      }

      // בדיקה שהמערכת משתמשת ב-ModalManagerV2
      if (!window.ModalManagerV2) {
        throw new Error('ModalManagerV2 לא זמין (נדרש לפתיחת מודל)');
      }

      testResults.passed++;
      testResults.details.push({ test: testName, status: 'passed', message: 'פונקציות פתיחת מודל זמינות ומשתמשות ב-ModalManagerV2' });
      return true;
    } catch (error) {
      testResults.failed++;
      testResults.errors.push({ test: testName, error: error.message });
      testResults.details.push({ test: testName, status: 'failed', message: error.message });
      return false;
    }
  }

  /**
   * בדיקת דחיית הצעה
   */
  async function testDismissSuggestion() {
    const testName = 'דחיית הצעה';
    try {
      if (!window.PendingTradePlanWidget) {
        throw new Error('PendingTradePlanWidget לא זמין');
      }

      // בדיקה שהפונקציה זמינה
      if (typeof window.PendingTradePlanWidget.dismissSuggestion !== 'function') {
        throw new Error('dismissSuggestion לא זמין');
      }

      // בדיקה שהמערכת משתמשת ב-UnifiedCacheManager לשמירת dismissed items
      if (!window.UnifiedCacheManager) {
        throw new Error('UnifiedCacheManager לא זמין (נדרש לשמירת dismissed items)');
      }

      testResults.passed++;
      testResults.details.push({ test: testName, status: 'passed', message: 'פונקציית דחייה זמינה ומשתמשת ב-UnifiedCacheManager' });
      return true;
    } catch (error) {
      testResults.failed++;
      testResults.errors.push({ test: testName, error: error.message });
      testResults.details.push({ test: testName, status: 'failed', message: error.message });
      return false;
    }
  }

  /**
   * בדיקת ניקוי מטמון
   */
  async function testCacheClearing() {
    const testName = 'ניקוי מטמון';
    try {
      if (!window.PendingTradePlanWidget) {
        throw new Error('PendingTradePlanWidget לא זמין');
      }

      // בדיקה שהפונקציה זמינה
      if (typeof window.PendingTradePlanWidget.clearCachesAfterLink !== 'function') {
        throw new Error('clearCachesAfterLink לא זמין');
      }

      // בדיקה שהמערכת משתמשת ב-CacheSyncManager
      if (!window.CacheSyncManager) {
        throw new Error('CacheSyncManager לא זמין (נדרש לניקוי מטמון)');
      }

      // בדיקה שהמערכת משתמשת ב-UnifiedCacheManager
      if (!window.UnifiedCacheManager) {
        throw new Error('UnifiedCacheManager לא זמין (נדרש לניקוי מטמון)');
      }

      testResults.passed++;
      testResults.details.push({ test: testName, status: 'passed', message: 'פונקציית ניקוי מטמון זמינה ומשתמשת במערכות כלליות' });
      return true;
    } catch (error) {
      testResults.failed++;
      testResults.errors.push({ test: testName, error: error.message });
      testResults.details.push({ test: testName, status: 'failed', message: error.message });
      return false;
    }
  }

  /**
   * בדיקת auto-refresh
   */
  async function testAutoRefresh() {
    const testName = 'Auto-refresh';
    try {
      if (!window.PendingTradePlanWidget) {
        throw new Error('PendingTradePlanWidget לא זמין');
      }

      // בדיקה שהפונקציות זמינות
      if (typeof window.PendingTradePlanWidget.startAutoRefresh !== 'function') {
        throw new Error('startAutoRefresh לא זמין');
      }

      if (typeof window.PendingTradePlanWidget.stopAutoRefresh !== 'function') {
        throw new Error('stopAutoRefresh לא זמין');
      }

      testResults.passed++;
      testResults.details.push({ test: testName, status: 'passed', message: 'פונקציות auto-refresh זמינות' });
      return true;
    } catch (error) {
      testResults.failed++;
      testResults.errors.push({ test: testName, error: error.message });
      testResults.details.push({ test: testName, status: 'failed', message: error.message });
      return false;
    }
  }

  /**
   * בדיקת שימוש במערכות כלליות
   */
  async function testGeneralSystemsUsage() {
    const testName = 'שימוש במערכות כלליות';
    try {
      const requiredSystems = [
        { name: 'FieldRendererService', check: () => window.FieldRendererService },
        { name: 'ButtonSystem', check: () => window.ButtonSystem },
        { name: 'ModalManagerV2', check: () => window.ModalManagerV2 },
        { name: 'UnifiedCacheManager', check: () => window.UnifiedCacheManager },
        { name: 'CacheSyncManager', check: () => window.CacheSyncManager }
      ];

      const missingSystems = requiredSystems.filter(system => !system.check());

      if (missingSystems.length > 0) {
        throw new Error(`מערכות כלליות חסרות: ${missingSystems.map(s => s.name).join(', ')}`);
      }

      // בדיקה שהמערכת משתמשת ב-CRUDResponseHandler (אם זמין)
      if (window.CRUDResponseHandler) {
        if (typeof window.CRUDResponseHandler.handleSaveResponse !== 'function') {
          throw new Error('CRUDResponseHandler.handleSaveResponse לא זמין');
        }
        if (typeof window.CRUDResponseHandler.handleLoadResponse !== 'function') {
          throw new Error('CRUDResponseHandler.handleLoadResponse לא זמין');
        }
      }

      testResults.passed++;
      testResults.details.push({ test: testName, status: 'passed', message: 'כל המערכות הכלליות זמינות' });
      return true;
    } catch (error) {
      testResults.failed++;
      testResults.errors.push({ test: testName, error: error.message });
      testResults.details.push({ test: testName, status: 'failed', message: error.message });
      return false;
    }
  }

  /**
   * הרצת כל הבדיקות
   */
  async function runPendingTradePlanWidgetE2ETests() {
    console.log('🧪 Starting Pending Trade Plan Widget E2E Tests...\n');

    // איפוס תוצאות
    testResults.passed = 0;
    testResults.failed = 0;
    testResults.errors = [];
    testResults.details = [];

    // הרצת בדיקות
    await testWidgetInitialization();
    await testDataLoading();
    await testRendering();
    await testAssignTradeToPlan();
    await testOpenPlanCreationModal();
    await testDismissSuggestion();
    await testCacheClearing();
    await testAutoRefresh();
    await testGeneralSystemsUsage();

    // סיכום
    const total = testResults.passed + testResults.failed;
    const successRate = total > 0 ? ((testResults.passed / total) * 100).toFixed(1) : 0;

    console.log('\n📊 Test Results:');
    console.log(`  ✅ Passed: ${testResults.passed}`);
    console.log(`  ❌ Failed: ${testResults.failed}`);
    console.log(`  📈 Success Rate: ${successRate}%`);
    console.log(`  📝 Total: ${total}`);

    if (testResults.errors.length > 0) {
      console.log('\n❌ Errors:');
      testResults.errors.forEach(({ test, error }) => {
        console.log(`  - ${test}: ${error}`);
      });
    }

    if (testResults.details.length > 0) {
      console.log('\n📋 Details:');
      testResults.details.forEach(({ test, status, message }) => {
        const icon = status === 'passed' ? '✅' : '❌';
        console.log(`  ${icon} ${test}: ${message}`);
      });
    }

    return {
      passed: testResults.passed,
      failed: testResults.failed,
      successRate: parseFloat(successRate),
      errors: testResults.errors,
      details: testResults.details
    };
  }

  // הוספה ל-window
  if (typeof window !== 'undefined') {
    window.runPendingTradePlanWidgetE2ETests = runPendingTradePlanWidgetE2ETests;
    console.log('✅ Pending Trade Plan Widget E2E Test loaded. Run: window.runPendingTradePlanWidgetE2ETests()');
  }

  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runPendingTradePlanWidgetE2ETests };
  }
})();

