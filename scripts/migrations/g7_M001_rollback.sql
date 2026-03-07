-- G7 M-001 ROLLBACK: Remove status, notes, display_name, updated_at, updated_by from user_data.user_tickers
ALTER TABLE user_data.user_tickers DROP COLUMN IF EXISTS status;
ALTER TABLE user_data.user_tickers DROP COLUMN IF EXISTS notes;
ALTER TABLE user_data.user_tickers DROP COLUMN IF EXISTS display_name;
ALTER TABLE user_data.user_tickers DROP COLUMN IF EXISTS updated_at;
ALTER TABLE user_data.user_tickers DROP COLUMN IF EXISTS updated_by;
