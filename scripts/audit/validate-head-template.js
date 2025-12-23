/**
 * Validate Head Template for All Pages
 * =====================================
 * 
 * Validates that all HTML pages have a consistent <head> structure:
 * - No duplicate CSS files (especially header-styles.css)
 * - Correct CSS loading order (Bootstrap → header-styles.css → master.css → page-specific)
 * - No duplicate script loading
 * - Consistent structure across all pages
 * 
 * @version 1.0.0
 * @created December 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');

const tradingUiDir = path.join(__dirname, '../../trading-ui');

/**
 * Expected CSS loading order in <head>
 */
const EXPECTED_CSS_ORDER = [
  'bootstrap.min.css',
  'header-styles.css',
  'master.css'
];

/**
 * CSS files that should only appear once
 */
const CSS_FILES_TO_CHECK = [
  'header-styles.css',
  'master.css',
  'bootstrap.min.css'
];

/**
 * Extract <head> content from HTML file
 */
function extractHeadContent(htmlContent) {
  const headMatch = htmlContent.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  return headMatch ? headMatch[1] : null;
}

/**
 * Extract all CSS links from head content
 */
function extractCSSLinks(headContent) {
  const cssPattern = /<link[^>]*href=["']([^"']*\.css[^"']*)["'][^>]*>/gi;
  const links = [];
  let match;
  
  while ((match = cssPattern.exec(headContent)) !== null) {
    const href = match[1];
    const fullTag = match[0];
    links.push({
      href: href,
      fullTag: fullTag,
      position: match.index
    });
  }
  
  return links;
}

/**
 * Extract all script tags from head content
 */
function extractScriptTags(headContent) {
  const scriptPattern = /<script[^>]*src=["']([^"']+)["'][^>]*>/gi;
  const scripts = [];
  let match;
  
  while ((match = scriptPattern.exec(headContent)) !== null) {
    const src = match[1];
    const fullTag = match[0];
    scripts.push({
      src: src,
      fullTag: fullTag,
      position: match.index
    });
  }
  
  return scripts;
}

/**
 * Check for duplicate CSS files
 */
function checkDuplicateCSS(cssLinks, pageName) {
  const issues = [];
  const cssCounts = {};
  
  cssLinks.forEach(link => {
    const filename = path.basename(link.href.split('?')[0]);
    cssCounts[filename] = (cssCounts[filename] || 0) + 1;
  });
  
  CSS_FILES_TO_CHECK.forEach(cssFile => {
    const count = cssCounts[cssFile] || 0;
    if (count > 1) {
      issues.push({
        type: 'duplicate_css',
        file: cssFile,
        count: count,
        page: pageName,
        severity: 'error',
        message: `Duplicate CSS file: ${cssFile} appears ${count} times`,
        fix: `Remove duplicate <link> tags for ${cssFile}, keep only one before master.css`
      });
    }
  });
  
  return issues;
}

/**
 * Check CSS loading order
 */
function checkCSSOrder(cssLinks, pageName) {
  const issues = [];
  const linkOrder = [];
  
  cssLinks.forEach(link => {
    const filename = path.basename(link.href.split('?')[0]);
    const expectedIndex = EXPECTED_CSS_ORDER.findIndex(expected => filename.includes(expected));
    if (expectedIndex >= 0) {
      linkOrder.push({
        filename: filename,
        position: link.position,
        expectedIndex: expectedIndex
      });
    }
  });
  
  // Sort by position and check order
  linkOrder.sort((a, b) => a.position - b.position);
  
  // Check order - each CSS should appear in the expected order
  // Bootstrap (0) → header-styles (1) → master (2)
  for (let i = 0; i < linkOrder.length - 1; i++) {
    const current = linkOrder[i];
    const next = linkOrder[i + 1];
    
    // If current CSS should come AFTER next CSS in expected order, that's wrong
    // (e.g., master.css appearing before header-styles.css)
    if (current.expectedIndex > next.expectedIndex) {
      issues.push({
        type: 'css_order',
        page: pageName,
        severity: 'warning',
        message: `CSS loading order issue: ${current.filename} appears before ${next.filename}, but should come after`,
        expected: `Expected order: ${EXPECTED_CSS_ORDER[next.expectedIndex]} → ${EXPECTED_CSS_ORDER[current.expectedIndex]}`,
        fix: `Reorder CSS links: ${EXPECTED_CSS_ORDER.join(' → ')}`
      });
    }
  }
  
  // Check for header-styles.css before master.css
  // Find the actual position in the sorted array (by file position in HTML)
  const headerStylesLink = linkOrder.find(link => link.filename === 'header-styles.css');
  const masterCSSLink = linkOrder.find(link => link.filename === 'master.css');
  
  // header-styles.css should come BEFORE master.css (lower position value)
  if (headerStylesLink && masterCSSLink && headerStylesLink.position > masterCSSLink.position) {
    issues.push({
      type: 'css_order',
      page: pageName,
      severity: 'error',
      message: 'header-styles.css must be loaded before master.css',
      fix: 'Move header-styles.css link before master.css link'
    });
  }
  
  return issues;
}

/**
 * Check for duplicate script tags
 */
function checkDuplicateScripts(scripts, pageName) {
  const issues = [];
  const scriptCounts = {};
  
  scripts.forEach(script => {
    const filename = path.basename(script.src.split('?')[0]);
    if (!scriptCounts[filename]) {
      scriptCounts[filename] = [];
    }
    scriptCounts[filename].push(script);
  });
  
  Object.keys(scriptCounts).forEach(filename => {
    if (scriptCounts[filename].length > 1) {
      issues.push({
        type: 'duplicate_script',
        file: filename,
        count: scriptCounts[filename].length,
        page: pageName,
        severity: 'error',
        message: `Duplicate script: ${filename} appears ${scriptCounts[filename].length} times`,
        fix: `Remove duplicate <script> tags for ${filename}`
      });
    }
  });
  
  return issues;
}

/**
 * Validate a single HTML file
 */
function validateHTMLFile(filePath) {
  const pageName = path.basename(filePath);
  const htmlContent = fs.readFileSync(filePath, 'utf-8');
  const headContent = extractHeadContent(htmlContent);
  
  if (!headContent) {
    return {
      page: pageName,
      file: filePath,
      issues: [{
        type: 'missing_head',
        severity: 'error',
        message: 'No <head> tag found',
        fix: 'Add proper <head> tag to HTML file'
      }]
    };
  }
  
  const cssLinks = extractCSSLinks(headContent);
  const scripts = extractScriptTags(headContent);
  
  const issues = [
    ...checkDuplicateCSS(cssLinks, pageName),
    ...checkCSSOrder(cssLinks, pageName),
    ...checkDuplicateScripts(scripts, pageName)
  ];
  
  return {
    page: pageName,
    file: filePath,
    issues: issues,
    cssLinks: cssLinks.length,
    scripts: scripts.length
  };
}

/**
 * Get all HTML files in trading-ui directory
 */
function getAllHTMLFiles() {
  const files = fs.readdirSync(tradingUiDir);
  return files
    .filter(file => file.endsWith('.html'))
    .filter(file => !file.includes('test-') && !file.includes('mockup'))
    .map(file => path.join(tradingUiDir, file));
}

/**
 * Main validation function
 */
function validateAllPages() {
  console.log('🔍 Validating head template for all pages...\n');
  
  const htmlFiles = getAllHTMLFiles();
  const results = htmlFiles.map(validateHTMLFile);
  
  const pagesWithIssues = results.filter(r => r.issues && r.issues.length > 0);
  const pagesWithoutIssues = results.filter(r => !r.issues || r.issues.length === 0);
  
  console.log('═══════════════════════════════════════════════════════════');
  console.log('📊 Validation Summary');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  console.log(`✅ Pages without issues: ${pagesWithoutIssues.length}`);
  console.log(`❌ Pages with issues: ${pagesWithIssues.length}`);
  console.log(`📄 Total pages checked: ${htmlFiles.length}\n`);
  
  if (pagesWithIssues.length > 0) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('❌ Pages with issues:');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    pagesWithIssues.forEach(result => {
      console.log(`\n📄 ${result.page}:`);
      console.log(`   CSS links: ${result.cssLinks || 0}, Scripts: ${result.scripts || 0}`);
      
      result.issues.forEach(issue => {
        const icon = issue.severity === 'error' ? '🔴' : '🟡';
        console.log(`   ${icon} [${issue.type}] ${issue.message}`);
        if (issue.fix) {
          console.log(`      Fix: ${issue.fix}`);
        }
      });
    });
    
    // Summary by issue type
    const issueTypes = {};
    pagesWithIssues.forEach(result => {
      result.issues.forEach(issue => {
        if (!issueTypes[issue.type]) {
          issueTypes[issue.type] = { count: 0, severity: issue.severity };
        }
        issueTypes[issue.type].count++;
      });
    });
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 Issues by type:');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    Object.keys(issueTypes).forEach(type => {
      const info = issueTypes[type];
      const icon = info.severity === 'error' ? '🔴' : '🟡';
      console.log(`   ${icon} ${type}: ${info.count} issue(s)`);
    });
    
    console.log('\n');
    process.exit(1); // Exit with error code
  } else {
    console.log('✅ All pages passed validation!\n');
    process.exit(0);
  }
}

// Run validation
if (require.main === module) {
  validateAllPages();
}

module.exports = {
  validateHTMLFile,
  validateAllPages,
  getAllHTMLFiles
};

