const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = 'documentation/05-REPORTS/artifacts/2026_01_03';

// Page groups as defined in Task 0 Option1 Load-Order Discipline
const PAGE_GROUPS = {
  public: {
    name: 'Public Pages - No Auth Required',
    auth_required: false,
    expected_behavior: 'Load directly, no redirect',
    pages: [
      '/login',
      '/register',
      '/forgot_password',
      '/reset_password'
    ]
  },

  authenticated: {
    name: 'Authenticated Pages - Redirect to Login',
    auth_required: true,
    expected_behavior: 'Redirect to /login.html when unauthenticated',
    pages: [
      '/',  // index
      '/research',
      '/trades',
      '/executions',
      '/alerts',
      '/trade_plans',
      '/tickers',
      '/trading_accounts',
      '/notes',
      '/cash_flows',
      '/trade_history',
      '/trading_journal',
      '/ai_analysis',
      '/watch_lists',
      '/user_profile',
      '/user_management',
      '/ticker_dashboard',
      '/portfolio_state',
      '/data_import',
      '/user_ticker',
      '/preferences',
      '/tag_management'
    ]
  },

  monitor: {
    name: 'Monitor/Admin Pages - Redirect to Login',
    auth_required: true,
    expected_behavior: 'Redirect to /login.html when unauthenticated',
    pages: [
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
    ]
  }
};

let qaResults = {
  timestamp: new Date().toISOString().replace(/:/g, '-').split('.')[0],
  task: 'Task 0 Option1 Load-Order Discipline',
  test_name: 'option1_load_order_discipline_qa',
  environment: 'Port 8080 (Development) - Redirect Only (No Modal)',
  groups: {},
  summary: {
    total_pages_tested: 0,
    total_passed: 0,
    total_failed: 0,
    total_redirects: 0,
    total_no_redirects: 0,
    total_modals: 0
  }
};

async function clearBrowserData(page) {
  try {
    await page.goto('about:blank');
    await new Promise(resolve => setTimeout(resolve, 200));

    await page.evaluate(() => {
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

async function testPageAuthBehavior(page, pageUrl, groupConfig) {
  const result = {
    url: pageUrl,
    group: groupConfig.name,
    auth_required: groupConfig.auth_required,
    expected_behavior: groupConfig.expected_behavior,
    final_url: null,
    redirected: false,
    redirect_url: null,
    modal_count: 0,
    load_time_ms: 0,
    status: 'unknown',
    behavior_match: false,
    failure_reason: null
  };

  const startTime = Date.now();

  try {
    // Navigate to page
    console.log(`Testing: ${pageUrl}`);
    await page.goto(`http://localhost:8080${pageUrl}`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const loadTime = Date.now() - startTime;

    // Wait for potential redirect
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check final state
    const finalUrl = page.url();
    const redirected = finalUrl !== `http://localhost:8080${pageUrl}`;

    // Check for modals (should be 0 for redirect-only QA)
    const modalCount = await page.$$eval('.modal, .modal-backdrop', modals => modals.length).catch(() => 0);

    // Determine if behavior matches expectation
    let behaviorMatch = false;
    let failureReason = null;

    if (groupConfig.auth_required) {
      // Authenticated/monitor pages should redirect to login
      if (redirected && finalUrl.includes('/login.html')) {
        behaviorMatch = true;
      } else {
        behaviorMatch = false;
        failureReason = redirected ?
          `Redirected to ${finalUrl} instead of /login.html` :
          'Should redirect to login but did not';
      }
    } else {
      // Public pages should not redirect
      if (!redirected) {
        behaviorMatch = true;
      } else {
        behaviorMatch = false;
        failureReason = `Public page redirected to ${finalUrl}`;
      }
    }

    // Check for modals (violation in redirect-only QA)
    if (modalCount > 0) {
      behaviorMatch = false;
      failureReason = failureReason ?
        `${failureReason}, found ${modalCount} modals` :
        `Found ${modalCount} modals (redirect-only QA)`;
    }

    // Update result
    result.final_url = finalUrl;
    result.redirected = redirected;
    result.redirect_url = redirected ? finalUrl : null;
    result.modal_count = modalCount;
    result.load_time_ms = loadTime;
    result.behavior_match = behaviorMatch;
    result.failure_reason = failureReason;
    result.status = behaviorMatch ? 'PASS' : 'FAIL';

  } catch (error) {
    result.status = 'ERROR';
    result.error_message = error.message;
    result.load_time_ms = Date.now() - startTime;
  }

  return result;
}

async function runOption1LoadOrderQA() {
  console.log('🎯 Starting Task 0 Option1 Load-Order Discipline QA');
  console.log('📋 Test Focus: Redirect-only behavior across page groups (no modals)');
  console.log('🔒 Auth Groups:');
  console.log('   Public: No auth required (no redirect)');
  console.log('   Authenticated: Auth required (redirect to login)');
  console.log('   Monitor: Auth required (redirect to login)');
  console.log('');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--disable-extensions', '--no-sandbox', '--disable-dev-shm-usage']
  });

  try {
    const page = await browser.newPage();

    // Count total pages
    let totalPages = 0;
    Object.values(PAGE_GROUPS).forEach(group => {
      totalPages += group.pages.length;
    });
    qaResults.summary.total_pages_tested = totalPages;

    console.log(`📊 Total Pages to Test: ${totalPages}`);
    console.log('');

    // Test each group
    for (const [groupKey, groupConfig] of Object.entries(PAGE_GROUPS)) {
      console.log(`🎯 Testing Group: ${groupConfig.name}`);
      console.log(`📄 Pages in group: ${groupConfig.pages.length}`);
      console.log(`🎭 Expected: ${groupConfig.expected_behavior}`);
      console.log('');

      const groupResults = {
        name: groupConfig.name,
        auth_required: groupConfig.auth_required,
        expected_behavior: groupConfig.expected_behavior,
        pages_tested: 0,
        passed: 0,
        failed: 0,
        errors: 0,
        redirects: 0,
        no_redirects: 0,
        modals_found: 0,
        page_results: []
      };

      for (let i = 0; i < groupConfig.pages.length; i++) {
        const pageUrl = groupConfig.pages[i];

        // Clear browser data for clean test
        await clearBrowserData(page);

        const pageResult = await testPageAuthBehavior(page, pageUrl, groupConfig);
        groupResults.page_results.push(pageResult);
        groupResults.pages_tested++;

        // Update counters
        if (pageResult.status === 'PASS') {
          groupResults.passed++;
          qaResults.summary.total_passed++;
        } else if (pageResult.status === 'FAIL') {
          groupResults.failed++;
          qaResults.summary.total_failed++;
        } else {
          groupResults.errors++;
        }

        // Update behavior counters
        if (pageResult.redirected) {
          groupResults.redirects++;
          qaResults.summary.total_redirects++;
        } else {
          groupResults.no_redirects++;
          qaResults.summary.total_no_redirects++;
        }

        if (pageResult.modal_count > 0) {
          groupResults.modals_found += pageResult.modal_count;
          qaResults.summary.total_modals += pageResult.modal_count;
        }

        // Progress indicator
        const status = pageResult.status === 'PASS' ? '✅' : pageResult.status === 'FAIL' ? '❌' : '⚠️';
        const redirect = pageResult.redirected ? ` → ${pageResult.final_url.split('/').pop()}` : '';
        console.log(`  ${status} ${pageUrl}${redirect}`);
        if (pageResult.failure_reason) {
          console.log(`     Reason: ${pageResult.failure_reason}`);
        }
      }

      // Group summary
      const groupPassRate = ((groupResults.passed / groupResults.pages_tested) * 100).toFixed(1);
      console.log('');
      console.log(`📈 Group Summary: ${groupConfig.name}`);
      console.log(`   Status: ${groupResults.failed === 0 ? '✅ PASS' : '❌ FAIL'}`);
      console.log(`   Passed: ${groupResults.passed}/${groupResults.pages_tested} (${groupPassRate}%)`);
      console.log(`   Failed: ${groupResults.failed}`);
      console.log(`   Errors: ${groupResults.errors}`);
      console.log(`   Redirects: ${groupResults.redirects}`);
      console.log(`   No Redirects: ${groupResults.no_redirects}`);
      console.log(`   Modals Found: ${groupResults.modals_found}`);
      console.log('');

      qaResults.groups[groupKey] = groupResults;
    }

    // Overall summary
    console.log('🎯 FINAL QA SUMMARY - Task 0 Option1 Load-Order Discipline');
    console.log('=' .repeat(70));
    console.log(`Total Pages Tested: ${qaResults.summary.total_pages_tested}`);
    console.log(`Overall Pass Rate: ${((qaResults.summary.total_passed / qaResults.summary.total_pages_tested) * 100).toFixed(1)}%`);
    console.log(`Passed: ${qaResults.summary.total_passed} ✅`);
    console.log(`Failed: ${qaResults.summary.total_failed} ❌`);
    console.log(`Errors: ${qaResults.summary.total_pages_tested - qaResults.summary.total_passed - qaResults.summary.total_failed} ⚠️`);
    console.log(`Total Redirects: ${qaResults.summary.total_redirects} ↪️`);
    console.log(`Total No Redirects: ${qaResults.summary.total_no_redirects} 📍`);
    console.log(`Modal Violations: ${qaResults.summary.total_modals} 🚫`);

    // Group summaries
    console.log('');
    console.log('📊 GROUP RESULTS:');
    Object.entries(qaResults.groups).forEach(([key, group]) => {
      const status = group.failed === 0 ? '✅' : '❌';
      const passRate = ((group.passed / group.pages_tested) * 100).toFixed(1);
      console.log(`   ${status} ${group.name}: ${group.passed}/${group.pages_tested} (${passRate}%)`);
    });

    // Save results
    const jsonFile = path.join(EVIDENCE_DIR, `team_d_option1_load_order_discipline_qa_${qaResults.timestamp}.json`);
    const txtFile = path.join(EVIDENCE_DIR, `team_d_option1_load_order_discipline_qa_${qaResults.timestamp}.txt`);

    fs.writeFileSync(jsonFile, JSON.stringify(qaResults, null, 2));
    fs.writeFileSync(txtFile, generateTextReport(qaResults));

    console.log('');
    console.log('💾 Results saved:');
    console.log(`   JSON: ${jsonFile}`);
    console.log(`   TXT: ${txtFile}`);

    const overallStatus = qaResults.summary.total_failed === 0 ? 'PASS ✅' : 'FAIL ❌';
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
  report += `TEAM D - TASK 0 OPTION1 LOAD-ORDER DISCIPLINE QA REPORT\n`;
  report += `================================================================================\n\n`;

  report += `Task: Task 0 Option1 Load-Order Discipline\n`;
  report += `Test: Redirect-only QA across page groups (no modal)\n`;
  report += `Timestamp: ${data.timestamp}\n`;
  report += `Environment: Port 8080 (Development)\n`;
  report += `Overall Status: ${data.summary.total_failed === 0 ? 'PASS ✅' : 'FAIL ❌'}\n\n`;

  report += `SUMMARY\n`;
  report += `=======\n`;
  report += `Total Pages: ${data.summary.total_pages_tested}\n`;
  report += `Passed: ${data.summary.total_passed} ✅\n`;
  report += `Failed: ${data.summary.total_failed} ❌\n`;
  report += `Errors: ${data.summary.total_pages_tested - data.summary.total_passed - data.summary.total_failed} ⚠️\n`;
  report += `Total Redirects: ${data.summary.total_redirects} ↪️\n`;
  report += `Total No Redirects: ${data.summary.total_no_redirects} 📍\n`;
  report += `Modal Violations: ${data.summary.total_modals} 🚫\n\n`;

  Object.entries(data.groups).forEach(([groupKey, group]) => {
    const passRate = ((group.passed / group.pages_tested) * 100).toFixed(1);
    const groupStatus = group.failed === 0 ? 'PASS ✅' : 'FAIL ❌';

    report += `GROUP: ${group.name}\n`;
    report += `Auth Required: ${group.auth_required ? 'Yes' : 'No'}\n`;
    report += `Expected Behavior: ${group.expected_behavior}\n`;
    report += `Status: ${groupStatus}\n`;
    report += `Pages: ${group.pages_tested}, Passed: ${group.passed} (${passRate}%)\n`;
    report += `Failed: ${group.failed}, Errors: ${group.errors}\n`;
    report += `Redirects: ${group.redirects}, No Redirects: ${group.no_redirects}, Modals: ${group.modals_found}\n\n`;

    group.page_results.forEach(page => {
      const status = page.status === 'PASS' ? '✅' : page.status === 'FAIL' ? '❌' : '⚠️';
      const redirect = page.redirected ? ` → ${page.final_url.split('/').pop()}` : '';
      report += `  ${status} ${page.url}${redirect}\n`;
      if (page.failure_reason) {
        report += `     Reason: ${page.failure_reason}\n`;
      }
    });
    report += '\n';
  });

  report += `================================================================================\n`;

  return report;
}

runOption1LoadOrderQA().then(results => {
  console.log(`\n✅ QA Complete: ${results.status}`);
  process.exit(results.status.includes('PASS') ? 0 : 1);
}).catch(error => {
  console.error('❌ QA Failed:', error);
  process.exit(1);
});
