# Team 20 → Team 10: ריענון מלא מודול External Data — אימוץ ויישור

**id:** `TEAM_20_TO_TEAM_10_FULL_MODULE_REVIEW_ACK`  
**from:** Team 20 (Backend)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**מקור:** TEAM_10_TO_TEAMS_20_30_60_EXTERNAL_DATA_FULL_MODULE_REVIEW_MANDATE

---

## 1. חבילת SSOT — נקראה ויושרה

קריאת חבילת המקורות המלאה (§2):
- ARCHITECT_MARKET_DATA_STRATEGY_ANALYSIS, EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC, EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC
- ARCHITECT_VERDICT_MARKET_DATA_STAGE_1 (ADR-022)
- MARKET_DATA_PIPE_SPEC, FOREX_MARKET_SPEC, MARKET_DATA_COVERAGE_MATRIX, MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC, PRECISION_POLICY_SSOT, TT2_MARKET_DATA_RESILIENCE

**יישור:** קוד/שירותים מיושרים ל-SSOT — אין סטייה מאפיון.

---

## 2. משימות §6.1 — סטטוס

| # | משימה | סטטוס | Evidence |
|---|--------|--------|----------|
| 1 | קריאת חבילת SSOT המלאה | ✅ | מסמך זה |
| 2 | סקריפט EOD למחירי טיקר | ✅ | scripts/sync_ticker_prices_eod.py; make sync-ticker-prices |
| 3 | יישור שירותי market_data | ✅ | cache_first_service; providers (FX: Alpha→Yahoo, Prices: Yahoo→Alpha); Guardrails |
| 4 | טיוטת DDL exchange_rates_history | ✅ | scripts/migrations/draft_exchange_rates_history.sql; תיאום עם 60 |
| 5 | תיעוד ALPHA_VANTAGE_API_KEY | ✅ | documentation/05-REPORTS/artifacts/TEAM_20_ALPHA_VANTAGE_API_KEY_GUIDELINES.md; api/.env.example |

---

## 3. תוצרים חדשים (מנדט זה)

| קובץ | תיאור |
|------|--------|
| scripts/migrations/draft_exchange_rates_history.sql | DDL טיוטה — ממתין לאישור אדריכל |
| documentation/05-REPORTS/artifacts/TEAM_20_ALPHA_VANTAGE_API_KEY_GUIDELINES.md | הנחיות QA/סביבה |
| api/.env.example | התייחסות ל-ALPHA_VANTAGE_API_KEY |

---

## 4. תיאום Team 60 — exchange_rates_history

- **DDL draft:** מוכן; Team 60 — migration + הרשאות.
- **Job EOD:** עדכון נדרש — INSERT history + UPSERT current (לאחר אישור).

---

**log_entry | TEAM_20 | FULL_MODULE_REVIEW | ACK | 2026-02-13**
