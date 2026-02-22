---
**provenance:** Governance consolidation (Team 170)
**source_path:** _COMMUNICATION/team_100/DEV_OS_TARGET_MODEL_CANONICAL_v1.3.1/04_GATE_MODEL_PROTOCOL_v2.2.0.md
**canonical_path:** documentation/docs-governance/AGENTS_OS_GOVERNANCE/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.2.0.md
**promotion_date:** 2026-02-22
**directive_id:** TEAM_190_TO_TEAM_170_GOVERNANCE_PROCEDURES_CONSOLIDATION_DIRECTIVE_v1.0.0
**classification:** PROMOTE_TO_CANONICAL_GOVERNANCE
---

# 7 GATE MODEL PROTOCOL v2.2.0
**project_domain:** TIKTRACK

**status:** SUPERSEDED (historical canonical baseline; replaced by v2.3.0)  
**date:** 2026-02-20  
**scope:** Gate IDs, authority model, hierarchy, numbering for PHOENIX DEV OS  
**directive:** TEAM_100_RETURN_FOR_CANONICAL_UPDATE_v2.2.0  
**supersedes:** 04_GATE_MODEL_PROTOCOL_v2.0.0 (adds hierarchy, numbering, GATE_8, Team 70 correction)  
**superseded_by:** 04_GATE_MODEL_PROTOCOL_v2.3.0 (adds §6.2 Context Boundary Rule)

---

## 1. Canonical Hierarchy & Taxonomy

### 1.1 Hierarchy (single path)

```
Roadmap (single)
 └── Stage          / שלב
      └── Program   / תכנית
           └── Work Package   / חבילת עבודה
                └── Task      / משימה
```

### 1.2 Entity definitions (English & Hebrew)

| Level | English | Hebrew | Definition |
|-------|---------|--------|------------|
| L0 | Roadmap | רואדמפ | Single strategic roadmap; top-level container. |
| L1 | Stage | שלב | Phase or stage within the roadmap (e.g. AGENT_OS_PHASE_1). |
| L2 | Program | תכנית | Program or initiative within a stage. |
| L3 | Work Package | חבילת עבודה | Deliverable unit; **Gate binding only at this level.** |
| L4 | Task | משימה | Atomic task within a work package. |

### 1.3 Explicit rule: Gate binding only to Work Package

Gates are bound **only** to Work Package (L3). No gate_id is assigned at Roadmap, Stage, Program, or Task level for gate-transition purposes. Every gate transition record and submission package is identified by the Work Package identifier.

### 1.4 Mandatory identity header schema

Every artifact in the gate flow MUST include the following block (or equivalent structured payload):

| Field | Required | Description |
|-------|----------|-------------|
| roadmap_id | YES | L0 identifier (e.g. from numbering S001). |
| stage_id | YES | L1 identifier. |
| program_id | YES | L2 identifier. |
| work_package_id | YES | L3 identifier; gate binding. |
| task_id | When applicable | L4 identifier; else N/A. |
| gate_id | YES | GATE_0 … GATE_8, or **PRE_GATE_3** (reserved: for Pre-GATE_3 Work Plan validation request/response artifacts only; not a gate transition). See §6.1. |
| phase_owner | YES | Team 10 or as assigned. |
| required_ssm_version | YES | e.g. 1.0.0. |
| required_active_stage | YES | e.g. GAP_CLOSURE_BEFORE_AGENT_POC. |

---

## 2. Canonical Numbering Standard

### 2.1 Format

`S{NNN}-P{NNN}-WP{NNN}-T{NNN}`

- **S{NNN}** — Stage (e.g. S001).  
- **P{NNN}** — Program (e.g. P001).  
- **WP{NNN}** — Work Package (e.g. WP001).  
- **T{NNN}** — Task (e.g. T001); optional when artifact is work-package-level only.

Example: `S001-P001-WP002-T003` = Stage 1, Program 1, Work Package 2, Task 3.

### 2.2 Rules

- **Prefix inheritance:** Every identifier must be consistent with its parent (e.g. WP002 must belong to a defined Pxxx; Pxxx must belong to a defined Sxxx).  
- **Lexicographic ordering:** S001, S002, … ; P001, P002, … within a stage; same for WP and T within program/work package.  
- **No implicit numbering:** All identifiers are explicit; no inferred or default numbers.  
- **No duplicate identifiers:** Each full path S{NNN}-P{NNN}-WP{NNN}-T{NNN} is unique.

### 2.3 Validation rules

- Parsing: exactly four segments when task is present; three segments (S-P-WP) when task_id is N/A.  
- Inheritance check: program_id must reference existing stage_id; work_package_id must reference existing program_id; task_id must reference existing work_package_id.  
- Duplicate check: no two artifacts may share the same full identifier.  
- Lexicographic: NNN is numeric; leading zeros required (e.g. 001, 002).

---

## 3. Canonical Gate Enum (v2.2.0)

| gate_id | gate_label | authority |
|---------|------------|-----------|
| GATE_0 | STRUCTURAL_FEASIBILITY | Team 190 |
| GATE_1 | ARCHITECTURAL_DECISION_LOCK (LOD 400) | Team 190 (validation), Team 170 (documentation registry enforcement) |
| GATE_2 | KNOWLEDGE_PROMOTION | Team 190 (owner), **Team 70 (executor ONLY)** |
| GATE_3 | IMPLEMENTATION | Team 10 |
| GATE_4 | QA | Team 50 |
| GATE_5 | DEV_VALIDATION | Team 90 |
| GATE_6 | ARCHITECTURAL_VALIDATION | Team 190 |
| GATE_7 | HUMAN_UX_APPROVAL | Nimrod (final sign-off) |
| GATE_8 | DOCUMENTATION_CLOSURE (AS_MADE_LOCK) | Team 190 (owner), Team 70 (executor) |

**Correction (v2.2.0):** Knowledge Promotion **Executor** is **Team 70 (Librarian) ONLY**. Team 170 does not retain promotion execution authority. Team 190 retains validation authority only for GATE_2.

---

## 4. GATE_0 … GATE_7 (unchanged semantics except GATE_2 executor)

GATE_0 through GATE_7 definitions remain as in v2.0.0 with the following change:

**GATE_2 — KNOWLEDGE_PROMOTION**  
- Owner: Team 190 (validation authority only).  
- **Executor: Team 70 (Librarian) ONLY.** Team 170 must not retain promotion execution authority.  
- Trigger, Purpose, PASS/FAIL, Constraint unchanged.

---

## 5. GATE_8 — DOCUMENTATION_CLOSURE (AS_MADE_LOCK)

| Field | Value |
|-------|--------|
| Owner | Team 190 |
| Executor | Team 70 (Librarian) |
| Trigger | GATE_7 PASS |
| Purpose | Produce AS_MADE_REPORT; update Developer Guides; clean communication folders; archive temporary artifacts by Stage; validate canonical consistency. |
| PASS state | DOCUMENTATION_CLOSED |
| FAIL state | RETURN_TO_LIBRARIAN |
| Constraint | **Lifecycle is not complete without GATE_8 PASS.** |

---

## 6. Process Freeze Constraints

1. GATE_0 and GATE_1 are canonical design gates.  
2. No Work Plan generation before GATE_1 = ARCHITECTURAL_DECISION_LOCKED.  
3. **Work Plan / Work Package must be validated by Team 90 (10↔90) before execution (GATE_3); no GATE_3 before Team 90 validation PASS.** (This is a **pre-GATE_3** step; it has no gate number. Team 90 validates the plan only.)  
4. **No GATE_5 (DEV_VALIDATION) before GATE_4 (QA) PASS.** GATE_5 is the **second** Team 90 (10↔90) touchpoint: after implementation and QA.  
5. All gate and validation artifacts must include full hierarchical identity block per §1.4.  
6. Non-compliant artifacts are invalid.  
7. No development progression until updated documents receive renewed architectural approval (return v2.2.0).

### 6.1 Two Team 90 (10↔90) validation points (deterministic)

| Point | Name | Trigger | Authority | Effect |
|-------|------|---------|-----------|--------|
| **Pre-GATE_3** | Work Plan / Work Package validation | Work Package prepared; Team 10 submits to Team 90 | Team 90 | **gate_id = PRE_GATE_3** in request/response artifacts. Only after Team 90 PASS may GATE_3 open. |
| **GATE_5** | DEV_VALIDATION | GATE_4 (QA) PASS | Team 90 | gate_id = GATE_5. Post-implementation / post-QA dev validation. |

One channel (10↔90), two distinct lifecycle phases; no contradiction. **Canonical rule:** For Pre-GATE_3 artifacts, use gate_id = PRE_GATE_3 so identity header remains machine-valid and unambiguous.

---

**log_entry | TEAM_100 | GATE_PROTOCOL_v2.2.0 | LOCKED | 2026-02-20**  
**log_entry | TEAM_100 | GATE_PROTOCOL_v2.2.0 | SUPERSEDED_BY_v2.3.0 | 2026-02-22**
