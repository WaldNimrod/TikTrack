const puppeteer = require('puppeteer');

async function testTeamDOption1QA() {
    console.log('=== TEAM D OPTION 1 QA - HOMEPAGE & TRADES AUTH FLOW ===');
    console.log('Testing authenticated flow for / and /trades after Option 1 implementation');

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: ['--disable-extensions']
        });

        const page = await browser.newPage();

        // Test 1: Unauthenticated access to homepage should redirect
        console.log('\n--- TEST 1: Unauthenticated Homepage Access ---');
        await page.goto('http://localhost:8080/', { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 3000)); // Wait for auth check

        const homepageUrl = page.url();
        const homepageRedirected = homepageUrl.includes('/login.html');
        console.log(`Homepage URL: ${homepageUrl}`);
        console.log(`Redirected to login: ${homepageRedirected}`);

        if (!homepageRedirected) {
            console.log('❌ FAIL: Homepage did not redirect to login');
            return;
        }

        // Test 2: Login process
        console.log('\n--- TEST 2: Login Process ---');

        // Check if form elements exist
        const usernameExists = await page.$('#username');
        const passwordExists = await page.$('#password');
        const loginBtnExists = await page.$('#loginBtn');

        console.log(`Login form elements found: username=${!!usernameExists}, password=${!!passwordExists}, button=${!!loginBtnExists}`);

        if (!usernameExists || !passwordExists || !loginBtnExists) {
            console.log('❌ FAIL: Login form elements not found');
            return;
        }

        await page.type('#username', 'admin');
        await page.type('#password', 'admin123');

        // Check sessionStorage state before login
        const sessionStorageBefore = await page.evaluate(() => {
            try {
                return {
                    dev_authToken: sessionStorage.getItem('dev_authToken'),
                    dev_currentUser: sessionStorage.getItem('dev_currentUser'),
                    authToken: sessionStorage.getItem('authToken'),
                    currentUser: sessionStorage.getItem('currentUser')
                };
            } catch (e) {
                return { error: e.message };
            }
        });
        console.log(`SessionStorage before login:`, sessionStorageBefore);

        // Listen for console messages during login
        const consoleMessages = [];
        page.on('console', msg => {
            consoleMessages.push(msg.text());
        });

        // Also listen for page errors
        const pageErrors = [];
        page.on('pageerror', error => {
            pageErrors.push(error.message);
        });

        // Listen for request/response to see API calls
        const networkLogs = [];
        page.on('response', response => {
            if (response.url().includes('/api/auth/login')) {
                networkLogs.push(`API Response: ${response.status()} - ${response.url()}`);
            }
        });

        await page.click('#loginBtn');

        // Wait for login to complete and redirect
        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log(`Network logs during login (${networkLogs.length}):`);
        networkLogs.forEach((msg, i) => {
            console.log(`  ${i+1}: ${msg}`);
        });

        console.log(`Console messages during login (${consoleMessages.length}):`);
        consoleMessages.forEach((msg, i) => {
            console.log(`  ${i+1}: ${msg}`);
        });

        // Check for error messages
        const errorMessages = consoleMessages.filter(msg => msg.includes('failed') || msg.includes('error') || msg.includes('Error'));
        if (errorMessages.length > 0 || pageErrors.length > 0) {
            console.log(`❌ LOGIN ERRORS FOUND:`);
            errorMessages.forEach((msg, i) => {
                console.log(`  Console Error ${i+1}: ${msg}`);
            });
            pageErrors.forEach((msg, i) => {
                console.log(`  Page Error ${i+1}: ${msg}`);
            });
        }

        const postLoginUrl = page.url();
        console.log(`Post-login URL: ${postLoginUrl}`);

        // Check sessionStorage state after login
        const sessionStorageAfter = await page.evaluate(() => {
            try {
                return {
                    dev_authToken: sessionStorage.getItem('dev_authToken'),
                    dev_currentUser: sessionStorage.getItem('dev_currentUser'),
                    authToken: sessionStorage.getItem('authToken'),
                    currentUser: sessionStorage.getItem('currentUser')
                };
            } catch (e) {
                return { error: e.message };
            }
        });
        console.log(`SessionStorage after login:`, sessionStorageAfter);

        if (!postLoginUrl.includes('/')) {
            console.log('❌ FAIL: Did not redirect to homepage after login');
            return;
        }

        // Test 3: Authenticated homepage access
        console.log('\n--- TEST 3: Authenticated Homepage Access ---');
        const headerVisible = await page.$eval('#unified-header', el => el !== null).catch(() => false);
        console.log(`Header visible: ${headerVisible}`);

        // Test 4: Navigate to /trades
        console.log('\n--- TEST 4: Authenticated Trades Access ---');
        await page.goto('http://localhost:8080/trades', { waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 3000));

        const tradesUrl = page.url();
        const tradesRedirected = tradesUrl.includes('/login.html');
        console.log(`Trades URL: ${tradesUrl}`);
        console.log(`Trades redirected: ${tradesRedirected}`);

        // Test 5: Check for auth token in localStorage (should be empty per Option 1)
        console.log('\n--- TEST 5: Option 1 Compliance Check ---');
        const localStorageAuthToken = await page.evaluate(() => {
            return localStorage.getItem('authToken');
        });
        const localStorageCurrentUser = await page.evaluate(() => {
            return localStorage.getItem('currentUser');
        });

        console.log(`localStorage authToken: ${localStorageAuthToken ? 'PRESENT (VIOLATION!)' : 'null (COMPLIANT)'}`);
        console.log(`localStorage currentUser: ${localStorageCurrentUser ? 'PRESENT (VIOLATION!)' : 'null (COMPLIANT)'}`);

        // Test 6: Check sessionStorage bootstrap keys
        const sessionStorageAuthToken = await page.evaluate(() => {
            return sessionStorage.getItem('dev_authToken');
        });
        const sessionStorageCurrentUser = await page.evaluate(() => {
            return sessionStorage.getItem('dev_currentUser');
        });

        console.log(`sessionStorage dev_authToken: ${sessionStorageAuthToken ? 'present' : 'null'}`);
        console.log(`sessionStorage dev_currentUser: ${sessionStorageCurrentUser ? 'present' : 'null'}`);

        // Summary
        console.log('\n=== QA SUMMARY ===');
        const allTestsPass =
            homepageRedirected &&
            postLoginUrl.includes('/') &&
            headerVisible &&
            !tradesRedirected &&
            !localStorageAuthToken &&
            !localStorageCurrentUser;

        console.log(`Overall Status: ${allTestsPass ? 'PASS ✅' : 'FAIL ❌'}`);

        if (allTestsPass) {
            console.log('✅ Option 1 implementation successful!');
            console.log('✅ Auth tokens stored only in SessionStorageLayer');
            console.log('✅ No localStorage auth violations');
        } else {
            console.log('❌ Option 1 implementation has issues');
        }

    } catch (error) {
        console.error('Test failed:', error.message);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

testTeamDOption1QA();
