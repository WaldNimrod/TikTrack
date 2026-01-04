const puppeteer = require('puppeteer');

async function testAuthRedirect8080() {
  console.log('=== DEVELOPMENT AUTH QA - PORT 8080 ===');
  console.log('Testing new redirect-based auth flow after Team A fixes');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--incognito', '--disable-web-security', '--disable-features=VizDisplayCompositor']
  });

  const page = await browser.newPage();

  try {
    // Clear all storage
    await page.evaluateOnNewDocument(() => {
      localStorage.clear();
      sessionStorage.clear();
      // Clear cookies
      document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
    });

    // Test 1: Access index page without authentication (should redirect to /login.html)
    console.log('\n--- TEST 1: Index Page (/) - Unauthenticated ---');
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle2' });

    const currentUrl1 = page.url();
    console.log(`Current URL: ${currentUrl1}`);
    console.log(`Redirected to login: ${currentUrl1.includes('/login.html')}`);

    // Check for old modal behavior (should NOT be present)
    const hasLoginModal = await page.$('.login-modal, #loginModal, [class*="login"], [id*="login"]');
    console.log(`Old login modal present: ${!!hasLoginModal} (should be false)`);

    // Test 2: Check for TEST MODE messages
    const testModeMessages = [];
    const consoleMessages = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleMessages.push(text);
      if (text.includes('TEST MODE')) {
        testModeMessages.push(text);
      }
    });

    console.log('\n--- TEST 2: Console Analysis ---');
    console.log(`TEST MODE messages found: ${testModeMessages.length}`);
    testModeMessages.forEach(msg => console.log(`  - ${msg}`));

    // Test 3: Access trades page (should also redirect)
    console.log('\n--- TEST 3: Trades Page (/trades) - Unauthenticated ---');
    await page.goto('http://localhost:8080/trades', { waitUntil: 'networkidle2' });

    const currentUrl3 = page.url();
    console.log(`Current URL: ${currentUrl3}`);
    console.log(`Redirected to login: ${currentUrl3.includes('/login.html')}`);

    const hasLoginModal3 = await page.$('.login-modal, #loginModal, [class*="login"], [id*="login"]');
    console.log(`Old login modal present: ${!!hasLoginModal3} (should be false)`);

    // Test 4: Check login page functionality
    console.log('\n--- TEST 4: Login Page Verification ---');

    if (currentUrl3.includes('/login.html')) {
      console.log('✅ Redirected to login page - checking form');

      // Wait for login form
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check for login form elements
      const usernameField = await page.$('input[name="username"], input[type="text"]');
      const passwordField = await page.$('input[name="password"], input[type="password"]');
      const submitButton = await page.$('button[type="submit"], input[type="submit"]');

      console.log(`Username field: ${!!usernameField}`);
      console.log(`Password field: ${!!passwordField}`);
      console.log(`Submit button: ${!!submitButton}`);

      // Test 5: Attempt login
      console.log('\n--- TEST 5: Login Attempt ---');

      if (usernameField && passwordField && submitButton) {
        console.log('Entering credentials: admin / admin123');
        await usernameField.type('admin');
        await passwordField.type('admin123');
        await submitButton.click();

        // Wait for redirect
        await new Promise(resolve => setTimeout(resolve, 3000));

        const postLoginUrl = page.url();
        console.log(`Post-login URL: ${postLoginUrl}`);

        // Check if still on login page (login failed)
        const stillOnLogin = postLoginUrl.includes('/login.html');
        console.log(`Still on login page: ${stillOnLogin} (should be false)`);

        if (!stillOnLogin) {
          // Test 6: Access protected page after login
          console.log('\n--- TEST 6: Access Protected Page After Login ---');
          await page.goto('http://localhost:8080/trades', { waitUntil: 'networkidle2' });

          const finalUrl = page.url();
          console.log(`Trades page URL after login: ${finalUrl}`);

          const hasError = finalUrl.includes('/login.html') || finalUrl.includes('error');
          const hasContent = await page.$('[class*="trade"], [id*="trade"], table, .dashboard');

          console.log(`Access successful: ${!hasError}`);
          console.log(`Content loaded: ${!!hasContent}`);
        }
      } else {
        console.log('❌ Login form elements not found');
      }
    } else {
      console.log('❌ Not redirected to login page');
    }

    // Test 7: Check for JavaScript errors
    console.log('\n--- TEST 7: JavaScript Errors ---');
    const jsErrors = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });

    console.log(`JS errors detected: ${jsErrors.length}`);
    jsErrors.forEach(error => console.log(`  ❌ ${error}`));

    // Test 8: Check for modal duplication (should be none)
    console.log('\n--- TEST 8: Modal Duplication Check ---');
    const modalCount = await page.$$eval('.modal, [class*="modal"]', modals => modals.length);
    console.log(`Modal elements found: ${modalCount} (should be 0)`);

    console.log('\n=== DEVELOPMENT QA RESULTS SUMMARY ===');
    console.log(`Index redirects to login: ${currentUrl1.includes('/login.html')}`);
    console.log(`Trades redirects to login: ${currentUrl3.includes('/login.html')}`);
    console.log(`Old modals present: ${!!hasLoginModal || !!hasLoginModal3} (should be false)`);
    console.log(`TEST MODE messages: ${testModeMessages.length}`);
    console.log(`JavaScript errors: ${jsErrors.length}`);
    console.log(`Modal duplication: ${modalCount} (should be 0)`);

    const overallPass = currentUrl1.includes('/login.html') &&
                       currentUrl3.includes('/login.html') &&
                       !hasLoginModal &&
                       !hasLoginModal3 &&
                       jsErrors.length === 0 &&
                       modalCount === 0;

    console.log(`\nOVERALL QA STATUS: ${overallPass ? 'PASS ✅' : 'FAIL ❌'}`);

    if (!overallPass) {
      console.log('\nFAILING CRITERIA:');
      if (!currentUrl1.includes('/login.html')) console.log('  - Index page not redirecting');
      if (!currentUrl3.includes('/login.html')) console.log('  - Trades page not redirecting');
      if (hasLoginModal || hasLoginModal3) console.log('  - Old modal behavior still present');
      if (jsErrors.length > 0) console.log('  - JavaScript errors present');
      if (modalCount > 0) console.log('  - Modal duplication detected');
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testAuthRedirect8080().catch(console.error);
