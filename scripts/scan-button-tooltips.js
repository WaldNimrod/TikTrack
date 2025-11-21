#!/usr/bin/env node
/**
 * Button Tooltips Scanner
 * Scans all HTML files for buttons and generates a report
 * 
 * Usage:
 *   node scripts/scan-button-tooltips.js [--page PAGE_NAME] [--output OUTPUT_FILE]
 * 
 * Example:
 *   node scripts/scan-button-tooltips.js --page trades --output reports/button-scan-trades.json
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

// Button type mappings for recommendations
const BUTTON_TYPE_RECOMMENDATIONS = {
  'TOGGLE': {
    'top-section': { tooltip: 'הצג או הסתר את אזור הסיכום', id: 'toggle-top-section' },
    'main-section': { tooltip: 'הצג או הסתר את הטבלה', id: 'toggle-main-section' },
    'default': { tooltip: 'הצג/הסתר', id: 'toggle-section' }
  },
  'ADD': {
    'default': { tooltip: 'הוסף', id: 'add-button' }
  },
  'FILTER': {
    'default': { tooltip: 'פילטר', id: 'filter-button' }
  },
  'SORT': {
    'default': { tooltip: 'מיין', id: 'sort-button' }
  },
  'VIEW': {
    'default': { tooltip: 'צפה', id: 'view-button' }
  },
  'EDIT': {
    'default': { tooltip: 'ערוך', id: 'edit-button' }
  },
  'DELETE': {
    'default': { tooltip: 'מחק', id: 'delete-button' }
  }
};

/**
 * Get recommended tooltip and ID for a button
 */
function getRecommendations(buttonType, onclick, entityType, page) {
  const recommendations = BUTTON_TYPE_RECOMMENDATIONS[buttonType] || {};
  
  // Try to match by onclick content
  if (onclick) {
    if (onclick.includes('toggleSection')) {
      const sectionMatch = onclick.match(/toggleSection\(['"]([^'"]+)['"]\)/);
      if (sectionMatch) {
        const sectionId = sectionMatch[1];
        if (sectionId === 'top' || sectionId.includes('top')) {
          return recommendations['top-section'] || recommendations['default'] || {};
        }
        if (sectionId === 'main' || sectionId.includes('main')) {
          return recommendations['main-section'] || recommendations['default'] || {};
        }
      }
    }
  }
  
  return recommendations['default'] || {};
}

/**
 * Scan a single HTML file
 */
function scanHTMLFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const dom = new JSDOM(content);
  const document = dom.window.document;
  
  const pageName = path.basename(filePath, '.html');
  const buttons = [];
  const modals = [];
  const processedButtons = new Set(); // Track processed buttons to avoid duplicates
  
  // Find all modals first
  const modalElements = document.querySelectorAll('.modal, [class*="modal"]');
  modalElements.forEach((modal, modalIndex) => {
    const modalId = modal.id || `modal-${modalIndex}`;
    const modalButtons = [];
    
    // Find buttons within this modal
    const modalButtonElements = modal.querySelectorAll('[data-button-type]');
    modalButtonElements.forEach((button, btnIndex) => {
      const buttonData = extractButtonData(button, content, pageName, buttons.length, true, modalId);
      buttons.push(buttonData);
      modalButtons.push(buttonData);
      processedButtons.add(button.outerHTML.substring(0, 100)); // Use first 100 chars as key
    });
    
    if (modalButtons.length > 0) {
      modals.push({
        id: modalId,
        index: modalIndex + 1,
        buttonCount: modalButtons.length,
        buttons: modalButtons
      });
    }
  });
  
  // Find all buttons with data-button-type (including those not in modals)
  const buttonElements = document.querySelectorAll('[data-button-type]');
  
  buttonElements.forEach((button, index) => {
    // Skip if already processed (in modal)
    const buttonKey = button.outerHTML.substring(0, 100);
    if (!processedButtons.has(buttonKey)) {
      const buttonData = extractButtonData(button, content, pageName, buttons.length, false, null);
      buttons.push(buttonData);
      processedButtons.add(buttonKey);
    }
  });
  
  return {
    page: pageName,
    file: filePath,
    totalButtons: buttons.length,
    buttonsWithTooltip: buttons.filter(b => b.hasTooltip).length,
    buttonsWithId: buttons.filter(b => b.hasId).length,
    buttonsNeedingTooltip: buttons.filter(b => b.needsTooltip).length,
    buttonsNeedingId: buttons.filter(b => b.needsId).length,
    modalsCount: modals.length,
    modals: modals,
    buttons: buttons
  };
}

/**
 * Extract button data from a button element
 */
function extractButtonData(button, content, pageName, index, inModal, modalId) {
  const buttonType = button.getAttribute('data-button-type');
  const hasTooltip = button.hasAttribute('data-tooltip');
  const hasId = button.hasAttribute('data-id');
  const tooltip = button.getAttribute('data-tooltip') || null;
  const id = button.getAttribute('data-id') || null;
  const onclick = button.getAttribute('data-onclick') || button.getAttribute('onclick') || null;
  const entityType = button.getAttribute('data-entity-type') || null;
  const text = button.getAttribute('data-text') || button.textContent.trim() || null;
  const buttonHTML = button.outerHTML;
  
  // Get line number (approximate)
  const buttonIndex = content.indexOf(buttonHTML);
  const contentBeforeButton = buttonIndex >= 0 ? content.substring(0, buttonIndex) : '';
  const line = (contentBeforeButton.match(/\n/g) || []).length + 1;
  
  // Get recommendations
  const recommendations = getRecommendations(buttonType, onclick, entityType, pageName);
  
  return {
    index: index + 1,
    type: buttonType,
    hasTooltip: hasTooltip,
    hasId: hasId,
    tooltip: tooltip,
    id: id,
    onclick: onclick,
    entityType: entityType,
    text: text,
    line: line,
    inModal: inModal,
    modalId: modalId,
    recommendedId: recommendations.id || `btn-${buttonType.toLowerCase()}-${index}`,
    recommendedTooltip: recommendations.tooltip || null,
    needsTooltip: !hasTooltip,
    needsId: !hasId,
    isStatic: button.hasAttribute('data-tooltip-static'),
    html: buttonHTML.substring(0, 200) // Store first 200 chars for comparison
  };
}

/**
 * Main scanning function
 */
function scanAllPages() {
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
  
  console.log(`📋 Scanning ${filesToScan.length} HTML files...\n`);
  
  const results = [];
  let totalButtons = 0;
  let totalNeedingTooltip = 0;
  let totalNeedingId = 0;
  
  filesToScan.forEach(filePath => {
    try {
      const result = scanHTMLFile(filePath);
      results.push(result);
      totalButtons += result.totalButtons;
      totalNeedingTooltip += result.buttonsNeedingTooltip;
      totalNeedingId += result.buttonsNeedingId;
      
      console.log(`✅ ${result.page}: ${result.totalButtons} buttons (${result.buttonsNeedingTooltip} need tooltip, ${result.buttonsNeedingId} need ID)`);
    } catch (error) {
      console.error(`❌ Error scanning ${filePath}:`, error.message);
    }
  });
  
  // Generate summary
  const summary = {
    scanDate: new Date().toISOString(),
    totalPages: results.length,
    totalButtons: totalButtons,
    totalNeedingTooltip: totalNeedingTooltip,
    totalNeedingId: totalNeedingId,
    pages: results
  };
  
  // Save JSON results
  const timestamp = Date.now();
  const jsonOutputPath = outputFile || path.join(OUTPUT_DIR, `button-tooltips-scan-${timestamp}.json`);
  fs.writeFileSync(jsonOutputPath, JSON.stringify(summary, null, 2), 'utf-8');
  
  // Generate HTML report
  const htmlOutputPath = path.join(OUTPUT_DIR, `button-tooltips-scan-${timestamp}.html`);
  generateHTMLReport(summary, htmlOutputPath);
  
  // Generate summary markdown
  const summaryOutputPath = path.join(OUTPUT_DIR, `button-tooltips-scan-${timestamp}-summary.md`);
  generateSummaryReport(summary, summaryOutputPath);
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total pages: ${summary.totalPages}`);
  console.log(`   Total buttons: ${summary.totalButtons}`);
  console.log(`   Buttons needing tooltip: ${summary.totalNeedingTooltip}`);
  console.log(`   Buttons needing ID: ${summary.totalNeedingId}`);
  console.log(`   Total modals: ${results.reduce((sum, r) => sum + (r.modalsCount || 0), 0)}`);
  console.log(`\n💾 Results saved to:`);
  console.log(`   JSON: ${jsonOutputPath}`);
  console.log(`   HTML: ${htmlOutputPath}`);
  console.log(`   Summary: ${summaryOutputPath}`);
  
  return summary;
}

/**
 * Generate HTML report
 */
function generateHTMLReport(summary, outputPath) {
  let html = `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Button Tooltips Scan Report - ${new Date(summary.scanDate).toLocaleString('he-IL')}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        h1 { color: #26baac; border-bottom: 2px solid #26baac; padding-bottom: 10px; }
        h2 { color: #fc5a06; margin-top: 30px; }
        .summary { background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .summary-item { margin: 5px 0; }
        .page-section { margin: 30px 0; padding: 15px; background: #fafafa; border-left: 4px solid #26baac; }
        .button-item { margin: 10px 0; padding: 10px; background: white; border-radius: 4px; border: 1px solid #ddd; }
        .button-item.needs-fix { border-left: 4px solid #fc5a06; }
        .button-item.ok { border-left: 4px solid #26baac; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 12px; margin: 0 5px; }
        .badge-success { background: #26baac; color: white; }
        .badge-warning { background: #fc5a06; color: white; }
        .badge-danger { background: #dc3545; color: white; }
        .modal-section { margin: 15px 0; padding: 10px; background: #fff3cd; border-radius: 4px; }
        code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>📋 Button Tooltips Scan Report</h1>
        <div class="summary">
            <h2>סיכום כללי</h2>
            <div class="summary-item"><strong>תאריך סריקה:</strong> ${new Date(summary.scanDate).toLocaleString('he-IL')}</div>
            <div class="summary-item"><strong>סה"כ עמודים:</strong> ${summary.totalPages}</div>
            <div class="summary-item"><strong>סה"כ כפתורים:</strong> ${summary.totalButtons}</div>
            <div class="summary-item"><strong>כפתורים עם טולטיפ:</strong> ${summary.totalButtons - summary.totalNeedingTooltip}</div>
            <div class="summary-item"><strong>כפתורים ללא טולטיפ:</strong> <span class="badge badge-warning">${summary.totalNeedingTooltip}</span></div>
            <div class="summary-item"><strong>כפתורים עם ID:</strong> ${summary.totalButtons - summary.totalNeedingId}</div>
            <div class="summary-item"><strong>כפתורים ללא ID:</strong> <span class="badge badge-warning">${summary.totalNeedingId}</span></div>
        </div>
`;

  summary.pages.forEach(page => {
    const needsFix = page.buttonsNeedingTooltip > 0 || page.buttonsNeedingId > 0;
    html += `
        <div class="page-section">
            <h2>📄 ${page.page}.html</h2>
            <div class="summary">
                <div class="summary-item"><strong>סה"כ כפתורים:</strong> ${page.totalButtons}</div>
                <div class="summary-item"><strong>כפתורים עם טולטיפ:</strong> ${page.buttonsWithTooltip}</div>
                <div class="summary-item"><strong>כפתורים ללא טולטיפ:</strong> <span class="badge ${page.buttonsNeedingTooltip > 0 ? 'badge-warning' : 'badge-success'}">${page.buttonsNeedingTooltip}</span></div>
                <div class="summary-item"><strong>כפתורים עם ID:</strong> ${page.buttonsWithId}</div>
                <div class="summary-item"><strong>כפתורים ללא ID:</strong> <span class="badge ${page.buttonsNeedingId > 0 ? 'badge-warning' : 'badge-success'}">${page.buttonsNeedingId}</span></div>
                ${page.modalsCount > 0 ? `<div class="summary-item"><strong>מודולים:</strong> ${page.modalsCount}</div>` : ''}
            </div>
`;

    if (page.modals && page.modals.length > 0) {
      html += `<h3>🔲 מודולים (${page.modals.length})</h3>`;
      page.modals.forEach(modal => {
        html += `
            <div class="modal-section">
                <strong>מודול:</strong> ${modal.id || 'ללא ID'} (${modal.buttonCount} כפתורים)
            </div>
`;
      });
    }

    if (page.buttons && page.buttons.length > 0) {
      html += `<h3>🔘 כפתורים (${page.buttons.length})</h3>`;
      page.buttons.forEach(button => {
        const needsFix = button.needsTooltip || button.needsId;
        const statusClass = needsFix ? 'needs-fix' : 'ok';
        html += `
            <div class="button-item ${statusClass}">
                <strong>כפתור #${button.index}</strong> 
                <span class="badge badge-success">${button.type}</span>
                ${button.inModal ? `<span class="badge badge-warning">במודול: ${button.modalId}</span>` : ''}
                ${button.needsTooltip ? '<span class="badge badge-danger">צריך טולטיפ</span>' : '<span class="badge badge-success">יש טולטיפ</span>'}
                ${button.needsId ? '<span class="badge badge-danger">צריך ID</span>' : '<span class="badge badge-success">יש ID</span>'}
                ${button.isStatic ? '<span class="badge badge-success">סטטי</span>' : ''}
                <br>
                <small>
                    ${button.id ? `<code>id="${button.id}"</code>` : ''}
                    ${button.tooltip ? `<code>tooltip="${button.tooltip.substring(0, 50)}${button.tooltip.length > 50 ? '...' : ''}"</code>` : ''}
                    ${button.onclick ? `<code>onclick="${button.onclick.substring(0, 50)}${button.onclick.length > 50 ? '...' : ''}"</code>` : ''}
                    <br>שורה: ${button.line}
                </small>
                ${button.needsTooltip && button.recommendedTooltip ? `<br><strong>המלצה:</strong> <code>data-tooltip="${button.recommendedTooltip}"</code>` : ''}
                ${button.needsId && button.recommendedId ? `<br><strong>המלצה:</strong> <code>data-id="${button.recommendedId}"</code>` : ''}
            </div>
`;
      });
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
 * Generate summary markdown report
 */
function generateSummaryReport(summary, outputPath) {
  let md = `# דוח סיכום - סריקת טולטיפים לכפתורים\n\n`;
  md += `**תאריך סריקה:** ${new Date(summary.scanDate).toLocaleString('he-IL')}\n\n`;
  md += `## סיכום כללי\n\n`;
  md += `- **סה"כ עמודים:** ${summary.totalPages}\n`;
  md += `- **סה"כ כפתורים:** ${summary.totalButtons}\n`;
  md += `- **כפתורים עם טולטיפ:** ${summary.totalButtons - summary.totalNeedingTooltip}\n`;
  md += `- **כפתורים ללא טולטיפ:** ${summary.totalNeedingTooltip} ⚠️\n`;
  md += `- **כפתורים עם ID:** ${summary.totalButtons - summary.totalNeedingId}\n`;
  md += `- **כפתורים ללא ID:** ${summary.totalNeedingId} ⚠️\n\n`;
  
  const totalModals = summary.pages.reduce((sum, p) => sum + (p.modalsCount || 0), 0);
  md += `- **סה"כ מודולים:** ${totalModals}\n\n`;
  
  md += `## רשימת עמודים\n\n`;
  md += `| עמוד | כפתורים | ללא טולטיפ | ללא ID | מודולים | סטטוס |\n`;
  md += `|------|---------|------------|--------|---------|--------|\n`;
  
  summary.pages.forEach(page => {
    const needsWork = page.buttonsNeedingTooltip > 0 || page.buttonsNeedingId > 0;
    const status = needsWork ? '⚠️ צריך עבודה' : '✅ מוכן';
    md += `| ${page.page} | ${page.totalButtons} | ${page.buttonsNeedingTooltip} | ${page.buttonsNeedingId} | ${page.modalsCount || 0} | ${status} |\n`;
  });
  
  md += `\n## עמודים שצריכים עבודה\n\n`;
  const pagesNeedingWork = summary.pages.filter(p => p.buttonsNeedingTooltip > 0 || p.buttonsNeedingId > 0);
  if (pagesNeedingWork.length === 0) {
    md += `✅ כל העמודים מוכנים!\n`;
  } else {
    pagesNeedingWork.forEach(page => {
      md += `### ${page.page}.html\n`;
      md += `- כפתורים ללא טולטיפ: ${page.buttonsNeedingTooltip}\n`;
      md += `- כפתורים ללא ID: ${page.buttonsNeedingId}\n`;
      md += `- מודולים: ${page.modalsCount || 0}\n\n`;
    });
  }
  
  fs.writeFileSync(outputPath, md, 'utf-8');
}

// Run if called directly
if (require.main === module) {
  scanAllPages();
}

module.exports = { scanAllPages, scanHTMLFile };

