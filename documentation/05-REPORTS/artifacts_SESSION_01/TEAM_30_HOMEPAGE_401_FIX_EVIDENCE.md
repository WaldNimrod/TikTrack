# Team 30 → Team 10: Evidence - Home Page 401 API Fix

**מאת:** Team 30 (Frontend)  
**תאריך:** 2026-01-31  
**הקשר:** תיקון קריאות API מוגנות לאורחים בדף הבית (TEAM_50_HOMEPAGE_API_ANALYSIS_AND_FIX_REQUEST)

---

## 1. הבעיה שתוקנה

דף הבית (Type B - Shared) גרם ל-**10 SEVERE errors (401 Unauthorized)** לאורחים — קריאות ל-`trading_accounts`, `cash_flows`, `positions` ללא בדיקת authentication.

---

## 2. התיקון שיושם

### 2.1 Shared_Services.js — Guard מרכזי

**מיקום:** `ui/src/components/core/Shared_Services.js`

- נוספה פונקציה `_isProtectedEndpoint(endpoint)` — מזהה endpoints מוגנים.
- לפני כל `get()`, `post()`, `put()`, `delete()` — בדיקה: אם ה-endpoint מוגן ואין token, זריקת שגיאה (HTTP_401) **לפני** ביצוע ה-fetch.
- **תוצאה:** הקריאה לא מגיעה לשרת — אין 401 ב-Network, אין SEVERE ב-Console.

**Endpoints מוגנים:** `trading_accounts`, `cash_flows`, `positions`, `brokers_fees` (כולל subpaths).

### 2.2 DataStage.js — בדיקת אימות לכל הדפים

**מיקום:** `ui/src/components/core/stages/DataStage.js`

- בדיקת `isAuthenticated()` מתבצעת **לפני כל** טעינת data — לא רק בדפים עם `requiresAuth: true`.
- אם אין אימות — `skip` עם data ריקה, ללא קריאות API.

---

## 3. התנהגות לאחר התיקון

| תרחיש | לפני | אחרי |
|-------|------|------|
| אורח בדף הבית (/) | 10 SEVERE 401 | 0 SEVERE |
| אורח בדף trading_accounts | Redirect ל-login (authGuard) | ללא שינוי |
| משתמש מחובר | API calls תקינים | ללא שינוי |

---

## 4. קבצים שעודכנו

1. `ui/src/components/core/Shared_Services.js` — Guard ב-get/post/put/delete
2. `ui/src/components/core/stages/DataStage.js` — auth check לכל הדפים

---

## 5. אימות מומלץ

1. נקה localStorage
2. נווט ל-`http://localhost:8080/`
3. פתח DevTools → Console
4. וודא: **0 SEVERE** (מלבד 422 Register אם רלוונטי)

---

**Team 30 (Frontend)**  
**log_entry | HOMEPAGE_401_FIX | TEAM_30_EVIDENCE | 2026-01-31**
