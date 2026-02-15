# Team 10 → Team 50: בקשת QA — Smart History Fill (Backend + UI הושלמו)

**id:** `TEAM_10_TO_TEAM_50_SMART_HISTORY_FILL_QA_REQUEST`  
**from:** Team 10 (The Gateway)  
**to:** Team 50 (QA & Fidelity)  
**re:** TEAM_20_TO_TEAM_10_SMART_HISTORY_FILL_QA_REQUEST.md  
**date:** 2026-02-14  
**נושא:** בדיקות Smart History Fill — כפתור Backfill, דיאלוג "לטעון מחדש", force_reload (Admin/רגיל), טיפול בשגיאות

---

## 1. הקשר

**Smart History Fill** — Backend (Team 20) ו-UI (Team 30) הושלמו. נדרש **סבב QA** לפי הרשימה להלן.

**עמוד:** ניהול טיקרים (D22) → **בקרת תקינות נתונים** (widget data-integrity).

**API:** `POST /api/v1/tickers/{ticker_id}/history-backfill`  
- `?mode=gap_fill` — ברירת מחדל (מילוי פערים בלבד)  
- `?mode=force_reload` — טעינה מלאה (מחיקה + טעינה) — **Admin בלבד**

---

## 2. פריטים לבדיקה

| # | פריט | תוצאה מצופה |
|---|--------|--------------|
| 1 | **כפתור "הפעל History Backfill"** — טיקר עם נתונים חסרים | הכפתור מוצג; לחיצה → קריאה ב־gap_fill; תשובה 200 (completed או no_op) |
| 2 | **בלוק "הנתונים מלאים — לטען מחדש?"** — טיקר עם 250+ שורות, משתמש Admin | הבלוק + כפתור "טען מחדש (מחיקה)" מוצגים |
| 3 | **force_reload — Admin** | לחיצה על "טען מחדש" → דיאלוג אישור → קריאה ל־force_reload → 200 |
| 4 | **force_reload — משתמש רגיל** | 403 — הודעה מתאימה (דורש הרשאת Admin) |
| 5 | **טיפול בשגיאות** | 404, 409, 502 — הודעות מתאימות בממשק |

---

## 3. תוצרים מצופים

- דוח QA (PASS/FAIL לכל פריט) — בפורמט המקובל (TEAM_50_TO_TEAM_10_*).
- Evidence — טקסט או צילום מסך לפי הצורך.
- העברת הדוח ל-Team 10 לאישור / סגירה.

---

## 4. מסמכים רלוונטיים

| מסמך | נתיב |
|------|------|
| אפיון LOCKED | _COMMUNICATION/90_Architects_comunication/TEAM_20_TO_ARCHITECT_SMART_HISTORY_FILL_SPEC.md |
| בקשת Team 20 (מקור) | _COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_SMART_HISTORY_FILL_QA_REQUEST.md |
| Evidence Backend | _COMMUNICATION/team_20/TEAM_20_SMART_HISTORY_FILL_IMPLEMENTATION_COMPLETE.md |
| דוח השלמה UI | _COMMUNICATION/team_30/TEAM_30_TO_TEAM_20_SMART_HISTORY_FILL_UI_COMPLETE.md |

---

**log_entry | TEAM_10 | TO_TEAM_50 | SMART_HISTORY_FILL_QA_REQUEST | 2026-02-14**
