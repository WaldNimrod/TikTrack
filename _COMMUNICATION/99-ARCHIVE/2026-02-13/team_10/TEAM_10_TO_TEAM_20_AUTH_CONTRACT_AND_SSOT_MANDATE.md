# 🔴 Team 10 → Team 20: חוזה Auth אחיד + עדכון SSOT/OpenAPI — מנדט (BLOCKING)

**מאת:** Team 10 (The Gateway)  
**אל:** Team 20 (Backend / Schema)  
**תאריך:** 2026-02-10  
**סטטוס:** 🚫 **חוסם — ביצוע מידי לפני אישור השער באופן סופי**  
**SSOT:** `_COMMUNICATION/team_10/SSOT_AUTH_UNIFIED_SHARED_SERVICES_OPTION_B.md`

---

## 1. מטרה

לוודא **חוזה Response אחיד** בכל auth endpoints, ועדכון SSOT/OpenAPI — כתנאי לאיחוד Auth תחת Shared_Services (Option B).

---

## 2. משימות מחייבות

### 2.1 חוזה Response אחיד

- **שדה token ב־API:** `access_token` ב־**snake_case** (API contract).
- **ללא שינוי שדות** בין login ל־refresh — אותו מבנה תגובה.
- **כל response** של auth endpoints חייב לכלול:
  - `access_token`
  - `token_type`
  - `expires_at`
  - `user` (או כפי שמוגדר בחוזה)

### 2.2 Endpoints scope

- `/auth/login`
- `/auth/register`
- `/auth/refresh`
- `/users/me`
- `/users/profile`

### 2.3 עדכון SSOT / OpenAPI

- לעדכן את מפרט OpenAPI (או מסמך החוזה הרלוונטי) כך שישקף את המבנה האחיד.
- לוודא שאין סטיות בין הקוד למפרט.

---

## 3. Acceptance (מהמנדט)

- [ ] חוזה Response אחיד בכל auth endpoints (access_token, token_type, expires_at, user).
- [ ] SSOT / OpenAPI מעודכן בהתאם.

---

## 4. דיווח השלמה

דיווח ל־Team 10 ב־`_COMMUNICATION/team_20/` — אימות חוזה, קבצים/מפרט שעודכנו.

---

**Team 10 (The Gateway)**  
**log_entry | AUTH_CONTRACT_SSOT | TO_TEAM_20 | BLOCKING | 2026-02-10**
