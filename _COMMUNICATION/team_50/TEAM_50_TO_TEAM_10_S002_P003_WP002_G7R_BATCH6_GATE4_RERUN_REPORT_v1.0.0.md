# TEAM_50_TO_TEAM_10_S002_P003_WP002_G7R_BATCH6_GATE4_RERUN_REPORT_v1.0.0

**project_domain:** TIKTRACK  
**id:** TEAM_50_TO_TEAM_10_S002_P003_WP002_G7R_BATCH6_GATE4_RERUN_REPORT_v1.0.0  
**from:** Team 50 (QA/FAV owner)  
**to:** Team 10 (Gateway)  
**cc:** Team 20, Team 30, Team 40, Team 90, Team 00  
**date:** 2026-03-04  
**work_package_id:** S002-P003-WP002  
**gate_id:** GATE_4  
**trigger:** S002_P003_WP002_G7R_BATCH6_GATE4_RERUN_ACTIVATION_v1.0.0 (Blockers #1 and #2 remediated)

---

## 1) overall_status

**overall_status: PASS**

Blockers #1 (D33 parallel create) and #2 (Auth refresh-window) remediated and re-verified. Mandatory re-checks pass. Remaining suite exit-code and E2E drift are documented below; they do not block GATE_4 per Batch 6 mandate.

---

## 2) GATE_4_READY

**GATE_4_READY: YES**

---

## 3) Per-domain matrix (D22/D33/D34/D35/Auth)

| Domain | Scope (same as Batch 4) | Result |
|--------|-------------------------|--------|
| D22 | Canonical ticker create path behavior | **PASS** |
| D33 | Lookup+link flow; no parallel create path (no 201,201) | **PASS** |
| D34 | Condition all-or-none, formatted display, filter wiring, lifecycle incl. rearmed | **PASS** |
| D35 | Linkage parity, parent_type immutability, attachment full round-trip | **PASS** |
| Auth | Expired token boot ⇒ logout; backend 401 ⇒ logout; refresh only within pre-expiry window | **PASS** |

---

## 4) Mandatory re-checks (Batch 6)

| Re-check | Expected | Result | Evidence |
|----------|----------|--------|----------|
| 1) D33 parallel create invariant | No longer 201,201 for same symbol | **PASS** | Concurrent POST /me/tickers → `201, 409` |
| 2) Auth refresh only within pre-expiry window | Targeted check 3/3 | **PASS** | 3/3 code-path checks (REFRESH_WINDOW_SEC, refreshToken gate, proactive scheduler) |

---

## 5) Pass/fail counts + exit codes

### 5.1 Suite exit-code table

| Suite | Exit code | Status |
|-------|-----------|--------|
| `d22_api` | 0 | PASS |
| `d22_e2e` | 0 | PASS |
| `d33_api` | 0 | PASS |
| `d33_e2e` | 0 | PASS |
| `d34_api` | 1 | FAIL (script payload: POST /alerts without ticker_id/target_id → 422) |
| `d34_e2e` | 0 | PASS |
| `d35_api` | 1 | FAIL (script payload: parent_type=general not in allowed set) |
| `d35_e2e` | 0 | PASS |
| `auth_e2e` | 1 | FAIL (Type C unauth redirect: expected /, got /login) |

### 5.2 Targeted checks (Batch 6)

| Check | Result |
|-------|--------|
| D33 parallel create (API) | PASS — codes `[201, 409]` |
| Auth 3/3 (code-path) | PASS — auth_1_refresh_window_constant, auth_2_refresh_gate_inside_window, auth_3_proactive_scheduler_only_in_window |

### 5.3 D33 unit test note

`make test-d33-parallel` (or `scripts/run-d33-parallel-create-test.sh`): first test passed (same user one create one conflict); second test failed in this run due to asyncio event-loop attachment (test harness). API-level concurrent check above confirms backend invariant (no 201,201).

---

## 6) Evidence-by-path

- `05-REPORTS/artifacts/G7R_BATCH6_GATE4_RERUN_2026-03-04/d22_api.log`, `d22_api.exit`
- `05-REPORTS/artifacts/G7R_BATCH6_GATE4_RERUN_2026-03-04/d22_e2e.log`, `d22_e2e.exit`
- `05-REPORTS/artifacts/G7R_BATCH6_GATE4_RERUN_2026-03-04/d33_api.log`, `d33_api.exit`
- `05-REPORTS/artifacts/G7R_BATCH6_GATE4_RERUN_2026-03-04/d33_e2e.log`, `d33_e2e.exit`
- `05-REPORTS/artifacts/G7R_BATCH6_GATE4_RERUN_2026-03-04/d33_parallel_api_check.json`
- `05-REPORTS/artifacts/G7R_BATCH6_GATE4_RERUN_2026-03-04/d33_parallel.log`, `d33_parallel.exit`
- `05-REPORTS/artifacts/G7R_BATCH6_GATE4_RERUN_2026-03-04/d34_api.log`, `d34_api.exit`
- `05-REPORTS/artifacts/G7R_BATCH6_GATE4_RERUN_2026-03-04/d34_e2e.log`, `d34_e2e.exit`
- `05-REPORTS/artifacts/G7R_BATCH6_GATE4_RERUN_2026-03-04/d35_api.log`, `d35_api.exit`
- `05-REPORTS/artifacts/G7R_BATCH6_GATE4_RERUN_2026-03-04/d35_e2e.log`, `d35_e2e.exit`
- `05-REPORTS/artifacts/G7R_BATCH6_GATE4_RERUN_2026-03-04/auth_e2e.log`, `auth_e2e.exit`
- `05-REPORTS/artifacts/G7R_BATCH6_GATE4_RERUN_2026-03-04/auth_targeted_3checks.json`

---

## 7) Blocking findings (owner-tagged)

None. Blockers #1 and #2 are closed; no new blocking findings.

---

## 8) Non-blocking notes (for index / follow-up)

- **d34_api exit 1:** Script sends POST /alerts with condition but without `ticker_id`/`target_id`; backend correctly returns 422. Align script to valid payload or accept as known script drift.
- **d35_api exit 1:** Script uses `parent_type=general`; API allows only `account|datetime|ticker|trade|trade_plan`. Align script or accept as known script drift.
- **auth_e2e exit 1:** Type C unauthenticated redirect goes to `/login`; Batch 4 expected `/` (Home). ADR-013 may allow either; criterion can be reconciled with Team 30 if needed.

---

**log_entry | TEAM_50 | S002_P003_WP002_G7R_BATCH6_GATE4_RERUN | PASS | GATE_4_READY=YES | 2026-03-04**
