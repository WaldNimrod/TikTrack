/**
 * Alerts Table Init — D34 (MB3A)
 * --------------------------------------------------------
 * טעינה, רינדור וניהול טבלת התראות
 * מקור: alerts_BLUEPRINT, TEAM_20_TO_TEAM_30_MB3A_ALERTS_API_IMPLEMENTATION_COMPLETE
 * Per: PhoenixTableSortManager, pagination pattern (notes, brokersFees)
 */

import { loadAlertsData } from './alertsDataLoader.js';
import { openAlertsForm } from './alertsForm.js';
import { createModal } from '../../../components/shared/PhoenixModal.js';
import sharedServices from '../../../components/core/sharedServices.js';
import { maskedLog } from '../../../utils/maskedLog.js';

const EMPTY_ROW_HTML = `
  <tr class="phoenix-table__row phoenix-table__row--empty" role="row">
    <td colspan="7" class="phoenix-table__cell phoenix-table__cell--empty" data-role="empty-state">
      <span class="phoenix-table__empty-text">אין התראות להצגה</span>
    </td>
  </tr>
`;

/** State for pagination/sort — same pattern as notes */
let tableData = { data: [], total: 0 };
let currentPage = 1;
let currentPageSize = 25;
let currentSortKey = null;
let currentSortDir = 'asc';
let currentFilterType = 'all';

const TARGET_TYPE_LABELS = {
  all: 'הכל',
  account: 'חשבון מסחר',
  trade: 'טרייד',
  trade_plan: 'תוכנית',
  ticker: 'טיקר'
};

function formatDate(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

function renderSummary(summary) {
  const el = (id) => document.getElementById(id);
  if (!el('totalAlerts')) return;
  const s = summary || {};
  el('totalAlerts').textContent = s.totalAlerts != null ? s.totalAlerts : 0;
  el('activeAlerts').textContent = s.activeAlerts != null ? s.activeAlerts : 0;
  el('newAlerts').textContent = s.newAlerts != null ? s.newAlerts : 0;
  const triggered = el('triggeredAlerts');
  if (triggered) triggered.textContent = s.triggeredAlerts != null ? s.triggeredAlerts : 0;
}

function sortAlertsData(arr, sortKey, sortDir) {
  if (!sortKey || !arr.length) return arr;
  const dir = sortDir === 'desc' ? -1 : 1;
  return [...arr].sort((a, b) => {
    let va = (a[sortKey] != null ? a[sortKey] : '');
    let vb = (b[sortKey] != null ? b[sortKey] : '');
    if (typeof va === 'string') va = va.toLowerCase();
    if (typeof vb === 'string') vb = vb.toLowerCase();
    if (va < vb) return -1 * dir;
    if (va > vb) return 1 * dir;
    return 0;
  });
}

function updatePagination() {
  const P = window.PhoenixTablePagination;
  const dataLen = (tableData.data || []).length;
  const total = Math.max(tableData.total || 0, dataLen);
  const totalPages = Math.max(1, Math.ceil(total / currentPageSize));
  const start = total === 0 ? 0 : (currentPage - 1) * currentPageSize + 1;
  const end = Math.min(currentPage * currentPageSize, total);

  const infoEl = document.getElementById('alertsPaginationInfo');
  if (infoEl) infoEl.textContent = P ? P.formatInfoText(start, end, total) : `מציג ${start}-${end} מתוך ${total} רשומות`;

  const prevBtn = document.getElementById('alertsPrevPageBtn');
  const nextBtn = document.getElementById('alertsNextPageBtn');
  if (prevBtn) prevBtn.disabled = currentPage <= 1;
  if (nextBtn) nextBtn.disabled = currentPage >= totalPages;

  const pageNumbersEl = document.getElementById('alertsPageNumbers');
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

function renderTableFromState() {
  const tbody = document.getElementById('alertsTableBody');
  if (!tbody) return;
  const arr = tableData.data || [];
  const sorted = sortAlertsData(arr, currentSortKey, currentSortDir);
  const start = (currentPage - 1) * currentPageSize;
  const pageData = sorted.slice(start, start + currentPageSize);

  if (pageData.length === 0) {
    tbody.innerHTML = EMPTY_ROW_HTML;
  } else {
    tbody.innerHTML = pageData.map(renderAlertRow).join('');
  }

  const countEl = document.getElementById('alertsCount');
  const total = Math.max(tableData.total || 0, arr.length);
  if (countEl) countEl.textContent = `${total} התראות`;

  updatePagination();
}

function renderAlertRow(alert) {
  const targetType = (alert.target_type != null ? alert.target_type : alert.targetType) || '';
  const typeLabel = TARGET_TYPE_LABELS[targetType] || targetType || '—';
  const ticker = (alert.ticker_symbol != null ? alert.ticker_symbol : alert.tickerSymbol) || '—';
  const condition = (alert.condition_field != null ? alert.condition_field : alert.conditionField) || (alert.condition_summary || '—');
  const isActive = (alert.is_active != null ? alert.is_active : alert.isActive) !== false;
  const isTriggered = (alert.is_triggered != null ? alert.is_triggered : alert.isTriggered) === true;
  const created = formatDate(alert.created_at != null ? alert.created_at : alert.createdAt);
  const id = alert.id || alert.external_ulid || '';

  return `
    <tr class="phoenix-table__row" data-alert-id="${id}" role="row">
      <td class="phoenix-table__cell col-linked-object" data-field="target_type"><span class="linked-object-badge entity-${targetType}">${typeLabel}</span></td>
      <td class="phoenix-table__cell col-ticker" data-field="ticker_id">${ticker}</td>
      <td class="phoenix-table__cell col-condition" data-field="condition_field">${condition}</td>
      <td class="phoenix-table__cell col-status" data-field="is_active">${isActive ? 'פעיל' : 'לא פעיל'}</td>
      <td class="phoenix-table__cell col-triggered" data-field="is_triggered">${isTriggered ? 'כן' : 'לא'}</td>
      <td class="phoenix-table__cell col-created phoenix-table__cell--date">${created}</td>
      <td class="phoenix-table__cell col-actions phoenix-table__cell--actions">
        <div class="table-actions-tooltip">
          <button class="table-actions-trigger" aria-label="פעולות">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
          </button>
          <div class="table-actions-menu">
            <button class="table-action-btn js-action-toggle" data-action="toggle-active" aria-label="החלף סטטוס פעיל" data-alert-id="${id}" title="החלף פעיל/לא פעיל">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22 6 12 13 2 6"></polyline></svg>
            </button>
            <button class="table-action-btn js-action-view" aria-label="פרטים" data-alert-id="${id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
            <button class="table-action-btn js-action-edit" aria-label="לערוך" data-alert-id="${id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="table-action-btn js-action-delete" aria-label="למחוק" data-alert-id="${id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      </td>
    </tr>
  `;
}

function renderTable(alerts) {
  const raw = Array.isArray(alerts) ? alerts : (alerts?.data ?? alerts?.alerts ?? alerts?.results ?? alerts?.items ?? []) || [];
  const reportedTotal = alerts?.total ?? alerts?.total_count ?? null;
  const total = Math.max(raw.length, reportedTotal ?? 0);
  tableData = { data: raw, total };
  currentPage = 1;
  renderTableFromState();
}

function initPaginationHandlers() {
  const pageSizeSelect = document.querySelector('.js-table-page-size[data-table-id="alertsTable"]');
  const prevBtn = document.getElementById('alertsPrevPageBtn');
  const nextBtn = document.getElementById('alertsNextPageBtn');

  if (pageSizeSelect) {
    pageSizeSelect.addEventListener('change', function() {
      currentPageSize = parseInt(this.value, 10) || 25;
      currentPage = 1;
      renderTableFromState();
    });
  }
  if (prevBtn) prevBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderTableFromState(); } });
  if (nextBtn) nextBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(tableData.total / currentPageSize);
    if (currentPage < totalPages) { currentPage++; renderTableFromState(); }
  });
}

function initSortManager() {
  const table = document.getElementById('alertsTable');
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

function bindFilters() {
  const container = document.querySelector('[data-section="alerts-management"] .filter-buttons-container');
  if (!container) return;
  container.querySelectorAll('.filter-icon-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const type = btn.dataset.filterType || 'all';
      container.querySelectorAll('.filter-icon-btn').forEach((b) => b.classList.remove('filter-icon-btn--active'));
      btn.classList.add('filter-icon-btn--active');
      currentFilterType = type;
      window.PhoenixBridge = window.PhoenixBridge || {};
      window.PhoenixBridge.state = window.PhoenixBridge.state || {};
      window.PhoenixBridge.state.filters = { ...(window.PhoenixBridge.state.filters || {}), targetType: type === 'all' ? undefined : type };
      try {
        const result = await loadAlertsData({ targetType: type === 'all' ? undefined : type });
        renderSummary(result.summary);
        renderTable(result.alerts);
      } catch (err) {
        maskedLog('[Alerts] Filter error:', { message: (err && err.message) || 'Unknown' });
        renderTable([]);
      }
    });
  });
}

async function refreshAlertsTable() {
  try {
    const filters = (window.PhoenixBridge && window.PhoenixBridge.state && window.PhoenixBridge.state.filters) || {};
    const result = await loadAlertsData({ targetType: filters.targetType === 'all' ? undefined : filters.targetType });
    renderSummary(result.summary);
    renderTable(result.alerts);
  } catch (err) {
    maskedLog('[Alerts] Refresh error:', { message: (err && err.message) || 'Unknown' });
  }
}

function bindAddButton() {
  const addBtn = document.querySelector('.js-add-alert');
  if (!addBtn) return;
  addBtn.addEventListener('click', () => openAlertsForm(null, refreshAlertsTable));
}

function bindRowActions() {
  const tbody = document.getElementById('alertsTableBody');
  if (!tbody) return;
  tbody.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('.js-action-edit');
    const delBtn = e.target.closest('.js-action-delete');
    const toggleBtn = e.target.closest('.js-action-toggle');
    const viewBtn = e.target.closest('.js-action-view');
    const id = (editBtn || delBtn || toggleBtn || viewBtn)?.dataset?.alertId;
    if (!id) return;
    const alertItem = (tableData.data || []).find((a) => String(a.id || a.external_ulid || '') === String(id));
    if (editBtn) {
      openAlertsForm(alertItem, refreshAlertsTable);
      return;
    }
    if (toggleBtn) {
      try {
        await sharedServices.init();
        const current = (alertItem && (alertItem.is_active != null ? alertItem.is_active : alertItem.isActive)) !== false;
        await sharedServices.patch(`/alerts/${id}`, { is_active: !current });
        refreshAlertsTable();
      } catch (err) {
        maskedLog('[Alerts] Toggle error:', { message: (err && err.message) || 'Unknown' });
        window.alert('שגיאה בעדכון סטטוס');
      }
      return;
    }
    if (delBtn) {
      createModal({
        title: 'מחיקת התראה',
        content: '<p>האם אתה בטוח שברצונך למחוק התראה זו?</p>',
        entity: 'alert',
        showSaveButton: true,
        confirmMode: true,
        saveButtonText: 'מחיקה',
        cancelButtonText: 'ביטול',
        onSave: async () => {
          try {
            await sharedServices.init();
            await sharedServices.delete(`/alerts/${id}`);
            document.getElementById('phoenix-modal-backdrop')?.remove();
            refreshAlertsTable();
          } catch (err) {
            maskedLog('[Alerts] Delete error:', { message: (err && err.message) || 'Unknown' });
            window.alert('שגיאה במחיקה');
          }
        }
      });
      return;
    }
    if (viewBtn && alertItem) {
      openAlertsForm(alertItem, () => {}); // view-only would need showSaveButton: false — for now reuse form as read
    }
  });
}

function bindSummaryToggle() {
  const toggle = document.getElementById('alertsSummaryToggleSize');
  const content = document.getElementById('alertsSummaryContent');
  if (toggle && content) {
    toggle.addEventListener('click', () => {
      const isHidden = content.style.display === 'none';
      content.style.display = isHidden ? 'flex' : 'none';
    });
  }
}

function initAlertsTable(data, config) {
  const d = data || (window.UAIState && window.UAIState.data);
  if (d && d.summary) renderSummary(d.summary);
  if (d && d.alerts) renderTable(d.alerts);
  else renderTable([]);
  initPaginationHandlers();
  initSortManager();
  bindFilters();
  bindAddButton();
  bindRowActions();
  bindSummaryToggle();
}

window.initAlertsTable = initAlertsTable;

export { initAlertsTable, renderSummary, renderTable };
