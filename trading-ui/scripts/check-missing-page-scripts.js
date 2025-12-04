#!/usr/bin/env node

/**
 * Script to check which pages are missing their page-specific scripts
 * 
 * This script scans all HTML files and checks if they have corresponding
 * page-specific JavaScript files loaded.
 * 
 * Usage: node scripts/check-missing-page-scripts.js
 */

const fs = require('fs');
const path = require('path');

const TRADING_UI_DIR = path.join(__dirname, '..');
const SCRIPTS_DIR = path.join(__dirname);
const HTML_DIR = TRADING_UI_DIR;

// Get all HTML files
function getAllHTMLFiles() {
  const files = [];
  
  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      // Skip node_modules, archive, backup, mockups directories
      if (entry.name === 'node_modules' || 
          entry.name === 'archive' || 
          entry.name === 'backup' ||
          entry.name === 'mockups' ||
          entry.name.startsWith('.')) {
        continue;
      }
      
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        files.push(fullPath);
      }
    }
  }
  
  scanDir(HTML_DIR);
  return files;
}

// Get all JS files in scripts directory
function getAllJSFiles() {
  const files = [];
  
  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      // Skip node_modules, archive, backup, testing directories
      if (entry.name === 'node_modules' || 
          entry.name === 'archive' || 
          entry.name === 'backup' ||
          entry.name === 'testing' ||
          entry.name.startsWith('.')) {
        continue;
      }
      
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.js')) {
        files.push(fullPath);
      }
    }
  }
  
  scanDir(SCRIPTS_DIR);
  return files;
}

// Extract page name from HTML file path
function getPageName(htmlPath) {
  const fileName = path.basename(htmlPath, '.html');
  
  // Handle special cases
  if (fileName === 'index') return 'index';
  
  // Remove common suffixes
  return fileName
    .replace(/-smart$/, '')
    .replace(/-formatted$/, '');
}

// Check if HTML file loads a specific script
function loadsScript(htmlContent, scriptPath) {
  const scriptName = path.basename(scriptPath);
  const relativePath = path.relative(TRADING_UI_DIR, scriptPath).replace(/\\/g, '/');
  
  // Check for various patterns
  const patterns = [
    new RegExp(`scripts/${scriptName.replace(/\.js$/, '')}\\.js`),
    new RegExp(`scripts/${scriptName}`),
    new RegExp(relativePath.replace(/\.js$/, '') + '\\.js'),
    new RegExp(relativePath)
  ];
  
  return patterns.some(pattern => pattern.test(htmlContent));
}

// Main function
function main() {
  console.log('🔍 Checking for missing page-specific scripts...\n');
  
  const htmlFiles = getAllHTMLFiles();
  const jsFiles = getAllJSFiles();
  
  // Create a map of page names to their JS files
  const pageToJS = new Map();
  
  // Common page-specific script patterns
  for (const jsFile of jsFiles) {
    const jsName = path.basename(jsFile, '.js');
    const relativePath = path.relative(SCRIPTS_DIR, jsFile);
    
    // Skip files that are not page-specific (services, modules, etc.)
    if (relativePath.includes('/services/') ||
        relativePath.includes('/modules/') ||
        relativePath.includes('/widgets/') ||
        relativePath.includes('/conditions/') ||
        relativePath.includes('/init-system/') ||
        relativePath.includes('/modal-configs/') ||
        relativePath.includes('/charts/') ||
        relativePath.includes('/calendar/') ||
        relativePath.includes('/tradingview-widgets/') ||
        relativePath.includes('/mock-data/') ||
        relativePath.includes('/utils/') ||
        relativePath.includes('/testing/') ||
        relativePath.includes('/debug/') ||
        relativePath.startsWith('unified-') ||
        relativePath.startsWith('page-') ||
        relativePath.startsWith('modal-') ||
        relativePath.startsWith('cache-') ||
        relativePath.startsWith('preferences-') ||
        relativePath.startsWith('entity-') ||
        relativePath.startsWith('info-') ||
        relativePath.startsWith('init-') ||
        relativePath.startsWith('monitoring-') ||
        relativePath.startsWith('table-') ||
        relativePath.startsWith('pagination-') ||
        relativePath.startsWith('notification-') ||
        relativePath.startsWith('translation-') ||
        relativePath.startsWith('button-') ||
        relativePath.startsWith('icon-') ||
        relativePath.startsWith('tag-') ||
        relativePath.startsWith('color-') ||
        relativePath.startsWith('header-') ||
        relativePath.startsWith('auth') ||
        relativePath.startsWith('account-') ||
        relativePath.startsWith('alert-') ||
        relativePath.startsWith('ticker-') ||
        relativePath.startsWith('trade-plan-service') ||
        relativePath.startsWith('import-') ||
        relativePath.startsWith('watch-list') ||
        relativePath.startsWith('related-object') ||
        relativePath.startsWith('linked-items') ||
        relativePath.startsWith('data-utils') ||
        relativePath.startsWith('date-utils') ||
        relativePath.startsWith('crud-') ||
        relativePath.startsWith('constraint-') ||
        relativePath.startsWith('code-quality-') ||
        relativePath.startsWith('cluster-') ||
        relativePath.startsWith('check-') ||
        relativePath.startsWith('analyze-') ||
        relativePath.startsWith('generate-') ||
        relativePath.startsWith('update-') ||
        relativePath.startsWith('standardize-') ||
        relativePath.startsWith('test-') ||
        relativePath.startsWith('pending-') ||
        relativePath.startsWith('active-') ||
        relativePath.startsWith('history-') ||
        relativePath.startsWith('comparative-') ||
        relativePath.startsWith('emotional-') ||
        relativePath.startsWith('strategy-') ||
        relativePath.startsWith('trade-history-') ||
        relativePath.startsWith('portfolio-state-') ||
        relativePath.startsWith('positions-') ||
        relativePath.startsWith('trading-journal-') ||
        relativePath.startsWith('economic-calendar-') ||
        relativePath.startsWith('price-history-') ||
        relativePath.startsWith('tradingview-') ||
        relativePath.startsWith('linter-') ||
        relativePath.startsWith('server-') ||
        relativePath.startsWith('external-data-') ||
        relativePath.startsWith('chart-') ||
        relativePath.startsWith('db_') ||
        relativePath === 'research.js' ||
        relativePath === 'data_import.js' ||
        relativePath === 'css-management.js' ||
        relativePath === 'notifications-center.js' ||
        relativePath === 'external-data-dashboard.js' ||
        relativePath === 'designs.js' ||
        relativePath === 'constraints.js' ||
        relativePath === 'background-tasks.js' ||
        relativePath === 'system-management.js' ||
        relativePath === 'tag-management-page.js' ||
        relativePath === 'db_display.js' ||
        relativePath === 'db_extradata.js' ||
        relativePath === 'trades.js' ||
        relativePath === 'alerts.js' ||
        relativePath === 'executions.js' ||
        relativePath === 'notes.js' ||
        relativePath === 'cash_flows.js' ||
        relativePath === 'tickers.js' ||
        relativePath === 'trading_accounts.js' ||
        relativePath === 'trade_plans.js' ||
        relativePath === 'index.js' ||
        relativePath === 'user-profile.js') {
      continue;
    }
    
    // This might be a page-specific script
    // Try to match it to HTML files
    for (const htmlFile of htmlFiles) {
      const pageName = getPageName(htmlFile);
      const expectedJSName = pageName.replace(/-/g, '_') + '.js';
      const expectedJSName2 = pageName + '.js';
      
      if (jsName === pageName || 
          jsName === pageName.replace(/-/g, '_') ||
          relativePath === expectedJSName ||
          relativePath === expectedJSName2) {
        if (!pageToJS.has(pageName)) {
          pageToJS.set(pageName, []);
        }
        pageToJS.get(pageName).push(relativePath);
      }
    }
  }
  
  // Check each HTML file
  const missing = [];
  const found = [];
  
  for (const htmlFile of htmlFiles) {
    const pageName = getPageName(htmlFile);
    const htmlContent = fs.readFileSync(htmlFile, 'utf8');
    
    // Skip test pages and smart pages
    if (pageName.includes('smart') || 
        pageName.includes('test') || 
        pageName.includes('formatted') ||
        pageName.includes('mockup')) {
      continue;
    }
    
    // Check for common page-specific script patterns
    const possibleScripts = [
      `${pageName}.js`,
      `${pageName.replace(/-/g, '_')}.js`,
      `${pageName}-page.js`,
      `${pageName}-manager.js`
    ];
    
    // Check if any of these scripts exist
    const existingScripts = possibleScripts.filter(script => {
      const scriptPath = path.join(SCRIPTS_DIR, script);
      return fs.existsSync(scriptPath);
    });
    
    if (existingScripts.length > 0) {
      // Check if any of them are loaded
      const loaded = existingScripts.some(script => {
        return loadsScript(htmlContent, path.join(SCRIPTS_DIR, script));
      });
      
      if (!loaded) {
        missing.push({
          page: pageName,
          htmlFile: path.relative(TRADING_UI_DIR, htmlFile),
          scripts: existingScripts
        });
      } else {
        found.push({
          page: pageName,
          htmlFile: path.relative(TRADING_UI_DIR, htmlFile),
          scripts: existingScripts.filter(s => loadsScript(htmlContent, path.join(SCRIPTS_DIR, s)))
        });
      }
    }
  }
  
  // Report results
  console.log(`📊 Scanned ${htmlFiles.length} HTML files and ${jsFiles.length} JS files\n`);
  
  if (missing.length > 0) {
    console.log(`❌ Found ${missing.length} pages with missing scripts:\n`);
    missing.forEach(({ page, htmlFile, scripts }) => {
      console.log(`  - ${page} (${htmlFile})`);
      console.log(`    Missing: ${scripts.join(', ')}\n`);
    });
  } else {
    console.log('✅ All pages have their scripts loaded!\n');
  }
  
  if (found.length > 0 && missing.length > 0) {
    console.log(`\n✅ Found ${found.length} pages with scripts loaded correctly\n`);
  }
  
  return missing.length > 0 ? 1 : 0;
}

if (require.main === module) {
  process.exit(main());
}

module.exports = { main, getAllHTMLFiles, getAllJSFiles, getPageName, loadsScript };




