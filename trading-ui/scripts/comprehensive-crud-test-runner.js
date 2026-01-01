/**
 * Comprehensive CRUD Test Runner - TikTrack
 * ==========================================
 * 
 * סקריפט מקיף להרצת בדיקות CRUD על כל העמודים המרכזיים
 * כולל בדיקת סדר טעינה, בדיקות CRUD מלאות, ועדכון רשומות בפועל
 * 
 * שימוש:
 * 1. פתח את הדפדפן בדף: http://localhost:8080/crud_testing_dashboard
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

const ENTITY_ALIASES = {
  ai_analysis: 'ai-analysis',
  watch_lists: 'watch-list',
  user_profile: 'user-profile',
  ticker_dashboard: 'ticker-dashboard',
  trading_journal: 'trading-journal',
};

function normalizeEntityName(pageName) {
  return ENTITY_ALIASES[pageName] || pageName;
}

async function testWatchListsSpecial() {
  const issues = [];
  const select = document.getElementById('activeListSelect');
  const addButton = document.querySelector('[data-onclick*="openAddListModal"]');
  const deleteButton = document.querySelector('[data-onclick*="deleteCurrentList"]');

  if (!select) {
    issues.push('activeListSelect not found');
  }
  if (!addButton) {
    issues.push('Add watch list control not found');
  }
  if (!deleteButton) {
    issues.push('Delete watch list control not found');
  }

  let optionsCount = 0;
  if (select) {
    if (window.WatchListsPage?.loadWatchListsData) {
      try {
        await window.WatchListsPage.loadWatchListsData();
      } catch (error) {
        issues.push(`loadWatchListsData failed: ${error.message}`);
      }
    }

    if (window.WatchListsPage?.loadWatchLists) {
      try {
        await window.WatchListsPage.loadWatchLists();
      } catch (error) {
        issues.push(`loadWatchLists failed: ${error.message}`);
      }
    } else if (window.WatchListsPage?.init) {
      try {
        await window.WatchListsPage.init();
      } catch (error) {
        issues.push(`WatchListsPage init failed: ${error.message}`);
      }
    }

    for (let i = 0; i < 16; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      optionsCount = Array.from(select.options || []).filter(option => option.value).length;
      if (optionsCount > 0) break;
    }
    if (optionsCount === 0) {
      issues.push('activeListSelect has no loaded options');
    }
  }

  let apiOk = true;
  try {
    const response = await fetch('/api/watch_lists/');
    if (!response.ok) {
      apiOk = false;
      issues.push(`watch-lists API returned ${response.status}`);
    }
  } catch (error) {
    apiOk = false;
    issues.push(`watch-lists API error: ${error.message}`);
  }

  return {
    page: 'watch_lists',
    crud: issues.length === 0 ? 'PASSED' : 'FAILED',
    error: issues.length ? issues.join('; ') : null,
    issues,
    details: {
      optionsCount,
      apiOk,
    },
  };
}

async function testUserProfileSpecial() {
  const issues = [];
  const requiredFields = ['firstName', 'lastName', 'email'];
  requiredFields.forEach(fieldId => {
    if (!document.getElementById(fieldId)) {
      issues.push(`Missing profile field: ${fieldId}`);
    }
  });

  const preferencesAvailable = !!(window.PreferencesManager || window.PreferencesUI || window.PreferencesCore);
  if (!preferencesAvailable) {
    issues.push('Preferences system not detected on user profile page');
  }

  let profileApiOk = true;
  try {
    const response = await fetch('/api/auth/me');
    if (!response.ok) {
      profileApiOk = false;
      issues.push(`user profile API returned ${response.status}`);
    }
  } catch (error) {
    profileApiOk = false;
    issues.push(`user profile API error: ${error.message}`);
  }

  return {
    page: 'user_profile',
    crud: issues.length === 0 ? 'PASSED' : 'FAILED',
    error: issues.length ? issues.join('; ') : null,
    issues,
    details: {
      profileApiOk,
      preferencesAvailable,
    },
  };
}

/**
 * בדיקת סדר טעינה של עמוד
 */
async function checkPageLoadingOrder(pageName) {

  try {

    // נווט לעמוד (use clean URLs without .html extensions)
    window.location.href = `/${pageName}`;
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
    if (pageName === 'watch_lists') {
      return await testWatchListsSpecial();
    }
    if (pageName === 'user_profile') {
      return await testUserProfileSpecial();
    }

    const entityName = normalizeEntityName(pageName);
    // בדיקה שהמערכת זמינה
    if (!window.CRUDEnhancedTester) {

      return {
        page: entityName,
        crud: 'ERROR',
        error: 'CRUDEnhancedTester not available'
      };
    }
    
    // יצירת instance
    if (!window.crudEnhancedTester) {
      window.crudEnhancedTester = new window.CRUDEnhancedTester();
    }
    
    // הרצת בדיקה
    const result = await window.crudEnhancedTester.smartEntityTest(entityName);
    
    return {
      page: entityName,
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

  window.Logger?.info('🚀 Starting Comprehensive CRUD Tests...');
  window.Logger?.info(`📋 Testing ${MAIN_PAGES.length} main pages\n`);
  
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
  window.Logger?.info('🔍 Checking loading order...\n');
  for (const pageName of MAIN_PAGES) {
    window.Logger?.info(`Checking ${pageName}...`);
    const result = await checkPageLoadingOrder(pageName);
    results.loadingOrder.push(result);
    
    if (result.loadingOrder === 'OK') {
      results.summary.loadingOrderPassed++;
      window.Logger?.info(`✅ ${pageName}: Loading order OK`);
    } else {
      results.summary.loadingOrderFailed++;
      window.Logger?.info(`❌ ${pageName}: Loading order issues`);
      if (result.issues) {
        result.issues.forEach(issue => window.Logger?.info(`   - ${issue}`));
      }
    }
  }
  
  // חזרה לדשבורד לבדיקות CRUD
  window.Logger?.info('\n🔄 Returning to CRUD testing dashboard...');
  window.location.href = '/crud_testing_dashboard';
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // בדיקות CRUD
  window.Logger?.info('\n🧪 Running CRUD tests...\n');
  for (const pageName of MAIN_PAGES) {
    window.Logger?.info(`Testing ${pageName}...`);
    const result = await testPageCRUD(pageName);
    results.crud.push(result);
    
    if (result.crud === 'PASSED') {
      results.summary.crudPassed++;
      window.Logger?.info(`✅ ${pageName}: CRUD tests PASSED (${result.score}/100)`);
    } else if (result.crud === 'FAILED') {
      results.summary.crudFailed++;
      window.Logger?.info(`❌ ${pageName}: CRUD tests FAILED (${result.score}/100)`);
      if (result.issues) {
        result.issues.forEach(issue => window.Logger?.info(`   - ${issue}`));
      }
    } else {
      results.summary.crudErrors++;
      window.Logger?.info(`💥 ${pageName}: CRUD tests ERROR - ${result.error}`);
    }
    
    // הפסקה קטנה בין בדיקות
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // סיכום
  window.Logger?.info('\n' + '='.repeat(60));
  window.Logger?.info('📊 FINAL RESULTS SUMMARY');
  window.Logger?.info('='.repeat(60));
  window.Logger?.info(`\n📋 Loading Order:`);
  window.Logger?.info(`   ✅ Passed: ${results.summary.loadingOrderPassed}/${results.summary.total}`);
  window.Logger?.info(`   ❌ Failed: ${results.summary.loadingOrderFailed}/${results.summary.total}`);
  window.Logger?.info(`\n🧪 CRUD Tests:`);
  window.Logger?.info(`   ✅ Passed: ${results.summary.crudPassed}/${results.summary.total}`);
  window.Logger?.info(`   ❌ Failed: ${results.summary.crudFailed}/${results.summary.total}`);
  window.Logger?.info(`   💥 Errors: ${results.summary.crudErrors}/${results.summary.total}`);
  

  // שמירת תוצאות
  localStorage.setItem('comprehensive_crud_test_report', JSON.stringify(results));
  window.Logger?.info('\n💾 Results saved to localStorage as "comprehensive_crud_test_report"');

  return results;
}

// יצירת פונקציות גלובליות
if (typeof window !== 'undefined') {
  window.runComprehensiveTests = runComprehensiveTests;
  window.checkPageLoadingOrder = checkPageLoadingOrder;
  window.testPageCRUD = testPageCRUD;
}

// הודעת הוראות
window.Logger?.info(`
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
