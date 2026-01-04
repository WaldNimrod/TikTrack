/**
 * Page Preferences Integration Status Checker
 * 
 * This script checks the status of preferences integration for all main pages.
 * 
 * Usage: Run in browser console on any page
 */


// ===== FUNCTION INDEX =====

// === Event Handlers ===
// - checkPageConfig() - Checkpageconfig

// === Utility Functions ===
// - checkHTMLScripts() - Checkhtmlscripts
// - checkRuntimeStatus() - Checkruntimestatus
// - checkAllPages() - Checkallpages

(function() {
  'use strict';

  const MAIN_PAGES = [
    { name: 'index', file: 'index.html', description: 'דשבורד' },
    { name: 'trades', file: 'trades.html', description: 'טריידים' },
    { name: 'trade_plans', file: 'trade_plans.html', description: 'תוכניות מסחר' },
    { name: 'alerts', file: 'alerts.html', description: 'התראות' },
    { name: 'tickers', file: 'tickers.html', description: 'טיקרים' },
    { name: 'ticker-dashboard', file: 'ticker_dashboard.html', description: 'דשבורד טיקר' },
    { name: 'trading_accounts', file: 'trading_accounts.html', description: 'חשבונות מסחר' },
    { name: 'executions', file: 'executions.html', description: 'ביצועים' },
    { name: 'cash_flows', file: 'cash_flows.html', description: 'תזרימי מזומן' },
    { name: 'notes', file: 'notes.html', description: 'הערות' },
    { name: 'research', file: 'research.html', description: 'מחקר' },
    { name: 'data_import', file: 'data_import.html', description: 'ייבוא נתונים' },
    { name: 'preferences', file: 'preferences.html', description: 'העדפות' },
    { name: 'user-profile', file: 'user_profile.html', description: 'פרופיל משתמש' },
    { name: 'ai-analysis', file: 'ai_analysis.html', description: 'ניתוח AI' }
  ];

  /**
   * Check page configuration in page-initialization-configs.js
   */
  function checkPageConfig(pageName) {
    const config = window.pageInitializationConfigs?.[pageName];
    if (!config) {
      return {
        hasConfig: false,
        hasPreferencesPackage: false,
        packages: [],
        hasUnifiedAppInitializer: false
      };
    }

    const packages = config.packages || [];
    const hasPreferencesPackage = packages.includes('preferences');
    const requiredGlobals = config.requiredGlobals || [];
    const hasUnifiedAppInitializer = requiredGlobals.some(g => 
      g === 'window.UnifiedAppInitializer' || g === 'UnifiedAppInitializer'
    );

    return {
      hasConfig: true,
      hasPreferencesPackage,
      packages,
      hasUnifiedAppInitializer,
      requiredGlobals
    };
  }

  /**
   * Check if scripts are loaded in HTML
   */
  async function checkHTMLScripts(pageFile) {
    try {
      const response = await fetch(`/${pageFile}`);
      const html = await response.text();
      
      const hasPackageManifest = html.includes('package-manifest.js');
      const hasPageConfigs = html.includes('page-initialization-configs.js');
      const hasCoreSystems = html.includes('core-systems.js');
      
      return {
        hasPackageManifest,
        hasPageConfigs,
        hasCoreSystems,
        html: html.substring(0, 500) // First 500 chars for debugging
      };
    } catch (error) {
      return {
        error: error.message,
        hasPackageManifest: false,
        hasPageConfigs: false,
        hasCoreSystems: false
      };
    }
  }

  /**
   * Check runtime status
   */
  function checkRuntimeStatus() {
    return {
      hasUnifiedAppInitializer: typeof window.UnifiedAppInitializer !== 'undefined',
      hasPageInitializationConfigs: typeof window.pageInitializationConfigs !== 'undefined',
      hasPACKAGE_MANIFEST: typeof window.PACKAGE_MANIFEST !== 'undefined',
      hasPreferencesCore: typeof window.PreferencesCore !== 'undefined',
      hasLazyLoader: typeof window.LazyLoader !== 'undefined',
      hasColorSchemeSystem: typeof window.ColorSchemeSystem !== 'undefined',
      currentPreferences: typeof window.currentPreferences !== 'undefined' ? Object.keys(window.currentPreferences || {}).length : 0
    };
  }

  /**
   * Main check function
   */
  async function checkAllPages() {
    window.Logger?.info('🔍 Starting comprehensive page preferences integration check...\n');
    
    const results = [];
    const runtimeStatus = checkRuntimeStatus();
    
    window.Logger?.info('📊 Runtime Status:');
    window.Logger?.info(JSON.stringify(runtimeStatus, null, 2));
    window.Logger?.info('\n');

    for (const page of MAIN_PAGES) {
      window.Logger?.info(`\n📄 Checking ${page.name} (${page.description})...`);
      
      const configStatus = checkPageConfig(page.name);
      const htmlStatus = await checkHTMLScripts(page.file);
      
      const status = {
        page: page.name,
        description: page.description,
        file: page.file,
        config: configStatus,
        html: htmlStatus,
        issues: []
      };

      // Check for issues
      if (!configStatus.hasConfig) {
        status.issues.push('❌ No configuration in pageInitializationConfigs');
      }
      
      if (!configStatus.hasPreferencesPackage) {
        status.issues.push('❌ Missing "preferences" package');
      }
      
      if (!htmlStatus.hasPackageManifest) {
        status.issues.push('❌ Missing package-manifest.js in HTML');
      }
      
      if (!htmlStatus.hasPageConfigs) {
        status.issues.push('❌ Missing page-initialization-configs.js in HTML');
      }
      
      if (!htmlStatus.hasCoreSystems) {
        status.issues.push('❌ Missing core-systems.js in HTML');
      }
      
      if (!configStatus.hasUnifiedAppInitializer) {
        status.issues.push('⚠️ UnifiedAppInitializer not in requiredGlobals');
      }

      if (status.issues.length === 0) {
        status.status = '✅ OK';
      } else {
        status.status = '❌ Issues found';
      }

      results.push(status);
      
      window.Logger?.info(`  Status: ${status.status}`);
      if (status.issues.length > 0) {
        status.issues.forEach(issue => window.Logger?.info(`  ${issue}`));
      }
    }

    // Summary
    window.Logger?.info('\n\n📊 SUMMARY:');
    window.Logger?.info('='.repeat(60));
    
    const okCount = results.filter(r => r.issues.length === 0).length;
    const issuesCount = results.filter(r => r.issues.length > 0).length;
    
    window.Logger?.info(`✅ Pages OK: ${okCount}/${MAIN_PAGES.length}`);
    window.Logger?.info(`❌ Pages with issues: ${issuesCount}/${MAIN_PAGES.length}`);
    
    window.Logger?.info('\n📋 Pages with issues:');
    results.filter(r => r.issues.length > 0).forEach(page => {
      window.Logger?.info(`\n  ${page.page} (${page.description}):`);
      page.issues.forEach(issue => window.Logger?.info(`    ${issue}`));
    });

    // Return results for programmatic access
    window.__PAGES_PREFERENCES_STATUS__ = {
      timestamp: new Date().toISOString(),
      runtimeStatus,
      pages: results,
      summary: {
        total: MAIN_PAGES.length,
        ok: okCount,
        issues: issuesCount
      }
    };

    window.Logger?.info('\n\n💾 Results saved to window.__PAGES_PREFERENCES_STATUS__');
    
    return results;
  }

  // Export to window
  window.checkPagesPreferencesStatus = checkAllPages;
  
  // Auto-run if in browser
  if (typeof window !== 'undefined' && window.document) {
    window.Logger?.info('🚀 Page Preferences Integration Status Checker loaded');
    window.Logger?.info('   Run: checkPagesPreferencesStatus()');
  }

})();
