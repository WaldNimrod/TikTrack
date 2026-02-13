-- Migration: brokers_fees → trading_account_fees (ADR-014, ADR-017)
-- Responsibility: Team 60
-- Plan: documentation/05-PROCEDURES/TEAM_20_TRADING_ACCOUNT_FEES_MIGRATION_PLAN.md

-- Create new table (same structure)
CREATE TABLE IF NOT EXISTS user_data.trading_account_fees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    trading_account_id UUID NOT NULL REFERENCES user_data.trading_accounts(id) ON DELETE CASCADE,
    commission_type user_data.commission_type NOT NULL,
    commission_value NUMERIC(20,6) NOT NULL,
    minimum NUMERIC(20,6) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_trading_account_fees_user_id ON user_data.trading_account_fees(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_account_fees_trading_account_id ON user_data.trading_account_fees(trading_account_id);
CREATE INDEX IF NOT EXISTS idx_trading_account_fees_deleted_at ON user_data.trading_account_fees(deleted_at);

ALTER TABLE user_data.trading_account_fees ADD CONSTRAINT trading_account_fees_minimum_check CHECK (minimum >= 0);

-- Migrate data
INSERT INTO user_data.trading_account_fees
    (id, user_id, trading_account_id, commission_type, commission_value, minimum, created_at, updated_at, deleted_at)
SELECT id, user_id, trading_account_id, commission_type, commission_value, minimum, created_at, updated_at, deleted_at
FROM user_data.brokers_fees;

-- Rename old (backup) - run after verification
-- ALTER TABLE user_data.brokers_fees RENAME TO brokers_fees_deprecated_20260213;
