# Team 10 → Team 30: תיקון מסמך הסגירה Nav/Auth — נדרש לפני אישור

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Frontend Execution)  
**תאריך:** 2026-02-12  
**נושא:** ⚠️ חוסר התאמה במסמך הסגירה — נדרש תיקון לפני סגירה

**מסמך:** `_COMMUNICATION/team_30/TEAM_30_TO_TEAM_10_NAV_AUTH_CLOSURE_DOC.md`

---

## 1. רקע

בבדיקה מול **SSOT + קוד** נמצאו **שתי אי־התאמות מהותיות** במסמך הסגירה. **אין לאשר סגירת Nav/Auth** לפני תיקון המסמך ואישור מחדש.

---

## 2. אי־התאמה א' — Redirect לאורח בעמודי HTML

**במסמך נטען (§1.4):**  
"עבור עמודי HTML — מפנה ל־`/login` אם אין אימות"

**בקוד + SSOT:**  
- **Redirect** הוא ל־**`/` (Home)** — לא ל־`/login`.
- **מקורות:**  
  - `ui/src/components/core/authGuard.js` — Type C/D: `redirectTo: '/'`  
  - **SSOT:** `documentation/01-ARCHITECTURE/TT2_AUTH_GUARDS_AND_ROUTE_SSOT.md` — Type C: "אורח **מופנה ל-Home** (לא ל-/login)".

**תיקון נדרש:** לעדכן במסמך שההפניה היא ל־**`/` (Home)** — לא ל־`/login`.

---

## 3. אי־התאמה ב' — שם מפתח Token

**במסמך נטען (§1.4):**  
"בודק `localStorage` / `sessionStorage` עבור `access_token` / `auth_token`"

**בקוד:**  
- השמות בשימוש הם **`access_token`** ו־**`authToken`** — **לא** `auth_token`.
- **מקור:** `ui/src/components/core/authGuard.js` (למשל שורות 77–91, 108, 193–196).

**תיקון נדרש:** לעדכן במסמך ל־**`access_token`** ו־**`authToken`** (ולא `auth_token`).

---

## 4. הנחיה

1. **לתקן** את מסמך הסגירה (`TEAM_30_TO_TEAM_10_NAV_AUTH_CLOSURE_DOC.md`) בשתי הנקודות לעיל.
2. **להגיש** גרסה מעודכנת (או לעדכן את הקובץ הקיים ולהודיע ל-Team 10).
3. **אין אישור סגירה** לפני תיקון + אישור מחדש מצד Team 10.
4. **אחרי תיקון ואישור** — Team 10 תאשר סגירת Nav/Auth באינדקס, והמשך **QA Auth Guard** (Team 50) יתבצע לפי הדרישה הקיימת.

---

## 5. מקורות לבדיקה

| נושא | קובץ |
|------|------|
| Auth Guard (קוד) | `ui/src/components/core/authGuard.js` |
| SSOT Auth/Redirect | `documentation/01-ARCHITECTURE/TT2_AUTH_GUARDS_AND_ROUTE_SSOT.md` |
| רישום הממצא (פנימי) | `_COMMUNICATION/team_10/TEAM_10_NAV_AUTH_CLOSURE_DOC_MISMATCH_FINDING.md` |

---

**Team 10 (The Gateway)**  
**log_entry | TEAM_10 | NAV_AUTH_CLOSURE_CORRECTION_REQUIRED | TO_TEAM_30 | 2026-02-12**
