const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Analyze MIME types for all scripts across all pages
const ALL_PAGES = [
    // Auth pages
    'login', 'register', 'forgot_password', 'reset_password',
    // User pages (from previous scan)
    '/', '/research', '/trades', '/executions', '/alerts', '/trade_plans', '/tickers', '/trading_accounts', '/notes', '/cash_flows', '/trade_history', '/trading_journal', '/ai_analysis', '/watch_lists', '/user_profile', '/user_management', '/ticker_dashboard', '/portfolio_state', '/data_import', '/user_ticker', '/preferences', '/tag_management',
    // Dev tools
    'background_tasks', 'cache_management', 'chart_management', 'code_quality_dashboard', 'css_management', 'db_display', 'db_extradata', 'designs', 'dev_tools', 'dynamic_colors_display', 'external_data_dashboard', 'init_system_management', 'notifications_center', 'preferences_groups_management', 'server_monitor', 'system_management', 'conditions_modals', 'constraints', 'button_color_mapping', 'crud_testing_dashboard',
    // Test pages
    'watch_list', 'defer_test', 'test_script_loading', 'test_phase1_recovery', 'test_bootstrap_popover_comparison', 'test_overlay_debug', 'test_recent_items_widget', 'test_phase3_1_comprehensive', 'test_unified_widget_comprehensive', 'test_user_ticker_integration', 'test_ticker_widgets_performance', 'test_frontend_wrappers', 'test_unified_widget', 'test_unified_widget_integration', 'test_nested_modal_rich_text', 'button_color_mapping_simple', 'tradingview_widgets_showcase', 'test_header_only', 'conditions_test', 'mockups/flag_quick_action', 'mockups/watch_lists_page', 'mockups/add_ticker_modal', 'mockups/watch_list_modal', 'test_monitoring', 'test_quill', 'test_cash_flow', 'test_sorting', 'test_modal_loop', 'test_modal_stability', 'test_runtime', 'test_auth_console'
];

const AUTH_PAGES = ['login', 'register', 'forgot_password', 'reset_password'];

async function analyzeMimeTypes() {
    console.log('🔍 Starting comprehensive MIME types analysis...');
    console.log(`📊 Analyzing ${ALL_PAGES.length} pages`);
    console.log('=' * 80);

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();
    let authToken;

    // Authenticate first for protected pages
    console.log('🔑 Authenticating...');
    await page.goto('http://localhost:8080/login', { waitUntil: 'networkidle2', timeout: 30000 });

    const loginResponse = await page.evaluate(async () => {
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin123' })
        });
        return await response.json();
    });

    if (loginResponse.data?.access_token) {
        authToken = loginResponse.data.access_token;
        console.log('✅ Authentication successful');
    }

    // Set up request interception to capture MIME types
    await page.setRequestInterception(true);
    const mimeData = {
        pages: {},
        summary: {
            total_scripts: 0,
            correct_mime: 0,
            wrong_mime: 0,
            mime_types_found: new Set(),
            wrong_mime_scripts: []
        }
    };

    page.on('request', (request) => {
        const headers = { ...request.headers() };
        if (authToken && request.url().includes('/api/') && !request.url().includes('/api/auth/login')) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        request.continue({ headers });
    });

    page.on('response', (response) => {
        const url = response.url();
        if (url.includes('.js') && !url.includes('cdn.jsdelivr.net') && !url.includes('fonts.googleapis.com')) {
            const contentType = response.headers()['content-type'] || 'missing';
            mimeData.summary.mime_types_found.add(contentType);

            const scriptInfo = {
                url: url,
                contentType: contentType,
                status: response.status(),
                isCorrect: contentType.includes('application/javascript') || contentType.includes('text/javascript')
            };

            mimeData.summary.total_scripts++;

            if (scriptInfo.isCorrect) {
                mimeData.summary.correct_mime++;
            } else {
                mimeData.summary.wrong_mime++;
                mimeData.summary.wrong_mime_scripts.push(scriptInfo);
            }
        }
    });

    // Test each page
    for (let i = 0; i < ALL_PAGES.length; i++) {
        const pageUrl = ALL_PAGES[i];
        console.log(`🔍 [${i + 1}/${ALL_PAGES.length}] Analyzing: ${pageUrl}`);

        try {
            const pageMimeData = {
                page: pageUrl,
                isAuthPage: AUTH_PAGES.includes(pageUrl.replace('/', '')),
                scripts: [],
                errors: []
            };

            // Reset page-specific data
            const pageScripts = [];

            page.on('response', (response) => {
                const url = response.url();
                if (url.includes('.js') && !url.includes('cdn.jsdelivr.net') && !url.includes('fonts.googleapis.com')) {
                    const contentType = response.headers()['content-type'] || 'missing';
                    pageScripts.push({
                        url: url,
                        contentType: contentType,
                        status: response.status(),
                        isCorrect: contentType.includes('application/javascript') || contentType.includes('text/javascript')
                    });
                }
            });

            // Navigate to page
            await page.goto(`http://localhost:8080/${pageUrl}`, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            // Wait for scripts to load
            await new Promise(resolve => setTimeout(resolve, 3000));

            pageMimeData.scripts = pageScripts;
            mimeData.pages[pageUrl] = pageMimeData;

            console.log(`   📄 ${pageScripts.length} scripts, ${pageScripts.filter(s => !s.isCorrect).length} wrong MIME types`);

        } catch (error) {
            console.log(`❌ FAILED to analyze ${pageUrl}: ${error.message}`);
            mimeData.pages[pageUrl] = {
                page: pageUrl,
                error: error.message,
                scripts: []
            };
        }

        // Small delay between pages
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Convert Set to Array for JSON serialization
    mimeData.summary.mime_types_found = Array.from(mimeData.summary.mime_types_found);

    // Save results
    const outputPath = path.join(__dirname, '..', 'documentation', '05-REPORTS', 'artifacts', '2026_01_04', 'comprehensive_mime_types_analysis.json');
    fs.writeFileSync(outputPath, JSON.stringify(mimeData, null, 2));

    console.log('\n📊 MIME TYPES ANALYSIS SUMMARY:');
    console.log(`📄 Total scripts analyzed: ${mimeData.summary.total_scripts}`);
    console.log(`✅ Correct MIME types: ${mimeData.summary.correct_mime}`);
    console.log(`❌ Wrong MIME types: ${mimeData.summary.wrong_mime}`);
    console.log(`📋 MIME types found: ${mimeData.summary.mime_types_found.join(', ')}`);
    console.log(`\n💾 Results saved to: ${outputPath}`);

    await browser.close();
}

analyzeMimeTypes().catch(console.error);
