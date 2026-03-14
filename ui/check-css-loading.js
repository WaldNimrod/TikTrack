/**
 * CSS Loading Checker - Automated Tool
 *
 * This script checks that all required CSS files are loaded in the correct order.
 * Run this in the browser console (F12) on http://localhost:8080/
 *
 * Usage:
 * 1. Open http://localhost:8080/ in your browser
 * 2. Open DevTools (F12) → Console
 * 3. Copy and paste this entire script
 * 4. Press Enter
 *
 * Or use: npm run check:css (if integrated)
 *
 * The script will output detailed results for:
 * - CSS files loading order
 * - Missing CSS files
 * - Duplicate CSS files
 * - CSS Variables availability
 */

(function () {
  'use strict';

  console.log(
    '%c🔍 CSS Loading Checker - Automated Tool',
    'color: #26baac; font-size: 16px; font-weight: bold;',
  );
  console.log('='.repeat(80));

  const results = {
    errors: [],
    warnings: [],
    info: [],
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
    },
  };

  /**
   * Expected CSS loading order (CRITICAL - DO NOT CHANGE)
   */
  const EXPECTED_CSS_ORDER = [
    {
      name: 'Pico CSS',
      href: 'pico.min.css',
      required: true,
      description: 'Reset & Base (Generic Layer)',
    },
    {
      name: 'phoenix-base.css',
      href: 'phoenix-base.css',
      required: true,
      description: 'CSS Variables (SSOT) + Base Styles',
    },
    {
      name: 'phoenix-components.css',
      href: 'phoenix-components.css',
      required: true,
      description: 'LEGO Components',
    },
    {
      name: 'phoenix-header.css',
      href: 'phoenix-header.css',
      required: true,
      description: 'Unified Header Styles',
    },
    {
      name: 'D15_IDENTITY_STYLES.css',
      href: 'D15_IDENTITY_STYLES.css',
      required: false,
      description: 'Auth Pages Styles (only for auth pages)',
    },
    {
      name: 'D15_DASHBOARD_STYLES.css',
      href: 'D15_DASHBOARD_STYLES.css',
      required: false,
      description: 'Dashboard Pages Styles (only for dashboard pages)',
    },
  ];

  /**
   * Get all loaded CSS files
   */
  function getLoadedCSSFiles() {
    const cssFiles = [];

    // Get all stylesheets
    Array.from(document.styleSheets).forEach((sheet, index) => {
      try {
        const href = sheet.href || 'inline';
        const rules = sheet.cssRules ? sheet.cssRules.length : 0;

        cssFiles.push({
          index: index,
          href: href,
          rules: rules,
          isInline: !sheet.href,
        });
      } catch (e) {
        // Cross-origin stylesheet - can't access
        cssFiles.push({
          index: index,
          href: sheet.href || 'cross-origin',
          rules: 'N/A',
          isInline: false,
          crossOrigin: true,
        });
      }
    });

    return cssFiles;
  }

  /**
   * Check CSS loading order
   */
  function checkCSSLoadingOrder() {
    console.log(
      '\n%c📋 Checking CSS Loading Order',
      'color: #ff9500; font-weight: bold;',
    );

    const loadedFiles = getLoadedCSSFiles();
    const loadedHrefs = loadedFiles.map((f) => f.href);

    console.log(`\n📦 Found ${loadedFiles.length} stylesheets:`);
    loadedFiles.forEach((file, index) => {
      const marker = file.isInline ? '📄' : '🔗';
      console.log(
        `  ${index + 1}. ${marker} ${file.href} (${file.rules} rules)`,
      );
    });

    // Check each expected CSS file
    EXPECTED_CSS_ORDER.forEach((expected, index) => {
      const found = loadedHrefs.findIndex((href) => {
        if (expected.href === 'pico.min.css') {
          return href.includes('pico.min.css') || href.includes('pico.css');
        }
        return href.includes(expected.href);
      });

      results.summary.total++;

      if (found !== -1) {
        results.summary.passed++;
        console.log(`✅ ${expected.name} loaded (position: ${found + 1})`);

        // Check if order is correct
        if (expected.required) {
          const previousRequired = EXPECTED_CSS_ORDER.slice(0, index).filter(
            (e) => e.required,
          );
          let orderCorrect = true;

          previousRequired.forEach((prev) => {
            const prevFound = loadedHrefs.findIndex((href) => {
              if (prev.href === 'pico.min.css') {
                return (
                  href.includes('pico.min.css') || href.includes('pico.css')
                );
              }
              return href.includes(prev.href);
            });

            if (prevFound > found) {
              orderCorrect = false;
            }
          });

          if (!orderCorrect) {
            results.summary.failed++;
            results.summary.passed--;
            results.errors.push({
              file: expected.name,
              property: 'loading order',
              actual: `Loaded at position ${found + 1}`,
              expected: `Should be loaded after ${EXPECTED_CSS_ORDER[index - 1]?.name || 'none'}`,
            });
            console.log(
              `  ⚠️ Warning: ${expected.name} may be loaded in wrong order`,
            );
          }
        }
      } else if (expected.required) {
        results.summary.failed++;
        results.errors.push({
          file: expected.name,
          property: 'existence',
          actual: 'Not found',
          expected: 'Should be loaded',
        });
        console.log(`❌ ${expected.name} NOT loaded (REQUIRED)`);
      } else {
        // Optional file - just log
        if (found !== -1) {
          console.log(`ℹ️ ${expected.name} loaded (optional)`);
        } else {
          console.log(`ℹ️ ${expected.name} not loaded (optional - OK)`);
        }
      }
    });
  }

  /**
   * Check for duplicate CSS files
   */
  function checkDuplicateCSSFiles() {
    console.log(
      '\n%c🔍 Checking for Duplicate CSS Files',
      'color: #ff9500; font-weight: bold;',
    );

    const loadedFiles = getLoadedCSSFiles();
    const fileCounts = {};

    loadedFiles.forEach((file) => {
      if (!file.isInline && !file.crossOrigin) {
        const fileName = file.href.split('/').pop();
        if (!fileCounts[fileName]) {
          fileCounts[fileName] = [];
        }
        fileCounts[fileName].push(file.href);
      }
    });

    let hasDuplicates = false;
    Object.keys(fileCounts).forEach((fileName) => {
      if (fileCounts[fileName].length > 1) {
        hasDuplicates = true;
        results.summary.total++;
        results.summary.failed++;
        results.errors.push({
          file: fileName,
          property: 'duplicate',
          actual: `Loaded ${fileCounts[fileName].length} times`,
          expected: 'Should be loaded once',
        });
        console.log(
          `❌ ${fileName} loaded ${fileCounts[fileName].length} times:`,
        );
        fileCounts[fileName].forEach((href, index) => {
          console.log(`  ${index + 1}. ${href}`);
        });
      }
    });

    if (!hasDuplicates) {
      results.summary.total++;
      results.summary.passed++;
      console.log('✅ No duplicate CSS files found');
    }
  }

  /**
   * Check CSS Variables availability
   */
  function checkCSSVariables() {
    console.log(
      '\n%c🎨 Checking CSS Variables Availability',
      'color: #ff9500; font-weight: bold;',
    );

    // Get root styles
    const rootStyles = getComputedStyle(document.documentElement);

    // Check some critical CSS Variables
    const criticalVariables = [
      '--apple-blue',
      '--apple-bg-elevated',
      '--apple-text-primary',
      '--spacing-md',
      '--font-size-base',
      '--container-max-width',
    ];

    let allVariablesFound = true;
    criticalVariables.forEach((variable) => {
      const value = rootStyles.getPropertyValue(variable);
      results.summary.total++;

      if (value) {
        results.summary.passed++;
        console.log(`✅ ${variable}: ${value.trim()}`);
      } else {
        allVariablesFound = false;
        results.summary.failed++;
        results.errors.push({
          file: 'CSS Variables',
          property: variable,
          actual: 'Not found',
          expected: 'Should be defined in phoenix-base.css',
        });
        console.log(`❌ ${variable} NOT found`);
      }
    });

    if (allVariablesFound) {
      console.log('\n✅ All critical CSS Variables are available');
    } else {
      console.log(
        '\n⚠️ Some CSS Variables are missing - phoenix-base.css may not be loaded correctly',
      );
    }
  }

  /**
   * Check page-specific CSS requirements
   */
  function checkPageSpecificCSS() {
    console.log(
      '\n%c📄 Checking Page-Specific CSS Requirements',
      'color: #ff9500; font-weight: bold;',
    );

    const loadedFiles = getLoadedCSSFiles();
    const loadedHrefs = loadedFiles.map((f) => f.href);

    // Check if we're on an auth page
    const isAuthPage =
      window.location.pathname.includes('/login') ||
      window.location.pathname.includes('/register') ||
      window.location.pathname.includes('/reset-password');

    // Check if we're on a dashboard page
    const isDashboardPage =
      window.location.pathname === '/' ||
      window.location.pathname.includes('/dashboard') ||
      window.location.pathname.includes('/profile');

    if (isAuthPage) {
      const hasAuthCSS = loadedHrefs.some((href) =>
        href.includes('D15_IDENTITY_STYLES.css'),
      );
      results.summary.total++;

      if (hasAuthCSS) {
        results.summary.passed++;
        console.log(
          '✅ D15_IDENTITY_STYLES.css loaded (required for auth pages)',
        );
      } else {
        results.summary.failed++;
        results.warnings.push(
          'D15_IDENTITY_STYLES.css should be loaded for auth pages',
        );
        console.log(
          '⚠️ D15_IDENTITY_STYLES.css not loaded (recommended for auth pages)',
        );
      }
    }

    if (isDashboardPage) {
      const hasDashboardCSS = loadedHrefs.some((href) =>
        href.includes('D15_DASHBOARD_STYLES.css'),
      );
      results.summary.total++;

      if (hasDashboardCSS) {
        results.summary.passed++;
        console.log(
          '✅ D15_DASHBOARD_STYLES.css loaded (required for dashboard pages)',
        );
      } else {
        results.summary.failed++;
        results.errors.push({
          file: 'D15_DASHBOARD_STYLES.css',
          property: 'existence',
          actual: 'Not found',
          expected: 'Should be loaded for dashboard pages',
        });
        console.log(
          '❌ D15_DASHBOARD_STYLES.css NOT loaded (REQUIRED for dashboard pages)',
        );
      }
    }
  }

  /**
   * Print summary
   */
  function printSummary() {
    console.log('\n' + '='.repeat(80));
    console.log(
      '%c📊 SUMMARY',
      'color: #26baac; font-size: 16px; font-weight: bold;',
    );
    console.log('='.repeat(80));
    console.log(`Total checks: ${results.summary.total}`);
    console.log(
      `%c✅ Passed: ${results.summary.passed}`,
      'color: green; font-weight: bold;',
    );
    console.log(
      `%c❌ Failed: ${results.summary.failed}`,
      'color: red; font-weight: bold;',
    );

    if (results.errors.length > 0) {
      console.log(
        '\n%c❌ ERRORS:',
        'color: red; font-weight: bold; font-size: 14px;',
      );
      results.errors.forEach((error, index) => {
        console.log(`\n${index + 1}. ${error.file} - ${error.property}`);
        console.log('   Actual:', error.actual);
        console.log('   Expected:', error.expected);
      });
    }

    if (results.warnings.length > 0) {
      console.log(
        '\n%c⚠️ WARNINGS:',
        'color: orange; font-weight: bold; font-size: 14px;',
      );
      results.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning}`);
      });
    }

    console.log('\n' + '='.repeat(80));

    if (results.summary.failed === 0) {
      console.log(
        '%c✅ All CSS loading checks passed!',
        'color: green; font-size: 16px; font-weight: bold;',
      );
    } else {
      console.log(
        '%c❌ Some CSS loading checks failed. Please review the errors above.',
        'color: red; font-size: 16px; font-weight: bold;',
      );
    }
  }

  // Run all checks
  try {
    checkCSSLoadingOrder();
    checkDuplicateCSSFiles();
    checkCSSVariables();
    checkPageSpecificCSS();
    printSummary();
  } catch (error) {
    console.error('❌ Error running CSS loading check:', error);
  }

  // Return results for programmatic access
  return results;
})();
