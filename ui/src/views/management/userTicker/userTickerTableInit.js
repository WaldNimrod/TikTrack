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
import { showUserTickerEditModal } from './userTickerEditForm.js';
import { createModal } from '../../../components/shared/PhoenixModal.js';
import { maskedLog } from '../../../utils/maskedLog.js';
import { toHebrewStatus, normalizeToCanonicalStatus } from '../../../utils/statusAdapter.js';
import { getPriceSourceLabel, getPriceSourceBadgeHTML, formatPriceAsOf } from '../../../utils/priceReliabilityLabels.js';
import { formatDailyChange } from '../../../utils/formatChange.js';

const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', ILS: '₪', GBP: '£', JPY: '¥', USDT: '₮' };
const formatCurrency = (amount, currency = 'USD') => {
  if (amount == null || isNaN(amount)) return '—';
  const sym = CURRENCY_SYMBOLS[currency?.toUpperCase?.()] ?? currency ?? '$';
  return `${sym}${Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
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
      row.innerHTML = '<td colspan="9" class="phoenix-table__cell phoenix-table__cell--empty">אין טיקרים ברשימה שלי. הוסף טיקר קיים או טיקר חדש.</td>';
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
      const displayVal = (t.display_name || t.displayName || t.symbol || '').trim() || t.symbol || '';
      symbolCell.textContent = displayVal;
      row.appendChild(symbolCell);

      const priceCell = document.createElement('td');
      priceCell.className = 'phoenix-table__cell col-price phoenix-table__cell--numeric';
      priceCell.setAttribute('dir', 'ltr');
      const priceVal = t.current_price ?? t.currentPrice ?? null;
      const priceSource = t.price_source ?? t.priceSource ?? null;
      const priceAsOf = t.price_as_of_utc ?? t.priceAsOfUtc ?? null;
      const lastClose = t.last_close_price ?? t.lastClosePrice ?? null;
      const curr = t.currency ?? t.currencyCode ?? 'USD';
      const priceSpan = document.createElement('span');
      priceSpan.className = 'numeric-value-positive';
      priceSpan.textContent = formatCurrency(priceVal, curr);
      priceSpan.setAttribute('data-price-source', priceSource || '');
      priceCell.appendChild(priceSpan);
      const asOfSpan = document.createElement('div');
      asOfSpan.className = 'price-as-of phoenix-table__cell-meta';
      asOfSpan.textContent = formatPriceAsOf(priceAsOf);
      priceCell.appendChild(asOfSpan);
      row.appendChild(priceCell);

      const sourceCell = document.createElement('td');
      sourceCell.className = 'phoenix-table__cell col-source';
      sourceCell.innerHTML = getPriceSourceBadgeHTML(priceSource);
      row.appendChild(sourceCell);

      const lastCloseCell = document.createElement('td');
      lastCloseCell.className = 'phoenix-table__cell col-last-close phoenix-table__cell--numeric';
      lastCloseCell.setAttribute('dir', 'ltr');
      lastCloseCell.textContent = formatCurrency(lastClose, curr);
      row.appendChild(lastCloseCell);

      const changeCell = document.createElement('td');
      changeCell.className = 'phoenix-table__cell col-change phoenix-table__cell--numeric';
      changeCell.setAttribute('dir', 'ltr');
      const changeVal = t.daily_change_pct ?? t.dailyChangePct ?? null;
      const changeSpan = document.createElement('span');
      const changeNum = changeVal != null ? Number(changeVal) : null;
      changeSpan.className = changeNum != null && changeNum >= 0 ? 'numeric-value-positive' : 'numeric-value-negative';
      changeSpan.textContent = formatDailyChange(changeVal, priceVal, lastClose, curr);
      changeCell.appendChild(changeSpan);
      row.appendChild(changeCell);

      const companyCell = document.createElement('td');
      companyCell.className = 'phoenix-table__cell col-company';
      companyCell.textContent = t.company_name ?? t.companyName ?? '';
      row.appendChild(companyCell);

      const typeCell = document.createElement('td');
      typeCell.className = 'phoenix-table__cell col-type';
      const typeBadge = document.createElement('span');
      const rawType = (t.ticker_type ?? t.tickerType ?? 'STOCK').toUpperCase();
      const knownTypes = ['STOCK', 'ETF', 'OPTION', 'FUTURE', 'FOREX', 'CRYPTO', 'INDEX'];
      const tickerType = knownTypes.includes(rawType) ? rawType : 'OTHER';
      typeBadge.className = `ticker-type-badge ticker-type-badge--${tickerType}`;
      typeBadge.textContent = rawType;
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
            <button class="table-action-btn js-action-view" aria-label="צפה בפרטי טיקר" title="צפה בפרטי טיקר" data-ticker-id="${id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button class="table-action-btn js-action-note" aria-label="הוסף הערה לטיקר" title="הוסף הערה לטיקר" data-ticker-id="${id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </button>
            <button class="table-action-btn js-action-edit" aria-label="שנה שם תצוגה" title="שנה שם תצוגה" data-ticker-id="${id}" data-edits="display_name">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="table-action-btn js-action-delete" aria-label="הסר מרשימה" title="הסר מרשימה" data-ticker-id="${id}">
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
    document.querySelectorAll('.js-action-note').forEach((btn) => {
      btn.onclick = async (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-ticker-id');
        if (!id) return;
        const { openNotesForm } = await import('../../data/notes/notesForm.js');
        openNotesForm(null, { parent_type: 'ticker', parent_id: id });
      };
    });
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
    const displayName = (ticker.display_name || ticker.displayName || '').trim() || sym;
    const name = ticker.company_name ?? ticker.companyName ?? '';
    const curr = ticker.currency ?? ticker.currencyCode ?? 'USD';
    const price = formatCurrency(ticker.current_price ?? ticker.currentPrice, curr);
    const change = formatDailyChange(
      ticker.daily_change_pct ?? ticker.dailyChangePct,
      ticker.current_price ?? ticker.currentPrice,
      ticker.last_close_price ?? ticker.lastClosePrice,
      curr
    );
    const sourceBadge = getPriceSourceBadgeHTML(ticker.price_source ?? ticker.priceSource ?? '');
    const asOf = formatPriceAsOf(ticker.price_as_of_utc ?? ticker.priceAsOfUtc ?? null);
    const lastClose = formatCurrency(ticker.last_close_price ?? ticker.lastClosePrice ?? null, curr);
    const html = `
      <div class="phoenix-form">
        <div class="form-group"><strong>סמל:</strong> ${sym}</div>
        ${displayName !== sym ? `<div class="form-group"><strong>שם תצוגה:</strong> ${displayName}</div>` : ''}
        <div class="form-group"><strong>שם חברה:</strong> ${name || '—'}</div>
        <div class="form-group"><strong>מחיר:</strong> ${price}</div>
        <div class="form-group"><strong>מקור:</strong> ${sourceBadge}</div>
        <div class="form-group"><strong>עודכן ב:</strong> ${asOf}</div>
        <div class="form-group"><strong>סגירה:</strong> ${lastClose}</div>
        <div class="form-group"><strong>שינוי יומי:</strong> ${change}</div>
      </div>
    `;
    createModal({
      title: 'פרטי טיקר',
      content: html,
      entity: 'user_tickers',
      showSaveButton: false,
      cancelButtonText: 'ביטול',
      onClose: () => {}
    });
    const cancelBtn = document.querySelector('.phoenix-modal__cancel-btn');
    if (cancelBtn) cancelBtn.textContent = 'סגור';
  }

  function handleEdit(ticker) {
    showUserTickerEditModal({
      ticker,
      onSuccess: () => loadAllData()
    });
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
    createModal({
      title: 'הסרת טיקר',
      content: '<p>האם להסיר את הטיקר מהרשימה שלי?</p>',
      entity: 'user_tickers',
      showSaveButton: true,
      confirmMode: true,
      saveButtonText: 'הסרה',
      cancelButtonText: 'ביטול',
      onSave: async () => {
        try {
          await sharedServices.init();
          await sharedServices.delete(`/me/tickers/${tickerId}`);
          document.getElementById('phoenix-modal-backdrop')?.remove();
          await loadAllData();
        } catch (e) {
          maskedLog('[UserTicker] DELETE error:', { errorCode: e?.code, status: e?.status });
          createModal({
            title: 'שגיאה',
            content: '<p>שגיאה בהסרת הטיקר מהרשימה</p>',
            showSaveButton: false,
            cancelButtonText: 'ביטול'
          });
        }
      }
    });
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
