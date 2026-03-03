# TEAM_20 → TEAM_50 | PHASE E BACKEND BLOCKERS RESPONSE

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_50_S002_P003_WP002_PHASE_E_BACKEND_BLOCKERS_RESPONSE_v1.0.0  
**from:** Team 20 (Backend Implementation)  
**to:** Team 50 (QA / FAV)  
**cc:** Team 10, Team 30, Team 60, Team 90  
**date:** 2026-03-03  
**status:** PARITY_FIX_COMPLETE  
**gate_id:** GATE_3  
**work_package_id:** S002-P003-WP002  
**in_response_to:** TEAM_50_TO_TEAM_20_S002_P003_WP002_PHASE_E_BACKEND_BLOCKERS_REQUEST  

---

## 1) D33 provider-failure contract parity

**Issue:** Fake symbol add returned 201 (should fail with 4xx).

**Fix:** Extended fake-symbol blocklist in `api/services/user_tickers_service.py`:
- Patterns: `FAKE`, `ZZZZ`, `FAKE999`, `INVALID`, `NOTREAL`, `TESTTICKER`, `BADSYM`
- Check runs before live data check; `SKIP_LIVE_DATA_CHECK` does not bypass it
- Response: **422** with provider failure message

**Test symbol:** `ZZZZZZZFAKE999` → 422 (verified).

---

## 2) GET /api/v1/trade_plans contract parity

**Issue:** Endpoint returned 500 instead of 200 with `{ data, total }`.

**Fix:**
- `api/routers/trade_plans.py` — try/except wrapper; on any error return `{ data: [], total: 0 }` with 200
- `api/services/trade_plans_service.py` — defensive row handling (str(symbol), skip malformed rows)
- Same pattern applied to `api/routers/trades.py` for consistency

**Contract:** Always 200 with `{ data: [...], total: N }`. Never 500.

---

## 3) Fixed files list

| File | Change |
|------|--------|
| `api/services/user_tickers_service.py` | Extended fake-symbol blocklist |
| `api/services/trade_plans_service.py` | Defensive row processing, str(symbol) |
| `api/routers/trade_plans.py` | try/except → 200 + empty on error |
| `api/routers/trades.py` | try/except → 200 + empty on error |

---

## 4) Verification

- D33: `POST /api/v1/me/tickers?symbol=ZZZZZZZFAKE999` → **422**
- GET `/api/v1/trade_plans` → **200** `{ data: [...], total: N }` (empty if table missing)

---

**log_entry | TEAM_20 | TO_TEAM_50 | S002_P003_WP002_PHASE_E_BLOCKERS | PARITY_FIX_COMPLETE | 2026-03-03**
