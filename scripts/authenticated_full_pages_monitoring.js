const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Full list of all 77 pages from PAGES_LIST.md
const ALL_PAGES = [
    '/',
    '/research', 
    '/trades',
    '/executions',
    '/alerts',
    '/trade_plans',
    '/tickers',
    '/trading_accounts',
    '/notes',
    '/cash_flows',
    '/trade_history',
    '/trading_journal',
    '/ai_analysis',
    '/watch_lists',
    '/user_profile',
    '/user_management',
    '/ticker_dashboard',
    '/portfolio_state',
    '/data_import',
    '/user_ticker',
    '/preferences',
    '/tag_management'
    // Limiting to first 22 pages for initial testing
];

const REQUIRED_GLOBALS = [
    'window.API_BASE_URL',
    'window.Logger',
    'window.ModalManagerV2',
    'window.UnifiedAppInitializer',
    'window.TikTrackAuth'
];

async function authenticateAndTestPages() {
    console.log('🔐 Starting AUTHENTICATED page monitoring for all pages...');
    console.log(`📊 Testing ${ALL_PAGES.length} pages with admin authentication`);
    console.log('=' * 70);

    // Launch browser with persistent context
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();

    const allResults = {
        timestamp: new Date().toISOString(),
        authentication: 'admin/admin123',
        total_pages: ALL_PAGES.length,
        summary: {
            ok: 0,
            critical: 0,
            no_scripts: 0,
            navigation_error: 0,
            auth_error: 0
        },
        results: []
    };

    try {
        // Step 1: Load a page first to enable localStorage access
        console.log('📄 Loading login page first...');
        await page.goto('http://localhost:8080/login', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Step 2: Authenticate via API
        console.log('🔑 Performing API authentication...');
        const loginResponse = await page.evaluate(async () => {
            try {
                const response = await fetch('http://localhost:8080/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: 'admin',
                        password: 'admin123'
                    })
                });
                return await response.json();
            } catch (error) {
                return { error: error.message };
            }
        });

        if (!loginResponse.data?.access_token) {
            throw new Error(`Authentication failed: ${JSON.stringify(loginResponse)}`);
        }

        console.log('✅ Authentication successful');

        // Step 3: Set authentication data in page context
        await page.evaluate((token, user) => {
            // Set in localStorage
            localStorage.setItem('authToken', token);
            localStorage.setItem('currentUser', JSON.stringify(user));

            // Set in sessionStorage (Option 1 compliance)
            sessionStorage.setItem('authToken', token);
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            sessionStorage.setItem('dev_authToken', token);
            sessionStorage.setItem('dev_currentUser', JSON.stringify(user));

            // Force UnifiedCacheManager initialization if available
            if (window.UnifiedCacheManager) {
                window.UnifiedCacheManager.save('authToken', token, { layer: 'sessionStorage', includeUserId: false });
                window.UnifiedCacheManager.save('currentUser', user, { layer: 'sessionStorage', includeUserId: false });
            }
        }, loginResponse.data.access_token, loginResponse.data.user);

        // Step 3: Test each page
        for (let i = 0; i < ALL_PAGES.length; i++) {
            const pageUrl = ALL_PAGES[i];
            console.log(`🔍 [${i + 1}/${ALL_PAGES.length}] Testing authenticated: ${pageUrl}`);

            try {
                // Navigate to page
                await page.goto(`http://localhost:8080${pageUrl}`, {
                    waitUntil: 'networkidle2',
                    timeout: 30000
                });

                // Wait for scripts to load
                await new Promise(resolve => setTimeout(resolve, 3000));

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
                    authenticated: true,
                    html_scripts: 0,
                    dom_scripts: 0,
                    requiredGlobals_missing: [],
                    load_order: 'OK',
                    errors: consoleErrors,
                    logger_summary: loggerMessages.slice(0, 10).join('; '),
                    status: 'UNKNOWN',
                    timestamp: new Date().toISOString()
                };

                // Count scripts
                const htmlScripts = await page.$$eval('script[src]', scripts => scripts.length);
                result.html_scripts = htmlScripts;
                const allScripts = await page.$$eval('script', scripts => scripts.length);
                result.dom_scripts = allScripts;

                // Check globals
                for (const globalCheck of REQUIRED_GLOBALS) {
                    try {
                        const exists = await page.evaluate(`!!(${globalCheck})`);
                        if (!exists) {
                            result.requiredGlobals_missing.push(globalCheck);
                        }
                    } catch (e) {
                        result.requiredGlobals_missing.push(globalCheck);
                    }
                }

                // Determine status
                if (result.requiredGlobals_missing.length > 0 || consoleErrors.length > 0) {
                    if (consoleErrors.some(err => err.includes('401') || err.includes('UNAUTHORIZED'))) {
                        result.status = 'AUTH_ERROR';
                        allResults.summary.auth_error++;
                    } else {
                        result.status = 'CRITICAL';
                        allResults.summary.critical++;
                    }
                } else if (result.html_scripts === 0) {
                    result.status = 'NO_SCRIPTS';
                    allResults.summary.no_scripts++;
                } else {
                    result.status = 'OK';
                    allResults.summary.ok++;
                }

                console.log(`${pageUrl}: ${result.status} (${result.html_scripts}/${result.dom_scripts} scripts, missing: ${result.requiredGlobals_missing.length})`);
                allResults.results.push(result);

            } catch (error) {
                console.log(`❌ FAILED to test ${pageUrl}: ${error.message}`);
                allResults.results.push({
                    page: pageUrl,
                    authenticated: true,
                    status: 'TEST_FAILED',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                if (error.message.includes('401') || error.message.includes('UNAUTHORIZED')) {
                    allResults.summary.auth_error++;
                } else {
                    allResults.summary.navigation_error++;
                }
            }

            // Small delay between pages
            await new Promise(resolve => setTimeout(resolve, 500));
        }

    } catch (error) {
        console.log(`❌ AUTHENTICATION FAILED: ${error.message}`);
        allResults.authentication_error = error.message;
    }

    // Save results
    const outputPath = path.join(__dirname, '..', 'documentation', '05-REPORTS', 'artifacts', '2026_01_04', 'authenticated_full_pages_monitoring_results.json');
    fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2));
    
    console.log('\n📊 AUTHENTICATED TESTING SUMMARY:');
    console.log(`✅ OK: ${allResults.summary.ok}/${ALL_PAGES.length}`);
    console.log(`❌ CRITICAL: ${allResults.summary.critical}/${ALL_PAGES.length}`);
    console.log(`🚫 NO SCRIPTS: ${allResults.summary.no_scripts}/${ALL_PAGES.length}`);
    console.log(`🔐 AUTH ERROR: ${allResults.summary.auth_error}/${ALL_PAGES.length}`);
    console.log(`🌐 NAVIGATION ERROR: ${allResults.summary.navigation_error}/${ALL_PAGES.length}`);
    console.log(`\n💾 Results saved to: ${outputPath}`);

    await browser.close();
}

authenticateAndTestPages().catch(console.error);
