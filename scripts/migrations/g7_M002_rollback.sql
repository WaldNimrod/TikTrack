-- G7 M-002 ROLLBACK: Remove trigger_status from user_data.alerts
ALTER TABLE user_data.alerts DROP COLUMN IF EXISTS trigger_status;
