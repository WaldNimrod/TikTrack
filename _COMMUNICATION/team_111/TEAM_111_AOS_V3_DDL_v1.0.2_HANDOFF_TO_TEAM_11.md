---
id: TEAM_111_AOS_V3_DDL_v1.0.2_HANDOFF_TO_TEAM_11
historical_record: true
from: Team 111 (AOS Domain Architect)
to: Team 11 (AOS Gateway / Execution Lead)
cc: Team 61 (AOS DevOps), Team 100 (Chief Architect)
date: 2026-03-28
type: DDL_HANDOFF — v1.0.2 complete; GATE_0 unblock authorized
branch: aos-v3
mandate: TEAM_11_TO_TEAM_111_AOS_V3_BUILD_ACTIVATION_v1.0.0.md---

# Team 111 → Team 11 | DDL v1.0.2 Handoff

## Status

**DDL v1.0.2 is COMPLETE.** All 5 WP D.5 items delivered. Team 61 may proceed with GATE_0 migration application.

---

## Artifacts delivered

| File | Purpose | Apply when |
|------|---------|-----------|
| `agents_os_v3/db/migrations/001_aos_v3_fresh_schema_v1.0.2.sql` | Complete schema — empty DB → v1.0.2 | Fresh install (primary acceptance path) |
| `agents_os_v3/db/migrations/002_aos_v3_delta_v1.0.1_to_v1.0.2.sql` | Delta migration — v1.0.1 → v1.0.2 | Upgrading existing v1.0.1 DB |

Both files registered in `agents_os_v3/FILE_INDEX.json` (version bumped to 1.0.1).

---

## WP D.5 item checklist — COMPLETE

| # | Item | Status | Artifact location |
|---|------|--------|-------------------|
| 1 | DDL-ERRATA-01 | ✅ | Both migration files (Steps 1+2 in delta; inline in fresh schema) |
| 2 | `ideas` amendments | ✅ | Both migration files |
| 3 | `work_packages` (NEW) | ✅ | Both migration files |
| 4 | `pending_feedbacks` (NEW) | ✅ | Both migration files |
| 5 | `teams.engine` | ✅ | Fresh schema: `VARCHAR(50) NOT NULL`; delta: documented no-op for v1.0.1 (column already exists), commented ALTER for pre-v1.0.1 |

---

## DDL-ERRATA-01 — two sub-items

| Sub-item | Change | Rationale |
|----------|--------|-----------|
| **ERRATA-01-A** | `wp_artifact_index.wp_id` → renamed to `work_package_id` | WP D.5 naming rule: no column named `wp_id` in DB. `wp_id` = API alias only. |
| **ERRATA-01-B** | `CREATE UNIQUE INDEX uq_templates_active_slot ON templates (gate_id, COALESCE(phase_id,''), COALESCE(domain_id,''), name) WHERE is_active = 1` | Enables `get_active_template()` to guarantee deterministic single result. Source: UI Spec §13 coordination note. |

---

## key decisions / design notes for Team 61

### Circular FK: `work_packages` ↔ `runs`

`work_packages.linked_run_id` → `runs.id` (nullable) and `runs.work_package_id` → `work_packages.id` create a mutual FK dependency.

**Fresh schema resolution:** `work_packages` is created first (without `linked_run_id` FK), then `runs` (with FK to `work_packages`), then `ALTER TABLE work_packages ADD CONSTRAINT fk_wp_linked_run`. Both files use this pattern.

**Delta migration resolution:** `runs` already exists, so `work_packages` is created with `linked_run_id` FK inline. FK from `runs` → `work_packages` is added via ALTER TABLE after `work_packages` is created.

### FK backfill on existing tables (delta migration only)

The delta migration adds FK constraints to `runs.work_package_id`, `assignments.work_package_id`, `events.work_package_id`, and `wp_artifact_index.work_package_id`. These will **fail** if any existing rows reference WP IDs not in `work_packages`.

**Pre-flight:** Team 61 must run the 4 verification SELECTs documented in the migration file (Step 5 comments) before applying, and populate `work_packages` with the required rows first.

### `teams.engine` precision

The DDL Spec v1.0.1 base schema uses `engine TEXT NOT NULL`. DDL v1.0.2 uses `VARCHAR(50)` per mandate item 5. In PostgreSQL, `TEXT` and `VARCHAR(n)` are storage-equivalent; the length constraint is the only semantic difference. No data migration required for existing rows with values ≤50 characters.

### `ideas` table

UI Spec v1.1.0 §13.2 supersedes any Stage 8A v1.0.2 §10.1 draft. If a Stage 8A draft `ideas` table exists in the target DB, drop it before running the delta migration (noted in the migration file with a `DROP TABLE IF EXISTS` comment).

---

## Acceptance criteria (Team 11 / GATE_0)

- [ ] Migration file 001 applies cleanly on empty PostgreSQL 16+ (`psql -f 001_...sql`)
- [ ] Post-migration validation queries (embedded in 001) return expected row counts
- [ ] No column named `wp_id` exists in the migrated schema (`V2` query in file 002 returns 0 rows)
- [ ] `uq_templates_active_slot` index exists
- [ ] `work_packages.id` is the PK; no column named `wp_id` anywhere

---

**log_entry | TEAM_111 | AOS_V3_DDL | v1.0.2 | HANDOFF_TO_TEAM_11 | GATE_0_UNBLOCK | 2026-03-28**
