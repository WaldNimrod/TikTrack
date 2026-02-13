/**
 * EOD Staleness Check - ADR-022 §2.4
 * -----------------------------------
 * Fetches exchange-rates (market data) and shows EOD warning if staleness is warning/na.
 * Runs on financial pages that display prices/conversions.
 */

(function () {
  'use strict';

  async function checkStaleness() {
    try {
      const sharedServices = (await import('./sharedServices.js')).default;
      await sharedServices.init();
      const response = await sharedServices.get('/reference/exchange-rates', {});
      if (response && typeof response.staleness === 'string' && window.showEodWarning) {
        window.showEodWarning(response.staleness);
      }
    } catch (_) {
      /* 401, network error, etc. — silently skip */
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(checkStaleness, 500));
  } else {
    setTimeout(checkStaleness, 500);
  }
})();
