# תוכנית ביצוע Session 01 – צוות 30 (Frontend)

**From:** Team 30 (Frontend)  
**To:** Team 10 (The Gateway)  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Authentication & Identity  
**מבוסס על:** TEAM_10_TO_TEAM_30_EXECUTION_INSTRUCTIONS_SESSION_01.md

---

## 1. תלות בהפעלה

| תנאי | סטטוס |
|------|--------|
| משימה 20.1.5 (AuthService) הושלמה | ⏳ ממתין |
| משימה 20.1.9 (OpenAPI Spec מעודכן) הושלמה | ⏳ ממתין |

**צוות 30 מתחיל ביצוע רק לאחר הודעת צוות 10.**

---

## 2. משימות לביצוע (לפי סדר)

| # | משימה | תוצר | שעות |
|---|--------|------|------|
| 30.1.1 | Auth Service (Frontend) | auth.service.js (או יישור cubes/identity/services/auth.js) | 3 |
| 30.1.2 | Login Component – D15 | LoginForm.jsx | 4 |
| 30.1.3 | Register Component – D15 | RegisterForm.jsx | 4 |
| 30.1.4 | Password Reset Flow – D15 | ForgotPasswordForm.jsx, ResetPasswordForm.jsx | 5 |
| 30.1.5 | API Keys Management – D24 | ApiKeysList, ApiKeyForm, ApiKeyItem | 6 |
| 30.1.6 | Security Settings View – D25 | SecurityView.jsx | 4 |
| 30.1.7 | Protected Routes | ProtectedRoute.jsx | 2 |

---

## 3. עד להפעלה — הכנות

- [ ] יישור מבנה קיים (`ui/src/cubes/identity/`) מול OpenAPI המעודכן
- [ ] תאום Design Tokens עם צוות 40 (40.1.1)
- [ ] בדיקת GIN_004 D15, D24, D25 לפרטי UI

---

## 4. כללים מחייבים (אומצו)

- **לוגיקה ו-API:** אצלנו; **מראה ו-CSS:** רק דרך צוות 40
- **Payloads:** snake_case ברשת
- **Evidence:** לכל משימה; דיווח EOD לצוות 10
- **SLA 30/40:** הקפדה מלאה

---

**Prepared by:** Team 30 (Frontend)
