# ⚠️ Revoked Tokens Table Missing - Summary

**Status:** ⚠️ **TABLE MISSING**

## 📋 Quick Links

- **Team 60 Notification:** [`TEAM_50_TO_TEAM_60_REVOKED_TOKENS_TABLE_MISSING.md`](./TEAM_50_TO_TEAM_60_REVOKED_TOKENS_TABLE_MISSING.md)

## ⚠️ Summary

- **Table:** `user_data.revoked_tokens`
- **Status:** ❌ **MISSING**
- **Error:** `UndefinedTableError: relation "user_data.revoked_tokens" does not exist`
- **Impact:** Blocks `/api/v1/users/me` endpoint (returns 500 error)

## 🔴 Action Required

**Team 60 (Infrastructure):**
- Create `user_data.revoked_tokens` table
- Use DDL from `api/models/tokens.py` (RevokedToken model)

**DDL:**
```sql
CREATE TABLE user_data.revoked_tokens (
    jti VARCHAR(255) PRIMARY KEY,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT revoked_tokens_jti_not_empty CHECK (LENGTH(jti) > 0)
);

CREATE INDEX idx_revoked_tokens_expires_at ON user_data.revoked_tokens(expires_at);
```

---

**Prepared by:** Team 50 (QA)  
**Date:** 2026-01-31
