/**
 * Staleness Clock - P3-012 / M6 (MARKET_DATA_PIPE_SPEC §2.5)
 * ----------------------------------------------------------
 * שתי שכבת זמן: price_timestamp (ערך) | fetched_at (סקריפט).
 * מפתח צבעים: success | info | warning | error.
 * קונפיגורציה לכל ממשק: איזה אלמנטים להציג.
 */

(function () {
  'use strict';

  const CARD_ID = 'stalenessClockCard';
  const CLOCK_ID = 'staleness-clock';
  const MARKET_KEY_ID = 'market-status-key';

  function formatExactAge(ts) {
    if (!ts) return '—';
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return '—';
    } catch (_) {
      return '—';
    }
    const diffMs = Date.now() - new Date(ts).getTime();
    const sec = Math.floor(diffMs / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);
    if (sec < 60) return `לפני ${sec} שניות`;
    if (min < 60) return min === 1 ? 'לפני דקה' : `לפני ${min} דקות`;
    if (hr < 24) {
      const m = min % 60;
      if (m === 0) return hr === 1 ? 'לפני שעה' : `לפני ${hr} שעות`;
      return `לפני ${hr} שעות ו־${m} דקות`;
    }
    if (day === 1) return 'לפני יום';
    if (day < 7) return `לפני ${day} ימים`;
    return `לפני ${day} ימים`;
  }

  const STALENESS_TOOLTIPS = {
    success: 'נתונים עדכניים',
    info: 'נתונים מלפני פחות מ־24 שעות',
    warning: 'נתונים מלפני 24–72 שעות',
    error: 'נתונים ישנים או חסרים'
  };

  const MARKET_LEVEL = {
    REGULAR: 'success',
    PRE: 'info',
    PREPRE: 'info',
    POST: 'info',
    POSTPOST: 'warning',
    CLOSED: 'error',
    unknown: 'warning'
  };

  const CLOCK_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';

  const ICON_SUNRISE = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v4"/><path d="m4.93 10.93 2.83 2.83"/><path d="M2 12h4"/><path d="m4.93 13.07 2.83-2.83"/><path d="M12 6a6 6 0 0 1 6 6"/><circle cx="12" cy="12" r="4"/></svg>';
  const ICON_TRENDING = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>';
  const ICON_MOON = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
  const ICON_UNKNOWN = '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/></svg>';
  const MARKET_ICONS = {
    REGULAR: ICON_TRENDING,
    PRE: ICON_SUNRISE,
    PREPRE: ICON_SUNRISE,
    POST: ICON_SUNRISE,
    POSTPOST: ICON_SUNRISE,
    CLOSED: ICON_MOON,
    unknown: ICON_UNKNOWN
  };

  function getConfig(card) {
    if (!card) return {};
    return {
      showMarket: card.dataset.showMarket !== 'false',
      showClock: card.dataset.showClock !== 'false',
      showPriceTime: card.dataset.showPriceTime !== 'false',
      showFetchedTime: card.dataset.showFetchedTime !== 'false',
      priceLabel: card.dataset.priceLabel || 'עודכן ב',
      fetchedLabel: card.dataset.fetchedLabel || 'עודכן ב'
    };
  }

  function computeStalenessLevel(ts) {
    if (!ts) return 'error';
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return 'error';
      const ageMs = Date.now() - d.getTime();
      const ageH = ageMs / (60 * 60 * 1000);
      if (ageH < 1) return 'success';
      if (ageH < 24) return 'info';
      if (ageH < 72) return 'warning';
      return 'error';
    } catch (_) {
      return 'error';
    }
  }

  function formatTimeElapsed(ts) {
    if (!ts) return null;
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return null;
    } catch (_) {
      return null;
    }
    const diffMs = Date.now() - new Date(ts).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);
    if (diffMin < 1) return 'עכשיו';
    if (diffMin < 60) return `לפני ${diffMin} דק׳`;
    if (diffHr < 24) return `לפני ${diffHr} שעות`;
    if (diffDay === 1) return 'אתמול';
    if (diffDay < 7) return `לפני ${diffDay} ימים`;
    return `לפני ${diffDay} ימים`;
  }

  function formatTime(ts) {
    if (!ts) return '—';
    try {
      const d = new Date(ts);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch (_) {
      return '—';
    }
  }

  function escapeHtml(s) {
    if (!s) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderCard(staleness, timestamps, marketStatus, config) {
    const card = document.getElementById(CARD_ID);
    if (!card) return;

    const cfg = config || getConfig(card);
    const priceTs = timestamps?.price_timestamp ?? timestamps?.priceTimestamp ?? null;
    const fetchedTs = timestamps?.fetched_at ?? timestamps?.fetchedAt ?? (typeof timestamps === 'string' || (timestamps && timestamps instanceof Date) ? timestamps : null);
    const primaryTs = priceTs || fetchedTs;
    const clockLevel = computeStalenessLevel(primaryTs);
    const clockTooltip = primaryTs ? formatExactAge(primaryTs) : 'אין נתוני עדכון';

    const state = (marketStatus?.market_state || 'unknown').toUpperCase();
    const label = marketStatus?.display_label || 'חסר נתון';
    const marketLevel = MARKET_LEVEL[state] || MARKET_LEVEL.unknown;
    const marketTooltip = 'מצב שוק: ' + label;
    const marketIcon = MARKET_ICONS[state] || MARKET_ICONS.unknown;

    const priceElapsed = formatTimeElapsed(priceTs);
    const fetchedElapsed = formatTimeElapsed(fetchedTs);
    const parts = [];

    if (cfg.showMarket !== false) {
      parts.push(`<span class="staleness-clock-card__cell staleness-clock-card__market staleness-level--${marketLevel}" data-tooltip="${escapeHtml(marketTooltip)}" aria-label="${escapeHtml(marketTooltip)}">${marketIcon}<span class="staleness-clock-card__market-label">${escapeHtml(label)}</span></span>`);
      parts.push('<span class="staleness-clock-card__divider" aria-hidden="true"></span>');
    }
    if (cfg.showClock !== false) {
      parts.push(`<span class="staleness-clock-card__cell staleness-clock staleness-level--${clockLevel}" data-tooltip="${escapeHtml(clockTooltip)}" aria-label="${escapeHtml(clockTooltip)}">${CLOCK_SVG}</span>`);
      parts.push('<span class="staleness-clock-card__divider" aria-hidden="true"></span>');
    }
    if (cfg.showPriceTime !== false && (priceElapsed || priceTs)) {
      parts.push(`<span class="staleness-clock-card__time-block"><span class="staleness-clock-card__time-label">${escapeHtml(cfg.priceLabel)}:</span> <span class="staleness-clock-card__time-value" dir="ltr">${escapeHtml(priceElapsed || formatTime(priceTs))}</span></span>`);
      if (cfg.showFetchedTime !== false && fetchedTs) parts.push('<span class="staleness-clock-card__divider" aria-hidden="true"></span>');
    }
    if (cfg.showFetchedTime !== false && (fetchedElapsed || fetchedTs)) {
      parts.push(`<span class="staleness-clock-card__time-block"><span class="staleness-clock-card__time-label">${escapeHtml(cfg.fetchedLabel)}:</span> <span class="staleness-clock-card__time-value" dir="ltr">${escapeHtml(fetchedElapsed || formatTime(fetchedTs))}</span></span>`);
    }

    card.innerHTML = `<div class="staleness-clock-card__inner" role="status">${parts.join('')}</div>`;
    card.classList.add('staleness-clock-card--loaded');
  }

  function ensureInlineClock() {
    let el = document.getElementById(CLOCK_ID);
    if (!el) {
      el = document.createElement('span');
      el.id = CLOCK_ID;
      el.className = 'staleness-clock staleness-level--success';
      el.setAttribute('role', 'img');
      el.setAttribute('aria-label', STALENESS_TOOLTIPS.success);
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

  const TOOLTIPS_LEGACY = { ok: STALENESS_TOOLTIPS.success, warning: STALENESS_TOOLTIPS.info, na: STALENESS_TOOLTIPS.error };

  function updateInline(staleness, timestamps, marketStatus) {
    const fetchedTs = timestamps?.fetched_at ?? timestamps?.fetchedAt ?? (typeof timestamps === 'string' ? timestamps : null);
    const primaryTs = timestamps?.price_timestamp ?? timestamps?.priceTimestamp ?? fetchedTs;
    const level = computeStalenessLevel(primaryTs);
    const el = ensureInlineClock();
    el.className = 'staleness-clock staleness-level--' + level;
    const ariaLabel = primaryTs ? formatExactAge(primaryTs) : (STALENESS_TOOLTIPS[level] || TOOLTIPS_LEGACY[staleness] || STALENESS_TOOLTIPS.success);
    el.setAttribute('aria-label', ariaLabel);
    if (fetchedTs) el.setAttribute('data-timestamp', fetchedTs);

    const keyEl = document.getElementById(MARKET_KEY_ID);
    if (marketStatus && (marketStatus.market_state || marketStatus.display_label)) {
      const mEl = ensureMarketKey();
      const state = (marketStatus.market_state || 'unknown').toUpperCase();
      const label = marketStatus.display_label || '—';
      const marketLevel = MARKET_LEVEL[state] || MARKET_LEVEL.unknown;
      mEl.className = 'market-status-key staleness-level--' + marketLevel;
      mEl.textContent = label;
      mEl.setAttribute('aria-label', 'מצב שוק: ' + label);
      mEl.style.display = '';
    } else if (keyEl) {
      keyEl.style.display = 'none';
    }
  }

  /**
   * @param {string} staleness - ok | warning | na (legacy)
   * @param {Object|string} timestamps - { price_timestamp, fetched_at } or single fetched_at for backwards compat
   * @param {Object} marketStatus - { market_state, display_label }
   * @param {Object} [config] - { showMarket, showClock, showPriceTime, showFetchedTime, priceLabel, fetchedLabel }
   */
  function updateClock(staleness, timestamps, marketStatus, config) {
    const card = document.getElementById(CARD_ID);
    if (card) {
      renderCard(staleness, timestamps, marketStatus, config);
    } else {
      updateInline(staleness, timestamps, marketStatus);
    }
  }

  window.updateStalenessClock = updateClock;
})();
