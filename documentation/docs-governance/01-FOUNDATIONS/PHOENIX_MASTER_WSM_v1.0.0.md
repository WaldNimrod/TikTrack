---
**provenance:** Governance consolidation (Team 170)
**source_path:** _COMMUNICATION/_Architects_Decisions/PHOENIX_MASTER_WSM_v1.0.0.md
**canonical_path:** documentation/docs-governance/PHOENIX_CANONICAL/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md
**promotion_date:** 2026-02-22
**directive_id:** TEAM_190_TO_TEAM_170_GOVERNANCE_PROCEDURES_CONSOLIDATION_DIRECTIVE_v1.0.0
**classification:** PROMOTE_TO_CANONICAL_GOVERNANCE
---

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
**Portfolio boundary (per PORTFOLIO_CANONICALIZATION):** Runtime state (active stage, current gate, last_gate_event, active_work_package_id) is **stored only in this document** (block CURRENT_OPERATIONAL_STATE). The canonical Portfolio layer (Roadmap/Program/Work Package registries) holds a **mirror** for structural catalog only; they are not a second source of runtime truth. See `documentation/docs-governance/00-INDEX/PORTFOLIO_INDEX.md` and `PORTFOLIO_WSM_SYNC_RULES_v1.0.0.md`.  
**Numbering:** S{NNN}-P{NNN}-WP{NNN}-T{NNN}; prefix inheritance; no implicit numbering; no duplicate identifiers. Validation rules: 04_GATE_MODEL_PROTOCOL_v2.3.0 §2.3.  
**Uniqueness (mandatory):** Within a Stage, each Program number is unique; within a Program, each Work Package number is unique. **One domain per Program:** each Program is assigned to exactly one domain (per SSM §0 and 04_GATE_MODEL §2.2).  
**Identity header:** roadmap_id, stage_id, program_id, work_package_id, task_id, gate_id, phase_owner, required_ssm_version, required_active_stage.  
**Gate ownership (v1.1.0 realignment):** GATE_0–GATE_2 owner Team 190; GATE_3–GATE_4 owner Team 10; GATE_5–GATE_8 owner Team 90. **WSM updater per gate:** Gates 0–2 → Team 190; Gates 3–4 → Team 10; Gates 5–8 → Team 90. Reference: _COMMUNICATION/team_170/WSM_OWNER_MATRIX_GATES_0_8_v1.0.0.md. **GATE_8 (DOCUMENTATION_CLOSURE):** Owner Team 90. Trigger: GATE_7 PASS. Lifecycle **not complete** without GATE_8 PASS.

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

Role contract in workflow (Gate Governance Realignment v1.1.0):
- Team 170 maintains originals only.
- Team 90 owns GATE_5, GATE_6, GATE_7, GATE_8; assembles/submits post-GATE_5 execution packages; submission path _COMMUNICATION/_ARCHITECT_INBOX/; architect decisions _COMMUNICATION/_Architects_Decisions/. Path _COMMUNICATION/90_Architects_comunication/ is deprecated (historical only). Reference: _COMMUNICATION/team_170/PATH_DEPRECATION_90_ARCHITECTS_COMUNICATION_v1.0.0.md.

---

## 5. EXECUTION ORDER LOCK (structural rule only — no operational state here)

**Structural lock (per SSM §5.1):** S001-P002 may not be activated until S001-P001-WP001 completes GATE_8. **Current operational state** (active stage, current gate, last_gate_event, etc.) is **solely** in the **CURRENT_OPERATIONAL_STATE** block below. No duplication of operational truth elsewhere in this document.

---

## CURRENT_OPERATIONAL_STATE (single canonical block — TEAM_100_WSM_OPERATIONAL_STATE_PROTOCOL_v1.0.0)

**Mandate:** Every gate closure (SPEC or EXECUTION) must update this block. No gate progression without WSM update. The Gate Owner must update this block immediately upon gate closure.

**Gate-owner update evidence:** This block was updated **2026-02-25** — Team 190 completed final GATE_0 revalidation for S002-P001; decision PASS; flow advanced to GATE_1_PENDING.

| Field | Value |
|-------|-------|
| active_stage_id | S002 |
| active_stage_label | שלב 2 — Stage 2 |
| active_flow | GATE_1_PENDING — LOD200 validated PASS; Team 100 to activate Team 170 for LLD400 submission to Team 190 |
| active_project_domain | AGENTS_OS |
| active_work_package_id | N/A |
| in_progress_work_package_id | N/A |
| last_closed_work_package_id | S001-P001-WP002 (GATE_8 PASS 2026-02-23; **domain: AGENTS_OS**) |
| allowed_gate_range | GATE_0 → GATE_2 (spec gates for S002-P001) |
| current_gate | GATE_1 |
| active_program_id | S002-P001 |
| active_plan_id | S002 |
| phase_owner_team | Team 190 (GATE_0–GATE_2 owner) |
| last_gate_event | GATE_0_PASS \| 2026-02-25 \| Team 190 \| Final revalidation PASS after BF-01/BF-02/BF-02R/BF-03 closure |
| next_required_action | Team 100 issues LLD400 activation to Team 170; Team 170 prepares and submits GATE_1 package to Team 190 |
| next_responsible_team | Team 100 |

---

## 🗺️ LEVEL 1: ROADMAP MODULES (אסטרטגי — structural catalog only; no operational status)

**Live status of modules/roadmap is solely in CURRENT_OPERATIONAL_STATE.** This list is a structural catalog; it does not store operational state.

- M1: Identity & Security (v1.0.0)
- M2: Financial Core (שלב 2.5)
- M3: External Data (שלב -1)

---

## 📋 LEVEL 2: Task list reference (מבצעי — structural catalog only; no operational status)

**Canonical Master Task List (רשימת משימות מרכזית):** `_COMMUNICATION/team_10/TEAM_10_MASTER_TASK_LIST.md` — this is the source for Task status (OPEN/CLOSED) and closure dates. **Live task/execution status is solely in CURRENT_OPERATIONAL_STATE** (block above). The table below is a structural/other catalog — not the central list.

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
**log_entry | TEAM_10 | GATE_OWNER_WSM_UPDATE | CURRENT_OPERATIONAL_STATE | upon G3.5 PASS S001-P001-WP002 (GATE_3 open) 2026-02-22 | 2026-02-22**
**log_entry | TEAM_90 | GATE_OWNER_WSM_UPDATE | CURRENT_OPERATIONAL_STATE | WP002 post-GATE_5 architect approval pending (Team100/00 authority) | 2026-02-23**
**log_entry | TEAM_90 | GATE_OWNER_WSM_UPDATE | CURRENT_OPERATIONAL_STATE | WP002 GATE_6 OPEN approved by Team 100 decision | 2026-02-23**
**log_entry | TEAM_90 | GATE_OWNER_WSM_UPDATE | CURRENT_OPERATIONAL_STATE | WP002 GATE_7 approved; GATE_8 activated | 2026-02-23**
**log_entry | TEAM_170 | WSM_CANONICAL_UPDATE | GATE_GOVERNANCE_REALIGNMENT_v1.1.0 | WSM_OWNER_MATRIX_PATH_DEPRECATION | 2026-02-23**
**log_entry | TEAM_90 | GATE_OWNER_WSM_UPDATE | CURRENT_OPERATIONAL_STATE | WP002 GATE_8 PASS; DOCUMENTATION_CLOSED | 2026-02-23**
**log_entry | TEAM_170 | WSM_CANONICAL_UPDATE | CURRENT_OPERATIONAL_STATE | stage_transition_S002_no_active_program_WP | 2026-02-24**
**log_entry | TEAM_100 | WSM_UPDATE | CURRENT_OPERATIONAL_STATE | S002-P001 activated; GATE_0 LOD200 submitted; Team 190 next | 2026-02-24**
**log_entry | TEAM_190 | GATE_OWNER_WSM_UPDATE | CURRENT_OPERATIONAL_STATE | GATE_0 BLOCK_FOR_FIX for S002-P001; returned to Team 100 | 2026-02-25**
**log_entry | TEAM_190 | GATE_OWNER_WSM_UPDATE | CURRENT_OPERATIONAL_STATE | GATE_0 REVALIDATION BLOCK_FOR_FIX (BF-02R only); returned to Team 100 | 2026-02-25**
**log_entry | TEAM_190 | GATE_OWNER_WSM_UPDATE | CURRENT_OPERATIONAL_STATE | GATE_0 PASS for S002-P001; advanced to GATE_1_PENDING | 2026-02-25**
