/**
 * Comprehensive Initialization Test - TikTrack
 * ============================================
 * 
 * Tests the complete initialization system to ensure:
 * - core-systems.js loads correctly
 * - Preferences initialize once
 * - No duplicate initializations
 * - All required systems available
 * 
 * Usage:
 * 1. Open browser console
 * 2. Run: window.runComprehensiveInitializationTest()
 * 
 * @version 1.0.0
 * @created 2025-01-27
 * @author TikTrack Development Team
 */

(function() {
  'use strict';

  if (typeof window.ComprehensiveInitializationTest !== 'undefined') {
    return; // Already loaded
  }

  class ComprehensiveInitializationTest {
    constructor() {
      this.results = {
        coreSystemsLoaded: false,
        preferencesInitialized: false,
        duplicateInitializations: [],
        missingSystems: [],
        errors: [],
        warnings: [],
        networkCalls: []
      };
    }

    /**
     * Test if core-systems.js is loaded
     */
    testCoreSystems() {
      const hasUnifiedAppInitializer = typeof window.UnifiedAppInitializer !== 'undefined';
      const hasInitializeUnifiedApp = typeof window.initializeUnifiedApp === 'function';
      
      this.results.coreSystemsLoaded = hasUnifiedAppInitializer && hasInitializeUnifiedApp;
      
      if (!this.results.coreSystemsLoaded) {
        this.results.errors.push('core-systems.js not loaded - UnifiedAppInitializer or initializeUnifiedApp missing');
      }
      
      return this.results.coreSystemsLoaded;
    }

    /**
     * Test preferences initialization
     */
    async testPreferencesInitialization() {
      // Check if preferences were initialized
      const hasPreferencesCore = typeof window.PreferencesCore !== 'undefined';
      const hasCurrentPreferences = typeof window.currentPreferences !== 'undefined' && window.currentPreferences !== null;
      
      // Check network calls for preferences
      const performanceEntries = performance.getEntriesByType('resource');
      const preferencesCalls = performanceEntries.filter(entry => 
        entry.name.includes('/api/preferences/user')
      );
      
      this.results.networkCalls = preferencesCalls.map(call => ({
        url: call.name,
        duration: call.duration,
        timestamp: call.startTime
      }));
      
      // Check for duplicate calls
      if (preferencesCalls.length > 1) {
        this.results.duplicateInitializations.push({
          type: 'preferences',
          count: preferencesCalls.length,
          calls: this.results.networkCalls
        });
        this.results.warnings.push(`Preferences API called ${preferencesCalls.length} times (should be 1)`);
      }
      
      this.results.preferencesInitialized = hasPreferencesCore && (hasCurrentPreferences || preferencesCalls.length > 0);
      
      if (!this.results.preferencesInitialized) {
        this.results.errors.push('Preferences not initialized - PreferencesCore missing or no API calls');
      }
      
      return this.results.preferencesInitialized;
    }

    /**
     * Test for duplicate initializations
     */
    testDuplicateInitializations() {
      // Check for multiple UnifiedAppInitializer instances
      const initCalls = [];
      
      // Check console for initialization messages
      const consoleMessages = [];
      if (window.console && window.console.log) {
        // This is a simplified check - in real scenario would need to intercept console
        consoleMessages.push('Checking initialization state...');
      }
      
      // Check if unified-app-initializer.js is still loaded
      const hasOldInitializer = typeof window.UnifiedAppInitializer !== 'undefined' && 
                                window.UnifiedAppInitializer.constructor.toString().includes('unified-app-initializer');
      
      if (hasOldInitializer) {
        this.results.duplicateInitializations.push({
          type: 'initializer',
          message: 'Old unified-app-initializer.js may still be loaded'
        });
        this.results.warnings.push('Possible conflict: old initializer detected');
      }
      
      return this.results.duplicateInitializations.length === 0;
    }

    /**
     * Test required systems availability
     */
    testRequiredSystems() {
      const requiredSystems = [
        { name: 'UnifiedAppInitializer', check: () => typeof window.UnifiedAppInitializer !== 'undefined' },
        { name: 'PreferencesCore', check: () => typeof window.PreferencesCore !== 'undefined' },
        { name: 'NotificationSystem', check: () => typeof window.NotificationSystem !== 'undefined' },
        { name: 'UnifiedCacheManager', check: () => typeof window.UnifiedCacheManager !== 'undefined' },
        { name: 'initializeUnifiedApp', check: () => typeof window.initializeUnifiedApp === 'function' }
      ];
      
      for (const system of requiredSystems) {
        if (!system.check()) {
          this.results.missingSystems.push(system.name);
        }
      }
      
      return this.results.missingSystems.length === 0;
    }

    /**
     * Check for 429 errors
     */
    async test429Errors() {
      const performanceEntries = performance.getEntriesByType('resource');
      const failedRequests = performanceEntries.filter(entry => {
        // Check if entry has response status
        if (entry.responseStatus) {
          return entry.responseStatus === 429;
        }
        return false;
      });
      
      if (failedRequests.length > 0) {
        this.results.errors.push(`Found ${failedRequests.length} 429 errors (Too Many Requests)`);
        failedRequests.forEach(req => {
          this.results.errors.push(`429 error: ${req.name}`);
        });
      }
      
      return failedRequests.length === 0;
    }

    /**
     * Run all tests
     */
    async runAllTests() {
      console.group('🧪 Comprehensive Initialization Test');
      
      console.log('Testing core-systems.js...');
      this.testCoreSystems();
      
      console.log('Testing preferences initialization...');
      await this.testPreferencesInitialization();
      
      console.log('Testing for duplicate initializations...');
      this.testDuplicateInitializations();
      
      console.log('Testing required systems...');
      this.testRequiredSystems();
      
      console.log('Testing for 429 errors...');
      await this.test429Errors();
      
      console.groupEnd();
      
      return this.results;
    }

    /**
     * Print test results
     */
    printResults() {
      console.group('📊 Test Results');
      
      console.log(`Core Systems Loaded: ${this.results.coreSystemsLoaded ? '✅' : '❌'}`);
      console.log(`Preferences Initialized: ${this.results.preferencesInitialized ? '✅' : '❌'}`);
      console.log(`Duplicate Initializations: ${this.results.duplicateInitializations.length === 0 ? '✅' : '❌'} (${this.results.duplicateInitializations.length})`);
      console.log(`Missing Systems: ${this.results.missingSystems.length === 0 ? '✅' : '❌'} (${this.results.missingSystems.join(', ')})`);
      console.log(`Errors: ${this.results.errors.length === 0 ? '✅' : '❌'} (${this.results.errors.length})`);
      console.log(`Warnings: ${this.results.warnings.length === 0 ? '✅' : '⚠️'} (${this.results.warnings.length})`);
      
      if (this.results.networkCalls.length > 0) {
        console.group('🌐 Network Calls:');
        this.results.networkCalls.forEach((call, index) => {
          console.log(`${index + 1}. ${call.url} (${call.duration.toFixed(2)}ms)`);
        });
        console.groupEnd();
      }
      
      if (this.results.errors.length > 0) {
        console.group('❌ Errors:');
        this.results.errors.forEach(error => console.error(error));
        console.groupEnd();
      }
      
      if (this.results.warnings.length > 0) {
        console.group('⚠️ Warnings:');
        this.results.warnings.forEach(warning => console.warn(warning));
        console.groupEnd();
      }
      
      const allPassed = this.results.coreSystemsLoaded && 
                       this.results.preferencesInitialized && 
                       this.results.duplicateInitializations.length === 0 &&
                       this.results.missingSystems.length === 0 &&
                       this.results.errors.length === 0;
      
      console.log(`\n${allPassed ? '✅ All tests passed!' : '❌ Some tests failed'}`);
      console.groupEnd();
      
      return allPassed;
    }
  }

  // Export
  window.ComprehensiveInitializationTest = ComprehensiveInitializationTest;

  // Global function for easy access
  window.runComprehensiveInitializationTest = async function() {
    const test = new ComprehensiveInitializationTest();
    await test.runAllTests();
    return test.printResults();
  };

  console.log('✅ Comprehensive Initialization Test loaded - Run: window.runComprehensiveInitializationTest()');
})();


