# Team 10 → Teams 20, 30, 60: מנדט — ריענון מלא של מודול External Data (Full SSOT Pack)

**id:** `TEAM_10_TO_TEAMS_20_30_60_EXTERNAL_DATA_FULL_MODULE_REVIEW_MANDATE`  
**from:** Team 10 (The Gateway)  
**to:** Team 20 (Backend), Team 30 (UI), Team 60 (Infrastructure)  
**date:** 2026-02-13  
**status:** 🔒 **MANDATORY — read & align before execution**  
**מקור:** TEAM_90_TO_TEAM_10_EXTERNAL_DATA_MODULE_REVIEW_AND_EXCHANGE_RATES_HISTORY.md

**תוכנית עבודה:** מסמך זה מהווה את **תוכנית העבודה המפורטת הנוכחית** למודול External Data. מולו יש לעבוד ולשמור על תהליך מסודר עד **השלמה מלאה** — אחרת נוצרים חורים. כל עדכון סטטוס משימות יתועד כאן (§8).

---

## 0. סגירת שאלות פתוחות — הרצת תהליך הפיתוח

**הערכת Team 10:**  
בהתאם להנחיית Spy (ריענון מלא + חבילת SSOT + המלצה Option A להיסטוריית שערים), **כל השאלות הפתוחות הרלוונטיות למודול External Data מקבלות מענה מספיק להרצת תהליך הפיתוח.**

- **ריענון מודול:** חובה — מנדט זה + חבילת המקורות המלאה.
- **היסטוריית שערים:** המלצת Spy (Option A — שמירה ב-DB) מיושרת ל-SSOT; יישום פורמלי יופעל לאחר אישור אדריכל/DDL. **עבודת הכנה (DDL, תוכנית בעלות, עדכון job) — מיידית.**
- **פערי Gate B (sync מחירים, דשבורד נתונים):** ממופים במנדט זה ובמסמכי הפערים; משימות היישום המיידי (§6) מכסות אותם.

**מסקנה:** ניתן להריץ את תהליך הפיתוח — כל צוות מקבל משימות ברורות ליישום מיידי (§6).

---

## 1. הנחיה מרכזית

חובה **לריענון מלא (re-review)** של מודול **External Data** מקצה לקצה.  
העדכונים האחרונים **אינם רק דלתאות** — דרישות הבסיס של המודול **נעולות**.  

**כל צוות ביצוע (20, 30, 60) חייב לקרוא את מפרטי המודול המלאים**, לא רק עדכונים.  
זה **חובה** למניעת מימוש חלקי וסטייה מהאפיון.

---

## 2. חבילת מקורות מלאה (Full SSOT Pack) — חובה לקריאה

### 2.1 מקורות אדריכל (LOCKED)

| מסמך | נתיב |
|------|------|
| ARCHITECT_MARKET_DATA_STRATEGY_ANALYSIS | documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_MARKET_DATA_STRATEGY_ANALYSIS.md |
| EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC | documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_YAHOO_FINANCE_SPEC.md |
| EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC | documentation/90_ARCHITECTS_DOCUMENTATION/EXTERNAL_PROVIDER_ALPHA_VANTAGE_SPEC.md |
| ARCHITECT_VERDICT_MARKET_DATA_STAGE_1 (ADR-022) | _COMMUNICATION/90_Architects_comunication/ARCHITECT_VERDICT_MARKET_DATA_STAGE_1.md |

### 2.2 SSOT (חובה)

| מסמך | נתיב |
|------|------|
| MARKET_DATA_PIPE_SPEC | documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md |
| FOREX_MARKET_SPEC | documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md |
| MARKET_DATA_COVERAGE_MATRIX | documentation/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md |
| MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC | documentation/01-ARCHITECTURE/MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC.md |
| PRECISION_POLICY_SSOT | documentation/01-ARCHITECTURE/PRECISION_POLICY_SSOT.md |
| TT2_MARKET_DATA_RESILIENCE | documentation/01-ARCHITECTURE/LOGIC/TT2_MARKET_DATA_RESILIENCE.md |

---

## 3. היסטוריית שערי חליפין (Exchange Rates History)

Team 10 ביקש הנחיית אדריכלות לאחסון היסטוריית FX.  
**המלצת Spy (Team 90, מיושרת ל-SSOT):** **Option A — שמירת היסטוריה ב-DB**.

**נימוק:** SSOT כבר נועל **שמירת FX 250 ימי מסחר + ארכיון**. זה דורש טבלת היסטוריה ואינו מתיישב עם "ערך נוכחי בלבד" או שאילתות on-the-fly לספק.

**תוצאה צפויה (באישור אדריכל):**
- טבלה חדשה: `market_data.exchange_rates_history`
- Job EOD: מכניס שורות היסטוריה + UPSERT לערך נוכחי ב־exchange_rates
- Retention: 250d → קבצי ארכיון (לפי SSOT)

**פעולה נדרשת:**  
- **להמתין להחלטת אדריכל** הסופית.  
- **להכין מראש:** טיוטת DDL + תוכנית בעלות (מי מוביל: Team 60/20) — כדי לאפשר יישום מהיר באישור.

---

## 4. פעולות נדרשות לכל צוות

| צוות | פעולה |
|------|--------|
| **20** | קריאת חבילת המקורות המלאה (§2); יישור קוד/שירותים ל-SSOT; הכנת תוכנית DDL/בעלות להיסטוריית FX (יחד עם 60) אם רלוונטי. |
| **30** | קריאת חבילת המקורות המלאה (§2); יישור UI/שעון סטגנציה וממשקים ל-SSOT; מודעות ל-FX history (דשבורד נתונים — טבלה 2) כשתעלה. |
| **60** | קריאת חבילת המקורות המלאה (§2); יישור תשתית (cron, DB, הרשאות) ל-SSOT; הכנת תוכנית DDL/בעלות ל־exchange_rates_history (יחד עם 20) — מוכן להרצה באישור אדריכל. |

---

## 5. דיווח

לאחר ריענון — כל צוות יכול לאשר ל-Team 10 (בדוא"ל/הודעה קצרה) ש"חבילת ה-SSOT המלאה נקראה ויושרה".  
אין לבצע שינויי קוד/תשתית במודול External Data בלי יישור למקורות לעיל.

---

## 6. משימות ליישום מיידי (לכל צוות)

### 6.1 Team 20 (Backend) — ✅ **הושלם**

| # | משימה | תוצר / Evidence | סטטוס |
|---|--------|------------------|--------|
| 1 | **קריאת חבילת SSOT המלאה** (§2) | TEAM_20_TO_TEAM_10_FULL_MODULE_REVIEW_ACK | ✅ |
| 2 | **סקריפט EOD לשמירת מחירי טיקר** | sync_ticker_prices_eod.py; make sync-ticker-prices | ✅ |
| 3 | **יישור שירותי market_data ל-SSOT** | cache_first_service, providers, Guardrails (Yahoo UA, Alpha 12.5s); _persist_price_to_db בעת fetch | ✅ |
| 4 | **טיוטת DDL ל־exchange_rates_history** | draft → Team 60 מימש p3_018 | ✅ |
| 5 | **תיעוד ALPHA_VANTAGE_API_KEY** | TEAM_20_ALPHA_VANTAGE_API_KEY_GUIDELINES.md; api/.env.example | ✅ |

**הודעת סיום:** _COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_EXTERNAL_DATA_IMPLEMENTATION_COMPLETE.md

### 6.2 Team 30 (UI) — ✅ **הושלם**

| # | משימה | תוצר / Evidence | סטטוס |
|---|--------|------------------|--------|
| 1 | **קריאת חבילת SSOT המלאה** (§2) | חובה לפני כל שינוי. | ✅ |
| 2 | **השלמת דשבורד נתונים (D23)** | טבלה 1: שערים (GET /reference/exchange-rates) — זוג, שער, זמן עדכון; כפתור רענון; טעינה אוטומטית. טבלה 2: דרופדאון זוג מטבעות (מטבלה 1); תאריך/שעה, שער; כרגע שורה נוכחית בלבד + הערה "היסטוריה מלאה תתווסף כשניישם API היסטוריה". סיכום עליון: סה"כ שערים, סטטוס עדכון. | ✅ |
| 3 | **יישור UI External Data ל-SSOT** | שעון סטגנציה (P3-012); Never block UI. | ✅ |
| 4 | **וידוא עמוד ניהול טיקרים (D22)** | כשהנתונים זמינים — מחיר אחרון + שינוי יומי (מפרט). | ✅ |

**קבצים:** data_dashboard.content.html, dataDashboardTableInit.js, page-manifest.json (טעינת dataDashboardTableInit).  
**מקור:** TEAM_10_TO_TEAM_30_DATA_DASHBOARD_SPEC_HANDOFF.

### 6.3 Team 60 (Infrastructure) — ✅ **הושלם**

| # | משימה | תוצר / Evidence | סטטוס |
|---|--------|------------------|--------|
| 1 | **קריאת חבילת SSOT המלאה** (§2) | חובה לפני כל שינוי. | ✅ |
| 2 | **יישור cron/job EOD ל-SSOT** — הרצת sync_exchange_rates_eod; sync מחירי טיקר לפי לוח. | TEAM_60_CRON_SCHEDULE.md — FX 22:00, Ticker 22:05, Cleanup 22:30 UTC | ✅ |
| 3 | **הכנת migration ל־exchange_rates_history** | p3_018_exchange_rates_history.sql — הורצה בהצלחה | ✅ |
| 4 | **תוכנית retention + ארכיון** — 250d ל-FX history | run_cleanup_fx_history() ב-cleanup_market_data.py | ✅ |

**הודעת סיום:** _COMMUNICATION/team_60/TEAM_60_TO_TEAM_10_EXTERNAL_DATA_IMPLEMENTATION_COMPLETE.md

---

## 7. סדר ביצוע מומלץ

1. **כל הצוותים:** קריאת חבילת SSOT (§2) — במקביל.  
2. **Team 20 + 60:** טיוטת DDL ותוכנית job ל־exchange_rates_history — תיאום ביניהם; הגשה לאישור. — ✅ **הושלם**  
3. **Team 20:** סקריפט EOD למחירי טיקר; יישור שירותים. — ✅ **הושלם**  
4. **Team 30:** דשבורד נתונים (טבלה 1 + טבלה 2); יישור שעון סטגנציה ו-D22. — ✅ **הושלם**  
5. **Team 60:** הרצת migration (לאחר אישור); עדכון job EOD; retention/ארכיון. — ✅ **הושלם**

---

## 8. סטטוס ביצוע (מעקב מול תוכנית העבודה)

עדכון סטטוס מול §6 — יש לעדכן כאן עם כל הודעת סיום/התקדמות.

| צוות | סטטוס | הודעה / Evidence |
|------|--------|-------------------|
| **Team 60** | ✅ **הושלם** | TEAM_60_TO_TEAM_10_EXTERNAL_DATA_IMPLEMENTATION_COMPLETE.md — migration p3_018, job EOD (history + UPSERT), cleanup FX 250d, תיעוד cron, Makefile. |
| **Team 20** | ✅ **הושלם** | TEAM_20_TO_TEAM_10_EXTERNAL_DATA_IMPLEMENTATION_COMPLETE.md — sync_ticker_prices_eod, יישור market_data, DDL (60 מימש p3_018), תיעוד ALPHA_VANTAGE_API_KEY, תאום 60. |
| **Team 30** | ✅ **הושלם** | דשבורד נתונים (D23): טבלה 1 שערים (GET exchange-rates, רענון, טעינה אוטומטית), טבלה 2 דרופדאון + שורה נוכחית + הערה ל-API היסטוריה, סיכום עליון. קבצים: data_dashboard.content.html, dataDashboardTableInit.js, page-manifest. |

---

## 9. סטטוס השלמה — **לא בדקנו אז לא סיימנו**

**מימוש:** כל שלושת הצוותים (20, 30, 60) השלימו את משימות המנדט (§6).  
**השלמה מלאה:** **לא** — עד שלא מבוצעות **בדיקות (QA)** ואין פתרון לבעיות הממשק המתוארות להלן, התהליך **לא נחשב סגור.**

### 9.1 בעיות שדווחו (ממשק)

| בעיה | תיאור | בעלים משוער |
|------|--------|--------------|
| **ניווט לדשבורד נתונים** | לא מצליחים לגלוש לעמוד דשבורד נתונים (הקישור בתפריט "נתונים" → "דשבורד נתונים"). | Team 30 / תשתית — לבדוק: האם העמוד נגיש ב-dev (Vite routeToFileMap); האם ב-build (dist) העמוד מוגש (multi-page או העתקה ל-dist). |
| **נתוני מחיר בעמוד טיקרים** | בממשק לא רואים נתוני מחיר בעמוד טיקרים. | Backend מחזיר current_price רק כשיש רשומות ב־market_data.ticker_prices (sync_ticker_prices_eod). אם אין נתונים — להריץ sync או להציג placeholder (למשל "—") כשמחיר חסר. |

### 9.2 פעולות נדרשות

1. **QA:** הרצת בדיקות E2E/ידניות: ניווט לדשבורד נתונים, הצגת שערים, עמוד טיקרים עם/בלי נתוני מחיר.
2. **ניווט דשבורד נתונים:** וידוא שהקישור `/data_dashboard.html` מחזיר את העמוד (dev + build/production).
3. **מחיר בעמוד טיקרים:** וידוא ש־GET /tickers מחזיר current_price כשקיים ב-DB; הרצת sync מחירים אם צריך; בממשק — הצגת "—" או "אין נתון" כשמחיר null.

**מסמך מפורט:** 05-REPORTS/artifacts/TEAM_10_EXTERNAL_DATA_UI_GAPS_AND_QA.md — סיבות אפשריות, פעולות מומלצות, רשימת בדיקות QA.

**הנחיית מנהלת העבודה (סגירה מסודרת, בלי ניחושים):**  
`_COMMUNICATION/team_10/TEAM_10_WORK_MANAGER_DIRECTIVE_EXTERNAL_DATA_UI_CLOSURE.md` — סדר ביצוע: אימות (50) → תיקונים (30, 20, 60) → אימות חוזר (50) → עדכון סטטוס (10); משימות ותוצרים מוגדרים לכל צוות.

---

## 10. שידרוג בדיקות אוטומטיות (הנחיית אדריכל — Team 90) 🔒

**מקור:** `_COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_DIRECTIVE.md` — **MANDATORY**, implement as architect instruction.

### 10.1 החלטה (נעולה)

| פריט | תוכן |
|------|------|
| **חבילת Fixtures** | מקור יחיד (FX/Prices/Indicators) — `tests/fixtures/` |
| **מיקום Fixtures** | `tests/fixtures/market_data/` — FX EOD, Prices (intraday+EOD), 250d history, Indicators (ATR/MA/CCI), Market Cap |
| **מודל הרצה** | **Nightly CI:** סוויטת מלאה; **PR/commit:** תת-סוויטת Smoke |

### 10.2 ארכיטקטורת בדיקות (חובה)

- **Provider Replay Mode:** כל אדפטרי הספקים חייבים לתמוך ב־`mode=REPLAY` — החזרת נתונים מ-fixtures **בלי קריאות חיצוניות**.
- **סוויטות חובה:** A) Contract & Schema (שדות חובה, precision 20,8, staleness enum); B) Cache‑First + Failover; C) Cadence & Status; D) Retention & Cleanup Jobs; E) UI (Clock + Tooltip — ללא banner).
- **CI:** Nightly = A–E עם REPLAY; PR = Smoke: A, B, D.

### 10.3 הקצאת משימות (Team 10 מפיץ)

| צוות | היקף |
|------|------|
| **20** | Provider Replay Mode + contract tests + cache/failover tests |
| **60** | Retention/cleanup jobs + job evidence |
| **50** | Nightly/Smoke QA scripts + reporting |
| **30** | UI clock/tooltip automation (Selenium) |
| **10** | CI wiring + mandates + evidence log + לוח CI |

### 10.4 קריטריוני קבלה

- סוויטה מלאה עוברת ב-Nightly; Smoke עובר ב-PR.
- אין קריאות רשת חיצוניות ב־`mode=REPLAY`.
- Evidence logs מצורפים ל-jobs ול-Nightly run.

**מנדטים מפורטים לצוותים:** §10 מפנה למנדטים הנפרדים שהונפקו (TEAM_10_TO_TEAM_xx_EXTERNAL_DATA_AUTOMATED_TESTING_MANDATE).

**Team 10 — CI + Evidence:** חיווט CI (Nightly + Smoke), פרסום לוח CI, ו־Evidence log: `05-REPORTS/artifacts/TEAM_10_EXTERNAL_DATA_AUTOMATED_TESTING_EVIDENCE_LOG.md`.

### 10.5 סטטוס ביצוע — Automated Testing (§10)

| צוות | היקף | סטטוס | Evidence / הודעה |
|------|------|--------|-------------------|
| **60** | Retention/cleanup + סוויטה D | ✅ **הושלם** | TEAM_60_TO_TEAM_10_AUTOMATED_TESTING_MANDATE_COMPLETE.md; tests/test_retention_cleanup_suite_d.py; TEAM_60_CLEANUP_EVIDENCE.json |
| 20 | Replay Mode + A, B | ⏳ | — |
| 30 | סוויטה E (UI) | ⏳ | — |
| 50 | Nightly/Smoke scripts + reporting | ⏳ | — |
| 10 | CI wiring + evidence log | ⏳ | — |

---

**log_entry | TEAM_10 | TO_TEAMS_20_30_60 | EXTERNAL_DATA_FULL_MODULE_REVIEW_MANDATE | 2026-02-13**
