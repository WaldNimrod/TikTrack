-- Migration 002: add stage_id and program_id to work_packages
-- Author: Team 00 (Nimrod) — 2026-03-29
-- Purpose: Allow TikTrack roadmap programs to be represented with their
--          milestone (stage_id) and canonical program registry id (program_id).
--          Enables grouping by milestone in the Portfolio UI.

ALTER TABLE work_packages ADD COLUMN IF NOT EXISTS stage_id   TEXT;
ALTER TABLE work_packages ADD COLUMN IF NOT EXISTS program_id TEXT;

-- Comment existing bootstrap row
COMMENT ON TABLE work_packages IS 'Pipeline work packages. stage_id + program_id added 2026-03-29 for TikTrack roadmap migration.';
