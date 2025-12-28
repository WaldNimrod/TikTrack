// Manual CRUD test runner
const puppeteer = require('puppeteer');

async function runManualCRUDTest() {
    console.log('🚀 Running Manual CRUD Test with Instrumentation');

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Login first
        console.log('🔐 Logging in...');
        await page.goto('http://localhost:8080/trading-ui/login.html');
        await new Promise(resolve => setTimeout(resolve, 2000));

        await page.type('#username', 'admin');
        await page.type('#password', 'admin123');
        await page.click('button[type="submit"]');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Go to CRUD dashboard
        console.log('📊 Opening CRUD dashboard...');
        await page.goto('http://localhost:8080/trading-ui/crud_testing_dashboard.html');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Run a specific test
        console.log('🔄 Running trades CRUD test...');
        const result = await page.evaluate(async () => {
            if (window.crudTester && window.crudTester.runGenericCRUDTest) {
                try {
                    const testResult = await window.crudTester.runGenericCRUDTest('trades', {
                        name: 'Trades',
                        url: 'trades.html',
                        hasCRUD: true,
                        type: 'user'
                    });
                    return { success: true, message: 'Test completed' };
                } catch (error) {
                    return { success: false, error: error.message };
                }
            } else {
                return { success: false, error: 'CRUD tester not available' };
            }
        });

        console.log('📊 Test result:', result);

        // Wait a bit for logs to be written
        await new Promise(resolve => setTimeout(resolve, 2000));

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

runManualCRUDTest().catch(console.error);
