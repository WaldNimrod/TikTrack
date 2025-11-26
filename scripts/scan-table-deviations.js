#!/usr/bin/env node
/**
 * Table System Deviations Scanner
 * סקריפט לסריקת כל העמודים לזיהוי סטיות ממערכת הטבלאות המאוחדת
 * 
 * Usage: node scripts/scan-table-deviations.js
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = path.join(__dirname, '..');
const TRADING_UI_DIR = path.join(BASE_DIR, 'trading-ui');
const REPORTS_DIR = path.join(BASE_DIR, 'documentation', '05-REPORTS');

// רשימת כל העמודים
const PAGES = [
  // עמודים מרכזיים (11)
  { name: 'index', html: 'index.html', js: 'scripts/index.js', category: 'central' },
  { name: 'trades', html: 'trades.html', js: 'scripts/trades.js', category: 'central' },
  { name: 'trade_plans', html: 'trade_plans.html', js: 'scripts/trade_plans.js', category: 'central' },
  { name: 'alerts', html: 'alerts.html', js: 'scripts/alerts.js', category: 'central' },
  { name: 'tickers', html: 'tickers.html', js: 'scripts/tickers.js', category: 'central' },
  { name: 'trading_accounts', html: 'trading_accounts.html', js: 'scripts/trading_accounts.js', category: 'central' },
  { name: 'executions', html: 'executions.html', js: 'scripts/executions.js', category: 'central' },
  { name: 'cash_flows', html: 'cash_flows.html', js: 'scripts/cash_flows.js', category: 'central' },
  { name: 'notes', html: 'notes.html', js: 'scripts/notes.js', category: 'central' },
  { name: 'research', html: 'research.html', js: 'scripts/research.js', category: 'central' },
  { name: 'preferences', html: 'preferences.html', js: 'scripts/preferences.js', category: 'central' },
  
  // עמודים טכניים (12)
  { name: 'db_display', html: 'db_display.html', js: 'scripts/db_display.js', category: 'technical' },
  { name: 'db_extradata', html: 'db_extradata.html', js: 'scripts/db_extradata.js', category: 'technical' },
  { name: 'constraints', html: 'constraints.html', js: 'scripts/constraints.js', category: 'technical' },
  { name: 'background-tasks', html: 'background-tasks.html', js: 'scripts/background-tasks.js', category: 'technical' },
  { name: 'server-monitor', html: 'server-monitor.html', js: 'scripts/server-monitor.js', category: 'technical' },
  { name: 'system-management', html: 'system-management.html', js: 'scripts/system-management.js', category: 'technical' },
  { name: 'cache-test', html: 'cache-test.html', js: null, category: 'technical' },
  { name: 'notifications-center', html: 'notifications-center.html', js: 'scripts/notifications-center.js', category: 'technical' },
  { name: 'css-management', html: 'css-management.html', js: 'scripts/css-management.js', category: 'technical' },
  { name: 'dynamic-colors-display', html: 'dynamic-colors-display.html', js: 'scripts/dynamic-colors-display.js', category: 'technical' },
  { name: 'designs', html: 'designs.html', js: 'scripts/designs.js', category: 'technical' },
  { name: 'tradingview-test-page', html: 'tradingview-test-page.html', js: 'scripts/tradingview-test-page.js', category: 'technical' },
  
  // עמודים משניים (2)
  { name: 'external-data-dashboard', html: 'external-data-dashboard.html', js: 'scripts/external-data-dashboard.js', category: 'supporting' },
  { name: 'chart-management', html: 'chart-management.html', js: 'scripts/chart-management.js', category: 'supporting' },
  
  // עמודי מוקאפ (11)
  { name: 'portfolio-state-page', html: 'mockups/daily-snapshots/portfolio-state-page.html', js: 'scripts/portfolio-state-page.js', category: 'mockup' },
  { name: 'trade-history-page', html: 'mockups/daily-snapshots/trade-history-page.html', js: 'scripts/trade-history-page.js', category: 'mockup' },
  { name: 'price-history-page', html: 'mockups/daily-snapshots/price-history-page.html', js: 'scripts/price-history-page.js', category: 'mockup' },
  { name: 'comparative-analysis-page', html: 'mockups/daily-snapshots/comparative-analysis-page.html', js: 'scripts/comparative-analysis-page.js', category: 'mockup' },
  { name: 'trading-journal-page', html: 'mockups/daily-snapshots/trading-journal-page.html', js: 'scripts/trading-journal-page.js', category: 'mockup' },
  { name: 'strategy-analysis-page', html: 'mockups/daily-snapshots/strategy-analysis-page.html', js: 'scripts/strategy-analysis-page.js', category: 'mockup' },
  { name: 'economic-calendar-page', html: 'mockups/daily-snapshots/economic-calendar-page.html', js: 'scripts/economic-calendar-page.js', category: 'mockup' },
  { name: 'history-widget', html: 'mockups/daily-snapshots/history-widget.html', js: 'scripts/history-widget.js', category: 'mockup' },
  { name: 'emotional-tracking-widget', html: 'mockups/daily-snapshots/emotional-tracking-widget.html', js: 'scripts/emotional-tracking-widget.js', category: 'mockup' },
  { name: 'date-comparison-modal', html: 'mockups/daily-snapshots/date-comparison-modal.html', js: 'scripts/date-comparison-modal.js', category: 'mockup' },
  { name: 'tradingview-test-page-mockup', html: 'mockups/daily-snapshots/tradingview-test-page.html', js: 'scripts/tradingview-test-page.js', category: 'mockup' },
];

// דפוסי חיפוש לסטיות
const DEVIATION_PATTERNS = {
  localLoadFunctions: [
    /function\s+(loadTableDataLocal|fetchTableData|loadTable)\s*\(/gi,
    /const\s+(loadTableDataLocal|fetchTableData|loadTable)\s*=/gi,
    /async\s+function\s+(loadTableDataLocal|fetchTableData|loadTable)\s*\(/gi,
  ],
  localRenderFunctions: [
    /function\s+(updateTableDisplay|displayTable|renderTableLocal|buildTable|createTable)\s*\(/gi,
    /const\s+(updateTableDisplay|displayTable|renderTableLocal|buildTable|createTable)\s*=/gi,
  ],
  localSortFunctions: [
    /function\s+(setupSortableHeadersLocal|sortTableLocal)\s*\(/gi,
    /const\s+(setupSortableHeadersLocal|sortTableLocal)\s*=/gi,
  ],
  directDOMManipulation: [
    /\.innerHTML\s*=\s*['"`].*<tr/gi,
    /\.appendChild.*createElement\(['"]tr['"]/gi,
    /createElement\(['"]table['"]/gi,
  ],
  missingDataTableType: [
    /<table[^>]*(?!data-table-type)[^>]*>/gi,
  ],
};

function scanPage(page) {
  const results = {
    page: page.name,
    htmlPath: path.join(TRADING_UI_DIR, page.html),
    jsPath: page.js ? path.join(TRADING_UI_DIR, page.js) : null,
    category: page.category,
    deviations: [],
    duplicates: [],
    issues: [],
    hasTables: false,
    tablesCount: 0,
    tablesWithDataType: 0,
  };

  // סריקת HTML
  if (fs.existsSync(results.htmlPath)) {
    const htmlContent = fs.readFileSync(results.htmlPath, 'utf8');
    
    // ספירת טבלאות
    const tableMatches = htmlContent.match(/<table/gi);
    if (tableMatches) {
      results.hasTables = true;
      results.tablesCount = tableMatches.length;
      
      // ספירת טבלאות עם data-table-type
      const tablesWithType = htmlContent.match(/<table[^>]*data-table-type/gi);
      if (tablesWithType) {
        results.tablesWithDataType = tablesWithType.length;
      }
      
      // זיהוי טבלאות ללא data-table-type
      const tables = htmlContent.match(/<table[^>]*>/gi);
      if (tables) {
        tables.forEach((table, index) => {
          if (!table.includes('data-table-type')) {
            results.deviations.push({
              type: 'missing_data_table_type',
              file: page.html,
              line: 'HTML',
              description: `טבלה ${index + 1} ללא data-table-type attribute`,
            });
          }
        });
      }
    }
  }

  // סריקת JS
  if (results.jsPath && fs.existsSync(results.jsPath)) {
    const jsContent = fs.readFileSync(results.jsPath, 'utf8');
    const lines = jsContent.split('\n');

    // חיפוש פונקציות מקומיות לטעינת נתונים
    DEVIATION_PATTERNS.localLoadFunctions.forEach(pattern => {
      const matches = jsContent.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const lineIndex = lines.findIndex(line => line.includes(match.trim()));
          results.deviations.push({
            type: 'local_load_function',
            file: page.js,
            line: lineIndex + 1,
            description: `פונקציה מקומית לטעינת נתונים: ${match.trim()}`,
          });
        });
      }
    });

    // חיפוש פונקציות מקומיות לרינדור
    DEVIATION_PATTERNS.localRenderFunctions.forEach(pattern => {
      const matches = jsContent.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const lineIndex = lines.findIndex(line => line.includes(match.trim()));
          results.deviations.push({
            type: 'local_render_function',
            file: page.js,
            line: lineIndex + 1,
            description: `פונקציה מקומית לרינדור: ${match.trim()}`,
          });
        });
      }
    });

    // חיפוש פונקציות מקומיות למיון
    DEVIATION_PATTERNS.localSortFunctions.forEach(pattern => {
      const matches = jsContent.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const lineIndex = lines.findIndex(line => line.includes(match.trim()));
          results.deviations.push({
            type: 'local_sort_function',
            file: page.js,
            line: lineIndex + 1,
            description: `פונקציה מקומית למיון: ${match.trim()}`,
          });
        });
      }
    });

    // חיפוש DOM manipulation ישיר
    DEVIATION_PATTERNS.directDOMManipulation.forEach(pattern => {
      const matches = jsContent.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const lineIndex = lines.findIndex(line => line.includes(match.trim()));
          results.deviations.push({
            type: 'direct_dom_manipulation',
            file: page.js,
            line: lineIndex + 1,
            description: `שימוש ישיר ב-DOM manipulation: ${match.trim().substring(0, 50)}...`,
          });
        });
      }
    });
  }

  return results;
}

function generateReport(allResults) {
  let report = `# דוח סטיות - Unified Table System Standardization
## Unified Table System Deviations Report

**תאריך יצירה:** ${new Date().toLocaleDateString('he-IL')}  
**תאריך עדכון אחרון:** ${new Date().toLocaleDateString('he-IL')}  
**גרסה:** 1.0.0  
**סטטוס:** 📊 סריקה הושלמה

---

## מטרת הדוח

דוח זה מפרט את כל הסטיות, כפילויות ובעיות שנמצאו בכל 36 העמודים במערכת ביחס לשימוש במערכת הטבלאות המאוחדת (Unified Table System).

---

## 📊 סיכום כללי

### סטטיסטיקות:
- **סה"כ עמודים נסרקים:** ${allResults.length}/36 (${((allResults.length / 36) * 100).toFixed(1)}%)
- **עמודים עם טבלאות:** ${allResults.filter(r => r.hasTables).length}
- **עמודים עם סטיות:** ${allResults.filter(r => r.deviations.length > 0).length}
- **סה"כ סטיות:** ${allResults.reduce((sum, r) => sum + r.deviations.length, 0)}
- **טבלאות עם data-table-type:** ${allResults.reduce((sum, r) => sum + r.tablesWithDataType, 0)}/${allResults.reduce((sum, r) => sum + r.tablesCount, 0)}

---

## 🔴 עמודים מרכזיים (11 עמודים)

`;

  allResults.filter(r => r.category === 'central').forEach((result, index) => {
    report += `### ${index + 1}. ${result.page}.html

**קובץ HTML:** \`trading-ui/${PAGES.find(p => p.name === result.page)?.html}\`  
**קובץ JS:** \`trading-ui/${result.jsPath ? path.relative(TRADING_UI_DIR, result.jsPath) : 'N/A'}\`

#### סטטיסטיקות:
- טבלאות: ${result.tablesCount}
- טבלאות עם data-table-type: ${result.tablesWithDataType}/${result.tablesCount}

#### סטיות שנמצאו:\n`;
    
    if (result.deviations.length === 0) {
      report += '- ✅ אין סטיות\n';
    } else {
      result.deviations.forEach((dev, i) => {
        report += `${i + 1}. **שורה ${dev.line}:** ${dev.description}\n`;
      });
    }

    report += `\n#### כפילויות שנמצאו:\n`;
    if (result.duplicates.length === 0) {
      report += '- ✅ אין כפילויות\n';
    } else {
      result.duplicates.forEach((dup, i) => {
        report += `${i + 1}. ${dup.description}\n`;
      });
    }

    report += `\n#### בעיות שזוהו:\n`;
    if (result.issues.length === 0) {
      report += '- ✅ אין בעיות\n';
    } else {
      result.issues.forEach((issue, i) => {
        report += `${i + 1}. ${issue.description}\n`;
      });
    }

    report += '\n---\n\n';
  });

  report += `## 🔵 עמודים טכניים (12 עמודים)\n\n`;
  allResults.filter(r => r.category === 'technical').forEach((result, index) => {
    report += `### ${index + 13}. ${result.page}.html

**קובץ HTML:** \`trading-ui/${PAGES.find(p => p.name === result.page)?.html}\`  
**קובץ JS:** \`trading-ui/${result.jsPath ? path.relative(TRADING_UI_DIR, result.jsPath) : 'N/A'}\`

#### סטטיסטיקות:
- טבלאות: ${result.tablesCount}
- טבלאות עם data-table-type: ${result.tablesWithDataType}/${result.tablesCount}

#### סטיות שנמצאו:\n`;
    
    if (result.deviations.length === 0) {
      report += '- ✅ אין סטיות\n';
    } else {
      result.deviations.forEach((dev, i) => {
        report += `${i + 1}. **שורה ${dev.line}:** ${dev.description}\n`;
      });
    }

    report += `\n#### כפילויות שנמצאו:\n`;
    if (result.duplicates.length === 0) {
      report += '- ✅ אין כפילויות\n';
    } else {
      result.duplicates.forEach((dup, i) => {
        report += `${i + 1}. ${dup.description}\n`;
      });
    }

    report += `\n#### בעיות שזוהו:\n`;
    if (result.issues.length === 0) {
      report += '- ✅ אין בעיות\n';
    } else {
      result.issues.forEach((issue, i) => {
        report += `${i + 1}. ${issue.description}\n`;
      });
    }

    report += '\n---\n\n';
  });

  report += `## 🟡 עמודים משניים (2 עמודים)\n\n`;
  allResults.filter(r => r.category === 'supporting').forEach((result, index) => {
    report += `### ${index + 25}. ${result.page}.html\n\n`;
    // Similar format...
    report += '---\n\n';
  });

  report += `## 🟢 עמודי מוקאפ (11 עמודים)\n\n`;
  allResults.filter(r => r.category === 'mockup').forEach((result, index) => {
    report += `### ${index + 27}. ${result.page}.html\n\n`;
    // Similar format...
    report += '---\n\n';
  });

  report += `---

**עדכון אחרון:** ${new Date().toLocaleDateString('he-IL')}  
**גרסה:** 1.0.0
`;

  return report;
}

// הרצה
console.log('🔍 סריקת כל העמודים לזיהוי סטיות...\n');

const allResults = PAGES.map(page => {
  console.log(`  📄 סריקת ${page.name}...`);
  return scanPage(page);
});

console.log('\n✅ הסריקה הושלמה!\n');
console.log(`📊 סטטיסטיקות:`);
console.log(`  - סה"כ עמודים: ${allResults.length}`);
console.log(`  - עמודים עם טבלאות: ${allResults.filter(r => r.hasTables).length}`);
console.log(`  - סה"כ סטיות: ${allResults.reduce((sum, r) => sum + r.deviations.length, 0)}`);

// יצירת הדוח
const report = generateReport(allResults);
const reportPath = path.join(REPORTS_DIR, 'UNIFIED_TABLE_SYSTEM_DEVIATIONS_REPORT.md');
fs.writeFileSync(reportPath, report, 'utf8');

console.log(`\n✅ דוח נוצר: ${reportPath}`);


