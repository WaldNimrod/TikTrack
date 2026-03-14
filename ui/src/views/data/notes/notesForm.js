/**
 * Notes Form — D35 (MB3A)
 * --------------------------------------------------------
 * Add/Edit modal with TipTap Rich Text + Attachments (עד 3 קבצים, 1MB)
 */

import {
  createModal,
  closeModal,
} from '../../../components/shared/PhoenixModal.js';
import sharedServices from '../../../components/core/sharedServices.js';
import { createPhoenixRichTextEditor } from '../../../components/shared/phoenixRichTextEditor.js';
import { getPhoenixRichTextToolbarHTML } from '../../../components/shared/phoenixRichTextToolbarConfig.js';
import { loadOptionsForParentType } from '../../../utils/entityOptionLoader.js';
import { maskedLog } from '../../../utils/maskedLog.js';

let richTextInstance = null;
const MAX_ATTACHMENTS = 3;
/** BF-G7-025: 2.5MB per file; coordinate with Team 20 if API limit differs */
const MAX_FILE_BYTES = 2621440; // 2.5MB

/** Phase C: Backend allows trade|trade_plan|ticker|account|datetime — no general */
const PARENT_TYPES = [
  { value: 'ticker', label: 'טיקר' },
  { value: 'account', label: 'חשבון מסחר' },
  { value: 'trade', label: 'טרייד' },
  { value: 'trade_plan', label: 'תוכנית' },
  { value: 'datetime', label: 'תאריך/שעה' },
];

const PARENT_TYPE_LABELS = Object.fromEntries(
  PARENT_TYPES.map((t) => [t.value, t.label]),
);

function createFormHTML(data = null) {
  const isEdit = !!(data && data.id);
  const title = (data && data.title != null ? data.title : '') || '';
  const content = (data && data.content != null ? data.content : '') || '';
  const parentType =
    (data && data.parent_type != null
      ? data.parent_type
      : data && data.parentType) || 'ticker';
  const parentId =
    (data && data.parent_id != null ? data.parent_id : data && data.parentId) ||
    '';
  const parentDt = data && (data.parent_datetime ?? data.parentDatetime);
  const dtForInput = parentDt
    ? typeof parentDt === 'string'
      ? parentDt.slice(0, 16)
      : new Date(parentDt).toISOString().slice(0, 16)
    : '';
  const linkedDisplay =
    parentType === 'datetime' && parentDt
      ? typeof parentDt === 'string'
        ? parentDt
        : new Date(parentDt).toLocaleString('he-IL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })
      : (data &&
          (data.linked_entity_name ??
            data.linked_entity_display ??
            data.linked_display_name)) ||
        (parentId ? `${parentId.slice(0, 8)}…` : '—ללא קישור—');
  const typeLabel = PARENT_TYPE_LABELS[parentType] || parentType;

  const parentOptions = PARENT_TYPES.map(
    (t) =>
      `<option value="${t.value}" ${parentType === t.value ? 'selected' : ''}>${t.label}</option>`,
  ).join('');

  return `
    <form id="noteForm" class="phoenix-form phoenix-form--two-col">
      <div id="noteFormValidationSummary" class="form-validation-summary" role="alert" data-testid="note-form-validation-summary" hidden></div>
      <div class="form-row form-row--two-col">
        <div class="form-group">
          <label for="noteParentType">מקושר ל <span class="form-label-asterisk">*</span></label>
          ${
            isEdit
              ? `<span id="noteParentTypeDisplay" class="form-readonly-value" aria-readonly="true">${typeLabel}${(parentType === 'datetime' ? (parentDt ? ' · ' + String(linkedDisplay).replace(/</g, '&lt;') : '') : parentId ? ' · ' + String(linkedDisplay).replace(/</g, '&lt;') : '') || ' —ללא קישור—'}</span>`
              : `<select id="noteParentType" name="parentType" data-entity-options-trigger>${parentOptions}</select>`
          }
        </div>
        <div class="form-group form-group--parent-entity">
          <label for="noteParentId">ישות / תאריך <span class="form-label-asterisk">*</span></label>
          ${
            isEdit
              ? `<span id="noteParentIdDisplay" class="form-readonly-value" aria-readonly="true">${String(linkedDisplay).replace(/</g, '&lt;') || '—'}</span>`
              : `<div id="noteEntityWrap" class="note-entity-wrap"><select id="noteParentId" name="parentId" class="js-entity-options-select" aria-label="בחירת ישות"><option value="">—בחר—</option></select></div>
          <div id="noteDatetimeWrap" class="note-datetime-wrap" style="display:none">
            <input type="datetime-local" id="noteParentDatetime" name="parent_datetime" aria-label="תאריך ושעה" title="תאריך ושעה" value="${dtForInput}" />
          </div>`
          }
        </div>
      </div>
      <div class="form-group">
        <label for="noteTitle">כותרת <span class="form-label-asterisk">*</span></label>
        <input type="text" id="noteTitle" name="title" maxlength="200" placeholder="אם לא תוזן — גזירה מתוכן ההערה" value="${title}" />
      </div>
      <div class="form-group">
        <label for="noteContent">תוכן <span class="form-label-asterisk">*</span></label>
        ${getPhoenixRichTextToolbarHTML('content-editor-toolbar')}
        <div id="content-editor-container" class="phoenix-rt-editor-wrapper"></div>
      </div>
      <div class="form-group">
        <label>קבצים מצורפים</label>
        <div class="notes-attachments-area">
          <input type="file" id="noteAttachmentInput" accept=".jpg,.jpeg,.png,.webp,.pdf,.xls,.xlsx,.doc,.docx" multiple style="display:none" />
          <div class="notes-attachments-header">
            <span class="form-hint">עד ${MAX_ATTACHMENTS} קבצים, 2.5MB לכל קובץ</span>
            <button type="button" class="notes-upload-trigger phoenix-btn phoenix-btn--secondary js-upload-attachment" title="צרוף קובץ">צרוף קובץ</button>
          </div>
          <div id="noteAttachmentError" class="form-error notes-attachment-error" role="alert" hidden></div>
          <div id="noteAttachmentsList" class="notes-attachments-table" role="table" aria-label="קבצים מצורפים"></div>
        </div>
      </div>
    </form>
  `;
}

/** Attachment state: { existing: [{id, name}], pending: File[], toDelete: string[] } */
let attachmentState = { existing: [], pending: [], toDelete: [] };

function getFileIcon(filename) {
  const ext = (filename || '').split('.').pop().toLowerCase();
  const icons = {
    jpg: '🖼',
    jpeg: '🖼',
    png: '🖼',
    webp: '🖼',
    pdf: '📕',
    xls: '📊',
    xlsx: '📊',
    doc: '📘',
    docx: '📘',
  };
  return icons[ext] || '📄';
}

function renderAttachmentsList() {
  const container = document.getElementById('noteAttachmentsList');
  const uploadBtn = document.querySelector('.js-upload-attachment');
  if (!container || !uploadBtn) return;
  const total =
    attachmentState.existing.length +
    attachmentState.pending.length -
    attachmentState.toDelete.length;
  uploadBtn.disabled = total >= MAX_ATTACHMENTS;
  container.innerHTML = '';
  attachmentState.existing
    .filter((a) => !attachmentState.toDelete.includes(a.id))
    .forEach((att) => {
      const name = (
        att.original_filename ||
        att.originalFilename ||
        att.name ||
        ''
      ).replace(/</g, '&lt;');
      const row = document.createElement('div');
      row.className = 'notes-attachment-row';
      row.innerHTML = `<span class="notes-attachment-icon" aria-hidden="true">${getFileIcon(name)}</span><span class="notes-attachment-name">${name}</span><button type="button" class="notes-attachment-remove" data-attachment-id="${att.id}" aria-label="הסר קובץ" title="הסר"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>`;
      container.appendChild(row);
    });
  attachmentState.pending.forEach((file, idx) => {
    const name = (file.name || '').replace(/</g, '&lt;');
    const row = document.createElement('div');
    row.className = 'notes-attachment-row notes-attachment-pending';
    row.innerHTML = `<span class="notes-attachment-icon" aria-hidden="true">${getFileIcon(name)}</span><span class="notes-attachment-name">${name}</span><button type="button" class="notes-attachment-remove js-remove-pending" data-pending-idx="${idx}" aria-label="הסר קובץ" title="הסר"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>`;
    container.appendChild(row);
  });
}

function initAttachmentHandlers(noteId) {
  const fileInput = document.getElementById('noteAttachmentInput');
  const uploadBtn = document.querySelector('.js-upload-attachment');
  const listEl = document.getElementById('noteAttachmentsList');
  if (!fileInput || !uploadBtn) return;

  uploadBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = '';
    let total =
      attachmentState.existing.length +
      attachmentState.pending.length -
      attachmentState.toDelete.length;
    const errEl = document.getElementById('noteAttachmentError');
    if (errEl) {
      errEl.hidden = true;
      errEl.textContent = '';
    }
    for (const file of files) {
      if (total >= MAX_ATTACHMENTS) {
        if (errEl) {
          errEl.textContent = `מקסימום ${MAX_ATTACHMENTS} קבצים להערה`;
          errEl.hidden = false;
        }
        break;
      }
      if (file.size > MAX_FILE_BYTES) {
        if (errEl) {
          errEl.textContent = `הקובץ ${file.name} חורג מ־2.5MB`;
          errEl.hidden = false;
        }
        continue;
      }
      attachmentState.pending.push(file);
      total++;
    }
    renderAttachmentsList();
  });

  listEl.addEventListener('click', (e) => {
    const delBtn = e.target.closest('.notes-attachment-remove');
    if (!delBtn) return;
    const attId = delBtn.dataset.attachmentId;
    const pendingIdx = delBtn.dataset.pendingIdx;
    if (attId) {
      attachmentState.toDelete.push(attId);
    } else if (pendingIdx != null) {
      attachmentState.pending.splice(parseInt(pendingIdx, 10), 1);
    }
    renderAttachmentsList();
  });
}

/**
 * Open Notes form modal
 * @param {string|null} noteId - For edit mode
 * @param {Object} [preselection] - For create: { parent_type, parent_id } e.g. from user_tickers "הערה" action
 */
export async function openNotesForm(noteId = null, preselection = null) {
  let data =
    preselection && !noteId
      ? {
          parent_type: preselection.parent_type || 'ticker',
          parent_id: preselection.parent_id || '',
        }
      : null;
  attachmentState = { existing: [], pending: [], toDelete: [] };
  if (noteId) {
    try {
      await sharedServices.init();
      const [noteRes, attRes] = await Promise.all([
        sharedServices.get(`/notes/${noteId}`),
        sharedServices.get(`/notes/${noteId}/attachments`).catch(() => []),
      ]);
      data = noteRes && noteRes.data ? noteRes.data : noteRes;
      const attList = Array.isArray(attRes)
        ? attRes
        : (attRes?.data ?? attRes ?? []);
      attachmentState.existing = (Array.isArray(attList) ? attList : []).map(
        (a) => ({
          id: a.id,
          name: a.original_filename ?? a.originalFilename,
          original_filename: a.original_filename ?? a.originalFilename,
        }),
      );
    } catch (err) {
      maskedLog('[Notes Form] Error fetching note:', {
        status: err && err.status,
      });
      createModal({
        title: 'שגיאה',
        content: '<p>שגיאה בטעינת ההערה</p>',
        showSaveButton: false,
        cancelButtonText: 'ביטול',
      });
      return;
    }
  }

  /** גזירת כותרת מהמילים הראשונות של התוכן */
  function deriveTitleFromContent(html, maxLen = 200) {
    if (!html || typeof html !== 'string') return '';
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = (div.textContent || '').replace(/\s+/g, ' ').trim();
    if (!text) return '';
    if (text.length <= maxLen) return text;
    let cut = text.slice(0, maxLen);
    const lastSpace = cut.lastIndexOf(' ');
    if (lastSpace > maxLen * 0.5) cut = cut.slice(0, lastSpace);
    return cut.trim();
  }

  async function performSave() {
    const content =
      (richTextInstance && richTextInstance.getHTML
        ? richTextInstance.getHTML()
        : null) || '';
    const form = document.getElementById('noteForm');
    const parentTypeEl = form?.querySelector('#noteParentType');
    const parentIdEl = form?.querySelector('#noteParentId');
    const parentDatetimeEl = form?.querySelector('[name="parent_datetime"]');
    const parentType = (parentTypeEl?.value || 'ticker').trim();
    const rawParentId = parentIdEl?.value;
    const parentId =
      rawParentId && String(rawParentId).trim()
        ? String(rawParentId).trim()
        : null;
    const parentDatetimeVal = parentDatetimeEl?.value?.trim() || null;
    const titleEl = document.getElementById('noteTitle');
    let title = titleEl && titleEl.value ? titleEl.value.trim() : null;
    if (!title) title = deriveTitleFromContent(content);
    if (!title) title = 'הערה';

    if (!content || content === '<p></p>') {
      createModal({
        title: 'שגיאה',
        content: '<p>תוכן חובה</p>',
        showSaveButton: false,
        cancelButtonText: 'ביטול',
      });
      return;
    }

    // T190-Notes, T50-6: linked entity/datetime חובה בהוספת הערה
    const summaryEl = document.getElementById('noteFormValidationSummary');
    if (!noteId) {
      if (parentType === 'datetime') {
        if (!parentDatetimeVal) {
          if (summaryEl) {
            summaryEl.textContent = 'יש להזין תאריך ושעה.';
            summaryEl.hidden = false;
          } else
            createModal({
              title: 'שגיאה',
              content: '<p>יש להזין תאריך ושעה.</p>',
              showSaveButton: false,
              cancelButtonText: 'ביטול',
            });
          return;
        }
      } else if (!parentId) {
        if (summaryEl) {
          summaryEl.textContent = 'יש לבחור ישות מקושרת.';
          summaryEl.hidden = false;
        } else
          createModal({
            title: 'שגיאה',
            content: '<p>יש לבחור ישות מקושרת.</p>',
            showSaveButton: false,
            cancelButtonText: 'ביטול',
          });
        return;
      }
    }

    try {
      await sharedServices.init();
      let savedNoteId = noteId;
      if (noteId) {
        await sharedServices.put(`/notes/${noteId}`, { content, title });
        for (const attId of attachmentState.toDelete) {
          await sharedServices.delete(`/notes/${noteId}/attachments/${attId}`);
        }
      } else {
        maskedLog('[Notes Form] POST payload:', {
          parent_type: parentType,
          has_parent_id: !!parentId,
          has_parent_datetime: !!parentDatetimeVal,
        });
        const payload = { content, parent_type: parentType, title };
        if (parentType === 'datetime' && parentDatetimeVal) {
          payload.parent_datetime = parentDatetimeVal.includes('T')
            ? parentDatetimeVal + ':00.000Z'
            : parentDatetimeVal + 'T00:00:00.000Z';
        } else if (parentId) {
          payload.parent_id = String(parentId).trim();
        }
        const res = await sharedServices.post('/notes', payload, {
          skipTransform: true,
        });
        const created = res && res.data ? res.data : res;
        savedNoteId = created?.id ?? created?.external_ulid;
      }
      if (savedNoteId && attachmentState.pending.length > 0) {
        const errEl = document.getElementById('noteAttachmentError');
        if (errEl) {
          errEl.hidden = true;
          errEl.textContent = '';
        }
        const toUpload = [...attachmentState.pending];
        attachmentState.pending = [];
        renderAttachmentsList();
        for (const file of toUpload) {
          try {
            const formData = new FormData();
            formData.append('file', file);
            const uploaded = await sharedServices.postFormData(
              `/notes/${savedNoteId}/attachments`,
              formData,
            );
            const att = uploaded && uploaded.data ? uploaded.data : uploaded;
            if (att && (att.id || att.external_ulid)) {
              attachmentState.existing.push({
                id: att.id || att.external_ulid,
                name:
                  att.original_filename || att.originalFilename || file.name,
                original_filename:
                  att.original_filename || att.originalFilename || file.name,
              });
              renderAttachmentsList();
            }
          } catch (upErr) {
            attachmentState.pending.push(file);
            renderAttachmentsList();
            const status = upErr && upErr.status;
            let msg;
            if (status === 413)
              msg = 'הקובץ חורג מ־2.5MB. נסה שוב עם קובץ קטן יותר.';
            else if (status === 415) msg = 'סוג הקובץ לא נתמך.';
            else if (status === 422)
              msg = 'מכסה של 3 קבצים הושלמה. הסר קובץ כדי להוסיף אחר.';
            else
              msg =
                upErr?.message ||
                upErr?.message_i18n ||
                'שגיאה בהעלאת הקובץ. נסה שוב.';
            if (errEl) {
              errEl.textContent = msg;
              errEl.hidden = false;
            }
            maskedLog('[Notes Form] Upload error:', {
              status: upErr?.status,
              message: upErr?.message,
            });
            return;
          }
        }
      }
      closeModal();
      if (richTextInstance) {
        richTextInstance.destroy();
        richTextInstance = null;
      }
      if (window.refreshNotesTable) await window.refreshNotesTable();
    } catch (err) {
      maskedLog('[Notes Form] Save error:', {
        status: err && err.status,
        message: err?.message,
      });
      const status = err && err.status;
      const rawMsg = err?.message_i18n || err?.message || '';
      let msg;
      if (status === 413)
        msg = 'הקובץ חורג מ־2.5MB. ההערה נשמרה, אך העלאת הקובץ נכשלה.';
      else if (status === 415)
        msg = 'סוג הקובץ לא נתמך. ההערה נשמרה, אך העלאת הקובץ נכשלה.';
      else if (status === 422) {
        // T190-Notes: הודעה ברורה למשתמש כש־parent_id חסר
        if (
          typeof rawMsg === 'string' &&
          /parent_id required|parent_id.*required/i.test(rawMsg)
        ) {
          msg =
            'יש לבחור ישות מקושרת מהרשימה (טיקר, חשבון מסחר וכו׳). אם בחרת — נסה לבחור שוב ולשמור.';
        } else {
          msg = rawMsg || 'שגיאה באימות. בדוק את השדות ונסה שוב.';
        }
      } else msg = rawMsg || 'שגיאה בשמירה';
      const escaped = String(msg).replace(/</g, '&lt;').replace(/>/g, '&gt;');
      // 422 = validation (e.g. parent_id required) — show in form validation summary
      const summaryEl = document.getElementById('noteFormValidationSummary');
      if (summaryEl) {
        summaryEl.textContent = msg;
        summaryEl.hidden = false;
        summaryEl.classList.add('form-validation-summary--error');
        summaryEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        // הדגשת שדה "ישות מקושרת" כש־parent_id חסר
        const parentIdSelect = document.getElementById('noteParentId');
        if (
          parentIdSelect &&
          status === 422 &&
          /parent_id required/i.test(String(rawMsg))
        ) {
          parentIdSelect.focus();
          parentIdSelect.classList.add('form-input--error');
          parentIdSelect.addEventListener(
            'change',
            function clearErrorHighlight() {
              parentIdSelect.classList.remove('form-input--error');
              parentIdSelect.removeEventListener('change', clearErrorHighlight);
            },
            { once: true },
          );
        }
      }
      // Also show in attachment area for 413/415; for 422 keep summary primary
      const attachErrEl = document.getElementById('noteAttachmentError');
      if (attachErrEl && (status === 413 || status === 415)) {
        attachErrEl.textContent = msg;
        attachErrEl.hidden = false;
      } else if (!summaryEl) {
        createModal({
          title: 'שגיאה',
          content: `<p>${escaped}</p>`,
          showSaveButton: false,
          cancelButtonText: 'ביטול',
        });
      }
    }
  }

  createModal({
    title: noteId ? 'עריכת הערה' : 'הוספת הערה חדשה',
    content: createFormHTML(data),
    entity: 'note',
    showSaveButton: true,
    saveButtonText: 'שמור',
    cancelButtonText: 'ביטול',
    onSave: performSave,
    onClose: function () {
      if (richTextInstance) {
        richTextInstance.destroy();
        richTextInstance = null;
      }
    },
  });

  setTimeout(async () => {
    const container = document.getElementById('content-editor-container');
    if (container) {
      richTextInstance = createPhoenixRichTextEditor(container, {
        content: (data && data.content != null ? data.content : '') || '',
        placeholder: 'תוכן ההערה (חובה)',
        toolbarId: 'content-editor-toolbar',
      });
    }

    initAttachmentHandlers(noteId);
    renderAttachmentsList();

    const parentTypeSelect = document.getElementById('noteParentType');
    const parentIdSelect = document.getElementById('noteParentId');
    const entityWrap = document.getElementById('noteEntityWrap');
    const datetimeWrap = document.getElementById('noteDatetimeWrap');
    const initialParentType =
      (data && (data.parent_type ?? data.parentType)) || 'ticker';
    function toggleTargetInputs() {
      const pt = parentTypeSelect?.value || 'ticker';
      const isDt = pt === 'datetime';
      if (entityWrap) entityWrap.style.display = isDt ? 'none' : 'block';
      if (datetimeWrap) datetimeWrap.style.display = isDt ? 'block' : 'none';
    }
    if (parentTypeSelect && parentIdSelect) {
      const initialParentId =
        data && (data.parent_id ?? data.parentId)
          ? String(data.parent_id ?? data.parentId)
          : '';
      async function populateEntityOptions() {
        if (!parentIdSelect || !parentTypeSelect) return;
        const pt = parentTypeSelect.value || 'ticker';
        if (pt === 'datetime') {
          toggleTargetInputs();
          return;
        }
        const opts = await loadOptionsForParentType(pt);
        const currentVal = parentIdSelect.value || initialParentId;
        parentIdSelect.innerHTML =
          '<option value="">—בחר ישות—</option>' +
          opts
            .map(
              (o) =>
                `<option value="${String(o.value).replace(/"/g, '&quot;')}" ${String(o.value) === currentVal ? 'selected' : ''}>${String(o.label || o.value).replace(/</g, '&lt;')}</option>`,
            )
            .join('');
        if (currentVal && !opts.some((o) => String(o.value) === currentVal)) {
          const opt = document.createElement('option');
          opt.value = currentVal;
          opt.textContent = `${currentVal.slice(0, 8)}… (נוכחי)`;
          opt.selected = true;
          parentIdSelect.insertBefore(
            opt,
            parentIdSelect.firstChild.nextSibling,
          );
        }
        toggleTargetInputs();
      }
      parentTypeSelect.addEventListener('change', populateEntityOptions);
      toggleTargetInputs();
      await populateEntityOptions();
    }

    const formEl = document.getElementById('noteForm');
    if (formEl)
      formEl.addEventListener('submit', (e) => {
        e.preventDefault();
        performSave();
      });
  }, 100);
}

window.openNotesForm = openNotesForm;
