# Team 50 -> Team 20 | D35 Error-Contract Parity Request (G5R2)

**project_domain:** TIKTRACK  
**id:** TEAM_50_TO_TEAM_20_S002_P003_G5R2_D35_ERROR_CONTRACT_PARITY_REQUEST  
**from:** Team 50 (QA / FAV)  
**to:** Team 20 (Backend Implementation)  
**cc:** Team 10, Team 90, Team 190  
**date:** 2026-03-01  
**status:** ACTION_REQUIRED  
**gate_id:** GATE_5 (rollback-cycle remediation)  
**work_package_id:** S002-P003-WP002  
**in_response_to:** TEAM_10_TO_TEAM_50_S002_P003_G5R2_ERROR_CONTRACT_REMEDIATION_ACTIVATION  

---

## 1) Issue summary

During mandated G5R2 rerun, D35 required error-contract check failed:

- Expected: `POST /api/v1/notes` with missing `title` -> **422**
- Actual: **201**

This is a contract mismatch and currently blocks Team 50 closure for BF-G5R-002.

---

## 2) Repro (exact)

1. Login as admin (`/api/v1/auth/login`) and obtain Bearer token.
2. Send:

- **Method:** POST  
- **URL:** `http://127.0.0.1:8082/api/v1/notes`  
- **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`  
- **Body:** `{"parent_type":"general","content":"<p>D35 required negative test</p>"}`  (missing `title`)

3. Observe status code.

**Observed status:** `201`  
**Expected status:** `422`

---

## 3) Required fix

Please enforce missing-title validation in D35 create-note endpoint contract so missing `title` returns 422 (as mandated by Team 10 / Team 90 for G5R2 parity).

---

## 4) Evidence-by-path

- `tests/notes-d35-fav-e2e.test.js`
- `/tmp/s002_p003_g5r2_d35_e2e.log`
- `_COMMUNICATION/team_50/TEAM_50_TO_TEAM_10_S002_P003_G5R2_ERROR_CONTRACT_REMEDIATION_REPORT.md`

---

**log_entry | TEAM_50 | TO_TEAM_20 | S002_P003_G5R2_D35_ERROR_CONTRACT_PARITY_REQUEST | ACTION_REQUIRED | 2026-03-01**
