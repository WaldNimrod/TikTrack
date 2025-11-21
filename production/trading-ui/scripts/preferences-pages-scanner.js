/**
 * Preferences Pages Scanner
 * סקריפט סריקה אוטומטי לבדיקת תיקוני העדפות בכל העמודים
 * 
 * @version 1.0.0
 * @created November 2025
 * @author TikTrack Development Team
 * 
 * Documentation: See documentation/05-REPORTS/PREFERENCES_PAGES_FIXES_SUMMARY.md
 */

(function() {
  'use strict';

  /**
   * Preferences Pages Scanner Class
   */
  class PreferencesPagesScanner {
    constructor() {
      this.pages = [
        // Main Pages
        'index', 'trades', 'trade_plans', 'alerts', 'tickers', 'trading_accounts',
        'executions', 'data_import', 'cash_flows', 'notes', 'research', 'preferences',
        // Technical Pages
        'db_display', 'db_extradata', 'constraints', 'background-tasks', 'server-monitor',
        'system-management', 'cache-test', 'code-quality-dashboard', 'notifications-center',
        'css-management', 'dynamic-colors-display', 'designs',
        // Secondary Pages
        'external-data-dashboard', 'chart-management', 'crud-testing-dashboard', 'tag-management'
      ];

      this.requiredFiles = {
        preferencesData: 'scripts/services/preferences-data.js',
        preferencesV4: 'scripts/services/preferences-v4.js',
        preferencesUIV4: 'scripts/preferences-ui-v4.js'
      };

      this.results = [];
    }

    /**
     * Extract script tags from HTML content
     */
    extractScriptTags(html) {
      const scriptRegex = /<script[^>]*src=["']([^"']+)["'][^>]*>/gi;
      const scripts = [];
      let match;

      while ((match = scriptRegex.exec(html)) !== null) {
        const src = match[1];
        const fullMatch = match[0];
        const lineNumber = html.substring(0, match.index).split('\n').length;
        
        scripts.push({
          src: src,
          fullTag: fullMatch,
          lineNumber: lineNumber
        });
      }

      return scripts;
    }

    /**
     * Check if page has preferences package in PAGE_CONFIGS
     */
    hasPreferencesPackage(pageName) {
      if (typeof window.PAGE_CONFIGS === 'undefined') {
        return false;
      }

      const pageConfig = window.PAGE_CONFIGS[pageName];
      if (!pageConfig || !pageConfig.packages) {
        return false;
      }

      return pageConfig.packages.includes('preferences');
    }

    /**
     * Check for Bootstrap JS duplicates
     */
    checkBootstrapDuplicates(scripts) {
      const bootstrapScripts = scripts.filter(s => 
        s.src.includes('bootstrap') && s.src.includes('bundle') && s.src.includes('.js')
      );

      return {
        count: bootstrapScripts.length,
        scripts: bootstrapScripts,
        hasDuplicates: bootstrapScripts.length > 1
      };
    }

    /**
     * Check for duplicate script files
     */
    checkDuplicateScripts(scripts) {
      const scriptMap = new Map();
      const duplicates = [];

      scripts.forEach(script => {
        const normalizedSrc = script.src.split('?')[0]; // Remove version query
        if (scriptMap.has(normalizedSrc)) {
          duplicates.push({
            src: normalizedSrc,
            occurrences: [scriptMap.get(normalizedSrc), script]
          });
        } else {
          scriptMap.set(normalizedSrc, script);
        }
      });

      return duplicates;
    }

    /**
     * Check load order (preferences-data before crud-response-handler)
     */
    checkLoadOrder(scripts) {
      let preferencesDataIndex = -1;
      let crudResponseHandlerIndex = -1;

      scripts.forEach((script, index) => {
        if (script.src.includes('preferences-data.js')) {
          preferencesDataIndex = index;
        }
        if (script.src.includes('crud-response-handler.js')) {
          crudResponseHandlerIndex = index;
        }
      });

      return {
        preferencesDataIndex,
        crudResponseHandlerIndex,
        isCorrectOrder: preferencesDataIndex === -1 || crudResponseHandlerIndex === -1 || 
                        preferencesDataIndex < crudResponseHandlerIndex
      };
    }

    /**
     * Check for required preference files
     */
    checkRequiredFiles(scripts, hasPreferencesPackage, pageName) {
      const found = {
        preferencesData: false,
        preferencesV4: false,
        preferencesUIV4: false
      };

      const locations = {
        preferencesData: null,
        preferencesV4: null,
        preferencesUIV4: null
      };

      scripts.forEach(script => {
        const normalizedSrc = script.src.split('?')[0];
        
        if (normalizedSrc.includes('preferences-data.js')) {
          found.preferencesData = true;
          locations.preferencesData = script.lineNumber;
        }
        if (normalizedSrc.includes('preferences-v4.js')) {
          found.preferencesV4 = true;
          locations.preferencesV4 = script.lineNumber;
        }
        if (normalizedSrc.includes('preferences-ui-v4.js')) {
          found.preferencesUIV4 = true;
          locations.preferencesUIV4 = script.lineNumber;
        }
      });

      return {
        found,
        locations,
        allFound: found.preferencesData && found.preferencesV4 && found.preferencesUIV4,
        shouldHaveFiles: hasPreferencesPackage && pageName !== 'preferences'
      };
    }

    /**
     * Scan a single page
     */
    async scanPage(pageName) {
      try {
        const response = await fetch(`/${pageName}.html`);
        if (!response.ok) {
          return {
            pageName,
            status: 'error',
            error: `HTTP ${response.status}`,
            timestamp: new Date().toISOString()
          };
        }

        const html = await response.text();
        const scripts = this.extractScriptTags(html);
        const hasPreferencesPackage = this.hasPreferencesPackage(pageName);
        const requiredFiles = this.checkRequiredFiles(scripts, hasPreferencesPackage, pageName);
        const bootstrapDuplicates = this.checkBootstrapDuplicates(scripts);
        const duplicateScripts = this.checkDuplicateScripts(scripts);
        const loadOrder = this.checkLoadOrder(scripts);

        return {
          pageName,
          status: 'success',
          timestamp: new Date().toISOString(),
          hasPreferencesPackage,
          scripts: {
            total: scripts.length,
            list: scripts.map(s => ({ src: s.src, line: s.lineNumber }))
          },
          requiredFiles,
          bootstrapDuplicates,
          duplicateScripts: {
            count: duplicateScripts.length,
            list: duplicateScripts
          },
          loadOrder,
          issues: this.identifyIssues(requiredFiles, bootstrapDuplicates, duplicateScripts, loadOrder, hasPreferencesPackage, pageName)
        };
      } catch (error) {
        return {
          pageName,
          status: 'error',
          error: error.message,
          timestamp: new Date().toISOString()
        };
      }
    }

    /**
     * Identify issues for a page
     */
    identifyIssues(requiredFiles, bootstrapDuplicates, duplicateScripts, loadOrder, hasPreferencesPackage, pageName) {
      const issues = [];

      // Check required files (only if page has preferences package and is not preferences page)
      if (requiredFiles.shouldHaveFiles) {
        if (!requiredFiles.found.preferencesData) {
          issues.push({
            type: 'missing_file',
            severity: 'error',
            message: 'Missing preferences-data.js',
            file: 'scripts/services/preferences-data.js',
            recommendation: 'Add before crud-response-handler.js in SERVICES PACKAGE'
          });
        }
        if (!requiredFiles.found.preferencesV4) {
          issues.push({
            type: 'missing_file',
            severity: 'error',
            message: 'Missing preferences-v4.js',
            file: 'scripts/services/preferences-v4.js',
            recommendation: 'Add in PREFERENCES PACKAGE'
          });
        }
        if (!requiredFiles.found.preferencesUIV4) {
          issues.push({
            type: 'missing_file',
            severity: 'error',
            message: 'Missing preferences-ui-v4.js',
            file: 'scripts/preferences-ui-v4.js',
            recommendation: 'Add in PREFERENCES PACKAGE'
          });
        }
      }

      // Check Bootstrap duplicates
      if (bootstrapDuplicates.hasDuplicates) {
        issues.push({
          type: 'bootstrap_duplicate',
          severity: 'warning',
          message: `Found ${bootstrapDuplicates.count} Bootstrap JS bundles`,
          recommendation: 'Remove duplicates, keep only 5.3.3 from base package'
        });
      }

      // Check duplicate scripts
      if (duplicateScripts.length > 0) {
        duplicateScripts.forEach(dup => {
          issues.push({
            type: 'duplicate_script',
            severity: 'error',
            message: `Duplicate script: ${dup.src}`,
            occurrences: dup.occurrences.map(o => `Line ${o.lineNumber}`),
            recommendation: 'Remove duplicate script tag'
          });
        });
      }

      // Check load order
      if (!loadOrder.isCorrectOrder && loadOrder.preferencesDataIndex !== -1 && loadOrder.crudResponseHandlerIndex !== -1) {
        issues.push({
          type: 'load_order',
          severity: 'error',
          message: 'preferences-data.js loaded after crud-response-handler.js',
          currentOrder: {
            preferencesData: `Line ${loadOrder.preferencesDataIndex}`,
            crudResponseHandler: `Line ${loadOrder.crudResponseHandlerIndex}`
          },
          recommendation: 'Move preferences-data.js before crud-response-handler.js'
        });
      }

      return issues;
    }

    /**
     * Scan all pages
     */
    async scanAllPages() {
      console.log('🔍 Starting scan of all pages...');
      this.results = [];

      for (const pageName of this.pages) {
        console.log(`Scanning ${pageName}...`);
        const result = await this.scanPage(pageName);
        this.results.push(result);
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return this.generateReport();
    }

    /**
     * Generate comprehensive report
     */
    generateReport() {
      const summary = {
        totalPages: this.results.length,
        successful: this.results.filter(r => r.status === 'success').length,
        errors: this.results.filter(r => r.status === 'error').length,
        pagesWithIssues: this.results.filter(r => r.issues && r.issues.length > 0).length,
        totalIssues: this.results.reduce((sum, r) => sum + (r.issues ? r.issues.length : 0), 0)
      };

      const issuesByType = {
        missing_file: 0,
        bootstrap_duplicate: 0,
        duplicate_script: 0,
        load_order: 0
      };

      this.results.forEach(result => {
        if (result.issues) {
          result.issues.forEach(issue => {
            issuesByType[issue.type] = (issuesByType[issue.type] || 0) + 1;
          });
        }
      });

      return {
        summary,
        issuesByType,
        results: this.results,
        timestamp: new Date().toISOString()
      };
    }

    /**
     * Export report as JSON
     */
    exportReportAsJSON() {
      const report = this.generateReport();
      const json = JSON.stringify(report, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `preferences-pages-scan-report-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    /**
     * Display report in console
     */
    displayReport() {
      const report = this.generateReport();
      
      console.log('📊 Preferences Pages Scan Report');
      console.log('================================');
      console.log(`Total Pages: ${report.summary.totalPages}`);
      console.log(`Successful: ${report.summary.successful}`);
      console.log(`Errors: ${report.summary.errors}`);
      console.log(`Pages with Issues: ${report.summary.pagesWithIssues}`);
      console.log(`Total Issues: ${report.summary.totalIssues}`);
      console.log('\nIssues by Type:');
      console.log(JSON.stringify(report.issuesByType, null, 2));
      
      console.log('\n📋 Detailed Results:');
      report.results.forEach(result => {
        if (result.status === 'error') {
          console.log(`❌ ${result.pageName}: ${result.error}`);
        } else if (result.issues && result.issues.length > 0) {
          console.log(`⚠️ ${result.pageName}: ${result.issues.length} issues`);
          result.issues.forEach(issue => {
            console.log(`   - ${issue.type}: ${issue.message}`);
          });
        } else {
          console.log(`✅ ${result.pageName}: OK`);
        }
      });

      return report;
    }
  }

  // Export to window
  window.PreferencesPagesScanner = PreferencesPagesScanner;

  // Auto-run if called directly
  if (typeof window.runPreferencesPagesScan === 'undefined') {
    window.runPreferencesPagesScan = async function() {
      const scanner = new PreferencesPagesScanner();
      const report = await scanner.scanAllPages();
      scanner.displayReport();
      return report;
    };
  }

  console.log('✅ PreferencesPagesScanner loaded');
})();

