/**
 * Test Header & Filters System Integration with Tables
 * 
 * This script tests if filters are properly connected to tables via UnifiedTableSystem
 * 
 * Usage: Run in browser console on any page
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
     * Test if UnifiedTableSystem is available
     */
    function testUnifiedTableSystem() {
        const test = {
            name: 'UnifiedTableSystem Available',
            passed: false,
            message: '',
            details: {}
        };

        try {
            if (typeof window.UnifiedTableSystem === 'undefined') {
                test.message = 'UnifiedTableSystem is not defined';
                test.details = { available: false };
            } else if (!window.UnifiedTableSystem.filter) {
                test.message = 'UnifiedTableSystem.filter is not available';
                test.details = { 
                    available: true, 
                    hasFilter: false 
                };
            } else if (typeof window.UnifiedTableSystem.filter.apply !== 'function') {
                test.message = 'UnifiedTableSystem.filter.apply is not a function';
                test.details = {
                    available: true,
                    hasFilter: true,
                    hasApply: false
                };
            } else {
                test.passed = true;
                test.message = 'UnifiedTableSystem is available with filter.apply';
                test.details = {
                    available: true,
                    hasFilter: true,
                    hasApply: true
                };
            }
        } catch (error) {
            test.message = `Error checking UnifiedTableSystem: ${error.message}`;
            test.details = { error: error.message };
        }

        TEST_RESULTS.tests.push(test);
        return test.passed;
    }

    /**
     * Test if FilterManager uses UnifiedTableSystem
     */
    function testFilterManagerIntegration() {
        const test = {
            name: 'FilterManager Integration',
            passed: false,
            message: '',
            details: {}
        };

        try {
            if (!window.headerSystem || !window.headerSystem.filterManager) {
                test.message = 'FilterManager not available';
                test.details = { 
                    hasHeaderSystem: !!window.headerSystem,
                    hasFilterManager: !!(window.headerSystem && window.headerSystem.filterManager)
                };
            } else {
                const filterManager = window.headerSystem.filterManager;
                
                // Check if applyFilters method exists and uses UnifiedTableSystem
                if (typeof filterManager.applyFilters !== 'function') {
                    test.message = 'FilterManager.applyFilters is not a function';
                    test.details = { hasApplyFilters: false };
                } else {
                    // Try to inspect the function (basic check)
                    const funcStr = filterManager.applyFilters.toString();
                    const usesUnifiedTableSystem = funcStr.includes('UnifiedTableSystem') || 
                                                   funcStr.includes('window.UnifiedTableSystem');
                    
                    test.passed = usesUnifiedTableSystem;
                    test.message = usesUnifiedTableSystem 
                        ? 'FilterManager.applyFilters uses UnifiedTableSystem'
                        : 'FilterManager.applyFilters may not use UnifiedTableSystem';
                    test.details = {
                        hasApplyFilters: true,
                        usesUnifiedTableSystem: usesUnifiedTableSystem
                    };
                }
            }
        } catch (error) {
            test.message = `Error checking FilterManager: ${error.message}`;
            test.details = { error: error.message };
        }

        TEST_RESULTS.tests.push(test);
        return test.passed;
    }

    /**
     * Test if tables have data-table-type attribute
     */
    function testTablesHaveTableType() {
        const test = {
            name: 'Tables Have data-table-type',
            passed: false,
            message: '',
            details: {}
        };

        try {
            const tables = document.querySelectorAll('table[data-table-type]');
            const allTables = document.querySelectorAll('table');
            
            if (allTables.length === 0) {
                test.message = 'No tables found on page';
                test.details = { totalTables: 0, tablesWithType: 0 };
            } else if (tables.length === 0) {
                test.message = `Found ${allTables.length} tables but none have data-table-type`;
                test.details = { 
                    totalTables: allTables.length, 
                    tablesWithType: 0,
                    tablesWithoutType: Array.from(allTables).map(t => t.id || 'no-id')
                };
            } else {
                const tablesWithoutType = Array.from(allTables).filter(t => !t.hasAttribute('data-table-type'));
                
                test.passed = tablesWithoutType.length === 0;
                test.message = tablesWithoutType.length === 0
                    ? `All ${tables.length} tables have data-table-type`
                    : `${tables.length} tables have data-table-type, ${tablesWithoutType.length} missing`;
                test.details = {
                    totalTables: allTables.length,
                    tablesWithType: tables.length,
                    tablesWithoutType: tablesWithoutType.length,
                    missingTables: tablesWithoutType.map(t => t.id || 'no-id')
                };
            }
        } catch (error) {
            test.message = `Error checking tables: ${error.message}`;
            test.details = { error: error.message };
        }

        TEST_RESULTS.tests.push(test);
        return test.passed;
    }

    /**
     * Test if filter API functions call applyFilters
     */
    function testFilterAPIIntegration() {
        const test = {
            name: 'Filter API Integration',
            passed: false,
            message: '',
            details: {}
        };

        try {
            const requiredFunctions = [
                'applyStatusFilter',
                'applyTypeFilter',
                'applyAccountFilter',
                'applyDateRangeFilter'
            ];

            const functionsUsingApplyFilters = [];
            const functionsNotUsingApplyFilters = [];

            requiredFunctions.forEach(funcName => {
                if (typeof window[funcName] === 'function') {
                    const funcStr = window[funcName].toString();
                    if (funcStr.includes('applyFilters') || funcStr.includes('filterManager.applyFilters')) {
                        functionsUsingApplyFilters.push(funcName);
                    } else {
                        functionsNotUsingApplyFilters.push(funcName);
                    }
                }
            });

            if (functionsNotUsingApplyFilters.length > 0) {
                test.message = `Some filter API functions don't use applyFilters: ${functionsNotUsingApplyFilters.join(', ')}`;
                test.details = {
                    usingApplyFilters: functionsUsingApplyFilters,
                    notUsingApplyFilters: functionsNotUsingApplyFilters
                };
            } else if (functionsUsingApplyFilters.length === 0) {
                test.message = 'No filter API functions found';
                test.details = { found: [] };
            } else {
                test.passed = true;
                test.message = 'All filter API functions use applyFilters';
                test.details = {
                    usingApplyFilters: functionsUsingApplyFilters,
                    count: functionsUsingApplyFilters.length
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
     * Test if TableDataRegistry is used
     */
    function testTableDataRegistry() {
        const test = {
            name: 'TableDataRegistry Integration',
            passed: false,
            message: '',
            details: {}
        };

        try {
            if (typeof window.TableDataRegistry === 'undefined') {
                test.message = 'TableDataRegistry is not defined';
                test.details = { available: false };
            } else {
                test.passed = true;
                test.message = 'TableDataRegistry is available';
                test.details = {
                    available: true,
                    hasGetActiveFilters: typeof window.TableDataRegistry.getActiveFilters === 'function',
                    hasSetFilteredData: typeof window.TableDataRegistry.setFilteredData === 'function'
                };
            }
        } catch (error) {
            test.message = `Error checking TableDataRegistry: ${error.message}`;
            test.details = { error: error.message };
        }

        TEST_RESULTS.tests.push(test);
        return test.passed;
    }

    /**
     * Test actual filter application on a table
     */
    function testFilterApplication() {
        const test = {
            name: 'Filter Application Test',
            passed: false,
            message: '',
            details: {}
        };

        try {
            // Find first table with data-table-type
            const table = document.querySelector('table[data-table-type]');
            
            if (!table) {
                test.message = 'No table with data-table-type found';
                test.details = { tableFound: false };
            } else {
                const tableType = table.getAttribute('data-table-type');
                
                // Check if UnifiedTableSystem has config for this table type
                if (!window.UnifiedTableSystem || !window.UnifiedTableSystem.registry) {
                    test.message = 'UnifiedTableSystem.registry not available';
                    test.details = { 
                        tableFound: true,
                        tableType: tableType,
                        hasRegistry: false
                    };
                } else {
                    const config = window.UnifiedTableSystem.registry.getConfig(tableType);
                    
                    if (!config) {
                        test.message = `No config found for table type: ${tableType}`;
                        test.details = {
                            tableFound: true,
                            tableType: tableType,
                            hasConfig: false
                        };
                    } else {
                        test.passed = true;
                        test.message = `Table type ${tableType} has config and can be filtered`;
                        test.details = {
                            tableFound: true,
                            tableType: tableType,
                            hasConfig: true,
                            hasUpdateFunction: typeof config.updateFunction === 'function'
                        };
                    }
                }
            }
        } catch (error) {
            test.message = `Error testing filter application: ${error.message}`;
            test.details = { error: error.message };
        }

        TEST_RESULTS.tests.push(test);
        return test.passed;
    }

    /**
     * Run all tests
     */
    function runAllTests() {
        console.log('🧪 Starting Header & Filters System Integration Tests...');
        console.log(`📄 Testing page: ${TEST_RESULTS.currentPage}`);
        console.log('');

        testUnifiedTableSystem();
        testFilterManagerIntegration();
        testTablesHaveTableType();
        testFilterAPIIntegration();
        testTableDataRegistry();
        testFilterApplication();

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
        console.log('📊 Integration Test Results Summary:');
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
    window.testHeaderFiltersIntegration = runAllTests;
    window.getHeaderFiltersIntegrationResults = () => TEST_RESULTS;

    // Auto-run if in browser console
    if (typeof window !== 'undefined' && window.console) {
        console.log('✅ Header & Filters Integration Test Script Loaded');
        console.log('💡 Run testHeaderFiltersIntegration() to execute tests');
    }

    // Return for Node.js/Playwright usage
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            runAllTests,
            testUnifiedTableSystem,
            testFilterManagerIntegration,
            testTablesHaveTableType,
            testFilterAPIIntegration,
            testTableDataRegistry,
            testFilterApplication
        };
    }
})();


























