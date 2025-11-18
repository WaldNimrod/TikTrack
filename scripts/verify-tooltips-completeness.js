#!/usr/bin/env node
/**
 * Tooltips Completeness Verifier
 * Verifies that all buttons have tooltips and IDs after updates
 * 
 * Usage:
 *   node scripts/verify-tooltips-completeness.js [--page PAGE_NAME] [--output OUTPUT_FILE]
 * 
 * Example:
 *   node scripts/verify-tooltips-completeness.js --page trades
 */

const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// Configuration
const TRADING_UI_DIR = path.join(__dirname, '..', 'trading-ui');
const OUTPUT_DIR = path.join(__dirname, '..', 'reports', 'button-tooltips-scan');

// Parse command line arguments
const args = process.argv.slice(2);
const pageFilter = args.includes('--page') ? args[args.indexOf('--page') + 1] : null;
const outputFile = args.includes('--output') ? args[args.indexOf('--output') + 1] : null;

/**
 * Verify completeness for a single HTML file
 */
function verifyHTMLFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const dom = new JSDOM(content);
  const document = dom.window.document;
  
  const pageName = path.basename(filePath, '.html');
  const issues = [];
  const buttons = [];
  
  // Find all buttons with data-button-type
  const buttonElements = document.querySelectorAll('[data-button-type]');
  
  buttonElements.forEach((button, index) => {
    const buttonType = button.getAttribute('data-button-type');
    const hasTooltip = button.hasAttribute('data-tooltip');
    const hasId = button.hasAttribute('data-id');
    const tooltip = button.getAttribute('data-tooltip') || null;
    const id = button.getAttribute('data-id') || null;
    const onclick = button.getAttribute('data-onclick') || null;
    
    // Get line number
    const buttonHTML = button.outerHTML;
    const buttonIndex = content.indexOf(buttonHTML);
    const contentBeforeButton = buttonIndex >= 0 ? content.substring(0, buttonIndex) : '';
    const line = (contentBeforeButton.match(/\n/g) || []).length + 1;
    
    const buttonInfo = {
      index: index + 1,
      type: buttonType,
      hasTooltip: hasTooltip,
      hasId: hasId,
      tooltip: tooltip,
      id: id,
      onclick: onclick,
      line: line,
      issues: []
    };
    
    // Check for issues
    if (!hasTooltip) {
      buttonInfo.issues.push('missing-tooltip');
      issues.push({
        type: 'missing-tooltip',
        button: buttonInfo,
        severity: 'high'
      });
    } else if (tooltip && tooltip.trim() === '') {
      buttonInfo.issues.push('empty-tooltip');
      issues.push({
        type: 'empty-tooltip',
        button: buttonInfo,
        severity: 'medium'
      });
    }
    
    if (!hasId) {
      buttonInfo.issues.push('missing-id');
      issues.push({
        type: 'missing-id',
        button: buttonInfo,
        severity: 'high'
      });
    } else if (id && id.trim() === '') {
      buttonInfo.issues.push('empty-id');
      issues.push({
        type: 'empty-id',
        button: buttonInfo,
        severity: 'medium'
      });
    }
    
    buttons.push(buttonInfo);
  });
  
  // Check for duplicate IDs
  const idCounts = {};
  buttons.forEach(btn => {
    if (btn.id) {
      idCounts[btn.id] = (idCounts[btn.id] || 0) + 1;
    }
  });
  
  const duplicateIds = Object.entries(idCounts)
    .filter(([id, count]) => count > 1)
    .map(([id]) => id);
  
  duplicateIds.forEach(dupId => {
    const affectedButtons = buttons.filter(b => b.id === dupId);
    issues.push({
      type: 'duplicate-id',
      id: dupId,
      buttons: affectedButtons,
      severity: 'high'
    });
  });
  
  const completeness = {
    total: buttons.length,
    withTooltip: buttons.filter(b => b.hasTooltip && b.tooltip && b.tooltip.trim() !== '').length,
    withId: buttons.filter(b => b.hasId && b.id && b.id.trim() !== '').length,
    complete: buttons.filter(b => 
      b.hasTooltip && b.tooltip && b.tooltip.trim() !== '' &&
      b.hasId && b.id && b.id.trim() !== ''
    ).length,
    issues: issues.length,
    duplicateIds: duplicateIds.length
  };
  
  completeness.percentage = completeness.total > 0 
    ? Math.round((completeness.complete / completeness.total) * 100)
    : 100;
  
  return {
    page: pageName,
    file: filePath,
    completeness: completeness,
    buttons: buttons,
    issues: issues,
    duplicateIds: duplicateIds
  };
}

/**
 * Generate HTML report
 */
function generateHTMLReport(results, outputPath) {
  let html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tooltips Completeness Verification Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #26baac; border-bottom: 2px solid #26baac; padding-bottom: 10px; }
        h2 { color: #fc5a06; margin-top: 30px; }
        .summary { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .summary-item { margin: 5px 0; }
        .page-section { margin: 30px 0; padding: 15px; background: #fafafa; border-left: 4px solid #26baac; }
        .issue-item { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; border-left: 4px solid #fc5a06; }
        .issue-item.high { border-left-color: #dc3545; }
        .issue-item.medium { border-left-color: #fc5a06; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 12px; margin: 0 5px; }
        .badge-success { background: #26baac; color: white; }
        .badge-warning { background: #fc5a06; color: white; }
        .badge-danger { background: #dc3545; color: white; }
        .progress-bar { width: 100%; height: 20px; background: #e0e0e0; border-radius: 10px; overflow: hidden; margin: 10px 0; }
        .progress-fill { height: 100%; background: #26baac; transition: width 0.3s; }
    </style>
</head>
<body>
    <div class="container">
        <h1>✅ בדיקת שלמות טולטיפים</h1>
        <div class="summary">
            <h2>סיכום כללי</h2>
`;

  const totalButtons = results.reduce((sum, r) => sum + r.completeness.total, 0);
  const totalComplete = results.reduce((sum, r) => sum + r.completeness.complete, 0);
  const totalIssues = results.reduce((sum, r) => sum + r.completeness.issues, 0);
  const overallPercentage = totalButtons > 0 ? Math.round((totalComplete / totalButtons) * 100) : 100;
  
  html += `
            <div class="summary-item"><strong>סה"כ עמודים:</strong> ${results.length}</div>
            <div class="summary-item"><strong>סה"כ כפתורים:</strong> ${totalButtons}</div>
            <div class="summary-item"><strong>כפתורים מושלמים:</strong> ${totalComplete}</div>
            <div class="summary-item"><strong>בעיות:</strong> <span class="badge ${totalIssues > 0 ? 'badge-danger' : 'badge-success'}">${totalIssues}</span></div>
            <div class="summary-item"><strong>אחוז השלמות:</strong> ${overallPercentage}%</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${overallPercentage}%"></div>
            </div>
        </div>
`;

  results.forEach(result => {
    const percentage = result.completeness.percentage;
    const statusClass = percentage === 100 ? 'badge-success' : percentage >= 80 ? 'badge-warning' : 'badge-danger';
    
    html += `
        <div class="page-section">
            <h2>📄 ${result.page}.html</h2>
            <div class="summary">
                <div class="summary-item"><strong>סה"כ כפתורים:</strong> ${result.completeness.total}</div>
                <div class="summary-item"><strong>עם טולטיפ:</strong> ${result.completeness.withTooltip}</div>
                <div class="summary-item"><strong>עם ID:</strong> ${result.completeness.withId}</div>
                <div class="summary-item"><strong>מושלמים:</strong> ${result.completeness.complete}</div>
                <div class="summary-item"><strong>אחוז השלמות:</strong> <span class="badge ${statusClass}">${percentage}%</span></div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
`;

    if (result.issues.length > 0) {
      html += `<h3>⚠️ בעיות (${result.issues.length})</h3>`;
      result.issues.forEach((issue, idx) => {
        const severityClass = issue.severity === 'high' ? 'high' : 'medium';
        html += `
            <div class="issue-item ${severityClass}">
                <strong>בעיה #${idx + 1}:</strong> ${issue.type}
                ${issue.button ? `<br>כפתור: ${issue.button.type} (שורה ${issue.button.line})` : ''}
                ${issue.id ? `<br>ID כפול: ${issue.id}` : ''}
            </div>
`;
      });
    } else {
      html += `<h3>✅ אין בעיות - כל הכפתורים מושלמים!</h3>`;
    }
    
    html += `</div>`;
  });

  html += `
    </div>
</body>
</html>`;

  fs.writeFileSync(outputPath, html, 'utf-8');
}

/**
 * Main verification function
 */
function verifyCompleteness() {
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Get all HTML files
  const htmlFiles = fs.readdirSync(TRADING_UI_DIR)
    .filter(file => file.endsWith('.html'))
    .filter(file => !file.includes('backup') && !file.includes('test') && !file.includes('tooltip-editor'))
    .map(file => path.join(TRADING_UI_DIR, file));
  
  // Filter by page if specified
  const filesToScan = pageFilter 
    ? htmlFiles.filter(file => path.basename(file, '.html') === pageFilter)
    : htmlFiles;
  
  console.log(`📋 Verifying completeness for ${filesToScan.length} HTML files...\n`);
  
  const results = [];
  
  filesToScan.forEach(filePath => {
    try {
      const result = verifyHTMLFile(filePath);
      results.push(result);
      
      const status = result.completeness.percentage === 100 ? '✅' : 
                     result.completeness.percentage >= 80 ? '⚠️' : '❌';
      console.log(`${status} ${result.page}: ${result.completeness.percentage}% complete (${result.completeness.issues} issues)`);
    } catch (error) {
      console.error(`❌ Error verifying ${filePath}:`, error.message);
    }
  });
  
  // Generate summary
  const summary = {
    scanDate: new Date().toISOString(),
    totalPages: results.length,
    totalButtons: results.reduce((sum, r) => sum + r.completeness.total, 0),
    totalComplete: results.reduce((sum, r) => sum + r.completeness.complete, 0),
    totalIssues: results.reduce((sum, r) => sum + r.completeness.issues, 0),
    pages: results
  };
  
  summary.overallPercentage = summary.totalButtons > 0 
    ? Math.round((summary.totalComplete / summary.totalButtons) * 100)
    : 100;
  
  // Save JSON results
  const timestamp = Date.now();
  const jsonOutputPath = outputFile || path.join(OUTPUT_DIR, `completeness-${timestamp}.json`);
  fs.writeFileSync(jsonOutputPath, JSON.stringify(summary, null, 2), 'utf-8');
  
  // Generate HTML report
  const htmlOutputPath = path.join(OUTPUT_DIR, `completeness-${timestamp}.html`);
  generateHTMLReport(results, htmlOutputPath);
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total pages: ${summary.totalPages}`);
  console.log(`   Total buttons: ${summary.totalButtons}`);
  console.log(`   Complete buttons: ${summary.totalComplete}`);
  console.log(`   Overall completeness: ${summary.overallPercentage}%`);
  console.log(`   Total issues: ${summary.totalIssues}`);
  console.log(`\n💾 Results saved to:`);
  console.log(`   JSON: ${jsonOutputPath}`);
  console.log(`   HTML: ${htmlOutputPath}`);
  
  // Exit with error code if there are issues
  if (summary.totalIssues > 0) {
    process.exit(1);
  }
  
  return summary;
}

// Run if called directly
if (require.main === module) {
  verifyCompleteness();
}

module.exports = { verifyCompleteness, verifyHTMLFile };

