# 📋 הודעה: צוות 20 → צוות 10 (Refresh Token Table DDL)

**From:** Team 20 (Backend)  
**To:** Team 10 (The Gateway) - **Forward to Team 60**  
**Date:** 2026-01-31  
**Session:** SESSION_01 - Phase 1.5  
**Subject:** REFRESH_TOKEN_TABLE_DDL | Status: 📋 **DDL PROVIDED**  
**Priority:** 🔴 **CRITICAL - BLOCKING LOGIN**

---

## 📋 DDL for Missing Table

**Table:** `user_data.user_refresh_tokens`

Team 20 provides the DDL statement for the missing table based on the model definition in `api/models/tokens.py`.

---

## 🔧 SQL DDL Statement

```sql
-- Create user_refresh_tokens table in user_data schema
CREATE TABLE IF NOT EXISTS user_data.user_refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    jti VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT user_refresh_tokens_jti_not_empty CHECK (LENGTH(jti) > 0),
    CONSTRAINT user_refresh_tokens_hash_not_empty CHECK (LENGTH(token_hash) > 0)
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_refresh_tokens_user_id 
    ON user_data.user_refresh_tokens(user_id);

-- Create index on jti for faster token lookups
CREATE INDEX IF NOT EXISTS idx_user_refresh_tokens_jti 
    ON user_data.user_refresh_tokens(jti);

-- Create index on expires_at for cleanup queries
CREATE INDEX IF NOT EXISTS idx_user_refresh_tokens_expires_at 
    ON user_data.user_refresh_tokens(expires_at);
```

---

## 📊 Table Structure

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `user_id` | UUID | NO | - | Foreign key to `user_data.users.id` |
| `token_hash` | VARCHAR(255) | NO | - | SHA-256 hash of refresh token |
| `jti` | VARCHAR(255) | NO | - | JWT ID (unique) |
| `expires_at` | TIMESTAMPTZ | NO | - | Token expiration timestamp |
| `revoked_at` | TIMESTAMPTZ | YES | - | Token revocation timestamp (NULL if active) |
| `created_at` | TIMESTAMPTZ | NO | `NOW()` | Record creation timestamp |

---

## ✅ Verification Steps

After creating the table, Team 60 should verify:

1. **Table Exists:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'user_data' 
     AND table_name = 'user_refresh_tokens';
   ```

2. **Schema Correct:**
   ```sql
   SELECT column_name, data_type, is_nullable, column_default
   FROM information_schema.columns
   WHERE table_schema = 'user_data' 
     AND table_name = 'user_refresh_tokens'
   ORDER BY ordinal_position;
   ```

3. **Foreign Key Exists:**
   ```sql
   SELECT constraint_name, constraint_type
   FROM information_schema.table_constraints
   WHERE table_schema = 'user_data' 
     AND table_name = 'user_refresh_tokens';
   ```

4. **Indexes Created:**
   ```sql
   SELECT indexname, indexdef
   FROM pg_indexes
   WHERE schemaname = 'user_data' 
     AND tablename = 'user_refresh_tokens';
   ```

---

## 🎯 After Table Creation

### **For Team 60:**
1. ✅ Create table using DDL above
2. ✅ Verify table structure matches model
3. ✅ Test INSERT/SELECT operations
4. ✅ Notify Team 10 when complete

### **For Team 20:**
- ⏸️ **READY:** Code is already fixed and ready
- ⏸️ **PENDING:** Will verify login endpoint after table creation

### **For Team 50:**
- ⏸️ **READY:** Can test login endpoint immediately after table creation
- ⏸️ **NO CODE CHANGES NEEDED:** Backend code is ready

---

## 📋 Important Notes

1. **No Code Changes Required:**
   - Backend code is already fixed and ready
   - No need to return to Team 20 before testing

2. **Server Restart:**
   - After table creation, backend server should be restarted
   - This ensures database connection picks up the new table

3. **Testing:**
   - Team 50 can test login endpoint immediately after table creation
   - No code review needed - changes are infrastructure only

---

## 🔗 Related Documents

1. **Model Definition:** `api/models/tokens.py` (UserRefreshToken)
2. **Missing Table Issue:** `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_10_MISSING_REFRESH_TOKEN_TABLE.md`
3. **Login Fix:** `_COMMUNICATION/team_20/TEAM_20_TO_TEAM_50_LOGIN_ISSUE_FIXED.md`

---

## ✅ Sign-off

**DDL Provided:** ✅ **YES**  
**Code Status:** ✅ **READY**  
**Testing:** ✅ **READY AFTER TABLE CREATION**  
**Code Changes Needed:** ✅ **NO**

---

**Team 20 (Backend)**  
**Date:** 2026-01-31  
**log_entry | Team 20 | REFRESH_TOKEN_TABLE_DDL | PROVIDED | TO_TEAM_10 | 2026-01-31**

---

**Status:** 📋 **DDL PROVIDED - READY FOR TABLE CREATION**  
**Next Step:** Team 60 to create table, then Team 50 can test immediately
