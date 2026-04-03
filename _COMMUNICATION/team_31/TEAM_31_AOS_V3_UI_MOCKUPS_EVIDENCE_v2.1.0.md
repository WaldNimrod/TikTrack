---
id: TEAM_31_AOS_V3_UI_MOCKUPS_EVIDENCE_v2.1.0
historical_record: true
team: Team 31
date: 2026-03-28
type: EVIDENCE
domain: agents_os
mandate_ref:
  - TEAM_00_TO_TEAM_31_AOS_V3_MOCKUP_AUTHORITY_MODEL_UPDATE_MANDATE_v1.0.0
  - TEAM_100_TO_TEAM_31_AOS_V3_UI_IS_CURRENT_ACTOR_REMOVAL_MANDATE_v1.0.0
spec_basis: TEAM_100_AOS_V3_UI_SPEC_AMENDMENT_v1.0.3 §4.13 (AM-01)
prior_evidence: TEAM_31_AOS_V3_UI_MOCKUPS_EVIDENCE_v2.0.0
status: MOCKUP_PATCH_DELIVERED---

# Team 31 — AOS v3 UI mockups — evidence v2.1.0 (Authority / `is_current_actor` removal)

## Summary

יישור מוקאפ ל־`TeamResponse` ללא `is_current_actor`; שימוש ב־`has_active_assignment` בלבד לפי מנדט Team 100. Checkbox ב־Teams נשאר עם **label מעודכן** (מסלול Team 100 / Principal); טקסט מנדט Team 00 שביקש הסרת checkbox — **חריגה מתועדת** לטובת מנדט Team 100 + GATE_4.

## AC-01 — `is_current_actor` absent from UI tree

| Check | Result |
|-------|--------|
| Search `is_current_actor` under `agents_os_v3/ui/` | **0 matches** (workspace grep) |
| `node --check agents_os_v3/ui/app.js` | Exit 0 |
| `bash agents_os_v3/ui/run_preflight.sh` | All five pages HTTP **200** |

## Code changes

| File | Change |
|------|--------|
| `agents_os_v3/ui/app.js` | `MOCK_TEAMS`: removed `is_current_actor` from all 12 teams; `buildTeamL3` → `Assignment: Active` / `None` via `has_active_assignment`; `filterTeam` → checkbox filters `has_active_assignment`; `renderDetail` → removed duplicate `is_current_actor` row (kept `has_active_assignment`); roster ★ from `has_active_assignment`; assembled prompt mock text updated; `buildTeamL4` default string neutralized |
| `agents_os_v3/ui/teams.html` | Label **Active assignment only** + `aria-label` on checkbox; identity header patch note |

## Schema alignment (§4.13)

Mock team objects match canonical fields including `has_active_assignment` only — no `is_current_actor`.

## Seal

SOP-013 closure: [TEAM_31_SEAL_AOS_V3_MOCKUP_AM01_IS_CURRENT_ACTOR_v1.0.0.md](TEAM_31_SEAL_AOS_V3_MOCKUP_AM01_IS_CURRENT_ACTOR_v1.0.0.md)

**log_entry | TEAM_31 | AOS_V3_UI_MOCKUPS | EVIDENCE_v2.1.0 | 2026-03-28**
