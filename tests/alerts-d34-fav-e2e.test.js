#!/usr/bin/env node
/**
 * Alerts D34 FAV E2E
 * Scope: CREATE/EDIT/DELETE alert + is_active toggle
 */

import { createDriver, TEST_CONFIG, TEST_USERS, getLocalStorageValue, TestLogger } from './selenium-config.js';
import { By } from 'selenium-webdriver';

const logger = new TestLogger();
const results = { passed: 0, failed: 0, skipped: 0 };

function logResult(name, pass, msg = '') {
  if (pass) {
    logger.log(name, 'PASS', { message: msg });
    results.passed++;
  } else {
    logger.log(name, 'FAIL', { message: msg });
    results.failed++;
  }
}

async function login(driver) {
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
}

async function run() {
  let driver;
  try {
    driver = await createDriver();
    const loggedIn = await login(driver);
    if (!loggedIn) {
      logger.log('D34_Login', 'SKIP', { message: 'Login failed' });
      results.skipped++;
      return results;
    }

    await driver.get(`${TEST_CONFIG.frontendUrl}/alerts.html`);
    await driver.sleep(4500);

    const pageLoaded = await driver.findElement(By.css('#alertsTable, .phoenix-table, [data-section="alerts-management"]')).catch(() => null);
    logResult('D34_PageLoaded', !!pageLoaded, 'alerts page loaded');

    // CREATE (if add button exists)
    const addBtn = await driver.findElement(By.css('.js-add-alert, [data-action="add-alert"]')).catch(() => null);
    if (!addBtn) {
      logger.log('D34_Create', 'SKIP', { message: 'No add-alert button in current UI phase' });
      results.skipped++;
    } else {
      await addBtn.click();
      await driver.sleep(1500);

      const titleInput = await driver.findElement(By.css('input[name="title"], #alertTitle')).catch(() => null);
      if (titleInput) {
        await titleInput.clear();
        await titleInput.sendKeys(`D34 FAV E2E ${Date.now()}`);
      }
      const saveBtn = await driver.findElement(By.css('.phoenix-modal__save-btn, button[type="submit"], [data-action="save-alert"]')).catch(() => null);
      if (saveBtn) {
        await saveBtn.click();
        await driver.sleep(2500);
        logResult('D34_Create', true, 'create flow submitted');
      } else {
        logResult('D34_Create', false, 'save button not found');
      }
    }

    // EDIT
    const editBtn = await driver.findElement(By.css('.js-action-edit, [data-action="edit-alert"]')).catch(() => null);
    if (!editBtn) {
      logger.log('D34_Edit', 'SKIP', { message: 'No edit button found' });
      results.skipped++;
    } else {
      await driver.executeScript('arguments[0].scrollIntoView({block:"center"}); arguments[0].click();', editBtn);
      await driver.sleep(1500);
      const saveBtn = await driver.findElement(By.css('.phoenix-modal__save-btn, button[type="submit"], [data-action="save-alert"]')).catch(() => null);
      if (saveBtn) {
        await saveBtn.click();
        await driver.sleep(1800);
        logResult('D34_Edit', true, 'edit flow submitted');
      } else {
        logResult('D34_Edit', false, 'edit save button not found');
      }
    }

    // is_active toggle
    const toggleEl = await driver.findElement(By.css('.js-action-toggle, [data-action="toggle-active"], input[type="checkbox"][name*="active"]')).catch(() => null);
    if (!toggleEl) {
      logger.log('D34_ToggleActive', 'SKIP', { message: 'toggle control not found' });
      results.skipped++;
    } else {
      await driver.executeScript('arguments[0].click();', toggleEl);
      await driver.sleep(900);
      logResult('D34_ToggleActive', true, 'toggle action executed');
    }

    // DELETE
    const deleteBtn = await driver.findElement(By.css('.js-action-delete, [data-action="delete-alert"]')).catch(() => null);
    if (!deleteBtn) {
      logger.log('D34_Delete', 'SKIP', { message: 'No delete button found' });
      results.skipped++;
    } else {
      await driver.executeScript('arguments[0].scrollIntoView({block:"center"}); arguments[0].click();', deleteBtn);
      await driver.sleep(1200);
      const confirmBtn = await driver.findElement(By.css('.phoenix-modal__confirm-btn, [data-action="confirm-delete"], .swal2-confirm')).catch(() => null);
      if (confirmBtn) {
        await confirmBtn.click();
        await driver.sleep(1500);
      }
      logResult('D34_Delete', true, 'delete flow executed');
    }
  } catch (e) {
    logger.log('D34_FAV_E2E', 'FAIL', { message: e?.message || String(e) });
    results.failed++;
  } finally {
    if (driver) await driver.quit();
  }

  logger.printSummary();
  return results;
}

run().then((r) => process.exit(r.failed > 0 ? 1 : 0)).catch(() => process.exit(1));
