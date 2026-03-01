-- G7 M-006 ROLLBACK: Remove status from market_data.tickers
-- WARNING: Only run if no dependent logic; p3_020 may have created it
ALTER TABLE market_data.tickers DROP COLUMN IF EXISTS status;
