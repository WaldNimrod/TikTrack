# ARCHITECT DIRECTIVE — Team Roster Lock
## Canonical Team Role Definitions — Mandatory Reference

```
directive_id:  ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v1.0.0
author:        Team 00 — Chief Architect
date:          2026-03-02
status:        LOCKED — Iron Rule
authority:     Team 00 constitutional authority + Nimrod confirmation
problem_solved: Recurring Team 40/Team 50 confusion causing incorrect routing in documents
routes_to:
  - Team 170: update TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md to add Team 50
  - ALL teams: this document is the authoritative team roster reference
```

---

## ROOT CAUSE

`TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md` was missing Team 50 entirely.
This caused agents to fill the vacuum by reverting to legacy role assignments
(pre-Phoenix: Team 40 = QA, Team 50 = FAV), producing incorrect routing in generated documents.

The error was systemic and self-replicating — once one document had the wrong assignment,
subsequent documents copy-pasted it.

---

## CANONICAL TEAM ROSTER — LOCKED

| Squad ID | Role | Responsibility | Notes |
|---|---|---|---|
| **Team 10** | Gateway | Execution lead, team activation, gate submissions, WSM updates | Owns GATE_3 and GATE_4 |
| **Team 20** | Backend Implementation | API, logic, DB, services, runtime | Server-side only |
| **Team 30** | Frontend Execution | Components, pages, API integration, client-side logic | Client-side only |
| **Team 40** | UI Assets & Design | Design tokens, CSS, visual consistency, UI assets | Advisory in most WPs unless new design assets needed |
| **Team 50** | QA & FAV | Test scripts, E2E suites, regression, FAV, SOP-013 seals | ALL quality assurance and acceptance validation |
| **Team 60** | DevOps & Platform | Infrastructure, runtimes, CI/CD, platform readiness, runtime evidence | |
| **Team 70** | Documentation | Technical writing, knowledge promotion | |
| **Team 90** | Validation | GATE_5–GATE_8 process, validation packages | Owns GATE_5–GATE_8 |
| **Team 100** | Architectural Review | Stage-level architectural decisions, GATE_6 | |
| **Team 170** | Spec & Governance | Canonical document maintenance, LOD200/LOD400 production, registry sync | |
| **Team 190** | Constitutional Validation | Architectural integrity review, GATE_0–GATE_2 | |

---

## IRON RULES

1. **Team 50 = QA.** This includes: test scripts, E2E suites, regression, FAV, and SOP-013 seals.
2. **Team 40 = UI Assets.** This does NOT include QA, testing, or validation.
3. FAV (Final Acceptance Validation) is a QA activity → executed by **Team 50**.
4. GATE_4 QA evidence is produced by **Team 50**, submitted via Team 10.
5. Any document that routes "QA" to Team 40 is WRONG and must be corrected.
6. When in doubt: this directive overrides all other team references.

---

## REQUIRED ACTION — TEAM 170

Update `TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0.md`:
- Add Team 50: `QA & FAV | All quality assurance, test scripts, E2E, FAV validation, SOP-013 seals`
- Add Team 70: `Documentation | Technical writing, knowledge promotion`
- Add Team 90–Team 190 with their roles (currently absent from the document)
- Add a note: "This document must be updated whenever a new squad is added. Missing squad = operational confusion."

The current document only lists Teams 20/30/40/60. It is severely incomplete.

---

## DOCUMENTS CORRECTED IN THIS SESSION (2026-03-02)

| Document | Error | Corrected |
|---|---|---|
| `TEAM_00_TO_TEAM_10_...UPDATED_BROADCAST_v1.0.0.md` | Team 40 = QA (×3 occurrences) | Team 50 = QA+FAV |
| `TEAM_00_TO_TEAM_10_S002_P003_WP002_UPDATED_BROADCAST_v1.0.0.md` | GATE_4 → Team 40 QA | GATE_4 → Team 50 QA |

**Documents NOT corrected (correct as written):**
- `ARCHITECT_DIRECTIVE_G7_REMEDIATION_S002_P003_WP002_v1.0.0.md` line 734: "Team 50 (QA)" — ✅ already correct
- `S003_P03_TAGS_WATCHLISTS_LOD200...ARCHITECTURAL_CONCEPT.md`: "Team 50 for WP003 FAV" — ✅ already correct

---

*log_entry | TEAM_00 | TEAM_ROSTER_LOCK | LOCKED | 2026-03-02*
