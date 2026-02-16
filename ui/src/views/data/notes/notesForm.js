/**
 * Notes Form — D35 (MB3A)
 * --------------------------------------------------------
 * Add/Edit modal with TipTap Rich Text + Attachments (עד 3 קבצים, 1MB)
 */

import { createModal, closeModal } from '../../../components/shared/PhoenixModal.js';
import sharedServices from '../../../components/core/sharedServices.js';
import { createPhoenixRichTextEditor } from '../../../components/shared/phoenixRichTextEditor.js';
import { getPhoenixRichTextToolbarHTML } from '../../../components/shared/phoenixRichTextToolbarConfig.js';
import { maskedLog } from '../../../utils/maskedLog.js';

let richTextInstance = null;
const MAX_ATTACHMENTS = 3;
const MAX_FILE_BYTES = 1048576; // 1MB

const PARENT_TYPES = [
  { value: 'general', label: 'כללי' },
  { value: 'account', label: 'חשבון מסחר' },
  { value: 'trade', label: 'טרייד' },
  { value: 'trade_plan', label: 'תוכנית' },
  { value: 'ticker', label: 'טיקר' }
];

function createFormHTML(data = null) {
  const isEdit = !!(data && data.id);
  const title = (data && data.title != null ? data.title : '') || '';
  const content = (data && data.content != null ? data.content : '') || '';
  const parentType = (data && data.parent_type != null ? data.parent_type : (data && data.parentType)) || 'general';
  const parentId = (data && data.parent_id != null ? data.parent_id : (data && data.parentId)) || '';

  const parentOptions = PARENT_TYPES.map(t => `<option value="${t.value}" ${parentType === t.value ? 'selected' : ''}>${t.label}</option>`).join('');

  return `
    <form id="noteForm" class="phoenix-form phoenix-form--two-col">
      <div class="form-group">
        <label for="noteParentType">סוג ישות מקושרת</label>
        <select id="noteParentType" name="parentType">${parentOptions}</select>
      </div>
      <div class="form-group">
        <label for="noteParentId">מזהה ישות (אופציונלי)</label>
        <input type="text" id="noteParentId" name="parentId" placeholder="UUID" value="${parentId}" />
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
            <span class="form-hint">עד ${MAX_ATTACHMENTS} קבצים, 1MB לכל קובץ</span>
            <button type="button" class="notes-upload-trigger phoenix-btn phoenix-btn--secondary js-upload-attachment" title="צרוף קובץ">צרוף קובץ</button>
          </div>
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
  const icons = { jpg: '🖼', jpeg: '🖼', png: '🖼', webp: '🖼', pdf: '📕', xls: '📊', xlsx: '📊', doc: '📘', docx: '📘' };
  return icons[ext] || '📄';
}

function renderAttachmentsList() {
  const container = document.getElementById('noteAttachmentsList');
  const uploadBtn = document.querySelector('.js-upload-attachment');
  if (!container || !uploadBtn) return;
  const total = attachmentState.existing.length + attachmentState.pending.length - attachmentState.toDelete.length;
  uploadBtn.disabled = total >= MAX_ATTACHMENTS;
  container.innerHTML = '';
  attachmentState.existing.filter(a => !attachmentState.toDelete.includes(a.id)).forEach(att => {
    const name = (att.original_filename || att.originalFilename || att.name || '').replace(/</g, '&lt;');
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
    const total = attachmentState.existing.length + attachmentState.pending.length - attachmentState.toDelete.length;
    for (const file of files) {
      if (total >= MAX_ATTACHMENTS) {
        alert(`מקסימום ${MAX_ATTACHMENTS} קבצים להערה`);
        break;
      }
      if (file.size > MAX_FILE_BYTES) {
        alert(`הקובץ ${file.name} חורג מ־1MB`);
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
 */
export async function openNotesForm(noteId = null) {
  let data = null;
  attachmentState = { existing: [], pending: [], toDelete: [] };
  if (noteId) {
    try {
      await sharedServices.init();
      const [noteRes, attRes] = await Promise.all([
        sharedServices.get(`/notes/${noteId}`),
        sharedServices.get(`/notes/${noteId}/attachments`).catch(() => [])
      ]);
      data = (noteRes && noteRes.data) ? noteRes.data : noteRes;
      const attList = Array.isArray(attRes) ? attRes : (attRes?.data ?? attRes ?? []);
      attachmentState.existing = (Array.isArray(attList) ? attList : []).map(a => ({
        id: a.id,
        name: a.original_filename ?? a.originalFilename,
        original_filename: a.original_filename ?? a.originalFilename
      }));
    } catch (err) {
      maskedLog('[Notes Form] Error fetching note:', { status: (err && err.status) });
      alert('שגיאה בטעינת ההערה');
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
    const content = (richTextInstance && richTextInstance.getHTML ? richTextInstance.getHTML() : null) || '';
    const parentType = (document.getElementById('noteParentType') && document.getElementById('noteParentType').value) || 'general';
    const parentId = (document.getElementById('noteParentId') && document.getElementById('noteParentId').value) ? document.getElementById('noteParentId').value.trim() : null;
    const titleEl = document.getElementById('noteTitle');
    let title = (titleEl && titleEl.value) ? titleEl.value.trim() : null;
    if (!title) title = deriveTitleFromContent(content);
    if (!title) title = 'הערה';

    if (!content || content === '<p></p>') {
      alert('תוכן חובה');
      return;
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
        const res = await sharedServices.post('/notes', { content, parentType, parentId: parentId || null, title });
        const created = (res && res.data) ? res.data : res;
        savedNoteId = created?.id ?? created?.external_ulid;
      }
      if (savedNoteId && attachmentState.pending.length > 0) {
        for (const file of attachmentState.pending) {
          const formData = new FormData();
          formData.append('file', file);
          await sharedServices.postFormData(`/notes/${savedNoteId}/attachments`, formData);
        }
      }
      closeModal();
      if (richTextInstance) { richTextInstance.destroy(); richTextInstance = null; }
      if (window.refreshNotesTable) await window.refreshNotesTable();
    } catch (err) {
      maskedLog('[Notes Form] Save error:', { status: (err && err.status) });
      const status = err && err.status;
      let msg = err?.message_i18n || err?.message;
      if (!msg || typeof msg !== 'string') {
        if (status === 413) msg = 'הקובץ חורג מ־1MB. ההערה נשמרה, אך העלאת הקובץ נכשלה.';
        else if (status === 415) msg = 'סוג הקובץ לא נתמך. ההערה נשמרה, אך העלאת הקובץ נכשלה.';
        else if (status === 422) msg = 'מכסה של 3 קבצים להערה הושלמה. הסר קובץ כדי להוסיף אחר.';
        else msg = 'שגיאה בשמירה';
      }
      alert(msg);
    }
  }

  createModal({
    title: noteId ? 'עריכת הערה' : 'הוספת הערה חדשה',
    content: createFormHTML(data),
    entity: 'note',
    showSaveButton: true,
    saveButtonText: 'שמירה',
    onSave: performSave,
    onClose: function() {
      if (richTextInstance) {
        richTextInstance.destroy();
        richTextInstance = null;
      }
    }
  });

  setTimeout(() => {
    const container = document.getElementById('content-editor-container');
    if (container) {
      richTextInstance = createPhoenixRichTextEditor(container, {
        content: (data && data.content != null ? data.content : '') || '',
        placeholder: 'תוכן ההערה (חובה)',
        toolbarId: 'content-editor-toolbar'
      });
    }

    initAttachmentHandlers(noteId);
    renderAttachmentsList();

    const formEl = document.getElementById('noteForm');
    if (formEl) formEl.addEventListener('submit', (e) => {
      e.preventDefault();
      performSave();
    });
  }, 100);
}

window.openNotesForm = openNotesForm;
