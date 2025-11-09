# Stage B-Lite Cache Strategy
# ============================

**Status:** Active – Interim cache approach  
**Scope:** Development & Production environments  
**Author:** TikTrack Dev Team  
**Date:** 2025-02-11

---

## 1. Objectives

1. Provide a *lightweight* cache configuration that:
   - Ensures accurate data refresh for every UI action.
   - Supplies developers with quick cache-clearing controls.
   - Integrates with all universal systems and pages.
   - Inventories every cache entry/site usage.
2. Serve as a step toward the full cache architecture (`UNIFIED_CACHE_SYSTEM.md`).

---

## 2. Architecture Overview

### 2.1 Layers in Stage B-Lite

| Layer | Purpose | Implementation Notes |
|-------|---------|-----------------------|
| Memory (`UnifiedCacheManager`) | Temporary UI state | Short TTL keys (`trade-data`, `dashboard-data`, etc.) |
| localStorage (`UnifiedCacheManager`) | Preferences, light data | Saved with unified prefix `tiktrack_` + key |
| IndexedDB (`UnifiedCacheManager`) | Heavy/offline data | Schema versioned (`UnifiedCacheDB` v2) |
| Backend Cache | **Disabled** (Stage B-Lite) | `CACHE_DISABLED=true` in all environments |

### 2.2 Data Flow

1. UI components query `UnifiedCacheManager`.
2. If not available locally, fetch from backend, then store via cache manager.
3. Developers can clear cache via the header menu (see Section 4).
4. Each component logs cache misses/hits using `LoggerService`.

---

## 3. Requirements

### 3.1 Data Freshness

- All CRUD operations must clear relevant cache entries:
  - Accounts: `accounts-data`, `accounts-list`.
  - Trades: `trades-*`.
  - Preferences: `preferences-*`.
- On page navigation, modules refresh data if last update > TTL (configurable).

### 3.2 Developer Tooling

- Header cache menu powered by `CacheControlMenu` (`cache-clear-menu.js`):
  1. `Clear Memory Cache`
  2. `Clear localStorage Entries`
  3. `Clear IndexedDB`
  4. `Full Clear + Hard Refresh`
- Each option:
  - Fires `CacheControlMenu.triggerAction`
  - Calls `/api/cache/log` (POST) with action metadata
  - Displays unified notifications via `NotificationSystem`

### 3.3 Integration Touchpoints

- `UnifiedAppInitializer` ensures cache layers initialize before page logic.
- `LoggerService` captures cache operations.
- `Monitoring functions` display cache status (hit/miss).
- Preferences, Table Systems, Notifications: use centralized cache methods only.
- Preferences stack (`PreferencesCore`, `PreferencesUI`, `PreferencesLazyLoader`) must resolve the active profile ID before any cache lookup and persist it in shared state.

### 3.4 Preferences Page Requirements

1. **Active Profile Detection**
   - Backend endpoints (`/api/preferences/user`, `/api/preferences/user/single`, `/api/preferences/user/group`, `/api/preferences/profiles`) return `active_profile_id`, `active_profile_name`, and a `is_default_profile` flag.
   - `preferences_service._get_active_profile_id` logs when no active profile exists; API responses include a `no_active_profile` indicator and localized customer message.
   - Frontend initializes by calling `PreferencesUI.loadActiveProfile()`; the result seeds `PreferencesCore.currentProfileId`, `PreferencesUI.state.activeProfileId`, and `UnifiedCacheManager` namespacing.

2. **Fallback Handling**
   - When no active profile exists, responses load profile `0` defaults and mark `isFallback=true`.
   - `preferences-ui.js` displays a banner (`preferencesFallbackBanner`) describing the fallback user/profile.
   - All select/populator consumers (e.g., `SelectPopulatorService.populateAccountsSelect`) request data with the current profile ID and respect fallback messaging.

3. **Cache Namespacing**
   - All preference cache keys include the profile ID suffix (`preference_<name>__profile_<id>` stored as `tiktrack_preference_<name>__profile_<id>` in storage).
   - Cache clear operations must remove both the Stage B-Lite keys and legacy keys (`preference_<name>_<userId>_<profileId>`).
   - `PreferencesCore.buildPreferenceCacheKey`, `UnifiedCacheManager.buildPreferenceCacheKey`, and `SelectPopulatorService` share the same builder.
   - `PreferencesLazyLoader` accepts explicit `{ userId, profileId }`, clears stale keys when profile changes, and triggers a full fetch when post-load state is empty.

4. **Post-Save Sync**
   - `PreferencesGroupManager.saveGroup` re-fetches the active profile snapshot and calls `PreferencesUI.updateGlobalPreferences`.
   - `UnifiedCacheManager.refreshUserPreferences` receives `activeProfileId` to refresh all relevant caches.

### 3.5 Cache Inventory

| Key Pattern | Layer | Source Module | Notes |
|-------------|-------|---------------|-------|
| `accounts-data` | Memory/localStorage | `trading_accounts.js` | Replaces `window.trading_accountsData` |
| `preferences-active-profile` | Memory/localStorage | `preferences-core-new.js` | Stores `{ id, name, isFallback }` |
| `tiktrack_preference_*__profile_<id>` | localStorage | `preferences-core-new.js`, `preferences-lazy-loader.js` | Key per preference + profile; cleared via `refreshUserPreferences` |
| `preferences-groups__profile_<id>` | Memory/localStorage | `preferences-group-manager.js` | Keeps group listings scoped to profile |
| `preferences-color-cache__profile_<id>` | Memory | `preferences-colors.js` | Color sets derived per profile; fallback noted |
| `positions-account-*` | Memory | `positions-portfolio.js` | Updated on account change |
| `portfolio-*` | Memory/localStorage | `positions-portfolio.js` | Cache trimmed on account change |
| `unified-table-*` | Memory | `unified-table-system.js` | Sorting/filter persisted |
| `notifications-history` | IndexedDB | `notification-system.js` | TTL = 24h |

> **Action:** Audit remaining modules to remove any `window.*Data` usages. Use Table Inventory sheet in `/documentation/03-DEVELOPMENT/`.

---

## 4. Developer Controls (Header Menu)

| Button | Action | Layers | Confirm Dialog |
|--------|--------|--------|----------------|
| Clear Memory Cache | `CacheControlMenu.triggerAction('memory')` → `UnifiedCacheManager.clear('memory')` | Memory | No |
| Clear Storage Cache | `CacheControlMenu.triggerAction('local-storage')` → `UnifiedCacheManager.clearAllCache({ layers: ['localStorage'] })` | localStorage | Yes |
| Clear IndexedDB Cache | `CacheControlMenu.triggerAction('indexeddb')` → `UnifiedCacheManager.clearAllCache({ layers: ['indexedDB'] })` | IndexedDB | Yes |
| Full Clear + Refresh | `CacheControlMenu.triggerAction('full')` → `UnifiedCacheManager.clearAllCacheDetailed({ autoRefresh: true })` | All | Yes + countdown |

Each action:
- Emits `cache:clear` event.
- Logs entry with timestamp, user action.
- Reports metadata (`profileId`, `userId`, `page`) to `/api/cache/log`.

---

## 5. Configuration Matrix

| Env | `CACHE_DISABLED` | Notes |
|-----|------------------|-------|
| Development (`Backend/config/settings.py`) | `true` | TTL values ignored |
| Production (`production/Backend/config/settings.py`) | `true` (Stage B-Lite) | Re-enable later when backend cache ready |

All environments share identical frontend cache configuration files.

---

## 6. Validation Checklist

> ראה גם [CHECKLIST מפורט](TESTING/CACHE_STAGE_B_LITE_VALIDATION_CHECKLIST.md) לבדיקות צעד-אחר-צעד.

1. **Global Cache Controls**  
- [ ] Buttons exist in header menu on every page (dev/prod).  
- [ ] Each action logs entry in `cache.log` and `/api/cache/log`.  
- [ ] After “Full Clear + Refresh” data loads fresh.

2. **Page Data Refresh**  
   - [ ] Trading Accounts page updates list after create/update/delete.  
   - [ ] Preferences page resolves active profile → shows banner when fallback used.  
   - [ ] Preferences account selectors and color sets respect the resolved profile ID.  
   - [ ] Positions & Portfolio respect TTL upon navigation.

3. **No Non-central Cache**  
- [ ] No `window.*Data` assignments left or they are mirrored into `UnifiedCacheManager`.  
- [ ] `localStorage` access only via `UnifiedCacheManager`.

---

## 7. Roadmap to Full Architecture

Stage B-Lite is a stepping stone toward the complete architecture:  
1. Implement backend `cache/sync` endpoints.  
2. Activate `CacheSyncManager` and Policy Manager.  
3. Introduce environment-specific configs (staging vs production).  
4. Add monitoring dashboards (hit/miss metrics).  
5. Gradually enable backend cache when ready.

---

## 8. Documentation References

- `UNIFIED_CACHE_SYSTEM.md` – full architecture spec.  
- `CACHE_SYSTEM_AUDIT_REPORT.md` – current state analysis.  
- `CACHE_CLEARING_GUIDE.md` – developer clearing instructions.  
- `PAGES_LIST.md` / `GENERAL_SYSTEMS_LIST.md` – ensure all modules use centralized cache.

---

## 9. Open Items

- [ ] Verify no legacy cache usages remain.  
- [ ] Ensure logger shows cache events with environment tags.  
- [ ] Align QA checklist with validation items above.


