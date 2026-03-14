#!/usr/bin/env node
/**
 * External Data — Live UI Evidence Capture
 * TEAM_10_TO_TEAM_30_EXTERNAL_DATA_LIVE_UI_EXECUTION_MANDATE
 *
 * Captures screenshots + staleness clock + ticker prices for Evidence doc.
 * Output: _COMMUNICATION/team_30/TEAM_30_EXTERNAL_DATA_LIVE_UI_EVIDENCE.md
 *         + screenshots in documentation/reports/05-REPORTS/artifacts/external-data-live-ui/
 *
 * Run: cd tests && node external-data-live-ui-evidence-capture.e2e.test.js
 * Requires: Frontend 8080, Backend 8082, DB with tickers + sync data
 */

import { createDriver, TEST_CONFIG, TEST_USERS, getLocalStorageValue } from './selenium-config.js';
import { By } from 'selenium-webdriver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTIFACTS_DIR = path.join(__dirname, '..', 'documentation', 'reports', '05-REPORTS', 'artifacts', 'external-data-live-ui');
const EVIDENCE_PATH = path.join(__dirname, '..', '_COMMUNICATION', 'team_30', 'TEAM_30_EXTERNAL_DATA_LIVE_UI_EVIDENCE.md');

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
    return !!(await getLocalStorageValue(driver, 'access_token'));
  } catch (_) {
    return false;
  }
}

function ensureArtifactsDir() {
  if (!fs.existsSync(ARTIFACTS_DIR)) {
    fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
  }
}

async function captureEvidence() {
  const evidence = {
    timestamp: new Date().toISOString(),
    tickers: [],
    stalenessClock: null,
    screenshots: [],
    tradingAccounts: null,
    success: false,
  };

  let driver;
  try {
    driver = await createDriver();
    await driver.get(`${TEST_CONFIG.frontendUrl}/`);
    await driver.sleep(1500);

    if (!(await login(driver))) {
      console.error('❌ Login failed — cannot capture evidence');
      return evidence;
    }
    console.log('✅ Login OK');

    ensureArtifactsDir();
    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    // === 1. Tickers page — 3 tickers with live prices ===
    await driver.get(`${TEST_CONFIG.frontendUrl}/tickers.html`);
    await driver.sleep(5000);

    const tickersData = await driver.executeScript(`
      const rows = document.querySelectorAll('#tickersTableBody tr.phoenix-table__row');
      const out = [];
      rows.forEach((r, i) => {
        if (i >= 5) return;
        const symbol = r.querySelector('.col-symbol')?.textContent?.trim();
        const priceCell = r.querySelector('.col-price');
        const priceText = priceCell?.textContent?.trim();
        const price = priceText && priceText !== '—' ? parseFloat(priceText.replace(/[^0-9.-]/g, '')) : null;
        if (symbol) out.push({ symbol, price, priceText });
      });
      return out;
    `);
    evidence.tickers = tickersData || [];

    const tickersScreenshot = path.join(ARTIFACTS_DIR, `tickers-${ts}.png`);
    await driver.takeScreenshot().then((data) => fs.writeFileSync(tickersScreenshot, Buffer.from(data, 'base64')));
    evidence.screenshots.push({ page: 'tickers', file: path.basename(tickersScreenshot) });

    // === 2. Trading Accounts — staleness clock + positions ===
    await driver.get(`${TEST_CONFIG.frontendUrl}/trading_accounts.html`);
    await driver.sleep(5000);

    evidence.stalenessClock = await driver.executeScript(`
      const el = document.getElementById('staleness-clock');
      if (!el) return { found: false };
      return {
        found: true,
        className: el.className || '',
        title: el.title || '',
        staleness: el.className?.match(/staleness-clock--(ok|warning|na)/)?.[1] || 'unknown',
      };
    `);

    const positionsData = await driver.executeScript(`
      const rows = document.querySelectorAll('#positionsTable tbody tr.phoenix-table__row');
      const out = [];
      rows.forEach((r, i) => {
        if (i >= 5) return;
        const symbol = r.querySelector('.col-symbol')?.textContent?.trim();
        const priceCell = r.querySelector('.col-current_price');
        const priceText = priceCell?.textContent?.trim();
        const price = priceText && priceText !== '—' ? parseFloat(priceText.replace(/[^0-9.-]/g, '')) : null;
        if (symbol) out.push({ symbol, price, priceText });
      });
      return out;
    `);
    evidence.tradingAccounts = { positions: positionsData || [] };

    const tradingScreenshot = path.join(ARTIFACTS_DIR, `trading_accounts-${ts}.png`);
    await driver.takeScreenshot().then((data) => fs.writeFileSync(tradingScreenshot, Buffer.from(data, 'base64')));
    evidence.screenshots.push({ page: 'trading_accounts', file: path.basename(tradingScreenshot) });

    evidence.success = true;
    await driver.quit();
  } catch (e) {
    console.error('Capture error:', e.message);
    if (driver) try { await driver.quit(); } catch (_) {}
  }

  return evidence;
}

function writeEvidenceMarkdown(evidence) {
  const tickersTable =
    evidence.tickers?.length > 0
      ? evidence.tickers
          .map((t) => `| ${t.symbol} | ${t.priceText ?? '—'} | ${t.price ?? '—'} |`)
          .join('\n')
      : '| — | אין נתונים | — |';

  const positionsTable =
    evidence.tradingAccounts?.positions?.length > 0
      ? evidence.tradingAccounts.positions
          .map((p) => `| ${p.symbol} | ${p.priceText ?? '—'} | ${p.price ?? '—'} |`)
          .join('\n')
      : '| — | אין פוזיציות | — |';

  const clockStatus = evidence.stalenessClock?.found
    ? `${evidence.stalenessClock.staleness} (${evidence.stalenessClock.title})`
    : 'לא נמצא';

  const screenshotRefs = evidence.screenshots
    ?.map((s) => `- \`${s.file}\` (${s.page})`)
    .join('\n') || '- אין צילומי מסך';

  const md = `# Team 30 → Team 10: External Data — Live UI Evidence

**from:** Team 30 (UI)  
**to:** Team 10 (The Gateway)  
**date:** ${new Date().toISOString().split('T')[0]}  
**מקור:** TEAM_10_TO_TEAM_30_EXTERNAL_DATA_LIVE_UI_EXECUTION_MANDATE  
**סטטוס:** ${evidence.success ? '✅ הושלם' : '⚠️ חלקי'}

---

## 1. Timestamp

\`${evidence.timestamp}\`

---

## 2. טיקרים עם מחירים חיים (עמוד ניהול טיקרים)

| סימבול | מחיר (ממשק) | ערך |
|--------|-------------|-----|
${tickersTable}

---

## 3. פוזיציות עם מחירים (חשבונות מסחר)

| סימבול | מחיר | ערך |
|--------|------|-----|
${positionsTable}

---

## 4. שעון סטגנציה (Clock + Tooltip)

| שדה | ערך |
|-----|-----|
| **סטטוס** | ${clockStatus} |
| **מחלקה** | \`${evidence.stalenessClock?.className ?? '—'}\` |
| **Tooltip** | ${evidence.stalenessClock?.title ?? '—'} |

---

## 5. צילומי מסך

${screenshotRefs}

**נתיב:** \`documentation/05-REPORTS/artifacts/external-data-live-ui/\`

---

## 6. קריטריוני הצלחה

| קריטריון | סטטוס |
|----------|--------|
| UI מציג 3 טיקרים עם מחירים חיים | ${(evidence.tickers?.length >= 3 || evidence.tradingAccounts?.positions?.length >= 3) ? '✅' : '⚠️'} |
| Clock + tooltip מאומתים | ${evidence.stalenessClock?.found ? '✅' : '❌'} |
| צילומי מסך + timestamps | ${evidence.screenshots?.length > 0 ? '✅' : '❌'} |

---

**log_entry | TEAM_30 | EXTERNAL_DATA_LIVE_UI_EVIDENCE | ${evidence.timestamp}**
`;

  fs.writeFileSync(EVIDENCE_PATH, md, 'utf-8');
  console.log('✅ Evidence written:', EVIDENCE_PATH);
}

captureEvidence().then((evidence) => {
  writeEvidenceMarkdown(evidence);
  console.log('\n=== Live UI Evidence Capture Complete ===');
  console.log('Tickers with prices:', evidence.tickers?.length ?? 0);
  console.log('Positions:', evidence.tradingAccounts?.positions?.length ?? 0);
  console.log('Staleness clock:', evidence.stalenessClock?.staleness ?? 'N/A');
  process.exit(evidence.success ? 0 : 1);
});
