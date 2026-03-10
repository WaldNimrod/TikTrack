# Team 10 → Team 60 | S002-P002-WP003 — Runtime Corroboration Mandate

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_60_S002_P002_WP003_RUNTIME_CORROBORATION_MANDATE  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 60 (Infrastructure)  
**date:** 2026-03-10  
**status:** ACTION_REQUIRED  
**gate_id:** GATE_4  
**work_package_id:** S002-P002-WP003  
**authority:** TEAM_190_TO_TEAM_10_S002_P002_WP003_GATE0_ACTIVATION_PROMPT_v1.0.2 §5.4  
**trigger:** TEAM_20_TO_TEAM_10_S002_P002_WP003_IMPLEMENTATION_COMPLETION  

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | S002-P002-WP003 |
| gate_id | GATE_4 |
| phase_owner | Team 10 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

## 1) Context

Team 20 השלים את 4 ה-Fixes per LOD400. נדרשת corroboration לתשתית ו-runtime.

---

## 2) Evidence IDs (Explicit)

| ID | Description | Pass Criterion |
|----|-------------|----------------|
| EF-WP003-60-01 | max_symbols_per_request DB | `market_data.system_settings` key `max_symbols_per_request` = 50 (LOD400 §4.2). One-time update on deploy. |
| EF-WP003-60-02 | Alpha cooldown persistence | After AlphaQuotaExhausted → restart API → `is_in_cooldown("ALPHA_VANTAGE")` still True; `alpha_cooldown_until` in system_settings. Corroborates EV-WP003-05. |
| EF-WP003-60-03 | sync_intraday scheduler | `sync_ticker_prices_intraday` in scheduler_registry.py; runs via APScheduler; `runtime_class=TARGET_RUNTIME` in job_run_log. |
| EF-WP003-60-04 | Job completion (no crash) | 4 consecutive sync_intraday cycles complete successfully; zero Yahoo 429 in logs (aligns with EV-WP003-10). |

---

## 3) Output Required

**נתיב:** `_COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_S002_P002_WP003_RUNTIME_CORROBORATION_REPORT.md`

- status: PASS | BLOCK
- טבלת תוצאות לכל EF-WP003-60-01..04
- Evidence paths / log snippets

---

## 4) Coordination

- EV-WP003-05 (Team 50) ↔ EF-WP003-60-02 (Team 60): שניהם בודקים cooldown persistence. Team 50 מאמת מבחינת QA; Team 60 מאמת מבחינת runtime/deploy.
- EV-WP003-10 (Team 50) ↔ EF-WP003-60-04 (Team 60): zero 429 in 1-hour run.

---

**log_entry | TEAM_10 | WP003_RUNTIME_MANDATE | TO_TEAM_60 | 2026-03-10**
