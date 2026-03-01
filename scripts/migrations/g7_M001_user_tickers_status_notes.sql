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
