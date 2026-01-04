const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = 'documentation/05-REPORTS/artifacts/2026_01_03';

// Group B: Monitor/Dev pages - require login, monitor/admin functionality
const GROUP_B_PAGES = [
  '/background_tasks',
  '/cache_management',
  '/chart_management',
  '/code_quality_dashboard',
  '/css_management',
  '/db_display',
  '/db_extradata',
  '/designs',
  '/dev_tools',
  '/dynamic_colors_display',
  '/external_data_dashboard',
  '/init_system_management',
  '/notifications_center',
  '/preferences_groups_management',
  '/server_monitor',
  '/system_management',
  '/conditions_modals',
  '/constraints',
  '/button_color_mapping',
  '/crud_testing_dashboard',
  '/watch_list'
];

let qaResults = {
  timestamp: new Date().toISOString().replace(/:/g, '-').split('.')[0],
  task: 'Task 0 Option1 Load-Order Discipline - Group B (Monitor/Dev Pages)',
  test_name: 'option1_group_b_monitor_dev_pages_qa',
  environment: 'Port 8080 (Development) - Authenticated Session',
  login_credentials: 'admin/admin123',
  source_of_truth: 'window.pageInitializationConfigs',
  group: 'B',
  group_name: 'Monitor/Dev Pages - Require Login',
  expected_behavior: 'Monitor and development pages load cleanly when authenticated',
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

async function testMonitorDevPage(page, pageUrl, isAuthenticated = false) {
  const result = {
    url: pageUrl,
    final_url: null,
    load_time_ms: 0,
    status: 'unknown',
    behavior_match: false,
    failure_reason: null,
    page_analysis: {
      title: null,
      has_content: false,
      modal_count: 0,
      has_functionality: false,
      console_errors: 0,
      network_errors: 0,
      load_success: false
    }
  };

  const startTime = Date.now();

  try {
    console.log(`Testing monitor/dev page: ${pageUrl}`);

    // Navigate to monitor/dev page
    await page.goto(`http://localhost:8080${pageUrl}`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Wait for potential content loading
    await new Promise(resolve => setTimeout(resolve, 3000));

    const loadTime = Date.now() - startTime;
    const finalUrl = page.url();

    // Analyze page as monitor/dev page
    const analysis = await page.evaluate(() => {
      const result = {
        title: document.title,
        has_content: document.body && document.body.textContent.trim().length > 0,
        modal_count: document.querySelectorAll('.modal, .modal-backdrop, .modal-dialog, .modal-content').length,
        has_functionality: false,
        console_errors: 0,
        network_errors: 0,
        load_success: document.readyState === 'complete'
      };

      // Check for basic functionality indicators (forms, buttons, tables, etc.)
      const hasForms = document.querySelectorAll('form').length > 0;
      const hasButtons = document.querySelectorAll('button:not(.modal button)').length > 0;
      const hasTables = document.querySelectorAll('table').length > 0;
      const hasInputs = document.querySelectorAll('input:not(.modal input)').length > 0;
      const hasLists = document.querySelectorAll('ul, ol').length > 0;
      const hasCodeElements = document.querySelectorAll('pre, code').length > 0;

      result.has_functionality = hasForms || hasButtons || hasTables || hasInputs || hasLists || hasCodeElements;

      return result;
    }, pageUrl);

    // Check for console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Check for network errors
    const networkErrors = [];
    page.on('response', response => {
      if (!response.ok() && response.status() >= 400) {
        networkErrors.push(`${response.status()} ${response.url()}`);
      }
    });

    // Wait a bit more for any async errors
    await new Promise(resolve => setTimeout(resolve, 1000));

    analysis.console_errors = consoleErrors.length;
    analysis.network_errors = networkErrors.length;

    // Determine if test passed
    let passed = true;
    let failure_reason = null;

    // When authenticated, monitor/dev pages should load
    if (!analysis.load_success) {
      passed = false;
      failure_reason = 'Page did not load successfully';
    }

    // Should have content
    if (!analysis.has_content) {
      passed = false;
      failure_reason = failure_reason ? `${failure_reason}, no content` : 'No page content';
    }

    // Should have some functionality
    if (!analysis.has_functionality) {
      passed = false;
      failure_reason = failure_reason ? `${failure_reason}, no functionality` : 'No monitor/dev functionality detected';
    }

    // Should not have excessive modals (monitor/dev pages might have some intentional modals)
    if (analysis.modal_count > 5) { // Allow some modals for functionality
      passed = false;
      failure_reason = failure_reason ? `${failure_reason}, excessive modals (${analysis.modal_count})` : `Too many modals (${analysis.modal_count})`;
    }

    // Should not have console errors
    if (analysis.console_errors > 0) {
      passed = false;
      failure_reason = failure_reason ? `${failure_reason}, ${analysis.console_errors} console errors` : `${analysis.console_errors} console errors`;
    }

    // Update result
    result.final_url = finalUrl;
    result.load_time_ms = loadTime;
    result.page_analysis = analysis;
    result.behavior_match = passed;
    result.failure_reason = failure_reason;
    result.status = passed ? 'PASS' : 'FAIL';

    if (analysis.modal_count > 0) {
      qaResults.modal_violations += analysis.modal_count;
    }

  } catch (error) {
    result.status = 'ERROR';
    result.error_message = error.message;
    result.load_time_ms = Date.now() - startTime;
  }

  return result;
}

async function runGroupB_QA() {
  console.log('🎯 Starting Task 0 Option1 Load-Order Discipline QA - Group B (Monitor/Dev Pages)');
  console.log('📋 Group B: Monitor and development pages requiring authentication');
  console.log('🔐 Login Credentials: admin/admin123');
  console.log('📊 Source of Truth: window.pageInitializationConfigs');
  console.log('🎭 Expected: Monitor/dev pages load with functionality when authenticated');
  console.log('');

  console.log('📄 Group B Pages to Test:');
  GROUP_B_PAGES.forEach(page => console.log(`   - ${page}`));
  console.log('');

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--disable-extensions',
      '--no-sandbox',
      '--disable-dev-shm-usage'
    ]
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

    console.log('✅ Login successful, proceeding with Group B monitor/dev page tests\n');

    // Test Group B monitor/dev pages
    console.log('🎯 Testing Group B: Monitor/Dev Pages');

    for (let i = 0; i < GROUP_B_PAGES.length; i++) {
      const pageUrl = GROUP_B_PAGES[i];

      // Clear cache before each page navigation
      await page.evaluate(() => {
        try {
          localStorage.clear();
          sessionStorage.clear();
          if ('caches' in window) {
            caches.keys().then(names => {
              names.forEach(name => caches.delete(name));
            });
          }
        } catch (e) {
          // Ignore cache clear errors
        }
      });

      const pageResult = await testMonitorDevPage(page, pageUrl, loginSuccess);
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
      console.log(`     Title: "${pageResult.page_analysis.title}"`);
      console.log(`     Load Success: ${pageResult.page_analysis.load_success ? 'YES' : 'NO'}`);
      console.log(`     Has Content: ${pageResult.page_analysis.has_content ? 'YES' : 'NO'}`);
      console.log(`     Has Functionality: ${pageResult.page_analysis.has_functionality ? 'YES' : 'NO'}`);
      console.log(`     Modals: ${pageResult.page_analysis.modal_count}`);
      console.log(`     Console Errors: ${pageResult.page_analysis.console_errors}`);
      console.log(`     Network Errors: ${pageResult.page_analysis.network_errors}`);

      if (pageResult.failure_reason) {
        console.log(`     Reason: ${pageResult.failure_reason}`);
      }
      console.log('');
    }

    // Overall summary
    console.log('🎯 GROUP B QA SUMMARY - Monitor/Dev Pages');
    console.log('=' .repeat(75));
    console.log(`Login Status: ${qaResults.login_success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Monitor/Dev Pages Tested: ${qaResults.pages_tested}`);
    console.log(`Pass Rate: ${((qaResults.passed / qaResults.pages_tested) * 100).toFixed(1)}%`);
    console.log(`Passed: ${qaResults.passed} ✅`);
    console.log(`Failed: ${qaResults.failed} ❌`);
    console.log(`Errors: ${qaResults.errors} ⚠️`);
    console.log(`Modal Violations: ${qaResults.modal_violations} 🚫`);

    // Analysis
    console.log('');
    console.log('📊 ANALYSIS:');
    const failedPages = qaResults.page_results.filter(r => r.status === 'FAIL');
    const errorPages = qaResults.page_results.filter(r => r.status === 'ERROR');
    const highModalPages = qaResults.page_results.filter(r => r.page_analysis.modal_count > 5);
    const errorPagesList = qaResults.page_results.filter(r => r.page_analysis.console_errors > 0);

    if (failedPages.length > 0) {
      console.log(`❌ Failed pages: ${failedPages.map(p => p.url).join(', ')}`);
    }
    if (errorPages.length > 0) {
      console.log(`⚠️ Error pages: ${errorPages.map(p => p.url).join(', ')}`);
    }
    if (highModalPages.length > 0) {
      console.log(`🚫 High modal pages: ${highModalPages.map(p => `${p.url}(${p.page_analysis.modal_count})`).join(', ')}`);
    }
    if (errorPagesList.length > 0) {
      console.log(`🔧 Console error pages: ${errorPagesList.map(p => `${p.url}(${p.page_analysis.console_errors})`).join(', ')}`);
    }

    // Save results
    const jsonFile = path.join(EVIDENCE_DIR, `team_d_option1_group_b_monitor_dev_pages_qa_${qaResults.timestamp}.json`);
    const txtFile = path.join(EVIDENCE_DIR, `team_d_option1_group_b_monitor_dev_pages_qa_${qaResults.timestamp}.txt`);

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
  report += `TEAM D - TASK 0 OPTION1 LOAD-ORDER DISCIPLINE QA - GROUP B (MONITOR/DEV PAGES)\n`;
  report += `================================================================================\n\n`;

  report += `Task: Task 0 Option1 Load-Order Discipline\n`;
  report += `Group: B (Monitor/Dev Pages)\n`;
  report += `Test: Monitor and development pages functionality\n`;
  report += `Timestamp: ${data.timestamp}\n`;
  report += `Environment: Port 8080 (Development)\n`;
  report += `Source of Truth: window.pageInitializationConfigs\n`;
  report += `Login Status: ${data.login_success ? '✅ SUCCESS' : '❌ FAILED'}\n`;
  report += `Overall Status: ${data.failed === 0 && data.errors === 0 && data.login_success ? 'PASS ✅' : 'FAIL ❌'}\n\n`;

  report += `SUMMARY\n`;
  report += `=======\n`;
  report += `Monitor/Dev Pages: ${data.pages_tested}\n`;
  report += `Passed: ${data.passed} ✅\n`;
  report += `Failed: ${data.failed} ❌\n`;
  report += `Errors: ${data.errors} ⚠️\n`;
  report += `Modal Violations: ${data.modal_violations} 🚫\n\n`;

  report += `PAGE RESULTS\n`;
  report += `============\n`;

  data.page_results.forEach(page => {
    const status = page.status === 'PASS' ? '✅' : page.status === 'FAIL' ? '❌' : '⚠️';
    report += `${status} ${page.url}\n`;
    report += `   Title: "${page.page_analysis.title}"\n`;
    report += `   Load Time: ${page.load_time_ms}ms\n`;
    report += `   Load Success: ${page.page_analysis.load_success ? 'YES' : 'NO'}\n`;
    report += `   Has Content: ${page.page_analysis.has_content ? 'YES' : 'NO'}\n`;
    report += `   Has Functionality: ${page.page_analysis.has_functionality ? 'YES' : 'NO'}\n`;
    report += `   Modals: ${page.page_analysis.modal_count}\n`;
    report += `   Console Errors: ${page.page_analysis.console_errors}\n`;
    report += `   Network Errors: ${page.page_analysis.network_errors}\n`;

    if (page.failure_reason) {
      report += `   Reason: ${page.failure_reason}\n`;
    }
    report += '\n';
  });

  report += `================================================================================\n`;

  return report;
}

runGroupB_QA().then(results => {
  console.log(`\n✅ Group B QA Complete: ${results.status}`);
  process.exit(results.status.includes('PASS') ? 0 : 1);
}).catch(error => {
  console.error('❌ QA Failed:', error);
  process.exit(1);
});
