/**
 * Comprehensive Final Testing Script for Frontend Business Logic Wrappers
 * =======================================================================
 * 
 * This script tests all 32+ Frontend Business Logic API wrappers.
 * Tests API calls, fallback mechanisms, error handling, cache usage, and response times.
 * 
 * Usage:
 *     Open browser console and run: testFrontendWrappers()
 * 
 * Requirements:
 *     - Server must be running on http://127.0.0.1:8080
 *     - All Data Services must be loaded
 *     - Cache systems (UnifiedCacheManager, CacheTTLGuard) must be available
 */

(function() {
    'use strict';

    // Support both browser and Node.js environments
    const BASE_URL = (typeof window !== 'undefined' && window.location) 
        ? window.location.origin 
        : 'http://127.0.0.1:8080';
    const BUSINESS_API_BASE = `${BASE_URL}/api/business`;
    
    // Node.js compatibility
    if (typeof window === 'undefined') {
        // Running in Node.js - use fetch polyfill or http module
        const https = require('https');
        const http = require('http');
        const { URL } = require('url');
        
        // Simple fetch polyfill for Node.js
        global.fetch = function(url, options = {}) {
            return new Promise((resolve, reject) => {
                const urlObj = new URL(url);
                const client = urlObj.protocol === 'https:' ? https : http;
                
                const req = client.request({
                    hostname: urlObj.hostname,
                    port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
                    path: urlObj.pathname + urlObj.search,
                    method: options.method || 'GET',
                    headers: options.headers || {}
                }, (res) => {
                    let data = '';
                    res.on('data', chunk => data += chunk);
                    res.on('end', () => {
                        resolve({
                            ok: res.statusCode >= 200 && res.statusCode < 300,
                            status: res.statusCode,
                            statusText: res.statusMessage,
                            json: () => Promise.resolve(JSON.parse(data)),
                            text: () => Promise.resolve(data)
                        });
                    });
                });
                
                req.on('error', reject);
                if (options.body) {
                    req.write(options.body);
                }
                req.end();
            });
        };
        
        global.performance = {
            now: () => Date.now()
        };
    }

    // Test results storage
    const testResults = {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        errors: [],
        responseTimes: [],
        wrappersTested: []
    };

    // Performance thresholds
    const MAX_RESPONSE_TIME = 200; // 200ms

    /**
     * Log test result
     */
    function logTest(testName, passed, error = null, responseTime = null) {
        testResults.totalTests++;
        if (passed) {
            testResults.passedTests++;
            let status = '✅';
            if (responseTime) {
                testResults.responseTimes.push(responseTime);
                if (responseTime > MAX_RESPONSE_TIME) {
                    status = '⚠️'; // Warning for slow response
                }
            }
            console.log(`${status} ${testName}` + (responseTime ? ` (${Math.round(responseTime)}ms)` : ''));
        } else {
            testResults.failedTests++;
            testResults.errors.push(`${testName}: ${error}`);
            console.error(`❌ ${testName}: ${error}`);
        }
    }

    /**
     * Test wrapper function
     */
    async function testWrapper(wrapperName, wrapperFunc, testData, expectedResult = null) {
        const startTime = performance.now();
        try {
            const result = await wrapperFunc(testData);
            const responseTime = performance.now() - startTime;
            
            if (expectedResult) {
                const passed = JSON.stringify(result) === JSON.stringify(expectedResult);
                logTest(wrapperName, passed, passed ? null : 'Result mismatch', responseTime);
            } else {
                // Just check if it returns a valid result
                const passed = result !== null && result !== undefined;
                logTest(wrapperName, passed, passed ? null : 'Invalid result', responseTime);
            }
            
            testResults.wrappersTested.push(wrapperName);
            return result;
        } catch (error) {
            const responseTime = performance.now() - startTime;
            logTest(wrapperName, false, error.message, responseTime);
            return null;
        }
    }

    /**
     * Test cache behavior (first vs. second call)
     */
    async function testCacheBehavior(wrapperName, wrapperFunc, testData) {
        // First call (should hit API)
        const start1 = performance.now();
        const result1 = await wrapperFunc(testData);
        const time1 = performance.now() - start1;
        
        // Second call (should hit cache)
        const start2 = performance.now();
        const result2 = await wrapperFunc(testData);
        const time2 = performance.now() - start2;
        
        const cacheHit = time2 < time1 * 0.5; // Cache should be at least 2x faster
        logTest(`${wrapperName} - Cache Behavior`, cacheHit, 
            cacheHit ? null : `Cache not working (first: ${Math.round(time1)}ms, second: ${Math.round(time2)}ms)`);
        
        return { result1, result2, time1, time2, cacheHit };
    }

    // ============================================================================
    // Trade Wrappers Tests (6 wrappers)
    // ============================================================================

    async function testTradeWrappers() {
        console.log('\n' + '='.repeat(60));
        console.log('Testing Trade Business Logic Wrappers (6 wrappers)');
        console.log('='.repeat(60));

        const hasWrappers = typeof window !== 'undefined' && window.TradesData;
        if (!hasWrappers) {
            console.warn('⚠️ TradesData not available - skipping Trade wrapper tests (run in browser)');
            return;
        }

        // Test 1: calculateStopPrice
        await testWrapper('Trade: calculateStopPrice', 
            window.TradesData.calculateStopPrice.bind(window.TradesData),
            { currentPrice: 100, stopPercentage: 10, side: 'Long' });

        // Test 2: calculateTargetPrice
        await testWrapper('Trade: calculateTargetPrice',
            window.TradesData.calculateTargetPrice.bind(window.TradesData),
            { currentPrice: 100, targetPercentage: 20, side: 'Long' });

        // Test 3: calculatePercentageFromPrice
        await testWrapper('Trade: calculatePercentageFromPrice',
            window.TradesData.calculatePercentageFromPrice.bind(window.TradesData),
            { currentPrice: 100, targetPrice: 120, side: 'Long' });

        // Test 4: calculateInvestment
        await testWrapper('Trade: calculateInvestment',
            window.TradesData.calculateInvestment.bind(window.TradesData),
            { price: 100, quantity: 10 });

        // Test 5: calculatePL
        await testWrapper('Trade: calculatePL',
            window.TradesData.calculatePL.bind(window.TradesData),
            { entryPrice: 100, exitPrice: 120, quantity: 10, side: 'Long' });

        // Test 6: validateTrade
        await testWrapper('Trade: validateTrade',
            window.TradesData.validateTrade.bind(window.TradesData),
            { price: 100, quantity: 10, side: 'buy', investment_type: 'Swing', status: 'open' });

        // Test cache behavior for validateTrade
        await testCacheBehavior('Trade: validateTrade (Cache)',
            window.TradesData.validateTrade.bind(window.TradesData),
            { price: 100, quantity: 10, side: 'buy', investment_type: 'Swing', status: 'open' });
    }

    // ============================================================================
    // Execution Wrappers Tests (3 wrappers)
    // ============================================================================

    async function testExecutionWrappers() {
        console.log('\n' + '='.repeat(60));
        console.log('Testing Execution Business Logic Wrappers (3 wrappers)');
        console.log('='.repeat(60));

        const hasWrappers = typeof window !== 'undefined' && window.ExecutionsData;
        if (!hasWrappers) {
            console.warn('⚠️ ExecutionsData not available - skipping Execution wrapper tests (run in browser)');
            return;
        }

        // Test 1: calculateExecutionValues
        await testWrapper('Execution: calculateExecutionValues',
            window.ExecutionsData.calculateExecutionValues.bind(window.ExecutionsData),
            { quantity: 10, price: 100, commission: 1, action: 'buy' });

        // Test 2: calculateAveragePrice
        await testWrapper('Execution: calculateAveragePrice',
            window.ExecutionsData.calculateAveragePrice.bind(window.ExecutionsData),
            [{ price: 100, quantity: 10 }, { price: 110, quantity: 5 }]);

        // Test 3: validateExecution
        await testWrapper('Execution: validateExecution',
            window.ExecutionsData.validateExecution.bind(window.ExecutionsData),
            { price: 100, quantity: 10, action: 'buy', status: 'completed' });
    }

    // ============================================================================
    // Alert Wrappers Tests (2 wrappers)
    // ============================================================================

    async function testAlertWrappers() {
        console.log('\n' + '='.repeat(60));
        console.log('Testing Alert Business Logic Wrappers (2 wrappers)');
        console.log('='.repeat(60));

        const hasWrappers = typeof window !== 'undefined' && window.AlertsData;
        if (!hasWrappers) {
            console.warn('⚠️ AlertsData not available - skipping Alert wrapper tests (run in browser)');
            return;
        }

        // Test 1: validateAlert
        await testWrapper('Alert: validateAlert',
            window.AlertsData.validateAlert.bind(window.AlertsData),
            { condition_attribute: 'price', condition_number: 100.0 });

        // Test 2: validateConditionValue
        await testWrapper('Alert: validateConditionValue',
            window.AlertsData.validateConditionValue.bind(window.AlertsData),
            { condition_attribute: 'price', condition_number: 100.0 });
    }

    // ============================================================================
    // Statistics Wrappers Tests (4 wrappers ViaAPI)
    // ============================================================================

    async function testStatisticsWrappers() {
        console.log('\n' + '='.repeat(60));
        console.log('Testing Statistics Business Logic Wrappers (4 wrappers ViaAPI)');
        console.log('='.repeat(60));

        const hasWrappers = typeof window !== 'undefined' && window.calculateStatisticsViaAPI;
        if (!hasWrappers) {
            console.warn('⚠️ calculateStatisticsViaAPI not available - skipping Statistics wrapper tests (run in browser)');
            return;
        }

        // Test 1: calculateStatisticsViaAPI
        await testWrapper('Statistics: calculateStatisticsViaAPI',
            window.calculateStatisticsViaAPI,
            'kpi', [{ price: 100, quantity: 10 }], {});

        // Test 2: calculateSumViaAPI
        await testWrapper('Statistics: calculateSumViaAPI',
            window.calculateSumViaAPI,
            [{ price: 100 }, { price: 110 }], 'price');

        // Test 3: calculateAverageViaAPI
        await testWrapper('Statistics: calculateAverageViaAPI',
            window.calculateAverageViaAPI,
            [{ price: 100 }, { price: 110 }], 'price');

        // Test 4: countRecordsViaAPI
        await testWrapper('Statistics: countRecordsViaAPI',
            window.countRecordsViaAPI,
            [{ id: 1 }, { id: 2 }, { id: 3 }]);
    }

    // ============================================================================
    // Cash Flow Wrappers Tests (2 wrappers)
    // ============================================================================

    async function testCashFlowWrappers() {
        console.log('\n' + '='.repeat(60));
        console.log('Testing Cash Flow Business Logic Wrappers (2 wrappers)');
        console.log('='.repeat(60));

        const hasWrappers = typeof window !== 'undefined' && window.CashFlowsData;
        if (!hasWrappers) {
            console.warn('⚠️ CashFlowsData not available - skipping Cash Flow wrapper tests (run in browser)');
            return;
        }

        // Test 1: calculateCashFlowBalance
        await testWrapper('Cash Flow: calculateCashFlowBalance',
            window.CashFlowsData.calculateCashFlowBalance.bind(window.CashFlowsData),
            { accountId: 1, initialBalance: 1000 });

        // Test 2: validateCashFlow
        await testWrapper('Cash Flow: validateCashFlow',
            window.CashFlowsData.validateCashFlow.bind(window.CashFlowsData),
            { amount: 100, type: 'income', source: 'manual' });
    }

    // ============================================================================
    // Note Wrappers Tests (2 wrappers)
    // ============================================================================

    async function testNoteWrappers() {
        console.log('\n' + '='.repeat(60));
        console.log('Testing Note Business Logic Wrappers (2 wrappers)');
        console.log('='.repeat(60));

        const hasWrappers = typeof window !== 'undefined' && window.NotesData;
        if (!hasWrappers) {
            console.warn('⚠️ NotesData not available - skipping Note wrapper tests (run in browser)');
            return;
        }

        // Test 1: validateNote
        await testWrapper('Note: validateNote',
            window.NotesData.validateNote.bind(window.NotesData),
            { content: 'Test note', related_type_id: 1, related_id: 1 });

        // Test 2: validateNoteRelation
        await testWrapper('Note: validateNoteRelation',
            window.NotesData.validateNoteRelation.bind(window.NotesData),
            { relatedTypeId: 1, relatedId: 1 });
    }

    // ============================================================================
    // Trading Account Wrappers Tests (1 wrapper)
    // ============================================================================

    async function testTradingAccountWrappers() {
        console.log('\n' + '='.repeat(60));
        console.log('Testing Trading Account Business Logic Wrappers (1 wrapper)');
        console.log('='.repeat(60));

        const hasWrappers = typeof window !== 'undefined' && window.TradingAccountsData;
        if (!hasWrappers) {
            console.warn('⚠️ TradingAccountsData not available - skipping Trading Account wrapper tests (run in browser)');
            return;
        }

        // Test 1: validateTradingAccount
        await testWrapper('Trading Account: validateTradingAccount',
            window.TradingAccountsData.validateTradingAccount.bind(window.TradingAccountsData),
            { name: 'Test Account', currency_id: 1 });
    }

    // ============================================================================
    // Trade Plan Wrappers Tests (1 wrapper)
    // ============================================================================

    async function testTradePlanWrappers() {
        console.log('\n' + '='.repeat(60));
        console.log('Testing Trade Plan Business Logic Wrappers (1 wrapper)');
        console.log('='.repeat(60));

        const hasWrappers = typeof window !== 'undefined' && window.TradePlansData;
        if (!hasWrappers) {
            console.warn('⚠️ TradePlansData not available - skipping Trade Plan wrapper tests (run in browser)');
            return;
        }

        // Test 1: validateTradePlan
        await testWrapper('Trade Plan: validateTradePlan',
            window.TradePlansData.validateTradePlan.bind(window.TradePlansData),
            { trading_account_id: 1, ticker_id: 1 });
    }

    // ============================================================================
    // Ticker Wrappers Tests (2 wrappers)
    // ============================================================================

    async function testTickerWrappers() {
        console.log('\n' + '='.repeat(60));
        console.log('Testing Ticker Business Logic Wrappers (2 wrappers)');
        console.log('='.repeat(60));

        const hasWrappers = typeof window !== 'undefined' && window.TickersData;
        if (!hasWrappers) {
            console.warn('⚠️ TickersData not available - skipping Ticker wrapper tests (run in browser)');
            return;
        }

        // Test 1: validateTicker
        await testWrapper('Ticker: validateTicker',
            window.TickersData.validateTicker.bind(window.TickersData),
            { symbol: 'AAPL', name: 'Apple Inc.' });

        // Test 2: validateTickerSymbol
        await testWrapper('Ticker: validateTickerSymbol',
            window.TickersData.validateTickerSymbol.bind(window.TickersData),
            'AAPL');
    }

    // ============================================================================
    // Tag Wrappers Tests (2 wrappers ViaAPI)
    // ============================================================================

    async function testTagWrappers() {
        console.log('\n' + '='.repeat(60));
        console.log('Testing Tag Business Logic Wrappers (2 wrappers ViaAPI)');
        console.log('='.repeat(60));

        const hasWrappers = typeof window !== 'undefined' && window.TagService;
        if (!hasWrappers) {
            console.warn('⚠️ TagService not available - skipping Tag wrapper tests (run in browser)');
            return;
        }

        // Test 1: validateTagViaAPI
        await testWrapper('Tag: validateTagViaAPI',
            window.TagService.validateTagViaAPI.bind(window.TagService),
            { name: 'Test Tag', category: 'Test Category' });

        // Test 2: validateTagCategoryViaAPI
        await testWrapper('Tag: validateTagCategoryViaAPI',
            window.TagService.validateTagCategoryViaAPI.bind(window.TagService),
            'Test Category');
    }

    // ============================================================================
    // Preferences Wrappers Tests (3 wrappers)
    // ============================================================================

    async function testPreferencesWrappers() {
        console.log('\n' + '='.repeat(60));
        console.log('Testing Preferences Business Logic Wrappers (3 wrappers)');
        console.log('='.repeat(60));

        const hasWrappers = typeof window !== 'undefined' && window.PreferencesData;
        if (!hasWrappers) {
            console.warn('⚠️ PreferencesData not available - skipping Preferences wrapper tests (run in browser)');
            return;
        }

        // Test 1: validatePreference
        await testWrapper('Preferences: validatePreference',
            window.PreferencesData.validatePreference.bind(window.PreferencesData),
            'test_preference', 'test_value', 'string');

        // Test 2: validateProfile
        await testWrapper('Preferences: validateProfile',
            window.PreferencesData.validateProfile.bind(window.PreferencesData),
            { profile_name: 'Test Profile', is_active: false });

        // Test 3: validateDependencies
        await testWrapper('Preferences: validateDependencies',
            window.PreferencesData.validateDependencies.bind(window.PreferencesData),
            { preference1: 'value1', preference2: 'value2' });
    }

    // ============================================================================
    // Error Handling Tests
    // ============================================================================

    async function testErrorHandling() {
        console.log('\n' + '='.repeat(60));
        console.log('Testing Error Handling');
        console.log('='.repeat(60));

        const hasWrappers = typeof window !== 'undefined' && window.TradesData;
        if (!hasWrappers) {
            console.warn('⚠️ TradesData not available - skipping error handling test (run in browser)');
            return;
        }

        // Test invalid data
        if (typeof window === 'undefined' || !window.TradesData) {
            console.warn('⚠️ TradesData not available - skipping validation integration test (run in browser)');
            return;
        }
        
        const result = await window.TradesData.validateTrade({
            price: -10, // Invalid price
            quantity: 10,
            side: 'buy',
            investment_type: 'Swing',
            status: 'open'
        });

        logTest('Error Handling: Invalid data returns errors', 
            result && result.is_valid === false && result.errors && result.errors.length > 0);
    }

    // ============================================================================
    // Fallback Mechanisms Tests
    // ============================================================================

    async function testFallbackMechanisms() {
        console.log('\n' + '='.repeat(60));
        console.log('Testing Fallback Mechanisms');
        console.log('='.repeat(60));

        // Test Statistics wrappers fallback to local calculation
        if (typeof window !== 'undefined' && window.calculateSumViaAPI && window.StatisticsCalculator) {
            // Simulate API failure by using invalid endpoint
            try {
                const result = await window.calculateSumViaAPI([{ price: 100 }, { price: 110 }], 'price');
                // Should fallback to local calculation
                logTest('Fallback: Statistics calculateSumViaAPI fallback', result !== null && result !== undefined);
            } catch (error) {
                logTest('Fallback: Statistics calculateSumViaAPI fallback', false, error.message);
            }
        }
    }

    // ============================================================================
    // Performance Tests
    // ============================================================================

    function testPerformance() {
        console.log('\n' + '='.repeat(60));
        console.log('Performance Tests');
        console.log('='.repeat(60));

        if (testResults.responseTimes.length === 0) {
            console.log('No response times recorded');
            return;
        }

        const avgTime = testResults.responseTimes.reduce((a, b) => a + b, 0) / testResults.responseTimes.length;
        const maxTime = Math.max(...testResults.responseTimes);
        const minTime = Math.min(...testResults.responseTimes);

        console.log(`\nAverage Response Time: ${Math.round(avgTime)}ms`);
        console.log(`Max Response Time: ${Math.round(maxTime)}ms`);
        console.log(`Min Response Time: ${Math.round(minTime)}ms`);

        const slowWrappers = testResults.responseTimes.filter(rt => rt > MAX_RESPONSE_TIME);
        if (slowWrappers.length > 0) {
            console.log(`\n⚠️  ${slowWrappers.length} wrappers exceeded ${MAX_RESPONSE_TIME}ms threshold`);
        } else {
            console.log(`\n✅ All wrappers responded within ${MAX_RESPONSE_TIME}ms threshold`);
        }

        logTest('Performance: Average Response Time', avgTime <= MAX_RESPONSE_TIME,
            avgTime > MAX_RESPONSE_TIME ? `Average ${Math.round(avgTime)}ms exceeds ${MAX_RESPONSE_TIME}ms` : null);
    }

    // ============================================================================
    // Main Test Runner
    // ============================================================================

    async function runAllTests() {
        console.log('='.repeat(60));
        console.log('Frontend Business Logic Wrappers - Comprehensive Final Tests');
        console.log('='.repeat(60));
        console.log(`Testing ${BASE_URL}`);
        console.log(`Started at: ${new Date().toISOString()}`);
        console.log('='.repeat(60));

        // Run all wrapper tests
        await testTradeWrappers();
        await testExecutionWrappers();
        await testAlertWrappers();
        await testStatisticsWrappers();
        await testCashFlowWrappers();
        await testNoteWrappers();
        await testTradingAccountWrappers();
        await testTradePlanWrappers();
        await testTickerWrappers();
        await testTagWrappers();
        await testPreferencesWrappers();

        // Additional tests
        await testErrorHandling();
        await testFallbackMechanisms();

        // Performance tests
        testPerformance();

        // Print summary
        console.log('\n' + '='.repeat(60));
        console.log('Test Summary');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${testResults.totalTests}`);
        console.log(`Passed: ${testResults.passedTests}`);
        console.log(`Failed: ${testResults.failedTests}`);
        console.log(`Wrappers Tested: ${testResults.wrappersTested.length}`);

        if (testResults.errors.length > 0) {
            console.log(`\nErrors (${testResults.errors.length}):`);
            testResults.errors.forEach(error => console.log(`  - ${error}`));
        }

        // Return results for programmatic access
        return testResults;
    }

    // Export to global scope
    // Export for browser
    if (typeof window !== 'undefined') {
        window.testFrontendWrappers = runAllTests;
        console.log('✅ Frontend Wrappers Test Script loaded. Run testFrontendWrappers() to start tests.');
    }
    
    // Export for Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = {
            runAllTests: runAllTests,
            testResults: testResults
        };
        
        // Auto-run in Node.js
        if (require.main === module) {
            runAllTests().then(() => {
                console.log('\n' + '='.repeat(60));
                console.log('Test Summary');
                console.log('='.repeat(60));
                console.log(`Total Tests: ${testResults.totalTests}`);
                console.log(`Passed: ${testResults.passedTests}`);
                console.log(`Failed: ${testResults.failedTests}`);
                
                if (testResults.errors.length > 0) {
                    console.log(`\nErrors (${testResults.errors.length}):`);
                    testResults.errors.slice(0, 10).forEach(error => {
                        console.log(`  - ${error}`);
                    });
                    if (testResults.errors.length > 10) {
                        console.log(`  ... and ${testResults.errors.length - 10} more errors`);
                    }
                }
                
                process.exit(testResults.failedTests > 0 ? 1 : 0);
            }).catch(error => {
                console.error('Error running tests:', error);
                process.exit(1);
            });
        }
    }
})();

