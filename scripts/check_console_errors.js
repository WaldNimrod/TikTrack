/**
 * Script to check console errors on all pages
 * Run this in browser console on each page
 * 
 * Usage:
 * 1. Open page in browser
 * 2. Open DevTools (F12)
 * 3. Go to Console tab
 * 4. Paste this script and run
 * 5. Copy the output
 */

(function() {
  'use strict';
  
  const PAGE_NAME = document.title || window.location.pathname;
  const START_TIME = performance.now();
  
  // Collect existing console messages
  const consoleMessages = [];
  const errors = [];
  const warnings = [];
  
  // Override console methods to capture messages
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalLog = console.log;
  
  console.error = function(...args) {
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
    
    errors.push({
      type: 'error',
      message: message,
      timestamp: new Date().toISOString(),
      stack: new Error().stack
    });
    
    originalError.apply(console, args);
  };
  
  console.warn = function(...args) {
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch (e) {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
    
    warnings.push({
      type: 'warning',
      message: message,
      timestamp: new Date().toISOString()
    });
    
    originalWarn.apply(console, args);
  };
  
  // Function to check page initialization
  function checkInitialization() {
    const checks = {
      header: {
        exists: !!document.querySelector('unified-header, app-header, .header-container, header'),
        element: document.querySelector('unified-header, app-header, .header-container, header')?.tagName || 'N/A'
      },
      coreSystems: {
        loaded: typeof window.initializeUnifiedApp === 'function',
        version: window.UnifiedAppInitializer?.version || 'N/A'
      },
      preferences: {
        loaded: typeof window.getPreference === 'function',
        cacheLoaded: typeof window.preferencesCache !== 'undefined'
      },
      notifications: {
        loaded: typeof window.showNotification === 'function',
        systemReady: typeof window.NotificationSystem !== 'undefined'
      },
      cache: {
        loaded: typeof window.UnifiedCacheManager !== 'undefined',
        version: window.UnifiedCacheManager?.version || 'N/A'
      },
      logger: {
        loaded: typeof window.Logger !== 'undefined',
        version: window.Logger?.version || 'N/A'
      }
    };
    
    return checks;
  }
  
  // Function to check for recursion flags
  function checkRecursionFlags() {
    return {
      getPreferenceInProgress: window.__GET_PREFERENCE_IN_PROGRESS__ || false,
      showNotificationInProgress: window.__SHOW_NOTIFICATION_IN_PROGRESS__ || false,
      loadActiveAlertsInProgress: window.__LOAD_ACTIVE_ALERTS_CALL_STACK__?.length > 0 || false
    };
  }
  
  // Function to wait for page to fully load
  function waitForPageLoad() {
    return new Promise((resolve) => {
      if (document.readyState === 'complete') {
        // Wait additional 3 seconds for async operations
        setTimeout(resolve, 3000);
      } else {
        window.addEventListener('load', () => {
          setTimeout(resolve, 3000);
        });
        // Timeout after 10 seconds
        setTimeout(resolve, 10000);
      }
    });
  }
  
  // Main check function
  async function runChecks() {
    console.log(`\n🔍 Starting console check for: ${PAGE_NAME}`);
    console.log(`📍 URL: ${window.location.href}`);
    console.log(`⏰ Start time: ${new Date().toISOString()}\n`);
    
    // Wait for page to load
    await waitForPageLoad();
    
    const loadTime = ((performance.now() - START_TIME) / 1000).toFixed(2);
    const initChecks = checkInitialization();
    const recursionFlags = checkRecursionFlags();
    
    // Restore original console methods
    console.error = originalError;
    console.warn = originalWarn;
    console.log = originalLog;
    
    // Report results
    console.log('='.repeat(80));
    console.log('📊 CONSOLE CHECK RESULTS');
    console.log('='.repeat(80));
    console.log(`\n📄 Page: ${PAGE_NAME}`);
    console.log(`📍 URL: ${window.location.href}`);
    console.log(`⏱️  Load time: ${loadTime}s`);
    console.log(`⏰ Check time: ${new Date().toISOString()}\n`);
    
    console.log('🔍 Initialization Checks:');
    console.log(`  Header: ${initChecks.header.exists ? '✅' : '❌'} (${initChecks.header.element})`);
    console.log(`  Core Systems: ${initChecks.coreSystems.loaded ? '✅' : '❌'} (v${initChecks.coreSystems.version})`);
    console.log(`  Preferences: ${initChecks.preferences.loaded ? '✅' : '❌'} (Cache: ${initChecks.preferences.cacheLoaded ? '✅' : '❌'})`);
    console.log(`  Notifications: ${initChecks.notifications.loaded ? '✅' : '❌'} (System: ${initChecks.notifications.systemReady ? '✅' : '❌'})`);
    console.log(`  Cache: ${initChecks.cache.loaded ? '✅' : '❌'} (v${initChecks.cache.version})`);
    console.log(`  Logger: ${initChecks.logger.loaded ? '✅' : '❌'} (v${initChecks.logger.version})\n`);
    
    console.log('🚩 Recursion Flags:');
    console.log(`  getPreference in progress: ${recursionFlags.getPreferenceInProgress ? '⚠️  YES' : '✅ NO'}`);
    console.log(`  showNotification in progress: ${recursionFlags.showNotificationInProgress ? '⚠️  YES' : '✅ NO'}`);
    console.log(`  loadActiveAlerts in progress: ${recursionFlags.loadActiveAlertsInProgress ? '⚠️  YES' : '✅ NO'}\n`);
    
    console.log(`❌ Errors captured: ${errors.length}`);
    if (errors.length > 0) {
      console.log('\n📋 Error Details:');
      errors.forEach((error, index) => {
        console.log(`\n  ${index + 1}. ${error.message}`);
        if (error.stack) {
          console.log(`     Stack: ${error.stack.split('\n').slice(0, 3).join('\n     ')}`);
        }
      });
    }
    
    console.log(`\n⚠️  Warnings captured: ${warnings.length}`);
    if (warnings.length > 0) {
      console.log('\n📋 Warning Details:');
      warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning.message}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log(`✅ Check completed: ${errors.length === 0 ? 'NO ERRORS' : `${errors.length} ERRORS FOUND`}`);
    console.log('='.repeat(80) + '\n');
    
    // Return results for programmatic access
    return {
      page: PAGE_NAME,
      url: window.location.href,
      loadTime: parseFloat(loadTime),
      timestamp: new Date().toISOString(),
      initialization: initChecks,
      recursionFlags: recursionFlags,
      errors: errors,
      warnings: warnings,
      success: errors.length === 0
    };
  }
  
  // Auto-run if in browser
  if (typeof window !== 'undefined') {
    // Store results globally
    window.consoleCheckResults = runChecks();
    
    // Also log to console
    runChecks().then(results => {
      window.lastConsoleCheck = results;
      console.log('\n💾 Results stored in: window.lastConsoleCheck');
      console.log('📋 Copy this object to share results');
    });
  }
  
  // Export for Node.js
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runChecks, checkInitialization, checkRecursionFlags };
  }
})();


