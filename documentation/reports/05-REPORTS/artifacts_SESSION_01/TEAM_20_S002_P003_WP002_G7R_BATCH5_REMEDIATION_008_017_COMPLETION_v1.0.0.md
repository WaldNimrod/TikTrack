# TEAM_20 → TEAM_10 | S002-P003-WP002 G7R Batch 5 Remediation (BF-G7-008, BF-G7-017)

**project_domain:** TIKTRACK  
**id:** TEAM_20_S002_P003_WP002_G7R_BATCH5_REMEDIATION_008_017_COMPLETION_v1.0.0  
**from:** Team 20 (Backend / Data)  
**to:** Team 10 (Execution Orchestrator)  
**cc:** Team 30, Team 50, Team 90  
**date:** 2026-03-04  
**status:** COMPLETE  
**gate_id:** GATE_4 re-run blocker  
**work_package_id:** S002-P003-WP002  
**in_response_to:** Team 50 GATE_4 consolidated — BF-G7-008 FAIL, BF-G7-017 FAIL

---

## 1) Overall status

| Field | Value |
|-------|-------|
| **overall_status** | PASS |

---

## 2) Per-BF changes and verification

### BF-G7-008 (Invalid symbol)

| Item | Value |
|------|-------|
| **Endpoint** | `POST /api/v1/tickers` (D22), `POST /api/v1/me/tickers?symbol=...` (D33) |
| **Validation** | Provider (Yahoo → Alpha) before create. Invalid symbol → 422 before commit. |
| **Response** | 422, body: `{"detail": "...", "message": "...", "error_code": "TICKER_SYMBOL_INVALID"}` |
| **detail/message** | "Provider could not fetch data for this symbol. Ticker not created. Verify symbol exists and try again." |

**E2E preconditions:**  
- `VALIDATE_SYMBOL_ALWAYS=true` (or `DEBUG=false`) so live check runs.  
- With `DEBUG=true` and no env, validation is skipped for dev.

**Verification (curl):**
```bash
# 1. Obtain token (admin)
TOKEN="..."

# 2. POST invalid symbol
curl -s -w "\n%{http_code}" -X POST "http://localhost:8082/api/v1/tickers" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"symbol":"INVALID999E2E","ticker_type":"STOCK","is_active":true}'

# Expect: 422, body with detail + message + error_code
# UI: display error.detail ?? error.message
```

**E2E steps:**
1. Set `VALIDATE_SYMBOL_ALWAYS=true` in api/.env (or run with DEBUG=false).
2. Submit form with symbol `INVALID999E2E`.
3. Wait for response (no async background).
4. Assert status 422.
5. Assert `response.data.detail` or `response.data.message` exists.
6. Assert error UI shows text (e.g. role="alert", or `#tickerFormValidationSummary`).

---

### BF-G7-017 (Linked entity mandatory)

| Item | Value |
|------|-------|
| **Endpoint** | `POST /api/v1/alerts`, `POST /api/v1/notes` |
| **Validation** | Schema (Pydantic) + service. Entity type without target_id/parent_id → 422. |
| **Response** | 422, body: `{"detail": "...", "message": "...", "error_code": "VALIDATION_INVALID_FORMAT", "field_errors": [...]}` |

**Required fields:**
- **Alerts:** `target_type` required. For ticker: `ticker_id` or `target_id`. For trade/plan/account: `target_id`. For datetime: `target_datetime`.
- **Notes:** `parent_type` required. For ticker/trade/plan/account: `parent_id`. For datetime: `parent_datetime`.

**Verification (curl):**
```bash
# Alert without target_id (ticker)
curl -s -w "\n%{http_code}" -X POST "http://localhost:8082/api/v1/alerts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"target_type":"ticker","alert_type":"PRICE","title":"Test","condition_field":"price","condition_operator":">","condition_value":100}'

# Expect: 422, detail contains "ticker_id or target_id required"

# Note without parent_id (ticker)
curl -s -w "\n%{http_code}" -X POST "http://localhost:8082/api/v1/notes" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"parent_type":"ticker","title":"Test","content":"<p>x</p>"}'

# Expect: 422, detail contains "parent_id required"
```

**E2E steps:**
1. Open create-alert or create-note form.
2. Select `target_type=ticker` (or `parent_type=ticker`) without choosing a ticker.
3. Submit.
4. Assert status 422.
5. Assert `response.data.detail` or `response.data.message` exists.
6. Assert error UI shows validation message.

---

## 3) Changes made

| File | Change |
|------|--------|
| `api/utils/exceptions.py` | Added `TICKER_SYMBOL_INVALID`. |
| `api/main.py` | HTTPExceptionWithCode, RequestValidationError, HTTPException handlers: add `"message"` = `detail` for UI. |
| `api/services/canonical_ticker_service.py` | Use `TICKER_SYMBOL_INVALID`; clearer detail; `VALIDATE_SYMBOL_ALWAYS` env. |
| `api/schemas/alerts.py` | AlertCreate: validate target_id/ticker_id when target_type is entity. |

---

## 4) Response contract (Team 30 / E2E)

| Field | Description |
|-------|-------------|
| `detail` | Human-readable error message. |
| `message` | Same as `detail` (use `error.message ?? error.detail`). |
| `error_code` | e.g. `TICKER_SYMBOL_INVALID`, `VALIDATION_INVALID_FORMAT`. |
| `field_errors` | Array of `{field, message}` for validation errors. |

**UI display:** `response.data.detail ?? response.data.message`

**E2E:** Assert `response.status === 422` and `response.data.detail || response.data.message` before checking visible error element.

---

**log_entry | TEAM_20 | G7R_BATCH5_REMEDIATION_008_017 | S002_P003_WP002 | PASS | 2026-03-04**
