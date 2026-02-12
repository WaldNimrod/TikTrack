# Team 10 → Team 50: בקשת בדיקה וולידציה — Central Status Function (Frontend)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 50 (QA & Fidelity)  
**תאריך:** 2026-02-12  
**הקשר:** TEAM_10_SYSTEM_STATUS_IMPLEMENTATION_MANDATE, TEAM_10_TO_TEAM_30_CENTRAL_STATUS_FUNCTION_REQUEST  
**מקור:** TT2_SYSTEM_STATUS_VALUES_SSOT  

---

## 1. רקע

Team 30 השלים יישום **Central Status Function** בצד הלקוח — כל שימוש בסטטוס עובר דרך `statusAdapter.js` (SSOT).  
נדרש **סבב בדיקות וולידציה** לוודא שהמימוש פועל כמצופה ב-UI ובזרימת הפילטרים.

**הערה:** Backend (API) אומת כבר בסבב קודם — TEAM_50_TO_TEAM_20_STATUS_STANDARD_QA_REPORT.

---

## 2. Scope — בדיקות נדרשות

### 2.1 Header Filter — אופציות סטטוס

| # | בדיקה | צפוי |
|---|-------|------|
| 1 | פילטר סטטוס מציג 5 אופציות | הכול \| ממתין \| פתוח \| סגור \| מבוטל |
| 2 | סדר הסטטוסים | ממתין → פתוח → סגור → מבוטל |
| 3 | בחירת אופציה מעדכנת תצוגה | הטקסט הנבחר מופיע ב־`#selectedStatus` |

### 2.2 סינון ושליחה ל-API

| # | בדיקה | צפוי |
|---|-------|------|
| 1 | בחירת "פתוח" → קריאת API | `GET /trading_accounts?status=active` |
| 2 | בחירת "סגור" → קריאת API | `GET /trading_accounts?status=inactive` |
| 3 | בחירת "ממתין" → קריאת API | `GET /trading_accounts?status=pending` |
| 4 | בחירת "מבוטל" → קריאת API | `GET /trading_accounts?status=cancelled` |
| 5 | בחירת "הכול" → קריאת API | ללא פרמטר status (או status לא נשלח) |

### 2.3 תצוגת Badges בטבלאות

| # | בדיקה | צפוי |
|---|-------|------|
| 1 | חשבונות מסחר — עמודת סטטוס | פעיל → "פתוח"; לא פעיל → "סגור" (תואם SSOT) |
| 2 | פוזיציות — עמודת סטטוס | OPEN → "פתוח"; CLOSED → "סגור" |

### 2.4 סנכרון URL

| # | בדיקה | צפוי |
|---|-------|------|
| 1 | בחירת סטטוס מעדכנת URL | `?status=active` (קנוני, לא עברית) |
| 2 | טעינת דף עם `?status=active` | פילטר מציג "פתוח" והנתונים מסוננים |

### 2.5 PhoenixFilterBridge / React Context

| # | בדיקה | צפוי |
|---|-------|------|
| 1 | איפוס פילטרים | "כל סטטוס" מוצג; פרמטר status נמחק מה-URL |
| 2 | מעבר בין עמודי Trading Accounts / Brokers Fees | פילטר סטטוס נשמר (sessionStorage) |

---

## 3. תוצרים מבוקשים

- **דוח בדיקות** — אילו בדיקות הורצו, תוצאה (PASS/FAIL).
- **אם FAIL** — דיווח ל-Team 10 (ולפי הצורך ל-Team 30) לצורך תיקון.

---

## 4. רפרנסים

| מסמך | נתיב |
|------|------|
| מנדט Team 10 | _COMMUNICATION/team_10/TEAM_10_SYSTEM_STATUS_IMPLEMENTATION_MANDATE.md |
| בקשה ל-Team 30 | _COMMUNICATION/team_10/TEAM_10_TO_TEAM_30_CENTRAL_STATUS_FUNCTION_REQUEST.md |
| SSOT סטטוסים | documentation/09-GOVERNANCE/TT2_SYSTEM_STATUS_VALUES_SSOT.md |
| מיפוי קוד | documentation/02-DEVELOPMENT/TT2_STATUS_VALUES_CODE_MAP.md |
| דוח Backend QA (קיים) | _COMMUNICATION/team_50/TEAM_50_TO_TEAM_20_STATUS_STANDARD_QA_REPORT.md |

---

## 5. הערות

- **D18 (ברוקרים ועמלות):** לא משתמש בסטטוס — אין שינויים נדרשים.
- **D21 (תזרימי מזומנים):** אין סטטוס — אין צורך בבדיקות סטטוס.
- **תנועות (VERIFIED/PENDING):** תחום נפרד — לא חלק מ-SSOT סטטוסים.

---

**Team 10 (The Gateway)**  
**log_entry | CENTRAL_STATUS_FUNCTION | QA_REQUEST | TO_TEAM_50 | 2026-02-12**
