---
directive_id:  ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v2.0.0
author:        Team 00 — Chief Architect
date:          2026-03-15
status:        LOCKED — Iron Rule
authority:     Team 00 constitutional authority + Nimrod confirmation
supersedes:    ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v1.0.0 (Team 10 row only)
reason:        Process-Functional Separation directive (ARCHITECT_DIRECTIVE_PROCESS_FUNCTIONAL_SEPARATION_v1.0.0)
               requires Team 10 redefinition across three operating modes
---

# ARCHITECT DIRECTIVE — Team Roster Lock v2.0.0

## What Changed from v1.0.0

**One change only:** Team 10 definition updated to reflect three operating modes.
All other team definitions from v1.0.0 remain in force unchanged.

---

## CANONICAL TEAM ROSTER — LOCKED (v2.0.0)

| Squad ID | Role | Responsibility | Mode Notes |
|---|---|---|---|
| **Team 10** | Implementation Authority | Technical work planning (GATE_3), build oversight (GATE_4), Team 61 activation, technical architecture decisions for complex builds | See §Team 10 detail below |
| **Team 20** | Backend Implementation | API, logic, DB, services, runtime | Server-side only |
| **Team 30** | Frontend Execution | Components, pages, API integration, client-side logic | Client-side only |
| **Team 40** | UI Assets & Design | Design tokens, CSS, visual consistency, UI assets | Advisory in most WPs unless new design assets needed |
| **Team 50** | QA & FAV | Test scripts, E2E suites, regression, FAV, SOP-013 seals — outputs structured verdicts only | ALL quality assurance and acceptance validation |
| **Team 60** | DevOps & Platform | Infrastructure, runtimes, CI/CD, platform readiness, runtime evidence | |
| **Team 70** | Documentation | Technical writing, knowledge promotion | |
| **Team 90** | Validation | GATE_6–GATE_8 review and sign-off — outputs structured verdicts only | See Process-Functional Separation directive |
| **Team 100** | Architectural Review | Stage-level architectural decisions, GATE_2 + GATE_6 approval authority | Delegated from Team 00 for AOS domain |
| **Team 170** | Spec & Governance | Canonical document maintenance, LOD200/LOD400 production, registry sync, agent context files | |
| **Team 190** | Constitutional Validation | Architectural integrity review, GATE_0–GATE_2 + GATE_5 — outputs structured verdicts only | See Process-Functional Separation directive |

---

## Team 10 — Full Mode-Aware Definition

### Permanent Core (all modes)
**Technical Implementation Authority** — Team 10's lasting value is architectural depth for implementation decisions. Team 10 knows *how* to build things correctly and safely. This function does not change across modes.

### Mode 1 — Legacy (no AOS pipeline)
**Role: Process Coordinator + Implementation Authority**

Team 10 additionally acts as the operational coordinator in the absence of automated routing:
- Receives all verdicts (PASS/FAIL/BLOCK) from functional teams (190, 50, 90)
- Routes to next team per canonical routing table (`TEAM_10_MODE1_ROUTING_TABLE_v1.0.0.md`)
- Routing is deterministic — no discretion; routing table governs all cases
- Activates next team, manages WSM updates
- **Nimrod retains final authority; Team 10 coordinates operationally**

### Mode 2 — Semi-Automatic (AOS + Dashboard)
**Role: Implementation Technical Authority (process routing removed)**

- Executes GATE_3: technical work plan for the work package
- Executes GATE_4: build oversight, activates Team 61, validates completion
- Technical escalation point for Teams 20/30/61 on complex build decisions
- Does NOT route between gates (pipeline engine routes)
- Does NOT manage gate submissions (pipeline_run.sh manages)
- Does NOT issue `owner_next_action` to other teams

### Mode 3 — Fully Automatic AOS
**Role: Technical Consultation Authority (on-demand)**

- Available for complex/risky builds requiring human architectural judgment
- Escalation path when automated pipeline delegates a technically ambiguous decision
- NOT a standing operational role — activated only when pipeline escalates
- The pipeline engine fully replaces Team 10's Mode 1 process coordination function

### Key Principle
> Team 10's process coordination role (Mode 1) is a **mode-specific adaptation**, not a permanent identity.
> Team 10's technical architecture role is permanent across all modes.

---

## IRON RULES (updated from v1.0.0)

1. **Team 50 = QA.** This includes: test scripts, E2E suites, regression, FAV, and SOP-013 seals.
2. **Team 40 = UI Assets.** This does NOT include QA, testing, or validation.
3. FAV (Final Acceptance Validation) is a QA activity → executed by **Team 50**.
4. GATE_4 QA evidence is produced by **Team 50**, submitted via Team 10.
5. Any document that routes "QA" to Team 40 is WRONG and must be corrected.
6. **Team 190, Team 50, Team 90 output structured verdicts ONLY.** No routing instructions. No `owner_next_action`. See `ARCHITECT_DIRECTIVE_PROCESS_FUNCTIONAL_SEPARATION_v1.0.0.md`.
7. **Team 10 in Mode 2+: does NOT manage process routing.** Pipeline engine routes. Team 10 executes GATE_3 and GATE_4 technically.
8. When in doubt: this directive (v2.0.0) overrides all other team references.

---

## Unchanged from v1.0.0

The following remain exactly as defined in v1.0.0:
- Teams 20, 30, 40, 50, 60, 70, 90, 100, 170, 190 definitions (except output format note added to 50, 90, 190)
- Iron Rules 1–5 (Rule 6–8 are new additions)
- Required action to Team 170 for `TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md` update

---

## Required Actions

| Team | Action |
|---|---|
| Team 170 | Update `TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md` with this v2.0.0 Team 10 definition |
| Team 170 | Author `TEAM_10_MODE1_ROUTING_TABLE_v1.0.0.md` (deterministic routing for legacy mode) |
| Team 170 | Update all agent activation prompts to reflect new Team 10 role per mode |
| Team 30 | Update `PIPELINE_TEAMS.html` dashboard page with new team definitions |

---

*log_entry | TEAM_00 | TEAM_ROSTER_LOCK_v2.0.0 | TEAM_10_REDEFINED_PROCESS_FUNCTIONAL_SEPARATION | LOCKED | 2026-03-15*
