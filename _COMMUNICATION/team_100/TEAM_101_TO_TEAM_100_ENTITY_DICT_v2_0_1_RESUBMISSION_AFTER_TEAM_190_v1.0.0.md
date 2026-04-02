---
id: TEAM_101_TO_TEAM_100_ENTITY_DICT_v2_0_1_RESUBMISSION_AFTER_TEAM_190_v1.0.0
historical_record: true
from: Team 101
to: Team 100, Team 190
date: 2026-03-26
status: SUBMITTED---

# Entity Dictionary v2.0.1 — resubmission after Team 190 CONDITIONAL_PASS

## Source review

- `_COMMUNICATION/team_190/TEAM_190_AOS_V3_STAGE1B_ENTITY_DICT_REVIEW_v1.0.0.md`  
- **Verdict:** `CONDITIONAL_PASS` — **MAJOR=3**, BLOCKER=0  
- **Requirement:** publish **v2.0.1** before Stage 2 (no broad architecture change beyond Stage 1b).

## Deliverable (historical)

**v2.0.1** — `_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.1.md` — כעת **stub superseded**.

**SSOT for Team 100:** **`_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md`** — כל הפריטים שהיו פתוחים ל־MERGED ננעלו (L1–L4).

## Remediation mapping

| Team 190 | Addressed in v2.0.1 |
|----------|---------------------|
| **M1** PAUSED / resolver | `paused_routing_snapshot_json`; Run invariants 7–9; Assignment inv. 5; resolver priority in RoutingRule Notes |
| **M2** `resolve_from_state_key` | Staged DEPRECATION (spec → Stage 2 → Stage 3+ → Stage 4); explicit resolver order; fail-closed when Assignment missing |
| **M3** `can_block_gate` scope | New entity **`GateRoleAuthority`** (`gate_role_authorities`); PipelineRole inv. 3 |
| **m1** `operating_mode` | Team inv. 4 (GATE eligibility) |
| **m2** SUPERSEDE / Event | Event inv. 4 + `TEAM_ASSIGNMENT_CHANGED` payload contract in Notes; `RUN_PAUSED` in enum |
| **m3** `work_package_id` | Registry logical validator + Stage 4 FK target called out on Assignment + Event |

## Closure (v2.0.2)

אין פריטים פתוחים לפני החזרה ל־Team 100 — ראו טבלת **נעילות v2.0.2** במילון (L1–L4).

---

**log_entry | TEAM_101 | ENTITY_DICT_v2.0.1 | RESUBMIT_TEAM_190_REMEDIATION | 2026-03-26**  
**log_entry | TEAM_101 | ENTITY_DICT | SUPERSEDED_TO_v2.0.2 | ZERO_OPEN | 2026-03-26**
