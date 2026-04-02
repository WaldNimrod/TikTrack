-- ============================================================================
-- Migration 002 — Work Package ID Format: program-level → 3-level canonical
-- ============================================================================
-- Directive: ARCHITECT_DIRECTIVE_WP_ID_NAMING_CONVENTION_v1.0.0.md
--
-- Converts all existing WP IDs from program-level format (S{NNN}-P{NNN})
-- to the canonical 3-level format (S{NNN}-P{NNN}-WP001).
--
-- Order of operations is critical (4 FK constraints reference work_packages.id):
--   fk_runs_work_package, fk_asg_work_package, fk_evt_work_package, fk_wpai_work_package
-- All FKs are NOT DEFERRABLE, so they are checked immediately.
-- Strategy: DROP all FKs → update PK → update FK columns → RE-ADD FKs.
--
-- Safe to run multiple times: WHERE clause is idempotent (regex guards it).
-- ============================================================================

BEGIN;

-- Step 1: Drop FK constraints (required — FK columns cannot reference a PK value mid-update)
ALTER TABLE runs             DROP CONSTRAINT IF EXISTS fk_runs_work_package;
ALTER TABLE assignments      DROP CONSTRAINT IF EXISTS fk_asg_work_package;
ALTER TABLE events           DROP CONSTRAINT IF EXISTS fk_evt_work_package;
ALTER TABLE wp_artifact_index DROP CONSTRAINT IF EXISTS fk_wpai_work_package;

-- Step 2: Rename PKs in work_packages
UPDATE work_packages
SET id = id || '-WP001'
WHERE id ~ '^S[0-9]{3}-P[0-9]{3}$';

-- Step 3: Update FK columns in all child tables
UPDATE runs
SET work_package_id = work_package_id || '-WP001'
WHERE work_package_id ~ '^S[0-9]{3}-P[0-9]{3}$';

UPDATE assignments
SET work_package_id = work_package_id || '-WP001'
WHERE work_package_id ~ '^S[0-9]{3}-P[0-9]{3}$';

UPDATE events
SET work_package_id = work_package_id || '-WP001'
WHERE work_package_id ~ '^S[0-9]{3}-P[0-9]{3}$';

UPDATE wp_artifact_index
SET work_package_id = work_package_id || '-WP001'
WHERE work_package_id ~ '^S[0-9]{3}-P[0-9]{3}$';

-- Step 3b: Re-add FK constraints
ALTER TABLE runs
  ADD CONSTRAINT fk_runs_work_package
  FOREIGN KEY (work_package_id) REFERENCES work_packages(id) ON DELETE RESTRICT;

ALTER TABLE assignments
  ADD CONSTRAINT fk_asg_work_package
  FOREIGN KEY (work_package_id) REFERENCES work_packages(id) ON DELETE RESTRICT;

ALTER TABLE events
  ADD CONSTRAINT fk_evt_work_package
  FOREIGN KEY (work_package_id) REFERENCES work_packages(id) ON DELETE RESTRICT;

ALTER TABLE wp_artifact_index
  ADD CONSTRAINT fk_wpai_work_package
  FOREIGN KEY (work_package_id) REFERENCES work_packages(id) ON DELETE RESTRICT;

-- Step 4: Add CHECK constraint to prohibit old 2-level program format.
-- Prohibits: S{NNN}-P{NNN}  (program-level — was incorrectly used as WP ID)
-- Allows anything else, including:
--   (a) Bootstrap records with custom alphanumeric IDs (e.g. 01JK8AOSV3WP0000000001)
--   (b) Canonical 3-level format: S{NNN}-P{NNN}-WP{NNN}
-- Skips if constraint already exists (idempotency).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chk_wp_id_format'
      AND conrelid = 'work_packages'::regclass
  ) THEN
    ALTER TABLE work_packages
    ADD CONSTRAINT chk_wp_id_format
    CHECK (id !~ '^S[0-9]{3}-P[0-9]{3}$');
  END IF;
END;
$$;

COMMIT;

-- Verification query (run manually to confirm):
-- SELECT id, status, linked_run_id FROM work_packages
-- WHERE id NOT LIKE '%WP%' AND id NOT ~ '^[0-9A-Z]{26}$'
-- ORDER BY id;
-- Expected: 0 rows
