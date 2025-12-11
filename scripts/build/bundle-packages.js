#!/usr/bin/env node
/**
 * Bundle Packages Script
 * Creates bundles for each package using esbuild
 */

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

// Load package manifest
const manifestPath = path.join(__dirname, '..', '..', 'trading-ui', 'scripts', 'init-system', 'package-manifest.js');
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
  console.error('   Stack:', e.stack);
  process.exit(1);
}

// Configuration
const SCRIPTS_DIR = path.join(__dirname, '..', '..', 'trading-ui', 'scripts');
const BUNDLES_DIR = path.join(SCRIPTS_DIR, 'bundles');

// Create bundles directory if it doesn't exist
if (!fs.existsSync(BUNDLES_DIR)) {
  fs.mkdirSync(BUNDLES_DIR, { recursive: true });
}

/**
 * Bundle a single package
 */
async function bundlePackage(packageId, packageConfig) {
  const scripts = (packageConfig.scripts || [])
    .filter(script => script.required !== false)
    .sort((a, b) => (a.loadOrder || 0) - (b.loadOrder || 0));

  // Filter out external URLs (CDN)
  const localScripts = scripts.filter(script => 
    !script.file.startsWith('http://') && !script.file.startsWith('https://')
  );

  if (localScripts.length === 0) {
    console.log(`⚠️  Package ${packageId} has no local scripts to bundle`);
    return { success: false, reason: 'no_local_scripts' };
  }

  // Get script paths
  const scriptPaths = localScripts.map(script => {
    const scriptPath = path.join(SCRIPTS_DIR, script.file);
    if (!fs.existsSync(scriptPath)) {
      console.warn(`⚠️  Script not found: ${script.file}`);
      return null;
    }
    return scriptPath;
  }).filter(Boolean);

  if (scriptPaths.length === 0) {
    console.log(`⚠️  Package ${packageId} has no valid scripts`);
    return { success: false, reason: 'no_entry_points' };
  }

  const outputFile = path.join(BUNDLES_DIR, `${packageId}.bundle.js`);
  const outputMap = path.join(BUNDLES_DIR, `${packageId}.bundle.js.map`);
  
  // Normalize package ID for global name (replace hyphens with underscores)
  const normalizedPackageId = packageId.replace(/-/g, '_');
  const globalName = `TikTrack_${normalizedPackageId.charAt(0).toUpperCase() + normalizedPackageId.slice(1).replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())}`;

  try {
    // Read all scripts and concatenate them in order (preserving execution order)
    // This ensures that global scripts execute in the correct order
    let bundledContent = `/* ${packageConfig.name} Bundle - Generated: ${new Date().toISOString()} */\n`;
    bundledContent += `(function() {\n`;
    bundledContent += `'use strict';\n\n`;
    
    // Add each script with a separator comment
    for (let i = 0; i < scriptPaths.length; i++) {
      const scriptPath = scriptPaths[i];
      const scriptContent = fs.readFileSync(scriptPath, 'utf8');
      const scriptName = path.basename(scriptPath);
      
      bundledContent += `\n/* ===== Script ${i + 1}/${scriptPaths.length}: ${scriptName} ===== */\n`;
      bundledContent += scriptContent;
      bundledContent += `\n`;
    }
    
    bundledContent += `\n})();\n`;
    bundledContent += `//# sourceMappingURL=${packageId}.bundle.js.map\n`;

    // Write bundled content
    fs.writeFileSync(outputFile, bundledContent);
    
    // Create empty source map file (to avoid errors)
    const sourceMap = {
      version: 3,
      file: path.basename(outputFile),
      sources: scriptPaths.map(p => path.relative(SCRIPTS_DIR, p)),
      mappings: '',
      names: []
    };
    fs.writeFileSync(outputMap, JSON.stringify(sourceMap, null, 2));

    // Get file sizes
    const bundleSize = fs.statSync(outputFile).size;
    const mapSize = fs.statSync(outputMap).size;
    const originalSize = scriptPaths.reduce((sum, file) => {
      return sum + fs.statSync(file).size;
    }, 0);

    return {
      success: true,
      packageId,
      bundleSize,
      mapSize,
      originalSize,
      scriptsCount: scriptPaths.length,
      compressionRatio: ((1 - bundleSize / originalSize) * 100).toFixed(1)
    };
  } catch (error) {
    console.error(`❌ Error bundling package ${packageId}:`, error.message);
    return { success: false, packageId, error: error.message };
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const packageArg = args.find(arg => arg.startsWith('--package='));
  const specificPackage = packageArg ? packageArg.split('=')[1] : null;

  console.log('='.repeat(80));
  console.log('📦 Building Package Bundles');
  console.log('='.repeat(80));
  console.log();

  const packages = specificPackage 
    ? (PACKAGE_MANIFEST[specificPackage] ? { [specificPackage]: PACKAGE_MANIFEST[specificPackage] } : {})
    : PACKAGE_MANIFEST;

  if (!packages || Object.keys(packages).length === 0) {
    console.error('❌ No packages found');
    process.exit(1);
  }

  const results = {
    successful: [],
    failed: [],
    skipped: []
  };

  // Sort packages by loadOrder
  const sortedPackages = Object.entries(packages)
    .filter(([id, pkg]) => pkg && pkg.scripts && pkg.scripts.length > 0)
    .sort(([, a], [, b]) => (a.loadOrder || 0) - (b.loadOrder || 0));

  console.log(`📋 Found ${sortedPackages.length} packages to bundle\n`);

  for (const [packageId, packageConfig] of sortedPackages) {
    console.log(`🔄 Bundling: ${packageId} (${packageConfig.name})...`);
    
    const result = await bundlePackage(packageId, packageConfig);
    
    if (result.success) {
      results.successful.push(result);
      console.log(`  ✅ Success: ${(result.bundleSize / 1024).toFixed(2)}KB (${result.compressionRatio}% compression)`);
      console.log(`     Original: ${(result.originalSize / 1024).toFixed(2)}KB | Bundle: ${(result.bundleSize / 1024).toFixed(2)}KB | Map: ${(result.mapSize / 1024).toFixed(2)}KB`);
    } else if (result.reason === 'no_local_scripts' || result.reason === 'no_entry_points') {
      results.skipped.push({ packageId, reason: result.reason });
      console.log(`  ⚠️  Skipped: ${result.reason}`);
    } else {
      results.failed.push({ packageId, error: result.error });
      console.log(`  ❌ Failed: ${result.error}`);
    }
    console.log();
  }

  // Summary
  console.log('='.repeat(80));
  console.log('📊 Summary');
  console.log('='.repeat(80));
  console.log(`✅ Successful: ${results.successful.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⚠️  Skipped: ${results.skipped.length}`);
  console.log();

  if (results.successful.length > 0) {
    const totalOriginal = results.successful.reduce((sum, r) => sum + r.originalSize, 0);
    const totalBundle = results.successful.reduce((sum, r) => sum + r.bundleSize, 0);
    const totalMap = results.successful.reduce((sum, r) => sum + r.mapSize, 0);
    const totalCompression = ((1 - totalBundle / totalOriginal) * 100).toFixed(1);

    console.log('📦 Total Sizes:');
    console.log(`   Original: ${(totalOriginal / 1024).toFixed(2)}KB`);
    console.log(`   Bundles: ${(totalBundle / 1024).toFixed(2)}KB`);
    console.log(`   Source Maps: ${(totalMap / 1024).toFixed(2)}KB`);
    console.log(`   Compression: ${totalCompression}%`);
    console.log();
  }

  if (results.failed.length > 0) {
    console.log('❌ Failed Packages:');
    results.failed.forEach(({ packageId, error }) => {
      console.log(`   - ${packageId}: ${error}`);
    });
    console.log();
  }

  console.log('='.repeat(80));
  console.log('✅ Build Complete');
  console.log('='.repeat(80));

  process.exit(results.failed.length > 0 ? 1 : 0);
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { bundlePackage };

