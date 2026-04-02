#!/usr/bin/env node
/**
 * Agents OS Pipeline Dashboard — browser smoke (Selenium).
 * Prerequisites: ./agents_os/scripts/start_ui_server.sh (v2 UI port 8092)
 *
 *   cd tests && HEADLESS=true node pipeline-dashboard-smoke.e2e.test.js
 */

import { createDriver } from './selenium-config.js';
import { By, until } from 'selenium-webdriver';

const DASHBOARD_URL =
  process.env.PIPELINE_DASHBOARD_URL ||
  'http://127.0.0.1:8092/static/PIPELINE_DASHBOARD.html';

async function waitWpPopulated(driver, timeoutMs = 25000) {
  await driver.wait(async () => {
    try {
      const el = await driver.findElement(By.id('s-wp'));
      const t = (await el.getText()).trim();
      return t.length > 0 && t !== '—' && !/^loading/i.test(t);
    } catch {
      return false;
    }
  }, timeoutMs);
}

async function run() {
  let driver;
  const out = { ok: false, errors: [] };
  try {
    driver = await createDriver();
    await driver.manage().setTimeouts({ pageLoad: 60000, implicit: 0 });

    await driver.get(DASHBOARD_URL);

    await driver.wait(until.elementLocated(By.id('domain-badge-header')), 20000);

    await waitWpPopulated(driver);

    const wpText = await driver.findElement(By.id('s-wp')).getText();
    const gateText = await driver.findElement(By.id('s-gate-pill')).getText();

    if (!/S\d{3}-P\d{3}-WP\d{3}/.test(wpText)) {
      throw new Error(`Unexpected WP strip text: ${wpText}`);
    }
    if (!gateText || gateText.trim() === '—') {
      throw new Error(`Gate pill empty: ${gateText}`);
    }

    const banner = await driver.findElement(By.id('current-step-banner')).getText();
    if (!banner || banner.trim().length < 3) {
      throw new Error('current-step-banner should not be empty after load');
    }

    await driver.wait(async () => {
      const m = await driver.findElement(By.id('mandate-content')).getText();
      return m && !/^loading/i.test(m.trim());
    }, 20000);

    const failedPanel = await driver
      .findElement(By.id('primary-state-read-failed-panel'))
      .getAttribute('style')
      .catch(() => '');
    if (failedPanel && !/display:\s*none/i.test(failedPanel)) {
      const vis = await driver
        .findElement(By.id('primary-state-read-failed-panel'))
        .isDisplayed()
        .catch(() => false);
      if (vis) {
        throw new Error('primary-state-read-failed-panel visible — JSON state not loaded');
      }
    }

    await driver.findElement(By.id('domain-btn-agentsos')).click();
    await driver.sleep(800);
    await driver.findElement(By.id('domain-btn-tiktrack')).click();
    await driver.sleep(800);
    await waitWpPopulated(driver, 15000);

    const logs = await driver.manage().logs().get('browser').catch(() => []);
    const severe = (logs || []).filter((e) => e.level && String(e.level).toUpperCase() === 'SEVERE');
    if (severe.length) {
      out.errors.push(...severe.map((e) => e.message));
    }

    console.log('PIPELINE_DASHBOARD_SMOKE: PASS');
    console.log('  WP:', wpText.trim());
    console.log('  Gate:', gateText.trim());
    console.log('  Banner (prefix):', (banner || '').trim().slice(0, 120));
    if (severe.length) {
      console.log('  WARN browser SEVERE:', severe.length);
    }
    out.ok = true;
  } catch (e) {
    console.error('PIPELINE_DASHBOARD_SMOKE: FAIL', e.message || e);
    process.exitCode = 1;
  } finally {
    if (driver) {
      await driver.quit().catch(() => {});
    }
  }
  return out;
}

run();
