/**
 * Post-build Validation Script
 * Validates bundles after build and checks page configurations
 *
 * This script runs after build:bundles to ensure:
 * - All bundles were created successfully
 * - Bundle sizes are reasonable
 * - Pages are configured to use bundles
 * - No critical errors in bundle generation
 */

const fs = require('fs');
const path = require('path');

// Import package manifest
let PACKAGE_MANIFEST;
try {
  PACKAGE_MANIFEST = require(path.join(__dirname, '../../trading-ui/scripts/init-system/package-manifest.js'));
} catch (error) {
  console.error('❌ Cannot load package manifest:', error.message);
  process.exit(1);
}

function validateBundles() {
  console.log('🔍 Validating bundle files...');

  const bundlesDir = path.join(__dirname, '../../trading-ui/scripts/bundles');
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(bundlesDir)) {
    errors.push('Bundles directory does not exist');
    return { errors, warnings };
  }

  // Get actual bundle files (exclude manifest-related files)
  const bundleFiles = fs.readdirSync(bundlesDir)
    .filter(file => file.endsWith('.bundle.js') && !file.includes('PACKAGE_MANIFEST') && !file.includes('PackageManifest'));

  if (bundleFiles.length === 0) {
    errors.push('No bundle files found');
    return { errors, warnings };
  }

  let bundlesValid = 0;
  let bundlesInvalid = 0;

  bundleFiles.forEach(bundleFile => {
    const fullPath = path.join(bundlesDir, bundleFile);
    const packageName = bundleFile.replace('.bundle.js', '');
    const bundleMapFile = path.join(bundlesDir, `${bundleFile}.map`);

    // Check bundle file size
    const stats = fs.statSync(fullPath);
    const sizeKB = Math.round(stats.size / 1024);

    if (sizeKB === 0) {
      errors.push(`Bundle file is empty: ${bundleFile}`);
      bundlesInvalid++;
    } else if (sizeKB > 2048) { // 2MB warning
      warnings.push(`Large bundle: ${bundleFile} (${sizeKB}KB)`);
      bundlesValid++;
    } else {
      bundlesValid++;
    }

    // Check source map (optional)
    if (!fs.existsSync(bundleMapFile)) {
      warnings.push(`Missing source map: ${bundleFile}.map`);
    }

    console.log(`  ✅ ${bundleFile} (${sizeKB}KB)`);
  });

  console.log(`\n📊 Bundle Validation Results:`);
  console.log(`  ✅ Valid: ${bundlesValid}`);
  console.log(`  ❌ Invalid: ${bundlesInvalid}`);
  console.log(`  📦 Total bundles: ${bundleFiles.length}`);

  return { errors, warnings };
}

function validatePagesUseBundles() {
  console.log('\n🔍 Validating pages use bundles...');

  const htmlDir = path.join(__dirname, '../../trading-ui');
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(htmlDir)) {
    errors.push('HTML directory does not exist');
    return { errors, warnings };
  }

  // Find all HTML files
  const htmlFiles = fs.readdirSync(htmlDir)
    .filter(file => file.endsWith('.html'))
    .map(file => path.join(htmlDir, file));

  let pagesWithBundles = 0;
  let pagesWithoutBundles = 0;

  htmlFiles.forEach(htmlFile => {
    const content = fs.readFileSync(htmlFile, 'utf8');
    const fileName = path.basename(htmlFile);

    // Check if page uses bundles
    const hasBundleScript = content.includes('bundle.js') || content.includes('bundles/');

    if (hasBundleScript) {
      pagesWithBundles++;
      console.log(`  ✅ ${fileName} - uses bundles`);
    } else {
      pagesWithoutBundles++;
      warnings.push(`Page not using bundles: ${fileName}`);
      console.log(`  ⚠️  ${fileName} - not using bundles`);
    }
  });

  console.log(`\n📊 Page Validation Results:`);
  console.log(`  ✅ With bundles: ${pagesWithBundles}`);
  console.log(`  ⚠️  Without bundles: ${pagesWithoutBundles}`);

  return { errors, warnings };
}

function main() {
  console.log('================================================================================');
  console.log('🔧 Post-build Validation');
  console.log('================================================================================\n');

  const allErrors = [];
  const allWarnings = [];

  // Validate bundles
  const bundleResults = validateBundles();
  allErrors.push(...bundleResults.errors);
  allWarnings.push(...bundleResults.warnings);

  // Validate pages use bundles
  const pageResults = validatePagesUseBundles();
  allErrors.push(...pageResults.errors);
  allWarnings.push(...pageResults.warnings);

  console.log('\n================================================================================');

  // Show warnings
  if (allWarnings.length > 0) {
    console.log('⚠️  Warnings:');
    allWarnings.forEach(warning => console.log(`  - ${warning}`));
  }

  if (allErrors.length === 0) {
    console.log('✅ Post-build validation passed!');
    console.log('\n🎉 Bundles are ready for production deployment!');
    process.exit(0);
  } else {
    console.log('❌ Post-build validation failed:');
    allErrors.forEach(error => console.log(`  - ${error}`));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { validateBundles, validatePagesUseBundles };
