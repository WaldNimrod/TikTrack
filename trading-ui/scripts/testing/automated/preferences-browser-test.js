/**
 * Automated Browser Test Suite for Preferences System
 * ====================================================
 *
 * בדיקות אוטומטית מלאות למערכת העדפות
 * הרצה ישירה בדפדפן ללא Playwright/Puppeteer
 *
 * Usage:
 *   1. Open preferences page in browser
 *   2. Open console (F12)
 *   3. Run: window.runAllPreferenceTests()
 *
 * @version 1.0.0
 * @lastUpdated January 2025
 */


// ===== FUNCTION INDEX =====

// === Initialization ===
// - testPreferencesCoreInitialize() - Testpreferencescoreinitialize

// === Core Functions ===
// - runUnitTests() - Rununittests
// - runE2ETests() - Rune2Etests
// - runPerformanceTests() - Runperformancetests
// - runAllTests() - Runalltests

// === Event Handlers ===
// - runIntegrationTests() - Runintegrationtests

// === Data Functions ===
// - testPreferencesV4GetGroup() - Testpreferencesv4Getgroup
// - testPreferencesGroupManagerSaveGroup() - Testpreferencesgroupmanagersavegroup
// - testPageLoadFlow() - Testpageloadflow
// - testSaveFlow() - Testsaveflow
// - testLoadPerformance() - Testloadperformance
// - testSavePerformance() - Testsaveperformance

// === Utility Functions ===
// - check() - Check

// === Other ===
// - logTest() - Logtest
// - waitFor() - Waitfor
// - testUnifiedCacheManager() - Testunifiedcachemanager
// - testCompleteUserFlow() - Testcompleteuserflow

(function() {
  'use strict';

  const TEST_CONFIG = {
    testUser: 1,
    testProfile: 2, // Use actual profile ID from system (was 0, but system uses 2)
    testGroup: 'trading_settings',
    testPreference: 'atr_period',
    testValue: '21',
    defaultValue: '14',
    timeout: 10000, // 10 seconds
    iterations: 3
  };

  let testResults = {
    unit: [],
    integration: [],
    e2e: [],
    performance: [],
    edgeCases: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      duration: 0
    }
  };

  /**
   * Test result logger
   */
  function logTest(category, testName, passed, message = '', duration = 0) {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const result = {
      category,
      test: testName,
      status,
      passed,
      message,
      duration,
      timestamp: Date.now()
    };

    testResults[category].push(result);
    testResults.summary.total++;
    if (passed) {
      testResults.summary.passed++;
    } else {
      testResults.summary.failed++;
    }
    testResults.summary.duration += duration;

    window.Logger?.info(`${status}: ${testName}`);
    if (message) {
      window.Logger?.info(`   ${message}`);
    }
    if (duration > 0) {
      window.Logger?.info(`   Duration: ${duration.toFixed(2)}ms`);
    }
  }

  /**
   * Wait for condition
   */
  function waitFor(condition, timeout = TEST_CONFIG.timeout) {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const check = () => {
        if (condition()) {
          resolve(true);
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Timeout waiting for condition'));
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  }

  // ============================================================================
  // UNIT TESTS
  // ============================================================================

  /**
   * Test PreferencesCore.initializeWithLazyLoading()
   */
  async function testPreferencesCoreInitialize() {
    const testName = 'PreferencesCore.initializeWithLazyLoading()';
    const startTime = performance.now();

    try {
      if (!window.PreferencesCore) {
        logTest('unit', testName, false, 'PreferencesCore not available', 0);
        return false;
      }

      await window.PreferencesCore.initializeWithLazyLoading(TEST_CONFIG.testUser, TEST_CONFIG.testProfile);

      const duration = performance.now() - startTime;
      logTest('unit', testName, true, 'Initialization successful', duration);
      return true;
    } catch (error) {
      const duration = performance.now() - startTime;
      logTest('unit', testName, false, `Error: ${error.message}`, duration);
      return false;
    }
  }

  /**
   * Test PreferencesV4.getGroup()
   */
  async function testPreferencesV4GetGroup() {
    const testName = 'PreferencesV4.getGroup()';
    const startTime = performance.now();

    try {
      if (!window.PreferencesV4) {
        logTest('unit', testName, false, 'PreferencesV4 not available', 0);
        return false;
      }

      const result = await window.PreferencesV4.getGroup(TEST_CONFIG.testGroup, {
        userId: TEST_CONFIG.testUser,
        profileId: TEST_CONFIG.testProfile
      });

      const duration = performance.now() - startTime;
      const hasPreferences = result && result.values && Object.keys(result.values).length > 0;
      logTest('unit', testName, hasPreferences, 
        `Loaded ${Object.keys(result?.values || {}).length} preferences`, duration);
      return hasPreferences;
    } catch (error) {
      const duration = performance.now() - startTime;
      logTest('unit', testName, false, `Error: ${error.message}`, duration);
      return false;
    }
  }

  /**
   * Test PreferencesGroupManager.saveGroup()
   */
  async function testPreferencesGroupManagerSaveGroup() {
    const testName = 'PreferencesGroupManager.saveGroup()';
    const startTime = performance.now();

    try {
      if (!window.PreferencesGroupManager) {
        logTest('unit', testName, false, 'PreferencesGroupManager not available', 0);
        return false;
      }

      // Get current value first
      const field = document.getElementById(TEST_CONFIG.testPreference);
      const oldValue = field ? field.value : null;

      // Set new value
      if (field) {
        field.value = TEST_CONFIG.testValue;
      }

      const result = await window.PreferencesGroupManager.saveGroup(TEST_CONFIG.testGroup);

      const duration = performance.now() - startTime;
      const success = result && (result.saved > 0 || result.success);
      logTest('unit', testName, success, 
        `Save result: ${JSON.stringify(result)}`, duration);
      return success;
    } catch (error) {
      const duration = performance.now() - startTime;
      logTest('unit', testName, false, `Error: ${error.message}`, duration);
      return false;
    }
  }

  /**
   * Test UnifiedCacheManager availability
   */
  function testUnifiedCacheManager() {
    const testName = 'UnifiedCacheManager availability';
    const startTime = performance.now();

    try {
      if (!window.UnifiedCacheManager) {
        logTest('unit', testName, false, 'UnifiedCacheManager not available', 0);
        return false;
      }

      const duration = performance.now() - startTime;
      logTest('unit', testName, true, 'UnifiedCacheManager is available', duration);
      return true;
    } catch (error) {
      const duration = performance.now() - startTime;
      logTest('unit', testName, false, `Error: ${error.message}`, duration);
      return false;
    }
  }

  /**
   * Run all unit tests
   */
  async function runUnitTests() {
    window.Logger?.info('='.repeat(60));
    window.Logger?.info('UNIT TESTS');
    window.Logger?.info('='.repeat(60));
    window.Logger?.info();

    await testPreferencesCoreInitialize();
    await testPreferencesV4GetGroup();
    await testPreferencesGroupManagerSaveGroup();
    testUnifiedCacheManager();

    window.Logger?.info();
  }

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  /**
   * Test complete page load flow
   */
  async function testPageLoadFlow() {
    const testName = 'Page Load Flow';
    const startTime = performance.now();

    try {
      // Wait for page to be ready
      await waitFor(() => window.PreferencesCore !== undefined);

      // Initialize
      if (window.PreferencesCore) {
        await window.PreferencesCore.initializeWithLazyLoading(TEST_CONFIG.testUser, TEST_CONFIG.testProfile);
      }

      // Load group
      let preferences = null;
      if (window.PreferencesV4) {
        const result = await window.PreferencesV4.getGroup(TEST_CONFIG.testGroup, {
          userId: TEST_CONFIG.testUser,
          profileId: TEST_CONFIG.testProfile
        });
        preferences = result?.values || null;
      }

      const duration = performance.now() - startTime;
      const success = preferences && Object.keys(preferences).length > 0 && duration < 500;
      logTest('integration', testName, success, 
        `Loaded in ${duration.toFixed(2)}ms (target: < 500ms)`, duration);
      return success;
    } catch (error) {
      const duration = performance.now() - startTime;
      logTest('integration', testName, false, `Error: ${error.message}`, duration);
      return false;
    }
  }

  /**
   * Test complete save flow
   */
  async function testSaveFlow() {
    const testName = 'Save Flow';
    const startTime = performance.now();

    try {
      // Get field element
      const field = document.getElementById(TEST_CONFIG.testPreference);
      if (!field) {
        logTest('integration', testName, false, 'Field not found', 0);
        return false;
      }

      const oldValue = field.value;

      // Set new value
      field.value = TEST_CONFIG.testValue;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));

      // Save using PreferencesGroupManager
      let result = null;
      if (window.PreferencesGroupManager) {
        result = await window.PreferencesGroupManager.saveGroup(TEST_CONFIG.testGroup);
      }

      // Check that value is still set (optimistic update)
      await waitFor(() => field.value === TEST_CONFIG.testValue, 1000);

      const duration = performance.now() - startTime;
      const optimisticUpdate = field.value === TEST_CONFIG.testValue;
      const saveSuccess = result && (result.saved > 0 || result.success);
      const success = optimisticUpdate && saveSuccess && duration < 200;

      logTest('integration', testName, success, 
        `Optimistic update: ${optimisticUpdate}, Save: ${saveSuccess}, Duration: ${duration.toFixed(2)}ms`, 
        duration);
      return success;
    } catch (error) {
      const duration = performance.now() - startTime;
      logTest('integration', testName, false, `Error: ${error.message}`, duration);
      return false;
    }
  }

  /**
   * Run all integration tests
   */
  async function runIntegrationTests() {
    window.Logger?.info('='.repeat(60));
    window.Logger?.info('INTEGRATION TESTS');
    window.Logger?.info('='.repeat(60));
    window.Logger?.info();

    await testPageLoadFlow();
    await testSaveFlow();

    window.Logger?.info();
  }

  // ============================================================================
  // E2E TESTS
  // ============================================================================

  /**
   * Test complete user flow
   */
  async function testCompleteUserFlow() {
    const testName = 'Complete User Flow';
    const startTime = performance.now();

    try {
      // Step 1: Open section
      const section = document.getElementById('section3');
      if (section) {
        // Try using PreferencesGroupManager.openSection first
        if (window.PreferencesGroupManager && typeof window.PreferencesGroupManager.openSection === 'function') {
          await window.PreferencesGroupManager.openSection('section3');
        } else {
          // Fallback: use toggle button
          const toggleBtn = section.querySelector('[data-onclick*="toggleSection"]');
          if (toggleBtn) {
            toggleBtn.click();
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
      }

      // Step 2: Find and change field
      const field = document.getElementById(TEST_CONFIG.testPreference);
      if (!field) {
        logTest('e2e', testName, false, 'Field not found', 0);
        return false;
      }

      // Step 3: Change value
      field.value = TEST_CONFIG.testValue;
      field.dispatchEvent(new Event('input', { bubbles: true }));
      field.dispatchEvent(new Event('change', { bubbles: true }));

      // Step 4: Save using PreferencesGroupManager
      let saveSuccess = false;
      if (window.PreferencesGroupManager) {
        const result = await window.PreferencesGroupManager.saveGroup(TEST_CONFIG.testGroup);
        saveSuccess = result && (result.saved > 0 || result.success);
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        // Fallback: try save button
        const saveBtn = document.querySelector('[data-onclick*="savePreferenceGroup"][data-onclick*="trading_settings"]');
        if (saveBtn) {
          saveBtn.click();
          await new Promise(resolve => setTimeout(resolve, 1000));
          saveSuccess = true;
        }
      }

      // Step 5: Verify value
      await waitFor(() => field.value === TEST_CONFIG.testValue, 2000);

      const duration = performance.now() - startTime;
      const success = field.value === TEST_CONFIG.testValue && saveSuccess;
      logTest('e2e', testName, success, 
        `Value: ${field.value} (expected: ${TEST_CONFIG.testValue}), Save: ${saveSuccess}, Duration: ${duration.toFixed(2)}ms`, 
        duration);
      return success;
    } catch (error) {
      const duration = performance.now() - startTime;
      logTest('e2e', testName, false, `Error: ${error.message}`, duration);
      return false;
    }
  }

  /**
   * Run all E2E tests
   */
  async function runE2ETests() {
    window.Logger?.info('='.repeat(60));
    window.Logger?.info('E2E TESTS');
    window.Logger?.info('='.repeat(60));
    window.Logger?.info();

    await testCompleteUserFlow();

    window.Logger?.info();
  }

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================

  /**
   * Test load performance
   */
  async function testLoadPerformance() {
    const testName = 'Load Performance';
    const results = [];

    for (let i = 0; i < TEST_CONFIG.iterations; i++) {
      const startTime = performance.now();
      try {
        if (window.PreferencesV4) {
          await window.PreferencesV4.getGroup(TEST_CONFIG.testGroup, {
            userId: TEST_CONFIG.testUser,
            profileId: TEST_CONFIG.testProfile
          });
        }
        const duration = performance.now() - startTime;
        results.push(duration);
      } catch (error) {
        window.Logger?.error(`Iteration ${i + 1} failed:`, error);
      }
      // Small delay between iterations
      if (i < TEST_CONFIG.iterations - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    const avgTime = results.reduce((a, b) => a + b, 0) / results.length;
    const minTime = Math.min(...results);
    const maxTime = Math.max(...results);
    const success = avgTime < 500;

    logTest('performance', testName, success, 
      `Avg: ${avgTime.toFixed(2)}ms, Min: ${minTime.toFixed(2)}ms, Max: ${maxTime.toFixed(2)}ms (target: < 500ms)`, 
      avgTime);
    return success;
  }

  /**
   * Test save performance
   */
  async function testSavePerformance() {
    const testName = 'Save Performance';
    const results = [];

    const field = document.getElementById(TEST_CONFIG.testPreference);
    if (!field) {
      logTest('performance', testName, false, 'Field not found', 0);
      return false;
    }

    for (let i = 0; i < TEST_CONFIG.iterations; i++) {
      const startTime = performance.now();
      try {
        // Set value
        field.value = String(parseInt(TEST_CONFIG.testValue) + i);
        field.dispatchEvent(new Event('input', { bubbles: true }));
        field.dispatchEvent(new Event('change', { bubbles: true }));

        // Save
        if (window.PreferencesGroupManager) {
          await window.PreferencesGroupManager.saveGroup(TEST_CONFIG.testGroup);
        }
        const duration = performance.now() - startTime;
        results.push(duration);
      } catch (error) {
        window.Logger?.error(`Iteration ${i + 1} failed:`, error);
      }
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const avgTime = results.reduce((a, b) => a + b, 0) / results.length;
    const minTime = Math.min(...results);
    const maxTime = Math.max(...results);
    const success = avgTime < 200;

    logTest('performance', testName, success, 
      `Avg: ${avgTime.toFixed(2)}ms, Min: ${minTime.toFixed(2)}ms, Max: ${maxTime.toFixed(2)}ms (target: < 200ms)`, 
      avgTime);
    return success;
  }

  /**
   * Run all performance tests
   */
  async function runPerformanceTests() {
    window.Logger?.info('='.repeat(60));
    window.Logger?.info('PERFORMANCE TESTS');
    window.Logger?.info('='.repeat(60));
    window.Logger?.info();

    await testLoadPerformance();
    await testSavePerformance();

    window.Logger?.info();
  }

  // ============================================================================
  // MAIN TEST RUNNER
  // ============================================================================

  /**
   * Run all tests
   */
  async function runAllTests() {
    window.Logger?.info('='.repeat(60));
    window.Logger?.info('PREFERENCES SYSTEM - AUTOMATED TEST SUITE');
    window.Logger?.info('='.repeat(60));
    window.Logger?.info();
    window.Logger?.info(`Test Configuration:`);
    window.Logger?.info(`  User ID: ${TEST_CONFIG.testUser}`);
    window.Logger?.info(`  Profile ID: ${TEST_CONFIG.testProfile}`);
    window.Logger?.info(`  Group: ${TEST_CONFIG.testGroup}`);
    window.Logger?.info(`  Preference: ${TEST_CONFIG.testPreference}`);
    window.Logger?.info(`  Test Value: ${TEST_CONFIG.testValue}`);
    window.Logger?.info();

    const overallStartTime = performance.now();

    // Run all test suites
    await runUnitTests();
    await runIntegrationTests();
    await runE2ETests();
    await runPerformanceTests();

    const overallDuration = performance.now() - overallStartTime;
    testResults.summary.duration = overallDuration;

    // Print summary
    window.Logger?.info('='.repeat(60));
    window.Logger?.info('TEST SUMMARY');
    window.Logger?.info('='.repeat(60));
    window.Logger?.info();
    window.Logger?.info(`Total Tests: ${testResults.summary.total}`);
    window.Logger?.info(`Passed: ${testResults.summary.passed} ✅`);
    window.Logger?.info(`Failed: ${testResults.summary.failed} ${testResults.summary.failed > 0 ? '❌' : ''}`);
    window.Logger?.info(`Total Duration: ${overallDuration.toFixed(2)}ms`);
    window.Logger?.info();

    // Print failed tests
    if (testResults.summary.failed > 0) {
      window.Logger?.info('Failed Tests:');
      Object.keys(testResults).forEach(category => {
        if (Array.isArray(testResults[category])) {
          testResults[category].forEach(result => {
            if (!result.passed) {
              window.Logger?.info(`  [${category.toUpperCase()}] ${result.test}: ${result.message}`);
            }
          });
        }
      });
      window.Logger?.info();
    }

    // Store results globally
    window.preferencesTestResults = testResults;

    window.Logger?.info('✅ Test results stored in window.preferencesTestResults');
    window.Logger?.info('   Access via: window.preferencesTestResults');
    window.Logger?.info();

    return testResults;
  }

  // Export to window
  window.runAllPreferenceTests = runAllTests;
  window.preferencesTestConfig = TEST_CONFIG;

  window.Logger?.info('✅ Automated preference test suite loaded');
  window.Logger?.info('   Run: window.runAllPreferenceTests()');
  window.Logger?.info();
})();

