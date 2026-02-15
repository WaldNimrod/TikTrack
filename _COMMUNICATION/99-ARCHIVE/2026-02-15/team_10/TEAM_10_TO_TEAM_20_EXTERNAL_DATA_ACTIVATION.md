# Team 10 → Team 20: הודעת הפעלה — ספקי נתונים חיצוניים (External Data)

**id:** `TEAM_10_TO_TEAM_20_EXTERNAL_DATA_ACTIVATION`  
**from:** Team 10 (The Gateway)  
**to:** Team 20 (Backend)  
**date:** 2026-02-13  
**סוג:** הודעת פתיחה לנושא חדש — הפעלת ביצוע  
**סטטוס:** 🔒 **מחייב — קריאה ואימוץ לפני התחלת עבודה**

---

## 1. הקשר — נושא חדש

אנחנו נכנסים לנושא **ספקי נתונים חיצוניים (External Data / Market Data)**.  
התשתית תספק **מחירי טיקרים** ו**שערי חליפין (FX)** ממקורות חיצוניים מאושרים, עם היררכיה ברורה (Cache → ספק ראשי → ספק גיבוי), בלי לחסום את ה-UI.

**למה עכשיו:** ההחלטות ננעלו באדריכלית ו־Team 90; ה-SSOT מעודכן; אין חסימות. מותר להתחיל ביצוע.

---

## 2. יעדים ומטרה סופית

| יעד | תיאור |
|-----|--------|
| **תשתית מאוחדת** | מקור אחד (ממשק אחיד) למחירי שוק ו-FX — Cache-First, החלפת ספק רק ב-config. |
| **ספקים (נעול)** | **Yahoo Finance** (Primary מחירים / Fallback FX) + **Alpha Vantage** (Primary FX / Fallback מחירים). אין ספקים אחרים ב-Stage-1. |
| **אין חסימת UI** | כל קריאה חיצונית — רק אחרי Cache; בכשל — החזר stale + `staleness=na`, לא חסימה. |
| **Guardrails** | Yahoo: User-Agent Rotation. Alpha: RateLimitQueue 12.5s (5 calls/min). |
| **אחסון** | Daily/EOD + Historical 250d ב־`ticker_prices`; **Intraday** ב־טבלה נפרדת `ticker_prices_intraday` (Active tickers). |
| **מדדים + Market Cap** | ATR(14), MA(20/50/150/200), CCI(20); שדה `market_cap` NUMERIC(20,8). דיוק: PRECISION_POLICY_SSOT. |

**מטרה סופית:** שירותים/קוד שמקיימים את כל המפרטים לעיל, עם Evidence וסגירה לפי **Seal Message (SOP-013)**.

---

## 3. משימות מפורטות (צוות 20)

| מזהה | משימה | תוצר נדרש | מפרט עיקרי |
|------|--------|------------|-------------|
| **P3-008** | Provider Interface + Cache-First | ממשק אגנוסטי (Python); config-driven; תמיד Cache לפני API | MARKET_DATA_PIPE_SPEC §2.1, §2.3; מפרטי ספקים |
| **P3-009** | Provider Guardrails | Yahoo: UA Rotation. Alpha: RateLimitQueue 12.5s | MARKET_DATA_PIPE_SPEC §2.2; מפרטי ספקים |
| **P3-013** | Market Cap | שדה `market_cap` ב־ticker_prices, NUMERIC(20,8); Yahoo→Alpha EOD | MARKET_DATA_COVERAGE_MATRIX; PRECISION_POLICY_SSOT |
| **P3-014** | Indicators ATR/MA/CCI | ATR(14), MA(20/50/150/200), CCI(20); 250d history | MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC |
| **P3-015** | 250d Historical Daily | OHLCV 250 ימי מסחר ב־ticker_prices | MARKET_DATA_COVERAGE_MATRIX; MARKET_DATA_PIPE_SPEC §4.1 |

**תלות (לא עליכם):** טבלת `ticker_prices_intraday` + migration — Team 60 (P3-016). אתם צורכים את הטבלה ואת ה-Schema כשמוכנים.

**סגירה:** רק עם **Seal Message (SOP-013)** — ראה TEAM_10_TO_ALL_TEAMS_GOVERNANCE_V2_102_DISCIPLINE_MANDATE.

---

## 4. תיעוד ומדריכים — חובה לקריאה

### 4.1 מפרטי האדריכלית לספקים (מדריכים מחייבים)

| מסמך | נתיב | תוכן עיקרי |
|------|------|-------------|
| **EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC** | documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC.md | Primary Prices / Fallback FX; yfinance + Query V8; Interval 1d (EOD); **User-Agent Rotation**; Precision 20,8 |
| **EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC** | documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC.md | Primary FX / Fallback Prices; Endpoint; **5 calls/min, RateLimitQueue 12.5s**; Precision 20,8 |

### 4.2 SSOT ארכיטקטורה ותהליך

| מסמך | נתיב |
|------|------|
| **MARKET_DATA_PIPE_SPEC** | documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md — §2 Providers, Cache-First, Cadence, §4 ממשקים, §7 תחזוקה |
| **MARKET_DATA_COVERAGE_MATRIX** | documentation/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md — מטריצת כיסוי, Storage, Retention |
| **MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC** | documentation/01-ARCHITECTURE/MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC.md — ATR, MA, CCI, Market Cap |
| **FOREX_MARKET_SPEC** | documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md — FX EOD, Cache-First, Scope מטבעות |
| **PRECISION_POLICY_SSOT** | documentation/01-ARCHITECTURE/PRECISION_POLICY_SSOT.md — market_cap ו-prices = 20,8 |
| **TT2_MARKET_DATA_RESILIENCE** | documentation/01-ARCHITECTURE/LOGIC/TT2_MARKET_DATA_RESILIENCE.md — Hierarchy, Staleness 15m/24h |
| **WP_20_09_FIELD_MAP_TICKERS_MAPPINGS** | documentation/01-ARCHITECTURE/LOGIC/WP_20_09_FIELD_MAP_TICKERS_MAPPINGS.md — provider_mapping_data |

### 4.3 החלטות אדריכלית ותכנון

| מסמך | נתיב |
|------|------|
| **ARCHITECT_VERDICT_MARKET_DATA_STAGE_1 (ADR-022)** | _COMMUNICATION/90_Architects_comunication/ARCHITECT_VERDICT_MARKET_DATA_STAGE_1.md |
| **TEAM_10_EXTERNAL_DATA_MASTER_PLAN** | _COMMUNICATION/team_10/TEAM_10_EXTERNAL_DATA_MASTER_PLAN.md |
| **TEAM_90_TO_TEAM_10_EXTERNAL_DATA_MAINTENANCE_LOCKED_UPDATE** | _COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_EXTERNAL_DATA_MAINTENANCE_LOCKED_UPDATE.md |

### 4.4 מנדט מפורט (M2+M3)

| מסמך | נתיב |
|------|------|
| **TEAM_10_TO_TEAM_20_EXTERNAL_DATA_M2_M3_MANDATE** | _COMMUNICATION/team_10/TEAM_10_TO_TEAM_20_EXTERNAL_DATA_M2_M3_MANDATE.md |

---

## 5. סדר עבודה מומלץ

1. **קריאה** — מפרטי הספקים (Yahoo, Alpha) + MARKET_DATA_PIPE_SPEC §2, §4.  
2. **M2 + M3** — Provider Interface + Cache-First + Guardrails (P3-008, P3-009).  
3. **P3-013, P3-014, P3-015** — Market Cap, Indicators, 250d — לפי תלות ב-Schema/טבלאות (תיאום עם Team 60 על DDL).

---

**log_entry | TEAM_10 | TO_TEAM_20 | EXTERNAL_DATA_ACTIVATION | 2026-02-13**
