-- AOS v3 Migration 002: Add FAILED to runs.status CHECK constraint
-- GATE_0 Entry Quality Gate: team_190 rejects a WP at GATE_0 (terminal, no retry).
-- FAILED = run terminated at GATE_0, WP reset to PLANNED.

ALTER TABLE runs DROP CONSTRAINT chk_runs_status;
ALTER TABLE runs ADD CONSTRAINT chk_runs_status CHECK (status IN (
  'NOT_STARTED', 'IN_PROGRESS', 'CORRECTION', 'PAUSED', 'COMPLETE', 'FAILED'
));
