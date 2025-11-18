#!/usr/bin/env node
/**
 * Batch Button Tooltips Recommendations Generator
 * Generates detailed recommendations report for manual updates (NO CODE EDITING)
 * 
 * Usage:
 *   node scripts/update-button-tooltips-batch.js --scan-file SCAN_FILE.json [--page PAGE_NAME]
 * 
 * Example:
 *   node scripts/update-button-tooltips-batch.js --scan-file reports/button-tooltips-scan-1234567890.json --page trades
 * 
 * NOTE: This script only generates reports - it does NOT edit any code files.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const OUTPUT_DIR = path.join(__dirname, '..', 'reports', 'button-tooltips-scan');

// Parse command line arguments
const args = process.argv.slice(2);
const scanFile = args.includes('--scan-file') ? args[args.indexOf('--scan-file') + 1] : null;
const pageFilter = args.includes('--page') ? args[args.indexOf('--page') + 1] : null;

if (!scanFile || !fs.existsSync(scanFile)) {
  console.error('❌ Error: --scan-file is required and must exist');
  console.error('   Run: node scripts/scan-button-tooltips.js first');
  process.exit(1);
}

/**
 * Generate recommendations for a single page
 */
function generatePageRecommendations(pageData) {
  const filePath = pageData.file;
  const recommendations = [];
  
  // Process each button that needs updates
  pageData.buttons.forEach(button => {
    const needsUpdate = button.needsTooltip || button.needsId;
    if (!needsUpdate) return;
    
    const recommendation = {
      buttonIndex: button.index,
      buttonType: button.type,
      line: button.line,
      needsTooltip: button.needsTooltip,
      needsId: button.needsId,
      recommendedTooltip: button.recommendedTooltip,
      recommendedId: button.recommendedId,
      currentHTML: button.html || 'לא זמין',
      suggestedHTML: '',
      changes: []
    };
    
    // Build suggested HTML
    let suggestedHTML = recommendation.currentHTML;
    
    if (button.needsId && button.recommendedId) {
      if (!suggestedHTML.includes('data-id=')) {
        // Insert data-id after data-button-type
        if (suggestedHTML.includes('data-button-type')) {
          suggestedHTML = suggestedHTML.replace(
            /(data-button-type="[^"]*")/,
            `$1 data-id="${button.recommendedId}"`
          );
        } else {
          suggestedHTML = suggestedHTML.replace(/<button/, `<button data-id="${button.recommendedId}"`);
        }
        recommendation.changes.push(`הוסף: data-id="${button.recommendedId}"`);
      }
    }
    
    if (button.needsTooltip && button.recommendedTooltip) {
      if (!suggestedHTML.includes('data-tooltip=')) {
        // Insert data-tooltip attributes
        const tooltipAttrs = `data-tooltip="${button.recommendedTooltip}" data-tooltip-placement="top" data-tooltip-trigger="hover"`;
        if (suggestedHTML.includes('data-id=')) {
          suggestedHTML = suggestedHTML.replace(
            /(data-id="[^"]*")/,
            `$1 ${tooltipAttrs}`
          );
        } else if (suggestedHTML.includes('data-button-type')) {
          suggestedHTML = suggestedHTML.replace(
            /(data-button-type="[^"]*")/,
            `$1 ${tooltipAttrs}`
          );
        } else {
          suggestedHTML = suggestedHTML.replace(/<button/, `<button ${tooltipAttrs}`);
        }
        recommendation.changes.push(`הוסף: data-tooltip="${button.recommendedTooltip}"`);
        recommendation.changes.push(`הוסף: data-tooltip-placement="top"`);
        recommendation.changes.push(`הוסף: data-tooltip-trigger="hover"`);
      }
    }
    
    recommendation.suggestedHTML = suggestedHTML;
    recommendations.push(recommendation);
  });
  
  return {
    page: pageData.page,
    file: filePath,
    totalRecommendations: recommendations.length,
    recommendations: recommendations
  };
}

/**
 * Generate recommendations report
 */
function generateRecommendationsReport() {
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  const scanData = JSON.parse(fs.readFileSync(scanFile, 'utf-8'));
  
  console.log(`📋 Generating recommendations from scan file: ${scanFile}\n`);
  console.log('⚠️  NOTE: This script only generates reports - it does NOT edit any code files.\n');
  
  const pagesToProcess = pageFilter
    ? scanData.pages.filter(p => p.page === pageFilter)
    : scanData.pages;
  
  const results = [];
  let totalRecommendations = 0;
  
  pagesToProcess.forEach(pageData => {
    console.log(`\n📄 Processing ${pageData.page}...`);
    const result = generatePageRecommendations(pageData);
    results.push(result);
    totalRecommendations += result.totalRecommendations;
    
    if (result.totalRecommendations > 0) {
      console.log(`   ✅ Generated ${result.totalRecommendations} recommendations`);
    } else {
      console.log(`   ✅ No recommendations needed`);
    }
  });
  
  // Generate markdown report
  const timestamp = Date.now();
  let report = `# דוח המלצות לעדכון ידני - טולטיפים לכפתורים\n\n`;
  report += `**תאריך יצירה:** ${new Date().toLocaleString('he-IL')}\n\n`;
  report += `**הערה חשובה:** דוח זה מכיל המלצות בלבד. כל העדכונים נעשים ידנית.\n\n`;
  
  report += `## סיכום\n\n`;
  report += `- **סה"כ עמודים:** ${results.length}\n`;
  report += `- **סה"כ המלצות:** ${totalRecommendations}\n\n`;
  
  results.forEach(result => {
    if (result.totalRecommendations > 0) {
      report += `## ${result.page}.html\n\n`;
      report += `**קובץ:** \`${result.file}\`\n\n`;
      report += `**סה"כ המלצות:** ${result.totalRecommendations}\n\n`;
      
      result.recommendations.forEach((rec, idx) => {
        report += `### המלצה #${idx + 1} - כפתור ${rec.buttonType}\n\n`;
        report += `**מיקום:** שורה ${rec.line}\n\n`;
        report += `**קוד נוכחי:**\n`;
        report += `\`\`\`html\n${rec.currentHTML}\n\`\`\`\n\n`;
        report += `**קוד מוצע:**\n`;
        report += `\`\`\`html\n${rec.suggestedHTML}\n\`\`\`\n\n`;
        report += `**שינויים נדרשים:**\n`;
        rec.changes.forEach(change => {
          report += `- ${change}\n`;
        });
        report += `\n---\n\n`;
      });
    }
  });
  
  const reportPath = path.join(OUTPUT_DIR, `recommendations-${timestamp}.md`);
  fs.writeFileSync(reportPath, report, 'utf-8');
  
  console.log(`\n📊 Summary:`);
  console.log(`   Pages processed: ${results.length}`);
  console.log(`   Total recommendations: ${totalRecommendations}`);
  console.log(`\n💾 Recommendations report saved to: ${reportPath}`);
  console.log(`\n💡 Use this report to manually update the HTML files.`);
}

// Run if called directly
if (require.main === module) {
  generateRecommendationsReport();
}

module.exports = { generateRecommendationsReport, generatePageRecommendations };

