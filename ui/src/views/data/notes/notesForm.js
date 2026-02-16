/**
 * Notes Form — D35 (MB3A)
 * --------------------------------------------------------
 * Add/Edit modal with TipTap Rich Text
 * D35 Lock: עד 3 קבצים, 1MB — הגבלה בממשק
 */

import { createModal, closeModal } from '../../../components/shared/PhoenixModal.js';
import sharedServices from '../../../components/core/sharedServices.js';
import { createPhoenixRichTextEditor } from '../../../components/shared/phoenixRichTextEditor.js';
import { maskedLog } from '../../../utils/maskedLog.js';

let richTextInstance = null;

const PARENT_TYPES = [
  { value: 'general', label: 'כללי' },
  { value: 'account', label: 'חשבון' },
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
        <label for="noteTitle">כותרת (אופציונלי)</label>
        <input type="text" id="noteTitle" name="title" maxlength="200" placeholder="כותרת" value="${title}" />
      </div>
      <div class="form-group">
        <label for="noteContent">תוכן <span class="form-label-asterisk">*</span></label>
        <div id="content-editor-toolbar" class="phoenix-rt-toolbar" data-rt-toolbar>
          <button type="button" data-rt-cmd="bold" aria-label="מודגש">B</button>
          <button type="button" data-rt-cmd="italic" aria-label="נטוי">I</button>
          <button type="button" data-rt-cmd="phx-success" aria-label="צבע הצלחה">✓</button>
        </div>
        <div id="content-editor-container" class="phoenix-rt-container"></div>
      </div>
      <div class="form-group form-hint">קבצים מצורפים: עד 3, 1MB לכל קובץ (בתהליך פיתוח)</div>
      <div class="form-actions">
        <button type="submit" class="phoenix-btn phoenix-btn--primary">שמור</button>
        <button type="button" class="phoenix-btn phoenix-btn--secondary js-cancel-note">ביטול</button>
      </div>
    </form>
  `;
}

/**
 * Open Notes form modal
 * @param {string|null} noteId - For edit mode
 */
export async function openNotesForm(noteId = null) {
  let data = null;
  if (noteId) {
    try {
      await sharedServices.init();
      data = await sharedServices.get(`/notes/${noteId}`);
    } catch (err) {
      maskedLog('[Notes Form] Error fetching note:', { status: (err && err.status) });
      alert('שגיאה בטעינת ההערה');
      return;
    }
  }

  createModal({
    title: noteId ? 'עריכת הערה' : 'הוספת הערה חדשה',
    content: createFormHTML(data),
    entity: 'note',
    showSaveButton: false,
    onOpen: function() {},
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

    const formEl = document.getElementById('noteForm');
    if (formEl) formEl.addEventListener('submit', async (e) => {
      e.preventDefault();
      const content = (richTextInstance && richTextInstance.getHTML ? richTextInstance.getHTML() : null) || '';
      const parentType = (document.getElementById('noteParentType') && document.getElementById('noteParentType').value) || 'general';
      const parentId = (document.getElementById('noteParentId') && document.getElementById('noteParentId').value) ? document.getElementById('noteParentId').value.trim() : null;
      const titleEl = document.getElementById('noteTitle');
      const title = (titleEl && titleEl.value) ? titleEl.value.trim() : null;

      if (!content || content === '<p></p>') {
        alert('תוכן חובה');
        return;
      }

      try {
        await sharedServices.init();
        const payload = { content, parentType, parentId: parentId || null, title };
        if (noteId) {
          await sharedServices.put(`/notes/${noteId}`, { content, title });
        } else {
          await sharedServices.post('/notes', payload);
        }
        closeModal();
        if (richTextInstance) { richTextInstance.destroy(); richTextInstance = null; }
        if (window.refreshNotesTable) await window.refreshNotesTable();
      } catch (err) {
        maskedLog('[Notes Form] Save error:', { status: (err && err.status) });
        alert('שגיאה בשמירה');
      }
    });

    const cancelBtn = document.querySelector('.js-cancel-note');
    if (cancelBtn) cancelBtn.addEventListener('click', () => {
      if (richTextInstance) { richTextInstance.destroy(); richTextInstance = null; }
      closeModal();
    });
  }, 100);
}

window.openNotesForm = openNotesForm;
