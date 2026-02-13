#!/usr/bin/env node
/**
 * External Data — Suite E: UI (Clock + Tooltip)
 * TEAM_10_TO_TEAM_30_EXTERNAL_DATA_AUTOMATED_TESTING_MANDATE
 * TEAM_90_TO_TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_DIRECTIVE
 *
 * Verifies:
 * - staleness=ok → neutral clock (staleness-clock--ok)
 * - staleness=warning → warning color + tooltip
 * - staleness=na → alert color + tooltip
 * - No banner (eod-warning-banner must not be visible)
 *
 * Pages with staleness clock: trading_accounts, brokers_fees, cash_flows
 * Run: npm run test:external-data-suite-e (from tests/) or node external-data-suite-e-staleness-clock.test.js
 */

import { createDriver, TEST_CONFIG, TEST_USERS, getLocalStorageValue, TestLogger } from './selenium-config.js';
import { By } from 'selenium-webdriver';

const logger = new TestLogger();

// Tooltips from stalenessClock.js (SSOT)
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
 * Ensure clock exists and is ready for programmatic updates.
 * StalenessClock injects into #summaryStats/.info-summary; eodStalenessCheck runs after 500ms.
 */
async function ensureClockReady(driver) {
  // If clock doesn't exist yet, trigger it via updateStalenessClock (stalenessClock.js exposes it)
  const clockExists = await driver.executeScript(`
    if (typeof window.updateStalenessClock === 'function') {
      window.updateStalenessClock('ok');
      return !!document.getElementById('staleness-clock');
    }
    return false;
  `);
  return clockExists;
}

async function runSuiteE() {
  const criteria = {
    suiteE_clock_ok: { name: 'Suite E: staleness=ok → neutral clock + tooltip', status: 'SKIP' },
    suiteE_clock_warning: { name: 'Suite E: staleness=warning → warning color + tooltip', status: 'SKIP' },
    suiteE_clock_na: { name: 'Suite E: staleness=na → alert color + tooltip', status: 'SKIP' },
    suiteE_no_banner: { name: 'Suite E: No banner (per spec)', status: 'SKIP' },
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

    // Navigate to page with staleness clock (trading_accounts has #summaryStats + stalenessClock + eodStalenessCheck)
    await driver.get(`${TEST_CONFIG.frontendUrl}/trading_accounts.html`);
    await driver.sleep(3500); // Wait for eodStalenessCheck (500ms) + API + DOM

    const clockReady = await ensureClockReady(driver);
    if (!clockReady) {
      criteria.suiteE_clock_ok.note = 'שעון סטגנציה לא זמין (stalenessClock.js / updateStalenessClock חסר)';
      criteria.suiteE_clock_ok.status = 'FAIL';
      criteria.suiteE_clock_warning.status = 'SKIP';
      criteria.suiteE_clock_na.status = 'SKIP';
    } else {
      // === 1. staleness=ok ===
      await driver.executeScript("window.updateStalenessClock && window.updateStalenessClock('ok');");
      await driver.sleep(300);

      const okState = await driver.executeScript(
        `const el = document.getElementById('staleness-clock');
        if (!el) return { hasClass: false, hasTooltip: false, className: '', title: '' };
        const className = el.getAttribute('class') || '';
        const title = el.getAttribute('title') || '';
        const hasClass = className.includes('staleness-clock--ok');
        const hasTooltip = title && title.length > 0 && (title.includes('מעודכנים') || (arguments[0] && title.includes(arguments[0])));
        return { hasClass, hasTooltip, className, title };`,
        EXPECTED_TOOLTIPS.ok
      );

      criteria.suiteE_clock_ok.status = okState.hasClass && okState.hasTooltip ? 'PASS' : 'FAIL';
      criteria.suiteE_clock_ok.note = okState.hasClass && okState.hasTooltip
        ? `שעון ניטרלי: ${okState.className} | tooltip: ${okState.title?.substring(0, 40)}...`
        : `חסר: hasClass=${okState.hasClass} hasTooltip=${okState.hasTooltip} class=${okState.className}`;

      // === 2. staleness=warning ===
      await driver.executeScript("window.updateStalenessClock && window.updateStalenessClock('warning');");
      await driver.sleep(300);

      const warningState = await driver.executeScript(
        `const el = document.getElementById('staleness-clock');
        if (!el) return { hasClass: false, hasTooltip: false };
        const className = el.getAttribute('class') || '';
        const title = el.getAttribute('title') || '';
        const hasClass = className.includes('staleness-clock--warning');
        const hasTooltip = title && (title.includes('15') || title.includes('דקות') || title.includes('אזהרה'));
        return { hasClass, hasTooltip };`
      );

      criteria.suiteE_clock_warning.status = warningState.hasClass && warningState.hasTooltip ? 'PASS' : 'FAIL';
      criteria.suiteE_clock_warning.note = warningState.hasClass && warningState.hasTooltip
        ? 'צבע אזהרה + tooltip מוצגים'
        : `חסר: hasClass=${warningState.hasClass} hasTooltip=${warningState.hasTooltip}`;

      // === 3. staleness=na ===
      await driver.executeScript("window.updateStalenessClock && window.updateStalenessClock('na');");
      await driver.sleep(300);

      const naState = await driver.executeScript(
        `const el = document.getElementById('staleness-clock');
        if (!el) return { hasClass: false, hasTooltip: false };
        const className = el.getAttribute('class') || '';
        const title = el.getAttribute('title') || '';
        const hasClass = className.includes('staleness-clock--na');
        const hasTooltip = title && (title.includes('EOD') || title.includes('סוף יום') || title.includes('לא מעודכנים'));
        return { hasClass, hasTooltip };`
      );

      criteria.suiteE_clock_na.status = naState.hasClass && naState.hasTooltip ? 'PASS' : 'FAIL';
      criteria.suiteE_clock_na.note = naState.hasClass && naState.hasTooltip
        ? 'צבע alert + tooltip EOD מוצגים'
        : `חסר: hasClass=${naState.hasClass} hasTooltip=${naState.hasTooltip}`;
    }

    // === 4. No banner (per spec: "No banner") ===
    const bannerCheck = await driver.executeScript(`
      const banner = document.getElementById('eod-warning-banner');
      if (!banner) return { noBanner: true, hidden: true };
      const className = banner.getAttribute('class') || '';
      const hidden = className.includes('eod-warning-banner--hidden');
      const style = window.getComputedStyle(banner);
      const displayNone = style.display === 'none';
      return { noBanner: false, hidden, displayNone };
    `);

    // Pass if: no banner element, or banner is hidden
    const noBannerVisible = bannerCheck.noBanner || bannerCheck.hidden || bannerCheck.displayNone;
    criteria.suiteE_no_banner.status = noBannerVisible ? 'PASS' : 'FAIL';
    criteria.suiteE_no_banner.note = noBannerVisible
      ? 'אין באנר גלוי (per spec)'
      : 'באנר מוצג — אסור לפי האפיון';

    await driver.quit();
  } catch (e) {
    logger.error('Suite E', e);
    if (driver) try { await driver.quit(); } catch (_) {}
    Object.keys(criteria).forEach(k => {
      if (criteria[k].status === 'SKIP') criteria[k].status = 'FAIL';
      if (!criteria[k].note) criteria[k].note = e.message;
    });
  }

  return criteria;
}

runSuiteE().then(criteria => {
  console.log('\n=== External Data — Suite E (Clock + Tooltip) Results ===\n');
  Object.entries(criteria).forEach(([k, v]) => {
    logger.log(v.name, v.status, { message: v.note });
  });
  logger.printSummary();
  const failed = Object.values(criteria).filter(v => v.status === 'FAIL').length;
  process.exit(failed > 0 ? 1 : 0);
});
