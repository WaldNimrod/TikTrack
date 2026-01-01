/**
 * Preferences Loading Complete Test
 * בדיקות מקיפות לטעינת העדפות: סדר טעינה, Events, Flags, Performance
 * 
 * @version 1.0.0
 * @created 2025-01-27
 * @author TikTrack Development Team
 * 
 * Documentation: See documentation/02-ARCHITECTURE/FRONTEND/PREFERENCES_LOADING_BEST_PRACTICES.md
 */


// ===== FUNCTION INDEX =====
// === Class Methods ===
// - PreferencesLoadingCompleteTest.checkFlags() - Checkflags
// - PreferencesLoadingCompleteTest.checkLoadOrder() - Checkloadorder
// - PreferencesLoadingCompleteTest.cleanupEventListeners() - Cleanupeventlisteners
// - PreferencesLoadingCompleteTest.generateJSONReport() - Generatejsonreport
// - PreferencesLoadingCompleteTest.measurePerformance() - Measureperformance
// - PreferencesLoadingCompleteTest.printSummary() - Printsummary
// - PreferencesLoadingCompleteTest.setupEventListeners() - Setupeventlisteners
// - PreferencesLoadingCompleteTest.updatePerformanceMetrics() - Updateperformancemetrics

// === Event Handlers ===
// - handler() - Handler

(function() {
  'use strict';

  /**
   * Preferences Loading Complete Test Class
   */
  class PreferencesLoadingCompleteTest {
    constructor() {
      this.results = {
        loadOrder: {},
        events: {},
        flags: {},
        performance: {},
        overall: 'pending'
      };

      this.eventListeners = [];
      this.performanceMetrics = {
        criticalLoadTime: null,
        allLoadTime: null,
        cacheHitTime: null,
        cacheMissTime: null
      };
    }

    /**
     * Setup event listeners for preferences events
     */
    setupEventListeners() {
      const events = [
        'preferences:critical-loaded',
        'preferences:all-loaded',
        'preferences:cache-hit',
        'preferences:cache-miss'
      ];

      events.forEach(eventName => {
        const handler = (event) => {
          this.results.events[eventName] = {
            fired: true,
            timestamp: Date.now(),
            detail: event.detail || {}
          };
          window.Logger?.info(`✅ Event fired: ${eventName}`, event.detail);
        };

        window.addEventListener(eventName, handler);
        this.eventListeners.push({ eventName, handler });
      });
    }

    /**
     * Cleanup event listeners
     */
    cleanupEventListeners() {
      this.eventListeners.forEach(({ eventName, handler }) => {
        window.removeEventListener(eventName, handler);
      });
      this.eventListeners = [];
    }

    /**
     * Check load order of preferences scripts
     */
    checkLoadOrder() {
      const scripts = Array.from(document.querySelectorAll('script[src]'))
        .map(script => script.src)
        .filter(src => src.includes('preferences'));

      const order = {
        'preferences-v4.js': scripts.findIndex(s => s.includes('preferences-v4.js')),
        'preferences-core.js': scripts.findIndex(s => s.includes('preferences-core.js')),
        'preferences-ui-v4.js': scripts.findIndex(s => s.includes('preferences-ui-v4.js')),
        'preferences-group-manager.js': scripts.findIndex(s => s.includes('preferences-group-manager.js')),
        'preferences-lazy-loader.js': scripts.findIndex(s => s.includes('preferences-lazy-loader.js'))
      };

      const issues = [];

      // Check preferences-v4.js before preferences-core.js
      if (order['preferences-v4.js'] !== -1 && order['preferences-core.js'] !== -1) {
        if (order['preferences-v4.js'] > order['preferences-core.js']) {
          issues.push('preferences-v4.js should be loaded before preferences-core.js');
        }
      }

      // Check preferences-ui-v4.js before preferences-group-manager.js
      if (order['preferences-ui-v4.js'] !== -1 && order['preferences-group-manager.js'] !== -1) {
        if (order['preferences-ui-v4.js'] > order['preferences-group-manager.js']) {
          issues.push('preferences-ui-v4.js should be loaded before preferences-group-manager.js');
        }
      }

      this.results.loadOrder = {
        order,
        scripts,
        passed: issues.length === 0,
        issues,
        message: issues.length === 0
          ? '✅ Preferences scripts loaded in correct order'
          : `❌ Load order issues: ${issues.join(', ')}`
      };

      return this.results.loadOrder;
    }

    /**
     * Check if events are fired correctly
     */
    async checkEvents(timeout = 10000) {
      return new Promise((resolve) => {
        const startTime = Date.now();
        const checkInterval = setInterval(() => {
          const elapsed = Date.now() - startTime;

          // Check if all expected events have fired
          const criticalLoaded = this.results.events['preferences:critical-loaded'];
          const allLoaded = this.results.events['preferences:all-loaded'];
          const cacheHit = this.results.events['preferences:cache-hit'];
          const cacheMiss = this.results.events['preferences:cache-miss'];

          // Check if we have at least critical-loaded or timeout
          if (criticalLoaded || elapsed > timeout) {
            clearInterval(checkInterval);

            const eventsPassed = !!criticalLoaded;
            const eventsMessage = criticalLoaded
              ? '✅ preferences:critical-loaded event fired'
              : '❌ preferences:critical-loaded event not fired within timeout';

            this.results.events = {
              ...this.results.events,
              passed: eventsPassed,
              message: eventsMessage,
              summary: {
                'preferences:critical-loaded': !!criticalLoaded,
                'preferences:all-loaded': !!allLoaded,
                'preferences:cache-hit': !!cacheHit,
                'preferences:cache-miss': !!cacheMiss
              }
            };

            resolve(this.results.events);
          }
        }, 100);
      });
    }

    /**
     * Check if flags are set correctly
     */
    checkFlags() {
      const flags = {
        __preferencesCriticalLoaded: !!window.__preferencesCriticalLoaded,
        __preferencesCriticalLoadedDetail: !!window.__preferencesCriticalLoadedDetail,
        currentPreferences: !!(window.currentPreferences && Object.keys(window.currentPreferences).length > 0)
      };

      const allFlagsSet = flags.__preferencesCriticalLoaded && flags.currentPreferences;
      const flagsMessage = allFlagsSet
        ? '✅ All preference flags set correctly'
        : `⚠️ Some flags not set: ${Object.entries(flags).filter(([_, v]) => !v).map(([k]) => k).join(', ')}`;

      this.results.flags = {
        flags,
        passed: allFlagsSet,
        message: flagsMessage
      };

      return this.results.flags;
    }

    /**
     * Measure performance metrics
     */
    measurePerformance() {
      const metrics = {
        criticalLoadTime: this.performanceMetrics.criticalLoadTime,
        allLoadTime: this.performanceMetrics.allLoadTime,
        cacheHitTime: this.performanceMetrics.cacheHitTime,
        cacheMissTime: this.performanceMetrics.cacheMissTime
      };

      // Performance thresholds
      const thresholds = {
        criticalLoadWithCache: 100, // ms
        criticalLoadWithoutCache: 500, // ms
        allLoadWithCache: 200, // ms
        allLoadWithoutCache: 1000 // ms
      };

      const cacheHit = !!this.results.events['preferences:cache-hit']?.fired;
      const criticalLoadTime = metrics.criticalLoadTime;
      const allLoadTime = metrics.allLoadTime;

      const performanceIssues = [];

      if (criticalLoadTime !== null) {
        const threshold = cacheHit ? thresholds.criticalLoadWithCache : thresholds.criticalLoadWithoutCache;
        if (criticalLoadTime > threshold) {
          performanceIssues.push(`Critical load time (${criticalLoadTime}ms) exceeds threshold (${threshold}ms)`);
        }
      }

      if (allLoadTime !== null) {
        const threshold = cacheHit ? thresholds.allLoadWithCache : thresholds.allLoadWithoutCache;
        if (allLoadTime > threshold) {
          performanceIssues.push(`All load time (${allLoadTime}ms) exceeds threshold (${threshold}ms)`);
        }
      }

      const performancePassed = performanceIssues.length === 0;
      const performanceMessage = performancePassed
        ? '✅ Performance metrics within acceptable thresholds'
        : `⚠️ Performance issues: ${performanceIssues.join(', ')}`;

      this.results.performance = {
        metrics,
        thresholds,
        cacheHit,
        passed: performancePassed,
        issues: performanceIssues,
        message: performanceMessage
      };

      return this.results.performance;
    }

    /**
     * Update performance metrics from event details
     */
    updatePerformanceMetrics(eventName, detail) {
      if (detail && detail.loadTime) {
        const loadTime = parseFloat(detail.loadTime.replace('ms', ''));
        
        if (eventName === 'preferences:critical-loaded') {
          this.performanceMetrics.criticalLoadTime = loadTime;
        } else if (eventName === 'preferences:all-loaded') {
          this.performanceMetrics.allLoadTime = loadTime;
        } else if (eventName === 'preferences:cache-hit') {
          this.performanceMetrics.cacheHitTime = loadTime;
        } else if (eventName === 'preferences:cache-miss') {
          this.performanceMetrics.cacheMissTime = loadTime;
        }
      }
    }

    /**
     * Run complete test suite
     */
    async runCompleteTest(timeout = 10000) {
      window.Logger?.info('🧪 Starting Preferences Loading Complete Test...\n');

      // Setup event listeners
      this.setupEventListeners();

      // Check load order
      window.Logger?.info('📋 Checking load order...');
      const loadOrderResult = this.checkLoadOrder();
      window.Logger?.info(loadOrderResult.message);

      // Wait for events
      window.Logger?.info('\n⏳ Waiting for preferences events (timeout: ' + timeout + 'ms)...');
      const eventsResult = await this.checkEvents(timeout);
      window.Logger?.info(eventsResult.message);

      // Check flags
      window.Logger?.info('\n🏁 Checking preference flags...');
      const flagsResult = this.checkFlags();
      window.Logger?.info(flagsResult.message);

      // Measure performance
      window.Logger?.info('\n⚡ Measuring performance...');
      const performanceResult = this.measurePerformance();
      window.Logger?.info(performanceResult.message);

      // Calculate overall status
      const allPassed = loadOrderResult.passed && 
                       eventsResult.passed && 
                       flagsResult.passed && 
                       performanceResult.passed;

      this.results.overall = allPassed ? 'passed' : 'warning';

      // Cleanup
      this.cleanupEventListeners();

      // Print summary
      this.printSummary();

      return this.results;
    }

    /**
     * Print test summary
     */
    printSummary() {
      window.Logger?.info('\n' + '='.repeat(60));
      window.Logger?.info('📊 COMPLETE TEST SUMMARY');
      window.Logger?.info('='.repeat(60));
      window.Logger?.info(`Overall Status: ${this.results.overall.toUpperCase()}`);
      window.Logger?.info('\n📋 Load Order:');
      window.Logger?.info(`  ${this.results.loadOrder.message}`);
      window.Logger?.info('\n📡 Events:');
      window.Logger?.info(`  ${this.results.events.message}`);
      if (this.results.events.summary) {
        Object.entries(this.results.events.summary).forEach(([event, fired]) => {
          window.Logger?.info(`    ${fired ? '✅' : '❌'} ${event}`);
        });
      }
      window.Logger?.info('\n🏁 Flags:');
      window.Logger?.info(`  ${this.results.flags.message}`);
      if (this.results.flags.flags) {
        Object.entries(this.results.flags.flags).forEach(([flag, set]) => {
          window.Logger?.info(`    ${set ? '✅' : '❌'} ${flag}`);
        });
      }
      window.Logger?.info('\n⚡ Performance:');
      window.Logger?.info(`  ${this.results.performance.message}`);
      if (this.results.performance.metrics) {
        Object.entries(this.results.performance.metrics).forEach(([metric, value]) => {
          if (value !== null) {
            window.Logger?.info(`    ${metric}: ${value}ms`);
          }
        });
      }
      window.Logger?.info('='.repeat(60) + '\n');
    }

    /**
     * Generate JSON report
     */
    generateJSONReport() {
      return JSON.stringify(this.results, null, 2);
    }
  }

  // Export for use in browser console or Node.js
  if (typeof window !== 'undefined') {
    window.PreferencesLoadingCompleteTest = PreferencesLoadingCompleteTest;
    
    // Auto-run if in browser console
    if (window.console && typeof window.console.log === 'function') {
      window.Logger?.info('✅ PreferencesLoadingCompleteTest loaded. Run: new PreferencesLoadingCompleteTest().runCompleteTest()');
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PreferencesLoadingCompleteTest;
  }
})();

