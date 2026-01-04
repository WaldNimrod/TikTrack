const puppeteer = require('puppeteer');

async function testCompleteRedirectFlow() {
  console.log('=== COMPLETE REDIRECT FLOW QA - PORT 8080 ===');
  console.log('Testing full auth flow: redirect → login → authenticated access');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--incognito', '--disable-web-security', '--disable-features=VizDisplayCompositor']
  });

  const page = await browser.newPage();

  try {
    // Test 1: Index page redirect
    console.log('\n--- TEST 1: Index Page (/) - Redirect Verification ---');
    await page.goto('http://localhost:8080/', { waitUntil: 'networkidle2' });

    const indexUrl = page.url();
    const indexRedirected = indexUrl.includes('/login.html');

    // Check for NO modals on index page
    await new Promise(resolve => setTimeout(resolve, 2000));
    const indexModals = await page.$$('.modal.show, .modal-backdrop, [role="dialog"]');
    const indexModalCount = indexModals.length;

    console.log(`Index URL: ${indexUrl}`);
    console.log(`Index redirected: ${indexRedirected}`);
    console.log(`Index modals found: ${indexModalCount} (should be 0)`);

    // Test 2: Trades page redirect
    console.log('\n--- TEST 2: Trades Page (/trades) - Redirect Verification ---');
    await page.goto('http://localhost:8080/trades', { waitUntil: 'networkidle2' });

    const tradesUrl = page.url();
    const tradesRedirected = tradesUrl.includes('/login.html');

    // Check for NO modals on trades page
    await new Promise(resolve => setTimeout(resolve, 2000));
    const tradesModals = await page.$$('.modal.show, .modal-backdrop, [role="dialog"]');
    const tradesModalCount = tradesModals.length;

    console.log(`Trades URL: ${tradesUrl}`);
    console.log(`Trades redirected: ${tradesRedirected}`);
    console.log(`Trades modals found: ${tradesModalCount} (should be 0)`);

    // Test 3: CRUD dashboard redirect
    console.log('\n--- TEST 3: CRUD Dashboard (/crud_testing_dashboard) - Redirect Verification ---');
    await page.goto('http://localhost:8080/crud_testing_dashboard', { waitUntil: 'networkidle2' });

    const crudUrl = page.url();
    const crudRedirected = crudUrl.includes('/login.html');

    // Check for NO modals on CRUD page
    await new Promise(resolve => setTimeout(resolve, 2000));
    const crudModals = await page.$$('.modal.show, .modal-backdrop, [role="dialog"]');
    const crudModalCount = crudModals.length;

    console.log(`CRUD URL: ${crudUrl}`);
    console.log(`CRUD redirected: ${crudRedirected}`);
    console.log(`CRUD modals found: ${crudModalCount} (should be 0)`);

    // Test 4: Login page verification (no popups, has form)
    console.log('\n--- TEST 4: Login Page (/login.html) - No Modal Popups ---');

    // Verify login page has NO modal popups
    const loginModalPopups = await page.$$('.modal.show, .modal.fade.show, .modal-backdrop');
    const loginPopupCount = loginModalPopups.length;

    // But SHOULD have login form elements
    const loginFormElements = await page.$$('input[name="username"], input[name="password"], button[type="submit"], form');
    const loginFormCount = loginFormElements.length;

    // Check body classes for modal indicators
    const bodyClasses = await page.evaluate(() => document.body.className);
    const hasModalClasses = bodyClasses.includes('modal-open') || bodyClasses.includes('modal-');

    console.log(`Login modal popups: ${loginPopupCount} (should be 0)`);
    console.log(`Login form elements: ${loginFormCount} (should be ≥3)`);
    console.log(`Body modal classes: ${hasModalClasses} (should be false)`);

    // Test 5: Login attempt
    console.log('\n--- TEST 5: Login Attempt ---');

    if (loginFormCount >= 3) {
      // Find and fill login form
      const usernameField = await page.$('input[name="username"]');
      const passwordField = await page.$('input[name="password"]');
      const submitButton = await page.$('button[type="submit"]');

      if (usernameField && passwordField && submitButton) {
        console.log('Entering credentials: admin / admin123');
        await usernameField.type('admin');
        await passwordField.type('admin123');
        await submitButton.click();

        // Wait for redirect
        await new Promise(resolve => setTimeout(resolve, 3000));

        const postLoginUrl = page.url();
        const loginSuccess = !postLoginUrl.includes('/login.html');

        console.log(`Post-login URL: ${postLoginUrl}`);
        console.log(`Login success: ${loginSuccess}`);
      } else {
        console.log('❌ Login form elements not accessible');
      }
    }

    // Test 6: Post-login access verification
    console.log('\n--- TEST 6: Post-Login Protected Access ---');

    if (!page.url().includes('/login.html')) {
      // Try to access protected pages after login
      await page.goto('http://localhost:8080/trades', { waitUntil: 'networkidle2' });
      const postLoginTradesUrl = page.url();
      const tradesAccessible = !postLoginTradesUrl.includes('/login.html');

      await page.goto('http://localhost:8080/crud_testing_dashboard', { waitUntil: 'networkidle2' });
      const postLoginCrudUrl = page.url();
      const crudAccessible = !postLoginCrudUrl.includes('/login.html');

      console.log(`Trades accessible after login: ${tradesAccessible}`);
      console.log(`CRUD accessible after login: ${crudAccessible}`);
    }

    // Test 7: Console analysis
    console.log('\n--- TEST 7: Console Analysis ---');
    const consoleMessages = [];
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('TEST MODE') || text.includes('modal') || text.includes('auth')) {
        consoleMessages.push(text);
      }
    });

    console.log(`Relevant console messages: ${consoleMessages.length}`);
    consoleMessages.slice(0, 3).forEach(msg => console.log(`  - ${msg}`));

    // Test 8: JavaScript errors
    console.log('\n--- TEST 8: JavaScript Errors ---');
    const jsErrors = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });

    console.log(`JS errors detected: ${jsErrors.length}`);

    // Final summary
    console.log('\n=== COMPLETE REDIRECT FLOW SUMMARY ===');
    console.log(`Index redirects properly: ${indexRedirected}`);
    console.log(`Trades redirects properly: ${tradesRedirected}`);
    console.log(`CRUD redirects properly: ${crudRedirected}`);
    console.log(`No modals on protected pages: ${indexModalCount === 0 && tradesModalCount === 0 && crudModalCount === 0}`);
    console.log(`Login page has form, no popups: ${loginFormCount >= 3 && loginPopupCount === 0 && !hasModalClasses}`);
    console.log(`No JavaScript errors: ${jsErrors.length === 0}`);

    const overallPass = indexRedirected &&
                       tradesRedirected &&
                       crudRedirected &&
                       indexModalCount === 0 &&
                       tradesModalCount === 0 &&
                       crudModalCount === 0 &&
                       loginFormCount >= 3 &&
                       loginPopupCount === 0 &&
                       !hasModalClasses &&
                       jsErrors.length === 0;

    console.log(`\nOVERALL QA STATUS: ${overallPass ? 'PASS ✅' : 'FAIL ❌'}`);

    if (!overallPass) {
      console.log('\nFAILING CRITERIA:');
      if (!indexRedirected) console.log('  - Index page not redirecting');
      if (!tradesRedirected) console.log('  - Trades page not redirecting');
      if (!crudRedirected) console.log('  - CRUD page not redirecting');
      if (indexModalCount > 0 || tradesModalCount > 0 || crudModalCount > 0) console.log('  - Modals found on protected pages');
      if (loginFormCount < 3) console.log('  - Login form incomplete');
      if (loginPopupCount > 0 || hasModalClasses) console.log('  - Modal popups on login page');
      if (jsErrors.length > 0) console.log('  - JavaScript errors present');
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testCompleteRedirectFlow().catch(console.error);
