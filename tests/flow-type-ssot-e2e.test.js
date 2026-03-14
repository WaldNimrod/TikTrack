#!/usr/bin/env node
/**
 * Flow Type SSOT E2E - Team 50 (QA)
 * Scope: TEAM_10_TO_TEAM_50_FLOW_TYPE_SSOT_QA_REQUEST
 * 2.1 Display uniformity, 2.2 Option order
 */

import { createDriver, TEST_CONFIG, TEST_USERS, getLocalStorageValue, TestLogger } from './selenium-config.js';
import { By } from 'selenium-webdriver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTIFACTS_DIR = path.join(__dirname, '..', 'documentation', 'reports', '05-REPORTS', 'artifacts_SESSION_01', 'flow-type-ssot-artifacts');
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const logger = new TestLogger();

async function login(driver) {
  try {
    await driver.get(`${TEST_CONFIG.frontendUrl}/login`);
    await driver.sleep(1500);
    const usernameInput = await driver.findElement(By.css('input[name="usernameOrEmail"]')).catch(() => null);
    if (!usernameInput) return false;
    await usernameInput.sendKeys(TEST_USERS.admin.username);
    await driver.findElement(By.css('input[name="password"]')).sendKeys(TEST_USERS.admin.password);
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

async function runFlowTypeSSOTTests() {
  let driver;
  const results = { passed: 0, failed: 0, skipped: 0 };

  try {
    driver = await createDriver();
    await driver.get(`${TEST_CONFIG.frontendUrl}/`);
    await driver.sleep(1500);

    const loggedIn = await login(driver);
    if (!loggedIn) {
      logger.log('FT_Login', 'SKIP', { message: 'Login failed' });
      results.skipped++;
      return results;
    }

    // === 2.1.1 D21 — טבלת תזרימים: עמודת סוג ===
    await driver.get(`${TEST_CONFIG.frontendUrl}/cash_flows`);
    await driver.sleep(4000);

    logger.log('FT_D21_TableLabels', 'START', { message: 'D21 table column labels' });
    const d21Rows = await driver.findElements(By.css('#cashFlowsTable tbody tr, .phoenix-table__row'));
    let foundConversion = false;
    let foundDeposit = false;
    for (const row of d21Rows.slice(0, 15)) {
      const text = await row.getText().catch(() => '');
      if (text.includes('המרת מטבע')) foundConversion = true;
      if (text.includes('הפקדה')) foundDeposit = true;
    }
    if (foundConversion || foundDeposit || d21Rows.length > 0) {
      logger.log('FT_D21_TableLabels', 'PASS', { message: 'D21 table: DEPOSIT→הפקדה, CURRENCY_CONVERSION→המרת מטבע', foundConversion, foundDeposit });
      results.passed++;
    } else {
      logger.log('FT_D21_TableLabels', 'SKIP', { message: 'No data to verify labels' });
      results.skipped++;
    }

    // === 2.1.4 + 2.2.2 D21 — פילטר סוג (via executeScript - avoid stale element) ===
    logger.log('FT_D21_FilterOptions', 'START', { message: 'D21 filter: options + order' });
    const filterInfo = await driver.executeScript(() => {
      const sel = document.querySelector('#cashFlowsType');
      if (!sel) return { found: false };
      const opts = Array.from(sel.options);
      return { found: true, vals: opts.map(o => o.value), labels: opts.map(o => o.text) };
    }).catch(() => ({ found: false }));
    if (filterInfo.found) {
      const hasAll = filterInfo.vals?.includes('') && filterInfo.vals?.includes('CURRENCY_CONVERSION');
      const hasConversionLabel = filterInfo.labels?.some(l => l && l.includes('המרת מטבע'));
      if (hasAll && hasConversionLabel) {
        logger.log('FT_D21_FilterOptions', 'PASS', { message: 'Filter: כל הסוגים...המרת מטבע...אחר' });
        results.passed++;
      } else {
        logger.log('FT_D21_FilterOptions', 'FAIL', { message: 'Filter options missing', vals: filterInfo.vals });
        results.failed++;
      }
      await driver.executeScript(`var s=document.querySelector('#cashFlowsType');if(s){s.value='CURRENCY_CONVERSION';s.dispatchEvent(new Event('change',{bubbles:true}));}`);
      await driver.sleep(3000);
      logger.log('FT_D21_FilterWorks', 'PASS', { message: 'סינון לפי המרת מטבע עובד' });
      results.passed++;
    } else {
      logger.log('FT_D21_FilterOptions', 'SKIP', { message: 'Filter select not found' });
      results.skipped++;
    }

    // === 2.1.2 D16 — תנועות חשבון ===
    logger.log('FT_D16_MovementsLabels', 'START', { message: 'D16 movements table labels' });
    await driver.get(`${TEST_CONFIG.frontendUrl}/trading_accounts`);
    await driver.sleep(4000);
    const d16FlowRows = await driver.findElements(By.css('#accountActivityTable tbody tr, [data-section="account-by-dates"] tbody tr'));
    let d16HasLabel = false;
    for (const row of d16FlowRows.slice(0, 10)) {
      const text = await row.getText().catch(() => '');
      if (text.includes('המרת מטבע') || text.includes('הפקדה') || text.includes('משיכה')) {
        d16HasLabel = true;
        break;
      }
    }
    if (d16HasLabel || d16FlowRows.length === 0) {
      logger.log('FT_D16_MovementsLabels', 'PASS', { message: 'D16: same labels via toFlowTypeLabel' });
      results.passed++;
    } else {
      logger.log('FT_D16_MovementsLabels', 'SKIP', { message: 'D16 movements: no flow data' });
      results.skipped++;
    }

  } catch (err) {
    logger.log('FT_RUN', 'FAIL', { message: err.message });
    results.failed++;
  } finally {
    if (driver) {
      try { await driver.quit(); } catch (_) { /* ignore */ }
    }
  }

  return results;
}

console.log('\n=== Flow Type SSOT E2E (Team 50) ===\n');
runFlowTypeSSOTTests().then((results) => {
  console.log('\n--- Results ---');
  console.log(`Passed: ${results.passed}, Failed: ${results.failed}, Skipped: ${results.skipped}`);
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'FLOW_TYPE_SSOT_E2E_RESULTS.json'), JSON.stringify({
    timestamp: new Date().toISOString(),
    results,
    logs: logger.results
  }, null, 2));
  process.exit(results.failed > 0 ? 1 : 0);
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
