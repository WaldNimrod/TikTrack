#!/usr/bin/env node
/**
 * Scan Table Sort Value Adapter Usage
 * 
 * Scans all pages to identify deviations from the Table Sort Value Adapter standard:
 * - Direct .sort() usage on data arrays
 * - Local sorting functions (sortTable, sortData, customSort, etc.)
 * - Local comparison logic (compare, compareRows, customCompare, etc.)
 * - Manual value conversion for sorting (Date.parse, Number, parseFloat)
 * - Direct DateEnvelope handling (not through TableSortValueAdapter)
 * - Direct localeCompare for text sorting
 * - Custom sorting logic not through getCustomSortValue()
 */

const fs = require('fs');
const path = require('path');

const PAGES_LIST_PATH = path.join(__dirname, '../documentation/PAGES_LIST.md');
const TRADING_UI_PATH = path.join(__dirname, '../trading-ui');
const REPORT_PATH = path.join(__dirname, '../documentation/05-REPORTS/TABLE_SORT_VALUE_ADAPTER_DEVIATIONS_REPORT.md');

// Patterns to detect
const PATTERNS = {
  directSort: /\.sort\s*\(/g,
  localSortFunction: /\b(sortTable|sortData|customSort|localSort|pageSort)\s*[:=]/g,
  localCompare: /\b(compare|compareRows|customCompare|localCompare|pageCompare)\s*[:=]/g,
  manualDateParse: /Date\.parse\s*\(/g,
  manualNumber: /\bNumber\s*\([^)]*\)\s*(?=\s*[<>=])/g,
  manualParseFloat: /parseFloat\s*\([^)]*\)\s*(?=\s*[<>=])/g,
  directDateEnvelope: /\.epochMs|\.utc\s*(?=\s*[<>=])/g,
  directLocaleCompare: /\.localeCompare\s*\(/g,
  customSortLogic: /\b(customSort|localSort|pageSort)\s*\(/g
};

// Legitimate uses (false positives to ignore)
const LEGITIMATE_USES = [
  'window.sortTableData',
  'window.sortTable',
  'window.compareTableRows',
  'window.getTableSortValue',
  'TableSortValueAdapter.getSortValue',
  'getCustomSortValue',
  'getColumnSortType',
  'TABLE_COLUMN_SORT_TYPES',
  'UnifiedTableSystem.sortByChain',
  'UnifiedTableSystem.sorter.sort',
  'sortTableData(',
  'compareTableRows(',
  'getSortValue(',
  'getColumnSortType(',
  'sortByChain(',
  '//',
  '/*',
  '*',
  '*/',
  'console.',
  'Logger.',
  'window.Logger'
];

function shouldIgnoreLine(line, filePath) {
  const lowerLine = line.toLowerCase();
  
  // Ignore comments
  if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
    return true;
  }
  
  // Ignore legitimate uses
  for (const legitimate of LEGITIMATE_USES) {
    if (line.includes(legitimate)) {
      return true;
    }
  }
  
  // Ignore test files
  if (filePath.includes('test') || filePath.includes('spec')) {
    return true;
  }
  
  return false;
}

function scanFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = {
    directSort: [],
    localSortFunction: [],
    localCompare: [],
    manualDateParse: [],
    manualNumber: [],
    manualParseFloat: [],
    directDateEnvelope: [],
    directLocaleCompare: [],
    customSortLogic: []
  };
  
  lines.forEach((line, index) => {
    if (shouldIgnoreLine(line, filePath)) {
      return;
    }
    
    // Check each pattern
    for (const [patternName, pattern] of Object.entries(PATTERNS)) {
      const matches = line.match(pattern);
      if (matches) {
        issues[patternName].push({
          line: index + 1,
          content: line.trim(),
          matches: matches.length
        });
      }
    }
  });
  
  // Filter out empty issue arrays
  const hasIssues = Object.values(issues).some(arr => arr.length > 0);
  return hasIssues ? issues : null;
}

function parsePagesList() {
  const content = fs.readFileSync(PAGES_LIST_PATH, 'utf8');
  const pages = [];
  
  // Extract page paths from the markdown
  const lines = content.split('\n');
  let currentSection = null;
  
  for (const line of lines) {
    // Detect section headers
    if (line.startsWith('### ')) {
      currentSection = line.replace('### ', '').trim();
    }
    
    // Extract page paths (format: | **page.html** | ...)
    const pageMatch = line.match(/\|\s*\*\*([^*]+\.html)\*\*/);
    if (pageMatch) {
      const pageName = pageMatch[1];
      let pagePath = path.join(TRADING_UI_PATH, pageName);
      
      // Check if file exists
      if (fs.existsSync(pagePath)) {
        pages.push({
          name: pageName,
          path: pagePath,
          section: currentSection || 'unknown'
        });
      }
    }
  }
  
  return pages;
}

function findScriptFile(htmlPath) {
  const baseName = path.basename(htmlPath, '.html');
  const scriptName = baseName.replace(/-/g, '_') + '.js';
  const scriptPath = path.join(path.dirname(htmlPath), 'scripts', scriptName);
  
  if (fs.existsSync(scriptPath)) {
    return scriptPath;
  }
  
  // Try alternative naming
  const altScriptName = baseName + '.js';
  const altScriptPath = path.join(path.dirname(htmlPath), 'scripts', altScriptName);
  if (fs.existsSync(altScriptPath)) {
    return altScriptPath;
  }
  
  return null;
}

function generateReport(pages, allIssues) {
  let report = `# דוח סטיות - Table Sort Value Adapter
## Table Sort Value Adapter Deviations Report

**תאריך יצירה:** ${new Date().toLocaleDateString('he-IL')}  
**סה"כ עמודים נסרקו:** ${pages.length}  
**עמודים עם בעיות:** ${Object.keys(allIssues).length}

---

## סיכום

`;

  // Summary by issue type
  const issueTypeCounts = {};
  Object.values(allIssues).forEach(issues => {
    Object.keys(issues).forEach(issueType => {
      if (issues[issueType].length > 0) {
        issueTypeCounts[issueType] = (issueTypeCounts[issueType] || 0) + issues[issueType].length;
      }
    });
  });
  
  report += `### סוגי בעיות שנמצאו:\n\n`;
  for (const [issueType, count] of Object.entries(issueTypeCounts)) {
    report += `- **${issueType}**: ${count} מופעים\n`;
  }
  
  report += `\n---\n\n## פירוט לפי עמוד\n\n`;
  
  // Detailed report per page
  for (const page of pages) {
    const pageName = page.name;
    const issues = allIssues[pageName];
    
    if (!issues) {
      continue;
    }
    
    report += `### ${pageName}\n\n`;
    report += `**סקשן:** ${page.section}\n\n`;
    
    let hasAnyIssues = false;
    for (const [issueType, issueList] of Object.entries(issues)) {
      if (issueList.length > 0) {
        hasAnyIssues = true;
        report += `#### ${issueType} (${issueList.length} מופעים)\n\n`;
        issueList.forEach(issue => {
          report += `- **שורה ${issue.line}**: \`${issue.content.substring(0, 80)}${issue.content.length > 80 ? '...' : ''}\`\n`;
        });
        report += `\n`;
      }
    }
    
    if (!hasAnyIssues) {
      report += `✅ אין בעיות\n\n`;
    }
    
    report += `---\n\n`;
  }
  
  report += `## המלצות\n\n`;
  report += `1. **החלפת שימושים ישירים ב-.sort()** - להחליף ב-\`sortTableData()\` או \`UnifiedTableSystem.sortByChain()\`\n`;
  report += `2. **החלפת פונקציות מקומיות למיון** - להחליף במערכת המרכזית (\`sortTableData\`, \`compareTableRows\`)\n`;
  report += `3. **החלפת המרת ערכים מקומית** - להחליף ב-\`TableSortValueAdapter.getSortValue()\`\n`;
  report += `4. **עדכון TABLE_COLUMN_SORT_TYPES** - להוסיף הגדרות חסרות\n`;
  report += `5. **החלפת לוגיקת מיון מותאמת אישית** - להעביר ל-\`getCustomSortValue()\` ב-\`tables.js\`\n`;
  
  return report;
}

// Main execution
function main() {
  console.log('🔍 Scanning pages for Table Sort Value Adapter deviations...\n');
  
  const pages = parsePagesList();
  console.log(`📋 Found ${pages.length} pages to scan\n`);
  
  const allIssues = {};
  
  for (const page of pages) {
    console.log(`Scanning ${page.name}...`);
    
    const scriptPath = findScriptFile(page.path);
    if (!scriptPath) {
      console.log(`  ⚠️  No script file found for ${page.name}`);
      continue;
    }
    
    const issues = scanFile(scriptPath);
    if (issues) {
      allIssues[page.name] = issues;
      const issueCount = Object.values(issues).reduce((sum, arr) => sum + arr.length, 0);
      console.log(`  ❌ Found ${issueCount} issues`);
    } else {
      console.log(`  ✅ No issues found`);
    }
  }
  
  // Generate report
  const report = generateReport(pages, allIssues);
  fs.writeFileSync(REPORT_PATH, report, 'utf8');
  
  console.log(`\n✅ Report generated: ${REPORT_PATH}`);
  console.log(`\n📊 Summary:`);
  console.log(`   - Pages scanned: ${pages.length}`);
  console.log(`   - Pages with issues: ${Object.keys(allIssues).length}`);
}

main();



















