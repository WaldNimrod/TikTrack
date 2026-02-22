# SSOT Auth Contract — חוזה Auth אחיד
**project_domain:** TIKTRACK

**מקור:** Team 90 — PDSC Boundary + Auth Contract שלד מחייב  
**תאריך:** 2026-02-12  
**סטטוס:** 🔒 **SSOT - MANDATORY**

---

## 1. Auth Response (SSOT)

כל תגובה מ-Auth endpoints חייבת לכלול:

```json
{
  "access_token": "jwt",
  "token_type": "bearer",
  "expires_at": "2026-02-12T12:34:56Z",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "ADMIN|USER",
    "user_tier": "FREE|PRO|Bronze|Silver|Gold|Platinum"
  }
}
```

---

## 2. שדות חובה

| שדה | סוג | תיאור |
|-----|-----|-------|
| `access_token` | string | JWT access token |
| `token_type` | string | תמיד `"bearer"` |
| `expires_at` | string (ISO 8601) | מועד תפוגת הטוקן |
| `user` | object | אובייקט משתמש |
| `user.id` | string | מזהה משתמש (ULID או UUID) |
| `user.email` | string | כתובת אימייל |
| `user.role` | string | `ADMIN` \| `USER` \| `SUPERADMIN` |
| `user.user_tier` | string | `FREE` \| `PRO` \| `Bronze` \| `Silver` \| `Gold` \| `Platinum` |

---

## 3. Endpoints לתיעוד

| Endpoint | Method | מחזיר Auth Response |
|----------|--------|----------------------|
| `POST /api/v1/auth/login` | POST | ✅ access_token, token_type, expires_at, user |
| `POST /api/v1/auth/register` | POST | ✅ access_token, token_type, expires_at, user |
| `POST /api/v1/auth/refresh` | POST | ✅ access_token, token_type, expires_at, user |
| `GET /api/v1/users/me` | GET | user (אין token — משתמש מאומת) |
| `PUT /api/v1/users/me` | PUT | user (עדכון פרופיל) |

**הערה:** `GET /users/me` ו-`PUT /users/me` מחזירים אובייקט `user` בלבד (ללא token — המשתמש כבר מאומת).

---

## 4. מיפוי שדות TT2 (קוד נוכחי)

| SSOT | TT2 Field | הערה |
|------|-----------|------|
| `user.id` | `user.external_ulids` | ULID (26 chars) |
| `user.user_tier` | `user.user_tier_levels` | Bronze, Silver, Gold, Platinum |
| `GET /users/profile` | `GET /users/me` | TT2 משתמש ב-`/users/me` |

---

## 5. דוגמאות

### Login Response
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_at": "2026-02-12T14:34:56Z",
  "user": {
    "external_ulids": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
    "email": "user@example.com",
    "role": "USER",
    "user_tier_levels": "Bronze"
  }
}
```

### GET /users/me Response
```json
{
  "external_ulids": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
  "email": "user@example.com",
  "phone_numbers": "+12025551234",
  "user_tier_levels": "Bronze",
  "username": "johndoe",
  "display_name": "John Doe",
  "role": "USER",
  "is_email_verified": true,
  "phone_verified": false,
  "created_at": "2026-01-31T12:00:00Z"
}
```

---

## 6. Acceptance Criteria

- [ ] Error Schema אחיד בכל endpoint
- [ ] Success Contract אחיד בכל endpoint
- [ ] Auth responses זהים בכל זרימה (login, register, refresh)
- [ ] OpenAPI/SSOT מעודכן לפי השלד

---

**Team 20 (Backend)**  
**log_entry | SSOT_AUTH_CONTRACT | Team 90 skeleton | 2026-02-12**
