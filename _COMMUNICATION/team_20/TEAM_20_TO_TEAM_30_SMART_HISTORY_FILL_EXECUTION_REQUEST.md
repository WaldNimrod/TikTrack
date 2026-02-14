# Team 20 → Team 30: בקשת ביצוע — Smart History Fill (UI)

**id:** `TEAM_20_TO_TEAM_30_SMART_HISTORY_FILL_EXECUTION_REQUEST`  
**from:** Team 20 (Backend)  
**to:** Team 30 (Frontend)  
**date:** 2026-01-31  
**מקור:** TEAM_20_TO_TEAM_10_SMART_HISTORY_FILL_UPDATE, TEAM_20_TO_ARCHITECT_SMART_HISTORY_FILL_SPEC

---

## 1. חוזה API

| Query Param | ערך | הרשאה |
|-------------|-----|-------|
| `mode=gap_fill` | ברירת מחדל | כל משתמש |
| `mode=force_reload` | מחיקה + טעינה מלאה | **Admin בלבד** |

**Endpoint:** `POST /api/v1/tickers/{ticker_id}/history-backfill`  
**תגובות:** 200 (completed/no_op), 403 (force_reload ללא Admin), 404, 409, 502

---

## 2. דרישות מימוש

### 2.1 כפתור "הפעל History Backfill" (קיים)

- **בלי שינוי** — ממשיך לקרוא עם ברירת מחדל `mode=gap_fill` (או בלי query)
- מוצג כאשר יש פערים / נתונים חסרים

### 2.2 בלוק חדש: "הנתונים מלאים — לטען מחדש?"

| פריט | תיאור |
|------|--------|
| **תנאי הצגה** | נתונים מלאים: `hist.row_count >= 250` **ו**־`hist.gap_status === "OK"` **ו**־משתמש Admin |
| **תוכן** | הודעה + כפתור "טען מחדש (מחיקה)" |
| **פעולה** | דיאלוג אישור → קריאה ל־`?mode=force_reload` |

### 2.3 כפתור "טען מחדש (מחיקה)"

- דיאלוג אישור לפני ביצוע (למשל: "פעולה זו מוחקת את הנתונים הקיימים וטוענת מחדש. להמשיך?")
- קריאה: `POST /tickers/{ticker_id}/history-backfill?mode=force_reload`

### 2.4 טיפול ב־403

- כש־API מחזיר 403: הצג הודעה **"דורש הרשאת Admin"**

---

## 3. סיכום משימות (טבלה)

| # | משימה | קובץ | סטטוס |
|---|-------|------|--------|
| 1 | הכפתור הקיים — וידוא שימוש ב־gap_fill (ברירת מחדל) | tickersDataIntegrityInit.js | — |
| 2 | קבלת סטטוס Admin (auth / users/me / role) | sharedServices.js או auth | — |
| 3 | תנאי הצגה: hist.row_count >= 250, gap_status === "OK", isAdmin | tickersDataIntegrityInit.js | — |
| 4 | בלוק UI: "הנתונים מלאים — לטען מחדש?" + כפתור | tickersDataIntegrityInit.js | — |
| 5 | דיאלוג אישור לפני force_reload | tickersDataIntegrityInit.js | — |
| 6 | קריאה ל־history-backfill?mode=force_reload | tickersDataIntegrityInit.js | — |
| 7 | טיפול ב־403 → "דורש הרשאת Admin" | tickersDataIntegrityInit.js | — |

---

## 4. קבצים לעדכון

| קובץ | שינויים |
|------|---------|
| `ui/src/views/management/tickers/tickersDataIntegrityInit.js` | בלוק force_reload, דיאלוג, טיפול 403, תנאי הצגה |
| `ui/src/components/core/sharedServices.js` | אם נדרש — תמיכה ב־query params ל־post |

---

## 5. הפניות

- **אפיון LOCKED:** `_COMMUNICATION/90_Architects_comunication/TEAM_20_TO_ARCHITECT_SMART_HISTORY_FILL_SPEC.md`
- **דוח השלמה Team 20:** `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_SMART_HISTORY_FILL_UPDATE.md`
- **Auth / Role:** `ui/src/cubes/identity/services/auth.js` — `getUserRole()` / `isAdmin()` (ADMIN | SUPERADMIN)
