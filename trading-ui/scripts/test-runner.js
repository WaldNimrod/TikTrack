/**
 * Test Runner for Smart Initialization System
 * רץ בדיקות מקיפות למערכת האתחול החכמה
 * 
 * This script provides comprehensive testing capabilities for the new system
 * הסקריפט מספק יכולות בדיקה מקיפות למערכת החדשה
 */

class TestRunner {
    constructor() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            warnings: 0,
            startTime: null,
            endTime: null,
            details: []
        };
    }

    /**
     * Run all tests
     * הרצת כל הבדיקות
     */
    async runAllTests() {
        window.Logger?.info('🧪 Starting comprehensive testing of Smart Initialization System...');
        this.results.startTime = Date.now();
        
        try {
            // Test 1: System Components Availability
            await this.testSystemComponents();
            
            // Test 2: Package Registry
            await this.testPackageRegistry();
            
            // Test 3: Dependency Graph
            await this.testDependencyGraph();
            
            // Test 4: Page Templates
            await this.testPageTemplates();
            
            // Test 5: Smart App Initializer
            await this.testSmartAppInitializer();
            
            // Test 6: Smart Script Loader
            await this.testSmartScriptLoader();
            
            // Test 7: Smart Page Configs
            await this.testSmartPageConfigs();
            
            // Test 8: Performance Optimizer
            await this.testPerformanceOptimizer();
            
            // Test 9: Advanced Cache System
            await this.testAdvancedCacheSystem();
            
            // Test 10: Testing System
            await this.testTestingSystem();
            
            // Test 11: Validator
            await this.testValidator();
            
            // Test 12: CLI
            await this.testCLI();
            
            // Test 13: System Management Integration
            await this.testSystemManagementIntegration();
            
            // Test 14: Backward Compatibility
            await this.testBackwardCompatibility();
            
            this.results.endTime = Date.now();
            this.generateReport();
            
        } catch (error) {
            window.Logger?.error('❌ Test execution failed:', error);
            this.addResult('Test Execution', false, `Failed to execute tests: ${error.message}`);
        }
        
        return this.results;
    }

    /**
     * Test system components availability
     * בדיקת זמינות רכיבי המערכת
     */
    async testSystemComponents() {
        const components = [
            'SYSTEM_PACKAGES',
            'SYSTEM_DEPENDENCIES', 
            'PAGE_TEMPLATES',
            'SmartAppInitializer',
            'SmartScriptLoader',
            'SmartPageConfigs',
            'InitPerformanceOptimizer',
            'InitAdvancedCache',
            'InitTestingSystem',
            'InitValidator',
            'InitCLI'
        ];

        for (const component of components) {
            const exists = typeof window[component] !== 'undefined';
            this.addResult(`Component: ${component}`, exists, exists ? 'Available' : 'Missing');
        }
    }

    /**
     * Test Package Registry
     * בדיקת Package Registry
     */
    async testPackageRegistry() {
        try {
            if (typeof window.SYSTEM_PACKAGES === 'undefined') {
                this.addResult('Package Registry', false, 'SYSTEM_PACKAGES not defined');
                return;
            }

            const packages = window.SYSTEM_PACKAGES;
            const expectedPackages = ['base', 'crud', 'filters', 'graphs', 'monitoring', 'alerts', 'external', 'ui', 'preferences', 'files'];
            
            for (const packageName of expectedPackages) {
                const exists = packages[packageName] && packages[packageName].systems;
                this.addResult(`Package: ${packageName}`, exists, exists ? `Contains ${packages[packageName].systems.length} systems` : 'Missing');
            }

            // Test package structure
            const basePackage = packages.base;
            if (basePackage) {
                const hasSystems = Array.isArray(basePackage.systems);
                const hasDependencies = Array.isArray(basePackage.dependencies);
                const hasDescription = typeof basePackage.description === 'string';
                
                this.addResult('Base Package Structure', hasSystems && hasDependencies && hasDescription, 
                    `Systems: ${hasSystems}, Dependencies: ${hasDependencies}, Description: ${hasDescription}`);
            }

        } catch (error) {
            this.addResult('Package Registry', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test Dependency Graph
     * בדיקת Dependency Graph
     */
    async testDependencyGraph() {
        try {
            if (typeof window.SYSTEM_DEPENDENCIES === 'undefined') {
                this.addResult('Dependency Graph', false, 'SYSTEM_DEPENDENCIES not defined');
                return;
            }

            const dependencies = window.SYSTEM_DEPENDENCIES;
            const expectedSystems = ['notification', 'preferences', 'storage', 'cache', 'ui-utils', 'header', 'translation'];
            
            for (const system of expectedSystems) {
                const exists = dependencies[system];
                this.addResult(`Dependency: ${system}`, exists, exists ? `Dependencies: ${dependencies[system].dependencies?.length || 0}` : 'Missing');
            }

            // Test dependency structure
            const notificationDep = dependencies.notification;
            if (notificationDep) {
                const hasDependencies = Array.isArray(notificationDep.dependencies);
                const hasCriticality = typeof notificationDep.criticality === 'string';
                const hasFallback = typeof notificationDep.fallback === 'function';
                
                this.addResult('Dependency Structure', hasDependencies && hasCriticality, 
                    `Dependencies: ${hasDependencies}, Criticality: ${hasCriticality}, Fallback: ${hasFallback}`);

            }

        } catch (error) {
            this.addResult('Dependency Graph', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test Page Templates
     * בדיקת Page Templates
     */
    async testPageTemplates() {
        try {
            if (typeof window.PAGE_TEMPLATES === 'undefined') {
                this.addResult('Page Templates', false, 'PAGE_TEMPLATES not defined');
                return;
            }

            const templates = window.PAGE_TEMPLATES;
            const expectedTemplates = ['dashboard', 'crud', 'preferences', 'monitoring', 'simple'];
            
            for (const template of expectedTemplates) {
                const exists = templates[template];
                this.addResult(`Template: ${template}`, exists, exists ? `Packages: ${templates[template].packages?.length || 0}` : 'Missing');
            }

        } catch (error) {
            this.addResult('Page Templates', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test Smart App Initializer
     * בדיקת Smart App Initializer
     */
    async testSmartAppInitializer() {
        try {
            if (typeof window.SmartAppInitializer === 'undefined') {
                this.addResult('Smart App Initializer', false, 'SmartAppInitializer not defined');
                return;
            }

            const initializer = window.SmartAppInitializer;
            const hasInitialize = typeof initializer.initialize === 'function';
            const hasGetStatus = typeof initializer.getStatus === 'function';
            const hasGetMetrics = typeof initializer.getMetrics === 'function';
            
            this.addResult('Smart App Initializer Methods', hasInitialize && hasGetStatus && hasGetMetrics, 
                `Initialize: ${hasInitialize}, GetStatus: ${hasGetStatus}, GetMetrics: ${hasGetMetrics}`);

        } catch (error) {
            this.addResult('Smart App Initializer', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test Smart Script Loader
     * בדיקת Smart Script Loader
     */
    async testSmartScriptLoader() {
        try {
            if (typeof window.SmartScriptLoader === 'undefined') {
                this.addResult('Smart Script Loader', false, 'SmartScriptLoader not defined');
                return;
            }

            const loader = window.SmartScriptLoader;
            const hasLoadScript = typeof loader.loadScript === 'function';
            const hasLoadScripts = typeof loader.loadScripts === 'function';
            const hasGetStatus = typeof loader.getStatus === 'function';
            
            this.addResult('Smart Script Loader Methods', hasLoadScript && hasLoadScripts && hasGetStatus, 
                `LoadScript: ${hasLoadScript}, LoadScripts: ${hasLoadScripts}, GetStatus: ${hasGetStatus}`);

        } catch (error) {
            this.addResult('Smart Script Loader', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test Smart Page Configs
     * בדיקת Smart Page Configs
     */
    async testSmartPageConfigs() {
        try {
            if (typeof window.SmartPageConfigs === 'undefined') {
                this.addResult('Smart Page Configs', false, 'SmartPageConfigs not defined');
                return;
            }

            const configs = window.SmartPageConfigs;
            const hasGetConfig = typeof configs.getConfig === 'function';
            const hasValidateConfig = typeof configs.validateConfig === 'function';
            const hasGetTemplate = typeof configs.getTemplate === 'function';
            
            this.addResult('Smart Page Configs Methods', hasGetConfig && hasValidateConfig && hasGetTemplate, 
                `GetConfig: ${hasGetConfig}, ValidateConfig: ${hasValidateConfig}, GetTemplate: ${hasGetTemplate}`);

        } catch (error) {
            this.addResult('Smart Page Configs', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test Performance Optimizer
     * בדיקת Performance Optimizer
     */
    async testPerformanceOptimizer() {
        try {
            if (typeof window.InitPerformanceOptimizer === 'undefined') {
                this.addResult('Performance Optimizer', false, 'InitPerformanceOptimizer not defined');
                return;
            }

            const optimizer = window.InitPerformanceOptimizer;
            const hasStartMonitoring = typeof optimizer.startMonitoring === 'function';
            const hasStopMonitoring = typeof optimizer.stopMonitoring === 'function';
            const hasGetMetrics = typeof optimizer.getMetrics === 'function';
            
            this.addResult('Performance Optimizer Methods', hasStartMonitoring && hasStopMonitoring && hasGetMetrics, 
                `StartMonitoring: ${hasStartMonitoring}, StopMonitoring: ${hasStopMonitoring}, GetMetrics: ${hasGetMetrics}`);

        } catch (error) {
            this.addResult('Performance Optimizer', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test Advanced Cache System
     * בדיקת Advanced Cache System
     */
    async testAdvancedCacheSystem() {
        try {
            if (typeof window.InitAdvancedCache === 'undefined') {
                this.addResult('Advanced Cache System', false, 'InitAdvancedCache not defined');
                return;
            }

            const cache = window.InitAdvancedCache;
            const hasGetCachedScript = typeof cache.getCachedScript === 'function';
            const hasCacheScript = typeof cache.cacheScript === 'function';
            const hasGetStats = typeof cache.getStats === 'function';
            
            this.addResult('Advanced Cache System Methods', hasGetCachedScript && hasCacheScript && hasGetStats, 
                `GetCachedScript: ${hasGetCachedScript}, CacheScript: ${hasCacheScript}, GetStats: ${hasGetStats}`);

        } catch (error) {
            this.addResult('Advanced Cache System', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test Testing System
     * בדיקת Testing System
     */
    async testTestingSystem() {
        try {
            if (typeof window.InitTestingSystem === 'undefined') {
                this.addResult('Testing System', false, 'InitTestingSystem not defined');
                return;
            }

            const testing = window.InitTestingSystem;
            const hasRunAllTests = typeof testing.runAllTests === 'function';
            const hasRunSystemTests = typeof testing.runSystemTests === 'function';
            const hasGetTestResults = typeof testing.getTestResults === 'function';
            
            this.addResult('Testing System Methods', hasRunAllTests && hasRunSystemTests && hasGetTestResults, 
                `RunAllTests: ${hasRunAllTests}, RunSystemTests: ${hasRunSystemTests}, GetTestResults: ${hasGetTestResults}`);

        } catch (error) {
            this.addResult('Testing System', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test Validator
     * בדיקת Validator
     */
    async testValidator() {
        try {
            if (typeof window.InitValidator === 'undefined') {
                this.addResult('Validator', false, 'InitValidator not defined');
                return;
            }

            const validator = window.InitValidator;
            const hasValidatePageConfig = typeof validator.validatePageConfig === 'function';
            const hasValidateDependencies = typeof validator.validateDependencies === 'function';
            const hasValidateSystem = typeof validator.validateSystem === 'function';
            
            this.addResult('Validator Methods', hasValidatePageConfig && hasValidateDependencies && hasValidateSystem, 
                `ValidatePageConfig: ${hasValidatePageConfig}, ValidateDependencies: ${hasValidateDependencies}, ValidateSystem: ${hasValidateSystem}`);

        } catch (error) {
            this.addResult('Validator', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test CLI
     * בדיקת CLI
     */
    async testCLI() {
        try {
            if (typeof window.InitCLI === 'undefined') {
                this.addResult('CLI', false, 'InitCLI not defined');
                return;
            }

            const cli = window.InitCLI;
            const hasExecute = typeof cli.execute === 'function';
            const hasGetHelp = typeof cli.getHelp === 'function';
            const hasGetStatus = typeof cli.getStatus === 'function';
            
            this.addResult('CLI Methods', hasExecute && hasGetHelp && hasGetStatus, 
                `Execute: ${hasExecute}, GetHelp: ${hasGetHelp}, GetStatus: ${hasGetStatus}`);

        } catch (error) {
            this.addResult('CLI', false, `Error: ${error.message}`);
        }
    }


    /**
     * Test System Management Integration
     * בדיקת System Management Integration
     */
    async testSystemManagementIntegration() {
        try {
            // Test if system management functions are available
            const functions = [
                'updateTestingSystemStatus',
                'runComprehensiveTesting', 
                'validateTestingSystem',
                'refreshInitializationData',
                'updateOptimizationProgress'
            ];

            for (const func of functions) {
                const exists = typeof window[func] === 'function';
                this.addResult(`System Management: ${func}`, exists, exists ? 'Available' : 'Missing');
            }

        } catch (error) {
            this.addResult('System Management Integration', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test Backward Compatibility
     * בדיקת תאימות לאחור
     */
    async testBackwardCompatibility() {
        try {
            // Test if old system components still exist
            const oldComponents = [
                'UnifiedAppInitializer',
                'pageInitializationConfigs'
            ];

            for (const component of oldComponents) {
                const exists = typeof window[component] !== 'undefined';
                this.addResult(`Backward Compatibility: ${component}`, exists, exists ? 'Available' : 'Missing');
            }

            // Test if old pages still work
            const oldPages = [
                'preferences.html',
                'trades.html',
                'alerts.html', 
                'index.html'
            ];

            for (const page of oldPages) {
                try {
                    const response = await fetch(page);
                    const exists = response.ok;
                    this.addResult(`Old Page: ${page}`, exists, exists ? 'Available' : 'Not found');
                } catch (error) {
                    this.addResult(`Old Page: ${page}`, false, `Error: ${error.message}`);
                }
            }

        } catch (error) {
            this.addResult('Backward Compatibility', false, `Error: ${error.message}`);
        }
    }

    /**
     * Add test result
     * הוספת תוצאת בדיקה
     */
    addResult(testName, passed, message) {
        this.results.total++;
        if (passed) {
            this.results.passed++;
        } else {
            this.results.failed++;
        }
        
        this.results.details.push({
            test: testName,
            passed: passed,
            message: message,
            timestamp: new Date().toISOString()
        });

        const status = passed ? '✅' : '❌';
        window.Logger?.info(`${status} ${testName}: ${message}`);
    }

    /**
     * Generate test report
     * יצירת דוח בדיקות
     */
    generateReport() {
        const duration = this.results.endTime - this.results.startTime;
        const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
        
        window.Logger?.info('\n📊 TEST REPORT');
        window.Logger?.info('================');
        window.Logger?.info(`Total Tests: ${this.results.total}`);
        window.Logger?.info(`Passed: ${this.results.passed} ✅`);
        window.Logger?.info(`Failed: ${this.results.failed} ❌`);
        window.Logger?.info(`Success Rate: ${successRate}%`);
        window.Logger?.info(`Duration: ${duration}ms`);
        
        if (this.results.failed > 0) {
            window.Logger?.info('\n❌ FAILED TESTS:');
            this.results.details
                .filter(detail => !detail.passed)
                .forEach(detail => {
                    window.Logger?.info(`  - ${detail.test}: ${detail.message}`);
                });
        }
        
        window.Logger?.info('\n🎯 RECOMMENDATIONS:');
        if (successRate >= 90) {
            window.Logger?.info('  ✅ System is ready for production!');
        } else if (successRate >= 70) {
            window.Logger?.info('  ⚠️  System needs minor fixes before production');
        } else {
            window.Logger?.info('  ❌ System needs significant fixes before production');
        }
        
        return this.results;
    }
}

// Export for global use
window.TestRunner = TestRunner;

// Auto-run if called directly
if (typeof window !== 'undefined' && window.location) {
    // Only auto-run on system management page
    if (
        window.location.pathname.includes('system-management') ||
        window.location.pathname.includes('system_management')
    ) {
        window.Logger?.info('🚀 Auto-starting comprehensive tests...');
        const testRunner = new TestRunner();
        testRunner.runAllTests().then(results => {
            window.Logger?.info('🏁 Testing completed!', results);
        });
    }
}
