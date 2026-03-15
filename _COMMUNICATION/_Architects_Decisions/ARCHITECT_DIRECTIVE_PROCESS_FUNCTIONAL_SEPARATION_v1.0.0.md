---
directive_id:  ARCHITECT_DIRECTIVE_PROCESS_FUNCTIONAL_SEPARATION_v1.0.0
author:        Team 00 — Chief Architect
date:          2026-03-15
status:        LOCKED — Iron Rule
authority:     Team 00 constitutional authority + Nimrod confirmation
supersedes:    (new — no prior directive on this subject)
applies_to:    ALL teams, ALL modes (Mode 1 / Mode 2 / Mode 3)
problem_solved: Validation/QA teams carrying dual responsibility (functional executor + process orchestrator),
               creating routing ambiguity, hand-off overhead, and architectural drift as AOS evolves
---

# ARCHITECT DIRECTIVE — Process-Functional Separation

## The Core Problem

Over the course of S002, a structural anti-pattern emerged: **teams responsible for functional execution (validate, test, review) were also making process decisions (who acts next, how to route, what constitutes a correction cycle).**

Symptoms observed:
- Team 190 issuing `owner_next_action` directives after BLOCK verdicts
- Team 51 coordinating submission paths rather than just testing
- Team 90 managing remediation cycles in addition to reviewing
- Team 10 conflating process coordination with technical implementation
- Correction loops requiring human routing decisions that should be deterministic
- Documents mixing "what we found" with "what should happen next" — two separate concerns

The root cause is a **missing separation of concerns** at the architectural layer.

---

## The Principle: Two Layers, No Crossing

```
┌──────────────────────────────────────────────────────────────────┐
│  PROCESS LAYER — "who acts next, how to route"                   │
│                                                                  │
│  Mode 1 (legacy):    Nimrod (authority) + Team 10 (coordinator)  │
│  Mode 2 (semi-auto): Pipeline engine (state.py + pipeline_run)   │
│  Mode 3 (full-auto): Pipeline engine — fully automated           │
└──────────────────────────────────────────────────────────────────┘
         ↕  structured verdict ONLY — no routing
┌──────────────────────────────────────────────────────────────────┐
│  FUNCTIONAL LAYER — "what specific work is done at this step"    │
│                                                                  │
│  Team 170:  Document authoring (LLD400, specs, closure docs)     │
│  Team 190:  Constitutional validation — findings only            │
│  Team 50/51: QA testing — test results only                      │
│  Team 90:   Human review — UX/correctness notes only             │
│  Team 10/61: Implementation execution                            │
│  Team 20/30: Backend / Frontend execution                        │
└──────────────────────────────────────────────────────────────────┘
```

**No team in the Functional Layer may issue routing instructions, manage correction cycles, or direct other teams.** These are exclusively Process Layer responsibilities.

---

## Verdict Format Standard — LOCKED (Iron Rule)

Effective immediately, all validation/QA teams (Team 190, Team 50/51, Team 90) output **structured verdicts only**. The canonical output contract:

```
## Verdict
verdict:       PASS | FAIL | BLOCK
gate_id:       <GATE_X>
wp_id:         <work_package_id>
findings:      [...list of findings with severity and evidence path...]
severity_map:  { blocker: N, high: N, medium: N, low: N }
pass_criteria: [...what was checked, what passed...]
```

**Permanently removed from output contracts:**
- `owner_next_action` — routing is the pipeline's job
- "Team X should do Y next" — process decisions are not the validator's domain
- Submission path instructions to other teams
- Correction cycle management directives

**Remaining allowed in output:**
- Findings with precise evidence paths (file:line)
- Severity classification
- Reproduction steps for blockers
- What the pass criteria were and how the verdict was reached

---

## Gate Ownership — Redefined

"Ownership" of a gate now means **execution authority** — who performs the work at that gate. It does NOT mean process routing authority.

| Gate | Executes | Verdict Recipient | Routes Next Step |
|---|---|---|---|
| GATE_0 | Team 190 (auto scan) | Pipeline engine | Pipeline |
| GATE_1 Ph.1 | Team 170 (LLD400 authoring) | Pipeline engine | Pipeline |
| GATE_1 Ph.2 | Team 190 (LLD400 validation) | Pipeline engine | **Pipeline** (not Team 190) |
| GATE_2 | Team 100 (intent review) | Team 00 / Nimrod | Human |
| GATE_3 | Team 10 (technical plan) | Pipeline engine | Pipeline |
| GATE_4 | Team 10/61 (build execution) | Pipeline engine | Pipeline |
| GATE_5 | Team 190 (validate build) | Pipeline engine | **Pipeline** (not Team 190) |
| GATE_6 | Team 90 (full review) | Team 00 / Nimrod | **Team 00** (not Team 90) |
| GATE_7 | Nimrod (UX sign-off) | Nimrod | Nimrod |
| GATE_8 | Team 170 (closure/docs) | Pipeline engine | Pipeline |

---

## Team 10 — Role Evolution Across Modes

Team 10's original definition ("Gateway — execution lead, gate submissions, WSM updates") conflates three distinct functions. These are separated:

### Mode 1 (Legacy — no AOS)
Team 10 acts as **Process Coordinator**:
- Receives all verdicts (PASS/FAIL/BLOCK) from functional teams
- Routes deterministically per routing table (no discretion — routing table is canonical)
- Activates next team per gate sequence
- Manages WSM updates

Routing table in Mode 1 is defined in `TEAM_00_TO_TEAM_10_ROUTING_TABLE_v1.0.0.md` (to be authored by Team 170 per mandate below).

Nimrod retains final authority; Team 10 coordinates operationally.

### Mode 2 (Semi-Automatic — AOS + Dashboard)
Team 10 acts as **Implementation Technical Authority**:
- Executes GATE_3 (technical work plan)
- Executes GATE_4 (build oversight, Team 61 activation)
- Answers technical architecture questions from Teams 20/30/61
- Does NOT route between gates — pipeline engine does this
- Does NOT manage submissions — pipeline_run.sh does this

### Mode 3 (Fully Automatic — AOS complete)
Team 10 acts as **Technical Consultation Authority**:
- Available for complex/risky builds requiring human architectural judgment
- Escalation path when automated agents require human technical sign-off
- NOT a process manager — pipeline handles all routing
- The pipeline engine replaces Team 10's process management function entirely

**Summary:** Team 10's permanent value is **technical depth** — knowing how to build complex things correctly. Its transient value was process coordination, which belongs to the pipeline in Mode 2+.

---

## Correction Cycles — New Canonical Behavior

Under the old model, correction cycles were managed by whoever issued the BLOCK. Under this directive:

**A BLOCK verdict triggers a deterministic pipeline response:**

```
Functional team issues BLOCK
         ↓
Pipeline engine receives BLOCK
         ↓
State transition: advance_gate(GATE_X, FAIL) → state recorded
         ↓
Dashboard: auto-shows "correction cycle" panel for responsible team
         ↓
Responsible team revises → re-submits → re-validation
```

No human routing decision required in Mode 2+.
In Mode 1, Team 10 applies the routing table.

---

## What Does NOT Change

1. **Team role assignments** — which team executes which gate (unchanged)
2. **Gate sequence** — the gate order is unchanged
3. **Two-phase structure of GATE_1** — Phase 1 (Team 170) + Phase 2 (Team 190) unchanged
4. **Team 100's approval authority** at GATE_2 and GATE_6 (delegated from Team 00) — unchanged
5. **Nimrod's GATE_7 authority** — unchanged
6. **Team 190's constitutional authority** — they remain the highest validation authority for architectural integrity; only their output format changes, not their judgment

---

## Implementation Required

This directive requires the following downstream updates:

| Item | Owner | Document |
|---|---|---|
| Team Roster Lock v2.0.0 — Team 10 definition update | Team 00 | `ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v2.0.0.md` |
| Team 190 output contract — remove `owner_next_action` | Team 190 | Per mandate `TEAM_00_TO_TEAM_190_VERDICT_FORMAT_MANDATE_v1.0.0.md` |
| Team 50/51 output contract — findings only | Team 51 | Per docs audit mandate |
| Team 90 output contract — review notes only | Team 90 | Per docs audit mandate |
| AOS architecture docs audit | Teams 170 + 190 | Per mandate `TEAM_00_TO_TEAM_170_TEAM_190_AOS_DOCS_AUDIT_MANDATE_v1.0.0.md` |
| Dashboard teams page update | Team 30 | Per mandate `TEAM_00_TO_TEAM_30_TEAMS_PAGE_UPDATE_MANDATE_v1.0.0.md` |
| All agent context files (activation prompts) | Team 170 | Per docs audit mandate |
| Mode 1 routing table (canonical) | Team 170 | New document: `TEAM_10_MODE1_ROUTING_TABLE_v1.0.0.md` |

---

## Compliance Check

After implementation, verify:
1. No document issued by Team 190/51/90 contains `owner_next_action` or routing instructions
2. Pipeline dashboard auto-selects correct next actor after every BLOCK without human routing decision
3. Team 10 activation prompts reflect Mode 1 / Mode 2 / Mode 3 distinctions
4. Correction cycles (GATE_1 fail → Team 170 retry) are pipeline-driven, not Team 190-driven

---

*log_entry | TEAM_00 | PROCESS_FUNCTIONAL_SEPARATION | DIRECTIVE_LOCKED | 2026-03-15*
