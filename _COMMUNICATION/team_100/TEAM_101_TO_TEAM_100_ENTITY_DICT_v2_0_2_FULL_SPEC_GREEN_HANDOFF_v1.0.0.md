---
id: TEAM_101_TO_TEAM_100_ENTITY_DICT_v2_0_2_FULL_SPEC_GREEN_HANDOFF_v1.0.0
historical_record: true
from: Team 101
to: Team 100
cc: Team 190, Team 00
date: 2026-03-26
status: SUBMITTED
purpose: Handoff only after zero open specification items (per program rule)---

# Entity Dictionary v2.0.2 — full green handoff to Team 100

## Requirement met

כל סעיפי **OPEN** / **MINOR (m1–m3)** מהדוח `TEAM_190_AOS_V3_STAGE1B_ENTITY_DICT_REVIEW_v1.0.1.md` נסגרו במסמך ה־SSOT — **ללא** דחייה ל־MERGED.

## SSOT

`_COMMUNICATION/team_101/TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.2.md`

- **L1:** cutover קשיח ל־`resolve_from_state_key` (תאריך UTC + תג `aos-v3.0.0` ל־PROD).  
- **L2:** dual-model (`can_block_gate` + `gate_role_authorities`) נעול ל־v3.0–v3.1.  
- **L3:** composite FK `routing_rules(gate_id, phase_id) → phases(gate_id, id)` (+ מקביל ל־`gate_role_authorities` כש־`phase_id` לא NULL).  
- **L4:** אין טבלת `programs` ב־v3.0–v3.1; `work_package_id` TEXT + ולידטור בלבד.

## Superseded

`TEAM_101_AOS_V3_ENTITY_DICTIONARY_v2.0.1.md` — stub מצביע ל־v2.0.2 בלבד.

---

**log_entry | TEAM_101 | ENTITY_DICT_v2.0.2 | FULL_GREEN_HANDOFF_TEAM_100 | 2026-03-26**
