# הוראות ביצוע מפורטות – צוות 30 (Frontend) | Session 01

**From:** Team 10 (The Gateway)  
**To:** Team 30 (Frontend)  
**Date:** 2026-01-30  
**Session:** SESSION_01 - Authentication & Identity  
**Subject:** EXECUTION_INSTRUCTIONS | Status: MANDATORY

> **⚠️ היסטורי.** Session 01 הושלם. משימות נוכחיות: `TEAM_10_MASTER_TASK_LIST.md`

---

## 1. חובות לפני התחלה

1. **קריאת מסמכי חובה**
   - `documentation/09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md` (או `06-GOVERNANCE_&_COMPLIANCE/standards/`)
   - `documentation/09-GOVERNANCE/standards/CURSOR_INTERNAL_PLAYBOOK.md`
   - `documentation/08-REPORTS/artifacts_SESSION_01/PHASE_1_TASK_BREAKDOWN.md` (או `documentation/05-REPORTS/artifacts_SESSION_01/`)
   - SLA 30/40: `documentation/05-PROCEDURES/TT2_SLA_TEAMS_30_40.md` (הפרדה Presentational / Container)

2. **הצהרת מוכנות (READINESS_DECLARATION)**  
   שלחו בצ'אט בדיוק בפורמט הזה:

```text
From: Team 30
To: Team 10 (The Gateway)
Subject: READINESS_DECLARATION | Status: GREEN
Done: Study of Bible & Index. Deep scan of Squad context.
Context Check: [ציין מסמך – למשל PHASE_1_TASK_BREAKDOWN.md]
Next: I am ready for the first task.
log_entry | [Team 30] | READY | 001 | GREEN
```

3. **טריטוריה:** כתיבה **רק** בתוך `_COMMUNICATION/team_30/`.  
4. **Evidence:** ב-`documentation/08-REPORTS/artifacts_SESSION_01/` (או `documentation/05-REPORTS/artifacts_SESSION_01/`).

---

## 2. תלות בהפעלה

- **צוות 30 מתחיל רק לאחר:**  
  השלמת משימות 20.1.5 (AuthService) ו-20.1.9 (OpenAPI Spec מעודכן).  
- עד אז: קריאת מפרטים, הכנת מבנה תיקיות, והכנת Design Tokens עם צוות 40 אם רלוונטי.

---

## 3. מקורות טכניים

- **OpenAPI (מעודכן):** `05-DEVELOPMENT_&_CONTRACTS/OPENAPI_SPEC_V2_FINAL.yaml` — אחרי עדכון צוות 20.
- **UI:** `03-DESIGN_UX_UI/GIN_004_UI_ALIGNMENT_SPEC.md` — D15 (Login/Register), D24 (API Keys), D25 (Security).
- **Transformation Layer:** כל ה-payloads ב-Network ב-`snake_case`; Frontend ב-`camelCase` — המרה בשכבת שירות.

---

## 4. משימות לביצוע (לפי סדר)

#### משימה 30.1.1: Auth Service (Frontend) (3 שעות)
- [ ] `services/auth.service.js`: login, register, logout, refreshToken, getCurrentUser, isAuthenticated
- [ ] token storage; axios interceptor להזרקת JWT
- **תוצר:** `src/services/auth.service.js` + Evidence

#### משימה 30.1.2: Login Component – D15 (4 שעות)
- [ ] LoginForm: username/email, password; validation; auth.service; redirect; link ל-forgot password
- **תוצר:** `src/components/auth/LoginForm.jsx` + Evidence

#### משימה 30.1.3: Register Component – D15 (4 שעות)
- [ ] RegisterForm: username, email, password, confirm_password, phone?; validation; auth.service
- **תוצר:** `src/components/auth/RegisterForm.jsx` + Evidence

#### משימה 30.1.4: Password Reset Flow – D15 (5 שעות)
- [ ] ForgotPasswordForm (method EMAIL/SMS, input email/phone); ResetPasswordForm (token/code, new password); integration עם API
- **תוצר:** `ForgotPasswordForm.jsx`, `ResetPasswordForm.jsx` + Evidence

#### משימה 30.1.5: API Keys Management – D24 (6 שעות)
- [ ] ApiKeysList, ApiKeyForm, ApiKeyItem; רשימה, הוספה, עריכה, מחיקה, verify; masking
- **תוצר:** `src/components/api-keys/*.jsx` + Evidence

#### משימה 30.1.6: Security Settings View – D25 (4 שעות)
- [ ] SecurityView: אימות טלפון, איפוס סיסמה, קישור ל-API Keys; פרופיל משתמש
- **תוצר:** `src/views/SecurityView.jsx` + Evidence

#### משימה 30.1.7: Protected Routes (2 שעות)
- [ ] ProtectedRoute: בדיקת auth, redirect ל-login; integration עם router
- **תוצר:** `src/components/auth/ProtectedRoute.jsx` + Evidence

---

## 5. כללים מחייבים

- **לוגיקה ו-API:** אצלכם; **מראה ו-CSS:** רק דרך צוות 40 (Design Tokens, סגנונות). לא לשנות CSS/מראה של רכיבים.
- **שמות:** plural בלבד (users, transactions). **Payloads:** snake_case ברשת.
- **תיעוד:** Evidence לכל משימה; דיווח EOD לצוות 10.

---

## 6. סיכום

| משימה | תוצר עיקרי |
|--------|-------------|
| 30.1.1 | auth.service.js |
| 30.1.2–30.1.4 | Auth components (Login, Register, Password Reset) |
| 30.1.5–30.1.6 | API Keys + Security View |
| 30.1.7 | ProtectedRoute |

**מועד התחלה:** לאחר הודעת צוות 10 ש-20.1.5 ו-20.1.9 הושלמו.

**Prepared by:** Team 10 (The Gateway)
