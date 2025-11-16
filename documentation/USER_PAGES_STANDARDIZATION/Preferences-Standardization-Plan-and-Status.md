## TikTrack — Preferences Page Standardization: Plan, Status, and Guidance

Author: Assistant (Cursor)  
Owner: Nimrod  
Scope: User Pages Standardization → Preferences (`trading-ui/preferences.html`)


### 1) Objective
Unify and harden the Preferences page so it consistently loads, validates, saves, and displays the user’s actual preferences across all sections. Ensure correctness under cache (dev/prod), profile switching, and legacy data formats, while instrumenting the pipeline for smart, low-noise tracing.


### 2) Page and Key Files
- UI page: `trading-ui/preferences.html`
- Page script: `trading-ui/scripts/preferences.js`
- Frontend services:
  - `trading-ui/scripts/services/preferences-data.js`
  - `trading-ui/scripts/preferences-validation.js`
  - `trading-ui/scripts/preferences-group-manager.js`
- Backend APIs:
  - `Backend/routes/api/preferences.py`
  - `Backend/services/preferences_service.py`
- Tests: `Backend/tests/test_routes/test_indexeddb_and_preferences_routes.py`


### 3) Full Work Plan (Phases and Tasks)
- prefs-map-names-to-fields: Map preference names to field IDs/names across all sections (basic_settings, colors_unified, trading_settings, filter_settings), including historical exceptions.
- prefs-normalize-all-endpoints: Enforce normalized key→value map for all/group/single fetches and auto-migrate old cached array formats.
- prefs-init-sequencing: Fix initialization order so a normalized payload is awaited before populating UI and saving initial state.
- prefs-allow-empty-rules: Define `allowEmpty` validation for legitimately empty fields (e.g., `default_trading_account`).
- prefs-color-keys: Verify all color preference key↔DOM ID mappings and add bi-directional normalization for color groups.
- prefs-types-audit-table: Load and render “Preference Types Audit” table reliably; force refresh after save.
- prefs-smart-trace: Add smart tracing across the pipeline (timings, item counts, cache layer used, list of unresolved fields).
- prefs-cache-policies: Align cache TTL/policies for dev vs prod and the clear-on-save flow.
- prefs-tests: Add focused tests: mapping, normalization, init order, colors, audit table.
- prefs-docs: Update documentation: system overview, loading order notes, troubleshooting.


### 4) Completed Work (Highlights)
- Fixed missing/legacy backend compatibility:
  - `Backend/services/preferences_service.py`:
    - `build_profile_context()` accepts extra kwargs (e.g., `use_cache`) and resolves profile context robustly.
    - `get_preferences_by_names()` supports `names`/`preference_names` for multi-fetch.
    - Reintroduced `db_path` for legacy scripts/tests compatibility.
  - `Backend/routes/api/preferences.py`:
    - `/user/multiple` correctly passes `names=preference_names` to the service.
    - `/user/single` now handles missing preferences gracefully: tries default, otherwise returns structured 404.
  - `Backend/routes/api/trade_conditions.py`: Replaced Python 3.10 union syntax with `Optional[]` (Python 3.9 compatibility).
  - Tests `Backend/tests/test_routes/test_indexeddb_and_preferences_routes.py`: updated to avoid direct sqlite access and added missing-preference 404 test.
- Frontend robustness and normalization:
  - `trading-ui/scripts/services/preferences-data.js`:
    - `normalizePreferencesPayload()` ensures a normalized map; migrates old array payloads to map.
    - Group loaders apply the same normalization.
  - `trading-ui/scripts/preferences-validation.js`:
    - Added `allowEmpty` semantics and applied to `default_trading_account`.
  - `trading-ui/scripts/preferences-group-manager.js`:
    - Population uses `CSS.escape()` for safe selectors.
    - Added `nameAliases` mapping (initial set) to reconcile backend keys and DOM IDs.
  - Moved `preferences.js` to `trading-ui/scripts/` and updated loaders to fix 404s.
- Data fixes:
  - Inserted missing preference types: `notification_mode`, `logLevel`, `verboseLogging` into SQLite with sane defaults.


### 5) Current State and Gaps
Current symptoms (reported):
- Some fields still show defaults instead of user data, notably:
  - Colors (many show black)
  - Default page size
  - Stop/Target/Commission trio
  - Preference Types Audit table is empty
- Root causes likely include a combination of:
  - Key↔DOM mapping drift (historic names vs new IDs).
  - Initialization timing: UI populated before normalized payload is ready.
  - Legacy payload formats lingering in cache.
  - Color group bi-directional normalization gaps (DOM→model, model→DOM).

Status of phases:
- Mapping: In progress. A first-pass `nameAliases` is added in `preferences-group-manager.js` to bridge canonical keys and DOM IDs.
- Normalization: Implemented at data service level; needs enforcement across all entry points and caches.
- Init sequencing: Pending finalization; currently not strictly awaiting normalized payload before populate.
- Allow-empty rules: Implemented for `default_trading_account`; needs review for other fields (if any).
- Color keys: Pending comprehensive bi-directional mapping verification.
- Types audit table: Pending reliable load + forced refresh after save.
- Smart trace: Partial (unresolved fields now logged during population); full timing and cache-layer tracing pending.
- Cache policies: Pending alignment and clear-on-save verification.
- Focused tests: Some back-end tests added; front-end unit/integration coverage pending for mapping/sequence/colors/table.
- Docs: This document created; system-level docs pending consolidation.


### 6) What’s Next (Actionable Tasks)
1) Finalize `prefs-map-names-to-fields`:
   - Validate `nameAliases` against `preferences.html` for all groups: basic_settings, trading_settings, filter_settings, colors_unified, chart_settings_unified.
   - Ensure reverse mapping DOM→canonical exists when collecting data to save.
   - Add targeted logs listing unresolved fields after population per section.
2) Enforce normalization across all endpoints:
   - Force normalized map at `preferences-data.js` for single/group/all; auto-migrate cache entries.
   - Add a cache version key to distinguish old/new formats and trigger migration.
3) Fix init sequencing:
   - Defer UI population until normalized payload + profile context are resolved.
   - Gate “refresh after save” to the same normalized pipeline.
4) Colors bi-directional normalization:
   - Map every color preference to an input by `id`/`name` and ensure conversions are symmetric.
   - Verify default fallbacks are not masking missing values; log unresolved color keys.
5) Preference Types Audit table:
   - Ensure data source returns records; wire forced refresh after save completes.
6) Smart tracing:
   - Add timings, counts (loaded keys, populated fields), cache layer used (memory/IndexedDB/backend), and unresolved list.
7) Cache policies and clear-on-save:
   - Align TTLs for dev/prod; confirm clear-on-save invalidates correct layers then re-hydrates before UI paint.
8) Tests:
   - Frontend unit/integration: mapping (aliases), normalization, init order, colors, audit table flow.
9) Docs:
   - Update preferences system documentation and loading order notes; include troubleshooting matrix.


### 7) Technical Guidance and Conventions
- Always use general systems first (FieldRendererService, ModalManagerV2, CRUDResponseHandler, UnifiedCacheManager).
- Never fabricate defaults: if data is missing, surface via the notification system; do not invent values.
- Use `CSS.escape()` for dynamic selectors.
- Validation: define `allowEmpty` only where business rules allow empty; otherwise enforce types/ranges.
- Cache: prefer unified cache; migrate legacy formats on read; avoid split logic.
- Logging: route through the central Logger; keep logs structured and low-noise.


### 8) Appendix — Reference Changes (Selected Diffs/Notes)
- `preferences_service.py`:
  - `build_profile_context()` extended signature; returns `versions`, `generated_at`.
  - `get_preferences_by_names()` accepts `names`/`preference_names` and returns a key→value map.
- `preferences.py` routes:
  - `/user/multiple` passes `names=preference_names`; `/user/single` returns safe 404 with context.
- `preferences-data.js`:
  - `normalizePreferencesPayload()` coerces arrays to map; preserves `profileContext`.
- `preferences-validation.js`:
  - `allowEmpty` support; `default_trading_account` uses it.
- `preferences-group-manager.js`:
  - Safe selectors via `CSS.escape()`; added `nameAliases` map (first pass) and unresolved field logging.


### 9) Ownership and Review
- Implementation: Assistant (Cursor), under Nimrod’s direction.
- Review/Acceptance: Nimrod.
- Release: per production process (`documentation/production/UPDATE_PROCESS.md`), after full test pass and cache policy alignment.



