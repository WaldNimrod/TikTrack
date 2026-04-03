---
id: ARCHITECT_DIRECTIVE_WP_ID_NAMING_CONVENTION_v1.0.0
historical_record: true
type: IRON_RULE
from: Team 100 (Chief System Architect)
to: ALL_TEAMS
date: 2026-03-31
status: ACTIVE
supersedes: null---

# ARCHITECT DIRECTIVE — Work Package ID Naming Convention

## Iron Rule: Work Package IDs Must Always Include All Three Levels

Every Work Package identifier in the TikTrack / Agents OS system **must** conform to the
3-level canonical format:

```
S{NNN}-P{NNN}-WP{NNN}
```

This rule applies everywhere: `definition.yaml`, the database, API payloads, UI display,
team activation documents, and spec files.

---

## Hierarchy Definition

| Level | Name (EN) | Name (HE) | Format | Example |
|-------|-----------|-----------|--------|---------|
| L1 | Stage (Milestone) | שלב | `S{NNN}` | `S003` |
| L2 | Program | תוכנית | `S{NNN}-P{NNN}` | `S003-P005` |
| L3 | Work Package | חבילת עבודה | `S{NNN}-P{NNN}-WP{NNN}` | `S003-P005-WP001` |

A Program may contain one or more Work Packages. A Program with a single Work Package
**must still use the `-WP001` suffix** — not the program ID as a shorthand.

---

## Correct vs Incorrect Examples

| ID | Status | Notes |
|----|--------|-------|
| `S003-P005-WP001` | ✅ CORRECT | Full 3-level identifier |
| `S003-P005-WP002` | ✅ CORRECT | Second WP in the same program |
| `S003-P013-WP099` | ✅ CORRECT | |
| `S003-P005` | ❌ WRONG | Program-level only — missing WP number |
| `S003` | ❌ WRONG | Stage-level only |
| `P005-WP001` | ❌ WRONG | Missing stage |

---

## Scope of Application

This rule applies to every location where a `work_package_id` value is set or consumed:

1. **`agents_os_v3/definition.yaml`** — all `id:` entries under `work_packages:`
2. **Database** — `work_packages.id` column + FK columns `runs.work_package_id`,
   `assignments.work_package_id`
3. **API** — `POST /api/runs` body field `work_package_id`
4. **pipeline_state.json** — `work_package_id` field
5. **All team activation documents, LOD200s, and spec files** — frontmatter `work_package:`
   and inline references
6. **UI** — any display or input field that renders a WP identifier

---

## Why Program-Level IDs Were Used (Historical — Now Corrected)

An earlier design comment in `definition.yaml` (line 1003) stated:
> `id = program_id (readable, matches run.work_package_id when WP enters pipeline)`

This was a deliberate shortcut for single-WP programs that treated the program ID as
the WP ID. It has been **formally revoked** by this directive. All existing program-level
WP records have been migrated to 3-level format via DB migration
`002_wp_id_format_migration_v1.0.0.sql`.

---

## Enforcement

1. **Database**: `work_packages` table has a `CHECK` constraint requiring the 3-level
   format (or ULID format for bootstrap records):
   ```sql
   CHECK (
     id ~ '^[0-9A-Z]{26}$'                      -- ULID bootstrap
     OR id ~ '^S[0-9]{3}-P[0-9]{3}-WP[0-9]{3}$' -- canonical 3-level
   )
   ```

2. **API**: `initiate_run()` in `agents_os_v3/modules/state/machine.py` validates the
   `work_package_id` format and raises `INVALID_WP_ID_FORMAT` (HTTP 400) if a
   program-level or otherwise malformed ID is supplied.

3. **Seed**: `agents_os_v3/seed.py` validates WP ID format before INSERT and raises
   `ValueError` on format mismatch.

---

## References

- `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md`
  (hierarchy definition, §2)
- `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md`
  (registry schema — `work_package_id | S{NNN}-P{NNN}-WP{NNN}`)
- `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`
  (STAGE_PARALLEL_TRACKS table — all WP IDs in 3-level format)

---

**log_entry | TEAM_100 | ARCHITECT_DIRECTIVE_WP_ID_NAMING_CONVENTION | ISSUED | ALL_TEAMS | 2026-03-31**
