/**
 * Integration Tests for Business Logic API - Frontend
 * ===================================================
 * 
 * Comprehensive integration tests for Business Logic API from frontend perspective.
 * Tests frontend wrappers, error handling, cache integration, and end-to-end flows.
 * 
 * @version 1.0.0
 * @created November 2025
 * @author TikTrack Development Team
 * 
 * Usage:
 *   Load this script in a test page or run via test runner.
 *   Requires server to be running on http://127.0.0.1:8080
 */

(function() {
  'use strict';

  const testResults = {
    frontendWrappers: { passed: 0, failed: 0, tests: [] },
    errorHandling: { passed: 0, failed: 0, tests: [] },
    cacheIntegration: { passed: 0, failed: 0, tests: [] },
    endToEnd: { passed: 0, failed: 0, tests: [] },
    summary: { total: 0, passed: 0, failed: 0 }
  };

  const BASE_URL = window.location.origin || 'http://127.0.0.1:8080';
  const API_BASE = `${BASE_URL}/api`;
  const BUSINESS_API_BASE = `${API_BASE}/business`;

  /**
   * Test helper functions
   */
  function test(name, condition, details = {}) {
    const passed = !!condition;
    const testResult = {
      name,
      passed,
      details,
      timestamp: Date.now()
    };
    
    if (passed) {
      testResults.summary.passed++;
    } else {
      testResults.summary.failed++;
      console.error(`❌ FAILED: ${name}`, details);
    }
    
    testResults.summary.total++;
    return testResult;
  }

  function addTestResult(category, testResult) {
    testResults[category].tests.push(testResult);
    if (testResult.passed) {
      testResults[category].passed++;
    } else {
      testResults[category].failed++;
    }
  }

  /**
   * Test API endpoint
   */
  async function testApiEndpoint(method, url, data = null, expectedStatus = 200) {
    try {
      const options = {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
      }
      
      const startTime = Date.now();
      const response = await fetch(url, options);
      const responseTime = Date.now() - startTime;
      
      let responseData = null;
      try {
        responseData = await response.json();
      } catch (e) {
        responseData = await response.text();
      }
      
      return {
        status: response.status === expectedStatus ? 'success' : 'error',
        statusCode: response.status,
        data: responseData,
        responseTime,
        error: response.status !== expectedStatus ? `Expected ${expectedStatus}, got ${response.status}` : null
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        responseTime: null
      };
    }
  }

  /**
   * Test Frontend Wrappers
   */
  async function testFrontendWrappers() {
    console.log('\n🔍 Testing Frontend Wrappers...');
    
    // Test TradesData wrappers
    if (window.TradesData) {
      // Test calculateStopPrice
      const test1 = test(
        'TradesData.calculateStopPrice wrapper exists',
        typeof window.TradesData.calculateStopPrice === 'function',
        { service: 'TradesData', wrapper: 'calculateStopPrice' }
      );
      addTestResult('frontendWrappers', test1);
      
      // Test calculateTargetPrice
      const test2 = test(
        'TradesData.calculateTargetPrice wrapper exists',
        typeof window.TradesData.calculateTargetPrice === 'function',
        { service: 'TradesData', wrapper: 'calculateTargetPrice' }
      );
      addTestResult('frontendWrappers', test2);
      
      // Test validateTrade
      const test3 = test(
        'TradesData.validateTrade wrapper exists',
        typeof window.TradesData.validateTrade === 'function',
        { service: 'TradesData', wrapper: 'validateTrade' }
      );
      addTestResult('frontendWrappers', test3);
    } else {
      const test1 = test(
        'TradesData service available',
        false,
        { error: 'TradesData service not found' }
      );
      addTestResult('frontendWrappers', test1);
    }
    
    // Test ExecutionsData wrappers
    if (window.ExecutionsData) {
      const test1 = test(
        'ExecutionsData.calculateExecutionValues wrapper exists',
        typeof window.ExecutionsData.calculateExecutionValues === 'function',
        { service: 'ExecutionsData', wrapper: 'calculateExecutionValues' }
      );
      addTestResult('frontendWrappers', test1);
    }
    
    // Test AlertsData wrappers
    if (window.AlertsData) {
      const test1 = test(
        'AlertsData.validateAlert wrapper exists',
        typeof window.AlertsData.validateAlert === 'function',
        { service: 'AlertsData', wrapper: 'validateAlert' }
      );
      addTestResult('frontendWrappers', test1);
    }
    
    console.log(`✅ Frontend Wrappers: ${testResults.frontendWrappers.passed}/${testResults.frontendWrappers.passed + testResults.frontendWrappers.failed} tests passed`);
  }

  /**
   * Test Error Handling
   */
  async function testErrorHandling() {
    console.log('\n🔍 Testing Error Handling...');
    
    // Test invalid endpoint
    const result1 = await testApiEndpoint('POST', `${BUSINESS_API_BASE}/trade/invalid-endpoint`, {}, 404);
    const test1 = test(
      'Error handling for invalid endpoint',
      result1.status === 'error' && result1.statusCode === 404,
      result1
    );
    addTestResult('errorHandling', test1);
    
    // Test invalid data
    const result2 = await testApiEndpoint('POST', `${BUSINESS_API_BASE}/trade/calculate-stop-price`, {
      current_price: -100, // Invalid price
      stop_percentage: 10,
      side: 'Long'
    }, 400);
    const test2 = test(
      'Error handling for invalid data',
      result2.status === 'error' && result2.statusCode === 400,
      result2
    );
    addTestResult('errorHandling', test2);
    
    console.log(`✅ Error Handling: ${testResults.errorHandling.passed}/${testResults.errorHandling.passed + testResults.errorHandling.failed} tests passed`);
  }

  /**
   * Test Cache Integration
   */
  async function testCacheIntegration() {
    console.log('\n🔍 Testing Cache Integration...');
    
    // Test UnifiedCacheManager availability
    const test1 = test(
      'UnifiedCacheManager available',
      typeof window.UnifiedCacheManager !== 'undefined',
      { system: 'UnifiedCacheManager' }
    );
    addTestResult('cacheIntegration', test1);
    
    // Test CacheTTLGuard availability
    const test2 = test(
      'CacheTTLGuard available',
      typeof window.CacheTTLGuard !== 'undefined',
      { system: 'CacheTTLGuard' }
    );
    addTestResult('cacheIntegration', test2);
    
    // Test CacheSyncManager availability
    const test3 = test(
      'CacheSyncManager available',
      typeof window.CacheSyncManager !== 'undefined',
      { system: 'CacheSyncManager' }
    );
    addTestResult('cacheIntegration', test3);
    
    console.log(`✅ Cache Integration: ${testResults.cacheIntegration.passed}/${testResults.cacheIntegration.passed + testResults.cacheIntegration.failed} tests passed`);
  }

  /**
   * Test End-to-End Flows
   */
  async function testEndToEnd() {
    console.log('\n🔍 Testing End-to-End Flows...');
    
    // Test Trade calculation flow
    const result1 = await testApiEndpoint('POST', `${BUSINESS_API_BASE}/trade/calculate-stop-price`, {
      current_price: 100.0,
      stop_percentage: 10.0,
      side: 'Long'
    }, 200);
    const test1 = test(
      'End-to-End: Calculate Stop Price',
      result1.status === 'success' && result1.data && result1.data.status === 'success',
      result1
    );
    addTestResult('endToEnd', test1);
    
    // Test Execution calculation flow
    const result2 = await testApiEndpoint('POST', `${BUSINESS_API_BASE}/execution/calculate-values`, {
      quantity: 10.0,
      price: 100.0,
      commission: 1.0,
      action: 'buy'
    }, 200);
    const test2 = test(
      'End-to-End: Calculate Execution Values',
      result2.status === 'success' && result2.data && result2.data.status === 'success',
      result2
    );
    addTestResult('endToEnd', test2);
    
    console.log(`✅ End-to-End: ${testResults.endToEnd.passed}/${testResults.endToEnd.passed + testResults.endToEnd.failed} tests passed`);
  }

  /**
   * Run all tests
   */
  async function runAllTests() {
    console.log('='.repeat(60));
    console.log('Business Logic Integration Testing - Frontend');
    console.log('='.repeat(60));
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`Timestamp: ${new Date().toISOString()}`);
    
    await testFrontendWrappers();
    await testErrorHandling();
    await testCacheIntegration();
    await testEndToEnd();
    
    // Print summary
    console.log('\n📊 Test Summary:');
    console.log(`Total Tests: ${testResults.summary.total}`);
    console.log(`Passed: ${testResults.summary.passed}`);
    console.log(`Failed: ${testResults.summary.failed}`);
    console.log(`Success Rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(2)}%`);
    
    // Store results in window for external access
    window.businessLogicIntegrationTestResults = testResults;
    
    return testResults;
  }

  // Auto-run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        runAllTests();
      }, 2000);
    });
  } else {
    setTimeout(() => {
      runAllTests();
    }, 2000);
  }

  // Export for manual testing
  window.testBusinessLogicIntegration = runAllTests;

})();

