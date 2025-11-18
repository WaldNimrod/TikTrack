#!/usr/bin/env node
/**
 * Dynamic Buttons Scanner
 * Scans JavaScript files for dynamically created buttons
 * 
 * Usage:
 *   node scripts/scan-dynamic-buttons.js [--page PAGE_NAME] [--output OUTPUT_FILE]
 * 
 * Example:
 *   node scripts/scan-dynamic-buttons.js --page trades --output reports/dynamic-buttons-trades.json
 */

const fs = require('fs');
const path = require('path');

// Configuration
const TRADING_UI_DIR = path.join(__dirname, '..', 'trading-ui');
const SCRIPTS_DIR = path.join(TRADING_UI_DIR, 'scripts');
const OUTPUT_DIR = path.join(__dirname, '..', 'reports', 'button-tooltips-scan');

// Parse command line arguments
const args = process.argv.slice(2);
const pageFilter = args.includes('--page') ? args[args.indexOf('--page') + 1] : null;
const outputFile = args.includes('--output') ? args[args.indexOf('--output') + 1] : null;

/**
 * Find JavaScript file for a page
 */
function findPageJSFile(pageName) {
  const possiblePaths = [
    path.join(SCRIPTS_DIR, `${pageName}.js`),
    path.join(SCRIPTS_DIR, `${pageName.replace('_', '-')}.js`),
    path.join(SCRIPTS_DIR, `${pageName.replace('-', '_')}.js`)
  ];
  
  for (const filePath of possiblePaths) {
    if (fs.existsSync(filePath)) {
      return filePath;
    }
  }
  
  return null;
}

/**
 * Scan a JavaScript file for dynamic button creation
 */
function scanJSFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const pageName = path.basename(filePath, '.js');
  
  const findings = {
    createActionsMenu: [],
    updateTooltip: [],
    buttonCreation: [],
    toggleSection: [],
    dynamicHTML: []
  };
  
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();
    
    // Find createActionsMenu calls
    if (trimmedLine.includes('createActionsMenu') || trimmedLine.includes('window.createActionsMenu')) {
      findings.createActionsMenu.push({
        line: lineNum,
        code: trimmedLine.substring(0, 200),
        context: getContext(lines, index, 3)
      });
    }
    
    // Find updateTooltip calls
    if (trimmedLine.includes('updateTooltip') || trimmedLine.includes('window.updateTooltip') || 
        trimmedLine.includes('advancedButtonSystem.updateTooltip')) {
      findings.updateTooltip.push({
        line: lineNum,
        code: trimmedLine.substring(0, 200),
        context: getContext(lines, index, 3)
      });
    }
    
    // Find button creation patterns
    if (trimmedLine.includes('data-button-type') && 
        (trimmedLine.includes('createElement') || trimmedLine.includes('innerHTML') || 
         trimmedLine.includes('insertAdjacentHTML') || trimmedLine.includes('outerHTML'))) {
      findings.buttonCreation.push({
        line: lineNum,
        code: trimmedLine.substring(0, 200),
        context: getContext(lines, index, 3)
      });
    }
    
    // Find toggleSection calls (for dynamic toggle buttons)
    if (trimmedLine.includes('toggleSection')) {
      findings.toggleSection.push({
        line: lineNum,
        code: trimmedLine.substring(0, 200),
        context: getContext(lines, index, 3)
      });
    }
    
    // Find dynamic HTML with buttons
    if (trimmedLine.includes('<button') && trimmedLine.includes('data-button-type')) {
      findings.dynamicHTML.push({
        line: lineNum,
        code: trimmedLine.substring(0, 200),
        context: getContext(lines, index, 3)
      });
    }
  });
  
  return {
    page: pageName,
    file: filePath,
    findings: findings,
    summary: {
      createActionsMenuCount: findings.createActionsMenu.length,
      updateTooltipCount: findings.updateTooltip.length,
      buttonCreationCount: findings.buttonCreation.length,
      toggleSectionCount: findings.toggleSection.length,
      dynamicHTMLCount: findings.dynamicHTML.length
    }
  };
}

/**
 * Get context lines around a specific line
 */
function getContext(lines, lineIndex, contextSize = 3) {
  const start = Math.max(0, lineIndex - contextSize);
  const end = Math.min(lines.length, lineIndex + contextSize + 1);
  return lines.slice(start, end).map((line, idx) => ({
    line: start + idx + 1,
    content: line
  }));
}

/**
 * Main scanning function
 */
function scanAllPages() {
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Get all HTML files to find corresponding JS files
  const htmlFiles = fs.readdirSync(TRADING_UI_DIR)
    .filter(file => file.endsWith('.html'))
    .filter(file => !file.includes('backup') && !file.includes('test') && !file.includes('tooltip-editor'))
    .map(file => path.basename(file, '.html'));
  
  // Filter by page if specified
  const pagesToScan = pageFilter 
    ? htmlFiles.filter(page => page === pageFilter)
    : htmlFiles;
  
  console.log(`📋 Scanning JavaScript files for ${pagesToScan.length} pages...\n`);
  
  const results = [];
  let totalFindings = 0;
  
  pagesToScan.forEach(pageName => {
    const jsFile = findPageJSFile(pageName);
    if (jsFile) {
      try {
        const result = scanJSFile(jsFile);
        results.push(result);
        totalFindings += Object.values(result.summary).reduce((sum, val) => sum + val, 0);
        
        const summary = result.summary;
        console.log(`✅ ${result.page}: ${summary.createActionsMenuCount} createActionsMenu, ${summary.updateTooltipCount} updateTooltip, ${summary.buttonCreationCount} button creation, ${summary.toggleSectionCount} toggleSection`);
      } catch (error) {
        console.error(`❌ Error scanning ${jsFile}:`, error.message);
      }
    } else {
      console.log(`⚠️  ${pageName}: No JavaScript file found`);
    }
  });
  
  // Generate summary
  const summary = {
    scanDate: new Date().toISOString(),
    totalPages: results.length,
    totalFindings: totalFindings,
    pages: results
  };
  
  // Save results
  const timestamp = Date.now();
  const outputPath = outputFile || path.join(OUTPUT_DIR, `dynamic-buttons-${timestamp}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2), 'utf-8');
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total pages scanned: ${summary.totalPages}`);
  console.log(`   Total findings: ${summary.totalFindings}`);
  console.log(`\n💾 Results saved to: ${outputPath}`);
  
  return summary;
}

// Run if called directly
if (require.main === module) {
  scanAllPages();
}

module.exports = { scanAllPages, scanJSFile };

