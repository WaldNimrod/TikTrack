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
import { getEntityDetailUrl } from '../../../utils/entityLinks.js';

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
  ticker: 'טיקר',
  datetime: 'תאריך/שעה'
};

/** G7R Batch1: Entity icon paths for linked entity display (§3D) */
const ALERT_ENTITY_ICON_MAP = { ticker: '/images/icons/entities/tickers.svg', account: '/images/icons/entities/trading_accounts.svg', trade: '/images/icons/entities/trades.svg', trade_plan: '/images/icons/entities/trade_plans.svg' };

/** T50-1: Map alert target_type to entity type for links (account → trading_accounts) */
const ALERT_TYPE_TO_ENTITY = { ticker: 'ticker', account: 'trading_account', trade: 'trade', trade_plan: 'trade_plan' };

/** Format alert linked entity: icon + resolved name + link to details (T50-1) */
function formatAlertLinkedEntity(alert) {
  const targetType = (alert.target_type != null ? alert.target_type : alert.targetType) || '';
  const resolvedName = alert.linked_entity_display ?? alert.target_display_name ?? (alert.ticker_symbol ?? alert.tickerSymbol) ?? '';
  const targetId = (alert.target_id != null ? alert.target_id : alert.targetId) || (alert.ticker_id ?? alert.tickerId) || '';
  const typeLabel = TARGET_TYPE_LABELS[targetType] || targetType || '';
  const displayName = resolvedName || (targetId ? typeLabel + ' ' + String(targetId).slice(0, 8) + '…' : typeLabel || '—');
  const iconPath = targetType ? ALERT_ENTITY_ICON_MAP[targetType] : null;
  const targetDt = alert.target_datetime ?? alert.targetDatetime;
  if (targetType === 'datetime' && targetDt) {
    try {
      const dt = new Date(targetDt);
      const dtStr = dt.toLocaleString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      return `<span class="linked-object-badge entity-datetime" title="תאריך/שעה: ${String(dtStr).replace(/"/g, '&quot;')}">🕐 ${dtStr}</span>`;
    } catch (_) { /* ignore invalid date */ }
  }
  if (!targetType && !targetId) return '<span class="linked-object-badge">—</span>';
  const iconHtml = iconPath ? `<img src="${iconPath}" alt="" class="linked-entity-icon" width="16" height="16" aria-hidden="true" />` : '';
  const entityType = ALERT_TYPE_TO_ENTITY[targetType];
  const href = entityType && targetId ? getEntityDetailUrl(entityType, targetId) : null;
  const badgeHtml = `<span class="linked-object-badge entity-${targetType}" title="${(typeLabel + (displayName ? ' ' + displayName : '')).replace(/"/g, '&quot;')}">${iconHtml} ${displayName}</span>`;
  if (href) return `<a href="${href}" class="linked-object-badge-link" data-entity-type="${entityType}" data-entity-id="${String(targetId).replace(/"/g, '&quot;')}">${badgeHtml}</a>`;
  return badgeHtml;
}

/** G7R Batch1: Condition field/operator labels for formatted display */
const CONDITION_FIELD_LABELS = { price: 'מחיר', open_price: 'מחיר פתיחה', high_price: 'מחיר גבוה', low_price: 'מחיר נמוך', close_price: 'מחיר סגירה', volume: 'נפח', market_cap: 'שווי שוק' };
const CONDITION_OP_LABELS = { '>': '>', '<': '<', '>=': '>=', '<=': '<=', '=': '=', crosses_above: 'חוצה כלפי מעלה', crosses_below: 'חוצה כלפי מטה' };

function formatConditionDisplay(field, op, value) {
  if (!field || !op) return null;
  const fLabel = CONDITION_FIELD_LABELS[field] || field;
  const oLabel = CONDITION_OP_LABELS[op] || op;
  const v = value != null && value !== '' ? String(value) : '';
  return `${fLabel} ${oLabel} ${v}`.trim();
}

function formatDate(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return iso;
  }
}

function formatTriggerStatus(ts) {
  const labels = {
    untriggered: 'ממתין להפעלה',
    triggered_unread: 'הופעל — לא נקרא',
    triggered_read: 'הופעל — נקרא'
  };
  return labels[ts] || ts || '—';
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
  const linkedEntityHtml = formatAlertLinkedEntity(alert);
  const condField = alert.condition_field != null ? alert.condition_field : alert.conditionField;
  const condOp = alert.condition_operator != null ? alert.condition_operator : alert.conditionOperator;
  const condVal = alert.condition_value != null ? alert.condition_value : alert.conditionValue;
  const condition = alert.condition_summary || formatConditionDisplay(condField, condOp, condVal) || '—';
  const isActive = (alert.is_active != null ? alert.is_active : alert.isActive) !== false;
  const isTriggered = (alert.is_triggered != null ? alert.is_triggered : alert.isTriggered) === true;
  const triggerStatus = (alert.trigger_status != null ? alert.trigger_status : alert.triggerStatus) || (isTriggered ? 'triggered_unread' : 'untriggered');
  const created = formatDate(alert.created_at != null ? alert.created_at : alert.createdAt);
  const id = alert.id || alert.external_ulid || '';
  const triggerClass = triggerStatus === 'triggered_unread' ? 'trigger-unread' : (triggerStatus === 'triggered_read' ? 'trigger-read' : '');

  const ticker = (alert.ticker_symbol != null ? alert.ticker_symbol : alert.tickerSymbol) || '—';
  return `
    <tr class="phoenix-table__row ${triggerClass}" data-alert-id="${id}" role="row">
      <td class="phoenix-table__cell col-linked-object" data-field="target_type">${linkedEntityHtml}</td>
      <td class="phoenix-table__cell col-ticker" data-field="ticker_id">${ticker}</td>
      <td class="phoenix-table__cell col-condition" data-field="condition_field">${condition}</td>
      <td class="phoenix-table__cell col-status" data-field="is_active">${isActive ? 'פעיל' : 'לא פעיל'}</td>
      <td class="phoenix-table__cell col-triggered" data-field="is_triggered">${isTriggered ? 'כן' : 'לא'}</td>
      <td class="phoenix-table__cell col-created phoenix-table__cell--date">${created}</td>
      <td class="phoenix-table__cell col-actions phoenix-table__cell--actions">
        <div class="table-actions-tooltip">
          <button class="table-actions-trigger" aria-label="פעולות" title="פעולות">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
          </button>
          <div class="table-actions-menu">
            <button class="table-action-btn js-action-toggle" data-action="toggle-active" aria-label="החלף סטטוס פעיל" title="החלף פעיל/לא פעיל" data-alert-id="${id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22 6 12 13 2 6"></polyline></svg>
            </button>
            <button class="table-action-btn js-action-view" aria-label="הצג פרטי התראה" title="הצג פרטי התראה" data-alert-id="${id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            </button>
            <button class="table-action-btn js-action-edit" aria-label="ערוך התראה" title="ערוך התראה" data-alert-id="${id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
            </button>
            <button class="table-action-btn js-action-delete" aria-label="מחק התראה" title="מחק התראה" data-alert-id="${id}">
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

/** G7R Batch2: Priority badge classes per §3D */
const PRIORITY_CLASSES = { LOW: 'priority-low', MEDIUM: 'priority-medium', HIGH: 'priority-high', CRITICAL: 'priority-critical' };
function formatPriorityBadge(priority) {
  const p = (priority || 'MEDIUM').toUpperCase();
  const cls = PRIORITY_CLASSES[p] || 'priority-medium';
  const labels = { LOW: 'נמוך', MEDIUM: 'בינוני', HIGH: 'גבוה', CRITICAL: 'קריטי' };
  return `<span class="badge ${cls}">${labels[p] || p}</span>`;
}

async function handleViewAlert(alertItem) {
  const id = alertItem.id || alertItem.external_ulid || '';
  const title = (alertItem.title || '').trim() || '—';
  const alertType = (alertItem.alert_type != null ? alertItem.alert_type : alertItem.alertType) || 'PRICE';
  const priority = (alertItem.priority ?? alertItem.priorityVal) || 'MEDIUM';
  const isActive = (alertItem.is_active != null ? alertItem.is_active : alertItem.isActive) !== false;
  const condF = alertItem.condition_field ?? alertItem.conditionField;
  const condO = alertItem.condition_operator ?? alertItem.conditionOperator;
  const condV = alertItem.condition_value ?? alertItem.conditionValue;
  const condition = alertItem.condition_summary || formatConditionDisplay(condF, condO, condV) || 'ללא תנאי';
  const triggerStatus = (alertItem.trigger_status != null ? alertItem.trigger_status : alertItem.triggerStatus) || 'untriggered';
  const triggeredAt = formatDate(alertItem.triggered_at != null ? alertItem.triggered_at : alertItem.triggeredAt);
  const expiresAt = formatDate(alertItem.expires_at != null ? alertItem.expires_at : alertItem.expiresAt);
  const created = formatDate(alertItem.created_at != null ? alertItem.created_at : alertItem.createdAt);
  const updated = formatDate(alertItem.updated_at != null ? alertItem.updated_at : alertItem.updatedAt);
  const canRearm = triggerStatus === 'triggered_read';

  if (triggerStatus === 'triggered_unread') {
    try {
      await sharedServices.init();
      await sharedServices.patch(`/alerts/${id}`, { trigger_status: 'triggered_read' });
    } catch (err) {
      maskedLog('[Alerts] Mark read error:', { message: (err && err.message) || 'Unknown' });
    }
  }

  const linkedEntityHtml = formatAlertLinkedEntity(alertItem);
  const rearmHtml = canRearm ? `
    <div class="form-group" style="margin-top:12px;">
      <button type="button" class="phoenix-modal__save-btn js-alert-rearm-btn" data-alert-id="${id}">הפעל מחדש</button>
    </div>
  ` : '';

  const html = `
    <div class="phoenix-form alert-detail-content">
      <div class="form-group"><strong>כותרת:</strong> ${title}</div>
      <div class="form-group"><strong>סוג התראה:</strong> <span class="badge alert-type-badge">${alertType}</span></div>
      <div class="form-group"><strong>מקושר ל:</strong> ${linkedEntityHtml}</div>
      <div class="form-group"><strong>תנאי:</strong> ${condition}</div>
      <div class="form-group"><strong>עדיפות:</strong> ${formatPriorityBadge(priority)}</div>
      <div class="form-group"><strong>סטטוס:</strong> <span class="badge">${isActive ? 'פעיל' : 'מבוטל'}</span></div>
      <div class="form-group"><strong>מצב הפעלה:</strong> ${formatTriggerStatus(triggerStatus)}</div>
      ${triggeredAt && triggeredAt !== '—' ? `<div class="form-group"><strong>הופעל ב:</strong> ${triggeredAt}</div>` : ''}
      ${expiresAt && expiresAt !== '—' ? `<div class="form-group"><strong>תפוגה:</strong> ${expiresAt}</div>` : ''}
      <div class="form-group"><strong>נוצר:</strong> ${created} <strong>עודכן:</strong> ${updated}</div>
      ${rearmHtml}
    </div>
  `;

  createModal({
    title: 'פרטי התראה',
    content: html,
    entity: 'alert',
    showSaveButton: false,
    cancelButtonText: 'ביטול',
    onClose: () => {}
  });

  const rearmBtn = document.querySelector('.js-alert-rearm-btn');
  if (rearmBtn) {
    rearmBtn.addEventListener('click', async () => {
      try {
        await sharedServices.init();
        await sharedServices.patch(`/alerts/${id}`, { trigger_status: 'untriggered' });
        document.getElementById('phoenix-modal-backdrop')?.remove();
        refreshAlertsTable();
      } catch (err) {
        maskedLog('[Alerts] Re-arm error:', { message: (err && err.message) || 'Unknown' });
        createModal({
          title: 'שגיאה',
          content: '<p>שגיאה בהפעלה מחדש</p>',
          showSaveButton: false,
          cancelButtonText: 'ביטול'
        });
      }
    });
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
        createModal({
          title: 'שגיאה',
          content: '<p>שגיאה בעדכון סטטוס</p>',
          showSaveButton: false,
          cancelButtonText: 'ביטול'
        });
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
            createModal({
              title: 'שגיאה',
              content: '<p>שגיאה במחיקה</p>',
              showSaveButton: false,
              cancelButtonText: 'ביטול'
            });
          }
        }
      });
      return;
    }
    if (viewBtn && alertItem) {
      handleViewAlert(alertItem);
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
