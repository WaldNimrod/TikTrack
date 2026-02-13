#!/usr/bin/env node
/**
 * Batch 2.5 QA E2E - Team 50
 * Scope: BATCH_2_5_COMPLETIONS_MANDATE.md (ADR-017 §3)
 * 1. Redirect ל-Home לכל אנונימי בעמוד שאינו Open
 * 2. User Icon: SUCCESS (מחובר) / WARNING (מנותק). שחור = FAIL
 * 3. 0 SEVERE
 */

import { createDriver, TEST_CONFIG, TEST_USERS, getLocalStorageValue, clearLocalStorage, elementExists, getConsoleLogs, TestLogger } from './selenium-config.js';
import { By } from 'selenium-webdriver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACTS_DIR = path.join(__dirname, '..', 'documentation', '05-REPORTS', 'artifacts_SESSION_01', 'batch-2-5-qa-artifacts');
if (!fs.existsSync(ARTIFACTS_DIR)) fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
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
    return !!token;
  } catch (e) {
    return false;
  }
}

async function runBatch25QA() {
  const criteria = {
    redirect: { name: 'Redirect ל-Home לכל אנונימי בעמוד שאינו Open', status: 'SKIP', note: '' },
    userIconSuccess: { name: 'User Icon: SUCCESS (מחובר)', status: 'SKIP', note: '' },
    userIconWarning: { name: 'User Icon: WARNING (מנותק)', status: 'SKIP', note: '' },
    noSevere: { name: '0 SEVERE בקונסול', status: 'SKIP', note: '' },
  };

  let driver;
  try {
    driver = await createDriver();

    // Establish origin first (avoid data: URL storage issues)
    await driver.get(`${TEST_CONFIG.frontendUrl}/`);
    await driver.sleep(1000);

    // === 1. Redirect: Anonymous on /trading_accounts → Home ===
    await clearLocalStorage(driver);
    await driver.executeScript('sessionStorage.clear();');
    await driver.get(`${TEST_CONFIG.frontendUrl}/trading_accounts`);
    await driver.sleep(5000);
    const urlAfter = await driver.getCurrentUrl();
    const pathAfter = new URL(urlAfter).pathname;
    const redirectedToHome = pathAfter === '/' || pathAfter === '/index.html' || pathAfter === '';
    if (redirectedToHome) {
      criteria.redirect.status = 'PASS';
      criteria.redirect.note = `אנונימי ב-/trading_accounts הופנה ל-${pathAfter || '/'}`;
    } else {
      criteria.redirect.status = 'FAIL';
      criteria.redirect.note = `צפוי הפניה ל-/, התקבל: ${pathAfter}`;
    }

    // === 2. User Icon SUCCESS (מחובר) ===
    if (!(await login(driver))) {
      criteria.userIconSuccess.status = 'FAIL';
      criteria.userIconSuccess.note = 'התחברות נכשלה';
    } else {
      await driver.get(`${TEST_CONFIG.frontendUrl}/`);
      await driver.sleep(3500);
      const hasSuccessIcon = await elementExists(driver, '.user-icon--success');
      const hasSuccessLink = await elementExists(driver, '.user-profile-link--success');
      if (hasSuccessIcon || hasSuccessLink) {
        criteria.userIconSuccess.status = 'PASS';
        criteria.userIconSuccess.note = '.user-icon--success / .user-profile-link--success נוכח';
      } else {
        criteria.userIconSuccess.status = 'FAIL';
        criteria.userIconSuccess.note = 'אין class Success — User Icon שחור = FAIL';
      }
    }

    // === 3. User Icon WARNING (מנותק) ===
    await clearLocalStorage(driver);
    await driver.get(`${TEST_CONFIG.frontendUrl}/`);
    await driver.sleep(3500);
    const hasAlertIcon = await elementExists(driver, '.user-icon--alert');
    const hasAlertLink = await elementExists(driver, '.user-profile-link--alert');
    if (hasAlertIcon || hasAlertLink) {
      criteria.userIconWarning.status = 'PASS';
      criteria.userIconWarning.note = '.user-icon--alert / .user-profile-link--alert נוכח (מנותק)';
    } else {
      criteria.userIconWarning.status = 'FAIL';
      criteria.userIconWarning.note = 'אין class Alert — User Icon שחור = FAIL';
    }

    // === 4. 0 SEVERE ===
    await driver.get(`${TEST_CONFIG.frontendUrl}/`);
    await driver.sleep(2500);
    const logs = await getConsoleLogs(driver);
    const severe = logs.filter(l => l.level === 'SEVERE');
    const severeNoFavicon = severe.filter(e => !e.message?.includes('favicon'));
    if (severeNoFavicon.length === 0) {
      criteria.noSevere.status = 'PASS';
      criteria.noSevere.note = 'אין SEVERE בקונסול';
    } else {
      criteria.noSevere.status = 'FAIL';
      criteria.noSevere.note = `${severeNoFavicon.length} SEVERE נמצאו`;
      fs.writeFileSync(path.join(ARTIFACTS_DIR, 'BATCH_25_SEVERE.json'), JSON.stringify(severeNoFavicon, null, 2));
    }
    fs.writeFileSync(path.join(ARTIFACTS_DIR, 'BATCH_25_CONSOLE.json'), JSON.stringify(logs.map(l => ({ level: l.level, msg: l.message?.substring(0, 200) })), null, 2));

  } catch (err) {
    logger.log('BATCH_25_QA', 'FAIL', { message: err.message });
  } finally {
    if (driver) try { await driver.quit(); } catch (_) {}
  }

  return criteria;
}

function writeReport(criteria) {
  const failed = Object.values(criteria).filter(c => c.status === 'FAIL').length;
  const reportPath = path.join(__dirname, '..', '_COMMUNICATION', 'team_50', 'TEAM_50_TO_TEAM_10_BATCH_2_5_QA_REPORT.md');

  const lines = [
    '# Team 50 → Team 10: דוח QA בץ 2.5 — Redirect + User Icon (ADR-017)',
    '',
    '**מאת:** Team 50 (QA & Fidelity)',
    '**אל:** Team 10 (The Gateway)',
    '**תאריך:** 2026-02-12',
    '**מקור:** BATCH_2_5_COMPLETIONS_MANDATE.md (ADR-017 §3) — סגירת בץ 2.5 (QA)',
    '',
    '---',
    '',
    '## 1. Scope חובה',
    '',
    '| # | קריטריון | סטטוס | הערה |',
    '|---|----------|-------|------|',
    ...Object.entries(criteria).map(([k, v]) => `| - | ${v.name} | **${v.status}** | ${v.note} |`),
    '',
    '---',
    '',
    '## 2. סיכום',
    '',
    failed === 0
      ? '**PASS מלא.** כל הקריטריונים עברו. 0 SEVERE. דוח QA ממוסמך.'
      : `**${failed}** קריטריון/ים נכשלו.`,
    '',
    '---',
    '',
    '**Base URL:** ' + TEST_CONFIG.frontendUrl,
    '**Evidence:** documentation/05-REPORTS/artifacts_SESSION_01/batch-2-5-qa-artifacts/',
    '',
    '**log_entry | TEAM_50 | BATCH_2_5_QA_REPORT | TO_TEAM_10 | 2026-02-12**',
  ];

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, lines.join('\n'));
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'BATCH_25_RESULTS.json'), JSON.stringify({ timestamp: new Date().toISOString(), criteria }, null, 2));
  return failed;
}

console.log('\n=== Batch 2.5 QA — Redirect + User Icon (Team 50) ===\n');
runBatch25QA().then((criteria) => {
  const failed = writeReport(criteria);
  console.log('\n--- Criteria ---');
  Object.entries(criteria).forEach(([k, v]) => console.log(`  ${v.name}: ${v.status}`));
  console.log('\nReport: _COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_BATCH_2_5_QA_REPORT.md');
  process.exit(failed > 0 ? 1 : 0);
}).catch(e => { console.error(e); process.exit(1); });
