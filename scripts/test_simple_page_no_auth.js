const puppeteer = require('puppeteer');

async function testSimplePage() {
    console.log('Testing simple page without authentication...');
    
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    try {
        // Test /login page (should work without auth)
        console.log('Testing /login page...');
        await page.goto('http://localhost:8080/login', { waitUntil: 'networkidle2', timeout: 30000 });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check for console errors
        let errors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                errors.push(msg.text());
            }
        });
        
        // Check globals
        const globals = await page.evaluate(() => ({
            apiBaseUrl: !!window.API_BASE_URL,
            logger: !!window.Logger,
            modalManager: !!window.ModalManagerV2,
            initializer: !!window.UnifiedAppInitializer,
            auth: !!window.TikTrackAuth
        }));
        
        console.log('Globals on /login:', globals);
        console.log('Console errors:', errors.length);
        
        if (errors.length > 0) {
            console.log('First few errors:');
            errors.slice(0, 3).forEach((err, i) => console.log(`  ${i+1}: ${err}`));
        }
        
        console.log('✅ Test completed');
        
    } catch (error) {
        console.log('❌ Error:', error.message);
    }

    await browser.close();
}

testSimplePage().catch(console.error);
