-- ============================================================================
-- MD-SETTINGS: market_data.system_settings
-- ============================================================================
-- TEAM_10_MARKET_DATA_SETTINGS_UI_WORK_PLAN / TT2_MARKET_DATA_SYSTEM_SETTINGS_SSOT
-- Owner: Team 60 (migration) — Coordination: TEAM_60_TO_TEAM_20_MARKET_DATA_SYSTEM_SETTINGS_DDL_COORDINATION
-- Resolution: DB > env. Keys per SSOT.
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS market_data;

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
