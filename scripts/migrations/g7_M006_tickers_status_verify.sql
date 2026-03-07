-- ============================================================================
-- G7 M-006: market_data.tickers — Verify status column exists
-- Source: ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_v1.0.0 §8
-- Note: p3_020 normally adds this; this migration ensures it exists (idempotent)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'market_data' AND table_name = 'tickers' AND column_name = 'status'
    ) THEN
        ALTER TABLE market_data.tickers
        ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active'
            CHECK (status IN ('pending', 'active', 'inactive', 'cancelled'));
        COMMENT ON COLUMN market_data.tickers.status IS 'Per TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT';
    END IF;
END $$;
