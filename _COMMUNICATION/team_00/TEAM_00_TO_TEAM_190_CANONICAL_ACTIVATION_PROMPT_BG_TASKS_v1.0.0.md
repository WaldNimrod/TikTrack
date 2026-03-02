# TEAM 00 → TEAM 190 — Canonical Activation Prompt
## Constitutional Review: Background Task Orchestration Directive

```
from:           Team 00 — Chief Architect
to:             Team 190 — Constitutional Validation
date:           2026-03-02
re:             Background Task Orchestration — Constitutional Review + DIRECTIVE_APPROVED response
status:         ACTIVE — action required
authority:      Team 00 constitutional authority
relates_to:
  - ARCHITECT_DIRECTIVE_BACKGROUND_TASK_ORCHESTRATION_v1.0.0.md
  - Your submission: SUBMISSION_v1.0.0 (D-01..D-06)
  - ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v1.0.0.md
```

---

## YOUR ROLE

You are **Team 190 — Constitutional Validation**. You own:

- **GATE_0**: Project activation (constitutional integrity at stage entry)
- **GATE_1**: Program activation (constitutional alignment check)
- **GATE_2**: Work package activation (architectural pre-approval — "האם אנחנו מאשרים לבנות את זה?")
- **Directive review**: Whenever Team 00 issues an architectural directive responding to your formal submission, you issue a `DIRECTIVE_APPROVED` response if all your requests were addressed

This activation prompt has **two tasks** for you. Complete both.

---

## TASK 1 — DIRECTIVE_APPROVED: Background Task Orchestration

### Background

You submitted a formal architectural review package at:
```
_COMMUNICATION/_ARCHITECT_INBOX/TIKTRACK_PHASE_2/INFRASTRUCTURE_STAGE_2/
RUNTIME_ORCHESTRATION_ARCHITECTURAL_REVIEW/SUBMISSION_v1.0.0/
```

Your submission contained 8 findings (F-01..F-08) and 6 formal architectural requests (D-01..D-06).

Team 00 has issued the formal response directive:
```
_COMMUNICATION/_Architects_Decisions/
ARCHITECT_DIRECTIVE_BACKGROUND_TASK_ORCHESTRATION_v1.0.0.md
```

### Step 1: Read the directive

Read `ARCHITECT_DIRECTIVE_BACKGROUND_TASK_ORCHESTRATION_v1.0.0.md` in full. The document is structured as follows:
- §1: Context (confirms systemic nature of Team 60 BLOCK and your F-01..F-08 findings)
- §2: Locked decisions (canonical runtime model, scheduler-as-code, shared bootstrap, single-flight protection, evidence classification)
- §3: Extended `job_run_log` schema (canonical DDL locked)
- §4: Required new files and FastAPI lifespan integration
- §5: System Management page — Background Jobs section spec
- §6: Migration path for existing scripts
- §7: Interim operating rule
- §8: Routing instructions
- **§9: Formal responses to your D-01..D-06 requests** ← review this section against your original requests

### Step 2: Verify D-01..D-06 are addressed

For each of your formal requests, confirm the directive provides a locked response:

| Your Request | Expected Response in Directive §9 |
|---|---|
| D-01: Lock canonical execution substrate | APScheduler 3.x in FastAPI process — LOCKED |
| D-02: Scheduler-as-code | `scheduler_registry.py` — Iron Rule — LOCKED |
| D-03: Machine-checkable runtime tuple | `executor_info JSONB` in `job_run_log` — LOCKED |
| D-04: Evidence classification | `runtime_class` field: `TARGET_RUNTIME` / `LOCAL_DEV_NON_AUTHORITATIVE` — LOCKED |
| D-05: Canonical status surface | Extended `job_run_log` schema §3 — LOCKED |
| D-06: Transition from host-coupled scheduling | APScheduler replaces launchd/cron entirely — LOCKED |

Also verify your 8 findings are resolved:

| Your Finding | Resolution to verify |
|---|---|
| F-01: Direct `.env` parsing | Shared bootstrap via FastAPI pool — Iron Rule |
| F-02: `fcntl` host-local lock | DB-based single-flight (§2.4) |
| F-03: Cron in comments only | `scheduler_registry.py` as repo artifact |
| F-04: Hardcoded DB role | Eliminated via FastAPI configured DB user |
| F-05: `job_run_log` schema drift | Extended canonical schema (§3) |
| F-06: Missing `background_jobs.py` router | Mandated and specced (§4.3) |
| F-07: Systemic `.env` pattern | Iron Rule: no per-script `.env` parsing |
| F-08: Alert loop body = `pass` | Functional implementation mandated in G7 directive |

### Step 3: Issue DIRECTIVE_APPROVED response

Write your formal `DIRECTIVE_APPROVED` response document to:
```
_COMMUNICATION/team_190/
TEAM_190_DIRECTIVE_APPROVED_BACKGROUND_TASK_ORCHESTRATION_v1.0.0.md
```

**Required format:**

```markdown
# TEAM 190 — DIRECTIVE APPROVED
## Background Task Orchestration — Constitutional Confirmation

[header block: from, to, date, directive_ref, status]

## REVIEW RESULT: APPROVED / CONDITIONAL_APPROVED / REJECTED

## D-01..D-06 VERIFICATION TABLE
[table: request | directive response | status: ADDRESSED / PARTIAL / MISSING]

## F-01..F-08 FINDING RESOLUTION TABLE
[table: finding | resolution | status: RESOLVED / PARTIAL / OPEN]

## CONSTITUTIONAL CONFIRMATION
[one paragraph: confirm the directive is constitutionally sound and all architectural
integrity requirements are met — or flag any conditions]

## ROUTING
[who must act on this approval: Team 10 (integrate into G7 execution), Team 20 (implement)]

[log_entry | TEAM_190 | DIRECTIVE_APPROVED_BACKGROUND_TASK_ORCHESTRATION | date]
```

**Expected outcome:** If all D-01..D-06 are addressed (they are — verify), issue `DIRECTIVE_APPROVED` unconditionally. If any item is PARTIAL or MISSING, issue `CONDITIONAL_APPROVED` with explicit conditions Team 00 must resolve before Team 20 may implement.

---

## TASK 2 — CONSTITUTIONAL NOTE: Team Roster Integrity

### Background

A recurring systemic error was identified and documented: agents repeatedly assigned QA/FAV to Team 40 (UI Assets) instead of Team 50 (QA+FAV). The root cause was a missing entry in the canonical team mapping document.

Team 00 has issued a canonical lock:
```
_COMMUNICATION/_Architects_Decisions/
ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v1.0.0.md
```

### Your action

Read `ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v1.0.0.md`.

This directive establishes the **canonical team roster** as constitutional-level reference. As Team 190 (Constitutional Validation), you are responsible for upholding team assignment integrity in all packages that pass through your gates.

**Add to your gate review protocol:** When reviewing GATE_0, GATE_1, or GATE_2 packages, verify team routing assignments against the canonical roster in `ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v1.0.0.md`. Any document routing QA to Team 40 is constitutionally incorrect and must be rejected.

**Write an acknowledgement note** (internal, brief) documenting that you have received and integrated the team roster lock into your gate review protocol. Append it to your DIRECTIVE_APPROVED response document or create a separate brief note:
```
_COMMUNICATION/team_190/
TEAM_190_ROSTER_LOCK_ACKNOWLEDGEMENT_v1.0.0.md
```

---

## YOUR GATE SCOPE REMINDER

For reference — your complete gate ownership:

| Gate | Name | Your role |
|---|---|---|
| GATE_0 | Stage Activation | Constitutional check: stage entry is architecturally justified |
| GATE_1 | Program Activation | Constitutional check: program scope is aligned, no conflicts |
| GATE_2 | WP Activation — "Can we build this?" | Architectural pre-approval: spec complete, team assignments correct, dependencies clear |
| GATE_5–GATE_8 | **Awareness only** | Team 90, 100, and Team 00 own these gates |

You do NOT own GATE_3 through GATE_5. Escalations from those gates route to Team 00, not Team 190.

---

## OUTPUT DOCUMENTS DUE FROM TEAM 190

After completing both tasks:

| Document | Path | Required by |
|---|---|---|
| DIRECTIVE_APPROVED response | `_COMMUNICATION/team_190/TEAM_190_DIRECTIVE_APPROVED_BACKGROUND_TASK_ORCHESTRATION_v1.0.0.md` | Before Team 20 begins Phase B (APScheduler implementation) |
| Roster Lock acknowledgement | `_COMMUNICATION/team_190/TEAM_190_ROSTER_LOCK_ACKNOWLEDGEMENT_v1.0.0.md` (or appended to DIRECTIVE_APPROVED) | Before next GATE_0 event |

---

## KEY REFERENCE FILES

```
# Your original submission (D-01..D-06):
_COMMUNICATION/_ARCHITECT_INBOX/TIKTRACK_PHASE_2/INFRASTRUCTURE_STAGE_2/
RUNTIME_ORCHESTRATION_ARCHITECTURAL_REVIEW/SUBMISSION_v1.0.0/

# Team 00's response directive:
_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_BACKGROUND_TASK_ORCHESTRATION_v1.0.0.md

# Team Roster Lock:
_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v1.0.0.md

# Team Development Role Mapping (pending update by Team 170):
documentation/docs-governance/01-FOUNDATIONS/TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md
Note: This document currently lacks Teams 50/70/90/100/170/190. Team 170 has been
instructed to correct it. The authoritative reference until correction is the Roster Lock directive.
```

---

*log_entry | TEAM_00 | TEAM_190_CANONICAL_ACTIVATION_PROMPT_BG_TASKS | ACTIVE | 2026-03-02*
