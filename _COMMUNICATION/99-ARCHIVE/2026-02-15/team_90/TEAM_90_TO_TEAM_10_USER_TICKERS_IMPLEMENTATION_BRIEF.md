# Team 90 → Team 10: User Tickers ("הטיקרים שלי") — Implementation Brief

**id:** `TEAM_90_TO_TEAM_10_USER_TICKERS_IMPLEMENTATION_BRIEF`  
**from:** Team 90 (The Spy)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-14  
**status:** ⚠️ **BLOCKED — Requires GIN decisions before execution**  

---

## 1) Sources (SSOT / Evidence)

- Readiness report: `documentation/05-REPORTS/artifacts_SESSION_01/USER_TICKER_PAGE_READINESS_REPORT.md`
- Blueprint spec: `_COMMUNICATION/team_31/team_31_staging/TEAM_31_USER_TICKER_COMPLETE_SPEC.md`
- Menu route: `ui/src/views/shared/unified-header.html` → `/user_ticker.html`
- Roadmap reference: `PHOENIX_UNIFIED_MODULAR_ROADMAP_V2_1.md` (USER_TICKERS)

---

## 2) Current State (Fact)

### UI
- **Route/menu exists:** `/user_ticker.html` in header + routes.
- **Blueprint exists:** `user_ticker_BLUEPRINT.html` (Team 31).
- **Spec exists:** TEAM_31_USER_TICKER_COMPLETE_SPEC.md.
- **Missing in code:** `user_ticker.html`, PageConfig, TableInit, Form integration.

### Backend / DB
- **Admin tickers API exists:** `/tickers`, `/tickers/summary`, CRUD — Admin-only.
- **User tickers API missing:** no `/me/tickers`.
- **No DB join table:** `user_data.user_tickers` not present.
- **watch_lists not present** (referenced in blueprint/spec).

---

## 3) GIN Decisions Required (Blocking)

### 3.1 Definition: "My Tickers"
Select one source of truth (must be explicit):
1. **Derived-only**: Union of `trades + alerts + trade_plans` (no extra table).
2. **Dedicated join table**: `user_data.user_tickers` (recommended if user can add/remove).
3. **Watch lists**: Wait until watch_lists model exists.

### 3.2 "Add ticker that does not exist" — **Decision Locked**
Requirement from owner: user must be able to add a **new system ticker** from the "My Tickers" flow.

**Policy (locked):**
- **Allow inline create** inside the add module (user can add a ticker not in system).
- Creation **must include a live data-load check** (see §4.1).

**Implications:**
- System ticker is created **only if** provider returns valid data (at least EOD/last price).
- If provider fails → show error, **do not create** ticker.

### 3.3 User actions scope
Define what the user can edit:
- **Option A:** only membership in "my tickers" (add/remove).
- **Option B:** allow user‑specific fields (notes/aliases) → requires user-level table.

---

## 4) Implementation Plan (after GIN)

### 4.1 Backend (Team 20)
If GIN = join table:
- Create `user_data.user_tickers (user_id, ticker_id, created_at, deleted_at)` + migration.
- Add API:
  - `GET /me/tickers` (list for current user)
  - `POST /me/tickers` (add existing **or create new system ticker + add**)
  - `DELETE /me/tickers/{ticker_id}` (remove from list)
- Enforce auth + tenant filtering.

**Live data-load check (required):**
- On create (new ticker): attempt provider fetch (Yahoo→Alpha) for last/EOD price.
- If fetch fails → return error; **do not create** ticker.
- If fetch succeeds → create `market_data.tickers` + link to user.

If GIN = derived-only:
- Implement `GET /me/tickers` via union queries (trades/alerts/plans).
- **No POST/DELETE** (read-only).

### 4.2 Frontend (Team 30)
- Clone `tickers.html` → `user_ticker.html` (title/labels adjusted).
- TableInit: use `/me/tickers` data source.
- Actions: Add/Remove per GIN; Edit is **not** Admin edit.
- Add flow must include **inline "create new ticker"** (within add modal).
- Error on create must show **provider failure** (data not available).

### 4.3 Infra (Team 60)
- No cron changes unless new table requires cleanup (soft delete).

### 4.4 Team 10 (Coordination)
- Lock GIN decision in SSOT.
- Update roadmap/MASTER_TASK_LIST + OPEN_TASKS.
- Issue mandates to Team 20/30.

---

## 5) Acceptance Criteria (must be explicit)

- `/user_ticker.html` loads in dev/build and appears in menu.
- Data source = `/me/tickers` (or documented derived source if read-only).
- Add/remove works and persists per GIN.
- Adding a **new** ticker triggers **live data-load check**; creation fails if provider returns no data.
- User cannot edit system ticker metadata.
- All logic aligned to SSOT decision + evidence log updated.

---

## 6) Recommendation (Spy)

Given the requirement "user can add a ticker not in system":
**Recommend GIN = Dedicated join table + controlled creation flow**, because:
- Derived-only cannot persist manual additions.
- Watch_lists is not implemented yet.

This requires a clear policy on creating new system tickers (now locked above), including live data-load check.

---

**Next Action:** Team 10 must resolve GIN decisions (§3), then issue mandates. Without that, implementation cannot be accurate.

**log_entry | TEAM_90 | USER_TICKERS_IMPLEMENTATION_BRIEF | 2026-02-14**
