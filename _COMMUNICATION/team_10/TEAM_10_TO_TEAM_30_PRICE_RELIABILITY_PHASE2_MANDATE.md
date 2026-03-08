# Team 10 → Team 30 | Price Reliability — PHASE_2 Mandate

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_30_PRICE_RELIABILITY_PHASE2_MANDATE  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 30 (Frontend)  
**date:** 2026-03-08  
**status:** MANDATE_ACTIVE  
**phase:** PHASE_2  
**authority:** TEAM_190_TO_TEAM_10_TEAMS_20_30_50_60_90_MANDATORY_3_PHASE_PRICE_RELIABILITY_EXECUTION_MANDATE_v1.0.0  

---

## 1) Prerequisite

**PHASE_1_PASS** — ✅ הושג (TEAM_50_TO_TEAM_10_PRICE_RELIABILITY_PHASE1_RE_QA_PASS_v1.0.0).

---

## 2) Goal

User must clearly know whether displayed price is **live/update-based** or **EOD close**. Full transparency on source and timestamp.

---

## 3) Required implementation (UI)

| # | פעולה | פרטים |
|---|--------|--------|
| 1 | current price | Display `current_price` (best-available) |
| 2 | source label | Display `price_source` — INTRADAY_FALLBACK \| EOD \| EOD_STALE |
| 3 | as-of timestamp | Display `price_as_of_utc` |
| 4 | last close | Display `last_close_price` separately from current |
| 5 | Scope | Tickers table + user_tickers table |

---

## 4) API Contract (Team 20 delivers; Team 30 consumes)

- `last_close_price`
- `last_close_as_of_utc`
- `current_price`
- `price_source` (INTRADAY_FALLBACK \| EOD \| EOD_STALE)
- `price_as_of_utc`

---

## 5) Required tests (Team 30 + Team 50)

| # | Scenario | Expected |
|---|----------|----------|
| 1 | UI renders source label | correctly for all three source values |
| 2 | UI renders as-of timestamp | for current source |
| 3 | last close visible | unchanged when current source is intraday |
| 4 | no misleading state | user never sees stale value without stale indication |

---

## 6) Closure

- **Completion report:** `TEAM_30_TO_TEAM_10_PRICE_RELIABILITY_PHASE2_COMPLETION.md`
- **QA:** Team 50 PHASE_2 QA report
- **PHASE_2_PASS:** Only after Team 50 PASS; Team 10 opens PHASE_3

---

**log_entry | TEAM_10 | PRICE_RELIABILITY_PHASE2_MANDATE | TO_TEAM_30 | BLOCKED_AWAIT_PHASE1 | 2026-03-08**
