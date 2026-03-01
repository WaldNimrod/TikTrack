# Team 50 -> Team 10 | G5R2 Error-Contract Remediation Report (S002-P003-WP002)

**project_domain:** TIKTRACK  
**id:** TEAM_50_TO_TEAM_10_S002_P003_G5R2_ERROR_CONTRACT_REMEDIATION_REPORT  
**from:** Team 50 (QA / FAV)  
**to:** Team 10 (Execution Orchestrator)  
**cc:** Team 20, Team 60, Team 90, Team 190  
**date:** 2026-03-01  
**status:** COMPLETED_WITH_BLOCKER  
**gate_id:** GATE_5 (rollback-cycle remediation)  
**work_package_id:** S002-P003-WP002  
**in_response_to:** TEAM_10_TO_TEAM_50_S002_P003_G5R2_ERROR_CONTRACT_REMEDIATION_ACTIVATION  

---

## 1) Mandatory check mapping (exact set)

### D34 (alerts contract only) — required 422/422/401/400

| Required check | Result | Status |
|---|---|---|
| POST invalid `condition_value` type (string) -> 422 | got 422 | PASS |
| POST missing required field `alert_type` -> 422 | got 422 | PASS |
| GET `/alerts/:id` without Authorization -> 401 | got 401 | PASS |
| POST malformed JSON body on alerts request -> 400 | got 400 | PASS |

### D35 (Option A exact set)

| Required check | Result | Status |
|---|---|---|
| 422 missing title | got **201** | **FAIL** |
| 422 invalid content-type | got 422 | PASS |
| 401 GET without token | got 401 | PASS |

---

## 2) PASS/FAIL counts + exit codes

| Executed artifact | Passed | Failed | Skipped | Exit code |
|---|---:|---:|---:|---:|
| `scripts/run-alerts-d34-fav-api.sh` | 14 | 0 | 0 | 0 |
| `tests/notes-d35-fav-e2e.test.js` | 7 | 1 | 0 | 1 |

---

## 3) Findings

- **SEVERE findings:** 1  
  - D35 required check `missing title -> 422` is not compliant (actual `201`).
- **Other findings:** none

---

## 4) Response required (canonical)

**Decision:** **BLOCK**

**Blocking findings (numbered):**
1. **BF-G5R2-001 (BLOCKER, owner: Team 20 / Backend)** — D35 error-contract mismatch: `POST /api/v1/notes` with missing title returns 201 instead of required 422.

**Next required action:**
1. Team 20 to enforce 422 validation for missing `title` in D35 create-note contract.
2. Team 50 to rerun immediately after fix:
   - `bash scripts/run-alerts-d34-fav-api.sh`
   - `node tests/notes-d35-fav-e2e.test.js`
3. Submit follow-up PASS/BLOCK report to Team 10 with updated evidence.

---

## 5) Evidence-by-path

- `scripts/run-alerts-d34-fav-api.sh`
- `tests/notes-d35-fav-e2e.test.js`
- `/tmp/s002_p003_g5r2_d34_api.log`
- `/tmp/s002_p003_g5r2_d35_e2e.log`
- `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_20_S002_P003_G5R2_D35_ERROR_CONTRACT_PARITY_REQUEST.md`

---

**log_entry | TEAM_50 | TO_TEAM_10 | S002_P003_G5R2_ERROR_CONTRACT_REMEDIATION | BLOCK | 2026-03-01**
