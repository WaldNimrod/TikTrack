const puppeteer = require('puppeteer');
const fs = require('fs');

const DASHBOARD_URL = 'http://localhost:8080/crud_testing_dashboard';
const LOG_PATH = '/Users/nimrod/Documents/TikTrack/TikTrackApp/.cursor/debug.log';

async function logToFile(message, data = {}) {
    const logEntry = JSON.stringify({
        sessionId: 'dashboard-debug',
        runId: 'debug-session',
        hypothesisId: 'dashboard-loading',
        location: 'debug_dashboard_loading.js',
        message,
        data,
        timestamp: Date.now()
    });

    fs.appendFileSync(LOG_PATH, logEntry + '\n');
}

async function debugDashboardLoading() {
    console.log('🔍 Debugging Dashboard Loading...');
    console.log('📍 URL:', DASHBOARD_URL);

    // Clear previous logs
    try {
        if (fs.existsSync(LOG_PATH)) {
            fs.unlinkSync(LOG_PATH);
            console.log('🧹 Cleared previous logs');
        }
    } catch (e) {
        console.log('⚠️ Could not clear logs:', e.message);
    }

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: undefined, // Use default Firefox/Chrome
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    try {
        // Enable detailed logging
        page.on('console', msg => {
            console.log(`🔍 Console:`, msg.text());
            logToFile('console_message', { level: msg.type(), message: msg.text() });
        });

        page.on('response', response => {
            const url = response.url();
            if (url.includes('crud_testing_dashboard.js') ||
                url.includes('crud-testing-enhanced.js') ||
                url.includes('unified-crud-service.js')) {
                console.log(`📦 Network: ${response.status()} - ${url}`);
                logToFile('network_response', {
                    url,
                    status: response.status(),
                    contentType: response.headers()['content-type']
                });
            }
        });

        console.log('🌐 Navigating to dashboard...');
        logToFile('navigation_start', { url: DASHBOARD_URL });

        // Navigate to dashboard
        await page.goto(DASHBOARD_URL, { waitUntil: 'networkidle0' });
        logToFile('navigation_complete', { url: DASHBOARD_URL });

        // Check if we need to login
        const currentUrl = page.url();
        const pageTitle = await page.title();
        console.log('📍 Current URL:', currentUrl);
        console.log('📄 Page Title:', pageTitle);

        const hasLoginForm = await page.$('#username') !== null;
        console.log('🔐 Login form found:', hasLoginForm);

        if (hasLoginForm || currentUrl.includes('login') || pageTitle.includes('התחברות')) {
            console.log('🔐 Performing login...');

            if (await page.$('#username')) {
                await page.type('#username', 'admin');
                await page.type('#password', 'admin123');
                await page.click('button[type="submit"]');

                try {
                    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 10000 });
                    console.log('✅ Login successful');
                } catch (navError) {
                    console.log('⚠️ No navigation after login, checking if still on login page...');
                    const stillHasLogin = await page.$('#username') !== null;
                    if (stillHasLogin) {
                        throw new Error('Login failed - still on login page');
                    }
                }
            }
        } else {
            console.log('✅ Already logged in or no login required');
        }

        // Perform hard refresh simulation
        console.log('🔄 Performing hard refresh...');
        await page.reload({ waitUntil: 'networkidle0' });

        // Wait for page to fully load
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Check final URL and title
        const finalUrl = page.url();
        const finalTitle = await page.title();
        console.log('📍 Final URL:', finalUrl);
        console.log('📄 Final Title:', finalTitle);

        // Run Console commands
        console.log('\n🔬 Running Console checks...');

        const runIntegratedTests = await page.evaluate(() => {
            try {
                return typeof window.runIntegratedTests;
            } catch (e) {
                return 'error: ' + e.message;
            }
        });
        console.log('📊 typeof window.runIntegratedTests:', runIntegratedTests);

        const initializeCRUDTestingDashboard = await page.evaluate(() => {
            try {
                return typeof window.initializeCRUDTestingDashboard;
            } catch (e) {
                return 'error: ' + e.message;
            }
        });
        console.log('📊 typeof window.initializeCRUDTestingDashboard:', initializeCRUDTestingDashboard);

        const testCardCount = await page.evaluate(() => {
            try {
                return document.querySelectorAll('.test-card').length;
            } catch (e) {
                return 'error: ' + e.message;
            }
        });
        console.log('📊 document.querySelectorAll(\'.test-card\').length:', testCardCount);

        // Additional checks
        const testEntityCardCount = await page.evaluate(() => {
            try {
                return document.querySelectorAll('.test-entity-card').length;
            } catch (e) {
                return 'error: ' + e.message;
            }
        });
        console.log('📊 document.querySelectorAll(\'.test-entity-card\').length:', testEntityCardCount);

        const individualTestCards = await page.evaluate(() => {
            try {
                return document.querySelectorAll('.individual-test-cards').length;
            } catch (e) {
                return 'error: ' + e.message;
            }
        });
        console.log('📊 document.querySelectorAll(\'.individual-test-cards\').length:', individualTestCards);

        // Check for test functions
        const testFunctions = await page.evaluate(() => {
            const functions = {};
            ['runTradeTestOnly', 'runTradePlanTestOnly', 'runExecutionTestOnly', 'runAlertTestOnly', 'runTickerTestOnly'].forEach(func => {
                try {
                    functions[func] = typeof window[func];
                } catch (e) {
                    functions[func] = 'error';
                }
            });
            return functions;
        });
        console.log('🔧 Test functions status:', testFunctions);

        // Get page content summary
        const pageSummary = await page.evaluate(() => {
            return {
                totalElements: document.querySelectorAll('*').length,
                visibleElements: Array.from(document.querySelectorAll('*')).filter(el => {
                    const rect = el.getBoundingClientRect();
                    return rect.width > 0 && rect.height > 0;
                }).length,
                testCards: !!document.querySelector('.individual-test-cards'),
                anyTestCards: !!document.querySelector('.test-entity-card'),
                anyCards: !!document.querySelector('.test-card'),
                crudTestingContainer: !!document.querySelector('#crudTestingContainer'),
                bodyClasses: document.body ? document.body.className : 'no body',
                firstFewElements: Array.from(document.querySelectorAll('*')).slice(0, 10).map(el => ({
                    tag: el.tagName,
                    id: el.id,
                    class: el.className ? el.className.split(' ').slice(0, 3).join(' ') : '',
                    text: el.textContent.slice(0, 30)
                }))
            };
        });

        console.log('\n📊 Page Summary:');
        console.log(JSON.stringify(pageSummary, null, 2));

        // Log results
        const results = {
            url: finalUrl,
            title: finalTitle,
            runIntegratedTests,
            initializeCRUDTestingDashboard,
            testCardCount,
            testEntityCardCount,
            individualTestCards,
            testFunctions,
            pageSummary
        };

        logToFile('debug_results', results);

        // Save results to file
        const resultsFile = 'dashboard_debug_results.json';
        fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
        console.log('\n💾 Results saved to:', resultsFile);

        // Final status
        const success = testCardCount > 0 && runIntegratedTests === 'function';
        console.log('\n🎯 FINAL STATUS:', success ? '✅ SUCCESS' : '❌ FAILED');

        if (!success) {
            console.log('❌ Issues found:');
            if (testCardCount === 0) console.log('  - No test cards found');
            if (runIntegratedTests !== 'function') console.log('  - runIntegratedTests not available');
        }

    } catch (error) {
        console.error('❌ Error during debug:', error.message);
        logToFile('debug_error', { error: error.message, stack: error.stack });
    } finally {
        await browser.close();
    }
}

if (require.main === module) {
    debugDashboardLoading().catch(console.error);
}