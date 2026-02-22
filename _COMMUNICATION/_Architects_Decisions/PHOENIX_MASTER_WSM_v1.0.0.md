---
id: PHOENIX_WORK_STATE
version: 1.0.0
status: ACTIVE
structural_revision: v2.2.0
owner: Team 10
ssm_dependency: 1.0.0
---
**project_domain:** TIKTRACK
# 🛠️ PHOENIX WORK STATE (WSM) v1.0.0

מניפסט המשימות מנהל את צנרת הביצוע ומקשר בין פקודות האדריכל לתוצרי השטח. **מבנה קנוני v2.2.0** (היררכיה, מספור, GATE_2/GATE_8) per 04_GATE_MODEL_PROTOCOL_v2.2.0.

---

## 0. CANONICAL HIERARCHY & GATE LIFECYCLE (v2.2.0)

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
**Numbering:** S{NNN}-P{NNN}-WP{NNN}-T{NNN}; prefix inheritance; no implicit numbering; no duplicate identifiers. Validation rules: 04_GATE_MODEL_PROTOCOL_v2.2.0 §2.3.  
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

## 5. CURRENT EXECUTION ORDER LOCK (per SSM §5.1 — authoritative)

| Level | Identifier | Name | Status |
|-------|------------|------|--------|
| Stage | S001 | Agent OS Initial Build | ACTIVE |
| Program | S001-P001 | Agent Core | ACTIVE |
| Work Package | S001-P001-WP001 | 10↔90 Validator Agent | ACTIVE |
| Program | S001-P002 | Alerts POC | **FROZEN** until S001-P001-WP001 completes GATE_8 |

Execution order is governed by SSM §5.1. The task list below is legacy/other; active execution focus is S001-P001-WP001.

---

## 🗺️ LEVEL 1: ROADMAP MODULES (אסטרטגי)

- M1: Identity & Security - ✅ COMPLETED (v1.0.0)
- M2: Financial Core - 🟡 IN PROGRESS (Batch 2.5)
- M3: External Data (Stage -1) - ⚪ PLANNED

---

## 📋 LEVEL 2: MASTER TASK LIST (מבצעי — legacy / other; S001-P002 FROZEN per SSM §5.1)

| Task ID | Description | Owner | Status | Evidence Link |
| :--- | :--- | :--- | :--- | :--- |
| L2-024 | Account-based Fees Refactor | Team 20 | DONE | EVIDENCE_L2_024.json |
| L2-025 | Broker Reference API | Team 20 | ACTIVE | - |
| L2-026 | POC-1 Observer Engine | Team 100 | BLOCKED | - |

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
