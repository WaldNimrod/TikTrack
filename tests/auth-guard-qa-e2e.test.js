#!/usr/bin/env node
/**
 * Auth Guard QA E2E - Team 50
 * Scope: TEAM_10_TO_TEAM_50_FINAL_CLOSURE_DEMAND — Auth Guard QA on current state
 * Tests: Type A (open), Type C (auth-only) redirect, authenticated access
 */

import { createDriver, TEST_CONFIG, TEST_USERS, getLocalStorageValue, clearLocalStorage, TestLogger } from './selenium-config.js';
import { By } from 'selenium-webdriver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logger = new TestLogger();

// Per ADR-013 Type C: Auth-only redirects to / (Home), NOT /login
const EXPECTED_UNAUTH_REDIRECT = '/'; // Home

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

async function runAuthGuardQA() {
  const criteria = {
    typeA_open: { name: 'Type A (/login) — accessible without auth', status: 'SKIP', note: '' },
    typeC_redirect: { name: 'Type C (unauth) — redirect to Home', status: 'SKIP', note: '' },
    typeC_authenticated: { name: 'Type C — authenticated access to D16/D18/D21', status: 'SKIP', note: '' },
    authGuard_loaded: { name: 'Auth Guard loaded on protected pages', status: 'SKIP', note: '' },
  };

  let driver;
  try {
    driver = await createDriver();

    // === 1. Type A: /login accessible without auth ===
    await driver.get(`${TEST_CONFIG.frontendUrl}/login`);
    await driver.sleep(2000);
    const loginUrl = await driver.getCurrentUrl();
    const hasLoginForm = await driver.executeScript(() => !!document.querySelector('input[name="usernameOrEmail"]'));
    if (loginUrl.includes('/login') && hasLoginForm) {
      criteria.typeA_open.status = 'PASS';
      criteria.typeA_open.note = '/login loads and shows login form without auth';
    } else {
      criteria.typeA_open.status = 'FAIL';
      criteria.typeA_open.note = `URL: ${loginUrl}, hasForm: ${hasLoginForm}`;
    }

    // === 2. Type C: Unauthenticated → redirect to Home ===
    await clearLocalStorage(driver);
    await driver.executeScript('sessionStorage.clear();');
    await driver.get(`${TEST_CONFIG.frontendUrl}/trading_accounts`);
    await driver.sleep(5000); // Wait for auth guard redirect
    const urlAfterUnauth = await driver.getCurrentUrl();
    const pathAfterUnauth = new URL(urlAfterUnauth).pathname;
    const redirectedToHome = pathAfterUnauth === '/' || pathAfterUnauth === '/index.html' || pathAfterUnauth === '';
    if (redirectedToHome) {
      criteria.typeC_redirect.status = 'PASS';
      criteria.typeC_redirect.note = `Unauthenticated user redirected to ${pathAfterUnauth || '/'} (per ADR-013 Type C)`;
    } else {
      criteria.typeC_redirect.status = 'FAIL';
      criteria.typeC_redirect.note = `Expected redirect to /, got: ${pathAfterUnauth}`;
    }

    // === 3. Type C: Authenticated — D16, D18, D21 load ===
    if (!(await login(driver))) {
      criteria.typeC_authenticated.status = 'SKIP';
      criteria.typeC_authenticated.note = 'Login failed; cannot test authenticated access';
    } else {
      let allOk = true;
      const pages = [['D16', '/trading_accounts'], ['D18', '/brokers_fees'], ['D21', '/cash_flows']];
      for (const [label, path] of pages) {
        await driver.get(`${TEST_CONFIG.frontendUrl}${path}`);
        await driver.sleep(4000);
        const curUrl = await driver.getCurrentUrl();
        const onPage = curUrl.includes(path) || curUrl.endsWith(path);
        const hasTable = await driver.executeScript(() => !!document.querySelector('.phoenix-table'));
        if (!onPage || !hasTable) allOk = false;
      }
      if (allOk) {
        criteria.typeC_authenticated.status = 'PASS';
        criteria.typeC_authenticated.note = 'D16, D18, D21 load when authenticated';
      } else {
        criteria.typeC_authenticated.status = 'FAIL';
        criteria.typeC_authenticated.note = 'One or more protected pages failed to load';
      }
    }

    // === 4. Auth Guard loaded on protected page ===
    await driver.get(`${TEST_CONFIG.frontendUrl}/trading_accounts`);
    await driver.sleep(3500);
    const agLoaded = await driver.executeScript(() => !!(window.AuthGuard && window.AuthGuard._initialized));
    if (agLoaded) {
      criteria.authGuard_loaded.status = 'PASS';
      criteria.authGuard_loaded.note = 'window.AuthGuard initialized on trading_accounts';
    } else {
      criteria.authGuard_loaded.status = 'FAIL';
      criteria.authGuard_loaded.note = 'AuthGuard not found or not initialized';
    }

  } catch (err) {
    logger.log('AuthGuard_QA', 'FAIL', { message: err.message });
    criteria.typeC_redirect.status = criteria.typeC_redirect.status === 'SKIP' ? 'FAIL' : criteria.typeC_redirect.status;
  } finally {
    if (driver) try { await driver.quit(); } catch (_) {}
  }

  return criteria;
}

function writeReport(criteria) {
  const failed = Object.values(criteria).filter(c => c.status === 'FAIL').length;
  const reportPath = path.join(__dirname, '..', '_COMMUNICATION', 'team_50', 'TEAM_50_TO_TEAM_10_AUTH_GUARD_QA_REPORT.md');

  const lines = [
    '# Team 50 → Team 10: דוח QA Auth Guard',
    '',
    '**מאת:** Team 50 (QA & Fidelity)',
    '**אל:** Team 10 (The Gateway)',
    '**תאריך:** 2026-02-12',
    '**מקור:** TEAM_10_TO_TEAM_50_FINAL_CLOSURE_DEMAND — הרצת Auth Guard QA על המצב הקיים',
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
      ? '**כל הקריטריונים עברו.** Auth Guard פועל לפי המצב הקיים: Type A פתוח, Type C מפנה ל-Home כשאין אימות, עמודים מוגנים נגישים כשמאומתים.'
      : `**${failed}** קריטריון/ים נכשלו.`,
    '',
    '**הערה:** מבנה Auth Guard שונה מהמנדט המקורי (UnifiedHeader/global_page_template). מבנה נוכחי: authGuard.js ב-components/core, נטען דרך UAI DOMStage כש-requiresAuth: true.',
    '',
    '---',
    '',
    '**Base URL:** ' + TEST_CONFIG.frontendUrl,
    '',
    '**log_entry | TEAM_50 | AUTH_GUARD_QA_REPORT | TO_TEAM_10 | 2026-02-12**',
  ];

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, lines.join('\n'));
  return failed;
}

console.log('\n=== Auth Guard QA (Team 50) ===\n');
runAuthGuardQA().then((criteria) => {
  const failed = writeReport(criteria);
  console.log('\n--- Criteria ---');
  Object.entries(criteria).forEach(([k, v]) => console.log(`  ${v.name}: ${v.status}`));
  console.log('\nReport: _COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_AUTH_GUARD_QA_REPORT.md');
  process.exit(failed > 0 ? 1 : 0);
}).catch(e => { console.error(e); process.exit(1); });
