# TT2_WORK_OPERATING_MODEL

**id:** `TT2_WORK_OPERATING_MODEL`
**owner:** Team 10
**status:** DRAFT
**last_updated:** 2026-02-12

---

## 1) Organization & Team Structure

- **Architect (SSOT owner):** issues ADR/SOP, locks decisions, approves architecture and governance standards.
- **G-Lead (Nimrod):** approves major/minor system version bumps, final visual approvals, executive overrides.
- **Team 10 (The Gateway):** orchestration, process enforcement, documentation governance, gate readiness, mapping mode control.
- **Team 20 (Backend):** API contracts, DB schema, auth contract, error schema, server-side sanitization.
- **Team 30 (Frontend Containers):** routes, state, API integration, auth guards, logic + wiring.
- **Team 40 (UI/Presentational):** CSS, visual system, presentational React components, design system assets.
- **Team 50 (QA):** Gate A/B/C suites, runtime/E2E verification, evidence logs.
- **Team 60 (Infra/DevOps):** ports, CORS, env setup, seeders, Makefile targets.
- **Team 90 (The Spy):** independent verification, governance scans, “zero‑tolerance” audits.

**SLA 30/40 boundary:** Team 40 owns CSS/UI with zero logic; Team 30 owns logic/API and may not change Team 40 visuals without approval.

## 2) Team Responsibilities (30/40/50/60/90)

### Team 30 (Containers / Logic)
- **Input:** Presentational components from Team 40, SSR/HTML scaffolds, API specs from Team 20.
- **Output:** Containers, routes, auth guards, API integration, transformations, wiring to UI.
- **Constraints:** No CSS/UI changes to Team 40 components; no visual overrides without Team 10 approval.

### Team 40 (UI / Presentational)
- **Input:** Blueprints and visual directives from Architect/G‑Lead.
- **Output:** Pixel‑perfect components and CSS system, design assets.
- **Constraints:** No API calls, no logic, no state; deliver only presentation.

### Team 50 (QA & Fidelity)
- **Input:** Work plans, SSOT, gate definitions.
- **Output:** Gate A/B/C results, artifacts, regression evidence, pass/fail status.
- **Constraints:** Tests must reflect SSOT; failures block gate closure.

### Team 60 (Infra / DevOps)
- **Input:** Port/CORS requirements, seeding requirements, environment policy.
- **Output:** Stable local runtime (8080/8082), CORS alignment, seeders/make targets.
- **Constraints:** Must match SSOT and Quality Gate protocols.

### Team 90 (The Spy)
- **Input:** SSOT and mandates from Architect/Team 10.
- **Output:** Independent verification reports, zero‑tolerance compliance scans.
- **Constraints:** No dependency on team self‑reports; evidence‑based validation only.

## 3) Environments & Working Modes

### Local Runtime
- **Frontend:** http://localhost:8080
- **Backend/API:** http://localhost:8082
- **Health:** http://localhost:8082/health

### Working Modes
- **MAPPING_REQUIRED / Pre‑coding Mapping:** no code before required mapping artifacts are approved.
- **Stage 0 Bridge:** enforced when HTML/React hybrid work is required (must close before other stages).
- **Gate A/B/C:** QA gates enforced before promotion, no bypass without G‑Lead approval.

### Tooling
- Selenium/Chromedriver for E2E.
- Standard npm scripts for gate execution and evidence capture.

## 4) Communication Channels & Artifacts

- **Work communication:** `_COMMUNICATION/team_*` folders (requests, mapping, decisions, status).
- **Architect communication:** `_COMMUNICATION/90_Architects_comunication` (authoritative decisions).
- **SSOT documentation:** `documentation/` (only source of truth for locked policies).
- **Evidence & QA artifacts:** `documentation/05-REPORTS/artifacts/`.
- **Archive:** `_COMMUNICATION/99-ARCHIVE/YYYY-MM-DD/` with manifest.

## 5) Decision & Escalation Path

1. **Need discovered** → Team 10 consolidates questions + context.
2. **Architect decision (ADR/SOP)** → Team 10 updates SSOT and work plans.
3. **Execution** → Teams implement within SLA boundaries.
4. **Verification** → Team 90 audit + Team 50 gate tests.
5. **Approval** → G‑Lead for major/minor versions and visual sign‑off.

No code changes are approved without required mapping, SSOT alignment, and evidence.

## 6) References (SSOT)

- `documentation/05-PROCEDURES/TT2_SLA_TEAMS_30_40.md`
- `documentation/05-PROCEDURES/TT2_QUALITY_ASSURANCE_GATE_PROTOCOL.md`
- `documentation/05-PROCEDURES/TT2_KNOWLEDGE_PROMOTION_PROTOCOL.md`
- `documentation/10-POLICIES/TT2_VERSIONING_POLICY.md`
- `documentation/00-MANAGEMENT/TT2_PHASE_2_CLOSURE_WORK_PLAN.md`
- `documentation/90_ARCHITECTS_DOCUMENTATION/ARCHITECT_PHASE_2_FINAL_GAPS_VERDICT.md`
