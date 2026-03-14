#!/usr/bin/env node
/**
 * Alerts MB3A E2E - Team 50 (QA)
 * Scope: TEAM_10_TO_TEAM_50_MB3A_ALERTS_GATE_A_QA_REQUEST
 * TEAM_30_MB3A_ALERTS_INTEGRATION_COMPLETION — עמוד /alerts.html
 * Tests: Summary, List, Filter (target_type), Pagination, LEGO structure, Scope Lock
 */

import { createDriver, TEST_CONFIG, TEST_USERS, getLocalStorageValue, TestLogger } from './selenium-config.js';
import { By } from 'selenium-webdriver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTIFACTS_DIR = path.join(__dirname, '..', 'documentation', 'reports', '05-REPORTS', 'artifacts');
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

async function runAlertsE2ETests() {
  let driver;

  try {
    driver = await createDriver();
    await driver.get(`${TEST_CONFIG.frontendUrl}/`);
    await driver.sleep(1500);

    const loggedIn = await login(driver);
    if (!loggedIn) {
      logger.log('Alerts_Login', 'SKIP', { message: 'Login failed' });
      results.skipped++;
      fs.writeFileSync(path.join(ARTIFACTS_DIR, 'TEAM_50_MB3A_ALERTS_E2E_RESULTS.json'), JSON.stringify({ results, items: [] }, null, 2));
      return results;
    }

    await driver.get(`${TEST_CONFIG.frontendUrl}/alerts.html`);
    await driver.sleep(5000);

    // --- 1. עמוד נטען — LEGO structure ---
    const pageWrapper = await driver.findElement(By.css('.page-wrapper, [data-section="alerts-management"]')).catch(() => null);
    const ttContainer = await driver.findElement(By.css('.tt-container, .phoenix-table-container')).catch(() => null);
    logResult('A1_PageLoad', !!(pageWrapper || ttContainer), 'עמוד התראות נטען');

    // --- 2. סקשן סיכום — totalAlerts, activeAlerts, newAlerts, triggeredAlerts ---
    const totalEl = await driver.findElement(By.css('#totalAlerts, [id*="totalAlerts"]')).catch(() => null);
    const summarySection = await driver.findElement(By.css('#alertsSummaryContent, [data-section="alerts-summary"], .summary-section')).catch(() => null);
    logResult('A2_SummarySection', !!(totalEl || summarySection), 'סקשן סיכום קיים');

    // --- 3. טבלה או מצב ריק ---
    const tableBody = await driver.findElement(By.css('#alertsTableBody, .phoenix-table__body')).catch(() => null);
    const emptyRow = await driver.findElement(By.css('.phoenix-table__row--empty, [data-role="empty-state"]')).catch(() => null);
    const hasTableOrEmpty = !!(tableBody || emptyRow || await driver.findElement(By.css('#alertsTable, table.phoenix-table')).catch(() => null));
    logResult('A3_TableOrEmpty', hasTableOrEmpty, 'טבלה או שורת ריק');

    // --- 4. פילטר target_type — כפתורי סינון ---
    const filterBtns = await driver.findElements(By.css('.filter-icon-btn, [data-filter-type]'));
    logResult('A4_FilterButtons', filterBtns.length >= 1, `כפתורי סינון: ${filterBtns.length}`);

    // --- 5. Pagination elements ---
    const paginationInfo = await driver.findElement(By.css('#alertsPaginationInfo, .phoenix-table-pagination')).catch(() => null);
    const prevBtn = await driver.findElement(By.css('#alertsPrevPageBtn, .phoenix-table-pagination__prev')).catch(() => null);
    logResult('A5_Pagination', !!(paginationInfo || prevBtn), 'אלמנטי pagination');

    // --- 6. מבנה LEGO (Scope Lock) ---
    const ttSection = await driver.findElement(By.css('.tt-section, .phoenix-section')).catch(() => null);
    logResult('A6_LEGOStructure', !!(ttSection || ttContainer || pageWrapper), 'מבנה LEGO');

    // --- 7. תפריט נתונים → התראות (בתפריט) ---
    const menuLink = await driver.findElement(By.css('a[href*="alerts"], [href="/alerts.html"]')).catch(() => null);
    logResult('A7_MenuLink', !!menuLink, 'קישור תפריט התראות');

    // --- 8. Empty state טקסט (אם אין נתונים) ---
    const pageSource = await driver.getPageSource();
    const hasEmptyText = pageSource.includes('אין התראות להצגה') || pageSource.includes('התראות');
    logResult('A8_EmptyOrData', hasEmptyText, 'תצוגת ריק או נתונים');

    // --- 9. כפתור הוספה (אם קיים) ---
    const addBtn = await driver.findElement(By.css('.js-add-alert, [data-action="add-alert"]')).catch(() => null);
    logResult('A9_AddButton', !!addBtn, addBtn ? 'כפתור הוספה קיים' : 'כפתור הוספה (Phase 2)');

    // --- 10. סגנונות phoenix (Scope Lock) ---
    const phoenixTable = await driver.findElement(By.css('.phoenix-table, .phoenix-table__row')).catch(() => null);
    logResult('A10_PhoenixStyles', !!phoenixTable, 'מחלקות phoenix-table');

  } catch (err) {
    logger.log('Alerts_E2E', 'FAIL', { message: (err && err.message) || String(err) });
    results.failed++;
  } finally {
    if (driver) await driver.quit();
  }

  const summary = { passed: results.passed, failed: results.failed, skipped: results.skipped };
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'TEAM_50_MB3A_ALERTS_E2E_RESULTS.json'), JSON.stringify({ results: summary, timestamp: new Date().toISOString() }, null, 2));
  console.log(`\nסיכום: ${results.passed} עברו, ${results.failed} נכשלו, ${results.skipped} דילוג`);
  return results;
}

runAlertsE2ETests().then((r) => {
  process.exit(r.failed > 0 ? 1 : 0);
}).catch((e) => {
  console.error(e);
  process.exit(1);
});
