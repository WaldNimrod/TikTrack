const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const EVIDENCE_DIR = 'documentation/05-REPORTS/artifacts/2026_01_02';

async function safeEvaluate(page, fn, defaultValue = null) {
  try {
    return await page.evaluate(fn);
  } catch (error) {
    console.log(`Evaluation failed: ${error.message}`);
    return defaultValue;
  }
}

async function clearBrowserData(page) {
  try {
    // First go to blank page to clear any existing state
    await page.goto('about:blank');
    await new Promise(resolve => setTimeout(resolve, 200));

    // Then go to login page and clear storage
    await page.goto('http://localhost:8080/login.html', { waitUntil: 'domcontentloaded' });
    await new Promise(resolve => setTimeout(resolve, 500));

    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        // Ignore storage errors
      }
    });
    const cookies = await page.cookies().catch(() => []);
    if (cookies.length > 0) {
      await page.deleteCookie(...cookies);
    }
  } catch (e) {
    // Ignore clearing errors
  }
}

async function testUserProfileFlow() {
  console.log('🎯 Starting Focused QA: Login → /user_profile Flow');
  console.log('📋 Test Steps:');
  console.log('1. Clear browser data');
  console.log('2. Navigate to /user_profile (should redirect to login)');
  console.log('3. Login with admin/admin123');
  console.log('4. Verify redirect to /user_profile');
  console.log('5. Verify page loads without redirect loop');

  const results = {
    timestamp: new Date().toISOString().replace(/:/g, '-').split('.')[0],
    test_name: 'user_profile_focused_qa',
    steps: [],
    overall_status: 'unknown'
  };

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--disable-extensions', '--no-sandbox', '--disable-dev-shm-usage']
    });

    const page = await browser.newPage();

    // Step 1: Clear browser data and navigate to user_profile
    console.log('\n--- Step 1: Navigate to /user_profile (unauthenticated) ---');
    await clearBrowserData(page);

    // Capture console messages
    page.on('console', msg => {
      console.log(`[PAGE CONSOLE] ${msg.type()}: ${msg.text()}`);
    });

    console.log('Navigating to user_profile...');
    await page.goto('http://localhost:8080/user_profile', { waitUntil: 'networkidle2' });

    console.log('Checking auth state after navigation...');
    await page.evaluate(() => {
      console.log('[QA DEBUG] window.authToken:', !!window.authToken);
      console.log('[QA DEBUG] window.currentUser:', !!window.currentUser);
      console.log('[QA DEBUG] sessionStorage.authToken:', sessionStorage.getItem('authToken') ? 'present' : 'null');
      console.log('[QA DEBUG] sessionStorage.currentUser:', sessionStorage.getItem('currentUser') ? 'present' : 'null');
    }).catch(e => console.log('Eval failed:', e.message));

    console.log('Waiting 10 seconds for potential redirect...');
    await new Promise(resolve => setTimeout(resolve, 10000));

    const step1Url = page.url();
    const step1Redirected = step1Url.includes('/login.html');

    results.steps.push({
      step: 1,
      name: 'Navigate to /user_profile (unauthenticated)',
      expected: 'Redirect to /login.html',
      actual: step1Url,
      passed: step1Redirected,
      details: { redirected: step1Redirected }
    });

    console.log(`URL: ${step1Url}`);
    console.log(`Redirected to login: ${step1Redirected ? '✅' : '❌'}`);

    if (!step1Redirected) {
      console.log('❌ FAILED: Should redirect to login but did not');
      results.overall_status = 'FAIL';
      return results;
    }

    // Step 2: Login process
    console.log('\n--- Step 2: Login Process ---');

    // Check auth state before login
    const preLoginAuth = await safeEvaluate(page, () => ({
      windowAuthToken: !!window.authToken,
      windowCurrentUser: !!window.currentUser,
      sessionAuthToken: sessionStorage.getItem('authToken') ? 'present' : 'null',
      sessionCurrentUser: sessionStorage.getItem('currentUser') ? 'present' : 'null'
    }), {});
    console.log('Pre-login auth state:', preLoginAuth);

    const usernameField = await page.$('#username');
    const passwordField = await page.$('#password');
    const loginBtn = await page.$('#loginBtn');

    if (!usernameField || !passwordField || !loginBtn) {
      console.log('❌ FAILED: Login form elements not found');
      results.steps.push({
        step: 2,
        name: 'Login form elements',
        expected: 'All elements present',
        actual: 'Missing elements',
        passed: false,
        details: {
          usernameField: !!usernameField,
          passwordField: !!passwordField,
          loginBtn: !!loginBtn
        }
      });
      results.overall_status = 'FAIL';
      return results;
    }

    // Enter credentials
    await page.type('#username', 'admin');
    await page.type('#password', 'admin123');
    await page.click('#loginBtn');

    console.log('Credentials entered, login button clicked');

    // Wait for redirect
    await new Promise(resolve => setTimeout(resolve, 5000));

    const postLoginUrl = page.url();
    const redirectedToUserProfile = postLoginUrl.includes('/user_profile');

    // Check auth state immediately after login redirect
    if (redirectedToUserProfile) {
      const postLoginAuth = await safeEvaluate(page, () => ({
        windowAuthToken: !!window.authToken,
        windowCurrentUser: !!window.currentUser,
        sessionAuthToken: sessionStorage.getItem('authToken') ? 'present' : 'null',
        sessionCurrentUser: sessionStorage.getItem('currentUser') ? 'present' : 'null'
      }), {});
      console.log('Post-login auth state (at user_profile):', postLoginAuth);
    }

    results.steps.push({
      step: 2,
      name: 'Login process',
      expected: 'Redirect to /user_profile after login',
      actual: postLoginUrl,
      passed: redirectedToUserProfile,
      details: {
        postLoginUrl: postLoginUrl,
        redirectedToUserProfile: redirectedToUserProfile
      }
    });

    console.log(`Post-login URL: ${postLoginUrl}`);
    console.log(`Redirected to user_profile: ${redirectedToUserProfile ? '✅' : '❌'}`);

    if (!redirectedToUserProfile) {
      console.log('❌ FAILED: Should redirect to user_profile but did not');
      results.overall_status = 'FAIL';
      return results;
    }

    // Step 3: Verify no redirect loop
    console.log('\n--- Step 3: Verify No Redirect Loop ---');

    // Wait and check if URL changes (indicating redirect loop)
    let stableCount = 0;
    let lastUrl = postLoginUrl;
    let loopDetected = false;

    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const currentUrl = page.url();

      if (currentUrl === lastUrl) {
        stableCount++;
      } else {
        // URL changed - potential redirect loop
        console.log(`URL changed at ${i}s: ${lastUrl} → ${currentUrl}`);
        loopDetected = true;

        // Check auth state before redirect
        const preRedirectAuth = await safeEvaluate(page, () => ({
          windowAuthToken: !!window.authToken,
          windowCurrentUser: !!window.currentUser,
          sessionAuthToken: sessionStorage.getItem('authToken') ? 'present' : 'null',
          sessionCurrentUser: sessionStorage.getItem('currentUser') ? 'present' : 'null'
        }), {});
        console.log('Auth state before redirect:', preRedirectAuth);

        break;
      }

      lastUrl = currentUrl;
    }

    const noLoop = stableCount >= 5; // Stable for at least 5 seconds

    results.steps.push({
      step: 3,
      name: 'No redirect loop',
      expected: 'URL stable for 5+ seconds',
      actual: loopDetected ? 'URL changed' : `Stable for ${stableCount} seconds`,
      passed: noLoop,
      details: {
        stableCount: stableCount,
        loopDetected: loopDetected
      }
    });

    console.log(`Redirect loop check: ${noLoop ? '✅ PASS' : '❌ FAIL'}`);
    if (!noLoop) {
      console.log('❌ FAILED: Redirect loop detected');
    }

    // Step 4: Verify page loads correctly
    console.log('\n--- Step 4: Verify Page Loads Correctly ---');

    const headerVisible = await page.$('#unified-header') !== null;
    const pageTitle = await page.title();
    const hasContent = await page.$('.container, .content, main') !== null;

    const pageLoads = headerVisible && hasContent;

    results.steps.push({
      step: 4,
      name: 'Page loads correctly',
      expected: 'Header visible, content present',
      actual: `Header: ${headerVisible}, Content: ${hasContent}, Title: ${pageTitle}`,
      passed: pageLoads,
      details: {
        headerVisible: headerVisible,
        pageTitle: pageTitle,
        hasContent: hasContent
      }
    });

    console.log(`Header visible: ${headerVisible ? '✅' : '❌'}`);
    console.log(`Content present: ${hasContent ? '✅' : '❌'}`);
    console.log(`Page title: ${pageTitle}`);

    // Overall assessment
    const allStepsPass = results.steps.every(step => step.passed);
    results.overall_status = allStepsPass ? 'PASS' : 'FAIL';

    // Save results
    const jsonFile = path.join(EVIDENCE_DIR, `team_d_user_profile_focused_qa_${results.timestamp}.json`);
    const txtFile = path.join(EVIDENCE_DIR, `team_d_user_profile_focused_qa_${results.timestamp}.txt`);

    fs.writeFileSync(jsonFile, JSON.stringify(results, null, 2));
    fs.writeFileSync(txtFile, generateTextReport(results));

    console.log('\n📊 FINAL RESULTS:');
    console.log(`Status: ${results.overall_status} ${results.overall_status === 'PASS' ? '✅' : '❌'}`);
    console.log(`Steps Passed: ${results.steps.filter(s => s.passed).length}/${results.steps.length}`);

    console.log('\n💾 Evidence saved:');
    console.log(`JSON: ${jsonFile}`);
    console.log(`TXT: ${txtFile}`);

    return {
      status: results.overall_status,
      results: results,
      jsonFile,
      txtFile
    };

  } catch (error) {
    console.error('❌ QA execution failed:', error);
    results.overall_status = 'ERROR';
    results.error = error.message;

    const errorFile = path.join(EVIDENCE_DIR, `team_d_user_profile_focused_qa_error_${results.timestamp}.json`);
    fs.writeFileSync(errorFile, JSON.stringify(results, null, 2));

    return { status: 'ERROR', error: error.message };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function generateTextReport(data) {
  let report = `================================================================================\n`;
  report += `TEAM D - USER PROFILE FOCUSED QA REPORT\n`;
  report += `================================================================================\n\n`;

  report += `Test: Login → /user_profile Flow\n`;
  report += `Timestamp: ${data.timestamp}\n`;
  report += `Overall Status: ${data.overall_status} ${data.overall_status === 'PASS' ? '✅' : '❌'}\n\n`;

  report += `STEPS:\n`;
  report += `======\n`;

  data.steps.forEach(step => {
    report += `${step.step}. ${step.name}\n`;
    report += `   Expected: ${step.expected}\n`;
    report += `   Actual: ${step.actual}\n`;
    report += `   Status: ${step.passed ? 'PASS ✅' : 'FAIL ❌'}\n`;
    if (step.details) {
      Object.entries(step.details).forEach(([key, value]) => {
        report += `   ${key}: ${value}\n`;
      });
    }
    report += '\n';
  });

  if (data.error) {
    report += `ERROR: ${data.error}\n\n`;
  }

  report += `================================================================================\n`;

  return report;
}

testUserProfileFlow().then(results => {
  console.log(`\n🏁 QA Complete: ${results.status}`);
  process.exit(results.status === 'PASS' ? 0 : 1);
}).catch(error => {
  console.error('❌ QA Failed:', error);
  process.exit(1);
});
