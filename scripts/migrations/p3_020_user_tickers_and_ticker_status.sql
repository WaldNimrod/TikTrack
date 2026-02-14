-- Migration: user_data.user_tickers + market_data.tickers.status
-- Task: 20.UT.1
-- Source: TEAM_90_TO_TEAM_10_USER_TICKERS_IMPLEMENTATION_BRIEF, TEAM_10_USER_TICKERS_WORK_PLAN
-- Per TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT: status pending|active|inactive|cancelled

-- ----------------------------------------------------------------------------
-- 1. Add status to market_data.tickers (if not exists)
--    New tickers from "הטיקרים שלי" = status 'pending' (locked in SSOT)
-- ----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'market_data' AND table_name = 'tickers' AND column_name = 'status'
    ) THEN
        ALTER TABLE market_data.tickers
        ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'active'
            CHECK (status IN ('pending', 'active', 'inactive', 'cancelled'));
        COMMENT ON COLUMN market_data.tickers.status IS 'Per TT2_TICKER_STATUS_MARKET_DATA_LOADING_SSOT: pending=EOD+history only, active=full rate, inactive=reduced, cancelled=no data';
    END IF;
END $$;

-- ----------------------------------------------------------------------------
-- 2. Create user_data.user_tickers (join table)
--    user_id, ticker_id, created_at, deleted_at
--    UNIQUE (user_id, ticker_id) WHERE deleted_at IS NULL
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_data.user_tickers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    ticker_id UUID NOT NULL REFERENCES market_data.tickers(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Partial unique index: one active (non-deleted) link per user-ticker pair (no duplicates)
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_tickers_user_ticker_active
    ON user_data.user_tickers(user_id, ticker_id)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_user_tickers_user_id ON user_data.user_tickers(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_user_tickers_ticker_id ON user_data.user_tickers(ticker_id) WHERE deleted_at IS NULL;

COMMENT ON TABLE user_data.user_tickers IS 'User "My Tickers" junction table. Per TEAM_90_USER_TICKERS_IMPLEMENTATION_BRIEF.';
