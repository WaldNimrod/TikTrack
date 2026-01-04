const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Re-validation of 22 pages with single-tab monitoring after server-side fixes
const TARGET_PAGES = [
    '/', '/research', '/trades', '/executions', '/alerts', '/trade_plans', 
    '/tickers', '/trading_accounts', '/notes', '/cash_flows', '/trade_history', 
    '/trading_journal', '/ai_analysis', '/watch_lists', '/user_profile', 
    '/user_management', '/ticker_dashboard', '/portfolio_state', '/data_import', 
    '/user_ticker', '/preferences', '/tag_management'
];

const REQUIRED_GLOBALS = [
    { check: 'window.API_BASE_URL', name: 'API_BASE_URL' },
    { check: 'window.Logger', name: 'Logger' },
    { check: 'window.ModalManagerV2', name: 'ModalManagerV2' },
    { check: 'window.UnifiedAppInitializer', name: 'UnifiedAppInitializer' },
    { check: 'window.TikTrackAuth', name: 'TikTrackAuth' }
];

async function runSingleTabRevalidation() {
    console.log('🔄 Starting CLIENT ERROR RE-VALIDATION (Single Tab Mode)');
    console.log(`📊 Re-testing ${TARGET_PAGES.length} pages after server-side auth + MIME fixes`);
    console.log('=' * 70);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const results = {
        timestamp: new Date().toISOString(),
        test_type: 'CLIENT_ERROR_REVALIDATION_SINGLE_TAB',
        server_fixes_applied: ['auth_middleware', 'mime_types'],
        total_pages: TARGET_PAGES.length,
        summary: {
            ok: 0,
            critical: 0,
            no_scripts: 0,
            navigation_error: 0,
            auth_error: 0
        },
        results: [],
        delta_analysis: null // Will be populated after comparison
    };

    // Authenticate once at the beginning
    console.log('🔑 Performing initial authentication...');
    const page = await browser.newPage();

    // Set up request interception for auth
    let authToken = null;
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        const headers = { ...request.headers() };
        if (authToken && request.url().includes('/api/') && !request.url().includes('/api/auth/login')) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        request.continue({ headers });
    });

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

    authToken = loginResponse.data.access_token;
    console.log('✅ Authentication successful');

    // Test each page in the same tab (single-tab mode)
    for (let i = 0; i < TARGET_PAGES.length; i++) {
        const pageUrl = TARGET_PAGES[i];
        console.log(`🔍 [${i + 1}/${TARGET_PAGES.length}] Re-testing: ${pageUrl}`);

        try {
            // Clear console errors for this page
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

            // Navigate to page (same tab)
            await page.goto(`http://localhost:8080${pageUrl}`, { 
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
                    results.summary.auth_error++;
                } else {
                    result.status = 'CRITICAL';
                    results.summary.critical++;
                }
            } else if (result.html_scripts === 0) {
                result.status = 'NO_SCRIPTS';
                results.summary.no_scripts++;
            } else {
                result.status = 'OK';
                results.summary.ok++;
            }

            console.log(`${pageUrl}: ${result.status} (${result.html_scripts}/${result.dom_scripts} scripts, missing: ${result.requiredGlobals_missing.length}, errors: ${consoleErrors.length})`);
            results.results.push(result);

        } catch (error) {
            console.log(`❌ FAILED to test ${pageUrl}: ${error.message}`);
            results.results.push({
                page: pageUrl,
                authenticated: true,
                status: 'NAVIGATION_ERROR',
                error: error.message,
                timestamp: new Date().toISOString()
            });
            results.summary.navigation_error++;
        }

        // Small delay between pages
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Load previous results for delta analysis
    let previousResults = null;
    try {
        const previousPath = path.join(__dirname, '..', 'documentation', '05-REPORTS', 'artifacts', '2026_01_04', 'authenticated_full_pages_monitoring_results.json');
        previousResults = JSON.parse(fs.readFileSync(previousPath, 'utf8'));
        console.log('📊 Loaded previous results for delta analysis');
    } catch (error) {
        console.log('⚠️ Could not load previous results:', error.message);
    }

    // Generate delta analysis
    if (previousResults) {
        results.delta_analysis = generateDeltaAnalysis(results, previousResults);
        console.log('📈 Delta analysis completed');
    }

    // Save results
    const outputPath = path.join(__dirname, '..', 'documentation', '05-REPORTS', 'artifacts', '2026_01_04', 'client_error_revalidation_single_tab_results.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

    console.log('\n📊 RE-VALIDATION SUMMARY:');
    console.log(`✅ OK: ${results.summary.ok}/${TARGET_PAGES.length}`);
    console.log(`❌ CRITICAL: ${results.summary.critical}/${TARGET_PAGES.length}`);
    console.log(`🚫 NO SCRIPTS: ${results.summary.no_scripts}/${TARGET_PAGES.length}`);
    console.log(`🔐 AUTH ERROR: ${results.summary.auth_error}/${TARGET_PAGES.length}`);
    console.log(`🌐 NAVIGATION ERROR: ${results.summary.navigation_error}/${TARGET_PAGES.length}`);
    
    if (results.delta_analysis) {
        console.log('\n📈 DELTA ANALYSIS:');
        console.log(`Status improved: ${results.delta_analysis.status_improved}`);
        console.log(`Status same: ${results.delta_analysis.status_same}`);
        console.log(`Status worse: ${results.delta_analysis.status_worse}`);
        console.log(`MIME errors removed: ${results.delta_analysis.mime_errors_removed}`);
        console.log(`Auth errors removed: ${results.delta_analysis.auth_errors_removed}`);
    }
    
    console.log(`\n💾 Results saved to: ${outputPath}`);

    await browser.close();
}

function generateDeltaAnalysis(current, previous) {
    const delta = {
        status_improved: 0,
        status_same: 0,
        status_worse: 0,
        mime_errors_removed: 0,
        auth_errors_removed: 0,
        page_deltas: []
    };

    const statusPriority = { 'OK': 4, 'CRITICAL': 2, 'AUTH_ERROR': 1, 'NAVIGATION_ERROR': 0 };

    current.results.forEach(currentResult => {
        const previousResult = previous.results.find(r => r.page === currentResult.page);
        
        if (previousResult) {
            const currentPriority = statusPriority[currentResult.status] || 0;
            const previousPriority = statusPriority[previousResult.status] || 0;
            
            if (currentPriority > previousPriority) {
                delta.status_improved++;
            } else if (currentPriority === previousPriority) {
                delta.status_same++;
            } else {
                delta.status_worse++;
            }

            // Check for MIME errors removed
            const currentMimeErrors = currentResult.errors.filter(e => 
                e.includes('MIME type') || e.includes('text/html') || e.includes('application/json')
            ).length;
            const previousMimeErrors = previousResult.errors.filter(e => 
                e.includes('MIME type') || e.includes('text/html') || e.includes('application/json')
            ).length;
            
            if (previousMimeErrors > currentMimeErrors) {
                delta.mime_errors_removed += (previousMimeErrors - currentMimeErrors);
            }

            // Check for auth errors removed
            const currentAuthErrors = currentResult.errors.filter(e => 
                e.includes('401') || e.includes('UNAUTHORIZED')
            ).length;
            const previousAuthErrors = previousResult.errors.filter(e => 
                e.includes('401') || e.includes('UNAUTHORIZED')
            ).length;
            
            if (previousAuthErrors > currentAuthErrors) {
                delta.auth_errors_removed += (previousAuthErrors - currentAuthErrors);
            }

            delta.page_deltas.push({
                page: currentResult.page,
                previous_status: previousResult.status,
                current_status: currentResult.status,
                previous_errors: previousResult.errors.length,
                current_errors: currentResult.errors.length,
                mime_errors_removed: Math.max(0, previousMimeErrors - currentMimeErrors),
                auth_errors_removed: Math.max(0, previousAuthErrors - currentAuthErrors)
            });
        }
    });

    return delta;
}

runSingleTabRevalidation().catch(console.error);
