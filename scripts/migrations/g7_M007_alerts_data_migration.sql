-- ============================================================================
-- G7 M-007: Data migration — backfill alerts.trigger_status from is_triggered
-- Source: ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_v1.0.0 §8
-- Scope: trigger_status = 'triggered_unread' where is_triggered=true, else 'untriggered'
-- Prerequisite: M-002 (trigger_status column)
-- ============================================================================

UPDATE user_data.alerts
SET trigger_status = 'triggered_unread'
WHERE is_triggered = true AND trigger_status = 'untriggered';
