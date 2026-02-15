# Team 10 → Team 30: הודעת הפעלה — ספקי נתונים חיצוניים (External Data) — UI

**id:** `TEAM_10_TO_TEAM_30_EXTERNAL_DATA_ACTIVATION`  
**from:** Team 10 (The Gateway)  
**to:** Team 30 (Frontend)  
**date:** 2026-02-13  
**סוג:** הודעת פתיחה לנושא חדש — הפעלת ביצוע  
**סטטוס:** 🔒 **מחייב — קריאה ואימוץ לפני התחלת עבודה**

---

## 1. הקשר — נושא חדש

אנחנו נכנסים לנושא **ספקי נתונים חיצוניים (External Data / Market Data)**.  
התשתית תספק **מחירי טיקרים** ו**שערי חליפין (FX)** ממקורות חיצוניים; ה-Backend יספק גם **מטא-דאטה לרענון** (מתי עודכן, האם stale).

**תפקידכם:** להציג **אינדיקציית רענון (Staleness)** ליד מחירים/שערים — **Clock + color + tooltip** — **בלי באנר**. כך המשתמש יודע אם הנתונים עדכניים או EOD/stale.

**למה עכשיו:** ההחלטות ננעלו; SSOT מעודכן; מותר להתחיל ביצוע.

---

## 2. יעדים ומטרה סופית

| יעד | תיאור |
|-----|--------|
| **חוויית משתמש ברורה** | בכל מקום שמציגים מחיר או שער — **שעון עדכון** + צבע לפי סטטוס + tooltip שמסביר (עדכני / אזהרה / EOD). |
| **אין באנר** | הוחלט באדריכלית: **אין באנר** — רק Clock + color + tooltip. |
| **סף Staleness (נעול)** | **15 דקות** = warning (צבע + tooltip). **24 שעות** = N/A (EOD / אין ציפייה לרענון אינטרדיי). |
| **שדות מהשירות** | `price_timestamp` (as_of), `fetched_at`, `is_stale`; ערך `staleness`: ok \| warning \| na. |

**מטרה סופית:** כל תצוגת מחיר/שער כוללת אינדיקציה ויזואלית אחידה (Clock + color + tooltip), בהתאם ל-SSOT. סגירה רק עם **Seal Message (SOP-013)**.

---

## 3. משימה מפורטת (צוות 30)

| מזהה | משימה | תוצר נדרש | מפרט עיקרי |
|------|--------|------------|-------------|
| **P3-012** | Clock-based Staleness UI | Clock + color + tooltip בכל מקום שמציגים מחיר/שער; **אין באנר** | MARKET_DATA_PIPE_SPEC §2.5; FOREX_MARKET_SPEC §2.5; TT2_MARKET_DATA_RESILIENCE (15m/24h) |

**התנהגות:**  
- `staleness === 'ok'` — שעון רגיל (או ללא הדגשה).  
- `staleness === 'warning'` — צבע אזהרה + tooltip (למשל "נתונים בני יותר מ-15 דקות").  
- `staleness === 'na'` — צבע מתאים + tooltip (למשל "נתוני סוף יום / EOD").

**סגירה:** רק עם **Seal Message (SOP-013)** — ראה TEAM_10_TO_ALL_TEAMS_GOVERNANCE_V2_102_DISCIPLINE_MANDATE.

---

## 4. תיעוד ומדריכים — חובה לקריאה

### 4.1 SSOT UI ו-Staleness

| מסמך | נתיב | תוכן עיקרי |
|------|------|-------------|
| **MARKET_DATA_PIPE_SPEC §2.5** | documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md | Data Freshness & UI — Clock, color, tooltip; **אין באנר**; שדות price_timestamp, fetched_at, is_stale |
| **FOREX_MARKET_SPEC §2.5** | documentation/01-ARCHITECTURE/FOREX_MARKET_SPEC.md | Staleness & UI — Clock + tooltip (אין באנר) |
| **TT2_MARKET_DATA_RESILIENCE** | documentation/01-ARCHITECTURE/LOGIC/TT2_MARKET_DATA_RESILIENCE.md | **Staleness thresholds:** 15m = warning, 24h = N/A |

### 4.2 הקשר תשתית (להבנה)

| מסמך | נתיב |
|------|------|
| **MARKET_DATA_COVERAGE_MATRIX** | documentation/01-ARCHITECTURE/MARKET_DATA_COVERAGE_MATRIX.md — Freshness UI לכל Domain |
| **TEAM_10_EXTERNAL_DATA_MASTER_PLAN** | _COMMUNICATION/team_10/TEAM_10_EXTERNAL_DATA_MASTER_PLAN.md |
| **TEAM_90_TO_TEAM_10_EXTERNAL_DATA_MAINTENANCE_LOCKED_UPDATE** | _COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_EXTERNAL_DATA_MAINTENANCE_LOCKED_UPDATE.md |

### 4.3 מנדט מפורט (M6)

| מסמך | נתיב |
|------|------|
| **TEAM_10_TO_TEAM_30_EXTERNAL_DATA_M6_MANDATE** | _COMMUNICATION/team_10/TEAM_10_TO_TEAM_30_EXTERNAL_DATA_M6_MANDATE.md |

---

## 5. סדר עבודה מומלץ

1. **קריאה** — MARKET_DATA_PIPE_SPEC §2.5, FOREX §2.5, TT2_MARKET_DATA_RESILIENCE (סף 15m/24h).  
2. **חוזה UI** — להגדיר (או לאשר עם Team 10) את השדות מהשירות: `staleness`, `price_timestamp`, `fetched_at`, `is_stale`.  
3. **מימוש** — קומפוננטה/פונקציה: Clock + color + tooltip; שילוב בכל תצוגת מחיר/שער.  
4. **אין באנר** — לוודא שאין שימוש בבאנר להתראת EOD/stale; רק Clock + tooltip.

---

**log_entry | TEAM_10 | TO_TEAM_30 | EXTERNAL_DATA_ACTIVATION | 2026-02-13**
