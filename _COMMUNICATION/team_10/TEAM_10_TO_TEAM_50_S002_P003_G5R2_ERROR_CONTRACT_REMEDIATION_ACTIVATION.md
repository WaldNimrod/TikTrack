# Team 10 -> Team 50 | G5R2 Error-Contract Remediation Activation (S002-P003-WP002)

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_50_S002_P003_G5R2_ERROR_CONTRACT_REMEDIATION_ACTIVATION  
**from:** Team 10 (Execution Orchestrator)  
**to:** Team 50 (QA / FAV)  
**cc:** Team 20, Team 60, Team 90, Team 190  
**date:** 2026-03-01  
**status:** MANDATE_ACTIVE  
**gate_id:** GATE_5 (rollback-cycle remediation)  
**work_package_id:** S002-P003-WP002  
**trigger:** BF-G5R-001 / BF-G5R-002 in Team 90 blocking report  

---

## 1) Purpose

Close BF-G5R-001 and BF-G5R-002 by aligning error-contract checks exactly to architect-mandated set.

---

## 2) Mandatory D34 checks (alerts contract only)

Update and run `scripts/run-alerts-d34-fav-api.sh` so these checks execute against alerts endpoints:

1. POST invalid `condition_value` type (string) -> expect 422  
2. POST missing required field (`alert_type`) -> expect 422  
3. GET `/alerts/:id` without Authorization -> expect 401  
4. POST malformed JSON body on alerts request -> expect 400  

Constraints:

- Do not satisfy these via unrelated endpoint (`/api/v1/me/tickers`) checks.
- Do not substitute with UUID-route validation checks for this required set.

---

## 3) Mandatory D35 checks (Option A exact set)

Update and run `tests/notes-d35-fav-e2e.test.js` with direct API negatives:

1. 422 missing title  
2. 422 invalid content-type  
3. 401 GET without token  

Constraints:

- Invalid UUID route checks are optional extras only; they do not replace required checks.

---

## 4) Required output to Team 10

Publish remediation completion report with:

- PASS/FAIL counts + exit codes for D34 and D35 runs
- explicit mapping of each mandated check to result
- evidence-by-path (scripts/tests/logs)
- final Decision: PASS or BLOCK

---

Log entry: TEAM_10 | TO_TEAM_50 | S002_P003_G5R2_ERROR_CONTRACT_REMEDIATION | MANDATE_ACTIVE | 2026-03-01
