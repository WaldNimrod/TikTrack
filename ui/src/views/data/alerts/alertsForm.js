/**
 * Alerts Form — D34 (MB3A) Phase C
 * --------------------------------------------------------
 * Create/Edit modal for alerts. Condition builder: 7 fields × 7 operators.
 * Backend contract: api/schemas/alert_conditions.py
 */

import { createModal } from '../../../components/shared/PhoenixModal.js';
import sharedServices from '../../../components/core/sharedServices.js';
import { createPhoenixRichTextEditor } from '../../../components/shared/phoenixRichTextEditor.js';
import { getPhoenixRichTextToolbarHTML } from '../../../components/shared/phoenixRichTextToolbarConfig.js';
import { loadOptionsForParentType } from '../../../utils/entityOptionLoader.js';
import { maskedLog } from '../../../utils/maskedLog.js';

let alertRichTextInstance = null;

/** BF-G7-014: general removed per G7R Stream1; backend VALID_TARGET_TYPES */
const TARGET_TYPES = [
  { value: 'ticker', label: 'טיקר' },
  { value: 'account', label: 'חשבון מסחר' },
  { value: 'trade', label: 'טרייד' },
  { value: 'trade_plan', label: 'תוכנית' },
  { value: 'datetime', label: 'תאריך/שעה' }
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
  const targetType = (data && data.target_type != null ? data.target_type : (data && data.targetType)) || 'ticker';
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
  /** BF-G7-013: Condition required per backend AlertCreate */
  const fieldOpts = CONDITION_FIELDS.map(f =>
    `<option value="${f.value}" ${conditionField === f.value ? 'selected' : ''}>${f.label}</option>`
  ).join('');
  const operatorOpts = CONDITION_OPERATORS.map(o =>
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
        <label for="alertTargetType">מקושר ל <span class="form-label-asterisk">*</span></label>
        <select id="alertTargetType" name="target_type">${targetOpts}</select>
        <div id="alertEntityWrap" class="alert-entity-wrap">
          <select id="alertTargetId" name="target_id" class="js-alert-entity-select" aria-label="בחירת ישות מקושרת"><option value="">—בחר—</option></select>
        </div>
        <div id="alertDatetimeWrap" class="alert-datetime-wrap" style="display:none">
          <input type="datetime-local" id="alertTargetDatetime" name="target_datetime" aria-label="תאריך ושעה" />
        </div>
      </div>
      <div class="form-group">
        <label for="alertAlertType">סוג התראה</label>
        ${isEdit
          ? `<span id="alertAlertType" class="form-readonly-value" aria-readonly="true">${esc(alertType)}</span>`
          : `<select id="alertAlertType" name="alert_type">${alertTypeOpts}</select>`
        }
      </div>
      <div class="form-group form-group--condition-builder">
        <label>תנאי <span class="form-label-asterisk">*</span></label>
        <div class="condition-builder-row" role="group" aria-label="בניית תנאי">
          <select id="conditionField" name="condition_field" aria-label="שדה תנאי">${fieldOpts}</select>
          <select id="conditionOperator" name="condition_operator" aria-label="אופרטור">${operatorOpts}</select>
          <input type="number" id="conditionValue" name="condition_value" step="any" placeholder="ערך" value="${String(condValStr).replace(/"/g, '&quot;')}" aria-label="ערך תנאי" />
        </div>
      </div>
      <div class="form-group">
        <label for="alertMessage">הודעה (אופציונלי)</label>
        ${getPhoenixRichTextToolbarHTML('alert-message-toolbar')}
        <div id="alertMessageEditor" class="phoenix-rt-editor-wrapper"></div>
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
    onClose: function () {
      if (alertRichTextInstance) { alertRichTextInstance.destroy(); alertRichTextInstance = null; }
    },
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
      const targetTypeVal = form.querySelector('[name="target_type"]')?.value || 'ticker';
      const targetIdVal = (form.querySelector('[name="target_id"]') || form.querySelector('#alertTargetId'))?.value?.trim() || null;
      const targetDtVal = form.querySelector('[name="target_datetime"]')?.value || null;
      const alertTypeVal = form.querySelector('[name="alert_type"]')?.value || 'PRICE';
      let messageVal = (alertRichTextInstance && alertRichTextInstance.getHTML) ? alertRichTextInstance.getHTML() : (form.querySelector('[name="message"]') || form.querySelector('#alertMessage'))?.value?.trim() || null;
      if (messageVal === '<p></p>' || messageVal === '') messageVal = null;
      const isActiveVal = form.querySelector('[name="is_active"]')?.checked ?? true;
      const condField = form.querySelector('[name="condition_field"]')?.value?.trim() || null;
      const condOp = form.querySelector('[name="condition_operator"]')?.value?.trim() || null;
      const condValRaw = form.querySelector('[name="condition_value"]')?.value;
      const condVal = condValRaw !== '' && condValRaw != null && !Number.isNaN(parseFloat(condValRaw))
        ? parseFloat(condValRaw) : null;

      // BF-G7-013: Condition required — all three must be set
      if (!condField || !condOp || condVal == null || condVal === '') {
        createModal({
          title: 'שגיאה',
          content: '<p>תנאי חובה: יש למלא שדה תנאי, אופרטור וערך.</p>',
          showSaveButton: false,
          cancelButtonText: 'ביטול'
        });
        return;
      }

      // BF-G7-017: Linked entity required when target_type is entity (not datetime)
      if (targetTypeVal !== 'datetime') {
        const entityId = targetIdVal || form.querySelector('#alertTargetId')?.value?.trim();
        if (!entityId) {
          createModal({
            title: 'שגיאה',
            content: '<p>יש לבחור ישות מקושרת.</p>',
            showSaveButton: false,
            cancelButtonText: 'ביטול'
          });
          return;
        }
      }
      if (targetTypeVal === 'datetime' && !targetDtVal) {
        createModal({
          title: 'שגיאה',
          content: '<p>יש להזין תאריך ושעה.</p>',
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
          if (targetTypeVal && targetTypeVal !== 'datetime' && targetIdVal) {
            if (targetTypeVal === 'ticker') payload.ticker_id = targetIdVal;
            else payload.target_id = targetIdVal;
            payload.target_type = targetTypeVal;
          }
          if (targetTypeVal === 'datetime' && targetDtVal) payload.target_datetime = targetDtVal;
          await sharedServices.patch(`/alerts/${alertId}`, payload);
        } else {
          const payload = {
            target_type: targetTypeVal,
            alert_type: alertTypeVal,
            title: titleVal,
            message: messageVal,
            is_active: true
          };
          if (targetTypeVal === 'datetime' && targetDtVal) payload.target_datetime = targetDtVal;
          else if (targetTypeVal === 'ticker' && targetIdVal) payload.ticker_id = targetIdVal;
          else if (targetIdVal) payload.target_id = targetIdVal;
          if (condField) payload.condition_field = condField;
          if (condOp) payload.condition_operator = condOp;
          if (condVal != null) payload.condition_value = condVal;
          await sharedServices.post('/alerts', payload);
        }
        document.getElementById('phoenix-modal-backdrop')?.remove();
        if (typeof onSuccess === 'function') onSuccess();
      } catch (e) {
        maskedLog('[Alerts] Save error:', { status: e?.status, message: e?.message });
        const msg = String(e?.message ?? e?.detail ?? 'שגיאה בשמירה').trim();
        createModal({
          title: 'שגיאה',
          content: `<p>${msg.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`,
          showSaveButton: false,
          cancelButtonText: 'ביטול'
        });
      }
    }
  });

  setTimeout(async () => {
    const editorContainer = document.getElementById('alertMessageEditor');
    if (editorContainer) {
      alertRichTextInstance = createPhoenixRichTextEditor(editorContainer, {
        content: (alert && alert.message) ? String(alert.message) : '',
        placeholder: 'טקסט להודעה',
        toolbarId: 'alert-message-toolbar'
      });
    }

    const typeSelect = document.getElementById('alertTargetType');
    const idSelect = document.getElementById('alertTargetId');
    const entityWrap = document.getElementById('alertEntityWrap');
    const datetimeWrap = document.getElementById('alertDatetimeWrap');
    const initialTargetId = (alert && (alert.target_id ?? alert.targetId ?? alert.ticker_id ?? alert.tickerId)) ? String(alert.target_id ?? alert.targetId ?? alert.ticker_id ?? alert.tickerId) : '';

    function toggleTargetInputs() {
      const t = typeSelect?.value || 'ticker';
      const isDt = t === 'datetime';
      if (entityWrap) entityWrap.style.display = isDt ? 'none' : 'block';
      if (datetimeWrap) datetimeWrap.style.display = isDt ? 'block' : 'none';
    }
    async function populateEntityOptions() {
      if (!idSelect || !typeSelect) return;
      const t = typeSelect.value || 'ticker';
      if (t === 'datetime') return;
      const opts = await loadOptionsForParentType(t);
      const currentVal = idSelect.value || initialTargetId;
      idSelect.innerHTML = '<option value="">—בחר—</option>' +
        opts.map(o => `<option value="${String(o.value).replace(/"/g, '&quot;')}" ${String(o.value) === currentVal ? 'selected' : ''}>${String(o.label || o.value).replace(/</g, '&lt;')}</option>`).join('');
      if (currentVal && !opts.some(o => String(o.value) === currentVal)) {
        const opt = document.createElement('option');
        opt.value = currentVal;
        opt.textContent = `${currentVal.slice(0, 8)}… (נוכחי)`;
        opt.selected = true;
        idSelect.insertBefore(opt, idSelect.firstChild.nextSibling);
      }
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', () => {
        toggleTargetInputs();
        populateEntityOptions();
      });
      toggleTargetInputs();
      await populateEntityOptions();
    }
  }, 100);
}
