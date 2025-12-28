// Simple CRUD test runner for TikTrack
const puppeteer = require('puppeteer');

async function runSimpleCRUDTest() {
    console.log('🚀 Starting Simple CRUD Test');

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // First login
        await page.goto('http://localhost:8080/trading-ui/login.html');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Fill login form
        await page.type('#username', 'admin');
        await page.type('#password', 'admin123');
        await page.click('button[type="submit"]');

        // Wait for login and redirect
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Now go to the CRUD dashboard
        await page.goto('http://localhost:8080/trading-ui/crud_testing_dashboard.html');

        // Wait for page to load and initialize
        await new Promise(resolve => setTimeout(resolve, 10000));

        // Check if the dashboard loaded
        const title = await page.title();
        console.log('📄 Page title:', title);

        // Try to initialize the dashboard if not already done
        await page.evaluate(() => {
            if (window.initializeCRUDTestingDashboard && !window.CRUDTestingDashboard) {
                console.log('🔄 Initializing CRUD Testing Dashboard...');
                window.initializeCRUDTestingDashboard();
            }
        });

        // Wait a bit for initialization
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Try to run a simple test
        const result = await page.evaluate(() => {
            console.log('🔍 Checking for crudTester...');

            if (window.crudTester) {
                console.log('✅ crudTester found');
                // Check if the tester has the methods we need
                return {
                    hasTester: true,
                    hasRunE2ETests: typeof window.crudTester.runE2ETests === 'function',
                    hasRunGenericCRUDTest: typeof window.crudTester.runGenericCRUDTest === 'function',
                    hasGetEntityFieldMaps: typeof window.crudTester.getEntityFieldMaps === 'function',
                    testerType: window.crudTester.constructor.name
                };
            } else {
                console.log('❌ crudTester not found after initialization');
                return {
                    hasTester: false,
                    initialized: !!window.initializeCRUDTestingDashboard,
                    availableCRUD: Object.keys(window).filter(k => k.includes('crud') || k.includes('CRUD'))
                };
            }
        });

        console.log('🔍 Test result:', result);

        if (result.hasTester && result.hasRunGenericCRUDTest) {
            console.log('✅ Dashboard loaded successfully with required methods');

            // Try to run a simple CRUD test for trades
            console.log('🔄 Running simple CRUD test for trades...');

            try {
                const testResult = await page.evaluate(async () => {
                    // Run a simple test for trades
                    const result = await window.crudTester.runGenericCRUDTest('trades', {
                        name: 'Trades',
                        url: 'trades.html',
                        hasCRUD: true,
                        type: 'user'
                    });

                    return {
                        testStarted: true,
                        result: 'Test completed - check console for details'
                    };
                });

                console.log('🔍 Test execution result:', testResult);

            } catch (testError) {
                console.error('❌ Test execution failed:', testError.message);
            }

        } else {
            console.log('❌ Dashboard missing required components');
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

runSimpleCRUDTest().catch(console.error);
