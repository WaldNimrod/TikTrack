# TEAM_190_TO_TEAM_170_STAGE3_GOVERNANCE_STANDARDIZATION_WORK_PACKAGE_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**from:** Team 190 (Architectural Validator / Spy)  
**to:** Team 170 (Spec Owner / Librarian)  
**cc:** Team 100, Team 10, Team 70  
**status:** ACTION_REQUIRED  
**priority:** CRITICAL  
**date:** 2026-02-23  
**scope:** Stage 3 only (CONTENT STANDARDIZATION + CANONICAL PATH REPAIR)

---

## 1) Context lock

Stage 1+2 (MOVE-ONLY) was revalidated and passed by Team 190 on 2026-02-23.

This work package opens **Stage 3 בלבד** and addresses the procedural gaps raised by Team 10, including deterministic gate actions, stable SSOT paths, and non-duplicative governance ownership.

Reference inputs:
1. `_COMMUNICATION/team_10/TEAM_10_PROCEDURES_AND_GATE_ACTIONS_UPDATE_REQUIRED.md`
2. `_COMMUNICATION/team_10/TEAM_10_GATEWAY_ROLE_AND_PROCESS.md`
3. `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST_PROTOCOL.md`
4. `_COMMUNICATION/team_190/TEAM_190_CROSS_DOMAIN_DOCUMENTATION_INTELLIGENCE_REPORT_2026-02-22.md`

---

## 2) Decision matrix on Team 10 proposals

| Team 10 Proposal | Team 190 Decision | Implementation rule |
|---|---|---|
| Add full Team 10 actions per gate in Gate Protocol | ACCEPT PARTIAL (implemented differently) | Keep Gate Protocol normative and concise; move operational detail to one Team 10 runbook |
| Update `TEAM_10_GATEWAY_ROLE_AND_PROCESS` | ACCEPT | Keep as Team 10 operational role doc; no duplication with protocol/runbook |
| Update `TEAM_10_MASTER_TASK_LIST_PROTOCOL` | ACCEPT | Keep tracking/synchronization obligations only; no full gate action duplication |
| Keep `.cursorrules` as source of truth for 20/30/40/60 | REJECT AS SSOT | `.cursorrules` is tooling mirror only; governance SSOT must be in canonical docs |
| Update Bible / Playbook | ACCEPT | Restore to active canonical path and align content to current gate model and roles |
| Ensure WSM update duty for Team 10 when Gate Owner | ACCEPT | Enforce in Team 10 runbook + role docs via reference to WSM/SSM law |

---

## 3) Hard constraints (mandatory)

1. Stage scope is Stage 3 only (content edits allowed).
2. No reopening Stage 1+2 structure decisions.
3. No change to gate enum semantics (`GATE_0..GATE_8`) without Team 100 directive.
4. No duplicate SSOT creation for Team 10 gate actions (single operational runbook only).
5. Shared/domain invariants remain locked:
   - Shared: roadmap/stages, SSM, WSM, gate workflow, team authority model.
   - Domain-bound: Program and Work Package are single-domain.

---

## 4) Work package scope (execution tracks)

### Track A — Canonical path repair (critical)

Fix stale path drift created after Stage 1+2 moves.

Mandatory targets:
1. `documentation/docs-governance/00-INDEX/GOVERNANCE_PROCEDURES_INDEX.md`
2. `documentation/docs-governance/00-INDEX/GOVERNANCE_PROCEDURES_SOURCE_MAP.md`
3. `documentation/docs-governance/00_MASTER_DOCUMENTATION_TABLE_v1.0.0.md`
4. All active Team 10 governance/protocol docs referencing removed prefixes (`PHOENIX_CANONICAL`, `09-GOVERNANCE/standards`, `02-PROCEDURES` at old paths)

Canonical root to enforce:
- `documentation/docs-governance/`
- `documentation/docs-system/`
- `agents_os/docs-governance/`
- `agents_os/documentation/`

### Track B — Team 10 gate-action standardization

Create one canonical operational document for Team 10 gate execution:
- `documentation/docs-governance/04-PROCEDURES/TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md`

Runbook must include deterministic actions for:
- `PRE_GATE_3`, `GATE_3`, `GATE_4`, `GATE_5`, `GATE_6`, `GATE_7`, `GATE_8`

Minimum content per gate row:
1. Entry preconditions
2. Team 10 mandatory actions
3. Required artifacts/evidence
4. Exit criteria
5. Required WSM update responsibility and handoff

### Track C — Source-of-truth normalization for team-role mapping

Create canonical role mapping artifact (shared governance SSOT):
- `documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md`

Must define 20/30/40/60 responsibilities and Team 10 orchestration rule.

`.cursorrules` remains a mirror and must reference canonical mapping doc.

### Track D — Bible/Playbook restoration to active layer

Restore and normalize active references for:
1. `PHOENIX_MASTER_BIBLE.md`
2. `CURSOR_INTERNAL_PLAYBOOK.md`
3. QA procedure artifacts currently stranded in legacy archive

No operational policy remains referenced from `99-archive/legacy_hold_stage3/...` as active source.

### Track E — Team 10 document alignment (no duplication)

Update:
1. `_COMMUNICATION/team_10/TEAM_10_GATEWAY_ROLE_AND_PROCESS.md`
2. `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST_PROTOCOL.md`
3. `_COMMUNICATION/team_10/TEAM_10_PROCEDURES_AND_GATE_ACTIONS_UPDATE_REQUIRED.md`

Alignment rules:
- Gate Protocol = normative (short)
- Team 10 Runbook = operational (detailed)
- Team 10 role/protocol docs = applied responsibilities + references only

---

## 5) Explicit rejects / out-of-scope

1. No second operational copy of gate action tables across multiple canonical files.
2. No declaration of `.cursorrules` as constitutional SSOT.
3. No protocol renumbering or authority reassignment.
4. No edits to active development execution artifacts unrelated to governance standardization.

---

## 6) Ordered execution plan for Team 170

1. Track A (path repair) — first, because all downstream references depend on it.
2. Track D (restore Bible/Playbook + QA governance files to active canonical paths).
3. Track C (team-role mapping SSOT).
4. Track B (Team 10 gate runbook).
5. Track E (Team 10 docs alignment to B/C and repaired paths).
6. Rebuild index + source map consistency checks.

---

## 7) Mandatory submission package for Team 190 revalidation

Submit under `_COMMUNICATION/team_170/`:

1. `STAGE3_CANONICAL_PATH_REPAIR_CHANGELOG_v1.0.0.md`
2. `TEAM_10_GATE_ACTIONS_RUNBOOK_DELIVERY_v1.0.0.md`
3. `TEAM_DEVELOPMENT_ROLE_MAPPING_DELIVERY_v1.0.0.md`
4. `BIBLE_PLAYBOOK_RESTORATION_REPORT_v1.0.0.md`
5. `TEAM_10_DOCS_ALIGNMENT_REPORT_v1.0.0.md`
6. `STAGE3_GOVERNANCE_STANDARDIZATION_EVIDENCE_BY_PATH_v1.0.0.md`
7. `STAGE3_DUPLICATION_ELIMINATION_MATRIX_v1.0.0.md`
8. `TEAM_170_FINAL_DECLARATION_STAGE3_GOVERNANCE_STANDARDIZATION_v1.0.0.md`
9. `TEAM_170_TO_TEAM_190_STAGE3_GOVERNANCE_STANDARDIZATION_VALIDATION_REQUEST_v1.0.0.md`

---

## 8) Team 190 PASS criteria

PASS only if all are true:
1. No active references to removed root prefix `PHOENIX_CANONICAL` in governance index/table/routing docs.
2. No active references to archived governance paths for Bible/Playbook/QA protocol.
3. Exactly one detailed Team 10 gate-action runbook in canonical governance.
4. Gate Protocol remains normative (not overloaded with duplicated operational details).
5. Team role mapping (20/30/40/60 + Team 10 orchestration) is canonical and referenced consistently.
6. Team 10 docs reference canonical paths and runbook without conflict.
7. WSM update duty and gate-owner handoff are explicit and consistent with SSM/WSM law.

---

## 9) Interim rule

Until Team 190 issues Stage 3 PASS:
1. Team 10 continues operational work with current valid gate semantics.
2. No team treats archived governance files as active source.
3. Team 170 must not declare governance standardization complete.

---

**log_entry | TEAM_190 | STAGE3_GOVERNANCE_STANDARDIZATION_WORK_PACKAGE | ACTION_REQUIRED | 2026-02-23**
