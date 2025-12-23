/**
 * Preferences Loading Test - Across All Pages
 * בדיקת טעינת העדפות בכל העמודים
 * 
 * @version 1.0.0
 * @created 2025-01-27
 * @author TikTrack Development Team
 * 
 * Documentation: See documentation/02-ARCHITECTURE/FRONTEND/PREFERENCES_LOADING_BEST_PRACTICES.md
 */


// ===== FUNCTION INDEX =====

// === Data Functions ===
// - PreferencesLoadingTest.extractScriptTags() - Extractscripttags
// - PreferencesLoadingTest.extractInlineScripts() - Extractinlinescripts
// - PreferencesLoadingTest.checkUsesCoreSystems() - Checkusescoresystems
// - PreferencesLoadingTest.checkNoDirectPreferencesCalls() - Checknodirectpreferencescalls

(function() {
  'use strict';

  /**
   * Preferences Loading Test Class
   */
  class PreferencesLoadingTest {
    constructor() {
      this.pages = [
        // Main Pages (11)
        'index', 'trades', 'trade_plans', 'alerts', 'tickers', 'trading_accounts',
        'executions', 'cash_flows', 'notes', 'research', 'preferences',
        // Technical Pages (12)
        'db_display', 'db_extradata', 'constraints', 'background-tasks', 'server-monitor',
        'system-management', 'cache-test', 'code-quality-dashboard', 'notifications-center',
        'css-management', 'dynamic-colors-display', 'designs',
        // Secondary Pages (5)
        'external-data-dashboard', 'chart-management', 'crud-testing-dashboard',
        'data_import', 'tag-management'
      ];

      this.results = {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
        pages: {}
      };

      this.checks = {
        usesCoreSystems: {
          name: 'Uses core-systems.js',
          description: 'Checks if page uses core-systems.js (not unified-app-initializer.js)',
          critical: true
        },
        noDirectPreferencesCalls: {
          name: 'No direct loadUserPreferences calls',
          description: 'Checks if page has no direct calls to loadUserPreferences({ force: true })',
          critical: true
        },
        correctLoadOrder: {
          name: 'Correct load order',
          description: 'Checks if preferences scripts are loaded in correct order',
          critical: false
        },
        waitsForData: {
          name: 'Waits for required data',
          description: 'Checks if tables wait for required data before initialization',
          critical: false
        }
      };
    }

    /**
     * Extract script tags from HTML content
     */
    extractScriptTags(html) {
      const scriptRegex = /<script[^>]*src=["']([^"']+)["'][^>]*>/gi;
      const scripts = [];
      let match;

      while ((match = scriptRegex.exec(html)) !== null) {
        scripts.push(match[1]);
      }

      return scripts;
    }

    /**
     * Extract inline script content
     */
    extractInlineScripts(html) {
      const inlineScriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
      const scripts = [];
      let match;

      while ((match = inlineScriptRegex.exec(html)) !== null) {
        if (match[1] && !match[0].includes('src=')) {
          scripts.push(match[1]);
        }
      }

      return scripts;
    }

    /**
     * Check if page uses core-systems.js
     */
    checkUsesCoreSystems(scripts) {
      const hasCoreSystems = scripts.some(s => 
        s.includes('core-systems.js') || s.includes('modules/core-systems.js')
      );
      const hasUnifiedAppInitializer = scripts.some(s => 
        s.includes('unified-app-initializer.js')
      );

      return {
        passed: hasCoreSystems && !hasUnifiedAppInitializer,
        details: {
          hasCoreSystems,
          hasUnifiedAppInitializer,
          message: hasCoreSystems && !hasUnifiedAppInitializer
            ? '✅ Uses core-systems.js correctly'
            : hasUnifiedAppInitializer
            ? '❌ Still uses unified-app-initializer.js (should use core-systems.js)'
            : '❌ Missing core-systems.js'
        }
      };
    }

    /**
     * Check for direct loadUserPreferences calls
     */
    checkNoDirectPreferencesCalls(scripts, inlineScripts) {
      const allScripts = [...scripts, ...inlineScripts].join('\n');
      const directCallPatterns = [
        /loadUserPreferences\s*\(\s*\{[^}]*force\s*:\s*true/gi,
        /loadUserPreferences\s*\(\s*\{[^}]*force\s*:\s*true[^}]*\}/gi,
        /PreferencesData\.loadAllPreferences\s*\(\s*\{[^}]*force\s*:\s*true/gi,
        /PreferencesCore\.loadAllPreferences\s*\(\s*\{[^}]*force\s*:\s*true/gi
      ];

      const foundCalls = [];
      directCallPatterns.forEach((pattern, index) => {
        const matches = allScripts.match(pattern);
        if (matches) {
          foundCalls.push({
            pattern: index,
            matches: matches.length
          });
        }
      });

      return {
        passed: foundCalls.length === 0,
        details: {
          foundCalls: foundCalls.length,
          message: foundCalls.length === 0
            ? '✅ No direct loadUserPreferences({ force: true }) calls found'
            : `❌ Found ${foundCalls.length} direct loadUserPreferences({ force: true }) call(s)`
        }
      };
    }

    /**
     * Check correct load order for preferences scripts
     */
    checkCorrectLoadOrder(scripts) {
      const preferencesV4Index = scripts.findIndex(s => 
        s.includes('preferences-v4.js') || s.includes('services/preferences-v4.js')
      );
      const preferencesCoreIndex = scripts.findIndex(s => 
        s.includes('preferences-core.js') || s.includes('preferences-core.js')
      );
      const preferencesUIV4Index = scripts.findIndex(s => 
        s.includes('preferences-ui-v4.js')
      );
      const preferencesGroupManagerIndex = scripts.findIndex(s => 
        s.includes('preferences-group-manager.js')
      );

      const issues = [];
      
      // Check preferences-v4.js before preferences-core.js
      if (preferencesV4Index !== -1 && preferencesCoreIndex !== -1) {
        if (preferencesV4Index > preferencesCoreIndex) {
          issues.push('preferences-v4.js should be loaded before preferences-core.js');
        }
      }

      // Check preferences-ui-v4.js before preferences-group-manager.js
      if (preferencesUIV4Index !== -1 && preferencesGroupManagerIndex !== -1) {
        if (preferencesUIV4Index > preferencesGroupManagerIndex) {
          issues.push('preferences-ui-v4.js should be loaded before preferences-group-manager.js');
        }
      }

      return {
        passed: issues.length === 0,
        details: {
          issues,
          message: issues.length === 0
            ? '✅ Preferences scripts loaded in correct order'
            : `⚠️ Load order issues: ${issues.join(', ')}`
        }
      };
    }

    /**
     * Check if page waits for required data (basic check)
     */
    checkWaitsForData(inlineScripts) {
      const allScripts = inlineScripts.join('\n');
      
      // Check for common patterns that indicate waiting for data
      const waitPatterns = [
        /__preferencesCriticalLoaded/gi,
        /preferences:critical-loaded/gi,
        /await.*preferences/gi,
        /waitForPreferences/gi,
        /while.*trading_accountsData/gi,
        /while.*selectedDateRangeForFilter/gi
      ];

      const foundPatterns = waitPatterns.filter(pattern => pattern.test(allScripts));

      return {
        passed: foundPatterns.length > 0,
        details: {
          foundPatterns: foundPatterns.length,
          message: foundPatterns.length > 0
            ? `✅ Found ${foundPatterns.length} pattern(s) indicating data waiting`
            : '⚠️ No clear patterns found for waiting for required data'
        }
      };
    }

    /**
     * Test a single page
     */
    async testPage(pageName) {
      const pagePath = `trading-ui/${pageName}.html`;
      const result = {
        page: pageName,
        checks: {},
        overall: 'pending'
      };

      try {
        // Try to fetch the HTML file
        const response = await fetch(`/${pageName}.html`);
        if (!response.ok) {
          result.overall = 'error';
          result.error = `Failed to fetch page: ${response.status} ${response.statusText}`;
          return result;
        }

        const html = await response.text();
        const scripts = this.extractScriptTags(html);
        const inlineScripts = this.extractInlineScripts(html);

        // Run all checks
        result.checks.usesCoreSystems = this.checkUsesCoreSystems(scripts);
        result.checks.noDirectPreferencesCalls = this.checkNoDirectPreferencesCalls(scripts, inlineScripts);
        result.checks.correctLoadOrder = this.checkCorrectLoadOrder(scripts);
        result.checks.waitsForData = this.checkWaitsForData(inlineScripts);

        // Calculate overall status
        const criticalChecks = [
          result.checks.usesCoreSystems,
          result.checks.noDirectPreferencesCalls
        ];

        const criticalFailed = criticalChecks.some(check => !check.passed);
        const warnings = Object.values(result.checks).filter(check => 
          !check.passed && !criticalChecks.includes(check)
        ).length;

        if (criticalFailed) {
          result.overall = 'failed';
        } else if (warnings > 0) {
          result.overall = 'warning';
        } else {
          result.overall = 'passed';
        }

      } catch (error) {
        result.overall = 'error';
        result.error = error.message;
      }

      return result;
    }

    /**
     * Test all pages
     */
    async testAllPages() {
      console.log('🧪 Starting Preferences Loading Test across all pages...');
      console.log(`📋 Testing ${this.pages.length} pages...\n`);

      for (const pageName of this.pages) {
        console.log(`Testing ${pageName}...`);
        const result = await this.testPage(pageName);
        this.results.pages[pageName] = result;
        this.results.total++;

        if (result.overall === 'passed') {
          this.results.passed++;
          console.log(`  ✅ ${pageName}: PASSED`);
        } else if (result.overall === 'warning') {
          this.results.warnings++;
          console.log(`  ⚠️  ${pageName}: WARNING`);
        } else if (result.overall === 'failed') {
          this.results.failed++;
          console.log(`  ❌ ${pageName}: FAILED`);
        } else {
          console.log(`  ⚠️  ${pageName}: ERROR - ${result.error || 'Unknown error'}`);
        }
      }

      this.printSummary();
      return this.results;
    }

    /**
     * Print test summary
     */
    printSummary() {
      console.log('\n' + '='.repeat(60));
      console.log('📊 TEST SUMMARY');
      console.log('='.repeat(60));
      console.log(`Total Pages: ${this.results.total}`);
      console.log(`✅ Passed: ${this.results.passed}`);
      console.log(`⚠️  Warnings: ${this.results.warnings}`);
      console.log(`❌ Failed: ${this.results.failed}`);
      console.log('='.repeat(60) + '\n');

      // Print failed pages
      if (this.results.failed > 0) {
        console.log('❌ FAILED PAGES:');
        Object.entries(this.results.pages).forEach(([page, result]) => {
          if (result.overall === 'failed') {
            console.log(`\n  ${page}:`);
            Object.entries(result.checks).forEach(([checkName, check]) => {
              if (!check.passed) {
                console.log(`    - ${checkName}: ${check.details.message}`);
              }
            });
          }
        });
        console.log('');
      }

      // Print pages with warnings
      if (this.results.warnings > 0) {
        console.log('⚠️  PAGES WITH WARNINGS:');
        Object.entries(this.results.pages).forEach(([page, result]) => {
          if (result.overall === 'warning') {
            console.log(`\n  ${page}:`);
            Object.entries(result.checks).forEach(([checkName, check]) => {
              if (!check.passed) {
                console.log(`    - ${checkName}: ${check.details.message}`);
              }
            });
          }
        });
        console.log('');
      }
    }

    /**
     * Generate HTML report
     */
    generateHTMLReport() {
      let html = `
<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preferences Loading Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .page { margin: 10px 0; padding: 10px; border: 1px solid #ddd; border-radius: 5px; }
        .passed { background: #d4edda; }
        .failed { background: #f8d7da; }
        .warning { background: #fff3cd; }
        .check { margin: 5px 0; padding: 5px; }
        .check.passed { color: green; }
        .check.failed { color: red; }
        .check.warning { color: orange; }
    </style>
</head>
<body>
    <h1>Preferences Loading Test Report</h1>
    <div class="summary">
        <h2>Summary</h2>
        <p>Total Pages: ${this.results.total}</p>
        <p>✅ Passed: ${this.results.passed}</p>
        <p>⚠️  Warnings: ${this.results.warnings}</p>
        <p>❌ Failed: ${this.results.failed}</p>
    </div>
`;

      Object.entries(this.results.pages).forEach(([page, result]) => {
        const statusClass = result.overall;
        html += `
    <div class="page ${statusClass}">
        <h3>${page} (${result.overall.toUpperCase()})</h3>
`;

        Object.entries(result.checks).forEach(([checkName, check]) => {
          const checkClass = check.passed ? 'passed' : 'failed';
          html += `
        <div class="check ${checkClass}">
            <strong>${checkName}:</strong> ${check.details.message}
        </div>
`;
        });

        if (result.error) {
          html += `
        <div class="check failed">
            <strong>Error:</strong> ${result.error}
        </div>
`;
        }

        html += `
    </div>
`;
      });

      html += `
</body>
</html>
`;

      return html;
    }
  }

  // Export for use in browser console or Node.js
  if (typeof window !== 'undefined') {
    window.PreferencesLoadingTest = PreferencesLoadingTest;
    
    // Auto-run if in browser console
    if (window.console && typeof window.console.log === 'function') {
      console.log('✅ PreferencesLoadingTest loaded. Run: new PreferencesLoadingTest().testAllPages()');
    }
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = PreferencesLoadingTest;
  }
})();

