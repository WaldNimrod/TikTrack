---
**provenance:** Governance consolidation (Team 170)
**source_path:** _COMMUNICATION/team_100/DEV_OS_TARGET_MODEL_CANONICAL_v1.3.1/04_GATE_MODEL_PROTOCOL_v2.3.0.md
**canonical_path:** documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md
**promotion_date:** 2026-02-22
**directive_id:** TEAM_190_TO_TEAM_170_GOVERNANCE_PROCEDURES_CONSOLIDATION_DIRECTIVE_v1.0.0
**classification:** PROMOTE_TO_CANONICAL_GOVERNANCE
**status:** ARCHIVED — superseded by _COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_GATE_SEQUENCE_CANON_v1.0.0.md (2026-03-19)
---

> **[ARCHIVED — superseded by ARCHITECT_DIRECTIVE_GATE_SEQUENCE_CANON_v1.0.0.md — 5-gate canonical model, 2026-03-19]**

# 7 GATE MODEL PROTOCOL v2.3.0
**project_domain:** TIKTRACK

**status:** LOCKED (official canonical; includes §6.2 Context Boundary Rule; approved for formal replacement of v2.2.0)  
**date:** 2026-03-10  
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
| track_mode | Conditional | `NORMAL` or `FAST` in runtime contexts where fast-track is used. `gate_id` remains canonical and is not replaced by FAST enums. |
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
- **Uniqueness (mandatory):** Within a given Stage, no two Programs may share the same program number — each program_id of the form Sxxx-Pnnn is unique in the stage. Within a given Program, no two Work Packages may share the same work package number — each work_package_id of the form Sxxx-Pxxx-WPnnn is unique in the program. Hence: one Program per (Stage, P-number); one Work Package per (Program, WP-number).
- **One domain per Program:** Each Program is assigned to exactly one domain. A Program cannot span multiple domains.

### 2.3 Validation rules

- Parsing: exactly four segments when task is present; three segments (S-P-WP) when task_id is N/A.  
- Inheritance check: program_id must reference existing stage_id; work_package_id must reference existing program_id; task_id must reference existing work_package_id.  
- Duplicate check: no two artifacts may share the same full identifier.  
- Lexicographic: NNN is numeric; leading zeros required (e.g. 001, 002).
- Domain-match enforcement: `WP.project_domain` must equal the `project_domain` of the parent Program. Mismatch = BLOCK_FOR_FIX at GATE_0 (enforced by Team 190 per §3 authority). This enforcement operationalizes §2.2 "One domain per Program." Reference: ARCHITECT_DIRECTIVE_DUAL_DOMAIN_GOVERNANCE_v1.0.0.

---

## 3. Canonical Gate Enum (v2.3.0)

| gate_id | gate_label | authority (owner) |
|---------|------------|-------------------|
| GATE_0 | SPEC_ARC (LOD 200) | Team 190 |
| GATE_1 | SPEC_LOCK (LOD 400) | Team 190 |
| GATE_2 | ARCHITECTURAL_SPEC_VALIDATION (Intent gate) | Team 190 (execution); **approval authority: Team 100** |
| GATE_3 | IMPLEMENTATION | Team 10 |
| GATE_4 | QA | Team 10 |
| GATE_5 | DEV_VALIDATION | Team 90 |
| GATE_6 | ARCHITECTURAL_DEV_VALIDATION (Reality gate) | Team 90 (execution); **approval authority: Team 100** |
| GATE_7 | HUMAN_UX_APPROVAL | Team 90 |
| GATE_8 | DOCUMENTATION_CLOSURE (AS_MADE_LOCK) | Team 90 |

**WSM ownership (deterministic):** Gates 0–2: Team 190 updates WSM. Gates 3–4: Team 10 updates WSM. Gates 5–8: Team 90 updates WSM. Reference: _COMMUNICATION/team_170/WSM_OWNER_MATRIX_GATES_0_8_v1.0.0.md.

**Approval authority (Team 100):** At **GATE_2** and **GATE_6**, **Team 100** (Development Architecture Authority) holds architectural approval authority; execution and WSM update remain with Team 190 (GATE_2) and Team 90 (GATE_6) per table above.

---

## 4. GATE_0 … GATE_7 (semantics per canonical table §3)

GATE_0 (SPEC_ARC), GATE_1 (SPEC_LOCK), GATE_2 (ARCHITECTURAL_SPEC_VALIDATION): Execution owner Team 190; **GATE_2 approval authority: Team 100**.  
GATE_3 (IMPLEMENTATION), GATE_4 (QA): Owner Team 10.  
GATE_5 (DEV_VALIDATION), GATE_6 (ARCHITECTURAL_DEV_VALIDATION), GATE_7 (HUMAN_UX_APPROVAL): Execution owner Team 90; **GATE_6 approval authority: Team 100**.  
Trigger, Purpose, PASS/FAIL, and constraints per runbook and WSM ownership matrix.

### 4.2 GATE_2 — Intent gate (locked semantics)

**GATE_2** = אישור אדריכלי של האפיון הסופי. Team 100 בוחן ומאשר את ה-SPEC לפני מעבר לשלב ביצוע. **שער כוונה** — האדריכל מאשר **מה שמתכוונים לבנות**.

**Locked distinction:**  
**GATE_2:** "האם אנחנו מאשרים לבנות את זה?"

### 4.3 GATE_6 — Reality gate (locked semantics)

**GATE_6** = בדיקה אדריכלית של **מה שנבנה בפועל**. לאחר ביצוע, חבילת Execution חוזרת ל-Team 100 לאישור. **שער מציאות** — האדריכל מאמת ש**מה שנבנה תואם את הכוונה שאושרה ב-GATE_2**.

**Locked distinction:**  
**GATE_6:** "האם מה שנבנה הוא מה שאישרנו?"

### 4.1 GATE_1 — Team 170 role and LLD400 process (architect-approved)

**Entry:** Team 170 receives an **architect brief** (e.g. Concept Package or activation to LLD400) via Team 10 or Team 100.

**Team 170 obligations until submission to Team 190:**

1. **Align to standards:** Update all relevant files (templates, spec) to full compliance with gate procedures and standards, **while fully preserving** architect requirements and definitions.
2. **Compatibility and integration check:** Verify alignment with existing code, existing documentation, and responsibility plans (executed or planned). **Gaps, conflicts, issues or questions → escalate to architect decision** (via Team 10); no completion by independent interpretation.
3. **Produce canonical Program and detailed spec:** Once information is complete, turn the high-level plan into a **canonical, precise Program** (S-P-WP numbering per WSM/SSM) and produce a **detailed specification** (LLD400) per canonical templates.
4. **Submit for validation:** Submit the spec and documentation to **Team 190 for validation**. Direct submission to architect is forbidden before Team 190 PASS.

**Prohibitions at GATE_1 (Team 170):** No Work Package creation; no GATE_3 opening; no implementation; no SSM/WSM modification without formal justification.

**After Team 190 PASS:** Team 190 prepares the SPEC approval submission package to architect per procedure; Team 170 holds originals only and does not edit submission package files.

**Detailed requirements per gate and work stage:** `_COMMUNICATION/team_170/TEAM_170_INTERNAL_WORK_PROCEDURE.md` (mandatory).

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

### 6.3 Fast-track overlay rule (domain-aware)

Fast-track is a runtime execution overlay; it does not redefine the gate enum.

1. `gate_id` stays canonical (`GATE_0..GATE_8`).
2. Fast-track status is represented by `track_mode` (`NORMAL` / `FAST`) in WSM/runtime context.
3. Domain application:
  - `TIKTRACK`: optional activation path.
  - `AGENTS_OS`: default execution path per `ARCHITECT_DIRECTIVE_AGENTS_OS_FAST_TRACK_DEFAULT_v1.0.0.md`.
4. Only one track can be active at a time:
  - `track_mode=FAST` requires normal flow HOLD.
  - `track_mode=NORMAL` means fast-track is inactive or scheduled-next.
5. FAST stages are operational only (`FAST_0..FAST_4`) and reference canonical gates, especially GATE_3 internals.
6. Full protocol: `documentation/docs-governance/04-PROCEDURES/FAST_TRACK_EXECUTION_PROTOCOL_v1.2.0.md`.

---

## 7. Operational references (no duplicate gate tables)

**Normative authority:** This protocol defines gate enum, authority, and identity header.

Operational detail and artifact contracts are referenced canonically:

- **Execution runbook (GATE_3..GATE_8 operations from Team 10 gateway perspective):** `documentation/docs-governance/04-PROCEDURES/TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md`
- **Fast-track overlay (domain-aware; AGENTS_OS default):** `documentation/docs-governance/04-PROCEDURES/FAST_TRACK_EXECUTION_PROTOCOL_v1.2.0.md`
- **Spec lifecycle contract (GATE_0..GATE_2):** `documentation/docs-governance/05-CONTRACTS/GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT_v1.1.0.md`
- **Human UX approval contract (GATE_7):** `documentation/docs-governance/05-CONTRACTS/GATE_7_HUMAN_UX_APPROVAL_CONTRACT_v1.1.0.md`

All teams must use these references for deterministic gate execution and artifact naming. No duplicate gate-action tables in other governance docs.

---

**log_entry | TEAM_100 | GATE_PROTOCOL_v2.3.0 | LOCKED | 2026-02-22**
**log_entry | TEAM_170 | GATE_PROTOCOL_v2.3.0 | TEAM_10_RUNBOOK_REF_ADDED | 2026-02-23**
**log_entry | TEAM_170 | GATE_PROTOCOL_v2.3.0 | GATE_GOVERNANCE_REALIGNMENT_v1.1.0 | PRE_GATE_3_REMOVED_GATE_TABLE_WSM_OWNERS | 2026-02-23**
**log_entry | TEAM_190 | GATE_PROTOCOL_v2.3.0 | OPERATIONAL_REFERENCES_HARDENED_GATES_0_2_AND_7 | 2026-02-23**
**log_entry | TEAM_190 | GATE_PROTOCOL_v2.3.0 | FAST_TRACK_OVERLAY_RULE_AND_REFERENCE_ADDED | 2026-02-26**
**log_entry | TEAM_170 | GATE_MODEL_PROTOCOL_v2.3.0 | DOMAIN_MATCH_ENFORCEMENT_ADDED_TO_SEC_2_3 | ARCHITECT_DIRECTIVE_DUAL_DOMAIN_GOVERNANCE_v1.0.0 | 2026-03-10**
**log_entry | TEAM_190 | GATE_PROTOCOL_v2.3.0 | FAST_TRACK_DOMAIN_AWARE_AND_V1_1_REFERENCE_LOCKED | 2026-03-11**
