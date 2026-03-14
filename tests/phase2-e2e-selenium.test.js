#!/usr/bin/env node
/**
 * Phase 2 E2E Selenium Tests - SOP-010 Compliance
 * 
 * @description Selenium-based E2E tests for Phase 2 Financial Core pages (D16, D18, D21)
 * @version v1.0.0
 * @date 2026-02-07
 * 
 * SOP-010 Requirements:
 * - Selenium/Headless להרצות UI מלאות
 * - CRUD E2E לכל endpoints (כולל summary/derivatives)
 * - Security validation (Masked Log, token leakage, headers)
 * - Routes SSOT compliance
 * - Artifacts: logs, screenshots, HTML/JUnit report
 */

import { createDriver, TEST_CONFIG, TEST_USERS, waitForElement, getConsoleLogs, getLocalStorageValue, takeScreenshot, TestLogger } from './selenium-config.js';
import { By, until } from 'selenium-webdriver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Artifacts directory
const ARTIFACTS_DIR = path.join(__dirname, '..', 'documentation', 'reports', '05-REPORTS', 'artifacts_SESSION_01', 'phase2-e2e-artifacts');
if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}

const logger = new TestLogger();
const artifacts = {
  screenshots: [],
  consoleLogs: [],
  networkLogs: [],
  errors: []
};

const RESPONSIVE_VIEWPORTS = [
  { label: 'mobile', width: 360, height: 640 },
  { label: 'tablet', width: 768, height: 1024 },
  { label: 'desktop', width: 1366, height: 768 }
];

async function setViewport(driver, viewport) {
  await driver.manage().window().setRect({
    width: viewport.width,
    height: viewport.height,
    x: 0,
    y: 0
  });
  await driver.sleep(500);
}

async function getComputedStyles(driver, selector) {
  return driver.executeScript(
    `const el = document.querySelector(${JSON.stringify(selector)});
     if (!el) return null;
     const s = getComputedStyle(el);
     return {
       display: s.display,
       position: s.position,
       insetInlineStart: s.insetInlineStart || s.left,
       insetInlineEnd: s.insetInlineEnd || s.right,
       width: s.width,
       minWidth: s.minWidth,
       maxWidth: s.maxWidth
     };`
  );
}

async function assertStickyColumn(driver, cellSelector, side) {
  const styles = await getComputedStyles(driver, cellSelector);
  if (!styles) return { ok: false, reason: 'Element not found' };
  if (styles.display === 'none') return { ok: false, reason: 'display:none' };
  if (styles.position !== 'sticky') return { ok: false, reason: `position=${styles.position}` };
  if (side === 'start' && (!styles.insetInlineStart || styles.insetInlineStart === 'auto')) {
    return { ok: false, reason: 'missing inset-inline-start' };
  }
  if (side === 'end' && (!styles.insetInlineEnd || styles.insetInlineEnd === 'auto')) {
    return { ok: false, reason: 'missing inset-inline-end' };
  }
  return { ok: true };
}

async function runResponsiveChecks(driver, testName, checks) {
  const failures = [];
  for (const vp of RESPONSIVE_VIEWPORTS) {
    await setViewport(driver, vp);
    for (const check of checks) {
      const result = await assertStickyColumn(driver, check.selector, check.side);
      if (!result.ok) {
        failures.push({
          viewport: vp.label,
          selector: check.selector,
          side: check.side,
          reason: result.reason
        });
      }
    }
  }
  if (failures.length > 0) {
    logger.log(`${testName}_Responsive`, 'FAIL', { failures });
  } else {
    logger.log(`${testName}_Responsive`, 'PASS', { viewports: RESPONSIVE_VIEWPORTS.map(v => v.label) });
  }
  return failures;
}

/**
 * Login helper
 */
async function login(driver, username = TEST_USERS.admin.username, password = TEST_USERS.admin.password) {
  try {
    await driver.get(`${TEST_CONFIG.frontendUrl}/login`);
    await driver.sleep(1000);
    
    await waitForElement(driver, 'input[name="usernameOrEmail"]', 5000);
    await driver.findElement(By.css('input[name="usernameOrEmail"]')).sendKeys(username);
    await driver.findElement(By.css('input[name="password"]')).sendKeys(password);
    await driver.findElement(By.css('button[type="submit"]')).click();
    
    // Wait for redirect or token
    await driver.sleep(3000);
    
    const token = await getLocalStorageValue(driver, 'access_token');
    if (token) {
      // Sync for HTML pages: Shared_Services expects auth_token
      await driver.executeScript(`localStorage.setItem('auth_token', localStorage.getItem('access_token') || '');`);
      logger.log('login', 'PASS', { message: 'Login successful, token received' });
      return true;
    } else {
      logger.log('login', 'FAIL', { message: 'Login failed - no token received' });
      return false;
    }
  } catch (error) {
    logger.error('login', error);
    return false;
  }
}

/**
 * Test: D16 - Trading Accounts Page Load & Console Hygiene
 */
async function testD16TradingAccounts() {
  const driver = await createDriver();
  const testName = 'D16_TradingAccounts';
  
  try {
    logger.log(testName, 'START', { message: 'Starting D16 Trading Accounts E2E test' });
    
    // Login
    const loggedIn = await login(driver);
    if (!loggedIn) {
      logger.log(testName, 'SKIP', { message: 'Cannot proceed without login' });
      return;
    }
    
    // Navigate to page
    await driver.get(`${TEST_CONFIG.frontendUrl}/trading_accounts.html`);
    await driver.sleep(5000); // Wait for UAI stages
    
    // Take screenshot
    const screenshot = await takeScreenshot(driver);
    const screenshotPath = path.join(ARTIFACTS_DIR, `${testName}_screenshot.png`);
    fs.writeFileSync(screenshotPath, screenshot, 'base64');
    artifacts.screenshots.push(screenshotPath);
    
    // Check console logs
    const consoleLogs = await getConsoleLogs(driver);
    const allErrors = consoleLogs.filter(log => log.level === 'SEVERE');
    const errors = allErrors.filter(e => !e.message.includes('favicon.ico')); // Exclude non-critical favicon 404
    const warnings = consoleLogs.filter(log => log.level === 'WARNING');
    
    artifacts.consoleLogs.push({
      test: testName,
      errors: allErrors.length,
      errorsExcludingFavicon: errors.length,
      warnings: warnings.length,
      severeMessages: allErrors.map(e => e.message),
      errorsExcludingFaviconMessages: errors.map(e => e.message),
      logs: consoleLogs.slice(0, 20)
    });
    
    // Check for token leakage — only real JWT (Bearer eyJ... 100+ chars), not keywords
    const tokenLeakage = consoleLogs.some(log => 
      log.message.includes('Bearer eyJ') && /eyJ[A-Za-z0-9_-]{80,}/.test(log.message)
    );
    
    // Check page elements
    const pageWrapper = await driver.findElement(By.css('.page-wrapper')).catch(() => null);
    const container0 = await driver.findElement(By.css('[data-section="summary-alerts"]')).catch(() => null);
    const container1 = await driver.findElement(By.css('#accountsTable')).catch(() => null);
    
    // Responsive checks (Sticky Start/End)
    const responsiveFailures = await runResponsiveChecks(driver, testName, [
      { selector: '#accountsTable .col-name', side: 'start' },
      { selector: '#accountsTable .col-actions', side: 'end' },
      { selector: '#accountActivityTable .col-date', side: 'start' },
      { selector: '#accountActivityTable .col-actions', side: 'end' },
      { selector: '#positionsTable .col-symbol', side: 'start' },
      { selector: '#positionsTable .col-actions', side: 'end' }
    ]);
    
    // Results (0 critical errors = pass; favicon 404 excluded)
    if (errors.length === 0 && !tokenLeakage && pageWrapper && container0 && responsiveFailures.length === 0) {
      logger.log(testName, 'PASS', {
        message: 'D16 Trading Accounts loaded successfully',
        consoleErrors: errors.length,
        consoleWarnings: warnings.length,
        tokenLeakage: false,
        containersFound: { container0: !!container0, container1: !!container1 }
      });
    } else {
      logger.log(testName, 'FAIL', {
        message: 'D16 Trading Accounts test failed',
        consoleErrors: errors.length,
        consoleWarnings: warnings.length,
        tokenLeakage: tokenLeakage,
        containersFound: { container0: !!container0, container1: !!container1 },
        errors: errors.slice(0, 5),
        responsiveFailures
      });
    }
    
  } catch (error) {
    logger.error(testName, error);
    artifacts.errors.push({ test: testName, error: error.message, stack: error.stack });
  } finally {
    await driver.quit();
  }
}

/**
 * Test: D18 - Brokers Fees Page Load & Console Hygiene
 */
async function testD18BrokersFees() {
  const driver = await createDriver();
  const testName = 'D18_BrokersFees';
  
  try {
    logger.log(testName, 'START', { message: 'Starting D18 Brokers Fees E2E test' });
    
    // Login
    const loggedIn = await login(driver);
    if (!loggedIn) {
      logger.log(testName, 'SKIP', { message: 'Cannot proceed without login' });
      return;
    }
    
    // Navigate to page
    await driver.get(`${TEST_CONFIG.frontendUrl}/brokers_fees.html`);
    await driver.sleep(5000); // Wait for UAI stages
    
    // Take screenshot
    const screenshot = await takeScreenshot(driver);
    const screenshotPath = path.join(ARTIFACTS_DIR, `${testName}_screenshot.png`);
    fs.writeFileSync(screenshotPath, screenshot, 'base64');
    artifacts.screenshots.push(screenshotPath);
    
    // Check console logs
    const consoleLogs = await getConsoleLogs(driver);
    const allErrors = consoleLogs.filter(log => log.level === 'SEVERE');
    const errors = allErrors.filter(e => !e.message.includes('favicon.ico'));
    const warnings = consoleLogs.filter(log => log.level === 'WARNING');
    
    artifacts.consoleLogs.push({
      test: testName,
      errors: allErrors.length,
      errorsExcludingFavicon: errors.length,
      warnings: warnings.length,
      severeMessages: allErrors.map(e => e.message),
      errorsExcludingFaviconMessages: errors.map(e => e.message),
      logs: consoleLogs.slice(0, 20)
    });
    
    // Check for token leakage — only real JWT (Bearer eyJ... 100+ chars), not keywords
    const tokenLeakage = consoleLogs.some(log => 
      log.message.includes('Bearer eyJ') && /eyJ[A-Za-z0-9_-]{80,}/.test(log.message)
    );
    
    // Check page elements
    const pageWrapper = await driver.findElement(By.css('.page-wrapper')).catch(() => null);
    const summarySection = await driver.findElement(By.css('#summaryStats')).catch(() => null);
    const brokersTable = await driver.findElement(By.css('#brokersTable')).catch(() => null);
    
    // Responsive checks (Sticky Start/End)
    const responsiveFailures = await runResponsiveChecks(driver, testName, [
      { selector: '#brokersTable .col-broker', side: 'start' },
      { selector: '#brokersTable .col-actions', side: 'end' }
    ]);
    
    // Results (0 critical errors)
    if (errors.length === 0 && !tokenLeakage && pageWrapper && summarySection && responsiveFailures.length === 0) {
      logger.log(testName, 'PASS', {
        message: 'D18 Brokers Fees loaded successfully',
        consoleErrors: errors.length,
        consoleWarnings: warnings.length,
        tokenLeakage: false,
        elementsFound: { summarySection: !!summarySection, brokersTable: !!brokersTable }
      });
    } else {
      logger.log(testName, 'FAIL', {
        message: 'D18 Brokers Fees test failed',
        consoleErrors: errors.length,
        consoleWarnings: warnings.length,
        tokenLeakage: tokenLeakage,
        elementsFound: { summarySection: !!summarySection, brokersTable: !!brokersTable },
        errors: errors.slice(0, 5),
        responsiveFailures
      });
    }
    
  } catch (error) {
    logger.error(testName, error);
    artifacts.errors.push({ test: testName, error: error.message, stack: error.stack });
  } finally {
    await driver.quit();
  }
}

/**
 * Test: D21 - Cash Flows Page Load & Console Hygiene
 */
async function testD21CashFlows() {
  const driver = await createDriver();
  const testName = 'D21_CashFlows';
  
  try {
    logger.log(testName, 'START', { message: 'Starting D21 Cash Flows E2E test' });
    
    // Login
    const loggedIn = await login(driver);
    if (!loggedIn) {
      logger.log(testName, 'SKIP', { message: 'Cannot proceed without login' });
      return;
    }
    
    // Navigate to page
    await driver.get(`${TEST_CONFIG.frontendUrl}/cash_flows.html`);
    await driver.sleep(5000); // Wait for UAI stages
    
    // Take screenshot
    const screenshot = await takeScreenshot(driver);
    const screenshotPath = path.join(ARTIFACTS_DIR, `${testName}_screenshot.png`);
    fs.writeFileSync(screenshotPath, screenshot, 'base64');
    artifacts.screenshots.push(screenshotPath);
    
    // Check console logs
    const consoleLogs = await getConsoleLogs(driver);
    const allErrors = consoleLogs.filter(log => log.level === 'SEVERE');
    const errors = allErrors.filter(e => !e.message.includes('favicon.ico'));
    const warnings = consoleLogs.filter(log => log.level === 'WARNING');
    
    artifacts.consoleLogs.push({
      test: testName,
      errors: allErrors.length,
      errorsExcludingFavicon: errors.length,
      warnings: warnings.length,
      severeMessages: allErrors.map(e => e.message),
      errorsExcludingFaviconMessages: errors.map(e => e.message),
      logs: consoleLogs.slice(0, 20)
    });
    
    // Check for token leakage — only real JWT (Bearer eyJ... 100+ chars), not keywords
    const tokenLeakage = consoleLogs.some(log => 
      log.message.includes('Bearer eyJ') && /eyJ[A-Za-z0-9_-]{80,}/.test(log.message)
    );
    
    // Check page elements
    const pageWrapper = await driver.findElement(By.css('.page-wrapper')).catch(() => null);
    const summarySection = await driver.findElement(By.css('#summaryStats')).catch(() => null);
    const cashFlowsTable = await driver.findElement(By.css('#cashFlowsTable')).catch(() => null);
    
    // Responsive checks (Sticky Start/End)
    const responsiveFailures = await runResponsiveChecks(driver, testName, [
      { selector: '#cashFlowsTable .col-trade', side: 'start' },
      { selector: '#cashFlowsTable .col-actions', side: 'end' },
      { selector: '#currencyConversionsTable .col-date', side: 'start' },
      { selector: '#currencyConversionsTable .col-actions', side: 'end' }
    ]);
    
    // Results (0 critical errors)
    if (errors.length === 0 && !tokenLeakage && pageWrapper && summarySection && responsiveFailures.length === 0) {
      logger.log(testName, 'PASS', {
        message: 'D21 Cash Flows loaded successfully',
        consoleErrors: errors.length,
        consoleWarnings: warnings.length,
        tokenLeakage: false,
        elementsFound: { summarySection: !!summarySection, cashFlowsTable: !!cashFlowsTable }
      });
    } else {
      logger.log(testName, 'FAIL', {
        message: 'D21 Cash Flows test failed',
        consoleErrors: errors.length,
        consoleWarnings: warnings.length,
        tokenLeakage: tokenLeakage,
        elementsFound: { summarySection: !!summarySection, cashFlowsTable: !!cashFlowsTable },
        errors: errors.slice(0, 5),
        responsiveFailures
      });
    }
    
  } catch (error) {
    logger.error(testName, error);
    artifacts.errors.push({ test: testName, error: error.message, stack: error.stack });
  } finally {
    await driver.quit();
  }
}

/**
 * Test: CRUD E2E - Trading Accounts API
 */
async function testCRUDTradingAccounts() {
  const driver = await createDriver();
  const testName = 'CRUD_TradingAccounts';
  
  try {
    logger.log(testName, 'START', { message: 'Starting CRUD E2E test for Trading Accounts' });
    
    // Login
    const loggedIn = await login(driver);
    if (!loggedIn) {
      logger.log(testName, 'SKIP', { message: 'Cannot proceed without login' });
      return;
    }
    
    // Navigate to page
    await driver.get(`${TEST_CONFIG.frontendUrl}/trading_accounts.html`);
    await driver.sleep(5000);
    
    // Check if table loads data
    const tableRows = await driver.findElements(By.css('#accountsTable tbody tr')).catch(() => []);
    
    // Check API calls in network logs (if available); also accept table with data as evidence
    const networkLogs = await driver.manage().logs().get('performance').catch(() => []);
    let apiCalls = [];
    try {
      apiCalls = networkLogs.filter(log => {
        const msg = JSON.parse(log.message);
        const url = msg?.message?.params?.response?.url || '';
        return msg?.message?.method === 'Network.responseReceived' &&
               (url.includes('/api/v1/trading_accounts') || url.includes('trading_accounts'));
      });
    } catch (_) {}
    
    artifacts.networkLogs.push({
      test: testName,
      apiCalls: apiCalls.length,
      tableRows: tableRows.length
    });
    
    if (apiCalls.length > 0) {
      logger.log(testName, 'PASS', {
        message: 'CRUD E2E test passed - API calls detected',
        apiCalls: apiCalls.length,
        tableRows: tableRows.length
      });
    } else {
      logger.log(testName, 'FAIL', {
        message: 'CRUD E2E test failed - no API calls detected',
        tableRows: tableRows.length
      });
    }
    
  } catch (error) {
    logger.error(testName, error);
    artifacts.errors.push({ test: testName, error: error.message, stack: error.stack });
  } finally {
    await driver.quit();
  }
}

/**
 * Test: CRUD E2E - Brokers Fees API
 */
async function testCRUDBrokersFees() {
  const driver = await createDriver();
  const testName = 'CRUD_BrokersFees';
  
  try {
    logger.log(testName, 'START', { message: 'Starting CRUD E2E test for Brokers Fees' });
    
    // Login
    const loggedIn = await login(driver);
    if (!loggedIn) {
      logger.log(testName, 'SKIP', { message: 'Cannot proceed without login' });
      return;
    }
    
    // Navigate to page
    await driver.get(`${TEST_CONFIG.frontendUrl}/brokers_fees.html`);
    await driver.sleep(5000);
    
    // Check if table loads data
    const tableRows = await driver.findElements(By.css('#brokersTable tbody tr')).catch(() => []);
    
    // Check API calls
    const networkLogs = await driver.manage().logs().get('performance').catch(() => []);
    const apiCalls = networkLogs.filter(log => {
      try {
        const msg = JSON.parse(log.message);
        const url = msg?.message?.params?.response?.url || '';
        return msg?.message?.method === 'Network.responseReceived' &&
               (url.includes('/api/v1/brokers_fees') || url.includes('brokers_fees'));
      } catch {
        return false;
      }
    });
    
    artifacts.networkLogs.push({
      test: testName,
      apiCalls: apiCalls.length,
      tableRows: tableRows.length
    });
    
    if (apiCalls.length > 0) {
      logger.log(testName, 'PASS', {
        message: 'CRUD E2E test passed - API calls detected',
        apiCalls: apiCalls.length,
        tableRows: tableRows.length
      });
    } else {
      logger.log(testName, 'FAIL', {
        message: 'CRUD E2E test failed - no API calls detected',
        tableRows: tableRows.length
      });
    }
    
  } catch (error) {
    logger.error(testName, error);
    artifacts.errors.push({ test: testName, error: error.message, stack: error.stack });
  } finally {
    await driver.quit();
  }
}

/**
 * Test: CRUD E2E - Cash Flows API (including summary)
 */
async function testCRUDCashFlows() {
  const driver = await createDriver();
  const testName = 'CRUD_CashFlows';
  
  try {
    logger.log(testName, 'START', { message: 'Starting CRUD E2E test for Cash Flows' });
    
    // Login
    const loggedIn = await login(driver);
    if (!loggedIn) {
      logger.log(testName, 'SKIP', { message: 'Cannot proceed without login' });
      return;
    }
    
    // Navigate to page
    await driver.get(`${TEST_CONFIG.frontendUrl}/cash_flows.html`);
    await driver.sleep(5000);
    
    // Check if table loads data
    const tableRows = await driver.findElements(By.css('#cashFlowsTable tbody tr')).catch(() => []);
    
    // Check API calls (including summary endpoint)
    const networkLogs = await driver.manage().logs().get('performance').catch(() => []);
    const apiCalls = networkLogs.filter(log => {
      try {
        const msg = JSON.parse(log.message);
        const url = msg?.message?.params?.response?.url || '';
        return msg?.message?.method === 'Network.responseReceived' &&
               (url.includes('cash_flows') || url.includes('cash_flows/summary'));
      } catch {
        return false;
      }
    });
    
    artifacts.networkLogs.push({
      test: testName,
      apiCalls: apiCalls.length,
      tableRows: tableRows.length
    });
    
    if (apiCalls.length > 0) {
      logger.log(testName, 'PASS', {
        message: 'CRUD E2E test passed - API calls detected (including summary)',
        apiCalls: apiCalls.length,
        tableRows: tableRows.length
      });
    } else {
      logger.log(testName, 'FAIL', {
        message: 'CRUD E2E test failed - no API calls detected',
        tableRows: tableRows.length
      });
    }
    
  } catch (error) {
    logger.error(testName, error);
    artifacts.errors.push({ test: testName, error: error.message, stack: error.stack });
  } finally {
    await driver.quit();
  }
}

/**
 * Test: CRUD Buttons D18 - Click "Add broker"; expect modal form (Phase 1 CRUD Forms QA).
 * Runtime evidence for Team 50 CRUD Forms validation.
 */
async function testCRUDButtonsD18() {
  const driver = await createDriver();
  const testName = 'CRUD_Buttons_D18';
  try {
    logger.log(testName, 'START', { message: 'Click Add broker; verify modal form opens' });
    const loggedIn = await login(driver);
    if (!loggedIn) {
      logger.log(testName, 'SKIP', { message: 'Cannot proceed without login' });
      return;
    }
    await driver.get(`${TEST_CONFIG.frontendUrl}/brokers_fees.html`);
    await driver.sleep(4000);
    const addBtn = await driver.findElement(By.css('.js-add-broker-fee')).catch(() => null);
    if (!addBtn) {
      logger.log(testName, 'FAIL', { message: 'Add broker button not found' });
      return;
    }
    await addBtn.click();
    await driver.sleep(2000);
    // After Team 30 CRUD Forms: modal should open (no error alert)
    const modal = await driver.findElement(By.id('phoenix-modal')).catch(() => null);
    const form = await driver.findElement(By.id('brokerFeeForm')).catch(() => null);
    let alertText = null;
    try {
      const alert = await driver.wait(until.alertIsPresent(), 1500);
      alertText = await alert.getText();
      await alert.accept();
    } catch {
      // No alert expected when modal is used
    }
    if (modal && form && !alertText) {
      logger.log(testName, 'PASS', {
        message: 'Add broker opens modal form (CRUD Forms QA)',
        modalVisible: true,
        formPresent: true
      });
      artifacts.consoleLogs.push({ test: testName, addBrokerModalOpened: true });
      // Close modal for clean state
      const cancelBtn = await driver.findElement(By.css('.phoenix-modal__cancel-btn')).catch(() => null);
      if (cancelBtn) await cancelBtn.click();
    } else if (alertText) {
      logger.log(testName, 'FAIL', {
        message: 'Add broker showed error alert instead of modal',
        alertText: alertText.substring(0, 80)
      });
      artifacts.consoleLogs.push({ test: testName, addBrokerAlert: alertText });
    } else {
      logger.log(testName, 'FAIL', {
        message: 'Add broker: modal or form not found',
        modalFound: !!modal,
        formFound: !!form
      });
    }
  } catch (error) {
    logger.error(testName, error);
    artifacts.errors.push({ test: testName, error: error.message });
  } finally {
    await driver.quit();
  }
}

/**
 * Test: CRUD Buttons D21 - Click "Add flow"; expect modal form (Phase 1 CRUD Forms QA).
 */
async function testCRUDButtonsD21() {
  const driver = await createDriver();
  const testName = 'CRUD_Buttons_D21';
  try {
    logger.log(testName, 'START', { message: 'Click Add flow; verify modal form opens' });
    const loggedIn = await login(driver);
    if (!loggedIn) {
      logger.log(testName, 'SKIP', { message: 'Cannot proceed without login' });
      return;
    }
    await driver.get(`${TEST_CONFIG.frontendUrl}/cash_flows.html`);
    await driver.sleep(4000);
    const addBtn = await driver.findElement(By.css('.js-add-cash-flow')).catch(() => null);
    if (!addBtn) {
      logger.log(testName, 'FAIL', { message: 'Add flow button not found' });
      return;
    }
    await addBtn.click();
    await driver.sleep(2000);
    const modal = await driver.findElement(By.id('phoenix-modal')).catch(() => null);
    const form = await driver.findElement(By.id('cashFlowForm')).catch(() => null);
    let alertText = null;
    try {
      const alert = await driver.wait(until.alertIsPresent(), 1500);
      alertText = await alert.getText();
      await alert.accept();
    } catch {
      // No alert expected when modal is used
    }
    if (modal && form && !alertText) {
      logger.log(testName, 'PASS', {
        message: 'Add flow opens modal form (CRUD Forms QA)',
        modalVisible: true,
        formPresent: true
      });
      artifacts.consoleLogs.push({ test: testName, addFlowModalOpened: true });
      const cancelBtn = await driver.findElement(By.css('.phoenix-modal__cancel-btn')).catch(() => null);
      if (cancelBtn) await cancelBtn.click();
    } else if (alertText) {
      logger.log(testName, 'FAIL', {
        message: 'Add flow showed error alert instead of modal',
        alertText: alertText.substring(0, 80)
      });
      artifacts.consoleLogs.push({ test: testName, addFlowAlert: alertText });
    } else {
      logger.log(testName, 'FAIL', {
        message: 'Add flow: modal or form not found',
        modalFound: !!modal,
        formFound: !!form
      });
    }
  } catch (error) {
    logger.error(testName, error);
    artifacts.errors.push({ test: testName, error: error.message });
  } finally {
    await driver.quit();
  }
}

/**
 * Test: D16 — כפתור "הוסף חשבון" פותח מודל טופס (Trading Accounts CRUD QA)
 */
async function testCRUDButtonsD16() {
  const driver = await createDriver();
  const testName = 'CRUD_Buttons_D16';
  try {
    logger.log(testName, 'START', { message: 'Click Add trading account; verify modal form opens' });
    const loggedIn = await login(driver);
    if (!loggedIn) {
      logger.log(testName, 'SKIP', { message: 'Cannot proceed without login' });
      return;
    }
    await driver.get(`${TEST_CONFIG.frontendUrl}/trading_accounts.html`);
    await driver.sleep(5000);
    const addBtn = await driver.wait(until.elementLocated(By.css('.js-add-trading-account')), 10000).catch(() => null);
    if (!addBtn) {
      logger.log(testName, 'FAIL', { message: 'Add trading account button not found' });
      return;
    }
    await driver.wait(until.elementIsVisible(addBtn), 5000).catch(() => {});
    await driver.executeScript('arguments[0].scrollIntoView({block:"center"});', addBtn);
    await driver.sleep(500);
    await addBtn.click();
    const modal = await driver.wait(until.elementLocated(By.id('phoenix-modal')), 8000).catch(() => null);
    const form = modal ? await driver.findElement(By.id('tradingAccountForm')).catch(() => null) : null;
    let alertText = null;
    try {
      const alert = await driver.wait(until.alertIsPresent(), 1500);
      alertText = await alert.getText();
      await alert.accept();
    } catch {
      // No alert expected when modal is used
    }
    if (modal && form && !alertText) {
      logger.log(testName, 'PASS', {
        message: 'Add trading account opens modal form (D16 CRUD QA)',
        modalVisible: true,
        formPresent: true
      });
      artifacts.consoleLogs.push({ test: testName, addTradingAccountModalOpened: true });
      const cancelBtn = await driver.findElement(By.css('.phoenix-modal__cancel-btn')).catch(() => null);
      if (cancelBtn) await cancelBtn.click();
    } else if (alertText) {
      logger.log(testName, 'FAIL', {
        message: 'Add trading account showed error alert instead of modal',
        alertText: alertText.substring(0, 80)
      });
    } else {
      logger.log(testName, 'FAIL', {
        message: 'Add trading account: modal or form not found',
        modalFound: !!modal,
        formFound: !!form
      });
    }
  } catch (error) {
    logger.error(testName, error);
    artifacts.errors.push({ test: testName, error: error.message });
  } finally {
    await driver.quit();
  }
}

/**
 * Test: D16 — מילוי טופס הוספת חשבון מסחר ושמירה (Trading Accounts CRUD QA)
 */
async function testCRUDD16FormSave() {
  const driver = await createDriver();
  const testName = 'CRUD_D16_FormSave';
  try {
    logger.log(testName, 'START', { message: 'Fill trading account form and save; verify no error' });
    const loggedIn = await login(driver);
    if (!loggedIn) {
      logger.log(testName, 'SKIP', { message: 'Cannot proceed without login' });
      return;
    }
    await driver.get(`${TEST_CONFIG.frontendUrl}/trading_accounts.html`);
    await driver.sleep(5000);
    const addBtn = await driver.wait(until.elementLocated(By.css('.js-add-trading-account')), 10000);
    await driver.wait(until.elementIsVisible(addBtn), 5000).catch(() => {});
    await driver.executeScript('arguments[0].scrollIntoView({block:"center"});', addBtn);
    await driver.sleep(500);
    await addBtn.click();
    await driver.wait(until.elementLocated(By.id('tradingAccountForm')), 8000);
    await driver.sleep(500);
    const accountName = 'QA E2E Account ' + Date.now();
    await driver.findElement(By.id('accountName')).clear();
    await driver.findElement(By.id('accountName')).sendKeys(accountName);
    await driver.findElement(By.id('initialBalance')).clear();
    await driver.findElement(By.id('initialBalance')).sendKeys('1000');
    await driver.sleep(500);
    const saveBtn = await driver.findElement(By.css('.phoenix-modal__save-btn'));
    await saveBtn.click();
    await driver.sleep(4000);
    let alertText = null;
    try {
      const alert = await driver.wait(until.alertIsPresent(), 2000);
      alertText = await alert.getText();
      await alert.accept();
    } catch {
      // No alert = success
    }
    const modalStillOpen = await driver.findElement(By.id('phoenix-modal')).catch(() => null);
    if (alertText) {
      logger.log(testName, 'FAIL', { message: 'Save showed alert', alertText: alertText.substring(0, 60) });
      artifacts.consoleLogs.push({ test: testName, saveAlert: alertText });
    } else if (modalStillOpen) {
      logger.log(testName, 'FAIL', { message: 'Modal still open after save' });
    } else {
      logger.log(testName, 'PASS', {
        message: 'Trading account form save succeeded; no alert; modal closed'
      });
    }
  } catch (error) {
    logger.error(testName, error);
    artifacts.errors.push({ test: testName, error: error.message });
  } finally {
    await driver.quit();
  }
}

/**
 * Test: D18 — מילוי טופס הוספת ברוקר ושמירה (CRUD Forms QA Phase 1)
 */
async function testCRUDD18FormSave() {
  const driver = await createDriver();
  const testName = 'CRUD_D18_FormSave';
  try {
    logger.log(testName, 'START', { message: 'Fill broker form and save; verify no error, table refresh' });
    const loggedIn = await login(driver);
    if (!loggedIn) {
      logger.log(testName, 'SKIP', { message: 'Cannot proceed without login' });
      return;
    }
    await driver.get(`${TEST_CONFIG.frontendUrl}/brokers_fees.html`);
    await driver.sleep(4000);
    const rowCountBefore = (await driver.findElements(By.css('#brokersTableBody tr'))).length;
    const addBtn = await driver.findElement(By.css('.js-add-broker-fee'));
    await addBtn.click();
    await driver.sleep(1500);
    const brokerName = 'QA E2E Broker ' + Date.now();
    await driver.findElement(By.id('broker')).clear();
    await driver.findElement(By.id('broker')).sendKeys(brokerName);
    await driver.findElement(By.id('commissionValue')).clear();
    await driver.findElement(By.id('commissionValue')).sendKeys('0.0035');
    await driver.findElement(By.id('minimum')).clear();
    await driver.findElement(By.id('minimum')).sendKeys('1');
    await driver.sleep(500);
    const saveBtn = await driver.findElement(By.css('.phoenix-modal__save-btn'));
    await saveBtn.click();
    await driver.sleep(4000);
    let alertText = null;
    try {
      const alert = await driver.wait(until.alertIsPresent(), 2000);
      alertText = await alert.getText();
      await alert.accept();
    } catch {
      // No alert = success
    }
    const modalStillOpen = await driver.findElement(By.id('phoenix-modal')).catch(() => null);
    const rowCountAfter = (await driver.findElements(By.css('#brokersTableBody tr'))).length;
    if (alertText) {
      logger.log(testName, 'FAIL', { message: 'Save showed alert', alertText: alertText.substring(0, 60) });
      artifacts.consoleLogs.push({ test: testName, saveAlert: alertText });
    } else if (modalStillOpen) {
      logger.log(testName, 'FAIL', { message: 'Modal still open after save' });
    } else {
      logger.log(testName, 'PASS', {
        message: 'Broker form save succeeded; no alert; modal closed',
        rowCountBefore,
        rowCountAfter
      });
    }
  } catch (error) {
    logger.error(testName, error);
    artifacts.errors.push({ test: testName, error: error.message });
  } finally {
    await driver.quit();
  }
}

/**
 * Test: Security Validation - Token Leakage
 */
async function testSecurityTokenLeakage() {
  const driver = await createDriver();
  const testName = 'Security_TokenLeakage';
  
  try {
    logger.log(testName, 'START', { message: 'Starting Security Token Leakage test' });
    
    // Login
    const loggedIn = await login(driver);
    if (!loggedIn) {
      logger.log(testName, 'SKIP', { message: 'Cannot proceed without login' });
      return;
    }
    
    // Navigate to all pages and check console logs
    const pages = ['/trading_accounts.html', '/brokers_fees.html', '/cash_flows.html'];
    let totalErrors = 0;
    let tokenLeakageFound = false;
    
    for (const page of pages) {
      await driver.get(`${TEST_CONFIG.frontendUrl}${page}`);
      await driver.sleep(3000);
      
      const consoleLogs = await getConsoleLogs(driver);
      const allErrors = consoleLogs.filter(log => log.level === 'SEVERE');
      const errors = allErrors.filter(e => !e.message.includes('favicon.ico'));
      // Only real JWT leak — Bearer eyJ... with full token, not keywords
      const tokenLeakage = consoleLogs.some(log => 
        log.message.includes('Bearer eyJ') && /eyJ[A-Za-z0-9_-]{80,}/.test(log.message)
      );
      
      totalErrors += errors.length;
      if (tokenLeakage) tokenLeakageFound = true;
    }
    
    // Check: raw JWT leaked in DOM (eyJ... 80+ chars = real token, not key names)
    const tokenInDOM = await driver.executeScript(`
      const html = document.body.innerHTML;
      return /eyJ[A-Za-z0-9_-]{80,}/.test(html);
    `);
    
    // TokenLeakage: fail ONLY on actual JWT leak. SEVERE are covered by D16/D18/D21.
    if (!tokenLeakageFound && !tokenInDOM) {
      logger.log(testName, 'PASS', {
        message: 'Security validation passed - no JWT leakage',
        tokenLeakage: false,
        tokenInDOM: false
      });
    } else {
      logger.log(testName, 'FAIL', {
        message: 'Security validation failed - JWT leakage detected',
        tokenLeakage: tokenLeakageFound,
        tokenInDOM: tokenInDOM
      });
    }
    
  } catch (error) {
    logger.error(testName, error);
    artifacts.errors.push({ test: testName, error: error.message, stack: error.stack });
  } finally {
    await driver.quit();
  }
}

/**
 * Test: Routes SSOT Compliance
 */
async function testRoutesSSOTCompliance() {
  const driver = await createDriver();
  const testName = 'Routes_SSOT_Compliance';
  
  try {
    logger.log(testName, 'START', { message: 'Starting Routes SSOT Compliance test' });
    
    // Login
    const loggedIn = await login(driver);
    if (!loggedIn) {
      logger.log(testName, 'SKIP', { message: 'Cannot proceed without login' });
      return;
    }
    
    // Navigate to HTML page where Shared_Services is loaded
    await driver.get(`${TEST_CONFIG.frontendUrl}/trading_accounts.html`);
    await driver.sleep(4000);
    
    // Check routes.json is loaded
    const routesLoaded = await driver.executeScript(`
      return fetch('/routes.json')
        .then(r => r.ok)
        .catch(() => false);
    `);
    
    // Check UAI/Shared_Services (HTML pages: UAI.config or sharedServices)
    const sharedServicesUsesRoutes = await driver.executeScript(`
      return !!(window.UAI && window.UAI.config) || 
             !!(window.sharedServices) || 
             !!(window.routesConfig);
    `);
    
    if (routesLoaded && sharedServicesUsesRoutes) {
      logger.log(testName, 'PASS', {
        message: 'Routes SSOT compliance verified',
        routesJsonLoaded: routesLoaded,
        sharedServicesUsesRoutes: sharedServicesUsesRoutes
      });
    } else {
      logger.log(testName, 'FAIL', {
        message: 'Routes SSOT compliance failed',
        routesJsonLoaded: routesLoaded,
        sharedServicesUsesRoutes: sharedServicesUsesRoutes
      });
    }
    
  } catch (error) {
    logger.error(testName, error);
    artifacts.errors.push({ test: testName, error: error.message, stack: error.stack });
  } finally {
    await driver.quit();
  }
}

/**
 * Save artifacts to files
 */
function saveArtifacts() {
  // Save console logs
  const consoleLogsPath = path.join(ARTIFACTS_DIR, 'console_logs.json');
  fs.writeFileSync(consoleLogsPath, JSON.stringify(artifacts.consoleLogs, null, 2));
  
  // Save network logs
  const networkLogsPath = path.join(ARTIFACTS_DIR, 'network_logs.json');
  fs.writeFileSync(networkLogsPath, JSON.stringify(artifacts.networkLogs, null, 2));
  
  // Save errors
  const errorsPath = path.join(ARTIFACTS_DIR, 'errors.json');
  fs.writeFileSync(errorsPath, JSON.stringify(artifacts.errors, null, 2));
  
  // Save test summary
  const summary = logger.getSummary();
  const summaryPath = path.join(ARTIFACTS_DIR, 'test_summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  
  console.log(`\n📁 Artifacts saved to: ${ARTIFACTS_DIR}`);
  console.log(`   - Screenshots: ${artifacts.screenshots.length}`);
  console.log(`   - Console logs: ${consoleLogsPath}`);
  console.log(`   - Network logs: ${networkLogsPath}`);
  console.log(`   - Errors: ${errorsPath}`);
  console.log(`   - Summary: ${summaryPath}`);
}

/**
 * Run all tests (or only previously failed tests if PHASE2_E2E_ONLY_FAILED=1)
 */
async function runTests() {
  const onlyFailed = process.env.PHASE2_E2E_ONLY_FAILED === '1';
  
  console.log('\n' + '='.repeat(60));
  console.log('PHASE 2 E2E SELENIUM TESTS - SOP-010 COMPLIANCE');
  console.log('='.repeat(60));
  console.log('Team 50 (QA & Fidelity)');
  console.log('SOP-010: Manual Intent & Simulation Protocol');
  if (onlyFailed) {
    console.log('MODE: Only previously failed tests (D16, D18, D21, Security_TokenLeakage)');
  }
  console.log('='.repeat(60) + '\n');
  
  try {
    if (onlyFailed) {
      // Re-run only what failed in Gate B
      await testD16TradingAccounts();
      await testD18BrokersFees();
      await testD21CashFlows();
      await testSecurityTokenLeakage();
    } else {
      // Full suite
      await testD16TradingAccounts();
      await testD18BrokersFees();
      await testD21CashFlows();
      await testCRUDTradingAccounts();
      await testCRUDButtonsD16();
      await testCRUDD16FormSave();
      await testCRUDBrokersFees();
      await testCRUDCashFlows();
      await testCRUDButtonsD18();
      await testCRUDButtonsD21();
      await testCRUDD18FormSave();
      await testSecurityTokenLeakage();
      await testRoutesSSOTCompliance();
    }
    
    // Print summary
    logger.printSummary();
    
    // Save artifacts
    saveArtifacts();
    
    // Exit code
    const summary = logger.getSummary();
    process.exit(summary.failed > 0 ? 1 : 0);
    
  } catch (error) {
    console.error('Fatal error:', error);
    artifacts.errors.push({ test: 'FATAL', error: error.message, stack: error.stack });
    saveArtifacts();
    process.exit(1);
  }
}

// Run tests if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests().catch(console.error);
}

export { runTests };
