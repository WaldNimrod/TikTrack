/**
 * Trading Accounts Form - Form component for add/edit trading accounts
 * --------------------------------------------------------
 * Creates and manages form for trading accounts (D16)
 * ADR-013: Broker select from GET /api/v1/reference/brokers
 * ADR-015: "אחר" + הודעת משילות (בחירת ברוקר בלבד)
 */

import { createModal, closeModal } from '../../../components/shared/PhoenixModal.js';
import { fetchReferenceBrokers } from '../shared/fetchReferenceBrokers.js';
import { getGovernanceMessageData } from '../shared/adr015GovernanceMessage.js';

/**
 * Create trading account form HTML
 * @param {Object} data - Existing trading account data (for edit mode) or null (for add mode)
 * @param {Array<{value: string, label: string}>} brokerOptions - Broker options for select
 * @returns {string} HTML string for the form
 */
function createTradingAccountFormHTML(data = null, brokerOptions = []) {
  const isEdit = data !== null;
  const accountName = data?.accountName || data?.displayName || data?.account_name || '';
  const broker = data?.broker || '';
  const accountNumber = data?.accountNumber || data?.account_number || '';
  const initialBalance = data?.initialBalance || data?.initial_balance || data?.balance || 0;
  const currency = data?.currency || 'USD';
  const isActive = data?.isActive !== undefined ? data.isActive : (data?.is_active !== undefined ? data.is_active : true);
  const externalAccountId = data?.externalAccountId || data?.external_account_id || '';

  // Deduplicate by value - prevents "אחר" twice (API returns "other" + user may have "אחר" from legacy)
  const byValue = new Map();
  for (const o of brokerOptions) {
    const v = (o.value || '').toString().trim();
    const equiv = v.toLowerCase() === 'other' || v === 'אחר';
    if (equiv) {
      if (!byValue.has('other')) byValue.set('other', { value: 'other', label: 'אחר' });
      continue;
    }
    if (v && !byValue.has(v)) byValue.set(v, { value: o.value, label: o.label || o.display_name || o.value });
  }
  // Ensure current broker is in options (legacy/edit case)
  if (broker && broker !== 'other' && broker !== 'אחר' && !byValue.has(broker)) {
    byValue.set(broker, { value: broker, label: broker });
  }
  // ADR-015 §8: "אחר" from API or inject if not present
  if (!byValue.has('other')) byValue.set('other', { value: 'other', label: 'אחר' });
  const options = Array.from(byValue.values());
  const brokerForSelect = (broker === 'אחר' ? 'other' : broker);
const brokerOptionsHTML = options.map(o => `<option value="${String(o.value).replace(/"/g, '&quot;')}" ${brokerForSelect === o.value ? 'selected' : ''}>${String(o.label)}</option>`).join('');

  const govMsg = getGovernanceMessageData();
  const governanceMessageHTML = `
    <div id="governanceMessageContainer" class="form-group" style="display:none;">
      <div class="governance-message governance-message--warning" role="alert">
        <p class="governance-message__text">${govMsg.body}<a href="${govMsg.linkHref}" class="governance-message__link" target="_blank" rel="noopener noreferrer">${govMsg.linkText}</a>.</p>
      </div>
    </div>
    <div id="brokerOtherNameGroup" class="form-group" style="display:none;">
      <label for="brokerOtherName">שם ברוקר (הזנה ידנית) *</label>
      <input type="text" id="brokerOtherName" name="brokerOtherName" placeholder="הזן את שם הברוקר" maxlength="100" />
      <span class="form-error" id="brokerOtherNameError"></span>
    </div>
  `;

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
        <label for="broker">ברוקר *</label>
        <select id="broker" name="broker" required>
          <option value="">-- בחר ברוקר --</option>
          ${brokerOptionsHTML}
        </select>
        <span class="form-error" id="brokerError"></span>
        ${governanceMessageHTML}
      </div>
      
      <div class="form-group">
        <label for="accountNumber">מספר חשבון *</label>
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
 * Initialize broker "other" handlers (ADR-015) - show governance message when "other" selected
 */
function initBrokerOtherHandlers() {
  const brokerSelect = document.getElementById('broker');
  const govContainer = document.getElementById('governanceMessageContainer');
  const otherNameGroup = document.getElementById('brokerOtherNameGroup');
  if (!brokerSelect || !govContainer || !otherNameGroup) return;
  
  function toggleOtherUI() {
    const isOther = brokerSelect.value === 'other';
    govContainer.style.display = isOther ? 'block' : 'none';
    otherNameGroup.style.display = isOther ? 'block' : 'none';
    const otherInput = document.getElementById('brokerOtherName');
    if (otherInput) otherInput.required = isOther;
  }
  
  brokerSelect.addEventListener('change', toggleOtherUI);
  toggleOtherUI();
}

/**
 * Show trading account modal (add/edit)
 * @param {Object} data - Existing trading account data (for edit) or null (for add)
 * @param {Function} onSave - Callback function when form is saved
 */
/**
 * @param {Object|null} data - Existing account (edit) or null (add)
 * @param {Function} onSave - Save callback (formData, originalData) => Promise
 * @param {{ existingAccounts?: Array }} options - Optional: existingAccounts for uniqueness validation
 */
export async function showTradingAccountFormModal(data, onSave, options = {}) {
  const modalOptions = options;
  const isEdit = data !== null;
  const title = isEdit ? 'עריכת חשבון מסחר' : 'הוספת חשבון מסחר חדש';
  
  let brokerOptions = [];
  try {
    brokerOptions = await fetchReferenceBrokers();
  } catch (e) {
    console.warn('[Trading Accounts Form] Could not load brokers, using empty list:', e);
  }
  const formHTML = createTradingAccountFormHTML(data, brokerOptions);
  
  createModal({
    title,
    content: formHTML,
    entity: 'trading_account',
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
      const brokerSelectValue = document.getElementById('broker').value?.trim() || null;
      const brokerOtherNameValue = document.getElementById('brokerOtherName')?.value?.trim() || '';
      const accountNumberValue = document.getElementById('accountNumber').value.trim();
      const initialBalanceInput = document.getElementById('initialBalance').value.trim();
      const currencyValue = document.getElementById('currency').value;
      const isActiveValue = document.getElementById('isActive').value === 'true';
      const externalAccountIdValue = document.getElementById('externalAccountId').value.trim();
      
      // Parse initialBalance - ensure it's a valid number
      const initialBalanceParsed = initialBalanceInput ? parseFloat(initialBalanceInput) : NaN;
      
      // Clear previous errors
      ['accountNameError', 'brokerError', 'accountNumberError', 'initialBalanceError'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '';
      });

      // Validate required fields
      if (!accountNameValue) {
        document.getElementById('accountNameError').textContent = 'שם החשבון הוא שדה חובה';
        return;
      }

      if (!brokerSelectValue) {
        document.getElementById('brokerError').textContent = 'חובה לבחור ברוקר';
        return;
      }

      if (!accountNumberValue) {
        document.getElementById('accountNumberError').textContent = 'מספר חשבון הוא שדה חובה';
        return;
      }
      
      if (isNaN(initialBalanceParsed) || initialBalanceParsed < 0) {
        document.getElementById('initialBalanceError').textContent = 'יתרה התחלתית חייבת להיות מספר חיובי';
        return;
      }

      // Uniqueness: account name and account number must be unique per user (client-side check)
      const existingAccounts = (modalOptions && modalOptions.existingAccounts) || [];
      const dupName = existingAccounts.some(acc => {
        const id = data?.externalUlid || data?.external_ulid || data?.id;
        const accId = acc.externalUlid || acc.external_ulid || acc.id;
        if (id && accId && String(id) === String(accId)) return false;
        const n = (acc.accountName || acc.display_name || acc.account_name || '').trim().toLowerCase();
        return n === accountNameValue.trim().toLowerCase();
      });
      if (dupName) {
        document.getElementById('accountNameError').textContent = 'קיים כבר חשבון עם שם זה';
        return;
      }
      const dupNum = existingAccounts.some(acc => {
        const id = data?.externalUlid || data?.external_ulid || data?.id;
        const accId = acc.externalUlid || acc.external_ulid || acc.id;
        if (id && accId && String(id) === String(accId)) return false;
        const num = (acc.accountNumber || acc.account_number || '').trim().toLowerCase();
        return num && num === accountNumberValue.trim().toLowerCase();
      });
      if (dupNum) {
        document.getElementById('accountNumberError').textContent = 'מספר חשבון זה כבר קיים אצלך';
        return;
      }
      
      // ADR-015: when "other" selected, use custom broker name; require non-empty
      const brokerValue = brokerSelectValue === 'other'
        ? brokerOtherNameValue || null
        : (brokerSelectValue || null);
      const brokerOtherNameErrEl = document.getElementById('brokerOtherNameError');
      if (brokerSelectValue === 'other' && !brokerOtherNameValue) {
        if (brokerOtherNameErrEl) brokerOtherNameErrEl.textContent = 'יש להזין את שם הברוקר';
        return;
      }
      if (brokerOtherNameErrEl) brokerOtherNameErrEl.textContent = '';
      
      const formData = {
        accountName: accountNameValue,
        broker: brokerValue,
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
  
  initBrokerOtherHandlers();
}
