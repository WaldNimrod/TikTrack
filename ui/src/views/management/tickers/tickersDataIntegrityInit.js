/**
 * Tickers Data Integrity Widget
 * TEAM_20_TO_TEAMS_10_30_TICKER_DATA_INTEGRITY_UI_REQUEST
 * TEAM_20_TO_TEAM_30_INDICATORS_DATA_INTEGRITY_UPDATE — backfill banner when indicators/history insufficient
 * בקרת תקינות נתוני טיקר — דרופדאון + כפתור בדוק + פירוט + לוג
 */

import sharedServices from '../../../components/core/sharedServices.js';
import { maskedLog } from '../../../utils/maskedLog.js';

const GAP_ICONS = { OK: '✅', NO_DATA: '⚠️', INSUFFICIENT: '⚠️', STALE: '⚠️' };

function formatTs(ts) {
  if (!ts) return '—';
  try {
    const d = new Date(ts);
    return d.toLocaleString('he-IL', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  } catch {
    return String(ts);
  }
}

(async function initDataIntegrity() {
  'use strict';

  const selectEl = document.getElementById('tickerDataIntegritySelect');
  const detailEl = document.getElementById('tickerDataIntegrityDetail');
  const gapsEl = document.getElementById('tickerDataIntegrityGaps');
  const logEl = document.getElementById('tickerDataIntegrityLog');

  if (!selectEl || !detailEl) return;

  let tickersList = [];

  async function loadTickers() {
    try {
      await sharedServices.init();
      const res = await sharedServices.get('/tickers', {});
      const data = res?.data ?? res ?? [];
      tickersList = Array.isArray(data) ? data : [];
      return tickersList;
    } catch (e) {
      maskedLog('[Tickers Data Integrity] Failed to load tickers:', e);
      return [];
    }
  }

  function populateSelect(list) {
    selectEl.innerHTML = '<option value="">— בחר טיקר —</option>';
    list.forEach((t) => {
      const opt = document.createElement('option');
      opt.value = t.id ?? t.external_ulid ?? '';
      opt.textContent = `${t.symbol ?? ''}${t.company_name ? ' - ' + t.company_name : ''}`;
      selectEl.appendChild(opt);
    });
  }

  async function doCheck() {
    const tickerId = selectEl.value?.trim();
    if (!tickerId) {
      detailEl.innerHTML = '<p class="data-integrity-empty">נא לבחור טיקר</p>';
      gapsEl.textContent = '—';
      logEl.innerHTML = '';
      return;
    }

    detailEl.innerHTML = '<p class="data-integrity-loading">בודק...</p>';
    gapsEl.textContent = '—';
    logEl.innerHTML = '';

    try {
      await sharedServices.init();
      const data = await sharedServices.get(`/tickers/${tickerId}/data-integrity`, {});

      const eod = data?.eod_prices ?? {};
      const intra = data?.intraday_prices ?? {};
      const hist = data?.history_250d ?? {};

      const eodIcon = GAP_ICONS[eod.gap_status] ?? '—';
      const intraIcon = GAP_ICONS[intra.gap_status] ?? '—';
      const histIcon = GAP_ICONS[hist.gap_status] ?? '—';

      const eodLine = eod.has_data
        ? `${eodIcon} ${eod.row_count ?? 0} שורות | אחרון: ${formatTs(eod.latest_fetched_at)}`
        : `${intraIcon} אין נתונים${eod.note ? ' (' + eod.note + ')' : ''}`;

      const intraLine = intra.has_data
        ? `${intraIcon} ${intra.row_count ?? 0} שורות | אחרון: ${formatTs(intra.latest_fetched_at)}`
        : `${intraIcon} אין נתונים${intra.note ? ' (' + intra.note + ')' : ''}`;

      const histLine = hist.has_data
        ? `${histIcon} ${hist.row_count ?? 0} שורות | אחרון: ${formatTs(hist.latest_fetched_at)}${hist.note ? ' — ' + hist.note : ''}`
        : `${histIcon} אין נתונים${hist.note ? ' (' + hist.note + ')' : ''}`;

      const ind = data?.indicators ?? {};
      const fmt = (v) => (v != null && v !== '' ? String(v) : '—');
      const indRows = [
        ['ATR(14)', fmt(ind.atr_14)],
        ['MA(20)', fmt(ind.ma_20)],
        ['MA(50)', fmt(ind.ma_50)],
        ['MA(150)', fmt(ind.ma_150)],
        ['MA(200)', fmt(ind.ma_200)],
        ['CCI(20)', fmt(ind.cci_20)],
        ['שווי שוק (Market Cap)', fmt(ind.market_cap)],
      ]
        .map(([lbl, val]) => `<div class="data-integrity-detail-row"><strong>${lbl}:</strong> <span dir="ltr">${val}</span></div>`)
        .join('');

      const needBackfill = !ind || Object.keys(ind).length === 0 || hist.gap_status === 'INSUFFICIENT';
      const backfillBanner = needBackfill
        ? `<p class="data-integrity-backfill-banner">נדרש History Backfill ל־ATR/MA/CCI <button type="button" id="tickerDataIntegrityBackfillBtn" class="data-integrity-backfill-btn" data-ticker-id="${tickerId}">הפעל History Backfill</button></p>`
        : '';

      detailEl.innerHTML = `
        <div class="data-integrity-detail-row"><strong>נתוני EOD:</strong> ${eodLine}</div>
        <div class="data-integrity-detail-row"><strong>נתוני Intraday:</strong> ${intraLine}</div>
        <div class="data-integrity-detail-row"><strong>היסטוריה 250d:</strong> ${histLine}</div>
        <div class="data-integrity-indicators">
          <div class="data-integrity-detail-row"><strong>אינדיקטורים (מ־250d):</strong></div>
          ${backfillBanner}
          ${indRows}
        </div>
      `;

      const gaps = data?.gaps_summary ?? [];
      gapsEl.textContent = gaps.length > 0 ? gaps.join('; ') : 'אין חוסרים';

      const lastUpdates = data?.last_updates ?? [];
      if (lastUpdates.length > 0) {
        logEl.innerHTML = `
          <table class="phoenix-table phoenix-table--compact" role="table">
            <thead><tr><th>תאריך מחיר</th><th>נטען</th><th>מחיר</th></tr></thead>
            <tbody>
              ${lastUpdates
                .map(
                  (u) =>
                    `<tr><td>${formatTs(u.price_timestamp)}</td><td>${formatTs(u.fetched_at)}</td><td dir="ltr">${u.price ?? '—'}</td></tr>`
                )
                .join('')}
            </tbody>
          </table>
        `;
      } else {
        logEl.innerHTML = '<p class="data-integrity-empty">אין עדכונים אחרונים</p>';
      }
    } catch (e) {
      maskedLog('[Tickers Data Integrity] Check failed:', e);
      detailEl.innerHTML = `<p class="data-integrity-error">שגיאה: ${e?.message ?? 'לא ניתן לטעון'}</p>`;
      gapsEl.textContent = '—';
      logEl.innerHTML = '';
    }
  }

  async function doBackfill(tickerId) {
    if (!tickerId) return;
    const btn = document.getElementById('tickerDataIntegrityBackfillBtn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'מריץ...';
    }
    try {
      await sharedServices.init();
      await sharedServices.post(`/tickers/${tickerId}/history-backfill`, {});
      if (btn) {
        btn.textContent = 'הושלם — רענן תוצאות';
      }
      doCheck();
    } catch (e) {
      maskedLog('[Tickers Data Integrity] Backfill failed:', e);
      const status = e?.status ?? e?.code;
      const msg = status === 404 || status === 501
        ? 'ממתין ל־API — נא לפנות ל־Team 20'
        : (e?.message ?? 'שגיאה');
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'הפעל History Backfill';
      }
      detailEl.insertAdjacentHTML(
        'beforeend',
        `<p class="data-integrity-error">Backfill: ${msg}</p>`
      );
    }
  }

  detailEl.addEventListener('click', (e) => {
    const btn = e.target.closest('#tickerDataIntegrityBackfillBtn');
    if (btn) {
      const tickerId = btn.dataset.tickerId || selectEl.value?.trim();
      if (tickerId) doBackfill(tickerId);
    }
  });

  const list = await loadTickers();
  populateSelect(list);

  selectEl.addEventListener('change', doCheck);
})();
