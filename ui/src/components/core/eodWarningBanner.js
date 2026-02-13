/**
 * EOD Warning Banner - ADR-022 §2.4
 * ---------------------------------
 * Visual warning when End-of-Day (EOD) market data is displayed.
 * Backend returns staleness: ok | warning | na
 *
 * Usage: call window.showEodWarning(staleness) when API response includes staleness.
 */

(function () {
  'use strict';

  const BANNER_ID = 'eod-warning-banner';
  const WARNING_TEXT = 'נתוני מחיר מסוף יום (EOD) — ייתכן שלא מעודכנים';

  function ensureBanner() {
    let banner = document.getElementById(BANNER_ID);
    if (!banner) {
      banner = document.createElement('div');
      banner.id = BANNER_ID;
      banner.className = 'eod-warning-banner eod-warning-banner--hidden';
      banner.setAttribute('role', 'alert');
      banner.setAttribute('aria-live', 'polite');
      banner.innerHTML = '<span class="eod-warning-banner__icon" aria-hidden="true">⚠️</span><span class="eod-warning-banner__text">' + WARNING_TEXT + '</span>';
      const main = document.querySelector('main');
      if (main && main.firstChild) {
        main.insertBefore(banner, main.firstChild);
      } else {
        document.body.insertBefore(banner, document.body.firstChild);
      }
    }
    return banner;
  }

  /**
   * Show or hide EOD warning based on staleness
   * @param {string} staleness - ok | warning | na
   */
  function showEodWarning(staleness) {
    const banner = ensureBanner();
    if (staleness === 'warning' || staleness === 'na') {
      banner.classList.remove('eod-warning-banner--hidden');
    } else {
      banner.classList.add('eod-warning-banner--hidden');
    }
  }

  window.showEodWarning = showEodWarning;
})();
