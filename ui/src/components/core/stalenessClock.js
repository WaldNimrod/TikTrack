/**
 * Staleness Clock - P3-012 / M6 (MARKET_DATA_PIPE_SPEC §2.5)
 * ----------------------------------------------------------
 * Clock + color + tooltip — no banner.
 * Last Update Clock for prices/rates; when stale/EOD → clock changes color + tooltip.
 *
 * staleness: ok | warning (>15m) | na (>24h)
 */

(function () {
  'use strict';

  const CLOCK_ID = 'staleness-clock';
  const TOOLTIPS = {
    ok: 'נתונים מעודכנים',
    warning: 'נתונים בני יותר מ־15 דקות — ייתכן שלא מעודכנים',
    na: 'נתוני EOD — לא מעודכנים (סוף יום)'
  };

  const CLOCK_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';

  function ensureClock() {
    let el = document.getElementById(CLOCK_ID);
    if (!el) {
      el = document.createElement('span');
      el.id = CLOCK_ID;
      el.className = 'staleness-clock staleness-clock--ok';
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', TOOLTIPS.ok);
      el.innerHTML = CLOCK_SVG;
      const summary = document.querySelector('#summaryStats, .info-summary, [id^="summaryStats"]');
      const target = summary || document.querySelector('main');
      if (target) {
        const anchor = target.querySelector('.info-summary__content, .info-summary__row') || target;
        anchor.insertBefore(el, anchor.firstChild);
      }
    }
    return el;
  }

  function updateClock(staleness, timestamp) {
    const el = ensureClock();
    el.className = 'staleness-clock staleness-clock--' + (staleness || 'ok');
    el.setAttribute('title', TOOLTIPS[staleness] || TOOLTIPS.ok);
    el.setAttribute('aria-label', TOOLTIPS[staleness] || TOOLTIPS.ok);
    if (timestamp) el.setAttribute('data-timestamp', timestamp);
  }

  window.updateStalenessClock = updateClock;
})();
