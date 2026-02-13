# TT2_ROADMAP_NEXT_STEPS

**id:** `TT2_ROADMAP_NEXT_STEPS`  
**owner:** Team 10  
**status:** DRAFT  
**last_updated:** 2026-02-13  

---

## 1) Immediate Next Steps (30–60 days)
1. **Pre‑Batch Dependency SSOT (Stage ‑1):** כתיבה ואישור SSOT מלא לתלויות חוצות‑מערכת (FOREX_MARKET_SPEC, MARKET_DATA_PIPE, CASH_FLOW_PARSER, PRECISION_ENGINE_V2, BROKER_API_SYNC, COMMUNICATION_SERVER).
2. **Scope Alignment:** יישור תפריט/Routes/Blueprints לפי Roadmap V2 (Tracking/Planning dashboards, `trades`, Admin V1, Data Import unified).
3. **PDSC Boundary Contract:** החלטת סקופ (min vs full) והשלמה בהתאם.
4. **Batch 3 Kickoff:** לאחר סגירת Stage ‑1 — התחלת Essential Data Layer (Alerts/Notes/User Tickers/Tickers Admin/Ref Brokers View in Admin).

## 1.1 Recently Completed
- ✅ Batch 2.5 mandates executed (ADR‑017/ADR‑018): Version 1.0 alignment, account‑based fees refactor, “Other” broker rule, Redirect/User Icon verification.
- ✅ Clean Table declared after A/B/C completion
- ✅ Knowledge Promotion + Archive cleanup (Batch 1+2)

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
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md`
- `_COMMUNICATION/team_10/TEAM_10_CLEAN_TABLE_PROTOCOL.md`
- `_COMMUNICATION/99-ARCHIVE/2026-02-12/ARCHIVE_MANIFEST.md`
- `_COMMUNICATION/90_Architects_comunication/BATCH_2_5_COMPLETIONS_MANDATE.md`
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_BROKER_REFERENCE_AND_OTHER_LOGIC.md`
- `_COMMUNICATION/90_Architects_comunication/TT2_VERSION_MATRIX_v1.0.md`
