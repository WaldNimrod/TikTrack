# Stage B-Lite Cache Validation Checklist

**Version:** 1.0  
**Scope:** Development & Production environments  
**Reference:** [CACHE_STAGE_B_LITE.md](../CACHE_STAGE_B_LITE.md)

---

## 1. Pre-checks

- [ ] Confirm `CACHE_DISABLED=true` in both `Backend/config/settings.py` and `production/Backend/config/settings.py`.
- [ ] Verify header cache menu buttons are visible on every page (dev & prod).
- [ ] Ensure local storage/IndexedDB are cleared before starting tests.

---

## 2. Cache Controls – Functional

| Action | Expected Result | Env |
|--------|-----------------|-----|
| Clear Memory Cache | In-memory datasets (e.g., `trade-data`, `dashboard-data`) reset; next interaction fetches fresh data | Dev / Prod |
| Clear Storage Cache | `localStorage` entries with prefix `tiktrack_` removed; preferences reload | Dev / Prod |
| Clear IndexedDB Cache | IndexedDB stores (cache namespace) emptied; no errors in console | Dev / Prod |
| Full Clear + Refresh | All layers cleared, page performs hard reload, data fetched anew | Dev / Prod |

- [ ] Each action generates entry in `cache.log` **and** POST `/api/cache/log` returns `status=success`.

---

## 3. Page-Level Data Refresh

- **Trading Accounts**
  - [ ] Create/update/delete account → table reflects change immediately.
  - [ ] After cache clear + reload, data matches database contents.
- **Preferences**
  - [ ] Active profile detected (`PreferencesCore.currentProfileId` not `null`).
  - [ ] When no profile exists, fallback banner displayed with localized message.
  - [ ] Account selectors/Color manager fetch using the active profile ID and show updated data after save.
  - [ ] cache keys `tiktrack_preference_*__profile_<id>` created/cleared per active profile; legacy keys removed.
- **Positions & Portfolio**
  - [ ] Switching accounts recalculates positions/portfolio without manual refresh.
  - [ ] Cache TTL respected (no reuse beyond configured window).
- **Executions / Trades**
  - [ ] Recent actions visible after clear or TTL expiry.

---

## 4. Logging & Monitoring

- [ ] `LoggerService` entries appear for cache hits/misses when enabled.
- [ ] Monitoring widgets reflect cache availability (UnifiedCacheManager status = green).
- [ ] No console errors related to cache clearing or access.
- [ ] `/api/cache/log` contains latest action metadata (`action`, `layers`, `profileId`, `page`).

---

## 5. Audit for Non-Unified Cache Usage

- [ ] No usage of `window.*Data` or manual `localStorage.setItem` outside UnifiedCacheManager.
- [ ] Search for `sessionStorage` usage; ensure routed through cache manager or removed.
- [ ] Confirm modules rely on documented key patterns (see Stage B-Lite spec Section 3.4).

---

## 6. Post-Test Steps

- [ ] Record results in QA log (include environment, timestamp, tester).
- [ ] Capture `window.currentPreferences` snapshot confirming `{ profileId, isFallback }` state.
- [ ] Re-enable any developer logging toggles that were changed during validation.
- [ ] Report discrepancies back to cache task tracker before proceeding to Stage C.

