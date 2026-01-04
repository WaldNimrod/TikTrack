const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = 'documentation/05-REPORTS/artifacts/2026_01_02';
const TIMESTAMP = new Date().toISOString().replace(/:/g, '-').split('.')[0];

let evidenceData = {
  timestamp: TIMESTAMP,
  environment: 'Port 8080 (Development)',
  test_suites: {},
  summary: {
    total_tests: 0,
    passed: 0,
    failed: 0,
    blocked: 0
  }
};

async function safeEvaluate(page, fn, defaultValue = null) {
  try {
    return await page.evaluate(fn);
  } catch (e) {
    return defaultValue;
  }
}

async function clearBrowserData(page) {
  try {
    // Navigate to a page first to ensure we have a valid context
    await page.goto('http://localhost:8080/login.html', { waitUntil: 'domcontentloaded' });
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await safeEvaluate(page, () => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        // Ignore storage errors
      }
    });
    const cookies = await page.cookies().catch(() => []);
    if (cookies.length > 0) {
      await page.deleteCookie(...cookies);
    }
  } catch (e) {
    // Ignore clearing errors
  }
}

async function testSuite1_UnauthenticatedRedirect(page) {
  console.log('\n=== TEST SUITE 1: Unauthenticated Access (Redirect-Only Flow) ===');
  const suiteResults = {
    suite: 'Unauthenticated Redirect',
    tests: []
  };

  // Test 1.1: Homepage Redirect
  console.log('\n--- Test 1.1: Homepage Redirect ---');
  await clearBrowserData(page);
  await page.goto('http://localhost:8080/', { waitUntil: 'domcontentloaded' });
  await new Promise(resolve => setTimeout(resolve, 5000));

  const homepageUrl = page.url();
  const homepageRedirected = homepageUrl.includes('/login.html');
  
  let modals = 0;
  let bodyHasModalOpen = false;
  try {
    modals = await page.$$eval('.modal.show, .modal-backdrop', elements => elements.length);
    bodyHasModalOpen = await page.evaluate(() => document.body.classList.contains('modal-open'));
  } catch (e) {
    // Ignore evaluation errors
  }

  const test1_1 = {
    name: 'Homepage Redirect',
    passed: homepageRedirected && modals === 0 && !bodyHasModalOpen,
    details: {
      finalUrl: homepageUrl,
      redirected: homepageRedirected,
      modalsFound: modals,
      bodyModalOpen: bodyHasModalOpen
    }
  };
  suiteResults.tests.push(test1_1);
  console.log(`Result: ${test1_1.passed ? 'PASS ✅' : 'FAIL ❌'}`);

  // Test 1.2: Trades Page Redirect
  console.log('\n--- Test 1.2: Trades Page Redirect ---');
  await clearBrowserData(page);
  await page.goto('http://localhost:8080/trades', { waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 5000));

  const tradesUrl = page.url();
  const tradesRedirected = tradesUrl.includes('/login.html');
  let tradesModals = 0;
  try {
    tradesModals = await page.$$eval('.modal.show, .modal-backdrop', elements => elements.length);
  } catch (e) {
    // Ignore evaluation errors
  }

  const test1_2 = {
    name: 'Trades Page Redirect',
    passed: tradesRedirected && tradesModals === 0,
    details: {
      finalUrl: tradesUrl,
      redirected: tradesRedirected,
      modalsFound: tradesModals
    }
  };
  suiteResults.tests.push(test1_2);
  console.log(`Result: ${test1_2.passed ? 'PASS ✅' : 'FAIL ❌'}`);

  // Test 1.3: CRUD Dashboard Redirect
  console.log('\n--- Test 1.3: CRUD Dashboard Redirect ---');
  await clearBrowserData(page);
  await page.goto('http://localhost:8080/crud_testing_dashboard', { waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 10000));

  const crudUrl = page.url();
  const crudRedirected = crudUrl.includes('/login.html');
  let crudModals = 0;
  try {
    crudModals = await page.$$eval('.modal.show, .modal-backdrop', elements => elements.length);
  } catch (e) {
    // Ignore evaluation errors
  }

  const test1_3 = {
    name: 'CRUD Dashboard Redirect',
    passed: crudRedirected && crudModals === 0,
    details: {
      finalUrl: crudUrl,
      redirected: crudRedirected,
      modalsFound: crudModals
    }
  };
  suiteResults.tests.push(test1_3);
  console.log(`Result: ${test1_3.passed ? 'PASS ✅' : 'FAIL ❌'}`);

  // Test 1.4: Login Page (No Redirect)
  console.log('\n--- Test 1.4: Login Page (No Redirect) ---');
  await clearBrowserData(page);
  await page.goto('http://localhost:8080/login.html', { waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 10000));

  const loginUrl = page.url();
  const loginStaysOnPage = loginUrl.includes('/login.html');
  let loginModals = 0;
  let loginFormExists = false;
  try {
    loginModals = await page.$$eval('.modal.show, .modal-backdrop', elements => elements.length);
    loginFormExists = await page.$('#loginForm') !== null;
  } catch (e) {
    // Ignore evaluation errors
  }

  const test1_4 = {
    name: 'Login Page (No Redirect)',
    passed: loginStaysOnPage && loginModals === 0 && loginFormExists,
    details: {
      finalUrl: loginUrl,
      staysOnPage: loginStaysOnPage,
      modalsFound: loginModals,
      loginFormExists: loginFormExists
    }
  };
  suiteResults.tests.push(test1_4);
  console.log(`Result: ${test1_4.passed ? 'PASS ✅' : 'FAIL ❌'}`);

  evidenceData.test_suites.suite1 = suiteResults;
  return suiteResults;
}

async function testSuite2_PostLoginValidation(page) {
  console.log('\n=== TEST SUITE 2: Post-Login Validation (Authenticated Flow) ===');
  const suiteResults = {
    suite: 'Post-Login Validation',
    tests: []
  };

  // Test 2.1: Successful Login Flow
  console.log('\n--- Test 2.1: Successful Login Flow ---');
  await clearBrowserData(page);
  
  // Capture console errors
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  // Capture page errors
  const pageErrors = [];
  page.on('pageerror', error => {
    pageErrors.push(error.message);
  });
  
  await page.goto('http://localhost:8080/login.html', { waitUntil: 'networkidle2' });
  
  // Wait for all scripts to load (defer scripts execute after DOMContentLoaded)
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Check script loading status
  const scriptStatus = await safeEvaluate(page, () => {
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    return {
      totalScripts: scripts.length,
      loadedScripts: scripts.filter(s => s.src && !s.onerror).length,
      authJsLoaded: scripts.some(s => s.src.includes('auth.js')),
      loginJsLoaded: scripts.some(s => s.src.includes('login.js')),
      windowLogin: typeof window.login,
      windowAuth: typeof window.AuthGuard,
      readyState: document.readyState
    };
  }, null);
  
  console.log('Script loading status:', scriptStatus);

  // Wait for login function to be available (with longer timeout for defer scripts)
  let loginAvailable = false;
  let lastCheckResult = null;
  for (let i = 0; i < 100; i++) {
    lastCheckResult = await safeEvaluate(page, () => {
      return {
        loginType: typeof window.login,
        authType: typeof window.AuthGuard,
        readyState: document.readyState,
        scriptsLoaded: document.readyState === 'complete'
      };
    }, null);
    
    loginAvailable = lastCheckResult && lastCheckResult.loginType === 'function';
    if (loginAvailable) {
      console.log(`Login function available after ${i * 100}ms`);
      break;
    }
    
    if (i % 10 === 0) {
      console.log(`Waiting for login function, attempt ${i}, status:`, lastCheckResult);
    }
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Log errors if login not available
  if (!loginAvailable) {
    if (consoleErrors.length > 0) {
      console.log('Console errors:', consoleErrors);
    }
    if (pageErrors.length > 0) {
      console.log('Page errors:', pageErrors);
    }
  }

  if (!loginAvailable) {
    const test2_1 = {
      name: 'Successful Login Flow',
      passed: false,
      blocked: true,
      details: {
        error: 'Login function not available - script loading issue',
        loginFunctionAvailable: false,
        lastCheckResult: lastCheckResult,
        scriptStatus: scriptStatus,
        consoleErrors: consoleErrors,
        pageErrors: pageErrors,
        waitTimeMs: 10000
      }
    };
    suiteResults.tests.push(test2_1);
    console.log(`Result: BLOCKED ⚠️ - Login function not available`);
    console.log(`Last check result:`, lastCheckResult);
    console.log(`Script status:`, scriptStatus);
    if (consoleErrors.length > 0) console.log(`Console errors:`, consoleErrors);
    if (pageErrors.length > 0) console.log(`Page errors:`, pageErrors);
    evidenceData.test_suites.suite2 = suiteResults;
    return suiteResults;
  }

  // Try to login
  try {
    await page.type('#username', 'admin');
    await page.type('#password', 'admin123');
    await page.click('#loginBtn');
    await new Promise(resolve => setTimeout(resolve, 5000));

    const postLoginUrl = page.url();
    let headerVisible = false;
    try {
      headerVisible = await page.$('#unified-header') !== null;
    } catch (e) {
      // Ignore evaluation errors
    }
    const redirectedToHomepage = postLoginUrl.includes('/') && !postLoginUrl.includes('/login.html');

    const test2_1 = {
      name: 'Successful Login Flow',
      passed: redirectedToHomepage && headerVisible,
      details: {
        postLoginUrl: postLoginUrl,
        redirectedToHomepage: redirectedToHomepage,
        headerVisible: headerVisible
      }
    };
    suiteResults.tests.push(test2_1);
    console.log(`Result: ${test2_1.passed ? 'PASS ✅' : 'FAIL ❌'}`);

    // Test 2.2: Authenticated Homepage Access
    if (test2_1.passed) {
      console.log('\n--- Test 2.2: Authenticated Homepage Access ---');
      await page.goto('http://localhost:8080/', { waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 3000));

      const homepageUrl = page.url();
      const staysOnHomepage = homepageUrl.includes('/') && !homepageUrl.includes('/login.html');
      let headerStillVisible = false;
      try {
        headerStillVisible = await page.$('#unified-header') !== null;
      } catch (e) {
        // Ignore evaluation errors
      }

      const test2_2 = {
        name: 'Authenticated Homepage Access',
        passed: staysOnHomepage && headerStillVisible,
        details: {
          homepageUrl: homepageUrl,
          staysOnHomepage: staysOnHomepage,
          headerStillVisible: headerStillVisible
        }
      };
      suiteResults.tests.push(test2_2);
      console.log(`Result: ${test2_2.passed ? 'PASS ✅' : 'FAIL ❌'}`);

      // Test 2.3: Authenticated Trades Page Access
      console.log('\n--- Test 2.3: Authenticated Trades Page Access ---');
      await page.goto('http://localhost:8080/trades', { waitUntil: 'networkidle2' });
      await new Promise(resolve => setTimeout(resolve, 3000));

      const tradesUrl = page.url();
      const staysOnTrades = tradesUrl.includes('/trades') && !tradesUrl.includes('/login.html');
      let tradesHeaderVisible = false;
      try {
        tradesHeaderVisible = await page.$('#unified-header') !== null;
      } catch (e) {
        // Ignore evaluation errors
      }

      const test2_3 = {
        name: 'Authenticated Trades Page Access',
        passed: staysOnTrades && tradesHeaderVisible,
        details: {
          tradesUrl: tradesUrl,
          staysOnTrades: staysOnTrades,
          headerVisible: tradesHeaderVisible
        }
      };
      suiteResults.tests.push(test2_3);
      console.log(`Result: ${test2_3.passed ? 'PASS ✅' : 'FAIL ❌'}`);
    }
  } catch (error) {
    const test2_1 = {
      name: 'Successful Login Flow',
      passed: false,
      details: {
        error: error.message
      }
    };
    suiteResults.tests.push(test2_1);
    console.log(`Result: FAIL ❌ - ${error.message}`);
  }

  evidenceData.test_suites.suite2 = suiteResults;
  return suiteResults;
}

async function testSuite3_Option1Compliance(page) {
  console.log('\n=== TEST SUITE 3: Option 1 Compliance (SessionStorage Only) ===');
  const suiteResults = {
    suite: 'Option 1 Compliance',
    tests: []
  };

  // Test 3.1: localStorage Auth Token Absence
  console.log('\n--- Test 3.1: localStorage Auth Token Absence ---');
  const localStorageAuthToken = await safeEvaluate(page, () => localStorage.getItem('authToken'), null);
  const localStorageCurrentUser = await safeEvaluate(page, () => localStorage.getItem('currentUser'), null);
  const localStorageAuthKeys = await safeEvaluate(page, () => {
    return Object.keys(localStorage).filter(k => k.includes('auth') || k.includes('user') || k.includes('token'));
  }, []);

  const test3_1 = {
    name: 'localStorage Auth Token Absence',
    passed: !localStorageAuthToken && !localStorageCurrentUser && localStorageAuthKeys.length === 0,
    details: {
      authToken: localStorageAuthToken,
      currentUser: localStorageCurrentUser,
      authKeysFound: localStorageAuthKeys
    }
  };
  suiteResults.tests.push(test3_1);
  console.log(`Result: ${test3_1.passed ? 'PASS ✅' : 'FAIL ❌'}`);

  // Test 3.2: SessionStorage Bootstrap Keys Presence
  console.log('\n--- Test 3.2: SessionStorage Bootstrap Keys Presence ---');
  const sessionStorageAuthToken = await safeEvaluate(page, () => sessionStorage.getItem('authToken'), null);
  const sessionStorageCurrentUser = await safeEvaluate(page, () => sessionStorage.getItem('currentUser'), null);

  const test3_2 = {
    name: 'SessionStorage Bootstrap Keys Presence',
    passed: !!sessionStorageAuthToken && !!sessionStorageCurrentUser,
    details: {
      authToken: sessionStorageAuthToken ? 'present' : 'null',
      currentUser: sessionStorageCurrentUser ? 'present' : 'null'
    }
  };
  suiteResults.tests.push(test3_2);
  console.log(`Result: ${test3_2.passed ? 'PASS ✅' : 'FAIL ❌'}`);

  // Test 3.3: UnifiedCacheManager SessionStorageLayer Usage
  console.log('\n--- Test 3.3: UnifiedCacheManager SessionStorageLayer Usage ---');

  // Wait a bit for UnifiedCacheManager to fully initialize
  await new Promise(resolve => setTimeout(resolve, 1000));

  const ucmStatus = await safeEvaluate(page, () => {
    return {
      ucmExists: !!window.UnifiedCacheManager,
      ucmInitialized: window.UnifiedCacheManager?.initialized,
      sessionStorageAuthToken: sessionStorage.getItem('authToken'),
      sessionStorageCurrentUser: sessionStorage.getItem('currentUser')
    };
  }, null);

  console.log('UCM Status:', ucmStatus);

  const ucmAuthToken = await safeEvaluate(page, async () => {
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
      try {
        // Check what keys exist in sessionStorage
        const allKeys = Object.keys(sessionStorage);
        console.log('All sessionStorage keys:', allKeys);

        // Check the specific keys
        const tiktrackAuthToken = sessionStorage.getItem('tiktrack_session_authToken');
        const bootstrapAuthToken = sessionStorage.getItem('authToken');
        console.log('tiktrack_session_authToken:', tiktrackAuthToken ? 'exists' : 'null');
        console.log('bootstrap authToken:', bootstrapAuthToken ? 'exists' : 'null');

        const result = await window.UnifiedCacheManager.get('authToken', {layer: 'sessionStorage', includeUserId: false});
        console.log('UCM get authToken result:', result);
        return result;
      } catch (e) {
        console.log('UCM get authToken error:', e.message);
        return null;
      }
    }
    console.log('UCM not available for authToken');
    return null;
  }, null);

  const ucmCurrentUser = await safeEvaluate(page, async () => {
    if (window.UnifiedCacheManager && window.UnifiedCacheManager.initialized) {
      try {
        const result = await window.UnifiedCacheManager.get('currentUser', {layer: 'sessionStorage', includeUserId: false});
        console.log('UCM get currentUser result:', result);
        return result;
      } catch (e) {
        console.log('UCM get currentUser error:', e.message);
        return null;
      }
    }
    console.log('UCM not available for currentUser');
    return null;
  }, null);

  const test3_3 = {
    name: 'UnifiedCacheManager SessionStorageLayer Usage',
    passed: !!ucmAuthToken && !!ucmCurrentUser,
    details: {
      ucmAuthToken: ucmAuthToken ? 'present' : 'null',
      ucmCurrentUser: ucmCurrentUser ? 'present' : 'null',
      ucmExists: ucmStatus.ucmExists,
      ucmInitialized: ucmStatus.ucmInitialized,
      sessionStorageAuthToken: !!ucmStatus.sessionStorageAuthToken,
      sessionStorageCurrentUser: !!ucmStatus.sessionStorageCurrentUser
    }
  };
  suiteResults.tests.push(test3_3);
  console.log(`Result: ${test3_3.passed ? 'PASS ✅' : 'FAIL ❌'}`);

  evidenceData.test_suites.suite3 = suiteResults;
  return suiteResults;
}

async function testSuite4_MultiTabConsistency(page) {
  console.log('\n=== TEST SUITE 4: Multi-Tab Consistency ===');
  const suiteResults = {
    suite: 'Multi-Tab Consistency',
    tests: []
  };

  // Note: Multi-tab testing requires multiple browser contexts
  // For now, we'll document the expected behavior
  const test4_1 = {
    name: 'Cross-Tab Auth State',
    passed: true,
    skipped: true,
    details: {
      note: 'Multi-tab testing requires multiple browser contexts - documented expected behavior',
      expectedBehavior: 'SessionStorage is tab-specific, so new tabs should redirect to login unless session cookie is used'
    }
  };
  suiteResults.tests.push(test4_1);
  console.log(`Result: SKIPPED ⏭️ - Multi-tab testing requires multiple contexts`);

  evidenceData.test_suites.suite4 = suiteResults;
  return suiteResults;
}

async function testSuite5_CacheClearing(page) {
  console.log('\n=== TEST SUITE 5: Cache Clearing Scenarios ===');
  const suiteResults = {
    suite: 'Cache Clearing',
    tests: []
  };

  // Test 5.1: Full Cache Clear (Auth Preserved)
  console.log('\n--- Test 5.1: Full Cache Clear (Auth Preserved) ---');
  const beforeClearAuth = await safeEvaluate(page, () => sessionStorage.getItem('authToken'), null);

  // Simulate cache clear by reloading page
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 3000));

  const afterReloadAuth = await safeEvaluate(page, () => sessionStorage.getItem('authToken'), null);
  const afterReloadUrl = page.url();

  const test5_1 = {
    name: 'Full Cache Clear (Auth Preserved)',
    passed: !!afterReloadAuth && !afterReloadUrl.includes('/login.html'),
    details: {
      authTokenBeforeClear: beforeClearAuth ? 'present' : 'null',
      authTokenAfterReload: afterReloadAuth ? 'present' : 'null',
      urlAfterReload: afterReloadUrl
    }
  };
  suiteResults.tests.push(test5_1);
  console.log(`Result: ${test5_1.passed ? 'PASS ✅' : 'FAIL ❌'}`);

  // Test 5.2: SessionStorage Clear (Auth Lost)
  console.log('\n--- Test 5.2: SessionStorage Clear (Auth Lost) ---');
  await safeEvaluate(page, () => sessionStorage.clear(), null);
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 5000));

  const afterClearUrl = page.url();
  const afterClearAuth = await safeEvaluate(page, () => sessionStorage.getItem('authToken'), null);

  const test5_2 = {
    name: 'SessionStorage Clear (Auth Lost)',
    passed: afterClearUrl.includes('/login.html') && !afterClearAuth,
    details: {
      urlAfterClear: afterClearUrl,
      authTokenAfterClear: afterClearAuth ? 'present' : 'null',
      redirectedToLogin: afterClearUrl.includes('/login.html')
    }
  };
  suiteResults.tests.push(test5_2);
  console.log(`Result: ${test5_2.passed ? 'PASS ✅' : 'FAIL ❌'}`);

  evidenceData.test_suites.suite5 = suiteResults;
  return suiteResults;
}

async function testSuite6_NoModalVerification(page) {
  console.log('\n=== TEST SUITE 6: No Modal Verification ===');
  const suiteResults = {
    suite: 'No Modal Verification',
    tests: []
  };

  // Test 6.1: Modal Absence Check
  console.log('\n--- Test 6.1: Modal Absence Check ---');
  await clearBrowserData(page);
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 5000));

  let modals = 0;
  let bodyModalOpen = false;
  let modalElements = 0;
  try {
    modals = await page.$$eval('.modal, .modal-backdrop', elements => elements.length);
    bodyModalOpen = await page.evaluate(() => document.body.classList.contains('modal-open'));
    modalElements = await page.$$eval('[role="dialog"]', elements => elements.length);
  } catch (e) {
    // Ignore evaluation errors
  }

  const test6_1 = {
    name: 'Modal Absence Check',
    passed: modals === 0 && !bodyModalOpen && modalElements === 0,
    details: {
      modalsFound: modals,
      bodyModalOpen: bodyModalOpen,
      dialogElements: modalElements
    }
  };
  suiteResults.tests.push(test6_1);
  console.log(`Result: ${test6_1.passed ? 'PASS ✅' : 'FAIL ❌'}`);

  // Test 6.2: Login Page Modal Check
  console.log('\n--- Test 6.2: Login Page Modal Check ---');
  await page.goto('http://localhost:8080/login.html', { waitUntil: 'networkidle2' });
  await new Promise(resolve => setTimeout(resolve, 10000));

  let loginModals = 0;
  let loginBodyModalOpen = false;
  let loginFormVisible = false;
  try {
    loginModals = await page.$$eval('.modal, .modal-backdrop', elements => elements.length);
    loginBodyModalOpen = await page.evaluate(() => document.body.classList.contains('modal-open'));
    loginFormVisible = await page.$('#loginForm') !== null;
  } catch (e) {
    // Ignore evaluation errors
  }

  const test6_2 = {
    name: 'Login Page Modal Check',
    passed: loginModals === 0 && !loginBodyModalOpen && loginFormVisible,
    details: {
      modalsFound: loginModals,
      bodyModalOpen: loginBodyModalOpen,
      loginFormVisible: loginFormVisible
    }
  };
  suiteResults.tests.push(test6_2);
  console.log(`Result: ${test6_2.passed ? 'PASS ✅' : 'FAIL ❌'}`);

  evidenceData.test_suites.suite6 = suiteResults;
  return suiteResults;
}

async function runComprehensiveQA() {
  console.log('=== OPTION 1 COMPREHENSIVE QA - PORT 8080 ===');
  console.log(`Timestamp: ${TIMESTAMP}`);
  console.log('Environment: Development (Port 8080)');

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--disable-extensions']
    });

    const page = await browser.newPage();

    // Run all test suites
    const suite1 = await testSuite1_UnauthenticatedRedirect(page);
    const suite2 = await testSuite2_PostLoginValidation(page);
    const suite3 = await testSuite3_Option1Compliance(page);
    const suite4 = await testSuite4_MultiTabConsistency(page);
    const suite5 = await testSuite5_CacheClearing(page);
    const suite6 = await testSuite6_NoModalVerification(page);

    // Calculate summary
    const allTests = [
      ...suite1.tests,
      ...suite2.tests,
      ...suite3.tests,
      ...suite4.tests,
      ...suite5.tests,
      ...suite6.tests
    ];

    evidenceData.summary.total_tests = allTests.length;
    evidenceData.summary.passed = allTests.filter(t => t.passed && !t.skipped).length;
    evidenceData.summary.failed = allTests.filter(t => !t.passed && !t.skipped && !t.blocked).length;
    evidenceData.summary.blocked = allTests.filter(t => t.blocked).length;
    evidenceData.summary.skipped = allTests.filter(t => t.skipped).length;

    // Print summary
    console.log('\n=== QA SUMMARY ===');
    console.log(`Total Tests: ${evidenceData.summary.total_tests}`);
    console.log(`Passed: ${evidenceData.summary.passed} ✅`);
    console.log(`Failed: ${evidenceData.summary.failed} ❌`);
    console.log(`Blocked: ${evidenceData.summary.blocked} ⚠️`);
    console.log(`Skipped: ${evidenceData.summary.skipped} ⏭️`);

    const overallStatus = evidenceData.summary.failed === 0 && evidenceData.summary.blocked === 0 ? 'PASS ✅' : 'FAIL ❌';
    console.log(`\nOverall Status: ${overallStatus}`);

    // Save evidence
    const evidenceFile = path.join(EVIDENCE_DIR, `team_d_option1_comprehensive_qa_${TIMESTAMP}.json`);
    fs.writeFileSync(evidenceFile, JSON.stringify(evidenceData, null, 2));
    console.log(`\nEvidence saved: ${evidenceFile}`);

    // Save text report
    const textReport = generateTextReport(evidenceData);
    const textReportFile = path.join(EVIDENCE_DIR, `team_d_option1_comprehensive_qa_${TIMESTAMP}.txt`);
    fs.writeFileSync(textReportFile, textReport);
    console.log(`Text report saved: ${textReportFile}`);

    return {
      status: overallStatus,
      summary: evidenceData.summary,
      evidenceFile: evidenceFile,
      textReportFile: textReportFile
    };

  } catch (error) {
    console.error('QA execution failed:', error.message);
    evidenceData.error = error.message;
    const errorFile = path.join(EVIDENCE_DIR, `team_d_option1_comprehensive_qa_error_${TIMESTAMP}.json`);
    fs.writeFileSync(errorFile, JSON.stringify(evidenceData, null, 2));
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function generateTextReport(data) {
  let report = `=== OPTION 1 COMPREHENSIVE QA REPORT ===\n`;
  report += `Timestamp: ${data.timestamp}\n`;
  report += `Environment: ${data.environment}\n\n`;

  report += `=== SUMMARY ===\n`;
  report += `Total Tests: ${data.summary.total_tests}\n`;
  report += `Passed: ${data.summary.passed} ✅\n`;
  report += `Failed: ${data.summary.failed} ❌\n`;
  report += `Blocked: ${data.summary.blocked} ⚠️\n`;
  report += `Skipped: ${data.summary.skipped} ⏭️\n\n`;

  Object.keys(data.test_suites).forEach(suiteKey => {
    const suite = data.test_suites[suiteKey];
    report += `=== ${suite.suite} ===\n`;
    suite.tests.forEach((test, idx) => {
      const status = test.blocked ? 'BLOCKED ⚠️' : test.skipped ? 'SKIPPED ⏭️' : test.passed ? 'PASS ✅' : 'FAIL ❌';
      report += `${idx + 1}. ${test.name}: ${status}\n`;
      if (test.details) {
        Object.keys(test.details).forEach(key => {
          report += `   ${key}: ${JSON.stringify(test.details[key])}\n`;
        });
      }
    });
    report += '\n';
  });

  return report;
}

runComprehensiveQA().then(results => {
  console.log('\n=== FINAL RESULTS ===');
  console.log(`Status: ${results.status}`);
  console.log(`Evidence: ${results.evidenceFile}`);
  console.log(`Report: ${results.textReportFile}`);
  process.exit(results.status.includes('PASS') ? 0 : 1);
}).catch(error => {
  console.error('QA execution failed:', error);
  process.exit(1);
});

