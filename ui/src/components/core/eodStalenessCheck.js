/**
 * Staleness Check - P3-012 / M6 (Clock + color + tooltip, no banner)
 * ------------------------------------------------------------------
 * Fetches exchange-rates; updates staleness clock (color + tooltip).
 */

(function () {
  'use strict';

  async function checkStaleness() {
    try {
      const sharedServices = (await import('./sharedServices.js')).default;
      await sharedServices.init();
      const response = await sharedServices.get('/reference/exchange-rates', {});
      if (response && typeof response.staleness === 'string' && window.updateStalenessClock) {
        const ts = response.data?.[0]?.last_sync_time;
        window.updateStalenessClock(response.staleness, ts);
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
