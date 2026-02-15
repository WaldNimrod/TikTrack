# Team 20 → Team 10: עדכון השלמה — Smart History Fill

**id:** `TEAM_20_TO_TEAM_10_SMART_HISTORY_FILL_UPDATE`  
**from:** Team 20 (Backend)  
**to:** Team 10 (The Gateway)  
**date:** 2026-01-31  
**מקור אמת (LOCKED):** TEAM_20_TO_ARCHITECT_SMART_HISTORY_FILL_SPEC.md

---

## 1. סיכום ביצוע

הושלם מימוש מלא של **Smart History Fill** לפי האפיון המאושר. המנגנון פועל ברמת מערכת (לא בקונקטורים) ומשרת את כל הספקים באופן אחיד.

---

## 2. מה בוצע (Team 20)

### 2.1 Smart History Engine

| רכיב | מיקום | תפקיד |
|------|--------|--------|
| `smart_history_engine.py` | `api/services/` | `compute_gaps`, `has_gaps`, `decide`, `BackfillDecision` |
| מינימום | 250 ימי מסחר | לכל טיקר |
| Gap Definition | חסר יום אחד בחלון 250 | = Gap |

### 2.2 API מעודכן

| פריט | ערך |
|------|------|
| **Path** | `POST /api/v1/tickers/{ticker_id}/history-backfill` |
| **Query** | `?mode=gap_fill` (ברירת מחדל) \| `?mode=force_reload` (Admin בלבד) |
| **תגובות** | 200 (completed/no_op), 403 (force_reload ללא Admin), 404, 409, 502 |

### 2.3 Provider Interface

- `get_ticker_history(symbol, trading_days, date_from?, date_to?)` — תמיכה בטווח תאריכים להשלמת פערים

### 2.4 Retry Policy

- ניסיון חוזר מיידי אחד כש־full fetch מחזיר מעט שורות
- Batch לילה (cron 21:00) — טיקרים עם פחות מ־250 שורות

### 2.5 קבצי Evidence

| מסמך | תיאור |
|------|--------|
| `_COMMUNICATION/team_20/TEAM_20_SMART_HISTORY_FILL_IMPLEMENTATION_COMPLETE.md` | דוח השלמה + קישורי קוד |

---

## 3. האפיון הסופי (Locked)

### 3.1 עקרונות

- **Gap-First:** קודם Gap Analysis → מילוי פערים בלבד
- **Full Reload:** מותר רק מעמוד ניהול טיקרים (Admin) עם אישור מפורש
- **מינימום 250** ימי מסחר לכל טיקר
- **Gap Definition:** חסר יום אחד בתוך חלון 250 → Gap
- **Retry Policy:** ניסיון חוזר מיידי אחד + Batch לילה
- **Provider Priority (History):** Yahoo → Alpha
- **API Design:** endpoint יחיד עם `mode=gap_fill|force_reload` (ברירת מחדל: `gap_fill`)

### 3.2 תלות ב־Team 30

- דיאלוג "הנתונים מלאים — לטעון מחדש?" כאשר התקבל `no_op`
- כפתור "טען מחדש (מחיקה)" — קריאה ל־`?mode=force_reload` — **רק** בעמוד ניהול טיקרים (Admin)
- מפורט בבקשת ביצוע: `TEAM_20_TO_TEAM_30_SMART_HISTORY_FILL_EXECUTION_REQUEST.md`

---

## 4. מסמכים רלוונטיים

| מסמך | נתיב |
|------|------|
| אפיון מאושר (LOCKED) | `_COMMUNICATION/90_Architects_comunication/TEAM_20_TO_ARCHITECT_SMART_HISTORY_FILL_SPEC.md` |
| דוח Evidence | `_COMMUNICATION/team_20/TEAM_20_SMART_HISTORY_FILL_IMPLEMENTATION_COMPLETE.md` |
| בקשת ביצוע Team 30 | `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_30_SMART_HISTORY_FILL_EXECUTION_REQUEST.md` |

---

**log_entry | TEAM_20 | TO_TEAM_10 | SMART_HISTORY_FILL_UPDATE | 2026-01-31**
