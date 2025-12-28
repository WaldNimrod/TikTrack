-- Tickers performance indexes
-- Safe to run multiple times (IF NOT EXISTS)

BEGIN TRANSACTION;

-- Index for exact/prefix symbol lookups
CREATE INDEX IF NOT EXISTS idx_tickers_symbol ON tickers(symbol);

-- Index for filtering by type
CREATE INDEX IF NOT EXISTS idx_tickers_type ON tickers(type);

-- Index for filtering by currency
CREATE INDEX IF NOT EXISTS idx_tickers_currency_id ON tickers(currency_id);

-- Optional: case-insensitive name search (collation depends on database build)
-- Uncomment if needed and collation available
-- CREATE INDEX IF NOT EXISTS idx_tickers_name_nocase ON tickers(name COLLATE NOCASE);

-- Update statistics
ANALYZE tickers;

COMMIT;
