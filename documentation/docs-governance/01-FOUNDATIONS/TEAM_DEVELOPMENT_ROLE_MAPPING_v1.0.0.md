# TEAM_DEVELOPMENT_ROLE_MAPPING v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0  
**owner:** Team 170 (canonical); consumed by Team 10 for scope and orchestration  
**date:** 2026-03-10  
**status:** LOCKED  
**purpose:** Single canonical source for development squad roles and Team 10 orchestration rule. `.cursorrules` is a tooling mirror only; this document is governance SSOT.

**IRON RULE:** Team 50 = QA + FAV for TIKTRACK domain; Team 51 = QA for AGENTS_OS domain (child QA team inheriting Team 50 standards/procedures with domain split). NEVER assign QA/testing/FAV to Team 40. Team 40 = UI Assets & Design ONLY. Source: `ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v1.0.0.md` (2026-03-02, Nimrod-approved) + `ARCHITECT_DIRECTIVE_AGENTS_OS_FAST_TRACK_DEFAULT_v1.0.0.md` (2026-03-10).
**DOMAIN SPLIT LOCK (2026-03-12):** Teams 10/20/30/40/50 operate in TIKTRACK or SHARED programs only; Team 60 operates in all domains; Teams 90+190 are cross-domain validators; Team 61 is AGENTS_OS-only development/automation; Team 191 is a cross-domain Git-governance operations child team of Team 190.

---

## 1) Development squad mapping (canonical)

| Squad ID | Role | Responsibility |
|----------|------|----------------|
| **Team 20** | Backend Implementation | Server-side: API, logic, DB, services, runtime — TIKTRACK and SHARED programs only. |
| **Team 30** | Frontend Execution | Client-side: components, pages, API integration — TIKTRACK and SHARED programs only. |
| **Team 40** | UI Assets & Design | Design, design tokens, UI assets, visual consistency — TIKTRACK and SHARED programs only. |
| **Team 50** | QA & FAV | Test scripts, E2E suites, regression, final acceptance validation (FAV), SOP-013 seals — TIKTRACK and SHARED programs only. **Output: test results + verdict only — no routing.** Per ARCHITECT_DIRECTIVE_PROCESS_FUNCTIONAL_SEPARATION_v1.0.0. |
| **Team 51** | Agents_OS QA (child of Team 50) | Inherits Team 50 QA/FAV standards and procedures; executes QA for AGENTS_OS domain only (FAST_2.5 / GATE_5-equivalent). **Output: test results + verdict only — no routing.** Per ARCHITECT_DIRECTIVE_PROCESS_FUNCTIONAL_SEPARATION_v1.0.0. |
| **Team 60** | DevOps & Platform | Infrastructure, runtimes, CI/CD, platform — all domains (TIKTRACK + AGENTS_OS + SHARED). |
| **Team 61** | Cloud Agent / DevOps Automation | CI/CD automation, quality scans, unit-test generation, Agents_OS V2 automation, cloud execution reports — AGENTS_OS domain only. |
| **Team 70** | Documentation (TIKTRACK + Repository Maintenance) | TIKTRACK documentation lane, release docs, archive/folder hygiene, communication-maintenance operations across repository. |
| **Team 90** | Validation & Gate Management | GATE_5-GATE_8 validation process, validation packages, quality gate coordination — cross-domain (TIKTRACK + AGENTS_OS + SHARED). **Output: review notes + verdict only — no routing.** Per ARCHITECT_DIRECTIVE_PROCESS_FUNCTIONAL_SEPARATION_v1.0.0. |
| **Team 100** | Architectural Review | Stage-level architectural authority, GATE_6 architectural review, program authority. |
| **Team 170** | Spec & Governance (AGENTS_OS + Governance Canonical) | LOD contracts, AGENTS_OS/governance canonical maintenance, registry synchronization, governance procedure locks. |
| **Team 190** | Constitutional Validation | GATE_0-GATE_2 constitutional integrity and validation authority — cross-domain (TIKTRACK + AGENTS_OS + SHARED). **Output: structured verdict only — no routing.** Per ARCHITECT_DIRECTIVE_PROCESS_FUNCTIONAL_SEPARATION_v1.0.0. |
| **Team 191** | Git Governance Operations (child of Team 190) | Commit/push guard operations, date-lint/snapshot/sync remediation, clean-tree enforcement, Git drift triage — cross-domain (TIKTRACK + AGENTS_OS + SHARED). |
| **Team 101** | IDE Architecture Authority | Local IDE (Cursor co-pilot). Advisory architecture review — surfacing code-level observations to Team 00. Team 00 exclusively. Does NOT produce mandates or issue directives. Registered 2026-03-17. |

## 1.1) Team 61 registration record (canonical)

| Field | Value |
|---|---|
| Team ID | 61 |
| Name | Cloud Agent / DevOps Automation |
| Role | AGENTS_OS domain development automation: CI/CD pipelines, quality scans, unit-test infrastructure, Agents_OS V2 orchestration support, scan reports and known-bug intake data. |
| Scope | AGENTS_OS domain only: `agents_os_v2/`, `.github/workflows/`, `tests/unit/`, quality tooling configs (`ui/.eslintrc.cjs`, `api/mypy.ini`), quality scan reports, cloud-agent execution artifacts. |
| Authority | Create and maintain CI/CD pipelines; run code-quality scans (`bandit`, `pip-audit`, `detect-secrets`, `mypy`, `ESLint`, `npm audit`); generate unit tests; build and maintain Agents_OS V2 orchestration code; produce quality scan and known-bug reports. |
| Non-authority | Must not change production application code (`api/`, `ui/`) without Team 10 mandate; must not write canonical `documentation/` directly; must not approve gates; does not replace Team 50 QA/FAV or Team 90 validation authority. |
| Reports to | Team 10 for task orchestration; Team 00 for strategic direction. |

## 1.2) Team 51 registration record (canonical)

| Field | Value |
|---|---|
| Team ID | 51 |
| Name | Agents_OS QA Agent |
| Role | QA child team of Team 50 for AGENTS_OS domain. |
| Scope | `agents_os_v2/`, pipeline QA evidence, FAST_2.5 / GATE_5-equivalent checks in AGENTS_OS flow. |
| Authority | Run Team-50-equivalent QA procedures: pytest, mypy, quality scans; produce PASS/FAIL QA reports; block progression until QA PASS. |
| Non-authority | Must not execute TIKTRACK QA lane (Team 50 ownership); must not replace Team 90 gate authority; must not bypass Team 10 orchestration. |
| Reports to | Team 10 for orchestration; Team 100 for AGENTS_OS architecture lane. |

## 1.3) Team 191 registration record (canonical)

| Field | Value |
|---|---|
| Team ID | 191 |
| Name | Git Governance Operations |
| Role | Child team of Team 190 for Git workflow governance and pre-push guard operational reliability. |
| Scope | Git operations and repository hygiene only: commit/push blockers, pre-push guard triage (`DATE-LINT`, `SYNC CHECK`, `SNAPSHOT CHECK`), clean-tree enforcement, historical-record/date-header normalization, guard evidence packaging. |
| Authority | Execute technical remediation for non-semantic Git blockers; run check/write sync tools and snapshot refresh tools; prepare blocker reports and recommended routing. |
| Non-authority | Must not issue constitutional gate verdicts; must not alter business logic under cover of Git fixes; must not override policy semantics without Team 190/Team 00 ruling. |
| Reports to | Team 190 (primary), Team 10 (operational coordination). |

## 1.4) Team 101 registration record (canonical)

| Field | Value |
|---|---|
| Team ID | 101 |
| Name | IDE Architecture Authority |
| Role | Advisory architecture review. Surfaces code-level observations, pattern anomalies, and architectural questions to Team 00. Does NOT produce mandates, does NOT issue directives to other teams. |
| Engine | Local IDE (Cursor co-pilot — same environment as Team 00) |
| Authority | Advisory only. All output is treated as input to Team 00 for evaluation. Team 00 decides whether to adopt, modify, or reject. |
| Reporting line | Team 00 exclusively. Team 101 does not communicate with any other team directly. |
| Status | Active (registered 2026-03-17) |
| Reference | ARCHITECT_DIRECTIVE_GATE_ARCHITECTURE_CANONICAL_ADDENDUM_v1.0.0.md §A |
| Framing | Team 101 input is processed as "architectural observations submitted to Team 00" — not as requests, mandates, or directives. Correct framing: "Team 101 observation → Team 00 evaluates → Team 00 decides." |

---

## 2) Rule: scope by domain

A Work Package must assign implementation **by domain** — Backend→20, Frontend→30, UI/Design→40, Infrastructure→60, Automation/Cloud CI→61. **Do not assume one squad (e.g. 20) covers the whole product** unless the package scope is explicitly limited (e.g. backend-only).

- **Backend/runtime-only package:** Scope = 20 (+ 60 if runner/infra needed); 30 and 40 out of scope.
- **Frontend-only package:** Scope = 30 (+ 40 if design/assets needed).
- **Full-stack package (TIKTRACK/SHARED):** Scope = 20 + 30 + 40 + 60 as needed; each in-scope squad receives explicit mandate and prompt.
- **Automation / Cloud tooling package:** Scope = 61 for CI, quality scans, unit-test infra, and Agents_OS V2 automation; include 60 only when manual platform/runtime changes are required.
- **QA by domain:** TIKTRACK QA/FAV = Team 50; AGENTS_OS QA (Team 50 child model) = Team 51.
- **AGENTS_OS-only development package:** Execution scope = Team 61 (with Team 60 as needed for platform/runtime), QA scope = Team 51, validation scope = Teams 90/190.
- **Git-governance operations package:** Execution scope = Team 191; constitutional/policy escalation scope = Team 190.

---

## 3) Team 10 — Mode-Aware Definition (per ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v2.0.0)

**Canonical role (2026-03-17):** Work Plan Generator. WSM state is managed exclusively by the pipeline system; Team 10 does NOT modify WSM directly. Pipeline state transitions that require WSM updates are handled automatically by the orchestrator. Reference: ARCHITECT_DIRECTIVE_GATE_ARCHITECTURE_CANONICAL_ADDENDUM_v1.0.0.md §B.3.

| Mode | Role | Scope |
|------|------|-------|
| **Mode 1** (Legacy, no AOS pipeline) | Process Coordinator + Work Plan Generator | Receives verdicts from 190/50/90; routes per `TEAM_10_MODE1_ROUTING_TABLE_v1.0.0.md` (deterministic); activates next team. WSM updates are managed by the pipeline system. |
| **Mode 2** (AOS + Dashboard) | Work Plan Generator (GATE_3) | GATE_3 work plan only; GATE_4 build oversight, Team 61 activation. Does NOT route between gates (pipeline does). Does NOT issue owner_next_action. Does NOT update WSM directly. |
| **Mode 3** (Full-auto AOS) | Technical Consultation Authority | On-demand escalation for complex/risky builds. Pipeline fully replaces process coordination. |

---

## 4) Team 10 orchestration (Mode 1)

Team 10 (Gateway) is owner of GATE_3 (Implementation). For every open Work Package after GATE_3 sub-stage G3.5 (work-plan validation with Team 90) PASS:

1. Determine which squads (20/30/40/60) are in scope from WORK_PACKAGE_DEFINITION.
2. Issue **one** mandate/prompt per in-scope squad (no single-squad default for full product).
3. Execution plan (e.g. EXECUTION_AND_TEAM_PROMPTS) must list: (1) which squads are in scope, (2) mandate/prompt per squad, (3) order and handoffs so the deliverable is a complete, working product.

**Domain constraint:** Team 10 operational lane is TIKTRACK and SHARED programs. AGENTS_OS-only implementation execution is Team 61 lane (with Team 100 architectural authority), while Team 10 remains synchronized when cross-domain dependencies exist.

---

## 5) Mirror

`.cursorrules` may mirror this mapping for tooling; governance SSOT for role and scope is this document.

## 6) Roster Maintenance Rule

This document must be updated whenever a new squad is added. Missing squad definition causes operational confusion and invalid routing.

---

**log_entry | TEAM_170 | TEAM_DEVELOPMENT_ROLE_MAPPING | v1.0.0_LOCKED | 2026-02-23**
**log_entry | TEAM_170 | TEAM_DEVELOPMENT_ROLE_MAPPING | TEAM_ROSTER_LOCK_APPLIED_v1.0.0 | 2026-03-03**
**log_entry | TEAM_190 | TEAM_DEVELOPMENT_ROLE_MAPPING | TEAM_51_CHILD_QA_MODEL_REGISTERED_WITH_DOMAIN_SPLIT | 2026-03-11**
**log_entry | TEAM_190 | TEAM_DEVELOPMENT_ROLE_MAPPING | DOMAIN_SPLIT_REINFORCED_10_20_30_40_50__60__90_190__61 | 2026-03-11**
**log_entry | TEAM_190 | TEAM_DEVELOPMENT_ROLE_MAPPING | TEAM_191_CHILD_GIT_GOVERNANCE_OPERATIONS_REGISTERED | 2026-03-12**
**log_entry | TEAM_170 | TEAM_DEVELOPMENT_ROLE_MAPPING | ROSTER_V2_PROCESS_FUNCTIONAL_SEPARATION_APPLIED | 2026-03-15**
**log_entry | TEAM_170 | TEAM_DEVELOPMENT_ROLE_MAPPING | TEAM_101_IDE_ARCHITECTURE_AUTHORITY_REGISTERED | 2026-03-17**
