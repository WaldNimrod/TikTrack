# WSM Task Structure (L1/L2/L3) v1.0.0
**project_domain:** TIKTRACK

**id:** WSM_TASK_STRUCTURE_L1_L2_L3_v1.0.0  
**from:** Team 170 (Librarian / SSOT Authority)  
**to:** Team 10 (The Gateway), Team 190 (Constitutional Validator)  
**re:** PHOENIX DEV OS — SPEC PACKAGE EXPANSION & KNOWLEDGE PROMOTION MANDATE  
**date:** 2026-02-19  
**stage context:** GAP_CLOSURE_BEFORE_AGENT_POC  
**authority:** Documentation integrity only. No Gate authority.

---

## 1. Purpose

Extend the Phoenix Work State Manifest (WSM) with tasks arising from ADR-026 (Dual-Manifest, Gates 0–6, POC-1 Observer) and MB3A Alerts continuation. Order: **FOUNDATION → POC-1 → ALERTS**. Each task includes required_ssm_version, required_active_stage, input_artifacts[], output_artifacts[], gate_required where applicable.

**Evidence:** _COMMUNICATION/_Architects_Decisions/ADR_026_AGENT_OS_FINAL_VERDICT.md, _COMMUNICATION/_Architects_Decisions/PHOENIX_MASTER_WSM_v1.0.0.md, _COMMUNICATION/team_100/DEV_OS_TARGET_MODEL_CANONICAL_v1.3.1/04_GATE_MODEL_PROTOCOL.md.

---

## 2. LEVEL 1 — ROADMAP MODULES (אסטרטגי)

| Module | Description | required_ssm_version | required_active_stage | gate_required |
|--------|-------------|----------------------|------------------------|---------------|
| M1 | Identity & Security | 1.0.0 | (completed) | — |
| M2 | Financial Core | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC or later | — |
| M3 | External Data (Stage -1) | 1.0.0 | PLANNED | — |
| M-POC1 | POC-1 Observer / Agent OS Foundation | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | Gate 5, Gate 6 |
| M-MB3A | MB3A Alerts (D34) | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | Gate 5 PASS (done); Gate 6 per product |

---

## 3. LEVEL 2 — FOUNDATION & DUAL-MANIFEST (ADR-026)

| Task ID | Description | required_ssm_version | required_active_stage | input_artifacts[] | output_artifacts[] | gate_required |
|---------|-------------|----------------------|------------------------|--------------------|--------------------|---------------|
| L2-SSM-001 | SSM entity registry fix (remove guessed ALERT states; UUID; DOM from spec) | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | SSM_DELTA_PROPOSAL_v1.0.0.md, ALERTS_WIDGET_SPEC_v1.0.1_FULL_LOCK.md, d34_alerts.sql | PHOENIX_MASTER_SSM_v1.0.0 (updated) | Gate 5 |
| L2-WSM-001 | WSM task structure extension (L1/L2/L3 with ADR-026 + POC-1 + MB3A) | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | ADR_026_AGENT_OS_FINAL_VERDICT.md, PHOENIX_MASTER_WSM_v1.0.0.md | WSM_TASK_STRUCTURE_L1_L2_L3_v1.0.0.md, PHOENIX_MASTER_WSM (updated) | — |
| L2-GATE-001 | Gate chain wiring (Gates 0–6 semantics documented in SSM) | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | 04_GATE_MODEL_PROTOCOL.md, SSM_DELTA_PROPOSAL | SSM § Gate signer semantics | Gate 5 |
| L2-POC1-001 | POC-1 Observer spec (read-only agent; STATE_SNAPSHOT.json) | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | ACTIVE_STAGE.md, 00_MASTER_INDEX.md, SSM, WSM | POC_1_OBSERVER_SPEC_v1.0.0.md | Gate 5 |

---

## 4. LEVEL 2 — MB3A ALERTS CONTINUATION

| Task ID | Description | required_ssm_version | required_active_stage | input_artifacts[] | output_artifacts[] | gate_required |
|---------|-------------|----------------------|------------------------|--------------------|--------------------|---------------|
| L2-MB3A-ALERTS-001 | Alerts module spec lock (reference only; already done) | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | ALERTS_WIDGET_SPEC_v1.0.1_FULL_LOCK.md, MB3A_ALERTS_WIDGET_SPEC_V1_0_1_CONSTITUTIONAL_REVIEW.md | (no new artifact; spec is locked) | Gate 5 PASS |
| L2-MB3A-ALERTS-002 | Alerts continuation tasks (e.g. Home widget wiring, CRUD UI) — if authorized | 1.0.0 | As per Team 10 | ALERTS_WIDGET_SPEC_v1.0.1, SSM | Per task list | Gate 5, Gate 6 |

---

## 5. LEVEL 3 — EXECUTION TASKS (POC-1 Observer)

| Task ID | Description | required_ssm_version | required_active_stage | input_artifacts[] | output_artifacts[] | gate_required |
|---------|-------------|----------------------|------------------------|--------------------|--------------------|---------------|
| L3-POC1-OBS-001 | Implement POC-1 Observer: read disk artifacts only, produce STATE_SNAPSHOT.json | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | POC_1_OBSERVER_SPEC_v1.0.0.md, 00_MASTER_INDEX.md, ACTIVE_STAGE.md, SSM, WSM | STATE_SNAPSHOT.json (per spec schema) | — |
| L3-POC1-OBS-002 | Validate STATE_SNAPSHOT.json against POC-1 Observer validation rules | 1.0.0 | GAP_CLOSURE_BEFORE_AGENT_POC | STATE_SNAPSHOT.json, POC_1_OBSERVER_SPEC_v1.0.0.md | Validation report (pass/fail) | — |

---

## 6. Bridge Contract (unchanged from WSM)

כל משימה במניפסט זה כפופה ל:
- Required SSM: 1.0.0
- Required Stage: GAP_CLOSURE_BEFORE_AGENT_POC (unless task specifies otherwise)

---

**log_entry | TEAM_170 | WSM_TASK_STRUCTURE_v1.0.0 | 2026-02-19**
