/**
 * Staleness Clock - P3-012 / M6 (MARKET_DATA_PIPE_SPEC §2.5)
 * ----------------------------------------------------------
 * Clock + color + tooltip. When #stalenessClockCard exists → full card (clock, market status, time elapsed).
 * Else → minimal inline clock for other pages.
 *
 * staleness: ok | warning (>15m) | na (>24h)
 * marketStatus: { market_state, display_label } — optional
 */

(function () {
  'use strict';

  const CARD_ID = 'stalenessClockCard';
  const CLOCK_ID = 'staleness-clock';
  const MARKET_KEY_ID = 'market-status-key';

  const TOOLTIPS = {
    ok: 'נתונים מעודכנים',
    warning: 'נתונים בני יותר מ־15 דקות — ייתכן שלא מעודכנים',
    na: 'נתוני EOD — לא מעודכנים (סוף יום)'
  };

  const MARKET_STATE_CLASS = {
    REGULAR: 'market-status--open',
    PRE: 'market-status--pre',
    PREPRE: 'market-status--pre',
    POST: 'market-status--post',
    POSTPOST: 'market-status--post',
    CLOSED: 'market-status--closed',
    unknown: 'market-status--unknown'
  };

  const CLOCK_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';

  const ICON_SUNRISE = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4"/><path d="m4.93 10.93 2.83 2.83"/><path d="M2 12h4"/><path d="m4.93 13.07 2.83-2.83"/><path d="M12 6a6 6 0 0 1 6 6"/><circle cx="12" cy="12" r="4"/></svg>';
  const ICON_TRENDING = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>';
  const ICON_MOON = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
  const ICON_UNKNOWN = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>';
  const MARKET_ICONS = {
    REGULAR: ICON_TRENDING,
    PRE: ICON_SUNRISE,
    PREPRE: ICON_SUNRISE,
    POST: ICON_SUNRISE,
    POSTPOST: ICON_SUNRISE,
    CLOSED: ICON_MOON,
    unknown: ICON_UNKNOWN
  };

  function formatTimeElapsed(ts) {
    if (!ts) return '—';
    let d;
    try {
      d = new Date(ts);
      if (isNaN(d.getTime())) return '—';
    } catch (_) {
      return '—';
    }
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    if (diffMin < 1) return 'עכשיו';
    if (diffMin < 60) return `לפני ${diffMin} דק׳`;
    if (diffHr < 24) return `לפני ${diffHr} שעות`;
    if (diffDay === 1) return 'אתמול';
    if (diffDay < 7) return `לפני ${diffDay} ימים`;
    return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: '2-digit' });
  }

  function renderCard(staleness, timestamp, marketStatus) {
    const card = document.getElementById(CARD_ID);
    if (!card) return;

    const s = staleness || 'ok';
    const tooltip = TOOLTIPS[s];
    const state = (marketStatus?.market_state || 'unknown').toUpperCase();
    const label = marketStatus?.display_label || '—';
    const stateClass = MARKET_STATE_CLASS[state] || MARKET_STATE_CLASS.unknown;
    const marketIcon = MARKET_ICONS[state] || MARKET_ICONS.unknown;
    const timeStr = formatTimeElapsed(timestamp);

    card.innerHTML = `
      <div class="staleness-clock-card__inner" role="status">
        <div class="staleness-clock-card__clock" title="${tooltip}" aria-label="${tooltip}">
          <span class="staleness-clock staleness-clock--${s}">${CLOCK_SVG}</span>
          <span class="staleness-clock-card__clock-label">עדכון נתונים</span>
        </div>
        <div class="staleness-clock-card__divider" aria-hidden="true"></div>
        <div class="staleness-clock-card__market market-status-key ${stateClass}" title="מצב שוק: ${label}">
          <span class="staleness-clock-card__market-icon">${marketIcon}</span>
          <span class="staleness-clock-card__market-label">${label}</span>
        </div>
        <div class="staleness-clock-card__divider" aria-hidden="true"></div>
        <div class="staleness-clock-card__time">
          <span class="staleness-clock-card__time-value">${timeStr}</span>
          <span class="staleness-clock-card__time-label">מאז העדכון</span>
        </div>
      </div>
    `;
    card.classList.add('staleness-clock-card--loaded');
  }

  function ensureInlineClock() {
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

  function ensureMarketKey() {
    let el = document.getElementById(MARKET_KEY_ID);
    if (!el) {
      el = document.createElement('span');
      el.id = MARKET_KEY_ID;
      el.className = 'market-status-key';
      el.setAttribute('aria-label', 'מצב שוק');
      const clock = document.getElementById(CLOCK_ID);
      if (clock) {
        clock.parentNode.insertBefore(el, clock.nextSibling);
      }
    }
    return el;
  }

  function updateInline(staleness, timestamp, marketStatus) {
    const el = ensureInlineClock();
    el.className = 'staleness-clock staleness-clock--' + (staleness || 'ok');
    el.setAttribute('title', TOOLTIPS[staleness] || TOOLTIPS.ok);
    el.setAttribute('aria-label', TOOLTIPS[staleness] || TOOLTIPS.ok);
    if (timestamp) el.setAttribute('data-timestamp', timestamp);

    const keyEl = document.getElementById(MARKET_KEY_ID);
    if (marketStatus && (marketStatus.market_state || marketStatus.display_label)) {
      const mEl = ensureMarketKey();
      const state = (marketStatus.market_state || 'unknown').toUpperCase();
      const label = marketStatus.display_label || '—';
      const stateClass = MARKET_STATE_CLASS[state] || MARKET_STATE_CLASS.unknown;
      mEl.className = 'market-status-key ' + stateClass;
      mEl.textContent = label;
      mEl.setAttribute('title', 'מצב שוק: ' + label);
      mEl.style.display = '';
    } else if (keyEl) {
      keyEl.style.display = 'none';
    }
  }

  function updateClock(staleness, timestamp, marketStatus) {
    const card = document.getElementById(CARD_ID);
    if (card) {
      renderCard(staleness, timestamp, marketStatus);
    } else {
      updateInline(staleness, timestamp, marketStatus);
    }
  }

  window.updateStalenessClock = updateClock;
})();
