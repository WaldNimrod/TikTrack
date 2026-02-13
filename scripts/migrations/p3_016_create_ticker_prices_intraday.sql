-- P3-016: ticker_prices_intraday — טבלה נפרדת ל-Intraday (Active tickers)
-- Source: MARKET_DATA_PIPE_SPEC §4.1, §7; MARKET_DATA_COVERAGE_MATRIX; TEAM_90_MAINTENANCE_LOCKED_UPDATE
-- Retention: 30 days DB (cleanup job prunes older)

CREATE TABLE IF NOT EXISTS market_data.ticker_prices_intraday (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticker_id UUID NOT NULL,
    provider_id UUID,

    -- OHLCV + market_cap per §4.1 (NUMERIC 20,8)
    price NUMERIC(20, 8) NOT NULL,
    open_price NUMERIC(20, 8),
    high_price NUMERIC(20, 8),
    low_price NUMERIC(20, 8),
    close_price NUMERIC(20, 8),
    volume BIGINT,
    market_cap NUMERIC(20, 8),

    -- Timestamps
    price_timestamp TIMESTAMPTZ NOT NULL,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    is_stale BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT ticker_prices_intraday_positive_price CHECK (price > 0)
);

CREATE INDEX IF NOT EXISTS idx_ticker_prices_intraday_ticker_time
    ON market_data.ticker_prices_intraday(ticker_id, price_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ticker_prices_intraday_timestamp
    ON market_data.ticker_prices_intraday(price_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_ticker_prices_intraday_stale
    ON market_data.ticker_prices_intraday(is_stale) WHERE is_stale = true;

COMMENT ON TABLE market_data.ticker_prices_intraday IS 'Intraday OHLCV for Active tickers only. 30d DB retention. Per MARKET_DATA_PIPE_SPEC §4.1, §7.';
