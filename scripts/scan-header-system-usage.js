#!/usr/bin/env node

/**
 * Header & Filters System Usage Scanner
 * Scans all pages for Header System usage and deviations
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const PAGES = {
  main: [
    { html: 'trading-ui/index.html', js: 'trading-ui/scripts/index.js' },
    { html: 'trading-ui/trades.html', js: 'trading-ui/scripts/trades.js' },
    { html: 'trading-ui/trade_plans.html', js: 'trading-ui/scripts/trade_plans.js' },
    { html: 'trading-ui/alerts.html', js: 'trading-ui/scripts/alerts.js' },
    { html: 'trading-ui/tickers.html', js: 'trading-ui/scripts/tickers.js' },
    { html: 'trading-ui/trading_accounts.html', js: 'trading-ui/scripts/trading_accounts.js' },
    { html: 'trading-ui/executions.html', js: 'trading-ui/scripts/executions.js' },
    { html: 'trading-ui/cash_flows.html', js: 'trading-ui/scripts/cash_flows.js' },
    { html: 'trading-ui/notes.html', js: 'trading-ui/scripts/notes.js' },
    { html: 'trading-ui/research.html', js: 'trading-ui/scripts/research.js' },
    { html: 'trading-ui/preferences.html', js: 'trading-ui/scripts/preferences-core-new.js' },
  ],
  technical: [
    { html: 'trading-ui/db_display.html', js: 'trading-ui/scripts/db_display.js' },
    { html: 'trading-ui/db_extradata.html', js: 'trading-ui/scripts/db_extradata.js' },
    { html: 'trading-ui/constraints.html', js: 'trading-ui/scripts/constraints.js' },
    { html: 'trading-ui/background_tasks.html', js: 'trading-ui/scripts/background_tasks.js' },
    { html: 'trading-ui/server_monitor.html', js: 'trading-ui/scripts/server_monitor.js' },
    { html: 'trading-ui/notifications_center.html', js: 'trading-ui/scripts/notifications_center.js' },
    { html: 'trading-ui/css_management.html', js: 'trading-ui/scripts/css_management.js' },
    { html: 'trading-ui/system_management.html', js: 'trading-ui/scripts/system_management.js' },
  ],
  devTools: [
    { html: 'trading-ui/code_quality_dashboard.html', js: 'trading-ui/scripts/code_quality_dashboard.js' },
    { html: 'trading-ui/tag_management.html', js: 'trading-ui/scripts/tag_management.js' },
    { html: 'trading-ui/init_system_management.html', js: 'trading-ui/scripts/init_system_management.js' },
    { html: 'trading-ui/conditions_test.html', js: 'trading-ui/scripts/conditions_test.js' },
    { html: 'trading-ui/test_header_only.html', js: 'trading-ui/scripts/test_header_only.js' },
    { html: 'trading-ui/external_data_dashboard.html', js: 'trading-ui/scripts/external_data_dashboard.js' },
    { html: 'trading-ui/chart_management.html', js: 'trading-ui/scripts/chart_management.js' },
    { html: 'trading-ui/crud_testing_dashboard.html', js: 'trading-ui/scripts/crud_testing_dashboard.js' },
    { html: 'trading-ui/dynamic_colors_display.html', js: 'trading-ui/scripts/dynamic_colors_display.js' },
  ],
  mockups: [
    { html: 'trading-ui/mockups/daily-snapshots/portfolio_state_page.html', js: 'trading-ui/scripts/portfolio_state-page.js' },
    { html: 'trading-ui/mockups/daily-snapshots/trade_history_page.html', js: 'trading-ui/scripts/trade_history-page.js' },
    { html: 'trading-ui/mockups/daily-snapshots/price_history_page.html', js: 'trading-ui/scripts/price-history-page.js' },
    { html: 'trading-ui/mockups/daily-snapshots/comparative_analysis_page.html', js: 'trading-ui/scripts/comparative-analysis-page.js' },
    { html: 'trading-ui/mockups/daily-snapshots/trading_journal_page.html', js: 'trading-ui/scripts/trading_journal-page.js' },
    { html: 'trading-ui/mockups/daily-snapshots/strategy_analysis_page.html', js: 'trading-ui/scripts/strategy_analysis-page.js' },
    { html: 'trading-ui/mockups/daily-snapshots/economic_calendar_page.html', js: 'trading-ui/scripts/economic-calendar-page.js' },
    { html: 'trading-ui/mockups/daily-snapshots/history_widget.html', js: 'trading-ui/scripts/history-widget.js' },
    { html: 'trading-ui/mockups/daily-snapshots/emotional_tracking_widget.html', js: 'trading-ui/scripts/emotional-tracking-widget.js' },
    { html: 'trading-ui/mockups/daily-snapshots/date_comparison_modal.html', js: 'trading-ui/scripts/date-comparison-modal.js' },
    { html: 'trading-ui/mockups/daily-snapshots/tradingview_test_page.html', js: 'trading-ui/scripts/tradingview-test-page.js' },
  ],
};

const results = {
  totalPages: 0,
  pagesWithIssues: 0,
  issues: [],
};

function scanHTML(htmlPath) {
  const issues = [];
  if (!fs.existsSync(htmlPath)) {
    return issues;
  }

  const content = fs.readFileSync(htmlPath, 'utf8');
  const pageName = path.basename(htmlPath, '.html');

  // Check for custom header HTML (not #unified-header)
  const customHeaderPatterns = [
    /<header[^>]*>/gi,
    /<div[^>]*id=["']header["'][^>]*>/gi,
    /<div[^>]*class=["'][^"']*header[^"']*["'][^>]*>/gi,
  ];

  customHeaderPatterns.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches && !content.includes('id="unified-header"')) {
      issues.push({
        type: 'custom-header-html',
        severity: 'high',
        description: `Custom header HTML found (pattern ${index + 1})`,
        location: htmlPath,
      });
    }
  });

  // Check for custom filter HTML (not .header-filters)
  if (content.includes('filter') && !content.includes('headerFilters') && !content.includes('header-filters')) {
    const filterPatterns = [
      /<div[^>]*class=["'][^"']*filter[^"']*["'][^>]*>/gi,
      /<select[^>]*id=["'][^"']*filter[^"']*["'][^>]*>/gi,
    ];
    filterPatterns.forEach((pattern, index) => {
      const matches = content.match(pattern);
      if (matches) {
        issues.push({
          type: 'custom-filter-html',
          severity: 'medium',
          description: `Custom filter HTML found (pattern ${index + 1})`,
          location: htmlPath,
        });
      }
    });
  }

  // Check for header-system.js loading
  if (!content.includes('header-system.js') && !content.includes('header-system')) {
    issues.push({
      type: 'missing-header-system',
      severity: 'high',
      description: 'header-system.js not loaded',
      location: htmlPath,
    });
  }

  return issues;
}

function scanJS(jsPath) {
  const issues = [];
  if (!fs.existsSync(jsPath)) {
    return issues;
  }

  const content = fs.readFileSync(jsPath, 'utf8');
  const pageName = path.basename(jsPath, '.js');

  // Check for local filter management functions
  const localFilterFunctions = [
    /function\s+(handleFilter|applyFilter|selectFilter|updateFilter|toggleFilter|openFilter|closeFilter)[\s(]/gi,
    /const\s+(handleFilter|applyFilter|selectFilter|updateFilter|toggleFilter|openFilter|closeFilter)\s*=/gi,
    /window\.(handleFilter|applyFilter|selectFilter|updateFilter|toggleFilter|openFilter|closeFilter)\s*=/gi,
  ];

  localFilterFunctions.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        type: 'local-filter-function',
        severity: 'high',
        description: `Local filter function found: ${matches[0]}`,
        location: jsPath,
        line: getLineNumber(content, matches.index),
      });
    }
  });

  // Check for local menu management functions
  const localMenuFunctions = [
    /function\s+(openMenu|closeMenu|toggleMenu|handleMenu)[\s(]/gi,
    /const\s+(openMenu|closeMenu|toggleMenu|handleMenu)\s*=/gi,
    /window\.(openMenu|closeMenu|toggleMenu|handleMenu)\s*=/gi,
  ];

  localMenuFunctions.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        type: 'local-menu-function',
        severity: 'high',
        description: `Local menu function found: ${matches[0]}`,
        location: jsPath,
        line: getLineNumber(content, matches.index),
      });
    }
  });

  // Check for direct event listeners on header/filter elements
  const directListeners = [
    /\.addEventListener\(['"]click['"],\s*[^)]*filter/gi,
    /\.addEventListener\(['"]click['"],\s*[^)]*header/gi,
    /\.addEventListener\(['"]mouseenter['"],\s*[^)]*filter/gi,
    /\.addEventListener\(['"]mouseleave['"],\s*[^)]*filter/gi,
    /getElementById\(['"](statusFilter|typeFilter|accountFilter|dateRangeFilter|headerFilter)/gi,
  ];

  directListeners.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches) {
      issues.push({
        type: 'direct-event-listener',
        severity: 'medium',
        description: `Direct event listener on header/filter element: ${matches[0]}`,
        location: jsPath,
        line: getLineNumber(content, matches.index),
      });
    }
  });

  // Check for direct localStorage usage for filters
  const localStoragePatterns = [
    /localStorage\.(getItem|setItem)\(['"]headerFilters/gi,
    /localStorage\.(getItem|setItem)\(['"][^'"]*filter/gi,
  ];

  localStoragePatterns.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches && !content.includes('PageStateManager') && !content.includes('FilterManager')) {
      issues.push({
        type: 'direct-localstorage',
        severity: 'medium',
        description: `Direct localStorage usage for filters: ${matches[0]}`,
        location: jsPath,
        line: getLineNumber(content, matches.index),
      });
    }
  });

  // Check for direct DOM manipulation for filters
  const domManipulationPatterns = [
    /\.style\.display\s*=\s*['"](none|block)['"].*filter/gi,
    /\.classList\.(add|remove)\(['"][^'"]*filter/gi,
    /querySelector\(['"][^'"]*filter/gi,
    /getElementById\(['"](statusFilter|typeFilter|accountFilter|dateRangeFilter)/gi,
  ];

  domManipulationPatterns.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches && !content.includes('FilterManager') && !content.includes('headerSystem')) {
      issues.push({
        type: 'direct-dom-manipulation',
        severity: 'medium',
        description: `Direct DOM manipulation for filters: ${matches[0]}`,
        location: jsPath,
        line: getLineNumber(content, matches.index),
      });
    }
  });

  // Check for manual filter application (not using UnifiedTableSystem)
  const manualFilterPatterns = [
    /\.filter\([^)]*status|type|account|dateRange/gi,
    /filteredData\s*=\s*.*\.filter\(/gi,
  ];

  manualFilterPatterns.forEach((pattern, index) => {
    const matches = content.match(pattern);
    if (matches && !content.includes('UnifiedTableSystem') && !content.includes('FilterManager.applyFilters')) {
      issues.push({
        type: 'manual-filter-application',
        severity: 'high',
        description: `Manual filter application (not using UnifiedTableSystem): ${matches[0]}`,
        location: jsPath,
        line: getLineNumber(content, matches.index),
      });
    }
  });

  // Check for HeaderSystem.initialize() usage
  if (!content.includes('HeaderSystem.initialize') && !content.includes('initializeHeaderSystem')) {
    // This is not necessarily an issue if loaded via package manifest
    // But we'll note it for review
  }

  return issues;
}

function getLineNumber(content, index) {
  return content.substring(0, index).split('\n').length;
}

function scanPage(page) {
  const pageIssues = [];
  
  // Scan HTML
  if (page.html) {
    const htmlIssues = scanHTML(page.html);
    pageIssues.push(...htmlIssues);
  }

  // Scan JS
  if (page.js) {
    const jsIssues = scanJS(page.js);
    pageIssues.push(...jsIssues);
  }

  return pageIssues;
}

// Main scanning
console.log('🔍 Scanning Header & Filters System usage...\n');

Object.keys(PAGES).forEach(category => {
  console.log(`\n📁 Scanning ${category} pages...`);
  PAGES[category].forEach(page => {
    results.totalPages++;
    const pageIssues = scanPage(page);
    if (pageIssues.length > 0) {
      results.pagesWithIssues++;
      results.issues.push({
        page: page.html || page.js,
        category,
        issues: pageIssues,
      });
      console.log(`  ⚠️  ${path.basename(page.html || page.js)}: ${pageIssues.length} issues`);
    } else {
      console.log(`  ✅ ${path.basename(page.html || page.js)}: no issues`);
    }
  });
});

// Generate report
const reportPath = 'documentation/05-REPORTS/HEADER_FILTERS_SYSTEM_DEVIATIONS_REPORT.md';
const reportDir = path.dirname(reportPath);
if (!fs.existsSync(reportDir)) {
  fs.mkdirSync(reportDir, { recursive: true });
}

let report = `# Header & Filters System - דוח סטיות וכפילויות

**תאריך סריקה:** ${new Date().toISOString().split('T')[0]}  
**סה"כ עמודים נסרקו:** ${results.totalPages}  
**עמודים עם בעיות:** ${results.pagesWithIssues}  

---

## סיכום כללי

`;

// Group issues by type
const issuesByType = {};
results.issues.forEach(pageResult => {
  pageResult.issues.forEach(issue => {
    if (!issuesByType[issue.type]) {
      issuesByType[issue.type] = [];
    }
    issuesByType[issue.type].push({
      page: pageResult.page,
      category: pageResult.category,
      ...issue,
    });
  });
});

report += `### סיכום לפי סוג בעיה

| סוג בעיה | כמות | חומרה |
|----------|------|--------|
`;

Object.keys(issuesByType).forEach(type => {
  const count = issuesByType[type].length;
  const severity = issuesByType[type][0].severity;
  report += `| ${type} | ${count} | ${severity} |\n`;
});

report += `\n---\n\n## פירוט לפי עמוד\n\n`;

results.issues.forEach(pageResult => {
  report += `### ${path.basename(pageResult.page)}\n\n`;
  report += `**קטגוריה:** ${pageResult.category}  \n`;
  report += `**סך בעיות:** ${pageResult.issues.length}  \n\n`;

  pageResult.issues.forEach((issue, index) => {
    report += `#### בעיה ${index + 1}: ${issue.type}\n\n`;
    report += `- **חומרה:** ${issue.severity}  \n`;
    report += `- **תיאור:** ${issue.description}  \n`;
    report += `- **מיקום:** ${issue.location}  \n`;
    if (issue.line) {
      report += `- **שורה:** ${issue.line}  \n`;
    }
    report += `\n`;
  });

  report += `---\n\n`;
});

report += `## המלצות לתיקון\n\n`;

Object.keys(issuesByType).forEach(type => {
  report += `### ${type}\n\n`;
  const firstIssue = issuesByType[type][0];
  report += `**חומרה:** ${firstIssue.severity}  \n`;
  report += `**כמות:** ${issuesByType[type].length}  \n\n`;
  
  switch (type) {
    case 'custom-header-html':
      report += `**המלצה:** החלף HTML מותאם אישית ב-\`#unified-header\` דרך \`HeaderSystem.createHeader()\`\n\n`;
      break;
    case 'custom-filter-html':
      report += `**המלצה:** החלף HTML מותאם אישית ב-\`.header-filters\` דרך המערכת המרכזית\n\n`;
      break;
    case 'missing-header-system':
      report += `**המלצה:** הוסף טעינת \`header-system.js\` דרך package manifest\n\n`;
      break;
    case 'local-filter-function':
      report += `**המלצה:** החלף פונקציות מקומיות ב-API של \`FilterManager\`\n\n`;
      break;
    case 'local-menu-function':
      report += `**המלצה:** החלף פונקציות מקומיות ב-API של \`MenuManager\`\n\n`;
      break;
    case 'direct-event-listener':
      report += `**המלצה:** החלף event listeners ישירים ב-event delegation דרך המערכת המרכזית\n\n`;
      break;
    case 'direct-localstorage':
      report += `**המלצה:** החלף שימוש ישיר ב-localStorage ב-\`PageStateManager\` או \`FilterManager\`\n\n`;
      break;
    case 'direct-dom-manipulation':
      report += `**המלצה:** החלף DOM manipulation ישיר ב-API של \`FilterManager\`\n\n`;
      break;
    case 'manual-filter-application':
      report += `**המלצה:** החלף יישום פילטרים ידני ב-\`UnifiedTableSystem.filter.apply()\`\n\n`;
      break;
  }
});

fs.writeFileSync(reportPath, report, 'utf8');

console.log(`\n✅ סריקה הושלמה!`);
console.log(`📊 סה"כ עמודים: ${results.totalPages}`);
console.log(`⚠️  עמודים עם בעיות: ${results.pagesWithIssues}`);
console.log(`📄 דוח נשמר ב: ${reportPath}`);

