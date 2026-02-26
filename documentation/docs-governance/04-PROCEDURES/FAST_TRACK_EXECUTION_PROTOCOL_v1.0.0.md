# FAST_TRACK_EXECUTION_PROTOCOL_v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** FAST_TRACK_EXECUTION_PROTOCOL_v1.0.0  
**owner:** Team 190 (constitutional lock), executed via Team 10 Gateway  
**date:** 2026-02-26  
**status:** LOCKED_OPTIONAL (not default flow)  
**canonical_basis:** 04_GATE_MODEL_PROTOCOL_v2.3.0, PHOENIX_MASTER_WSM_v1.0.0

---

## 1) Purpose and boundary

This protocol defines a **non-default fast-track option** for urgent, small, blocking items that arise during active development.

Fast-track does not replace the canonical gate model.

1. `gate_id` remains canonical (`GATE_0..GATE_8` only).
2. Fast-track status is represented by `track_mode` in WSM state.
3. Only one track can be active at a time (exclusive activation).

---

## 2) Activation authority (locked)

Fast-track can be declared only by Nimrod with one of the following:

1. Architectural team (Team 100 / Team 00), or
2. Validation team (Team 190 / Team 90 as applicable by scope).

The initiating team owns the process end-to-end once activated.

---

## 3) Activation modes

### 3.1 IMMEDIATE

1. Active normal flow enters HOLD.
2. `track_mode` switches to `FAST`.
3. Fast-track becomes active immediately.

### 3.2 NEXT

1. Current active work package continues to closure.
2. Fast-track is marked as next execution item in roadmap/program sequencing.
3. No additional queue field is introduced; ordering is managed by canonical program/work-package numbering and roadmap/pipeline updates.

---

## 4) Runtime state model (WSM)

WSM CURRENT_OPERATIONAL_STATE must include:

1. `current_gate` (canonical gate id only).
2. `track_mode` = `NORMAL` or `FAST`.
3. `active_flow` with explicit display context (`GATE_X [NORMAL]` or `GATE_X [FAST]`).
4. `hold_reason` when one track suspends the other.

Exclusive rule:

1. If `track_mode=FAST`, normal track state must be HOLD (`hold_reason=FAST_TRACK_ACTIVE`).
2. If `track_mode=NORMAL`, fast track is not active (`IDLE` or `SCHEDULED_NEXT` only).

---

## 5) FAST stages (operational)

| Fast stage | Required action | Owner |
|---|---|---|
| FAST_0 | Define need/context/objective/execution plan | Initiating team |
| FAST_1 | Independent validation (architectural or validation team; not the planning team) | Assigned validator |
| FAST_2 | Execution by reference to canonical `GATE_3` process including G3.1..G3.9 and G3.5 validation | Team 10 orchestration |
| FAST_3 | Human check/sign-off | Human approval authority |
| FAST_4 | Knowledge promotion/closure by Team 70 (same closure principle as GATE_8) | Team 70 |

No duplication of GATE_3 internals is allowed in fast-track docs; use canonical references only.

---

## 6) Suitability check and risk warning

Before activation, initiating team must evaluate suitability for fast-track.

If there is any doubt, the initiating team must issue explicit `WARNING` to Nimrod with:

1. Risk summary
2. Why normal flow may be safer
3. Expected impact of fast-track

Final decision remains with Nimrod.

---

## 7) SLA lock

Fast-track maximum runtime: **48 hours**.

If SLA is exceeded, Nimrod decision is required:

1. Explicit extension, or
2. Return to normal flow.

---

## 8) Minimal artifact set (low overhead)

1. Fast-track activation directive
2. FAST_1 validation result
3. FAST_2 execution closeout (with GATE_3 references only)
4. FAST_4 knowledge closure artifact

No additional governance layer is created.

---

## 9) Canonical references

1. `documentation/docs-governance/01-FOUNDATIONS/04_GATE_MODEL_PROTOCOL_v2.3.0.md`
2. `documentation/docs-governance/01-FOUNDATIONS/PHOENIX_MASTER_WSM_v1.0.0.md`
3. `documentation/docs-governance/04-PROCEDURES/TEAM_10_GATE_ACTIONS_RUNBOOK_v1.0.0.md`
4. `documentation/docs-governance/03-PROTOCOLS/ARCHITECT_KNOWLEDGE_PROMOTION_PROTOCOL.md`

---

**log_entry | TEAM_190 | FAST_TRACK_EXECUTION_PROTOCOL | v1.0.0_LOCKED_OPTIONAL | 2026-02-26**
