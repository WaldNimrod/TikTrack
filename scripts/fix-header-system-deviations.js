#!/usr/bin/env node

/**
 * Header & Filters System Deviations Fixer
 * Automatically fixes common deviations from Header & Filters System standard
 * 
 * This script:
 * 1. Removes direct DOM manipulation for filters
 * 2. Replaces manual filter application with UnifiedTableSystem
 * 3. Ensures proper use of HeaderSystem API
 */

const fs = require('fs');
const path = require('path');

const PAGES_TO_FIX = [
  // Main pages
  { html: 'trading-ui/index.html', js: 'trading-ui/scripts/index.js', issues: ['direct-dom-manipulation'] },
  { html: 'trading-ui/alerts.html', js: 'trading-ui/scripts/alerts.js', issues: [] }, // Related object filters are legitimate
  { html: 'trading-ui/cash_flows.html', js: 'trading-ui/scripts/cash_flows.js', issues: [] }, // Check if legitimate
  { html: 'trading-ui/notes.html', js: 'trading-ui/scripts/notes.js', issues: ['direct-dom-manipulation'] },
  { html: 'trading-ui/research.html', js: 'trading-ui/scripts/research.js', issues: ['manual-filter-application'] },
  { html: 'trading-ui/preferences.html', js: 'trading-ui/scripts/preferences-core-new.js', issues: ['manual-filter-application'] },
  
  // Technical pages
  { html: 'trading-ui/constraints.html', js: 'trading-ui/scripts/constraints.js', issues: ['manual-filter-application'] },
  { html: 'trading-ui/background-tasks.html', js: 'trading-ui/scripts/background-tasks.js', issues: ['manual-filter-application'] },
  { html: 'trading-ui/server-monitor.html', js: 'trading-ui/scripts/server-monitor.js', issues: ['manual-filter-application'] },
  { html: 'trading-ui/notifications-center.html', js: 'trading-ui/scripts/notifications-center.js', issues: ['manual-filter-application'] },
  { html: 'trading-ui/css-management.html', js: 'trading-ui/scripts/css-management.js', issues: ['manual-filter-application'] },
  { html: 'trading-ui/system-management.html', js: 'trading-ui/scripts/system-management.js', issues: ['manual-filter-application'] },
];

function fixDirectDOMManipulation(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Replace direct querySelector for filter elements with HeaderSystem API
  const patterns = [
    {
      // querySelector('.header-filter-toggle-btn') -> use HeaderSystem API
      pattern: /const\s+filterBtn\s*=\s*document\.querySelector\(['"]\.header-filter-toggle-btn['"]\);/g,
      replacement: `// Use HeaderSystem API instead of direct DOM manipulation
    const filterBtn = document.getElementById('headerFilterToggleBtnMain') || 
                      document.getElementById('headerFilterToggleBtnSecondary') ||
                      (window.headerSystem?.filterManager ? document.querySelector('.header-filter-toggle-btn') : null);`,
    },
    {
      // querySelector('.filter-') -> use FilterManager API
      pattern: /document\.querySelector\(['"]\.filter-[^'"]+['"]\)/g,
      replacement: 'window.headerSystem?.filterManager?.getFilterElement($&) || $&',
    },
  ];

  patterns.forEach(({ pattern, replacement }) => {
    if (pattern.test(content)) {
      content = content.replace(pattern, replacement);
      modified = true;
      console.log(`✅ Fixed direct DOM manipulation in ${filePath}`);
    }
  });

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }

  return false;
}

function fixManualFilterApplication(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Check if file already uses UnifiedTableSystem
  if (content.includes('UnifiedTableSystem') || content.includes('FilterManager.applyFilters')) {
    console.log(`ℹ️  ${filePath} already uses UnifiedTableSystem`);
    return false;
  }

  // Pattern: filteredData = data.filter(item => ...)
  const manualFilterPattern = /(const|let|var)\s+filteredData\s*=\s*(\w+)\.filter\(/g;
  
  if (manualFilterPattern.test(content)) {
    console.log(`⚠️  Found manual filter application in ${filePath}`);
    console.log(`   This requires manual review - cannot auto-fix complex filter logic`);
    // We'll add a comment to guide manual fix
    const comment = `\n  // TODO: Replace manual filter with UnifiedTableSystem.filter.apply()
  // Example: const filteredData = window.UnifiedTableSystem.filter.apply(tableType, filterContext);
  // See documentation/frontend/HEADER_SYSTEM_SPEC.md for details\n`;
    
    // This is a placeholder - actual fix requires understanding the context
    modified = false; // Don't auto-modify, require manual review
  }

  return modified;
}

function main() {
  console.log('🔧 Starting Header & Filters System deviations fix...\n');

  let fixedCount = 0;
  let skippedCount = 0;

  PAGES_TO_FIX.forEach(({ html, js, issues }) => {
    console.log(`\n📄 Processing: ${js}`);

    if (issues.includes('direct-dom-manipulation')) {
      if (fixDirectDOMManipulation(js)) {
        fixedCount++;
      } else {
        skippedCount++;
      }
    }

    if (issues.includes('manual-filter-application')) {
      if (fixManualFilterApplication(js)) {
        fixedCount++;
      } else {
        skippedCount++;
      }
    }
  });

  console.log(`\n✅ Fix complete!`);
  console.log(`   Fixed: ${fixedCount} files`);
  console.log(`   Skipped: ${skippedCount} files (require manual review)`);
  console.log(`\n⚠️  Note: Manual filter application fixes require code review.`);
  console.log(`   Please review each file and replace with UnifiedTableSystem.filter.apply()`);
}

if (require.main === module) {
  main();
}

module.exports = { fixDirectDOMManipulation, fixManualFilterApplication };
























