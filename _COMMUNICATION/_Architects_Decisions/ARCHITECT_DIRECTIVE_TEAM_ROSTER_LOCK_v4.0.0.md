---
directive_id:  ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v4.0.0
author:        Team 00 — Chief Architect
date:          2026-03-15
status:        LOCKED — Iron Rule
authority:     Team 00 constitutional authority + Nimrod approval
supersedes:    ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v3.0.0 (Teams 51, 61, 191 rows added)
reason:        Teams 51, 61, and 191 fully characterized in pipeline-teams.js and active in production
               but absent from all prior roster versions (v1/v2/v3 oversight). IDEA-020 triggered correction.
               Nimrod approved 2026-03-15.
---

# ARCHITECT DIRECTIVE — Team Roster Lock v4.0.0

## What Changed from v3.0.0

**Three rows added:** Teams 51, 61, and 191.
All other definitions from v3.0.0 (including Team 31 added in v3) remain in force unchanged.

---

## CANONICAL TEAM ROSTER — LOCKED (v4.0.0)

| Squad ID | Role | Responsibility | Notes |
|---|---|---|---|
| **Team 10** | Implementation Authority | Technical work planning (GATE_3), build oversight (GATE_4), Team 61 activation, technical architecture decisions for complex builds | Mode-aware: see v2.0.0 §Team 10 detail |
| **Team 20** | Backend Implementation | API, logic, DB, services, runtime | Server-side only |
| **Team 30** | Frontend Execution | Components, pages, API integration, client-side logic | Client-side only |
| **Team 31** | Blueprint Maker | Visual Blueprint production (HTML/CSS static only) for TikTrack pages/modules; delivers to Teams 30/40 via Team 10 Gateway | Outside main gate pipeline; sandbox at `_COMMUNICATION/team_31/team_31_staging/sandbox_v2/`; see v3.0.0 §Team 31 detail |
| **Team 40** | UI Assets & Design | Design tokens, CSS, visual consistency, UI assets | Advisory in most WPs unless new design assets needed |
| **Team 50** | QA & FAV (TikTrack) | Test scripts, E2E suites, regression, FAV, SOP-013 seals — TikTrack domain; outputs structured verdicts only | ALL quality assurance for TikTrack |
| **Team 51** | QA & FAV (Agents_OS) | Write and execute QA test plans for AOS UI and pipeline tooling; FAV for AOS deliverables; outputs structured verdicts only | AOS-domain mirror of Team 50; see §Team 51 detail |
| **Team 60** | DevOps & Platform | Infrastructure, runtimes, CI/CD, platform readiness, runtime evidence | |
| **Team 61** | AOS Local Cursor Implementation | Implement Agents_OS UI pages and pipeline tooling (PIPELINE_DASHBOARD, PIPELINE_ROADMAP, PIPELINE_TEAMS); CSS/JS modularization per LOD400 | AOS domain; activated by Team 10; see §Team 61 detail |
| **Team 70** | Documentation | Technical writing, knowledge promotion | |
| **Team 90** | Validation (TikTrack) | GATE_6–GATE_8 review and sign-off; outputs structured verdicts only | See Process-Functional Separation directive |
| **Team 100** | Architectural Review | Stage-level architectural decisions, GATE_2 + GATE_6 approval authority | Delegated from Team 00 for AOS domain |
| **Team 170** | Spec & Governance | Canonical document maintenance, LOD200/LOD400 production, registry sync, agent context files | |
| **Team 190** | Constitutional Validation | Architectural integrity review, GATE_0–GATE_2 + GATE_5; outputs structured verdicts only | See Process-Functional Separation directive |
| **Team 191** | Git-Governance Lane | Pre-push guard triage, header normalization, registry sync, snapshot refresh, clean-tree enforcement | Child of Team 190; operational only — no constitutional gate verdicts; see §Team 191 detail |

---

## Team 51 — AOS QA & Functional Acceptance (NEW in v4.0.0)

- **Role:** QA & FAV for Agents_OS domain — mirrors Team 50 but scoped to AOS work
- **Outputs structured verdicts only** (Process-Functional Separation directive)
- **Responsibilities:** Write/execute QA test plans for AOS UI and pipeline tooling changes; produce QA reports with pass/fail evidence; submit to Team 190 for re-validation after QA pass; functional acceptance verification for AOS deliverables
- **Iron Rules:**
  1. Team 51 = QA for AOS domain (Iron Rule)
  2. Every QA run must be FRESH — never repeat prior findings without re-execution
  3. GATE_4 QA evidence required: commands + outputs + exit codes
  4. Outputs: `{verdict, findings, severity_map}` — no `owner_next_action` (Process-Functional Separation)
- **Writes to:** `_COMMUNICATION/team_51/`
- **Governed by:** TEAM_ROSTER_LOCK, SOP-013, Process-Functional Separation directive

---

## Team 61 — AOS Local Cursor Implementation (NEW in v4.0.0)

- **Role:** Local cursor-driven implementation of Agents_OS UI and pipeline tooling
- **Activated by:** Team 10 (Mode 1) or pipeline engine (Mode 2+)
- **Responsibilities:** Implement AOS UI pages (PIPELINE_DASHBOARD, PIPELINE_ROADMAP, PIPELINE_TEAMS); CSS/JS extraction and modularization per LOD400 work packages; run preflight URL tests and browser evidence checks before submitting; submit completed work to Team 51 for QA
- **Iron Rules:**
  1. Classic `<script src>` only — no ES modules (Iron Rule)
  2. All HTML pages must use `agents-page-layout` + `agents-header` contract
  3. No inline `<style>` or `<script>` blocks in final deliverables
  4. Preflight URL test mandatory before QA submission
- **Writes to:** `_COMMUNICATION/team_61/`
- **Governed by:** TEAM_ROSTER_LOCK, AOS UI Canon (locked 2026-03-15)

---

## Team 191 — Git-Governance Lane (NEW in v4.0.0)

- **Role:** Operational git-governance; child of Team 190
- **Boundary:** Operational only — no constitutional gate verdicts (Team 190), no architectural rulings (Team 00/100), no business-logic changes under a git fix mandate, no policy semantic overrides without Team 00 ruling
- **Responsibilities:** Pre-push guard triage and remediation (DATE-LINT, SYNC CHECK, SNAPSHOT CHECK); date/header normalization for governance/communication markdown; registry/WSM mirror standardization via canonical sync scripts; snapshot refresh and re-check sequencing; clean-tree enforcement and drift reporting
- **Iron Rules:**
  1. No constitutional gate verdicts — that is Team 190
  2. No architectural rulings — that is Team 00/100
  3. No business-logic changes under a git fix mandate
  4. No policy semantic overrides without explicit ruling from Team 00
- **Writes to:** `_COMMUNICATION/team_191/`
- **Governed by:** TEAM_ROSTER_LOCK, TEAM_191_INTERNAL_WORK_PROCEDURE_v1.0.0

---

## IRON RULES (cumulative from all versions)

1. **Team 50 = QA (TikTrack domain).** Test scripts, E2E, regression, FAV, SOP-013 seals.
2. **Team 51 = QA (AOS domain).** Same scope as Team 50 but scoped to Agents_OS.
3. **Team 40 = UI Assets.** Does NOT include QA, testing, or validation.
4. **Team 31 = Blueprint (visual reference only).** Does NOT implement pages or write production JS.
5. **Team 61 = AOS Implementation.** Activated by Team 10; delivers to Team 51 for QA.
6. **Team 191 = Operational git-governance only.** No constitutional verdicts, no architectural rulings.
7. **Teams 90/190/50/51 = Process-Functional Separation.** Output structured verdicts — no `owner_next_action`.
8. **Team 10 = Mode-aware.** See v2.0.0 §Team 10 for Mode 1/2/3 definition.
9. FAV → Team 50 (TikTrack) or Team 51 (AOS). Never Team 40.
10. Blueprint files are visual reference only — **LLD400 governs implementation**.

---

**log_entry | TEAM_00 | ROSTER_LOCK_v4 | TEAMS_51_61_191_ADDED | IDEA-020 gap correction + Nimrod approval | 2026-03-15**
