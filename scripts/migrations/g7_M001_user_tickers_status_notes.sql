-- ============================================================================
-- G7 M-001: user_data.user_tickers — ADD status, notes
-- Source: ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_v1.0.0 §8, §1.3
-- Scope: D33 My Tickers — canonical status + user notes field
-- ============================================================================

-- status: canonical 4-state per TT2_SYSTEM_STATUS_VALUES_SSOT
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'user_data' AND table_name = 'user_tickers' AND column_name = 'status'
    ) THEN
        ALTER TABLE user_data.user_tickers
        ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active'
            CHECK (status IN ('pending', 'active', 'inactive', 'cancelled'));
        COMMENT ON COLUMN user_data.user_tickers.status IS 'Canonical 4-state per TT2_SYSTEM_STATUS_VALUES_SSOT';
    END IF;
END $$;

-- notes: user memo/subtitle for this ticker
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'user_data' AND table_name = 'user_tickers' AND column_name = 'notes'
    ) THEN
        ALTER TABLE user_data.user_tickers
        ADD COLUMN notes TEXT;
        COMMENT ON COLUMN user_data.user_tickers.notes IS 'User personal subtitle/memo for this ticker';
    END IF;
END $$;

-- display_name: user-defined display label (ADDENDUM)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'user_data' AND table_name = 'user_tickers' AND column_name = 'display_name'
    ) THEN
        ALTER TABLE user_data.user_tickers
        ADD COLUMN display_name VARCHAR(100) NULL;
        COMMENT ON COLUMN user_data.user_tickers.display_name IS 'User-defined display label (personal alias, optional)';
    END IF;
END $$;

-- updated_at, updated_by: audit fields (PHASE_A_ACTIVATION)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'user_data' AND table_name = 'user_tickers' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE user_data.user_tickers
        ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        COMMENT ON COLUMN user_data.user_tickers.updated_at IS 'Last update timestamp';
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'user_data' AND table_name = 'user_tickers' AND column_name = 'updated_by'
    ) THEN
        ALTER TABLE user_data.user_tickers
        ADD COLUMN updated_by UUID REFERENCES user_data.users(id);
        COMMENT ON COLUMN user_data.user_tickers.updated_by IS 'User who last updated';
    END IF;
END $$;
