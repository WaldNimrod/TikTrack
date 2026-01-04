const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Analyze which test pages require authentication (401 errors)
const TEST_PAGES = [
    'watch_list',
    'defer_test', 
    'test_script_loading',
    'test_phase1_recovery',
    'test_bootstrap_popover_comparison',
    'test_overlay_debug',
    'test_recent_items_widget',
    'test_phase3_1_comprehensive',
    'test_unified_widget_comprehensive',
    'test_user_ticker_integration',
    'test_ticker_widgets_performance',
    'test_frontend_wrappers',
    'test_unified_widget',
    'test_unified_widget_integration',
    'test_nested_modal_rich_text',
    'button_color_mapping_simple',
    'tradingview_widgets_showcase',
    'test_header_only',
    'conditions_test',
    'mockups/flag_quick_action',
    'mockups/watch_lists_page',
    'mockups/add_ticker_modal',
    'mockups/watch_list_modal',
    'test_monitoring',
    'test_quill',
    'test_cash_flow',
    'test_sorting',
    'test_modal_loop',
    'test_modal_stability',
    'test_runtime',
    'test_auth_console'
];

async function analyzeTestPagesAuth() {
    console.log('🔐 Analyzing test pages authentication requirements...');
    console.log(`📊 Testing ${TEST_PAGES.length} test pages`);
    console.log('=' * 70);

    const results = {
        timestamp: new Date().toISOString(),
        testPages: TEST_PAGES,
        analysis: [],
        summary: {
            total_pages: TEST_PAGES.length,
            require_auth: 0,
            no_auth_required: 0,
            navigation_errors: 0,
            auth_required_pages: [],
            working_without_auth: []
        }
    };

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });

    for (let i = 0; i < TEST_PAGES.length; i++) {
        const pageUrl = TEST_PAGES[i];
        console.log(`🔍 [${i + 1}/${TEST_PAGES.length}] Testing: ${pageUrl}`);

        const pageAnalysis = {
            page: pageUrl,
            requires_auth: false,
            status: 'unknown',
            auth_indicators: [],
            errors: []
        };

        try {
            const page = await browser.newPage();

            // Track 401 responses
            let has401Error = false;
            let authErrors = [];

            page.on('response', (response) => {
                if (response.status() === 401) {
                    has401Error = true;
                    authErrors.push({
                        url: response.url(),
                        status: response.status(),
                        headers: response.headers()
                    });
                }
            });

            // Track console errors
            page.on('console', msg => {
                if (msg.type() === 'error') {
                    const text = msg.text();
                    if (text.includes('401') || text.includes('UNAUTHORIZED') || text.includes('authentication')) {
                        pageAnalysis.auth_indicators.push(text);
                    }
                    pageAnalysis.errors.push(text);
                }
            });

            // Try to load page without authentication
            await page.goto(`http://localhost:8080/${pageUrl}`, {
                waitUntil: 'networkidle2',
                timeout: 30000
            });

            // Wait for potential auth checks
            await new Promise(resolve => setTimeout(resolve, 3000));

            // Check if page shows auth-related content or redirects
            const pageContent = await page.evaluate(() => {
                const bodyText = document.body.innerText.toLowerCase();
                const title = document.title.toLowerCase();

                return {
                    hasLoginForm: !!document.querySelector('#loginForm, .login-form, [name="username"], [name="password"]'),
                    hasAuthRedirect: bodyText.includes('login') || bodyText.includes('התחבר') || title.includes('login'),
                    url: window.location.href,
                    title: document.title
                };
            });

            // Determine if page requires auth
            if (has401Error || pageContent.hasLoginForm || pageContent.hasAuthRedirect || pageAnalysis.auth_indicators.length > 0) {
                pageAnalysis.requires_auth = true;
                pageAnalysis.status = 'REQUIRES_AUTH';
                results.summary.require_auth++;
                results.summary.auth_required_pages.push(pageUrl);
            } else {
                pageAnalysis.requires_auth = false;
                pageAnalysis.status = 'WORKS_WITHOUT_AUTH';
                results.summary.no_auth_required++;
                results.summary.working_without_auth.push(pageUrl);
            }

            pageAnalysis.auth_errors = authErrors;
            pageAnalysis.page_content = pageContent;

            console.log(`   📄 Status: ${pageAnalysis.status}, 401 errors: ${has401Error}, Auth indicators: ${pageAnalysis.auth_indicators.length}`);

            await page.close();

        } catch (error) {
            console.log(`❌ FAILED: ${error.message}`);
            pageAnalysis.status = 'NAVIGATION_ERROR';
            pageAnalysis.error = error.message;
            results.summary.navigation_errors++;
        }

        results.analysis.push(pageAnalysis);

        // Small delay between pages
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Save results
    const outputPath = path.join(__dirname, '..', 'documentation', '05-REPORTS', 'artifacts', '2026_01_04', 'test_pages_auth_analysis.json');
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

    console.log('\n📊 TEST PAGES AUTH ANALYSIS SUMMARY:');
    console.log(`📄 Total test pages: ${results.summary.total_pages}`);
    console.log(`🔐 Require authentication: ${results.summary.require_auth}`);
    console.log(`✅ Work without auth: ${results.summary.no_auth_required}`);
    console.log(`🌐 Navigation errors: ${results.summary.navigation_errors}`);
    console.log(`\n📋 Auth required pages: ${results.summary.auth_required_pages.join(', ')}`);
    console.log(`\n💾 Results saved to: ${outputPath}`);

    await browser.close();
}

analyzeTestPagesAuth().catch(console.error);
