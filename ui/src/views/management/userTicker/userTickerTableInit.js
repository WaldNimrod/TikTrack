/**
 * User Ticker Table Init - הטיקרים שלי
 * ----------------------------------------
 * Data: GET /me/tickers
 * Add: POST /me/tickers (existing ticker_id or new symbol)
 * Remove: DELETE /me/tickers/{ticker_id}
 * Per: TEAM_90_TO_TEAM_10_USER_TICKERS_IMPLEMENTATION_BRIEF, TEAM_10_USER_TICKERS_WORK_PLAN
 */

import sharedServices from '../../../components/core/sharedServices.js';
import { showUserTickerAddModal } from './userTickerAddForm.js';
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

(function initUserTickerTable() {
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

  async function loadUserTickersData() {
    try {
      await sharedServices.init();
      const res = await sharedServices.get('/me/tickers', {});
      const data = res?.data ?? res ?? [];
      const arr = Array.isArray(data) ? data : [];
      return {
        table: { data: arr, total: res?.total ?? arr.length },
        summary: {
          total_tickers: arr.length,
          active_tickers: arr.filter((t) => t.is_active !== false && t.isActive !== false).length,
        },
      };
    } catch (e) {
      maskedLog('[UserTicker] Error loading /me/tickers:', { errorCode: e?.code, status: e?.status });
      return { table: { data: [], total: 0 }, summary: { total_tickers: 0, active_tickers: 0 } };
    }
  }

  async function loadAvailableTickers() {
    try {
      await sharedServices.init();
      const res = await sharedServices.get('/tickers', {});
      const data = res?.data ?? res ?? [];
      return Array.isArray(data) ? data : [];
    } catch (e) {
      maskedLog('[UserTicker] GET /tickers for add-dropdown failed (may be admin-only):', { status: e?.status });
      return [];
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
    const tbody = document.getElementById('userTickersTableBody');
    if (!tbody) return;

    const sorted = sortTableData(data || [], currentSortKey, currentSortDir);
    const start = (currentPage - 1) * currentPageSize;
    const end = start + currentPageSize;
    const pageData = sorted.slice(start, end);

    tbody.innerHTML = '';

    if (!pageData.length) {
      const row = document.createElement('tr');
      row.className = 'phoenix-table__row';
      row.innerHTML = '<td colspan="7" class="phoenix-table__cell phoenix-table__cell--empty">אין טיקרים ברשימה שלי. הוסף טיקר קיים או טיקר חדש.</td>';
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
      typeBadge.textContent = t.ticker_type ?? t.tickerType ?? 'STOCK';
      typeCell.appendChild(typeBadge);
      row.appendChild(typeCell);

      const statusCell = document.createElement('td');
      statusCell.className = 'phoenix-table__cell col-status';
      const statusCanon = normalizeToCanonicalStatus(t.status) ?? (t.is_active ?? t.isActive ? 'active' : 'cancelled');
      const statusLabel = toHebrewStatus(statusCanon);
      const statusBadge = document.createElement('span');
      statusBadge.className = `phoenix-table__status-badge phoenix-table__status-badge--${statusCanon}`;
      statusBadge.setAttribute('data-status-category', statusCanon);
      statusBadge.textContent = statusLabel || (t.is_active !== false ? 'פעיל' : 'לא פעיל');
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
            <button class="table-action-btn js-action-view" aria-label="צפה" data-ticker-id="${id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button class="table-action-btn js-action-delete" aria-label="הסר מרשימה" data-ticker-id="${id}">
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
    const table = document.getElementById('userTickersTable');
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
    const pageSizeSelect = document.querySelector('.js-table-page-size[data-table-id="userTickersTable"]');
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
    document.querySelectorAll('.js-action-view').forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-ticker-id');
        const t = tableData.data.find((x) => (x.id || x.external_ulid) === id);
        if (t) handleView(t);
      };
    });
    document.querySelectorAll('.js-action-delete').forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-ticker-id');
        handleRemove(id);
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
      const result = await loadUserTickersData();
      tableData = result.table;
      updateSummary(result.summary);
      updateTable(tableData.data);
      updatePagination();
    } catch (e) {
      maskedLog('[UserTicker] Error:', { errorCode: e?.code });
    }
  }

  function handleView(ticker) {
    const sym = ticker.symbol ?? '';
    const name = ticker.company_name ?? ticker.companyName ?? '';
    const price = formatCurrency(ticker.current_price ?? ticker.currentPrice);
    const msg = `${sym}${name ? ` — ${name}` : ''}\nמחיר: ${price}`;
    alert(msg);
  }

  async function handleAdd() {
    const [userTickers, availableTickers] = await Promise.all([
      loadUserTickersData(),
      loadAvailableTickers(),
    ]);
    const userTickerIds = (userTickers.table.data || []).map((t) => t.id ?? t.external_ulid).filter(Boolean);

    showUserTickerAddModal({
      availableTickers,
      userTickerIds,
      onSuccess: () => loadAllData(),
    });
  }

  async function handleRemove(tickerId) {
    if (!confirm('האם להסיר את הטיקר מהרשימה שלי?')) return;
    try {
      await sharedServices.init();
      await sharedServices.delete(`/me/tickers/${tickerId}`);
      await loadAllData();
    } catch (e) {
      maskedLog('[UserTicker] DELETE error:', { errorCode: e?.code, status: e?.status });
      alert('שגיאה בהסרת הטיקר מהרשימה');
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
