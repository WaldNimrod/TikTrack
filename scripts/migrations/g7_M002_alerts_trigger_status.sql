-- ============================================================================
-- G7 M-002: user_data.alerts — ADD trigger_status
-- Source: ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_v1.0.0 §8, §1.2
-- Scope: D34 Alerts — operational state (untriggered|triggered_unread|triggered_read)
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'user_data' AND table_name = 'alerts' AND column_name = 'trigger_status'
    ) THEN
        ALTER TABLE user_data.alerts
        ADD COLUMN trigger_status VARCHAR(20) NOT NULL DEFAULT 'untriggered'
            CHECK (trigger_status IN ('untriggered', 'triggered_unread', 'triggered_read'));
        COMMENT ON COLUMN user_data.alerts.trigger_status IS 'Operational state: untriggered|triggered_unread|triggered_read';
    END IF;
END $$;
