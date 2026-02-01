# ⚠️ הודעה: צוות 50 → צוות 20 (Login Invalid Credentials Issue)

**From:** Team 50 (QA)  
**To:** Team 20 (Backend)  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Phase 1.5  
**Subject:** LOGIN_INVALID_CREDENTIALS_ISSUE | Status: ⚠️ **ISSUE**  
**Priority:** 🔴 **HIGH**

---

## ⚠️ הודעה חשובה

**Login Endpoint Returns "Invalid credentials" for Existing Users**

Team 50 verified that the Passlib/Bcrypt fix was implemented correctly. However, login endpoint returns "Invalid credentials" for existing users (nimrod, nimrod@mezoo.co, nimrod_wald) even though:
- ✅ Password hash verification works correctly (tested directly with bcrypt.checkpw)
- ✅ Database connection works
- ✅ Backend is operational

**Analysis:** The issue is NOT with password hash verification. The problem must be elsewhere (user lookup, database query, or other authentication logic).

---

## 🔍 Test Results

### Login Endpoint Tests

**All Test Cases Failed:**

1. **Login with Username (Primary Admin):**
   ```bash
   POST /api/v1/auth/login
   {"username_or_email":"nimrod","password":"4181"}
   ```
   **Result:** `{"detail": "Invalid credentials"}` (401)

2. **Login with Email (Primary Admin):**
   ```bash
   POST /api/v1/auth/login
   {"username_or_email":"nimrod@mezoo.co","password":"4181"}
   ```
   **Result:** `{"detail": "Invalid credentials"}` (401)

3. **Login with Secondary Admin:**
   ```bash
   POST /api/v1/auth/login
   {"username_or_email":"nimrod_wald","password":"4181"}
   ```
   **Result:** `{"detail": "Invalid credentials"}` (401)

---

### Password Hash Verification Test ✅ WORKS

**Direct Test:**
```python
import bcrypt
hash = "$2b$12$2ZlMcAQvc63M5UudvUzUM.gYjOXCIGrRUwHQZ0BgWqcAP8an.qQtG"
result = bcrypt.checkpw("4181".encode('utf-8'), hash.encode('utf-8'))
# Result: True ✅
```

**Conclusion:** Password hash verification works correctly. The issue is NOT with bcrypt.

---

## 🔍 Possible Root Causes

1. **User Not Found in Database:**
   - ⚠️ Backend query may not find users in `user_data.users` table
   - ⚠️ Schema mismatch (backend expects `user_data.users`, but users may be in different schema/table)
   - ⚠️ User lookup query may have issues (username/email matching)

2. **Database Query Issue:**
   - ⚠️ SQLAlchemy query may not be executing correctly
   - ⚠️ Schema name `user_data` may not be accessible
   - ⚠️ User model may not be mapping to correct table

3. **Backend Logging:**
   - ⚠️ Need backend logs to see what's happening during login
   - ⚠️ Need to verify user lookup query results
   - ⚠️ Need to verify password verification step

---

## 🔴 Required Actions

### For Team 20 (Backend) - Immediate Actions

#### Critical Priority

1. **Check Backend Logs:**
   - ✅ Enable debug logging for login endpoint
   - ✅ Check if user lookup query finds users
   - ✅ Check if password verification is called
   - ✅ Check if password verification returns True/False

2. **Verify Database Query:**
   - ✅ Test user lookup query directly in database:
     ```sql
     SELECT * FROM user_data.users 
     WHERE username = 'nimrod' OR email = 'nimrod@mezoo.co';
     ```
   - ✅ Verify users exist in `user_data.users` table
   - ✅ Verify username/email matching works

3. **Debug Login Flow:**
   - ✅ Add detailed logging to login method (`api/services/auth.py`, lines 264-326)
   - ✅ Log user lookup results
   - ✅ Log password verification results
   - ✅ Log any exceptions during login

4. **Verify User Model:**
   - ✅ Check if User model maps to correct table (`user_data.users`)
   - ✅ Verify schema name is correct (`{"schema": "user_data"}`)
   - ✅ Verify table structure matches model

---

## 📋 Expected Login Flow

According to `api/services/auth.py` (lines 264-326):

1. **User Lookup:**
   ```python
   stmt = select(User).where(
       (User.username == username_or_email) | (User.email == username_or_email)
   ).where(User.deleted_at.is_(None))
   result = await db.execute(stmt)
   user = result.scalar_one_or_none()
   ```

2. **Password Verification:**
   ```python
   password_valid = self.verify_password(password, user.password_hash)
   ```

3. **Expected Result:**
   - ✅ User found in database
   - ✅ Password verification returns True
   - ✅ Tokens created and returned

---

## 🎯 Testing After Fix

After Team 20 fixes the login issue, Team 50 will:
1. ✅ Test login endpoint with all test cases
2. ✅ Test registration endpoint
3. ✅ Test token verification
4. ✅ Create comprehensive QA report

---

## ✅ Sign-off

**Code Fix:** ✅ **VERIFIED**  
**Password Hash Verification:** ✅ **WORKS**  
**Login Endpoint:** ⚠️ **FAILING**  
**Action Required:** Team 20 to debug login endpoint  
**Ready for Re-test:** After login endpoint fix

---

**Prepared by:** Team 50 (QA)  
**Date:** 2026-01-31  
**log_entry | [Team 50] | LOGIN_INVALID_CREDENTIALS_ISSUE | TEAM_20 | RED**

---

## 📎 Related Documents

1. `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_PASSLIB_BCRYPT_QA_RESULTS.md` - Detailed QA report
2. `api/services/auth.py` - Login method (lines 264-326)
3. `api/models/identity.py` - User model (schema: `user_data.users`)
4. `_COMMUNICATION/TEAM_60_TO_TEAM_10_DATABASE_USERS_CREATED.md` - Database users reference

---

**Status:** ⚠️ **LOGIN ENDPOINT FAILING**  
**Action Required:** Team 20 to debug login endpoint  
**Password Hash Verification:** ✅ **WORKS** (not the issue)
