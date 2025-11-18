#!/usr/bin/env node
/**
 * Summary Report Generator
 * Generates a comprehensive summary report for the entire system
 * 
 * Usage:
 *   node scripts/generate-summary-report.js [--scan-file SCAN_FILE.json] [--dynamic-file DYNAMIC_FILE.json] [--modals-file MODALS_FILE.json]
 * 
 * Example:
 *   node scripts/generate-summary-report.js
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
 * Generate summary report
 */
function generateSummaryReport() {
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
  
  const timestamp = Date.now();
  let report = `# דוח סיכום כללי - סטנדרטיזציית טולטיפים\n\n`;
  report += `**תאריך יצירה:** ${new Date().toLocaleString('he-IL')}\n\n`;
  
  // Overall statistics
  report += `## סטטיסטיקות כלליות\n\n`;
  report += `- **סה"כ עמודים:** ${scanData.totalPages}\n`;
  report += `- **סה"כ כפתורים:** ${scanData.totalButtons}\n`;
  report += `- **כפתורים עם טולטיפ:** ${scanData.totalButtons - scanData.totalNeedingTooltip} (${Math.round((scanData.totalButtons - scanData.totalNeedingTooltip) / scanData.totalButtons * 100)}%)\n`;
  report += `- **כפתורים ללא טולטיפ:** ${scanData.totalNeedingTooltip} ⚠️ (${Math.round(scanData.totalNeedingTooltip / scanData.totalButtons * 100)}%)\n`;
  report += `- **כפתורים עם ID:** ${scanData.totalButtons - scanData.totalNeedingId} (${Math.round((scanData.totalButtons - scanData.totalNeedingId) / scanData.totalButtons * 100)}%)\n`;
  report += `- **כפתורים ללא ID:** ${scanData.totalNeedingId} ⚠️ (${Math.round(scanData.totalNeedingId / scanData.totalButtons * 100)}%)\n`;
  
  const totalModals = scanData.pages.reduce((sum, p) => sum + (p.modalsCount || 0), 0);
  report += `- **סה"כ מודולים:** ${totalModals}\n`;
  
  if (dynamicData) {
    report += `- **קבצי JavaScript נסרקו:** ${dynamicData.totalPages}\n`;
    report += `- **ממצאים דינמיים:** ${dynamicData.totalFindings}\n`;
  }
  
  report += `\n`;
  
  // Pages by priority
  report += `## עמודים לפי עדיפות\n\n`;
  
  // Priority 1: High (many buttons needing work)
  const priority1 = scanData.pages.filter(p => 
    (p.buttonsNeedingTooltip > 0 || p.buttonsNeedingId > 0) && p.totalButtons > 20
  );
  
  // Priority 2: Medium (some buttons needing work)
  const priority2 = scanData.pages.filter(p => 
    (p.buttonsNeedingTooltip > 0 || p.buttonsNeedingId > 0) && p.totalButtons <= 20 && p.totalButtons > 10
  );
  
  // Priority 3: Low (few buttons needing work)
  const priority3 = scanData.pages.filter(p => 
    (p.buttonsNeedingTooltip > 0 || p.buttonsNeedingId > 0) && p.totalButtons <= 10
  );
  
  // Ready pages
  const ready = scanData.pages.filter(p => 
    p.buttonsNeedingTooltip === 0 && p.buttonsNeedingId === 0
  );
  
  report += `### עדיפות 1 (גבוהה) - ${priority1.length} עמודים\n\n`;
  if (priority1.length > 0) {
    report += `| עמוד | כפתורים | ללא טולטיפ | ללא ID | מודולים |\n`;
    report += `|------|---------|------------|--------|---------|\n`;
    priority1.forEach(page => {
      report += `| ${page.page} | ${page.totalButtons} | ${page.buttonsNeedingTooltip} | ${page.buttonsNeedingId} | ${page.modalsCount || 0} |\n`;
    });
    report += `\n`;
  } else {
    report += `✅ אין עמודים בעדיפות גבוהה\n\n`;
  }
  
  report += `### עדיפות 2 (בינונית) - ${priority2.length} עמודים\n\n`;
  if (priority2.length > 0) {
    report += `| עמוד | כפתורים | ללא טולטיפ | ללא ID | מודולים |\n`;
    report += `|------|---------|------------|--------|---------|\n`;
    priority2.forEach(page => {
      report += `| ${page.page} | ${page.totalButtons} | ${page.buttonsNeedingTooltip} | ${page.buttonsNeedingId} | ${page.modalsCount || 0} |\n`;
    });
    report += `\n`;
  } else {
    report += `✅ אין עמודים בעדיפות בינונית\n\n`;
  }
  
  report += `### עדיפות 3 (נמוכה) - ${priority3.length} עמודים\n\n`;
  if (priority3.length > 0) {
    report += `| עמוד | כפתורים | ללא טולטיפ | ללא ID | מודולים |\n`;
    report += `|------|---------|------------|--------|---------|\n`;
    priority3.forEach(page => {
      report += `| ${page.page} | ${page.totalButtons} | ${page.buttonsNeedingTooltip} | ${page.buttonsNeedingId} | ${page.modalsCount || 0} |\n`;
    });
    report += `\n`;
  } else {
    report += `✅ אין עמודים בעדיפות נמוכה\n\n`;
  }
  
  report += `### מוכנים - ${ready.length} עמודים\n\n`;
  if (ready.length > 0) {
    report += `| עמוד | כפתורים | מודולים |\n`;
    report += `|------|---------|---------|\n`;
    ready.forEach(page => {
      report += `| ${page.page} | ${page.totalButtons} | ${page.modalsCount || 0} |\n`;
    });
    report += `\n`;
  } else {
    report += `⚠️ אין עמודים מוכנים\n\n`;
  }
  
  // All pages table
  report += `## רשימת כל העמודים\n\n`;
  report += `| עמוד | כפתורים | עם טולטיפ | ללא טולטיפ | עם ID | ללא ID | מודולים | סטטוס |\n`;
  report += `|------|---------|-----------|------------|------|--------|---------|--------|\n`;
  
  scanData.pages.forEach(page => {
    const needsWork = page.buttonsNeedingTooltip > 0 || page.buttonsNeedingId > 0;
    const status = needsWork ? '⚠️ צריך עבודה' : '✅ מוכן';
    report += `| ${page.page} | ${page.totalButtons} | ${page.buttonsWithTooltip} | ${page.buttonsNeedingTooltip} | ${page.buttonsWithId} | ${page.buttonsNeedingId} | ${page.modalsCount || 0} | ${status} |\n`;
  });
  
  report += `\n`;
  
  // Time estimation
  report += `## הערכת זמן\n\n`;
  const totalNeedingWork = scanData.totalNeedingTooltip + scanData.totalNeedingId;
  const avgTimePerButton = 2; // minutes
  const estimatedMinutes = totalNeedingWork * avgTimePerButton;
  const estimatedHours = Math.ceil(estimatedMinutes / 60);
  
  report += `- **סה"כ כפתורים שצריכים עבודה:** ${totalNeedingWork}\n`;
  report += `- **זמן משוער לכפתור:** ${avgTimePerButton} דקות\n`;
  report += `- **זמן משוער כולל:** ${estimatedHours} שעות (${estimatedMinutes} דקות)\n`;
  report += `\n`;
  
  report += `### פירוט לפי עדיפות:\n\n`;
  report += `- **עדיפות 1:** ${priority1.reduce((sum, p) => sum + p.buttonsNeedingTooltip + p.buttonsNeedingId, 0)} כפתורים - ${Math.ceil(priority1.reduce((sum, p) => sum + p.buttonsNeedingTooltip + p.buttonsNeedingId, 0) * avgTimePerButton / 60)} שעות\n`;
  report += `- **עדיפות 2:** ${priority2.reduce((sum, p) => sum + p.buttonsNeedingTooltip + p.buttonsNeedingId, 0)} כפתורים - ${Math.ceil(priority2.reduce((sum, p) => sum + p.buttonsNeedingTooltip + p.buttonsNeedingId, 0) * avgTimePerButton / 60)} שעות\n`;
  report += `- **עדיפות 3:** ${priority3.reduce((sum, p) => sum + p.buttonsNeedingTooltip + p.buttonsNeedingId, 0)} כפתורים - ${Math.ceil(priority3.reduce((sum, p) => sum + p.buttonsNeedingTooltip + p.buttonsNeedingId, 0) * avgTimePerButton / 60)} שעות\n`;
  report += `\n`;
  
  // Next steps
  report += `## שלבים הבאים\n\n`;
  report += `1. **סריקה:** ✅ הושלם\n`;
  report += `2. **דוחות עבודה:** הרץ \`node scripts/generate-work-report.js\` ליצירת דוחות עבודה לכל עמוד\n`;
  report += `3. **עדכון ידני:** עבוד לפי דוחות העבודה, עמוד אחר עמוד\n`;
  report += `4. **בדיקת שלמות:** הרץ \`node scripts/verify-tooltips-completeness.js\` לאחר כל עדכון\n`;
  report += `\n`;
  
  // Save report
  const outputPath = path.join(OUTPUT_DIR, `SUMMARY-${timestamp}.md`);
  fs.writeFileSync(outputPath, report, 'utf-8');
  
  console.log(`\n💾 Summary report saved to: ${outputPath}`);
  
  return report;
}

// Run if called directly
if (require.main === module) {
  generateSummaryReport();
}

module.exports = { generateSummaryReport };

