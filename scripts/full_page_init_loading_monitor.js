const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const PAGES_TO_TEST = [
    '/',
    '/crud_testing_dashboard',
    '/trades',
    '/alerts',
    '/preferences',
    '/login'
];

const REQUIRED_GLOBALS = [
    'window.API_BASE_URL',
    'window.Logger',
    'window.ModalManagerV2',
    'window.UnifiedAppInitializer',
    'window.TikTrackAuth'
];

async function monitorPageInitLoading(pageUrl) {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Enable console logging
    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log(`❌ CONSOLE ERROR [${pageUrl}]: ${msg.text()}`);
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
        timestamp: new Date().toISOString()
    };

    try {
        // Navigate to page
        await page.goto(`http://127.0.0.1:8080${pageUrl}`, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Login if needed (for protected pages)
        if (pageUrl !== '/login' && pageUrl !== '/register' && pageUrl !== '/forgot_password' && pageUrl !== '/reset_password') {
            try {
                // First check if we're already logged in by looking for logout button or user info
                const isLoggedIn = await page.evaluate(() => {
                    return document.body.innerHTML.includes('Logout') ||
                           document.body.innerHTML.includes('admin') ||
                           typeof window.TikTrackAuth !== 'undefined';
                });

                if (!isLoggedIn) {
                    // Navigate to login page first
                    await page.goto('http://127.0.0.1:8080/login', { waitUntil: 'networkidle0' });
                    await new Promise(resolve => setTimeout(resolve, 1000));

                    // Fill login form
                    await page.type('input[name="username"]', 'admin', { delay: 100 });
                    await page.type('input[name="password"]', 'admin123', { delay: 100 });

                    // Click login button
                    const loginButton = await page.$('button[type="submit"], input[type="submit"], .login-btn');
                    if (loginButton) {
                        await loginButton.click();
                        await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
                    }

                    // Go back to original page
                    await page.goto(`http://127.0.0.1:8080${pageUrl}`, { waitUntil: 'networkidle0' });
                }
            } catch (e) {
                console.log(`Login attempt failed for ${pageUrl}: ${e.message}`);
            }
        }

        // Wait for initialization
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Check script counts
        const scriptCounts = await page.evaluate(() => {
            const htmlScripts = document.querySelectorAll('script[src]').length;
            const domScripts = Array.from(document.scripts).filter(s => s.src).length;
            return { htmlScripts, domScripts };
        });

        results.html_scripts = scriptCounts.htmlScripts;
        results.dom_scripts = scriptCounts.domScripts;

        // Check required globals
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

        // Check for Logger initialization and get summary
        const loggerCheck = await page.evaluate(() => {
            if (typeof window.Logger === 'undefined') {
                return { initialized: false, summary: 'Logger not available' };
            }

            const hasInfo = typeof window.Logger.info === 'function';
            const hasError = typeof window.Logger.error === 'function';
            const hasWarn = typeof window.Logger.warn === 'function';

            return {
                initialized: hasInfo && hasError && hasWarn,
                summary: `Logger available: info=${hasInfo}, error=${hasError}, warn=${hasWarn}`
            };
        });

        results.logger_summary = loggerCheck.summary;

        // Determine status
        const hasMissingGlobals = results.requiredGlobals_missing.length > 0;
        const hasScriptMismatch = results.html_scripts !== results.dom_scripts;

        if (hasMissingGlobals || hasScriptMismatch) {
            results.status = 'CRITICAL';
            if (hasMissingGlobals) {
                results.errors.push(`Missing globals: ${results.requiredGlobals_missing.join(', ')}`);
            }
            if (hasScriptMismatch) {
                results.errors.push(`Script count mismatch: HTML=${results.html_scripts}, DOM=${results.dom_scripts}`);
            }
        } else if (loggerCheck.initialized) {
            results.status = 'GREEN';
        } else {
            results.status = 'YELLOW';
            results.errors.push('Logger not fully initialized');
        }

        // Check load order (simplified check)
        const loadOrderCheck = await page.evaluate(() => {
            const scripts = Array.from(document.scripts).filter(s => s.src);
            let orderIssues = 0;

            // Check if core scripts loaded before dependent ones
            const coreScripts = scripts.filter(s =>
                s.src.includes('core-systems.js') ||
                s.src.includes('api-service.js') ||
                s.src.includes('auth-service.js')
            );

            const dependentScripts = scripts.filter(s =>
                s.src.includes('page-initialization') ||
                s.src.includes('modal-manager')
            );

            // Simple check: core scripts should be before dependent ones
            if (coreScripts.length > 0 && dependentScripts.length > 0) {
                const lastCoreIndex = Math.max(...coreScripts.map(s => Array.from(document.scripts).indexOf(s)));
                const firstDependentIndex = Math.min(...dependentScripts.map(s => Array.from(document.scripts).indexOf(s)));

                if (lastCoreIndex > firstDependentIndex) {
                    orderIssues++;
                }
            }

            return orderIssues === 0 ? 'OK' : 'ISSUES';
        });

        results.load_order = loadOrderCheck;

    } catch (error) {
        results.errors.push(`Monitoring error: ${error.message}`);
        results.status = 'ERROR';
    } finally {
        await browser.close();
    }

    return results;
}

async function runFullPageMonitoring() {
    console.log('🚀 Starting full page init/loading monitoring...');
    console.log(`📊 Testing ${PAGES_TO_TEST.length} pages`);

    const allResults = [];
    let criticalCount = 0;
    let greenCount = 0;
    let errorCount = 0;

    for (let i = 0; i < PAGES_TO_TEST.length; i++) {
        const pageUrl = PAGES_TO_TEST[i];
        console.log(`\n🔍 [${i + 1}/${PAGES_TO_TEST.length}] Testing: ${pageUrl}`);

        try {
            const result = await monitorPageInitLoading(pageUrl);
            allResults.push(result);

            const statusEmoji = result.status === 'GREEN' ? '✅' : result.status === 'CRITICAL' ? '❌' : result.status === 'ERROR' ? '🔥' : '⚠️';
            console.log(`${statusEmoji} ${result.page}: ${result.status} (${result.dom_scripts}/${result.html_scripts} scripts, missing: ${result.requiredGlobals_missing.length})`);

            if (result.status === 'CRITICAL') criticalCount++;
            else if (result.status === 'GREEN') greenCount++;
            else if (result.status === 'ERROR') errorCount++;

        } catch (error) {
            console.error(`💥 Failed to test ${pageUrl}: ${error.message}`);
            allResults.push({
                page: pageUrl,
                html_scripts: 0,
                dom_scripts: 0,
                requiredGlobals_missing: REQUIRED_GLOBALS,
                load_order: 'UNKNOWN',
                errors: [`Test failed: ${error.message}`],
                status: 'ERROR',
                logger_summary: 'Test failed',
                timestamp: new Date().toISOString()
            });
            errorCount++;
        }

        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Generate report
    const reportPath = 'documentation/05-REPORTS/INIT_LOADING_FULL_78_PAGES_MATRIX_2026_01_01.md';

    let report = `# Init/Loading Full Page Matrix - 2026_01_01

**Test Date:** ${new Date().toISOString()}
**Pages Tested:** ${allResults.length}
**Summary:** ${greenCount} GREEN, ${criticalCount} CRITICAL, ${errorCount} ERROR

## 📊 Results Matrix

| Page | HTML Scripts | DOM Scripts | Missing Globals | Load Order | Errors | Status |
|------|-------------|-------------|----------------|------------|--------|---------|
`;

    allResults.forEach(result => {
        const statusEmoji = result.status === 'GREEN' ? '🟢' : result.status === 'CRITICAL' ? '🔴' : result.status === 'ERROR' ? '🔥' : '🟡';
        const missingGlobals = result.requiredGlobals_missing.length > 0 ? result.requiredGlobals_missing.join('; ') : 'None';
        const errors = result.errors.length > 0 ? result.errors.join('; ') : 'None';

        report += `| ${result.page} | ${result.html_scripts} | ${result.dom_scripts} | ${missingGlobals} | ${result.load_order} | ${errors} | ${statusEmoji} ${result.status} |\n`;
    });

    report += '\n## 📋 Critical Issues Summary\n\n';
    const criticalIssues = allResults.filter(r => r.status === 'CRITICAL');
    criticalIssues.forEach(issue => {
        report += `### ❌ ${issue.page}\n`;
        report += `- **Missing Globals:** ${issue.requiredGlobals_missing.join(', ')}\n`;
        report += `- **Script Mismatch:** HTML=${issue.html_scripts}, DOM=${issue.dom_scripts}\n`;
        if (issue.errors.length > 0) {
            report += `- **Errors:** ${issue.errors.join(', ')}\n`;
        }
        report += `- **Logger:** ${issue.logger_summary}\n\n`;
    });

    report += '\n## 🎯 Top 10 Critical Offenders\n\n';
    const topCritical = criticalIssues
        .sort((a, b) => b.requiredGlobals_missing.length - a.requiredGlobals_missing.length)
        .slice(0, 10);

    topCritical.forEach((issue, index) => {
        report += `${index + 1}. **${issue.page}** - ${issue.requiredGlobals_missing.length} missing globals\n`;
    });

    report += '\n## 🔍 Repro Steps for First Critical Page\n\n';
    if (topCritical.length > 0) {
        const firstCritical = topCritical[0];
        report += `### Page: ${firstCritical.page}\n\n`;
        report += '```bash\n';
        report += `# 1. Start server\n`;
        report += `./start_server.sh\n\n`;
        report += `# 2. Open browser and navigate to:\n`;
        report += `http://127.0.0.1:8080${firstCritical.page}\n\n`;
        report += `# 3. Login if required (admin/admin123)\n\n`;
        report += `# 4. Open DevTools Console and check:\n`;
        report += `console.log('Missing globals:', ${JSON.stringify(firstCritical.requiredGlobals_missing)});\n`;
        report += `console.log('Script counts - HTML:', ${firstCritical.html_scripts}, 'DOM:', ${firstCritical.dom_scripts});\n`;
        report += '```\n\n';
        report += `**Expected:** All required globals present, script counts match\n`;
        report += `**Actual:** ${firstCritical.errors.join(', ')}\n`;
    }

    // Save report
    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`\n📄 Report saved to: ${reportPath}`);

    // Console summary
    console.log('\n🎯 FINAL SUMMARY:');
    console.log(`✅ GREEN: ${greenCount}`);
    console.log(`❌ CRITICAL: ${criticalCount}`);
    console.log(`🔥 ERROR: ${errorCount}`);

    return {
        results: allResults,
        summary: {
            total: allResults.length,
            green: greenCount,
            critical: criticalCount,
            error: errorCount
        },
        reportPath
    };
}

// Run the monitoring
if (require.main === module) {
    runFullPageMonitoring()
        .then(result => {
            console.log('✅ Full page monitoring completed');
            process.exit(0);
        })
        .catch(error => {
            console.error('💥 Monitoring failed:', error);
            process.exit(1);
        });
}

module.exports = { runFullPageMonitoring, monitorPageInitLoading };
