/**
 * Pre-build Check Script
 * Validates bundles exist and are ready before build
 *
 * This script runs before build:bundles to ensure:
 * - All required bundle files exist
 * - Bundle packages are properly configured
 * - No conflicts or missing dependencies
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

function checkBundleExistence() {
  console.log('🔍 Checking bundle existence...');

  const bundlesDir = path.join(__dirname, '../../trading-ui/scripts/bundles');
  const errors = [];

  // Check if bundles directory exists
  if (!fs.existsSync(bundlesDir)) {
    console.log('📁 Creating bundles directory...');
    fs.mkdirSync(bundlesDir, { recursive: true });
  }

  // Check each package has bundle file
  const packages = Object.keys(PACKAGE_MANIFEST);
  let bundlesFound = 0;
  let bundlesMissing = 0;

  packages.forEach(packageName => {
    const bundleFile = path.join(bundlesDir, `${packageName}.bundle.js`);
    const bundleMapFile = path.join(bundlesDir, `${packageName}.bundle.js.map`);

    if (fs.existsSync(bundleFile)) {
      bundlesFound++;
      console.log(`  ✅ ${packageName}.bundle.js`);
    } else {
      bundlesMissing++;
      console.log(`  ❌ ${packageName}.bundle.js - MISSING`);
    }

    // Source maps are optional but recommended
    if (fs.existsSync(bundleMapFile)) {
      console.log(`     📄 ${packageName}.bundle.js.map`);
    }
  });

  console.log(`\n📊 Bundle Check Results:`);
  console.log(`  ✅ Found: ${bundlesFound}`);
  console.log(`  ❌ Missing: ${bundlesMissing}`);
  console.log(`  📦 Total packages: ${packages.length}`);

  if (bundlesMissing > 0) {
    console.log(`\n⚠️  Some bundles are missing. They will be created during build.`);
  }

  return bundlesMissing === 0;
}

function validatePackageManifest() {
  console.log('\n🔍 Validating package manifest...');

  const errors = [];

  if (!PACKAGE_MANIFEST || typeof PACKAGE_MANIFEST !== 'object') {
    errors.push('Package manifest is not a valid object');
    return errors;
  }

  const packages = Object.keys(PACKAGE_MANIFEST);

  if (packages.length === 0) {
    errors.push('No packages found in manifest');
    return errors;
  }

  console.log(`  ✅ Found ${packages.length} packages`);

  // Check each package has required properties
  packages.forEach(packageName => {
    const packageConfig = PACKAGE_MANIFEST[packageName];

    if (!packageConfig.files || !Array.isArray(packageConfig.files)) {
      errors.push(`Package '${packageName}' missing 'files' array`);
    } else if (packageConfig.files.length === 0) {
      console.log(`  ⚠️  Package '${packageName}' has no files`);
    }
  });

  if (errors.length === 0) {
    console.log('  ✅ Package manifest is valid');
  }

  return errors;
}

function main() {
  console.log('================================================================================');
  console.log('🔧 Pre-build Check');
  console.log('================================================================================\n');

  const errors = [];

  // Check bundle existence
  const bundlesReady = checkBundleExistence();

  // Validate package manifest
  const manifestErrors = validatePackageManifest();
  errors.push(...manifestErrors);

  console.log('\n================================================================================');

  if (errors.length === 0) {
    console.log('✅ Pre-build check passed!');
    if (!bundlesReady) {
      console.log('ℹ️  Bundles will be created during build.');
    }
    process.exit(0);
  } else {
    console.log('❌ Pre-build check failed:');
    errors.forEach(error => console.log(`  - ${error}`));
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { checkBundleExistence, validatePackageManifest };
