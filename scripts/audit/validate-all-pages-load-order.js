/**
 * Validate Load Order for All Pages
 * ===================================
 * 
 * Checks that all HTML pages implement the correct loading order
 * according to the package manifest.
 * 
 * @version 1.0.0
 * @created November 2025
 */

const LoadOrderValidator = require('./load-order-validator');
const fs = require('fs');
const path = require('path');

const scriptsDir = path.join(__dirname, '../../trading-ui/scripts');
const tradingUiDir = path.join(__dirname, '../../trading-ui');

async function main() {
  console.log('🔍 בדיקת סדר טעינה לכל העמודים...\n');
  
  const validator = new LoadOrderValidator(scriptsDir, tradingUiDir);
  const results = await validator.validate();
  
  // Group results by page
  const pageResults = {};
  
  // Process load order mismatches
  results.loadOrderMismatches.forEach(issue => {
    if (!pageResults[issue.page]) {
      pageResults[issue.page] = {
        loadOrderIssues: [],
        missingScripts: [],
        extraScripts: []
      };
    }
    pageResults[issue.page].loadOrderIssues.push(issue);
  });
  
  // Process missing scripts
  results.scriptsMissing.forEach(issue => {
    if (!pageResults[issue.page]) {
      pageResults[issue.page] = {
        loadOrderIssues: [],
        missingScripts: [],
        extraScripts: []
      };
    }
    pageResults[issue.page].missingScripts.push(issue);
  });
  
  // Process scripts not in packages
  results.scriptsNotInPackages.forEach(issue => {
    if (!pageResults[issue.page]) {
      pageResults[issue.page] = {
        loadOrderIssues: [],
        missingScripts: [],
        extraScripts: []
      };
    }
    pageResults[issue.page].extraScripts.push(issue);
  });
  
  // Print results
  const pagesWithIssues = Object.keys(pageResults);
  const pagesWithoutIssues = [];
  
  // Get all HTML files
  const htmlFiles = validator.getAllHTMLFiles();
  htmlFiles.forEach(htmlFile => {
    const pageName = validator.getPageName(htmlFile);
    if (!pageResults[pageName] || 
        (pageResults[pageName].loadOrderIssues.length === 0 &&
         pageResults[pageName].missingScripts.length === 0 &&
         pageResults[pageName].extraScripts.length === 0)) {
      pagesWithoutIssues.push(pageName);
    }
  });
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 סיכום תוצאות');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log(`✅ עמודים תקינים: ${pagesWithoutIssues.length}`);
  console.log(`❌ עמודים עם בעיות: ${pagesWithIssues.length}\n`);
  
  if (pagesWithIssues.length > 0) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('❌ עמודים עם בעיות:');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    pagesWithIssues.forEach(pageName => {
      const issues = pageResults[pageName];
      console.log(`\n📄 ${pageName}:`);
      
      if (issues.loadOrderIssues.length > 0) {
        console.log(`  🔴 בעיות סדר טעינה (${issues.loadOrderIssues.length}):`);
        issues.loadOrderIssues.forEach(issue => {
          console.log(`     - ${issue.issue}`);
          console.log(`       תיקון: ${issue.fix}`);
        });
      }
      
      if (issues.missingScripts.length > 0) {
        console.log(`  ⚠️ סקריפטים חסרים (${issues.missingScripts.length}):`);
        issues.missingScripts.forEach(issue => {
          console.log(`     - ${issue.script}`);
        });
      }
      
      if (issues.extraScripts.length > 0) {
        console.log(`  ⚠️ סקריפטים מיותרים (${issues.extraScripts.length}):`);
        issues.extraScripts.forEach(issue => {
          console.log(`     - ${issue.script}`);
        });
      }
    });
  }
  
  // Save detailed report
  const reportPath = path.join(__dirname, '../../documentation/05-REPORTS/ALL_PAGES_LOAD_ORDER_VALIDATION.md');
  let report = `# דוח בדיקת סדר טעינה - כל העמודים
**תאריך:** ${new Date().toISOString().split('T')[0]}
**גרסה:** 1.5.0
**סטטוס:** ${pagesWithIssues.length === 0 ? '✅ כל העמודים תקינים' : '❌ נמצאו בעיות'}

---

## 📊 סיכום

- **עמודים תקינים:** ${pagesWithoutIssues.length}
- **עמודים עם בעיות:** ${pagesWithIssues.length}
- **סה"כ בעיות סדר טעינה:** ${results.loadOrderMismatches.length}
- **סה"כ סקריפטים חסרים:** ${results.scriptsMissing.length}
- **סה"כ סקריפטים מיותרים:** ${results.scriptsNotInPackages.length}

---

## ✅ עמודים תקינים

${pagesWithoutIssues.length > 0 ? pagesWithoutIssues.map(p => `- ${p}`).join('\n') : 'אין עמודים תקינים'}

---

## ❌ עמודים עם בעיות

`;

  if (pagesWithIssues.length > 0) {
    pagesWithIssues.forEach(pageName => {
      const issues = pageResults[pageName];
      report += `\n### ${pageName}\n\n`;
      
      if (issues.loadOrderIssues.length > 0) {
        report += `#### בעיות סדר טעינה (${issues.loadOrderIssues.length})\n\n`;
        issues.loadOrderIssues.forEach(issue => {
          report += `- **בעיה:** ${issue.issue}\n`;
          report += `  - **תיקון:** ${issue.fix}\n\n`;
        });
      }
      
      if (issues.missingScripts.length > 0) {
        report += `#### סקריפטים חסרים (${issues.missingScripts.length})\n\n`;
        issues.missingScripts.forEach(issue => {
          report += `- ${issue.script}\n`;
        });
        report += '\n';
      }
      
      if (issues.extraScripts.length > 0) {
        report += `#### סקריפטים מיותרים (${issues.extraScripts.length})\n\n`;
        issues.extraScripts.forEach(issue => {
          report += `- ${issue.script}\n`;
        });
        report += '\n';
      }
    });
  }
  
  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`\n📄 דוח מפורט נשמר ב: ${reportPath}\n`);
  
  // Return exit code
  process.exit(pagesWithIssues.length > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('❌ שגיאה:', err);
  process.exit(1);
});

