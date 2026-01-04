/**
 * Check Pages Loading - Verification Script
 * =========================================
 * 
 * סקריפט לבדיקת טעינה מדויקת של כל העמודים לאחר תיקוני חבילות
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @created 2025-01-27
 */


// ===== FUNCTION INDEX =====

// === Utility Functions ===
// - checkPagePackages() - Checkpagepackages
// - checkAllPages() - Checkallpages

/**
 * Check if all packages are loaded correctly for a page
 */
async function checkPagePackages(pageName) {
  const pageConfig = window.pageInitializationConfigs?.[pageName];
  if (!pageConfig) {
    console.error(`❌ Page config not found for: ${pageName}`);
    return { success: false, error: 'No page config found' };
  }

  const results = {
    pageName,
    packages: {
      expected: pageConfig.packages || [],
      loaded: [],
      missing: [],
      extra: []
    },
    globals: {
      expected: pageConfig.requiredGlobals || [],
      loaded: [],
      missing: []
    },
    errors: [],
    warnings: []
  };

  // Check packages by verifying their scripts are loaded
  const packageManifest = window.PACKAGE_MANIFEST || {};
  
  for (const packageId of results.packages.expected) {
    const pkg = packageManifest[packageId];
    if (!pkg) {
      results.errors.push(`Package '${packageId}' not found in manifest`);
      results.packages.missing.push(packageId);
      continue;
    }

    // Check if package scripts are loaded
    let allLoaded = true;
    for (const script of pkg.scripts || []) {
      if (script.globalCheck) {
        const globalExists = eval(`typeof ${script.globalCheck} !== 'undefined'`);
        if (!globalExists) {
          allLoaded = false;
          results.warnings.push(`Global '${script.globalCheck}' from package '${packageId}' not found`);
        }
      }
    }

    if (allLoaded) {
      results.packages.loaded.push(packageId);
    } else {
      results.packages.missing.push(packageId);
    }
  }

  // Check required globals
  for (const globalName of results.globals.expected) {
    const globalExists = eval(`typeof ${globalName} !== 'undefined'`);
    if (globalExists) {
      results.globals.loaded.push(globalName);
    } else {
      results.globals.missing.push(globalName);
      results.errors.push(`Required global '${globalName}' not found`);
    }
  }

  results.success = results.errors.length === 0 && results.packages.missing.length === 0;

  return results;
}

/**
 * Check all pages
 */
async function checkAllPages() {
  const pages = Object.keys(window.pageInitializationConfigs || {});
  const results = [];

  console.log(`🔍 Checking ${pages.length} pages...`);

  for (const pageName of pages) {
    console.log(`Checking page: ${pageName}`);
    const result = await checkPagePackages(pageName);
    results.push(result);

    if (result.success) {
      console.log(`✅ ${pageName}: OK`);
    } else {
      console.warn(`❌ ${pageName}:`, result.errors);
    }
  }

  // Summary
  const successCount = results.filter(r => r.success).length;
  const errorCount = results.filter(r => !r.success).length;

  console.log(`\n📊 Summary:`);
  console.log(`✅ Success: ${successCount}/${pages.length}`);
  console.log(`❌ Errors: ${errorCount}/${pages.length}`);

  // Detailed report
  console.log(`\n📋 Detailed Report:`);
  results.forEach(result => {
    if (!result.success) {
      console.group(`❌ ${result.pageName}`);
      if (result.packages.missing.length > 0) {
        console.log('Missing packages:', result.packages.missing);
      }
      if (result.globals.missing.length > 0) {
        console.log('Missing globals:', result.globals.missing);
      }
      if (result.errors.length > 0) {
        console.log('Errors:', result.errors);
      }
      console.groupEnd();
    }
  });

  return results;
}

// Export globally
window.checkPagePackages = checkPagePackages;
window.checkAllPages = checkAllPages;

console.log('✅ check-pages-loading.js loaded - use checkAllPages() to verify all pages');

