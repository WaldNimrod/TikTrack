---
project_domain: SHARED
id: TEAM_170_PROCESS_FUNCTIONAL_SEPARATION_OUTPUT_AMENDMENT_v1.0.0
from: Team 170 (Spec & Governance)
to: Teams 190, 50, 51, 90 (activation prompt authors)
cc: Team 00, Team 100, Team 190
date: 2026-03-15
status: ACTIVE
authority: ARCHITECT_DIRECTIVE_PROCESS_FUNCTIONAL_SEPARATION_v1.0.0 + TEAM_00_TO_TEAM_170_TEAM_190_AOS_DOCS_AUDIT_MANDATE_v1.0.0
---

## Purpose

Canonical output contract amendment for all validation/QA teams. **Effective immediately.** All activation prompts and team context files for Teams 190, 50, 51, 90 must conform.

---

## Output Contract — Teams 190, 50, 51, 90

### REQUIRED (structured verdict only)

| Field | Description |
|-------|-------------|
| verdict | PASS \| FAIL \| BLOCK |
| gate_id | GATE_X (or FAST_X) |
| wp_id | work_package_id |
| findings | List of findings with severity and evidence path (file:line) |
| severity_map | { blocker: N, high: N, medium: N, low: N } |
| pass_criteria | What was checked, what passed |

### PERMANENTLY REMOVED

- **owner_next_action** — routing is the pipeline's job
- "Team X should do Y next" — process decisions are not the validator's domain
- Submission path instructions to other teams
- Correction cycle management directives
- **route_recommendation** / **next_responsible_team** — pipeline derives routing from verdict

### CONSTRAINT

**Do NOT route to other teams.** Output = structured verdict only. Pipeline engine receives verdict and determines next actor.

---

## Application

- `agents_os_v2/context/identity/team_190.md` — reference this amendment
- `agents_os_v2/context/identity/team_51.md` — reference this amendment  
- `agents_os_v2/context/identity/team_90.md` — reference this amendment
- All gate prompts (GATE_0, GATE_1, etc.) used by Team 190 — remove routing fields
- All QA activation prompts for Team 50/51 — remove routing instructions from output template
- All validation prompts for Team 90 — remove routing instructions from output template

---

**log_entry | TEAM_170 | PROCESS_FUNCTIONAL_SEPARATION | OUTPUT_AMENDMENT_ISSUED | 2026-03-15**
