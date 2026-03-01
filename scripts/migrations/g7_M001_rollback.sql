-- G7 M-001 ROLLBACK: Remove status, notes from user_data.user_tickers
ALTER TABLE user_data.user_tickers DROP COLUMN IF EXISTS status;
ALTER TABLE user_data.user_tickers DROP COLUMN IF EXISTS notes;
