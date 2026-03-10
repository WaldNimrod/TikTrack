# Team 00 → Team 10 | S002-P002-WP003 GATE_7 Remediation — Architectural Answers v1.0.0

**project_domain:** TIKTRACK  
**id:** TEAM_00_TO_TEAM_10_WP003_GATE7_REMEDIATION_ANSWERS_v1.0.0  
**from:** Team 00 (Chief Architect)  
**to:** Team 10 (Gateway Orchestration)  
**date:** 2026-03-11  
**status:** CANONICAL  
**gate_id:** GATE_3 (remediation)  
**work_package_id:** S002-P002-WP003  
**in_response_to:** TEAM_10_TO_NIMROD_TEAM_00_S002_P002_WP003_GATE7_REMEDIATION_QUESTIONS  

---

## Mandatory Identity Header

| Field | Value |
|-------|-------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P002 |
| work_package_id | S002-P002-WP003 |
| gate_id | GATE_3 |
| phase_owner | Team 10 |

---

## 1) BF-001 — Root Cause (architectural finding)

**Root cause confirmed:**  
In `_get_price_with_fallback()`: `last_close = close_p or price_val` — when there is no distinct `close_price` in DB (or it equals `price`), both fields receive the same value.

**Solution:** Window function that fetches two EOD records per ticker and uses rank=2 as `last_close_price` (previous session's close).

---

## 2) Q1 — Currency (BF-002) — RESOLVED: Option D, no migration

`market_data.exchanges.country` already exists (ISO 3166-1 alpha-2). Solution:

- **COUNTRY_TO_CURRENCY** — static map in backend service: `IL→ILS`, `IT→EUR`, `US→USD`, etc.
- **CRYPTO / no `exchange_id`:** Parse symbol (`BTC-USD → USD`, `ETH-EUR → EUR`)
- **Outerjoin** of `Exchange` in `get_tickers()` query — no schema change

---

## 3) Q2 — Traffic Light (BF-003) — RESOLVED: derived from `price_source`

`price_source` already in `TickerResponse` encodes operational quality:

| price_source | Traffic light |
|--------------|---------------|
| `"EOD"` | 🟢 green |
| `"EOD_STALE"` / `"INTRADAY_FALLBACK"` | 🟡 yellow |
| `null` | 🔴 red |

**Zero backend change.** Frontend colors a dot per row. Details modal → existing endpoint `/data-integrity`.

---

## 4) Q3 — "24 days" (BF-004) — ROOT CAUSE IDENTIFIED

`eodStalenessCheck.js` calls `/reference/exchange-rates` and uses `last_sync_time` of exchange rates. Exchange rates have not been updated for 24 days → clock shows "24 days ago". **This is unrelated to ticker data entirely.**

**Solution:** In `loadAllData()` — after receiving ticker data, call `window.updateStalenessClock()` with `max(price_as_of_utc)` from the ticker list. Thus the clock reflects actual price data freshness.

**Team 60 investigation:** Why have exchange rates not been updated for 24 days?

---

## 5) Holds released

**All holds removed.** Team 10 may activate all mandates immediately.

---

**log_entry | TEAM_00 | WP003_G7_REMEDIATION_ANSWERS | v1.0.0 | 2026-03-11**
