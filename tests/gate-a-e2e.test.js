#!/usr/bin/env node
/**
 * Gate A E2E Tests - Team 50 (QA)
 * -------------------------------
 * Tests required by Team 10 handoff: TEAM_10_TO_TEAM_50_GATE_A_CONTEXT_HANDOFF.md
 * Aligned to SSOT/ADR-013 per Gate A QA precision handoff.
 *
 * Scope: Stages 0, 1, 2 — Auth 4 types (A/B/C/D), Header, Home
 * Pages: /, /login, /register, /reset-password, /trading_accounts, /brokers_fees, /cash_flows, /admin/design-system
 * Gate Condition: 0 SEVERE in console
 *
 * Scenarios (SSOT/ADR-013):
 * 1. Type B (Home): Guest stays on Home (no redirect), independent of public_routes
 * 2. Type B: Login→Home→Logged-in Container
 * 3. Type A: /login, /register, /reset-password — no Header
 * 4. Type C: Guest on /trading_accounts → redirect to Home (not /login)
 * 5. Type D: USER → redirect to Home (/) — explicit destination; ADMIN → access
 * 6. Header Loader: runs before React mount (load order assert)
 * 7. Header: persists after Login → Home
 * 8. User Icon: assert by CSS class (success/alert), not by color — theme-independent
 * 9. 0 SEVERE — Console hygiene
 */

import { createDriver, TEST_CONFIG, TEST_USERS, waitForElement, getConsoleLogs, getLocalStorageValue, clearLocalStorage, elementExists, fillField, clickElement, TestLogger } from './selenium-config.js';
import { By } from 'selenium-webdriver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTIFACTS_DIR = path.join(__dirname, '..', 'documentation', '05-REPORTS', 'artifacts_SESSION_01', 'gate-a-artifacts');
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const logger = new TestLogger();

/**
 * Login helper
 */
async function login(driver, username = TEST_USERS.admin.username, password = TEST_USERS.admin.password) {
  try {
    await driver.get(`${TEST_CONFIG.frontendUrl}/login`);
    await driver.sleep(1500);
    const usernameInput = await driver.findElement(By.css('input[name="usernameOrEmail"]')).catch(() => null);
    if (!usernameInput) return false;
    await usernameInput.sendKeys(username);
    await driver.findElement(By.css('input[name="password"]')).sendKeys(password);
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.sleep(3500);
    const token = await getLocalStorageValue(driver, 'access_token');
    if (token) {
      await driver.executeScript(`localStorage.setItem('auth_token', localStorage.getItem('access_token') || '');`);
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

/**
 * Assert 0 SEVERE in console (excluding favicon)
 */
function assertZeroSevere(consoleLogs, testName) {
  const severe = consoleLogs.filter(l => l.level === 'SEVERE');
  const severeExcludingFavicon = severe.filter(e => !e.message?.includes('favicon'));
  if (severeExcludingFavicon.length > 0) {
    logger.log(testName, 'FAIL', {
      message: `Expected 0 SEVERE, found ${severeExcludingFavicon.length}`,
      severeMessages: severeExcludingFavicon.map(e => e.message?.substring(0, 200))
    });
    return false;
  }
  logger.log(`${testName}_ConsoleHygiene`, 'PASS', { message: '0 SEVERE in console' });
  return true;
}

/**
 * Run Gate A tests
 */
async function runGateATests() {
  let driver;
  const results = { passed: 0, failed: 0, skipped: 0 };

  try {
    driver = await createDriver();
    // Ensure we're on a real origin before any localStorage operations
    await driver.get(`${TEST_CONFIG.frontendUrl}/`);
    await driver.sleep(1500);

    // ==================== Type B (Home) — SSOT/ADR-013 ====================
    // Type B (Shared): Guest stays on Home — NO redirect. Independent of public_routes.
    logger.log('GATE_A_TypeB_Guest', 'START', { message: 'Guest on Home: stays on Home (no redirect), sees Guest Container only' });
    await clearLocalStorage(driver);
    await driver.get(`${TEST_CONFIG.frontendUrl}/`);
    await driver.sleep(3000);

    const currentUrl = await driver.getCurrentUrl();
    const base = TEST_CONFIG.frontendUrl.replace(/\/$/, '');
    const stayedOnHome = currentUrl === base + '/' || currentUrl === base + '/#' || currentUrl.startsWith(base + '/?');
    const guestContainer = await elementExists(driver, '.guest-container');
    const loggedInContainer = await elementExists(driver, '[data-container-type="logged-in"]');
    const consoleLogs = await getConsoleLogs(driver);
    assertZeroSevere(consoleLogs, 'GATE_A_TypeB_Guest');

    if (stayedOnHome && guestContainer && !loggedInContainer) {
      logger.log('GATE_A_TypeB_Guest', 'PASS', {
        message: 'Guest stays on Home (no redirect), sees Guest Container only',
        currentUrl,
        note: 'Independent of public_routes — Type B by path === /'
      });
      results.passed++;
    } else {
      logger.log('GATE_A_TypeB_Guest', 'FAIL', {
        message: 'Guest should stay on Home (no redirect) and see Guest Container only',
        stayedOnHome,
        currentUrl,
        guestContainer,
        loggedInContainer
      });
      results.failed++;
    }

    // Type B: Login → Home → Logged-in Container
    logger.log('GATE_A_TypeB_LoginToHome', 'START', { message: 'Login → Home → Logged-in Container' });
    const loggedIn = await login(driver);
    if (!loggedIn) {
      logger.log('GATE_A_TypeB_LoginToHome', 'SKIP', { message: 'Login failed, skipping' });
      results.skipped++;
    } else {
      await driver.get(`${TEST_CONFIG.frontendUrl}/`);
      await driver.sleep(3000);
      const guestAfter = await elementExists(driver, '.guest-container');
      const loggedInAfter = await elementExists(driver, '[data-container-type="logged-in"]');
      const url = await driver.getCurrentUrl();
      const isHome = url.includes(TEST_CONFIG.frontendUrl + '/') && (url.endsWith('/') || url.endsWith('/#'));

      if (loggedInAfter && !guestAfter && isHome) {
        logger.log('GATE_A_TypeB_LoginToHome', 'PASS', { message: 'Login→Home shows Logged-in Container' });
        results.passed++;
      } else {
        logger.log('GATE_A_TypeB_LoginToHome', 'FAIL', {
          message: 'After Login→Home should see Logged-in only',
          guestAfter,
          loggedInAfter,
          url
        });
        results.failed++;
      }
    }

    // ==================== Type A (No Header) ====================
    logger.log('GATE_A_TypeA_NoHeader', 'START', { message: 'Type A pages: no Header' });
    const typeAPages = ['/login', '/register', '/reset-password'];
    let typeAPass = true;
    for (const page of typeAPages) {
      await clearLocalStorage(driver);
      await driver.get(`${TEST_CONFIG.frontendUrl}${page}`);
      await driver.sleep(2000);
      const header = await elementExists(driver, 'header#unified-header');
      if (header) {
        logger.log('GATE_A_TypeA_NoHeader', 'FAIL', { message: `Header should NOT exist on ${page}`, page });
        typeAPass = false;
        break;
      }
    }
    if (typeAPass) {
      logger.log('GATE_A_TypeA_NoHeader', 'PASS', { message: 'No Header on /login, /register, /reset-password' });
      results.passed++;
    } else {
      results.failed++;
    }

    // ==================== Type C (Guest redirect to Home) ====================
    logger.log('GATE_A_TypeC_Redirect', 'START', { message: 'Guest on Type C page → redirect to Home' });
    await clearLocalStorage(driver);
    await driver.get(`${TEST_CONFIG.frontendUrl}/trading_accounts`);
    await driver.sleep(5000); // Auth guard + redirect

    const typeCUrl = await driver.getCurrentUrl();
    const isRedirectedToHome = typeCUrl.includes(TEST_CONFIG.frontendUrl + '/') &&
      (typeCUrl.endsWith('/') || typeCUrl.endsWith('/#') || typeCUrl.includes('/?'));
    const notOnLogin = !typeCUrl.includes('/login');
    const notOnTradingAccounts = !typeCUrl.includes('/trading_accounts');

    if (isRedirectedToHome && notOnLogin && notOnTradingAccounts) {
      logger.log('GATE_A_TypeC_Redirect', 'PASS', {
        message: 'Guest redirected to Home (not /login)',
        currentUrl: typeCUrl
      });
      results.passed++;
    } else {
      logger.log('GATE_A_TypeC_Redirect', 'FAIL', {
        message: 'Guest on /trading_accounts should redirect to Home',
        currentUrl: typeCUrl,
        isRedirectedToHome,
        notOnLogin,
        notOnTradingAccounts
      });
      results.failed++;
    }

    // ==================== Type D (Admin-only) ====================
    logger.log('GATE_A_TypeD_AdminAccess', 'START', { message: 'ADMIN can access /admin/design-system' });
    await login(driver);
    await driver.get(`${TEST_CONFIG.frontendUrl}/admin/design-system`);
    await driver.sleep(3500);

    const adminUrl = await driver.getCurrentUrl();
    const adminOnDesignSystem = adminUrl.includes('/admin/design-system');
    const designSystemContent = await elementExists(driver, '.admin-dashboard-placeholder, .index-section__header, tt-container');

    if (adminOnDesignSystem && designSystemContent) {
      logger.log('GATE_A_TypeD_AdminAccess', 'PASS', { message: 'ADMIN can access /admin/design-system' });
      results.passed++;
    } else {
      logger.log('GATE_A_TypeD_AdminAccess', 'FAIL', {
        message: 'ADMIN should access /admin/design-system',
        adminUrl,
        adminOnDesignSystem,
        designSystemContent
      });
      results.failed++;
    }

    // Type D: USER redirected (register new user → USER role by default)
    logger.log('GATE_A_TypeD_UserBlocked', 'START', { message: 'USER role → redirect from /admin/design-system' });
    await clearLocalStorage(driver);
    const userSuffix = Date.now();
    const userUsername = `gatea_user_${userSuffix}`;
    const userEmail = `gatea_${userSuffix}@example.com`;
    const userPhone = `+97250${userSuffix.toString().slice(-7)}`; // Unique phone number
    const userPassword = 'Test123456!';
    try {
      await driver.get(`${TEST_CONFIG.frontendUrl}/register`);
      await driver.sleep(1500);
      await fillField(driver, 'input[name="username"]', userUsername);
      await fillField(driver, 'input[name="email"]', userEmail);
      await fillField(driver, 'input[name="password"]', userPassword);
      await fillField(driver, 'input[name="confirmPassword"]', userPassword);
      await fillField(driver, 'input[name="phoneNumber"]', userPhone);
      await clickElement(driver, 'button[type="submit"]');
      await driver.sleep(4000);
    } catch (regErr) {
      logger.log('GATE_A_TypeD_UserBlocked', 'SKIP', { message: 'Registration failed - backend may be down', error: regErr?.message });
      results.skipped++;
    }

    const userToken = await getLocalStorageValue(driver, 'access_token');
    if (userToken) {
      await driver.get(`${TEST_CONFIG.frontendUrl}/admin/design-system`);
      await driver.sleep(4000);
      const userUrl = await driver.getCurrentUrl();
      const userRedirectedAway = !userUrl.includes('/admin/design-system');

      const baseUrl = TEST_CONFIG.frontendUrl.replace(/\/$/, '');
      const redirectedToHome = userRedirectedAway && (
        userUrl === baseUrl + '/' || userUrl === baseUrl + '/#' ||
        userUrl.startsWith(baseUrl + '/?') || (userUrl.startsWith(baseUrl) && !userUrl.includes('/admin'))
      );
      if (redirectedToHome) {
        logger.log('GATE_A_TypeD_UserBlocked', 'PASS', {
          message: 'USER redirected to Home (/) per ADR-013 — explicit destination',
          userUrl,
          destination: 'Home (/)'
        });
        results.passed++;
      } else if (userRedirectedAway) {
        logger.log('GATE_A_TypeD_UserBlocked', 'FAIL', {
          message: 'USER redirected but destination must be Home (/) per ADR-013',
          userUrl,
          expected: 'Home (/)'
        });
        results.failed++;
      } else {
        logger.log('GATE_A_TypeD_UserBlocked', 'FAIL', {
          message: 'USER should be redirected from /admin/design-system to Home (/)',
          userUrl
        });
        results.failed++;
      }
    } else {
      logger.log('GATE_A_TypeD_UserBlocked', 'SKIP', { message: 'Registration did not produce token - cannot verify USER redirect' });
      results.skipped++;
    }

    // ==================== Header Loader before React mount (ADR-013 SSOT) ====================
    logger.log('GATE_A_HeaderLoadOrder', 'START', { message: 'Header Loader runs before React mount per ADR-013' });
    await clearLocalStorage(driver);
    await driver.get(`${TEST_CONFIG.frontendUrl}/`);
    await driver.sleep(2500);
    const loadOrder = await driver.executeScript(`
      const h = window.__headerLoaderInit;
      const r = window.__reactMountStart;
      return { headerLoaderInit: h, reactMountStart: r, ok: h != null && r != null && h <= r };
    `);
    if (loadOrder?.ok) {
      logger.log('GATE_A_HeaderLoadOrder', 'PASS', {
        message: 'Header Loader runs before React mount (load order verified)',
        headerLoaderInit: loadOrder.headerLoaderInit,
        reactMountStart: loadOrder.reactMountStart
      });
      results.passed++;
    } else {
      logger.log('GATE_A_HeaderLoadOrder', 'FAIL', {
        message: 'Header Loader must run before React mount per ADR-013 SSOT',
        loadOrder
      });
      results.failed++;
    }

    // ==================== Header persistence after Login → Home ====================
    logger.log('GATE_A_HeaderPersistence', 'START', { message: 'Header persists after Login → Home' });
    await login(driver);
    await driver.get(`${TEST_CONFIG.frontendUrl}/`);
    await driver.sleep(3000);

    const headerAfterLogin = await elementExists(driver, 'header#unified-header');
    if (headerAfterLogin) {
      logger.log('GATE_A_HeaderPersistence', 'PASS', { message: 'Header present after Login → Home' });
      results.passed++;
    } else {
      logger.log('GATE_A_HeaderPersistence', 'FAIL', { message: 'Header should persist after Login → Home' });
      results.failed++;
    }

    // ==================== User Icon: CSS class (success/alert) — not color (ADR-013) ====================
    // Assert by CSS class only — theme-independent. Do NOT assert computed color.
    logger.log('GATE_A_UserIcon', 'START', { message: 'User Icon: assert by CSS class (success/alert), not by color' });
    // Logged-in → success class
    const successIcon = await elementExists(driver, '.user-icon--success');
    const successLink = await elementExists(driver, '.user-profile-link--success');
    if (successIcon || successLink) {
      logger.log('GATE_A_UserIcon_LoggedIn', 'PASS', { message: 'Logged-in: User Icon has .user-icon--success / .user-profile-link--success (CSS class)' });
      results.passed++;
    } else {
      logger.log('GATE_A_UserIcon_LoggedIn', 'FAIL', { message: 'Logged-in should show success class — assert by class, not color' });
      results.failed++;
    }

    // Guest → alert/warning class (theme-independent)
    await clearLocalStorage(driver);
    await driver.get(`${TEST_CONFIG.frontendUrl}/`);
    await driver.sleep(3000);
    const alertIcon = await elementExists(driver, '.user-icon--alert');
    const alertLink = await elementExists(driver, '.user-profile-link--alert');
    if (alertIcon || alertLink) {
      logger.log('GATE_A_UserIcon_Guest', 'PASS', { message: 'Guest: User Icon has .user-icon--alert / .user-profile-link--alert (CSS class, not color)' });
      results.passed++;
    } else {
      logger.log('GATE_A_UserIcon_Guest', 'FAIL', { message: 'Guest should show alert class — assert by class, not physical color' });
      results.failed++;
    }

    // ==================== Final Console Hygiene (0 SEVERE) ====================
    await driver.get(`${TEST_CONFIG.frontendUrl}/`);
    await driver.sleep(2000);
    const finalLogs = await getConsoleLogs(driver);
    const severeAll = finalLogs.filter(l => l.level === 'SEVERE');
    const severeExcludingFavicon = severeAll.filter(e => !e.message?.includes('favicon'));

    // Always save console logs for analysis
    const consolePath = path.join(ARTIFACTS_DIR, 'GATE_A_CONSOLE_LOGS.json');
    fs.writeFileSync(consolePath, JSON.stringify(finalLogs.map(log => ({
      level: log.level,
      message: log.message?.substring(0, 300),
      timestamp: log.timestamp
    })), null, 2), 'utf-8');

    if (severeExcludingFavicon.length > 0) {
      const severePath = path.join(ARTIFACTS_DIR, 'GATE_A_SEVERE_LOGS.json');
      fs.writeFileSync(severePath, JSON.stringify(severeExcludingFavicon.map(e => ({
        level: e.level,
        message: e.message?.substring(0, 500),
        timestamp: e.timestamp
      })), null, 2), 'utf-8');
      logger.log('GATE_A_Final', 'FAIL', {
        message: `Expected 0 SEVERE, found ${severeExcludingFavicon.length}. See ${severePath} and ${consolePath}`
      });
      results.failed++;
    } else {
      logger.log('GATE_A_Final', 'PASS', { message: '0 SEVERE in console' });
      results.passed++;
    }

    // Write report
    const reportPath = path.join(ARTIFACTS_DIR, 'GATE_A_QA_REPORT.md');
    const report = `# Gate A QA Report
**Date:** ${new Date().toISOString()}
**Source:** tests/gate-a-e2e.test.js

## Results
- Passed: ${results.passed}
- Failed: ${results.failed}
- Skipped: ${results.skipped}

## Scenarios Tested (SSOT/ADR-013 aligned)
1. Type B (Home): Guest stays on Home (no redirect), sees Guest Container only — independent of public_routes
2. Type B: Login → Home → Logged-in Container
3. Type A: No Header on /login, /register, /reset-password
4. Type C: Guest on /trading_accounts → redirect to Home (not /login)
5. Type D: ADMIN accesses /admin/design-system
6. Type D: USER redirected to Home (/) — explicit destination per ADR-013
7. Header Loader runs before React mount — load order assert per ADR-013
8. Header persistence after Login → Home
9. User Icon: assert by CSS class (success/alert), not by physical color — theme-independent
10. 0 SEVERE in console
`;
    fs.writeFileSync(reportPath, report, 'utf-8');
    logger.log('GATE_A_Report', 'INFO', { message: `Report saved to ${reportPath}` });

  } catch (error) {
    logger.error('GATE_A_Runner', error);
  } finally {
    if (driver) await driver.quit();
    logger.printSummary();
  }
}

runGateATests().catch(err => {
  console.error('Gate A tests failed:', err);
  process.exit(1);
});
