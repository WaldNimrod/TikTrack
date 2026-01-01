/**
 * Test Script for Preferences System Optimization
 * ================================================
 *
 * בדיקת ביצועים ואופטימיזציה של מערכת העדפות
 *
 * תרחישי בדיקה:
 * 1. מדידת זמן טעינה
 * 2. מדידת מספר קריאות API
 * 3. מדידת זמן שמירה
 * 4. בדיקת cache hit rate
 * 5. זיהוי bottlenecks
 *
 * Usage:
 *   Open browser console and run:
 *   window.testPreferencesOptimization()
 */


// ===== FUNCTION INDEX =====

// === Core Functions ===
// - runAllTests() - Runalltests

// === Data Functions ===
// - testPageLoad() - Testpageload
// - testSavePerformance() - Testsaveperformance
// - countAPICalls() - Countapicalls

// === Other ===
// - testCachePerformance() - Testcacheperformance

(function() {
  'use strict';

  const TEST_CONFIG = {
    testUser: 1,
    testProfile: 0,
    testGroup: 'trading_settings',
    testPreference: 'atr_period',
    iterations: 5
  };

  let testResults = {
    loadTimes: [],
    saveTimes: [],
    apiCalls: [],
    cacheHits: 0,
    cacheMisses: 0,
    errors: []
  };

  /**
   * Measure page load time
   */
  async function testPageLoad() {
    window.Logger?.info('📊 Testing page load performance...');
    
    const results = [];
    
    for (let i = 0; i < TEST_CONFIG.iterations; i++) {
      const startTime = performance.now();
      
      try {
        // Simulate page load
        if (window.PreferencesManager) {
          await window.PreferencesManager.initialize(TEST_CONFIG.testUser, TEST_CONFIG.testProfile);
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        results.push(duration);
        testResults.loadTimes.push(duration);
        
        window.Logger?.info(`  Iteration ${i + 1}: ${duration.toFixed(2)}ms`);
      } catch (error) {
        window.Logger?.error(`  Iteration ${i + 1} failed:`, error);
        testResults.errors.push({ test: 'pageLoad', iteration: i + 1, error: error.message });
      }
      
      // Wait between iterations
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const avgTime = results.reduce((a, b) => a + b, 0) / results.length;
    const minTime = Math.min(...results);
    const maxTime = Math.max(...results);
    
    window.Logger?.info(`✅ Average load time: ${avgTime.toFixed(2)}ms`);
    window.Logger?.info(`   Min: ${minTime.toFixed(2)}ms, Max: ${maxTime.toFixed(2)}ms`);
    window.Logger?.info();
    
    return { avg: avgTime, min: minTime, max: maxTime, results };
  }

  /**
   * Measure save time
   */
  async function testSavePerformance() {
    window.Logger?.info('💾 Testing save performance...');
    
    const results = [];
    
    for (let i = 0; i < TEST_CONFIG.iterations; i++) {
      const startTime = performance.now();
      
      try {
        const testValue = String(14 + i); // Vary the value
        
        if (window.PreferencesManager) {
          await window.PreferencesManager.saveGroup(TEST_CONFIG.testGroup, {
            [TEST_CONFIG.testPreference]: testValue
          }, {
            userId: TEST_CONFIG.testUser,
            profileId: TEST_CONFIG.testProfile,
            optimisticUpdate: true
          });
        }
        
        const endTime = performance.now();
        const duration = endTime - startTime;
        results.push(duration);
        testResults.saveTimes.push(duration);
        
        window.Logger?.info(`  Iteration ${i + 1}: ${duration.toFixed(2)}ms`);
      } catch (error) {
        window.Logger?.error(`  Iteration ${i + 1} failed:`, error);
        testResults.errors.push({ test: 'save', iteration: i + 1, error: error.message });
      }
      
      // Wait between iterations
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    const avgTime = results.reduce((a, b) => a + b, 0) / results.length;
    const minTime = Math.min(...results);
    const maxTime = Math.max(...results);
    
    window.Logger?.info(`✅ Average save time: ${avgTime.toFixed(2)}ms`);
    window.Logger?.info(`   Min: ${minTime.toFixed(2)}ms, Max: ${maxTime.toFixed(2)}ms`);
    window.Logger?.info();
    
    return { avg: avgTime, min: minTime, max: maxTime, results };
  }

  /**
   * Count API calls
   */
  function countAPICalls() {
    window.Logger?.info('📡 Counting API calls...');
    
    // Intercept fetch calls
    const originalFetch = window.fetch;
    let callCount = 0;
    const apiCalls = [];
    
    window.fetch = function(...args) {
      const url = args[0];
      if (typeof url === 'string' && url.includes('/api/preferences')) {
        callCount++;
        apiCalls.push({
          url,
          method: args[1]?.method || 'GET',
          timestamp: Date.now()
        });
      }
      return originalFetch.apply(this, args);
    };
    
    // Restore after test
    setTimeout(() => {
      window.fetch = originalFetch;
    }, 60000); // 1 minute
    
    return {
      getCount: () => callCount,
      getCalls: () => apiCalls,
      reset: () => { callCount = 0; apiCalls.length = 0; }
    };
  }

  /**
   * Test cache performance
   */
  async function testCachePerformance() {
    window.Logger?.info('🔍 Testing cache performance...');
    
    let hits = 0;
    let misses = 0;
    
    // First load (should be cache miss)
    const start1 = performance.now();
    if (window.PreferencesManager) {
      await window.PreferencesManager.loadGroup(TEST_CONFIG.testGroup, {
        userId: TEST_CONFIG.testUser,
        profileId: TEST_CONFIG.testProfile,
        useCache: true
      });
    }
    const duration1 = performance.now() - start1;
    misses++;
    testResults.cacheMisses++;
    
    window.Logger?.info(`  First load (cache miss): ${duration1.toFixed(2)}ms`);
    
    // Second load (should be cache hit)
    const start2 = performance.now();
    if (window.PreferencesManager) {
      await window.PreferencesManager.loadGroup(TEST_CONFIG.testGroup, {
        userId: TEST_CONFIG.testUser,
        profileId: TEST_CONFIG.testProfile,
        useCache: true
      });
    }
    const duration2 = performance.now() - start2;
    hits++;
    testResults.cacheHits++;
    
    window.Logger?.info(`  Second load (cache hit): ${duration2.toFixed(2)}ms`);
    window.Logger?.info(`  Speed improvement: ${((duration1 - duration2) / duration1 * 100).toFixed(1)}%`);
    window.Logger?.info();
    
    return { hits, misses, hitRate: hits / (hits + misses) };
  }

  /**
   * Run all performance tests
   */
  async function runAllTests() {
    window.Logger?.info('='.repeat(60));
    window.Logger?.info('Preferences System Optimization Tests');
    window.Logger?.info('='.repeat(60));
    window.Logger?.info();
    
    // Setup API call counter
    const apiCounter = countAPICalls();
    
    // Run tests
    const loadResults = await testPageLoad();
    const saveResults = await testSavePerformance();
    const cacheResults = await testCachePerformance();
    
    // Get API call count
    const apiCallCount = apiCounter.getCount();
    const apiCalls = apiCounter.getCalls();
    testResults.apiCalls = apiCalls;
    
    // Summary
    window.Logger?.info('='.repeat(60));
    window.Logger?.info('Test Summary');
    window.Logger?.info('='.repeat(60));
    window.Logger?.info();
    
    window.Logger?.info('📊 Load Performance:');
    window.Logger?.info(`   Average: ${loadResults.avg.toFixed(2)}ms`);
    window.Logger?.info(`   Min: ${loadResults.min.toFixed(2)}ms`);
    window.Logger?.info(`   Max: ${loadResults.max.toFixed(2)}ms`);
    window.Logger?.info(`   Target: < 500ms ${loadResults.avg < 500 ? '✅' : '❌'}`);
    window.Logger?.info();
    
    window.Logger?.info('💾 Save Performance:');
    window.Logger?.info(`   Average: ${saveResults.avg.toFixed(2)}ms`);
    window.Logger?.info(`   Min: ${saveResults.min.toFixed(2)}ms`);
    window.Logger?.info(`   Max: ${saveResults.max.toFixed(2)}ms`);
    window.Logger?.info(`   Target: < 200ms ${saveResults.avg < 200 ? '✅' : '❌'}`);
    window.Logger?.info();
    
    window.Logger?.info('📡 API Calls:');
    window.Logger?.info(`   Total: ${apiCallCount}`);
    window.Logger?.info(`   Target: < 3 ${apiCallCount < 3 ? '✅' : '❌'}`);
    if (apiCalls.length > 0) {
      window.Logger?.info('   Calls:');
      apiCalls.forEach((call, idx) => {
        window.Logger?.info(`     ${idx + 1}. ${call.method} ${call.url}`);
      });
    }
    window.Logger?.info();
    
    window.Logger?.info('🔍 Cache Performance:');
    window.Logger?.info(`   Hits: ${cacheResults.hits}`);
    window.Logger?.info(`   Misses: ${cacheResults.misses}`);
    window.Logger?.info(`   Hit Rate: ${(cacheResults.hitRate * 100).toFixed(1)}%`);
    window.Logger?.info(`   Target: > 80% ${cacheResults.hitRate > 0.8 ? '✅' : '❌'}`);
    window.Logger?.info();
    
    if (testResults.errors.length > 0) {
      window.Logger?.info('❌ Errors:');
      testResults.errors.forEach(error => {
        window.Logger?.info(`   ${error.test} (iteration ${error.iteration}): ${error.error}`);
      });
      window.Logger?.info();
    }
    
    // Store results globally
    window.preferencesTestResults = {
      load: loadResults,
      save: saveResults,
      cache: cacheResults,
      apiCalls: {
        count: apiCallCount,
        calls: apiCalls
      },
      errors: testResults.errors
    };
    
    window.Logger?.info('✅ Test results stored in window.preferencesTestResults');
    window.Logger?.info();
    
    return window.preferencesTestResults;
  }

  // Export to window
  window.testPreferencesOptimization = runAllTests;
  
  window.Logger?.info('✅ Preferences optimization test script loaded');
  window.Logger?.info('   Run: window.testPreferencesOptimization()');
})();

