#!/usr/bin/env node
/**
 * Test Bundles Script
 * Tests bundles for size, source maps, and functionality
 */

const fs = require('fs');
const path = require('path');

// Configuration
const SCRIPTS_DIR = path.join(__dirname, '..', '..', 'trading-ui', 'scripts');
const BUNDLES_DIR = path.join(SCRIPTS_DIR, 'bundles');

// Load package manifest
const manifestPath = path.join(SCRIPTS_DIR, 'init-system', 'package-manifest.js');
let PACKAGE_MANIFEST = {};

try {
  const manifestContent = fs.readFileSync(manifestPath, 'utf8');
  const vm = require('vm');
  const context = { 
    module: {}, 
    exports: {}, 
    require: require, 
    __dirname: path.dirname(manifestPath), 
    __filename: manifestPath,
    PACKAGE_MANIFEST: {},
    window: {}
  };
  vm.createContext(context);
  vm.runInContext(manifestContent, context);
  
  // Try different ways to get PACKAGE_MANIFEST
  if (context.module.exports && context.module.exports.PACKAGE_MANIFEST) {
    PACKAGE_MANIFEST = context.module.exports.PACKAGE_MANIFEST;
  } else if (context.PACKAGE_MANIFEST && Object.keys(context.PACKAGE_MANIFEST).length > 0) {
    PACKAGE_MANIFEST = context.PACKAGE_MANIFEST;
  } else if (context.window && context.window.PACKAGE_MANIFEST) {
    PACKAGE_MANIFEST = context.window.PACKAGE_MANIFEST;
  } else {
    // Try eval approach
    const evalResult = eval(`(function() { ${manifestContent}; return typeof PACKAGE_MANIFEST !== 'undefined' ? PACKAGE_MANIFEST : {}; })()`);
    if (evalResult && Object.keys(evalResult).length > 0) {
      PACKAGE_MANIFEST = evalResult;
    }
  }
  
  if (!PACKAGE_MANIFEST || Object.keys(PACKAGE_MANIFEST).length === 0) {
    throw new Error('PACKAGE_MANIFEST is empty or not found');
  }
} catch (e) {
  console.error('❌ Could not load package manifest:', e.message);
  process.exit(1);
}

/**
 * Test a single bundle
 */
function testBundle(packageId, packageConfig) {
  const bundlePath = path.join(BUNDLES_DIR, `${packageId}.bundle.js`);
  const mapPath = path.join(BUNDLES_DIR, `${packageId}.bundle.js.map`);

  const results = {
    packageId,
    bundleExists: false,
    mapExists: false,
    bundleSize: 0,
    mapSize: 0,
    originalSize: 0,
    sizeRatio: 0,
    isValid: false,
    errors: []
  };

  // Check if bundle exists
  if (!fs.existsSync(bundlePath)) {
    results.errors.push('Bundle file not found');
    return results;
  }
  results.bundleExists = true;

  // Check if source map exists
  if (fs.existsSync(mapPath)) {
    results.mapExists = true;
    results.mapSize = fs.statSync(mapPath).size;
  } else {
    results.errors.push('Source map not found');
  }

  // Get bundle size
  results.bundleSize = fs.statSync(bundlePath).size;

  // Calculate original size
  const scripts = (packageConfig.scripts || [])
    .filter(script => script.required !== false && !script.file.startsWith('http'))
    .sort((a, b) => (a.loadOrder || 0) - (b.loadOrder || 0));

  results.originalSize = scripts.reduce((sum, script) => {
    const scriptPath = path.join(SCRIPTS_DIR, script.file);
    if (fs.existsSync(scriptPath)) {
      return sum + fs.statSync(scriptPath).size;
    }
    return sum;
  }, 0);

  // Calculate size ratio (bundle should be <= 150% of original)
  results.sizeRatio = (results.bundleSize / results.originalSize) * 100;

  // Validate bundle content
  try {
    const bundleContent = fs.readFileSync(bundlePath, 'utf8');
    
    // Check for basic JavaScript syntax
    if (!bundleContent.includes('function') && !bundleContent.includes('=>')) {
      results.errors.push('Bundle appears to be empty or invalid');
    }

    // Check for source map reference
    if (!bundleContent.includes('sourceMappingURL')) {
      results.errors.push('Bundle missing source map reference');
    }

    results.isValid = results.errors.length === 0;
  } catch (error) {
    results.errors.push(`Error reading bundle: ${error.message}`);
  }

  return results;
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const packageArg = args.find(arg => arg.startsWith('--package='));
  const specificPackage = packageArg ? packageArg.split('=')[1] : null;

  console.log('='.repeat(80));
  console.log('🧪 Testing Package Bundles');
  console.log('='.repeat(80));
  console.log();

  if (!fs.existsSync(BUNDLES_DIR)) {
    console.error('❌ Bundles directory not found. Run build:bundles first.');
    process.exit(1);
  }

  const packages = specificPackage 
    ? (PACKAGE_MANIFEST[specificPackage] ? { [specificPackage]: PACKAGE_MANIFEST[specificPackage] } : {})
    : PACKAGE_MANIFEST;

  if (!packages || Object.keys(packages).length === 0) {
    console.error('❌ No packages found');
    process.exit(1);
  }

  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  const sortedPackages = Object.entries(packages)
    .filter(([id, pkg]) => pkg && pkg.scripts && pkg.scripts.length > 0)
    .sort(([, a], [, b]) => (a.loadOrder || 0) - (b.loadOrder || 0));

  console.log(`📋 Testing ${sortedPackages.length} packages\n`);

  for (const [packageId, packageConfig] of sortedPackages) {
    console.log(`🧪 Testing: ${packageId}...`);
    
    const testResult = testBundle(packageId, packageConfig);
    
    if (!testResult.bundleExists) {
      results.warnings.push({ packageId, reason: 'Bundle not found' });
      console.log(`  ⚠️  Bundle not found (skipped)`);
      continue;
    }

    const sizeStatus = testResult.sizeRatio <= 150 ? '✅' : '⚠️';
    const mapStatus = testResult.mapExists ? '✅' : '❌';
    const validStatus = testResult.isValid ? '✅' : '❌';

    console.log(`  ${validStatus} Valid: ${testResult.isValid}`);
    console.log(`  ${mapStatus} Source Map: ${testResult.mapExists}`);
    console.log(`  ${sizeStatus} Size: ${(testResult.bundleSize / 1024).toFixed(2)}KB (${testResult.sizeRatio.toFixed(1)}% of original)`);
    
    if (testResult.errors.length > 0) {
      console.log(`  ❌ Errors: ${testResult.errors.join(', ')}`);
      results.failed.push(testResult);
    } else if (testResult.sizeRatio > 150) {
      results.warnings.push({ packageId, reason: `Size ratio ${testResult.sizeRatio.toFixed(1)}% exceeds 150%` });
    } else {
      results.passed.push(testResult);
    }
    console.log();
  }

  // Summary
  console.log('='.repeat(80));
  console.log('📊 Test Summary');
  console.log('='.repeat(80));
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);
  console.log();

  if (results.failed.length > 0) {
    console.log('❌ Failed Tests:');
    results.failed.forEach(result => {
      console.log(`   - ${result.packageId}: ${result.errors.join(', ')}`);
    });
    console.log();
  }

  if (results.warnings.length > 0) {
    console.log('⚠️  Warnings:');
    results.warnings.forEach(({ packageId, reason }) => {
      console.log(`   - ${packageId}: ${reason}`);
    });
    console.log();
  }

  console.log('='.repeat(80));
  console.log(results.failed.length === 0 ? '✅ All Tests Passed' : '❌ Some Tests Failed');
  console.log('='.repeat(80));

  process.exit(results.failed.length > 0 ? 1 : 0);
}

if (require.main === module) {
  main();
}

module.exports = { testBundle };

