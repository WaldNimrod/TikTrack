---
id: PHOENIX_WORK_STATE
version: 1.0.0
status: ACTIVE
structural_revision: v2.3.0
owner: Team 10
ssm_dependency: 1.0.0
---
**project_domain:** TIKTRACK
# 🛠️ PHOENIX WORK STATE (WSM) v1.0.0

מניפסט המשימות מנהל את צנרת הביצוע ומקשר בין פקודות האדריכל לתוצרי השטח. **מבנה קנוני v2.3.0** (היררכיה, מספור, GATE_2/GATE_8) per 04_GATE_MODEL_PROTOCOL_v2.3.0.

---

## 0. CANONICAL HIERARCHY & GATE LIFECYCLE (v2.3.0)

**Hierarchy:** Roadmap (single) → Stage (שלב) → Program (תכנית) → Work Package (חבילת עבודה) → Task (משימה).  

**Entity definitions (English & Hebrew):**

| Level | English | Hebrew | Definition |
|-------|---------|--------|------------|
| L0 | Roadmap | רואדמפ | Single strategic roadmap; top-level container. |
| L1 | Stage | שלב | Phase or stage within the roadmap. |
| L2 | Program | תכנית | Program or initiative within a stage. |
| L3 | Work Package | חבילת עבודה | Deliverable unit; **Gate binding only at this level.** |
| L4 | Task | משימה | Atomic task within a work package. |

**Rule:** Gate binding **only to Work Package** (L3).  
**Numbering:** S{NNN}-P{NNN}-WP{NNN}-T{NNN}; prefix inheritance; no implicit numbering; no duplicate identifiers. Validation rules: 04_GATE_MODEL_PROTOCOL_v2.3.0 §2.3.  
**Identity header:** roadmap_id, stage_id, program_id, work_package_id, task_id, gate_id, phase_owner, required_ssm_version, required_active_stage.  
**GATE_2 (KNOWLEDGE_PROMOTION):** Executor **Team 70 (Librarian) ONLY.** Team 170 does not retain promotion execution.  
**GATE_8 (DOCUMENTATION_CLOSURE):** Owner Team 190; Executor Team 70. Trigger: GATE_7 PASS. Lifecycle **not complete** without GATE_8 PASS.

### 0.1 Architectural Approval Package Format Lock (v1.0.0)

Directive: `TEAM_100_ARCH_APPROVAL_PACKAGE_FORMAT_LOCK_v1.0.0`.

All architectural approval packages in workflow execution must follow a fixed 7-file structure:

1. `COVER_NOTE.md`
2. `SPEC_PACKAGE.md` (or `EXECUTION_PACKAGE.md`)
3. `VALIDATION_REPORT.md`
4. `DIRECTIVE_RECORD.md`
5. `SSM_VERSION_REFERENCE.md`
6. `WSM_VERSION_REFERENCE.md`
7. `PROCEDURE_AND_CONTRACT_REFERENCE.md`

WSM governance constraints:
- Submission folder is self-contained.
- No communication-path links inside submission artifacts.
- No extra scattered artifacts in the package.
- Each artifact includes `architectural_approval_type: SPEC | EXECUTION` and full mandatory identity header.

Flow semantic lock:
- SPEC track submissions bind to `GATE_1` and are SPEC-only (no execution-readiness claims).
- EXECUTION track submissions must use execution-validation gate context and include implementation evidence.

Role contract in workflow:
- Team 170 maintains originals only.
- Team 190 assembles/submits packages and is the only editor in submission folders.

---

## 5. EXECUTION ORDER LOCK (structural rule only — no operational state here)

**Structural lock (per SSM §5.1):** S001-P002 may not be activated until S001-P001-WP001 completes GATE_8. **Current operational state** (active stage, current gate, last_gate_event, etc.) is **solely** in the **CURRENT_OPERATIONAL_STATE** block below. No duplication of operational truth elsewhere in this document.

---

## CURRENT_OPERATIONAL_STATE (single canonical block — TEAM_100_WSM_OPERATIONAL_STATE_PROTOCOL_v1.0.0)

**Mandate:** Every gate closure (SPEC or EXECUTION) must update this block. No gate progression without WSM update. The Gate Owner must update this block immediately upon gate closure.

**Gate-owner update evidence:** This block was updated upon GATE_5 closure (2026-02-21) by **Gate Owner Team 90** for transition to GATE_6 execution submission.

| Field | Value |
|-------|-------|
| active_stage_id | S001 |
| active_flow | EXECUTION |
| active_project_domain | TIKTRACK |
| allowed_gate_range | GATE_5 (closed) → GATE_6 (current) |
| current_gate | GATE_6 |
| active_program_id | S001-P001 |
| active_plan_id | S001 |
| active_work_package_id | S001-P001-WP001 |
| phase_owner_team | Team 10 |
| last_gate_event | GATE_5 \| PASS \| 2026-02-21 \| _COMMUNICATION/team_10/TEAM_10_TO_TEAM_90_S001_P001_WP001_GATE5_VALIDATION_REQUEST.md, _COMMUNICATION/team_90/TEAM_90_TO_TEAM_10_S001_P001_WP001_GATE5_VALIDATION_RESPONSE.md |
| next_required_action | Prepare and submit GATE_6 execution architectural package to Architect Inbox (7-file lock) |
| next_responsible_team | Team 90 (submission package), Team 10 (orchestration), Chief Architect (approval) |

---

## 🗺️ LEVEL 1: ROADMAP MODULES (אסטרטגי — structural catalog only; no operational status)

**Live status of modules/roadmap is solely in CURRENT_OPERATIONAL_STATE.** This list is a structural catalog; it does not store operational state.

- M1: Identity & Security (v1.0.0)
- M2: Financial Core (Batch 2.5)
- M3: External Data (Stage -1)

---

## 📋 LEVEL 2: MASTER TASK LIST (מבצעי — structural catalog only; no operational status)

**Live task/execution status is solely in CURRENT_OPERATIONAL_STATE.** This table is a structural catalog; it does not store operational state. S001-P002 FROZEN per SSM §5.1.

| Task ID | Description | Owner | Evidence Link |
| :--- | :--- | :--- | :--- |
| L2-024 | Account-based Fees Refactor | Team 20 | EVIDENCE_L2_024.json |
| L2-025 | Broker Reference API | Team 20 | — |
| L2-026 | POC-1 Observer Engine | Team 100 | — |

---

## ⚓ BRIDGE CONTRACT (חוזה גישור)

כל משימה במניפסט זה כפופה ל:
- Required SSM: 1.0.0
- Required Stage: GAP_CLOSURE_BEFORE_AGENT_POC

---

## CANONICAL ARCHITECTURAL APPROVAL PACKAGE FORMAT (Governance — TEAM_100_ARCH_APPROVAL_PACKAGE_FORMAT_LOCK_v1.0.0)

All Architect Inbox submissions (SPEC or EXECUTION) MUST use the canonical package structure: 7 artifacts (COVER_NOTE, SPEC_PACKAGE or EXECUTION_PACKAGE, VALIDATION_REPORT, DIRECTIVE_RECORD, SSM_VERSION_REFERENCE, WSM_VERSION_REFERENCE, PROCEDURE_AND_CONTRACT_REFERENCE); mandatory header block (architectural_approval_type + Identity Header table) in every file; SPEC vs EXECUTION semantics locked; Team 170 = content originals, Team 190 = submission package owner only. Template: Team 190 ARCHITECTURAL_APPROVAL_PACKAGE_TEMPLATE_v1.0.0. Reference: _COMMUNICATION/team_100/TEAM_100_ARCH_APPROVAL_PACKAGE_FORMAT_LOCK_v1.0.0.md.

---

**log_entry | [Team 10] | WSM_V1_0_0_ACTIVE | GREEN | 2026-02-19**  
**log_entry | TEAM_70 | WSM_CANONICAL_UPDATE | content_from_Team_170 | ARCH_APPROVAL_PACKAGE_FORMAT_EXECUTION_ORDER_LOCK | 2026-02-21**  
**log_entry | TEAM_10 | GATE_OWNER_WSM_UPDATE | CURRENT_OPERATIONAL_STATE | upon GATE_4 closure 2026-02-21 | 2026-02-22**  
**log_entry | TEAM_170 | WSM_CANONICAL_APPLY | at Gate Owner request | TEAM_100_WSM_OPERATIONAL_STATE_PROTOCOL_v1.0.0 | 2026-02-22**  
**log_entry | TEAM_90 | GATE_OWNER_WSM_UPDATE | CURRENT_OPERATIONAL_STATE | upon GATE_5 closure 2026-02-21 | 2026-02-22**  
**log_entry | TEAM_70 | WSM_CANONICAL_UPDATE | GATE_PROTOCOL_v2.3.0_OFFICIALIZATION_REFERENCE_REFRESH | 2026-02-22**
