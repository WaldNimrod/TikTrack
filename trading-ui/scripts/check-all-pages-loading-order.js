/**
 * Check All Pages Loading Order
 * ==============================
 * 
 * בודק את סדר הטעינה של modal configs בכל העמודים
 * ומזהה בעיות שבהן modal configs נטענים אחרי modal-manager-v2.js
 */

const fs = require('fs');
const path = require('path');

// Load page configs
const configsPath = path.join(__dirname, 'page-initialization-configs.js');
const configsContent = fs.readFileSync(configsPath, 'utf8');
const vm = require('vm');
const context = { 
  window: {}, 
  pageInitializationConfigs: {}, 
  module: {}, 
  exports: {}, 
  require: require, 
  __dirname, 
  __filename: configsPath 
};
vm.createContext(context);
vm.runInContext(configsContent, context);
const pageInitializationConfigs = context.window.pageInitializationConfigs || context.pageInitializationConfigs || {};

// Load package manifest
const manifestPath = path.join(__dirname, 'init-system', 'package-manifest.js');
const manifestContent = fs.readFileSync(manifestPath, 'utf8');
const manifestContext = { 
  module: { exports: {} }, 
  exports: {}, 
  require: require, 
  __dirname: path.dirname(manifestPath), 
  __filename: manifestPath 
};
vm.createContext(manifestContext);
vm.runInContext(manifestContent, manifestContext);
const PACKAGE_MANIFEST = manifestContext.module.exports?.PACKAGE_MANIFEST || manifestContext.exports?.PACKAGE_MANIFEST || {};

// Get all modal configs from manifest
const modalConfigs = [];
Object.values(PACKAGE_MANIFEST).forEach(pkg => {
  if (pkg.scripts) {
    pkg.scripts.forEach(script => {
      if (script.file.includes('modal-configs/')) {
        modalConfigs.push({
          file: script.file,
          globalCheck: script.globalCheck,
          required: script.required !== false
        });
      }
    });
  }
});

console.log('🔍 Checking loading order for all pages...\n');
console.log(`Found ${modalConfigs.length} modal configs in manifest:\n`);
modalConfigs.forEach(config => {
  console.log(`  - ${config.file} (required: ${config.required})`);
});
console.log('\n');

// Get all pages with modules package
const pagesWithModules = Object.keys(pageInitializationConfigs).filter(pageName => {
  const config = pageInitializationConfigs[pageName];
  return config && config.packages && config.packages.includes('modules');
});

console.log(`📋 Found ${pagesWithModules.length} pages with modules package\n`);

const results = {
  total: pagesWithModules.length,
  fixed: 0,
  issues: [],
  healthy: []
};

// Check each page
pagesWithModules.forEach(pageName => {
  const htmlPath = path.join(__dirname, '..', `${pageName}.html`);
  
  if (!fs.existsSync(htmlPath)) {
    console.log(`⏭️  Skipping ${pageName} - HTML file not found`);
    return;
  }
  
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  
  // Find modal-manager-v2.js position
  const modalManagerMatch = htmlContent.match(/<script[^>]*modal-manager-v2\.js[^>]*>/i);
  if (!modalManagerMatch) {
    console.log(`⚠️  ${pageName}: modal-manager-v2.js not found`);
    return;
  }
  
  const modalManagerIndex = htmlContent.indexOf(modalManagerMatch[0]);
  
  // Check each modal config
  const pageIssues = [];
  modalConfigs.forEach(config => {
    // Check if this config is required for this page
    const pageConfig = pageInitializationConfigs[pageName];
    const requiredGlobals = pageConfig?.requiredGlobals || [];
    const isRequired = config.required && requiredGlobals.some(g => g.includes(config.globalCheck?.replace('window.', '') || ''));
    
    // Find config script position
    const configPattern = new RegExp(`<script[^>]*${config.file.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^>]*>`, 'i');
    const configMatch = htmlContent.match(configPattern);
    
    if (configMatch) {
      const configIndex = htmlContent.indexOf(configMatch[0]);
      
      // Check if config loads after modal-manager-v2
      if (configIndex > modalManagerIndex) {
        pageIssues.push({
          config: config.file,
          globalCheck: config.globalCheck,
          required: isRequired,
          message: `${config.file} loads AFTER modal-manager-v2.js (should be before)`
        });
      }
    } else if (isRequired) {
      // Config is required but not found
      pageIssues.push({
        config: config.file,
        globalCheck: config.globalCheck,
        required: true,
        message: `${config.file} is required but not found in HTML`
      });
    }
  });
  
  if (pageIssues.length > 0) {
    results.issues.push({
      page: pageName,
      issues: pageIssues
    });
    console.log(`❌ ${pageName}: ${pageIssues.length} issue(s)`);
    pageIssues.forEach(issue => {
      console.log(`   - ${issue.message}`);
    });
  } else {
    results.healthy.push(pageName);
    console.log(`✅ ${pageName}: OK`);
  }
});

// Summary
console.log('\n' + '='.repeat(60));
console.log('📊 Summary:');
console.log('='.repeat(60));
console.log(`Total pages checked: ${results.total}`);
console.log(`✅ Healthy pages: ${results.healthy.length}`);
console.log(`❌ Pages with issues: ${results.issues.length}`);

if (results.issues.length > 0) {
  console.log('\n📋 Pages with issues:');
  results.issues.forEach(({ page, issues }) => {
    console.log(`\n  ${page}:`);
    issues.forEach(issue => {
      console.log(`    - ${issue.message}`);
    });
  });
  
  // Generate report file
  const reportPath = path.join(__dirname, '..', '..', 'documentation', '05-REPORTS', 'LOADING_ORDER_ISSUES_REPORT.md');
  const reportDir = path.dirname(reportPath);
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const reportContent = `# Loading Order Issues Report

**Generated:** ${new Date().toISOString()}
**Total Pages Checked:** ${results.total}
**Pages with Issues:** ${results.issues.length}
**Healthy Pages:** ${results.healthy.length}

## Pages with Issues

${results.issues.map(({ page, issues }) => `
### ${page}

${issues.map(issue => `- **${issue.config}**: ${issue.message}`).join('\n')}
`).join('\n')}

## Healthy Pages

${results.healthy.map(page => `- ${page}`).join('\n')}

## Recommendations

1. Run \`update-all-pages-script-loading.js --force\` to regenerate all pages
2. Verify that modal configs load before modal-manager-v2.js in all pages
3. Check package-manifest.js to ensure correct loadOrder values
`;

  fs.writeFileSync(reportPath, reportContent, 'utf8');
  console.log(`\n📄 Report saved to: ${reportPath}`);
} else {
  console.log('\n🎉 All pages have correct loading order!');
}

process.exit(results.issues.length > 0 ? 1 : 0);

