-- G7 M-009: Remove 'general' from notes parent_type (Phase C)
-- ARCHITECT_DIRECTIVE: Notes parent model lock — align valid parent types

-- 1. Migrate existing general notes to ticker (fallback)
UPDATE user_data.notes
SET parent_type = 'ticker'
WHERE parent_type = 'general';

-- 2. Drop old constraint, add new without general
ALTER TABLE user_data.notes
  DROP CONSTRAINT IF EXISTS notes_parent_type_check;

ALTER TABLE user_data.notes
  ADD CONSTRAINT notes_parent_type_check
  CHECK (parent_type IN ('trade', 'trade_plan', 'ticker', 'account'));

COMMENT ON COLUMN user_data.notes.parent_type IS 'Valid: trade|trade_plan|ticker|account (general removed per Phase C)';
