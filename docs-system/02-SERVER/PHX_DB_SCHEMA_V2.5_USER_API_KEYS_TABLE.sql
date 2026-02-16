-- TikTrack Database Schema: user_api_keys Table Creation
-- Task: Create user_api_keys table for API key management
-- Date: 2026-02-01
-- Team: 20 (Backend)

-- ============================================================================
-- Table: user_data.user_api_keys (NEW in V2.5 - GIN-004)
-- ============================================================================

-- Check if table already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'user_data' 
        AND table_name = 'user_api_keys'
    ) THEN
        -- Create the table
        CREATE TABLE user_data.user_api_keys (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
            
            -- Provider
            provider user_data.api_provider NOT NULL,
            provider_label VARCHAR(100),
            
            -- Credentials (ENCRYPTED!)
            api_key_encrypted TEXT NOT NULL,
            api_secret_encrypted TEXT,
            additional_config JSONB DEFAULT '{}'::JSONB,
            
            -- Status
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            is_verified BOOLEAN NOT NULL DEFAULT FALSE,
            last_verified_at TIMESTAMPTZ,
            verification_error TEXT,
            
            -- Rate Limiting
            rate_limit_per_minute INTEGER,
            rate_limit_per_day INTEGER,
            quota_used_today INTEGER DEFAULT 0,
            quota_reset_at TIMESTAMPTZ,
            
            -- Audit
            created_by UUID NOT NULL REFERENCES user_data.users(id),
            updated_by UUID NOT NULL REFERENCES user_data.users(id),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            deleted_at TIMESTAMPTZ,
            version INTEGER NOT NULL DEFAULT 1,
            
            -- Metadata
            metadata JSONB DEFAULT '{}'::JSONB,
            
            -- Constraints
            CONSTRAINT user_api_keys_unique_user_provider 
                UNIQUE (user_id, provider, provider_label) WHERE deleted_at IS NULL,
            CONSTRAINT user_api_keys_encrypted_not_empty
                CHECK (LENGTH(api_key_encrypted) > 0),
            CONSTRAINT user_api_keys_rate_limit_positive
                CHECK (rate_limit_per_minute IS NULL OR rate_limit_per_minute > 0),
            CONSTRAINT user_api_keys_quota_logic
                CHECK (quota_used_today >= 0)
        );

        -- Create indexes
        CREATE INDEX idx_user_api_keys_user_id 
            ON user_data.user_api_keys(user_id, created_at DESC) 
            WHERE deleted_at IS NULL;
            
        CREATE INDEX idx_user_api_keys_provider 
            ON user_data.user_api_keys(provider, is_active) 
            WHERE is_active = TRUE AND deleted_at IS NULL;
            
        CREATE INDEX idx_user_api_keys_verified 
            ON user_data.user_api_keys(is_verified, last_verified_at DESC) 
            WHERE deleted_at IS NULL;
            
        CREATE INDEX idx_user_api_keys_config 
            ON user_data.user_api_keys USING gin(additional_config jsonb_path_ops);

        -- Add comments
        COMMENT ON TABLE user_data.user_api_keys IS 'Multi-provider API keys (IBKR, Polygon, etc.) - ENCRYPTED';
        COMMENT ON COLUMN user_data.user_api_keys.api_key_encrypted IS 'Encrypted API key (never store plaintext!)';
        COMMENT ON COLUMN user_data.user_api_keys.api_secret_encrypted IS 'Encrypted API secret (optional, provider-dependent)';
        COMMENT ON COLUMN user_data.user_api_keys.provider IS 'API provider (IBKR, Polygon, etc.)';
        COMMENT ON COLUMN user_data.user_api_keys.provider_label IS 'User-friendly label for this API key';
        COMMENT ON COLUMN user_data.user_api_keys.is_verified IS 'Whether API key has been verified against provider';
        COMMENT ON COLUMN user_data.user_api_keys.quota_used_today IS 'API quota used today (resets at quota_reset_at)';

        RAISE NOTICE 'Table user_data.user_api_keys created successfully';
    ELSE
        RAISE NOTICE 'Table user_data.user_api_keys already exists';
    END IF;
END $$;

-- Verify table creation
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'user_data'
    AND tablename = 'user_api_keys';
