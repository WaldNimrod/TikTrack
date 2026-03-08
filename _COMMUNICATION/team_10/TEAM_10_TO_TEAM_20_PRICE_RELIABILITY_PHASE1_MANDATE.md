# Team 10 → Team 20 | Price Reliability — PHASE_1 Mandate

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_20_PRICE_RELIABILITY_PHASE1_MANDATE  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 20 (Backend)  
**date:** 2026-03-08  
**status:** MANDATE_ACTIVE  
**phase:** PHASE_1  
**authority:** TEAM_190_TO_TEAM_10_TEAMS_20_30_50_60_90_MANDATORY_3_PHASE_PRICE_RELIABILITY_EXECUTION_MANDATE_v1.0.0  

---

## 1) Goal

Always preserve latest EOD value even when stale; intraday can override, never erase. **No null regression** when EOD is stale.

---

## 2) Required implementation

| # | פעולה | פרטים |
|---|--------|--------|
| 1 | preserve EOD | In `api/services/tickers_service.py` — preserve EOD output for every ticker with EOD |
| 2 | Mark stale | Mark stale EOD tickers for intraday override attempt (active tickers only) |
| 3 | Intraday override | If intraday exists for stale active ticker → replace EOD output with intraday output |
| 4 | No null | If intraday missing → **keep EOD output** (no null regression) |
| 5 | Stale value | Add explicit stale source value: `EOD_STALE` |

---

## 3) Required tests (Team 20 + Team 50 witness)

| # | Scenario | Expected |
|---|----------|----------|
| 1 | stale EOD + no intraday (active) | returns EOD_STALE, **not null** |
| 2 | stale EOD + no intraday (inactive) | returns EOD_STALE, **not null** |
| 3 | stale EOD + intraday (active) | returns INTRADAY_FALLBACK |
| 4 | fresh EOD + intraday | remains EOD |
| 5 | missing EOD + intraday (active) | returns INTRADAY_FALLBACK |

---

## 4) Acceptance Criteria

| # | קריטריון |
|---|-----------|
| 1 | No ticker with existing EOD returns null only due to staleness |
| 2 | EOD_STALE exposed deterministically when applicable |
| 3 | Unit/integration evidence paths documented |

---

## 5) Closure

- **Completion report:** `TEAM_20_TO_TEAM_10_PRICE_RELIABILITY_PHASE1_COMPLETION.md`
- **QA witness:** Team 50 runs test matrix; issues `TEAM_50_TO_TEAM_10_PRICE_RELIABILITY_PHASE1_QA_REPORT.md`
- **PHASE_1_PASS:** Only after Team 50 PASS; Team 10 opens PHASE_2

---

**log_entry | TEAM_10 | PRICE_RELIABILITY_PHASE1_MANDATE | TO_TEAM_20 | 2026-03-08**
