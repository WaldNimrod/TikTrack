-- G7 M-005b ROLLBACK: Drop extended columns only (preserves base table for rollback consistency)
-- Full rollback of job_run_log: DROP TABLE admin_data.job_run_log;
-- This rollback removes extended columns; base M-005 equivalent columns remain.
ALTER TABLE admin_data.job_run_log DROP COLUMN IF EXISTS runtime_class;
ALTER TABLE admin_data.job_run_log DROP COLUMN IF EXISTS exit_code;
ALTER TABLE admin_data.job_run_log DROP COLUMN IF EXISTS duration_ms;
ALTER TABLE admin_data.job_run_log DROP COLUMN IF EXISTS records_skipped;
ALTER TABLE admin_data.job_run_log DROP COLUMN IF EXISTS records_failed;
ALTER TABLE admin_data.job_run_log DROP COLUMN IF EXISTS error_class;
ALTER TABLE admin_data.job_run_log DROP COLUMN IF EXISTS stdout_ref;
ALTER TABLE admin_data.job_run_log DROP COLUMN IF EXISTS stderr_ref;
ALTER TABLE admin_data.job_run_log DROP COLUMN IF EXISTS executor_info;
DROP INDEX IF EXISTS admin_data.idx_job_run_log_running;
