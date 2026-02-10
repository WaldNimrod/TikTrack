/**
 * Trading Accounts Form - Form component for add/edit trading accounts
 * --------------------------------------------------------
 * Creates and manages form for trading accounts (D16)
 */

import { createModal, closeModal } from '../../../components/shared/PhoenixModal.js';

/**
 * Create trading account form HTML
 * @param {Object} data - Existing trading account data (for edit mode) or null (for add mode)
 * @returns {string} HTML string for the form
 */
function createTradingAccountFormHTML(data = null) {
  const isEdit = data !== null;
  const accountName = data?.accountName || data?.displayName || data?.account_name || '';
  const broker = data?.broker || '';
  const accountNumber = data?.accountNumber || data?.account_number || '';
  const initialBalance = data?.initialBalance || data?.initial_balance || data?.balance || 0;
  const currency = data?.currency || 'USD';
  const isActive = data?.isActive !== undefined ? data.isActive : (data?.is_active !== undefined ? data.is_active : true);
  const externalAccountId = data?.externalAccountId || data?.external_account_id || '';

  return `
    <form id="tradingAccountForm" class="phoenix-form">
      <div class="form-group">
        <label for="accountName">שם החשבון *</label>
        <input 
          type="text" 
          id="accountName" 
          name="accountName" 
          value="${accountName}" 
          required 
          maxlength="100"
          placeholder="הזן שם חשבון"
        />
        <span class="form-error" id="accountNameError"></span>
      </div>
      
      <div class="form-group">
        <label for="broker">ברוקר</label>
        <input 
          type="text" 
          id="broker" 
          name="broker" 
          value="${broker}" 
          maxlength="100"
          placeholder="הזן שם ברוקר"
        />
        <span class="form-error" id="brokerError"></span>
      </div>
      
      <div class="form-group">
        <label for="accountNumber">מספר חשבון</label>
        <input 
          type="text" 
          id="accountNumber" 
          name="accountNumber" 
          value="${accountNumber}" 
          maxlength="50"
          placeholder="הזן מספר חשבון"
        />
        <span class="form-error" id="accountNumberError"></span>
      </div>
      
      <div class="form-group">
        <label for="initialBalance">יתרה התחלתית *</label>
        <input 
          type="number" 
          id="initialBalance" 
          name="initialBalance" 
          value="${initialBalance}" 
          step="0.01" 
          min="0" 
          required 
          placeholder="0.00"
        />
        <span class="form-error" id="initialBalanceError"></span>
      </div>
      
      <div class="form-group">
        <label for="currency">מטבע *</label>
        <select id="currency" name="currency" required>
          <option value="USD" ${currency === 'USD' ? 'selected' : ''}>USD - דולר אמריקאי</option>
          <option value="EUR" ${currency === 'EUR' ? 'selected' : ''}>EUR - אירו</option>
          <option value="GBP" ${currency === 'GBP' ? 'selected' : ''}>GBP - לירה שטרלינג</option>
          <option value="ILS" ${currency === 'ILS' ? 'selected' : ''}>ILS - שקל ישראלי</option>
        </select>
        <span class="form-error" id="currencyError"></span>
      </div>
      
      <div class="form-group">
        <label for="isActive">סטטוס</label>
        <select id="isActive" name="isActive" required>
          <option value="true" ${isActive ? 'selected' : ''}>פעיל</option>
          <option value="false" ${!isActive ? 'selected' : ''}>לא פעיל</option>
        </select>
        <span class="form-error" id="isActiveError"></span>
      </div>
      
      <div class="form-group">
        <label for="externalAccountId">מזהה חשבון חיצוני</label>
        <input 
          type="text" 
          id="externalAccountId" 
          name="externalAccountId" 
          value="${externalAccountId}" 
          maxlength="100"
          placeholder="הזן מזהה חשבון חיצוני (אופציונלי)"
        />
        <span class="form-error" id="externalAccountIdError"></span>
      </div>
    </form>
  `;
}

/**
 * Show trading account modal (add/edit)
 * @param {Object} data - Existing trading account data (for edit) or null (for add)
 * @param {Function} onSave - Callback function when form is saved
 */
export function showTradingAccountFormModal(data, onSave) {
  const isEdit = data !== null;
  const title = isEdit ? 'עריכת חשבון מסחר' : 'הוספת חשבון מסחר חדש';
  
  const formHTML = createTradingAccountFormHTML(data);
  
  createModal({
    title: title,
    content: formHTML,
    showSaveButton: true,
    saveButtonText: 'שמור',
    onSave: async function() {
      const form = document.getElementById('tradingAccountForm');
      if (!form) return;
      
      // Validate form
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      
      // Collect form data
      const accountNameValue = document.getElementById('accountName').value.trim();
      const brokerValue = document.getElementById('broker').value.trim();
      const accountNumberValue = document.getElementById('accountNumber').value.trim();
      const initialBalanceInput = document.getElementById('initialBalance').value.trim();
      const currencyValue = document.getElementById('currency').value;
      const isActiveValue = document.getElementById('isActive').value === 'true';
      const externalAccountIdValue = document.getElementById('externalAccountId').value.trim();
      
      // Parse initialBalance - ensure it's a valid number
      const initialBalanceParsed = initialBalanceInput ? parseFloat(initialBalanceInput) : NaN;
      
      // Validate required fields
      if (!accountNameValue) {
        document.getElementById('accountNameError').textContent = 'שם החשבון הוא שדה חובה';
        return;
      }
      
      if (isNaN(initialBalanceParsed) || initialBalanceParsed < 0) {
        document.getElementById('initialBalanceError').textContent = 'יתרה התחלתית חייבת להיות מספר חיובי';
        return;
      }
      
      const formData = {
        accountName: accountNameValue,
        broker: brokerValue || null,
        accountNumber: accountNumberValue || null,
        initialBalance: initialBalanceParsed,
        currency: currencyValue,
        isActive: isActiveValue,
        externalAccountId: externalAccountIdValue || null
      };
      
      // Call save handler (async - don't close modal if error)
      if (onSave) {
        // Wrap in try-catch to handle errors
        try {
          const result = onSave(formData, data);
          // If onSave returns a promise, wait for it
          if (result && typeof result.then === 'function') {
            await result;
          }
          // Only close modal if save succeeded (no error thrown)
          closeModal();
        } catch (error) {
          // Error handling is done in handleSaveTradingAccount
          // Don't close modal on error so user can see the error message
          console.error('[Trading Accounts Form] Error saving:', error);
          // Modal stays open so user can fix and retry
        }
      } else {
        // No save handler - just close modal
        closeModal();
      }
    },
    onClose: function() {
      // Cleanup if needed
    }
  });
}
