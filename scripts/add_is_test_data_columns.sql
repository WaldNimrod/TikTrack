-- ============================================================================
-- Add is_test_data column to Phase 2 tables
-- Team 60 (DevOps & Platform)
-- Purpose: Add is_test_data flag column to trading_accounts, brokers_fees, cash_flows
-- ============================================================================

-- Add is_test_data column to trading_accounts
ALTER TABLE user_data.trading_accounts
ADD COLUMN IF NOT EXISTS is_test_data BOOLEAN NOT NULL DEFAULT FALSE;

-- Add is_test_data column to brokers_fees
ALTER TABLE user_data.brokers_fees
ADD COLUMN IF NOT EXISTS is_test_data BOOLEAN NOT NULL DEFAULT FALSE;

-- Add is_test_data column to cash_flows
ALTER TABLE user_data.cash_flows
ADD COLUMN IF NOT EXISTS is_test_data BOOLEAN NOT NULL DEFAULT FALSE;

-- Add comments
COMMENT ON COLUMN user_data.trading_accounts.is_test_data IS 'Flag indicating test data (SOP-011)';
COMMENT ON COLUMN user_data.brokers_fees.is_test_data IS 'Flag indicating test data (SOP-011)';
COMMENT ON COLUMN user_data.cash_flows.is_test_data IS 'Flag indicating test data (SOP-011)';
