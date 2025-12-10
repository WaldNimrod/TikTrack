/**
 * Page Health Checker - TikTrack Initialization System
 * =====================================================
 * 
 * Checks overall page health including:
 * - System availability
 * - Error detection
 * - Performance metrics
 * 
 * Related Documentation:
 * - documentation/REFACTOR_INITIALIZATION_SYSTEM_PLAN.md
 * 
 * @version 1.0.0
 * @created 2025-01-27
 * @author TikTrack Development Team
 */


// ===== FUNCTION INDEX =====

// === Utility Functions ===
// - PageHealthChecker.checkSystemAvailability() - Checksystemavailability
// - PageHealthChecker.checkPreferences() - Checkpreferences
// - PageHealthChecker.checkCache() - Checkcache
// - PageHealthChecker.recordMetrics() - Recordmetrics
// - PageHealthChecker.performHealthCheck() - Performhealthcheck
// - PageHealthChecker.printReport() - Printreport

// === Event Handlers ===
// - PageHealthChecker.checkConsoleErrors() - Checkconsoleerrors

(function() {
  'use strict';

  if (typeof window.PageHealthChecker !== 'undefined') {
    return; // Already loaded
  }

  class PageHealthChecker {
    constructor() {
      this.requiredSystems = [
        'UnifiedAppInitializer',
        'PreferencesCore',
        'NotificationSystem',
        'UnifiedCacheManager'
      ];
      this.optionalSystems = [
        'PreferencesUIV4',
        'ColorManager',
        'FieldRendererService'
      ];
      this.errors = [];
      this.warnings = [];
      this.metrics = {
        loadTime: null,
        initializationTime: null,
        totalTime: null
      };
    }

    /**
     * Check if required systems are available
     * @returns {Object} System availability status
     */
    checkSystemAvailability() {
      const available = {};
      const missing = [];

      for (const system of this.requiredSystems) {
        const isAvailable = typeof window[system] !== 'undefined';
        available[system] = isAvailable;
        if (!isAvailable) {
          missing.push(system);
        }
      }

      const optionalAvailable = {};
      for (const system of this.optionalSystems) {
        optionalAvailable[system] = typeof window[system] !== 'undefined';
      }

      return {
        required: available,
        optional: optionalAvailable,
        missing: missing,
        allRequiredAvailable: missing.length === 0
      };
    }

    /**
     * Check for console errors
     * @returns {Array<Object>} Errors found
     */
    checkConsoleErrors() {
      // This would need to be called after page load
      // For now, return empty array
      return this.errors;
    }

    /**
     * Check preferences availability
     * @returns {Object} Preferences status
     */
    checkPreferences() {
      const hasPreferencesCore = typeof window.PreferencesCore !== 'undefined';
      const hasPreferences = typeof window.currentPreferences !== 'undefined' && window.currentPreferences !== null;
      const hasColors = typeof window.ColorManager !== 'undefined';

      return {
        coreAvailable: hasPreferencesCore,
        preferencesLoaded: hasPreferences,
        colorsAvailable: hasColors,
        healthy: hasPreferencesCore && (hasPreferences || hasColors)
      };
    }

    /**
     * Check cache system
     * @returns {Object} Cache status
     */
    checkCache() {
      const hasCacheManager = typeof window.UnifiedCacheManager !== 'undefined';
      const isInitialized = hasCacheManager && window.UnifiedCacheManager.initialized;
      const cacheReady = typeof window.cacheSystemReady !== 'undefined' && window.cacheSystemReady;

      return {
        managerAvailable: hasCacheManager,
        initialized: isInitialized,
        ready: cacheReady,
        healthy: hasCacheManager && (isInitialized || cacheReady)
      };
    }

    /**
     * Record performance metrics
     * @param {Object} metrics - Performance metrics
     */
    recordMetrics(metrics) {
      this.metrics = { ...this.metrics, ...metrics };
    }

    /**
     * Perform full health check
     * @returns {Object} Health check result
     */
    performHealthCheck() {
      const systems = this.checkSystemAvailability();
      const preferences = this.checkPreferences();
      const cache = this.checkCache();
      const consoleErrors = this.checkConsoleErrors();

      const issues = [];
      if (!systems.allRequiredAvailable) {
        issues.push({
          type: 'error',
          message: `Missing required systems: ${systems.missing.join(', ')}`
        });
      }

      if (!preferences.healthy) {
        issues.push({
          type: 'warning',
          message: 'Preferences not fully loaded'
        });
      }

      if (!cache.healthy) {
        issues.push({
          type: 'warning',
          message: 'Cache system not ready'
        });
      }

      if (consoleErrors.length > 0) {
        issues.push({
          type: 'error',
          message: `${consoleErrors.length} console errors found`
        });
      }

      return {
        healthy: issues.filter(i => i.type === 'error').length === 0,
        systems: systems,
        preferences: preferences,
        cache: cache,
        errors: consoleErrors,
        issues: issues,
        metrics: this.metrics
      };
    }

    /**
     * Print health check report to console
     */
    printReport() {
      const result = this.performHealthCheck();

      console.group('🏥 Page Health Check Report');

      console.group('📦 Systems:');
      console.log(`Required Systems Available: ${result.systems.allRequiredAvailable ? '✅' : '❌'}`);
      if (result.systems.missing.length > 0) {
        console.error(`Missing: ${result.systems.missing.join(', ')}`);
      }
      console.groupEnd();

      console.group('⚙️ Preferences:');
      console.log(`Core Available: ${result.preferences.coreAvailable ? '✅' : '❌'}`);
      console.log(`Preferences Loaded: ${result.preferences.preferencesLoaded ? '✅' : '❌'}`);
      console.log(`Colors Available: ${result.preferences.colorsAvailable ? '✅' : '❌'}`);
      console.log(`Healthy: ${result.preferences.healthy ? '✅' : '⚠️'}`);
      console.groupEnd();

      console.group('💾 Cache:');
      console.log(`Manager Available: ${result.cache.managerAvailable ? '✅' : '❌'}`);
      console.log(`Initialized: ${result.cache.initialized ? '✅' : '❌'}`);
      console.log(`Ready: ${result.cache.ready ? '✅' : '❌'}`);
      console.log(`Healthy: ${result.cache.healthy ? '✅' : '⚠️'}`);
      console.groupEnd();

      if (result.issues.length > 0) {
        console.group('⚠️ Issues:');
        result.issues.forEach(issue => {
          if (issue.type === 'error') {
            console.error(issue.message);
          } else {
            console.warn(issue.message);
          }
        });
        console.groupEnd();
      } else {
        console.log('✅ No issues found');
      }

      if (result.metrics.loadTime) {
        console.group('⏱️ Performance:');
        console.log(`Load Time: ${result.metrics.loadTime}ms`);
        if (result.metrics.initializationTime) {
          console.log(`Initialization Time: ${result.metrics.initializationTime}ms`);
        }
        if (result.metrics.totalTime) {
          console.log(`Total Time: ${result.metrics.totalTime}ms`);
        }
        console.groupEnd();
      }

      console.log(`Overall Health: ${result.healthy ? '✅ Healthy' : '⚠️ Issues Found'}`);
      console.groupEnd();

      return result;
    }
  }

  // Export
  window.PageHealthChecker = PageHealthChecker;

  // Auto-initialize
  const checker = new PageHealthChecker();
  window.pageHealthChecker = checker;
  console.log('✅ Page Health Checker initialized');
})();


