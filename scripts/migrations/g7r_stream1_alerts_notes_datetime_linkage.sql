-- G7R Stream 1 — S002_P003_WP002
-- ARCHITECT_GATE7_REMEDIATION_FRAME §8
-- 1. Add target_datetime to alerts
-- 2. Add parent_datetime to notes
-- 3. Alter alerts: allow target_type NULL, remove general, add datetime
-- 4. Data correction: general → NULL

-- 1. Add target_datetime
ALTER TABLE user_data.alerts
ADD COLUMN IF NOT EXISTS target_datetime TIMESTAMPTZ NULL;

-- 2. Add parent_datetime
ALTER TABLE user_data.notes
ADD COLUMN IF NOT EXISTS parent_datetime TIMESTAMPTZ NULL;

-- 3. Make target_type nullable (for general→NULL correction)
ALTER TABLE user_data.alerts
ALTER COLUMN target_type DROP NOT NULL;

-- 4. Drop old check constraint (had 'general')
ALTER TABLE user_data.alerts DROP CONSTRAINT IF EXISTS alerts_target_type_check;

-- 5. Data correction: MUST run BEFORE adding new constraint (fix: TEAM_60 migration BLOCK)
UPDATE user_data.alerts
SET target_type = NULL, target_id = NULL
WHERE target_type = 'general';

-- 6. Add new constraint: ticker|trade|trade_plan|account|datetime|NULL (no general)
ALTER TABLE user_data.alerts
ADD CONSTRAINT alerts_target_type_check CHECK (
  target_type IS NULL
  OR target_type IN ('ticker', 'trade', 'trade_plan', 'account', 'datetime')
);

-- 7. Notes: data migration + add datetime to parent_type (fix: TEAM_60 rerun BLOCK)
-- general → ticker per g7_M009 fallback (parent_id stays NULL)
ALTER TABLE user_data.notes DROP CONSTRAINT IF EXISTS notes_parent_type_check;
UPDATE user_data.notes
SET parent_type = 'ticker'
WHERE parent_type = 'general';
ALTER TABLE user_data.notes
ADD CONSTRAINT notes_parent_type_check
CHECK (parent_type IN ('trade', 'trade_plan', 'ticker', 'account', 'datetime'));

COMMENT ON COLUMN user_data.alerts.target_datetime IS 'G7R Stream1: Temporal linkage when target_type=datetime. Per §3B.';
COMMENT ON COLUMN user_data.notes.parent_datetime IS 'G7R Stream1: Temporal linkage when parent_type=datetime. Per §3B.';

-- 8. Add 'rearmed' to trigger_status (G7R §3C)
ALTER TABLE user_data.alerts DROP CONSTRAINT IF EXISTS alerts_trigger_status_check;
ALTER TABLE user_data.alerts
ADD CONSTRAINT alerts_trigger_status_check
CHECK (trigger_status IN ('untriggered', 'triggered_unread', 'triggered_read', 'rearmed'));
