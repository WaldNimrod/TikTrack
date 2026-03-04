/**
 * Alerts Form — D34 (MB3A) Phase C
 * --------------------------------------------------------
 * Create/Edit modal for alerts. Condition builder: 7 fields × 7 operators.
 * Backend contract: api/schemas/alert_conditions.py
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

/** Phase C: 7 condition fields — backend CONDITION_FIELDS */
const CONDITION_FIELDS = [
  { value: 'price', label: 'מחיר' },
  { value: 'open_price', label: 'מחיר פתיחה' },
  { value: 'high_price', label: 'מחיר גבוה' },
  { value: 'low_price', label: 'מחיר נמוך' },
  { value: 'close_price', label: 'מחיר סגירה' },
  { value: 'volume', label: 'נפח' },
  { value: 'market_cap', label: 'שווי שוק' }
];

/** Phase C: 7 operators including crosses_above, crosses_below — backend CONDITION_OPERATORS */
const CONDITION_OPERATORS = [
  { value: '>', label: '>' },
  { value: '<', label: '<' },
  { value: '>=', label: '>=' },
  { value: '<=', label: '<=' },
  { value: '=', label: '=' },
  { value: 'crosses_above', label: 'חוצה כלפי מעלה' },
  { value: 'crosses_below', label: 'חוצה כלפי מטה' }
];

function createAlertFormHTML(data = null) {
  const alertId = data && (data.id || data.external_ulid);
  const isEdit = !!alertId;
  const title = (data && data.title != null ? data.title : '') || '';
  const targetType = (data && data.target_type != null ? data.target_type : (data && data.targetType)) || 'general';
  const alertType = (data && data.alert_type != null ? data.alert_type : (data && data.alertType)) || 'PRICE';
  const conditionField = (data && data.condition_field != null ? data.condition_field : (data && data.conditionField)) || '';
  const conditionOperator = (data && data.condition_operator != null ? data.condition_operator : (data && data.conditionOperator)) || '';
  const conditionValue = (data && data.condition_value != null ? data.condition_value : (data && data.conditionValue)) ?? '';
  const isActive = (data && (data.is_active != null ? data.is_active : data.isActive)) !== false;
  const message = (data && data.message != null ? data.message : '') || '';

  const targetOpts = TARGET_TYPES.map(t =>
    `<option value="${t.value}" ${targetType === t.value ? 'selected' : ''}>${t.label}</option>`
  ).join('');
  const alertTypeOpts = ALERT_TYPES.map(t =>
    `<option value="${t}" ${alertType === t ? 'selected' : ''}>${t}</option>`
  ).join('');
  // B-02: In edit mode, target_type and alert_type are non-editable (API does not persist them)
  const targetLabel = (TARGET_TYPES.find(t => t.value === targetType) || { label: targetType }).label;
  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  const fieldOpts = [{ value: '', label: '—ללא תנאי—' }, ...CONDITION_FIELDS].map(f =>
    `<option value="${f.value}" ${conditionField === f.value ? 'selected' : ''}>${f.label}</option>`
  ).join('');
  const operatorOpts = [{ value: '', label: '—' }, ...CONDITION_OPERATORS].map(o =>
    `<option value="${o.value}" ${conditionOperator === o.value ? 'selected' : ''}>${o.label}</option>`
  ).join('');

  const condValStr = conditionValue === '' || conditionValue == null ? '' : String(conditionValue);

  return `
    <form id="alertForm" class="phoenix-form">
      <div class="form-group">
        <label for="alertTitle">כותרת <span class="form-label-asterisk">*</span></label>
        <input type="text" id="alertTitle" name="title" maxlength="200" required value="${String(title).replace(/"/g, '&quot;')}" placeholder="התראת מחיר" data-action="save-alert" />
      </div>
      <div class="form-group">
        <label for="alertTargetType">מקושר ל</label>
        ${isEdit
          ? `<span id="alertTargetType" class="form-readonly-value" aria-readonly="true">${esc(targetLabel)}</span>`
          : `<select id="alertTargetType" name="target_type">${targetOpts}</select>`
        }
      </div>
      <div class="form-group">
        <label for="alertAlertType">סוג התראה</label>
        ${isEdit
          ? `<span id="alertAlertType" class="form-readonly-value" aria-readonly="true">${esc(alertType)}</span>`
          : `<select id="alertAlertType" name="alert_type">${alertTypeOpts}</select>`
        }
      </div>
      <div class="form-group form-group--condition-builder">
        <label>תנאי (אופציונלי)</label>
        <div class="condition-builder-row" role="group" aria-label="בניית תנאי">
          <select id="conditionField" name="condition_field" aria-label="שדה תנאי">${fieldOpts}</select>
          <select id="conditionOperator" name="condition_operator" aria-label="אופרטור">${operatorOpts}</select>
          <input type="number" id="conditionValue" name="condition_value" step="any" placeholder="ערך" value="${String(condValStr).replace(/"/g, '&quot;')}" aria-label="ערך תנאי" />
        </div>
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
    saveButtonText: 'שמור',
    cancelButtonText: 'ביטול',
    onSave: async function () {
      const form = document.getElementById('alertForm');
      if (!form) return;
      const titleVal = (form.querySelector('[name="title"]') || form.querySelector('#alertTitle'))?.value?.trim();
      if (!titleVal) {
        createModal({
          title: 'שגיאה',
          content: '<p>יש להזין כותרת</p>',
          showSaveButton: false,
          cancelButtonText: 'ביטול'
        });
        return;
      }
      const targetTypeVal = form.querySelector('[name="target_type"]')?.value || 'general';
      const alertTypeVal = form.querySelector('[name="alert_type"]')?.value || 'PRICE';
      const messageVal = form.querySelector('[name="message"]')?.value?.trim() || null;
      const isActiveVal = form.querySelector('[name="is_active"]')?.checked ?? true;
      const condField = form.querySelector('[name="condition_field"]')?.value?.trim() || null;
      const condOp = form.querySelector('[name="condition_operator"]')?.value?.trim() || null;
      const condValRaw = form.querySelector('[name="condition_value"]')?.value;
      const condVal = condValRaw !== '' && condValRaw != null && !Number.isNaN(parseFloat(condValRaw))
        ? parseFloat(condValRaw) : null;

      // G7R Batch1: All-or-none validation — field, operator, value must all be set or all empty
      const condSet = [condField, condOp, condVal != null && condVal !== ''];
      const anySet = condSet.some(Boolean);
      const allSet = condSet[0] && condSet[1] && condSet[2];
      if (anySet && !allSet) {
        createModal({
          title: 'שגיאה',
          content: '<p>תנאי: יש למלא שדה תנאי, אופרטור וערך יחד — או להשאיר את כולם ריקים.</p>',
          showSaveButton: false,
          cancelButtonText: 'ביטול'
        });
        return;
      }

      try {
        await sharedServices.init();
        if (isEdit) {
          const payload = { title: titleVal, message: messageVal, is_active: isActiveVal };
          if (condField) payload.condition_field = condField;
          if (condOp) payload.condition_operator = condOp;
          if (condVal != null) payload.condition_value = condVal;
          await sharedServices.patch(`/alerts/${alertId}`, payload);
        } else {
          const payload = {
            target_type: targetTypeVal,
            alert_type: alertTypeVal,
            title: titleVal,
            message: messageVal,
            is_active: true
          };
          if (condField) payload.condition_field = condField;
          if (condOp) payload.condition_operator = condOp;
          if (condVal != null) payload.condition_value = condVal;
          await sharedServices.post('/alerts', payload);
        }
        document.getElementById('phoenix-modal-backdrop')?.remove();
        if (typeof onSuccess === 'function') onSuccess();
      } catch (e) {
        maskedLog('[Alerts] Save error:', { status: e?.status, message: e?.message });
        createModal({
          title: 'שגיאה',
          content: '<p>שגיאה בשמירה</p>',
          showSaveButton: false,
          cancelButtonText: 'ביטול'
        });
      }
    }
  });
}
