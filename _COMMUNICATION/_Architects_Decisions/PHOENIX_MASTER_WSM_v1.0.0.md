---
id: PHOENIX_WORK_STATE
version: 1.0.0
status: ACTIVE
structural_revision: v2.2.0
owner: Team 10
ssm_dependency: 1.0.0
---
# 🛠️ PHOENIX WORK STATE (WSM) v1.0.0

מניפסט המשימות מנהל את צנרת הביצוע ומקשר בין פקודות האדריכל לתוצרי השטח. **מבנה קנוני v2.2.0** (היררכיה, מספור, GATE_2/GATE_8) per 04_GATE_MODEL_PROTOCOL_v2.2.0.

---

## 0. CANONICAL HIERARCHY & GATE LIFECYCLE (v2.2.0)

**Hierarchy:** Roadmap → Stage (שלב) → Program (תכנית) → Work Package (חבילת עבודה) → Task (משימה).  
**Numbering:** S{NNN}-P{NNN}-WP{NNN}-T{NNN}; prefix inheritance; no duplicates.  
**Gate binding:** Only to Work Package (L3).  
**Identity header:** roadmap_id, stage_id, program_id, work_package_id, task_id, gate_id, phase_owner, required_ssm_version, required_active_stage.  
**GATE_2 (KNOWLEDGE_PROMOTION):** Executor **Team 70 (Librarian) ONLY.** Team 170 does not retain promotion execution.  
**GATE_8 (DOCUMENTATION_CLOSURE):** Owner Team 190; Executor Team 70. Trigger: GATE_7 PASS. Lifecycle **not complete** without GATE_8 PASS.

---

## 🗺️ LEVEL 1: ROADMAP MODULES (אסטרטגי)

- M1: Identity & Security - ✅ COMPLETED (v1.0.0)
- M2: Financial Core - 🟡 IN PROGRESS (Batch 2.5)
- M3: External Data (Stage -1) - ⚪ PLANNED

---

## 📋 LEVEL 2: MASTER TASK LIST (מבצעי)

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

**log_entry | [Team 10] | WSM_V1_0_0_ACTIVE | GREEN | 2026-02-19**