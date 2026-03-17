---
id: TEAM_00_TO_TEAM_170_GOVERNANCE_UPDATE_MANDATE_v1.0.0
from: Team 00 (Chief Architect — Nimrod)
to: Team 170 (Spec & Governance Authority)
cc: Team 100
date: 2026-03-17
status: ACTIVE
authority: TEAM_00_CONSTITUTIONAL_MANDATE
reference: ARCHITECT_DIRECTIVE_GATE_ARCHITECTURE_CANONICAL_ADDENDUM_v1.0.0.md
---

# Governance Update Mandate — SSM + Team 10 Role + Team 101 Registration

Three additions required to align SSM, team documentation, and team roster with the locked Gate Architecture directive.

---

## Task 1 — Add Maker-Checker Rule to SSM

**File:** `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_SSM_v1.0.0.md`

**Where to insert:** Under governance principles / foundational rules. Find the section that contains IR-ONE-HUMAN-01 and IR-VAL-01. Add as a new principle after IR-VAL-01.

**Exact text to add (copy verbatim):**

```
### IR-MAKER-CHECKER-01 — The Maker-Checker Principle (locked 2026-03-17)

No team may serve as the Checker (validator) for an artifact it produced as the Maker
(executor) in the same work package.

Definitions:
- **Maker:** A team that produces an artifact in a gate (plan, spec, code, document).
- **Checker:** A team that evaluates an artifact for correctness, compliance, or completeness.

A team may be a Maker in one WP and a Checker in a different WP. The constraint is
per-work-package, not per-team globally.

Enforcement: Gate ownership assignments enforce this rule structurally. Violations
require Team 00 constitutional authorization to override.

Reference: ARCHITECT_DIRECTIVE_GATE_ARCHITECTURE_CANONICAL_ADDENDUM_v1.0.0.md §B.1
```

---

## Task 2 — Update Team 10 Role Definition

**Files to update:** All Team 10 identity/runbook/gateway documents you maintain. At minimum:
- Any `team_10.md` or `TEAM_10_GATEWAY_ROLE_AND_PROCESS.md` in `documentation/`
- Any onboarding or activation prompt template for Team 10

**Changes:**

1. **Replace title/role:** "Execution Orchestrator" → "Work Plan Generator"

2. **Remove all instructions** telling Team 10 to update WSM directly. Replace with:
   > "WSM state is managed exclusively by the pipeline system (`pipeline.py`). Team 10 does not modify WSM files directly. Pipeline state transitions that require WSM updates are handled automatically by the orchestrator."

3. **Add clarification of scope:**
   > "Team 10's sole output at GATE_3 is the implementation work plan (`TEAM_10_{WP}_G3_PLAN_WORK_PLAN_v*.md`). Team 10 does not orchestrate teams, manage state, or update governance files."

---

## Task 3 — Register Team 101 in Team Roster

**File:** `TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md` (wherever you maintain the canonical team roster)

**Action:** Add a new entry for Team 101 with the following exact fields:

```
| Team 101 | IDE Architecture Authority | Local IDE (Cursor co-pilot) | Advisory architecture review — surfacing code-level observations to Team 00 | Team 00 exclusively |
```

**Detailed entry:**

- **Team ID:** Team 101
- **Name:** IDE Architecture Authority
- **Engine:** Local IDE (Cursor co-pilot — same environment as Team 00)
- **Role:** Advisory architecture review. Surfaces code-level observations, pattern anomalies, and architectural questions to Team 00. Does NOT produce mandates, does NOT issue directives to other teams.
- **Authority:** Advisory only. All output is treated as input to Team 00 for evaluation. Team 00 decides whether to adopt, modify, or reject.
- **Reporting line:** Team 00 exclusively. Team 101 does not communicate with any other team directly.
- **Status:** Active (registered 2026-03-17)
- **Reference:** `ARCHITECT_DIRECTIVE_GATE_ARCHITECTURE_CANONICAL_ADDENDUM_v1.0.0.md` §A

**Note on framing:** Team 101 input is processed as "architectural observations submitted to Team 00" — not as requests, mandates, or directives. The procedural framing "Team 101 requests that Team 00..." is incorrect. Correct framing: "Team 101 observation → Team 00 evaluates → Team 00 decides."

---

## Deliverable

Write: `_COMMUNICATION/team_170/TEAM_170_GOVERNANCE_UPDATE_COMPLETE_v1.0.0.md`

Required sections:
- Files modified (list with change type)
- SSM section added (confirm IR-MAKER-CHECKER-01 present)
- Team 10 role updated (confirm "Orchestrator" label removed from all documents)
- Team 101 registered (confirm entry added to roster with correct authority level)

Submit to Team 00 for review.

---

**log_entry | TEAM_00 | TEAM_170_MANDATE | SSM+TEAM10_ROLE | ISSUED | 2026-03-17**
**log_entry | TEAM_00 | TEAM_170_MANDATE | TEAM_101_REGISTRATION_ADDED | 2026-03-17**
