-- G7 M-007 ROLLBACK: Reset trigger_status to default (no reversible data rollback)
-- Data migration is one-way; rollback of M-002 removes the column entirely.
-- This script is a no-op; full rollback = run M-002 rollback.
SELECT 1;
