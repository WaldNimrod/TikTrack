-- ============================================================================
-- TikTrack Phoenix V2.5 - Refresh Tokens & Token Blacklist Tables
-- Team: 20 (Backend)
-- Date: 2026-01-31
-- Status: ✅ APPROVED - Ready for Integration
-- Source: Architectural Answer + GIN-2026-008 (Appendix A)
-- ============================================================================
-- 
-- This migration adds refresh token management and token blacklist functionality.
-- To be integrated into: PHX_DB_SCHEMA_V2.5_FULL_DDL.sql
-- 
-- ============================================================================

BEGIN;

-- ============================================================================
-- Table: user_data.user_refresh_tokens
-- ============================================================================
-- Stores refresh tokens for JWT authentication.
-- Supports refresh token rotation and revocation.

CREATE TABLE IF NOT EXISTS user_data.user_refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    
    -- Token Data
    token_hash VARCHAR(255) NOT NULL,  -- Hashed refresh token (for security)
    jti VARCHAR(255) NOT NULL UNIQUE,  -- JWT ID (from token)
    
    -- Expiration
    expires_at TIMESTAMPTZ NOT NULL,
    
    -- Revocation
    revoked_at TIMESTAMPTZ,
    
    -- Audit
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT user_refresh_tokens_jti_not_empty CHECK (LENGTH(jti) > 0),
    CONSTRAINT user_refresh_tokens_hash_not_empty CHECK (LENGTH(token_hash) > 0)
);

-- Indexes
CREATE INDEX idx_user_refresh_tokens_user_id 
    ON user_data.user_refresh_tokens(user_id, created_at DESC) 
    WHERE revoked_at IS NULL;
    
CREATE INDEX idx_user_refresh_tokens_token_hash 
    ON user_data.user_refresh_tokens(token_hash) 
    WHERE revoked_at IS NULL;
    
CREATE INDEX idx_user_refresh_tokens_jti 
    ON user_data.user_refresh_tokens(jti);
    
CREATE INDEX idx_user_refresh_tokens_expires_at 
    ON user_data.user_refresh_tokens(expires_at) 
    WHERE revoked_at IS NULL;

COMMENT ON TABLE user_data.user_refresh_tokens IS 'Refresh tokens for JWT authentication with rotation support';

-- ============================================================================
-- Table: user_data.revoked_tokens
-- ============================================================================
-- Token blacklist for revoked access tokens.
-- Used for logout and token revocation.

CREATE TABLE IF NOT EXISTS user_data.revoked_tokens (
    jti VARCHAR(255) PRIMARY KEY,  -- JWT ID (from access token)
    
    -- Expiration (for automatic cleanup)
    expires_at TIMESTAMPTZ NOT NULL,
    
    -- Revocation timestamp
    revoked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT revoked_tokens_jti_not_empty CHECK (LENGTH(jti) > 0)
);

-- Indexes
CREATE INDEX idx_revoked_tokens_expires_at 
    ON user_data.revoked_tokens(expires_at);

-- Automatic cleanup: Tokens older than expiration are automatically ignored
-- (can be cleaned up by scheduled job)

COMMENT ON TABLE user_data.revoked_tokens IS 'Blacklist for revoked JWT access tokens (logout, security)';

-- ============================================================================
-- Function: Revoke all refresh tokens for a user (Security Reset)
-- ============================================================================
-- Used when breach is detected (revoked token is used).

CREATE OR REPLACE FUNCTION user_data.revoke_all_user_refresh_tokens(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER;
BEGIN
    UPDATE user_data.user_refresh_tokens
    SET revoked_at = NOW()
    WHERE user_id = p_user_id
    AND revoked_at IS NULL;
    
    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION user_data.revoke_all_user_refresh_tokens IS 'Revoke all active refresh tokens for a user (security reset on breach detection)';

COMMIT;

-- ============================================================================
-- Integration Notes:
-- ============================================================================
-- 1. This migration adds 2 new tables for JWT refresh token management
-- 2. user_refresh_tokens: Stores refresh tokens with rotation support
-- 3. revoked_tokens: Blacklist for revoked access tokens
-- 4. Function revoke_all_user_refresh_tokens: Security reset on breach
-- 
-- To integrate into PHX_DB_SCHEMA_V2.5_FULL_DDL.sql:
-- - Add tables after user_data.user_api_keys
-- - Add function in SQL FUNCTIONS section
-- - Update table count: 48 → 50 tables
-- ============================================================================
