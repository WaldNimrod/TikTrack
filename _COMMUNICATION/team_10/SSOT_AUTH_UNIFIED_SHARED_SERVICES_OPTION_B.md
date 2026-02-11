# 🔒 SSOT — איחוד Auth תחת Shared_Services (Option B)

**מאת:** Team 10 (The Gateway) — לפי החלטה מאושרת Team 90 (G‑Lead)  
**תאריך:** 2026-02-10  
**סטטוס:** ✅ **DECISION APPROVED — Option B (No Exceptions)**  
**מקור:** דו"ח החלטה מאושרת — Team 90 (The Spy).

---

## 1. סיכום הבעיה (Root Cause)

ב־QA התגלו כשלים חוזרים ב־Auth (לרבות "no token received").  
הבדיקה הראתה ש־**auth flow לא עובר דרך Shared_Services**, אלא באמצעות **axios ישיר (authService)**.

**כשל טכני נוסף בשכבת refresh:**
```javascript
const { access_token } = apiToReact(refreshResponse.data);
localStorage.setItem('access_token', access_token);
```
אחרי `apiToReact`, השדה הוא **accessToken** (camelCase), ולכן ה־token **לא נשמר בפועל**.

---

## 2. ממצאי סריקה (Evidence)

| קובץ | ממצא |
|------|--------|
| **auth.js** | auth flows דרך axios, לא Shared_Services |
| **Shared_Services.js** | שינויי allowlist לא משפיעים על auth בפועל |
| **תוצאה** | התיקון שבוצע ב־Shared_Services הוא hardening בלבד, לא תיקון עומק |

---

## 3. החלטה נעולה (Approved)

**Option B = איחוד מלא של כל auth endpoints דרך Shared_Services.**

- **אין חריגים.**  
- **אין path מקביל.**  
- **כל תהליכי auth חייבים לעבור דרך Shared_Services ו־UAI policy.**

---

## 4. פירוט שינויים נדרשים (Task Breakdown)

### Team 30 (Frontend Integration)
- להחליף את axios‑based authService כך ש־**כל קריאה עוברת דרך Shared_Services**.
- לעדכן endpoints: `/auth/login`, `/auth/register`, `/auth/refresh`, `/users/me`, `/users/profile`.
- לעדכן response handling: שימוש ב־**apiToReact בלבד**; גישה ל־**accessToken** (ולא `access_token`) אחרי טרנספורם.

### Team 20 (Backend / Schema)
- לוודא **חוזה Response אחיד** בכל auth endpoints: `access_token` בשדה snake_case (API).
- ללא שינוי שדות בין login/refresh.
- לוודא שכל response כולל: `token_type`, `expires_at`, `user`.
- לעדכן SSOT / OpenAPI בהתאם.

### Team 50 (QA)
- לעדכן Gate A QA tests: שכל auth endpoints עוברים דרך Shared_Services (no axios direct).
- Response כולל `access_token`.
- E2E ללא "no token received".
- להוסיף בדיקה שמוודאת ש־**token נשמר אחרי refresh**.

---

## 5. Acceptance Criteria (חובה)

- [ ] **אין שימוש ב־axios ישיר** עבור auth.
- [ ] **כל auth endpoints** עוברים דרך Shared_Services.
- [ ] **token נשמר ב־localStorage** לאחר login + refresh.
- [ ] **קונטרקט response אחיד** ומאומת ב־QA.
- [ ] **Gate A חוזר PASS** ללא failures.

---

## 6. מסמכי משימות לצוותים

| צוות | מסמך |
|------|--------|
| 30 | `TEAM_10_TO_TEAM_30_AUTH_UNIFIED_SHARED_SERVICES_MANDATE.md` |
| 20 | `TEAM_10_TO_TEAM_20_AUTH_CONTRACT_AND_SSOT_MANDATE.md` |
| 50 | `TEAM_10_TO_TEAM_50_GATE_A_AUTH_QA_UPDATE_MANDATE.md` |
| כולם | `TEAM_10_TO_ALL_TEAMS_AUTH_UNIFIED_OPTION_B_KICKOFF.md` |

---

**Team 10 (The Gateway)**  
**log_entry | SSOT_AUTH_UNIFIED_OPTION_B | LOCKED | 2026-02-10**
