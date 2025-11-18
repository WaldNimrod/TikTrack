#!/usr/bin/env node
/**
 * Button Tooltips Update Script
 * ==============================
 * 
 * This script reads button tooltip configurations and updates HTML/JS files
 * with the correct tooltip texts.
 * 
 * Usage:
 *   node scripts/update-button-tooltips.js [page-name]
 * 
 * Examples:
 *   node scripts/update-button-tooltips.js notes
 *   node scripts/update-button-tooltips.js  # Updates all pages
 * 
 * Author: TikTrack Development Team
 * Version: 1.0
 */

const fs = require('fs');
const path = require('path');

// Load tooltip configuration
const configPath = path.join(__dirname, '../trading-ui/scripts/button-tooltips-config.js');
const configContent = fs.readFileSync(configPath, 'utf8');

// Extract BUTTON_TOOLTIPS_CONFIG from the file
// This is a simple extraction - in production, you might want to use a proper parser
const configMatch = configContent.match(/const BUTTON_TOOLTIPS_CONFIG = ({[\s\S]*?});/);
if (!configMatch) {
  console.error('❌ Could not parse BUTTON_TOOLTIPS_CONFIG');
  process.exit(1);
}

let BUTTON_TOOLTIPS_CONFIG;
eval(`BUTTON_TOOLTIPS_CONFIG = ${configMatch[1]}`);

/**
 * Update tooltips in HTML file
 */
function updateHTMLFile(filePath, pageName) {
  const content = fs.readFileSync(filePath, 'utf8');
  const tooltips = BUTTON_TOOLTIPS_CONFIG[pageName];
  if (!tooltips) {
    console.log(`⚠️  No tooltip config found for page: ${pageName}`);
    return false;
  }
  
  let updated = false;
  let newContent = content;
  
  // Update each tooltip based on button type and context
  for (const [key, tooltipText] of Object.entries(tooltips)) {
    const [buttonType, context] = key.split('.');
    
    // Pattern matching for different button types
    const patterns = [
      // Pattern for: data-button-type="BUTTONTYPE" with context
      new RegExp(`(data-button-type="${buttonType}"[^>]*?)(?:data-tooltip="[^"]*"|title="[^"]*")?([^>]*>)`, 'g'),
      // Pattern for: data-button-type="BUTTONTYPE" without existing tooltip
      new RegExp(`(data-button-type="${buttonType}"[^>]*?)(?<!data-tooltip)([^>]*>)`, 'g'),
    ];
    
    // This is a simplified version - you might need more sophisticated matching
    // For now, we'll use a simpler approach with specific replacements
  }
  
  if (updated) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Updated: ${filePath}`);
    return true;
  }
  
  return false;
}

/**
 * Main function
 */
function main() {
  const pageName = process.argv[2] || 'notes';
  
  console.log(`🔧 Updating tooltips for page: ${pageName}`);
  console.log(`📋 Available tooltips:`, Object.keys(BUTTON_TOOLTIPS_CONFIG[pageName] || {}));
  
  // For now, this is a template - you'll need to implement the actual update logic
  // based on your specific HTML/JS structure
  
  const htmlPath = path.join(__dirname, `../trading-ui/${pageName}.html`);
  if (fs.existsSync(htmlPath)) {
    // updateHTMLFile(htmlPath, pageName);
    console.log(`📄 Found HTML file: ${htmlPath}`);
  }
  
  console.log('\n💡 This script is a template.');
  console.log('   Please implement the actual update logic based on your needs.');
  console.log('   You can use the BUTTON_TOOLTIPS_CONFIG to map button types to tooltip texts.');
}

if (require.main === module) {
  main();
}

