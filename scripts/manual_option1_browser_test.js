const puppeteer = require('puppeteer');

async function runManualBrowserTest() {
  console.log('🚀 Starting Option 1 Browser Test (Interactive Mode)');
  console.log('📋 Test Steps:');
  console.log('1. Browser will open with login page');
  console.log('2. Check console for auth.js logs');
  console.log('3. Manually enter credentials: admin / admin123');
  console.log('4. Verify redirect to homepage');
  console.log('5. Check that header is visible');
  console.log('6. Navigate to /trades and verify access');
  console.log('7. Press Enter in terminal when done');

  const browser = await puppeteer.launch({
    headless: false, // Show browser window
    defaultViewport: { width: 1200, height: 800 },
    args: ['--disable-extensions']
  });

  const page = await browser.newPage();

  // Listen for console messages
  page.on('console', msg => {
    console.log(`🌐 BROWSER CONSOLE: ${msg.text()}`);
  });

  // Listen for page errors
  page.on('pageerror', error => {
    console.log(`🚨 BROWSER ERROR: ${error.message}`);
  });

  try {
    console.log('📄 Opening login page...');
    await page.goto('http://localhost:8080/login.html', { waitUntil: 'networkidle2' });

    console.log('✅ Login page loaded');
    console.log('🔍 Check browser console for auth.js logs...');
    console.log('👤 Enter credentials manually: admin / admin123');
    console.log('⏳ Waiting for manual interaction...');

    // Wait for user input
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', async (key) => {
      // Enter key
      if (key[0] === 13) {
        console.log('📊 Gathering final results...');

        // Check current state
        const currentUrl = page.url();
        const headerVisible = await page.$('#unified-header') !== null;
        const modals = await page.$$eval('.modal.show', elements => elements.length);

        console.log('📋 Final Test Results:');
        console.log(`   Current URL: ${currentUrl}`);
        console.log(`   Header visible: ${headerVisible ? '✅' : '❌'}`);
        console.log(`   Modals found: ${modals}`);
        console.log(`   Auth flow: ${currentUrl.includes('/') && !currentUrl.includes('/login') ? '✅ SUCCESS' : '❌ FAILED'}`);

        await browser.close();
        process.exit(0);
      }
    });

  } catch (error) {
    console.error('❌ Browser test failed:', error);
    await browser.close();
    process.exit(1);
  }
}

runManualBrowserTest().catch(console.error);
