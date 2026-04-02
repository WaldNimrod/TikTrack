---
id: ARCHITECT_DIRECTIVE_AUTHORITY_MODEL_v1.0.0
historical_record: true
issued_by: Team 00 (Principal — Nimrod)
date: 2026-03-28
status: LOCKED — effective immediately
supersedes: AD-S8A-03, AD-S8A-04 (partial — see §6)
applies_to: ALL teams, ALL domains, ALL pipeline stages---

# ARCHITECT DIRECTIVE — Authority Model v1.0.0

## §1 — Purpose and Trigger

This directive corrects a foundational assumption error in prior specs.

**Prior assumption (wrong):** Nimrod is the primary client of the AOS v3 API. The system is HITL-first. Human approval is the norm.

**Corrected model:** AOS v3 is an **automation-first orchestration system**. Agents are the primary clients of the API. Human involvement is the **exception**, not the norm — scoped to product vision, constitutional decisions, and specific locked gates.

> "AOS בסוף צריך להיות בית תוכנה אופטימאלי מהיר ואוטומטי עם פיקוח אנושי לא דשבורד עם אין סוף לחיצות." — Team 00, 2026-03-28

All specs and implementations must reflect this principle immediately.

---

## §2 — The 3-Tier Authority Pyramid

```
┌─────────────────────────────────────────────────┐
│  TIER 1 — PRINCIPAL (team_00 / Nimrod)          │
│  Locked decisions. Cannot be delegated away.    │
│  (7 categories — see §3)                        │
├─────────────────────────────────────────────────┤
│  TIER 2 — DELEGATED AUTHORITY                   │
│  Granted explicitly by team_00 via              │
│  gate_role_authorities table.                   │
│  Default: empty (no delegation active).         │
├─────────────────────────────────────────────────┤
│  TIER 3 — GATE AUTHORITY (role-based)           │
│  Pipeline role assignments via routing +        │
│  gate_role_authorities. Standard agent work.    │
├─────────────────────────────────────────────────┤
│  TIER 4 — ANY AUTHENTICATED AGENT               │
│  Submissions, reads, participation.             │
│  No special authority required.                 │
└─────────────────────────────────────────────────┘
```

**Enforcement mechanism:** `gate_role_authorities` table (DDL v1.0.2). This table is the single source for authority checks beyond Tier 4. Hard-coded `team_00 only` rules in application code are **prohibited** except where this directive explicitly names them (§3).

---

## §3 — Principal-Only Category (Tier 1 — Locked List)

The following decisions belong **exclusively to team_00** and cannot be delegated:

| # | Decision | Mechanism |
|---|---|---|
| 1 | Modifying Iron Rules / system constitution | Direct file edit + directive |
| 2 | Changing `is_human_gate` on any gate | Admin API or direct DB — team_00 only |
| 3 | Pipeline override when no agent can resolve | Manual advance/fail via Dashboard or CLI |
| 4 | Product vision decisions (what to build / not build) | Team 00 session |
| 5 | **GATE_4 UX sign-off** — always HITL, always team_00 | `is_human_gate = 1`; permanent |
| 6 | **GATE_2 architectural questions** — if architect has open questions, must surface to Nimrod before PASS | Team 100 PAUSED → Nimrod answers → resume |
| 7 | **Idea status changes (directly)** | team_00 always; OR delegation via §4 |

**No other decision category is Principal-only by default.**

---

## §4 — Delegation Model (Tier 2)

Team_00 may grant Tier 2 authority by inserting a row into `gate_role_authorities`:

```sql
-- Example: grant architectural teams idea status authority
INSERT INTO gate_role_authorities (id, gate_id, domain_id, role_id, may_block_verdict, created_at)
VALUES (ulid(), 'GATE_2', NULL, 'IDEA_STATUS_AUTHORITY', 0, NOW());

INSERT INTO assignments (work_package_id, domain_id, role_id, team_id, assigned_by, ...)
VALUES (..., 'IDEA_STATUS_AUTHORITY', 'team_100', 'team_00', ...);
```

**Default state:** No delegations active. `gate_role_authorities` seeded empty for Tier 2 roles.

**Who can grant:** team_00 only. No self-delegation.

**Current known delegations (none locked yet):** Architectural teams (team_100, team_110, team_111) may receive idea status authority with explicit team_00 instruction per session. Not standing grants.

---

## §5 — GATE Behavior Model

### GATE_4 — Permanent HITL

- `is_human_gate = 1` — always
- Nimrod reviews and approves UX/vision sign-off
- **Future:** a pipeline variant (e.g., `TRACK_FAST` or dedicated variant) may skip GATE_4 for specific work package types. Until that variant is built and activated, GATE_4 = mandatory human gate for all runs.

### GATE_2 — Conditional HITL

- `is_human_gate = 0` — not a mandatory human gate
- **Normal flow:** Team 100 reviews → no open questions → PASS automatically. No human action required.
- **Question flow:** Team 100 has open questions requiring product/requirements clarification → sets run to `PAUSED` with `PENDING_REVIEW` verdict → questions surfaced in Dashboard → Nimrod answers → Team 100 resumes → PASS or FAIL
- **Mechanism:** Existing PAUSED state + FIP `PENDING_REVIEW`. No schema changes needed.
- **Iron Rule:** Team 100 is **obligated** to surface questions before passing GATE_2 if any exist. Silent PASS with unresolved architectural questions is a violation.

### All other gates

- `is_human_gate = 0` — automated by default
- Human can intervene via Dashboard or CLI at any time (Tier 1 override)
- Automation-first: system advances/fails without human input where possible

---

## §6 — Superseded Rules

### AD-S8A-03 (SUPERSEDED — partial)

**Prior rule:** Ideas pipeline status transitions restricted to team_00 only.

**Replacement:** Ideas status transitions require Tier 1 or Tier 2 authority:
- `team_00` → always allowed
- Any team with active `IDEA_STATUS_AUTHORITY` role in `gate_role_authorities` → allowed
- All others → `INSUFFICIENT_AUTHORITY` (403)

### AD-S8A-04 (SUPERSEDED — partial)

**Prior rule:** `NOT_PRINCIPAL` (403) for unauthorized status transitions.

**Replacement:** Error code `INSUFFICIENT_AUTHORITY` (403). Rationale: `NOT_PRINCIPAL` incorrectly implies human-only authority. The system supports agent-held authority via gate_role_authorities.

**Behavior unchanged:** Whole-request rejection. If caller lacks authority and request includes `status` field → entire request rejected, no partial application.

---

## §7 — Dashboard Philosophy (Locked)

The Dashboard is **Nimrod's interface to the system** — equivalent to how agents interact via API. It provides:

1. **Full action capability** — every API operation is accessible via Dashboard
2. **Monitoring-first layout** — primary view is system state, not action queue
3. **Human gate alerts** — GATE_4 + GATE_2 questions are surfaced prominently
4. **Direct trigger capability** — Nimrod can fire any pipeline action directly

**What Dashboard is NOT:** A required intermediary. Most pipeline operations occur **directly** between agents. Dashboard intervention is the exception.

**Design implication:** Advance/Fail/Approve buttons exist but are secondary UI. The primary Dashboard content is observability — what is the system doing, where is it, what decisions have been made.

---

## §8 — Error Code Amendment

| Old code | New code | HTTP | Scope |
|---|---|---|---|
| `NOT_PRINCIPAL` | `INSUFFICIENT_AUTHORITY` | 403 | Any operation requiring Tier 1 or Tier 2 authority |

`NOT_PRINCIPAL` is **removed** from all error registries. All prior references to `NOT_PRINCIPAL` in specs translate to `INSUFFICIENT_AUTHORITY`.

---

## §9 — Implementation Requirements (GATE_2 scope)

All GATE_2 deliverables must comply with this directive:

1. **Ideas status check** — implement as `check_authority(caller, 'IDEA_STATUS_AUTHORITY')` function; checks `team_00` OR `gate_role_authorities` row
2. **Error code** — `INSUFFICIENT_AUTHORITY` throughout; `NOT_PRINCIPAL` must not appear in new code
3. **No hard-coded team lists** — authority always resolved via pyramid; never `if team_id in ['team_00', 'team_100']` in production logic
4. **Governance files** — real governance files required per team participating in GATE_2 test scenarios (not mocks); minimum: team_00, team_10, team_11

---

## §10 — What This Directive Does NOT Change

- Iron Rules on data precision (NUMERIC(20,8), etc.)
- Gate sequence (GATE_0..GATE_5)
- Append-only events table
- The routing model (gate_role_authorities already powers this correctly)
- Work package / run lifecycle

---

**log_entry | TEAM_00 | AUTHORITY_MODEL | v1.0.0 | LOCKED | 2026-03-28**
**log_entry | TEAM_00 | SUPERSEDES | AD-S8A-03 (partial), AD-S8A-04 (partial) | 2026-03-28**
