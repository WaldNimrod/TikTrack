#!/usr/bin/env node
/**
 * External Data — Suite E: UI (Clock + Tooltip)
 * TEAM_10_TO_TEAM_30_EXTERNAL_DATA_AUTOMATED_TESTING_MANDATE
 * TEAM_90_TO_TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_DIRECTIVE
 *
 * סוויטה E — אוטומציית Selenium לוידוא התנהגות שעון סטגנציה ו-tooltip:
 * - staleness=ok → שעון ניטרלי (neutral clock)
 * - staleness=warning → צבע אזהרה + tooltip
 * - staleness=na → צבע alert + tooltip
 * - No banner (אין באנר)
 *
 * הרצה: Nightly CI (full suite). PR Smoke לפי הנחיית Team 10/50.
 */

import { createDriver, TEST_CONFIG, TEST_USERS, getLocalStorageValue, TestLogger } from './selenium-config.js';
import { By } from 'selenium-webdriver';

const logger = new TestLogger();

// Tooltips per stalenessClock.js (SSOT)
const EXPECTED_TOOLTIPS = {
  ok: 'נתונים מעודכנים',
  warning: 'נתונים בני יותר מ־15 דקות — ייתכן שלא מעודכנים',
  na: 'נתוני EOD — לא מעודכנים (סוף יום)'
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
 * Ensure clock exists and set staleness state via updateStalenessClock
 */
async function setStalenessState(driver, state) {
  return await driver.executeScript(`
    if (window.updateStalenessClock) {
      window.updateStalenessClock('${state}');
      return true;
    }
    return false;
  `);
}

/**
 * Verify clock has correct class and tooltip for given state
 */
async function verifyClockState(driver, expectedState) {
  const clock = await driver.findElement(By.id('staleness-clock')).catch(() => null);
  if (!clock) return { pass: false, message: 'שעון סטגנציה לא נמצא' };

  const className = await clock.getAttribute('class') || '';
  const title = await clock.getAttribute('title') || '';
  const ariaLabel = await clock.getAttribute('aria-label') || '';

  const hasCorrectClass = className.includes(`staleness-clock--${expectedState}`);
  const expectedTooltip = EXPECTED_TOOLTIPS[expectedState] || EXPECTED_TOOLTIPS.ok;
  const hasCorrectTooltip = title.includes(expectedTooltip) || ariaLabel.includes(expectedTooltip);

  return {
    pass: hasCorrectClass && hasCorrectTooltip,
    message: hasCorrectClass && hasCorrectTooltip
      ? `OK: class=${expectedState}, tooltip מציג נכון`
      : `class=${hasCorrectClass ? 'OK' : 'FAIL'}, tooltip=${hasCorrectTooltip ? 'OK' : 'FAIL'} (${title || ariaLabel})`
  };
}

/**
 * Verify no EOD warning banner is visible (per spec: No banner)
 */
async function verifyNoBanner(driver) {
  const result = await driver.executeScript(`
    const banner = document.getElementById('eod-warning-banner');
    if (!banner) return { visible: false, reason: 'no-banner' };
    const isHidden = banner.classList.contains('eod-warning-banner--hidden');
    const styleDisplay = window.getComputedStyle(banner).display;
    return {
      visible: !isHidden && styleDisplay !== 'none',
      reason: isHidden ? 'hidden-class' : 'visible'
    };
  `);
  return {
    pass: !result.visible,
    message: result.visible ? 'באנר EOD מוצג (אסור לפי האפיון)' : 'אין באנר — תואם לאפיון'
  };
}

async function runSuiteE() {
  const results = {
    E1_ok_neutral: { name: 'E1: staleness=ok → שעון ניטרלי + tooltip', status: 'SKIP', note: '' },
    E2_warning: { name: 'E2: staleness=warning → צבע אזהרה + tooltip', status: 'SKIP', note: '' },
    E3_na: { name: 'E3: staleness=na → צבע alert + tooltip', status: 'SKIP', note: '' },
    E4_no_banner: { name: 'E4: No banner — אין באנר', status: 'SKIP', note: '' }
  };

  let driver;
  try {
    driver = await createDriver();
    await driver.get(`${TEST_CONFIG.frontendUrl}/`);
    await driver.sleep(1500);

    const loggedIn = await login(driver);
    if (!loggedIn) {
      logger.log('Login', 'FAIL', { message: 'לא הצלחנו להתחבר' });
      return results;
    }
    logger.log('Login', 'PASS');

    // Navigate to page with staleness clock (trading_accounts has stalenessClock + eodStalenessCheck)
    await driver.get(`${TEST_CONFIG.frontendUrl}/trading_accounts.html`);
    await driver.sleep(6000); // Wait for eodStalenessCheck (500ms) + API + clock render

    // Ensure clock exists — inject via updateStalenessClock if needed (creates element)
    const clockExists = await driver.executeScript(`
      if (window.updateStalenessClock) {
        window.updateStalenessClock('ok');
        return !!document.getElementById('staleness-clock');
      }
      return false;
    `);

    if (!clockExists) {
      results.E1_ok_neutral.status = 'FAIL';
      results.E1_ok_neutral.note = 'stalenessClock לא נטען או לא קיים בעמוד';
      results.E2_warning.status = 'SKIP';
      results.E2_warning.note = 'תלוי ב-E1';
      results.E3_na.status = 'SKIP';
      results.E3_na.note = 'תלוי ב-E1';
      results.E4_no_banner.status = 'SKIP';
      results.E4_no_banner.note = 'תלוי בטעינת עמוד';
      await driver.quit();
      return results;
    }

    // === E1: staleness=ok → neutral clock + tooltip ===
    await setStalenessState(driver, 'ok');
    await driver.sleep(300);
    const r1 = await verifyClockState(driver, 'ok');
    results.E1_ok_neutral.status = r1.pass ? 'PASS' : 'FAIL';
    results.E1_ok_neutral.note = r1.message;

    // === E2: staleness=warning → warning color + tooltip ===
    await setStalenessState(driver, 'warning');
    await driver.sleep(300);
    const r2 = await verifyClockState(driver, 'warning');
    results.E2_warning.status = r2.pass ? 'PASS' : 'FAIL';
    results.E2_warning.note = r2.message;

    // === E3: staleness=na → alert color + tooltip ===
    await setStalenessState(driver, 'na');
    await driver.sleep(300);
    const r3 = await verifyClockState(driver, 'na');
    results.E3_na.status = r3.pass ? 'PASS' : 'FAIL';
    results.E3_na.note = r3.message;

    // === E4: No banner ===
    const r4 = await verifyNoBanner(driver);
    results.E4_no_banner.status = r4.pass ? 'PASS' : 'FAIL';
    results.E4_no_banner.note = r4.message;

    await driver.quit();
  } catch (e) {
    logger.error('Suite E', e);
    if (driver) try { await driver.quit(); } catch (_) {}
    Object.keys(results).forEach(k => {
      if (results[k].status === 'SKIP') results[k].status = 'FAIL';
      results[k].note = results[k].note || e.message;
    });
  }

  return results;
}

runSuiteE().then(results => {
  console.log('\n=== External Data — Suite E: Staleness Clock + Tooltip ===\n');
  Object.entries(results).forEach(([k, v]) => {
    logger.log(v.name, v.status, { message: v.note });
  });
  logger.printSummary();
  const failed = Object.values(results).filter(v => v.status === 'FAIL').length;
  process.exit(failed > 0 ? 1 : 0);
});
