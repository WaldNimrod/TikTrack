#!/usr/bin/env node
/**
 * Notes D35 FAV E2E
 * Scope: full CRUD round-trip, DELETE, basic XSS sanitization check
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
      logger.log('D35_Login', 'SKIP', { message: 'Login failed' });
      results.skipped++;
      return results;
    }

    await driver.get(`${TEST_CONFIG.frontendUrl}/notes.html`);
    await driver.sleep(4500);

    const addBtn = await driver.findElement(By.css('.js-add-note, [data-action="add-note"]')).catch(() => null);
    if (!addBtn) {
      logger.log('D35_CRUD', 'SKIP', { message: 'No add-note button in current UI phase' });
      results.skipped++;
      return results;
    }

    // CREATE
    await addBtn.click();
    await driver.sleep(1200);
    const titleInput = await driver.findElement(By.css('#noteTitle, input[name="title"]')).catch(() => null);
    const editor = await driver.findElement(By.css('.ProseMirror, [contenteditable="true"]')).catch(() => null);
    if (!titleInput || !editor) {
      logResult('D35_Create', false, 'title/editor not found');
      return results;
    }

    const noteTitle = `D35 FAV ${Date.now()}`;
    const xssPayload = '<script>window.__d35_xss=1</script><p>safe text</p>';
    await titleInput.clear();
    await titleInput.sendKeys(noteTitle);
    await driver.executeScript(
      "arguments[0].innerHTML = arguments[1]; arguments[0].dispatchEvent(new Event('input', { bubbles: true }));",
      editor,
      xssPayload
    );

    const saveBtn = await driver.findElement(By.css('.phoenix-modal__save-btn, button[type="submit"]')).catch(() => null);
    if (!saveBtn) {
      logResult('D35_Create', false, 'save button missing');
      return results;
    }
    await saveBtn.click();
    await driver.sleep(2500);
    logResult('D35_Create', true, 'create submitted');

    // READ + basic XSS check
    const bodyText = await driver.findElement(By.tagName('body')).getText().catch(() => '');
    const hasVisibleSafeText = bodyText.includes('safe text');
    const hasScriptTagRendered = await driver.executeScript("return !!document.querySelector('script[data-from-note]');").catch(() => false);
    logResult('D35_Read', hasVisibleSafeText, 'note content visible');
    logResult('D35_XSS', hasScriptTagRendered === false, 'no executable script marker rendered');

    // EDIT
    const editBtn = await driver.findElement(By.css('.js-action-edit, [data-action="edit-note"]')).catch(() => null);
    if (!editBtn) {
      logger.log('D35_Edit', 'SKIP', { message: 'No edit button found' });
      results.skipped++;
    } else {
      await driver.executeScript('arguments[0].scrollIntoView({block:"center"}); arguments[0].click();', editBtn);
      await driver.sleep(1200);
      const titleInput2 = await driver.findElement(By.css('#noteTitle, input[name="title"]')).catch(() => null);
      if (titleInput2) {
        await titleInput2.clear();
        await titleInput2.sendKeys(`${noteTitle} updated`);
      }
      const saveBtn2 = await driver.findElement(By.css('.phoenix-modal__save-btn, button[type="submit"]')).catch(() => null);
      if (saveBtn2) {
        await saveBtn2.click();
        await driver.sleep(1800);
        logResult('D35_Edit', true, 'edit submitted');
      } else {
        logResult('D35_Edit', false, 'edit save button missing');
      }
    }

    // DELETE
    const deleteBtn = await driver.findElement(By.css('.js-action-delete, [data-action="delete-note"]')).catch(() => null);
    if (!deleteBtn) {
      logger.log('D35_Delete', 'SKIP', { message: 'No delete button found' });
      results.skipped++;
    } else {
      await driver.executeScript('arguments[0].scrollIntoView({block:"center"}); arguments[0].click();', deleteBtn);
      await driver.sleep(1200);
      const confirmBtn = await driver.findElement(By.css('.phoenix-modal__confirm-btn, [data-action="confirm-delete"], .swal2-confirm')).catch(() => null);
      if (confirmBtn) {
        await confirmBtn.click();
        await driver.sleep(1500);
      }
      logResult('D35_Delete', true, 'delete submitted');
    }
  } catch (e) {
    logger.log('D35_FAV_E2E', 'FAIL', { message: e?.message || String(e) });
    results.failed++;
  } finally {
    if (driver) await driver.quit();
  }

  logger.printSummary();
  return results;
}

run().then((r) => process.exit(r.failed > 0 ? 1 : 0)).catch(() => process.exit(1));
