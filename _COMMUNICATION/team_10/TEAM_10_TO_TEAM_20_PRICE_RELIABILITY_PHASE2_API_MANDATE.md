# Team 10 → Team 20 | Price Reliability — PHASE_2 API Fields Mandate

**project_domain:** TIKTRACK  
**id:** TEAM_10_TO_TEAM_20_PRICE_RELIABILITY_PHASE2_API_MANDATE  
**from:** Team 10 (Gateway Orchestration)  
**to:** Team 20 (Backend)  
**date:** 2026-03-08  
**status:** MANDATE_ACTIVE  
**phase:** PHASE_2 (API contract)  
**authority:** TEAM_190_TO_TEAM_10_TEAMS_20_30_50_60_90_MANDATORY_3_PHASE_PRICE_RELIABILITY_EXECUTION_MANDATE_v1.0.0  

---

## 1) Prerequisite

**PHASE_1_PASS** — ✅ הושג (TEAM_50_TO_TEAM_10_PRICE_RELIABILITY_PHASE1_RE_QA_PASS_v1.0.0).

---

## 2) Goal

Expose API contract fields for UI transparency: `last_close_price`, `last_close_as_of_utc`, `price_source`, `price_as_of_utc`.

---

## 3) Required API fields

| Field | Type | Description |
|-------|------|-------------|
| `last_close_price` | number | Last EOD close value |
| `last_close_as_of_utc` | string (ISO8601) | Timestamp of last close |
| `current_price` | number | Best-available display price (keep existing) |
| `price_source` | string | INTRADAY_FALLBACK \| EOD \| EOD_STALE |
| `price_as_of_utc` | string (ISO8601) | Timestamp of current price source |

---

## 4) Scope

Ticker responses (list/detail) — tickers + user_tickers endpoints. Deterministic values per source logic from PHASE_1.

---

## 5) Closure

- **Completion:** Included in PHASE_2 completion (with Team 30).
- **QA:** Team 50 verifies API contract in PHASE_2 QA.

---

**log_entry | TEAM_10 | PRICE_RELIABILITY_PHASE2_API_MANDATE | TO_TEAM_20 | BLOCKED_AWAIT_PHASE1 | 2026-03-08**
