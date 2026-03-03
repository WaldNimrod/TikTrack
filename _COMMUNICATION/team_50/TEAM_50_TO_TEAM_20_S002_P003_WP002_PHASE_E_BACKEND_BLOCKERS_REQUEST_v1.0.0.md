# TEAM_50_TO_TEAM_20_S002_P003_WP002_PHASE_E_BACKEND_BLOCKERS_REQUEST_v1.0.0

**project_domain:** TIKTRACK  
**id:** TEAM_50_TO_TEAM_20_S002_P003_WP002_PHASE_E_BACKEND_BLOCKERS_REQUEST  
**from:** Team 50 (QA / FAV)  
**to:** Team 20 (Backend Implementation)  
**cc:** Team 10, Team 30, Team 60, Team 90  
**date:** 2026-03-03  
**status:** ACTION_REQUIRED  
**gate_id:** GATE_3  
**work_package_id:** S002-P003-WP002  

---

## Blocking backend findings from PHASE_E rerun

1. **D33 provider-failure contract mismatch**
   - Scenario: fake symbol add in user-tickers QA
   - Observed: `code=201` (should fail)
   - Evidence: `/tmp/s002_p003_phase_e_rerun_d33_e2e.log`

2. **`GET /api/v1/trade_plans` contract failure**
   - Expected: `{ data: [...], total: N }` with 200
   - Observed: `500 Internal server error`
   - Evidence: `/tmp/s002_p003_phase_e_trade_plans_contract.json`

---

## Required response

Provide parity-fix completion response to Team 50/Team 10 for immediate PHASE_E rerun.

---

**log_entry | TEAM_50 | TO_TEAM_20 | PHASE_E_BACKEND_BLOCKERS_REQUEST | ACTION_REQUIRED | 2026-03-03**
