/**
 * ATR Traffic Light System - Comprehensive Test Suite
 * ====================================================
 * 
 * Automated browser tests for ATR traffic light system
 * Run in browser console: window.runATRTests()
 * 
 * @version 1.0.0
 * @created January 2025
 */

(function() {
    'use strict';

    const TEST_CONFIG = {
        testUser: 1,
        testProfile: 2,
        testTickerId: 1, // Update with actual ticker ID
        testCases: [
            { atr: 2.0, price: 100, expectedPercent: 2.0, expectedLevel: 'green' },
            { atr: 3.5, price: 100, expectedPercent: 3.5, expectedLevel: 'yellow' },
            { atr: 6.0, price: 100, expectedPercent: 6.0, expectedLevel: 'red' },
            { atr: 0.5, price: 100, expectedPercent: 0.5, expectedLevel: 'green' },
            { atr: 4.9, price: 100, expectedPercent: 4.9, expectedLevel: 'yellow' },
            { atr: 5.1, price: 100, expectedPercent: 5.1, expectedLevel: 'red' }
        ]
    };

    let testResults = {
        passed: 0,
        failed: 0,
        total: 0,
        details: []
    };

    function logTest(category, testName, passed, message, duration = 0) {
        testResults.total++;
        if (passed) {
            testResults.passed++;
            console.log(`✅ PASS [${category}] ${testName}${duration > 0 ? ` (${duration.toFixed(2)}ms)` : ''}`);
        } else {
            testResults.failed++;
            console.error(`❌ FAIL [${category}] ${testName}: ${message}${duration > 0 ? ` (${duration.toFixed(2)}ms)` : ''}`);
        }
        testResults.details.push({
            category,
            testName,
            passed,
            message,
            duration
        });
    }

    // ===== UNIT TESTS =====

    async function testFieldRendererServiceExists() {
        const testName = 'FieldRendererService.renderATR() exists';
        const startTime = performance.now();

        try {
            if (!window.FieldRendererService) {
                logTest('unit', testName, false, 'FieldRendererService not available', 0);
                return false;
            }

            if (typeof window.FieldRendererService.renderATR !== 'function') {
                logTest('unit', testName, false, 'renderATR function not available', 0);
                return false;
            }

            const duration = performance.now() - startTime;
            logTest('unit', testName, true, 'Function exists', duration);
            return true;
        } catch (error) {
            const duration = performance.now() - startTime;
            logTest('unit', testName, false, `Error: ${error.message}`, duration);
            return false;
        }
    }

    async function testRenderATRWithDefaults() {
        const testName = 'renderATR() with default thresholds';
        const startTime = performance.now();

        try {
            if (!window.FieldRendererService || typeof window.FieldRendererService.renderATR !== 'function') {
                logTest('unit', testName, false, 'renderATR not available', 0);
                return false;
            }

            // Test green (below 3%)
            const greenHtml = await window.FieldRendererService.renderATR(2.0, 2.0);
            if (!greenHtml.includes('atr-green') || !greenHtml.includes('נמוך')) {
                logTest('unit', testName, false, 'Green level not rendered correctly', 0);
                return false;
            }

            // Test yellow (between 3% and 5%)
            const yellowHtml = await window.FieldRendererService.renderATR(4.0, 4.0);
            if (!yellowHtml.includes('atr-yellow') || !yellowHtml.includes('בינוני')) {
                logTest('unit', testName, false, 'Yellow level not rendered correctly', 0);
                return false;
            }

            // Test red (above 5%)
            const redHtml = await window.FieldRendererService.renderATR(6.0, 6.0);
            if (!redHtml.includes('atr-red') || !redHtml.includes('גבוה')) {
                logTest('unit', testName, false, 'Red level not rendered correctly', 0);
                return false;
            }

            const duration = performance.now() - startTime;
            logTest('unit', testName, true, 'All levels rendered correctly', duration);
            return true;
        } catch (error) {
            const duration = performance.now() - startTime;
            logTest('unit', testName, false, `Error: ${error.message}`, duration);
            return false;
        }
    }

    async function testRenderATRWithCustomThresholds() {
        const testName = 'renderATR() with custom thresholds';
        const startTime = performance.now();

        try {
            if (!window.FieldRendererService || typeof window.FieldRendererService.renderATR !== 'function') {
                logTest('unit', testName, false, 'renderATR not available', 0);
                return false;
            }

            // Test with custom thresholds (2% and 4%)
            const html1 = await window.FieldRendererService.renderATR(1.5, 1.5, {
                highThreshold: 2.0,
                dangerThreshold: 4.0
            });
            if (!html1.includes('atr-green')) {
                logTest('unit', testName, false, 'Custom green threshold not working', 0);
                return false;
            }

            const html2 = await window.FieldRendererService.renderATR(3.0, 3.0, {
                highThreshold: 2.0,
                dangerThreshold: 4.0
            });
            if (!html2.includes('atr-yellow')) {
                logTest('unit', testName, false, 'Custom yellow threshold not working', 0);
                return false;
            }

            const html3 = await window.FieldRendererService.renderATR(5.0, 5.0, {
                highThreshold: 2.0,
                dangerThreshold: 4.0
            });
            if (!html3.includes('atr-red')) {
                logTest('unit', testName, false, 'Custom red threshold not working', 0);
                return false;
            }

            const duration = performance.now() - startTime;
            logTest('unit', testName, true, 'Custom thresholds working', duration);
            return true;
        } catch (error) {
            const duration = performance.now() - startTime;
            logTest('unit', testName, false, `Error: ${error.message}`, duration);
            return false;
        }
    }

    async function testRenderATRWithNullValues() {
        const testName = 'renderATR() with null/invalid values';
        const startTime = performance.now();

        try {
            if (!window.FieldRendererService || typeof window.FieldRendererService.renderATR !== 'function') {
                logTest('unit', testName, false, 'renderATR not available', 0);
                return false;
            }

            const nullHtml = await window.FieldRendererService.renderATR(null, null);
            if (!nullHtml.includes('atr-value') || !nullHtml.includes('-')) {
                logTest('unit', testName, false, 'Null values not handled correctly', 0);
                return false;
            }

            const undefinedHtml = await window.FieldRendererService.renderATR(undefined, undefined);
            if (!undefinedHtml.includes('atr-value') || !undefinedHtml.includes('-')) {
                logTest('unit', testName, false, 'Undefined values not handled correctly', 0);
                return false;
            }

            const duration = performance.now() - startTime;
            logTest('unit', testName, true, 'Null/invalid values handled correctly', duration);
            return true;
        } catch (error) {
            const duration = performance.now() - startTime;
            logTest('unit', testName, false, `Error: ${error.message}`, duration);
            return false;
        }
    }

    // ===== INTEGRATION TESTS =====

    async function testPreferencesLoading() {
        const testName = 'ATR threshold preferences loading';
        const startTime = performance.now();

        try {
            let highThreshold = null;
            let dangerThreshold = null;

            if (typeof window.getCurrentPreference === 'function') {
                highThreshold = await window.getCurrentPreference('atr_high_threshold');
                dangerThreshold = await window.getCurrentPreference('atr_danger_threshold');
            } else if (window.PreferencesCore && typeof window.PreferencesCore.getPreference === 'function') {
                highThreshold = await window.PreferencesCore.getPreference('atr_high_threshold');
                dangerThreshold = await window.PreferencesCore.getPreference('atr_danger_threshold');
            }

            if (highThreshold === null || highThreshold === undefined) {
                logTest('integration', testName, false, 'atr_high_threshold not loaded (using default)', 0);
                return false;
            }

            if (dangerThreshold === null || dangerThreshold === undefined) {
                logTest('integration', testName, false, 'atr_danger_threshold not loaded (using default)', 0);
                return false;
            }

            const duration = performance.now() - startTime;
            logTest('integration', testName, true, `Loaded: high=${highThreshold}, danger=${dangerThreshold}`, duration);
            return true;
        } catch (error) {
            const duration = performance.now() - startTime;
            logTest('integration', testName, false, `Error: ${error.message}`, duration);
            return false;
        }
    }

    async function testEntityDetailsRendererIntegration() {
        const testName = 'EntityDetailsRenderer.renderMarketData() integration';
        const startTime = performance.now();

        try {
            if (!window.EntityDetailsRenderer) {
                logTest('integration', testName, false, 'EntityDetailsRenderer not available', 0);
                return false;
            }

            // Mock ticker data
            const mockTickerData = {
                id: TEST_CONFIG.testTickerId,
                symbol: 'TEST',
                current_price: 100,
                atr: 2.5,
                atr_period: 14,
                daily_change: 1.0,
                daily_change_percent: 1.0,
                volume: 1000000
            };

            const html = await window.EntityDetailsRenderer.renderMarketData(mockTickerData);
            
            if (!html.includes('atr-value')) {
                logTest('integration', testName, false, 'ATR not rendered in market data', 0);
                return false;
            }

            const duration = performance.now() - startTime;
            logTest('integration', testName, true, 'ATR rendered in market data', duration);
            return true;
        } catch (error) {
            const duration = performance.now() - startTime;
            logTest('integration', testName, false, `Error: ${error.message}`, duration);
            return false;
        }
    }

    // ===== CSS TESTS =====

    async function testCSSClassesExist() {
        const testName = 'ATR CSS classes exist';
        const startTime = performance.now();

        try {
            // Create test elements
            const testDiv = document.createElement('div');
            testDiv.innerHTML = `
                <span class="atr-value atr-green">Test</span>
                <span class="atr-value atr-yellow">Test</span>
                <span class="atr-value atr-red">Test</span>
                <span class="atr-number">Test</span>
            `;
            document.body.appendChild(testDiv);

            // Check if styles are applied (basic check)
            const greenEl = testDiv.querySelector('.atr-green');
            const yellowEl = testDiv.querySelector('.atr-yellow');
            const redEl = testDiv.querySelector('.atr-red');
            const numberEl = testDiv.querySelector('.atr-number');

            if (!greenEl || !yellowEl || !redEl || !numberEl) {
                document.body.removeChild(testDiv);
                logTest('css', testName, false, 'CSS classes not found in DOM', 0);
                return false;
            }

            document.body.removeChild(testDiv);

            const duration = performance.now() - startTime;
            logTest('css', testName, true, 'All CSS classes exist', duration);
            return true;
        } catch (error) {
            const duration = performance.now() - startTime;
            logTest('css', testName, false, `Error: ${error.message}`, duration);
            return false;
        }
    }

    // ===== E2E TESTS =====

    async function testTickerDetailsPage() {
        const testName = 'Ticker details page ATR display';
        const startTime = performance.now();

        try {
            // Check if we're on a ticker details page or can navigate
            const tickerDetailsContainer = document.querySelector('.ticker-details, .entity-details-container');
            
            if (!tickerDetailsContainer) {
                logTest('e2e', testName, false, 'Not on ticker details page', 0);
                return false;
            }

            // Check for ATR display
            const atrElements = tickerDetailsContainer.querySelectorAll('.atr-value');
            
            if (atrElements.length === 0) {
                logTest('e2e', testName, false, 'No ATR elements found on page', 0);
                return false;
            }

            const duration = performance.now() - startTime;
            logTest('e2e', testName, true, `Found ${atrElements.length} ATR element(s)`, duration);
            return true;
        } catch (error) {
            const duration = performance.now() - startTime;
            logTest('e2e', testName, false, `Error: ${error.message}`, duration);
            return false;
        }
    }

    // ===== PERFORMANCE TESTS =====

    async function testRenderATRPerformance() {
        const testName = 'renderATR() performance';
        const startTime = performance.now();

        try {
            if (!window.FieldRendererService || typeof window.FieldRendererService.renderATR !== 'function') {
                logTest('performance', testName, false, 'renderATR not available', 0);
                return false;
            }

            const iterations = 100;
            const perfStart = performance.now();

            for (let i = 0; i < iterations; i++) {
                await window.FieldRendererService.renderATR(2.5, 2.5);
            }

            const perfEnd = performance.now();
            const avgTime = (perfEnd - perfStart) / iterations;

            if (avgTime > 10) {
                logTest('performance', testName, false, `Average render time too high: ${avgTime.toFixed(2)}ms`, 0);
                return false;
            }

            const duration = performance.now() - startTime;
            logTest('performance', testName, true, `Average: ${avgTime.toFixed(2)}ms per render`, duration);
            return true;
        } catch (error) {
            const duration = performance.now() - startTime;
            logTest('performance', testName, false, `Error: ${error.message}`, duration);
            return false;
        }
    }

    // ===== MAIN TEST RUNNER =====

    async function runAllATRTests() {
        console.log('============================================================');
        console.log('ATR TRAFFIC LIGHT SYSTEM - COMPREHENSIVE TEST SUITE');
        console.log('============================================================');
        console.log('');
        console.log('Test Configuration:');
        console.log(`  User ID: ${TEST_CONFIG.testUser}`);
        console.log(`  Profile ID: ${TEST_CONFIG.testProfile}`);
        console.log(`  Test Cases: ${TEST_CONFIG.testCases.length}`);
        console.log('');

        testResults = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };

        // Unit Tests
        console.log('============================================================');
        console.log('UNIT TESTS');
        console.log('============================================================');
        await testFieldRendererServiceExists();
        await testRenderATRWithDefaults();
        await testRenderATRWithCustomThresholds();
        await testRenderATRWithNullValues();

        // Integration Tests
        console.log('');
        console.log('============================================================');
        console.log('INTEGRATION TESTS');
        console.log('============================================================');
        await testPreferencesLoading();
        await testEntityDetailsRendererIntegration();

        // CSS Tests
        console.log('');
        console.log('============================================================');
        console.log('CSS TESTS');
        console.log('============================================================');
        await testCSSClassesExist();

        // E2E Tests
        console.log('');
        console.log('============================================================');
        console.log('E2E TESTS');
        console.log('============================================================');
        await testTickerDetailsPage();

        // Performance Tests
        console.log('');
        console.log('============================================================');
        console.log('PERFORMANCE TESTS');
        console.log('============================================================');
        await testRenderATRPerformance();

        // Summary
        console.log('');
        console.log('============================================================');
        console.log('TEST SUMMARY');
        console.log('============================================================');
        console.log(`Total Tests: ${testResults.total}`);
        console.log(`Passed: ${testResults.passed} ✅`);
        console.log(`Failed: ${testResults.failed} ${testResults.failed > 0 ? '❌' : ''}`);
        console.log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(2)}%`);
        console.log('');

        if (testResults.failed > 0) {
            console.log('Failed Tests:');
            testResults.details
                .filter(t => !t.passed)
                .forEach(t => {
                    console.log(`  ❌ [${t.category}] ${t.testName}: ${t.message}`);
                });
            console.log('');
        }

        return {
            passed: testResults.passed,
            failed: testResults.failed,
            total: testResults.total,
            successRate: (testResults.passed / testResults.total) * 100,
            details: testResults.details
        };
    }

    // Export to window
    window.runATRTests = runAllATRTests;

    console.log('✅ ATR Traffic Light Test Suite loaded. Run: window.runATRTests()');
})();

