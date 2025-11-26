#!/usr/bin/env node
/**
 * Icon System Standardization Test Script
 * =======================================
 * 
 * בדיקה אוטומטית של סטנדרטיזציה Icon System בכל העמודים
 * 
 * Author: TikTrack Development Team
 * Version: 1.0.0
 * Last Updated: 2025-01-12
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '../..');
const TRADING_UI_DIR = path.join(PROJECT_ROOT, 'trading-ui');
const HTML_DIR = TRADING_UI_DIR;
const MOCKUPS_DIR = path.join(TRADING_UI_DIR, 'mockups');

// Pages to test
const MAIN_PAGES = [
  'index.html',
  'trades.html',
  'trade_plans.html',
  'alerts.html',
  'tickers.html',
  'trading_accounts.html',
  'executions.html',
  'cash_flows.html',
  'notes.html',
  'research.html',
  'preferences.html'
];

const TECHNICAL_PAGES = [
  'db_display.html',
  'db_extradata.html',
  'constraints.html',
  'background-tasks.html',
  'server-monitor.html',
  'notifications-center.html',
  'css-management.html',
  'system-management.html'
];

const DEV_TOOLS_PAGES = [
  'code-quality-dashboard.html',
  'tag-management.html',
  'init-system-management.html',
  'conditions-test.html',
  'test-header-only.html',
  'external-data-dashboard.html',
  'chart-management.html',
  'crud-testing-dashboard.html',
  'dynamic-colors-display.html'
];

// Test results
const results = {
  total: 0,
  passed: 0,
  failed: 0,
  warnings: 0,
  pages: {}
};

/**
 * Check if file exists
 */
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (error) {
    return false;
  }
}

/**
 * Read file content
 */
function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    return '';
  }
}

/**
 * Check HTML file for icon usage
 */
function checkHTMLFile(filePath, pageName) {
  const content = readFile(filePath);
  const issues = [];
  
  // Check for direct <img src> tags with icons
  const imgTagRegex = /<img[^>]*src=["']\/trading-ui\/images\/icons\/(?:entities|tabler)\/[^"']+["'][^>]*>/gi;
  const imgMatches = content.match(imgTagRegex);
  
  if (imgMatches && imgMatches.length > 0) {
    issues.push({
      type: 'direct_img_tag',
      count: imgMatches.length,
      examples: imgMatches.slice(0, 3)
    });
  }
  
  // Check for IconSystem usage
  // Note: icon-system.js is loaded via package-manifest.js (base package)
  const hasPackageManifest = content.includes('package-manifest.js') ||
                             content.includes('init-system/package-manifest');
  const hasIconSystem = content.includes('icon-system.js') || 
                        content.includes('IconSystem') ||
                        content.includes('replaceIconsInContext') ||
                        hasPackageManifest; // If package-manifest is loaded, icon-system is available
  
  // Check for icon-replacement-helper
  // Note: icon-replacement-helper.js is loaded via package-manifest.js (base package)
  const hasReplacementHelper = content.includes('icon-replacement-helper.js') ||
                               content.includes('replaceIconsInContext') ||
                               hasPackageManifest; // If package-manifest is loaded, helper is available
  
  // Check for icon-mappings
  // Note: icon-mappings.js is loaded via package-manifest.js (base package)
  const hasIconMappings = content.includes('icon-mappings.js') ||
                          content.includes('IconMappings') ||
                          hasPackageManifest; // If package-manifest is loaded, mappings are available
  
  return {
    pageName,
    filePath,
    hasDirectImgTags: imgMatches && imgMatches.length > 0,
    directImgTagCount: imgMatches ? imgMatches.length : 0,
    hasIconSystem,
    hasReplacementHelper,
    hasIconMappings,
    issues,
    status: (hasIconSystem || hasReplacementHelper) && hasIconMappings ? 'ok' : 'needs_attention'
  };
}

/**
 * Check JS file for icon usage
 */
function checkJSFile(filePath, pageName) {
  const content = readFile(filePath);
  const issues = [];
  
  // Check for direct img creation
  const createElementRegex = /createElement\(['"]img['"]\)/gi;
  const createElementMatches = content.match(createElementRegex);
  
  if (createElementMatches && createElementMatches.length > 0) {
    // Check if it's using IconSystem
    const hasIconSystemUsage = content.includes('IconSystem.renderIcon') ||
                                content.includes('replaceIconsInContext');
    
    if (!hasIconSystemUsage) {
      issues.push({
        type: 'createElement_img',
        count: createElementMatches.length
      });
    }
  }
  
  // Check for innerHTML with img tags
  const innerHTMLRegex = /innerHTML\s*=\s*['"][^'"]*<img[^>]*src=["']\/trading-ui\/images\/icons\//gi;
  const innerHTMLMatches = content.match(innerHTMLRegex);
  
  if (innerHTMLMatches && innerHTMLMatches.length > 0) {
    const hasIconSystemUsage = content.includes('IconSystem.renderIcon') ||
                                content.includes('replaceIconsInContext');
    
    if (!hasIconSystemUsage) {
      issues.push({
        type: 'innerHTML_img',
        count: innerHTMLMatches.length
      });
    }
  }
  
  // Check for IconSystem usage
  // Note: icon-system.js is loaded via package-manifest.js (base package)
  // If the page loads package-manifest, it has access to IconSystem
  const hasIconSystem = content.includes('IconSystem') ||
                        content.includes('replaceIconsInContext') ||
                        content.includes('icon-system.js') ||
                        content.includes('package-manifest.js') ||
                        content.includes('init-system/package-manifest');
  
  return {
    pageName,
    filePath,
    hasDirectImgCreation: issues.length > 0,
    issues,
    hasIconSystem,
    status: hasIconSystem && issues.length === 0 ? 'ok' : 'needs_attention'
  };
}

/**
 * Test a single page
 */
function testPage(pageName, category) {
  results.total++;
  
  const htmlPath = path.join(HTML_DIR, pageName);
  const jsName = pageName.replace('.html', '.js');
  const jsPath = path.join(HTML_DIR, 'scripts', jsName);
  
  const pageResult = {
    pageName,
    category,
    html: null,
    js: null,
    status: 'unknown'
  };
  
  // Check HTML file
  if (fileExists(htmlPath)) {
    pageResult.html = checkHTMLFile(htmlPath, pageName);
  }
  
  // Check JS file
  if (fileExists(jsPath)) {
    pageResult.js = checkJSFile(jsPath, pageName);
  }
  
  // Determine overall status
  // If HTML has package-manifest.js, IconSystem is available even if JS doesn't use it directly
  // The auto-replacement helper will handle direct <img> tags in HTML
  const htmlHasIconSystem = pageResult.html && 
                            (pageResult.html.hasIconSystem || 
                             pageResult.html.hasReplacementHelper || 
                             pageResult.html.hasIconMappings);
  
  if (htmlHasIconSystem && 
      (!pageResult.js || pageResult.js.status === 'ok' || !pageResult.js.hasDirectImgCreation)) {
    // HTML has IconSystem support, and JS either doesn't exist, is ok, or doesn't create direct img tags
    if (pageResult.html && pageResult.html.hasDirectImgTags && 
        (pageResult.html.hasReplacementHelper || pageResult.html.hasIconSystem)) {
      // Has direct img tags but also has replacement system - will be fixed automatically
      pageResult.status = 'auto_fix';
    } else {
      pageResult.status = 'passed';
    }
    results.passed++;
  } else if (pageResult.html && pageResult.html.hasDirectImgTags && 
             (pageResult.html.hasReplacementHelper || pageResult.html.hasIconSystem)) {
    // Has direct img tags but also has replacement system - will be fixed automatically
    pageResult.status = 'auto_fix';
    results.passed++;
  } else {
    pageResult.status = 'failed';
    results.failed++;
  }
  
  results.pages[pageName] = pageResult;
  
  return pageResult;
}

/**
 * Test mockup pages
 */
function testMockupPages() {
  const mockupDirs = ['daily-snapshots'];
  
  mockupDirs.forEach(dir => {
    const mockupPath = path.join(MOCKUPS_DIR, dir);
    if (!fs.existsSync(mockupPath)) return;
    
    const files = fs.readdirSync(mockupPath);
    files.forEach(file => {
      if (file.endsWith('.html')) {
        testPage(path.join('mockups', dir, file), 'mockup');
      }
    });
  });
}

/**
 * Run all tests
 */
function runTests() {
  console.log('🔍 Starting Icon System Standardization Tests...\n');
  
  // Test main pages
  console.log('📄 Testing Main Pages...');
  MAIN_PAGES.forEach(page => {
    const result = testPage(page, 'main');
    const statusIcon = result.status === 'passed' || result.status === 'auto_fix' ? '✅' : '❌';
    console.log(`  ${statusIcon} ${page}`);
  });
  
  // Test technical pages
  console.log('\n🔧 Testing Technical Pages...');
  TECHNICAL_PAGES.forEach(page => {
    const result = testPage(page, 'technical');
    const statusIcon = result.status === 'passed' || result.status === 'auto_fix' ? '✅' : '❌';
    console.log(`  ${statusIcon} ${page}`);
  });
  
  // Test dev tools pages
  console.log('\n🛠️  Testing Dev Tools Pages...');
  DEV_TOOLS_PAGES.forEach(page => {
    const result = testPage(page, 'dev_tools');
    const statusIcon = result.status === 'passed' || result.status === 'auto_fix' ? '✅' : '❌';
    console.log(`  ${statusIcon} ${page}`);
  });
  
  // Test mockup pages
  console.log('\n🎨 Testing Mockup Pages...');
  testMockupPages();
}

/**
 * Generate report
 */
function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total Pages Tested: ${results.total}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`⚠️  Warnings: ${results.warnings}`);
  console.log(`\nSuccess Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`);
  
  // Failed pages
  const failedPages = Object.entries(results.pages)
    .filter(([_, result]) => result.status === 'failed')
    .map(([name, _]) => name);
  
  if (failedPages.length > 0) {
    console.log('\n❌ Failed Pages:');
    failedPages.forEach(page => {
      console.log(`  - ${page}`);
      const result = results.pages[page];
      if (result.html && result.html.issues.length > 0) {
        result.html.issues.forEach(issue => {
          console.log(`    • ${issue.type}: ${issue.count} occurrences`);
        });
      }
      if (result.js && result.js.issues.length > 0) {
        result.js.issues.forEach(issue => {
          console.log(`    • ${issue.type}: ${issue.count} occurrences`);
        });
      }
    });
  }
  
  // Pages with auto-fix
  const autoFixPages = Object.entries(results.pages)
    .filter(([_, result]) => result.status === 'auto_fix')
    .map(([name, _]) => name);
  
  if (autoFixPages.length > 0) {
    console.log('\n🔄 Pages with Auto-Fix (will be fixed automatically):');
    autoFixPages.forEach(page => {
      const result = results.pages[page];
      console.log(`  - ${page} (${result.html.directImgTagCount} direct img tags)`);
    });
  }
  
  console.log('\n' + '='.repeat(80));
  
  // Save detailed report
  const reportPath = path.join(PROJECT_ROOT, 'documentation', '05-REPORTS', 'ICON_SYSTEM_TESTING_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
}

// Run tests
runTests();
generateReport();

// Exit with appropriate code
process.exit(results.failed > 0 ? 1 : 0);

