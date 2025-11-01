#!/usr/bin/env node

/**
 * Runtime Integration Checker - TikTrack
 * =======================================
 * 
 * כלי בדיקה דינמית לבדיקת אינטגרציה ב-runtime
 * 
 * @version 1.0.0
 * @created November 2025
 * @author TikTrack Development Team
 * 
 * Note: This script is designed to run in a browser context via HTML test page
 * For Node.js usage, it provides simulation capabilities
 */

const fs = require('fs');
const path = require('path');

const CONFIG = {
    systemsListFile: 'documentation/frontend/GENERAL_SYSTEMS_LIST.md',
    knownSystems: [
        'DataCollectionService', 'CRUDResponseHandler', 'SelectPopulatorService',
        'DefaultValueSetter', 'LinkedItemsService', 'FieldRendererService',
        'StatisticsCalculator', 'AlertConditionRenderer', 'ModalManagerV2',
        'UnifiedCacheManager', 'CacheSyncManager', 'CachePolicyManager',
        'ModalNavigationManager', 'EventHandlerManager', 'PreferencesGroupManager',
        'NotificationSystem', 'Logger', 'HeaderSystem', 'ButtonSystem',
        'ActionsMenuSystem', 'InfoSummarySystem', 'ColorSchemeSystem',
        'UnifiedAppInitializer', 'AlertService', 'TickerService',
        'TradePlanService', 'AccountService', 'EntityDetailsModal',
        'EntityDetailsRenderer', 'EntityDetailsAPI', 'PreferencesCore',
        'PreferencesSystem', 'toggleSection', 'showSuccessNotification',
        'showErrorNotification', 'showWarningNotification', 'showInfoNotification',
        'showFieldError', 'clearValidation', 'loadTableData', 'getPageDataFunctions'
    ]
};

class RuntimeIntegrationChecker {
    constructor() {
        this.checkResults = {
            availability: {},
            integrationTests: [],
            dependencyChainValidation: [],
            initializationTimes: {},
            missingDependencies: [],
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Check system availability (for browser context)
     * Returns a test HTML page that can be loaded in browser
     */
    generateBrowserTestPage() {
        return `<!DOCTYPE html>
<html>
<head>
    <title>Runtime Integration Checker - TikTrack</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .system { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
        .available { background-color: #d4edda; }
        .missing { background-color: #f8d7da; }
        .partial { background-color: #fff3cd; }
        .summary { margin: 20px 0; padding: 15px; background: #f0f0f0; }
    </style>
</head>
<body>
    <h1>Runtime Integration Checker</h1>
    <div id="results"></div>
    
    <script>
        const systemsToCheck = ${JSON.stringify(CONFIG.knownSystems)};
        const results = {
            availability: {},
            missing: [],
            partial: []
        };
        
        // Check each system
        systemsToCheck.forEach(systemName => {
            const isAvailable = typeof window[systemName] !== 'undefined';
            const hasMethods = isAvailable ? Object.keys(window[systemName] || {}).length > 0 : false;
            
            results.availability[systemName] = {
                available: isAvailable,
                hasMethods: hasMethods,
                type: typeof window[systemName],
                methods: isAvailable && typeof window[systemName] === 'object' 
                    ? Object.keys(window[systemName]).filter(k => typeof window[systemName][k] === 'function')
                    : []
            };
            
            if (!isAvailable) {
                results.missing.push(systemName);
            } else if (!hasMethods && typeof window[systemName] === 'object') {
                results.partial.push(systemName);
            }
        });
        
        // Validate dependency chains
        const dependencyChains = validateDependencyChains(results.availability);
        
        // Measure initialization times (if possible)
        const initTimes = measureInitializationTimes();
        
        // Render results
        renderResults(results, dependencyChains, initTimes);
        
        function validateDependencyChains(availability) {
            const chains = [];
            // Implementation would check if required dependencies are available
            return chains;
        }
        
        function measureInitializationTimes() {
            const times = {};
            // Implementation would measure actual init times
            return times;
        }
        
        function renderResults(results, chains, times) {
            const container = document.getElementById('results');
            let html = '<div class="summary">';
            html += '<h2>Summary</h2>';
            html += '<p>Available: ' + (systemsToCheck.length - results.missing.length) + '/' + systemsToCheck.length + '</p>';
            html += '<p>Missing: ' + results.missing.length + '</p>';
            html += '<p>Partial: ' + results.partial.length + '</p>';
            html += '</div>';
            
            html += '<h2>System Availability</h2>';
            Object.entries(results.availability).forEach(([name, info]) => {
                const status = info.available ? (info.hasMethods ? 'available' : 'partial') : 'missing';
                html += '<div class="system ' + status + '">';
                html += '<strong>' + name + '</strong>: ';
                html += info.available ? 'Available' : 'Missing';
                if (info.available && info.methods.length > 0) {
                    html += ' (' + info.methods.length + ' methods: ' + info.methods.join(', ') + ')';
                }
                html += '</div>';
            });
            
            container.innerHTML = html;
            
            // Log to console for programmatic access
            console.log('Runtime Integration Check Results:', {
                results: results,
                chains: chains,
                times: times
            });
        }
    </script>
</body>
</html>`;
    }

    /**
     * Check system availability (Node.js simulation)
     */
    checkSystemAvailability() {
        const results = {};
        
        CONFIG.knownSystems.forEach(systemName => {
            // Simulate availability check by checking if file exists
            const possiblePaths = [
                `trading-ui/scripts/services/${systemName.toLowerCase().replace(/service$/, '-service.js')}`,
                `trading-ui/scripts/${systemName.toLowerCase().replace(/system$/, '-system.js')}`,
                `trading-ui/scripts/${systemName.toLowerCase()}.js`,
                `trading-ui/scripts/modules/${systemName.toLowerCase().replace(/system$/, '-system.js')}`
            ];
            
            let found = false;
            for (const filePath of possiblePaths) {
                if (fs.existsSync(filePath)) {
                    found = true;
                    break;
                }
            }
            
            results[systemName] = {
                available: found,
                checked: new Date().toISOString()
            };
        });
        
        return results;
    }

    /**
     * Test integration points
     */
    testIntegrationPoints(systems) {
        const tests = [];
        
        // Test common integration patterns
        const integrationPatterns = [
            {
                name: 'ModalManagerV2.showModal',
                test: () => {
                    // Check if ModalManagerV2 exists and has showModal
                    return typeof window !== 'undefined' && 
                           window.ModalManagerV2 && 
                           typeof window.ModalManagerV2.showModal === 'function';
                }
            },
            {
                name: 'UnifiedCacheManager.get',
                test: () => {
                    return typeof window !== 'undefined' && 
                           window.UnifiedCacheManager && 
                           typeof window.UnifiedCacheManager.get === 'function';
                }
            },
            {
                name: 'FieldRendererService.renderStatus',
                test: () => {
                    return typeof window !== 'undefined' && 
                           window.FieldRendererService && 
                           typeof window.FieldRendererService.renderStatus === 'function';
                }
            }
        ];
        
        // In Node.js, simulate tests
        if (typeof window === 'undefined') {
            integrationPatterns.forEach(pattern => {
                tests.push({
                    name: pattern.name,
                    passed: false,
                    note: 'Requires browser context'
                });
            });
        }
        
        return tests;
    }

    /**
     * Validate dependency chain
     */
    validateDependencyChain(chain, availability) {
        const issues = [];
        
        for (let i = 0; i < chain.length - 1; i++) {
            const current = chain[i];
            const next = chain[i + 1];
            
            if (!availability[current] || !availability[current].available) {
                issues.push({
                    chain: chain,
                    brokenAt: current,
                    missing: current
                });
                break;
            }
        }
        
        return {
            valid: issues.length === 0,
            issues: issues
        };
    }

    /**
     * Detect missing dependencies
     */
    detectMissingDependencies(requiredSystems, availableSystems) {
        const missing = [];
        
        requiredSystems.forEach(system => {
            if (!availableSystems[system] || !availableSystems[system].available) {
                missing.push({
                    system: system,
                    severity: 'critical',
                    impact: 'System may not function correctly'
                });
            }
        });
        
        return missing;
    }

    /**
     * Save browser test page
     */
    saveBrowserTestPage() {
        const outputDir = path.join(process.cwd(), 'reports/integration-analysis');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const html = this.generateBrowserTestPage();
        const outputFile = path.join(outputDir, 'runtime-integration-test.html');
        fs.writeFileSync(outputFile, html);
        
        console.log(`💾 Browser test page saved to: ${outputFile}`);
        return outputFile;
    }

    /**
     * Generate Node.js check results
     */
    generateNodeResults() {
        const availability = this.checkSystemAvailability();
        const tests = this.testIntegrationPoints(availability);
        
        this.checkResults.availability = availability;
        this.checkResults.integrationTests = tests;
        this.checkResults.missingDependencies = this.detectMissingDependencies(
            CONFIG.knownSystems.filter(s => s.includes('Service') || s.includes('Manager')),
            availability
        );
        
        return this.checkResults;
    }

    /**
     * Save results
     */
    saveResults() {
        const outputDir = path.join(process.cwd(), 'reports/integration-analysis');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        const outputFile = path.join(outputDir, 'runtime-check-results.json');
        fs.writeFileSync(outputFile, JSON.stringify(this.checkResults, null, 2));
        
        console.log(`💾 Runtime check results saved to: ${outputFile}`);
        return outputFile;
    }
}

// Export for use in other scripts
module.exports = RuntimeIntegrationChecker;

// Command line usage
if (require.main === module) {
    const checker = new RuntimeIntegrationChecker();
    
    // Generate browser test page
    checker.saveBrowserTestPage();
    
    // Generate Node.js results
    checker.generateNodeResults();
    checker.saveResults();
    
    console.log('\n✅ Runtime integration check complete!');
    console.log('📄 Open runtime-integration-test.html in a browser for full runtime checks');
}


