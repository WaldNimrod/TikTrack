/**
 * User Ticker Edit Form — D33 display_name
 * --------------------------------------------------------
 * Edit display_name for a user ticker via PATCH /me/tickers/{tickerId}
 * Per: Phase D UX Display, G7 Remediation
 */

import { createModal } from '../../../components/shared/PhoenixModal.js';
import sharedServices from '../../../components/core/sharedServices.js';
import { maskedLog } from '../../../utils/maskedLog.js';
import { reactToApi } from '../../../cubes/shared/utils/transformers.js';

/**
 * Show edit display_name modal
 * @param {Object} options
 * @param {Object} options.ticker - Ticker object with id, symbol, display_name
 * @param {Function} options.onSuccess - Callback after successful save
 */
export function showUserTickerEditModal(options = {}) {
  const { ticker = {}, onSuccess = null } = options;
  const tickerId = ticker.id ?? ticker.external_ulid ?? '';
  const currentDisplayName = (
    ticker.display_name ||
    ticker.displayName ||
    ''
  ).trim();
  const symbol = ticker.symbol ?? '';

  const formHTML = `
    <form id="userTickerEditForm" class="phoenix-form">
      <div class="form-group">
        <label for="userTickerDisplayName">שם תצוגה</label>
        <input 
          type="text" 
          id="userTickerDisplayName" 
          name="display_name" 
          maxlength="100"
          placeholder="${symbol || 'שם תצוגה'}"
          value="${(currentDisplayName || '').replace(/"/g, '&quot;')}"
        />
        <span class="form-error" id="userTickerEditError"></span>
      </div>
    </form>
  `;

  createModal({
    title: 'עריכת שם תצוגה',
    content: formHTML,
    entity: 'user_tickers',
    showSaveButton: true,
    saveButtonText: 'שמירה',
    cancelButtonText: 'ביטול',
    onSave: async function () {
      const input = document.getElementById('userTickerDisplayName');
      const errEl = document.getElementById('userTickerEditError');
      if (errEl) errEl.textContent = '';
      const display_name = (input?.value ?? '').trim();

      try {
        await sharedServices.init();
        const payload = reactToApi({ display_name });
        await sharedServices.patch(`/me/tickers/${tickerId}`, payload);
        document.getElementById('phoenix-modal-backdrop')?.remove();
        if (typeof onSuccess === 'function') onSuccess();
      } catch (error) {
        maskedLog('[UserTicker Edit] Error:', {
          status: error?.status,
          code: error?.code,
        });
        const msg = (
          error?.detail ??
          error?.message ??
          error?.message_i18n ??
          'שגיאה בעדכון שם תצוגה'
        ).trim();
        if (errEl) errEl.textContent = msg;
      }
    },
    onClose: function () {},
  });
}
