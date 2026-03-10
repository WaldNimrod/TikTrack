# GATE_7_HUMAN_UX_APPROVAL_CONTRACT_v1.1.0

project_domain: SHARED
status: LOCKED
owner: Team 90
scope: GATE_7
**date:** 2026-03-10
**supersedes:** GATE_7_HUMAN_UX_APPROVAL_CONTRACT_v1.0.0

---

## 1) Purpose

Define deterministic artifacts and routing for GATE_7 (HUMAN_UX_APPROVAL), including reject routing and transition readiness to GATE_8.
This gate is a human browser/UI review gate, not a terminal/log inspection gate.

---

## 2) Gate 7 contract

| Item | Requirement |
|---|---|
| Entry | GATE_6 PASS (architectural dev validation approved). |
| Gate owner | Team 90. |
| Human approver | Team 00 / Nimrod (per current governance process). |
| Core process | Team 90 prepares human-facing browser scenarios, receives human decision, normalizes it into canonical decision artifact, routes by outcome, updates WSM. |
| Exit | PASS only on explicit human approval decision artifact. |
| Next action | PASS -> Team 90 activates GATE_8 with Team 70 execution package. |

### Locked execution semantics

1. GATE_7 is executed by a human approver through the product UI in a browser.
2. Team 90 must provide scenario-based validation instructions that cover real user flows and edge cases.
3. Team 90 must not require terminal commands, log inspection, shell scripts, `/tmp` artifacts, or file-existence checks from the human approver as the core approval path.
4. API coverage in GATE_7 is achieved indirectly through UI workflows (create, edit, toggle, delete, filter, validation), not through direct API tooling by the human approver.

### §2.5 — Infrastructure WP provision (U-03 Iron Rule)

For Work Packages where **no product-facing UI surface exists** at the time of GATE_7 (infrastructure, background services, data pipelines, provider integrations):

GATE_7 must still be executed through a browser/UI surface. Acceptable surfaces:
- Dedicated admin verification page within the product admin UI
- Operational monitoring dashboard or health panel accessible through the browser
- System status panel embedded in an existing admin page (e.g., market data health section in D40)

**Required evidence via the UI surface:**
- Live demonstration that the infrastructure capability is operational
- Observable metrics, statuses, or results that confirm the WP's functional objectives

**Not acceptable as primary GATE_7 approval path (even for infrastructure WPs):**
- Log file attachments
- Terminal session recordings
- Shell script outputs
- `/tmp` or local file existence checks
- API curl outputs submitted without UI correlation

### §2.6 — GATE_6 override prohibition (U-03 Iron Rule)

A GATE_6 CONDITIONAL_APPROVED decision may define conditions (CC-WPxxx) for GATE_7 entry. However:

**GATE_6 conditional approvals may NOT redefine GATE_7 semantics.** Specifically:
- GATE_6 conditions may NOT specify "runtime confirmation only" as the GATE_7 fulfillment path
- GATE_6 conditions may NOT waive the requirement for browser/UI review
- GATE_6 conditions may NOT state "no Nimrod browser UX sign-off required"

Any such language in a GATE_6 decision is **void on its face** and superseded by this contract.

**Exception:** Team 00 may formally amend GATE_7 semantics for a specific WP via a documented architectural decision in `_COMMUNICATION/_Architects_Decisions/`. No other mechanism is valid.

### §2.7 — Residuals-Only Principle (Integration: ARCHITECT_DECISION_GATE_QUALITY_GOVERNANCE_HARDENING_v1.0.0)

GATE_7 verifies **only items that cannot be verified programmatically** — the `HUMAN_ONLY` tagged criteria from the GATE_2 approved spec.

**GATE_7 must NOT:**
- Re-run any acceptance criterion already closed deterministically at GATE_5
- Require running terminal commands, executing test scripts, or reviewing logs as the primary approval action
- Include items already in the `G5_AUTOMATION_EVIDENCE.json` verdict scope

**GATE_7 scope = `G7_HUMAN_RESIDUALS_MATRIX.md` only.**
Team 90 prepares this matrix from the `HUMAN_ONLY` tagged items in the GATE_2 approval.
Nimrod signs off only on items in this matrix.

**Lean GATE_7 principle:** If the GATE_2 spec was classified rigorously (minimal HUMAN_ONLY items), GATE_7 should be brief. Quality investment at GATE_1/2 classification = lean GATE_7.

---

## 3) Canonical artifact names (deterministic templates)

1. Approval request:
`_COMMUNICATION/team_90/TEAM_90_TO_NIMROD_<WP_ID>_GATE7_HUMAN_APPROVAL_SCENARIOS.md`
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

### Human response intake rule (locked)

1. The human approver may respond in Hebrew plain text.
2. Accepted human response tokens:
   - `אישור`
   - `פסילה`
3. On `פסילה`, the human response should include numbered findings in plain language.
4. Team 90 is responsible for converting the human response into the canonical decision artifact and classification route.

### Mandatory scenario content rule

Every GATE_7 scenario artifact issued by Team 90 must include:

1. UI pages to open.
2. Exact user actions to perform in browser.
3. Expected visible result after each action.
4. Edge cases / invalid values to test.
5. Clear PASS vs FAIL rule.
6. Human response format in Hebrew.

---

## 6) Enforcement

1. No GATE_8 activation without explicit GATE_7 decision artifact + WSM update by Team 90.
2. Rejection without explicit route classification is invalid.

---

**log_entry | TEAM_00 | GATE_7_CONTRACT_V1_1_0 | INFRASTRUCTURE_WP_PROVISION_AND_GATE6_OVERRIDE_PROHIBITION_ADDED | ARCHITECT_DIRECTIVE_DUAL_DOMAIN_GOVERNANCE_v1.0.0 | 2026-03-10**
**log_entry | TEAM_170 | GATE_7_CONTRACT_V1_1_0 | CREATED_UNDER_MANDATE | TEAM_00_TO_TEAM_170_GOVERNANCE_IMMEDIATE_ACTIVATION_v1.0.0 | 2026-03-10**
**log_entry | TEAM_00 | GATE_7_CONTRACT_V1_1_0 | RESIDUALS_ONLY_PRINCIPLE_ADDED_SEC_2_7 | ARCHITECT_DECISION_GATE_QUALITY_GOVERNANCE_HARDENING_v1.0.0 | 2026-03-10**
