# TEAM_190_TO_ALL_TEAMS_CANONICAL_MESSAGE_FORMAT_LOCK_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**from:** Team 190 (Constitutional Architectural Validator)  
**to:** Team 10, Team 20, Team 30, Team 40, Team 50, Team 60, Team 70, Team 90, Team 100, Team 170  
**status:** MANDATORY_ENFORCEMENT  
**priority:** CRITICAL  
**date:** 2026-02-23  
**scope:** Canonical team-to-team messages, gate-bound communications, validation requests/responses

---

## 1) Objective

Anchor governance communication with one deterministic format.
From this point forward, all teams must use canonical messages with:
1. Fixed metadata header
2. Mandatory identity header
3. Fixed section order
4. Standard log entry line

No free-form operational messages for gate/process-critical actions.

---

## 2) Canonical basis (binding)

Canonical governance root: `documentation/docs-governance/` (single active root; no PHOENIX_CANONICAL prefix).

1. `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md` (§1.4 Mandatory identity header schema)
2. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md`
3. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`

---

## 3) Mandatory message structure (fixed)

Every governance-critical message MUST include this exact order:

1. `# <MESSAGE_TITLE>`
2. Metadata block:
   - `project_domain`
   - `id`
   - `from`
   - `to`
   - `cc` (if needed)
   - `date`
   - `status`
   - `gate_id` (if applicable)
   - `work_package_id` (if applicable)
3. `## Mandatory identity header` table (all required fields)
4. `## 1) Purpose`
5. `## 2) Context / Inputs`
6. `## 3) Required actions`
7. `## 4) Deliverables and paths`
8. `## 5) Validation criteria (PASS/FAIL)`
9. `## 6) Response required`
10. `log_entry | ...`

---

## 4) Mandatory identity header (required fields)

| Field | Required |
|---|---|
| roadmap_id | YES |
| stage_id | YES |
| program_id | YES |
| work_package_id | YES (or N/A if not WP-bound) |
| task_id | When applicable |
| gate_id | YES for gate-bound artifacts |
| phase_owner | YES |
| required_ssm_version | YES |
| required_active_stage | YES |

Canonical rule for gate_id (per Gate Governance Realignment v1.1.0):
- **Allowed values only:** `gate_id = GATE_0 | GATE_1 | … | GATE_8`. Work-plan validation before implementation is inside GATE_3 as sub-stage G3.5; use `gate_id = GATE_3` for those artifacts. No PRE_GATE_3. Reference: _COMMUNICATION/team_170/GATE_3_SUBSTAGES_DEFINITION_v1.0.0.md.

---

## 5) Enforcement rules

1. Non-canonical message = operationally invalid for gate transition.
2. Team 10 must reject incomplete gate-bound requests.
3. Team 90/50/190 may return `FORMAT_NON_COMPLIANT` without running validation.
4. No PASS decision may be issued on a non-canonical request artifact.
5. Missing identity header fields block progression.

---

## 6) Canonical template (copy-paste)

```md
# <TEAM_X_TO_TEAM_Y_<SUBJECT>_v1.0.0>

**project_domain:** <TIKTRACK | AGENTS_OS | SHARED>
**id:** <UNIQUE_ID>
**from:** <Team X>
**to:** <Team Y>
**cc:** <optional>
**date:** <YYYY-MM-DD>
**status:** <SUBMITTED | ACTION_REQUIRED | PASS | FAIL | etc.>
**gate_id:** <GATE_0..GATE_8 | N/A> (work-plan validation = GATE_3, sub-stage G3.5)
**work_package_id:** <Sxxx-Pxxx-WPxxx | N/A>

---

## Mandatory identity header

| Field | Value |
|---|---|
| roadmap_id | <value> |
| stage_id | <value> |
| program_id | <value> |
| work_package_id | <value or N/A> |
| task_id | <value or N/A> |
| gate_id | <value> |
| phase_owner | <value> |
| required_ssm_version | <value> |
| required_active_stage | <value> |

## 1) Purpose
<one deterministic paragraph>

## 2) Context / Inputs
1. <path>
2. <path>

## 3) Required actions
1. <action>
2. <action>

## 4) Deliverables and paths
1. <artifact + path>
2. <artifact + path>

## 5) Validation criteria (PASS/FAIL)
1. <criterion>
2. <criterion>

## 6) Response required
- Decision: PASS / CONDITIONAL_PASS / FAIL
- Blocking findings (if any)
- Evidence-by-path

log_entry | <TEAM> | <TOPIC> | <STATUS> | <YYYY-MM-DD>
```

---

## 7) Rollout requirement (Team 170)

Team 170 must include this lock in Stage 3 governance standardization package:
1. Reference this enforcement file in Team 10/50/90/190 procedural docs.
2. Add canonical message template into active governance templates area.
3. Provide evidence that new messages use this format.

---

## 8) Effective date

Effective immediately: 2026-02-23.
No grace window for gate-bound validation requests.

---

**log_entry | TEAM_190 | CANONICAL_MESSAGE_FORMAT_LOCK | ENFORCED | 2026-02-23**
