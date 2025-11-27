/**
 * Automated Browser Testing Script for Header & Filters System
 * 
 * This script tests all pages to ensure they properly use the Header System
 * 
 * Usage: Run in browser console on any page, or use with Playwright/Puppeteer
 * 
 * @version 1.0.0
 * @created 2025-11-26
 */

(function() {
    'use strict';

    const TEST_RESULTS = {
        timestamp: new Date().toISOString(),
        currentPage: window.location.pathname,
        tests: []
    };

    /**
     * Test if HeaderSystem is loaded
     */
    function testHeaderSystemLoaded() {
        const test = {
            name: 'HeaderSystem Loaded',
            passed: false,
            message: '',
            details: {}
        };

        try {
            if (typeof window.HeaderSystem === 'undefined') {
                test.message = 'HeaderSystem is not defined';
                test.details = { available: false };
            } else if (typeof window.HeaderSystem.initialize !== 'function') {
                test.message = 'HeaderSystem.initialize is not a function';
                test.details = { 
                    available: true, 
                    hasInitialize: false 
                };
            } else {
                test.passed = true;
                test.message = 'HeaderSystem is loaded and has initialize method';
                test.details = {
                    available: true,
                    hasInitialize: true,
                    version: window.HeaderSystem.version || 'unknown'
                };
            }
        } catch (error) {
            test.message = `Error checking HeaderSystem: ${error.message}`;
            test.details = { error: error.message };
        }

        TEST_RESULTS.tests.push(test);
        return test.passed;
    }

    /**
     * Test if unified-header element exists
     */
    function testUnifiedHeaderElement() {
        const test = {
            name: 'Unified Header Element',
            passed: false,
            message: '',
            details: {}
        };

        try {
            const headerElement = document.getElementById('unified-header');
            
            if (!headerElement) {
                test.message = '#unified-header element not found';
                test.details = { exists: false };
            } else {
                test.passed = true;
                test.message = '#unified-header element exists';
                test.details = {
                    exists: true,
                    hasContent: headerElement.innerHTML.trim().length > 0,
                    isVisible: headerElement.offsetParent !== null
                };
            }
        } catch (error) {
            test.message = `Error checking unified-header: ${error.message}`;
            test.details = { error: error.message };
        }

        TEST_RESULTS.tests.push(test);
        return test.passed;
    }

    /**
     * Test if headerSystem instance exists
     */
    function testHeaderSystemInstance() {
        const test = {
            name: 'HeaderSystem Instance',
            passed: false,
            message: '',
            details: {}
        };

        try {
            if (!window.headerSystem) {
                test.message = 'window.headerSystem instance not found';
                test.details = { exists: false };
            } else {
                test.passed = true;
                test.message = 'window.headerSystem instance exists';
                test.details = {
                    exists: true,
                    isInitialized: window.headerSystem.isInitialized || false,
                    hasFilterManager: !!window.headerSystem.filterManager,
                    hasMenuManager: !!window.headerSystem.menuManager
                };
            }
        } catch (error) {
            test.message = `Error checking headerSystem instance: ${error.message}`;
            test.details = { error: error.message };
        }

        TEST_RESULTS.tests.push(test);
        return test.passed;
    }

    /**
     * Test if filter system is available
     */
    function testFilterSystem() {
        const test = {
            name: 'Filter System',
            passed: false,
            message: '',
            details: {}
        };

        try {
            const hasFilterSystem = typeof window.filterSystem !== 'undefined';
            const hasFilterManager = window.headerSystem && window.headerSystem.filterManager;

            if (!hasFilterSystem && !hasFilterManager) {
                test.message = 'Filter system not available';
                test.details = { 
                    hasFilterSystem,
                    hasFilterManager 
                };
            } else {
                test.passed = true;
                test.message = 'Filter system is available';
                test.details = {
                    hasFilterSystem,
                    hasFilterManager,
                    hasApplyFilters: hasFilterManager && typeof window.headerSystem.filterManager.applyFilters === 'function'
                };
            }
        } catch (error) {
            test.message = `Error checking filter system: ${error.message}`;
            test.details = { error: error.message };
        }

        TEST_RESULTS.tests.push(test);
        return test.passed;
    }

    /**
     * Test if header filters element exists
     */
    function testHeaderFiltersElement() {
        const test = {
            name: 'Header Filters Element',
            passed: false,
            message: '',
            details: {}
        };

        try {
            const filtersElement = document.getElementById('headerFilters');
            const headerFilters = document.querySelector('.header-filters');

            if (!filtersElement && !headerFilters) {
                test.message = 'Header filters element not found';
                test.details = { 
                    hasId: false,
                    hasClass: false 
                };
            } else {
                test.passed = true;
                test.message = 'Header filters element exists';
                test.details = {
                    hasId: !!filtersElement,
                    hasClass: !!headerFilters,
                    isVisible: (filtersElement || headerFilters)?.offsetParent !== null
                };
            }
        } catch (error) {
            test.message = `Error checking header filters: ${error.message}`;
            test.details = { error: error.message };
        }

        TEST_RESULTS.tests.push(test);
        return test.passed;
    }

    /**
     * Test filter toggle functionality
     */
    function testFilterToggle() {
        const test = {
            name: 'Filter Toggle Function',
            passed: false,
            message: '',
            details: {}
        };

        try {
            const hasToggleFunction = typeof window.toggleHeaderFilters === 'function';
            
            if (!hasToggleFunction) {
                test.message = 'toggleHeaderFilters function not found';
                test.details = { exists: false };
            } else {
                test.passed = true;
                test.message = 'toggleHeaderFilters function exists';
                test.details = { exists: true };
            }
        } catch (error) {
            test.message = `Error checking filter toggle: ${error.message}`;
            test.details = { error: error.message };
        }

        TEST_RESULTS.tests.push(test);
        return test.passed;
    }

    /**
     * Test filter API functions
     */
    function testFilterAPIFunctions() {
        const test = {
            name: 'Filter API Functions',
            passed: false,
            message: '',
            details: {}
        };

        try {
            const requiredFunctions = [
                'selectStatusOption',
                'selectTypeOption',
                'selectAccountOption',
                'selectDateRangeOption',
                'applyStatusFilter',
                'applyTypeFilter',
                'applyAccountFilter',
                'applyDateRangeFilter'
            ];

            const missingFunctions = [];
            const availableFunctions = [];

            requiredFunctions.forEach(funcName => {
                if (typeof window[funcName] === 'function') {
                    availableFunctions.push(funcName);
                } else {
                    missingFunctions.push(funcName);
                }
            });

            if (missingFunctions.length > 0) {
                test.message = `Missing filter API functions: ${missingFunctions.join(', ')}`;
                test.details = {
                    available: availableFunctions,
                    missing: missingFunctions
                };
            } else {
                test.passed = true;
                test.message = 'All filter API functions are available';
                test.details = {
                    available: availableFunctions,
                    count: availableFunctions.length
                };
            }
        } catch (error) {
            test.message = `Error checking filter API: ${error.message}`;
            test.details = { error: error.message };
        }

        TEST_RESULTS.tests.push(test);
        return test.passed;
    }

    /**
     * Run all tests
     */
    function runAllTests() {
        console.log('🧪 Starting Header & Filters System Tests...');
        console.log(`📄 Testing page: ${TEST_RESULTS.currentPage}`);
        console.log('');

        testHeaderSystemLoaded();
        testUnifiedHeaderElement();
        testHeaderSystemInstance();
        testFilterSystem();
        testHeaderFiltersElement();
        testFilterToggle();
        testFilterAPIFunctions();

        // Calculate summary
        const passed = TEST_RESULTS.tests.filter(t => t.passed).length;
        const total = TEST_RESULTS.tests.length;
        const failed = total - passed;

        TEST_RESULTS.summary = {
            total,
            passed,
            failed,
            percentage: Math.round((passed / total) * 100)
        };

        // Display results
        console.log('📊 Test Results Summary:');
        console.log(`   Total: ${total}`);
        console.log(`   Passed: ${passed} ✅`);
        console.log(`   Failed: ${failed} ❌`);
        console.log(`   Success Rate: ${TEST_RESULTS.summary.percentage}%`);
        console.log('');

        console.log('📋 Detailed Results:');
        TEST_RESULTS.tests.forEach((test, index) => {
            const icon = test.passed ? '✅' : '❌';
            console.log(`${index + 1}. ${icon} ${test.name}: ${test.message}`);
            if (Object.keys(test.details).length > 0) {
                console.log(`   Details:`, test.details);
            }
        });

        return TEST_RESULTS;
    }

    // Export to window for use in browser console
    window.testHeaderSystem = runAllTests;
    window.getHeaderSystemTestResults = () => TEST_RESULTS;

    // Auto-run if in browser console
    if (typeof window !== 'undefined' && window.console) {
        console.log('✅ Header System Test Script Loaded');
        console.log('💡 Run testHeaderSystem() to execute tests');
    }

    // Return for Node.js/Playwright usage
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            runAllTests,
            testHeaderSystemLoaded,
            testUnifiedHeaderElement,
            testHeaderSystemInstance,
            testFilterSystem,
            testHeaderFiltersElement,
            testFilterToggle,
            testFilterAPIFunctions
        };
    }
})();




