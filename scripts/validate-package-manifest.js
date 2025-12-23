#!/usr/bin/env node
/**
 * Package Manifest Validation Script
 * בודק תקינות PACKAGE_MANIFEST ומוודא שכל העמודים מוגדרים נכון
 *
 * Code Review Fix - Phase 3: ניקוי קונפיגורציה
 *
 * @version 1.0.0
 * @created December 2025
 * @author TikTrack Development Team
 */

const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_ROOT = path.join(__dirname, '..');
const TRADING_UI = path.join(PROJECT_ROOT, 'trading-ui');
const PACKAGE_MANIFEST_PATH = path.join(TRADING_UI, 'scripts', 'init-system', 'package-manifest.js');
const PAGE_CONFIGS_PATH = path.join(TRADING_UI, 'scripts', 'page-initialization-configs.js');

// All pages that should be validated
const ALL_PAGES = [
    'index', 'trades', 'trade_plans', 'alerts', 'tickers', 'ticker-dashboard',
    'trading_accounts', 'executions', 'data_import', 'cash_flows', 'notes',
    'research', 'portfolio-state-page', 'trade-history-page', 'trading-journal',
    'ai-analysis', 'watch-list', 'preferences', 'user-profile',
    'db_display', 'db_extradata', 'constraints', 'background-tasks',
    'server-monitor', 'system-management', 'notifications-center',
    'css-management', 'tradingview-test-page', 'dynamic-colors-display', 'designs',
    'external-data-dashboard', 'chart-management', 'crud-testing-dashboard',
    'register', 'forgot-password', 'reset-password',
    'button-color-mapping', 'button-color-mapping-simple', 'preferences-groups-management',
    'tag-management', 'cache-management', 'code-quality-dashboard', 'init-system-management',
    'conditions-modals', 'conditions-test', 'tradingview-widgets-showcase', 'trades_formatted'
];

/**
 * Load and parse package manifest
 */
function loadPackageManifest() {
    try {
        const manifestContent = fs.readFileSync(PACKAGE_MANIFEST_PATH, 'utf8');

        // Extract PACKAGE_MANIFEST using regex (since it's not a clean module export)
        const manifestMatch = manifestContent.match(/PACKAGE_MANIFEST\s*=\s*({[\s\S]*?});/);
        if (!manifestMatch) {
            throw new Error('Could not find PACKAGE_MANIFEST object in file');
        }

        // Use eval in a safe context
        const vm = require('vm');
        const context = { PACKAGE_MANIFEST: null };
        vm.createContext(context);
        vm.runInContext(`PACKAGE_MANIFEST = ${manifestMatch[1]};`, context);

        return context.PACKAGE_MANIFEST;
    } catch (error) {
        console.error('❌ Error loading package manifest:', error.message);
        process.exit(1);
    }
}

/**
 * Load page configurations
 */
function loadPageConfigs() {
    try {
        const configsContent = fs.readFileSync(PAGE_CONFIGS_PATH, 'utf8');

        // Extract PAGE_CONFIGS
        const vm = require('vm');
        const context = { PAGE_CONFIGS: {} };
        vm.createContext(context);
        vm.runInContext(configsContent, context);

        return context.PAGE_CONFIGS;
    } catch (error) {
        console.error('❌ Error loading page configs:', error.message);
        return {};
    }
}

/**
 * Validate package manifest structure
 */
function validatePackageManifest(manifest) {
    const errors = [];
    const warnings = [];

    if (!manifest || typeof manifest !== 'object') {
        errors.push('PACKAGE_MANIFEST is not a valid object');
        return { errors, warnings };
    }

    // Check for required packages
    const requiredPackages = ['base', 'services', 'modules', 'crud', 'preferences'];
    for (const pkg of requiredPackages) {
        if (!manifest[pkg]) {
            errors.push(`Missing required package: ${pkg}`);
        } else {
            // Validate package structure
            const packageData = manifest[pkg];
            if (!packageData.scripts || !Array.isArray(packageData.scripts)) {
                errors.push(`Package ${pkg} missing scripts array`);
            } else {
                // Check each script
                packageData.scripts.forEach((script, index) => {
                    if (!script.file) {
                        errors.push(`Package ${pkg}, script ${index}: missing 'file' property`);
                    }
                    if (script.required === false && !script.description) {
                        warnings.push(`Package ${pkg}, script ${script.file}: optional script without description`);
                    }
                });
            }
        }
    }

    // Check for duplicate script files across packages
    const allScripts = new Map();
    for (const [pkgName, pkgData] of Object.entries(manifest)) {
        if (pkgData.scripts && Array.isArray(pkgData.scripts)) {
            pkgData.scripts.forEach(script => {
                if (script.file) {
                    if (allScripts.has(script.file)) {
                        warnings.push(`Duplicate script file: ${script.file} in packages ${allScripts.get(script.file)} and ${pkgName}`);
                    } else {
                        allScripts.set(script.file, pkgName);
                    }
                }
            });
        }
    }

    return { errors, warnings };
}

/**
 * Validate page configurations
 */
function validatePageConfigs(pageConfigs) {
    const errors = [];
    const warnings = [];

    // Check that all expected pages have configurations
    for (const page of ALL_PAGES) {
        if (!pageConfigs[page]) {
            warnings.push(`Missing page config for: ${page}`);
        } else {
            const config = pageConfigs[page];
            if (!config.packages || !Array.isArray(config.packages)) {
                errors.push(`Page ${page}: missing or invalid packages array`);
            }
        }
    }

    return { errors, warnings };
}

/**
 * Validate script loading order
 */
function validateScriptLoadingOrder(manifest, pageConfigs) {
    const errors = [];
    const warnings = [];

    // Check that critical packages have defer loading strategy
    const criticalPackages = ['base', 'services', 'modules', 'crud'];
    for (const pkg of criticalPackages) {
        if (manifest[pkg] && manifest[pkg].loadingStrategy !== 'defer') {
            warnings.push(`Critical package ${pkg} should use 'defer' loading strategy, found: ${manifest[pkg].loadingStrategy || 'none'}`);
        }
    }

    // Check loadOrder consistency
    for (const [pkgName, pkgData] of Object.entries(manifest)) {
        if (typeof pkgData.loadOrder !== 'number') {
            warnings.push(`Package ${pkgName}: missing numeric loadOrder`);
        }
    }

    return { errors, warnings };
}

/**
 * Main validation function
 */
function main() {
    console.log('🚀 Package Manifest Validation');
    console.log('================================');

    // Load configurations
    console.log('📂 Loading configurations...');
    const manifest = loadPackageManifest();
    const pageConfigs = loadPageConfigs();

    console.log(`📦 Found ${Object.keys(manifest).length} packages in manifest`);
    console.log(`📄 Found ${Object.keys(pageConfigs).length} page configurations`);

    // Run validations
    const manifestValidation = validatePackageManifest(manifest);
    const pageValidation = validatePageConfigs(pageConfigs);
    const loadingValidation = validateScriptLoadingOrder(manifest, pageConfigs);

    // Collect all issues
    const allErrors = [
        ...manifestValidation.errors,
        ...pageValidation.errors,
        ...loadingValidation.errors
    ];

    const allWarnings = [
        ...manifestValidation.warnings,
        ...pageValidation.warnings,
        ...loadingValidation.warnings
    ];

    // Report results
    console.log('\n📊 Validation Results:');
    console.log(`❌ Errors: ${allErrors.length}`);
    console.log(`⚠️  Warnings: ${allWarnings.length}`);

    if (allErrors.length > 0) {
        console.log('\n❌ ERRORS:');
        allErrors.forEach(error => console.log(`   - ${error}`));
    }

    if (allWarnings.length > 0) {
        console.log('\n⚠️  WARNINGS:');
        allWarnings.forEach(warning => console.log(`   - ${warning}`));
    }

    // Exit with appropriate code
    if (allErrors.length > 0) {
        console.log('\n❌ Validation FAILED - fix errors before proceeding');
        process.exit(1);
    } else if (allWarnings.length > 0) {
        console.log('\n⚠️  Validation PASSED with warnings - review warnings');
        process.exit(0);
    } else {
        console.log('\n✅ Validation PASSED - all configurations are valid');
        process.exit(0);
    }
}

// Run validation
if (require.main === module) {
    main();
}

module.exports = {
    loadPackageManifest,
    loadPageConfigs,
    validatePackageManifest,
    validatePageConfigs,
    validateScriptLoadingOrder
};
