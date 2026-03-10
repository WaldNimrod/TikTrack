/**
 * Tickers Table Initialization - ניהול טיקרים
 * CRUD: הוספה, עריכה, מחיקה
 * S002-P003-WP001 (D22): filter bar (ticker_type, is_active); loadTickersData params; state across pagination
 */

import sharedServices from '../../../components/core/sharedServices.js';
import { createModal } from '../../../components/shared/PhoenixModal.js';
import { showTickerFormModal } from './tickersForm.js';
import { maskedLog } from '../../../utils/maskedLog.js';
import { toHebrewStatus, normalizeToCanonicalStatus } from '../../../utils/statusAdapter.js';
import { getPriceSourceLabel, formatPriceAsOf, getTrafficLightFromSource } from '../../../utils/priceReliabilityLabels.js';

/** BF-002: Currency symbols per Team 20 API (COUNTRY_TO_CURRENCY, CRYPTO parsing) */
const CURRENCY_SYMBOLS = { USD: '$', EUR: '€', ILS: '₪', GBP: '£', JPY: '¥', USDT: '₮' };
const formatCurrency = (amount, currency = 'USD') => {
  if (amount == null || isNaN(amount)) return '—';
  const sym = CURRENCY_SYMBOLS[currency?.toUpperCase?.()] ?? currency ?? '$';
  return `${sym}${Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
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
  /** Filter state — preserved across pagination (S002-P003-WP001 D22) */
  let filterState = { ticker_type: null, is_active: null };

  function isAuthenticated() {
    try {
      return !!(localStorage.getItem('access_token') || localStorage.getItem('authToken') ||
        sessionStorage.getItem('access_token') || sessionStorage.getItem('authToken'));
    } catch (_) {
      return false;
    }
  }

  async function loadTickersData(filters = {}) {
    try {
      await sharedServices.init();
      const params = {};
      if (filters.ticker_type) params.ticker_type = filters.ticker_type;
      if (filters.is_active !== undefined && filters.is_active !== null && filters.is_active !== '') {
        params.is_active = filters.is_active === true || filters.is_active === 'true';
      }
      if (filters.search) params.search = filters.search;
      const [listRes, summaryRes] = await Promise.all([
        sharedServices.get('/tickers', params),
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
      row.innerHTML = '<td colspan="11" class="phoenix-table__cell phoenix-table__cell--empty">אין נתונים להצגה</td>';
      tbody.appendChild(row);
      return;
    }

    pageData.forEach((t) => {
      const id = t.id ?? t.external_ulid ?? '';
      const row = document.createElement('tr');
      row.className = 'phoenix-table__row';
      row.setAttribute('data-ticker-id', id);

      const currency = t.currency ?? 'USD';
      const priceVal = t.current_price ?? t.currentPrice ?? null;
      const priceSource = t.price_source ?? t.priceSource ?? null;
      const priceAsOf = t.price_as_of_utc ?? t.priceAsOfUtc ?? null;
      const lastClose = t.last_close_price ?? t.lastClosePrice ?? null;
      const trafficLight = getTrafficLightFromSource(priceSource);

      const symbolCell = document.createElement('td');
      symbolCell.className = 'phoenix-table__cell col-symbol';
      const symbolWrap = document.createElement('span');
      symbolWrap.className = 'phoenix-table__symbol-with-light';
      const lightSpan = document.createElement('span');
      lightSpan.className = `traffic-light traffic-light--${trafficLight}`;
      lightSpan.setAttribute('aria-label', getPriceSourceLabel(priceSource) || 'מקור מחיר');
      lightSpan.title = getPriceSourceLabel(priceSource) || '';
      symbolWrap.appendChild(lightSpan);
      symbolWrap.appendChild(document.createTextNode(t.symbol ?? ''));
      symbolCell.appendChild(symbolWrap);
      row.appendChild(symbolCell);

      const priceCell = document.createElement('td');
      priceCell.className = 'phoenix-table__cell col-price phoenix-table__cell--numeric';
      priceCell.setAttribute('dir', 'ltr');
      const priceSpan = document.createElement('span');
      priceSpan.className = 'numeric-value-positive';
      priceSpan.textContent = formatCurrency(priceVal, currency);
      priceSpan.setAttribute('data-price-source', priceSource || '');
      priceCell.appendChild(priceSpan);
      row.appendChild(priceCell);

      const sourceCell = document.createElement('td');
      sourceCell.className = 'phoenix-table__cell col-source';
      sourceCell.textContent = getPriceSourceLabel(priceSource) || '—';
      if (priceSource === 'EOD_STALE') sourceCell.classList.add('price-source-stale');
      row.appendChild(sourceCell);

      const lastCloseCell = document.createElement('td');
      lastCloseCell.className = 'phoenix-table__cell col-last-close phoenix-table__cell--numeric';
      lastCloseCell.setAttribute('dir', 'ltr');
      lastCloseCell.textContent = formatCurrency(lastClose, currency);
      row.appendChild(lastCloseCell);

      const asOfCell = document.createElement('td');
      asOfCell.className = 'phoenix-table__cell col-as-of phoenix-table__cell-meta';
      asOfCell.setAttribute('dir', 'ltr');
      asOfCell.textContent = priceAsOf ? formatPriceAsOf(priceAsOf) : '—';
      row.appendChild(asOfCell);

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

      const exchangeCell = document.createElement('td');
      exchangeCell.className = 'phoenix-table__cell col-exchange';
      exchangeCell.textContent = t.exchange_code ?? t.exchangeCode ?? '—';
      row.appendChild(exchangeCell);

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
          <button class="table-actions-trigger" aria-label="פעולות שורה">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="1"></circle>
              <circle cx="12" cy="5" r="1"></circle>
              <circle cx="12" cy="19" r="1"></circle>
            </svg>
          </button>
          <div class="table-actions-menu">
            <button class="table-action-btn js-action-details" aria-label="פרטים" title="פרטים" data-ticker-id="${id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button class="table-action-btn js-action-edit" aria-label="ערוך טיקר" title="ערוך טיקר" data-ticker-id="${id}">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <button class="table-action-btn js-action-delete" aria-label="מחק טיקר" title="מחק טיקר" data-ticker-id="${id}">
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

  function initFilterHandlers() {
    const typeSelect = document.getElementById('tickersFilterType') || document.querySelector('.js-tickers-filter-type');
    const activeBtns = document.querySelectorAll('.js-tickers-filter-active');
    if (typeSelect) {
      typeSelect.addEventListener('change', function () {
        filterState.ticker_type = this.value || null;
        currentPage = 1;
        loadAllData();
      });
    }
    activeBtns.forEach((btn) => {
      btn.addEventListener('click', function () {
        const val = this.getAttribute('data-is-active');
        filterState.is_active = val === '' ? null : val === 'true';
        activeBtns.forEach((b) => b.classList.remove('filter-icon-btn--active'));
        this.classList.add('filter-icon-btn--active');
        currentPage = 1;
        loadAllData();
      });
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
    document.querySelectorAll('.js-action-details').forEach((btn) => {
      btn.onclick = (e) => {
        e.preventDefault();
        const id = btn.getAttribute('data-ticker-id');
        if (id) handleDetails(id);
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
        handleDelete(id);
      };
    });
  }

  async function handleDetails(tickerId) {
    try {
      await sharedServices.init();
      const [tickerRes, integrityRes] = await Promise.all([
        sharedServices.get(`/tickers/${tickerId}`, {}),
        sharedServices.get(`/tickers/${tickerId}/data-integrity`, {}).catch(() => ({})),
      ]);
      const t = tickerRes?.data ?? tickerRes ?? {};
      const data = integrityRes?.data ?? integrityRes ?? {};
      const eod = data?.eod_prices ?? {};
      const intra = data?.intraday_prices ?? {};
      const hist = data?.history_250d ?? {};
      const fmt = (ts) => !ts ? '—' : new Date(ts).toLocaleString('he-IL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
      const gapLabel = (g) => (g === 'OK' ? 'מלא' : g === 'NO_DATA' ? 'אין נתון' : g === 'INSUFFICIENT' ? 'חלקי' : g || '—');
      const level = (g) => (g === 'OK' ? 'success' : g === 'NO_DATA' || g === 'INSUFFICIENT' ? 'warning' : 'error');
      const eodTs = eod.latest_fetched_at ?? eod.last_update;
      const intraTs = intra.latest_fetched_at ?? intra.last_update;
      const histTs = hist.latest_fetched_at ?? hist.last_update;
      const esc = (v) => (v == null || v === '' ? '—' : String(v).replace(/</g, '&lt;'));
      const curr = t.currency ?? t.currencyCode ?? 'USD';
      const priceVal = t.current_price ?? t.currentPrice ?? null;
      const lastClose = t.last_close_price ?? t.lastClosePrice ?? null;
      const statusCanon = t.status ?? (t.is_active ?? t.isActive ? 'active' : 'cancelled');
      const statusLabel = toHebrewStatus(statusCanon) || (t.is_active ? 'פתוח' : 'מבוטל');
      const editSection = `
        <div class="data-integrity-detail-section">
          <strong>שדות עריכה</strong>
          <div class="data-integrity-detail-row"><strong>סמל</strong><span dir="ltr">${esc(t.symbol)}</span></div>
          <div class="data-integrity-detail-row"><strong>שם חברה</strong><span>${esc(t.company_name ?? t.companyName)}</span></div>
          <div class="data-integrity-detail-row"><strong>סוג</strong><span>${esc(t.ticker_type ?? t.tickerType)}</span></div>
          <div class="data-integrity-detail-row"><strong>מטבע</strong><span dir="ltr">${esc(curr)}</span></div>
          <div class="data-integrity-detail-row"><strong>בורסה</strong><span dir="ltr">${esc(t.exchange_code ?? t.exchangeCode)}</span></div>
          <div class="data-integrity-detail-row"><strong>סטטוס</strong><span>${esc(statusLabel)}</span></div>
          <div class="data-integrity-detail-row"><strong>מחיר נוכחי</strong><span dir="ltr">${formatCurrency(priceVal, curr)}</span></div>
          <div class="data-integrity-detail-row"><strong>סגירה</strong><span dir="ltr">${formatCurrency(lastClose, curr)}</span></div>
          <div class="data-integrity-detail-row"><strong>מקור</strong><span>${getPriceSourceLabel(t.price_source ?? t.priceSource)}</span></div>
          <div class="data-integrity-detail-row"><strong>עודכן ב</strong><span dir="ltr">${t.price_as_of_utc ?? t.priceAsOfUtc ? formatPriceAsOf(t.price_as_of_utc ?? t.priceAsOfUtc) : '—'}</span></div>
        </div>
      `;
      const marketSection = `
        <tt-section-row class="data-integrity-summary-row">
          <div class="data-integrity-card staleness-level--${level(eod.gap_status)}">
            <div class="data-integrity-card__title">נתוני EOD</div>
            <div class="data-integrity-card__value">${gapLabel(eod.gap_status)} — ${fmt(eodTs)}</div>
          </div>
          <div class="data-integrity-card staleness-level--${level(intra.gap_status)}">
            <div class="data-integrity-card__title">נתוני Intraday</div>
            <div class="data-integrity-card__value">${gapLabel(intra.gap_status)} — ${fmt(intraTs)}</div>
          </div>
          <div class="data-integrity-card staleness-level--${level(hist.gap_status)}">
            <div class="data-integrity-card__title">היסטוריה 250d</div>
            <div class="data-integrity-card__value">${gapLabel(hist.gap_status)} — ${fmt(histTs)}</div>
          </div>
        </tt-section-row>
      `;
      const html = `
        <div class="data-integrity-panel">
          ${editSection}
          <div class="data-integrity-detail-section" style="margin-top:1rem;"><strong>נתוני שוק + סטטוס תקינות</strong></div>
          ${marketSection}
        </div>
      `;
      createModal({
        title: 'פרטי טיקר — בקרת תקינות',
        content: html,
        entity: 'ticker',
        showSaveButton: false,
        cancelButtonText: 'סגור',
        onClose: () => {}
      });
    } catch (e) {
      maskedLog('[Tickers] Data integrity failed:', { errorCode: e?.code, status: e?.status });
      createModal({
        title: 'שגיאה',
        content: `<p>${String(e?.message ?? 'לא ניתן לטעון בקרת תקינות').replace(/</g, '&lt;')}</p>`,
        showSaveButton: false,
        cancelButtonText: 'סגור'
      });
    }
  }

  function initAddButton() {
    const addBtn = document.querySelector('.js-add-ticker');
    if (addBtn) {
      addBtn.onclick = () => handleAdd();
    }
  }

  async function loadAllData() {
    try {
      const result = await loadTickersData(filterState);
      tableData = result.table;
      updateSummary(result.summary);
      updateTable(tableData.data);
      updatePagination();
      if (typeof window.updateStalenessClock === 'function' && tableData.data?.length > 0) {
        let maxTs = null;
        for (const t of tableData.data) {
          const ts = t.price_as_of_utc ?? t.priceAsOfUtc ?? null;
          if (ts && (!maxTs || new Date(ts) > new Date(maxTs))) maxTs = ts;
        }
        if (maxTs) {
          window.updateStalenessClock('ok', { price_timestamp: maxTs, fetched_at: maxTs }, null);
        }
      }
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
    createModal({
      title: 'מחיקת טיקר',
      content: '<p>האם אתה בטוח שברצונך למחוק את הטיקר?</p>',
      entity: 'ticker',
      showSaveButton: true,
      confirmMode: true,
      saveButtonText: 'מחיקה',
      cancelButtonText: 'ביטול',
      onSave: async () => {
        try {
          await sharedServices.init();
          await sharedServices.delete(`/tickers/${tickerId}`);
          document.getElementById('phoenix-modal-backdrop')?.remove();
          await loadAllData();
        } catch (e) {
          maskedLog('[Tickers] Delete error:', { errorCode: e?.code, status: e?.status });
          const msg = String(e?.message ?? e?.detail ?? 'שגיאה במחיקת הטיקר').trim();
          const escaped = String(msg).replace(/</g, '&lt;').replace(/>/g, '&gt;');
          document.getElementById('phoenix-modal-backdrop')?.remove();
          createModal({ title: 'שגיאה במחיקה', content: `<p>${escaped}</p>`, showSaveButton: false, cancelButtonText: 'ביטול' });
        }
      }
    });
  }

  function runInit() {
    initFilterHandlers();
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
