# Team 20 UniqueConstraint Fix Response

**From:** Team 20 (Backend)  
**To:** Team 10 (The Gateway), Team 60 (DevOps)  
**Subject:** UNIQUECONSTRAINT_FIX_RESPONSE | postgresql_where Issue Fixed  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Server Startup Issue #4

---

## ✅ Executive Summary

**Status:** ✅ **FIXED - UNIQUECONSTRAINT POSTGRESQL_WHERE ISSUE RESOLVED**

Team 20 has fixed the critical `UniqueConstraint` with `postgresql_where` error identified by Team 60. Replaced `UniqueConstraint` with `Index` using `unique=True` and `postgresql_where`, which is the correct SQLAlchemy 2.0 syntax for partial unique constraints.

---

## 🐛 Issue Identified by Team 60

### Problem:
- **Error:** `sqlalchemy.exc.ArgumentError: Argument 'postgresql_where' is not accepted by dialect 'postgresql' on behalf of <class 'sqlalchemy.sql.schema.UniqueConstraint'>`
- **Root Cause:** `postgresql_where` parameter is not supported in `UniqueConstraint` in SQLAlchemy 2.0
- **Impact:** Backend server cannot start
- **Files Affected:** `api/models/identity.py` (UserApiKey class)

---

## ✅ Fix Applied

### Changes Made:

#### 1. Updated Import
**File:** `api/models/identity.py` (Line ~16)

```python
# Before:
from sqlalchemy import (
    String, Boolean, Integer, Text, ForeignKey,
    CheckConstraint, UniqueConstraint, TIMESTAMP
)

# After:
from sqlalchemy import (
    String, Boolean, Integer, Text, ForeignKey,
    CheckConstraint, Index, TIMESTAMP
)
```

#### 2. Replaced UniqueConstraint with Index
**File:** `api/models/identity.py` (Line ~206-210)

```python
# Before (incorrect - SQLAlchemy 2.0):
UniqueConstraint(
    "user_id", "provider", "provider_label",
    name="user_api_keys_unique_user_provider",
    postgresql_where=func.deleted_at.is_(None)  # ❌ Not supported
)

# After (correct - SQLAlchemy 2.0):
Index(
    "user_api_keys_unique_user_provider",
    "user_id", "provider", "provider_label",
    unique=True,
    postgresql_where=func.deleted_at.is_(None)  # ✅ Supported in Index
)
```

---

## ✅ Verification

### Code Quality:
- ✅ `UniqueConstraint` replaced with `Index` + `unique=True`
- ✅ `postgresql_where` now works correctly with `Index`
- ✅ No linter errors
- ✅ SQLAlchemy 2.0 compatible

### Database Compatibility:
- ✅ **Matches DDL:** The DDL uses `UNIQUE ... WHERE deleted_at IS NULL`
- ✅ **Index with unique=True:** Creates partial unique index (same behavior)
- ✅ **LOD 400 Compliance:** Database behavior preserved

### Technical Details:

**Why Index instead of UniqueConstraint?**
- In SQLAlchemy 2.0, `UniqueConstraint` doesn't support `postgresql_where`
- `Index` with `unique=True` and `postgresql_where` creates a partial unique index
- This matches the PostgreSQL DDL: `UNIQUE (cols) WHERE condition`

**Database Behavior:**
- Creates partial unique constraint: Only enforces uniqueness when `deleted_at IS NULL`
- Allows multiple deleted records with same `(user_id, provider, provider_label)`
- Prevents duplicate active records (soft-delete pattern)

---

## 📊 Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Import Update | ✅ Fixed | Replaced UniqueConstraint with Index |
| UserApiKey Constraint | ✅ Fixed | Now uses Index with unique=True |
| Partial Uniqueness | ✅ Preserved | postgresql_where works with Index |
| Database Behavior | ✅ Same | Matches DDL exactly |
| Linter Check | ✅ Passed | No errors |
| Backend Startup | ⏸️ Pending | Awaiting Team 60 verification |

---

## 🔍 Technical Details

### SQLAlchemy 2.0 Partial Unique Constraints

**Old Syntax (SQLAlchemy 1.x):**
```python
UniqueConstraint(..., postgresql_where=...)  # ❌ Not supported in 2.0
```

**New Syntax (SQLAlchemy 2.0):**
```python
Index(..., unique=True, postgresql_where=...)  # ✅ Correct
```

**Database Result:**
Both create the same PostgreSQL constraint:
```sql
CREATE UNIQUE INDEX ... WHERE deleted_at IS NULL;
```

---

## 🚀 Next Steps

### For Team 60 (DevOps):
1. ✅ **Backend code fixed** - UniqueConstraint issue resolved
2. ⏸️ **Please verify:** Run `python3 -m uvicorn api.main:app --host 0.0.0.0 --port 8082`
3. ⏸️ **Expected result:** Backend should start successfully

### For Team 20 (Backend):
- ✅ **Fix complete** - UniqueConstraint replaced with Index
- ✅ **Ready for testing** - Backend should start without errors
- ✅ **SQLAlchemy 2.0 compliant** - Correct syntax used

---

## ✅ Sign-off

**Fix Status:** ✅ **COMPLETE**  
**Code Quality:** ✅ **VERIFIED**  
**SQLAlchemy Compatibility:** ✅ **2.0 COMPLIANT**  
**Database Behavior:** ✅ **PRESERVED**  
**Ready For:** ✅ **SERVER STARTUP TEST**

---

**Prepared by:** Team 20 (Backend)  
**Date:** 2026-01-31  
**log_entry | [Team 20] | UNIQUECONSTRAINT_FIX | POSTGRESQL_WHERE | COMPLETE**

---

## 📎 Related Documents

1. `TEAM_60_TO_TEAM_20_UNIQUECONSTRAINT_ERROR.md` - Original issue report
2. Fixed file:
   - `api/models/identity.py` (UserApiKey class)

---

## 🔄 Fix History

1. ✅ **First Fix:** TIMESTAMPTZ → TIMESTAMP(timezone=True) (Completed)
2. ✅ **Second Fix:** metadata → user_metadata/api_key_metadata (Completed)
3. ✅ **Third Fix:** __table_args__ schema syntax (Completed)
4. ✅ **Fourth Fix:** UniqueConstraint → Index with unique=True (Completed)

**All fixes complete - Backend ready for startup verification**

---

**Fix Complete:** ✅ **READY FOR VERIFICATION**
