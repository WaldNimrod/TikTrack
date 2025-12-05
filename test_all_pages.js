/**
 * Script to test all pages and collect console errors
 * Run this in browser console on each page
 */

const pagesToTest = [
  { name: 'דף הבית', url: '/' },
  { name: 'טריידים', url: '/trades.html' },
  { name: 'תכניות מסחר', url: '/trade_plans.html' },
  { name: 'התראות', url: '/alerts.html' },
  { name: 'טיקרים', url: '/tickers.html' },
  { name: 'דשבורד טיקר', url: '/ticker-dashboard.html' },
  { name: 'חשבונות מסחר', url: '/trading_accounts.html' },
  { name: 'ביצועים', url: '/executions.html' },
  { name: 'תזרימי מזומן', url: '/cash_flows.html' },
  { name: 'הערות', url: '/notes.html' },
  { name: 'מחקר', url: '/research.html' },
  { name: 'ניתוח AI', url: '/ai-analysis.html' },
  { name: 'העדפות', url: '/preferences.html' },
  { name: 'פרופיל משתמש', url: '/user-profile.html' },
];

// Function to collect console errors
function collectConsoleErrors() {
  const errors = [];
  const warnings = [];
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.error = function(...args) {
    errors.push({
      type: 'error',
      message: args.join(' '),
      timestamp: new Date().toISOString(),
      stack: new Error().stack
    });
    originalError.apply(console, args);
  };
  
  console.warn = function(...args) {
    warnings.push({
      type: 'warning',
      message: args.join(' '),
      timestamp: new Date().toISOString()
    });
    originalWarn.apply(console, args);
  };
  
  return { errors, warnings, restore: () => {
    console.error = originalError;
    console.warn = originalWarn;
  }};
}

// Function to check page initialization
function checkPageInitialization() {
  const checks = {
    headerLoaded: !!document.querySelector('unified-header, app-header, .header-container'),
    coreSystemsLoaded: typeof window.initializeUnifiedApp === 'function',
    preferencesLoaded: typeof window.getPreference === 'function',
    notificationSystemLoaded: typeof window.showNotification === 'function',
    cacheSystemLoaded: typeof window.UnifiedCacheManager !== 'undefined',
    loggerLoaded: typeof window.Logger !== 'undefined',
  };
  
  return checks;
}

// Function to wait for page load
function waitForPageLoad(timeout = 10000) {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      setTimeout(resolve, 2000); // Wait 2 seconds after load
    } else {
      window.addEventListener('load', () => {
        setTimeout(resolve, 2000);
      });
      setTimeout(resolve, timeout);
    }
  });
}

// Main test function
async function testPage(pageName, url) {
  console.log(`\n🔍 Testing: ${pageName} (${url})`);
  
  const collector = collectConsoleErrors();
  
  try {
    await waitForPageLoad();
    
    const initChecks = checkPageInitialization();
    const errors = collector.errors;
    const warnings = collector.warnings;
    
    collector.restore();
    
    return {
      pageName,
      url,
      success: errors.length === 0,
      errors: errors,
      warnings: warnings,
      initChecks: initChecks,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    collector.restore();
    return {
      pageName,
      url,
      success: false,
      errors: [{ type: 'error', message: error.message, stack: error.stack }],
      warnings: [],
      initChecks: {},
      timestamp: new Date().toISOString()
    };
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testPage, pagesToTest, collectConsoleErrors, checkPageInitialization };
} else {
  window.PageTester = { testPage, pagesToTest, collectConsoleErrors, checkPageInitialization };
  
  // Auto-run if on test page
  if (window.location.pathname === '/test-pages.html') {
    (async () => {
      const results = [];
      for (const page of pagesToTest) {
        const result = await testPage(page.name, page.url);
        results.push(result);
        console.log(`✅ ${page.name}: ${result.success ? 'SUCCESS' : 'FAILED'} (${result.errors.length} errors)`);
      }
      console.table(results);
    })();
  }
}


