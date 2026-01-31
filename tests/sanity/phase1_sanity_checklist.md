# ✅ Phase 1 Sanity Checklist: Authentication & Identity

**From:** Team 50 (QA)  
**To:** Team 10 (The Gateway)  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Phase 1.1  
**Task:** 50.1.2  
**Status:** ✅ COMPLETED

---

## 📋 Overview

This sanity checklist ensures all Phase 1 components are properly implemented and compliant with specifications. Use this checklist to validate:
- Database Schema
- API Endpoints
- UI Components
- Security Measures
- Error Handling

**Reference Documents:**
- SQL Schema: `PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`
- OpenAPI Spec: `OPENAPI_SPEC_V2_FINAL.yaml`
- Task Breakdown: `PHASE_1_TASK_BREAKDOWN.md`
- UI Blueprints: `GIN_004_UI_ALIGNMENT_SPEC.md`

---

## 1. Database Schema Checklist

### 1.1 Core Tables Existence

- [ ] **Table: `user_data.users`**
  - [ ] Table exists in schema `user_data`
  - [ ] Primary key: `id` (UUID)
  - [ ] All required columns exist:
    - [ ] `username` (VARCHAR(50), UNIQUE)
    - [ ] `email` (VARCHAR(255), UNIQUE)
    - [ ] `password_hash` (VARCHAR(255))
    - [ ] `phone_number` (VARCHAR(20), nullable, UNIQUE)
    - [ ] `phone_verified` (BOOLEAN, default FALSE)
    - [ ] `phone_verified_at` (TIMESTAMPTZ, nullable)
    - [ ] `role` (ENUM: USER, ADMIN, SUPERADMIN)
    - [ ] `is_active` (BOOLEAN, default TRUE)
    - [ ] `is_email_verified` (BOOLEAN, default FALSE)
    - [ ] `last_login_at` (TIMESTAMPTZ, nullable)
    - [ ] `failed_login_attempts` (INTEGER, default 0)
    - [ ] `locked_until` (TIMESTAMPTZ, nullable)
    - [ ] `created_at` (TIMESTAMPTZ)
    - [ ] `updated_at` (TIMESTAMPTZ)
    - [ ] `deleted_at` (TIMESTAMPTZ, nullable)

- [ ] **Table: `user_data.password_reset_requests`**
  - [ ] Table exists
  - [ ] Primary key: `id` (UUID)
  - [ ] Foreign key: `user_id` → `user_data.users(id)`
  - [ ] All required columns exist:
    - [ ] `method` (ENUM: EMAIL, SMS)
    - [ ] `sent_to` (VARCHAR(255))
    - [ ] `reset_token` (VARCHAR(64), UNIQUE)
    - [ ] `token_expires_at` (TIMESTAMPTZ)
    - [ ] `verification_code` (VARCHAR(6), nullable)
    - [ ] `code_expires_at` (TIMESTAMPTZ, nullable)
    - [ ] `attempts_count` (INTEGER, default 0)
    - [ ] `max_attempts` (INTEGER, default 3)
    - [ ] `status` (VARCHAR(20), CHECK: PENDING, USED, EXPIRED, REVOKED)
    - [ ] `used_at` (TIMESTAMPTZ, nullable)
    - [ ] `used_from_ip` (VARCHAR(45), nullable)
    - [ ] `created_at` (TIMESTAMPTZ)

- [ ] **Table: `user_data.user_api_keys`**
  - [ ] Table exists
  - [ ] Primary key: `id` (UUID)
  - [ ] Foreign key: `user_id` → `user_data.users(id)`
  - [ ] All required columns exist:
    - [ ] `provider` (ENUM: IBKR, POLYGON, YAHOO_FINANCE, etc.)
    - [ ] `provider_label` (VARCHAR(100), nullable)
    - [ ] `api_key_encrypted` (TEXT)
    - [ ] `api_secret_encrypted` (TEXT, nullable)
    - [ ] `additional_config` (JSONB, default '{}')
    - [ ] `is_active` (BOOLEAN, default TRUE)
    - [ ] `is_verified` (BOOLEAN, default FALSE)
    - [ ] `last_verified_at` (TIMESTAMPTZ, nullable)
    - [ ] `verification_error` (TEXT, nullable)
    - [ ] `rate_limit_per_minute` (INTEGER, nullable)
    - [ ] `rate_limit_per_day` (INTEGER, nullable)
    - [ ] `quota_used_today` (INTEGER, default 0)
    - [ ] `quota_reset_at` (TIMESTAMPTZ, nullable)
    - [ ] `created_by` (UUID, FK → users)
    - [ ] `updated_by` (UUID, FK → users)
    - [ ] `created_at` (TIMESTAMPTZ)
    - [ ] `updated_at` (TIMESTAMPTZ)
    - [ ] `deleted_at` (TIMESTAMPTZ, nullable)
    - [ ] `version` (INTEGER, default 1)

**Evidence:** SQL query results showing table structures

---

### 1.2 Indexes

- [ ] **Indexes on `user_data.users`:**
  - [ ] `idx_users_email` (on `email`, WHERE `deleted_at IS NULL`)
  - [ ] `idx_users_username` (on `username`, WHERE `deleted_at IS NULL`)
  - [ ] `idx_users_role` (on `role`, WHERE `deleted_at IS NULL`)
  - [ ] `idx_users_phone_unique` (UNIQUE on `phone_number`, WHERE `phone_number IS NOT NULL AND deleted_at IS NULL`)
  - [ ] `idx_users_phone` (on `phone_number`, WHERE `deleted_at IS NULL`)

- [ ] **Indexes on `user_data.password_reset_requests`:**
  - [ ] `idx_password_reset_token` (UNIQUE on `reset_token`, WHERE `status = 'PENDING'`)
  - [ ] `idx_password_reset_user_id` (on `user_id, created_at DESC`)
  - [ ] `idx_password_reset_expired` (on `token_expires_at`, WHERE `status = 'PENDING'`)
  - [ ] `idx_password_reset_method` (on `method, status`)

- [ ] **Indexes on `user_data.user_api_keys`:**
  - [ ] `idx_user_api_keys_user_id` (on `user_id, created_at DESC`, WHERE `deleted_at IS NULL`)
  - [ ] `idx_user_api_keys_provider` (on `provider, is_active`, WHERE `is_active = TRUE AND deleted_at IS NULL`)
  - [ ] `idx_user_api_keys_verified` (on `is_verified, last_verified_at DESC`, WHERE `deleted_at IS NULL`)
  - [ ] `idx_user_api_keys_config` (GIN index on `additional_config`)

**Evidence:** SQL query: `\d+ table_name` or `SELECT * FROM pg_indexes WHERE tablename = 'table_name'`

---

### 1.3 Constraints

- [ ] **Constraints on `user_data.users`:**
  - [ ] `users_phone_format` CHECK constraint: `phone_number ~ '^\+?[1-9]\d{1,14}$'`
  - [ ] UNIQUE constraint on `username`
  - [ ] UNIQUE constraint on `email`
  - [ ] UNIQUE constraint on `phone_number` (where not null)

- [ ] **Constraints on `user_data.password_reset_requests`:**
  - [ ] `password_reset_token_length` CHECK: `LENGTH(reset_token) >= 32`
  - [ ] `password_reset_code_length` CHECK: `verification_code IS NULL OR LENGTH(verification_code) = 6`
  - [ ] `password_reset_attempts_limit` CHECK: `attempts_count <= max_attempts`
  - [ ] UNIQUE constraint on `reset_token`

- [ ] **Constraints on `user_data.user_api_keys`:**
  - [ ] `user_api_keys_unique_user_provider` UNIQUE: `(user_id, provider, provider_label)` WHERE `deleted_at IS NULL`
  - [ ] `user_api_keys_encrypted_not_empty` CHECK: `LENGTH(api_key_encrypted) > 0`
  - [ ] `user_api_keys_rate_limit_positive` CHECK: `rate_limit_per_minute IS NULL OR rate_limit_per_minute > 0`
  - [ ] `user_api_keys_quota_logic` CHECK: `quota_used_today >= 0`

**Evidence:** SQL query: `SELECT conname, contype, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'table_name'::regclass`

---

### 1.4 Foreign Keys

- [ ] **Foreign Keys:**
  - [ ] `password_reset_requests.user_id` → `users.id` (ON DELETE CASCADE)
  - [ ] `user_api_keys.user_id` → `users.id` (ON DELETE CASCADE)
  - [ ] `user_api_keys.created_by` → `users.id`
  - [ ] `user_api_keys.updated_by` → `users.id`

**Evidence:** SQL query showing foreign key relationships

---

### 1.5 ENUMs

- [ ] **ENUM Types Exist:**
  - [ ] `user_data.user_role` (USER, ADMIN, SUPERADMIN)
  - [ ] `user_data.reset_method` (EMAIL, SMS)
  - [ ] `user_data.api_provider` (IBKR, POLYGON, YAHOO_FINANCE, ALPHA_VANTAGE, FINNHUB, TWELVE_DATA, IEX_CLOUD, CUSTOM)

**Evidence:** SQL query: `SELECT typname, enumlabel FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE typname LIKE '%role%' OR typname LIKE '%method%' OR typname LIKE '%provider%'`

---

## 2. API Endpoints Checklist

### 2.1 Authentication Endpoints

- [ ] **POST `/api/v1/auth/login`**
  - [ ] Endpoint exists and accessible
  - [ ] Accepts `username_or_email` + `password` (single field for both)
  - [ ] Returns JWT token on success
  - [ ] Returns `401` on invalid credentials
  - [ ] Returns `423` on locked account
  - [ ] Updates `last_login_at` on success
  - [ ] Resets `failed_login_attempts` on success
  - [ ] Sets refresh token in httpOnly cookie
  - [ ] Response includes: `access_token`, `token_type`, `expires_at`, `user`
  - [ ] Response does NOT include `refresh_token` in body (security)

- [ ] **POST `/api/v1/auth/register`**
  - [ ] Endpoint exists and accessible
  - [ ] Accepts: `username`, `email`, `password`, `phone_number` (optional)
  - [ ] Validates password strength
  - [ ] Validates email format
  - [ ] Validates phone format (E.164) if provided
  - [ ] Returns `409` on duplicate email/username
  - [ ] Returns `400` on weak password
  - [ ] Creates user record with hashed password
  - [ ] Returns JWT token on success
  - [ ] Response includes: `user`, `access_token`, `token_type`

- [ ] **POST `/api/v1/auth/logout`**
  - [ ] Endpoint exists and accessible
  - [ ] Requires authentication (JWT token)
  - [ ] Invalidates token (if blacklist implemented)
  - [ ] Returns `200` on success

- [ ] **POST `/api/v1/auth/refresh`**
  - [ ] Endpoint exists and accessible
  - [ ] Accepts refresh token
  - [ ] Returns new access token
  - [ ] Returns `401` on invalid/expired refresh token

- [ ] **POST `/api/v1/auth/reset-password`**
  - [ ] Endpoint exists and accessible
  - [ ] Accepts: `method` (EMAIL/SMS), `email` OR `phone`
  - [ ] Creates `password_reset_requests` record
  - [ ] Generates secure token (EMAIL) or code (SMS)
  - [ ] Sends email/SMS (or queues)
  - [ ] Returns masked identifier (no full email/phone)
  - [ ] Returns same response for non-existent users (security)

- [ ] **POST `/api/v1/auth/verify-reset`**
  - [ ] Endpoint exists and accessible
  - [ ] Accepts: `reset_token`, `verification_code` (if SMS), `new_password`
  - [ ] Validates token expiration
  - [ ] Validates code (if SMS) and attempts
  - [ ] Updates password hash
  - [ ] Marks request as USED
  - [ ] Returns `400` on expired/invalid token
  - [ ] Returns `400` on invalid code (SMS)
  - [ ] Returns `400` on too many attempts (SMS)

- [ ] **POST `/api/v1/auth/verify-phone`**
  - [ ] Endpoint exists and accessible
  - [ ] Requires authentication
  - [ ] Accepts: `verification_code` (6 digits)
  - [ ] If no pending code exists, creates reset request and sends SMS
  - [ ] If code provided, validates and marks phone as verified
  - [ ] Updates `phone_verified = TRUE` on success
  - [ ] Sets `phone_verified_at` on success
  - [ ] Returns `400` on invalid code or too many attempts

**Evidence:** API test results (Postman/curl/automated tests)

---

### 2.2 User Profile Endpoints

- [ ] **GET `/api/v1/users/me`**
  - [ ] Endpoint exists and accessible
  - [ ] Requires authentication (JWT token)
  - [ ] Returns current user profile
  - [ ] Response includes: `external_ulids` (plural), `email`, `username`, `phone_numbers` (plural, masked), `phone_verified`, `is_email_verified`
  - [ ] Returns `401` if not authenticated

- [ ] **PUT `/api/v1/users/me`**
  - [ ] Endpoint exists and accessible
  - [ ] Requires authentication
  - [ ] Accepts profile updates (phone, display_name, etc.)
  - [ ] Validates phone format if updated
  - [ ] Updates `updated_at` timestamp
  - [ ] Returns updated profile

**Evidence:** API test results

---

### 2.3 API Keys Management Endpoints

- [ ] **GET `/api/v1/user/api-keys`**
  - [ ] Endpoint exists and accessible
  - [ ] Requires authentication
  - [ ] Returns only user's own keys
  - [ ] All keys masked in response (`masked_key: "********************"`)
  - [ ] Returns array of `UserApiKeyResponse` objects
  - [ ] Each object includes: `external_ulids`, `provider`, `masked_key`, `is_active`, `is_verified`

- [ ] **POST `/api/v1/user/api-keys`**
  - [ ] Endpoint exists and accessible
  - [ ] Requires authentication
  - [ ] Accepts: `provider`, `provider_label`, `api_key`, `api_secret`, `additional_config`
  - [ ] Encrypts keys before storing
  - [ ] Validates provider enum
  - [ ] Checks duplicate (user + provider + label)
  - [ ] Returns `UserApiKeyResponse` with `masked_key` field
  - [ ] Returns `409` on duplicate
  - [ ] Response includes `external_ulids` (ULID, not UUID)

- [ ] **PUT `/api/v1/user/api-keys/{id}`**
  - [ ] Endpoint exists and accessible
  - [ ] Requires authentication
  - [ ] Validates ownership (user owns the key)
  - [ ] Accepts: `provider_label`, `is_active`, `additional_config`
  - [ ] Updates `updated_at`
  - [ ] Returns `404` if key not found
  - [ ] Returns `403` if user doesn't own key

- [ ] **DELETE `/api/v1/user/api-keys/{id}`**
  - [ ] Endpoint exists and accessible
  - [ ] Requires authentication
  - [ ] Validates ownership
  - [ ] Soft deletes (sets `deleted_at`) OR hard deletes
  - [ ] Returns `204` or `200`
  - [ ] Returns `404` if key not found

- [ ] **POST `/api/v1/user/api-keys/{id}/verify`**
  - [ ] Endpoint exists and accessible
  - [ ] Requires authentication
  - [ ] Validates ownership
  - [ ] Decrypts key
  - [ ] Tests against provider API
  - [ ] Updates `is_verified`, `last_verified_at`, `verification_error`
  - [ ] Returns verification result

**Evidence:** API test results

---

### 2.4 Response Formats

- [ ] **All endpoints:**
  - [ ] Return JSON responses
  - [ ] Include proper HTTP status codes
  - [ ] Error responses include: `error`, `code` fields
  - [ ] Success responses include requested data
  - [ ] No sensitive data in error messages (no stack traces in production)

**Evidence:** API response samples

---

## 3. UI Components Checklist

### 3.1 Authentication Components

- [ ] **Login Form (D15)**
  - [ ] Component exists: `components/auth/LoginForm.jsx`
  - [ ] Form fields: username/email input, password input
  - [ ] Validation: required fields, email format
  - [ ] Error handling: displays API errors
  - [ ] Loading states: shows spinner during request
  - [ ] Success: redirects after login
  - [ ] Link to forgot password

- [ ] **Register Form (D15)**
  - [ ] Component exists: `components/auth/RegisterForm.jsx`
  - [ ] Form fields: username, email, password, confirm_password, phone (optional)
  - [ ] Validation:
    - [ ] Username uniqueness check
    - [ ] Email format and uniqueness check
    - [ ] Password strength validation
    - [ ] Password confirmation match
    - [ ] Phone format (E.164) if provided
  - [ ] Error handling: displays field-specific errors
  - [ ] Loading states
  - [ ] Success: redirects after registration

- [ ] **Forgot Password Form (D15)**
  - [ ] Component exists: `components/auth/ForgotPasswordForm.jsx`
  - [ ] Method selection: EMAIL or SMS radio/select
  - [ ] Input: email OR phone based on method
  - [ ] Sends reset request
  - [ ] Shows success message
  - [ ] Error handling

- [ ] **Reset Password Form (D15)**
  - [ ] Component exists: `components/auth/ResetPasswordForm.jsx`
  - [ ] Input: token/code (from URL or input)
  - [ ] Input: new password, confirm password
  - [ ] Validates password strength
  - [ ] Submits verification and reset
  - [ ] Shows success/error messages
  - [ ] Redirects to login on success

**Evidence:** Component file existence, UI screenshots

---

### 3.2 API Keys Management Components (D24)

- [ ] **API Keys List**
  - [ ] Component exists: `components/api-keys/ApiKeysList.jsx`
  - [ ] Displays list of user's API keys
  - [ ] Shows: provider, label, status badges (active/inactive, verified/unverified)
  - [ ] Provider icons/logos
  - [ ] Actions: edit, delete, verify buttons
  - [ ] Empty state: "No API keys" message

- [ ] **API Key Form**
  - [ ] Component exists: `components/api-keys/ApiKeyForm.jsx`
  - [ ] Form fields: provider (select), label, api_key, api_secret
  - [ ] Validation: required fields, provider selection
  - [ ] Submit creates new key
  - [ ] Success: refreshes list, closes form

- [ ] **API Key Item**
  - [ ] Component exists: `components/api-keys/ApiKeyItem.jsx`
  - [ ] Displays key info (masked)
  - [ ] Status badges
  - [ ] Actions: edit, delete, verify
  - [ ] Confirmation dialog for delete

**Evidence:** Component files, UI screenshots

---

### 3.3 Security Settings View (D25)

- [ ] **Security View**
  - [ ] Component exists: `views/SecurityView.jsx`
  - [ ] Phone verification section:
    - [ ] Displays phone number (masked)
    - [ ] Verify button
    - [ ] Code input modal
  - [ ] Password reset section:
    - [ ] Link to forgot password
  - [ ] API Keys section:
    - [ ] Link to API Keys management (D24)

**Evidence:** Component files, UI screenshots

---

### 3.4 Protected Routes

- [ ] **Protected Route Component**
  - [ ] Component exists: `components/auth/ProtectedRoute.jsx`
  - [ ] Checks authentication status
  - [ ] Redirects to login if not authenticated
  - [ ] Renders children if authenticated
  - [ ] Handles token expiration

**Evidence:** Component file, routing configuration

---

### 3.5 Form Validation

- [ ] **All forms:**
  - [ ] Client-side validation before submit
  - [ ] Server-side error display
  - [ ] Field-level error messages
  - [ ] Disabled submit button during request
  - [ ] Success feedback

**Evidence:** UI test results

---

## 4. Security Checklist

### 4.1 Encryption

- [ ] **API Keys Encryption:**
  - [ ] `api_key_encrypted` field stores encrypted data (not plain text)
  - [ ] `api_secret_encrypted` field stores encrypted data (not plain text)
  - [ ] Encryption service uses `cryptography.fernet` or equivalent
  - [ ] Encryption key stored in environment variable (not hardcoded)
  - [ ] Decryption only happens when needed (not stored in memory)
  - [ ] No plain text keys in logs

- [ ] **Password Hashing:**
  - [ ] Passwords hashed with bcrypt (or equivalent)
  - [ ] No plain text passwords in DB
  - [ ] Salt included in hash
  - [ ] Hashing happens before DB insert

**Evidence:** DB queries showing encrypted/hashed data, code review

---

### 4.2 Masking

- [ ] **API Response Masking:**
  - [ ] API keys masked in responses: `********************`
  - [ ] Email addresses masked in reset responses: `t***@example.com`
  - [ ] Phone numbers masked: `+1***1234`
  - [ ] No sensitive data exposed in error messages

**Evidence:** API response samples

---

### 4.3 JWT Tokens

- [ ] **Token Security:**
  - [ ] Tokens signed with secret key
  - [ ] Tokens include expiration (`exp` claim)
  - [ ] Tokens include user ID (`sub` or `user_id` claim)
  - [ ] Token validation on every protected endpoint
  - [ ] Expired tokens rejected
  - [ ] Invalid tokens rejected
  - [ ] Token refresh mechanism (if implemented)

**Evidence:** Token decode results, validation logic

---

### 4.4 Password Security

- [ ] **Password Requirements:**
  - [ ] Minimum length: 8 characters
  - [ ] Requires uppercase letter
  - [ ] Requires lowercase letter
  - [ ] Requires number
  - [ ] Requires special character (if configured)
  - [ ] Common passwords rejected (if blacklist implemented)

**Evidence:** Password validation tests

---

### 4.5 Account Locking

- [ ] **Lock Mechanism:**
  - [ ] Account locks after N failed attempts (e.g., 5)
  - [ ] `locked_until` timestamp set
  - [ ] Locked accounts cannot login even with correct password
  - [ ] Lock expiration handled
  - [ ] `failed_login_attempts` resets on successful login

**Evidence:** Account locking tests

---

### 4.6 Input Sanitization

- [ ] **SQL Injection Prevention:**
  - [ ] Parameterized queries used
  - [ ] No string concatenation in SQL
  - [ ] ORM/SQLAlchemy used (prevents SQL injection)

- [ ] **XSS Prevention:**
  - [ ] User input sanitized before display
  - [ ] React escapes by default (if using React)
  - [ ] No `dangerouslySetInnerHTML` with user input

**Evidence:** Code review, security test results

---

## 5. Error Handling Checklist

### 5.1 API Error Responses

- [ ] **Error Format:**
  - [ ] Consistent error response structure:
    ```json
    {
      "error": "Error message",
      "code": "ERROR_CODE",
      "field": "field_name" // if field-specific
    }
    ```
  - [ ] Appropriate HTTP status codes:
    - [ ] `400` Bad Request (validation errors)
    - [ ] `401` Unauthorized (authentication required)
    - [ ] `403` Forbidden (authorization failed)
    - [ ] `404` Not Found
    - [ ] `409` Conflict (duplicate)
    - [ ] `423` Locked (account locked)
    - [ ] `429` Too Many Requests (rate limiting)
    - [ ] `500` Internal Server Error (server errors)

- [ ] **Error Messages:**
  - [ ] Generic errors for security (no user enumeration)
  - [ ] Field-specific errors for validation
  - [ ] No stack traces in production
  - [ ] No sensitive data in errors

**Evidence:** Error response samples

---

### 5.2 Validation Errors

- [ ] **Field Validation:**
  - [ ] Email format validation
  - [ ] Phone format validation (E.164)
  - [ ] Password strength validation
  - [ ] Username format validation
  - [ ] Required field validation
  - [ ] Unique constraint validation (email, username, phone)

**Evidence:** Validation test results

---

### 5.3 Edge Cases

- [ ] **Edge Cases Handled:**
  - [ ] Empty request body
  - [ ] Missing required fields
  - [ ] Invalid JSON
  - [ ] Very long strings (DoS prevention)
  - [ ] Special characters in input
  - [ ] Unicode characters
  - [ ] Null values
  - [ ] Concurrent requests (race conditions)

**Evidence:** Edge case test results

---

### 5.4 Logging

- [ ] **Error Logging:**
  - [ ] Errors logged server-side
  - [ ] No sensitive data in logs (passwords, tokens, keys)
  - [ ] Log levels appropriate (ERROR, WARN, INFO)
  - [ ] Logs include request ID/trace ID

**Evidence:** Log samples (sanitized)

---

## 📊 Checklist Summary

**Total Items:** 150+  
**Critical (P0):** 80+  
**Important (P1):** 70+

**Categories:**
- ✅ Database Schema: 35 items
- ✅ API Endpoints: 45 items
- ✅ UI Components: 30 items
- ✅ Security: 25 items
- ✅ Error Handling: 15 items

---

## 📝 Validation Process

1. **For each item:**
   - [ ] Checked/Verified
   - [ ] Evidence collected (screenshots, logs, queries)
   - [ ] Issues documented (if any)

2. **Issues Found:**
   - Document in separate issues log
   - Assign priority (P0/P1)
   - Report to Team 10

3. **Completion Criteria:**
   - All P0 items checked ✅
   - All P1 items checked ✅
   - Evidence collected for all items
   - Issues documented and reported

---

## 🚨 Critical Issues Log

**Format:**
```
Issue ID | Category | Priority | Description | Evidence | Status
```

**Example:**
```
ISSUE-001 | DB Schema | P0 | Missing index on users.email | SQL query result | OPEN
```

---

---

## 6. G-Bridge Validation Checklist

### 6.1 RTL Charter Compliance

- [ ] **No Physical Properties:**
  - [ ] No `margin-left`, `margin-right` in CSS
  - [ ] No `padding-left`, `padding-right` in CSS
  - [ ] No `left:`, `right:` positioning
  - [ ] Logical properties used: `margin-inline-start/end`, `padding-inline-start/end`

**Evidence:** G-Bridge audit output showing no RTL violations

---

### 6.2 LEGO System Compliance

- [ ] **Semantic Tags:**
  - [ ] No `class="section"` divs
  - [ ] No `class="card"` divs
  - [ ] `<tt-section>` tags used instead
  - [ ] HTML structure follows LEGO system

**Evidence:** G-Bridge audit output, HTML file review

---

### 6.3 DNA Variables Compliance

- [ ] **CSS Variables:**
  - [ ] No hardcoded hex colors (except allowed: `#26baac`, `#dc2626`, `#f8fafc`)
  - [ ] All colors use CSS variables (`var(--color-name)`)
  - [ ] Theme support (dark mode ready)

**Evidence:** G-Bridge audit output, CSS file review

---

### 6.4 Structural Integrity

- [ ] **Header Structure:**
  - [ ] Unified header exists in `index.html`
  - [ ] Header height: `158px`
  - [ ] Header z-index: `950`
  - [ ] Logo integrity maintained

**Evidence:** G-Bridge audit output, HTML/CSS review

---

### 6.5 G-Bridge Execution

- [ ] **Local Emulator:**
  - [ ] Script runs successfully: `node "HOENIX G-BRIDGE.js" [file.html]`
  - [ ] Generates `_PREVIEW_[file].html` output
  - [ ] Shows APPROVED/REJECTED status
  - [ ] Lists all issues if REJECTED

- [ ] **Sandbox Integration:**
  - [ ] Files uploaded to staging pass G-Bridge
  - [ ] SANDBOX_INDEX.html shows status
  - [ ] Green banner (APPROVED) or red banner (REJECTED)

**Evidence:** G-Bridge execution logs, sandbox screenshots

---

**Prepared by:** Team 50 (QA)  
**Status:** ✅ COMPLETED (Updated to match actual implementation + G-Bridge)  
**Next:** Execute checklist validation and collect evidence
