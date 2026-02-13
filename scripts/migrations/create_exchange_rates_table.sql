-- exchange_rates — Stage-1 (1-002) per FOREX_MARKET_SPEC
-- Schema: market_data (reference data)
-- Responsibility: Team 60 (DDL execution)
-- Source: TEAM_20_TO_TEAM_60_EXCHANGE_RATES_DDL_SPEC.md

CREATE TABLE IF NOT EXISTS market_data.exchange_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    conversion_rate NUMERIC(20, 8) NOT NULL,
    last_sync_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT exchange_rates_from_to_unique UNIQUE (from_currency, to_currency),
    CONSTRAINT exchange_rates_positive_rate CHECK (conversion_rate > 0)
);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_from_to 
    ON market_data.exchange_rates(from_currency, to_currency);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_last_sync 
    ON market_data.exchange_rates(last_sync_time);

COMMENT ON TABLE market_data.exchange_rates IS 'Exchange rates for currency conversion (D21 CURRENCY_CONVERSION). Per FOREX_MARKET_SPEC.';
COMMENT ON COLUMN market_data.exchange_rates.conversion_rate IS 'NUMERIC(20,8) per .cursorrules.';
