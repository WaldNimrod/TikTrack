# Cache Stage B-Lite – Approval Summary

**Status:** Pending Approval  
**Owner:** TikTrack Cache Working Group  
**Last Updated:** <!-- TODO: fill date upon approval -->

---

## 1. Goals & Scope

1. Deliver an interim cache configuration that guarantees accurate data refresh across the UI while providing developers with dedicated cache-clearing controls.
2. Ensure the interim setup integrates with all universal systems (initialization, logging, monitoring, preferences, table systems).
3. Produce a complete inventory of cache keys/usages and eliminate non-centralized cache storage.
4. Lay the groundwork for the full cache architecture (CacheSyncManager + backend cache) without blocking ongoing development.

Reference specification: [CACHE_STAGE_B_LITE.md](../03-DEVELOPMENT/CACHE_STAGE_B_LITE.md)  
Validation checklist: [CACHE_STAGE_B_LITE_VALIDATION_CHECKLIST.md](../03-DEVELOPMENT/TESTING/CACHE_STAGE_B_LITE_VALIDATION_CHECKLIST.md)

---

## 2. Key Requirements

- **Frontend Layers Active:** Memory, localStorage, IndexedDB (managed via `UnifiedCacheManager`).
- **Backend Cache:** Disabled in all environments (`CACHE_DISABLED=true`) until advanced stage.
- **Unified Keys:** All modules must store data using the documented patterns (e.g., `accounts-data`, `tiktrack_preference_*__profile_<id>`).
- **Cache Clearing Menu:** Header menu includes actions for memory/localStorage/IndexedDB/full refresh. Each action must log to `cache.log`.
- **Integration:**  
  - `UnifiedAppInitializer` initializes cache layers before page logic.  
  - `LoggerService` records cache events (hit/miss, clear).  
  - Monitoring widgets display cache layer status.  
  - Preferences stack guarantees active-profile resolution, fallback messaging, and cache namespacing per profile ID.
- **No Legacy Cache:** Eliminate `window.*Data`, manual `localStorage` usage, and other ad-hoc caches.

---

## 3. Configuration Matrix

| Environment | `CACHE_DISABLED` | Notes |
|-------------|------------------|-------|
| Development | `true` | TTL ignored; frontend layers authoritative |
| Production  | `true` | Temporary setting for Stage B-Lite; identical frontend behavior |

All environments share the same frontend configuration (scripts, menu actions, logging).

---

## 4. Validation Requirements

Validation should follow the detailed checklist and confirm:
1. Cache menu buttons function end-to-end (memory/storage/IndexedDB/full clear) in dev & prod.  
2. CRUD operations update views immediately after cache clears/TTL expiry (Accounts, Preferences, Positions, Trades).  
3. Logs capture each cache clear and cache hit/miss.  
4. No remaining usage of non-central cache patterns.

---

## 5. Roadmap Alignment

Stage B-Lite prepares for the full architecture by:
1. Standardizing keys and clearing workflows.  
2. Cleaning up legacy cache paths.  
3. Providing developers a controlled environment to verify data freshness.  
4. Enabling future introduction of CacheSyncManager/PolicyManager and backend cache once approved.

Upcoming steps (post-approval):
- Stage D/E activities (merge/resync + validation runs).  
- Stage F specification outlining complete cache architecture.  
- Stage G implementation & deployment of the advanced system.

---

## 6. Pending Approval Checklist

- [ ] Stage B-Lite document reviewed.  
- [ ] General systems list and indexes updated.  
- [ ] Validation checklist acknowledged.  
- [ ] Development & production configurations aligned.

Upon approval, proceed to Stage D (merge/resync) followed by Stage E (validation execution).

