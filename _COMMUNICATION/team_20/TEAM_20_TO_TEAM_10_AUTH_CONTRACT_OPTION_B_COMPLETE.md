# ✅ Team 20 → Team 10: חוזה Auth אחיד (Option B) — הושלם

**id:** `TEAM_20_AUTH_CONTRACT_OPTION_B_COMPLETE`  
**from:** Team 20 (Backend)  
**to:** Team 10 (The Gateway)  
**date:** 2026-02-10  
**status:** 🟢 **COMPLETE**  
**source:** `TEAM_10_TO_TEAM_20_AUTH_CONTRACT_AND_SSOT_MANDATE.md`, `SSOT_AUTH_UNIFIED_SHARED_SERVICES_OPTION_B.md`

---

## 📋 Executive Summary

**Team 20 מאשר השלמת מנדט חוזה Auth אחיד (Option B):**

✅ **חוזה Response אחיד** — login, register, refresh עם אותו מבנה (access_token, token_type, expires_at, user)  
✅ **RefreshResponse עודכן** — נוסף שדה `user` (כמו LoginResponse/RegisterResponse)  
✅ **OpenAPI/SSOT עודכן** — RefreshResponse ב‑OPENAPI_SPEC_V2.5.2.yaml

---

## 1. משימות שבוצעו

### 1.1 חוזה Response אחיד

**לפני:** RefreshResponse כלל רק `access_token`, `token_type`, `expires_at` (ללא `user`).

**אחרי:** RefreshResponse כולל `access_token`, `token_type`, `expires_at`, `user` — **אותו מבנה** כמו LoginResponse ו-RegisterResponse.

### 1.2 שינויים בקוד

**קובץ:** `api/schemas/identity.py`
- נוסף שדה `user: UserResponse` ל־RefreshResponse
- עודכן `model_rebuild()` ל־RefreshResponse

**קובץ:** `api/services/auth.py`
- `refresh_access_token()` יוצר `UserResponse.from_model(user)` ומוסיף ל־RefreshResponse

**קובץ:** `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml`
- RefreshResponse עודכן עם `user: $ref: '#/components/schemas/UserResponse'`

---

## 2. מבנה Response אחיד (Auth Endpoints)

| Endpoint | access_token | token_type | expires_at | user |
|----------|--------------|------------|------------|------|
| POST /auth/login | ✅ | ✅ | ✅ | ✅ |
| POST /auth/register | ✅ | ✅ | ✅ | ✅ |
| POST /auth/refresh | ✅ | ✅ | ✅ | ✅ |

---

## 3. Endpoints — סטטוס

| Endpoint | סטטוס |
|----------|--------|
| /auth/login | ✅ חוזה תקין |
| /auth/register | ✅ חוזה תקין |
| /auth/refresh | ✅ עודכן — כולל user |
| /users/me | ✅ מחזיר UserResponse (profile) |
| /users/profile | — אין endpoint נפרד; /users/me מכסה get + PUT /users/me מכסה update |

---

## 4. Acceptance Criteria

- [x] חוזה Response אחיד בכל auth endpoints (access_token, token_type, expires_at, user)
- [x] SSOT / OpenAPI מעודכן בהתאם

---

## 5. קבצים שנוגעו

- `api/schemas/identity.py` — RefreshResponse + user
- `api/services/auth.py` — refresh_access_token returns user
- `documentation/07-CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml` — RefreshResponse schema

---

## 6. תיאום עם Team 30

**Team 30** — אחרי השינוי, `/auth/refresh` מחזיר גם `user`.  
אם apiToReact ממיר ל־camelCase, השדות יהיו: `accessToken`, `tokenType`, `expiresAt`, `user`.  
**שימו לב:** שמירת token — גישה ל־`accessToken` (לאחר apiToReact), לא `access_token` — כפי שצוין ב‑SSOT כ‑root cause ל־"no token received".

---

**Team 20 (Backend)**  
**log_entry | AUTH_CONTRACT_OPTION_B | COMPLETE | GREEN | 2026-02-10**
