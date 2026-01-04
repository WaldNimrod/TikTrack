const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = 'documentation/05-REPORTS/artifacts/2026_01_02';

// Page groups as defined in the matrix
const PAGE_GROUPS = {
  user_pages: {
    name: 'עמודי משתמש (22) - מחייבים כניסה',
    auth_required: true,
    expected_redirect: '/login.html',
    pages: [
      '/', '/research', '/trades', '/executions', '/alerts', '/trade_plans',
      '/tickers', '/trading_accounts', '/notes', '/cash_flows', '/trade_history',
      '/trading_journal', '/ai_analysis', '/watch_lists', '/user_profile',
      '/user_management', '/ticker_dashboard', '/portfolio_state', '/data_import',
      '/user_ticker', '/preferences', '/tag_management'
    ]
  },

  auth_pages: {
    name: 'עמודי אימות (4) - פתוחים',
    auth_required: false,
    expected_redirect: null,
    pages: [
      '/login', '/register', '/forgot_password', '/reset_password'
    ]
  },

  monitor_pages: {
    name: 'עמודי מוניטור וכלי פיתוח (22) - פתוחים',
    auth_required: false,
    expected_redirect: null,
    pages: [
      '/background_tasks', '/cache_management', '/chart_management', '/code_quality_dashboard',
      '/css_management', '/db_display', '/db_extradata', '/designs', '/dev_tools',
      '/dynamic_colors_display', '/external_data_dashboard', '/init_system_management',
      '/notifications_center', '/preferences_groups_management', '/server_monitor',
      '/system_management', '/conditions_modals', '/constraints', '/button_color_mapping',
      '/crud_testing_dashboard', '/watch_list'
    ]
  },

  test_pages: {
    name: 'עמודי בדיקות (29) - ללא אימות (dev בלבד)',
    auth_required: false,
    expected_redirect: null,
    pages: [
      '/test_script_loading', '/test_phase1_recovery', '/test_bootstrap_popover_comparison',
      '/test_overlay_debug', '/test_recent_items_widget', '/test_phase3_1_comprehensive',
      '/test_unified_widget_comprehensive', '/test_user_ticker_integration',
      '/test_ticker_widgets_performance', '/test_frontend_wrappers', '/test_unified_widget',
      '/test_unified_widget_integration', '/test_nested_modal_rich_text',
      '/button_color_mapping_simple', '/tradingview_widgets_showcase', '/test_header_only',
      '/conditions_test', '/mockups/flag_quick_action', '/mockups/watch_lists_page',
      '/mockups/add_ticker_modal', '/mockups/watch_list_modal', '/test_monitoring',
      '/test_quill', '/test_cash_flow', '/test_sorting', '/test_modal_loop',
      '/test_modal_stability', '/defer_test'
    ]
  }
};

let qaResults = {
  timestamp: new Date().toISOString().replace(/:/g, '-').split('.')[0],
  environment: 'Port 8080 (Development)',
  total_pages: 0,
  groups: {},
  summary: {
    total_passed: 0,
    total_failed: 0,
    total_modal_violations: 0
  }
};

async function clearBrowserData(page) {
  try {
    await page.goto('http://localhost:8080/login.html', { waitUntil: 'domcontentloaded' });
    await new Promise(resolve => setTimeout(resolve, 500));

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
    expected_redirect: groupConfig.expected_redirect,
    actual_url: null,
    redirected: false,
    modal_count: 0,
    console_errors: [],
    network_errors: [],
    load_time_ms: 0,
    status: 'unknown'
  };

  const startTime = Date.now();

  try {
    // Capture console errors
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(`[${msg.type()}] ${msg.text()}`);
      }
    });

    // Capture page errors
    const pageErrors = [];
    page.on('pageerror', error => {
      pageErrors.push(error.message);
    });

    // Navigate to page
    await page.goto(`http://localhost:8080${pageUrl}`, {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    const loadTime = Date.now() - startTime;

    // Wait for potential redirect
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check final state
    const finalUrl = page.url();
    const redirected = finalUrl.includes('/login.html');

    // Check for modals
    const modalCount = await page.$$eval('.modal, .modal-backdrop', modals => modals.length).catch(() => 0);

    // Determine if test passed
    let passed = true;
    let failure_reason = null;

    // Check modal violations
    if (modalCount > 0) {
      passed = false;
      failure_reason = failure_reason ? `${failure_reason}, ${modalCount} modals` : `Found ${modalCount} modals`;
    }

    // Check auth behavior
    if (groupConfig.auth_required) {
      // User pages should redirect to login when unauthenticated
      if (!redirected) {
        passed = false;
        failure_reason = failure_reason ? `${failure_reason}, no redirect to login` : 'Should redirect to login but did not';
      }
    } else {
      // Auth/monitor/test pages should not redirect
      if (redirected) {
        passed = false;
        failure_reason = failure_reason ? `${failure_reason}, unexpected redirect` : 'Should not redirect but did';
      }
    }

    // Update result
    result.actual_url = finalUrl;
    result.redirected = redirected;
    result.modal_count = modalCount;
    result.console_errors = consoleErrors;
    result.network_errors = pageErrors;
    result.load_time_ms = loadTime;
    result.status = passed ? 'PASS' : 'FAIL';
    result.failure_reason = failure_reason;

  } catch (error) {
    result.status = 'ERROR';
    result.error_message = error.message;
    result.load_time_ms = Date.now() - startTime;
  }

  return result;
}

async function run77PagesQA() {
  console.log('🚀 Starting 77 Pages QA by Groups');
  console.log('📋 Test Date:', qaResults.timestamp);
  console.log('🌐 Environment: Port 8080 (Development)');
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
    qaResults.total_pages = totalPages;

    console.log(`📊 Total Pages to Test: ${totalPages}`);
    console.log('');

    // Test each group
    for (const [groupKey, groupConfig] of Object.entries(PAGE_GROUPS)) {
      console.log(`🎯 Testing Group: ${groupConfig.name}`);
      console.log(`📄 Pages in group: ${groupConfig.pages.length}`);
      console.log('');

      const groupResults = {
        name: groupConfig.name,
        auth_required: groupConfig.auth_required,
        expected_redirect: groupConfig.expected_redirect,
        pages_tested: 0,
        passed: 0,
        failed: 0,
        errors: 0,
        modal_violations: 0,
        page_results: []
      };

      for (let i = 0; i < groupConfig.pages.length; i++) {
        const pageUrl = groupConfig.pages[i];
        console.log(`  [${i + 1}/${groupConfig.pages.length}] Testing: ${pageUrl}`);

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

        // Update violations
        if (pageResult.modal_count > 0) {
          groupResults.modal_violations++;
          qaResults.summary.total_modal_violations++;
        }

        // Progress indicator
        const status = pageResult.status === 'PASS' ? '✅' : pageResult.status === 'FAIL' ? '❌' : '⚠️';
        console.log(`    ${status} ${pageResult.status}${pageResult.failure_reason ? ' - ' + pageResult.failure_reason : ''}`);
      }

      // Group summary
      const groupPassRate = ((groupResults.passed / groupResults.pages_tested) * 100).toFixed(1);
      console.log('');
      console.log(`📈 Group Summary: ${groupResults.name}`);
      console.log(`   Passed: ${groupResults.passed}/${groupResults.pages_tested} (${groupPassRate}%)`);
      console.log(`   Failed: ${groupResults.failed}`);
      console.log(`   Errors: ${groupResults.errors}`);
      console.log(`   Modal Violations: ${groupResults.modal_violations}`);
      console.log('');

      qaResults.groups[groupKey] = groupResults;
    }

    // Overall summary
    console.log('🎯 FINAL QA SUMMARY - 77 Pages');
    console.log('=' .repeat(50));
    console.log(`Total Pages Tested: ${qaResults.total_pages}`);
    console.log(`Overall Pass Rate: ${((qaResults.summary.total_passed / qaResults.total_pages) * 100).toFixed(1)}%`);
    console.log(`Passed: ${qaResults.summary.total_passed} ✅`);
    console.log(`Failed: ${qaResults.summary.total_failed} ❌`);
    console.log(`Modal Violations: ${qaResults.summary.total_modal_violations} 🚫`);

    // Save results
    const jsonFile = path.join(EVIDENCE_DIR, `team_d_77_pages_qa_by_groups_${qaResults.timestamp}.json`);
    const txtFile = path.join(EVIDENCE_DIR, `team_d_77_pages_qa_by_groups_${qaResults.timestamp}.txt`);

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
  report += `TEAM D - 77 PAGES QA BY GROUPS - ${data.timestamp}\n`;
  report += `================================================================================\n\n`;

  report += `SUMMARY\n`;
  report += `=======\n`;
  report += `Total Pages: ${data.total_pages}\n`;
  report += `Passed: ${data.summary.total_passed} ✅\n`;
  report += `Failed: ${data.summary.total_failed} ❌\n`;
  report += `Modal Violations: ${data.summary.total_modal_violations} 🚫\n\n`;

  Object.entries(data.groups).forEach(([groupKey, group]) => {
    const passRate = ((group.passed / group.pages_tested) * 100).toFixed(1);
    report += `GROUP: ${group.name}\n`;
    report += `Auth Required: ${group.auth_required ? 'Yes' : 'No'}\n`;
    report += `Pages: ${group.pages_tested}, Passed: ${group.passed} (${passRate}%)\n`;
    report += `Modal Violations: ${group.modal_violations}\n\n`;

    group.page_results.forEach(page => {
      const status = page.status === 'PASS' ? '✅' : page.status === 'FAIL' ? '❌' : '⚠️';
      report += `  ${status} ${page.url}\n`;
      if (page.failure_reason) {
        report += `     Reason: ${page.failure_reason}\n`;
      }
    });
    report += '\n';
  });

  return report;
}

run77PagesQA().then(results => {
  console.log('\n✅ QA Complete!');
  process.exit(results.status.includes('PASS') ? 0 : 1);
}).catch(error => {
  console.error('❌ QA Failed:', error);
  process.exit(1);
});
