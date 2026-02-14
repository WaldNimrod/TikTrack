# Team 20 → צוות האדריכלות: אפיון — אחזור היסטוריה חכם (Smart History Fill)

**id:** `TEAM_20_TO_ARCHITECT_SMART_HISTORY_FILL_SPEC`  
**from:** Team 20 (Backend)  
**to:** צוות האדריכלות (Chief Architect / Team 90)  
**date:** 2026-01-31  
**last_updated:** 2026-02-13  
**status:** LOCKED — APPROVED  
**סוג:** אפיון מאושר — מנגנון ברמת מערכת

---

## 1. רקע

היסטוריית מחירי טיקר (250 ימי מסחר OHLCV) נדרשת ל־Indicators (ATR/MA/CCI) לפי MARKET_DATA_PIPE_SPEC §2.4 ו־MARKET_DATA_COVERAGE_MATRIX. המערכת מפעילה backfill דרך:
- **API:** `POST /api/v1/tickers/{ticker_id}/history-backfill`
- **Script:** `sync_ticker_prices_history_backfill.py`
- **Providers:** Yahoo Finance (Primary) → Alpha Vantage (Fallback)

---

## 2. המצב הקיים (Current State)

### 2.1 זרימת עבודה נוכחית

```
משתמש לוחץ "טען היסטוריה"
    ↓
API: בדיקה אם ticker קיים + יש < MIN_HISTORY_DAYS (250) רשומות
    ↓ (אם יש כבר 200+ → no_op)
קריאה ל־provider.get_ticker_history(symbol, 250)
    ↓
ספק מחזיר טווח מלא (ללא פרמטר תאריכים) — Yahoo: 1y/2y, Alpha: compact (~100 ימים)
    ↓
insert_history_rows — דילוג על תאריכים קיימים ב־INSERT (במסד)
```

### 2.2 מגבלות ספקים

| ספק | טווח בפועל | מגבלה |
|-----|-------------|--------|
| **Alpha Vantage** | ~50–100 ימי מסחר | `outputsize=compact` בלבד (חינמי) |
| **Yahoo Finance** | עד ~400 ימים | תלוי ב־period/start-end; לעיתים 401/429 |

### 2.3 מיקום הלוגיקה

- **בסקריפט / בקונקטור:** הלוגיקה של "מתי לטעון" ו־"מה לטעון" נמצאת ב־`sync_ticker_prices_history_backfill.py` וב־`fetch_history_for_ticker`.
- **בממשק ה־Provider:** `get_ticker_history(symbol, trading_days)` — ללא תמיכה ב־**טווח תאריכים** (start/end) להשלמת פערים.

---

## 3. בעיות שזוהו (Identified Problems)

### 3.1 הגבלת עומק

- מקבלים בפועל **~50–100 ימים** (Alpha) ולא 250 ימים נדרשים.
- אין מנגנון השלמה אוטומטי לאחר הרצה.

### 3.2 טעינה לא חכמה

- **תמיד** שולחים בקשה ל־250 ימים מלאים, גם כשיש כבר 200 רשומות במסד.
- אין **גילוי פערים** (gap analysis) לפני הקריאה לספק.
- משאבים מבוזבזים: קריאות API כפולות על נתונים שכבר קיימים.

### 3.3 חוויית משתמש חסרה

- אין הבחנה בין:
  - **השלמה** — "יש פערים, נשלים רק את החסר"
  - **טעינה מלאה מחדש** — "הכל קיים, האם לבצע בכל זאת?"
- משתמש לא מקבל אישור מפורש לפני טעינה מלאה כאשר הנתונים כבר קיימים.

### 3.4 אימות לאחר הרצה

- אין בדיקה בסיום הרצה: "האם התקבלו 250 ימים?"
- אין **טעינה חוזרת חכמה** אם הנתונים לא מלאים (למשל: נסיון מחדש עם ספק אחר או טווח חלקי).

### 3.5 מיקום ברמת קונקטור

- הלוגיקה מפוזרת בין סקריפט וקונקטורים.
- אין שכבה אחידה שמשרתת את **כל הספקים** — כל ספק יכול לנהוג אחרת.

---

## 4. מטרת המהלך (Goal)

בניית **מנגנון אחזור היסטוריה חכם ברמת מערכת** — לא ברמת קונקטור — כך שישמש את כל הספקים באופן אוטומטי ואחיד.

### 4.1 עקרונות

1. **גשר־ראשון (Gap-First):** תמיד קודם בודקים פערים, ומבקשים מהספק **רק תאריכים חסרים**.
2. **טעינה מלאה — רק Admin:** טעינה מלאה (מחיקה + Reload) מנוהלת **אך ורק** מעמוד ניהול טיקרים (Admin), עם אישור מפורש.
3. **אימות לאחר הרצה:** בסיום — בדיקה שהתקבלו מספיק נתונים; אם לא — הפעלת טעינה חוזרת חכמה.
4. **ברמת מערכת:** המנגנון יהיה ב־Service/Engine ולא בתוך קוד הספקים — כך שהשימוש יהיה אחיד לכל ספק.

---

## 5. הצעת ארכיטקטורה (Proposed Architecture)

### 5.1 שכבה חדשה: Smart History Engine

```
┌─────────────────────────────────────────────────────────────────┐
│                    Smart History Engine (System)                 │
│  - Gap analysis (פערים)                                         │
│  - Decision: GAP_FILL | FULL_RELOAD | NO_OP                     │
│  - Post-run verification + smart retry                          │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│              Provider Interface (extended)                       │
│  get_ticker_history(symbol, trading_days, date_from?, date_to?) │
└─────────────────────────────────────────────────────────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              ▼                     ▼                     ▼
        YahooProvider         AlphaProvider         (Future Provider)
```

### 5.2 זרימת עבודה מוצעת

| שלב | פעולה |
|-----|-------|
| 1 | **Gap Analysis:** קבלת רשימת תאריכים קיימים מ־DB; חישוב `missing_dates` (עד 250 ימי מסחר אחורה). |
| 2 | **Decision:** אם אין פערים — `NO_OP`. אם יש פערים — `GAP_FILL`. |
| 3 | **Gap Fill:** אם יש פערים — קריאה לספק רק עבור `missing_dates` (או טווח מינימלי המכסה אותם). |
| 4 | **Full Reload (Admin בלבד):** רק מתוך עמוד ניהול טיקרים (Admin) עם אישור מפורש → ניקוי נתונים קיימים לטיקר → טעינה מלאה. |
| 5 | **Post-run Verification:** בדיקה: `COUNT(rows) >= MIN_HISTORY_DAYS`? אם לא — **Retry חכם**. |

### 5.3 הרחבת Provider Interface

- הוספת פרמטרים אופציונליים: `date_from`, `date_to` ל־`get_ticker_history`.
- ספקים שתומכים — ישתמשו בטווח; שלא תומכים — יחזירו טווח מלא (fallback).

### 5.4 API

- **אופציה א:** אותו endpoint + query: `?mode=gap_fill|force_reload` (ברירת מחדל: `gap_fill`).
- **אופציה ב:** שני endpoints: `history-backfill` (גשר) ו־`history-reload` (טעינה מלאה — דורש אישור UI).

---

## 6. השפעה על צוותים

| צוות | השפעה |
|------|-------|
| **Team 20** | יישום Smart History Engine, הרחבת provider interface, לוגיקת gap analysis ו־post-run verification |
| **Team 30** | הוספת דיאלוג "הנתונים מלאים — לטעון מחדש?"; הצגת סטטוס השלמה/טעינה חוזרת |
| **Team 60** | ללא שינוי צפוי (schema קיים) |

---

## 7. מסמכים רלוונטיים

| מסמך | תיאור |
|------|--------|
| MARKET_DATA_PIPE_SPEC | documentation/01-ARCHITECTURE/MARKET_DATA_PIPE_SPEC.md — 250d, Cache-First |
| MARKET_DATA_COVERAGE_MATRIX | 250d ל־Indicators |
| sync_ticker_prices_history_backfill.py | scripts/ — זרימה נוכחית |
| provider_interface.py | api/integrations/market_data/ — get_ticker_history |
| Alpha / Yahoo specs | EXTERNAL_PROVIDER_*.md |

---

## 8. החלטות מאושרות (Locked)

1. **Owner לטעינה מלאה:** טעינה מלאה מנוהלת אך ורק מעמוד ניהול טיקרים (Admin).
2. **סף מינימום:** 250 ימי מסחר לכל טיקר.
3. **Gap Definition:** חסר יום אחד בתוך חלון 250 ימים → Gap.
4. **Retry Policy:** ניסיון חוזר מיידי אחד + Batch לילה.
5. **Priority (History):** Yahoo → Alpha.

## 9. החלטות נוספות שננעלו

1. **הרחבת Interface:** מאושר להוסיף `date_from`/`date_to` אופציונליים ל־`get_ticker_history`.
2. **API Design:** מאושר **Option A** — endpoint יחיד עם `mode=gap_fill|force_reload` (ברירת מחדל: `gap_fill`).

## 10. סטטוס

אין שאלות פתוחות. המסמך ננעל ומוכן להפצה לצוותים לצורך מימוש.

1. **אישור כיוון:** האם המנגנון ברמת מערכת (לא קונקטור) תואם את האדריכלות?
2. **הרחבת Interface:** אישור להוספת `date_from`/`date_to` אופציונליים ל־`get_ticker_history`.
3. **API Design:** העדפה בין אופציה א (query param) לאופציה ב (שני endpoints).

---

**log_entry | TEAM_20 | TO_ARCHITECT | SMART_HISTORY_FILL_SPEC_LOCKED | 2026-02-14**
