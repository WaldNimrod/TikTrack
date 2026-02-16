/**
 * Tickers Data Integrity Widget
 * TEAM_20_TO_TEAMS_10_30_TICKER_DATA_INTEGRITY_UI_REQUEST
 * TEAM_20_TO_TEAM_30_INDICATORS_DATA_INTEGRITY_UPDATE — backfill banner when indicators/history insufficient
 * TEAM_20_TO_TEAM_30_SMART_HISTORY_FILL_MANDATE — force_reload (Admin only)
 * בקרת תקינות נתוני טיקר — דרופדאון + פירוט + חוסרים
 */

import sharedServices from '../../../components/core/sharedServices.js';
import authService from '../../../cubes/identity/services/auth.js';
import { maskedLog } from '../../../utils/maskedLog.js';

function gapToLevel(gap) {
  if (gap === 'OK') return 'success';
  if (gap === 'NO_DATA' || gap === 'INSUFFICIENT') return 'warning';
  return 'error';
}

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
  const backfillBannerEl = document.getElementById('tickerDataIntegrityBackfillBanner');
  const gapsRowEl = document.getElementById('tickerDataIntegrityGapsRow');
  const panelEl = detailEl?.closest('.data-integrity-panel');

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
    selectEl.innerHTML = '<option value="">— לבחור טיקר —</option>';
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
      if (backfillBannerEl) backfillBannerEl.innerHTML = '';
      if (gapsRowEl) {
        if (gapsRowEl.parentNode) gapsRowEl.parentNode.removeChild(gapsRowEl);
        gapsRowEl.hidden = true;
        if (panelEl) panelEl.appendChild(gapsRowEl);
      }
      detailEl.innerHTML = '<p class="data-integrity-empty-badge">לבחור טיקר לבדיקה</p>';
      return;
    }

    if (backfillBannerEl) backfillBannerEl.innerHTML = '';
    if (gapsRowEl) {
      if (gapsRowEl.parentNode) gapsRowEl.parentNode.removeChild(gapsRowEl);
      gapsRowEl.hidden = true;
      if (panelEl) panelEl.appendChild(gapsRowEl);
    }
    detailEl.innerHTML = '<p class="data-integrity-loading">בודק...</p>';
    if (gapsEl) gapsEl.textContent = '—';

    try {
      await sharedServices.init();
      const data = await sharedServices.get(`/tickers/${tickerId}/data-integrity`, {});

      const eod = data?.eod_prices ?? {};
      const intra = data?.intraday_prices ?? {};
      const hist = data?.history_250d ?? {};

      const eodLevel = gapToLevel(eod.gap_status);
      const intraLevel = gapToLevel(intra.gap_status);
      const histLevel = gapToLevel(hist.gap_status);

      const eodContent = eod.has_data
        ? `${eod.row_count ?? 0} שורות · אחרון: ${formatTs(eod.latest_fetched_at)}`
        : `אין נתונים${eod.note ? ' · ' + eod.note : ''}`;

      const intraContent = intra.has_data
        ? `${intra.row_count ?? 0} שורות · אחרון: ${formatTs(intra.latest_fetched_at)}`
        : `אין נתונים${intra.note ? ' · ' + intra.note : ''}`;

      const histContent = hist.has_data
        ? `${hist.row_count ?? 0} שורות · אחרון: ${formatTs(hist.latest_fetched_at)}${hist.note ? ' · ' + hist.note : ''}`
        : `אין נתונים${hist.note ? ' · ' + hist.note : ''}`;

      const ind = data?.indicators ?? {};
      const fmt = (v) => (v != null && v !== '' ? String(v) : '—');
      const indItems = [
        ['ATR(14)', fmt(ind.atr_14)],
        ['MA(20)', fmt(ind.ma_20)],
        ['MA(50)', fmt(ind.ma_50)],
        ['MA(150)', fmt(ind.ma_150)],
        ['MA(200)', fmt(ind.ma_200)],
        ['CCI(20)', fmt(ind.cci_20)],
        ['שווי שוק (Market Cap)', fmt(ind.market_cap)],
      ];
      const indRows1 = indItems.slice(0, 4).map(([lbl, val]) => `<div class="data-integrity-detail-row"><strong>${lbl}</strong><span dir="ltr">${val}</span></div>`).join('');
      const indRows2 = indItems.slice(4, 7).map(([lbl, val]) => `<div class="data-integrity-detail-row"><strong>${lbl}</strong><span dir="ltr">${val}</span></div>`).join('');

      const needBackfill = !ind || Object.keys(ind).length === 0 || hist.gap_status === 'INSUFFICIENT';
      const backfillBannerHtml = needBackfill
        ? `<span class="data-integrity-backfill-banner"><span class="data-integrity-backfill-banner__text">נדרש History Backfill ל־ATR/MA/CCI</span><button type="button" id="tickerDataIntegrityBackfillBtn" class="data-integrity-backfill-btn" data-ticker-id="${tickerId}">הפעל History Backfill</button></span>`
        : '';

      if (backfillBannerEl) backfillBannerEl.innerHTML = backfillBannerHtml;

      const dataComplete = (hist?.row_count ?? 0) >= 250 && hist?.gap_status === 'OK';
      const isAdmin = authService.isAdmin();
      const forceReloadBlock = (dataComplete && isAdmin)
        ? `<p class="data-integrity-force-reload-banner">הנתונים מלאים (250 ימים). לטעון מחדש? (יכלול מחיקת כל הנתונים) <button type="button" id="tickerDataIntegrityForceReloadBtn" class="data-integrity-force-reload-btn" data-ticker-id="${tickerId}">טען מחדש (מחיקה)</button></p>`
        : '';

      if (gapsRowEl?.parentNode) gapsRowEl.parentNode.removeChild(gapsRowEl);

      detailEl.innerHTML = `
        <tt-section-row class="data-integrity-summary-row">
          <div class="data-integrity-card staleness-level--${eodLevel}">
            <div class="data-integrity-card__title">נתוני EOD</div>
            <div class="data-integrity-card__value" dir="ltr">${eodContent}</div>
          </div>
          <div class="data-integrity-card staleness-level--${intraLevel}">
            <div class="data-integrity-card__title">נתוני Intraday</div>
            <div class="data-integrity-card__value" dir="ltr">${intraContent}</div>
          </div>
          <div class="data-integrity-card staleness-level--${histLevel}">
            <div class="data-integrity-card__title">היסטוריה 250d</div>
            <div class="data-integrity-card__value" dir="ltr">${histContent}</div>
          </div>
        </tt-section-row>
        <tt-section-row>
          <div class="data-integrity-indicators-header"><strong>אינדיקטורים (מ־250d)</strong></div>
        </tt-section-row>
        <tt-section-row class="data-integrity-indicators-row">
          <div class="data-integrity-indicators-col">
            ${forceReloadBlock}
            ${indRows1}
          </div>
          <div class="data-integrity-indicators-col">
            ${indRows2}
          </div>
        </tt-section-row>
      `;

      if (gapsRowEl) detailEl.appendChild(gapsRowEl);

      const gaps = data?.gaps_summary ?? [];
      if (gapsEl) gapsEl.textContent = gaps.length > 0 ? gaps.join('; ') : 'אין חוסרים';
      if (gapsRowEl) gapsRowEl.hidden = false;
    } catch (e) {
      maskedLog('[Tickers Data Integrity] Check failed:', e);
      if (backfillBannerEl) backfillBannerEl.innerHTML = '';
      if (gapsRowEl?.parentNode) gapsRowEl.parentNode.removeChild(gapsRowEl);
      detailEl.innerHTML = `<p class="data-integrity-error">שגיאה: ${e?.message ?? 'לא ניתן לטעון'}</p>`;
      if (gapsEl) gapsEl.textContent = '—';
      if (gapsRowEl) {
        gapsRowEl.hidden = false;
        if (panelEl) panelEl.appendChild(gapsRowEl);
      }
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
      await sharedServices.post(`/tickers/${tickerId}/history-backfill`, {}); // mode=gap_fill (ברירת מחדל)
      if (btn) {
        btn.textContent = 'הושלם — רענן תוצאות';
      }
      doCheck();
    } catch (e) {
      maskedLog('[Tickers Data Integrity] Backfill failed:', e);
      const status = e?.status ?? e?.code ?? e?.response?.status;
      const apiDetail = e?.response?.data?.detail ?? e?.detail;
      const msg = apiDetail || (status === 404 ? 'טיקר לא נמצא' : null) || e?.message || 'שגיאה';
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

  async function doForceReload(tickerId) {
    if (!tickerId) return;
    if (!window.confirm('פעולה זו מוחקת את כל נתוני ההיסטוריה וטוענת מחדש. להמשיך?')) return;
    const btn = document.getElementById('tickerDataIntegrityForceReloadBtn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'טוען מחדש...';
    }
    try {
      await sharedServices.init();
      await sharedServices.post(`/tickers/${tickerId}/history-backfill?mode=force_reload`, {});
      if (btn) btn.textContent = 'הושלם';
      doCheck();
    } catch (e) {
      maskedLog('[Tickers Data Integrity] Force reload failed:', e);
      const status = e?.status ?? e?.code ?? e?.response?.status;
      const apiDetail = e?.response?.data?.detail ?? e?.detail ?? e?.message;
      const msg = apiDetail || (status === 404 ? 'טיקר לא נמצא' : status === 403 ? 'דורש הרשאת Admin' : null) || e?.message || 'שגיאה';
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'טען מחדש (מחיקה)';
      }
      detailEl.insertAdjacentHTML('beforeend', `<p class="data-integrity-error">${msg}</p>`);
    }
  }

  (panelEl || document).addEventListener('click', (e) => {
    const forceBtn = e.target.closest('#tickerDataIntegrityForceReloadBtn');
    if (forceBtn) {
      const id = forceBtn.dataset.tickerId || selectEl.value?.trim();
      if (id) doForceReload(id);
      return;
    }
    const btn = e.target.closest('#tickerDataIntegrityBackfillBtn');
    if (btn) {
      const tickerId = btn.dataset.tickerId || selectEl.value?.trim();
      if (tickerId) doBackfill(tickerId);
    }
  });

  const list = await loadTickers();
  populateSelect(list);

  selectEl.addEventListener('change', doCheck);
  doCheck();
})();
