**Canonical location (SSOT):** This file is superseded by the canonical copy. Canonical: `documentation/docs-governance/AGENTS_OS_GOVERNANCE/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md`

# 7 GATE MODEL PROTOCOL v2.3.0
**project_domain:** TIKTRACK

**status:** LOCKED (official canonical; includes §6.2 Context Boundary Rule; approved for formal replacement of v2.2.0)  
**date:** 2026-02-22  
**scope:** Gate IDs, authority model, hierarchy, numbering for PHOENIX DEV OS  
**directive:** TEAM_100_TO_TEAM_170_CONTEXT_BOUNDARY_RULE_UPDATE_DIRECTIVE_v1.0.0  
**supersedes:** 04_GATE_MODEL_PROTOCOL_v2.2.0 (adds §6.2 Context Boundary Rule — drift prevention and context-injection freeze rule)

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
| gate_id | YES | GATE_0 … GATE_8 only. (Work-plan validation before implementation is inside GATE_3 as sub-stage G3.5; see §6.1.) |
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

## 3. Canonical Gate Enum (v2.3.0)

| gate_id | gate_label | authority (owner) |
|---------|------------|-------------------|
| GATE_0 | SPEC_ARC (LOD 200) | Team 190 |
| GATE_1 | SPEC_LOCK (LOD 400) | Team 190 |
| GATE_2 | ARCHITECTURAL_SPEC_VALIDATION | Team 190 |
| GATE_3 | IMPLEMENTATION | Team 10 |
| GATE_4 | QA | Team 10 |
| GATE_5 | DEV_VALIDATION | Team 90 |
| GATE_6 | ARCHITECTURAL_DEV_VALIDATION | Team 90 |
| GATE_7 | HUMAN_UX_APPROVAL | Team 90 |
| GATE_8 | DOCUMENTATION_CLOSURE (AS_MADE_LOCK) | Team 90 |

**WSM ownership (deterministic):** Gates 0–2: Team 190 updates WSM. Gates 3–4: Team 10 updates WSM. Gates 5–8: Team 90 updates WSM. Reference: _COMMUNICATION/team_170/WSM_OWNER_MATRIX_GATES_0_8_v1.0.0.md.

---

## 4. GATE_0 … GATE_7 (semantics per canonical table §3)

GATE_0 (SPEC_ARC), GATE_1 (SPEC_LOCK), GATE_2 (ARCHITECTURAL_SPEC_VALIDATION): Owner Team 190.  
GATE_3 (IMPLEMENTATION), GATE_4 (QA): Owner Team 10.  
GATE_5 (DEV_VALIDATION), GATE_6 (ARCHITECTURAL_DEV_VALIDATION), GATE_7 (HUMAN_UX_APPROVAL): Owner Team 90.  
Trigger, Purpose, PASS/FAIL, and constraints per runbook and WSM ownership matrix.

---

## 5. GATE_8 — DOCUMENTATION_CLOSURE (AS_MADE_LOCK)

| Field | Value |
|-------|--------|
| Owner | Team 90 |
| Trigger | GATE_7 PASS |
| Purpose | Produce AS_MADE_REPORT; update Developer Guides; clean communication folders; archive temporary artifacts by Stage; validate canonical consistency. |
| PASS state | DOCUMENTATION_CLOSED |
| FAIL state | RETURN_TO_OWNER |
| Constraint | **Lifecycle is not complete without GATE_8 PASS.** WSM updated by Team 90 upon closure. |

---

## 6. Process Freeze Constraints

1. GATE_0 and GATE_1 are canonical design gates.  
2. No Work Plan generation before GATE_1 = SPEC_LOCK (LOD 400).  
3. **Work Plan / Work Package must be validated by Team 90 (10↔90) before execution (GATE_3).** This is **internal to GATE_3** as sub-stage **G3.5 (WORK_PACKAGE_VALIDATION_WITH_TEAM_90)**. gate_id remains GATE_3; no separate PRE_GATE_3. Reference: _COMMUNICATION/team_170/GATE_3_SUBSTAGES_DEFINITION_v1.0.0.md.  
4. **No GATE_5 (DEV_VALIDATION) before GATE_4 (QA) PASS.** GATE_5 is the second Team 90 (10↔90) touchpoint: after implementation and QA.  
5. All gate and validation artifacts must include full hierarchical identity block per §1.4.  
6. Non-compliant artifacts are invalid.  
7. No development progression while canonical governance updates are pending required architectural approval.

### 6.1 GATE_3 internal sub-stages and Team 90 validation (deterministic)

GATE_3 has a canonical internal sub-stage sequence **G3.1..G3.9**. Work-plan validation with Team 90 is **G3.5 (WORK_PACKAGE_VALIDATION_WITH_TEAM_90)**. Only after G3.5 PASS may Team 10 proceed to G3.6 (TEAM_ACTIVATION_MANDATES). Full sequence: _COMMUNICATION/team_170/GATE_3_SUBSTAGES_DEFINITION_v1.0.0.md. **GATE_6 rejection routing:** DOC_ONLY_LOOP / CODE_CHANGE_REQUIRED / escalation to Team 00 per _COMMUNICATION/team_170/GATE_6_REJECTION_ROUTE_PROTOCOL_v1.0.0.md.

### 6.2 Context Boundary Rule (Drift Prevention)

Any architectural discussion involving one of the following events **MUST** include explicit SSM/WSM context injection before discussion may proceed:

- Stage transition (Sxxx change)
- Program creation (new Pxxx under existing stage)
- Work Package creation (new WPxxx)
- Domain change (TikTrack ↔ Agents_OS)
- SSM version change
- WSM structural change
- Post-GATE_8 stage closure
- Any new architectural decision outside an existing active Work Package

**Mandatory injection artifacts:**

- SSM_VERSION_REFERENCE.md
- WSM_VERSION_REFERENCE.md
- Mandatory Identity Header (S-P-WP)
- project_domain field

If missing, Team 100 MUST halt discussion and request completion.

**No architectural decision may be considered valid without context injection.**

---

**log_entry | TEAM_100 | GATE_PROTOCOL_v2.3.0 | LOCKED | 2026-02-22**
**log_entry | TEAM_170 | GATE_PROTOCOL_v2.3.0 | GATE_GOVERNANCE_REALIGNMENT_v1.1.0 | PRE_GATE_3_REMOVED_GATE_TABLE_WSM_OWNERS | 2026-02-23**
