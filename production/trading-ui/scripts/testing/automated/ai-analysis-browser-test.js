/**
 * AI Analysis System - Comprehensive Browser Test Suite
 * ======================================================
 * 
 * Automated test suite for AI Analysis system
 * Runs directly in browser console
 * 
 * Usage:
 *   1. Open ai-analysis.html in browser
 *   2. Open console (F12)
 *   3. Run: window.runAllAIAnalysisTests()
 * 
 * @version 1.0.0
 * @created January 28, 2025
 */

(function() {
  'use strict';

  const TEST_CONFIG = {
    timeout: 30000, // 30 seconds
    retries: 3,
    verbose: true
  };

  const testResults = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: [],
    startTime: null,
    endTime: null,
    duration: 0
  };

  /**
   * Test Logger
   */
  function logTest(name, passed, message = '', duration = 0) {
    testResults.total++;
    if (passed) {
      testResults.passed++;
      console.log(`✅ PASS: ${name}${message ? ` - ${message}` : ''}${duration ? ` (${duration.toFixed(2)}ms)` : ''}`);
    } else {
      testResults.failed++;
      console.error(`❌ FAIL: ${name}${message ? ` - ${message}` : ''}${duration ? ` (${duration.toFixed(2)}ms)` : ''}`);
    }
  }

  function logSection(title) {
    console.log('\n' + '='.repeat(60));
    console.log(title);
    console.log('='.repeat(60) + '\n');
  }

  /**
   * Wait for element
   */
  async function waitForElement(selector, timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const element = document.querySelector(selector);
      if (element) return element;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return null;
  }

  /**
   * Wait for function
   */
  async function waitForFunction(fn, timeout = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      try {
        const result = await fn();
        if (result) return result;
      } catch (e) {
        // Continue waiting
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return null;
  }

  /**
   * UNIT TESTS
   */
  async function runUnitTests() {
    logSection('UNIT TESTS');

    // Test 1: AIAnalysisData service
    try {
      const start = Date.now();
      const hasService = typeof window.AIAnalysisData !== 'undefined';
      const duration = Date.now() - start;
      logTest('AIAnalysisData service loaded', hasService, hasService ? 'Service available' : 'Service not found', duration);
      
      if (hasService) {
        const methods = ['loadTemplates', 'generateAnalysis', 'loadHistory', 'getLLMProviderSettings', 'saveAsNote', 'exportToPDF', 'validateAnalysisRequest', 'validateVariables'];
        methods.forEach(method => {
          const hasMethod = typeof window.AIAnalysisData[method] === 'function';
          logTest(`AIAnalysisData.${method}()`, hasMethod, hasMethod ? 'Method exists' : 'Method not found');
        });
      }
    } catch (error) {
      logTest('AIAnalysisData service', false, error.message);
      testResults.errors.push({ test: 'AIAnalysisData service', error: error.message });
    }

    // Test 2: AIAnalysisManager
    try {
      const hasManager = typeof window.AIAnalysisManager !== 'undefined';
      logTest('AIAnalysisManager loaded', hasManager, hasManager ? 'Manager available' : 'Manager not found');
      
      if (hasManager) {
        const methods = ['init', 'handleTemplateSelection', 'handleGenerateAnalysis', 'renderResults'];
        methods.forEach(method => {
          const hasMethod = typeof window.AIAnalysisManager[method] === 'function';
          logTest(`AIAnalysisManager.${method}()`, hasMethod, hasMethod ? 'Method exists' : 'Method not found');
        });
      }
    } catch (error) {
      logTest('AIAnalysisManager', false, error.message);
      testResults.errors.push({ test: 'AIAnalysisManager', error: error.message });
    }

    // Test 3: AITemplateSelector
    try {
      const hasSelector = typeof window.AITemplateSelector !== 'undefined';
      logTest('AITemplateSelector loaded', hasSelector, hasSelector ? 'Selector available' : 'Selector not found');
    } catch (error) {
      logTest('AITemplateSelector', false, error.message);
      testResults.errors.push({ test: 'AITemplateSelector', error: error.message });
    }

    // Test 4: AIResultRenderer
    try {
      const hasRenderer = typeof window.AIResultRenderer !== 'undefined';
      logTest('AIResultRenderer loaded', hasRenderer, hasRenderer ? 'Renderer available' : 'Renderer not found');
    } catch (error) {
      logTest('AIResultRenderer', false, error.message);
      testResults.errors.push({ test: 'AIResultRenderer', error: error.message });
    }

    // Test 5: AINotesIntegration
    try {
      const hasIntegration = typeof window.AINotesIntegration !== 'undefined';
      logTest('AINotesIntegration loaded', hasIntegration, hasIntegration ? 'Integration available' : 'Integration not found');
    } catch (error) {
      logTest('AINotesIntegration', false, error.message);
      testResults.errors.push({ test: 'AINotesIntegration', error: error.message });
    }

    // Test 6: AIExportService
    try {
      const hasExport = typeof window.AIExportService !== 'undefined';
      logTest('AIExportService loaded', hasExport, hasExport ? 'Export service available' : 'Export service not found');
    } catch (error) {
      logTest('AIExportService', false, error.message);
      testResults.errors.push({ test: 'AIExportService', error: error.message });
    }
  }

  /**
   * INTEGRATION TESTS
   */
  async function runIntegrationTests() {
    logSection('INTEGRATION TESTS');

    // Test 1: Load templates from API
    try {
      const start = Date.now();
      if (window.AIAnalysisData && window.AIAnalysisData.loadTemplates) {
        const templates = await window.AIAnalysisData.loadTemplates({ force: true });
        const duration = Date.now() - start;
        const success = Array.isArray(templates) && templates.length > 0;
        logTest('Load templates from API', success, success ? `Loaded ${templates.length} templates` : 'Failed to load templates', duration);
        
        if (success) {
          logTest('Templates have required fields', templates.every(t => t.id && t.name && t.prompt_text), 'All templates have required fields');
        }
      } else {
        logTest('Load templates from API', false, 'AIAnalysisData.loadTemplates not available');
      }
    } catch (error) {
      logTest('Load templates from API', false, error.message);
      testResults.errors.push({ test: 'Load templates', error: error.message });
    }

    // Test 2: Load LLM provider settings
    try {
      const start = Date.now();
      if (window.AIAnalysisData && window.AIAnalysisData.getLLMProviderSettings) {
        const settings = await window.AIAnalysisData.getLLMProviderSettings();
        const duration = Date.now() - start;
        const success = settings !== null;
        logTest('Load LLM provider settings', success, success ? 'Settings loaded' : 'Failed to load settings', duration);
      } else {
        logTest('Load LLM provider settings', false, 'AIAnalysisData.getLLMProviderSettings not available');
      }
    } catch (error) {
      logTest('Load LLM provider settings', false, error.message);
      testResults.errors.push({ test: 'Load LLM provider settings', error: error.message });
    }

    // Test 3: Load history
    try {
      const start = Date.now();
      if (window.AIAnalysisData && window.AIAnalysisData.loadHistory) {
        const history = await window.AIAnalysisData.loadHistory({ force: true });
        const duration = Date.now() - start;
        const success = Array.isArray(history);
        logTest('Load analysis history', success, success ? `Loaded ${history.length} history items` : 'Failed to load history', duration);
      } else {
        logTest('Load analysis history', false, 'AIAnalysisData.loadHistory not available');
      }
    } catch (error) {
      logTest('Load analysis history', false, error.message);
      testResults.errors.push({ test: 'Load history', error: error.message });
    }

    // Test 4: Integration with NotificationSystem
    try {
      const hasNotification = typeof window.NotificationSystem !== 'undefined';
      logTest('NotificationSystem integration', hasNotification, hasNotification ? 'NotificationSystem available' : 'NotificationSystem not found');
    } catch (error) {
      logTest('NotificationSystem integration', false, error.message);
    }

    // Test 5: Integration with UnifiedCacheManager
    try {
      const hasCache = typeof window.UnifiedCacheManager !== 'undefined';
      logTest('UnifiedCacheManager integration', hasCache, hasCache ? 'UnifiedCacheManager available' : 'UnifiedCacheManager not found');
    } catch (error) {
      logTest('UnifiedCacheManager integration', false, error.message);
    }

    // Test 6: Validate analysis request (Business Logic integration)
    try {
      const start = Date.now();
      if (window.AIAnalysisData && window.AIAnalysisData.validateAnalysisRequest) {
        const validationResult = await window.AIAnalysisData.validateAnalysisRequest({
          template_id: 1,
          variables: { stock_ticker: 'TSLA', goal: 'Investment' },
          provider: 'gemini'
        });
        const duration = Date.now() - start;
        const success = typeof validationResult === 'object' && 'is_valid' in validationResult;
        logTest('Validate analysis request', success, success ? (validationResult.is_valid ? 'Validation passed' : 'Validation failed (expected)') : 'Validation function error', duration);
      } else {
        logTest('Validate analysis request', false, 'AIAnalysisData.validateAnalysisRequest not available');
      }
    } catch (error) {
      logTest('Validate analysis request', false, error.message);
      testResults.errors.push({ test: 'Validate analysis request', error: error.message });
    }

    // Test 7: Validate variables (Business Logic integration)
    try {
      const start = Date.now();
      if (window.AIAnalysisData && window.AIAnalysisData.validateVariables) {
        const validationResult = await window.AIAnalysisData.validateVariables({
          stock_ticker: 'TSLA',
          goal: 'Investment'
        });
        const duration = Date.now() - start;
        const success = typeof validationResult === 'object' && 'is_valid' in validationResult;
        logTest('Validate variables', success, success ? (validationResult.is_valid ? 'Variables valid' : 'Variables invalid (expected)') : 'Validation function error', duration);
      } else {
        logTest('Validate variables', false, 'AIAnalysisData.validateVariables not available');
      }
    } catch (error) {
      logTest('Validate variables', false, error.message);
      testResults.errors.push({ test: 'Validate variables', error: error.message });
    }
  }

  /**
   * E2E TESTS
   */
  async function runE2ETests() {
    logSection('E2E TESTS');

    // Test 1: Page loads correctly
    try {
      const start = Date.now();
      const pageLoaded = document.readyState === 'complete';
      const duration = Date.now() - start;
      logTest('Page loads correctly', pageLoaded, pageLoaded ? 'Page ready' : 'Page not ready', duration);
    } catch (error) {
      logTest('Page loads correctly', false, error.message);
      testResults.errors.push({ test: 'Page load', error: error.message });
    }

    // Test 2: Templates container exists
    try {
      const container = await waitForElement('#templatesContainer');
      logTest('Templates container exists', container !== null, container ? 'Container found' : 'Container not found');
    } catch (error) {
      logTest('Templates container exists', false, error.message);
      testResults.errors.push({ test: 'Templates container', error: error.message });
    }

    // Test 3: Form section exists
    try {
      const formSection = await waitForElement('#ai-analysis-form');
      logTest('Form section exists', formSection !== null, formSection ? 'Form section found' : 'Form section not found');
    } catch (error) {
      logTest('Form section exists', false, error.message);
      testResults.errors.push({ test: 'Form section', error: error.message });
    }

    // Test 4: Results section exists
    try {
      const resultsSection = await waitForElement('#ai-analysis-results');
      logTest('Results section exists', resultsSection !== null, resultsSection ? 'Results section found' : 'Results section not found');
    } catch (error) {
      logTest('Results section exists', false, error.message);
      testResults.errors.push({ test: 'Results section', error: error.message });
    }

    // Test 5: History section exists
    try {
      const historySection = await waitForElement('#ai-analysis-history');
      logTest('History section exists', historySection !== null, historySection ? 'History section found' : 'History section not found');
    } catch (error) {
      logTest('History section exists', false, error.message);
      testResults.errors.push({ test: 'History section', error: error.message });
    }

    // Test 6: Manager initializes
    try {
      const start = Date.now();
      if (window.AIAnalysisManager) {
        await window.AIAnalysisManager.init();
        const duration = Date.now() - start;
        const initialized = window.AIAnalysisManager.initialized === true;
        logTest('Manager initializes', initialized, initialized ? 'Manager initialized' : 'Manager not initialized', duration);
      } else {
        logTest('Manager initializes', false, 'AIAnalysisManager not available');
      }
    } catch (error) {
      logTest('Manager initializes', false, error.message);
      testResults.errors.push({ test: 'Manager initialization', error: error.message });
    }

    // Test 7: Templates render
    try {
      const start = Date.now();
      await waitForFunction(async () => {
        const container = document.querySelector('#templatesContainer');
        if (!container) return false;
        const cards = container.querySelectorAll('.card');
        return cards.length > 0;
      }, 10000);
      const duration = Date.now() - start;
      const container = document.querySelector('#templatesContainer');
      const cards = container ? container.querySelectorAll('.card') : [];
      logTest('Templates render', cards.length > 0, cards.length > 0 ? `Rendered ${cards.length} template cards` : 'No templates rendered', duration);
    } catch (error) {
      logTest('Templates render', false, error.message);
      testResults.errors.push({ test: 'Templates render', error: error.message });
    }

    // Test 8: Form appears after template selection
    try {
      if (window.AIAnalysisManager && window.AIAnalysisManager.templates && window.AIAnalysisManager.templates.length > 0) {
        const template = window.AIAnalysisManager.templates[0];
        await window.AIAnalysisManager.handleTemplateSelection(template.id);
        await new Promise(resolve => setTimeout(resolve, 1000));
        const formSection = document.querySelector('#ai-analysis-form');
        const isVisible = formSection && formSection.style.display !== 'none';
        logTest('Form appears after template selection', isVisible, isVisible ? 'Form visible' : 'Form not visible');
      } else {
        logTest('Form appears after template selection', false, 'No templates available');
      }
    } catch (error) {
      logTest('Form appears after template selection', false, error.message);
      testResults.errors.push({ test: 'Form after selection', error: error.message });
    }
  }

  /**
   * PERFORMANCE TESTS
   */
  async function runPerformanceTests() {
    logSection('PERFORMANCE TESTS');

    // Test 1: Page load time
    try {
      const loadTime = window.performance?.timing ? 
        window.performance.timing.loadEventEnd - window.performance.timing.navigationStart : null;
      if (loadTime) {
        const passed = loadTime < 5000; // Less than 5 seconds
        logTest('Page load time', passed, `${loadTime}ms`, loadTime);
      } else {
        logTest('Page load time', false, 'Performance timing not available');
      }
    } catch (error) {
      logTest('Page load time', false, error.message);
    }

    // Test 2: Templates load time
    try {
      const start = Date.now();
      if (window.AIAnalysisData && window.AIAnalysisData.loadTemplates) {
        await window.AIAnalysisData.loadTemplates({ force: true });
        const duration = Date.now() - start;
        const passed = duration < 3000; // Less than 3 seconds
        logTest('Templates load time', passed, `${duration}ms`, duration);
      } else {
        logTest('Templates load time', false, 'AIAnalysisData.loadTemplates not available');
      }
    } catch (error) {
      logTest('Templates load time', false, error.message);
    }

    // Test 3: Manager initialization time
    try {
      const start = Date.now();
      if (window.AIAnalysisManager) {
        await window.AIAnalysisManager.init();
        const duration = Date.now() - start;
        const passed = duration < 2000; // Less than 2 seconds
        logTest('Manager initialization time', passed, `${duration}ms`, duration);
      } else {
        logTest('Manager initialization time', false, 'AIAnalysisManager not available');
      }
    } catch (error) {
      logTest('Manager initialization time', false, error.message);
    }
  }

  /**
   * Run all tests
   */
  async function runAllTests() {
    testResults.startTime = Date.now();
    
    console.log('\n' + '='.repeat(60));
    console.log('AI ANALYSIS SYSTEM - AUTOMATED TEST SUITE');
    console.log('='.repeat(60));
    console.log(`\nTest Configuration:`);
    console.log(`  Timeout: ${TEST_CONFIG.timeout}ms`);
    console.log(`  Retries: ${TEST_CONFIG.retries}`);
    console.log(`  Verbose: ${TEST_CONFIG.verbose}`);
    console.log('');

    try {
      await runUnitTests();
      await runIntegrationTests();
      await runE2ETests();
      await runPerformanceTests();
    } catch (error) {
      console.error('❌ Test suite error:', error);
      testResults.errors.push({ test: 'Test suite', error: error.message });
    }

    testResults.endTime = Date.now();
    testResults.duration = testResults.endTime - testResults.startTime;

    // Print summary
    logSection('TEST SUMMARY');
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`Passed: ${testResults.passed} ✅`);
    console.log(`Failed: ${testResults.failed} ${testResults.failed > 0 ? '❌' : ''}`);
    console.log(`Total Duration: ${testResults.duration.toFixed(2)}ms`);
    
    if (testResults.errors.length > 0) {
      console.log('\nErrors:');
      testResults.errors.forEach((err, idx) => {
        console.log(`  ${idx + 1}. ${err.test}: ${err.error}`);
      });
    }

    console.log('\n' + '='.repeat(60) + '\n');

    return testResults;
  }

  // Expose to global scope
  window.runAllAIAnalysisTests = runAllTests;
  window.aiAnalysisTestResults = testResults;

  console.log('✅ AI Analysis automated test suite loaded');
  console.log('Run: window.runAllAIAnalysisTests()');
})();


