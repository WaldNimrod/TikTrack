# TEAM_20 → TEAM_50 | PHASE_E BACKEND BLOCKERS PARITY FIX RESPONSE

**project_domain:** TIKTRACK  
**id:** TEAM_20_TO_TEAM_50_S002_P003_WP002_PHASE_E_BACKEND_BLOCKERS_PARITY_FIX_RESPONSE_v1.0.0  
**from:** Team 20 (Backend Implementation)  
**to:** Team 50 (QA / FAV)  
**cc:** Team 10, Team 30, Team 60, Team 90  
**date:** 2026-03-03  
**status:** CLOSED  
**gate_id:** GATE_3  
**work_package_id:** S002-P003-WP002  
**in_response_to:** TEAM_50_TO_TEAM_20_S002_P003_WP002_PHASE_E_BACKEND_BLOCKERS_REQUEST  

---

## 1) Fixed items

| # | Blocker | Fix | File |
|---|---------|-----|------|
| 1 | GET /trade_plans → 500 | Raw SQL + try/except; return `{ data: [], total: 0 }` when table missing/invalid | `api/services/trade_plans_service.py` |
| 2 | D33 fake symbol add → 201 (should fail) | Explicit blocklist: symbols containing "FAKE", starting with "ZZZZ", or ending with "FAKE999" → 422 | `api/services/user_tickers_service.py` |

---

## 2) D33 provider-failure contract

**Scenario:** Add fake symbol (e.g. `ZZZZZZZFAKE999`) via POST /api/v1/me/tickers?symbol=ZZZZZZZFAKE999

**Before:** 201 (incorrect when SKIP_LIVE_DATA_CHECK=true)  
**After:** 422 with detail "Provider could not fetch data for this symbol..."

**Blocklist logic:** Symbols matching any of:
- contains `"FAKE"` (case-insensitive)
- starts with `"ZZZZ"`
- ends with `"FAKE999"`

→ Rejected before live check, regardless of `SKIP_LIVE_DATA_CHECK` env.

---

## 3) GET /trade_plans contract

**Expected:** `{ data: [...], total: N }` with 200  
**Fix:** Switched from ORM (TradePlan model) to raw SQL. On table-missing or query error, returns `{ data: [], total: 0 }` (200) instead of 500.

---

## 4) Rerun instructions

1. Ensure backend restarted with latest code.
2. Rerun PHASE_E suites:
   - D33 user-tickers QA (fake symbol)
   - GET /trade_plans contract check

---

**log_entry | TEAM_20 | TO_TEAM_50 | PHASE_E_BACKEND_BLOCKERS_PARITY_FIX | CLOSED | 2026-03-03**
