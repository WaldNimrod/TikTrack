---
id: TEAM_190_TO_TEAM_100_TEAM_00_IDEA_052_ANNEX_D_AUDIT_MODEL_AND_EVENT_TAXONOMY_v1.0.0
historical_record: true
from: Team 190
to: Team 100
cc: Team 00, Team 101, Team 170, Team 61, Team 90
date: 2026-03-22
status: ATTACHED_TO_IDEA_052
idea_id: IDEA-052
type: ANNEX
subject: Audit model proposal and critical event taxonomy---

# Annex D — Audit Model and Event Taxonomy

## D.1 Audit model options

| Level | Model | Integrity strength | Operational complexity |
|---|---|---|---|
| L1 | Append-only only | Low | Low |
| L2 | Append-only + hash-chain | Medium | Medium |
| L3 | Hash-chain + signatures (critical events) | High | Medium-High |

**Recommendation:** Launch on L2 minimum; target L3 for critical event classes.

## D.2 Critical event classes (must be immutable + verifiable)

1. Gate pass/fail transitions
2. Work package activation/closure
3. Team assignment changes
4. Routing/process variant changes
5. Registry operational field changes
6. Audit policy changes

## D.3 Event taxonomy baseline

| event_type | required fields |
|---|---|
| `GATE_PASS` | domain_id, work_package_id, gate_id, actor_team_id, occurred_at |
| `GATE_FAIL` | domain_id, work_package_id, gate_id, actor_team_id, findings_ref, occurred_at |
| `STATE_MIGRATION` | domain_id, work_package_id, old_state_hash, new_state_hash, occurred_at |
| `TEAM_ASSIGNMENT_CHANGED` | domain_id, work_package_id/null, role_id, old_team_id, new_team_id |
| `REGISTRY_UPDATE` | registry_type, object_id, change_set_hash, actor_team_id |
| `AUDIT_POLICY_CHANGED` | policy_id, old_hash, new_hash, approver_team_id |

## D.4 Verification checks

1. Chain continuity (`prev_hash` linkage).
2. Hash recomputation equality.
3. Signature verification for signed events.
4. No update/delete on immutable event rows.

---

**log_entry | TEAM_190 | IDEA_052_ANNEX_D | AUDIT_TAXONOMY_COMPLETE | v1.0.0 | 2026-03-22**
