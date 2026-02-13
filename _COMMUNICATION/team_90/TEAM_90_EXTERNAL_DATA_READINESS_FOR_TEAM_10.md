# 🕵️ Team 90 → Team 10: External Data Readiness (SSOT + Execution)

**id:** `TEAM_90_EXTERNAL_DATA_READINESS_FOR_TEAM_10`  
**from:** Team 90 (The Spy)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**context:** ADR‑022 + ARCH‑STRAT‑002 + Stage‑1 (Roadmap v2.1) — External Data Providers  
**status:** 🔒 **READY FOR IMPLEMENTATION — SSOT UPDATE REQUIRED**

---

## 1) החלטות נעולות (LOCKED)

**מקורות אדריכלית (Primary Sources):**  
- `_COMMUNICATION/90_Architects_comunication/ARCHITECT_VERDICT_MARKET_DATA_STAGE_1.md` (ADR‑022)  
- `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_MARKET_DATA_STRATEGY_ANALYSIS.md` (ARCH‑STRAT‑002)  
- `documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC.md`  
- `documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC.md`

**החלטות:**
- **Providers (Market Data):** Yahoo Finance + Alpha Vantage בלבד.  
- **Frankfurter מוסר** לחלוטין.  
- **IBKR = ברוקר בלבד** בשלב זה (לא ספק מחירי שוק).
- **FX = EOD בלבד**.
- **FX Primary/Fallback:** Alpha Vantage → Yahoo.  
- **Prices Primary/Fallback:** Yahoo → Alpha.  
- **Scope מטבעות Stage‑1:** USD/EUR/ILS.  
- **Caching חובה:** אין פנייה ל‑API חיצוני ללא בדיקת Local Cache.  
- **Agnostic Interface:** Provider Interface ב‑Python (ללא שינוי קוד מנוע בעת החלפה).  
- **Visual Warning:** אין באנר. חובה **שעון עדכון** + **הדגשה צבעונית** + **Tooltip** כאשר הנתון פג תוקף (EOD/Stale).  
- **Cadence/Precision:** מנוהל לפי **Domain** + **Ticker Status** דרך System Settings.  
- **Fundamentals:** שלבים מתקדמים בלבד (לא Stage‑1).
  
**ספקים — הנחיות אדריכלית מפורשות:**  
- **Yahoo Finance:** Primary for Prices / Fallback for FX; Method: `yfinance` + Query V8 API; **Interval: 1d (EOD)**; **User‑Agent Rotation חובה**; Precision forced 20,8.  
- **Alpha Vantage:** Primary for FX / Fallback for Prices; Endpoint: `https://www.alphavantage.co/query`; **Rate Limit: 5 calls/min**; **Mandatory RateLimitQueue (12.5s delay)**; Precision forced 20,8.

---

## 2) מקורות Legacy/Archive שיש לזקק ל‑SSOT (Secondary Sources)

1. **Provider Registry + Fallback Chain (ERD):**  
`_COMMUNICATION/99-ARCHIVE/_Cursor_full_design_V1_final_PROJECT_PHOENIX/01-PLANNING/PHX_DB_SCHEMA_V2_ERD.md`

2. **Vendor Symbol Mapping + Validation Strategy (Questions):**  
`_COMMUNICATION/99-ARCHIVE/_Cursor_full_design_V1_final_PROJECT_PHOENIX/TEMPORARY/PHASE3_CRITICAL_UPDATE_SUMMARY.txt`

3. **Market Data Resilience (Legacy Yahoo protocol):**  
`_COMMUNICATION/99-ARCHIVE/_Cursor_full_design_V1_final_PROJECT_PHOENIX/00_Strategic_Decisions/TT2_MARKET_DATA_RESILIENCE.md`

> הערה: מקורות אלו אינם SSOT — נדרשת זיקוק + קידום ל‑SSOT.

---

## 3) דרישות SSOT (חובה לעדכן)

### 3.1 `FOREX_MARKET_SPEC.md`
נתיב: `documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md`
- לעדכן ספקים: **Alpha (Primary) → Yahoo (Fallback)** בלבד.
- להסיר Frankfurter.
- לקבע Scope מטבעות: USD/EUR/ILS.
- לקבע EOD בלבד.
- לציין Precision 20,8 לשערים/מחירים (ARCH‑STRAT‑002).

### 3.2 `MARKET_DATA_PIPE_SPEC.md`
נתיב: `documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md`
- להצהיר Provider Registry + Connector Contract (agnostic interface).
- לקבע Providers: Yahoo + Alpha בלבד.
- להוסיף Cache‑First enforcement (no external call without cache).
- להוסיף Primary/Fallback **שונים** ל‑FX לעומת Prices (FX: Alpha→Yahoo; Prices: Yahoo→Alpha).
- להוסיף דרישות ספק: **User‑Agent Rotation (Yahoo)** + **RateLimitQueue 12.5s (Alpha)**.
- Cadence/Precision לפי Domain + Ticker Status (System Settings).
- להפריד Domains: FX / Prices / Historical / Fundamentals.

### 3.3 `WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md`
נתיב: `documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md`
- provider_mapping_data חייב לשקף **Yahoo + Alpha** בלבד.

### 3.4 SSOT חדש (אם נדרש): Provider Registry
אם אין מקום מלא ב‑MARKET_DATA_PIPE_SPEC:
- ליצור SSOT ייעודי: Provider Registry + Connector Contract + Priority/Fallback + Health + Config.

---

## 4) דרישות מימוש (Task Seeds לצוותים)

### Team 20 (Backend)
- Provider Interface ב‑Python (agnostic).  
- Cache‑First logic בשירותי מחירים.  
- Config ל‑provider selection (Yahoo/Alpha בלבד).  
- Domain policy (Prices cadence/precision לפי ticker status).

### Team 60 (Infrastructure)
- EOD Sync ל‑FX עם Alpha→Yahoo בלבד.  
- Cron + TZ מתועד.  
- Evidence log של ריצות + last_sync_time.

### Team 30 (Frontend)
- **Clock‑based indicator**: זמן עדכון אחרון + הדגשה צבעונית + Tooltip במצב פג תוקף.  
- UI hooks לשינוי cadence/precision לפי System Settings.

### Team 10 (Governance)
- קידום ידע ל‑SSOT לפי סעיף 3.  
- עדכון Master Task List (Level‑2).  
- Evidence log + הפניות לאדריכלית.

---

## 5) Acceptance Criteria (Gate B)

1. **אין Frankfurter** בקוד/SSOT.
2. **Yahoo + Alpha בלבד** מוגדרים ב‑SSOT + config.
3. Cache‑First enforcement מאומת בקוד (service layer) + evidence.
4. Provider Interface agnostic קיים ומופעל ב‑Python.
5. **Clock‑based warning** מוצג כאשר מחיר EOD/Stale (אין באנר).
6. Cadence/Precision מנוהלים לפי Domain + Ticker Status (System Settings).
7. Evidence log מלא עם קישורים לכל ה‑SSOT והקוד.

---

**log_entry | TEAM_90 | EXTERNAL_DATA_READINESS | 2026-02-13**
