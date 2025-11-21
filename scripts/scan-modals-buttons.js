#!/usr/bin/env node
/**
 * Modals Buttons Scanner
 * Scans HTML files for buttons within modals
 * 
 * Usage:
 *   node scripts/scan-modals-buttons.js [--page PAGE_NAME] [--output OUTPUT_FILE]
 * 
 * Example:
 *   node scripts/scan-modals-buttons.js --page trades --output reports/modals-trades.json
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
 * Scan modals in a single HTML file
 */
function scanModalsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const dom = new JSDOM(content);
  const document = dom.window.document;
  
  const pageName = path.basename(filePath, '.html');
  const modals = [];
  
  // Find all modals - various patterns
  const modalSelectors = [
    '.modal',
    '[class*="modal"]',
    '[id*="Modal"]',
    '[id*="modal"]'
  ];
  
  const allModals = new Set();
  modalSelectors.forEach(selector => {
    document.querySelectorAll(selector).forEach(modal => {
      // Check if it's actually a modal (has modal-dialog or modal-content)
      if (modal.querySelector('.modal-dialog') || modal.querySelector('.modal-content') || 
          modal.classList.contains('modal') || modal.id.includes('Modal') || modal.id.includes('modal')) {
        allModals.add(modal);
      }
    });
  });
  
  Array.from(allModals).forEach((modal, modalIndex) => {
    const modalId = modal.id || `modal-${modalIndex}`;
    const modalClass = modal.className || '';
    const buttons = [];
    
    // Find all buttons within this modal
    const buttonElements = modal.querySelectorAll('[data-button-type], button');
    
    buttonElements.forEach((button, btnIndex) => {
      const buttonType = button.getAttribute('data-button-type') || 'UNKNOWN';
      const hasTooltip = button.hasAttribute('data-tooltip');
      const hasId = button.hasAttribute('data-id');
      const tooltip = button.getAttribute('data-tooltip') || null;
      const id = button.getAttribute('data-id') || null;
      const onclick = button.getAttribute('data-onclick') || button.getAttribute('onclick') || null;
      const entityType = button.getAttribute('data-entity-type') || null;
      const text = button.getAttribute('data-text') || button.textContent.trim() || null;
      
      // Get line number (approximate)
      const buttonHTML = button.outerHTML;
      const buttonIndex = content.indexOf(buttonHTML);
      const contentBeforeButton = buttonIndex >= 0 ? content.substring(0, buttonIndex) : '';
      const line = (contentBeforeButton.match(/\n/g) || []).length + 1;
      
      // Determine button location in modal
      let location = 'unknown';
      if (modal.querySelector('.modal-header')?.contains(button)) {
        location = 'header';
      } else if (modal.querySelector('.modal-body')?.contains(button)) {
        location = 'body';
      } else if (modal.querySelector('.modal-footer')?.contains(button)) {
        location = 'footer';
      }
      
      buttons.push({
        index: btnIndex + 1,
        type: buttonType,
        hasTooltip: hasTooltip,
        hasId: hasId,
        tooltip: tooltip,
        id: id,
        onclick: onclick,
        entityType: entityType,
        text: text,
        line: line,
        location: location,
        needsTooltip: !hasTooltip,
        needsId: !hasId,
        isStatic: button.hasAttribute('data-tooltip-static'),
        html: buttonHTML.substring(0, 150)
      });
    });
    
    if (buttons.length > 0) {
      modals.push({
        id: modalId,
        index: modalIndex + 1,
        className: modalClass,
        buttonCount: buttons.length,
        buttonsWithTooltip: buttons.filter(b => b.hasTooltip).length,
        buttonsWithId: buttons.filter(b => b.hasId).length,
        buttonsNeedingTooltip: buttons.filter(b => b.needsTooltip).length,
        buttonsNeedingId: buttons.filter(b => b.needsId).length,
        buttons: buttons
      });
    }
  });
  
  return {
    page: pageName,
    file: filePath,
    modalsCount: modals.length,
    totalButtons: modals.reduce((sum, m) => sum + m.buttonCount, 0),
    totalNeedingTooltip: modals.reduce((sum, m) => sum + m.buttonsNeedingTooltip, 0),
    totalNeedingId: modals.reduce((sum, m) => sum + m.buttonsNeedingId, 0),
    modals: modals
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
  
  console.log(`📋 Scanning ${filesToScan.length} HTML files for modals...\n`);
  
  const results = [];
  let totalModals = 0;
  let totalButtons = 0;
  let totalNeedingTooltip = 0;
  let totalNeedingId = 0;
  
  filesToScan.forEach(filePath => {
    try {
      const result = scanModalsInFile(filePath);
      results.push(result);
      totalModals += result.modalsCount;
      totalButtons += result.totalButtons;
      totalNeedingTooltip += result.totalNeedingTooltip;
      totalNeedingId += result.totalNeedingId;
      
      console.log(`✅ ${result.page}: ${result.modalsCount} modals, ${result.totalButtons} buttons (${result.totalNeedingTooltip} need tooltip, ${result.totalNeedingId} need ID)`);
    } catch (error) {
      console.error(`❌ Error scanning ${filePath}:`, error.message);
    }
  });
  
  // Generate summary
  const summary = {
    scanDate: new Date().toISOString(),
    totalPages: results.length,
    totalModals: totalModals,
    totalButtons: totalButtons,
    totalNeedingTooltip: totalNeedingTooltip,
    totalNeedingId: totalNeedingId,
    pages: results
  };
  
  // Save results
  const timestamp = Date.now();
  const outputPath = outputFile || path.join(OUTPUT_DIR, `modals-${timestamp}.json`);
  fs.writeFileSync(outputPath, JSON.stringify(summary, null, 2), 'utf-8');
  
  console.log(`\n📊 Summary:`);
  console.log(`   Total pages: ${summary.totalPages}`);
  console.log(`   Total modals: ${summary.totalModals}`);
  console.log(`   Total buttons in modals: ${summary.totalButtons}`);
  console.log(`   Buttons needing tooltip: ${summary.totalNeedingTooltip}`);
  console.log(`   Buttons needing ID: ${summary.totalNeedingId}`);
  console.log(`\n💾 Results saved to: ${outputPath}`);
  
  return summary;
}

// Run if called directly
if (require.main === module) {
  scanAllPages();
}

module.exports = { scanAllPages, scanModalsInFile };

