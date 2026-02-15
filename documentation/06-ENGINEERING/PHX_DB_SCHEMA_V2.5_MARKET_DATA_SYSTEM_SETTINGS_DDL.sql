-- ============================================================================
-- TikTrack Phoenix V2.5 - Market Data System Settings (Addendum)
-- ============================================================================
-- TEAM_10_MARKET_DATA_SETTINGS_UI_WORK_PLAN / TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT
-- Owner: Team 60 (migration) — Coordination with Team 20 (keys/validation)
-- Date: 2026-01-31
--
-- Resolution: DB > env. Table stores overrides; env provides defaults.
-- Keys: max_active_tickers, intraday_interval_minutes, provider_cooldown_minutes,
--       max_symbols_per_request, delay_between_symbols_seconds, intraday_enabled
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: market_data.system_settings
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS market_data.system_settings (
    key VARCHAR(80) PRIMARY KEY,
    value TEXT NOT NULL,
    value_type VARCHAR(20) NOT NULL DEFAULT 'integer'
        CHECK (value_type IN ('integer', 'boolean', 'string', 'json')),
    updated_by UUID REFERENCES user_data.users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_settings_updated_at 
    ON market_data.system_settings(updated_at DESC);

COMMENT ON TABLE market_data.system_settings IS 'Market Data system settings — DB override for env. Keys per TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT. Resolution: DB > env.';

-- ----------------------------------------------------------------------------
-- Seed defaults (optional — service falls back to env if key missing)
-- Team 60 may run this to pre-populate; service works either way.
-- ----------------------------------------------------------------------------
-- INSERT INTO market_data.system_settings (key, value, value_type) VALUES
--     ('max_active_tickers', '50', 'integer'),
--     ('intraday_interval_minutes', '15', 'integer'),
--     ('provider_cooldown_minutes', '15', 'integer'),
--     ('max_symbols_per_request', '5', 'integer'),
--     ('delay_between_symbols_seconds', '0', 'integer'),
--     ('intraday_enabled', 'true', 'boolean')
-- ON CONFLICT (key) DO NOTHING;
