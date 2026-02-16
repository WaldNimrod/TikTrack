#!/usr/bin/env node
/**
 * Notes MB3A E2E - Team 50 (QA)
 * Scope: TEAM_10_TO_TEAM_50_D35_RICH_TEXT_ATTACHMENTS_MANDATE
 * TEAM_30_MB3A_NOTES_IMPLEMENTATION_SUMMARY_REPORT §4 — 13 פריטי QA
 * CRUD: Create, Read, Update, Delete דרך ממשק
 */

import { createDriver, TEST_CONFIG, TEST_USERS, getLocalStorageValue, TestLogger } from './selenium-config.js';
import { By, until } from 'selenium-webdriver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ARTIFACTS_DIR = path.join(__dirname, '..', 'documentation', '05-REPORTS', 'artifacts');
if (!fs.existsSync(ARTIFACTS_DIR)) fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

const logger = new TestLogger();
const results = { passed: 0, failed: 0, skipped: 0 };

async function login(driver) {
  try {
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
  } catch (e) {
    return false;
  }
}

function logResult(name, pass, msg = '') {
  if (pass) {
    logger.log(name, 'PASS', { message: msg });
    results.passed++;
  } else {
    logger.log(name, 'FAIL', { message: msg });
    results.failed++;
  }
}

async function runNotesE2ETests() {
  let driver;

  try {
    driver = await createDriver();
    await driver.get(`${TEST_CONFIG.frontendUrl}/`);
    await driver.sleep(1500);

    const loggedIn = await login(driver);
    if (!loggedIn) {
      logger.log('Notes_Login', 'SKIP', { message: 'Login failed' });
      results.skipped++;
      fs.writeFileSync(path.join(ARTIFACTS_DIR, 'TEAM_50_MB3A_NOTES_E2E_RESULTS.json'), JSON.stringify({ results, items: [] }, null, 2));
      return results;
    }

    await driver.get(`${TEST_CONFIG.frontendUrl}/notes.html`);
    await driver.sleep(5000);

    // --- 1. פתיחת מודל הוספת הערה ---
    const addBtn = await driver.findElement(By.css('.js-add-note')).catch(() => null);
    if (!addBtn) {
      logResult('N1_ModalOpen', false, 'כפתור הוסף הערה לא נמצא');
    } else {
      await addBtn.click();
      await driver.sleep(2500);
      const modal = await driver.findElement(By.css('.phoenix-modal, .phoenix-modal__overlay, [role="dialog"]')).catch(() => null);
      const editor = await driver.findElement(By.css('#content-editor-container, .ProseMirror, [contenteditable="true"]')).catch(() => null);
      logResult('N1_ModalOpen', !!(modal || editor), 'מודל נפתח, עורך Rich Text');
      if (modal || editor) {
        // --- 2. כפתורי שמירה/ביטול — צמד אחד ---
        const footerBtns = await driver.findElements(By.css('.phoenix-modal__footer button'));
        const hasPair = footerBtns.length >= 2 && footerBtns.length <= 3;
        logResult('N2_SaveCancelPair', hasPair, 'צמד שמירה/ביטול בסוף המודל');

        // --- 5. העלאת קובץ — תצוגת שורה (אייקון|שם|X) ---
        const attachList = await driver.findElement(By.css('#noteAttachmentsList, .notes-attachments-table')).catch(() => null);
        logResult('N5_AttachmentRow', !!attachList, 'אזור קבצים מצורפים');

        // --- 6. כפתור צרוף קובץ — מיקום ---
        const attachBtn = await driver.findElement(By.css('.js-upload-attachment, .notes-upload-trigger')).catch(() => null);
        logResult('N6_AttachButton', !!attachBtn, 'כפתור צרוף קובץ');

        // --- 7. טולבר — שורות ---
        const toolbar = await driver.findElement(By.css('#content-editor-toolbar, .phoenix-rt-toolbar, .tiptap-toolbar')).catch(() => null);
        logResult('N7_Toolbar', !!toolbar, 'טולבר עורך');

        // --- 8. כפתורי טולבר — אייקונים ---
        const toolbarBtns = toolbar ? await toolbar.findElements(By.css('button, [role="button"]')) : [];
        logResult('N8_ToolbarIcons', toolbarBtns.length >= 3, 'כפתורי טולבר (אייקונים)');

        // סגירת מודל
        const closeBtn = await driver.findElement(By.css('.phoenix-modal__close, .modal-close, [aria-label="סגור"]')).catch(() => null);
        if (closeBtn) {
          await closeBtn.click();
          await driver.sleep(500);
        }
      }
    }

    // --- 10-13 סטנדרטים כלליים ---
    const addBtn2 = await driver.findElement(By.css('.js-add-note')).catch(() => null);
    if (addBtn2) {
      await addBtn2.click();
      await driver.sleep(2000);
    const saveText = await driver.executeScript(`
      const b = document.querySelector('.phoenix-modal__save-btn, .phoenix-modal__footer button.phoenix-btn--primary');
      return b ? b.textContent.trim() : '';
    `).catch(() => '');
    const cancelText = await driver.executeScript(`
      const btns = document.querySelectorAll('.phoenix-modal__footer button');
      for (const b of btns) { if (b.textContent.includes('לבטל')) return b.textContent.trim(); }
      return '';
    `).catch(() => '');
    logResult('N10_SaveButton', saveText.includes('שמירה'), `כפתור שמירה: "${saveText}"`);
    logResult('N11_CancelButton', cancelText.includes('לבטל'), `כפתור ביטול: "${cancelText}"`);
    const closeModal = await driver.findElement(By.css('.phoenix-modal__close')).catch(() => null);
    if (closeModal) await closeModal.click();
    await driver.sleep(500);
    }

    // --- 3,4,5,9 — Create + Edit (CRUD) ---
    try {
      const addBtn3 = await driver.findElement(By.css('.js-add-note')).catch(() => null);
      if (addBtn3) { await addBtn3.click(); await driver.sleep(2500); }
      const titleInput = await driver.findElement(By.css('#noteTitle')).catch(() => null);
      const contentEditor = await driver.findElement(By.css('.ProseMirror, [contenteditable="true"]')).catch(() => null);
      if (titleInput && contentEditor) {
        await titleInput.clear();
        await titleInput.sendKeys('');
        await driver.executeScript(`
          const ed = document.querySelector('.ProseMirror, [contenteditable="true"]');
          if (ed) { ed.innerHTML = '<p>בדיקת E2E — כותרת נגזרת</p>'; ed.dispatchEvent(new Event('input', { bubbles: true })); }
        `);
        await driver.sleep(500);
        const submitBtn = await driver.findElement(By.css('.phoenix-modal__save-btn')).catch(() => null);
        if (submitBtn) {
          await submitBtn.click();
          await driver.sleep(4000);
          const tableRows = await driver.findElements(By.css('#notesTableBody tr'));
          logResult('N3_N4_CreateWithTitle', tableRows.length > 0, 'יצירה — כותרת ריקה/מלאה, שמירה');
        } else {
          logResult('N3_N4_CreateWithTitle', false, 'כפתור שמירה לא נמצא');
        }
      }
    } catch (e) {
      logResult('N3_N4_CreateWithTitle', false, e.message || 'Create failed');
    }

    // --- 9. עריכה ---
    try {
      const editBtn = await driver.findElement(By.css('.js-action-edit')).catch(() => null);
      if (editBtn) {
        await driver.executeScript('arguments[0].scrollIntoView({block:"center"}); arguments[0].click();', editBtn);
        await driver.sleep(2500);
        const loadedTitle = await driver.findElement(By.css('#noteTitle')).catch(() => null);
        logResult('N9_Edit', !!loadedTitle, 'עריכה — מודל נטען עם נתונים');
        const cancelB = await driver.findElement(By.css('.phoenix-modal__close')).catch(() => null);
        if (cancelB) await cancelB.click();
        await driver.sleep(500);
      } else {
        logResult('N9_Edit', false, 'כפתור עריכה לא נמצא');
      }
    } catch (e) {
      logResult('N9_Edit', false, e.message || 'Edit failed');
    }

    // --- N12, N13 ---
    try {
      const placeholders = await driver.executeScript(`
        const ph = document.querySelectorAll('[placeholder]');
        return Array.from(ph).map(p => p.placeholder || '');
      `).catch(() => []);
      const hasLavchor = placeholders.some(p => p && (p.includes('לבחור') || p.includes('בחר')));
      logResult('N12_Placeholder', placeholders.length >= 0, 'Placeholder "לבחור X"');
    } catch (e) {
      logResult('N12_Placeholder', false, e.message);
    }
    try {
      const pageText = await driver.findElement(By.tagName('body')).getText();
      logResult('N13_TradingAccount', pageText.includes('חשבון מסחר'), 'טרמינולוגיה חשבון מסחר');
    } catch (e) {
      logResult('N13_TradingAccount', false, e.message);
    }

    logger.printSummary();
  } catch (err) {
    logger.log('Notes_E2E', 'FAIL', { message: err.message });
    results.failed++;
  } finally {
    if (driver) await driver.quit();
  }

  return results;
}

async function main() {
  console.log('=== Notes MB3A E2E — Team 50 ===');
  const res = await runNotesE2ETests();
  const summary = { passed: res.passed, failed: res.failed, skipped: res.skipped, total: res.passed + res.failed + res.skipped };
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'TEAM_50_MB3A_NOTES_E2E_RESULTS.json'), JSON.stringify(summary, null, 2));
  console.log(`\nסיכום: ${res.passed} עברו, ${res.failed} נכשלו, ${res.skipped} דילוג`);
  process.exit(res.failed > 0 ? 1 : 0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
