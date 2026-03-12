
# TEAM_10_GATE_ACTIONS_RUNBOOK v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0  
**owner:** Team 170 (canonical); applied by Team 10  
**date:** 2026-03-10  
**status:** LOCKED  
**canonical basis:** 04_GATE_MODEL_PROTOCOL_v2.3.0 (§7 references this runbook as single operational source)

---

## 1) Purpose

Single deterministic runbook for Team 10 (Gateway) gate execution. Gate Protocol (01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0) remains normative for enum, authority, and identity; this document defines **operational** entry/exit and mandatory actions per gate.

---

## 2) Preconditions (global)

- SSM/WSM and Gate Protocol are canonical. Identity header and canonical message format (TEAM_190_TO_ALL_TEAMS_CANONICAL_MESSAGE_FORMAT_LOCK_v1.0.0) apply to all gate-bound artifacts.
- Team 10 uses TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0 for scope (20/30/40/60); activates **every** development team in scope with explicit mandate/prompt.
- Fast-track operations (when declared) are governed by `documentation/docs-governance/04-PROCEDURES/FAST_TRACK_EXECUTION_PROTOCOL_v1.2.0.md`; this runbook remains the canonical execution reference for GATE_3 internals.
- Cross-owner gate artifact contracts are mandatory references:
  - `documentation/docs-governance/05-CONTRACTS/GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT_v1.1.0.md`
  - `documentation/docs-governance/05-CONTRACTS/GATE_7_HUMAN_UX_APPROVAL_CONTRACT_v1.1.0.md`
  - **Phase 0 (GATE_4/5/6/7):** `documentation/docs-governance/04-PROCEDURES/GATES_4_5_6_7_GOVERNANCE_POLICY_v1.0.0.md`; `G5_AUTOMATION_EVIDENCE_CONTRACT`, `G6_TRACEABILITY_MATRIX_CONTRACT`, `G7_HUMAN_RESIDUALS_MATRIX_CONTRACT` (05-CONTRACTS).

---

## 3) GATE_3 (IMPLEMENTATION) — sub-stages G3.1..G3.9

Internal sub-stage sequence: _COMMUNICATION/team_170/GATE_3_SUBSTAGES_DEFINITION_v1.0.0.md. **G3.5 (WORK_PACKAGE_VALIDATION_WITH_TEAM_90)** is mandatory before G3.6: Team 10 submits work plan to Team 90; only after Team 90 PASS may Team 10 proceed to team activation.

**AGENTS_OS sequence (includes G3.7):** G3.1 → G3.2 → G3.3 → G3.4 → G3.5 → **G3.7 (Test Template Generation)** → G3.6 → G3.8 → G3.9. For TIKTRACK-only flows, G3.7 is skipped unless explicitly activated.

### 3.1 G3.7 — Test Template Generation (AGENTS_OS)

| Item | Content |
|------|---------|
| **Placement** | After G3.5 (Work Package Validation); **before** G3.6 (Team Activation Mandates). |
| **Action** | Run Test Template Generation on spec: `generate_test_templates`; outputs in `tests/api/` and `tests/ui/`. |
| **BLOCK rule** | TT-00 BLOCK when required spec section is empty. |
| **Source** | `agents_os_v2/orchestrator/gate_router.py` — `run_g3_7_test_template_generation()`. |
| **Canonical dependency** | `agents_os_v2/requirements.txt` (Jinja2>=3.1.0,<4.0) — AGENTS_OS canonical. |

| Item | Content |
|------|---------|
| **Entry** | Work Package defined; execution plan ready. G3.5 PASS (Team 90 work-plan validation) required before G3.6 (and before G3.7 when AGENTS_OS). |
| **Team 10 mandatory actions** | (1) G3.1–G3.5: Spec intake, implementation review, clarification loop, detailed build, **submit to Team 90 for validation (G3.5)**; wait for PASS. (2) **AGENTS_OS:** Execute **G3.7 (Test Template Generation)** — run `generate_test_templates` on spec; ensure outputs in `tests/api/`, `tests/ui/`; TT-00 BLOCK if section empty. (3) G3.6–G3.9: Issue mandate to each dev team in scope (20/30/40/60 per TEAM_DEVELOPMENT_ROLE_MAPPING); orchestrate; collect deliverables; pre-check; build GATE_3 exit package; submit to GATE_4 (QA). (4) Update WSM (current_gate, last_gate_event, next_required_action). |
| **Required artifacts** | EXECUTION_AND_TEAM_PROMPTS (or equivalent); Team 90 G3.5 response; (AGENTS_OS: G3.7 test template outputs where applicable); completion reports; GATE_3 exit package to GATE_4. |
| **Exit** | Implementation complete; package handed to GATE_4 (QA). |
| **WSM** | Team 10 (Gate Owner for GATE_3) updates WSM immediately upon GATE_3 closure. |

---

## 4) GATE_4 (QA)

| Item | Content |
|------|---------|
| **Entry** | GATE_3 exit delivered to QA. |
| **Team 10 mandatory actions** | (1) Deliver QA package (context, links, evidence) to QA per role mapping. (2) Wait for QA report (0 SEVERE). (3) Update task lists; on PASS proceed to GATE_5. |
| **Required artifacts** | QA handover (canonical format); QA report. |
| **Exit** | QA PASS (0 SEVERE). |
| **WSM** | Team 10 (Gate Owner for GATE_4) updates WSM on gate closure. |

---

## 5) GATE_5 (DEV_VALIDATION)

| Item | Content |
|------|---------|
| **Entry** | GATE_4 PASS. |
| **Team 10 mandatory actions** | (1) Submit WORK_PACKAGE_VALIDATION_REQUEST (gate_id GATE_5) to Team 90 with full package. (2) Wait for VALIDATION_RESPONSE. (3) Update task lists and WSM on PASS. |
| **Required artifacts** | GATE_5 validation request (canonical + identity header); Team 90 response. |
| **Exit** | Team 90 PASS. |
| **WSM** | Gate Owner (Team 90 for GATE_5) updates WSM; Team 10 updates lists. |

---

## 6) GATE_6 (ARCHITECTURAL_DEV_VALIDATION — Reality gate)

**Semantic lock:** GATE_6 = "האם מה שנבנה הוא מה שאישרנו?" — Team 100 (approval authority) verifies that what was built matches the intent approved at GATE_2.

| Item | Content |
|------|---------|
| **Entry** | GATE_5 PASS. |
| **Owner** | Team 90 (execution). **Approval authority:** Team 100. |
| **Team 10 mandatory actions** | (1) Submit GATE_6 package to Team 90 (or _ARCHITECT_INBOX per process). (2) Wait for Team 90 / architect decision. (3) On rejection: apply GATE_6 rejection route (DOC_ONLY_LOOP vs CODE_CHANGE_REQUIRED vs escalate to Team 00). Reference: _COMMUNICATION/team_170/GATE_6_REJECTION_ROUTE_PROTOCOL_v1.0.0.md. (4) Update lists and WSM on PASS. |
| **Required artifacts** | GATE_6 submission (canonical) including `G6_TRACEABILITY_MATRIX.md`; Team 90 / architect decision; route classification per GATE_6 rejection protocol. |
| **Exit** | GATE_6 PASS (architectural dev validation approved). |
| **WSM** | Team 90 (Gate Owner) updates WSM on closure. |

---

## 7) GATE_7 (HUMAN_UX_APPROVAL)

| Item | Content |
|------|---------|
| **Entry** | GATE_6 PASS. |
| **Owner** | Team 90. |
| **Team 10 mandatory actions** | (1) Provide clarifications only if Team 90 requests them. (2) Wait for human decision routed by Team 90. (3) Do not operate GATE_7 directly. |
| **Required artifacts** | Team 90: `G7_HUMAN_RESIDUALS_MATRIX.md` only (HUMAN_ONLY items); human decision record per `GATE_7_HUMAN_UX_APPROVAL_CONTRACT_v1.1.0.md`. |
| **Execution mode** | Human browser/UI review only: real pages, user actions, visible outcomes, edge cases. No terminal/log review as primary approval path. |
| **Exit** | Human sign-off (`אישור`) received and normalized by Team 90 into canonical decision artifact. |
| **WSM** | Team 90 (Gate Owner) updates WSM on closure. |

---

## 8) GATE_8 (DOCUMENTATION_CLOSURE)

| Item | Content |
|------|---------|
| **Entry** | GATE_7 PASS. |
| **Owner** | Team 90. |
| **Team 10 mandatory actions** | (1) Coordinate with Team 90 (owner). (2) Ensure AS_MADE_REPORT and lifecycle closure. (3) WSM updated by Team 90. |
| **Required artifacts** | AS_MADE_REPORT; GATE_8 validation response. |
| **Exit** | DOCUMENTATION_CLOSED; lifecycle complete. |
| **WSM** | Team 90 (Gate Owner) updates WSM; no active WP. |

---

## 9) WSM update duty (all gates)

**WSM ownership matrix (per _COMMUNICATION/team_170/WSM_OWNER_MATRIX_GATES_0_8_v1.0.0.md):** Gates 0–2 → Team 190 updates WSM. Gates 3–4 → Team 10 updates WSM. Gates 5–8 → Team 90 updates WSM. The Gate Owner must update `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md` block **CURRENT_OPERATIONAL_STATE** immediately upon gate closure. Fields: active_stage_id, current_gate, last_gate_event, next_required_action, next_responsible_team, active_work_package_id (or — if closed). No gate progression without WSM update.

---

## 10) Fast-track reference (optional, non-default)

When a fast-track is formally declared, Team 10 must:

1. Keep `gate_id` canonical and use WSM `track_mode` to represent active mode.
2. Execute FAST_2 by reference to canonical GATE_3 sequence (G3.1..G3.9; G3.5 mandatory).
3. Enforce track exclusivity in WSM (`FAST` active => normal flow HOLD with reason).

Normative fast-track protocol:
`documentation/docs-governance/04-PROCEDURES/FAST_TRACK_EXECUTION_PROTOCOL_v1.2.0.md`

---

**log_entry | TEAM_170 | TEAM_10_GATE_ACTIONS_RUNBOOK | v1.0.0_LOCKED | 2026-02-23**
**log_entry | TEAM_190 | TEAM_10_GATE_ACTIONS_RUNBOOK | FAST_TRACK_REFERENCE_ADDED | 2026-02-26**
