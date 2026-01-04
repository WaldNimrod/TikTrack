const puppeteer = require('puppeteer');

async function testSinglePage() {
    console.log('Testing single page with authentication...');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    let authToken;

    // Intercept requests
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        const headers = { ...request.headers() };
        if (authToken && request.url().includes('/api/') && !request.url().includes('/api/auth/login')) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        request.continue({ headers });
    });

    try {
        // Load login page
        console.log('Loading login page...');
        await page.goto('http://localhost:8080/login', { waitUntil: 'networkidle2', timeout: 30000 });

        // Authenticate
        console.log('Authenticating...');
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
            console.log('✅ Auth successful');

            // Set auth data
            await page.evaluate((token, user) => {
                localStorage.setItem('authToken', token);
                localStorage.setItem('currentUser', JSON.stringify(user));
                sessionStorage.setItem('authToken', token);
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                sessionStorage.setItem('dev_authToken', token);
                sessionStorage.setItem('dev_currentUser', JSON.stringify(user));
            }, authToken, loginResponse.data.user);

            // Test single page
            console.log('Testing /trades...');
            await page.goto('http://localhost:8080/trades', { waitUntil: 'networkidle2', timeout: 30000 });

            // Re-set auth data after navigation
            await page.evaluate((token, user) => {
                localStorage.setItem('authToken', token);
                localStorage.setItem('currentUser', JSON.stringify(user));
                sessionStorage.setItem('authToken', token);
                sessionStorage.setItem('currentUser', JSON.stringify(user));
                sessionStorage.setItem('dev_authToken', token);
                sessionStorage.setItem('dev_currentUser', JSON.stringify(user));
            }, authToken, loginResponse.data.user);

            await new Promise(resolve => setTimeout(resolve, 5000));

            // Check globals again after more time
            const globalsAfterWait = await page.evaluate(() => ({
                apiBaseUrl: !!window.API_BASE_URL,
                logger: !!window.Logger,
                modalManager: !!window.ModalManagerV2,
                initializer: !!window.UnifiedAppInitializer,
                auth: !!window.TikTrackAuth,
                apiBaseUrlValue: window.API_BASE_URL || 'undefined'
            }));

            console.log('Globals check after 5s:', globalsAfterWait);

            // Check what scripts are loaded
            const scripts = await page.$$eval('script[src]', scripts => scripts.map(s => s.src));
            console.log('Scripts loaded:', scripts.length);
            console.log('API config script loaded:', scripts.some(s => s.includes('api-config')));
            const globals = await page.evaluate(() => ({
                apiBaseUrl: !!window.API_BASE_URL,
                logger: !!window.Logger,
                modalManager: !!window.ModalManagerV2,
                initializer: !!window.UnifiedAppInitializer,
                auth: !!window.TikTrackAuth
            }));

            console.log('Globals check:', globals);

            const scriptCount = await page.$$eval('script[src]', scripts => scripts.length);
            console.log('Scripts loaded:', scriptCount);

            console.log('✅ Test completed successfully');
        } else {
            console.log('❌ Auth failed:', loginResponse);
        }

    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    await browser.close();
}

testSinglePage().catch(console.error);
