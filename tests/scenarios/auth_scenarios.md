# 🔐 Test Scenarios: Authentication & Identity Module
**project_domain:** TIKTRACK

**From:** Team 50 (QA)  
**To:** Team 10 (The Gateway)  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Phase 1.1  
**Task:** 50.1.1  
**Status:** ✅ COMPLETED

---

## 📋 Test Coverage Overview

This document defines comprehensive test scenarios for the Authentication & Identity module (Phase 1). All scenarios are based on:
- **SQL Schema:** `PHX_DB_SCHEMA_V2.5_FULL_DDL.sql`
- **OpenAPI Spec:** `OPENAPI_SPEC_V2_FINAL.yaml`
- **Task Breakdown:** `PHASE_1_TASK_BREAKDOWN.md`
- **UI Blueprints:** `GIN_004_UI_ALIGNMENT_SPEC.md`

**Test Categories:**
1. Login Flow Tests
2. Register Flow Tests
3. Password Reset Flow Tests (EMAIL)
4. Password Reset Flow Tests (SMS)
5. API Keys CRUD Tests
6. Phone Verification Tests
7. Error Scenarios

---

## 1. Login Flow Tests

### 1.1 Valid Credentials Login

**Test ID:** `AUTH-LOGIN-001`  
**Priority:** P0  
**Type:** Positive Test

**Preconditions:**
- User exists in `user_data.users` table
- User has `is_active = TRUE`
- User has `is_email_verified = TRUE` (if required)
- User has valid `password_hash`

**Test Steps:**
1. Send `POST /api/v1/auth/login` with:
   ```json
   {
     "username_or_email": "testuser",
     "password": "ValidPassword123!"
   }
   ```
   OR
   ```json
   {
     "username_or_email": "test@example.com",
     "password": "ValidPassword123!"
   }
   ```

2. Verify response status: `200 OK`

3. Verify response body contains:
   ```json
   {
     "access_token": "eyJ...",
     "token_type": "Bearer",
     "expires_at": "2026-01-31T12:00:00Z",
     "user": {
       "external_ulids": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
       "email": "test@example.com",
       "username": "testuser"
     }
   }
   ```

4. Verify `last_login_at` updated in DB

5. Verify `failed_login_attempts` reset to 0

**Expected Results:**
- ✅ Login successful
- ✅ JWT token returned
- ✅ User data returned (masked if needed)
- ✅ DB fields updated correctly

**Evidence Required:**
- API response screenshot/log
- DB query showing `last_login_at` update
- Token validation (decode and verify claims)

---

### 1.2 Invalid Credentials - Wrong Password

**Test ID:** `AUTH-LOGIN-002`  
**Priority:** P0  
**Type:** Negative Test

**Preconditions:**
- User exists with email `test@example.com`
- User has password `ValidPassword123!`

**Test Steps:**
1. Send `POST /api/v1/auth/login` with:
   ```json
   {
     "username_or_email": "test@example.com",
     "password": "WrongPassword123!"
   }
   ```

2. Verify response status: `401 Unauthorized`

3. Verify response body:
   ```json
   {
     "error": "Invalid credentials",
     "code": "AUTH_INVALID_CREDENTIALS"
   }
   ```

4. Verify `failed_login_attempts` incremented in DB

**Expected Results:**
- ✅ Login rejected
- ✅ Generic error message (no user enumeration)
- ✅ Failed attempts counter incremented

**Evidence Required:**
- API response log
- DB query showing `failed_login_attempts` increment

---

### 1.3 Invalid Credentials - Non-existent User

**Test ID:** `AUTH-LOGIN-003`  
**Priority:** P0  
**Type:** Negative Test

**Test Steps:**
1. Send `POST /api/v1/auth/login` with:
   ```json
   {
     "username_or_email": "nonexistent@example.com",
     "password": "AnyPassword123!"
   }
   ```

2. Verify response status: `401 Unauthorized`

3. Verify generic error (no user enumeration)

**Expected Results:**
- ✅ Same error as wrong password (security best practice)
- ✅ No information leak about user existence

---

### 1.4 Locked Account

**Test ID:** `AUTH-LOGIN-004`  
**Priority:** P0  
**Type:** Negative Test

**Preconditions:**
- User exists
- User has `locked_until` set to future timestamp
- OR `failed_login_attempts >= 5` (if auto-lock enabled)

**Test Steps:**
1. Send `POST /api/v1/auth/login` with valid credentials

2. Verify response status: `423 Locked` or `401 Unauthorized`

3. Verify response body:
   ```json
   {
     "error": "Account locked",
     "code": "AUTH_ACCOUNT_LOCKED",
     "locked_until": "2026-01-31T14:00:00Z"
   }
   ```

**Expected Results:**
- ✅ Login rejected even with correct password
- ✅ Lock expiration time provided

**Evidence Required:**
- API response log
- DB query showing `locked_until` value

---

### 1.5 Expired Token

**Test ID:** `AUTH-LOGIN-005`  
**Priority:** P1  
**Type:** Negative Test

**Preconditions:**
- User logged in and received JWT token
- Token has expired (past `expires_at`)

**Test Steps:**
1. Use expired token in `Authorization: Bearer <token>` header

2. Send `GET /api/v1/users/me`

3. Verify response status: `401 Unauthorized`

4. Verify response body:
   ```json
   {
     "error": "Token expired",
     "code": "AUTH_TOKEN_EXPIRED"
   }
   ```

**Expected Results:**
- ✅ Expired token rejected
- ✅ Clear error message

---

### 1.6 Login with Username (Alternative Identifier)

**Test ID:** `AUTH-LOGIN-006`  
**Priority:** P0  
**Type:** Positive Test

**Test Steps:**
1. Send `POST /api/v1/auth/login` with:
   ```json
   {
     "username_or_email": "testuser",
     "password": "ValidPassword123!"
   }
   ```

2. Verify login succeeds (same as email login)

**Expected Results:**
- ✅ Username login works
- ✅ Same response format as email login

---

## 2. Register Flow Tests

### 2.1 Valid Registration

**Test ID:** `AUTH-REGISTER-001`  
**Priority:** P0  
**Type:** Positive Test

**Preconditions:**
- Email `newuser@example.com` does not exist
- Username `newuser` does not exist

**Test Steps:**
1. Send `POST /api/v1/auth/register` with:
   ```json
   {
     "username": "newuser",
     "email": "newuser@example.com",
     "password": "SecurePass123!",
     "phone_number": "+12025551234"
   }
   ```

2. Verify response status: `201 Created`

3. Verify response body:
   ```json
   {
     "user": {
       "external_ulids": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
       "username": "newuser",
       "email": "newuser@example.com",
       "phone_numbers": "+12025551234",
       "phone_verified": false,
       "is_email_verified": false
     },
     "access_token": "eyJ...",
     "token_type": "bearer",
     "expires_at": "2026-02-01T12:00:00Z"
   }
   ```

4. Verify DB record created:
   - `user_data.users` table has new record
   - `password_hash` is hashed (not plain text)
   - `phone_number` matches E.164 format
   - `phone_verified = FALSE`
   - `is_email_verified = FALSE`
   - `is_active = TRUE`
   - `role = 'USER'`

**Expected Results:**
- ✅ User created successfully
- ✅ Password hashed (bcrypt)
- ✅ JWT token returned
- ✅ Email verification required (if configured)

**Evidence Required:**
- API response log
- DB query showing new user record
- Password hash verification (not plain text)

---

### 2.2 Duplicate Email Registration

**Test ID:** `AUTH-REGISTER-002`  
**Priority:** P0  
**Type:** Negative Test

**Preconditions:**
- User with email `existing@example.com` already exists

**Test Steps:**
1. Send `POST /api/v1/auth/register` with:
   ```json
   {
     "username": "differentuser",
     "email": "existing@example.com",
     "password": "SecurePass123!"
   }
   ```

2. Verify response status: `409 Conflict` or `400 Bad Request`

3. Verify response body:
   ```json
   {
     "error": "Email already registered",
     "code": "REGISTER_EMAIL_EXISTS",
     "field": "email"
   }
   ```

**Expected Results:**
- ✅ Registration rejected
- ✅ Clear error message
- ✅ No user record created

**Evidence Required:**
- API response log
- DB query confirming no duplicate record

---

### 2.3 Duplicate Username Registration

**Test ID:** `AUTH-REGISTER-003`  
**Priority:** P0  
**Type:** Negative Test

**Preconditions:**
- Username `existinguser` already exists

**Test Steps:**
1. Send `POST /api/v1/auth/register` with:
   ```json
   {
     "username": "existinguser",
     "email": "newemail@example.com",
     "password": "SecurePass123!"
   }
   ```

2. Verify response status: `409 Conflict` or `400 Bad Request`

3. Verify error indicates username conflict

**Expected Results:**
- ✅ Registration rejected
- ✅ Username uniqueness enforced

---

### 2.4 Weak Password Registration

**Test ID:** `AUTH-REGISTER-004`  
**Priority:** P0  
**Type:** Negative Test

**Test Steps:**
1. Send `POST /api/v1/auth/register` with weak passwords:
   - `"password": "123"` (too short)
   - `"password": "password"` (common password)
   - `"password": "abcdefgh"` (no numbers/special chars)

2. Verify response status: `400 Bad Request`

3. Verify response body:
   ```json
   {
     "error": "Password does not meet requirements",
     "code": "REGISTER_WEAK_PASSWORD",
     "requirements": {
       "min_length": 8,
       "requires_uppercase": true,
       "requires_lowercase": true,
       "requires_number": true,
       "requires_special": true
     }
   }
   ```

**Expected Results:**
- ✅ Weak passwords rejected
- ✅ Clear requirements message
- ✅ No user record created

**Evidence Required:**
- API response for each weak password variant

---

### 2.5 Invalid Phone Format Registration

**Test ID:** `AUTH-REGISTER-005`  
**Priority:** P1  
**Type:** Negative Test

**Test Steps:**
1. Send `POST /api/v1/auth/register` with invalid phone formats:
   - `"phone_number": "123"` (too short)
   - `"phone_number": "abc123"` (non-numeric)
   - `"phone_number": "2025551234"` (missing +)

2. Verify response status: `400 Bad Request`

3. Verify error indicates phone format violation

4. Verify DB constraint `users_phone_format` enforced:
   ```sql
   CHECK (phone_number IS NULL OR phone_number ~ '^\+?[1-9]\d{1,14}$')
   ```

**Expected Results:**
- ✅ Invalid phone formats rejected
- ✅ E.164 format enforced
- ✅ Constraint violation error

**Evidence Required:**
- API response for each invalid format
- DB constraint verification

---

### 2.6 Registration without Phone (Optional Field)

**Test ID:** `AUTH-REGISTER-006`  
**Priority:** P1  
**Type:** Positive Test

**Test Steps:**
1. Send `POST /api/v1/auth/register` with:
   ```json
   {
     "username": "nophoneuser",
     "email": "nophone@example.com",
     "password": "SecurePass123!"
   }
   ```

2. Verify registration succeeds

3. Verify `phone_number` is `NULL` in DB

**Expected Results:**
- ✅ Registration succeeds without phone
- ✅ Phone is optional

---

## 3. Password Reset Flow Tests (EMAIL)

### 3.1 Request Password Reset via Email

**Test ID:** `AUTH-RESET-EMAIL-001`  
**Priority:** P0  
**Type:** Positive Test

**Preconditions:**
- User exists with email `test@example.com`

**Test Steps:**
1. Send `POST /api/v1/auth/reset-password` with:
   ```json
   {
     "method": "EMAIL",
     "email": "test@example.com"
   }
   ```

2. Verify response status: `200 OK` or `202 Accepted`

3. Verify response body:
   ```json
   {
     "message": "Password reset email sent",
     "method": "EMAIL",
     "sent_to": "t***@example.com"  // Masked
   }
   ```

4. Verify DB record created:
   - `user_data.password_reset_requests` has new record
   - `method = 'EMAIL'`
   - `sent_to = 'test@example.com'`
   - `reset_token` is unique and hashed
   - `token_expires_at` is future timestamp (e.g., +1 hour)
   - `status = 'PENDING'`
   - `verification_code` is NULL (EMAIL method)

5. Verify email sent (if test environment allows)

**Expected Results:**
- ✅ Reset request created
- ✅ Token generated and hashed
- ✅ Email sent (or queued)
- ✅ Response does not expose full email

**Evidence Required:**
- API response log
- DB query showing reset request record
- Email delivery confirmation (if available)

---

### 3.2 Verify Password Reset with Valid Token (EMAIL)

**Test ID:** `AUTH-RESET-EMAIL-002`  
**Priority:** P0  
**Type:** Positive Test

**Preconditions:**
- Password reset request exists with valid token
- Token not expired (`token_expires_at > NOW()`)
- Status is `PENDING`

**Test Steps:**
1. Send `POST /api/v1/auth/verify-reset` with:
   ```json
   {
     "reset_token": "<valid_reset_token>",
     "new_password": "NewSecurePass123!"
   }
   ```

2. Verify response status: `200 OK`

3. Verify response body:
   ```json
   {
     "message": "Password reset successful",
     "user_id": "01ARZ3NDEKTSV4RRFFQ69G5FAV"
   }
   ```

4. Verify DB updates:
   - `user_data.users.password_hash` updated (new hash)
   - `user_data.password_reset_requests.status = 'USED'`
   - `user_data.password_reset_requests.used_at` set
   - `user_data.password_reset_requests.used_from_ip` set

5. Verify new password works:
   - Login with new password succeeds

**Expected Results:**
- ✅ Password reset successful
- ✅ Old password no longer works
- ✅ New password works
- ✅ Reset request marked as USED

**Evidence Required:**
- API response log
- DB queries showing updates
- Login test with new password

---

### 3.3 Expired Token (EMAIL)

**Test ID:** `AUTH-RESET-EMAIL-003`  
**Priority:** P0  
**Type:** Negative Test

**Preconditions:**
- Password reset request exists
- Token expired (`token_expires_at < NOW()`)

**Test Steps:**
1. Send `POST /api/v1/auth/verify-reset` with expired token

2. Verify response status: `400 Bad Request` or `410 Gone`

3. Verify response body:
   ```json
   {
     "error": "Reset token expired",
     "code": "RESET_TOKEN_EXPIRED"
   }
   ```

4. Verify DB:
   - `status` may be updated to `EXPIRED` (if auto-cleanup)
   - Password NOT updated

**Expected Results:**
- ✅ Expired token rejected
- ✅ Password not changed
- ✅ Clear error message

**Evidence Required:**
- API response log
- DB query showing expired status

---

### 3.4 Invalid Token (EMAIL)

**Test ID:** `AUTH-RESET-EMAIL-004`  
**Priority:** P0  
**Type:** Negative Test

**Test Steps:**
1. Send `POST /api/v1/auth/verify-reset` with:
   - Non-existent token
   - Already used token
   - Malformed token

2. Verify response status: `400 Bad Request` or `404 Not Found`

3. Verify generic error (no information leak)

**Expected Results:**
- ✅ Invalid token rejected
- ✅ No information about token validity leaked

---

### 3.5 Request Reset for Non-existent Email

**Test ID:** `AUTH-RESET-EMAIL-005`  
**Priority:** P1  
**Type:** Security Test

**Test Steps:**
1. Send `POST /api/v1/auth/reset-password` with:
   ```json
   {
     "method": "EMAIL",
     "email": "nonexistent@example.com"
   }
   ```

2. Verify response status: `200 OK` (same as valid email)

3. Verify generic success message (no user enumeration)

**Expected Results:**
- ✅ Same response as valid email (security best practice)
- ✅ No information leak about user existence
- ✅ No reset request created in DB

**Evidence Required:**
- API response log
- DB query confirming no record created

---

## 4. Password Reset Flow Tests (SMS)

### 4.1 Request Password Reset via SMS

**Test ID:** `AUTH-RESET-SMS-001`  
**Priority:** P1  
**Type:** Positive Test

**Preconditions:**
- User exists with verified phone `+12025551234`
- SMS service configured (Twilio/AWS SNS)

**Test Steps:**
1. Send `POST /api/v1/auth/reset-password` with:
   ```json
   {
     "method": "SMS",
     "phone": "+12025551234"
   }
   ```

2. Verify response status: `200 OK` or `202 Accepted`

3. Verify response body:
   ```json
   {
     "message": "Verification code sent",
     "method": "SMS",
     "sent_to": "+1***1234"  // Masked
   }
   ```

4. Verify DB record created:
   - `user_data.password_reset_requests` has new record
   - `method = 'SMS'`
   - `sent_to = '+12025551234'`
   - `verification_code` is 6 digits
   - `code_expires_at` is future timestamp (e.g., +10 minutes)
   - `attempts_count = 0`
   - `max_attempts = 3`
   - `status = 'PENDING'`

5. Verify SMS sent (if test environment allows)

**Expected Results:**
- ✅ Reset request created
- ✅ 6-digit code generated
- ✅ SMS sent (or queued)
- ✅ Response does not expose full phone number

**Evidence Required:**
- API response log
- DB query showing reset request record
- SMS delivery confirmation (if available)

---

### 4.2 Verify Password Reset with Valid Code (SMS)

**Test ID:** `AUTH-RESET-SMS-002`  
**Priority:** P1  
**Type:** Positive Test

**Preconditions:**
- Password reset request exists with valid code
- Code not expired (`code_expires_at > NOW()`)
- `attempts_count < max_attempts`

**Test Steps:**
1. Send `POST /api/v1/auth/verify-reset` with:
   ```json
   {
     "reset_token": "<reset_token>",
     "verification_code": "123456",
     "new_password": "NewSecurePass123!"
   }
   ```

2. Verify response status: `200 OK`

3. Verify password updated (same as EMAIL flow)

4. Verify DB:
   - `status = 'USED'`
   - `attempts_count` not incremented (success)

**Expected Results:**
- ✅ Password reset successful with valid code
- ✅ Reset request marked as USED

---

### 4.3 Invalid Code (SMS)

**Test ID:** `AUTH-RESET-SMS-003`  
**Priority:** P1  
**Type:** Negative Test

**Preconditions:**
- Password reset request exists with code `123456`

**Test Steps:**
1. Send `POST /api/v1/auth/verify-reset` with wrong code:
   ```json
   {
     "reset_token": "<reset_token>",
     "verification_code": "999999",
     "new_password": "NewSecurePass123!"
   }
   ```

2. Verify response status: `400 Bad Request`

3. Verify response body:
   ```json
   {
     "error": "Invalid verification code",
     "code": "RESET_INVALID_CODE",
     "attempts_remaining": 2
   }
   ```

4. Verify DB:
   - `attempts_count` incremented
   - `status` still `PENDING`
   - Password NOT updated

**Expected Results:**
- ✅ Invalid code rejected
- ✅ Attempts counter incremented
- ✅ Password not changed

**Evidence Required:**
- API response log
- DB query showing `attempts_count` increment

---

### 4.4 Too Many Attempts (SMS)

**Test ID:** `AUTH-RESET-SMS-004`  
**Priority:** P1  
**Type:** Negative Test

**Preconditions:**
- Password reset request exists
- `attempts_count = 2` (one attempt remaining)

**Test Steps:**
1. Send `POST /api/v1/auth/reset-password/verify` with wrong code (3rd attempt)

2. Verify response status: `400 Bad Request` or `429 Too Many Requests`

3. Verify response body:
   ```json
   {
     "error": "Too many attempts",
     "code": "RESET_TOO_MANY_ATTEMPTS"
   }
   ```

4. Verify DB:
   - `status = 'REVOKED'`
   - `attempts_count = 3`
   - Password NOT updated

5. Verify subsequent attempts fail even with correct code

**Expected Results:**
- ✅ Request revoked after max attempts
- ✅ No further attempts allowed
- ✅ Password not changed

**Evidence Required:**
- API response log
- DB query showing `REVOKED` status
- Attempt with correct code after revocation (should fail)

---

### 4.5 Expired Code (SMS)

**Test ID:** `AUTH-RESET-SMS-005`  
**Priority:** P1  
**Type:** Negative Test

**Preconditions:**
- Password reset request exists
- Code expired (`code_expires_at < NOW()`)

**Test Steps:**
1. Send `POST /api/v1/auth/reset-password/verify` with expired code

2. Verify response status: `400 Bad Request`

3. Verify error indicates code expiration

**Expected Results:**
- ✅ Expired code rejected
- ✅ Password not changed

---

## 5. API Keys CRUD Tests

### 5.1 Create API Key

**Test ID:** `AUTH-APIKEY-001`  
**Priority:** P1  
**Type:** Positive Test

**Preconditions:**
- User authenticated (valid JWT token)
- User ID: `user-uuid-123`

**Test Steps:**
1. Send `POST /api/v1/user/api-keys` with:
   ```json
   {
     "provider": "POLYGON",
     "provider_label": "Polygon - Primary",
     "api_key": "pk_live_1234567890abcdef",
     "api_secret": "sk_live_secret123456",
     "additional_config": {
       "rate_limit": 100
     }
   }
   ```

2. Verify response status: `201 Created`

3. Verify response body:
   ```json
   {
     "external_ulids": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
     "provider": "POLYGON",
     "provider_label": "Polygon - Primary",
     "masked_key": "********************",
     "is_active": true,
     "is_verified": false,
     "created_at": "2026-01-31T10:00:00Z"
   }
   ```

4. Verify DB record created:
   - `user_data.user_api_keys` has new record
   - `user_id` matches authenticated user
   - `api_key_encrypted` is encrypted (not plain text)
   - `api_secret_encrypted` is encrypted (not plain text)
   - `is_active = TRUE`
   - `is_verified = FALSE`

**Expected Results:**
- ✅ API key created
- ✅ Keys encrypted in DB
- ✅ Response shows masked keys
- ✅ No plain text keys in response

**Evidence Required:**
- API response log
- DB query showing encrypted fields
- Verification that plain text keys are NOT in DB

---

### 5.2 List API Keys

**Test ID:** `AUTH-APIKEY-002`  
**Priority:** P1  
**Type:** Positive Test

**Preconditions:**
- User has 3 API keys:
  - POLYGON (active)
  - IBKR (active)
  - YAHOO_FINANCE (inactive)

**Test Steps:**
1. Send `GET /api/v1/user/api-keys`

2. Verify response status: `200 OK`

3. Verify response body:
   ```json
   {
     [
       {
         "external_ulids": "01ARZ3NDEKTSV4RRFFQ69G5FAV",
         "provider": "POLYGON",
         "provider_label": "Polygon - Primary",
         "masked_key": "********************",
         "is_active": true,
         "is_verified": true,
         "last_verified_at": "2026-01-30T10:00:00Z"
       },
       {
         "external_ulids": "01ARZ3NDEKTSV4RRFFQ69G5FBW",
         "provider": "IBKR",
         "masked_key": "********************",
         "is_active": true,
         "is_verified": false
       }
     ]
   }
   ```

4. Verify:
   - Only user's own keys returned
   - All keys masked
   - Inactive keys included (or filtered based on query param)

**Expected Results:**
- ✅ User's keys returned
- ✅ Keys masked
- ✅ No plain text keys exposed

**Evidence Required:**
- API response log
- Verification of masking policy

---

### 5.3 Update API Key

**Test ID:** `AUTH-APIKEY-003`  
**Priority:** P1  
**Type:** Positive Test

**Preconditions:**
- API key exists with ID `key-uuid-123`
- User owns the key

**Test Steps:**
1. Send `PUT /api/v1/user/api-keys/key-uuid-123` with:
   ```json
   {
     "provider_label": "Polygon - Updated Label",
     "is_active": false
   }
   ```

2. Verify response status: `200 OK`

3. Verify DB updated:
   - `provider_label` updated
   - `is_active` updated
   - `updated_at` updated

**Expected Results:**
- ✅ Key metadata updated
- ✅ Keys remain encrypted
- ✅ Update timestamp set

**Evidence Required:**
- API response log
- DB query showing updates

---

### 5.4 Delete API Key

**Test ID:** `AUTH-APIKEY-004`  
**Priority:** P1  
**Type:** Positive Test

**Preconditions:**
- API key exists with ID `key-uuid-123`
- User owns the key

**Test Steps:**
1. Send `DELETE /api/v1/user/api-keys/key-uuid-123`

2. Verify response status: `204 No Content` or `200 OK`

3. Verify DB:
   - `deleted_at` set (soft delete)
   - OR record removed (hard delete, if policy)

4. Verify key no longer appears in list

**Expected Results:**
- ✅ Key deleted (soft or hard)
- ✅ Key not accessible after deletion

**Evidence Required:**
- API response log
- DB query showing deletion
- List API call confirming removal

---

### 5.5 Verify API Key

**Test ID:** `AUTH-APIKEY-005`  
**Priority:** P1  
**Type:** Positive Test

**Preconditions:**
- API key exists with valid credentials
- Provider API accessible (or mocked)

**Test Steps:**
1. Send `POST /api/v1/user/api-keys/key-uuid-123/verify`

2. Verify response status: `200 OK`

3. Verify response body:
   ```json
   {
     "verified": true,
     "last_verified_at": "2026-01-31T10:00:00Z"
   }
   ```

4. Verify DB:
   - `is_verified = TRUE`
   - `last_verified_at` updated
   - `verification_error = NULL`

**Expected Results:**
- ✅ Key verified against provider
- ✅ Verification status updated
- ✅ Timestamp recorded

**Evidence Required:**
- API response log
- DB query showing verification status

---

### 5.6 Verify API Key - Invalid Credentials

**Test ID:** `AUTH-APIKEY-006`  
**Priority:** P1  
**Type:** Negative Test

**Preconditions:**
- API key exists with invalid credentials

**Test Steps:**
1. Send `POST /api/v1/user/api-keys/key-uuid-123/verify`

2. Verify response status: `200 OK` (verification attempted)

3. Verify response body:
   ```json
   {
     "verified": false,
     "error": "Invalid API key",
     "last_verified_at": "2026-01-31T10:00:00Z"
   }
   ```

4. Verify DB:
   - `is_verified = FALSE`
   - `verification_error` contains error message

**Expected Results:**
- ✅ Invalid key detected
- ✅ Error message recorded
- ✅ Verification status updated

---

### 5.7 Create API Key - Duplicate Provider

**Test ID:** `AUTH-APIKEY-007`  
**Priority:** P1  
**Type:** Negative Test

**Preconditions:**
- User already has POLYGON key with label "Primary"

**Test Steps:**
1. Send `POST /api/v1/user/api-keys` with same provider and label

2. Verify response status: `409 Conflict` or `400 Bad Request`

3. Verify error indicates duplicate

**Expected Results:**
- ✅ Duplicate rejected
- ✅ Constraint `user_api_keys_unique_user_provider` enforced

---

## 6. Phone Verification Tests

### 6.1 Request Phone Verification

**Test ID:** `AUTH-PHONE-001`  
**Priority:** P1  
**Type:** Positive Test

**Preconditions:**
- User authenticated
- User has `phone_number = '+12025551234'`
- `phone_verified = FALSE`

**Test Steps:**
1. Send `POST /api/v1/auth/verify-phone` with:
   ```json
   {
     "verification_code": "123456"
   }
   ```
   Note: If no pending code exists, this endpoint will create a new reset request and send SMS code.

2. Verify response status: `200 OK`

3. Verify response body:
   ```json
   {
     "message": "Verification code sent",
     "code_expires_at": "2026-01-31T10:10:00Z"
   }
   ```

4. Verify SMS sent with 6-digit code

5. Verify code stored (in session/DB) for verification

**Expected Results:**
- ✅ Verification code sent
- ✅ Code expires in reasonable time (e.g., 10 minutes)

---

### 6.2 Verify Phone with Valid Code

**Test ID:** `AUTH-PHONE-002`  
**Priority:** P1  
**Type:** Positive Test

**Preconditions:**
- Phone verification code sent
- Code is `123456`
- Code not expired

**Test Steps:**
1. Send `POST /api/v1/auth/verify-phone` with:
   ```json
   {
     "verification_code": "123456"
   }
   ```

2. Verify response status: `200 OK`

3. Verify DB:
   - `user_data.users.phone_verified = TRUE`
   - `user_data.users.phone_verified_at` set

**Expected Results:**
- ✅ Phone verified
- ✅ Verification timestamp recorded

**Evidence Required:**
- API response log
- DB query showing verification status

---

### 6.3 Verify Phone with Invalid Code

**Test ID:** `AUTH-PHONE-003`  
**Priority:** P1  
**Type:** Negative Test

**Test Steps:**
1. Send `POST /api/v1/auth/verify-phone` with wrong code

2. Verify response status: `400 Bad Request`

3. Verify phone NOT verified in DB

**Expected Results:**
- ✅ Invalid code rejected
- ✅ Phone remains unverified

---

## 7. Error Scenarios

### 7.1 Invalid JWT Token Format

**Test ID:** `AUTH-ERROR-001`  
**Priority:** P0  
**Type:** Negative Test

**Test Steps:**
1. Send request with malformed token:
   - `Authorization: Bearer invalid-token`
   - `Authorization: Bearer eyJ.invalid`
   - Missing `Bearer` prefix

2. Verify response status: `401 Unauthorized`

3. Verify clear error message

**Expected Results:**
- ✅ Malformed tokens rejected
- ✅ Generic error (no stack trace in production)

---

### 7.2 Missing Authentication Header

**Test ID:** `AUTH-ERROR-002`  
**Priority:** P0  
**Type:** Negative Test

**Test Steps:**
1. Send `GET /api/v1/users/me` without `Authorization` header

2. Verify response status: `401 Unauthorized`

**Expected Results:**
- ✅ Unauthenticated requests rejected

---

### 7.3 Rate Limiting

**Test ID:** `AUTH-ERROR-003`  
**Priority:** P1  
**Type:** Security Test

**Test Steps:**
1. Send multiple login requests rapidly (e.g., 10 requests/second)

2. Verify rate limiting:
   - After threshold: `429 Too Many Requests`
   - `Retry-After` header present

**Expected Results:**
- ✅ Rate limiting enforced
- ✅ Clear retry information

---

### 7.4 SQL Injection Attempt

**Test ID:** `AUTH-ERROR-004`  
**Priority:** P0  
**Type:** Security Test

**Test Steps:**
1. Send login request with SQL injection payload:
   ```json
   {
     "email": "test@example.com' OR '1'='1",
     "password": "anything"
   }
   ```

2. Verify:
   - Request rejected or sanitized
   - No SQL error exposed
   - No unauthorized access

**Expected Results:**
- ✅ SQL injection prevented
- ✅ No SQL errors in response

---

### 7.5 XSS Attempt

**Test ID:** `AUTH-ERROR-005`  
**Priority:** P1  
**Type:** Security Test

**Test Steps:**
1. Send registration with XSS payload:
   ```json
   {
     "username": "<script>alert('XSS')</script>",
     "email": "test@example.com",
     "password": "SecurePass123!"
   }
   ```

2. Verify:
   - Input sanitized
   - No script execution
   - Data stored safely

**Expected Results:**
- ✅ XSS prevented
- ✅ Input sanitized

---

## 📊 Test Execution Summary

**Total Test Scenarios:** 47  
**P0 (Critical):** 20  
**P1 (Important):** 27

**Coverage:**
- ✅ Login Flow: 6 scenarios
- ✅ Register Flow: 6 scenarios
- ✅ Password Reset (EMAIL): 5 scenarios
- ✅ Password Reset (SMS): 5 scenarios
- ✅ API Keys CRUD: 7 scenarios
- ✅ Phone Verification: 3 scenarios
- ✅ Error Scenarios: 5 scenarios

---

## 📝 Notes

1. **Evidence Collection:** Each test must include:
   - API request/response logs
   - DB query results (where applicable)
   - Screenshots (for UI tests)
   - Performance metrics (response time, DB query time)

2. **Test Data:** Use dedicated test accounts/data:
   - Prefix: `test_` or `qa_`
   - Cleanup after test execution

3. **Environment:** Tests should run against:
   - Development environment (primary)
   - Staging environment (validation)

4. **Automation:** Consider automating these scenarios:
   - P0 scenarios (critical path)
   - Regression tests
   - Security tests

---

---

## 8. G-Bridge Validation Tests (UI/Frontend)

### 8.1 RTL Charter Compliance

**Test ID:** `AUTH-GBRIDGE-001`  
**Priority:** P0  
**Type:** Architecture Test

**Test Steps:**
1. Run G-Bridge emulator on HTML files:
   ```bash
   node "_COMMUNICATION/cursor_messages/HOENIX G-BRIDGE.js" [file_name.html]
   ```
2. Verify no physical properties found:
   - No `margin-left`, `margin-right`
   - No `padding-left`, `padding-right`
   - No `left:`, `right:`
3. Verify logical properties used:
   - `margin-inline-start`, `margin-inline-end`
   - `padding-inline-start`, `padding-inline-end`
   - `inset-inline-start`, `inset-inline-end`

**Expected Results:**
- ✅ G-Bridge status: APPROVED (green banner)
- ✅ No RTL violations

**Evidence Required:**
- G-Bridge output log
- Sandbox preview screenshot

---

### 8.2 LEGO System Compliance

**Test ID:** `AUTH-GBRIDGE-002`  
**Priority:** P0  
**Type:** Architecture Test

**Test Steps:**
1. Check HTML files for semantic tags
2. Verify no `class="section"` or `class="card"` divs
3. Verify use of `<tt-section>` tags instead

**Expected Results:**
- ✅ G-Bridge status: APPROVED
- ✅ Semantic tags used

---

### 8.3 DNA Variables Compliance

**Test ID:** `AUTH-GBRIDGE-003`  
**Priority:** P0  
**Type:** Architecture Test

**Test Steps:**
1. Check CSS files for hardcoded hex colors
2. Verify all colors use CSS variables (`var(--color-name)`)
3. Verify no hex colors except allowed ones:
   - `#26baac` (Phoenix brand)
   - `#dc2626` (Error)
   - `#f8fafc` (Background)
   - `#phoenix-root` (ID selector)
   - `#unified-header` (ID selector)

**Expected Results:**
- ✅ G-Bridge status: APPROVED
- ✅ All colors use CSS variables

---

### 8.4 Structural Integrity

**Test ID:** `AUTH-GBRIDGE-004`  
**Priority:** P0  
**Type:** Architecture Test

**Test Steps:**
1. Check `index.html` files for unified header
2. Verify header height: `158px`
3. Verify header z-index: `950`
4. Verify logo integrity

**Expected Results:**
- ✅ G-Bridge status: APPROVED
- ✅ Header structure correct

---

**Prepared by:** Team 50 (QA)  
**Status:** ✅ COMPLETED (Updated to match actual implementation)  
**Next:** Execute tests and collect evidence
