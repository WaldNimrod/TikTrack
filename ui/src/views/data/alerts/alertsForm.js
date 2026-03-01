/**
 * Alerts Form — D34 (MB3A)
 * --------------------------------------------------------
 * Create/Edit modal for alerts. S002-P003 D34 UI remediation.
 * E2E selectors: input[name="title"], .phoenix-modal__save-btn
 */

import { createModal } from '../../../components/shared/PhoenixModal.js';
import sharedServices from '../../../components/core/sharedServices.js';
import { maskedLog } from '../../../utils/maskedLog.js';

const TARGET_TYPES = [
  { value: 'general', label: 'כללי' },
  { value: 'ticker', label: 'טיקר' },
  { value: 'account', label: 'חשבון מסחר' },
  { value: 'trade', label: 'טרייד' },
  { value: 'trade_plan', label: 'תוכנית' }
];

const ALERT_TYPES = ['PRICE', 'VOLUME', 'TECHNICAL', 'NEWS', 'CUSTOM'];

function createAlertFormHTML(data = null) {
  const isEdit = !!(data && data.id);
  const title = (data && data.title != null ? data.title : '') || '';
  const targetType = (data && data.target_type != null ? data.target_type : (data && data.targetType)) || 'general';
  const alertType = (data && data.alert_type != null ? data.alert_type : (data && data.alertType)) || 'PRICE';
  const isActive = (data && (data.is_active != null ? data.is_active : data.isActive)) !== false;
  const message = (data && data.message != null ? data.message : '') || '';

  const targetOpts = TARGET_TYPES.map(t =>
    `<option value="${t.value}" ${targetType === t.value ? 'selected' : ''}>${t.label}</option>`
  ).join('');
  const alertTypeOpts = ALERT_TYPES.map(t =>
    `<option value="${t}" ${alertType === t ? 'selected' : ''}>${t}</option>`
  ).join('');

  return `
    <form id="alertForm" class="phoenix-form">
      <div class="form-group">
        <label for="alertTitle">כותרת <span class="form-label-asterisk">*</span></label>
        <input type="text" id="alertTitle" name="title" maxlength="200" required value="${String(title).replace(/"/g, '&quot;')}" placeholder="התראת מחיר" data-action="save-alert" />
      </div>
      <div class="form-group">
        <label for="alertTargetType">מקושר ל</label>
        <select id="alertTargetType" name="target_type">${targetOpts}</select>
      </div>
      <div class="form-group">
        <label for="alertAlertType">סוג התראה</label>
        <select id="alertAlertType" name="alert_type">${alertTypeOpts}</select>
      </div>
      <div class="form-group">
        <label for="alertMessage">הודעה (אופציונלי)</label>
        <textarea id="alertMessage" name="message" rows="2" placeholder="טקסט להודעה">${String(message).replace(/</g, '&lt;')}</textarea>
      </div>
      ${isEdit ? `
      <div class="form-group">
        <label>
          <input type="checkbox" name="is_active" ${isActive ? 'checked' : ''} />
          פעיל
        </label>
      </div>
      ` : ''}
    </form>
  `;
}

/**
 * Open alerts form modal (create or edit)
 * @param {Object|null} alert - Existing alert (edit) or null (create)
 * @param {Function} onSuccess - Callback after save
 */
export function openAlertsForm(alert, onSuccess) {
  const alertId = alert && (alert.id || alert.external_ulid);
  const isEdit = !!alertId;
  const title = isEdit ? 'עריכת התראה' : 'הוספת התראה';

  const formHTML = createAlertFormHTML(alert);

  createModal({
    title,
    content: formHTML,
    entity: 'alert',
    showSaveButton: true,
    saveButtonText: 'שמירה',
    cancelButtonText: 'לבטל',
    onSave: async function () {
      const form = document.getElementById('alertForm');
      if (!form) return;
      const titleVal = (form.querySelector('[name="title"]') || form.querySelector('#alertTitle'))?.value?.trim();
      if (!titleVal) {
        alert('יש להזין כותרת');
        return;
      }
      const targetTypeVal = form.querySelector('[name="target_type"]')?.value || 'general';
      const alertTypeVal = form.querySelector('[name="alert_type"]')?.value || 'PRICE';
      const messageVal = form.querySelector('[name="message"]')?.value?.trim() || null;
      const isActiveVal = form.querySelector('[name="is_active"]')?.checked ?? true;

      try {
        await sharedServices.init();
        if (isEdit) {
          const payload = { title: titleVal, message: messageVal, is_active: isActiveVal };
          await sharedServices.patch(`/alerts/${alertId}`, payload);
        } else {
          const payload = {
            target_type: targetTypeVal,
            alert_type: alertTypeVal,
            title: titleVal,
            message: messageVal,
            is_active: true
          };
          await sharedServices.post('/alerts', payload);
        }
        document.getElementById('phoenix-modal-backdrop')?.remove();
        if (typeof onSuccess === 'function') onSuccess();
      } catch (e) {
        maskedLog('[Alerts] Save error:', { status: e?.status, message: e?.message });
        alert('שגיאה בשמירה');
      }
    }
  });
}
