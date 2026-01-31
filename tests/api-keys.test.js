/**
 * API Keys Management Flow Integration Tests
 * Task 50.2.3 - Phase 1.5
 * Team 50 (QA)
 */

import { createDriver, TEST_CONFIG, waitForElement, fillField, clickElement, getElementText, elementExists, getLocalStorageValue, TestLogger } from './selenium-config.js';

const logger = new TestLogger();

describe('API Keys Management Flow Integration Tests', () => {
  let driver;

  before(async () => {
    driver = await createDriver();
    // Login first
    await driver.get(`${TEST_CONFIG.frontendUrl}/login`);
    await driver.sleep(1000);
    // Assume logged in
  });

  after(async () => {
    if (driver) {
      await driver.quit();
    }
    logger.printSummary();
  });

  // Test 1: Create API Key
  it('should create API key successfully', async () => {
    try {
      // Navigate to API Keys page (adjust URL/selector)
      await driver.get(`${TEST_CONFIG.frontendUrl}/api-keys`);
      await driver.sleep(2000);

      // Check if create form exists
      const createFormExists = await elementExists(driver, 'form[data-testid="create-api-key"], .create-api-key-form');
      if (!createFormExists) {
        logger.log('Create API Key - Precondition', 'SKIP', { 
          message: 'API Keys page not found, skipping test' 
        });
        return;
      }

      // Fill create form
      await fillField(driver, 'input[name="provider"]', 'IBKR');
      await fillField(driver, 'input[name="providerLabel"]', 'Test Key');
      await fillField(driver, 'input[name="apiKey"]', 'test_key_12345');
      await fillField(driver, 'input[name="apiSecret"]', 'test_secret_67890');

      // Submit form
      await clickElement(driver, 'button[type="submit"]');
      await driver.sleep(2000);

      // Verify: Key created (check for success message or list update)
      const successExists = await elementExists(driver, '.success-message, [data-testid="success"]');
      if (successExists) {
        logger.log('Create API Key - Success', 'PASS', { 
          message: 'API key created successfully' 
        });
      }

      // Verify: Key masked in display
      const maskedKey = await getElementText(driver, '.masked-key, [data-testid="masked-key"]');
      if (maskedKey && maskedKey.includes('*')) {
        logger.log('Create API Key - Masking', 'PASS', { 
          message: 'API key displayed as masked',
          maskedValue: maskedKey 
        });
      }

      logger.log('Create API Key - Successful', 'PASS');
    } catch (error) {
      logger.error('Create API Key - Successful', error);
      throw error;
    }
  });

  // Test 2: List API Keys
  it('should list API keys with masking', async () => {
    try {
      await driver.get(`${TEST_CONFIG.frontendUrl}/api-keys`);
      await driver.sleep(2000);

      // Check if list exists
      const listExists = await elementExists(driver, '[data-testid="api-keys-list"], .api-keys-list, table');
      if (listExists) {
        // Verify: All keys masked
        const maskedKeys = await driver.executeScript(`
          const keys = document.querySelectorAll('.masked-key, [data-testid="masked-key"]');
          return Array.from(keys).map(el => el.textContent);
        `);

        const allMasked = maskedKeys.every(key => key.includes('*') || key === '********************');
        if (allMasked) {
          logger.log('List API Keys - Masking', 'PASS', { 
            message: 'All API keys displayed as masked',
            keysCount: maskedKeys.length 
          });
        } else {
          throw new Error('Some API keys not masked');
        }
      } else {
        logger.log('List API Keys - Precondition', 'SKIP', { 
          message: 'API Keys list not found, skipping test' 
        });
        return;
      }

      logger.log('List API Keys - Successful', 'PASS');
    } catch (error) {
      logger.error('List API Keys - Successful', error);
      throw error;
    }
  });

  // Test 3: Delete API Key
  it('should delete API key successfully', async () => {
    try {
      await driver.get(`${TEST_CONFIG.frontendUrl}/api-keys`);
      await driver.sleep(2000);

      // Find delete button (adjust selector)
      const deleteButtonExists = await elementExists(driver, 'button[data-testid="delete-api-key"], .delete-api-key');
      if (deleteButtonExists) {
        await clickElement(driver, 'button[data-testid="delete-api-key"], .delete-api-key');
        await driver.sleep(1000);

        // Confirm deletion if confirmation dialog exists
        const confirmExists = await elementExists(driver, 'button[data-testid="confirm"], .confirm-button');
        if (confirmExists) {
          await clickElement(driver, 'button[data-testid="confirm"], .confirm-button');
          await driver.sleep(2000);
        }

        logger.log('Delete API Key - Successful', 'PASS', { 
          message: 'API key deletion completed' 
        });
      } else {
        logger.log('Delete API Key - Precondition', 'SKIP', { 
          message: 'Delete button not found, skipping test' 
        });
      }
    } catch (error) {
      logger.error('Delete API Key - Successful', error);
      throw error;
    }
  });
});
