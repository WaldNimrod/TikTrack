const puppeteer = require('puppeteer');

async function testLoginPageModalVerification() {
  console.log('=== LOGIN PAGE MODAL VERIFICATION - PORT 8080 ===');
  console.log('Verifying /login.html page has no modal popups (only login form)');

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--incognito', '--disable-web-security', '--disable-features=VizDisplayCompositor']
  });

  const page = await browser.newPage();

  try {
    // Test 1: Direct access to login page
    console.log('\n--- TEST 1: Direct Login Page Access ---');
    await page.goto('http://localhost:8080/login.html', { waitUntil: 'networkidle2' });

    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);
    console.log(`On login page: ${currentUrl.includes('/login.html')}`);

    // Wait for page to fully load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Test 2: Check for modal popups (not login form)
    console.log('\n--- TEST 2: Modal Popup Detection ---');

    // Look for Bootstrap modal elements that indicate popup modals
    const modalSelectors = [
      '.modal.show',  // Bootstrap modal with show class
      '.modal.fade.show', // Bootstrap modal with fade and show
      '[role="dialog"]', // ARIA dialog role
      '.modal-backdrop', // Modal backdrop
      '.modal-open body' // Body with modal-open class
    ];

    let popupModalsFound = 0;
    for (const selector of modalSelectors) {
      try {
        const elements = await page.$$(selector);
        if (elements.length > 0) {
          console.log(`❌ Found modal popup: ${selector} (${elements.length} elements)`);
          popupModalsFound += elements.length;
        }
      } catch (e) {
        // Selector might not be valid, continue
      }
    }

    // Test 3: Check for login form elements (these should exist)
    console.log('\n--- TEST 3: Login Form Elements ---');
    const loginFormElements = {
      username: 'input[name="username"], input[type="text"], #username',
      password: 'input[name="password"], input[type="password"], #password',
      submit: 'button[type="submit"], input[type="submit"], .btn-primary',
      form: 'form[action*="login"], #loginForm'
    };

    let loginElementsFound = 0;
    for (const [name, selector] of Object.entries(loginFormElements)) {
      try {
        const element = await page.$(selector);
        if (element) {
          console.log(`✅ Login ${name} found: ${selector}`);
          loginElementsFound++;
        } else {
          console.log(`❌ Login ${name} NOT found: ${selector}`);
        }
      } catch (e) {
        console.log(`❓ Error checking ${name}: ${e.message}`);
      }
    }

    // Test 4: Check for any modal-related classes on body
    console.log('\n--- TEST 4: Body Modal Classes ---');
    const bodyClasses = await page.evaluate(() => document.body.className);
    const modalClasses = bodyClasses.split(' ').filter(cls => cls.includes('modal'));
    console.log(`Body classes: ${bodyClasses}`);
    console.log(`Modal-related classes: ${modalClasses.length > 0 ? modalClasses.join(', ') : 'none'}`);

    // Test 5: Check for z-index issues (modal overlays)
    console.log('\n--- TEST 5: Z-Index Analysis ---');
    const highZIndexElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      return elements
        .map(el => ({
          tag: el.tagName.toLowerCase(),
          classes: el.className,
          zIndex: window.getComputedStyle(el).zIndex
        }))
        .filter(item => item.zIndex !== 'auto' && parseInt(item.zIndex) > 1000)
        .slice(0, 5); // Top 5 high z-index elements
    });

    console.log(`High z-index elements (>1000): ${highZIndexElements.length}`);
    highZIndexElements.forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.tag} .${item.classes} (z-index: ${item.zIndex})`);
    });

    // Test 6: JavaScript errors
    console.log('\n--- TEST 6: JavaScript Errors ---');
    const jsErrors = [];
    page.on('pageerror', error => {
      jsErrors.push(error.message);
    });

    console.log(`JS errors detected: ${jsErrors.length}`);
    jsErrors.forEach(error => console.log(`  ❌ ${error}`));

    // Test 7: Visual screenshot for manual verification
    console.log('\n--- TEST 7: Screenshot Captured ---');
    await page.screenshot({ path: 'login_page_verification.png', fullPage: true });
    console.log('Screenshot saved: login_page_verification.png');

    console.log('\n=== LOGIN PAGE VERIFICATION SUMMARY ===');
    console.log(`Popup modals found: ${popupModalsFound} (should be 0)`);
    console.log(`Login form elements found: ${loginElementsFound}/4`);
    console.log(`Body modal classes: ${modalClasses.length} (should be 0)`);
    console.log(`High z-index elements: ${highZIndexElements.length}`);
    console.log(`JavaScript errors: ${jsErrors.length}`);

    const overallPass = popupModalsFound === 0 &&
                       loginElementsFound >= 3 &&
                       modalClasses.length === 0 &&
                       jsErrors.length === 0;

    console.log(`\nOVERALL VERIFICATION STATUS: ${overallPass ? 'PASS ✅' : 'FAIL ❌'}`);

    if (!overallPass) {
      console.log('\nISSUES FOUND:');
      if (popupModalsFound > 0) console.log('  - Modal popups still present');
      if (loginElementsFound < 3) console.log('  - Missing login form elements');
      if (modalClasses.length > 0) console.log('  - Modal classes on body');
      if (jsErrors.length > 0) console.log('  - JavaScript errors');
    }

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await browser.close();
  }
}

testLoginPageModalVerification().catch(console.error);
