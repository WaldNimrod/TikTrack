/**
 * Tickers Form - Modal for add/edit ticker
 * Status: 4 system statuses (pending|active|inactive|cancelled) per TT2_SYSTEM_STATUS_VALUES_SSOT
 * R2 1.7: exchange dropdown (GET /reference/exchanges), exchange_id in create
 */

import {
  createModal,
  closeModal,
} from '../../../components/shared/PhoenixModal.js';
import sharedServices from '../../../components/core/sharedServices.js';
import { maskedLog } from '../../../utils/maskedLog.js';
import { STATUS_VALUES } from '../../../utils/statusValues.js';

const TICKER_TYPES = [
  'STOCK',
  'ETF',
  'OPTION',
  'FUTURE',
  'FOREX',
  'CRYPTO',
  'INDEX',
];

/** Resolve status for form: prefer status from API, else is_active true->active, false->cancelled */
function getInitialStatus(data) {
  const canon = data?.status
    ? ['pending', 'active', 'inactive', 'cancelled'].includes(data.status)
      ? data.status
      : null
    : null;
  if (canon) return canon;
  const isActive = data?.is_active ?? data?.isActive ?? true;
  return isActive ? 'active' : 'cancelled';
}

function createTickerFormHTML(data = null, exchanges = []) {
  const isEdit = data !== null;
  const symbol = data?.symbol ?? '';
  const companyName = data?.company_name ?? data?.companyName ?? '';
  const tickerType = data?.ticker_type ?? data?.tickerType ?? 'STOCK';
  const initialStatus = getInitialStatus(data);
  const selectedExchangeId = data?.exchange_id ?? data?.exchangeId ?? '';

  const typeOptions = TICKER_TYPES.map(
    (t) =>
      `<option value="${t}" ${tickerType === t ? 'selected' : ''}>${t}</option>`,
  ).join('');

  const statusOptions = STATUS_VALUES.map(
    (s) =>
      `<option value="${s.value}" ${initialStatus === s.value ? 'selected' : ''}>${s.label}</option>`,
  ).join('');

  const exchangeOptions = [
    '<option value="">— ללא בורסה —</option>',
    ...exchanges.map((ex) => {
      const id = ex.id ?? ex.external_ulid ?? '';
      const code = ex.exchange_code ?? ex.exchangeCode ?? '';
      const name = ex.exchange_name ?? ex.exchangeName ?? code;
      return `<option value="${id}" ${selectedExchangeId === id ? 'selected' : ''}>${code} — ${name}</option>`;
    }),
  ].join('');

  return `
    <form id="tickerForm" class="phoenix-form phoenix-form--two-col">
      <div id="tickerFormValidationSummary" class="form-validation-summary" role="alert" aria-live="polite" data-testid="ticker-form-validation-summary" hidden></div>
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
            placeholder="AAPL או ANAU.MI"
            ${isEdit ? 'readonly' : ''}
          />
          <span class="form-error" id="tickerSymbolError" role="alert" data-testid="ticker-symbol-error"></span>
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
          <label for="tickerExchange">בורסה</label>
          <select id="tickerExchange" name="exchange_id" aria-label="בורסה — לדוגמה MIL ל-ANAU.MI">
            ${exchangeOptions}
          </select>
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
export async function showTickerFormModal(data, onSave) {
  const isEdit = data !== null;
  const title = isEdit ? 'עריכת טיקר' : 'הוספת טיקר';

  let exchanges = [];
  try {
    await sharedServices.init();
    const res = await sharedServices.get('/reference/exchanges', {});
    const raw = res?.data ?? res ?? [];
    exchanges = Array.isArray(raw) ? raw : [];
  } catch (e) {
    maskedLog('[Tickers Form] Failed to load exchanges:', {
      errorCode: e?.code,
    });
  }

  const formHTML = createTickerFormHTML(data, exchanges);

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
        const summaryEl = document.getElementById(
          'tickerFormValidationSummary',
        );
        if (summaryEl) {
          summaryEl.textContent = 'יש לתקן את השדות המסומנים לפני שמירה';
          summaryEl.hidden = false;
        }
        form.reportValidity();
        return;
      }

      document
        .getElementById('tickerFormValidationSummary')
        ?.setAttribute('hidden', '');
      const symbol =
        document.getElementById('tickerSymbol')?.value?.trim() ?? '';
      const companyName =
        document.getElementById('tickerCompanyName')?.value?.trim() || null;
      const tickerType =
        document.getElementById('tickerType')?.value ?? 'STOCK';
      const status = document.getElementById('tickerStatus')?.value ?? 'active';
      const exchangeId =
        document.getElementById('tickerExchange')?.value?.trim() || null;
      const isActive = status !== 'cancelled';

      document.querySelectorAll('#tickerForm .form-error').forEach((el) => {
        el.textContent = '';
      });
      document
        .getElementById('tickerFormValidationSummary')
        ?.setAttribute('hidden', '');

      if (!symbol) {
        const errEl = document.getElementById('tickerSymbolError');
        if (errEl) errEl.textContent = 'חובה להזין סמל';
        const summaryEl = document.getElementById(
          'tickerFormValidationSummary',
        );
        if (summaryEl) {
          summaryEl.textContent = 'חובה להזין סמל';
          summaryEl.hidden = false;
        }
        return;
      }

      const formData = {
        symbol: symbol.toUpperCase(),
        company_name: companyName,
        ticker_type: tickerType,
        status,
        is_active: isActive,
      };
      if (exchangeId) formData.exchange_id = exchangeId;

      if (onSave) {
        try {
          const result = onSave(formData, data);
          if (result && typeof result.then === 'function') {
            await result;
          }
          closeModal();
        } catch (error) {
          maskedLog('[Tickers Form] Error saving:', {
            errorCode: error?.code,
            status: error?.status,
          });
          const msg = String(
            error?.message ?? error?.detail ?? 'שגיאה בשמירה',
          ).trim();
          const errEl = document.getElementById('tickerSymbolError');
          if (errEl) errEl.textContent = msg;
          const summaryEl = document.getElementById(
            'tickerFormValidationSummary',
          );
          if (summaryEl) {
            summaryEl.textContent = msg;
            summaryEl.hidden = false;
          }
        }
      } else {
        closeModal();
      }
    },
    onClose: function () {},
  });
}
