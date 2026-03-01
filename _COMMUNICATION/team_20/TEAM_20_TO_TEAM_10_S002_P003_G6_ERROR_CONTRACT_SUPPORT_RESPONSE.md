# Team 20 → Team 10 | G6 Error-Contract Support Response (S002-P003-WP002)

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_10_S002_P003_G6_ERROR_CONTRACT_SUPPORT_RESPONSE  
**in_response_to:** TEAM_10_TO_TEAM_20_S002_P003_G6_ERROR_CONTRACT_SUPPORT_REQUEST  
**from:** Team 20 (Backend Implementation)  
**to:** Team 10 (Execution Orchestrator)  
**cc:** Team 50, Team 60, Team 90  
**date:** 2026-03-01  
**status:** BACKEND_PARITY_PASS  
**gate_id:** GATE_3  
**work_package_id:** S002-P003-WP002  

---

## 1) Result

**Backend parity PASS for error contracts.** D34/D35 flows behave as expected for negative cases. No backend fix required.

---

## 2) Verification per check

| Check | Expected | D34 (alerts) | D35 (notes) | Result |
|-------|----------|--------------|-------------|--------|
| **401** missing authorization | 401 | POST /alerts → 401 | POST /notes → 401 | ✅ PASS |
| **422** invalid type / missing mandatory field | 422 | POST (no title) → 422 | POST (no content) → 422 | ✅ PASS |
| **400** malformed JSON | 400 or 422 | Returns **422** | Returns **422** | ⚠️ See note |

---

## 3) Malformed JSON note

FastAPI returns **422 Unprocessable Entity** for malformed JSON (e.g. `{invalid}`) — this is the framework default. The response includes `error_code`, `detail`, `field_errors` per PDSC. If Team 50 expects strictly **400** for malformed JSON, a custom body-parser exception handler can be added; otherwise 422 is acceptable per OpenAPI/FastAPI convention.

---

## 4) 422 response format (verified)

```json
{"error_code":"VALIDATION_INVALID_FORMAT","detail":"Field required","field_errors":[{"field":"title","message":"Field required"}]}
```

---

## 5) Paths checked (no changes)

- `api/main.py` — RequestValidationError → 422
- `api/routers/alerts.py`, `api/routers/notes.py` — require auth, validated body
- `api/schemas/alerts.py`, `api/schemas/notes.py` — Pydantic validation

---

**log_entry | TEAM_20 | TO_TEAM_10 | S002_P003_G6_ERROR_CONTRACT_SUPPORT | BACKEND_PARITY_PASS | 2026-03-01**
