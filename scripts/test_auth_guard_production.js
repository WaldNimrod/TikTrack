const puppeteer = require('puppeteer');

async function testAuthGuardProduction() {
  console.log('=== PRODUCTION AUTH GUARD QA - BROWSER TESTING ===');
  console.log('Testing auth guard implementation in clean browser state');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--incognito', '--disable-web-security', '--disable-features=VizDisplayCompositor']
  });

  const page = await browser.newPage();

  // Clear all storage
  await page.evaluateOnNewDocument(() => {
    localStorage.clear();
    sessionStorage.clear();
    // Clear cookies
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  });

  // Set up console logging
  page.on('console', msg => {
    console.log(`[BROWSER] ${msg.text()}`);
  });

  try {
    // Test 1: Access index page without authentication
    console.log('\n--- TEST 1: Index Page (/) - Clean State ---');
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle2' });

    const currentUrl1 = page.url();
    console.log(`Current URL: ${currentUrl1}`);

    const hasLoginModal = await page.$('.login-modal, #loginModal, [class*="login"], [id*="login"]');
    console.log(`Login modal present: ${!!hasLoginModal}`);

    const pageTitle1 = await page.title();
    console.log(`Page title: ${pageTitle1}`);

    // Check for TEST MODE messages
    const consoleMessages = [];
    page.on('console', msg => {
      consoleMessages.push(msg.text());
    });

    // Test 2: Access trades page
    console.log('\n--- TEST 2: Trades Page (/trades) - Clean State ---');
    await page.goto('http://localhost:8080/trades', { waitUntil: 'networkidle2' });

    const currentUrl2 = page.url();
    console.log(`Current URL: ${currentUrl2}`);

    const hasLoginModal2 = await page.$('.login-modal, #loginModal, [class*="login"], [id*="login"]');
    console.log(`Login modal present: ${!!hasLoginModal2}`);

    // Test 3: Access CRUD dashboard
    console.log('\n--- TEST 3: CRUD Dashboard (/crud_testing_dashboard) - Clean State ---');
    await page.goto('http://localhost:8080/crud_testing_dashboard', { waitUntil: 'networkidle2' });

    const currentUrl3 = page.url();
    console.log(`Current URL: ${currentUrl3}`);

    const hasLoginModal3 = await page.$('.login-modal, #loginModal, [class*="login"], [id*="login"]');
    console.log(`Login modal present: ${!!hasLoginModal3}`);

    // Test 4: Check for TEST MODE in console
    console.log('\n--- TEST 4: Console Analysis ---');
    const testModeMessages = consoleMessages.filter(msg => msg.includes('TEST MODE'));
    console.log(`TEST MODE messages found: ${testModeMessages.length}`);
    testModeMessages.forEach(msg => console.log(`  - ${msg}`));

    // Test 5: Check for JS errors
    console.log('\n--- TEST 5: JavaScript Errors ---');
    const jsErrors = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });

    // Wait a bit for errors to accumulate
    await page.waitForTimeout(2000);

    console.log(`JS errors detected: ${jsErrors.length}`);
    jsErrors.forEach(error => console.log(`  - ${error}`));

    // Test 6: Try to authenticate (if modal is shown)
    console.log('\n--- TEST 6: Authentication Attempt ---');

    const loginForm = await page.$('form[action*="login"], input[name="username"], input[name="password"]');
    if (loginForm) {
      console.log('Login form found - attempting authentication');

      // Try to find and fill login form
      const usernameField = await page.$('input[name="username"], input[type="text"], input[placeholder*="user"]');
      const passwordField = await page.$('input[name="password"], input[type="password"]');
      const submitButton = await page.$('button[type="submit"], input[type="submit"], [class*="login"], [id*="login"]');

      if (usernameField && passwordField) {
        await usernameField.type('admin');
        await passwordField.type('admin123');
        console.log('Credentials entered: admin/admin123');

        if (submitButton) {
          await submitButton.click();
          await page.waitForTimeout(3000);
          console.log('Login submitted, waiting for redirect...');

          const finalUrl = page.url();
          console.log(`Post-login URL: ${finalUrl}`);

          // Check if we can access protected pages now
          await page.goto('http://localhost:8080/trades', { waitUntil: 'networkidle2' });
          const tradesUrl = page.url();
          console.log(`Trades page access: ${tradesUrl}`);

          const tradesContent = await page.$('[class*="trade"], [id*="trade"], table, .dashboard');
          console.log(`Trades content loaded: ${!!tradesContent}`);
        } else {
          console.log('Submit button not found');
        }
      } else {
        console.log('Username/password fields not found');
      }
    } else {
      console.log('No login form detected');
    }

    console.log('\n=== QA RESULTS SUMMARY ===');
    console.log(`Index page shows login: ${currentUrl1.includes('login') || !!hasLoginModal}`);
    console.log(`Trades page shows login: ${currentUrl2.includes('login') || !!hasLoginModal2}`);
    console.log(`CRUD page shows login: ${currentUrl3.includes('login') || !!hasLoginModal3}`);
    console.log(`TEST MODE bypassed: ${testModeMessages.length === 0}`);
    console.log(`JS errors present: ${jsErrors.length > 0}`);
    console.log(`Authentication possible: ${!!loginForm}`);

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testAuthGuardProduction().catch(console.error);
