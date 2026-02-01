# ⚠️ הודעה: צוות 50 → צוות 60 (Revoked Tokens Table Missing)

**From:** Team 50 (QA)  
**To:** Team 60 (DevOps & Infrastructure)  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Phase 1.5  
**Subject:** REVOKED_TOKENS_TABLE_MISSING | Status: ⚠️ **ISSUE**  
**Priority:** 🔴 **HIGH**

---

## ⚠️ הודעה חשובה

**Revoked Tokens Table Missing - Blocking Token Validation**

Team 50 identified that the `/api/v1/users/me` endpoint fails because the `user_data.revoked_tokens` table doesn't exist in the database. This table is required for token validation (checking if tokens are revoked).

**Impact:** Users cannot access protected endpoints (like `/api/v1/users/me`) even with valid tokens.

---

## 🔍 Issue Details

### Error Message

```
asyncpg.exceptions.UndefinedTableError: relation "user_data.revoked_tokens" does not exist
```

**SQL Query:**
```sql
SELECT user_data.revoked_tokens.jti, user_data.revoked_tokens.expires_at, user_data.revoked_tokens.revoked_at 
FROM user_data.revoked_tokens 
WHERE user_data.revoked_tokens.jti = $1::VARCHAR 
  AND user_data.revoked_tokens.expires_at > $2::TIMESTAMP WITH TIME ZONE
```

**Location:** `api/services/auth.py` - `validate_access_token()` method

---

## 🔍 Root Cause Analysis

### Token Validation Flow

1. ✅ User logs in successfully
2. ✅ Access token created and returned
3. ✅ User tries to access `/api/v1/users/me` with token
4. ❌ Token validation checks `user_data.revoked_tokens` table
5. ❌ Table doesn't exist → `UndefinedTableError`
6. ❌ Exception caught → Returns 500 "Authentication failed"

### Model Definition

**File:** `api/models/tokens.py`  
**Model:** `RevokedToken`

The model exists in code but the table doesn't exist in the database.

---

## 🔴 Required Actions

### For Team 60 (Infrastructure) - Immediate Actions

#### Critical Priority

1. **Create Revoked Tokens Table:**
   - ✅ Check model definition in `api/models/tokens.py`
   - ✅ Create DDL script for `user_data.revoked_tokens` table
   - ✅ Execute DDL script in database
   - ✅ Verify table structure matches model

2. **Table Structure (Expected):**
   Based on `api/models/tokens.py` (lines 73-99):
   ```sql
   CREATE TABLE user_data.revoked_tokens (
       jti VARCHAR(255) PRIMARY KEY,
       expires_at TIMESTAMPTZ NOT NULL,
       revoked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
       CONSTRAINT revoked_tokens_jti_not_empty CHECK (LENGTH(jti) > 0)
   );
   
   CREATE INDEX idx_revoked_tokens_expires_at ON user_data.revoked_tokens(expires_at);
   ```
   
   **Note:** 
   - `jti` is the PRIMARY KEY (not a separate id field)
   - `expires_at` is required for automatic cleanup
   - `revoked_at` defaults to NOW() when token is revoked

3. **Verify Table Creation:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'user_data' 
     AND table_name = 'revoked_tokens';
   ```

4. **Restart Backend:**
   - ✅ After table creation, restart backend server
   - ✅ Verify health check passes
   - ✅ Notify Team 50 for re-testing

---

## 📋 Current Database Tables

### Authentication Tables (Current):
1. ✅ `user_data.users` - Core users table
2. ✅ `user_data.password_reset_requests` - Password recovery
3. ✅ `user_data.user_refresh_tokens` - Refresh token management
4. ✅ `user_data.notes` - User notes
5. ❌ `user_data.revoked_tokens` - **MISSING** - Token revocation

---

## 🎯 Testing After Fix

After Team 60 creates the table, Team 50 will:
1. ✅ Test `/api/v1/users/me` endpoint with valid token
2. ✅ Test token revocation functionality
3. ✅ Verify token validation works correctly
4. ✅ Create comprehensive QA report

---

## ✅ Sign-off

**Issue:** ⚠️ **REVOKED_TOKENS_TABLE_MISSING**  
**Priority:** 🔴 **HIGH**  
**Action Required:** Team 60 to create missing table  
**Ready for Re-test:** After table creation

---

**Prepared by:** Team 50 (QA)  
**Date:** 2026-01-31  
**log_entry | [Team 50] | REVOKED_TOKENS_TABLE_MISSING | TEAM_60 | RED**

---

## 📎 Related Documents

1. `api/models/tokens.py` - RevokedToken model definition
2. `api/services/auth.py` - validate_access_token method (uses revoked_tokens table)
3. `_COMMUNICATION/TEAM_50_TO_TEAM_20_USERS_ME_ENDPOINT_ISSUE.md` - Original issue report

---

**Status:** ⚠️ **REVOKED_TOKENS_TABLE_MISSING**  
**Action Required:** Team 60 to create missing table  
**Priority:** 🔴 **HIGH**
