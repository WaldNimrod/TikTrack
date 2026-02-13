-- P3-013: Add market_cap to ticker_prices (PRECISION_POLICY_SSOT, MARKET_DATA_COVERAGE_MATRIX)
-- Team 60: run this migration. Per MARKET_INDICATORS_AND_FUNDAMENTALS_SPEC.

ALTER TABLE market_data.ticker_prices
    ADD COLUMN IF NOT EXISTS market_cap NUMERIC(20, 8);

COMMENT ON COLUMN market_data.ticker_prices.market_cap IS 'Market capitalization. P3-013. Yahoo→Alpha EOD.';
