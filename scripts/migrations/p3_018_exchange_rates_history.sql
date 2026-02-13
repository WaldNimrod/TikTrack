-- P3-018: exchange_rates_history — Option A (אושר)
-- מקור: TEAM_90, SSOT MARKET_DATA_PIPE_SPEC §7.3
-- Retention: 250 ימי מסחר → ארכיון. Job EOD: INSERT history + UPSERT exchange_rates

CREATE TABLE IF NOT EXISTS market_data.exchange_rates_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    conversion_rate NUMERIC(20, 8) NOT NULL,
    rate_date DATE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT exchange_rates_history_from_to_date_unique UNIQUE (from_currency, to_currency, rate_date),
    CONSTRAINT exchange_rates_history_positive_rate CHECK (conversion_rate > 0)
);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_history_from_to
    ON market_data.exchange_rates_history(from_currency, to_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_history_rate_date
    ON market_data.exchange_rates_history(rate_date DESC);

COMMENT ON TABLE market_data.exchange_rates_history IS 'Historical FX rates. 250 trading days retention → archive. Per MARKET_DATA_PIPE_SPEC §7.3. P3-018.';
