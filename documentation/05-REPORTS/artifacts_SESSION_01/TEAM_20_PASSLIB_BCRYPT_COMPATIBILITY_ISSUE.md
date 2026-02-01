# Team 20 - Passlib/Bcrypt Compatibility Issue Evidence Log

**Date:** 2026-01-31  
**Session:** SESSION_01 - Phase 1.5  
**Issue Type:** 🔴 **CRITICAL - DEPENDENCY COMPATIBILITY**  
**Status:** 🔴 **BLOCKING - AWAITING ARCHITECTURAL DECISION**

---

## 🔴 Problem Summary

**Login endpoint fails completely** due to `passlib` 1.7.4 incompatibility with `bcrypt` 5.0.0.

**Symptom:**
- All login attempts return "Invalid credentials" (even with correct credentials)
- Password verification fails even with correct hash
- User exists in database with correct password hash

**Root Cause:**
```
AttributeError: module 'bcrypt' has no attribute '__about__'
ValueError: password cannot be longer than 72 bytes, truncate manually if necessary
```

---

## 📊 Evidence

### 1. Dependency Versions
```bash
$ pip show passlib bcrypt
Name: passlib
Version: 1.7.4  # Last release: 2020 (unmaintained)

Name: bcrypt
Version: 5.0.0  # Current recommended version
```

### 2. User Exists in Database ✅
```python
User found: nimrod, email: nimrod@mezoo.co
Password hash: $2b$12$2ZlMcAQvc63M5UudvUzUM.gYjOXCIGrRUwHQZ0BgWqc...
Is active: True
Role: SUPERADMIN
```

### 3. Direct Bcrypt Verification Works ✅
```python
import bcrypt
hash_from_db = "$2b$12$2ZlMcAQvc63M5UudvUzUM.gYjOXCIGrRUwHQZ0BgWqc..."
bcrypt.checkpw("4181".encode(), hash_from_db.encode())
# Returns: True ✅
```

### 4. Passlib Verification Fails ❌
```python
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
pwd_context.verify("4181", hash_from_db)
# Error: AttributeError: module 'bcrypt' has no attribute '__about__'
```

### 5. Login Endpoint Fails ❌
```bash
$ curl -X POST http://localhost:8082/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username_or_email":"nimrod","password":"4181"}'

Response: {"detail":"Invalid credentials"}
Status: 401 Unauthorized
```

**Backend Logs:**
```
INFO:api.routers.auth:Login attempt started for: nim***
INFO:api.routers.auth:Login failed for user: nim*** (authentication error)
INFO:     127.0.0.1:62261 - "POST /api/v1/auth/login HTTP/1.1" 401 Unauthorized
```

---

## 🔍 Root Cause Analysis

### **Technical Details:**

1. **Passlib 1.7.4 (2020) - Unmaintained:**
   - Last release: 2020
   - Not compatible with bcrypt 5.0.0
   - Tries to access `bcrypt.__about__.__version__` which doesn't exist in bcrypt 5.0.0

2. **Bcrypt 5.0.0 (Current):**
   - Recommended version
   - Security updates
   - Different internal structure (no `__about__` module)

3. **Impact:**
   - `pwd_context.verify()` fails silently
   - `pwd_context.hash()` may also fail
   - All authentication fails

---

## 💡 Proposed Solution

### **Option: Replace Passlib with Direct Bcrypt Usage**

**Changes Required:**

1. **Remove from `requirements.txt`:**
   ```diff
   - passlib[bcrypt]>=1.7.4
   ```

2. **Update `api/services/auth.py`:**
   ```python
   # Before:
   from passlib.context import CryptContext
   pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
   
   # After:
   import bcrypt
   
   @staticmethod
   def hash_password(password: str) -> str:
       """Hash a password using bcrypt."""
       salt = bcrypt.gensalt()
       hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
       return hashed.decode('utf-8')
   
   @staticmethod
   def verify_password(plain_password: str, hashed_password: str) -> bool:
       """Verify a password against a hash using bcrypt."""
       try:
           return bcrypt.checkpw(
               plain_password.encode('utf-8'),
               hashed_password.encode('utf-8')
           )
       except Exception:
           return False
   ```

**Benefits:**
- ✅ Compatible with bcrypt 5.0.0
- ✅ Simpler (less abstraction)
- ✅ Actively maintained
- ✅ Same API (bcrypt.checkpw / bcrypt.hashpw)
- ✅ Minimal code changes (only 2 functions)

**Code Locations:**
- `api/services/auth.py:36` - Remove `pwd_context` initialization
- `api/services/auth.py:84` - Replace `hash_password()` implementation
- `api/services/auth.py:98` - Replace `verify_password()` implementation

---

## 📋 Impact Analysis

### **Before Fix:**
- ❌ Login endpoint: 0% success rate
- ❌ Registration endpoint: Password hashing fails
- ❌ All authentication: Complete failure

### **After Fix:**
- ✅ Login endpoint: Works correctly
- ✅ Registration endpoint: Works correctly
- ✅ Password verification: Works correctly

---

## 🎯 Required Actions

### **For Team 10 (The Gateway):**
1. 🔴 **URGENT:** Architectural decision - Approve replacement of passlib with direct bcrypt?
2. 🔴 **URGENT:** If approved - Team 20 will implement immediately

### **For Team 20 (Backend):**
1. ⏸️ **Awaiting:** Approval from Team 10
2. ✅ **Ready:** Implementation ready (2 functions, 1 dependency change)

---

## ✅ Sign-off

**Issue Type:** 🔴 **CRITICAL - DEPENDENCY COMPATIBILITY**  
**Blocking:** ✅ **YES** (Login completely broken)  
**Solution:** ✅ **IDENTIFIED** (Replace passlib with direct bcrypt)  
**Action Required:** ✅ **ARCHITECTURAL DECISION**  
**Ready for Fix:** ✅ **YES** (After approval)

---

**Team 20 (Backend)**  
**Status:** 🔴 **BLOCKED - AWAITING ARCHITECTURAL DECISION**

---

**log_entry | Team 20 | CRITICAL_ISSUE_PASSLIB_BCRYPT | EVIDENCE_LOG | RED | 2026-01-31**
