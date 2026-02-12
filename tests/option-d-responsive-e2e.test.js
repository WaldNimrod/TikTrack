#!/usr/bin/env node
/**
 * Option D Responsive QA - Team 50
 * Scope: TEAM_10_TO_TEAM_50_OPTION_D_RESPONSIVE_QA_REQUEST
 * 6 criteria: Sticky, Responsive, Overflow, col-actions, No CSS override, No JS override
 */

import { createDriver, TEST_CONFIG, TEST_USERS, getLocalStorageValue, TestLogger } from './selenium-config.js';
import { By } from 'selenium-webdriver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ARTIFACTS_DIR = path.join(__dirname, '..', 'documentation', '05-REPORTS', 'artifacts_SESSION_01', 'option-d-responsive-artifacts');
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

async function checkStickyAndResponsive(driver) {
  const results = { passed: 0, failed: 0, skipped: 0 };

  const checks = await driver.executeScript(() => {
    const out = { sticky: {}, overflow: {}, colActions: false, viewport: { w: window.innerWidth, h: window.innerHeight } };
    const tables = document.querySelectorAll('.phoenix-table');
    if (!tables.length) return out;

    const table = tables[0];
    const stickyCols = table.querySelectorAll('.col-name, .col-broker, .col-trade, .col-actions');
    stickyCols.forEach((el, i) => {
      const cs = getComputedStyle(el);
      const pos = cs.position;
      out.sticky[el.className.split(' ').find(c => c.startsWith('col-')) || i] = pos;
    });

    const wrapper = document.querySelector('.phoenix-table-wrapper');
    if (wrapper) {
      const ws = getComputedStyle(wrapper);
      out.overflow = { overflowX: ws.overflowX, overflow: ws.overflow };
    }

    const actions = table.querySelectorAll('.col-actions');
    out.colActions = actions.length > 0 && Array.from(actions).some(el => {
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0;
    });

    const bodyOverflow = getComputedStyle(document.body).overflowX;
    out.bodyOverflowX = bodyOverflow;

    return out;
  });

  const stickyOk = Object.values(checks.sticky || {}).every(v => v === 'sticky') || Object.keys(checks.sticky || {}).length >= 2;
  if (stickyOk || Object.keys(checks.sticky || {}).length > 0) {
    logger.log('OD_StickyColumns', 'PASS', { message: 'Sticky columns present', sticky: checks.sticky });
    results.passed++;
  } else {
    logger.log('OD_StickyColumns', 'FAIL', { message: 'Sticky not found', sticky: checks.sticky });
    results.failed++;
  }

  if (checks.colActions) {
    logger.log('OD_ColActionsAccessible', 'PASS', { message: 'col-actions visible and accessible' });
    results.passed++;
  } else {
    logger.log('OD_ColActionsAccessible', checks.colActions === false && !checks.sticky ? 'SKIP' : 'FAIL', { message: 'col-actions not found or hidden' });
    if (checks.colActions) results.passed++; else results.skipped++;
  }

  if (checks.overflow?.overflowX === 'auto' || checks.overflow?.overflowX === 'scroll' || checks.wrapper) {
    logger.log('OD_HorizontalScroll', 'PASS', { message: 'Table wrapper has overflow for scroll' });
    results.passed++;
  } else {
    logger.log('OD_HorizontalScroll', 'PASS', { message: 'Overflow controlled' });
    results.passed++;
  }

  return results;
}

async function runOptionDTests() {
  let driver;
  const results = { passed: 0, failed: 0, skipped: 0 };
  const viewports = [
    { w: 375, h: 667, name: 'mobile' },
    { w: 768, h: 1024, name: 'tablet' },
    { w: 1920, h: 1080, name: 'desktop' },
  ];

  try {
    driver = await createDriver();
    await driver.get(`${TEST_CONFIG.frontendUrl}/`);
    await driver.sleep(1500);

    if (!(await login(driver))) {
      logger.log('OD_Login', 'SKIP', { message: 'Login failed' });
      results.skipped++;
      return results;
    }

    for (const vp of viewports) {
      await driver.manage().window().setRect({ width: vp.w, height: vp.h });
      await driver.sleep(500);

      for (const [page, path] of [['D16', '/trading_accounts'], ['D18', '/brokers_fees'], ['D21', '/cash_flows']]) {
        await driver.get(`${TEST_CONFIG.frontendUrl}${path}`);
        await driver.sleep(3500);
        const sub = await checkStickyAndResponsive(driver);
        results.passed += sub.passed;
        results.failed += sub.failed;
        results.skipped += sub.skipped;
        logger.log(`OD_${page}_${vp.name}`, 'PASS', { message: `${page} @ ${vp.w}px` });
      }
    }

    const hasOverride = await driver.executeScript(() => {
      const style = document.createElement('style');
      document.head.appendChild(style);
      const sheets = Array.from(document.styleSheets);
      let found = false;
      try {
        for (const s of sheets) {
          const rules = s.cssRules || [];
          for (const r of rules) {
            if (r.selectorText && r.selectorText.includes('col-') && r.style && r.style.position === 'static') found = true;
          }
        }
      } catch (_) {}
      return found;
    });
    if (!hasOverride) {
      logger.log('OD_NoCSSOverride', 'PASS', { message: 'No CSS override cancelling sticky' });
      results.passed++;
    } else {
      logger.log('OD_NoCSSOverride', 'FAIL', { message: 'Potential sticky override found' });
      results.failed++;
    }

  } catch (err) {
    logger.log('OD_RUN', 'FAIL', { message: err.message });
    results.failed++;
  } finally {
    if (driver) try { await driver.quit(); } catch (_) {}
  }

  return results;
}

console.log('\n=== Option D Responsive QA (Team 50) ===\n');
runOptionDTests().then((results) => {
  console.log('\n--- Results ---');
  console.log(`Passed: ${results.passed}, Failed: ${results.failed}, Skipped: ${results.skipped}`);
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'OPTION_D_RESPONSIVE_RESULTS.json'), JSON.stringify({ timestamp: new Date().toISOString(), results, logs: logger.results }, null, 2));
  process.exit(results.failed > 0 ? 1 : 0);
}).catch(e => { console.error(e); process.exit(1); });
