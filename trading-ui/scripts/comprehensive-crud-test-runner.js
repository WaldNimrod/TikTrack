/**
 * Comprehensive CRUD Test Runner - TikTrack
 * ==========================================
 * 
 * סקריפט מקיף להרצת בדיקות CRUD על כל העמודים המרכזיים
 * כולל בדיקת סדר טעינה, בדיקות CRUD מלאות, ועדכון רשומות בפועל
 * 
 * שימוש:
 * 1. פתח את הדפדפן בדף: http://localhost:8080/crud_testing_dashboard.html
 * 2. פתח את הקונסול (F12)
 * 3. העתק והדבק את הקוד הזה בקונסול
 * 4. לחץ Enter
 * 
 * @version 1.0.0
 * @lastUpdated December 5, 2025
 */


// ===== FUNCTION INDEX =====

// === Core Functions ===
// - runComprehensiveTests() - Runcomprehensivetests

// === Data Functions ===
// - checkPageLoadingOrder() - Checkpageloadingorder

// === Other ===
// - testPageCRUD() - Testpagecrud

/**
 * רשימת העמודים המרכזיים לבדיקה (15 עמודים)
 * כולל כל עמודי המשתמש הראשיים לפי התוכנית המקורית
 */
const MAIN_PAGES = [
  // עמודי משתמש מרכזיים (15)
  'index',
  'trades',
  'trade_plans',
  'alerts',
  'tickers',
  'trading_accounts',
  'executions',
  'cash_flows',
  'notes',
  'research',
  'preferences',
  'ai-analysis',
  'user-profile',
  'watch-list',
  'ticker-dashboard'
];

/**
 * בדיקת סדר טעינה של עמוד
 */
async function checkPageLoadingOrder(pageName) {

  try {

    // נווט לעמוד
    window.location.href = `/${pageName}.html`;
    await new Promise(resolve => setTimeout(resolve, 2000)); // המתן לטעינה

    
    // בדוק את סדר הטעינה
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const modalManagerIndex = scripts.findIndex(s => s.src.includes('modal-manager-v2.js'));
    const modalConfigs = scripts.filter(s => s.src.includes('modal-configs/'));
    
    const issues = [];
    modalConfigs.forEach(config => {
      const configIndex = scripts.indexOf(config);
      if (configIndex > modalManagerIndex) {
        issues.push(`${config.src.split('/').pop()} loads AFTER modal-manager-v2.js`);
      }
    });
    
    return {
      page: pageName,
      loadingOrder: issues.length === 0 ? 'OK' : 'ISSUES',
      issues: issues
    };
  } catch (error) {
    return {
      page: pageName,
      loadingOrder: 'ERROR',
      error: error.message
    };
  }
}

/**
 * הרצת בדיקות CRUD על עמוד
 */
async function testPageCRUD(pageName) {

  try {
    // בדיקה שהמערכת זמינה
    if (!window.CRUDEnhancedTester) {

      return {
        page: pageName,
        crud: 'ERROR',
        error: 'CRUDEnhancedTester not available'
      };
    }
    
    // יצירת instance
    if (!window.crudEnhancedTester) {
      window.crudEnhancedTester = new window.CRUDEnhancedTester();
    }
    
    // הרצת בדיקה
    const result = await window.crudEnhancedTester.smartEntityTest(pageName);
    
    return {
      page: pageName,
      crud: result.score >= 80 ? 'PASSED' : 'FAILED',
      score: result.score,
      issues: result.issues,
      details: result
    };
  } catch (error) {
    return {
      page: pageName,
      crud: 'ERROR',
      error: error.message
    };
  }
}

/**
 * הרצת בדיקות מקיפות על כל העמודים
 */
async function runComprehensiveTests() {

  console.log('🚀 Starting Comprehensive CRUD Tests...');
  console.log(`📋 Testing ${MAIN_PAGES.length} main pages\n`);
  
  const results = {
    loadingOrder: [],
    crud: [],
    summary: {
      total: MAIN_PAGES.length,
      loadingOrderPassed: 0,
      loadingOrderFailed: 0,
      crudPassed: 0,
      crudFailed: 0,
      crudErrors: 0
    }
  };
  
  // בדיקת סדר טעינה
  console.log('🔍 Checking loading order...\n');
  for (const pageName of MAIN_PAGES) {
    console.log(`Checking ${pageName}...`);
    const result = await checkPageLoadingOrder(pageName);
    results.loadingOrder.push(result);
    
    if (result.loadingOrder === 'OK') {
      results.summary.loadingOrderPassed++;
      console.log(`✅ ${pageName}: Loading order OK`);
    } else {
      results.summary.loadingOrderFailed++;
      console.log(`❌ ${pageName}: Loading order issues`);
      if (result.issues) {
        result.issues.forEach(issue => console.log(`   - ${issue}`));
      }
    }
  }
  
  // חזרה לדשבורד לבדיקות CRUD
  console.log('\n🔄 Returning to CRUD testing dashboard...');
  window.location.href = '/crud_testing_dashboard.html';
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // בדיקות CRUD
  console.log('\n🧪 Running CRUD tests...\n');
  for (const pageName of MAIN_PAGES) {
    console.log(`Testing ${pageName}...`);
    const result = await testPageCRUD(pageName);
    results.crud.push(result);
    
    if (result.crud === 'PASSED') {
      results.summary.crudPassed++;
      console.log(`✅ ${pageName}: CRUD tests PASSED (${result.score}/100)`);
    } else if (result.crud === 'FAILED') {
      results.summary.crudFailed++;
      console.log(`❌ ${pageName}: CRUD tests FAILED (${result.score}/100)`);
      if (result.issues) {
        result.issues.forEach(issue => console.log(`   - ${issue}`));
      }
    } else {
      results.summary.crudErrors++;
      console.log(`💥 ${pageName}: CRUD tests ERROR - ${result.error}`);
    }
    
    // הפסקה קטנה בין בדיקות
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // סיכום
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL RESULTS SUMMARY');
  console.log('='.repeat(60));
  console.log(`\n📋 Loading Order:`);
  console.log(`   ✅ Passed: ${results.summary.loadingOrderPassed}/${results.summary.total}`);
  console.log(`   ❌ Failed: ${results.summary.loadingOrderFailed}/${results.summary.total}`);
  console.log(`\n🧪 CRUD Tests:`);
  console.log(`   ✅ Passed: ${results.summary.crudPassed}/${results.summary.total}`);
  console.log(`   ❌ Failed: ${results.summary.crudFailed}/${results.summary.total}`);
  console.log(`   💥 Errors: ${results.summary.crudErrors}/${results.summary.total}`);
  

  // שמירת תוצאות
  localStorage.setItem('comprehensive_crud_test_report', JSON.stringify(results));
  console.log('\n💾 Results saved to localStorage as "comprehensive_crud_test_report"');

  return results;
}

// יצירת פונקציות גלובליות
if (typeof window !== 'undefined') {
  window.runComprehensiveTests = runComprehensiveTests;
  window.checkPageLoadingOrder = checkPageLoadingOrder;
  window.testPageCRUD = testPageCRUD;
}

// הודעת הוראות
console.log(`
╔══════════════════════════════════════════════════════════════╗
║  Comprehensive CRUD Test Runner - Ready                     ║
╚══════════════════════════════════════════════════════════════╝

📋 To run comprehensive tests, execute:
   await runComprehensiveTests()

📊 The script will test all ${MAIN_PAGES.length} main pages:
${MAIN_PAGES.map((p, i) => `   ${i + 1}. ${p}`).join('\n')}

⏱️ Estimated time: ~5-10 minutes

💾 Results will be saved to localStorage as 'comprehensive_crud_test_report'
`);


