#!/usr/bin/env node

/**
 * Comprehensive Header & Filters System Test
 * Tests all pages for Header System compliance
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:8080';
const PAGES = [
  // Main pages
  'index.html',
  'trades.html',
  'trade_plans.html',
  'alerts.html',
  'tickers.html',
  'trading_accounts.html',
  'executions.html',
  'cash_flows.html',
  'notes.html',
  'research.html',
  'preferences.html',
  
  // Technical pages
  'db_display.html',
  'db_extradata.html',
  'constraints.html',
  'background-tasks.html',
  'server-monitor.html',
  'notifications-center.html',
  'css-management.html',
  'system-management.html',
  
  // Dev tools pages
  'code-quality-dashboard.html',
  'tag-management.html',
  'init-system-management.html',
  'conditions-test.html',
  'test-header-only.html',
  'external-data-dashboard.html',
  'chart-management.html',
  'crud-testing-dashboard.html',
  'dynamic-colors-display.html',
];

async function testPage(browser, pagePath) {
  const page = await browser.newPage();
  const results = {
    page: pagePath,
    url: `${BASE_URL}/${pagePath}`,
    passed: false,
    checks: {},
    errors: [],
  };

  try {
    await page.goto(results.url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000); // Wait for initialization

    // Check 1: Unified header exists
    const unifiedHeader = await page.$('#unified-header');
    results.checks.unifiedHeader = !!unifiedHeader;

    // Check 2: HeaderSystem is available
    const headerSystem = await page.evaluate(() => typeof window.HeaderSystem !== 'undefined');
    results.checks.headerSystem = headerSystem;

    // Check 3: FilterManager is available
    const filterManager = await page.evaluate(() => 
      typeof window.headerSystem !== 'undefined' && 
      typeof window.headerSystem.filterManager !== 'undefined'
    );
    results.checks.filterManager = filterManager;

    // Check 4: UnifiedTableSystem is available
    const unifiedTableSystem = await page.evaluate(() => 
      typeof window.UnifiedTableSystem !== 'undefined'
    );
    results.checks.unifiedTableSystem = unifiedTableSystem;

    // Check 5: Tables have data-table-type
    const tablesWithType = await page.evaluate(() => {
      const tables = document.querySelectorAll('table[data-table-type]');
      return tables.length;
    });
    results.checks.tablesWithType = tablesWithType;

    // Check 6: No console errors related to HeaderSystem
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error' && msg.text().includes('HeaderSystem')) {
        consoleErrors.push(msg.text());
      }
    });

    // Check 7: Filter buttons are clickable
    const filterToggleExists = await page.$('.header-filter-toggle-btn, #headerFilterToggleBtnMain, #headerFilterToggleBtnSecondary');
    results.checks.filterToggleExists = !!filterToggleExists;

    // Overall pass if all critical checks pass
    results.passed = 
      results.checks.unifiedHeader &&
      results.checks.headerSystem &&
      results.checks.filterManager &&
      results.checks.unifiedTableSystem;

    if (consoleErrors.length > 0) {
      results.errors = consoleErrors;
    }

  } catch (error) {
    results.errors.push(error.message);
    results.passed = false;
  } finally {
    await page.close();
  }

  return results;
}

async function main() {
  console.log('🧪 Starting comprehensive Header & Filters System tests...\n');

  const browser = await chromium.launch({ headless: true });
  const allResults = [];

  for (const pagePath of PAGES) {
    console.log(`Testing: ${pagePath}...`);
    const result = await testPage(browser, pagePath);
    allResults.push(result);
    
    const status = result.passed ? '✅' : '❌';
    console.log(`  ${status} ${pagePath}`);
  }

  await browser.close();

  // Generate report
  const passed = allResults.filter(r => r.passed).length;
  const failed = allResults.filter(r => !r.passed).length;
  const total = allResults.length;

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      total,
      passed,
      failed,
      successRate: `${Math.round((passed / total) * 100)}%`,
    },
    results: allResults,
  };

  const reportPath = path.join(__dirname, '../documentation/05-REPORTS/HEADER_FILTERS_SYSTEM_COMPREHENSIVE_TEST.md');
  const reportContent = `# Header & Filters System - דוח בדיקות מקיף

**תאריך בדיקה:** ${new Date().toLocaleString('he-IL')}  
**סה"כ עמודים נבדקו:** ${total}  
**עמודים שעברו:** ${passed} ✅  
**עמודים שנכשלו:** ${failed} ❌  
**אחוז הצלחה:** ${report.summary.successRate}

---

## סיכום לפי קטגוריה

| קטגוריה | סה"כ | עברו | נכשלו | אחוז הצלחה |
|----------|------|------|--------|-------------|
| עמודים מרכזיים | ${PAGES.filter(p => ['index.html', 'trades.html', 'trade_plans.html', 'alerts.html', 'tickers.html', 'trading_accounts.html', 'executions.html', 'cash_flows.html', 'notes.html', 'research.html', 'preferences.html'].includes(p)).length} | ${allResults.filter((r, i) => ['index.html', 'trades.html', 'trade_plans.html', 'alerts.html', 'tickers.html', 'trading_accounts.html', 'executions.html', 'cash_flows.html', 'notes.html', 'research.html', 'preferences.html'].includes(PAGES[i]) && r.passed).length} | ${allResults.filter((r, i) => ['index.html', 'trades.html', 'trade_plans.html', 'alerts.html', 'tickers.html', 'trading_accounts.html', 'executions.html', 'cash_flows.html', 'notes.html', 'research.html', 'preferences.html'].includes(PAGES[i]) && !r.passed).length} | ${Math.round((allResults.filter((r, i) => ['index.html', 'trades.html', 'trade_plans.html', 'alerts.html', 'tickers.html', 'trading_accounts.html', 'executions.html', 'cash_flows.html', 'notes.html', 'research.html', 'preferences.html'].includes(PAGES[i]) && r.passed).length / PAGES.filter(p => ['index.html', 'trades.html', 'trade_plans.html', 'alerts.html', 'tickers.html', 'trading_accounts.html', 'executions.html', 'cash_flows.html', 'notes.html', 'research.html', 'preferences.html'].includes(p)).length) * 100)}% |
| עמודים טכניים | ${PAGES.filter(p => ['db_display.html', 'db_extradata.html', 'constraints.html', 'background-tasks.html', 'server-monitor.html', 'notifications-center.html', 'css-management.html', 'system-management.html'].includes(p)).length} | ${allResults.filter((r, i) => ['db_display.html', 'db_extradata.html', 'constraints.html', 'background-tasks.html', 'server-monitor.html', 'notifications-center.html', 'css-management.html', 'system-management.html'].includes(PAGES[i]) && r.passed).length} | ${allResults.filter((r, i) => ['db_display.html', 'db_extradata.html', 'constraints.html', 'background-tasks.html', 'server-monitor.html', 'notifications-center.html', 'css-management.html', 'system-management.html'].includes(PAGES[i]) && !r.passed).length} | ${Math.round((allResults.filter((r, i) => ['db_display.html', 'db_extradata.html', 'constraints.html', 'background-tasks.html', 'server-monitor.html', 'notifications-center.html', 'css-management.html', 'system-management.html'].includes(PAGES[i]) && r.passed).length / PAGES.filter(p => ['db_display.html', 'db_extradata.html', 'constraints.html', 'background-tasks.html', 'server-monitor.html', 'notifications-center.html', 'css-management.html', 'system-management.html'].includes(p)).length) * 100)}% |
| כלי פיתוח | ${PAGES.filter(p => ['code-quality-dashboard.html', 'tag-management.html', 'init-system-management.html', 'conditions-test.html', 'test-header-only.html', 'external-data-dashboard.html', 'chart-management.html', 'crud-testing-dashboard.html', 'dynamic-colors-display.html'].includes(p)).length} | ${allResults.filter((r, i) => ['code-quality-dashboard.html', 'tag-management.html', 'init-system-management.html', 'conditions-test.html', 'test-header-only.html', 'external-data-dashboard.html', 'chart-management.html', 'crud-testing-dashboard.html', 'dynamic-colors-display.html'].includes(PAGES[i]) && r.passed).length} | ${allResults.filter((r, i) => ['code-quality-dashboard.html', 'tag-management.html', 'init-system-management.html', 'conditions-test.html', 'test-header-only.html', 'external-data-dashboard.html', 'chart-management.html', 'crud-testing-dashboard.html', 'dynamic-colors-display.html'].includes(PAGES[i]) && !r.passed).length} | ${Math.round((allResults.filter((r, i) => ['code-quality-dashboard.html', 'tag-management.html', 'init-system-management.html', 'conditions-test.html', 'test-header-only.html', 'external-data-dashboard.html', 'chart-management.html', 'crud-testing-dashboard.html', 'dynamic-colors-display.html'].includes(PAGES[i]) && r.passed).length / PAGES.filter(p => ['code-quality-dashboard.html', 'tag-management.html', 'init-system-management.html', 'conditions-test.html', 'test-header-only.html', 'external-data-dashboard.html', 'chart-management.html', 'crud-testing-dashboard.html', 'dynamic-colors-display.html'].includes(p)).length) * 100)}% |

---

## פירוט לפי עמוד

${allResults.map((result, index) => {
  const status = result.passed ? '✅' : '❌';
  return `### ${status} ${result.page}

**קטגוריה:** ${PAGES[index] === 'index.html' || PAGES[index] === 'trades.html' || PAGES[index] === 'trade_plans.html' || PAGES[index] === 'alerts.html' || PAGES[index] === 'tickers.html' || PAGES[index] === 'trading_accounts.html' || PAGES[index] === 'executions.html' || PAGES[index] === 'cash_flows.html' || PAGES[index] === 'notes.html' || PAGES[index] === 'research.html' || PAGES[index] === 'preferences.html' ? 'עמודים מרכזיים' : PAGES[index] === 'db_display.html' || PAGES[index] === 'db_extradata.html' || PAGES[index] === 'constraints.html' || PAGES[index] === 'background-tasks.html' || PAGES[index] === 'server-monitor.html' || PAGES[index] === 'notifications-center.html' || PAGES[index] === 'css-management.html' || PAGES[index] === 'system-management.html' ? 'עמודים טכניים' : 'כלי פיתוח'}  
**סטטוס כללי:** ${result.passed ? 'עבר' : 'נכשל'}

#### בדיקות:

- **${result.checks.unifiedHeader ? '✅' : '❌'} Unified Header:** ${result.checks.unifiedHeader ? 'קיים' : 'חסר'}
- **${result.checks.headerSystem ? '✅' : '❌'} HeaderSystem:** ${result.checks.headerSystem ? 'זמין' : 'לא זמין'}
- **${result.checks.filterManager ? '✅' : '❌'} FilterManager:** ${result.checks.filterManager ? 'זמין' : 'לא זמין'}
- **${result.checks.unifiedTableSystem ? '✅' : '❌'} UnifiedTableSystem:** ${result.checks.unifiedTableSystem ? 'זמין' : 'לא זמין'}
- **${result.checks.tablesWithType > 0 ? '✅' : '⚠️'} Tables with data-table-type:** ${result.checks.tablesWithType} טבלאות
- **${result.checks.filterToggleExists ? '✅' : '❌'} Filter Toggle Button:** ${result.checks.filterToggleExists ? 'קיים' : 'חסר'}

${result.errors.length > 0 ? `#### שגיאות:\n\n${result.errors.map(e => `- ${e}`).join('\n')}\n` : ''}

---`;
}).join('\n\n')}

## סיכום

- **עמודים שעברו:** ${passed}/${total} (${report.summary.successRate})
- **עמודים שנכשלו:** ${failed}/${total}
- **עמודים ללא טבלאות:** ${allResults.filter(r => r.checks.tablesWithType === 0).length}

## המלצות

${failed > 0 ? `- יש לבדוק את ${failed} העמודים שנכשלו ולתקן את הבעיות שזוהו\n` : ''}
- יש לוודא שכל העמודים משתמשים ב-HeaderSystem ו-UnifiedTableSystem
- יש לוודא שכל הטבלאות כוללות data-table-type
- יש לוודא שכפתור הפילטר קיים ופועל בכל העמודים
`;

  fs.writeFileSync(reportPath, reportContent, 'utf8');

  console.log(`\n✅ Tests completed!`);
  console.log(`   Passed: ${passed}/${total} (${report.summary.successRate})`);
  console.log(`   Failed: ${failed}/${total}`);
  console.log(`\n📄 Report saved to: ${reportPath}`);
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testPage, main };







