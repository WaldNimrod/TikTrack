#!/usr/bin/env node

/**
 * Package Duplicate Analysis Tool
 * ================================
 * 
 * This tool scans the package manifest to identify scripts that appear
 * in multiple packages (duplicate entries).
 * 
 * Usage: node scripts/analyze-package-duplicates.js
 */

const fs = require('fs');
const path = require('path');

const PACKAGE_MANIFEST_PATH = path.join(__dirname, '..', 'trading-ui', 'scripts', 'init-system', 'package-manifest.js');

const scriptToPackages = new Map(); // script file -> [package1, package2, ...]

/**
 * Load and parse package manifest
 */
function loadPackageManifest() {
  const content = fs.readFileSync(PACKAGE_MANIFEST_PATH, 'utf8');
  
  // Extract package blocks
  const packagePattern = /(\w+):\s*\{[\s\S]*?scripts:\s*\[([\s\S]*?)\]/g;
  
  let match;
  while ((match = packagePattern.exec(content)) !== null) {
    const packageName = match[1];
    const scriptsBlock = match[2];
    
    // Extract file entries
    const filePattern = /file:\s*['"]([^'"]+)['"]/g;
    let fileMatch;
    
    while ((fileMatch = filePattern.exec(scriptsBlock)) !== null) {
      const scriptFile = fileMatch[1];
      
      if (!scriptToPackages.has(scriptFile)) {
        scriptToPackages.set(scriptFile, []);
      }
      scriptToPackages.get(scriptFile).push(packageName);
    }
  }
}

/**
 * Find duplicates
 */
function findDuplicates() {
  const duplicates = [];
  
  for (const [scriptFile, packages] of scriptToPackages.entries()) {
    if (packages.length > 1) {
      duplicates.push({
        script: scriptFile,
        packages: packages,
        count: packages.length
      });
    }
  }
  
  return duplicates.sort((a, b) => b.count - a.count);
}

/**
 * Generate report
 */
function generateReport(duplicates) {
  console.log('\n' + '='.repeat(80));
  console.log('📦 PACKAGE DUPLICATE ANALYSIS REPORT');
  console.log('='.repeat(80));
  
  console.log(`\n📊 Total Unique Scripts: ${scriptToPackages.size}`);
  console.log(`🔄 Scripts in Multiple Packages: ${duplicates.length}`);
  
  if (duplicates.length > 0) {
    console.log('\n⚠️  DUPLICATE SCRIPTS (Appear in Multiple Packages):\n');
    
    duplicates.forEach(({ script, packages, count }) => {
      console.log(`   ❌ ${script}`);
      console.log(`      Found in ${count} packages: ${packages.join(', ')}`);
      console.log(`      ⚠️  Action: Keep in ONE package only!`);
      console.log('');
    });
  } else {
    console.log('\n✅ No duplicate scripts found in packages!');
    console.log('   All scripts are properly assigned to single packages.');
  }
}

/**
 * Save detailed report
 */
function saveDetailedReport(duplicates) {
  const reportPath = path.join(__dirname, '..', 'documentation', '05-REPORTS', 'PACKAGE_DUPLICATES_ANALYSIS.md');
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  let report = `# Package Duplicates Analysis Report\n\n`;
  report += `**Generated:** ${new Date().toISOString()}\n\n`;
  
  report += `## Summary\n\n`;
  report += `- **Total Unique Scripts:** ${scriptToPackages.size}\n`;
  report += `- **Scripts in Multiple Packages:** ${duplicates.length}\n\n`;
  
  if (duplicates.length > 0) {
    report += `## ⚠️ Scripts Found in Multiple Packages\n\n`;
    report += `These scripts are defined in multiple packages, which can cause:\n`;
    report += `- Confusion about which package owns the script\n`;
    report += `- Potential duplicate loading if packages are loaded separately\n`;
    report += `- Maintenance issues\n\n`;
    
    duplicates.forEach(({ script, packages, count }) => {
      report += `### ${script}\n`;
      report += `- **Packages:** ${packages.join(', ')}\n`;
      report += `- **Count:** ${count}\n`;
      report += `- **Action:** Remove from all packages except ONE (recommended: keep in the primary/appropriate package)\n\n`;
    });
  } else {
    report += `## ✅ No Duplicates Found\n\n`;
    report += `All scripts are properly assigned to single packages.\n`;
  }
  
  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`\n💾 Detailed report saved to: ${reportPath}`);
}

// Main execution
function main() {
  console.log('🔍 Starting Package Duplicate Analysis...\n');
  
  loadPackageManifest();
  const duplicates = findDuplicates();
  
  generateReport(duplicates);
  saveDetailedReport(duplicates);
  
  console.log('\n✅ Analysis complete!');
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { main, scriptToPackages };


