/**
 * Tickers Form - Modal for add/edit ticker
 * Status: 4 system statuses (pending|active|inactive|cancelled) per TT2_SYSTEM_STATUS_VALUES_SSOT
 */

import { createModal, closeModal } from '../../../components/shared/PhoenixModal.js';
import { maskedLog } from '../../../utils/maskedLog.js';
import { STATUS_VALUES } from '../../../utils/statusValues.js';

const TICKER_TYPES = ['STOCK', 'ETF', 'OPTION', 'FUTURE', 'FOREX', 'CRYPTO', 'INDEX'];

/** Resolve status for form: prefer status from API, else is_active true->active, false->cancelled */
function getInitialStatus(data) {
  const canon = data?.status ? (['pending', 'active', 'inactive', 'cancelled'].includes(data.status) ? data.status : null) : null;
  if (canon) return canon;
  const isActive = data?.is_active ?? data?.isActive ?? true;
  return isActive ? 'active' : 'cancelled';
}

function createTickerFormHTML(data = null) {
  const isEdit = data !== null;
  const symbol = data?.symbol ?? '';
  const companyName = data?.company_name ?? data?.companyName ?? '';
  const tickerType = data?.ticker_type ?? data?.tickerType ?? 'STOCK';
  const initialStatus = getInitialStatus(data);

  const typeOptions = TICKER_TYPES.map(
    (t) => `<option value="${t}" ${tickerType === t ? 'selected' : ''}>${t}</option>`
  ).join('');

  const statusOptions = STATUS_VALUES.map(
    (s) => `<option value="${s.value}" ${initialStatus === s.value ? 'selected' : ''}>${s.label}</option>`
  ).join('');

  return `
    <form id="tickerForm" class="phoenix-form phoenix-form--two-col">
      <div class="form-row">
        <div class="form-group">
          <label for="tickerSymbol">סמל <span class="form-label-asterisk">*</span></label>
          <input 
            type="text" 
            id="tickerSymbol" 
            name="symbol" 
            value="${String(symbol).replace(/"/g, '&quot;')}" 
            maxlength="20"
            required 
            placeholder="AAPL"
            ${isEdit ? 'readonly' : ''}
          />
          <span class="form-error" id="tickerSymbolError"></span>
        </div>
        <div class="form-group">
          <label for="tickerCompanyName">שם חברה</label>
          <input 
            type="text" 
            id="tickerCompanyName" 
            name="company_name" 
            value="${String(companyName).replace(/"/g, '&quot;')}" 
            maxlength="255"
            placeholder="Apple Inc."
          />
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group">
          <label for="tickerType">סוג <span class="form-label-asterisk">*</span></label>
          <select id="tickerType" name="ticker_type" required>
            ${typeOptions}
          </select>
        </div>
        <div class="form-group">
          <label for="tickerStatus">סטטוס</label>
          <select id="tickerStatus" name="status" title="ממתין=בדיקה בלבד, פתוח=טעינה מלאה, סגור=טעינה מופחתת, מבוטל=לא פעיל">
            ${statusOptions}
          </select>
        </div>
      </div>
    </form>
  `;
}

/**
 * Show ticker form modal (add/edit)
 * @param {Object} data - Existing ticker (for edit) or null (for add)
 * @param {Function} onSave - Callback(formData, existingData) when saved
 */
export function showTickerFormModal(data, onSave) {
  const isEdit = data !== null;
  const title = isEdit ? 'עריכת טיקר' : 'הוספת טיקר';

  const formHTML = createTickerFormHTML(data);

  createModal({
    title,
    content: formHTML,
    entity: 'tickers',
    showSaveButton: true,
    saveButtonText: 'שמירה',
    onSave: async function () {
      const form = document.getElementById('tickerForm');
      if (!form) return;

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const symbol = document.getElementById('tickerSymbol')?.value?.trim() ?? '';
      const companyName = document.getElementById('tickerCompanyName')?.value?.trim() || null;
      const tickerType = document.getElementById('tickerType')?.value ?? 'STOCK';
      const status = document.getElementById('tickerStatus')?.value ?? 'active';
      const isActive = status !== 'cancelled';

      document.querySelectorAll('#tickerForm .form-error').forEach((el) => { el.textContent = ''; });

      if (!symbol) {
        const errEl = document.getElementById('tickerSymbolError');
        if (errEl) errEl.textContent = 'חובה להזין סמל';
        return;
      }

      const formData = {
        symbol: symbol.toUpperCase(),
        company_name: companyName,
        ticker_type: tickerType,
        status,
        is_active: isActive,
      };

      if (onSave) {
        try {
          const result = onSave(formData, data);
          if (result && typeof result.then === 'function') {
            await result;
          }
          closeModal();
        } catch (error) {
          maskedLog('[Tickers Form] Error saving:', { errorCode: error?.code, status: error?.status });
          const errEl = document.getElementById('tickerSymbolError');
          if (errEl) errEl.textContent = error?.detail ?? 'שגיאה בשמירה';
        }
      } else {
        closeModal();
      }
    },
    onClose: function () {},
  });
}
