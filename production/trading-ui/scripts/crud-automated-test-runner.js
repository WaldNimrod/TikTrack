/**
 * CRUD Automated Test Runner - TikTrack
 * ======================================
 * 
 * סקריפט להרצת בדיקות CRUD אוטומטיות על 8 העמודים המרכזיים
 * 
 * שימוש:
 * 1. פתח את הדפדפן בדף: http://localhost:8080/crud-testing-dashboard.html
 * 2. פתח את הקונסול (F12)
 * 3. העתק והדבק את הקוד הזה בקונסול
 * 4. לחץ Enter
 * 
 * או:
 * 1. פתח את הדפדפן בדף: http://localhost:8080/crud-testing-dashboard.html
 * 2. לחץ על כפתור "הרץ כל הבדיקות"
 * 
 * @version 1.0.0
 * @lastUpdated December 1, 2025
 */


// ===== FUNCTION INDEX =====

// === Core Functions ===
// - runCRUDAutomatedTests() - Runcrudautomatedtests

/**
 * הרצת בדיקות אוטומטיות על 8 העמודים המרכזיים
 * @returns {Promise<Object>} דוח תוצאות
 */
async function runCRUDAutomatedTests() {
  console.log('🚀 Starting CRUD Automated Tests for 8 Main Pages...');
  console.log('📋 Pages to test: trades, trade_plans, alerts, tickers, trading_accounts, executions, cash_flows, notes');
  
  // בדיקה שהמערכת זמינה
  if (!window.CRUDEnhancedTester) {
    console.error('❌ CRUDEnhancedTester not available. Make sure you are on crud-testing-dashboard.html');
    return null;
  }
  
  // יצירת instance
  if (!window.crudEnhancedTester) {
    window.crudEnhancedTester = new window.CRUDEnhancedTester();
  }
  
  // רשימת 8 העמודים המרכזיים
  const mainPages = [
    'trades',
    'trade_plans',
    'alerts',
    'tickers',
    'trading_accounts',
    'executions',
    'cash_flows',
    'notes'
  ];
  
  console.log(`\n📊 Testing ${mainPages.length} main pages...\n`);
  
  const results = [];
  const startTime = Date.now();
  
  // הרצת בדיקות על כל עמוד
  for (let i = 0; i < mainPages.length; i++) {
    const entityName = mainPages[i];
    const entity = window.crudEnhancedTester.entities[entityName];
    
    if (!entity) {
      console.error(`❌ Entity '${entityName}' not found in mapping`);
      results.push({
        entity: entityName,
        score: 0,
        issues: [`Entity '${entityName}' not found in mapping`],
        error: 'Entity not found'
      });
      continue;
    }
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 [${i + 1}/${mainPages.length}] Testing: ${entity.displayName} (${entityName})`);
    console.log(`${'='.repeat(60)}`);
    
    try {
      const result = await window.crudEnhancedTester.smartEntityTest(entityName);
      results.push(result);
      
      // הצגת תוצאה
      const status = result.score >= 80 ? '✅ PASSED' : '❌ FAILED';
      console.log(`\n${status} - Score: ${result.score}/100`);
      if (result.issues.length > 0) {
        console.log(`⚠️ Issues:`);
        result.issues.forEach(issue => console.log(`   - ${issue}`));
      }
      
    } catch (error) {
      console.error(`💥 Error testing ${entityName}:`, error);
      results.push({
        entity: entityName,
        displayName: entity.displayName,
        score: 0,
        issues: [`Test failed with error: ${error.message}`],
        error: error.message
      });
    }
    
    // הפסקה קטנה בין בדיקות
    if (i < mainPages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  const totalTime = Date.now() - startTime;
  
  // סיכום תוצאות
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 FINAL RESULTS SUMMARY');
  console.log(`${'='.repeat(60)}`);
  console.log(`⏱️ Total Time: ${Math.round(totalTime / 1000)} seconds`);
  console.log(`📋 Pages Tested: ${results.length}`);
  
  const passed = results.filter(r => r.score >= 80).length;
  const failed = results.filter(r => r.score < 80).length;
  
  console.log(`✅ Passed (≥80): ${passed}`);
  console.log(`❌ Failed (<80): ${failed}`);
  
  // חישוב ציון ממוצע
  const avgScore = results.reduce((sum, r) => sum + r.score, 0) / results.length;
  console.log(`📊 Average Score: ${Math.round(avgScore)}/100`);
  
  // עמודים שנכשלו
  if (failed > 0) {
    console.log(`\n❌ Failed Pages:`);
    results
      .filter(r => r.score < 80)
      .forEach(r => {
        console.log(`   - ${r.displayName || r.entity}: ${r.score}/100`);
        if (r.issues && r.issues.length > 0) {
          r.issues.forEach(issue => console.log(`     • ${issue}`));
        }
      });
  }
  
  // עמודים שעברו
  if (passed > 0) {
    console.log(`\n✅ Passed Pages:`);
    results
      .filter(r => r.score >= 80)
      .forEach(r => {
        console.log(`   - ${r.displayName || r.entity}: ${r.score}/100`);
      });
  }
  
  // יצירת דוח מפורט
  const report = {
    timestamp: new Date().toISOString(),
    totalTime: totalTime,
    summary: {
      total: results.length,
      passed: passed,
      failed: failed,
      averageScore: Math.round(avgScore),
      allPassed: failed === 0
    },
    results: results,
    failedPages: results.filter(r => r.score < 80).map(r => ({
      entity: r.entity,
      displayName: r.displayName,
      score: r.score,
      issues: r.issues || []
    }))
  };
  
  // שמירת דוח ב-localStorage
  try {
    localStorage.setItem('crud_automated_test_report', JSON.stringify(report));
    console.log(`\n💾 Report saved to localStorage: 'crud_automated_test_report'`);
  } catch (e) {
    console.warn('⚠️ Could not save report to localStorage:', e);
  }
  
  // הצגת הודעה
  if (window.showSuccessNotification) {
    if (failed === 0) {
      window.showSuccessNotification(
        '✅ כל הבדיקות עברו!',
        `כל ${passed} העמודים עברו בהצלחה (ציון ממוצע: ${Math.round(avgScore)}/100)`,
        5000
      );
    } else {
      window.showErrorNotification(
        '⚠️ חלק מהבדיקות נכשלו',
        `${failed} מתוך ${results.length} עמודים נכשלו. בדוק את הקונסול לפרטים.`,
        7000
      );
    }
  }
  
  return report;
}

// יצירת פונקציה גלובלית
if (typeof window !== 'undefined') {
  window.runCRUDAutomatedTests = runCRUDAutomatedTests;
}

// הודעת הוראות
console.log(`
╔══════════════════════════════════════════════════════════════╗
║  CRUD Automated Test Runner - Ready                         ║
╚══════════════════════════════════════════════════════════════╝

📋 To run tests, execute:
   await runCRUDAutomatedTests()

   or

   runCRUDAutomatedTests().then(report => {
     console.log('Report:', report);
   });

📊 The script will test all 8 main pages:
   1. trades
   2. trade_plans
   3. alerts
   4. tickers
   5. trading_accounts
   6. executions
   7. cash_flows
   8. notes

⏱️ Estimated time: ~2-3 minutes

💾 Results will be saved to localStorage as 'crud_automated_test_report'
`);


