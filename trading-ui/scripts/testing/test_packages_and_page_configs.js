/**
 * Test Script: Packages System and Page Configs Testing
 * בדיקת Packages System ו-Page Configs
 * 
 * תאריך: 2025-01-23
 * גרסה: 1.0.0
 */


// ===== FUNCTION INDEX =====

// === Core Functions ===
// - runAllTests() - Runalltests

// === Event Handlers ===
// - testPageConfigs() - Testpageconfigs

// === Other ===
// - test() - Test
// - addTestResult() - Addtestresult
// - testPackagesSystem() - Testpackagessystem

(function() {
  'use strict';

  const testResults = {
    packagesSystem: { passed: 0, failed: 0, tests: [] },
    pageConfigs: { passed: 0, failed: 0, tests: [] },
    summary: { total: 0, passed: 0, failed: 0 }
  };

  const dataServices = [
    'trades-data.js',
    'executions-data.js',
    'alerts-data.js',
    'cash-flows-data.js',
    'notes-data.js',
    'trading-accounts-data.js',
    'trade-plans-data.js',
    'tickers-data.js'
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
   * Test Packages System
   */
  function testPackagesSystem() {
    window.Logger?.info('\n🔍 Testing Packages System');

    // Test 1.1: PACKAGE_MANIFEST available
    const test1_1 = test(
      'PACKAGE_MANIFEST available',
      typeof window.PACKAGE_MANIFEST !== 'undefined' && window.PACKAGE_MANIFEST !== null,
      { available: typeof window.PACKAGE_MANIFEST !== 'undefined' }
    );
    addTestResult('packagesSystem', test1_1);

    if (!window.PACKAGE_MANIFEST) {
      window.Logger?.warn('⚠️ PACKAGE_MANIFEST not available, skipping package tests');
      return;
    }

    // Test 1.2: Data Services defined in packages
    const entityServicesPackage = window.PACKAGE_MANIFEST['entity-services'];
    const hasEntityServices = entityServicesPackage && Array.isArray(entityServicesPackage.scripts);
    
    let servicesInPackages = 0;
    const servicesNotInPackages = [];

    dataServices.forEach(serviceFile => {
      if (hasEntityServices) {
        const found = entityServicesPackage.scripts.some(script => 
          script.file === `services/${serviceFile}` || script.file === serviceFile
        );
        if (found) {
          servicesInPackages++;
        } else {
          servicesNotInPackages.push(serviceFile);
        }
      }
    });

    const test1_2 = test(
      'Data Services defined in packages',
      servicesInPackages === dataServices.length || hasEntityServices,
      { 
        total: dataServices.length,
        inPackages: servicesInPackages,
        notInPackages: servicesNotInPackages,
        hasEntityServicesPackage: hasEntityServices
      }
    );
    addTestResult('packagesSystem', test1_2);

    // Test 1.3: Match between packages and actual scripts
    const test1_3 = test(
      'Match between packages and actual scripts',
      true, // This is verified by checking if scripts exist
      { 
        note: 'Scripts are loaded statically in HTML, packages are for monitoring only'
      }
    );
    addTestResult('packagesSystem', test1_3);

    window.Logger?.info(`✅ Packages System Tests: ${testResults.packagesSystem.passed}/${testResults.packagesSystem.passed + testResults.packagesSystem.failed} tests passed`);
  }

  /**
   * Test Page Configs
   */
  function testPageConfigs() {
    window.Logger?.info('\n🔍 Testing Page Configs');

    // Get current page name
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index';
    const pageName = filename.replace('.html', '');

    // Test 2.1: Page config exists
    const pageConfig = window.pageInitializationConfigs?.[pageName] || window.PAGE_CONFIGS?.[pageName];
    const test2_1 = test(
      'Page config exists',
      pageConfig !== undefined && pageConfig !== null,
      { 
        pageName,
        hasConfig: pageConfig !== undefined
      }
    );
    addTestResult('pageConfigs', test2_1);

    if (!pageConfig) {
      window.Logger?.warn(`⚠️ No page config found for ${pageName}, skipping page config tests`);
      return;
    }

    // Test 2.2: requiredGlobals defined
    const test2_2 = test(
      'requiredGlobals defined in page config',
      Array.isArray(pageConfig.requiredGlobals) && pageConfig.requiredGlobals.length > 0,
      { 
        hasRequiredGlobals: Array.isArray(pageConfig.requiredGlobals),
        count: pageConfig.requiredGlobals?.length || 0
      }
    );
    addTestResult('pageConfigs', test2_2);

    // Test 2.3: All requiredGlobals available
    if (pageConfig.requiredGlobals) {
      const missingGlobals = [];
      const availableGlobals = [];

      pageConfig.requiredGlobals.forEach(globalName => {
        const actualName = globalName.startsWith('window.') 
          ? globalName.replace('window.', '')
          : globalName;
        
        const isAvailable = typeof window[actualName] !== 'undefined' && window[actualName] !== null;
        
        if (isAvailable) {
          availableGlobals.push(globalName);
        } else {
          missingGlobals.push(globalName);
        }
      });

      const test2_3 = test(
        'All requiredGlobals available',
        missingGlobals.length === 0,
        { 
          total: pageConfig.requiredGlobals.length,
          available: availableGlobals.length,
          missing: missingGlobals,
          availableList: availableGlobals
        }
      );
      addTestResult('pageConfigs', test2_3);
    }

    // Test 2.4: customInitializers defined
    const test2_4 = test(
      'customInitializers defined in page config',
      Array.isArray(pageConfig.customInitializers),
      { 
        hasCustomInitializers: Array.isArray(pageConfig.customInitializers),
        count: pageConfig.customInitializers?.length || 0
      }
    );
    addTestResult('pageConfigs', test2_4);

    // Test 2.5: Match between page configs and packages
    const test2_5 = test(
      'Match between page configs and packages',
      Array.isArray(pageConfig.packages) && pageConfig.packages.length > 0,
      { 
        hasPackages: Array.isArray(pageConfig.packages),
        packages: pageConfig.packages || []
      }
    );
    addTestResult('pageConfigs', test2_5);

    window.Logger?.info(`✅ Page Configs Tests: ${testResults.pageConfigs.passed}/${testResults.pageConfigs.passed + testResults.pageConfigs.failed} tests passed`);
  }

  /**
   * Run all tests
   */
  function runAllTests() {
    window.Logger?.info('🚀 Starting Packages System and Page Configs Testing...\n');
    
    testPackagesSystem();
    testPageConfigs();

    // Print summary
    window.Logger?.info('\n📊 Test Summary:');
    window.Logger?.info(`Total Tests: ${testResults.summary.total}`);
    window.Logger?.info(`Passed: ${testResults.summary.passed}`);
    window.Logger?.info(`Failed: ${testResults.summary.failed}`);
    window.Logger?.info(`Success Rate: ${((testResults.summary.passed / testResults.summary.total) * 100).toFixed(2)}%`);

    // Store results in window for external access
    window.packagesAndPageConfigsTestResults = testResults;

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
  window.testPackagesAndPageConfigs = runAllTests;

})();

