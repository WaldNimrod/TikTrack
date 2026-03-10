# FAST_TRACK_EXECUTION_PROTOCOL_v1.1.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** FAST_TRACK_EXECUTION_PROTOCOL_v1.1.0  
**owner:** Team 190 (constitutional lock), executed via Team 10 Gateway  
**date:** 2026-03-10  
**status:** ACTIVE  
**supersedes:** FAST_TRACK_EXECUTION_PROTOCOL_v1.0.0  
**canonical_basis:** 04_GATE_MODEL_PROTOCOL_v2.3.0, PHOENIX_MASTER_WSM_v1.0.0, ARCHITECT_DIRECTIVE_AGENTS_OS_FAST_TRACK_DEFAULT_v1.0.0

---

## 1) Purpose and boundary

This protocol defines a **fast-track execution path**.

- **TIKTRACK domain:** Fast-track remains **optional** (LOCKED_OPTIONAL); activation per §2.
- **AGENTS_OS domain:** Fast-track is the **default** execution path. No separate activation required.

Fast-track does not replace the canonical gate model.

1. `gate_id` remains canonical (`GATE_0..GATE_8` only).
2. Fast-track status is represented by `track_mode` in WSM state.
3. Only one track can be active at a time (exclusive activation).

---

## 2) Activation authority (locked)

### 2.1 TIKTRACK domain

Fast-track can be declared only by Nimrod with one of the following:

1. Architectural team (Team 100 / Team 00), or
2. Validation team (Team 190 / Team 90 as applicable by scope).

The initiating team owns the process end-to-end once activated.

### 2.2 AGENTS_OS domain

Fast-track is **default**. No activation step required. Work Packages in AGENTS_OS scope use this protocol by default unless explicitly routed to full GATE_0..GATE_8 flow.

---

## 3) AGENTS_OS Fast Track — Active teams (locked)

For the AGENTS_OS domain, **only** the following teams are active in fast-track:

| Squad ID | Role |
|----------|------|
| **Team 61** | Executor — implementation (Cursor agent) |
| **Team 100** | Architectural authority |
| **Team 90** | Validation (can perform) |
| **Team 190** | Validation (can perform) |
| **Team 170** | Documentation closure |
| **Team 51** | QA — GATE_5 equivalent (Agents_OS QA agent, Cursor) |

**Inactive in Agents_OS fast track:** Teams 20, 30, 40, 50, 60, 70 — not activated for this flow.

---

## 4) Activation modes

### 4.1 IMMEDIATE (TIKTRACK only)

1. Active normal flow enters HOLD.
2. `track_mode` switches to `FAST`.
3. Fast-track becomes active immediately.

### 4.2 NEXT (TIKTRACK only)

1. Current active work package continues to closure.
2. Fast-track is marked as next execution item in roadmap/program sequencing.
3. No additional queue field is introduced; ordering is managed by canonical program/work-package numbering and roadmap/pipeline updates.

### 4.3 AGENTS_OS default

No activation mode selection. Agents_OS WPs enter fast-track by default.

---

## 5) Runtime state model (WSM)

WSM CURRENT_OPERATIONAL_STATE must include:

1. `current_gate` (canonical gate id only).
2. `track_mode` = `NORMAL` or `FAST`.
3. `active_flow` with explicit display context (`GATE_X [NORMAL]` or `GATE_X [FAST]`).
4. `hold_reason` when one track suspends the other.

Exclusive rule:

1. If `track_mode=FAST`, normal track state must be HOLD (`hold_reason=FAST_TRACK_ACTIVE`).
2. If `track_mode=NORMAL`, fast track is not active (`IDLE` or `SCHEDULED_NEXT` only).

---

## 6) FAST stages (operational)

### 6.1 TIKTRACK (original sequence)

| Fast stage | Required action | Owner |
|---|---|---|
| FAST_0 | Define need/context/objective/execution plan | Initiating team |
| FAST_1 | Independent validation (architectural or validation team; not the planning team) | Assigned validator |
| FAST_2 | Execution by reference to canonical `GATE_3` process including G3.1..G3.9 and G3.5 validation | Team 10 orchestration |
| FAST_3 | Human check/sign-off | Human approval authority |
| FAST_4 | Knowledge promotion/closure by Team 70 (same closure principle as GATE_8) | Team 70 |

### 6.2 AGENTS_OS (extended sequence — mandatory QA)

| Fast stage | Required action | Owner |
|---|---|---|
| FAST_0 | Define need/context/objective/execution plan | Team 100 or initiating validator |
| FAST_1 | Independent validation (Team 90 or Team 190) | Team 90 / Team 190 |
| FAST_2 | Execution (implementation) | **Team 61** |
| **FAST_2.5** | **QA — GATE_5 equivalent** (pytest, mypy, quality scans; QA report) | **Team 51** |
| FAST_3 | Human check/sign-off | Human approval authority (Nimrod) |
| FAST_4 | Knowledge promotion/closure | **Team 170** |

**FAST_2.5 is mandatory.** Progression to FAST_3 is blocked until Team 51 issues QA PASS.

**Closure split lock:** For AGENTS_OS fast-track, FAST_4 documentation/governance closure is Team 170. Team 70 remains responsible for TIKTRACK documentation lane and repository maintenance operations (documentation/archive/communication hygiene).

No duplication of GATE_3 internals is allowed in fast-track docs; use canonical references only.

---

## 7) Suitability check and risk warning (TIKTRACK only)

Before activation, initiating team must evaluate suitability for fast-track.

If there is any doubt, the initiating team must issue explicit `WARNING` to Nimrod with:

1. Risk summary
2. Why normal flow may be safer
3. Expected impact of fast-track

Final decision remains with Nimrod.

**AGENTS_OS:** Suitability check not required; fast-track is default.

---

## 8) SLA lock

Fast-track maximum runtime: **48 hours**.

If SLA is exceeded, Nimrod decision is required:

1. Explicit extension, or
2. Return to normal flow.

---

## 9) Minimal artifact set (low overhead)

### TIKTRACK

1. Fast-track activation directive
2. FAST_1 validation result
3. FAST_2 execution closeout (with GATE_3 references only)
4. FAST_4 knowledge closure artifact

### AGENTS_OS

1. FAST_1 validation result
2. FAST_2 execution closeout (Team 61)
3. **FAST_2.5 QA report** (Team 51)
4. FAST_4 knowledge closure artifact (Team 170)

No additional governance layer is created.

---

## 10) Team 51 — Agents_OS QA agent

| Field | Value |
|-------|-------|
| Team ID | 51 |
| Name | Agents_OS QA Agent |
| Role | QA (GATE_5 equivalent) for agents_os_v2/ and pipeline deliverables |
| Engine | Cursor (local or cloud) |
| Scope | `agents_os_v2/`, pipeline tests, quality evidence for fast-track WPs |
| Authority | Run pytest, mypy, bandit, quality checks; produce QA report; block PASS until criteria met |

Reference: `agents_os_v2/context/identity/team_51.md`

---

## 11) Canonical references

1. `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md`
2. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`
3. `documentation/docs-governance/04-PROCEDURES/TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md`
4. `documentation/docs-governance/03-PROTOCOLS/ARCHITECT_KNOWLEDGE_PROMOTION_PROTOCOL.md`
5. `_COMMUNICATION/_Architects_Decisions/ARCHITECT_DIRECTIVE_AGENTS_OS_FAST_TRACK_DEFAULT_v1.0.0.md`

---

**log_entry | TEAM_61 | FAST_TRACK_EXECUTION_PROTOCOL | v1.1.0_AGENTS_OS_DEFAULT_ADDED | 2026-03-10**
