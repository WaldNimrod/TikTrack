# Evidence: Staleness Clock Unification — הטיקרים שלי + Global

**Date:** 2025-01-31  
**Squad:** Team 50 (UI/UX)  
**Artifact:** Staleness Clock placement and styling unified across all pages  

## Summary

- Added `#stalenessClockCard` to "הטיקרים שלי" (`user_tickers.content.html`).
- Introduced a global CSS rule in `phoenix-components.css` so any `info-summary__row--first` containing the staleness clock uses `justify-content: space-between` (content left, clock right).
- Regenerated pages via `generate-pages.js`.

## Changes

| File | Change |
|------|--------|
| `ui/src/views/management/userTicker/user_tickers.content.html` | Added staleness clock div inside `info-summary__row--first` after `info-summary__content` |
| `ui/src/styles/phoenix-components.css` | Added `.info-summary__row--first:has(#stalenessClockCard) { justify-content: space-between; }` |

## Standard Pattern (for future pages)

```html
<div class="info-summary__row info-summary__row--first">
  <div class="info-summary__content">...</div>
  <div id="stalenessClockCard" class="staleness-clock-card" aria-live="polite" data-price-label="עודכן ב" data-fetched-label="עודכן ב">
    <span class="staleness-clock-card__loading">טוען עדכון נתונים...</span>
  </div>
</div>
```

Required script: `<script src="/src/components/core/stalenessClock.js"></script>` (already in manifest for user_tickers).

## Pages with Staleness Clock (Unified)

- trading_accounts, brokers_fees, cash_flows, tickers, data_dashboard
- **user_tickers** ← fixed

## Next Steps

- Notify Team 10 for D15 Index update if needed.
