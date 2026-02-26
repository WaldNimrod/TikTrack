# PORTFOLIO_WSM_SYNC_RULES_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** PORTFOLIO_WSM_SYNC_RULES  
**version:** 1.0.0  
**date:** 2026-02-23  
**directive:** TEAM_190_TO_TEAM_170_PORTFOLIO_CANONICALIZATION_MIGRATION_WORK_PACKAGE_v1.0.0

---

## 1) Contract

- **Runtime state** is stored **only** in `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` block **CURRENT_OPERATIONAL_STATE**.
- Every **gate closure** (or gate-open decision) that updates WSM **MUST** be reflected in Portfolio registries as a **mirror** (no second source of truth for runtime).
- **Portfolio registries** updated: `PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`, `PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md`.
- Runtime `track_mode` (`NORMAL` / `FAST`) is a WSM runtime field and is not an additional Portfolio authority source.

---

## 2) Mandatory sync fields

When WSM CURRENT_OPERATIONAL_STATE is updated, the following are the binding fields for mirroring:

| Field | Purpose |
|-------|---------|
| wsm_event_date | Date of gate event (from last_gate_event or equivalent) |
| wsm_event_gate | Gate identifier (e.g. GATE_8) |
| wsm_event_source_path | Path to WSM canonical file (for traceability) |

Updater of WSM (Gate Owner per WSM_OWNER_MATRIX) is responsible for ensuring registries are updated per these rules, or delegating the registry update to the designated owner (Team 170 / Team 10 as per process).

Automation lock:
- Standardization script (deterministic mirror from WSM): `scripts/portfolio/sync_registry_mirrors_from_wsm.py`
- Local apply mode: `python3 scripts/portfolio/sync_registry_mirrors_from_wsm.py --write`
- CI enforcement mode: `python3 scripts/portfolio/sync_registry_mirrors_from_wsm.py --check`
- CI trigger points: `.github/workflows/lint-enforcement.yml`, `.github/workflows/portfolio-auto-sync.yml`

---

## 3) Allowed state: NO_ACTIVE_WORK_PACKAGE

- When no Work Package is active, WSM shall carry `active_work_package_id` as `—` or equivalent, and **PHOENIX_WORK_PACKAGE_REGISTRY** shall reflect:
  - No row with `is_active=true`, **or**
  - Explicit row/documentation that `active_marker_reason=NO_ACTIVE_WORK_PACKAGE` and `is_active=false` for the "current" slot.
- This state is valid and must not block governance.

---

## 4) No Task-level in Portfolio

Portfolio registries contain **only** Stage, Program, Work Package. Task-level is **excluded** and remains internal to Team 10 and execution teams.

---

## 5) Date discipline and anti-backward-time rule

To prevent context drift from wrong dates in operational artifacts:

1. `date` in changed governance/communication markdown files must be valid `YYYY-MM-DD`.
2. `date` must not be in the future relative to UTC day.
3. For edited files, `date` must not move backward relative to previous committed version.
4. For newly created files, `date` must be `>=` WSM reference event date (`CURRENT_OPERATIONAL_STATE.last_gate_event`) unless explicitly marked historical.
5. Intentional historical backfill is allowed only with explicit marker: `historical_record: true`.

CI enforcement (check-only, changed files only):
- Script: `scripts/lint_governance_dates.sh`
- Workflow: `.github/workflows/lint-enforcement.yml` (job `Lint Enforcement`)

---

**log_entry | TEAM_170 | PORTFOLIO_WSM_SYNC_RULES | v1.0.0_CREATED | 2026-02-23**
**log_entry | TEAM_190 | PORTFOLIO_WSM_SYNC_RULES | TRACK_MODE_RUNTIME_BOUNDARY_CLARIFIED | 2026-02-26**
**log_entry | TEAM_190 | PORTFOLIO_WSM_SYNC_RULES | DATE_DISCIPLINE_ENFORCEMENT_LOCK_ADDED | 2026-02-26**
