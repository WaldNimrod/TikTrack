-- Ensure partitions for ticker_prices (partitioned by month)
-- Team 60: run if sync_ticker_prices_eod fails with "no partition" error
-- Creates partitions for 2025 (historical 250d) + 2026 + 2027

-- 2025 (historical)
CREATE TABLE IF NOT EXISTS market_data.ticker_prices_2025_01
    PARTITION OF market_data.ticker_prices FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
CREATE TABLE IF NOT EXISTS market_data.ticker_prices_2025_02
    PARTITION OF market_data.ticker_prices FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
CREATE TABLE IF NOT EXISTS market_data.ticker_prices_2025_03
    PARTITION OF market_data.ticker_prices FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');
CREATE TABLE IF NOT EXISTS market_data.ticker_prices_2025_04
    PARTITION OF market_data.ticker_prices FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');
CREATE TABLE IF NOT EXISTS market_data.ticker_prices_2025_05
    PARTITION OF market_data.ticker_prices FOR VALUES FROM ('2025-05-01') TO ('2025-06-01');
CREATE TABLE IF NOT EXISTS market_data.ticker_prices_2025_06
    PARTITION OF market_data.ticker_prices FOR VALUES FROM ('2025-06-01') TO ('2025-07-01');
CREATE TABLE IF NOT EXISTS market_data.ticker_prices_2025_07
    PARTITION OF market_data.ticker_prices FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');
CREATE TABLE IF NOT EXISTS market_data.ticker_prices_2025_08
    PARTITION OF market_data.ticker_prices FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');
CREATE TABLE IF NOT EXISTS market_data.ticker_prices_2025_09
    PARTITION OF market_data.ticker_prices FOR VALUES FROM ('2025-09-01') TO ('2025-10-01');
CREATE TABLE IF NOT EXISTS market_data.ticker_prices_2025_10
    PARTITION OF market_data.ticker_prices FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
CREATE TABLE IF NOT EXISTS market_data.ticker_prices_2025_11
    PARTITION OF market_data.ticker_prices FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');
CREATE TABLE IF NOT EXISTS market_data.ticker_prices_2025_12
    PARTITION OF market_data.ticker_prices FOR VALUES FROM ('2025-12-01') TO ('2026-01-01');

-- 2026
CREATE TABLE IF NOT EXISTS market_data.ticker_prices_2026_01
    PARTITION OF market_data.ticker_prices FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE IF NOT EXISTS market_data.ticker_prices_2026_02
    PARTITION OF market_data.ticker_prices FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
CREATE TABLE IF NOT EXISTS market_data.ticker_prices_2026_03
    PARTITION OF market_data.ticker_prices FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
CREATE TABLE IF NOT EXISTS market_data.ticker_prices_2026_04
    PARTITION OF market_data.ticker_prices FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');
CREATE TABLE IF NOT EXISTS market_data.ticker_prices_2026_05
    PARTITION OF market_data.ticker_prices FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
CREATE TABLE IF NOT EXISTS market_data.ticker_prices_2026_06
    PARTITION OF market_data.ticker_prices FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');
CREATE TABLE IF NOT EXISTS market_data.ticker_prices_2026_07
    PARTITION OF market_data.ticker_prices FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');
CREATE TABLE IF NOT EXISTS market_data.ticker_prices_2026_08
    PARTITION OF market_data.ticker_prices FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');
CREATE TABLE IF NOT EXISTS market_data.ticker_prices_2026_09
    PARTITION OF market_data.ticker_prices FOR VALUES FROM ('2026-09-01') TO ('2026-10-01');
CREATE TABLE IF NOT EXISTS market_data.ticker_prices_2026_10
    PARTITION OF market_data.ticker_prices FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
CREATE TABLE IF NOT EXISTS market_data.ticker_prices_2026_11
    PARTITION OF market_data.ticker_prices FOR VALUES FROM ('2026-11-01') TO ('2026-12-01');
CREATE TABLE IF NOT EXISTS market_data.ticker_prices_2026_12
    PARTITION OF market_data.ticker_prices FOR VALUES FROM ('2026-12-01') TO ('2027-01-01');

-- 2027 (future)
CREATE TABLE IF NOT EXISTS market_data.ticker_prices_2027_01
    PARTITION OF market_data.ticker_prices FOR VALUES FROM ('2027-01-01') TO ('2027-02-01');
CREATE TABLE IF NOT EXISTS market_data.ticker_prices_2027_02
    PARTITION OF market_data.ticker_prices FOR VALUES FROM ('2027-02-01') TO ('2027-03-01');
