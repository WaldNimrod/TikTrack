-- ============================================================================
-- G7 M-005: admin_data.job_run_log — CREATE TABLE
-- Source: ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_v1.0.0 §8, §6
-- Scope: Background job execution logging (check_alert_conditions, etc.)
-- Prerequisite: M-004 (admin_data schema)
-- ============================================================================

CREATE TABLE IF NOT EXISTS admin_data.job_run_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_name VARCHAR(100) NOT NULL,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'running',
    records_processed INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    error_count INTEGER DEFAULT 0,
    error_details JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_job_run_log_job_started
    ON admin_data.job_run_log(job_name, started_at DESC);

COMMENT ON TABLE admin_data.job_run_log IS 'G7 — Background job run history; status: running|success|partial_error';
