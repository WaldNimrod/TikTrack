#!/usr/bin/env node
/**
 * AUTO-WP003 Runtime Assertions — S002-P002-WP003 Phase 2
 * TEAM_10_TO_TEAM_50_S002_P002_WP003_PHASE2_RUNTIME_MANDATE_v1.0.0
 *
 * 4 Assertions (post Team 20 B2 — TASE agorot fix):
 * 1. price_source non-null for active tickers
 * 2. TEVA.TA shekel range (current_price < 200)
 * 3. market_cap non-null for ANAU.MI, BTC-USD, TEVA.TA (3/3)
 * 4. Actions menu stability — hover 200ms → visible; Escape closes
 *
 * Dependency: Run after Team 20 B2 (TASE fix).
 */

import http from 'http';
import https from 'https';
import { createDriver, TEST_USERS, getLocalStorageValue, TestLogger } from './selenium-config.js';
import { By } from 'selenium-webdriver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACTS_DIR = path.join(__dirname, '..', 'documentation', '05-REPORTS', 'artifacts');
if (!fs.existsSync(ARTIFACTS_DIR)) fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

const BACKEND = process.env.BACKEND_URL || process.env.PHASE2_BACKEND_URL || 'http://127.0.0.1:8082';
const FRONTEND = process.env.FRONTEND_URL || process.env.PHASE2_FRONTEND_URL || 'http://127.0.0.1:8080';

const logger = new TestLogger();
const results = { passed: 0, failed: 0, skipped: 0 };

const REQ_TIMEOUT_MS = 25000; // data-integrity can be slow (indicators/250d)

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    const req = protocol.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        clearTimeout(timer);
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, data });
        }
      });
    });
    const timer = setTimeout(() => {
      req.destroy();
      reject(new Error(`Request timeout ${url}`));
    }, options.timeout ?? REQ_TIMEOUT_MS);
    req.on('error', (e) => {
      clearTimeout(timer);
      reject(e);
    });
    if (options.body) req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    req.end();
  });
}

function logResult(name, pass, msg = '') {
  if (pass) {
    logger.log(name, 'PASS', { message: msg });
    results.passed++;
  } else {
    logger.log(name, 'FAIL', { message: msg });
    results.failed++;
  }
}

async function getToken() {
  const res = await makeRequest(`${BACKEND}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: {
      username_or_email: process.env.PHASE2_TEST_USERNAME || 'TikTrackAdmin',
      password: process.env.PHASE2_TEST_PASSWORD || '4181',
    },
  });
  return res.status === 200 && res.data && res.data.access_token ? res.data.access_token : null;
}

/** Assertion 1: price_source non-null for active tickers */
async function assertion1_priceSource(token) {
  const res = await makeRequest(`${BACKEND}/api/v1/tickers?is_active=true`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status !== 200) {
    logResult('AUTO-WP003-1_price_source', false, `GET /tickers ${res.status}`);
    return;
  }
  const tickers = res.data?.data ?? res.data ?? [];
  const activeCount = tickers.length;
  const nullSource = tickers.filter((t) => t.price_source == null && t.priceSource == null);
  const pass = activeCount > 0 && nullSource.length === 0;
  logResult(
    'AUTO-WP003-1_price_source',
    pass,
    pass
      ? `${activeCount} active tickers with non-null price_source`
      : `${nullSource.length}/${activeCount} tickers with null price_source`
  );
}

/** Assertion 2: TEVA.TA shekel range (current_price < 200) */
async function assertion2_tevaShekelRange(token) {
  const res = await makeRequest(`${BACKEND}/api/v1/tickers`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status !== 200) {
    logResult('AUTO-WP003-2_TEVA_shekel', false, `GET /tickers ${res.status}`);
    return;
  }
  const tickers = res.data?.data ?? res.data ?? [];
  const teva = tickers.find((t) => (t.symbol || '').toUpperCase() === 'TEVA.TA');
  if (!teva) {
    logResult('AUTO-WP003-2_TEVA_shekel', false, 'TEVA.TA not found in tickers');
    return;
  }
  const price = teva.current_price ?? teva.currentPrice ?? null;
  const pass = price != null && Number(price) < 200;
  logResult('AUTO-WP003-2_TEVA_shekel', pass, `TEVA.TA current_price=${price} (expect < 200)`);
}

/** Assertion 3: market_cap non-null for ANAU.MI, BTC-USD, TEVA.TA (3/3 — via data-integrity) */
async function assertion3_marketCap(token) {
  const symbols = ['ANAU.MI', 'BTC-USD', 'TEVA.TA'];
  const listRes = await makeRequest(`${BACKEND}/api/v1/tickers`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (listRes.status !== 200) {
    logResult('AUTO-WP003-3_market_cap', false, `GET /tickers ${listRes.status}`);
    return;
  }
  const tickers = listRes.data?.data ?? listRes.data ?? [];
  const bySymbol = Object.fromEntries(tickers.map((t) => [(t.symbol || '').toUpperCase(), t]));
  const missing = symbols.filter((s) => !bySymbol[s]);
  if (missing.length > 0) {
    logResult('AUTO-WP003-3_market_cap', false, `Missing tickers: ${missing.join(', ')}`);
    return;
  }
  const tickerIds = symbols.map((s) => {
    const t = bySymbol[s];
    return [s, t?.id ?? t?.external_id ?? null];
  });
  const diPromises = tickerIds
    .filter(([, id]) => id)
    .map(async ([s, tickerId]) => {
      try {
        const diRes = await makeRequest(`${BACKEND}/api/v1/tickers/${tickerId}/data-integrity`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
          timeout: 20000,
        });
        const mc = diRes.status === 200 ? (diRes.data?.indicators?.market_cap ?? diRes.data?.indicators?.marketCap ?? null) : null;
        return [s, mc];
      } catch {
        return [s, null];
      }
    });
  const outcomes = await Promise.all(diPromises);
  const nulls = outcomes.filter(([, mc]) => mc == null || mc === '').map(([s]) => s);
  const missingIds = tickerIds.filter(([, id]) => !id).map(([s]) => s);
  if (missingIds.length > 0) nulls.push(...missingIds);
  const pass = nulls.length === 0;
  logResult(
    'AUTO-WP003-3_market_cap',
    pass,
    pass
      ? `3/3 market_cap non-null (ANAU.MI, BTC-USD, TEVA.TA)`
      : `market_cap null for: ${nulls.join(', ')}`
  );
}

/** Assertion 4: Actions menu — hover 200ms → visible; Escape closes */
async function runAssertion4() {
  let driver;
  try {
    driver = await createDriver();
    await driver.get(`${FRONTEND}/`);
    await driver.sleep(2000);

    let token = await getLocalStorageValue(driver, 'access_token');
    if (!token) {
      await driver.get(`${FRONTEND}/login`);
      await driver.sleep(1500);
      const userInput = await driver.findElement(By.css('input[name="usernameOrEmail"], input[name="username"]')).catch(() => null);
      if (!userInput) {
        logResult('AUTO-WP003-4_actions_menu', false, 'Login page not ready');
        return;
      }
      await userInput.sendKeys(TEST_USERS.admin.username);
      await driver.findElement(By.css('input[name="password"]')).sendKeys(TEST_USERS.admin.password);
      await driver.findElement(By.css('button[type="submit"]')).click();
      await driver.sleep(3500);
    }

    await driver.get(`${FRONTEND}/tickers.html`);
    await driver.sleep(5000);

    const rows = await driver.findElements(By.css('#tickersTableBody tr.phoenix-table__row, .phoenix-table tbody tr.phoenix-table__row'));
    if (rows.length === 0) {
      logResult('AUTO-WP003-4_actions_menu', false, 'No ticker rows');
      return;
    }

    const firstRow = rows[0];
    const trigger = await firstRow.findElement(By.css('.table-actions-trigger')).catch(() => null);
    const action = driver.actions({ async: true });
    // Hover row first to ensure handlers are active, then trigger (HOVER_DELAY_MS=150)
    await action.move({ origin: firstRow }).pause(200).move({ origin: trigger || firstRow }).pause(250).perform();
    await driver.sleep(200);

    const menu = await driver.findElement(By.css('.table-actions-menu')).catch(() => null);
    // Menu visible when opacity>0 and visibility visible (not hidden)
    const visible = menu ? await driver.executeScript(`
      const m = arguments[0];
      if (!m) return false;
      const s = window.getComputedStyle(m);
      return s.visibility !== 'hidden' && parseFloat(s.opacity) > 0;
    `, menu) : false;
    if (!visible) {
      logResult('AUTO-WP003-4_actions_menu', false, 'Menu not visible after hover');
      return;
    }

    // Send Escape to document (UI listens on document keydown)
    await driver.executeScript(`
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', keyCode: 27, bubbles: true }));
    `);
    await driver.sleep(300);

    // Check via JS: menus should have visibility:hidden or opacity:0 after Escape
    const anyStillVisible = await driver.executeScript(`
      const menus = document.querySelectorAll('.table-actions-menu');
      return Array.from(menus).some(m => {
        const s = window.getComputedStyle(m);
        return s.visibility !== 'hidden' && parseFloat(s.opacity) > 0;
      });
    `);
    const closed = !anyStillVisible;
    logResult('AUTO-WP003-4_actions_menu', closed, closed ? 'Hover 200ms+ → visible; Escape closes' : 'Menu still visible after Escape');
  } catch (err) {
    logResult('AUTO-WP003-4_actions_menu', false, (err && err.message) || String(err));
  } finally {
    if (driver) await driver.quit();
  }
}

async function runAll() {
  console.log('AUTO-WP003 Phase 2 Runtime Assertions (4)');
  console.log('='.repeat(50));

  const token = await getToken();
  if (!token) {
    logger.log('Login', 'FAIL', { message: 'Admin login failed — run seed, start backend' });
    results.failed++;
    const out = { results, passed: results.passed, failed: results.failed, timestamp: new Date().toISOString() };
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'TEAM_50_AUTO_WP003_RUNTIME_RESULTS.json'), JSON.stringify(out, null, 2));
    process.exit(1);
  }

  await assertion1_priceSource(token);
  await assertion2_tevaShekelRange(token);
  await assertion3_marketCap(token);

  const runE2E = process.env.AUTO_WP003_SKIP_E2E !== '1';
  if (runE2E) {
    await runAssertion4();
  } else {
    logger.log('AUTO-WP003-4_actions_menu', 'SKIP', { message: 'AUTO_WP003_SKIP_E2E=1' });
    results.skipped++;
  }

  logger.printSummary();
  const out = {
    results: { passed: results.passed, failed: results.failed, skipped: results.skipped },
    assertions: ['price_source', 'TEVA_shekel', 'market_cap', 'actions_menu'],
    timestamp: new Date().toISOString(),
    work_package_id: 'S002-P002-WP003',
  };
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'TEAM_50_AUTO_WP003_RUNTIME_RESULTS.json'), JSON.stringify(out, null, 2));
  console.log(`\nArtifacts: ${path.join(ARTIFACTS_DIR, 'TEAM_50_AUTO_WP003_RUNTIME_RESULTS.json')}`);

  process.exit(results.failed > 0 ? 1 : 0);
}

runAll().catch((e) => {
  console.error(e);
  process.exit(1);
});
