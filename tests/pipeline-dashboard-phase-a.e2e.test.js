#!/usr/bin/env node
/**
 * Pipeline dashboard — Phase A extended checks (Selenium).
 * State-aware: adapts file-badge assertions to current gate state.
 *   Active WP  → expects files-badge "n/m" + expected-file-row elements
 *   Closed/None → expects files-badge "N/A" + "not applicable" message
 * Prerequisites: ./agents_os/scripts/start_ui_server.sh (v2 UI port 8092)
 *
 *   cd tests && HEADLESS=true SAVE_PIPELINE_EVIDENCE=1 node pipeline-dashboard-phase-a.e2e.test.js
 */

import { createDriver } from './selenium-config.js';
import { By, until } from 'selenium-webdriver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const DASHBOARD_URL =
  process.env.PIPELINE_DASHBOARD_URL ||
  'http://127.0.0.1:8092/static/PIPELINE_DASHBOARD.html';

const EVIDENCE_DIR =
  process.env.PIPELINE_EVIDENCE_DIR ||
  path.join(
    REPO_ROOT,
    '_COMMUNICATION/team_101/TEAM_101_SIMULATION_EVIDENCE_S003-P013-WP002'
  );

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
  try {
    driver = await createDriver();
    await driver.manage().setTimeouts({ pageLoad: 60000, implicit: 0 });

    await driver.get(DASHBOARD_URL);
    await driver.wait(until.elementLocated(By.id('domain-badge-header')), 20000);
    await waitWpPopulated(driver);

    const wpText = (await driver.findElement(By.id('s-wp')).getText()).trim();
    const gateText = (await driver.findElement(By.id('s-gate-pill')).getText()).trim();

    if (!/S\d{3}-P\d{3}-WP\d{3}/.test(wpText)) {
      throw new Error(`Unexpected WP strip text: ${wpText}`);
    }
    if (!gateText || gateText === '—') {
      throw new Error(`Gate pill empty: ${gateText}`);
    }

    await driver.wait(until.elementLocated(By.css('[data-testid="dashboard-wp-gate-strip"]')), 15000);

    // State-aware: determine if WP is active or closed/none
    const isClosedState = /COMPLETE|CLOSED|N\/A|NONE/i.test(gateText) || !gateText || gateText === '—';

    // Wait for files-badge to settle — accepts "n/m" (active) or "N/A" (closed/none)
    await driver.wait(async () => {
      try {
        const badge = await driver.findElement(By.id('files-badge')).getText();
        return isClosedState ? badge === 'N/A' : /\d+\s*\/\s*\d+/.test(badge);
      } catch { return false; }
    }, 20000, `files-badge did not settle — expected ${isClosedState ? '"N/A"' : 'n/m format'} (gate: "${gateText}")`);

    let fileRows = [];
    if (isClosedState) {
      // Closed state: verify "not applicable" message — no file rows expected
      await driver.wait(async () => {
        const raw = await driver.executeScript(() => {
          const el = document.getElementById('file-list');
          return el ? (el.innerText || el.textContent || '').trim() : '';
        });
        return /not applicable|no active work/i.test(raw);
      }, 10000, 'Expected "not applicable" message in file-list when gate is COMPLETE/NONE');
    } else {
      // Active WP: verify file-list populated and rows present
      await driver.wait(async () => {
        const raw = await driver.executeScript(() => {
          const el = document.getElementById('file-list');
          return el ? (el.innerText || '').trim() : '';
        });
        return raw.length > 8 && !/^loading/i.test(raw);
      }, 30000, 'file-list did not populate');
      fileRows = await driver.findElements(By.css('[data-testid="expected-file-row"]'));
      if (fileRows.length < 1) {
        throw new Error('no expected-file-row elements found in active WP state (check UI server + static paths)');
      }
    }

    if (process.env.SAVE_PIPELINE_EVIDENCE === '1') {
      fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
      const png = await driver.takeScreenshot();
      const out = path.join(
        EVIDENCE_DIR,
        `phase-a-${new Date().toISOString().replace(/[:.]/g, '-')}.png`
      );
      fs.writeFileSync(out, png, 'base64');
      console.log('PIPELINE_PHASE_A: evidence PNG ->', path.relative(REPO_ROOT, out));
    }

    console.log('PIPELINE_PHASE_A: PASS');
    console.log('  WP:', wpText);
    console.log('  Gate:', gateText, isClosedState ? '(closed state — N/A path)' : '(active state — n/m path)');
    console.log('  File rows:', isClosedState ? 'N/A (not applicable)' : fileRows.length);
  } catch (e) {
    console.error('PIPELINE_PHASE_A: FAIL', e.message || e);
    process.exitCode = 1;
  } finally {
    if (driver) await driver.quit().catch(() => {});
  }
}

run();
