-- G7 M-004 ROLLBACK: Drop admin_data schema (only if empty; job_run_log dropped first via M-005 rollback)
-- Note: Run M-005 rollback before this
DROP SCHEMA IF EXISTS admin_data CASCADE;
