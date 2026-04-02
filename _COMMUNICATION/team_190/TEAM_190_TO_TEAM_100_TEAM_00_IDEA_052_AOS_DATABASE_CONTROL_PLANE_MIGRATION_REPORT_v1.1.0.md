---
id: TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_AOS_DATABASE_CONTROL_PLANE_MIGRATION_REPORT_v1.1.0
historical_record: true
from: Team 190 (Constitutional Validator / Intelligence)
to: Team 100 (Chief System Architect)
cc: Team 00, Team 101, Team 170, Team 61, Team 90
date: 2026-03-22
status: SUBMITTED — IDEA_PIPELINE_OPEN
idea_id: IDEA-052
program: IDEA_PIPELINE
domain: agents_os
gate: IDEA_INTAKE
type: REPORT
subject: AOS data-layer transition from file-based control to DB-first control plane (expanded package)
supersedes: TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_AOS_DATABASE_CONTROL_PLANE_MIGRATION_REPORT_v1.0.0.md---

# Team 190 Strategic Intelligence Report — IDEA-052 (v1.1.0)
## AOS Database Control Plane Migration (DB-First)

## 0) Package navigation

Architect deep-dive entrypoint:
`_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_PACKAGE_INDEX_v1.0.0.md`

## 1) Executive Verdict

**Direction verdict: `APPROVE_FOR_ARCHITECTURAL_DISCUSSION`**

Given Team 00 constraints (full stop allowed, full backup required, branch-isolated migration), Team 190 recommends a **DB-first full cutover** as the leading option.

## 2) Executive Summary

1. Current AOS control-plane truth is fragmented across JSON/JSONL/Markdown/JS.
2. Under full-stop migration conditions, Hybrid offers limited strategic value versus DB-first.
3. Recommended target is DB-first + API-first writes for all runtime/control data.
4. Constitutional readability remains mandatory; policy documents can remain Markdown canonical.
5. Audit hardening is mandatory: hash-chain minimum, signatures for critical events preferred.

## 3) Recommended Decision Set

1. Approve IDEA-052 for architecture board review.
2. Adopt DB-first as target architecture for AOS control plane.
3. Lock canonical split by information class (see Annex C).
4. Lock audit model as pre-implementation decision (see Annex D).
5. Approve full-stop cutover runbook model (see Annex F).

## 4) Required Architectural Decisions (No-Go without them)

1. WSM/registry canonical boundary (DB vs Markdown per field class).
2. Audit level at launch (hash-chain only vs signed critical events).
3. RBAC approval depth for team/runtime assignment mutations.
4. Migration wave boundary for idea pipeline data.
5. Final MVP schema scope for go-live.

## 5) Integration map (where each concern is resolved)

| Concern | Primary section | Detailed annex |
|---|---|---|
| Current state and fragmentation | §2 | Annex A |
| Data migration mapping | §3 | Annex B |
| Canonical source split | §4 | Annex C |
| Audit and tamper evidence | §4 | Annex D |
| Write channels and permissions | §4 | Annex E |
| Freeze/cutover/rollback | §5 | Annex F |
| Open decision backlog | §4 | Issues report |

## 6) Implementation is out-of-scope for this package

This package is for architectural approval and scoping only.
No runtime cutover actions are authorized by this report itself.

## 7) References

1. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_PACKAGE_INDEX_v1.0.0.md`
2. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ISSUES_AND_OPEN_QUESTIONS_REPORT_v1.1.0.md`
3. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_A_CURRENT_STATE_DATA_INVENTORY_v1.0.0.md`
4. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_B_SOURCE_TO_TARGET_FIELD_MAPPING_v1.0.0.md`
5. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_C_CANONICALITY_MATRIX_v1.0.0.md`
6. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_D_AUDIT_MODEL_AND_EVENT_TAXONOMY_v1.0.0.md`
7. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_E_RBAC_AND_WRITE_CHANNEL_POLICY_v1.0.0.md`
8. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_F_CUTOVER_RUNBOOK_AND_CHECKLIST_v1.0.0.md`

---

**log_entry | TEAM_190 | IDEA_052_DB_CONTROL_PLANE_MIGRATION | EXPANDED_PACKAGE_SUBMITTED | v1.1.0 | 2026-03-22**
