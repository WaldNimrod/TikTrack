#!/usr/bin/env node
/**
 * Tooltip Texts Validator
 * Validates tooltip texts for correctness and consistency
 * 
 * Usage:
 *   node scripts/validate-tooltip-texts.js [--page PAGE_NAME] [--output OUTPUT_FILE]
 * 
 * Example:
 *   node scripts/validate-tooltip-texts.js
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
 * Load button-tooltips-config.js if available
 */
function loadTooltipConfig() {
  const configPath = path.join(__dirname, '..', 'trading-ui', 'scripts', 'button-tooltips-config.js');
  if (fs.existsSync(configPath)) {
    try {
      // Read and evaluate the config file
      const configContent = fs.readFileSync(configPath, 'utf-8');
      // Extract BUTTON_TOOLTIPS_CONFIG object (simplified parsing)
      // In a real scenario, we might want to use a proper JS parser
      return null; // For now, return null - can be enhanced later
    } catch (error) {
      return null;
    }
  }
  return null;
}

/**
 * Validate tooltip texts in a single HTML file
 */
function validateTooltipTextsInFile(filePath) {
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
    const tooltip = button.getAttribute('data-tooltip') || null;
    const onclick = button.getAttribute('data-onclick') || null;
    const entityType = button.getAttribute('data-entity-type') || null;
    const text = button.getAttribute('data-text') || button.textContent.trim() || null;
    
    // Get line number
    const buttonHTML = button.outerHTML;
    const buttonIndex = content.indexOf(buttonHTML);
    const contentBeforeButton = buttonIndex >= 0 ? content.substring(0, buttonIndex) : '';
    const line = (contentBeforeButton.match(/\n/g) || []).length + 1;
    
    const buttonInfo = {
      index: index + 1,
      type: buttonType,
      tooltip: tooltip,
      onclick: onclick,
      entityType: entityType,
      text: text,
      line: line,
      issues: []
    };
    
    // Validate tooltip if present
    if (tooltip) {
      // Check for empty tooltip
      if (tooltip.trim() === '') {
        buttonInfo.issues.push('empty-tooltip');
        issues.push({
          type: 'empty-tooltip',
          button: buttonInfo,
          severity: 'high'
        });
      }
      
      // Check for very short tooltips (might be placeholders)
      if (tooltip.trim().length < 3) {
        buttonInfo.issues.push('too-short-tooltip');
        issues.push({
          type: 'too-short-tooltip',
          button: buttonInfo,
          severity: 'medium'
        });
      }
      
      // Check for common placeholder patterns
      const placeholderPatterns = [
        /^טולטיפ/i,
        /^tooltip/i,
        /^\.\.\./,
        /^xxx/i,
        /^test/i
      ];
      
      if (placeholderPatterns.some(pattern => pattern.test(tooltip))) {
        buttonInfo.issues.push('placeholder-tooltip');
        issues.push({
          type: 'placeholder-tooltip',
          button: buttonInfo,
          severity: 'high'
        });
      }
      
      // Check for tooltips that don't match button type
      // This is a heuristic check
      if (buttonType === 'DELETE' && !tooltip.includes('מחק') && !tooltip.includes('delete')) {
        buttonInfo.issues.push('tooltip-mismatch');
        issues.push({
          type: 'tooltip-mismatch',
          button: buttonInfo,
          severity: 'low',
          message: `DELETE button tooltip doesn't mention delete action`
        });
      }
    }
    
    buttons.push(buttonInfo);
  });
  
  return {
    page: pageName,
    file: filePath,
    totalButtons: buttons.length,
    buttonsWithTooltip: buttons.filter(b => b.tooltip).length,
    issues: issues,
    buttons: buttons
  };
}

/**
 * Main validation function
 */
function validateTooltipTexts() {
  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
  
  // Load config if available
  const config = loadTooltipConfig();
  
  // Get all HTML files
  const htmlFiles = fs.readdirSync(TRADING_UI_DIR)
    .filter(file => file.endsWith('.html'))
    .filter(file => !file.includes('backup') && !file.includes('test') && !file.includes('tooltip-editor'))
    .map(file => path.join(TRADING_UI_DIR, file));
  
  // Filter by page if specified
  const filesToScan = pageFilter 
    ? htmlFiles.filter(file => path.basename(file, '.html') === pageFilter)
    : htmlFiles;
  
  console.log(`📋 Validating tooltip texts for ${filesToScan.length} HTML files...\n`);
  
  const results = [];
  let totalIssues = 0;
  
  filesToScan.forEach(filePath => {
    try {
      const result = validateTooltipTextsInFile(filePath);
      results.push(result);
      totalIssues += result.issues.length;
      
      if (result.issues.length > 0) {
        console.log(`⚠️  ${result.page}: ${result.issues.length} tooltip issues found`);
      } else {
        console.log(`✅ ${result.page}: All tooltips valid`);
      }
    } catch (error) {
      console.error(`❌ Error validating ${filePath}:`, error.message);
    }
  });
  
  // Generate summary
  const summary = {
    scanDate: new Date().toISOString(),
    totalPages: results.length,
    totalIssues: totalIssues,
    pages: results
  };
  
  // Save results
  const timestamp = Date.now();
  const outputPath = outputFile || path.join(OUTPUT_DIR, `validation-${timestamp}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2), 'utf-8');
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total pages: ${summary.totalPages}`);
  console.log(`   Total issues: ${summary.totalIssues}`);
  
  if (totalIssues > 0) {
    console.log(`\n⚠️  Tooltip validation issues found! See details in: ${outputPath}`);
    
    // Print details
    results.forEach(result => {
      if (result.issues.length > 0) {
        console.log(`\n📄 ${result.page}.html:`);
        result.issues.forEach((issue, idx) => {
          console.log(`   Issue #${idx + 1}: ${issue.type} (${issue.severity})`);
          if (issue.button) {
            console.log(`     Button: ${issue.button.type} (line ${issue.button.line})`);
            console.log(`     Tooltip: "${issue.button.tooltip}"`);
          }
        });
      }
    });
    
    process.exit(1);
  } else {
    console.log(`\n✅ All tooltip texts are valid!`);
  }
  
  console.log(`\n💾 Results saved to: ${outputPath}`);
  
  return summary;
}

// Run if called directly
if (require.main === module) {
  validateTooltipTexts();
}

module.exports = { validateTooltipTexts, validateTooltipTextsInFile };

