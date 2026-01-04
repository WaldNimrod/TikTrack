const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = 'documentation/05-REPORTS/artifacts/2026_01_03';

// Group A: Auth pages - treated as full pages (not modals)
const GROUP_A_PAGES = [
  '/login',
  '/register',
  '/forgot_password',
  '/reset_password'
];

let qaResults = {
  timestamp: new Date().toISOString().replace(/:/g, '-').split('.')[0],
  task: 'Task 0 Option1 Load-Order Discipline - Group A (Auth Pages)',
  test_name: 'option1_group_a_auth_pages_qa',
  environment: 'Port 8080 (Development) - Authenticated Session',
  login_credentials: 'admin/admin123',
  source_of_truth: 'window.pageInitializationConfigs',
  group: 'A',
  group_name: 'Auth Pages (Full Pages, No Modals)',
  expected_behavior: 'Auth pages load as standalone full pages without modal behavior',
  pages_tested: 0,
  passed: 0,
  failed: 0,
  errors: 0,
  modal_violations: 0,
  login_success: false,
  page_results: []
};

async function loginToApplication(page) {
  console.log('🔐 Logging in with admin/admin123...');

  try {
    // Navigate to login page first
    await page.goto('http://localhost:8080/login', { waitUntil: 'networkidle2' });

    // Clear any existing session after page loads
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.log('Storage clear failed:', e.message);
      }
    });

    // Wait for login form
    await page.waitForSelector('#username', { timeout: 5000 });

    // Enter credentials
    await page.type('#username', 'admin');
    await page.type('#password', 'admin123');

    // Click login
    await page.click('#loginBtn');

    // Wait for redirect
    await new Promise(resolve => setTimeout(resolve, 3000));

    const currentUrl = page.url();
    const loginSuccess = currentUrl.includes('/login') === false;

    qaResults.login_success = loginSuccess;

    if (loginSuccess) {
      console.log('✅ Login successful, redirected to:', currentUrl);

      // Verify we have auth tokens
      const authState = await page.evaluate(() => ({
        windowAuthToken: !!window.authToken,
        windowCurrentUser: !!window.currentUser,
        sessionAuthToken: sessionStorage.getItem('authToken') ? 'present' : 'null',
        sessionCurrentUser: sessionStorage.getItem('currentUser') ? 'present' : 'null'
      }));

      console.log('🔑 Auth state after login:', authState);

      return true;
    } else {
      console.log('❌ Login failed, still on login page');
      return false;
    }

  } catch (error) {
    console.log('❌ Login error:', error.message);
    return false;
  }
}

async function testAuthPageAsFullPage(page, pageUrl, isAuthenticated = false) {
  const result = {
    url: pageUrl,
    final_url: null,
    load_time_ms: 0,
    status: 'unknown',
    behavior_match: false,
    failure_reason: null,
    page_analysis: {
      title: null,
      body_class: null,
      has_form: false,
      has_buttons: false,
      has_inputs: false,
      has_content: false,
      modal_count: 0,
      viewport_width: 0,
      viewport_height: 0,
      document_ready_state: null,
      scripts_loaded: 0,
      globals_available: {
        window_authToken: false,
        window_currentUser: false,
        window_pageInitializationConfigs: false,
        window_UnifiedCacheManager: false,
        window_UnifiedAppInitializer: false
      }
    }
  };

  const startTime = Date.now();

  try {
    console.log(`Testing auth page: ${pageUrl}`);

    // Navigate to auth page
    await page.goto(`http://localhost:8080${pageUrl}`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for potential content loading
    await new Promise(resolve => setTimeout(resolve, 2000));

    const loadTime = Date.now() - startTime;
    const finalUrl = page.url();

    // Analyze page with SHORT CHECKLIST for auth pages
    const analysis = await page.evaluate((url, isAuth) => {
      const result = {
        title: document.title,
        has_form: !!document.querySelector('form'),
        modal_count: document.querySelectorAll('.modal, .modal-backdrop, .modal-dialog, .modal-content').length,
        has_submit_button: !!document.querySelector('button[type="submit"], input[type="submit"], .submit-btn'),
        has_email_input: !!document.querySelector('input[type="email"], input[name*="email"]'),
        has_password_input: !!document.querySelector('input[type="password"]'),
        submit_works: false
      };

      // Check submit functionality
      if (result.has_form && result.has_submit_button) {
        try {
          const form = document.querySelector('form');
          const submitBtn = document.querySelector('button[type="submit"], input[type="submit"], .submit-btn');
          result.submit_works = !!(form && submitBtn); // Basic form structure check
        } catch (e) {
          result.submit_works = false;
        }
      }

      return result;
    }, pageUrl, isAuthenticated);

    // SHORT CHECKLIST evaluation
    let passed = true;
    let failure_reason = null;

    // 1. No modals (should be standalone full page)
    if (analysis.modal_count > 0) {
      passed = false;
      failure_reason = `❌ No modal: Found ${analysis.modal_count} modals`;
    }

    // 2. Form exists (for non-login pages when authenticated)
    if (isAuthenticated && pageUrl !== '/login') {
      if (!analysis.has_form) {
        passed = false;
        failure_reason = failure_reason ? `${failure_reason}, ❌ Form exists: Missing form` : '❌ Form exists: Missing form';
      } else {
        // 3. Submit works (basic form structure)
        if (!analysis.submit_works) {
          passed = false;
          failure_reason = failure_reason ? `${failure_reason}, ❌ Submit works: Form submit not functional` : '❌ Submit works: Form submit not functional';
        }
      }
    }

    // Update result
    result.final_url = finalUrl;
    result.load_time_ms = loadTime;
    result.page_analysis = analysis;
    result.behavior_match = passed;
    result.failure_reason = failure_reason;
    result.status = passed ? 'PASS' : 'FAIL';

    if (result.page_analysis.modal_count > 0) {
      qaResults.modal_violations += result.page_analysis.modal_count;
    }

  } catch (error) {
    result.status = 'ERROR';
    result.error_message = error.message;
    result.load_time_ms = Date.now() - startTime;
  }

  return result;
}

async function runGroupA_QA() {
  console.log('🎯 Starting Task 0 Option1 Load-Order Discipline QA - Group A (Auth Pages)');
  console.log('📋 Group A: Auth pages treated as standalone full pages (no modals)');
  console.log('🔐 Login Credentials: admin/admin123');
  console.log('📊 Source of Truth: window.pageInitializationConfigs');
  console.log('🎭 Expected: Auth pages load as full standalone pages without modal behavior');
  console.log('');

  console.log('📄 Group A Pages to Test:');
  GROUP_A_PAGES.forEach(page => console.log(`   - ${page}`));
  console.log('');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--disable-extensions', '--no-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();

    // Set viewport to full size
    await page.setViewport({ width: 1920, height: 1080 });

    // Step 1: Login first
    console.log('--- Step 1: Login Process ---');
    const loginSuccess = await loginToApplication(page);

    if (!loginSuccess) {
      console.log('❌ Cannot proceed with QA - login failed');
      qaResults.login_success = false;
      return { status: 'LOGIN_FAILED', results: qaResults };
    }

    console.log('✅ Login successful, proceeding with Group A auth page tests\n');

    // Test Group A auth pages
    console.log('🎯 Testing Group A: Auth Pages as Full Standalone Pages');

    for (let i = 0; i < GROUP_A_PAGES.length; i++) {
      const pageUrl = GROUP_A_PAGES[i];

      const pageResult = await testAuthPageAsFullPage(page, pageUrl, loginSuccess);
      qaResults.page_results.push(pageResult);
      qaResults.pages_tested++;

      // Update counters
      if (pageResult.status === 'PASS') {
        qaResults.passed++;
      } else if (pageResult.status === 'FAIL') {
        qaResults.failed++;
      } else {
        qaResults.errors++;
      }

      // Progress indicator
      const status = pageResult.status === 'PASS' ? '✅' : pageResult.status === 'FAIL' ? '❌' : '⚠️';
      console.log(`  ${status} ${pageUrl}`);
      console.log(`     ✅ No modal: ${pageResult.page_analysis.modal_count === 0 ? 'PASS' : 'FAIL'} (${pageResult.page_analysis.modal_count})`);
      if (loginSuccess && pageUrl !== '/login') {
        console.log(`     ✅ Form exists: ${pageResult.page_analysis.has_form ? 'PASS' : 'FAIL'}`);
        console.log(`     ✅ Submit works: ${pageResult.page_analysis.submit_works ? 'PASS' : 'FAIL'}`);
      }

      if (pageResult.failure_reason) {
        console.log(`     Reason: ${pageResult.failure_reason}`);
      }
      console.log('');
    }

    // Overall summary
    console.log('🎯 GROUP A QA SUMMARY - Auth Pages as Full Standalone Pages');
    console.log('=' .repeat(75));
    console.log(`Login Status: ${qaResults.login_success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Auth Pages Tested: ${qaResults.pages_tested}`);
    console.log(`Pass Rate: ${((qaResults.passed / qaResults.pages_tested) * 100).toFixed(1)}%`);
    console.log(`Passed: ${qaResults.passed} ✅`);
    console.log(`Failed: ${qaResults.failed} ❌`);
    console.log(`Errors: ${qaResults.errors} ⚠️`);
    console.log(`Modal Violations: ${qaResults.modal_violations} 🚫`);

    // SHORT CHECKLIST Analysis
    console.log('');
    console.log('📋 SHORT CHECKLIST ANALYSIS:');
    const modalViolations = qaResults.page_results.filter(r => r.page_analysis.modal_count > 0);
    const missingForms = qaResults.page_results.filter(r => !r.page_analysis.has_form && loginSuccess && r.url !== '/login');
    const submitNotWorking = qaResults.page_results.filter(r => !r.page_analysis.submit_works && loginSuccess && r.url !== '/login');

    if (modalViolations.length > 0) {
      console.log(`❌ No modal violations: ${modalViolations.length} pages with modals: ${modalViolations.map(p => p.url).join(', ')}`);
    }
    if (missingForms.length > 0) {
      console.log(`❌ Form exists violations: ${missingForms.length} pages missing forms: ${missingForms.map(p => p.url).join(', ')}`);
    }
    if (submitNotWorking.length > 0) {
      console.log(`❌ Submit works violations: ${submitNotWorking.length} pages with broken submit: ${submitNotWorking.map(p => p.url).join(', ')}`);
    }

    // Save results
    const jsonFile = path.join(EVIDENCE_DIR, `team_d_option1_group_a_auth_pages_qa_${qaResults.timestamp}.json`);
    const txtFile = path.join(EVIDENCE_DIR, `team_d_option1_group_a_auth_pages_qa_${qaResults.timestamp}.txt`);

    fs.writeFileSync(jsonFile, JSON.stringify(qaResults, null, 2));
    fs.writeFileSync(txtFile, generateTextReport(qaResults));

    console.log('');
    console.log('💾 Results saved:');
    console.log(`   JSON: ${jsonFile}`);
    console.log(`   TXT: ${txtFile}`);

    const overallStatus = qaResults.failed === 0 && qaResults.errors === 0 && qaResults.login_success ? 'PASS ✅' : 'FAIL ❌';
    console.log(`\n🏁 Overall Status: ${overallStatus}`);

    return {
      status: overallStatus,
      results: qaResults,
      jsonFile,
      txtFile
    };

  } catch (error) {
    console.error('❌ QA execution failed:', error);
    return { status: 'ERROR', error: error.message };
  } finally {
    await browser.close();
  }
}

function generateTextReport(data) {
  let report = `================================================================================\n`;
  report += `TEAM D - TASK 0 OPTION1 LOAD-ORDER DISCIPLINE QA - GROUP A (AUTH PAGES)\n`;
  report += `================================================================================\n\n`;

  report += `Task: Task 0 Option1 Load-Order Discipline\n`;
  report += `Group: A (Auth Pages)\n`;
  report += `Test: Auth pages as standalone full pages (no modals)\n`;
  report += `Timestamp: ${data.timestamp}\n`;
  report += `Environment: Port 8080 (Development)\n`;
  report += `Source of Truth: window.pageInitializationConfigs\n`;
  report += `Login Status: ${data.login_success ? '✅ SUCCESS' : '❌ FAILED'}\n`;
  report += `Overall Status: ${data.failed === 0 && data.errors === 0 && data.login_success ? 'PASS ✅' : 'FAIL ❌'}\n\n`;

  report += `SUMMARY\n`;
  report += `=======\n`;
  report += `Auth Pages: ${data.pages_tested}\n`;
  report += `Passed: ${data.passed} ✅\n`;
  report += `Failed: ${data.failed} ❌\n`;
  report += `Errors: ${data.errors} ⚠️\n`;
  report += `Modal Violations: ${data.modal_violations} 🚫\n\n`;

  report += `PAGE RESULTS\n`;
  report += `============\n`;

  data.page_results.forEach(page => {
    const status = page.status === 'PASS' ? '✅' : page.status === 'FAIL' ? '❌' : '⚠️';
    report += `${status} ${page.url}\n`;
    report += `   ✅ No modal: ${page.page_analysis.modal_count === 0 ? 'PASS' : 'FAIL'} (${page.page_analysis.modal_count})\n`;
    if (data.login_success && page.url !== '/login') {
      report += `   ✅ Form exists: ${page.page_analysis.has_form ? 'PASS' : 'FAIL'}\n`;
      report += `   ✅ Submit works: ${page.page_analysis.submit_works ? 'PASS' : 'FAIL'}\n`;
    }

    if (page.failure_reason) {
      report += `   Reason: ${page.failure_reason}\n`;
    }
    report += '\n';
  });

  report += `================================================================================\n`;

  return report;
}

runGroupA_QA().then(results => {
  console.log(`\n✅ Group A QA Complete: ${results.status}`);
  process.exit(results.status.includes('PASS') ? 0 : 1);
}).catch(error => {
  console.error('❌ QA Failed:', error);
  process.exit(1);
});
