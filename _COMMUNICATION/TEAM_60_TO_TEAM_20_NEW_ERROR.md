# 🚨 Team 60 → Team 20: New Error After TIMESTAMPTZ Fix

**From:** Team 60 (DevOps & Platform)  
**To:** Team 20 (Backend), Team 10 (The Gateway)  
**Date:** 2026-01-31  
**Session:** SESSION_01  
**Priority:** 🔴 **URGENT - BLOCKING**

---

## 📋 Issue Summary

**Status:** ❌ **NEW ERROR IDENTIFIED**

After Team 20 fixed the `TIMESTAMPTZ` import error, a new error appeared during Backend startup.

---

## 🚨 Error Details

### **Error Message:**
```
sqlalchemy.exc.InvalidRequestError: Attribute name 'metadata' is reserved when using the Declarative API.
```

### **Location:**
- **File:** `api/models/identity.py`
- **Line:** 26 (in `class User(Base):`)

### **Root Cause:**
SQLAlchemy's Declarative API reserves the name `metadata` for internal use. Using `metadata` as a column name or attribute name causes this error.

---

## 🔍 Verification

### **TIMESTAMPTZ Fix:** ✅ **VERIFIED**
- ✅ No `TIMESTAMPTZ` found in `api/models/identity.py`
- ✅ No `TIMESTAMPTZ` found in `api/models/tokens.py`
- ✅ All replaced with `TIMESTAMP(timezone=True)`

### **New Error:** ❌ **BLOCKING**
- ❌ Backend cannot start
- ❌ Error occurs during model definition
- ❌ Process crashes immediately

---

## 📝 Required Fix

**Issue:** `metadata` is a reserved name in SQLAlchemy Declarative API

**Solution Options:**

1. **Rename the column/attribute:**
   - Change `metadata` to `user_metadata` or `profile_metadata`
   - Update all references in the codebase

2. **Use `__mapper_args__` if needed:**
   - For table-level metadata, use proper SQLAlchemy patterns

**Files to Fix:**
- `api/models/identity.py` - Line 102: `metadata: Mapped[dict]` in User class
- `api/models/identity.py` - Line 282: `metadata: Mapped[dict]` in UserApiKey class

**Required Change:**
- Rename `metadata` to `user_metadata` or `profile_metadata` or `api_key_metadata`
- Update all references in codebase

---

## 🔗 Related Information

**SQLAlchemy Documentation:**
- `metadata` is reserved for `MetaData` object
- Cannot be used as column name or mapped attribute

**Error Stack Trace:**
```
File "api/models/identity.py", line 26, in <module>
    class User(Base):
  ...
sqlalchemy.exc.InvalidRequestError: Attribute name 'metadata' is reserved when using the Declarative API.
```

---

## ✅ Next Steps

### **For Team 20:**
1. Find all uses of `metadata` as attribute/column name
2. Rename to non-reserved name (e.g., `user_metadata`, `profile_metadata`)
3. Update all references
4. Test Backend startup

### **For Team 60:**
- ⏸️ Waiting for Team 20 fix
- Will verify Backend startup after fix

---

**Prepared by:** Team 60 (DevOps & Platform)  
**Status:** 🔴 **BLOCKING_ERROR_IDENTIFIED**  
**Next:** Team 20 to fix `metadata` reserved name issue

---

**log_entry | Team 60 | NEW_ERROR_IDENTIFIED | METADATA_RESERVED | RED | 2026-01-31**
