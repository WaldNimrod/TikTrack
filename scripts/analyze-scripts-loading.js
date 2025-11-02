#!/usr/bin/env node

/**
 * Script Loading Analysis Tool
 * ============================
 * 
 * This tool scans all HTML pages for loaded scripts and compares them
 * against the package manifest to identify:
 * 1. Scripts loaded in pages but not defined in any package
 * 2. Duplicate script loading (same script loaded multiple times)
 * 
 * Usage: node scripts/analyze-scripts-loading.js
 */

const fs = require('fs');
const path = require('path');

// Core pages to analyze
const CORE_PAGES = [
  'trades.html',
  'trade_plans.html',
  'executions.html',
  'alerts.html',
  'trading_accounts.html',
  'cash_flows.html',
  'tickers.html',
  'notes.html'
];

const TRADING_UI_DIR = path.join(__dirname, '..', 'trading-ui');
const PACKAGE_MANIFEST_PATH = path.join(TRADING_UI_DIR, 'scripts', 'init-system', 'package-manifest.js');

// Results storage
const results = {
  pagesScanned: [],
  scriptsInPages: new Map(), // script file -> { pages: [], count: number }
  scriptsInPackages: new Set(), // set of all script files in packages
  scriptsNotInPackages: [], // scripts loaded but not in packages
  duplicates: [], // scripts loaded multiple times in same page
  pageScripts: {} // per-page breakdown
};

/**
 * Extract script file path from script tag
 */
function extractScriptPath(scriptTag) {
  const srcMatch = scriptTag.match(/src=["']([^"']+)["']/);
  if (!srcMatch) return null;
  
  let scriptPath = srcMatch[1];
  
  // Remove version query string
  scriptPath = scriptPath.split('?')[0];
  
  // Normalize path
  if (scriptPath.startsWith('scripts/')) {
    return scriptPath;
  }
  if (scriptPath.startsWith('/scripts/')) {
    return scriptPath.substring(1);
  }
  if (scriptPath.startsWith('./scripts/')) {
    return scriptPath.substring(2);
  }
  
  // External scripts (CDN) - skip for now
  if (scriptPath.startsWith('http://') || scriptPath.startsWith('https://')) {
    return null;
  }
  
  return scriptPath;
}

/**
 * Load and parse package manifest
 */
function loadPackageManifest() {
  const content = fs.readFileSync(PACKAGE_MANIFEST_PATH, 'utf8');
  
  // Extract all script files from packages
  // Look for patterns like: file: 'script-name.js'
  const filePattern = /file:\s*['"]([^'"]+)['"]/g;
  let match;
  
  while ((match = filePattern.exec(content)) !== null) {
    const scriptFile = match[1];
    results.scriptsInPackages.add(scriptFile);
    
    // Also add full path variants
    if (!scriptFile.startsWith('scripts/')) {
      results.scriptsInPackages.add(`scripts/${scriptFile}`);
    }
    if (!scriptFile.startsWith('modules/')) {
      results.scriptsInPackages.add(`scripts/${scriptFile}`);
    }
  }
  
  console.log(`✅ Loaded ${results.scriptsInPackages.size} scripts from package manifest`);
}

/**
 * Scan HTML file for script tags
 */
function scanHTMLFile(filePath, pageName) {
  const content = fs.readFileSync(filePath, 'utf8');
  const scriptTags = content.match(/<script[^>]*src=["'][^"']+["'][^>]*>/g) || [];
  
  const pageScripts = [];
  const scriptCounts = new Map(); // track duplicates within page
  
  scriptTags.forEach(tag => {
    const scriptPath = extractScriptPath(tag);
    if (!scriptPath) return; // Skip external or invalid scripts
    
    pageScripts.push(scriptPath);
    
    // Track in global map
    if (!results.scriptsInPages.has(scriptPath)) {
      results.scriptsInPages.set(scriptPath, { pages: [], count: 0 });
    }
    const scriptInfo = results.scriptsInPages.get(scriptPath);
    scriptInfo.count++;
    
    if (!scriptInfo.pages.includes(pageName)) {
      scriptInfo.pages.push(pageName);
    }
    
    // Check for duplicates within this page
    const count = scriptCounts.get(scriptPath) || 0;
    scriptCounts.set(scriptPath, count + 1);
    if (count === 1) {
      // This is the second occurrence
      results.duplicates.push({
        page: pageName,
        script: scriptPath,
        count: count + 1
      });
    }
  });
  
  results.pageScripts[pageName] = pageScripts;
  results.pagesScanned.push(pageName);
  
  return { pageScripts, duplicates: Array.from(scriptCounts.entries()).filter(([_, count]) => count > 1) };
}

/**
 * Find scripts loaded in pages but not in packages
 */
function findScriptsNotInPackages() {
  for (const [scriptPath, info] of results.scriptsInPages.entries()) {
    // Check if script is in packages (with various path formats)
    const normalizedPaths = [
      scriptPath,
      scriptPath.replace(/^scripts\//, ''),
      scriptPath.replace(/^\/scripts\//, ''),
      scriptPath.replace(/^\.\/scripts\//, '')
    ];
    
    const inPackage = normalizedPaths.some(path => results.scriptsInPackages.has(path));
    
    if (!inPackage) {
      results.scriptsNotInPackages.push({
        script: scriptPath,
        pages: info.pages,
        count: info.count
      });
    }
  }
}

/**
 * Generate report
 */
function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 SCRIPT LOADING ANALYSIS REPORT');
  console.log('='.repeat(80));
  
  console.log(`\n📄 Pages Scanned: ${results.pagesScanned.length}`);
  results.pagesScanned.forEach(page => console.log(`   - ${page}`));
  
  console.log(`\n📦 Total Scripts in Packages: ${results.scriptsInPackages.size}`);
  console.log(`📝 Total Unique Scripts Loaded: ${results.scriptsInPages.size}`);
  
  // Scripts not in packages
  console.log(`\n⚠️  Scripts Loaded But NOT in Packages: ${results.scriptsNotInPackages.length}`);
  if (results.scriptsNotInPackages.length > 0) {
    results.scriptsNotInPackages.forEach(({ script, pages, count }) => {
      console.log(`\n   ❌ ${script}`);
      console.log(`      Pages: ${pages.join(', ')} (${count} total loads)`);
    });
  } else {
    console.log('   ✅ All scripts are properly defined in packages!');
  }
  
  // Duplicates
  console.log(`\n🔄 Duplicate Scripts (Same Script Loaded Multiple Times): ${results.duplicates.length}`);
  if (results.duplicates.length > 0) {
    const duplicateGroups = {};
    results.duplicates.forEach(dup => {
      if (!duplicateGroups[dup.script]) {
        duplicateGroups[dup.script] = [];
      }
      duplicateGroups[dup.script].push(dup.page);
    });
    
    Object.entries(duplicateGroups).forEach(([script, pages]) => {
      console.log(`\n   ⚠️  ${script}`);
      console.log(`      Duplicated in: ${pages.join(', ')}`);
    });
  } else {
    console.log('   ✅ No duplicate script loading detected!');
  }
  
  // Per-page breakdown
  console.log(`\n📋 Per-Page Script Count:`);
  Object.entries(results.pageScripts).forEach(([page, scripts]) => {
    const duplicates = results.duplicates.filter(d => d.page === page);
    console.log(`   ${page}: ${scripts.length} scripts${duplicates.length > 0 ? ` (⚠️  ${duplicates.length} duplicates)` : ''}`);
  });
}

/**
 * Save detailed report to file
 */
function saveDetailedReport() {
  const reportPath = path.join(__dirname, '..', 'documentation', '05-REPORTS', 'SCRIPTS_LOADING_ANALYSIS.md');
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  let report = `# Script Loading Analysis Report\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n`;
  report += `**Pages Analyzed:** ${results.pagesScanned.length}\n\n`;
  
  report += `## Summary\n\n`;
  report += `- **Total Scripts in Packages:** ${results.scriptsInPackages.size}\n`;
  report += `- **Total Unique Scripts Loaded:** ${results.scriptsInPages.size}\n`;
  report += `- **Scripts NOT in Packages:** ${results.scriptsNotInPackages.length}\n`;
  report += `- **Duplicate Script Loads:** ${results.duplicates.length}\n\n`;
  
  if (results.scriptsNotInPackages.length > 0) {
    report += `## ⚠️ Scripts Loaded But NOT in Packages\n\n`;
    results.scriptsNotInPackages.forEach(({ script, pages, count }) => {
      report += `### ${script}\n`;
      report += `- **Pages:** ${pages.join(', ')}\n`;
      report += `- **Total Loads:** ${count}\n`;
      report += `- **Action:** Add to appropriate package in package-manifest.js\n\n`;
    });
  }
  
  if (results.duplicates.length > 0) {
    report += `## 🔄 Duplicate Script Loading\n\n`;
    const duplicateGroups = {};
    results.duplicates.forEach(dup => {
      if (!duplicateGroups[dup.script]) {
        duplicateGroups[dup.script] = [];
      }
      duplicateGroups[dup.script].push(dup.page);
    });
    
    Object.entries(duplicateGroups).forEach(([script, pages]) => {
      report += `### ${script}\n`;
      report += `- **Pages with duplicates:** ${pages.join(', ')}\n`;
      report += `- **Action:** Remove duplicate script tags\n\n`;
    });
  }
  
  report += `## 📋 Per-Page Script List\n\n`;
  Object.entries(results.pageScripts).forEach(([page, scripts]) => {
    report += `### ${page}\n\n`;
    report += `Total: ${scripts.length} scripts\n\n`;
    scripts.forEach((script, idx) => {
      report += `${idx + 1}. ${script}\n`;
    });
    report += `\n`;
  });
  
  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`\n💾 Detailed report saved to: ${reportPath}`);
}

// Main execution
function main() {
  console.log('🔍 Starting Script Loading Analysis...\n');
  
  // Load package manifest
  loadPackageManifest();
  
  // Scan each core page
  CORE_PAGES.forEach(pageName => {
    const filePath = path.join(TRADING_UI_DIR, pageName);
    if (fs.existsSync(filePath)) {
      console.log(`📄 Scanning ${pageName}...`);
      scanHTMLFile(filePath, pageName);
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
    }
  });
  
  // Analyze results
  findScriptsNotInPackages();
  
  // Generate reports
  generateReport();
  saveDetailedReport();
  
  console.log('\n✅ Analysis complete!');
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main, results };


