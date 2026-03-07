# PORTFOLIO_INDEX

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** PORTFOLIO_INDEX  
**owner:** Team 170 (Spec Owner / Librarian Flow)  
**date:** 2026-02-23  
**directive:** TEAM_190_TO_TEAM_170_PORTFOLIO_CANONICALIZATION_MIGRATION_WORK_PACKAGE_v1.0.0  
**purpose:** Single entrypoint for canonical Portfolio layer (Roadmap, Program, Work Package). Runtime state remains in WSM only.

---

## 1) Boundary rule

**Runtime state** (active stage, current gate, `track_mode`, last_gate_event, active_work_package_id) — **sole SSOT:** `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` block **CURRENT_OPERATIONAL_STATE**.

**Portfolio state** (Stage/Program/Work Package structural catalog and gate mirror) — canonical artifacts below. No Task-level in Portfolio.

---

## 2) Canonical Portfolio artifacts

| Artifact | Path | Purpose |
|----------|------|---------|
| PORTFOLIO_INDEX | `documentation/docs-governance/00-INDEX/PORTFOLIO_INDEX.md` | This file — entrypoint |
| PHOENIX_PORTFOLIO_ROADMAP | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PORTFOLIO_ROADMAP_v1.0.0.md` | Single roadmap; Stage-level only |
| PHOENIX_PROGRAM_REGISTRY | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md` | Programs (single domain each); current_gate_mirror from WSM |
| PHOENIX_WORK_PACKAGE_REGISTRY | `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_WORK_PACKAGE_REGISTRY_v1.0.0.md` | Work Packages; current_gate, is_active, active_marker_reason |
| PORTFOLIO_WSM_SYNC_RULES | `documentation/docs-governance/01-FOUNDATIONS/PORTFOLIO_WSM_SYNC_RULES_v1.0.0.md` | Contract: WSM gate update → mirror update in registries |

---

## 3) Hierarchy (locked)

Roadmap → Stage → Program → Work Package → Task.  
Task-level is **not** in Portfolio; it is internal to Team 10 and execution teams.

Canonical identifiers and parent binding:

- `stage_id`: `S{NNN}` (example: `S002`)
- `program_id`: `S{NNN}-P{NNN}` and must belong to its parent `stage_id` (example: `S002-P001`)
- `work_package_id`: `S{NNN}-P{NNN}-WP{NNN}` and must belong to its parent `program_id` (example: `S002-P001-WP002`)

Lifecycle rule:

- Gate lifecycle is managed only at **Work Package** level (`GATE_3..GATE_8`).
- Stage and Program are packaging/catalog layers. Program `current_gate_mirror` is informational mirror from WSM and not an independent runtime gate-state authority.

---

**log_entry | TEAM_170 | PORTFOLIO_INDEX | CREATED | 2026-02-23**
**log_entry | TEAM_190 | PORTFOLIO_INDEX | WSM_TRACK_MODE_RUNTIME_FIELD_NOTED | 2026-02-26**
