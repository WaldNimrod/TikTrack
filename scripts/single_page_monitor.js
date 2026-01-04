const puppeteer = require('puppeteer');
const fs = require('fs');

const REQUIRED_GLOBALS = [
    'window.API_BASE_URL',
    'window.Logger',
    'window.ModalManagerV2',
    'window.UnifiedAppInitializer',
    'window.TikTrackAuth'
];

async function monitorSinglePage(pageUrl) {
    console.log(`🔍 Testing page: ${pageUrl}`);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Capture console errors
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
        // Navigate to page
        await page.goto(`http://127.0.0.1:8080${pageUrl}`, {
            waitUntil: 'networkidle0',
            timeout: 15000
        });

        // Wait for initialization
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Check script counts
        const scriptCounts = await page.evaluate(() => {
            const htmlScripts = document.querySelectorAll('script[src]').length;
            const domScripts = Array.from(document.scripts).filter(s => s.src).length;
            return { htmlScripts, domScripts };
        });

        results.html_scripts = scriptCounts.htmlScripts;
        results.dom_scripts = scriptCounts.domScripts;
        results.console_errors = consoleErrors;

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

        // Check Logger
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

        // Determine status
        const hasMissingGlobals = results.requiredGlobals_missing.length > 0;
        const hasScriptMismatch = results.html_scripts !== results.dom_scripts;
        const hasConsoleErrors = consoleErrors.length > 0;

        if (hasMissingGlobals || hasScriptMismatch) {
            results.status = 'CRITICAL';
        } else if (hasConsoleErrors) {
            results.status = 'YELLOW';
        } else if (loggerCheck.initialized) {
            results.status = 'GREEN';
        } else {
            results.status = 'YELLOW';
        }

        console.log(`✅ ${pageUrl}: ${results.status} (${results.dom_scripts}/${results.html_scripts} scripts, missing: ${results.requiredGlobals_missing.length}, errors: ${consoleErrors.length})`);

    } catch (error) {
        results.errors.push(`Test failed: ${error.message}`);
        results.status = 'ERROR';
        console.log(`❌ ${pageUrl}: ERROR - ${error.message}`);
    } finally {
        await browser.close();
    }

    return results;
}

// Get page from command line argument
const targetPage = process.argv[2];
if (!targetPage) {
    console.error('Usage: node single_page_monitor.js <page_url>');
    process.exit(1);
}

monitorSinglePage(targetPage)
    .then(result => {
        // Save to JSON for processing
        const outputFile = `page_test_result.json`;
        fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
        console.log(`📄 Results saved to: ${outputFile}`);
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Test failed:', error);
        process.exit(1);
    });
