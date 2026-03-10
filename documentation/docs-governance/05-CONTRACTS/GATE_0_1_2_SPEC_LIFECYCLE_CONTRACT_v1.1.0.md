# GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT_v1.1.0

project_domain: SHARED
status: LOCKED
owner: Team 190
scope: GATE_0, GATE_1, GATE_2
**date:** 2026-03-10
**supersedes:** GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT_v1.0.0

---

## 1) Purpose

Define a deterministic artifact contract for the architectural specification phase (GATE_0..GATE_2): entry package, validation output, WSM update, and handoff package.

---

## 2) Gate contract matrix

| Gate | Entry trigger | Mandatory inputs | Mandatory outputs | Exit condition | Next owner/action | Involved teams |
|---|---|---|---|---|---|---|
| GATE_0 | Idea intake for scope/stage | Scope brief + context injection block (SSM/WSM refs) | Gate result record + WSM update record | PASS or REJECT decision recorded | PASS -> GATE_1 (Team 190) | Team 190 + Architects + Team 00/100 |
| GATE_1 | LOD400 spec lock candidate | LLD/spec package + gap/clarification list | Gate result record + correction list (if fail) + WSM update record + **AUTO_TESTABLE / HUMAN_ONLY classification for every acceptance criterion in LOD400 spec** | LOD400 lock approved | PASS -> GATE_2 (Team 190) | Team 170 + Team 190 |
| GATE_2 | Architect review of detailed spec (**Intent gate**: "האם אנחנו מאשרים לבנות את זה?") | Submission package to architects + traceability table | Architect decision record + gate result record + WSM update record + handoff package to Team 10 + **G7_HUMAN_RESIDUALS_MATRIX.md (shell document with HUMAN_ONLY items; Nimrod fills at GATE_7)** + **Confirmation that AUTO_TESTABLE/HUMAN_ONLY classification is complete and reviewed** | Architect APPROVED | PASS -> GATE_3 intake (Team 10) | Team 190 + Team 170 + Team 00/100 + Team 10 |

**Approval authority at GATE_2:** Team 100 (Development Architecture Authority) per canonical gate model. Execution and WSM update: Team 190.

---

## 3) Canonical artifact names (deterministic templates)

1. Gate request package:
`_COMMUNICATION/team_190/TEAM_190_GATE<0|1|2>_<SCOPE_ID>_REQUEST_PACKAGE.md`
2. Gate validation result:
`_COMMUNICATION/team_190/TEAM_190_GATE<0|1|2>_<SCOPE_ID>_VALIDATION_RESULT.md`
3. Architect decision record (GATE_2):
`_COMMUNICATION/_Architects_Decisions/ARCHITECT_GATE2_<SCOPE_ID>_DECISION.md`
4. Handoff to Team 10 (after GATE_2 PASS):
`_COMMUNICATION/team_190/TEAM_190_TO_TEAM_10_<WP_ID>_GATE3_INTAKE_HANDOFF.md`

`<SCOPE_ID>` format: `Sxxx` or `Sxxx_Pxxx` (as applicable).

---

## 4) Minimal decision schema (required fields)

Every GATE_0..GATE_2 decision artifact must include:

1. `gate_id`
2. `scope_id`
3. `decision` (`PASS` | `FAIL` | `BLOCK_FOR_FIX`)
4. `blocking_findings`
5. `next_required_action`
6. `next_responsible_team`
7. `wsm_update_reference`

---

## 5) Enforcement

1. No transition from GATE_0/1/2 without both: decision artifact + WSM update by Team 190.
2. No GATE_3 start without GATE_2 PASS handoff artifact to Team 10.
3. Missing required fields -> artifact invalid for gate transition.

---

## 6) Acceptance Criteria Classification (AUTO_TESTABLE / HUMAN_ONLY)

Every acceptance criterion in a LOD400 spec MUST be tagged with one of:

| Tag | Meaning | Verified at |
|-----|---------|------------|
| AUTO_TESTABLE | Verifiable programmatically with deterministic result | GATE_5 canonical superset |
| HUMAN_ONLY | Requires human judgement, UX assessment, or browser interaction | GATE_7 residuals matrix |

**Classification rules:**
1. Default to AUTO_TESTABLE — classify HUMAN_ONLY only when automation is genuinely not feasible.
2. "Hard to automate" is NOT sufficient justification for HUMAN_ONLY — must be "impossible to automate reliably."
3. Visual design, accessibility, UX flow correctness = HUMAN_ONLY.
4. Data accuracy, functional correctness, API contract compliance = AUTO_TESTABLE.

**Gate dependency:**
- GATE_5 verdict scope = all AUTO_TESTABLE items.
- GATE_7 matrix = all HUMAN_ONLY items. If no HUMAN_ONLY items → GATE_7 is trivially brief (visual confirmation only).
- Reference: GATES_4_5_6_7_GOVERNANCE_POLICY_v1.0.0.md §7.

---

**log_entry | TEAM_170 | GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT | V1_1_0_CREATED | AUTO_TESTABLE_HUMAN_ONLY_CLASSIFICATION_ADDED | ARCHITECT_DECISION_GATE_QUALITY_GOVERNANCE_HARDENING_v1.0.0 | 2026-03-10**
