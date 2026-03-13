/**
 * Brokers Fees Form - Form component for add/edit broker fees
 * --------------------------------------------------------
 * Creates and manages form for broker fees (D18)
 * ADR-015: Fees per Trading Account — trading_account_id required; no broker select
 */

import {
  createModal,
  closeModal,
} from '../../../components/shared/PhoenixModal.js';
import sharedServices from '../../../components/core/sharedServices.js';
import { maskedLog } from '../../../utils/maskedLog.js';

/**
 * Get trading accounts for dropdown
 * @returns {Promise<Array>} Array of trading accounts
 */
async function getTradingAccounts() {
  try {
    if (window.PhoenixBridge?.state?.tradingAccounts?.length) {
      return window.PhoenixBridge.state.tradingAccounts;
    }
    if (window.TradingAccountsDataLoader?.fetchTradingAccounts) {
      const accountsData =
        await window.TradingAccountsDataLoader.fetchTradingAccounts();
      return accountsData.data || [];
    }
    await sharedServices.init();
    const response = await sharedServices.get('/trading_accounts', {});
    return response.data || response || [];
  } catch (error) {
    maskedLog('[Brokers Fees Form] Error fetching trading accounts:', {
      errorCode: error?.code,
      status: error?.status,
    });
    return [];
  }
}

/**
 * Create broker fee form HTML (ADR-015: trading_account_id, commission fields only)
 * @param {Object} data - Existing broker fee data (for edit) or null (for add)
 * @param {Array} tradingAccounts - Trading accounts for dropdown
 * @param {string} preselectedAccountId - Pre-selected trading_account_id (e.g. from page filter)
 */
function createBrokerFeeFormHTML(
  data = null,
  tradingAccounts = [],
  preselectedAccountId = '',
) {
  const isEdit = data !== null;
  const tradingAccountId =
    data?.tradingAccountId ??
    data?.trading_account_id ??
    preselectedAccountId ??
    '';
  const commissionType =
    data?.commissionType ?? data?.commission_type ?? 'TIERED';
  const commissionValueRaw =
    data?.commissionValue ?? data?.commission_value ?? 0;
  const commissionValue =
    typeof commissionValueRaw === 'string' && commissionValueRaw.includes('/')
      ? parseFloat(commissionValueRaw.replace(/[^0-9.]/g, '')) || 0
      : typeof commissionValueRaw === 'number'
        ? commissionValueRaw
        : parseFloat(commissionValueRaw) || 0;
  const minimum = data?.minimum ?? 0;

  let accountOptions = '<option value="">-- לבחור חשבון מסחר --</option>';
  if (tradingAccounts.length > 0) {
    tradingAccounts.forEach((acc) => {
      const id = acc.externalUlid ?? acc.id ?? acc.external_ulid ?? '';
      const name =
        acc.displayName ??
        acc.accountName ??
        acc.display_name ??
        acc.account_name ??
        id;
      const sel = id === tradingAccountId ? 'selected' : '';
      accountOptions += `<option value="${String(id).replace(/"/g, '&quot;')}" ${sel}>${String(name).replace(/</g, '&lt;')}</option>`;
    });
  }

  return `
    <form id="brokerFeeForm" class="phoenix-form phoenix-form--two-col">
      <div class="form-row">
        <div class="form-group">
          <label for="tradingAccountId">חשבון מסחר <span class="form-label-asterisk">*</span></label>
          <select id="tradingAccountId" name="tradingAccountId" required>
            ${accountOptions}
          </select>
          <span class="form-error" id="tradingAccountIdError"></span>
        </div>
        <div class="form-group">
          <label for="commissionType">סוג עמלה <span class="form-label-asterisk">*</span></label>
          <select id="commissionType" name="commissionType" required>
            <option value="TIERED" ${commissionType === 'TIERED' ? 'selected' : ''}>מדורגת (TIERED)</option>
            <option value="FLAT" ${commissionType === 'FLAT' ? 'selected' : ''}>קבועה (FLAT)</option>
          </select>
          <span class="form-error" id="commissionTypeError"></span>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="commissionValue">ערך עמלה <span class="form-label-asterisk">*</span></label>
          <input 
            type="number" 
            id="commissionValue" 
            name="commissionValue" 
            value="${commissionValue}" 
            step="0.000001" 
            min="0" 
            required 
            placeholder="לדוגמה: 0.0035"
          />
          <span class="form-error" id="commissionValueError"></span>
        </div>
        <div class="form-group">
          <label for="minimum">מינימום לפעולה (USD) <span class="form-label-asterisk">*</span></label>
          <input 
            type="number" 
            id="minimum" 
            name="minimum" 
            value="${minimum}" 
            step="0.01" 
            min="0" 
            required 
            placeholder="0.00"
          />
          <span class="form-error" id="minimumError"></span>
        </div>
      </div>
    </form>
  `;
}

/**
 * Show broker fee modal (add/edit)
 * @param {Object} data - Existing broker fee data (for edit) or null (for add)
 * @param {Function} onSave - Callback function when form is saved
 * @param {string} preselectedAccountId - Optional pre-selected trading_account_id
 */
export async function showBrokerFeeFormModal(
  data,
  onSave,
  preselectedAccountId = '',
) {
  const isEdit = data !== null;
  const title = isEdit ? 'עריכת עמלה' : 'הוספת עמלה לחשבון מסחר';

  const tradingAccounts = await getTradingAccounts();
  const formHTML = createBrokerFeeFormHTML(
    data,
    tradingAccounts,
    preselectedAccountId,
  );

  createModal({
    title,
    content: formHTML,
    entity: 'brokers_fees',
    showSaveButton: true,
    saveButtonText: 'שמירה',
    onSave: async function () {
      const form = document.getElementById('brokerFeeForm');
      if (!form) return;

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const tradingAccountIdValue =
        document.getElementById('tradingAccountId')?.value?.trim() ?? '';
      const commissionTypeValue =
        document.getElementById('commissionType')?.value ?? 'TIERED';
      const commissionValueInput =
        document.getElementById('commissionValue')?.value?.trim() ?? '';
      const minimumInput =
        document.getElementById('minimum')?.value?.trim() ?? '';

      const commissionValueParsed = commissionValueInput
        ? parseFloat(commissionValueInput)
        : NaN;
      const minimumParsed = minimumInput ? parseFloat(minimumInput) : NaN;

      // Clear previous errors
      document.querySelectorAll('#brokerFeeForm .form-error').forEach((el) => {
        el.textContent = '';
      });

      if (!tradingAccountIdValue) {
        const errEl = document.getElementById('tradingAccountIdError');
        if (errEl) errEl.textContent = 'חובה לבחור חשבון מסחר';
        return;
      }

      if (isNaN(commissionValueParsed) || commissionValueParsed < 0) {
        const errEl = document.getElementById('commissionValueError');
        if (errEl) errEl.textContent = 'ערך עמלה חייב להיות מספר חיובי';
        return;
      }

      if (isNaN(minimumParsed) || minimumParsed < 0) {
        const errEl = document.getElementById('minimumError');
        if (errEl) errEl.textContent = 'מינימום חייב להיות מספר חיובי';
        return;
      }

      const formData = {
        tradingAccountId: tradingAccountIdValue,
        commissionType: commissionTypeValue,
        commissionValue: commissionValueParsed,
        minimum: minimumParsed,
      };

      if (onSave) {
        try {
          const result = onSave(formData, data);
          if (result && typeof result.then === 'function') {
            await result;
          }
          closeModal();
        } catch (error) {
          maskedLog('[Brokers Fees Form] Error saving:', {
            errorCode: error?.code,
            status: error?.status,
          });
        }
      } else {
        closeModal();
      }
    },
    onClose: function () {},
  });
}
