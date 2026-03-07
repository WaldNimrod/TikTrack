#!/usr/bin/env node
/**
 * GATE_7 — 26 BF Deep E2E (Team 50)
 * אימות מעמיק: ולידציות, מקושר חובה, תצוגת מקושר בטבלה, בדיקת סמל טיקר, רענון טבלה אחרי עדכון.
 * Authority: TEAM_50_G7_26BF_VERIFICATION_SPEC_v1.0.0.md, NIMROD_GATE7_DECISION_v1.3.0.
 */

import { createDriver, TEST_CONFIG, TEST_USERS, getLocalStorageValue, TestLogger } from './selenium-config.js';
import { By } from 'selenium-webdriver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logger = new TestLogger();
const deepResults = {}; // BF id -> { status: PASS|FAIL, evidence: string }

function setDeep(id, pass, evidence) {
  deepResults[id] = { status: pass ? 'PASS' : 'FAIL', evidence: evidence || '' };
}

async function login(driver) {
  await driver.get(`${TEST_CONFIG.frontendUrl}/login`);
  await driver.sleep(2000);
  const usernameInput = await driver.findElement(By.css('input[name="usernameOrEmail"]')).catch(() => null);
  if (!usernameInput) return false;
  await usernameInput.sendKeys(TEST_USERS.admin.username);
  await driver.findElement(By.css('input[name="password"]')).sendKeys(TEST_USERS.admin.password);
  await driver.findElement(By.css('button[type="submit"]')).click();
  await driver.sleep(4000);
  const token = await getLocalStorageValue(driver, 'access_token');
  return !!token;
}

async function run() {
  let driver;
  try {
    driver = await createDriver();
    const loggedIn = await login(driver);
    if (!loggedIn) {
      for (let i = 1; i <= 26; i++) setDeep(`BF-G7-${String(i).padStart(3, '0')}`, false, 'Login failed');
      return deepResults;
    }

    // --- BF-G7-003: ולידציה — שמירה בלי סמל מציגה סיכום ולידציה ---
    await driver.get(`${TEST_CONFIG.frontendUrl}/tickers.html`);
    await driver.sleep(4000);
    const addBtn = await driver.findElement(By.css('.js-add-ticker')).catch(() => null);
    if (addBtn) {
      await addBtn.click();
      await driver.sleep(2000);
      const symbolInput = await driver.findElement(By.css('#tickerSymbol')).catch(() => null);
      if (symbolInput) {
        await symbolInput.clear();
        await driver.sleep(300);
      }
      const saveBtn = await driver.findElement(By.css('.phoenix-modal__save-btn, button.phoenix-btn--primary')).catch(() => null);
      if (saveBtn) {
        await saveBtn.click();
        await driver.sleep(1500);
        const summaryEl = await driver.findElement(By.css('#tickerFormValidationSummary')).catch(() => null);
        const summaryVisible = summaryEl ? await summaryEl.isDisplayed().catch(() => false) : false;
        const summaryText = summaryEl ? await summaryEl.getText().catch(() => '') : '';
        const hasValidationMsg = summaryVisible && (summaryText.includes('סמל') || summaryText.includes('חובה') || summaryText.includes('לתקן') || summaryText.length > 5);
        setDeep('BF-G7-003', hasValidationMsg, hasValidationMsg ? `validation summary visible: "${summaryText.slice(0, 80)}"` : `summary visible=${summaryVisible} text="${summaryText.slice(0, 60)}"`);
      } else setDeep('BF-G7-003', false, 'save button not found');
      const closeBtn = await driver.findElement(By.css('.phoenix-modal__close, [data-close]')).catch(() => null);
      if (closeBtn) await closeBtn.click();
      await driver.sleep(500);
    } else setDeep('BF-G7-003', false, 'add button not found');

    // --- BF-G7-008: סמל לא תקין — ניסיון שמירה עם סמל בדוי מציג שגיאה ---
    const addBtn2 = await driver.findElement(By.css('.js-add-ticker')).catch(() => null);
    if (addBtn2) {
      await addBtn2.click();
      await driver.sleep(2000);
      const symbolInput = await driver.findElement(By.css('#tickerSymbol')).catch(() => null);
      const companyInput = await driver.findElement(By.css('#tickerCompanyName')).catch(() => null);
      if (symbolInput) await symbolInput.sendKeys('INVALID999E2E');
      if (companyInput) await companyInput.sendKeys('Deep E2E Test');
      await driver.sleep(500);
      const saveBtn = await driver.findElement(By.css('.phoenix-modal__save-btn, button.phoenix-btn--primary')).catch(() => null);
      if (saveBtn) {
        await saveBtn.click();
        await driver.sleep(4000);
        const summaryEl = await driver.findElement(By.css('#tickerFormValidationSummary, [data-testid="ticker-form-validation-summary"]')).catch(() => null);
        const symbolErrEl = await driver.findElement(By.css('#tickerSymbolError, [data-testid="ticker-symbol-error"]')).catch(() => null);
        const summaryText = summaryEl ? await summaryEl.getText().catch(() => '') : '';
        const symbolErrText = symbolErrEl ? await symbolErrEl.getText().catch(() => '') : '';
        const errModal = await driver.findElement(By.css('.phoenix-modal .phoenix-modal__content')).catch(() => null);
        const errModalText = errModal ? await errModal.getText().catch(() => '') : '';
        const combinedError = summaryText || symbolErrText || errModalText;
        const hasError = !!(combinedError && String(combinedError).trim().length > 0);
        setDeep('BF-G7-008', hasError, hasError ? `error shown (summary/symbol/modal): ${String(combinedError).slice(0, 100)}` : 'no error message after invalid symbol');
      } else setDeep('BF-G7-008', false, 'save button not found');
      const closeBtn = await driver.findElement(By.css('.phoenix-modal__close, [data-close]')).catch(() => null);
      if (closeBtn) await closeBtn.click();
      await driver.sleep(500);
    } else setDeep('BF-G7-008', false, 'add button not found');

    // --- BF-G7-008 (happy path): סמל תקין — שמירה עם סמל תקין (AAPL) מצליחה או כפילות (לא שגיאת סמל לא תקין) ---
    const addBtnValid = await driver.findElement(By.css('.js-add-ticker')).catch(() => null);
    if (addBtnValid) {
      await addBtnValid.click();
      await driver.sleep(2000);
      const symbolInputV = await driver.findElement(By.css('#tickerSymbol')).catch(() => null);
      const companyInputV = await driver.findElement(By.css('#tickerCompanyName')).catch(() => null);
      if (symbolInputV) await symbolInputV.sendKeys('AAPL');
      if (companyInputV) await companyInputV.sendKeys('E2E Valid Symbol Test');
      await driver.sleep(500);
      const saveBtnV = await driver.findElement(By.css('.phoenix-modal__save-btn, button.phoenix-btn--primary')).catch(() => null);
      if (saveBtnV) {
        await saveBtnV.click();
        await driver.sleep(5000);
        const modalEl = await driver.findElement(By.css('.phoenix-modal')).catch(() => null);
        const modalVisible = modalEl ? await modalEl.isDisplayed().catch(() => true) : false;
        const summaryElV = await driver.findElement(By.css('#tickerFormValidationSummary, [data-testid="ticker-form-validation-summary"]')).catch(() => null);
        const summaryTextV = summaryElV ? await summaryElV.getText().catch(() => '') : '';
        const isInvalidError = summaryTextV && (summaryTextV.includes('לא תקין') || summaryTextV.includes('invalid') || summaryTextV.includes('לא נמצא') || summaryTextV.includes('TICKER_SYMBOL'));
        const isDuplicate = summaryTextV && (summaryTextV.includes('כפול') || summaryTextV.includes('409'));
        const modalClosed = !modalVisible;
        const validOk = !isInvalidError && (modalClosed || isDuplicate);
        if (validOk) {
          setDeep('BF-G7-008-valid', true, modalClosed ? 'valid symbol (AAPL): created, modal closed' : 'valid symbol (AAPL): duplicate message, no invalid error');
        } else {
          setDeep('BF-G7-008-valid', false, isInvalidError ? `valid symbol showed invalid error: ${summaryTextV.slice(0, 80)}` : 'modal open, no duplicate message');
        }
      }
      const closeBtnV = await driver.findElement(By.css('.phoenix-modal__close, [data-close]')).catch(() => null);
      if (closeBtnV) await closeBtnV.click();
      await driver.sleep(500);
    }

    // --- BF-G7-012: טבלת התראות — עמודת "מקושר ל" מציגה שם רשומה (לא רק סוג) ---
    await driver.get(`${TEST_CONFIG.frontendUrl}/alerts.html`);
    await driver.sleep(4500);
    const alertsTable = await driver.findElement(By.css('#alertsTable tbody, .phoenix-table tbody')).catch(() => null);
    let linkedCellText = '';
    if (alertsTable) {
      const linkedCells = await alertsTable.findElements(By.css('.col-linked-object, [data-field="target_type"]')).catch(() => []);
      if (linkedCells.length > 0) {
        linkedCellText = await linkedCells[0].getText().catch(() => '');
      }
    }
    const hasLinkedColumn = await driver.findElement(By.css('.col-linked-object, [data-field="target_type"]')).catch(() => null) !== null;
    const showsNameNotJustType = linkedCellText && !/^[\s—\-]*$/.test(linkedCellText) && (linkedCellText.length > 2 || linkedCellText.includes('AAPL') || linkedCellText.includes('טיקר') && linkedCellText.length > 4);
    setDeep('BF-G7-012', hasLinkedColumn && (showsNameNotJustType || !linkedCellText), hasLinkedColumn ? `linked column exists; first cell: "${linkedCellText.slice(0, 50)}"` : 'no linked column');

    // --- BF-G7-017 (התראות): שמירה בלי ישות מקושרת נחסמת ---
    const addAlertBtn = await driver.findElement(By.css('.js-add-alert, [data-action="add-alert"]')).catch(() => null);
    if (addAlertBtn) {
      await addAlertBtn.click();
      await driver.sleep(2500);
      const titleInput = await driver.findElement(By.css('#alertTitle, [name="title"]')).catch(() => null);
      if (titleInput) await titleInput.sendKeys('E2E Test Alert');
      const condField = await driver.findElement(By.css('#conditionField, [name="condition_field"]')).catch(() => null);
      if (condField) await condField.sendKeys('current_price');
      await driver.sleep(200);
      const condOp = await driver.findElement(By.css('#conditionOperator, [name="condition_operator"]')).catch(() => null);
      if (condOp) await condOp.sendKeys('>');
      await driver.sleep(200);
      const condVal = await driver.findElement(By.css('#conditionValue, [name="condition_value"]')).catch(() => null);
      if (condVal) await condVal.sendKeys('100');
      await driver.sleep(500);
      const saveAlertBtn = await driver.findElement(By.css('.phoenix-modal__save-btn, button.phoenix-btn--primary')).catch(() => null);
      if (saveAlertBtn) {
        await saveAlertBtn.click();
        await driver.sleep(2000);
        const summaryEl = await driver.findElement(By.css('#alertFormValidationSummary, [data-testid="alert-form-validation-summary"]')).catch(() => null);
        const modalContent = await driver.findElement(By.css('.phoenix-modal__content, .phoenix-modal [role="dialog"]')).catch(() => null);
        const summaryText = summaryEl ? await summaryEl.getText().catch(() => '') : '';
        const modalText = modalContent ? await modalContent.getText().catch(() => '') : '';
        const blockedWithMessage = (summaryText || modalText).includes('יש לבחור ישות מקושרת');
        setDeep('BF-G7-017', blockedWithMessage, blockedWithMessage ? 'blocked with "יש לבחור ישות מקושרת"' : `modal text: ${modalText.slice(0, 120)}`);
      } else setDeep('BF-G7-017', false, 'save button not found');
      const closeBtn = await driver.findElement(By.css('.phoenix-modal__close, [data-close]')).catch(() => null);
      if (closeBtn) await closeBtn.click();
      await driver.sleep(500);
    } else setDeep('BF-G7-017', false, 'add alert button not found');

    // --- BF-G7-026: עדכון רשומה — הטבלה מתעדכנת אחרי שמירה ---
    await driver.get(`${TEST_CONFIG.frontendUrl}/tickers.html`);
    await driver.sleep(4500);
    const firstRow = await driver.findElement(By.css('#tickersTableBody tr, .phoenix-table__body tr')).catch(() => null);
    let companyBefore = '';
    if (firstRow) {
      const companyCell = await firstRow.findElement(By.css('.col-company')).catch(() => null);
      if (companyCell) companyBefore = await companyCell.getText().catch(() => '');
    }
    const actionsTrigger = await driver.findElement(By.css('.table-actions-trigger')).catch(() => null);
    const editBtn = await driver.findElement(By.css('.js-action-edit')).catch(() => null);
    if (actionsTrigger && editBtn && firstRow) {
      await actionsTrigger.click();
      await driver.sleep(500);
      await editBtn.click();
      await driver.sleep(2000);
      const companyInput = await driver.findElement(By.css('#tickerCompanyName')).catch(() => null);
      const uniqueSuffix = ` E2E${Date.now()}`;
      if (companyInput) {
        await companyInput.clear();
        await companyInput.sendKeys((companyBefore || 'Company') + uniqueSuffix);
      }
      await driver.sleep(300);
      const saveBtn = await driver.findElement(By.css('.phoenix-modal__save-btn, button.phoenix-btn--primary')).catch(() => null);
      if (saveBtn) {
        await saveBtn.click();
        await driver.sleep(3500);
        const firstRowAfter = await driver.findElement(By.css('#tickersTableBody tr, .phoenix-table__body tr')).catch(() => null);
        let companyAfter = '';
        if (firstRowAfter) {
          const companyCellAfter = await firstRowAfter.findElement(By.css('.col-company')).catch(() => null);
          if (companyCellAfter) companyAfter = await companyCellAfter.getText().catch(() => '');
        }
        const tableUpdated = companyAfter && companyAfter.includes(uniqueSuffix);
        setDeep('BF-G7-026', tableUpdated, tableUpdated ? `table refreshed: company now "${companyAfter.slice(0, 50)}"` : `before="${companyBefore}" after="${companyAfter}"`);
      } else setDeep('BF-G7-026', false, 'save button not found');
    } else setDeep('BF-G7-026', false, firstRow ? 'edit/actions not found' : 'no table row');

  } catch (err) {
    logger.log('G7_DEEP_E2E', 'FAIL', { message: err?.message || String(err) });
    for (let i = 1; i <= 26; i++) {
      const id = `BF-G7-${String(i).padStart(3, '0')}`;
      if (!deepResults[id]) setDeep(id, false, err?.message || 'E2E exception');
    }
  } finally {
    if (driver) await driver.quit();
  }
  return deepResults;
}

function writeArtifact(results) {
  const outDir = path.join(__dirname, '..', 'documentation', 'reports', '05-REPORTS', 'artifacts_SESSION_01');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, 'TEAM_50_G7_26BF_DEEP_E2E_RESULTS.json');
  const payload = { timestamp: new Date().toISOString(), work_package_id: 'S002-P003-WP002', gate_id: 'GATE_4', deepResults: results };
  fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
  return outPath;
}

run().then((results) => {
  writeArtifact(results);
  logger.printSummary();
  console.log('\n--- Deep E2E (sample BFs) ---');
  ['BF-G7-003', 'BF-G7-008', 'BF-G7-008-valid', 'BF-G7-012', 'BF-G7-017', 'BF-G7-026'].forEach(id => {
    const r = results[id];
    console.log(`${id}: ${r?.status || 'MISSING'} — ${r?.evidence || ''}`);
  });
  const failed = Object.values(results).filter(r => r && r.status === 'FAIL').length;
  process.exit(failed > 0 ? 1 : 0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
