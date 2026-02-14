-- P3-019: market_cap — הרחבת precision ל-mega caps (~4T+)
-- מקור: numeric field overflow — market_cap > 10^12 (NUMERIC 20,8)
-- NUMERIC(20,8) max ≈ 999B; 4T = 4e12 דורש 13 ספרות. NUMERIC(24,4) תומך עד ~10^20.
-- סטייה מ-PRECISION_POLICY_SSOT (20,8) — מאושר עבור market_cap בשל overflow.

ALTER TABLE market_data.ticker_prices
    ALTER COLUMN market_cap TYPE NUMERIC(24, 4) USING market_cap::NUMERIC(24, 4);

ALTER TABLE market_data.ticker_prices_intraday
    ALTER COLUMN market_cap TYPE NUMERIC(24, 4) USING market_cap::NUMERIC(24, 4);

COMMENT ON COLUMN market_data.ticker_prices.market_cap IS 'Market capitalization. P3-019: NUMERIC(24,4) for mega caps (>1T).';
COMMENT ON COLUMN market_data.ticker_prices_intraday.market_cap IS 'Market capitalization. P3-019: NUMERIC(24,4) for mega caps (>1T).';
