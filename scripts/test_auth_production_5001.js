const puppeteer = require('puppeteer');

async function testAuthProduction5001() {
  console.log('=== PRODUCTION AUTH QA - PORT 5001 ===');
  console.log('Testing auth enforcement in production-like environment');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--incognito', '--disable-web-security', '--disable-features=VizDisplayCompositor']
  });

  const page = await browser.newPage();

  try {
    // Test 1: Access index page without authentication (should redirect to /login.html)
    console.log('\n--- TEST 1: Index Page (/) - Unauthenticated ---');
    await page.goto('http://localhost:5001/', { waitUntil: 'networkidle2' });

    const currentUrl1 = page.url();
    console.log(`Current URL: ${currentUrl1}`);
    console.log(`Redirected to login: ${currentUrl1.includes('/login.html')}`);

    const hasLoginModal = await page.$('.login-modal, #loginModal, [class*="login"], [id*="login"]');
    console.log(`Login modal present: ${!!hasLoginModal}`);

    // Test 2: Check for TEST MODE messages (should be NONE in production)
    const testModeMessages = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('TEST MODE')) {
        testModeMessages.push(text);
      }
    });

    console.log('\n--- TEST 2: Console Analysis ---');
    console.log(`TEST MODE messages found: ${testModeMessages.length}`);
    if (testModeMessages.length > 0) {
      testModeMessages.forEach(msg => console.log(`  ❌ ${msg}`));
    } else {
      console.log('  ✅ No TEST MODE messages (good for production)');
    }

    // Test 3: Access trades page (should also redirect)
    console.log('\n--- TEST 3: Trades Page (/trades) - Unauthenticated ---');
    await page.goto('http://localhost:5001/trades', { waitUntil: 'networkidle2' });

    const currentUrl3 = page.url();
    console.log(`Current URL: ${currentUrl3}`);
    console.log(`Redirected to login: ${currentUrl3.includes('/login.html')}`);

    // Test 4: Try to login (if redirected to login page)
    console.log('\n--- TEST 4: Login Attempt ---');

    if (currentUrl3.includes('/login.html')) {
      console.log('On login page - attempting authentication');

      // Wait for login form to load
      await page.waitForTimeout(2000);

      // Try to find and fill login form
      const usernameField = await page.$('input[name="username"], input[type="text"], input[placeholder*="user"]');
      const passwordField = await page.$('input[name="password"], input[type="password"]');
      const submitButton = await page.$('button[type="submit"], input[type="submit"], [class*="login"], [id*="login"]');

      if (usernameField && passwordField && submitButton) {
        console.log('Login form found - entering credentials');
        await usernameField.type('admin');
        await passwordField.type('admin123');
        await submitButton.click();

        // Wait for redirect
        await page.waitForTimeout(3000);

        const postLoginUrl = page.url();
        console.log(`Post-login URL: ${postLoginUrl}`);

        // Test 5: Try to access protected page after login
        console.log('\n--- TEST 5: Access Protected Page After Login ---');
        await page.goto('http://localhost:5001/trades', { waitUntil: 'networkidle2' });

        const finalUrl = page.url();
        console.log(`Final URL after login: ${finalUrl}`);

        const hasError = finalUrl.includes('/login.html') || finalUrl.includes('error');
        const hasContent = await page.$('[class*="trade"], [id*="trade"], table, .dashboard');

        console.log(`Login successful: ${!hasError}`);
        console.log(`Protected content accessible: ${!!hasContent}`);

      } else {
        console.log('Login form elements not found');
      }
    } else {
      console.log('Not redirected to login page');
    }

    // Test 6: Check for JavaScript errors
    console.log('\n--- TEST 6: JavaScript Errors ---');
    const jsErrors = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });

    console.log(`JS errors detected: ${jsErrors.length}`);
    if (jsErrors.length > 0) {
      jsErrors.forEach(error => console.log(`  ❌ ${error}`));
    } else {
      console.log('  ✅ No JavaScript errors');
    }

    console.log('\n=== PRODUCTION QA RESULTS SUMMARY ===');
    console.log(`Index page redirects to login: ${currentUrl1.includes('/login.html')}`);
    console.log(`Trades page redirects to login: ${currentUrl3.includes('/login.html')}`);
    console.log(`TEST MODE messages: ${testModeMessages.length} (should be 0)`);
    console.log(`JavaScript errors: ${jsErrors.length} (should be 0)`);
    console.log(`Modal present (should be false): ${!!hasLoginModal}`);

    const overallPass = currentUrl1.includes('/login.html') &&
                       currentUrl3.includes('/login.html') &&
                       testModeMessages.length === 0 &&
                       jsErrors.length === 0 &&
                       !hasLoginModal;

    console.log(`\nOVERALL QA STATUS: ${overallPass ? 'PASS' : 'FAIL'}`);

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testAuthProduction5001().catch(console.error);
