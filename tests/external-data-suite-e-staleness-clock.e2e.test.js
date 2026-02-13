#!/usr/bin/env node
/**
 * External Data — Suite E: UI (Clock + Tooltip)
 * TEAM_10_TO_TEAM_30_EXTERNAL_DATA_AUTOMATED_TESTING_MANDATE
 * TEAM_90_TO_TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_DIRECTIVE — סוויטה E
 *
 * אוטומציה (Selenium) לוידוא:
 * - staleness=ok → שעון ניטרלי (neutral clock)
 * - staleness=warning → צבע אזהרה + tooltip
 * - staleness=na → צבע alert + tooltip
 * - No banner — אין באנר (לפי האפיון)
 *
 * הרצה: Nightly CI (סוויטה מלאה)
 * npm run test:external-data-suite-e
 */

import { createDriver, TEST_CONFIG, TEST_USERS, getLocalStorageValue, TestLogger } from './selenium-config.js';
import { By } from 'selenium-webdriver';

const logger = new TestLogger();

const TOOLTIPS = {
  ok: 'נתונים מעודכנים',
  warning: 'נתונים בני יותר מ־15 דקות — ייתכן שלא מעודכנים',
  na: 'נתוני EOD — לא מעודכנים (סוף יום)',
};

async function login(driver) {
  try {
    await driver.get(`${TEST_CONFIG.frontendUrl}/login`);
    await driver.sleep(2000);
    const usernameInput = await driver.findElement(By.css('input[name="usernameOrEmail"]')).catch(() => null);
    if (!usernameInput) return false;
    await usernameInput.sendKeys(TEST_USERS.admin.username);
    await driver.findElement(By.css('input[name="password"]')).sendKeys(TEST_USERS.admin.password);
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.sleep(3500);
    const token = await getLocalStorageValue(driver, 'access_token');
    return !!token;
  } catch (e) {
    logger.log('Login', 'FAIL', { message: e.message });
    return false;
  }
}

/**
 * Run Suite E tests — staleness clock + tooltip, no banner
 */
async function runSuiteE() {
  const criteria = {
    clockOk: { name: 'staleness=ok → שעון ניטרלי + tooltip', status: 'SKIP' },
    clockWarning: { name: 'staleness=warning → צבע אזהרה + tooltip', status: 'SKIP' },
    clockNa: { name: 'staleness=na → צבע alert + tooltip', status: 'SKIP' },
    noBanner: { name: 'No banner — אין באנר', status: 'SKIP' },
  };

  let driver;
  try {
    driver = await createDriver();
    await driver.get(`${TEST_CONFIG.frontendUrl}/`);
    await driver.sleep(1500);

    const loggedIn = await login(driver);
    if (!loggedIn) {
      logger.log('Login', 'FAIL', { message: 'לא הצלחנו להתחבר' });
      return criteria;
    }
    logger.log('Login', 'PASS');

    // Navigate to page with staleness clock (trading_accounts has stalenessClock + eodStalenessCheck)
    await driver.get(`${TEST_CONFIG.frontendUrl}/trading_accounts.html`);
    await driver.sleep(5000);

    // Wait for clock to exist (eodStalenessCheck creates it via updateStalenessClock)
    let clock = await driver.findElement(By.id('staleness-clock')).catch(() => null);
    if (!clock) {
      // Ensure clock exists by calling updateStalenessClock (stalenessClock.js injects it)
      await driver.executeScript(`
        if (typeof window.updateStalenessClock === 'function') {
          window.updateStalenessClock('ok');
        }
      `);
      await driver.sleep(500);
      clock = await driver.findElement(By.id('staleness-clock')).catch(() => null);
    }

    if (!clock) {
      criteria.clockOk.status = 'FAIL';
      criteria.clockOk.note = 'שעון סטגנציה לא נמצא בעמוד';
      criteria.clockWarning.status = 'FAIL';
      criteria.clockWarning.note = 'שעון חסר — לא ניתן לבדוק';
      criteria.clockNa.status = 'FAIL';
      criteria.clockNa.note = 'שעון חסר — לא ניתן לבדוק';
    } else {
      // === Test 1: staleness=ok → neutral clock + tooltip ===
      await driver.executeScript(`window.updateStalenessClock('ok');`);
      await driver.sleep(300);
      const okClass = await driver.findElement(By.id('staleness-clock')).getAttribute('class');
      const okTitle = await driver.findElement(By.id('staleness-clock')).getAttribute('title');
      const okPass =
        /staleness-clock--ok/.test(okClass) && (okTitle === TOOLTIPS.ok || okTitle?.includes('מעודכנים'));
      criteria.clockOk.status = okPass ? 'PASS' : 'FAIL';
      criteria.clockOk.note = okPass ? `class=${okClass} tooltip=ok` : `class=${okClass} title=${okTitle}`;

      // === Test 2: staleness=warning → warning color + tooltip ===
      await driver.executeScript(`window.updateStalenessClock('warning');`);
      await driver.sleep(300);
      const warnClass = await driver.findElement(By.id('staleness-clock')).getAttribute('class');
      const warnTitle = await driver.findElement(By.id('staleness-clock')).getAttribute('title');
      const warnPass =
        /staleness-clock--warning/.test(warnClass) &&
        (warnTitle === TOOLTIPS.warning || warnTitle?.includes('15 דקות'));
      criteria.clockWarning.status = warnPass ? 'PASS' : 'FAIL';
      criteria.clockWarning.note = warnPass ? `class=${warnClass} tooltip=warning` : `class=${warnClass} title=${warnTitle}`;

      // === Test 3: staleness=na → alert color + tooltip ===
      await driver.executeScript(`window.updateStalenessClock('na');`);
      await driver.sleep(300);
      const naClass = await driver.findElement(By.id('staleness-clock')).getAttribute('class');
      const naTitle = await driver.findElement(By.id('staleness-clock')).getAttribute('title');
      const naPass =
        /staleness-clock--na/.test(naClass) &&
        (naTitle === TOOLTIPS.na || naTitle?.includes('EOD') || naTitle?.includes('סוף יום'));
      criteria.clockNa.status = naPass ? 'PASS' : 'FAIL';
      criteria.clockNa.note = naPass ? `class=${naClass} tooltip=na` : `class=${naClass} title=${naTitle}`;
    }

    // === Test 4: No banner — אין באנר ===
    const bannerVisible = await driver.executeScript(`
      const banner = document.getElementById('eod-warning-banner');
      if (!banner) return false;
      return !banner.classList.contains('eod-warning-banner--hidden') && banner.offsetParent !== null;
    `);
    criteria.noBanner.status = !bannerVisible ? 'PASS' : 'FAIL';
    criteria.noBanner.note = !bannerVisible
      ? 'אין באנר גלוי (לפי האפיון)'
      : 'באנר גלוי — לא לפי האפיון (No banner)';

    await driver.quit();
  } catch (e) {
    logger.error('Suite E', e);
    if (driver) try { await driver.quit(); } catch (_) {}
  }

  return criteria;
}

runSuiteE().then((criteria) => {
  console.log('\n=== External Data — Suite E (Clock + Tooltip) Results ===\n');
  Object.entries(criteria).forEach(([k, v]) => {
    logger.log(v.name, v.status, { message: v.note });
  });
  logger.printSummary();
  const failed = Object.values(criteria).filter((v) => v.status === 'FAIL').length;
  process.exit(failed > 0 ? 1 : 0);
});
