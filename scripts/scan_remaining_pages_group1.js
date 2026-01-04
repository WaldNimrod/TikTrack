const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Group 1: User/Auth pages (should work without authentication)
const GROUP_1_PAGES = [
    'login',
    'register', 
    'forgot_password',
    'reset_password'
];

// Different globals for auth pages - they don't load modules package
const REQUIRED_GLOBALS_AUTH_PAGES = [
    { check: 'window.API_BASE_URL', name: 'API_BASE_URL' },
    { check: 'window.Logger', name: 'Logger' },
    { check: 'window.TikTrackAuth', name: 'TikTrackAuth' }
    // Note: ModalManagerV2 and UnifiedAppInitializer are NOT required for auth pages
];

async function scanGroup1Pages() {
    console.log('🔐 Starting GROUP 1 scan: User/Auth pages (no auth required)');
    console.log(`📊 Testing ${GROUP_1_PAGES.length} pages`);
    console.log('=' * 60);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const allResults = {
        timestamp: new Date().toISOString(),
        group: 'Group 1 - User/Auth Pages',
        auth_required: false,
        total_pages: GROUP_1_PAGES.length,
        summary: {
            ok: 0,
            critical: 0,
            no_scripts: 0,
            navigation_error: 0
        },
        results: []
    };

    for (let i = 0; i < GROUP_1_PAGES.length; i++) {
        const pageUrl = GROUP_1_PAGES[i];
        console.log(`🔍 [${i + 1}/${GROUP_1_PAGES.length}] Testing: ${pageUrl}`);

        try {
            const page = await browser.newPage();

            // Enable console logging
            let consoleErrors = [];
            let loggerMessages = [];

            page.on('console', msg => {
                const text = msg.text();
                if (msg.type() === 'error') {
                    console.log(`❌ CONSOLE ERROR [${pageUrl}]: ${text}`);
                    consoleErrors.push(text);
                } else if (text.includes('Logger') || text.includes('[INFO]') || text.includes('[ERROR]') || text.includes('[WARN]')) {
                    loggerMessages.push(text);
                }
            });

            const result = {
                page: pageUrl,
                authenticated: false,
                html_scripts: 0,
                dom_scripts: 0,
                requiredGlobals_missing: [],
                load_order: 'OK',
                errors: consoleErrors,
                logger_summary: loggerMessages.slice(0, 10).join('; '),
                status: 'UNKNOWN',
                timestamp: new Date().toISOString()
            };

            // Navigate to page
            await page.goto(`http://localhost:8080/${pageUrl}`, { 
                waitUntil: 'networkidle2',
                timeout: 30000 
            });

            // Wait for scripts to load
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Count scripts
            const htmlScripts = await page.$$eval('script[src]', scripts => scripts.length);
            result.html_scripts = htmlScripts;
            const allScripts = await page.$$eval('script', scripts => scripts.length);
            result.dom_scripts = allScripts;

            // Check globals - use auth-specific globals for auth pages
            const globalsToCheck = REQUIRED_GLOBALS_AUTH_PAGES;
            for (const globalObj of globalsToCheck) {
                try {
                    const value = await page.evaluate(`${globalObj.check}`);
                    let exists = value !== undefined && value !== null;

                    // Special case for API_BASE_URL - empty string is valid
                    if (globalObj.name === 'API_BASE_URL' && value === '') {
                        exists = true;
                    }

                    if (!exists) {
                        result.requiredGlobals_missing.push(globalObj.name);
                    }
                } catch (e) {
                    result.requiredGlobals_missing.push(globalObj.name);
                }
            }

            // Determine status
            if (result.requiredGlobals_missing.length > 0 || consoleErrors.length > 0) {
                result.status = 'CRITICAL';
                allResults.summary.critical++;
            } else if (result.html_scripts === 0) {
                result.status = 'NO_SCRIPTS';
                allResults.summary.no_scripts++;
            } else {
                result.status = 'OK';
                allResults.summary.ok++;
            }

            console.log(`${pageUrl}: ${result.status} (${result.html_scripts}/${result.dom_scripts} scripts, missing: ${result.requiredGlobals_missing.length})`);
            allResults.results.push(result);

            await page.close();

        } catch (error) {
            console.log(`❌ FAILED to test ${pageUrl}: ${error.message}`);
            allResults.results.push({
                page: pageUrl,
                authenticated: false,
                status: 'NAVIGATION_ERROR',
                error: error.message,
                timestamp: new Date().toISOString()
            });
            allResults.summary.navigation_error++;
        }

        // Small delay between pages
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Save results
    const outputPath = path.join(__dirname, '..', 'documentation', '05-REPORTS', 'artifacts', '2026_01_04', 'group1_user_auth_pages_scan.json');
    fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2));
    
    console.log('\n📊 GROUP 1 SUMMARY:');
    console.log(`✅ OK: ${allResults.summary.ok}/${GROUP_1_PAGES.length}`);
    console.log(`❌ CRITICAL: ${allResults.summary.critical}/${GROUP_1_PAGES.length}`);
    console.log(`🚫 NO SCRIPTS: ${allResults.summary.no_scripts}/${GROUP_1_PAGES.length}`);
    console.log(`🌐 NAVIGATION ERROR: ${allResults.summary.navigation_error}/${GROUP_1_PAGES.length}`);
    console.log(`\n💾 Results saved to: ${outputPath}`);

    await browser.close();
}

scanGroup1Pages().catch(console.error);
