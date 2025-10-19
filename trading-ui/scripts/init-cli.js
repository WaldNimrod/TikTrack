/**
 * Smart Initialization System CLI
 * ===============================
 * 
 * Command-line interface for the Smart Initialization System
 * Provides interactive commands for system management and validation
 * 
 * @author TikTrack Development Team
 * @version 1.0.0
 * @lastUpdated October 19, 2025
 */

(function() {
    'use strict';

    /**
     * Smart Initialization System CLI
     * ממשק שורת פקודה למערכת האתחול החכמה
     */
    class InitCLI {
        constructor() {
            this.commands = {
                'help': this.showHelp.bind(this),
                'status': this.showStatus.bind(this),
                'validate': this.runValidation.bind(this),
                'test': this.runTests.bind(this),
                'performance': this.showPerformance.bind(this),
                'cache': this.showCache.bind(this),
                'pages': this.listPages.bind(this),
                'packages': this.listPackages.bind(this),
                'systems': this.listSystems.bind(this),
                'templates': this.listTemplates.bind(this),
                'dependencies': this.showDependencies.bind(this),
                'init': this.initializePage.bind(this),
                'migrate': this.migratePage.bind(this),
                'optimize': this.optimizeSystem.bind(this),
                'clear': this.clearCache.bind(this),
                'export': this.exportData.bind(this),
                'import': this.importData.bind(this),
                'monitor': this.startMonitoring.bind(this),
                'stop': this.stopMonitoring.bind(this),
                'restart': this.restartSystem.bind(this),
                'backup': this.createBackup.bind(this),
                'restore': this.restoreBackup.bind(this)
            };
            
            this.isMonitoring = false;
            this.monitoringInterval = null;
            
            this.initializeCLI();
        }

        /**
         * Initialize CLI
         * אתחול CLI
         */
        initializeCLI() {
            console.log('🚀 Smart Initialization System CLI');
            console.log('==================================');
            console.log('Type "help" for available commands');
            console.log('Type "exit" to quit');
            console.log('');
            
            // Set up global CLI access
            window.smartInitCLI = this;
            window.cli = this;
            
            // Show initial status
            this.showStatus();
        }

        /**
         * Show help information
         * הצגת מידע עזרה
         */
        showHelp() {
            console.log('📋 Smart Initialization System CLI Commands');
            console.log('==========================================');
            console.log('');
            
            const commandGroups = {
                'System Information': [
                    { command: 'status', description: 'Show system status and health' },
                    { command: 'pages', description: 'List all configured pages' },
                    { command: 'packages', description: 'List all system packages' },
                    { command: 'systems', description: 'List all systems' },
                    { command: 'templates', description: 'List all page templates' },
                    { command: 'dependencies', description: 'Show system dependencies' }
                ],
                'Validation & Testing': [
                    { command: 'validate', description: 'Run comprehensive validation' },
                    { command: 'test', description: 'Run system tests' }
                ],
                'Performance & Monitoring': [
                    { command: 'performance', description: 'Show performance metrics' },
                    { command: 'cache', description: 'Show cache statistics' },
                    { command: 'monitor', description: 'Start real-time monitoring' },
                    { command: 'stop', description: 'Stop monitoring' }
                ],
                'Page Management': [
                    { command: 'init <page>', description: 'Initialize a specific page' },
                    { command: 'migrate <page>', description: 'Migrate a page to Smart System' }
                ],
                'System Operations': [
                    { command: 'optimize', description: 'Optimize system performance' },
                    { command: 'clear', description: 'Clear system cache' },
                    { command: 'restart', description: 'Restart the system' }
                ],
                'Data Management': [
                    { command: 'export', description: 'Export system data' },
                    { command: 'import', description: 'Import system data' },
                    { command: 'backup', description: 'Create system backup' },
                    { command: 'restore', description: 'Restore from backup' }
                ]
            };
            
            for (const [groupName, commands] of Object.entries(commandGroups)) {
                console.log(`📁 ${groupName}:`);
                commands.forEach(cmd => {
                    console.log(`  ${cmd.command.padEnd(20)} - ${cmd.description}`);
                });
                console.log('');
            }
            
            console.log('💡 Tips:');
            console.log('  - Use Tab for command completion');
            console.log('  - Use arrow keys for command history');
            console.log('  - Type "exit" to quit the CLI');
            console.log('');
        }

        /**
         * Show system status
         * הצגת סטטוס המערכת
         */
        showStatus() {
            console.log('📊 System Status');
            console.log('================');
            
            // Check system availability
            const systems = [
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
            
            let activeSystems = 0;
            systems.forEach(system => {
                const status = system.object ? '✅ Active' : '❌ Inactive';
                console.log(`  ${system.name.padEnd(25)} ${status}`);
                if (system.object) activeSystems++;
            });
            
            console.log('');
            console.log(`📈 Overall Status: ${activeSystems}/${systems.length} systems active`);
            
            // Show performance metrics if available
            if (window.InitPerformanceOptimizer) {
                const metrics = window.InitPerformanceOptimizer.getMetrics();
                console.log(`⚡ Performance: ${metrics.initializationTime}ms initialization time`);
            }
            
            // Show cache stats if available
            if (window.InitAdvancedCache) {
                const cacheStats = window.InitAdvancedCache.getStats();
                console.log(`💾 Cache: ${cacheStats.hitRate}% hit rate`);
            }
            
            console.log('');
        }

        /**
         * Run comprehensive validation
         * הרצת ולידציה מקיפה
         */
        async runValidation() {
            console.log('🔍 Running comprehensive validation...');
            
            if (!window.InitValidator) {
                console.log('❌ Validator not available. Please load init-validator.js');
                return;
            }
            
            try {
                const results = await window.InitValidator.runComprehensiveValidation();
                window.InitValidator.displayResults();
                
                if (results.overallStatus === 'excellent') {
                    console.log('🎉 Validation passed with excellence!');
                } else if (results.overallStatus === 'good') {
                    console.log('✅ Validation passed with minor warnings');
                } else if (results.overallStatus === 'warning') {
                    console.log('⚠️ Validation passed with warnings');
                } else {
                    console.log('❌ Validation failed with errors');
                }
                
            } catch (error) {
                console.error('❌ Validation failed:', error.message);
            }
        }

        /**
         * Run system tests
         * הרצת בדיקות מערכת
         */
        async runTests() {
            console.log('🧪 Running system tests...');
            
            if (!window.InitTestingSystem) {
                console.log('❌ Testing system not available. Please load init-testing-system.js');
                return;
            }
            
            try {
                const results = await window.InitTestingSystem.runAllTests();
                
                console.log('📊 Test Results:');
                console.log(`  Total Tests: ${results.totalTests}`);
                console.log(`  Passed: ${results.passedTests}`);
                console.log(`  Failed: ${results.failedTests}`);
                console.log(`  Success Rate: ${((results.passedTests / results.totalTests) * 100).toFixed(1)}%`);
                
                if (results.success) {
                    console.log('🎉 All tests passed!');
                } else {
                    console.log('⚠️ Some tests failed. Check details above.');
                }
                
            } catch (error) {
                console.error('❌ Testing failed:', error.message);
            }
        }

        /**
         * Show performance metrics
         * הצגת מדדי ביצועים
         */
        showPerformance() {
            console.log('⚡ Performance Metrics');
            console.log('=====================');
            
            if (!window.InitPerformanceOptimizer) {
                console.log('❌ Performance optimizer not available');
                return;
            }
            
            const metrics = window.InitPerformanceOptimizer.getMetrics();
            
            console.log(`  Initialization Time: ${metrics.initializationTime}ms`);
            console.log(`  Memory Usage: ${metrics.memoryUsage}MB`);
            console.log(`  Script Load Time: ${metrics.scriptLoadTime}ms`);
            console.log(`  Cache Hit Rate: ${metrics.cacheHitRate}%`);
            console.log(`  Total Systems: ${metrics.totalSystems}`);
            console.log(`  Loaded Systems: ${metrics.loadedSystems}`);
            console.log(`  Failed Systems: ${metrics.failedSystems}`);
            
            // Performance recommendations
            console.log('');
            console.log('💡 Performance Recommendations:');
            
            if (metrics.initializationTime > 3000) {
                console.log('  ⚠️ Slow initialization detected. Consider enabling optimization.');
            }
            
            if (metrics.memoryUsage > 100) {
                console.log('  ⚠️ High memory usage detected. Consider lazy loading.');
            }
            
            if (metrics.cacheHitRate < 70) {
                console.log('  ⚠️ Low cache hit rate. Consider enabling caching.');
            }
            
            if (metrics.failedSystems > 0) {
                console.log('  ❌ Some systems failed to load. Check dependencies.');
            }
            
            console.log('');
        }

        /**
         * Show cache statistics
         * הצגת סטטיסטיקות מטמון
         */
        showCache() {
            console.log('💾 Cache Statistics');
            console.log('==================');
            
            if (!window.InitAdvancedCache) {
                console.log('❌ Advanced cache system not available');
                return;
            }
            
            const stats = window.InitAdvancedCache.getStats();
            
            console.log(`  Status: ${stats.status}`);
            console.log(`  Hit Rate: ${stats.hitRate}%`);
            console.log(`  Miss Rate: ${stats.missRate}%`);
            console.log(`  Total Entries: ${stats.totalEntries}`);
            console.log(`  Memory Usage: ${stats.memoryUsage}MB`);
            
            // Cache recommendations
            console.log('');
            console.log('💡 Cache Recommendations:');
            
            if (stats.status !== 'active') {
                console.log('  ❌ Cache system is not active. Check configuration.');
            }
            
            if (stats.hitRate < 70) {
                console.log('  ⚠️ Low hit rate. Consider warming cache or adjusting TTL.');
            }
            
            if (stats.memoryUsage > 50) {
                console.log('  ⚠️ High memory usage. Consider clearing old entries.');
            }
            
            console.log('');
        }

        /**
         * List all configured pages
         * רשימת כל העמודים המוגדרים
         */
        listPages() {
            console.log('📄 Configured Pages');
            console.log('===================');
            
            if (!window.SmartPageConfigs) {
                console.log('❌ SmartPageConfigs not available');
                return;
            }
            
            const allConfigs = window.SmartPageConfigs.getAllPageConfigs();
            
            if (!allConfigs || Object.keys(allConfigs).length === 0) {
                console.log('No pages configured');
                return;
            }
            
            for (const [pageName, config] of Object.entries(allConfigs)) {
                console.log(`  📄 ${pageName}`);
                console.log(`     Template: ${config.template || 'N/A'}`);
                console.log(`     Packages: ${config.packages ? config.packages.join(', ') : 'N/A'}`);
                console.log(`     Systems: ${config.systems ? config.systems.join(', ') : 'N/A'}`);
                console.log(`     Lazy Load: ${config.lazyLoad ? config.lazyLoad.join(', ') : 'None'}`);
                console.log('');
            }
        }

        /**
         * List all system packages
         * רשימת כל חבילות המערכת
         */
        listPackages() {
            console.log('📦 System Packages');
            console.log('==================');
            
            if (!window.SYSTEM_PACKAGES) {
                console.log('❌ SYSTEM_PACKAGES not available');
                return;
            }
            
            for (const [packageName, packageInfo] of Object.entries(window.SYSTEM_PACKAGES)) {
                console.log(`  📦 ${packageName}`);
                console.log(`     Name: ${packageInfo.name || 'N/A'}`);
                console.log(`     Description: ${packageInfo.description || 'N/A'}`);
                console.log(`     Systems: ${packageInfo.systems ? packageInfo.systems.join(', ') : 'N/A'}`);
                console.log(`     Criticality: ${packageInfo.criticality || 'N/A'}`);
                console.log(`     Version: ${packageInfo.version || 'N/A'}`);
                console.log('');
            }
        }

        /**
         * List all systems
         * רשימת כל המערכות
         */
        listSystems() {
            console.log('🔧 Systems');
            console.log('==========');
            
            if (!window.SYSTEM_DEPENDENCIES) {
                console.log('❌ SYSTEM_DEPENDENCIES not available');
                return;
            }
            
            for (const [systemName, systemInfo] of Object.entries(window.SYSTEM_DEPENDENCIES)) {
                console.log(`  🔧 ${systemName}`);
                console.log(`     Dependencies: ${systemInfo.dependencies ? systemInfo.dependencies.join(', ') : 'None'}`);
                console.log(`     Criticality: ${systemInfo.criticality || 'N/A'}`);
                console.log(`     Fallback: ${systemInfo.fallback ? 'Available' : 'None'}`);
                console.log('');
            }
        }

        /**
         * List all page templates
         * רשימת כל תבניות העמודים
         */
        listTemplates() {
            console.log('📋 Page Templates');
            console.log('=================');
            
            if (!window.PAGE_TEMPLATES) {
                console.log('❌ PAGE_TEMPLATES not available');
                return;
            }
            
            for (const [templateName, template] of Object.entries(window.PAGE_TEMPLATES)) {
                console.log(`  📋 ${templateName}`);
                console.log(`     Name: ${template.name || 'N/A'}`);
                console.log(`     Description: ${template.description || 'N/A'}`);
                console.log(`     Packages: ${template.packages ? template.packages.join(', ') : 'N/A'}`);
                console.log(`     Systems: ${template.systems ? template.systems.join(', ') : 'N/A'}`);
                console.log('');
            }
        }

        /**
         * Show system dependencies
         * הצגת תלויות המערכת
         */
        showDependencies() {
            console.log('🔗 System Dependencies');
            console.log('======================');
            
            if (!window.SYSTEM_DEPENDENCIES) {
                console.log('❌ SYSTEM_DEPENDENCIES not available');
                return;
            }
            
            // Create dependency graph visualization
            const dependencies = window.SYSTEM_DEPENDENCIES;
            const visited = new Set();
            
            const printDependencies = (systemName, level = 0) => {
                if (visited.has(systemName)) return;
                visited.add(systemName);
                
                const indent = '  '.repeat(level);
                console.log(`${indent}🔧 ${systemName}`);
                
                const systemDeps = dependencies[systemName];
                if (systemDeps && systemDeps.dependencies) {
                    systemDeps.dependencies.forEach(dep => {
                        printDependencies(dep, level + 1);
                    });
                }
            };
            
            for (const systemName of Object.keys(dependencies)) {
                if (!visited.has(systemName)) {
                    printDependencies(systemName);
                }
            }
            
            console.log('');
        }

        /**
         * Initialize a specific page
         * אתחול עמוד ספציפי
         */
        async initializePage(pageName) {
            if (!pageName) {
                console.log('❌ Please specify a page name');
                console.log('Usage: init <page-name>');
                return;
            }
            
            console.log(`🚀 Initializing page: ${pageName}`);
            
            if (!window.SmartAppInitializer) {
                console.log('❌ SmartAppInitializer not available');
                return;
            }
            
            try {
                const initializer = new window.SmartAppInitializer(pageName);
                const success = await initializer.initialize();
                
                if (success) {
                    console.log(`✅ Page ${pageName} initialized successfully`);
                } else {
                    console.log(`❌ Page ${pageName} initialization failed`);
                }
                
            } catch (error) {
                console.error(`❌ Error initializing page ${pageName}:`, error.message);
            }
        }

        /**
         * Migrate a page to Smart System
         * העברת עמוד למערכת החכמה
         */
        async migratePage(pageName) {
            if (!pageName) {
                console.log('❌ Please specify a page name');
                console.log('Usage: migrate <page-name>');
                return;
            }
            
            console.log(`🔄 Migrating page: ${pageName}`);
            console.log('This is a placeholder for migration functionality');
            console.log('In a real implementation, this would:');
            console.log('  1. Create a smart version of the page');
            console.log('  2. Update script loading');
            console.log('  3. Update page configuration');
            console.log('  4. Test the migrated page');
            console.log('');
        }

        /**
         * Optimize system performance
         * אופטימיזציה של ביצועי המערכת
         */
        async optimizeSystem() {
            console.log('⚡ Optimizing system performance...');
            
            if (!window.InitPerformanceOptimizer) {
                console.log('❌ Performance optimizer not available');
                return;
            }
            
            try {
                await window.InitPerformanceOptimizer.applyOptimizations();
                console.log('✅ System optimization completed');
                
                // Show updated metrics
                const metrics = window.InitPerformanceOptimizer.getMetrics();
                console.log(`📊 Updated metrics:`);
                console.log(`  Initialization Time: ${metrics.initializationTime}ms`);
                console.log(`  Memory Usage: ${metrics.memoryUsage}MB`);
                
            } catch (error) {
                console.error('❌ Optimization failed:', error.message);
            }
        }

        /**
         * Clear system cache
         * ניקוי מטמון המערכת
         */
        async clearCache() {
            console.log('🗑️ Clearing system cache...');
            
            if (!window.InitAdvancedCache) {
                console.log('❌ Advanced cache system not available');
                return;
            }
            
            try {
                await window.InitAdvancedCache.clear();
                console.log('✅ Cache cleared successfully');
                
                // Show updated stats
                const stats = window.InitAdvancedCache.getStats();
                console.log(`📊 Updated cache stats:`);
                console.log(`  Total Entries: ${stats.totalEntries}`);
                console.log(`  Memory Usage: ${stats.memoryUsage}MB`);
                
            } catch (error) {
                console.error('❌ Cache clear failed:', error.message);
            }
        }

        /**
         * Export system data
         * ייצוא נתוני המערכת
         */
        exportData() {
            console.log('📁 Exporting system data...');
            
            const exportData = {
                timestamp: new Date().toISOString(),
                pageConfigs: window.SmartPageConfigs ? window.SmartPageConfigs.getAllPageConfigs() : null,
                systemPackages: window.SYSTEM_PACKAGES || null,
                systemDependencies: window.SYSTEM_DEPENDENCIES || null,
                pageTemplates: window.PAGE_TEMPLATES || null,
                performanceMetrics: window.InitPerformanceOptimizer ? window.InitPerformanceOptimizer.getMetrics() : null,
                cacheStats: window.InitAdvancedCache ? window.InitAdvancedCache.getStats() : null
            };
            
            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `smart-init-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            console.log('✅ System data exported successfully');
        }

        /**
         * Import system data
         * ייבוא נתוני המערכת
         */
        importData() {
            console.log('📥 Import system data');
            console.log('This is a placeholder for import functionality');
            console.log('In a real implementation, this would:');
            console.log('  1. Open file picker');
            console.log('  2. Parse JSON data');
            console.log('  3. Validate imported data');
            console.log('  4. Apply imported configurations');
            console.log('');
        }

        /**
         * Start real-time monitoring
         * התחלת ניטור בזמן אמת
         */
        startMonitoring() {
            if (this.isMonitoring) {
                console.log('⚠️ Monitoring is already active');
                return;
            }
            
            console.log('📊 Starting real-time monitoring...');
            console.log('Press Ctrl+C to stop monitoring');
            
            this.isMonitoring = true;
            this.monitoringInterval = setInterval(() => {
                this.updateMonitoringDisplay();
            }, 2000);
            
            console.log('✅ Monitoring started');
        }

        /**
         * Stop monitoring
         * עצירת ניטור
         */
        stopMonitoring() {
            if (!this.isMonitoring) {
                console.log('⚠️ Monitoring is not active');
                return;
            }
            
            if (this.monitoringInterval) {
                clearInterval(this.monitoringInterval);
                this.monitoringInterval = null;
            }
            
            this.isMonitoring = false;
            console.log('✅ Monitoring stopped');
        }

        /**
         * Update monitoring display
         * עדכון תצוגת ניטור
         */
        updateMonitoringDisplay() {
            // Clear console and show current status
            console.clear();
            console.log('📊 Real-time Monitoring (Press Ctrl+C to stop)');
            console.log('===============================================');
            console.log(`Time: ${new Date().toLocaleTimeString()}`);
            console.log('');
            
            // Show performance metrics
            if (window.InitPerformanceOptimizer) {
                const metrics = window.InitPerformanceOptimizer.getMetrics();
                console.log('⚡ Performance:');
                console.log(`  Initialization Time: ${metrics.initializationTime}ms`);
                console.log(`  Memory Usage: ${metrics.memoryUsage}MB`);
                console.log(`  Cache Hit Rate: ${metrics.cacheHitRate}%`);
                console.log('');
            }
            
            // Show cache stats
            if (window.InitAdvancedCache) {
                const stats = window.InitAdvancedCache.getStats();
                console.log('💾 Cache:');
                console.log(`  Status: ${stats.status}`);
                console.log(`  Hit Rate: ${stats.hitRate}%`);
                console.log(`  Total Entries: ${stats.totalEntries}`);
                console.log('');
            }
        }

        /**
         * Restart the system
         * איתחול המערכת
         */
        async restartSystem() {
            console.log('🔄 Restarting Smart Initialization System...');
            
            // Stop monitoring if active
            if (this.isMonitoring) {
                this.stopMonitoring();
            }
            
            // Clear cache
            if (window.InitAdvancedCache) {
                await window.InitAdvancedCache.clear();
            }
            
            // Reset performance metrics
            if (window.InitPerformanceOptimizer) {
                window.InitPerformanceOptimizer.resetMetrics();
            }
            
            console.log('✅ System restarted successfully');
            this.showStatus();
        }

        /**
         * Create system backup
         * יצירת גיבוי מערכת
         */
        createBackup() {
            console.log('💾 Creating system backup...');
            console.log('This is a placeholder for backup functionality');
            console.log('In a real implementation, this would:');
            console.log('  1. Export all system data');
            console.log('  2. Create backup file');
            console.log('  3. Store backup securely');
            console.log('  4. Provide backup information');
            console.log('');
        }

        /**
         * Restore from backup
         * שחזור מגיבוי
         */
        restoreBackup() {
            console.log('🔄 Restore from backup');
            console.log('This is a placeholder for restore functionality');
            console.log('In a real implementation, this would:');
            console.log('  1. List available backups');
            console.log('  2. Select backup to restore');
            console.log('  3. Validate backup data');
            console.log('  4. Restore system state');
            console.log('');
        }

        /**
         * Execute command
         * ביצוע פקודה
         */
        executeCommand(input) {
            const parts = input.trim().split(' ');
            const command = parts[0].toLowerCase();
            const args = parts.slice(1);
            
            if (command === 'exit' || command === 'quit') {
                console.log('👋 Goodbye!');
                return false;
            }
            
            if (command === 'clear') {
                console.clear();
                return true;
            }
            
            if (this.commands[command]) {
                try {
                    if (args.length > 0) {
                        this.commands[command](...args);
                    } else {
                        this.commands[command]();
                    }
                } catch (error) {
                    console.error(`❌ Error executing command "${command}":`, error.message);
                }
            } else {
                console.log(`❌ Unknown command: ${command}`);
                console.log('Type "help" for available commands');
            }
            
            return true;
        }
    }

    // Initialize CLI when script loads
    const cli = new InitCLI();
    
    // Add global CLI access
    window.smartInitCLI = cli;
    window.cli = cli;
    
    // Add command execution function
    window.executeCLICommand = (command) => cli.executeCommand(command);
    
    console.log('✅ Smart Initialization System CLI loaded');
    console.log('Type "cli.help" or "smartInitCLI.help" for available commands');

})();
