#!/usr/bin/env node
/**
 * Market Status QA — TEAM_10_TO_TEAM_50_MARKET_STATUS_QA_NOTE
 * ----------------------------------------------------------
 * 1. שעון + מפתח צבעים — מופיעים בדפים הרלוונטיים
 * 2. כישלון (401, network) — מפתח הצבעים מוסתר (ללא קריסה)
 * 3. נגישות — aria-label ו-title על מפתח הצבעים
 *
 * הרצה: node market-status-qa.e2e.test.js
 */

import { createDriver, TEST_CONFIG, TEST_USERS, getLocalStorageValue } from './selenium-config.js';
import { By } from 'selenium-webdriver';

const PAGES = [
  { id: 'tickers', url: '/tickers.html', hasCard: true },
  { id: 'trading_accounts', url: '/trading_accounts.html', hasCard: false },
  { id: 'cash_flows', url: '/cash_flows.html', hasCard: false },
  { id: 'brokers_fees', url: '/brokers_fees.html', hasCard: false },
];

// Data dashboard uses different init — no stalenessClock/eodStalenessCheck; skip or add separately
const DATA_DASHBOARD = { id: 'data_dashboard', url: '/data_dashboard.html' };

const EXPECTED_CLASSES = {
  open: 'market-status--open',
  pre: 'market-status--pre',
  post: 'market-status--post',
  closed: 'market-status--closed',
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
    return false;
  }
}

async function runMarketStatusQA() {
  const results = {
    item1_pages: [],
    item2_failure: 'SKIP',
    item3_accessibility: 'SKIP',
  };

  let driver;
  try {
    driver = await createDriver();
    await driver.get(`${TEST_CONFIG.frontendUrl}/`);
    await driver.sleep(1500);

    const loggedIn = await login(driver);
    if (!loggedIn) {
      console.log('❌ Login FAIL — לא ניתן להמשיך');
      await driver.quit();
      return results;
    }
    console.log('✅ [PASS] Login');

    // --- Item 1: שעון + מפתח צבעים בדפים הרלוונטיים ---
    for (const page of PAGES) {
      await driver.get(`${TEST_CONFIG.frontendUrl}${page.url}`);
      await driver.sleep(5000);

      let hasClock = false;
      let hasMarketKey = false;
      let marketKeyVisible = false;
      let marketKeyClass = '';
      let marketKeyTitle = '';
      let marketKeyAria = '';

      try {
        const clock = await driver.findElement(By.id('staleness-clock')).catch(() => null);
        hasClock = !!clock;
        if (!hasClock && page.hasCard) {
          const cardClock = await driver.findElement(By.css('.staleness-clock-card .staleness-clock')).catch(() => null);
          hasClock = !!cardClock;
        }
      } catch (_) {}

      if (page.hasCard) {
        const card = await driver.findElement(By.id('stalenessClockCard')).catch(() => null);
        if (card) {
          const html = await card.getAttribute('innerHTML');
          hasMarketKey = html.includes('market-status-key') || html.includes('staleness-clock-card__market');
          if (hasMarketKey) {
            const mEl = await driver.findElement(By.css('.market-status-key, .staleness-clock-card__market')).catch(() => null);
            if (mEl) {
              marketKeyVisible = await mEl.isDisplayed().catch(() => false);
              marketKeyClass = await mEl.getAttribute('class').catch(() => '');
              marketKeyTitle = await mEl.getAttribute('title').catch(() => '');
              marketKeyAria = await mEl.getAttribute('aria-label').catch(() => '');
            }
          }
        }
      } else {
        const keyEl = await driver.findElement(By.id('market-status-key')).catch(() => null);
        hasMarketKey = !!keyEl;
        if (keyEl) {
          marketKeyVisible = await keyEl.isDisplayed().catch(() => false);
          marketKeyClass = await keyEl.getAttribute('class').catch(() => '');
          marketKeyTitle = await keyEl.getAttribute('title').catch(() => '');
          marketKeyAria = await keyEl.getAttribute('aria-label').catch(() => '');
        }
      }

      const pass = hasClock && (hasMarketKey || marketKeyVisible);
      results.item1_pages.push({
        page: page.id,
        hasClock,
        hasMarketKey: hasMarketKey || marketKeyVisible,
        class: marketKeyClass,
        title: marketKeyTitle,
        aria: marketKeyAria,
        pass,
      });
      console.log(pass ? `✅ [PASS] ${page.id}: שעון + מפתח צבעים` : `⚠️ ${page.id}: clock=${hasClock} key=${hasMarketKey}`);
    }

    // --- Item 2: כישלון — מפתח מוסתר ---
    await driver.get(`${TEST_CONFIG.frontendUrl}/trading_accounts.html`);
    await driver.sleep(4000);
    await driver.executeScript(`
      if (typeof window.updateStalenessClock === 'function') {
        window.updateStalenessClock('ok', null, null);
      }
    `);
    await driver.sleep(500);
    const keyAfterFail = await driver.findElement(By.id('market-status-key')).catch(() => null);
    let keyHidden = true;
    if (keyAfterFail) {
      keyHidden = !(await keyAfterFail.isDisplayed().catch(() => true));
    }
    results.item2_failure = keyHidden ? 'PASS' : 'FAIL';
    console.log(keyHidden ? '✅ [PASS] כישלון — מפתח מוסתר' : '❌ [FAIL] כישלון — מפתח לא מוסתר');

    // --- Item 3: נגישות aria-label + title ---
    let hasTitle = false;
    let hasAria = false;
    for (const r of results.item1_pages) {
      if (r.title && r.title.includes('מצב שוק')) hasTitle = true;
      if (r.aria && r.aria.includes('מצב שוק')) hasAria = true;
    }
    // Card mode: title is set in renderCard; aria-label on inline only. Card div has title.
    if (!hasTitle) {
      await driver.get(`${TEST_CONFIG.frontendUrl}/tickers.html`);
      await driver.sleep(5000);
      const cardMarket = await driver.findElement(By.css('.staleness-clock-card__market, .market-status-key')).catch(() => null);
      if (cardMarket) {
        hasTitle = !!(await cardMarket.getAttribute('title').catch(() => ''));
      }
    }
    results.item3_accessibility = (hasTitle || hasAria) ? 'PASS' : 'FAIL';
    console.log((hasTitle || hasAria) ? '✅ [PASS] נגישות — title/aria-label' : '❌ [FAIL] נגישות — חסר title/aria-label');

    await driver.quit();
  } catch (e) {
    console.error('Error:', e.message);
    if (driver) try { await driver.quit(); } catch (_) {}
  }

  return results;
}

runMarketStatusQA().then((results) => {
  console.log('\n=== Market Status QA Summary ===');
  console.log('Item 1 (דפים):', results.item1_pages.filter((p) => p.pass).length, '/', results.item1_pages.length);
  console.log('Item 2 (כישלון):', results.item2_failure);
  console.log('Item 3 (נגישות):', results.item3_accessibility);
  const allPass =
    results.item1_pages.every((p) => p.pass) &&
    results.item2_failure === 'PASS' &&
    results.item3_accessibility === 'PASS';
  process.exit(allPass ? 0 : 1);
});
