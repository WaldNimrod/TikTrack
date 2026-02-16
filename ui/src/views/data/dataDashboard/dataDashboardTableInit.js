/**
 * Data Dashboard Table Init
 * DATA_DASHBOARD_SPEC — טבלה 1 (שערים), טבלה 2 (היסטוריה + דרופדאון)
 * מקור: GET /api/v1/reference/exchange-rates
 */

import sharedServices from '../../../components/core/sharedServices.js';
import { maskedLog } from '../../../utils/maskedLog.js';

(function initDataDashboard() {
  'use strict';

  let exchangeRates = [];
  let staleness = 'ok';

  const STALENESS_LABELS = { ok: 'מעודכן', warning: 'אזהרה (>15 דק)', na: 'לא מעודכן' };

  function formatDateTime(isoStr) {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('he-IL', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (_) {
      return String(isoStr);
    }
  }

  function formatRate(rate) {
    if (rate == null || isNaN(rate)) return '—';
    return Number(rate).toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 8 });
  }

  function isAuthenticated() {
    try {
      return !!(localStorage.getItem('access_token') || localStorage.getItem('authToken') ||
        sessionStorage.getItem('access_token') || sessionStorage.getItem('authToken'));
    } catch (_) {
      return false;
    }
  }

  async function fetchExchangeRates() {
    try {
      await sharedServices.init();
      const res = await sharedServices.get('/reference/exchange-rates', {});
      const data = res?.data ?? res ?? [];
      exchangeRates = Array.isArray(data) ? data : [];
      staleness = res?.staleness ?? 'ok';
      return { data: exchangeRates, staleness };
    } catch (e) {
      maskedLog('[Data Dashboard] Error fetching exchange rates:', { errorCode: e?.code });
      exchangeRates = [];
      staleness = 'na';
      return { data: [], staleness };
    }
  }

  function updateSummary(data, stalenessVal) {
    const totalEl = document.getElementById('totalRates');
    const stalenessEl = document.getElementById('ratesStaleness');
    const countEl = document.getElementById('exchangeRatesCount');
    if (totalEl) totalEl.textContent = data?.length ?? 0;
    if (stalenessEl) stalenessEl.textContent = STALENESS_LABELS[stalenessVal] ?? stalenessVal;
    if (countEl) countEl.textContent = `${data?.length ?? 0} שערים`;
  }

  function updateTable1(data) {
    const tbody = document.getElementById('exchangeRatesTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    if (!data || data.length === 0) {
      const row = document.createElement('tr');
      row.className = 'phoenix-table__row';
      row.innerHTML = '<td colspan="3" class="phoenix-table__cell phoenix-table__cell--empty">אין נתונים להצגה</td>';
      tbody.appendChild(row);
      return;
    }

    data.forEach((r) => {
      const from = r.from_currency ?? r.fromCurrency ?? '';
      const to = r.to_currency ?? r.toCurrency ?? '';
      const rate = r.conversion_rate ?? r.conversionRate ?? null;
      const syncTime = r.last_sync_time ?? r.lastSyncTime ?? null;

      const tr = document.createElement('tr');
      tr.className = 'phoenix-table__row';
      tr.setAttribute('data-pair', `${from}/${to}`);

      const pairCell = document.createElement('td');
      pairCell.className = 'phoenix-table__cell col-pair';
      pairCell.textContent = `${from}/${to}`;
      tr.appendChild(pairCell);

      const rateCell = document.createElement('td');
      rateCell.className = 'phoenix-table__cell col-rate phoenix-table__cell--numeric';
      rateCell.setAttribute('dir', 'ltr');
      rateCell.textContent = formatRate(rate);
      tr.appendChild(rateCell);

      const timeCell = document.createElement('td');
      timeCell.className = 'phoenix-table__cell col-time';
      timeCell.textContent = formatDateTime(syncTime);
      tr.appendChild(timeCell);

      tbody.appendChild(tr);
    });
  }

  function updateDropdown(data) {
    const select = document.getElementById('historyRateSelect');
    if (!select) return;

    select.innerHTML = '<option value="">— לבחור שער —</option>';
    (data || []).forEach((r) => {
      const from = r.from_currency ?? r.fromCurrency ?? '';
      const to = r.to_currency ?? r.toCurrency ?? '';
      const value = `${from}/${to}`;
      const opt = document.createElement('option');
      opt.value = value;
      opt.textContent = value;
      select.appendChild(opt);
    });
  }

  function updateTable2(selectedPair) {
    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    if (!selectedPair) {
      const row = document.createElement('tr');
      row.className = 'phoenix-table__row';
      row.innerHTML = '<td colspan="2" class="phoenix-table__cell phoenix-table__cell--empty">לבחור זוג מטבעות למעלה</td>';
      tbody.appendChild(row);
      return;
    }

    const [from, to] = selectedPair.split('/');
    const rate = exchangeRates.find(
      (r) =>
        (r.from_currency ?? r.fromCurrency) === from &&
        (r.to_currency ?? r.toCurrency) === to
    );

    if (!rate) {
      const row = document.createElement('tr');
      row.className = 'phoenix-table__row';
      row.innerHTML = '<td colspan="2" class="phoenix-table__cell phoenix-table__cell--empty">אין נתונים לשער זה</td>';
      tbody.appendChild(row);
      return;
    }

    const convRate = rate.conversion_rate ?? rate.conversionRate;
    const syncTime = rate.last_sync_time ?? rate.lastSyncTime;

    const tr = document.createElement('tr');
    tr.className = 'phoenix-table__row';
    const timeCell = document.createElement('td');
    timeCell.className = 'phoenix-table__cell col-datetime';
    timeCell.textContent = formatDateTime(syncTime);
    const rateCell = document.createElement('td');
    rateCell.className = 'phoenix-table__cell col-rate phoenix-table__cell--numeric';
    rateCell.setAttribute('dir', 'ltr');
    rateCell.textContent = formatRate(convRate);
    tr.appendChild(timeCell);
    tr.appendChild(rateCell);
    tbody.appendChild(tr);
  }

  async function loadAll() {
    const { data, staleness: s } = await fetchExchangeRates();
    staleness = s;
    updateSummary(data, staleness);
    updateTable1(data);
    updateDropdown(data);
    const select = document.getElementById('historyRateSelect');
    updateTable2(select?.value || null);
  }

  function initHandlers() {
    const refreshBtn = document.querySelector('.js-refresh-rates');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => loadAll());
    }

    const historySelect = document.getElementById('historyRateSelect');
    if (historySelect) {
      historySelect.addEventListener('change', function () {
        updateTable2(this.value || null);
      });
    }
  }

  function run() {
    initHandlers();
    if (isAuthenticated()) {
      loadAll();
    } else {
      updateSummary([], 'na');
      updateTable1([]);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
