# 🚀 הודעת הפעלה סופית: צוות 20 (Backend) | Session 01

**From:** Team 10 (The Gateway)  
**To:** Team 20 (Backend)  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Phase 1.1  
**Status:** ✅ **FULLY ACTIVATED - ALL CLARIFICATIONS RESOLVED**

---

## ✅ אישור תשובה אדריכלית

קיבלנו תשובה אדריכלית מפורטת שמכסה את כל השאלות הפתוחות.  
**סטטוס:** ✅ **ALL BLOCKERS RESOLVED**  
**מקור:** תשובה אדריכלית רשמית + GIN_2026_008 (מעודכן)

---

## 🎯 הוראות הפעלה סופיות

**צוות 20 מופעל רשמית עם כל ההבהרות הטכניות.**

### משימות מיידיות (Phase 1.1):

#### משימה 20.1.5: Authentication Service - ✅ **מוכן להתחיל**

**עדיפות:** P0 (Critical Path)  
**זמן משוער:** 6-8 שעות  
**מקור:** תשובה אדריכלית + GIN_2026_008 + נספח א'

**תת-משימות:**

1. **DB Schema Implementation:**
   - [ ] הוספת טבלת `user_refresh_tokens` לפי נספח א'
   - [ ] הוספת טבלת `revoked_tokens` לפי נספח א'
   - [ ] יצירת indexes ו-constraints
   - [ ] שמירת SQL ב-`_COMMUNICATION/team_20/` (טיוטה)
   - [ ] העברת DDL סופי ל-`documentation/04-ENGINEERING_&_ARCHITECTURE/`

2. **JWT Token Creation:**
   - [ ] Algorithm: HS256
   - [ ] Secret: `JWT_SECRET_KEY` environment variable (64+ chars)
   - [ ] Claims: `sub` (ULID), `email`, `role`, `iat`, `jti`, `exp` (24h)
   - [ ] יצירת access token
   - [ ] יצירת refresh token (7 days)

3. **Refresh Token Rotation Logic:**
   - [ ] Validation: בדיקת חתימה, jti לא ב-revoked_tokens, לא פג תוקף
   - [ ] Rotation: Access Token חדש (24h) + Refresh Token חדש (7 days)
   - [ ] Revocation: סימון Refresh Token ישן כ-revoked_at = NOW
   - [ ] Breach Detection: ביטול כל Refresh Tokens אם נעשה שימוש ב-Revoked token

4. **Authentication Service Methods:**
   - [ ] `login(username_or_email, password) -> LoginResponse`
   - [ ] `register(user_data) -> RegisterResponse`
   - [ ] `refresh_token(refresh_token_cookie) -> RefreshResponse`
   - [ ] `logout(access_token_jti) -> None`
   - [ ] `validate_token(token) -> TokenPayload`

**תוצר:** `services/auth_service.py` + DB migrations  
**Evidence:** שמור ב-`documentation/05-REPORTS/artifacts_SESSION_01/`

---

#### משימה 20.1.8: Routes - עדכון OpenAPI Spec ✅ **מוכן להתחיל**

**עדיפות:** P0  
**זמן משוער:** 3-4 שעות  
**מקור:** תשובה אדריכלית + נספח א'

**תת-משימות:**

1. **OpenAPI Spec Update (v2.5.2):**
   - [ ] הוספת `POST /api/v1/auth/refresh` endpoint
     - Input: httpOnly Cookie (refresh_token)
     - Output: 200 OK עם Access Token חדש ב-Body + Refresh Token חדש ב-Cookie
   - [ ] הוספת `POST /api/v1/auth/logout` endpoint
     - Action: הוספת jti ל-revoked_tokens + ביטול Refresh Token ב-DB
   - [ ] עדכון `POST /api/v1/auth/login` (אם נדרש)
   - [ ] עדכון `POST /api/v1/auth/register` (אם נדרש)

2. **Routes Implementation:**
   - [ ] `POST /auth/login` - מחזיר LoginResponse
   - [ ] `POST /auth/register` - מחזיר RegisterResponse
   - [ ] `POST /auth/refresh` - Rotation logic
   - [ ] `POST /auth/logout` - Blacklist logic
   - [ ] `GET /users/me` - Protected route

**תוצר:** `api/routes/auth.py` + `OPENAPI_SPEC_V2.5.2.yaml`  
**Evidence:** שמור ב-`documentation/05-REPORTS/artifacts_SESSION_01/`

---

## 📋 פרטים טכניים מפורטים (נספח א')

### א. מבנה טבלאות (Schema Definitions)

#### טבלת `user_refresh_tokens`:

```sql
CREATE TABLE user_data.user_refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    jti VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    
    CONSTRAINT refresh_token_not_expired CHECK (expires_at > created_at)
);

CREATE INDEX idx_refresh_tokens_user_id ON user_data.user_refresh_tokens(user_id, expires_at DESC) WHERE revoked_at IS NULL;
CREATE INDEX idx_refresh_tokens_jti ON user_data.user_refresh_tokens(jti);
CREATE INDEX idx_refresh_tokens_expires ON user_data.user_refresh_tokens(expires_at) WHERE revoked_at IS NULL;
```

#### טבלת `revoked_tokens` (Blacklist):

```sql
CREATE TABLE user_data.revoked_tokens (
    jti VARCHAR(255) PRIMARY KEY,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_revoked_tokens_expires ON user_data.revoked_tokens(expires_at);
```

**הערה:** שמור SQL טיוטה ב-`_COMMUNICATION/team_20/` והעבר DDL סופי ל-`documentation/04-ENGINEERING_&_ARCHITECTURE/`.

---

### ב. לוגיקת Refresh Token Rotation

**Flow:**

1. **Request:** הלקוח שולח בקשה ל-`POST /auth/refresh` עם ה-Cookie המאובטח (`refresh_token`)

2. **Validation:**
   - ✅ מוודא חתימת ה-Token (HS256)
   - ✅ בודק שה-`jti` לא מופיע ב-`revoked_tokens`
   - ✅ בודק שטרם פג תוקפו (`expires_at > NOW()`)
   - ✅ בודק שה-Refresh Token לא מסומן כ-revoked (`revoked_at IS NULL`)

3. **Rotation:**
   - ✅ השרת מנפק Access Token חדש (24h) עם `jti` חדש
   - ✅ השרת מנפק Refresh Token חדש לגמרי (7 days) עם `jti` חדש
   - ✅ ה-Refresh Token הישן ב-DB מסומן כ-`revoked_at = NOW()`
   - ✅ ה-Refresh Token החדש נרשם ב-DB ונשלח ב-Cookie מעודכן ללקוח (`Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Strict`)

4. **Breach Detection:**
   - ⚠️ אם נעשה שימוש ב-Refresh Token שכבר סומן כ-Revoked (`revoked_at IS NOT NULL`)
   - 🔴 המערכת תבטל מיידית את כל ה-Refresh Tokens הפעילים של אותו משתמש (`UPDATE user_refresh_tokens SET revoked_at = NOW() WHERE user_id = ? AND revoked_at IS NULL`)
   - 🔴 יש לשלוח התראה/לוג על Security Breach

---

### ג. הגדרת Endpoints ב-OpenAPI

**נדרש להוסיף:**

#### `POST /api/v1/auth/refresh`:

```yaml
/auth/refresh:
  post:
    summary: "Refresh access token"
    description: "Rotates refresh token and issues new access token"
    security:
      - CookieAuth: []
    responses:
      '200':
        description: "Success"
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/RefreshResponse'
        headers:
          Set-Cookie:
            schema:
              type: string
              example: "refresh_token=...; HttpOnly; Secure; SameSite=Strict; Max-Age=604800"
      '401':
        description: "Invalid or expired refresh token"
```

#### `POST /api/v1/auth/logout`:

```yaml
/auth/logout:
  post:
    summary: "Logout user"
    description: "Revokes access token and refresh token"
    security:
      - BearerAuth: []
    responses:
      '200':
        description: "Successfully logged out"
      '401':
        description: "Unauthorized"
```

---

## 📡 דיווח נדרש

### דיווח EOD (End of Day):
כל יום בסיום העבודה, שלחו לצוות 10:
- מה הושלם היום
- מה מתוכנן למחר
- חסמים או שאלות
- **SQL טיוטה** (אם יש) - שמור ב-`_COMMUNICATION/team_20/`

### דיווח סיום משימה:
לאחר השלמת כל משימה, שלחו:
```text
From: Team 20
To: Team 10 (The Gateway)
Subject: Task Completion | WP-20.1.5
Status: COMPLETED
Evidence: documentation/05-REPORTS/artifacts_SESSION_01/TEAM_20_TASK_20.1.5_EVIDENCE.md
DDL Location: documentation/04-ENGINEERING_&_ARCHITECTURE/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql
log_entry | [Team 20] | TASK_COMPLETE | 20.1.5 | GREEN
```

---

## 🎯 צעדים הבאים

1. **עכשיו:** התחילו עם Task 20.1.5 (AuthService) + Task 20.1.8 (Routes)
2. **SQL טיוטה:** שמור ב-`_COMMUNICATION/team_20/` עד לאישור
3. **DDL סופי:** העבר ל-`documentation/04-ENGINEERING_&_ARCHITECTURE/` לאחר אישור
4. **OpenAPI:** עדכן ל-v2.5.2 עם כל ה-endpoints החדשים

---

## 📚 קבצים רלוונטיים

**חובה לקרוא:**
- `documentation/06-GOVERNANCE_&_COMPLIANCE/gins/GIN_2026_008_TECHNICAL_CLARIFICATIONS.md`
- `documentation/04-ENGINEERING_&_ARCHITECTURE/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`
- `documentation/05-DEVELOPMENT_&_CONTRACTS/OPENAPI_SPEC_V2_FINAL.yaml`

**לעדכן:**
- `documentation/05-DEVELOPMENT_&_CONTRACTS/OPENAPI_SPEC_V2.5.2.yaml` (חדש)
- `documentation/04-ENGINEERING_&_ARCHITECTURE/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` (עדכון)

---

**Prepared by:** Team 10 (The Gateway)  
**Status:** ✅ **FULLY ACTIVATED - ALL CLARIFICATIONS RESOLVED**  
**Next:** Awaiting task completion reports + SQL draft for review
