# TT2_ROADMAP_NEXT_STEPS

**id:** `TT2_ROADMAP_NEXT_STEPS`  
**owner:** Team 10  
**status:** ACTIVE  
**last_updated:** 2026-02-14  

---

## 1) Immediate Next Steps (30-60 days)
1. **Stage-1 Execution Closure:** complete external data implementation and verification (providers, cadence, crypto mapping, cleanup).
2. **User Tickers Full Closure:** finalize crypto add flow QA and operational readiness.
3. **Template Contract v1.1 Enforcement:** keep page factory/validation as mandatory gate for new pages.
4. **Batch 3 Controlled Kickoff:** move to Essential Data Layer only after Stage-1 evidence is green.

## 1.1 Recently Completed
- Batch 2.5 mandates integrated into active SSOT and codebase
- User Tickers route + API + junction model implemented
- Market-data maintenance jobs and archive/retention scripts integrated

## 1.2 Roadmap V2 Scope (Approved)
**Batch 3 — Essential Data Layer (UI):**
- ALERTS, NOTES, USER_TICKERS, TICKERS_MGR (Admin).
- **REF_BROKERS_VIEW:** תצוגת Read‑only בתוך Admin V1 (לא עמוד עצמאי).
- D15_SETTINGS / Preferences — אפיון עמוק לפני ביצוע.

**Batch 4 — Financial Execution:**
- TRADING_ACCOUNTS, BROKERS_FEES, EXECUTIONS, CASH_FLOWS.
- D23_IMPORT_CENTER = עמוד אחד ל‑**Cash Flows + Executions**.

**Batch 5 — Complex Entities:**
- TRADE_PLANS (עמוד משנה), TRADES (עמוד משנה), WATCH_LISTS, TAG_MANAGEMENT.
- **Planning Dashboard** + **Tracking Dashboard** — כעמודי בסיס ניווט (יתפתחו בשלבים).

**Batch 6 — Advanced Analytics:**
- TRADING_JOURNAL, TICKER_DASHBOARD, STRATEGY_ANALYSIS, TRADES_HISTORY, PORTFOLIO_STATE, AI_ANALYSIS_VIEW.

**Admin V1 (רוחבי):**
- `system_management`, `tickers`, `admin/design-system`.
- רשימות Read‑only: Brokers + Statuses בתוך `system_management`.

## 1.3 Stage-1 External Data Workstream (Current)
- Provider contracts:
  - Prices: Yahoo primary, Alpha fallback
  - FX: Alpha primary, Yahoo fallback
- Crypto contracts:
  - Yahoo `BASE-QUOTE` (`BTC-USD`)
  - Alpha `symbol+market` via digital-currency endpoint
- Smart history:
  - gap-first by default
  - force reload admin-only
- Maintenance:
  - intraday retention + archive
  - EOD/FX retention + archive policy

## 2) Mid‑Term Milestones
- Admin V1 expansion (system management modules + read‑only lists)
- Harden tier‑based routing (`user_tier`)

## 3) Long‑Term Vision
- Full production hardening
- Premium tiers
- Automated data ingestion per broker

## 4) Key Dependencies
- Stage ‑1 SSOT pack for cross‑system dependencies (Market Data, Parsers, Precision, Broker Sync, Communication Server)
- PDSC boundary contract
- Design system stability

## 5) References
- `documentation/00-MANAGEMENT/TT2_PHASE_2_CLOSURE_WORK_PLAN.md`
- `_COMMUNICATION/90_Architects_comunication/PHOENIX_UNIFIED_MODULAR_ROADMAP_V2_1.md`
- `documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md`
- `documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/BATCH_2_5_COMPLETIONS_MANDATE.md`
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_VERDICT_MARKET_DATA_STAGE_1.md`
