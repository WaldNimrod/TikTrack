**Canonical location (SSOT):** This file is superseded by the canonical copy. Canonical: `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`

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
- Team 90 assembles/submits post-GATE_5 execution packages to Architect Inbox.
- Gate-opening authority for GATE_6 is Architect + Team 100 / Team 00.
- Team 190 is engaged only where explicitly mandated (e.g., GATE_8 ownership), not in WP002 post-GATE_5 phase.

Operational clarification (2026-02-23, WP002 cycle):
- Post-GATE_5 package preparation and architect submission are executed by Team 90.
- GATE_6 opening authority is Architect + Team 100 / Team 00.
- Team 190 is not involved in this phase for WP002.

---

## 5. EXECUTION ORDER LOCK (structural rule only — no operational state here)

**Structural lock (per SSM §5.1):** S001-P002 may not be activated until S001-P001-WP001 completes GATE_8. **Current operational state** (active stage, current gate, last_gate_event, etc.) is **solely** in the **CURRENT_OPERATIONAL_STATE** block below. No duplication of operational truth elsewhere in this document.

---

## CURRENT_OPERATIONAL_STATE (single canonical block — TEAM_100_WSM_OPERATIONAL_STATE_PROTOCOL_v1.0.0)

**Mandate:** Every gate closure (SPEC or EXECUTION) must update this block. No gate progression without WSM update. The Gate Owner must update this block immediately upon gate closure.

**Gate-owner update evidence:** This block was updated upon **GATE_8 PASS** (2026-02-23). S001-P001-WP002 — documentation closure validated and lifecycle completed.

| Field | Value |
|-------|-------|
| active_stage_id | S001 |
| active_flow | EXECUTION — S001-P001-WP002 lifecycle complete (DOCUMENTATION_CLOSED) |
| active_project_domain | TIKTRACK (runtime); **Agents_OS** (Program S001-P001 completed; awaiting next authorized WP) |
| allowed_gate_range | DOCUMENTATION_CLOSED → READY_FOR_NEXT_WORK_PACKAGE |
| current_gate | DOCUMENTATION_CLOSED |
| active_program_id | S001-P001 (Agents_OS Phase 1 complete) |
| active_plan_id | S001 |
| active_work_package_id | N/A (last closed: S001-P001-WP002) |
| phase_owner_team | Team 10 |
| last_gate_event | GATE_8 \| PASS \| 2026-02-23 \| Documentation closure validated by Team 90 |
| next_required_action | Team 10 may open the next authorized work package according to WSM gate order |
| next_responsible_team | Team 10 |

---

## 🗺️ LEVEL 1: ROADMAP MODULES (אסטרטגי — structural catalog only; no operational status)

**Live status of modules/roadmap is solely in CURRENT_OPERATIONAL_STATE.** This list is a structural catalog; it does not store operational state.

- M1: Identity & Security (v1.0.0)
- M2: Financial Core (שלב 2.5)
- M3: External Data (שלב -1)

---

## 📋 LEVEL 2: Task list reference (מבצעי — structural catalog only; no operational status)

**Canonical Master Task List (רשימת משימות מרכזית):** `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST.md` — זה המקור לסטטוס Tasks (OPEN/CLOSED) ולתאריכי סגירה. **Live task/execution status is solely in CURRENT_OPERATIONAL_STATE** (בלוק למעלה). הטבלה להלן היא קטלוג מבני/אחר — לא הרשימה המרכזית.

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

All Architect Inbox submissions (SPEC or EXECUTION) MUST use the canonical package structure: 7 artifacts (COVER_NOTE, SPEC_PACKAGE or EXECUTION_PACKAGE, VALIDATION_REPORT, DIRECTIVE_RECORD, SSM_VERSION_REFERENCE, WSM_VERSION_REFERENCE, PROCEDURE_AND_CONTRACT_REFERENCE); mandatory header block (architectural_approval_type + Identity Header table) in every file; SPEC vs EXECUTION semantics locked; Team 170 = content originals; post-GATE_5 execution submission owner = Team 90 (per current operational directive). Gate-opening decision authority remains Architect + Team 100 / Team 00.

---

**log_entry | [Team 10] | WSM_V1_0_0_ACTIVE | GREEN | 2026-02-19**  
**log_entry | TEAM_70 | WSM_CANONICAL_UPDATE | content_from_Team_170 | ARCH_APPROVAL_PACKAGE_FORMAT_EXECUTION_ORDER_LOCK | 2026-02-21**  
**log_entry | TEAM_10 | GATE_OWNER_WSM_UPDATE | CURRENT_OPERATIONAL_STATE | upon GATE_4 closure 2026-02-21 | 2026-02-22**  
**log_entry | TEAM_170 | WSM_CANONICAL_APPLY | at Gate Owner request | TEAM_100_WSM_OPERATIONAL_STATE_PROTOCOL_v1.0.0 | 2026-02-22**  
**log_entry | TEAM_90 | GATE_OWNER_WSM_UPDATE | CURRENT_OPERATIONAL_STATE | upon GATE_5 closure 2026-02-21 | 2026-02-22**  
**log_entry | TEAM_70 | WSM_CANONICAL_UPDATE | GATE_PROTOCOL_v2.3.0_OFFICIALIZATION_REFERENCE_REFRESH | 2026-02-22**  
**log_entry | TEAM_90 | GATE_OWNER_WSM_UPDATE | CURRENT_OPERATIONAL_STATE | upon GATE_8 closure 2026-02-22 | 2026-02-22**
**log_entry | TEAM_90 | GATE_OWNER_WSM_UPDATE | CURRENT_OPERATIONAL_STATE | WP002 post-GATE_5 architect approval pending (Team100/00 authority) | 2026-02-23**
**log_entry | TEAM_90 | GATE_OWNER_WSM_UPDATE | CURRENT_OPERATIONAL_STATE | WP002 GATE_6 OPEN approved by Team 100 decision | 2026-02-23**
**log_entry | TEAM_90 | GATE_OWNER_WSM_UPDATE | CURRENT_OPERATIONAL_STATE | WP002 GATE_7 approved; GATE_8 activated | 2026-02-23**
**log_entry | TEAM_90 | GATE_OWNER_WSM_UPDATE | CURRENT_OPERATIONAL_STATE | WP002 GATE_8 PASS; DOCUMENTATION_CLOSED | 2026-02-23**
