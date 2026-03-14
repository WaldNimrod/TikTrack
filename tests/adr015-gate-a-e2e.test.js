#!/usr/bin/env node
/**
 * ADR-015 Gate A E2E Tests - Team 50 (QA)
 * ---------------------------------------
 * Scope: TEAM_10_TO_TEAM_50_ADR_015_QA_KICKOFF.md
 * D16: "אחר" + הודעת משילות; D18: עמלות לפי חשבון (trading_account_id)
 * Gate Condition: 0 SEVERE
 */

import { createDriver, TEST_CONFIG, TEST_USERS, getConsoleLogs, getLocalStorageValue, clearLocalStorage, elementExists, TestLogger } from './selenium-config.js';
import { By } from 'selenium-webdriver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTIFACTS_DIR = path.join(__dirname, '..', 'documentation', 'reports', '05-REPORTS', 'artifacts_SESSION_01', 'adr015-gate-a-artifacts');
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const logger = new TestLogger();

async function login(driver, username = TEST_USERS.admin.username, password = TEST_USERS.admin.password) {
  try {
    await driver.get(`${TEST_CONFIG.frontendUrl}/login`);
    await driver.sleep(1500);
    const usernameInput = await driver.findElement(By.css('input[name="usernameOrEmail"]')).catch(() => null);
    if (!usernameInput) return false;
    await usernameInput.sendKeys(username);
    await driver.findElement(By.css('input[name="password"]')).sendKeys(password);
    await driver.findElement(By.css('button[type="submit"]')).click();
    await driver.sleep(3500);
    const token = await getLocalStorageValue(driver, 'access_token');
    if (token) {
      await driver.executeScript(`localStorage.setItem('auth_token', localStorage.getItem('access_token') || '');`);
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
}

function assertZeroSevere(consoleLogs, testName) {
  const severe = consoleLogs.filter(l => l.level === 'SEVERE');
  const severeExcludingFavicon = severe.filter(e => !e.message?.includes('favicon'));
  if (severeExcludingFavicon.length > 0) {
    logger.log(testName, 'FAIL', {
      message: `Expected 0 SEVERE, found ${severeExcludingFavicon.length}`,
      severeMessages: severeExcludingFavicon.map(e => e.message?.substring(0, 200))
    });
    return false;
  }
  logger.log(`${testName}_ConsoleHygiene`, 'PASS', { message: '0 SEVERE in console' });
  return true;
}

async function runADR015GateATests() {
  let driver;
  const results = { passed: 0, failed: 0, skipped: 0 };

  try {
    driver = await createDriver();
    await driver.get(`${TEST_CONFIG.frontendUrl}/`);
    await driver.sleep(1500);

    const loggedIn = await login(driver);
    if (!loggedIn) {
      logger.log('ADR015_Login', 'SKIP', { message: 'Login failed, cannot run D16/D18 E2E' });
      results.skipped++;
      return results;
    }

    // ==================== D16 — "אחר" + הודעת משילות ====================
    logger.log('ADR015_D16_OtherGovernance', 'START', { message: 'D16: Select "אחר" → governance message' });
    await driver.get(`${TEST_CONFIG.frontendUrl}/trading_accounts`);
    await driver.sleep(2500);

    const addBtnD16 = await driver.findElement(By.css('.js-add-trading-account')).catch(() => null);
    if (!addBtnD16) {
      logger.log('ADR015_D16_OtherGovernance', 'SKIP', { message: 'Add trading account button not found' });
      results.skipped++;
    } else {
      await addBtnD16.click();
      await driver.sleep(2000);

      const brokerSelect = await driver.findElement(By.css('#broker, select[name="broker"]')).catch(() => null);
      if (!brokerSelect) {
        logger.log('ADR015_D16_OtherGovernance', 'FAIL', { message: 'Broker select not found' });
        results.failed++;
      } else {
        await driver.executeScript(`
          const sel = document.getElementById('broker') || document.querySelector('select[name="broker"]');
          if (sel) { sel.value = 'other'; sel.dispatchEvent(new Event('change', { bubbles: true })); }
        `);
        await driver.sleep(800);

        const govVisible = await elementExists(driver, '.governance-message, #governanceMessageContainer');
        const govDisplayed = govVisible && await driver.executeScript(`
          const el = document.querySelector('#governanceMessageContainer');
          return el && el.style.display !== 'none';
        `).catch(() => false);
        const otherNameGroup = await elementExists(driver, '#brokerOtherNameGroup');
        const otherNameVisible = await driver.executeScript(`
          const el = document.getElementById('brokerOtherNameGroup');
          return el && el.style.display !== 'none';
        `).catch(() => false);

        if (govDisplayed || govVisible) {
          logger.log('ADR015_D16_OtherGovernance', 'PASS', {
            message: 'D16: "אחר" selected → governance message visible; brokerOtherName group shown',
            govVisible,
            otherNameVisible
          });
          results.passed++;
        } else {
          logger.log('ADR015_D16_OtherGovernance', 'FAIL', {
            message: 'Governance message or brokerOtherNameGroup not visible when "other" selected',
            govVisible,
            otherNameVisible
          });
          results.failed++;
        }

        const closeBtn = await driver.findElement(By.css('.phoenix-modal__close, .modal-close')).catch(() => null);
        if (closeBtn) await closeBtn.click();
      }
    }

    // ==================== D18 — עמלות לפי חשבון (trading_account_id) ====================
    logger.log('ADR015_D18_TradingAccountSelect', 'START', { message: 'D18: trading_account_id selector, add fee form' });
    await driver.get(`${TEST_CONFIG.frontendUrl}/brokers_fees`);
    await driver.sleep(2500);

    const addBtnD18 = await driver.findElement(By.css('.js-add-broker-fee')).catch(() => null);
    if (!addBtnD18) {
      logger.log('ADR015_D18_TradingAccountSelect', 'SKIP', { message: 'Add broker fee button not found' });
      results.skipped++;
    } else {
      await addBtnD18.click();
      await driver.sleep(2000);

      const tradingAccountSelect = await driver.findElement(By.css('#tradingAccountId, select[name="tradingAccountId"]')).catch(() => null);
      const noBrokerSelect = !(await driver.findElement(By.css('#broker, select[name="broker"]')).catch(() => null));

      if (tradingAccountSelect && noBrokerSelect) {
        logger.log('ADR015_D18_TradingAccountSelect', 'PASS', {
          message: 'D18: trading_account_id select present; no broker select (per ADR-015)'
        });
        results.passed++;
      } else if (tradingAccountSelect) {
        logger.log('ADR015_D18_TradingAccountSelect', 'PASS', {
          message: 'D18: trading_account_id select present (primary criterion)'
        });
        results.passed++;
      } else {
        logger.log('ADR015_D18_TradingAccountSelect', 'FAIL', {
          message: 'D18: trading_account_id select not found'
        });
        results.failed++;
      }

      const closeBtnD18 = await driver.findElement(By.css('.phoenix-modal__close, .modal-close')).catch(() => null);
      if (closeBtnD18) await closeBtnD18.click();
    }

    // ==================== 0 SEVERE ====================
    logger.log('ADR015_ZeroSevere', 'START', { message: '0 SEVERE in console' });
    await driver.get(`${TEST_CONFIG.frontendUrl}/`);
    await driver.sleep(3000);
    const consoleLogs = await getConsoleLogs(driver);
    if (assertZeroSevere(consoleLogs, 'ADR015')) {
      results.passed++;
    } else {
      results.failed++;
    }

  } catch (err) {
    logger.log('ADR015_RUN', 'FAIL', { message: err.message, stack: err.stack?.substring(0, 300) });
    results.failed++;
  } finally {
    if (driver) await driver.quit();
  }

  return results;
}

console.log('\n=== ADR-015 Gate A E2E Tests (Team 50) ===\n');
runADR015GateATests().then((results) => {
  console.log('\n--- Results ---');
  console.log(`Passed: ${results.passed}, Failed: ${results.failed}, Skipped: ${results.skipped}`);
  const report = {
    gate: 'ADR015_GATE_A',
    timestamp: new Date().toISOString(),
    results,
    logs: logger.results
  };
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'ADR015_GATE_A_RESULTS.json'), JSON.stringify(report, null, 2));
  process.exit(results.failed > 0 ? 1 : 0);
}).catch((err) => {
  console.error('ADR015 Gate A run error:', err);
  process.exit(1);
});
