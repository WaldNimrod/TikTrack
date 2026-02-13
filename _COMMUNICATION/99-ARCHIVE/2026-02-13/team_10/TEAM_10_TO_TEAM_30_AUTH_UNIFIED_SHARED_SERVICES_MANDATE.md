# 🔴 Team 10 → Team 30: איחוד Auth תחת Shared_Services — מנדט ביצוע (BLOCKING)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend Integration)  
**תאריך:** 2026-02-10  
**סטטוס:** 🚫 **חוסם — ביצוע מידי לפני אישור השער באופן סופי**  
**SSOT:** `_COMMUNICATION/team_10/SSOT_AUTH_UNIFIED_SHARED_SERVICES_OPTION_B.md`

---

## 1. מטרה

**Option B (נעול):** איחוד מלא של **כל** auth endpoints דרך **Shared_Services**. אין חריגים; אין path מקביל (axios ישיר).

---

## 2. משימות מחייבות

### 2.1 החלפת authService

- **להחליף** את axios‑based authService כך ש־**כל קריאה עוברת דרך Shared_Services**.
- **לא** להשאיר קריאות auth ישירות ל־axios.

### 2.2 Endpoints לעדכן (דרך Shared_Services)

| Endpoint | שימוש |
|----------|--------|
| `/auth/login` | התחברות |
| `/auth/register` | הרשמה |
| `/auth/refresh` | רענון token |
| `/users/me` | משתמש נוכחי |
| `/users/profile` | פרופיל |

### 2.3 Response handling (חובה)

- שימוש ב־**apiToReact בלבד** על תגובת ה־API.
- **גישה ל־accessToken** (camelCase) **לא** ל־`access_token` אחרי הטרנספורם — כי `apiToReact` ממיר ל־camelCase.
- **שמירת token:** `localStorage.setItem('access_token', response.accessToken)` (או מקור מה־object אחרי apiToReact) — לוודא שהמפתח ב־localStorage תואם למה שהמערכת קוראת (למשל `access_token`).
- **תיקון באג refresh:** אחרי `apiToReact(refreshResponse.data)` השדה הוא `accessToken` — יש לשמור ערכו ל־localStorage בהתאם.

---

## 3. Acceptance (מהמנדט)

- [ ] אין שימוש ב־axios ישיר עבור auth.
- [ ] כל auth endpoints עוברים דרך Shared_Services.
- [ ] token נשמר ב־localStorage לאחר login **ו־** לאחר refresh.

---

## 4. דיווח השלמה

דיווח ל־Team 10 ב־`_COMMUNICATION/team_30/` — רשימת משימות שבוצעו, קבצים ששונו, ואימות token אחרי login + refresh.

---

**Team 10 (The Gateway)**  
**log_entry | AUTH_UNIFIED_SHARED_SERVICES | TO_TEAM_30 | BLOCKING | 2026-02-10**
