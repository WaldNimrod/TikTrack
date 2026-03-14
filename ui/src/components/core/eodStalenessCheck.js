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
        const first = ratesRes.value.data?.[0];
        ts = first?.last_sync_time ?? first?.lastSyncTime ?? null;
        if (!ts && Array.isArray(ratesRes.value.data)) {
          let latest = null;
          for (const r of ratesRes.value.data) {
            const t = r?.last_sync_time ?? r?.lastSyncTime;
            if (t && (!latest || new Date(t) > new Date(latest))) latest = t;
          }
          ts = latest;
        }
      }

      if (statusRes.status === 'fulfilled' && statusRes.value) {
        const v = statusRes.value;
        marketState = v.market_state ?? v.marketState ?? null;
        displayLabel = v.display_label ?? v.displayLabel ?? null;
      } else if (statusRes.status === 'rejected') {
        const err = statusRes.reason;
        if (typeof console !== 'undefined' && console.debug) {
          console.debug(
            '[eodStalenessCheck] market-status failed:',
            err?.message || err?.code || 'unknown',
          );
        }
      }

      if (window.updateStalenessClock) {
        const timestamps = { fetched_at: ts };
        if (ratesRes.status === 'fulfilled' && ratesRes.value?.data?.[0]) {
          const r = ratesRes.value.data[0];
          const pt = r.price_timestamp ?? r.priceTimestamp ?? null;
          if (pt) timestamps.price_timestamp = pt;
        }
        window.updateStalenessClock(staleness || 'ok', timestamps, {
          market_state: marketState,
          display_label: displayLabel,
        });
      }
    } catch (e) {
      if (typeof console !== 'undefined' && console.debug) {
        console.debug(
          '[eodStalenessCheck] checkStaleness failed:',
          e?.message || 'unknown',
        );
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () =>
      setTimeout(checkStaleness, 500),
    );
  } else {
    setTimeout(checkStaleness, 500);
  }
})();
