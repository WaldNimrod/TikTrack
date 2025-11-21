#!/usr/bin/env node
/**
 * ID Conflicts Checker
 * Checks for duplicate IDs across all pages
 * 
 * Usage:
 *   node scripts/check-id-conflicts.js [--page PAGE_NAME] [--output OUTPUT_FILE]
 * 
 * Example:
 *   node scripts/check-id-conflicts.js
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
 * Check ID conflicts in a single HTML file
 */
function checkIDConflictsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const dom = new JSDOM(content);
  const document = dom.window.document;
  
  const pageName = path.basename(filePath, '.html');
  const idMap = new Map();
  const conflicts = [];
  
  // Find all buttons with data-button-type
  const buttonElements = document.querySelectorAll('[data-button-type]');
  
  buttonElements.forEach((button, index) => {
    const id = button.getAttribute('data-id');
    if (id) {
      if (!idMap.has(id)) {
        idMap.set(id, []);
      }
      
      // Get line number
      const buttonHTML = button.outerHTML;
      const buttonIndex = content.indexOf(buttonHTML);
      const contentBeforeButton = buttonIndex >= 0 ? content.substring(0, buttonIndex) : '';
      const line = (contentBeforeButton.match(/\n/g) || []).length + 1;
      
      idMap.get(id).push({
        type: button.getAttribute('data-button-type'),
        onclick: button.getAttribute('data-onclick'),
        line: line,
        index: index + 1
      });
    }
  });
  
  // Find conflicts (IDs used more than once)
  idMap.forEach((buttons, id) => {
    if (buttons.length > 1) {
      conflicts.push({
        id: id,
        count: buttons.length,
        buttons: buttons
      });
    }
  });
  
  return {
    page: pageName,
    file: filePath,
    totalButtons: buttonElements.length,
    buttonsWithId: idMap.size,
    conflicts: conflicts,
    conflictCount: conflicts.length
  };
}

/**
 * Main checking function
 */
function checkIDConflicts() {
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
  
  console.log(`📋 Checking ID conflicts for ${filesToScan.length} HTML files...\n`);
  
  const results = [];
  let totalConflicts = 0;
  
  filesToScan.forEach(filePath => {
    try {
      const result = checkIDConflictsInFile(filePath);
      results.push(result);
      totalConflicts += result.conflictCount;
      
      if (result.conflictCount > 0) {
        console.log(`⚠️  ${result.page}: ${result.conflictCount} ID conflicts found`);
      } else {
        console.log(`✅ ${result.page}: No ID conflicts`);
      }
    } catch (error) {
      console.error(`❌ Error checking ${filePath}:`, error.message);
    }
  });
  
  // Generate summary
  const summary = {
    scanDate: new Date().toISOString(),
    totalPages: results.length,
    totalConflicts: totalConflicts,
    pages: results
  };
  
  // Save results
  const timestamp = Date.now();
  const outputPath = outputFile || path.join(OUTPUT_DIR, `id-conflicts-${timestamp}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2), 'utf-8');
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total pages: ${summary.totalPages}`);
  console.log(`   Total ID conflicts: ${summary.totalConflicts}`);
  
  if (totalConflicts > 0) {
    console.log(`\n⚠️  ID conflicts found! See details in: ${outputPath}`);
    
    // Print details
    results.forEach(result => {
      if (result.conflicts.length > 0) {
        console.log(`\n📄 ${result.page}.html:`);
        result.conflicts.forEach(conflict => {
          console.log(`   ID "${conflict.id}" used ${conflict.count} times:`);
          conflict.buttons.forEach(btn => {
            console.log(`     - ${btn.type} button (line ${btn.line})`);
          });
        });
      }
    });
    
    process.exit(1);
  } else {
    console.log(`\n✅ No ID conflicts found!`);
  }
  
  console.log(`\n💾 Results saved to: ${outputPath}`);
  
  return summary;
}

// Run if called directly
if (require.main === module) {
  checkIDConflicts();
}

module.exports = { checkIDConflicts, checkIDConflictsInFile };

