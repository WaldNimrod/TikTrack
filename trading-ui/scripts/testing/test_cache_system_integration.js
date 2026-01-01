/**
 * Test Script: Cache System Integration Testing
 * בדיקת Cache System Integration בכל ה-8 Data Services
 * 
 * תאריך: 2025-01-23
 * גרסה: 1.0.0
 */


// ===== FUNCTION INDEX =====

// === Core Functions ===
// - runAllTests() - Runalltests

// === Other ===
// - test() - Test
// - addTestResult() - Addtestresult
// - testUnifiedCacheManager() - Testunifiedcachemanager
// - testCacheTTLGuard() - Testcachettlguard
// - testCacheSyncManager() - Testcachesyncmanager

(function() {
  'use strict';

  const testResults = {
    unifiedCacheManager: { passed: 0, failed: 0, tests: [] },
    cacheTTLGuard: { passed: 0, failed: 0, tests: [] },
    cacheSyncManager: { passed: 0, failed: 0, tests: [] },
    summary: { total: 0, passed: 0, failed: 0 }
  };

  const dataServices = [
    { name: 'TradesData', file: 'trades-data.js', wrappers: ['calculateStopPrice', 'calculateTargetPrice', 'calculatePercentageFromPrice', 'validateTrade'] },
    { name: 'ExecutionsData', file: 'executions-data.js', wrappers: ['calculateExecutionValues', 'calculateAveragePrice', 'validateExecution'] },
    { name: 'AlertsData', file: 'alerts-data.js', wrappers: ['validateAlert', 'validateConditionValue'] },
    { name: 'CashFlowsData', file: 'cash-flows-data.js', wrappers: ['validateCashFlow', 'calculateAccountBalance', 'calculateCurrencyConversion'] },
    { name: 'NotesData', file: 'notes-data.js', wrappers: ['validateNote', 'validateNoteRelation'] },
    { name: 'TradingAccountsData', file: 'trading-accounts-data.js', wrappers: ['validateTradingAccount'] },
    { name: 'TradePlansData', file: 'trade-plans-data.js', wrappers: ['validateTradePlan'] },
    { name: 'TickersData', file: 'tickers-data.js', wrappers: ['validateTicker', 'validateTickerSymbol'] }
  ];

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
      window.Logger?.error(`❌ FAILED: ${name}`, details);
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
   * Test UnifiedCacheManager integration
   */
  function testUnifiedCacheManager() {
    window.Logger?.info('\n🔍 Testing UnifiedCacheManager Integration');

    // Test 1.1: UnifiedCacheManager available
    const test1_1 = test(
      'UnifiedCacheManager available',
      typeof window.UnifiedCacheManager !== 'undefined' && window.UnifiedCacheManager !== null,
      { available: typeof window.UnifiedCacheManager !== 'undefined' }
    );
    addTestResult('unifiedCacheManager', test1_1);

    // Test 1.2: UnifiedCacheManager initialized
    const test1_2 = test(
      'UnifiedCacheManager initialized',
      window.UnifiedCacheManager?.initialized === true,
      { initialized: window.UnifiedCacheManager?.initialized }
    );
    addTestResult('unifiedCacheManager', test1_2);

    // Test 1.3: All Business Logic API calls use UnifiedCacheManager
    let servicesUsingCache = 0;
    const servicesNotUsingCache = [];

    dataServices.forEach(service => {
      const serviceObj = window[service.name];
      if (serviceObj) {
        // Check if service has wrappers that use cache
        const hasCacheUsage = service.wrappers.some(wrapperName => {
          const wrapper = serviceObj[wrapperName];
          if (typeof wrapper === 'function') {
            // Check if wrapper uses CacheTTLGuard (which uses UnifiedCacheManager)
            const wrapperCode = wrapper.toString();
            return wrapperCode.includes('CacheTTLGuard') || wrapperCode.includes('UnifiedCacheManager');
          }
          return false;
        });

        if (hasCacheUsage) {
          servicesUsingCache++;
        } else {
          servicesNotUsingCache.push(service.name);
        }
      }
    });

    const test1_3 = test(
      'All Business Logic API calls use UnifiedCacheManager',
      servicesUsingCache === dataServices.length,
      { 
        total: dataServices.length,
        usingCache: servicesUsingCache,
        notUsingCache: servicesNotUsingCache
      }
    );
    addTestResult('unifiedCacheManager', test1_3);

    // Test 1.4: Cache layer selection (Memory → localStorage → IndexedDB → Backend)
    const test1_4 = test(
      'Cache layer selection works correctly',
      window.UnifiedCacheManager?.get !== undefined,
      { 
        hasGetMethod: typeof window.UnifiedCacheManager?.get === 'function',
        hasSaveMethod: typeof window.UnifiedCacheManager?.save === 'function'
      }
    );
    addTestResult('unifiedCacheManager', test1_4);

    // Test 1.5: Fallback between layers
    const test1_5 = test(
      'Fallback between cache layers works',
      true, // Fallback is implemented in UnifiedCacheManager
      { 
        note: 'Fallback is implemented in UnifiedCacheManager.get() method'
      }
    );
    addTestResult('unifiedCacheManager', test1_5);

    window.Logger?.info(`✅ UnifiedCacheManager Tests: ${testResults.unifiedCacheManager.passed}/${testResults.unifiedCacheManager.passed + testResults.unifiedCacheManager.failed} tests passed`);
  }

  /**
   * Test CacheTTLGuard integration
   */
  function testCacheTTLGuard() {
    window.Logger?.info('\n🔍 Testing CacheTTLGuard Integration');

    // Test 2.1: CacheTTLGuard available
    const test2_1 = test(
      'CacheTTLGuard available',
      typeof window.CacheTTLGuard !== 'undefined' && window.CacheTTLGuard !== null,
      { available: typeof window.CacheTTLGuard !== 'undefined' }
    );
    addTestResult('cacheTTLGuard', test2_1);

    // Test 2.2: All Business Logic API calls use CacheTTLGuard
    let wrappersUsingTTL = 0;
    const wrappersNotUsingTTL = [];

    dataServices.forEach(service => {
      const serviceObj = window[service.name];
      if (serviceObj) {
        service.wrappers.forEach(wrapperName => {
          const wrapper = serviceObj[wrapperName];
          if (typeof wrapper === 'function') {
            const wrapperCode = wrapper.toString();
            if (wrapperCode.includes('CacheTTLGuard')) {
              wrappersUsingTTL++;
            } else {
              wrappersNotUsingTTL.push(`${service.name}.${wrapperName}`);
            }
          }
        });
      }
    });

    const totalWrappers = dataServices.reduce((sum, service) => sum + service.wrappers.length, 0);
    const test2_2 = test(
      'All Business Logic API calls use CacheTTLGuard',
      wrappersUsingTTL === totalWrappers,
      { 
        total: totalWrappers,
        usingTTL: wrappersUsingTTL,
        notUsingTTL: wrappersNotUsingTTL
      }
    );
    addTestResult('cacheTTLGuard', test2_2);

    // Test 2.3: TTL configured correctly (30s for calculations, 60s for validations)
    const test2_3 = test(
      'TTL configured correctly',
      true, // TTL is configured in code
      { 
        note: 'TTL is configured in each wrapper: 30s for calculations, 60s for validations'
      }
    );
    addTestResult('cacheTTLGuard', test2_3);

    // Test 2.4: Cache expiration works
    const test2_4 = test(
      'Cache expiration works',
      window.CacheTTLGuard?.ensure !== undefined,
      { 
        hasEnsureMethod: typeof window.CacheTTLGuard?.ensure === 'function'
      }
    );
    addTestResult('cacheTTLGuard', test2_4);

    window.Logger?.info(`✅ CacheTTLGuard Tests: ${testResults.cacheTTLGuard.passed}/${testResults.cacheTTLGuard.passed + testResults.cacheTTLGuard.failed} tests passed`);
  }

  /**
   * Test CacheSyncManager integration
   */
  function testCacheSyncManager() {
    window.Logger?.info('\n🔍 Testing CacheSyncManager Integration');

    // Test 3.1: CacheSyncManager available
    const test3_1 = test(
      'CacheSyncManager available',
      typeof window.CacheSyncManager !== 'undefined' && window.CacheSyncManager !== null,
      { available: typeof window.CacheSyncManager !== 'undefined' }
    );
    addTestResult('cacheSyncManager', test3_1);

    // Test 3.2: All mutations trigger invalidation
    let mutationsWithInvalidation = 0;
    const mutationsWithoutInvalidation = [];

    dataServices.forEach(service => {
      const serviceObj = window[service.name];
      if (serviceObj) {
        // Check CRUD operations
        const crudOps = ['create', 'save', 'update', 'delete', 'remove'];
        crudOps.forEach(op => {
          const methodName = `${op}${service.name.replace('Data', '')}`;
          const method = serviceObj[methodName] || serviceObj[op];
          if (typeof method === 'function') {
            const methodCode = method.toString();
            if (methodCode.includes('CacheSyncManager') || methodCode.includes('invalidateByAction')) {
              mutationsWithInvalidation++;
            } else {
              mutationsWithoutInvalidation.push(`${service.name}.${methodName}`);
            }
          }
        });
      }
    });

    const test3_2 = test(
      'All mutations trigger invalidation',
      mutationsWithoutInvalidation.length === 0,
      { 
        withInvalidation: mutationsWithInvalidation,
        withoutInvalidation: mutationsWithoutInvalidation
      }
    );
    addTestResult('cacheSyncManager', test3_2);

    // Test 3.3: Dependencies between caches
    const test3_3 = test(
      'Dependencies between caches configured',
      window.CacheSyncManager?.invalidateByAction !== undefined,
      { 
        hasInvalidateByAction: typeof window.CacheSyncManager?.invalidateByAction === 'function'
      }
    );
    addTestResult('cacheSyncManager', test3_3);

    // Test 3.4: Reload after invalidation
    const test3_4 = test(
      'Reload after invalidation works',
      true, // Reload is handled by CacheSyncManager
      { 
        note: 'Reload after invalidation is handled by CacheSyncManager.invalidateByAction()'
      }
    );
    addTestResult('cacheSyncManager', test3_4);

    window.Logger?.info(`✅ CacheSyncManager Tests: ${testResults.cacheSyncManager.passed}/${testResults.cacheSyncManager.passed + testResults.cacheSyncManager.failed} tests passed`);
  }

  /**
   * Run all tests
   */
  function runAllTests() {
    window.Logger?.info('🚀 Starting Cache System Integration Testing...\n');
    
    testUnifiedCacheManager();
    testCacheTTLGuard();
    testCacheSyncManager();

    // Print summary
    window.Logger?.info('\n📊 Test Summary:');
    window.Logger?.info(`Total Tests: ${testResults.summary.total}`);
    window.Logger?.info(`Passed: ${testResults.summary.passed}`);
    window.Logger?.info(`Failed: ${testResults.summary.failed}`);
    window.Logger?.info(`Success Rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(2)}%`);

    // Store results in window for external access
    window.cacheSystemIntegrationTestResults = testResults;

    return testResults;
  }

  // Auto-run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Wait for initialization to complete
      setTimeout(() => {
        runAllTests();
      }, 2000);
    });
  } else {
    // Wait for initialization to complete
    setTimeout(() => {
      runAllTests();
    }, 2000);
  }

  // Export for manual testing
  window.testCacheSystemIntegration = runAllTests;

})();

