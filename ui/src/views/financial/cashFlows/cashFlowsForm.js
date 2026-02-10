/**
 * Cash Flows Form - Form component for add/edit cash flows
 * --------------------------------------------------------
 * Creates and manages form for cash flows (D21)
 */

import { createModal, closeModal } from '../../../components/shared/PhoenixModal.js';
import sharedServices from '../../../components/core/Shared_Services.js';
import { maskedLog } from '../../../utils/maskedLog.js';

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
  const amount = data?.amount || 0;
  const currency = data?.currency || 'USD';
  const description = data?.description || '';
  const externalReference = data?.externalReference || data?.external_reference || '';

  // Get current filter if available
  const currentFilterAccount = window.PhoenixBridge?.state?.filters?.tradingAccount || '';
  const defaultAccountId = tradingAccountId || currentFilterAccount || '';

  // Build trading accounts dropdown
  let accountsOptions = '<option value="">בחר חשבון מסחר</option>';
  if (tradingAccounts.length > 0) {
    tradingAccounts.forEach(account => {
      const accountId = account.externalUlid || account.id || account.external_ulid;
      const accountName = account.displayName || account.name || account.display_name || accountId;
      const selected = accountId === defaultAccountId ? 'selected' : '';
      accountsOptions += `<option value="${accountId}" ${selected}>${accountName}</option>`;
    });
  }

  return `
    <form id="cashFlowForm" class="phoenix-form">
      <div class="form-group">
        <label for="tradingAccountId">חשבון מסחר *</label>
        <select id="tradingAccountId" name="tradingAccountId" required>
          ${accountsOptions}
        </select>
        <span class="form-error" id="tradingAccountIdError"></span>
      </div>
      
      <div class="form-group">
        <label for="transactionDate">תאריך תנועה *</label>
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
        <label for="flowType">סוג תנועה *</label>
        <select id="flowType" name="flowType" required>
          <option value="DEPOSIT" ${flowType === 'DEPOSIT' ? 'selected' : ''}>הפקדה</option>
          <option value="WITHDRAWAL" ${flowType === 'WITHDRAWAL' ? 'selected' : ''}>משיכה</option>
          <option value="DIVIDEND" ${flowType === 'DIVIDEND' ? 'selected' : ''}>דיבידנד</option>
          <option value="INTEREST" ${flowType === 'INTEREST' ? 'selected' : ''}>ריבית</option>
          <option value="FEE" ${flowType === 'FEE' ? 'selected' : ''}>עמלה</option>
          <option value="OTHER" ${flowType === 'OTHER' ? 'selected' : ''}>אחר</option>
        </select>
        <span class="form-error" id="flowTypeError"></span>
      </div>
      
      <div class="form-group">
        <label for="amount">סכום *</label>
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
        <label for="currency">מטבע *</label>
        <select id="currency" name="currency" required>
          <option value="USD" ${currency === 'USD' ? 'selected' : ''}>USD</option>
          <option value="ILS" ${currency === 'ILS' ? 'selected' : ''}>ILS</option>
          <option value="EUR" ${currency === 'EUR' ? 'selected' : ''}>EUR</option>
        </select>
        <span class="form-error" id="currencyError"></span>
      </div>
      
      <div class="form-group">
        <label for="description">תיאור</label>
        <textarea 
          id="description" 
          name="description" 
          placeholder="תיאור התנועה (אופציונלי)"
        >${description}</textarea>
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
    
    createModal({
      title: title,
      content: formHTML,
      showSaveButton: true,
      saveButtonText: 'שמור',
      onSave: function() {
        const form = document.getElementById('cashFlowForm');
        if (!form) return;
        
        // Validate form
        if (!form.checkValidity()) {
          form.reportValidity();
          return;
        }
        
        // Collect form data
        const formData = {
          tradingAccountId: document.getElementById('tradingAccountId').value.trim(),
          transactionDate: document.getElementById('transactionDate').value,
          flowType: document.getElementById('flowType').value,
          amount: parseFloat(document.getElementById('amount').value) || 0,
          currency: document.getElementById('currency').value,
          description: document.getElementById('description').value.trim(),
          externalReference: document.getElementById('externalReference').value.trim()
        };
        
        // Validate required fields
        if (!formData.tradingAccountId) {
          document.getElementById('tradingAccountIdError').textContent = 'חשבון מסחר הוא שדה חובה';
          return;
        }
        
        if (!formData.transactionDate) {
          document.getElementById('transactionDateError').textContent = 'תאריך תנועה הוא שדה חובה';
          return;
        }
        
        if (formData.amount <= 0) {
          document.getElementById('amountError').textContent = 'סכום חייב להיות גדול מ-0';
          return;
        }
        
        // Clear errors
        document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
        
        // Call save handler
        if (onSave) {
          onSave(formData, data);
        }
        
        // Close modal
        closeModal();
      },
      onClose: function() {
        // Cleanup if needed
      }
    });
  });
}
