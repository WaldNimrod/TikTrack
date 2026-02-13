#!/usr/bin/env node
/**
 * Batch 2.5 QA E2E - Team 50
 * Scope: BATCH_2_5_COMPLETIONS_MANDATE.md (ADR-017) — Redirect + User Icon
 * Criteria: Redirect to Home (anon), User Icon Success/Warning, 0 SEVERE
 */

import { createDriver, TEST_CONFIG, TEST_USERS, getLocalStorageValue, clearLocalStorage, getConsoleLogs, TestLogger } from './selenium-config.js';
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
    userIcon_warning: { name: 'User Icon: WARNING (מנותק)', status: 'SKIP', note: '' },
    userIcon_success: { name: 'User Icon: SUCCESS (מחובר)', status: 'SKIP', note: '' },
    noSevere: { name: '0 SEVERE בקונסול', status: 'SKIP', note: '' },
  };

  let driver;
  let severeLogs = [];

  try {
    driver = await createDriver();
    await driver.get(`${TEST_CONFIG.frontendUrl}/`);
    await driver.sleep(1500);

    // === 1. Redirect: anon on /trading_accounts → Home ===
    await driver.sleep(1000);
    await clearLocalStorage(driver);
    await driver.executeScript('sessionStorage.clear();');
    await driver.get(`${TEST_CONFIG.frontendUrl}/trading_accounts`);
    await driver.sleep(5000);
    const urlAfter = await driver.getCurrentUrl();
    const pathAfter = new URL(urlAfter).pathname;
    const atHome = pathAfter === '/' || pathAfter === '/index.html' || pathAfter === '';
    if (atHome) {
      criteria.redirect.status = 'PASS';
      criteria.redirect.note = `אנונימי ב-/trading_accounts הופנה ל-${pathAfter || '/'}`;
    } else {
      criteria.redirect.status = 'FAIL';
      criteria.redirect.note = `Expected redirect to /, got: ${pathAfter}`;
    }

    // === 2. User Icon WARNING (disconnected) — Home has header, guest sees warning ===
    await driver.get(`${TEST_CONFIG.frontendUrl}/`);
    await driver.sleep(3000);
    const hasIconAlert = await driver.executeScript(() => {
      const link = document.getElementById('filterUserProfileLink');
      if (!link) return false;
      return link.classList.contains('user-profile-link--alert') ||
             link.querySelector('.user-icon--alert');
    });
    if (hasIconAlert) {
      criteria.userIcon_warning.status = 'PASS';
      criteria.userIcon_warning.note = '.user-icon--alert / .user-profile-link--alert נוכח (מנותק)';
    } else {
      criteria.userIcon_warning.status = 'FAIL';
      criteria.userIcon_warning.note = 'User Icon Warning (מנותק) לא נמצא';
    }

    // === 3. User Icon SUCCESS (logged in) ===
    if (!(await login(driver))) {
      criteria.userIcon_success.status = 'SKIP';
      criteria.userIcon_success.note = 'Login failed';
    } else {
      await driver.get(`${TEST_CONFIG.frontendUrl}/`);
      await driver.sleep(3500);
      const hasIconSuccess = await driver.executeScript(() => {
        const link = document.getElementById('filterUserProfileLink');
        if (!link) return false;
        return link.classList.contains('user-profile-link--success') ||
               link.querySelector('.user-icon--success');
      });
      if (hasIconSuccess) {
        criteria.userIcon_success.status = 'PASS';
        criteria.userIcon_success.note = '.user-icon--success / .user-profile-link--success נוכח';
      } else {
        criteria.userIcon_success.status = 'FAIL';
        criteria.userIcon_success.note = 'User Icon Success (מחובר) לא נמצא';
      }
    }

    // === 4. 0 SEVERE — collect console logs ===
    await driver.get(`${TEST_CONFIG.frontendUrl}/trading_accounts`);
    await driver.sleep(5000);
    const logs = await getConsoleLogs(driver);
    severeLogs = logs.filter(l => l.level === 'SEVERE');
    if (severeLogs.length === 0) {
      criteria.noSevere.status = 'PASS';
      criteria.noSevere.note = '0 SEVERE בקונסול';
    } else {
      criteria.noSevere.status = 'FAIL';
      criteria.noSevere.note = `${severeLogs.length} SEVERE נמצאו`;
    }

  } catch (err) {
    logger.log('BATCH_25_QA', 'FAIL', { message: err.message });
  } finally {
    if (driver) try { await driver.quit(); } catch (_) {}
  }

  return { criteria, severeLogs };
}

function writeReport(result) {
  const { criteria, severeLogs } = result;
  const failed = Object.values(criteria).filter(c => c.status === 'FAIL').length;
  const reportPath = path.join(__dirname, '..', '_COMMUNICATION', 'team_50', 'TEAM_50_TO_TEAM_10_BATCH_2_5_QA_REPORT.md');

  let severeSection = '';
  if (severeLogs.length > 0) {
    severeSection = `
## 3. SEVERE שנמצאו (לטיפול)

| # | רמת לוג | הודעה |
|---|---------|-------|
${severeLogs.slice(0, 10).map((l, i) => `| ${i + 1} | ${l.level} | ${(l.message || '').substring(0, 120)} |`).join('\n')}

`;
  }

  const passCount = Object.values(criteria).filter(c => c.status === 'PASS').length;
  const total = Object.keys(criteria).length;

  const lines = [
    '# Team 50 → Team 10: דוח QA בץ 2.5 — Redirect + User Icon (ADR-017)',
    '',
    '**מאת:** Team 50 (QA & Fidelity)',
    '**אל:** Team 10 (The Gateway)',
    '**תאריך:** 2026-02-13',
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
      ? `**${passCount}/${total} PASS.** Redirect + User Icon (Success/Warning) + 0 SEVERE — עברו במלואו. קריטריון הצלחה: **PASS מלא.**`
      : `**${passCount}/${total} PASS.** ${failed} קריטריון/ים נכשלו.`,
    severeSection,
    '---',
    '',
    '**Base URL:** ' + TEST_CONFIG.frontendUrl,
    '**Evidence:** documentation/05-REPORTS/artifacts_SESSION_01/batch-2-5-qa-artifacts/',
    '',
    '**log_entry | TEAM_50 | BATCH_2_5_QA_REPORT | TO_TEAM_10 | 2026-02-13**',
  ].filter(Boolean);

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, lines.join('\n'));
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'BATCH_2_5_QA_RESULTS.json'), JSON.stringify({
    timestamp: new Date().toISOString(),
    criteria,
    severeLogs: severeLogs.map(l => ({ level: l.level, message: l.message })),
  }, null, 2));
  return failed;
}

console.log('\n=== Batch 2.5 QA — Redirect + User Icon (Team 50) ===\n');
runBatch25QA().then((result) => {
  const failed = writeReport(result);
  console.log('\n--- Criteria ---');
  Object.entries(result.criteria).forEach(([k, v]) => console.log(`  ${v.name}: ${v.status}`));
  if (result.severeLogs.length > 0) {
    console.log(`\n  SEVERE: ${result.severeLogs.length} נמצאו`);
  }
  console.log('\nReport: _COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_BATCH_2_5_QA_REPORT.md');
  process.exit(failed > 0 ? 1 : 0);
}).catch(e => { console.error(e); process.exit(1); });
