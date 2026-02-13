# ⚠️ הודעה: צוות 50 → צוות 20 (Users/Me Endpoint Issue)

**From:** Team 50 (QA)  
**To:** Team 20 (Backend)  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Phase 1.5  
**Subject:** USERS_ME_ENDPOINT_ISSUE | Status: ⚠️ **ISSUE**  
**Priority:** 🔴 **HIGH**

---

## ⚠️ הודעה חשובה

**Users/Me Endpoint Returns 500 Error**

Team 50 identified that the `/api/v1/users/me` endpoint returns `500 Internal Server Error` with "Authentication failed" message, even though login works correctly and returns valid access tokens.

**Impact:** Users cannot access their profile after login, even with valid tokens.

---

## 🔍 Issue Details

### Endpoint Test

**Request:**
```bash
GET /api/v1/users/me
Authorization: Bearer <access_token_from_login>
```

**Response:**
```json
{
    "detail": "Authentication failed"
}
```
**HTTP Status:** `500 Internal Server Error`

**Expected Response:**
```json
{
    "external_ulids": "43Z2Q6JVVY9TNTS7ZV5S5W7V99",
    "email": "nimrod@mezoo.co",
    "username": "nimrod",
    "role": "SUPERADMIN"
}
```
**Expected HTTP Status:** `200 OK`

---

## 🔍 Root Cause Analysis

### Code Location

**File:** `api/utils/dependencies.py`  
**Function:** `get_current_user()` (lines 22-90)

**Error Handling:**
```python
except Exception as e:
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Authentication failed"
    )
```

**Analysis:**
- Generic exception handler catches all exceptions
- Returns generic "Authentication failed" message
- Masks the real error

### Possible Root Causes

1. **ULID to UUID Conversion Issue:**
   - `ulid_to_uuid()` function may fail
   - ULID format from token may not match expected format
   - Conversion logic may have bugs

2. **Token Validation Issue:**
   - `validate_access_token()` may fail
   - Token payload may not contain expected claims
   - Token format may be incorrect

3. **User Lookup Issue:**
   - Database query may fail
   - User UUID may not match database ID
   - Schema/table name mismatch

---

## 🔴 Required Actions

### For Team 20 (Backend) - Immediate Actions

#### Critical Priority

1. **Add Detailed Error Logging:**
   ```python
   # In get_current_user():
   except Exception as e:
       logger.error(f"Authentication error: {type(e).__name__}: {str(e)}", exc_info=True)
       raise HTTPException(
           status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
           detail="Authentication failed"
       )
   ```

2. **Debug Token Validation:**
   - ✅ Log token payload after validation
   - ✅ Log ULID extraction from token
   - ✅ Log UUID conversion result
   - ✅ Log user lookup query result

3. **Fix ULID to UUID Conversion:** ✅ **CRITICAL**
   ```python
   # Current code (WRONG):
   ulid = ULID.from_str(ulid_string)  # ❌ AttributeError
   return ulid.to_uuid()
   
   # Should be (CORRECT):
   ulid_obj = ulid.parse(ulid_string)  # ✅ Use module function
   return ulid_obj.to_uuid()
   ```
   
   **File:** `api/utils/identity.py` (line 66)
   **Issue:** Same as `uuid_to_ulid()` - using class method instead of module function

4. **Check Token Payload:**
   - ✅ Verify token contains "sub" claim with ULID
   - ✅ Verify ULID format is correct (26 characters)
   - ✅ Verify ULID matches user's external_ulids

5. **Review `ulid_to_uuid()` Function:**
   - ✅ Check `api/utils/identity.py` (lines 46-67)
   - ✅ Verify `ULID.from_str()` works correctly
   - ✅ Verify `ulid.to_uuid()` works correctly

---

## 📋 Testing Steps

### Step 1: Get Access Token
```bash
curl -X POST http://localhost:8082/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"nimrod","password":"4181"}'
```

**Expected:** Access token returned

### Step 2: Use Token for Users/Me
```bash
curl -X GET http://localhost:8082/api/v1/users/me \
  -H "Authorization: Bearer <access_token>"
```

**Current Result:** `500 Internal Server Error`  
**Expected Result:** `200 OK` with user data

---

## 🎯 Expected Fix

### Fix Code

**File:** `api/utils/identity.py` (line 66)

**Current Code (WRONG):**
```python
def ulid_to_uuid(ulid_string: Optional[str]) -> Optional[uuid.UUID]:
    if ulid_string is None:
        return None
    
    # Parse ULID and convert to UUID
    ulid = ULID.from_str(ulid_string)  # ❌ AttributeError
    return ulid.to_uuid()  # ❌ AttributeError
```

**Fixed Code (CORRECT):**
```python
def ulid_to_uuid(ulid_string: Optional[str]) -> Optional[uuid.UUID]:
    if ulid_string is None:
        return None
    
    # Parse ULID and convert to UUID
    ulid_obj = ulid.parse(ulid_string)  # ✅ Use module function
    return ulid_obj.uuid  # ✅ Use uuid attribute (not method)
```

**Changes:**
1. Change `ULID.from_str()` to `ulid.parse()` (module function)
2. Change `ulid.to_uuid()` to `ulid.uuid` (attribute, not method)

---

### Expected Results After Fix

After fix, the endpoint should:
- ✅ Return `200 OK` for valid tokens
- ✅ Return user data in correct format
- ✅ Handle invalid tokens with `401 Unauthorized`
- ✅ Provide detailed error messages in logs (not in response)

---

## 📋 Testing After Fix

After Team 20 fixes the issue, Team 50 will:
1. ✅ Test `/api/v1/users/me` with valid token
2. ✅ Test `/api/v1/users/me` with invalid token
3. ✅ Test `/api/v1/users/me` with expired token
4. ✅ Verify error messages are appropriate

---

## ✅ Sign-off

**Issue:** ⚠️ **USERS/ME ENDPOINT FAILING**  
**Priority:** 🔴 **HIGH**  
**Action Required:** Team 20 to debug and fix  
**Ready for Re-test:** After fix

---

**Prepared by:** Team 50 (QA)  
**Date:** 2026-01-31  
**log_entry | [Team 50] | USERS_ME_ENDPOINT_ISSUE | TEAM_20 | RED**

---

## 📎 Related Documents

1. `documentation/05-REPORTS/artifacts_SESSION_01/TEAM_50_LOGIN_FIX_VERIFICATION_COMPLETE.md` - Login verification report
2. `api/utils/dependencies.py` - get_current_user function (lines 22-90)
3. `api/utils/identity.py` - ulid_to_uuid function (lines 46-67)
4. `api/routers/users.py` - /users/me endpoint (lines 34-44)

---

**Status:** ⚠️ **USERS/ME ENDPOINT FAILING**  
**Action Required:** Team 20 to debug and fix  
**Priority:** 🔴 **HIGH**
