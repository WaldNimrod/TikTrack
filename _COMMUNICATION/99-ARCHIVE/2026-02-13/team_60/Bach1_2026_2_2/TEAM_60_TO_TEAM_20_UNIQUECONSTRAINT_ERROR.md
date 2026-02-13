# 🚨 Team 60 → Team 20: New Error - UniqueConstraint postgresql_where Issue

**From:** Team 60 (DevOps & Platform)  
**To:** Team 20 (Backend), Team 10 (The Gateway)  
**Date:** 2026-01-31  
**Session:** SESSION_01  
**Priority:** 🔴 **URGENT - BLOCKING**

---

## 📋 Issue Summary

**Status:** ❌ **NEW ERROR IDENTIFIED**

After Team 20 fixed the `__table_args__` schema syntax issue, a new error appeared related to `UniqueConstraint` with `postgresql_where` parameter.

---

## 🚨 Error Details

### **Error Message:**
```
sqlalchemy.exc.ArgumentError: Argument 'postgresql_where' is not accepted by dialect 'postgresql' on behalf of <class 'sqlalchemy.sql.schema.UniqueConstraint'>
```

### **Location:**
- **File:** `api/models/identity.py`
- **Line:** 206-210 (in `class UserApiKey(Base):` `__table_args__`)

### **Root Cause:**
`postgresql_where` parameter is not supported in `UniqueConstraint` in SQLAlchemy 2.0. This parameter was deprecated/removed.

---

## 🔍 Current Code (Problematic)

**File:** `api/models/identity.py` (Lines 206-210)

```python
UniqueConstraint(
    "user_id", "provider", "provider_label",
    name="user_api_keys_unique_user_provider",
    postgresql_where=func.deleted_at.is_(None)  # ❌ Not supported in SQLAlchemy 2.0
)
```

**Problem:** `postgresql_where` is not a valid parameter for `UniqueConstraint` in SQLAlchemy 2.0.

---

## 📝 Required Fix

### **Option 1: Use Index with unique=True (Recommended)**

For partial unique constraints (with WHERE clause), use `Index` instead:

```python
from sqlalchemy import Index

__table_args__ = (
    Index(
        "user_api_keys_unique_user_provider",
        "user_id", "provider", "provider_label",
        unique=True,
        postgresql_where=func.deleted_at.is_(None)
    ),
    CheckConstraint(...),
    {"schema": "user_data"},
)
```

### **Option 2: Remove postgresql_where (Simpler)**

If partial uniqueness is not critical, remove the `postgresql_where`:

```python
UniqueConstraint(
    "user_id", "provider", "provider_label",
    name="user_api_keys_unique_user_provider"
)
```

### **Option 3: Use Exclude Constraint (PostgreSQL-specific)**

For partial unique constraints in PostgreSQL, use `ExcludeConstraint`:

```python
from sqlalchemy.dialects.postgresql import ExcludeConstraint

__table_args__ = (
    ExcludeConstraint(
        ("user_id", "="),
        ("provider", "="),
        ("provider_label", "="),
        where=func.deleted_at.is_(None),
        name="user_api_keys_unique_user_provider"
    ),
    CheckConstraint(...),
    {"schema": "user_data"},
)
```

**Note:** This is more complex and PostgreSQL-specific.

---

## 🔗 SQLAlchemy 2.0 Documentation

**UniqueConstraint Changes:**
- `postgresql_where` parameter removed from `UniqueConstraint`
- For partial unique constraints, use `Index` with `unique=True` and `postgresql_where`
- Or use database-level partial unique indexes

---

## ✅ Verification

**Previous Fixes:** ✅ **VERIFIED**
- ✅ `__table_args__` schema syntax fixed (dictionary at end)
- ✅ `TIMESTAMPTZ` replaced with `TIMESTAMP(timezone=True)`
- ✅ `metadata` renamed to `user_metadata`/`api_key_metadata`

**New Error:** ❌ **BLOCKING**
- ❌ Backend cannot start
- ❌ Error occurs during `UserApiKey` model definition
- ❌ Process crashes immediately

---

## 📝 Required Actions

**For Team 20:**
1. Fix `UniqueConstraint` in `api/models/identity.py` (UserApiKey class)
2. Replace with `Index` with `unique=True` and `postgresql_where` (Option 1 - Recommended)
3. Or remove `postgresql_where` if partial uniqueness not needed (Option 2)
4. Test Backend startup

**Files to Check:**
- `api/models/identity.py` - Line 206-210 (UserApiKey class)

---

## 🚨 Impact

**Current Status:**
- ❌ Backend cannot start
- ❌ All API endpoints unavailable
- ❌ Frontend cannot connect to Backend
- ⏸️ Development blocked

**After Fix:**
- ✅ Backend should start successfully
- ✅ Health check should work
- ✅ API endpoints available

---

**Prepared by:** Team 60 (DevOps & Platform)  
**Status:** 🔴 **BLOCKING_ERROR_IDENTIFIED**  
**Next:** Team 20 to fix `UniqueConstraint` `postgresql_where` issue

---

**log_entry | Team 60 | NEW_ERROR_IDENTIFIED | UNIQUECONSTRAINT_POSTGRESQL_WHERE | RED | 2026-01-31**
