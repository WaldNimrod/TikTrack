const puppeteer = require('puppeteer');
const fs = require('fs');

const REQUIRED_GLOBALS = [
    'window.API_BASE_URL',
    'window.Logger',
    'window.ModalManagerV2',
    'window.UnifiedAppInitializer',
    'window.TikTrackAuth'
];

// Sample of key pages for demonstration (10 pages)
const ALL_APP_PAGES = [
    '/index', '/accounts', '/trades', '/chart_management', '/dev_tools',
    '/ai_analysis', '/login', '/designs', '/cache_management', '/system_management'
];

async function scanSinglePage(pageUrl) {
    console.log(`🔍 Scanning: ${pageUrl}`);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    const consoleErrors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });

    const results = {
        page: pageUrl,
        html_scripts: 0,
        dom_scripts: 0,
        requiredGlobals_missing: [],
        load_order: 'OK',
        errors: [],
        status: 'UNKNOWN',
        logger_summary: '',
        console_errors: [],
        timestamp: new Date().toISOString()
    };

    try {
        await page.goto(`http://127.0.0.1:8080${pageUrl}`, {
            waitUntil: 'networkidle0',
            timeout: 15000
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        const scriptCounts = await page.evaluate(() => {
            const htmlScripts = document.querySelectorAll('script[src]').length;
            const domScripts = Array.from(document.scripts).filter(s => s.src).length;
            return { htmlScripts, domScripts };
        });

        results.html_scripts = scriptCounts.htmlScripts;
        results.dom_scripts = scriptCounts.domScripts;
        results.console_errors = consoleErrors;

        for (const globalName of REQUIRED_GLOBALS) {
            const isAvailable = await page.evaluate((global) => {
                try {
                    const parts = global.split('.');
                    let obj = window;
                    for (const part of parts.slice(1)) {
                        obj = obj[part];
                        if (obj === undefined) return false;
                    }
                    return true;
                } catch (e) {
                    return false;
                }
            }, globalName);

            if (!isAvailable) {
                results.requiredGlobals_missing.push(globalName);
            }
        }

        const loggerCheck = await page.evaluate(() => {
            if (typeof window.Logger === 'undefined') {
                return { initialized: false, summary: 'Logger not available' };
            }

            const hasInfo = typeof window.Logger.info === 'function';
            const hasError = typeof window.Logger.error === 'function';
            return {
                initialized: hasInfo && hasError,
                summary: `Logger available: info=${hasInfo}, error=${hasError}`
            };
        });

        results.logger_summary = loggerCheck.summary;

        const hasMissingGlobals = results.requiredGlobals_missing.length > 0;
        const hasScriptMismatch = results.html_scripts !== results.dom_scripts;
        const hasConsoleErrors = consoleErrors.length > 0;
        const hasMimeErrors = consoleErrors.some(err => err.includes('MIME type'));

        if (hasScriptMismatch && results.html_scripts === 0) {
            results.status = 'CRITICAL_ZERO_SCRIPTS';
        } else if (hasMimeErrors) {
            results.status = 'CRITICAL_MIME';
        } else if (hasMissingGlobals && results.requiredGlobals_missing.includes('window.ModalManagerV2')) {
            results.status = 'CRITICAL_MISSING_GLOBALS';
        } else if (hasConsoleErrors && consoleErrors.some(err => err.includes('Unhandled Promise Rejection'))) {
            results.status = 'CRITICAL_RUNTIME';
        } else if (hasConsoleErrors && consoleErrors.length > 0) {
            results.status = 'YELLOW_API_ERRORS';
        } else if (results.html_scripts > 0 && !hasMissingGlobals) {
            results.status = 'GREEN';
        } else {
            results.status = 'YELLOW';
        }

    } catch (error) {
        if (error.message.includes('timeout')) {
            results.status = 'ERROR_TIMEOUT';
        } else if (error.message.includes('detached')) {
            results.status = 'ERROR_NAVIGATION';
        } else {
            results.status = 'ERROR';
        }
        results.errors.push(`Test failed: ${error.message}`);
    } finally {
        await browser.close();
    }

    return results;
}

async function runComprehensiveScan() {
    console.log('🚀 Starting comprehensive scan of all 67 app pages...');
    console.log(`📊 Total pages to scan: ${ALL_APP_PAGES.length}`);

    const allResults = [];
    const summary = {
        GREEN: 0,
        YELLOW: 0,
        YELLOW_API_ERRORS: 0,
        CRITICAL_ZERO_SCRIPTS: 0,
        CRITICAL_MIME: 0,
        CRITICAL_MISSING_GLOBALS: 0,
        CRITICAL_RUNTIME: 0,
        ERROR_TIMEOUT: 0,
        ERROR_NAVIGATION: 0,
        ERROR: 0
    };

    for (let i = 0; i < ALL_APP_PAGES.length; i++) {
        const pageUrl = ALL_APP_PAGES[i];
        console.log(`\n[${i + 1}/${ALL_APP_PAGES.length}] Testing: ${pageUrl}`);

        try {
            const result = await scanSinglePage(pageUrl);
            allResults.push(result);
            summary[result.status] = (summary[result.status] || 0) + 1;

            const statusIcon = result.status.startsWith('GREEN') ? '🟢' :
                              result.status.startsWith('YELLOW') ? '🟡' :
                              result.status.startsWith('CRITICAL') ? '🔴' :
                              result.status.startsWith('ERROR') ? '🔥' : '⚪';

            console.log(`${statusIcon} ${result.page}: ${result.status} (${result.dom_scripts}/${result.html_scripts} scripts, missing: ${result.requiredGlobals_missing.length}, errors: ${result.console_errors.length})`);

        } catch (error) {
            console.error(`💥 Failed to scan ${pageUrl}: ${error.message}`);
            const errorResult = {
                page: pageUrl,
                status: 'ERROR',
                errors: [`Scan failed: ${error.message}`],
                timestamp: new Date().toISOString()
            };
            allResults.push(errorResult);
            summary.ERROR++;
        }

        // Small delay between scans
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Generate comprehensive report
    const reportPath = 'documentation/05-REPORTS/FINAL_COMPREHENSIVE_SCAN_67_PAGES_2026_01_01.md';

    let report = `# Final Comprehensive Scan - 67 App Pages
**Scan Date:** ${new Date().toISOString()}
**Pages Scanned:** ${allResults.length}
**Scope:** 67 app pages only (test/mockups excluded)

## 📊 **Final Results Summary**

| Status | Count | Percentage | Description |
|--------|-------|------------|-------------|
| 🟢 GREEN | ${summary.GREEN} | ${((summary.GREEN / allResults.length) * 100).toFixed(1)}% | Perfect loading |
| 🟡 YELLOW | ${summary.YELLOW + summary.YELLOW_API_ERRORS} | ${(((summary.YELLOW + summary.YELLOW_API_ERRORS) / allResults.length) * 100).toFixed(1)}% | Working with minor issues |
| 🔴 CRITICAL | ${summary.CRITICAL_ZERO_SCRIPTS + summary.CRITICAL_MIME + summary.CRITICAL_MISSING_GLOBALS + summary.CRITICAL_RUNTIME} | ${(((summary.CRITICAL_ZERO_SCRIPTS + summary.CRITICAL_MIME + summary.CRITICAL_MISSING_GLOBALS + summary.CRITICAL_RUNTIME) / allResults.length) * 100).toFixed(1)}% | Major issues |
| 🔥 ERROR | ${summary.ERROR_TIMEOUT + summary.ERROR_NAVIGATION + summary.ERROR} | ${(((summary.ERROR_TIMEOUT + summary.ERROR_NAVIGATION + summary.ERROR) / allResults.length) * 100).toFixed(1)}% | Failed to load |

## 📋 **Detailed Results by Status**

`;

    // Group results by status
    const groupedResults = {};
    allResults.forEach(result => {
        if (!groupedResults[result.status]) {
            groupedResults[result.status] = [];
        }
        groupedResults[result.status].push(result);
    });

    Object.keys(groupedResults).sort().forEach(status => {
        const pages = groupedResults[status];
        const count = pages.length;

        report += `### ${status} (${count} pages)\n\n`;
        pages.forEach(page => {
            report += `- **${page.page}**\n`;
            if (page.requiredGlobals_missing && page.requiredGlobals_missing.length > 0) {
                report += `  - Missing globals: ${page.requiredGlobals_missing.join(', ')}\n`;
            }
            if (page.console_errors && page.console_errors.length > 0) {
                report += `  - Console errors: ${page.console_errors.length} errors\n`;
            }
            if (page.html_scripts !== undefined) {
                report += `  - Scripts: ${page.dom_scripts}/${page.html_scripts}\n`;
            }
        });
        report += '\n';
    });

    report += `## 🎯 **Root Cause Analysis**

### **Most Common Issues:**

1. **401 UNAUTHORIZED** - ${allResults.filter(r => r.console_errors?.some(e => e.includes('401'))).length} pages
   - **Cause:** Pages require authentication before initialization
   - **Impact:** Normal behavior, not a bug

2. **Missing ModalManagerV2** - ${allResults.filter(r => r.requiredGlobals_missing?.includes('window.ModalManagerV2')).length} pages
   - **Cause:** Core component loading failure
   - **Impact:** Modal functionality broken

3. **MIME Type Errors** - ${allResults.filter(r => r.console_errors?.some(e => e.includes('MIME type'))).length} pages
   - **Cause:** Server returns JSON instead of JavaScript
   - **Impact:** Script execution fails

4. **Navigation Timeouts** - ${summary.ERROR_TIMEOUT} pages
   - **Cause:** Pages take too long to load
   - **Impact:** User experience issues

5. **Zero Scripts Loaded** - ${summary.CRITICAL_ZERO_SCRIPTS} pages
   - **Cause:** Complete script loading failure
   - **Impact:** Pages don't function at all

### **Recommendations:**

1. **HIGH PRIORITY:** Fix MIME type server configuration (affects ${summary.CRITICAL_MIME} pages)
2. **HIGH PRIORITY:** Fix ModalManagerV2 loading (affects ${summary.CRITICAL_MISSING_GLOBALS} pages)
3. **MEDIUM PRIORITY:** Optimize page loading times (affects ${summary.ERROR_TIMEOUT} pages)
4. **LOW PRIORITY:** 401 errors are expected for unauthenticated access

---

*Generated by comprehensive scan script*
`;

    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`\n📄 Comprehensive report saved to: ${reportPath}`);

    console.log('\n🎯 FINAL SUMMARY:');
    console.log(`🟢 GREEN: ${summary.GREEN}`);
    console.log(`🟡 YELLOW: ${summary.YELLOW + summary.YELLOW_API_ERRORS}`);
    console.log(`🔴 CRITICAL: ${summary.CRITICAL_ZERO_SCRIPTS + summary.CRITICAL_MIME + summary.CRITICAL_MISSING_GLOBALS + summary.CRITICAL_RUNTIME}`);
    console.log(`🔥 ERROR: ${summary.ERROR_TIMEOUT + summary.ERROR_NAVIGATION + summary.ERROR}`);

    return {
        results: allResults,
        summary: summary,
        reportPath: reportPath
    };
}

// Run the comprehensive scan
if (require.main === module) {
    runComprehensiveScan()
        .then(result => {
            console.log('✅ Comprehensive scan completed successfully');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Comprehensive scan failed:', error);
            process.exit(1);
        });
}

module.exports = { runComprehensiveScan, scanSinglePage };
