#!/usr/bin/env node

/**
 * Quick Test Script for Smart Initialization System
 * סקריפט בדיקה מהיר למערכת האתחול החכמה
 * 
 * This script provides a quick way to test the Smart Initialization System
 * הסקריפט מספק דרך מהירה לבדוק את מערכת האתחול החכמה
 */

const fs = require('fs');
const path = require('path');

class QuickTest {
    constructor() {
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            details: []
        };
    }

    /**
     * Run quick tests
     * הרצת בדיקות מהירות
     */
    async runQuickTests() {
        console.log('🚀 Starting Quick Tests for Smart Initialization System...\n');
        
        try {
            // Test 1: Check if all required files exist
            await this.testFileExistence();
            
            // Test 2: Check file syntax
            await this.testFileSyntax();
            
            // Test 3: Check dependencies
            await this.testDependencies();
            
            // Test 4: Check documentation
            await this.testDocumentation();
            
            this.generateReport();
            
        } catch (error) {
            console.error('❌ Quick test execution failed:', error);
            this.addResult('Test Execution', false, `Failed to execute tests: ${error.message}`);
        }
        
        return this.results;
    }

    /**
     * Test file existence
     * בדיקת קיום קבצים
     */
    async testFileExistence() {
        const requiredFiles = [
            'trading-ui/scripts/init-package-registry.js',
            'trading-ui/scripts/init-dependency-graph.js',
            'trading-ui/scripts/init-page-templates.js',
            'trading-ui/scripts/init-feedback-system.js',
            'trading-ui/scripts/smart-app-initializer.js',
            'trading-ui/scripts/smart-script-loader.js',
            'trading-ui/scripts/smart-page-configs.js',
            'trading-ui/scripts/init-performance-optimizer.js',
            'trading-ui/scripts/init-advanced-cache.js',
            'trading-ui/scripts/init-testing-system.js',
            'trading-ui/scripts/init-validator.js',
            'trading-ui/scripts/init-cli.js',
            'trading-ui/scripts/test-runner.js'
        ];

        const smartPages = [
            'trading-ui/preferences-smart.html',
            'trading-ui/trades-smart.html',
            'trading-ui/alerts-smart.html',
            'trading-ui/index-smart.html',
            'trading-ui/crud-testing-dashboard-smart.html'
        ];

        const documentationFiles = [
            'documentation/frontend/PACKAGE_REGISTRY_GUIDE.md',
            'documentation/frontend/SYSTEM_DEPENDENCY_GRAPH_GUIDE.md',
            'documentation/frontend/PAGE_TEMPLATES_GUIDE.md',
            'documentation/frontend/ENHANCED_FEEDBACK_SYSTEM_GUIDE.md',
            'documentation/frontend/SMART_APP_INITIALIZER_GUIDE.md',
            'documentation/frontend/SMART_SCRIPT_LOADER_GUIDE.md',
            'documentation/frontend/SMART_PAGE_CONFIGS_GUIDE.md',
            'documentation/frontend/PERFORMANCE_OPTIMIZER_GUIDE.md',
            'documentation/frontend/ADVANCED_CACHE_SYSTEM_GUIDE.md',
            'documentation/frontend/TESTING_SYSTEM_GUIDE.md',
            'documentation/frontend/DEVELOPER_TOOLS_GUIDE.md',
            'documentation/frontend/SMART_INITIALIZATION_SYSTEM_INDEX.md',
            'documentation/frontend/DEVELOPER_QUICK_START.md',
            'documentation/frontend/BEST_PRACTICES.md',
            'documentation/frontend/TROUBLESHOOTING_GUIDE.md',
            'documentation/frontend/API_REFERENCE.md',
            'documentation/frontend/TEAM_TRAINING_GUIDE.md',
            'documentation/frontend/SYSTEM_LAUNCH_GUIDE.md',
            'documentation/frontend/TESTING_GUIDE.md',
            'documentation/frontend/PROJECT_COMPLETION_SUMMARY.md'
        ];

        console.log('📁 Testing file existence...');
        
        // Test core system files
        for (const file of requiredFiles) {
            const exists = fs.existsSync(file);
            this.addResult(`Core File: ${file}`, exists, exists ? 'Exists' : 'Missing');
        }

        // Test smart pages
        for (const file of smartPages) {
            const exists = fs.existsSync(file);
            this.addResult(`Smart Page: ${file}`, exists, exists ? 'Exists' : 'Missing');
        }

        // Test documentation files
        for (const file of documentationFiles) {
            const exists = fs.existsSync(file);
            this.addResult(`Documentation: ${file}`, exists, exists ? 'Exists' : 'Missing');
        }
    }

    /**
     * Test file syntax
     * בדיקת תחביר קבצים
     */
    async testFileSyntax() {
        console.log('🔍 Testing file syntax...');
        
        const jsFiles = [
            'trading-ui/scripts/init-package-registry.js',
            'trading-ui/scripts/init-dependency-graph.js',
            'trading-ui/scripts/init-page-templates.js',
            'trading-ui/scripts/init-feedback-system.js',
            'trading-ui/scripts/smart-app-initializer.js',
            'trading-ui/scripts/smart-script-loader.js',
            'trading-ui/scripts/smart-page-configs.js',
            'trading-ui/scripts/init-performance-optimizer.js',
            'trading-ui/scripts/init-advanced-cache.js',
            'trading-ui/scripts/init-testing-system.js',
            'trading-ui/scripts/init-validator.js',
            'trading-ui/scripts/init-cli.js',
            'trading-ui/scripts/test-runner.js'
        ];

        for (const file of jsFiles) {
            try {
                if (fs.existsSync(file)) {
                    const content = fs.readFileSync(file, 'utf8');
                    
                    // Basic syntax checks
                    const hasValidStructure = this.checkJavaScriptSyntax(content);
                    this.addResult(`Syntax: ${file}`, hasValidStructure, hasValidStructure ? 'Valid' : 'Invalid syntax');
                } else {
                    this.addResult(`Syntax: ${file}`, false, 'File not found');
                }
            } catch (error) {
                this.addResult(`Syntax: ${file}`, false, `Error: ${error.message}`);
            }
        }
    }

    /**
     * Check JavaScript syntax
     * בדיקת תחביר JavaScript
     */
    checkJavaScriptSyntax(content) {
        try {
            // Basic checks
            const hasClassDefinition = /class\s+\w+/.test(content);
            const hasFunctionDefinition = /function\s+\w+|const\s+\w+\s*=\s*function|const\s+\w+\s*=\s*\(/.test(content);
            const hasValidBraces = this.checkBraces(content);
            const hasValidQuotes = this.checkQuotes(content);
            
            return hasClassDefinition || hasFunctionDefinition && hasValidBraces && hasValidQuotes;
        } catch (error) {
            return false;
        }
    }

    /**
     * Check braces balance
     * בדיקת איזון סוגריים
     */
    checkBraces(content) {
        const openBraces = (content.match(/\{/g) || []).length;
        const closeBraces = (content.match(/\}/g) || []).length;
        return openBraces === closeBraces;
    }

    /**
     * Check quotes balance
     * בדיקת איזון מרכאות
     */
    checkQuotes(content) {
        const singleQuotes = (content.match(/'/g) || []).length;
        const doubleQuotes = (content.match(/"/g) || []).length;
        return singleQuotes % 2 === 0 && doubleQuotes % 2 === 0;
    }

    /**
     * Test dependencies
     * בדיקת תלויות
     */
    async testDependencies() {
        console.log('🔗 Testing dependencies...');
        
        // Check if system-management.html includes all required scripts
        try {
            const systemManagementPath = 'trading-ui/system-management.html';
            if (fs.existsSync(systemManagementPath)) {
                const content = fs.readFileSync(systemManagementPath, 'utf8');
                
                const requiredScripts = [
                    'init-package-registry.js',
                    'init-dependency-graph.js',
                    'init-page-templates.js',
                    'init-feedback-system.js',
                    'smart-app-initializer.js',
                    'smart-script-loader.js',
                    'smart-page-configs.js',
                    'init-performance-optimizer.js',
                    'init-advanced-cache.js',
                    'init-testing-system.js',
                    'init-validator.js',
                    'init-cli.js',
                    'test-runner.js'
                ];

                for (const script of requiredScripts) {
                    const included = content.includes(script);
                    this.addResult(`Dependency: ${script}`, included, included ? 'Included' : 'Missing from system-management.html');
                }
            } else {
                this.addResult('Dependency: system-management.html', false, 'File not found');
            }
        } catch (error) {
            this.addResult('Dependency Check', false, `Error: ${error.message}`);
        }
    }

    /**
     * Test documentation
     * בדיקת תיעוד
     */
    async testDocumentation() {
        console.log('📚 Testing documentation...');
        
        const documentationFiles = [
            'documentation/frontend/SMART_INITIALIZATION_SYSTEM_INDEX.md',
            'documentation/frontend/DEVELOPER_QUICK_START.md',
            'documentation/frontend/BEST_PRACTICES.md',
            'documentation/frontend/TROUBLESHOOTING_GUIDE.md',
            'documentation/frontend/API_REFERENCE.md',
            'documentation/frontend/TESTING_GUIDE.md'
        ];

        for (const file of documentationFiles) {
            try {
                if (fs.existsSync(file)) {
                    const content = fs.readFileSync(file, 'utf8');
                    const hasContent = content.length > 1000; // At least 1000 characters
                    const hasStructure = /^#\s/.test(content); // Has headers
                    
                    this.addResult(`Documentation: ${file}`, hasContent && hasStructure, 
                        hasContent && hasStructure ? 'Complete' : 'Incomplete or missing structure');
                } else {
                    this.addResult(`Documentation: ${file}`, false, 'File not found');
                }
            } catch (error) {
                this.addResult(`Documentation: ${file}`, false, `Error: ${error.message}`);
            }
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
            message: message
        });

        const status = passed ? '✅' : '❌';
        console.log(`${status} ${testName}: ${message}`);
    }

    /**
     * Generate test report
     * יצירת דוח בדיקות
     */
    generateReport() {
        const successRate = ((this.results.passed / this.results.total) * 100).toFixed(1);
        
        console.log('\n📊 QUICK TEST REPORT');
        console.log('====================');
        console.log(`Total Tests: ${this.results.total}`);
        console.log(`Passed: ${this.results.passed} ✅`);
        console.log(`Failed: ${this.results.failed} ❌`);
        console.log(`Success Rate: ${successRate}%`);
        
        if (this.results.failed > 0) {
            console.log('\n❌ FAILED TESTS:');
            this.results.details
                .filter(detail => !detail.passed)
                .forEach(detail => {
                    console.log(`  - ${detail.test}: ${detail.message}`);
                });
        }
        
        console.log('\n🎯 RECOMMENDATIONS:');
        if (successRate >= 90) {
            console.log('  ✅ System is ready for comprehensive testing!');
            console.log('  🚀 You can now run the full test suite in the browser.');
        } else if (successRate >= 70) {
            console.log('  ⚠️  System needs minor fixes before comprehensive testing');
            console.log('  🔧 Fix the failed tests and run again.');
        } else {
            console.log('  ❌ System needs significant fixes before testing');
            console.log('  🛠️  Review and fix the failed tests.');
        }
        
        console.log('\n📋 NEXT STEPS:');
        console.log('  1. Start the server: python3 -m http.server 8080');
        console.log('  2. Open: http://127.0.0.1:8080/trading-ui/system-management.html');
        console.log('  3. Run comprehensive tests in the browser');
        console.log('  4. Check the Testing Guide: documentation/frontend/TESTING_GUIDE.md');
        
        return this.results;
    }
}

// Run tests if called directly
if (require.main === module) {
    const quickTest = new QuickTest();
    quickTest.runQuickTests().then(results => {
        process.exit(results.failed > 0 ? 1 : 0);
    });
}

module.exports = QuickTest;
