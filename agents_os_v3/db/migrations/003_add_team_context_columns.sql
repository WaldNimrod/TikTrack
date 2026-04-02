-- Migration 003: Add full team context columns for agent activation
-- Purpose: Each team row stores all 4 context layers needed for precise agent injection.
-- Run: docker exec tiktrack-postgres-dev psql -U AOSDbAdmin -d AOS_V3_DB -f 003_add_team_context_columns.sql

ALTER TABLE teams ADD COLUMN IF NOT EXISTS role_description TEXT;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS gate_authority   JSONB;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS writes_to        JSONB;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS iron_rules       JSONB;
ALTER TABLE teams ADD COLUMN IF NOT EXISTS mandatory_reads  JSONB;
