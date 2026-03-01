# Team 20 → Team 10 | G5R2 Backend Error-Contract Parity Response (S002-P003-WP002)

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_10_S002_P003_G5R2_BACKEND_ERROR_CONTRACT_PARITY_RESPONSE  
**in_response_to:** TEAM_10_TO_TEAM_20_S002_P003_G5R2_BACKEND_ERROR_CONTRACT_PARITY_REQUEST  
**from:** Team 20 (Backend Implementation)  
**to:** Team 10 (Execution Orchestrator)  
**cc:** Team 50, Team 60, Team 90  
**date:** 2026-03-01  
**status:** BACKEND_PARITY_PASS  
**gate_id:** GATE_5 (rollback-cycle remediation)  
**work_package_id:** S002-P003-WP002  
**trigger:** BF-G5R-001 / BF-G5R-002 closure support  

---

## 1) Result

**Backend parity PASS.** All architect-mandated error contracts verified. One backend fix applied (malformed JSON → 400 per BF-G5R-001).

---

## 2) Verification per check

| Domain | Case | Expected | Actual | Result |
|--------|------|----------|--------|--------|
| **D34 alerts** | 422 invalid `condition_value` type | 422 | 422 | ✅ |
| **D34 alerts** | 422 missing required `alert_type` | 422 | 422 | ✅ |
| **D34 alerts** | 401 no auth | 401 | 401 | ✅ |
| **D34 alerts** | 400 malformed JSON | 400 | 400 | ✅ |
| **D35 notes** | 422 missing title | 422 | 422 | ✅ |
| **D35 notes** | 422 invalid content-type | 422 | 422 | ✅ |
| **D35 notes** | 401 no auth | 401 | 401 | ✅ |

---

## 3) D35 schema note

Per Team 50 G5R2 parity request, `NoteCreate.title` was changed from optional to **required**. Missing title now returns 422 (BF-G5R-002 closure).

---

## 4) Backend fix applied

**BF-G5R-001:** Malformed JSON previously returned 422 (FastAPI default). Custom logic in `validation_exception_handler` now returns **400** when a JSON decode error is detected.

**Evidence path:** `api/main.py` (lines 38–64)

```python
# BF-G5R-001: malformed JSON must return 400, not 422
is_malformed_json = (
    "JSON decode error" in first_msg
    or any(e.get("type", "").endswith("json_decode") or "json" in str(e.get("type", "")).lower() for e in errors)
)
status_code = 400 if is_malformed_json else 422
```

---

## 5) Paths checked

- `api/main.py` — `validation_exception_handler` (malformed JSON → 400, other validation → 422)
- `api/routers/alerts.py`, `api/routers/notes.py` — auth, body validation
- `api/schemas/alerts.py`, `api/schemas/notes.py` — Pydantic models

---

**log_entry | TEAM_20 | TO_TEAM_10 | S002_P003_G5R2_BACKEND_ERROR_CONTRACT_PARITY | BACKEND_PARITY_PASS | 2026-03-01**
