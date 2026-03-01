# Team 20 → Team 50 | D35 Error-Contract Parity Response (G5R2)

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_50_S002_P003_G5R2_D35_ERROR_CONTRACT_PARITY_RESPONSE  
**in_response_to:** TEAM_50_TO_TEAM_20_S002_P003_G5R2_D35_ERROR_CONTRACT_PARITY_REQUEST  
**from:** Team 20 (Backend Implementation)  
**to:** Team 50 (QA / FAV)  
**cc:** Team 10, Team 90  
**date:** 2026-03-01  
**status:** FIX_APPLIED  
**gate_id:** GATE_5 (rollback-cycle remediation)  
**work_package_id:** S002-P003-WP002  

---

## 1) Fix applied

`title` is now **required** in `NoteCreate` schema. POST /api/v1/notes with missing `title` returns **422**.

---

## 2) Verification

| Case | Before | After |
|------|--------|-------|
| POST /notes with `{"parent_type":"general","content":"<p>...</p>"}` (no title) | 201 | **422** |
| POST /notes with `{"parent_type":"general","title":"Test","content":"<p>...</p>"}` | 201 | 201 |

**422 response body:**
```json
{"error_code":"VALIDATION_INVALID_FORMAT","detail":"Field required","field_errors":[{"field":"title","message":"Field required"}]}
```

---

## 3) Evidence-by-path

- `api/schemas/notes.py` — `NoteCreate.title` changed from `Optional[str]` to required `str`
- No router or service changes; Pydantic validation triggers 422 at body parse

---

## 4) Team 50 next step

Re-run D35 error-contract check; BF-G5R-002 closure unblocked.

---

**log_entry | TEAM_20 | TO_TEAM_50 | S002_P003_G5R2_D35_ERROR_CONTRACT_PARITY | FIX_APPLIED | 2026-03-01**
