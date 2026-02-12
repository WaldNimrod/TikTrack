/**
 * Cash Flows Form - Form component for add/edit cash flows
 * --------------------------------------------------------
 * Creates and manages form for cash flows (D21)
 * SOP-012: Rich-Text (TipTap) for description field
 */

import { createModal, closeModal } from '../../../components/shared/PhoenixModal.js';
import sharedServices from '../../../components/core/Shared_Services.js';
import { maskedLog } from '../../../utils/maskedLog.js';
import { getFlowTypeOptions } from '../../../utils/flowTypeValues.js';
import { createPhoenixRichTextEditor } from '../../../components/shared/phoenixRichTextEditor.js';

/**
 * Get trading accounts for dropdown
 * @returns {Promise<Array>} Array of trading accounts
 */
async function getTradingAccounts() {
  try {
    // Try to get from global state first
    if (window.PhoenixBridge?.state?.tradingAccounts) {
      return window.PhoenixBridge.state.tradingAccounts;
    }
    
    // Try to get from TradingAccountsDataLoader if available
    if (window.TradingAccountsDataLoader?.fetchTradingAccounts) {
      const accountsData = await window.TradingAccountsDataLoader.fetchTradingAccounts();
      return accountsData.data || [];
    }
    
    // Fallback: fetch directly from API
    await sharedServices.init();
    const response = await sharedServices.get('/trading_accounts', {});
    return response.data || [];
  } catch (error) {
    // Use masked log for security compliance
    maskedLog('[Cash Flows Form] Error fetching trading accounts:', {
      errorCode: error.code,
      status: error.status
    });
    // Return empty array - user can still type ULID manually
    return [];
  }
}

/**
 * Create cash flow form HTML
 * @param {Object} data - Existing cash flow data (for edit mode) or null (for add mode)
 * @param {Array} tradingAccounts - Array of trading accounts for dropdown
 * @returns {string} HTML string for the form
 */
function createCashFlowFormHTML(data = null, tradingAccounts = []) {
  const isEdit = data !== null;
  const tradingAccountId = data?.tradingAccountId || data?.trading_account_id || '';
  const transactionDate = data?.transactionDate || data?.transaction_date || new Date().toISOString().split('T')[0];
  const flowType = data?.flowType || data?.flow_type || 'DEPOSIT';
  const flowTypeOptions = getFlowTypeOptions();
  const amount = data?.amount || 0;
  const currency = data?.currency || 'USD';
  const description = data?.description || '';
  const externalReference = data?.externalReference || data?.external_reference || '';

  // Get current filter if available
  const currentFilterAccount = window.PhoenixBridge?.state?.filters?.tradingAccount || '';
  const defaultAccountId = tradingAccountId || currentFilterAccount || '';

  // Build trading accounts dropdown (D16 style: -- בחר --)
  let accountsOptions = '<option value="">-- בחר חשבון מסחר --</option>';
  if (tradingAccounts.length > 0) {
    tradingAccounts.forEach(account => {
      const accountId = account.externalUlid || account.id || account.external_ulid;
      const accountName = account.displayName || account.name || account.display_name || accountId;
      const selected = accountId === defaultAccountId ? 'selected' : '';
      accountsOptions += `<option value="${accountId}" ${selected}>${accountName}</option>`;
    });
  }

  return `
    <form id="cashFlowForm" class="phoenix-form phoenix-form--two-col">
      <div class="form-group">
        <label for="tradingAccountId">חשבון מסחר <span class="form-label-asterisk">*</span></label>
        <select id="tradingAccountId" name="tradingAccountId" required>
          ${accountsOptions}
        </select>
        <span class="form-error" id="tradingAccountIdError"></span>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="transactionDate">תאריך תנועה <span class="form-label-asterisk">*</span></label>
          <input 
            type="date" 
            id="transactionDate" 
            name="transactionDate" 
            value="${transactionDate}" 
            required 
          />
          <span class="form-error" id="transactionDateError"></span>
        </div>
        <div class="form-group">
          <label for="flowType">סוג תנועה <span class="form-label-asterisk">*</span></label>
          <select id="flowType" name="flowType" required>
            ${flowTypeOptions.map(opt => `<option value="${opt.value}" ${flowType === opt.value ? 'selected' : ''}>${opt.label}</option>`).join('\n            ')}
          </select>
          <span class="form-error" id="flowTypeError"></span>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="amount">סכום <span class="form-label-asterisk">*</span></label>
          <input 
            type="number" 
            id="amount" 
            name="amount" 
            value="${amount}" 
            step="0.01" 
            required 
            placeholder="0.00"
          />
          <span class="form-error" id="amountError"></span>
        </div>
        <div class="form-group">
          <label for="currency">מטבע <span class="form-label-asterisk">*</span></label>
          <select id="currency" name="currency" required>
            <option value="USD" ${currency === 'USD' ? 'selected' : ''}>USD</option>
            <option value="ILS" ${currency === 'ILS' ? 'selected' : ''}>ILS</option>
            <option value="EUR" ${currency === 'EUR' ? 'selected' : ''}>EUR</option>
          </select>
          <span class="form-error" id="currencyError"></span>
        </div>
      </div>
      
      <div class="form-group">
        <label for="description-editor-container">תיאור</label>
        <div id="description-editor-toolbar" class="phoenix-rt-toolbar">
          <button type="button" data-rt-cmd="bold" title="מודגש">ב</button>
          <button type="button" data-rt-cmd="italic" title="נטוי">נ</button>
          <button type="button" data-rt-cmd="underline" title="קו תחתון">ק</button>
          <span class="phoenix-rt-toolbar-sep">|</span>
          <button type="button" data-rt-cmd="phx-success" title="הצלחה" class="phx-rt--success">✓</button>
          <button type="button" data-rt-cmd="phx-warning" title="אזהרה" class="phx-rt--warning">!</button>
          <button type="button" data-rt-cmd="phx-danger" title="סכנה" class="phx-rt--danger">✕</button>
          <button type="button" data-rt-cmd="phx-highlight" title="הדגשה" class="phx-rt--highlight">◆</button>
          <span class="phoenix-rt-toolbar-sep">|</span>
          <button type="button" data-rt-cmd="bulletList" title="רשימה">•</button>
          <button type="button" data-rt-cmd="orderedList" title="רשימה ממוספרת">1.</button>
        </div>
        <div 
          id="description-editor-container" 
          class="phoenix-rt-editor-wrapper"
        ></div>
        <span class="form-error" id="descriptionError"></span>
      </div>
      
      <div class="form-group">
        <label for="externalReference">מזהה חיצוני</label>
        <input 
          type="text" 
          id="externalReference" 
          name="externalReference" 
          value="${externalReference}" 
          placeholder="מזהה חיצוני (אופציונלי)"
        />
        <span class="form-error" id="externalReferenceError"></span>
      </div>
    </form>
  `;
}

/**
 * Show cash flow modal (add/edit)
 * @param {Object} data - Existing cash flow data (for edit) or null (for add)
 * @param {Function} onSave - Callback function when form is saved
 */
export async function showCashFlowFormModal(data, onSave) {
  const isEdit = data !== null;
  const title = isEdit ? 'עריכת תזרים' : 'הוספת תזרים חדש';
  
  // Get trading accounts for dropdown
  getTradingAccounts().then(tradingAccounts => {
    const formHTML = createCashFlowFormHTML(data, tradingAccounts);
    let richTextInstance = null;

    createModal({
      title: title,
      content: formHTML,
      entity: 'cash_flow',
      showSaveButton: true,
      saveButtonText: 'שמירה',
      onSave: async function() {
        const form = document.getElementById('cashFlowForm');
        if (!form) return;

        // Validate form
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }

        const descriptionHtml = richTextInstance ? richTextInstance.getHTML() : '';
        const descPlain = descriptionHtml.replace(/<[^>]+>/g, '').trim();

        // Collect form data
        const formData = {
          tradingAccountId: document.getElementById('tradingAccountId').value.trim(),
          transactionDate: document.getElementById('transactionDate').value,
          flowType: document.getElementById('flowType').value,
          amount: parseFloat(document.getElementById('amount').value) || 0,
          currency: document.getElementById('currency').value,
          description: descPlain ? descriptionHtml : null,
          externalReference: document.getElementById('externalReference').value.trim()
        };

        // Clear previous errors
        form.querySelectorAll('.form-error').forEach(el => { el.textContent = ''; });

        // Validate required fields
        if (!formData.tradingAccountId) {
          const el = document.getElementById('tradingAccountIdError');
          if (el) el.textContent = 'חשבון מסחר הוא שדה חובה';
          return;
        }
        
        if (!formData.transactionDate) {
          const el = document.getElementById('transactionDateError');
          if (el) el.textContent = 'תאריך תנועה הוא שדה חובה';
          return;
        }
        
        if (formData.amount <= 0) {
          const el = document.getElementById('amountError');
          if (el) el.textContent = 'סכום חייב להיות גדול מ-0';
          return;
        }

        // Call save handler
        if (onSave) {
          try {
            const result = onSave(formData, data);
            if (result && typeof result.then === 'function') {
              await result;
            }
            if (richTextInstance) {
              richTextInstance.destroy();
              richTextInstance = null;
            }
            closeModal();
          } catch (error) {
            console.error('[Cash Flows Form] Error saving:', error);
          }
        } else {
          if (richTextInstance) {
            richTextInstance.destroy();
            richTextInstance = null;
          }
          closeModal();
        }
      },
      onClose: function() {
        if (richTextInstance) {
          richTextInstance.destroy();
          richTextInstance = null;
        }
      }
    });

    // Init TipTap after modal is in DOM
    setTimeout(() => {
      const container = document.getElementById('description-editor-container');
      if (container) {
        const initialContent = data?.description || '';
        richTextInstance = createPhoenixRichTextEditor(container, {
          content: initialContent,
          placeholder: 'תיאור התנועה (אופציונלי)',
          toolbarId: 'description-editor-toolbar'
        });
      }
    }, 100);
  });
}
