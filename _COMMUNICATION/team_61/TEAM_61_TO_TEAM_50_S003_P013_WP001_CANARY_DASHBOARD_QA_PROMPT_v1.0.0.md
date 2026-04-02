---
id: TEAM_61_TO_TEAM_50_S003_P013_WP001_CANARY_DASHBOARD_QA_PROMPT_v1.0.0
historical_record: true
from: Team 61
to: Team 50 (QA and Fidelity — TikTrack product QA)
cc: Team 10 (Gateway), Team 100
date: 2026-03-11
status: ACTIVATION_PROMPT
work_package: S003-P013-WP001
gate: GATE_2 (dashboard UI — Agents OS pipeline dashboard; TikTrack canary state)
domain: tiktrack (primary) + agents_os UI surface
sequence: ORCHESTRATION_CIRCLE_1_OF_3---

# Canonical QA activation — Team 50 | Canary Dashboard | S003-P013-WP001

## Identity header

| Field | Value |
|-------|--------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P013 |
| work_package_id | S003-P013-WP001 |
| mandate_ref | TEAM_61_S003_P013_CANARY_DASHBOARD_MANDATE_v1.0.0 |
| team_61_verdict | TEAM_61_S003_P013_CANARY_DASHBOARD_VERDICT_v1.0.0.md |
| orchestration | TEAM_61_S003_P013_WP001_CANARY_DASHBOARD_QA_ORCHESTRATION_v1.0.0.md |

---

## Scope

Functional / regression validation of **Agents OS Pipeline Dashboard** (`agents_os/ui/`) for the **TikTrack canary** path and cross-domain checks, focusing on:

- Phase-level actor in **Current Step Banner** (`csb-phase-actor`)
- **GATE_2** horizontal stepper (phases 2.2 → 2.2v → 2.3)
- Resolution of **`lod200_author_team`** in sidebar, Gate Context, and **Expected Team (Phase)**

---

## Preconditions

- Phoenix repo at known commit / branch under test.
- Serve dashboard: `agents_os/ui/PIPELINE_DASHBOARD.html` (e.g. `agents_os/scripts/start_ui_server.sh` or project static server).
- State SSOT: `_COMMUNICATION/agents_os/pipeline_state_tiktrack.json` — expect **GATE_2**, **current_phase** `2.2`, **project_domain** `tiktrack` for primary scenario (adjust if state file differs; document actual values in report).

---

## Test matrix (required)

| # | Check | Expected |
|---|--------|----------|
| 1 | TikTrack domain, GATE_2 + phase 2.2 | Banner shows **Phase 2.2** and **→ Team 10 (Work Plan)** |
| 2 | Same | **GATE_2 stepper** visible; **Phase 2.2** step visually active (success border/color) |
| 3 | Optional: agents_os domain if state supports GATE_2 + 2.2 | Phase actor **Team 11 (Work Plan)** for AOS |
| 4 | `current_phase` null / empty (test state or mock) | No `csb-phase-actor`; no GATE_2 stepper when rules say so |
| 5 | Non–GATE_2 gate in state | No GATE_2 stepper |
| 6 | Sidebar **Owner** + Gate Context **Owner** | Never raw `lod200_author_team` alone; if sentinel applies, format `team_XXX (lod200_author_team → team_XXX)` |
| 7 | **Expected Team (Phase)** | Resolved id (e.g. `team_102`), not literal sentinel string |
| 8 | Regression | Feedback Detection, bypass, mandates accordion load; no critical console errors |

---

## Evidence (Team 50)

- Save report under **`_COMMUNICATION/team_50/`**, e.g.  
  `TEAM_50_S003_P013_WP001_CANARY_DASHBOARD_QA_REPORT_v1.0.0.md`
- Include: verdict line **QA_PASS** or **QA_FAIL**, matrix table results, notes, optional screenshots.

---

## Next action (orchestrated)

- **QA_PASS** → Team 61 activates **Team 90** via  
  `TEAM_61_TO_TEAM_90_S003_P013_WP001_CANARY_DASHBOARD_REVIEW_PROMPT_v1.0.1.md` (cite this report path).
- **QA_FAIL** → findings + repro to **Team 61**; Team 61 fixes and may re-issue this prompt for re-test until **PASS**.

---

**log_entry | TEAM_61 | TO_TEAM_50 | S003_P013_CANARY_DASHBOARD_QA | CIRCLE_1 | 2026-03-11**
