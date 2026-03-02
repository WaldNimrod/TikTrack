-- ============================================================================
-- G7 M-005b: admin_data.job_run_log — Extended schema (replaces M-005)
-- Source: ARCHITECT_DIRECTIVE_G7_REMEDIATION_ADDENDUM §M-005b
--         ARCHITECT_DIRECTIVE_BACKGROUND_TASK_ORCHESTRATION §3
-- Prerequisite: M-004 (admin_data schema)
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_data.job_run_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name VARCHAR(100) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(30) NOT NULL DEFAULT 'running',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE admin_data.job_run_log
    ADD COLUMN IF NOT EXISTS runtime_class   VARCHAR(40)   NOT NULL DEFAULT 'TARGET_RUNTIME',
    ADD COLUMN IF NOT EXISTS exit_code       SMALLINT,
    ADD COLUMN IF NOT EXISTS duration_ms     INTEGER,
    ADD COLUMN IF NOT EXISTS records_processed INTEGER,
    ADD COLUMN IF NOT EXISTS records_updated   INTEGER,
    ADD COLUMN IF NOT EXISTS records_skipped INTEGER,
    ADD COLUMN IF NOT EXISTS records_failed  INTEGER,
    ADD COLUMN IF NOT EXISTS error_count     INTEGER,
    ADD COLUMN IF NOT EXISTS error_details   JSONB,
    ADD COLUMN IF NOT EXISTS error_class     VARCHAR(100),
    ADD COLUMN IF NOT EXISTS stdout_ref      TEXT,
    ADD COLUMN IF NOT EXISTS stderr_ref      TEXT,
    ADD COLUMN IF NOT EXISTS executor_info   JSONB,
    ADD COLUMN IF NOT EXISTS metadata        JSONB;

CREATE INDEX IF NOT EXISTS idx_job_run_log_job_name_started
    ON admin_data.job_run_log(job_name, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_run_log_running
    ON admin_data.job_run_log(status) WHERE status = 'running';

COMMENT ON TABLE admin_data.job_run_log IS 'G7 M-005b — Background job run history; status: running|completed|failed|skipped_concurrent|skipped_disabled|timeout';
