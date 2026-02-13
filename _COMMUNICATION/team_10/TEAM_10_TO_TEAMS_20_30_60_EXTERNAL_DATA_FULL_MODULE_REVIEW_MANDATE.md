# Team 10 → Teams 20, 30, 60: מנדט — ריענון מלא של מודול External Data (Full SSOT Pack)

**id:** `TEAM_10_TO_TEAMS_20_30_60_EXTERNAL_DATA_FULL_MODULE_REVIEW_MANDATE`  
**from:** Team 10 (The Gateway)  
**to:** Team 20 (Backend), Team 30 (UI), Team 60 (Infrastructure)  
**date:** 2026-02-13  
**status:** 🔒 **MANDATORY — read & align before execution**  
**מקור:** TEAM_90_TO_TEAM_10_EXTERNAL_DATA_MODULE_REVIEW_AND_EXCHANGE_RATES_HISTORY.md

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

### 6.1 Team 20 (Backend)

| # | משימה | תוצר / Evidence |
|---|--------|------------------|
| 1 | **קריאת חבילת SSOT המלאה** (§2) | חובה לפני כל שינוי קוד. |
| 2 | **סקריפט EOD לשמירת מחירי טיקר** — טעינה מ-Yahoo/Alpha ושמירה ל־`market_data.ticker_prices` (בדומה ל־sync_exchange_rates_eod.py). | סקריפט מוכן להרצה; וידוא שורות ב-DB אחרי ריצה. מקור: TEAM_10_TO_TEAM_20_GATE_B_GAPS_AND_SYNC_MANDATE. |
| 3 | **יישור שירותי market_data ל-SSOT** — cache_first_service, providers (priority FX: Alpha→Yahoo, Prices: Yahoo→Alpha), Guardrails (Yahoo UA, Alpha rate limit). | קוד מיושר; אין סטייה מאפיון. |
| 4 | **טיוטת DDL ל־exchange_rates_history** — טבלה `market_data.exchange_rates_history`; תוכנית עדכון job EOD (insert history + UPSERT ל־exchange_rates). תיאום עם Team 60. | קובץ DDL + תיאור שינוי job; הגשה ל-Team 10/אדריכל לאישור. |
| 5 | **תיעוד ALPHA_VANTAGE_API_KEY** והנחיות ל-QA/סביבה (כולל אופציונליות לבדיקות בלי key). | מסמך קצר או עדכון README/env. |

### 6.2 Team 30 (UI)

| # | משימה | תוצר / Evidence |
|---|--------|------------------|
| 1 | **קריאת חבילת SSOT המלאה** (§2) | חובה לפני כל שינוי. |
| 2 | **השלמת דשבורד נתונים (D23)** — טבלה 1: רשימת שערים (GET /reference/exchange-rates — זוג, שער, זמן עדכון). טבלה 2: דרופדאון לבחירת שער + מבנה להיסטוריה (placeholder או API כשקיים). | עמוד data_dashboard.html פונקציונלי; מפרט: DATA_DASHBOARD_SPEC. |
| 3 | **יישור UI External Data ל-SSOT** — שעון סטגנציה (P3-012): Clock + צבע + tooltip; Never block UI. וידוא שכל מקום שמציג נתוני שוק תואם לאפיון. | אין חסימת UI; התנהגות לפי MARKET_DATA_PIPE_SPEC §2.5. |
| 4 | **וידוא עמוד ניהול טיקרים (D22)** — כשהנתונים זמינים מ-backend, הצגת מחיר אחרון + שינוי יומי בהתאם לאפיון. | תיאור או checklist מול מפרט. |

### 6.3 Team 60 (Infrastructure)

| # | משימה | תוצר / Evidence |
|---|--------|------------------|
| 1 | **קריאת חבילת SSOT המלאה** (§2) | חובה לפני כל שינוי. |
| 2 | **יישור cron/job EOD ל-SSOT** — הרצת sync_exchange_rates_eod (קיים); לאחר ש-Team 20 יסיים — הרצת sync מחירי טיקר לפי לוח זמנים. | cron/תזמון מתועד; ללא סטייה מאפיון. |
| 3 | **הכנת migration ל־exchange_rates_history** — תיאום עם Team 20; DDL (טבלה, אינדקסים, הרשאות). מוכן להרצה באישור אדריכל/Team 10. | קובץ migration + תוכנית בעלות (מי מריץ, מתי). |
| 4 | **תוכנית retention + ארכיון** — 250 ימי מסחר ל-FX history → ארכיון (לפי SSOT); תיעוד או סקריפט ניקוי/ארכוב. | מסמך קצר או הגדרה ב-job. |

---

## 7. סדר ביצוע מומלץ

1. **כל הצוותים:** קריאת חבילת SSOT (§2) — במקביל.  
2. **Team 20 + 60:** טיוטת DDL ותוכנית job ל־exchange_rates_history — תיאום ביניהם; הגשה לאישור.  
3. **Team 20:** סקריפט EOD למחירי טיקר; יישור שירותים.  
4. **Team 30:** דשבורד נתונים (טבלה 1 + טבלה 2); יישור שעון סטגנציה ו-D22.  
5. **Team 60:** הרצת migration (לאחר אישור); עדכון job EOD; retention/ארכיון.

---

**log_entry | TEAM_10 | TO_TEAMS_20_30_60 | EXTERNAL_DATA_FULL_MODULE_REVIEW_MANDATE | 2026-02-13**
