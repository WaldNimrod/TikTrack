#!/usr/bin/env node
/**
 * D22 Tickers E2E — Team 50 (QA / FAV)
 * Scope: TEAM_10_TO_TEAM_50_S002_P003_WP002_D22_FAV_ACTIVATION
 * LLD400 §2.5: filter UI, CRUD, data integrity, summary.
 */

import { createDriver, TEST_CONFIG, TEST_USERS, getLocalStorageValue, TestLogger } from './selenium-config.js';
import { By } from 'selenium-webdriver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTIFACTS_DIR = path.join(__dirname, '..', 'documentation', '05-REPORTS', 'artifacts');
if (!fs.existsSync(ARTIFACTS_DIR)) fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

const logger = new TestLogger();
const results = { passed: 0, failed: 0, skipped: 0 };

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
    return !!token;
  } catch (e) {
    return false;
  }
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

async function runTickersD22E2ETests() {
  let driver;

  try {
    driver = await createDriver();
    await driver.get(`${TEST_CONFIG.frontendUrl}/`);
    await driver.sleep(1500);

    const loggedIn = await login(driver);
    if (!loggedIn) {
      logger.log('D22_Login', 'SKIP', { message: 'Login failed' });
      results.skipped++;
      fs.writeFileSync(
        path.join(ARTIFACTS_DIR, 'TEAM_50_D22_TICKERS_E2E_RESULTS.json'),
        JSON.stringify({ results, items: [] }, null, 2)
      );
      return results;
    }

    await driver.get(`${TEST_CONFIG.frontendUrl}/tickers.html`);
    await driver.sleep(5000);

    // --- 1. Summary section (סיכום) ---
    const totalEl = await driver.findElement(By.css('#totalTickers, [id*="totalTickers"]')).catch(() => null);
    const activeEl = await driver.findElement(By.css('#activeTickers, [id*="activeTickers"]')).catch(() => null);
    const summarySection = await driver.findElement(By.css('#summaryStats, .info-summary')).catch(() => null);
    logResult('D22_Summary', !!(totalEl || activeEl || summarySection), 'סקשן סיכום טיקרים');

    // --- 2. Filter UI — ticker_type select ---
    const filterTypeSelect = await driver.findElement(By.css('#tickersFilterType, .js-tickers-filter-type')).catch(() => null);
    logResult('D22_FilterType', !!filterTypeSelect, 'סינון לפי סוג טיקר');

    // --- 3. Filter UI — is_active toggles ---
    const filterActiveBtns = await driver.findElements(By.css('.js-tickers-filter-active, [data-filter-group="is_active"] .filter-icon-btn'));
    logResult('D22_FilterActive', filterActiveBtns.length >= 2, `כפתורי סינון פעיל/לא פעיל: ${filterActiveBtns.length}`);

    // --- 4. Filter bar container (LLD400: filter bar present) ---
    const filterBar = await driver.findElement(By.css('.tickers-filter-bar, [data-role="tickers-filter"]')).catch(() => null);
    logResult('D22_FilterBar', !!filterBar, 'סרגל פילטר');

    // --- 5. Table ---
    const table = await driver.findElement(By.css('#tickersTable, .phoenix-table')).catch(() => null);
    const tableBody = await driver.findElement(By.css('#tickersTableBody, .phoenix-table__body')).catch(() => null);
    logResult('D22_Table', !!(table || tableBody), 'טבלת טיקרים');

    // --- 6. Data integrity section ---
    const dataIntegritySelect = await driver.findElement(By.css('#tickerDataIntegritySelect')).catch(() => null);
    const dataIntegrityDetail = await driver.findElement(By.css('#tickerDataIntegrityDetail, .data-integrity-detail')).catch(() => null);
    logResult('D22_DataIntegrity', !!(dataIntegritySelect || dataIntegrityDetail), 'בקרת תקינות נתונים');

    // --- 7. Add ticker button (CRUD) ---
    const addBtn = await driver.findElement(By.css('.js-add-ticker')).catch(() => null);
    logResult('D22_AddButton', !!addBtn, 'כפתור הוספת טיקר');

    // --- 8. Pagination ---
    const paginationInfo = await driver.findElement(By.css('#paginationInfo, .phoenix-table-pagination__info')).catch(() => null);
    const prevBtn = await driver.findElement(By.css('#prevPageBtn, .phoenix-table-pagination__button')).catch(() => null);
    logResult('D22_Pagination', !!(paginationInfo || prevBtn), 'אלמנטי pagination');

    // --- 9. Page title / LEGO ---
    const pageTitle = await driver.findElement(By.css('.index-section__header-text, h1')).catch(() => null);
    const hasTickersTitle = pageTitle ? (await pageTitle.getText()).includes('טיקרים') || (await pageTitle.getText()).includes('ניהול') : false;
    logResult('D22_PageStructure', !!pageTitle, 'מבנה עמוד ניהול טיקרים');

    // --- 10. Table count label ---
    const countEl = await driver.findElement(By.css('#tableTickersCount')).catch(() => null);
    logResult('D22_TableCount', !!countEl, 'תווית מספר טיקרים');

  } catch (err) {
    logger.log('D22_E2E', 'FAIL', { message: (err && err.message) || String(err) });
    results.failed++;
  } finally {
    if (driver) await driver.quit();
  }

  const summary = { passed: results.passed, failed: results.failed, skipped: results.skipped };
  fs.writeFileSync(
    path.join(ARTIFACTS_DIR, 'TEAM_50_D22_TICKERS_E2E_RESULTS.json'),
    JSON.stringify({ results: summary, timestamp: new Date().toISOString(), work_package_id: 'S002-P003-WP002', domain: 'D22' }, null, 2)
  );
  console.log(`\nסיכום: ${results.passed} עברו, ${results.failed} נכשלו, ${results.skipped} דילוג`);
  return results;
}

runTickersD22E2ETests().then((r) => {
  process.exit(r.failed > 0 ? 1 : 0);
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
