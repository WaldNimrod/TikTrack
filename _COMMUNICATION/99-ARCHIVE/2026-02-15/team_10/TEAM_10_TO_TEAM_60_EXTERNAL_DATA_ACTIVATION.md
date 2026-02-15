# Team 10 → Team 60: הודעת הפעלה — ספקי נתונים חיצוניים (External Data) — תשתית

**id:** `TEAM_10_TO_TEAM_60_EXTERNAL_DATA_ACTIVATION`  
**from:** Team 10 (The Gateway)  
**to:** Team 60 (DevOps & Platform)  
**date:** 2026-02-13  
**סוג:** הודעת פתיחה לנושא חדש — הפעלת ביצוע  
**סטטוס:** 🔒 **מחייב — קריאה ואימוץ לפני התחלת עבודה**

---

## 1. הקשר — נושא חדש

אנחנו נכנסים לנושא **ספקי נתונים חיצוניים (External Data / Market Data)**.  
התשתית תספק **מחירי טיקרים** ו**שערי חליפין (FX)** ממקורות חיצוניים (Yahoo Finance + Alpha Vantage), עם Cache ב-DB, EOD Sync, טבלת Intraday נפרדת, ו-**Cleanup/Retention** אוטומטי.

**תפקידכם:** DDL/Schema, סנכרון EOD ל-FX, **טבלת Intraday + migration**, ו-**Cleanup jobs** (retention + archive) + Evidence.

**למה עכשיו:** ההחלטות ננעלו (TEAM_90_MAINTENANCE_LOCKED_UPDATE); SSOT מעודכן; Kickoff מאושר. מותר להתחיל ביצוע.

---

## 2. יעדים ומטרה סופית

| יעד | תיאור |
|-----|--------|
| **DB as Cache** | טבלאות DB כמטמון; אין קריאה חיצונית מתוך request — רק Jobs מרעננים. |
| **FX EOD** | סנכרון יומי שערי חליפין — **Alpha Vantage → Yahoo** (fallback); Scope: USD, EUR, ILS. |
| **טבלת Intraday** | נתוני Intraday ב-**טבלה נפרדת** `market_data.ticker_prices_intraday` (Active tickers בלבד). |
| **Retention + Archive (נעול)** | Intraday DB: 30 ימים → archive (1 שנה) → מחיקה. EOD/FX: 250 ימי מסחר → archive (ללא מחיקה קשיחה). |
| **Cleanup cycles** | Daily / Weekly / Monthly — לפי MARKET_DATA_PIPE_SPEC §7. |
| **Evidence** | כל Job: last_run_time, rows_updated, rows_pruned; Evidence לוגים ב־documentation/05-REPORTS/artifacts. |

**מטרה סופית:** Schema מלא, EOD Sync פעיל, טבלת Intraday ומיגרציה, Cleanup jobs רצים + Evidence. סגירה רק עם **Seal Message (SOP-013)**.

---

## 3. משימות מפורטות (צוות 60)

| מזהה | משימה | תוצר נדרש | מפרט עיקרי |
|------|--------|------------|-------------|
| **P3-011** | FX EOD Sync | Cron/Job: Alpha→Yahoo; עדכון `market_data.exchange_rates`; Scope USD/EUR/ILS | FOREX_MARKET_SPEC; MARKET_DATA_PIPE_SPEC §5, §7.1 |
| **P3-016** | Intraday Table + Migration | טבלה `market_data.ticker_prices_intraday` + DDL + migration | TEAM_90_MAINTENANCE_LOCKED_UPDATE; MARKET_DATA_PIPE_SPEC §4.1, §7 |
| **P3-017** | Cleanup Jobs + Evidence | Jobs: Intraday retention 30d; Daily 250d; archive; Evidence logs | MARKET_DATA_PIPE_SPEC §7.2–§7.4 |

**סגירה:** רק עם **Seal Message (SOP-013)** — ראה TEAM_10_TO_ALL_TEAMS_GOVERNANCE_V2_102_DISCIPLINE_MANDATE.

---

## 4. תיעוד ומדריכים — חובה לקריאה

### 4.1 מפרטי האדריכלית לספקים (מדריכים מחייבים)

| מסמך | נתיב | תוכן עיקרי |
|------|------|-------------|
| **EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC** | documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC.md | Fallback FX; yfinance; User-Agent Rotation; Precision 20,8 |
| **EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC** | documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC.md | **Primary FX**; Endpoint; **5 calls/min, RateLimitQueue 12.5s**; Precision 20,8 |

### 4.2 SSOT ארכיטקטורה ותחזוקה

| מסמך | נתיב | תוכן עיקרי |
|------|------|-------------|
| **MARKET_DATA_PIPE_SPEC** | documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md | §5 תיאום Team 60; **§7 תחזוקה וניקוי** — Jobs, Retention, Archive, Cleanup cycles |
| **MARKET_DATA_COVERAGE_MATRIX** | documentation/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md | Storage (exchange_rates, ticker_prices, ticker_prices_intraday); Retention |
| **FOREX_MARKET_SPEC** | documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md | FX EOD, Cache-First, ספקים Alpha→Yahoo, Scope USD/EUR/ILS |

### 4.3 החלטות ותכנון

| מסמך | נתיב |
|------|------|
| **TEAM_90_TO_TEAM_10_EXTERNAL_DATA_MAINTENANCE_LOCKED_UPDATE** | _COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_EXTERNAL_DATA_MAINTENANCE_LOCKED_UPDATE.md |
| **TEAM_10_EXTERNAL_DATA_MASTER_PLAN** | _COMMUNICATION/team_10/TEAM_10_EXTERNAL_DATA_MASTER_PLAN.md |
| **ARCHITECT_VERDICT_MARKET_DATA_STAGE_1 (ADR-022)** | _COMMUNICATION/90_Architects_comunication/ARCHITECT_VERDICT_MARKET_DATA_STAGE_1.md |

### 4.4 מנדט מפורט (M5)

| מסמך | נתיב |
|------|------|
| **TEAM_10_TO_TEAM_60_EXTERNAL_DATA_M5_MANDATE** | _COMMUNICATION/team_10/TEAM_10_TO_TEAM_60_EXTERNAL_DATA_M5_MANDATE.md |

---

## 5. סדר עבודה מומלץ

1. **קריאה** — MARKET_DATA_PIPE_SPEC §5, **§7** (תחזוקה); מפרטי Yahoo + Alpha; TEAM_90_MAINTENANCE_LOCKED_UPDATE.  
2. **P3-016** — DDL ל־`market_data.ticker_prices_intraday` + migration; תיאום עם Team 20 על שדות.  
3. **P3-011** — סקריפט/Job ל-FX EOD Sync (Alpha→Yahoo); תזמון (למשל 22:00 UTC א'–ה').  
4. **P3-017** — Cleanup jobs: Intraday 30d → archive → delete אחרי שנה; Daily 250d → archive; Evidence (last_run_time, rows_updated, rows_pruned).  

---

**log_entry | TEAM_10 | TO_TEAM_60 | EXTERNAL_DATA_ACTIVATION | 2026-02-13**
