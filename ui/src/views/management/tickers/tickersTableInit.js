/**
 * Tickers Table Initialization - ניהול טיקרים
 * CRUD: הוספה, עריכה, מחיקה
 */

import sharedServices from '../../../components/core/sharedServices.js';
import { showTickerFormModal } from './tickersForm.js';
import { maskedLog } from '../../../utils/maskedLog.js';
import { toHebrewStatus, normalizeToCanonicalStatus } from '../../../utils/statusAdapter.js';

const formatCurrency = (amount, currency = 'USD') => {
  if (amount == null || isNaN(amount)) return '—';
  return `${currency === 'USD' ? '$' : ''}${Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
};
const formatChangePct = (pct) => {
  if (pct == null || isNaN(pct)) return '—';
  const n = Number(pct);
  const sign = n >= 0 ? '+' : '';
  return `${sign}${n.toFixed(2)}%`;
};

(function initTickersTable() {
  'use strict';

  let currentPage = 1;
  let currentPageSize = 25;
  let tableData = { data: [], total: 0 };
  let currentSortKey = 'symbol';
  let currentSortDir = 'asc';

  function isAuthenticated() {
    try {
      return !!(localStorage.getItem('access_token') || localStorage.getItem('authToken') ||
        sessionStorage.getItem('access_token') || sessionStorage.getItem('authToken'));
    } catch (_) {
      return false;
    }
  }

  async function loadTickersData() {
    try {
      await sharedServices.init();
      const [listRes, summaryRes] = await Promise.all([
        sharedServices.get('/tickers', {}),
        sharedServices.get('/tickers/summary', {}),
      ]);
      const data = listRes?.data ?? listRes ?? [];
      const total = listRes?.total ?? data?.length ?? 0;
      const summary = summaryRes ?? {};
      return {
        table: { data: Array.isArray(data) ? data : [], total },
        summary: { total_tickers: summary.total_tickers ?? total, active_tickers: summary.active_tickers ?? 0 },
      };
    } catch (e) {
      maskedLog('[Tickers] Error loading data:', { errorCode: e?.code, status: e?.status });
      return { table: { data: [], total: 0 }, summary: { total_tickers: 0, active_tickers: 0 } };
    }
  }

  function sortTableData(arr, key, dir) {
    const keyMap = { company_name: 'companyName', current_price: 'currentPrice', daily_change_pct: 'dailyChangePct' };
    const keyAlt = keyMap[key] || key;
    const copy = [...arr];
    copy.sort((a, b) => {
      let va = a[key] ?? a[keyAlt] ?? '';
      let vb = b[key] ?? b[keyAlt] ?? '';
      if (typeof va === 'boolean') va = va ? 1 : 0;
      if (typeof vb === 'boolean') vb = vb ? 1 : 0;
      if (typeof va === 'string') va = va.toLowerCase();
      if (typeof vb === 'string') vb = vb.toLowerCase();
      if (va < vb) return dir === 'asc' ? -1 : 1;
      if (va > vb) return dir === 'asc' ? 1 : -1;
      return 0;
    });
    return copy;
  }

  function updateSummary(summary) {
    const totalEl = document.getElementById('totalTickers');
    const activeEl = document.getElementById('activeTickers');
    const countEl = document.getElementById('tableTickersCount');
    if (totalEl) totalEl.textContent = summary?.total_tickers ?? 0;
    if (activeEl) activeEl.textContent = summary?.active_tickers ?? 0;
    if (countEl) countEl.textContent = `${tableData.total} טיקרים`;
  }

  function updateTable(data) {
    const tbody = document.getElementById('tickersTableBody');
    if (!tbody) return;

    const sorted = sortTableData(data || [], currentSortKey, currentSortDir);
    const start = (currentPage - 1) * currentPageSize;
    const end = start + currentPageSize;
    const pageData = sorted.slice(start, end);

    tbody.innerHTML = '';

    if (!pageData.length) {
      const row = document.createElement('tr');
      row.className = 'phoenix-table__row';
      row.innerHTML = '<td colspan="7" class="phoenix-table__cell phoenix-table__cell--empty">אין נתונים להצגה</td>';
      tbody.appendChild(row);
      return;
    }

    pageData.forEach((t) => {
      const id = t.id ?? t.external_ulid ?? '';
      const row = document.createElement('tr');
      row.className = 'phoenix-table__row';
      row.setAttribute('data-ticker-id', id);

      const symbolCell = document.createElement('td');
      symbolCell.className = 'phoenix-table__cell col-symbol';
      symbolCell.textContent = t.symbol ?? '';
      row.appendChild(symbolCell);

      const priceCell = document.createElement('td');
      priceCell.className = 'phoenix-table__cell col-price phoenix-table__cell--numeric';
      priceCell.setAttribute('dir', 'ltr');
      const priceVal = t.current_price ?? t.currentPrice ?? null;
      const priceSpan = document.createElement('span');
      priceSpan.className = 'numeric-value-positive';
      priceSpan.textContent = formatCurrency(priceVal);
      priceCell.appendChild(priceSpan);
      row.appendChild(priceCell);

      const changeCell = document.createElement('td');
      changeCell.className = 'phoenix-table__cell col-change phoenix-table__cell--numeric';
      changeCell.setAttribute('dir', 'ltr');
      const changeVal = t.daily_change_pct ?? t.dailyChangePct ?? null;
      const changeSpan = document.createElement('span');
      const changeNum = changeVal != null ? Number(changeVal) : null;
      changeSpan.className = changeNum != null && changeNum >= 0 ? 'numeric-value-positive' : 'numeric-value-negative';
      changeSpan.textContent = formatChangePct(changeVal);
      changeCell.appendChild(changeSpan);
      row.appendChild(changeCell);

      const companyCell = document.createElement('td');
      companyCell.className = 'phoenix-table__cell col-company';
      companyCell.textContent = t.company_name ?? t.companyName ?? '';
      row.appendChild(companyCell);

      const typeCell = document.createElement('td');
      typeCell.className = 'phoenix-table__cell col-type';
      const typeBadge = document.createElement('span');
      typeBadge.className = 'phoenix-table__status-badge badge badge--info';
      typeBadge.textContent = t.ticker_type ?? 'STOCK';
      typeCell.appendChild(typeBadge);
      row.appendChild(typeCell);

      const statusCell = document.createElement('td');
      statusCell.className = 'phoenix-table__cell col-status';
      // Prefer status (pending|active|inactive|cancelled); fallback: is_active -> active, !is_active -> cancelled
      const statusCanon = normalizeToCanonicalStatus(t.status) ?? (t.is_active ?? t.isActive ? 'active' : 'cancelled');
      const statusLabel = toHebrewStatus(statusCanon);
      const statusBadge = document.createElement('span');
      statusBadge.className = `phoenix-table__status-badge phoenix-table__status-badge--${statusCanon}`;
      statusBadge.setAttribute('data-status-category', statusCanon);
      statusBadge.textContent = statusLabel || (t.is_active ? 'פתוח' : 'מבוטל');
      statusCell.appendChild(statusBadge);
      row.appendChild(statusCell);

      const actionsCell = document.createElement('td');
      actionsCell.className = 'phoenix-table__cell col-actions phoenix-table__cell--actions';
      actionsCell.innerHTML = `
        <div class="table-actions-tooltip">
          <button class="table-actions-trigger" aria-label="פעולות">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
          <div class="table-actions-menu">
            <button class="table-action-btn js-action-edit" aria-label="ערוך" data-ticker-id="${id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="table-action-btn js-action-delete" aria-label="מחק" data-ticker-id="${id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
      row.appendChild(actionsCell);

      tbody.appendChild(row);
    });

    initActionHandlers();
    initAddButton();
  }

  function updatePagination() {
    const totalPages = Math.max(1, Math.ceil(tableData.total / currentPageSize));
    const start = (currentPage - 1) * currentPageSize + 1;
    const end = Math.min(currentPage * currentPageSize, tableData.total);
    const infoEl = document.getElementById('paginationInfo');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    if (infoEl) infoEl.textContent = `מציג ${start}-${end} מתוך ${tableData.total} רשומות`;
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
  }

  function initSortHandlers() {
    const table = document.getElementById('tickersTable');
    if (!table || !window.PhoenixTableSortManager) return;
    const sortManager = new window.PhoenixTableSortManager(table);
    table.addEventListener('phoenix-table-sorted', function (e) {
      const { sortKey, sortDirection } = e.detail || {};
      if (sortKey && sortDirection) {
        currentSortKey = sortKey;
        currentSortDir = sortDirection;
        updateTable(tableData.data);
      }
    });
  }

  function initPaginationHandlers() {
    const pageSizeSelect = document.querySelector('.js-table-page-size[data-table-id="tickersTable"]');
    const prevBtn = document.getElementById('prevPageBtn');
    const nextBtn = document.getElementById('nextPageBtn');
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener('change', function (e) {
        currentPageSize = parseInt(e.target.value) || 25;
        currentPage = 1;
        loadAllData();
      });
    }
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          loadAllData();
        }
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(tableData.total / currentPageSize);
        if (currentPage < totalPages) {
          currentPage++;
          loadAllData();
        }
      });
    }
  }

  function initActionHandlers() {
    document.querySelectorAll('.js-action-edit').forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-ticker-id');
        const t = tableData.data.find((x) => (x.id || x.external_ulid) === id);
        if (t) handleEdit(t);
      };
    });
    document.querySelectorAll('.js-action-delete').forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-ticker-id');
        handleDelete(id);
      };
    });
  }

  function initAddButton() {
    const addBtn = document.querySelector('.js-add-ticker');
    if (addBtn) {
      addBtn.onclick = () => handleAdd();
    }
  }

  async function loadAllData() {
    try {
      const result = await loadTickersData();
      tableData = result.table;
      updateSummary(result.summary);
      updateTable(tableData.data);
      updatePagination();
    } catch (e) {
      maskedLog('[Tickers] Error:', { errorCode: e?.code });
    }
  }

  function handleAdd() {
    showTickerFormModal(null, async (formData) => {
      await sharedServices.init();
      await sharedServices.post('/tickers', formData);
      await loadAllData();
    });
  }

  function handleEdit(ticker) {
    showTickerFormModal(ticker, async (formData) => {
      const id = ticker.id ?? ticker.external_ulid;
      await sharedServices.init();
      await sharedServices.put(`/tickers/${id}`, formData);
      await loadAllData();
    });
  }

  async function handleDelete(tickerId) {
    if (!confirm('האם אתה בטוח שברצונך למחוק את הטיקר?')) return;
    try {
      await sharedServices.init();
      await sharedServices.delete(`/tickers/${tickerId}`);
      await loadAllData();
    } catch (e) {
      maskedLog('[Tickers] Delete error:', { errorCode: e?.code });
      alert('שגיאה במחיקת הטיקר');
    }
  }

  function runInit() {
    initSortHandlers();
    initPaginationHandlers();
    if (isAuthenticated()) {
      loadAllData();
    } else {
      updateSummary({ total_tickers: 0, active_tickers: 0 });
      updateTable([]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runInit);
  } else {
    runInit();
  }
})();
