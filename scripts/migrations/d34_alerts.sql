-- ============================================================================
-- D34 Alerts — MB3A עמוד התראות
-- ============================================================================
-- Source: PHX_DB_SCHEMA_V2.5_FULL_DDL.sql
-- Scope: TEAM_10_MB3A_ALERTS_SCOPE_LOCK, TEAM_10_MB3A_ALERTS_EXECUTION_ORDER_AND_PROMPTS_REF §6
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS user_data;

DO $$ BEGIN
    CREATE TYPE user_data.alert_type AS ENUM ('PRICE', 'VOLUME', 'TECHNICAL', 'NEWS', 'CUSTOM');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE user_data.alert_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS user_data.alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,

    target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('ticker', 'trade', 'trade_plan', 'account', 'general')),
    target_id UUID,

    ticker_id UUID REFERENCES market_data.tickers(id) ON DELETE CASCADE,

    alert_type user_data.alert_type NOT NULL,
    priority user_data.alert_priority NOT NULL DEFAULT 'MEDIUM',

    condition_field VARCHAR(50),
    condition_operator VARCHAR(10),
    condition_value NUMERIC(20, 8),

    title VARCHAR(200) NOT NULL,
    message TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_triggered BOOLEAN NOT NULL DEFAULT FALSE,
    triggered_at TIMESTAMPTZ,

    expires_at TIMESTAMPTZ,

    created_by UUID NOT NULL REFERENCES user_data.users(id),
    updated_by UUID NOT NULL REFERENCES user_data.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,

    metadata JSONB DEFAULT '{}'::JSONB
);

CREATE INDEX IF NOT EXISTS idx_alerts_user ON user_data.alerts(user_id, created_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_alerts_ticker ON user_data.alerts(ticker_id) WHERE ticker_id IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_alerts_target ON user_data.alerts(target_type, target_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_alerts_active ON user_data.alerts(is_active, is_triggered) WHERE is_active = TRUE AND is_triggered = FALSE AND deleted_at IS NULL;

COMMENT ON TABLE user_data.alerts IS 'D34 — Price alerts and notifications (polymorphic). MB3A.';
