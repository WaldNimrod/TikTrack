/**
 * Staleness Check - P3-012 / M6 (Clock + color + tooltip, no banner)
 * ------------------------------------------------------------------
 * Fetches exchange-rates + market-status; updates staleness clock (color + tooltip + market key).
 */

(function () {
  'use strict';

  async function checkStaleness() {
    try {
      const sharedServices = (await import('./sharedServices.js')).default;
      await sharedServices.init();

      const [ratesRes, statusRes] = await Promise.allSettled([
        sharedServices.get('/reference/exchange-rates', {}),
        sharedServices.get('/system/market-status', {}),
      ]);

      let staleness, ts, marketState, displayLabel;
      if (ratesRes.status === 'fulfilled' && ratesRes.value) {
        staleness = ratesRes.value.staleness;
        ts = ratesRes.value.data?.[0]?.last_sync_time;
      }
      if (statusRes.status === 'fulfilled' && statusRes.value) {
        marketState = statusRes.value.market_state;
        displayLabel = statusRes.value.display_label;
      }

      if (typeof staleness === 'string' && window.updateStalenessClock) {
        window.updateStalenessClock(staleness, ts, {
          market_state: marketState,
          display_label: displayLabel,
        });
      }
    } catch (_) {
      /* 401, network error — silently skip */
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(checkStaleness, 500));
  } else {
    setTimeout(checkStaleness, 500);
  }
})();
