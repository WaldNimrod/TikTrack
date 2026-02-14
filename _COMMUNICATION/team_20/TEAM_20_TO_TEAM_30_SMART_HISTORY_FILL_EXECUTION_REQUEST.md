# Team 20 → Team 30: בקשת ביצוע — מימוש UI ל־Smart History Fill

**id:** `TEAM_20_TO_TEAM_30_SMART_HISTORY_FILL_EXECUTION_REQUEST`  
**from:** Team 20 (Backend)  
**to:** Team 30 (UI)  
**date:** 2026-01-31  
**מקור אמת:** TEAM_20_TO_ARCHITECT_SMART_HISTORY_FILL_SPEC.md (LOCKED)

---

## 1. הקשר

ה־API תומך כעת בשני מצבים:
- **`mode=gap_fill`** (ברירת מחדל) — השלמת פערים בלבד
- **`mode=force_reload`** — מחיקת כל הנתונים + טעינה מלאה (Admin בלבד)

נדרש עדכון ה־UI בעמוד **ניהול טיקרים → בקרת תקינות נתונים** כך שיתמוך בשני הזרימות לפי האפיון.

---

## 2. חוזה API (מעודכן)

### 2.1 קריאה — השלמת פערים (ברירת מחדל)

```
POST /api/v1/tickers/{ticker_id}/history-backfill
Authorization: Bearer <token>
Content-Type: application/json
Body: {}
```
או במפורש: `POST .../history-backfill?mode=gap_fill`

### 2.2 קריאה — טעינה מלאה מחדש (Admin בלבד)

```
POST /api/v1/tickers/{ticker_id}/history-backfill?mode=force_reload
Authorization: Bearer <admin_token>
Content-Type: application/json
Body: {}
```

### 2.3 תשובות API

| Status | status | משמעות |
|--------|--------|---------|
| 200 | `completed` | בוצע — שורות נוספו |
| 200 | `no_op` | הנתונים מלאים — לא בוצעה פעולה |
| 403 | — | `force_reload` ללא הרשאת Admin |
| 404 | — | טיקר לא נמצא |
| 409 | — | Backfill אחר רץ (Single-Flight) |
| 502 | — | שגיאת Provider |

---

## 3. דרישות מימוש מדויקות

### 3.1 כפתור "הפעל History Backfill" (קיים — ללא שינוי בקריאה)

**תנאי הצגה (כמו היום):**
- `indicators` ריק, או
- `history_250d.gap_status === "INSUFFICIENT"` / `"NO_DATA"`

**קריאה:**
```
POST /tickers/{tickerId}/history-backfill
```
ללא `mode` — ברירת מחדל `gap_fill`.

**לאחר תשובה:**
- `status: completed` → רענן תוצאות (doCheck)
- `status: no_op` → רענן תוצאות **ו־**הצג את בלוק 3.2 למטה (אם Admin)
- שגיאה → הצג הודעת שגיאה, החזר כפתור למצב רגיל

### 3.2 בלוק "הנתונים מלאים — לטעון מחדש?" (חדש)

**תנאי הצגה — כולם יחד:**
1. נתונים מלאים: `history_250d.row_count >= 250` ו־`history_250d.gap_status === "OK"` ו־יש `indicators` (או לפחות אינדיקטור אחד מחושב)
2. המשתמש הוא **Admin או SUPERADMIN** (בדיקה מול `user.role` / context)
3. העמוד הוא **ניהול טיקרים** (management/tickers)

**תוכן הבלוק:**
```
הנתונים מלאים (250 ימים). לטעון מחדש? (יכלול מחיקת כל הנתונים הקיימים)
[כפתור: טען מחדש (מחיקה)]
```

**לחיצה על "טען מחדש (מחיקה)":**
1. הצג דיאלוג אישור: `"הפעולה תמחק את כל נתוני ההיסטוריה ותטען מחדש. להמשיך?"`
2. אם המשתמש מאשר → קריאה: `POST /tickers/${tickerId}/history-backfill?mode=force_reload`
3. Loading: כפתור disabled, טקסט "טוען מחדש..."
4. הצלחה → רענן תוצאות
5. 403 → הודעה: "טעינה מלאה דורשת הרשאת Admin. נא להתחבר כמנהל."
6. שגיאה אחרת → הצג הודעת שגיאה

**מיקום:** בתוך אזור בקרת התקינות, מתחת לכרטיסי EOD/Intraday/History, ליד או מתחת לאינדיקטורים — **רק כאשר נתונים מלאים** (כפי שמפורט בתנאי הצגה).

### 3.3 בדיקת הרשאת Admin

יש להשתמש ב־`user.role` או ב־context קיים (למשל מ־`/users/me` או מ־token) כדי לבדוק:
```javascript
const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
```
אם אין גישה ל־role — ניתן להסתמך על תשובת 403: כאשר משתמש לא-Admin לוחץ "טען מחדש", הקריאה תכשל ב־403 והצג את ההודעה המתאימה.

### 3.4 עדכון קריאת Backfill הקיימת

**קובץ:** `ui/src/views/management/tickers/tickersDataIntegrityInit.js`

**שינוי נדרש:**
1. לאחר `doBackfill` שמחזיר 200 עם `status: no_op` — קרא ל־`doCheck()` **ו־**הצג את בלוק "הנתונים מלאים — לטעון מחדש?" (אם isAdmin)
2. הוספת פונקציה `doForceReload(tickerId)` שמבצעת:
   - דיאלוג אישור
   - `POST .../history-backfill?mode=force_reload`
   - טיפול ב־403, 409, 502
3. בניית ה־HTML של בלוק "הנתונים מלאים" עם כפתור שמפעיל `doForceReload`

---

## 4. מבנה תשובה — דוגמה

```json
{
  "ticker_id": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "symbol": "AAPL",
  "rows_inserted": 0,
  "status": "no_op",
  "message": "Ticker already has sufficient history"
}
```

כאשר `status === "no_op"` — מציגים את בלוק "הנתונים מלאים — לטעון מחדש?" (למשתמש Admin).

---

## 5. סיכום משימות ל־Team 30

| # | משימה | קובץ | הערות |
|---|--------|------|--------|
| 1 | טיפול ב־`no_op` — הצגת בלוק "הנתונים מלאים" | tickersDataIntegrityInit.js | רק ל־Admin |
| 2 | כפתור "טען מחדש (מחיקה)" + דיאלוג אישור | tickersDataIntegrityInit.js | |
| 3 | `doForceReload(tickerId)` — קריאה עם `?mode=force_reload` | tickersDataIntegrityInit.js | |
| 4 | טיפול ב־403 — הודעה "דורש הרשאת Admin" | tickersDataIntegrityInit.js | |
| 5 | בדיקת isAdmin (מ־user context / או דרך 403) | tickersDataIntegrityInit.js | |

---

## 6. קבצים רלוונטיים

| קובץ | שימוש |
|------|--------|
| `ui/src/views/management/tickers/tickersDataIntegrityInit.js` | קובץ עיקרי לעדכון |
| `ui/src/components/core/sharedServices.js` | `post()` — וודא תמיכה ב־query params |
| עיצוב | `D15_DASHBOARD_STYLES.css` או קובץ CSS רלוונטי — סגנון לבלוק "הנתונים מלאים" |

---

## 7. הערות

- הכפתור "הפעל History Backfill" הקיים **לא משתנה** — ממשיך לקרוא בלי `mode` (gap_fill).
- בלוק "הנתונים מלאים — לטעון מחדש?" מוצג **רק** כאשר הנתונים כבר מלאים ויש פעולת force_reload זמינה.
- `force_reload` זמין **רק** מעמוד ניהול טיקרים (Admin) — Backend דוחה 403 אם המשתמש אינו Admin.

---

**log_entry | TEAM_20 | TO_TEAM_30 | SMART_HISTORY_FILL_EXECUTION_REQUEST | 2026-01-31**
