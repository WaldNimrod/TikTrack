-- ============================================================================
-- G7 M-003: user_data.notifications — CREATE TABLE
-- Source: ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_v1.0.0 §8, §1.8
-- Scope: Notification bell widget, alert trigger records
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_data.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user_data.users(id) ON DELETE CASCADE,
    alert_id UUID REFERENCES user_data.alerts(id) ON DELETE SET NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'alert_trigger',
    title VARCHAR(255) NOT NULL,
    message TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    read_at TIMESTAMP WITH TIME ZONE,
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created
    ON user_data.notifications(user_id, is_read, created_at DESC);

COMMENT ON TABLE user_data.notifications IS 'G7 — Notification records for alert triggers and notification bell widget';
