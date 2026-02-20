---
id: PHOENIX_WORK_STATE
version: 1.1.0
status: ACTIVE_CANDIDATE
owner: Team 10
ssm_dependency: 1.0.0
---
# PHOENIX WORK STATE (WSM) v1.1.0

מניפסט המשימות מנהל את צנרת הביצוע ומקשר בין פקודות האדריכל לתוצרי השטח.

**Update (v1.0.0 → v1.1.0):** Roadmap & L2 structural update per Team 100 directive. Four canonical L2 work packages under roadmap AGENT_OS_PHASE_1 with full identity binding and execution gates. Source: _COMMUNICATION/team_170/WSM_PHASE_UPDATE_v1.0.0.md.

---

## L0 — ROADMAP (AGENT_OS_PHASE_1)

| roadmap_id | title | required_ssm_version | required_active_stage |
|------------|--------|----------------------|------------------------|
| AGENT_OS_PHASE_1 | Development of Initial Agents (Validation Kernel Track) | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC |

---

## L1 — INITIATIVES (4)

| initiative_id | roadmap_id | description |
|---------------|------------|-------------|
| INFRASTRUCTURE_STAGE_1 | AGENT_OS_PHASE_1 | Gate Model Finalization |
| INFRASTRUCTURE_STAGE_2 | AGENT_OS_PHASE_1 | Validation Kernel (10↔90) |
| INFRASTRUCTURE_STAGE_3 | AGENT_OS_PHASE_1 | Secondary Validator (90↔Stage Owner) |
| PRODUCT_POC_MB3A_ALERTS_WIDGET | AGENT_OS_PHASE_1 | MB3A Alerts Widget POC |

---

## L2 — WORK PACKAGES (4 canonical — AGENT_OS_PHASE_1)

Each work package includes: roadmap_id, initiative_id, work_package_id, phase_owner, required_ssm_version, required_active_stage, execution_start_gate, execution_end_gate.

| work_package_id | initiative_id | roadmap_id | phase_owner | required_ssm_version | required_active_stage | execution_start_gate | execution_end_gate |
|-----------------|---------------|------------|-------------|----------------------|------------------------|----------------------|--------------------|
| L2-INFRA-STAGE-1 | INFRASTRUCTURE_STAGE_1 | AGENT_OS_PHASE_1 | Team 10 | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | GATE_0 | GATE_1 |
| L2-INFRA-STAGE-2 | INFRASTRUCTURE_STAGE_2 | AGENT_OS_PHASE_1 | Team 10 | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | GATE_2 | GATE_4 |
| L2-INFRA-STAGE-3 | INFRASTRUCTURE_STAGE_3 | AGENT_OS_PHASE_1 | Team 10 | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | GATE_2 | GATE_4 |
| L2-POC-MB3A-ALERTS | PRODUCT_POC_MB3A_ALERTS_WIDGET | AGENT_OS_PHASE_1 | Team 10 | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | GATE_2 | GATE_6 |

**Structural rule:** Infrastructure and Product POC share the gate chain; distinct initiative_id prevents cross-context ambiguity.

**Canonical guard (mandatory):** No Development Validation (GATE_4) may occur before GATE_3 PASS. Source: `_COMMUNICATION/team_100/DEV_OS_TARGET_MODEL_CANONICAL_v1.3.1/04_GATE_MODEL_PROTOCOL.md` (Process Freeze Constraints); `_COMMUNICATION/team_100/TEAM_100_TO_ALL_ARCHITECTURE_TEAMS_GATE_AND_IDENTITY_FREEZE.md`.

---

## LEGACY / OTHER MODULES (pre–v1.1.0)

Unchanged from v1.0.0. Migration or retirement per Team 10.

### LEVEL 1: ROADMAP MODULES (אסטרטגי)

- M1: Identity & Security - ✅ COMPLETED (v1.0.0)
- M2: Financial Core - 🟡 IN PROGRESS (Batch 2.5)
- M3: External Data (Stage -1) - ⚪ PLANNED

### LEVEL 2: MASTER TASK LIST (מבצעי)

| Task ID | Description | Owner | Status | Evidence Link |
| :--- | :--- | :--- | :--- | :--- |
| L2-024 | Account-based Fees Refactor | Team 20 | DONE | EVIDENCE_L2_024.json |
| L2-025 | Broker Reference API | Team 20 | ACTIVE | - |
| L2-026 | POC-1 Observer Engine | Team 100 | BLOCKED | - |

---

## BRIDGE CONTRACT (חוזה גישור)

כל משימה במניפסט זה כפופה ל:
- Required SSM: 1.0.0
- Required Stage: GAP_CLOSURE_BEFORE_AGENT_POC

**log_entry | [Team 10] | WSM_V1_1_0_CANDIDATE | 2026-02-20**
