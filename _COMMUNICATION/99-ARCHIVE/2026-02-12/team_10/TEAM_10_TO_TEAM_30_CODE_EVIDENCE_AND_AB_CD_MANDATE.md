# Team 10 → Team 30: Code Evidence (§4.5) + אימות A/B/C/D — מימוש מסודר

**מאת:** Team 10 (The Gateway)  
**אל:** Team 30 (Bridge / Containers / FE Logic)  
**תאריך:** 2026-01-30  
**מקור:** `TEAM_10_SIGNIFICANT_TASKS_BACKLOG.md` (S1, S2, S3, S6), `TEAM_10_VISUAL_GAPS_WORK_PLAN.md` §4.5, §4  
**מטרה:** מימוש מסודר ו/או וידוא סופי — כל פריט עם תוצר ברור.

---

## 1. Code Evidence (§4.5)

| # | קובץ | דרישה | תוצר נדרש |
|---|------|--------|------------|
| **S1** | `ui/src/router/AppRouter.jsx` | Home **לא** בתוך ProtectedRoute; redirect מעמודים auth-only מפנה ל־**Home** (לא ל־/login). | וידוא/תיקון: Route של `/` = `<HomePage />` ללא `<ProtectedRoute>`. |
| **S2** | `ui/src/cubes/identity/components/auth/ProtectedRoute.jsx` | אורח שנכנס לעמוד auth-only (Type C) → redirect ל־**/** (Home) — **לא** ל־/login. | וידוא/תיקון: `return <Navigate to="/" replace />` (לא to="/login"). |
| **S3** | `ui/src/components/HomePage.jsx` | **שני containers באותו עמוד:** Guest (אורח) + Logged-in (מחובר); אין עמודים נפרדים. | וידוא: רינדור מותנה לפי auth — `!isAuthenticated` → Guest container, `isAuthenticated` → Logged-in container. |

---

## 2. אימות מלא A/B/C/D (S6 — T30.6)

| דרישה | תוצר נדרש |
|--------|------------|
| **Redirect Type C → Home** | אורח שנכנס ל־/profile או ל־עמוד auth-only אחר מופנה ל־**/** (Home). |
| **Type B — שני containers** | Home מציג Guest Container לאורח ו־Logged-in Container למחובר; **אין Redirect** לאורח ב־Home. |
| **User Icon — success / warning** | אייקון משתמש ב־Header: מחובר = success, לא מחובר = warning; **אסור** צבע שחור (black). |

כל סטייה שתצא **בבדיקה ויזואלית** (שער ג' / Design Fidelity) — נחשבת פתוחה עד תיקון.

---

## 3. תוצר נדרש מצד Team 30

- **אפשרות א:** וידוא במשפט אחד לכל סעיף (S1, S2, S3, S6) — "מאומת" או "תוקן" + ציון קובץ/שורה אם רלוונטי.
- **אפשרות ב:** מסמך תשובה קצר (למשל `TEAM_30_TO_TEAM_10_CODE_EVIDENCE_AND_AB_CD_RESPONSE.md`) עם טבלה: סעיף | סטטוס | הערה.

---

## 4. הפניות

- **Backlog:** `TEAM_10_SIGNIFICANT_TASKS_BACKLOG.md`
- **תוכנית:** `TEAM_10_VISUAL_GAPS_WORK_PLAN.md` (§4, §4.5)
- **מטריצה:** `TEAM_10_ARCHITECT_IMPLEMENTATION_TASK_MATRIX.md` (T30.6)

---

**Team 10 (The Gateway)**
