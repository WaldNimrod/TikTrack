# Identity Header Block (Standardized) — Canonical Template v2.2.0
**project_domain:** TIKTRACK

**directive:** TEAM_100_RETURN_FOR_CANONICAL_UPDATE_v2.2.0  
**date:** 2026-02-20  

Every gate and validation artifact MUST include the following block at the top (or equivalent structured payload). Copy into Work Package Definition, Gate Submission Package, Knowledge Promotion Report, AS_MADE_REPORT, STAGE_CLOSURE_REPORT, and Gate Transition Record.

---

## Mandatory Identity Header (Process Freeze — 04_GATE_MODEL_PROTOCOL_v2.2.0)

| Field | Value | Example |
|-------|--------|--------|
| roadmap_id | L0 identifier | S001 or AGENT_OS_PHASE_1 |
| stage_id | L1 identifier | S001 |
| program_id | L2 identifier | P001 |
| work_package_id | L3 identifier (gate binding) | S001-P001-WP001 |
| task_id | L4 when applicable; else N/A | T001 or N/A |
| gate_id | GATE_0 … GATE_8 | GATE_6 |
| phase_owner | Team 10 or as assigned | Team 10 |
| required_ssm_version | SSM version | 1.0.0 |
| required_active_stage | Active stage | GAP_CLOSURE_BEFORE_AGENT_POC |

---

**log_entry | CANONICAL_TEMPLATES_v2.2.0 | IDENTITY_HEADER_BLOCK | 2026-02-20**
