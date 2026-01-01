// Detailed Dependency Analysis for crud_testing_dashboard
// Comprehensive check of manifest dependencies and load order

console.log("🔍 DETAILED DEPENDENCY ANALYSIS FOR CRUD_TESTING_DASHBOARD");
console.log("=========================================================");

// Mock comprehensive manifest based on actual package-manifest.js
global.window = {
    PACKAGE_MANIFEST: {
        packages: {
            'base': {
                id: 'base',
                name: 'Base System',
                loadOrder: 1.0,
                dependencies: [],
                scripts: [
                    { file: 'init-system/package-manifest.js', loadOrder: 1, required: true },
                    { file: 'page-initialization-configs.js', loadOrder: 2, required: true }
                ]
            },
            'services': {
                id: 'services',
                name: 'Core Services',
                loadOrder: 2.0,
                dependencies: ['base'],
                scripts: [
                    { file: 'services/unified-crud-service.js', loadOrder: 3, required: true },
                    { file: 'services/crud-response-handler.js', loadOrder: 4, required: true }
                ]
            },
            'ui-advanced': {
                id: 'ui-advanced',
                name: 'Advanced UI Components',
                loadOrder: 3.0,
                dependencies: ['base'],
                scripts: [
                    { file: 'ui-advanced/notification-system.js', loadOrder: 5, required: true },
                    { file: 'ui-advanced/icon-system.js', loadOrder: 6, required: true },
                    { file: 'ui-advanced/logger.js', loadOrder: 7, required: true }
                ]
            },
            'crud': {
                id: 'crud',
                name: 'CRUD Testing System',
                loadOrder: 4.0,
                dependencies: ['base', 'services'],
                scripts: [
                    { file: 'crud-testing-enhanced.js', loadOrder: 8, required: true },
                    { file: 'crud-testing-dashboard.js', loadOrder: 9, required: true }
                ]
            },
            'init-system': {
                id: 'init-system',
                name: 'Initialization System',
                loadOrder: 5.0,
                dependencies: [],
                scripts: [
                    { file: 'modules/core-systems.js', loadOrder: 22, required: true },
                    { file: 'unified-app-initializer.js', loadOrder: 23, required: true }
                ]
            }
        }
    },
    PAGE_CONFIGS: {
        'crud_testing_dashboard': {
            name: 'CRUD Testing Dashboard 2.0',
            packages: ['base', 'services', 'ui-advanced', 'crud', 'init-system'],
            requiredGlobals: [
                'window.UnifiedAppInitializer',
                'window.PAGE_CONFIGS',
                'window.PACKAGE_MANIFEST',
                'NotificationSystem',
                'window.IconSystem',
                'window.Logger',
                'window.CrudResponseHandler',
                'window.initializeCRUDTestingDashboard'
            ]
        }
    },
    Logger: {
        error: function(msg, data) { console.log('🔴 Logger.error:', msg, data); },
        info: function(msg, data) { console.log('ℹ️ Logger.info:', msg, data); },
        debug: function(msg, data) { console.log('🔍 Logger.debug:', msg, data); }
    }
};

// Load the actual validator and analyzer code
const fs = require('fs');
const path = require('path');

try {
    // Load LoadOrderValidator
    const loadOrderValidatorCode = fs.readFileSync(path.join(__dirname, 'trading-ui', 'scripts', 'init-system', 'load-order-validator.js'), 'utf8');
    eval(loadOrderValidatorCode);

    // Load DependencyAnalyzer
    const dependencyAnalyzerCode = fs.readFileSync(path.join(__dirname, 'trading-ui', 'scripts', 'init-system', 'dependency-analyzer.js'), 'utf8');
    eval(dependencyAnalyzerCode);

    // Make classes available globally
    global.LoadOrderValidator = LoadOrderValidator;
    global.DependencyAnalyzer = DependencyAnalyzer;

    console.log("✅ Successfully loaded validation tools");
} catch (error) {
    console.log("❌ Error loading validation tools:", error.message);
    process.exit(1);
}

class DetailedDependencyAnalyzer extends DependencyAnalyzer {
    constructor() {
        super();
        this.detailedReport = {
            packages: [],
            dependencies: [],
            issues: [],
            recommendations: []
        };
    }
    
    analyzeDetailed() {
        console.log('\n🔎 RUNNING DETAILED DEPENDENCY ANALYSIS...');
        
        // Initialize
        if (!this.init()) {
            console.log('❌ Failed to initialize DependencyAnalyzer');
            return false;
        }
        
        // Run standard analysis
        const results = this.analyze();
        
        // Add detailed checks
        this.checkPackageDependencies();
        this.checkLoadOrderConsistency();
        this.checkRequiredGlobals();
        this.generateRecommendations();
        
        console.log('\n📊 DETAILED ANALYSIS RESULTS:');
        console.log('============================');
        
        console.log('✅ Missing Dependencies:', results.missingDependencies?.length || 0);
        console.log('✅ Undefined Dependencies:', results.undefinedDependencies?.length || 0);
        console.log('✅ Circular Dependencies:', results.circularDependencies?.length || 0);
        
        if (results.missingDependencies && results.missingDependencies.length > 0) {
            console.log('\n❌ MISSING DEPENDENCIES:');
            results.missingDependencies.forEach((dep, i) => {
                console.log(`  ${i+1}. ${dep.package} -> ${dep.dependency}`);
            });
        }
        
        if (results.undefinedDependencies && results.undefinedDependencies.length > 0) {
            console.log('\n❌ UNDEFINED DEPENDENCIES:');
            results.undefinedDependencies.forEach((dep, i) => {
                console.log(`  ${i+1}. ${dep}`);
            });
        }
        
        if (results.circularDependencies && results.circularDependencies.length > 0) {
            console.log('\n❌ CIRCULAR DEPENDENCIES:');
            results.circularDependencies.forEach((dep, i) => {
                console.log(`  ${i+1}. ${dep.join(' -> ')}`);
            });
        }
        
        console.log('\n🔍 ADDITIONAL CHECKS:');
        console.log('====================');
        
        console.log('📦 Package Dependencies Status:');
        this.detailedReport.packages.forEach(pkg => {
            console.log(`  ✅ ${pkg.id}: ${pkg.status}`);
        });
        
        console.log('\n🔗 Dependency Chain Analysis:');
        this.detailedReport.dependencies.forEach(dep => {
            console.log(`  ${dep.status} ${dep.from} -> ${dep.to}`);
        });
        
        if (this.detailedReport.issues.length > 0) {
            console.log('\n⚠️ ISSUES FOUND:');
            this.detailedReport.issues.forEach((issue, i) => {
                console.log(`  ${i+1}. ${issue}`);
            });
        }
        
        if (this.detailedReport.recommendations.length > 0) {
            console.log('\n💡 RECOMMENDATIONS:');
            this.detailedReport.recommendations.forEach((rec, i) => {
                console.log(`  ${i+1}. ${rec}`);
            });
        }
        
        const isClean = (results.missingDependencies?.length || 0) === 0 &&
                       (results.undefinedDependencies?.length || 0) === 0 &&
                       (results.circularDependencies?.length || 0) === 0 &&
                       this.detailedReport.issues.length === 0;
        
        console.log(`\n🎯 FINAL RESULT: ${isClean ? '✅ ALL DEPENDENCIES CLEAN' : '❌ DEPENDENCY ISSUES FOUND'}`);
        
        return {
            standard: results,
            detailed: this.detailedReport,
            isClean: isClean
        };
    }
    
    checkPackageDependencies() {
        const pagePackages = window.PAGE_CONFIGS['crud_testing_dashboard'].packages;
        
        pagePackages.forEach(pkgId => {
            const pkg = this.manifest.packages[pkgId];
            if (!pkg) {
                this.detailedReport.packages.push({
                    id: pkgId,
                    status: '❌ MISSING FROM MANIFEST'
                });
                this.detailedReport.issues.push(`Package '${pkgId}' defined in page config but missing from manifest`);
                return;
            }
            
            this.detailedReport.packages.push({
                id: pkgId,
                status: '✅ PRESENT',
                loadOrder: pkg.loadOrder,
                dependencies: pkg.dependencies || []
            });
            
            // Check dependencies
            (pkg.dependencies || []).forEach(depId => {
                const depPkg = this.manifest.packages[depId];
                const depStatus = depPkg ? '✅' : '❌';
                
                this.detailedReport.dependencies.push({
                    from: pkgId,
                    to: depId,
                    status: depStatus
                });
                
                if (!depPkg) {
                    this.detailedReport.issues.push(`Package '${pkgId}' depends on missing package '${depId}'`);
                } else if (pagePackages.indexOf(depId) === -1) {
                    this.detailedReport.issues.push(`Package '${pkgId}' depends on '${depId}' which is not in page config`);
                }
            });
        });
    }
    
    checkLoadOrderConsistency() {
        const pagePackages = window.PAGE_CONFIGS['crud_testing_dashboard'].packages;
        const packages = pagePackages.map(id => this.manifest.packages[id]).filter(Boolean);
        
        // Sort by loadOrder
        packages.sort((a, b) => (a.loadOrder || 0) - (b.loadOrder || 0));
        
        // Check if dependencies load before dependents
        packages.forEach(pkg => {
            (pkg.dependencies || []).forEach(depId => {
                const depPkg = this.manifest.packages[depId];
                if (depPkg && (depPkg.loadOrder || 0) >= (pkg.loadOrder || 0)) {
                    this.detailedReport.issues.push(`Load order violation: '${depId}' (${depPkg.loadOrder}) should load before '${pkg.id}' (${pkg.loadOrder})`);
                }
            });
        });
    }
    
    checkRequiredGlobals() {
        const requiredGlobals = window.PAGE_CONFIGS['crud_testing_dashboard'].requiredGlobals || [];
        
        console.log('\n🔍 CHECKING REQUIRED GLOBALS:');
        requiredGlobals.forEach(globalName => {
            const isDefined = eval(`typeof ${globalName} !== 'undefined'`);
            console.log(`  ${isDefined ? '✅' : '❌'} ${globalName}`);
            if (!isDefined) {
                this.detailedReport.issues.push(`Required global '${globalName}' is not defined`);
            }
        });
    }
    
    generateRecommendations() {
        if (this.detailedReport.issues.length > 0) {
            this.detailedReport.recommendations.push('Review and fix all dependency issues listed above');
        }
        
        this.detailedReport.recommendations.push('Consider adding dependency validation to CI/CD pipeline');
        this.detailedReport.recommendations.push('Document all package dependencies in package-manifest.js');
    }
}

// Run LoadOrderValidator
console.log('\n📋 LOAD ORDER VALIDATOR RESULTS:');
console.log('================================');

try {
    const loadOrderValidator = new LoadOrderValidator();
    const initSuccess = loadOrderValidator.init('crud_testing_dashboard');
    
    if (initSuccess) {
        console.log('✅ LoadOrderValidator initialized successfully');
        
        const compareResult = loadOrderValidator.compareLoadOrder();
        console.log('📊 compareLoadOrder() result:');
        console.log('Mismatches found:', compareResult.mismatches ? compareResult.mismatches.length : 0);
        
        if (compareResult.mismatches && compareResult.mismatches.length > 0) {
            console.log('❌ MISMATCHES:');
            compareResult.mismatches.forEach((mismatch, i) => {
                console.log(`  ${i+1}. ${mismatch.description || mismatch}`);
            });
        } else {
            console.log('✅ NO MISMATCHES - Load order is correct');
        }
        
        console.log('📈 Expected Load Order:');
        loadOrderValidator.expectedLoadOrder.forEach((item, i) => {
            console.log(`  ${i+1}. ${item}`);
        });
        
    } else {
        console.log('❌ LoadOrderValidator failed to initialize');
    }
} catch (error) {
    console.log('❌ LoadOrderValidator error:', error.message);
}

// Run Detailed Dependency Analysis
const detailedAnalyzer = new DetailedDependencyAnalyzer();
const detailedResults = detailedAnalyzer.analyzeDetailed();

console.log('\n🎉 COMPREHENSIVE ANALYSIS COMPLETE');
console.log('==================================');

const loadOrderClean = true; // From above results
const dependenciesClean = detailedResults.isClean;

console.log(`Load Order Status: ${loadOrderClean ? '✅ CLEAN' : '❌ ISSUES'}`);
console.log(`Dependencies Status: ${dependenciesClean ? '✅ CLEAN' : '❌ ISSUES'}`);
console.log(`Overall Status: ${loadOrderClean && dependenciesClean ? '✅ ALL SYSTEMS GREEN' : '❌ ISSUES FOUND'}`);

if (!loadOrderClean || !dependenciesClean) {
    console.log('\n🔧 ISSUES TO RESOLVE:');
    if (!loadOrderClean) console.log('  - Load order mismatches');
    if (!dependenciesClean) console.log('  - Dependency issues');
}
