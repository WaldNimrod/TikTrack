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
    '/tag_management',
    '/login',
    '/register',
    '/forgot_password',
    '/reset_password',
    '/background_tasks',
    '/cache_management',
    '/chart_management',
    '/code_quality_dashboard',
    '/css_management',
    '/db_display',
    '/db_extradata',
    '/designs',
    '/dev_tools',
    '/dynamic_colors_display',
    '/external_data_dashboard',
    '/init_system_management',
    '/notifications_center',
    '/preferences_groups_management',
    '/server_monitor',
    '/system_management',
    '/conditions_modals',
    '/constraints',
    '/button_color_mapping',
    '/crud_testing_dashboard',
    '/watch_list',
    '/defer_test',
    '/test_script_loading',
    '/test_phase1_recovery',
    '/test_bootstrap_popover_comparison',
    '/test_overlay_debug',
    '/test_recent_items_widget',
    '/test_phase3_1_comprehensive',
    '/test_unified_widget_comprehensive',
    '/test_user_ticker_integration',
    '/test_ticker_widgets_performance',
    '/test_frontend_wrappers',
    '/test_unified_widget',
    '/test_unified_widget_integration',
    '/test_nested_modal_rich_text',
    '/button_color_mapping_simple',
    '/tradingview_widgets_showcase',
    '/test_header_only',
    '/conditions_test',
    '/mockups/flag_quick_action',
    '/mockups/watch_lists_page',
    '/mockups/add_ticker_modal',
    '/mockups/watch_list_modal',
    '/test_monitoring',
    '/test_quill',
    '/test_cash_flow',
    '/test_sorting',
    '/test_modal_loop',
    '/test_modal_stability',
    '/test_runtime',
    '/test_auth_console'
];

const REQUIRED_GLOBALS = [
    'window.API_BASE_URL',
    'window.Logger',
    'window.ModalManagerV2',
    'window.UnifiedAppInitializer',
    'window.TikTrackAuth'
];

async function monitorPageInitLoading(pageUrl) {
    console.log(`🔍 Testing: ${pageUrl}`);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    let consoleErrors = [];
    let loggerMessages = [];
    let authToken = null;

    // Enable console logging
    page.on('console', msg => {
        const text = msg.text();
        if (msg.type() === 'error') {
            console.log(`❌ CONSOLE ERROR [${pageUrl}]: ${text}`);
            consoleErrors.push(text);
        } else if (text.includes('Logger') || text.includes('[INFO]') || text.includes('[ERROR]') || text.includes('[WARN]')) {
            loggerMessages.push(text);
        }
    });

    // Intercept requests to add auth headers
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        const headers = { ...request.headers() };
        if (authToken && request.url().includes('/api/') && !request.url().includes('/api/auth/login')) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        request.continue({ headers });
    });

    const results = {
        page: pageUrl,
        html_scripts: 0,
        dom_scripts: 0,
        requiredGlobals_missing: [],
        load_order: 'OK',
        errors: consoleErrors,
        logger_summary: loggerMessages.slice(0, 10).join('; '),
        status: 'UNKNOWN',
        timestamp: new Date().toISOString()
    };

    try {
        // If not a public page, try to login first via API
        const publicPages = ['/login', '/register', '/reset_password', '/forgot_password'];
        const isPublic = publicPages.some(p => pageUrl.startsWith(p));

        if (!isPublic) {
            console.log(`🔐 Attempting API login for ${pageUrl}...`);

            try {
                // Login via API
                const loginResponse = await page.evaluate(async () => {
                    const response = await fetch('/api/auth/login', {
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
                });

                if (loginResponse.status === 'success' && loginResponse.data?.access_token) {
                    console.log(`✅ Login successful for ${pageUrl}`);
                    authToken = loginResponse.data.access_token; // Store for request interception

                    // Store token in localStorage and set Authorization header for all requests
                    await page.evaluate((token, user) => {
                        localStorage.setItem('authToken', token);
                        localStorage.setItem('currentUser', JSON.stringify(user));
                        // Also set sessionStorage for Option 1 compliance
                        sessionStorage.setItem('authToken', token);
                        sessionStorage.setItem('currentUser', JSON.stringify(user));
                        // Set dev keys for bootstrap
                        sessionStorage.setItem('dev_authToken', token);
                        sessionStorage.setItem('dev_currentUser', JSON.stringify(user));
                    }, loginResponse.data.access_token, loginResponse.data.user);

                    // Set cookie with the token for API calls
                    await page.setCookie({
                        name: 'auth_token',
                        value: loginResponse.data.access_token,
                        domain: 'localhost',
                        path: '/',
                        httpOnly: false,
                        secure: false
                    });
                } else {
                    console.log(`❌ Login failed for ${pageUrl}:`, loginResponse);
                }
            } catch (error) {
                console.log(`❌ Login API call failed for ${pageUrl}:`, error.message);
            }
        }

        // Navigate to target page with timeout
        await page.goto(`http://localhost:8080${pageUrl}`, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait a bit for scripts to load
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Count HTML scripts
        const htmlScripts = await page.$$eval('script[src]', scripts => scripts.length);
        results.html_scripts = htmlScripts;

        // Count DOM scripts (inline + dynamic)
        const allScripts = await page.$$eval('script', scripts => scripts.length);
        results.dom_scripts = allScripts;

        // Check required globals
        for (const globalCheck of REQUIRED_GLOBALS) {
            try {
                const exists = await page.evaluate(`!!(${globalCheck})`);
                if (!exists) {
                    results.requiredGlobals_missing.push(globalCheck);
                }
            } catch (e) {
                results.requiredGlobals_missing.push(globalCheck);
            }
        }

        // Determine status
        if (results.requiredGlobals_missing.length > 0 || consoleErrors.length > 0) {
            results.status = 'CRITICAL';
        } else if (results.html_scripts === 0) {
            results.status = 'NO_SCRIPTS';
        } else {
            results.status = 'OK';
        }

        console.log(`${pageUrl}: ${results.status} (${results.html_scripts}/${results.dom_scripts} scripts, missing: ${results.requiredGlobals_missing.length})`);

    } catch (error) {
        console.log(`❌ ${pageUrl}: NAVIGATION ERROR - ${error.message}`);
        results.status = 'NAVIGATION_ERROR';
        results.errors.push(`Navigation failed: ${error.message}`);
    }

    await browser.close();
    return results;
}

async function runFullMonitoring() {
    console.log('🚀 Starting FULL page init/loading monitoring for all 77 pages...');
    console.log(`📊 Testing ${ALL_PAGES.length} pages`);
    console.log('=' * 80);

    const allResults = {
        timestamp: new Date().toISOString(),
        total_pages: ALL_PAGES.length,
        summary: {
            ok: 0,
            critical: 0,
            no_scripts: 0,
            navigation_error: 0
        },
        results: []
    };

    for (let i = 0; i < ALL_PAGES.length; i++) {
        const pageUrl = ALL_PAGES[i];
        console.log(`🔍 [${i + 1}/${ALL_PAGES.length}] Testing: ${pageUrl}`);
        
        try {
            const result = await monitorPageInitLoading(pageUrl);
            allResults.results.push(result);
            
            // Update summary
            if (result.status === 'OK') allResults.summary.ok++;
            else if (result.status === 'CRITICAL') allResults.summary.critical++;
            else if (result.status === 'NO_SCRIPTS') allResults.summary.no_scripts++;
            else if (result.status === 'NAVIGATION_ERROR') allResults.summary.navigation_error++;
            
            // Small delay between pages
            await new Promise(resolve => setTimeout(resolve, 500));
            
        } catch (error) {
            console.log(`❌ FAILED to test ${pageUrl}: ${error.message}`);
            allResults.results.push({
                page: pageUrl,
                status: 'TEST_FAILED',
                error: error.message,
                timestamp: new Date().toISOString()
            });
        }
    }

    // Save results
    const outputPath = path.join(__dirname, '..', 'documentation', '05-REPORTS', 'artifacts', '2026_01_04', 'full_77_pages_monitoring_results.json');
    fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2));
    
    console.log('\n📊 FINAL SUMMARY:');
    console.log(`✅ OK: ${allResults.summary.ok}/${ALL_PAGES.length}`);
    console.log(`❌ CRITICAL: ${allResults.summary.critical}/${ALL_PAGES.length}`);
    console.log(`🚫 NO SCRIPTS: ${allResults.summary.no_scripts}/${ALL_PAGES.length}`);
    console.log(`🌐 NAVIGATION ERROR: ${allResults.summary.navigation_error}/${ALL_PAGES.length}`);
    console.log(`\n💾 Results saved to: ${outputPath}`);
}

// Run the monitoring
runFullMonitoring().catch(console.error);
