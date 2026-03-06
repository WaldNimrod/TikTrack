/**
 * Notes Table Init — D35 (MB3A)
 * --------------------------------------------------------
 * טעינה, רינדור וניהול טבלת הערות
 * מקור: notes_BLUEPRINT, TEAM_40_TO_TEAM_30_NOTES_FILTER_BUTTONS_CLASSES_RESPONSE
 * Per: PhoenixTableSortManager, pagination pattern (brokersFees, userTicker)
 */

import { fetchNotes, loadNotesData } from './notesDataLoader.js';
import { createModal } from '../../../components/shared/PhoenixModal.js';
import { maskedLog } from '../../../utils/maskedLog.js';

/** State for pagination/sort — same pattern as brokersFees, userTicker */
let tableData = { data: [], total: 0 };
let currentPage = 1;
let currentPageSize = 25;
let currentSortKey = null;
let currentSortDir = 'asc';

/** Phase C: general removed — backend allows trade|trade_plan|ticker|account only */
const PARENT_TYPE_LABELS = {
  all: 'הכל',
  account: 'חשבון מסחר',
  trade: 'טרייד',
  trade_plan: 'תוכנית',
  ticker: 'טיקר'
};

/** G7R Batch1: Entity icon paths for linked entity display (§3D — icon + name) */
const ENTITY_ICON_MAP = { ticker: '/images/icons/entities/tickers.svg', account: '/images/icons/entities/trading_accounts.svg', trade: '/images/icons/entities/trades.svg', trade_plan: '/images/icons/entities/trade_plans.svg' };

/** Build linked entity display: icon + resolved name (§3D — linked_entity_display from API when available) */
function formatLinkedEntityDisplay(note) {
  const parentType = (note.parent_type != null ? note.parent_type : note.parentType) || '';
  const parentId = (note.parent_id != null ? note.parent_id : note.parentId) || '';
  const resolvedName = note.linked_entity_display ?? note.linked_entity_name ?? '';
  const typeLabel = PARENT_TYPE_LABELS[parentType] || parentType || '';
  const displayName = resolvedName || (parentId ? typeLabel + ' ' + String(parentId).slice(0, 8) + '…' : typeLabel || '—');
  const iconPath = parentType ? ENTITY_ICON_MAP[parentType] : null;
  if (!parentType && !parentId) return '<span class="linked-object-badge">—ללא קישור—</span>';
  const iconHtml = iconPath ? `<img src="${iconPath}" alt="" class="linked-entity-icon" width="16" height="16" aria-hidden="true" />` : '';
  return `<span class="linked-object-badge entity-${parentType}" title="${(typeLabel + (displayName ? ' ' + displayName : '')).replace(/"/g, '&quot;')}">${iconHtml} ${displayName}</span>`;
}

/**
 * Format date for display
 */
function formatDate(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

/**
 * Get format icon by content_type / extension
 */
function getFormatIcon(contentType, filename) {
  const ext = (filename || '').split('.').pop() || '';
  const type = (contentType || '').toLowerCase();
  if (type.includes('pdf') || ext === 'pdf') return '📄';
  if (type.includes('image') || ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return '🖼';
  if (type.includes('sheet') || type.includes('excel') || ['xls', 'xlsx'].includes(ext)) return '📊';
  if (type.includes('word') || type.includes('document') || ['doc', 'docx'].includes(ext)) return '📝';
  return '📎';
}

/**
 * Render attachment cell: icon + count or first filename (BF-G7-023)
 * When API returns attachment_count or attachments array, show indicator
 */
function getAttachmentDisplay(note) {
  const count = note.attachment_count ?? (note.attachments && Array.isArray(note.attachments) ? note.attachments.length : 0);
  if (!count) return '—';
  const att = note.attachments && note.attachments[0];
  const name = att && (att.original_filename || att.originalFilename || att.filename);
  const contentType = att && (att.content_type || att.contentType);
  const icon = getFormatIcon(contentType, name);
  const label = count > 1 ? `📎 ${count} קבצים` : (name ? `${icon} ${(name.length > 18 ? name.slice(0, 15) + '…' : name).replace(/"/g, '&quot;')}` : `📎 1`);
  return `<span class="attachment-cell attachment-indicator" title="${count > 1 ? count + ' קבצים מצורפים' : (name || '').replace(/"/g, '&quot;')}">${label}</span>`;
}

/**
 * Strip HTML for truncated preview
 */
function stripHtml(html) {
  if (!html || typeof html !== 'string') return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return (tmp.textContent || '').trim().slice(0, 80) || '';
}

/**
 * Render summary section
 */
function renderSummary(summary) {
  const el = (id) => document.getElementById(id);
  if (!el('totalNotes')) return;
  const s = summary || {};
  el('totalNotes').textContent = s.totalNotes != null ? s.totalNotes : 0;
  el('recentNotes').textContent = s.recentNotes != null ? s.recentNotes : 0;
  el('totalLinks').textContent = s.totalAttachments != null ? s.totalAttachments : 0;
  el('pinnedNotes').textContent = s.pinnedNotes != null ? s.pinnedNotes : 0;
  const byType = s.notesByParentType || {};
  el('notesByTicker').textContent = byType.ticker != null ? byType.ticker : 0;
  el('notesByTrade').textContent = byType.trade != null ? byType.trade : 0;
}

/**
 * Render note row
 */
function renderNoteRow(note) {
  const parentType = (note.parent_type != null ? note.parent_type : note.parentType) || 'general';
  const contentPreview = stripHtml(note.content != null ? note.content : '') || (note.title != null ? note.title : '—');
  const created = formatDate(note.created_at != null ? note.created_at : note.createdAt);
  const updated = formatDate(note.updated_at != null ? note.updated_at : note.updatedAt);
  const id = note.id;
  const linkedEntityHtml = formatLinkedEntityDisplay(note);

  return `
    <tr class="phoenix-table__row" data-note-id="${id}" role="row">
      <td class="phoenix-table__cell col-linked-object" data-field="parent_type">${linkedEntityHtml}</td>
      <td class="phoenix-table__cell col-content" data-field="content">${contentPreview}</td>
      <td class="phoenix-table__cell col-attachment" data-field="attachment">${getAttachmentDisplay(note)}</td>
      <td class="phoenix-table__cell col-created phoenix-table__cell--date">${created}</td>
      <td class="phoenix-table__cell col-updated phoenix-table__cell--date">${updated}</td>
      <td class="phoenix-table__cell col-actions phoenix-table__cell--actions">
        <div class="table-actions-tooltip">
          <button class="table-actions-trigger" aria-label="פעולות" title="פעולות">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
          <div class="table-actions-menu">
            <button class="table-action-btn js-action-view" aria-label="הצג פרטי הערה" title="הצג פרטי הערה" data-note-id="${id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button class="table-action-btn js-action-edit" aria-label="ערוך הערה" title="ערוך הערה" data-note-id="${id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="table-action-btn js-action-delete" aria-label="מחק הערה" title="מחק הערה" data-note-id="${id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      </td>
    </tr>
  `;
}

const SORT_KEY_MAP = { created_at: 'createdAt', updated_at: 'updatedAt', parent_type: 'parentType' };

/**
 * Sort notes array by key
 */
function sortNotesData(arr, sortKey, sortDir) {
  if (!sortKey || !arr.length) return arr;
  const key = SORT_KEY_MAP[sortKey] || sortKey;
  const dir = sortDir === 'desc' ? -1 : 1;
  return [...arr].sort((a, b) => {
    let va = a[sortKey] != null ? a[sortKey] : (a[key] != null ? a[key] : '');
    let vb = b[sortKey] != null ? b[sortKey] : (b[key] != null ? b[key] : '');
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return -1 * dir;
    if (va > vb) return 1 * dir;
    return 0;
  });
}

/**
 * Update pagination UI — MANDATORY: always show correct count
 * Uses PhoenixTablePagination (shared object) — אובייקט קבוע לכל הטבלאות
 */
function updatePagination() {
  const P = window.PhoenixTablePagination;
  const dataLen = (tableData.data || []).length;
  const state = P
    ? P.computeState(tableData.total, currentPage, currentPageSize, dataLen)
    : (() => {
        const t = Math.max(tableData.total || 0, dataLen);
        const tp = Math.max(1, Math.ceil(t / currentPageSize));
        return {
          start: t === 0 ? 0 : (currentPage - 1) * currentPageSize + 1,
          end: Math.min(currentPage * currentPageSize, t),
          total: t,
          totalPages: tp
        };
      })();
  const { start, end, total, totalPages } = state;

  const infoEl = document.getElementById('notesPaginationInfo');
  if (infoEl) infoEl.textContent = P ? P.formatInfoText(start, end, total) : `מציג ${start}-${end} מתוך ${total} רשומות`;

  const prevBtn = document.getElementById('notesPrevPageBtn');
  const nextBtn = document.getElementById('notesNextPageBtn');
  if (prevBtn) prevBtn.disabled = currentPage <= 1;
  if (nextBtn) nextBtn.disabled = currentPage >= totalPages;

  const pageNumbersEl = document.getElementById('notesPageNumbers');
  if (pageNumbersEl) {
    pageNumbersEl.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = 'phoenix-table-pagination__page-number' + (i === currentPage ? ' phoenix-table-pagination__page-number--active' : '');
      btn.textContent = i;
      btn.addEventListener('click', () => {
        currentPage = i;
        renderTableFromState();
      });
      pageNumbersEl.appendChild(btn);
    }
  }
}

/**
 * Render table from current state (paginated, sorted)
 */
function renderTableFromState() {
  const tbody = document.getElementById('notesTableBody');
  if (!tbody) return;
  const arr = tableData.data || [];
  const sorted = sortNotesData(arr, currentSortKey, currentSortDir);
  const start = (currentPage - 1) * currentPageSize;
  const pageData = sorted.slice(start, start + currentPageSize);
  tbody.innerHTML = pageData.map(renderNoteRow).join('');

  const countEl = document.getElementById('notesCount');
  const total = Math.max(tableData.total || 0, (tableData.data || []).length);
  if (countEl) countEl.textContent = `${total} הערות`;

  updatePagination();
}

/**
 * Render table body — entry point when data arrives. Stores in tableData, renders page, updates pagination.
 * CRITICAL: total must always reflect actual row count for correct pagination display.
 */
function renderTable(notes) {
  const raw = Array.isArray(notes) ? notes : (notes?.data ?? notes?.notes ?? notes?.results ?? notes?.items ?? []) || [];
  const reportedTotal = notes?.total ?? notes?.total_count ?? null;
  const total = Math.max(raw.length, reportedTotal ?? 0);
  tableData = { data: raw, total };
  currentPage = 1;
  renderTableFromState();
}

/**
 * Build attachments HTML for note details modal (§3D, BF-G7-024 — download, open, preview)
 */
function buildAttachmentsHtml(attachments, noteId) {
  if (!attachments || !attachments.length) return '<p>אין קבצים מצורפים</p>';
  return attachments.map((att) => {
    const name = att.original_filename || att.originalFilename || att.filename || 'קובץ';
    const attId = att.id || att.external_ulid;
    const icon = getFormatIcon(att.content_type || att.contentType, name);
    const downloadUrl = att.download_url || `/api/v1/notes/${noteId}/attachments/${attId}/download`;
    const esc = (s) => String(s ?? '').replace(/"/g, '&quot;').replace(/</g, '&lt;');
    return `
      <div class="note-attachment-row" data-note-id="${noteId}" data-attachment-id="${attId}">
        <span class="attachment-icon">${icon}</span>
        <span class="attachment-name">${esc(name)}</span>
        <span class="attachment-actions">
          <a href="#" class="note-attachment-open js-attachment-open" data-attachment-id="${attId}" data-note-id="${noteId}" title="פתח בחלון חדש (תצוגה מקדימה)">🔗 פתח</a>
          <a href="#" class="note-attachment-download js-attachment-download" data-attachment-id="${attId}" data-note-id="${noteId}" title="הורדה">⬇ הורד</a>
        </span>
        <button type="button" class="table-action-btn js-attachment-remove" data-attachment-id="${attId}" data-note-id="${noteId}" aria-label="מחק קובץ" title="מחק קובץ">✕</button>
      </div>`;
  }).join('');
}

/** Bind attachment download/open/remove handlers (BF-G7-024) */
function bindNoteAttachmentHandlers(noteId) {
  const container = document.querySelector('.note-attachments-list');
  if (!container) return;

  async function fetchAttachmentBlob(attId, filename) {
    const { default: sharedServices } = await import('../../../components/core/sharedServices.js');
    await sharedServices.init();
    const url = sharedServices.buildUrl(`/notes/${noteId}/attachments/${attId}/download`);
    const token = sharedServices.getToken();
    const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.blob();
  }

  container.querySelectorAll('.js-attachment-download').forEach((link) => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const attId = link.dataset.attachmentId;
      const row = link.closest('.note-attachment-row');
      const filename = (row && row.querySelector('.attachment-name')) ? row.querySelector('.attachment-name').textContent.trim() : 'download';
      if (!attId || !noteId) return;
      try {
        const blob = await fetchAttachmentBlob(attId, filename);
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename || 'download';
        a.click();
        URL.revokeObjectURL(a.href);
      } catch (err) {
        maskedLog('[Notes] Download attachment error:', { message: (err && err.message) || 'Unknown' });
        createModal({ title: 'שגיאה', content: '<p>שגיאה בהורדת הקובץ</p>', showSaveButton: false, cancelButtonText: 'ביטול' });
      }
    });
  });

  container.querySelectorAll('.js-attachment-open').forEach((link) => {
    link.addEventListener('click', async (e) => {
      e.preventDefault();
      const attId = link.dataset.attachmentId;
      const row = link.closest('.note-attachment-row');
      const filename = (row && row.querySelector('.attachment-name')) ? row.querySelector('.attachment-name').textContent.trim() : 'file';
      if (!attId || !noteId) return;
      try {
        const blob = await fetchAttachmentBlob(attId, filename);
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener,noreferrer');
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      } catch (err) {
        maskedLog('[Notes] Open attachment error:', { message: (err && err.message) || 'Unknown' });
        createModal({ title: 'שגיאה', content: '<p>שגיאה בפתיחת הקובץ</p>', showSaveButton: false, cancelButtonText: 'ביטול' });
      }
    });
  });

  container.querySelectorAll('.js-attachment-remove').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const attId = btn.dataset.attachmentId;
      if (!attId || !noteId) return;
      try {
        const { default: sharedServices } = await import('../../../components/core/sharedServices.js');
        await sharedServices.init();
        await sharedServices.delete(`/notes/${noteId}/attachments/${attId}`);
        const row = btn.closest('.note-attachment-row');
        if (row) row.remove();
        if (!container.querySelector('.note-attachment-row')) container.innerHTML = '<p>אין קבצים מצורפים</p>';
      } catch (err) {
        maskedLog('[Notes] Remove attachment error:', { message: (err && err.message) || 'Unknown' });
        createModal({ title: 'שגיאה', content: '<p>שגיאה בהסרת הקובץ</p>', showSaveButton: false, cancelButtonText: 'ביטול' });
      }
    });
  });
}

/**
 * Handle view note (Details) — §3D full required field list
 */
async function handleViewNote(noteId) {
  try {
    const { default: sharedServices } = await import('../../../components/core/sharedServices.js');
    await sharedServices.init();
    const [noteRes, attachmentsRes] = await Promise.all([
      sharedServices.get('/notes/' + noteId),
      sharedServices.get('/notes/' + noteId + '/attachments').catch(() => ({ data: [] }))
    ]);
    const n = (noteRes && noteRes.data) ? noteRes.data : noteRes;
    const attList = Array.isArray(attachmentsRes) ? attachmentsRes : (attachmentsRes?.data ?? attachmentsRes?.attachments ?? []) || [];
    const content = (n && n.content) ? n.content : '';
    const title = (n && n.title) ? n.title : '';
    const tags = (n && n.tags) ? n.tags : [];
    const linkedEntityHtml = formatLinkedEntityDisplay(n || {});
    const created = formatDate((n && n.created_at) || (n && n.createdAt));
    const updated = formatDate((n && n.updated_at) || (n && n.updatedAt));
    const tagsHtml = tags.length ? `<div class="form-group"><strong>תגיות:</strong> ${tags.map(t => `<span class="badge tag-badge">${String(t).replace(/</g, '&lt;')}</span>`).join(' ')}</div>` : '';
    const attachmentsHtml = buildAttachmentsHtml(attList, noteId);

    const html = `
      <div class="note-view-content phoenix-form">
        ${title ? `<div class="form-group"><strong>כותרת:</strong> ${title}</div>` : ''}
        <div class="form-group"><strong>מקושר ל:</strong> ${linkedEntityHtml}</div>
        ${tagsHtml}
        <div class="form-group"><strong>נוצר:</strong> ${created} <strong>עודכן:</strong> ${updated}</div>
        <div class="form-group"><strong>תוכן:</strong></div>
        <div class="note-view-body" style="border:1px solid var(--apple-border-light);padding:12px;border-radius:6px;max-height:300px;overflow-y:auto;">${content || '—'}</div>
        <div class="form-group"><strong>קבצים מצורפים:</strong></div>
        <div class="note-attachments-list">${attachmentsHtml}</div>
      </div>
    `;
    createModal({
      title: 'פרטי הערה',
      content: html,
      entity: 'note',
      showSaveButton: false,
      cancelButtonText: 'ביטול',
      onClose: function() {}
    });

    setTimeout(() => bindNoteAttachmentHandlers(noteId), 0);
  } catch (err) {
    maskedLog('[Notes] View error:', { message: (err && err.message) || 'Unknown' });
    createModal({
      title: 'שגיאה',
      content: '<p>שגיאה בטעינת פרטי ההערה</p>',
      showSaveButton: false,
      cancelButtonText: 'ביטול'
    });
  }
}

/**
 * Init pagination handlers — page size, prev, next
 */
function initPaginationHandlers() {
  const pageSizeSelect = document.querySelector('.js-table-page-size[data-table-id="notesTable"]');
  const prevBtn = document.getElementById('notesPrevPageBtn');
  const nextBtn = document.getElementById('notesNextPageBtn');

  if (pageSizeSelect) {
    pageSizeSelect.addEventListener('change', function() {
      currentPageSize = parseInt(this.value, 10) || 25;
      currentPage = 1;
      renderTableFromState();
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        renderTableFromState();
      }
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(tableData.total / currentPageSize);
      if (currentPage < totalPages) {
        currentPage++;
        renderTableFromState();
      }
    });
  }
}

/**
 * Init sort manager — PhoenixTableSortManager
 */
function initSortManager() {
  const table = document.getElementById('notesTable');
  if (!table || !window.PhoenixTableSortManager) return;
  const sortManager = new window.PhoenixTableSortManager(table);
  table.addEventListener('phoenix-table-sorted', function(e) {
    const detail = e.detail || {};
    currentSortKey = detail.sortKey || null;
    const dir = (detail.sortDirection || detail.sortDir || 'asc');
    currentSortDir = typeof dir === 'string' ? dir.toLowerCase() : 'asc';
    if (currentSortDir !== 'asc' && currentSortDir !== 'desc') currentSortDir = 'asc';
    renderTableFromState();
  });
}

/**
 * Bind filter buttons
 */
function bindFilters() {
  const container = document.querySelector('.filter-buttons-container');
  if (!container) return;
  container.querySelectorAll('.filter-icon-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const type = btn.dataset.filterType || 'all';
      container.querySelectorAll('.filter-icon-btn').forEach((b) => b.classList.remove('filter-icon-btn--active'));
      btn.classList.add('filter-icon-btn--active');
      window.PhoenixBridge = window.PhoenixBridge || {};
      window.PhoenixBridge.state = window.PhoenixBridge.state || {};
      window.PhoenixBridge.state.filters = { ...(window.PhoenixBridge.state.filters || {}), parentType: type === 'all' ? undefined : type };
      const result = await loadNotesData({ parentType: type === 'all' ? undefined : type });
      renderTable(result.notes);
    });
  });
}

/**
 * Bind add button — דינמי import כדי להבטיח שהמודול נטען
 */
function bindAddButton() {
  const addBtn = document.querySelector('.js-add-note');
  if (!addBtn) return;
  addBtn.addEventListener('click', async () => {
    try {
      const { openNotesForm } = await import('./notesForm.js');
      openNotesForm();
    } catch (err) {
      maskedLog('[Notes] Form load error:', { message: (err && err.message) || 'Unknown' });
      createModal({
        title: 'שגיאה',
        content: '<p>שגיאה בטעינת טופס הוספת הערה</p>',
        showSaveButton: false,
        cancelButtonText: 'ביטול'
      });
    }
  });
}

/**
 * Bind row actions (edit/delete)
 */
function bindRowActions() {
  const tbody = document.getElementById('notesTableBody');
  if (tbody) tbody.addEventListener('click', async (e) => {
    const viewBtn = e.target.closest('.js-action-view');
    const editBtn = e.target.closest('.js-action-edit');
    const delBtn = e.target.closest('.js-action-delete');
    const btn = viewBtn || editBtn || delBtn;
    const id = btn && btn.dataset.noteId;
    if (!id) return;
    if (viewBtn) {
      handleViewNote(id);
    } else if (editBtn && window.openNotesForm) {
      window.openNotesForm(id);
    } else if (delBtn) {
      createModal({
        title: 'מחיקת הערה',
        content: '<p>האם למחוק את ההערה?</p>',
        entity: 'note',
        showSaveButton: true,
        confirmMode: true,
        saveButtonText: 'מחיקה',
        cancelButtonText: 'ביטול',
        onSave: async () => {
          try {
            const { default: sharedServices } = await import('../../../components/core/sharedServices.js');
            await sharedServices.init();
            await sharedServices.delete(`/notes/${id}`);
            document.getElementById('phoenix-modal-backdrop')?.remove();
            if (window.refreshNotesTable) await window.refreshNotesTable();
            else {
              const result = await loadNotesData((window.PhoenixBridge && window.PhoenixBridge.state && window.PhoenixBridge.state.filters) || {});
              renderSummary(result.summary);
              renderTable(result.notes);
            }
          } catch (err) {
            maskedLog('[Notes] Delete error:', { status: (err && err.status) });
            createModal({
              title: 'שגיאה',
              content: '<p>שגיאה במחיקה</p>',
              showSaveButton: false,
              cancelButtonText: 'ביטול'
            });
          }
        }
      });
    }
  });
}

/**
 * Bind summary toggle
 */
function bindSummaryToggle() {
  const toggle = document.getElementById('notesSummaryToggleSize');
  const content = document.getElementById('notesSummaryContent');
  if (toggle && content) {
    toggle.addEventListener('click', () => {
      const isHidden = content.style.display === 'none';
      content.style.display = isHidden ? 'flex' : 'none';
    });
  }
}

/**
 * Init: render from data and bind handlers
 * Signature: (data, config) for Render stage
 */
function initNotesTable(data, config) {
  const d = data || (window.UAIState && window.UAIState.data);
  if (d && d.summary) renderSummary(d.summary);
  if (d && d.notes) renderTable(d.notes);
  initPaginationHandlers();
  initSortManager();
  bindFilters();
  bindAddButton();
  bindRowActions();
  bindSummaryToggle();
}

window.initNotesTable = initNotesTable;

/**
 * Refresh table (called after add/edit/delete)
 */
export async function refreshNotesTable() {
  const filters = (window.PhoenixBridge && window.PhoenixBridge.state && window.PhoenixBridge.state.filters) || {};
  const parentType = filters.parentType;
  const result = await loadNotesData({ parentType: parentType === 'all' ? undefined : parentType });
  renderSummary(result.summary);
  renderTable(result.notes);
}

window.refreshNotesTable = refreshNotesTable;

export { initNotesTable, renderSummary, renderTable };
