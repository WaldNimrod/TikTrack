-- DRAFT: exchange_rates_history — Option A (Team 90 / Spy recommendation)
-- מקור: TEAM_90_TO_TEAM_10_EXTERNAL_DATA_MODULE_REVIEW_AND_EXCHANGE_RATES_HISTORY
-- SSOT: MARKET_DATA_PIPE_SPEC §7.3 — Retention 250 trading days → archive
--
-- **אישור אדריכל נדרש** לפני הרצה.
-- תיאום: Team 20 (DDL draft) + Team 60 (migration, job EOD).
--
-- Job EOD מתוכנן: INSERT היסטוריה + UPSERT ל־exchange_rates (current).

CREATE TABLE IF NOT EXISTS market_data.exchange_rates_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    from_currency VARCHAR(3) NOT NULL,
    to_currency VARCHAR(3) NOT NULL,
    conversion_rate NUMERIC(20, 8) NOT NULL,
    as_of_date DATE NOT NULL,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT exchange_rates_history_positive_rate CHECK (conversion_rate > 0),
    CONSTRAINT exchange_rates_history_unique_pair_date UNIQUE (from_currency, to_currency, as_of_date)
);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_history_pair_date
    ON market_data.exchange_rates_history(from_currency, to_currency, as_of_date DESC);

CREATE INDEX IF NOT EXISTS idx_exchange_rates_history_as_of
    ON market_data.exchange_rates_history(as_of_date DESC);

COMMENT ON TABLE market_data.exchange_rates_history IS 'FX history. Retention 250 trading days per SSOT. Option A — Spy/Team 90. Pending Architect approval.';
