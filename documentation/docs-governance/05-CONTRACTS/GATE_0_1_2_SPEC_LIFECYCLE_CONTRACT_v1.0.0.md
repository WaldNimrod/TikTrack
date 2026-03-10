# GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT_v1.0.0

project_domain: SHARED
status: LOCKED
owner: Team 190
scope: GATE_0, GATE_1, GATE_2

---

## 1) Purpose

Define a deterministic artifact contract for the architectural specification phase (GATE_0..GATE_2): entry package, validation output, WSM update, and handoff package.

---

## 2) Gate contract matrix

| Gate | Entry trigger | Mandatory inputs | Mandatory outputs | Exit condition | Next owner/action | Involved teams |
|---|---|---|---|---|---|---|
| GATE_0 | Idea intake for scope/stage | Scope brief + context injection block (SSM/WSM refs) | Gate result record + WSM update record | PASS or REJECT decision recorded | PASS -> GATE_1 (Team 190) | Team 190 + Architects + Team 00/100 |
| GATE_1 | LOD400 spec lock candidate | LLD/spec package + gap/clarification list | Gate result record + correction list (if fail) + WSM update record | LOD400 lock approved | PASS -> GATE_2 (Team 190) | Team 170 + Team 190 |
| GATE_2 | Architect review of detailed spec (**Intent gate**: "האם אנחנו מאשרים לבנות את זה?") | Submission package to architects + traceability table | Architect decision record + gate result record + WSM update record + handoff package to Team 10 | Architect APPROVED | PASS -> GATE_3 intake (Team 10) | Team 190 + Team 170 + Team 00/100 + Team 10 |

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

**log_entry | TEAM_190 | GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT | LOCKED | 2026-02-23**
**log_entry | TEAM_170 | GATE_0_1_2_SPEC_LIFECYCLE_CONTRACT | SUPERSEDED_BY_v1.1.0 | 2026-03-11**
