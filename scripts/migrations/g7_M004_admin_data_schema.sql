-- ============================================================================
-- G7 M-004: admin_data — CREATE SCHEMA IF NOT EXISTS
-- Source: ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_v1.0.0 §8
-- Scope: Admin/job-run infrastructure
-- ============================================================================

CREATE SCHEMA IF NOT EXISTS admin_data;

COMMENT ON SCHEMA admin_data IS 'G7 — Admin infrastructure: job run logs, system management';
