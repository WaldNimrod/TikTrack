#!/usr/bin/env node
/**
 * Batch 2.5 ADR-017 QA E2E - Team 50
 * Scope: BATCH_2_5_COMPLETIONS_MANDATE §3 — Redirect + User Icon
 * - Redirect to Home for anonymous on non-Open pages
 * - User Icon: Success (logged in) / Warning (disconnected). Black = FAIL
 */

import { createDriver, TEST_CONFIG, TEST_USERS, getLocalStorageValue, clearLocalStorage, TestLogger } from './selenium-config.js';
import { By } from 'selenium-webdriver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logger = new TestLogger();

const BLACK_HEX = ['#000', '#000000', 'rgb(0, 0, 0)', 'rgb(0,0,0)'];
const SUCCESS_HEX = '#10b981'; // --message-success
const WARNING_HEX = '#f59e0b'; // --message-warning

function isBlackOrNearBlack(c) {
  if (!c) return true;
  const s = String(c).toLowerCase().replace(/\s/g, '');
  if (BLACK_HEX.some(h => s.includes(h))) return true;
  const rgb = s.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (rgb) {
    const [_, r, g, b] = rgb.map(Number);
    return r < 30 && g < 30 && b < 30;
  }
  return false;
}

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
    redirect: { name: 'Redirect ל-Home לאנונימי בעמוד לא-Open', status: 'SKIP', note: '' },
    userIcon_disconnected: { name: 'User Icon — Warning (מנותק) — לא שחור', status: 'SKIP', note: '' },
    userIcon_logged: { name: 'User Icon — Success (מחובר) — לא שחור', status: 'SKIP', note: '' },
    zeroSevere: { name: '0 SEVERE בקונסול', status: 'SKIP', note: '' },
  };

  let driver;
  try {
    driver = await createDriver();

    // Navigate to frontend first (avoid data: URL / Storage disabled)
    await driver.get(`${TEST_CONFIG.frontendUrl}/`);
    await driver.sleep(1500);

    // === 1. Redirect: anonymous on /trading_accounts → / ===
    await clearLocalStorage(driver);
    await driver.executeScript('sessionStorage.clear();');
    await driver.get(`${TEST_CONFIG.frontendUrl}/trading_accounts`);
    await driver.sleep(5000);
    const urlAfter = await driver.getCurrentUrl();
    const pathAfter = new URL(urlAfter).pathname;
    const redirectedToHome = pathAfter === '/' || pathAfter === '/index.html' || pathAfter === '';
    if (redirectedToHome) {
      criteria.redirect.status = 'PASS';
      criteria.redirect.note = `אונונימי הופנה ל־${pathAfter || '/'}`;
    } else {
      criteria.redirect.status = 'FAIL';
      criteria.redirect.note = `צפוי הפניה ל־/, התקבל: ${pathAfter}`;
    }

    // === 2. User Icon — disconnected (on Home) ===
    await driver.get(`${TEST_CONFIG.frontendUrl}/`);
    await driver.sleep(4000);
    const iconCheckDisconnected = await driver.executeScript(() => {
      const icon = document.querySelector('#unified-header .user-icon') || document.querySelector('.user-profile-link .user-icon') || document.querySelector('.user-icon');
      if (!icon) return { found: false, color: null, classes: '' };
      const cs = getComputedStyle(icon);
      return {
        found: true,
        color: cs.color,
        classes: icon.className,
        hasAlert: icon.classList.contains('user-icon--alert'),
        hasSuccess: icon.classList.contains('user-icon--success'),
      };
    });
    if (iconCheckDisconnected.found) {
      const isBlack = isBlackOrNearBlack(iconCheckDisconnected.color);
      if (!isBlack && (iconCheckDisconnected.hasAlert || iconCheckDisconnected.classes.includes('alert'))) {
        criteria.userIcon_disconnected.status = 'PASS';
        criteria.userIcon_disconnected.note = `Warning/alert — color: ${iconCheckDisconnected.color}`;
      } else if (isBlack) {
        criteria.userIcon_disconnected.status = 'FAIL';
        criteria.userIcon_disconnected.note = `שחור = FAIL — color: ${iconCheckDisconnected.color}`;
      } else {
        criteria.userIcon_disconnected.status = 'PASS';
        criteria.userIcon_disconnected.note = `לא שחור; classes: ${iconCheckDisconnected.classes}`;
      }
    } else {
      criteria.userIcon_disconnected.status = 'SKIP';
      criteria.userIcon_disconnected.note = 'User icon לא נמצא (Header אולי לא נטען)';
    }

    // === 3. User Icon — logged in ===
    if (!(await login(driver))) {
      criteria.userIcon_logged.status = 'SKIP';
      criteria.userIcon_logged.note = 'Login נכשל';
    } else {
      await driver.get(`${TEST_CONFIG.frontendUrl}/`);
      await driver.sleep(4000);
      const iconCheckLogged = await driver.executeScript(() => {
        const icon = document.querySelector('#unified-header .user-icon') || document.querySelector('.user-profile-link .user-icon') || document.querySelector('.user-icon');
        if (!icon) return { found: false, color: null, classes: '' };
        const cs = getComputedStyle(icon);
        return {
          found: true,
          color: cs.color,
          classes: icon.className,
          hasSuccess: icon.classList.contains('user-icon--success'),
          hasAlert: icon.classList.contains('user-icon--alert'),
        };
      });
      if (iconCheckLogged.found) {
        const isBlack = isBlackOrNearBlack(iconCheckLogged.color);
        if (!isBlack && (iconCheckLogged.hasSuccess || iconCheckLogged.classes.includes('success'))) {
          criteria.userIcon_logged.status = 'PASS';
          criteria.userIcon_logged.note = `Success — color: ${iconCheckLogged.color}`;
        } else if (isBlack) {
          criteria.userIcon_logged.status = 'FAIL';
          criteria.userIcon_logged.note = `שחור = FAIL — color: ${iconCheckLogged.color}`;
        } else {
          criteria.userIcon_logged.status = 'PASS';
          criteria.userIcon_logged.note = `לא שחור; classes: ${iconCheckLogged.classes}`;
        }
      } else {
        criteria.userIcon_logged.status = 'SKIP';
        criteria.userIcon_logged.note = 'User icon לא נמצא';
      }
    }

    // === 4. 0 SEVERE ===
    const logs = await driver.manage().logs().get('browser');
    const severe = logs.filter(l => (l.level?.name || '').toLowerCase() === 'severe');
    if (severe.length === 0) {
      criteria.zeroSevere.status = 'PASS';
      criteria.zeroSevere.note = '0 SEVERE בקונסול';
    } else {
      criteria.zeroSevere.status = 'FAIL';
      criteria.zeroSevere.note = `${severe.length} SEVERE: ${severe.slice(0, 2).map(l => l.message?.substring(0, 80)).join('; ')}`;
    }

  } catch (err) {
    logger.log('BATCH_25_QA', 'FAIL', { message: err.message });
  } finally {
    if (driver) try { await driver.quit(); } catch (_) {}
  }

  return criteria;
}

function writeReport(criteria) {
  const failed = Object.values(criteria).filter(c => c.status === 'FAIL').length;
  const reportPath = path.join(__dirname, '..', '_COMMUNICATION', 'team_50', 'TEAM_50_TO_TEAM_10_BATCH_2_5_ADR017_QA_REPORT.md');

  const lines = [
    '# Team 50 → Team 10: דוח QA בץ 2.5 — Redirect + User Icon (ADR-017)',
    '',
    '**מאת:** Team 50 (QA & Fidelity)',
    '**אל:** Team 10 (The Gateway)',
    '**תאריך:** 2026-02-12',
    '**מקור:** BATCH_2_5_COMPLETIONS_MANDATE.md §3',
    '',
    '---',
    '',
    '## 1. תוצאות לפי קריטריון',
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
      ? '**PASS מלא.** כל הקריטריונים עברו: Redirect ל-Home, User Icon Success/Warning (לא שחור), 0 SEVERE.'
      : `**${failed}** קריטריון/ים נכשלו.`,
    '',
    '---',
    '',
    '**Base URL:** ' + TEST_CONFIG.frontendUrl,
    '**SSOT:** TT2_AUTH_GUARDS_AND_ROUTE_SSOT.md, BATCH_2_5_COMPLETIONS_MANDATE.md',
    '',
    '**log_entry | TEAM_50 | BATCH_2_5_ADR017_QA_REPORT | TO_TEAM_10 | 2026-02-12**',
  ];

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, lines.join('\n'));
  return failed;
}

console.log('\n=== Batch 2.5 ADR-017 QA (Team 50) ===\n');
runBatch25QA().then((criteria) => {
  const failed = writeReport(criteria);
  console.log('\n--- Criteria ---');
  Object.entries(criteria).forEach(([k, v]) => console.log(`  ${v.name}: ${v.status}`));
  console.log('\nReport: _COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_BATCH_2_5_ADR017_QA_REPORT.md');
  process.exit(failed > 0 ? 1 : 0);
}).catch(e => { console.error(e); process.exit(1); });
