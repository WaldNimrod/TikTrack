# GATE_7_HUMAN_UX_APPROVAL_CONTRACT_v1.0.0

project_domain: SHARED
status: LOCKED
owner: Team 90
scope: GATE_7

---

## 1) Purpose

Define deterministic artifacts and routing for GATE_7 (HUMAN_UX_APPROVAL), including reject routing and transition readiness to GATE_8.

---

## 2) Gate 7 contract

| Item | Requirement |
|---|---|
| Entry | GATE_6 PASS (architectural dev validation approved). |
| Gate owner | Team 90. |
| Human approver | Team 00 / Nimrod (per current governance process). |
| Core process | Team 90 submits approval package, receives decision, routes by outcome, updates WSM. |
| Exit | PASS only on explicit human approval decision artifact. |
| Next action | PASS -> Team 90 activates GATE_8 with Team 70 execution package. |

---

## 3) Canonical artifact names (deterministic templates)

1. Approval request:
`_COMMUNICATION/team_90/TEAM_90_TO_NIMROD_<WP_ID>_GATE7_HUMAN_UX_APPROVAL_REQUEST.md`
2. Human decision record:
`_COMMUNICATION/_Architects_Decisions/NIMROD_GATE7_<WP_ID>_DECISION.md`
3. Gate 8 activation notice (on PASS):
`_COMMUNICATION/team_90/TEAM_90_TO_TEAM_70_<WP_ID>_GATE8_ACTIVATION_CANONICAL.md`
4. Rejection route record (on REJECT):
`_COMMUNICATION/team_90/TEAM_90_<WP_ID>_GATE7_REJECTION_ROUTE_DECISION.md`

---

## 4) Rejection routing (mandatory)

1. `DOC_ONLY_LOOP`: Team 90 performs documentation/report fixes and returns to GATE_6 review path.
2. `CODE_CHANGE_REQUIRED`: Team 90 returns remediation package to Team 10; flow returns to GATE_3.
3. `ESCALATE_TO_TEAM_00`: use when Team 90 cannot classify route deterministically.

---

## 5) Minimal decision schema (required fields)

Every GATE_7 decision artifact must include:

1. `gate_id`
2. `work_package_id`
3. `decision` (`PASS` | `REJECT`)
4. `rejection_route` (`DOC_ONLY_LOOP` | `CODE_CHANGE_REQUIRED` | `ESCALATE_TO_TEAM_00`)
5. `next_required_action`
6. `next_responsible_team`
7. `wsm_update_reference`

---

## 6) Enforcement

1. No GATE_8 activation without explicit GATE_7 decision artifact + WSM update by Team 90.
2. Rejection without explicit route classification is invalid.

---

**log_entry | TEAM_190 | GATE_7_HUMAN_UX_APPROVAL_CONTRACT | LOCKED | 2026-02-23**
