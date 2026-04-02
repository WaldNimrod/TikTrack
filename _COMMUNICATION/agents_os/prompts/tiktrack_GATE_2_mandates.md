date: 2026-03-25
historical_record: true

⛔ **OPERATOR-ONLY — DO NOT TOUCH PIPELINE CLI**

⛔ DO NOT run `./pipeline_run.sh` or any pipeline CLI command.
⛔ DO NOT advance the gate or modify pipeline state.
✅ Save your artifact to the canonical path below.
✅ Notify Nimrod. Nimrod runs all pipeline commands.

---

# Mandates — S003-P004-WP001  ·  GATE_2

**Spec:** S003-P004 D33 User Tickers (My Tickers page) — personal watchlist, live prices, display_name Iron Rule (never show raw symbol), filtering/sorting/pagination. LOD200: _COMMUNICATION/team_100/TEAM_100_S003_P004_WP001_LOD200_v1.0.0.md

**Canonical date:** Use `date -u +%F` for today; replace {{date}} in identity headers.

════════════════════════════════════════════════════════════
  EXECUTION ORDER
════════════════════════════════════════════════════════════

  Phase 1:  GATE_2 Phase 2.1   ← runs alone
             ↓  Phase 2 starts ONLY after Phase 1 completes
             💻  Phase 1 done?  →  ./pipeline_run.sh --domain tiktrack phase2
             📄 GATE_2 Phase 2.1v reads coordination data from GATE_2 Phase 2.1

  Phase 2:  GATE_2 Phase 2.1v   ← runs alone
             ↓  Phase 3 starts ONLY after Phase 2 completes
             💻  Phase 2 done?  →  ./pipeline_run.sh --domain tiktrack phase3

  Phase 3:  GATE_2 Phase 2.2   ← runs alone
             ↓  Phase 4 starts ONLY after Phase 3 completes
             💻  Phase 3 done?  →  ./pipeline_run.sh --domain tiktrack phase4
             📄 GATE_2 Phase 2.2v reads coordination data from GATE_2 Phase 2.2

  Phase 4:  GATE_2 Phase 2.2v   ← runs alone
             ↓  Phase 5 starts ONLY after Phase 4 completes
             💻  Phase 4 done?  →  ./pipeline_run.sh --domain tiktrack phase5

  Phase 5:  GATE_2 Phase 2.3   ← runs alone

════════════════════════════════════════════════════════════

## GATE_2 Phase 2.1 — LLD400 reference (Phase 1)

### GATE_2 Phase 2.1 — LLD400 baseline (completed in GATE_1)

**Environment:** Team 170 output — read-only reference for downstream phases.

- **LLD400 path:** `_COMMUNICATION/team_170/TEAM_170_S003_P004_WP001_LLD400_v1.0.0.md`
- **Identity:** gate=GATE_1 | wp=S003-P004-WP001 | date≤2026-03-25

No new authoring here — Phase 2.1 is **documentation of the approved spec** entering GATE_2.


**Output — write to:**
`_COMMUNICATION/team_170/TEAM_170_S003_P004_WP001_LLD400_v1.0.0.md`

### Acceptance
- LLD400 on disk: `_COMMUNICATION/team_170/TEAM_170_S003_P004_WP001_LLD400_v1.0.0.md`
- Matches GATE_1 completion

────────────────────────────────────────────────────────────
  ✅  YOUR MANDATE (Phase 1) IS COMPLETE WHEN you save your delivery artifact.
  ⚠️  DO NOT run pipeline_run.sh commands — the operator (Nimrod) controls pipeline advancement.
  ℹ️  OPERATOR NOTE: after Phase 1 delivery confirmed, run:
       ./pipeline_run.sh --domain tiktrack phase2
     (regenerates mandates with Phase 1 output → activates Phase 2)
────────────────────────────────────────────────────────────

## GATE_2 Phase 2.1v — GATE_1 verdict (Phase 2)

⚠️  PREREQUISITE: **GATE_2 Phase 2.1** must be COMPLETE before starting this mandate.

### GATE_2 Phase 2.1v — Team 190 constitutional validation (from GATE_1)

**Read:** `_COMMUNICATION/team_190/TEAM_190_S003_P004_WP001_GATE_1_VERDICT_v1.0.0.md`

Team 190 already validated LLD400 at GATE_1. If this verdict is PASS, proceed to Phase 2.2 (work plan).
If BLOCK, resolve via GATE_1 correction cycle before executing Phase 2.2.


**Output — write to:**
`_COMMUNICATION/team_190/TEAM_190_S003_P004_WP001_GATE_1_VERDICT_v1.0.0.md`

### Coordination Data — LLD400

✅  Auto-loaded: `_COMMUNICATION/team_170/TEAM_170_S003_P004_WP001_LLD400_v1.0.0.md`

```
# Team 170 — LLD400 | S003-P004-WP001 — D33 User Tickers (My Tickers)

**Document:** `TEAM_170_S003_P004_WP001_LLD400_v1.0.0.md`  
**From:** Team 170 (Spec & Governance — TikTrack lane)  
**To:** Team 190 (Phase 2 validation) · Team 10 (Gateway) · Teams 20 / 30 / 50 (execution & QA)  
**status:** AS_MADE (Phase 1 spec delivery)  
**spec_version:** 1.0.0  
**normative_baseline:** `_COMMUNICATION/team_100/TEAM_100_S003_P004_WP001_LOD200_v1.0.0.md` (LOCKED)

---

## 1. Identity Header

`gate: GATE_1 | wp: S003-P004-WP001 | stage: S003 | domain: tiktrack | date: 2026-03-25`

| Field | Value |
|-------|-------|
| roadmap_program | S003-P004 |
| work_package_id | S003-P004-WP001 |
| page / module | D33 — הטיקרים שלי (`user_tickers` / My Tickers) |
| architectural_approval_type | SPEC (LLD400) |
| phase_owner | Team 10 |

---

## 2. Endpoint Contract

### 2.1 Scope and base URL

- **API base:** `settings.api_v1_prefix` = `/api/v1` (FastAPI mount).
- **Logical resource:** Authenticated user’s watchlist rows in `user_data.user_tickers`, joined to `market_data.tickers`, enriched with live/EOD price fields per existing SSOT (`_get_price_with_fallback` and related).
- **Stakeholder alias:** Any reference to “GET /user_tickers” in legacy language maps to **`GET /api/v1/me/tickers`** (no separate `GET /api/v1/user_tickers` required).

### 2.2 `GET /api/v1/me/tickers` — list (extended)

| Item | Specification |
|------|----------------|
| Method | `GET` |
| Path | `/api/v1/me/tickers` |
| A
```
_[… content truncated at 1500 chars]_


### Acceptance
- Verdict: `_COMMUNICATION/team_190/TEAM_190_S003_P004_WP001_GATE_1_VERDICT_v1.0.0.md`
- PASS or correction cycle complete

────────────────────────────────────────────────────────────
  ✅  YOUR MANDATE (Phase 2) IS COMPLETE WHEN you save your delivery artifact.
  ⚠️  DO NOT run pipeline_run.sh commands — the operator (Nimrod) controls pipeline advancement.
  ℹ️  OPERATOR NOTE: after Phase 2 delivery confirmed, run:
       ./pipeline_run.sh --domain tiktrack phase3
     (regenerates mandates with Phase 2 output → activates Phase 3)
────────────────────────────────────────────────────────────

## GATE_2 Phase 2.2 — Team 10 work plan (Phase 3)

⚠️  PREREQUISITE: **GATE_2 Phase 2.1v** must be COMPLETE before starting this mandate.

### GATE_2 Phase 2.2 — Team 10 work plan

Produce / revise the versioned work plan for `S003-P004-WP001`.

- **Save to:** `_COMMUNICATION/team_10/TEAM_10_S003_P004_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md`
- **Full mandate engine:** same rules as legacy G3_PLAN — see also `G3_PLAN_mandates.md` in prompts/.

**Spec excerpt:**

```
# Team 170 — LLD400 | S003-P004-WP001 — D33 User Tickers (My Tickers)

**Document:** `TEAM_170_S003_P004_WP001_LLD400_v1.0.0.md`  
**From:** Team 170 (Spec & Governance — TikTrack lane)  
**To:** Team 190 (Phase 2 validation) · Team 10 (Gateway) · Teams 20 / 30 / 50 (execution & QA)  
**status:** AS_MADE (Phase 1 spec delivery)  
**spec_version:** 1.0.0  
**normative_baseline:** `_COMMUNICATION/team_100/TEAM_100_S003_P004_WP001_LOD200_v1.0.0.md` (LOCKED)

---

## 1. Identity Header

`gate: GATE_1 | wp: S003-P004-WP001 | stage: S003 | domain: tiktrack | date: 2026-03-25`

| Field | Value |
|-------|-------|
| roadmap_program | S003-P004 |
| work_package_id | S003-P004-WP001 |
| page / module | D33 — הטיקרים שלי (`user_tickers` / My Tickers) |
| architectural_approval_type | SPEC (LLD400) |
| phase_owner | Team 10 |

---

## 2. Endpoint Contract

### 2.1 Scope and base URL

- **API base:** `settings.api_v1_prefix` = `/api/v1` (FastAPI mount).
- **Logical resource:** Authenticated user’s watchlist rows in `user_data.user_tickers`, joined to `market_data.tickers`, enriched with live/EOD price fields per existing SSOT (`_get_price_with_fallback` and related).
- **Stakeholder alias:** Any reference to “GET /user_tickers” in legacy language maps to **`GET /api/v1/me/tickers`** (no separate `GET /api/v1/user_tickers` required).

### 2.2 `GET /api/v1/me/tickers` — list (extended)

| Item | Specification |
|------|----------------|
| Method | `GET` |
| Path | `/api/v1/me/tickers` |
| Auth | Required — Bearer JWT / existing session contract. |
| Request body | None. |

**Query parameters (all optional; omission = defaults):**

| Parameter | Type | Default | Constraints |
|-----------|------|---------|-------------|
| `ticker_type` | string, **repeatable** (multi-value) | (none) | Each value ∈ `TICKER_TYPES` SSOT (e.g. `STOCK`, `ETF`, `CRYPTO`, …). OR semantics: row matches if `market_data.tickers.ticker_type` equals any supplied value. |
| `status` | string | (none) | Filters **`user_data.user_tickers.status`**: `active` \| `inactive`. When omitted, no filter on user watchlist status. |
| `sector_id` | string (ULID) | (none) | Filter: `market_data.tickers.sector_id` equals this id. |
| `market_cap_group_id` | string (ULID) | (none) | Filter: `market_data.tickers.market_cap_group_id` equals this id. |
| `sort_by` | string | `display_name` | Allowed: `display_name` \| `company_name` \| `current_price` \| `daily_change_pct` \| `ticker_type` \| `currency` \| `exchange_code` \| `status` \| `price_source` — each MUST correspond to a server-side sortable expression tied to the joined row (see §3.4). |
| `sort_dir` | string | `asc` | `asc` \| `desc`. |
| `page` | integer | `1` | ≥ 1. |
| `page_size` | integer | `25` | ≥ 1, **max 50** (hard cap per D33-IR-03). |

**Sorting nulls (normative):** For `sort_by=display_name` (and other nullable keys), **ASC → nulls last; DESC → nulls first** (per LOD200 risk register).

**Response schema — extended list envelope:**

JSON object:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `data` | `TickerResponse[]` | Yes | Page slice only (length ≤ `page_size`). |
| `total` | integer | Yes | Total rows matching filters **before** pagination. |
| `page` | integer | Yes | Current page (1-based). |
| `page_size` | integer | Yes | Effective page size (≤ 50). |

**`TickerResponse`** — unchanged field set vs `api/schemas/tickers.py` for this WP (ULID `id`, `symbol`, `display_name`, `company_name`, `tic
```


**Output — write to:**
`_COMMUNICATION/team_10/TEAM_10_S003_P004_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md`

### Acceptance
- Plan saved: `_COMMUNICATION/team_10/TEAM_10_S003_P004_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md`
- Nimrod runs `phase2` then `pass` to reach 2.2v

────────────────────────────────────────────────────────────
  ✅  YOUR MANDATE (Phase 3) IS COMPLETE WHEN you save your delivery artifact.
  ⚠️  DO NOT run pipeline_run.sh commands — the operator (Nimrod) controls pipeline advancement.
  ℹ️  OPERATOR NOTE: after Phase 3 delivery confirmed, run:
       ./pipeline_run.sh --domain tiktrack phase4
     (regenerates mandates with Phase 3 output → activates Phase 4)
────────────────────────────────────────────────────────────

## GATE_2 Phase 2.2v — Plan validation (Phase 4)

⚠️  PREREQUISITE: **GATE_2 Phase 2.2** must be COMPLETE before starting this mandate.

### GATE_2 Phase 2.2v — Team 90 work-plan validation

**Output verdict:** `_COMMUNICATION/team_90/TEAM_90_S003_P004_WP001_G3_5_VERDICT_v1.0.0.md`

Validate implementation readiness of the work plan (same bar as G3_5).
Use stored `work_plan` in pipeline state + file `_COMMUNICATION/team_10/TEAM_10_S003_P004_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md`.


**Output — write to:**
`_COMMUNICATION/team_90/TEAM_90_S003_P004_WP001_G3_5_VERDICT_v1.0.0.md`

### Coordination Data — Work plan

⚠️  File not yet available. Searched (in order):
  - `_COMMUNICATION/team_10/TEAM_10_S003_P004_WP001_G3_PLAN_WORK_PLAN_v1.0.0.md`

→ Complete the prerequisite team's work first.
→ Re-generate after: `./pipeline_run.sh` injects real data.


### Acceptance
- PASS/FAIL with route_recommendation
- Verdict: `_COMMUNICATION/team_90/TEAM_90_S003_P004_WP001_G3_5_VERDICT_v1.0.0.md`

────────────────────────────────────────────────────────────
  ✅  YOUR MANDATE (Phase 4) IS COMPLETE WHEN you save your delivery artifact.
  ⚠️  DO NOT run pipeline_run.sh commands — the operator (Nimrod) controls pipeline advancement.
  ℹ️  OPERATOR NOTE: after Phase 4 delivery confirmed, run:
       ./pipeline_run.sh --domain tiktrack phase5
     (regenerates mandates with Phase 4 output → activates Phase 5)
────────────────────────────────────────────────────────────

## GATE_2 Phase 2.3 — Architect sign-off (Phase 5)

⚠️  PREREQUISITE: **GATE_2 Phase 2.2v** must be COMPLETE before starting this mandate.

### GATE_2 Phase 2.3 — Architectural review (team_102)

**Verdict artifact (typical):** `_COMMUNICATION/team_102/TEAM_102_S003_P004_WP001_GATE_2_VERDICT_v1.0.0.md`

Combined LLD400 + work-plan sign-off. Respond APPROVED / REJECTED with `route_recommendation` if rejected.
**After verdict:** operator runs precision `pass` — agents do **not** run pipeline CLI.


**Output — write to:**
`_COMMUNICATION/team_102/TEAM_102_S003_P004_WP001_GATE_2_VERDICT_v1.0.0.md`

### Acceptance
- APPROVED or REJECTED + route
- Operator runs precision pass
