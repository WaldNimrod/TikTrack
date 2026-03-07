# PHOENIX_SOURCE_AUTHORITY_CONVERGENCE_PROGRAM_v1.0.0
**project_domain:** SHARED (TIKTRACK + AGENTS_OS)

**id:** PHOENIX_SOURCE_AUTHORITY_CONVERGENCE_PROGRAM_v1.0.0  
**from:** Team 10 (Gateway Orchestration)  
**to:** Teams 00, 70, 90, 100, 170, 190  
**cc:** Delivery teams (20/30/40/50/60)  
**date:** 2026-02-26  
**status:** SUPERSEDED_BY_v1.1.0  
**purpose:** Reduce operational drift from source over-abundance by converging to a single active authority set per subject.
**superseded_by:** `_COMMUNICATION/PHOENIX_SOURCE_AUTHORITY_CONVERGENCE_PROGRAM_v1.1.0.md`

---

## Mandatory Identity Header

| Field | Value |
|---|---|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S002 |
| program_id | S002-P001 |
| work_package_id | N/A |
| task_id | N/A |
| gate_id | GOVERNANCE_PROGRAM |
| phase_owner | Team 10 |
| required_ssm_version | 1.0.0 |
| required_active_stage | S002 |

---

## 1) Problem Statement (Locked Framing)

There is no procedural knowledge gap and no document shortage.  
The core issue is **source over-abundance**: multiple parallel references for the same subject create high maintenance overhead and recurrent interpretation drift.

Program objective is therefore not "write more governance", but **reduce active authority surfaces** while preserving historical knowledge.

---

## 2) Program Goals

1. Enforce one active authoritative source per governance subject.
2. Keep historical material accessible without operational authority.
3. Remove broken or non-existent active references from bootstrap/context files.
4. Create deterministic runtime reading sets for architecture/validation teams (00/100/90/190).
5. Add repeatable drift controls (lint + weekly maintenance cadence).

### 2.1 Success Metrics

| Metric | Baseline | Target |
|---|---|---|
| Active references to non-existent paths | >0 | 0 |
| Subjects with >1 ACTIVE authority source | High | <=1 per subject |
| Time to align new session context | High variance | <=10 minutes deterministic |
| Governance drift incidents per week | Recurrent | Downward trend after Phase 2 |

---

## 3) Program Phases (Overview)

### Phase 1 — Authority Freeze and Baseline Mapping
- Output: current-state baseline + active authority draft set.
- Outcome: no ambiguity on "what is currently active vs reference vs historical".

### Phase 2 — Path and Reference Normalization
- Output: fixed references, supersedes graph, deprecation markers.
- Outcome: no operational dependence on dead/legacy paths.

### Phase 3 — Runtime Packs by Team Role
- Output: lean runtime cards for Teams 00/100/90/190.
- Outcome: deterministic context load order per role and gate state.

### Phase 4 — Drift Prevention Automation
- Output: pre-merge drift lint and weekly maintenance loop.
- Outcome: continued stability without manual firefighting.

---

## 4) Phase 1 — Full Execution Preparation (Detailed)

## 4.1 Phase Objective

Produce a single baseline pack that classifies all relevant sources into:
- `ACTIVE_AUTHORITY`
- `REFERENCE_ONLY`
- `ARCHIVED_CONTEXT`

No content rewrite in Phase 1; classification and authority freeze only.

## 4.2 Scope (Phase 1)

Mandatory scope:
- `_COMMUNICATION/team_00/`
- `_COMMUNICATION/team_90/`
- `_COMMUNICATION/team_100/`
- `_COMMUNICATION/team_190/`
- `_COMMUNICATION/_Architects_Decisions/`
- `_COMMUNICATION/_ARCHITECT_INBOX/` (path-level, no content rewrite)
- `00_MASTER_INDEX.md`
- `.cursorrules`
- `CLAUDE.md`
- `documentation/docs-governance/00-INDEX/*`
- `documentation/docs-governance/01-FOUNDATIONS/*`
- `documentation/docs-governance/00_DOCUMENTATION_FOLDER_STRUCTURE_CANONICAL_v1.0.0.md`

Out of scope (Phase 1):
- Policy text rewrites
- Gate semantics redesign
- Runtime implementation/code changes
- Any archive deletion

## 4.3 Workstreams

### WS1 — Source Inventory Snapshot
- Build counts and recency per team authority folders.
- Identify high-density clusters causing interpretation collisions.

### WS2 — Path Health Baseline
- Detect active references that point to missing paths.
- Prioritize bootstrap files first (`.cursorrules`, `00_MASTER_INDEX.md`, main governance indexes).

### WS3 — Authority Subject Mapping
- Build `subject -> primary active source`.
- Flag multi-source authority collisions.

### WS4 — Freeze Candidate Set
- Produce draft list of approved active files for Phase 2 normalization.
- Mark all others as reference/historical candidates without deleting them.

## 4.4 Deliverables (Phase 1)

1. Program charter and execution structure (this document).
2. Baseline metrics table (counts + reference density).
3. Missing-path findings list for active bootstrap/authority files.
4. Phase 2-ready authority convergence queue (prioritized).

## 4.5 Roles and Ownership

| Role | Owner | Responsibility in Phase 1 |
|---|---|---|
| Phase owner | Team 10 | Overall orchestration and convergence decisions |
| Validation owner | Team 90 | Validate classification integrity and no authority drift |
| Architecture authority | Team 100 + Team 00 | Resolve authority conflicts |
| SSOT integrity | Team 170 | Ensure mapping consistency with canonical foundations |
| Constitutional validation | Team 190 | Validate no rule-level contradiction in active set |

## 4.6 Exit Criteria (Phase 1)

Phase 1 is complete only if:
1. Baseline metrics and missing-path findings are published.
2. Every finding has severity and phase assignment (Phase 2 queue).
3. Teams 00/100/90/190 are aligned on the classification model.
4. No unresolved ambiguity remains on current baseline scope.

---

## 5) Phase 2 Queue (Generated from Phase 1)

Priority queue template (to execute next):

| Queue ID | Severity | Item | Source | Target Phase |
|---|---|---|---|---|
| Q-001 | P0 | Fix bootstrap references to missing canonical paths | `.cursorrules`, `00_MASTER_INDEX.md` | Phase 2 |
| Q-002 | P0 | Resolve inconsistent canonical root references (`PHOENIX_CANONICAL` vs existing root) | governance indexes/foundations | Phase 2 |
| Q-003 | P1 | Normalize template path references under active governance structure | Team 10/170/90 execution artifacts | Phase 2 |
| Q-004 | P1 | Update stale onboarding snapshots for Team 00 after WSM gate progression | Team 00 onboarding set | Phase 2 |
| Q-005 | P1 | Refresh Team 190 constitution reference to current gate ownership model | foundations constitution artifacts | Phase 2 |

---

## 6) Phase 1 Outputs (Produced Baseline)

Execution date baseline: **2026-02-26**

### 6.1 Volume Snapshot (Team folders)

| Team folder | Markdown files |
|---|---|
| `_COMMUNICATION/team_00/` | 4 |
| `_COMMUNICATION/team_90/` | 37 |
| `_COMMUNICATION/team_100/` | 96 |
| `_COMMUNICATION/team_190/` | 131 |

### 6.2 Reference Density Snapshot

| Pattern | Occurrences |
|---|---|
| `documentation/docs-governance/PHOENIX_CANONICAL/` | 112 |
| `documentation/docs-governance/AGENTS_OS_GOVERNANCE/` | 402 |

### 6.3 Missing-Path Findings (Critical Baseline)

1. `.cursorrules` references missing:
   - `documentation/docs-governance/02-PROCEDURES/TEAM_30_FRONTEND_STANDARDS_QA_PROCEDURE.md`
   - `documentation/docs-governance/09-GOVERNANCE/standards/PHOENIX_MASTER_BIBLE.md`
2. `00_MASTER_INDEX.md` references missing:
   - `documentation/docs-governance/PHOENIX_CANONICAL/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`
   - `documentation/docs-governance/PHOENIX_CANONICAL/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md`
   - `documentation/docs-governance/PHOENIX_CANONICAL/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md`
3. `TEAM_10_S002_P001_WP001_WORK_PACKAGE_DEFINITION.md` references missing:
   - `documentation/docs-governance/AGENTS_OS_GOVERNANCE/02-TEMPLATES/`
4. `AGENTS_OS_CORE_VALIDATION_ENGINE_LLD400_v1.0.0.md` references missing:
   - `documentation/docs-governance/AGENTS_OS_GOVERNANCE/02-TEMPLATES/LOD200_TEMPLATE_v1.0.0.md`
   - `documentation/docs-governance/AGENTS_OS_GOVERNANCE/02-TEMPLATES/LLD400_TEMPLATE_v1.0.0.md`

These findings are the formal input queue for Phase 2 normalization.

---

## 7) Execution Guardrails

1. No deletion of historical files in this program unless explicitly approved.
2. No creation of additional governance layers to solve source over-abundance.
3. Every normalization change must preserve existing evidence traceability.
4. All active authority changes require explicit supersedes notation.
5. WSM/SSM semantics are not changed by this program.

---

**log_entry | TEAM_10 | SOURCE_AUTHORITY_CONVERGENCE_PROGRAM | PHASE_1_BASELINE_PUBLISHED | 2026-02-26**
