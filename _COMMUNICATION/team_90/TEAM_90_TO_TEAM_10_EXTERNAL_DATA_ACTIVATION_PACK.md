# 🕵️ Team 90 → Team 10: External Data Activation Pack (SSOT + Tasks)

**id:** `TEAM_90_TO_TEAM_10_EXTERNAL_DATA_ACTIVATION_PACK`  
**date:** 2026-02-13  
**status:** 🔒 **READY — please integrate into Master Task List**

---

## 1) Primary Sources (Architect)

- `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_MARKET_DATA_STRATEGY_ANALYSIS.md`  
- `documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC.md`  
- `documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC.md`  
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_VERDICT_MARKET_DATA_STAGE_1.md`

---

## 2) SSOT Draft for Insertion

- `TEAM_90_MARKET_DATA_SSOT_INTEGRATION_DRAFT.md`  
  Path: `_COMMUNICATION/team_90/TEAM_90_MARKET_DATA_SSOT_INTEGRATION_DRAFT.md`

---

## 3) Master Tasks (Level‑2)

**M1 — SSOT Lock (Market Data Providers)**  
Update: `MARKET_DATA_PIPE_SPEC`, `FOREX_MARKET_SPEC`, `WP_20_09_FIELD_MAP_TICKERS_MAPPINGS` + (optional) Provider Registry SSOT.  
Evidence: Updated SSOT + links in 00_MASTER_INDEX.

**M2 — Provider Interface + Cache‑First** (Team 20)  
Agnostic interface, cache‑first enforcement, config‑driven providers.

**M3 — Provider Guardrails** (Team 20)  
Yahoo UA Rotation; Alpha RateLimitQueue 12.5s.

**M4 — Cadence Policy + Ticker Status** (Team 10 + 20)  
Active tickers = intraday; inactive = EOD. Define storage + defaults.

**M5 — FX EOD Sync** (Team 60)  
Alpha → Yahoo, no Frankfurter; evidence log.

**M6 — Clock‑based Staleness UI** (Team 30)  
Clock + color + tooltip; no banner.

---

## 4) Open Items Requiring Closure

- `TEAM_90_MARKET_DATA_GAPS_AND_OPEN_QUESTIONS.md`

---

**log_entry | TEAM_90 | EXTERNAL_DATA_ACTIVATION_PACK | 2026-02-13**
