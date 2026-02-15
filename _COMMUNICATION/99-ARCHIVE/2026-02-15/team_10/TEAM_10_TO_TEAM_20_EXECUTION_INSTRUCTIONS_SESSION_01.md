# הוראות ביצוע מפורטות – צוות 20 (Backend) | Session 01

**From:** Team 10 (The Gateway)  
**To:** Team 20 (Backend)  
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

2. **הצהרת מוכנות (READINESS_DECLARATION)**  
   שלחו בצ'אט בדיוק בפורמט הזה:

```text
From: Team 20
To: Team 10 (The Gateway)
Subject: READINESS_DECLARATION | Status: GREEN
Done: Study of Bible & Index. Deep scan of Squad context.
Context Check: [ציין מסמך – למשל PHASE_1_TASK_BREAKDOWN.md]
Next: I am ready for the first task.
log_entry | [Team 20] | READY | 001 | GREEN
```

3. **טריטוריה:** כתיבה **רק** בתוך `_COMMUNICATION/team_20/`.  
4. **Evidence:** כל תוצר/דוח Evidence ב-`documentation/08-REPORTS/artifacts_SESSION_01/` (או `documentation/05-REPORTS/artifacts_SESSION_01/`).

---

## 2. מקורות טכניים (LOD 400)

- **DB Schema:** `04-ENGINEERING_&_ARCHITECTURE/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql` — טבלאות: `user_data.users`, `user_data.password_reset_requests`, `user_data.user_api_keys`.
- **OpenAPI:** `05-DEVELOPMENT_&_CONTRACTS/OPENAPI_SPEC_V2_FINAL.yaml` — יישור endpoints ו-schemas לפי Task Breakdown.

---

## 3. משימות לביצוע (לפי סדר)

### שלב 1 – יכול להתחיל מיד

#### משימה 20.1.1: הקמת תשתית DB (4 שעות)
- [ ] וידוא טבלאות `users`, `password_reset_requests`, `user_api_keys` קיימות
- [ ] וידוא indexes: email, username, phone_number, reset_token
- [ ] בדיקת constraints (unique, check, foreign keys)
- [ ] הרצת migration אם נדרש
- **תוצר:** דוח Evidence (למשל `TEAM_20_TASK_20.1.1_EVIDENCE.md`) ב-artifacts_SESSION_01

#### משימה 20.1.4: מימוש Encryption Service (2 שעות)
- [ ] שימוש ב-`cryptography.fernet` (מומלץ)
- [ ] class `EncryptionService`: `encrypt_api_key`, `decrypt_api_key`
- [ ] env ל-encryption key; תיעוד key rotation
- **תוצר:** `services/encryption.py` + Evidence ב-artifacts_SESSION_01

### שלב 2 – לאחר clarification (שאלות 1–2)

#### משימה 20.1.2: SQLAlchemy Models (3 שעות)
- [ ] User, PasswordResetRequest, UserApiKey; relationships; enums; ULID אם נדרש
- **תוצר:** `models/identity.py` + Evidence

#### משימה 20.1.3: Pydantic Schemas (2 שעות)
- [ ] LoginRequest/Response, RegisterRequest/Response, PasswordReset*, UserResponse, UserApiKeyResponse/Create, JWTToken
- **תוצר:** `schemas/identity.py` + Evidence

#### משימה 20.1.5: Authentication Service (6 שעות)
- [ ] AuthService: register_user, login_user, verify_token, refresh_token, logout_user; JWT, bcrypt
- **תוצר:** `services/auth.py` + Evidence

#### משימה 20.1.6: Password Reset Service (4 שעות)
- [ ] request_reset (EMAIL/SMS), verify_reset; Mock ל-SMS/Email מותר
- **תוצר:** `services/password_reset.py` + Evidence

#### משימה 20.1.7: API Keys Service (4 שעות)
- [ ] create, list (masked), update, delete, verify_api_key; שימוש ב-EncryptionService
- **תוצר:** `services/api_keys.py` + Evidence

#### משימה 20.1.8: API Routes (5 שעות)
- [ ] routers: auth, users, api_keys; JWT middleware; error handlers
- **תוצר:** `routers/auth.py`, `routers/users.py`, `routers/api_keys.py` + Evidence

#### משימה 20.1.9: עדכון OpenAPI Spec (3 שעות)
- [ ] כל ה-endpoints והסכמות; security schemes (JWT Bearer)
- **תוצר:** OpenAPI מעודכן + Evidence

---

## 4. כללים מחייבים

- **אין המצאה:** שמות שדות ו-endpoints רק לפי DDL ו-OpenAPI; חסר – בקשו GIN.
- **כסף:** Decimal(20,8). **מזהים חיצוניים:** ULID בלבד ב-API.
- **תיעוד:** כל פונקציונליות חדשה – תיעוד/Evidence; דיווח EOD לצוות 10.

---

## 5. סיכום

| שלב | משימות | תלות |
|-----|--------|------|
| 1 | 20.1.1, 20.1.4 | אין – התחלה מיידית |
| 2 | 20.1.2–20.1.9 | לאחר clarification לשאלות 1–2 (Identity, JWT) |

**Prepared by:** Team 10 (The Gateway)
