---
directive_id:  ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v3.0.0
author:        Team 00 — Chief Architect
date:          2026-03-15
status:        LOCKED — Iron Rule
authority:     Team 00 constitutional authority
supersedes:    ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v2.0.0 (Team 31 row added)
reason:        Team 31 (Blueprint Maker) was fully characterized (activation prompt + pipeline-teams.js + handoff package received)
               but was NEVER registered in the canonical roster lock (v1 or v2 oversight).
               IDEA-020 triggered this correction.
---

# ARCHITECT DIRECTIVE — Team Roster Lock v3.0.0

## What Changed from v2.0.0

**One change only:** Team 31 (Blueprint Maker) row added to canonical roster table.
All other team definitions from v2.0.0 remain in force unchanged.

> Note: Teams 51 and 61 are also absent from v1/v2 and require a separate characterization check.
> IDEA-020 covers this follow-up. v3 addresses only Team 31 (fully characterized).

---

## CANONICAL TEAM ROSTER — LOCKED (v3.0.0)

| Squad ID | Role | Responsibility | Mode Notes |
|---|---|---|---|
| **Team 10** | Implementation Authority | Technical work planning (GATE_3), build oversight (GATE_4), Team 61 activation, technical architecture decisions for complex builds | See ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v2.0.0 §Team 10 detail |
| **Team 20** | Backend Implementation | API, logic, DB, services, runtime | Server-side only |
| **Team 30** | Frontend Execution | Components, pages, API integration, client-side logic | Client-side only |
| **Team 31** | Blueprint Maker | Visual Blueprint production (HTML/CSS static only) — structural design templates for TikTrack pages and modules; delivers to Teams 30/40 via Team 10 Gateway | Outside main gate pipeline; sandbox at `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/`; activation prompt: `TEAM_00_TO_TEAM_31_ACTIVATION_PROMPT_v1.0.0.md` |
| **Team 40** | UI Assets & Design | Design tokens, CSS, visual consistency, UI assets | Advisory in most WPs unless new design assets needed |
| **Team 50** | QA & FAV | Test scripts, E2E suites, regression, FAV, SOP-013 seals — outputs structured verdicts only | ALL quality assurance and acceptance validation |
| **Team 60** | DevOps & Platform | Infrastructure, runtimes, CI/CD, platform readiness, runtime evidence | |
| **Team 70** | Documentation | Technical writing, knowledge promotion | |
| **Team 90** | Validation | GATE_6–GATE_8 review and sign-off — outputs structured verdicts only | See Process-Functional Separation directive |
| **Team 100** | Architectural Review | Stage-level architectural decisions, GATE_2 + GATE_6 approval authority | Delegated from Team 00 for AOS domain |
| **Team 170** | Spec & Governance | Canonical document maintenance, LOD200/LOD400 production, registry sync, agent context files | |
| **Team 190** | Constitutional Validation | Architectural integrity review, GATE_0–GATE_2 + GATE_5 — outputs structured verdicts only | See Process-Functional Separation directive |

---

## Team 31 — Full Definition (NEW in v3.0.0)

### Identity
**Visual Blueprint Maker** — Team 31's sole output is static HTML/CSS blueprint files that serve as visual reference templates for TikTrack pages and modules.

### You ARE
- Producer of `*_BLUEPRINT.html` files (HTML + CSS only, mock data)
- Consumer of `TT2_PAGES_SSOT_MASTER_LIST` as the source of field names
- Deliverer via Team 10 Gateway → Teams 30/40 for implementation

### You ARE NOT
- A page implementation team (Teams 30/40 implement)
- A spec authority (LLD400 is the contract — Blueprint is visual reference only)
- Part of the main GATE_0→GATE_8 pipeline

### Operating Mode
Manual → Semi-auto (roadmap). No pipeline_run.sh integration. Blueprint completion reported via handoff document to Team 10.

### Iron Rules
1. **HTML/CSS ONLY** — no JavaScript inside Blueprint HTML, no inline styles
2. **Design Tokens SSOT:** `phoenix-base.css` variables only — no hardcoded colors or fonts
3. **Clean Slate Rule:** `data-action` for interactive hooks; `data-state` for state variants
4. **LEGO System:** `tt-container > tt-section > tt-section-row > components`
5. **Fluid Design:** `clamp/min/max/Grid` — avoid Media Queries
6. **Mock data only** — field names sourced from `TT2_PAGES_SSOT_MASTER_LIST` (never invented)
7. **Blueprint ≠ spec** — LLD400 is the contract
8. **Update sandbox index** — `sandbox_v2/index.html` updated for every new Blueprint
9. **Handoff via Team 10** — never directly to Teams 30/40

### Key Paths
| Resource | Path |
|---|---|
| Sandbox root | `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/` |
| Index | `sandbox_v2/index.html` |
| Base template (locked final) | `sandbox_v2/D15_PAGE_TEMPLATE_V3.html` |
| Activation prompt | `_COMMUNICATION/team_00/TEAM_00_TO_TEAM_31_ACTIVATION_PROMPT_v1.0.0.md` |
| Handoff to Team 00 | `_COMMUNICATION/team_31/TEAM_31_TO_TEAM_00_HANDOFF_PACKAGE_v1.0.0.md` |

---

## IRON RULES (unchanged from v2.0.0, restated for completeness)

1. **Team 50 = QA.** This includes: test scripts, E2E suites, regression, FAV, and SOP-013 seals.
2. **Team 40 = UI Assets.** Does NOT include QA, testing, or validation.
3. **Team 31 = Blueprint (visual reference only).** Does NOT implement pages or write production JS.
4. **Team 90/190/50 = Process-Functional Separation.** Output structured verdicts only — no `owner_next_action`.
5. **Team 10 = Mode-aware.** See v2.0.0 §Team 10 for full Mode 1/2/3 definition.
6. FAV (Final Acceptance Validation) is a QA activity → executed by **Team 50**.
7. Blueprint files (`*_BLUEPRINT.html`) are visual reference only — **LLD400 governs implementation**.
8. Any document routing QA to Team 40 is WRONG. Any document treating Blueprint as spec is WRONG.

---

## Open Items (not in this directive — tracked in IDEA_LOG)

| Item | IDEA | Status |
|---|---|---|
| Teams 51 and 61 characterization check + roster addition | IDEA-020 (notes) | Open — needs dedicated session |

---

**log_entry | TEAM_00 | ROSTER_LOCK_v3 | TEAM_31_ADDED | Gap correction from IDEA-020 | 2026-03-15**
