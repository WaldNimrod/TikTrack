# ⚠️ הודעה: צוות 20 → צוות 10 (Missing Refresh Token Table)

**From:** Team 20 (Backend)  
**To:** Team 10 (The Gateway) - **Forward to Team 60**  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Phase 1.5  
**Subject:** MISSING_REFRESH_TOKEN_TABLE | Status: ⚠️ **INFRASTRUCTURE ISSUE**  
**Priority:** 🔴 **CRITICAL - BLOCKING LOGIN**

---

## ⚠️ הודעה חשובה

**Missing Database Table Blocks Login Endpoint**

Team 20 fixed the code issues (ULID conversion, password verification), but login endpoint is still blocked by **missing database table**: `user_data.user_refresh_tokens`.

**Status:** ⚠️ **INFRASTRUCTURE ISSUE** (Team 60 responsibility)

---

## 🔍 Problem Details

### **Error:**
```
relation "user_data.user_refresh_tokens" does not exist
```

**Location:** `api/services/auth.py:362` (refresh token storage step)

**SQL Query:**
```sql
INSERT INTO user_data.user_refresh_tokens 
(id, user_id, token_hash, jti, expires_at, revoked_at) 
VALUES (...)
```

---

## 📊 Login Flow Analysis

### **Current Status:**

1. ✅ **User Lookup:** **WORKS**
   - User found in database
   - Query executes successfully

2. ✅ **Password Verification:** **WORKS**
   - Password hash verification returns True
   - Bcrypt verification works correctly

3. ✅ **Token Creation:** **WORKS**
   - Access token created successfully
   - Refresh token created successfully

4. ❌ **Refresh Token Storage:** **FAILS**
   - Table `user_data.user_refresh_tokens` doesn't exist
   - Error caught and returns "Invalid credentials"

---

## 🔍 Backend Logs

```
INFO:api.services.auth:User found: nimrod, email: nimrod@mezoo.co, is_active: True
INFO:api.services.auth:Verifying password for user: nimrod
INFO:api.services.auth:Password verification result: True
ERROR: relation "user_data.user_refresh_tokens" does not exist
INFO:api.routers.auth:Login failed for user: nim*** (authentication error)
```

**Conclusion:**
- Login flow works correctly until refresh token storage
- Error is caught and returns generic "Invalid credentials" message
- Root cause: Missing database table (infrastructure issue)

---

## 📋 Required Actions

### **For Team 60 (DevOps):**

1. **Create Missing Table:** ⏸️ **REQUIRED**
   - Table: `user_data.user_refresh_tokens`
   - Schema: `user_data`
   - Structure: See `api/models/tokens.py` (UserRefreshToken model)

2. **Verify Table Structure:** ⏸️ **REQUIRED**
   - Match model definition in `api/models/tokens.py`
   - Verify schema name: `user_data`
   - Verify table name: `user_refresh_tokens`

3. **Test Table Access:** ⏸️ **REQUIRED**
   - Verify INSERT works
   - Verify SELECT works
   - Verify schema permissions

---

## 🔗 Related Documents

1. **Model Definition:** `api/models/tokens.py` (UserRefreshToken)
2. **Login Issue Fix:** `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_50_LOGIN_ISSUE_FIXED.md`
3. **Evidence Log:** `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_20_LOGIN_ISSUE_FIX.md`

---

## ✅ Sign-off

**Code Status:** ✅ **FIXED**  
**Infrastructure Status:** ⚠️ **BLOCKING**  
**Action Required:** Team 60 to create missing table  
**Priority:** 🔴 **CRITICAL**

---

**Team 20 (Backend)**  
**Date:** 2026-01-31  
**log_entry | Team 20 | MISSING_REFRESH_TOKEN_TABLE | INFRASTRUCTURE_ISSUE | TO_TEAM_10 | 2026-01-31**

---

**Status:** ⚠️ **INFRASTRUCTURE ISSUE - BLOCKING LOGIN**  
**Next Step:** Team 60 to create `user_data.user_refresh_tokens` table
