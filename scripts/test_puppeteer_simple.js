const puppeteer = require('puppeteer');

async function testSimple() {
    console.log('Testing simple Puppeteer...');
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.goto('http://localhost:8080/login');
    console.log('Page loaded successfully');
    
    const title = await page.title();
    console.log('Page title:', title);
    
    await browser.close();
    console.log('Test completed');
}

testSimple().catch(console.error);
