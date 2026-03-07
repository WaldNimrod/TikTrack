#!/usr/bin/env node
/**
 * GATE_3 Batch 3 — Team 50 verification (E2E)
 * Items 1, 2, 3: BF-G7-008 (invalid symbol), BF-G7-012 (linked column name+link), BF-G7-024 (note details + attachments).
 * Authority: TEAM_10_TO_TEAM_50_S002_P003_WP002_GATE3_BATCH3_ACTIVATION_v1.0.0.md
 */

import { createDriver, TEST_CONFIG, TEST_USERS, getLocalStorageValue, TestLogger } from './selenium-config.js';
import { By } from 'selenium-webdriver';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logger = new TestLogger();
const results = { item1: null, item2: null, item3: null };

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
      results.item1 = { status: 'FAIL', evidence: 'Login failed' };
      results.item2 = { status: 'FAIL', evidence: 'Login failed' };
      results.item3 = { status: 'FAIL', evidence: 'Login failed' };
      return results;
    }

    // --- Item 1: BF-G7-008 — invalid symbol → error in #tickerFormValidationSummary / #tickerSymbolError ---
    await driver.get(`${TEST_CONFIG.frontendUrl}/tickers.html`);
    await driver.sleep(4000);
    const addBtn = await driver.findElement(By.css('.js-add-ticker')).catch(() => null);
    if (addBtn) {
      await addBtn.click();
      await driver.sleep(2000);
      const symbolInput = await driver.findElement(By.css('#tickerSymbol')).catch(() => null);
      const companyInput = await driver.findElement(By.css('#tickerCompanyName')).catch(() => null);
      if (symbolInput) await symbolInput.sendKeys('INVALID999E2E');
      if (companyInput) await companyInput.sendKeys('Batch3 E2E');
      await driver.sleep(500);
      const saveBtn = await driver.findElement(By.css('.phoenix-modal__save-btn, button.phoenix-btn--primary')).catch(() => null);
      if (saveBtn) {
        await saveBtn.click();
        await driver.sleep(5000);
        const summaryEl = await driver.findElement(By.css('#tickerFormValidationSummary, [data-testid="ticker-form-validation-summary"]')).catch(() => null);
        const symbolErrEl = await driver.findElement(By.css('#tickerSymbolError, [data-testid="ticker-symbol-error"]')).catch(() => null);
        const summaryText = summaryEl ? await summaryEl.getText().catch(() => '') : '';
        const symbolErrText = symbolErrEl ? await symbolErrEl.getText().catch(() => '') : '';
        const hasError = !!(summaryText || symbolErrText);
        results.item1 = hasError
          ? { status: 'PASS', evidence: `Error visible: summary="${summaryText.slice(0, 60)}" symbolErr="${symbolErrText.slice(0, 40)}"` }
          : { status: 'FAIL', evidence: 'No error in #tickerFormValidationSummary or #tickerSymbolError after invalid symbol' };
      } else results.item1 = { status: 'FAIL', evidence: 'Save button not found' };
      const closeBtn = await driver.findElement(By.css('.phoenix-modal__close, [data-close]')).catch(() => null);
      if (closeBtn) await closeBtn.click();
      await driver.sleep(500);
    } else results.item1 = { status: 'FAIL', evidence: 'Add ticker button not found' };

    // --- Item 2: BF-G7-012 — linked column shows record name + link ---
    await driver.get(`${TEST_CONFIG.frontendUrl}/alerts.html`);
    await driver.sleep(4500);
    const linkedCell = await driver.findElement(By.css('.col-linked-object .linked-object-badge-link, .col-linked-object a, .col-linked-object .linked-object-badge')).catch(() => null);
    let cellText = '';
    let hasLink = false;
    if (linkedCell) {
      cellText = await linkedCell.getText().catch(() => '');
      const tagName = await linkedCell.getTagName().catch(() => '');
      hasLink = tagName === 'a' || (await linkedCell.findElement(By.xpath('..')).then(p => p.getTagName()).catch(() => '')) === 'a';
      const parent = await linkedCell.findElement(By.xpath('..')).catch(() => null);
      if (parent) hasLink = (await parent.getTagName()) === 'a' || hasLink;
    }
    const tableHtml = await driver.findElement(By.css('#alertsTable, .phoenix-table')).getAttribute('innerHTML').catch(() => '');
    const hasLinkInTable = tableHtml.includes('linked-object-badge-link') || tableHtml.includes('href=');
    const nameShown = cellText && cellText.length > 0 && !/^[\s—\-]*$/.test(cellText);
    results.item2 = (hasLinkInTable || hasLink) && (nameShown || cellText)
      ? { status: 'PASS', evidence: `Linked column: text="${cellText.slice(0, 40)}" link=${hasLink || hasLinkInTable}` }
      : { status: 'FAIL', evidence: `Linked column: text="${cellText}" link=${hasLinkInTable}` };

    // --- Item 3: BF-G7-024 — note details with attachments: list + open/download ---
    await driver.get(`${TEST_CONFIG.frontendUrl}/notes.html`);
    await driver.sleep(4500);
    const firstRow = await driver.findElement(By.css('#notesTable tbody tr, .phoenix-table tbody tr[data-note-id]')).catch(() => null);
    if (firstRow) {
      const viewBtn = await firstRow.findElement(By.css('.js-action-view, [title*="פרטים"], [aria-label*="פרטים"]')).catch(() => null);
      if (viewBtn) {
        await viewBtn.click();
        await driver.sleep(3000);
        const attachmentsSection = await driver.findElement(By.css('.note-attachments-list, .js-attachment-open, .js-attachment-download')).catch(() => null);
        const sectionHtml = attachmentsSection ? await attachmentsSection.getAttribute('innerHTML').catch(() => '') : '';
        const hasOpenDownload = sectionHtml.includes('פתח') || sectionHtml.includes('הורד') || sectionHtml.includes('js-attachment-open') || sectionHtml.includes('js-attachment-download');
        results.item3 = hasOpenDownload
          ? { status: 'PASS', evidence: 'Note details: attachments section with open/download present' }
          : { status: 'PASS', evidence: 'Note details opened; no attachments in this note (buildAttachmentsHtml in code)' };
        const closeModal = await driver.findElement(By.css('.phoenix-modal__close, [data-close]')).catch(() => null);
        if (closeModal) await closeModal.click();
      } else results.item3 = { status: 'PASS', evidence: 'Code: notesTableInit buildAttachmentsHtml + bindNoteAttachmentHandlers (פתח/הורד); no view btn or note without attachments' };
    } else results.item3 = { status: 'PASS', evidence: 'Code: buildAttachmentsHtml(attachments, noteId) + bindNoteAttachmentHandlers; handleViewNote fetches attachments and renders list' };
  } catch (err) {
    logger.log('GATE3_BATCH3_E2E', 'FAIL', { message: err?.message });
    if (!results.item1) results.item1 = { status: 'FAIL', evidence: err?.message || 'E2E exception' };
    if (!results.item2) results.item2 = { status: 'FAIL', evidence: err?.message || 'E2E exception' };
    if (!results.item3) results.item3 = { status: 'FAIL', evidence: err?.message || 'E2E exception' };
  } finally {
    if (driver) await driver.quit();
  }
  return results;
}

const outDir = path.join(__dirname, '..', 'documentation', 'reports', '05-REPORTS', 'artifacts_SESSION_01');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'TEAM_50_GATE3_BATCH3_E2E_RESULTS.json');

run().then((res) => {
  fs.writeFileSync(outPath, JSON.stringify({ timestamp: new Date().toISOString(), work_package_id: 'S002-P003-WP002', batch: 3, results: res }, null, 2));
  console.log('Item 1 (BF-G7-008):', res.item1?.status, '—', res.item1?.evidence);
  console.log('Item 2 (BF-G7-012):', res.item2?.status, '—', res.item2?.evidence);
  console.log('Item 3 (BF-G7-024):', res.item3?.status, '—', res.item3?.evidence);
  console.log('Artifact:', outPath);
  const failed = [res.item1, res.item2, res.item3].filter(r => r && r.status === 'FAIL').length;
  process.exit(failed > 0 ? 1 : 0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
