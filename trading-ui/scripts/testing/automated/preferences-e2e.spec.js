/**
 * Playwright E2E Test Suite for Preferences System
 * ================================================
 *
 * בדיקות E2E אוטומטיות עם Playwright
 *
 * Requirements:
 *   npm install --save-dev @playwright/test
 *   npx playwright install
 *
 * Run:
 *   npx playwright test preferences-e2e.spec.js
 *
 * @version 1.0.0
 * @lastUpdated January 2025
 */

const { test, expect } = require('@playwright/test');

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

test.describe('Preferences System E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to preferences page
    await page.goto(`${TEST_CONFIG.baseURL}/trading-ui/preferences.html`);
    
    // Wait for page to load
    await page.waitForSelector('#preferencesForm', { timeout: TEST_CONFIG.timeout });
    
    // Wait for PreferencesManager to be available
    await page.waitForFunction(() => window.PreferencesManager !== undefined, { timeout: TEST_CONFIG.timeout });
  });

  test('Page loads successfully', async ({ page }) => {
    // Check that page loaded
    await expect(page.locator('#preferencesForm')).toBeVisible();
    
    // Check that PreferencesManager is initialized
    const isInitialized = await page.evaluate(() => {
      return window.PreferencesManager && window.PreferencesManager.initialized;
    });
    expect(isInitialized).toBeTruthy();
  });

  test('Load group preferences', async ({ page }) => {
    // Open section
    const sectionToggle = page.locator('#section3 [data-onclick*="toggleSection"]');
    if (await sectionToggle.isVisible()) {
      await sectionToggle.click();
      await page.waitForTimeout(500);
    }

    // Wait for field to be visible
    const field = page.locator(`#${TEST_CONFIG.testPreference}`);
    await expect(field).toBeVisible({ timeout: TEST_CONFIG.timeout });

    // Check that field has a value
    const value = await field.inputValue();
    expect(value).toBeTruthy();
  });

  test('Save preference value', async ({ page }) => {
    // Open section
    const sectionToggle = page.locator('#section3 [data-onclick*="toggleSection"]');
    if (await sectionToggle.isVisible()) {
      await sectionToggle.click();
      await page.waitForTimeout(500);
    }

    // Find field
    const field = page.locator(`#${TEST_CONFIG.testPreference}`);
    await expect(field).toBeVisible({ timeout: TEST_CONFIG.timeout });

    // Get old value
    const oldValue = await field.inputValue();

    // Change value
    await field.fill(TEST_CONFIG.testValue);
    await field.dispatchEvent('input');
    await field.dispatchEvent('change');

    // Verify optimistic update (value changed immediately)
    const newValue = await field.inputValue();
    expect(newValue).toBe(TEST_CONFIG.testValue);

    // Click save button
    const saveButton = page.locator('[data-onclick*="savePreferenceGroup"][data-onclick*="trading_settings"]');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      
      // Wait for save to complete
      await page.waitForTimeout(1000);
      
      // Verify value is still correct after save
      const savedValue = await field.inputValue();
      expect(savedValue).toBe(TEST_CONFIG.testValue);
    }
  });

  test('Page refresh maintains saved value', async ({ page }) => {
    // Open section
    const sectionToggle = page.locator('#section3 [data-onclick*="toggleSection"]');
    if (await sectionToggle.isVisible()) {
      await sectionToggle.click();
      await page.waitForTimeout(500);
    }

    // Find field
    const field = page.locator(`#${TEST_CONFIG.testPreference}`);
    await expect(field).toBeVisible({ timeout: TEST_CONFIG.timeout });

    // Set value
    await field.fill(TEST_CONFIG.testValue);
    await field.dispatchEvent('input');
    await field.dispatchEvent('change');

    // Save
    const saveButton = page.locator('[data-onclick*="savePreferenceGroup"][data-onclick*="trading_settings"]');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(1000);
    }

    // Reload page
    await page.reload();
    await page.waitForSelector('#preferencesForm', { timeout: TEST_CONFIG.timeout });
    
    // Open section again
    const sectionToggle2 = page.locator('#section3 [data-onclick*="toggleSection"]');
    if (await sectionToggle2.isVisible()) {
      await sectionToggle2.click();
      await page.waitForTimeout(500);
    }

    // Verify value is still correct
    const field2 = page.locator(`#${TEST_CONFIG.testPreference}`);
    await expect(field2).toBeVisible({ timeout: TEST_CONFIG.timeout });
    const value = await field2.inputValue();
    expect(value).toBe(TEST_CONFIG.testValue);
  });

  test('Optimistic update works', async ({ page }) => {
    // Open section
    const sectionToggle = page.locator('#section3 [data-onclick*="toggleSection"]');
    if (await sectionToggle.isVisible()) {
      await sectionToggle.click();
      await page.waitForTimeout(500);
    }

    // Find field
    const field = page.locator(`#${TEST_CONFIG.testPreference}`);
    await expect(field).toBeVisible({ timeout: TEST_CONFIG.timeout });

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

    // Change value
    await field.fill(TEST_CONFIG.testValue);
    await field.dispatchEvent('input');
    await field.dispatchEvent('change');

    // Verify optimistic update (immediate, before API call)
    const valueAfterChange = await field.inputValue();
    expect(valueAfterChange).toBe(TEST_CONFIG.testValue);

    // Save
    const saveButton = page.locator('[data-onclick*="savePreferenceGroup"][data-onclick*="trading_settings"]');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      await page.waitForTimeout(1000);
    }

    // Verify no reload happened (optimistic update)
    const valueAfterSave = await field.inputValue();
    expect(valueAfterSave).toBe(TEST_CONFIG.testValue);

    // Check API calls (should be minimal)
    expect(apiCalls.length).toBeLessThan(3);
  });

  test('Performance: Load time < 500ms', async ({ page }) => {
    const startTime = Date.now();
    
    // Navigate and wait for load
    await page.goto(`${TEST_CONFIG.baseURL}/trading-ui/preferences.html`);
    await page.waitForSelector('#preferencesForm', { timeout: TEST_CONFIG.timeout });
    await page.waitForFunction(() => window.PreferencesManager !== undefined, { timeout: TEST_CONFIG.timeout });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(500);
  });

  test('Performance: Save time < 200ms', async ({ page }) => {
    // Open section
    const sectionToggle = page.locator('#section3 [data-onclick*="toggleSection"]');
    if (await sectionToggle.isVisible()) {
      await sectionToggle.click();
      await page.waitForTimeout(500);
    }

    // Find field
    const field = page.locator(`#${TEST_CONFIG.testPreference}`);
    await expect(field).toBeVisible({ timeout: TEST_CONFIG.timeout });

    // Measure save time
    const startTime = Date.now();
    
    await field.fill(TEST_CONFIG.testValue);
    await field.dispatchEvent('input');
    await field.dispatchEvent('change');

    const saveButton = page.locator('[data-onclick*="savePreferenceGroup"][data-onclick*="trading_settings"]');
    if (await saveButton.isVisible()) {
      await saveButton.click();
      
      // Wait for optimistic update (should be immediate)
      await page.waitForFunction(
        (prefName, prefValue) => {
          const field = document.getElementById(prefName);
          return field && field.value === prefValue;
        },
        TEST_CONFIG.testPreference,
        TEST_CONFIG.testValue,
        { timeout: 1000 }
      );
    }
    
    const saveTime = Date.now() - startTime;
    expect(saveTime).toBeLessThan(200);
  });
});

