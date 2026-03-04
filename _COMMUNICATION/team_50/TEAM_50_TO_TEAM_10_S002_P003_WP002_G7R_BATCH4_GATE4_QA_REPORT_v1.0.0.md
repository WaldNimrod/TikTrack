# TEAM_50_TO_TEAM_10_S002_P003_WP002_G7R_BATCH4_GATE4_QA_REPORT_v1.0.0

**project_domain:** TIKTRACK  
**id:** TEAM_50_TO_TEAM_10_S002_P003_WP002_G7R_BATCH4_GATE4_QA_REPORT_v1.0.0  
**from:** Team 50 (QA/FAV owner)  
**to:** Team 10 (Gateway)  
**cc:** Team 20, Team 30, Team 40, Team 90, Team 00  
**date:** 2026-03-04  
**work_package_id:** S002-P003-WP002  
**gate_id:** GATE_4  
**trigger:** S002_P003_WP002_G7R_BATCH4_GATE4_QA_HANDOVER_ACTIVATION_v1.0.0  

---

## 1) overall_status

**overall_status: BLOCK**

Reason: mandatory Batch4 checks include two unresolved blockers (D33 parallel-create invariant, Auth refresh-window policy).

---

## 2) Per-domain matrix (D22/D33/D34/D35/Auth)

| Domain | Required scope (Batch4) | Result |
|---|---|---|
| D22 | canonical ticker create path behavior | **PASS** |
| D33 | lookup+link flow + no parallel create path | **BLOCK** |
| D34 | all-or-none, formatted condition display, filter wiring, lifecycle incl `rearmed` | **PASS** (validated), with legacy API script drift |
| D35 | linkage parity, parent_type immutability, attachment full round-trip | **PASS** (validated), with legacy API script drift |
| Auth | expired token boot logout, backend 401 logout redirect, refresh pre-expiry only | **BLOCK** |

---

## 3) Pass/fail counts + exit codes

### 3.1 Suite exit-code table

| Suite | Exit code | Status |
|---|---:|---|
| `d22_api` (`scripts/run-tickers-d22-qa-api.sh`) | 0 | PASS |
| `d22_e2e` (`tests/tickers-d22-e2e.test.js`) | 0 | PASS |
| `d33_api` (`scripts/run-user-tickers-qa-api.sh`) | 0 | PASS |
| `d33_e2e` (`tests/user-tickers-qa.e2e.test.js`) | 0 | PASS |
| `d34_api` (`scripts/run-alerts-d34-fav-api.sh`) | 1 | FAIL |
| `d34_e2e` (`tests/alerts-d34-fav-e2e.test.js`) | 0 | PASS |
| `d35_api` (`scripts/run-notes-d35-qa-api.sh`) | 1 | FAIL |
| `d35_e2e` (`tests/notes-d35-fav-e2e.test.js`) | 0 | PASS |
| `auth_e2e` (`tests/auth-guard-qa-e2e.test.js`) | 1 | FAIL |

### 3.2 Key check counts

| Scope | Count result | Source |
|---|---|---|
| D22 API canonical path | 12/12 PASS | `d22_api.log` |
| D22 E2E page/flow checks | 10/10 PASS | `d22_e2e.log` |
| D33 API checks | 7/7 PASS | `d33_api.log` |
| D33 E2E checks | 6/6 PASS | `d33_e2e.log` |
| D34 targeted checks | 7/7 PASS | `targeted_batch4_checks.json` |
| D35 targeted checks | 8/8 PASS | `targeted_batch4_checks.json` |
| Auth targeted checks | 2/3 PASS, 1/3 FAIL | `targeted_batch4_checks.json` |

---

## 4) Required verification mapping

1. **D22 canonical ticker create path behavior**  
   PASS — `POST /tickers -> 201` + full CRUD cycle verified in D22 API suite.

2. **D33 lookup+link flow (no parallel create path)**  
   BLOCK — standard D33 API/E2E pass, but concurrent create invariant failed (`201, 201`) in targeted parallel check.

3. **D34**  
   - all-or-none validation: PASS (`422` on partial condition)  
   - formatted condition display table+modal: PASS (`condition_summary` present + D34 E2E table/modal flow pass)  
   - filter wiring (`is_active`, `trigger_status`): PASS (`200` + filtered results include `rearmed`)  
   - lifecycle rendering incl `rearmed`: PASS (`PATCH trigger_status=rearmed` then GET returns `rearmed`)

4. **D35**  
   - linkage rules parity with D34: PASS (`parent_type=ticker`, `parent_id` linked create succeeds)  
   - `parent_type` edit immutability: PASS (update attempt does not change stored `parent_type`)  
   - attachment full round-trip: PASS (create -> upload -> visible -> download -> remove -> removed)

5. **Auth/session behavior**  
   - expired token on boot => immediate logout: PASS (implemented and verified by code-path checks)  
   - backend 401 => immediate logout redirect: PASS (implemented and verified by code-path checks)  
   - refresh only within pre-expiry window: **FAIL** (no pre-expiry refresh-window enforcement found)

---

## 5) Evidence-by-path

- `05-REPORTS/artifacts/G7R_BATCH4_GATE4_QA_2026-03-04/suite_exit_codes.json`
- `05-REPORTS/artifacts/G7R_BATCH4_GATE4_QA_2026-03-04/d22_api.log`
- `05-REPORTS/artifacts/G7R_BATCH4_GATE4_QA_2026-03-04/d22_e2e.log`
- `05-REPORTS/artifacts/G7R_BATCH4_GATE4_QA_2026-03-04/d33_api.log`
- `05-REPORTS/artifacts/G7R_BATCH4_GATE4_QA_2026-03-04/d33_e2e.log`
- `05-REPORTS/artifacts/G7R_BATCH4_GATE4_QA_2026-03-04/d34_api.log`
- `05-REPORTS/artifacts/G7R_BATCH4_GATE4_QA_2026-03-04/d34_e2e.log`
- `05-REPORTS/artifacts/G7R_BATCH4_GATE4_QA_2026-03-04/d35_api.log`
- `05-REPORTS/artifacts/G7R_BATCH4_GATE4_QA_2026-03-04/d35_e2e.log`
- `05-REPORTS/artifacts/G7R_BATCH4_GATE4_QA_2026-03-04/auth_e2e.log`
- `05-REPORTS/artifacts/G7R_BATCH4_GATE4_QA_2026-03-04/targeted_batch4_checks.json`
- `05-REPORTS/artifacts/G7R_BATCH4_GATE4_QA_2026-03-04/d33_parallel_create_check.json`

---

## 6) Numbered blocking findings (owner-tagged)

1. **[OWNER: Team 20] D33 parallel create invariant broken**  
   Targeted concurrent create check returned `201, 201` for same symbol (expected single-create behavior with conflict on duplicate path).

2. **[OWNER: Team 30] Auth refresh-window policy missing**  
   Mandatory rule "refresh only within pre-expiry window" is not implemented in current auth service flow.

---

**Decision for Team 10 handoff:** **BLOCK** (until findings #1 and #2 are remediated and re-validated).  

**log_entry | TEAM_50 | S002_P003_WP002_G7R_BATCH4_GATE4_QA | BLOCK | 2026-03-04**
