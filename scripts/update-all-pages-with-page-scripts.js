#!/usr/bin/env node
/**
 * Update all HTML pages to include their page-specific scripts
 * 
 * This script:
 * 1. Finds all HTML pages in trading-ui/
 * 2. For each page, generates the script loading code using generate-script-loading-code.js
 * 3. Updates the HTML file with the new script loading section
 * 
 * Usage:
 *   node scripts/update-all-pages-with-page-scripts.js
 *   node scripts/update-all-pages-with-page-scripts.js --dry-run
 *   node scripts/update-all-pages-with-page-scripts.js --page=cash_flows
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DRY_RUN = process.argv.includes('--dry-run');
const PAGE_ARG = process.argv.find(arg => arg.startsWith('--page='));
const SPECIFIC_PAGE = PAGE_ARG ? PAGE_ARG.split('=')[1] : null;

const TRADING_UI_DIR = path.join(__dirname, '..', 'trading-ui');
const GENERATE_SCRIPT = path.join(__dirname, '..', 'trading-ui', 'scripts', 'generate-script-loading-code.js');

/**
 * Get all HTML pages in trading-ui/
 */
function getAllHTMLPages() {
  const files = fs.readdirSync(TRADING_UI_DIR);
  return files
    .filter(file => file.endsWith('.html'))
    .map(file => file.replace('.html', ''))
    .filter(page => {
      // Skip test pages and special pages
      if (page.includes('test') || page.includes('Test')) return false;
      if (page === 'login' || page === 'register' || page === 'forgot-password' || page === 'reset-password') return false;
      return true;
    })
    .sort();
}

/**
 * Update a single HTML page
 */
function updatePage(pageName) {
  const htmlFile = path.join(TRADING_UI_DIR, `${pageName}.html`);
  
  if (!fs.existsSync(htmlFile)) {
    console.log(`⚠️  ${pageName}: HTML file not found`);
    return { success: false, reason: 'file_not_found' };
  }

  try {
    // Read existing HTML
    const existingContent = fs.readFileSync(htmlFile, 'utf-8');
    
    // Generate new script loading code
    const mode = 'development'; // Always use development mode for now
    const command = `node "${GENERATE_SCRIPT}" ${pageName} --mode=${mode} --no-bundles`;
    const newScriptsSection = execSync(command, { encoding: 'utf-8', cwd: path.join(__dirname, '..') });
    
    // Extract the script loading section from the generated HTML
    // The generated code is just the script tags section (from <!-- 🎯 Page: to end)
    // It doesn't include </body> or closing tags
    let newScriptSection = newScriptsSection.trim();
    
    // Check if it contains the start marker
    if (!newScriptSection.includes('🎯 Page:')) {
      console.log(`⚠️  ${pageName}: Generated code doesn't contain expected markers`);
      console.log(`   First 200 chars: ${newScriptSection.substring(0, 200)}`);
      return { success: false, reason: 'extraction_failed' };
    }
    
    // Find the script loading section in existing HTML
    const existingMatch = existingContent.match(/(<!-- 🎯 Page:.*?)(<\/body>)/s);
    if (!existingMatch) {
      console.log(`⚠️  ${pageName}: Could not find script section in existing HTML`);
      return { success: false, reason: 'no_script_section' };
    }
    
    // Replace the script section
    const updatedContent = existingContent.replace(
      /<!-- 🎯 Page:.*?(?=<\/body>)/s,
      newScriptSection
    );
    
    // Check if page-specific script was added
    const hasPageScript = newScriptSection.includes(`scripts/${pageName}.js`);
    
    if (!DRY_RUN) {
      fs.writeFileSync(htmlFile, updatedContent, 'utf-8');
    }
    
    return {
      success: true,
      hasPageScript,
      updated: !DRY_RUN
    };
  } catch (error) {
    console.error(`❌ ${pageName}: Error - ${error.message}`);
    return { success: false, reason: error.message };
  }
}

/**
 * Main function
 */
function main() {
  console.log('🔄 Updating all HTML pages with page-specific scripts...\n');
  
  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }
  
  const pages = SPECIFIC_PAGE ? [SPECIFIC_PAGE] : getAllHTMLPages();
  
  console.log(`📋 Found ${pages.length} pages to process\n`);
  
  const results = {
    success: 0,
    failed: 0,
    withPageScript: 0,
    withoutPageScript: 0
  };
  
  pages.forEach(pageName => {
    const result = updatePage(pageName);
    
    if (result.success) {
      results.success++;
      if (result.hasPageScript) {
        results.withPageScript++;
        console.log(`✅ ${pageName}: Updated${result.updated ? '' : ' (dry-run)'} - Page script included`);
      } else {
        results.withoutPageScript++;
        console.log(`✅ ${pageName}: Updated${result.updated ? '' : ' (dry-run)'} - No page script found`);
      }
    } else {
      results.failed++;
      console.log(`❌ ${pageName}: Failed - ${result.reason}`);
    }
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary:');
  console.log(`   ✅ Success: ${results.success}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   📄 With page script: ${results.withPageScript}`);
  console.log(`   ⚠️  Without page script: ${results.withoutPageScript}`);
  console.log('='.repeat(60));
  
  if (DRY_RUN) {
    console.log('\n💡 Run without --dry-run to apply changes');
  }
}

main();

