/**
 * Selenium Configuration for Phase 1.5 Integration Testing
 * Team 50 (QA)
 */

import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';

// Test Configuration
export const TEST_CONFIG = {
  frontendUrl: 'http://localhost:8080',
  backendUrl: 'http://localhost:8082',
  apiBaseUrl: 'http://localhost:8082/api/v1',
  timeout: 10000,
  implicitWait: 3000,
  pageLoadTimeout: 30000,
};

// Test Users
export const TEST_USERS = {
  admin: {
    username: 'admin',
    password: '418141',
    email: 'admin@tiktrack.local'
  },
  testUser: {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'Test123456!',
    phone: '+972501234567'
  }
};

/**
 * Create WebDriver instance
 */
export async function createDriver() {
  const options = new chrome.Options();
  options.addArguments('--headless=new'); // Use new headless mode
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--disable-gpu');
  options.addArguments('--window-size=1920,1080');
  
  const driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();
  
  // Set timeouts
  await driver.manage().setTimeouts({
    implicit: TEST_CONFIG.implicitWait,
    pageLoad: TEST_CONFIG.pageLoadTimeout,
    script: TEST_CONFIG.timeout
  });
  
  return driver;
}

/**
 * Wait for element to be visible
 */
export async function waitForElement(driver, selector, timeout = TEST_CONFIG.timeout) {
  return await driver.wait(
    until.elementIsVisible(driver.findElement(By.css(selector))),
    timeout,
    `Element ${selector} not found`
  );
}

/**
 * Wait for element to be clickable
 */
export async function waitForClickable(driver, selector, timeout = TEST_CONFIG.timeout) {
  return await driver.wait(
    until.elementIsEnabled(driver.findElement(By.css(selector))),
    timeout,
    `Element ${selector} not clickable`
  );
}

/**
 * Check if element exists
 */
export async function elementExists(driver, selector) {
  try {
    await driver.findElement(By.css(selector));
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get element text safely
 */
export async function getElementText(driver, selector) {
  try {
    const element = await driver.findElement(By.css(selector));
    return await element.getText();
  } catch (e) {
    return null;
  }
}

/**
 * Fill form field
 */
export async function fillField(driver, selector, value) {
  const element = await waitForElement(driver, selector);
  await element.clear();
  await element.sendKeys(value);
}

/**
 * Click element
 */
export async function clickElement(driver, selector) {
  const element = await waitForClickable(driver, selector);
  await element.click();
}

/**
 * Get network logs (if available)
 */
export async function getNetworkLogs(driver) {
  try {
    const logs = await driver.manage().logs().get('performance');
    return logs.filter(log => 
      log.message.includes('Network') || 
      log.message.includes('fetch') ||
      log.message.includes('xhr')
    );
  } catch (e) {
    return [];
  }
}

/**
 * Get console logs
 */
export async function getConsoleLogs(driver) {
  try {
    const logs = await driver.manage().logs().get('browser');
    return logs.map(log => ({
      level: log.level.name,
      message: log.message,
      timestamp: log.timestamp
    }));
  } catch (e) {
    return [];
  }
}

/**
 * Check localStorage value
 */
export async function getLocalStorageValue(driver, key) {
  return await driver.executeScript(`return localStorage.getItem('${key}');`);
}

/**
 * Set localStorage value
 */
export async function setLocalStorageValue(driver, key, value) {
  await driver.executeScript(`localStorage.setItem('${key}', '${value}');`);
}

/**
 * Clear localStorage
 */
export async function clearLocalStorage(driver) {
  await driver.executeScript('localStorage.clear();');
}

/**
 * Take screenshot (for debugging)
 */
export async function takeScreenshot(driver, filename) {
  const screenshot = await driver.takeScreenshot();
  // In headless mode, screenshots are still available
  return screenshot;
}

/**
 * Test result logger
 */
export class TestLogger {
  constructor() {
    this.results = [];
    this.errors = [];
  }

  log(testName, status, details = {}) {
    const result = {
      test: testName,
      status: status, // 'PASS', 'FAIL', 'SKIP'
      timestamp: new Date().toISOString(),
      details
    };
    this.results.push(result);
    
    const statusEmoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏸️';
    console.log(`${statusEmoji} [${status}] ${testName}`);
    if (details.message) {
      console.log(`   ${details.message}`);
    }
  }

  error(testName, error) {
    this.errors.push({ test: testName, error: error.message, stack: error.stack });
    this.log(testName, 'FAIL', { message: error.message });
  }

  getSummary() {
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    const total = this.results.length;

    return {
      total,
      passed,
      failed,
      skipped,
      passRate: total > 0 ? ((passed / total) * 100).toFixed(2) + '%' : '0%',
      errors: this.errors
    };
  }

  printSummary() {
    const summary = this.getSummary();
    console.log('\n' + '='.repeat(60));
    console.log('TEST SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${summary.total}`);
    console.log(`✅ Passed: ${summary.passed}`);
    console.log(`❌ Failed: ${summary.failed}`);
    console.log(`⏸️  Skipped: ${summary.skipped}`);
    console.log(`Pass Rate: ${summary.passRate}`);
    console.log('='.repeat(60));
    
    if (summary.errors.length > 0) {
      console.log('\nERRORS:');
      summary.errors.forEach((err, idx) => {
        console.log(`\n${idx + 1}. ${err.test}:`);
        console.log(`   ${err.error}`);
      });
    }
  }
}
