const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Group 2: Dev Tools pages (need to check which require authentication)
const GROUP_2_PAGES = [
    'background_tasks',
    'cache_management',
    'chart_management',
    'code_quality_dashboard',
    'css_management',
    'db_display',
    'db_extradata',
    'designs',
    'dev_tools',
    'dynamic_colors_display',
    'external_data_dashboard',
    'init_system_management',
    'notifications_center',
    'preferences_groups_management',
    'server_monitor',
    'system_management',
    'conditions_modals',
    'constraints',
    'button_color_mapping',
    'crud_testing_dashboard'
];

const REQUIRED_GLOBALS = [
    { check: 'window.API_BASE_URL', name: 'API_BASE_URL' },
    { check: 'window.Logger', name: 'Logger' },
    { check: 'window.ModalManagerV2', name: 'ModalManagerV2' },
    { check: 'window.UnifiedAppInitializer', name: 'UnifiedAppInitializer' },
    { check: 'window.TikTrackAuth', name: 'TikTrackAuth' }
];

async function scanGroup2Pages() {
    console.log('🔧 Starting GROUP 2 scan: Dev Tools pages (with authentication)');
    console.log(`📊 Testing ${GROUP_2_PAGES.length} pages`);
    console.log('=' * 60);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    let authToken;

    // Intercept requests to add auth headers
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        const headers = { ...request.headers() };
        if (authToken && request.url().includes('/api/') && !request.url().includes('/api/auth/login')) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        request.continue({ headers });
    });

    const allResults = {
        timestamp: new Date().toISOString(),
        group: 'Group 2 - Dev Tools Pages',
        auth_required: true,
        total_pages: GROUP_2_PAGES.length,
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
        // Step 1: Authenticate
        console.log('🔑 Performing authentication...');
        await page.goto('http://localhost:8080/login', { waitUntil: 'networkidle2', timeout: 30000 });

        const loginResponse = await page.evaluate(async () => {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: 'admin', password: 'admin123' })
            });
            return await response.json();
        });

        if (!loginResponse.data?.access_token) {
            throw new Error(`Authentication failed: ${JSON.stringify(loginResponse)}`);
        }

        console.log('✅ Authentication successful');
        authToken = loginResponse.data.access_token;

        // Set auth data
        await page.evaluate((token, user) => {
            localStorage.setItem('authToken', token);
            localStorage.setItem('currentUser', JSON.stringify(user));
            sessionStorage.setItem('authToken', token);
            sessionStorage.setItem('currentUser', JSON.stringify(user));
            sessionStorage.setItem('dev_authToken', token);
            sessionStorage.setItem('dev_currentUser', JSON.stringify(user));
        }, authToken, loginResponse.data.user);

        // Step 2: Test each page
        for (let i = 0; i < GROUP_2_PAGES.length; i++) {
            const pageUrl = GROUP_2_PAGES[i];
            console.log(`🔍 [${i + 1}/${GROUP_2_PAGES.length}] Testing authenticated: ${pageUrl}`);

            try {
                // Navigate to page
                await page.goto(`http://localhost:8080/${pageUrl}`, { 
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
                for (const globalObj of REQUIRED_GLOBALS) {
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
                    status: 'NAVIGATION_ERROR',
                    error: error.message,
                    timestamp: new Date().toISOString()
                });
                allResults.summary.navigation_error++;
            }

            // Small delay between pages
            await new Promise(resolve => setTimeout(resolve, 500));
        }

    } catch (error) {
        console.log(`❌ AUTHENTICATION FAILED: ${error.message}`);
        allResults.authentication_error = error.message;
    }

    // Save results
    const outputPath = path.join(__dirname, '..', 'documentation', '05-REPORTS', 'artifacts', '2026_01_04', 'group2_dev_tools_pages_scan.json');
    fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2));
    
    console.log('\n📊 GROUP 2 SUMMARY:');
    console.log(`✅ OK: ${allResults.summary.ok}/${GROUP_2_PAGES.length}`);
    console.log(`❌ CRITICAL: ${allResults.summary.critical}/${GROUP_2_PAGES.length}`);
    console.log(`🚫 NO SCRIPTS: ${allResults.summary.no_scripts}/${GROUP_2_PAGES.length}`);
    console.log(`🔐 AUTH ERROR: ${allResults.summary.auth_error}/${GROUP_2_PAGES.length}`);
    console.log(`🌐 NAVIGATION ERROR: ${allResults.summary.navigation_error}/${GROUP_2_PAGES.length}`);
    console.log(`\n💾 Results saved to: ${outputPath}`);

    await browser.close();
}

scanGroup2Pages().catch(console.error);
