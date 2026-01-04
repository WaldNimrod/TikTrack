const puppeteer = require('puppeteer');

async function debugApiConfig() {
    console.log('Debugging API config loading...');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    try {
        console.log('Loading /login page...');
        await page.goto('http://localhost:8080/login', { waitUntil: 'networkidle2', timeout: 30000 });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check if api-config.js is loaded
        const apiConfigLoaded = await page.evaluate(() => {
            const scripts = Array.from(document.querySelectorAll('script[src]'));
            return scripts.some(script => script.src.includes('api-config.js'));
        });
        
        console.log('api-config.js loaded:', apiConfigLoaded);
        
        // Check API_BASE_URL value
        const apiBaseUrlValue = await page.evaluate(() => {
            return {
                exists: typeof window.API_BASE_URL !== 'undefined',
                value: window.API_BASE_URL,
                type: typeof window.API_BASE_URL
            };
        });
        
        console.log('API_BASE_URL status:', apiBaseUrlValue);
        
        // Check if the script executed
        const scriptExecuted = await page.evaluate(() => {
            // Check if the script actually ran by looking for its effect
            return window.API_BASE_URL === ''; // Should be empty string if executed
        });
        
        console.log('Script executed (API_BASE_URL is empty string):', scriptExecuted);
        
        // Check network requests for api-config.js
        const requests = [];
        page.on('request', req => {
            if (req.url().includes('api-config.js')) {
                requests.push({
                    url: req.url(),
                    method: req.method(),
                    headers: req.headers()
                });
            }
        });
        
        // Reload to capture network
        console.log('Reloading to capture network...');
        await page.reload({ waitUntil: 'networkidle2' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('Network requests for api-config.js:', requests.length);
        if (requests.length > 0) {
            console.log('Request details:', requests[0]);
        }
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    await browser.close();
}

debugApiConfig().catch(console.error);
