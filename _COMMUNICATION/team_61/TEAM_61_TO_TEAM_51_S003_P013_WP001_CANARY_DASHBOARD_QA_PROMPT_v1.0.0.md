---
id: TEAM_61_TO_TEAM_51_S003_P013_WP001_CANARY_DASHBOARD_QA_PROMPT_v1.0.0
historical_record: true
from: Team 61
to: Team 51 (QA Remote / AOS QA)
date: 2026-03-10
status: ACTIVATION_PROMPT
work_package: S003-P013-WP001
gate: GATE_2 (dashboard UI — pre-pipeline advance)
domain: tiktrack + agents_os (Agents OS UI)
note: Optional AOS-focused regression — primary orchestrated QA gate for this package is **Team 50** per `TEAM_61_S003_P013_WP001_CANARY_DASHBOARD_QA_ORCHESTRATION_v1.0.0.md`.---

# Canonical QA activation — Team 51 | Canary Dashboard | S003-P013-WP001

## Identity header

| Field | Value |
|-------|--------|
| roadmap_id | PHOENIX_ROADMAP |
| stage_id | S003 |
| program_id | S003-P013 |
| work_package_id | S003-P013-WP001 |
| mandate_ref | TEAM_61_S003_P013_CANARY_DASHBOARD_MANDATE_v1.0.0 |
| verdict | TEAM_61_S003_P013_CANARY_DASHBOARD_VERDICT_v1.0.0.md |

---

## Scope

Functional / regression validation of **Agents OS Pipeline Dashboard** changes (Team 61) for **phase-level actor display**, **GATE_2 stepper**, and **lod200_author_team** resolution in sidebar and Gate Context.

---

## Preconditions

- Repo path: local Phoenix workspace with latest `main` (or branch under test).
- Serve dashboard: open `agents_os/ui/PIPELINE_DASHBOARD.html` via your usual static server (or `scripts` used by Team 61).
- State files: `_COMMUNICATION/agents_os/pipeline_state_tiktrack.json` (canary: GATE_2, phase 2.2) and `pipeline_state_agentsos.json` for domain switch tests.

---

## Test matrix (required)

| # | Check | Expected |
|---|--------|----------|
| 1 | TikTrack domain, GATE_2 + `current_phase` 2.2 | Banner shows **Phase 2.2** and **→ Team 10 (Work Plan)** (or agents_os equivalent for phase 2.2 → Team 11) |
| 2 | Same as #1 | **GATE_2 stepper** visible; **Phase 2.2** step visually active (success border/color) |
| 3 | Switch to agents_os domain, GATE_2 + phase 2.2 if state allows | Phase actor reflects **Team 11 (Work Plan)** for AOS |
| 4 | State with `current_phase` empty / null | No **csb-phase-actor** line; no GATE_2 stepper (non–GATE_2 or no phase) per mandate |
| 5 | Non–GATE_2 gate in state | No GATE_2 stepper |
| 6 | Sidebar **Owner** + Gate Context **Owner** | If routing ever surfaces `lod200_author_team` as raw owner key, UI shows resolved team + `(lod200_author_team → team_XXX)`; **never** raw sentinel alone |
| 7 | **Expected Team (Phase)** panel | Shows resolved team id (e.g. `team_102`), not literal `lod200_author_team` when phase uses that sentinel |
| 8 | Regression | Feedback Detection panel, bypass panel, mandates accordion still load without console errors |

---

## Evidence

- Capture: short note + optional screenshots for #1–2 and #6–7.
- File QA report under `_COMMUNICATION/team_51/` with naming convention `TEAM_51_S003_P013_WP001_*_QA_REPORT_v1.0.0.md` (or team convention).

---

## Next action

- **PASS** → notify Team 90 per review prompt; Team 100 evidence prompt for program continuation.
- **FAIL** → file findings with repro + state snippet; route to Team 61.

---

**log_entry | TEAM_61 | TO_TEAM_51 | S003_P013_CANARY_DASHBOARD_QA | 2026-03-10**
