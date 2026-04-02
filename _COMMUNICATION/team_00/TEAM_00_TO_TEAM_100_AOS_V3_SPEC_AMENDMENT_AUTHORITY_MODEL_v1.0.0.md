---
id: TEAM_00_TO_TEAM_100_AOS_V3_SPEC_AMENDMENT_AUTHORITY_MODEL_v1.0.0
historical_record: true
from: Team 00 (Principal — Nimrod)
to: Team 100 (Chief System Architect / Chief R&D)
cc: Team 11 (AOS Gateway), Team 111 (AOS Domain Architect)
date: 2026-03-28
type: SPEC_AMENDMENT_MANDATE — authority model corrections to UI Spec + AD amendments
authority: ARCHITECT_DIRECTIVE_AUTHORITY_MODEL_v1.0.0.md
urgency: GATE_2 unblock — apply before next Team 21 review cycle---

# Team 00 → Team 100 | Spec Amendment Mandate — Authority Model

## Context

A foundational assumption error was identified in the current specs: multiple documents assume Nimrod is the primary API client and encode "team_00 only" rules as hard-coded policies. `ARCHITECT_DIRECTIVE_AUTHORITY_MODEL_v1.0.0.md` corrects this with the automation-first authority pyramid.

You are mandated to apply the following amendments to your owned spec documents.

---

## Amendment 1 — UI Spec Amendment §4.13 (GET /api/teams)

**File:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.2.md`

**Change:** Remove `is_current_actor` field from GET /api/teams response schema and all related computation.

| What | Before | After |
|------|--------|-------|
| TeamResponse field | `"is_current_actor": boolean` | **Removed entirely** |
| Handler logic | Query active run → compare actor | **Removed** |
| `domain_id` query param | Under discussion | **Not added** |

**Rationale (Team 00):** Teams page = static team management. Pipeline run state is displayed on other pages. Coupling pipeline state to team management view creates unnecessary overhead and complexity.

**Affected sections:** §4.13 TeamResponse schema, §4.13 field sourcing table, §4.13 computed fields list.

---

## Amendment 2 — UI Spec Amendment §4.18 + AD-S8A-03/04

**File:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.2.md`

### 2a — Error code replacement

| Before | After | HTTP |
|--------|-------|------|
| `NOT_PRINCIPAL` | `INSUFFICIENT_AUTHORITY` | 403 |

Replace in: §4.18 errors table, §9 error registry, any reference in ADs.

### 2b — Authorization logic for PUT /api/ideas (status field)

**Before (AD-S8A-03/04):**
> Status transitions restricted to team_00 only. Any non-team_00 caller including `status` field → whole-request rejection with `NOT_PRINCIPAL` (403).

**After:**
> Status transitions require Tier 1 or Tier 2 authority per `AUTHORITY_MODEL_v1.0.0` §2–§4:
> - `team_00` → always allowed
> - Team with active `IDEA_STATUS_AUTHORITY` role in `gate_role_authorities` → allowed
> - All others → `INSUFFICIENT_AUTHORITY` (403), whole-request rejection (behavior unchanged)
>
> Default state: no delegations active. Authority granted by team_00 explicitly via gate_role_authorities.

### 2c — AD amendments

| AD | Before | After |
|----|--------|-------|
| **AD-S8A-03** | "team_00 only" | "Tier 1 or Tier 2 authority per AUTHORITY_MODEL v1.0.0" |
| **AD-S8A-04** | "NOT_PRINCIPAL (403)" | "INSUFFICIENT_AUTHORITY (403); whole-request rejection retained" |

---

## Amendment 3 — Error Registry D.7 (WP Errata)

**File:** `_COMMUNICATION/team_00/TEAM_00_AOS_V3_BUILD_WORK_PACKAGE_ERRATA_AND_DELTA_v1.0.0.md`

**Note to Team 100:** This file is owned by Team 00. You do not need to modify it. For awareness: `NOT_PRINCIPAL` will be removed from D.7 and replaced with `INSUFFICIENT_AUTHORITY` by Team 00 in a separate errata pass.

---

## Amendment 4 — Automation-First Philosophy in UI Spec

**File:** `_COMMUNICATION/team_100/TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.2.md`

Add a new section (§0 or §1 preamble) stating the automation-first principle per `AUTHORITY_MODEL_v1.0.0` §1:

```markdown
## §0 — Operating Philosophy (AUTHORITY_MODEL v1.0.0)

AOS v3 is an automation-first orchestration system. Agents are the primary
API clients. The Dashboard is Nimrod's interface to the system — equivalent
to how agents interact via API — providing full action capability plus
monitoring-first layout.

Human intervention is scoped to: GATE_4 (permanent HITL), GATE_2 questions
(conditional HITL), Principal-only decisions, and pipeline overrides.
All other operations proceed automatically without human action.
```

---

## Delivery Requirements

| Deliverable | Acceptance |
|-------------|-----------|
| Updated UI Spec Amendment v1.0.3 (or amendment addendum) | All 4 amendments applied; AD-S8A-03/04 updated in-place with supersession note |
| No other spec content changed | Only the 4 amendments above |
| CC Team 11 when complete | Team 11 can then forward to Team 21 if GATE_2 is still open |

**Timeline:** Before next Team 21 GATE_2 review cycle. Team 21 has already received Team 00 guidance and is implementing per AUTHORITY_MODEL — your spec update is needed for their GATE_2 evidence package.

---

## What This Does NOT Change

- The state machine spec (v1.0.2) — unchanged
- The routing spec — unchanged
- The prompt arch spec — unchanged
- The event observability spec — unchanged
- GATE_4 as permanent HITL — already correct in current spec
- Dashboard action capability — UI already has buttons; philosophy framing is the only addition

---

**log_entry | TEAM_00 | SPEC_AMENDMENT | AUTHORITY_MODEL | TEAM_100_MANDATE | 2026-03-28**
