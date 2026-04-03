---
id: TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_AOS_DATABASE_CONTROL_PLANE_MIGRATION_REPORT_v1.2.2
historical_record: true
from: Team 190 (Constitutional Validator / Intelligence)
to: Team 100 (Chief System Architect)
cc: Team 00, Team 101, Team 170, Team 61, Team 90
date: 2026-03-23
status: SUBMITTED — IDEA_PIPELINE_OPEN
idea_id: IDEA-052
program: IDEA_PIPELINE
domain: agents_os
gate: IDEA_INTAKE
type: REPORT
subject: AOS data-layer transition from file-based control to DB-first control plane (4-layer context + cache-governance revision)
supersedes: TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_AOS_DATABASE_CONTROL_PLANE_MIGRATION_REPORT_v1.2.1.md---

# Team 190 Strategic Intelligence Report — IDEA-052 (v1.2.2)
## AOS Database Control Plane Migration (DB-First)

## 0) Package navigation

Architect deep-dive entrypoint:
`_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_PACKAGE_INDEX_v1.1.0.md`

## 1) Executive Verdict

**Direction verdict: `APPROVE_FOR_ARCHITECTURAL_DISCUSSION`**

Given Team 00 constraints (full stop allowed, full backup required, branch-isolated migration), Team 190 recommends a **DB-first full cutover** as the leading option.

## 2) Executive Summary

1. Current AOS control-plane truth is fragmented across JSON/JSONL/Markdown/JS.
2. Under full-stop migration conditions, Hybrid offers limited strategic value versus DB-first.
3. Recommended target is DB-first + API-first writes for all runtime/control data.
4. Constitutional readability remains mandatory; policy documents can remain Markdown canonical.
5. Audit hardening is mandatory: hash-chain minimum, signatures for critical events preferred.
6. Cross-program integration is now formalized via impacted-program matrix and reverse-reference map.
7. DB-vs-FILE classification now has deterministic rules + mapping sample (Annex G).
8. Context format policy is **improvement-only** over existing V2 **4-layer model** (no new layer model).
9. Token efficiency is treated as a hard architecture constraint via configurable cache policy + UI operations.

## 3) Recommended Decision Set

1. Approve IDEA-052 for architecture board review.
2. Adopt DB-first as target architecture for AOS control plane.
3. Lock canonical split by information class (see Annex C).
4. Lock audit model as pre-implementation decision (see Annex D).
5. Approve full-stop cutover runbook model (see Annex F).
6. Approve reverse-reference enforcement across impacted AOS programs.
7. Lock 4-layer context format policy as canonical (see Annex H).
8. Lock cache governance policy with UI-configurable defaults and safe operations (see Annex H).

## 4) Required Architectural Decisions (No-Go without them)

1. WSM/registry canonical boundary (DB vs Markdown per field class).
2. Audit level at launch (hash-chain only vs signed critical events).
3. RBAC approval depth for team/runtime assignment mutations.
4. Migration wave boundary for idea pipeline data.
5. Final MVP schema scope for go-live.
6. Dependency lock policy across impacted AOS programs.
7. Adopt deterministic DB-vs-FILE classification protocol as mandatory gate for each data item.
8. Context-format governance: 4-layer model lock + allowed optimization surface only.
9. Cache policy lock: default TTL/budget strategy, invalidation triggers, and RBAC for cache operations.

## 5) Integration map (where each concern is resolved)

| Concern | Primary section | Detailed artifact |
|---|---|---|
| Current state and fragmentation | §2 | Annex A |
| Data migration mapping | §3 | Annex B |
| Canonical source split | §4 | Annex C |
| Audit and tamper evidence | §4 | Annex D |
| Write channels and permissions | §4 | Annex E |
| Freeze/cutover/rollback | §5 | Annex F |
| Open decision backlog | §4 | Issues report v1.2.0 |
| Program-level impact and prioritization | §3 | Program Impact Matrix |
| Reverse references in impacted programs | §3 | Reverse References Map |
| AOS v3 coherent integration process | §8 | AOS v3 Coherence Plan |
| Deterministic DB-vs-FILE classification | §4 | Annex G |
| 4-layer context format lock and optimization policy | §4 | Annex H |
| Cache policy and token-efficiency controls | §4 | Annex H |

## 6) Deterministic data classification protocol (new)

IDEA-052 adopts a deterministic classification protocol for every data item:

- Behavioral/runtime control data -> `DB`
- Team work artifacts (prompts, communication docs, reports, plans, spec packages) -> `FILE`

Formal rules, parameters, and mapping sample are locked in:

`_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_G_DB_FILE_CLASSIFICATION_RULESET_v1.0.0.md`

## 7) Context format and cache governance protocol (new)

IDEA-052 locks the following policy:

1. **No new context model** is introduced. The existing V2 4-layer model remains canonical.
2. Improvements are allowed only as deterministic optimization controls:
   - per-layer budgets
   - serialization format constraints
   - cache TTL and invalidation policy
3. Cache configuration must be user-manageable from the management UI with safe defaults and guardrails.
4. Runtime orchestration state remains DB-canonical and protected by validation/authorization.

Formal context-format and cache policy:

`_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_H_CONTEXT_FORMAT_AND_CACHE_POLICY_v1.0.0.md`

## 8) AOS v3 integration track

IDEA-052 is now coupled to a phased integration track for turning idea backlog into coherent `AOS v3` program revisions:

`_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_AOS_V3_COHERENCE_PLAN_v1.0.0.md`

## 9) Implementation is out-of-scope for this package

This package is for architectural approval and scoping only.
No runtime cutover actions are authorized by this report itself.

## 10) References

1. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_PACKAGE_INDEX_v1.1.0.md`
2. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ISSUES_AND_OPEN_QUESTIONS_REPORT_v1.2.0.md`
3. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_AOS_PROGRAM_IMPACT_MATRIX_v1.0.0.md`
4. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_AOS_PROGRAM_REVERSE_REFERENCES_v1.0.0.md`
5. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_AOS_V3_COHERENCE_PLAN_v1.0.0.md`
6. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_G_DB_FILE_CLASSIFICATION_RULESET_v1.0.0.md`
7. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_A_CURRENT_STATE_DATA_INVENTORY_v1.0.0.md`
8. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_B_SOURCE_TO_TARGET_FIELD_MAPPING_v1.0.0.md`
9. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_C_CANONICALITY_MATRIX_v1.0.0.md`
10. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_D_AUDIT_MODEL_AND_EVENT_TAXONOMY_v1.0.0.md`
11. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_E_RBAC_AND_WRITE_CHANNEL_POLICY_v1.0.0.md`
12. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_F_CUTOVER_RUNBOOK_AND_CHECKLIST_v1.0.0.md`
13. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`
14. `_COMMUNICATION/team_190/TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_H_CONTEXT_FORMAT_AND_CACHE_POLICY_v1.0.0.md`
15. `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md`
16. `agents_os_v2/context/injection.py`

---

**log_entry | TEAM_190 | IDEA_052_DB_CONTROL_PLANE_MIGRATION | CONTEXT_FORMAT_AND_CACHE_GOVERNANCE_INTEGRATED | v1.2.2 | 2026-03-23**
