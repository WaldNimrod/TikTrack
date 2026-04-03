#!/usr/bin/env node
/**
 * DM-005 / ITEM-3 — Agents OS dashboard (domain=agents_os) — Selenium QA
 * Prerequisites: ./agents_os/scripts/start_ui_server.sh (v2 UI port 8092)
 *
 *   cd tests && HEADLESS=true SAVE_PIPELINE_EVIDENCE=1 node pipeline-dashboard-agents-os-dm005.e2e.test.js
 */

import { createDriver, TEST_CONFIG } from './selenium-config.js';
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
  process.env.PIPELINE_DM005_EVIDENCE_DIR ||
  path.join(REPO_ROOT, '_COMMUNICATION/team_101/TEAM_101_DM005_DASHBOARD_QA_EVIDENCE_2026-03-24');

function isLikelyHttp404ConsoleMessage(msg) {
  const s = String(msg || '');
  if (/net::ERR_ABORTED|404\s*\(Not Found\)|status of 404|HTTP error 404|Failed to load resource.*404/i.test(s)) {
    return true;
  }
  if (/\b404\b/.test(s) && /fetch|resource|http|GET/i.test(s)) {
    return true;
  }
  return false;
}

async function waitWpPopulated(driver, timeoutMs = 30000) {
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
  const report = {
    ok: false,
    domain: 'agents_os',
    wp: '',
    gate: '',
    owner: '',
    expectedTeam: '',
    bannerPrefix: '',
    severe: [],
    suspicious404ish: [],
    network404Hints: [],
  };

  try {
    driver = await createDriver();
    await driver.manage().setTimeouts({
      pageLoad: TEST_CONFIG.pageLoadTimeout,
      implicit: 0,
    });

    await driver.get(DASHBOARD_URL);
    await driver.wait(until.elementLocated(By.id('domain-badge-header')), 20000);

    await driver.executeScript(() => {
      localStorage.setItem('pipeline_domain', 'agents_os');
      location.reload();
    });

    await driver.wait(until.elementLocated(By.id('domain-badge-header')), 20000);
    await driver.wait(
      async () => {
        const t = await driver.findElement(By.id('domain-badge-header')).getText();
        return /agents/i.test(t || '');
      },
      15000,
      'domain-badge-header should show agents_os'
    );

    await waitWpPopulated(driver);

    report.wp = (await driver.findElement(By.id('s-wp')).getText()).trim();
    report.gate = (await driver.findElement(By.id('s-gate-pill')).getText()).trim();
    report.owner = (await driver.findElement(By.id('s-owner')).getText()).trim();
    report.expectedTeam = (await driver.findElement(By.id('team-assignment-expected')).getText()).trim();
    const banner = await driver.findElement(By.id('current-step-banner')).getText();
    report.bannerPrefix = (banner || '').trim().slice(0, 200);

    // When current_gate is COMPLETE, sidebar intentionally shows "—" for s-owner
    // and often for team-assignment-expected (pipeline-dashboard.js isComplete branch).
    const isWpClosedUi =
      /WP\s+CLOSED/i.test(report.gate) || /Work Package Closed/i.test(report.bannerPrefix);

    if (!/S\d{3}-P\d{3}-WP\d{3}/.test(report.wp)) {
      throw new Error(`Unexpected WP text: ${report.wp}`);
    }
    if (!isWpClosedUi) {
      if (!report.owner || report.owner === '—') {
        throw new Error(`Owner strip empty: ${report.owner}`);
      }
      if (!report.expectedTeam || report.expectedTeam === '—') {
        throw new Error(`team-assignment-expected empty: ${report.expectedTeam}`);
      }
    } else {
      if (report.owner !== '—') {
        throw new Error(`Expected sidebar owner "—" when WP CLOSED, got: ${report.owner}`);
      }
    }
    if (!report.bannerPrefix || report.bannerPrefix.length < 5) {
      throw new Error('current-step-banner empty after load');
    }

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
        throw new Error('primary-state-read-failed-panel visible — pipeline state not loaded');
      }
    }

    const logs = await driver.manage().logs().get('browser').catch(() => []);
    for (const e of logs || []) {
      const lev = e.level && String(e.level).toUpperCase();
      const msg = e.message || '';
      if (lev === 'SEVERE') {
        report.severe.push(msg);
      }
      if (isLikelyHttp404ConsoleMessage(msg)) {
        report.suspicious404ish.push(msg);
      }
    }

    const netProbe = await driver
      .executeScript(() => {
        try {
          const entries = performance.getEntriesByType('resource') || [];
          return entries
            .filter((r) => {
              const n = r.name || '';
              return (
                n.includes('_COMMUNICATION') &&
                (r.transferSize === 0 || (r.duration > 0 && r.decodedBodySize === 0))
              );
            })
            .slice(0, 20)
            .map((r) => ({
              name: r.name,
              transferSize: r.transferSize,
              decodedBodySize: r.decodedBodySize,
            }));
        } catch {
          return [];
        }
      })
      .catch(() => []);

    if (Array.isArray(netProbe) && netProbe.length) {
      report.network404Hints = netProbe;
    }

    if (report.severe.length) {
      throw new Error(`SEVERE console logs: ${report.severe.length}\n${report.severe.slice(0, 5).join('\n')}`);
    }
    if (report.suspicious404ish.length) {
      throw new Error(
        `Console messages suggest 404/network failure: ${report.suspicious404ish.length}\n${report.suspicious404ish.slice(0, 6).join('\n')}`
      );
    }

    report.ok = true;

    if (process.env.SAVE_PIPELINE_EVIDENCE === '1') {
      fs.mkdirSync(EVIDENCE_DIR, { recursive: true });
      const png = await driver.takeScreenshot();
      const out = path.join(
        EVIDENCE_DIR,
        `agents-os-dashboard-dm005-${new Date().toISOString().replace(/[:.]/g, '-')}.png`
      );
      fs.writeFileSync(out, png, 'base64');
      fs.writeFileSync(
        path.join(EVIDENCE_DIR, 'agents-os-dashboard-dm005-report.json'),
        JSON.stringify(report, null, 2),
        'utf8'
      );
      console.log('DM005_DASHBOARD_QA: evidence ->', path.relative(REPO_ROOT, out));
    }

    console.log('DM005_DASHBOARD_QA_AGENTS_OS: PASS');
    console.log('  WP:', report.wp);
    console.log('  Gate (prefix):', report.gate.slice(0, 120));
    console.log('  Owner:', report.owner);
    console.log('  Expected team:', report.expectedTeam);
    console.log('  Banner (prefix):', report.bannerPrefix.slice(0, 160));
  } catch (e) {
    console.error('DM005_DASHBOARD_QA_AGENTS_OS: FAIL', e.message || e);
    process.exitCode = 1;
  } finally {
    if (driver) await driver.quit().catch(() => {});
  }
}

run();
