# Team 10 → Team 20 | S002-P002-WP003 Market Data Hardening — Implementation Mandate

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_20_S002_P002_WP003_IMPLEMENTATION_MANDATE  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 20 (Backend)  
**date:** 2026-03-10  
**status:** MANDATE_ACTIVE  
**gate_id:** GATE_0  
**work_package_id:** S002-P002-WP003  
**authority:** TEAM_190_TO_TEAM_10_S002_P002_WP003_GATE0_ACTIVATION_PROMPT_v1.0.2  

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | S002-P002-WP003 |
| gate_id | GATE_0 |
| phase_owner | Team 10 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

## 1) SSOT (Canonical Specification)

**LOD400 — execution-ready implementation specification:**

`_COMMUNICATION/_ARCHITECT_INBOX/TIKTRACK_PHASE_2/INFRASTRUCTURE_STAGE_2/S002_P002_WP003_MARKET_DATA_HARDENING/LOD400_v1.0.0.md`

כל ההחלטות המימוש נעולות במסמך זה. אין סטייה ללא GIN.

---

## 2) Scope — 4 Fixes (All Required)

| Fix ID | Name | Files |
|--------|------|-------|
| FIX-1 | Priority-based refresh filter | `api/background/jobs/sync_intraday.py` |
| FIX-2 | Yahoo multi-symbol batch fetch | `yahoo_provider.py`, `sync_intraday.py` |
| FIX-3 | Alpha quota-exhausted → long cooldown | `alpha_provider.py`, `provider_cooldown.py`, `market_data_settings.py` |
| FIX-4 | Eligibility gate on ticker re-activation | `api/services/tickers_service.py` |

---

## 3) Validation (Post-Implementation)

- **Team 50 (GATE_4):** Evidence EV-WP003-01 through EV-WP003-10 per LOD400 §8
- **Team 90 (GATE_5):** Validation report; no blocking findings

---

## 4) Acceptance Criteria (Summary)

- Priority filter: FIRST_FETCH, HIGH, LOW tiers per LOD400 §3
- Batch fetch: 1 HTTP call for batch (not N individual)
- Alpha quota: `AlphaQuotaExhaustedException` → 24h cooldown, DB persistence
- Eligibility gate: `update_ticker()` validates when `is_active` false→true
- market_cap completeness: ANAU.MI, BTC-USD, TEVA.TA NOT NULL post EOD sync
- NUMERIC(20,8) precision; no schema migrations; maskedLog compliance

---

## 5) Closure

- **Completion report:** `TEAM_20_TO_TEAM_10_S002_P002_WP003_IMPLEMENTATION_COMPLETION.md`
- On completion → Team 10 activates Team 50 for GATE_4 (EV-WP003-01..10)

---

**log_entry | TEAM_10 | WP003_IMPLEMENTATION_MANDATE | TO_TEAM_20 | 2026-03-10**
