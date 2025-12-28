/**
 * AI Analysis System - Performance Tests
 * ======================================
 * 
 * Comprehensive performance tests for AI Analysis system
 * Tests loading times, API response times, cache performance, etc.
 * 
 * Usage:
 *   1. Open ai_analysis.html in browser
 *   2. Open console (F12)
 *   3. Run: window.runAIAnalysisPerformanceTests()
 * 
 * @version 1.0.0
 * @created January 31, 2025
 */


// ===== FUNCTION INDEX =====

// === Initialization ===
// - testManagerInitPerformance() - Testmanagerinitperformance

// === Core Functions ===
// - runAllPerformanceTests() - Runallperformancetests

// === Event Handlers ===
// - logSection() - Logsection
// - testAPIResponsePerformance() - Testapiresponseperformance

// === UI Functions ===
// - testRenderingPerformance() - Testrenderingperformance

// === Data Functions ===
// - testPageLoadTime() - Testpageloadtime
// - testTemplatesLoadPerformance() - Testtemplatesloadperformance
// - testHistoryLoadPerformance() - Testhistoryloadperformance

// === Other ===
// - logPerformanceTest() - Logperformancetest
// - measureTime() - Measuretime
// - testCachePerformance() - Testcacheperformance
// - testMemoryUsage() - Testmemoryusage
// - testNetworkPerformance() - Testnetworkperformance

(function() {
  'use strict';

  const PERFORMANCE_THRESHOLDS = {
    pageLoad: 3000,        // 3 seconds - page load time
    templatesLoad: 2000,   // 2 seconds - templates load time
    historyLoad: 1500,     // 1.5 seconds - history load time
    apiValidate: 500,      // 500ms - validation API response
    apiGenerate: 30000,    // 30 seconds - analysis generation (LLM)
    cacheRead: 50,         // 50ms - cache read time
    cacheWrite: 100,       // 100ms - cache write time
    managerInit: 1000,     // 1 second - manager initialization
    renderHistory: 500,    // 500ms - history rendering
    renderTemplates: 300,  // 300ms - templates rendering
    modalOpen: 200,        // 200ms - modal open time
    totalPageLoad: 5000    // 5 seconds - total page load (all resources)
  };

  const performanceResults = {
    tests: [],
    startTime: null,
    endTime: null,
    duration: 0,
    summary: {
      passed: 0,
      failed: 0,
      warnings: 0,
      total: 0
    }
  };

  /**
   * Performance Test Logger
   */
  function logPerformanceTest(name, passed, actualTime, threshold, category = 'performance') {
    performanceResults.summary.total++;
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const warning = actualTime > threshold * 0.8 && actualTime < threshold ? '⚠️ WARNING' : '';
    
    if (passed) {
      performanceResults.summary.passed++;
    } else {
      performanceResults.summary.failed++;
    }

    if (warning) {
      performanceResults.summary.warnings++;
    }

    const result = {
      name,
      passed,
      actualTime,
      threshold,
      category,
      warning: !!warning,
      timestamp: Date.now()
    };

    performanceResults.tests.push(result);

    console.log(`${status} ${warning} ${name}: ${actualTime}ms (threshold: ${threshold}ms)`);
    if (warning) {
      console.log(`  ⚠️  Close to threshold (${((actualTime / threshold) * 100).toFixed(1)}%)`);
    }
  }

  function logSection(title) {
    console.log('\n' + '='.repeat(60));
    console.log(title);
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Measure function execution time
   */
  async function measureTime(fn, ...args) {
    const start = performance.now();
    const result = await fn(...args);
    const duration = performance.now() - start;
    return { result, duration };
  }

  /**
   * Test 1: Page Load Time
   */
  async function testPageLoadTime() {
    logSection('PAGE LOAD PERFORMANCE');

    try {
      // Measure navigation timing
      if (window.performance && window.performance.timing) {
        const timing = window.performance.timing;
        const pageLoadTime = timing.loadEventEnd - timing.navigationStart;
        logPerformanceTest(
          'Page load time (DOMContentLoaded to Load)',
          pageLoadTime < PERFORMANCE_THRESHOLDS.pageLoad,
          pageLoadTime,
          PERFORMANCE_THRESHOLDS.pageLoad
        );
      }

      // Measure total load time
      if (window.performance && window.performance.getEntriesByType) {
        const navigationEntries = window.performance.getEntriesByType('navigation');
        if (navigationEntries.length > 0) {
          const navEntry = navigationEntries[0];
          const totalLoadTime = navEntry.loadEventEnd - navEntry.fetchStart;
          logPerformanceTest(
            'Total page load time (Fetch to Load)',
            totalLoadTime < PERFORMANCE_THRESHOLDS.totalPageLoad,
            totalLoadTime,
            PERFORMANCE_THRESHOLDS.totalPageLoad
          );
        }
      }
    } catch (error) {
      console.error('❌ Error testing page load time:', error);
    }
  }

  /**
   * Test 2: Templates Load Performance
   */
  async function testTemplatesLoadPerformance() {
    logSection('TEMPLATES LOAD PERFORMANCE');

    try {
      if (!window.AIAnalysisData || !window.AIAnalysisData.loadTemplates) {
        console.log('⚠️  AIAnalysisData.loadTemplates not available');
        return;
      }

      // Test with cache disabled (cold start)
      const { duration: coldDuration } = await measureTime(
        () => window.AIAnalysisData.loadTemplates({ force: true })
      );
      logPerformanceTest(
        'Templates load (cold - no cache)',
        coldDuration < PERFORMANCE_THRESHOLDS.templatesLoad,
        coldDuration,
        PERFORMANCE_THRESHOLDS.templatesLoad
      );

      // Test with cache enabled (warm start)
      await new Promise(resolve => setTimeout(resolve, 100));
      const { duration: warmDuration } = await measureTime(
        () => window.AIAnalysisData.loadTemplates({ force: false })
      );
      logPerformanceTest(
        'Templates load (warm - with cache)',
        warmDuration < PERFORMANCE_THRESHOLDS.templatesLoad * 0.3, // Should be much faster with cache
        warmDuration,
        PERFORMANCE_THRESHOLDS.templatesLoad * 0.3
      );
    } catch (error) {
      console.error('❌ Error testing templates load performance:', error);
    }
  }

  /**
   * Test 3: History Load Performance
   */
  async function testHistoryLoadPerformance() {
    logSection('HISTORY LOAD PERFORMANCE');

    try {
      if (!window.AIAnalysisData || !window.AIAnalysisData.loadHistory) {
        console.log('⚠️  AIAnalysisData.loadHistory not available');
        return;
      }

      // Test history load time
      const { duration } = await measureTime(
        () => window.AIAnalysisData.loadHistory({ force: true })
      );
      logPerformanceTest(
        'History load time',
        duration < PERFORMANCE_THRESHOLDS.historyLoad,
        duration,
        PERFORMANCE_THRESHOLDS.historyLoad
      );
    } catch (error) {
      console.error('❌ Error testing history load performance:', error);
    }
  }

  /**
   * Test 4: API Response Performance
   */
  async function testAPIResponsePerformance() {
    logSection('API RESPONSE PERFORMANCE');

    try {
      if (!window.AIAnalysisData || !window.AIAnalysisData.validateAnalysisRequest) {
        console.log('⚠️  Validation API not available');
        return;
      }

      // Test validation API response time
      const testData = {
        template_id: 1,
        variables: { stock_ticker: 'TSLA' },
        user_id: 1
      };

      const { duration } = await measureTime(
        () => window.AIAnalysisData.validateAnalysisRequest(testData)
      );
      logPerformanceTest(
        'Validation API response time',
        duration < PERFORMANCE_THRESHOLDS.apiValidate,
        duration,
        PERFORMANCE_THRESHOLDS.apiValidate
      );
    } catch (error) {
      console.error('❌ Error testing API response performance:', error);
    }
  }

  /**
   * Test 5: Cache Performance
   */
  async function testCachePerformance() {
    logSection('CACHE PERFORMANCE');

    try {
      if (!window.UnifiedCacheManager) {
        console.log('⚠️  UnifiedCacheManager not available');
        return;
      }

      const testKey = 'ai-analysis-performance-test-' + Date.now();
      const testData = {
        test: 'data',
        timestamp: Date.now()
      };

      // Test cache write performance
      const { duration: writeDuration } = await measureTime(
        () => window.UnifiedCacheManager.save(testKey, testData, {
          ttl: 60000,
          layer: 'memory'
        })
      );
      logPerformanceTest(
        'Cache write time (memory layer)',
        writeDuration < PERFORMANCE_THRESHOLDS.cacheWrite,
        writeDuration,
        PERFORMANCE_THRESHOLDS.cacheWrite
      );

      // Wait a bit for cache to settle
      await new Promise(resolve => setTimeout(resolve, 50));

      // Test cache read performance
      const { duration: readDuration } = await measureTime(
        () => window.UnifiedCacheManager.get(testKey, 'memory')
      );
      logPerformanceTest(
        'Cache read time (memory layer)',
        readDuration < PERFORMANCE_THRESHOLDS.cacheRead,
        readDuration,
        PERFORMANCE_THRESHOLDS.cacheRead
      );

      // Cleanup
      try {
        await window.UnifiedCacheManager.remove(testKey, 'memory');
      } catch (e) {
        // Ignore cleanup errors
      }
    } catch (error) {
      console.error('❌ Error testing cache performance:', error);
    }
  }

  /**
   * Test 6: Manager Initialization Performance
   */
  async function testManagerInitPerformance() {
    logSection('MANAGER INITIALIZATION PERFORMANCE');

    try {
      if (!window.AIAnalysisManager) {
        console.log('⚠️  AIAnalysisManager not available');
        return;
      }

      // Create a new instance or reinitialize
      if (window.AIAnalysisManager.initialize) {
        const { duration } = await measureTime(
          () => window.AIAnalysisManager.initialize()
        );
        logPerformanceTest(
          'Manager initialization time',
          duration < PERFORMANCE_THRESHOLDS.managerInit,
          duration,
          PERFORMANCE_THRESHOLDS.managerInit
        );
      }
    } catch (error) {
      console.error('❌ Error testing manager init performance:', error);
    }
  }

  /**
   * Test 7: Rendering Performance
   */
  async function testRenderingPerformance() {
    logSection('RENDERING PERFORMANCE');

    try {
      if (!window.AIAnalysisManager) {
        console.log('⚠️  AIAnalysisManager not available');
        return;
      }

      // Test history rendering
      if (window.AIAnalysisManager.renderHistory) {
        // Load history first
        if (window.AIAnalysisData && window.AIAnalysisData.loadHistory) {
          await window.AIAnalysisData.loadHistory({ force: true });
        }

        const { duration: historyRenderDuration } = await measureTime(
          () => window.AIAnalysisManager.renderHistory()
        );
        logPerformanceTest(
          'History rendering time',
          historyRenderDuration < PERFORMANCE_THRESHOLDS.renderHistory,
          historyRenderDuration,
          PERFORMANCE_THRESHOLDS.renderHistory
        );
      }

      // Test templates rendering
      if (window.AIAnalysisManager.renderTemplates) {
        const { duration: templatesRenderDuration } = await measureTime(
          () => window.AIAnalysisManager.renderTemplates()
        );
        logPerformanceTest(
          'Templates rendering time',
          templatesRenderDuration < PERFORMANCE_THRESHOLDS.renderTemplates,
          templatesRenderDuration,
          PERFORMANCE_THRESHOLDS.renderTemplates
        );
      }
    } catch (error) {
      console.error('❌ Error testing rendering performance:', error);
    }
  }

  /**
   * Test 8: Memory Usage
   */
  async function testMemoryUsage() {
    logSection('MEMORY USAGE');

    try {
      if (window.performance && window.performance.memory) {
        const memory = window.performance.memory;
        const usedMB = (memory.usedJSHeapSize / 1048576).toFixed(2);
        const totalMB = (memory.totalJSHeapSize / 1048576).toFixed(2);
        const limitMB = (memory.jsHeapSizeLimit / 1048576).toFixed(2);

        console.log(`Memory Usage:`);
        console.log(`  Used: ${usedMB} MB`);
        console.log(`  Total: ${totalMB} MB`);
        console.log(`  Limit: ${limitMB} MB`);
        console.log(`  Usage: ${((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2)}%`);

        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        const passed = usagePercent < 80; // Less than 80% usage

        performanceResults.summary.total++;
        if (passed) {
          performanceResults.summary.passed++;
          console.log(`✅ PASS Memory usage: ${usagePercent.toFixed(2)}% (threshold: 80%)`);
        } else {
          performanceResults.summary.failed++;
          console.log(`❌ FAIL Memory usage: ${usagePercent.toFixed(2)}% (threshold: 80%)`);
        }
      } else {
        console.log('⚠️  Performance.memory not available (Chrome only)');
      }
    } catch (error) {
      console.error('❌ Error testing memory usage:', error);
    }
  }

  /**
   * Test 9: Network Performance
   */
  async function testNetworkPerformance() {
    logSection('NETWORK PERFORMANCE');

    try {
      if (window.performance && window.performance.getEntriesByType) {
        const resourceEntries = window.performance.getEntriesByType('resource');
        
        // Filter AI Analysis related resources
        const aiResources = resourceEntries.filter(entry => 
          entry.name.includes('ai-analysis') || 
          entry.name.includes('aiAnalysis') ||
          entry.name.includes('api/ai_analysis')
        );

        if (aiResources.length > 0) {
          console.log(`Found ${aiResources.length} AI Analysis related resources:`);
          
          let totalTime = 0;
          let maxTime = 0;
          
          aiResources.forEach((entry, index) => {
            const duration = entry.responseEnd - entry.fetchStart;
            totalTime += duration;
            maxTime = Math.max(maxTime, duration);
            
            const resourceName = entry.name.split('/').pop();
            console.log(`  ${index + 1}. ${resourceName}: ${duration.toFixed(2)}ms`);
          });

          const avgTime = totalTime / aiResources.length;
          console.log(`\n  Average: ${avgTime.toFixed(2)}ms`);
          console.log(`  Max: ${maxTime.toFixed(2)}ms`);
          console.log(`  Total: ${totalTime.toFixed(2)}ms`);

          // Log as test
          const passed = avgTime < 1000; // Average less than 1 second
          performanceResults.summary.total++;
          if (passed) {
            performanceResults.summary.passed++;
            console.log(`✅ PASS Average network time: ${avgTime.toFixed(2)}ms (threshold: 1000ms)`);
          } else {
            performanceResults.summary.failed++;
            console.log(`❌ FAIL Average network time: ${avgTime.toFixed(2)}ms (threshold: 1000ms)`);
          }
        } else {
          console.log('⚠️  No AI Analysis related resources found');
        }
      }
    } catch (error) {
      console.error('❌ Error testing network performance:', error);
    }
  }

  /**
   * Run all performance tests
   */
  async function runAllPerformanceTests() {
    performanceResults.startTime = Date.now();

    console.log('\n' + '='.repeat(60));
    console.log('AI ANALYSIS SYSTEM - PERFORMANCE TESTS');
    console.log('='.repeat(60));
    console.log('\nPerformance Thresholds:');
    Object.entries(PERFORMANCE_THRESHOLDS).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}ms`);
    });
    console.log('');

    try {
      await testPageLoadTime();
      await testTemplatesLoadPerformance();
      await testHistoryLoadPerformance();
      await testAPIResponsePerformance();
      await testCachePerformance();
      await testManagerInitPerformance();
      await testRenderingPerformance();
      await testMemoryUsage();
      await testNetworkPerformance();
    } catch (error) {
      console.error('❌ Performance test suite error:', error);
    }

    performanceResults.endTime = Date.now();
    performanceResults.duration = performanceResults.endTime - performanceResults.startTime;

    // Print summary
    logSection('PERFORMANCE TEST SUMMARY');
    console.log(`Total Tests: ${performanceResults.summary.total}`);
    console.log(`Passed: ${performanceResults.summary.passed} ✅`);
    console.log(`Failed: ${performanceResults.summary.failed} ${performanceResults.summary.failed > 0 ? '❌' : ''}`);
    console.log(`Warnings: ${performanceResults.summary.warnings} ${performanceResults.summary.warnings > 0 ? '⚠️' : ''}`);
    console.log(`Total Duration: ${(performanceResults.duration / 1000).toFixed(2)}s`);
    
    // Detailed summary
    console.log('\nPerformance Breakdown:');
    const categoryBreakdown = {};
    performanceResults.tests.forEach(test => {
      if (!categoryBreakdown[test.category]) {
        categoryBreakdown[test.category] = { passed: 0, failed: 0, total: 0 };
      }
      categoryBreakdown[test.category].total++;
      if (test.passed) {
        categoryBreakdown[test.category].passed++;
      } else {
        categoryBreakdown[test.category].failed++;
      }
    });

    Object.entries(categoryBreakdown).forEach(([category, stats]) => {
      const passRate = ((stats.passed / stats.total) * 100).toFixed(1);
      console.log(`  ${category}: ${stats.passed}/${stats.total} passed (${passRate}%)`);
    });

    console.log('\n' + '='.repeat(60) + '\n');

    return performanceResults;
  }

  // Expose to global scope
  window.runAIAnalysisPerformanceTests = runAllPerformanceTests;
  window.aiAnalysisPerformanceResults = performanceResults;
  window.AI_ANALYSIS_PERFORMANCE_THRESHOLDS = PERFORMANCE_THRESHOLDS;

  console.log('✅ AI Analysis performance test suite loaded');
  console.log('Run: window.runAIAnalysisPerformanceTests()');
})();

