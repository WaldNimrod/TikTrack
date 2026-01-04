const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Only public pages that don't require authentication
const PUBLIC_PAGES = [
    '/login',
    '/register', 
    '/forgot_password',
    '/reset_password'
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
        // Navigate to page with timeout
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

async function runPublicPagesMonitoring() {
    console.log('🚀 Starting PUBLIC PAGES init/loading monitoring...');
    console.log(`📊 Testing ${PUBLIC_PAGES.length} public pages (no auth required)`);
    console.log('=' * 70);

    const allResults = {
        timestamp: new Date().toISOString(),
        total_pages: PUBLIC_PAGES.length,
        summary: {
            ok: 0,
            critical: 0,
            no_scripts: 0,
            navigation_error: 0
        },
        results: [],
        note: 'These are public pages that do not require authentication. All other pages require login and cannot be tested without authentication.'
    };

    for (let i = 0; i < PUBLIC_PAGES.length; i++) {
        const pageUrl = PUBLIC_PAGES[i];
        console.log(`🔍 [${i + 1}/${PUBLIC_PAGES.length}] Testing: ${pageUrl}`);
        
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
    const outputPath = path.join(__dirname, '..', 'documentation', '05-REPORTS', 'artifacts', '2026_01_04', 'public_pages_monitoring_results.json');
    fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2));
    
    console.log('\n📊 PUBLIC PAGES SUMMARY:');
    console.log(`✅ OK: ${allResults.summary.ok}/${PUBLIC_PAGES.length}`);
    console.log(`❌ CRITICAL: ${allResults.summary.critical}/${PUBLIC_PAGES.length}`);
    console.log(`🚫 NO SCRIPTS: ${allResults.summary.no_scripts}/${PUBLIC_PAGES.length}`);
    console.log(`🌐 NAVIGATION ERROR: ${allResults.summary.navigation_error}/${PUBLIC_PAGES.length}`);
    console.log(`\n⚠️  NOTE: Only public pages tested. All other pages require authentication.`);
    console.log(`\n💾 Results saved to: ${outputPath}`);
}

// Run the monitoring
runPublicPagesMonitoring().catch(console.error);
