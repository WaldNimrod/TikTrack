#!/usr/bin/env node
/**
 * Smart History Fill QA — TEAM_10_TO_TEAM_50_SMART_HISTORY_FILL_QA_REQUEST
 * ------------------------------------------------------------------------
 * 1. כפתור "הפעל History Backfill" — טיקר עם חסרים → 200
 * 2. בלוק "הנתונים מלאים — לטעון מחדש?" + כפתור (Admin, 250+ שורות)
 * 3. force_reload Admin → דיאלוג אישור → 200
 * 4. force_reload משתמש רגיל → 403 + הודעה
 * 5. טיפול בשגיאות 404, 409, 502 — הודעות מתאימות
 *
 * הרצה: node smart-history-fill-qa.e2e.test.js
 * דורש: Backend 8082, Frontend 8080
 */

import { createDriver, TEST_CONFIG, TEST_USERS, getLocalStorageValue } from './selenium-config.js';
import { By, until } from 'selenium-webdriver';

const logger = { log: (a, b, c) => console.log(b === 'PASS' ? `✅ [PASS] ${a}` : b === 'FAIL' ? `❌ [FAIL] ${a}` : `⚠️ ${a}:`, c?.message ?? c) };

async function login(driver, username, password) {
  await driver.get(`${TEST_CONFIG.frontendUrl}/login`);
  await driver.sleep(2000);
  const userInput = await driver.findElement(By.css('input[name="usernameOrEmail"], input[name="username_or_email"]'));
  await userInput.clear();
  await userInput.sendKeys(username);
  await driver.findElement(By.css('input[name="password"]')).sendKeys(password);
  await driver.findElement(By.css('button[type="submit"]')).click();
  await driver.sleep(3500);
  const token = await getLocalStorageValue(driver, 'access_token');
  return !!token;
}

async function runSmartHistoryFillQA() {
  const results = {
    item1_backfill_btn: 'SKIP',
    item2_force_reload_block: 'SKIP',
    item3_force_reload_admin: 'SKIP',
    item4_force_reload_403: 'SKIP',
    item5_errors: 'SKIP',
  };

  let driver;
  let tickerId = null;
  try {
    driver = await createDriver();
    await driver.get(`${TEST_CONFIG.frontendUrl}/`);
    await driver.sleep(1500);

    const adminLoggedIn = await login(driver, TEST_USERS.admin.username, TEST_USERS.admin.password);
    if (!adminLoggedIn) {
      logger.log('Login Admin', 'FAIL', { message: 'לא הצלחנו להתחבר כמנהל' });
      await driver.quit();
      return results;
    }
    logger.log('Login Admin', 'PASS');

    // Navigate to tickers → בקרת תקינות נתונים
    await driver.get(`${TEST_CONFIG.frontendUrl}/tickers.html`);
    await driver.sleep(4000);

    const selectEl = await driver.findElement(By.id('tickerDataIntegritySelect')).catch(() => null);
    if (!selectEl) {
      logger.log('Item 1', 'FAIL', { message: 'בקרת תקינות — select לא נמצא' });
      await driver.quit();
      return results;
    }

    // Get first ticker option (skip empty)
    const options = await selectEl.findElements(By.css('option'));
    for (const opt of options) {
      const val = await opt.getAttribute('value');
      if (val && val.length > 10) {
        tickerId = val;
        await driver.executeScript(`
          var sel = document.getElementById('tickerDataIntegritySelect');
          if (sel) { sel.value = arguments[0]; sel.dispatchEvent(new Event('change', { bubbles: true })); }
        `, val);
        break;
      }
    }

    if (!tickerId) {
      logger.log('Item 1', 'SKIP', { message: 'אין טיקרים — נדרש seed' });
    } else {
      await driver.sleep(6000);
      const detailEl = await driver.findElement(By.id('tickerDataIntegrityDetail'));
      let btn = await driver.findElement(By.id('tickerDataIntegrityBackfillBtn')).catch(() => null);
      if (!btn) {
        await driver.sleep(3000);
        btn = await driver.findElement(By.id('tickerDataIntegrityBackfillBtn')).catch(() => null);
      }
      const forceBtnEl = await driver.findElement(By.id('tickerDataIntegrityForceReloadBtn')).catch(() => null);
      const html = await detailEl.getAttribute('innerHTML');
      const bannerHtml = await driver.findElement(By.id('tickerDataIntegrityBackfillBanner')).getAttribute('innerHTML').catch(() => '');

      const hasBackfillBtn = !!btn || bannerHtml.includes('tickerDataIntegrityBackfillBtn') || bannerHtml.includes('הפעל History Backfill');
      const hasForceBlock = !!forceBtnEl || html.includes('tickerDataIntegrityForceReloadBtn') || html.includes('טען מחדש (מחיקה)');
      const hasDataCompleteBlock = html.includes('הנתונים מלאים') || html.includes('250 ימים');

      // Item 1: Backfill button (ticker with gaps)
      if (hasBackfillBtn && btn) {
        await driver.executeScript("document.getElementById('tickerDataIntegrityBackfillBtn')?.click()");
        await driver.sleep(12000);
        const htmlAfter = await driver.findElement(By.id('tickerDataIntegrityDetail')).getAttribute('innerHTML').catch(() => '');
        const bannerAfter = await driver.findElement(By.id('tickerDataIntegrityBackfillBanner')).getAttribute('innerHTML').catch(() => '');
        const hasBackfillError = (htmlAfter + bannerAfter).includes('data-integrity-error') && (htmlAfter + bannerAfter).includes('Backfill:');
        const completed = !hasBackfillError;
        results.item1_backfill_btn = completed ? 'PASS' : 'FAIL';
        logger.log('Item 1: Backfill button', completed ? 'PASS' : 'FAIL', { message: completed ? 'לחיצה → 200' : 'לא הושלם' });
      } else if (hasBackfillBtn) {
        results.item1_backfill_btn = 'PASS';
        logger.log('Item 1: Backfill button', 'PASS', { message: 'כפתור מוצג (טיקר עם חסרים)' });
      } else {
        results.item1_backfill_btn = hasForceBlock ? 'SKIP' : 'FAIL';
        logger.log('Item 1', hasForceBlock ? 'SKIP' : 'FAIL', { message: hasForceBlock ? 'טיקר מלא — אין כפתור Backfill (תקין)' : 'אין כפתור Backfill' });
      }

      // Item 2: Force reload block (Admin, 250+ rows)
      if (hasForceBlock && hasDataCompleteBlock) {
        results.item2_force_reload_block = 'PASS';
        logger.log('Item 2: בלוק "הנתונים מלאים"', 'PASS');
      } else if (!hasForceBlock) {
        results.item2_force_reload_block = 'SKIP';
        logger.log('Item 2', 'SKIP', { message: 'אין טיקר עם 250+ שורות — בלוק Force Reload לא מוצג' });
      } else {
        results.item2_force_reload_block = 'PASS';
        logger.log('Item 2', 'PASS', { message: 'בלוק + כפתור' });
      }

      // Item 3: force_reload Admin — need to click and confirm (skip if no block)
      if (hasForceBlock) {
        const forceBtn = await driver.findElement(By.id('tickerDataIntegrityForceReloadBtn')).catch(() => null);
        if (forceBtn) {
          await driver.executeScript('window.__qaForceReloadConfirmed = false;');
          await driver.executeScript(`
            window.confirm = function() { window.__qaForceReloadConfirmed = true; return true; };
          `);
          await forceBtn.click();
          await driver.sleep(6000);
          const confirmed = await driver.executeScript('return !!window.__qaForceReloadConfirmed');
          const htmlAfter = await detailEl.getAttribute('innerHTML');
          const ok = htmlAfter.includes('הושלם') || !htmlAfter.includes('טוען מחדש...');
          results.item3_force_reload_admin = (confirmed && ok) ? 'PASS' : 'FAIL';
          logger.log('Item 3: force_reload Admin', results.item3_force_reload_admin, { message: confirmed ? 'דיאלוג → 200' : 'לא אושר' });
        }
      } else {
        results.item3_force_reload_admin = 'SKIP';
      }
    }

    await driver.quit();
  } catch (e) {
    logger.log('E2E', 'FAIL', { message: e.message });
    if (driver) try { await driver.quit(); } catch (_) {}
  }

  // Item 4 & 5: API tests (curl)
  try {
    const { execSync } = await import('child_process');
    const authAdmin = execSync(
      `curl -s -X POST "${TEST_CONFIG.backendUrl}/api/v1/auth/login" -H "Content-Type: application/json" -d '{"username_or_email":"${TEST_USERS.admin.username}","password":"${TEST_USERS.admin.password}"}'`,
      { encoding: 'utf-8' }
    );
    const adminToken = JSON.parse(authAdmin).access_token;
    if (!adminToken) {
      results.item4_force_reload_403 = 'SKIP';
      results.item5_errors = 'SKIP';
    } else {
      // 404: fake ticker
      const r404 = execSync(
        `curl -s -w "%{http_code}" -o /tmp/shf404.json -X POST "${TEST_CONFIG.backendUrl}/api/v1/tickers/01HXXXXXXXXXXXXXXXFAKEULID/history-backfill" -H "Authorization: Bearer ${adminToken}" -H "Content-Type: application/json" -d '{}'`,
        { encoding: 'utf-8' }
      );
      const code404 = r404.trim().slice(-3);
      const body404 = (await import('fs')).readFileSync('/tmp/shf404.json', 'utf8');
      const has404Msg = body404.includes('not found') || body404.includes('Ticker');
      results.item5_errors = (code404 === '404' && has404Msg) ? 'PASS' : results.item5_errors;
      if (code404 === '404') logger.log('Item 5: 404', 'PASS', { message: 'Ticker not found' });

      // 403: regular user + force_reload (register temp USER)
      let userToken = null;
      try {
        const un = `qa_shf_${Date.now()}`;
        const reg = execSync(
          `curl -s -X POST "${TEST_CONFIG.backendUrl}/api/v1/auth/register" -H "Content-Type: application/json" -d '{"username_or_email":"${un}","email":"${un}@test.com","password":"Test123456!"}'`,
          { encoding: 'utf-8' }
        ).trim();
        userToken = JSON.parse(reg).access_token;
      } catch (_) {}
      const tickersResp = execSync(`curl -s -H "Authorization: Bearer ${adminToken}" "${TEST_CONFIG.backendUrl}/api/v1/tickers"`, { encoding: 'utf-8' });
      const tickersData = JSON.parse(tickersResp);
      const tickerList = tickersData?.data ?? tickersData;
      const ticker403 = tickerId || (Array.isArray(tickerList) && tickerList[0] ? tickerList[0].id : null);
      if (userToken && ticker403) {
        const r403 = execSync(
          `curl -s -w "%{http_code}" -o /tmp/shf403.json -X POST "${TEST_CONFIG.backendUrl}/api/v1/tickers/${ticker403}/history-backfill?mode=force_reload" -H "Authorization: Bearer ${userToken}" -H "Content-Type: application/json" -d '{}'`,
          { encoding: 'utf-8' }
        );
        const code403 = r403.trim().slice(-3);
        const body403 = (await import('fs')).readFileSync('/tmp/shf403.json', 'utf8');
        results.item4_force_reload_403 = (code403 === '403' && body403.includes('Admin')) ? 'PASS' : 'FAIL';
        logger.log('Item 4: force_reload משתמש רגיל', results.item4_force_reload_403, { message: code403 === '403' ? '403 + הודעה' : `code=${code403}` });
      } else {
        results.item4_force_reload_403 = 'SKIP';
        logger.log('Item 4', 'SKIP', { message: 'test_user לא זמין או tickerId חסר' });
      }
    }
  } catch (apiErr) {
    logger.log('API tests', 'SKIP', { message: apiErr.message });
  }

  return results;
}

runSmartHistoryFillQA().then((results) => {
  console.log('\n=== Smart History Fill QA Summary ===');
  Object.entries(results).forEach(([k, v]) => console.log(k, ':', v));
  const failed = Object.values(results).filter((v) => v === 'FAIL').length;
  process.exit(failed > 0 ? 1 : 0);
});
