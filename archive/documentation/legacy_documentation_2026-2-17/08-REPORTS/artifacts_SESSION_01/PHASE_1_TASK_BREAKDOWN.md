# 📋 פייז 1: תוכנית עבודה מפורטת - מודול משתמשים ואוטנטיקציה

**From:** Team 10 (The Gateway)  
**To:** Team 00 (Lead Architect) & Gemini Bridge (Control Bridge)  
**Subject:** PHASE_1_TASK_BREAKDOWN | Status: 500% VERIFIED  
**Date:** 2026-01-30  
**Session:** SESSION_01 - Authentication & Identity

---

## 🔍 1. הצהרת הבנה (500% Understanding Declaration)

✅ **ביצענו הצלבה של ה-DDL מול ה-OpenAPI ומול ה-UI Blueprints.**

✅ **זיהינו את כל הקשרים ההיררכיים הנדרשים למודול האוטנטיקציה.**

✅ **אנחנו מאשרים שהמפרט ברור לנו ב-500%.**

---

## 📊 2. ניתוח הצלבה (Cross-Reference Analysis)

### 2.1 שכבת נתונים (SQL Master Schema)

**מקור:** `/04-ENGINEERING_&_ARCHITECTURE/PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`

**טבלאות רלוונטיות:**
1. **`user_data.users`** (Table 37)
   - `id` (UUID PK)
   - `username` (VARCHAR(50), UNIQUE)
   - `email` (VARCHAR(255), UNIQUE)
   - `password_hash` (VARCHAR(255))
   - `phone_number` (VARCHAR(20), UNIQUE, nullable) ⭐ V2.5
   - `phone_verified` (BOOLEAN) ⭐ V2.5
   - `phone_verified_at` (TIMESTAMPTZ) ⭐ V2.5
   - `role` (ENUM: USER, ADMIN, SUPERADMIN)
   - `is_active` (BOOLEAN)
   - `is_email_verified` (BOOLEAN)
   - `last_login_at` (TIMESTAMPTZ)
   - `failed_login_attempts` (INTEGER)
   - `locked_until` (TIMESTAMPTZ)

2. **`user_data.password_reset_requests`** (Table 48) ⭐ NEW V2.5
   - `id` (UUID PK)
   - `user_id` (UUID FK → users)
   - `method` (ENUM: EMAIL, SMS)
   - `sent_to` (VARCHAR(255))
   - `reset_token` (VARCHAR(64), UNIQUE)
   - `token_expires_at` (TIMESTAMPTZ)
   - `verification_code` (VARCHAR(6)) - for SMS
   - `code_expires_at` (TIMESTAMPTZ)
   - `attempts_count` (INTEGER)
   - `status` (VARCHAR: PENDING, USED, EXPIRED, REVOKED)

3. **`user_data.user_api_keys`** (Table 47) ⭐ NEW V2.5
   - `id` (UUID PK)
   - `user_id` (UUID FK → users)
   - `provider` (ENUM: IBKR, POLYGON, YAHOO_FINANCE, etc.)
   - `provider_label` (VARCHAR(100))
   - `api_key_encrypted` (TEXT) - **ENCRYPTED**
   - `api_secret_encrypted` (TEXT) - **ENCRYPTED**
   - `is_active` (BOOLEAN)
   - `is_verified` (BOOLEAN)
   - `last_verified_at` (TIMESTAMPTZ)

### 2.2 שכבת חוזה (API Contract)

**מקור:** `/05-DEVELOPMENT_&_CONTRACTS/OPENAPI_SPEC_V2_FINAL.yaml`

**Endpoints קיימים (מינימליים):**
- `POST /api/v1/auth/login` - קיים אך לא מפורט
- `GET /api/v1/users/me` - מוגדר חלקית
- `GET /api/v1/user-api-keys` - מוגדר חלקית

**Endpoints חסרים (נדרשים לפייז 1):**
- `POST /api/v1/auth/register` - ⚠️ חסר
- `POST /api/v1/auth/logout` - ⚠️ חסר
- `POST /api/v1/auth/refresh` - ⚠️ חסר
- `POST /api/v1/auth/reset-password` - ⚠️ חסר
- `POST /api/v1/auth/verify-phone` - ⚠️ חסר
- `POST /api/v1/user/api-keys` - ⚠️ חסר (CREATE)
- `PUT /api/v1/user/api-keys/{id}` - ⚠️ חסר (UPDATE)
- `DELETE /api/v1/user/api-keys/{id}` - ⚠️ חסר
- `POST /api/v1/user/api-keys/{id}/verify` - ⚠️ חסר

**Schemas קיימים:**
- `UserResponse` - קיים אך לא מלא
- `UserApiKeyResponse` - קיים אך לא מלא

**Schemas חסרים:**
- `LoginRequest` - ⚠️ חסר
- `LoginResponse` - ⚠️ חסר
- `RegisterRequest` - ⚠️ חסר
- `RegisterResponse` - ⚠️ חסר
- `PasswordResetRequest` - ⚠️ חסר
- `PasswordResetResponse` - ⚠️ חסר
- `JWTToken` - ⚠️ חסר

### 2.3 שכבת ממשק (UI Blueprints)

**מקור:** `/03-DESIGN_UX_UI/GIN_004_UI_ALIGNMENT_SPEC.md`

**רכיבים רלוונטיים:**
- **D24 (API View):** ניהול מפתחות API
  - רשימת מפתחות (GET /user-api-keys)
  - הוספת מפתח (POST /user/api-keys)
  - עדכון מפתח (PUT /user/api-keys/{id})
  - מחיקת מפתח (DELETE /user/api-keys/{id})
  - אימות מפתח (POST /user/api-keys/{id}/verify)
  - **Masking Policy:** מפתחות מוחזרים כממוסכים (`********************`)

- **D25 (Security View):** הגדרות אבטחה
  - פרופיל משתמש (GET /users/me)
  - עדכון טלפון (PUT /user/profile)
  - אימות טלפון (POST /auth/verify-phone)
  - איפוס סיסמה (POST /auth/reset-password)
  - בחירת שיטת איפוס (EMAIL/SMS)

- **D15 (Login/Register):** זרימת אוטנטיקציה
  - התחברות (POST /auth/login)
  - הרשמה (POST /auth/register)
  - שכחת סיסמה (POST /auth/reset-password)

### 2.4 זיהוי סתירות ופערים (Conflicts & Gaps)

#### ⚠️ סתירה 1: אסטרטגיית מזהים (Identity Strategy)
- **PHX_DB_SCHEMA:** משתמש ב-UUID כ-Primary Key
- **WP_20_11_DDL:** משתמש ב-BIGINT internal_ids + ULID external_ulids
- **OpenAPI:** מציין ULID כ-external_ulids
- **החלטה נדרשת:** האם UUID ב-DB צריך להיות מומר ל-ULID ב-API, או שיש שדה נפרד `external_ulid`?

#### ⚠️ סתירה 2: שמות שדות (Field Naming)
- **SQL:** `phone_number` (singular)
- **OpenAPI:** `phone_numbers` (plural)
- **החלטה נדרשת:** יישור לשם אחד (מומלץ: plural לפי התקן)

#### ⚠️ פער 1: OpenAPI Spec לא מפורט
- רוב ה-endpoints חסרים או לא מפורטים
- חסרים request/response schemas
- חסר מבנה JWT payload

#### ⚠️ פער 2: JWT Structure לא מוגדר
- לא מוגדר מבנה ה-token
- לא מוגדרים claims
- לא מוגדר refresh token mechanism

#### ⚠️ פער 3: Encryption Strategy לא מפורט
- לא מוגדר איזה encryption library להשתמש
- לא מוגדר key management
- לא מוגדר key rotation

---

## 🎯 3. פירוק משימות לפי צוותים (Task Breakdown)

### 3.1 צוות 20 (Backend) - המשימות העיקריות

#### משימה 20.1.1: הקמת תשתית DB
**עדיפות:** P0 (Critical Path)  
**זמן משוער:** 4 שעות

**תת-משימות:**
- [ ] וידוא שהטבלאות `users`, `password_reset_requests`, `user_api_keys` קיימות ב-DB
- [ ] הרצת migration scripts אם נדרש (מ-GIN_004)
- [ ] וידוא indexes קיימים (email, username, phone_number, reset_token)
- [ ] בדיקת constraints (unique, check, foreign keys)

**תוצר:** DB Schema מוכן ומוכשר

---

#### משימה 20.1.2: הגדרת SQLAlchemy Models
**עדיפות:** P0  
**זמן משוער:** 3 שעות

**תת-משימות:**
- [ ] יצירת `User` model (user_data.users)
- [ ] יצירת `PasswordResetRequest` model
- [ ] יצירת `UserApiKey` model
- [ ] הגדרת relationships (User → PasswordResetRequests, User → ApiKeys)
- [ ] הגדרת enums (user_role, reset_method, api_provider)
- [ ] וידוא ULID generation (אם נדרש)

**תוצר:** `models/identity.py` עם כל ה-models

---

#### משימה 20.1.3: הגדרת Pydantic Schemas
**עדיפות:** P0  
**זמן משוער:** 2 שעות

**תת-משימות:**
- [ ] `LoginRequest` (username/email, password)
- [ ] `LoginResponse` (token, user, expires_at)
- [ ] `RegisterRequest` (username, email, password, phone_number?)
- [ ] `RegisterResponse` (user, token)
- [ ] `PasswordResetRequest` (method, email/phone)
- [ ] `PasswordResetVerify` (token, code?, new_password)
- [ ] `UserResponse` (external_ulid, email, phone, tier)
- [ ] `UserApiKeyResponse` (external_ulid, provider, masked_key, is_active)
- [ ] `UserApiKeyCreate` (provider, api_key, api_secret, label)
- [ ] `JWTToken` (access_token, refresh_token?, token_type)

**תוצר:** `schemas/identity.py` עם כל ה-schemas

---

#### משימה 20.1.4: מימוש Encryption Service
**עדיפות:** P0  
**זמן משוער:** 2 שעות

**תת-משימות:**
- [ ] בחירת library (cryptography.fernet מומלץ)
- [ ] יצירת `EncryptionService` class
- [ ] `encrypt_api_key(plain_key: str) -> str`
- [ ] `decrypt_api_key(encrypted_key: str) -> str`
- [ ] הגדרת environment variable ל-encryption key
- [ ] תיעוד key rotation strategy

**תוצר:** `services/encryption.py`

---

#### משימה 20.1.5: מימוש Authentication Service
**עדיפות:** P0  
**זמן משוער:** 6 שעות

**תת-משימות:**
- [ ] יצירת `AuthService` class
- [ ] `register_user(data: RegisterRequest) -> User`
  - בדיקת unique (email, username, phone)
  - hashing password (bcrypt)
  - יצירת user record
  - יצירת JWT token
- [ ] `login_user(credentials: LoginRequest) -> LoginResponse`
  - איתור user (email/username)
  - בדיקת password
  - עדכון last_login_at
  - יצירת JWT token
- [ ] `verify_token(token: str) -> User`
  - decode JWT
  - בדיקת expiration
  - איתור user
- [ ] `refresh_token(refresh_token: str) -> JWTToken`
- [ ] `logout_user(token: str) -> None` (optional: token blacklist)

**תוצר:** `services/auth.py`

---

#### משימה 20.1.6: מימוש Password Reset Service
**עדיפות:** P1  
**זמן משוער:** 4 שעות

**תת-משימות:**
- [ ] יצירת `PasswordResetService` class
- [ ] `request_reset(method: str, identifier: str) -> None`
  - איתור user (email/phone)
  - יצירת reset request record
  - יצירת token (email) או code (SMS)
  - שליחת email/SMS
- [ ] `verify_reset(token: str, code: str?, new_password: str) -> None`
  - איתור reset request
  - בדיקת expiration
  - בדיקת code (אם SMS)
  - עדכון password
  - סימון request כ-USED
- [ ] אינטגרציה עם email service (SMTP/SendGrid)
- [ ] אינטגרציה עם SMS service (Twilio/AWS SNS)

**תוצר:** `services/password_reset.py`

---

#### משימה 20.1.7: מימוש API Keys Service
**עדיפות:** P1  
**זמן משוער:** 4 שעות

**תת-משימות:**
- [ ] יצירת `ApiKeyService` class
- [ ] `create_api_key(user_id: UUID, data: UserApiKeyCreate) -> UserApiKey`
  - הצפנת api_key ו-api_secret
  - יצירת record
  - החזרת masked response
- [ ] `list_api_keys(user_id: UUID) -> List[UserApiKeyResponse]`
  - שליפת keys של user
  - masking של encrypted fields
- [ ] `update_api_key(key_id: UUID, data: dict) -> UserApiKey`
  - עדכון label/status
  - הצפנה מחדש אם key השתנה
- [ ] `delete_api_key(key_id: UUID) -> None`
  - soft delete (deleted_at)
- [ ] `verify_api_key(key_id: UUID) -> bool`
  - decrypt key
  - בדיקה מול provider API
  - עדכון verification status

**תוצר:** `services/api_keys.py`

---

#### משימה 20.1.8: מימוש API Routes
**עדיפות:** P0  
**זמן משוער:** 5 שעות

**תת-משימות:**
- [ ] יצירת `routers/auth.py`
  - `POST /auth/register`
  - `POST /auth/login`
  - `POST /auth/logout`
  - `POST /auth/refresh`
  - `POST /auth/reset-password`
  - `POST /auth/verify-phone`
- [ ] יצירת `routers/users.py`
  - `GET /users/me`
  - `PUT /users/me` (profile update)
- [ ] יצירת `routers/api_keys.py`
  - `GET /user/api-keys`
  - `POST /user/api-keys`
  - `PUT /user/api-keys/{id}`
  - `DELETE /user/api-keys/{id}`
  - `POST /user/api-keys/{id}/verify`
- [ ] הגדרת JWT middleware
- [ ] הגדרת error handlers

**תוצר:** `routers/auth.py`, `routers/users.py`, `routers/api_keys.py`

---

#### משימה 20.1.9: עדכון OpenAPI Spec
**עדיפות:** P0  
**זמן משוער:** 3 שעות

**תת-משימות:**
- [ ] הוספת כל ה-endpoints החסרים
- [ ] הגדרת request/response schemas
- [ ] הגדרת security schemes (JWT Bearer)
- [ ] הוספת examples
- [ ] וידוא התאמה ל-DDL ול-UI blueprints

**תוצר:** `OPENAPI_SPEC_V2_FINAL.yaml` מעודכן

---

### 3.2 צוות 30 (Frontend) - המשימות העיקריות

#### משימה 30.1.1: יצירת Auth Service (Frontend)
**עדיפות:** P0  
**זמן משוער:** 3 שעות

**תת-משימות:**
- [ ] יצירת `services/auth.service.js`
- [ ] `login(credentials) -> {token, user}`
- [ ] `register(data) -> {token, user}`
- [ ] `logout() -> void`
- [ ] `refreshToken() -> {token}`
- [ ] `getCurrentUser() -> User`
- [ ] `isAuthenticated() -> boolean`
- [ ] token storage (localStorage/sessionStorage)
- [ ] axios interceptor ל-JWT injection

**תוצר:** `src/services/auth.service.js`

---

#### משימה 30.1.2: יצירת Login Component (D15)
**עדיפות:** P0  
**זמן משוער:** 4 שעות

**תת-משימות:**
- [ ] יצירת `components/auth/LoginForm.jsx`
- [ ] form fields (username/email, password)
- [ ] validation (required, email format)
- [ ] error handling
- [ ] loading states
- [ ] integration עם auth.service
- [ ] redirect לאחר login מוצלח
- [ ] link ל-forgot password

**תוצר:** `src/components/auth/LoginForm.jsx`

---

#### משימה 30.1.3: יצירת Register Component (D15)
**עדיפות:** P0  
**זמן משוער:** 4 שעות

**תת-משימות:**
- [ ] יצירת `components/auth/RegisterForm.jsx`
- [ ] form fields (username, email, password, confirm_password, phone?)
- [ ] validation (unique username/email, password strength, phone format)
- [ ] error handling
- [ ] loading states
- [ ] integration עם auth.service
- [ ] redirect לאחר register מוצלח

**תוצר:** `src/components/auth/RegisterForm.jsx`

---

#### משימה 30.1.4: יצירת Password Reset Flow (D15)
**עדיפות:** P1  
**זמן משוער:** 5 שעות

**תת-משימות:**
- [ ] יצירת `components/auth/ForgotPasswordForm.jsx`
  - בחירת method (EMAIL/SMS)
  - input (email/phone)
  - שליחת request
- [ ] יצירת `components/auth/ResetPasswordForm.jsx`
  - input token/code
  - input new password
  - confirm password
  - verify & reset
- [ ] integration עם password reset API
- [ ] error handling (expired token, invalid code)

**תוצר:** `src/components/auth/ForgotPasswordForm.jsx`, `ResetPasswordForm.jsx`

---

#### משימה 30.1.5: יצירת API Keys Management (D24)
**עדיפות:** P1  
**זמן משוער:** 6 שעות

**תת-משימות:**
- [ ] יצירת `components/api-keys/ApiKeysList.jsx`
  - רשימת keys
  - status badges (active/inactive, verified/unverified)
  - provider icons
- [ ] יצירת `components/api-keys/ApiKeyForm.jsx`
  - form להוספת key (provider, key, secret, label)
  - validation
- [ ] יצירת `components/api-keys/ApiKeyItem.jsx`
  - display key (masked)
  - actions (edit, delete, verify)
- [ ] integration עם API
- [ ] error handling

**תוצר:** `src/components/api-keys/*.jsx`

---

#### משימה 30.1.6: יצירת Security Settings View (D25)
**עדיפות:** P1  
**זמן משוער:** 4 שעות

**תת-משימות:**
- [ ] יצירת `views/SecurityView.jsx`
- [ ] Phone verification section
  - display phone number
  - verify button
  - code input modal
- [ ] Password reset section
  - link ל-forgot password
- [ ] API Keys section (link ל-D24)
- [ ] integration עם user profile API

**תוצר:** `src/views/SecurityView.jsx`

---

#### משימה 30.1.7: יצירת Protected Routes
**עדיפות:** P0  
**זמן משוער:** 2 שעות

**תת-משימות:**
- [ ] יצירת `components/auth/ProtectedRoute.jsx`
- [ ] בדיקת authentication
- [ ] redirect ל-login אם לא authenticated
- [ ] integration עם router

**תוצר:** `src/components/auth/ProtectedRoute.jsx`

---

### 3.3 צוות 40 (UI Assets) - המשימות העיקריות

#### משימה 40.1.1: יצירת Design Tokens
**עדיפות:** P1  
**זמן משוער:** 2 שעות

**תת-משימות:**
- [ ] יצירת `design-tokens/auth.json`
  - colors (primary, error, success)
  - typography
  - spacing
  - shadows
- [ ] יצירת `design-tokens/forms.json`
  - input styles
  - button styles
  - validation states

**תוצר:** `design-tokens/*.json`

---

#### משימה 40.1.2: יצירת Auth Components Styles
**עדיפות:** P1  
**זמן משוער:** 3 שעות

**תת-משימות:**
- [ ] styling ל-LoginForm
- [ ] styling ל-RegisterForm
- [ ] styling ל-PasswordReset forms
- [ ] responsive design
- [ ] dark mode support (אם נדרש)

**תוצר:** `styles/auth.css` או styled-components

---

### 3.4 צוות 50 (QA) - המשימות העיקריות

#### משימה 50.1.1: יצירת Test Scenarios
**עדיפות:** P0  
**זמן משוער:** 3 שעות

**תת-משימות:**
- [ ] Login flow tests
- [ ] Register flow tests
- [ ] Password reset flow tests (EMAIL)
- [ ] Password reset flow tests (SMS)
- [ ] API Keys CRUD tests
- [ ] Phone verification tests
- [ ] Error scenarios (invalid credentials, expired tokens)

**תוצר:** `tests/scenarios/auth_scenarios.md`

---

#### משימה 50.1.2: יצירת Sanity Checklist
**עדיפות:** P0  
**זמן משוער:** 2 שעות

**תת-משימות:**
- [ ] checklist ל-DB schema
- [ ] checklist ל-API endpoints
- [ ] checklist ל-UI components
- [ ] checklist ל-security (encryption, masking)
- [ ] checklist ל-error handling

**תוצר:** `tests/sanity/phase1_sanity_checklist.md`

---

## 📋 4. סיכום תלויות (Dependencies Summary)

### Critical Path:
1. **DB Schema** (20.1.1) → **Models** (20.1.2) → **Schemas** (20.1.3) → **Services** (20.1.4-20.1.7) → **Routes** (20.1.8)
2. **OpenAPI Spec** (20.1.9) → **Frontend Services** (30.1.1) → **Components** (30.1.2-30.1.6)

### Parallel Work:
- **Encryption Service** (20.1.4) יכול להיעשות במקביל ל-Models
- **Frontend Auth Service** (30.1.1) יכול להתחיל אחרי OpenAPI Spec
- **UI Assets** (40.1.1-40.1.2) יכול להיעשות במקביל לפיתוח Frontend

---

## ⚠️ 5. שאלות פתוחות (Open Questions)

### שאלה 1: אסטרטגיית מזהים
**שאלה:** האם UUID ב-DB צריך להיות מומר ל-ULID ב-API, או שיש שדה נפרד `external_ulid`?  
**השפעה:** משפיע על כל ה-models וה-API responses  
**נדרש מ:** Team 00 / Gemini Bridge

### שאלה 2: JWT Structure
**שאלה:** מה המבנה המדויק של ה-JWT payload? (claims, expiration, refresh token?)  
**השפעה:** משפיע על AuthService ו-Frontend  
**נדרש מ:** Team 00 / Gemini Bridge

### שאלה 3: SMS Provider
**שאלה:** איזה SMS provider להשתמש? (Twilio, AWS SNS, אחר?)  
**השפעה:** משפיע על PasswordResetService  
**נדרש מ:** Team 00 / Infrastructure

### שאלה 4: Email Provider
**שאלה:** איזה email provider להשתמש? (SendGrid, AWS SES, SMTP?)  
**השפעה:** משפיע על PasswordResetService  
**נדרש מ:** Team 00 / Infrastructure

---

## ✅ 6. קריטריוני הצלחה (Success Criteria)

### DB Layer:
- [ ] כל הטבלאות קיימות ומוכשרות
- [ ] כל ה-indexes קיימים
- [ ] כל ה-constraints מוגדרים

### Backend Layer:
- [ ] כל ה-endpoints עובדים
- [ ] Encryption עובד
- [ ] JWT authentication עובד
- [ ] Password reset עובד (EMAIL + SMS)
- [ ] API Keys CRUD עובד

### Frontend Layer:
- [ ] Login flow עובד
- [ ] Register flow עובד
- [ ] Password reset flow עובד
- [ ] API Keys management עובד
- [ ] Protected routes עובדים

### Security:
- [ ] API keys מוצפנים ב-DB
- [ ] API keys ממוסכים ב-responses
- [ ] Passwords hashed (bcrypt)
- [ ] JWT tokens מאובטחים
- [ ] Rate limiting (אם נדרש)

---

## 📅 7. Timeline משוער

**Phase 1.1 (DB & Backend Foundation):** 2 ימים
- יום 1: DB Schema + Models + Schemas + Encryption
- יום 2: AuthService + PasswordResetService + ApiKeyService

**Phase 1.2 (API Routes):** 1 יום
- יום 3: Routes + OpenAPI Spec

**Phase 1.3 (Frontend):** 2 ימים
- יום 4: Auth Service + Login/Register Components
- יום 5: Password Reset + API Keys + Security View

**Phase 1.4 (QA & Polish):** 1 יום
- יום 6: Testing + Bug fixes + Documentation

**סה"כ:** 6 ימי עבודה

---

## 🚀 8. מוכנות להפעלה (Readiness for Activation)

✅ **תוכנית העבודה המפורטת הושלמה**  
✅ **כל המסמכים הוצלבו**  
✅ **כל המשימות פורקו לצוותים**  
✅ **כל התלויות מזוהות**

**ממתין לאישור Gate 0 לפני הפעלת הצוותים.**

---

**Prepared by:** Team 10 (The Gateway)  
**Status:** ✅ READY FOR APPROVAL  
**Next Action:** Awaiting Gate 0 approval from Team 00 & Gemini Bridge
