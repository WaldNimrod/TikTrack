---
id: TEAM_190_TO_TEAM_00_IDEA_052_AOS_V3_DB_SPEC_WORKING_PACKAGE_v1.0.0
historical_record: true
from: Team 190
to: Team 00 (Nimrod)
cc: Team 101, Team 170, Team 61, Team 90
date: 2026-03-23
status: INTERNAL_WORKING_DRAFT — NOT_READY_FOR_TEAM_100_SUBMISSION
idea_id: IDEA-052
program: AOS_V3_PREPARATION
domain: agents_os
type: WORKING_SPEC_PACKAGE
subject: Unified internal package for AOS v3 DB-spec preparation (locked decisions + full scope mapping)---

# IDEA-052 — AOS v3 DB Specification Working Package (Internal)

## 0) Purpose and boundary

This is the **internal consolidation layer** for Team 00.
It is not an architect submission package yet.

Goal:
1. Keep all locked decisions in one place.
2. Keep full context and full scope coverage (future programs + active idea backlog).
3. Build toward one coherent, validated `AOS v3` specification package.

## 1) Locked decisions register (as of 2026-03-23)

| Lock ID | Locked decision | Why locked now | Canonical source |
|---|---|---|---|
| L-01 | Migration mode assumes full-stop cutover (backup + branch-isolated rehearsal) | Team 00 constraint removes hybrid runtime pressure | `TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_AOS_DATABASE_CONTROL_PLANE_MIGRATION_REPORT_v1.2.2.md` |
| L-02 | Target direction is DB-first control plane | Reduces drift across runtime/config/state paths | `TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_AOS_DATABASE_CONTROL_PLANE_MIGRATION_REPORT_v1.2.2.md` |
| L-03 | Deterministic DB-vs-FILE classification is mandatory | Prevents mixed-canonical ambiguity per data item | `TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_G_DB_FILE_CLASSIFICATION_RULESET_v1.0.0.md` |
| L-04 | Context model is fixed to existing V2 4 layers only | Improvement allowed, model replacement forbidden | `TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_H_CONTEXT_FORMAT_AND_CACHE_POLICY_v1.0.0.md` + `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md` |
| L-05 | Cache policy must be configurable with UI controls and safe defaults | Token overhead is a first-class architecture constraint | `TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_H_CONTEXT_FORMAT_AND_CACHE_POLICY_v1.0.0.md` |
| L-06 | Normal mode mutations are user-managed via management UI | Keeps daily operations out of ad hoc LLM/manual edits | `TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_H_CONTEXT_FORMAT_AND_CACHE_POLICY_v1.0.0.md` |
| L-07 | Structural/control-plane contract changes require explicit architectural instruction | Protects system invariants and governance boundaries | `TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_E_RBAC_AND_WRITE_CHANNEL_POLICY_v1.0.0.md` + Annex H |
| L-08 | `DB_DEPENDENCY_REF: IDEA-052` stays mandatory across impacted AOS programs | Enforces reverse traceability and anti-drift planning | `TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_AOS_PROGRAM_REVERSE_REFERENCES_v1.0.0.md` |

## 2) Full context baseline used by this package

### 2.1 Governance/runtime anchors

1. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_PROGRAM_REGISTRY_v1.0.0.md`
2. `documentation/docs-governance/04-PROCEDURES/AGENTS_OS_V2_OPERATING_PROCEDURES_v1.0.0.md`
3. `agents_os_v2/context/injection.py`
4. `_COMMUNICATION/PHOENIX_IDEA_LOG.json`

### 2.2 Existing IDEA-052 package assets

1. Package index `...IDEA_052_PACKAGE_INDEX_v1.1.0.md`
2. Core report `...MIGRATION_REPORT_v1.2.2.md`
3. Issues report `...ISSUES_AND_OPEN_QUESTIONS_REPORT_v1.2.0.md`
4. Annexes A..H (inventory, mapping, canonicality, audit, RBAC, cutover, DB/FILE rules, context+cache policy)
5. Impact matrix + reverse references + AOS v3 coherence plan

## 3) Full-scope map (future-oriented)

### 3.1 Program scope (AOS programs still relevant for future v3 integration)

| Program | Registry status | Relevance to DB-spec package | Priority in this working stream |
|---|---|---|---|
| S002-P005 | ACTIVE | Write semantics + UI operator behavior alignment to DB/API mutation model | CRITICAL |
| S003-P011 | COMPLETE (state shows active flow note) | Core process model and gate semantics must stay invariant through migration | CRITICAL |
| S004-P001 | PLANNED | Numeric precision constraints in DB schema/contracts | HIGH |
| S004-P002 | PLANNED | Business rule consistency over relational state/event model | HIGH |
| S004-P003 | PLANNED | Spec generation consumes normalized contracts/metadata | MEDIUM |
| S004-P008 | PLANNED | Mediated reconciliation depends on immutable audit + strict mutation policy | CRITICAL |
| S005-P001 | PLANNED | Analytics quality depends on trustworthy DB history/contracts | MEDIUM |

Reference:
`TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_AOS_PROGRAM_IMPACT_MATRIX_v1.0.0.md`

### 3.2 Idea scope (agents_os backlog not yet decided/closed)

Source snapshot:
`_COMMUNICATION/PHOENIX_IDEA_LOG.json` (domain=`agents_os`, status in `open|in_execution|lod200_pending`)

| Idea | Status | Urgency | Scope title | Fate | Fate target |
|---|---|---|---|---|---|
| IDEA-001 | LOD200_PENDING | low | Standalone PIPELINE_HELP.html — dedicated help page (Option B) | new_wp | S003-P007 backlog candidate |
| IDEA-002 | IN_EXECUTION | medium | PIPELINE_TEAMS.html update — Process-Functional separation + Team 10 Mode 1/2/3 | immediate | TEAM_00_TO_TEAM_30_AOS_TEAMS_PAGE_UPDATE_MANDATE_v1.0.0.md |
| IDEA-003 | IN_EXECUTION | medium | AOS Docs Audit — standing governance thread (Teams 170+190 joint) | immediate | TEAM_00_TO_TEAM_170_TEAM_190_AOS_DOCS_AUDIT_MANDATE_v1.0.0.md |
| IDEA-005 | IN_EXECUTION | medium | Mode 1 Routing Table document (TEAM_10_MODE1_ROUTING_TABLE) | append | AOS Docs Audit mandate — Team 170 deliverable |
| IDEA-007 | LOD200_PENDING | low | Ideas Pipeline Phase 2 — grooming automation, UI fate-decision interface | new_wp | S002-P005 backlog — WP004 candidate |
| IDEA-008 | IN_EXECUTION | high | Help modal 4-tab upgrade — Option A immediate (context banner, Three Modes, domain section) | immediate | TEAM_00_TO_TEAM_61_HELP_MODAL_UPGRADE_MANDATE_v1.0.0.md |
| IDEA-018 | LOD200_PENDING | low | Pipeline stage transitions + roadmap management — completion of scripts and interface | new_wp | S004 candidate WP — stage transition scripts + management UI |
| IDEA-021 | LOD200_PENDING | low | Model B file structure definition (Stage B) | new_wp | S003-P007 (Command Bridge Lite / ADR-031 Stage B) — part of Stage B scope |
| IDEA-022 | LOD200_PENDING | low | Formal D-04 approval confirmation doc (Stage C) | new_wp | S004-P008 or later — ADR-031 Stage C (post-S003) |
| IDEA-038 | LOD200_PENDING | medium | Gate Prompt Lifecycle Management — Archive + Cleanup on Gate Advance | new_wp | S003-P008-WP001 |
| IDEA-039 | LOD200_PENDING | low | test_cursor_prompt Accumulation Cap + Cleanup | new_wp | S003-P008-WP001 |
| IDEA-040 | LOD200_PENDING | medium | Pre-activation Checklist Machine Enforcement | new_wp | S003-P008-WP001 |
| IDEA-041 | IN_EXECUTION | medium | Prompt Staleness Guard — Auto-regenerate on State File Change | immediate | A1 implementation in pipeline_run.sh _show_prompt() |
| IDEA-042 | LOD200_PENDING | medium | LOD200 Pre-activation Machine-Readable Ordering Table | new_wp | S003-P008-WP001 |
| IDEA-043 | OPEN | high | WP Lifecycle Manager: init/hold/resume/cancel/close as CLI + Dashboard UI | - | - |
| IDEA-044 | OPEN | high | Gate Terminology Canonicalization: fix G3_PLAN/G3_5/CURSOR_IMPLEMENTATION naming drift | - | - |
| IDEA-045 | OPEN | medium | Canonicalize Team 190 correction prompt template for BLOCK_FOR_FIX cycles | - | - |
| IDEA-046 | OPEN | low | Team 00 manual bypass correction mandate was suboptimal — process gap | - | - |
| IDEA-047 | OPEN | medium | GATE_2 phase routing bug — Work Plan phases skipped before arch sign-off | - | - |
| IDEA-048 | OPEN | medium | GATE_SEQUENCE_CANON §8 G3_PLAN row: 'current_phase=2.2' contradicts CRITICAL note '3.1' | - | - |
| IDEA-049 | OPEN | low | Team 90 validation prompt: define route_recommendation schema for PASS verdicts | - | - |
| IDEA-050 | OPEN | medium | pipeline_run.sh pass: add GATE_N identifier for mismatch detection | - | - |
| IDEA-051 | OPEN | high | AOS Scheduler reclassification + research-based architecture direction | - | - |
| IDEA-052 | OPEN | high | AOS control plane migration to DB-first architecture | - | - |

## 4) “Single package” assembly model (target state)

### 4.1 Package composition target

Final `AOS v3` spec package must contain:
1. Locked decisions sheet (current + revision history).
2. Full data classification catalog (DB/FILE per item, no unresolved rows).
3. Context contract (4-layer lock + per-layer optimization controls).
4. Cache contract (defaults, invalidation matrix, UI operations, audit trail).
5. Program integration matrix (all future-relevant AOS programs).
6. Idea backlog mapping (all open/in-execution/lod200_pending ideas).
7. Open decisions and explicit owners (no hidden assumptions).
8. Go/No-Go readiness checklist for architect submission.

### 4.2 Non-negotiable package integrity rules

1. Every lock entry has a canonical source reference.
2. Every future program in scope has dependency mapping to IDEA-052.
3. Every active/pending idea is either mapped to v3 scope or explicitly excluded with reason.
4. No “implicit” policy; all defaults and mutation authorities are documented.

## 5) Open items before Team 100 submission

The following are still open and block architect handoff:
1. Final canonical boundary details for WSM/registry fields.
2. Audit launch depth decision (hash-chain baseline vs signed critical events at launch).
3. Dual-approval matrix by mutation class.
4. Wave boundary for idea pipeline migration (wave 1 vs wave 2).
5. MVP schema exact acceptance list.
6. Cache SLO numeric thresholds and breach handling.

Reference:
`TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ISSUES_AND_OPEN_QUESTIONS_REPORT_v1.2.0.md`

## 6) Working cadence from this point

1. Continue reviewing remaining future programs/ideas against this package.
2. Add lock/update rows only with source-backed evidence.
3. Maintain this file as the internal “single-pane” package coordinator.
4. Submit to Team 100 only after open blockers in §5 are resolved or explicitly risk-accepted by Team 00.

---

**log_entry | TEAM_190 | IDEA_052_WORKING_PACKAGE | INTERNAL_SINGLE_PACKAGE_CONSOLIDATION_STARTED | v1.0.0 | 2026-03-23**
