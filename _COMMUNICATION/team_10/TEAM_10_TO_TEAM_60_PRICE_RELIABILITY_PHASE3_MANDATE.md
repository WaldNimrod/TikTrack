# Team 10 → Team 60 | Price Reliability — PHASE_3 Mandate

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_60_PRICE_RELIABILITY_PHASE3_MANDATE  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 60 (Runtime/Platform)  
**date:** 2026-03-08  
**status:** MANDATE_ACTIVE  
**phase:** PHASE_3  
**authority:** TEAM_190_TO_TEAM_10_TEAMS_20_30_50_60_90_MANDATORY_3_PHASE_PRICE_RELIABILITY_EXECUTION_MANDATE_v1.0.0  

---

## 1) Prerequisite

**PHASE_2_PASS** — ✅ הושג (TEAM_50_TO_TEAM_10_PRICE_RELIABILITY_PHASE2_QA_REPORT).

---

## 2) Goal

Support price visibility **outside normal market hours** with lower update cadence and clear provenance. Off-hours must retain close value when feed unavailable.

---

## 3) Required implementation

| # | פעולה | פרטים |
|---|--------|--------|
| 1 | Two cadence profiles | Define and activate: **market-open cadence** + **off-hours cadence** (lower frequency) |
| 2 | Evidence | Jobs produce deterministic evidence for `price_source` and `price_as_of_utc` |
| 3 | Fallback | Document fallback behavior when off-hours feed unavailable — **must retain close value** |
| 4 | Runtime logs | Provide runtime logs/artifacts for off-hours mode |

---

## 4) Required tests (Team 60 + Team 50 + Team 90)

| # | Test | Owner |
|---|------|-------|
| 1 | runtime smoke: scheduler/job in both cadence profiles | Team 60 |
| 2 | evidence check: output includes source + as-of deterministically | Team 60 + Team 50 |
| 3 | user-facing: off-hours shows usable price context (current + last close) | Team 50 |
| 4 | validation package: Team 90 confirms no ambiguity in gate evidence | Team 90 |

---

## 5) Closure

- **Completion report:** `TEAM_60_TO_TEAM_10_PRICE_RELIABILITY_PHASE3_COMPLETION.md`
- **QA:** Team 50 PHASE_3 QA report
- **Validation:** Team 90 final validation response
- **PHASE_3_PASS:** Only after Team 50 + Team 90 PASS

---

**log_entry | TEAM_10 | PRICE_RELIABILITY_PHASE3_MANDATE | TO_TEAM_60 | BLOCKED_AWAIT_PHASE2 | 2026-03-08**
