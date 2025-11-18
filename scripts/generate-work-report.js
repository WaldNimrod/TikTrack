#!/usr/bin/env node
/**
 * Work Report Generator
 * Generates detailed work reports for each page based on scan results
 * 
 * Usage:
 *   node scripts/generate-work-report.js [--scan-file SCAN_FILE.json] [--dynamic-file DYNAMIC_FILE.json] [--modals-file MODALS_FILE.json] [--page PAGE_NAME]
 * 
 * Example:
 *   node scripts/generate-work-report.js --scan-file reports/button-tooltips-scan/scan-123.json --page trades
 */

const fs = require('fs');
const path = require('path');

// Configuration
const OUTPUT_DIR = path.join(__dirname, '..', 'reports', 'button-tooltips-scan');

// Parse command line arguments
const args = process.argv.slice(2);
const scanFile = args.includes('--scan-file') ? args[args.indexOf('--scan-file') + 1] : null;
const dynamicFile = args.includes('--dynamic-file') ? args[args.indexOf('--dynamic-file') + 1] : null;
const modalsFile = args.includes('--modals-file') ? args[args.indexOf('--modals-file') + 1] : null;
const pageFilter = args.includes('--page') ? args[args.indexOf('--page') + 1] : null;

/**
 * Find latest scan files if not provided
 */
function findLatestScanFiles() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    return { scan: null, dynamic: null, modals: null };
  }
  
  const files = fs.readdirSync(OUTPUT_DIR);
  const scanFiles = files.filter(f => f.startsWith('button-tooltips-scan-') && f.endsWith('.json'));
  const dynamicFiles = files.filter(f => f.startsWith('dynamic-buttons-') && f.endsWith('.json'));
  const modalsFiles = files.filter(f => f.startsWith('modals-') && f.endsWith('.json'));
  
  const getLatest = (fileList) => {
    if (fileList.length === 0) return null;
    return fileList.sort().reverse()[0];
  };
  
  return {
    scan: scanFiles.length > 0 ? path.join(OUTPUT_DIR, getLatest(scanFiles)) : null,
    dynamic: dynamicFiles.length > 0 ? path.join(OUTPUT_DIR, getLatest(dynamicFiles)) : null,
    modals: modalsFiles.length > 0 ? path.join(OUTPUT_DIR, getLatest(modalsFiles)) : null
  };
}

/**
 * Generate work report for a single page
 */
function generatePageWorkReport(pageData, dynamicData, modalsData) {
  const pageName = pageData.page;
  
  let report = `# דוח עבודה - ${pageName}.html\n\n`;
  report += `**תאריך יצירה:** ${new Date().toLocaleString('he-IL')}\n\n`;
  
  // Summary
  report += `## סיכום\n\n`;
  report += `- **סה"כ כפתורים:** ${pageData.totalButtons}\n`;
  report += `- **כפתורים עם טולטיפ:** ${pageData.buttonsWithTooltip}\n`;
  report += `- **כפתורים ללא טולטיפ:** ${pageData.buttonsNeedingTooltip} ⚠️\n`;
  report += `- **כפתורים עם ID:** ${pageData.buttonsWithId}\n`;
  report += `- **כפתורים ללא ID:** ${pageData.buttonsNeedingId} ⚠️\n`;
  if (pageData.modalsCount) {
    report += `- **מודולים:** ${pageData.modalsCount}\n`;
  }
  report += `\n`;
  
  // Static buttons needing fixes
  const staticButtonsNeedingFix = pageData.buttons.filter(b => 
    (b.needsTooltip || b.needsId) && !b.inModal
  );
  
  if (staticButtonsNeedingFix.length > 0) {
    report += `## כפתורים סטטיים שצריכים תיקון\n\n`;
    staticButtonsNeedingFix.forEach((button, index) => {
      report += `### כפתור #${button.index} - ${button.type}\n\n`;
      report += `- **שורה:** ${button.line}\n`;
      report += `- **סוג:** ${button.type}\n`;
      if (button.entityType) {
        report += `- **סוג ישות:** ${button.entityType}\n`;
      }
      if (button.onclick) {
        report += `- **onclick:** \`${button.onclick.substring(0, 100)}${button.onclick.length > 100 ? '...' : ''}\`\n`;
      }
      if (button.text) {
        report += `- **טקסט:** ${button.text}\n`;
      }
      report += `\n`;
      
      if (button.needsTooltip) {
        report += `#### צריך טולטיפ:\n`;
        if (button.recommendedTooltip) {
          report += `- **המלצה:** \`data-tooltip="${button.recommendedTooltip}"\`\n`;
        } else {
          report += `- **צריך להגדיר טולטיפ מתאים**\n`;
        }
        report += `- **מיקום:** שורה ${button.line} בקובץ \`${pageData.file}\`\n`;
        report += `\n`;
      }
      
      if (button.needsId) {
        report += `#### צריך ID:\n`;
        if (button.recommendedId) {
          report += `- **המלצה:** \`data-id="${button.recommendedId}"\`\n`;
        } else {
          report += `- **צריך להגדיר ID ייחודי**\n`;
        }
        report += `- **מיקום:** שורה ${button.line} בקובץ \`${pageData.file}\`\n`;
        report += `\n`;
      }
      
      report += `---\n\n`;
    });
  }
  
  // Modal buttons
  if (pageData.modals && pageData.modals.length > 0) {
    report += `## כפתורים במודולים\n\n`;
    pageData.modals.forEach((modal, modalIndex) => {
      report += `### מודול ${modalIndex + 1}: ${modal.id || 'ללא ID'}\n\n`;
      report += `- **סה"כ כפתורים:** ${modal.buttonCount}\n`;
      report += `- **צריכים טולטיפ:** ${modal.buttons.filter(b => b.needsTooltip).length}\n`;
      report += `- **צריכים ID:** ${modal.buttons.filter(b => b.needsId).length}\n\n`;
      
      const modalButtonsNeedingFix = modal.buttons.filter(b => b.needsTooltip || b.needsId);
      if (modalButtonsNeedingFix.length > 0) {
        modalButtonsNeedingFix.forEach((button, btnIndex) => {
          report += `#### כפתור #${btnIndex + 1} - ${button.type}\n\n`;
          report += `- **שורה:** ${button.line}\n`;
          report += `- **מיקום במודול:** ${button.location || 'unknown'}\n`;
          if (button.needsTooltip) {
            report += `- **צריך טולטיפ:** \`data-tooltip="..."\`\n`;
          }
          if (button.needsId) {
            report += `- **צריך ID:** \`data-id="..."\`\n`;
          }
          report += `\n`;
        });
      }
      report += `---\n\n`;
    });
  }
  
  // Dynamic buttons from JavaScript
  if (dynamicData) {
    const pageDynamicData = dynamicData.pages.find(p => p.page === pageName);
    if (pageDynamicData && Object.values(pageDynamicData.summary).some(v => v > 0)) {
      report += `## כפתורים דינמיים (JavaScript)\n\n`;
      report += `### סיכום\n\n`;
      report += `- **createActionsMenu:** ${pageDynamicData.summary.createActionsMenuCount} קריאות\n`;
      report += `- **updateTooltip:** ${pageDynamicData.summary.updateTooltipCount} קריאות\n`;
      report += `- **יצירת כפתורים:** ${pageDynamicData.summary.buttonCreationCount} מקומות\n`;
      report += `- **toggleSection:** ${pageDynamicData.summary.toggleSectionCount} קריאות\n`;
      report += `- **HTML דינמי:** ${pageDynamicData.summary.dynamicHTMLCount} מקומות\n\n`;
      
      if (pageDynamicData.findings.createActionsMenu.length > 0) {
        report += `### createActionsMenu\n\n`;
        pageDynamicData.findings.createActionsMenu.forEach((finding, idx) => {
          report += `#### קריאה #${idx + 1}\n\n`;
          report += `- **שורה:** ${finding.line}\n`;
          report += `- **קוד:** \`\`\`javascript\n${finding.code}\n\`\`\`\n\n`;
        });
      }
      
      if (pageDynamicData.findings.updateTooltip.length > 0) {
        report += `### updateTooltip\n\n`;
        report += `✅ יש עדכון טולטיפים דינמיים - בדוק שהקוד נכון\n\n`;
        pageDynamicData.findings.updateTooltip.forEach((finding, idx) => {
          report += `#### עדכון #${idx + 1}\n\n`;
          report += `- **שורה:** ${finding.line}\n`;
          report += `- **קוד:** \`\`\`javascript\n${finding.code}\n\`\`\`\n\n`;
        });
      }
      
      report += `---\n\n`;
    }
  }
  
  // Action items
  report += `## פעולות נדרשות\n\n`;
  const actionItems = [];
  
  if (staticButtonsNeedingFix.length > 0) {
    actionItems.push(`1. עדכון ${staticButtonsNeedingFix.length} כפתורים סטטיים - הוספת \`data-tooltip\` ו/או \`data-id\``);
  }
  
  if (pageData.modals && pageData.modals.length > 0) {
    const modalButtonsNeedingFix = pageData.modals.reduce((sum, m) => 
      sum + m.buttons.filter(b => b.needsTooltip || b.needsId).length, 0);
    if (modalButtonsNeedingFix > 0) {
      actionItems.push(`2. עדכון ${modalButtonsNeedingFix} כפתורים במודולים - הוספת \`data-tooltip\` ו/או \`data-id\``);
    }
  }
  
  if (dynamicData) {
    const pageDynamicData = dynamicData.pages.find(p => p.page === pageName);
    if (pageDynamicData && pageDynamicData.summary.createActionsMenuCount > 0) {
      actionItems.push(`3. בדיקת כפתורי createActionsMenu - וידוא שיש טולטיפים נכונים`);
    }
    if (pageDynamicData && pageDynamicData.summary.toggleSectionCount > 0) {
      actionItems.push(`4. בדיקת כפתורי toggleSection - וידוא שיש עדכון טולטיפ דינמי`);
    }
  }
  
  if (actionItems.length === 0) {
    report += `✅ כל הכפתורים מוכנים!\n\n`;
  } else {
    actionItems.forEach((item, idx) => {
      report += `${item}\n`;
    });
    report += `\n`;
  }
  
  // Priority
  report += `## עדיפות\n\n`;
  const needsWork = pageData.buttonsNeedingTooltip > 0 || pageData.buttonsNeedingId > 0;
  if (needsWork) {
    const priority = pageData.totalButtons > 30 ? 'גבוהה' : 
                     pageData.totalButtons > 10 ? 'בינונית' : 'נמוכה';
    report += `**${priority}** - ${pageData.buttonsNeedingTooltip + pageData.buttonsNeedingId} כפתורים שצריכים תיקון\n\n`;
  } else {
    report += `✅ **מוכן** - כל הכפתורים תקינים\n\n`;
  }
  
  return report;
}

/**
 * Main function
 */
function generateWorkReports() {
  // Find scan files if not provided
  let scanData = null;
  let dynamicData = null;
  let modalsData = null;
  
  if (scanFile && fs.existsSync(scanFile)) {
    scanData = JSON.parse(fs.readFileSync(scanFile, 'utf-8'));
  } else {
    const latest = findLatestScanFiles();
    if (latest.scan) {
      console.log(`📂 Using latest scan file: ${latest.scan}`);
      scanData = JSON.parse(fs.readFileSync(latest.scan, 'utf-8'));
    } else {
      console.error('❌ No scan file found. Run scan-button-tooltips.js first.');
      process.exit(1);
    }
  }
  
  if (dynamicFile && fs.existsSync(dynamicFile)) {
    dynamicData = JSON.parse(fs.readFileSync(dynamicFile, 'utf-8'));
  } else {
    const latest = findLatestScanFiles();
    if (latest.dynamic) {
      console.log(`📂 Using latest dynamic file: ${latest.dynamic}`);
      dynamicData = JSON.parse(fs.readFileSync(latest.dynamic, 'utf-8'));
    }
  }
  
  if (modalsFile && fs.existsSync(modalsFile)) {
    modalsData = JSON.parse(fs.readFileSync(modalsFile, 'utf-8'));
  } else {
    const latest = findLatestScanFiles();
    if (latest.modals) {
      console.log(`📂 Using latest modals file: ${latest.modals}`);
      modalsData = JSON.parse(fs.readFileSync(latest.modals, 'utf-8'));
    }
  }
  
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Filter pages if specified
  const pagesToProcess = pageFilter
    ? scanData.pages.filter(p => p.page === pageFilter)
    : scanData.pages;
  
  console.log(`📋 Generating work reports for ${pagesToProcess.length} pages...\n`);
  
  pagesToProcess.forEach(pageData => {
    const report = generatePageWorkReport(pageData, dynamicData, modalsData);
    const outputPath = path.join(OUTPUT_DIR, `work-report-${pageData.page}.md`);
    fs.writeFileSync(outputPath, report, 'utf-8');
    console.log(`✅ Generated: work-report-${pageData.page}.md`);
  });
  
  console.log(`\n💾 Work reports saved to: ${OUTPUT_DIR}`);
}

// Run if called directly
if (require.main === module) {
  generateWorkReports();
}

module.exports = { generateWorkReports, generatePageWorkReport };

