/**
 * Page Standardization Script
 * סקריפט לסטנדרטיזציה של כל העמודים במערכת
 *
 * Code Review Fix (December 2025):
 * - Removed packageScripts fallback configuration
 * - Now uses PACKAGE_MANIFEST exclusively
 * - Eliminated dual configuration sources that could cause inconsistent script loading
 *
 * @version 1.1.0
 * @created October 2025
 * @updated December 2025 - Removed packageScripts fallback
 * @author TikTrack Development Team
 */

class PageStandardizer {
  constructor() {
    this.pagesToStandardize = [
      'index',
      'preferences',
      'trades',
      'executions',
      'trade_plans',
      'alerts',
      'trading_accounts',
      'cash_flows',
      'tickers',
      'notes',
      'research',
      'db_display',
      'system-management',
      'server-monitor',
      'code-quality-dashboard',
      'notifications-center',
      'external-data-dashboard',
      'crud-testing-dashboard',
      'conditions-test',
      'db_extradata',
      'constraints',
      'background-tasks',
      'css-management',
      'dynamic-colors-display',
      'designs',
      'chart-management',
      'init-system-management',
    ];

    this.coreScripts = [
      'scripts/page-initialization-configs.js?v=1.0.0',
      'scripts/unified-app-initializer.js?v=1.0.0',
    ];
  }

  /**
   * Get scripts for a page based on its packages
   */
  getScriptsForPage(pageName) {
    if (!window.pageInitializationConfigs || !window.pageInitializationConfigs[pageName]) {
      console.warn(`No config found for page: ${pageName}`);
      // Fallback to base package from PACKAGE_MANIFEST
      if (window.PACKAGE_MANIFEST && window.PACKAGE_MANIFEST.base) {
        const baseScripts = window.PACKAGE_MANIFEST.base.scripts
          .filter(s => s.required !== false)
          .sort((a, b) => (a.loadOrder || 0) - (b.loadOrder || 0))
          .map(s => `scripts/${s.file}?v=1.0.0`);
        return baseScripts.concat(this.coreScripts);
      }
      console.error(`No PACKAGE_MANIFEST available for fallback on page: ${pageName}`);
      return this.coreScripts; // Return only core scripts as last resort
    }

    const config = window.pageInitializationConfigs[pageName];
    const packages = config.packages || ['base'];

    let scripts = [];

    // Use PACKAGE_MANIFEST only
    packages.forEach(pkg => {
      if (window.PACKAGE_MANIFEST && window.PACKAGE_MANIFEST[pkg]) {
        // Use PACKAGE_MANIFEST
        const pkgManifest = window.PACKAGE_MANIFEST[pkg];
        if (pkgManifest.scripts && Array.isArray(pkgManifest.scripts)) {
          const pkgScripts = pkgManifest.scripts
            .filter(s => s.required !== false) // Only required scripts
            .sort((a, b) => (a.loadOrder || 0) - (b.loadOrder || 0)) // Sort by loadOrder
            .map(s => `scripts/${s.file}?v=1.0.0`);
          scripts = scripts.concat(pkgScripts);
        }
      } else {
        console.error(`Package ${pkg} not found in PACKAGE_MANIFEST - this should not happen in production`);
      }
    });

    // Add core scripts
    scripts = scripts.concat(this.coreScripts);

    // Remove duplicates
    return [...new Set(scripts)];
  }

  /**
   * Generate standardized script section for a page
   */
  generateScriptSection(pageName) {
    const scripts = this.getScriptsForPage(pageName);

    let html = `<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>\n`;

    // Group scripts by package
    const baseScripts = scripts.filter(
      s =>
        s.includes('global-favicon') ||
        s.includes('notification-system') ||
        s.includes('ui-utils') ||
        s.includes('page-utils') ||
        s.includes('translation-utils') ||
        s.includes('unified-cache-manager') ||
        s.includes('cache-sync-manager') ||
        s.includes('header-system')
    );

    const otherScripts = scripts.filter(
      s =>
        !baseScripts.includes(s) &&
        !s.includes('page-initialization-configs') &&
        !s.includes('unified-app-initializer')
    );

    const coreScripts = scripts.filter(
      s => s.includes('page-initialization-configs') || s.includes('unified-app-initializer')
    );

    if (baseScripts.length > 0) {
      html += `        <!-- Base Package Scripts -->\n`;
      baseScripts.forEach(script => {
        html += `        <script src="${script}"></script>\n`;
      });
      html += `        \n`;
    }

    if (otherScripts.length > 0) {
      html += `        <!-- Additional Package Scripts -->\n`;
      otherScripts.forEach(script => {
        html += `        <script src="${script}"></script>\n`;
      });
      html += `        \n`;
    }

    if (coreScripts.length > 0) {
      html += `        <!-- Page Configs and Initializer -->\n`;
      coreScripts.forEach(script => {
        html += `        <script src="${script}"></script>\n`;
      });
    }

    return html;
  }

  /**
   * Analyze a page and show what needs to be standardized
   */
  analyzePage(pageName) {
    console.log(`\n🔍 Analyzing page: ${pageName}`);

    const scripts = this.getScriptsForPage(pageName);
    console.log(
      `📦 Required packages: ${window.pageInitializationConfigs?.[pageName]?.packages?.join(', ') || 'base'}`
    );
    console.log(`📜 Required scripts (${scripts.length}):`);
    scripts.forEach(script => {
      console.log(`   - ${script}`);
    });

    return {
      pageName,
      packages: window.pageInitializationConfigs?.[pageName]?.packages || ['base'],
      requiredScripts: scripts,
      scriptCount: scripts.length,
    };
  }

  /**
   * Analyze all pages
   */
  analyzeAllPages() {
    console.log('🔍 Analyzing all pages for standardization...\n');

    const results = [];
    this.pagesToStandardize.forEach(pageName => {
      const analysis = this.analyzePage(pageName);
      results.push(analysis);
    });

    console.log('\n📊 Summary:');
    console.log(`Total pages: ${results.length}`);
    console.log(
      `Pages with configs: ${results.filter(r => window.pageInitializationConfigs?.[r.pageName]).length}`
    );
    console.log(
      `Average scripts per page: ${(results.reduce((sum, r) => sum + r.scriptCount, 0) / results.length).toFixed(1)}`
    );

    return results;
  }

  /**
   * Show standardization report
   */
  showStandardizationReport() {
    const results = this.analyzeAllPages();

    console.log('\n📋 Standardization Report:');
    console.log('='.repeat(50));

    results.forEach(result => {
      const hasConfig = !!window.pageInitializationConfigs?.[result.pageName];
      const status = hasConfig ? '✅' : '❌';
      console.log(
        `${status} ${result.pageName.padEnd(25)} | ${result.packages.join(', ').padEnd(20)} | ${result.scriptCount} scripts`
      );
    });

    console.log('\n🎯 Next Steps:');
    console.log('1. Update HTML files to use standardized script loading');
    console.log('2. Remove duplicate and unnecessary scripts');
    console.log('3. Ensure all pages use unified-app-initializer');
    console.log('4. Test each page after standardization');
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.PageStandardizer = PageStandardizer;
}

// Auto-run analysis if loaded directly
if (typeof window !== 'undefined' && window.location.pathname.includes('init-system-management')) {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      const standardizer = new PageStandardizer();
      standardizer.showStandardizationReport();
    }, 2000);
  });
}
