# 🕵️ Team 90 → Team 10: External Data TL;DR + Master Tasks

**id:** `TEAM_90_TO_TEAM_10_EXTERNAL_DATA_TLDR_AND_TASKS`  
**from:** Team 90 (The Spy)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-13  
**context:** ADR‑022 + ARCH‑STRAT‑002 + Stage‑1 (External Data Providers)  
**status:** 🔒 **ACTION REQUIRED — CREATE MASTER TASKS**

---

## TL;DR (נעול)
- Market Data Providers = **Yahoo + Alpha Vantage בלבד**.
- **Frankfurter מוסר לחלוטין**.
- **IBKR ברוקר בלבד** בשלב זה (לא ספק שוק).
- **FX = EOD בלבד** | **Primary: Alpha → Fallback: Yahoo** | מטבעות Stage‑1: USD/EUR/ILS.
- **Prices = Primary: Yahoo → Fallback: Alpha**.
- **Cache‑First חובה** לפני כל קריאה ל‑API חיצוני.
- **Agnostic Provider Interface** ב‑Python (החלפת ספק ללא שינוי קוד מנוע).
- **Clock‑based stale indicator** חובה ב‑UI (שעון + הדגשה צבעונית + Tooltip; ללא באנר).
- **Cadence/Precision לפי Domain + Ticker Status** (System Settings).
- **Yahoo:** yfinance + Query V8, Interval 1d, **User‑Agent Rotation חובה**.
- **Alpha:** 5 calls/min, **RateLimitQueue 12.5s חובה**.
- **Market Cap עכשיו**; **ATR‑14 / MA‑20,50,150,200 / CCI‑20 עכשיו**; **EPS מאוחר**.

**מקורות:**  
`_COMMUNICATION/90_Architects_comunication/ARCHITECT_VERDICT_MARKET_DATA_STAGE_1.md`  
`documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_MARKET_DATA_STRATEGY_ANALYSIS.md`  
`documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC.md`  
`documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC.md`

---

## משימות ראשיות (Level‑2) — לפי סדר ביצוע

### M1 — SSOT Lock (Specs + Registry)
**Owner:** Team 10  
**Goal:** לעדכן SSOT כך שיכלול את כל ההחלטות הנעולות + Provider Registry.

**כולל:**
- `FOREX_MARKET_SPEC.md`
- `MARKET_DATA_PIPE_SPEC.md`
- `WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md`
- (אם נדרש) **SSOT חדש: Provider Registry / Connector Contract**

**Acceptance:** אין Frankfurter ב‑SSOT; Yahoo+Alpha בלבד; FX EOD מוגדר; Registry/Connector מתועד.

---

### M2 — Provider Interface (Python) + Cache‑First
**Owner:** Team 20  
**Goal:** מנגנון Provider Agnostic + Cache‑First בכל קריאה.

**Acceptance:** אין קריאה חיצונית לפני cache; Provider interface עובד לפי config בלבד.

---

### M3 — FX EOD Sync (Alpha → Yahoo)
**Owner:** Team 60  
**Goal:** החלפת מקור FX ל‑Yahoo/Alpha בלבד + evidence.

**Acceptance:** סקריפט sync ללא Frankfurter; EOD cron + TZ מתועד; evidence log עם last_sync_time.

---

### M3.1 — Provider Guardrails (Rate‑Limit + User‑Agent)
**Owner:** Team 20  
**Goal:** ליישם דרישות ספק: RateLimitQueue (Alpha) + User‑Agent Rotation (Yahoo).

**Acceptance:** Queue 12.5s פעיל בכל קריאה ל‑Alpha; Rotation תקין ב‑Yahoo; evidence בלוג.

---
### M4 — Cadence/Precision Settings
**Owner:** Team 20 + Team 10  
**Goal:** ניהול cadence/precision לפי domain + ticker status דרך System Settings.

**Acceptance:** SSOT מתאר את המדיניות + מקום אחסון/config; UI/Backend נקודות hook ברורות.

---

### M5 — Clock‑based Staleness Indicator (EOD/Stale)
**Owner:** Team 30  
**Goal:** שעון עדכון + הדגשה צבעונית + Tooltip במצב פג תוקף (EOD/Stale).

**Acceptance:** רכיב שעון מוצג בכל תצוגת מחיר; Tooltip מופיע במצב פג תוקף; evidence QA.

---

### M6 — Historical Daily Data (250 trading days)
**Owner:** Team 20 + Team 60  
**Goal:** Daily OHLCV history for 250 trading days (no intraday retention for full range).

**Acceptance:** Daily history stored; usable for indicators; evidence in DB/ETL.

---

### M7 — Indicators (ATR/MA/CCI)
**Owner:** Team 20  
**Goal:** Compute ATR‑14, MA‑20/50/150/200, CCI‑20 from daily history.

**Acceptance:** API returns indicator values; precision 20,8; evidence tests.

---

### M8 — Market Cap (Stage‑1)
**Owner:** Team 20  
**Goal:** Ingest Market Cap from providers; store + expose.

**Acceptance:** Market Cap available in data model + API; precision 20,8; evidence.

---

## דרישות Evidence (חובה)
- Evidence Log מרכזי ב‑`05-REPORTS/artifacts/` עם קישורים לכל SSOT + מימוש.
- כל משימה Level‑2 נסגרת רק עם PASS מפורש.

---

**הפניה למסמך המלא:**  
`_COMMUNICATION/team_90/TEAM_90_EXTERNAL_DATA_READINESS_FOR_TEAM_10.md`

---

**log_entry | TEAM_90 | EXTERNAL_DATA_TLDR_TASKS | 2026-02-13**
