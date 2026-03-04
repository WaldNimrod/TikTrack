# TEAM_DEVELOPMENT_ROLE_MAPPING v1.0.0

**project_domain:** SHARED (TIKTRACK + AGENTS_OS)  
**id:** TEAM_DEVELOPMENT_ROLE_MAPPING_v1.0.0  
**owner:** Team 170 (canonical); consumed by Team 10 for scope and orchestration  
**date:** 2026-02-23  
**status:** LOCKED  
**purpose:** Single canonical source for development squad roles and Team 10 orchestration rule. `.cursorrules` is a tooling mirror only; this document is governance SSOT.

**IRON RULE:** Team 50 = QA + FAV. NEVER assign QA/testing/FAV to Team 40. Team 40 = UI Assets & Design ONLY. Source: `ARCHITECT_DIRECTIVE_TEAM_ROSTER_LOCK_v1.0.0.md` (2026-03-02, Nimrod-approved).

---

## 1) Development squad mapping (canonical)

| Squad ID | Role | Responsibility |
|----------|------|----------------|
| **Team 20** | Backend Implementation | Server-side: API, logic, DB, services, runtime. |
| **Team 30** | Frontend Execution | Client-side: components, pages, API integration. |
| **Team 40** | UI Assets & Design | Design, design tokens, UI assets, visual consistency. |
| **Team 50** | QA & FAV | Test scripts, E2E suites, regression, final acceptance validation (FAV), SOP-013 seals. |
| **Team 60** | DevOps & Platform | Infrastructure, runtimes, CI/CD, platform. |
| **Team 61** | Cloud Agent / DevOps Automation | CI/CD automation, quality scans, unit-test generation, Agents_OS V2 automation, cloud execution reports. |
| **Team 70** | Documentation | Technical writing, release notes, knowledge promotion. |
| **Team 90** | Validation & Gate Management | GATE_5-GATE_8 validation process, validation packages, quality gate coordination. |
| **Team 100** | Architectural Review | Stage-level architectural authority, GATE_6 architectural review, program authority. |
| **Team 170** | Spec & Governance | LOD contracts, canonical document maintenance, registry synchronization. |
| **Team 190** | Constitutional Validation | GATE_0-GATE_2 constitutional integrity and validation authority. |

## 1.1) Team 61 registration record (canonical)

| Field | Value |
|---|---|
| Team ID | 61 |
| Name | Cloud Agent / DevOps Automation |
| Role | Automation of development workflows: CI/CD pipelines, quality scans, unit-test infrastructure, Agents_OS V2 orchestration support, scan reports and known-bug intake data. |
| Scope | `agents_os_v2/`, `.github/workflows/`, `tests/unit/`, quality tooling configs (`ui/.eslintrc.cjs`, `api/mypy.ini`), quality scan reports, cloud-agent execution artifacts. |
| Authority | Create and maintain CI/CD pipelines; run code-quality scans (`bandit`, `pip-audit`, `detect-secrets`, `mypy`, `ESLint`, `npm audit`); generate unit tests; build and maintain Agents_OS V2 orchestration code; produce quality scan and known-bug reports. |
| Non-authority | Must not change production application code (`api/`, `ui/`) without Team 10 mandate; must not write canonical `documentation/` directly; must not approve gates; does not replace Team 50 QA/FAV or Team 90 validation authority. |
| Reports to | Team 10 for task orchestration; Team 00 for strategic direction. |

---

## 2) Rule: scope by domain

A Work Package must assign implementation **by domain** — Backend→20, Frontend→30, UI/Design→40, Infrastructure→60, Automation/Cloud CI→61. **Do not assume one squad (e.g. 20) covers the whole product** unless the package scope is explicitly limited (e.g. backend-only).

- **Backend/runtime-only package:** Scope = 20 (+ 60 if runner/infra needed); 30 and 40 out of scope.
- **Frontend-only package:** Scope = 30 (+ 40 if design/assets needed).
- **Full-stack package:** Scope = 20 + 30 + 40 + 60 as needed; each in-scope squad receives explicit mandate and prompt.
- **Automation / Cloud tooling package:** Scope = 61 for CI, quality scans, unit-test infra, and Agents_OS V2 automation; include 60 only when manual platform/runtime changes are required.

---

## 3) Team 10 orchestration

Team 10 (Gateway) is owner of GATE_3 (Implementation). For every open Work Package after GATE_3 sub-stage G3.5 (work-plan validation with Team 90) PASS:

1. Determine which squads (20/30/40/60) are in scope from WORK_PACKAGE_DEFINITION.
2. Issue **one** mandate/prompt per in-scope squad (no single-squad default for full product).
3. Execution plan (e.g. EXECUTION_AND_TEAM_PROMPTS) must list: (1) which squads are in scope, (2) mandate/prompt per squad, (3) order and handoffs so the deliverable is a complete, working product.

---

## 4) Mirror

`.cursorrules` may mirror this mapping for tooling; governance SSOT for role and scope is this document.

## 5) Roster Maintenance Rule

This document must be updated whenever a new squad is added. Missing squad definition causes operational confusion and invalid routing.

---

**log_entry | TEAM_170 | TEAM_DEVELOPMENT_ROLE_MAPPING | v1.0.0_LOCKED | 2026-02-23**
**log_entry | TEAM_170 | TEAM_DEVELOPMENT_ROLE_MAPPING | TEAM_ROSTER_LOCK_APPLIED_v1.0.0 | 2026-03-03**
