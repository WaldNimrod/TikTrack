/**
 * Puppeteer E2E Test Suite for Preferences System
 * ================================================
 *
 * בדיקות E2E אוטומטיות עם Puppeteer
 *
 * Requirements:
 *   npm install --save-dev puppeteer
 *
 * Run:
 *   node preferences-puppeteer.test.js
 *
 * @version 1.0.0
 * @lastUpdated January 2025
 */

const puppeteer = require('puppeteer');
const path = require('path');

const TEST_CONFIG = {
  baseURL: 'http://localhost:8080',
  testUser: 1,
  testProfile: 0,
  testGroup: 'trading_settings',
  testPreference: 'atr_period',
  testValue: '21',
  defaultValue: '14',
  timeout: 10000
};

let testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(testName, passed, message = '', duration = 0) {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  testResults.tests.push({
    name: testName,
    status,
    passed,
    message,
    duration
  });
  
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
  
  console.log(`${status}: ${testName}`);
  if (message) {
    console.log(`   ${message}`);
  }
  if (duration > 0) {
    console.log(`   Duration: ${duration.toFixed(2)}ms`);
  }
  console.log();
}

async function testPageLoad(page) {
  const testName = 'Page Load';
  const startTime = Date.now();
  
  try {
    await page.goto(`${TEST_CONFIG.baseURL}/trading-ui/preferences.html`, {
      waitUntil: 'networkidle2',
      timeout: TEST_CONFIG.timeout
    });
    
    // Wait for form
    await page.waitForSelector('#preferencesForm', { timeout: TEST_CONFIG.timeout });
    
    // Wait for PreferencesManager
    await page.waitForFunction(
      () => window.PreferencesManager !== undefined,
      { timeout: TEST_CONFIG.timeout }
    );
    
    const duration = Date.now() - startTime;
    const success = duration < 500;
    
    logTest(testName, success, `Loaded in ${duration}ms (target: < 500ms)`, duration);
    return success;
  } catch (error) {
    const duration = Date.now() - startTime;
    logTest(testName, false, `Error: ${error.message}`, duration);
    return false;
  }
}

async function testLoadGroup(page) {
  const testName = 'Load Group Preferences';
  const startTime = Date.now();
  
  try {
    // Open section
    const sectionToggle = await page.$('#section3 [data-onclick*="toggleSection"]');
    if (sectionToggle) {
      await sectionToggle.click();
      await page.waitForTimeout(500);
    }
    
    // Wait for field
    await page.waitForSelector(`#${TEST_CONFIG.testPreference}`, { timeout: TEST_CONFIG.timeout });
    
    // Check that field has a value
    const field = await page.$(`#${TEST_CONFIG.testPreference}`);
    const value = await field ? await page.evaluate(el => el.value, field) : null;
    
    const duration = Date.now() - startTime;
    const success = value !== null && value !== '';
    
    logTest(testName, success, `Field value: ${value}`, duration);
    return success;
  } catch (error) {
    const duration = Date.now() - startTime;
    logTest(testName, false, `Error: ${error.message}`, duration);
    return false;
  }
}

async function testSavePreference(page) {
  const testName = 'Save Preference';
  const startTime = Date.now();
  
  try {
    // Open section
    const sectionToggle = await page.$('#section3 [data-onclick*="toggleSection"]');
    if (sectionToggle) {
      await sectionToggle.click();
      await page.waitForTimeout(500);
    }
    
    // Find field
    await page.waitForSelector(`#${TEST_CONFIG.testPreference}`, { timeout: TEST_CONFIG.timeout });
    const field = await page.$(`#${TEST_CONFIG.testPreference}`);
    
    // Change value
    await field.click({ clickCount: 3 }); // Select all
    await field.type(TEST_CONFIG.testValue);
    await field.press('Enter');
    
    // Wait for optimistic update
    await page.waitForFunction(
      (prefName, prefValue) => {
        const field = document.getElementById(prefName);
        return field && field.value === prefValue;
      },
      {},
      TEST_CONFIG.testPreference,
      TEST_CONFIG.testValue
    );
    
    // Click save button
    const saveButton = await page.$('[data-onclick*="savePreferenceGroup"][data-onclick*="trading_settings"]');
    if (saveButton) {
      await saveButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Verify value
    const savedValue = await page.evaluate((prefName) => {
      const field = document.getElementById(prefName);
      return field ? field.value : null;
    }, TEST_CONFIG.testPreference);
    
    const duration = Date.now() - startTime;
    const success = savedValue === TEST_CONFIG.testValue && duration < 200;
    
    logTest(testName, success, 
      `Value: ${savedValue} (expected: ${TEST_CONFIG.testValue}), Duration: ${duration}ms (target: < 200ms)`, 
      duration);
    return success;
  } catch (error) {
    const duration = Date.now() - startTime;
    logTest(testName, false, `Error: ${error.message}`, duration);
    return false;
  }
}

async function testPageRefresh(page) {
  const testName = 'Page Refresh Maintains Value';
  const startTime = Date.now();
  
  try {
    // Set value first
    const sectionToggle = await page.$('#section3 [data-onclick*="toggleSection"]');
    if (sectionToggle) {
      await sectionToggle.click();
      await page.waitForTimeout(500);
    }
    
    await page.waitForSelector(`#${TEST_CONFIG.testPreference}`, { timeout: TEST_CONFIG.timeout });
    const field = await page.$(`#${TEST_CONFIG.testPreference}`);
    await field.click({ clickCount: 3 });
    await field.type(TEST_CONFIG.testValue);
    
    // Save
    const saveButton = await page.$('[data-onclick*="savePreferenceGroup"][data-onclick*="trading_settings"]');
    if (saveButton) {
      await saveButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Reload page
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForSelector('#preferencesForm', { timeout: TEST_CONFIG.timeout });
    
    // Open section again
    const sectionToggle2 = await page.$('#section3 [data-onclick*="toggleSection"]');
    if (sectionToggle2) {
      await sectionToggle2.click();
      await page.waitForTimeout(500);
    }
    
    // Verify value
    await page.waitForSelector(`#${TEST_CONFIG.testPreference}`, { timeout: TEST_CONFIG.timeout });
    const value = await page.evaluate((prefName) => {
      const field = document.getElementById(prefName);
      return field ? field.value : null;
    }, TEST_CONFIG.testPreference);
    
    const duration = Date.now() - startTime;
    const success = value === TEST_CONFIG.testValue;
    
    logTest(testName, success, `Value after refresh: ${value} (expected: ${TEST_CONFIG.testValue})`, duration);
    return success;
  } catch (error) {
    const duration = Date.now() - startTime;
    logTest(testName, false, `Error: ${error.message}`, duration);
    return false;
  }
}

async function testOptimisticUpdate(page) {
  const testName = 'Optimistic Update';
  const startTime = Date.now();
  
  try {
    // Monitor network requests
    const apiCalls = [];
    page.on('request', request => {
      if (request.url().includes('/api/preferences')) {
        apiCalls.push({
          url: request.url(),
          method: request.method(),
          timestamp: Date.now()
        });
      }
    });
    
    // Open section
    const sectionToggle = await page.$('#section3 [data-onclick*="toggleSection"]');
    if (sectionToggle) {
      await sectionToggle.click();
      await page.waitForTimeout(500);
    }
    
    // Find field
    await page.waitForSelector(`#${TEST_CONFIG.testPreference}`, { timeout: TEST_CONFIG.timeout });
    const field = await page.$(`#${TEST_CONFIG.testPreference}`);
    
    // Change value
    await field.click({ clickCount: 3 });
    await field.type(TEST_CONFIG.testValue);
    
    // Verify optimistic update (immediate)
    const valueAfterChange = await page.evaluate((prefName) => {
      const field = document.getElementById(prefName);
      return field ? field.value : null;
    }, TEST_CONFIG.testPreference);
    
    // Save
    const saveButton = await page.$('[data-onclick*="savePreferenceGroup"][data-onclick*="trading_settings"]');
    if (saveButton) {
      await saveButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Verify no reload (optimistic update)
    const valueAfterSave = await page.evaluate((prefName) => {
      const field = document.getElementById(prefName);
      return field ? field.value : null;
    }, TEST_CONFIG.testPreference);
    
    const duration = Date.now() - startTime;
    const optimisticUpdate = valueAfterChange === TEST_CONFIG.testValue;
    const noReload = valueAfterSave === TEST_CONFIG.testValue;
    const minimalAPICalls = apiCalls.length < 3;
    const success = optimisticUpdate && noReload && minimalAPICalls;
    
    logTest(testName, success, 
      `Optimistic: ${optimisticUpdate}, No reload: ${noReload}, API calls: ${apiCalls.length}`, 
      duration);
    return success;
  } catch (error) {
    const duration = Date.now() - startTime;
    logTest(testName, false, `Error: ${error.message}`, duration);
    return false;
  }
}

async function runAllTests() {
  console.log('='.repeat(60));
  console.log('PREFERENCES SYSTEM - PUPPETEER E2E TESTS');
  console.log('='.repeat(60));
  console.log();
  console.log(`Base URL: ${TEST_CONFIG.baseURL}`);
  console.log(`Test User: ${TEST_CONFIG.testUser}`);
  console.log(`Test Profile: ${TEST_CONFIG.testProfile}`);
  console.log(`Test Group: ${TEST_CONFIG.testGroup}`);
  console.log(`Test Preference: ${TEST_CONFIG.testPreference}`);
  console.log();

  const browser = await puppeteer.launch({
    headless: false, // Set to true for CI/CD
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Run tests
    await testPageLoad(page);
    await testLoadGroup(page);
    await testSavePreference(page);
    await testPageRefresh(page);
    await testOptimisticUpdate(page);
    
  } finally {
    await browser.close();
  }

  // Summary
  console.log('='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log();
  console.log(`Total Tests: ${testResults.passed + testResults.failed}`);
  console.log(`Passed: ${testResults.passed} ✅`);
  console.log(`Failed: ${testResults.failed} ${testResults.failed > 0 ? '❌' : ''}`);
  console.log();

  if (testResults.failed > 0) {
    console.log('Failed Tests:');
    testResults.tests.forEach(test => {
      if (!test.passed) {
        console.log(`  - ${test.name}: ${test.message}`);
      }
    });
    console.log();
    process.exit(1);
  } else {
    console.log('✅ All tests passed!');
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests, testResults };

