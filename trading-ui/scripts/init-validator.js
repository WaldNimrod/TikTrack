/**
 * Smart Initialization System Validator
 * ====================================
 * 
 * Comprehensive validation tool for the Smart Initialization System
 * Provides validation for configurations, dependencies, and system health
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @lastUpdated October 19, 2025
 */

(function() {
    'use strict';

    /**
     * Smart Initialization System Validator
     * כלי ולידציה מקיף למערכת האתחול החכמה
     */
    class InitValidator {
        constructor() {
            this.validationResults = {
                timestamp: new Date().toISOString(),
                overallStatus: 'unknown',
                totalChecks: 0,
                passedChecks: 0,
                failedChecks: 0,
                warnings: 0,
                checks: []
            };
            
            this.validationRules = {
                pageConfigs: {
                    required: ['template', 'packages', 'systems'],
                    optional: ['customInitializers', 'lazyLoad', 'performance', 'metadata'],
                    templates: ['standard', 'dashboard', 'simple', 'complex', 'testing'],
                    packages: ['base', 'ui', 'crud', 'monitoring', 'testing'],
                    systems: ['notification', 'preferences', 'storage', 'cache', 'ui-utils', 'header', 'translation', 'favicon', 'section-state', 'modal', 'confirm', 'page-state', 'tables', 'forms', 'charts', 'date-picker', 'file-upload', 'drag-drop', 'api-client', 'data-validation', 'error-handling', 'logging', 'performance-monitor', 'system-health', 'test-runner', 'mock-data', 'validation-tools']
                },
                systemDependencies: {
                    required: ['dependencies', 'criticality'],
                    optional: ['fallback'],
                    criticalityLevels: ['high', 'medium', 'low']
                },
                systemPackages: {
                    required: ['name', 'description', 'systems'],
                    optional: ['dependencies', 'criticality', 'version'],
                    criticalityLevels: ['high', 'medium', 'low']
                }
            };
        }

        /**
         * Run comprehensive validation
         * הרצת ולידציה מקיפה
         */
        async runComprehensiveValidation() {
            console.log('🔍 Starting comprehensive validation...');
            
            try {
                // Reset validation results
                this.resetValidationResults();
                
                // Run all validation checks
                await this.validateSystemAvailability();
                await this.validatePageConfigurations();
                await this.validateSystemDependencies();
                await this.validateSystemPackages();
                await this.validatePageTemplates();
                await this.validateCircularDependencies();
                await this.validatePerformanceConfiguration();
                await this.validateTestingSystem();
                
                // Calculate overall status
                this.calculateOverallStatus();
                
                // Generate validation report
                const report = this.generateValidationReport();
                
                console.log('✅ Comprehensive validation completed');
                return report;
                
            } catch (error) {
                console.error('❌ Validation failed:', error);
                this.addCheck('validation-error', 'error', 'Validation process failed', error.message);
                return this.generateValidationReport();
            }
        }

        /**
         * Reset validation results
         * איפוס תוצאות ולידציה
         */
        resetValidationResults() {
            this.validationResults = {
                timestamp: new Date().toISOString(),
                overallStatus: 'unknown',
                totalChecks: 0,
                passedChecks: 0,
                failedChecks: 0,
                warnings: 0,
                checks: []
            };
        }

        /**
         * Validate system availability
         * ולידציה של זמינות המערכת
         */
        async validateSystemAvailability() {
            console.log('🔍 Validating system availability...');
            
            const requiredSystems = [
                { name: 'SmartPageConfigs', object: window.SmartPageConfigs },
                { name: 'SYSTEM_PACKAGES', object: window.SYSTEM_PACKAGES },
                { name: 'SYSTEM_DEPENDENCIES', object: window.SYSTEM_DEPENDENCIES },
                { name: 'PAGE_TEMPLATES', object: window.PAGE_TEMPLATES },
                { name: 'InitializationFeedback', object: window.InitializationFeedback },
                { name: 'SmartAppInitializer', object: window.SmartAppInitializer },
                { name: 'SmartScriptLoader', object: window.SmartScriptLoader },
                { name: 'InitPerformanceOptimizer', object: window.InitPerformanceOptimizer },
                { name: 'InitAdvancedCache', object: window.InitAdvancedCache },
                { name: 'InitTestingSystem', object: window.InitTestingSystem }
            ];
            
            for (const system of requiredSystems) {
                if (system.object) {
                    this.addCheck('system-availability', 'success', `${system.name} is available`, 'System loaded successfully');
                } else {
                    this.addCheck('system-availability', 'error', `${system.name} is not available`, 'System not loaded or not found');
                }
            }
        }

        /**
         * Validate page configurations
         * ולידציה של קונפיגורציות עמודים
         */
        async validatePageConfigurations() {
            console.log('🔍 Validating page configurations...');
            
            if (!window.SmartPageConfigs) {
                this.addCheck('page-configs', 'error', 'SmartPageConfigs not available', 'Cannot validate page configurations');
                return;
            }
            
            const allConfigs = window.SmartPageConfigs.getAllPageConfigs();
            
            if (!allConfigs || Object.keys(allConfigs).length === 0) {
                this.addCheck('page-configs', 'warning', 'No page configurations found', 'No page configurations defined');
                return;
            }
            
            for (const [pageName, config] of Object.entries(allConfigs)) {
                this.validatePageConfig(pageName, config);
            }
        }

        /**
         * Validate individual page configuration
         * ולידציה של קונפיגורציית עמוד בודד
         */
        validatePageConfig(pageName, config) {
            const rules = this.validationRules.pageConfigs;
            
            // Check required fields
            for (const field of rules.required) {
                if (!config[field]) {
                    this.addCheck('page-config', 'error', `Page ${pageName} missing required field: ${field}`, `Required field ${field} is missing`);
                } else {
                    this.addCheck('page-config', 'success', `Page ${pageName} has required field: ${field}`, `Field ${field} is present`);
                }
            }
            
            // Validate template
            if (config.template) {
                if (rules.templates.includes(config.template)) {
                    this.addCheck('page-config', 'success', `Page ${pageName} has valid template: ${config.template}`, 'Template is valid');
                } else {
                    this.addCheck('page-config', 'error', `Page ${pageName} has invalid template: ${config.template}`, `Template must be one of: ${rules.templates.join(', ')}`);
                }
            }
            
            // Validate packages
            if (config.packages && Array.isArray(config.packages)) {
                for (const packageName of config.packages) {
                    if (rules.packages.includes(packageName)) {
                        this.addCheck('page-config', 'success', `Page ${pageName} has valid package: ${packageName}`, 'Package is valid');
                    } else {
                        this.addCheck('page-config', 'warning', `Page ${pageName} has unknown package: ${packageName}`, 'Package not in standard list');
                    }
                }
            }
            
            // Validate systems
            if (config.systems && Array.isArray(config.systems)) {
                for (const systemName of config.systems) {
                    if (rules.systems.includes(systemName)) {
                        this.addCheck('page-config', 'success', `Page ${pageName} has valid system: ${systemName}`, 'System is valid');
                    } else {
                        this.addCheck('page-config', 'warning', `Page ${pageName} has unknown system: ${systemName}`, 'System not in standard list');
                    }
                }
            }
        }

        /**
         * Validate system dependencies
         * ולידציה של תלויות מערכת
         */
        async validateSystemDependencies() {
            console.log('🔍 Validating system dependencies...');
            
            if (!window.SYSTEM_DEPENDENCIES) {
                this.addCheck('system-dependencies', 'error', 'SYSTEM_DEPENDENCIES not available', 'Cannot validate system dependencies');
                return;
            }
            
            const dependencies = window.SYSTEM_DEPENDENCIES;
            
            if (!dependencies || Object.keys(dependencies).length === 0) {
                this.addCheck('system-dependencies', 'warning', 'No system dependencies found', 'No system dependencies defined');
                return;
            }
            
            for (const [systemName, dependency] of Object.entries(dependencies)) {
                this.validateSystemDependency(systemName, dependency);
            }
        }

        /**
         * Validate individual system dependency
         * ולידציה של תלות מערכת בודדת
         */
        validateSystemDependency(systemName, dependency) {
            const rules = this.validationRules.systemDependencies;
            
            // Check required fields
            for (const field of rules.required) {
                if (!dependency[field]) {
                    this.addCheck('system-dependency', 'error', `System ${systemName} missing required field: ${field}`, `Required field ${field} is missing`);
                } else {
                    this.addCheck('system-dependency', 'success', `System ${systemName} has required field: ${field}`, `Field ${field} is present`);
                }
            }
            
            // Validate criticality
            if (dependency.criticality) {
                if (rules.criticalityLevels.includes(dependency.criticality)) {
                    this.addCheck('system-dependency', 'success', `System ${systemName} has valid criticality: ${dependency.criticality}`, 'Criticality is valid');
                } else {
                    this.addCheck('system-dependency', 'error', `System ${systemName} has invalid criticality: ${dependency.criticality}`, `Criticality must be one of: ${rules.criticalityLevels.join(', ')}`);
                }
            }
            
            // Validate dependencies array
            if (dependency.dependencies && Array.isArray(dependency.dependencies)) {
                for (const dep of dependency.dependencies) {
                    if (window.SYSTEM_DEPENDENCIES[dep]) {
                        this.addCheck('system-dependency', 'success', `System ${systemName} has valid dependency: ${dep}`, 'Dependency is defined');
                    } else {
                        this.addCheck('system-dependency', 'error', `System ${systemName} has undefined dependency: ${dep}`, 'Dependency is not defined');
                    }
                }
            }
        }

        /**
         * Validate system packages
         * ולידציה של חבילות מערכת
         */
        async validateSystemPackages() {
            console.log('🔍 Validating system packages...');
            
            if (!window.SYSTEM_PACKAGES) {
                this.addCheck('system-packages', 'error', 'SYSTEM_PACKAGES not available', 'Cannot validate system packages');
                return;
            }
            
            const packages = window.SYSTEM_PACKAGES;
            
            if (!packages || Object.keys(packages).length === 0) {
                this.addCheck('system-packages', 'warning', 'No system packages found', 'No system packages defined');
                return;
            }
            
            for (const [packageName, packageInfo] of Object.entries(packages)) {
                this.validateSystemPackage(packageName, packageInfo);
            }
        }

        /**
         * Validate individual system package
         * ולידציה של חבילת מערכת בודדת
         */
        validateSystemPackage(packageName, packageInfo) {
            const rules = this.validationRules.systemPackages;
            
            // Check required fields
            for (const field of rules.required) {
                if (!packageInfo[field]) {
                    this.addCheck('system-package', 'error', `Package ${packageName} missing required field: ${field}`, `Required field ${field} is missing`);
                } else {
                    this.addCheck('system-package', 'success', `Package ${packageName} has required field: ${field}`, `Field ${field} is present`);
                }
            }
            
            // Validate systems array
            if (packageInfo.systems && Array.isArray(packageInfo.systems)) {
                for (const systemName of packageInfo.systems) {
                    if (window.SYSTEM_DEPENDENCIES[systemName]) {
                        this.addCheck('system-package', 'success', `Package ${packageName} has valid system: ${systemName}`, 'System is defined');
                    } else {
                        this.addCheck('system-package', 'warning', `Package ${packageName} has undefined system: ${systemName}`, 'System is not defined in dependencies');
                    }
                }
            }
        }

        /**
         * Validate page templates
         * ולידציה של תבניות עמודים
         */
        async validatePageTemplates() {
            console.log('🔍 Validating page templates...');
            
            if (!window.PAGE_TEMPLATES) {
                this.addCheck('page-templates', 'error', 'PAGE_TEMPLATES not available', 'Cannot validate page templates');
                return;
            }
            
            const templates = window.PAGE_TEMPLATES;
            
            if (!templates || Object.keys(templates).length === 0) {
                this.addCheck('page-templates', 'warning', 'No page templates found', 'No page templates defined');
                return;
            }
            
            for (const [templateName, template] of Object.entries(templates)) {
                this.validatePageTemplate(templateName, template);
            }
        }

        /**
         * Validate individual page template
         * ולידציה של תבנית עמוד בודדת
         */
        validatePageTemplate(templateName, template) {
            // Check required fields
            const requiredFields = ['name', 'description', 'packages', 'systems'];
            
            for (const field of requiredFields) {
                if (!template[field]) {
                    this.addCheck('page-template', 'error', `Template ${templateName} missing required field: ${field}`, `Required field ${field} is missing`);
                } else {
                    this.addCheck('page-template', 'success', `Template ${templateName} has required field: ${field}`, `Field ${field} is present`);
                }
            }
            
            // Validate packages
            if (template.packages && Array.isArray(template.packages)) {
                for (const packageName of template.packages) {
                    if (window.SYSTEM_PACKAGES && window.SYSTEM_PACKAGES[packageName]) {
                        this.addCheck('page-template', 'success', `Template ${templateName} has valid package: ${packageName}`, 'Package is defined');
                    } else {
                        this.addCheck('page-template', 'error', `Template ${templateName} has undefined package: ${packageName}`, 'Package is not defined');
                    }
                }
            }
        }

        /**
         * Validate circular dependencies
         * ולידציה של תלויות מעגליות
         */
        async validateCircularDependencies() {
            console.log('🔍 Validating circular dependencies...');
            
            if (!window.SYSTEM_DEPENDENCIES) {
                this.addCheck('circular-dependencies', 'error', 'SYSTEM_DEPENDENCIES not available', 'Cannot validate circular dependencies');
                return;
            }
            
            const dependencies = window.SYSTEM_DEPENDENCIES;
            const visited = new Set();
            const recursionStack = new Set();
            
            for (const systemName of Object.keys(dependencies)) {
                if (!visited.has(systemName)) {
                    const hasCycle = this.detectCycle(systemName, dependencies, visited, recursionStack);
                    if (hasCycle) {
                        this.addCheck('circular-dependencies', 'error', `Circular dependency detected involving: ${systemName}`, 'Circular dependencies can cause initialization failures');
                    }
                }
            }
            
            if (visited.size === Object.keys(dependencies).length) {
                this.addCheck('circular-dependencies', 'success', 'No circular dependencies detected', 'All dependencies are valid');
            }
        }

        /**
         * Detect cycle in dependency graph
         * זיהוי מעגל בגרף התלויות
         */
        detectCycle(systemName, dependencies, visited, recursionStack) {
            visited.add(systemName);
            recursionStack.add(systemName);
            
            const systemDeps = dependencies[systemName];
            if (systemDeps && systemDeps.dependencies) {
                for (const dep of systemDeps.dependencies) {
                    if (!visited.has(dep)) {
                        if (this.detectCycle(dep, dependencies, visited, recursionStack)) {
                            return true;
                        }
                    } else if (recursionStack.has(dep)) {
                        return true;
                    }
                }
            }
            
            recursionStack.delete(systemName);
            return false;
        }

        /**
         * Validate performance configuration
         * ולידציה של קונפיגורציית ביצועים
         */
        async validatePerformanceConfiguration() {
            console.log('🔍 Validating performance configuration...');
            
            if (!window.SmartPageConfigs) {
                this.addCheck('performance-config', 'error', 'SmartPageConfigs not available', 'Cannot validate performance configuration');
                return;
            }
            
            const allConfigs = window.SmartPageConfigs.getAllPageConfigs();
            let configsWithPerformance = 0;
            let configsWithOptimization = 0;
            let configsWithCaching = 0;
            let configsWithMonitoring = 0;
            
            for (const [pageName, config] of Object.entries(allConfigs)) {
                if (config.performance) {
                    configsWithPerformance++;
                    
                    if (config.performance.enableOptimization) {
                        configsWithOptimization++;
                    }
                    
                    if (config.performance.enableCaching) {
                        configsWithCaching++;
                    }
                    
                    if (config.performance.monitorPerformance) {
                        configsWithMonitoring++;
                    }
                }
            }
            
            const totalConfigs = Object.keys(allConfigs).length;
            
            if (configsWithPerformance === totalConfigs) {
                this.addCheck('performance-config', 'success', 'All pages have performance configuration', 'Performance configuration is complete');
            } else {
                this.addCheck('performance-config', 'warning', `${configsWithPerformance}/${totalConfigs} pages have performance configuration`, 'Some pages missing performance configuration');
            }
            
            if (configsWithOptimization === totalConfigs) {
                this.addCheck('performance-config', 'success', 'All pages have optimization enabled', 'Optimization is enabled for all pages');
            } else {
                this.addCheck('performance-config', 'warning', `${configsWithOptimization}/${totalConfigs} pages have optimization enabled`, 'Some pages missing optimization');
            }
            
            if (configsWithCaching === totalConfigs) {
                this.addCheck('performance-config', 'success', 'All pages have caching enabled', 'Caching is enabled for all pages');
            } else {
                this.addCheck('performance-config', 'warning', `${configsWithCaching}/${totalConfigs} pages have caching enabled`, 'Some pages missing caching');
            }
            
            if (configsWithMonitoring === totalConfigs) {
                this.addCheck('performance-config', 'success', 'All pages have performance monitoring enabled', 'Performance monitoring is enabled for all pages');
            } else {
                this.addCheck('performance-config', 'warning', `${configsWithMonitoring}/${totalConfigs} pages have performance monitoring enabled`, 'Some pages missing performance monitoring');
            }
        }

        /**
         * Validate testing system
         * ולידציה של מערכת הבדיקות
         */
        async validateTestingSystem() {
            console.log('🔍 Validating testing system...');
            
            if (!window.InitTestingSystem) {
                this.addCheck('testing-system', 'error', 'InitTestingSystem not available', 'Testing system not loaded');
                return;
            }
            
            try {
                // Test if testing system can be initialized
                await window.InitTestingSystem.initialize();
                this.addCheck('testing-system', 'success', 'Testing system initialized successfully', 'Testing system is working');
                
                // Test if tests can be run
                const testResults = await window.InitTestingSystem.runAllTests();
                if (testResults.success) {
                    this.addCheck('testing-system', 'success', 'All tests passed', 'Testing system is fully functional');
                } else {
                    this.addCheck('testing-system', 'warning', `${testResults.failedTests} tests failed`, 'Some tests are failing');
                }
                
            } catch (error) {
                this.addCheck('testing-system', 'error', 'Testing system failed to initialize', error.message);
            }
        }

        /**
         * Add validation check result
         * הוספת תוצאת בדיקת ולידציה
         */
        addCheck(category, status, message, details) {
            this.validationResults.totalChecks++;
            
            if (status === 'success') {
                this.validationResults.passedChecks++;
            } else if (status === 'error') {
                this.validationResults.failedChecks++;
            } else if (status === 'warning') {
                this.validationResults.warnings++;
            }
            
            this.validationResults.checks.push({
                category: category,
                status: status,
                message: message,
                details: details,
                timestamp: new Date().toISOString()
            });
        }

        /**
         * Calculate overall validation status
         * חישוב סטטוס ולידציה כולל
         */
        calculateOverallStatus() {
            if (this.validationResults.failedChecks === 0) {
                if (this.validationResults.warnings === 0) {
                    this.validationResults.overallStatus = 'excellent';
                } else {
                    this.validationResults.overallStatus = 'good';
                }
            } else if (this.validationResults.failedChecks < this.validationResults.totalChecks / 2) {
                this.validationResults.overallStatus = 'warning';
            } else {
                this.validationResults.overallStatus = 'error';
            }
        }

        /**
         * Generate validation report
         * יצירת דוח ולידציה
         */
        generateValidationReport() {
            const report = {
                ...this.validationResults,
                summary: {
                    totalChecks: this.validationResults.totalChecks,
                    passedChecks: this.validationResults.passedChecks,
                    failedChecks: this.validationResults.failedChecks,
                    warnings: this.validationResults.warnings,
                    successRate: this.validationResults.totalChecks > 0 ? 
                        (this.validationResults.passedChecks / this.validationResults.totalChecks * 100).toFixed(1) : 0
                },
                recommendations: this.generateRecommendations()
            };
            
            return report;
        }

        /**
         * Generate recommendations based on validation results
         * יצירת המלצות בהתבסס על תוצאות ולידציה
         */
        generateRecommendations() {
            const recommendations = [];
            
            // Check for common issues
            const errorChecks = this.validationResults.checks.filter(check => check.status === 'error');
            const warningChecks = this.validationResults.checks.filter(check => check.status === 'warning');
            
            if (errorChecks.length > 0) {
                recommendations.push({
                    priority: 'high',
                    category: 'errors',
                    message: 'Fix critical errors first',
                    details: `${errorChecks.length} critical errors need to be resolved`
                });
            }
            
            if (warningChecks.length > 0) {
                recommendations.push({
                    priority: 'medium',
                    category: 'warnings',
                    message: 'Address warnings for better system health',
                    details: `${warningChecks.length} warnings should be reviewed`
                });
            }
            
            // Check for missing performance configuration
            const performanceChecks = this.validationResults.checks.filter(check => 
                check.category === 'performance-config' && check.status === 'warning'
            );
            
            if (performanceChecks.length > 0) {
                recommendations.push({
                    priority: 'medium',
                    category: 'performance',
                    message: 'Enable performance optimization for all pages',
                    details: 'Consider enabling optimization, caching, and monitoring for better performance'
                });
            }
            
            // Check for testing system issues
            const testingChecks = this.validationResults.checks.filter(check => 
                check.category === 'testing-system' && check.status !== 'success'
            );
            
            if (testingChecks.length > 0) {
                recommendations.push({
                    priority: 'medium',
                    category: 'testing',
                    message: 'Fix testing system issues',
                    details: 'Ensure testing system is working properly for reliable validation'
                });
            }
            
            return recommendations;
        }

        /**
         * Display validation results in console
         * הצגת תוצאות ולידציה בקונסולה
         */
        displayResults() {
            const report = this.generateValidationReport();
            
            console.log('📊 Smart Initialization System Validation Report');
            console.log('================================================');
            console.log(`Overall Status: ${report.overallStatus.toUpperCase()}`);
            console.log(`Total Checks: ${report.summary.totalChecks}`);
            console.log(`Passed: ${report.summary.passedChecks}`);
            console.log(`Failed: ${report.summary.failedChecks}`);
            console.log(`Warnings: ${report.summary.warnings}`);
            console.log(`Success Rate: ${report.summary.successRate}%`);
            console.log('');
            
            if (report.recommendations.length > 0) {
                console.log('📋 Recommendations:');
                report.recommendations.forEach((rec, index) => {
                    console.log(`${index + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`);
                    console.log(`   ${rec.details}`);
                });
                console.log('');
            }
            
            console.log('📝 Detailed Results:');
            report.checks.forEach((check, index) => {
                const statusIcon = check.status === 'success' ? '✅' : 
                                 check.status === 'warning' ? '⚠️' : '❌';
                console.log(`${index + 1}. ${statusIcon} [${check.category}] ${check.message}`);
                if (check.details) {
                    console.log(`   Details: ${check.details}`);
                }
            });
            
            return report;
        }

        /**
         * Export validation results to JSON
         * ייצוא תוצאות ולידציה ל-JSON
         */
        exportResults() {
            const report = this.generateValidationReport();
            const jsonString = JSON.stringify(report, null, 2);
            
            // Create download link
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `smart-init-validation-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('📁 Validation results exported to JSON file');
            return report;
        }
    }

    // Create global instance
    window.InitValidator = new InitValidator();

    // Add convenience methods to global scope
    window.validateSmartInitSystem = () => window.InitValidator.runComprehensiveValidation();
    window.displayValidationResults = () => window.InitValidator.displayResults();
    window.exportValidationResults = () => window.InitValidator.exportResults();

    console.log('✅ Smart Initialization System Validator loaded');

})();
